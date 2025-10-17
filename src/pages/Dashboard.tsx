import React, { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KPICard } from '../components/KPICard';
import { FilterPanel } from '../components/FilterPanel';
import { DashboardCharts } from '../components/DashboardCharts';
import { VencimentosProximosTable } from '../components/VencimentosProximosTable';
import { Filtros } from '../types';
import { useNotasFiscais } from '../hooks/useNotasFiscais';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard: React.FC = () => {
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    periodoPredefinido: 'mes-atual'
  });

  const { notas, isLoading, isError, refetch } = useNotasFiscais(filtros);

  const kpis = useMemo(() => {
    if (!notas) return {
      total: 0, entregues: 0, pendentes: 0, canceladas: 0, devolvidas: 0,
      eficiencia: '0', valorPendente: '0.0', atrasadas: 0
    };

    const total = notas.length;
    const entregues = notas.filter(n => n.status === 'Entregue').length;
    const pendentes = notas.filter(n => n.status === 'Pendente').length;
    const canceladas = notas.filter(n => n.status === 'Cancelada').length;
    const devolvidas = notas.filter(n => n.status === 'Devolvida').length;
    const eficiencia = total > 0 ? ((entregues / total) * 100) : 0;
    const valorPendente = notas
      .filter(n => n.status === 'Pendente')
      .reduce((sum, n) => sum + n.valorNota, 0);
    const atrasadas = notas.filter(n => n.status === 'Pendente' && n.diasAtraso > 7).length;

    return {
      total,
      entregues,
      pendentes,
      canceladas,
      devolvidas,
      eficiencia: eficiencia.toFixed(0),
      valorPendente: (valorPendente / 1000).toFixed(1),
      atrasadas
    };
  }, [notas]);

  if (isError) {
    return <div className="text-red-500 text-center p-4">Erro ao carregar os dados do dashboard. Tente atualizar a página.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Visão geral das notas fiscais</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <FilterPanel filtros={filtros} onFiltrosChange={setFiltros} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total de NF" value={kpis.total} icon="🔵" color="bg-blue-500" />
          <KPICard title="NF Entregue" value={kpis.entregues} icon="🟢" color="bg-green-500" />
          <KPICard title="NF Pendente" value={kpis.pendentes} icon="🔴" color="bg-red-500" />
          <KPICard title="NF Cancelada" value={kpis.canceladas} icon="⚫" color="bg-gray-800 dark:bg-gray-600" />
          <KPICard title="NF Devolvida" value={kpis.devolvidas} icon="🟣" color="bg-purple-500" />
          <KPICard title="Eficiência" value={`${kpis.eficiencia}%`} icon="📊" color="bg-orange-500" />
          <KPICard title="Valor Pendente" value={`R$${kpis.valorPendente}K`} icon="💰" color="bg-yellow-500" />
          <KPICard title="Atrasadas (+7d)" value={kpis.atrasadas} icon="⏱️" color="bg-red-600" />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : <DashboardCharts dados={notas} />}
      
      {isLoading ? <Skeleton className="h-96 w-full" /> : <VencimentosProximosTable dados={notas} />}
    </div>
  );
};

export default Dashboard;
