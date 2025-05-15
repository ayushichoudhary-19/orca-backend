import express from 'express';
import { addCard, getBillingHistory } from '../controllers/billing.controller';

const router = express.Router();

router.post('/add-card', addCard);
router.get('/history', getBillingHistory);

export default router;
