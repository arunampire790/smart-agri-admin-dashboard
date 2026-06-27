import { useState, useRef, useEffect } from 'react';

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

export default function DatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : today.getMonth());

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openCalendar = () => {
    const d = value ? new Date(value + 'T00:00:00') : today;
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setOpen(true);
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
    setOpen(false);
  };

  const todayClick = () => { onChange(todayStr); setOpen(false); };
  const clearClick = () => { onChange(''); setOpen(false); };

  const rows = buildCalendar(viewYear, viewMonth);
  const displayValue = value
    ? `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
    : '';

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={openCalendar} className={`text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/60 w-full flex items-center justify-between cursor-pointer ${open ? 'shadow-[0_0_0_2px_rgba(52,199,89,0.3)]' : ''}`}>
        <span className={value ? 'text-[#1C1C1E]' : 'text-text-placeholder'}>{displayValue || 'Select due date'}</span>
        <i className="ph ph-calendar-blank text-text-placeholder text-sm" />
      </button>
      {open && (
        <div className="absolute z-[100] top-full left-0 right-0 mt-1" style={{ width: '280px' }}>
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.03)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={prevMonth} className="w-8 h-8 inline-flex items-center justify-center cursor-pointer rounded-lg hover:bg-[#F3F4F6] transition-colors duration-150" style={{ color: '#111827' }}>
                <i className="ph ph-caret-left text-sm" />
              </button>
              <span style={{ color: '#111827', fontWeight: 700, fontSize: '14px' }}>
                {MONTHS[viewMonth]}, {viewYear}
              </span>
              <button type="button" onClick={nextMonth} className="w-8 h-8 inline-flex items-center justify-center cursor-pointer rounded-lg hover:bg-[#F3F4F6] transition-colors duration-150" style={{ color: '#111827' }}>
                <i className="ph ph-caret-right text-sm" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((w) => (
                <div key={w} className="flex items-center justify-center" style={{ color: '#6B7280', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', height: '24px' }}>{w}</div>
              ))}
            </div>

            {rows.map((week, i) => (
              <div key={i} className="grid grid-cols-7">
                {week.map((cell, j) => {
                  const dateStr = formatDate(cell.outside && cell.day > 15 ? (viewMonth === 0 ? viewYear - 1 : viewYear) : cell.outside ? (viewMonth === 11 ? viewYear + 1 : viewYear) : viewYear, cell.outside && cell.day > 15 ? (viewMonth === 0 ? 11 : viewMonth - 1) : cell.outside ? (viewMonth === 11 ? 0 : viewMonth + 1) : viewMonth, cell.day);
                  const isSelected = dateStr === value;
                  const isToday = dateStr === todayStr;
                  return (
                    <button
                      type="button"
                      key={j}
                      onClick={() => selectDay(cell.day, cell.outside)}
                      className="cursor-pointer inline-flex items-center justify-center transition-colors duration-150"
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

            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #E5E7EB' }}>
              <button type="button" onClick={clearClick} className="cursor-pointer bg-none border-none" style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Clear</button>
              <button type="button" onClick={todayClick} className="cursor-pointer bg-none border-none" style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Today</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
