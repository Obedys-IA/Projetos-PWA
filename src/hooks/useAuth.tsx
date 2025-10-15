import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: Usuario | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<Usuario, 'id'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    };

    getSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error);
        return;
      }

      if (data) {
        setUser(data);
      } else {
        // Se não encontrar perfil, buscar dados básicos do auth
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          const basicProfile: Usuario = {
            id: authData.user.id,
            nome: authData.user.user_metadata?.nome || authData.user.email?.split('@')[0] || '',
            email: authData.user.email || '',
            telefone: authData.user.user_metadata?.telefone,
            tipo: authData.user.user_metadata?.tipo || 'novo',
            fretistaAssociado: authData.user.user_metadata?.fretistaAssociado,
            placaAssociada: authData.user.user_metadata?.placaAssociada
          };
          setUser(basicProfile);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
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
        return false;
      }

      // Registrar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            nome: userData.nome,
            telefone: userData.telefone,
            tipo: userData.tipo,
            fretistaAssociado: userData.fretistaAssociado,
            placaAssociada: userData.placaAssociada
          }
        }
      });

      if (authError) {
        console.error('Erro no registro:', authError);
        return false;
      }

      // Se o registro foi bem-sucedido, criar perfil na tabela usuarios
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('usuarios')
          .insert([{
            id: authData.user.id,
            nome: userData.nome,
            email: userData.email,
            telefone: userData.telefone,
            tipo: userData.tipo,
            fretista_associado: userData.fretistaAssociado,
            placa_associada: userData.placaAssociada
          }]);

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          return false;
        }
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
      setSession(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const refreshUser = async () => {
    if (session?.user) {
      await fetchUserProfile(session.user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      login, 
      register, 
      logout, 
      isLoading, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};