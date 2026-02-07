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

const App: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">Loading Zeelink...</div>;
  }

  return (
    <>
      <Navbar />
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
