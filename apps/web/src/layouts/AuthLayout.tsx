import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useTheme } from '../store/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-primary-400 flex items-center justify-center text-white shadow-soft-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-serif font-bold text-lg text-foreground tracking-tight">
            LumaJournal
          </span>
        </Link>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
          title="Toggle theme"
        >
          {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Auth Card Outlet */}
      <main className="my-auto py-8 flex justify-center">
        <div className="w-full max-w-md bg-surface p-8 rounded-3xl border border-border shadow-soft-lg">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-foreground-subtle py-4">
        &copy; {new Date().getFullYear()} LumaJournal. A beautiful space for your thoughts.
      </footer>
    </div>
  );
};
