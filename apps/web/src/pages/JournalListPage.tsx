import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { JournalEntry, Tag, MOODS } from '@lumajournal/shared';
import { JournalCard } from '../components/journal/JournalCard';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Smile,
  Tag as TagIcon,
  Loader2,
} from 'lucide-react';

interface JournalListPageProps {
  initialStatus?: 'all' | 'favorites' | 'pinned' | 'archived' | 'drafts';
  pageTitle?: string;
  pageSubtitle?: string;
}

export const JournalListPage: React.FC<JournalListPageProps> = ({
  initialStatus = 'all',
  pageTitle = 'Journal Reflections',
  pageSubtitle = 'A chronological archive of your thoughts and memories',
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: toastError } = useToast();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [status, setStatus] = useState<'all' | 'favorites' | 'pinned' | 'archived' | 'drafts'>(
    (searchParams.get('status') as any) || initialStatus
  );
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedMood, setSelectedMood] = useState(searchParams.get('mood') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'title' | 'wordCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Load tags
  useEffect(() => {
    api.getTags().then((res) => {
      if (res.success) setAvailableTags(res.tags);
    });
  }, []);

  // Fetch entries
  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const res = await api.getEntries({
        status,
        search: search.trim() || undefined,
        mood: selectedMood || undefined,
        tags: selectedTag || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 9,
      });

      if (res.success) {
        setEntries(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.total);
      }
    } catch (e: any) {
      toastError('Could not fetch entries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [status, search, selectedMood, selectedTag, sortBy, sortOrder, page]);

  const handleToggleFavorite = async (id: string) => {
    try {
      await api.toggleFavorite(id);
      fetchEntries();
    } catch (e) {
      toastError('Failed to update favorite');
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await api.togglePin(id);
      fetchEntries();
    } catch (e) {
      toastError('Failed to update pin');
    }
  };

  const handleToggleArchive = async (id: string) => {
    try {
      await api.toggleArchive(id);
      success('Archive status updated');
      fetchEntries();
    } catch (e) {
      toastError('Failed to update archive status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteEntry(id);
      success('Entry permanently deleted');
      fetchEntries();
    } catch (e) {
      toastError('Failed to delete entry');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedMood('');
    setSelectedTag('');
    setStatus(initialStatus);
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || selectedMood || selectedTag || status !== initialStatus);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            {pageTitle}
          </h1>
          <p className="text-sm text-foreground-muted mt-1">{pageSubtitle}</p>
        </div>

        <button
          onClick={() => navigate('/entries/new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-700 text-white font-medium text-sm shadow-soft-sm hover:shadow-soft-md transition-all active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Reflection</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-foreground-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, contents, feelings, or tags..."
              className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-foreground text-xs placeholder:text-foreground-subtle focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View mode toggle & Sort */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-') as [any, any];
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-foreground focus:outline-none"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="wordCount-desc">Longest First</option>
            </select>

            <div className="flex items-center rounded-xl bg-surface-elevated p-1 border border-border-subtle">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-surface text-primary shadow-soft-sm'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-surface text-primary shadow-soft-sm'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border-subtle text-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-xl">
            {(['all', 'favorites', 'pinned', 'drafts', 'archived'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setStatus(tab);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors ${
                  status === tab
                    ? 'bg-surface text-primary shadow-soft-sm font-semibold'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Mood Dropdown Filter */}
          <select
            value={selectedMood}
            onChange={(e) => {
              setSelectedMood(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-foreground focus:outline-none"
          >
            <option value="">All Moods</option>
            {MOODS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.emoji} {m.label}
              </option>
            ))}
          </select>

          {/* Tag Dropdown Filter */}
          {availableTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => {
                setSelectedTag(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-foreground focus:outline-none"
            >
              <option value="">All Tags</option>
              {availableTags.map((t) => (
                <option key={t.id} value={t.name}>
                  #{t.name}
                </option>
              ))}
            </select>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-2.5 py-1.5 rounded-xl text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-auto font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Entries List / Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-foreground-muted flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-sm">Fetching reflections...</p>
        </div>
      ) : entries.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            title="We couldn't find anything matching your search."
            description="Try adjusting your keywords, moods, or clear all filters to see your entries."
            actionLabel="Clear all filters"
            onAction={clearFilters}
          />
        ) : status === 'favorites' ? (
          <EmptyState
            title="Nothing saved yet."
            description="Star your favorite memories so you can return to them whenever you need a lift."
            actionLabel="Browse all entries"
            onAction={() => setStatus('all')}
          />
        ) : status === 'archived' ? (
          <EmptyState
            title="Archive is clear."
            description="Entries you archive will be kept safe here, separate from your everyday view."
          />
        ) : (
          <EmptyState
            title="Your story starts here."
            description="You haven't written any reflections yet. Capture your first thought today."
            actionLabel="Write your first entry"
            onAction={() => navigate('/entries/new')}
          />
        )
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-3'
          }
        >
          {entries.map((entry) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              viewMode={viewMode}
              onToggleFavorite={handleToggleFavorite}
              onTogglePin={handleTogglePin}
              onToggleArchive={handleToggleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-border-subtle text-xs text-foreground-muted">
          <span>
            Showing <strong className="text-foreground">{entries.length}</strong> of{' '}
            <strong className="text-foreground">{totalCount}</strong> entries
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-border bg-surface hover:bg-surface-elevated disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-border bg-surface hover:bg-surface-elevated disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
