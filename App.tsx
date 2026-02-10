import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Explore } from './pages/Explore';
import { Vote } from './pages/Vote';
import { ProfilePage } from './pages/Profile';
import { Login } from './pages/Login';
import { AdminPanel } from './pages/AdminPanel';
import { useAuth } from './contexts/AuthContext';
import { X } from 'lucide-react';

const App: React.FC = () => {
  const { isLoading, activePopup, closeActivePopup } = useAuth();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Loading Zeelink System...</div>;
  }

  return (
    <>
      <Navbar />
      
      {/* Global Popup System */}
      {activePopup && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden animate-[scaleIn_0.3s_ease-out]">
                  <button onClick={closeActivePopup} className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"><X size={20}/></button>
                  {activePopup.imageUrl && <img src={activePopup.imageUrl} className="w-full h-64 object-cover" />}
                  <div className="p-6 text-center">
                      <h3 className="text-2xl font-bold mb-2 dark:text-white">{activePopup.title}</h3>
                      {activePopup.linkUrl && (
                          <a href={activePopup.linkUrl} target="_blank" rel="noreferrer" className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors">
                              ดูรายละเอียด
                          </a>
                      )}
                  </div>
              </div>
          </div>
      )}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/:username" element={<ProfilePage />} />
      </Routes>
    </>
  );
};

export default App;
