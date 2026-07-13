import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AiMascot } from './components/AiMascot';
import { Login } from './pages/Login';
import { Modal } from './components/ui/Modal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuth } from './contexts/AuthContext';

// ===== Code-splitting: หน้าแรก (Login) โหลดทันที ส่วนหน้าอื่นแบ่งเป็น chunk แยก =====
// ช่วยลดขนาด initial bundle อย่างมีนัยสำคัญ (โหลดตามความจำเป็นตอนเปิดหน้านั้น)
const Feed = lazy(() => import('./pages/Feed').then(m => ({ default: m.Feed })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Explore = lazy(() => import('./pages/Explore').then(m => ({ default: m.Explore })));
const Vote = lazy(() => import('./pages/Vote').then(m => ({ default: m.Vote })));
const ProfilePage = lazy(() => import('./pages/Profile').then(m => ({ default: m.ProfilePage })));
const AdminPanel = lazy(() => import('./pages/AdminPanel').then(m => ({ default: m.AdminPanel })));

// หน้าโหลดตอน lazy chunk กำลังมาติดตั้ง — กันหน้าว่างกระพริบ (UX: ใช้งานรู้สึกเร็วขึ้น)
const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3" style={{ color: 'var(--text-muted)' }}>
    <div className="w-9 h-9 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--glass-border)', borderTopColor: 'var(--orange)' }} />
    <p className="text-sm" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>กำลังโหลด...</p>
  </div>
);

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
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </div>
      </>
    </ErrorBoundary>
  );
};

export default App;
