-- Drop the existing permissive ALL policy for admins to replace it with explicit policies
DROP POLICY IF EXISTS "admin_all_clientes" ON public.clientes;

-- Explicitly allow SELECT operations for admins
CREATE POLICY "admin_select_clientes" ON public.clientes
    FOR SELECT
    TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Explicitly allow INSERT operations for admins
CREATE POLICY "admin_insert_clientes" ON public.clientes
    FOR INSERT
    TO authenticated
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Explicitly allow UPDATE operations for admins
CREATE POLICY "admin_update_clientes" ON public.clientes
    FOR UPDATE
    TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Explicitly allow DELETE operations for admins
CREATE POLICY "admin_delete_clientes" ON public.clientes
    FOR DELETE
    TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

