export type Role = 'user' | 'admin';

export interface ThemeConfig {
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  fontFamily: string;
  layout: 'minimal' | 'modern' | 'creative' | 'glass'; // Added glass
  backgroundImageUrl?: string; // Wallpaper
  enableGlassEffect?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl: string;
  role: Role;
  isBanned: boolean;
  rememberToken?: string;
  lastLogin?: string;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  icon?: string;
  clicks: number;
  isActive: boolean;
}

export interface Profile {
  id: string;
  userId: string;
  uid: string;
  username: string;
  displayName: string;
  photoUrl: string;
  bio: string;
  tags: string[];
  
  // Location (Detailed)
  region: string;
  province: string;
  district: string; // Type in
  subDistrict: string; // Type in
  postalCode: string; // Auto
  
  // Features
  showOnExplore: boolean;
  likes: number;
  views: number; // New: Visitor count
  themeConfig: ThemeConfig;
  
  links: Link[];
  createdAt: string;
  updatedAt: string;
}

export type QuestionStatus = 'approved' | 'rejected' | 'pending';

export interface Question {
  id: string;
  userId: string;
  username: string;
  text: string;
  votes: number;
  createdAt: string; 
  votedUserIds: string[];
  status: QuestionStatus;
}

// Admin System Types
export interface SystemPopup {
  id: string;
  title: string;
  imageUrl?: string;
  content?: string; // HTML or Text
  linkUrl?: string;
  isActive: boolean;
  frequency: 'always' | 'once_daily' | 'once_ever';
  startDate?: string;
  endDate?: string;
}

// Location Helpers
export interface Province {
  id: number;
  name: string;
  zipCodeBase: string; // For auto-generating zip
  lat: number;
  lng: number;
}

export interface Region {
  id: number;
  name: string;
  provinces: Province[];
}

