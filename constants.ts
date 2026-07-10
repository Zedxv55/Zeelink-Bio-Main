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

// ===== ครบ 77 จังหวัด (ตาม 77.txt) แบ่ง 4 ภาค: กลาง 26 · อีสาน 20 · เหนือ 17 · ใต้ 14 =====
export const THAI_REGIONS: Region[] = [
  {
    id: 1,
    name: "ภาคกลาง",
    provinces: [
      { id: 1, name: "กรุงเทพมหานคร", zipCodeBase: "10", lat: 13.7563, lng: 100.5018 },
      { id: 2, name: "กาญจนบุรี", zipCodeBase: "71", lat: 14.0227, lng: 99.5328 },
      { id: 3, name: "ชัยนาท", zipCodeBase: "17", lat: 15.1851, lng: 100.1251 },
      { id: 4, name: "นครนายก", zipCodeBase: "26", lat: 14.2069, lng: 101.2130 },
      { id: 5, name: "นครปฐม", zipCodeBase: "73", lat: 13.8199, lng: 100.0621 },
      { id: 6, name: "นนทบุรี", zipCodeBase: "11", lat: 13.8591, lng: 100.5217 },
      { id: 7, name: "ปทุมธานี", zipCodeBase: "12", lat: 14.0208, lng: 100.5250 },
      { id: 8, name: "พระนครศรีอยุธยา", zipCodeBase: "13", lat: 14.3585, lng: 100.5760 },
      { id: 9, name: "ลพบุรี", zipCodeBase: "15", lat: 14.7995, lng: 100.6534 },
      { id: 10, name: "ราชบุรี", zipCodeBase: "70", lat: 13.5283, lng: 99.8134 },
      { id: 11, name: "สระบุรี", zipCodeBase: "18", lat: 14.5289, lng: 100.9108 },
      { id: 12, name: "สิงห์บุรี", zipCodeBase: "16", lat: 14.8879, lng: 100.4017 },
      { id: 13, name: "สุพรรณบุรี", zipCodeBase: "72", lat: 14.4745, lng: 100.1177 },
      { id: 14, name: "อ่างทอง", zipCodeBase: "14", lat: 14.5896, lng: 100.4550 },
      { id: 15, name: "สมุทรปราการ", zipCodeBase: "10", lat: 13.5991, lng: 100.5968 },
      { id: 16, name: "สมุทรสาคร", zipCodeBase: "74", lat: 13.5475, lng: 100.2744 },
      { id: 17, name: "สมุทรสงคราม", zipCodeBase: "75", lat: 13.4098, lng: 100.0022 },
      { id: 18, name: "เพชรบุรี", zipCodeBase: "76", lat: 13.1119, lng: 99.9399 },
      { id: 19, name: "ประจวบคีรีขันธ์", zipCodeBase: "77", lat: 11.8126, lng: 99.7957 },
      { id: 20, name: "ฉะเชิงเทรา", zipCodeBase: "24", lat: 13.6904, lng: 101.0779 },
      { id: 21, name: "ชลบุรี", zipCodeBase: "20", lat: 13.3611, lng: 100.9847 },
      { id: 22, name: "ระยอง", zipCodeBase: "21", lat: 12.6833, lng: 101.2372 },
      { id: 23, name: "จันทบุรี", zipCodeBase: "22", lat: 12.6113, lng: 102.1035 },
      { id: 24, name: "ตราด", zipCodeBase: "23", lat: 12.2428, lng: 102.5175 },
      { id: 25, name: "ปราจีนบุรี", zipCodeBase: "25", lat: 14.0509, lng: 101.3660 },
      { id: 26, name: "สระแก้ว", zipCodeBase: "27", lat: 13.8240, lng: 102.0645 }
    ]
  },
  {
    id: 2,
    name: "ภาคอีสาน",
    provinces: [
      { id: 27, name: "กาฬสินธุ์", zipCodeBase: "46", lat: 16.4315, lng: 103.5059 },
      { id: 28, name: "ขอนแก่น", zipCodeBase: "40", lat: 16.4322, lng: 102.8236 },
      { id: 29, name: "ชัยภูมิ", zipCodeBase: "36", lat: 15.8068, lng: 102.0317 },
      { id: 30, name: "นครพนม", zipCodeBase: "48", lat: 17.4048, lng: 104.7690 },
      { id: 31, name: "นครราชสีมา", zipCodeBase: "30", lat: 14.9799, lng: 102.0977 },
      { id: 32, name: "บึงกาฬ", zipCodeBase: "38", lat: 18.3609, lng: 103.6465 },
      { id: 33, name: "บุรีรัมย์", zipCodeBase: "31", lat: 14.9930, lng: 103.1029 },
      { id: 34, name: "มหาสารคาม", zipCodeBase: "44", lat: 16.1850, lng: 103.3029 },
      { id: 35, name: "มุกดาหาร", zipCodeBase: "49", lat: 16.5420, lng: 104.7208 },
      { id: 36, name: "ยโสธร", zipCodeBase: "35", lat: 15.7921, lng: 104.1452 },
      { id: 37, name: "ร้อยเอ็ด", zipCodeBase: "45", lat: 16.0538, lng: 103.6520 },
      { id: 38, name: "เลย", zipCodeBase: "42", lat: 17.4860, lng: 101.7223 },
      { id: 39, name: "ศรีสะเกษ", zipCodeBase: "33", lat: 15.1186, lng: 104.3220 },
      { id: 40, name: "สกลนคร", zipCodeBase: "47", lat: 17.1545, lng: 104.1348 },
      { id: 41, name: "สุรินทร์", zipCodeBase: "32", lat: 14.8818, lng: 103.4936 },
      { id: 42, name: "หนองคาย", zipCodeBase: "43", lat: 17.8783, lng: 102.7418 },
      { id: 43, name: "หนองบัวลำภู", zipCodeBase: "39", lat: 17.2216, lng: 102.4260 },
      { id: 44, name: "อำนาจเจริญ", zipCodeBase: "37", lat: 15.8657, lng: 104.6265 },
      { id: 45, name: "อุดรธานี", zipCodeBase: "41", lat: 17.4138, lng: 102.7872 },
      { id: 46, name: "อุบลราชธานี", zipCodeBase: "34", lat: 15.2448, lng: 104.8473 }
    ]
  },
  {
    id: 3,
    name: "ภาคเหนือ",
    provinces: [
      { id: 47, name: "เชียงราย", zipCodeBase: "57", lat: 19.9105, lng: 99.8406 },
      { id: 48, name: "เชียงใหม่", zipCodeBase: "50", lat: 18.7883, lng: 98.9853 },
      { id: 49, name: "น่าน", zipCodeBase: "55", lat: 18.7756, lng: 100.7730 },
      { id: 50, name: "พะเยา", zipCodeBase: "56", lat: 19.1664, lng: 99.9003 },
      { id: 51, name: "แพร่", zipCodeBase: "54", lat: 18.1445, lng: 100.1405 },
      { id: 52, name: "แม่ฮ่องสอน", zipCodeBase: "58", lat: 19.3020, lng: 97.9654 },
      { id: 53, name: "ลำปาง", zipCodeBase: "52", lat: 18.2888, lng: 99.5207 },
      { id: 54, name: "ลำพูน", zipCodeBase: "51", lat: 18.5745, lng: 99.0087 },
      { id: 55, name: "อุตรดิตถ์", zipCodeBase: "53", lat: 17.6200, lng: 100.0993 },
      { id: 56, name: "ตาก", zipCodeBase: "63", lat: 16.8840, lng: 99.1258 },
      { id: 57, name: "สุโขทัย", zipCodeBase: "64", lat: 17.0070, lng: 99.8265 },
      { id: 58, name: "กำแพงเพชร", zipCodeBase: "62", lat: 16.4828, lng: 99.5220 },
      { id: 59, name: "พิษณุโลก", zipCodeBase: "65", lat: 16.8211, lng: 100.2659 },
      { id: 60, name: "พิจิตร", zipCodeBase: "66", lat: 16.4429, lng: 100.3487 },
      { id: 61, name: "เพชรบูรณ์", zipCodeBase: "67", lat: 16.4190, lng: 101.1591 },
      { id: 62, name: "นครสวรรค์", zipCodeBase: "60", lat: 15.7047, lng: 100.1372 },
      { id: 63, name: "อุทัยธานี", zipCodeBase: "61", lat: 15.3835, lng: 100.0246 }
    ]
  },
  {
    id: 4,
    name: "ภาคใต้",
    provinces: [
      { id: 64, name: "กระบี่", zipCodeBase: "81", lat: 8.0863, lng: 98.9063 },
      { id: 65, name: "ชุมพร", zipCodeBase: "86", lat: 10.4930, lng: 99.1800 },
      { id: 66, name: "ตรัง", zipCodeBase: "92", lat: 7.5593, lng: 99.6114 },
      { id: 67, name: "นครศรีธรรมราช", zipCodeBase: "80", lat: 8.4304, lng: 99.9631 },
      { id: 68, name: "นราธิวาส", zipCodeBase: "96", lat: 6.4254, lng: 101.8253 },
      { id: 69, name: "ปัตตานี", zipCodeBase: "94", lat: 6.8692, lng: 101.2501 },
      { id: 70, name: "พังงา", zipCodeBase: "82", lat: 8.4509, lng: 98.5254 },
      { id: 71, name: "พัทลุง", zipCodeBase: "93", lat: 7.6167, lng: 100.0742 },
      { id: 72, name: "ภูเก็ต", zipCodeBase: "83", lat: 7.8804, lng: 98.3923 },
      { id: 73, name: "ระนอง", zipCodeBase: "85", lat: 9.9529, lng: 98.6085 },
      { id: 74, name: "สงขลา", zipCodeBase: "90", lat: 7.1898, lng: 100.5951 },
      { id: 75, name: "สตูล", zipCodeBase: "91", lat: 6.6238, lng: 100.0674 },
      { id: 76, name: "สุราษฎร์ธานี", zipCodeBase: "84", lat: 9.1382, lng: 99.3217 },
      { id: 77, name: "ยะลา", zipCodeBase: "95", lat: 6.5410, lng: 101.2803 }
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
