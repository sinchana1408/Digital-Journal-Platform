import React from 'react';
import { CheckCircle2, Loader2, CloudOff } from 'lucide-react';
import { format } from 'date-fns';

interface AutosaveStatusProps {
  status: 'saving' | 'saved' | 'idle' | 'error';
  lastSavedAt?: string | null;
}

export const AutosaveStatus: React.FC<AutosaveStatusProps> = ({ status, lastSavedAt }) => {
  return (
    <div className="flex items-center gap-1.5 text-xs text-foreground-muted select-none">
      {status === 'saving' && (
        <>
          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
          <span>Saving reflection...</span>
        </>
      )}

      {status === 'saved' && (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>
            {lastSavedAt ? `Saved at ${format(new Date(lastSavedAt), 'h:mm a')}` : 'Saved just now'}
          </span>
        </>
      )}

      {status === 'idle' && lastSavedAt && (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 opacity-70" />
          <span className="opacity-80">
            Saved {format(new Date(lastSavedAt), 'h:mm a')}
          </span>
        </>
      )}

      {status === 'error' && (
        <>
          <CloudOff className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-rose-500">Unsaved changes</span>
        </>
      )}
    </div>
  );
};
