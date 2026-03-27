CREATE OR REPLACE FUNCTION public.handle_delete_usuario_cliente()
RETURNS trigger AS $$
DECLARE
    v_auth_user_id uuid;
BEGIN
    -- Localiza o ID do usuário na tabela auth.users baseado no email
    SELECT id INTO v_auth_user_id FROM auth.users WHERE email = OLD.email;
    
    -- Remove o usuário da tabela auth.users, garantindo a exclusão atômica e em cascata
    IF v_auth_user_id IS NOT NULL THEN
        DELETE FROM auth.users WHERE id = v_auth_user_id;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_usuario_cliente_deleted ON public.usuarios_cliente;

CREATE TRIGGER on_usuario_cliente_deleted
BEFORE DELETE ON public.usuarios_cliente
FOR EACH ROW EXECUTE FUNCTION public.handle_delete_usuario_cliente();
