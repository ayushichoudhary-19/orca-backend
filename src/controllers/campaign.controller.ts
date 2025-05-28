import { Request, Response } from "express";
import * as campaignService from "../services/campaign.service";
import { startCallingLeadsService } from "../services/campaignCall.service";
import { Campaign } from "../models/Campaign";

export const createCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await campaignService.createCampaign(req.body);
    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ error: "Failed to create campaign" });
  }
};

export const startCallingLeads = async (req: Request, res: Response) => {
  const { campaignId } = req.params;

  if (!campaignId) {
    return res.status(400).json({ error: "Campaign ID is required" });
  }

  try {
    const session = await startCallingLeadsService(campaignId);
    res.status(200).json({ success: true, session });
  } catch (error) {
    console.error("Failed to start calling leads:", error);
    res.status(500).json({ error: "Failed to start calling leads" });
  }
};

export const getPublicCampaignsForMarketplace = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("Fetching public campaigns...");
    const campaigns =
      await campaignService.getPublicCampaignsWithBusinessName();

    console.log("campaigns fetched:", campaigns.length);

    const sanitized = campaigns.map((campaign) => {
      const business = campaign.businessId as unknown as { name: string };
      return {
        _id: campaign._id,
        campaignName: campaign.campaignName,
        elevatorPitch: campaign.elevatorPitch,
        qualifiedLeadPrice: campaign.qualifiedLeadPrice,
        industry: campaign.industry,
        logoImageUrl: campaign.logoImageUrl,
        companyLocation: campaign.companyLocation,
        businessName: business.name || "Unknown",
        campaignTag: campaign.industry?.[0] || "General",
      };
    });

    res.status(200).json(sanitized);
  } catch (err: any) {
    console.error("Error in /public route:", err.stack || err);
    res.status(500).json({ error: err.message || "Unknown server error" });
  }
};

export const getCampaignById = async (req: Request, res: Response) => {
  try {
    const campaign = await campaignService.getCampaignById(req.params.id);
    res.status(200).json(campaign);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch campaign" });
  }
};

export const getCampaignsByBusiness = async (req: Request, res: Response) => {
  try {
    const campaigns = await campaignService.getCampaignsByBusiness(
      req.params.businessId
    );
    res.status(200).json(campaigns);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
};

export const signCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await campaignService.signCampaign(
      req.params.id,
      req.body
    );
    if (!campaign) {
      console.warn(`No campaign found with id: ${req.params.id}`);
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    res.status(200).json(campaign);
  } catch (err) {
    console.error("Error signing campaign:", err);
    res.status(500).json({ error: "Failed to sign campaign" });
  }
};

export const updateCampaignContacts = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const { contacts, uploadedCsvFileName } = req.body;

    if (!contacts || !uploadedCsvFileName) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const updated = await campaignService.updateCampaignContacts(
      campaignId,
      contacts,
      uploadedCsvFileName
    );

    if (!updated) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update campaign contacts" });
  }
};

export const addContactsToCampaign = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const { contacts, uploadedCsvFileName } = req.body;

    if (!contacts || !uploadedCsvFileName) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const updated = await campaignService.addContactsToCampaign(
      campaignId,
      contacts,
      uploadedCsvFileName
    );

    if (!updated) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add contacts to campaign" });
  }
};

export const addIdealCustomerDetails = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const {
      revenueTarget,
      titles,
      companyLocation,
      employeeLocation,
      industry,
      keywords,
      allowAutoLeads,
    } = req.body;

    const updated = await campaignService.addIdealCustomerDetails(campaignId, {
      revenueTarget,
      titles,
      companyLocation,
      employeeLocation,
      industry,
      keywords,
      allowAutoLeads,
    });

    if (!updated) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add ideal customer details" });
  }
};

export const getCampaignStatus = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const status = await campaignService.getCampaignStatus(campaignId);

    if (status === null) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    res.status(200).json({ status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch campaign status" });
  }
};

export const getMyCampaigns = async (req: Request, res: Response) => {
  const salesRepId = req.body.salesRepId;
  if (!salesRepId) {
    res.status(400).json({ error: "Missing salesRepId" });
    return;
  }
  try {
    const data = await campaignService.fetchCampaignsForSalesRep(salesRepId);
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching campaigns for rep:", err);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
};

export const addCalendlyLink = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { calendlyLink } = req.body;

  try {
    await Campaign.findByIdAndUpdate(id, { calendlyLink });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update Calendly link." });
  }
};

export const getCalendlyLinkByCampaignId = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  try {
    const campaign = await Campaign.findById(id).select("calendlyLink").lean();
    if (!campaign) {
      res.status(404).json({ error: "Campaign not found." });
      return;
    }
    res.status(200).json({ calendlyLink: campaign.calendlyLink });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Calendly link." });
  }
};
