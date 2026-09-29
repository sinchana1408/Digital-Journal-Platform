import { DbService } from './db.service';
import { MOODS, DashboardStats, WritingInsights, MoodDistributionItem, MonthlyStatsItem, MoodTrendItem } from '@lumajournal/shared';
import { computeStreaks } from '../utils/stats';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';

export class InsightsService {
  static async getDashboardData(userId: string): Promise<DashboardStats> {
    // 1. Fetch all active entries for statistics
    const result = await DbService.getEntries({
      userId,
      status: 'all',
      limit: 1000,
    });
    const entries = result.data;

    // 2. Fetch daily moods
    const dailyMoods = await DbService.getDailyMoods(userId);
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayMood = dailyMoods.find((m) => m.date === todayStr) || null;

    // 3. Writing Insights calculation
    const totalEntries = entries.length;
    const totalWords = entries.reduce((acc, e) => acc + (e.wordCount || 0), 0);
    const avgWords = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;
    const longestEntry = entries.reduce((max, e) => Math.max(max, e.wordCount || 0), 0);

    // Streaks calculation from entries and daily moods
    const activityDates = [
      ...entries.map((e) => e.createdAt),
      ...dailyMoods.map((m) => m.date),
    ];
    const { currentStreak, longestStreak } = computeStreaks(activityDates);

    // Monthly comparisons
    const now = new Date();
    const curMonthStart = startOfMonth(now);
    const curMonthEnd = endOfMonth(now);
    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));

    let entriesThisMonth = 0;
    let wordsThisMonth = 0;
    let entriesLastMonth = 0;
    let wordsLastMonth = 0;

    entries.forEach((e) => {
      const eDate = typeof e.createdAt === 'string' ? parseISO(e.createdAt) : e.createdAt;
      if (eDate >= curMonthStart && eDate <= curMonthEnd) {
        entriesThisMonth++;
        wordsThisMonth += e.wordCount || 0;
      } else if (eDate >= prevMonthStart && eDate <= prevMonthEnd) {
        entriesLastMonth++;
        wordsLastMonth += e.wordCount || 0;
      }
    });

    const insights: WritingInsights = {
      totalEntries,
      totalWords,
      avgWords,
      longestEntry,
      currentStreak,
      longestStreak,
      entriesThisMonth,
      wordsThisMonth,
      entriesLastMonth,
      wordsLastMonth,
    };

    // 4. Mood distribution
    const moodCounts: Record<string, number> = {};
    entries.forEach((e) => {
      if (e.mood) {
        const k = e.mood.toLowerCase();
        moodCounts[k] = (moodCounts[k] || 0) + 1;
      }
    });

    const totalMoodEntries = Object.values(moodCounts).reduce((a, b) => a + b, 0);
    const moodDistribution: MoodDistributionItem[] = MOODS.map((m) => {
      const count = moodCounts[m.key] || 0;
      return {
        mood: m.key,
        label: m.label,
        emoji: m.emoji,
        count,
        percentage: totalMoodEntries > 0 ? Math.round((count / totalMoodEntries) * 100) : 0,
        color: m.color,
      };
    }).filter((item) => item.count > 0);

    // 5. Monthly Stats (Last 6 Months)
    const monthlyStats: MonthlyStatsItem[] = [];
    for (let i = 5; i >= 0; i--) {
      const targetM = subMonths(now, i);
      const mStart = startOfMonth(targetM);
      const mEnd = endOfMonth(targetM);
      const mLabel = format(targetM, 'MMM yyyy');

      let mEntries = 0;
      let mWords = 0;
      entries.forEach((e) => {
        const eDate = typeof e.createdAt === 'string' ? parseISO(e.createdAt) : e.createdAt;
        if (eDate >= mStart && eDate <= mEnd) {
          mEntries++;
          mWords += e.wordCount || 0;
        }
      });

      monthlyStats.push({
        month: mLabel,
        entries: mEntries,
        words: mWords,
      });
    }

    // 6. Mood trends (Past 14 records)
    const moodTrends: MoodTrendItem[] = dailyMoods
      .slice(0, 14)
      .reverse()
      .map((dm) => ({
        date: dm.date,
        score: dm.score,
        mood: dm.mood,
        title: dm.note || undefined,
      }));

    // 7. Top Tags
    const tags = await DbService.getTagsByUser(userId);
    const topTags = tags
      .map((t) => ({ name: t.name, count: (t._count as any)?.entryTags ?? (t._count as any)?.entries ?? 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // 8. Recent entries (latest 5)
    const recentEntries = (entries.slice(0, 5) as unknown) as any[];

    return {
      insights,
      moodDistribution,
      monthlyStats,
      moodTrends,
      recentEntries: recentEntries as any,
      topTags,
      todayMood: todayMood as any,
    };
  }
}
