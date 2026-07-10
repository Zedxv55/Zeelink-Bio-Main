import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Ban, ShieldCheck, ShieldOff, Download, Users, Edit3, Database, Link as LinkIcon, Circle, Wifi } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { GlassBackground } from '../components/GlassBackground';
import { Button } from '../components/ui/Button';
import { SystemPopup } from '../types';

const fmtLastSeen = (iso?: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  if (diff < 60_000) return 'เมื่อครู่';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} นาทีที่แล้ว`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} ชม.ที่แล้ว`;
  return new Date(iso).toLocaleDateString('th-TH');
};

export const AdminPanel: React.FC = () => {
  const {
    user, deleteUser, banUser, unbanUser, setUserRole,
    simulateUsers, backupData, popups, createPopup, togglePopup, deletePopup,
    onlineUsers, allUsers, loadAllUsers
  } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'popups' | 'links' | 'backup'>('users');

  // Popup Form
  const [popupTitle, setPopupTitle] = useState('');
  const [popupImage, setPopupImage] = useState('');
  const [popupLink, setPopupLink] = useState('');

  // โหลดรายชื่อผู้ใช้ทั้งหมดเมื่อเข้าแท็บผู้ใช้
  useEffect(() => {
    if (activeTab === 'users') loadAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;

  const onlineSet = useMemo(() => new Set(onlineUsers.map(o => o.user_id)), [onlineUsers]);
  const total = allUsers.length;
  const onlineCount = allUsers.filter(u => onlineSet.has(u.userId)).length;
  const bannedCount = allUsers.filter(u => u.isBanned).length;

  const handleCreatePopup = () => {
    const newPopup: SystemPopup = {
      id: Date.now().toString(),
      title: popupTitle, imageUrl: popupImage, linkUrl: popupLink,
      isActive: true, frequency: 'once_daily'
    };
    createPopup(newPopup);
    setPopupTitle(''); setPopupImage(''); setPopupLink('');
    alert("สร้างโฆษณาเรียบร้อย");
  };

  const afterAction = async (fn: () => Promise<any>) => {
    try { await fn(); } catch (e) { alert('เกิดข้อผิดพลาด: ' + (e as Error).message); }
    await loadAllUsers();
  };

  return (
    <GlassBackground>
      <div className="min-h-screen pt-24 px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
            <h1 className="text-3xl font-bold flex items-center"><ShieldCheck className="mr-3 text-[var(--orange)]" size={32} />Admin Control</h1>
            <div className="glass-card p-1 flex space-x-2">
              <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-[var(--orange)] text-white' : 'hover:bg-white/10'}`}>Users</button>
              <button onClick={() => setActiveTab('popups')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'popups' ? 'bg-[var(--pink)] text-white' : 'hover:bg-white/10'}`}>Popups</button>
              <button onClick={() => setActiveTab('links')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'links' ? 'bg-orange-600 text-white' : 'hover:bg-white/10'}`}>Links</button>
              <button onClick={() => setActiveTab('backup')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'backup' ? 'bg-green-600 text-white' : 'hover:bg-white/10'}`}>Backup</button>
            </div>
          </div>

          {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in">
              {/* สถิติรวม */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--orange)]/20 flex items-center justify-center"><Users size={24} className="text-[var(--orange)]" /></div>
                  <div><p className="text-2xl font-bold">{total}</p><p className="text-xs opacity-60">ผู้ใช้ทั้งหมด</p></div>
                </div>
                <div className="glass-card p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center"><Wifi size={24} className="text-green-500" /></div>
                  <div><p className="text-2xl font-bold text-green-500">{onlineCount}</p><p className="text-xs opacity-60">ออนไลน์ตอนนี้</p></div>
                </div>
                <div className="glass-card p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center"><Ban size={24} className="text-red-500" /></div>
                  <div><p className="text-2xl font-bold text-red-500">{bannedCount}</p><p className="text-xs opacity-60">ถูกแบน</p></div>
                </div>
              </div>

              {/* ออนไลน์ตอนนี้ (realtime) */}
              <div className="glass-card p-5 border-green-500/40">
                <h3 className="font-bold mb-3 flex items-center gap-2"><Wifi size={18} className="text-green-500" />ออนไลน์ตอนนี้ ({onlineUsers.length})</h3>
                {onlineUsers.length === 0 ? (
                  <p className="text-xs opacity-60">ยังไม่มีผู้ใช้ที่อยู่ในเว็บขณะนี้</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {onlineUsers.map((o) => (
                      <div key={o.user_id} className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5">
                        <img src={o.photoUrl} className="w-7 h-7 rounded-full" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        <span className="text-xs font-bold">{o.name || o.email}</span>
                        <Circle size={8} className="text-green-500 fill-green-500 animate-pulse" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ตารางผู้ใช้ทั้งหมด */}
              <div className="glass-card overflow-hidden border-[var(--orange)]/30">
                <table className="w-full text-left">
                  <thead className="bg-black/10 text-[10px] uppercase font-bold text-gray-500">
                    <tr>
                      <th className="px-6 py-4">ผู้ใช้</th>
                      <th className="px-6 py-4">บทบาท</th>
                      <th className="px-6 py-4">สถานะ</th>
                      <th className="px-6 py-4">เข้าล่าสุด</th>
                      <th className="px-6 py-4 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {allUsers.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-sm opacity-60">ยังไม่มีข้อมูลผู้ใช้ (กำลังโหลด หรือยังไม่มีบัญชี)</td></tr>
                    )}
                    {allUsers.map(u => {
                      const isOnline = onlineSet.has(u.userId);
                      const isSelf = u.userId === user.id;
                      return (
                        <tr key={u.userId || u.id} className="hover:bg-white/5">
                          <td className="px-6 py-4 flex items-center space-x-3">
                            <img src={u.photoUrl} className="w-8 h-8 rounded-full bg-white/10" alt="" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
                            <div>
                              <p className="text-xs font-bold">{u.displayName || u.name || '(ไม่ระบุ)'}{isSelf && <span className="ml-1 text-[var(--orange)]">(คุณ)</span>}</p>
                              <p className="text-[10px] opacity-60">@{u.username || '—'} · {u.email || '—'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 text-[8px] rounded-full font-bold ${u.role === 'admin' ? 'bg-[var(--orange)]/20 text-[var(--orange)]' : 'bg-gray-500/20'}`}>
                              {u.role === 'admin' ? 'ADMIN' : 'USER'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 text-[8px] rounded-full font-bold ${isOnline ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20'}`}>
                              {isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
                            </span>
                            {u.isBanned && <span className="ml-1 px-2 py-0.5 text-[8px] rounded-full font-bold bg-red-500/20 text-red-500">แบน</span>}
                          </td>
                          <td className="px-6 py-4 text-[10px] opacity-70">{fmtLastSeen(u.lastSeen)}</td>
                          <td className="px-6 py-4 text-right space-x-2">
                            {u.username && (
                              <button onClick={() => window.open(`/#/${u.username}`, '_blank')} className="text-blue-500 hover:scale-110 transition-transform" title="ดูโปรไฟล์"><Edit3 size={14} /></button>
                            )}
                            {u.isBanned ? (
                              <button onClick={() => afterAction(() => unbanUser(u.userId))} className="text-green-500 hover:scale-110 transition-transform" title="ปลดแบน"><ShieldCheck size={14} /></button>
                            ) : (
                              <button onClick={() => afterAction(() => banUser(u.userId))} className="text-yellow-500 hover:scale-110 transition-transform" title="แบน"><Ban size={14} /></button>
                            )}
                            {u.role === 'user' ? (
                              <button onClick={() => afterAction(() => setUserRole(u.userId, 'admin'))} className="text-[var(--orange)] hover:scale-110 transition-transform" title="เลื่อนเป็นแอดมิน"><ShieldCheck size={14} /></button>
                            ) : (
                              !isSelf && <button onClick={() => { if (confirm(`ถอนสิทธิ์แอดมินของ ${u.displayName || u.email} ?`)) afterAction(() => setUserRole(u.userId, 'user')); }} className="text-gray-400 hover:scale-110 transition-transform" title="ถอนแอดมิน"><ShieldOff size={14} /></button>
                            )}
                            {!isSelf && (
                              <button onClick={() => { if (confirm(`ลบผู้ใช้ ${u.displayName || u.email} ถาวร?`)) afterAction(() => deleteUser(u.userId)); }} className="text-red-500 hover:scale-110 transition-transform" title="ลบ"><Trash2 size={14} /></button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="text-right">
                <Button variant="ghost" size="sm" onClick={simulateUsers}>โหลดผู้ใช้จำลอง (demo)</Button>
              </div>
            </div>
          )}

          {activeTab === 'popups' && (
            <div className="space-y-8 animate-fade-in">
              <div className="glass-card p-6 border-[var(--pink)]">
                <h3 className="font-bold mb-4">สร้าง Popup โฆษณาใหม่</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input value={popupTitle} onChange={e => setPopupTitle(e.target.value)} placeholder="หัวข้อโฆษณา" className="p-2 rounded-lg" />
                  <input value={popupImage} onChange={e => setPopupImage(e.target.value)} placeholder="URL รูปภาพ" className="p-2 rounded-lg" />
                  <input value={popupLink} onChange={e => setPopupLink(e.target.value)} placeholder="ลิงก์ปลายทาง" className="p-2 rounded-lg" />
                </div>
                <div className="mt-4"><Button variant="primary" onClick={handleCreatePopup} style={{ background: 'var(--pink)' }}>สร้าง Popup</Button></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popups.map(p => (
                  <div key={p.id} className={`glass-card p-4 border ${p.isActive ? 'border-green-500' : 'border-gray-500'}`}>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold">{p.title}</h4>
                      <div className="flex space-x-2">
                        <button onClick={() => togglePopup(p.id)} className={`text-xs px-2 py-1 rounded font-bold ${p.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20'}`}>{p.isActive ? 'ON' : 'OFF'}</button>
                        <button onClick={() => deletePopup(p.id)} className="text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    {p.imageUrl && <img src={p.imageUrl} className="mt-2 h-32 w-full object-cover rounded-lg" />}
                    <p className="text-xs opacity-60 mt-2 truncate">{p.linkUrl}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="glass-card p-8 text-center border-orange">
              <LinkIcon size={48} className="mx-auto text-orange-500 mb-4" />
              <h3 className="text-xl font-bold">Link Tools</h3>
              <p className="opacity-60 mb-6">เครื่องมือสำหรับตรวจสอบลิงก์เสียและรีเฟรชข้อมูลโปรไฟล์</p>
              <div><Button variant="primary" style={{ background: 'var(--orange)' }}>Scan Broken Links</Button></div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="glass-card p-8 text-center border-green">
              <Database size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-bold">System Backup</h3>
              <div className="mt-6 flex justify-center"><Button variant="primary" size="lg" leftIcon={<Download size={20} />} onClick={backupData} style={{ background: 'var(--green)' }}>Download Full Backup (.JSON)</Button></div>
            </div>
          )}
        </div>
      </div>
    </GlassBackground>
  );
};

export default AdminPanel;
