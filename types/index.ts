/**
 * Adoptly Web – Core Data Types
 *
 * Emojis are strictly omitted.
 */

export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  street_address: string;
  city: string;
  postal_code?: string;
  role: UserRole;
  is_blocked: boolean;
  avatar_url?: string;
  created_at: string;
}

export type PetStatus = 'available' | 'pending' | 'adopted';
export type PetSpecies = 'dog' | 'cat' | 'bird' | 'rabbit' | 'fish' | 'other';
export type PetGender = 'male' | 'female';

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  age_months?: number;
  gender?: PetGender;
  description?: string;
  status: PetStatus;
  image_urls: string[];
  is_removed: boolean;
  created_at: string;
  owner?: Profile;
}

export interface Conversation {
  id: string;
  pet_id: string;
  adopter_id: string;
  owner_id: string;
  last_message_at: string;
  pet?: Pet;
  other_user?: Profile;
  last_message?: ChatMessage;
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  pet_id?: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  created_at: string;
  reporter?: Profile;
  reported_user?: Profile;
  pet?: Pet;
}

export type ReportReason =
  | 'scam'
  | 'fake_listing'
  | 'harassment'
  | 'illegal_trade'
  | 'animal_abuse'
  | 'other';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'scam', label: 'Scam / Fraud' },
  { value: 'fake_listing', label: 'Fake Listing' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'illegal_trade', label: 'Illegal Pet Trade' },
  { value: 'animal_abuse', label: 'Animal Abuse' },
  { value: 'other', label: 'Other' },
];
