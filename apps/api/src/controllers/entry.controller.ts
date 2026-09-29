import { Request, Response, NextFunction } from 'express';
import { EntryService } from '../services/entry.service';
import { createEntrySchema, updateEntrySchema, filterQuerySchema } from '@lumajournal/shared';

export class EntryController {
  static async listEntries(req: Request, res: Response, next: NextFunction) {
    try {
      const query = filterQuerySchema.parse(req.query);
      const result = await EntryService.listEntries(req.user!.id, query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async getEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const entry = await EntryService.getEntry(id, req.user!.id);
      res.json({ success: true, entry });
    } catch (error) {
      next(error);
    }
  }

  static async createEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createEntrySchema.parse(req.body);
      const entry = await EntryService.createEntry(req.user!.id, validated);
      res.status(201).json({ success: true, entry });
    } catch (error) {
      next(error);
    }
  }

  static async updateEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const validated = updateEntrySchema.parse(req.body);
      const entry = await EntryService.updateEntry(id, req.user!.id, validated);
      res.json({ success: true, entry });
    } catch (error) {
      next(error);
    }
  }

  static async deleteEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await EntryService.deleteEntry(id, req.user!.id);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async toggleFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const isFavorite = await EntryService.toggleFavorite(id, req.user!.id);
      res.json({ success: true, isFavorite });
    } catch (error) {
      next(error);
    }
  }

  static async togglePin(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const isPinned = await EntryService.togglePin(id, req.user!.id);
      res.json({ success: true, isPinned });
    } catch (error) {
      next(error);
    }
  }

  static async toggleArchive(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const isArchived = await EntryService.toggleArchive(id, req.user!.id);
      res.json({ success: true, isArchived });
    } catch (error) {
      next(error);
    }
  }

  static async getCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const year = parseInt((req.query.year as string) || String(new Date().getFullYear()), 10);
      const month = parseInt((req.query.month as string) || String(new Date().getMonth() + 1), 10);
      const data = await EntryService.getCalendarEntries(req.user!.id, year, month);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
