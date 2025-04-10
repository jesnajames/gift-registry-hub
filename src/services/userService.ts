import { supabase } from '../lib/supabase';
import { User } from '../types/user';
import { ProfileRow } from '../lib/supabase';

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
            avatarUrl: null,
        };
      }

      // Map ProfileRow to User type
      return {
        id: data.id,
        name: data.name || data.username || 'Unnamed User',
        avatarUrl: data.avatar_url,
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