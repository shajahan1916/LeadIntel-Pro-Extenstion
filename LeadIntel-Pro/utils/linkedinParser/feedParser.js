import { SELECTORS }
from "./selectorRegistry.js";

import {
  findAllMatches,
  findFirstMatch,
  getCleanText,
  buildLead
}
from "./parserHelpers.js";

export function parseFeedPosts() {

  const posts =
    findAllMatches(
      SELECTORS.feedCards
    );

  const leads = [];

  for (const post of posts) {

    try {

      const profileLink =
        findFirstMatch(
          post,
          SELECTORS.profileLinks
        );

      if (!profileLink) {
        continue;
      }

      leads.push(
        buildLead({
          fullName: getCleanText(
            findFirstMatch(
              post,
              SELECTORS.profileName
            )
          ),

          title: getCleanText(
            findFirstMatch(
              post,
              SELECTORS.profileTitle
            )
          ),

          postText: getCleanText(
            findFirstMatch(
              post,
              SELECTORS.postText
            )
          ),

          profileUrl:
            profileLink.href,

          sourceType: "feed"
        })
      );

    } catch (error) {

      console.warn(
        "Feed parser failed",
        error
      );
    }
  }

  return leads;
}