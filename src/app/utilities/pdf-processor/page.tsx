'use client';

import { useState } from 'react';
import { extractTextFromPdf } from '@/lib/api/pdf';
import { extractTextFromDocx } from '@/lib/api/docx';
import { recognizeTextFromImage } from '@/lib/api/ocr';

export default function PdfProcessorPage() {
  const [inputText, setInputText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setStatusText(`Processing ${file.name}...`);

    try {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      let text = '';

      // Add detailed console logging for debugging
      console.log('Processing file:', file.name);
      console.log('File type:', fileType);
      console.log('File size:', file.size, 'bytes');

      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        setStatusText('Reading PDF document...');
        console.log('Using PDF extraction...');
        text = await extractTextFromPdf(file);
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        fileName.endsWith('.docx')
      ) {
        setStatusText('Reading Word document...');
        console.log('Using DOCX extraction...');
        text = await extractTextFromDocx(file);
      } else if (
        fileType.startsWith('image/') || 
        /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)
      ) {
        setStatusText('Performing OCR on image...');
        console.log('Using OCR extraction...');
        text = await recognizeTextFromImage(file, (progress) => {
          setProgress(progress.progress * 100);
          setStatusText(`OCR Progress: ${progress.status}`);
        });
      } else {
        throw new Error(`Unsupported file type: ${fileType || fileName}`);
      }

      setExtractedText(text);
      setStatusText('Processing complete!');
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStatusText('Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Document Processing Utility</h1>
      <p className="mb-8 text-center text-gray-600">
        Test PDF, DOCX, and image processing with direct feedback
      </p>

      <div className="mb-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
        <input
          type="file"
          accept=".pdf,.docx,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {isProcessing && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700">{statusText}</p>
            {progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Manual Input</h2>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Or type/paste text here..."
            className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => setExtractedText(inputText)}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Use This Text
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Extracted Text</h2>
          <textarea
            value={extractedText}
            readOnly
            placeholder="Extracted text will appear here..."
            className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none bg-gray-50"
          />
          <div className="mt-4 text-sm text-gray-500">
            {extractedText && (
              <p>Character count: {extractedText.length}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>This utility helps diagnose PDF and document processing issues.</p>
      </div>
    </div>
  );
} 