import {
  getCampaigns,
  saveCampaign,
  getLeads
} from "./utils/storage.js";

import {
  ENGINE_STATUS
} from "./utils/constants.js";

import {
  log
} from "./utils/logger.js";

const elements = {
  campaignName: document.getElementById("campaignName"),
  campaignKeywords: document.getElementById("campaignKeywords"),
  campaignTags: document.getElementById("campaignTags"),

  saveCampaignBtn: document.getElementById("saveCampaignBtn"),

  campaignList: document.getElementById("campaignList"),

  leadCount: document.getElementById("leadCount"),
  duplicateCount: document.getElementById("duplicateCount"),
  campaignCount: document.getElementById("campaignCount"),

  engineStatus: document.getElementById("engineStatus"),

  logContainer: document.getElementById("logContainer")
};

async function initialize() {

  await renderCampaigns();

  await renderStats();

  checkLinkedInTab();

  addLog("Extension ready");
}

async function renderCampaigns() {

  const campaigns = await getCampaigns();

  elements.campaignCount.textContent = campaigns.length;

  if (!campaigns.length) {

    elements.campaignList.innerHTML = `
      <div class="empty-state">
        No campaigns available
      </div>
    `;

    return;
  }

  elements.campaignList.innerHTML = campaigns.map(campaign => `
    <div class="campaign-item">
      <h4>${campaign.name}</h4>

      <div class="campaign-meta">
        ${campaign.keywords.length} keywords
      </div>
    </div>
  `).join("");
}

async function renderStats() {

  const leads = await getLeads();

  elements.leadCount.textContent = leads.length;
}

async function createCampaign() {

  const name = elements.campaignName.value.trim();

  const keywords = elements.campaignKeywords.value
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);

  const tags = elements.campaignTags.value
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);

  if (!name || !keywords.length) {

    addLog("Campaign name and keywords required", "error");

    return;
  }

  const campaign = {
    id: crypto.randomUUID(),
    name,
    keywords,
    tags,
    createdAt: new Date().toISOString(),
    stats: {
      leads: 0,
      duplicates: 0
    }
  };

  await saveCampaign(campaign);

  addLog(`Campaign "${name}" created`, "success");

  clearForm();

  await renderCampaigns();
}

function clearForm() {

  elements.campaignName.value = "";
  elements.campaignKeywords.value = "";
  elements.campaignTags.value = "";
}

function addLog(message, type = "info") {

  const logData = log(message, type);

  const div = document.createElement("div");

  div.className = "log-item";

  div.textContent = `[${logData.timestamp}] ${message}`;

  elements.logContainer.prepend(div);
}

async function checkLinkedInTab() {

  const tabs = await chrome.tabs.query({});

  const linkedInTab = tabs.find(
    tab => tab.url && tab.url.includes("linkedin.com")
  );

  const statusElement = document.getElementById("linkedinStatus");

  if (linkedInTab) {

    statusElement.textContent = "LinkedIn Active";

  } else {

    statusElement.textContent = "LinkedIn Not Open";
  }
}

elements.saveCampaignBtn.addEventListener(
  "click",
  createCampaign
);

initialize();