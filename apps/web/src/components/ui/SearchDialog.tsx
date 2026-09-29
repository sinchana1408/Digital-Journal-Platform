import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, Calendar, Tag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { JournalEntry } from '@lumajournal/shared';
import { formatDate, getMoodMeta } from '../../lib/utils';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSearchTerm('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via parent or event
        }
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.getEntries({ search: searchTerm, limit: 8 });
        setResults(res.data);
      } catch (e) {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelect = (id: string) => {
    onClose();
    navigate(`/entries/${id}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-soft-lg border border-border text-foreground z-10 overflow-hidden"
          >
            {/* Input Header */}
            <div className="flex items-center px-4 py-3.5 border-b border-border gap-3">
              <Search className="w-5 h-5 text-foreground-subtle shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your memories by title, thoughts, or tags..."
                className="flex-1 bg-transparent border-none text-foreground placeholder:text-foreground-subtle focus:outline-none text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-foreground-subtle hover:text-foreground p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className="text-xs font-mono px-2 py-1 rounded bg-surface-elevated text-foreground-muted border border-border-subtle">
                ESC
              </span>
            </div>

            {/* Results or Loading */}
            <div className="max-h-96 overflow-y-auto p-2">
              {isLoading && (
                <div className="py-8 text-center text-sm text-foreground-muted">
                  Searching your memories...
                </div>
              )}

              {!isLoading && searchTerm.trim() && results.length === 0 && (
                <div className="py-8 text-center text-sm text-foreground-muted">
                  No memories found matching &ldquo;<span className="font-semibold text-foreground">{searchTerm}</span>&rdquo;
                </div>
              )}

              {!isLoading && !searchTerm.trim() && (
                <div className="py-6 px-4 text-center text-xs text-foreground-muted">
                  Type a keyword, feeling, or tag to search your personal journal...
                </div>
              )}

              {!isLoading && results.length > 0 && (
                <div className="space-y-1">
                  {results.map((entry) => {
                    const mood = getMoodMeta(entry.mood);
                    return (
                      <button
                        key={entry.id}
                        onClick={() => handleSelect(entry.id)}
                        className="w-full text-left p-3 rounded-xl hover:bg-surface-elevated transition-colors flex items-start justify-between gap-4 group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {mood && <span title={mood.label}>{mood.emoji}</span>}
                            <h4 className="font-serif font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                              {entry.title}
                            </h4>
                          </div>
                          <p className="text-xs text-foreground-muted line-clamp-1">
                            {entry.excerpt}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-foreground-subtle">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(entry.createdAt)}
                            </span>
                            {entry.tags && entry.tags.length > 0 && (
                              <span className="flex items-center gap-1 truncate">
                                <Tag className="w-3 h-3" />
                                {entry.tags.map((t) => `#${t.name}`).join(' ')}
                              </span>
                            )}
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-foreground-subtle group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-1" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
