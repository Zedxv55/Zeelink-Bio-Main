import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Profile as ProfileType } from '../types';
import { MapPin, Heart, Eye, Calendar, Map as MapIcon, Image as ImageIcon, UserPlus, UserCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { fonts, fontSize, palette } from '../lib/designTokens';
import { detectPlatform, isValidUrl } from '../lib/social';
import { supabase } from '../contexts/supabaseClient';

// map แถวจาก DB (snake_case) เป็น Profile (camelCase) แบบเดียวกับ AuthContext
const mapProfile = (p: any): ProfileType => ({
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
  lat: p.lat || 0,
  lng: p.lng || 0,
  showOnExplore: p.show_on_explore,
  likes: p.likes || 0,
  views: p.views || 0,
  themeConfig: p.theme_config,
  links: p.links || [],
  createdAt: p.created_at,
  updatedAt: p.updated_at
});

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { usersList, toggleLike, followUser, isFollowing, user } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  // กดใจรูปภาพในพอร์ต (เซสชันนี้) — ยังไม่มีตารางแยก จึงเก็บฝั่ง client
  const [likedImages, setLikedImages] = useState<Set<number>>(new Set());
  const canFollow = !!user && profile && user.id !== profile.userId;
  const toggleImageLike = (i: number) => {
    setLikedImages(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      const found = usersList.find(u => u.username === username);
      if (found) { setProfile(found); setLoading(false); return; }
      const { data } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle();
      if (!cancel) {
        setProfile(data ? mapProfile(data) : null);
        setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [username, usersList]);

  // นับยอดเข้าชม (กันนับซ้ำต่อ session ด้วย sessionStorage ตาม username)
  useEffect(() => {
    if (!profile || !username) return;
    const key = `zeelink_viewed_${username}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    (async () => {
      try {
        const { error } = await supabase.rpc('increment_view', { p_username: username });
        if (error) {
          // ไม่มี RPC → fallback update ธรรมดา
          await supabase.from('profiles').update({ views: (profile.views || 0) + 1 }).eq('id', profile.id);
        }
      } catch {
        try {
          await supabase.from('profiles').update({ views: (profile.views || 0) + 1 }).eq('id', profile.id);
        } catch { /* noop */ }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  if (loading) return <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)', fontFamily: fonts.body, fontSize: fontSize('base') }}>Loading Zeelink...</div>;
  if (!profile) return <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: fonts.body, fontSize: fontSize('lg') }}>Profile not found</div>;

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

             {/* Portfolio Image Gallery */}
             {profile.portfolioImages && profile.portfolioImages.length > 0 && (
               <div className="w-full mb-10">
                 <h3 className="text-sm font-bold mb-3 flex items-center justify-center opacity-80">
                   <ImageIcon size={14} className="mr-1" /> ผลงาน ({profile.portfolioImages.length} รูป)
                 </h3>
                 <div className="grid grid-cols-3 gap-2">
                   {profile.portfolioImages.map((img, i) => (
                     <div key={i} className="relative group">
                       <img
                         src={img}
                         alt={`result ${i + 1}`}
                         className="w-full h-28 object-cover rounded-xl border border-current/10 hover:scale-105 transition-transform cursor-pointer"
                         onClick={() => window.open(img, '_blank', 'noopener,noreferrer')}
                       />
                       <button
                         onClick={() => toggleImageLike(i)}
                         aria-label="กดใจรูปนี้"
                         className="absolute bottom-1 right-1 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/40 text-white text-[10px] opacity-80 hover:opacity-100 transition-opacity"
                       >
                         <Heart size={12} className={likedImages.has(i) ? 'fill-pink-500 text-pink-500' : ''} />
                         {likedImages.has(i) ? 'แล้ว' : 'ใจ'}
                       </button>
                     </div>
                   ))}
                 </div>
               </div>
             )}

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
                 {canFollow && (
                   <button
                     onClick={() => followUser(profile.userId)}
                     className="flex items-center space-x-2 px-6 py-3 rounded-full font-bold shadow-lg border border-current hover:bg-black/5 transition-all"
                   >
                     {isFollowing(profile.userId) ? <UserCheck size={18} /> : <UserPlus size={18} />}
                     <span>{isFollowing(profile.userId) ? 'กำลังติดตาม' : 'ติดตาม'}</span>
                   </button>
                 )}
                 <button onClick={() => window.open(`/explore`, '_blank')} className="flex items-center space-x-2 px-6 py-3 rounded-full font-bold shadow-lg border border-current hover:bg-black/5 transition-all">
                     <MapIcon size={18} /> <span>ดูบนแผนที่</span>
                 </button>
             </div>

             {/* Links (with social platform icons) */}
             <div className="w-full space-y-4 mb-12">
                 {profile.links.map(link => {
                    const platform = detectPlatform(link.url);
                    const Icon = platform.icon;
                    const safeUrl = isValidUrl(link.url) ? link.url : '#';
                    const label = link.title || platform.label;
                    return (
                      <a key={link.id} href={safeUrl} target="_blank" rel="noreferrer noopener"
                         className={`flex items-center justify-center space-x-2 w-full py-4 text-center font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all opacity-90 hover:opacity-100 ${theme.enableGlassEffect ? 'backdrop-blur-md border border-white/30' : ''}`}
                         style={{
                             backgroundColor: theme.enableGlassEffect ? 'rgba(255,255,255,0.2)' : theme.buttonColor,
                             color: theme.enableGlassEffect ? theme.textColor : '#fff'
                         }}>
                          <Icon size={18} />
                          <span>{label}</span>
                      </a>
                    );
                 })}
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
