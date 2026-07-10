import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, X, Sparkles, Bot, LayoutDashboard, Newspaper, Map as MapIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * AiMascot — ตัวการ์ตูนน่ารัก "น้องซี" แอดมินจำลองของ Zeelink
 * - ใช้ CSS animation เท่านั้น (ไม่มี requestAnimationFrame) → ไม่ทำให้หน้าเว็บค้าง/หน่วง
 * - มีข้อความลอยรอบๆ ชวนคุย ("มีอะไรให้ช่วยไหม?" ฯลฯ)
 * - คลิกตัวการ์ตูน → เปิดแชทสั่งการ/ถามได้
 * - เชื่อม AI จริงผ่าน backend same-origin `/api/ai` (คีย์เก็บฝั่ง server เท่านั้น ไม่รั่วในเบราว์เซอร์)
 *   ถ้าไม่มี endpoint หรือเรียกไม่สำเร็จ จะตกไปใช้ "แอดมินจำลอง" (คำตอบภาษาไทยสำรอง)
 */

const FLOATING_HINTS = [
  'มีอะไรให้ช่วยไหม?',
  'อยากได้อะไรไหม?',
  'สอบถามได้เลยนะ~',
  'ฉันคือแอดมินจำลอง 🤖',
  'คลิกฉันเพื่อคุยได้!',
];

// แอดมินจำลอง: ตอบกลับภาษาไทยตามคำสำคัญ (fallback เวลา AI ไม่พร้อม)
const simulatedAdmin = (text: string): string => {
  const t = text.toLowerCase();
  if (/(สร้างพอร์ต|พอร์ต|portfolio|โปรไฟล์|profile|ลงทะเบียน)/.test(t))
    return 'สร้างพอร์ตได้ที่เมนู «แดชบอร์ด» เลยครับ! กรอกชื่อ อัปโหลดรูป เพิ่มลิงก์แพลตฟอร์ม และกดบันทึก ระบบจะสร้างหน้า zeelink.site/username ให้อัตโนมัติ 🚀';
  if (/(แผนที่|แชร์ตำแหน่ง|พิกัด|map|location|ที่อยู่)/.test(t))
    return 'ในหน้าแดชบอร์ด มีแผนที่และปุ่ม «แชร์ตำแหน่งปัจจุบัน» กดแล้วระบบจะขอตำแหน่งและปักหมุดบนแผนที่ พร้อมเลือกจังหวัดครบ 77 จังหวัดครับ 🗺️';
  if (/(ฟีด|โพสต์|post|โพส|วิดีโอ|รูป)/.test(t))
    return 'หน้า «ฟีด» เหมือนเฟสบุ๊คครับ สามารถโพสต์ข้อความ รูป หรือวิดีโอ ถูกใจ คอมเมนต์ และแชร์ได้เลย 💬';
  if (/(ล็อกอิน|เข้าสู่ระบบ|login|สมัคร|รหัส)/.test(t))
    return 'กด «เข้าสู่ระบบ» มุมขวาบน สมัครด้วยอีเมลหรือล็อกอินผ่าน Google/Facebook ได้ครับ ระบบจะจำรหัสให้ทุกครั้ง 🔐';
  if (/(สวัสดี|หวัดดี|hi|hello|hey)/.test(t))
    return 'สวัสดีครับ! ฉันน้องซี แอดมินจำลองของ Zeelink มีอะไรให้ช่วยไหม? 😊';
  if (/(ขอบคุณ|thank|thx)/.test(t))
    return 'ยินดีครับ! ต้องการอะไรอีก บอกได้ตลอดเวลา ✨';
  return 'รับทราบครับ! ฉันช่วยเรื่องพอร์ตโฟลิโอ แผนที่ ฟีด และการล็อกอินได้ ลองถามหรือสั่งการได้เลยนะ 😊';
};

export const AiMascot: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'สวัสดีครับ! ฉันน้องซี แอดมินจำลอง มีอะไรให้ช่วยไหม? 😊' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  // ป้องกัน setState หลัง unmount (เช่น ปิดแชทระหว่างรอ fetch)
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // หมุนข้อความลอย
  useEffect(() => {
    const t = setInterval(() => setHintIdx(i => (i + 1) % FLOATING_HINTS.length), 3500);
    return () => clearInterval(t);
  }, []);

  // เลื่อนแชทลงล่างสุด
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // เรียก backend same-origin `/api/ai` (คีย์อยู่ฝั่ง server) — ล้มเหลวเมื่อไหร่ตกไปใช้แอดมินจำลอง
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
      return String(data.reply).trim() || simulatedAdmin(userText);
    } catch {
      // ไม่มี endpoint (เช่น รัน local ไม่มี server) หรือเครือข่ายล้มเหลว → ใช้คำตอบสำรอง
      return simulatedAdmin(userText);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setTyping(true);
    const reply = await askAI(text);
    if (!mountedRef.current) return; // ปิดแชท/unmount ระหว่างรอ → หยุด อย่า setState
    setTyping(false);
    setMessages(prev => [...prev, { role: 'bot', text: reply }]);
  };

  return (
    <>
      {/* ข้อความลอยรอบตัวการ์ตูน (เฉพาะตอนปิดแชท) */}
      {!open && (
        <div
          className="fixed bottom-[92px] right-5 z-[145] pointer-events-none select-none animate-fade-in"
          key={hintIdx}
        >
          <div
            className="px-3 py-2 rounded-2xl text-[12px] font-bold shadow-lg whitespace-nowrap"
            style={{
              background: 'var(--glass-bg)',
              color: 'var(--text-primary)',
              border: '2px solid var(--orange)',
              fontFamily: "'IBM Plex Sans Thai', sans-serif",
              animation: 'mascotFloat 3.5s ease-in-out infinite'
            }}
          >
            {FLOATING_HINTS[hintIdx]}
          </div>
        </div>
      )}

      {/* ตัวการ์ตูนน่ารัก (คลิกเพื่อแชท) */}
      <button
        onClick={() => setOpen(o => !o)}
        title="น้องซี — แอดมินจำลอง"
        className="fixed bottom-5 right-5 z-[146] cursor-pointer select-none"
        aria-label="เปิดแชทกับแอดมินจำลอง"
      >
        <div className="relative" style={{ animation: 'mascotBob 2.4s ease-in-out infinite' }}>
          {/* เงา */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-2 rounded-full bg-black/20" />
          {/* ตัวกลม */}
          <div
            className="relative"
            style={{
              width: 64, height: 64,
              background: 'linear-gradient(135deg, #FFB066 0%, #FF7A2F 55%, #E8651E 100%)',
              borderRadius: '46% 46% 50% 50% / 55% 55% 45% 45%',
              border: '3px solid #1F1B16',
              boxShadow: '3px 3px 0 rgba(31,27,22,0.25)',
            }}
          >
            {/* เสาอากาศ + ดวงไฟ */}
            <div className="absolute" style={{ top: -14, left: '50%', marginLeft: -2, width: 4, height: 12, background: '#1F1B16', borderRadius: 2 }} />
            <div className="absolute" style={{ top: -18, left: '50%', marginLeft: -5, width: 10, height: 10, borderRadius: '50%', background: '#E8B23D', boxShadow: '0 0 8px #E8B23D' }} />
            {/* ตา */}
            <div className="absolute" style={{ width: 12, height: 14, background: '#fff', borderRadius: 6, left: 14, top: 22, border: '2px solid #1F1B16' }}>
              <div className="absolute" style={{ width: 5, height: 5, borderRadius: '50%', background: '#1F1B16', left: 4, top: 5 }} />
            </div>
            <div className="absolute" style={{ width: 12, height: 14, background: '#fff', borderRadius: 6, right: 14, top: 22, border: '2px solid #1F1B16' }}>
              <div className="absolute" style={{ width: 5, height: 5, borderRadius: '50%', background: '#1F1B16', left: 4, top: 5 }} />
            </div>
            {/* แก้ม */}
            <div className="absolute" style={{ width: 8, height: 5, borderRadius: '50%', background: 'rgba(255,120,80,0.55)', left: 9, top: 36 }} />
            <div className="absolute" style={{ width: 8, height: 5, borderRadius: '50%', background: 'rgba(255,120,80,0.55)', right: 9, top: 36 }} />
            {/* ยิ้ม */}
            <div className="absolute" style={{ width: 22, height: 10, left: 21, top: 40, borderBottom: '3px solid #1F1B16', borderRadius: '0 0 14px 14px' }} />
          </div>
          {/* ไอคอนแชทมุม */}
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center border-2 border-[var(--orange)] shadow" style={{ color: 'var(--orange)' }}>
            <MessageCircle size={13} />
          </span>
        </div>
      </button>

      {/* แชท面板 */}
      {open && (
        <div className="fixed bottom-5 right-5 z-[147] w-[340px] max-w-[92vw] h-[460px] max-h-[80vh] glass-card border-[var(--orange)] flex flex-col shadow-2xl animate-fade-in" style={{ background: 'var(--glass-bg)' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b-2" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center gap-2">
              <Sparkles size={18} style={{ color: 'var(--orange)' }} />
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>น้องซี · แอดมินจำลอง</p>
                <p className="text-[10px] opacity-60">ถามหรือสั่งการได้เลย</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="opacity-60 hover:opacity-100"><X size={18} style={{ color: 'var(--text-primary)' }} /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ background: 'var(--bg-secondary)' }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' && <Bot size={18} className="mr-1 mt-1 shrink-0" style={{ color: 'var(--orange)' }} />}
                <div
                  className="max-w-[80%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed"
                  style={{
                    background: m.role === 'user' ? 'var(--orange)' : 'var(--glass-bg)',
                    color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                    border: m.role === 'bot' ? '1px solid var(--glass-border)' : 'none',
                    fontFamily: "'IBM Plex Sans Thai', sans-serif"
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <Bot size={18} className="mr-1 mt-1 shrink-0" style={{ color: 'var(--orange)' }} />
                <div className="px-3 py-2 rounded-2xl text-[13px] opacity-70" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>กำลังคิด...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick actions */}
          <div className="flex gap-1 px-2 py-1.5 border-t" style={{ borderColor: 'var(--glass-border)' }}>
            <button onClick={() => navigate('/dashboard')} className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold py-1.5 rounded-lg hover:bg-white/10" style={{ color: 'var(--text-secondary)' }}><LayoutDashboard size={12} />แดชบอร์ด</button>
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
            <button onClick={handleSend} disabled={!input.trim() || typing} className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-50" style={{ background: 'var(--orange)', color: '#fff' }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AiMascot;
