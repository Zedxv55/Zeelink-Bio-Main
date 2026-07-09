import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Profile, SystemPopup, Question, Role } from '../types';
import { BANNED_WORDS, INITIAL_QUESTIONS } from '../constants';
import { supabase } from './supabaseClient';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  usersList: Profile[];
  isLoading: boolean;
  activePopup: SystemPopup | null;
  popups: SystemPopup[];
  questions: Question[];

  // Methods
  login: (email: string, password: string, remember?: boolean) => Promise<User | null>;
  register: (email: string, password: string, name: string) => Promise<{ user: User | null; needsConfirmation?: boolean }>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (profile: Profile) => Promise<void>;
  toggleLike: (profileId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  banUser: (userId: string) => Promise<void>;
  simulateUsers: () => void;
  backupData: () => Promise<void>;
  createPopup: (popup: SystemPopup) => Promise<void>;
  togglePopup: (popupId: string) => Promise<void>;
  deletePopup: (popupId: string) => Promise<void>;
  closeActivePopup: () => void;
  addQuestion: (text: string) => Promise<Question>;
  voteQuestion: (questionId: string) => Promise<void>;
  askAiStylist: () => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// โหลด user + profile จากอีเมล (ใช้อีเมลเป็น key เพราะตรงกับ auth.users)
const mapUser = (u: any): User => ({
  id: u.id,
  email: u.email,
  name: u.name,
  photoUrl: u.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || u.email)}&background=random`,
  role: u.role as Role,
  isBanned: u.is_banned
});

const mapProfile = (p: any): Profile => ({
  id: p.id,
  userId: p.user_id,
  uid: p.uid || '',
  username: p.username,
  displayName: p.display_name,
  photoUrl: p.photo_url,
  bio: p.bio,
  tags: p.tags || [],
  region: p.region,
  province: p.province,
  district: p.district,
  subDistrict: p.sub_district,
  postalCode: p.postal_code,
  showOnExplore: p.show_on_explore,
  likes: p.likes || 0,
  views: p.views || 0,
  themeConfig: p.theme_config,
  links: p.links || [],
  createdAt: p.created_at,
  updatedAt: p.updated_at
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [usersList, setUsersList] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePopup, setActivePopup] = useState<SystemPopup | null>(null);
  const [popups, setPopups] = useState<SystemPopup[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  // โหลด user+profile จากอีเมล (RLS อนุญาต authenticated อ่านแถวตัวเอง)
  const loadUserByEmail = async (email: string): Promise<User | null> => {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !userData) {
      setUser(null);
      setProfile(null);
      return null;
    }

    const mapped = mapUser(userData);
    setUser(mapped);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userData.id)
      .single();

    if (profileData) setProfile(mapProfile(profileData));
    return mapped;
  };

  // ===== Supabase Auth จริง =====
  const login = async (email: string, password: string, remember = false): Promise<User | null> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (remember) localStorage.setItem('zeelink_remember', '1');
      // onAuthStateChange + loadUserByEmail จะโหลด state
      return await loadUserByEmail(email);
    } catch (error) {
      console.error('Login error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, full_name: name } }
      });
      if (error) throw error;

      // อีเมลซ้ำ → Supabase คืน user โดยไม่มี identities
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error('อีเมลนี้ถูกใช้งานแล้ว');
      }

      // รอให้ trigger/table sync เล็กน้อย แล้วสร้าง profile ถ้ายังไม่มี
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userData) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', userData.id)
          .maybeSingle();

        if (!existing) {
          await supabase.from('profiles').insert([{
            user_id: userData.id,
            username: email.split('@')[0],
            display_name: name,
            photo_url: userData.photo_url,
            bio: '',
            show_on_explore: false,
            theme_config: {
              backgroundColor: '#ffffff',
              textColor: '#000000',
              buttonColor: '#000000',
              fontFamily: 'Prompt',
              layout: 'minimal',
              enableGlassEffect: false
            },
            links: []
          }]);
        }
      }

      // ถ้ามสีอีเมลยืนยัน (Confirm email เปิด) → session จะเปล่า
      if (!data.session) {
        return { user: null, needsConfirmation: true };
      }

      const user = await loadUserByEmail(email);
      return { user, needsConfirmation: false };
    } catch (error) {
      console.error('Register error:', error);
      return { user: null };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    localStorage.removeItem('zeelink_remember');
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  };

  const updateProfile = async (newProfile: Profile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: newProfile.id,
          user_id: newProfile.userId,
          username: newProfile.username,
          display_name: newProfile.displayName,
          photo_url: newProfile.photoUrl,
          bio: newProfile.bio,
          region: newProfile.region,
          province: newProfile.province,
          district: newProfile.district,
          sub_district: newProfile.subDistrict,
          postal_code: newProfile.postalCode,
          show_on_explore: newProfile.showOnExplore,
          theme_config: newProfile.themeConfig,
          links: newProfile.links,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setProfile(newProfile);
      setUsersList(prev => {
        const index = prev.findIndex(p => p.id === newProfile.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = newProfile;
          return updated;
        }
        return [...prev, newProfile];
      });
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  const toggleLike = async (profileId: string) => {
    try {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('likes')
        .eq('id', profileId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ likes: (profile.likes || 0) + 1 })
        .eq('id', profileId);

      if (updateError) throw updateError;

      setUsersList(prev => prev.map(p =>
        p.id === profileId ? { ...p, likes: (p.likes || 0) + 1 } : p
      ));

      if (profile?.id === profileId) {
        setProfile(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null);
      }
    } catch (error) {
      console.error('Toggle like error:', error);
    }
  };

  // Admin functions
  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) throw error;
      setUsersList(prev => prev.filter(p => p.userId !== userId));
    } catch (error) {
      console.error('Delete user error:', error);
    }
  };

  const banUser = async (userId: string) => {
    try {
      const { error } = await supabase.from('users').update({ is_banned: true }).eq('id', userId);
      if (error) throw error;
      setUsersList(prev => prev.map(p => p.userId === userId ? { ...p, isBanned: true } : p));
    } catch (error) {
      console.error('Ban user error:', error);
    }
  };

  const simulateUsers = () => {
    const mockUsers: Profile[] = [
      {
        id: '2', userId: '2', uid: 'USER001', username: 'somchai',
        displayName: 'สมชาย ใจดี', photoUrl: 'https://picsum.photos/201',
        bio: 'โปรแกรมเมอร์ไทย 🇹🇭', tags: ['developer', 'bangkok'],
        region: 'ภาคกลาง', province: 'กรุงเทพมหานคร', district: 'จตุจักร',
        subDistrict: 'ลาดยาว', postalCode: '10900', showOnExplore: true,
        likes: 45, views: 120,
        themeConfig: { backgroundColor: '#1e40af', textColor: '#ffffff', buttonColor: '#f59e0b', fontFamily: 'Kanit', layout: 'modern', enableGlassEffect: false },
        links: [{ id: '1', title: 'GitHub', url: 'https://github.com', clicks: 0, isActive: true }],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      },
    ];
    setUsersList(prev => [...prev, ...mockUsers]);
  };

  const backupData = async () => {
    try {
      const data = { users: usersList, questions, popups, timestamp: new Date().toISOString() };
      const { error } = await supabase.storage
        .from('backups')
        .upload(`backup-${Date.now()}.json`, JSON.stringify(data, null, 2));
      if (error) throw error;
      alert('✅ บันทึกข้อมูลสำเร็จใน Supabase Storage');
    } catch (error) {
      console.error('Backup error:', error);
      const data = { users: usersList, questions, popups, timestamp: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zeelink-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const closeActivePopup = () => setActivePopup(null);

  const createPopup = async (popup: SystemPopup) => {
    try {
      const { data, error } = await supabase.from('popups').insert([{
        title: popup.title, image_url: popup.imageUrl, link_url: popup.linkUrl,
        is_active: popup.isActive, frequency: popup.frequency
      }]).select().single();
      if (error) throw error;
      const newPopup = { ...popup, id: data.id };
      setPopups(prev => [...prev, newPopup]);
      setActivePopup(newPopup);
    } catch (error) {
      console.error('Create popup error:', error);
    }
  };

  const togglePopup = async (popupId: string) => {
    try {
      const popup = popups.find(p => p.id === popupId);
      if (!popup) return;
      const { error } = await supabase.from('popups').update({ is_active: !popup.isActive }).eq('id', popupId);
      if (error) throw error;
      setPopups(prev => prev.map(p => p.id === popupId ? { ...p, isActive: !p.isActive } : p));
    } catch (error) {
      console.error('Toggle popup error:', error);
    }
  };

  const deletePopup = async (popupId: string) => {
    try {
      const { error } = await supabase.from('popups').delete().eq('id', popupId);
      if (error) throw error;
      setPopups(prev => prev.filter(p => p.id !== popupId));
    } catch (error) {
      console.error('Delete popup error:', error);
    }
  };

  const addQuestion = async (text: string): Promise<Question> => {
    try {
      const hasBannedWord = BANNED_WORDS.some(word => text.toLowerCase().includes(word.toLowerCase()));
      const newQuestion = {
        user_id: user?.id || 'anonymous',
        username: user?.name || 'anonymous',
        text, votes: 0, voted_user_ids: [],
        status: hasBannedWord ? 'rejected' : 'pending'
      };
      const { data, error } = await supabase.from('questions').insert([newQuestion]).select().single();
      if (error) throw error;
      const question: Question = {
        id: data.id, userId: data.user_id, username: data.username, text: data.text,
        votes: data.votes, createdAt: data.created_at, votedUserIds: data.voted_user_ids || [],
        status: data.status as QuestionStatus
      };
      setQuestions(prev => [...prev, question]);
      return question;
    } catch (error) {
      console.error('Add question error:', error);
      const newQuestion: Question = {
        id: Date.now().toString(), userId: user?.id || 'anonymous', username: user?.name || 'anonymous',
        text, votes: 0, createdAt: new Date().toISOString(), votedUserIds: [],
        status: hasBannedWord ? 'rejected' : 'approved'
      };
      setQuestions(prev => [...prev, newQuestion]);
      return newQuestion;
    }
  };

  const voteQuestion = async (questionId: string) => {
    if (!user) return;
    try {
      const { data: question, error: fetchError } = await supabase
        .from('questions').select('votes, voted_user_ids').eq('id', questionId).single();
      if (fetchError) throw fetchError;
      const votedUserIds = question.voted_user_ids || [];
      if (votedUserIds.includes(user.id)) return;
      const { error: updateError } = await supabase.from('questions').update({
        votes: (question.votes || 0) + 1,
        voted_user_ids: [...votedUserIds, user.id]
      }).eq('id', questionId);
      if (updateError) throw updateError;
      setQuestions(prev => prev.map(q =>
        q.id === questionId && !q.votedUserIds.includes(user.id)
          ? { ...q, votes: q.votes + 1, votedUserIds: [...q.votedUserIds, user.id] }
          : q
      ));
    } catch (error) {
      console.error('Vote question error:', error);
      setQuestions(prev => prev.map(q =>
        q.id === questionId && !q.votedUserIds.includes(user.id)
          ? { ...q, votes: q.votes + 1, votedUserIds: [...q.votedUserIds, user.id] }
          : q
      ));
    }
  };

  const askAiStylist = () => {
    const presets = [
      { backgroundColor: '#0f172a', textColor: '#38bdf8', buttonColor: '#ec4899', fontFamily: 'Chakra Petch', layout: 'glass' as const, enableGlassEffect: true },
      { backgroundColor: '#f8fafc', textColor: '#334155', buttonColor: '#000000', fontFamily: 'Prompt', layout: 'minimal' as const, enableGlassEffect: false },
      { backgroundColor: '#fff1f2', textColor: '#881337', buttonColor: '#fda4af', fontFamily: 'Mitr', layout: 'creative' as const, enableGlassEffect: true },
    ];
    return presets[Math.floor(Math.random() * presets.length)];
  };

  // Initialize: sync auth session + load public data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        // 1. โหลด session ปัจจุบัน (จำรหัสผ่าน)
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser?.email) await loadUserByEmail(authUser.email);

        // 2. Users list (anon อ่านได้)
        const { data: usersData, error: usersError } = await supabase
          .from('profiles').select('*').eq('show_on_explore', true);
        if (!usersError && usersData) {
          setUsersList(usersData.map(mapProfile));
        }

        // 3. Questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions').select('*').eq('status', 'approved').order('votes', { ascending: false });
        if (!questionsError && questionsData) {
          setQuestions(questionsData.map(q => ({
            id: q.id, userId: q.user_id, username: q.username, text: q.text,
            votes: q.votes, createdAt: q.created_at, votedUserIds: q.voted_user_ids || [],
            status: q.status as QuestionStatus
          })));
        } else {
          setQuestions(INITIAL_QUESTIONS);
        }

        // 4. Popups
        const { data: popupsData, error: popupsError } = await supabase
          .from('popups').select('*').eq('is_active', true);
        if (!popupsError && popupsData) {
          const mapped = popupsData.map(p => ({
            id: p.id, title: p.title, imageUrl: p.image_url, linkUrl: p.link_url,
            isActive: p.is_active, frequency: p.frequency as any
          }));
          setPopups(mapped);
          if (mapped.length > 0) setActivePopup(mapped[0]);
        } else {
          const initialPopup: SystemPopup = {
            id: '1', title: '🎉 ยินดีต้อนรับสู่ Zeelink!',
            imageUrl: '', linkUrl: '/explore', isActive: true, frequency: 'once_daily'
          };
          setActivePopup(initialPopup);
          setPopups([initialPopup]);
        }

        if (usersList.length === 0) simulateUsers();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    // ซิงค์ state เมื่อ login/logout ระหว่างใช้งาน
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user?.email) {
        await loadUserByEmail(session.user.email);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user, profile, usersList, isLoading, activePopup, popups, questions,
    login, register, resetPassword, logout, updateProfile, toggleLike, deleteUser, banUser,
    simulateUsers, backupData, createPopup, togglePopup, deletePopup,
    closeActivePopup, addQuestion, voteQuestion, askAiStylist
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
