'use client';

import { useEffect, useState } from 'react';

/**
 * Component to initialize PDF.js worker on the client side
 * This ensures the worker is properly loaded before PDF operations
 */
export default function PdfJsInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initPdfJs = async () => {
      try {
        // Only initialize in browser
        if (typeof window === 'undefined') return;

        // Make sure we only initialize once
        if (isInitialized) return;

        console.log('Initializing PDF.js worker...');

        // Set up global window property to prevent fake worker initialization
        if (!window.pdfjsWorkerSrc) {
          window.pdfjsWorkerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        }

        try {
          // Add the worker script directly to head first
          const workerScript = document.createElement('script');
          workerScript.src = window.pdfjsWorkerSrc;
          workerScript.async = true;
          document.head.appendChild(workerScript);
          
          // Then import PDF.js dynamically
          const pdfjs = await import('pdfjs-dist');
          
          // IMPORTANT: Set the worker source URL BEFORE any other PDF.js operations
          pdfjs.GlobalWorkerOptions.workerSrc = window.pdfjsWorkerSrc;
          
          // Don't test load a document here - it can cause the worker to be destroyed
          // We'll just check that the library is loaded properly
          console.log('PDF.js loaded, version:', pdfjs.version);
          
          console.log('PDF.js worker initialization complete');
          setIsInitialized(true);
        } catch (importError) {
          console.error('Failed to import PDF.js:', importError);
          
          // Try a different CDN approach
          try {
            // Clear any previous script from the head
            const oldScripts = document.querySelectorAll('script[src*="pdf.js"]');
            oldScripts.forEach(script => script.remove());
            
            // Add script element directly
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
            script.async = true;
            
            // When script is loaded, set up the worker
            script.onload = () => {
              // Important: Keep a reference to the global PDF.js
              const pdfjs = (window as any).pdfjsLib;
              if (pdfjs) {
                // Set the worker source
                pdfjs.GlobalWorkerOptions.workerSrc = window.pdfjsWorkerSrc;
                
                // Store on window to make it available
                window.pdfjsLib = pdfjs;
                
                console.log('PDF.js CDN script loaded successfully');
                setIsInitialized(true);
              }
            };
            
            script.onerror = (e) => {
              console.error('Failed to load PDF.js script:', e);
              setError('Could not load PDF.js from CDN');
            };
            
            document.head.appendChild(script);
          } catch (scriptError) {
            console.error('Script loading error:', scriptError);
            setError('PDF.js initialization failed: ' + String(scriptError));
          }
        }
      } catch (err) {
        console.error('Failed to initialize PDF.js worker:', err);
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    initPdfJs();
    
    // Clean up function
    return () => {
      // Don't do any worker cleanup here - it can cause premature worker termination
      console.log('PdfJsInitializer component unmounting');
    };
  }, [isInitialized]);

  // This component doesn't render anything visible
  return null;
} 