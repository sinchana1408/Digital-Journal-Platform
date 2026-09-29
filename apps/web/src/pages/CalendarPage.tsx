import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CalendarDayEntry, MOODS } from '@lumajournal/shared';
import { formatDate, getMoodMeta } from '../lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  BookOpen,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { format, addMonths, subMonths, getDay, parseISO } from 'date-fns';

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDayEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDayEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    setIsLoading(true);
    api
      .getCalendar(year, month)
      .then((res) => {
        if (res.success) {
          setCalendarDays(res.data);
          // Default select today or first day with entries
          const todayStr = format(new Date(), 'yyyy-MM-dd');
          const foundToday = res.data.find((d) => d.date === todayStr);
          setSelectedDay(foundToday || res.data.find((d) => d.hasEntry) || res.data[0]);
        }
      })
      .finally(() => setIsLoading(false));
  }, [year, month]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Determine starting blank offset for day of week (Monday as 0)
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const startingDayIndex = (getDay(firstDayOfMonth) + 6) % 7; // Monday = 0, Sunday = 6

  const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Calendar View
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Browse your journaling journey across the months
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-surface-elevated transition-colors"
          >
            Today
          </button>
          <div className="flex items-center bg-surface border border-border rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-serif font-bold text-sm px-3 text-foreground min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid & Selected Day Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-surface border border-border shadow-soft-sm">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center">
            {weekDayLabels.map((wd) => (
              <span
                key={wd}
                className="text-xs font-semibold uppercase tracking-wider text-foreground-muted py-1"
              >
                {wd}
              </span>
            ))}
          </div>

          {isLoading ? (
            <div className="py-24 text-center text-foreground-muted flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-xs">Loading calendar dates...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Blank offset tiles */}
              {Array.from({ length: startingDayIndex }).map((_, i) => (
                <div key={`blank-${i}`} className="min-h-[72px] sm:min-h-[90px] rounded-2xl bg-surface-elevated/20 border border-transparent" />
              ))}

              {/* Month Day Tiles */}
              {calendarDays.map((day) => {
                const isSelected = selectedDay?.date === day.date;
                const isCurrentToday = format(new Date(), 'yyyy-MM-dd') === day.date;
                const dayNumber = parseISO(day.date).getDate();

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[72px] sm:min-h-[90px] p-2.5 rounded-2xl text-left border flex flex-col justify-between transition-all relative ${
                      isSelected
                        ? 'border-primary bg-primary-50/70 dark:bg-primary-950/40 shadow-soft-sm scale-[1.02]'
                        : day.hasEntry
                        ? 'border-border bg-surface hover:border-primary/40 hover:bg-surface-elevated'
                        : 'border-border-subtle bg-surface/50 hover:bg-surface-elevated opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                          isCurrentToday
                            ? 'bg-primary text-white'
                            : 'text-foreground'
                        }`}
                      >
                        {dayNumber}
                      </span>

                      {day.hasEntry && (
                        <span className="text-[10px] font-mono font-semibold text-primary bg-primary-100 dark:bg-primary-900 px-1.5 py-0.5 rounded-md">
                          {day.count}
                        </span>
                      )}
                    </div>

                    {/* Mood indicator pills */}
                    {day.hasEntry && (
                      <div className="flex items-center gap-1 mt-auto flex-wrap">
                        {day.moods.slice(0, 3).map((mKey, idx) => {
                          const meta = getMoodMeta(mKey);
                          return (
                            <span key={idx} className="text-xs" title={meta?.label}>
                              {meta?.emoji || '📝'}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Day Sidebar */}
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <h3 className="font-serif font-bold text-lg text-foreground">
                  {selectedDay ? formatDate(selectedDay.date, 'MMMM d, yyyy') : 'Select a date'}
                </h3>
              </div>
            </div>

            {selectedDay?.entries && selectedDay.entries.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-foreground-muted mb-2">
                  {selectedDay.entries.length}{' '}
                  {selectedDay.entries.length === 1 ? 'reflection' : 'reflections'} written on this day:
                </p>

                {selectedDay.entries.map((item) => {
                  const mood = getMoodMeta(item.mood);
                  return (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/entries/${item.id}`)}
                      className="p-3.5 rounded-2xl bg-surface-elevated hover:bg-surface-elevated/80 border border-border-subtle cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          {mood && <span>{mood.emoji}</span>}
                          <span className="font-serif font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                            {item.title}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-foreground-subtle group-hover:text-primary transition-all" />
                      </div>
                      <p className="text-xs text-foreground-muted line-clamp-2">
                        {item.excerpt}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-foreground-muted space-y-2">
                <BookOpen className="w-8 h-8 text-foreground-subtle mx-auto opacity-50" />
                <p className="text-sm font-serif">No memories recorded for this date.</p>
                <p className="text-xs max-w-xs mx-auto">
                  Take a moment to write about what happened on this day.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-border-subtle">
            <button
              onClick={() => navigate('/entries/new')}
              className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-soft-sm active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Write Reflection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
