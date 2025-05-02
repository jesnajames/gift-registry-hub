import { supabase } from '../lib/supabase';
import { User } from '../types/user';
import { ProfileRow } from '../lib/supabase';

// Function to fetch user profile data based on user ID
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId) {
      console.error("getUserProfile requires a userId.");
      return null;
  }
  console.log("Finding profile with id", userId)

  try {
    const { data, error } = await supabase
      .from('profiles') // Ensure 'profiles' table exists and RLS allows reads
      .select('id, name, username, avatar_url, phone, email, address') // Select fields matching UserProfile
      .eq('id', userId)
      .single<User>(); // Expect a single UserProfile structure

    if (error && error.code !== 'PGRST116') { // PGRST116: Row not found
      console.error('Error fetching user profile:', error);
      throw error;
    }

    if (!data) {
      // If no profile exists, return a default structure or null
      // Returning null might be better handled in the component
      console.log(`No profile found for user ID: ${userId}. Returning default structure.`);
      // Return a default structure matching UserProfile
       return {
           id: userId,
           full_name: '', // Default empty values
           phone: '',
           address: '',
       };
    }

    // Return the fetched profile data matching UserProfile type
    return data;

  } catch (err) {
    console.error('Error in getUserProfile:', err);
    // Return null or a default object on error to prevent crashing the component
     return {
         id: userId,
         full_name: 'Error loading profile',
         phone: '',
         address: '',
     };
  }
};

// Function to update user profile data
export const updateUserProfile = async (profileData: User): Promise<User | null> => {
    if (!profileData || !profileData.id) {
        console.error("updateUserProfile requires profile data with an ID.");
        return null;
    }

    const { id, ...updateData } = profileData; // Separate ID from the data to update

    try {
        const { data, error } = await supabase
            .from('profiles') // Ensure 'profiles' table exists and RLS allows updates
            .update(updateData) // Pass the fields to update
            .eq('id', id) // Specify the user profile to update
            .select('id, full_name, phone, address') // Select the updated fields
            .single<User>(); // Expect a single updated UserProfile

        if (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }

        if (!data) {
             console.error('Profile not found or update failed, returned no data.');
             return null; // Or handle as appropriate
        }

        console.log('Profile updated successfully:', data);
        return data; // Return the updated profile data

    } catch (err) {
        console.error('Error in updateUserProfile:', err);
        return null; // Return null on error
    }
};

// Function to fetch multiple user profiles (example, might not be needed for ProfileEdit)
// Kept for potential future use, ensure it uses the correct types if used
export const getUserProfiles = async (userIds: string[]): Promise<Map<string, User>> => {
    const userMap = new Map<string, User>();
    if (!userIds || userIds.length === 0) return userMap;

    const uniqueUserIds = [...new Set(userIds)];

    try {
        // This function fetches basic User info (id, name, avatarUrl)
        // Adjust select query and mapping if you need UserProfile fields here
        const { data, error } = await supabase
            .from('profiles') // Assuming 'profiles' has these basic fields too
            .select('id, name:full_name, username, avatar_url') // Adjust select based on 'profiles' table columns
            .in('id', uniqueUserIds);

        if (error) {
            console.error('Error fetching user profiles:', error);
            throw error;
        }

        data?.forEach((profile: any) => { // Use 'any' or a specific type matching the select query
            userMap.set(profile.id, {
                id: profile.id,
                name: profile.name || profile.username || 'Unnamed User', // Map fields correctly
                avatarUrl: profile.avatar_url || null,
            });
        });

        // Add fallback for any IDs not found
        uniqueUserIds.forEach(id => {
            if (!userMap.has(id)) {
                 userMap.set(id, { id: id, name: 'Unknown User', avatarUrl: null });
            }
        });

    } catch (err) {
        console.error('Error in getUserProfiles:', err);
         uniqueUserIds.forEach(id => {
            if (!userMap.has(id)) {
                 userMap.set(id, { id: id, name: 'Error Loading User', avatarUrl: null });
            }
        });
    }
     return userMap;
};

// Function to fetch user profile data based on user ID
export const userService = {
  async getUserProfile(userId: string): Promise<User | null> {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles') // Assuming you have a 'profiles' table linked to auth.users
        .select('id, name, username, avatar_url')
        .eq('id', userId)
        .single<ProfileRow>(); // Use ProfileRow type

      if (error && error.code !== 'PGRST116') { // PGRST116: Row not found, which is okay
        console.error('Error fetching user profile:', error);
        throw error;
      }

      if (!data) {
        // Fallback if profile doesn't exist
        return {
            id: userId,
            name: 'Unknown User', // Or fetch email from auth as fallback
            avatarUrl: "",
        };
      }

      // Map ProfileRow to User type
      return {
        id: data.id,
        name: data?.name || data.username || 'Unnamed User',
        avatarUrl: data.avatar_url || "",
        // email can be fetched from auth.user() if needed elsewhere
      };
    } catch (err) {
      console.error('Error in getUserProfile:', err);
      return null; // Return null or a default user object on error
    }
  },

  async getUserProfiles(userIds: string[]): Promise<Map<string, User>> {
    const userMap = new Map<string, User>();
    if (!userIds || userIds.length === 0) return userMap;

    // Remove duplicates
    const uniqueUserIds = [...new Set(userIds)];

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, name, username, avatar_url')
            .in('id', uniqueUserIds); // Fetch profiles for the unique IDs

        if (error) {
            console.error('Error fetching user profiles:', error);
            throw error;
        }

        data?.forEach((profile: ProfileRow) => {
            userMap.set(profile.id, {
                id: profile.id,
                name: profile.name || profile.username || 'Unnamed User',
                avatarUrl: profile.avatar_url,
            });
        });

        // Add fallback for any IDs not found in profiles
        uniqueUserIds.forEach(id => {
            if (!userMap.has(id)) {
                 userMap.set(id, {
                    id: id,
                    name: 'Unknown User',
                    avatarUrl: null,
                });
            }
        });


    } catch (err) {
        console.error('Error in getUserProfiles:', err);
         // Provide fallback for all requested IDs on error
         uniqueUserIds.forEach(id => {
            if (!userMap.has(id)) {
                 userMap.set(id, {
                    id: id,
                    name: 'Error Loading User',
                    avatarUrl: null,
                });
            }
        });
    }
     return userMap;
  }
};