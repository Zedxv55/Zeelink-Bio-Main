import { Region, Question } from './types';

export const FLOATING_PHRASES = [
  // Original
  "สวัสดีครับ/ค่ะ",
  "คนไทย",
  "ใส่ใจ",
  "อาหมวย",
  "อาหวัง",
  "ช้างกูอยู่ไหน",
  "คนไทย=อิสระ",
  "โตมาที่อยากเป็น โตมาซิกูรู",
  "อ่านทำไม",
  "อ่านแล้วรวย",
  "ซวยแล้วมึง",
  "เลือกอะไรระหว่างเขากับเขา",
  "สกิวคุยไม่ได้ครบเต็ม100",
  "หาสาระหรอ ไม่มี",
  // New Quirky Words
  "ไปไหนมา กินข้าวยัง",
  "แล้วแต่ใจมึง",
  "เดี๋ยวก็รู้เอง",
  "ทำไมต้องรู้ด้วย",
  "อย่าถามมาก ไปก่อน",
  "มึงจะเอายังไง",
  "ช่างมันเถอะ",
  "ไม่รู้ถามกู",
  "เจอกันที่นั่น",
  "Random ชีวิต"
];

// Mock AI Moderation List
export const BANNED_WORDS = [
  "กู", "มึง", "สัส", "เหี้ย", "ควย", "เย็ด", "fuck", "shit", "เลว", "ชั่ว"
];

// Helper to create mock districts
const createMockDistricts = (provinceName: string, zipStart: string) => [
  {
    id: 1,
    name: `เมือง${provinceName}`,
    subDistricts: [
      { id: 1, name: "ตำบลในเมือง", zip: `${zipStart}000` },
      { id: 2, name: "ตำบลนอกเมือง", zip: `${zipStart}001` }
    ]
  },
  {
    id: 2,
    name: "อำเภอเมืองรอง",
    subDistricts: [
      { id: 3, name: "ตำบลสุขใจ", zip: `${zipStart}100` }
    ]
  }
];

export const THAI_REGIONS: Region[] = [
  {
    id: 1,
    name: "ภาคเหนือ",
    provinces: [
      { id: 1, name: "เชียงใหม่", lat: 18.7932, lng: 98.9867, districts: createMockDistricts("เชียงใหม่", "50") },
      { id: 2, name: "เชียงราย", lat: 19.9056, lng: 99.8296, districts: createMockDistricts("เชียงราย", "57") },
      { id: 3, name: "ลำปาง", lat: 18.2888, lng: 99.4928, districts: createMockDistricts("ลำปาง", "52") },
      { id: 4, name: "ลำพูน", lat: 18.5748, lng: 99.0087, districts: createMockDistricts("ลำพูน", "51") },
      { id: 5, name: "แม่ฮ่องสอน", lat: 19.3020, lng: 97.9654, districts: createMockDistricts("แม่ฮ่องสอน", "58") },
      { id: 6, name: "น่าน", lat: 18.7769, lng: 100.7782, districts: createMockDistricts("น่าน", "55") },
      { id: 7, name: "พะเยา", lat: 19.1649, lng: 99.8972, districts: createMockDistricts("พะเยา", "56") },
      { id: 8, name: "แพร่", lat: 18.1426, lng: 100.1408, districts: createMockDistricts("แพร่", "54") },
      { id: 9, name: "อุตรดิตถ์", lat: 17.6201, lng: 100.0993, districts: createMockDistricts("อุตรดิตถ์", "53") },
    ]
  },
  {
    id: 2,
    name: "ภาคกลาง",
    provinces: [
      { id: 21, name: "กรุงเทพมหานคร", lat: 13.7563, lng: 100.5018, districts: createMockDistricts("", "10") },
      { id: 22, name: "กำแพงเพชร", lat: 16.4828, lng: 99.5227, districts: createMockDistricts("กำแพงเพชร", "62") },
      { id: 23, name: "ชัยนาท", lat: 15.1852, lng: 100.1250, districts: createMockDistricts("ชัยนาท", "17") },
      { id: 24, name: "นครนายก", lat: 14.2069, lng: 101.2130, districts: createMockDistricts("นครนายก", "26") },
      { id: 25, name: "นครปฐม", lat: 13.8140, lng: 100.0399, districts: createMockDistricts("นครปฐม", "73") },
      { id: 26, name: "นครสวรรค์", lat: 15.6987, lng: 100.1197, districts: createMockDistricts("นครสวรรค์", "60") },
      { id: 27, name: "นนทบุรี", lat: 13.8621, lng: 100.5140, districts: createMockDistricts("นนทบุรี", "11") },
      { id: 28, name: "ปทุมธานี", lat: 14.0135, lng: 100.5305, districts: createMockDistricts("ปทุมธานี", "12") },
      { id: 29, name: "พระนครศรีอยุธยา", lat: 14.3532, lng: 100.5684, districts: createMockDistricts("พระนครศรีอยุธยา", "13") },
      { id: 30, name: "พิจิตร", lat: 16.4428, lng: 100.3493, districts: createMockDistricts("พิจิตร", "66") },
      { id: 31, name: "พิษณุโลก", lat: 16.8211, lng: 100.2659, districts: createMockDistricts("พิษณุโลก", "65") },
      { id: 32, name: "เพชรบูรณ์", lat: 16.4190, lng: 101.1567, districts: createMockDistricts("เพชรบูรณ์", "67") },
      { id: 33, name: "ลพบุรี", lat: 14.7995, lng: 100.6533, districts: createMockDistricts("ลพบุรี", "15") },
      { id: 34, name: "สมุทรปราการ", lat: 13.5991, lng: 100.5967, districts: createMockDistricts("สมุทรปราการ", "10") },
      { id: 35, name: "สมุทรสงคราม", lat: 13.4098, lng: 100.0023, districts: createMockDistricts("สมุทรสงคราม", "75") },
      { id: 36, name: "สมุทรสาคร", lat: 13.5475, lng: 100.2736, districts: createMockDistricts("สมุทรสาคร", "74") },
      { id: 37, name: "สิงห์บุรี", lat: 14.8893, lng: 100.4019, districts: createMockDistricts("สิงห์บุรี", "16") },
      { id: 38, name: "สุโขทัย", lat: 17.0056, lng: 99.8264, districts: createMockDistricts("สุโขทัย", "64") },
      { id: 39, name: "สุพรรณบุรี", lat: 14.4745, lng: 100.1177, districts: createMockDistricts("สุพรรณบุรี", "72") },
      { id: 40, name: "สระบุรี", lat: 14.5289, lng: 100.9108, districts: createMockDistricts("สระบุรี", "18") },
      { id: 41, name: "อ่างทอง", lat: 14.5896, lng: 100.4550, districts: createMockDistricts("อ่างทอง", "14") },
      { id: 42, name: "อุทัยธานี", lat: 15.3835, lng: 100.0246, districts: createMockDistricts("อุทัยธานี", "61") }
    ]
  },
  {
    id: 3,
    name: "ภาคอีสาน",
    provinces: [
      { id: 50, name: "กาฬสินธุ์", lat: 16.4322, lng: 103.5061, districts: createMockDistricts("กาฬสินธุ์", "46") },
      { id: 51, name: "ขอนแก่น", lat: 16.4322, lng: 102.8236, districts: createMockDistricts("ขอนแก่น", "40") },
      { id: 52, name: "ชัยภูมิ", lat: 15.8063, lng: 102.0315, districts: createMockDistricts("ชัยภูมิ", "36") },
      { id: 53, name: "นครพนม", lat: 17.3947, lng: 104.7695, districts: createMockDistricts("นครพนม", "48") },
      { id: 54, name: "นครราชสีมา", lat: 14.9759, lng: 102.1000, districts: createMockDistricts("นครราชสีมา", "30") },
      { id: 55, name: "บึงกาฬ", lat: 18.3605, lng: 103.6465, districts: createMockDistricts("บึงกาฬ", "38") },
      { id: 56, name: "บุรีรัมย์", lat: 14.9930, lng: 103.1029, districts: createMockDistricts("บุรีรัมย์", "31") },
      { id: 57, name: "มหาสารคาม", lat: 16.1852, lng: 103.3015, districts: createMockDistricts("มหาสารคาม", "44") },
      { id: 58, name: "มุกดาหาร", lat: 16.5453, lng: 104.7032, districts: createMockDistricts("มุกดาหาร", "49") },
      { id: 59, name: "ยโสธร", lat: 15.7925, lng: 104.1451, districts: createMockDistricts("ยโสธร", "35") },
      { id: 60, name: "ร้อยเอ็ด", lat: 16.0537, lng: 103.6521, districts: createMockDistricts("ร้อยเอ็ด", "45") },
      { id: 61, name: "เลย", lat: 17.4860, lng: 101.7223, districts: createMockDistricts("เลย", "42") },
      { id: 62, name: "ศรีสะเกษ", lat: 15.1186, lng: 104.3220, districts: createMockDistricts("ศรีสะเกษ", "33") },
      { id: 63, name: "สกลนคร", lat: 17.1663, lng: 104.1486, districts: createMockDistricts("สกลนคร", "47") },
      { id: 64, name: "สุรินทร์", lat: 14.8824, lng: 103.4939, districts: createMockDistricts("สุรินทร์", "32") },
      { id: 65, name: "หนองคาย", lat: 17.8785, lng: 102.7413, districts: createMockDistricts("หนองคาย", "43") },
      { id: 66, name: "หนองบัวลำภู", lat: 17.2039, lng: 102.4409, districts: createMockDistricts("หนองบัวลำภู", "39") },
      { id: 67, name: "อุดรธานี", lat: 17.4138, lng: 102.7872, districts: createMockDistricts("อุดรธานี", "41") },
      { id: 68, name: "อุบลราชธานี", lat: 15.2448, lng: 104.8473, districts: createMockDistricts("อุบลราชธานี", "34") },
      { id: 69, name: "อำนาจเจริญ", lat: 15.8587, lng: 104.6258, districts: createMockDistricts("อำนาจเจริญ", "37") },
    ]
  },
  {
    id: 4,
    name: "ภาคใต้",
    provinces: [
      { id: 70, name: "กระบี่", lat: 8.0855, lng: 98.9063, districts: createMockDistricts("กระบี่", "81") },
      { id: 71, name: "ชุมพร", lat: 10.4930, lng: 99.1800, districts: createMockDistricts("ชุมพร", "86") },
      { id: 72, name: "ตรัง", lat: 7.5645, lng: 99.6239, districts: createMockDistricts("ตรัง", "92") },
      { id: 73, name: "นครศรีธรรมราช", lat: 8.4325, lng: 99.9631, districts: createMockDistricts("นครศรีธรรมราช", "80") },
      { id: 74, name: "นราธิวาส", lat: 6.4255, lng: 101.8253, districts: createMockDistricts("นราธิวาส", "96") },
      { id: 75, name: "ปัตตานี", lat: 6.8696, lng: 101.2502, districts: createMockDistricts("ปัตตานี", "94") },
      { id: 76, name: "พังงา", lat: 8.4501, lng: 98.5255, districts: createMockDistricts("พังงา", "82") },
      { id: 77, name: "พัทลุง", lat: 7.6166, lng: 100.0740, districts: createMockDistricts("พัทลุง", "93") },
      { id: 78, name: "ภูเก็ต", lat: 7.8804, lng: 98.3923, districts: createMockDistricts("ภูเก็ต", "83") },
      { id: 79, name: "ยะลา", lat: 6.5411, lng: 101.2804, districts: createMockDistricts("ยะลา", "95") },
      { id: 80, name: "ระนอง", lat: 9.9529, lng: 98.6085, districts: createMockDistricts("ระนอง", "85") },
      { id: 81, name: "สงขลา", lat: 7.1756, lng: 100.6143, districts: createMockDistricts("สงขลา", "90") },
      { id: 82, name: "สตูล", lat: 6.6238, lng: 100.0674, districts: createMockDistricts("สตูล", "91") },
      { id: 83, name: "สุราษฎร์ธานี", lat: 9.1482, lng: 99.3300, districts: createMockDistricts("สุราษฎร์ธานี", "84") },
    ]
  }
];

export const AVAILABLE_TAGS = [
  "Freelancer", "Artist", "Developer", "Foodie", "Traveler", 
  "Photographer", "Student", "Content Creator", "Musician", "Writer", "อื่นๆ"
];

export const LAYOUT_THEMES = [
  { name: 'Minimal', value: 'minimal', bg: 'bg-white', text: 'text-gray-900', btn: 'bg-black text-white' },
  { name: 'Modern', value: 'modern', bg: 'bg-gray-900', text: 'text-white', btn: 'bg-blue-600 text-white' },
  { name: 'Creative', value: 'creative', bg: 'bg-gradient-to-tr from-pink-300 to-blue-300', text: 'text-gray-900', btn: 'bg-white/80 text-black backdrop-blur' }
];

export const AVAILABLE_FONTS = [
  { name: 'Prompt', value: 'Prompt' },
  { name: 'Kanit', value: 'Kanit' },
  { name: 'Sarabun', value: 'Sarabun' },
  { name: 'Mitr', value: 'Mitr' }
];

export const INITIAL_QUESTIONS: Question[] = [
  { id: '1', userId: 'mock1', username: 'somchai', text: 'อยากให้ Zeelink เพิ่มฟีเจอร์อะไรมากที่สุดครับ?', votes: 1254, createdAt: new Date().toISOString(), votedUserIds: [], status: 'approved' },
  { id: '2', userId: 'mock2', username: 'admin', text: 'ร้านกาแฟในเชียงใหม่ร้านไหนดี?', votes: 856, createdAt: new Date(Date.now() - 86400000).toISOString(), votedUserIds: [], status: 'approved' },
  { id: '3', userId: 'mock3', username: 'user99', text: 'ใครทำงานสาย Tech บ้างครับ เงินเดือนเท่าไหร่?', votes: 500, createdAt: new Date(Date.now() - 172800000).toISOString(), votedUserIds: [], status: 'approved' }
];
