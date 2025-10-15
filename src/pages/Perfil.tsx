import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FilterPanel } from '../components/FilterPanel';
import { Filtros } from '../types';
import { useAuth } from '../hooks/useAuth';
import { 
  User, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';

const Perfil: React.FC = () => {
  const { user } = useAuth();
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    periodoPredefinido: 'mes-atual'
  });

  // Dados mock - substituir com dados reais do Supabase
  const dadosMock = [
    {
      id: '1',
      numeroNF: '123456',
      cliente: 'Assai Juazeiro',
      dataEmissao: '2024-10-02',
      valor: 12558.00,
      diasAtraso: 12,
      diasVencer: 10,
      status: 'Pendente'
    },
    {
      id: '2',
      numeroNF: '123457',
      cliente: 'GBarbosa Centro',
      dataEmissao: '2024-10-01',
      valor: 8750.50,
      diasAtraso: 0,
      diasVencer: 7,
      status: 'Pendente'
    }
  ];

  const dadosFiltrados = useMemo(() => {
    return dadosMock.filter(item => {
      // Implementar lógica de filtros aqui
      return true;
    });
  }, [dadosMock, filtros]);

  const calcularEstatisticas = () => {
    const total = dadosFiltrados.length;
    const entregues = dadosFiltrados.filter(n => n.status === 'Entregue').length;
    const pendentes = dadosFiltrados.filter(n => n.status === 'Pendente').length;
    const canceladas = dadosFiltrados.filter(n => n.status === 'Cancelada').length;
    const devolvidas = dadosFiltrados.filter(n => n.status === 'Devolvida').length;

    return {
      total,
      entregues,
      pendentes,
      canceladas,
      devolvidas,
      eficiencia: total > 0 ? ((entregues / total) * 100).toFixed(1) : '0'
    };
  };

  const estatisticas = calcularEstatisticas();

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const canhotosAntigos = dadosFiltrados
    .filter(n => n.status === 'Pendente' && n.diasAtraso > 7)
    .slice(0, 5);

  const vencimentosProximos = dadosFiltrados
    .filter(n => n.status === 'Pendente' && n.diasVencer <= 10)
    .sort((a, b) => a.diasVencer - b.diasVencer)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Meu Perfil</h1>
        <p className="text-gray-600">Visualize suas informações e desempenho</p>
      </div>

      {/* Informações do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-medium">
              {user?.nome?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{user?.nome}</h3>
              <p className="text-gray-600">{user?.email}</p>
              <Badge variant="outline" className="mt-1">
                Tipo: {user?.tipo}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Estatísticos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-800">{estatisticas.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                📊
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Entregues</p>
                <p className="text-2xl font-bold text-green-600">{estatisticas.entregues}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-red-600">{estatisticas.pendentes}</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Canceladas</p>
                <p className="text-2xl font-bold text-gray-800">{estatisticas.canceladas}</p>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white">
                <XCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eficiência</p>
                <p className="text-2xl font-bold text-orange-600">{estatisticas.eficiencia}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <FilterPanel filtros={filtros} onFiltrosChange={setFiltros} />

      {/* Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {canhotosAntigos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Canhotos Mais Antigos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {canhotosAntigos.map((item) => (
                  <Alert key={item.id} className="border-red-200">
                    <AlertDescription>
                      <div className="flex justify-between items-center">
                        <span>
                          <strong>NF {item.numeroNF}</strong> - {item.cliente}
                        </span>
                        <Badge variant="destructive">
                          {item.diasAtraso} dias
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Emissão: {formatarData(item.dataEmissao)} | Valor: {formatarValor(item.valor)}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {vencimentosProximos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Clock className="h-5 w-5" />
                Vencimentos Próximos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {vencimentosProximos.map((item) => (
                  <Alert key={item.id} className="border-orange-200">
                    <AlertDescription>
                      <div className="flex justify-between items-center">
                        <span>
                          <strong>NF {item.numeroNF}</strong> - {item.cliente}
                        </span>
                        <Badge variant="secondary">
                          {item.diasVencer} dias
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Emissão: {formatarData(item.dataEmissao)} | Valor: {formatarValor(item.valor)}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabela de Notas Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle>
            Notas Pendentes ({dadosFiltrados.filter(n => n.status === 'Pendente').length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NF</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data Emissão</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Dias Atraso</TableHead>
                <TableHead>Dias p/ Vencer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dadosFiltrados
                .filter(n => n.status === 'Pendente')
                .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.numeroNF}</TableCell>
                    <TableCell>{item.cliente}</TableCell>
                    <TableCell>{formatarData(item.dataEmissao)}</TableCell>
                    <TableCell>{formatarValor(item.valor)}</TableCell>
                    <TableCell>
                      <Badge variant={item.diasAtraso > 7 ? 'destructive' : 'secondary'}>
                        {item.diasAtraso}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.diasVencer <= 3 ? 'destructive' : 'secondary'}>
                        {item.diasVencer}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Perfil;