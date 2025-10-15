import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Usuario, NotaFiscal, Cliente, Fretista } from '@/types';

export const useSupabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Operações de Usuários
  const getUsuarios = async (): Promise<Usuario[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createUsuario = async (usuario: Omit<Usuario, 'id'>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('usuarios')
        .insert([usuario]);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUsuario = async (id: string, updates: Partial<Usuario>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteUsuario = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Operações de Clientes
  const getClientes = async (): Promise<Cliente[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome_fantasia');
      
      if (error) throw error;
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createCliente = async (cliente: Omit<Cliente, 'id'>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('clientes')
        .insert([cliente]);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCliente = async (id: string, updates: Partial<Cliente>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCliente = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Operações de Fretistas
  const getFretistas = async (): Promise<Fretista[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('fretistas')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createFretista = async (fretista: Omit<Fretista, 'id'>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('fretistas')
        .insert([fretista]);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateFretista = async (id: string, updates: Partial<Fretista>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('fretistas')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteFretista = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('fretistas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Operações de Notas Fiscais
  const getNotasFiscais = async (filtros?: any): Promise<NotaFiscal[]> => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('notas_fiscais')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filtros) {
        if (filtros.status) query = query.eq('status', filtros.status);
        if (filtros.situacao) query = query.eq('situacao', filtros.situacao);
        if (filtros.fretista) query = query.eq('fretista', filtros.fretista);
        if (filtros.cliente) query = query.eq('nome_fantasia', filtros.cliente);
        if (filtros.rede) query = query.eq('rede', filtros.rede);
        if (filtros.uf) query = query.eq('uf', filtros.uf);
        if (filtros.vendedor) query = query.eq('vendedor', filtros.vendedor);
        if (filtros.periodoInicio) query = query.gte('data_emissao', filtros.periodoInicio);
        if (filtros.periodoFim) query = query.lte('data_emissao', filtros.periodoFim);
        if (filtros.busca) {
          query = query.or(`numeroNF.ilike.%${filtros.busca}%,nome_fantasia.ilike.%${filtros.busca}%,fretista.ilike.%${filtros.busca}%`);
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createNotaFiscal = async (nota: Omit<NotaFiscal, 'id'>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('notas_fiscais')
        .insert([nota]);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateNotaFiscal = async (id: string, updates: Partial<NotaFiscal>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('notas_fiscais')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteNotaFiscal = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('notas_fiscais')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteNotasFiscaisBatch = async (ids: string[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('notas_fiscais')
        .delete()
        .in('id', ids);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Operações de Histórico
  const registrarHistorico = async (registro: {
    usuario: string;
    tela: string;
    acao: string;
  }): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('historico_acessos')
        .insert([{
          ...registro,
          data: new Date().toISOString().split('T')[0],
          hora: new Date().toTimeString().split(' ')[0].substring(0, 5)
        }]);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Erro ao registrar histórico:', err);
      return false;
    }
  };

  const getHistorico = async (): Promise<any[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('historico_acessos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    // Usuários
    getUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    // Clientes
    getClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    // Fretistas
    getFretistas,
    createFretista,
    updateFretista,
    deleteFretista,
    // Notas Fiscais
    getNotasFiscais,
    createNotaFiscal,
    updateNotaFiscal,
    deleteNotaFiscal,
    deleteNotasFiscaisBatch,
    // Histórico
    registrarHistorico,
    getHistorico
  };
};