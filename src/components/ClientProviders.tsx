'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the PDF.js initializer with no SSR
const PdfJsInitializer = dynamic(
  () => import('./PdfJsInitializer'),
  { ssr: false }
);

export default function ClientProviders({
  children
}: {
  children: React.ReactNode;
}) {
  // Ensure PDF worker source is available globally
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.pdfjsWorkerSrc) {
      window.pdfjsWorkerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      console.log('Set global PDF.js worker URL');
    }
  }, []);

  return (
    <>
      {/* Initialize PDF.js on client-side only */}
      <PdfJsInitializer />
      {children}
    </>
  );
} 