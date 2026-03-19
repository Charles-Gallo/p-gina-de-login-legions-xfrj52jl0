DO $BODY$
DECLARE
  admin_id uuid := gen_random_uuid();
  customer_auth_id uuid := gen_random_uuid();
  client_id uuid := gen_random_uuid();
BEGIN
  -- Seed Admin User
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    admin_id,
    '00000000-0000-0000-0000-000000000000',
    'charles@legions.biz',
    crypt('123mudar', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin"}',
    false, 'authenticated', 'authenticated',
    '', '', '', '', '',
    NULL,
    '', '', ''
  );

  -- Seed Customer Auth User
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    customer_auth_id,
    '00000000-0000-0000-0000-000000000000',
    'cliente@empresa.com',
    crypt('123mudar', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false, 'authenticated', 'authenticated',
    '', '', '', '', '',
    NULL,
    '', '', ''
  );

  -- Insert Client
  INSERT INTO public.clientes (id, nome, email_contato) 
  VALUES (client_id, 'Empresa Exemplo', 'contato@empresa.com');
  
  -- Insert Customer User Profile
  INSERT INTO public.usuarios_cliente (cliente_id, nome_usuario, email) 
  VALUES (client_id, 'Cliente Exemplo', 'cliente@empresa.com');
  
  -- Insert Widget
  INSERT INTO public.widgets (cliente_id, nome_relatorio, url_looker, ordem) 
  VALUES (client_id, 'Visão Geral de Vendas', 'https://lookerstudio.google.com/reporting/exemplo', 1);

END $BODY$;
