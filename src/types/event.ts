import { Gift } from './gift';
import { User } from './user';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  createdBy: User;
  gifts: Gift[];
  shareLink: string;
  eventType: 'birthday' | 'wedding' | 'baby_shower' | 'housewarming' | 'other';
}
