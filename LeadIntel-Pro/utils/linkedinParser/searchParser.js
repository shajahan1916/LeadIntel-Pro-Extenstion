import { SELECTORS } from "./selectorRegistry.js";

import { findAllMatches, findFirstMatch, getCleanText, buildLead } from "./parserHelpers.js";

export function parseSearchResults() {

  const cards =
    findAllMatches(
      SELECTORS.searchCards
    );

  const leads = [];

  for (const card of cards) {

    try {

      const profileLink =
        findFirstMatch(
          card,
          SELECTORS.profileLinks
        );

      if (!profileLink) {
        continue;
      }

      const name =
        getCleanText(
          findFirstMatch(
            card,
            SELECTORS.profileName
          )
        );

      const title =
        getCleanText(
          findFirstMatch(
            card,
            SELECTORS.profileTitle
          )
        );

      const company =
        getCleanText(
          findFirstMatch(
            card,
            SELECTORS.companyName
          )
        );

      leads.push(
        buildLead({
          fullName: name,
          title,
          company,
          profileUrl:
            profileLink.href,
          sourceType: "search"
        })
      );

    } catch (error) {

      console.warn(
        "Search parser failed",
        error
      );
    }
  }

  return leads;
}