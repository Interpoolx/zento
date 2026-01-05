import React, { useState, useEffect } from 'react';
import type { CountdownWidgetContent } from '@/types';
import { cn } from '@/lib/utils';

interface CountdownWidgetProps {
  content: CountdownWidgetContent;
  style?: React.CSSProperties;
  isEditing?: boolean;
  onClick?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

/**
 * Widget component for displaying a live countdown timer to a target date/time.
 * 
 * Renders an animated countdown showing days, hours, minutes, and seconds until 
 * the target date is reached. When the countdown expires, displays a celebration
 * message with an optional custom message.
 * 
 * Features:
 * - Real-time updates every second via `setInterval`
 * - Automatic cleanup of timer on unmount
 * - Optional time unit labels (Days, Hours, Minutes, Seconds)
 * - Customizable title and expiration message
 * - Responsive layout with mobile-friendly spacing
 * - Edit mode visual indicator for the page builder
 * 
 * @component
 * @param {CountdownWidgetProps} props - Component configuration
 * @param {CountdownWidgetContent} props.content - Countdown settings
 * @param {string} props.content.title - Title displayed above the timer
 * @param {string} props.content.targetDate - ISO date string for countdown target
 * @param {string} [props.content.message] - Optional message shown during/after countdown
 * @param {boolean} [props.content.showLabels=true] - Whether to show time unit labels
 * @param {React.CSSProperties} [props.style] - Custom styles (background, colors, etc.)
 * @param {boolean} [props.isEditing=false] - Enables edit mode styling
 * @param {() => void} [props.onClick] - Click handler for widget selection in editor
 * @returns {React.ReactElement} Animated countdown timer or expiration message
 * 
 * @example
 * // Basic countdown to New Year
 * <CountdownWidget
 *   content={{
 *     title: "New Year Countdown",
 *     targetDate: "2026-01-01T00:00:00",
 *     message: "Happy New Year! 🎉",
 *     showLabels: true
 *   }}
 * />
 * 
 * @example
 * // Product launch countdown with custom styling
 * <CountdownWidget
 *   content={{
 *     title: "Product Launch",
 *     targetDate: "2026-03-15T09:00:00",
 *     message: "Get ready for something amazing!",
 *     showLabels: true
 *   }}
 *   style={{ backgroundColor: '#1a1a2e', color: '#eaeaea' }}
 * />
 * 
 * @see CountdownWidgetContent for full content type definition
 * @see WIDGET_TEMPLATES.countdown for default template configuration
 */
export function CountdownWidget({ content, style, isEditing, onClick }: CountdownWidgetProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    /**
     * Calculates the remaining time until the target date.
     * Updates days, hours, minutes, seconds, and expired state.
     */
    const calculateTimeRemaining = () => {
      const targetDate = new Date(content.targetDate).getTime();
      const currentDate = new Date().getTime();
      const difference = targetDate - currentDate;

      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeRemaining({
          days,
          hours,
          minutes,
          seconds,
          isExpired: false,
        });
      }
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(timer);
  }, [content.targetDate]);

  /**
   * Renders a single time unit block (days, hours, minutes, or seconds).
   * @param value - The numeric value to display
   * @param label - The label text (e.g., "Days", "Hours")
   */
  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-primary-500 text-white rounded-lg p-4 min-w-20">
        <div className="text-2xl font-bold text-center">{String(value).padStart(2, '0')}</div>
      </div>
      {content.showLabels && (
        <div className="text-xs font-semibold mt-2 opacity-70 text-center">{label}</div>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        'flex flex-col h-full p-6 justify-center',
        isEditing && 'ring-2 ring-primary-500/20'
      )}
      style={style}
      onClick={onClick}
    >
      {/* Title */}
      <h3 className="font-bold text-xl text-center mb-6">{content.title}</h3>

      {timeRemaining.isExpired ? (
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <p className="text-lg font-semibold">{content.message || "Time's up!"}</p>
        </div>
      ) : (
        <>
          {/* Countdown Timer */}
          <div className="flex justify-center gap-2 md:gap-4 mb-6">
            <TimeBlock value={timeRemaining.days} label="Days" />
            <TimeBlock value={timeRemaining.hours} label="Hours" />
            <TimeBlock value={timeRemaining.minutes} label="Minutes" />
            <TimeBlock value={timeRemaining.seconds} label="Seconds" />
          </div>

          {/* Message */}
          {content.message && (
            <p className="text-center text-sm opacity-70 mt-4">{content.message}</p>
          )}
        </>
      )}
    </div>
  );
}
