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
            navigate('/dashboard');
            break;
          case 'colaborador':
            navigate('/dashboard');
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
        {/* Logo splash com fallback */}
        <div className="flex items-center justify-center mb-6">
          <img 
            src="/splashcanhotos.png" 
            alt="CHECKNF - GDM" 
            className="h-32 w-auto"
            style={{ maxHeight: '128px', width: 'auto' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              // Fallback: mostrar texto se a imagem não carregar
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<h1 class="text-4xl font-bold text-white mb-2">CHECKNF - GDM</h1><p class="text-lg text-white opacity-90">Sistema de Gestão de Notas Fiscais</p>';
              }
            }}
          />
        </div>
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