import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Map, Vote, LogIn, ArrowRight, Sparkles, Globe } from 'lucide-react';

// แผนที่ไทยแบบพิกเซล (1 = บก, 0 = ทะเล) — สัดส่วนคร่าวๆ
const MAP = [
  '00000000000000000000',
  '00000001100000000000',
  '00000001110000000000',
  '00000011110000000000',
  '00000011111000000000',
  '00000111111000000000',
  '00000111111100000000',
  '00001111111110000000',
  '00001111111110000000',
  '00001111111111000000',
  '00011111111111000000',
  '00011111111111000000',
  '00001111111100000000',
  '00000111111000000000',
  '00000111110000000000',
  '00000111100000000000',
  '00000111000000000000',
  '00000011100000000000',
  '00000011100000000000',
  '00000011000000000000',
  '00000011000000000000',
  '00000011000000000000',
  '00000010000000000000',
  '00000010000000000000',
  '00000010000000000000',
  '00000010000000000000',
  '00000000000000000000',
];

// จุดบนแผนที่ (คอลัมน์, แถว) — เชียงใหม่ / กรุงเทพ / อีสาน / ใต้
const PINS = [
  { c: 7, r: 4, label: 'เชียงใหม่' },
  { c: 7, r: 13, label: 'กรุงเทพ' },
  { c: 11, r: 9, label: 'อีสาน' },
  { c: 6, r: 21, label: 'ใต้' },
];

const STEPS = [
  { icon: <LayoutDashboard className="w-7 h-7" />, title: 'สร้างโปรไฟล์', desc: 'หน้าเดียวรวมลิงก์ ปรับธีมสีและภูมิภาคได้ทันที' },
  { icon: <Map className="w-7 h-7" />, title: 'สำรวจบนแผนที่', desc: 'เจอคนไทยทั่วประเทศ แยกตามภาคและจังหวัด' },
  { icon: <Vote className="w-7 h-7" />, title: 'โหวตและแชร์', desc: 'ตั้งคำถาม โหวต และช่วยกันตัดสินทิศทาง' },
];

const SAMPLES = [
  { name: 'สมชาย', handle: '@somchai', bio: 'คอนเทนต์ท่องเที่ยวไทย', tags: ['ท่องเที่ยว', 'vlog'], links: ['YouTube', 'Instagram', 'TikTok'], theme: 'pixel-card-cyan' },
  { name: 'มาลี', handle: '@malee.art', bio: 'วาดรูปและรับจ้างออกแบบ', tags: ['art', 'design'], links: ['Portfolio', 'Twitter'], theme: 'pixel-card-magenta' },
  { name: 'โต้ง', handle: '@totdev', bio: 'สอนโค้ดฟรีทุกวัน', tags: ['dev', 'edu'], links: ['GitHub', 'Blog', 'YouTube'], theme: 'pixel-card-green' },
];

const CELL = 15, GAP = 3, PITCH = CELL + GAP;

export const Landing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="pixel-landing">
      {/* ลูกเล่นลอยตัว */}
      <span className="float-deco" style={{ top: '12%', left: '8%' }}>⚡</span>
      <span className="float-deco" style={{ top: '22%', right: '10%', animationDelay: '1s' }}>🌟</span>
      <span className="float-deco" style={{ top: '60%', left: '6%', animationDelay: '2s' }}>💡</span>
      <span className="float-deco" style={{ top: '70%', right: '8%', animationDelay: '1.5s' }}>🗺️</span>

      {/* ===== HERO (โฆษณา) ===== */}
      <header className="px-6 pt-28 pb-12" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p className="pixel-tag" style={{ marginBottom: 18 }}>THAI CREATOR PLATFORM</p>
        <h1 className="pixel-h1" style={{ marginBottom: 22 }}>
          ZEELINK
        </h1>
        <p className="pixel-lede" style={{ marginBottom: 10 }}>
          แพลตฟอร์มพอร์ตโฟลิโอเชิงสังคมสำหรับคนไทย — เชื่อมครีเอเตอร์และคนทั่วประเทศ
          ด้วยหน้าโปรไฟล์สวยๆ บนแผนที่ และชุมชนที่โหวตไปพร้อมกัน
        </p>
        <p className="pixel-lede" style={{ marginBottom: 28, color: '#9be7ff' }}>
          ครีเอเตอร์ไทย มาสร้างบ้านของตัวเองได้แล้ววันนี้
        </p>

        <div className="flex flex-wrap gap-4">
          {!user ? (
            <button onClick={() => navigate('/login')} className="pixel-btn">
              <LogIn className="w-4 h-4" /> เข้าสู่ระบบ
            </button>
          ) : (
            <Link to="/dashboard" className="pixel-btn">
              <LayoutDashboard className="w-4 h-4" /> ไปหน้าแดชบอร์ด
            </Link>
          )}
          <button onClick={() => navigate('/explore')} className="pixel-btn alt">
            <Globe className="w-4 h-4" /> สำรวจแผนที่
          </button>
        </div>
      </header>

      {/* ===== PIXEL MAP (แผนที่ไทย animation) ===== */}
      <section className="px-6 py-10" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="pixel-map-wrap">
            <div className="pixel-map" style={{ gridTemplateColumns: `repeat(20, ${CELL}px)` }}>
              {MAP.map((row, r) =>
                row.split('').map((ch, c) => (
                  <div key={`${r}-${c}`} className={`pixel-cell ${ch === '1' ? 'land' : 'sea'}`} />
                ))
              )}
            </div>
            {PINS.map((p, i) => (
              <span
                key={i}
                className="pixel-pin"
                style={{ left: p.c * PITCH + 1, top: p.r * PITCH + 1, animationDelay: `${i * 0.3}s` }}
                title={p.label}
              />
            ))}
          </div>
          <div>
            <p className="pixel-tag" style={{ marginBottom: 14 }}>EXPLORE MAP</p>
            <h2 className="pixel-font" style={{ fontSize: 18, color: '#fff', marginBottom: 14, lineHeight: 1.5 }}>
              เจอคนไทย<br />บนแผนที่
            </h2>
            <p className="pixel-lede">
              ทุกจังหวัดมีพอร์ตของตัวเอง แยกตามภาคเหนือ กลาง อีสาน ใต้ —
              กดที่พินสว่างเพื่อดูโปรไฟล์ในพื้นที่นั้น สำรวจเพื่อนครีเอเตอร์ทั่วไทยได้ในที่เดียว
            </p>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS (ฟังก์ชันการใช้) ===== */}
      <section className="px-6 py-10" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p className="pixel-tag" style={{ marginBottom: 18 }}>HOW IT WORKS</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={i} className="pixel-card">
              <div style={{ color: '#00e5ff', marginBottom: 12 }}>{s.icon}</div>
              <h3 className="pixel-font" style={{ fontSize: 13, color: '#fff', marginBottom: 10, lineHeight: 1.5 }}>
                {`0${i + 1}`} {s.title}
              </h3>
              <p style={{ color: '#c7c2e2', fontSize: 15 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PROPOSED PORTFOLIO (พอร์ตที่เสนอ) ===== */}
      <section className="px-6 py-10" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p className="pixel-tag" style={{ marginBottom: 10 }}>YOUR PORTFOLIO</p>
        <h2 className="pixel-font" style={{ fontSize: 18, color: '#fff', marginBottom: 8, lineHeight: 1.5 }}>
          นี่คือพอร์ตที่คุณจะได้
        </h2>
        <p className="pixel-lede" style={{ marginBottom: 22 }}>
          ตัวอย่างโปรไฟล์บน Zeelink — ปรับธีมสี ใส่ลิงก์ หรือแชร์ให้คนอื่นเจอได้บนแผนที่
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLES.map((p, i) => (
            <div key={i} className={`pixel-card ${p.theme}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random`}
                  alt={p.name}
                  style={{ width: 48, height: 48, border: '2px solid #00e5ff' }}
                />
                <div>
                  <div style={{ color: '#fff', fontWeight: 700 }}>{p.name}</div>
                  <div style={{ color: '#9be7ff', fontSize: 13 }}>{p.handle}</div>
                </div>
              </div>
              <p style={{ color: '#c7c2e2', fontSize: 14, marginBottom: 12 }}>{p.bio}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {p.tags.map((t) => (
                  <span key={t} style={{ fontSize: 11, border: '1px solid #ff4fd8', color: '#ff4fd8', padding: '2px 8px' }}>{t}</span>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {p.links.map((l) => (
                  <span key={l} style={{ fontSize: 11, border: '1px solid #00e5ff', color: '#00e5ff', padding: '2px 8px' }}>{l}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="px-6 py-14" style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <h2 className="pixel-font" style={{ fontSize: 20, color: '#fff', marginBottom: 18, lineHeight: 1.6 }}>
          พร้อมสร้างบ้าน<br />ของคนไทยแล้ว?
        </h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={() => navigate('/login')} className="pixel-btn">
            <Sparkles className="w-4 h-4" /> เริ่มสร้างฟรี
          </button>
          <Link to="/vote" className="pixel-btn alt">
            ดูชุมชน <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer style={{ maxWidth: 1100, margin: '0 auto', padding: '30px 24px 70px', borderTop: '2px solid rgba(0,229,255,0.25)', color: '#8f8ab0', fontSize: 13 }}>
        © 2026 Zeelink Thailand — แพลตฟอร์มพอร์ตโฟลิโอสำหรับคนไทย
      </footer>
    </div>
  );
};
