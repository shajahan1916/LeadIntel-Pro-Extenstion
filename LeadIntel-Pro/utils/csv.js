function escapeCsvValue(value) {

  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  const escaped = stringValue.replace(/"/g, '""');

  return `"${escaped}"`;
}

export function convertLeadsToCsv(leads = []) {

  if (!Array.isArray(leads)) {
    throw new Error("Invalid leads array");
  }

  const headers = [
    "ID",
    "Full Name",
    "Title",
    "Company",
    "Profile URL",
    "Post Text",
    "Keyword",
    "Campaign ID",
    "Source Type",
    "Timestamp"
  ];

  const rows = leads.map((lead) => {

    return [
      escapeCsvValue(lead.id),
      escapeCsvValue(lead.fullName),
      escapeCsvValue(lead.title),
      escapeCsvValue(lead.company),
      escapeCsvValue(lead.profileUrl),
      escapeCsvValue(lead.postText),
      escapeCsvValue(lead.keyword),
      escapeCsvValue(lead.campaignId),
      escapeCsvValue(lead.sourceType),
      escapeCsvValue(formatTimestamp(lead.timestamp))
    ].join(",");
  });

  return [
    headers.join(","),
    ...rows
  ].join("\n");
}

export function downloadCsvFile(csvContent, filename = null) {

  try {

    const safeFilename =
      filename ||
      `leadintel_leads_${getFormattedDate()}.csv`;

    const BOM = "\uFEFF";

    const blob = new Blob(
      [BOM + csvContent],
      {
        type: "text/csv;charset=utf-8;"
      }
    );

    const url = URL.createObjectURL(blob);

    chrome.runtime.sendMessage({
      type: "DOWNLOAD_FILE",
      url,
      filename: safeFilename
    });

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5000);

    return true;

  } catch (error) {

    console.error("CSV download failed", error);

    return false;
  }
}

export function exportLeadsAsCsv(leads = []) {

  if (!leads.length) {
    throw new Error("No leads available for export");
  }

  const csv = convertLeadsToCsv(leads);

  return downloadCsvFile(csv);
}

function formatTimestamp(timestamp) {

  if (!timestamp) {
    return "";
  }

  try {

    return new Date(timestamp).toLocaleString();

  } catch {

    return timestamp;
  }
}

function getFormattedDate() {

  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}