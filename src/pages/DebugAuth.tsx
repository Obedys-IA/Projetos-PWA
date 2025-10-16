import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const DebugAuth: React.FC = () => {
  const { user, isLoading } = useAuth();

  React.useEffect(() => {
    const checkAuthState = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Debug - Session:', session);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();
        console.log('Debug - Profile:', profile);
      }
    };
    
    checkAuthState();
  }, []);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Debug de Autenticação</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado do Usuário (useAuth)</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-4">
                <div>
                  <strong>ID:</strong> {user.id}
                </div>
                <div>
                  <strong>Nome:</strong> {user.nome}
                </div>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>Tipo:</strong> 
                  <Badge variant={user.tipo === 'administrador' ? 'destructive' : 'secondary'} className="ml-2">
                    {user.tipo}
                  </Badge>
                </div>
                <div>
                  <strong>Telefone:</strong> {user.telefone || 'Não informado'}
                </div>
              </div>
            ) : (
              <p>Nenhum usuário logado</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sessão do Supabase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Loading:</strong> {isLoading ? 'Sim' : 'Não'}
              </div>
              <div>
                <strong>User Object:</strong>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DebugAuth;