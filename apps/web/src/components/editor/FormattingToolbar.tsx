import React from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Image,
  Link2,
  Minus,
  Undo,
  Redo,
} from 'lucide-react';

interface FormattingToolbarProps {
  onCommand: (command: string, value?: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  className?: string;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  onCommand,
  canUndo = true,
  canRedo = true,
  className = '',
}) => {
  const handleInsertImage = () => {
    const url = window.prompt(
      'Enter image URL (e.g. from Unsplash):',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    );
    if (url) {
      onCommand('insertImage', url);
    }
  };

  const handleInsertLink = () => {
    const url = window.prompt('Enter link URL (e.g. https://...):');
    if (url) {
      onCommand('createLink', url);
    }
  };

  const buttons = [
    { label: 'Bold', icon: Bold, action: () => onCommand('bold') },
    { label: 'Italic', icon: Italic, action: () => onCommand('italic') },
    { type: 'divider' },
    { label: 'Heading 1', icon: Heading1, action: () => onCommand('formatBlock', 'h1') },
    { label: 'Heading 2', icon: Heading2, action: () => onCommand('formatBlock', 'h2') },
    { label: 'Heading 3', icon: Heading3, action: () => onCommand('formatBlock', 'h3') },
    { type: 'divider' },
    { label: 'Bullet list', icon: List, action: () => onCommand('insertUnorderedList') },
    { label: 'Numbered list', icon: ListOrdered, action: () => onCommand('insertOrderedList') },
    { label: 'Quote', icon: Quote, action: () => onCommand('formatBlock', 'blockquote') },
    { label: 'Divider', icon: Minus, action: () => onCommand('insertHorizontalRule') },
    { type: 'divider' },
    { label: 'Insert Link', icon: Link2, action: handleInsertLink },
    { label: 'Insert Image', icon: Image, action: handleInsertImage },
  ];

  return (
    <div
      className={`flex items-center gap-1 p-1.5 rounded-xl bg-surface border border-border shadow-soft-sm flex-wrap ${className}`}
    >
      <button
        type="button"
        onClick={() => onCommand('undo')}
        disabled={!canUndo}
        className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-elevated disabled:opacity-40 transition-colors"
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onCommand('redo')}
        disabled={!canRedo}
        className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-elevated disabled:opacity-40 transition-colors"
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-5 bg-border mx-1" />

      {buttons.map((btn, index) => {
        if (btn.type === 'divider') {
          return <div key={`div-${index}`} className="w-[1px] h-5 bg-border mx-1" />;
        }
        const Icon = btn.icon!;
        return (
          <button
            key={btn.label}
            type="button"
            onClick={btn.action}
            className="p-1.5 rounded-lg text-foreground-muted hover:text-primary hover:bg-surface-elevated transition-colors"
            title={btn.label}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
};
