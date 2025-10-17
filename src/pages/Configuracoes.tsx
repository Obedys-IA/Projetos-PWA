import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Users, 
  Building, 
  Truck, 
  History, 
  Plus, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  Database
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUsuarios } from '../hooks/useUsuarios';
import { useClientes } from '../hooks/useClientes';
import { useFretistas } from '../hooks/useFretistas';
import { Usuario, Cliente, Fretista } from '../types';
import { showSuccess, showError } from '../utils/toast';

const Configuracoes: React.FC = () => {
  const { user } = useAuth();
  const { usuarios, updateUsuario, deleteUsuario } = useUsuarios();
  const { clientes, createCliente, updateCliente, deleteCliente } = useClientes();
  const { fretistas, createFretista, updateFretista, deleteFretista } = useFretistas();
  
  const [historicoAcessos] = useState([]); // This should be fetched from Supabase

  // Estados para modais
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isFretistaDialogOpen, setIsFretistaDialogOpen] = useState(false);
  
  // Estados para edição
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [editingFretista, setEditingFretista] = useState<Fretista | null>(null);
  
  // Estados para novos itens
  const [newClient, setNewClient] = useState<Omit<Cliente, 'cnpj'> & { cnpj: string }>({
    razaoSocial: '',
    cnpj: '',
    nomeFantasia: '',
    rede: '',
    uf: '',
    vendedor: ''
  });
  
  const [newFretista, setNewFretista] = useState<Fretista>({
    placa: '',
    nome: ''
  });

  // Verificar se usuário é administrador
  if (user?.tipo !== 'administrador') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para acessar esta página. Apenas administradores podem visualizar as configurações.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      await updateUsuario({ id: editingUser.id, userData: editingUser });
      showSuccess('Usuário atualizado com sucesso!');
      setEditingUser(null);
    } catch (error) {
      showError('Erro ao atualizar usuário');
    }
  };

  const handleAddClient = async () => {
    try {
      await createCliente(newClient);
      showSuccess('Cliente adicionado com sucesso!');
      setIsClientDialogOpen(false);
      setNewClient({ razaoSocial: '', cnpj: '', nomeFantasia: '', rede: '', uf: '', vendedor: '' });
    } catch (error) {
      showError(`Erro ao adicionar cliente: ${(error as Error).message}`);
    }
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;
    
    try {
      await updateCliente({ cnpj: editingClient.cnpj, clienteData: editingClient });
      showSuccess('Cliente atualizado com sucesso!');
      setEditingClient(null);
    } catch (error) {
      showError('Erro ao atualizar cliente');
    }
  };

  const handleAddFretista = async () => {
    try {
      await createFretista(newFretista);
      showSuccess('Fretista adicionado com sucesso!');
      setIsFretistaDialogOpen(false);
      setNewFretista({ placa: '', nome: '' });
    } catch (error) {
      showError(`Erro ao adicionar fretista: ${(error as Error).message}`);
    }
  };

  const handleUpdateFretista = async () => {
    if (!editingFretista) return;
    
    try {
      await updateFretista({ placa: editingFretista.placa, fretistaData: editingFretista });
      showSuccess('Fretista atualizado com sucesso!');
      setEditingFretista(null);
    } catch (error) {
      showError('Erro ao atualizar fretista');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário? Esta ação é irreversível.')) {
      try {
        await deleteUsuario(userId);
        showSuccess('Usuário excluído com sucesso!');
      } catch (error) {
        showError(`Erro ao excluir usuário: ${(error as Error).message}`);
      }
    }
  };

  const handleDeleteClient = async (cnpj: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteCliente(cnpj);
        showSuccess('Cliente excluído com sucesso!');
      } catch (error) {
        showError('Erro ao excluir cliente');
      }
    }
  };

  const handleDeleteFretista = async (placa: string) => {
    if (confirm('Tem certeza que deseja excluir este fretista?')) {
      try {
        await deleteFretista(placa);
        showSuccess('Fretista excluído com sucesso!');
      } catch (error) {
        showError('Erro ao excluir fretista');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Configurações</h1>
        <p className="text-gray-600 dark:text-gray-400">Gerencie usuários, clientes e fretistas</p>
      </div>

      <Tabs defaultValue="usuarios" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="fretistas">Fretistas</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        {/* Aba Usuários */}
        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestão de Usuários
                </CardTitle>
                {/* O cadastro de usuários é feito pela tela de login */}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fretista Associado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{usuario.tipo}</Badge>
                      </TableCell>
                      <TableCell>{usuario.fretista_placa || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setEditingUser(usuario)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteUser(usuario.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Dialog de Edição de Usuário */}
          {editingUser && (
            <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Usuário</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-nome">Nome</Label>
                    <Input 
                      id="edit-nome"
                      value={editingUser.nome}
                      onChange={(e) => setEditingUser(prev => prev ? { ...prev, nome: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-tipo">Tipo</Label>
                    <Select value={editingUser.tipo} onValueChange={(value: any) => setEditingUser(prev => prev ? { ...prev, tipo: value } : null)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administrador">Administrador</SelectItem>
                        <SelectItem value="colaborador">Colaborador</SelectItem>
                        <SelectItem value="fretista">Fretista</SelectItem>
                        <SelectItem value="gerencia">Gerência</SelectItem>
                        <SelectItem value="novo">Novo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   {editingUser.tipo === 'fretista' && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-fretista-assoc">Associar Fretista</Label>
                      <Select value={editingUser.fretista_placa || ''} onValueChange={(value) => setEditingUser(prev => prev ? { ...prev, fretista_placa: value } : null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um fretista" />
                        </SelectTrigger>
                        <SelectContent>
                          {fretistas.map(f => <SelectItem key={f.placa} value={f.placa}>{f.nome} - {f.placa}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditingUser(null)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdateUser}>
                      Salvar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        {/* Aba Clientes */}
        <TabsContent value="clientes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Gestão de Clientes
                </CardTitle>
                <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Cliente
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="razaoSocial">Razão Social</Label>
                        <Input id="razaoSocial" placeholder="Razão Social" value={newClient.razaoSocial} onChange={(e) => setNewClient(prev => ({ ...prev, razaoSocial: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input id="cnpj" placeholder="00.000.000/0000-00" value={newClient.cnpj} onChange={(e) => setNewClient(prev => ({ ...prev, cnpj: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                        <Input id="nomeFantasia" placeholder="Nome Fantasia" value={newClient.nomeFantasia} onChange={(e) => setNewClient(prev => ({ ...prev, nomeFantasia: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rede">Rede</Label>
                        <Input id="rede" placeholder="Rede" value={newClient.rede} onChange={(e) => setNewClient(prev => ({ ...prev, rede: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="uf">UF</Label>
                        <Input id="uf" placeholder="BA" maxLength={2} value={newClient.uf} onChange={(e) => setNewClient(prev => ({ ...prev, uf: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vendedor">Vendedor</Label>
                        <Input id="vendedor" placeholder="Vendedor" value={newClient.vendedor} onChange={(e) => setNewClient(prev => ({ ...prev, vendedor: e.target.value }))} />
                      </div>
                    </div>
                    <Button onClick={handleAddClient} className="w-full mt-4">
                      Adicionar Cliente
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome Fantasia</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Rede</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.cnpj}>
                      <TableCell>{cliente.nomeFantasia}</TableCell>
                      <TableCell>{cliente.cnpj}</TableCell>
                      <TableCell>{cliente.rede}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setEditingClient(cliente)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClient(cliente.cnpj)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Fretistas */}
        <TabsContent value="fretistas" className="space-y-4">
           <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Gestão de Fretistas
                </CardTitle>
                <Dialog open={isFretistaDialogOpen} onOpenChange={setIsFretistaDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Fretista
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Fretista</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="placa">Placa</Label>
                        <Input id="placa" placeholder="ABC1234" value={newFretista.placa} onChange={(e) => setNewFretista(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input id="nome" placeholder="Nome do fretista" value={newFretista.nome} onChange={(e) => setNewFretista(prev => ({ ...prev, nome: e.target.value }))} />
                      </div>
                      <Button onClick={handleAddFretista} className="w-full">
                        Adicionar Fretista
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fretistas.map((fretista) => (
                    <TableRow key={fretista.placa}>
                      <TableCell>{fretista.placa}</TableCell>
                      <TableCell>{fretista.nome}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setEditingFretista(fretista)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteFretista(fretista.placa)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Histórico */}
        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Acessos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Tela</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicoAcessos.map((item: any, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.usuario}</TableCell>
                      <TableCell>{item.data}</TableCell>
                      <TableCell>{item.hora}</TableCell>
                      <TableCell>{item.tela}</TableCell>
                      <TableCell>{item.acao}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;
