import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ThaiBackground } from '../components/ThaiBackground';
import { Lock, Mail, User } from 'lucide-react';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = await login(email, password, remember);
      if (user) {
        navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setError('เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน');
      }
    } else {
      const user = await register(email, password, name);
      if (user) {
        alert('สมัครสมาชิกเรียบร้อยแล้ว 🎉');
        navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setError('ไม่สามารถสมัครได้ อาจเผื่ออีเมลซ้ำหรือรหัสผ่านสั้นเกินไป (อย่างน้อย 6 ตัว)');
      }
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
          {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
        </h2>
        <p className="text-center mb-8" style={{ color: 'var(--text-muted)' }}>
          {isLogin ? 'ยินดีต้อนรับกลับสู่ Zeelink' : 'สร้างบัญชีเพื่อเริ่มต้นใช้งาน'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'var(--orange-soft)', color: 'var(--orange-deep)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-3" size={20} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="ชื่อของคุณ"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg outline-none"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
                required={!isLogin}
              />
            </div>
          )}
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
          <div className="relative">
            <Lock className="absolute left-3 top-3" size={20} style={{ color: 'var(--text-muted)' }} />
            <input
              type="password"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg outline-none"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
              required
            />
          </div>

          {isLogin && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--orange)' }}
              />
              <label htmlFor="remember" className="ml-2 block text-sm" style={{ color: 'var(--text-muted)' }}>
                จำฉันไว้
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-bold transition-colors"
            style={{ background: 'var(--orange)', color: '#fff' }}
          >
            {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="hover:underline font-bold"
            style={{ color: 'var(--orange)' }}
          >
            {isLogin ? 'ยังไม่มีบัญชี? สมัครสมาชิก' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
