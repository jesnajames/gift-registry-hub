import { Gift } from '../types/gift';
import { User } from '../types/user'; // Import User type

interface GiftCardProps {
  gift: Gift;
  eventId: string;
  isGuest: boolean;
  currentUser: User | null; // Add current user prop
  onBookGift: (eventId: string, giftId: string) => void;
  onUnbookGift: (eventId: string, giftId: string) => void; // Add unbook handler prop
  onEditGift?: (gift: Gift) => void; // Optional: Edit handler (only for owner)
  onDeleteGift?: (giftId: string) => void; // Optional: Delete handler (only for owner)
}

const GiftCard = ({
    gift,
    eventId,
    isGuest,
    currentUser,
    onBookGift,
    onUnbookGift,
    onEditGift,
    onDeleteGift
}: GiftCardProps) => {
  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', // Consider making currency dynamic if needed
    }).format(price);
  };

  const getPriorityBadge = (priority: string | null) => {
    switch(priority) {
      case 'high':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Medium Priority
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Low Priority
          </span>
        );
      default:
        return null;
    }
  };

  const getStoreIcon = (store: string | null) => {
    if (!store) return null; // Handle null store
    switch(store.toLowerCase()) {
      case 'amazon':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.074-1.052-.872-1.238-1.276-1.814-2.106-1.734 1.767-2.962 2.297-5.209 2.297-2.66 0-4.731-1.641-4.731-4.925 0-2.565 1.391-4.309 3.37-5.164 1.715-.754 4.11-.891 5.942-1.095v-.41c0-.753.06-1.642-.384-2.294-.385-.578-1.124-.82-1.775-.82-1.205 0-2.277.62-2.54 1.9-.054.285-.261.567-.548.582l-3.061-.333c-.258-.056-.545-.266-.469-.66.701-3.703 4.03-4.814 7.016-4.814 1.526 0 3.522.406 4.719 1.557 1.526 1.423 1.38 3.322 1.38 5.392v4.876c0 1.465.61 2.113 1.182 2.911.202.285.247.624-.01.833l-2.323 2.021v-.007zM21.236 21c-.12-.141-.246-.182-.378-.127-5.294 2.762-11.066 2.887-16.171.9-5.095-1.986-9.278-7.268-9.278-13.166 0-7.499 5.057-14.564 13.304-14.564 4.448 0 9.341 1.346 12.14 4.802 2.584 3.267 3.147 7.952 3.147 11.967 0 2.297-.433 4.319-1.185 6.392-.141.386.21.568.475.413 1.528-.899 4.62-3.845 5.513-5.392.12-.208.312-.127.312.141v5.657c0 .083-.033.166-.092.224L21.236 21z"/>
          </svg>
        );
      // Add other store icons as needed
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
    }
  };

  const canUnbook = currentUser && gift.booked && gift.bookedBy === currentUser.id;
  const canEditOrDelete = !isGuest && onEditGift && onDeleteGift; // Check if handlers are provided

  return (
    <div className={`card ${gift.booked ? 'opacity-75 bg-gray-50' : ''} animate-fade-in flex flex-col justify-between`}>
      <div> {/* Content Area */}
        <div className="relative">
          <img
            src={gift.imageUrl || 'https://via.placeholder.com/300x200/E2E8F0/AAAAAA?text=No+Image'} // Placeholder image
            alt={gift.name}
            className="w-full h-48 object-contain p-4 bg-gray-100" // Contain images better
          />
          {gift.booked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg transform -rotate-6">
                <span className="text-lg font-bold text-secondary flex items-center">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                   </svg>
                   Booked
                </span>
                 {gift.bookedByUser && (
                    <span className="text-xs text-gray-600 block text-center">by {gift.bookedByUser.name}</span>
                 )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="text-lg font-semibold line-clamp-2 flex-1">{gift.name}</h3>
            <span className="text-lg font-bold text-primary whitespace-nowrap">{formatPrice(gift.price)}</span>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-3 min-h-[3rem]">{gift.description || 'No description provided.'}</p>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-gray-500 text-sm">
              {getStoreIcon(gift.store)}
              <span className="ml-1">{gift.store || 'Unknown Store'}</span>
            </div>
            {getPriorityBadge(gift.priority)}
          </div>
        </div>
      </div>

      {/* Actions Area */}
      <div className="p-4 border-t border-gray-100 mt-auto">
        <div className="flex flex-col space-y-2">
            {gift.url && (
                 <a
                    href={gift.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline w-full flex items-center justify-center text-sm py-1.5"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Item
                 </a>
            )}

          {isGuest && !gift.booked && (
            <button
              onClick={() => onBookGift(eventId, gift.id)}
              className="btn-secondary w-full flex items-center justify-center text-sm py-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Book This Gift
            </button>
          )}

          {canUnbook && (
             <button
              onClick={() => onUnbookGift(eventId, gift.id)}
              className="btn-outline w-full flex items-center justify-center text-sm py-1.5 text-red-600 border-red-300 hover:bg-red-50"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
              Unbook Gift
            </button>
          )}

          {canEditOrDelete && (
            <div className="flex space-x-2">
              <button
                onClick={() => onEditGift && onEditGift(gift)}
                className="btn-outline flex-1 flex items-center justify-center text-sm py-1.5"
                aria-label="Edit Gift"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                 </svg>
                Edit
              </button>
              <button
                onClick={() => onDeleteGift && onDeleteGift(gift.id)}
                className="btn-outline flex-1 flex items-center justify-center text-sm py-1.5 text-red-600 border-red-300 hover:bg-red-50"
                aria-label="Delete Gift"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                 </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiftCard;
