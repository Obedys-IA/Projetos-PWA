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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-600 via-orange-500 to-green-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-orange-500/20 to-green-600/20 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse" />
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-transparent via-white/10 to-transparent transform skew-x-12 animate-pulse" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-orange-400 rounded-3xl blur opacity-75 group-hover:opacity-100 animate-pulse" />
            <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
              <img 
                src="/splashcanhotos.png" 
                alt="CHECKNF - GDM" 
                className="h-32 w-auto drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                style={{ 
                  maxHeight: 'clamp(120px, 15vh, 160px)', 
                  width: 'auto',
                  maxWidth: '100%'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<h1 class="text-4xl md:text-6xl font-bold text-white mb-2 animate-pulse">CHECKNF - GDM</h1>';
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="text-white space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-2xl animate-fade-in-up">
            CHECKNF - GDM
          </h1>
          <p className="text-lg md:text-xl text-white/90 drop-shadow-lg animate-fade-in-up animation-delay-200">
            Sistema de Gestão de Notas Fiscais
          </p>
          <p className="text-sm md:text-base text-white/70 drop-shadow animate-fade-in-up animation-delay-400">
            Gerenciamento inteligente e eficiente para seu negócio
          </p>
        </div>
        
        <div className="mt-12 animate-fade-in-up animation-delay-600">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-orange-400 rounded-full blur-xl opacity-75 animate-pulse" />
            <div className="relative w-12 h-12 md:w-16 md:h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          </div>
          <p className="text-white/70 text-sm md:text-base mt-4 animate-pulse">
            Carregando seu sistema...
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent" />
      <div className="absolute top-20 left-10 w-20 h-20 bg-green-400/20 rounded-full blur-2xl animate-bounce" />
      <div className="absolute top-40 right-10 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl animate-bounce animation-delay-1000" />
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-bounce animation-delay-2000" />
    </div>
  );
};

export default Splash;