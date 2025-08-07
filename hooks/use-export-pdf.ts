import { TableHeader } from "@/types/general";
import { formatInTimeZone } from "date-fns-tz";
import { id } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable, { CellHookData, Color, FontStyle, HAlignType, VAlignType } from 'jspdf-autotable';

interface PdfGeneratorProps {
  orientation?: "landscape" | "portrait" | "l" | "p";
  title: string;
  tableHeaders: TableHeader[][]; // ⬅️ Sekarang ini array of rows
  tableBody: any[][];
  typeData: "lp-li" | "absensi" | "personnel";
  centerBody?: boolean;
  dateRange?: {
    dateFrom: Date | string
    dateUntil: Date | string
  }
}

export const usePdfGenerator = () => {
  const generatePdf = ({
    orientation = "landscape",
    title,
    tableHeaders,
    dateRange,
    tableBody,
    typeData,
    centerBody
  }: PdfGeneratorProps) => {
    const doc = new jsPDF({ orientation });

    // 🧠 1. Langsung assign headerRows dari props
    const headerRows = tableHeaders;

    if(["absensi", "personnel"].includes(typeData)) {
        // Contoh bikin heading besar
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text("BADAN RESERSE KRIMINAL POLRI", doc.internal.pageSize.getWidth() / 4, 20, { align: "center" });

        // Heading kedua, di bawahnya, dengan underline
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        const secondLine = "DIREKTORAT TINDAK PIDANA EKONOMI DAN KHUSUS";
        const centerX = doc.internal.pageSize.getWidth() / 4;
        doc.text(secondLine, centerX, 24, { align: "center" });

        // Manual underline pakai garis
        const textWidth = doc.getTextWidth(secondLine);
        doc.setLineWidth(0.5);
        doc.line(centerX - textWidth / 2, 25, centerX + textWidth / 2, 25); // garis di bawah text
    }

    if(typeData === "absensi") {
        const centerX = doc.internal.pageSize.getWidth() / 2;
        // Heading ketiga dengan bold + underline (lebih gede dikit)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const thirdLine = "ABSENSI / DAFTAR HADIR SUBDIT 1 INDAG";
        doc.text(thirdLine, centerX, 40, { align: "center" });

        const fourthLine = `PADA HARI SELASA TANGGAL ${ formatInTimeZone(new Date(dateRange?.dateFrom as Date), 'UTC', 'dd MMMM yyyy', { locale: id }) } - ${ formatInTimeZone(new Date(dateRange?.dateUntil as Date), 'UTC', 'dd MMMM yyyy', { locale: id }) }`;
        doc.text(fourthLine, centerX, 45, { align: "center" });
        const textWidth4 = doc.getTextWidth(fourthLine);
        doc.line(centerX - textWidth4 / 2, 46, centerX + textWidth4 / 2, 46); // underline lagi
    }

    if(typeData === "personnel") {
        const centerX = doc.internal.pageSize.getWidth() / 2;
        // Heading ketiga dengan bold + underline (lebih gede dikit)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const thirdLine = "DATA PERSONEL PENDIDIKAN KEPOLISIAN, UMUM DAN KEJURUAN";
        doc.text(thirdLine, centerX, 40, { align: "center" });
        const textWidth3 = doc.getTextWidth(thirdLine);
        doc.line(centerX - textWidth3 / 2, 41, centerX + textWidth3 / 2, 41); // underline lagi

        const fourthLine = "SUBDIT I DITTIPIDEKSUS";
        doc.text(fourthLine, centerX, 45, { align: "center" });
    }

    if(typeData === "lp-li") {
        const centerX = doc.internal.pageSize.getWidth() / 2;
        // Heading ketiga dengan bold + underline (lebih gede dikit)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        
        const thirdLine = "MATRIKS PENANGANAN LAPORAN POLISI";
        doc.text(thirdLine, centerX, 40, { align: "center" });

        const fourthLine = "UNIT II SUBDIT I DITTIPIDEKSUS BARESKRIM POLRI";
        doc.text(fourthLine, centerX, 46, { align: "center" });
    }

    // 🧠 2. Extract header styles map: 
    // flatten semua cell di semua baris, jadi bisa apply style per kolom final
    const headerStylesMap: {
      fillColor: Color;
      textColor: Color;
      fontStyle: FontStyle;
    }[] = [];

    headerRows.forEach(row => {
      row.forEach(cell => {
        const colSpan = cell.colSpan ?? 1;
        const style = {
          fillColor: (cell.styles?.fillColor || [22, 160, 133]) as Color,
          textColor: (cell.styles?.textColor || [255, 255, 255]) as Color,
          fontStyle: (cell.styles?.fontStyle || "bold") as FontStyle,
        };
        for (let i = 0; i < colSpan; i++) {
          headerStylesMap.push(style);
        }
      });
    });

    // 🧠 4. Generate Table
    autoTable(doc, {
      startY: 50,
      head: headerRows.map(row => row.map(cell => {
        const { content, colSpan, rowSpan, styles } = cell;
        return {
          content,
          colSpan,
          rowSpan,
          styles: {
            halign: (styles?.halign || 'center') as HAlignType,
            valign: (styles?.valign || 'middle') as VAlignType,
          },
        };
      })),
      body: tableBody,
      margin: { top: 30, left: 14, right: 14 },
      styles: {
        overflow: 'linebreak',
        cellPadding: 3,
        fontSize: 8,
      },
      headStyles: {
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.2,
        lineColor: [0, 0, 0],
      },
      bodyStyles: {
        ...(centerBody && { halign: "center" }),
        lineWidth: 0.2,
        lineColor: [0, 0, 0],
      },
      didDrawPage: () => {
        // optional: header/footer
      },
      didParseCell: (data: CellHookData) => {
        if (data.section === "head") {
          const styleIndex = data.column.index;
          const headerStyle = headerStylesMap[styleIndex];
          if (headerStyle) {
            data.cell.styles.fillColor = headerStyle.fillColor as Color;
            data.cell.styles.textColor = headerStyle.textColor as Color;
            data.cell.styles.fontStyle = headerStyle.fontStyle as FontStyle;
          }
        }
      },
    });

    doc.save(`${title}.pdf`);
  };

  return { generatePdf };
};
