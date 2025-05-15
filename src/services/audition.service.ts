import { AuditionQuestion } from "../models/AuditionQuestion";
import { SalesRep } from "../models/SalesRep";
import { SalesRepCampaignStatus } from "../models/SalesRepCampaignStatus";

export const fetchRepsByCampaign = async (campaignId: string, status?: string) => {
  const filter: any = { campaignId };

  if (status === "approved" || status === "rejected") {
    filter.auditionStatus = status;
  } else if (status === "pending") {
    filter.auditionStatus = { $in: ["submitted", "retry", "in_progress", "not_started"] };
  }

  return SalesRepCampaignStatus.find(filter)
    .populate("salesRepId")
    .sort({ lastAuditionAt: -1 });
};

export const addQuestion = async (
  campaignId: string,
  body: { questions: string[] },
  createdBy: string
) => {
  const questionDocs = body.questions.map((q) => ({
    question: q,
    campaignId,
    createdBy,
  }));

  await AuditionQuestion.deleteMany({ campaignId });
  const inserted = await AuditionQuestion.insertMany(questionDocs);
  return inserted;
};

export const requestRetry = async (
  repId: string,
  campaignId: string,
  reason: string
) => {
  return SalesRepCampaignStatus.findOneAndUpdate(
    { salesRepId: repId, campaignId },
    {
      auditionStatus: "retry",
      retryReason: reason,
      $inc: { auditionAttempts: 1 },
      lastAttempt: new Date(),
    },
    { new: true }
  );
};

export const approve = async (repId: string, campaignId: string) => {
  return SalesRepCampaignStatus.findOneAndUpdate(
    { salesRepId: repId, campaignId },
    { auditionStatus: "approved" },
    { new: true }
  );
};

export const reject = async (
  repId: string,
  campaignId: string,
  reason: string
) => {
  return SalesRepCampaignStatus.findOneAndUpdate(
    { salesRepId: repId, campaignId },
    { auditionStatus: "rejected", rejectionReason: reason },
    { new: true }
  );
};


export const getStatus = async (userId: string, campaignId: string) => {
  const rep = await SalesRep.findOne({ userId });

  if (!rep) {
    throw new Error("Sales rep not found for this user");
  }

  return SalesRepCampaignStatus.findOne({
    salesRepId: rep._id,
    campaignId,
  });
};


export const fetchQuestions = async (campaignId: string) => {
  return AuditionQuestion.find({ campaignId });
};

export const submitAudition = async (
  firebaseUid: string,
  campaignId: string,
  body: { responses: { questionId: string; audioUrl: string }[] }
) => {
  // Step 1: Find SalesRep using userId
  const rep = await SalesRep.findOne({ userId: firebaseUid });
  if (!rep) throw new Error("Sales rep not found");

  // Step 2: Proceed with ObjectId
  return SalesRepCampaignStatus.findOneAndUpdate(
    { salesRepId: rep._id, campaignId },
    {
      auditionResponses: body.responses,
      auditionStatus: "submitted",
      lastAuditionAt: new Date(),
      $inc: { auditionAttempts: 1 },
    },
    { new: true, upsert: true }
  );
};

