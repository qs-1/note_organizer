// This file contains utilities for handling PDF files

// Import PDF.js dynamically (client-side only)
let pdfjsLib: any;

// Initialize PDF.js worker
export async function initPdfLib() {
  if (typeof window !== 'undefined') {
    pdfjsLib = await import('pdf-lib');
    
    // Make sure to import the PDF.js worker from CDN
    const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  }
}

// Extract text from a PDF file
export async function extractTextFromPdf(file: File): Promise<string> {
  if (!pdfjsLib) {
    await initPdfLib();
  }
  
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file);
    
    try {
      // Try direct text extraction first (fastest method)
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      let textContent = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        const pageText = text.items.map((item: any) => item.str).join(' ');
        textContent += pageText + "\n";
      }
      
      // If we got meaningful text, return it
      if (textContent && textContent.trim().length > 50) {
        return textContent;
      }
      
      // If text extraction didn't yield good results, fall back to OCR
      console.log("Direct text extraction yielded insufficient results, falling back to OCR");
      
      // Here we would typically call Tesseract for OCR, which will be
      // implemented in another file
      
      return textContent || "Failed to extract meaningful text from PDF";
    } catch (error) {
      console.error("Error in direct PDF text extraction:", error);
      return "Error extracting text from PDF";
    }
  } catch (error) {
    console.error("PDF Processing Error:", error);
    return "";
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