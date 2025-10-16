import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Usuario } from '@/types';
import { showError, showSuccess } from '@/utils/toast';

interface AuthContextType {
  user: Usuario | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<Usuario, 'id'> & { password: string }) => Promise<boolean>;
  logout: () => void;
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

  const fetchUserProfile = async (userId: string, retries = 3): Promise<Usuario | null> => {
    for (let i = 0; i < retries; i++) {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error(`Tentativa ${i + 1} - Erro ao buscar perfil:`, error);
          if (i === retries - 1) {
            // Última tentativa, criar perfil manualmente
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
              const { data: newUser, error: insertError } = await supabase
                .from('usuarios')
                .insert({
                  id: userId,
                  nome: authUser.user_metadata?.nome || 'Usuário',
                  email: authUser.email || '',
                  telefone: authUser.user_metadata?.telefone || '',
                  tipo: 'novo'
                })
                .select()
                .single();

              if (!insertError && newUser) {
                return newUser;
              }
            }
          }
          // Aguardar antes da próxima tentativa
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        } else {
          return data;
        }
      } catch (error) {
        console.error(`Tentativa ${i + 1} - Erro inesperado:`, error);
        if (i === retries - 1) return null;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    return null;
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
            // Fazer logout se não conseguir carregar perfil
            await supabase.auth.signOut();
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
              await supabase.auth.signOut();
            }
          }, 1000);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED') {
          // Token atualizado, recarregar perfil se necessário
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
        
        // Tratamento específico de erros
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
      // Validação de senha
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(userData.password)) {
        showError('Senha fraca. Use 8+ caracteres com maiúsculas, minúsculas e números.');
        return false;
      }

      // Obter URL de redirecionamento correta
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

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};