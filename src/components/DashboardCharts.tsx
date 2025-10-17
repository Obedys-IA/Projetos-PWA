import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { NotaFiscal, STATUS_CORES } from '../types';

interface DashboardChartsProps {
  dados: NotaFiscal[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ dados }) => {
  
  const dadosProcessados = useMemo(() => {
    if (!dados || dados.length === 0) {
      return {
        dadosEvolucao: [],
        dadosStatus: [],
        dadosFretistas: [],
        dadosClientes: []
      };
    }

    // 1. Evolução Temporal (últimos 6 meses)
    const agora = new Date();
    const meses = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      return {
        name: d.toLocaleString('pt-BR', { month: 'short' }),
        ano: d.getFullYear(),
        Recebidos: 0,
        Pendentes: 0,
        Cancelados: 0,
      };
    }).reverse();

    dados.forEach(nota => {
      const dataEmissao = new Date(nota.dataEmissao);
      const mesIndex = meses.findIndex(m => 
        m.name.toLowerCase() === dataEmissao.toLocaleString('pt-BR', { month: 'short' }).toLowerCase() &&
        m.ano === dataEmissao.getFullYear()
      );
      if (mesIndex !== -1) {
        if (nota.status === 'Entregue') meses[mesIndex].Recebidos++;
        else if (nota.status === 'Pendente') meses[mesIndex].Pendentes++;
        else if (nota.status === 'Cancelada') meses[mesIndex].Cancelados++;
      }
    });

    // 2. Distribuição por Status
    const statusCounts = dados.reduce((acc, nota) => {
      acc[nota.status] = (acc[nota.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dadosStatus = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_CORES[name as keyof typeof STATUS_CORES] || '#808080'
    }));

    // 3. Notas Pendentes por Fretista (Top 5)
    const fretistaCounts = dados
      .filter(n => n.status === 'Pendente' && n.fretista)
      .reduce((acc, nota) => {
        acc[nota.fretista] = (acc[nota.fretista] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const dadosFretistas = Object.entries(fretistaCounts)
      .map(([fretista, pendentes]) => ({ fretista, pendentes }))
      .sort((a, b) => b.pendentes - a.pendentes)
      .slice(0, 5);

    // 4. Top 10 Clientes com mais notas Pendentes
    const clienteCounts = dados
      .filter(n => n.status === 'Pendente' && n.nomeFantasia)
      .reduce((acc, nota) => {
        acc[nota.nomeFantasia] = (acc[nota.nomeFantasia] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const dadosClientes = Object.entries(clienteCounts)
      .map(([cliente, pendentes]) => ({ cliente, pendentes }))
      .sort((a, b) => b.pendentes - a.pendentes)
      .slice(0, 10);

    return {
      dadosEvolucao: meses,
      dadosStatus,
      dadosFretistas,
      dadosClientes
    };
  }, [dados]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Evolução Temporal (Últimos 6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosProcessados.dadosEvolucao}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Recebidos" fill="#10b981" name="Recebidos" />
              <Bar dataKey="Pendentes" fill="#ef4444" name="Pendentes" />
              <Bar dataKey="Cancelados" fill="#374151" name="Cancelados" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosProcessados.dadosStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
              >
                {dadosProcessados.dadosStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} (${((value as number / dados.length) * 100).toFixed(1)}%)`, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {dadosProcessados.dadosStatus.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top 5 Fretistas com Notas Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosProcessados.dadosFretistas} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="fretista" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="pendentes" fill="#ef4444" name="Pendentes" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Clientes com Notas Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosProcessados.dadosClientes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cliente" angle={-45} textAnchor="end" height={80} interval={0} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="pendentes" stroke="#f97316" strokeWidth={2} name="Pendentes" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
