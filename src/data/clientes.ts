import { Cliente } from '../types';
import { supabaseClientes } from './supabase';

// Fallback para dados locais enquanto o Supabase não está disponível
const localClientes: Cliente[] = [
  {
    razaoSocial: "SENDAS DISTRIBUIDORA S/A",
    cnpj: "06.057.223/0315-65",
    nomeFantasia: "Assai Juazeiro",
    rede: "Assai",
    uf: "BA",
    vendedor: "Antonio"
  },
  {
    razaoSocial: "SENDAS DISTRIBUIDORA S/A",
    cnpj: "06.057.223/0477-20",
    nomeFantasia: "Assai Petrolina",
    rede: "Assai",
    uf: "PE",
    vendedor: "Antonio"
  },
  {
    razaoSocial: "SENDAS DISTRIBUIDORA S/A",
    cnpj: "06.057.223/0407-18",
    nomeFantasia: "Assai Sr Do Bonfim",
    rede: "Assai",
    uf: "BA",
    vendedor: "Antonio"
  },
  {
    razaoSocial: "SENDAS DISTRIBUIDORA S/A",
    cnpj: "06.057.223/0470-54",
    nomeFantasia: "Assai Barris",
    rede: "Assai",
    uf: "BA",
    vendedor: "Nixon"
  },
  {
    razaoSocial: "ATACADAO S.A.",
    cnpj: "75.315.333/0244-74",
    nomeFantasia: "Atac Petrolina",
    rede: "Atacadão",
    uf: "PE",
    vendedor: "Antonio"
  },
  {
    razaoSocial: "ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A",
    cnpj: "73.849.952/0012-00",
    nomeFantasia: "Atakarejo Alagoinha",
    rede: "Atakarejo",
    uf: "BA",
    vendedor: "Ricardo"
  },
  {
    razaoSocial: "CENCOSUD BRASIL COMERCIAL S.A.",
    cnpj: "39.346.861/0194-23",
    nomeFantasia: "GBarbosa Juazeiro Centro",
    rede: "G Barbosa",
    uf: "BA",
    vendedor: "Antonio"
  },
  {
    razaoSocial: "MATEUS SUPERMERCADOS S.A.",
    cnpj: "03.995.515/0258-28",
    nomeFantasia: "Mateus Conceicao Do Coite",
    rede: "Mateus",
    uf: "BA",
    vendedor: "Antonio"
  }
];

export const clientesData: Cliente[] = localClientes;

// Função para buscar clientes do Supabase
export const getClientesData = async (): Promise<Cliente[]> => {
  try {
    return await supabaseClientes.getClientes();
  } catch (error) {
    console.error('Erro ao buscar clientes do Supabase, usando dados locais:', error);
    return localClientes;
  }
};

// Funções de CRUD para clientes
export const createClienteData = async (cliente: Omit<Cliente, 'id'>): Promise<boolean> => {
  try {
    return await supabaseClientes.createCliente(cliente);
  } catch (error) {
    console.error('Erro ao criar cliente no Supabase:', error);
    return false;
  }
};

export const updateClienteData = async (id: string, updates: Partial<Cliente>): Promise<boolean> => {
  try {
    return await supabaseClientes.updateCliente(id, updates);
  } catch (error) {
    console.error('Erro ao atualizar cliente no Supabase:', error);
    return false;
  }
};

export const deleteClienteData = async (id: string): Promise<boolean> => {
  try {
    return await supabaseClientes.deleteCliente(id);
  } catch (error) {
    console.error('Erro ao excluir cliente no Supabase:', error);
    return false;
  }
};