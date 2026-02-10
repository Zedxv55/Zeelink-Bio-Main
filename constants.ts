import { Region, Question } from './types';

export const FLOATING_PHRASES = [
  // Original
  "สวัสดีครับ/ค่ะ", "คนไทย", "ใส่ใจ", "อาหมวย", "อาหวัง",
  "ช้างกูอยู่ไหน", "คนไทย=อิสระ", "โตมาที่อยากเป็น โตมาซิกูรู",
  "อ่านทำไม", "อ่านแล้วรวย", "ซวยแล้วมึง", "เลือกอะไรระหว่างเขากับเขา",
  "สกิวคุยไม่ได้ครบเต็ม100", "หาสาระหรอ ไม่มี", "ไปไหนมา กินข้าวยัง",
  "แล้วแต่ใจมึง", "เดี๋ยวก็รู้เอง", "ทำไมต้องรู้ด้วย", "อย่าถามมาก ไปก่อน",
  "มึงจะเอายังไง", "ช่างมันเถอะ", "ไม่รู้ถามกู", "เจอกันที่นั่น", "Random ชีวิต",
  
  // New Quirky
  "ไทยโอลี่", "สนุกจังคนไทย", "เฮงๆรวยๆ", "มาทำบุญกัน",
  "ชิวๆไปครับ", "ไม่ต้องคิดมาก", "ทำไปก่อน", "เดี๋ยวรู้เอง",
  "อย่าเครียด", "สู้ๆนะครับ", "พรุ่งนี้ค่อยว่ากัน", "ชีวิตคือการเรียนรู้",
  "วันนี้กินอะไรดี", "ไปไหนมาครับ", "เจอกันเร็วๆนี้", "ฝันดีนะคะ",
  "ขอบคุณนะครับ", "ไม่เป็นไรครับ", "ได้เวลาพักผ่อน", "สบายดีไหมครับ",
  
  // Bonus
  "เย้ๆๆ", "ว้าว", "โอเค", "เริ่ด", "เจ็บ", "แซ่บ", "อร่อย",
  "สดชื่น", "เหนื่อย", "ง่วง", "หิว", "อิ่ม", "ร้อน", "หนาว",
  "ฝนตก", "แดดออก", "ลมแรง", "สบาย", "มีความสุข", "โชคดี",
  "เข้ามาดูดิ", "ไม่ลองไม่รู้", "กดแล้วจะติดใจ", "คนไทยไม่แพ้ใคร",
  "แอบส่องได้", "โปรไฟล์ต้องมี", "สายลุยต้องลอง", "อย่ากดเล่นเดี๋ยวติดใจ",
  "โสดจริงไม่จกตา", "เข้ามาแล้วห้ามเหงา", "ชาวกรุงพร้อมไหม", "วาร์ปมาเลย",
  "ไม่คุยเดี๋ยวพลาด", "ใครอยู่ใกล้ฉัน", "โปรไฟล์มีของ", "กดใจไม่เสียตัง",
  "ไทยแลนด์โอนลี่", "ลองแล้วจะรู้"
];

export const BANNED_WORDS = [
  "กู", "มึง", "สัส", "เหี้ย", "ควย", "เย็ด", "fuck", "shit", "เลว", "ชั่ว"
];

// Simplified for Demo (Production should use full JSON database)
export const THAI_REGIONS: Region[] = [
  {
    id: 1,
    name: "ภาคเหนือ",
    provinces: [
      { id: 1, name: "เชียงใหม่", zipCodeBase: "50", lat: 18.7883, lng: 98.9853 },
      { id: 2, name: "เชียงราย", zipCodeBase: "57", lat: 19.9105, lng: 99.8406 },
      { id: 3, name: "ลำปาง", zipCodeBase: "52", lat: 18.2888, lng: 99.5207 },
      { id: 4, name: "น่าน", zipCodeBase: "55", lat: 18.7830, lng: 100.7719 },
      { id: 5, name: "แม่ฮ่องสอน", zipCodeBase: "58", lat: 19.3020, lng: 97.9654 }
    ]
  },
  {
    id: 2,
    name: "ภาคกลาง",
    provinces: [
      { id: 21, name: "กรุงเทพมหานคร", zipCodeBase: "10", lat: 13.7563, lng: 100.5018 },
      { id: 22, name: "นนทบุรี", zipCodeBase: "11", lat: 13.8591, lng: 100.5217 },
      { id: 23, name: "ปทุมธานี", zipCodeBase: "12", lat: 14.0208, lng: 100.5250 },
      { id: 24, name: "พระนครศรีอยุธยา", zipCodeBase: "13", lat: 14.3585, lng: 100.5760 },
      { id: 25, name: "สมุทรปราการ", zipCodeBase: "10", lat: 13.5991, lng: 100.5968 }
    ]
  },
  {
    id: 3,
    name: "ภาคอีสาน",
    provinces: [
      { id: 31, name: "ขอนแก่น", zipCodeBase: "40", lat: 16.4322, lng: 102.8236 },
      { id: 32, name: "นครราชสีมา", zipCodeBase: "30", lat: 14.9759, lng: 102.1000 },
      { id: 33, name: "อุดรธานี", zipCodeBase: "41", lat: 17.4138, lng: 102.7872 },
      { id: 34, name: "อุบลราชธานี", zipCodeBase: "34", lat: 15.2448, lng: 104.8473 },
      { id: 35, name: "บุรีรัมย์", zipCodeBase: "31", lat: 14.9930, lng: 103.1029 }
    ]
  },
  {
    id: 4,
    name: "ภาคใต้",
    provinces: [
      { id: 41, name: "ภูเก็ต", zipCodeBase: "83", lat: 7.8804, lng: 98.3923 },
      { id: 42, name: "สงขลา", zipCodeBase: "90", lat: 7.1981, lng: 100.5951 },
      { id: 43, name: "สุราษฎร์ธานี", zipCodeBase: "84", lat: 9.1389, lng: 99.3126 },
      { id: 44, name: "กระบี่", zipCodeBase: "81", lat: 8.0863, lng: 98.9063 },
      { id: 45, name: "นครศรีธรรมราช", zipCodeBase: "80", lat: 8.4309, lng: 99.9631 }
    ]
  }
];

export const AVAILABLE_FONTS = [
  { name: 'Prompt (มาตรฐาน)', value: 'Prompt' },
  { name: 'Kanit (ทันสมัย)', value: 'Kanit' },
  { name: 'Sarabun (ทางการ)', value: 'Sarabun' },
  { name: 'Mitr (เป็นมิตร)', value: 'Mitr' },
  { name: 'Chakra Petch (เกมมิ่ง)', value: 'Chakra Petch' },
  { name: 'Charm (ไทยเดิม)', value: 'Charm' }
];

export const AI_PRESETS = [
  { name: "Neon Dark", bg: "#0f172a", text: "#38bdf8", btn: "#ec4899", glass: true },
  { name: "Minimal White", bg: "#f8fafc", text: "#334155", btn: "#000000", glass: false },
  { name: "Pastel Dream", bg: "#fff1f2", text: "#881337", btn: "#fda4af", glass: true },
  { name: "Cyber Punk", bg: "#000000", text: "#39ff14", btn: "#ff00ff", glass: true },
  { name: "Luxury Gold", bg: "#1c1917", text: "#fbbf24", btn: "#78350f", glass: true }
];

export const INITIAL_QUESTIONS: Question[] = [
  { id: '1', userId: 'mock1', username: 'somchai', text: 'อยากให้ Zeelink เพิ่มฟีเจอร์อะไรมากที่สุดครับ?', votes: 1254, createdAt: new Date().toISOString(), votedUserIds: [], status: 'approved' },
  { id: '2', userId: 'mock2', username: 'admin', text: 'ร้านกาแฟในเชียงใหม่ร้านไหนดี?', votes: 856, createdAt: new Date(Date.now() - 86400000).toISOString(), votedUserIds: [], status: 'approved' }
];
