import { AuditionQuestion } from "../models/AuditionQuestion";
import { SalesRepCampaignStatus } from "../models/SalesRepCampaignStatus";
import { User } from "../models/User";

export const fetchRepsByCampaign = async (
  campaignId: string,
  status?: string
) => {
  const filter: any = { campaignId };

  if (status === "approved" || status === "rejected") {
    filter.auditionStatus = status;
  } else if (status === "pending") {
    filter.auditionStatus = {
      $in: ["submitted", "retry", "in_progress", "not_started"],
    };
  }

  const reps = await SalesRepCampaignStatus.find(filter).lean();
  const userIds = reps.map((r) => r.salesRepId);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const userMap = Object.fromEntries(users.map((u) => [u._id, u]));

  return reps.map((r) => ({
    ...r,
    salesRepId: userMap[r.salesRepId] || null,
  }));
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

export const getStatus = async (salesRepId: string, campaignId: string) => {
  return SalesRepCampaignStatus.findOne({ salesRepId, campaignId }).lean();
};

export const fetchQuestions = async (campaignId: string) => {
  return AuditionQuestion.find({ campaignId });
};

export const submitAudition = async (
  salesRepId: string,
  campaignId: string,
  body: {
    responses: { questionId: string; audioUrl: string }[];
    resumeUrl?: string;
    experienceYears?: string;
    country?: string;
    linkedInUrl?: string;
  }
) => {
  return SalesRepCampaignStatus.findOneAndUpdate(
    { salesRepId, campaignId },
    {
      auditionResponses: body.responses,
      auditionStatus: "submitted",
      lastAuditionAt: new Date(),
      $inc: { auditionAttempts: 1 },
      resumeUrl: body.resumeUrl,
      experienceYears: body.experienceYears,
      country: body.country,
      linkedInUrl: body.linkedInUrl,
    },
    { new: true, upsert: true }
  );
};
