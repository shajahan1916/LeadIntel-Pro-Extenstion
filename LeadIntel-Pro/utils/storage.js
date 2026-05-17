import { STORAGE_KEYS } from "./constants.js";

export async function getStorage(key) {

  return new Promise((resolve) => {

    chrome.storage.local.get(
      [key],
      (result) => {

        resolve(result[key]);
      }
    );
  });
}

export async function setStorage(
  key,
  value
) {

  return new Promise((resolve) => {

    chrome.storage.local.set(
      {
        [key]: value
      },
      () => {

        resolve(true);
      }
    );
  });
}

export async function getCampaigns() {

  return (
    await getStorage(
      STORAGE_KEYS.CAMPAIGNS
    )
  ) || [];
}

export async function saveCampaign(
  campaign
) {

  const campaigns =
    await getCampaigns();

  campaigns.push(campaign);

  await setStorage(
    STORAGE_KEYS.CAMPAIGNS,
    campaigns
  );

  return campaign;
}

export async function updateCampaign(
  updatedCampaign
) {

  const campaigns =
    await getCampaigns();

  const updated =
    campaigns.map(campaign => {

      if (
        campaign.id ===
        updatedCampaign.id
      ) {

        return updatedCampaign;
      }

      return campaign;
    });

  await setStorage(
    STORAGE_KEYS.CAMPAIGNS,
    updated
  );

  return true;
}

export async function deleteCampaign(
  campaignId
) {

  const campaigns =
    await getCampaigns();

  const filtered =
    campaigns.filter(
      campaign =>
        campaign.id !== campaignId
    );

  await setStorage(
    STORAGE_KEYS.CAMPAIGNS,
    filtered
  );

  return true;
}

export async function getLeads() {

  return (
    await getStorage(
      STORAGE_KEYS.LEADS
    )
  ) || [];
}

export async function saveLead(
  lead
) {

  const leads =
    await getLeads();

  const exists =
    leads.some(
      item =>
        item.profileUrl ===
        lead.profileUrl
    );

  if (exists) {

    return false;
  }

  lead.id =
    crypto.randomUUID();

  lead.timestamp =
    new Date().toISOString();

  leads.push(lead);

  await setStorage(
    STORAGE_KEYS.LEADS,
    leads
  );

  return true;
}

export async function clearLeads() {

  await setStorage(
    STORAGE_KEYS.LEADS,
    []
  );

  return true;
}