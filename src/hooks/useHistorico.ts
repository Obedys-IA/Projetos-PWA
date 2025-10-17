import { supabase } from '@/integrations/supabase/client';

export const useHistorico = () => {
  const registrarAcesso = async (tela: string, acao: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: userData } = await supabase
        .from('usuarios')
        .select('nome')
        .eq('id', user.id)
        .single();

      if (userData) {
        await supabase.from('historico_acessos').insert({
          usuario_id: user.id,
          usuario: userData.nome,
          data: new Date().toISOString().split('T')[0],
          hora: new Date().toTimeString().split(' ')[0].substring(0, 5),
          tela,
          acao
        });
      }
    } catch (error) {
      console.error('Erro ao registrar acesso:', error);
    }
  };

  const getHistorico = async () => {
    try {
      const { data, error } = await supabase
        .from('historico_acessos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  };

  return {
    registrarAcesso,
    getHistorico
  };
};
