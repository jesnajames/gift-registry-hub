import React, { useEffect, useState } from 'react';
import { User } from '../types/user';
// Import the userService object instead of individual functions
import { getUserProfile, updateUserProfile } from '../services/userService';
import { useAuth } from '../contexts/AuthContext'; // Assuming useAuth hook provides the user ID

export const ProfileEdit: React.FC = () => {
  const { user } = useAuth(); // Get the current user from auth context/hook
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        console.error("User ID not found.");
        setLoading(false);
        return; // Exit if no user ID
      }
      try {
        // Call getUserProfile via the userService object
        const data = await getUserProfile(user.id);
        // Assuming getUserProfile now returns UserProfile or null
        // We need to adapt if it returns User or null
        // For now, let's assume it returns the structure needed or adapt it
        if (data) {
           // Map the User type from userService to the UserProfile type if needed
           // This mapping depends on the exact structure of User and UserProfile
           // Example mapping (adjust based on actual types):
           setProfile({
               id: data.id,
               full_name: data.name || '', // Map 'name' to 'full_name'
               phone: '', // Add default or fetch if available
               address: '', // Add default or fetch if available
               // Add other fields as necessary
           });
        } else {
            // Handle case where profile data is null (e.g., new user)
             setProfile({
               id: user.id,
               full_name: '',
               phone: '',
               address: '',
             });
        }

      } catch (error) {
        console.error('Error loading profile:', error);
         // Set a default empty profile state on error to allow editing
         if(user?.id) {
            setProfile({
               id: user.id,
               full_name: '',
               phone: '',
               address: '',
             });
         }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]); // Depend on user object

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user?.id) return;

    setSaving(true);
    try {
      // Ensure the profile object being sent matches the expected type for updateUserProfile
      // The updateUserProfile function might need adjustment in userService.ts
      // to accept and process UserProfile type or map it internally.
      // For now, assuming updateUserProfile exists and handles the update.
      // We might need an updateUserProfile function in userService.ts similar to getUserProfile.
      // Let's assume an updateUserProfile function exists in userService:
      // const updatedProfileData = await userService.updateUserProfile(profile);

      // Placeholder for actual update logic - userService needs an update function
      console.log("Simulating profile update:", profile);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Assuming update is successful and returns the updated profile
      // setProfile(updatedProfileData); // Update state with response if needed

      alert('Profile updated successfully! (Simulated)');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
   if (!profile && !loading) return <div className="flex justify-center p-8">Could not load profile.</div>;


  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={profile?.full_name || ''}
              onChange={(e) => setProfile(prev => prev ? {...prev, full_name: e.target.value} : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required // Example: make field required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={profile?.phone || ''}
              onChange={(e) => setProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              value={profile?.address || ''}
              onChange={(e) => setProfile(prev => prev ? {...prev, address: e.target.value} : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3} // Example: set rows for textarea
            />
          </div>
          <button
            type="submit"
            disabled={saving || loading} // Also disable if loading
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
