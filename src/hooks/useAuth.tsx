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

  // Função robusta para carregar perfil do usuário
  const loadUserProfile = async (authUser: any): Promise<Usuario | null> => {
    console.log('AuthProvider: Carregando perfil para:', authUser.email);
    
    try {
      // Buscar o perfil na tabela public.usuarios
      const { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('AuthProvider: Erro ao buscar perfil:', profileError);
        
        // Se não encontrar o perfil, criar um novo
        if (profileError.code === 'PGRST116') {
          console.log('AuthProvider: Perfil não encontrado, criando novo...');
          
          const newProfileData = {
            id: authUser.id,
            nome: authUser.user_metadata?.nome || authUser.email?.split('@')[0] || 'Usuário',
            email: authUser.email || '',
            telefone: authUser.user_metadata?.telefone || '',
            tipo: 'novo' // Padrão para novos usuários
          };

          const { data: newProfile, error: insertError } = await supabase
            .from('usuarios')
            .insert(newProfileData)
            .select()
            .single();

          if (insertError) {
            console.error('AuthProvider: Erro ao criar perfil:', insertError);
            return null;
          }

          console.log('AuthProvider: Novo perfil criado:', newProfile);
          return newProfile;
        }
        
        return null;
      }

      console.log('AuthProvider: Perfil carregado:', profile);
      return profile;

    } catch (error) {
      console.error('AuthProvider: Erro ao carregar perfil:', error);
      return null;
    }
  };

  // Efeito para inicializar a autenticação
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthProvider: Inicializando autenticação...');
      setIsLoading(true);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('AuthProvider: Sessão encontrada, carregando perfil...');
          const profile = await loadUserProfile(session.user);
          
          if (profile) {
            setUser(profile);
            console.log('AuthProvider: Perfil carregado com sucesso:', profile.tipo);
          } else {
            console.error('AuthProvider: Não foi possível carregar o perfil do usuário');
            setUser(null);
          }
        } else {
          console.log('AuthProvider: Nenhuma sessão encontrada.');
          setUser(null);
        }
      } catch (error) {
        console.error('AuthProvider: Erro na inicialização:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Mudança de estado:', event, session?.user?.id);

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('AuthProvider: Usuário autenticado, carregando perfil...');
          const profile = await loadUserProfile(session.user);
          
          if (profile) {
            setUser(profile);
            console.log('AuthProvider: Perfil carregado após login:', profile.tipo);
            showSuccess('Login realizado com sucesso!');
          } else {
            console.error('AuthProvider: Não foi possível carregar o perfil após login');
            setUser(null);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthProvider: Usuário desautenticado.');
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('AuthProvider: Iniciando login...');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        console.error('AuthProvider: Erro no login:', error);
        throw error;
      }

      console.log('AuthProvider: Login bem-sucedido!');
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

  // Função de registro
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
      console.error('AuthProvider: Erro no cadastro:', error);
      
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

  // Função de logout
  const logout = async () => {
    console.log('AuthProvider: Fazendo logout...');
    await supabase.auth.signOut();
    setUser(null);
    showSuccess('Você foi desconectado.');
  };

  // Função de reset de senha
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      console.log(`AuthProvider: Solicitando recuperação para ${email}`);

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });

      if (error) {
        console.error("AuthProvider: Erro na recuperação de senha:", error);
        throw error;
      }
      
      console.log('AuthProvider: Email de recuperação enviado');
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