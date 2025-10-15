import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Usuario } from '@/types';

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

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Buscar dados completos do usuário
        const { data: userData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (userData) {
          setUser(userData);
        } else {
          // Se não encontrar no banco, criar usuário básico
          const newUser: Usuario = {
            id: session.user.id,
            nome: session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
            tipo: 'novo'
          };
          
          try {
            await supabase.from('usuarios').insert([newUser]);
            setUser(newUser);
          } catch (error) {
            console.error('Erro ao criar usuário:', error);
          }
        }
      }
      
      setIsLoading(false);
    };

    getSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Buscar dados completos do usuário
          const { data: userData } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (userData) {
            setUser(userData);
          } else {
            // Criar usuário básico
            const newUser: Usuario = {
              id: session.user.id,
              nome: session.user.email?.split('@')[0] || 'Usuário',
              email: session.user.email || '',
              tipo: 'novo'
            };
            
            try {
              await supabase.from('usuarios').insert([newUser]);
              setUser(newUser);
            } catch (error) {
              console.error('Erro ao criar usuário:', error);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Erro no login:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<Usuario, 'id'> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Validação da senha
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(userData.password)) {
        console.error('Senha não atende aos requisitos');
        return false;
      }

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            nome: userData.nome,
            telefone: userData.telefone
          }
        }
      });

      if (authError) {
        console.error('Erro no registro Auth:', authError);
        return false;
      }

      // Criar usuário na tabela usuarios
      if (authData.user) {
        const newUser: Usuario = {
          id: authData.user.id,
          nome: userData.nome,
          email: userData.email,
          telefone: userData.telefone,
          tipo: 'novo'
        };

        const { error: dbError } = await supabase
          .from('usuarios')
          .insert([newUser]);

        if (dbError) {
          console.error('Erro ao salvar no banco:', dbError);
          // Se falhar ao salvar na tabela, tentar deletar do Auth
          await supabase.auth.signOut();
          return false;
        }

        setUser(newUser);
      }

      return true;
    } catch (error) {
      console.error('Erro no registro:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};