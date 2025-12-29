// Report generation utilities for Excel and CSV exports

export function generateCSV(headers: string[], rows: any[][]): string {
  const csvHeader = headers.join(",");
  const csvRows = rows.map((row) =>
    row.map((cell) => {
      // Escape commas and quotes in cell values
      const cellStr = String(cell ?? "");
      if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(",")
  );
  return [csvHeader, ...csvRows].join("\n");
}

export function downloadCSV(filename: string, csvContent: string) {
  if (typeof window === "undefined") return;
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateExcelHTML(
  title: string,
  headers: string[],
  rows: any[][],
  sheetName: string = "Sheet1"
): string {
  const headerRow = headers.map((h) => `<th>${escapeHTML(h)}</th>`).join("");
  const dataRows = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHTML(String(cell ?? ""))}</td>`).join("")}</tr>`
    )
    .join("");

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #01a4ff; color: white; font-weight: bold; padding: 8px; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h2>${escapeHTML(title)}</h2>
        <table>
          <thead>
            <tr>${headerRow}</tr>
          </thead>
          <tbody>
            ${dataRows}
          </tbody>
        </table>
      </body>
    </html>
  `;
}

export function downloadExcel(filename: string, htmlContent: string) {
  if (typeof window === "undefined") return;
  
  const blob = new Blob([htmlContent], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHTML(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Specific report generators for each module

export function generateBookingsReport(bookings: any[], format: "csv" | "excel") {
  const headers = [
    "Booking ID",
    "Date",
    "Time",
    "Guest Name",
    "Room Number",
    "Nights",
    "Source",
    "Status",
    "Amount (₵)",
    "Reference",
  ];

  const rows = bookings.map((b) => [
    b.id,
    b.date,
    b.time,
    b.guestName,
    b.roomNumber,
    b.nights,
    b.source,
    b.status,
    b.amount,
    b.reference,
  ]);

  const timestamp = new Date().toISOString().split("T")[0];

  if (format === "csv") {
    const csv = generateCSV(headers, rows);
    downloadCSV(`bookings-report-${timestamp}.csv`, csv);
  } else {
    const excel = generateExcelHTML("Bookings Report", headers, rows);
    downloadExcel(`bookings-report-${timestamp}.xls`, excel);
  }
}

export function generatePaymentsReport(payments: any[], format: "csv" | "excel") {
  const headers = [
    "Payment ID",
    "Date",
    "Time",
    "Guest Name",
    "Room Number",
    "Method",
    "Status",
    "Amount (₵)",
    "Reference",
  ];

  const rows = payments.map((p) => [
    p.id,
    p.date,
    p.time,
    p.guestName,
    p.roomNumber,
    p.method,
    p.status,
    p.amount,
    p.reference,
  ]);

  const timestamp = new Date().toISOString().split("T")[0];

  if (format === "csv") {
    const csv = generateCSV(headers, rows);
    downloadCSV(`payments-report-${timestamp}.csv`, csv);
  } else {
    const excel = generateExcelHTML("Payments Report", headers, rows);
    downloadExcel(`payments-report-${timestamp}.xls`, excel);
  }
}

export function generateGuestsReport(guests: any[], format: "csv" | "excel") {
  const headers = [
    "Guest ID",
    "Full Name",
    "Room Number",
    "Room Type",
    "Channel",
    "Check-in",
    "Check-out",
    "Adults",
    "Children",
    "Amount Due (₵)",
    "Amount Paid (₵)",
    "Status",
  ];

  const rows = guests.map((g) => {
    const amountDue = Number(
      g.totalAmount ?? g.amountDue ?? 0
    );

    const amountPaid = Number(
      g.amountPaid ?? (g.paymentStatus === "paid" ? g.totalAmount : 0) ?? 0
    );

    const channel =
      g.bookingSource === "website"
        ? "Online booking"
        : g.bookingSource === "walk_in"
        ? "Walk-in"
        : g.bookingSource || g.channel || "";

    const status = g.paymentStatus || g.status || "";

    return [
      g.id,
      g.fullName,
      g.roomNumber,
      g.roomName || g.roomTypeSlug || "",
      channel,
      g.checkIn,
      g.checkOut,
      g.adults,
      g.children,
      amountDue,
      amountPaid,
      status,
    ];
  });

  const timestamp = new Date().toISOString().split("T")[0];

  if (format === "csv") {
    const csv = generateCSV(headers, rows);
    downloadCSV(`guests-report-${timestamp}.csv`, csv);
  } else {
    const excel = generateExcelHTML("Guests Report", headers, rows);
    downloadExcel(`guests-report-${timestamp}.xls`, excel);
  }
}

export function generateStaffReport(staff: any[], format: "csv" | "excel") {
  const headers = [
    "Staff ID",
    "Full Name",
    "Role",
    "Contact",
    "Shift",
    "Status",
    "Menu Access",
  ];

  const rows = staff.map((s) => [
    s.id,
    s.name,
    s.role,
    s.contact,
    s.shift,
    s.status,
    s.menuAccess?.join("; ") || "",
  ]);

  const timestamp = new Date().toISOString().split("T")[0];

  if (format === "csv") {
    const csv = generateCSV(headers, rows);
    downloadCSV(`staff-report-${timestamp}.csv`, csv);
  } else {
    const excel = generateExcelHTML("Staff Report", headers, rows);
    downloadExcel(`staff-report-${timestamp}.xls`, excel);
  }
}

export function generateAnalyticsReport(data: any, format: "csv" | "excel") {
  const headers = [
    "Metric",
    "Value",
  ];

  const rows = [
    ["Total Revenue", `₵${data.totalRevenue?.toLocaleString() || 0}`],
    ["Total Bookings", data.totalBookings || 0],
    ["Occupancy Rate", `${data.occupancyRate || 0}%`],
    ["Average Daily Rate", `₵${data.averageDailyRate || 0}`],
    ["Checked In Guests", data.checkedIn || 0],
    ["Upcoming Arrivals", data.upcoming || 0],
    ["Total Guests", data.totalGuests || 0],
    ["Report Generated", new Date().toLocaleString()],
  ];

  const timestamp = new Date().toISOString().split("T")[0];

  if (format === "csv") {
    const csv = generateCSV(headers, rows);
    downloadCSV(`analytics-report-${timestamp}.csv`, csv);
  } else {
    const excel = generateExcelHTML("Analytics Report", headers, rows);
    downloadExcel(`analytics-report-${timestamp}.xls`, excel);
  }
}
