import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardStats } from '@lumajournal/shared';
import { StreakBadge } from '../components/journal/StreakBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Smile,
  FileText,
  Calendar,
  Sparkles,
  Info,
  Loader2,
} from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .getDashboard()
      .then((data) => {
        if (data.success) setStats(data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-foreground-muted flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm">Calculating your personal insights...</p>
      </div>
    );
  }

  const insights = stats?.insights;
  const moodDist = stats?.moodDistribution || [];
  const monthlyStats = stats?.monthlyStats || [];
  const moodTrends = stats?.moodTrends || [];
  const topTags = stats?.topTags || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-2 border-b border-border-subtle">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
          Writing Insights & Mood Trends
        </h1>
        <p className="text-sm text-foreground-muted mt-1">
          Explore patterns in your thoughts, emotional states, and writing habits
        </p>
      </div>

      {/* Writing Insights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-soft-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Total Entries</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-serif text-3xl font-bold text-foreground">
              {insights?.totalEntries || 0}
            </span>
            <span className="text-xs text-foreground-muted">reflections</span>
          </div>
          <div className="mt-3 text-xs text-foreground-subtle flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>{insights?.entriesThisMonth || 0} this month</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border shadow-soft-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Total Words</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-serif text-3xl font-bold text-foreground">
              {(insights?.totalWords || 0).toLocaleString()}
            </span>
            <span className="text-xs text-foreground-muted">words</span>
          </div>
          <div className="mt-3 text-xs text-foreground-subtle">
            {insights?.wordsThisMonth || 0} written this month
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border shadow-soft-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Average Length</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-serif text-3xl font-bold text-foreground">
              {insights?.avgWords || 0}
            </span>
            <span className="text-xs text-foreground-muted">words/entry</span>
          </div>
          <div className="mt-3 text-xs text-foreground-subtle">
            ~{Math.max(1, Math.ceil((insights?.avgWords || 0) / 200))} min read avg
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border shadow-soft-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Longest Reflection</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-serif text-3xl font-bold text-foreground">
              {(insights?.longestEntry || 0).toLocaleString()}
            </span>
            <span className="text-xs text-foreground-muted">words</span>
          </div>
          <div className="mt-3 text-xs text-foreground-subtle">
            Peak expressive flow
          </div>
        </div>
      </div>

      {/* Writing Habit Streak */}
      <StreakBadge
        currentStreak={insights?.currentStreak || 0}
        longestStreak={insights?.longestStreak}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Distribution */}
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-soft-sm">
          <div className="flex items-center gap-2 mb-4">
            <Smile className="w-5 h-5 text-primary" />
            <h2 className="font-serif font-bold text-lg text-foreground">Mood Distribution</h2>
          </div>
          <p className="text-xs text-foreground-muted mb-6">
            Proportions of emotional states recorded in your reflections
          </p>

          {moodDist.length === 0 ? (
            <div className="py-16 text-center text-xs text-foreground-muted">
              Record moods on your reflections to visualize emotional patterns.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moodDist} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="label"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      borderRadius: '12px',
                      color: 'var(--foreground)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {moodDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Writing Activity Over Time */}
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-soft-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="font-serif font-bold text-lg text-foreground">Monthly Output</h2>
          </div>
          <p className="text-xs text-foreground-muted mb-6">
            Total journal entries written across the past 6 months
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="month"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderRadius: '12px',
                    color: 'var(--foreground)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="entries" fill="#7C3AED" radius={[6, 6, 0, 0]} name="Entries" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood Trend Over Time */}
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-soft-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-serif font-bold text-lg text-foreground">Recent Mood Timeline</h2>
          </div>
          <p className="text-xs text-foreground-muted mb-6">
            Emotional rating (1 to 5) across recent daily check-ins
          </p>

          {moodTrends.length === 0 ? (
            <div className="py-16 text-center text-xs text-foreground-muted">
              Log daily moods on the dashboard to track trajectory over time.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodTrends} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="date"
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      borderRadius: '12px',
                      color: 'var(--foreground)',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Mood Rating"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Frequent Tags */}
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-soft-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-serif font-bold text-lg text-foreground">Top Themes & Tags</h2>
          </div>
          <p className="text-xs text-foreground-muted mb-6">
            Themes that recur most often in your reflective writing
          </p>

          {topTags.length === 0 ? (
            <div className="py-16 text-center text-xs text-foreground-muted">
              Add #tags to your entries to see your recurring life themes.
            </div>
          ) : (
            <div className="space-y-3">
              {topTags.map((tag) => (
                <div key={tag.name} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground bg-surface-elevated px-2.5 py-1 rounded-lg">
                    #{tag.name}
                  </span>
                  <div className="flex items-center gap-3 flex-1 mx-4">
                    <div className="flex-1 h-2 rounded-full bg-surface-elevated overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${Math.min(100, (tag.count / (insights?.totalEntries || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-foreground-muted">{tag.count} entries</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Observational Notice (Compliance with prompt: do not make medical or psychological claims) */}
      <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle flex items-start gap-3 text-xs text-foreground-muted">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p>
          <strong>Personal Journaling Notice:</strong> These insights represent descriptive statistics calculated exclusively from your personal reflections. They are intended for mindful reflection and self-observation, not medical diagnosis or professional psychological evaluation.
        </p>
      </div>
    </div>
  );
};
