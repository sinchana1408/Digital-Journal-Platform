import { DbService } from './db.service';
import { emitToUser } from '../sockets/socket.manager';
import { SOCKET_EVENTS } from '@lumajournal/shared';

export class MoodService {
  static async getDailyMoods(userId: string) {
    return DbService.getDailyMoods(userId);
  }

  static async logDailyMood(userId: string, data: { date: string; mood: string; score?: number; note?: string | null }) {
    const logged = await DbService.upsertDailyMood(userId, data);
    emitToUser(userId, SOCKET_EVENTS.MOOD_LOGGED, logged);
    emitToUser(userId, SOCKET_EVENTS.STATS_UPDATED, { timestamp: new Date().toISOString() });
    return logged;
  }
}
