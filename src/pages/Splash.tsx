import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Splash: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        switch (user.tipo) {
          case 'administrador':
            navigate('/registros');
            break;
          case 'colaborador':
            navigate('/registros');
            break;
          case 'fretista':
            navigate('/perfil');
            break;
          case 'gerencia':
            navigate('/dashboard');
            break;
          case 'novo':
            navigate('/perfil');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        navigate('/login');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-orange-500">
      <div className="text-center">
        <img src="/splashcanhotos.png" alt="CHECKNF - GDM" className="h-32 mx-auto mb-6" />
        <div className="text-white">
          <h1 className="text-3xl font-bold mb-2">CHECKNF - GDM</h1>
          <p className="text-lg opacity-90">Sistema de Gestão de Notas Fiscais</p>
        </div>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Splash;