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
  const { usuarios, criarUsuario, atualizarUsuario, excluirUsuario } = useUsuarios();
  const { clientes, criarCliente, atualizarCliente, excluirCliente } = useClientes();
  const { fretistas, criarFretista, atualizarFretista, excluirFretista } = useFretistas();
  
  const [historicoAcessos] = useState([
    {
      usuario: 'João Silva',
      data: '2024-10-14',
      hora: '09:15',
      tela: 'Registros',
      acao: 'Adicionou nova nota fiscal'
    },
    {
      usuario: 'Maria Santos',
      data: '2024-10-14',
      hora: '08:30',
      tela: 'Perfil',
      acao: 'Visualizou relatório'
    }
  ]);

  // Estados para modais
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isFretistaDialogOpen, setIsFretistaDialogOpen] = useState(false);
  
  // Estados para edição
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [editingFretista, setEditingFretista] = useState<Fretista | null>(null);
  
  // Estados para novos itens
  const [newUser, setNewUser] = useState({
    nome: '',
    email: '',
    telefone: '',
    tipo: 'novo' as const,
    fretistaAssociado: '',
    placaAssociada: '',
    password: 'Temp123@'
  });
  
  const [newClient, setNewClient] = useState({
    razaoSocial: '',
    cnpj: '',
    nomeFantasia: '',
    rede: '',
    uf: '',
    vendedor: ''
  });
  
  const [newFretista, setNewFretista] = useState({
    placa: '',
    nome: ''
  });

  // Verificar se usuário é administrador
  if (user?.tipo !== 'administrador') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para acessar esta página. Apenas administradores podem visualizar as configurações.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleAddUser = async () => {
    try {
      await criarUsuario(newUser);
      showSuccess('Usuário adicionado com sucesso!');
      setIsUserDialogOpen(false);
      setNewUser({
        nome: '',
        email: '',
        telefone: '',
        tipo: 'novo',
        fretistaAssociado: '',
        placaAssociada: '',
        password: 'Temp123@'
      });
    } catch (error) {
      showError('Erro ao adicionar usuário');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      await atualizarUsuario(editingUser.id, editingUser);
      showSuccess('Usuário atualizado com sucesso!');
      setEditingUser(null);
    } catch (error) {
      showError('Erro ao atualizar usuário');
    }
  };

  const handleAddClient = async () => {
    try {
      await criarCliente(newClient);
      showSuccess('Cliente adicionado com sucesso!');
      setIsClientDialogOpen(false);
      setNewClient({
        razaoSocial: '',
        cnpj: '',
        nomeFantasia: '',
        rede: '',
        uf: '',
        vendedor: ''
      });
    } catch (error) {
      showError('Erro ao adicionar cliente');
    }
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;
    
    try {
      await atualizarCliente(editingClient.cnpj, editingClient);
      showSuccess('Cliente atualizado com sucesso!');
      setEditingClient(null);
    } catch (error) {
      showError('Erro ao atualizar cliente');
    }
  };

  const handleAddFretista = async () => {
    try {
      await criarFretista(newFretista);
      showSuccess('Fretista adicionado com sucesso!');
      setIsFretistaDialogOpen(false);
      setNewFretista({
        placa: '',
        nome: ''
      });
    } catch (error) {
      showError('Erro ao adicionar fretista');
    }
  };

  const handleUpdateFretista = async () => {
    if (!editingFretista) return;
    
    try {
      await atualizarFretista(editingFretista.placa, editingFretista);
      showSuccess('Fretista atualizado com sucesso!');
      setEditingFretista(null);
    } catch (error) {
      showError('Erro ao atualizar fretista');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await excluirUsuario(userId);
        showSuccess('Usuário excluído com sucesso!');
      } catch (error) {
        showError('Erro ao excluir usuário');
      }
    }
  };

  const handleDeleteClient = async (cnpj: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await excluirCliente(cnpj);
        showSuccess('Cliente excluído com sucesso!');
      } catch (error) {
        showError('Erro ao excluir cliente');
      }
    }
  };

  const handleDeleteFretista = async (placa: string) => {
    if (confirm('Tem certeza que deseja excluir este fretista?')) {
      try {
        await excluirFretista(placa);
        showSuccess('Fretista excluído com sucesso!');
      } catch (error) {
        showError('Erro ao excluir fretista');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Configurações</h1>
        <p className="text-gray-600">Gerencie usuários, clientes e fretistas</p>
      </div>

      {/* Status de Conexão */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Supabase</p>
                  <p className="text-sm text-gray-500">Banco de dados</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Conectado
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Google Sheets</p>
                  <p className="text-sm text-gray-500">Planilhas</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Conectado
              </Badge>
            </div>
          </CardContent>
        </Card>
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
                <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Usuário
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input 
                          id="nome" 
                          placeholder="Nome do usuário"
                          value={newUser.nome}
                          onChange={(e) => setNewUser(prev => ({ ...prev, nome: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email"
                          placeholder="email@example.com"
                          value={newUser.email}
                          onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo de Usuário</Label>
                        <Select value={newUser.tipo} onValueChange={(value: any) => setNewUser(prev => ({ ...prev, tipo: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
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
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input 
                          id="telefone" 
                          placeholder="(00) 00000-0000"
                          value={newUser.telefone}
                          onChange={(e) => setNewUser(prev => ({ ...prev, telefone: e.target.value }))}
                        />
                      </div>
                      <Button onClick={handleAddUser} className="w-full">
                        Adicionar Usuário
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
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Telefone</TableHead>
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
                      <TableCell>{usuario.telefone || '-'}</TableCell>
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
                    <Label htmlFor="edit-email">Email</Label>
                    <Input 
                      id="edit-email"
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)}
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
                        <Input 
                          id="razaoSocial"
                          placeholder="Razão Social"
                          value={newClient.razaoSocial}
                          onChange={(e) => setNewClient(prev => ({ ...prev, razaoSocial: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input 
                          id="cnpj"
                          placeholder="00.000.000/0000-00"
                          value={newClient.cnpj}
                          onChange={(e) => setNewClient(prev => ({ ...prev, cnpj: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                        <Input 
                          id="nomeFantasia"
                          placeholder="Nome Fantasia"
                          value={newClient.nomeFantasia}
                          onChange={(e) => setNewClient(prev => ({ ...prev, nomeFantasia: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rede">Rede</Label>
                        <Input 
                          id="rede"
                          placeholder="Rede"
                          value={newClient.rede}
                          onChange={(e) => setNewClient(prev => ({ ...prev, rede: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="uf">UF</Label>
                        <Input 
                          id="uf"
                          placeholder="BA"
                          maxLength={2}
                          value={newClient.uf}
                          onChange={(e) => setNewClient(prev => ({ ...prev, uf: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vendedor">Vendedor</Label>
                        <Input 
                          id="vendedor"
                          placeholder="Vendedor"
                          value={newClient.vendedor}
                          onChange={(e) => setNewClient(prev => ({ ...prev, vendedor: e.target.value }))}
                        />
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
                    <TableHead>Razão Social</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Nome Fantasia</TableHead>
                    <TableHead>Rede</TableHead>
                    <TableHead>UF</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.cnpj}>
                      <TableCell>{cliente.razaoSocial}</TableCell>
                      <TableCell>{cliente.cnpj}</TableCell>
                      <TableCell>{cliente.nomeFantasia}</TableCell>
                      <TableCell>{cliente.rede}</TableCell>
                      <TableCell>{cliente.uf}</TableCell>
                      <TableCell>{cliente.vendedor}</TableCell>
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

          {/* Dialog de Edição de Cliente */}
          {editingClient && (
            <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Editar Cliente</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-razaoSocial">Razão Social</Label>
                    <Input 
                      id="edit-razaoSocial"
                      value={editingClient.razaoSocial}
                      onChange={(e) => setEditingClient(prev => prev ? { ...prev, razaoSocial: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-cnpj">CNPJ</Label>
                    <Input 
                      id="edit-cnpj"
                      value={editingClient.cnpj}
                      onChange={(e) => setEditingClient(prev => prev ? { ...prev, cnpj: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-nomeFantasia">Nome Fantasia</Label>
                    <Input 
                      id="edit-nomeFantasia"
                      value={editingClient.nomeFantasia}
                      onChange={(e) => setEditingClient(prev => prev ? { ...prev, nomeFantasia: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-rede">Rede</Label>
                    <Input 
                      id="edit-rede"
                      value={editingClient.rede}
                      onChange={(e) => setEditingClient(prev => prev ? { ...prev, rede: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-uf">UF</Label>
                    <Input 
                      id="edit-uf"
                      maxLength={2}
                      value={editingClient.uf}
                      onChange={(e) => setEditingClient(prev => prev ? { ...prev, uf: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-vendedor">Vendedor</Label>
                    <Input 
                      id="edit-vendedor"
                      value={editingClient.vendedor}
                      onChange={(e) => setEditingClient(prev => prev ? { ...prev, vendedor: e.target.value } : null)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setEditingClient(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdateClient}>
                    Salvar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
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
                        <Input 
                          id="placa"
                          placeholder="ABC1234"
                          value={newFretista.placa}
                          onChange={(e) => setNewFretista(prev => ({ ...prev, placa: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input 
                          id="nome"
                          placeholder="Nome do fretista"
                          value={newFretista.nome}
                          onChange={(e) => setNewFretista(prev => ({ ...prev, nome: e.target.value }))}
                        />
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

          {/* Dialog de Edição de Fretista */}
          {editingFretista && (
            <Dialog open={!!editingFretista} onOpenChange={() => setEditingFretista(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Fretista</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-placa">Placa</Label>
                    <Input 
                      id="edit-placa"
                      value={editingFretista.placa}
                      onChange={(e) => setEditingFretista(prev => prev ? { ...prev, placa: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-nome">Nome</Label>
                    <Input 
                      id="edit-nome"
                      value={editingFretista.nome}
                      onChange={(e) => setEditingFretista(prev => prev ? { ...prev, nome: e.target.value } : null)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditingFretista(null)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdateFretista}>
                      Salvar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
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
                  {historicoAcessos.map((item, index) => (
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