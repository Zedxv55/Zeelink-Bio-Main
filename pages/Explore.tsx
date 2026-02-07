import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { THAI_REGIONS } from '../constants';
import { Profile } from '../types';
import { Search, MapPin, Heart, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

declare var google: any;

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 13.7563,
  lng: 100.5018
};

const MAP_IMAGE_URL = "https://causal-orange-pk9vjigjsn.edgeone.app/depositphotos_32475753-stock-illustration-colorful-thailand-map.jpg";

export const Explore: React.FC = () => {
  const { usersList, profile: userProfile } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Sidebar Logic
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const [sidebarUsers, setSidebarUsers] = useState<Profile[]>([]);

  useEffect(() => {
    // Initial load
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
      
      // Filter by current user province if logged in and has location
      if (userProfile && userProfile.province) {
          const sameProvince = potentialUsers.filter(u => u.province === userProfile.province);
          if (sameProvince.length > 0) {
              potentialUsers = sameProvince;
          }
      }

      // Shuffle and pick 15
      const shuffled = [...potentialUsers].sort(() => 0.5 - Math.random());
      setSidebarUsers(shuffled.slice(0, 15));
  };

  const handleManualRefresh = () => {
      if (refreshCooldown > 0) return;
      refreshSidebarUsers();
      setRefreshCooldown(30);
  };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "" // Add API Key
  });

  const getProfilePosition = (provinceName: string) => {
      for (const region of THAI_REGIONS) {
          const province = region.provinces.find(p => p.name === provinceName);
          if (province) {
              return { 
                  lat: province.lat + (Math.random() - 0.5) * 0.05, 
                  lng: province.lng + (Math.random() - 0.5) * 0.05,
              };
          }
      }
      return { lat: 13.7563, lng: 100.5018 };
  };

  const getMarkerIcon = (profile: Profile) => {
      // Create a custom SVG string for the marker
      const ringColor = profile.showOnExplore ? '#22c55e' : '#9ca3af'; // Green or Gray
      const svg = `
        <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <clipPath id="circleView">
                    <circle cx="30" cy="30" r="24" fill="#FFFFFF" />
                </clipPath>
            </defs>
            <circle cx="30" cy="30" r="28" fill="none" stroke="${ringColor}" stroke-width="4" />
            <image width="48" height="48" x="6" y="6" href="${profile.photoUrl}" clip-path="url(#circleView)" preserveAspectRatio="xMidYMid slice" />
        </svg>
      `;
      return {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
          scaledSize: new google.maps.Size(50, 50),
          anchor: new google.maps.Point(25, 25)
      };
  };

  return (
    <div className="h-screen pt-16 flex flex-col md:flex-row overflow-hidden bg-gray-50 dark:bg-gray-900">
      
      {/* Sidebar List (Minimalist Design) */}
      <div className="w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-20 shadow-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex justify-between items-center">
             <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <MapPin className="mr-2 text-blue-500" size={20} />
                {userProfile?.province ? `คนใน ${userProfile.province}` : 'ผู้ใช้ออนไลน์'}
             </h1>
             <button 
                onClick={handleManualRefresh}
                disabled={refreshCooldown > 0}
                className={`p-2 rounded-full transition-colors ${refreshCooldown > 0 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}
                title="Refresh"
             >
                 <RefreshCw size={18} className={refreshCooldown > 0 ? 'animate-spin' : ''} />
             </button>
          </div>
          {refreshCooldown > 0 && <p className="text-xs text-gray-500 text-right">รีเฟรชได้ใน {refreshCooldown} วินาที...</p>}
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="ค้นหา..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2 text-gray-400" size={14} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
          {sidebarUsers.map(profile => (
            <div 
                key={profile.id} 
                onClick={() => setSelectedProfile(profile)}
                className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md cursor-pointer transition-all flex items-start space-x-3"
            >
                <img src={profile.photoUrl} alt={profile.displayName} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{profile.displayName}</h3>
                        <div className={`w-2 h-2 rounded-full ${profile.showOnExplore ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                        <MapPin size={10} className="mr-1" /> {profile.province}
                    </div>
                    <div className="flex items-center text-xs text-pink-500 mt-1">
                        <Heart size={10} className="mr-1 fill-pink-500" /> {profile.likes || 0}
                    </div>
                </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-gray-100 dark:bg-gray-900 overflow-hidden flex items-center justify-center">
         {isLoaded ? (
             <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={6}
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                }}
             >
                 {usersList.filter(u => u.showOnExplore).map(profile => {
                     const pos = getProfilePosition(profile.province);
                     return (
                         <Marker
                            key={profile.id}
                            position={{ lat: pos.lat, lng: pos.lng }}
                            onClick={() => setSelectedProfile(profile)}
                            icon={getMarkerIcon(profile)}
                         />
                     );
                 })}
                 {selectedProfile && (
                     <InfoWindow
                        position={getProfilePosition(selectedProfile.province)}
                        onCloseClick={() => setSelectedProfile(null)}
                     >
                         <div className="p-2 w-48 text-center">
                             <img src={selectedProfile.photoUrl} className="w-16 h-16 rounded-full mx-auto mb-2 object-cover" />
                             <h3 className="font-bold">{selectedProfile.displayName}</h3>
                             <p className="text-xs text-gray-500 mb-2">{selectedProfile.province}</p>
                             <div className="flex justify-center space-x-2 mt-2">
                                 <button onClick={() => navigate(`/${selectedProfile.username}`)} className="bg-blue-600 text-white text-xs px-3 py-1 rounded">ดูโปรไฟล์</button>
                             </div>
                         </div>
                     </InfoWindow>
                 )}
             </GoogleMap>
         ) : (
            <div className="relative h-full w-full bg-blue-50 flex items-center justify-center p-4">
                 <img src={MAP_IMAGE_URL} className="max-w-full max-h-full opacity-50" />
                 <div className="absolute text-center">
                     <p className="font-bold text-gray-500">Google Maps API Key Missing</p>
                     <p className="text-sm text-gray-400">Please configure metadata.json or code</p>
                 </div>
            </div>
         )}
      </div>
    </div>
  );
};