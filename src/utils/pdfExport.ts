/**
 * Utilities for exporting views to PDF using native browser print or jsPDF.
 */

export function printPageToPdf(docTitle?: string) {
  const originalTitle = document.title;
  if (docTitle) {
    document.title = docTitle;
  }
  
  window.print();
  
  if (docTitle) {
    // Restore title after print dialog closes
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  }
}
