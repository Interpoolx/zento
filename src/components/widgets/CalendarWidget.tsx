import React, { useMemo } from 'react';
import type { CalendarWidgetContent } from '@/types';
import { cn } from '@/lib/utils';

interface CalendarWidgetProps {
  content: CalendarWidgetContent;
  style?: React.CSSProperties;
  isEditing?: boolean;
  onClick?: () => void;
}

/**
 * Widget component for displaying an interactive calendar with events.
 * Allows month navigation and shows event indicators on specific days.
 * @param props - Component props
 * @param props.content - Calendar content including events array
 * @param props.style - Optional inline styles
 * @param props.isEditing - Whether the widget is in edit mode
 * @param props.onClick - Optional click handler for edit mode
 * @returns Interactive calendar widget with event display
 */
export function CalendarWidget({ content, style, isEditing, onClick }: CalendarWidgetProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const { daysInMonth, firstDayOfMonth, events } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = date.getDay();

    const eventsByDate: Record<string, typeof content.events> = {};
    content.events.forEach(event => {
      const eventDate = new Date(event.date).toDateString();
      if (!eventsByDate[eventDate]) {
        eventsByDate[eventDate] = [];
      }
      eventsByDate[eventDate].push(event);
    });

    return { daysInMonth, firstDayOfMonth, events: eventsByDate };
  }, [currentMonth, content.events]);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = Array.from({ length: 7 }, (_, i) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]);
  const emptyDays = Array.from({ length: firstDayOfMonth });
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div
      className={cn(
        'flex flex-col h-full p-6',
        isEditing && 'ring-2 ring-primary-500/20'
      )}
      style={style}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg">{monthName}</h3>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {days.map(day => (
            <div key={day} className="text-center text-xs font-bold opacity-50">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {dayNumbers.map(day => {
            const dateStr = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              day
            ).toDateString();
            const dayEvents = events[dateStr] || [];

            return (
              <div
                key={day}
                className={cn(
                  'aspect-square text-center text-xs p-1 rounded border',
                  dayEvents.length > 0
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-transparent'
                )}
              >
                <div className="font-bold">{day}</div>
                {dayEvents.length > 0 && (
                  <div className="text-primary-600 font-semibold">{dayEvents.length}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      {content.events.length > 0 && (
        <div className="border-t pt-4 mt-4 max-h-32 overflow-y-auto">
          <h4 className="font-semibold text-sm mb-2">Upcoming Events</h4>
          <div className="space-y-2">
            {content.events.slice(0, 3).map(event => (
              <div key={event.id} className="text-xs">
                <p className="font-bold">{event.title}</p>
                <p className="opacity-70">{event.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
