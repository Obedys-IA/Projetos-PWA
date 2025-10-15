import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NotaFiscal, Filtros } from '@/types';

export const useNotasFiscais = () => {
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarNotas = async (filtros?: Filtros) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('notas_fiscais')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filtros?.busca) {
        query = query.or(`numero_nf.ilike.%${filtros.busca}%,nome_fantasia.ilike.%${filtros.busca}%,fretista.ilike.%${filtros.busca}%`);
      }
      
      if (filtros?.status) {
        query = query.eq('status', filtros.status);
      }
      
      if (filtros?.situacao) {
        query = query.eq('situacao', filtros.situacao);
      }
      
      if (filtros?.fretista) {
        query = query.eq('fretista', filtros.fretista);
      }
      
      if (filtros?.cliente) {
        query = query.eq('nome_fantasia', filtros.cliente);
      }
      
      if (filtros?.rede) {
        query = query.eq('rede', filtros.rede);
      }
      
      if (filtros?.vendedor) {
        query = query.eq('vendedor', filtros.vendedor);
      }
      
      if (filtros?.uf) {
        query = query.eq('uf', filtros.uf);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transformar dados para o formato esperado
      const notasFormatadas: NotaFiscal[] = (data || []).map(nota => ({
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
      
      setNotas(notasFormatadas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar notas');
    } finally {
      setLoading(false);
    }
  };

  const criarNota = async (notaData: Omit<NotaFiscal, 'id' | 'diasAtraso' | 'diasVencer'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      // Transformar para o formato do banco
      const notaParaInserir = {
        data_emissao: notaData.dataEmissao,
        hora_saida: notaData.horaSaida,
        numero_nf: notaData.numeroNF,
        nome_fantasia: notaData.nomeFantasia,
        rede: notaData.rede,
        uf: notaData.uf,
        vendedor: notaData.vendedor,
        placa_veiculo: notaData.placaVeiculo,
        fretista: notaData.fretista,
        valor_nota: notaData.valorNota,
        data_vencimento: notaData.dataVencimento,
        status: notaData.status,
        observacao: notaData.observacao,
        arquivo_url: notaData.arquivoUrl,
        usuario_registro: notaData.usuarioRegistro,
        usuario_edicao: notaData.usuarioEdicao
      };

      const { data, error } = await supabase
        .from('notas_fiscais')
        .insert([notaParaInserir])
        .select()
        .single();

      if (error) throw error;
      
      // Transformar de volta para o formato esperado
      const notaFormatada: NotaFiscal = {
        id: data.id,
        dataEmissao: data.data_emissao,
        horaSaida: data.hora_saida || '',
        numeroNF: data.numero_nf,
        nomeFantasia: data.nome_fantasia,
        rede: data.rede || '',
        uf: data.uf || '',
        vendedor: data.vendedor || '',
        placaVeiculo: data.placa_veiculo || '',
        fretista: data.fretista || '',
        valorNota: data.valor_nota,
        dataVencimento: data.data_vencimento,
        situacao: data.situacao,
        status: data.status,
        diasAtraso: data.dias_atraso || 0,
        diasVencer: data.dias_vencer || 0,
        observacao: data.observacao,
        arquivoUrl: data.arquivo_url,
        usuarioRegistro: data.usuario_registro,
        dataRegistro: data.data_registro,
        horaRegistro: data.hora_registro || '',
        usuarioEdicao: data.usuario_edicao,
        dataEdicao: data.data_edicao,
        horaEdicao: data.hora_edicao
      };
      
      setNotas(prev => [notaFormatada, ...prev]);
      return notaFormatada;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar nota');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const atualizarNota = async (id: string, notaData: Partial<NotaFiscal>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      // Transformar para o formato do banco
      const notaParaAtualizar: any = {};
      
      if (notaData.dataEmissao) notaParaAtualizar.data_emissao = notaData.dataEmissao;
      if (notaData.horaSaida !== undefined) notaParaAtualizar.hora_saida = notaData.horaSaida;
      if (notaData.numeroNF) notaParaAtualizar.numero_nf = notaData.numeroNF;
      if (notaData.nomeFantasia) notaParaAtualizar.nome_fantasia = notaData.nomeFantasia;
      if (notaData.rede !== undefined) notaParaAtualizar.rede = notaData.rede;
      if (notaData.uf !== undefined) notaParaAtualizar.uf = notaData.uf;
      if (notaData.vendedor !== undefined) notaParaAtualizar.vendedor = notaData.vendedor;
      if (notaData.placaVeiculo !== undefined) notaParaAtualizar.placa_veiculo = notaData.placaVeiculo;
      if (notaData.fretista !== undefined) notaParaAtualizar.fretista = notaData.fretista;
      if (notaData.valorNota) notaParaAtualizar.valor_nota = notaData.valorNota;
      if (notaData.dataVencimento) notaParaAtualizar.data_vencimento = notaData.dataVencimento;
      if (notaData.status) notaParaAtualizar.status = notaData.status;
      if (notaData.observacao !== undefined) notaParaAtualizar.observacao = notaData.observacao;
      if (notaData.arquivoUrl !== undefined) notaParaAtualizar.arquivo_url = notaData.arquivoUrl;
      
      notaParaAtualizar.usuario_edicao = user.email;
      notaParaAtualizar.data_edicao = new Date().toISOString();
      notaParaAtualizar.hora_edicao = new Date().toTimeString().split(' ')[0].substring(0, 5);

      const { data, error } = await supabase
        .from('notas_fiscais')
        .update(notaParaAtualizar)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Transformar de volta para o formato esperado
      const notaFormatada: NotaFiscal = {
        id: data.id,
        dataEmissao: data.data_emissao,
        horaSaida: data.hora_saida || '',
        numeroNF: data.numero_nf,
        nomeFantasia: data.nome_fantasia,
        rede: data.rede || '',
        uf: data.uf || '',
        vendedor: data.vendedor || '',
        placaVeiculo: data.placa_veiculo || '',
        fretista: data.fretista || '',
        valorNota: data.valor_nota,
        dataVencimento: data.data_vencimento,
        situacao: data.situacao,
        status: data.status,
        diasAtraso: data.dias_atraso || 0,
        diasVencer: data.dias_vencer || 0,
        observacao: data.observacao,
        arquivoUrl: data.arquivo_url,
        usuarioRegistro: data.usuario_registro,
        dataRegistro: data.data_registro,
        horaRegistro: data.hora_registro || '',
        usuarioEdicao: data.usuario_edicao,
        dataEdicao: data.data_edicao,
        horaEdicao: data.hora_edicao
      };
      
      setNotas(prev => prev.map(n => n.id === id ? notaFormatada : n));
      return notaFormatada;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar nota');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const excluirNota = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('notas_fiscais')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setNotas(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir nota');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const excluirNotasEmLote = async (ids: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      for (const id of ids) {
        await excluirNota(id);
        // Pequeno delay para não sobrecarregar o banco
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir notas em lote');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarNotas();
  }, []);

  return {
    notas,
    loading,
    error,
    carregarNotas,
    criarNota,
    atualizarNota,
    excluirNota,
    excluirNotasEmLote
  };
};