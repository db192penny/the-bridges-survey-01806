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
    
    // Build readable additional vendors summary by matching keys back to category names
    const additionalVendorsSummary = response.additional_categories_requested
      .map((categoryName) => {
        const categoryKey = categoryName.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
        const vendors = response.additional_vendors[categoryKey] || [];
        const vendorNames = vendors.filter(Boolean).join(", ");
        return vendorNames ? `${categoryName}: ${vendorNames}` : null;
      })
      .filter(Boolean)
      .join(" | ");
    
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
      additionalVendorsSummary,
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

function decodeQuotedPrintable(input: string): string {
  if (!input) return "";
  // Remove soft line breaks
  const cleaned = input.replace(/=\r?\n/g, "");
  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === "=" && i + 2 < cleaned.length) {
      const hex = cleaned.slice(i + 1, i + 3);
      if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
        bytes.push(parseInt(hex, 16));
        i += 2;
        continue;
      }
    }
    // push ASCII codepoint
    bytes.push(cleaned.charCodeAt(i));
  }
  try {
    return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
  } catch {
    // Fallback: naive replacement
    return cleaned.replace(/=([0-9A-Fa-f]{2})/g, (_, h) =>
      String.fromCharCode(parseInt(h, 16))
    );
  }
}

function escapeCSV(value: string): string {
  let v = value ?? "";

  // Decode common email quoted-printable artifacts (e.g., =E2=80=A2 → •)
  v = decodeQuotedPrintable(v);

  // Neutralize CSV formula injection so Excel/Sheets don't evaluate
  if (/^\s*[=+\-@]/.test(v)) {
    v = "'" + v;
  }

  // Standard CSV escaping
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
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
