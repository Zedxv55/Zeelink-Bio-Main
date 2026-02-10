import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Ban, ShieldCheck, Download, Users, Edit3, Settings, Database, Link as LinkIcon, MessageSquare, AlertCircle } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { THAI_REGIONS } from '../constants';
import { GlassBackground } from '../components/GlassBackground';
import { SystemPopup } from '../types';

export const AdminPanel: React.FC = () => {
  const { user, usersList, deleteUser, banUser, simulateUsers, backupData, popups, createPopup, togglePopup, deletePopup } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'popups' | 'links' | 'backup'>('users');
  
  // Popup Form
  const [popupTitle, setPopupTitle] = useState('');
  const [popupImage, setPopupImage] = useState('');
  const [popupLink, setPopupLink] = useState('');

  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;

  const handleCreatePopup = () => {
      const newPopup: SystemPopup = {
          id: Date.now().toString(),
          title: popupTitle,
          imageUrl: popupImage,
          linkUrl: popupLink,
          isActive: true,
          frequency: 'once_daily'
      };
      createPopup(newPopup);
      setPopupTitle(''); setPopupImage(''); setPopupLink('');
      alert("สร้างโฆษณาเรียบร้อย");
  };

  return (
    <GlassBackground>
        <div className="min-h-screen pt-24 px-4 pb-20">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                    <h1 className="text-3xl font-bold flex items-center"><ShieldCheck className="mr-3 text-blue-600" size={32} />Admin Control</h1>
                    <div className="glass-card p-1 flex space-x-2">
                        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'hover:bg-white/10'}`}>Users</button>
                        <button onClick={() => setActiveTab('popups')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'popups' ? 'bg-purple-600 text-white' : 'hover:bg-white/10'}`}>Popups</button>
                        <button onClick={() => setActiveTab('links')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'links' ? 'bg-orange-600 text-white' : 'hover:bg-white/10'}`}>Links</button>
                        <button onClick={() => setActiveTab('backup')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'backup' ? 'bg-green-600 text-white' : 'hover:bg-white/10'}`}>Backup</button>
                    </div>
                </div>

                {activeTab === 'users' && (
                    <div className="glass-card overflow-hidden border-blue-500/30">
                        <table className="w-full text-left">
                            <thead className="bg-black/10 text-[10px] uppercase font-bold text-gray-500">
                                <tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {usersList.map(u => (
                                    <tr key={u.id} className="hover:bg-white/5">
                                        <td className="px-6 py-4 flex items-center space-x-3">
                                            <img src={u.photoUrl} className="w-8 h-8 rounded-full" />
                                            <div><p className="text-xs font-bold">{u.displayName}</p><p className="text-[10px] opacity-60">@{u.username}</p></div>
                                        </td>
                                        <td className="px-6 py-4"><span className={`px-2 py-0.5 text-[8px] rounded-full font-bold ${u.showOnExplore ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20'}`}>{u.showOnExplore ? 'Online' : 'Offline'}</span></td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => window.open(`/#/${u.username}`, '_blank')} className="text-blue-500 hover:scale-110 transition-transform"><Edit3 size={14}/></button>
                                            <button onClick={() => banUser(u.id)} className="text-yellow-500 hover:scale-110 transition-transform"><Ban size={14}/></button>
                                            <button onClick={() => deleteUser(u.id)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={14}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'popups' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="glass-card p-6 border-purple">
                            <h3 className="font-bold mb-4">สร้าง Popup โฆษณาใหม่</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input value={popupTitle} onChange={e => setPopupTitle(e.target.value)} placeholder="หัวข้อโฆษณา" className="p-2 rounded-lg" />
                                <input value={popupImage} onChange={e => setPopupImage(e.target.value)} placeholder="URL รูปภาพ" className="p-2 rounded-lg" />
                                <input value={popupLink} onChange={e => setPopupLink(e.target.value)} placeholder="ลิงก์ปลายทาง" className="p-2 rounded-lg" />
                            </div>
                            <button onClick={handleCreatePopup} className="mt-4 px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-lg">สร้าง Popup</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {popups.map(p => (
                                <div key={p.id} className={`glass-card p-4 border ${p.isActive ? 'border-green-500' : 'border-gray-500'}`}>
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold">{p.title}</h4>
                                        <div className="flex space-x-2">
                                            <button onClick={() => togglePopup(p.id)} className={`text-xs px-2 py-1 rounded font-bold ${p.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20'}`}>{p.isActive ? 'ON' : 'OFF'}</button>
                                            <button onClick={() => deletePopup(p.id)} className="text-red-500"><Trash2 size={16}/></button>
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
                        <button className="px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 shadow-lg">Scan Broken Links</button>
                    </div>
                )}

                {activeTab === 'backup' && (
                    <div className="glass-card p-8 text-center border-green">
                        <Database size={48} className="mx-auto text-green-500 mb-4" />
                        <h3 className="text-xl font-bold">System Backup</h3>
                        <button onClick={backupData} className="mt-6 px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center justify-center mx-auto shadow-lg"><Download size={20} className="mr-2"/> Download Full Backup (.JSON)</button>
                    </div>
                )}
            </div>
        </div>
    </GlassBackground>
  );
};