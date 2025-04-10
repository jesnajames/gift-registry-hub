import { Event } from './types/event';
import { User } from './types/user';

const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'Emma Johnson',
    email: 'emma@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 'user2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 'user3',
    name: 'Sophia Rodriguez',
    email: 'sophia@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
  }
];

export const mockEvents: Event[] = [
  {
    id: 'event1',
    title: 'Emma\'s 30th Birthday',
    description: 'Help me celebrate the big 3-0 with some amazing gifts!',
    date: '2023-11-15',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    createdBy: mockUsers[0],
    eventType: 'birthday',
    shareLink: 'https://gift-registry-hub.com/registry/event1',
    gifts: [
      {
        id: 'gift1',
        name: 'Apple AirPods Pro',
        description: 'Wireless earbuds with active noise cancellation and transparency mode.',
        price: 249.99,
        imageUrl: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        url: 'https://www.amazon.com/Apple-AirPods-Pro-Wireless-Earbuds/dp/B0BDHWDR12/',
        store: 'Amazon',
        priority: 'high',
        booked: false,
        dateAdded: '2023-10-01'
      },
      {
        id: 'gift2',
        name: 'Kindle Paperwhite',
        description: 'Waterproof e-reader with a 6.8" display and adjustable warm light.',
        price: 139.99,
        imageUrl: 'https://images.unsplash.com/photo-1592890288564-76628a30a657?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        url: 'https://www.amazon.com/Kindle-Paperwhite-adjustable-Ad-Supported/dp/B08KTZ8249/',
        store: 'Amazon',
        priority: 'medium',
        booked: true,
        bookedBy: 'John Smith',
        dateAdded: '2023-10-02'
      },
      {
        id: 'gift3',
        name: 'Lululemon Yoga Mat',
        description: 'Premium yoga mat with excellent grip and cushioning.',
        price: 88.00,
        imageUrl: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        url: 'https://shop.lululemon.com/p/yoga-accessories/The-Reversible-Mat-5/_/prod6750166',
        store: 'Lululemon',
        priority: 'low',
        booked: false,
        dateAdded: '2023-10-03'
      },
      {
        id: 'gift4',
        name: 'Instant Pot Duo',
        description: '7-in-1 pressure cooker, slow cooker, rice cooker, and more.',
        price: 99.95,
        imageUrl: 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        url: 'https://www.amazon.com/Instant-Pot-Multi-Use-Programmable-Pressure/dp/B00FLYWNYQ/',
        store: 'Amazon',
        priority: 'medium',
        booked: false,
        dateAdded: '2023-10-04'
      }
    ]
  },
  {
    id: 'event2',
    title: 'Michael & Sarah\'s Wedding',
    description: 'Join us in celebrating our special day and help us start our new life together.',
    date: '2023-12-10',
    imageUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    createdBy: mockUsers[1],
    eventType: 'wedding',
    shareLink: 'https://gift-registry-hub.com/registry/event2',
    gifts: [
      {
        id: 'gift5',
        name: 'KitchenAid Stand Mixer',
        description: 'Professional 5-quart stand mixer in Matte Black.',
        price: 399.99,
        imageUrl: 'https://images.unsplash.com/photo-1578738288760-05ce9be719d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        url: 'https://www.amazon.com/KitchenAid-KSM150PSBK-Artisan-Quart-Mixer/dp/B00005UP2P/',
        store: 'Amazon',
        priority: 'high',
        booked: true,
        bookedBy: 'Jane Doe',
        dateAdded: '2023-09-15'
      },
      {
        id: 'gift6',
        name: 'Dyson V11 Vacuum',
        description: 'Cordless stick vacuum with intelligent suction and up to 60 minutes of run time.',
        price: 599.99,
        imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        url: 'https://www.dyson.com/vacuum-cleaners/cordless/v11/animal',
        store: 'Dyson',
        priority: 'medium',
        booked: false,
        dateAdded: '2023-09-16'
      },
      {
        id: 'gift7',
        name: 'Le Creuset Dutch Oven',
        description: '5.5-quart enameled cast iron dutch oven in Flame orange.',
        price: 369.95,
        imageUrl: 'https://images.unsplash.com/photo-1585837575652-267cbc187fc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        url: 'https://www.lecreuset.com/round-dutch-oven/LS2501.html',
        store: 'Le Creuset',
        priority: 'high',
        booked: false,
        dateAdded: '2023-09-17'
      },
      {
        id: 'gift8',
        name: 'Honeymoon Fund',
        description: 'Contribute to our dream honeymoon in Bali!',
        price: 100.00,
        imageUrl: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        url: 'https://www.honeyfund.com',
        store: 'Honeyfund',
        priority: 'high',
        booked: false,
        dateAdded: '2023-09-18'
      },
      {
        id: 'gift9',
        name: 'Calphalon Cookware Set',
        description: '10-piece hard-anodized aluminum cookware set with glass lids.',
        price: 249.99,
        imageUrl: 'https://images.unsplash.com/photo-1584990347449-a5d9f800a783?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        url: 'https://www.amazon.com/Calphalon-Classic-Nonstick-Cookware-10-Piece/dp/B01APP1W2O/',
        store: 'Amazon',
        priority: 'medium',
        booked: true,
        bookedBy: 'Robert Johnson',
        dateAdded: '2023-09-19'
      }
    ]
  },
  {
    id: 'event3',
    title: 'Sophia\'s Baby Shower',
    description: 'Help us welcome our little bundle of joy with some essential items!',
    date: '2023-11-05',
    imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    createdBy: mockUsers[2],
    eventType: 'baby_shower',
    shareLink: 'https://gift-registry-hub.com/registry/event3',
    gifts: [
      {
        id: 'gift10',
        name: 'UPPAbaby VISTA V2 Stroller',
        description: 'Full-size stroller that can convert to a double or triple stroller.',
        price: 969.99,
        imageUrl: 'https://images.unsplash.com/photo-1591967183212-8c5a2f9745dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        url: 'https://www.amazon.com/UPPAbaby-VISTA-Stroller-Jordan-Charcoal/dp/B084DKQ89V/',
        store: 'Amazon',
        priority: 'high',
        booked: false,
        dateAdded: '2023-09-01'
      },
      {
        id: 'gift11',
        name: 'Halo BassiNest Swivel Sleeper',
        description: 'Bedside bassinet with 360° swivel and adjustable height.',
        price: 289.99,
        imageUrl: 'https://images.unsplash.com/photo-1586105449897-20b5d42a271d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        url: 'https://www.amazon.com/Halo-BassiNest-Swivel-Sleeper-Premiere/dp/B07H5SFPNV/',
        store: 'Amazon',
        priority: 'high',
        booked: true,
        bookedBy: 'Maria Garcia',
        dateAdded: '2023-09-02'
      },
      {
        id: 'gift12',
        name: 'Baby Monitor',
        description: 'Video baby monitor with night vision and temperature monitoring.',
        price: 159.99,
        imageUrl: 'https://images.unsplash.com/photo-1596461010768-5a4e4a6d09e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        url: 'https://www.amazon.com/Infant-Optics-DXR-8-Monitor-Interchangeable/dp/B00ECHYTBI/',
        store: 'Amazon',
        priority: 'medium',
        booked: false,
        dateAdded: '2023-09-03'
      }
    ]
  }
];