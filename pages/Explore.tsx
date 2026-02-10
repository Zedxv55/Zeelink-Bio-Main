import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { THAI_REGIONS } from '../constants';
import { Profile } from '../types';
import { Search, MapPin, Heart, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

const center = { lat: 13.7563, lng: 100.5018 };

const IntroOverlay = ({ onComplete }: { onComplete: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-800 text-white animate-fade-in">
            <img src="https://brilliant-maroon-7qyv9qr1xg.edgeone.app/zl_icon_white_bg.png" className="w-24 h-24 mb-6 animate-bounce-slow rounded-2xl shadow-2xl" />
            <h1 className="text-4xl font-bold mb-4 tracking-wider">ค้นหาผู้ใช้...</h1>
            <div className="w-64 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-full origin-left animate-[scaleIn_2s_ease-out]" />
            </div>
            <p className="mt-4 text-white/70 animate-pulse">กำลังโหลดแผนที่ประเทศไทย</p>
        </div>
    );
};

export const Explore: React.FC = () => {
  const { usersList, profile: userProfile, toggleLike } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [search, setSearch] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Leaflet refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const navigate = useNavigate();

  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const [sidebarUsers, setSidebarUsers] = useState<Profile[]>([]);

  useEffect(() => {
    refreshSidebarUsers();
  }, [usersList, userProfile]);

  useEffect(() => {
    if (refreshCooldown > 0) {
      const timer = setTimeout(() => setRefreshCooldown(refreshCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [refreshCooldown]);

  const refreshSidebarUsers = () => {
      let potentialUsers = usersList.filter(u => u.showOnExplore);
      if (userProfile?.province) {
          const sameProv = potentialUsers.filter(u => u.province === userProfile.province);
          if (sameProv.length > 0) potentialUsers = sameProv;
      }
      const shuffled = [...potentialUsers].sort(() => 0.5 - Math.random());
      setSidebarUsers(shuffled.slice(0, 15));
  };

  const handleManualRefresh = () => {
      if (refreshCooldown > 0) return;
      refreshSidebarUsers();
      setRefreshCooldown(30);
  };

  const getProfilePosition = (provinceName: string) => {
      for (const region of THAI_REGIONS) {
          const province = region.provinces.find(p => p.name === provinceName);
          if (province) return { lat: province.lat + (Math.random() - 0.5) * 0.1, lng: province.lng + (Math.random() - 0.5) * 0.1 };
      }
      return center;
  };

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
              if (!ctx) return;

              // Draw ring
              ctx.beginPath();
              ctx.arc(40, 40, 38, 0, 2 * Math.PI);
              ctx.fillStyle = '#ffffff';
              ctx.fill();
              ctx.lineWidth = 4;
              ctx.strokeStyle = profile.showOnExplore ? '#00ff00' : '#999999';
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
              // Fallback to a simple colored circle if image fails
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

  // Initialize Map
  useEffect(() => {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const initialLat = userProfile?.province ? getProfilePosition(userProfile.province).lat : center.lat;
      const initialLng = userProfile?.province ? getProfilePosition(userProfile.province).lng : center.lng;
      const initialZoom = userProfile?.province ? 10 : 6;

      const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false
      }).setView([initialLat, initialLng], initialZoom);

      // Use CartoDB Dark Matter tiles for the Glass/Dark theme look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd'
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;

      return () => {
          map.remove();
          mapInstanceRef.current = null;
      };
  }, []); // Run once on mount

  // Update Markers
  useEffect(() => {
      if (!mapInstanceRef.current) return;
      const map = mapInstanceRef.current;

      const updateMarkers = async () => {
          const onlineUsers = usersList.filter(u => u.showOnExplore);
          
          // Remove old markers
          Object.keys(markersRef.current).forEach(id => {
              if (!onlineUsers.find(u => u.id === id)) {
                  markersRef.current[id].remove();
                  delete markersRef.current[id];
              }
          });

          // Add/Update markers
          for (const user of onlineUsers) {
              if (markersRef.current[user.id]) continue; // Skip if exists

              const iconUrl = await createMarkerIcon(user);
              const pos = getProfilePosition(user.province);

              const icon = L.icon({
                  iconUrl: iconUrl,
                  iconSize: [60, 60],
                  iconAnchor: [30, 30],
                  popupAnchor: [0, -30]
              });

              const marker = L.marker([pos.lat, pos.lng], { icon });
              marker.on('click', () => handleUserClick(user));
              marker.addTo(map);
              
              markersRef.current[user.id] = marker;
          }
      };

      updateMarkers();
  }, [usersList]); // Re-run when user list updates

  // Handle Sidebar Resize
  useEffect(() => {
      if (mapInstanceRef.current) {
          setTimeout(() => {
              mapInstanceRef.current?.invalidateSize();
          }, 300);
      }
  }, [sidebarOpen]);

  return (
    <div className="h-screen pt-16 flex flex-col md:flex-row overflow-hidden relative">
      {showIntro && <IntroOverlay onComplete={() => setShowIntro(false)} />}
      
      {/* Sidebar List (Smart Glass Sidebar) */}
      <div className={`glass-card fixed left-2 top-20 bottom-2 z-30 w-80 transition-transform duration-300 flex flex-col border-cyan ${sidebarOpen ? 'translate-x-0' : '-translate-x-[110%]'}`}>
        {/* Toggle Button */}
        <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-16 bg-white dark:bg-gray-800 border rounded-r-xl flex items-center justify-center shadow-md"
        >
            {sidebarOpen ? <ChevronLeft size={20} className="text-gray-500"/> : <ChevronRight size={20} className="text-gray-500"/>}
        </button>

        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
             <h1 className="text-lg font-bold flex items-center"><MapPin className="mr-2 text-blue-500" size={20} />คนใกล้คุณ</h1>
             <button onClick={handleManualRefresh} disabled={refreshCooldown > 0} className="p-2 text-blue-600 disabled:text-gray-400 transition-colors"><RefreshCw size={18} className={refreshCooldown > 0 ? 'animate-spin' : ''} /></button>
          </div>
          {refreshCooldown > 0 && <p className="text-[10px] text-gray-500 text-right">รีเฟรชได้ใน {refreshCooldown}s</p>}
          
          <div className="flex space-x-2">
              <button className="flex-1 py-1.5 text-xs font-bold bg-blue-500 text-white rounded-lg">📍 จังหวัดเดียวกัน</button>
              <button className="flex-1 py-1.5 text-xs font-bold bg-gray-500/20 text-gray-500 rounded-lg">อำเภอเดียวกัน</button>
          </div>

          <div className="relative">
            <input type="text" placeholder="ค้นหาคนไทย..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm rounded-lg" />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sidebarUsers.map(profile => (
            <div key={profile.id} onClick={() => handleUserClick(profile)} className="p-3 bg-white/10 rounded-xl border border-white/10 hover:border-cyan-500 cursor-pointer transition-all flex items-center space-x-3 group relative hover-glow-cyan">
                <div className="relative">
                    <img src={profile.photoUrl} className="w-10 h-10 rounded-full object-cover border border-white/20" />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${profile.showOnExplore ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate group-hover:text-cyan-400 transition-colors">{profile.displayName}</h3>
                    <div className="flex items-center text-[10px] opacity-70"><MapPin size={8} className="mr-1" /> {profile.province}</div>
                </div>
                <div className="flex flex-col items-center bg-pink-500/20 px-2 py-1 rounded-lg">
                    <Heart size={12} className="text-pink-500 fill-pink-500" />
                    <span className="text-[10px] font-bold text-pink-500">{profile.likes || 0}</span>
                </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`flex-1 relative bg-gray-900 transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
         {/* Map Container */}
         <div ref={mapContainerRef} className="w-full h-full z-10" />
      </div>

      {/* Custom User Popup */}
      {selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedProfile(null)}>
              <div className="glass-card border-cyan text-white p-0 shadow-2xl w-[320px] relative animate-[scaleIn_0.2s_ease-out]" onClick={e => e.stopPropagation()} style={{ background: 'rgba(20,20,20,0.9)' }}>
                  <button onClick={() => setSelectedProfile(null)} className="absolute top-3 right-3 text-white/60 hover:text-white"><X size={20}/></button>
                  
                  <div className="p-6 text-center">
                      <div className="relative inline-block mb-4">
                          <img src={selectedProfile.photoUrl} className="w-24 h-24 rounded-full border-4 border-cyan-500 object-cover bg-gray-800" />
                      </div>
                      
                      <h2 className="text-xl font-bold mb-1">{selectedProfile.displayName}</h2>
                      <p className="text-xs text-white/60 font-mono mb-4">UID: {selectedProfile.uid}</p>
                      
                      <div className="flex justify-center space-x-6 mb-6">
                          <div className="flex flex-col items-center">
                              <span className="text-2xl font-bold text-cyan-400">{selectedProfile.likes || 0}</span>
                              <span className="text-[10px] text-white/60 uppercase">Hearts</span>
                          </div>
                      </div>
                      
                      <p className="text-sm mb-6 flex items-center justify-center text-white/80">
                          <MapPin size={14} className="mr-1" /> {selectedProfile.district}, {selectedProfile.province}
                      </p>
                      
                      <div className="flex gap-3">
                          <button onClick={() => window.open(`/#/${selectedProfile.username}`, '_blank')} className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm transition-colors rounded-lg">
                              👤 ดูโปรไฟล์
                          </button>
                          <button onClick={() => toggleLike(selectedProfile.id)} className="flex-1 py-3 bg-transparent border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white font-bold text-sm transition-colors rounded-lg">
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