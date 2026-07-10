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
  login: (email: string, password: string, remember?: boolean) => Promise<{ user: User | null; error?: string }>;
  loginWithOAuth: (provider: 'google' | 'facebook') => Promise<boolean>;
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
  portfolioImages: p.portfolio_images || [],
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

const DEFAULT_THEME = {
  backgroundColor: '#ffffff',
  textColor: '#000000',
  buttonColor: '#000000',
  fontFamily: 'Prompt',
  layout: 'minimal',
  enableGlassEffect: false
};

// สร้างแถวในตาราง public.users + profiles หากยังไม่มี
// (แอปใช้ตาราง users แยกจาก auth.users และไม่มี trigger สร้างอัตโนมัติ
//  จึงต้องสร้างเองทั้งตอนล็อกอินอีเมลและตอนล็อกอินผ่าน OAuth)
const ensureUserRecord = async (email: string, name?: string, photoUrl?: string) => {
  if (!email) return;

  const { data: existingUser } = await supabase
    .from('users').select('id').eq('email', email).maybeSingle();

  let userId = existingUser?.id;
  if (!existingUser) {
    const display = name || email.split('@')[0];
    const { data: inserted, error } = await supabase
      .from('users')
      .insert([{ email, name: display, photo_url: photoUrl || null, role: 'user', is_banned: false }])
      .select('id').single();
    if (error) { console.error('ensureUserRecord users error:', error); return; }
    userId = inserted.id;
  }

  if (!userId) return;

  const { data: existingProfile } = await supabase
    .from('profiles').select('id').eq('user_id', userId).maybeSingle();
  if (existingProfile) return;

  const base = (name || email.split('@')[0]).replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'user';
  const username = `${base}-${Math.random().toString(36).slice(2, 7)}`;
  const { error: pErr } = await supabase.from('profiles').insert([{
    user_id: userId,
    username,
    display_name: name || email.split('@')[0],
    photo_url: photoUrl || null,
    bio: '',
    show_on_explore: false,
    theme_config: DEFAULT_THEME,
    links: []
  }]);
  if (pErr) console.error('ensureUserRecord profiles error:', pErr);
};

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
      .maybeSingle();

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
      .maybeSingle();

    if (profileData) setProfile(mapProfile(profileData));
    return mapped;
  };

  // ===== Supabase Auth จริง =====
  const login = async (email: string, password: string, remember = false): Promise<{ user: User | null; error?: string }> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const msg = error.message || '';
        let friendly = 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
        if (/email not confirmed/i.test(msg) || (error as any).code === 'email_not_confirmed') {
          friendly = '📧 อีเมลนี้ยังไม่ได้ยืนยัน กรุณากดลิงก์ยืนยันในกล่องจดหมาย (หรือโฟลเดอร์ Junk/Spam) ก่อนเข้าใช้งาน';
        } else if (/invalid login credentials/i.test(msg)) {
          friendly = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
        } else if (/rate limit|too many/i.test(msg)) {
          friendly = 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่';
        } else if (msg) {
          friendly = msg;
        }
        console.error('Login error:', msg);
        return { user: null, error: friendly };
      }
      if (remember) localStorage.setItem('zeelink_remember', '1');
      // สร้างแถว users/profiles หากยังไม่มี (รองรับบัญชีที่สมัครก่อนมี trigger)
      await ensureUserRecord(email);
      const user = await loadUserByEmail(email);
      if (!user) {
        return { user: null, error: 'เข้าสู่ระบบสำเร็จ แต่โหลดข้อมูลผู้ใช้ไม่ได้ กรุณาลองใหม่อีกครั้ง' };
      }
      return { user };
    } catch (error: any) {
      console.error('Login error:', error);
      return { user: null, error: error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' };
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

      // ถ้าเปิด Confirm email → session จะเปล่า (ต้องยืนยันอีเมลก่อน)
      // ต้องเช็คก่อน: ถ้าไม่มี session ห้ามสร้างแถว เพราะจะรันในบทบาท anon และถูก RLS บล็อก
      if (!data.session) {
        return { user: null, needsConfirmation: true };
      }

      // มี session แล้ว (ล็อกอินสำเร็จ หรือเปิด auto-confirm) → สร้างแถว users + profiles ได้
      // สร้างแถว users + profiles ถ้ายังไม่มี (แอปใช้ตาราง users แยกต่างหากจาก auth.users)
      await ensureUserRecord(email, name);

      const user = await loadUserByEmail(email);
      return { user, needsConfirmation: false };
    } catch (error) {
      console.error('Register error:', error);
      return { user: null };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOAuth = async (provider: 'google' | 'facebook'): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/dashboard` }
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('OAuth error:', error);
      return false;
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
          portfolio_images: newProfile.portfolioImages || [],
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
      // ใช้ RPC vote_question (SECURITY DEFINER) → ไม่ติด RLS บน update
      // เพิ่มโหวต + ผนวก auth.uid() ให้คนโหวต (ไม่อ้าง user_id)
      const { error: updateError } = await supabase.rpc('vote_question', { q_id: questionId });
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
        let u = await loadUserByEmail(session.user.email);
        // ผู้ใช้ที่ล็อกอินผ่าน OAuth จะยังไม่มีแถวในตาราง users → สร้างให้อัตโนมัติ
        if (!u) {
          const meta = session.user.user_metadata || {};
          await ensureUserRecord(session.user.email, meta.full_name || meta.name, meta.avatar_url || meta.picture);
          u = await loadUserByEmail(session.user.email);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user, profile, usersList, isLoading, activePopup, popups, questions,
    login, loginWithOAuth, register, resetPassword, logout, updateProfile, toggleLike, deleteUser, banUser,
    simulateUsers, backupData, createPopup, togglePopup, deletePopup,
    closeActivePopup, addQuestion, voteQuestion, askAiStylist
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
