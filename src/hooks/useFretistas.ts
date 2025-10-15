import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Fretista } from '@/types';

export const useFretistas = () => {
  const [fretistas, setFretistas] = useState<Fretista[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarFretistas = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('fretistas')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      
      setFretistas(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar fretistas');
    } finally {
      setLoading(false);
    }
  };

  const criarFretista = async (fretistaData: Omit<Fretista, 'placa'> & { placa: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('fretistas')
        .insert([fretistaData])
        .select()
        .single();

      if (error) throw error;
      
      setFretistas(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar fretista');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const atualizarFretista = async (placa: string, fretistaData: Partial<Fretista>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('fretistas')
        .update(fretistaData)
        .eq('placa', placa)
        .select()
        .single();

      if (error) throw error;
      
      setFretistas(prev => prev.map(f => f.placa === placa ? data : f));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar fretista');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const excluirFretista = async (placa: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('fretistas')
        .delete()
        .eq('placa', placa);

      if (error) throw error;
      
      setFretistas(prev => prev.filter(f => f.placa !== placa));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir fretista');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFretistas();
  }, []);

  return {
    fretistas,
    loading,
    error,
    carregarFretistas,
    criarFretista,
    atualizarFretista,
    excluirFretista
  };
};