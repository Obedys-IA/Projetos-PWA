import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Fretista } from '@/types';

const fetchFretistas = async (): Promise<Fretista[]> => {
  const { data, error } = await supabase
    .from('fretistas')
    .select('*')
    .order('nome', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

const createFretista = async (fretistaData: Fretista): Promise<Fretista> => {
  const { data, error } = await supabase
    .from('fretistas')
    .insert([fretistaData])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const updateFretista = async ({ placa, fretistaData }: { placa: string, fretistaData: Partial<Fretista> }): Promise<Fretista> => {
  const { data, error } = await supabase
    .from('fretistas')
    .update(fretistaData)
    .eq('placa', placa)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const deleteFretista = async (placa: string): Promise<void> => {
  const { error } = await supabase
    .from('fretistas')
    .delete()
    .eq('placa', placa);

  if (error) throw new Error(error.message);
};

export const useFretistas = () => {
  const queryClient = useQueryClient();

  const { data: fretistas = [], isLoading, isError, error } = useQuery<Fretista[], Error>({
    queryKey: ['fretistas'],
    queryFn: fetchFretistas,
  });

  const createMutation = useMutation({
    mutationFn: createFretista,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fretistas'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateFretista,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fretistas'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFretista,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fretistas'] });
    },
  });

  return {
    fretistas,
    isLoading,
    isError,
    error,
    createFretista: createMutation.mutateAsync,
    updateFretista: updateMutation.mutateAsync,
    deleteFretista: deleteMutation.mutateAsync,
  };
};
