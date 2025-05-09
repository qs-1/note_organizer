// This file contains utilities for OCR (Optical Character Recognition)

// We'll dynamically import Tesseract.js to avoid SSR issues
import type { Worker, Page } from 'tesseract.js';

export interface OcrProgress {
  status: string;
  progress: number;
}

// Helper function to load Tesseract only in browser context
async function loadTesseract() {
  if (typeof window !== 'undefined') {
    try {
      // Dynamic import for client-side only
      const Tesseract = await import('tesseract.js');
      return Tesseract;
    } catch (error) {
      console.error("Failed to load Tesseract.js:", error);
      throw new Error("OCR library failed to load. This feature only works in the browser.");
    }
  }
  return null;
}

// Function to extract text from an image using OCR
export async function recognizeTextFromImage(
  file: File, 
  onProgressUpdate?: (progress: OcrProgress) => void
): Promise<string> {
  try {
    // Load Tesseract dynamically
    const Tesseract = await loadTesseract();
    if (!Tesseract) {
      return "OCR is only available in browser environments.";
    }

    // Create a worker with proper initialization
    const worker = await Tesseract.createWorker({
      logger: (m) => {
        if (onProgressUpdate && m.status && typeof m.progress === 'number') {
          onProgressUpdate({
            status: m.status,
            progress: m.progress
          });
        }
      },
      // Use a CDN for language files
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
    });
    
    // Load English language data
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    // Recognize text from the file
    const { data } = await worker.recognize(file);
    
    // Clean up resources
    await worker.terminate();
    
    return data.text;
  } catch (error) {
    console.error("Image OCR Error:", error);
    if (error instanceof Error) {
      return `OCR failed: ${error.message}`;
    }
    return "OCR failed with unknown error";
  }
}

// Function to perform OCR on a PDF page (rendered as canvas)
export async function recognizeTextFromCanvas(
  canvas: HTMLCanvasElement,
  onProgressUpdate?: (progress: OcrProgress) => void
): Promise<string> {
  try {
    // Load Tesseract dynamically
    const Tesseract = await loadTesseract();
    if (!Tesseract) {
      return "OCR is only available in browser environments.";
    }
    
    // Create a worker with proper initialization
    const worker = await Tesseract.createWorker({
      logger: (m) => {
        if (onProgressUpdate && m.status && typeof m.progress === 'number') {
          onProgressUpdate({
            status: m.status,
            progress: m.progress
          });
        }
      },
      // Use a CDN for language files
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
    });
    
    // Load English language data
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    // Recognize text from the canvas
    const { data } = await worker.recognize(canvas);
    
    // Clean up resources
    await worker.terminate();
    
    return data.text;
  } catch (error) {
    console.error("Canvas OCR Error:", error);
    if (error instanceof Error) {
      return `Canvas OCR failed: ${error.message}`;
    }
    return "Canvas OCR failed with unknown error";
  }
} 