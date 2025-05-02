import React, { useEffect, useRef, useState } from 'react';
import {User } from '../types/user';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { useAuth } from '../contexts/AuthContext'; // Assuming useAuth hook provides the user ID

export const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
const { user } = useAuth();
console.log("profile user", user);
  useEffect(() => {
    const loadProfile = async () => {
      try {

        const data = await getUserProfile(user.id);
        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <img
            src={profile?.avatar_url || '/default-avatar.png'}
            alt="Profile"
            className="w-20 h-20 rounded-full mr-4"
          />
          <div>
            <h1 className="text-2xl font-bold">{profile?.name}</h1>
            <p className="text-gray-600">{profile?.email}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Contact Information</h2>
            <p className="text-gray-600">Phone: {profile?.phone || 'Not provided'}</p>
            <p className="text-gray-600">Address: {profile?.address || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

