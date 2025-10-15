import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Cliente } from '@/types';

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarClientes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome_fantasia', { ascending: true });

      if (error) throw error;
      
      // Transformar dados para o formato esperado
      const clientesFormatados: Cliente[] = (data || []).map(cliente => ({
        razaoSocial: cliente.razao_social,
        cnpj: cliente.cnpj,
        nomeFantasia: cliente.nome_fantasia,
        rede: cliente.rede,
        uf: cliente.uf,
        vendedor: cliente.vendedor
      }));
      
      setClientes(clientesFormatados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const criarCliente = async (clienteData: Omit<Cliente, 'razaoSocial' | 'cnpj'> & { razaoSocial: string; cnpj: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      // Transformar para o formato do banco
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

      if (error) throw error;
      
      // Transformar de volta para o formato esperado
      const clienteFormatado: Cliente = {
        razaoSocial: data.razao_social,
        cnpj: data.cnpj,
        nomeFantasia: data.nome_fantasia,
        rede: data.rede,
        uf: data.uf,
        vendedor: data.vendedor
      };
      
      setClientes(prev => [clienteFormatado, ...prev]);
      return clienteFormatado;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar cliente');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const atualizarCliente = async (cnpj: string, clienteData: Partial<Cliente>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Transformar para o formato do banco
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

      if (error) throw error;
      
      // Transformar de volta para o formato esperado
      const clienteFormatado: Cliente = {
        razaoSocial: data.razao_social,
        cnpj: data.cnpj,
        nomeFantasia: data.nome_fantasia,
        rede: data.rede,
        uf: data.uf,
        vendedor: data.vendedor
      };
      
      setClientes(prev => prev.map(c => c.cnpj === cnpj ? clienteFormatado : c));
      return clienteFormatado;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cliente');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const excluirCliente = async (cnpj: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('cnpj', cnpj);

      if (error) throw error;
      
      setClientes(prev => prev.filter(c => c.cnpj !== cnpj));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir cliente');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  return {
    clientes,
    loading,
    error,
    carregarClientes,
    criarCliente,
    atualizarCliente,
    excluirCliente
  };
};