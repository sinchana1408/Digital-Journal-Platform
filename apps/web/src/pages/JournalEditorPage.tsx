import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useSocket } from '../store/SocketContext';
import { useToast } from '../components/ui/Toast';
import { FormattingToolbar } from '../components/editor/FormattingToolbar';
import { AutosaveStatus } from '../components/editor/AutosaveStatus';
import { MoodSelector } from '../components/journal/MoodSelector';
import { MOODS, calculateEntryStats } from '@lumajournal/shared';
import { triggerConfetti } from '../lib/utils';
import {
  ArrowLeft,
  Star,
  Pin,
  Smile,
  Tag as TagIcon,
  X,
  Type,
  Trash2,
  Share2,
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';

export const JournalEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { success, error: toastError } = useToast();

  const [entryId, setEntryId] = useState<string | null>(isNew ? null : id);
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [stats, setStats] = useState({ wordCount: 0, readingTime: 1, charCount: 0 });
  const [showMoodDropdown, setShowMoodDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const isDirtyRef = useRef(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing entry
  useEffect(() => {
    if (!isNew && id) {
      api
        .getEntry(id)
        .then((res) => {
          if (res.success && res.entry) {
            const e = res.entry;
            setTitle(e.title);
            setContentHtml(e.content || '');
            if (editorRef.current) {
              editorRef.current.innerHTML = e.content || '';
            }
            setMood(e.mood || null);
            setTags(e.tags?.map((t) => t.name) || []);
            setIsFavorite(e.isFavorite);
            setIsPinned(e.isPinned);
            setIsDraft(e.isDraft);
            setStats({
              wordCount: e.wordCount,
              readingTime: e.readingTime,
              charCount: e.content ? e.content.replace(/<[^>]*>?/gm, '').length : 0,
            });
            setLastSavedAt(typeof e.updatedAt === 'string' ? e.updatedAt : e.updatedAt.toISOString());
            setSaveStatus('saved');
          }
        })
        .catch(() => {
          toastError('Failed to load entry');
          navigate('/entries');
        });
    }
  }, [id, isNew]);

  // Recalculate stats when content changes
  const updateStats = useCallback((text: string) => {
    const calculated = calculateEntryStats(text);
    const plain = text.replace(/<[^>]*>?/gm, '').trim();
    setStats({
      wordCount: calculated.wordCount,
      readingTime: calculated.readingTime,
      charCount: plain.length,
    });
  }, []);

  // Save entry to server (Debounced autosave)
  const saveEntry = useCallback(
    async (isManual: boolean = false) => {
      const currentTitle = title.trim() || 'Untitled Reflection';
      const currentHtml = editorRef.current ? editorRef.current.innerHTML : contentHtml;

      if (!isDirtyRef.current && !isManual && entryId) return;

      setSaveStatus('saving');

      try {
        if (!entryId) {
          // Create new entry
          const res = await api.createEntry({
            title: currentTitle,
            content: currentHtml,
            mood,
            tags,
            isFavorite,
            isPinned,
            isArchived: false,
            isDraft,
          });

          if (res.success && res.entry) {
            setEntryId(res.entry.id);
            setLastSavedAt(new Date().toISOString());
            setSaveStatus('saved');
            isDirtyRef.current = false;
            // Update URL cleanly without full reload
            window.history.replaceState(null, '', `/entries/${res.entry.id}`);
            if (isManual) success('Saved', 'Reflection saved successfully.');
          }
        } else {
          // Update existing entry
          const res = await api.updateEntry(entryId, {
            title: currentTitle,
            content: currentHtml,
            mood,
            tags,
            isFavorite,
            isPinned,
            isDraft,
          });

          if (res.success && res.entry) {
            setLastSavedAt(new Date().toISOString());
            setSaveStatus('saved');
            isDirtyRef.current = false;
            if (isManual) success('Saved', 'Reflection saved successfully.');
          }
        }
      } catch (err) {
        setSaveStatus('error');
      }
    },
    [title, contentHtml, mood, tags, isFavorite, isPinned, isDraft, entryId, success]
  );

  // Trigger debounced autosave when dirty
  const markDirty = () => {
    isDirtyRef.current = true;
    setSaveStatus('idle');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveEntry(false);
    }, 1500);
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContentHtml(html);
      updateStats(html);
      markDirty();
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    markDirty();
  };

  const handleToolbarCommand = (command: string, value: string = '') => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleEditorInput();
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (clean && !tags.includes(clean)) {
        const newTags = [...tags, clean];
        setTags(newTags);
        setTagInput('');
        markDirty();
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    setTags(updated);
    markDirty();
  };

  const handleDeleteEntry = async () => {
    if (!entryId) return;
    try {
      await api.deleteEntry(entryId);
      success('Entry deleted', 'The reflection was removed from your journal.');
      navigate('/entries');
    } catch (e) {
      toastError('Failed to delete entry');
    }
  };

  const currentMood = MOODS.find((m) => m.key === mood);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/entries')}
            className="p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface border border-border-subtle transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <AutosaveStatus status={saveStatus} lastSavedAt={lastSavedAt} />
        </div>

        <div className="flex items-center gap-2">
          {/* Font switcher */}
          <button
            type="button"
            onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
            className="p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface border border-border-subtle transition-colors flex items-center gap-1 text-xs"
            title={`Current font: ${fontFamily}. Click to toggle.`}
          >
            <Type className="w-4 h-4" />
            <span className="capitalize">{fontFamily}</span>
          </button>

          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsFavorite(!isFavorite);
              markDirty();
            }}
            className={`p-2 rounded-xl border border-border-subtle transition-colors ${
              isFavorite
                ? 'text-amber-500 bg-amber-500/10 border-amber-500/30'
                : 'text-foreground-muted hover:text-foreground hover:bg-surface'
            }`}
            title={isFavorite ? 'Starred' : 'Star this reflection'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Pin Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsPinned(!isPinned);
              markDirty();
            }}
            className={`p-2 rounded-xl border border-border-subtle transition-colors ${
              isPinned
                ? 'text-primary bg-primary-50 dark:bg-primary-950/60 border-primary/30'
                : 'text-foreground-muted hover:text-foreground hover:bg-surface'
            }`}
            title={isPinned ? 'Pinned to top' : 'Pin to top'}
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
          </button>

          {/* Delete Button (if existing entry) */}
          {entryId && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="p-2 rounded-xl border border-border-subtle text-foreground-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Delete reflection"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Manual Save / Publish Button */}
          <button
            type="button"
            onClick={() => saveEntry(true)}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-700 text-white font-medium text-xs shadow-soft-sm hover:shadow-soft-md transition-all active:scale-95"
          >
            Save Reflection
          </button>
        </div>
      </div>

      {/* Title Input */}
      <div>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="How I felt today..."
          className={`w-full bg-transparent border-none text-foreground placeholder:text-foreground-subtle focus:outline-none text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight ${
            fontFamily === 'serif' ? 'font-serif' : 'font-sans'
          }`}
        />
      </div>

      {/* Mood & Tag Pickers Bar */}
      <div className="flex items-center gap-3 flex-wrap py-2 border-y border-border-subtle">
        {/* Mood Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMoodDropdown(!showMoodDropdown)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-xs font-medium text-foreground transition-colors"
          >
            {currentMood ? (
              <>
                <span>{currentMood.emoji}</span>
                <span className="capitalize">{currentMood.label}</span>
              </>
            ) : (
              <>
                <Smile className="w-3.5 h-3.5 text-foreground-subtle" />
                <span className="text-foreground-muted">Select Mood</span>
              </>
            )}
          </button>

          {showMoodDropdown && (
            <div className="absolute left-0 mt-2 p-3 bg-surface rounded-2xl border border-border shadow-soft-lg z-30 w-72">
              <div className="text-xs font-semibold text-foreground mb-2">How did you feel?</div>
              <MoodSelector
                selectedMood={mood}
                onSelect={(k) => {
                  setMood(k);
                  setShowMoodDropdown(false);
                  markDirty();
                }}
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Tags Bar */}
        <div className="flex items-center gap-1.5 flex-wrap flex-1">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-surface-elevated text-foreground border border-border-subtle"
            >
              <TagIcon className="w-3 h-3 text-primary" />
              <span>#{t}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(t)}
                className="text-foreground-subtle hover:text-foreground p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="+ Add tag (press enter)"
            className="bg-transparent border-none text-xs text-foreground placeholder:text-foreground-subtle focus:outline-none px-2 py-1 min-w-[120px]"
          />
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="sticky top-20 z-20">
        <FormattingToolbar onCommand={handleToolbarCommand} />
      </div>

      {/* Writing Canvas */}
      <div className="min-h-[450px] p-6 rounded-2xl bg-surface border border-border shadow-soft-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleEditorInput}
          className={`editorial-prose focus:outline-none min-h-[400px] text-foreground ${
            fontFamily === 'serif' ? 'font-serif' : 'font-sans'
          }`}
          data-placeholder="Start writing your thoughts here..."
          style={{ minHeight: '380px' }}
        />
      </div>

      {/* Bottom Status & Writing Stats */}
      <div className="flex items-center justify-between text-xs text-foreground-muted px-2 py-3 border-t border-border-subtle flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <span>Words: <strong className="text-foreground">{stats.wordCount}</strong></span>
          <span>Characters: <strong className="text-foreground">{stats.charCount}</strong></span>
          <span>Reading time: <strong className="text-foreground">{stats.readingTime} min</strong></span>
        </div>

        <div className="text-[11px] text-foreground-subtle">
          Autosaves automatically as you write
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Reflection?"
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
            onClick={handleDeleteEntry}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-soft-sm"
          >
            Permanently Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};
