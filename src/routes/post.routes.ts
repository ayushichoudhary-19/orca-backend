import { Router } from 'express';
import {PostController} from '../controllers/post.controller';

const router = Router();

router.post('/', PostController.createPost);
router.get('/campaign/:campaignId', PostController.getPostsByCampaignId);
router.delete('/:id', PostController.deletePost);

export default router;
