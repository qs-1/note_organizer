// This file contains utilities for OCR (Optical Character Recognition)

// We'll use Tesseract.js for OCR
import { createWorker } from 'tesseract.js';

interface OcrProgress {
  status: string;
  progress: number;
}

// Function to extract text from an image using OCR
export async function recognizeTextFromImage(
  file: File, 
  onProgressUpdate?: (progress: OcrProgress) => void
): Promise<string> {
  try {
    // Create a worker for Tesseract OCR
    const worker = await createWorker();
    
    // Log progress if callback is provided
    if (onProgressUpdate) {
      worker.setLogger(m => {
        if (m.status && typeof m.progress === 'number') {
          onProgressUpdate({
            status: m.status,
            progress: m.progress
          });
        }
      });
    }
    
    // Recognize text from the image
    const { data } = await worker.recognize(file);
    
    // Terminate the worker
    await worker.terminate();
    
    return data.text;
  } catch (error) {
    console.error("Image OCR Error:", error);
    if (error instanceof Error) {
      throw new Error(`OCR failed: ${error.message}`);
    }
    throw new Error("OCR failed with unknown error");
  }
}

// Function to perform OCR on a PDF page (rendered as canvas)
export async function recognizeTextFromCanvas(
  canvas: HTMLCanvasElement,
  onProgressUpdate?: (progress: OcrProgress) => void
): Promise<string> {
  try {
    const worker = await createWorker();
    
    if (onProgressUpdate) {
      worker.setLogger(m => {
        if (m.status && typeof m.progress === 'number') {
          onProgressUpdate({
            status: m.status,
            progress: m.progress
          });
        }
      });
    }
    
    const { data } = await worker.recognize(canvas);
    await worker.terminate();
    
    return data.text;
  } catch (error) {
    console.error("Canvas OCR Error:", error);
    if (error instanceof Error) {
      throw new Error(`Canvas OCR failed: ${error.message}`);
    }
    throw new Error("Canvas OCR failed with unknown error");
  }
} 