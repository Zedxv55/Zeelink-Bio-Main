import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Profile } from '../types';
import { ThaiBackground } from '../components/ThaiBackground';
import { PixelMascot } from '../components/PixelMascot';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { fonts, fontSize, lineHeight, spacing, layout } from '../lib/designTokens';
import { LayoutDashboard, Map, Vote, LogIn, ArrowRight, Sparkles, Globe, X } from 'lucide-react';

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
  const { user, usersList } = useAuth();
  const navigate = useNavigate();

  // ===== Interactive tag → filter profiles by mood (simulated) =====
  const [activeMood, setActiveMood] = useState<string | null>(null);

  // Scroll-reveal: เลือนส่วนต่าง ๆ เข้ามาตอนเลื่อนถึง (อนิเมชั่นมีหน้าที่ = ชี้นำความสนใจ ตาม Blueprint N2)
  const landingRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = landingRef.current;
    if (!root) return;
    const items = root.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const filterProfilesByMood = (mood: string): Profile[] => {
    const kw = mood.toLowerCase();
    const matched = usersList.filter(u =>
      (u.tags || []).some(t => t.toLowerCase().includes(kw)) ||
      (u.bio || '').toLowerCase().includes(kw) ||
      (u.displayName || '').toLowerCase().includes(kw)
    );
    // No direct match → show a random sample (simulated "matching vibe")
    if (matched.length === 0) {
      const shuffled = [...usersList].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 6);
    }
    return matched.slice(0, 8);
  };

  return (
    <div className="pixel-landing" ref={landingRef}>
      {/* Pixel Mascot — ตัวการ์ตูนพิกเซลขับตามเมาส์ */}
      <PixelMascot />
      {/* ===== Interactive floating phrases (clickable filter tags) ===== */}
      <ThaiBackground onTagClick={setActiveMood} />

      {/* ลูกเล่นลอยตัว */}
      <span className="float-deco" style={{ top: '12%', left: '8%' }}>⚡</span>
      <span className="float-deco" style={{ top: '22%', right: '10%', animationDelay: '1s' }}>🌟</span>
      <span className="float-deco" style={{ top: '60%', left: '6%', animationDelay: '2s' }}>💡</span>
      <span className="float-deco" style={{ top: '70%', right: '8%', animationDelay: '1.5s' }}>🗺️</span>

      {/* ===== HERO (โฆษณา) ===== */}
      <header className="px-6 pt-28 pb-12 reveal in" style={{ maxWidth: Number(layout.maxWidth.replace('px', '')), margin: '0 auto' }}>
        <p className="pixel-tag" style={{ marginBottom: spacing.md, fontFamily: fonts.mono, fontSize: fontSize('sm'), letterSpacing: '0.12em', color: 'var(--blueprint)' }}>THAI CREATOR PLATFORM</p>
        <h1 className="pixel-h1" style={{ marginBottom: spacing.lg, fontFamily: fonts.pixel, fontSize: 'clamp(34px, 7vw, 64px)', lineHeight: lineHeight.tight, color: 'var(--text-primary)', textShadow: `0 0 16px var(--orange-soft), 4px 4px 0 var(--orange)` }}>
          ZEELINK
        </h1>
        <p className="pixel-lede" style={{ marginBottom: spacing.sm, fontFamily: fonts.body, fontSize: fontSize('lg'), lineHeight: lineHeight.normal, color: 'var(--text-secondary)', maxWidth: '60ch' }}>
          แพลตฟอร์มพอร์ตโฟลิโอเชิงสังคมสำหรับคนไทย — เชื่อมครีเอเตอร์และคนทั่วประเทศ
          ด้วยหน้าโปรไฟล์สวยๆ บนแผนที่ และชุมชนที่โหวตไปพร้อมกัน
        </p>
        <p className="pixel-lede" style={{ marginBottom: spacing.xl, fontFamily: fonts.body, fontSize: fontSize('lg'), lineHeight: lineHeight.normal, color: 'var(--orange)', fontWeight: 600 }}>
          ครีเอเตอร์ไทย มาสร้างบ้านของตัวเองได้แล้ววันนี้
        </p>

        <div className="flex flex-wrap gap-4">
          {!user ? (
            <Button variant="primary" size="lg" leftIcon={<LogIn size={16} />} onClick={() => navigate('/login')}>
              เข้าสู่ระบบ
            </Button>
          ) : (
            <Button variant="primary" size="lg" leftIcon={<LayoutDashboard size={16} />} onClick={() => navigate('/dashboard')}>
              ไปหน้าแดชบอร์ด
            </Button>
          )}
          <Button variant="outline" size="lg" leftIcon={<Globe size={16} />} onClick={() => navigate('/explore')}>
            สำรวจแผนที่
          </Button>
        </div>
      </header>

      {/* ===== PIXEL MAP (แผนที่ไทย animation) ===== */}
      <section className="px-6 py-10 reveal" style={{ maxWidth: Number(layout.maxWidth.replace('px', '')), margin: '0 auto' }}>
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
            <p className="pixel-tag" style={{ marginBottom: spacing.md, fontFamily: fonts.mono, fontSize: fontSize('sm'), color: 'var(--blueprint)' }}>EXPLORE MAP</p>
            <h2 className="pixel-font" style={{ fontFamily: fonts.pixel, fontSize: '22px', color: 'var(--text-primary)', marginBottom: spacing.md, lineHeight: lineHeight.tight }}>
              เจอคนไทย<br />บนแผนที่
            </h2>
            <p className="pixel-lede" style={{ fontFamily: fonts.body, fontSize: fontSize('base'), lineHeight: lineHeight.normal, color: 'var(--text-secondary)' }}>
              ทุกจังหวัดมีพอร์ตของตัวเอง แยกตามภาคเหนือ กลาง อีสาน ใต้ —
              กดที่พินสว่างเพื่อดูโปรไฟล์ในพื้นที่นั้น สำรวจเพื่อนครีเอเตอร์ทั่วไทยได้ในที่เดียว
            </p>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS (ฟังก์ชันการใช้) ===== */}
      <section className="px-6 py-10 reveal" style={{ maxWidth: Number(layout.maxWidth.replace('px', '')), margin: '0 auto' }}>
        <p className="pixel-tag" style={{ marginBottom: spacing.md, fontFamily: fonts.mono, fontSize: fontSize('sm'), color: 'var(--blueprint)' }}>HOW IT WORKS</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={i} className="pixel-card" style={{ padding: spacing.lg }}>
              <div style={{ color: 'var(--orange)', marginBottom: spacing.sm, fontSize: '28px' }}>{s.icon}</div>
              <h3 className="pixel-font" style={{ fontFamily: fonts.pixel, fontSize: '13px', color: 'var(--text-primary)', marginBottom: spacing.sm, lineHeight: lineHeight.tight }}>
                {`0${i + 1}`} {s.title}
              </h3>
              <p style={{ fontFamily: fonts.body, color: 'var(--text-muted)', fontSize: fontSize('base'), lineHeight: lineHeight.normal }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PROPOSED PORTFOLIO (พอร์ตที่เสนอ) ===== */}
      <section className="px-6 py-10 reveal" style={{ maxWidth: Number(layout.maxWidth.replace('px', '')), margin: '0 auto' }}>
        <p className="pixel-tag" style={{ marginBottom: spacing.sm, fontFamily: fonts.mono, fontSize: fontSize('sm'), color: 'var(--blueprint)' }}>YOUR PORTFOLIO</p>
        <h2 className="pixel-font" style={{ fontFamily: fonts.pixel, fontSize: '20px', color: 'var(--text-primary)', marginBottom: spacing.xs, lineHeight: lineHeight.tight }}>
          นี่คือพอร์ตที่คุณจะได้
        </h2>
        <p className="pixel-lede" style={{ marginBottom: spacing.xl, fontFamily: fonts.body, fontSize: fontSize('base'), color: 'var(--text-secondary)', lineHeight: lineHeight.normal }}>
          ตัวอย่างโปรไฟล์บน Zeelink — ปรับธีมสี ใส่ลิงก์ หรือแชร์ให้คนอื่นเจอได้บนแผนที่
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLES.map((p, i) => (
            <div key={i} className={`pixel-card ${p.theme}`} style={{ padding: spacing.lg }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random`}
                  alt={p.name}
                  style={{ width: 48, height: 48, border: '2px solid var(--orange)', borderRadius: '50%' }}
                />
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: fonts.body }}>{p.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: fontSize('sm'), fontFamily: fonts.body }}>{p.handle}</div>
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: fontSize('base'), marginBottom: spacing.sm, fontFamily: fonts.body, lineHeight: lineHeight.normal }}>{p.bio}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md }}>
                {p.tags.map((t) => (
                  <span key={t} style={{ fontSize: fontSize('xs'), fontFamily: fonts.mono, border: '1px solid var(--pink)', color: 'var(--pink)', padding: '2px 8px', borderRadius: '4px' }}>{t}</span>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
                {p.links.map((l) => (
                  <span key={l} style={{ fontSize: fontSize('xs'), fontFamily: fonts.mono, border: '1px solid var(--blue)', color: 'var(--blue)', padding: '2px 8px', borderRadius: '4px' }}>{l}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="px-6 py-14 reveal" style={{ maxWidth: Number(layout.maxWidth.replace('px', '')), margin: '0 auto', textAlign: 'center' }}>
        <h2 className="pixel-font" style={{ fontFamily: fonts.pixel, fontSize: '24px', color: 'var(--text-primary)', marginBottom: spacing.lg, lineHeight: lineHeight.tight }}>
          พร้อมสร้างบ้าน<br />ของคนไทยแล้ว?
        </h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="primary" size="lg" leftIcon={<Sparkles size={16} />} onClick={() => navigate('/login')}>
            เริ่มสร้างฟรี
          </Button>
          <Link to="/vote">
            <Button variant="outline" size="lg" rightIcon={<ArrowRight size={16} />}>
              ดูชุมชน
            </Button>
          </Link>
        </div>
      </section>

      <footer style={{ maxWidth: Number(layout.maxWidth.replace('px', '')), margin: '0 auto', padding: '30px 24px 70px', borderTop: '2px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: fontSize('sm'), fontFamily: fonts.body }}>
        © 2026 Zeelink Thailand — แพลตฟอร์มพอร์ตโฟลิโอสำหรับคนไทย
      </footer>

      {/* ===== Mood filter modal (interactive tag results) ===== */}
      {activeMood && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setActiveMood(null)}>
          <div
            className="glass-card border-[var(--orange)] w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 m-4"
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--glass-bg)' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center" style={{ color: 'var(--text-primary)' }}>
                <span className="px-3 py-1 rounded-full bg-[var(--orange)]/20 text-[var(--orange)] text-sm mr-2">{activeMood}</span>
                โปรไฟล์ที่เข้ากับอารมณ์นี้
              </h3>
              <button onClick={() => setActiveMood(null)} className="text-white/50 hover:text-white"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filterProfilesByMood(activeMood).map(p => (
                <Link key={p.id} to={`/${p.username}`} className="glass-card p-3 flex flex-col items-center text-center hover:border-[var(--orange)] transition-colors" style={{ background: 'var(--bg-secondary)' }}>
                  <img src={p.photoUrl} className="w-14 h-14 rounded-full object-cover border-2 border-white/20 mb-2" alt={p.displayName} />
                  <span className="text-sm font-bold truncate w-full" style={{ color: 'var(--text-primary)' }}>{p.displayName}</span>
                  <span className="text-[10px] opacity-60 truncate w-full">{p.province}</span>
                </Link>
              ))}
            </div>
            {filterProfilesByMood(activeMood).length === 0 && (
              <p className="text-center text-sm opacity-60 py-8">ยังไม่มีโปรไฟล์ในขณะนี้ ลองคลิกแท็กอื่นดูสิ!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
