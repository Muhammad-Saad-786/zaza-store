/**
 * Utility to format and trigger download of CSV files
 */
export function exportToCSV(filename, rows, headers) {
  if (!rows || !rows.length) {
    alert("No data available to export.");
    return;
  }

  const separator = ",";
  const headerKeys = headers ? headers.map((h) => h.key) : Object.keys(rows[0]);
  const headerLabels = headers ? headers.map((h) => `"${h.label}"`) : headerKeys.map((k) => `"${k}"`);

  const csvContent = [
    headerLabels.join(separator),
    ...rows.map((row) =>
      headerKeys
        .map((key) => {
          let cell = row[key] === null || row[key] === undefined ? "" : row[key];
          cell = typeof cell === "object" ? JSON.stringify(cell) : String(cell);
          // Escape double quotes
          cell = cell.replace(/"/g, '""');
          return `"${cell}"`;
        })
        .join(separator)
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
