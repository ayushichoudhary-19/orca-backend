import { Campaign, CampaignStatus } from "../models/Campaign";

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
  return await Campaign.findByIdAndUpdate(
    campaignId,
    {
      $set: {
        uploadedContacts: newContacts,
        uploadedCsvFileName,
      },
    }
  );
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
        ...details
      }
    },
    { new: true }
  );
};

export const getCampaignStatus = async (campaignId: string) => {
  const campaign = await Campaign.findById(campaignId).select('status').lean();
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
