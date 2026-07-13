import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { THAI_REGIONS } from '../constants';
import { Profile } from '../types';
import { Search, MapPin, Heart, RefreshCw, X, ChevronLeft, ChevronRight, Shield, LocateFixed, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { Logo } from '../components/Logo';
import { DemoOverlay } from '../components/DemoOverlay';
import { haversineKm } from '../lib/ranking';

const center = { lat: 13.7563, lng: 100.5018 };

// ===== Landmark icons for illustrated Thai map (province-level decoration) =====
// Emoji-based landmarks give a vibrant "Amazing Thailand" cartoon feel without external assets
const PROVINCE_LANDMARKS: { [key: string]: string } = {
  'เชียงใหม่': '🏔️', 'เชียงราย': '🐘', 'ลำปาง': '🚂', 'น่าน': '🛕', 'แม่ฮ่องสอน': '⛰️',
  'กรุงเทพมหานคร': '🏙️', 'นนทบุรี': '🌉', 'ปทุมธานี': '🛫', 'พระนครศรีอยุธยา': '🏛️', 'สมุทรปราการ': '⚓',
  'ขอนแก่น': '🐲', 'นครราชสีมา': '🏰', 'อุดรธานี': '🌾', 'อุบลราชธานี': '🔥', 'บุรีรัมย์': '🏟️',
  'ภูเก็ต': '🏝️', 'สงขลา': '🌊', 'สุราษฎร์ธานี': '🐟', 'กระบี่': '🦀', 'นครศรีธรรมราช': '⛩️'
};

// ===== Privacy-safe snapping: find nearest province from raw lat/lng =====
// We NEVER store or display exact coordinates — only province/district level
const snapToProvince = (lat: number, lng: number): { province: string; region: string; lat: number; lng: number } | null => {
  let nearest: { province: string; region: string; lat: number; lng: number; dist: number } | null = null;
  for (const region of THAI_REGIONS) {
    for (const p of region.provinces) {
      const d = Math.sqrt(Math.pow(p.lat - lat, 2) + Math.pow(p.lng - lng, 2));
      if (!nearest || d < nearest.dist) {
        nearest = { province: p.name, region: region.name, lat: p.lat, lng: p.lng, dist: d };
      }
    }
  }
  return nearest ? { province: nearest.province, region: nearest.region, lat: nearest.lat, lng: nearest.lng } : null;
};

const IntroOverlay = ({ onComplete }: { onComplete: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center animate-fade-in"
            style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >
            <Logo size={96} variant="dark" className="mb-6 animate-bounce-slow rounded-2xl shadow-2xl" />
            <h1 className="text-4xl font-bold mb-4 tracking-wider">ค้นหาผู้ใช้...</h1>
            <div className="w-64 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--glass-border)' }}>
                <div className="h-full w-full origin-left animate-[scaleIn_2s_ease-out]" style={{ background: 'var(--orange)' }} />
            </div>
            <p className="mt-4 animate-pulse" style={{ color: 'var(--text-muted)' }}>กำลังโหลดแผนที่ประเทศไทย</p>
        </div>
    );
};

// ===== Privacy Notice Banner =====
const PrivacyNotice = ({ onClose }: { onClose: () => void }) => (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] w-[90vw] max-w-lg">
        <div className="glass-card border-[var(--green)] p-4 flex items-start space-x-3 shadow-xl">
            <Shield className="text-[var(--green)] mt-0.5 shrink-0" size={20} />
            <div className="flex-1">
                <p className="text-xs font-bold text-[var(--green)] mb-1">🔒 ความเป็นส่วนตัวของคุณ</p>
                <p className="text-[11px] leading-relaxed opacity-80">
                    ระบบจะแสดงพิกัดของคุณบนแผนที่ในระดับเขต/จังหวัดเท่านั้น
                    จะไม่มีการระบุและแสดงบ้านเลขที่หรือตำแหน่งที่ตั้งส่วนบุคคลที่แม่นยำเกินไป เพื่อความปลอดภัยของคุณ
                </p>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white shrink-0"><X size={16} /></button>
        </div>
    </div>
);

export const Explore: React.FC = () => {
  const { usersList, profile: userProfile, toggleLike, user, followingIds } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [search, setSearch] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(true);
  const [userProvince, setUserProvince] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Leaflet refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const landmarkLayerRef = useRef<L.LayerGroup | null>(null);

  const navigate = useNavigate();

  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const [sidebarUsers, setSidebarUsers] = useState<Profile[]>([]);
  const [filterMode, setFilterMode] = useState<'near' | 'province' | 'district'>('near');
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  useEffect(() => {
    refreshSidebarUsers();
  }, [usersList, userProfile, filterMode, refreshNonce]);

  useEffect(() => {
    if (refreshCooldown > 0) {
      const timer = setTimeout(() => setRefreshCooldown(refreshCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [refreshCooldown]);

  // หาพิกัดจังหวัดจาก THAI_REGIONS (ไม่มี jitter)
  const provinceCenter = (name: string): { lat: number; lng: number } | null => {
    for (const region of THAI_REGIONS) {
      const p = region.provinces.find(pr => pr.name === name);
      if (p) return { lat: p.lat, lng: p.lng };
    }
    return null;
  };

  // ระยะ haversine (km) ใช้จาก lib/ranking (แชร์กับ Feed — single source of truth)

  // เรียง sidebar ตามความใกล้ชิด + ความสนิทสนม:
  //   คนที่ติดตาม → จังหวัดเดียวกัน → ระยะห่างจากจังหวัดผู้ใช้ → ยอดถูกใจ
  // รองรับ filterMode ('near' | 'province' | 'district') เพื่อคงสถานะตัวกรองแม้ usersList เปลี่ยน
  const refreshSidebarUsers = () => {
      const potentialUsers = usersList.filter(u => u.showOnExplore);
      if (filterMode === 'province' && userProfile?.province) {
        setSidebarUsers(potentialUsers.filter(u => u.province === userProfile.province).slice(0, 15));
        return;
      }
      if (filterMode === 'district' && userProfile?.district) {
        setSidebarUsers(potentialUsers.filter(u => u.district === userProfile.district).slice(0, 15));
        return;
      }
      const me = userProfile?.province ? provinceCenter(userProfile.province) : null;
      const sorted = [...potentialUsers].sort((a, b) => {
        // 1. ความสนิทสนม (affinity): คนที่ติดตามขึ้นก่อน — แรงบันดาลใจจากระบบ EdgeRank
        const fa = followingIds.includes(a.userId) ? 0 : 1;
        const fb = followingIds.includes(b.userId) ? 0 : 1;
        if (fa !== fb) return fa - fb;
        if (userProfile?.province) {
          const am = a.province === userProfile.province ? 0 : 1;
          const bm = b.province === userProfile.province ? 0 : 1;
          if (am !== bm) return am - bm;
        }
        if (me) {
          const ca = provinceCenter(a.province);
          const cb = provinceCenter(b.province);
          if (ca && cb) return haversineKm(me, ca) - haversineKm(me, cb);
        }
        return (b.likes || 0) - (a.likes || 0);
      });
      setSidebarUsers(sorted.slice(0, 15));
  };

  const handleManualRefresh = () => {
      if (refreshCooldown > 0) return;
      setFilterMode('near');
      setRefreshNonce(n => n + 1);
      setRefreshCooldown(30);
  };

  // กรองรายชื่อตามจังหวัด/อำเภอเดียวกับผู้ใช้ (คงสถานะตัวกรองไว้ผ่าน filterMode)
  const filterBySameProvince = () => {
      if (!userProfile?.province) return;
      setFilterMode('province');
  };
  const filterBySameDistrict = () => {
      if (!userProfile?.district) return;
      setFilterMode('district');
  };

  const getProfilePosition = (provinceName: string) => {
      for (const region of THAI_REGIONS) {
          const province = region.provinces.find(p => p.name === provinceName);
          if (province) return { lat: province.lat + (Math.random() - 0.5) * 0.1, lng: province.lng + (Math.random() - 0.5) * 0.1 };
      }
      return center;
  };

  // ===== Geolocation permission flow (privacy-safe snapping) =====
  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Reverse-geocode to province level only (privacy-safe)
        const snapped = snapToProvince(pos.coords.latitude, pos.coords.longitude);
        if (snapped) {
          setUserProvince(snapped.province);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([snapped.lat, snapped.lng], 10, { animate: true });
          }
        }
        setGeoLoading(false);
      },
      (err) => {
        // Graceful fallback: use profile province if available
        if (userProfile?.province) setUserProvince(userProfile.province);
        setGeoError(err.code === 1 ? 'คุณปฏิเสธการแชร์ตำแหน่ง' : 'ไม่สามารถระบุตำแหน่งได้');
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  };

  // หมายเหตุ: ไม่ขอตำแหน่งอัตโนมัติแล้ว — จะขอเฉพาะเมื่อผู้ใช้กดปุ่ม "แชร์ตำแหน่ง" เท่านั้น

  const createMarkerIcon = (profile: Profile): Promise<string> => {
      return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = profile.photoUrl;
          img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = 80;
              canvas.height = 80;
              const ctx = canvas.getContext('2d');
              if (!ctx) { resolve(canvas.toDataURL()); return; }

              // Draw ring
              ctx.beginPath();
              ctx.arc(40, 40, 38, 0, 2 * Math.PI);
              ctx.fillStyle = '#ffffff';
              ctx.fill();
              ctx.lineWidth = 4;
              ctx.strokeStyle = profile.showOnExplore ? '#FF7A2F' : '#999999';
              ctx.stroke();

              // Clip and draw image
              ctx.save();
              ctx.beginPath();
              ctx.arc(40, 40, 34, 0, 2 * Math.PI);
              ctx.clip();
              ctx.drawImage(img, 6, 6, 68, 68);
              ctx.restore();

              resolve(canvas.toDataURL());
          };
          img.onerror = () => {
              const canvas = document.createElement('canvas');
              canvas.width = 80;
              canvas.height = 80;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                  ctx.beginPath();
                  ctx.arc(40, 40, 38, 0, 2 * Math.PI);
                  ctx.fillStyle = '#cccccc';
                  ctx.fill();
              }
              resolve(canvas.toDataURL());
          };
      });
  };

  const handleUserClick = (profile: Profile) => {
      setSelectedProfile(profile);
      if (mapInstanceRef.current) {
          const pos = getProfilePosition(profile.province);
          mapInstanceRef.current.flyTo([pos.lat, pos.lng], 12, { animate: true });
      }
  };

  // Initialize Map with vibrant illustrated styling
  useEffect(() => {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const initialLat = userProfile?.province ? getProfilePosition(userProfile.province).lat : center.lat;
      const initialLng = userProfile?.province ? getProfilePosition(userProfile.province).lng : center.lng;
      const initialZoom = userProfile?.province ? 10 : 6;

      const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
          // Support rotate gesture (pinch/keyboard) where available
          keyboard: true
      }).setView([initialLat, initialLng], initialZoom);

      // Vibrant illustrated base: CartoDB Positron (light) with CSS saturation boost
      // Gives a clean colorful canvas feel for the "Amazing Thailand" look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd'
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;

      // Decorative landmark layer (illustrated Thai map feel)
      const landmarkLayer = L.layerGroup().addTo(map);
      landmarkLayerRef.current = landmarkLayer;
      for (const region of THAI_REGIONS) {
        for (const p of region.provinces) {
          const emoji = PROVINCE_LANDMARKS[p.name] || '📍';
          const icon = L.divIcon({
            className: 'landmark-icon',
            html: `<div style="font-size:22px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4));">${emoji}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });
          L.marker([p.lat, p.lng], { icon, interactive: false, keyboard: false }).addTo(landmarkLayer);
        }
      }

      return () => {
          map.remove();
          mapInstanceRef.current = null;
          landmarkLayerRef.current = null;
      };
  }, []); // Run once on mount

  // Update Markers
  useEffect(() => {
      if (!mapInstanceRef.current) return;
      const map = mapInstanceRef.current;

      const updateMarkers = async () => {
          const onlineUsers = usersList.filter(u => u.showOnExplore);

          Object.keys(markersRef.current).forEach(id => {
              if (!onlineUsers.find(u => u.id === id)) {
                  markersRef.current[id].remove();
                  delete markersRef.current[id];
              }
          });

          for (const user of onlineUsers) {
              if (markersRef.current[user.id]) continue;
              const iconUrl = await createMarkerIcon(user);
              const pos = getProfilePosition(user.province);
              const icon = L.icon({ iconUrl: iconUrl, iconSize: [60, 60], iconAnchor: [30, 30], popupAnchor: [0, -30] });
              const marker = L.marker([pos.lat, pos.lng], { icon });
              marker.on('click', () => handleUserClick(user));
              marker.addTo(map);
              markersRef.current[user.id] = marker;
          }
      };

      updateMarkers();
  }, [usersList]);

  // Handle Sidebar Resize
  useEffect(() => {
      if (mapInstanceRef.current) {
          setTimeout(() => mapInstanceRef.current?.invalidateSize(), 300);
      }
  }, [sidebarOpen]);

  const isDemo = !user;

  // กรองตามช่องค้นหา (ชื่อ / จังหวัด / แท็ก)
  const shown = search.trim()
    ? sidebarUsers.filter(u => (u.displayName + ' ' + u.province + ' ' + (u.tags || []).join(' ')).toLowerCase().includes(search.toLowerCase()))
    : sidebarUsers;

  return (
    <div className="h-screen pt-16 flex flex-col md:flex-row overflow-hidden relative">
      {showIntro && <IntroOverlay onComplete={() => setShowIntro(false)} />}
      {showPrivacy && <PrivacyNotice onClose={() => setShowPrivacy(false)} />}
      {isDemo && <DemoOverlay title="ล็อกอินเพื่อสำรวจแผนที่" subtitle="และค้นพบเพื่อนครีเอเตอร์ทั่วไทย" />}

      {/* Geolocation control button */}
      <button
        onClick={requestGeolocation}
        disabled={geoLoading}
        className="fixed top-20 right-3 z-[55] flex items-center space-x-2 px-3 py-2 rounded-xl glass-card border-[var(--orange)] text-xs font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
        title="ใช้ตำแหน่งปัจจุบันของคุณ (ระดับจังหวัดเท่านั้น)"
      >
        {geoLoading ? <RefreshCw size={14} className="animate-spin" /> : <LocateFixed size={14} className="text-[var(--orange)]" />}
        <span>{userProvince ? `📍 ${userProvince}` : 'แชร์ตำแหน่ง'}</span>
      </button>

      {geoError && (
        <div className="fixed top-32 right-3 z-[55] px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-[11px] text-red-200 max-w-[200px]">
          {geoError}
        </div>
      )}

      {/* Always-visible sidebar toggle (works on mobile too) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-20 left-2 md:left-[88px] lg:left-[256px] z-40 w-8 h-16 bg-white dark:bg-gray-800 border rounded-r-xl flex items-center justify-center shadow-md"
      >
        {sidebarOpen ? <ChevronLeft size={20} className="text-gray-500"/> : <ChevronRight size={20} className="text-gray-500"/>}
      </button>

      {/* Sidebar List (Smart Glass Sidebar) */}
      <div className={`glass-card fixed left-2 md:left-[88px] lg:left-[256px] top-20 bottom-2 z-30 w-[85vw] max-w-sm md:w-80 transition-transform duration-300 flex flex-col border-[var(--orange)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-[110%]'} ${isDemo ? 'pointer-events-none blur-sm opacity-70' : ''}`}>

        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
             <h1 className="text-lg font-bold flex items-center"><MapPin className="mr-2 text-blue-500" size={20} />คนใกล้คุณ</h1>
             <button onClick={handleManualRefresh} disabled={refreshCooldown > 0} className="p-2 text-[var(--orange)] disabled:text-gray-400 transition-colors"><RefreshCw size={18} className={refreshCooldown > 0 ? 'animate-spin' : ''} /></button>
          </div>
          {refreshCooldown > 0 && <p className="text-[10px] text-gray-500 text-right">รีเฟรชได้ใน {refreshCooldown}s</p>}

          <div className="flex space-x-2">
              <button onClick={filterBySameProvince} className="flex-1 py-1.5 text-xs font-bold bg-[var(--orange)] text-white rounded-lg">📍 จังหวัดเดียวกัน</button>
              <button onClick={filterBySameDistrict} className="flex-1 py-1.5 text-xs font-bold bg-gray-500/20 text-gray-500 rounded-lg">อำเภอเดียวกัน</button>
          </div>

          <div className="relative">
            <input type="text" placeholder="ค้นหาคนไทย..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm rounded-lg" />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {shown.map(profile => (
            <div key={profile.id} onClick={() => handleUserClick(profile)} className="p-3 bg-white/10 rounded-xl border border-white/10 hover:border-[var(--orange)] cursor-pointer transition-all flex items-center space-x-3 group relative hover-glow-cyan">
                <div className="relative">
                    <img src={profile.photoUrl} className="w-10 h-10 rounded-full object-cover border border-white/20" />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${profile.showOnExplore ? 'bg-[var(--green)]' : 'bg-gray-400'}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate group-hover:text-[var(--orange)] transition-colors">{profile.displayName}</h3>
                    <div className="flex items-center text-[10px] opacity-70"><MapPin size={8} className="mr-1" /> {profile.province}</div>
                </div>
                <div className="flex flex-col items-center bg-[var(--pink)]/20 px-2 py-1 rounded-lg">
                    <Heart size={12} className="text-[var(--pink)] fill-[var(--pink)]" />
                    <span className="text-[10px] font-bold text-[var(--pink)]">{profile.likes || 0}</span>
                </div>
            </div>
          ))}
          {shown.length === 0 && (
            <p className="text-center text-xs opacity-50 mt-8">ไม่พบผู้ใช้ในพื้นที่นี้</p>
          )}
        </div>
      </div>

      <div className={`flex-1 relative bg-gray-900 transition-all duration-300 ${sidebarOpen ? 'md:ml-80' : 'ml-0'} ${isDemo ? 'pointer-events-none blur-sm opacity-70' : ''}`}>
         {/* Banner ชี้แจงความชัดเจน: ตอนนี้แสดงเฉพาะโปรไฟล์ตัวอย่าง (DEMO) */}
         {showDemoBanner && !isDemo && (
           <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[55] w-[92vw] max-w-xl">
             <div className="glass-card border-[var(--orange)] px-4 py-2.5 flex items-start space-x-2 shadow-xl">
               <span className="text-base shrink-0">📍</span>
               <p className="flex-1 text-[11px] leading-relaxed opacity-90">
                 <span className="font-bold text-[var(--orange)]">DEMO:</span> ขณะนี้แผนที่แสดงเฉพาะโปรไฟล์ตัวอย่าง เพราะยังมีสมาชิกตั้งค่า "แสดงในแผนที่" น้อย —
                 สมัครสมาชิกและเปิด "แสดงในแผนที่" ในหน้าแดชบอร์ด เพื่อให้โปรไฟล์คุณปรากฏที่นี่
               </p>
               <button onClick={() => setShowDemoBanner(false)} className="text-white/50 hover:text-white shrink-0" aria-label="ปิด"><X size={14} /></button>
             </div>
           </div>
         )}
         {/* Vibrant map container */}
         <div ref={mapContainerRef} className="w-full h-full z-10 thai-map-vibrant" />
      </div>

      {/* Custom User Popup */}
      {selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedProfile(null)}>
              <div className="glass-card border-[var(--orange)] text-white p-0 shadow-2xl w-[320px] relative animate-[scaleIn_0.2s_ease-out]" onClick={e => e.stopPropagation()} style={{ background: 'rgba(20,20,20,0.9)' }}>
                  <button onClick={() => setSelectedProfile(null)} className="absolute top-3 right-3 text-white/60 hover:text-white"><X size={20}/></button>

                  <div className="p-6 text-center">
                      <div className="relative inline-block mb-4">
                          <img src={selectedProfile.photoUrl} className="w-24 h-24 rounded-full border-4 border-[var(--orange)] object-cover bg-gray-800" />
                      </div>

                      <h2 className="text-xl font-bold mb-1">{selectedProfile.displayName}</h2>
                      <p className="text-xs text-white/60 font-mono mb-4">UID: {selectedProfile.uid}</p>

                      <div className="flex justify-center space-x-6 mb-6">
                          <div className="flex flex-col items-center">
                              <span className="text-2xl font-bold text-[var(--orange)]">{selectedProfile.likes || 0}</span>
                              <span className="text-[10px] text-white/60 uppercase">Hearts</span>
                          </div>
                      </div>

                      <p className="text-sm mb-6 flex items-center justify-center text-white/80">
                          <MapPin size={14} className="mr-1" /> {selectedProfile.district}, {selectedProfile.province}
                      </p>

                      <div className="flex gap-3">
                          <button onClick={() => navigate(`/${selectedProfile.username}`)} className="flex-1 py-3 bg-[var(--orange)] hover:bg-[var(--orange-deep)] text-white font-bold text-sm transition-colors rounded-lg">
                              👤 ดูโปรไฟล์
                          </button>
                          <button onClick={() => toggleLike(selectedProfile.id)} className="flex-1 py-3 bg-transparent border-2 border-[var(--orange)] text-[var(--orange)] hover:bg-[var(--orange)] hover:text-white font-bold text-sm transition-colors rounded-lg">
                              ❤️ ถูกใจ
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
