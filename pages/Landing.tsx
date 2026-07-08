import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Map, Vote, LogIn, ArrowRight } from 'lucide-react';

export const Landing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [generic, setGeneric] = useState(false);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = stepsRef.current?.querySelectorAll<HTMLElement>('.nb-step') ?? [];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const cards = [
    {
      title: 'สร้าง Dashboard',
      desc: 'ตกแต่งหน้าโปรไฟล์รวมลิงก์ของคุณ',
      icon: <LayoutDashboard className="w-7 h-7" />,
      link: '/dashboard',
      tag: '01 / PROFILE',
      accent: 'var(--accent-cyan)',
    },
    {
      title: 'Online — สำรวจแผนที่',
      desc: 'ค้นหาคนไทยใกล้เคียงบนแผนที่',
      icon: <Map className="w-7 h-7" />,
      link: '/explore',
      tag: '02 / EXPLORE',
      accent: 'var(--accent-purple)',
    },
    {
      title: 'โหวต',
      desc: 'สังคมแห่งการแชร์และตัดสินใจ',
      icon: <Vote className="w-7 h-7" />,
      link: '/vote',
      tag: '03 / VOTE',
      accent: 'var(--accent-pink)',
    },
  ];

  return (
    <div className="relative" ref={stepsRef}>
      <div className="nb-rail" />

      {/* ===== HERO ===== */}
      <header className="px-6 pt-24 pb-10" style={{ maxWidth: 'var(--maxw)', margin: '0 auto' }}>
        <p className="nb-eyebrow">แพลตฟอร์มพอร์ตโฟลิโอเชิงสังคมสำหรับคนไทย</p>
        <h1 className="nb-h1">
          Zeelink<br />
          <span style={{ color: 'var(--blueprint)' }}>เชื่อมคนไทย ด้วยพอร์ตโฟลิโอที่มีชีวิต</span>
        </h1>
        <p className="nb-lede">
          หน้าโปรไฟล์รวมลิงก์ สำรวจคนบนแผนที่ และร่วมโหวตกับชุมชน — ออกแบบมาเพื่อครีเอเตอร์ไทย โดยคนไทย
        </p>

        {!user && (
          <div className="mt-8">
            <button
              onClick={() => navigate('/login')}
              className="nb-btn nb-btn-primary"
            >
              <LogIn className="mr-2 w-4 h-4" /> เข้าสู่ระบบ
            </button>
          </div>
        )}
      </header>

      {/* ===== HOW IT WORKS (sequence) ===== */}
      <section className="nb-step">
        <div className="nb-step-num">01</div>
        <h2 className="nb-h2">สมัคร และสร้างโปรไฟล์</h2>
        <p className="nb-body">เริ่มจากอีเมลเดียว สร้างหน้าโปรไฟล์รวมลิงก์ ปรับธีมสีและภูมิภาคของคุณได้ทันที</p>
        <div className="nb-pin-card">
          <div className="nb-pin-row"><div className="nb-pin-label">หัวข้อ</div><div className="nb-pin-value">พอร์ตโฟลิโอส่วนตัวของคุณ</div></div>
          <div className="nb-pin-row"><div className="nb-pin-label">ทำอะไร</div><div className="nb-pin-value">รวมลิงก์ สรุปตัวตน ปรับธีม</div></div>
          <div className="nb-pin-row"><div className="nb-pin-label">จบใน</div><div className="nb-pin-value">ไม่กี่นาที</div></div>
        </div>
      </section>

      <section className="nb-step">
        <div className="nb-step-num">02</div>
        <h2 className="nb-h2">สำรวจคนบนแผนที่</h2>
        <p className="nb-body">ดูโปรไฟล์คนไทยทั่วประเทศบนแผนที่ แยกตามภาคและจังหวัด แล้วเจอกันได้ง่ายขึ้น</p>
        <div className="nb-pin-card">
          <div className="nb-pin-row"><div className="nb-pin-label">มุมมอง</div><div className="nb-pin-value">แผนที่แบ่งตามภาค / จังหวัด</div></div>
          <div className="nb-pin-row"><div className="nb-pin-label">ค้นหา</div><div className="nb-pin-value">ใกล้เคียง · ตามหมวดหมู่</div></div>
        </div>
      </section>

      <section className="nb-step">
        <div className="nb-step-num">03</div>
        <h2 className="nb-h2">โหวต และแชร์</h2>
        <p className="nb-body">ตั้งคำถามกับชุมชน โหวตสิ่งที่อยากเห็น และช่วยกันตัดสินทิศทางของแพลตฟอร์ม</p>
        <div className="nb-pin-card">
          <div className="nb-pin-row"><div className="nb-pin-label">กิจกรรม</div><div className="nb-pin-value">ถาม · โหวต · เรียงอันดับ</div></div>
          <div className="nb-pin-row"><div className="nb-pin-label">ผลลัพธ์</div><div className="nb-pin-value">เสียงของคนไทยนำทางการพัฒนา</div></div>
        </div>
      </section>

      {/* ===== FEATURE CARDS ===== */}
      <section className="nb-step">
        <div className="nb-step-num">04</div>
        <h2 className="nb-h2">สามสิ่งที่คุณทำได้</h2>
        <p className="nb-body">ทุกฟีเจอร์เริ่มจากคำถามเดียว: หน้านี้มีไว้ทำอะไร — ไม่ใช่ของตกแต่ง</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
          {cards.map((card, idx) => (
            <div key={idx} className="nb-card group">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: card.accent, color: '#fff' }}
              >
                {card.icon}
              </div>
              <p className="nb-eyebrow" style={{ marginBottom: 6 }}>{card.tag}</p>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--thai)' }}>{card.title}</h3>
              <p className="nb-body" style={{ marginBottom: 18 }}>{card.desc}</p>
              {user ? (
                <Link to={card.link} className="nb-btn w-full">
                  เปิด <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              ) : (
                <button onClick={() => navigate('/login')} className="nb-btn w-full opacity-70">
                  เข้าสู่ระบบก่อน
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== CRITIQUE (shows reasoning) ===== */}
      <section className="nb-step">
        <div className="nb-step-num">05</div>
        <h2 className="nb-h2">สิ่งที่เราตัดสินใจเก็บ และตัดทิ้ง</h2>
        <p className="nb-body">งานดีไซน์จาก AI มักวนอยู่ไม่กี่แบบ เราเช็คตัวเองก่อนลงมือเสมอ</p>
        <div className="nb-critique-list">
          <div className="nb-critique-item cut"><span className="nb-tag cut">ตัดทิ้ง</span><span className="nb-text">พื้นดำ + สีสะท้อนแสง neon จุดเดียว</span></div>
          <div className="nb-critique-item cut"><span className="nb-tag cut">ตัดทิ้ง</span><span className="nb-text">เซอริฟคอนทราสต์สูงบนครีม (โคลน AI ทั่วไป)</span></div>
          <div className="nb-critique-item keep"><span className="nb-tag keep">เก็บไว้</span><span className="nb-text">กระดาษมีเส้นบรรทัด + สีแต่ละสีทำหน้าที่ต่างกันจริง</span></div>
          <div className="nb-critique-item keep"><span className="nb-tag keep">เก็บไว้</span><span className="nb-text">ฟอนต์โทนเครื่องพิมพ์ (IBM Plex) แทนจอประกาศ</span></div>
        </div>
      </section>

      {/* ===== SIGNATURE TOGGLE ===== */}
      <section className="nb-step" style={{ paddingBottom: 40 }}>
        <div className="nb-step-num">06</div>
        <h2 className="nb-h2">ลองสลับดูความต่าง</h2>
        <p className="nb-body">กดสลับสองปุ่มด้านล่าง การ์ดใบเดียวกันเปลี่ยนไปแค่ไหน เมื่อเปลี่ยนจาก "ทั่วไป" เป็น "ตั้งใจ"</p>
        <div className="nb-toggle-wrap">
          <button className={`nb-toggle-btn ${!generic ? 'active' : ''}`} onClick={() => setGeneric(false)}>แบบตั้งใจ (Zeelink)</button>
          <button className={`nb-toggle-btn ${generic ? 'active' : ''}`} onClick={() => setGeneric(true)}>แบบทั่วไป</button>
        </div>
        <div
          className="nb-demo-card"
          style={generic ? { background: '#F4F1EA', color: '#2b2620' } : undefined}
        >
          <p className="nb-demo-eyebrow" style={generic ? { fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#B0603F', letterSpacing: 0, textTransform: 'none' } : undefined}>
            ตัวอย่างโปรไฟล์
          </p>
          <h3 className="nb-demo-title" style={generic ? { fontFamily: 'Georgia, serif' } : undefined}>สมชาย · ครีเอเตอร์ไทย</h3>
          <p className="nb-demo-text">โปรไฟล์นี้รวมลิงก์ทั้งหมดของฉัน ปรับธีมได้ และเจอบนแผนที่ได้ง่าย</p>
          <span className="nb-btn nb-btn-primary" style={generic ? { background: '#D97757', borderColor: '#D97757' } : undefined}>ดูโปรไฟล์</span>
        </div>
      </section>

      <footer className="nb-footer">
        <p className="nb-footer-line">Zeelink ถูกออกแบบด้วยกระบวนการเดียวกับที่คุณเห็นข้างบน — คิดก่อนลงมือเสมอ</p>
        <div className="nb-signoff">— Zeelink, แพลตฟอร์มพอร์ตโฟลิโอสำหรับคนไทย</div>
      </footer>
    </div>
  );
};
