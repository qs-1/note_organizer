'use client';

import { useState, useEffect } from 'react';
import { Upload, File, Image, AlertCircle, X } from 'lucide-react';
import { extractTextFromPdf } from '@/lib/api/pdf';
import { extractTextFromDocx } from '@/lib/api/docx';
import { recognizeTextFromImage } from '@/lib/api/ocr';

interface FileUploaderProps {
  onTextExtracted: (text: string, filename: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function FileUploader({ onTextExtracted, isOpen, onClose }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Ensure we have PDF.js available
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.pdfjsWorkerSrc) {
      window.pdfjsWorkerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      console.log('FileUploader: Set PDF.js worker URL');
    }
  }, []);

  if (!isOpen) return null;

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setDebugInfo(null);
    setProgress(0);
    
    try {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      let extractedText = '';
      
      // Log debug info
      console.log(`Processing file: ${fileName}, type: ${fileType}, size: ${file.size} bytes`);
      setDebugInfo(`File: ${fileName} (${fileType}), size: ${Math.round(file.size/1024)}KB`);
      
      // Process based on file type with improved detection
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        // Handle PDF
        setStatusText('Processing PDF document...');
        try {
          extractedText = await extractTextFromPdf(file);
          
          // Check if we got a valid response
          if (extractedText.startsWith('Error') || extractedText.startsWith('Failed')) {
            throw new Error(extractedText);
          }
        } catch (pdfError) {
          console.error('PDF extraction error:', pdfError);
          setDebugInfo(prev => `${prev}\nPDF error: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}`);
          throw new Error(`PDF processing failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown PDF error'}`);
        }
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        fileName.endsWith('.docx')
      ) {
        // Handle DOCX
        setStatusText('Processing Word document...');
        try {
          extractedText = await extractTextFromDocx(file);
        } catch (docxError) {
          console.error('DOCX extraction error:', docxError);
          setDebugInfo(prev => `${prev}\nDOCX error: ${docxError instanceof Error ? docxError.message : String(docxError)}`);
          throw new Error(`DOCX processing failed: ${docxError instanceof Error ? docxError.message : 'Unknown DOCX error'}`);
        }
      } else if (fileType.startsWith('image/') || 
                /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)) {
        // Handle images with OCR
        setStatusText('Performing OCR on image...');
        try {
          extractedText = await recognizeTextFromImage(file, (progress) => {
            setProgress(progress.progress * 100);
            setStatusText(`OCR Progress: ${progress.status}`);
          });
        } catch (ocrError) {
          console.error('OCR error:', ocrError);
          setDebugInfo(prev => `${prev}\nOCR error: ${ocrError instanceof Error ? ocrError.message : String(ocrError)}`);
          throw new Error(`OCR processing failed: ${ocrError instanceof Error ? ocrError.message : 'Unknown OCR error'}`);
        }
      } else {
        throw new Error(`Unsupported file type: ${fileType || fileName}. Please upload a PDF, DOCX, or image file.`);
      }
      
      if (extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from this file. The file may be empty or contain only images.');
      }
      
      onTextExtracted(extractedText, file.name);
      onClose();
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
      setStatusText('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 text-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Document
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={isProcessing}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div 
          className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="text-center">
              <div className="mx-auto mb-3 w-12 h-12 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium">{statusText || 'Processing document...'}</p>
              {progress > 0 && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="flex space-x-3">
                  <File className="h-10 w-10 text-gray-400" />
                  <Image className="h-10 w-10 text-gray-400" />
                </div>
              </div>
              <p className="text-sm mb-2">
                Drag and drop a file here, or click to select
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Supports PDF, DOCX, and image files (JPG, PNG)
              </p>
              <input
                type="file"
                id="fileInput"
                className="hidden"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                onChange={handleFileInput}
              />
              <button
                onClick={() => document.getElementById('fileInput')?.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Select File
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-sm font-medium">{error}</span>
              {debugInfo && (
                <pre className="mt-2 text-xs p-2 bg-red-50 rounded overflow-auto max-h-32">
                  {debugInfo}
                </pre>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 mb-4">
          <p>
            <strong>Note:</strong> For images and scanned PDFs, OCR will be used to extract text. This may take longer and the quality depends on the image clarity.
          </p>
        </div>

        <div className="flex justify-end">
          <button 
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 