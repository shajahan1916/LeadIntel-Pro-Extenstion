import { buildLead } from "./parserHelpers.js";

export function semanticProfileParser() {

  const links = [
    ...document.querySelectorAll(
      'a[href*="/in/"]'
    )
  ];

  const leads = [];

  for (const link of links) {

    try {

      const container =
        link.closest("div");

      if (!container) {
        continue;
      }

      const text =
        container.innerText || "";

      const lines =
        text.split("\n")
          .map(line =>
            line.trim()
          )
          .filter(Boolean);

      const fullName =
        lines[0] || "";

      const title =
        lines[1] || "";

      leads.push(
        buildLead({
          fullName,
          title,
          profileUrl:
            link.href,
          sourceType:
            "semantic"
        })
      );

    } catch {}
  }

  return leads;
}