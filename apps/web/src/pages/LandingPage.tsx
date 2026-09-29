import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Lock,
  Smile,
  Search,
  BarChart3,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Moon,
  Sun,
  Feather,
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary-100 selection:text-primary-900">
      {/* Navigation Bar */}
      <header className="h-20 border-b border-border-subtle bg-surface/70 backdrop-blur-md sticky top-0 z-40 px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-400 flex items-center justify-center text-white shadow-soft-sm group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif font-bold text-xl tracking-tight block">
              LumaJournal
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
            title="Toggle theme"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-700 text-white font-medium text-sm transition-all shadow-soft-sm hover:shadow-soft-md"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-primary hover:bg-primary-700 text-white font-medium text-sm transition-all shadow-soft-sm hover:shadow-soft-md"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 py-20 md:py-32 max-w-5xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-primary text-xs font-semibold mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          <span>LumaJournal — Personal Digital Journal Platform</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.15] mb-6">
          Your thoughts deserve <br />
          <span className="italic font-normal text-primary">a beautiful place.</span>
        </h1>

        <p className="text-lg sm:text-xl text-foreground-muted max-w-2xl mx-auto leading-relaxed mb-10">
          Write freely, remember deeply, and understand yourself better with a private digital journal designed for everyday reflection.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-700 text-white font-medium text-base shadow-soft-md hover:shadow-glow-primary transition-all active:scale-98"
          >
            <span>Start Journaling</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-elevated font-medium text-base transition-colors"
          >
            Explore Features
          </a>
        </div>

        {/* Hero Visual Mockup */}
        <div className="mt-16 w-full rounded-3xl border border-border bg-surface p-4 sm:p-6 shadow-soft-lg text-left">
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              <span className="text-xs text-foreground-subtle ml-2 font-mono">lumajournal.com/editor</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">
              <CheckCircle className="w-3 h-3" />
              <span>Autosaved just now</span>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <span className="text-lg">😌</span>
              <span className="font-semibold text-foreground">Calm</span>
              <span>•</span>
              <span>Sep 29, 2026</span>
              <span>•</span>
              <span className="text-primary font-medium">#mindfulness</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              The quiet beauty of an early morning walk
            </h3>
            <p className="text-foreground-muted text-base leading-relaxed font-serif italic">
              &ldquo;The autumn air had that crisp sharpness today that immediately clears the mind. For the first time in weeks, I didn&apos;t reach for my phone to check notifications. Just the sound of gravel crunching and the slow rhythm of my breath.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-24 px-6 md:px-12 bg-surface-elevated/40 border-y border-border-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Crafted for Clarity & Serenity
            </h2>
            <p className="text-foreground-muted">
              Everything you need to build a lifelong habit of mindful writing and self-discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-soft-sm">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-primary flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-foreground mb-2">Private & Secure</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                Your reflections are personal. Encrypted passwords, JWT tokens, and strict user isolation ensure only you can access your thoughts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-soft-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                <Smile className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-foreground mb-2">Mood Tracking</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                Pair every entry with your emotional state from excellent to anxious. Observe trends and uncover what brings you genuine peace.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-soft-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                <Feather className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-foreground mb-2">Beautiful Editor</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                A distraction-free canvas with rich formatting, real-time autosave, word counts, and estimated reading time calculations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-soft-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-foreground mb-2">Powerful Search</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                Find memories in milliseconds. Search across titles, text, moods, and custom tags with instantaneous debounced filters.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-soft-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-foreground mb-2">Writing Insights</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                Celebrate writing streaks, track total words, view mood distributions, and visualize your personal growth through interactive charts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-soft-sm">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-foreground mb-2">Calendar View</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                A visual timeline of your reflections. Browse by month and see which days you captured moments at a single glance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto text-center">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
          How It Works
        </h2>
        <p className="text-foreground-muted max-w-lg mx-auto mb-16">
          A seamless three-step ritual to bring clarity to everyday life.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900 text-primary flex items-center justify-center text-xl font-bold mb-4">
              1
            </div>
            <h3 className="font-serif font-bold text-lg mb-2">Write</h3>
            <p className="text-sm text-foreground-muted max-w-xs">
              Open your distraction-free editor whenever inspiration strikes or at the end of the day.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900 text-primary flex items-center justify-center text-xl font-bold mb-4">
              2
            </div>
            <h3 className="font-serif font-bold text-lg mb-2">Reflect</h3>
            <p className="text-sm text-foreground-muted max-w-xs">
              Tag your thoughts and record how you felt. Watch your emotional patterns reveal themselves over time.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900 text-primary flex items-center justify-center text-xl font-bold mb-4">
              3
            </div>
            <h3 className="font-serif font-bold text-lg mb-2">Discover</h3>
            <p className="text-sm text-foreground-muted max-w-xs">
              Explore your archive through the calendar, insights, and search to find wisdom in past experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Illustrative Platform Statistics */}
      <section className="py-16 px-6 md:px-12 bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <span className="font-serif text-4xl sm:text-5xl font-bold text-primary block mb-1">
              10K+
            </span>
            <span className="text-sm font-medium text-foreground-muted uppercase tracking-wider">
              Journal Entries
            </span>
          </div>

          <div>
            <span className="font-serif text-4xl sm:text-5xl font-bold text-primary block mb-1">
              24/7
            </span>
            <span className="text-sm font-medium text-foreground-muted uppercase tracking-wider">
              Private Access
            </span>
          </div>

          <div>
            <span className="font-serif text-4xl sm:text-5xl font-bold text-primary block mb-1">
              365
            </span>
            <span className="text-sm font-medium text-foreground-muted uppercase tracking-wider">
              Days of Reflection
            </span>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto text-center">
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-foreground mb-4">
          Start writing your story today.
        </h2>
        <p className="text-lg text-foreground-muted max-w-xl mx-auto mb-8">
          Join thousands of thoughtful individuals cultivating mindfulness, clarity, and gratitude with LumaJournal.
        </p>

        <Link
          to={isAuthenticated ? '/dashboard' : '/register'}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary-700 text-white font-medium text-lg shadow-soft-md hover:shadow-glow-primary transition-all active:scale-98"
        >
          <span>Create Your Free Journal</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 md:px-12 border-t border-border bg-surface text-foreground-muted text-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-serif font-semibold text-foreground">LumaJournal</span>
            <span>— A beautiful space for your thoughts.</span>
          </div>

          <div>
            &copy; {new Date().getFullYear()} LumaJournal Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
