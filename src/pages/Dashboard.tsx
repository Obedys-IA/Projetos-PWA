import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Filter, RefreshCw } from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { FilterPanel } from '../components/FilterPanel';
import { DashboardCharts } from '../components/DashboardCharts';
import { VencimentosProximosTable } from '../components/VencimentosProximosTable';
import { NotaFiscal, Filtros } from '../types';
import { clientesData } from '../data/clientes';
import { fretistasData } from '../data/fretistas';

const Dashboard: React.FC = () => {
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    periodoPredefinido: 'mes-atual'
  });

  // Dados mock - substituir com dados reais do Supabase
  const dadosMock: NotaFiscal[] = [
    {
      id: '1',
      dataEmissao: '2024-10-02',
      horaSaida: '14:30',
      numeroNF: '123456',
      nomeFantasia: 'Assai Juazeiro',
      rede: 'Assai',
      uf: 'BA',
      vendedor: 'Antonio',
      placaVeiculo: 'BRY9A41',
      fretista: 'Anderson',
      valorNota: 12558.00,
      dataVencimento: '2024-10-24',
      situacao: 'Vencimento Próximo',
      status: 'Pendente',
      diasAtraso: 12,
      diasVencer: 10,
      usuarioRegistro: 'João Silva',
      dataRegistro: '2024-10-14',
      horaRegistro: '09:15'
    }
  ];

  const dadosFiltrados = useMemo(() => {
    return dadosMock.filter(nota => {
      // Implementar lógica de filtros aqui
      return true;
    });
  }, [dadosMock, filtros]);

  const calcularKPIs = () => {
    const total = dadosFiltrados.length;
    const entregues = dadosFiltrados.filter(n => n.status === 'Entregue').length;
    const pendentes = dadosFiltrados.filter(n => n.status === 'Pendente').length;
    const canceladas = dadosFiltrados.filter(n => n.status === 'Cancelada').length;
    const devolvidas = dadosFiltrados.filter(n => n.status === 'Devolvida').length;
    const eficiencia = total > 0 ? ((entregues / total) * 100).toFixed(1) : '0';
    const valorPendente = dadosFiltrados
      .filter(n => n.status === 'Pendente')
      .reduce((sum, n) => sum + n.valorNota, 0);
    const atrasadas = dadosFiltrados.filter(n => n.status === 'Pendente' && n.diasAtraso > 7).length;

    return {
      total,
      entregues,
      pendentes,
      canceladas,
      devolvidas,
      eficiencia,
      valorPendente,
      atrasadas
    };
  };

  const kpis = calcularKPIs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Visão geral das notas fiscais</p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <FilterPanel filtros={filtros} onFiltrosChange={setFiltros} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total de NF"
          value={kpis.total}
          icon="🔵"
          color="bg-blue-500"
        />
        <KPICard
          title="NF Entregue"
          value={kpis.entregues}
          icon="🟢"
          color="bg-green-500"
        />
        <KPICard
          title="NF Pendente"
          value={kpis.pendentes}
          icon="🔴"
          color="bg-red-500"
        />
        <KPICard
          title="NF Cancelada"
          value={kpis.canceladas}
          icon="⚫"
          color="bg-gray-800"
        />
        <KPICard
          title="NF Devolvida"
          value={kpis.devolvidas}
          icon="🟣"
          color="bg-purple-500"
        />
        <KPICard
          title="Eficiência"
          value={`${kpis.eficiencia}%`}
          icon="📊"
          color="bg-orange-500"
        />
        <KPICard
          title="Valor Pendente"
          value={`R$ ${kpis.valorPendente.toFixed(0)}K`}
          icon="💰"
          color="bg-yellow-500"
        />
        <KPICard
          title="Atrasadas (+7d)"
          value={kpis.atrasadas}
          icon="⏱️"
          color="bg-red-600"
        />
      </div>

      {/* Gráficos */}
      <DashboardCharts dados={dadosFiltrados} />

      {/* Tabela de Vencimentos Próximos */}
      <VencimentosProximosTable dados={dadosFiltrados} />
    </div>
  );
};

export default Dashboard;