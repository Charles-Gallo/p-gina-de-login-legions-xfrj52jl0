-- Enable RLS for all required tables
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widgets ENABLE ROW LEVEL SECURITY;

-- Drop existing permissive policies to replace them
DROP POLICY IF EXISTS "authenticated_all_clientes" ON public.clientes;
DROP POLICY IF EXISTS "authenticated_all_usuarios" ON public.usuarios_cliente;
DROP POLICY IF EXISTS "authenticated_all_widgets" ON public.widgets;

-- ==========================================
-- Admin Policies (Full Access)
-- ==========================================

CREATE POLICY "admin_all_clientes" ON public.clientes
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin_all_usuarios" ON public.usuarios_cliente
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin_all_widgets" ON public.widgets
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ==========================================
-- Cliente Policies (Select Only)
-- ==========================================

-- Table usuarios_cliente: Clientes can only select their own record
CREATE POLICY "cliente_select_usuarios" ON public.usuarios_cliente
    FOR SELECT TO authenticated
    USING (email = (auth.jwt() ->> 'email'));

-- Table clientes: Clientes can select the record where id matches their cliente_id
CREATE POLICY "cliente_select_clientes" ON public.clientes
    FOR SELECT TO authenticated
    USING (id IN (
        SELECT cliente_id 
        FROM public.usuarios_cliente 
        WHERE email = (auth.jwt() ->> 'email')
    ));

-- Table widgets: Clientes can select records associated with their cliente_id
CREATE POLICY "cliente_select_widgets" ON public.widgets
    FOR SELECT TO authenticated
    USING (cliente_id IN (
        SELECT cliente_id 
        FROM public.usuarios_cliente 
        WHERE email = (auth.jwt() ->> 'email')
    ));
