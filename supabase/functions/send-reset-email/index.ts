import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, token } = await req.json()

    // Criar mensagem para WhatsApp
    const message = `🔐 *CHECKNF - GDM* - Código de Redefinição de Senha\n\n` +
      `Olá!\n\n` +
      `Seu código de redefinição de senha é:\n\n` +
      `*${token}*\n\n` +
      `Este código expira em 2 horas.\n\n` +
      `Se você não solicitou esta redefinição, ignore esta mensagem.\n\n` +
      `Atenciosamente,\n` +
      `Equipe CHECKNF - GDM`

    // Gerar link do WhatsApp
    const whatsappUrl = `https://wa.me/5581999999999?text=${encodeURIComponent(message)}`

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Código gerado com sucesso!',
        whatsappUrl,
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