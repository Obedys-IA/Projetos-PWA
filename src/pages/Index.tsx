import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SupabaseTest } from '@/components/SupabaseTest';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Verificar se há tokens de confirmação na URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      // Redirecionar para a página de login para processar a confirmação
      navigate(`/login?access_token=${accessToken}&refresh_token=${refreshToken}`);
      return;
    }

    // Fluxo normal de redirecionamento
    if (user) {
      navigate('/splash');
    } else {
      navigate('/login');
    }
  }, [navigate, user, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl">
        <SupabaseTest />
      </div>
    </div>
  );
};

export default Index;