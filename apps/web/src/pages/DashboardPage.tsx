import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useSocket } from '../store/SocketContext';
import { api } from '../services/api';
import { DashboardStats, SOCKET_EVENTS } from '@lumajournal/shared';
import { StreakBadge } from '../components/journal/StreakBadge';
import { JournalCard } from '../components/journal/JournalCard';
import { MoodSelector } from '../components/journal/MoodSelector';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { triggerConfetti } from '../lib/utils';
import {
  BookOpen,
  Plus,
  FileText,
  TrendingUp,
  Smile,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [todayMoodNote, setTodayMoodNote] = useState('');
  const [isLoggingMood, setIsLoggingMood] = useState(false);

  // Time-based personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const loadDashboard = async () => {
    try {
      const data = await api.getDashboard();
      if (data.success) {
        setStats(data);
      }
    } catch (e: any) {
      toastError('Could not load dashboard insights');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Listen to real-time stats updates
  useEffect(() => {
    if (!socket) return;
    const handleStatsUpdate = () => {
      loadDashboard();
    };
    socket.on(SOCKET_EVENTS.STATS_UPDATED, handleStatsUpdate);
    socket.on(SOCKET_EVENTS.ENTRY_SAVED, handleStatsUpdate);
    return () => {
      socket.off(SOCKET_EVENTS.STATS_UPDATED, handleStatsUpdate);
      socket.off(SOCKET_EVENTS.ENTRY_SAVED, handleStatsUpdate);
    };
  }, [socket]);

  const handleSelectTodayMood = async (moodKey: string) => {
    setIsLoggingMood(true);
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    try {
      await api.logMood({
        date: dateStr,
        mood: moodKey,
        note: todayMoodNote || null,
      });
      success('Mood recorded', `Logged ${moodKey} for today.`);
      triggerConfetti();
      loadDashboard();
    } catch (err: any) {
      toastError(err.message || 'Could not log mood');
    } finally {
      setIsLoggingMood(false);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await api.toggleFavorite(id);
      loadDashboard();
    } catch (e) {
      toastError('Failed to update favorite status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-foreground-muted">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm">Preparing your dashboard...</p>
      </div>
    );
  }

  const insights = stats?.insights;
  const recentEntries = stats?.recentEntries || [];
  const todayMood = stats?.todayMood;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Writer'}
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} • Take a quiet breath and reflect on your day.
          </p>
        </div>

        <button
          onClick={() => navigate('/entries/new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-700 text-white font-medium text-sm shadow-soft-sm hover:shadow-soft-md transition-all active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Write Reflection</span>
        </button>
      </div>

      {/* Writing Habit & Today's Mood Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Reflection & Mood Prompt */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-surface border border-border shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-primary" />
                <h2 className="font-serif font-bold text-lg text-foreground">How are you feeling today?</h2>
              </div>
              {todayMood && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium">
                  Logged for today
                </span>
              )}
            </div>

            <p className="text-sm text-foreground-muted mb-4">
              Record your current state of mind. Tracking feelings helps build self-awareness over time.
            </p>

            <MoodSelector
              selectedMood={todayMood?.mood}
              onSelect={handleSelectTodayMood}
              size="md"
            />

            <div className="mt-4">
              <input
                type="text"
                value={todayMoodNote}
                onChange={(e) => setTodayMoodNote(e.target.value)}
                placeholder="Add a quick note about why you feel this way (optional)..."
                className="w-full px-3.5 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between">
            <span className="text-xs text-foreground-muted">
              {todayMood ? `Today's mood: ${todayMood.mood} ${todayMood.note ? `• "${todayMood.note}"` : ''}` : 'No mood logged yet today'}
            </span>
            <Link
              to="/insights"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View mood trends</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Writing Streak Card */}
        <div className="flex flex-col justify-between">
          <StreakBadge
            currentStreak={insights?.currentStreak || 0}
            longestStreak={insights?.longestStreak}
            className="h-full"
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-soft-sm">
          <div className="flex items-center justify-between text-foreground-subtle mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Total Entries</span>
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-foreground">
              {insights?.totalEntries || 0}
            </span>
            <span className="text-xs text-foreground-muted">reflections saved</span>
          </div>
          <div className="mt-3 text-xs text-foreground-subtle flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>{insights?.entriesThisMonth || 0} written this month</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border shadow-soft-sm">
          <div className="flex items-center justify-between text-foreground-subtle mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Words Written</span>
            <FileText className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-foreground">
              {(insights?.totalWords || 0).toLocaleString()}
            </span>
            <span className="text-xs text-foreground-muted">total words</span>
          </div>
          <div className="mt-3 text-xs text-foreground-subtle flex items-center gap-1">
            <span>Avg {insights?.avgWords || 0} words per entry</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border shadow-soft-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-foreground-subtle mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Longest Reflection</span>
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-foreground">
              {(insights?.longestEntry || 0).toLocaleString()}
            </span>
            <span className="text-xs text-foreground-muted">words</span>
          </div>
          <div className="mt-3 text-xs text-foreground-subtle">
            Deepest flow state recorded
          </div>
        </div>
      </div>

      {/* Recent Entries Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground">Recent Reflections</h2>
            <p className="text-xs text-foreground-muted">Your latest written entries</p>
          </div>
          <Link
            to="/entries"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View all entries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentEntries.length === 0 ? (
          <EmptyState
            title="Your story starts here."
            description="You haven't written any reflections yet. Capture your first thought today."
            actionLabel="Write your first entry"
            onAction={() => navigate('/entries/new')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentEntries.map((entry) => (
              <JournalCard
                key={entry.id}
                entry={entry}
                viewMode="grid"
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
