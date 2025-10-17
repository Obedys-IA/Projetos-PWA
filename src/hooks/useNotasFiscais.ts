import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotaFiscal, Filtros } from '@/types';

const fetchNotasFiscais = async (filtros?: Filtros): Promise<NotaFiscal[]> => {
  let query = supabase
    .from('notas_fiscais')
    .select('*')
    .order('created_at', { ascending: false });

  // Aplicar filtros
  if (filtros?.busca) {
    query = query.or(`numero_nf.ilike.%${filtros.busca}%,nome_fantasia.ilike.%${filtros.busca}%,fretista.ilike.%${filtros.busca}%`);
  }
  if (filtros?.status) query = query.eq('status', filtros.status);
  if (filtros?.situacao) query = query.eq('situacao', filtros.situacao);
  if (filtros?.fretista) query = query.eq('fretista', filtros.fretista);
  if (filtros?.cliente) query = query.eq('nome_fantasia', filtros.cliente);
  if (filtros?.rede) query = query.eq('rede', filtros.rede);
  if (filtros?.vendedor) query = query.eq('vendedor', filtros.vendedor);
  if (filtros?.uf) query = query.eq('uf', filtros.uf);

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return (data || []).map(nota => ({
    id: nota.id,
    dataEmissao: nota.data_emissao,
    horaSaida: nota.hora_saida || '',
    numeroNF: nota.numero_nf,
    nomeFantasia: nota.nome_fantasia,
    rede: nota.rede || '',
    uf: nota.uf || '',
    vendedor: nota.vendedor || '',
    placaVeiculo: nota.placa_veiculo || '',
    fretista: nota.fretista || '',
    valorNota: nota.valor_nota,
    dataVencimento: nota.data_vencimento,
    situacao: nota.situacao,
    status: nota.status,
    diasAtraso: nota.dias_atraso || 0,
    diasVencer: nota.dias_vencer || 0,
    observacao: nota.observacao,
    arquivoUrl: nota.arquivo_url,
    usuarioRegistro: nota.usuario_registro,
    dataRegistro: nota.data_registro,
    horaRegistro: nota.hora_registro || '',
    usuarioEdicao: nota.usuario_edicao,
    dataEdicao: nota.data_edicao,
    horaEdicao: nota.hora_edicao
  }));
};

const createNotaFiscal = async (notaData: Omit<NotaFiscal, 'id' | 'diasAtraso' | 'diasVencer' | 'dataRegistro' | 'situacao' | 'status'> & { status: string, situacao: string }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const notaParaInserir = {
    data_emissao: notaData.dataEmissao,
    hora_saida: notaData.horaSaida,
    numero_nf: notaData.numeroNF,
    nome_fantasia: notaData.nomeFantasia,
    rede: notaData.rede,
    uf: notaData.uf,
    vendedor: notaData.vendedor,
    placa_veiculo: notaData.placaVeiculo || 'Sem Identificação',
    fretista: notaData.fretista || 'Sem Identificação',
    valor_nota: notaData.valorNota,
    data_vencimento: notaData.dataVencimento,
    status: notaData.status,
    observacao: notaData.observacao,
    arquivo_url: notaData.arquivoUrl,
    usuario_registro: user.email,
  };

  const { data, error } = await supabase
    .from('notas_fiscais')
    .insert([notaParaInserir])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const updateNotaFiscal = async ({ id, notaData }: { id: string, notaData: Partial<NotaFiscal> }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const notaParaAtualizar: any = {};
  Object.entries(notaData).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (value !== undefined) {
          notaParaAtualizar[snakeKey] = value;
      }
  });

  notaParaAtualizar.usuario_edicao = user.email;
  notaParaAtualizar.data_edicao = new Date().toISOString().split('T')[0];
  notaParaAtualizar.hora_edicao = new Date().toTimeString().split(' ')[0].substring(0, 5);

  const { data, error } = await supabase
    .from('notas_fiscais')
    .update(notaParaAtualizar)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const deleteNotaFiscal = async (id: string) => {
  const { error } = await supabase.from('notas_fiscais').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

const deleteNotasFiscaisEmLote = async (ids: string[]) => {
  const { error } = await supabase.from('notas_fiscais').delete().in('id', ids);
  if (error) throw new Error(error.message);
};

export const useNotasFiscais = (filtros?: Filtros) => {
  const queryClient = useQueryClient();

  const { data: notas = [], isLoading, isError, error, refetch } = useQuery<NotaFiscal[], Error>({
    queryKey: ['notasFiscais', filtros],
    queryFn: () => fetchNotasFiscais(filtros),
  });

  const createMutation = useMutation({
    mutationFn: createNotaFiscal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notasFiscais'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateNotaFiscal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notasFiscais'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotaFiscal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notasFiscais'] });
    },
  });
  
  const deleteBatchMutation = useMutation({
    mutationFn: deleteNotasFiscaisEmLote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notasFiscais'] });
    },
  });

  return {
    notas,
    isLoading,
    isError,
    error,
    refetch,
    criarNota: createMutation.mutateAsync,
    atualizarNota: updateMutation.mutateAsync,
    excluirNota: deleteMutation.mutateAsync,
    excluirNotasEmLote: deleteBatchMutation.mutateAsync,
  };
};
