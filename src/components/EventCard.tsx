import { useState } from 'react';
import type { ScheduledEvent } from '../types/event';
import { useEvents } from '../context/EventContext';
import {
  parseISOToZonedDateTime,
  formatDateTime,
  convertTimezone,
  getRelativeTime,
  isPast,
  getTimezoneOffset,
} from '../utils/temporal';
import { EventForm } from './EventForm';

interface EventCardProps {
  event: ScheduledEvent;
}

export function EventCard({ event }: EventCardProps) {
  const { state, deleteEvent } = useEvents();
  const [showInOriginalTz, setShowInOriginalTz] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const originalZdt = parseISOToZonedDateTime(event.startTime, event.timezone);
  const viewZdt = convertTimezone(originalZdt, state.viewTimezone);

  const displayZdt = showInOriginalTz ? originalZdt : viewZdt;
  const eventIsPast = isPast(originalZdt);

  const handleDelete = () => {
    deleteEvent(event.id);
    setShowDeleteConfirm(false);
  };

  if (isEditing) {
    return (
      <EventForm editEvent={event} onClose={() => setIsEditing(false)} />
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-opacity ${
        eventIsPast ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {event.title}
            </h3>
            {eventIsPast && (
              <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                Past
              </span>
            )}
          </div>

          {event.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Edit event"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          {showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                className="px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Delete event"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDateTime(displayZdt, { includeTimezone: false })}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {displayZdt.timeZoneId} ({getTimezoneOffset(displayZdt.timeZoneId)})
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400">
                {getRelativeTime(originalZdt)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowInOriginalTz(!showInOriginalTz)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            {showInOriginalTz ? 'Show in view timezone' : 'Show original'}
          </button>
        </div>

        {!showInOriginalTz && event.timezone !== state.viewTimezone && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <span className="font-medium">Originally scheduled:</span>{' '}
              {formatDateTime(originalZdt)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
