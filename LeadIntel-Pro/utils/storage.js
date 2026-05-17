import { STORAGE_KEYS } from "./constants.js";

export async function getStorage(key) {

  return new Promise((resolve) => {

    chrome.storage.local.get([key], (result) => {
      resolve(result[key]);
    });

  });
}

export async function setStorage(key, value) {

  return new Promise((resolve) => {

    chrome.storage.local.set({
      [key]: value
    }, () => {
      resolve(true);
    });

  });
}

export async function getCampaigns() {

  const campaigns = await getStorage(STORAGE_KEYS.CAMPAIGNS);

  return campaigns || [];
}

export async function saveCampaign(campaign) {

  const campaigns = await getCampaigns();

  campaigns.push(campaign);

  await setStorage(STORAGE_KEYS.CAMPAIGNS, campaigns);

  return campaigns;
}

export async function getLeads() {

  const leads = await getStorage(STORAGE_KEYS.LEADS);

  return leads || [];
}

export async function saveLead(lead) {

  const leads = await getLeads();

  const exists = leads.some(
    item => item.profileUrl === lead.profileUrl
  );

  if (exists) {
    return false;
  }

  leads.push(lead);

  await setStorage(STORAGE_KEYS.LEADS, leads);

  return true;
}