import { Campaign, CampaignStatus } from "../models/Campaign";
import { SalesRepCampaignStatus } from "../models/SalesRepCampaignStatus";

export const createCampaign = async (data: any) => {
  return await Campaign.create(data);
};

export const getCampaignById = async (id: string) => {
  return await Campaign.findById(id).lean();
};

export const getCampaignsByBusiness = async (businessId: string) => {
  return await Campaign.find({ businessId }).lean();
};

export const signCampaign = async (id: string, payload: any) => {
  return await Campaign.findByIdAndUpdate(
    id,
    {
      ...payload,
      status: "LAUNCHED",
      signedAt: new Date(),
    },
    { new: true }
  );
};

export const updateCampaignContacts = async (
  campaignId: string,
  contacts: string,
  uploadedCsvFileName: string
) => {
  return await Campaign.findByIdAndUpdate(
    campaignId,
    {
      $set: {
        uploadedContacts: contacts,
        uploadedCsvFileName,
      },
    },
    { new: true }
  );
};

export const addContactsToCampaign = async (
  campaignId: string,
  newContacts: string,
  uploadedCsvFileName: string
) => {
  return await Campaign.findByIdAndUpdate(campaignId, {
    $set: {
      uploadedContacts: newContacts,
      uploadedCsvFileName,
    },
  });
};

interface IdealCustomerDetails {
  revenueTarget?: { min?: number; max?: number };
  titles?: string[];
  companyLocation?: string[];
  employeeLocation?: string[];
  industry?: string[];
  keywords?: string[];
  allowAutoLeads?: boolean;
}

export const addIdealCustomerDetails = async (
  campaignId: string,
  details: IdealCustomerDetails
) => {
  return await Campaign.findByIdAndUpdate(
    campaignId,
    {
      $set: {
        ...details,
      },
    },
    { new: true }
  );
};

export const getCampaignStatus = async (campaignId: string) => {
  const campaign = await Campaign.findById(campaignId).select("status").lean();
  return campaign ? campaign.status : null;
};

export const getPublicCampaignsWithBusinessName = async () => {
  console.log("getPublicCampaignsWithBusinessName");
  return await Campaign.find({
    status: CampaignStatus.ACTIVE,
    "campaignControls.marketplaceVisible": true,
  })
    .select(
      "_id campaignName elevatorPitch qualifiedLeadPrice industry logoImageUrl companyLocation businessId"
    )
    .populate({
      path: "businessId",
      select: "name",
    })
    .lean();
};

export const fetchCampaignsForSalesRep = async (salesRepId: string) => {
  const records = await SalesRepCampaignStatus.find({ salesRepId })
    .populate({
      path: "campaignId",
      select:
        "campaignName logoImageUrl elevatorPitch status qualifiedLeadPrice companyLocation industry",
    })
    .lean();

  return records.map((entry) => {
    const campaign = entry.campaignId as any;

    let stage = "In Progress";
    if (entry.auditionStatus === "approved") stage = "Approved";
    else if (
      ["submitted", "retry", "in_progress"].includes(entry.auditionStatus)
    )
      stage = "Under Review";
    else if (entry.trainingProgress === 100) stage = "Ready to Audition";

    return {
      _id: campaign._id,
      campaignName: campaign.campaignName,
      elevatorPitch: campaign.elevatorPitch,
      qualifiedLeadPrice: campaign.qualifiedLeadPrice,
      logoImageUrl: campaign.logoImageUrl,
      companyLocation: campaign.companyLocation,
      industry: campaign.industry,
      campaignTag: campaign.industry?.[0] || "General",
      status: campaign.status,
      trainingProgress: entry.trainingProgress,
      auditionStatus: entry.auditionStatus,
      stage,
    };
  });
};

export const getCampaignsBySalesRepAndType = async (
  salesRepId: string,
  type: string
) => {
  const reps = await SalesRepCampaignStatus.find({ salesRepId })
    .populate({
      path: "campaignId",
      select:
        "campaignName logoImageUrl elevatorPitch status qualifiedLeadPrice companyLocation industry",
    })
    .lean();

  const campaigns = reps.map((entry) => {
    const campaign = entry.campaignId as any;
    return {
      ...campaign,
      trainingProgress: entry.trainingProgress,
      auditionStatus: entry.auditionStatus,
      campaignTag: campaign.industry?.[0] || "General",
    };
  });

  switch (type) {
    case "ongoing":
      return campaigns.filter(
        (c) => c.trainingProgress > 0 && c.trainingProgress < 100
      );
    case "auditioning":
      return campaigns.filter((c) =>
        ["submitted", "retry", "in_progress"].includes(c.auditionStatus)
      );
    case "approved":
      return campaigns.filter((c) => c.auditionStatus === "approved");
    case "rejected":
      return campaigns.filter((c) => c.auditionStatus === "rejected");
    default:
      throw new Error("Invalid campaign type");
  }
};

export const updateQualificationPrice = async (
  campaignId: string,
  price: number
) => {
  return await Campaign.findByIdAndUpdate(
    campaignId,
    {
      $set: {
        qualifiedLeadPrice: price,
      },
    },
    { new: true }
  );
};

export const updateCampaignControls = async (
  campaignId: string,
  settings: { controls?: any; hours?: any }
) => {
  const updateData: any = {};

  if (settings.controls) {
    updateData.campaignControls = settings.controls;
  }

  if (settings.hours) {
    updateData.callingHours = settings.hours;
  }

  return await Campaign.findByIdAndUpdate(
    campaignId,
    { $set: updateData },
    { new: true }
  );
};
