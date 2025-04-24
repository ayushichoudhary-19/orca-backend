import { Request, Response } from "express";
import * as contextService from "../services/context.service";

export const getContextsByCampaign = async (req: Request, res: Response) => {
  try {
    const campaignId = req.params.campaignId;
    const contexts = await contextService.getContextsByCampaign(campaignId);
    res.status(200).json(contexts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createContext = async (req: Request, res: Response) => {
  try {
    const context = await contextService.createContext(req.body);
    res.status(201).json(context);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateContext = async (req: Request, res: Response) => {
  try {
    const context = await contextService.updateContext(req.params.id, req.body);
    res.status(200).json(context);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteContext = async (req: Request, res: Response) => {
  try {
    await contextService.deleteContext(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
