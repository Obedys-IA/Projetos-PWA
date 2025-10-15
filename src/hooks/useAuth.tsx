import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulação de login - substituir com Supabase auth
    const adminEmails = [
      'obedys.ia@gmail.com',
      'adm.salvador@frutasdocemel.com.br',
      'obedysjunio@gmail.com',
      'obedysgois@gmail.com',
      'eujunio13@gmail.com'
    ];

    try {
      // Simulação de verificação de credenciais
      if (email && password.length >= 8) {
        const userData: Usuario = {
          id: Math.random().toString(),
          nome: email.split('@')[0],
          email,
          tipo: adminEmails.includes(email) ? 'administrador' : 'colaborador'
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Erro no login:', error);
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (userData: Omit<Usuario, 'id'> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Validação da senha
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(userData.password)) {
        setIsLoading(false);
        return false;
      }

      // Simulação de registro
      const newUser: Usuario = {
        ...userData,
        id: Math.random().toString(),
        tipo: 'novo'
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Erro no registro:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};