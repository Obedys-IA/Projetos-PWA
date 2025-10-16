import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // This function can only be called with a service key, not an anon key.
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set.');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // The target user email and new password are hardcoded for security.
    const targetEmail = 'obedys.ia@gmail.com';
    const newPassword = 'Junio2019';

    console.log(`Attempting to reset password for user: ${targetEmail}`);

    // Find the user by email
    const { data: { users }, error: findError } = await supabaseAdmin.auth.admin.listUsers();
    if (findError) throw findError;

    const user = users.find(u => u.email === targetEmail);
    if (!user) {
        throw new Error(`User with email ${targetEmail} not found.`);
    }

    // Update the user's password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Error updating user password:', updateError);
      throw updateError;
    }

    console.log(`Password successfully reset for user: ${targetEmail}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Password for ${targetEmail} has been successfully reset.` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Function execution error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});