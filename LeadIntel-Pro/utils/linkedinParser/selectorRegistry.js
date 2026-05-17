export const SELECTORS = {

  profileLinks: [
    'a[href*="/in/"]'
  ],

  searchCards: [
    ".reusable-search__result-container",
    ".entity-result",
    ".search-result"
  ],

  feedCards: [
    ".feed-shared-update-v2",
    ".occludable-update",
    ".feed-shared-update"
  ],

  peopleCards: [
    ".entity-result",
    ".discover-person-card"
  ],

  profileName: [
    ".update-components-actor__name",
    ".entity-result__title-text",
    "[data-anonymize='person-name']",
    "span[dir='ltr']"
  ],

  profileTitle: [
    ".entity-result__primary-subtitle",
    ".update-components-actor__description",
    ".t-14.t-normal"
  ],

  companyName: [
    ".entity-result__secondary-subtitle",
    ".artdeco-entity-lockup__subtitle"
  ],

  postText: [
    ".break-words",
    ".feed-shared-text",
    ".update-components-text"
  ]
};