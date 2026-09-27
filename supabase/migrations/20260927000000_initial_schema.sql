-- ====================================================================
-- ISIS STORE — MIGRATION INICIAL: ESQUEMA DE BANCO, RLS E STORAGE
-- Versão: 20260927000000_initial_schema.sql
-- ====================================================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('customer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.product_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.order_status AS ENUM (
        'pending_payment',
        'paid',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM (
        'pending',
        'approved',
        'authorized',
        'in_process',
        'rejected',
        'cancelled',
        'refunded',
        'charged_back'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABELAS DE DOMÍNIO

-- 2.1 Profiles (Vinculado a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL,
    phone TEXT,
    cpf TEXT,
    role public.user_role NOT NULL DEFAULT 'customer',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 Endereços
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_name TEXT NOT NULL,
    street TEXT NOT NULL,
    number TEXT NOT NULL,
    complement TEXT,
    neighborhood TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 Categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_name TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.4 Produtos (Preços e estoque inteiros anti-negativo)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    short_description TEXT,
    sku TEXT NOT NULL UNIQUE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    sale_price_cents INTEGER CHECK (sale_price_cents IS NULL OR sale_price_cents >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    status public.product_status NOT NULL DEFAULT 'draft',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    weight_grams INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.5 Imagens de Produtos
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    alt_text TEXT NOT NULL DEFAULT '',
    width INTEGER,
    height INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.6 Carrinho
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.7 Itens do Carrinho
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (cart_id, product_id)
);

-- 2.8 Pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    status public.order_status NOT NULL DEFAULT 'pending_payment',
    subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
    shipping_cents INTEGER NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
    discount_cents INTEGER NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
    total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
    shipping_address JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.9 Itens do Pedido (Snapshot Imutável)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.10 Pagamentos
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    gateway TEXT NOT NULL DEFAULT 'mercadopago',
    gateway_payment_id TEXT,
    status public.payment_status NOT NULL DEFAULT 'pending',
    amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
    payment_method TEXT,
    qr_code TEXT,
    qr_code_base64 TEXT,
    ticket_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.11 Tabela de Idempotência Financeira
CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL UNIQUE,
    gateway TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.12 Configuração de Gateways
CREATE TABLE IF NOT EXISTS public.payment_gateways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.13 Auditoria Administrativa
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);

-- 4. FUNÇÕES E TRIGGERS DE SEGURANÇA

-- 4.1 Verificador de Administrador (Security Definer para evitar loops)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$;

-- 4.2 Trigger para novos usuários do Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        'customer',
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. ROW LEVEL SECURITY (RLS) — 100% DAS TABELAS EXPOSTAS

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 5.1 Políticas para Profiles
CREATE POLICY "Profiles: Usuários leem seu próprio perfil" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Profiles: Usuários atualizam seu próprio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- 5.2 Políticas para Endereços
CREATE POLICY "Addresses: Usuários gerenciam seus próprios endereços" ON public.addresses
    FOR ALL USING (auth.uid() = profile_id OR public.is_admin());

-- 5.3 Políticas para Categorias
CREATE POLICY "Categories: Leitura pública para categorias ativas" ON public.categories
    FOR SELECT USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Categories: Admins gerenciam categorias" ON public.categories
    FOR ALL USING (public.is_admin());

-- 5.4 Políticas para Produtos
CREATE POLICY "Products: Leitura pública para produtos publicados" ON public.products
    FOR SELECT USING (status = 'published' OR public.is_admin());

CREATE POLICY "Products: Admins gerenciam produtos" ON public.products
    FOR ALL USING (public.is_admin());

-- 5.5 Políticas para Imagens de Produtos
CREATE POLICY "Product Images: Leitura pública de imagens" ON public.product_images
    FOR SELECT USING (TRUE);

CREATE POLICY "Product Images: Admins gerenciam imagens" ON public.product_images
    FOR ALL USING (public.is_admin());

-- 5.6 Políticas para Carrinho e Itens
CREATE POLICY "Carts: Usuários gerenciam seu próprio carrinho" ON public.carts
    FOR ALL USING (auth.uid() = profile_id OR public.is_admin());

CREATE POLICY "Cart Items: Usuários gerenciam itens do seu carrinho" ON public.cart_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id
            AND (carts.profile_id = auth.uid() OR public.is_admin())
        )
    );

-- 5.7 Políticas para Pedidos e Itens
CREATE POLICY "Orders: Clientes leem apenas seus pedidos" ON public.orders
    FOR SELECT USING (auth.uid() = customer_id OR public.is_admin());

CREATE POLICY "Orders: Admins gerenciam pedidos" ON public.orders
    FOR ALL USING (public.is_admin());

CREATE POLICY "Order Items: Clientes leem itens de seus pedidos" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.customer_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Order Items: Admins gerenciam itens" ON public.order_items
    FOR ALL USING (public.is_admin());

-- 5.8 Políticas para Pagamentos e Idempotência
CREATE POLICY "Payments: Clientes leem pagamentos de seus pedidos" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payments.order_id
            AND (orders.customer_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Payments: Admins gerenciam pagamentos" ON public.payments
    FOR ALL USING (public.is_admin());

CREATE POLICY "Payment Events: Acesso restrito a Admins" ON public.payment_events
    FOR ALL USING (public.is_admin());

CREATE POLICY "Payment Gateways: Leitura de ativos ou gestão Admin" ON public.payment_gateways
    FOR SELECT USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Payment Gateways: Admins gerenciam configurações" ON public.payment_gateways
    FOR ALL USING (public.is_admin());

-- 5.9 Políticas para Logs de Auditoria
CREATE POLICY "Audit Logs: Apenas Admins leem ou escrevem logs" ON public.admin_audit_logs
    FOR ALL USING (public.is_admin());

-- 6. STORAGE BUCKET: PRODUTOS
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
    CREATE POLICY "Storage: Imagens de produtos públicas" ON storage.objects
        FOR SELECT USING (bucket_id = 'products');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Storage: Apenas admins sobem imagens" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'products' AND public.is_admin());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Storage: Apenas admins deletam imagens" ON storage.objects
        FOR DELETE USING (bucket_id = 'products' AND public.is_admin());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 7. SEEDS DE DESENVOLVIMENTO: 5 CATEGORIAS OFICIAIS ISIS STORE
INSERT INTO public.categories (id, name, slug, description, icon_name, sort_order, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Personalizados', 'personalizados', 'Presentes, mimos e canecas com afeto', 'gift', 1, TRUE),
    ('c2222222-2222-2222-2222-222222222222', 'Infantil / Baby', 'infantil-baby', 'Ursinhos de pelúcia, roupinhas e mimos infantis', 'baby', 2, TRUE),
    ('c3333333-3333-3333-3333-333333333333', 'Masculino / Feminino', 'masculino-feminino', 'Moda feminina e masculina com conforto e estilo', 'shirt', 3, TRUE),
    ('c4444444-4444-4444-4444-444444444444', 'Casa / Eletrônicos', 'casa-eletronicos', 'Headphones, caixas de som e decor aconchegante', 'home', 4, TRUE),
    ('c5555555-5555-5555-5555-555555555555', 'Acessórios', 'acessorios', 'Bolsas, colares delicados, pingentes e relógios', 'sparkles', 5, TRUE)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon_name = EXCLUDED.icon_name,
    sort_order = EXCLUDED.sort_order;

-- 8. SEEDS DE PRODUTOS REALISTAS DA LOJA
INSERT INTO public.products (id, name, slug, description, short_description, sku, category_id, price_cents, sale_price_cents, stock, status, featured)
VALUES
    (
        'b1111111-1111-1111-1111-111111111111',
        'Headphone Bluetooth Rosa Soft',
        'headphone-bluetooth-rosa-soft',
        'Headphone estéreo sem fio de alta fidelidade com almofadas macias, acabamento soft touch em tom rosa pastel e cancelamento de ruído passivo.',
        'Som de alta qualidade, conforto e liberdade para o seu dia a dia.',
        'ELE-HP-001',
        'c4444444-4444-4444-4444-444444444444',
        19990,
        null,
        15,
        'published',
        TRUE
    ),
    (
        'b2222222-2222-2222-2222-222222222222',
        'Ursinho de Pelúcia Carinho',
        'ursinho-de-pelucia-carinho',
        'Ursinho macio antialérgico com laço de cetim rose gold, perfeito para presentes e momentos afetuosos.',
        'Pelúcia macia hipoalergênica para abraçar e presentear.',
        'INF-UR-001',
        'c2222222-2222-2222-2222-222222222222',
        8990,
        null,
        25,
        'published',
        TRUE
    ),
    (
        'b3333333-3333-3333-3333-333333333333',
        'Mochila Feminina Elegante',
        'mochila-feminina-elegante',
        'Mochila compacta impermeável em tom rosa suave com ferragens douradas e compartimento interno acolchoado.',
        'Praticidade e elegância para carregar tudo o que você ama.',
        'ACS-MO-001',
        'c5555555-5555-5555-5555-555555555555',
        16990,
        null,
        10,
        'published',
        TRUE
    ),
    (
        'b4444444-4444-4444-4444-444444444444',
        'Colar Coração Delicado Ouro Rosa',
        'colar-coracao-delicado-ouro-rosa',
        'Corrente veneziana folheada a ouro rosé com pingente de coração lapidado em zircônia rosa.',
        'Um detalhe apaixonante e delicado para compor seu estilo.',
        'ACS-CO-001',
        'c5555555-5555-5555-5555-555555555555',
        5990,
        null,
        30,
        'published',
        TRUE
    )
ON CONFLICT (slug) DO NOTHING;

-- 9. GATEWAY INICIAL: MERCADO PAGO
INSERT INTO public.payment_gateways (name, is_active, is_default, settings)
VALUES ('mercadopago', TRUE, TRUE, '{"mode": "sandbox", "name": "Mercado Pago Checkout Pro"}'::jsonb)
ON CONFLICT (name) DO NOTHING;
