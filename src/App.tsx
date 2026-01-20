import { EventsProvider } from './context/EventContext';
import { Header } from './components/Header';
import { EventForm } from './components/EventForm';
import { EventList } from './components/EventList';

function App() {
  return (
    <EventsProvider>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
          <div className="space-y-8">
            <EventForm />
            <EventList />
          </div>
        </main>

        <footer className="border-t border-gray-200 dark:border-gray-700 py-4">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Built with{' '}
              <a
                href="https://tc39.es/proposal-temporal/docs/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Temporal API
              </a>{' '}
              &middot; Day 01 of 50 Days, 50 Projects
            </p>
          </div>
        </footer>
      </div>
    </EventsProvider>
  );
}

export default App;
