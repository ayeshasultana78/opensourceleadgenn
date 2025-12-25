import { Lead } from "../types";

export const downloadCSV = (data: Lead[], filename: string) => {
  if (!data || data.length === 0) return;

  const headers = [
    "Name",
    "Type",
    "Phone",
    "Email",
    "Website",
    "Instagram",
    "LinkedIn",
    "Rating",
    "Reviews",
    "Address",
    "Maps Link",
    "Lead Score"
  ];

  const csvRows = [
    headers.join(","), // header row
    ...data.map(row => {
      const values = [
        `"${row.name.replace(/"/g, '""')}"`,
        `"${row.type.replace(/"/g, '""')}"`,
        `"${row.phone.replace(/"/g, '""')}"`,
        `"${row.email.replace(/"/g, '""')}"`,
        `"${row.website.replace(/"/g, '""')}"`,
        `"${(row.instagram || '').replace(/"/g, '""')}"`,
        `"${(row.linkedin || '').replace(/"/g, '""')}"`,
        row.rating,
        row.reviewCount,
        `"${row.address.replace(/"/g, '""')}"`,
        `"${row.googleMapsLink || ''}"`,
        row.leadScore || 0
      ];
      return values.join(",");
    })
  ];

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadBatchPitchCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;

  const headers = [
    "Lead Score",
    "Business Name",
    "Website",
    "Email",
    "Phone",
    "Confidence Level",
    "Primary Issue",
    "Service to Pitch",
    "Email Subject",
    "Email Body"
  ];

  const csvRows = [
    headers.join(","),
    ...data.map(row => {
      const values = [
        row.lead_score,
        `"${row.name.replace(/"/g, '""')}"`,
        `"${row.website.replace(/"/g, '""')}"`,
        `"${row.email.replace(/"/g, '""')}"`,
        `"${row.phone.replace(/"/g, '""')}"`,
        `"${row.confidence_level}"`,
        `"${row.primary_issue.replace(/"/g, '""')}"`,
        `"${row.service_to_pitch.replace(/"/g, '""')}"`,
        `"${row.email_subject.replace(/"/g, '""')}"`,
        `"${row.email_body.replace(/"/g, '""').replace(/\n/g, ' ')}"` // Remove newlines for cleaner CSV rows in some readers
      ];
      return values.join(",");
    })
  ];

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-pitch-export.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};