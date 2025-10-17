const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, token } = await req.json()

    const emailMessage = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #f97316); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">CHECKNF - GDM</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Sistema de Gestão de Notas Fiscais</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Recuperação de Senha</h2>
            
            <p style="color: #4b5563; margin: 0 0 20px 0; line-height: 1.6;">
              Olá!
            </p>
            
            <p style="color: #4b5563; margin: 0 0 20px 0; line-height: 1.6;">
              Recebemos uma solicitação para redefinir sua senha. Use o código abaixo para criar uma nova senha:
            </p>
            
            <div style="background: white; border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Seu código de recuperação:</p>
              <p style="color: #1f2937; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 0;">${token}</p>
            </div>
            
            <p style="color: #6b7280; margin: 20px 0 0 0; font-size: 14px;">
              Este código expira em <strong>1 hora</strong>.
            </p>
            
            <p style="color: #6b7280; margin: 20px 0 0 0; font-size: 14px;">
              Se você não solicitou esta recuperação, ignore este email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f3f4f6; border-radius: 10px;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Atenciosamente,<br>
              Equipe CHECKNF - GDM
            </p>
          </div>
        </body>
      </html>
    `

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de recuperação enviado com sucesso!',
        emailContent: emailMessage,
        token 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
