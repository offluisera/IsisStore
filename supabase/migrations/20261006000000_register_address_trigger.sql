-- Migration: Persistência automática do initial_address na criação do usuário
-- Autor: Isis Store Engineering
-- Data: 2026-10-06

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    addr JSONB;
BEGIN
    -- Criação ou atualização do perfil básico
    INSERT INTO public.profiles (id, full_name, email, role, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        'customer',
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    -- Se o cadastro incluiu initial_address em raw_user_meta_data, insere automaticamente na tabela addresses
    addr := NEW.raw_user_meta_data->'initial_address';
    IF addr IS NOT NULL 
       AND addr->>'postal_code' IS NOT NULL 
       AND addr->>'street' IS NOT NULL 
       AND addr->>'number' IS NOT NULL THEN
        INSERT INTO public.addresses (
            profile_id,
            recipient_name,
            postal_code,
            street,
            number,
            complement,
            neighborhood,
            city,
            state,
            is_default
        )
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'Principal'),
            REGEXP_REPLACE(addr->>'postal_code', '\D', '', 'g'),
            addr->>'street',
            addr->>'number',
            NULLIF(addr->>'complement', ''),
            COALESCE(addr->>'neighborhood', ''),
            COALESCE(addr->>'city', ''),
            COALESCE(addr->>'state', ''),
            TRUE
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;
