import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const { user, activePopup, closeActivePopup } = useAuth();
  const location = useLocation();

  // หน้าแรกที่ผู้ใช้เห็นเสมอ = หน้าล็อกอิน (มีฟีดเบลอๆ ข้างหลัง)
  // ซ่อนแถบเมนู/มาสคอต/ป็อปอัพ บนหน้าล็อกอินเพื่อความสะอาด
  const showChrome = !(location.pathname === '/' || location.pathname === '/login');

  // Guard หน้าข้างใน: ต้องล็อกอินก่อน ไม่งั้นเด้งกลับหน้าล็อกอิน
  // (กันกรณีเปิดลิงก์ตรงเช่น /feed โดยยังไม่ได้กรอกรหัส)
  const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
  };

  // หมายเหตุ: ไม่บล็อกหน้าจอด้วย isLoading เพื่อกันหน้าว่างค้าง
  // (กรณี Supabase ไม่ตอบสนอง เดิมจะค้างที่ "Loading...") — แสดงแอปทันที
  // หน้าแรกคือ Login เสมอ ไม่ว่าเคย "จำรหัสผ่าน" ไว้หรือไม่
  // พอกรอกรหัสสำเร็จ หน้า Login จะพาไป /feed ให้ใช้งานต่อ

  return (
    <ErrorBoundary>
      <>
        {showChrome && <Navbar />}
        {showChrome && <AiMascot />}

        {/* Global Popup System — ซ่อนบนหน้า Login */}
        {showChrome && (
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
        )}

        {/* เว้นระยะด้านบนให้แถบเมนู (ทุกจอ) */}
        <div className={showChrome ? 'pt-[60px]' : ''}>
          <Routes>
            {/* หน้าแรก = หน้าล็อกอินเสมอ (มีฟีดเบลอข้างหลัง) */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<RequireAuth><AdminPanel /></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/feed" element={<RequireAuth><Feed /></RequireAuth>} />
            <Route path="/explore" element={<RequireAuth><Explore /></RequireAuth>} />
            <Route path="/vote" element={<RequireAuth><Vote /></RequireAuth>} />
            <Route path="/:username" element={<ProfilePage />} />
          </Routes>
        </div>
      </>
    </ErrorBoundary>
  );
};

export default App;
