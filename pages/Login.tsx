import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../contexts/supabaseClient';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/Logo';
import { fonts, palette } from '../lib/designTokens';
import { Lock, Mail, User, ArrowRight, Sparkles } from 'lucide-react';

type Mode = 'login' | 'register' | 'forgot' | 'setpw';

const FEATURES = [
  { n: '01', t: 'ลิงก์ BIO พอร์ตโฟลิโอ', d: 'รวมผลงานและลิงก์แพลตฟอร์มไว้หน้าเดียว' },
  { n: '02', t: 'แผนที่คนใกล้เคียง', d: 'ค้นพบครีเอเตอร์ไทยทั่วประเทศตามระยะห่างจริง' },
  { n: '03', t: 'ชุมชนโหวต + AI', d: 'ถามคำถามชุมชน และแชทกับผู้ช่วย AI' },
];

export const Login: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, login, register, resetPassword } = useAuth();
  const navigate = useNavigate();

  // ถ้าเปิดมาจากลิงก์รีเซ็ตรหัสผ่าน (Supabase ส่ง session มาใน URL)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setMode('setpw');
    });
    const saved = localStorage.getItem('zeelink_remember_email');
    if (saved) setEmail(saved);
  }, []);

  // ผู้ใช้ที่ล็อกอินอยู่แล้ว ไม่ควรเห็นหน้านี้ → เด้งเข้าแอปทันที
  useEffect(() => {
    if (user && (mode === 'login' || mode === 'register')) navigate('/feed');
  }, [user, mode, navigate]);

  const checkAccountExists = async (email: string): Promise<boolean> => {
    try {
      const { data } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
      return !!data;
    } catch {
      return false;
    }
  };

  const switchMode = (m: Mode) => { setMode(m); setError(''); setInfo(''); };

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
        if (user) { navigate('/feed'); return; }
        const { user: loggedIn, error: loginErr } = await login(email, password, remember);
        if (loggedIn) {
          localStorage.setItem('zeelink_remember_email', email);
          navigate('/feed');
        } else {
          const isInvalidCreds = /invalid login credentials/i.test(loginErr || '');
          if (isInvalidCreds) {
            const exists = await checkAccountExists(email);
            if (exists) setError('มีบัญชีนี้อยู่แล้วในระบบ แต่รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่าน หรือกด "ลืมรหัสผ่าน?"');
            else setError('ยังไม่มีบัญชีนี้กับ Zeelink ลองสมัครสมาชิกโดยกด "ยังไม่มีบัญชี? สมัครสมาชิก"');
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

  const title = mode === 'forgot' ? 'ลืมรหัสผ่าน' : mode === 'setpw' ? 'ตั้งรหัสผ่านใหม่' : mode === 'register' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ';
  const subtitle = mode === 'forgot' ? 'ใส่อีเมล เราจะส่งลิงก์รีเซ็ตให้' : mode === 'setpw' ? 'ตั้งรหัสผ่านใหม่สำหรับบัญชีนี้' : mode === 'register' ? 'สร้างบัญชีเพื่อเริ่มต้นใช้งาน' : 'ยินดีต้อนรับกลับสู่ Zeelink';

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 overflow-hidden nb-page-bg">
      {/* แสงสีบรรยากาศแบบเรียบง่าย (notebook) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full" style={{ background: 'radial-gradient(circle, var(--orange-soft), transparent 70%)' }} />
        <div className="absolute -bottom-32 -right-20 w-[460px] h-[460px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(61,125,214,0.12), transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center">

        {/* ===== คอลัมน์ซ้าย: เล่าความเป็นแบรนด์ (เดสก์ท็อป) ===== */}
        <div className="hidden md:block">
          <div className="flex items-center gap-3 mb-6">
            <Logo size={44} variant="dark" withWordmark />
          </div>
          <p className="font-mono text-[12px] tracking-[0.18em] uppercase mb-3" style={{ color: 'var(--blueprint)' }}>Zeelink · พอร์ตโฟลิโอคนไทย</p>
          <h1 className="font-bold leading-[1.12] mb-4" style={{ fontFamily: fonts.display, fontSize: 'clamp(30px,4vw,44px)', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            พอร์ตโฟลิโอเชิงสังคมสำหรับคนไทย
          </h1>
          <p className="mb-8 max-w-md" style={{ color: 'var(--text-muted)', fontFamily: fonts.body, fontSize: '16px', lineHeight: 1.7 }}>
            เชื่อมครีเอเตอร์และคนทั่วประเทศด้วยหน้าโปรไฟล์สวยๆ บนแผนที่ โควตไปพร้อมกัน และผู้ช่วย AI
          </p>

          <ul className="space-y-5">
            {FEATURES.map(f => (
              <li key={f.n} className="flex gap-4">
                <span className="font-mono text-sm pt-0.5 flex-shrink-0" style={{ color: 'var(--blueprint)' }}>{f.n}</span>
                <div>
                  <p className="font-bold" style={{ color: 'var(--text-primary)', fontFamily: fonts.body }}>{f.t}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{f.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== คอลัมน์ขวา: การ์ดล็อกอิน ===== */}
        <div
          className="relative z-10 w-full max-w-md mx-auto rounded-2xl p-7 sm:p-8"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: '0 10px 40px -18px rgba(31,27,22,0.45)' }}
        >
          {/* โลโก้บนมือถือ */}
          <div className="flex justify-center mb-5 md:hidden">
            <Logo size={40} variant="dark" withWordmark />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} style={{ color: palette.orange }} />
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: fonts.display }}>{title}</h2>
          </div>
          <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)', fontFamily: fonts.body }}>{subtitle}</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" role="alert" style={{ background: 'var(--orange-soft)', color: 'var(--orange-deep)' }}>{error}</div>
          )}
          {info && (
            <div className="mb-4 p-3 rounded-lg text-sm" aria-live="polite" style={{ background: 'var(--glass-border)', color: 'var(--text-secondary)' }}>{info}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="ชื่อของคุณ"
                  aria-label="ชื่อของคุณ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition-shadow focus:shadow-[0_0_0_3px_var(--orange-soft)]"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontFamily: fonts.body }}
                  required={mode === 'register'}
                />
              </div>
            )}

            {mode !== 'setpw' && (
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  placeholder="อีเมล"
                  aria-label="อีเมล"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition-shadow focus:shadow-[0_0_0_3px_var(--orange-soft)]"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontFamily: fonts.body }}
                  required
                />
              </div>
            )}

            {mode !== 'forgot' && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  placeholder={mode === 'setpw' ? 'รหัสผ่านใหม่' : 'รหัสผ่าน'}
                  aria-label={mode === 'setpw' ? 'รหัสผ่านใหม่' : 'รหัสผ่าน'}
                  value={mode === 'setpw' ? newPassword : password}
                  onChange={(e) => mode === 'setpw' ? setNewPassword(e.target.value) : setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition-shadow focus:shadow-[0_0_0_3px_var(--orange-soft)]"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontFamily: fonts.body }}
                  required
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm cursor-pointer" style={{ color: 'var(--text-muted)' }}>
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
                <button type="button" onClick={() => switchMode('forgot')} className="text-sm hover:underline font-bold" style={{ color: palette.orange }}>
                  ลืมรหัสผ่าน?
                </button>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting} rightIcon={!submitting ? <ArrowRight size={18} /> : undefined}>
              {mode === 'forgot' ? 'ส่งลิงก์รีเซ็ต' : mode === 'setpw' ? 'ตั้งรหัสผ่านใหม่' : mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            {mode === 'login' && (
              <button onClick={() => switchMode('register')} className="hover:underline font-bold" style={{ color: palette.orange }}>ยังไม่มีบัญชี? สมัครสมาชิก</button>
            )}
            {mode === 'register' && (
              <button onClick={() => switchMode('login')} className="hover:underline font-bold" style={{ color: palette.orange }}>มีบัญชีแล้ว? เข้าสู่ระบบ</button>
            )}
            {mode === 'forgot' && (
              <button onClick={() => switchMode('login')} className="hover:underline font-bold" style={{ color: palette.orange }}>กลับไปเข้าสู่ระบบ</button>
            )}
            {mode === 'setpw' && (
              <button onClick={() => switchMode('login')} className="hover:underline font-bold" style={{ color: palette.orange }}>กลับไปเข้าสู่ระบบ</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
