import { Request, Response } from 'express';
import { AccountExecutiveInvite } from '../models/AccountExecutiveInvite';
import { User } from '../models/User';
import { Campaign } from '../models/Campaign';

export const inviteAE = async (req: Request, res: Response) => {
  const { id: campaignId } = req.params;
  const { email } = req.body;

  if (!email){
    
   res.status(400).json({ error: 'Email is required' });
   return;
}

  try {
    const existingInvite = await AccountExecutiveInvite.findOne({ campaignId, email });
    if (existingInvite) {
       res.status(400).json({ error: 'AE already invited' });
       return;
    }

    await AccountExecutiveInvite.create({ campaignId, email, status: 'invited', invitedAt: new Date() });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to invite AE' });
  }
};

export const listAEs = async (req: Request, res: Response) => {
  const { id: campaignId } = req.params;
  try {
    const campaign = await Campaign.findById(campaignId).lean();
    if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return }

    const users = await User.find({ _id: { $in: campaign.accountExecutives || [] } });
    const invites = await AccountExecutiveInvite.find({ campaignId });

    res.status(200).json({ connected: users, invited: invites });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch AEs' });
  }
};

export const removeAE = async (req: Request, res: Response) => {
  const { id: campaignId, userId } = req.params;
  try {
    const updated = await Campaign.findByIdAndUpdate(
      campaignId,
      { $pull: { accountExecutives: userId } },
      { new: true }
    );
    if (!updated) 
        {res.status(404).json({ error: 'Campaign not found' });
    return }
    
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove AE' });
  }
};