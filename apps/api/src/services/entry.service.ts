import { DbService } from './db.service';
import { AppError } from '../middleware/error.middleware';
import { emitToUser } from '../sockets/socket.manager';
import { SOCKET_EVENTS, CalendarDayEntry } from '@lumajournal/shared';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';

export class EntryService {
  static async listEntries(userId: string, query: {
    search?: string;
    mood?: string;
    tags?: string;
    status?: 'all' | 'favorites' | 'pinned' | 'archived' | 'drafts';
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'wordCount';
    sortOrder?: 'asc' | 'desc';
  }) {
    const tagList = query.tags ? query.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

    return DbService.getEntries({
      userId,
      search: query.search,
      mood: query.mood,
      tags: tagList,
      status: query.status,
      startDate: query.startDate,
      endDate: query.endDate,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  static async getEntry(id: string, userId: string) {
    const entry = await DbService.getEntryById(id, userId);
    if (!entry) {
      throw new AppError('Journal entry not found or unauthorized', 404);
    }
    return entry;
  }

  static async createEntry(userId: string, input: {
    title: string;
    content: string;
    mood?: string | null;
    tags?: string[];
    isFavorite?: boolean;
    isPinned?: boolean;
    isArchived?: boolean;
    isDraft?: boolean;
    publishedAt?: string | null;
  }) {
    const entry = await DbService.createEntry(userId, input);

    // Notify active socket clients for this user
    emitToUser(userId, SOCKET_EVENTS.ENTRY_SAVED, { entry, action: 'created' });
    emitToUser(userId, SOCKET_EVENTS.STATS_UPDATED, { timestamp: new Date().toISOString() });

    return entry;
  }

  static async updateEntry(id: string, userId: string, input: Partial<{
    title: string;
    content: string;
    mood: string | null;
    tags: string[];
    isFavorite: boolean;
    isPinned: boolean;
    isArchived: boolean;
    isDraft: boolean;
    publishedAt: string | null;
  }>) {
    const entry = await DbService.updateEntry(id, userId, input);

    // Real-time confirmation of autosave and live update
    emitToUser(userId, SOCKET_EVENTS.ENTRY_SAVED, {
      entryId: entry.id,
      updatedAt: entry.updatedAt,
      wordCount: entry.wordCount,
      readingTime: entry.readingTime,
      isDraft: entry.isDraft,
      action: 'updated',
    });
    emitToUser(userId, SOCKET_EVENTS.ENTRY_UPDATED, entry);
    emitToUser(userId, SOCKET_EVENTS.STATS_UPDATED, { timestamp: new Date().toISOString() });

    return entry;
  }

  static async deleteEntry(id: string, userId: string) {
    const existing = await DbService.getEntryById(id, userId);
    if (!existing) {
      throw new AppError('Entry not found or unauthorized', 404);
    }

    await DbService.deleteEntry(id, userId);

    emitToUser(userId, SOCKET_EVENTS.ENTRY_DELETED, { entryId: id });
    emitToUser(userId, SOCKET_EVENTS.STATS_UPDATED, { timestamp: new Date().toISOString() });

    return { message: 'Journal entry permanently deleted.' };
  }

  static async toggleFavorite(id: string, userId: string) {
    const isFavorite = await DbService.toggleFavorite(id, userId);
    emitToUser(userId, SOCKET_EVENTS.STATS_UPDATED, { timestamp: new Date().toISOString() });
    return isFavorite;
  }

  static async togglePin(id: string, userId: string) {
    const isPinned = await DbService.togglePin(id, userId);
    return isPinned;
  }

  static async toggleArchive(id: string, userId: string) {
    const isArchived = await DbService.toggleArchive(id, userId);
    emitToUser(userId, SOCKET_EVENTS.STATS_UPDATED, { timestamp: new Date().toISOString() });
    return isArchived;
  }

  static async getCalendarEntries(userId: string, year: number, month: number): Promise<CalendarDayEntry[]> {
    // Generate dates for the month
    const targetDate = new Date(year, month - 1, 1);
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);

    // Fetch entries in date range
    const result = await DbService.getEntries({
      userId,
      status: 'all',
      startDate: monthStart.toISOString(),
      endDate: monthEnd.toISOString(),
      limit: 500,
    });

    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const matching = result.data.filter((e) => {
        const eDate = typeof e.createdAt === 'string' ? parseISO(e.createdAt) : e.createdAt;
        return format(eDate, 'yyyy-MM-dd') === dateStr;
      });

      return {
        date: dateStr,
        hasEntry: matching.length > 0,
        count: matching.length,
        moods: Array.from(new Set(matching.map((e) => e.mood).filter(Boolean) as string[])),
        entries: matching.map((e) => ({
          id: e.id,
          title: e.title,
          excerpt: e.excerpt,
          mood: e.mood,
          isFavorite: e.isFavorite,
        })),
      };
    });
  }
}
