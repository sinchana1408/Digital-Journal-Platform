import { Request, Response, NextFunction } from 'express';
import { InsightsService } from '../services/insights.service';

export class InsightsController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await InsightsService.getDashboardData(req.user!.id);
      res.json({ success: true, ...stats });
    } catch (error) {
      next(error);
    }
  }
}
