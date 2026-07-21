import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '../../i18n';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function buildCalendar(year, month) {
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const rows = [];
  let cells = [];
  for (let i = 0; i < first; i++) cells.push({ day: daysInPrev - first + 1 + i, outside: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, outside: false });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length % 7 === 0 ? 1 : cells[cells.length - 1].day + 1, outside: true });
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

function formatDate(year, month, day) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

const POPOVER_WIDTH = 290;
const POPOVER_HEIGHT = 326;
const GAP = 6;

export default function DatePicker({ value, onChange }) {
  const t = useT('common');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('day');
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);
  const popoverRef = useRef(null);
  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : today.getMonth());

  useEffect(() => {
    if (!isCalendarOpen) return;
    const handler = (e) => {
      const insideTrigger = containerRef.current && containerRef.current.contains(e.target);
      const insidePopover = popoverRef.current && popoverRef.current.contains(e.target);
      if (!insideTrigger && !insidePopover) setIsCalendarOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isCalendarOpen]);

  const toggleCalendar = () => {
    const opening = !isCalendarOpen;
    if (opening) {
      setViewMode('day');
      const d = value ? new Date(value + 'T00:00:00') : today;
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      const btn = containerRef.current;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const halfW = POPOVER_WIDTH / 2;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const fitsBelow = spaceBelow >= POPOVER_HEIGHT + GAP;
        const fitsAbove = spaceAbove >= POPOVER_HEIGHT + GAP;
        const below = fitsBelow || (!fitsAbove && spaceBelow >= spaceAbove);
        const left = Math.max(halfW, Math.min(centerX, window.innerWidth - halfW));
        setPopoverPos({
          top: below ? rect.bottom + GAP : rect.top - POPOVER_HEIGHT - GAP,
          left,
          below,
        });
      }
    }
    setIsCalendarOpen(opening);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const selectDay = (day, outside) => {
    if (outside) {
      if (day > 15) { const nm = viewMonth === 0 ? 11 : viewMonth - 1; const ny = viewMonth === 0 ? viewYear - 1 : viewYear; setViewMonth(nm); setViewYear(ny); }
      else { const nm = viewMonth === 11 ? 0 : viewMonth + 1; const ny = viewMonth === 11 ? viewYear + 1 : viewYear; setViewMonth(nm); setViewYear(ny); }
    }
    const m = outside && day > 15 ? (viewMonth === 0 ? 11 : viewMonth - 1) : outside ? (viewMonth === 11 ? 0 : viewMonth + 1) : viewMonth;
    const y = outside && day > 15 ? (viewMonth === 0 ? viewYear - 1 : viewYear) : outside ? (viewMonth === 11 ? viewYear + 1 : viewYear) : viewYear;
    onChange(formatDate(y, m, day));
    setIsCalendarOpen(false);
  };

  const todayClick = () => { onChange(todayStr); setIsCalendarOpen(false); };
  const clearClick = () => { onChange(''); setIsCalendarOpen(false); };

  const yearRange = Array.from({ length: 101 }, (_, i) => today.getFullYear() - 50 + i);
  const rows = buildCalendar(viewYear, viewMonth);
  const displayValue = value
    ? `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
    : '';

  return (
    <>
      <div ref={containerRef}>
        <button type="button" onClick={toggleCalendar} className={`text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/60 w-full flex items-center justify-between cursor-pointer transition-all duration-200 ${isCalendarOpen ? 'shadow-[0_0_0_2px_rgba(52,199,89,0.3)]' : ''}`}
          onMouseEnter={(e) => { if (!isCalendarOpen) { e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.background = '#F9FAFB'; } }}
          onMouseLeave={(e) => { if (!isCalendarOpen) { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = ''; } }}
        >
          <span className={value ? 'text-[#1C1C1E]' : 'text-text-placeholder'}>{displayValue || 'Select due date'}</span>
          <i className="ph ph-calendar-blank text-text-placeholder text-sm" />
        </button>
      </div>
      {isCalendarOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999 }}>
        <div
          ref={popoverRef}
          style={{
            pointerEvents: 'auto',
            position: 'absolute',
            top: popoverPos.top + 'px',
            left: popoverPos.left + 'px',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: POPOVER_WIDTH + 'px',
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            {viewMode === 'day' ? (
              <>
                <button type="button" onClick={prevMonth} className="w-8 h-8 inline-flex items-center justify-center cursor-pointer rounded-lg transition-colors duration-150" style={{ color: '#111827' }} tabIndex={-1}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <i className="ph ph-caret-left text-sm" />
                </button>
                <span onClick={() => setViewMode('year')} style={{ color: '#111827', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                  {MONTHS[viewMonth]}, {viewYear}
                </span>
                <button type="button" onClick={nextMonth} className="w-8 h-8 inline-flex items-center justify-center cursor-pointer rounded-lg transition-colors duration-150" style={{ color: '#111827' }} tabIndex={-1}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <i className="ph ph-caret-right text-sm" />
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setViewMode('day')} className="w-8 h-8 inline-flex items-center justify-center cursor-pointer rounded-lg transition-colors duration-150" style={{ color: '#111827' }} tabIndex={-1}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <i className="ph ph-caret-left text-sm" />
                </button>
                <span style={{ color: '#111827', fontWeight: 700, fontSize: '14px' }}>{viewYear}</span>
                <div style={{ width: '32px' }} />
              </>
            )}
          </div>

          {viewMode === 'day' ? (
            <>
              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map((w) => (
                  <div key={w} className="flex items-center justify-center" style={{ color: '#6B7280', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', height: '24px' }}>{w}</div>
                ))}
              </div>

              {rows.map((week, i) => (
                <div key={i} className="grid grid-cols-7">
                  {week.map((cell, j) => {
                    const dateStr = formatDate(
                      cell.outside && cell.day > 15 ? (viewMonth === 0 ? viewYear - 1 : viewYear) : cell.outside ? (viewMonth === 11 ? viewYear + 1 : viewYear) : viewYear,
                      cell.outside && cell.day > 15 ? (viewMonth === 0 ? 11 : viewMonth - 1) : cell.outside ? (viewMonth === 11 ? 0 : viewMonth + 1) : viewMonth,
                      cell.day
                    );
                    const isSelected = dateStr === value;
                    const isToday = dateStr === todayStr;
                    return (
                      <button
                        type="button"
                        key={j}
                        onClick={() => selectDay(cell.day, cell.outside)}
                        className="cursor-pointer inline-flex items-center justify-center transition-colors duration-150"
                        tabIndex={-1}
                        style={{
                          width: '32px',
                          height: '32px',
                          fontSize: '13px',
                          fontWeight: isSelected ? 700 : 500,
                          color: cell.outside ? '#D1D5DB' : isSelected ? '#FFFFFF' : isToday ? '#10B981' : '#374151',
                          background: isSelected ? '#10B981' : 'transparent',
                          border: isToday && !isSelected ? '1px solid #10B981' : 'none',
                          borderRadius: '8px',
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#F3F4F6'; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>
              ))}
            </>
          ) : (
            <div style={{ maxHeight: '248px', overflowY: 'auto' }}>
              <div className="grid grid-cols-4 gap-1">
                {yearRange.map((y) => {
                  const isActive = y === viewYear;
                  return (
                    <button
                      type="button"
                      key={y}
                      onClick={() => { setViewYear(y); setViewMode('day'); }}
                      className="cursor-pointer transition-colors duration-150"
                      tabIndex={-1}
                      style={{
                        padding: '8px 4px',
                        fontSize: '13px',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#FFFFFF' : '#374151',
                        background: isActive ? '#10B981' : 'transparent',
                        borderRadius: '8px',
                        border: 'none',
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#F3F4F6'; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #E5E7EB' }}>
            <button type="button" onClick={clearClick} className="cursor-pointer bg-none border-none" style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563', padding: '4px 8px', borderRadius: '8px', transition: 'background 0.15s ease' }} tabIndex={-1}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >{t('clear')}</button>
            <button type="button" onClick={todayClick} className="cursor-pointer bg-none border-none" style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563', padding: '4px 8px', borderRadius: '8px', transition: 'background 0.15s ease' }} tabIndex={-1}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >{t('today')}</button>
          </div>
        </div>,
        </div>,
        document.body
      )}
    </>
  );
}
