import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, confirmationUrl } = await req.json()
    const resendApiKey = Deno.env.get('EMAIL_SERVICE_API_KEY')
    const senderEmail = Deno.env.get('SENDER_EMAIL') || 'onboarding@resend.dev'

    if (!resendApiKey) {
      console.log('Simulated confirmation email send. URL:', confirmationUrl)
      return new Response(JSON.stringify({ message: "Simulated email send" }), {
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
        subject: 'Confirmação de E-mail - Legions',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1268b3;">Bem-vindo(a) à Legions!</h2>
            <p>Por favor, confirme seu endereço de e-mail para ter acesso à plataforma.</p>
            <div style="margin: 30px 0;">
              <a href="${confirmationUrl}" style="background-color: #1268b3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Confirmar E-mail
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">Se você não solicitou esta conta, por favor ignore este e-mail.</p>
          </div>
        `
      })
    })

    if (!res.ok) {
      const resError = await res.text()
      throw new Error(`Resend API error: ${resError}`)
    }

    return new Response(JSON.stringify({ message: "Email sent" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
