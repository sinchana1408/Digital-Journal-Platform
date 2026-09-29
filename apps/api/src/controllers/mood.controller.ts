import { Request, Response, NextFunction } from 'express';
import { MoodService } from '../services/mood.service';
import { createDailyMoodSchema } from '@lumajournal/shared';

export class MoodController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const moods = await MoodService.getDailyMoods(req.user!.id);
      res.json({ success: true, moods });
    } catch (error) {
      next(error);
    }
  }

  static async log(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createDailyMoodSchema.parse(req.body);
      const mood = await MoodService.logDailyMood(req.user!.id, validated);
      res.status(201).json({ success: true, mood });
    } catch (error) {
      next(error);
    }
  }
}
