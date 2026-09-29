import React from 'react';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak?: number;
  className?: string;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  currentStreak,
  longestStreak,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 text-foreground ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
        <Flame className="w-6 h-6 stroke-[2.2] animate-pulse" />
      </div>
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-serif text-foreground">{currentStreak}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            {currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
          </span>
        </div>
        <p className="text-xs text-foreground-muted mt-0.5">
          {longestStreak ? `Personal record: ${longestStreak} days` : 'Keep writing daily to build your habit'}
        </p>
      </div>
    </div>
  );
};
