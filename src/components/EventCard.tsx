import { Event } from '../types/event';
import { User } from '../types/user'; // Import User type
import ShareModal from './ShareModal';
import { useState } from 'react';

interface EventCardProps {
  event: Event;
  currentUser: User | null; // Add currentUser prop
  onSelect: (event: Event) => void;
  onGuestView: (event: Event) => void;
  onEdit?: (event: Event) => void; // Optional edit handler
  onDelete?: (eventId: string) => void; // Optional delete handler
}

const EventCard = ({ event, currentUser, onSelect, onGuestView, onEdit, onDelete }: EventCardProps) => {
  const [showShareModal, setShowShareModal] = useState(false);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getEventTypeIcon = (type: string | null) => {
    switch(type) {
      case 'birthday':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
          </svg>
        );
      case 'wedding':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'baby_shower':
         return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {/* Using a simple gift icon for baby shower */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        );
      case 'housewarming':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        );
    }
  };

  const isOwner = currentUser?.id === event.createdBy;

  return (
    <>
      <div className="card group animate-fade-in flex flex-col h-full"> {/* Ensure card takes full height */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.imageUrl || 'https://via.placeholder.com/400x200?text=Event+Image'} // Fallback image
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute top-2 right-2 flex space-x-1">
             {isOwner && onEdit && (
                 <button
                    onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                    className="p-1.5 bg-white/80 rounded-full text-blue-600 hover:bg-white hover:text-blue-700 transition-colors"
                    aria-label="Edit Event"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                 </button>
             )}
             {isOwner && onDelete && (
                 <button
                    onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}
                    className="p-1.5 bg-white/80 rounded-full text-red-600 hover:bg-white hover:text-red-700 transition-colors"
                    aria-label="Delete Event"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                 </button>
             )}
          </div>
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <div className="flex items-center mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/80 text-white mr-2">
                {getEventTypeIcon(event.eventType)}
                <span className="ml-1 capitalize">{event.eventType?.replace('_', ' ') || 'Event'}</span>
              </span>
              <span className="text-sm">{formatDate(event.date)}</span>
            </div>
            <h3 className="text-xl font-bold">{event.title}</h3>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow"> {/* Make content area grow */}
          <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">{event.description || 'No description provided.'}</p> {/* Allow description to grow */}

          <div className="flex items-center justify-between mb-4 mt-auto"> {/* Push creator/gift count down */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {event.createdByUser?.avatarUrl ? (
                  <img
                    src={event.createdByUser.avatarUrl}
                    alt={event.createdByUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-white text-sm font-medium">
                    {event.createdByUser?.name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <span className="ml-2 text-sm text-gray-600 truncate">By {event.createdByUser?.name || 'Unknown'}</span>
            </div>

            <div className="flex items-center flex-shrink-0">
              <span className="text-sm text-gray-600 mr-1">{event.gifts.length}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
              </svg>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => onSelect(event)}
              className="btn-primary flex-1"
            >
              View Registry
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }}
              className="btn-outline p-2"
              aria-label="Share"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          event={event}
          onClose={() => setShowShareModal(false)}
          onGuestView={() => {
            onGuestView(event);
            setShowShareModal(false);
          }}
        />
      )}
    </>
  );
};

export default EventCard;
