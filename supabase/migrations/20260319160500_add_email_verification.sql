ALTER TABLE public.usuarios_cliente
ADD COLUMN email_confirmado BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN token_confirmacao UUID DEFAULT gen_random_uuid();

-- Set default to false for all new records after existing ones have been initialized to true
ALTER TABLE public.usuarios_cliente
ALTER COLUMN email_confirmado SET DEFAULT false;

CREATE OR REPLACE FUNCTION public.confirmar_email_usuario(p_token UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    UPDATE public.usuarios_cliente
    SET email_confirmado = true, token_confirmacao = NULL
    WHERE token_confirmacao = p_token
    RETURNING id INTO v_user_id;

    IF v_user_id IS NOT NULL THEN
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$;

-- Grant permissions so unauthenticated users can confirm their emails
GRANT EXECUTE ON FUNCTION public.confirmar_email_usuario(UUID) TO anon, authenticated, service_role;
