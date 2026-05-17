import stateManager from "../core/stateManager.js";

import eventBus from "../core/eventBus.js";

import {
  convertLeadsToCsv,
  downloadCsvFile
} from "../utils/csv.js";

import {
  getLeads
} from "../utils/storage.js";

class ExportService {

  constructor() {

    this.initialize();
  }

  initialize() {

    this.registerEvents();
  }

  registerEvents() {

    eventBus.on(
      "export:csv",
      async (payload) => {

        await this.exportCsv(
          payload
        );
      }
    );

    eventBus.on(
      "export:json",
      async (payload) => {

        await this.exportJson(
          payload
        );
      }
    );
  }

  async exportCsv(
    options = {}
  ) {

    try {

      const leads =
        await this.resolveLeads(
          options
        );

      if (!leads.length) {

        throw new Error(
          "No leads available for export"
        );
      }

      const csv =
        convertLeadsToCsv(
          leads
        );

      const filename =
        this.generateFilename(
          "csv"
        );

      downloadCsvFile(
        csv,
        filename
      );

      eventBus.emit(
        "export:success",
        {
          type: "csv",
          filename
        }
      );

      console.log(
        "CSV export completed"
      );

      return true;

    } catch (error) {

      console.error(
        "CSV export failed",
        error
      );

      eventBus.emit(
        "export:error",
        error
      );

      return false;
    }
  }

  async exportJson(
    options = {}
  ) {

    try {

      const leads =
        await this.resolveLeads(
          options
        );

      if (!leads.length) {

        throw new Error(
          "No leads available for export"
        );
      }

      const json =
        JSON.stringify(
          leads,
          null,
          2
        );

      const blob = new Blob(
        [json],
        {
          type: "application/json"
        }
      );

      const url =
        URL.createObjectURL(
          blob
        );

      const filename =
        this.generateFilename(
          "json"
        );

      chrome.runtime.sendMessage({
        type: "DOWNLOAD_FILE",
        url,
        filename
      });

      setTimeout(() => {

        URL.revokeObjectURL(
          url
        );

      }, 5000);

      eventBus.emit(
        "export:success",
        {
          type: "json",
          filename
        }
      );

      console.log(
        "JSON export completed"
      );

      return true;

    } catch (error) {

      console.error(
        "JSON export failed",
        error
      );

      eventBus.emit(
        "export:error",
        error
      );

      return false;
    }
  }

  async resolveLeads(
    options = {}
  ) {

    let leads =
      stateManager.get(
        "leads"
      );

    if (
      !Array.isArray(leads) ||
      !leads.length
    ) {

      leads =
        await getLeads();
    }

    if (
      options.campaignId
    ) {

      leads = leads.filter(
        lead =>
          lead.campaignId ===
          options.campaignId
      );
    }

    if (
      options.keyword
    ) {

      leads = leads.filter(
        lead =>
          (
            lead.keyword || ""
          )
            .toLowerCase()
            .includes(
              options.keyword.toLowerCase()
            )
      );
    }

    return leads;
  }

  generateFilename(
    extension
  ) {

    const date =
      new Date();

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    return `linkedin_leads_${year}-${month}-${day}.${extension}`;
  }
}

const exportService =
  new ExportService();

export default exportService;