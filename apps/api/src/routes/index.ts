import { Router } from 'express';
import authRoutes from './auth.routes';
import entryRoutes from './entry.routes';
import tagRoutes from './tag.routes';
import moodRoutes from './mood.routes';
import insightsRoutes from './insights.routes';
import profileRoutes from './profile.routes';
import exportRoutes from './export.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/entries', entryRoutes);
router.use('/tags', tagRoutes);
router.use('/moods', moodRoutes);
router.use('/insights', insightsRoutes);
router.use('/profile', profileRoutes);
router.use('/export', exportRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'lumajournal-api',
    timestamp: new Date().toISOString(),
  });
});

export default router;
