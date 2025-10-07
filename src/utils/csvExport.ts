import { SurveyResponse } from "./surveyData";

export function generateMainCSV(responses: SurveyResponse[]): string {
  if (responses.length === 0) return "";

  const headers = [
    "Timestamp",
    "Name",
    "Contact Method",
    "Contact",
    "Pool Service",
    "Pool Skip Reason",
    "HVAC",
    "HVAC Skip Reason",
    "Landscaping",
    "Landscaping Skip Reason",
    "Pest Control",
    "Pest Control Skip Reason",
    "Electrician",
    "Electrician Skip Reason",
    "Plumber",
    "Plumber Skip Reason",
    "Handyman",
    "Handyman Skip Reason",
    "Cleaning",
    "Cleaning Skip Reason",
    "Additional Categories",
    "Additional Vendors Summary",
  ];

  const rows = responses.map((response) => {
    const r = response.responses;
    return [
      new Date(response.timestamp).toLocaleString(),
      response.name || "",
      response.contactMethod || "phone",
      response.contact || response.phone || "",
      r.pool_service?.vendors.join("; ") || "",
      r.pool_service?.skip_reason || "",
      r.hvac?.vendors.join("; ") || "",
      r.hvac?.skip_reason || "",
      r.landscaping?.vendors.join("; ") || "",
      r.landscaping?.skip_reason || "",
      r.pest_control?.vendors.join("; ") || "",
      r.pest_control?.skip_reason || "",
      r.electrician?.vendors.join("; ") || "",
      r.electrician?.skip_reason || "",
      r.plumber?.vendors.join("; ") || "",
      r.plumber?.skip_reason || "",
      r.handyman?.vendors.join("; ") || "",
      r.handyman?.skip_reason || "",
      r.cleaning?.vendors.join("; ") || "",
      r.cleaning?.skip_reason || "",
      response.additional_categories_requested.join("; "),
      Object.entries(response.additional_vendors)
        .map(([cat, vendors]) => `${cat}: ${vendors.join(", ")}`)
        .join(" | "),
    ];
  });

  return [headers, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\n");
}

export function generateAdditionalCategoriesCSV(responses: SurveyResponse[]): string {
  const categoryMap: Record<string, { count: number; vendors: string[] }> = {};

  responses.forEach((response) => {
    response.additional_categories_requested.forEach((category) => {
      if (!categoryMap[category]) {
        categoryMap[category] = { count: 0, vendors: [] };
      }
      categoryMap[category].count++;

      const categoryKey = category.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
      const vendorsForCategory = response.additional_vendors[categoryKey] || [];
      categoryMap[category].vendors.push(...vendorsForCategory);
    });
  });

  const headers = ["Category Name", "Times Requested", "All Vendor Names Provided"];
  const rows = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b.count - a.count)
    .map(([category, data]) => [
      category,
      data.count.toString(),
      data.vendors.filter(Boolean).join("; "),
    ]);

  return [headers, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\n");
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
