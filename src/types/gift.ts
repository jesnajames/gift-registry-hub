export interface Gift {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  url: string;
  store: string;
  priority: 'high' | 'medium' | 'low';
  booked: boolean;
  bookedBy?: string;
  dateAdded: string;
}
