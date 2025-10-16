import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(user.tipo)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Acesso Negado</h1>
          <p className="text-lg text-gray-600 mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-gray-500">
            Tipo de usuário: <span className="font-semibold">{user.tipo}</span>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};