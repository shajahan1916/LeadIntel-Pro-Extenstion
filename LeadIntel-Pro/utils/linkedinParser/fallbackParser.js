import {
  buildLead
}
from "./parserHelpers.js";

export function fallbackParser() {

  const leads = [];

  const profileLinks = [
    ...document.querySelectorAll(
      'a[href*="/in/"]'
    )
  ];

  for (const link of profileLinks) {

    leads.push(
      buildLead({
        fullName:
          link.innerText || "",
        profileUrl:
          link.href,
        sourceType:
          "fallback"
      })
    );
  }

  return leads;
}