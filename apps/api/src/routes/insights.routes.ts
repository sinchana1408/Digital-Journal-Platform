import { Router } from 'express';
import { InsightsController } from '../controllers/insights.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', InsightsController.getDashboard);

export default router;
