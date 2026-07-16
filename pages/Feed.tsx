import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Post, Profile } from '../types';
import { GlassBackground } from '../components/GlassBackground';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { haversineKm } from '../lib/ranking';
import { fonts, palette, lineHeight } from '../lib/designTokens';
import { Heart, MessageCircle, Share2, Send, Image as ImageIcon, Video, Newspaper, X, Search, User, Map as MapIcon } from 'lucide-react';

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
  const { user, profile, posts, createPost, toggleLikePost, addComment, uploadPostMedia, usersList, followingIds, followUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // สะพานค้นหาจากแถบเมนู (navbar) ผ่าน ?q=
  const urlQ = searchParams.get('q') || '';

  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video'>('none');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentFor, setCommentFor] = useState<string | null>(null);
  const [search, setSearch] = useState(urlQ);

  // sync เมื่อ navbar นำทางมาพร้อม ?q= ใหม่
  useEffect(() => { setSearch(urlQ); }, [urlQ]);

  const updateSearch = (v: string) => {
    setSearch(v);
    if (v.trim()) setSearchParams({ q: v.trim() }, { replace: true });
    else setSearchParams({}, { replace: true });
  };

  // ค้นหาโพสต์ฝั่ง client — O(n) ตามหลัก CLAUDE.md (ไม่วนซ้ำซ้อน)
  const visiblePosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(p =>
      p.text.toLowerCase().includes(q) ||
      p.displayName.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q)
    );
  }, [posts, search]);

  // "คนใกล้คุณ" สำหรับคอลัมน์ขวา (เดสก์ท็อป) — คล้าย People You May Know ของ Facebook
  const suggestions = useMemo(() => {
    const others = usersList.filter(u => u.id !== profile?.id && u.showOnExplore);
    const me = profile && profile.lat ? { lat: profile.lat, lng: profile.lng } : null;
    const sorted = [...others].sort((a, b) => {
      const fa = followingIds.includes(a.userId) ? 1 : 0;
      const fb = followingIds.includes(b.userId) ? 1 : 0;
      if (fa !== fb) return fa - fb; // ยังไม่ได้ติดตามขึ้นก่อน
      if (me && a.lat && b.lat) {
        return haversineKm(me, { lat: a.lat, lng: a.lng }) - haversineKm(me, { lat: b.lat, lng: b.lng });
      }
      return (b.likes || 0) - (a.likes || 0);
    });
    return sorted.slice(0, 6);
  }, [usersList, followingIds, profile]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset เพื่อให้เลือกไฟล์เดิมซ้ำได้
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) { setUploadError('รองรับเฉพาะไฟล์รูปภาพหรือวิดีโอเท่านั้น'); return; }
    setUploadError('');
    setUploading(true);
    const url = await uploadPostMedia(file);
    setUploading(false);
    if (url) { setMediaUrl(url); setMediaType(isVideo ? 'video' : 'image'); }
    else setUploadError('อัปโหลดไม่สำเร็จ (อาจยังไม่มีพื้นที่เก็บไฟล์ — แอดมินต้องรัน supabase/storage-posts-media.sql ก่อน)');
  };

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
        <div className="max-w-2xl mx-auto space-y-5 xl:max-w-6xl xl:flex xl:gap-6 xl:space-y-0">

          {/* ===== คอลัมน์กลาง (ฟีด) ===== */}
          <div className="min-w-0 flex-1 space-y-5">

          {/* ===== Header ===== */}
          <div className="mb-2">
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase mb-1" style={{ color: 'var(--blueprint)' }}>Feed · ฟีดของคุณ</p>
            <div className="flex items-center gap-3">
              <Newspaper size={26} style={{ color: palette.orange }} />
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>ฟีด</h1>
            </div>
          </div>

          {/* ===== Composer (ล็อกอินแล้วเท่านั้น) ===== */}
          {user ? (
            <div className="glass-card p-4 border-[var(--glass-border)] animate-fade-in">
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
                    <div className="mt-2 rounded-lg overflow-hidden border border-[var(--glass-border)] relative">
                      {mediaType === 'image'
                        ? <img src={mediaUrl} className="w-full max-h-60 object-cover" />
                        : <video src={mediaUrl} controls className="w-full max-h-60" />}
                      <button onClick={() => setMediaUrl('')} className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white"><X size={14} /></button>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
                    <div className="flex gap-1 flex-wrap">
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold hover:bg-[var(--glass-border)] disabled:opacity-50" style={{ color: palette.blue }}>
                        <ImageIcon size={16} /> {uploading ? 'กำลังอัปโหลด...' : 'รูป/วิดีโอ'}
                      </button>
                      <button type="button" onClick={() => { const u = prompt('วาง URL รูปภาพหรือวิดีโอ'); if (u) { setMediaUrl(u); setMediaType(detectMedia(u).type); } }} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold hover:bg-[var(--glass-border)]" style={{ color: palette.pink }}>
                        ลิงก์ URL
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
                    </div>
                    <Button variant="primary" size="sm" onClick={handlePost} loading={submitting} disabled={!text.trim() && !mediaUrl} leftIcon={<Send size={14} />}>
                      โพสต์
                    </Button>
                  </div>
                  {uploadError && (
                    <p className="text-[11px] mt-2" style={{ color: palette.pink }}>{uploadError}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-5 text-center border-[var(--glass-border)]">
              <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>เข้าสู่ระบบเพื่อแชร์ผลงานและโพสต์ของคุณ</p>
              <Button variant="primary" size="sm" onClick={() => navigate('/login')}>เข้าสู่ระบบ</Button>
            </div>
          )}

          {/* ===== ช่องค้นหาโพสต์ (O(n) client-side) ===== */}
          <div className="glass-card p-3 flex items-center gap-2" style={{ borderColor: 'var(--glass-border)' }}>
            <Search size={18} style={{ color: palette.blue }} className="flex-shrink-0" />
            <input
              value={search}
              onChange={e => updateSearch(e.target.value)}
              placeholder="ค้นหาโพสต์ หรือชื่อคนโพสต์..."
              aria-label="ค้นหาโพสต์"
              className="flex-1 bg-transparent outline-none text-sm py-1"
              style={{ color: 'var(--text-primary)', fontFamily: fonts.body }}
            />
            {search && (
              <button onClick={() => updateSearch('')} aria-label="ล้างการค้นหา" className="opacity-60 hover:opacity-100">
                <X size={16} />
              </button>
            )}
          </div>

          {/* ===== Feed Posts ===== */}
          {visiblePosts.map(post => (
            <article key={post.id} className="glass-card p-4 border-[var(--glass-border)] animate-fade-in">
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
                <img src={post.mediaUrl} className="w-full rounded-xl border border-[var(--glass-border)] mb-3 max-h-96 object-cover" />
              )}
              {post.mediaType === 'video' && post.mediaUrl && (
                <video src={post.mediaUrl} controls className="w-full rounded-xl border border-[var(--glass-border)] mb-3 max-h-96" />
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-xs opacity-60 px-1 mb-2">
                <span>{post.likes > 0 ? `❤️ ${post.likes}` : ''}</span>
                <span>{post.comments.length > 0 ? `${post.comments.length} ความคิดเห็น` : ''}</span>
              </div>

              <div className="flex border-t border-[var(--glass-border)] pt-1">
                <button onClick={() => toggleLikePost(post.id)} className={`flex-1 py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-lg transition-colors hover:bg-[var(--glass-border)] ${post.likedByMe ? 'text-[var(--orange)]' : 'opacity-70'}`}>
                  <Heart size={18} className={post.likedByMe ? 'fill-[var(--orange)]' : ''} /> ถูกใจ
                </button>
                <button onClick={() => { setOpenCommentId(openCommentId === post.id ? null : post.id); setCommentFor(post.id); }} className="flex-1 py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-lg transition-colors hover:bg-[var(--glass-border)] opacity-70">
                  <MessageCircle size={18} /> คอมเมนต์
                </button>
                <button onClick={() => { if (navigator.share) navigator.share({ title: post.displayName, text: post.text, url: window.location.origin + '/#/' + post.username }); else navigator.clipboard.writeText(window.location.origin + '/#/' + post.username); }} className="flex-1 py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-lg transition-colors hover:bg-[var(--glass-border)] opacity-70">
                  <Share2 size={18} /> แชร์
                </button>
              </div>

              {/* Comments */}
              {openCommentId === post.id && (
                <div className="mt-3 space-y-3 border-t border-[var(--glass-border)] pt-3">
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
            user ? (
              // Onboarding (P0): ผู้ใช้ใหม่หลงทาง → ชวนทำงานแรกสุด
              <div className="glass-card p-6 text-center border-[var(--glass-border)] animate-fade-in">
                <div className="text-4xl mb-3">👋</div>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>ยินดีต้อนรับสู่ฟีดของคุณ!</h3>
                <p className="text-sm opacity-70 mb-4" style={{ lineHeight: lineHeight.normal }}>
                  เริ่มต้นง่ายๆ แค่ 3 ขั้นตอน: ตั้งโปรไฟล์ → แชร์ผลงาน → ติดตามเพื่อน
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="primary" size="sm" leftIcon={<User size={14} />} onClick={() => navigate('/dashboard')}>
                    ตั้งโปรไฟล์
                  </Button>
                  <Button variant="ghost" size="sm" leftIcon={<Newspaper size={14} />} onClick={() => navigate('/explore')}>
                    ไปค้นหาเพื่อน
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 opacity-50">ยังไม่มีโพสต์ ลองแชร์ผลงานแรกของคุณ!</div>
            )
          )}
          {posts.length > 0 && visiblePosts.length === 0 && (
            <div className="text-center py-10 opacity-50">ไม่พบโพสต์ที่ตรงกับ &quot;{search}&quot;</div>
          )}
          </div>

          {/* ===== คอลัมน์ขวา (เดสก์ท็อป xl ขึ้นไป) ===== */}
          <aside className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-20 space-y-4">
              <NearbyWidget suggestions={suggestions} followingIds={followingIds} onFollow={followUser} />
            </div>
          </aside>
        </div>
      </div>
    </GlassBackground>
  );
};

export default Feed;

// ===== คอลัมน์ขวา: คนใกล้คุณ (คล้าย People You May Know ของ Facebook) =====
const NearbyWidget: React.FC<{
  suggestions: Profile[];
  followingIds: string[];
  onFollow: (id: string) => void;
}> = ({ suggestions, followingIds, onFollow }) => {
  const navigate = useNavigate();
  if (suggestions.length === 0) return null;
  return (
    <Card padding="md" accent="blue">
      <div className="mb-3">
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase mb-1" style={{ color: 'var(--blueprint)' }}>Nearby · คนใกล้คุณ</p>
        <div className="flex items-center gap-2">
          <MapIcon size={18} style={{ color: palette.blue }} />
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)', fontFamily: fonts.body }}>
            คนใกล้คุณ
          </h3>
        </div>
      </div>
      <div className="space-y-2">
        {suggestions.map(u => {
          const isFollowing = followingIds.includes(u.userId);
          return (
            <div key={u.id} className="flex items-center gap-3">
              <button onClick={() => navigate(`/${u.username}`)} className="flex-shrink-0">
                <img src={u.photoUrl} alt={u.displayName} className="w-10 h-10 rounded-full object-cover border" style={{ borderColor: 'var(--glass-border)' }} />
              </button>
              <div className="flex-1 min-w-0">
                <button onClick={() => navigate(`/${u.username}`)} className="block truncate text-sm font-bold hover:underline" style={{ color: 'var(--text-primary)' }}>
                  {u.displayName}
                </button>
                <p className="text-[11px] opacity-60 truncate">{u.province || 'ครีเอเตอร์ไทย'}</p>
              </div>
              <button
                onClick={() => onFollow(u.userId)}
                disabled={isFollowing}
                className="px-3 py-1 rounded-lg text-xs font-bold flex-shrink-0 transition-colors"
                style={{
                  color: isFollowing ? 'var(--text-secondary)' : palette.orange,
                  background: isFollowing ? 'var(--glass-border)' : palette.orangeSoft,
                }}
              >
                {isFollowing ? 'ติดตามแล้ว' : 'ติดตาม'}
              </button>
            </div>
          );
        })}
      </div>
      <button onClick={() => navigate('/explore')} className="w-full mt-3 text-xs font-bold py-2 rounded-lg hover:bg-[var(--glass-border)]" style={{ color: palette.blue }}>
        ดูแผนที่ทั้งหมด →
      </button>
    </Card>
  );
};
