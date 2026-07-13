import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, X, Bot, LayoutDashboard, Newspaper, Map as MapIcon, Shirt, Pencil, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * AiMascot — ผู้ช่วยส่วนตัว "น้องซี" ของ Zeelink
 * - มีตัวการ์ตูนเต็มตัว (หัว + แขน + ขา) วาดด้วย SVG → คมกริบ ปรับสีได้
 * - แต่งตัวได้ (เปลี่ยนชุด/สี) ผ่านตู้เสื้อผ้า 👕
 * - เปลี่ยนชื่อได้ชั่วคราว (βETA — ระบบเปลี่ยนชื่อเต็มรูปแบบกำลังพัฒนา)
 * - คลิกตัวการ์ตูน → เปิดแชทสั่งการ/ถามได้
 * - เชื่อม AI จริงผ่าน backend same-origin `/api/ai`
 */

// ===== ชุดเสื้อผ้า (แต่งตัวได้) =====
interface Outfit { id: string; name: string; shirt: string; shirtDark: string; pants: string; accent: string; }
const OUTFITS: Outfit[] = [
  { id: 'orange', name: 'ส้มสดใส',   shirt: '#FF7A2F', shirtDark: '#E8651E', pants: '#2A2018', accent: '#E8B23D' },
  { id: 'blue',   name: 'ฟ้าเย็นใจ',  shirt: '#3D7DD6', shirtDark: '#2C5FA8', pants: '#1E2A3A', accent: '#9CC3FF' },
  { id: 'pink',   name: 'ชมพูน่ารัก', shirt: '#E36B9B', shirtDark: '#C24F7F', pants: '#3A1E2C', accent: '#FFD1E6' },
  { id: 'mono',   name: 'มินิมอลดำ', shirt: '#2B2B2B', shirtDark: '#161412', pants: '#161412', accent: '#9AA0A6' },
  { id: 'green',  name: 'เขียวธรรมชาติ', shirt: '#4F9D69', shirtDark: '#3A7A50', pants: '#22382B', accent: '#BFE8CC' },
];

const SKIN = '#FFD9A8';
const INK = '#1F1B16';
const NAME_KEY = 'zeelink_ai_name';
const OUTFIT_KEY = 'zeelink_ai_outfit';

// ตัวการ์ตูน SVG (หัว + แขน + ขา + เสื้อผ้าที่ปรับสีได้)
const MascotBody: React.FC<{ outfit: Outfit; size?: number }> = ({ outfit, size = 72 }) => (
  <svg width={size} height={size * (210 / 120)} viewBox="0 0 120 210" aria-hidden="true">
    {/* เงาพื้น */}
    <ellipse cx="60" cy="198" rx="30" ry="5" fill="rgba(0,0,0,0.12)" />
    {/* เสาอากาศ + ดวงไฟ */}
    <line x1="60" y1="26" x2="60" y2="9" stroke={INK} strokeWidth="3" />
    <circle cx="60" cy="6" r="5" fill={outfit.accent} stroke={INK} strokeWidth="2" />
    {/* ขา + รองเท้า (อยู่ใต้ตัว) */}
    <rect x="47" y="138" width="11" height="46" rx="5" fill={outfit.pants} stroke={INK} strokeWidth="3" />
    <rect x="62" y="138" width="11" height="46" rx="5" fill={outfit.pants} stroke={INK} strokeWidth="3" />
    <ellipse cx="52.5" cy="186" rx="11" ry="6" fill={outfit.accent} stroke={INK} strokeWidth="2.5" />
    <ellipse cx="67.5" cy="186" rx="11" ry="6" fill={outfit.accent} stroke={INK} strokeWidth="2.5" />
    {/* แขน + มือ (อยู่หลังตัว) */}
    <rect x="26" y="90" width="12" height="42" rx="6" fill={outfit.shirt} stroke={INK} strokeWidth="3" />
    <rect x="82" y="90" width="12" height="42" rx="6" fill={outfit.shirt} stroke={INK} strokeWidth="3" />
    <circle cx="32" cy="134" r="7" fill={SKIN} stroke={INK} strokeWidth="2.5" />
    <circle cx="88" cy="134" r="7" fill={SKIN} stroke={INK} strokeWidth="2.5" />
    {/* ตัว/เสื้อ */}
    <rect x="37" y="82" width="46" height="60" rx="16" fill={outfit.shirt} stroke={INK} strokeWidth="3" />
    {/* ป้าย Z (แบรนด์) */}
    <circle cx="60" cy="109" r="9" fill={outfit.accent} stroke={INK} strokeWidth="2" />
    <text x="60" y="113" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="10" fill={INK}>Z</text>
    {/* หัว */}
    <circle cx="60" cy="54" r="30" fill={SKIN} stroke={INK} strokeWidth="3" />
    {/* ตา */}
    <circle cx="49" cy="52" r="7" fill="#fff" stroke={INK} strokeWidth="2" />
    <circle cx="71" cy="52" r="7" fill="#fff" stroke={INK} strokeWidth="2" />
    <circle cx="50" cy="53" r="3" fill={INK} />
    <circle cx="72" cy="53" r="3" fill={INK} />
    <circle cx="48.5" cy="51" r="1.3" fill="#fff" />
    <circle cx="70.5" cy="51" r="1.3" fill="#fff" />
    {/* แก้ม */}
    <ellipse cx="43" cy="64" rx="5" ry="3" fill="rgba(255,120,80,0.5)" />
    <ellipse cx="77" cy="64" rx="5" ry="3" fill="rgba(255,120,80,0.5)" />
    {/* ยิ้ม */}
    <path d="M49 68 Q60 79 71 68" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const FLOATING_HINTS = [
  'มีอะไรให้ช่วยไหม?',
  'อยากให้แต่งตัวมั้ย?',
  'สอบถามได้เลยนะ~',
  'ฉันคือผู้ช่วยของคุณ 🤖',
  'คลิกฉันเพื่อคุยได้!',
];

// แอดมินจำลอง: ตอบกลับภาษาไทยตามคำสำคัญ (fallback เวลา AI ไม่พร้อม)
const simulatedAdmin = (text: string): string => {
  const t = text.toLowerCase();
  if (/(สร้างพอร์ต|พอร์ต|portfolio|โปรไฟล์|profile|ลงทะเบียน)/.test(t))
    return 'สร้างพอร์ตได้ที่เมนู «โปรไฟล์» เลยครับ! กรอกชื่อ อัปโหลดรูป เพิ่มลิงก์แพลตฟอร์ม และกดบันทึก ระบบจะสร้างหน้าโปรไฟล์ให้อัตโนมัติ 🚀';
  if (/(แต่งตัว|ชุด|เสื้อผ้า|dress|outfit|แฟชั่น)/.test(t))
    return 'กดที่ฉันแล้วเปิด «ตู้เสื้อผ้า 👕» ได้เลยครับ สามารถเปลี่ยนสีชุดและรองเท้าได้ตามสไตล์ที่คุณชอบ 🎨';
  if (/(แผนที่|แชร์ตำแหน่ง|พิกัด|map|location|ที่อยู่)/.test(t))
    return 'ในหน้า «โปรไฟล์» มีแผนที่และปุ่ม «แชร์ตำแหน่งปัจจุบัน» กดแล้วระบบจะปักหมุดบนแผนที่ พร้อมเลือกจังหวัดครบ 77 จังหวัดครับ 🗺️';
  if (/(ฟีด|โพสต์|post|โพส|วิดีโอ|รูป)/.test(t))
    return 'หน้า «ฟีด» เหมือนเฟสบุ๊คครับ สามารถโพสต์ข้อความ รูป หรือวิดีโอ ถูกใจ คอมเมนต์ และแชร์ได้เลย 💬';
  if (/(ล็อกอิน|เข้าสู่ระบบ|login|สมัคร|รหัส)/.test(t))
    return 'กด «เข้าสู่ระบบ» มุมขวาบน สมัครด้วยอีเมลของคุณได้เลยครับ ระบบจะจำรหัสให้ทุกครั้ง 🔐';
  if (/(สวัสดี|หวัดดี|hi|hello|hey)/.test(t))
    return 'สวัสดีครับ! ฉันคือผู้ช่วยส่วนตัวของคุณ มีอะไรให้ช่วยไหม? 😊';
  if (/(ขอบคุณ|thank|thx)/.test(t))
    return 'ยินดีครับ! ต้องการอะไรอีก บอกได้ตลอดเวลา ✨';
  return 'รับทราบครับ! ฉันช่วยเรื่องพอร์ตโฟลิโอ แผนที่ ฟีด และการแต่งตัวได้ ลองถามหรือสั่งการได้เลยนะ 😊';
};

// ===== สิทธิ์การใช้งาน AI =====
const AI_LIMIT_PER_HOUR = 20;
const AI_WINDOW_MS = 60 * 60 * 1000;
const aiUsageKey = (uid: string) => `zeelink_ai_usage_${uid}`;
const getAiUsage = (uid: string): { windowStart: number; count: number } => {
  try {
    const raw = localStorage.getItem(aiUsageKey(uid));
    if (raw) return JSON.parse(raw) as { windowStart: number; count: number };
  } catch { /* noop */ }
  return { windowStart: 0, count: 0 };
};
const setAiUsage = (uid: string, u: { windowStart: number; count: number }) => {
  try { localStorage.setItem(aiUsageKey(uid), JSON.stringify(u)); } catch { /* noop */ }
};

export const AiMascot: React.FC = () => {
  const navigate = useNavigate();
  const { user, aiConfigs } = useAuth();
  const [open, setOpen] = useState(false);
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);

  // ===== ชื่อผู้ช่วย (เปลี่ยนได้ชั่วคราว — βETA) =====
  const [aiName, setAiName] = useState<string>(() => localStorage.getItem(NAME_KEY) || 'น้องซี');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(aiName);

  // ===== ชุด (แต่งตัว) =====
  const [outfitIdx, setOutfitIdx] = useState<number>(() => {
    const saved = localStorage.getItem(OUTFIT_KEY);
    const i = OUTFITS.findIndex(o => o.id === saved);
    return i >= 0 ? i : 0;
  });
  const outfit = OUTFITS[outfitIdx];

  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'สวัสดีครับ! ฉันน้องซี ผู้ช่วยส่วนตัวของคุณ มีอะไรให้ช่วยไหม? 😊' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  const usage = user && user.role !== 'admin' ? getAiUsage(user.id) : null;
  const inWindow = usage ? (Date.now() - usage.windowStart) < AI_WINDOW_MS : false;
  const used = inWindow && usage ? usage.count : 0;
  const remaining = AI_LIMIT_PER_HOUR - used;

  const globalCfg = aiConfigs.find(c => c.scope === 'global');
  const globalEnabled = globalCfg ? globalCfg.enabled : true;
  const userCfg = user ? aiConfigs.find(c => c.scope === 'user' && c.ownerRef === user.id) : undefined;
  const aiDisabledByAdmin = !globalEnabled || (userCfg ? !userCfg.enabled : false);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  useEffect(() => {
    const t = setInterval(() => setHintIdx(i => (i + 1) % FLOATING_HINTS.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const askAI = async (userText: string): Promise<string> => {
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, userName: user?.name || 'เพื่อน' })
      });
      if (!res.ok) throw new Error('bad');
      const data = await res.json();
      if (data?.error || !data?.reply) return simulatedAdmin(userText);
      const raw = String(data.reply).trim();
      if (/AI_API_KEY|ยังไม่พร้อม|ไม่ได้ตั้งค่า/i.test(raw)) {
        return 'ขออภัยครับ ระบบ AI ไม่พร้อมใช้งานชั่วคราว ลองใหม่อีกครั้งภายหลังนะครับ';
      }
      return raw || simulatedAdmin(userText);
    } catch {
      return simulatedAdmin(userText);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || typing) return;

    if (aiDisabledByAdmin) {
      setInput('');
      setMessages(prev => [...prev, { role: 'user', text }, { role: 'bot', text: '🚫 ระบบ AI ถูกปิดการใช้งานโดยแอดมินชั่วคราว กรุณาติดต่อแอดมินหากต้องการใช้งาน' }]);
      return;
    }
    if (!user) {
      setInput('');
      setMessages(prev => [...prev, { role: 'user', text }, { role: 'bot', text: '🔒 กรุณาเข้าสู่ระบบก่อนครับ น้องซีจะตอบคำถามได้เฉพาะสมาชิกที่ล็อกอินเท่านั้น' }]);
      return;
    }
    if (user.role !== 'admin') {
      const u = getAiUsage(user.id);
      const expired = (Date.now() - u.windowStart) >= AI_WINDOW_MS;
      const cur = expired ? { windowStart: Date.now(), count: 0 } : u;
      if (cur.count >= AI_LIMIT_PER_HOUR) {
        const waitMin = Math.max(1, Math.ceil((AI_WINDOW_MS - (Date.now() - cur.windowStart)) / 60000));
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text }, { role: 'bot', text: `ขออภัยครับ คุณใช้ครบ ${AI_LIMIT_PER_HOUR} ครั้งแล้ว กรุณารอประมาณ ${waitMin} นาที จึงจะถามได้ใหม่ (จำกัด ${AI_LIMIT_PER_HOUR} ครั้ง/ชั่วโมง)` }]);
        return;
      }
      cur.count += 1;
      setAiUsage(user.id, cur);
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setTyping(true);
    const reply = await askAI(text);
    if (!mountedRef.current) return;
    setTyping(false);
    setMessages(prev => [...prev, { role: 'bot', text: reply }]);
  };

  // ===== เปลี่ยนชื่อ (βETA) =====
  const saveName = () => {
    const v = nameDraft.trim();
    const next = v || 'น้องซี';
    setAiName(next);
    localStorage.setItem(NAME_KEY, next);
    setEditingName(false);
    setMessages(prev => prev.map((m, i) => i === 0 ? { ...m, text: `สวัสดีครับ! ฉัน${next} ผู้ช่วยส่วนตัวของคุณ มีอะไรให้ช่วยไหม? 😊` } : m));
  };
  const resetName = () => {
    setNameDraft('น้องซี');
    setAiName('น้องซี');
    localStorage.removeItem(NAME_KEY);
    setEditingName(false);
  };

  // ===== เปลี่ยนชุด =====
  const pickOutfit = (i: number) => {
    setOutfitIdx(i);
    localStorage.setItem(OUTFIT_KEY, OUTFITS[i].id);
  };

  return (
    <>
      {/* ข้อความลอยรอบตัวการ์ตูน (เฉพาะตอนปิดแชท) */}
      {!open && (
        <div className="fixed bottom-[104px] right-5 z-[145] pointer-events-none select-none animate-fade-in" key={hintIdx}>
          <div
            className="px-3 py-2 rounded-2xl text-[12px] font-bold shadow-lg whitespace-nowrap"
            style={{ background: 'var(--glass-bg)', color: 'var(--text-primary)', border: `2px solid ${outfit.accent}`, fontFamily: "'IBM Plex Sans Thai', sans-serif", animation: 'mascotFloat 3.5s ease-in-out infinite' }}
          >
            {FLOATING_HINTS[hintIdx]}
          </div>
        </div>
      )}

      {/* ตัวการ์ตูน (คลิกเพื่อแชท) */}
      <button
        onClick={() => setOpen(o => !o)}
        title={`${aiName} — ผู้ช่วยส่วนตัว`}
        className="fixed bottom-5 right-5 z-[146] cursor-pointer select-none"
        aria-label="เปิดแชทกับผู้ช่วย"
      >
        <div className="relative" style={{ animation: 'mascotBob 2.4s ease-in-out infinite' }}>
          <MascotBody outfit={outfit} size={76} />
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center border-2 shadow" style={{ borderColor: outfit.accent, color: outfit.shirt }}>
            <MessageCircle size={13} />
          </span>
        </div>
      </button>

      {/* ปุ่มตู้เสื้อผ้าเร็ว (มุมซ้ายล่างของมาสคอต) */}
      <button
        onClick={() => { setOpen(true); setShowWardrobe(true); }}
        title="ตู้เสื้อผ้า 👕"
        className="fixed bottom-[92px] right-[88px] z-[146] w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 bg-white"
        style={{ borderColor: outfit.accent, color: outfit.shirt }}
        aria-label="แต่งตัวผู้ช่วย"
      >
        <Shirt size={16} />
      </button>

      {/* แชท面板 */}
      {open && (
        <div className="fixed bottom-5 right-5 z-[147] w-[340px] max-w-[92vw] h-[480px] max-h-[82vh] glass-card flex flex-col shadow-2xl animate-fade-in" style={{ background: 'var(--glass-bg)', borderColor: outfit.accent }}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b-2" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 flex-shrink-0"><MascotBody outfit={outfit} size={36} /></div>
              <div className="min-w-0">
                {editingName ? (
                  <input
                    autoFocus
                    value={nameDraft}
                    onChange={e => setNameDraft(e.target.value)}
                    onBlur={saveName}
                    onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                    className="text-sm font-bold w-28 px-1 py-0.5 rounded outline-none"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: `1px solid ${outfit.accent}` }}
                    aria-label="เปลี่ยนชื่อผู้ช่วย"
                  />
                ) : (
                  <button onClick={() => { setEditingName(true); setNameDraft(aiName); }} className="flex items-center gap-1 group" title="คลิกเพื่อเปลี่ยนชื่อ (βETA)">
                    <span className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{aiName}</span>
                    <Pencil size={11} className="opacity-40 group-hover:opacity-80" style={{ color: 'var(--text-muted)' }} />
                  </button>
                )}
                <p className="text-[10px] opacity-60 truncate">
                  {!user
                    ? 'เข้าสู่ระบบเพื่อคุยกับผู้ช่วย'
                    : aiDisabledByAdmin
                      ? '🔴 ปิดโดยแอดมิน'
                      : user.role === 'admin'
                        ? '♾️ แอดมิน: ไม่จำกัด'
                        : `เหลือ ${remaining}/${AI_LIMIT_PER_HOUR} ครั้ง (ต่อชั่วโมง)`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowWardrobe(w => !w)} title="ตู้เสื้อผ้า 👕" className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: outfit.shirt }}>
                <Shirt size={18} />
              </button>
              <button onClick={() => setOpen(false)} className="opacity-60 hover:opacity-100 p-1.5"><X size={18} style={{ color: 'var(--text-primary)' }} /></button>
            </div>
          </div>

          {/* ตู้เสื้อผ้า (แต่งตัว + เปลี่ยนชื่อ) */}
          {showWardrobe && (
            <div className="p-3 border-b-2 space-y-3" style={{ borderColor: 'var(--glass-border)', background: 'var(--bg-secondary)' }}>
              <p className="text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>👕 เลือกชุดของผู้ช่วย</p>
              <div className="flex flex-wrap gap-2">
                {OUTFITS.map((o, i) => (
                  <button
                    key={o.id}
                    onClick={() => pickOutfit(i)}
                    title={o.name}
                    className="w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-transform hover:scale-110"
                    style={{ background: o.shirt, borderColor: i === outfitIdx ? o.accent : 'var(--glass-border)' }}
                    aria-label={o.name}
                  >
                    <Shirt size={16} style={{ color: '#fff' }} />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={nameDraft}
                  onChange={e => setNameDraft(e.target.value)}
                  placeholder="ตั้งชื่อผู้ช่วย"
                  className="flex-1 px-2 py-1.5 rounded-lg text-[13px] outline-none"
                  style={{ background: 'var(--glass-bg)', color: 'var(--text-primary)', border: `1px solid ${outfit.accent}` }}
                  aria-label="ชื่อผู้ช่วย"
                />
                <button onClick={saveName} className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-white" style={{ background: outfit.shirt }}>บันทึก</button>
                <button onClick={resetName} title="รีเซ็ตชื่อ" className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'var(--text-muted)' }}><RotateCcw size={15} /></button>
              </div>
              <p className="text-[10px] opacity-60 leading-snug">🪪 เปลี่ยนชื่อได้ชั่วคราว (βETA) — ระบบเปลี่ยนชื่อเต็มรูปแบบกำลังพัฒนาในอนาคต</p>
            </div>
          )}

          {/* ไม่ล็อกอิน → ชวนล็อกอิน */}
          {!user && (
            <div className="px-3 py-2 border-b text-center" style={{ borderColor: 'var(--glass-border)' }}>
              <p className="text-[11px] opacity-70 mb-1.5">🔒 เข้าสู่ระบบเพื่อถามผู้ช่วยได้</p>
              <button onClick={() => navigate('/login')} className="px-4 py-1.5 rounded-full text-[12px] font-bold text-white" style={{ background: outfit.shirt }}>
                เข้าสู่ระบบ
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ background: 'var(--bg-secondary)' }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' && <Bot size={18} className="mr-1 mt-1 shrink-0" style={{ color: outfit.shirt }} />}
                <div
                  className="max-w-[80%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed"
                  style={{ background: m.role === 'user' ? outfit.shirt : 'var(--glass-bg)', color: m.role === 'user' ? '#fff' : 'var(--text-primary)', border: m.role === 'bot' ? '1px solid var(--glass-border)' : 'none', fontFamily: "'IBM Plex Sans Thai', sans-serif" }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <Bot size={18} className="mr-1 mt-1 shrink-0" style={{ color: outfit.shirt }} />
                <div className="px-3 py-2 rounded-2xl text-[13px] opacity-70" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>กำลังคิด...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick actions */}
          <div className="flex gap-1 px-2 py-1.5 border-t" style={{ borderColor: 'var(--glass-border)' }}>
            <button onClick={() => navigate('/dashboard')} className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold py-1.5 rounded-lg hover:bg-white/10" style={{ color: 'var(--text-secondary)' }}><LayoutDashboard size={12} />โปรไฟล์</button>
            <button onClick={() => navigate('/feed')} className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold py-1.5 rounded-lg hover:bg-white/10" style={{ color: 'var(--text-secondary)' }}><Newspaper size={12} />ฟีด</button>
            <button onClick={() => navigate('/explore')} className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold py-1.5 rounded-lg hover:bg-white/10" style={{ color: 'var(--text-secondary)' }}><MapIcon size={12} />แผนที่</button>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 p-2 border-t" style={{ borderColor: 'var(--glass-border)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="พิมพ์คำถามหรือสั่งการ..."
              className="flex-1 px-3 py-2 rounded-full text-[13px] outline-none"
            />
            <button onClick={handleSend} disabled={!input.trim() || typing} className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-50" style={{ background: outfit.shirt, color: '#fff' }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AiMascot;
