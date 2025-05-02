import React, { useState } from 'react';
import { ProfileView } from '../components/ProfileView';
import { ProfileEdit } from '../components/ProfileEdit';

type ProfilePageProps = {
  currentUser: any;
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          {isEditing ? 'View Profile' : 'Edit Profile'}
        </button>
      </div>
      {isEditing ? <ProfileEdit /> : <ProfileView />}
    </div>
  );
};