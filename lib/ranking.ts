/**
 * ranking.ts — อัลกอริทึมเรียงลำดับเนื้อหา (แรงบันดาลใจจากระบบ Facebook News Feed / EdgeRank)
 *
 * ⚠️ ไม่ได้ก๊อปปี้ฟังก์ชั่นของ Facebook แต่ "ยืมแนวคิดระบบ" (system/algorithm approach):
 *    EdgeRank ใช้สมการ  score = Σ (Affinity × Weight × Decay)
 *    - Affinity  = ความสนิทสนม (ผู้ใช้ติดตามกันหรือไม่)
 *    - Weight    = น้ำหนักของ action (คอมเมนต์สำคัญกว่าไลก์)
 *    - Decay     = ความเก่าของโพสต์ (ของใหม่ได้คะแนนสูงกว่า)
 *
 * เราปรับมาใช้กับ Zeelink Feed + Explore:
 *    feedScore  = recency * W_RECENCY + engagement * W_ENGAGEMENT + affinity * W_AFFINITY
 *    (ค่าน้ำหนักปรับได้ที่นี่ เดียว — single source of truth)
 */

import { Post, Profile } from '../types';

// ===== น้ำหนัก (Weights) =====
export const RANK_WEIGHTS = {
  recency: 0.5,    // ของใหม่สำคัญสุด
  engagement: 0.3, // ยอดปฏิสัมพันธ์
  affinity: 0.2,   // ความสนิทสนม
} as const;

// อายุโพสต์ที่คะแนน recency จะลดเหลือ 0 (ชั่วโมง)
const RECENCY_HALF_LIFE_HOURS = 48;

// น้ำหนัก action ต่างๆ (Comment สำคัญกว่า Like — เหมือน EdgeRank ที่ให้ Weight ต่างกัน)
const ACTION_WEIGHT = {
  like: 1,
  comment: 2,
  share: 1.5,
} as const;

/**
 * คะแนนความใหม่ (recency) — ใช้ exponential decay
 * โพสต์เพิ่งโพส = 1.0 → เก่าลงตามอายุ (ครึ่งชีวิต 48 ชม.)
 */
export const recencyScore = (createdAt: string, now: number = Date.now()): number => {
  const ageMs = now - new Date(createdAt).getTime();
  const ageHours = Math.max(0, ageMs / 3_600_000);
  // decay = 0.5 ^ (age / halfLife)
  return Math.pow(0.5, ageHours / RECENCY_HALF_LIFE_HOURS);
};

/**
 * คะแนนการมีส่วนร่วม (engagement)
 * likes + comments*2 + shares*1.5 → normalize ด้วย log เพื่อไม่ให้โพสต์ viral  dominate เกินไป
 */
export const engagementScore = (post: Pick<Post, 'likes' | 'comments'> & { shares?: number }): number => {
  const raw =
    (post.likes || 0) * ACTION_WEIGHT.like +
    (post.comments?.length || 0) * ACTION_WEIGHT.comment +
    (post.shares || 0) * ACTION_WEIGHT.share;
  if (raw <= 0) return 0;
  // log(1 + raw) → โตช้า ป้องกัน outlier
  return Math.log10(1 + raw);
};

/**
 * คะแนนความสนิทสนม (affinity)
 * - ผู้ใช้ติดตามผู้โพสต์ → +1.5
 * - เคยเห็น/เคยปฏิสัมพันธ์ → (ขยายได้ในอนาคต)
 */
export const affinityScore = (
  post: Pick<Post, 'userId'>,
  followingIds: string[]
): number => {
  if (followingIds.includes(post.userId)) return 1.5;
  return 0;
};

/**
 * คะแนนรวมสำหรับ Feed (0 ~ 2.0 ประมาณ)
 * ใช้เรียงลำดับ: มาก่อน = สำคัญกว่า
 */
export const calculateFeedScore = (
  post: Pick<Post, 'userId' | 'likes' | 'comments' | 'createdAt'> & { shares?: number },
  followingIds: string[] = [],
  now: number = Date.now()
): number => {
  const r = recencyScore(post.createdAt, now);
  const e = engagementScore(post);
  const a = affinityScore(post, followingIds);
  return r * RANK_WEIGHTS.recency + e * RANK_WEIGHTS.engagement + a * RANK_WEIGHTS.affinity;
};

/**
 * เรียงโพสต์ตามคะแนน (มาก → น้อย)
 * O(n log n) — ปลอดภัยสำหรับฟีดขนาดใหญ่
 */
export const rankPosts = (posts: Post[], followingIds: string[] = []): Post[] => {
  return [...posts].sort((a, b) => {
    const sa = calculateFeedScore(a, followingIds);
    const sb = calculateFeedScore(b, followingIds);
    if (sb !== sa) return sb - sa;
    // tie-breaker: ของใหม่กว่า
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

/**
 * ระยะ haversine (km) — สำหรับ Explore "คนใกล้คุณ"
 * (แยกมาที่นี่เพื่อให้ Feed/Explore ใช้ร่วมกัน)
 */
export const haversineKm = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

/**
 * Explore ranking — คนสนิท/ติดตาม → จังหวัดเดียวกัน → ระยะใกล้ → ยอดไลก์
 * คืนลำดับที่เรียงแล้ว (ไม่เปลี่ยนข้อมูลต้นทาง)
 */
export const rankExploreProfiles = (
  profiles: Profile[],
  me: { lat: number; lng: number; province?: string } | null,
  followingIds: string[] = [],
  myProvince?: string
): Profile[] => {
  return [...profiles].sort((a, b) => {
    // 1. ติดตามก่อน
    const fa = followingIds.includes(a.userId) ? 0 : 1;
    const fb = followingIds.includes(b.userId) ? 0 : 1;
    if (fa !== fb) return fa - fb;

    // 2. จังหวัดเดียวกัน
    const pa = myProvince && a.province === myProvince ? 0 : 1;
    const pb = myProvince && b.province === myProvince ? 0 : 1;
    if (pa !== pb) return pa - pb;

    // 3. ระยะใกล้ (มีพิกัดทั้งคู่)
    if (me && a.lat && b.lat) {
      const da = haversineKm(me, { lat: a.lat, lng: a.lng });
      const db = haversineKm(me, { lat: b.lat, lng: b.lng });
      if (Math.abs(da - db) > 0.01) return da - db;
    }

    // 4. ยอดไลก์
    return (b.likes || 0) - (a.likes || 0);
  });
};
