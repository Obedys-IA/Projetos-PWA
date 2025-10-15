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
import { Usuario, Cliente, Fretista } from '../types';
import { showSuccess, showError } from '../utils/toast';
import { clientesData } from '../data/clientes';
import { fretistasData } from '../data/fretistas';

const Configuracoes: React.FC = () => {
  const { user } = useAuth();
  
  // Estados para gestão
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao@example.com',
      tipo: 'colaborador',
      fretistaAssociado: 'Anderson'
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@example.com',
      tipo: 'fretista',
      fretistaAssociado: 'Danilo'
    }
  ]);

  const [clientes] = useState<Cliente[]>(clientesData);
  const [fretistas] = useState<Fretista[]>(fretistasData);

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

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isFretistaDialogOpen, setIsFretistaDialogOpen] = useState(false);

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

  const handleAddUser = () => {
    showSuccess('Usuário adicionado com sucesso!');
    setIsUserDialogOpen(false);
  };

  const handleAddClient = () => {
    showSuccess('Cliente adicionado com sucesso!');
    setIsClientDialogOpen(false);
  };

  const handleAddFretista = () => {
    showSuccess('Fretista adicionado com sucesso!');
    setIsFretistaDialogOpen(false);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsuarios(prev => prev.filter(u => u.id !== userId));
      showSuccess('Usuário excluído com sucesso!');
    }
  };

  const handleAssociateFretista = (userId: string, fretista: string) => {
    setUsuarios(prev => prev.map(u => 
      u.id === userId ? { ...u, fretistaAssociado: fretista } : u
    ));
    showSuccess('Fretista associado com sucesso!');
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
                        <Input id="nome" placeholder="Nome do usuário" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="email@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo de Usuário</Label>
                        <Select>
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
                        <Label htmlFor="fretista">Fretista Associado (se aplicável)</Label>
                        <Select>
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
                      <TableCell>
                        {usuario.tipo === 'fretista' ? (
                          <Select 
                            value={usuario.fretistaAssociado || 'none'} 
                            onValueChange={(value) => handleAssociateFretista(usuario.id, value === 'none' ? '' : value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              {fretistas.map((fretista) => (
                                <SelectItem key={fretista.placa} value={fretista.nome}>
                                  {fretista.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
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
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="razaoSocial">Razão Social</Label>
                        <Input id="razaoSocial" placeholder="Razão Social" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input id="cnpj" placeholder="00.000.000/0000-00" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                        <Input id="nomeFantasia" placeholder="Nome Fantasia" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rede">Rede</Label>
                        <Input id="rede" placeholder="Rede" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="uf">UF</Label>
                        <Input id="uf" placeholder="BA" maxLength={2} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vendedor">Vendedor</Label>
                        <Input id="vendedor" placeholder="Vendedor" />
                      </div>
                      <Button onClick={handleAddClient} className="w-full">
                        Adicionar Cliente
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
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
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
                        <Input id="placa" placeholder="ABC1234" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input id="nome" placeholder="Nome do fretista" />
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
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
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