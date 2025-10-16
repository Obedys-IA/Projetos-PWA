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
      console.log('AuthProvider: Inicializando autenticação...');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('AuthProvider: Sessão encontrada, buscando perfil do usuário...');
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setUser(profile);
            console.log('AuthProvider: Perfil do usuário carregado com sucesso.');
          }
        } else {
          console.log('AuthProvider: Nenhuma sessão encontrada.');
        }
      } catch (error) {
        console.error('AuthProvider: Erro ao inicializar autenticação:', error);
      } finally {
        setIsLoading(false);
        console.log('AuthProvider: Inicialização concluída.');
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Mudança no estado de autenticação:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('AuthProvider: Evento de login detectado, buscando perfil...');
          const profile = await fetchUserProfile(session.user.id);
          setUser(profile);
          if (profile) {
            showSuccess('Login realizado com sucesso!');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthProvider: Evento de logout detectado.');
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user && !user) {
          console.log('AuthProvider: Token refresh detectado, buscando perfil...');
          const profile = await fetchUserProfile(session.user.id);
          setUser(profile);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('AuthProvider: Iniciando processo de login...');
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        console.error('AuthProvider: Erro retornado pelo Supabase no login:', error);
        throw error;
      }
      
      console.log('AuthProvider: Login bem-sucedido no Supabase. Sessão:', data.session?.user?.id);
      // O redirecionamento e a atualização do estado do usuário serão feitos pelo onAuthStateChange
      return true;
    } catch (error: any) {
      console.error('AuthProvider: Erro detalhado no login:', error);
      if (error.message.includes('Invalid login credentials')) {
        showError('Email ou senha incorretos.');
      } else if (error.message.includes('Email not confirmed')) {
        showError('Por favor, confirme seu email antes de fazer login.');
      } else {
        showError(`Erro ao fazer login: ${error.message}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<Usuario, 'id'> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
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
      console.error('Erro no cadastro:', error);
      if (error.message.includes('User already registered')) {
        showError('Este email já está cadastrado.');
      } else {
        showError(`Erro ao cadastrar: ${error.message}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('AuthProvider: Iniciando logout...');
    await supabase.auth.signOut();
    setUser(null);
    showSuccess('Você foi desconectado.');
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      // Usando a URL hardcoded para máxima confiabilidade
      const redirectTo = 'https://nwkqdbonogfitjhkjjgh.supabase.co/reset-password';
      console.log(`AuthProvider: Solicitando recuperação para ${email} com redirecionamento para ${redirectTo}`);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });

      if (error) {
        console.error("AuthProvider: Erro retornado pelo Supabase na recuperação de senha:", error);
        throw error;
      }
      
      showSuccess('Solicitação enviada! Verifique seu email (e a caixa de spam).');
      return true;
    } catch (error: any) {
      console.error('AuthProvider: Erro no processo de reset de senha:', error);
      showError(`Erro ao enviar email: ${error.message}`);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      resetPassword, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};