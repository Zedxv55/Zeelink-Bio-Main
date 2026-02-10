import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ThumbsUp, Send, Search, MessageSquare, Award, Heart, User } from 'lucide-react';
import { GlassBackground } from '../components/GlassBackground';

export const Vote: React.FC = () => {
  const navigate = useNavigate();
  const { user, questions, addQuestion, voteQuestion, usersList } = useAuth();
  const [newText, setNewText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !user) return;
    const res = await addQuestion(newText);
    if (res.status === 'approved') alert("ส่งคำถามสำเร็จ!");
    else alert("คำถามไม่ผ่านการตรวจสอบ (พบคำหยาบคาย)");
    setNewText('');
  };

  const approved = questions.filter(q => q.status === 'approved');
  const sorted = [...approved].sort((a, b) => b.votes - a.votes);
  const top5 = sorted.slice(0, 5);
  const filtered = approved.filter(q => q.text.toLowerCase().includes(searchTerm.toLowerCase()));

  const getAskerProfile = (userId: string) => usersList.find(p => p.userId === userId);

  return (
    <GlassBackground>
      <div className="min-h-screen pt-24 px-4 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* LEFT COLUMN: Green Glass */}
          <div className="space-y-10">
            <div className="glass-card p-8 border-green">
               <h3 className="text-sm font-bold uppercase mb-4 flex items-center text-green-500"><MessageSquare size={16} className="mr-2"/> ถามคำถามใหม่</h3>
               <form onSubmit={handleSend} className="space-y-4">
                  <textarea value={newText} onChange={(e) => setNewText(e.target.value)} maxLength={300} placeholder="คุณกำลังคิดอะไรอยู่?" className="w-full p-4 rounded-xl outline-none focus:ring-1 focus:ring-green-500 resize-none h-32" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-60">{newText.length}/300</span>
                    <button type="submit" disabled={!newText.trim()} className="px-6 py-2 bg-green-500 text-white font-bold text-xs hover:bg-green-600 transition-all flex items-center rounded-lg shadow-lg">ส่ง <Send size={14} className="ml-2" /></button>
                  </div>
               </form>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">คำถามทั้งหมด</h2>
                  <div className="relative w-48">
                    <input type="text" placeholder="ค้นหา..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-8 pr-4 py-2 text-xs rounded-full" />
                    <Search className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                  </div>
               </div>
               <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {filtered.map(q => (
                    <div key={q.id} className="glass-card p-5 flex justify-between items-center hover:bg-white/10 transition-all border-cyan hover-glow-cyan">
                       <div className="flex-1 pr-4">
                          <p className="font-bold text-sm mb-1">{q.text}</p>
                          <p className="text-[10px] opacity-60">โดย @{q.username} • {new Date(q.createdAt).toLocaleDateString()}</p>
                       </div>
                       <button onClick={() => voteQuestion(q.id)} className={`flex flex-col items-center p-2 rounded-lg min-w-[50px] transition-all ${q.votedUserIds.includes(user?.id || '') ? 'text-pink-500' : 'opacity-50'}`}>
                          <Heart size={18} className={q.votedUserIds.includes(user?.id || '') ? 'fill-pink-500' : ''} />
                          <span className="text-[10px] font-bold mt-1">{q.votes}</span>
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Purple Glass Top 5 */}
          <div className="glass-card p-6 border-purple h-fit">
             <div className="flex items-center space-x-2 mb-6">
                <Award className="text-yellow-400" size={24} />
                <h2 className="text-2xl font-bold">TOP 5 ประจำวัน</h2>
             </div>
             <div className="space-y-6">
                {top5.map((q, idx) => {
                  const asker = getAskerProfile(q.userId);
                  
                  // Rank Styles
                  let rankStyle = "border-l-4";
                  if (idx === 0) rankStyle += " border-yellow-400 from-yellow-500/10 to-transparent";
                  else if (idx === 1) rankStyle += " border-gray-300 from-gray-500/10 to-transparent";
                  else if (idx === 2) rankStyle += " border-orange-400 from-orange-500/10 to-transparent";
                  else rankStyle += " border-purple-400 from-purple-500/10 to-transparent";

                  return (
                    <div key={q.id} className={`relative bg-gradient-to-r p-6 shadow-md transition-transform hover:-translate-y-1 rounded-r-xl ${rankStyle} glass-card`}>
                        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white">#{idx + 1}</div>
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-lg font-bold leading-relaxed flex-1 pr-10">{q.text}</h3>
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-bold text-pink-500">{q.votes}</span>
                                <span className="text-[8px] uppercase tracking-widest opacity-60">VOTES</span>
                            </div>
                        </div>
                        
                        {/* Profile Info in Question */}
                        {asker && (
                           <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(`/${asker.username}`)}>
                                 <img src={asker.photoUrl} className="w-10 h-10 rounded-full object-cover border border-white/20" />
                                 <div>
                                    <p className="text-xs font-bold">{asker.displayName}</p>
                                    <p className="text-[10px] opacity-60">📍 {asker.province}</p>
                                 </div>
                              </div>
                              <div className="flex space-x-2">
                                 <button onClick={() => voteQuestion(q.id)} className="p-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 rounded-full transition-all"><Heart size={18} className={q.votedUserIds.includes(user?.id || '') ? 'fill-pink-500' : ''}/></button>
                                 <button onClick={() => navigate(`/${asker.username}`)} className="p-2 bg-white/10 hover:bg-white/20 text-blue-400 rounded-full transition-all"><User size={18}/></button>
                              </div>
                           </div>
                        )}
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      </div>
    </GlassBackground>
  );
};