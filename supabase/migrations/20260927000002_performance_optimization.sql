-- ========================================================
-- FASE 14: PERFORMANCE & DATABASE OPTIMIZATION
-- ========================================================

-- 1. Foreign Key & Query Performance Indexes
CREATE INDEX IF NOT EXISTS idx_addresses_profile_id ON public.addresses (profile_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor_id ON public.admin_audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items (product_id);
CREATE INDEX IF NOT EXISTS idx_carts_profile_id ON public.carts (profile_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_products_status_created_at ON public.products (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- 2. RLS InitPlan Performance Optimization: (select auth.uid())

-- Profiles
DROP POLICY IF EXISTS "Profiles: Usuários leem seu próprio perfil" ON public.profiles;
CREATE POLICY "Profiles: Usuários leem seu próprio perfil"
    ON public.profiles FOR SELECT
    USING ((id = (select auth.uid())) OR is_admin());

DROP POLICY IF EXISTS "Profiles: Usuários atualizam seu próprio perfil" ON public.profiles;
CREATE POLICY "Profiles: Usuários atualizam seu próprio perfil"
    ON public.profiles FOR UPDATE
    USING ((id = (select auth.uid())) OR is_admin());

-- Addresses
DROP POLICY IF EXISTS "Addresses: Usuários gerenciam seus próprios endereços" ON public.addresses;
CREATE POLICY "Addresses: Usuários gerenciam seus próprios endereços"
    ON public.addresses FOR ALL
    USING ((profile_id = (select auth.uid())) OR is_admin());

-- Carts
DROP POLICY IF EXISTS "Carts: Usuários gerenciam seu próprio carrinho" ON public.carts;
CREATE POLICY "Carts: Usuários gerenciam seu próprio carrinho"
    ON public.carts FOR ALL
    USING ((profile_id = (select auth.uid())) OR is_admin());

-- Cart Items
DROP POLICY IF EXISTS "Cart Items: Usuários gerenciam itens do seu carrinho" ON public.cart_items;
CREATE POLICY "Cart Items: Usuários gerenciam itens do seu carrinho"
    ON public.cart_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id
              AND (carts.profile_id = (select auth.uid()) OR is_admin())
        )
    );

-- Orders
DROP POLICY IF EXISTS "Orders: Clientes leem apenas seus pedidos" ON public.orders;
CREATE POLICY "Orders: Clientes leem apenas seus pedidos"
    ON public.orders FOR SELECT
    USING ((customer_id = (select auth.uid())) OR is_admin());

-- Order Items
DROP POLICY IF EXISTS "Order Items: Clientes leem itens de seus pedidos" ON public.order_items;
CREATE POLICY "Order Items: Clientes leem itens de seus pedidos"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
              AND (orders.customer_id = (select auth.uid()) OR is_admin())
        )
    );

-- Payments
DROP POLICY IF EXISTS "Payments: Clientes leem pagamentos de seus pedidos" ON public.payments;
CREATE POLICY "Payments: Clientes leem pagamentos de seus pedidos"
    ON public.payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payments.order_id
              AND (orders.customer_id = (select auth.uid()) OR is_admin())
        )
    );
