import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { NotaFiscal } from '../types';

interface DashboardChartsProps {
  dados: NotaFiscal[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ dados }) => {
  
  // Dados para gráfico de barras - Evolução Temporal
  const dadosEvolucao = [
    { mes: 'Jan', recebidos: 120, pendentes: 30, cancelados: 10 },
    { mes: 'Fev', recebidos: 150, pendentes: 25, cancelados: 15 },
    { mes: 'Mar', recebidos: 180, pendentes: 35, cancelados: 12 },
    { mes: 'Abr', recebidos: 200, pendentes: 40, cancelados: 18 },
    { mes: 'Mai', recebidos: 170, pendentes: 28, cancelados: 14 },
    { mes: 'Jun', recebidos: 190, pendentes: 32, cancelados: 16 },
  ];

  // Dados para gráfico de pizza - Distribuição por Status
  const dadosStatus = [
    { name: 'Entregue', value: 960, color: '#10b981' },
    { name: 'Pendente', value: 180, color: '#ef4444' },
    { name: 'Cancelada', value: 60, color: '#000000' },
    { name: 'Devolvida', value: 60, color: '#8b5cf6' },
  ];

  // Dados para gráfico de linhas - Notas Pendentes por Fretista
  const dadosFretistas = [
    { fretista: 'Anderson', pendentes: 5 },
    { fretista: 'Danilo', pendentes: 8 },
    { fretista: 'Elvis', pendentes: 3 },
    { fretista: 'Gustavo', pendentes: 6 },
    { fretista: 'Paulo Noel', pendentes: 4 },
  ];

  // Dados para gráfico de linhas - Top 10 Clientes com mais notas Pendentes
  const dadosClientes = [
    { cliente: 'Assai Juazeiro', pendentes: 12 },
    { cliente: 'GBarbosa Centro', pendentes: 8 },
    { cliente: 'Atakarejo Alagoinha', pendentes: 6 },
    { cliente: 'Mateus Conceição', pendentes: 5 },
    { cliente: 'Hiperideal Barra', pendentes: 4 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Barras - Evolução Temporal */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Temporal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosEvolucao}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="recebidos" fill="#10b981" name="Recebidos" />
              <Bar dataKey="pendentes" fill="#ef4444" name="Pendentes" />
              <Bar dataKey="cancelados" fill="#000000" name="Cancelados" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza - Distribuição por Status */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {dadosStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {dadosStatus.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Linhas - Notas Pendentes por Fretista */}
      <Card>
        <CardHeader>
          <CardTitle>Notas Pendentes por Fretista</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosFretistas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fretista" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="pendentes" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Linhas - Top 10 Clientes com mais notas Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle>Top Clientes com Notas Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosClientes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cliente" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="pendentes" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};