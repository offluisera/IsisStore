-- ====================================================================
-- ISIS STORE — MIGRATION: GESTÃO AVANÇADA DE CLIENTES NO ADMIN
-- Versão: 20260930000000_admin_customer_management.sql
-- ====================================================================

-- 1. Coluna de cupom em orders para rastreamento explícito
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS coupon_code TEXT;

-- 2. Índices para busca ágil de clientes por nome, email e CPF
CREATE INDEX IF NOT EXISTS idx_profiles_email_trgm ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_cpf ON public.profiles(cpf);

-- 3. Função RPC para criação manual de cliente pelo Administrador
CREATE OR REPLACE FUNCTION public.admin_create_customer(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_phone TEXT DEFAULT NULL,
  p_cpf TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'customer'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_user_id UUID;
  v_caller_is_admin BOOLEAN;
  v_encrypted_pw TEXT;
  v_role user_role;
BEGIN
  -- 3.1 Verificar privilégio de administrador
  SELECT public.is_admin() INTO v_caller_is_admin;
  IF NOT v_caller_is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso negado: privilégio de administrador obrigatório.'
    );
  END IF;

  -- 3.2 Validar preenchimento essencial
  IF p_email IS NULL OR trim(p_email) = '' THEN
    RETURN jsonb_build_object('success', false, 'message', 'O e-mail é obrigatório.');
  END IF;

  IF p_password IS NULL OR length(trim(p_password)) < 6 THEN
    RETURN jsonb_build_object('success', false, 'message', 'A senha deve ter no mínimo 6 caracteres.');
  END IF;

  IF p_full_name IS NULL OR length(trim(p_full_name)) < 3 THEN
    RETURN jsonb_build_object('success', false, 'message', 'O nome completo deve ter no mínimo 3 caracteres.');
  END IF;

  -- 3.3 Verificar duplicidade de e-mail em auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = lower(trim(p_email))) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Este e-mail já está cadastrado no sistema.');
  END IF;

  -- 3.4 Gerar ID e hash de senha bcrypt
  v_user_id := gen_random_uuid();
  v_encrypted_pw := extensions.crypt(trim(p_password), extensions.gen_salt('bf'));
  v_role := CASE WHEN p_role = 'admin' THEN 'admin'::user_role ELSE 'customer'::user_role END;

  -- 3.5 Inserir em auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    lower(trim(p_email)),
    v_encrypted_pw,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', trim(p_full_name)),
    now(),
    now(),
    '',
    '',
    '',
    '',
    false
  );

  -- 3.6 Inserir em auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', lower(trim(p_email)),
      'full_name', trim(p_full_name),
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    v_user_id::text,
    now(),
    now(),
    now()
  );

  -- 3.7 Garantir / atualizar linha em public.profiles
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    cpf,
    role,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    trim(p_full_name),
    lower(trim(p_email)),
    nullif(trim(p_phone), ''),
    nullif(trim(p_cpf), ''),
    v_role,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    cpf = EXCLUDED.cpf,
    role = EXCLUDED.role,
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Cliente cadastrado com sucesso!',
    'user_id', v_user_id
  );
END;
$$;

-- 4. Função RPC para edição de cliente pelo Administrador
CREATE OR REPLACE FUNCTION public.admin_update_customer(
  p_user_id UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT DEFAULT NULL,
  p_cpf TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL,
  p_password TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_caller_is_admin BOOLEAN;
  v_caller_id UUID;
  v_target_profile RECORD;
  v_new_role user_role;
BEGIN
  -- 4.1 Checar privilégio
  SELECT public.is_admin() INTO v_caller_is_admin;
  IF NOT v_caller_is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso negado: privilégio de administrador obrigatório.'
    );
  END IF;

  v_caller_id := auth.uid();

  -- 4.2 Buscar perfil atual
  SELECT * INTO v_target_profile FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Cliente não encontrado.');
  END IF;

  -- 4.3 Proteção contra auto-rebaixamento
  IF v_caller_id = p_user_id AND p_role IS NOT NULL AND p_role <> 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Por segurança, você não pode revogar seu próprio acesso administrativo.'
    );
  END IF;

  -- 4.4 Validar se o novo email já pertence a outro usuário
  IF p_email IS NOT NULL AND lower(trim(p_email)) <> lower(v_target_profile.email) THEN
    IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = lower(trim(p_email)) AND id <> p_user_id) THEN
      RETURN jsonb_build_object(
        'success', false,
        'message', 'Este e-mail já está sendo utilizado por outro cliente.'
      );
    END IF;
  END IF;

  -- 4.5 Atualizar senha se fornecida
  IF p_password IS NOT NULL AND length(trim(p_password)) >= 6 THEN
    UPDATE auth.users
    SET
      encrypted_password = extensions.crypt(trim(p_password), extensions.gen_salt('bf')),
      updated_at = now()
    WHERE id = p_user_id;
  END IF;

  -- 4.6 Atualizar email no auth se alterado
  IF p_email IS NOT NULL AND lower(trim(p_email)) <> lower(v_target_profile.email) THEN
    UPDATE auth.users
    SET
      email = lower(trim(p_email)),
      raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'::jsonb), '{email}', to_jsonb(lower(trim(p_email)))),
      updated_at = now()
    WHERE id = p_user_id;

    UPDATE auth.identities
    SET
      identity_data = jsonb_set(identity_data, '{email}', to_jsonb(lower(trim(p_email)))),
      updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  -- Atualizar full_name em metadata de auth.users
  IF p_full_name IS NOT NULL THEN
    UPDATE auth.users
    SET
      raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'::jsonb), '{full_name}', to_jsonb(trim(p_full_name))),
      updated_at = now()
    WHERE id = p_user_id;
  END IF;

  -- 4.7 Definir novo role
  IF p_role IS NOT NULL THEN
    v_new_role := CASE WHEN p_role = 'admin' THEN 'admin'::user_role ELSE 'customer'::user_role END;
  ELSE
    v_new_role := v_target_profile.role;
  END IF;

  -- 4.8 Atualizar public.profiles
  UPDATE public.profiles
  SET
    full_name = coalesce(trim(p_full_name), full_name),
    email = coalesce(lower(trim(p_email)), email),
    phone = nullif(trim(p_phone), ''),
    cpf = nullif(trim(p_cpf), ''),
    role = v_new_role,
    updated_at = now()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Dados do cliente atualizados com sucesso!'
  );
END;
$$;

-- 5. Conceder permissão de execução aos usuários autenticados (a função internamente valida is_admin())
GRANT EXECUTE ON FUNCTION public.admin_create_customer TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_customer TO authenticated;
