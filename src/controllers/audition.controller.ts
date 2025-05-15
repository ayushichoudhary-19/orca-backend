import { Request, Response } from "express";
import * as AuditionService from "../services/audition.service";

export const getRepsByCampaign = async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  const { status } = req.query;

  try {
    const data = await AuditionService.fetchRepsByCampaign(campaignId, status as string);
    res.json(data);
  } catch (err) {
    console.error("Error fetching reps:", err);
    res.status(500).json({ error: "Failed to fetch reps" });
  }
};

export const createAuditionQuestion = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const result = await AuditionService.addQuestion(
    req.params.campaignId,
    req.body,
    req.user.uid
  );

  res.status(201).json(result);
};

export const markAuditionRetry = async (req: Request, res: Response) => {
  const result = await AuditionService.requestRetry(
    req.params.repId,
    req.params.campaignId,
    req.body.reason
  );
  res.json(result);
};

export const approveRep = async (req: Request, res: Response) => {
  const result = await AuditionService.approve(
    req.params.repId,
    req.params.campaignId
  );
  res.json(result);
};

export const rejectRep = async (req: Request, res: Response) => {
  const result = await AuditionService.reject(
    req.params.repId,
    req.params.campaignId,
    req.body.reason
  );
  res.json(result);
};

export const getCampaignStatus = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const status = await AuditionService.getStatus(
    req.user.uid,
    req.params.campaignId
  );
  res.json(status);
};

export const getAuditionQuestions = async (req: Request, res: Response) => {
  const questions = await AuditionService.fetchQuestions(req.params.campaignId);
  res.json(questions);
};

export const submitAudition = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const submission = await AuditionService.submitAudition(
    req.user.uid,
    req.params.campaignId,
    req.body
  );
  res.status(201).json(submission);
};
