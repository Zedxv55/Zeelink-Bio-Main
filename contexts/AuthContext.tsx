import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Profile, SystemPopup, Question, Role } from '../types'; // ← ต้อง import Role
import { BANNED_WORDS, INITIAL_QUESTIONS } from '../constants';
import { supabase } from '../supabaseClient'; // ← ต้อง import supabase

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  usersList: Profile[];
  isLoading: boolean;
  activePopup: SystemPopup | null;
  popups: SystemPopup[];
  questions: Question[];
  
  // Methods
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Profile) => void;
  toggleLike: (profileId: string) => void;
  deleteUser: (userId: string) => void;
  banUser: (userId: string) => void;
  simulateUsers: () => void;
  backupData: () => void;
  createPopup: (popup: SystemPopup) => void;
  togglePopup: (popupId: string) => void;
  deletePopup: (popupId: string) => void;
  closeActivePopup: () => void;
  addQuestion: (text: string) => Promise<Question>;
  voteQuestion: (questionId: string) => void;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [usersList, setUsersList] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePopup, setActivePopup] = useState<SystemPopup | null>(null);
  const [popups, setPopups] = useState<SystemPopup[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Mock login function (ยังใช้ mock อยู่ก่อน)
  const login = async (email: string, password: string, remember = false): Promise<boolean> => {
    setIsLoading(true);
    try {
      // ตรวจสอบใน Supabase ก่อน
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      // ถ้ายังไม่มี user ในระบบ ให้สร้าง mock (สำหรับ development)
      if (userError || !userData) {
        // Mock user data สำหรับ development
        const mockUser: User = {
          id: '1',
          email,
          name: email.split('@')[0],
          photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random`,
          role: email === 'zbcd1053@gmail.com' ? 'admin' : 'user',
          isBanned: false
        };
        
        setUser(mockUser);
        
        // Mock profile for admin
        if (email === 'zbcd1053@gmail.com') {
          const adminProfile: Profile = {
            id: 'admin1',
            userId: '1',
            uid: 'ADMIN001',
            username: 'admin',
            displayName: 'Zeelink Admin',
            photoUrl: 'https://picsum.photos/200',
            bio: 'ผู้ดูแลระบบ Zeelink',
            tags: ['admin', 'developer'],
            region: 'ภาคกลาง',
            province: 'กรุงเทพมหานคร',
            district: 'ปทุมวัน',
            subDistrict: 'ลุมพินี',
            postalCode: '10330',
            showOnExplore: true,
            likes: 999,
            views: 5000,
            themeConfig: {
              backgroundColor: '#0f172a',
              textColor: '#ffffff',
              buttonColor: '#3b82f6',
              fontFamily: 'Prompt',
              layout: 'modern',
              enableGlassEffect: true
            },
            links: [
              { id: '1', title: 'Admin Panel', url: '/admin', clicks: 0, isActive: true }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setProfile(adminProfile);
        }
      } else {
        // มี user ใน Supabase แล้ว
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          photoUrl: userData.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
          role: userData.role as Role,
          isBanned: userData.is_banned
        });

        // ดึง profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userData.id)
          .single();

        if (profileData) {
          setProfile({
            id: profileData.id,
            userId: profileData.user_id,
            uid: profileData.uid || '',
            username: profileData.username,
            displayName: profileData.display_name,
            photoUrl: profileData.photo_url,
            bio: profileData.bio,
            tags: profileData.tags || [],
            region: profileData.region,
            province: profileData.province,
            district: profileData.district,
            subDistrict: profileData.sub_district,
            postalCode: profileData.postal_code,
            showOnExplore: profileData.show_on_explore,
            likes: profileData.likes || 0,
            views: profileData.views || 0,
            themeConfig: profileData.theme_config,
            links: profileData.links || [],
            createdAt: profileData.created_at,
            updatedAt: profileData.updated_at
          });
        }
      }
      
      if (remember) {
        localStorage.setItem('zeelink_user', JSON.stringify({
          email,
          name: email.split('@')[0]
        }));
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // สร้าง user ใน Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            email,
            name,
            photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            role: 'user'
          }
        ])
        .select()
        .single();

      if (userError) throw userError;

      // สร้าง profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
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
          }
        ])
        .select()
        .single();

      if (profileError) throw profileError;

      // อัพเดท state
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        photoUrl: userData.photo_url,
        role: userData.role as Role,
        isBanned: false
      });

      setProfile({
        id: profileData.id,
        userId: profileData.user_id,
        uid: profileData.uid || '',
        username: profileData.username,
        displayName: profileData.display_name,
        photoUrl: profileData.photo_url,
        bio: profileData.bio,
        tags: profileData.tags || [],
        region: profileData.region,
        province: profileData.province,
        district: profileData.district,
        subDistrict: profileData.sub_district,
        postalCode: profileData.postal_code,
        showOnExplore: profileData.show_on_explore,
        likes: profileData.likes || 0,
        views: profileData.views || 0,
        themeConfig: profileData.theme_config,
        links: profileData.links || [],
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at
      });

      localStorage.setItem('zeelink_user', JSON.stringify({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        photoUrl: userData.photo_url,
        role: userData.role
      }));

      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('zeelink_user');
  };

  const updateProfile = async (newProfile: Profile) => {
    try {
      // บันทึกลง Supabase
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

      // อัพเดท state
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
      // ดึงข้อมูลปัจจุบันจาก Supabase
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('likes')
        .eq('id', profileId)
        .single();

      if (fetchError) throw fetchError;

      // อัพเดท likes ใน Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ likes: (profile.likes || 0) + 1 })
        .eq('id', profileId);

      if (updateError) throw updateError;

      // อัพเดท state
      setUsersList(prev => prev.map(p => {
        if (p.id === profileId) {
          return { ...p, likes: (p.likes || 0) + 1 };
        }
        return p;
      }));
      
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
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      setUsersList(prev => prev.filter(p => p.userId !== userId));
    } catch (error) {
      console.error('Delete user error:', error);
    }
  };

  const banUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_banned: true })
        .eq('id', userId);

      if (error) throw error;
      
      setUsersList(prev => prev.map(p => 
        p.userId === userId ? { ...p, isBanned: true } : p
      ));
    } catch (error) {
      console.error('Ban user error:', error);
    }
  };

  const simulateUsers = () => {
    const mockUsers: Profile[] = [
      {
        id: '2',
        userId: '2',
        uid: 'USER001',
        username: 'somchai',
        displayName: 'สมชาย ใจดี',
        photoUrl: 'https://picsum.photos/201',
        bio: 'โปรแกรมเมอร์ไทย 🇹🇭',
        tags: ['developer', 'bangkok'],
        region: 'ภาคกลาง',
        province: 'กรุงเทพมหานคร',
        district: 'จตุจักร',
        subDistrict: 'ลาดยาว',
        postalCode: '10900',
        showOnExplore: true,
        likes: 45,
        views: 120,
        themeConfig: {
          backgroundColor: '#1e40af',
          textColor: '#ffffff',
          buttonColor: '#f59e0b',
          fontFamily: 'Kanit',
          layout: 'modern',
          enableGlassEffect: false
        },
        links: [
          { id: '1', title: 'GitHub', url: 'https://github.com', clicks: 0, isActive: true }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
    ];
    
    setUsersList(prev => [...prev, ...mockUsers]);
  };

  const backupData = async () => {
    try {
      const data = {
        users: usersList,
        questions,
        popups,
        timestamp: new Date().toISOString()
      };
      
      // บันทึกลง Supabase Storage
      const { error } = await supabase.storage
        .from('backups')
        .upload(`backup-${Date.now()}.json`, JSON.stringify(data, null, 2));
        
      if (error) throw error;
      
      alert('✅ บันทึกข้อมูลสำเร็จใน Supabase Storage');
    } catch (error) {
      console.error('Backup error:', error);
      
      // Fallback: ดาวน์โหลดแบบเดิม
      const data = {
        users: usersList,
        questions,
        popups,
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zeelink-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const closeActivePopup = () => {
    setActivePopup(null);
  };

  const createPopup = async (popup: SystemPopup) => {
    try {
      const { data, error } = await supabase
        .from('popups')
        .insert([{
          title: popup.title,
          image_url: popup.imageUrl,
          link_url: popup.linkUrl,
          is_active: popup.isActive,
          frequency: popup.frequency
        }])
        .select()
        .single();

      if (error) throw error;

      const newPopup = {
        ...popup,
        id: data.id
      };

      setPopups(prev => [...prev, newPopup]);
      setActivePopup(newPopup);
    } catch (error) {
      console.error('Create popup error:', error);
    }
  };

  const togglePopup = async (popupId: string) => {
    try {
      // หา popup ปัจจุบัน
      const popup = popups.find(p => p.id === popupId);
      if (!popup) return;

      const { error } = await supabase
        .from('popups')
        .update({ is_active: !popup.isActive })
        .eq('id', popupId);

      if (error) throw error;

      setPopups(prev => prev.map(p => 
        p.id === popupId ? { ...p, isActive: !p.isActive } : p
      ));
    } catch (error) {
      console.error('Toggle popup error:', error);
    }
  };

  const deletePopup = async (popupId: string) => {
    try {
      const { error } = await supabase
        .from('popups')
        .delete()
        .eq('id', popupId);

      if (error) throw error;

      setPopups(prev => prev.filter(p => p.id !== popupId));
    } catch (error) {
      console.error('Delete popup error:', error);
    }
  };

  const addQuestion = async (text: string): Promise<Question> => {
    try {
      // Check for banned words
      const hasBannedWord = BANNED_WORDS.some(word => 
        text.toLowerCase().includes(word.toLowerCase())
      );

      const newQuestion = {
        user_id: user?.id || 'anonymous',
        username: user?.name || 'anonymous',
        text,
        votes: 0,
        voted_user_ids: [],
        status: hasBannedWord ? 'rejected' : 'pending'
      };

      const { data, error } = await supabase
        .from('questions')
        .insert([newQuestion])
        .select()
        .single();

      if (error) throw error;

      const question: Question = {
        id: data.id,
        userId: data.user_id,
        username: data.username,
        text: data.text,
        votes: data.votes,
        createdAt: data.created_at,
        votedUserIds: data.voted_user_ids || [],
        status: data.status as QuestionStatus
      };

      setQuestions(prev => [...prev, question]);
      return question;
    } catch (error) {
      console.error('Add question error:', error);
      
      // Fallback: ใช้ mock data
      const newQuestion: Question = {
        id: Date.now().toString(),
        userId: user?.id || 'anonymous',
        username: user?.name || 'anonymous',
        text,
        votes: 0,
        createdAt: new Date().toISOString(),
        votedUserIds: [],
        status: hasBannedWord ? 'rejected' : 'approved'
      };
      
      setQuestions(prev => [...prev, newQuestion]);
      return newQuestion;
    }
  };

  const voteQuestion = async (questionId: string) => {
    if (!user) return;

    try {
      // ดึงข้อมูลปัจจุบันจาก Supabase
      const { data: question, error: fetchError } = await supabase
        .from('questions')
        .select('votes, voted_user_ids')
        .eq('id', questionId)
        .single();

      if (fetchError) throw fetchError;

      const votedUserIds = question.voted_user_ids || [];
      
      // ตรวจสอบว่าเคยโหวตแล้วหรือยัง
      if (votedUserIds.includes(user.id)) return;

      // อัพเดทใน Supabase
      const { error: updateError } = await supabase
        .from('questions')
        .update({
          votes: (question.votes || 0) + 1,
          voted_user_ids: [...votedUserIds, user.id]
        })
        .eq('id', questionId);

      if (updateError) throw updateError;

      // อัพเดท state
      setQuestions(prev => prev.map(q => {
        if (q.id === questionId && !q.votedUserIds.includes(user.id)) {
          return {
            ...q,
            votes: q.votes + 1,
            votedUserIds: [...q.votedUserIds, user.id]
          };
        }
        return q;
      }));
    } catch (error) {
      console.error('Vote question error:', error);
      
      // Fallback: อัพเดท state เท่านั้น
      setQuestions(prev => prev.map(q => {
        if (q.id === questionId && !q.votedUserIds.includes(user.id)) {
          return {
            ...q,
            votes: q.votes + 1,
            votedUserIds: [...q.votedUserIds, user.id]
          };
        }
        return q;
      }));
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

  // Initialize with data from Supabase
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      try {
        // 1. Check remembered user
        const savedUser = localStorage.getItem('zeelink_user');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);

            // ดึงข้อมูลจาก Supabase
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('email', parsedUser.email)
              .single();
              
            if (!userError && userData) {
              setUser({
                id: userData.id,
                email: userData.email,
                name: userData.name,
                photoUrl: userData.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
                role: userData.role as Role,
                isBanned: userData.is_banned
              });
              
              // ดึง profile
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userData.id)
                .single();
                
              if (profileData) {
                setProfile({
                  id: profileData.id,
                  userId: profileData.user_id,
                  uid: profileData.uid || '',
                  username: profileData.username,
                  displayName: profileData.display_name,
                  photoUrl: profileData.photo_url,
                  bio: profileData.bio,
                  tags: profileData.tags || [],
                  region: profileData.region,
                  province: profileData.province,
                  district: profileData.district,
                  subDistrict: profileData.sub_district,
                  postalCode: profileData.postal_code,
                  showOnExplore: profileData.show_on_explore,
                  likes: profileData.likes || 0,
                  views: profileData.views || 0,
                  themeConfig: profileData.theme_config,
                  links: profileData.links || [],
                  createdAt: profileData.created_at,
                  updatedAt: profileData.updated_at
                });
              }
            }
          } catch (e) {
            console.error('Error parsing saved user:', e);
          }
        }
        
        // 2. Load users list
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .eq('show_on_explore', true);
          
        if (!usersError && usersData) {
          const profiles = usersData.map(p => ({
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
          }));
          setUsersList(profiles);
        }
        
        // 3. Load questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('status', 'approved')
          .order('votes', { ascending: false });
          
        if (!questionsError && questionsData) {
          const questions = questionsData.map(q => ({
            id: q.id,
            userId: q.user_id,
            username: q.username,
            text: q.text,
            votes: q.votes,
            createdAt: q.created_at,
            votedUserIds: q.voted_user_ids || [],
            status: q.status as QuestionStatus
          }));
          setQuestions(questions);
        } else {
          // Fallback to initial questions
          setQuestions(INITIAL_QUESTIONS);
        }
        
        // 4. Load popups
        const { data: popupsData, error: popupsError } = await supabase
          .from('popups')
          .select('*')
          .eq('is_active', true);
          
        if (!popupsError && popupsData) {
          const popups = popupsData.map(p => ({
            id: p.id,
            title: p.title,
            imageUrl: p.image_url,
            linkUrl: p.link_url,
            isActive: p.is_active,
            frequency: p.frequency as any
          }));
          setPopups(popups);
          if (popups.length > 0) setActivePopup(popups[0]);
        } else {
          // Fallback: Create initial popup
          const initialPopup: SystemPopup = {
            id: '1',
            title: '🎉 ยินดีต้อนรับสู่ Zeelink!',
            imageUrl: 'https://brilliant-maroon-7qyv9qr1xg.edgeone.app/zl_icon_white_bg.png',
            linkUrl: '/explore',
            isActive: true,
            frequency: 'once_daily'
          };
          
          setActivePopup(initialPopup);
          setPopups([initialPopup]);
        }
        
        // 5. Add some mock users if database is empty
        if (usersList.length === 0) {
          simulateUsers();
        }
        
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, []); // ← ต้องมี dependency array ว่าง

  const value: AuthContextType = {
    user,
    profile,
    usersList,
    isLoading,
    activePopup,
    popups,
    questions,
    login,
    register,
    logout,
    updateProfile,
    toggleLike,
    deleteUser,
    banUser,
    simulateUsers,
    backupData,
    createPopup,
    togglePopup,
    deletePopup,
    closeActivePopup,
    addQuestion,
    voteQuestion,
    askAiStylist
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
