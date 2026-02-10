import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Profile, SystemPopup, Question } from '../types';
import { BANNED_WORDS, INITIAL_QUESTIONS } from '../constants';

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
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);

  // Mock login function
  const login = async (email: string, password: string, remember = false): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock user data
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
      
      if (remember) {
        localStorage.setItem('zeelink_user', JSON.stringify(mockUser));
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
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        role: 'user',
        isBanned: false
      };
      
      setUser(newUser);
      localStorage.setItem('zeelink_user', JSON.stringify(newUser));
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

  const updateProfile = (newProfile: Profile) => {
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
  };

  const toggleLike = (profileId: string) => {
    setUsersList(prev => prev.map(p => {
      if (p.id === profileId) {
        return { ...p, likes: (p.likes || 0) + 1 };
      }
      return p;
    }));
    
    if (profile?.id === profileId) {
      setProfile(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null);
    }
  };

  // Admin functions
  const deleteUser = (userId: string) => {
    setUsersList(prev => prev.filter(p => p.userId !== userId));
  };

  const banUser = (userId: string) => {
    setUsersList(prev => prev.map(p => 
      p.userId === userId ? { ...p, isBanned: true } : p
    ));
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
      // Add more mock users...
    ];
    
    setUsersList(prev => [...prev, ...mockUsers]);
  };

  const backupData = () => {
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
  };

  const closeActivePopup = () => {
    setActivePopup(null);
  };

  const createPopup = (popup: SystemPopup) => {
    setPopups(prev => [...prev, popup]);
    setActivePopup(popup);
  };

  const togglePopup = (popupId: string) => {
    setPopups(prev => prev.map(p => 
      p.id === popupId ? { ...p, isActive: !p.isActive } : p
    ));
  };

  const deletePopup = (popupId: string) => {
    setPopups(prev => prev.filter(p => p.id !== popupId));
  };

  const addQuestion = async (text: string): Promise<Question> => {
    // Check for banned words
    const hasBannedWord = BANNED_WORDS.some(word => 
      text.toLowerCase().includes(word.toLowerCase())
    );
    
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
  };

  const voteQuestion = (questionId: string) => {
    if (!user) return;
    
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
  };

  const askAiStylist = () => {
    const presets = [
      { backgroundColor: '#0f172a', textColor: '#38bdf8', buttonColor: '#ec4899', fontFamily: 'Chakra Petch', layout: 'glass' as const, enableGlassEffect: true },
      { backgroundColor: '#f8fafc', textColor: '#334155', buttonColor: '#000000', fontFamily: 'Prompt', layout: 'minimal' as const, enableGlassEffect: false },
      { backgroundColor: '#fff1f2', textColor: '#881337', buttonColor: '#fda4af', fontFamily: 'Mitr', layout: 'creative' as const, enableGlassEffect: true },
    ];
    
    return presets[Math.floor(Math.random() * presets.length)];
  };

  // Initialize with mock data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Check for remembered user
      const savedUser = localStorage.getItem('zeelink_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          
          // If admin, set admin profile
          if (parsedUser.email === 'zbcd1053@gmail.com') {
            const adminProfile: Profile = {
              id: 'admin1',
              userId: parsedUser.id,
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
        } catch (e) {
          console.error('Error parsing saved user:', e);
        }
      }
      
      // Create initial popup
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
      
      // Add some mock users
      simulateUsers();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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