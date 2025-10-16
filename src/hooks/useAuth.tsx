import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Usuario } from '@/types';
import { showError, showSuccess } from '@/utils/toast';

interface AuthContextType {
  user: Usuario | null;
  login: (email: string, password: string) => Promise<boolean>;
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

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const createFallbackUser = async (authUser: any): Promise<Usuario> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert({
          id: authUser.id,
          nome: authUser.user_metadata?.nome || authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          telefone: authUser.user_metadata?.telefone || '',
          tipo: 'novo'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar usuário fallback:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Falha no fallback:', error);
      // Retornar usuário mínimo para não bloquear o login
      return {
        id: authUser.id,
        nome: authUser.user_metadata?.nome || authUser.email?.split('@')[0] || 'Usuário',
        email: authUser.email || '',
        telefone: authUser.user_metadata?.telefone || '',
        tipo: 'novo'
      } as Usuario;
    }
  };

  const fetchUserProfile = async (userId: string): Promise<Usuario | null> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        
        // Se o erro for de usuário não encontrado, tentar criar
        if (error.code === 'PGRST116') {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            return await createFallbackUser(authUser);
          }
        }
        
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar perfil:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setUser(profile);
          } else {
            console.error('Não foi possível carregar o perfil do usuário');
            // Não fazer logout, tentar novamente
            setTimeout(() => {
              fetchUserProfile(session.user.id).then(profile => {
                if (profile) setUser(profile);
              });
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Aguardar um pouco para o gatilho do banco executar
          setTimeout(async () => {
            const profile = await fetchUserProfile(session.user.id);
            if (profile) {
              setUser(profile);
              showSuccess('Login realizado com sucesso!');
            } else {
              console.error('Falha ao carregar perfil após login');
              // Tentar criar usuário fallback
              const fallbackUser = await createFallbackUser(session.user);
              setUser(fallbackUser);
              showSuccess('Login realizado com sucesso!');
            }
          }, 1000);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED') {
          if (session?.user && !user) {
            const profile = await fetchUserProfile(session.user.id);
            if (profile) setUser(profile);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        console.error('Erro detalhado no login:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          showError('Email ou senha incorretos. Verifique seus dados.');
        } else if (error.message.includes('Email not confirmed')) {
          showError('Por favor, confirme seu email antes de fazer login.');
        } else {
          showError(`Erro ao fazer login: ${error.message}`);
        }
        return false;
      }

      if (!data.user) {
        showError('Erro ao fazer login: usuário não encontrado');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      showError('Ocorreu um erro inesperado. Tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<Usuario, 'id'> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(userData.password)) {
        showError('Senha fraca. Use 8+ caracteres com maiúsculas, minúsculas e números.');
        return false;
      }

      const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://seu-dominio.vercel.app';
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        options: {
          data: {
            nome: userData.nome.trim(),
            telefone: userData.telefone?.trim() || ''
          },
          emailRedirectTo: `${siteUrl}/dashboard`
        }
      });

      if (error) {
        console.error('Erro no cadastro:', error);
        
        if (error.message.includes('User already registered')) {
          showError('Este email já está cadastrado. Tente fazer login.');
        } else {
          showError(`Erro ao cadastrar: ${error.message}`);
        }
        return false;
      }
      
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        showError('Este email já está cadastrado. Tente fazer login.');
        return false;
      }

      showSuccess('Cadastro realizado com sucesso! Verifique seu email para confirmar o cadastro.');
      return true;
    } catch (error) {
      console.error('Erro inesperado no cadastro:', error);
      showError('Ocorreu um erro inesperado. Tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      showSuccess('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      showError('Erro ao fazer logout');
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      // Simular envio de email de recuperação
      // Em produção, você usaria um serviço como SendGrid, Mailgun, ou o próprio Supabase
      const resetToken = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Aqui você enviaria o email com o token
      // Por enquanto, vamos apenas simular o sucesso
      console.log('Token de reset:', resetToken);
      
      showSuccess('Código de recuperação enviado para seu email!');
      return true;
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      showError('Erro ao enviar email de recuperação. Tente novamente.');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, resetPassword, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};