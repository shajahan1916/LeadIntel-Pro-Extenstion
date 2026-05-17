// import {
//   extractVisibleLeads
// } from "../utils/linkedinParser.js";
import {
  extractVisibleLeads
} from "../utils/linkedinParser/index.js";
import {
  getLeads,
  saveLead,
  getCampaigns
} from "../utils/storage.js";

import {
  wait,
  throttle
} from "../utils/domUtils.js";

class LinkedInLeadMiner {

  constructor() {

    this.isRunning = false;

    this.isPaused = false;

    this.observer = null;

    this.scanInterval = null;

    this.detectedLeadUrls = new Set();

    this.currentCampaign = null;

    this.scanCount = 0;

    this.maxScansPerSession = 100;

    this.initialize();
  }

  async initialize() {

    console.log(
      "LeadIntel Pro initialized"
    );

    await this.loadExistingLeads();

    this.registerRuntimeListeners();

    this.setupVisibilityHandling();

    this.injectStatusBadge();
  }

  async loadExistingLeads() {

    try {

      const leads = await getLeads();

      for (const lead of leads) {

        if (lead.profileUrl) {

          this.detectedLeadUrls.add(
            lead.profileUrl
          );
        }
      }

    } catch (error) {

      console.error(
        "Failed to load existing leads",
        error
      );
    }
  }

  registerRuntimeListeners() {

    chrome.runtime.onMessage.addListener(
      async (
        message,
        sender,
        sendResponse
      ) => {

        try {

          switch (message.type) {

            case "START_EXTRACTION":

              await this.startExtraction(
                message.campaignId
              );

              sendResponse({
                success: true
              });

              break;

            case "PAUSE_EXTRACTION":

              this.pauseExtraction();

              sendResponse({
                success: true
              });

              break;

            case "RESUME_EXTRACTION":

              this.resumeExtraction();

              sendResponse({
                success: true
              });

              break;

            case "STOP_EXTRACTION":

              this.stopExtraction();

              sendResponse({
                success: true
              });

              break;

            case "GET_EXTRACTION_STATUS":

              sendResponse({
                success: true,
                data: this.getStatus()
              });

              break;
          }

        } catch (error) {

          console.error(
            "Runtime message failed",
            error
          );

          sendResponse({
            success: false,
            error: error.message
          });
        }

        return true;
      }
    );
  }

  async startExtraction(campaignId) {

    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    this.isPaused = false;

    this.scanCount = 0;

    await this.loadCampaign(campaignId);

    this.startDomObserver();

    this.startPeriodicScan();

    await this.scanPage();

    this.updateBadge(
      "Running",
      "#16a34a"
    );

    console.log(
      "Extraction started"
    );
  }

  pauseExtraction() {

    this.isPaused = true;

    this.updateBadge(
      "Paused",
      "#f59e0b"
    );

    console.log(
      "Extraction paused"
    );
  }

  resumeExtraction() {

    if (!this.isRunning) {
      return;
    }

    this.isPaused = false;

    this.updateBadge(
      "Running",
      "#16a34a"
    );

    console.log(
      "Extraction resumed"
    );
  }

  stopExtraction() {

    this.isRunning = false;

    this.isPaused = false;

    if (this.observer) {

      this.observer.disconnect();

      this.observer = null;
    }

    if (this.scanInterval) {

      clearInterval(
        this.scanInterval
      );

      this.scanInterval = null;
    }

    this.updateBadge(
      "Stopped",
      "#dc2626"
    );

    console.log(
      "Extraction stopped"
    );
  }

  async loadCampaign(campaignId) {

    try {

      const campaigns =
        await getCampaigns();

      this.currentCampaign =
        campaigns.find(
          campaign =>
            campaign.id === campaignId
        ) || null;

    } catch (error) {

      console.error(
        "Campaign loading failed",
        error
      );
    }
  }

  startDomObserver() {

    if (this.observer) {

      this.observer.disconnect();
    }

    const throttledScan =
      throttle(() => {

        if (
          this.isRunning &&
          !this.isPaused
        ) {

          this.scanPage();
        }

      }, 3000);

    this.observer =
      new MutationObserver(() => {

        throttledScan();
      });

    this.observer.observe(
      document.body,
      {
        childList: true,
        subtree: true
      }
    );
  }

  startPeriodicScan() {

    if (this.scanInterval) {

      clearInterval(
        this.scanInterval
      );
    }

    this.scanInterval =
      setInterval(async () => {

        if (
          !this.isRunning ||
          this.isPaused
        ) {
          return;
        }

        if (
          this.scanCount >=
          this.maxScansPerSession
        ) {

          console.warn(
            "Session scan limit reached"
          );

          this.stopExtraction();

          return;
        }

        await this.scanPage();

      }, 8000);
  }

  async scanPage() {

    try {

      this.scanCount++;

      const extractedLeads =
        extractVisibleLeads();

      if (
        !Array.isArray(
          extractedLeads
        )
      ) {
        return;
      }

      for (const lead of extractedLeads) {

        await this.processLead(
          lead
        );
      }

      console.log(
        `Scan completed: ${extractedLeads.length} leads found`
      );

    } catch (error) {

      console.error(
        "Page scanning failed",
        error
      );
    }
  }

  async processLead(lead) {

    try {

      if (
        !lead ||
        !lead.profileUrl
      ) {
        return;
      }

      if (
        this.detectedLeadUrls.has(
          lead.profileUrl
        )
      ) {

        return;
      }

      lead.campaignId =
        this.currentCampaign?.id || "";

      lead.keyword =
        this.matchKeyword(
          lead
        );

      const saved =
        await saveLead(lead);

      if (!saved) {
        return;
      }

      this.detectedLeadUrls.add(
        lead.profileUrl
      );

      this.showLeadToast(lead);

      console.log(
        "Lead saved",
        lead
      );

    } catch (error) {

      console.error(
        "Lead processing failed",
        error
      );
    }
  }

  matchKeyword(lead) {

    if (
      !this.currentCampaign ||
      !this.currentCampaign.keywords
    ) {

      return "";
    }

    const searchableText = `
      ${lead.fullName}
      ${lead.title}
      ${lead.company}
      ${lead.postText}
    `.toLowerCase();

    const matched =
      this.currentCampaign.keywords.find(
        keyword =>
          searchableText.includes(
            keyword.toLowerCase()
          )
      );

    return matched || "";
  }

  setupVisibilityHandling() {

    document.addEventListener(
      "visibilitychange",
      () => {

        if (
          document.hidden &&
          this.isRunning
        ) {

          console.log(
            "Tab hidden"
          );
        }
      }
    );
  }

  injectStatusBadge() {

    if (
      document.getElementById(
        "leadintel-badge"
      )
    ) {
      return;
    }

    const badge =
      document.createElement("div");

    badge.id =
      "leadintel-badge";

    badge.innerHTML = `
      <div id="leadintel-status-dot"></div>
      <span id="leadintel-status-text">
        Idle
      </span>
    `;

    Object.assign(
      badge.style,
      {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: "999999",
        background: "#0f172a",
        color: "#ffffff",
        padding: "10px 14px",
        borderRadius: "999px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "12px",
        fontFamily: "Arial",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.3)",
        border:
          "1px solid rgba(255,255,255,0.08)"
      }
    );

    const dot =
      badge.querySelector(
        "#leadintel-status-dot"
      );

    Object.assign(
      dot.style,
      {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "#64748b"
      }
    );

    document.body.appendChild(
      badge
    );
  }

  updateBadge(
    text,
    color
  ) {

    const statusText =
      document.getElementById(
        "leadintel-status-text"
      );

    const statusDot =
      document.getElementById(
        "leadintel-status-dot"
      );

    if (statusText) {

      statusText.textContent =
        text;
    }

    if (statusDot) {

      statusDot.style.background =
        color;
    }
  }

  showLeadToast(lead) {

    const existing =
      document.getElementById(
        "leadintel-toast"
      );

    if (existing) {

      existing.remove();
    }

    const toast =
      document.createElement("div");

    toast.id =
      "leadintel-toast";

    toast.innerHTML = `
      <div style="font-weight:600;">
        New Lead Captured
      </div>

      <div style="margin-top:4px;font-size:12px;opacity:0.8;">
        ${lead.fullName || "Unknown"}
      </div>
    `;

    Object.assign(
      toast.style,
      {
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: "999999",
        background: "#111827",
        color: "#fff",
        padding: "14px 16px",
        borderRadius: "14px",
        width: "240px",
        boxShadow:
          "0 12px 35px rgba(0,0,0,0.35)",
        border:
          "1px solid rgba(255,255,255,0.08)",
        animation:
          "leadMinerFadeIn 0.25s ease"
      }
    );

    document.body.appendChild(
      toast
    );

    setTimeout(() => {

      toast.remove();

    }, 3500);
  }

  getStatus() {

    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      scanCount: this.scanCount,
      currentCampaign:
        this.currentCampaign
    };
  }
}

const style =
  document.createElement("style");

style.textContent = `
@keyframes leadMinerFadeIn {

  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

document.head.appendChild(style);

new LinkedInLeadMiner();