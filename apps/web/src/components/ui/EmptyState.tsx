import React from 'react';
import { LucideIcon, BookOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = BookOpen,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-surface/50 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary flex items-center justify-center mb-4 shadow-soft-sm">
        <Icon className="w-7 h-7 stroke-[1.75]" />
      </div>
      <h3 className="text-lg font-serif font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-foreground-muted max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-primary-foreground bg-primary hover:bg-primary-700 transition-all shadow-soft-sm hover:shadow-soft-md active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
