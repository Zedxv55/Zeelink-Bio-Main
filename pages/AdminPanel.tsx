import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Ban, ShieldCheck, Download, Users, RefreshCw } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { THAI_REGIONS } from '../constants';

export const AdminPanel: React.FC = () => {
  const { user, usersList, deleteUser, banUser, simulateUsers, backupData } = useAuth();
  const [filterProvince, setFilterProvince] = useState('');
  const [simCount, setSimCount] = useState(10);
  const [simProvince, setSimProvince] = useState('เชียงใหม่');

  if (!user || user.role !== 'admin') {
      return <Navigate to="/login" replace />;
  }

  const filteredUsers = filterProvince 
      ? usersList.filter(u => u.province === filterProvince)
      : usersList;

  const activeUsers = usersList.length;

  const handleSimulate = () => {
      simulateUsers(simCount, simProvince);
      alert(`สร้าง ${simCount} Users ในจังหวัด ${simProvince} สำเร็จ!`);
  };
  
  return (
    <div className="min-h-screen pt-20 px-4 bg-gray-50 dark:bg-gray-900 pb-20">
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                    <ShieldCheck className="mr-3 text-blue-600" size={32} />
                    Admin Control Panel
                </h1>
                <p className="text-gray-500">จัดการผู้ใช้ จำลองข้อมูล และสำรองระบบ</p>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Simulation Tool */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Users className="mr-2" size={20}/> สร้าง User จำลอง (Simulation)
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500">จำนวน User</label>
                                <input 
                                    type="number" 
                                    value={simCount} 
                                    onChange={e => setSimCount(Number(e.target.value))}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">จังหวัด</label>
                                <select 
                                    value={simProvince} 
                                    onChange={e => setSimProvince(e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                >
                                    {THAI_REGIONS.flatMap(r => r.provinces).map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <button onClick={handleSimulate} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold text-sm">
                            เริ่มสร้างข้อมูลจำลอง
                        </button>
                    </div>
                </div>

                {/* Backup Tool */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Download className="mr-2" size={20}/> สำรองข้อมูล (Backup)
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">ดาวน์โหลดข้อมูลทั้งหมดของเว็บไซต์รวมถึง Users และ Questions ในรูปแบบ JSON</p>
                    <button onClick={backupData} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-bold text-sm flex items-center justify-center">
                        <Download size={16} className="mr-2" /> ดาวน์โหลดข้อมูลเว็บไซต์
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">จัดการผู้ใช้ ({activeUsers})</h2>
                    <select 
                        value={filterProvince} 
                        onChange={e => setFilterProvince(e.target.value)}
                        className="p-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">ทั้งหมด</option>
                        {THAI_REGIONS.flatMap(r => r.provinces).map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Likes</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <img src={u.photoUrl} alt="" className="w-8 h-8 rounded-full" />
                                            <div>
                                                <p className="font-bold text-sm text-gray-900 dark:text-white">{u.displayName}</p>
                                                <p className="text-xs text-gray-500">{u.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${u.showOnExplore ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {u.showOnExplore ? 'Online' : 'Offline'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {u.province}, {u.district}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                                        {u.likes || 0}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button 
                                            onClick={() => banUser(u.id)}
                                            className="text-yellow-500 hover:text-yellow-600 p-1" 
                                            title="Ban"
                                        >
                                            <Ban size={18} />
                                        </button>
                                        <button 
                                            onClick={() => deleteUser(u.id)}
                                            className="text-red-500 hover:text-red-600 p-1" 
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};
