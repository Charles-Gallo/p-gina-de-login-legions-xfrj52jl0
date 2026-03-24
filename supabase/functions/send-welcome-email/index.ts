import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, senha_temporaria, resetUrl } = await req.json()
    
    if (!email || !senha_temporaria) {
      throw new Error('E-mail e senha temporária são obrigatórios')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    // Cria o usuário no Auth do Supabase (ignora se já existir)
    const { error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha_temporaria,
      email_confirm: true,
    })

    if (authError && authError.code !== 'user_already_exists') {
      throw new Error(`Erro ao criar conta de autenticação: ${authError.message}`)
    }

    const resendApiKey = Deno.env.get('EMAIL_SERVICE_API_KEY')
    const senderEmail = Deno.env.get('SENDER_EMAIL') || 'onboarding@resend.dev'
    const link = resetUrl || 'https://pagina-de-login-legions-13e4e.goskip.app/redefinir-senha'

    if (!resendApiKey) {
      console.log('Simulated welcome email send for:', email)
      return new Response(JSON.stringify({ message: "Simulated welcome email send" }), {
         status: 200,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `Legions <${senderEmail}>`,
        to: email,
        subject: 'Bem-vindo(a) à Legions - Suas Credenciais',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <h2 style="color: #1268b3;">Bem-vindo(a) à Legions!</h2>
            <p>Sua conta foi criada com sucesso. Abaixo estão suas credenciais de acesso temporárias:</p>
            <div style="background-color: #f4f4f5; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0;"><strong>E-mail:</strong> ${email}</p>
              <p style="margin: 0;"><strong>Senha Temporária:</strong> ${senha_temporaria}</p>
            </div>
            <p>Recomendamos fortemente que você altere sua senha no primeiro acesso para garantir a segurança da sua conta.</p>
            <div style="margin: 30px 0;">
              <a href="${link}" style="background-color: #1268b3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Acessar e Redefinir Senha
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">Se você tiver alguma dúvida ou não esperava este e-mail, entre em contato com o suporte.</p>
          </div>
        `
      })
    })

    if (!res.ok) {
      const resError = await res.text()
      throw new Error(`Resend API error: ${resError}`)
    }

    return new Response(JSON.stringify({ message: "Welcome email sent successfully" }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
