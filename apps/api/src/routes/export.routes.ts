import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', ExportController.exportData);
router.post('/import', ExportController.importData);

export default router;
