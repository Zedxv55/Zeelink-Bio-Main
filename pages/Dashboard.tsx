import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { THAI_REGIONS, AVAILABLE_FONTS } from '../constants';
import { Link, Profile, ThemeConfig } from '../types';
import { Camera, Save, Plus, Trash2, Copy, ExternalLink, MapPin, Smartphone, Palette, User, Sparkles, Image as ImageIcon, GripVertical, LocateFixed, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassBackground } from '../components/GlassBackground';
import { Button } from '../components/ui/Button';
import { DemoOverlay } from '../components/DemoOverlay';
import { supabase, isSupabaseConfigured } from '../contexts/supabaseClient';
import { detectPlatform, isValidUrl } from '../lib/social';
import L from 'leaflet';

// ===== Image gallery limits (Security: client-side hard cap) =====
// DB scale supports up to 100; regular users capped at 15 in this version
const MAX_PORTFOLIO_IMAGES = 15;
const DB_HARD_CAP = 100;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file

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

  // Portfolio gallery state — แสดง mock เฉพาะโหมด demo (ยังไม่ได้ตั้งค่า Supabase)
  const [portfolioImages, setPortfolioImages] = useState<string[]>(
    isSupabaseConfigured ? [] : [
      'https://picsum.photos/seed/zeelink1/400/400',
      'https://picsum.photos/seed/zeelink2/400/400',
      'https://picsum.photos/seed/zeelink3/400/400'
    ]
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Detailed Location State
  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [subDistrict, setSubDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);

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
  // รับบริจาค/Support ผ่าน PromptPay
  const [acceptSupport, setAcceptSupport] = useState(false);
  const [promptpay, setPromptpay] = useState('');
  // Demo social links (shown in preview mode before login)
  const [links, setLinks] = useState<Link[]>([
    { id: 'demo1', title: 'Facebook', url: 'https://facebook.com/zeelink', clicks: 0, isActive: true },
    { id: 'demo2', title: 'Instagram', url: 'https://instagram.com/zeelink', clicks: 0, isActive: true },
    { id: 'demo3', title: 'GitHub', url: 'https://github.com/zeelink', clicks: 0, isActive: true }
  ]);
  const [isNewUser, setIsNewUser] = useState(true);
  const [shareLink, setShareLink] = useState('');

  // ===== แผนที่ (Leaflet) + แชร์ตำแหน่งเรียลไทม์ =====
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const getProvinceLatLng = (): { lat: number; lng: number } => {
    if (lat && lng) return { lat, lng };
    const prov = THAI_REGIONS.find(r => r.name === region)?.provinces.find(p => p.name === province);
    return prov ? { lat: prov.lat, lng: prov.lng } : { lat: 13.7563, lng: 100.5018 };
  };

  // สร้างแผนที่ครั้งเดียว
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const { lat: la, lng: ln } = getProvinceLatLng();
    const map = L.map(mapContainerRef.current, { zoomControl: true, attributionControl: false })
      .setView([la, ln], province ? 11 : 6);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // เลื่อนแผนที่ตามจังหวัด/พิกัดที่เลือก
  useEffect(() => {
    if (!mapRef.current) return;
    const { lat: la, lng: ln } = getProvinceLatLng();
    mapRef.current.flyTo([la, ln], province ? 11 : 6, { animate: true });
    if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
    if (lat && lng) {
      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current)
        .bindPopup('📍 ตำแหน่งของคุณ');
    }
    setTimeout(() => mapRef.current?.invalidateSize(), 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [province, lat, lng]);

  // แชร์ตำแหน่งปัจจุบัน (geolocation เรียลไทม์)
  const shareLiveLocation = () => {
    if (!navigator.geolocation) { setGeoError('เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง'); return; }
    setGeoLoading(true); setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude); setLng(pos.coords.longitude);
        setGeoLoading(false);
      },
      (err) => { setGeoError(err.code === 1 ? 'คุณปฏิเสธการแชร์ตำแหน่ง' : 'ไม่สามารถระบุตำแหน่งได้'); setGeoLoading(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

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
      setLat(profile.lat || 0);
      setLng(profile.lng || 0);

      setShowOnExplore(profile.showOnExplore);
      setLinks(profile.links || []);
      setPortfolioImages(profile.portfolioImages || []);
      setAcceptSupport(profile.themeConfig?.acceptSupport || false);
      setPromptpay(profile.themeConfig?.promptpay || '');

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
              setPostalCode(`${provData.zipCodeBase}000`);
          }
      }
  }, [province, district, subDistrict, region, selectedRegionData]);

  // ===== Single profile photo upload =====
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert('❌ ไฟล์ใหญ่เกินไป! กรุณาเลือกรูปที่มีขนาดไม่เกิน 5 MB');
      return;
    }
    if (!user) { alert('กรุณาเข้าสู่ระบบก่อน'); return; }

    try {
      const safeName = file.name.replace(/\s+/g, '-');
      const path = `${user.id}/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (error) throw error;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
      alert('✅ อัปโหลดรูปโปรไฟล์แล้ว');
    } catch (err) {
      console.error('Upload error:', err);
      alert('อัปโหลดไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  // ===== Multi-image portfolio gallery upload =====
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    setUploadError(null);

    if (!user) { alert('กรุณาเข้าสู่ระบบก่อน'); return; }

    // Hard cap enforcement (15 for regular users)
    const remaining = MAX_PORTFOLIO_IMAGES - portfolioImages.length;
    if (remaining <= 0) {
      setUploadError(`🚫 คุณอัปโหลดรูปได้สูงสุด ${MAX_PORTFOLIO_IMAGES} รูปแล้ว ต้องการเพิ่ม? ปลดล็อกแพ็กเกจ Pro`);
      return;
    }
    const accepted = files.slice(0, remaining);
    if (files.length > remaining) {
      setUploadError(`⚠️ รับเพียง ${remaining} รูป (เหลือโควตา) จาก ${files.length} ที่เลือก`);
    }

    for (const file of accepted) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`❌ ไฟล์ "${file.name}" ใหญ่เกิน 5 MB ข้ามไป`);
        continue;
      }
      try {
        const safeName = file.name.replace(/\s+/g, '-');
        const path = `${user.id}/gallery/${Date.now()}-${safeName}`;
        const { error } = await supabase.storage.from('avatars').upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from('avatars').getPublicUrl(path);
        setPortfolioImages(prev => [...prev, data.publicUrl]);
      } catch (err) {
        console.error('Gallery upload error:', err);
      }
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ===== Drag and drop reorder =====
  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...portfolioImages];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setDragIndex(index);
    setPortfolioImages(updated);
  };
  const handleDragEnd = () => setDragIndex(null);

  const removeGalleryImage = (index: number) => {
    setPortfolioImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAiStylist = () => {
      const newTheme = askAiStylist();
      setThemeConfig(newTheme);
      alert("✨ น้องซีเลือกธีมให้แล้วครับ!");
  };

  const handleSave = () => {
    if (!user) return;

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
      lat,
      lng,
      tags: profile?.tags || [],
      portfolioImages, // Save gallery
      showOnExplore,
      likes: profile?.likes || 0,
      views: profile?.views || 0,
      themeConfig: { ...themeConfig, acceptSupport, promptpay: promptpay.trim() },
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

                  {/* Portfolio gallery preview (first 4 images) */}
                  {portfolioImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 w-full mb-4">
                      {portfolioImages.slice(0, 4).map((img, i) => (
                        <img key={i} src={img} className="w-full h-20 object-cover rounded-lg border border-white/20" alt={`work ${i+1}`} />
                      ))}
                    </div>
                  )}

                  <div className="w-full space-y-3">
                      {links.map(link => {
                        const platform = detectPlatform(link.url);
                        const Icon = platform.icon;
                        return (
                          <div
                            key={link.id}
                            className={`w-full py-3 px-4 rounded-lg text-center font-medium text-sm transition-transform hover:scale-[1.02] ${themeConfig.enableGlassEffect ? 'bg-white/20 backdrop-blur-md border border-white/30' : ''}`}
                            style={{
                                backgroundColor: themeConfig.enableGlassEffect ? undefined : themeConfig.buttonColor,
                                color: themeConfig.enableGlassEffect ? themeConfig.textColor : '#fff'
                            }}
                          >
                            <Icon size={14} className="inline mr-2" />{link.title || platform.label}
                          </div>
                        );
                      })}
                  </div>
              </div>
          </div>
      </div>
  );

  const isDemo = !user;

  return (
    <GlassBackground>
      {/* Demo mode: blur the preview content + show login CTA overlay */}
      {isDemo && <DemoOverlay title="ล็อกอินเพื่อเริ่มต้นสร้างพอร์ต" subtitle="และเปิดใช้งานฟีเจอร์จริงของคุณ" />}

      <div className={`min-h-screen pt-24 pb-20 px-4 ${isDemo ? 'pointer-events-none select-none blur-sm opacity-70' : ''}`}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

          <div className="flex-1 space-y-6">
              <div className="glass-card p-2 flex space-x-2">
                  <button onClick={() => setActiveTab('profile')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-[var(--orange)] text-white shadow-lg' : 'hover:bg-white/10'}`}> <User size={18} className="inline mr-2" /> ข้อมูลทั่วไป </button>
                  <button onClick={() => setActiveTab('design')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'design' ? 'bg-[var(--pink)] text-white shadow-lg' : 'hover:bg-white/10'}`}> <Palette size={18} className="inline mr-2" /> ตกแต่ง & ลิงก์ </button>
              </div>

              {activeTab === 'profile' && (
                  <div className="space-y-6 animate-fade-in">
                      <div className="glass-card p-6 border-[var(--orange)]">
                          <h3 className="font-bold mb-4">รูปโปรไฟล์ (จำเป็น)</h3>
                          <div className="flex items-center space-x-4">
                              <img src={photoUrl || 'https://picsum.photos/200'} className="w-20 h-20 rounded-full object-cover border-2 border-white" />
                              <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-[var(--orange)] text-white rounded-lg text-sm hover:bg-[var(--orange-deep)] font-bold"><Camera size={16} className="inline mr-2"/> อัปโหลด</button>
                              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                          </div>
                      </div>

                      {/* ===== Portfolio Image Gallery ===== */}
                      <div className="glass-card p-6 border-[var(--blue)]">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold flex items-center"><ImageIcon size={18} className="mr-2 text-[var(--blue)]" /> รูปภาพผลงาน</h3>
                              <span className={`text-xs font-bold px-3 py-1 rounded-full ${portfolioImages.length >= MAX_PORTFOLIO_IMAGES ? 'bg-red-500/20 text-red-400' : 'bg-[var(--blue)]/20 text-[var(--blue)]'}`}>
                                  รูปภาพของคุณ ({portfolioImages.length}/{MAX_PORTFOLIO_IMAGES} รูป)
                              </span>
                          </div>

                          {/* Upload zone */}
                          <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${portfolioImages.length >= MAX_PORTFOLIO_IMAGES ? 'border-gray-500/30 opacity-50 cursor-not-allowed' : 'border-[var(--blue)]/40 hover:border-[var(--blue)]'}`}>
                              <Camera size={28} className="text-[var(--blue)] mb-2" />
                              <span className="text-sm font-bold">{portfolioImages.length >= MAX_PORTFOLIO_IMAGES ? 'เต็มโควตาแล้ว' : 'คลิกเพื่อเพิ่มรูปภาพ'}</span>
                              <span className="text-[11px] opacity-60 mt-1">สูงสุด {MAX_PORTFOLIO_IMAGES} รูป · ไฟล์ละไม่เกิน 5 MB</span>
                              <input type="file" multiple accept="image/*" onChange={handleGalleryUpload} className="hidden" disabled={portfolioImages.length >= MAX_PORTFOLIO_IMAGES} />
                          </label>

                          {uploadError && (
                              <p className="text-[11px] text-red-400 mt-2 p-2 bg-red-500/10 rounded-lg">{uploadError}</p>
                          )}

                          {/* Gallery grid with drag-drop */}
                          {portfolioImages.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                                {portfolioImages.map((img, index) => (
                                  <div
                                    key={index}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`relative group rounded-lg overflow-hidden border-2 cursor-move transition-all ${dragIndex === index ? 'border-[var(--orange)] opacity-50' : 'border-white/10 hover:border-[var(--blue)]'}`}
                                  >
                                      <img src={img} className="w-full h-24 object-cover" alt={`portfolio ${index+1}`} />
                                      <div className="absolute top-1 left-1 bg-black/60 rounded px-1.5 text-[10px] font-bold flex items-center">
                                          <GripVertical size={10} className="mr-0.5" />{index + 1}
                                      </div>
                                      <button
                                        onClick={() => removeGalleryImage(index)}
                                        className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                  </div>
                                ))}
                            </div>
                          )}
                          <p className="text-[11px] opacity-50 mt-3">💡 ลากรูปเพื่อจัดเรียงลำดับ (รูปแรกจะเป็นภาพเด่น)</p>
                      </div>

                      <div className="glass-card p-6 space-y-4 border-[var(--orange)]">
                          <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full p-3 rounded-xl" placeholder="ชื่อที่แสดง" />
                          <div className="flex items-center gap-2">
                              <span className="p-3 rounded-xl bg-gray-500/20 text-sm whitespace-nowrap">zeelink.site/</span>
                              <input value={username} onChange={e => setUsername(e.target.value)} disabled={!isNewUser} className="flex-1 p-3 rounded-xl" placeholder="username" />
                          </div>
                          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full p-3 rounded-xl" placeholder="Bio..." />
                      </div>

                      <div className="glass-card p-6 space-y-4 border-green">
                          <h3 className="font-bold flex items-center"><MapPin className="mr-2 text-green-500"/> ที่อยู่ (สำหรับแสดงผล Online)</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <select value={region} onChange={e => setRegion(e.target.value)} className="w-full p-3 rounded-lg"><option value="">เลือกภูมิภาค</option>{THAI_REGIONS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}</select>
                            <select value={province} onChange={e => setProvince(e.target.value)} disabled={!region} className="w-full p-3 rounded-lg"><option value="">เลือกจังหวัด</option>{selectedRegionData?.provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <input value={district} onChange={e => setDistrict(e.target.value)} placeholder="อำเภอ (พิมพ์เอง)" className="w-full p-3 rounded-lg" />
                              <input value={subDistrict} onChange={e => setSubDistrict(e.target.value)} placeholder="ตำบล (พิมพ์เอง)" className="w-full p-3 rounded-lg" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <input value={postalCode} readOnly placeholder="รหัสไปรษณีย์ (ออโต้)" className="w-full p-3 rounded-lg opacity-70" />
                              <input value={lat && lng ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : ''} readOnly placeholder="พิกัด (แชร์ตำแหน่ง)" className="w-full p-3 rounded-lg opacity-70" />
                          </div>

                          {/* แผนที่ + แชร์ตำแหน่งเรียลไทม์ */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold">🗺️ แผนที่ตำแหน่ง</span>
                              <button onClick={shareLiveLocation} disabled={geoLoading || !user} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[var(--green)] text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-1">
                                {geoLoading ? 'กำลังระบุ...' : <><LocateFixed size={13} /> แชร์ตำแหน่งปัจจุบัน</>}
                              </button>
                            </div>
                            <div ref={mapContainerRef} className="w-full h-56 rounded-xl overflow-hidden border border-white/10 z-0" style={{ background: '#aadaff' }} />
                            {geoError && <p className="text-[11px] text-red-400 mt-1">{geoError}</p>}
                          </div>

                          <div className="flex items-center justify-between p-4 bg-black/10 rounded-lg mt-4">
                              <span className="text-sm font-bold">แสดงบนหน้า Online</span>
                              <button onClick={() => setShowOnExplore(!showOnExplore)} className={`w-12 h-6 rounded-full transition-colors ${showOnExplore ? 'bg-green-500' : 'bg-gray-400'}`}><div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${showOnExplore ? 'translate-x-7' : 'translate-x-1'} mt-1`} /></button>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'design' && (
                  <div className="space-y-6 animate-fade-in">
                      <div className="glass-card p-6 flex justify-between items-center border-[var(--pink)]" style={{ background: 'linear-gradient(135deg, rgba(227, 107, 155, 0.2) 0%, rgba(227, 107, 155, 0.05) 100%)' }}>
                          <div>
                              <h3 className="font-bold text-lg">ให้ AI ช่วยเลือกไหม?</h3>
                              <p className="text-xs opacity-90">น้องซีจะสุ่มธีมสวยๆ ให้คุณเอง</p>
                          </div>
                          <button onClick={handleAiStylist} className="px-4 py-2 bg-[var(--pink)] text-white rounded-lg font-bold hover:scale-105 transition-transform flex items-center shadow-lg">
                              <Sparkles size={16} className="mr-2"/> ถามน้องซี
                          </button>
                      </div>

                      <div className="glass-card p-6 space-y-4 border-[var(--pink)]">
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
                               <h3 className="font-bold">ลิงก์โซเชียลของคุณ</h3>
                               <button onClick={handleAddLink} className="text-white text-xs font-bold flex items-center px-3 py-1 bg-pink-500 rounded-full hover:bg-pink-600"><Plus size={14} className="mr-1" /> เพิ่มลิงก์</button>
                           </div>
                           <div className="space-y-3">
                              {links.map((link) => {
                                const platform = detectPlatform(link.url);
                                const Icon = platform.icon;
                                const urlValid = !link.url || isValidUrl(link.url);
                                return (
                                  <div key={link.id} className="flex items-center gap-2 p-2 bg-black/10 rounded-lg border border-white/10">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${urlValid ? 'bg-[var(--pink)]/20 text-[var(--pink)]' : 'bg-red-500/20 text-red-400'}`}>
                                      <Icon size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-1 sm:gap-2">
                                      <input value={link.title} onChange={(e) => handleLinkChange(link.id, 'title', e.target.value)} className="w-full sm:flex-1 min-w-0 p-1 bg-transparent border-b text-sm font-bold" placeholder={platform.label} />
                                      <input value={link.url} onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)} className={`w-full sm:flex-1 min-w-0 p-1 bg-transparent border-b text-xs ${urlValid ? 'text-muted' : 'text-red-400'}`} placeholder="https://..." />
                                    </div>
                                    {!urlValid && <span className="text-[10px] text-red-400 shrink-0 hidden sm:inline">URL ไม่ถูกต้อง</span>}
                                    <button onClick={() => handleRemoveLink(link.id)} aria-label="ลบลิงก์" className="text-red-500 shrink-0 p-1"><Trash2 size={16}/></button>
                                  </div>
                                );
                              })}
                              {links.length === 0 && (
                                <p className="text-[11px] opacity-50 text-center py-2">ยังไม่มีลิงก์ เพิ่ม Facebook, Instagram, TikTok, GitHub, Line ฯลฯ ได้เลย</p>
                              )}
                           </div>
                      </div>

                      {/* รับบริจาค / Support ผ่าน PromptPay */}
                      <div className="glass-card p-6 space-y-4 border-yellow">
                          <h3 className="font-bold flex items-center"><Heart className="mr-2 text-yellow-500" /> รับบริจาค / Support (PromptPay)</h3>
                          <p className="text-[11px] opacity-70 leading-relaxed">เปิดให้ผู้ชมกดสนับสนุนคุณผ่าน QR PromptPay โดยไม่เสียค่าธรรมเนียม gateway</p>
                          <div className="flex items-center justify-between p-4 bg-black/10 rounded-lg">
                              <span className="text-sm font-bold">เปิดรับบริจาค</span>
                              <button onClick={() => setAcceptSupport(!acceptSupport)} aria-label="เปิดรับบริจาค" className={`w-12 h-6 rounded-full transition-colors ${acceptSupport ? 'bg-green-500' : 'bg-gray-400'}`}><div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${acceptSupport ? 'translate-x-7' : 'translate-x-1'} mt-1`} /></button>
                          </div>
                          <div>
                              <label className="text-xs font-bold">เบอร์ PromptPay (10 หลัก) หรือ เลขบัตรประชาชน (13 หลัก)</label>
                              <input
                                value={promptpay}
                                onChange={e => setPromptpay(e.target.value.replace(/[^0-9]/g, '').slice(0, 13))}
                                inputMode="numeric"
                                placeholder="0812345678"
                                className="w-full p-3 rounded-lg mt-1 bg-black/10 border border-white/10 font-mono"
                              />
                              {acceptSupport && promptpay.length !== 10 && promptpay.length !== 13 && (
                                <p className="text-[10px] text-red-400 mt-1">⚠️ ต้องกรอกเบอร์ 10 หลัก หรือเลขบัตร 13 หลัก</p>
                              )}
                          </div>
                      </div>
                  </div>
              )}

              <Button variant="primary" size="lg" fullWidth leftIcon={<Save size={20} />} onClick={handleSave}>บันทึก &amp; สร้างหน้าเว็บ</Button>

              {shareLink && (
                  <div className="mt-4 p-4 bg-green-500/10 rounded-xl border border-green-500 flex justify-between items-center glass-card">
                      <div className="overflow-hidden mr-4">
                          <p className="text-xs text-green-500 font-bold">ลิงก์ของคุณพร้อมแล้ว:</p>
                          <p className="text-sm truncate font-bold">{shareLink}</p>
                      </div>
                      <div className="flex space-x-2">
                          <button onClick={() => navigator.clipboard.writeText(shareLink)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><Copy size={16}/></button>
                          <a href={shareLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><ExternalLink size={16}/></a>
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
