import { useState, type FormEvent } from 'react';
import { useEvents } from '../context/EventContext';
import { TimezonePicker } from './TimezonePicker';
import {
  createZonedDateTime,
  getLocalTimezone,
  generateId,
  toDateTimeLocalString,
  now,
  Temporal,
} from '../utils/temporal';
import type { ScheduledEvent } from '../types/event';

interface EventFormProps {
  onClose?: () => void;
  editEvent?: ScheduledEvent;
}

export function EventForm({ onClose, editEvent }: EventFormProps) {
  const { addEvent, updateEvent } = useEvents();
  const isEditing = !!editEvent;

  const [title, setTitle] = useState(editEvent?.title || '');
  const [description, setDescription] = useState(editEvent?.description || '');
  const [dateTime, setDateTime] = useState(() => {
    if (editEvent) {
      // Parse the stored ZonedDateTime string directly to avoid double-offsetting
      const zdt = Temporal.ZonedDateTime.from(editEvent.startTime);
      return toDateTimeLocalString(zdt);
    }
    // Default to 1 hour from now
    const defaultTime = now().add({ hours: 1 });
    return toDateTimeLocalString(defaultTime);
  });
  const [timezone, setTimezone] = useState(
    editEvent?.timezone || getLocalTimezone()
  );
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter an event title');
      return;
    }

    if (!dateTime) {
      setError('Please select a date and time');
      return;
    }

    try {
      const zonedDateTime = createZonedDateTime(dateTime, timezone);

      const event: ScheduledEvent = {
        id: editEvent?.id || generateId(),
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: zonedDateTime.toString(),
        timezone,
        createdAt: editEvent?.createdAt || new Date().toISOString(),
      };

      if (isEditing) {
        updateEvent(event);
      } else {
        addEvent(event);
      }

      // Reset form
      if (!isEditing) {
        setTitle('');
        setDescription('');
        const defaultTime = now().add({ hours: 1 });
        setDateTime(toDateTimeLocalString(defaultTime));
      }

      onClose?.();
    } catch (err) {
      setError('Invalid date/time format');
      console.error('Error creating event:', err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {isEditing ? 'Edit Event' : 'Schedule New Event'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Event Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Meeting with team"
            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details about the event..."
            rows={2}
            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="datetime"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Date & Time *
            </label>
            <input
              type="datetime-local"
              id="datetime"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          <TimezonePicker
            value={timezone}
            onChange={setTimezone}
            label="Timezone *"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          {isEditing ? 'Update Event' : 'Schedule Event'}
        </button>
      </div>
    </form>
  );
}
