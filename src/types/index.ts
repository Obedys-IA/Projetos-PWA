export interface Cliente {
  razaoSocial: string;
  cnpj: string;
  nomeFantasia: string;
  rede: string;
  uf: string;
  vendedor: string;
}

export interface Fretista {
  placa: string;
  nome: string;
}

export interface NotaFiscal {
  id: string;
  dataEmissao: string;
  horaSaida: string;
  numeroNF: string;
  nomeFantasia: string;
  rede: string;
  uf: string;
  vendedor: string;
  placaVeiculo: string;
  fretista: string;
  valorNota: number;
  dataVencimento: string;
  situacao: 'Dentro do Prazo' | 'Vencimento Próximo';
  status: 'Pendente' | 'Entregue' | 'Cancelada' | 'Devolvida' | 'Reenviada' | 'Paga' | string;
  diasAtraso: number;
  diasVencer: number;
  observacao?: string;
  arquivoUrl?: string;
  usuarioRegistro: string;
  dataRegistro: string;
  horaRegistro: string;
  usuarioEdicao?: string;
  dataEdicao?: string;
  horaEdicao?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  tipo: 'administrador' | 'colaborador' | 'fretista' | 'gerencia' | 'novo';
  fretista_placa?: string | null; // Corrected to match database schema
}

export interface Filtros {
  busca: string;
  periodoInicio?: string;
  periodoFim?: string;
  periodoPredefinido?: string;
  fretista?: string;
  placa?: string;
  cliente?: string;
  rede?: string;
  vendedor?: string;
  uf?: string;
  status?: string;
  situacao?: string;
}

export const CFOP_PERMITIDOS = [
  '5100', '5101', '5102', '5103', '5104', '5105', '5106', '5107', '5108',
  '6100', '6101', '6102', '6103', '6104', '6105', '6106', '6107', '6108',
  '5400', '5401', '5402', '5403', '5404', '5405'
];

export const STATUS_CORES = {
  'Pendente': 'bg-red-500',
  'Entregue': 'bg-green-500',
  'Cancelada': 'bg-black',
  'Devolvida': 'bg-purple-500',
  'Reenviada': 'bg-yellow-500',
  'Paga': 'bg-blue-800'
};
