import { Router } from 'express';
import { MoodController } from '../controllers/mood.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', MoodController.list);
router.post('/', MoodController.log);

export default router;
