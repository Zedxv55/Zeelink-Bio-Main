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

  // Portfolio Gallery (multi-image support)
  // DB scale supports up to 100 images; regular users capped at 15 (HARD_CAP)
  portfolioImages?: string[];
  
  // Location (Detailed)
  region: string;
  province: string;
  district: string; // Type in
  subDistrict: string; // Type in
  postalCode: string; // Auto
  lat: number; // พิกัดละติจูด (แชร์ตำแหน่งเรียลไทม์)
  lng: number; // พิกัดลองจิจูด
  
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

// ===== Admin / Presence =====
// ข้อมูลผู้ใช้ที่แอดมินดู (รวม users + profiles)
export interface AdminUserView {
  id: string;          // profile.id
  userId: string;      // users.id (เอาไปใช้ลบ/แบน/เปลี่ยนสิทธิ์)
  email: string;
  name: string;
  displayName: string;
  photoUrl: string;
  username: string;
  role: Role;
  isBanned: boolean;
  showOnExplore: boolean;
  lastSeen?: string | null;   // จาก profiles.last_seen_at (ถ้ารัน SQL แล้ว)
  createdAt?: string;
}

// สถานะออนไลน์แบบ realtime (Supabase Realtime Presence)
export interface OnlineUser {
  user_id: string;
  email: string;
  name: string;
  photoUrl: string;
  online_at: string;
}

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

// ===== Feed (โพสต์แบบ Facebook) =====
export type PostMediaType = 'none' | 'image' | 'video';

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  displayName: string;
  photoUrl: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  photoUrl: string;
  text: string;
  mediaUrl?: string;
  mediaType: PostMediaType;
  likes: number;
  likedByMe: boolean;
  comments: PostComment[];
  createdAt: string;
}

