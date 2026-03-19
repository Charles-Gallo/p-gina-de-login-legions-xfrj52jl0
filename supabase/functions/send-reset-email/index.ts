// To configure the email service secrets, run these commands using Supabase CLI:
// supabase secrets set EMAIL_SERVICE_API_KEY=your_resend_api_key
// supabase secrets set SENDER_EMAIL=your_verified_sender_email@domain.com

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, redirectTo } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate recovery link using admin API
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo,
      },
    })

    if (error) {
      // Return success anyway to prevent email enumeration
      return new Response(JSON.stringify({ message: 'Request processed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const actionLink = data.properties.action_link
    const resendApiKey = Deno.env.get('EMAIL_SERVICE_API_KEY')
    const senderEmail = Deno.env.get('SENDER_EMAIL') || 'onboarding@resend.dev'

    if (!resendApiKey) {
      console.log('No EMAIL_SERVICE_API_KEY set. Simulated action_link:', actionLink)
      return new Response(JSON.stringify({ message: 'Simulated email send' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Legions <${senderEmail}>`,
        to: email,
        subject: 'Recuperação de Senha - Legions',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1268b3;">Recuperação de Senha</h2>
            <p>Você solicitou a recuperação de senha da sua conta.</p>
            <p>Clique no botão abaixo para redefinir sua senha com segurança:</p>
            <div style="margin: 30px 0;">
              <a href="${actionLink}" style="background-color: #1268b3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Redefinir Senha
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">Se você não solicitou a redefinição, por favor ignore este e-mail.</p>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const resError = await res.text()
      throw new Error(`Resend API error: ${resError}`)
    }

    return new Response(JSON.stringify({ message: 'Email sent' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
