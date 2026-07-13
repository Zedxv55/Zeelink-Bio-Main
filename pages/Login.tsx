import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../contexts/supabaseClient';
import { ThaiBackground } from '../components/ThaiBackground';
import { Button } from '../components/ui/Button';
import { fonts, fontSize, spacing, radius } from '../lib/designTokens';
import { FLOATING_PHRASES } from '../constants';
import { Lock, Mail, User } from 'lucide-react';

type Mode = 'login' | 'register' | 'forgot' | 'setpw';

// ตำแหน่งข้อความลอย (คอลัมน์/แถว สัดส่วนหน้าจอ) — กระจายเต็มจอให้เด้งไปมา
const FLOAT_POS = [
  { top: '12%', left: '7%',  dur: 7,  dx: 14 }, { top: '20%', right: '9%',  dur: 9,  dx: -18 },
  { top: '34%', left: '5%',  dur: 8,  dx: 20 }, { top: '44%', right: '7%',  dur: 10, dx: -12 },
  { top: '58%', left: '10%', dur: 8.5, dx: 16 }, { top: '63%', right: '11%', dur: 9.5, dx: -22 },
  { top: '76%', left: '6%',  dur: 7.5, dx: 12 }, { top: '82%', right: '8%',  dur: 11, dx: -16 },
  { top: '28%', left: '46%', dur: 9,  dx: 10 }, { top: '70%', left: '42%', dur: 8, dx: -14 },
  { top: '16%', left: '52%', dur: 10, dx: 18 }, { top: '88%', left: '30%', dur: 9, dx: -10 },
];

export const Login: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [remember, setRemember] = useState(true); // จำรหัสอัตโนมัติทุกครั้ง (session ถูกเก็บใน Supabase อยู่แล้ว)
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, register, resetPassword } = useAuth();
  const navigate = useNavigate();

  // ถ้าเปิดหน้านี้มาจากลิงก์รีเซ็ตรหัสผ่าน (Supabase ส่ง session มาใน URL)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setMode('setpw');
    });
    // จำอีเมลไว้ให้พร้อมกรอกทุกครั้ง (ไม่เก็บรหัสผ่าน เพื่อความปลอดภัย)
    const saved = localStorage.getItem('zeelink_remember_email');
    if (saved) setEmail(saved);
  }, []);

  // เช็คว่ามีบัญชีนี้ในระบบหรือไม่ (อ่าน users ด้วย anon — เปิดกว้างชั่วคราวตาม schema)
  // ใช้เพื่อแจ้งข้อความเฉพาะเจาะจงตอนล็อกอินผิด
  const checkAccountExists = async (email: string): Promise<boolean> => {
    try {
      const { data } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
      return !!data;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      if (mode === 'forgot') {
        const ok = await resetPassword(email);
        if (ok) setInfo('✅ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว');
        else setError('ไม่สามารถส่งลิงก์ได้ กรุณาตรวจสอบอีเมล');
        return;
      }

      if (mode === 'setpw') {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) { setError('ตั้งรหัสผ่านไม่สำเร็จ ' + error.message); return; }
        setInfo('✅ ตั้งรหัสผ่านใหม่สำเร็จแล้ว');
        navigate('/feed');
        return;
      }

      if (mode === 'login') {
        const { user, error: loginErr } = await login(email, password, remember);
        if (user) {
          localStorage.setItem('zeelink_remember_email', email);
          navigate('/feed');
        } else {
          const isInvalidCreds = /invalid login credentials/i.test(loginErr || '');
          if (isInvalidCreds) {
            const exists = await checkAccountExists(email);
            if (exists) {
              setError('มีบัญชีนี้อยู่แล้วในระบบ แต่รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่าน หรือกด "ลืมรหัสผ่าน?" ด้านล่าง');
            } else {
              setError('ยังไม่มีบัญชีนี้กับ Zeelink ลองสมัครสมาชิกโดยกด "ยังไม่มีบัญชี? สมัครสมาชิก" ด้านล่าง');
            }
          } else {
            setError(loginErr || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน');
          }
        }
      } else {
        const res = await register(email, password, name);
        if (res.user && !res.needsConfirmation) {
          localStorage.setItem('zeelink_remember_email', email);
          setInfo('สมัครสมาชิกเรียบร้อยแล้ว 🎉');
          navigate('/feed');
        } else if (res.needsConfirmation) {
          setInfo('📧 กรุณายืนยันอีเมลในกล่องจดหมายของคุณ ก่อนเข้าใช้งาน');
        } else {
          setError('ไม่สามารถสมัครได้ อาจเนื่องจากอีเมลซ้ำหรือรหัสผ่านสั้นเกินไป (อย่างน้อย 6 ตัว)');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <ThaiBackground />

      {/* ข้อความลอยเด้งไปมา (คำกวนๆ ช้างกูอยู่ไหน ฯลฯ) — ชีวิตชีวา ไม่หน่วง */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        {FLOAT_POS.map((p, i) => (
          <span
            key={i}
            className="absolute whitespace-nowrap text-lg md:text-2xl font-bold"
            style={{
              top: p.top, left: p.left, right: p.right,
              color: 'var(--text-muted)',
              textShadow: '0 0 12px var(--orange-soft)',
              opacity: 0,
              ['--dx' as any]: `${p.dx}px`,
              animation: `bobUpDown ${p.dur}s ease-in-out ${i * 1.3}s infinite`
            }}
          >
            {FLOATING_PHRASES[(i * 7 + 3) % FLOATING_PHRASES.length]}
          </span>
        ))}
      </div>
      <div
        className="relative z-10 w-full max-w-md rounded-2xl shadow-2xl p-8"
        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
      >
        <h2 className="text-3xl font-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>
          {mode === 'forgot' ? 'ลืมรหัสผ่าน' : mode === 'setpw' ? 'ตั้งรหัสผ่านใหม่' : mode === 'register' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
        </h2>
        <p className="text-center mb-8" style={{ color: 'var(--text-muted)' }}>
          {mode === 'forgot' ? 'ใส่อีเมล เราจะส่งลิงก์รีเซ็ตให้' : mode === 'setpw' ? 'ตั้งรหัสผ่านใหม่สำหรับบัญชีนี้' : mode === 'register' ? 'สร้างบัญชีเพื่อเริ่มต้นใช้งาน' : 'ยินดีต้อนรับกลับสู่ Zeelink'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" role="alert" style={{ background: 'var(--orange-soft)', color: 'var(--orange-deep)' }}>
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 p-3 rounded-lg text-sm" aria-live="polite" style={{ background: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="relative">
              <User className="absolute left-3 top-3" size={20} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="ชื่อของคุณ"
                aria-label="ชื่อของคุณ"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg outline-none"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
                required={mode === 'register'}
              />
            </div>
          )}

          {mode !== 'setpw' && (
            <div className="relative">
              <Mail className="absolute left-3 top-3" size={20} style={{ color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="อีเมล"
                aria-label="อีเมล"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg outline-none"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
                required
              />
            </div>
          )}

          {mode !== 'forgot' && (
            <div className="relative">
              <Lock className="absolute left-3 top-3" size={20} style={{ color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder={mode === 'setpw' ? 'รหัสผ่านใหม่' : 'รหัสผ่าน'}
                aria-label={mode === 'setpw' ? 'รหัสผ่านใหม่' : 'รหัสผ่าน'}
                value={mode === 'setpw' ? newPassword : password}
                onChange={(e) => mode === 'setpw' ? setNewPassword(e.target.value) : setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg outline-none"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
                required
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm" style={{ color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded mr-2"
                  style={{ accentColor: 'var(--orange)' }}
                />
                จำฉันไว้
              </label>
              <button type="button" onClick={() => { setMode('forgot'); setError(''); setInfo(''); }} className="text-sm hover:underline font-bold" style={{ color: 'var(--orange)' }}>
                ลืมรหัสผ่าน?
              </button>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
            {mode === 'forgot' ? 'ส่งลิงก์รีเซ็ต' : mode === 'setpw' ? 'ตั้งรหัสผ่านใหม่' : mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          {mode === 'login' && (
            <button onClick={() => setMode('register')} className="hover:underline font-bold" style={{ color: 'var(--orange)' }}>
              ยังไม่มีบัญชี? สมัครสมาชิก
            </button>
          )}
          {mode === 'register' && (
            <button onClick={() => setMode('login')} className="hover:underline font-bold" style={{ color: 'var(--orange)' }}>
              มีบัญชีแล้ว? เข้าสู่ระบบ
            </button>
          )}
          {mode === 'forgot' && (
            <button onClick={() => setMode('login')} className="hover:underline font-bold" style={{ color: 'var(--orange)' }}>
              กลับไปเข้าสู่ระบบ
            </button>
          )}
          {mode === 'setpw' && (
            <button onClick={() => setMode('login')} className="hover:underline font-bold" style={{ color: 'var(--orange)' }}>
              กลับไปเข้าสู่ระบบ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
