import {
  getCampaigns,
  saveCampaign,
  getLeads,
  deleteCampaign
} from "../utils/storage.js";

import {
  log
} from "../utils/logger.js";

const elements = {

  campaignName:
    document.getElementById(
      "campaignName"
    ),

  campaignKeywords:
    document.getElementById(
      "campaignKeywords"
    ),

  campaignTags:
    document.getElementById(
      "campaignTags"
    ),

  saveCampaignBtn:
    document.getElementById(
      "saveCampaignBtn"
    ),

  startExtractionBtn:
    document.getElementById(
      "startExtractionBtn"
    ),

  pauseExtractionBtn:
    document.getElementById(
      "pauseExtractionBtn"
    ),

  resumeExtractionBtn:
    document.getElementById(
      "resumeExtractionBtn"
    ),

  exportCsvBtn:
    document.getElementById(
      "exportCsvBtn"
    ),

  exportJsonBtn:
    document.getElementById(
      "exportJsonBtn"
    ),

  campaignList:
    document.getElementById(
      "campaignList"
    ),

  leadCount:
    document.getElementById(
      "leadCount"
    ),

  duplicateCount:
    document.getElementById(
      "duplicateCount"
    ),

  campaignCount:
    document.getElementById(
      "campaignCount"
    ),

  engineStatus:
    document.getElementById(
      "engineStatus"
    ),

  logContainer:
    document.getElementById(
      "logContainer"
    ),

  linkedinStatus:
    document.getElementById(
      "linkedinStatus"
    )
};

let selectedCampaignId = null;

async function initialize() {

  await renderCampaigns();

  await renderStats();

  await checkLinkedInTab();

  registerEventListeners();

  addLog(
    "Extension initialized",
    "success"
  );
}

function registerEventListeners() {

  elements.saveCampaignBtn
    .addEventListener(
      "click",
      createCampaign
    );

  elements.startExtractionBtn
    .addEventListener(
      "click",
      startExtraction
    );

  elements.pauseExtractionBtn
    .addEventListener(
      "click",
      pauseExtraction
    );

  elements.resumeExtractionBtn
    .addEventListener(
      "click",
      resumeExtraction
    );

  elements.exportCsvBtn
    .addEventListener(
      "click",
      exportCsv
    );

  elements.exportJsonBtn
    .addEventListener(
      "click",
      exportJson
    );
}

async function renderCampaigns() {

  const campaigns =
    await getCampaigns();

  elements.campaignCount.textContent =
    campaigns.length;

  if (!campaigns.length) {

    elements.campaignList.innerHTML = `
      <div class="empty-state">
        No campaigns available
      </div>
    `;

    return;
  }

  const leads =
    await getLeads();

  elements.campaignList.innerHTML =
    campaigns.map(campaign => {

      const totalLeads =
        leads.filter(
          lead =>
            lead.campaignId ===
            campaign.id
        ).length;

      return `

      <div
        class="campaign-item"
        data-id="${campaign.id}"
      >

        <div class="campaign-top">

          <div>

            <h4>
              ${campaign.name}
            </h4>

            <div class="campaign-meta">
              ${campaign.keywords.length} keywords
            </div>

            <div class="campaign-meta">
              ${totalLeads} leads
            </div>

          </div>

        </div>

        <div class="campaign-actions">

          <button
            class="campaign-run"
            data-id="${campaign.id}"
          >
            Run
          </button>

          <button
            class="campaign-view"
            data-id="${campaign.id}"
          >
            View
          </button>

          <button
            class="campaign-edit"
            data-id="${campaign.id}"
          >
            Edit
          </button>

          <button
            class="campaign-delete"
            data-id="${campaign.id}"
          >
            Delete
          </button>

        </div>

      </div>
      `;
    }).join("");

  bindCampaignActions();
}

// async function renderCampaigns() {

//   const campaigns =
//     await getCampaigns();

//   elements.campaignCount.textContent =
//     campaigns.length;

//   if (!campaigns.length) {

//     elements.campaignList.innerHTML = `
//       <div class="empty-state">
//         No campaigns available
//       </div>
//     `;

//     return;
//   }

//   elements.campaignList.innerHTML =
//     campaigns.map(campaign => `

//       <div
//         class="campaign-item"
//         data-id="${campaign.id}"
//       >

//         <h4>${campaign.name}</h4>

//         <div class="campaign-meta">
//           ${campaign.keywords.length} keywords
//         </div>

//       </div>

//     `).join("");

//   document
//     .querySelectorAll(
//       ".campaign-item"
//     )
//     .forEach(item => {

//       item.addEventListener(
//         "click",
//         () => {

//           document
//             .querySelectorAll(
//               ".campaign-item"
//             )
//             .forEach(card => {

//               card.style.border =
//                 "1px solid #243041";
//             });

//           item.style.border =
//             "1px solid #2563eb";

//           selectedCampaignId =
//             item.dataset.id;

//           addLog(
//             "Campaign selected",
//             "success"
//           );
//         }
//       );
//     });
// }

async function renderStats() {

  const leads =
    await getLeads();

  elements.leadCount.textContent =
    leads.length;

  elements.duplicateCount.textContent =
    "0";
}

async function createCampaign() {

  const name =
    elements.campaignName.value
      .trim();

  const keywords =
    elements.campaignKeywords.value
      .split(",")
      .map(item =>
        item.trim()
      )
      .filter(Boolean);

  const tags =
    elements.campaignTags.value
      .split(",")
      .map(item =>
        item.trim()
      )
      .filter(Boolean);

  if (
    !name ||
    !keywords.length
  ) {

    addLog(
      "Campaign name and keywords required",
      "error"
    );

    return;
  }

  const campaign = {
    id:
      crypto.randomUUID(),

    name,

    keywords,

    tags,

    createdAt:
      new Date().toISOString(),

    stats: {
      leads: 0,
      duplicates: 0
    }
  };

  await saveCampaign(
    campaign
  );

  clearForm();

  await renderCampaigns();

  addLog(
    `Campaign "${name}" created`,
    "success"
  );
}

async function startExtraction() {

  if (!selectedCampaignId) {

    addLog(
      "Select a campaign first",
      "error"
    );

    return;
  }

  try {

    await sendToLinkedInTab({
      type:
        "START_EXTRACTION",

      campaignId:
        selectedCampaignId
    });

    elements.engineStatus
      .textContent =
        "Running";

    addLog(
      "Extraction started",
      "success"
    );

    setTimeout(
      async () => {

        const leads =
          await getLeads();

        await renderStats();

        addLog(
          `Extraction completed. ${leads.length} total leads available.`,
          "success"
        );

        alert(
          `Extraction completed successfully.\n\n${leads.length} total leads captured.\n\nYou can now export your leads.`
        );

      },
      12000
    );

  } catch (error) {

    addLog(
      "Failed to start extraction",
      "error"
    );

    console.error(error);
  }
}

async function pauseExtraction() {

  try {

    await sendToLinkedInTab({
      type:
        "PAUSE_EXTRACTION"
    });

    elements.engineStatus
      .textContent =
        "Paused";

    addLog(
      "Extraction paused"
    );

  } catch (error) {

    console.error(error);
  }
}

async function resumeExtraction() {

  try {

    await sendToLinkedInTab({
      type:
        "RESUME_EXTRACTION"
    });

    elements.engineStatus
      .textContent =
        "Running";

    addLog(
      "Extraction resumed"
    );

  } catch (error) {

    console.error(error);
  }
}

async function exportCsv() {

  const leads =
    await getLeads();

  if (!leads.length) {

    addLog(
      "No leads available",
      "error"
    );

    return;
  }

  const headers = [
    "Name",
    "Title",
    "Company",
    "Profile URL"
  ];

  const rows =
    leads.map(lead => [
      lead.fullName || "",
      lead.title || "",
      lead.company || "",
      lead.profileUrl || ""
    ]);

  const csv = [
    headers.join(","),
    ...rows.map(row =>
      row.join(",")
    )
  ].join("\n");

  const blob =
    new Blob(
      [csv],
      {
        type:
          "text/csv"
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  chrome.downloads.download({
    url,
    filename:
      "leadintel_leads.csv"
  });

  addLog(
    "CSV exported",
    "success"
  );
}

async function exportJson() {

  const leads =
    await getLeads();

  if (!leads.length) {

    addLog(
      "No leads available",
      "error"
    );

    return;
  }

  const blob =
    new Blob(
      [
        JSON.stringify(
          leads,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  chrome.downloads.download({
    url,
    filename:
      "leadintel_leads.json"
  });

  addLog(
    "JSON exported",
    "success"
  );
}

async function sendToLinkedInTab(
  message
) {

  const tabs =
    await chrome.tabs.query({
      url:
        "*://*.linkedin.com/*"
    });

  const linkedInTab =
    tabs.find(
      tab =>
        tab.url &&
        tab.url.includes(
          "linkedin.com"
        )
    );

  if (!linkedInTab?.id) {

    throw new Error(
      "No LinkedIn tab found"
    );
  }

  const wait =
    (ms) =>
      new Promise(
        resolve =>
          setTimeout(
            resolve,
            ms
          )
      );

  const attemptSend =
    async (
      retry = 0
    ) => {

      try {

        const response =
          await chrome.tabs.sendMessage(
            linkedInTab.id,
            message
          );

        return response;

      } catch (error) {

        console.warn(
          `Retry ${retry + 1}`
        );

        if (retry >= 15) {

          throw new Error(
            "LinkedIn content script not ready yet. Refresh LinkedIn page and try again."
          );
        }

        await wait(700);

        return attemptSend(
          retry + 1
        );
      }
    };

  return attemptSend();
}

function clearForm() {

  elements.campaignName.value =
    "";

  elements.campaignKeywords.value =
    "";

  elements.campaignTags.value =
    "";
}

function addLog(
  message,
  type = "info"
) {

  const logData =
    log(message, type);

  const div =
    document.createElement(
      "div"
    );

  div.className =
    "log-item";

  div.textContent =
    `[${logData.timestamp}] ${message}`;

  elements.logContainer.prepend(
    div
  );
}

async function checkLinkedInTab() {

  const tabs = await chrome.tabs.query({
    url: "*://*.linkedin.com/*"
  });

  const linkedInTab =
    tabs.find(
      tab =>
        tab.url &&
        tab.url.includes(
          "linkedin.com"
        )
    );

  if (linkedInTab) {

    elements.linkedinStatus
      .textContent =
        "LinkedIn Active";

  } else {

    elements.linkedinStatus
      .textContent =
        "LinkedIn Not Open";
  }
}

function bindCampaignActions() {

  document
    .querySelectorAll(
      ".campaign-run"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        async () => {

          selectedCampaignId =
            button.dataset.id;

          await startExtraction();
        }
      );
    });

  document
    .querySelectorAll(
      ".campaign-delete"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        async () => {

          const confirmed =
            confirm(
              "Delete this campaign?"
            );

          if (!confirmed) {
            return;
          }

          await deleteCampaign(
            button.dataset.id
          );

          addLog(
            "Campaign deleted",
            "success"
          );

          await renderCampaigns();

          await renderStats();
        }
      );
    });

  document
    .querySelectorAll(
      ".campaign-edit"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        async () => {

          const campaigns =
            await getCampaigns();

          const campaign =
            campaigns.find(
              item =>
                item.id ===
                button.dataset.id
            );

          if (!campaign) {
            return;
          }

          elements.campaignName.value =
            campaign.name;

          elements.campaignKeywords.value =
            campaign.keywords.join(", ");

          elements.campaignTags.value =
            campaign.tags.join(", ");

          selectedCampaignId =
            campaign.id;

          addLog(
            "Campaign loaded for editing"
          );
        }
      );
    });

  document
    .querySelectorAll(
      ".campaign-view"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        async () => {

          await viewCampaignLeads(
            button.dataset.id
          );
        }
      );
    });
}

async function viewCampaignLeads(
  campaignId
) {

  const leads =
    await getLeads();

  const filtered =
    leads.filter(
      lead =>
        lead.campaignId ===
        campaignId
    );

  if (!filtered.length) {

    alert(
      "No leads available"
    );

    return;
  }

  const preview =
    filtered
      .slice(0, 10)
      .map(lead => {

        return `
${lead.fullName || "Unknown"}
${lead.title || ""}
${lead.company || ""}
`;
      })
      .join("\n");

  alert(
    `Total Leads: ${filtered.length}\n\n${preview}`
  );
}



initialize();