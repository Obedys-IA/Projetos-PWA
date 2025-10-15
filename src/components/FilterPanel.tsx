import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw } from 'lucide-react';
import { Filtros } from '../types';
import { clientesData } from '../data/clientes';
import { fretistasData } from '../data/fretistas';

interface FilterPanelProps {
  filtros: Filtros;
  onFiltrosChange: (filtros: Filtros) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filtros, onFiltrosChange }) => {
  
  const limparFiltros = () => {
    onFiltrosChange({
      busca: '',
      periodoPredefinido: 'mes-atual'
    });
  };

  const updateFiltro = (key: keyof Filtros, value: string) => {
    onFiltrosChange({
      ...filtros,
      [key]: value
    });
  };

  const redesUnicas: string[] = Array.from(new Set(clientesData.map(c => c.rede)));
  const vendedoresUnicos: string[] = Array.from(new Set(clientesData.map(c => c.vendedor)));
  const ufsUnicas: string[] = Array.from(new Set(clientesData.map(c => c.uf)));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <Button variant="outline" size="sm" onClick={limparFiltros}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro Dinâmico */}
          <div className="space-y-2">
            <Label htmlFor="busca">Busca Rápida</Label>
            <Input
              id="busca"
              placeholder="Digite qualquer informação..."
              value={filtros.busca}
              onChange={(e) => updateFiltro('busca', e.target.value)}
            />
          </div>

          {/* Período Predefinido */}
          <div className="space-y-2">
            <Label>Período</Label>
            <Select value={filtros.periodoPredefinido} onValueChange={(value) => updateFiltro('periodoPredefinido', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dia-atual">Dia Atual</SelectItem>
                <SelectItem value="dia-anterior">Dia Anterior</SelectItem>
                <SelectItem value="semana-atual">Semana Atual</SelectItem>
                <SelectItem value="semana-anterior">Semana Anterior</SelectItem>
                <SelectItem value="mes-atual">Mês Atual</SelectItem>
                <SelectItem value="mes-anterior">Mês Anterior</SelectItem>
                <SelectItem value="ano-atual">Ano Atual</SelectItem>
                <SelectItem value="ano-anterior">Ano Anterior</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fretista */}
          <div className="space-y-2">
            <Label>Fretista</Label>
            <Select value={filtros.fretista} onValueChange={(value) => updateFiltro('fretista', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {fretistasData.map((fretista) => (
                  <SelectItem key={fretista.placa} value={fretista.nome}>
                    {fretista.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={filtros.cliente} onValueChange={(value) => updateFiltro('cliente', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {clientesData.map((cliente) => (
                  <SelectItem key={cliente.cnpj} value={cliente.nomeFantasia}>
                    {cliente.nomeFantasia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rede */}
          <div className="space-y-2">
            <Label>Rede</Label>
            <Select value={filtros.rede} onValueChange={(value) => updateFiltro('rede', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {redesUnicas.map((rede) => (
                  <SelectItem key={rede} value={rede}>
                    {rede}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vendedor */}
          <div className="space-y-2">
            <Label>Vendedor</Label>
            <Select value={filtros.vendedor} onValueChange={(value) => updateFiltro('vendedor', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {vendedoresUnicos.map((vendedor) => (
                  <SelectItem key={vendedor} value={vendedor}>
                    {vendedor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* UF */}
          <div className="space-y-2">
            <Label>UF</Label>
            <Select value={filtros.uf} onValueChange={(value) => updateFiltro('uf', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {ufsUnicas.map((uf) => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filtros.status} onValueChange={(value) => updateFiltro('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Entregue">Entregue</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
                <SelectItem value="Devolvida">Devolvida</SelectItem>
                <SelectItem value="Reenviada">Reenviada</SelectItem>
                <SelectItem value="Paga">Paga</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};