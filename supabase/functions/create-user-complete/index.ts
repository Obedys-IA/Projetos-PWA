/// <reference types="https://deno.land/x/deno@v1.36.3/lib/deno.ns.d.ts" />
/// <reference types="https://esm.sh/@supabase/supabase-js@2.45.0" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const targetEmail = 'obedys.ia@gmail.com';
    const newPassword = 'Junio2019';
    const userName = 'Obedys';
    const userType = 'administrador';

    console.log(`Attempting to create/update user: ${targetEmail}`);

    // 1. Check if user exists in auth.users
    const { data: { users }, error: findError } = await supabaseAdmin.auth.admin.listUsers();
    if (findError) throw findError;

    let user = users.find(u => u.email === targetEmail);
    let userId: string;

    if (user) {
      // User exists, update password
      console.log(`User found, updating password for: ${targetEmail}`);
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: newPassword, email_confirm: true }
      );
      if (updateError) throw updateError;
      userId = user.id;
      console.log(`Password updated for user: ${targetEmail}`);
    } else {
      // User does not exist, create it
      console.log(`User not found, creating new user: ${targetEmail}`);
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: targetEmail,
        password: newPassword,
        email_confirm: true,
        user_metadata: {
          nome: userName
        }
      });
      if (createError) throw createError;
      if (!newUser.user) throw new Error('Failed to create user, no user object returned.');
      
      userId = newUser.user.id;
      console.log(`New user created with ID: ${userId}`);
    }

    // 2. Sync user to public.usuarios table
    console.log(`Syncing user to public.usuarios table with ID: ${userId}`);
    const { error: syncError } = await supabaseAdmin
      .from('usuarios')
      .upsert({
        id: userId,
        nome: userName,
        email: targetEmail,
        telefone: '',
        tipo: userType,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (syncError) {
      console.error('Error syncing user to public.usuarios:', syncError);
      throw syncError;
    }

    console.log(`User successfully synced to public.usuarios.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${targetEmail} has been created/updated and synced successfully.`,
        userId: userId
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
