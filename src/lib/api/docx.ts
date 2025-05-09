// This file contains utilities for handling DOCX files

import mammoth from 'mammoth';

// Function to extract text from a DOCX file
export async function extractTextFromDocx(file: File): Promise<string> {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = function() {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          mammoth.extractRawText({ arrayBuffer: arrayBuffer })
            .then(function(result) {
              resolve(result.value);
            })
            .catch(function(error) {
              console.error("DOCX extraction error:", error);
              reject(error);
            });
        } catch (error) {
          console.error("DOCX reader error:", error);
          reject(error);
        }
      };
      reader.onerror = function(error) {
        console.error("FileReader error:", error);
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  } catch (error) {
    console.error("DOCX extraction outer error:", error);
    if (error instanceof Error) {
      throw new Error(`DOCX extraction failed: ${error.message}`);
    }
    throw new Error("DOCX extraction failed with unknown error");
  }
}

// Function to extract text with formatting and styles preserved
export async function extractHtmlFromDocx(file: File): Promise<string> {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = function() {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
            .then(function(result) {
              resolve(result.value);
            })
            .catch(function(error) {
              console.error("DOCX HTML extraction error:", error);
              reject(error);
            });
        } catch (error) {
          console.error("DOCX HTML reader error:", error);
          reject(error);
        }
      };
      reader.onerror = function(error) {
        console.error("FileReader error:", error);
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  } catch (error) {
    console.error("DOCX HTML extraction outer error:", error);
    if (error instanceof Error) {
      throw new Error(`DOCX HTML extraction failed: ${error.message}`);
    }
    throw new Error("DOCX HTML extraction failed with unknown error");
  }
} 