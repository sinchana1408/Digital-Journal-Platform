import { prisma, isDbConnected } from '../config/prisma';
import bcrypt from 'bcryptjs';
import { calculateTextStats } from '../utils/stats';
import { subDays, format } from 'date-fns';

// In-memory data store for fallback/dev/test when Postgres container is not running
export interface MemTag {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

export interface MemEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  excerpt: string;
  mood: string | null;
  moodScore: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
  isDraft: boolean;
  wordCount: number;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  tags: MemTag[];
}

export interface MemDailyMood {
  id: string;
  userId: string;
  date: string;
  mood: string;
  score: number;
  note: string | null;
  createdAt: string;
}

export interface MemUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string | null;
  bio: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

// Seed demo data for memory fallback
const DEMO_USER_ID = 'user-demo-alex-101';
const DEMO_PASSWORD_HASH = bcrypt.hashSync('Password123', 10);

const memUsers: MemUser[] = [
  {
    id: DEMO_USER_ID,
    name: 'Alex Mercer',
    email: 'alex@lumajournal.com',
    passwordHash: DEMO_PASSWORD_HASH,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Reflective writer, product designer, and tea enthusiast. Exploring everyday mindfulness.',
    timezone: 'America/New_York',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const memTags: MemTag[] = [
  { id: 'tag-1', name: 'reflection', userId: DEMO_USER_ID, createdAt: new Date().toISOString() },
  { id: 'tag-2', name: 'mindfulness', userId: DEMO_USER_ID, createdAt: new Date().toISOString() },
  { id: 'tag-3', name: 'creativity', userId: DEMO_USER_ID, createdAt: new Date().toISOString() },
  { id: 'tag-4', name: 'goals', userId: DEMO_USER_ID, createdAt: new Date().toISOString() },
  { id: 'tag-5', name: 'gratitude', userId: DEMO_USER_ID, createdAt: new Date().toISOString() },
  { id: 'tag-6', name: 'travel', userId: DEMO_USER_ID, createdAt: new Date().toISOString() },
  { id: 'tag-7', name: 'wellness', userId: DEMO_USER_ID, createdAt: new Date().toISOString() },
];

const rawEntries = [
  {
    id: 'entry-1',
    title: 'The quiet beauty of an early morning walk',
    content: `<p>The autumn air had that crisp, crisp sharpness today that immediately clears the mind. Walking through the neighborhood park before the rest of the world woke up felt like stepping into an untouched canvas.</p><p>I noticed the way the early sun cut diagonal amber rays through the pine branches. For the first time in weeks, I didn't reach for my phone to check notifications or emails. Just the sound of gravel crunching under my boots and the slow rhythm of my breath.</p><blockquote>"In the stillness of morning, the mind finds its natural center."</blockquote><p>I want to make this a daily ritual. Even just fifteen minutes makes the entire day feel intentional rather than reactive.</p>`,
    mood: 'calm',
    moodScore: 4,
    isFavorite: true,
    isPinned: true,
    isArchived: false,
    isDraft: false,
    daysAgo: 0,
    tags: ['reflection', 'mindfulness', 'wellness'],
  },
  {
    id: 'entry-2',
    title: 'Redesigning the creative workflow: Less is truly more',
    content: `<p>Had an epiphany about my creative process this afternoon. For the last three months, I have been juggling six different tools, note apps, and complex project dashboards. It was causing decision fatigue before I even wrote a single word or sketched a wireframe.</p><p>Today I stripped everything back. Just one notebook, one focused digital journal, and a timer. The clarity was immediate. Work flowed with effortless momentum.</p><p>Key takeaways:</p><ul><li>Limit active priorities to maximum 3 per day</li><li>Protect morning hours for deep, uninterrupted creative focus</li><li>Embrace blank space in schedules and designs</li></ul>`,
    mood: 'excellent',
    moodScore: 5,
    isFavorite: true,
    isPinned: false,
    isArchived: false,
    isDraft: false,
    daysAgo: 1,
    tags: ['creativity', 'goals'],
  },
  {
    id: 'entry-3',
    title: 'Navigating unexpected changes and finding balance',
    content: `<p>A client project took a sudden turn today. At first, an instinctive wave of anxiety flared up—all the meticulously planned timelines felt upended. But after stepping away for a cup of green tea, I realized this is just an opportunity to simplify the scope and focus on what genuinely delivers value.</p><p>Acceptance isn't giving up; it's recognizing reality so you can respond with grace instead of frantic energy.</p>`,
    mood: 'neutral',
    moodScore: 3,
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    isDraft: false,
    daysAgo: 2,
    tags: ['reflection', 'wellness'],
  },
  {
    id: 'entry-4',
    title: 'Three simple things I am grateful for today',
    content: `<p>Taking five minutes before bed to ground myself in gratitude:</p><ol><li><strong>The smell of fresh rain</strong> on the warm asphalt after three hot days.</li><li><strong>A spontaneous 45-minute phone call</strong> with an old college friend laughing about old memories.</li><li><strong>A warm dinner cooked from scratch</strong> without rushing through it.</li></ol><p>It is so easy to overlook these gentle everyday miracles when chasing tomorrow's milestones.</p>`,
    mood: 'good',
    moodScore: 4,
    isFavorite: true,
    isPinned: false,
    isArchived: false,
    isDraft: false,
    daysAgo: 3,
    tags: ['gratitude', 'mindfulness'],
  },
  {
    id: 'entry-5',
    title: 'Drafting our road trip along the coastal highway',
    content: `<p>Rough itinerary thoughts for the upcoming weekend drive:</p><p>Start early Friday dawn to beat highway traffic. Stop at the lighthouse viewpoint for breakfast sandwiches and thermos coffee. Explore the cliffside trails in the afternoon.</p><p>Pack essentials: camera, sketchbook, rain jackets, and playlist of acoustic jazz and indie folk.</p>`,
    mood: 'good',
    moodScore: 4,
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    isDraft: true,
    daysAgo: 4,
    tags: ['travel', 'creativity'],
  },
  {
    id: 'entry-6',
    title: 'Dealing with low energy without guilt',
    content: `<p>Woke up with heavy limbs and zero drive. In the past, I would have forced myself into overdrive, fueled by guilt and coffee. Today, I honored what my body was asking for: gentleness.</p><p>I rescheduled non-urgent meetings, took a warm Epsom salt bath, and read two chapters of Oliver Burkeman's <em>Four Thousand Weeks</em>. By evening, my spirit felt restored.</p>`,
    mood: 'low',
    moodScore: 2,
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    isDraft: false,
    daysAgo: 5,
    tags: ['wellness', 'reflection'],
  },
  {
    id: 'entry-7',
    title: 'Weekend farmers market discoveries & culinary experiments',
    content: `<p>Spent Saturday morning browsing the downtown farmers market. Picked up heirloom tomatoes, wild honey, and a sourdough loaf that was still warm when the baker handed it to me.</p><p>Spent the evening roasting the tomatoes with garlic, olive oil, and fresh basil. Cooking slowly is such an understated form of active meditation.</p>`,
    mood: 'excellent',
    moodScore: 5,
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    isDraft: false,
    daysAgo: 6,
    tags: ['gratitude', 'wellness'],
  },
  {
    id: 'entry-8',
    title: 'Quarterly retrospective: Milestones achieved and lessons learned',
    content: `<p>Sitting down with coffee to review Q3. Looking back through my journal entries from July and August gives such an illuminating perspective on personal growth.</p><p>Things that seemed like insurmountable crises two months ago are now barely a footnote. Consistency in small daily habits proved 10x more effective than sporadic bursts of heroic effort.</p>`,
    mood: 'calm',
    moodScore: 4,
    isFavorite: true,
    isPinned: false,
    isArchived: false,
    isDraft: false,
    daysAgo: 7,
    tags: ['goals', 'reflection'],
  },
  {
    id: 'entry-9',
    title: 'Old thoughts on project architecture (Archived)',
    content: `<p>Legacy notes from our initial prototype design. Storing here for historical reference on why certain decisions were made regarding data models and schemas.</p>`,
    mood: 'neutral',
    moodScore: 3,
    isFavorite: false,
    isPinned: false,
    isArchived: true,
    isDraft: false,
    daysAgo: 14,
    tags: ['creativity'],
  },
];

const memEntries: MemEntry[] = rawEntries.map((e) => {
  const stats = calculateTextStats(e.content, e.title);
  const entryDate = subDays(new Date(), e.daysAgo).toISOString();
  const entryTags = e.tags
    .map((tagName) => memTags.find((t) => t.name === tagName))
    .filter(Boolean) as MemTag[];

  return {
    id: e.id,
    userId: DEMO_USER_ID,
    title: e.title,
    content: e.content,
    excerpt: stats.excerpt,
    mood: e.mood,
    moodScore: e.moodScore,
    isFavorite: e.isFavorite,
    isPinned: e.isPinned,
    isArchived: e.isArchived,
    isDraft: e.isDraft,
    wordCount: stats.wordCount,
    readingTime: stats.readingTime,
    createdAt: entryDate,
    updatedAt: entryDate,
    publishedAt: e.isDraft ? null : entryDate,
    tags: entryTags,
  };
});

const memDailyMoods: MemDailyMood[] = [
  { id: 'dm-1', userId: DEMO_USER_ID, date: format(subDays(new Date(), 0), 'yyyy-MM-dd'), mood: 'calm', score: 4, note: 'Morning walk and clear head', createdAt: new Date().toISOString() },
  { id: 'dm-2', userId: DEMO_USER_ID, date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), mood: 'excellent', score: 5, note: 'Creative flow state unlocked', createdAt: new Date().toISOString() },
  { id: 'dm-3', userId: DEMO_USER_ID, date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), mood: 'neutral', score: 3, note: 'Busy work day, balanced', createdAt: new Date().toISOString() },
  { id: 'dm-4', userId: DEMO_USER_ID, date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), mood: 'good', score: 4, note: 'Gratitude evening', createdAt: new Date().toISOString() },
  { id: 'dm-5', userId: DEMO_USER_ID, date: format(subDays(new Date(), 4), 'yyyy-MM-dd'), mood: 'good', score: 4, note: 'Planning upcoming trip', createdAt: new Date().toISOString() },
  { id: 'dm-6', userId: DEMO_USER_ID, date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), mood: 'low', score: 2, note: 'Needed rest and recuperation', createdAt: new Date().toISOString() },
  { id: 'dm-7', userId: DEMO_USER_ID, date: format(subDays(new Date(), 6), 'yyyy-MM-dd'), mood: 'excellent', score: 5, note: 'Farmers market & cooking', createdAt: new Date().toISOString() },
  { id: 'dm-8', userId: DEMO_USER_ID, date: format(subDays(new Date(), 7), 'yyyy-MM-dd'), mood: 'calm', score: 4, note: 'Retrospective reflections', createdAt: new Date().toISOString() },
];

const memSessions: Array<{ id: string; userId: string; token: string; expiresAt: Date }> = [];
const memResetTokens: Array<{ id: string; userId: string; token: string; expiresAt: Date; usedAt: Date | null }> = [];

// ==========================================
// UNIFIED DB SERVICE (PostgreSQL / In-Memory Fallback)
// ==========================================

export class DbService {
  // ---- USER REPOSITORY ----
  static async findUserByEmail(email: string) {
    if (isDbConnected()) {
      return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    }
    return memUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  static async findUserById(id: string) {
    if (isDbConnected()) {
      return prisma.user.findUnique({ where: { id } });
    }
    return memUsers.find((u) => u.id === id) || null;
  }

  static async createUser(data: { name: string; email: string; passwordHash: string }) {
    if (isDbConnected()) {
      return prisma.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash,
          timezone: 'UTC',
        },
      });
    }
    const newUser: MemUser = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      avatar: null,
      bio: null,
      timezone: 'UTC',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memUsers.push(newUser);
    return newUser;
  }

  static async updateUser(id: string, data: Partial<MemUser>) {
    if (isDbConnected()) {
      return prisma.user.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    }
    const user = memUsers.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    Object.assign(user, data, { updatedAt: new Date().toISOString() });
    return user;
  }

  // ---- TAG REPOSITORY ----
  static async getTagsByUser(userId: string) {
    if (isDbConnected()) {
      return prisma.tag.findMany({
        where: { userId },
        include: { _count: { select: { entryTags: true } } },
        orderBy: { name: 'asc' },
      });
    }
    return memTags
      .filter((t) => t.userId === userId)
      .map((t) => {
        const count = memEntries.filter((e) => e.userId === userId && e.tags.some((et) => et.id === t.id)).length;
        return { ...t, _count: { entries: count } };
      });
  }

  static async createTag(userId: string, name: string) {
    const cleanName = name.toLowerCase().trim();
    if (isDbConnected()) {
      return prisma.tag.upsert({
        where: { name_userId: { name: cleanName, userId } },
        create: { name: cleanName, userId },
        update: {},
      });
    }
    let existing = memTags.find((t) => t.userId === userId && t.name === cleanName);
    if (!existing) {
      existing = {
        id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: cleanName,
        userId,
        createdAt: new Date().toISOString(),
      };
      memTags.push(existing);
    }
    return existing;
  }

  static async updateTag(id: string, userId: string, newName: string) {
    const cleanName = newName.toLowerCase().trim();
    if (isDbConnected()) {
      return prisma.tag.update({
        where: { id },
        data: { name: cleanName },
      });
    }
    const tag = memTags.find((t) => t.id === id && t.userId === userId);
    if (!tag) throw new Error('Tag not found');
    tag.name = cleanName;
    return tag;
  }

  static async deleteTag(id: string, userId: string) {
    if (isDbConnected()) {
      return prisma.tag.delete({ where: { id } });
    }
    const index = memTags.findIndex((t) => t.id === id && t.userId === userId);
    if (index !== -1) {
      memTags.splice(index, 1);
      // Remove tag reference from mem entries
      memEntries.forEach((e) => {
        e.tags = e.tags.filter((t) => t.id !== id);
      });
    }
    return true;
  }

  // ---- JOURNAL ENTRY REPOSITORY ----
  static async getEntries(params: {
    userId: string;
    search?: string;
    mood?: string;
    tags?: string[];
    status?: 'all' | 'favorites' | 'pinned' | 'archived' | 'drafts';
    startDate?: string;
    endDate?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'wordCount';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      userId,
      search,
      mood,
      tags = [],
      status = 'all',
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
    } = params;

    if (isDbConnected()) {
      const where: any = { userId };

      // Status filters
      if (status === 'favorites') {
        where.isFavorite = true;
        where.isArchived = false;
      } else if (status === 'pinned') {
        where.isPinned = true;
        where.isArchived = false;
      } else if (status === 'archived') {
        where.isArchived = true;
      } else if (status === 'drafts') {
        where.isDraft = true;
        where.isArchived = false;
      } else {
        // 'all' hides archived entries from standard view
        where.isArchived = false;
      }

      if (mood) {
        where.mood = mood.toLowerCase();
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      if (tags.length > 0) {
        where.entryTags = {
          some: {
            tag: {
              name: { in: tags.map((t) => t.toLowerCase()) },
            },
          },
        };
      }

      if (search && search.trim()) {
        const query = search.trim();
        where.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } },
          {
            entryTags: {
              some: { tag: { name: { contains: query, mode: 'insensitive' } } },
            },
          },
        ];
      }

      const total = await prisma.journalEntry.count({ where });
      const rawData = await prisma.journalEntry.findMany({
        where,
        include: {
          entryTags: { include: { tag: true } },
          media: true,
        },
        orderBy: [
          // If status is not archived or draft, keep pinned at top
          ...(status === 'all' ? [{ isPinned: 'desc' as const }] : []),
          { [sortBy]: sortOrder },
        ],
        skip: (page - 1) * limit,
        take: limit,
      });

      const data = rawData.map((e) => ({
        ...e,
        tags: e.entryTags.map((et) => et.tag),
        entryTags: undefined,
      }));

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    }

    // MEMORY IMPLEMENTATION
    let filtered = memEntries.filter((e) => e.userId === userId);

    if (status === 'favorites') {
      filtered = filtered.filter((e) => e.isFavorite && !e.isArchived);
    } else if (status === 'pinned') {
      filtered = filtered.filter((e) => e.isPinned && !e.isArchived);
    } else if (status === 'archived') {
      filtered = filtered.filter((e) => e.isArchived);
    } else if (status === 'drafts') {
      filtered = filtered.filter((e) => e.isDraft && !e.isArchived);
    } else {
      filtered = filtered.filter((e) => !e.isArchived);
    }

    if (mood) {
      filtered = filtered.filter((e) => e.mood?.toLowerCase() === mood.toLowerCase());
    }

    if (startDate) {
      const startMs = new Date(startDate).getTime();
      filtered = filtered.filter((e) => new Date(e.createdAt).getTime() >= startMs);
    }

    if (endDate) {
      const endMs = new Date(endDate).getTime();
      filtered = filtered.filter((e) => new Date(e.createdAt).getTime() <= endMs);
    }

    if (tags.length > 0) {
      const lowerTags = tags.map((t) => t.toLowerCase());
      filtered = filtered.filter((e) => e.tags.some((t) => lowerTags.includes(t.name.toLowerCase())));
    }

    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      filtered = filtered.filter((e) => {
        return (
          e.title.toLowerCase().includes(term) ||
          e.content.toLowerCase().includes(term) ||
          e.excerpt.toLowerCase().includes(term) ||
          e.tags.some((t) => t.name.toLowerCase().includes(term))
        );
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (status === 'all' && a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';
      if (sortBy === 'wordCount') {
        return sortOrder === 'asc' ? (a.wordCount - b.wordCount) : (b.wordCount - a.wordCount);
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getEntryById(id: string, userId: string) {
    if (isDbConnected()) {
      const entry = await prisma.journalEntry.findFirst({
        where: { id, userId },
        include: {
          entryTags: { include: { tag: true } },
          media: true,
        },
      });
      if (!entry) return null;
      return {
        ...entry,
        tags: entry.entryTags.map((et) => et.tag),
        entryTags: undefined,
      };
    }

    return memEntries.find((e) => e.id === id && e.userId === userId) || null;
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
    const stats = calculateTextStats(input.content || '', input.title);
    const moodScore = input.mood ? getMoodScore(input.mood) : null;
    const tagNames = input.tags || [];

    if (isDbConnected()) {
      // Upsert tags
      const createdTags = await Promise.all(
        tagNames.map((name) =>
          prisma.tag.upsert({
            where: { name_userId: { name: name.toLowerCase().trim(), userId } },
            create: { name: name.toLowerCase().trim(), userId },
            update: {},
          })
        )
      );

      const entry = await prisma.journalEntry.create({
        data: {
          userId,
          title: input.title,
          content: input.content || '',
          excerpt: stats.excerpt,
          mood: input.mood || null,
          moodScore,
          isFavorite: input.isFavorite || false,
          isPinned: input.isPinned || false,
          isArchived: input.isArchived || false,
          isDraft: input.isDraft || false,
          wordCount: stats.wordCount,
          readingTime: stats.readingTime,
          publishedAt: input.isDraft ? null : new Date(),
          entryTags: {
            create: createdTags.map((tag) => ({
              tagId: tag.id,
            })),
          },
        },
        include: {
          entryTags: { include: { tag: true } },
          media: true,
        },
      });

      return {
        ...entry,
        tags: entry.entryTags.map((et) => et.tag),
        entryTags: undefined,
      };
    }

    // MEMORY IMPLEMENTATION
    const resolvedTags: MemTag[] = [];
    for (const name of tagNames) {
      const clean = name.toLowerCase().trim();
      let t = memTags.find((mt) => mt.userId === userId && mt.name === clean);
      if (!t) {
        t = {
          id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: clean,
          userId,
          createdAt: new Date().toISOString(),
        };
        memTags.push(t);
      }
      resolvedTags.push(t);
    }

    const newEntry: MemEntry = {
      id: `entry-${Date.now()}`,
      userId,
      title: input.title,
      content: input.content || '',
      excerpt: stats.excerpt,
      mood: input.mood || null,
      moodScore,
      isFavorite: input.isFavorite || false,
      isPinned: input.isPinned || false,
      isArchived: input.isArchived || false,
      isDraft: input.isDraft || false,
      wordCount: stats.wordCount,
      readingTime: stats.readingTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: input.isDraft ? null : new Date().toISOString(),
      tags: resolvedTags,
    };

    memEntries.unshift(newEntry);
    return newEntry;
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
    const existing = await this.getEntryById(id, userId);
    if (!existing) throw new Error('Entry not found or unauthorized');

    const updatedTitle = input.title !== undefined ? input.title : existing.title;
    const updatedContent = input.content !== undefined ? input.content : existing.content;
    const stats = calculateTextStats(updatedContent, updatedTitle);
    const updatedMood = input.mood !== undefined ? input.mood : existing.mood;
    const moodScore = updatedMood ? getMoodScore(updatedMood) : null;

    if (isDbConnected()) {
      // Manage tags if provided
      if (input.tags) {
        await prisma.entryTag.deleteMany({ where: { entryId: id } });
        const createdTags = await Promise.all(
          input.tags.map((name) =>
            prisma.tag.upsert({
              where: { name_userId: { name: name.toLowerCase().trim(), userId } },
              create: { name: name.toLowerCase().trim(), userId },
              update: {},
            })
          )
        );
        await prisma.entryTag.createMany({
          data: createdTags.map((t) => ({ entryId: id, tagId: t.id })),
        });
      }

      const updated = await prisma.journalEntry.update({
        where: { id },
        data: {
          title: updatedTitle,
          content: updatedContent,
          excerpt: stats.excerpt,
          mood: updatedMood,
          moodScore,
          isFavorite: input.isFavorite !== undefined ? input.isFavorite : existing.isFavorite,
          isPinned: input.isPinned !== undefined ? input.isPinned : existing.isPinned,
          isArchived: input.isArchived !== undefined ? input.isArchived : existing.isArchived,
          isDraft: input.isDraft !== undefined ? input.isDraft : existing.isDraft,
          wordCount: stats.wordCount,
          readingTime: stats.readingTime,
          publishedAt: input.isDraft === false && !existing.publishedAt ? new Date() : undefined,
          updatedAt: new Date(),
        },
        include: {
          entryTags: { include: { tag: true } },
          media: true,
        },
      });

      return {
        ...updated,
        tags: updated.entryTags.map((et) => et.tag),
        entryTags: undefined,
      };
    }

    // MEMORY IMPLEMENTATION
    const memItem = memEntries.find((e) => e.id === id && e.userId === userId)!;
    memItem.title = updatedTitle;
    memItem.content = updatedContent;
    memItem.excerpt = stats.excerpt;
    memItem.mood = updatedMood;
    memItem.moodScore = moodScore;
    memItem.wordCount = stats.wordCount;
    memItem.readingTime = stats.readingTime;
    memItem.updatedAt = new Date().toISOString();

    if (input.isFavorite !== undefined) memItem.isFavorite = input.isFavorite;
    if (input.isPinned !== undefined) memItem.isPinned = input.isPinned;
    if (input.isArchived !== undefined) memItem.isArchived = input.isArchived;
    if (input.isDraft !== undefined) {
      memItem.isDraft = input.isDraft;
      if (!input.isDraft && !memItem.publishedAt) {
        memItem.publishedAt = new Date().toISOString();
      }
    }

    if (input.tags) {
      const resolvedTags: MemTag[] = [];
      for (const name of input.tags) {
        const clean = name.toLowerCase().trim();
        let t = memTags.find((mt) => mt.userId === userId && mt.name === clean);
        if (!t) {
          t = {
            id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: clean,
            userId,
            createdAt: new Date().toISOString(),
          };
          memTags.push(t);
        }
        resolvedTags.push(t);
      }
      memItem.tags = resolvedTags;
    }

    return memItem;
  }

  static async deleteEntry(id: string, userId: string) {
    if (isDbConnected()) {
      return prisma.journalEntry.deleteMany({
        where: { id, userId },
      });
    }
    const idx = memEntries.findIndex((e) => e.id === id && e.userId === userId);
    if (idx !== -1) {
      memEntries.splice(idx, 1);
      return true;
    }
    return false;
  }

  static async toggleFavorite(id: string, userId: string) {
    const entry = await this.getEntryById(id, userId);
    if (!entry) throw new Error('Entry not found');
    const updated = await this.updateEntry(id, userId, { isFavorite: !entry.isFavorite });
    return updated.isFavorite;
  }

  static async togglePin(id: string, userId: string) {
    const entry = await this.getEntryById(id, userId);
    if (!entry) throw new Error('Entry not found');
    const updated = await this.updateEntry(id, userId, { isPinned: !entry.isPinned });
    return updated.isPinned;
  }

  static async toggleArchive(id: string, userId: string) {
    const entry = await this.getEntryById(id, userId);
    if (!entry) throw new Error('Entry not found');
    const updated = await this.updateEntry(id, userId, { isArchived: !entry.isArchived });
    return updated.isArchived;
  }

  // ---- DAILY MOOD REPOSITORY ----
  static async getDailyMoods(userId: string) {
    if (isDbConnected()) {
      return prisma.dailyMood.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
      });
    }
    return memDailyMoods
      .filter((m) => m.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  static async getDailyMoodByDate(userId: string, date: string) {
    if (isDbConnected()) {
      return prisma.dailyMood.findUnique({
        where: { userId_date: { userId, date } },
      });
    }
    return memDailyMoods.find((m) => m.userId === userId && m.date === date) || null;
  }

  static async upsertDailyMood(userId: string, data: { date: string; mood: string; score?: number; note?: string | null }) {
    const score = data.score ?? getMoodScore(data.mood);
    if (isDbConnected()) {
      return prisma.dailyMood.upsert({
        where: { userId_date: { userId, date: data.date } },
        create: {
          userId,
          date: data.date,
          mood: data.mood,
          score,
          note: data.note || null,
        },
        update: {
          mood: data.mood,
          score,
          note: data.note || null,
        },
      });
    }
    const existing = memDailyMoods.find((m) => m.userId === userId && m.date === data.date);
    if (existing) {
      existing.mood = data.mood;
      existing.score = score;
      existing.note = data.note || null;
      return existing;
    }
    const created: MemDailyMood = {
      id: `dm-${Date.now()}`,
      userId,
      date: data.date,
      mood: data.mood,
      score,
      note: data.note || null,
      createdAt: new Date().toISOString(),
    };
    memDailyMoods.push(created);
    return created;
  }

  // ---- SESSIONS & RESET TOKENS ----
  static async createSession(userId: string, token: string, expiresAt: Date) {
    if (isDbConnected()) {
      return prisma.session.create({ data: { userId, token, expiresAt } });
    }
    memSessions.push({ id: `sess-${Date.now()}`, userId, token, expiresAt });
  }

  static async deleteSession(token: string) {
    if (isDbConnected()) {
      return prisma.session.deleteMany({ where: { token } });
    }
    const idx = memSessions.findIndex((s) => s.token === token);
    if (idx !== -1) memSessions.splice(idx, 1);
  }

  static async createResetToken(userId: string, token: string, expiresAt: Date) {
    if (isDbConnected()) {
      return prisma.passwordResetToken.create({ data: { userId, token, expiresAt } });
    }
    memResetTokens.push({ id: `tok-${Date.now()}`, userId, token, expiresAt, usedAt: null });
  }

  static async findValidResetToken(token: string) {
    if (isDbConnected()) {
      return prisma.passwordResetToken.findFirst({
        where: { token, usedAt: null, expiresAt: { gt: new Date() } },
      });
    }
    return memResetTokens.find(
      (t) => t.token === token && !t.usedAt && new Date(t.expiresAt).getTime() > Date.now()
    ) || null;
  }

  static async markResetTokenUsed(token: string) {
    if (isDbConnected()) {
      return prisma.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      });
    }
    const t = memResetTokens.find((item) => item.token === token);
    if (t) t.usedAt = new Date();
  }
}

function getMoodScore(mood: string): number {
  switch (mood.toLowerCase()) {
    case 'excellent': return 5;
    case 'good': return 4;
    case 'calm': return 4;
    case 'neutral': return 3;
    case 'low': return 2;
    case 'anxious': return 2;
    case 'sad': return 1;
    case 'angry': return 1;
    default: return 3;
  }
}
