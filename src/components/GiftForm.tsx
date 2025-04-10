import React, { useState, useEffect } from 'react';
import { Gift } from '../types/gift';

interface GiftFormProps {
  initialGift?: Gift | null; // For editing
  eventId: string; // Needed to associate the gift
  onSubmit: (giftData: Omit<Gift, 'id' | 'eventId' | 'booked' | 'bookedBy' | 'dateAdded' | 'updatedAt' | 'bookedByUser'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const GiftForm: React.FC<GiftFormProps> = ({ initialGift, eventId, onSubmit, onCancel, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [url, setUrl] = useState('');
  const [store, setStore] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | ''>('');

  useEffect(() => {
    if (initialGift) {
      setName(initialGift.name);
      setDescription(initialGift.description || '');
      setPrice(initialGift.price ?? '');
      setImageUrl(initialGift.imageUrl || '');
      setUrl(initialGift.url || '');
      setStore(initialGift.store || '');
      setPriority(initialGift.priority || '');
    } else {
        // Reset fields for new gift
        setName('');
        setDescription('');
        setPrice('');
        setImageUrl('');
        setUrl('');
        setStore('');
        setPriority('');
    }
  }, [initialGift]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!priority) {
        alert("Please select a priority level.");
        return;
    }
    const giftData = {
      name,
      description,
      price: price === '' ? null : Number(price), // Handle empty string for price
      imageUrl,
      url,
      store,
      priority,
    };
    onSubmit(giftData);
  };

  return (
     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-slide-up">
            <h2 className="text-2xl font-bold mb-6 text-center">{initialGift ? 'Edit Gift' : 'Add New Gift'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="label">Gift Name</label>
                <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                required
                />
            </div>
            <div>
                <label htmlFor="description" className="label">Description (Optional)</label>
                <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                rows={2}
                />
            </div>
            <div>
                <label htmlFor="price" className="label">Price (Optional)</label>
                <input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="input"
                placeholder="e.g., 49.99"
                />
            </div>
            <div>
                <label htmlFor="url" className="label">Product URL (Optional)</label>
                <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="input"
                placeholder="https://store.com/product-link"
                />
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
            <div>
                <label htmlFor="store" className="label">Store (Optional)</label>
                <input
                id="store"
                type="text"
                value={store}
                onChange={(e) => setStore(e.target.value)}
                className="input"
                placeholder="e.g., Amazon, Target"
                />
            </div>
            <div>
                <label htmlFor="priority" className="label">Priority</label>
                <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="input"
                    required
                >
                    <option value="" disabled>Select priority...</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
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
                {isLoading ? 'Saving...' : (initialGift ? 'Update Gift' : 'Add Gift')}
                </button>
            </div>
            </form>
        </div>
    </div>
  );
};

export default GiftForm;