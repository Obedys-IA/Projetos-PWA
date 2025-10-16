import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Filter, RotateCw, Plus } from 'lucide-react';
import { Filtros } from '../types';
import { useClientes } from '../hooks/useClientes';
import { useFretistas } from '../hooks/useFretistas';

interface FilterPanelProps {
  filtros: Filtros;
  onFiltrosChange: (filtros: Filtros) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filtros, onFiltrosChange }) => {
  const { clientes } = useClientes();
  const { fretistas } = useFretistas();
  const [isOtherClientOpen, setIsOtherClientOpen] = useState(false);
  const [isOtherFretistaOpen, setIsOtherFretistaOpen] = useState(false);
  const [otherClientData, setOtherClientData] = useState({
    nomeFantasia: '',
    razaoSocial: '',
    cnpj: '',
    rede: '',
    uf: '',
    vendedor: ''
  });
  const [otherFretistaData, setOtherFretistaData] = useState({
    placa: '',
    nome: ''
  });

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

  const handleAddOtherClient = () => {
    if (otherClientData.nomeFantasia) {
      updateFiltro('cliente', otherClientData.nomeFantasia);
      setIsOtherClientOpen(false);
      setOtherClientData({
        nomeFantasia: '',
        razaoSocial: '',
        cnpj: '',
        rede: '',
        uf: '',
        vendedor: ''
      });
    }
  };

  const handleAddOtherFretista = () => {
    if (otherFretistaData.placa && otherFretistaData.nome) {
      updateFiltro('fretista', otherFretistaData.nome);
      setIsOtherFretistaOpen(false);
      setOtherFretistaData({
        placa: '',
        nome: ''
      });
    }
  };

  const redesUnicas = Array.from(new Set(clientes.map(c => c.rede).filter(Boolean)));
  const vendedoresUnicos = Array.from(new Set(clientes.map(c => c.vendedor).filter(Boolean)));
  const ufsUnicas = Array.from(new Set(clientes.map(c => c.uf).filter(Boolean)));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <Button variant="outline" size="sm" onClick={limparFiltros}>
            <RotateCw className="h-4 w-4 mr-2" />
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
            <Select value={filtros.fretista || 'all'} onValueChange={(value) => {
              if (value === 'other') {
                setIsOtherFretistaOpen(true);
              } else {
                updateFiltro('fretista', value === 'all' ? '' : value);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {fretistas.map((fretista) => (
                  <SelectItem key={fretista.placa} value={fretista.nome}>
                    {fretista.nome}
                  </SelectItem>
                ))}
                <SelectItem value="other">
                  <Plus className="h-4 w-4 mr-2 inline" />
                  Outro (digitar)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={filtros.cliente || 'all'} onValueChange={(value) => {
              if (value === 'other') {
                setIsOtherClientOpen(true);
              } else {
                updateFiltro('cliente', value === 'all' ? '' : value);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.cnpj} value={cliente.nomeFantasia}>
                    {cliente.nomeFantasia}
                  </SelectItem>
                ))}
                <SelectItem value="other">
                  <Plus className="h-4 w-4 mr-2 inline" />
                  Outro (digitar)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rede */}
          <div className="space-y-2">
            <Label>Rede</Label>
            <Select value={filtros.rede || 'all'} onValueChange={(value) => updateFiltro('rede', value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
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
            <Select value={filtros.vendedor || 'all'} onValueChange={(value) => updateFiltro('vendedor', value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
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
            <Select value={filtros.uf || 'all'} onValueChange={(value) => updateFiltro('uf', value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
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
            <Select value={filtros.status || 'all'} onValueChange={(value) => updateFiltro('status', value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
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

      {/* Dialog para Outro Cliente */}
      <Dialog open={isOtherClientOpen} onOpenChange={setIsOtherClientOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cadastrar Cliente Manualmente</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="outro-nome-fantasia">Nome Fantasia *</Label>
              <Input
                id="outro-nome-fantasia"
                value={otherClientData.nomeFantasia}
                onChange={(e) => setOtherClientData(prev => ({ ...prev, nomeFantasia: e.target.value }))}
                placeholder="Nome fantasia do cliente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outro-razao-social">Razão Social</Label>
              <Input
                id="outro-razao-social"
                value={otherClientData.razaoSocial}
                onChange={(e) => setOtherClientData(prev => ({ ...prev, razaoSocial: e.target.value }))}
                placeholder="Razão social"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outro-cnpj">CNPJ</Label>
              <Input
                id="outro-cnpj"
                value={otherClientData.cnpj}
                onChange={(e) => setOtherClientData(prev => ({ ...prev, cnpj: e.target.value }))}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outro-rede">Rede</Label>
              <Input
                id="outro-rede"
                value={otherClientData.rede}
                onChange={(e) => setOtherClientData(prev => ({ ...prev, rede: e.target.value }))}
                placeholder="Rede do cliente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outro-uf">UF</Label>
              <Input
                id="outro-uf"
                value={otherClientData.uf}
                onChange={(e) => setOtherClientData(prev => ({ ...prev, uf: e.target.value }))}
                placeholder="BA"
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outro-vendedor">Vendedor</Label>
              <Input
                id="outro-vendedor"
                value={otherClientData.vendedor}
                onChange={(e) => setOtherClientData(prev => ({ ...prev, vendedor: e.target.value }))}
                placeholder="Nome do vendedor"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsOtherClientOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddOtherClient}>
              Adicionar e Filtrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para Outro Fretista */}
      <Dialog open={isOtherFretistaOpen} onOpenChange={setIsOtherFretistaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar Fretista Manualmente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="outro-placa">Placa *</Label>
              <Input
                id="outro-placa"
                value={otherFretistaData.placa}
                onChange={(e) => setOtherFretistaData(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                placeholder="ABC1234"
                maxLength={7}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outro-nome">Nome *</Label>
              <Input
                id="outro-nome"
                value={otherFretistaData.nome}
                onChange={(e) => setOtherFretistaData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome do fretista"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsOtherFretistaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddOtherFretista}>
              Adicionar e Filtrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};