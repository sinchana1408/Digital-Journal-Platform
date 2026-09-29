import { Router } from 'express';
import { EntryController } from '../controllers/entry.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', EntryController.listEntries);
router.post('/', EntryController.createEntry);
router.get('/calendar', EntryController.getCalendar);
router.get('/:id', EntryController.getEntry);
router.put('/:id', EntryController.updateEntry);
router.delete('/:id', EntryController.deleteEntry);

router.post('/:id/favorite', EntryController.toggleFavorite);
router.post('/:id/pin', EntryController.togglePin);
router.post('/:id/archive', EntryController.toggleArchive);

export default router;
