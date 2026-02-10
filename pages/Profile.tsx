import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Profile as ProfileType } from '../types';
import { MapPin, Heart, Eye, Calendar, Map as MapIcon } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { usersList, toggleLike } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = usersList.find(u => u.username === username);
    if (found) setProfile(found);
    setLoading(false);
  }, [username, usersList]);

  if (loading) return <div className="h-screen flex items-center justify-center text-gray-400">Loading Zeelink...</div>;
  if (!profile) return <div className="h-screen flex items-center justify-center">Profile not found</div>;

  const theme = profile.themeConfig;

  return (
    <div 
        className="min-h-screen relative transition-colors duration-500 overflow-x-hidden"
        style={{ 
            backgroundColor: theme.backgroundColor, 
            color: theme.textColor,
            fontFamily: theme.fontFamily,
            backgroundImage: theme.backgroundImageUrl ? `url(${theme.backgroundImageUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }}
    >
       {/* Glass Overlay if enabled */}
       {theme.enableGlassEffect && (
           <div className="absolute inset-0 bg-white/10 backdrop-blur-sm pointer-events-none z-0" />
       )}

       <div className="max-w-md mx-auto min-h-screen flex flex-col p-6 relative z-10">
          <div className="flex-1 flex flex-col items-center pt-10">
             
             <div className="relative mb-6 group">
                <img src={profile.photoUrl} className="w-32 h-32 rounded-full object-cover border-4 border-current shadow-2xl transition-transform hover:scale-105" />
             </div>

             <h1 className="text-3xl font-bold mb-1 drop-shadow-md">{profile.displayName}</h1>
             <p className="text-xs opacity-60 font-mono mb-2">UID: {profile.uid}</p>
             <p className="text-sm opacity-80 mb-8 flex items-center"><MapPin size={14} className="mr-1" />{profile.district}, {profile.province}</p>

             {/* Bio Content */}
             <div className={`w-full mb-8 text-center p-6 rounded-2xl ${theme.enableGlassEffect ? 'bg-white/20 backdrop-blur-md border border-white/20' : ''}`}>
                 <p className="text-lg leading-relaxed whitespace-pre-wrap opacity-90">
                    {profile.bio || "..."}
                 </p>
             </div>

             {/* Stats */}
             <div className="flex justify-center space-x-8 w-full mb-10 py-6 border-y border-current/10">
                 <div className="text-center">
                    <span className="block text-2xl font-bold">{profile.likes || 0}</span>
                    <span className="text-xs opacity-60 uppercase flex items-center justify-center mt-1"><Heart size={10} className="mr-1"/> ใจ</span>
                 </div>
                 <div className="text-center">
                    <span className="block text-2xl font-bold">{profile.views || 0}</span>
                    <span className="text-xs opacity-60 uppercase flex items-center justify-center mt-1"><Eye size={10} className="mr-1"/> เข้าชม</span>
                 </div>
             </div>

             {/* Actions */}
             <div className="flex space-x-4 mb-12">
                 <button onClick={() => toggleLike(profile.id)} className="flex items-center space-x-2 px-6 py-3 rounded-full font-bold shadow-lg hover:transform hover:scale-105 transition-all" style={{ backgroundColor: theme.buttonColor, color: theme.backgroundColor === '#000000' ? '#fff' : '#fff' }}>
                     <Heart size={18} /> <span>ถูกใจ</span>
                 </button>
                 <button onClick={() => window.open(`/explore`, '_blank')} className="flex items-center space-x-2 px-6 py-3 rounded-full font-bold shadow-lg border border-current hover:bg-black/5 transition-all">
                     <MapIcon size={18} /> <span>ดูบนแผนที่</span>
                 </button>
             </div>

             {/* Links */}
             <div className="w-full space-y-4 mb-12">
                 {profile.links.map(link => (
                    <a key={link.id} href={link.url} target="_blank" rel="noreferrer" 
                       className={`block w-full py-4 text-center font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all opacity-90 hover:opacity-100 ${theme.enableGlassEffect ? 'backdrop-blur-md border border-white/30' : ''}`} 
                       style={{ 
                           backgroundColor: theme.enableGlassEffect ? 'rgba(255,255,255,0.2)' : theme.buttonColor, 
                           color: theme.enableGlassEffect ? theme.textColor : '#fff' 
                       }}>
                        {link.title}
                    </a>
                 ))}
             </div>
          </div>

          <div className="text-center py-6 opacity-40 text-xs">
              <p>สร้างโปรไฟล์ของคุณเอง</p>
              <a href="/" className="font-bold hover:underline">เริ่มใช้งาน Zeelink</a>
          </div>
       </div>
    </div>
  );
};
