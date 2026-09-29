import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const passwordHash = await bcrypt.hash('Password123', 12);

  // 1. Create or update Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: 'alex@lumajournal.com' },
    update: {
      name: 'Alex Mercer',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Reflective writer, product designer, and tea enthusiast. Exploring everyday mindfulness.',
      timezone: 'America/New_York',
    },
    create: {
      name: 'Alex Mercer',
      email: 'alex@lumajournal.com',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Reflective writer, product designer, and tea enthusiast. Exploring everyday mindfulness.',
      timezone: 'America/New_York',
    },
  });

  console.log(`👤 Seeded User: ${demoUser.email} (Password: Password123)`);

  // 2. Create Tags
  const tagNames = ['reflection', 'mindfulness', 'creativity', 'goals', 'gratitude', 'travel', 'wellness', 'ideas'];
  const tagMap = new Map<string, string>();

  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name_userId: { name, userId: demoUser.id } },
      update: {},
      create: { name, userId: demoUser.id },
    });
    tagMap.set(name, tag.id);
  }
  console.log(`🏷️  Seeded ${tagMap.size} tags.`);

  // 3. Clear existing entries to prevent duplication on re-seed
  await prisma.journalEntry.deleteMany({ where: { userId: demoUser.id } });

  // 4. Create Entries
  const rawSeedEntries = [
    {
      title: 'The quiet beauty of an early morning walk',
      content: `<p>The autumn air had that crisp sharpness today that immediately clears the mind. Walking through the neighborhood park before the rest of the world woke up felt like stepping into an untouched canvas.</p><p>I noticed the way the early sun cut diagonal amber rays through the pine branches. For the first time in weeks, I did not reach for my phone to check notifications or emails. Just the sound of gravel crunching under my boots and the slow rhythm of my breath.</p><blockquote>"In the stillness of morning, the mind finds its natural center."</blockquote><p>I want to make this a daily ritual. Even just fifteen minutes makes the entire day feel intentional rather than reactive.</p>`,
      excerpt: 'The autumn air had that crisp sharpness today that immediately clears the mind. Walking through the neighborhood park before the rest of the world woke up...',
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
      title: 'Redesigning the creative workflow: Less is truly more',
      content: `<p>Had an epiphany about my creative process this afternoon. For the last three months, I have been juggling six different tools, note apps, and complex project dashboards. It was causing decision fatigue before I even wrote a single word or sketched a wireframe.</p><p>Today I stripped everything back. Just one notebook, one focused digital journal, and a timer. The clarity was immediate. Work flowed with effortless momentum.</p><p>Key takeaways:</p><ul><li>Limit active priorities to maximum 3 per day</li><li>Protect morning hours for deep, uninterrupted creative focus</li><li>Embrace blank space in schedules and designs</li></ul>`,
      excerpt: 'Had an epiphany about my creative process this afternoon. For the last three months, I have been juggling six different tools...',
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
      title: 'Navigating unexpected changes and finding balance',
      content: `<p>A client project took a sudden turn today. At first, an instinctive wave of anxiety flared up—all the meticulously planned timelines felt upended. But after stepping away for a cup of green tea, I realized this is just an opportunity to simplify the scope and focus on what genuinely delivers value.</p><p>Acceptance isn't giving up; it's recognizing reality so you can respond with grace instead of frantic energy.</p>`,
      excerpt: 'A client project took a sudden turn today. At first, an instinctive wave of anxiety flared up—all the meticulously planned timelines felt upended...',
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
      title: 'Three simple things I am grateful for today',
      content: `<p>Taking five minutes before bed to ground myself in gratitude:</p><ol><li><strong>The smell of fresh rain</strong> on the warm asphalt after three hot days.</li><li><strong>A spontaneous 45-minute phone call</strong> with an old college friend laughing about old memories.</li><li><strong>A warm dinner cooked from scratch</strong> without rushing through it.</li></ol><p>It is so easy to overlook these gentle everyday miracles when chasing tomorrow's milestones.</p>`,
      excerpt: 'Taking five minutes before bed to ground myself in gratitude: 1. The smell of fresh rain, 2. A spontaneous phone call with an old friend...',
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
      title: 'Drafting our road trip along the coastal highway',
      content: `<p>Rough itinerary thoughts for the upcoming weekend drive:</p><p>Start early Friday dawn to beat highway traffic. Stop at the lighthouse viewpoint for breakfast sandwiches and thermos coffee. Explore the cliffside trails in the afternoon.</p><p>Pack essentials: camera, sketchbook, rain jackets, and playlist of acoustic jazz and indie folk.</p>`,
      excerpt: 'Rough itinerary thoughts for the upcoming weekend drive: Start early Friday dawn to beat highway traffic. Stop at the lighthouse viewpoint...',
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
      title: 'Dealing with low energy without guilt',
      content: `<p>Woke up with heavy limbs and zero drive. In the past, I would have forced myself into overdrive, fueled by guilt and coffee. Today, I honored what my body was asking for: gentleness.</p><p>I rescheduled non-urgent meetings, took a warm Epsom salt bath, and read two chapters of Oliver Burkeman's <em>Four Thousand Weeks</em>. By evening, my spirit felt restored.</p>`,
      excerpt: 'Woke up with heavy limbs and zero drive. In the past, I would have forced myself into overdrive, fueled by guilt and coffee. Today, I honored what my body was asking for...',
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
      title: 'Weekend farmers market discoveries & culinary experiments',
      content: `<p>Spent Saturday morning browsing the downtown farmers market. Picked up heirloom tomatoes, wild honey, and a sourdough loaf that was still warm when the baker handed it to me.</p><p>Spent the evening roasting the tomatoes with garlic, olive oil, and fresh basil. Cooking slowly is such an understated form of active meditation.</p>`,
      excerpt: 'Spent Saturday morning browsing the downtown farmers market. Picked up heirloom tomatoes, wild honey, and a warm sourdough loaf...',
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
      title: 'Quarterly retrospective: Milestones achieved and lessons learned',
      content: `<p>Sitting down with coffee to review Q3. Looking back through my journal entries from July and August gives such an illuminating perspective on personal growth.</p><p>Things that seemed like insurmountable crises two months ago are now barely a footnote. Consistency in small daily habits proved 10x more effective than sporadic bursts of heroic effort.</p>`,
      excerpt: 'Sitting down with coffee to review Q3. Looking back through my journal entries from July and August gives such an illuminating perspective on personal growth...',
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
      title: 'Old thoughts on project architecture (Archived)',
      content: `<p>Legacy notes from our initial prototype design. Storing here for historical reference on why certain decisions were made regarding data models and schemas.</p>`,
      excerpt: 'Legacy notes from our initial prototype design. Storing here for historical reference on why certain decisions were made...',
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

  for (const item of rawSeedEntries) {
    const entryDate = subDays(new Date(), item.daysAgo);
    const words = item.content.replace(/<[^>]*>?/gm, ' ').split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    const entry = await prisma.journalEntry.create({
      data: {
        userId: demoUser.id,
        title: item.title,
        content: item.content,
        excerpt: item.excerpt,
        mood: item.mood,
        moodScore: item.moodScore,
        isFavorite: item.isFavorite,
        isPinned: item.isPinned,
        isArchived: item.isArchived,
        isDraft: item.isDraft,
        wordCount: words,
        readingTime,
        createdAt: entryDate,
        updatedAt: entryDate,
        publishedAt: item.isDraft ? null : entryDate,
        entryTags: {
          create: item.tags
            .map((tName) => {
              const tagId = tagMap.get(tName);
              return tagId ? { tagId } : null;
            })
            .filter(Boolean) as { tagId: string }[],
        },
      },
    });
  }

  console.log(`📖 Seeded ${rawSeedEntries.length} journal entries.`);

  // 5. Seed Daily Moods
  const moods = [
    { daysAgo: 0, mood: 'calm', score: 4, note: 'Morning walk and clear head' },
    { daysAgo: 1, mood: 'excellent', score: 5, note: 'Creative flow state unlocked' },
    { daysAgo: 2, mood: 'neutral', score: 3, note: 'Busy work day, balanced' },
    { daysAgo: 3, mood: 'good', score: 4, note: 'Gratitude evening' },
    { daysAgo: 4, mood: 'good', score: 4, note: 'Planning upcoming trip' },
    { daysAgo: 5, mood: 'low', score: 2, note: 'Needed rest and recuperation' },
    { daysAgo: 6, mood: 'excellent', score: 5, note: 'Farmers market & cooking' },
    { daysAgo: 7, mood: 'calm', score: 4, note: 'Retrospective reflections' },
  ];

  for (const m of moods) {
    const dateStr = subDays(new Date(), m.daysAgo).toISOString().split('T')[0];
    await prisma.dailyMood.upsert({
      where: { userId_date: { userId: demoUser.id, date: dateStr } },
      update: { mood: m.mood, score: m.score, note: m.note },
      create: { userId: demoUser.id, date: dateStr, mood: m.mood, score: m.score, note: m.note },
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
