import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Pin, Archive, Trash2, Clock, Calendar, Edit3, MoreHorizontal } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { JournalEntry } from '@lumajournal/shared';
import { formatDate, getMoodMeta } from '../../lib/utils';
import { Modal } from '../ui/Modal';

interface JournalCardProps {
  entry: JournalEntry;
  viewMode?: 'grid' | 'list';
  onToggleFavorite?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onToggleArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const JournalCard: React.FC<JournalCardProps> = ({
  entry,
  viewMode = 'grid',
  onToggleFavorite,
  onTogglePin,
  onToggleArchive,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const mood = getMoodMeta(entry.mood);

  const handleDeleteConfirm = () => {
    setShowDeleteModal(false);
    onDelete?.(entry.id);
  };

  if (viewMode === 'list') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="group relative flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-soft-md transition-all gap-4"
        >
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/entries/${entry.id}`)}>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {entry.isPinned && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Pin className="w-3 h-3 fill-current" /> Pinned
                </span>
              )}
              {entry.isDraft && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-500/10 text-foreground-muted border border-border-subtle">
                  Draft
                </span>
              )}
              {mood && (
                <span
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${mood.color}15`, color: mood.color }}
                >
                  <span>{mood.emoji}</span>
                  <span>{mood.label}</span>
                </span>
              )}
              <span className="text-xs text-foreground-subtle flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(entry.createdAt)}
              </span>
            </div>

            <h3 className="font-serif font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate">
              {entry.title}
            </h3>

            <p className="text-sm text-foreground-muted line-clamp-1 mt-1">
              {entry.excerpt}
            </p>

            {entry.tags && entry.tags.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {entry.tags.map((t) => (
                  <span
                    key={t.id}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-surface-elevated text-foreground-subtle"
                  >
                    #{t.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 shrink-0 self-end md:self-center">
            <span className="text-xs text-foreground-subtle flex items-center gap-1 mr-3">
              <Clock className="w-3 h-3" />
              {entry.readingTime}m read
            </span>

            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(entry.id)}
                className={`p-2 rounded-lg transition-colors ${
                  entry.isFavorite
                    ? 'text-amber-500 bg-amber-500/10'
                    : 'text-foreground-subtle hover:text-foreground hover:bg-surface-elevated'
                }`}
                title={entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={`w-4 h-4 ${entry.isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(`/entries/${entry.id}`)}
              className="p-2 rounded-lg text-foreground-subtle hover:text-primary hover:bg-surface-elevated transition-colors"
              title="Edit reflection"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {onTogglePin && (
              <button
                type="button"
                onClick={() => onTogglePin(entry.id)}
                className={`p-2 rounded-lg transition-colors ${
                  entry.isPinned
                    ? 'text-amber-600 bg-amber-500/10'
                    : 'text-foreground-subtle hover:text-foreground hover:bg-surface-elevated'
                }`}
                title={entry.isPinned ? 'Unpin' : 'Pin to top'}
              >
                <Pin className="w-4 h-4" />
              </button>
            )}

            {onToggleArchive && (
              <button
                type="button"
                onClick={() => onToggleArchive(entry.id)}
                className="p-2 rounded-lg text-foreground-subtle hover:text-foreground hover:bg-surface-elevated transition-colors"
                title={entry.isArchived ? 'Restore from archive' : 'Archive entry'}
              >
                <Archive className="w-4 h-4" />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="p-2 rounded-lg text-foreground-subtle hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Delete reflection"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete reflection?"
          description="Are you sure you want to permanently delete this journal entry? This action cannot be undone."
        >
          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-soft-sm"
            >
              Permanently Delete
            </button>
          </div>
        </Modal>
      </>
    );
  }

  // Grid View
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group relative flex flex-col justify-between p-6 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-soft-md transition-all h-full"
      >
        <div>
          {/* Header metadata row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {entry.isPinned && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Pin className="w-3 h-3 fill-current" /> Pinned
                </span>
              )}
              {entry.isDraft && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-500/10 text-foreground-muted border border-border-subtle">
                  Draft
                </span>
              )}
              {mood && (
                <span
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${mood.color}15`, color: mood.color }}
                >
                  <span>{mood.emoji}</span>
                  <span>{mood.label}</span>
                </span>
              )}
            </div>

            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(entry.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  entry.isFavorite
                    ? 'text-amber-500 bg-amber-500/10'
                    : 'text-foreground-subtle hover:text-foreground'
                }`}
                title={entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={`w-4 h-4 ${entry.isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          {/* Title */}
          <Link to={`/entries/${entry.id}`} className="block group-hover:text-primary transition-colors">
            <h3 className="font-serif font-bold text-xl text-foreground mb-2 line-clamp-2 leading-snug">
              {entry.title}
            </h3>
          </Link>

          {/* Excerpt */}
          <p className="text-sm text-foreground-muted line-clamp-3 mb-4 leading-relaxed">
            {entry.excerpt}
          </p>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-4">
              {entry.tags.slice(0, 3).map((t) => (
                <span
                  key={t.id}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-surface-elevated text-foreground-subtle font-medium"
                >
                  #{t.name}
                </span>
              ))}
              {entry.tags.length > 3 && (
                <span className="text-[10px] text-foreground-subtle">
                  +{entry.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer info & action buttons */}
        <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-foreground-subtle mt-auto">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(entry.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {entry.readingTime}m
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => navigate(`/entries/${entry.id}`)}
              className="p-1.5 rounded-md hover:bg-surface-elevated hover:text-primary transition-colors"
              title="Edit reflection"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            {onToggleArchive && (
              <button
                type="button"
                onClick={() => onToggleArchive(entry.id)}
                className="p-1.5 rounded-md hover:bg-surface-elevated hover:text-foreground transition-colors"
                title={entry.isArchived ? 'Restore' : 'Archive'}
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="p-1.5 rounded-md hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete reflection?"
        description="Are you sure you want to permanently delete this journal entry? This action cannot be undone."
      >
        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteConfirm}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-soft-sm"
          >
            Permanently Delete
          </button>
        </div>
      </Modal>
    </>
  );
};
