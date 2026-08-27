/**
 * Adoptly Web – Shared Mock State Database
 *
 * All emojis are strictly omitted.
 */

import type { Conversation, ChatMessage, Pet, Profile, Report } from '@/types';

export const CURRENT_USER: Profile = {
  id: 'u-0001-current',
  full_name: 'Alex Johnson',
  email: 'alex@example.com',
  phone: '+63 912 345 6789',
  street_address: '42 Orchid Lane',
  city: 'Manila',
  postal_code: '1000',
  role: 'user',
  is_blocked: false,
  avatar_url: '/logo.jpg',
  created_at: '2025-06-01T08:00:00Z',
};

export const MOCK_PROFILES: Profile[] = [
  {
    id: 'u-0002-maria',
    full_name: 'Maria Santos',
    email: 'maria@example.com',
    street_address: '18 Jasmine St.',
    city: 'Quezon City',
    postal_code: '1100',
    role: 'user',
    is_blocked: false,
    avatar_url: '/logo.jpg',
    created_at: '2025-05-10T09:00:00Z',
  },
  {
    id: 'u-0003-james',
    full_name: 'James Reyes',
    email: 'james@example.com',
    street_address: '77 Acacia Blvd.',
    city: 'Makati',
    postal_code: '1200',
    role: 'user',
    is_blocked: false,
    avatar_url: '/logo.jpg',
    created_at: '2025-04-22T10:30:00Z',
  },
  {
    id: 'u-0004-sofia',
    full_name: 'Sofia Cruz',
    email: 'sofia@example.com',
    street_address: '5 Dahlia Rd.',
    city: 'Pasig',
    postal_code: '1600',
    role: 'user',
    is_blocked: false,
    avatar_url: '/logo.jpg',
    created_at: '2025-03-15T14:00:00Z',
  },
  {
    id: 'u-0005-carlo',
    full_name: 'Carlo Mendoza',
    email: 'carlo@example.com',
    street_address: '120 Sunflower Ave.',
    city: 'Taguig',
    postal_code: '1630',
    role: 'user',
    is_blocked: false,
    avatar_url: '/logo.jpg',
    created_at: '2025-07-01T07:00:00Z',
  },
  {
    id: 'u-admin',
    full_name: 'System Admin',
    email: 'admin@adoptly.com',
    street_address: 'Main Office HQ',
    city: 'Manila',
    role: 'admin',
    is_blocked: false,
    avatar_url: '/logo.jpg',
    created_at: '2025-01-01T00:00:00Z',
  }
];

export const MOCK_PETS: Pet[] = [
  {
    id: 'p-0001-milo',
    owner_id: 'u-0002-maria',
    name: 'Milo',
    species: 'dog',
    breed: 'Golden Retriever',
    age_months: 24,
    gender: 'male',
    description:
      'Milo is a friendly and energetic Golden Retriever who loves playing fetch and going on long walks. He is fully vaccinated, neutered, and great with kids. Looking for a loving home with a backyard where he can run around!',
    status: 'available',
    image_urls: ['/logo.jpg'],
    is_removed: false,
    created_at: '2025-08-01T10:00:00Z',
    owner: MOCK_PROFILES[0],
  },
  {
    id: 'p-0002-luna',
    owner_id: 'u-0003-james',
    name: 'Luna',
    species: 'cat',
    breed: 'Persian',
    age_months: 18,
    gender: 'female',
    description:
      'Luna is a gentle Persian cat with beautiful long fur. She loves napping on laps and is very affectionate. Litter-trained and spayed. Perfect for apartment living.',
    status: 'available',
    image_urls: ['/logo.jpg'],
    is_removed: false,
    created_at: '2025-08-03T14:00:00Z',
    owner: MOCK_PROFILES[1],
  },
  {
    id: 'p-0003-buddy',
    owner_id: 'u-0004-sofia',
    name: 'Buddy',
    species: 'dog',
    breed: 'Beagle',
    age_months: 12,
    gender: 'male',
    description:
      'Buddy is an adorable Beagle puppy with tons of energy. He is curious, playful, and loves exploring the outdoors. Currently undergoing basic training.',
    status: 'pending',
    image_urls: ['/logo.jpg'],
    is_removed: false,
    created_at: '2025-08-05T09:00:00Z',
    owner: MOCK_PROFILES[2],
  },
  {
    id: 'p-0004-cleo',
    owner_id: 'u-0002-maria',
    name: 'Cleo',
    species: 'cat',
    breed: 'Siamese',
    age_months: 36,
    gender: 'female',
    description:
      'Cleo is a talkative Siamese cat who will keep you entertained all day. She has striking blue eyes and a sleek coat. Fully vaccinated and very social.',
    status: 'available',
    image_urls: ['/logo.jpg'],
    is_removed: false,
    created_at: '2025-08-07T11:00:00Z',
    owner: MOCK_PROFILES[0],
  },
  {
    id: 'p-0005-kiwi',
    owner_id: 'u-0005-carlo',
    name: 'Kiwi',
    species: 'bird',
    breed: 'Cockatiel',
    age_months: 8,
    gender: 'male',
    description:
      'Kiwi is a cheerful cockatiel who loves to whistle tunes. He is hand-tamed and enjoys sitting on your shoulder. Comes with his cage and supplies.',
    status: 'available',
    image_urls: ['/logo.jpg'],
    is_removed: false,
    created_at: '2025-08-10T16:00:00Z',
    owner: MOCK_PROFILES[3],
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c-0001',
    pet_id: 'p-0001-milo',
    adopter_id: CURRENT_USER.id,
    owner_id: 'u-0002-maria',
    last_message_at: '2025-08-20T15:30:00Z',
    pet: MOCK_PETS[0],
    other_user: MOCK_PROFILES[0],
    last_message: {
      id: 'm-last-1',
      conversation_id: 'c-0001',
      sender_id: 'u-0002-maria',
      content: 'Yes, Milo is still available! When would you like to meet him?',
      is_read: false,
      created_at: '2025-08-20T15:30:00Z',
    },
    unread_count: 2,
  },
  {
    id: 'c-0002',
    pet_id: 'p-0002-luna',
    adopter_id: CURRENT_USER.id,
    owner_id: 'u-0003-james',
    last_message_at: '2025-08-19T20:15:00Z',
    pet: MOCK_PETS[1],
    other_user: MOCK_PROFILES[1],
    last_message: {
      id: 'm-last-2',
      conversation_id: 'c-0002',
      sender_id: CURRENT_USER.id,
      content: 'Thank you! I will come by this Saturday.',
      is_read: true,
      created_at: '2025-08-19T20:15:00Z',
    },
    unread_count: 0,
  },
];

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'm-0001',
    conversation_id: 'c-0001',
    sender_id: CURRENT_USER.id,
    content: 'Hi! I saw your listing for Milo. Is he still available?',
    is_read: true,
    created_at: '2025-08-20T14:00:00Z',
  },
  {
    id: 'm-0002',
    conversation_id: 'c-0001',
    sender_id: 'u-0002-maria',
    content: 'Hello! Yes, Milo is still looking for his forever home',
    is_read: true,
    created_at: '2025-08-20T14:05:00Z',
  },
  {
    id: 'm-0003',
    conversation_id: 'c-0001',
    sender_id: CURRENT_USER.id,
    content: 'That is great! I have a big backyard. Is he good with other dogs?',
    is_read: true,
    created_at: '2025-08-20T14:10:00Z',
  },
  {
    id: 'm-0004',
    conversation_id: 'c-0001',
    sender_id: 'u-0002-maria',
    content: 'Absolutely! He loves playing with other dogs at the park. He is very social and friendly.',
    is_read: true,
    created_at: '2025-08-20T14:15:00Z',
  },
];

export const MOCK_FAVORITE_IDS: string[] = ['p-0001-milo', 'p-0002-luna'];

export const MOCK_REPORTS: Report[] = [
  {
    id: 'r-0001',
    reporter_id: 'u-0003-james',
    reported_user_id: 'u-0002-maria',
    pet_id: 'p-0001-milo',
    reason: 'fake_listing',
    description: 'This listing uses pictures from a public search engine. The owner does not actually reside at the specified address.',
    status: 'pending',
    created_at: '2025-08-21T09:15:00Z',
    reporter: MOCK_PROFILES[1],
    reported_user: MOCK_PROFILES[0],
    pet: MOCK_PETS[0],
  },
  {
    id: 'r-0002',
    reporter_id: 'u-0004-sofia',
    reported_user_id: 'u-0005-carlo',
    pet_id: 'p-0005-kiwi',
    reason: 'scam',
    description: 'The user requested an advance payment transfer via bank link before showing the cockatiel.',
    status: 'investigating',
    created_at: '2025-08-22T14:30:00Z',
    reporter: MOCK_PROFILES[2],
    reported_user: MOCK_PROFILES[3],
    pet: MOCK_PETS[4],
  }
];

export function formatAge(months?: number): string {
  if (!months) return 'Unknown';
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} yr${years > 1 ? 's' : ''}`;
  return `${years} yr${years > 1 ? 's' : ''} ${rem} mo`;
}

export function speciesInitials(species: string): string {
  const map: Record<string, string> = {
    dog: 'DG',
    cat: 'CT',
    bird: 'BD',
    rabbit: 'RB',
    fish: 'FH',
    other: 'PT',
  };
  return map[species] ?? 'PT';
}
