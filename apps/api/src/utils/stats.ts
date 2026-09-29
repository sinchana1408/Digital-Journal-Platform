import { MOODS, MoodDistributionItem, MonthlyStatsItem, WritingInsights } from '@lumajournal/shared';
import { format, subDays, differenceInCalendarDays, parseISO } from 'date-fns';

export function calculateTextStats(content: string, title: string = ''): {
  wordCount: number;
  readingTime: number;
  excerpt: string;
} {
  const combined = `${title} ${content}`;
  // Strip HTML tags and markdown markers
  const plain = combined
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/[#*_`~[\]()]/g, ' ')
    .trim();

  const words = plain ? plain.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Extract clean excerpt without HTML
  const contentPlain = content.replace(/<[^>]*>?/gm, ' ').trim();
  const excerpt = contentPlain.slice(0, 160) + (contentPlain.length > 160 ? '...' : '');

  return { wordCount, readingTime, excerpt };
}

export function computeStreaks(entryDates: (string | Date)[]): { currentStreak: number; longestStreak: number } {
  if (entryDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Normalize dates to YYYY-MM-DD unique set
  const uniqueDates = Array.from(
    new Set(
      entryDates.map((d) => {
        const dateObj = typeof d === 'string' ? parseISO(d) : d;
        return format(dateObj, 'yyyy-MM-dd');
      })
    )
  ).sort().reverse(); // descending

  if (uniqueDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // Check if active streak exists (wrote today or yesterday)
  let currentStreak = 0;
  let checkDate = uniqueDates[0] === todayStr ? todayStr : (uniqueDates[0] === yesterdayStr ? yesterdayStr : null);

  if (checkDate) {
    currentStreak = 1;
    let expectedPrev = format(subDays(parseISO(checkDate), 1), 'yyyy-MM-dd');
    for (let i = 1; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === expectedPrev) {
        currentStreak++;
        expectedPrev = format(subDays(parseISO(expectedPrev), 1), 'yyyy-MM-dd');
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across all history
  const chronological = [...uniqueDates].sort();
  let longestStreak = 0;
  let running = 0;
  for (let i = 0; i < chronological.length; i++) {
    if (i === 0) {
      running = 1;
    } else {
      const prev = parseISO(chronological[i - 1]);
      const curr = parseISO(chronological[i]);
      const diff = differenceInCalendarDays(curr, prev);
      if (diff === 1) {
        running++;
      } else if (diff > 1) {
        running = 1;
      }
    }
    if (running > longestStreak) {
      longestStreak = running;
    }
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
}
