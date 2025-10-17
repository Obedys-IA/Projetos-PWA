import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterPanel } from '../components/FilterPanel';
import { Filtros } from '../types';
import { 
  FileText, 
  MessageSquare, 
  Truck, 
  Building, 
  TrendingUp, 
  AlertTriangle,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { showSuccess } from '../utils/toast';

const Relatorios: React.FC = () => {
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    periodoPredefinido: 'mes-atual'
  });

  const handleSendWhatsApp = (reportType: string) => {
    let message = '';
    
    switch (reportType) {
      case 'resumo-geral':
        message = `📝 RESUMO GERAL DOS CANHOTOS – ATUALIZAÇÃO ${new Date().toLocaleDateString('pt-BR')}

🟢 Recebidos: 960
🔴 Pendentes: 180
⚫ Cancelados: 60
🟣 Devolução Total: 20

📈 Eficiência: 75%
📅 Prazo médio de retorno: 4 dias

🔔 Atrasados (+7 dias): 
- Fretista A - NF 12345 - Cliente X
- Fretista C - NF 67890 - Cliente Y`;
        break;
        
      case 'resumo-fretista':
        message = `📝 RESUMO DOS CANHOTOS POR FRETISTA – ATUALIZAÇÃO ${new Date().toLocaleDateString('pt-BR')}

🚚 Fretista: João

🟢 Canhotos Recebidos: 15
🔴 Pendentes: 3
⏱️ Média retorno: 2,8 dias

📅 Emissão: Segunda-Feira, 16 de Junho de 2025
📌 Pendentes:
- NF 33333 – Cliente X – 5 dias - R$ 1.158,50
- NF 44444 – Cliente Y – 5 dias - R$ 560,00`;
        break;
        
      case 'resumo-cliente':
        message = `📝 RESUMO DOS CANHOTOS POR CLIENTE – ATUALIZAÇÃO ${new Date().toLocaleDateString('pt-BR')}

🏢 CLIENTE: Supermercado União

🟢 Recebidos: 8
🔴 Pendentes: 2
⏱️ Média retorno: 2,8 dias

📌 Pendentes:
- NF 77777 – João – 5 dias - R$ 560,00
- NF 88888 – Maria – 9 dias - R$ 1.158,50`;
        break;
        
      case 'resumo-semanal':
        message = `📅 SEMANA 10 A 16 JUNHO

🚛 Fretistas Por Eficiência:
1. Ana – 100%
2. Carlos – 95%
3. João – 92%
4. Francisco - 90%
5. Roberto - 87,5%

🏢 Clientes com mais Pendências:
👥 Cliente Z – 5 canhotos
👥 Cliente A – 4 canhotos
👥 Cliente B – 3 canhotos`;
        break;
    }
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    showSuccess('Relatório enviado via WhatsApp!');
  };

  const handleExportPDF = (reportType: string) => {
    showSuccess('Gerando relatório PDF...');
    // Implementar lógica de exportação PDF
  };

  const handleExportExcel = () => {
    showSuccess('Exportando dados para Excel...');
    // Implementar lógica de exportação Excel
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Relatórios</h1>
        <p className="text-gray-600">Gere relatórios detalhados das notas fiscais</p>
      </div>

      {/* Filtros */}
      <FilterPanel filtros={filtros} onFiltrosChange={setFiltros} />

      {/* Relatórios via WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Relatórios via WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => handleSendWhatsApp('resumo-geral')}
            >
              <FileText className="h-6 w-6 mb-2" />
              📝 Resumo Geral Diário
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => handleSendWhatsApp('resumo-fretista')}
            >
              <Truck className="h-6 w-6 mb-2" />
              🚛 Resumo por Fretista
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => handleSendWhatsApp('resumo-cliente')}
            >
              <Building className="h-6 w-6 mb-2" />
              🏢 Resumo por Cliente
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => handleSendWhatsApp('resumo-semanal')}
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              🧾 Resumo Semanal de Eficiência
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Relatórios em PDF */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios em PDF
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-16 justify-start"
              onClick={() => handleExportPDF('completo')}
            >
              <FileText className="h-5 w-5 mr-3" />
              📄 Relatório Completo
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 justify-start"
              onClick={() => handleExportPDF('cliente')}
            >
              <Building className="h-5 w-5 mr-3" />
              🧑‍💼 Relatório por Cliente
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 justify-start"
              onClick={() => handleExportPDF('fretista')}
            >
              <Truck className="h-5 w-5 mr-3" />
              🚛 Relatório por Fretista
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 justify-start"
              onClick={() => handleExportPDF('critico')}
            >
              <AlertTriangle className="h-5 w-5 mr-3" />
              🚨 Relatório de Pendências Críticas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exportação de Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportação de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExportExcel} className="w-full md:w-auto">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Exporte todos os dados filtrados para uma planilha Excel
          </p>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">960</div>
              <div className="text-sm text-gray-600">Notas Entregues</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">180</div>
              <div className="text-sm text-gray-600">Notas Pendentes</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">75%</div>
              <div className="text-sm text-gray-600">Eficiência Geral</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;
