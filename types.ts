export type Role = 'user' | 'admin';

export interface ThemeConfig {
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  fontFamily: string;
  layout: 'minimal' | 'modern' | 'creative';
}

export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl: string;
  role: Role;
  isBanned: boolean;
  rememberToken?: string;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  icon?: string;
  clicks: number;
}

export interface Profile {
  id: string;
  userId: string;
  uid: string; // 022026X or 0X
  username: string;
  displayName: string;
  photoUrl: string;
  bio: string;
  tags: string[];
  
  // Location
  region: string;
  province: string;
  district: string;
  subDistrict: string;
  postalCode: string;
  
  // Features
  showOnExplore: boolean;
  likes: number;
  themeConfig: ThemeConfig;
  
  links: Link[];
  createdAt: string;
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

export interface SubDistrict {
  id: number;
  name: string;
  zip: string;
}

export interface District {
  id: number;
  name: string;
  subDistricts: SubDistrict[];
}

export interface Province {
  id: number;
  name: string;
  lat: number;
  lng: number;
  districts: District[];
}

export interface Region {
  id: number;
  name: string;
  provinces: Province[];
}
