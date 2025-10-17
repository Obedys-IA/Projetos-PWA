import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Cliente } from '@/types';

const fetchClientes = async (): Promise<Cliente[]> => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nome_fantasia', { ascending: true });

  if (error) throw new Error(error.message);
  
  return (data || []).map(cliente => ({
    razaoSocial: cliente.razao_social,
    cnpj: cliente.cnpj,
    nomeFantasia: cliente.nome_fantasia,
    rede: cliente.rede,
    uf: cliente.uf,
    vendedor: cliente.vendedor
  }));
};

const createCliente = async (clienteData: Cliente): Promise<Cliente> => {
  const clienteParaInserir = {
    razao_social: clienteData.razaoSocial,
    cnpj: clienteData.cnpj,
    nome_fantasia: clienteData.nomeFantasia,
    rede: clienteData.rede,
    uf: clienteData.uf,
    vendedor: clienteData.vendedor
  };

  const { data, error } = await supabase
    .from('clientes')
    .insert([clienteParaInserir])
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  return {
    razaoSocial: data.razao_social,
    cnpj: data.cnpj,
    nomeFantasia: data.nome_fantasia,
    rede: data.rede,
    uf: data.uf,
    vendedor: data.vendedor
  };
};

const updateCliente = async ({ cnpj, clienteData }: { cnpj: string, clienteData: Partial<Cliente> }): Promise<Cliente> => {
  const clienteParaAtualizar: any = {};
  if (clienteData.razaoSocial) clienteParaAtualizar.razao_social = clienteData.razaoSocial;
  if (clienteData.nomeFantasia) clienteParaAtualizar.nome_fantasia = clienteData.nomeFantasia;
  if (clienteData.rede !== undefined) clienteParaAtualizar.rede = clienteData.rede;
  if (clienteData.uf) clienteParaAtualizar.uf = clienteData.uf;
  if (clienteData.vendedor !== undefined) clienteParaAtualizar.vendedor = clienteData.vendedor;

  const { data, error } = await supabase
    .from('clientes')
    .update(clienteParaAtualizar)
    .eq('cnpj', cnpj)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    razaoSocial: data.razao_social,
    cnpj: data.cnpj,
    nomeFantasia: data.nome_fantasia,
    rede: data.rede,
    uf: data.uf,
    vendedor: data.vendedor
  };
};

const deleteCliente = async (cnpj: string): Promise<void> => {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('cnpj', cnpj);

  if (error) throw new Error(error.message);
};

export const useClientes = () => {
  const queryClient = useQueryClient();

  const { data: clientes = [], isLoading, isError, error } = useQuery<Cliente[], Error>({
    queryKey: ['clientes'],
    queryFn: fetchClientes,
  });

  const createMutation = useMutation({
    mutationFn: createCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  return {
    clientes,
    isLoading,
    isError,
    error,
    createCliente: createMutation.mutateAsync,
    updateCliente: updateMutation.mutateAsync,
    deleteCliente: deleteMutation.mutateAsync,
  };
};
