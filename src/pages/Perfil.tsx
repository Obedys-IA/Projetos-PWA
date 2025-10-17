import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FilterPanel } from '../components/FilterPanel';
import { Filtros, NotaFiscal } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useNotasFiscais } from '../hooks/useNotasFiscais';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  XCircle,
  Package,
  RotateCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Perfil: React.FC = () => {
  const { user } = useAuth();
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    periodoPredefinido: 'mes-atual'
  });
  
  // Se o usuário for fretista, o hook já será filtrado pela RLS.
  // Se for admin/colaborador, ele pode filtrar por fretista, então passamos o filtro.
  const hookFiltros = useMemo(() => {
    if (user?.tipo === 'fretista') {
      return filtros;
    }
    return { ...filtros, fretista: user?.nome || '' };
  }, [filtros, user]);

  const { notas, isLoading, isError, refetch } = useNotasFiscais(hookFiltros);

  const estatisticas = useMemo(() => {
    if (!notas) return {
      total: 0, entregues: 0, pendentes: 0, canceladas: 0, devolvidas: 0, eficiencia: '0'
    };

    const total = notas.length;
    const entregues = notas.filter(n => n.status === 'Entregue').length;
    const pendentes = notas.filter(n => n.status === 'Pendente').length;
    const canceladas = notas.filter(n => n.status === 'Cancelada').length;
    const devolvidas = notas.filter(n => n.status === 'Devolvida').length;
    const eficiencia = total > 0 ? ((entregues / total) * 100).toFixed(0) : '0';

    return { total, entregues, pendentes, canceladas, devolvidas, eficiencia };
  }, [notas]);

  const canhotosAntigos = useMemo(() => 
    notas
      .filter(n => n.status === 'Pendente' && n.diasAtraso > 7)
      .sort((a, b) => b.diasAtraso - a.diasAtraso)
      .slice(0, 5),
  [notas]);

  const vencimentosProximos = useMemo(() => 
    notas
      .filter(n => n.status === 'Pendente' && n.diasVencer >= 0 && n.diasVencer <= 10)
      .sort((a, b) => a.diasVencer - b.diasVencer)
      .slice(0, 5),
  [notas]);
  
  const notasPendentes = useMemo(() => 
    notas.filter(n => n.status === 'Pendente'),
  [notas]);

  const formatarData = (data: string) => {
    if (!data) return '-';
    const date = new Date(data);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Ajuste de fuso horário
    return date.toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Meu Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400">Visualize suas informações e desempenho</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RotateCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
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
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Notas</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{estatisticas.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                  <Package className="h-6 w-6" />
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
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-red-600">{estatisticas.pendentes}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Canceladas</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{estatisticas.canceladas}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Eficiência</p>
                <p className="text-2xl font-bold text-orange-600">{estatisticas.eficiencia}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <FilterPanel 
        filtros={filtros} 
        onFiltrosChange={setFiltros} 
      />

      {/* Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? <Skeleton className="h-48 w-full" /> : canhotosAntigos.length > 0 && (
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
                          <strong>NF {item.numeroNF}</strong> - {item.nomeFantasia}
                        </span>
                        <Badge variant="destructive">
                          {item.diasAtraso} dias
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Emissão: {formatarData(item.dataEmissao)} | Valor: {formatarValor(item.valorNota)}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? <Skeleton className="h-48 w-full" /> : vencimentosProximos.length > 0 && (
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
                          <strong>NF {item.numeroNF}</strong> - {item.nomeFantasia}
                        </span>
                        <Badge variant="secondary" className="bg-orange-500 text-white">
                          {item.diasVencer} dias
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Emissão: {formatarData(item.dataEmissao)} | Valor: {formatarValor(item.valorNota)}
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
            Notas Pendentes ({notasPendentes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : isError ? (
            <div className="text-red-500 text-center">Erro ao carregar notas.</div>
          ) : notasPendentes.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Nenhuma nota pendente encontrada.</div>
          ) : (
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
                {notasPendentes.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.numeroNF}</TableCell>
                    <TableCell>{item.nomeFantasia}</TableCell>
                    <TableCell>{formatarData(item.dataEmissao)}</TableCell>
                    <TableCell>{formatarValor(item.valorNota)}</TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Perfil;
