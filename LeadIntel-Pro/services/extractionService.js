import stateManager from "../core/stateManager.js";

import eventBus from "../core/eventBus.js";

// import {
//   extractVisibleLeads
// } from "../utils/linkedinParser.js";

import {
  extractVisibleLeads
} from "../utils/linkedinParser/index.js";

import {
  saveLead,
  getLeads
} from "../utils/storage.js";

import {
  throttle,
  normalizeLinkedInUrl
} from "../utils/domUtils.js";

class ExtractionService {

  constructor() {

    this.isInitialized = false;

    this.isRunning = false;

    this.isPaused = false;

    this.observer = null;

    this.interval = null;

    this.processedUrls = new Set();

    this.scanLimit = 150;

    this.scanCount = 0;
  }

  async initialize() {

    if (this.isInitialized) {
      return;
    }

    await this.loadExistingLeadUrls();

    this.registerEvents();

    this.isInitialized = true;
  }

  async loadExistingLeadUrls() {

    try {

      const leads =
        await getLeads();

      for (const lead of leads) {

        if (lead.profileUrl) {

          this.processedUrls.add(
            normalizeLinkedInUrl(
              lead.profileUrl
            )
          );
        }
      }

    } catch (error) {

      console.error(
        "Lead cache loading failed",
        error
      );
    }
  }

  registerEvents() {

    eventBus.on(
      "extraction:start",
      async (campaign) => {

        await this.start(campaign);
      }
    );

    eventBus.on(
      "extraction:pause",
      () => {

        this.pause();
      }
    );

    eventBus.on(
      "extraction:resume",
      () => {

        this.resume();
      }
    );

    eventBus.on(
      "extraction:stop",
      () => {

        this.stop();
      }
    );
  }

  async start(campaign = null) {

    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    this.isPaused = false;

    this.scanCount = 0;

    stateManager.set(
      "extraction.isRunning",
      true
    );

    stateManager.set(
      "extraction.isPaused",
      false
    );

    stateManager.set(
      "extraction.currentCampaignId",
      campaign?.id || null
    );

    this.startObserver();

    this.startInterval();

    await this.scan();

    eventBus.emit(
      "extraction:started",
      campaign
    );

    console.log(
      "Extraction service started"
    );
  }

  pause() {

    if (!this.isRunning) {
      return;
    }

    this.isPaused = true;

    stateManager.set(
      "extraction.isPaused",
      true
    );

    eventBus.emit(
      "extraction:paused"
    );

    console.log(
      "Extraction paused"
    );
  }

  resume() {

    if (!this.isRunning) {
      return;
    }

    this.isPaused = false;

    stateManager.set(
      "extraction.isPaused",
      false
    );

    eventBus.emit(
      "extraction:resumed"
    );

    console.log(
      "Extraction resumed"
    );
  }

  stop() {

    this.isRunning = false;

    this.isPaused = false;

    if (this.observer) {

      this.observer.disconnect();

      this.observer = null;
    }

    if (this.interval) {

      clearInterval(
        this.interval
      );

      this.interval = null;
    }

    stateManager.set(
      "extraction.isRunning",
      false
    );

    stateManager.set(
      "extraction.isPaused",
      false
    );

    eventBus.emit(
      "extraction:stopped"
    );

    console.log(
      "Extraction stopped"
    );
  }

  startObserver() {

    const throttled =
      throttle(() => {

        if (
          this.isRunning &&
          !this.isPaused
        ) {

          this.scan();
        }

      }, 3000);

    this.observer =
      new MutationObserver(() => {

        throttled();
      });

    this.observer.observe(
      document.body,
      {
        childList: true,
        subtree: true
      }
    );
  }

  startInterval() {

    this.interval =
      setInterval(async () => {

        if (
          !this.isRunning ||
          this.isPaused
        ) {
          return;
        }

        if (
          this.scanCount >=
          this.scanLimit
        ) {

          console.warn(
            "Session scan limit reached"
          );

          this.stop();

          return;
        }

        await this.scan();

      }, 8000);
  }

  async scan() {

    try {

      this.scanCount++;

      stateManager.set(
        "extraction.totalScans",
        this.scanCount
      );

      stateManager.set(
        "extraction.lastScanAt",
        new Date().toISOString()
      );

      const leads =
        extractVisibleLeads();

      if (!Array.isArray(leads)) {
        return;
      }

      for (const lead of leads) {

        await this.processLead(
          lead
        );
      }

      eventBus.emit(
        "extraction:scanComplete",
        {
          count: leads.length
        }
      );

      console.log(
        `Scan complete: ${leads.length} leads`
      );

    } catch (error) {

      console.error(
        "Extraction scan failed",
        error
      );

      eventBus.emit(
        "extraction:error",
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

      const normalized =
        normalizeLinkedInUrl(
          lead.profileUrl
        );

      if (
        this.processedUrls.has(
          normalized
        )
      ) {

        this.incrementDuplicate();

        return;
      }

      const saved =
        await saveLead({
          ...lead,
          profileUrl: normalized
        });

      if (!saved) {

        this.incrementDuplicate();

        return;
      }

      this.processedUrls.add(
        normalized
      );

      stateManager.push(
        "leads",
        lead
      );

      eventBus.emit(
        "lead:saved",
        lead
      );

      console.log(
        "Lead saved",
        lead.fullName
      );

    } catch (error) {

      console.error(
        "Lead processing failed",
        error
      );
    }
  }

  incrementDuplicate() {

    const duplicates =
      stateManager.get(
        "duplicates"
      ) || [];

    duplicates.push({
      timestamp:
        new Date().toISOString()
    });

    stateManager.set(
      "duplicates",
      duplicates
    );
  }

  getStatus() {

    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      scanCount: this.scanCount,
      processed:
        this.processedUrls.size
    };
  }
}

const extractionService =
  new ExtractionService();

export default extractionService;