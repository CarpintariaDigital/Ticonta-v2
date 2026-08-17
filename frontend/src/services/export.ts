/**
 * Utilitários para exportação de relatórios em CSV/Excel e Impressão formatada
 */
export function exportToCSV(filename: string, rows: (string | number)[][], headers: string[]) {
  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.map((val) => `"${val}"`).join(";")),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printFinancialReport(title: string) {
  window.print();
}
