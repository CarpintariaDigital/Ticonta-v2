import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface ExtractedDocumentData {
  supplier?: string;
  nuit?: string;
  documentNumber?: string;
  date?: string;
  totalAmount?: number;
  currency?: string;
  vatAmount?: number;
  rawText?: string;
  confidence?: number;
  items?: Array<{
    description: string;
    quantity?: number;
    unitPrice?: number;
    total?: number;
  }>;
}

interface DocumentScannerProps {
  onDataExtracted: (data: ExtractedDocumentData) => void;
  apiBaseUrl?: string;
  onClose?: () => void;
  className?: string;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({
  onDataExtracted,
  apiBaseUrl = '/api/doc-converter',
  onClose,
  className = '',
}) => {
  const [mode, setMode] = useState<'upload' | 'camera'>('upload');
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedDocumentData | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  // Start camera stream
  const startCamera = async () => {
    try {
      setErrorMessage(null);
      stopCamera();

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCapturing(true);
      setMode('camera');
    } catch (err: any) {
      console.error('Erro ao aceder à câmara:', err);
      setErrorMessage(
        'Não foi possível aceder à câmara. Verifique as permissões do navegador ou utilize o upload de ficheiro.'
      );
      setMode('upload');
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [stopCamera, previewUrl]);

  // Capture frame from video canvas
  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setPreviewUrl(dataUrl);
    setSelectedFile(null);
    stopCamera();

    // Process OCR via base64 endpoint
    processOcrBase64(dataUrl);
  };

  // Handle file selection from input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setExtractedData(null);
    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else if (file.type === 'application/pdf') {
      setPreviewUrl(null);
    }

    processOcrFormData(file);
  };

  // OCR using FormData (/scan/extract)
  const processOcrFormData = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('document', file);

      const endpoint = `${apiBaseUrl.replace(/\/$/, '')}/scan/extract`;
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro no processamento OCR (${response.status}): ${response.statusText}`);
      }

      const result = await response.json();
      const normalizedData = normalizeOcrResult(result);
      setExtractedData(normalizedData);
    } catch (err: any) {
      console.error('Erro OCR:', err);
      setErrorMessage(err.message || 'Falha ao extrair dados do documento.');
    } finally {
      setIsLoading(false);
    }
  };

  // OCR using Base64 (/scan/base64)
  const processOcrBase64 = async (dataUrl: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const endpoint = `${apiBaseUrl.replace(/\/$/, '')}/scan/base64`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: dataUrl,
          mime_type: 'image/jpeg',
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro no processamento OCR (${response.status}): ${response.statusText}`);
      }

      const result = await response.json();
      const normalizedData = normalizeOcrResult(result);
      setExtractedData(normalizedData);
    } catch (err: any) {
      console.error('Erro OCR Base64:', err);
      setErrorMessage(err.message || 'Falha ao extrair dados do documento via câmara.');
    } finally {
      setIsLoading(false);
    }
  };

  // Normalize backend payload into standard Moçambique tax/fiscal format
  const normalizeOcrResult = (raw: any): ExtractedDocumentData => {
    const data = raw.data || raw.extracted || raw;
    return {
      supplier: data.supplier || data.fornecedor || data.company_name || data.empresa || '',
      nuit: data.nuit || data.tax_id || data.vat_number || '',
      documentNumber: data.document_number || data.numero_documento || data.invoice_number || data.doc_no || '',
      date: data.date || data.data || data.emission_date || new Date().toISOString().split('T')[0],
      totalAmount: typeof data.total === 'number' ? data.total : parseFloat(data.total || data.total_amount || data.valor_total || '0') || 0,
      currency: data.currency || data.moeda || 'MZN',
      vatAmount: typeof data.vat === 'number' ? data.vat : parseFloat(data.vat || data.iva || data.vat_amount || '0') || 0,
      confidence: typeof data.confidence === 'number' ? data.confidence : (data.score || 0.95),
      rawText: data.raw_text || data.text || '',
      items: data.items || data.linhas || [],
    };
  };

  const handleApplyData = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      if (onClose) onClose();
    }
  };

  const formatConfidence = (conf?: number) => {
    if (conf === undefined || conf === null) return 'N/A';
    const percent = conf <= 1 ? Math.round(conf * 100) : Math.round(conf);
    return `${percent}%`;
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        maxWidth: '720px',
        margin: '0 auto',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: '#1e293b',
      }}
      className={className}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
            Scanner de Documentos e Faturas
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#64748b' }}>
            Extração automática com OCR adaptado para o contexto fiscal de Moçambique
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: '#f1f5f9',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontWeight: 500,
              color: '#475569',
            }}
          >
            Fechar
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => {
            stopCamera();
            setMode('upload');
          }}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '8px',
            border: mode === 'upload' ? '2px solid #2563eb' : '1px solid #e2e8f0',
            background: mode === 'upload' ? '#eff6ff' : '#f8fafc',
            color: mode === 'upload' ? '#1d4ed8' : '#64748b',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Carregar Ficheiro (PDF/JPG/PNG)
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('camera');
            startCamera();
          }}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '8px',
            border: mode === 'camera' ? '2px solid #2563eb' : '1px solid #e2e8f0',
            background: mode === 'camera' ? '#eff6ff' : '#f8fafc',
            color: mode === 'camera' ? '#1d4ed8' : '#64748b',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Capturar com Câmara
        </button>
      </div>

      {/* Main View Area */}
      {mode === 'camera' && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <div
            style={{
              position: 'relative',
              background: '#000',
              borderRadius: '8px',
              overflow: 'hidden',
              maxHeight: '380px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              style={{ width: '100%', maxHeight: '380px', objectFit: 'contain' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
            {isCapturing && (
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                disabled={isLoading}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? 'A processar OCR...' : 'Fotografar Documento'}
              </button>
            )}
            <button
              type="button"
              onClick={stopCamera}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '10px 18px',
                borderRadius: '6px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Parar Câmara
            </button>
          </div>
        </div>
      )}

      {mode === 'upload' && (
        <div
          style={{
            border: '2px dashed #cbd5e1',
            borderRadius: '8px',
            padding: '32px 20px',
            textAlign: 'center',
            background: '#f8fafc',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📄</div>
          <p style={{ margin: 0, fontWeight: 600, color: '#334155' }}>
            Clique ou arraste o ficheiro do documento/fatura aqui
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
            Suporta formatos PDF, JPG, PNG e WebP
          </p>
          {selectedFile && (
            <div style={{ marginTop: '12px', fontSize: '0.875rem', color: '#0284c7', fontWeight: 500 }}>
              Ficheiro selecionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {errorMessage && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '0.875rem',
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#2563eb' }}>
            A extrair dados com o microsserviço doc-converter OCR...
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '4px' }}>
            Identificando NUIT, N.º de Documento, Fornecedor e Valores em Meticais (MZN)
          </p>
        </div>
      )}

      {/* Extracted Details & Preview */}
      {extractedData && !isLoading && (
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
              Dados Fiscais Extraídos
            </h4>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: '9999px',
                background:
                  (extractedData.confidence || 0) >= 0.8
                    ? '#dcfce7'
                    : (extractedData.confidence || 0) >= 0.5
                    ? '#fef9c3'
                    : '#fee2e2',
                color:
                  (extractedData.confidence || 0) >= 0.8
                    ? '#15803d'
                    : (extractedData.confidence || 0) >= 0.5
                    ? '#a16207'
                    : '#b91c1c',
                fontWeight: 600,
              }}
            >
              Confiança OCR: {formatConfidence(extractedData.confidence)}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Fornecedor</span>
              <strong style={{ fontSize: '0.9375rem', color: '#0f172a' }}>
                {extractedData.supplier || 'Não detetado'}
              </strong>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>NUIT Moçambique</span>
              <strong style={{ fontSize: '0.9375rem', color: '#0f172a' }}>
                {extractedData.nuit || 'Não detetado'}
              </strong>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>N.º Documento / Fatura</span>
              <strong style={{ fontSize: '0.9375rem', color: '#0f172a' }}>
                {extractedData.documentNumber || 'Não detetado'}
              </strong>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Data Emissão</span>
              <strong style={{ fontSize: '0.9375rem', color: '#0f172a' }}>
                {extractedData.date || 'Não detetada'}
              </strong>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>IVA (16%)</span>
              <strong style={{ fontSize: '0.9375rem', color: '#0f172a' }}>
                {extractedData.vatAmount !== undefined
                  ? `${extractedData.vatAmount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT`
                  : '0,00 MT'}
              </strong>
            </div>

            <div style={{ background: '#ecfdf5', padding: '10px 14px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#047857', display: 'block' }}>Total a Pagar</span>
              <strong style={{ fontSize: '1.0625rem', color: '#065f46' }}>
                {extractedData.totalAmount !== undefined
                  ? `${extractedData.totalAmount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} ${extractedData.currency || 'MT'}`
                  : '0,00 MT'}
              </strong>
            </div>
          </div>

          {previewUrl && (
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                Pré-visualização da Captura
              </span>
              <img
                src={previewUrl}
                alt="Document Preview"
                style={{
                  maxHeight: '180px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setExtractedData(null)}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '6px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Escanear Outro
            </button>
            <button
              type="button"
              onClick={handleApplyData}
              style={{
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Preencher Formulário de Despesa / Compra
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentScanner;
