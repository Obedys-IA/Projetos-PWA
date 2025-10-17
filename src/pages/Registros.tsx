import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Send, Eye, Filter, RotateCw } from 'lucide-react';
import { FilterPanel } from '../components/FilterPanel';
import { StatusBadge } from '../components/StatusBadge';
import { NotaFiscal, Filtros, STATUS_CORES } from '../types';
import { useNotasFiscais } from '../hooks/useNotasFiscais';
import { useClientes } from '../hooks/useClientes';
import { useFretistas } from '../hooks/useFretistas';
import { showSuccess, showError } from '../utils/toast';

const Registros: React.FC = () => {
  const { notas, loading, carregarNotas, criarNota, atualizarNota, excluirNota, excluirNotasEmLote } = useNotasFiscais();
  const { clientes } = useClientes();
  const { fretistas } = useFretistas();
  
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    periodoPredefinido: 'mes-atual'
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNota, setEditingNota] = useState<NotaFiscal | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Form state para nova nota
  const [newNota, setNewNota] = useState({
    numeroNF: '',
    dataEmissao: '',
    nomeFantasia: '',
    fretista: '',
    valorNota: 0,
    dataVencimento: '',
    observacao: ''
  });

  const dadosFiltrados = useMemo(() => {
    return notas.filter(nota => {
      // Implementar lógica de filtros aqui
      if (filtros.busca && !(
        nota.numeroNF.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        nota.nomeFantasia.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        nota.fretista.toLowerCase().includes(filtros.busca.toLowerCase())
      )) {
        return false;
      }
      
      if (filtros.cliente && nota.nomeFantasia !== filtros.cliente) {
        return false;
      }
      
      if (filtros.fretista && nota.fretista !== filtros.fretista) {
        return false;
      }
      
      if (filtros.status && nota.status !== filtros.status) {
        return false;
      }
      
      return true;
    });
  }, [notas, filtros]);

  const dadosOrdenados = useMemo(() => {
    const statusPriority = {
      'Pendente': 1,
      'Cancelada': 2,
      'Devolvida': 3,
      'Reenviada': 4,
      'Paga': 5,
      'Entregue': 6
    };

    return [...dadosFiltrados].sort((a, b) => {
      const priorityA = statusPriority[a.status as keyof typeof statusPriority] || 999;
      const priorityB = statusPriority[b.status as keyof typeof statusPriority] || 999;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      return new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime();
    });
  }, [dadosFiltrados]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return dadosOrdenados.slice(startIndex, startIndex + itemsPerPage);
  }, [dadosOrdenados, currentPage]);

  const totalPages = Math.ceil(dadosOrdenados.length / itemsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(paginatedData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      showError('Selecione pelo menos um item para excluir');
      return;
    }

    if (confirm(`Tem certeza que deseja excluir ${selectedItems.length} registro(s)?`)) {
      try {
        await excluirNotasEmLote(selectedItems);
        showSuccess(`${selectedItems.length} registro(s) excluído(s) com sucesso!`);
        setSelectedItems([]);
      } catch (error) {
        showError('Erro ao excluir registros');
      }
    }
  };

  const handleEditNota = (nota: NotaFiscal) => {
    setEditingNota(nota);
    setIsEditDialogOpen(true);
  };

  const handleStatusChange = async (notaId: string, newStatus: string) => {
    try {
      await atualizarNota(notaId, { status: newStatus as any });
      showSuccess('Status atualizado com sucesso!');
    } catch (error) {
      showError('Erro ao atualizar status');
    }
  };

  const handleSendWhatsApp = (nota: NotaFiscal) => {
    const message = `📌 RESUMO DA NF "${nota.numeroNF}" - 📅 ${new Date(nota.dataEmissao).toLocaleDateString('pt-BR')}

🚚 Fretista: "${nota.fretista}"
👥 Cliente: "${nota.nomeFantasia}"
💲 Valor: "R$${nota.valorNota.toFixed(2).replace('.', ',')}"
🚩 Status: "${nota.status}"
⏳ Dias em atraso: "${nota.diasAtraso}"
📝 Observação: "${nota.observacao || 'N/A'}"`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddNota = async () => {
    try {
      const selectedCliente = clientes.find(c => c.nomeFantasia === newNota.nomeFantasia);
      const selectedFretista = fretistas.find(f => f.nome === newNota.fretista);
      
      const now = new Date();
      const notaData = {
        ...newNota,
        status: 'Pendente' as const,
        situacao: 'Dentro do Prazo' as const,
        valorNota: parseFloat(newNota.valorNota.toString()),
        usuarioRegistro: 'usuario@exemplo.com',
        rede: selectedCliente?.rede || '',
        uf: selectedCliente?.uf || '',
        vendedor: selectedCliente?.vendedor || '',
        placaVeiculo: selectedFretista?.placa || '',
        horaSaida: '',
        arquivoUrl: '',
        usuarioEdicao: '',
        dataEdicao: '',
        horaEdicao: '',
        dataRegistro: now.toISOString().split('T')[0],
        horaRegistro: now.toTimeString().split(' ')[0].substring(0, 5)
      };
      
      await criarNota(notaData);
      showSuccess('Nota fiscal criada com sucesso!');
      setIsAddDialogOpen(false);
      setNewNota({
        numeroNF: '',
        dataEmissao: '',
        nomeFantasia: '',
        fretista: '',
        valorNota: 0,
        dataVencimento: '',
        observacao: ''
      });
      carregarNotas(filtros);
    } catch (error) {
      showError('Erro ao criar nota fiscal');
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
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
          <h1 className="text-3xl font-bold text-gray-800">Registros</h1>
          <p className="text-gray-600">Gerencie todas as notas fiscais</p>
        </div>
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Seleção ({selectedItems.length})
            </Button>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Incluir
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Incluir Novo Registro</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroNF">Número da NF</Label>
                  <Input 
                    id="numeroNF" 
                    placeholder="123456"
                    value={newNota.numeroNF}
                    onChange={(e) => setNewNota(prev => ({ ...prev, numeroNF: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataEmissao">Data de Emissão</Label>
                  <Input 
                    id="dataEmissao" 
                    type="date"
                    value={newNota.dataEmissao}
                    onChange={(e) => setNewNota(prev => ({ ...prev, dataEmissao: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select value={newNota.nomeFantasia} onValueChange={(value) => setNewNota(prev => ({ ...prev, nomeFantasia: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.cnpj} value={cliente.nomeFantasia}>
                          {cliente.nomeFantasia}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fretista">Fretista</Label>
                  <Select value={newNota.fretista} onValueChange={(value) => setNewNota(prev => ({ ...prev, fretista: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {fretistas.map((fretista) => (
                        <SelectItem key={fretista.placa} value={fretista.nome}>
                          {fretista.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor</Label>
                  <Input 
                    id="valor" 
                    type="number" 
                    step="0.01" 
                    placeholder="0,00"
                    value={newNota.valorNota}
                    onChange={(e) => setNewNota(prev => ({ ...prev, valorNota: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vencimento">Data de Vencimento</Label>
                  <Input 
                    id="vencimento" 
                    type="date"
                    value={newNota.dataVencimento}
                    onChange={(e) => setNewNota(prev => ({ ...prev, dataVencimento: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="observacao">Observação</Label>
                  <Textarea 
                    id="observacao" 
                    placeholder="Observações..."
                    value={newNota.observacao}
                    onChange={(e) => setNewNota(prev => ({ ...prev, observacao: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddNota}>
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <FilterPanel filtros={filtros} onFiltrosChange={setFiltros} />

      {/* Tabela de Registros */}
      <Card>
        <CardHeader>
          <CardTitle>
            Registros ({dadosFiltrados.length})
            <span className="text-sm font-normal text-gray-500 ml-2">
              Página {currentPage} de {totalPages}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Data Emissão</TableHead>
                  <TableHead>NF</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fretista</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Dias Atraso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((nota) => (
                  <TableRow key={nota.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedItems.includes(nota.id)}
                        onCheckedChange={(checked) => handleSelectItem(nota.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>{formatarData(nota.dataEmissao)}</TableCell>
                    <TableCell className="font-medium">{nota.numeroNF}</TableCell>
                    <TableCell>{nota.nomeFantasia}</TableCell>
                    <TableCell>{nota.fretista}</TableCell>
                    <TableCell>{formatarValor(nota.valorNota)}</TableCell>
                    <TableCell>
                      <button 
                        onClick={() => handleStatusChange(nota.id, nota.status)}
                        className="cursor-pointer"
                      >
                        <StatusBadge status={nota.status} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={nota.situacao === 'Vencimento Próximo' ? 'destructive' : 'secondary'}
                      >
                        {nota.situacao}
                      </Badge>
                    </TableCell>
                    <TableCell>{nota.diasAtraso}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditNota(nota)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleSendWhatsApp(nota)}>
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Mostrando {paginatedData.length} de {dadosFiltrados.length} registros
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Registros;
