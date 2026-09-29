import { DbService } from './db.service';
import { AppError } from '../middleware/error.middleware';

export class ExportService {
  static async exportUserData(userId: string) {
    const user = await DbService.findUserById(userId);
    if (!user) throw new AppError('User not found', 404);

    const entriesResult = await DbService.getEntries({
      userId,
      status: 'all',
      limit: 10000,
    });

    const tags = await DbService.getTagsByUser(userId);
    const dailyMoods = await DbService.getDailyMoods(userId);

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
        timezone: user.timezone,
        bio: user.bio,
      },
      entries: entriesResult.data,
      tags: tags.map((t) => t.name),
      dailyMoods,
    };
  }

  static async importUserData(userId: string, data: any) {
    if (!data || !Array.isArray(data.entries)) {
      throw new AppError('Invalid import file format. Missing "entries" array.', 400);
    }

    let importedCount = 0;
    for (const item of data.entries) {
      if (item.title) {
        await DbService.createEntry(userId, {
          title: item.title,
          content: item.content || '',
          mood: item.mood || null,
          tags: Array.isArray(item.tags)
            ? item.tags.map((t: any) => (typeof t === 'string' ? t : t.name))
            : [],
          isFavorite: Boolean(item.isFavorite),
          isPinned: Boolean(item.isPinned),
          isDraft: Boolean(item.isDraft),
          publishedAt: item.publishedAt || item.createdAt,
        });
        importedCount++;
      }
    }

    return {
      success: true,
      importedCount,
      message: `Successfully imported ${importedCount} journal entries.`,
    };
  }
}
