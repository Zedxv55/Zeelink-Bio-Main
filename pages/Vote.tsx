import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ThumbsUp, Send, Search, MessageSquare, AlertCircle, Award } from 'lucide-react';

export const Vote: React.FC = () => {
  const { user, questions, addQuestion, voteQuestion } = useAuth();
  const [newQuestionText, setNewQuestionText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState<'popular' | 'latest'>('popular');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    if (!user) {
        alert("Please login first");
        return;
    }
    
    const result = await addQuestion(newQuestionText);
    
    if (result.status === 'approved') {
        alert("✅ คำถามของคุณได้รับการอนุมัติแล้ว!");
    } else {
        alert("❌ ไม่สามารถส่งคำถามได้\n\nระบบตรวจพบเนื้อหาที่ไม่เหมาะสม กรุณาตรวจสอบคำถามและหลีกเลี่ยงคำหยาบคาย");
    }
    setNewQuestionText('');
  };

  const approvedQuestions = questions.filter(q => q.status === 'approved');
  const filteredQuestions = approvedQuestions.filter(q => q.text.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Top 5 Logic
  const top5 = [...approvedQuestions].sort((a, b) => b.votes - a.votes).slice(0, 5);
  
  // Sorted List Logic
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
      if (sortMode === 'popular') return b.votes - a.votes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getRankBadge = (index: number) => {
      if (index === 0) return <span className="text-2xl">🥇</span>;
      if (index === 1) return <span className="text-2xl">🥈</span>;
      if (index === 2) return <span className="text-2xl">🥉</span>;
      return <span className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{index + 1}</span>;
  };

  return (
    <div className="min-h-screen pt-20 px-4 bg-gray-50 dark:bg-gray-900 pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto h-full">
        
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Vote & Ask</h1>
            <p className="text-gray-500">พื้นที่แลกเปลี่ยนความคิดเห็นของคนไทย</p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (25%): Submit Question - Subtle Design */}
            <div className="lg:col-span-3 order-2 lg:order-1">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 sticky top-24">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center">
                        <MessageSquare size={16} className="mr-2"/> ส่งคำถามของคุณ
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <textarea
                            value={newQuestionText}
                            onChange={(e) => setNewQuestionText(e.target.value)}
                            placeholder="พิมพ์คำถาม..."
                            className="w-full p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 outline-none resize-none h-32 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                            maxLength={300}
                        />
                        <div className="flex justify-between items-center text-xs text-gray-400">
                            <span>{newQuestionText.length}/300</span>
                            <button 
                                type="submit"
                                disabled={!newQuestionText.trim()}
                                className="px-4 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg font-bold text-xs hover:opacity-90 disabled:opacity-50 flex items-center"
                            >
                                ส่งคำถาม <Send size={12} className="ml-1" />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 text-center">
                            *คำถามจะถูกตรวจสอบโดย AI อัตโนมัติ
                        </p>
                    </form>
                </div>
            </div>

            {/* Center Column (35%): Top 5 - Featured Design */}
            <div className="lg:col-span-4 order-1 lg:order-2">
                 <div className="mb-4 flex items-center space-x-2">
                    <Award className="text-yellow-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">TOP 5 ยอดนิยม</h2>
                 </div>
                 <div className="space-y-4">
                    {top5.map((q, idx) => (
                        <div key={q.id} className="relative bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-yellow-100 dark:border-gray-700 overflow-hidden group hover:shadow-md transition-all">
                             {/* Decorative bg for #1 */}
                             {idx === 0 && <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl -mr-10 -mt-10"></div>}
                             
                             <div className="flex justify-between items-start mb-3">
                                 <div className="flex items-center space-x-3">
                                     {getRankBadge(idx)}
                                     <div className="text-xs text-gray-400">@{q.username}</div>
                                 </div>
                                 <div className="text-[10px] text-gray-400">{new Date(q.createdAt).toLocaleDateString('th-TH')}</div>
                             </div>
                             
                             <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 leading-relaxed">
                                 {q.text}
                             </h3>
                             
                             <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                                 <div className="text-xs text-gray-500">
                                     <span className="font-bold text-gray-900 dark:text-white">{q.votes}</span> คนโหวตแล้ว
                                 </div>
                                 <button 
                                    onClick={() => voteQuestion(q.id)}
                                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${q.votedUserIds.includes(user?.id || '') ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600 hover:bg-pink-50'}`}
                                 >
                                    <ThumbsUp size={14} className={q.votedUserIds.includes(user?.id || '') ? "fill-pink-600" : ""} />
                                    <span>โหวต</span>
                                 </button>
                             </div>
                        </div>
                    ))}
                 </div>
            </div>

            {/* Right Column (40%): All Questions - Filtered List */}
            <div className="lg:col-span-5 order-3">
                 <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold text-gray-900 dark:text-white">คำถามทั้งหมด</h2>
                     <select 
                        value={sortMode} 
                        onChange={(e) => setSortMode(e.target.value as any)}
                        className="text-xs p-2 rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700"
                     >
                         <option value="popular">ยอดนิยม</option>
                         <option value="latest">ล่าสุด</option>
                     </select>
                 </div>
                 
                 <div className="mb-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="ค้นหาคำถาม..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    </div>
                 </div>

                 <div className="space-y-3">
                    {sortedQuestions.map(q => (
                         <div key={q.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-start hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                            <div className="flex-1 pr-4">
                                <h3 className="font-bold text-gray-800 dark:text-white text-sm mb-1">{q.text}</h3>
                                <p className="text-[10px] text-gray-400">@{q.username} • {new Date(q.createdAt).toLocaleDateString('th-TH')}</p>
                            </div>
                            <button 
                                onClick={() => voteQuestion(q.id)}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-[50px] ${q.votedUserIds.includes(user?.id || '') ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                            >
                                <ThumbsUp size={16} className={q.votedUserIds.includes(user?.id || '') ? "fill-blue-600" : ""} />
                                <span className="font-bold text-xs mt-1">{q.votes}</span>
                            </button>
                         </div>
                    ))}
                 </div>
            </div>

        </div>
      </div>
    </div>
  );
};
