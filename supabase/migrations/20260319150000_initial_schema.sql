CREATE TABLE public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email_contato TEXT NOT NULL,
    configuracoes JSONB DEFAULT '{}'::jsonb,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.usuarios_cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    nome_usuario TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    nome_relatorio TEXT NOT NULL,
    url_looker TEXT NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all_clientes" ON public.clientes 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all_usuarios" ON public.usuarios_cliente 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all_widgets" ON public.widgets 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
