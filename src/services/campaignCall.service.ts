import { Lead } from "../models/Lead";
import { CallService } from "./call.service";

export const startCallingLeadsService = async (campaignId: string) => {
  const leads = await Lead.find({ campaignId, status: { $ne: "suppressed" } })
    .select("phone")
    .lean();

  if (!leads || leads.length === 0) {
    throw new Error("No leads found for this campaign");
  }

  const phoneNumbers = leads.map((lead) => lead.phone);
  const sessionData = await CallService.startCallSession(phoneNumbers);

  return sessionData;
};
