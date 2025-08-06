import { RefObject, useCallback } from "react";

export function usePrint<T extends HTMLElement = HTMLElement>(printRef: RefObject<T>) {
  const handlePrint = useCallback(() => {
        if (!printRef.current) {
            console.error("printRef is not attached to an element!");
            return;
        }

        const component = printRef.current;
        if (!component) {
            return;
        }

        const printWindow = window.open("", "_blank", "width=800,height=600");
        if (printWindow) {
            // Ambil semua stylesheet dari dokumen utama
            const styles = Array.from(document.styleSheets)
                .map(styleSheet => {
                    try {
                        // Cek apakah stylesheet bisa diakses (untuk menghindari error CORS)
                        return Array.from(styleSheet.cssRules)
                            .map(rule => rule.cssText)
                            .join('');
                    } catch (e) {
                        console.warn("Could not read stylesheet due to CORS restriction:", e);
                        return '';
                    }
                })
                .join('');
                
            // Buat HTML lengkap untuk jendela cetak
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Print Preview</title>
                    <style>
                        @page {
                            size: landscape;
                        }
                        ${styles}
                        @media print {
                            body {
                                margin: 0;
                            }
                            /* Tailwind CSS specific styles for printing */
                            .page-break-avoid {
                                break-inside: avoid;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${component.innerHTML}
                </body>
                </html>
            `;
            
            printWindow.document.open();
            printWindow.document.write(printContent);
            printWindow.document.close();
            
            // Tunggu hingga konten dimuat lalu cetak
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            };
        }
    }, [printRef.current]);

  return { handlePrint };
}
