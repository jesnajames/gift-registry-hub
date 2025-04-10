import { supabase } from '../lib/supabase';
import { Gift } from '../types/gift';
import { GiftRow } from '../lib/supabase';
import { userService } from './userService';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

// Helper function to map GiftRow (DB) to Gift (Frontend)
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


export const giftService = {
  async getGiftsByEventId(eventId: string): Promise<Gift[]> {
    const { data: giftRows, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('event_id', eventId)
      .order('date_added', { ascending: false });

    if (error) {
        console.error(`Error fetching gifts for event ${eventId}:`, error);
        throw error;
    }
    if (!giftRows) return [];

    const gifts = giftRows.map(mapGiftRowToGift);

    // Fetch bookedBy user details
    const bookedByIds = gifts.map(gift => gift.bookedBy).filter(id => id);
     if (bookedByIds.length > 0) {
        const bookedByProfiles = await userService.getUserProfiles(bookedByIds as string[]);
         gifts.forEach(gift => {
            if (gift.bookedBy) {
                gift.bookedByUser = bookedByProfiles.get(gift.bookedBy);
            }
        });
    }

    return gifts;
  },

  async createGift(eventId: string, giftData: Omit<Gift, 'id' | 'eventId' | 'booked' | 'bookedBy' | 'dateAdded' | 'updatedAt' | 'bookedByUser'>): Promise<Gift> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be logged in to add a gift.");
    // RLS Policy "Allow insert for event creators" should handle the ownership check

    const newGiftId = uuidv4(); // Generate UUID for the new gift

    const { data, error } = await supabase
      .from('gifts')
      .insert({
        id: newGiftId, // Provide the generated UUID
        event_id: eventId,
        name: giftData.name,
        description: giftData.description,
        price: giftData.price,
        image_url: giftData.imageUrl,
        url: giftData.url,
        store: giftData.store,
        priority: giftData.priority,
        booked: false, // Default value
        booked_by: null, // Default value
        // date_added is handled by default value in DB
      })
      .select()
      .single<GiftRow>();

    if (error) {
        console.error("Error creating gift:", error);
         if (error.code === '23503') { // Foreign key violation
             throw new Error(`The specified event (ID: ${eventId}) does not exist or you don't have permission.`);
         }
         if (error.code === '23505') { // Unique constraint violation (likely the generated UUID, though rare)
             throw new Error("A gift with this identifier already exists. Please try again.");
         }
         if (error.message.includes('check constraint violation')) { // RLS or CHECK constraint failure
             throw new Error("Failed to add gift. Please ensure you are the event owner and all fields are valid.");
         }
        throw error;
    }
     if (!data) throw new Error("Failed to create gift, no data returned.");

    return mapGiftRowToGift(data);
  },

   async updateGift(giftId: string, giftData: Partial<Omit<Gift, 'id' | 'eventId' | 'booked' | 'bookedBy' | 'dateAdded' | 'updatedAt' | 'bookedByUser'>>): Promise<Gift> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be logged in to update a gift.");
    // RLS Policy "Allow update for creators and booking" should handle the ownership check for non-booking fields

    const { data, error } = await supabase
      .from('gifts')
      .update({
        name: giftData.name,
        description: giftData.description,
        price: giftData.price,
        image_url: giftData.imageUrl,
        url: giftData.url,
        store: giftData.store,
        priority: giftData.priority,
        updated_at: new Date().toISOString(), // Manually set or use DB trigger
      })
      .eq('id', giftId)
      // RLS policy handles the check: user must be the creator of the associated event
      .select()
      .single<GiftRow>();

    if (error) {
        console.error(`Error updating gift ${giftId}:`, error);
         if (error.message.includes('check constraint violation')) { // RLS or CHECK constraint failure
             throw new Error("Failed to update gift. Please ensure you are the event owner and all fields are valid.");
         }
        throw error;
    }
     if (!data) throw new Error("Failed to update gift, no data returned or you might not have permission.");

    const updatedGift = mapGiftRowToGift(data);

    // Fetch bookedBy user details if it exists (it shouldn't change here, but for consistency)
    if (updatedGift.bookedBy) {
        updatedGift.bookedByUser = await userService.getUserProfile(updatedGift.bookedBy);
    }

    return updatedGift;
  },


  async bookGift(giftId: string): Promise<Gift> {
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) throw new Error("User must be logged in to book a gift.");

    // Check if already booked to prevent race conditions or errors
    const { data: currentGift, error: fetchError } = await supabase
        .from('gifts')
        .select('booked, booked_by')
        .eq('id', giftId)
        .single();

    if (fetchError) {
        console.error(`Error fetching gift ${giftId} before booking:`, fetchError);
        if (fetchError.code === 'PGRST116') throw new Error("Gift not found.");
        throw fetchError;
    }
    if (currentGift?.booked) {
        // If already booked by someone else, throw error
        if (currentGift.booked_by !== user.id) {
             throw new Error("This gift has already been booked by someone else.");
        }
        // If already booked by the current user, just return the current state
        const { data: fullGiftData, error: fullFetchError } = await supabase
            .from('gifts')
            .select('*')
            .eq('id', giftId)
            .single<GiftRow>();
        if (fullFetchError || !fullGiftData) throw fullFetchError || new Error("Failed to fetch gift details.");
        const gift = mapGiftRowToGift(fullGiftData);
        gift.bookedByUser = await userService.getUserProfile(user.id);
        return gift; // Return current state as it's already booked by this user
    }


    // Proceed with booking
    const { data, error } = await supabase
      .from('gifts')
      .update({
        booked: true,
        booked_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', giftId)
      .eq('booked', false) // Add condition to prevent race condition booking
      .select()
      .single<GiftRow>();

    if (error) {
        console.error(`Error booking gift ${giftId}:`, error);
        // Handle potential RLS issues if the policy is too restrictive for booking
         if (error.message.includes('check constraint violation')) {
             throw new Error("Failed to book gift due to permission issue or constraint.");
         }
        throw error;
    }
     // If data is null, it means the gift was likely booked by someone else between the check and the update
     if (!data) throw new Error("Failed to book gift. It might have been booked by someone else just now. Please refresh.");

    const bookedGift = mapGiftRowToGift(data);
    bookedGift.bookedByUser = await userService.getUserProfile(user.id); // Fetch booker profile

    return bookedGift;
  },

  async unbookGift(giftId: string): Promise<Gift> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be logged in to unbook a gift.");

    // Check if the current user is the one who booked it before allowing unbooking
    const { data: currentGift, error: fetchError } = await supabase
        .from('gifts')
        .select('booked_by')
        .eq('id', giftId)
        .single();

     if (fetchError) {
        console.error(`Error fetching gift ${giftId} before unbooking:`, fetchError);
        if (fetchError.code === 'PGRST116') throw new Error("Gift not found.");
        throw fetchError;
    }

    // RLS policy should ideally enforce this, but double-checking is safer
    if (currentGift?.booked_by !== user.id) {
        throw new Error("You can only unbook gifts that you have booked.");
    }


    const { data, error } = await supabase
      .from('gifts')
      .update({
        booked: false,
        booked_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', giftId)
      .eq('booked_by', user.id) // Ensure only the booker can unbook
      .select()
      .single<GiftRow>();

    if (error) {
        console.error(`Error unbooking gift ${giftId}:`, error);
         if (error.message.includes('check constraint violation')) {
             throw new Error("Failed to unbook gift due to permission issue or constraint.");
         }
        throw error;
    }
     if (!data) throw new Error("Failed to unbook gift, no data returned or you might not be the booker.");

    return mapGiftRowToGift(data); // No bookedByUser needed after unbooking
  },

  async deleteGift(giftId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be logged in to delete a gift.");
    // RLS Policy "Allow delete for event creators" handles the ownership check

    const { error } = await supabase
      .from('gifts')
      .delete()
      .eq('id', giftId);
      // RLS policy ensures only the creator of the associated event can delete

    if (error) {
        console.error(`Error deleting gift ${giftId}:`, error);
        throw error;
    }
  }
};
