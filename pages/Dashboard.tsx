import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { THAI_REGIONS, AVAILABLE_FONTS } from '../constants';
import { Link, Profile, ThemeConfig } from '../types';
import { Camera, Save, Plus, Trash2, Copy, ExternalLink, MapPin, Smartphone, Palette, User, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassBackground } from '../components/GlassBackground';

export const Dashboard: React.FC = () => {
  const { user, profile, updateProfile, askAiStylist } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'design'>('profile');

  // Form State
  const [photoUrl, setPhotoUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  
  // Detailed Location State
  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [subDistrict, setSubDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Advanced Design State
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
      backgroundColor: '#ffffff',
      textColor: '#000000',
      buttonColor: '#000000',
      fontFamily: 'Prompt',
      layout: 'minimal',
      enableGlassEffect: false,
      backgroundImageUrl: ''
  });

  const [showOnExplore, setShowOnExplore] = useState(true);
  const [links, setLinks] = useState<Link[]>([]);
  const [isNewUser, setIsNewUser] = useState(true);
  const [shareLink, setShareLink] = useState('');

  // Derived location data
  const selectedRegionData = THAI_REGIONS.find(r => r.name === region);

  useEffect(() => {
    if (user) setPhotoUrl(user.photoUrl);
    if (profile) {
      setPhotoUrl(profile.photoUrl || user?.photoUrl || '');
      setDisplayName(profile.displayName);
      setUsername(profile.username);
      setBio(profile.bio);
      
      setRegion(profile.region || '');
      setProvince(profile.province);
      setDistrict(profile.district || '');
      setSubDistrict(profile.subDistrict || '');
      setPostalCode(profile.postalCode || '');
      
      setShowOnExplore(profile.showOnExplore);
      setLinks(profile.links || []);
      
      if (profile.themeConfig) setThemeConfig(profile.themeConfig);
      
      setIsNewUser(false);
      if (profile.username) setShareLink(`${window.location.origin}/#/${profile.username}`);
    }
  }, [profile, user]);

  // Auto-generate Zip Code logic (Simulation)
  useEffect(() => {
      if (province) {
          const provData = selectedRegionData?.provinces.find(p => p.name === province);
          if (provData && district && subDistrict) {
              // Mock logic: Base zip + random last 3 digits based on district length
              setPostalCode(`${provData.zipCodeBase}000`); 
          }
      }
  }, [province, district, subDistrict]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
          alert('❌ ไฟล์ใหญ่เกินไป! กรุณาเลือกรูปที่มีขนาดไม่เกิน 5 MB');
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPhotoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAiStylist = () => {
      const newTheme = askAiStylist();
      setThemeConfig(newTheme);
      alert("✨ น้องซีเลือกธีมให้แล้วครับ!");
  };

  const handleSave = () => {
    if (!user) return;
    
    // Strict Validation for Online Presence
    if (!photoUrl || photoUrl.includes('ui-avatars')) {
        alert('⚠️ กรุณาอัปโหลดรูปโปรไฟล์ก่อนบันทึก');
        return;
    }
    if (!province || !district || !subDistrict) {
        alert('⚠️ ต้องกรอกที่อยู่ให้ครบถ้วนเพื่อแสดงบนหน้า Online');
        return;
    }

    const newProfile: Profile = {
      id: profile?.id || Math.random().toString(36).substr(2, 9),
      userId: user.id,
      uid: profile?.uid || '',
      username: username,
      displayName,
      photoUrl,
      bio,
      region,
      province,
      district,
      subDistrict,
      postalCode,
      tags: profile?.tags || [],
      showOnExplore,
      likes: profile?.likes || 0,
      views: profile?.views || 0,
      themeConfig,
      links,
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    updateProfile(newProfile);
    setShareLink(`${window.location.origin}/#/${username}`);
    alert(`🎉 บันทึกสำเร็จ! ลิงก์โปรไฟล์ของคุณพร้อมใช้งานแล้ว`);
  };

  const handleAddLink = () => {
    setLinks([...links, { id: Date.now().toString(), title: '', url: '', clicks: 0, isActive: true }]);
  };

  const handleRemoveLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const handleLinkChange = (id: string, field: keyof Link, value: any) => {
    setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const MobilePreview = () => (
      <div className="border-[8px] border-gray-800 rounded-[3rem] overflow-hidden w-[300px] h-[600px] bg-white relative shadow-2xl mx-auto">
          <div className="absolute top-0 w-full h-6 bg-gray-800 flex justify-center z-20">
              <div className="w-1/3 h-4 bg-black rounded-b-xl"></div>
          </div>
          <div 
            className="w-full h-full overflow-y-auto p-6 pt-12 flex flex-col items-center relative"
            style={{ 
                backgroundColor: themeConfig.backgroundColor, 
                color: themeConfig.textColor,
                fontFamily: themeConfig.fontFamily,
                backgroundImage: themeConfig.backgroundImageUrl ? `url(${themeConfig.backgroundImageUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
          >
              {themeConfig.enableGlassEffect && (
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm pointer-events-none" />
              )}
              
              <div className="relative z-10 w-full flex flex-col items-center">
                  <img src={photoUrl || 'https://picsum.photos/200'} className="w-24 h-24 rounded-full border-4 border-current mb-4 object-cover" />
                  <h3 className="text-lg font-bold">{displayName || 'ชื่อของคุณ'}</h3>
                  <p className="text-sm opacity-80 mb-6 text-center whitespace-pre-wrap">{bio || 'คำอธิบายตัวตนของคุณ'}</p>
                  
                  <div className="w-full space-y-3">
                      {links.map(link => (
                          <div 
                            key={link.id}
                            className={`w-full py-3 px-4 rounded-lg text-center font-medium text-sm transition-transform hover:scale-[1.02] ${themeConfig.enableGlassEffect ? 'bg-white/20 backdrop-blur-md border border-white/30' : ''}`}
                            style={{ 
                                backgroundColor: themeConfig.enableGlassEffect ? undefined : themeConfig.buttonColor,
                                color: themeConfig.enableGlassEffect ? themeConfig.textColor : '#fff'
                            }}
                          >
                              {link.title || 'Link Title'}
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );

  if (!user) return <div className="p-20 text-center">Please login first</div>;

  return (
    <GlassBackground>
      <div className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1 space-y-6">
              <div className="glass-card p-2 flex space-x-2">
                  <button onClick={() => setActiveTab('profile')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/10'}`}> <User size={18} className="inline mr-2" /> ข้อมูลทั่วไป </button>
                  <button onClick={() => setActiveTab('design')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'design' ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-white/10'}`}> <Palette size={18} className="inline mr-2" /> ตกแต่ง & ลิงก์ </button>
              </div>

              {activeTab === 'profile' && (
                  <div className="space-y-6 animate-fade-in">
                      <div className="glass-card p-6 border-cyan">
                          <h3 className="font-bold mb-4">รูปโปรไฟล์ (จำเป็น)</h3>
                          <div className="flex items-center space-x-4">
                              <img src={photoUrl || 'https://picsum.photos/200'} className="w-20 h-20 rounded-full object-cover border-2 border-white" />
                              <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-bold"><Camera size={16} className="inline mr-2"/> อัปโหลด</button>
                              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                          </div>
                      </div>

                      <div className="glass-card p-6 space-y-4 border-cyan">
                          <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full p-3 rounded-xl" placeholder="ชื่อที่แสดง" />
                          <div className="flex items-center gap-2">
                              <span className="p-3 rounded-xl bg-gray-500/20 text-sm whitespace-nowrap">zeelink.site/</span>
                              <input value={username} onChange={e => setUsername(e.target.value)} disabled={!isNewUser} className="flex-1 p-3 rounded-xl" placeholder="username" />
                          </div>
                          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full p-3 rounded-xl" placeholder="Bio..." />
                      </div>

                      <div className="glass-card p-6 space-y-4 border-green">
                          <h3 className="font-bold flex items-center"><MapPin className="mr-2 text-green-500"/> ที่อยู่ (สำหรับแสดงผล Online)</h3>
                          <select value={region} onChange={e => setRegion(e.target.value)} className="w-full p-3 rounded-lg"><option value="">เลือกภูมิภาค</option>{THAI_REGIONS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}</select>
                          <div className="grid grid-cols-2 gap-4">
                              <select value={province} onChange={e => setProvince(e.target.value)} disabled={!region} className="w-full p-3 rounded-lg"><option value="">เลือกจังหวัด</option>{selectedRegionData?.provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select>
                              <input value={district} onChange={e => setDistrict(e.target.value)} placeholder="อำเภอ (พิมพ์เอง)" className="w-full p-3 rounded-lg" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <input value={subDistrict} onChange={e => setSubDistrict(e.target.value)} placeholder="ตำบล (พิมพ์เอง)" className="w-full p-3 rounded-lg" />
                              <input value={postalCode} readOnly placeholder="รหัสไปรษณีย์ (ออโต้)" className="w-full p-3 rounded-lg opacity-70" />
                          </div>
                          
                          <div className="flex items-center justify-between p-4 bg-black/10 rounded-lg mt-4">
                              <span className="text-sm font-bold">แสดงบนหน้า Online</span>
                              <button onClick={() => setShowOnExplore(!showOnExplore)} className={`w-12 h-6 rounded-full transition-colors ${showOnExplore ? 'bg-green-500' : 'bg-gray-400'}`}><div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${showOnExplore ? 'translate-x-7' : 'translate-x-1'} mt-1`}></div></button>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'design' && (
                  <div className="space-y-6 animate-fade-in">
                      <div className="glass-card p-6 flex justify-between items-center border-purple" style={{ background: 'linear-gradient(135deg, rgba(187, 134, 252, 0.2) 0%, rgba(187, 134, 252, 0.05) 100%)' }}>
                          <div>
                              <h3 className="font-bold text-lg">ให้ AI ช่วยเลือกไหม?</h3>
                              <p className="text-xs opacity-90">น้องซีจะสุ่มธีมสวยๆ ให้คุณเอง</p>
                          </div>
                          <button onClick={handleAiStylist} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:scale-105 transition-transform flex items-center shadow-lg">
                              <Sparkles size={16} className="mr-2"/> ถามน้องซี
                          </button>
                      </div>

                      <div className="glass-card p-6 space-y-4 border-purple">
                          <h3 className="font-bold">ปรับแต่งเอง</h3>
                          <div className="grid grid-cols-2 gap-4">
                              <div><label className="text-xs font-bold">สีพื้นหลัง</label><input type="color" value={themeConfig.backgroundColor} onChange={e => setThemeConfig({...themeConfig, backgroundColor: e.target.value})} className="w-full h-10 rounded mt-1"/></div>
                              <div><label className="text-xs font-bold">สีตัวอักษร</label><input type="color" value={themeConfig.textColor} onChange={e => setThemeConfig({...themeConfig, textColor: e.target.value})} className="w-full h-10 rounded mt-1"/></div>
                              <div><label className="text-xs font-bold">สีปุ่ม</label><input type="color" value={themeConfig.buttonColor} onChange={e => setThemeConfig({...themeConfig, buttonColor: e.target.value})} className="w-full h-10 rounded mt-1"/></div>
                              <div>
                                  <label className="text-xs font-bold">ฟอนต์</label>
                                  <select value={themeConfig.fontFamily} onChange={e => setThemeConfig({...themeConfig, fontFamily: e.target.value})} className="w-full h-10 rounded mt-1">
                                      {AVAILABLE_FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                                  </select>
                              </div>
                          </div>
                          <div>
                              <label className="text-xs font-bold">Wallpaper URL (หรือ GIF)</label>
                              <div className="flex mt-1">
                                  <input value={themeConfig.backgroundImageUrl} onChange={e => setThemeConfig({...themeConfig, backgroundImageUrl: e.target.value})} className="flex-1 p-2 rounded-l-lg border-r-0" placeholder="https://..." />
                                  <span className="p-2 bg-gray-500/20 rounded-r-lg border border-l-0 flex items-center justify-center"><ImageIcon size={16}/></span>
                              </div>
                          </div>
                          <div className="flex items-center space-x-2">
                              <input type="checkbox" checked={themeConfig.enableGlassEffect} onChange={e => setThemeConfig({...themeConfig, enableGlassEffect: e.target.checked})} className="w-4 h-4 rounded" />
                              <label className="text-sm font-bold">เปิดเอฟเฟกต์กระจก (Glass Effect)</label>
                          </div>
                      </div>

                      <div className="glass-card p-6 border-pink">
                           <div className="flex justify-between items-center mb-4">
                               <h3 className="font-bold">ลิงก์ของคุณ</h3>
                               <button onClick={handleAddLink} className="text-white text-xs font-bold flex items-center px-3 py-1 bg-pink-500 rounded-full hover:bg-pink-600"><Plus size={14} className="mr-1" /> เพิ่มลิงก์</button>
                           </div>
                           <div className="space-y-3">
                              {links.map((link) => (
                                <div key={link.id} className="flex items-center space-x-2 p-2 bg-black/10 rounded-lg border border-white/10">
                                  <input value={link.title} onChange={(e) => handleLinkChange(link.id, 'title', e.target.value)} className="flex-1 p-1 bg-transparent border-b text-sm font-bold" placeholder="ชื่อปุ่ม" />
                                  <input value={link.url} onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)} className="flex-1 p-1 bg-transparent border-b text-xs text-muted" placeholder="URL" />
                                  <button onClick={() => handleRemoveLink(link.id)} className="text-red-500"><Trash2 size={16}/></button>
                                </div>
                              ))}
                           </div>
                      </div>
                  </div>
              )}
              
              <button onClick={handleSave} className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"><Save size={20} className="mr-2"/> บันทึก & สร้างหน้าเว็บ</button>
              
              {shareLink && (
                  <div className="mt-4 p-4 bg-green-500/10 rounded-xl border border-green-500 flex justify-between items-center glass-card">
                      <div className="overflow-hidden mr-4">
                          <p className="text-xs text-green-500 font-bold">ลิงก์ของคุณพร้อมแล้ว:</p>
                          <p className="text-sm truncate font-bold">{shareLink}</p>
                      </div>
                      <div className="flex space-x-2">
                          <button onClick={() => navigator.clipboard.writeText(shareLink)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><Copy size={16}/></button>
                          <a href={shareLink} target="_blank" className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><ExternalLink size={16}/></a>
                      </div>
                  </div>
              )}
          </div>

          <div className="w-full lg:w-[400px] flex flex-col items-center">
              <h2 className="text-lg font-bold mb-4 flex items-center"><Smartphone size={20} className="mr-2" /> Live Preview</h2>
              <div className="sticky top-24"><MobilePreview /></div>
          </div>
        </div>
      </div>
    </GlassBackground>
  );
};