import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NotaFiscal } from '../types';

interface VencimentosProximosTableProps {
  dados: NotaFiscal[];
}

export const VencimentosProximosTable: React.FC<VencimentosProximosTableProps> = ({ dados }) => {
  
  // Dados mock para a tabela
  const dadosVencimentos = [
    {
      numeroNF: '123456',
      cliente: 'Assai Juazeiro',
      fretista: 'Anderson',
      dataEmissao: '2024-10-02',
      dataVencimento: '2024-10-24',
      valor: 12558.00,
      diasAtraso: 0,
      diasVencer: 10
    },
    {
      numeroNF: '123457',
      cliente: 'GBarbosa Centro',
      fretista: 'Danilo',
      dataEmissao: '2024-10-01',
      dataVencimento: '2024-10-21',
      valor: 8750.50,
      diasAtraso: 0,
      diasVencer: 7
    },
    {
      numeroNF: '123458',
      cliente: 'Atakarejo Alagoinha',
      fretista: 'Elvis',
      dataEmissao: '2024-09-28',
      dataVencimento: '2024-10-18',
      valor: 15420.00,
      diasAtraso: 0,
      diasVencer: 4
    },
  ];

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
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
      return <Badge variant="secondary">{diasVencer} dias</Badge>;
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
            {dadosVencimentos.map((item) => (
              <TableRow key={item.numeroNF}>
                <TableCell className="font-medium">{item.numeroNF}</TableCell>
                <TableCell>{item.cliente}</TableCell>
                <TableCell>{item.fretista}</TableCell>
                <TableCell>{formatarData(item.dataEmissao)}</TableCell>
                <TableCell>{formatarData(item.dataVencimento)}</TableCell>
                <TableCell>{formatarValor(item.valor)}</TableCell>
                <TableCell>{getSituacaoBadge(item.diasVencer)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};