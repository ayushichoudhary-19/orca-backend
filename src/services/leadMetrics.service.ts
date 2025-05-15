import { Lead } from "../models/Lead";
import mongoose from "mongoose";

export const getLeadMetrics = async (campaignId: string) => {
  const objectId = new mongoose.Types.ObjectId(campaignId);

  const [
    healthStats,
    performanceStats,
    qualityStats,
    ingestionFiles
  ] = await Promise.all([
    Lead.aggregate([
      { $match: { campaignId: objectId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]),
    Lead.aggregate([
      { $match: { campaignId: objectId } },
      {
        $group: {
          _id: "$uploadedFromFile",
          total: { $sum: 1 },
          called: {
            $sum: {
              $cond: [{ $ne: ["$status", "untouched"] }, 1, 0]
            }
          },
          meetings: {
            $sum: {
              $cond: [{ $eq: ["$status", "meeting"] }, 1, 0]
            }
          }
        }
      }
    ]),
    Lead.aggregate([
      { $match: { campaignId: objectId } },
      {
        $group: {
          _id: "$uploadedFromFile",
          total: { $sum: 1 },
          phoneCount: {
            $sum: { $cond: [{ $ifNull: ["$phone", false] }, 1, 0] }
          },
          mobileCount: {
            $sum: { $cond: [{ $ifNull: ["$mobileNumber", false] }, 1, 0] }
          },
          enrichedCount: {
            $sum: { $cond: [{ $eq: ["$enriched", true] }, 1, 0] }
          }
        }
      }
    ]),
    Lead.distinct("uploadedFromFile", { campaignId: objectId })
  ]);

  return {
    healthStats,
    performanceStats,
    qualityStats,
    ingestionFiles
  };
};
