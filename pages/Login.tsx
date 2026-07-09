import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../contexts/supabaseClient';
import { ThaiBackground } from '../components/ThaiBackground';
import { Button } from '../components/ui/Button';
import { fonts, fontSize, spacing, radius } from '../lib/designTokens';
import { Lock, Mail, User, Facebook } from 'lucide-react';

// โลโก้ Google "G" แบบ inline SVG (lucide ไม่มีไอคอน Google)
const GoogleIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

type Mode = 'login' | 'register' | 'forgot' | 'setpw';

export const Login: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, loginWithOAuth, register, resetPassword } = useAuth();
  const navigate = useNavigate();

  // ถ้าเปิดหน้านี้มาจากลิงก์รีเซ็ตรหัสผ่าน (Supabase ส่ง session มาใน URL)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setMode('setpw');
    });
  }, []);

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    setError('');
    setInfo('');
    const ok = await loginWithOAuth(provider);
    if (!ok) setError(`ไม่สามารถเข้าสู่ระบบด้วย ${provider === 'google' ? 'Google' : 'Facebook'} ได้ในขณะนี้`);
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
        alert('✅ ตั้งรหัสผ่านใหม่สำเร็จแล้ว');
        navigate('/dashboard');
        return;
      }

      if (mode === 'login') {
        const user = await login(email, password, remember);
        if (user) navigate(user.role === 'admin' ? '/admin' : '/dashboard');
        else setError('เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน');
      } else {
        const res = await register(email, password, name);
        if (res.user && !res.needsConfirmation) {
          alert('สมัครสมาชิกเรียบร้อยแล้ว 🎉');
          navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
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
    <div className="min-h-screen relative flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <ThaiBackground />
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
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'var(--orange-soft)', color: 'var(--orange-deep)' }}>
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
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
                type={mode === 'setpw' ? 'password' : 'password'}
                placeholder={mode === 'setpw' ? 'รหัสผ่านใหม่' : 'รหัสผ่าน'}
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

          {mode !== 'setpw' && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1" style={{ background: 'var(--glass-border)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>หรือเข้าด้วย</span>
                <div className="h-px flex-1" style={{ background: 'var(--glass-border)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="ghost" fullWidth leftIcon={<GoogleIcon />} onClick={() => handleOAuth('google')}>
                  Google
                </Button>
                <button
                  type="button"
                  onClick={() => handleOAuth('facebook')}
                  className="flex items-center justify-center gap-2 rounded-lg font-bold transition-colors"
                  style={{ background: '#1877F2', color: '#fff', padding: '11px 20px', fontFamily: fonts.display, fontSize: fontSize('base') }}
                >
                  <Facebook size={20} /> Facebook
                </button>
              </div>
            </>
          )}
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
