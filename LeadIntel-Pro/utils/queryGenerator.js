const INTENT_PREFIXES = [
  "need",
  "looking for",
  "hire",
  "searching for",
  "best",
  "recommend",
  "urgent need for"
];

const SERVICE_SUFFIXES = [
  "developer",
  "agency",
  "expert",
  "consultant",
  "specialist",
  "company",
  "freelancer"
];

const LOCATION_VARIATIONS = [
  "remote",
  "usa",
  "india",
  "uk",
  "dubai",
  "singapore",
  "canada",
  "australia"
];

const BUYING_INTENT_TERMS = [
  "support",
  "help",
  "services",
  "solution",
  "team",
  "partner"
];

export function generateSearchQueries(
  keyword = ""
) {

  if (!keyword.trim()) {
    return [];
  }

  const normalized =
    keyword.toLowerCase().trim();

  const queries = new Set();

  buildIntentQueries(
    normalized,
    queries
  );

  buildServiceQueries(
    normalized,
    queries
  );

  buildLocationQueries(
    normalized,
    queries
  );

  buildHiringQueries(
    normalized,
    queries
  );

  return [...queries];
}

function buildIntentQueries(
  keyword,
  queries
) {

  for (const prefix of INTENT_PREFIXES) {

    queries.add(
      `${prefix} ${keyword}`
    );

    queries.add(
      `${prefix} ${keyword} services`
    );
  }
}

function buildServiceQueries(
  keyword,
  queries
) {

  for (const suffix of SERVICE_SUFFIXES) {

    queries.add(
      `${keyword} ${suffix}`
    );

    queries.add(
      `best ${keyword} ${suffix}`
    );
  }
}

function buildLocationQueries(
  keyword,
  queries
) {

  for (const location of LOCATION_VARIATIONS) {

    queries.add(
      `${keyword} ${location}`
    );

    queries.add(
      `hire ${keyword} ${location}`
    );
  }
}

function buildHiringQueries(
  keyword,
  queries
) {

  for (const term of BUYING_INTENT_TERMS) {

    queries.add(
      `${keyword} ${term}`
    );

    queries.add(
      `looking for ${keyword} ${term}`
    );
  }
}

export function generateCampaignQueries(
  keywords = []
) {

  const allQueries = new Set();

  for (const keyword of keywords) {

    const generated =
      generateSearchQueries(keyword);

    generated.forEach(query => {
      allQueries.add(query);
    });
  }

  return [...allQueries];
}