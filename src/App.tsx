import { useState, useEffect } from 'react';
import {Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar';
import EventCard from './components/EventCard';
import RegistryList from './components/RegistryList';
import EventForm from './components/EventForm';
import GiftForm from './components/GiftForm';
import { Event } from './types/event';
import { Gift } from './types/gift';
import { User } from './types/user';
import { eventService } from './services/eventService';
import { giftService } from './services/giftService';
import { userService } from './services/userService'; // Import userService
import { supabase } from './lib/supabase';
import {ProfilePage} from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';

import { AuthChangeEvent, Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showGiftForm, setShowGiftForm] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // --- Authentication Effect ---
  useEffect(() => {
    console.log("Auth useEffect setup running...");
    let isMounted = true; // Flag to handle async operations after unmount

    const fetchUserProfile = async (userId: string) => {
      if (!isMounted) return;
      try {
        const profile = await userService.getUserProfile(userId);
        if (isMounted) setCurrentUser(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (isMounted) setCurrentUser(null); // Reset profile on error
      }
    };

    // Set up the listener immediately
    console.log("Setting up auth state change listener...");
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        // Check if the component is still mounted before updating state
        if (!isMounted) {
            console.log("Auth state change ignored: component unmounted.");
            return;
        }
        console.log("Auth state changed event received:", event, session);

        // Update session state
        setSession(session);

        // Update user profile based on session change
        if (session?.user) {
          // Fetch profile only if user ID is different from current
          // Use functional update for setCurrentUser to avoid stale closure issues
           setCurrentUser(currentUser => {
            if (currentUser?.id !== session.user.id) {
              fetchUserProfile(session.user.id);
              // Return null temporarily or previous user while fetching?
              // Returning null might cause UI flicker, decide based on desired UX
              return null; // Or return currentUser if flicker is bad
            }
            return currentUser; // Keep current profile if user ID is the same
          });
        } else {
          setCurrentUser(null); // Clear profile if session is null
        }
      }
    );

    // Get the initial session state AFTER setting up the listener
    console.log("Getting initial session...");
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      console.log("Initial session check completed:", session);
      setSession(session);
      if (session?.user) {
        // Check if profile needs fetching (might have been set by listener already)
        setCurrentUser(currentUser => {
            if (!currentUser || currentUser.id !== session.user.id) {
                 fetchUserProfile(session.user.id);
                 return null; // Set to null while fetching
            }
            return currentUser; // Already have the correct profile
        });
      } else {
        setCurrentUser(null);
      }
      // Fetch events after initial auth state is determined
      fetchEvents();
    }).catch(error => {
        console.error("Error getting initial session:", error);
        if (isMounted) setError("Failed to initialize session.");
        // Still attempt to fetch events, might work for public data
        fetchEvents();
    });

    // Cleanup function
    return () => {
      isMounted = false;
      console.log("Auth useEffect cleanup: Unsubscribing auth listener...");
      // Ensure the listener and subscription exist before trying to unsubscribe
      if (authListener?.subscription) {
          authListener.subscription.unsubscribe();
      } else {
          console.warn("Auth listener or subscription not found during cleanup.");
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount/unmount


  // --- Data Fetching Effect ---
  const fetchEvents = async () => {
    // Prevent fetching if already loading
    if (loading && events.length > 0) {
        console.log("fetchEvents: Already loading, skipping fetch.");
        return;
    }
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      console.log("fetchEvents: Starting fetch..."); // Log start
      const fetchedEvents = await eventService.getAllEvents();
      console.log("fetchEvents: Received events", fetchedEvents); // Log received data
      setEvents(fetchedEvents);
    } catch (err: any) {
      const errorMessage = `Failed to load events: ${err.message || 'Unknown error'}`;
      setError(errorMessage);
      console.error("fetchEvents: Error caught -", err); // Log error
    } finally {
      console.log("fetchEvents: Setting loading to false."); // Log finally block
      setLoading(false);
    }
  };

   // Refetch data for the currently selected event
   const refetchSelectedEvent = async () => {
        if (!selectedEvent) return;
        console.log(`refetchSelectedEvent: Refetching event ${selectedEvent.id}`); // Log start
        try {
            const updatedEvent = await eventService.getEventById(selectedEvent.id);
             if (updatedEvent) {
                console.log(`refetchSelectedEvent: Successfully refetched event ${selectedEvent.id}`); // Log success
                setSelectedEvent(updatedEvent); // Update the selected event state
                 // Also update the event in the main events list
                setEvents(prevEvents => prevEvents.map(e => e.id === updatedEvent?.id ? updatedEvent : e));
             } else {
                 // Handle case where the event might have been deleted by another user
                 console.warn(`refetchSelectedEvent: Event ${selectedEvent.id} not found during refetch.`); // Log warning
                 setError("The selected event could not be found.");
                 handleBackToEvents();
             }

        } catch (err: any) {
             console.error(`refetchSelectedEvent: Error refetching event ${selectedEvent.id}:`, err); // Log error
             setError(`Error updating event view: ${err.message}`);
        }
    };


  // --- Event Handlers ---
  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsGuest(false); // Default to owner view when selecting from main list
  };

  const handleBackToEvents = () => {
    setSelectedEvent(null);
    setIsGuest(false);
    setError(null); // Clear errors when going back
  };

  const handleGuestView = (event: Event) => {
    setSelectedEvent(event);
    setIsGuest(true);
  };

  // --- CRUD Operations ---

  // Event CRUD
  const handleCreateEvent = async (eventData: Omit<Event, 'id' | 'gifts' | 'createdBy' | 'createdAt' | 'updatedAt' | 'createdByUser'>) => {
    if (!currentUser) {
        setFormError("You must be logged in to create an event.");
        return;
    }
    setFormLoading(true);
    setFormError(null);
    try {
      const newEvent = await eventService.createEvent(eventData);
      setEvents(prev => [...prev, newEvent]); // Add to list
      setShowEventForm(false);
      setEditingEvent(null);
      handleSelectEvent(newEvent); // Navigate to the newly created event
    } catch (err: any) {
      setFormError(`Failed to create event: ${err.message}`);
      console.error(err);
    } finally {
        setFormLoading(false);
    }
  };

  const handleUpdateEvent = async (eventData: Omit<Event, 'id' | 'gifts' | 'createdBy' | 'createdAt' | 'updatedAt' | 'createdByUser'>) => {
     if (!editingEvent) return;
     setFormLoading(true);
     setFormError(null);
     try {
        const updatedEvent = await eventService.updateEvent(editingEvent.id, eventData);
        setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
        setSelectedEvent(updatedEvent); // Update selected event view
        setShowEventForm(false);
        setEditingEvent(null);
     } catch (err: any) {
        setFormError(`Failed to update event: ${err.message}`);
        console.error(err);
     } finally {
        setFormLoading(false);
     }
  };

 const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event and all its gifts? This cannot be undone.")) {
        return;
    }
    setLoading(true); // Use main loading indicator
    setError(null);
    try {
        await eventService.deleteEvent(eventId);
        setEvents(prev => prev.filter(e => e.id !== eventId));
        if (selectedEvent?.id === eventId) {
            handleBackToEvents(); // Go back if the deleted event was selected
        }
    } catch (err: any) {
        setError(`Failed to delete event: ${err.message}`);
        console.error(err);
    } finally {
        setLoading(false);
    }
 };


  // Gift CRUD
 const handleCreateGift = async (giftData: Omit<Gift, 'id' | 'eventId' | 'booked' | 'bookedBy' | 'dateAdded' | 'updatedAt' | 'bookedByUser'>) => {
    if (!selectedEvent || !currentUser) {
         setFormError("Cannot add gift: No event selected or user not logged in.");
         return;
    }
    setFormLoading(true);
    setFormError(null);
    try {
        await giftService.createGift(selectedEvent.id, giftData);
        await refetchSelectedEvent(); // Refetch the event to get the updated gift list
        setShowGiftForm(false);
        setEditingGift(null);
    } catch (err: any) {
        setFormError(`Failed to add gift: ${err.message}`);
        console.error(err);
    } finally {
        setFormLoading(false);
    }
 };

 const handleUpdateGift = async (giftData: Omit<Gift, 'id' | 'eventId' | 'booked' | 'bookedBy' | 'dateAdded' | 'updatedAt' | 'bookedByUser'>) => {
    if (!editingGift || !selectedEvent) return;
    setFormLoading(true);
    setFormError(null);
    try {
        await giftService.updateGift(editingGift.id, giftData);
        await refetchSelectedEvent(); // Refetch the event to get the updated gift list
        setShowGiftForm(false);
        setEditingGift(null);
    } catch (err: any) {
        setFormError(`Failed to update gift: ${err.message}`);
        console.error(err);
    } finally {
        setFormLoading(false);
    }
 };

 const handleDeleteGift = async (giftId: string) => {
     if (!selectedEvent || !window.confirm("Are you sure you want to delete this gift?")) {
        return;
    }
    setError(null); // Clear general errors
    try {
        await giftService.deleteGift(giftId);
        await refetchSelectedEvent(); // Refetch the event to update the gift list
    } catch (err: any) {
        setError(`Failed to delete gift: ${err.message}`); // Show error in main area
        console.error(err);
    }
 };


  // Gift Booking
  const handleBookGift = async (eventId: string, giftId: string) => {
    if (!currentUser) {
      setError('Please sign in to book a gift.');
      // Optionally trigger sign-in modal here
      return;
    }
    setError(null); // Clear previous errors

    try {
      await giftService.bookGift(giftId);
      await refetchSelectedEvent(); // Refetch to ensure consistency

    } catch (err: any) {
      setError(`Failed to book gift: ${err.message}`);
      console.error(err);
      await refetchSelectedEvent(); // Refetch to revert potential optimistic updates if they were added
    }
  };

  const handleUnbookGift = async (eventId: string, giftId: string) => {
     if (!currentUser) {
      setError('Please sign in to unbook a gift.');
      return;
    }
    setError(null);

    try {
        await giftService.unbookGift(giftId);
        await refetchSelectedEvent(); // Ensure consistency

    } catch (err: any) {
        setError(`Failed to unbook gift: ${err.message}`);
        console.error(err);
        await refetchSelectedEvent(); // Refetch to revert potential optimistic updates
    }
  };


  // --- Render Logic ---
  const renderContent = () => {
    // Use loading state combined with whether events have been fetched at least once
    if (loading && events.length === 0) {
      return <div className="text-center py-10">Loading events...</div>;
    }

    // Show error only if loading is finished and still no events
    if (!loading && error && events.length === 0) {
      return <div className="text-center py-10 text-red-600">Error: {error} <button onClick={fetchEvents} className="ml-2 btn-primary">Retry</button></div>;
    }

    if (!selectedEvent) {
      // Event List View
      return (
        <div className="animate-fade-in">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-gradient">Gift Registry Hub</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create and share your gift registry for any special occasion.
            </p>
             {currentUser && (
                 <button
                    onClick={() => { setEditingEvent(null); setShowEventForm(true); setFormError(null); }}
                    className="mt-6 btn-primary"
                >
                    Create New Registry
                </button>
             )}
             {!currentUser && (
                 <p className="mt-4 text-gray-500">Sign in to create your own registry!</p>
             )}
          </div>

          {/* Display non-critical errors even if some events loaded */}
          {error && <div className="mb-4 text-center text-red-600">{error}</div>}

          {events.length === 0 && !loading && !error && ( // Show only if loading finished, no errors, and no events
            <div className="text-center py-10 text-gray-500">No events found. Create one to get started!</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onSelect={handleSelectEvent}
                onGuestView={handleGuestView}
                onEdit={currentUser?.id === event.createdBy ? () => { setEditingEvent(event); setShowEventForm(true); setFormError(null); } : undefined}
                onDelete={currentUser?.id === event.createdBy ? () => handleDeleteEvent(event.id) : undefined}
                currentUser={currentUser}
              />
            ))}
          </div>
        </div>
      );
    } else {
      // Single Event (Registry List) View
      return (
        <div className="animate-fade-in">
          <button
            onClick={handleBackToEvents}
            className="flex items-center text-primary mb-6 hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Events
          </button>

           {/* Display non-critical errors */}
           {error && <div className="mb-4 text-center text-red-600">{error}</div>}

          <RegistryList
            event={selectedEvent}
            isGuest={isGuest || currentUser?.id !== selectedEvent.createdBy}
            currentUser={currentUser} // Pass current user to RegistryList
            onBookGift={handleBookGift}
            onUnbookGift={handleUnbookGift}
            onAddGift={currentUser?.id === selectedEvent.createdBy ? () => { setEditingGift(null); setShowGiftForm(true); setFormError(null); } : undefined}
            onEditGift={currentUser?.id === selectedEvent.createdBy ? (gift: Gift) => { setEditingGift(gift); setShowGiftForm(true); setFormError(null); } : undefined}
            onDeleteGift={currentUser?.id === selectedEvent.createdBy ? handleDeleteGift : undefined}
          />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentUser={currentUser}
      />
      <Routes>
      <Route path="/profile" element={<ProfilePage currentUser={currentUser}/>} />
      <Route path="/auth" element={<AuthPage />} />
      </Routes>

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          initialEvent={editingEvent}
          onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
          onCancel={() => { setShowEventForm(false); setEditingEvent(null); setFormError(null); }}
          isLoading={formLoading}
        />
      )}

      {/* Gift Form Modal */}
      {showGiftForm && selectedEvent && (
        <GiftForm
          initialGift={editingGift}
          eventId={selectedEvent.id}
          onSubmit={editingGift ? handleUpdateGift : handleCreateGift}
          onCancel={() => { setShowGiftForm(false); setEditingGift(null); setFormError(null); }}
          isLoading={formLoading}
        />
      )}

      {/* Footer can be added back here if desired */}
       <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-gradient">Gift Registry Hub</h3>
              <p className="text-gray-500 mt-1">Make your special occasions even more memorable</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">About</a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">Terms</a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Gift Registry Hub. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
