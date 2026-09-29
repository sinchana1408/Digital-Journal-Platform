import { DbService } from './db.service';
import { AppError } from '../middleware/error.middleware';

export class TagService {
  static async listTags(userId: string) {
    return DbService.getTagsByUser(userId);
  }

  static async createTag(userId: string, name: string) {
    if (!name || !name.trim()) {
      throw new AppError('Tag name is required', 400);
    }
    return DbService.createTag(userId, name.trim());
  }

  static async updateTag(id: string, userId: string, name: string) {
    if (!name || !name.trim()) {
      throw new AppError('New tag name is required', 400);
    }
    return DbService.updateTag(id, userId, name.trim());
  }

  static async deleteTag(id: string, userId: string) {
    await DbService.deleteTag(id, userId);
    return { message: 'Tag removed successfully' };
  }
}
