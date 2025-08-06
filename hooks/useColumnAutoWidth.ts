import { useLayoutEffect, useRef, useState } from "react";

export function useColumnAutoWidth<T>(data: T[], columns: string[]) {
  const shadowRef = useRef<HTMLTableElement>(null);
  const [colWidths, setColWidths] = useState<Record<string, number>>({});

  useLayoutEffect(() => {
    const table = shadowRef.current;
    if (!table) return;

    const observer = new ResizeObserver(() => calculateWidths());
    observer.observe(table);

    function calculateWidths() {
      const rows = table!.querySelectorAll("tr");
      if (!rows.length) return;

      const columnWidths: Record<string, number> = {};

      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        cells.forEach((cell, idx) => {
          const colId = columns[idx];
          const cellWidth = cell.offsetWidth + 24; // Add padding
          columnWidths[colId] = Math.max(columnWidths[colId] || 0, cellWidth);
        });
      });

      const hasChanged =
        Object.keys(columnWidths).length !== Object.keys(colWidths).length ||
        Object.entries(columnWidths).some(
          ([key, val]) => colWidths[key] !== val
        );

      if (hasChanged) {
        setColWidths(columnWidths);
      }
    }

    // Delay measurement until layout is stable
    const raf = requestAnimationFrame(() => {
      calculateWidths();
    });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [
    data.map((row) => JSON.stringify(row)).join("|"),
    columns.join(","),
  ]);

  return { ref: shadowRef, colWidths };
}
