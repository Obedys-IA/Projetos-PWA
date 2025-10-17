import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Usuario } from '@/types';
import { showError, showSuccess } from '@/utils/toast';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: Usuario | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<Usuario, 'id'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const fetchUserProfile = async (authUser: SupabaseUser | null): Promise<Usuario | null> => {
  if (!authUser) return null;

  let { data: profile, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (error && error.code === 'PGRST116') {
    // Profile doesn't exist, let's create it.
    console.warn('AuthProvider: Perfil não encontrado, criando um novo...');
    const { data: newProfile, error: insertError } = await supabase
      .from('usuarios')
      .insert({
        id: authUser.id,
        email: authUser.email!,
        nome: authUser.user_metadata?.nome || authUser.email,
        telefone: authUser.user_metadata?.telefone || '',
        tipo: 'novo'
      })
      .select()
      .single();

    if (insertError) {
      console.error('AuthProvider: Erro ao criar perfil:', insertError);
      showError('Falha ao criar seu perfil de usuário.');
      return null;
    }
    console.log('AuthProvider: Perfil criado com sucesso:', newProfile);
    return newProfile;
  }
  
  if (error) {
    console.error('AuthProvider: Erro ao buscar perfil:', error);
    showError('Não foi possível carregar seu perfil. Tente novamente.');
    return null;
  }

  return profile;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const { data: user, isFetching: isUserFetching } = useQuery<Usuario | null>({
    queryKey: ['user', session?.user?.id],
    queryFn: () => fetchUserProfile(session?.user || null),
    enabled: !isInitializing,
    staleTime: 1000 * 60 * 5, // Perfil do usuário fica "stale" após 5 minutos
  });

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setIsInitializing(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED' || _event === 'SIGNED_OUT') {
          queryClient.invalidateQueries({ queryKey: ['user'] });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const login = async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    });

    if (error) {
      console.error('AuthProvider: Erro detalhado no login:', error);
      if (error.message.includes('Invalid login credentials')) {
        showError('Email ou senha incorretos.');
      } else if (error.message.includes('Email not confirmed')) {
        showError('Por favor, confirme seu email antes de fazer login.');
      } else {
        showError(`Erro ao fazer login: ${error.message}`);
      }
      throw error;
    }
  };

  const register = async (userData: Omit<Usuario, 'id'> & { password: string }): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        options: {
          data: {
            nome: userData.nome.trim(),
            telefone: userData.telefone?.trim() || ''
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) throw error;

      showSuccess('Cadastro realizado! Verifique seu email para confirmar a conta.');
      return true;
    } catch (error: any) {
      console.error('AuthProvider: Erro no cadastro:', error);
      if (error.message.includes('User already registered')) {
        showError('Este email já está cadastrado.');
      } else if (error.message.includes('Error sending confirmation email')) {
        showError('Erro ao enviar email de confirmação. Verifique as configurações de email do seu projeto Supabase.');
      } else {
        showError(`Erro ao cadastrar: ${error.message}`);
      }
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    showSuccess('Você foi desconectado.');
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });

      if (error) throw error;
      
      showSuccess('Email de recuperação enviado! Verifique sua caixa de entrada e a pasta de spam.');
      return true;
    } catch (error: any) {
      console.error('AuthProvider: Erro no reset de senha:', error);
      if (error.message.includes('User not found')) {
        showError('Este email não está cadastrado em nosso sistema.');
      } else if (error.message.includes('rate limit')) {
        showError('Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.');
      } else {
        showError(`Erro ao enviar email: ${error.message}`);
      }
      return false;
    }
  };

  const isLoading = isInitializing || (session != null && isUserFetching);

  const value = {
    user: user || null,
    session,
    login,
    register,
    logout,
    resetPassword,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
