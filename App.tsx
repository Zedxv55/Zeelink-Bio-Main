import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AiMascot } from './components/AiMascot';
import { Dashboard } from './pages/Dashboard';
import { Explore } from './pages/Explore';
import { Vote } from './pages/Vote';
import { Feed } from './pages/Feed';
import { ProfilePage } from './pages/Profile';
import { Login } from './pages/Login';
import { AdminPanel } from './pages/AdminPanel';
import { Modal } from './components/ui/Modal';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const { user, activePopup, closeActivePopup } = useAuth();
  const location = useLocation();

  // หน้า Login คือจุดทางเข้าหลัก → ซ่อนแถบเมนู/มาสคอต เพื่อความสะอาด
  const showChrome = location.pathname !== '/login';

  // หมายเหตุ: ไม่บล็อกหน้าจอด้วย isLoading เพื่อกันหน้าว่างค้าง
  // (กรณี Supabase ไม่ตอบสนอง เดิมจะค้างที่ "Loading...") — แสดงแอปทันที
  // แล้วค่อยโหลด session/ข้อมูลเบื้องหลัง สำหรับผู้ที่ล็อกอินอยู่จะเห็นหน้า Login
  // กระพริบสั้นๆ แล้วเปลี่ยนเป็นฟีดอัตโนมัติ

  return (
    <>
      {showChrome && <Navbar />}
      {showChrome && <AiMascot />}

      {/* Global Popup System */}
      <Modal
        open={!!activePopup}
        onClose={closeActivePopup}
        title={activePopup?.title}
        imageUrl={activePopup?.imageUrl}
        linkUrl={activePopup?.linkUrl}
        linkLabel="ดูรายละเอียด"
      >
        {activePopup?.content && <div>{activePopup.content}</div>}
      </Modal>

      {/* เว้นระยะด้านบนให้แถบเมนู (ทุกจอ) */}
      <div className={showChrome ? 'pt-[60px]' : ''}>
        <Routes>
          {/* หน้าแรก = ฟีดทุกคน (ล็อกอินแล้ว) หรือหน้า Login (ยังไม่ล็อกอิน) */}
          <Route path="/" element={user ? <Feed /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/:username" element={<ProfilePage />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
