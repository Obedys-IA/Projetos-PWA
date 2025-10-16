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

  // Função robusta para criar perfil de usuário com fallback completo
  const ensureUserProfile = async (authUser: any): Promise<Usuario> => {
    console.log('AuthProvider: Garantindo existência do perfil para:', authUser.email);
    
    try {
      // Primeiro, tentar buscar o perfil existente
      const { data: existingProfile, error: fetchError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (existingProfile) {
        console.log('AuthProvider: Perfil existente encontrado:', existingProfile);
        return existingProfile;
      }

      // Se não encontrar, tentar criar
      if (fetchError && fetchError.code === 'PGRST116') {
        console.log('AuthProvider: Perfil não encontrado, criando novo...');
        
        const profileData = {
          id: authUser.id,
          nome: authUser.user_metadata?.nome || authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          telefone: authUser.user_metadata?.telefone || '',
          tipo: 'novo'
        };

        const { data: newProfile, error: insertError } = await supabase
          .from('usuarios')
          .insert(profileData)
          .select()
          .single();

        if (insertError) {
          console.error('AuthProvider: Erro ao criar perfil:', insertError);
          throw insertError;
        }

        console.log('AuthProvider: Novo perfil criado com sucesso:', newProfile);
        return newProfile;
      }

      // Se for outro tipo de erro, lançar
      if (fetchError) {
        throw fetchError;
      }

      // Retorno de segurança (não deveria chegar aqui)
      throw new Error('Falha ao garantir perfil do usuário');

    } catch (error) {
      console.error('AuthProvider: Erro em ensureUserProfile:', error);
      
      // Retornar um perfil básico para não bloquear o login
      const fallbackProfile: Usuario = {
        id: authUser.id,
        nome: authUser.user_metadata?.nome || authUser.email?.split('@')[0] || 'Usuário',
        email: authUser.email || '',
        telefone: authUser.user_metadata?.telefone || '',
        tipo: 'novo'
      };
      
      console.warn('AuthProvider: Usando perfil fallback:', fallbackProfile);
      return fallbackProfile;
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
          console.log('AuthProvider: Sessão encontrada, garantindo perfil...');
          const profile = await ensureUserProfile(session.user);
          setUser(profile);
          console.log('AuthProvider: Perfil carregado com sucesso.');
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
          console.log('AuthProvider: Usuário autenticado, garantindo perfil...');
          const profile = await ensureUserProfile(session.user);
          setUser(profile);
          showSuccess('Login realizado com sucesso!');
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthProvider: Usuário desautenticado.');
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Função de login simplificada e robusta
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

  // Função de reset de senha melhorada
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      // Montar a URL de redirecionamento de forma absoluta
      const redirectTo = `${window.location.origin}/reset-password`;
      console.log(`AuthProvider: Solicitando recuperação para ${email}`);
      console.log(`AuthProvider: URL de redirecionamento: ${redirectTo}`);

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });

      if (error) {
        console.error("AuthProvider: Erro retornado pelo Supabase na recuperação de senha:", error);
        throw error;
      }
      
      console.log('AuthProvider: Resposta do Supabase ao solicitar reset:', data);
      showSuccess('Email de recuperação enviado! Verifique sua caixa de entrada e a pasta de spam.');
      return true;
      
    } catch (error: any) {
      console.error('AuthProvider: Erro no processo de reset de senha:', error);
      
      // Fornecer mensagens de erro mais específicas
      if (error.message.includes('User not found')) {
        showError('Este email não está cadastrado em nosso sistema.');
      } else if (error.message.includes('rate limit')) {
        showError('Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.');
      } else {
        showError(`Erro ao enviar email: ${error.message}. Verifique a configuração de email do sistema.`);
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