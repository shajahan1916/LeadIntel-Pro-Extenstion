import stateManager from "../core/stateManager.js";

import eventBus from "../core/eventBus.js";

import {
  getCampaigns,
  saveCampaign,
  setStorage
} from "../utils/storage.js";

import {
  STORAGE_KEYS
} from "../utils/constants.js";

class CampaignService {

  constructor() {

    this.campaigns = [];
  }

  async initialize() {

    await this.loadCampaigns();

    this.registerEvents();
  }

  registerEvents() {

    eventBus.on(
      "campaign:create",
      async (payload) => {

        await this.createCampaign(
          payload
        );
      }
    );

    eventBus.on(
      "campaign:delete",
      async (campaignId) => {

        await this.deleteCampaign(
          campaignId
        );
      }
    );

    eventBus.on(
      "campaign:update",
      async (payload) => {

        await this.updateCampaign(
          payload.id,
          payload.data
        );
      }
    );
  }

  async loadCampaigns() {

    try {

      this.campaigns =
        await getCampaigns();

      stateManager.set(
        "campaigns",
        this.campaigns
      );

    } catch (error) {

      console.error(
        "Campaign loading failed",
        error
      );
    }
  }

  async createCampaign(data) {

    try {

      const campaign = {
        id: crypto.randomUUID(),

        name:
          data.name?.trim() || "",

        keywords:
          Array.isArray(data.keywords)
            ? data.keywords
            : [],

        tags:
          Array.isArray(data.tags)
            ? data.tags
            : [],

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

      this.campaigns.push(
        campaign
      );

      stateManager.set(
        "campaigns",
        this.campaigns
      );

      eventBus.emit(
        "campaign:created",
        campaign
      );

      console.log(
        "Campaign created",
        campaign.name
      );

      return campaign;

    } catch (error) {

      console.error(
        "Campaign creation failed",
        error
      );

      throw error;
    }
  }

  async updateCampaign(
    campaignId,
    updates
  ) {

    try {

      const index =
        this.campaigns.findIndex(
          item =>
            item.id === campaignId
        );

      if (index === -1) {

        throw new Error(
          "Campaign not found"
        );
      }

      this.campaigns[index] = {
        ...this.campaigns[index],
        ...updates,
        updatedAt:
          new Date().toISOString()
      };

      await this.persist();

      stateManager.set(
        "campaigns",
        this.campaigns
      );

      eventBus.emit(
        "campaign:updated",
        this.campaigns[index]
      );

      return this.campaigns[index];

    } catch (error) {

      console.error(
        "Campaign update failed",
        error
      );

      throw error;
    }
  }

  async deleteCampaign(
    campaignId
  ) {

    try {

      this.campaigns =
        this.campaigns.filter(
          item =>
            item.id !== campaignId
        );

      await this.persist();

      stateManager.set(
        "campaigns",
        this.campaigns
      );

      eventBus.emit(
        "campaign:deleted",
        campaignId
      );

      console.log(
        "Campaign deleted",
        campaignId
      );

      return true;

    } catch (error) {

      console.error(
        "Campaign deletion failed",
        error
      );

      return false;
    }
  }

  async persist() {

    await setStorage(
      STORAGE_KEYS.CAMPAIGNS,
      this.campaigns
    );
  }

  getCampaignById(id) {

    return this.campaigns.find(
      campaign =>
        campaign.id === id
    );
  }

  getAllCampaigns() {

    return [
      ...this.campaigns
    ];
  }

  async incrementLeadCount(
    campaignId
  ) {

    const campaign =
      this.getCampaignById(
        campaignId
      );

    if (!campaign) {
      return;
    }

    campaign.stats.leads += 1;

    await this.persist();

    stateManager.set(
      "campaigns",
      this.campaigns
    );
  }

  async incrementDuplicateCount(
    campaignId
  ) {

    const campaign =
      this.getCampaignById(
        campaignId
      );

    if (!campaign) {
      return;
    }

    campaign.stats.duplicates += 1;

    await this.persist();

    stateManager.set(
      "campaigns",
      this.campaigns
    );
  }
}

const campaignService =
  new CampaignService();

export default campaignService;