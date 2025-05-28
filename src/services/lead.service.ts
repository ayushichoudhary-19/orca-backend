import { Lead } from "../models/Lead";
import { Readable } from "stream";
import csvParser from "csv-parser";
import mongoose from "mongoose";

export const parseLeadCsvService = (
  buffer: Buffer,
  campaignId: string,
  fileName: string,
  fieldMap: Record<string, string>
): Promise<{
  insertedCount: number;
  duplicateCount: number;
  errors: string[];
}> => {
  return new Promise((resolve, reject) => {
    const leads: any[] = [];
    const errors: string[] = [];

    const stream = Readable.from(buffer);

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const phone = row[fieldMap["Prospect Phone Number"]];
        if (phone) {
          leads.push({
            campaignId: new mongoose.Types.ObjectId(campaignId),
            fullName: `${row[fieldMap["Prospect First Name"]] || ""} ${row[fieldMap["Prospect Last Name"]] || ""}`.trim(),
            email: row[fieldMap["Prospect Email"]] || "",
            phone: phone,
            title: row[fieldMap["Prospect Title"]] || "",
            company: row[fieldMap["Account Name"]] || "",
            location: row[fieldMap["Account HQ State"]] || "",
            mobileNumber: row[fieldMap["Prospect Mobile Number"]] || "",
            linkedinUrl: row[fieldMap["Prospect LinkedIn URL"]] || "",
            website: row[fieldMap["Account Website"]] || "",
            city: row[fieldMap["Account HQ City"]] || "",
            employeeCount: row[fieldMap["Account Employee Count"]] || "",
            revenue: row[fieldMap["Account Revenue"]] || "",
            accountExecutiveEmail: row[fieldMap["Account Executive Email"]] || "",
            uploadedFromFile: fileName,
          });
          
        } else {
          errors.push(`Missing phone in row: ${JSON.stringify(row)}`);
        }
      })
      .on("end", async () => {
        try {
          const result = await Lead.insertMany(leads, { ordered: false });
          const insertedCount = result.length;
          const duplicateCount = leads.length - insertedCount;
          resolve({ insertedCount, duplicateCount, errors });
        } catch (err: any) {
          const insertedCount = err.insertedDocs?.length || 0;
          const duplicateCount = leads.length - insertedCount;
          resolve({ insertedCount, duplicateCount, errors });
        }
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};

export const getLeadsByCampaignService = async (campaignId: string) => {
  if (!mongoose.Types.ObjectId.isValid(campaignId)) {
    throw new Error("Invalid campaignId");
  }

  return await Lead.find({
    campaignId: new mongoose.Types.ObjectId(campaignId),
    status: { $ne: "suppressed" }, 
  })
    .lean();
};