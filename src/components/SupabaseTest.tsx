import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Database, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNotasFiscais } from '@/hooks/useNotasFiscais';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useClientes } from '@/hooks/useClientes';
import { useFretistas } from '@/hooks/useFretistas';
import { useHistorico } from '@/hooks/useHistorico';

export const SupabaseTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const { notas, loading: notasLoading, error: notasError } = useNotasFiscais();
  const { usuarios, loading: usuariosLoading, error: usuariosError } = useUsuarios();
  const { clientes, loading: clientesLoading, error: clientesError } = useClientes();
  const { fretistas, loading: fretistasLoading, error: fretistasError } = useFretistas();
  const { getHistorico } = useHistorico();

  const runTests = async () => {
    setIsRunning(true);
    const results = [];

    // Teste 1: Conexão com Supabase
    try {
      const { data, error } = await supabase.from('usuarios').select('count').single();
      results.push({
        test: 'Conexão Supabase',
        status: error ? 'error' : 'success',
        message: error?.message || 'Conectado com sucesso',
        data: data
      });
    } catch (error) {
      results.push({
        test: 'Conexão Supabase',
        status: 'error',
        message: error.message
      });
    }

    // Teste 2: Carregar usuários
    try {
      const count = usuarios.length;
      results.push({
        test: 'Carregar Usuários',
        status: usuariosError ? 'error' : 'success',
        message: usuariosError ? `${usuariosError}` : `${count} usuários carregados`,
        data: { count }
      });
    } catch (error) {
      results.push({
        test: 'Carregar Usuários',
        status: 'error',
        message: (error as Error).message
      });
    }

    // Teste 3: Carregar clientes
    try {
      const count = clientes.length;
      results.push({
        test: 'Carregar Clientes',
        status: clientesError ? 'error' : 'success',
        message: clientesError ? `${clientesError}` : `${count} clientes carregados`,
        data: { count }
      });
    } catch (error) {
      results.push({
        test: 'Carregar Clientes',
        status: 'error',
        message: (error as Error).message
      });
    }

    // Teste 4: Carregar fretistas
    try {
      const count = fretistas.length;
      results.push({
        test: 'Carregar Fretistas',
        status: fretistasError ? 'error' : 'success',
        message: fretistasError ? `${fretistasError}` : `${count} fretistas carregados`,
        data: { count }
      });
    } catch (error) {
      results.push({
        test: 'Carregar Fretistas',
        status: 'error',
        message: (error as Error).message
      });
    }

    // Teste 5: Carregar notas fiscais
    try {
      const count = notas.length;
      results.push({
        test: 'Carregar Notas Fiscais',
        status: notasError ? 'error' : 'success',
        message: notasError ? `${notasError}` : `${count} notas carregadas`,
        data: { count }
      });
    } catch (error) {
      results.push({
        test: 'Carregar Notas Fiscais',
        status: 'error',
        message: (error as Error).message
      });
    }

    // Teste 6: Carregar histórico
    try {
      const historico = await getHistorico();
      results.push({
        test: 'Carregar Histórico',
        status: 'success',
        message: `${historico.length} registros de histórico`,
        data: { count: historico.length }
      });
    } catch (error) {
      results.push({
        test: 'Carregar Histórico',
        status: 'error',
        message: (error as Error).message
      });
    }

    // Teste 7: Inserir nota fiscal
    try {
      const { data, error } = await supabase
        .from('notas_fiscais')
        .insert({
          data_emissao: new Date().toISOString().split('T')[0],
          numero_nf: 'TEST-' + Date.now(),
          nome_fantasia: 'Cliente Teste',
          fretista: 'Fretista Teste',
          valor_nota: 1000.00,
          data_vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          usuario_registro: 'test@example.com'
        })
        .select()
        .single();

      results.push({
        test: 'Inserir Nota Fiscal',
        status: error ? 'error' : 'success',
        message: error?.message || 'Nota inserida com sucesso',
        data: data
      });
    } catch (error) {
      results.push({
        test: 'Inserir Nota Fiscal',
        status: 'error',
        message: (error as Error).message
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-4 h-4 mr-1" />Sucesso</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-4 h-4 mr-1" />Erro</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconhecido</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Teste de Conexão Supabase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Status da Conexão</h3>
            {testResults.length > 0 && getStatusBadge(testResults[0]?.status)}
          </div>
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Testando...' : 'Rodar Testes'}
          </Button>
        </div>

        {/* Resultados dos Testes */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusBadge(result.status)}
                  <span className="font-medium">{result.test}</span>
                </div>
                <span className="text-sm text-gray-600">{result.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Status dos Dados */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{usuarios.length}</p>
                <p className="text-sm text-gray-600">Usuários</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{clientes.length}</p>
                <p className="text-sm text-gray-600">Clientes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{fretistas.length}</p>
                <p className="text-sm text-gray-600">Fretistas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{notas.length}</p>
                <p className="text-sm text-gray-600">Notas Fiscais</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
