import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Usuario } from '@/types';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarUsuarios = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const criarUsuario = async (userData: Omit<Usuario, 'id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      
      setUsuarios(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const atualizarUsuario = async (id: string, userData: Partial<Usuario>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setUsuarios(prev => prev.map(u => u.id === id ? data : u));
      return data;
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const excluirUsuario = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setUsuarios(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  return {
    usuarios,
    loading,
    error,
    carregarUsuarios,
    criarUsuario,
    atualizarUsuario,
    excluirUsuario
  };
};