import express from 'express';
import { inviteAE, listAEs, removeAE } from '../controllers/accountExecutive.controller';

const router = express.Router();

router.post('/:id/invite-ae', inviteAE);
router.get('/:id/account-executives', listAEs);
router.delete('/:id/account-executives/:userId', removeAE);

export default router;
