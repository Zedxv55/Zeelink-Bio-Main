import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Profile, Role, Question } from '../types';
import { INITIAL_QUESTIONS, THAI_REGIONS, BANNED_WORDS } from '../constants';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  login: (email: string, pass: string, remember: boolean) => Promise<boolean>;
  register: (email: string, pass: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (newProfile: Profile) => void;
  usersList: Profile[]; 
  banUser: (id: string) => void;
  deleteUser: (id: string) => void;
  toggleLike: (targetProfileId: string) => void;
  
  // Voting
  questions: Question[];
  addQuestion: (text: string) => Promise<{status: 'approved' | 'rejected'}>;
  voteQuestion: (questionId: string) => void;
  
  // Admin Features
  simulateUsers: (count: number, province: string) => void;
  backupData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usersList, setUsersList] = useState<Profile[]>([]); 
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);

  useEffect(() => {
    // Load data from persistent storage
    const savedUser = localStorage.getItem('zeelink-user');
    const savedProfile = localStorage.getItem('zeelink-profile');
    const savedUsersList = localStorage.getItem('zeelink-users-db');
    const savedQuestions = localStorage.getItem('zeelink-questions');

    if (savedUsersList) {
      setUsersList(JSON.parse(savedUsersList));
    } else {
        // Init Mock Data
        const mockDb: Profile[] = [
            {
                id: 'mock1', userId: 'mock1', uid: '0220261', username: 'somchai', displayName: 'Somchai K.', 
                photoUrl: 'https://picsum.photos/200', bio: 'Coffee lover in Bangkok', tags: ['Foodie'],
                region: 'ภาคกลาง', province: 'กรุงเทพมหานคร', district: 'ปทุมวัน', subDistrict: 'รองเมือง', postalCode: '10330',
                showOnExplore: true, likes: 25,
                themeConfig: { backgroundColor: '#ffffff', textColor: '#000000', buttonColor: '#000000', fontFamily: 'Prompt', layout: 'minimal' },
                links: [], createdAt: new Date().toISOString()
            }
        ];
        setUsersList(mockDb);
        localStorage.setItem('zeelink-users-db', JSON.stringify(mockDb));
    }

    if (savedQuestions) {
        setQuestions(JSON.parse(savedQuestions));
    }

    if (savedUser) {
        const u = JSON.parse(savedUser);
        if (!u.isBanned) {
            setUser(u);
            if (savedProfile) setProfile(JSON.parse(savedProfile));
        } else {
            localStorage.removeItem('zeelink-user');
            localStorage.removeItem('zeelink-profile');
        }
    }

    setIsLoading(false);
  }, []);

  const saveToDb = (newList: Profile[]) => {
      setUsersList(newList);
      localStorage.setItem('zeelink-users-db', JSON.stringify(newList));
  };

  const generateUID = (isBot: boolean, index: number) => {
      if (isBot) {
          // 01, 02... 0100
          return `0${index}`;
      } else {
          // 0220261...
          return `022026${index}`;
      }
  };

  const login = async (email: string, pass: string, remember: boolean): Promise<boolean> => {
    // Admin Check
    if (email === 'zbcd1053@gmail.com' && pass === 'z025991244') {
        const adminUser: User = {
            id: 'admin-001',
            email: email,
            name: 'Admin',
            photoUrl: 'https://ui-avatars.com/api/?name=Admin',
            role: 'admin',
            isBanned: false
        };
        setUser(adminUser);
        if (remember) localStorage.setItem('zeelink-user', JSON.stringify(adminUser));
        return true;
    }

    // Mock Regular User Login
    if (email.includes('@')) {
        const userId = btoa(email); 
        const mockUser: User = {
            id: userId,
            email: email,
            name: email.split('@')[0],
            photoUrl: `https://ui-avatars.com/api/?name=${email.split('@')[0]}`,
            role: 'user',
            isBanned: false
        };
        
        const existingProfile = usersList.find(p => p.userId === userId);
        
        setUser(mockUser);
        if (remember) localStorage.setItem('zeelink-user', JSON.stringify(mockUser));
        if (existingProfile) {
            setProfile(existingProfile);
            if (remember) localStorage.setItem('zeelink-profile', JSON.stringify(existingProfile));
        }
        return true;
    }
    return false;
  };

  const register = async (email: string, pass: string, name: string): Promise<boolean> => {
      const userId = btoa(email);
      const newUser: User = {
          id: userId,
          email,
          name,
          photoUrl: `https://ui-avatars.com/api/?name=${name}`,
          role: 'user',
          isBanned: false
      };
      setUser(newUser);
      localStorage.setItem('zeelink-user', JSON.stringify(newUser));
      return true;
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('zeelink-user');
    localStorage.removeItem('zeelink-profile');
  };

  const updateProfile = (newProfile: Profile) => {
    // If new profile doesn't have a specific UID yet (first time save), generate one
    // Count existing real users
    if (!newProfile.uid || newProfile.uid.length < 5) {
        const realUserCount = usersList.filter(u => u.uid.startsWith('022026')).length;
        newProfile.uid = generateUID(false, realUserCount + 1);
    }

    setProfile(newProfile);
    localStorage.setItem('zeelink-profile', JSON.stringify(newProfile));
    
    // Update "DB"
    const updatedList = usersList.filter(p => p.id !== newProfile.id);
    updatedList.push(newProfile);
    saveToDb(updatedList);
  };

  const banUser = (id: string) => {
      alert(`ดำเนินการแบน User ID #${id} เรียบร้อยแล้วค่ะ`);
      const updatedList = usersList.filter(u => u.id !== id);
      saveToDb(updatedList);
  };

  const deleteUser = (id: string) => {
      const updatedList = usersList.filter(u => u.id !== id);
      saveToDb(updatedList);
      alert(`ลบผู้ใช้ ID #${id} เรียบร้อยแล้ว`);
  };

  const toggleLike = (targetProfileId: string) => {
      if (!user) return;
      const target = usersList.find(p => p.id === targetProfileId);
      if (target && target.userId !== user.id) {
          const updatedProfile = { ...target, likes: (target.likes || 0) + 1 };
          const updatedList = usersList.map(p => p.id === targetProfileId ? updatedProfile : p);
          saveToDb(updatedList);
          
          if (profile && profile.id === targetProfileId) {
             setProfile(updatedProfile); 
          }
      }
  };

  // Voting Logic with AI Moderation
  const addQuestion = async (text: string): Promise<{status: 'approved' | 'rejected'}> => {
      if (!user) return { status: 'rejected' };
      
      // AI Moderation Logic
      const containsBadWord = BANNED_WORDS.some(bad => text.toLowerCase().includes(bad));
      const status = containsBadWord ? 'rejected' : 'approved';

      const newQ: Question = {
          id: Date.now().toString(),
          userId: user.id,
          username: user.name,
          text,
          votes: 0,
          createdAt: new Date().toISOString(),
          votedUserIds: [],
          status: status
      };
      
      const newQuestions = [newQ, ...questions];
      setQuestions(newQuestions);
      localStorage.setItem('zeelink-questions', JSON.stringify(newQuestions));
      
      return { status };
  };

  const voteQuestion = (questionId: string) => {
      if (!user) return;
      const q = questions.find(q => q.id === questionId);
      if (!q) return;
      
      if (q.votedUserIds.includes(user.id)) return; // Already voted

      const updatedQ = {
          ...q,
          votes: q.votes + 1,
          votedUserIds: [...q.votedUserIds, user.id]
      };
      
      const newQuestions = questions.map(qs => qs.id === questionId ? updatedQ : qs);
      setQuestions(newQuestions);
      localStorage.setItem('zeelink-questions', JSON.stringify(newQuestions));
  };

  // Admin Features
  const simulateUsers = (count: number, province: string) => {
      const newUsers: Profile[] = [];
      const regionData = THAI_REGIONS.find(r => r.provinces.some(p => p.name === province));
      const region = regionData ? regionData.name : 'Unknown';
      const provinceData = regionData?.provinces.find(p => p.name === province);
      const districts = provinceData?.districts || [];

      // Count existing bots
      const existingBots = usersList.filter(u => u.uid.startsWith('0') && u.uid.length < 5).length;

      for (let i = 0; i < count; i++) {
          const randomDist = districts[Math.floor(Math.random() * districts.length)];
          const randomSub = randomDist.subDistricts[Math.floor(Math.random() * randomDist.subDistricts.length)];
          
          newUsers.push({
              id: `sim-${Date.now()}-${i}`,
              userId: `sim-user-${i}`,
              uid: generateUID(true, existingBots + i + 1),
              username: `user_${Math.random().toString(36).substr(2, 5)}`,
              displayName: `User ${existingBots + i + 1}`,
              photoUrl: `https://picsum.photos/seed/${i + Date.now()}/200`,
              bio: 'Simulated User',
              tags: [],
              region,
              province,
              district: randomDist.name,
              subDistrict: randomSub.name,
              postalCode: randomSub.zip,
              showOnExplore: true,
              likes: Math.floor(Math.random() * 50),
              themeConfig: { backgroundColor: '#ffffff', textColor: '#000000', buttonColor: '#000000', fontFamily: 'Prompt', layout: 'minimal' },
              links: [],
              createdAt: new Date().toISOString()
          });
      }
      const updatedList = [...usersList, ...newUsers];
      saveToDb(updatedList);
  };

  const backupData = () => {
      const data = {
          users: usersList,
          questions: questions,
          exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `website-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  return (
    <AuthContext.Provider value={{ 
        user, profile, isLoading, login, register, logout, updateProfile, usersList, banUser, deleteUser, toggleLike,
        questions, addQuestion, voteQuestion,
        simulateUsers, backupData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
