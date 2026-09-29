import { Request, Response, NextFunction } from 'express';
import { ExportService } from '../services/export.service';

export class ExportController {
  static async exportData(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ExportService.exportUserData(req.user!.id);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="lumajournal_backup_${Date.now()}.json"`);
      res.send(JSON.stringify(data, null, 2));
    } catch (error) {
      next(error);
    }
  }

  static async importData(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ExportService.importUserData(req.user!.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
