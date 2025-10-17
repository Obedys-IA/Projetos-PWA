import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Usuario } from '@/types';

const fetchUsuarios = async (): Promise<Usuario[]> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('nome', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

const updateUsuario = async ({ id, userData }: { id: string, userData: Partial<Usuario> }): Promise<Usuario> => {
  const { data, error } = await supabase
    .from('usuarios')
    .update(userData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const deleteUsuario = async (id: string): Promise<void> => {
  // We need to call an admin function to delete from auth.users
  const { error } = await supabase.functions.invoke('admin-delete-user', {
    body: { userId: id },
  });
  if (error) throw new Error(error.message);
};

export const useUsuarios = () => {
  const queryClient = useQueryClient();

  const { data: usuarios = [], isLoading, isError, error } = useQuery<Usuario[], Error>({
    queryKey: ['usuarios'],
    queryFn: fetchUsuarios,
  });

  // Note: Creating users is handled by the auth hook (signUp)
  // This hook is for managing existing users

  const updateMutation = useMutation({
    mutationFn: updateUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  return {
    usuarios,
    isLoading,
    isError,
    error,
    updateUsuario: updateMutation.mutateAsync,
    deleteUsuario: deleteMutation.mutateAsync,
  };
};
