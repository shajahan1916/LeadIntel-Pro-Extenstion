import { SELECTORS }
from "./selectorRegistry.js";

export function findFirstMatch(
  container,
  selectors
) {

  for (const selector of selectors) {

    try {

      const found =
        container.querySelector(
          selector
        );

      if (found) {
        return found;
      }

    } catch {}
  }

  return null;
}

export function findAllMatches(
  selectors
) {

  const results = [];

  for (const selector of selectors) {

    try {

      const elements = [
        ...document.querySelectorAll(
          selector
        )
      ];

      results.push(...elements);

    } catch {}
  }

  return [...new Set(results)];
}

export function getCleanText(
  element
) {

  if (!element) {
    return "";
  }

  return element.innerText
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeUrl(
  url = ""
) {

  try {

    const parsed =
      new URL(url);

    parsed.search = "";
    parsed.hash = "";

    return parsed
      .toString()
      .replace(/\/$/, "")
      .toLowerCase();

  } catch {

    return url
      .trim()
      .toLowerCase();
  }
}

export function buildLead({
  fullName = "",
  title = "",
  company = "",
  profileUrl = "",
  postText = "",
  sourceType = "unknown"
}) {

  return {
    id: crypto.randomUUID(),
    fullName,
    title,
    company,
    profileUrl:
      normalizeUrl(profileUrl),
    postText,
    keyword: "",
    campaignId: "",
    sourceType,
    timestamp:
      new Date().toISOString()
  };
}