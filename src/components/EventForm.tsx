import React, { useState, useEffect } from 'react';
import { Event } from '../types/event';

interface EventFormProps {
  initialEvent?: Event | null; // For editing
  onSubmit: (eventData: Omit<Event, 'id' | 'gifts' | 'createdBy' | 'createdAt' | 'updatedAt' | 'createdByUser'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ initialEvent, onSubmit, onCancel, isLoading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [eventType, setEventType] = useState<'birthday' | 'wedding' | 'baby_shower' | 'housewarming' | 'other' | ''>('');

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDescription(initialEvent.description || '');
      // Format date for input type="datetime-local" which expects 'YYYY-MM-DDTHH:mm'
      const initialDate = initialEvent.date ? new Date(initialEvent.date).toISOString().slice(0, 16) : '';
      setDate(initialDate);
      setImageUrl(initialEvent.imageUrl || '');
      setEventType(initialEvent.eventType || '');
    } else {
        // Set default date to today for new events
        const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset()); // Adjust for local timezone
        setDate(today.toISOString().slice(0, 16));
        setEventType(''); // Reset type for new event
    }
  }, [initialEvent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventType) {
        alert("Please select an event type.");
        return;
    }
    const eventData = {
      title,
      description,
      date: new Date(date).toISOString(), // Convert back to ISO string for DB
      imageUrl,
      eventType,
      shareLink: initialEvent?.shareLink || null // Preserve existing or set null for new
    };
    onSubmit(eventData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-slide-up">
            <h2 className="text-2xl font-bold mb-6 text-center">{initialEvent ? 'Edit Event' : 'Create New Event'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="label">Event Title</label>
                <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                required
                />
            </div>
            <div>
                <label htmlFor="description" className="label">Description</label>
                <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                rows={3}
                />
            </div>
            <div>
                <label htmlFor="date" className="label">Date and Time</label>
                <input
                id="date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
                required
                />
            </div>
             <div>
                <label htmlFor="eventType" className="label">Event Type</label>
                <select
                    id="eventType"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="input"
                    required
                >
                    <option value="" disabled>Select type...</option>
                    <option value="birthday">Birthday</option>
                    <option value="wedding">Wedding</option>
                    <option value="baby_shower">Baby Shower</option>
                    <option value="housewarming">Housewarming</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div>
                <label htmlFor="imageUrl" className="label">Image URL (Optional)</label>
                <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="input"
                placeholder="https://example.com/image.jpg"
                />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button
                type="button"
                onClick={onCancel}
                className="btn-outline"
                disabled={isLoading}
                >
                Cancel
                </button>
                <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
                >
                {isLoading ? 'Saving...' : (initialEvent ? 'Update Event' : 'Create Event')}
                </button>
            </div>
            </form>
        </div>
    </div>
  );
};

export default EventForm;