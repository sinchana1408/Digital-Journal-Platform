import { z } from 'zod';

// ==========================================
// 1. MOOD CONSTANTS & UTILITIES
// ==========================================

export const MOODS = [
  { key: 'excellent', label: 'Excellent', emoji: '😄', score: 5, color: '#10B981' },
  { key: 'good', label: 'Good', emoji: '🙂', score: 4, color: '#3B82F6' },
  { key: 'calm', label: 'Calm', emoji: '😌', score: 4, color: '#8B5CF6' },
  { key: 'neutral', label: 'Neutral', emoji: '😐', score: 3, color: '#6B7280' },
  { key: 'low', label: 'Low', emoji: '😔', score: 2, color: '#F59E0B' },
  { key: 'anxious', label: 'Anxious', emoji: '😰', score: 2, color: '#EC4899' },
  { key: 'sad', label: 'Sad', emoji: '😢', score: 1, color: '#6366F1' },
  { key: 'angry', label: 'Angry', emoji: '😡', score: 1, color: '#EF4444' },
] as const;

export type MoodType = (typeof MOODS)[number]['key'];

export function getMoodDetails(key?: string | null) {
  if (!key) return null;
  return MOODS.find((m) => m.key === key.toLowerCase()) || null;
}

// ==========================================
// 2. MODEL INTERFACES
// ==========================================

export interface UserSafe {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  timezone: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Tag {
  id: string;
  name: string;
  userId: string;
  createdAt: string | Date;
  _count?: {
    entries?: number;
    entryTags?: number;
  };
}

export interface Media {
  id: string;
  entryId: string;
  url: string;
  type: string;
  filename: string;
  createdAt: string | Date;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  excerpt: string;
  mood?: string | null;
  moodScore?: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
  isDraft: boolean;
  wordCount: number;
  readingTime: number; // in minutes
  createdAt: string | Date;
  updatedAt: string | Date;
  publishedAt?: string | Date | null;
  tags?: Tag[];
  media?: Media[];
}

export interface DailyMood {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mood: string;
  score: number;
  note?: string | null;
  createdAt?: string | Date;
}

// ==========================================
// 3. STATISTICS & INSIGHTS INTERFACES
// ==========================================

export interface WritingInsights {
  totalEntries: number;
  totalWords: number;
  avgWords: number;
  longestEntry: number;
  currentStreak: number;
  longestStreak: number;
  entriesThisMonth: number;
  wordsThisMonth: number;
  entriesLastMonth: number;
  wordsLastMonth: number;
}

export interface MoodDistributionItem {
  mood: string;
  label: string;
  emoji: string;
  count: number;
  percentage: number;
  color: string;
}

export interface MonthlyStatsItem {
  month: string;
  entries: number;
  words: number;
  averageScore?: number;
}

export interface MoodTrendItem {
  date: string;
  score: number;
  mood: string;
  title?: string;
}

export interface DashboardStats {
  insights: WritingInsights;
  moodDistribution: MoodDistributionItem[];
  monthlyStats: MonthlyStatsItem[];
  moodTrends: MoodTrendItem[];
  recentEntries: JournalEntry[];
  topTags: { name: string; count: number }[];
  todayMood?: DailyMood | null;
}

export interface CalendarDayEntry {
  date: string; // YYYY-MM-DD
  hasEntry: boolean;
  count: number;
  moods: string[];
  entries: Array<{
    id: string;
    title: string;
    excerpt: string;
    mood?: string | null;
    isFavorite: boolean;
  }>;
}

// ==========================================
// 4. ZOD VALIDATION SCHEMAS
// ==========================================

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  bio: z.string().max(300, 'Bio must be at most 300 characters').optional().nullable(),
  timezone: z.string().optional(),
  avatar: z.string().optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const createEntrySchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().default(''),
  mood: z.string().optional().nullable(),
  tags: z.array(z.string().trim()).optional().default([]),
  isFavorite: z.boolean().optional().default(false),
  isPinned: z.boolean().optional().default(false),
  isArchived: z.boolean().optional().default(false),
  isDraft: z.boolean().optional().default(false),
  publishedAt: z.string().optional().nullable(),
});

export type CreateEntryInput = z.infer<typeof createEntrySchema>;

export const updateEntrySchema = createEntrySchema.partial();
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;

export const createTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Tag name is required')
    .max(30, 'Tag name cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Tag name can only contain letters, numbers, hyphens and underscores'),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;

export const createDailyMoodSchema = z.object({
  mood: z.string().min(1, 'Mood is required'),
  score: z.number().min(1).max(5).optional(),
  note: z.string().max(200, 'Note too long').optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export type CreateDailyMoodInput = z.infer<typeof createDailyMoodSchema>;

export const filterQuerySchema = z.object({
  search: z.string().optional(),
  mood: z.string().optional(),
  tags: z.string().optional(), // comma-separated or repeated
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['all', 'favorites', 'pinned', 'archived', 'drafts']).optional().default('all'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(12),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'wordCount']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type FilterQueryInput = z.infer<typeof filterQuerySchema>;

// ==========================================
// 5. SOCKET.IO EVENT NAMES
// ==========================================

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_USER: 'join_user',
  ENTRY_SAVED: 'entry:saved',
  ENTRY_UPDATED: 'entry:updated',
  ENTRY_DELETED: 'entry:deleted',
  STATS_UPDATED: 'stats:updated',
  MOOD_LOGGED: 'mood:logged',
} as const;

// Helper to compute word count and reading time
export function calculateEntryStats(text: string): { wordCount: number; readingTime: number; excerpt: string } {
  // strip HTML/markdown tags for counting
  const plainText = text.replace(/<[^>]*>?/gm, ' ').replace(/[#*_`~[\]]/g, ' ').trim();
  const words = plainText ? plainText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  // Average reading speed: 200 words per minute
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const excerpt = plainText.slice(0, 160) + (plainText.length > 160 ? '...' : '');
  return { wordCount, readingTime, excerpt };
}
