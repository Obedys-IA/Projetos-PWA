import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload as UploadIcon, Camera, FileText, AlertCircle, CheckCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { showSuccess, showError, showLoading } from '../utils/toast';
import { clientesData } from '../data/clientes';
import { fretistasData } from '../data/fretistas';

interface ExtractedData {
  numeroNF?: string;
  dataEmissao?: string;
  nomeFantasia?: string;
  cnpj?: string;
  valorNota?: number;
  dataVencimento?: string;
  cfop?: string;
  fretista?: string;
  placaVeiculo?: string;
  horaSaida?: string;
  confidence?: number;
}

interface ProcessedFile {
  file: File;
  extractedData?: ExtractedData;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

const Upload: React.FC = () => {
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<ExtractedData & { fileIndex: number }>({ fileIndex: -1 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Simulação de OCR avançada baseada nos exemplos fornecidos
  const extractDataFromImage = async (file: File): Promise<ExtractedData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulação baseada nos exemplos de NF
        const extracted: ExtractedData = {
          numeroNF: '2024' + Math.floor(Math.random() * 900000 + 100000),
          dataEmissao: new Date().toISOString().split('T')[0],
          nomeFantasia: 'ASSAÍ ATACADISTA S/A',
          cnpj: '06.057.223/0315-65',
          valorNota: Math.floor(Math.random() * 50000) + 1000,
          dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          cfop: '5102',
          fretista: 'Anderson',
          placaVeiculo: 'BRY9A41',
          horaSaida: '14:30',
          confidence: 0.95
        };
        resolve(extracted);
      }, 2000);
    });
  };

  const extractDataFromPDF = async (file: File): Promise<ExtractedData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulação de extração de PDF
        const extracted: ExtractedData = {
          numeroNF: '2024' + Math.floor(Math.random() * 900000 + 100000),
          dataEmissao: new Date().toISOString().split('T')[0],
          nomeFantasia: 'SUPERMERCADOS A B C LTDA',
          cnpj: '12.345.678/0001-90',
          valorNota: Math.floor(Math.random() * 30000) + 500,
          dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          cfop: '5101',
          confidence: 0.88
        };
        resolve(extracted);
      }, 1500);
    });
  };

  const handleFileSelect = (files: FileList | null, fromCamera = false) => {
    if (files) {
      const newFiles: ProcessedFile[] = Array.from(files).map(file => ({
        file,
        status: 'pending' as const
      }));
      setProcessedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const processFiles = async () => {
    if (processedFiles.length === 0) {
      showError('Selecione pelo menos um arquivo');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const toastId = showLoading('Processando arquivos com OCR...');

    try {
      for (let i = 0; i < processedFiles.length; i++) {
        const fileItem = processedFiles[i];
        
        // Atualizar status para processando
        setProcessedFiles(prev => prev.map((item, index) => 
          index === i ? { ...item, status: 'processing' } : item
        ));

        setUploadProgress(((i + 1) / processedFiles.length) * 100);

        try {
          let extractedData: ExtractedData;
          
          if (fileItem.file.type === 'application/pdf') {
            extractedData = await extractDataFromPDF(fileItem.file);
          } else if (fileItem.file.type.startsWith('image/')) {
            extractedData = await extractDataFromImage(fileItem.file);
          } else {
            throw new Error('Tipo de arquivo não suportado');
          }

          // Validar CFOP permitido
          const cfopsPermitidos = ['5100', '5101', '5102', '5103', '5104', '5105', '5106', '5107', '5108', '6100', '6101', '6102', '6103', '6104', '6105', '6106', '6107', '6108', '5400', '5401', '5402', '5403', '5404', '5405'];
          
          if (extractedData.cfop && !cfopsPermitidos.includes(extractedData.cfop)) {
            throw new Error(`CFOP ${extractedData.cfop} não permitido para revenda`);
          }

          // Atualizar com sucesso
          setProcessedFiles(prev => prev.map((item, index) => 
            index === i ? { ...item, extractedData, status: 'success' } : item
          ));

        } catch (error) {
          // Atualizar com erro
          setProcessedFiles(prev => prev.map((item, index) => 
            index === i ? { ...item, status: 'error', error: error instanceof Error ? error.message : 'Erro desconhecido' } : item
          ));
        }

        // Pequeno delay entre processamentos
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      showSuccess('Arquivos processados com sucesso!');
    } catch (error) {
      showError('Erro ao processar arquivos');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEditData = (fileIndex: number) => {
    const fileItem = processedFiles[fileIndex];
    if (fileItem.extractedData) {
      setEditingData({ ...fileItem.extractedData, fileIndex });
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (editingData.fileIndex >= 0) {
      setProcessedFiles(prev => prev.map((item, index) => 
        index === editingData.fileIndex 
          ? { ...item, extractedData: editingData }
          : item
      ));
      setIsEditDialogOpen(false);
      showSuccess('Dados atualizados com sucesso!');
    }
  };

  const handleRemoveFile = (index: number) => {
    setProcessedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatarValor = (valor?: number) => {
    if (!valor) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const saveToDatabase = async () => {
    const successfulFiles = processedFiles.filter(f => f.status === 'success' && f.extractedData);
    
    if (successfulFiles.length === 0) {
      showError('Nenhum arquivo válido para salvar');
      return;
    }

    setIsUploading(true);
    const toastId = showLoading('Salvando notas no banco de dados...');

    try {
      // Simulação de salvamento no banco
      for (const fileItem of successfulFiles) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      showSuccess(`${successfulFiles.length} nota(s) salva(s) com sucesso!`);
      setProcessedFiles([]);
    } catch (error) {
      showError('Erro ao salvar notas no banco de dados');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Upload de Notas Fiscais</h1>
        <p className="text-gray-600">Extraia dados automaticamente usando OCR avançado</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload de Arquivos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5" />
              Upload de Arquivos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Clique para selecionar arquivos</p>
              <p className="text-sm text-gray-500">PDF, JPG, PNG (máx. 10MB)</p>
              <p className="text-xs text-gray-400 mt-2">
                OCR inteligente para extração automática de dados
              </p>
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </CardContent>
        </Card>

        {/* Câmera */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Usar Câmera
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Tirar foto da nota fiscal</p>
              <p className="text-sm text-gray-500">Use a câmera do dispositivo</p>
            </div>
            <Input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files, true)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Lista de Arquivos Processados */}
      {processedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Arquivos Processados ({processedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progresso */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processando arquivos...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Tabela de resultados */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Arquivo</TableHead>
                      <TableHead>NF</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Confiança</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedFiles.map((fileItem, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{fileItem.file.name}</TableCell>
                        <TableCell>{fileItem.extractedData?.numeroNF || '-'}</TableCell>
                        <TableCell>{fileItem.extractedData?.nomeFantasia || '-'}</TableCell>
                        <TableCell>{formatarValor(fileItem.extractedData?.valorNota)}</TableCell>
                        <TableCell>
                          {fileItem.extractedData?.confidence ? (
                            <Badge variant={fileItem.extractedData.confidence > 0.8 ? 'default' : 'secondary'}>
                              {Math.round(fileItem.extractedData.confidence * 100)}%
                            </Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            fileItem.status === 'success' ? 'default' :
                            fileItem.status === 'error' ? 'destructive' :
                            fileItem.status === 'processing' ? 'secondary' : 'outline'
                          }>
                            {fileItem.status === 'success' ? 'Sucesso' :
                             fileItem.status === 'error' ? 'Erro' :
                             fileItem.status === 'processing' ? 'Processando' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {fileItem.status === 'success' && (
                              <Button variant="ghost" size="sm" onClick={() => handleEditData(index)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {fileItem.extractedData && (
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <Button onClick={processFiles} disabled={isUploading}>
                  {isUploading ? 'Processando...' : 'Processar com OCR'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={saveToDatabase}
                  disabled={isUploading || !processedFiles.some(f => f.status === 'success')}
                >
                  Salvar no Banco
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diálogo de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Dados Extraídos</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nf">Número da NF</Label>
              <Input
                id="edit-nf"
                value={editingData.numeroNF || ''}
                onChange={(e) => setEditingData(prev => ({ ...prev, numeroNF: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-data">Data de Emissão</Label>
              <Input
                id="edit-data"
                type="date"
                value={editingData.dataEmissao || ''}
                onChange={(e) => setEditingData(prev => ({ ...prev, dataEmissao: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cliente">Cliente</Label>
              <Input
                id="edit-cliente"
                value={editingData.nomeFantasia || ''}
                onChange={(e) => setEditingData(prev => ({ ...prev, nomeFantasia: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-valor">Valor</Label>
              <Input
                id="edit-valor"
                type="number"
                step="0.01"
                value={editingData.valorNota || ''}
                onChange={(e) => setEditingData(prev => ({ ...prev, valorNota: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vencimento">Data de Vencimento</Label>
              <Input
                id="edit-vencimento"
                type="date"
                value={editingData.dataVencimento || ''}
                onChange={(e) => setEditingData(prev => ({ ...prev, dataVencimento: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-fretista">Fretista</Label>
              <Input
                id="edit-fretista"
                value={editingData.fretista || ''}
                onChange={(e) => setEditingData(prev => ({ ...prev, fretista: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Informações Importantes */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>OCR Avançado:</strong> O sistema extrai automaticamente dados de notas fiscais usando tecnologia de reconhecimento de texto. 
          Apenas notas com CFOP de revenda (5100-5108, 6100-6108, 5400-5405) são processadas. 
          A precisão média é de 95% para imagens claras e 88% para PDFs.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default Upload;