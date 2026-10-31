import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from './Button';

/**
 * Enterprise Accessible Dark-First Calendar Component
 * Renders monthly recruitment schedule, interview slots, and drive deadlines.
 */
export function Calendar({
  events = [], // [{ id, title, date: 'YYYY-MM-DD', type: 'interview' | 'drive' | 'deadline', time }]
  onSelectDate,
  onEventClick,
  className = '',
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Pad days for grid
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ day: null, dateStr: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    calendarCells.push({ day: d, dateStr: `${year}-${mm}-${dd}` });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const getEventTypeStyles = (type) => {
    switch (type) {
      case 'interview':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'deadline':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'drive':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className={`w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 flex flex-col gap-4 ${className}`}>
      {/* Calendar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base sm:text-lg font-bold text-slate-100">
            {monthNames[month]} {year}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <Button size="xs" variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Button size="icon" variant="outline" onClick={prevMonth} aria-label="Previous month" className="h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={nextMonth} aria-label="Next month" className="h-8 w-8">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-slate-400 border-b border-slate-800 pb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((cell, idx) => {
          if (!cell.day) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[70px] sm:min-h-[85px] rounded-lg bg-slate-950/20 border border-transparent p-1"
              />
            );
          }

          const isToday = cell.dateStr === todayStr;
          const dayEvents = events.filter((e) => e.date === cell.dateStr);

          return (
            <div
              key={cell.dateStr}
              onClick={() => onSelectDate && onSelectDate(cell.dateStr)}
              className={`
                min-h-[70px] sm:min-h-[85px] rounded-lg p-1.5 flex flex-col transition-colors
                border ${
                  isToday
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-850/60'
                }
                ${onSelectDate ? 'cursor-pointer' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center
                    ${isToday ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400'}
                  `}
                >
                  {cell.day}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                    {dayEvents.length} ev
                  </span>
                )}
              </div>

              {/* Event pills inside day */}
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[50px] scrollbar-none">
                {dayEvents.slice(0, 2).map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick && onEventClick(ev);
                    }}
                    className={`
                      text-[10px] font-medium px-1.5 py-0.5 rounded border text-left truncate w-full cursor-pointer
                      ${getEventTypeStyles(ev.type)}
                    `}
                    title={`${ev.time ? ev.time + ' - ' : ''}${ev.title}`}
                  >
                    {ev.time && <span className="font-mono mr-1 opacity-75">{ev.time}</span>}
                    <span>{ev.title}</span>
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[9px] text-slate-400 text-center font-semibold">
                    +{dayEvents.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
