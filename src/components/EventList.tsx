import { useMemo } from 'react';
import { useEvents } from '../context/EventContext';
import { EventCard } from './EventCard';
import { parseISOToZonedDateTime } from '../utils/temporal';
import { Temporal } from '@js-temporal/polyfill';

export function EventList() {
  const { state } = useEvents();

  const sortedEvents = useMemo(() => {
    return [...state.events].sort((a, b) => {
      const aZdt = parseISOToZonedDateTime(a.startTime, a.timezone);
      const bZdt = parseISOToZonedDateTime(b.startTime, b.timezone);
      return Temporal.ZonedDateTime.compare(aZdt, bZdt);
    });
  }, [state.events]);

  if (sortedEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          No events scheduled
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create your first event using the form above
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Scheduled Events
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {sortedEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
