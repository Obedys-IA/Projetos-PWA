import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Dados simulados para clientes e fretistas
const clientesData = [
  { razaoSocial: "SENDAS DISTRIBUIDORA S/A", cnpj: "06.057.223/0315-65", nomeFantasia: "Assai Juazeiro", rede: "Assai", uf: "BA", vendedor: "Antonio" },
  { razaoSocial: "ATACADAO S.A.", cnpj: "75.315.333/0244-74", nomeFantasia: "Atac Petrolina", rede: "Atacadão", uf: "PE", vendedor: "Antonio" },
  { razaoSocial: "ATAKAREJO DISTRIBUIDOR DE ALIMENTOS E BEBIDAS S.A", cnpj: "73.849.952/0012-00", nomeFantasia: "Atakarejo Alagoinha", rede: "Atakarejo", uf: "BA", vendedor: "Ricardo" }
];

const fretistasData = [
  { placa: "BRY9A41", nome: "Anderson" },
  { placa: "LST7H05", nome: "Andre" },
  { placa: "QKY0D59", nome: "Danilo" }
];

const CFOP_PERMITIDOS = [
  '5100', '5101', '5102', '5103', '5104', '5105', '5106', '5107', '5108',
  '6100', '6101', '6102', '6103', '6104', '6105', '6106', '6107', '6108',
  '5400', '5401', '5402', '5403', '5404', '5405'
];

// Função para simular a extração de dados OCR
const simulateOcr = (fileName: string) => {
  const randomCliente = clientesData[Math.floor(Math.random() * clientesData.length)];
  const randomFretista = fretistasData[Math.floor(Math.random() * fretistasData.length)];
  const randomCfop = CFOP_PERMITIDOS[Math.floor(Math.random() * CFOP_PERMITIDOS.length)];
  
  const hoje = new Date();
  const dataEmissao = new Date(hoje.setDate(hoje.getDate() - Math.floor(Math.random() * 15)));
  const dataVencimento = new Date(dataEmissao.getTime() + (30 * 24 * 60 * 60 * 1000));

  return {
    numeroNF: Math.floor(100000 + Math.random() * 900000).toString(),
    dataEmissao: dataEmissao.toISOString().split('T')[0],
    horaSaida: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    nomeFantasia: randomCliente.nomeFantasia,
    cnpj: randomCliente.cnpj,
    valorNota: parseFloat((Math.random() * 5000 + 500).toFixed(2)),
    dataVencimento: dataVencimento.toISOString().split('T')[0],
    cfop: randomCfop,
    fretista: randomFretista.nome,
    placaVeiculo: randomFretista.placa,
    confidence: Math.random() * (0.98 - 0.85) + 0.85, // Confiança entre 85% e 98%
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, fileName } = await req.json();

    if (!fileUrl || !fileName) {
      throw new Error('fileUrl and fileName are required.');
    }

    // Simula o processamento OCR
    console.log(`Simulando OCR para o arquivo: ${fileName}`);
    const extractedData = simulateOcr(fileName);
    console.log('Dados extraídos:', extractedData);
    
    // Valida o CFOP
    if (!CFOP_PERMITIDOS.includes(extractedData.cfop)) {
      throw new Error(`CFOP ${extractedData.cfop} não é permitido para registro.`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: extractedData,
        message: 'OCR processado com sucesso.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Function execution error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
