// This file contains utilities for handling PDF files
import type { PDFDocumentProxy } from 'pdfjs-dist';

// We'll use dynamic imports to load PDF.js only on the client side
let PDFJS: any = null;
let activeDocument: any = null;

// Only initialize PDF.js in browser environment
async function loadPdfJS() {
  if (typeof window !== 'undefined' && !PDFJS) {
    try {
      // If we already have a global PDF.js from CDN, use that
      if ((window as any).pdfjsLib) {
        console.log('Using global PDF.js instance');
        PDFJS = (window as any).pdfjsLib;
        return PDFJS;
      }

      // Otherwise, dynamically import PDF.js
      console.log('Dynamically importing PDF.js');
      const pdfjs = await import('pdfjs-dist');
      PDFJS = pdfjs;
      
      // Use the worker source that was set up in PdfJsInitializer
      if (!PDFJS.GlobalWorkerOptions.workerSrc && window.pdfjsWorkerSrc) {
        console.log('Setting PDF.js worker from global variable');
        PDFJS.GlobalWorkerOptions.workerSrc = window.pdfjsWorkerSrc;
      } else if (!PDFJS.GlobalWorkerOptions.workerSrc) {
        // Fallback
        console.log('Using fallback worker URL');
        PDFJS.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      
      return PDFJS;
    } catch (error) {
      console.error("Error loading PDF.js:", error);
      throw new Error("Failed to load PDF.js library: " + (error instanceof Error ? error.message : String(error)));
    }
  }
  return PDFJS;
}

// Extract text from a PDF file
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    // Clean up any previous document to avoid worker issues
    if (activeDocument) {
      try {
        console.log('Cleaning up previous PDF document');
        await activeDocument.cleanup();
        activeDocument = null;
      } catch (cleanupError) {
        console.warn('Error cleaning up previous document:', cleanupError);
      }
    }
    
    // Make sure PDF.js is loaded
    const pdfjs = await loadPdfJS();
    if (!pdfjs) {
      throw new Error('PDF.js could not be loaded. This feature is only available in the browser.');
    }
    
    // Read file as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file);
    
    try {
      // Ensure we have a typed array for the data
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Load the PDF document with proper error handling
      console.log('Creating PDF document with typed array of length:', uint8Array.length);
      
      // Create loading task with proper error handling
      const loadingTask = pdfjs.getDocument({
        data: uint8Array,
        // Additional parameters to improve stability
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/',
        disableAutoFetch: true,
        disableStream: false
      });
      
      // Store the task to handle errors
      const pdf = await loadingTask.promise;
      activeDocument = pdf;
      
      console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);
      let textContent = "";
      
      // Process each page
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Processing page ${i} of ${pdf.numPages}`);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .filter(item => 'str' in item)
          .map(item => (item as any).str)
          .join(' ');
        textContent += pageText + "\n";
        
        // Clean up page resources
        page.cleanup();
      }
      
      // Clean up PDF document properly
      try {
        console.log('Cleaning up PDF document');
        pdf.cleanup();
        activeDocument = null;
      } catch (cleanupError) {
        console.warn('Error during PDF cleanup:', cleanupError);
      }
      
      // If we got meaningful text, return it
      if (textContent && textContent.trim().length > 50) {
        return textContent;
      }
      
      // If text extraction didn't yield good results, suggest OCR
      console.log("Direct text extraction yielded insufficient results");
      return textContent || "This PDF might contain scanned images. Consider using OCR for better text extraction.";
    } catch (error) {
      console.error("Error in direct PDF text extraction:", error);
      return "Error extracting text from PDF. The file might be corrupted or password-protected.";
    }
  } catch (error) {
    console.error("PDF Processing Error:", error);
    return "Failed to process the PDF file.";
  }
}

// Helper function to read file as ArrayBuffer
async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = (error) => {
      console.error("ArrayBuffer read error:", error);
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
}

// Helper function to read file as text
export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => {
      console.error("Text file read error:", error);
      reject(error);
    };
    reader.readAsText(file);
  });
} 