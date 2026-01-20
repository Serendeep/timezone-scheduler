import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  ScheduledEvent,
  EventsState,
  EventAction,
} from '../types/event';
import { getLocalTimezone } from '../utils/temporal';

const STORAGE_KEY = 'timezone-scheduler-events';

const initialState: EventsState = {
  events: [],
  viewTimezone: getLocalTimezone(),
};

function eventsReducer(state: EventsState, action: EventAction): EventsState {
  switch (action.type) {
    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload],
      };

    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        ),
      };

    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
      };

    case 'SET_VIEW_TIMEZONE':
      return {
        ...state,
        viewTimezone: action.payload,
      };

    case 'LOAD_EVENTS':
      return {
        ...state,
        events: action.payload,
      };

    default:
      return state;
  }
}

// Validate event structure to prevent corrupted data crashes
function validateEvent(event: unknown): event is ScheduledEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    typeof (event as ScheduledEvent).id === 'string' &&
    typeof (event as ScheduledEvent).title === 'string' &&
    typeof (event as ScheduledEvent).startTime === 'string' &&
    typeof (event as ScheduledEvent).timezone === 'string'
  );
}

interface EventsContextValue {
  state: EventsState;
  addEvent: (event: ScheduledEvent) => void;
  updateEvent: (event: ScheduledEvent) => void;
  deleteEvent: (id: string) => void;
  setViewTimezone: (timezone: string) => void;
}

const EventsContext = createContext<EventsContextValue | null>(null);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(eventsReducer, initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load events from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as unknown[];
        const events = parsed.filter(validateEvent);
        dispatch({ type: 'LOAD_EVENTS', payload: events });
      }
    } catch (error) {
      console.error('Failed to load events from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save events to localStorage whenever they change (after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
    } catch (error) {
      console.error('Failed to save events to localStorage:', error);
    }
  }, [state.events, isLoaded]);

  const addEvent = useCallback((event: ScheduledEvent) => {
    dispatch({ type: 'ADD_EVENT', payload: event });
  }, []);

  const updateEvent = useCallback((event: ScheduledEvent) => {
    dispatch({ type: 'UPDATE_EVENT', payload: event });
  }, []);

  const deleteEvent = useCallback((id: string) => {
    dispatch({ type: 'DELETE_EVENT', payload: id });
  }, []);

  const setViewTimezone = useCallback((timezone: string) => {
    dispatch({ type: 'SET_VIEW_TIMEZONE', payload: timezone });
  }, []);

  const contextValue = useMemo(
    () => ({
      state,
      addEvent,
      updateEvent,
      deleteEvent,
      setViewTimezone,
    }),
    [state, addEvent, updateEvent, deleteEvent, setViewTimezone]
  );

  return (
    <EventsContext.Provider value={contextValue}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
