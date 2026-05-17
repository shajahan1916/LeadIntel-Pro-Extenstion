import {
  parseSearchResults
}
from "./searchParser.js";

import {
  parseFeedPosts
}
from "./feedParser.js";

import {
  semanticProfileParser
}
from "./semanticParser.js";

import {
  fallbackParser
}
from "./fallbackParser.js";

export function extractVisibleLeads() {

  const allLeads = [

    ...parseSearchResults(),

    ...parseFeedPosts(),

    ...semanticProfileParser(),

    ...fallbackParser()
  ];

  const unique =
    new Map();

  for (const lead of allLeads) {

    if (!lead.profileUrl) {
      continue;
    }

    if (
      !unique.has(
        lead.profileUrl
      )
    ) {

      unique.set(
        lead.profileUrl,
        lead
      );
    }
  }

  return [
    ...unique.values()
  ];
}