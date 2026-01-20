import { useEffect, useState } from 'react';
import { useEvents } from '../context/EventContext';
import { now, formatDateTime, getTimezoneOffset } from '../utils/temporal';
import { TimezonePicker } from './TimezonePicker';

export function Header() {
  const { state, setViewTimezone } = useEvents();
  const [currentTime, setCurrentTime] = useState(() =>
    now(state.viewTimezone)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(now(state.viewTimezone));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.viewTimezone]);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Timezone Scheduler
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Schedule events across any timezone with the Temporal API
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-lg font-mono text-gray-900 dark:text-white">
                {formatDateTime(currentTime, {
                  includeTimezone: false,
                })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {state.viewTimezone} ({getTimezoneOffset(state.viewTimezone)})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 dark:text-gray-400">
                View in:
              </label>
              <TimezonePicker
                value={state.viewTimezone}
                onChange={setViewTimezone}
                compact
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
