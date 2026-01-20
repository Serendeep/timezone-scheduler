export interface ScheduledEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO 8601 format with timezone offset
  endTime?: string; // ISO 8601 format with timezone offset
  timezone: string; // IANA timezone identifier (e.g., 'America/New_York')
  createdAt: string;
}

export type EventFormData = Omit<ScheduledEvent, 'id' | 'createdAt'>;

export interface EventsState {
  events: ScheduledEvent[];
  viewTimezone: string;
}

export type EventAction =
  | { type: 'ADD_EVENT'; payload: ScheduledEvent }
  | { type: 'UPDATE_EVENT'; payload: ScheduledEvent }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_VIEW_TIMEZONE'; payload: string }
  | { type: 'LOAD_EVENTS'; payload: ScheduledEvent[] };
