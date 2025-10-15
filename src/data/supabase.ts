import { supabase } from '@/integrations/supabase/client';
import { Cliente, Fretista } from '@/types';

export const supabaseClientes = {
  async getClientes(): Promise<Cliente[]> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome_fantasia');

      if (error) throw error;
      
      return data?.map(cliente => ({
        razaoSocial: cliente.razao_social,
        cnpj: cliente.cnpj,
        nomeFantasia: cliente.nome_fantasia,
        rede: cliente.rede,
        uf: cliente.uf,
        vendedor: cliente.vendedor
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }
  },

  async createCliente(cliente: Omit<Cliente, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clientes')
        .insert([{
          razao_social: cliente.razaoSocial,
          cnpj: cliente.cnpj,
          nome_fantasia: cliente.nomeFantasia,
          rede: cliente.rede,
          uf: cliente.uf,
          vendedor: cliente.vendedor
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      return false;
    }
  },

  async updateCliente(id: string, updates: Partial<Cliente>): Promise<boolean> {
    try {
      const updateData: any = {};
      if (updates.razaoSocial) updateData.razao_social = updates.razaoSocial;
      if (updates.cnpj) updateData.cnpj = updates.cnpj;
      if (updates.nomeFantasia) updateData.nome_fantasia = updates.nomeFantasia;
      if (updates.rede) updateData.rede = updates.rede;
      if (updates.uf) updateData.uf = updates.uf;
      if (updates.vendedor) updateData.vendedor = updates.vendedor;

      const { error } = await supabase
        .from('clientes')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      return false;
    }
  },

  async deleteCliente(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      return false;
    }
  }
};

export const supabaseFretistas = {
  async getFretistas(): Promise<Fretista[]> {
    try {
      const { data, error } = await supabase
        .from('fretistas')
        .select('*')
        .order('nome');

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar fretistas:', error);
      return [];
    }
  },

  async createFretista(fretista: Omit<Fretista, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('fretistas')
        .insert([fretista]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao criar fretista:', error);
      return false;
    }
  },

  async updateFretista(id: string, updates: Partial<Fretista>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('fretistas')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar fretista:', error);
      return false;
    }
  },

  async deleteFretista(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('fretistas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao excluir fretista:', error);
      return false;
    }
  }
};