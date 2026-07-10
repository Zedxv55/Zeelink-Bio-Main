import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Post } from '../types';
import { GlassBackground } from '../components/GlassBackground';
import { Button } from '../components/ui/Button';
import { fonts, palette } from '../lib/designTokens';
import { Heart, MessageCircle, Share2, Send, Image as ImageIcon, Video, Newspaper, X } from 'lucide-react';

// จับ URL รูป/วิดีโอ จากข้อความ (รองรับแชร์ลิงก์ media แบบเดียวกับ Facebook)
const detectMedia = (text: string): { url?: string; type: 'none' | 'image' | 'video' } => {
  const m = text.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i);
  if (m) return { url: m[0], type: 'image' };
  const v = text.match(/https?:\/\/[^\s]+\.(mp4|webm|ogg)/i);
  if (v) return { url: v[0], type: 'video' };
  return { type: 'none' };
};

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'เมื่อครู่';
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชม.ที่แล้ว`;
  return `${Math.floor(h / 24)} วันที่แล้ว`;
};

export const Feed: React.FC = () => {
  const { user, profile, posts, createPost, toggleLikePost, addComment } = useAuth();
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video'>('none');
  const [submitting, setSubmitting] = useState(false);
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentFor, setCommentFor] = useState<string | null>(null);

  // รีเซ็ต media type เมื่อพิมพ์ URL
  useEffect(() => {
    if (mediaUrl.trim()) {
      const d = detectMedia(mediaUrl);
      setMediaType(d.type);
    } else {
      setMediaType('none');
    }
  }, [mediaUrl]);

  const handlePost = async () => {
    if (!text.trim() || !user) return;
    setSubmitting(true);
    const url = mediaUrl.trim() || detectMedia(text).url;
    const type = mediaUrl.trim() ? mediaType : detectMedia(text).type;
    await createPost(text.trim(), url, type);
    setText(''); setMediaUrl(''); setMediaType('none');
    setSubmitting(false);
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return;
    await addComment(postId, commentText.trim());
    setCommentText(''); setCommentFor(null);
  };

  return (
    <GlassBackground>
      <div className="min-h-screen pt-24 pb-20 px-4" style={{ fontFamily: fonts.body }}>
        <div className="max-w-2xl mx-auto space-y-5">

          {/* ===== Header ===== */}
          <div className="flex items-center gap-3 mb-2">
            <Newspaper size={26} style={{ color: palette.orange }} />
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>ฟีด</h1>
          </div>

          {/* ===== Composer (ล็อกอินแล้วเท่านั้น) ===== */}
          {user ? (
            <div className="glass-card p-4 border-[var(--orange)] animate-fade-in">
              <div className="flex gap-3">
                <img src={profile?.photoUrl || user.photoUrl} className="w-10 h-10 rounded-full object-cover border-2" style={{ borderColor: palette.orange }} />
                <div className="flex-1">
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="คุณกำลังคิดอะไรอยู่ หรือแชร์ผลงาน?"
                    className="w-full p-3 rounded-xl outline-none resize-none h-20"
                  />
                  {mediaUrl.trim() && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-white/10 relative">
                      {mediaType === 'image'
                        ? <img src={mediaUrl} className="w-full max-h-60 object-cover" />
                        : <video src={mediaUrl} controls className="w-full max-h-60" />}
                      <button onClick={() => setMediaUrl('')} className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white"><X size={14} /></button>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-1">
                      <button onClick={() => { const u = prompt('วาง URL รูปภาพ'); if (u) setMediaUrl(u); }} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold hover:bg-white/10" style={{ color: palette.blue }}>
                        <ImageIcon size={16} /> รูป
                      </button>
                      <button onClick={() => { const u = prompt('วาง URL วิดีโอ (mp4/webm)'); if (u) { setMediaUrl(u); setMediaType('video'); } }} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold hover:bg-white/10" style={{ color: palette.pink }}>
                        <Video size={16} /> วิดีโอ
                      </button>
                    </div>
                    <Button variant="primary" size="sm" onClick={handlePost} loading={submitting} disabled={!text.trim()} leftIcon={<Send size={14} />}>
                      โพสต์
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-5 text-center border-[var(--orange)]">
              <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>เข้าสู่ระบบเพื่อแชร์ผลงานและโพสต์ของคุณ</p>
              <Button variant="primary" size="sm" onClick={() => navigate('/login')}>เข้าสู่ระบบ</Button>
            </div>
          )}

          {/* ===== Feed Posts ===== */}
          {posts.map(post => (
            <article key={post.id} className="glass-card p-4 border-[var(--orange)]/30 animate-fade-in">
              {/* Author */}
              <div className="flex items-center gap-3 mb-3">
                <button onClick={() => navigate(`/${post.username}`)}>
                  <img src={post.photoUrl} className="w-10 h-10 rounded-full object-cover border-2" style={{ borderColor: palette.orange }} />
                </button>
                <div className="flex-1 min-w-0">
                  <button onClick={() => navigate(`/${post.username}`)} className="font-bold text-sm hover:underline block truncate" style={{ color: 'var(--text-primary)' }}>{post.displayName}</button>
                  <p className="text-[11px] opacity-60">@{post.username} · {timeAgo(post.createdAt)}</p>
                </div>
              </div>

              {/* Text */}
              {post.text && <p className="text-sm mb-3 whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>{post.text}</p>}

              {/* Media */}
              {post.mediaType === 'image' && post.mediaUrl && (
                <img src={post.mediaUrl} className="w-full rounded-xl border border-white/10 mb-3 max-h-96 object-cover" />
              )}
              {post.mediaType === 'video' && post.mediaUrl && (
                <video src={post.mediaUrl} controls className="w-full rounded-xl border border-white/10 mb-3 max-h-96" />
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-xs opacity-60 px-1 mb-2">
                <span>{post.likes > 0 ? `❤️ ${post.likes}` : ''}</span>
                <span>{post.comments.length > 0 ? `${post.comments.length} ความคิดเห็น` : ''}</span>
              </div>

              <div className="flex border-t border-white/10 pt-1">
                <button onClick={() => toggleLikePost(post.id)} className={`flex-1 py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-lg transition-colors hover:bg-white/10 ${post.likedByMe ? 'text-pink-500' : 'opacity-70'}`}>
                  <Heart size={18} className={post.likedByMe ? 'fill-pink-500' : ''} /> ถูกใจ
                </button>
                <button onClick={() => { setOpenCommentId(openCommentId === post.id ? null : post.id); setCommentFor(post.id); }} className="flex-1 py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-lg transition-colors hover:bg-white/10 opacity-70">
                  <MessageCircle size={18} /> คอมเมนต์
                </button>
                <button onClick={() => { if (navigator.share) navigator.share({ title: post.displayName, text: post.text, url: window.location.origin + '/#/' + post.username }); else navigator.clipboard.writeText(window.location.origin + '/#/' + post.username); }} className="flex-1 py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-lg transition-colors hover:bg-white/10 opacity-70">
                  <Share2 size={18} /> แชร์
                </button>
              </div>

              {/* Comments */}
              {openCommentId === post.id && (
                <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
                  {post.comments.map(c => (
                    <div key={c.id} className="flex gap-2">
                      <img src={c.photoUrl} className="w-7 h-7 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="rounded-xl px-3 py-2" style={{ background: 'var(--glass-border)' }}>
                          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{c.displayName}</p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.text}</p>
                        </div>
                        <p className="text-[10px] opacity-50 mt-0.5 ml-2">{timeAgo(c.createdAt)}</p>
                      </div>
                    </div>
                  ))}

                  {user ? (
                    <div className="flex gap-2">
                      <img src={profile?.photoUrl || user.photoUrl} className="w-7 h-7 rounded-full object-cover" />
                      <div className="flex-1 flex gap-2">
                        <input
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddComment(post.id); }}
                          placeholder="เขียนความคิดเห็น..."
                          className="flex-1 px-3 py-2 rounded-full text-sm outline-none"
                        />
                        <Button variant="primary" size="sm" onClick={() => handleAddComment(post.id)} disabled={!commentText.trim()}><Send size={14} /></Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-xs opacity-50 py-1">เข้าสู่ระบบเพื่อคอมเมนต์</p>
                  )}
                </div>
              )}
            </article>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-10 opacity-50">ยังไม่มีโพสต์ ลองแชร์ผลงานแรกของคุณ!</div>
          )}
        </div>
      </div>
    </GlassBackground>
  );
};

export default Feed;
