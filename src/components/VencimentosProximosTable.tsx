import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NotaFiscal } from '../types';

interface VencimentosProximosTableProps {
  dados: NotaFiscal[];
}

export const VencimentosProximosTable: React.FC<VencimentosProximosTableProps> = ({ dados }) => {
  
  const dadosVencimentos = useMemo(() => {
    return dados
      .filter(nota => nota.status === 'Pendente' && (nota.diasVencer >= 0 && nota.diasVencer <= 20))
      .sort((a, b) => (a.diasVencer || Infinity) - (b.diasVencer || Infinity))
      .slice(0, 20);
  }, [dados]);

  const formatarData = (data: string) => {
    if (!data) return '-';
    const date = new Date(data);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getSituacaoBadge = (diasVencer: number) => {
    if (diasVencer <= 3) {
      return <Badge variant="destructive">{diasVencer} dias</Badge>;
    } else if (diasVencer <= 7) {
      return <Badge variant="secondary" className="bg-orange-500 text-white hover:bg-orange-600">{diasVencer} dias</Badge>;
    } else {
      return <Badge variant="outline">{diasVencer} dias</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 20 Vencimentos Próximos (Pendentes)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NF</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fretista</TableHead>
              <TableHead>Data Emissão</TableHead>
              <TableHead>Data Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Dias p/ Vencer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dadosVencimentos.length > 0 ? (
              dadosVencimentos.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.numeroNF}</TableCell>
                  <TableCell>{item.nomeFantasia}</TableCell>
                  <TableCell>{item.fretista}</TableCell>
                  <TableCell>{formatarData(item.dataEmissao)}</TableCell>
                  <TableCell>{formatarData(item.dataVencimento)}</TableCell>
                  <TableCell>{formatarValor(item.valorNota)}</TableCell>
                  <TableCell>{getSituacaoBadge(item.diasVencer)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhuma nota com vencimento próximo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
