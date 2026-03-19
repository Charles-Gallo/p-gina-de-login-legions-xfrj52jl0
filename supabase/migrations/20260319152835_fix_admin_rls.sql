-- Fix admin RLS policies by using safe navigation and default checks

-- 1. Drop existing permissive admin policies
DROP POLICY IF EXISTS "admin_all_clientes" ON public.clientes;
DROP POLICY IF EXISTS "admin_all_usuarios" ON public.usuarios_cliente;
DROP POLICY IF EXISTS "admin_all_widgets" ON public.widgets;

-- 2. Recreate policies with COALESCE to handle missing user_metadata or role key safely
CREATE POLICY "admin_all_clientes" ON public.clientes
    FOR ALL TO authenticated
    USING (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin')
    WITH CHECK (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin');

CREATE POLICY "admin_all_usuarios" ON public.usuarios_cliente
    FOR ALL TO authenticated
    USING (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin')
    WITH CHECK (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin');

CREATE POLICY "admin_all_widgets" ON public.widgets
    FOR ALL TO authenticated
    USING (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin')
    WITH CHECK (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin');
