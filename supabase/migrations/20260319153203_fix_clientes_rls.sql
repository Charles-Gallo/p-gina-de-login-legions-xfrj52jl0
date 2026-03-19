-- Ensure RLS is enabled for the clientes table
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Drop the previous admin policy that was preventing inserts
DROP POLICY IF EXISTS "admin_all_clientes" ON public.clientes;

-- Create the corrected policy explicitly allowing all operations for admins
CREATE POLICY "admin_all_clientes" ON public.clientes
    FOR ALL
    TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
