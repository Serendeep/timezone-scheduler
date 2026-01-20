import { Temporal } from '@js-temporal/polyfill';

/**
 * Get the user's local timezone using the Temporal API
 */
export function getLocalTimezone(): string {
  return Temporal.Now.timeZoneId();
}

/**
 * Get all available IANA timezones, sorted alphabetically
 * Returns a curated list of commonly used timezones
 */
export function getAllTimezones(): string[] {
  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'America/Toronto',
    'America/Vancouver',
    'America/Mexico_City',
    'America/Sao_Paulo',
    'America/Buenos_Aires',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Madrid',
    'Europe/Rome',
    'Europe/Amsterdam',
    'Europe/Moscow',
    'Europe/Istanbul',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Bangkok',
    'Asia/Singapore',
    'Asia/Hong_Kong',
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Australia/Perth',
    'Pacific/Auckland',
    'Pacific/Honolulu',
  ];
  return timezones.sort();
}

/**
 * Create a ZonedDateTime from date string, time string, and timezone
 */
export function createZonedDateTime(
  dateTimeLocal: string,
  timezone: string
): Temporal.ZonedDateTime {
  const plainDateTime = Temporal.PlainDateTime.from(dateTimeLocal);
  return plainDateTime.toZonedDateTime(timezone);
}

/**
 * Convert a ZonedDateTime to a different timezone
 */
export function convertTimezone(
  zonedDateTime: Temporal.ZonedDateTime,
  targetTimezone: string
): Temporal.ZonedDateTime {
  return zonedDateTime.withTimeZone(targetTimezone);
}

/**
 * Parse an ISO string to a ZonedDateTime
 */
export function parseISOToZonedDateTime(
  isoString: string,
  timezone: string
): Temporal.ZonedDateTime {
  const instant = Temporal.Instant.from(isoString);
  return instant.toZonedDateTimeISO(timezone);
}

/**
 * Format a ZonedDateTime for display
 */
export function formatDateTime(
  zonedDateTime: Temporal.ZonedDateTime,
  options?: {
    includeTimezone?: boolean;
    includeDate?: boolean;
    includeTime?: boolean;
  }
): string {
  const {
    includeTimezone = true,
    includeDate = true,
    includeTime = true,
  } = options || {};

  const parts: string[] = [];

  if (includeDate) {
    const date = zonedDateTime.toPlainDate();
    parts.push(
      date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    );
  }

  if (includeTime) {
    const time = zonedDateTime.toPlainTime();
    parts.push(
      time.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    );
  }

  if (includeTimezone) {
    parts.push(`(${zonedDateTime.timeZoneId})`);
  }

  return parts.join(' ');
}

/**
 * Format a ZonedDateTime for datetime-local input
 */
export function toDateTimeLocalString(
  zonedDateTime: Temporal.ZonedDateTime
): string {
  const year = zonedDateTime.year;
  const month = String(zonedDateTime.month).padStart(2, '0');
  const day = String(zonedDateTime.day).padStart(2, '0');
  const hour = String(zonedDateTime.hour).padStart(2, '0');
  const minute = String(zonedDateTime.minute).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Get current time as ZonedDateTime
 */
export function now(timezone?: string): Temporal.ZonedDateTime {
  return Temporal.Now.zonedDateTimeISO(timezone || getLocalTimezone());
}

/**
 * Check if an event time is in the past
 */
export function isPast(zonedDateTime: Temporal.ZonedDateTime): boolean {
  const currentTime = now();
  return Temporal.ZonedDateTime.compare(zonedDateTime, currentTime) < 0;
}

/**
 * Get relative time description (e.g., "in 2 hours", "3 days ago")
 */
export function getRelativeTime(zonedDateTime: Temporal.ZonedDateTime): string {
  const currentTime = now();
  // Use single time source for consistency
  const isPastTime = Temporal.ZonedDateTime.compare(zonedDateTime, currentTime) < 0;
  const duration = zonedDateTime.since(currentTime, {
    largestUnit: 'days',
  });

  const totalMinutes = Math.abs(
    duration.days * 24 * 60 +
      duration.hours * 60 +
      duration.minutes
  );

  const suffix = isPastTime ? 'ago' : 'from now';

  if (Math.abs(duration.days) >= 1) {
    const days = Math.abs(duration.days);
    return `${days} day${days !== 1 ? 's' : ''} ${suffix}`;
  }

  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''} ${suffix}`;
  }

  if (totalMinutes >= 1) {
    return `${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''} ${suffix}`;
  }

  return 'now';
}

/**
 * Get timezone offset string (e.g., "UTC-5", "UTC+5:30")
 * Properly handles non-integer hour offsets like Asia/Kolkata
 */
export function getTimezoneOffset(timezone: string): string {
  const zdt = now(timezone);
  const offsetNanoseconds = zdt.offsetNanoseconds;
  const totalMinutes = offsetNanoseconds / (1000 * 1000 * 1000 * 60);
  const hours = Math.trunc(totalMinutes / 60);
  const minutes = Math.abs(totalMinutes % 60);
  const sign = totalMinutes >= 0 ? '+' : '';

  if (minutes === 0) {
    return `UTC${sign}${hours}`;
  }
  return `UTC${sign}${hours}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Generate a unique ID for events using crypto.randomUUID
 */
export function generateId(): string {
  return `evt_${crypto.randomUUID()}`;
}

// Re-export Temporal for components that need direct access
export { Temporal };
