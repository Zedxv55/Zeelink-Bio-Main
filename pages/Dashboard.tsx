import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { THAI_REGIONS, AVAILABLE_FONTS, LAYOUT_THEMES } from '../constants';
import { Link, Profile, ThemeConfig } from '../types';
import { Camera, Save, Plus, Trash2, Copy, ExternalLink, MapPin, Smartphone, Palette, User, Power, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'design'>('profile');

  // Form State
  const [photoUrl, setPhotoUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  
  // Location State
  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [subDistrict, setSubDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Design State
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
      backgroundColor: '#ffffff',
      textColor: '#000000',
      buttonColor: '#000000',
      fontFamily: 'Prompt',
      layout: 'minimal'
  });

  const [showOnExplore, setShowOnExplore] = useState(true); // Default ON
  const [links, setLinks] = useState<Link[]>([]);
  const [isNewUser, setIsNewUser] = useState(true);
  const [shareLink, setShareLink] = useState('');
  
  // Modal State
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);

  // Derived state for location dropdowns
  const selectedRegionData = THAI_REGIONS.find(r => r.name === region);
  const selectedProvinceData = selectedRegionData?.provinces.find(p => p.name === province);
  const selectedDistrictData = selectedProvinceData?.districts.find(d => d.name === district);

  useEffect(() => {
    if (user) {
        setPhotoUrl(user.photoUrl);
    }
    if (profile) {
      setPhotoUrl(profile.photoUrl || user?.photoUrl || '');
      setDisplayName(profile.displayName);
      setUsername(profile.username);
      setBio(profile.bio);
      
      setRegion(profile.region || '');
      setProvince(profile.province);
      setDistrict(profile.district);
      setSubDistrict(profile.subDistrict);
      setPostalCode(profile.postalCode);
      
      setShowOnExplore(profile.showOnExplore);
      setLinks(profile.links || []);
      
      if (profile.themeConfig) setThemeConfig(profile.themeConfig);
      
      setIsNewUser(false);
      if (profile.username) setShareLink(`https://zeelink.site/p/${profile.username}`);
    }
  }, [profile, user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!user) return;
    if (!displayName || !username) {
      alert("กรุณากรอกชื่อและชื่อผู้ใช้");
      return;
    }

    const newProfile: Profile = {
      id: profile?.id || Math.random().toString(36).substr(2, 9),
      userId: user.id,
      uid: profile?.uid || '', // Context will generate if empty
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
      themeConfig,
      links,
      createdAt: profile?.createdAt || new Date().toISOString()
    };

    updateProfile(newProfile);
    const link = `https://zeelink.site/p/${username}`;
    setShareLink(link);
    alert(`🎉 บันทึกโปรไฟล์สำเร็จ!\n🔗 ลิงก์ของคุณ: ${link}\n✅ สถานะ: ${showOnExplore ? '🟢 ออนไลน์' : '⚪ ออฟไลน์'}`);
  };

  const handleToggleOnlineClick = () => {
      if (showOnExplore) {
          // Turning OFF -> Show warning
          setShowOfflineWarning(true);
      } else {
          // Turning ON -> Just do it
          setShowOnExplore(true);
      }
  };

  const confirmOffline = () => {
      setShowOnExplore(false);
      setShowOfflineWarning(false);
  };

  const handleAddLink = () => {
    setLinks([...links, { id: Date.now().toString(), title: '', url: '', clicks: 0 }]);
  };

  const handleRemoveLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const handleLinkChange = (id: string, field: 'title' | 'url', value: string) => {
    setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleApplyTheme = (theme: typeof LAYOUT_THEMES[0]) => {
      if (theme.value === 'minimal') {
          setThemeConfig({ ...themeConfig, layout: 'minimal', backgroundColor: '#ffffff', textColor: '#000000', buttonColor: '#000000' });
      } else if (theme.value === 'modern') {
          setThemeConfig({ ...themeConfig, layout: 'modern', backgroundColor: '#111827', textColor: '#ffffff', buttonColor: '#2563EB' });
      } else {
          setThemeConfig({ ...themeConfig, layout: 'creative', backgroundColor: '#F3E8FF', textColor: '#4C1D95', buttonColor: '#8B5CF6' });
      }
  };

  const MobilePreview = () => (
      <div className="border-[8px] border-gray-800 rounded-[3rem] overflow-hidden w-[300px] h-[600px] bg-white relative shadow-2xl mx-auto">
          <div className="absolute top-0 w-full h-6 bg-gray-800 flex justify-center z-20">
              <div className="w-1/3 h-4 bg-black rounded-b-xl"></div>
          </div>
          <div 
            className="w-full h-full overflow-y-auto p-6 pt-12 flex flex-col items-center"
            style={{ 
                backgroundColor: themeConfig.backgroundColor, 
                color: themeConfig.textColor,
                fontFamily: themeConfig.fontFamily
            }}
          >
              <img src={photoUrl || 'https://picsum.photos/200'} className="w-24 h-24 rounded-full border-4 border-current mb-4 object-cover" />
              <h3 className="text-lg font-bold">{displayName || 'ชื่อของคุณ'}</h3>
              <p className="text-sm opacity-80 mb-6 text-center whitespace-pre-wrap">{bio || 'คำอธิบายตัวตนของคุณ'}</p>
              
              <div className="w-full space-y-3">
                  {links.map(link => (
                      <div 
                        key={link.id}
                        className="w-full py-3 px-4 rounded-lg text-center font-medium text-sm transition-transform hover:scale-[1.02]"
                        style={{ 
                            backgroundColor: themeConfig.buttonColor,
                            color: themeConfig.backgroundColor === '#111827' ? '#fff' : '#fff'
                        }}
                      >
                          {link.title || 'Link Title'}
                      </div>
                  ))}
              </div>
              <div className="mt-auto mb-4 text-xs opacity-50">Zeelink Profile</div>
          </div>
      </div>
  );

  if (!user) return <div className="p-20 text-center">Please login first</div>;

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Controls */}
        <div className="flex-1 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">ปรับแต่งโปรไฟล์ของคุณ</h1>
            
            {/* Tab Navigation */}
            <div className="flex space-x-2 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'}`}
                >
                    <User size={18} className="mr-2" /> ข้อมูลทั่วไป
                </button>
                <button 
                    onClick={() => setActiveTab('design')}
                    className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'design' ? 'bg-purple-50 text-purple-600' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'}`}
                >
                    <Palette size={18} className="mr-2" /> ตกแต่ง & ลิงก์
                </button>
            </div>

            {activeTab === 'profile' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Basic Info */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="relative w-20 h-20">
                                <img src={photoUrl || 'https://picsum.photos/200'} className="w-full h-full rounded-full object-cover border-2 border-gray-200" />
                                <label className="absolute bottom-0 right-0 bg-blue-600 p-1.5 rounded-full text-white cursor-pointer hover:bg-blue-700">
                                    <Camera size={14} />
                                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                </label>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase">ชื่อที่แสดง</label>
                                <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Name" />
                            </div>
                        </div>
                        {profile?.uid && (
                             <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                                 <span className="text-sm text-gray-500 dark:text-gray-300">UID ของคุณ:</span>
                                 <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{profile.uid}</span>
                             </div>
                        )}
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Username (URL)</label>
                            <input value={username} onChange={e => setUsername(e.target.value)} disabled={!isNewUser} className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="username" />
                        </div>
                        <div>
                            <div className="flex justify-between">
                                <label className="block text-xs font-bold text-gray-500 uppercase">Bio</label>
                                <span className={`text-xs ${bio.length > 250 ? 'text-red-500' : 'text-gray-400'}`}>{bio.length}/250</span>
                            </div>
                            <textarea 
                                value={bio} 
                                onChange={e => setBio(e.target.value)} 
                                rows={4} 
                                maxLength={250}
                                className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                placeholder="แนะนำตัว...\n(รองรับการขึ้นบรรทัดใหม่)" 
                            />
                        </div>
                    </div>

                    {/* Location Info */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-2 mb-4">
                            <MapPin size={20} className="text-blue-500" />
                            <h3 className="font-bold text-gray-900 dark:text-white">ที่อยู่แบบสมบูรณ์</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs text-gray-500 mb-1">ภูมิภาค</label>
                                <select value={region} onChange={e => { setRegion(e.target.value); setProvince(''); setDistrict(''); setSubDistrict(''); }} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white">
                                    <option value="">เลือกภาค</option>
                                    {THAI_REGIONS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">จังหวัด</label>
                                <select value={province} onChange={e => { setProvince(e.target.value); setDistrict(''); setSubDistrict(''); }} disabled={!region} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white">
                                    <option value="">เลือกจังหวัด</option>
                                    {selectedRegionData?.provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">อำเภอ</label>
                                <select value={district} onChange={e => { setDistrict(e.target.value); setSubDistrict(''); }} disabled={!province} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white">
                                    <option value="">เลือกอำเภอ</option>
                                    {selectedProvinceData?.districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">ตำบล</label>
                                <select value={subDistrict} onChange={e => { setSubDistrict(e.target.value); const s = selectedDistrictData?.subDistricts.find(sd => sd.name === e.target.value); if(s) setPostalCode(s.zip); }} disabled={!district} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white">
                                    <option value="">เลือกตำบล</option>
                                    {selectedDistrictData?.subDistricts.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">รหัสไปรษณีย์</label>
                                <input value={postalCode} readOnly className="w-full p-2 bg-gray-100 border rounded-lg dark:bg-gray-600 dark:text-gray-300" />
                            </div>
                        </div>

                         <div className="mt-6">
                             <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <Power size={20} className={showOnExplore ? 'text-green-500' : 'text-gray-400'} />
                                    <div>
                                        <span className="text-sm font-medium dark:text-white block">แสดงสถานะออนไลน์ (Explore)</span>
                                        {showOnExplore && <span className="text-xs text-green-600 block">🟢 เปิดอยู่ (กำลังแสดงตัวบนแผนที่)</span>}
                                        {!showOnExplore && <span className="text-xs text-gray-400 block">⚪ ปิดอยู่ (ไม่แสดงตัว)</span>}
                                    </div>
                                </div>
                                <button 
                                    onClick={handleToggleOnlineClick}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showOnExplore ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showOnExplore ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                             {showOnExplore && (
                                <p className="mt-2 text-xs text-gray-500 flex items-center">
                                    💡 เคล็ดลับ: การเปิดสถานะออนไลน์จะช่วยให้คนอื่นพบคุณได้ง่ายขึ้น และเพิ่มโอกาสได้รับยอดใจมากขึ้น!
                                </p>
                             )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Theme Templates */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                         <h3 className="font-bold text-gray-900 dark:text-white mb-4">เลือกเทมเพลต</h3>
                         <div className="grid grid-cols-3 gap-3">
                             {LAYOUT_THEMES.map(theme => (
                                 <button 
                                    key={theme.name}
                                    onClick={() => handleApplyTheme(theme)}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${themeConfig.layout === theme.value ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'}`}
                                 >
                                     <div className={`w-full h-8 rounded mb-2 ${theme.bg}`}></div>
                                     <span className="dark:text-white">{theme.name}</span>
                                 </button>
                             ))}
                         </div>
                    </div>

                    {/* Customizer */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                        <h3 className="font-bold text-gray-900 dark:text-white">ปรับแต่งเอง</h3>
                        <div>
                             <label className="text-xs font-bold text-gray-500">ฟอนต์ (Font)</label>
                             <select 
                                value={themeConfig.fontFamily} 
                                onChange={e => setThemeConfig({...themeConfig, fontFamily: e.target.value})}
                                className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                             >
                                 {AVAILABLE_FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                             </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500">สีพื้นหลัง</label>
                                <div className="flex items-center space-x-2 mt-1">
                                    <input type="color" value={themeConfig.backgroundColor} onChange={e => setThemeConfig({...themeConfig, backgroundColor: e.target.value})} className="w-8 h-8 rounded cursor-pointer" />
                                    <span className="text-xs dark:text-gray-300">{themeConfig.backgroundColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500">สีปุ่ม</label>
                                <div className="flex items-center space-x-2 mt-1">
                                    <input type="color" value={themeConfig.buttonColor} onChange={e => setThemeConfig({...themeConfig, buttonColor: e.target.value})} className="w-8 h-8 rounded cursor-pointer" />
                                    <span className="text-xs dark:text-gray-300">{themeConfig.buttonColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Links Manager */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="font-bold text-gray-900 dark:text-white">ลิงก์ของคุณ</h3>
                             <button onClick={handleAddLink} className="text-blue-600 text-sm font-medium flex items-center hover:bg-blue-50 px-2 py-1 rounded">
                                 <Plus size={16} className="mr-1" /> เพิ่มลิงก์
                             </button>
                         </div>
                         <div className="space-y-3">
                            {links.map((link) => (
                              <div key={link.id} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex-1 space-y-1">
                                  <input 
                                    type="text" 
                                    placeholder="ชื่อปุ่ม"
                                    value={link.title}
                                    onChange={(e) => handleLinkChange(link.id, 'title', e.target.value)}
                                    className="w-full text-sm bg-transparent border-b border-gray-200 dark:border-gray-600 focus:border-blue-500 outline-none px-1"
                                  />
                                  <input 
                                    type="text" 
                                    placeholder="URL (https://...)"
                                    value={link.url}
                                    onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                                    className="w-full text-xs text-gray-500 bg-transparent outline-none px-1"
                                  />
                                </div>
                                <button onClick={() => handleRemoveLink(link.id)} className="text-red-400 hover:text-red-600 p-1">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                         </div>
                    </div>
                </div>
            )}
            
            <button 
                onClick={handleSave}
                className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-lg flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
            >
                <Save size={20} />
                <span>บันทึกไฟล์ & สร้างลิงก์</span>
            </button>
            
            {shareLink && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 animate-fade-in">
                    <p className="text-sm text-green-800 dark:text-green-200 font-bold mb-2">🎉 ลิงก์ของคุณพร้อมแล้ว!</p>
                    <div className="flex items-center space-x-2 bg-white dark:bg-black/20 p-2 rounded">
                        <span className="text-xs truncate flex-1">{shareLink}</span>
                        <button onClick={() => navigator.clipboard.writeText(shareLink)} className="p-1 hover:text-green-600"><Copy size={16}/></button>
                    </div>
                </div>
            )}

        </div>

        {/* Right Column: Preview */}
        <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col items-center">
            <h2 className="text-lg font-bold text-gray-500 mb-4 flex items-center">
                <Smartphone size={20} className="mr-2" /> Live Preview
            </h2>
            <div className="sticky top-24">
                <MobilePreview />
                {profile?.username && (
                    <div className="mt-6 flex justify-center space-x-4">
                        <a 
                            href={`#/${profile.username}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                        >
                            <ExternalLink size={16} className="mr-2" /> ดูของจริง
                        </a>
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* Offline Warning Modal */}
      {showOfflineWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-md w-full animate-scale-in">
                  <div className="flex items-center text-yellow-500 mb-4">
                      <AlertTriangle size={32} className="mr-2" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">คำเตือนสำคัญ!</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                      หากคุณปิดการแสดงสถานะออนไลน์:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 mb-6 space-y-1">
                      <li>ไม่มีใครจะเห็นคุณบนแผนที่</li>
                      <li>โปรไฟล์ของคุณจะไม่แสดงในรายการออนไลน์</li>
                      <li>คุณจะได้รับยอดใจน้อยลง</li>
                  </ul>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-6">
                      แนะนำให้เปิดไว้เพื่อการมองเห็นสูงสุด!
                  </p>
                  <div className="flex space-x-3">
                      <button 
                          onClick={() => setShowOfflineWarning(false)}
                          className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                      >
                          ยกเลิก
                      </button>
                      <button 
                          onClick={confirmOffline}
                          className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
                      >
                          ใช่, ปิดเลย
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
