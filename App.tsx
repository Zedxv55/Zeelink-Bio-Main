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
import { Modal } from './components/ui/Modal';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const { isLoading, activePopup, closeActivePopup } = useAuth();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading Zeelink System...</div>;
  }

  return (
    <>
      <Navbar />
      
      {/* Global Popup System */}
      <Modal
        open={!!activePopup}
        onClose={closeActivePopup}
        title={activePopup?.title}
        imageUrl={activePopup?.imageUrl}
        linkUrl={activePopup?.linkUrl}
        linkLabel="ดูรายละเอียด"
      />

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
