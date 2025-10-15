import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload as UploadIcon, Camera, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { showSuccess, showError, showLoading } from '../utils/toast';

const Upload: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedFiles, setProcessedFiles] = useState<{name: string, status: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).filter(file => 
        file.type === 'application/pdf' || 
        file.type.startsWith('image/')
      );
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleCameraCapture = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (selectedFiles.length === 0) {
      showError('Selecione pelo menos um arquivo');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setProcessedFiles([]);

    const toastId = showLoading('Processando arquivos...');

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);

        // Simulação de processamento OCR
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulação de extração de dados
        const extractedData = await extractDataFromPDF(file);
        
        setProcessedFiles(prev => [...prev, {
          name: file.name,
          status: (extractedData as any).success ? 'Sucesso' : 'Erro'
        }]);
      }

      showSuccess('Arquivos processados com sucesso!');
      setSelectedFiles([]);
      setProcessedFiles([]);
    } catch (error) {
      showError('Erro ao processar arquivos');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const extractDataFromPDF = async (file: File) => {
    // Simulação de extração OCR
    // Aqui seria implementada a integração com serviço de OCR
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: {} });
      }, 1000);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Upload de Notas Fiscais</h1>
        <p className="text-gray-600">Envie arquivos PDF ou tire fotos das notas fiscais</p>
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
                Você pode selecionar múltiplos arquivos
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
              onChange={(e) => handleCameraCapture(e.target.files)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Lista de Arquivos Selecionados */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Arquivos Selecionados ({selectedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 space-y-4">
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processando arquivos...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
              
              <Button 
                onClick={processFiles} 
                className="w-full" 
                disabled={isUploading}
              >
                {isUploading ? 'Processando...' : 'Processar Arquivos'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados do Processamento */}
      {processedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados do Processamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {processedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {file.status === 'Sucesso' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>{file.name}</span>
                  </div>
                  <Badge variant={file.status === 'Sucesso' ? 'default' : 'destructive'}>
                    {file.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações Importantes */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> O sistema irá extrair automaticamente os dados das notas fiscais 
          através de OCR. Apenas notas com CFOP de revenda (5100-5108, 6100-6108, 5400-5405) serão processadas. 
          Arquivos PDF com múltiplas páginas terão cada nota processada individualmente.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default Upload;