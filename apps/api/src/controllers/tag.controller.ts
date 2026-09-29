import { Request, Response, NextFunction } from 'express';
import { TagService } from '../services/tag.service';
import { createTagSchema } from '@lumajournal/shared';

export class TagController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await TagService.listTags(req.user!.id);
      res.json({ success: true, tags });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = createTagSchema.parse(req.body);
      const tag = await TagService.createTag(req.user!.id, name);
      res.status(201).json({ success: true, tag });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { name } = createTagSchema.parse(req.body);
      const tag = await TagService.updateTag(id, req.user!.id, name);
      res.json({ success: true, tag });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await TagService.deleteTag(id, req.user!.id);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}
