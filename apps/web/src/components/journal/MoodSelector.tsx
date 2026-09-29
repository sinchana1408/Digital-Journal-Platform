import React from 'react';
import { MOODS } from '@lumajournal/shared';

interface MoodSelectorProps {
  selectedMood?: string | null;
  onSelect: (moodKey: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelect,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'p-1.5 text-base rounded-lg',
    md: 'p-2.5 text-xl rounded-xl',
    lg: 'p-3.5 text-2xl rounded-2xl',
  }[size];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {MOODS.map((m) => {
        const isSelected = selectedMood?.toLowerCase() === m.key;
        return (
          <button
            key={m.key}
            type="button"
            onClick={() => onSelect(m.key)}
            className={`flex items-center gap-1.5 transition-all active:scale-95 border ${sizeClasses} ${
              isSelected
                ? 'bg-primary-50 dark:bg-primary-950/60 border-primary text-primary shadow-soft-sm scale-105'
                : 'bg-surface border-border hover:bg-surface-elevated text-foreground-muted hover:text-foreground'
            }`}
            title={`${m.label} (${m.emoji})`}
          >
            <span>{m.emoji}</span>
            <span className="text-xs font-medium capitalize hidden sm:inline-block">
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
