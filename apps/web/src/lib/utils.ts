import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import confetti from 'canvas-confetti';
import { format, parseISO } from 'date-fns';
import { MOODS, MoodType } from '@lumajournal/shared';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateInput: string | Date | null | undefined, pattern: string = 'MMM d, yyyy'): string {
  if (!dateInput) return '';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    return format(d, pattern);
  } catch (e) {
    return String(dateInput);
  }
}

export function getMoodMeta(key?: string | null) {
  if (!key) return null;
  return MOODS.find((m) => m.key.toLowerCase() === key.toLowerCase()) || null;
}

export function triggerConfetti() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#7C3AED', '#A78BFA', '#FDBA74', '#10B981'],
  });
}
