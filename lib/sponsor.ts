/**
 * Sponsored / Featured pins on the map (monetization)
 *
 * โหมด demo: เก็บเป็น profile id ใน localStorage (ไม่มี backend)
 * ตอนต่อ Supabase จริง ให้แทนที่ด้วยตาราง เช่น `profile_sponsors(profile_id, until)`
 * และเช็ค `until > now()` ฝั่ง server — ห้ามเชื่อค่าฝั่ง client ว่า "สปอนเซอร์" คนเดียว
 */

const KEY = 'zeelink_sponsored';

export const getSponsoredIds = (): Set<string> => {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};

export const setSponsored = (profileId: string, on: boolean): void => {
  const s = getSponsoredIds();
  if (on) s.add(profileId);
  else s.delete(profileId);
  try {
    localStorage.setItem(KEY, JSON.stringify([...s]));
  } catch {
    /* noop */
  }
};

export const isSponsored = (profileId: string): boolean => getSponsoredIds().has(profileId);
