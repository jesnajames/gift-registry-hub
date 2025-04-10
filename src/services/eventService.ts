import { supabase } from '../lib/supabase';
import { Event } from '../types/event';
import { Gift } from '../types/gift';
import { EventRow, GiftRow } from '../lib/supabase'; // Import GiftRow
import { userService } from './userService';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

// Helper function to map GiftRow (DB) to Gift (Frontend) - Moved to giftService, but needed here for mapping within event fetch
const mapGiftRowToGift = (row: GiftRow): Gift => ({
    id: row.id,
    eventId: row.event_id,
    name: row.name,
    description: row.description,
    price: row.price,
    imageUrl: row.image_url,
    url: row.url,
    store: row.store,
    priority: row.priority,
    booked: row.booked,
    bookedBy: row.booked_by,
    dateAdded: row.date_added,
    updatedAt: row.updated_at,
});


// Helper function to map EventRow (DB) to Event (Frontend)
const mapEventRowToEvent = (row: EventRow & { gifts?: GiftRow[] }): Event => ({ // Use GiftRow here
  id: row.id,
  title: row.title,
  description: row.description,
  date: row.date,
  imageUrl: row.image_url,
  eventType: row.event_type,
  shareLink: row.share_link,
  createdBy: row.created_by, // Keep the user ID
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  // Map gifts if they are included in the query
  gifts: row.gifts?.map(mapGiftRowToGift) || [] // Use the mapper
});

export const eventService = {
  async getAllEvents(): Promise<Event[]> {
    console.log("getAllEvents: Fetching events from Supabase..."); // Log start
    const { data: eventRows, error } = await supabase
      .from('events')
      .select(`
        *,
        gifts (*)
      `)
      .order('date', { ascending: true });

    if (error) {
        console.error("getAllEvents: Error fetching events:", error); // Log error
        throw error;
    }
    if (!eventRows) {
        console.log("getAllEvents: No event rows returned from Supabase."); // Log no data
        return [];
    }
    console.log(`getAllEvents: Fetched ${eventRows.length} event rows.`); // Log success count

    // Map DB rows to Frontend Event objects
    const events = eventRows.map(mapEventRowToEvent);

    // Fetch creator user details
    const creatorIds = events.map(event => event.createdBy).filter(id => id);
    if (creatorIds.length > 0) {
        console.log("getAllEvents: Fetching creator profiles for IDs:", creatorIds); // Log profile fetch start
        try {
            const userProfiles = await userService.getUserProfiles(creatorIds);
            console.log("getAllEvents: Fetched creator profiles:", userProfiles); // Log profile fetch success
            events.forEach(event => {
                if (event.createdBy) {
                    event.createdByUser = userProfiles.get(event.createdBy);
                }
            });
        } catch (profileError) {
            console.error("getAllEvents: Error fetching creator profiles:", profileError); // Log profile fetch error
            // Decide if you want to throw or continue without profile data
            // throw profileError; // Option: Stop if profiles fail
        }
    } else {
        console.log("getAllEvents: No creator IDs to fetch profiles for.");
    }

    // Fetch bookedBy user details for gifts within each event
    const bookedByIds = events.flatMap(event => event.gifts.map(gift => gift.bookedBy).filter(id => id));
    if (bookedByIds.length > 0) {
        const uniqueBookedByIds = [...new Set(bookedByIds as string[])]; // Ensure unique IDs
        console.log("getAllEvents: Fetching bookedBy profiles for IDs:", uniqueBookedByIds); // Log bookedBy fetch start
        try {
            const bookedByProfiles = await userService.getUserProfiles(uniqueBookedByIds);
            console.log("getAllEvents: Fetched bookedBy profiles:", bookedByProfiles); // Log bookedBy fetch success
             events.forEach(event => {
                event.gifts.forEach(gift => {
                    if (gift.bookedBy) {
                        gift.bookedByUser = bookedByProfiles.get(gift.bookedBy);
                    }
                });
            });
        } catch (bookedByError) {
            console.error("getAllEvents: Error fetching bookedBy profiles:", bookedByError); // Log bookedBy fetch error
             // Decide if you want to throw or continue without profile data
             // throw bookedByError; // Option: Stop if profiles fail
        }
    } else {
        console.log("getAllEvents: No bookedBy IDs to fetch profiles for.");
    }

    console.log("getAllEvents: Finished processing events."); // Log completion
    return events;
  },

  async getEventById(eventId: string): Promise<Event | null> {
     console.log(`getEventById: Fetching event ${eventId}...`); // Log start
     const { data: eventRow, error } = await supabase
      .from('events')
      .select(`
        *,
        gifts (*)
      `)
      .eq('id', eventId)
      .single<EventRow & { gifts?: GiftRow[] }>(); // Expect a single row, use GiftRow

    if (error) {
        if (error.code === 'PGRST116') {
            console.log(`getEventById: Event ${eventId} not found.`); // Log not found
            return null;
        }
        console.error(`getEventById: Error fetching event ${eventId}:`, error); // Log error
        throw error;
    }
    if (!eventRow) {
        console.log(`getEventById: No data returned for event ${eventId}.`); // Log no data
        return null;
    }
    console.log(`getEventById: Fetched event ${eventId}.`); // Log success

    const event = mapEventRowToEvent(eventRow);

    // Fetch creator details
    if (event.createdBy) {
        console.log(`getEventById: Fetching creator profile for event ${eventId}, user ${event.createdBy}`); // Log profile fetch start
        try {
            event.createdByUser = await userService.getUserProfile(event.createdBy);
            console.log(`getEventById: Fetched creator profile for event ${eventId}.`); // Log profile fetch success
        } catch (profileError) {
            console.error(`getEventById: Error fetching creator profile for event ${eventId}:`, profileError); // Log profile fetch error
        }
    }

    // Fetch bookedBy user details for gifts
    const bookedByIds = event.gifts.map(gift => gift.bookedBy).filter(id => id);
     if (bookedByIds.length > 0) {
        const uniqueBookedByIds = [...new Set(bookedByIds as string[])];
        console.log(`getEventById: Fetching bookedBy profiles for event ${eventId}, IDs:`, uniqueBookedByIds); // Log bookedBy fetch start
        try {
            const bookedByProfiles = await userService.getUserProfiles(uniqueBookedByIds);
            console.log(`getEventById: Fetched bookedBy profiles for event ${eventId}.`); // Log bookedBy fetch success
             event.gifts.forEach(gift => {
                if (gift.bookedBy) {
                    gift.bookedByUser = bookedByProfiles.get(gift.bookedBy);
                }
            });
        } catch (bookedByError) {
            console.error(`getEventById: Error fetching bookedBy profiles for event ${eventId}:`, bookedByError); // Log bookedBy fetch error
        }
    }

    console.log(`getEventById: Finished processing event ${eventId}.`); // Log completion
    return event;
  },


  async createEvent(eventData: Omit<Event, 'id' | 'gifts' | 'createdBy' | 'createdAt' | 'updatedAt' | 'createdByUser'>): Promise<Event> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be logged in to create an event.");

    const newEventId = uuidv4(); // Generate UUID for the new event
    console.log(`createEvent: Creating event with ID ${newEventId} for user ${user.id}`); // Log creation start

    const { data, error } = await supabase
      .from('events')
      .insert({
        id: newEventId, // Provide the generated UUID
        title: eventData.title,
        description: eventData.description,
        date: eventData.date, // Ensure date is in correct ISO format if needed
        image_url: eventData.imageUrl,
        event_type: eventData.eventType,
        share_link: eventData.shareLink || `/registry/${newEventId}`, // Generate a default share link
        created_by: user.id // Set the creator ID
      })
      .select()
      .single<EventRow>();

    if (error) {
        console.error("createEvent: Error creating event:", error); // Log error
        // Handle specific errors like duplicate key if 'id' wasn't unique (unlikely with uuid)
        if (error.code === '23505') {
             throw new Error("An event with this identifier already exists.");
        }
        throw error;
    }
    if (!data) throw new Error("Failed to create event, no data returned.");

    console.log(`createEvent: Successfully created event ${newEventId}. Fetching creator profile...`); // Log success
    const createdEvent = mapEventRowToEvent(data);
    try {
        createdEvent.createdByUser = await userService.getUserProfile(user.id); // Fetch creator profile
        console.log(`createEvent: Fetched creator profile for new event ${newEventId}.`); // Log profile fetch success
    } catch (profileError) {
        console.error(`createEvent: Error fetching creator profile for new event ${newEventId}:`, profileError); // Log profile fetch error
    }

    return createdEvent;
  },

  async updateEvent(eventId: string, eventData: Partial<Omit<Event, 'id' | 'gifts' | 'createdBy' | 'createdAt' | 'updatedAt' | 'createdByUser'>>): Promise<Event> {
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) throw new Error("User must be logged in to update an event.");
     console.log(`updateEvent: Updating event ${eventId} by user ${user.id}`); // Log update start

    const { data, error } = await supabase
      .from('events')
      .update({
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        image_url: eventData.imageUrl,
        event_type: eventData.eventType,
        share_link: eventData.shareLink,
        updated_at: new Date().toISOString() // Manually set updated_at or use DB trigger
      })
      .eq('id', eventId)
      // RLS handles the created_by check
      .select(`
        *,
        gifts (*)
      `)
      .single<EventRow & { gifts?: GiftRow[] }>(); // Use GiftRow

    if (error) {
        console.error(`updateEvent: Error updating event ${eventId}:`, error); // Log error
        throw error;
    }
     if (!data) throw new Error("Failed to update event, no data returned or you might not have permission.");

    console.log(`updateEvent: Successfully updated event ${eventId}. Processing details...`); // Log success
    const updatedEvent = mapEventRowToEvent(data);

    // Re-fetch user/gift details as they might be needed
    if (updatedEvent.createdBy) {
        try {
            updatedEvent.createdByUser = await userService.getUserProfile(updatedEvent.createdBy);
        } catch (profileError) {
            console.error(`updateEvent: Error fetching creator profile for updated event ${eventId}:`, profileError);
        }
    }
    const bookedByIds = updatedEvent.gifts.map(gift => gift.bookedBy).filter(id => id);
     if (bookedByIds.length > 0) {
        const uniqueBookedByIds = [...new Set(bookedByIds as string[])];
        try {
            const bookedByProfiles = await userService.getUserProfiles(uniqueBookedByIds);
             updatedEvent.gifts.forEach(gift => {
                if (gift.bookedBy) {
                    gift.bookedByUser = bookedByProfiles.get(gift.bookedBy);
                }
            });
        } catch (bookedByError) {
             console.error(`updateEvent: Error fetching bookedBy profiles for updated event ${eventId}:`, bookedByError);
        }
    }

    console.log(`updateEvent: Finished processing updated event ${eventId}.`); // Log completion
    return updatedEvent;
  },

  async deleteEvent(eventId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be logged in to delete an event.");
    console.log(`deleteEvent: Deleting event ${eventId} by user ${user.id}`); // Log delete start

    // Rely on CASCADE DELETE constraint in the database for deleting associated gifts.
    const { error: eventError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
      // RLS handles the created_by check

    if (eventError) {
        console.error(`deleteEvent: Error deleting event ${eventId}:`, eventError); // Log error
        throw eventError;
    }
    console.log(`deleteEvent: Successfully deleted event ${eventId}.`); // Log success
  }
};
