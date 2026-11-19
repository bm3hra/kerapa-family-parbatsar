export type Language = 'en' | 'hi';

export type UserRole = 'member' | 'admin';

export interface UserAccount {
  uid: string;
  displayName: string;
  role: UserRole;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FamilyBranch {
  id: string;
  name: string;
  nameHi: string;
  patriarchName?: string;
  patriarchNameHi?: string;
  originPlace?: string;
  description?: string;
  descriptionHi?: string;
  order: number;
  isDemoData: boolean;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FamilyMember {
  id: string;
  fullName: string;
  fullNameHi: string;
  gender: 'male' | 'female' | 'other';
  generation: number;
  branchId: string;
  fatherId?: string;
  fatherName?: string;
  motherId?: string;
  motherName?: string;
  spouseId?: string;
  spouseName?: string;
  childrenNames?: string[];
  birthYear?: string;
  deathYear?: string;
  isLiving: boolean;
  isMinor: boolean;
  education?: string;
  profession?: string;
  city?: string;
  state?: string;
  country?: string;
  nativeVillage: string;
  bio?: string;
  bioHi?: string;
  photoUrl?: string;
  visibility: 'public' | 'family';
  status: 'pending' | 'approved';
  isVerified: boolean;
  isDemoData: boolean;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MemberPrivateContact {
  phone?: string;
  email?: string;
  exactBirthDate?: string;
  privateNotes?: string;
  consentGiven: boolean;
  ownerUid: string;
  updatedAt?: unknown;
}

export interface HeritageEntry {
  id: string;
  era: string;
  title: string;
  titleHi: string;
  body: string;
  bodyHi: string;
  verified: boolean;
}

export interface HeritageContent {
  id: string;
  sectionKey: 'about' | 'history' | 'gotra' | 'parbatsar';
  title: string;
  titleHi: string;
  subtitle?: string;
  subtitleHi?: string;
  summary?: string;
  summaryHi?: string;
  gotraName?: string;
  kuldevtaName?: string;
  kuldeviName?: string;
  entries?: HeritageEntry[];
  isVerified: boolean;
  isDemoData: boolean;
  updatedBy: string;
  updatedAt?: unknown;
}

export type MediaAlbum =
  | 'ancestors'
  | 'weddings'
  | 'festivals'
  | 'gatherings'
  | 'childhood'
  | 'documents'
  | 'functions';

export interface MediaItem {
  id: string;
  mediaType: 'photo' | 'video';
  album: MediaAlbum;
  title: string;
  titleHi: string;
  caption?: string;
  captionHi?: string;
  url: string;
  dateLabel?: string;
  taggedMemberNames?: string[];
  consentVerified: boolean;
  visibility: 'public' | 'family';
  status: 'pending' | 'approved';
  isDemoData: boolean;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type EventCategory =
  | 'birthday'
  | 'wedding'
  | 'anniversary'
  | 'reunion'
  | 'ceremony'
  | 'condolence'
  | 'upcoming';

export interface FamilyEvent {
  id: string;
  category: EventCategory;
  title: string;
  titleHi: string;
  description?: string;
  descriptionHi?: string;
  eventDate: string;
  location?: string;
  visibility: 'public' | 'family';
  status: 'pending' | 'approved';
  isDemoData: boolean;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface TributeItem {
  id: string;
  honoreeName: string;
  honoreeNameHi: string;
  yearsLabel?: string;
  authorName: string;
  relationship?: string;
  message: string;
  messageHi?: string;
  status: 'pending' | 'approved';
  isDemoData: boolean;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ContactInquiry {
  id: string;
  senderName: string;
  senderCity?: string;
  subject: string;
  message: string;
  createdBy: string;
  createdAt?: unknown;
}

export type CustomPageNavGroup = 'lineage' | 'chronicle' | 'memories' | 'custom';

export interface CustomPageSection {
  id: string;
  heading: string;
  headingHi: string;
  body: string;
  bodyHi: string;
  imageUrl?: string;
}

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  titleHi: string;
  subtitle?: string;
  subtitleHi?: string;
  kicker?: string;
  kickerHi?: string;
  summary?: string;
  summaryHi?: string;
  heroImageUrl?: string;
  videoUrl?: string;
  videoTitle?: string;
  galleryUrls?: string[];
  sections?: CustomPageSection[];
  navGroup: CustomPageNavGroup;
  showInNav: boolean;
  order: number;
  visibility: 'public' | 'family';
  status: 'draft' | 'published';
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

