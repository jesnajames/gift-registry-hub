import { useState } from 'react';
import { Event } from '../types/event';
import { Gift } from '../types/gift'; // Import Gift type
import { User } from '../types/user'; // Import User type
import GiftCard from './GiftCard';
import ShareModal from './ShareModal';

interface RegistryListProps {
  event: Event;
  isGuest: boolean;
  currentUser: User | null; // Add currentUser
  onBookGift: (eventId: string, giftId: string) => void;
  onUnbookGift: (eventId: string, giftId: string) => void; // Add unbook handler
  onAddGift?: () => void; // Optional add handler
  onEditGift?: (gift: Gift) => void; // Optional edit handler
  onDeleteGift?: (giftId: string) => void; // Optional delete handler
}

const RegistryList = ({
    event,
    isGuest,
    currentUser,
    onBookGift,
    onUnbookGift,
    onAddGift,
    onEditGift,
    onDeleteGift
}: RegistryListProps) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterBooked, setFilterBooked] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredGifts = event.gifts.filter(gift => {
    if (filterPriority && gift.priority !== filterPriority) return false;
    if (filterBooked !== null && gift.booked !== filterBooked) return false;
    if (searchTerm &&
        !gift.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(gift.description && gift.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
        !(gift.store && gift.store.toLowerCase().includes(searchTerm.toLowerCase()))
       ) {
      return false;
    }
    return true;
  }).sort((a, b) => {
      // Optional: Sort by priority then date added
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const priorityA = priorityOrder[a.priority || 'low'];
      const priorityB = priorityOrder[b.priority || 'low'];
      if (priorityA !== priorityB) return priorityA - priorityB;
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(); // Newest first within priority
  });

  const bookedCount = event.gifts.filter(gift => gift.booked).length;
  const remainingCount = event.gifts.length - bookedCount;
  const isOwner = currentUser?.id === event.createdBy;

  return (
    <div className="animate-fade-in">
      {/* Event Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <p className="text-gray-600 mb-2">{event.description || 'No description provided.'}</p>
          <div className="flex flex-wrap items-center text-gray-500 text-sm gap-x-3 gap-y-1">
             <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(event.date)}
             </span>
             <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Created by {event.createdByUser?.name || 'Unknown'}
             </span>
            {isGuest && (
              <span className="text-primary font-medium bg-primary/10 px-2 py-0.5 rounded text-xs">Guest View</span>
            )}
          </div>
        </div>

        <div className="flex space-x-2 mt-4 md:mt-0">
            {isOwner && onAddGift && (
                 <button
                    onClick={onAddGift}
                    className="btn-secondary flex items-center"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Gift
                 </button>
             )}
             <button
                onClick={() => setShowShareModal(true)}
                className="btn-primary flex items-center"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                Share
             </button>
        </div>
      </div>

      {/* Filters and Stats */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          {/* Stats */}
          <div className="flex space-x-4 mb-4 md:mb-0">
             <div className="text-center">
              <div className="text-2xl font-bold text-primary">{event.gifts.length}</div>
              <div className="text-sm text-gray-500">Total Gifts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{bookedCount}</div>
              <div className="text-sm text-gray-500">Booked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{remainingCount}</div>
              <div className="text-sm text-gray-500">Available</div>
            </div>
          </div>

          {/* Search */}
          <div className="w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search gifts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="text-sm text-gray-500 mr-2 flex-shrink-0">Filters:</div>
          <div className="flex flex-wrap gap-2">
             {/* Priority Filters */}
             <button onClick={() => setFilterPriority(filterPriority === 'high' ? null : 'high')} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${ filterPriority === 'high' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>High Priority</button>
             <button onClick={() => setFilterPriority(filterPriority === 'medium' ? null : 'medium')} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${ filterPriority === 'medium' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}>Medium Priority</button>
             <button onClick={() => setFilterPriority(filterPriority === 'low' ? null : 'low')} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${ filterPriority === 'low' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}>Low Priority</button>

             {/* Booking Status Filters */}
             <button onClick={() => setFilterBooked(filterBooked === true ? null : true)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${ filterBooked === true ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>Booked</button>
             <button onClick={() => setFilterBooked(filterBooked === false ? null : false)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${ filterBooked === false ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>Available</button>

             {/* Clear Filters Button */}
             {(filterPriority !== null || filterBooked !== null || searchTerm) && (
              <button
                onClick={() => { setFilterPriority(null); setFilterBooked(null); setSearchTerm(''); }}
                className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors flex items-center"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredGifts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGifts.map(gift => (
            <GiftCard
              key={gift.id}
              gift={gift}
              eventId={event.id}
              isGuest={isGuest || !isOwner} // Treat non-owners as guests for gift actions
              currentUser={currentUser}
              onBookGift={onBookGift}
              onUnbookGift={onUnbookGift}
              onEditGift={isOwner ? onEditGift : undefined} // Only pass edit if owner
              onDeleteGift={isOwner ? onDeleteGift : undefined} // Only pass delete if owner
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-1.414 1.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">
            {event.gifts.length === 0 ? 'No Gifts Added Yet' : 'No gifts match your filters'}
          </h3>
          <p className="text-gray-500">
            {event.gifts.length === 0
              ? (isOwner ? 'Click "Add Gift" to start building your registry!' : 'The event creator hasn\'t added any gifts yet.')
              : "Try adjusting your search or filters."}
          </p>
        </div>
      )}

      {showShareModal && (
        <ShareModal
          event={event}
          onClose={() => setShowShareModal(false)}
          // Pass onGuestView only if the current user is the owner
          onGuestView={isOwner ? () => {/* Implement guest view toggle logic if needed */} : undefined}
        />
      )}
    </div>
  );
};

export default RegistryList;
