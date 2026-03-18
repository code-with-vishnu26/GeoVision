import jsPDF from "jspdf";

/**
 * Convert an array of objects to CSV string
 */
function convertToCSV(data: Record<string, unknown>[], headers: string[]): string {
    const headerLine = headers.join(",");
    const rows = data.map((row) =>
        headers.map((h) => {
            const val = row[h];
            // Escape commas and quotes
            const str = String(val ?? "");
            return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
        }).join(",")
    );
    return [headerLine, ...rows].join("\n");
}

/**
 * Download a CSV file from data
 */
export function exportCSV(
    data: Record<string, unknown>[],
    headers: string[],
    filename = "report.csv"
) {
    const csv = convertToCSV(data, headers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

/**
 * Download a PDF report with title and tabular data
 */
export function exportPDF(
    title: string,
    data: Record<string, unknown>[],
    headers: string[],
    filename = "report.pdf"
) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth / 2, 20, { align: "center" });

    // Subtitle with date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: "center" });
    doc.setTextColor(0);

    // Table
    const startY = 38;
    const colWidth = (pageWidth - 30) / headers.length;
    const rowHeight = 8;

    // Header row
    doc.setFillColor(30, 41, 59); // dark slate
    doc.rect(15, startY, pageWidth - 30, rowHeight, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255);
    headers.forEach((h, i) => {
        doc.text(h, 17 + i * colWidth, startY + 5.5);
    });
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");

    // Data rows
    data.forEach((row, rowIdx) => {
        const y = startY + rowHeight + rowIdx * rowHeight;
        if (y > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
        }
        if (rowIdx % 2 === 0) {
            doc.setFillColor(241, 245, 249);
            doc.rect(15, y, pageWidth - 30, rowHeight, "F");
        }
        doc.setFontSize(8);
        headers.forEach((h, i) => {
            doc.text(String(row[h] ?? ""), 17 + i * colWidth, y + 5.5);
        });
    });

    doc.save(filename);
}

/**
 * Export simple key-value data as CSV (e.g., classification report)
 */
export function exportSimpleCSV(rows: string[][], filename = "report.csv") {
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}
