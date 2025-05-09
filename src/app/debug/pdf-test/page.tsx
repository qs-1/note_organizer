'use client';

import { useState, useEffect } from 'react';
import { extractTextFromPdf } from '@/lib/api/pdf';

export default function PdfTestPage() {
  const [pdfText, setPdfText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Initialize PDF.js directly in this page
  useEffect(() => {
    const initPdf = async () => {
      try {
        addDebug('Initializing PDF.js...');
        
        // Set global worker source
        if (typeof window !== 'undefined') {
          window.pdfjsWorkerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          addDebug('Set PDF.js worker URL');

          // Load external scripts
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
          addDebug('PDF.js loaded from CDN');
        }
      } catch (err) {
        addDebug(`Initialization error: ${err instanceof Error ? err.message : String(err)}`);
        setError(`Failed to initialize PDF.js: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    initPdf();
  }, []);

  const addDebug = (message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  const loadScript = (src: string) => {
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => {
        addDebug(`Script loaded: ${src}`);
        resolve();
      };
      script.onerror = (err) => {
        addDebug(`Script failed to load: ${src}`);
        reject(err);
      };
      document.head.appendChild(script);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setPdfText('');
    
    try {
      addDebug(`Processing PDF file: ${file.name} (${file.size} bytes)`);
      const text = await extractTextFromPdf(file);
      setPdfText(text);
      addDebug('PDF processing complete');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addDebug(`PDF processing error: ${errorMessage}`);
      setError(`Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">PDF Processing Test</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select a PDF file to test processing:
        </label>
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange}
          className="block w-full text-sm border border-gray-300 rounded-md p-2"
          disabled={isProcessing}
        />
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center space-x-2 my-4 p-4 bg-blue-50 rounded-md">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Processing PDF...</span>
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-md">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}

      {pdfText && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Extracted Text:</h2>
          <div className="p-4 bg-gray-50 rounded-md border overflow-auto max-h-[400px]">
            <pre className="whitespace-pre-wrap">{pdfText}</pre>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Debug Log:</h2>
        <div className="bg-black text-green-400 p-4 rounded-md overflow-auto max-h-[300px] font-mono text-sm">
          {debugInfo.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
} 