import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedTypes?: string[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedTypes = [], 
  redirectTo = '/login' 
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(user.tipo)) {
    const getSafeRedirectPath = () => {
      switch (user.tipo) {
        case 'fretista':
        case 'novo':
          return '/perfil';
        case 'administrador':
        case 'colaborador':
          return '/registros';
        case 'gerencia':
          return '/dashboard';
        default:
          return '/login';
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Acesso Negado</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
            Seu tipo de usuário é: <span className="font-semibold text-gray-700 dark:text-gray-300">{user.tipo}</span>
          </p>
          <Link to={getSafeRedirectPath()}>
            <Button className="bg-gradient-to-r from-green-500 to-orange-500 text-white hover:shadow-lg hover:opacity-90 transition-all">
              <Home className="h-4 w-4 mr-2" />
              Voltar para a Página Inicial
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
