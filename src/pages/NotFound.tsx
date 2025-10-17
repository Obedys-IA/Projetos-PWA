import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Página não encontrada</p>
        <Link to="/dashboard">
          <Button>
            <Home className="h-4 w-4 mr-2" />
            Voltar para o Início
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
