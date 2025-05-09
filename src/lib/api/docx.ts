// This file contains utilities for handling DOCX files

import type { Buffer } from 'buffer';

// Dynamically import mammoth.js to avoid SSR issues
async function loadMammoth() {
  if (typeof window !== 'undefined') {
    try {
      const mammoth = await import('mammoth');
      return mammoth.default || mammoth;
    } catch (error) {
      console.error("Failed to load mammoth.js:", error);
      return null;
    }
  }
  return null;
}

// Function to extract text from a DOCX file
export async function extractTextFromDocx(file: File): Promise<string> {
  try {
    // Load mammoth.js dynamically
    const mammoth = await loadMammoth();
    if (!mammoth) {
      return "DOCX processing is only available in browser environments.";
    }

    // Read the file as an array buffer
    const arrayBuffer = await readFileAsArrayBuffer(file);
    
    // Extract text from the DOCX file
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    // Return the extracted text
    return result.value || "No text could be extracted from this DOCX file.";
  } catch (error) {
    console.error("DOCX Processing Error:", error);
    if (error instanceof Error) {
      return `Failed to process DOCX file: ${error.message}`;
    }
    return "Failed to process DOCX file with unknown error.";
  }
}

// Function to extract text with formatting and styles preserved
export async function extractHtmlFromDocx(file: File): Promise<string> {
  try {
    // Load mammoth.js dynamically
    const mammoth = await loadMammoth();
    if (!mammoth) {
      return "DOCX HTML processing is only available in browser environments.";
    }
    
    // Read file as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file);
    
    // Convert DOCX to HTML
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return result.value || 'No content found in document';
  } catch (error) {
    console.error("DOCX HTML extraction error:", error);
    if (error instanceof Error) {
      return `DOCX HTML extraction failed: ${error.message}`;
    }
    return "DOCX HTML extraction failed with unknown error";
  }
}

// Helper function to read file as ArrayBuffer
async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = (error) => {
      console.error("DOCX ArrayBuffer read error:", error);
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
} 