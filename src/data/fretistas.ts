import { Fretista } from '../types';
import { supabaseFretistas } from './supabase';

// Fallback para dados locais enquanto o Supabase não está disponível
const localFretistas: Fretista[] = [
  {
    placa: "BRY9A41",
    nome: "Anderson"
  },
  {
    placa: "LST7H05",
    nome: "Andre"
  },
  {
    placa: "QKY0D59",
    nome: "Danilo"
  },
  {
    placa: "JOP0J97",
    nome: "Eden"
  },
  {
    placa: "PJF6530",
    nome: "Ednilson"
  },
  {
    placa: "OUO2501",
    nome: "Elvis"
  },
  {
    placa: "OZM8C48",
    nome: "Elvis"
  },
  {
    placa: "PJA3D26",
    nome: "Gustavo"
  },
  {
    placa: "PLK2C22",
    nome: "Josenilson"
  },
  {
    placa: "OSF8808",
    nome: "Natal"
  },
  {
    placa: "JQB8F32",
    nome: "Paulo Noel"
  }
];

export const fretistasData: Fretista[] = localFretistas;

// Função para buscar fretistas do Supabase
export const getFretistasData = async (): Promise<Fretista[]> => {
  try {
    return await supabaseFretistas.getFretistas();
  } catch (error) {
    console.error('Erro ao buscar fretistas do Supabase, usando dados locais:', error);
    return localFretistas;
  }
};

// Funções de CRUD para fretistas
export const createFretistaData = async (fretista: Omit<Fretista, 'id'>): Promise<boolean> => {
  try {
    return await supabaseFretistas.createFretista(fretista);
  } catch (error) {
    console.error('Erro ao criar fretista no Supabase:', error);
    return false;
  }
};

export const updateFretistaData = async (id: string, updates: Partial<Fretista>): Promise<boolean> => {
  try {
    return await supabaseFretistas.updateFretista(id, updates);
  } catch (error) {
    console.error('Erro ao atualizar fretista no Supabase:', error);
    return false;
  }
};

export const deleteFretistaData = async (id: string): Promise<boolean> => {
  try {
    return await supabaseFretistas.deleteFretista(id);
  } catch (error) {
    console.error('Erro ao excluir fretista no Supabase:', error);
    return false;
  }
};