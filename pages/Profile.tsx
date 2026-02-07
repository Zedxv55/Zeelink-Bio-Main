import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Profile as ProfileType } from '../types';
import { X, MapPin, Heart, ZoomIn } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { usersList, user: currentUser, toggleLike } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImageZoom, setShowImageZoom] = useState(false);

  useEffect(() => {
    const found = usersList.find(u => u.username === username);
    if (found) {
        setProfile(found);
    }
    setLoading(false);
  }, [username, usersList]);

  const handleLike = () => {
      if (profile) {
          toggleLike(profile.id);
          // Optimistic update
          setProfile({ ...profile, likes: (profile.likes || 0) + 1 });
      }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!profile) return <div className="h-screen flex items-center justify-center">Profile not found</div>;

  // Apply Theme Styles
  const theme = profile.themeConfig || {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      buttonColor: '#000000',
      fontFamily: 'Prompt',
      layout: 'minimal'
  };

  return (
    <div 
        className="min-h-screen relative transition-colors duration-500"
        style={{ 
            backgroundColor: theme.backgroundColor, 
            color: theme.textColor,
            fontFamily: theme.fontFamily
        }}
    >
       {/* Navigation / Actions */}
       <div className="fixed top-6 right-6 z-50 flex space-x-3">
           {currentUser?.id !== profile.userId && (
               <button 
                onClick={handleLike}
                className="p-3 rounded-full shadow-lg backdrop-blur-sm transition-transform active:scale-90 bg-white/20 text-current border border-white/20"
               >
                   <Heart size={24} className="fill-pink-500 text-pink-500" />
               </button>
           )}
           <button 
            onClick={() => navigate('/')}
            className="p-3 rounded-full shadow-lg backdrop-blur-sm bg-black/10 hover:bg-black/20 text-current"
           >
             <X size={24} />
           </button>
       </div>

       <div className="max-w-xl mx-auto pt-24 pb-12 px-6">
         
         <div className="flex flex-col items-center text-center animate-fade-in-up">
            <div className="relative group cursor-pointer mb-6" onClick={() => setShowImageZoom(true)}>
                <img 
                    src={profile.photoUrl} 
                    alt={profile.displayName} 
                    className="w-32 h-32 rounded-full shadow-2xl object-cover border-4 border-current"
                />
            </div>

            <h1 className="text-3xl font-bold mb-2 tracking-tight">
                {profile.displayName}
            </h1>
            
            <div className="flex items-center space-x-2 text-sm opacity-80 mb-6">
                 <span>@{profile.username}</span>
                 {profile.province && (
                     <>
                        <span>•</span>
                        <MapPin size={14} />
                        <span>{profile.province}</span>
                     </>
                 )}
            </div>

            <p className="max-w-md mb-8 leading-relaxed opacity-90 text-lg whitespace-pre-wrap">
                {profile.bio}
            </p>

            <div className="flex items-center justify-center space-x-2 mb-8 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                 <Heart size={16} className="text-pink-500 fill-pink-500" />
                 <span className="font-bold">{profile.likes || 0} ยอดใจ</span>
            </div>

            {/* Links Section */}
            <div className="w-full space-y-4">
                {profile.links.map(link => (
                    <a 
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full p-4 rounded-xl shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden"
                        style={{ backgroundColor: theme.buttonColor, color: theme.backgroundColor === '#111827' ? '#fff' : '#fff' }}
                    >
                        <span className="relative z-10 font-bold text-lg">{link.title}</span>
                    </a>
                ))}
            </div>

            <footer className="mt-16 opacity-50 text-sm">
                <p>Created with Zeelink</p>
            </footer>

         </div>
       </div>

       {/* Image Zoom Modal */}
       {showImageZoom && (
           <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowImageZoom(false)}>
               <img 
                src={profile.photoUrl} 
                alt="Full size" 
                className="max-w-full max-h-full object-contain cursor-zoom-out"
               />
           </div>
       )}
    </div>
  );
};
