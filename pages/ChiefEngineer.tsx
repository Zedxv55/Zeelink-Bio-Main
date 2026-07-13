import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GlassBackground } from '../components/GlassBackground';
import {
  fonts, fontSize, spacing, palette, radius, shadow, motion, lineHeight,
} from '../lib/designTokens';
import { RANK_WEIGHTS, recencyScore, engagementScore, affinityScore } from '../lib/ranking';
import {
  Cpu, Sparkles, AlertTriangle, Wrench, Wand2, ArrowUpRight, RefreshCw,
  Heart, MessageCircle, UserPlus, Clock, Lightbulb, Target,
} from 'lucide-react';

// ===== ข้อมูลแดชบอร์ด (เขียนโดยหัววิศวกร AI วิเคราะห์จากโค้ดจริง) =====
// นี่คือ "living roadmap" — อัปเดตทุกครั้งที่ลูปปรับปรุง
type Priority = 'P0' | 'P1' | 'P2';
interface IssueItem {
  id: string;
  priority: Priority;
  title: string;
  detail: string;
  status: 'done' | 'in-progress' | 'todo';
}

const ISSUES: IssueItem[] = [
  {
    id: 'feed-ranking',
    priority: 'P2',
    title: 'ฟีดยังไม่เรียงตามความน่าสนใจ',
    detail: 'เดิมโชว์ตามลำดับเวลาล้วน เปลี่ยนเป็นคะแนน recency × engagement × affinity (EdgeRank-style) ใน lib/ranking.ts',
    status: 'done',
  },
  {
    id: 'explore-affinity',
    priority: 'P2',
    title: 'Explore ไม่ให้ความสำคัญคนที่ติดตาม',
    detail: 'เพิ่ม affinity weight: คนที่คุณติดตามแสดงก่อน ตามด้วยจังหวัดเดียวกัน → ระยะห่าง → ยอดไลก์',
    status: 'done',
  },
  {
    id: 'chief-dashboard',
    priority: 'P1',
    title: 'ไม่มีหน้าแดชบอร์ดหัววิศวกรในเว็บ',
    detail: 'สร้างหน้า /chief-engineer แสดง roadmap + แรงบันดาลใจอัลกอริทึม (นี่ไฟล์นี้เอง)',
    status: 'done',
  },
  {
    id: 'feed-search',
    priority: 'P2',
    title: 'ฟีดไม่มีช่องค้นหาโพสต์',
    detail: 'เพิ่มช่องค้นหาแบบ O(n) ฝั่ง client (กรองตามข้อความ/ชื่อ/username) ตามหลัก CLAUDE.md',
    status: 'done',
  },
  {
    id: 'pwa',
    priority: 'P1',
    title: 'ยังไม่รองรับการติดตั้งเป็นแอป (PWA)',
    detail: 'เพิ่ม manifest.webmanifest + icon.svg + meta ให้ติดตั้งเข้าโฮมสกรีนได้เหมือน Facebook',
    status: 'done',
  },
  {
    id: 'notif',
    priority: 'P1',
    title: 'ไม่มีการแจ้งเตือนเมื่อมีคนกดใจ/คอมเมนต์',
    detail: 'ใช้ Supabase Realtime แจ้งเตือนเมื่อโพสต์ของคุณมีปฏิสัมพันธ์ (เหมือน Facebook red dot)',
    status: 'todo',
  },
  {
    id: 'onboarding',
    priority: 'P0',
    title: 'ผู้ใช้ใหม่หลงทางหลังล็อกอิน',
    detail: 'เพิ่ม intro tour / empty-state ที่ชวนทำแรกสุด (ตั้งโปรไฟล์ → แชร์ผลงาน → ติดตาม)',
    status: 'todo',
  },
];

const PRIORITY_STYLE: Record<Priority, { color: string; bg: string; label: string }> = {
  P0: { color: palette.error, bg: palette.errorSoft, label: 'บล็อกการใช้งาน' },
  P1: { color: palette.warning, bg: palette.warningSoft, label: 'UX / ความปลอดภัย' },
  P2: { color: palette.success, bg: palette.successSoft, label: 'ประสิทธิภาพ / ฟีเจอร์' },
};

const STATUS_LABEL: Record<IssueItem['status'], string> = {
  done: '✅ เสร็จ',
  'in-progress': '🔧 กำลังทำ',
  todo: '⏳ รอ',
};

// ===== ส่วนประกอบย่อย =====
const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; sub?: string }> = ({ icon, title, sub }) => (
  <div className="flex items-center gap-3 mb-4">
    <div style={{ color: palette.orange }} className="flex-shrink-0">{icon}</div>
    <div>
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: fonts.display }}>
        {title}
      </h2>
      {sub && <p className="text-xs opacity-60" style={{ fontFamily: fonts.body }}>{sub}</p>}
    </div>
  </div>
);

export const ChiefEngineer: React.FC = () => {
  const { user } = useAuth();
  const [lastLoop, setLastLoop] = useState<string>('—');
  const [loopOn, setLoopOn] = useState<boolean>(true);

  // อ่านสถานะลูปล่าสุดจาก git (dev mode — อ่านได้เฉพาะตอนรัน本地)
  useEffect(() => {
    fetch('/__loop_status.json')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.lastRun) setLastLoop(d.lastRun); })
      .catch(() => { /* ไม่มีไฟล์ = ปกติ (production) */ });
  }, []);

  const doneCount = ISSUES.filter(i => i.status === 'done').length;
  const todoCount = ISSUES.filter(i => i.status === 'todo').length;

  return (
    <GlassBackground>
      <div className="min-h-screen pt-24 pb-20 px-4" style={{ fontFamily: fonts.body }}>
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ===== Header ===== */}
          <Card accent="orange" padding="lg">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: palette.orangeSoft, color: palette.orange }}
                >
                  <Cpu size={30} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: fonts.display }}>
                    หัววิศวกร AI — Zeelink Loop
                  </h1>
                  <p className="text-sm opacity-70 mt-1">
                    แดชบอร์ดวิเคราะห์ปัญหา + แรงบันดาลใจอัลกอริทึม สำหรับคนไทย 🧡
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    background: loopOn ? palette.successSoft : 'var(--glass-border)',
                    color: loopOn ? palette.success : 'var(--text-secondary)',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: loopOn ? palette.success : 'var(--text-secondary)' }}
                  />
                  Loop {loopOn ? 'ทำงาน' : 'หยุด'}
                </span>
              </div>
            </div>

            {/* สถิติรวม */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="text-center p-3 rounded-xl" style={{ background: 'var(--glass-border)' }}>
                <p className="text-2xl font-bold" style={{ color: palette.success }}>{doneCount}</p>
                <p className="text-xs opacity-60">เสร็จแล้ว</p>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: 'var(--glass-border)' }}>
                <p className="text-2xl font-bold" style={{ color: palette.warning }}>{todoCount}</p>
                <p className="text-xs opacity-60">รอดำเนินการ</p>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: 'var(--glass-border)' }}>
                <p className="text-2xl font-bold" style={{ color: palette.orange }}>{ISSUES.length}</p>
                <p className="text-xs opacity-60">รวมงาน</p>
              </div>
            </div>

            <p className="text-xs opacity-60 mt-4">
              รอบลูปล่าสุด: <span className="font-mono">{lastLoop}</span> · ทุกรอบที่ build ผ่านจะดันขึ้น GitHub อัตโนมัติ
            </p>
          </Card>

          {/* ===== 1. ปัญหาที่แนะนำ (P0/P1/P2) ===== */}
          <Card padding="lg">
            <SectionTitle
              icon={<Target size={24} />}
              title="Roadmap — ปัญหาที่ต้องแก้"
              sub="วิเคราะห์โดยหัววิศวกร AI เรียงตามความสำคัญ (P0 = บล็อกการใช้งาน)"
            />
            <div className="space-y-3">
              {ISSUES.map(issue => {
                const ps = PRIORITY_STYLE[issue.priority];
                return (
                  <div
                    key={issue.id}
                    className="flex items-start gap-3 p-3 rounded-xl border"
                    style={{ borderColor: 'var(--glass-border)', background: 'var(--glass-bg)' }}
                  >
                    <span
                      className="px-2 py-1 rounded-md text-xs font-bold flex-shrink-0"
                      style={{ background: ps.bg, color: ps.color }}
                    >
                      {issue.priority}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{issue.title}</p>
                        <span className="text-[11px] opacity-60">{STATUS_LABEL[issue.status]}</span>
                      </div>
                      <p className="text-xs opacity-70 mt-1" style={{ lineHeight: lineHeight.normal }}>{issue.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ===== 2. แรงบันดาลใจอัลกอริทึม (Facebook EdgeRank-style) ===== */}
          <Card accent="blue" padding="lg">
            <SectionTitle
              icon={<Lightbulb size={24} />}
              title="แรงบันดาลใจอัลกอริทึม — ระบบแบบ Facebook"
              sub="ไม่ก๊อปปี้ฟังก์ชั่น แต่ยืม 'แนวคิดระบบ' (system/algorithm approach)"
            />

            <div className="rounded-xl p-4 mb-4" style={{ background: palette.orangeSoft }}>
              <p className="text-sm font-mono text-center" style={{ color: palette.orangeDeep, fontFamily: fonts.mono }}>
                score = recency × {RANK_WEIGHTS.recency} + engagement × {RANK_WEIGHTS.engagement} + affinity × {RANK_WEIGHTS.affinity}
              </p>
            </div>

            <p className="text-sm opacity-80 mb-4" style={{ lineHeight: lineHeight.relaxed }}>
              Facebook News Feed ใช้ <strong>EdgeRank</strong>: <em>Σ (Affinity × Weight × Decay)</em> —
              เราไม่เอาโค้ดเขา แต่เอาหลักการเดียวกันมาปรับเป็นของ Zeelink:
            </p>

            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--glass-border)' }}>
                <div className="flex items-center gap-2 mb-2" style={{ color: palette.blue }}>
                  <Clock size={18} /> <span className="font-bold text-sm">Recency (Decay)</span>
                </div>
                <p className="text-xs opacity-70" style={{ lineHeight: lineHeight.normal }}>
                  ของใหม่ได้คะแนนสูง ลดลงตามอายุ (ครึ่งชีวิต 48 ชม.) ด้วย exponential decay — เหมือนฟีดเฟสบุ๊คที่ไม่ให้โพสต์เก่าเด่นกว่าใหม่
                </p>
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--glass-border)' }}>
                <div className="flex items-center gap-2 mb-2" style={{ color: palette.pink }}>
                  <Heart size={18} /> <span className="font-bold text-sm">Engagement (Weight)</span>
                </div>
                <p className="text-xs opacity-70" style={{ lineHeight: lineHeight.normal }}>
                  คอมเมนต์ (×2) สำคัญกว่าไลก์ (×1) แชร์ (×1.5) — ใช้ log scale ป้องกันโพสต์ viral กลบโพสต์อื่น
                </p>
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--glass-border)' }}>
                <div className="flex items-center gap-2 mb-2" style={{ color: palette.green }}>
                  <UserPlus size={18} /> <span className="font-bold text-sm">Affinity</span>
                </div>
                <p className="text-xs opacity-70" style={{ lineHeight: lineHeight.normal }}>
                  คนที่คุณติดตามได้โบนัส +1.5 — สร้างความรู้สึก "ใกล้ชิด" เหมือนวงแชร์ของเพื่อนในเฟสบุ๊ค
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--glass-border)' }}>
              <p className="text-xs opacity-70 flex items-start gap-2" style={{ lineHeight: lineHeight.normal }}>
                <Sparkles size={16} className="flex-shrink-0 mt-0.5" style={{ color: palette.orange }} />
                <span>
                  <strong>ทำไมถึงไม่ก๊อปปี้:</strong> เราปรับน้ำหนักให้เข้ากับวัฒนธรรมไทย (คอมเมนต์สำคัญกว่าไลก์)
                  และใช้ haversine สำหรับ "คนใกล้คุณ" แทน social graph ของเฟสบุ๊ค — เอาแค่ 'ระบบคิด' ไม่เอา 'ฟังก์ชั่น'
                </span>
              </p>
            </div>
          </Card>

          {/* ===== 3. ดูตัวอย่างคะแนน (Demo) ===== */}
          <Card padding="lg">
            <SectionTitle
              icon={<Wand2 size={24} />}
              title="ลองคำนวณคะแนน (Demo)"
              sub="ปรับค่าเพื่อดูว่าอัลกอริทึมให้คะแนนยังไง"
            />
            <ScorePlayground />
          </Card>

          {/* เชิญชวน */}
          {!user && (
            <Card accent="orange" padding="md" className="text-center">
              <p className="text-sm opacity-80 mb-3">เข้าสู่ระบบเพื่อดูแดชบอร์ดนี้ในมุมของแอดมิน และรันลูปปรับปรุงอัตโนมัติ</p>
              <Button variant="primary" size="sm" onClick={() => window.location.href = '/#/login'}>
                เข้าสู่ระบบ
              </Button>
            </Card>
          )}

        </div>
      </div>
    </GlassBackground>
  );
};

// ===== เครื่องเล่นคำนวณคะแนน (ไม่พึ่ง API) =====
const ScorePlayground: React.FC = () => {
  const [likes, setLikes] = useState(50);
  const [comments, setComments] = useState(5);
  const [ageHours, setAgeHours] = useState(2);
  const [following, setFollowing] = useState(false);

  const now = Date.now();
  const createdAt = new Date(now - ageHours * 3_600_000).toISOString();
  const post = { userId: 'x', likes, comments: Array(comments).fill({}), shares: 0, createdAt };
  const score = recencyScore(createdAt) * RANK_WEIGHTS.recency
    + engagementScore(post) * RANK_WEIGHTS.engagement
    + affinityScore(post, following ? ['x'] : []) * RANK_WEIGHTS.affinity;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Slider label="❤️ ไลก์" value={likes} min={0} max={500} onChange={setLikes} />
        <Slider label="💬 คอมเมนต์" value={comments} min={0} max={100} onChange={setComments} />
        <Slider label="⏱️ อายุ (ชม.)" value={ageHours} min={0} max={120} onChange={setAgeHours} />
        <div className="p-3 rounded-xl flex flex-col justify-center" style={{ background: 'var(--glass-border)' }}>
          <span className="text-xs opacity-60 mb-1">👥 ติดตาม?</span>
          <button
            onClick={() => setFollowing(f => !f)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: following ? palette.green : 'var(--glass-bg)', color: following ? '#fff' : 'var(--text-primary)' }}
          >
            {following ? 'ติดตาม ✓' : 'ไม่ติดตาม'}
          </button>
        </div>
      </div>
      <div
        className="text-center p-4 rounded-xl"
        style={{ background: palette.orangeSoft }}
      >
        <p className="text-xs opacity-60">คะแนนรวม (Feed Score)</p>
        <p className="text-3xl font-bold font-mono" style={{ color: palette.orange }}>{score.toFixed(3)}</p>
      </div>
    </div>
  );
};

const Slider: React.FC<{ label: string; value: number; min: number; max: number; onChange: (v: number) => void }> = ({
  label, value, min, max, onChange,
}) => (
  <div className="p-3 rounded-xl" style={{ background: 'var(--glass-border)' }}>
    <span className="text-xs opacity-60">{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full mt-2 accent-orange-500"
      aria-label={label}
    />
    <p className="text-sm font-bold text-center mt-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
  </div>
);

export default ChiefEngineer;
