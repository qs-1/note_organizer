// Global type declarations

// Add PDF.js related global properties
interface Window {
  pdfjsWorkerSrc?: string;
  pdfjsLib?: any;
}

// Extend the global namespace
declare global {
  interface Window {
    pdfjsWorkerSrc?: string;
    pdfjsLib?: any;
  }
}

export {}; 