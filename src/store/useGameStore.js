import { create } from 'zustand';
import audioSystem from '../utils/audioSystem';
import eventBus from '../engine/EventBus';

// ── SCHEDULE SYSTEM ──────────────────────────────────────
const SCHEDULE = [
  { start: 7 * 60,  end: 7.5 * 60, event: 'wake',     label: '🌅 Thức dậy',        location: 'main' },
  { start: 7.5*60,  end: 8 * 60,   event: 'commute',   label: '🚶 Đi học',           location: 'main' },
  { start: 8 * 60,  end: 11.5*60,  event: 'class_am',  label: '📚 Học buổi sáng',    location: 'main' },
  { start: 11.5*60, end: 13 * 60,  event: 'lunch',     label: '🍜 Nghỉ trưa',        location: 'main' },
  { start: 13 * 60, end: 16.5*60,  event: 'class_pm',  label: '📚 Học buổi chiều',   location: 'main' },
  { start: 16.5*60, end: 17 * 60,  event: 'commute',   label: '🚶 Về nhà',           location: 'main' },
  { start: 17 * 60, end: 18 * 60,  event: 'free',      label: '🎮 Thời gian rảnh',   location: 'main' },
  { start: 18 * 60, end: 19 * 60,  event: 'dinner',    label: '🍚 Bữa cơm tối',     location: 'main' },
  { start: 19 * 60, end: 22 * 60,  event: 'evening',   label: '📖 Ôn bài tối',       location: 'main' },
  { start: 22 * 60, end: 24 * 60,  event: 'night',     label: '🌙 Đêm khuya',       location: 'main' },
  { start: 0,       end: 2 * 60,   event: 'late_night', label: '⚠️ 2 Giờ Sáng',      location: 'main' },
  { start: 2 * 60,  end: 7 * 60,   event: 'sleep',     label: '💤 Ngủ',              location: 'main' },
];

const getCurrentSchedule = (inGameTime) => {
  const t = inGameTime % (24 * 60);
  return SCHEDULE.find(s => t >= s.start && t < s.end) || SCHEDULE[0];
};

// ── MAPS ─────────────────────────────────────────────────
// 0=floor, 1=wall, 2=desk, 3=door, 4=tree, 5=path, 6=transparent (school), 8=grass
const MAPS = {
  main: (() => {
    const rows = 30;
    const cols = 55;
    const m = Array(rows).fill(null).map(() => Array(cols).fill(8)); // Mặc định là cỏ

    // Viền bản đồ
    for (let c = 0; c < cols; c++) { m[0][c] = 1; m[rows-1][c] = 1; }
    for (let r = 0; r < rows; r++) { m[r][0] = 1; m[r][cols-1] = 1; }

    // --- KHU VỰC NHÀ Ở (Góc trái) ---
    // Ngôi nhà (ngoại thất): cột 1..8, hàng 4..11
    for (let r = 4; r <= 11; r++) {
      for (let c = 1; c <= 8; c++) {
        m[r][c] = 9; // Invisible wall (Tòa nhà)
      }
    }

    // Sân trước nhà
    for (let r = 12; r <= 15; r++) {
      for (let c = 1; c <= 8; c++) {
        m[r][c] = 5; // Đường đất trước nhà
      }
    }

    // --- CON ĐƯỜNG CHÍNH ---
    for (let r = 1; r < rows - 1; r++) {
      m[r][10] = 5; m[r][11] = 5;
    }
    
    // --- KHU VỰC TRƯỜNG HỌC (Góc trên phải) ---
    // Khu vực trường học hiện tại nằm từ cột 21 đến 29, hàng 0 đến 8
    // --- KHU VỰC TRƯỜNG HỌC (Góc trên phải) ---
    // Xây dựng một khuôn viên trường học với hàng rào và sân bê tông (tile 7)
    // Khuôn viên từ cột 16 đến 28, hàng 1 đến 12
    for (let r = 1; r <= 12; r++) {
      for (let c = 16; c <= 28; c++) {
        // Tường rào xung quanh
        if (r === 1 || r === 12 || c === 16 || c === 28) {
          m[r][c] = 1; 
        } else {
          m[r][c] = 7; // Sân bê tông trường học
        }
      }
    }
    
    // Cổng trường (phá tường ở dưới)
    m[12][21] = 5; m[12][22] = 5; m[12][23] = 5;

    // Đường dẫn dọc lên cổng trường
    for (let r = 13; r <= 16; r++) {
      m[r][21] = 5;
      m[r][22] = 5;
      m[r][23] = 5;
    }
    // Đường ngang nối từ đường chính sang
    for (let c = 12; c <= 20; c++) {
      m[15][c] = 5;
      m[16][c] = 5;
    }

    // (Đã xóa Khối va chạm toà nhà trường học theo yêu cầu)

    // --- KHU VỰC THƯ VIỆN (Góc phải) ---
    // Khuôn viên thư viện nhỏ lại
    for (let r = 5; r <= 16; r++) {
      for (let c = 32; c <= 42; c++) {
        // Hàng rào xung quanh
        if (r === 5 || r === 16 || c === 32 || c === 42) {
          m[r][c] = 1; // Tường rào
        } else {
          m[r][c] = 7; // Sân bê tông
        }
      }
    }

    // Cổng vào thư viện
    m[16][36] = 5; m[16][37] = 5; m[16][38] = 5;

    // (Đã xóa Khối va chạm toà nhà thư viện theo yêu cầu)

    // Cây trong sân thư viện
    m[6][33] = 4; m[6][41] = 4; m[15][33] = 4; m[15][41] = 4;

    // Đường nối từ đường chính đến cổng thư viện (ngang)
    for (let c = 12; c <= 35; c++) {
      m[16][c] = 5;
      m[17][c] = 5;
    }

    // Cây rải rác ở bãi cỏ giữa trường và thư viện
    m[6][30] = 4; m[14][30] = 4; m[3][35] = 4; m[4][38] = 4; m[18][40] = 4;

    // --- KHU VỰC BỆNH VIỆN (Góc dưới giữa) ---
    for (let r = 18; r <= 28; r++) {
      for (let c = 14; c <= 28; c++) {
        if (r === 18 || r === 28 || c === 14 || c === 28) {
          m[r][c] = 1; // Hàng rào
        } else {
          m[r][c] = 7; // Sân bê tông
        }
      }
    }
    
    // Cổng bệnh viện ở bên trái, đối diện đường chính
    m[23][14] = 5; m[24][14] = 5;
    
    // Đường nối từ đường chính vào cổng bệnh viện
    m[23][12] = 5; m[23][13] = 5;
    m[24][12] = 5; m[24][13] = 5;

    // (Đã xóa Khối va chạm tòa nhà Bệnh viện theo yêu cầu)

    // Thêm cây xanh cho bệnh viện
    m[19][16] = 4; m[27][16] = 4; m[27][26] = 4;

    return m;
  })(),
  bedroom: (() => {
    const rows = 12;
    const cols = 10;
    const m = Array(rows).fill(null).map(() => Array(cols).fill(0));
    for (let c = 0; c < cols; c++) { m[0][c] = 1; m[rows-1][c] = 1; }
    for (let r = 0; r < rows; r++) { m[r][0] = 1; m[r][cols-1] = 1; }
    m[11][4] = 0; m[11][5] = 0; // Cửa ra vào
    m[1][1] = 2; m[1][2] = 2; m[2][1] = 2; m[2][2] = 2; 
    for(let r=0; r<4; r++) for(let c=3; c<9; c++) m[r][c] = 2; 
    for(let r=6; r<10; r++) for(let c=4; c<8; c++) m[r][c] = 2;
    return m;
  })(),
  home: (() => {
    const rows = 24;
    const cols = 32;
    const m = Array(rows).fill(null).map(() => Array(cols).fill(0));
    // Tường bao quanh ngoài cùng
    for (let c = 0; c < cols; c++) { m[0][c] = 1; m[rows-1][c] = 1; }
    for (let r = 0; r < rows; r++) { m[r][0] = 1; m[r][cols-1] = 1; }
    // Vách ngăn ngang (tách trên dưới) tại hàng 12
    for (let c = 1; c < cols-1; c++) { if (c !== 8 && c !== 9 && c !== 22 && c !== 23) m[12][c] = 1; }
    // Vách ngăn dọc 1 (tách Ngủ và Tắm ở trên) tại cột 16
    for (let r = 1; r < 12; r++) { if (r !== 6 && r !== 7) m[r][16] = 1; }
    // Vách ngăn dọc 2 (tách Bếp và Khách ở dưới) tại cột 14
    for (let r = 13; r < rows-1; r++) { if (r !== 18 && r !== 19) m[r][14] = 1; }
    // Cửa ra ngoài (ở phòng khách, cạnh dưới)
    m[23][22] = 0; m[23][23] = 0; m[23][24] = 0;
    // Bố trí nội thất (chặn di chuyển):
    // Ngủ (Bedroom) dựa theo SVG gốc:
    for (let r=6; r<=9; r++) for (let c=4; c<=7; c++) m[r][c] = 2; // Giường (x=4, y=6, w=4, h=4)
    for (let r=1; r<=3; r++) for (let c=3; c<=8; c++) m[r][c] = 2; // Bàn PC (x=3, y=0 -> hitbox bắt đầu từ r=1, dài c=3..8)
    for (let r=1; r<=2; r++) for (let c=1; c<=2; c++) m[r][c] = 2; // Chậu cây (x=1, y=1, w=2, h=2)
    // Tắm:
    for (let r=2; r<=5; r++) for (let c=25; c<=30; c++) m[r][c] = 2; // Bồn tắm
    // Bếp:
    for (let r=14; r<=18; r++) for (let c=1; c<=3; c++) m[r][c] = 2; // Tủ lạnh
    for (let r=17; r<=19; r++) for (let c=6; c<=9; c++) m[r][c] = 2; // Bàn ăn
    // Khách:
    for (let r=18; r<=20; r++) for (let c=17; c<=20; c++) m[r][c] = 2; // Sofa
    for (let r=15; r<=16; r++) for (let c=23; c<=25; c++) m[r][c] = 2; // Kệ TV
    for (let r=13; r<=13; r++) for (let c=20; c<=21; c++) m[r][c] = 2; // Kệ sách
    for (let r=14; r<=15; r++) for (let c=27; c<=28; c++) m[r][c] = 2; // Cây cảnh lớn
    return m;
  })(),
  classroom: (() => {
    const rows = 30;
    const cols = 40;
    const m = Array(rows).fill(null).map(() => Array(cols).fill(0));
    // Tường bao
    for (let c = 0; c < cols; c++) { m[0][c] = 1; m[rows-1][c] = 1; }
    for (let r = 0; r < rows; r++) { m[r][0] = 1; m[r][cols-1] = 1; }
    
    // Hành lang giữa (Từ cột 18 đến 21)
    // Tường bên trái hành lang
    for(let r = 1; r < rows-1; r++) { m[r][17] = 1; }
    // Tường bên phải hành lang
    for(let r = 1; r < rows-1; r++) { m[r][22] = 1; }
    
    // Chia khu vực bên phải làm 2 phòng (Giáo viên ở trên, Vệ sinh ở dưới)
    for(let c = 23; c < cols-1; c++) { m[16][c] = 1; }

    // Cửa chính ra ngoài
    m[rows-1][19] = 0; m[rows-1][20] = 0;
    
    // Cửa vào Lớp học (bên trái)
    m[25][17] = 0; m[26][17] = 0;
    
    // Cửa vào Phòng Giáo viên (bên phải, phía trên)
    m[14][22] = 0; m[15][22] = 0;
    
    // Cửa vào Nhà vệ sinh (bên phải, phía dưới)
    m[18][22] = 0; m[19][22] = 0;

    // --- NỘI THẤT ---
    
    // 1. LỚP HỌC (c: 1->16, r: 1->28)
    // Bảng đen (Khối va chạm)
    for(let c=4; c<=13; c++) { m[1][c] = 9; }
    // Cây cảnh góc lớp (Khối va chạm)
    m[1][1] = 9; m[1][16] = 9; m[28][1] = 9; m[28][16] = 9;
    // Bục giảng toàn khối (Khối va chạm không cho học sinh bước lên)
    for(let r=2; r<=5; r++) {
      for(let c=4; c<=13; c++) {
        m[r][c] = 9;
      }
    }
    // Bàn học sinh (5 hàng x 2 dãy bàn lớn)
    for(let r=9; r<=25; r+=4) { 
      // Dãy trái
      m[r][3]=9; m[r][4]=9; m[r][5]=9; m[r][6]=9;
      // Dãy phải
      m[r][11]=9; m[r][12]=9; m[r][13]=9; m[r][14]=9;
    }
    
    // 2. PHÒNG GIÁO VIÊN (c: 23->38, r: 1->15)
    // Tủ tài liệu áp tường trên
    for(let c=24; c<=31; c++) { m[1][c] = 9; }
    // Bình nước
    m[1][37] = 9; m[1][38] = 9;
    // Bàn làm việc (2 bàn)
    for(let r=4; r<=6; r++) {
      m[r][24]=9; m[r][25]=9; m[r][26]=9;
      m[r][30]=9; m[r][31]=9; m[r][32]=9;
    }
    // Sofa tiếp khách góc dưới phải
    for(let r=11; r<=13; r++) { for(let c=34; c<=37; c++) { m[r][c] = 9; } }
    // Cây cảnh
    m[13][24] = 9; m[13][25] = 9;
    
    // 3. NHÀ VỆ SINH (c: 23->38, r: 17->28)
    // Tường gương và bồn rửa
    for(let c=26; c<=30; c++) { 
      m[17][c] = 9; // Gương
      m[18][c] = 9; // Lavabo
    }
    // Buồng vệ sinh (Toilet stalls)
    for(let c=24; c<=36; c++) {
       // Xóa khối va chạm ở lưng buồng để nhân vật có thể đi vào trong bồn cầu
       if (c % 2 === 0) {
           m[24][c] = 9; m[25][c] = 9; // Vách ngăn 2 bên
       }
    }
    // Cửa đóng cho một số buồng
    // m[25][27] = 9;
    // m[25][31] = 9;

    return m;
  })(),
  hospital_room: (() => {
    const rows = 24;
    const cols = 32;
    const m = Array(rows).fill(null).map(() => Array(cols).fill(0));
    
    // Tường bao ngoài (Outer Walls)
    for (let c = 0; c < cols; c++) { m[0][c] = 1; m[rows-1][c] = 1; }
    for (let r = 0; r < rows; r++) { m[r][0] = 1; m[r][cols-1] = 1; }
    
    // Cửa chính (Entrance)
    for (let c = 14; c <= 17; c++) m[23][c] = 0;
    
    // Vách tường dọc ngăn cách hành lang bên trái (c=13)
    for (let r = 1; r < 23; r++) m[r][13] = 1;
    // Cửa vào 2 phòng bên trái
    m[9][13] = 0; m[10][13] = 0; // Cửa phòng trên
    m[13][13] = 0; m[14][13] = 0; // Cửa phòng dưới
    
    // Vách ngang chia đôi phòng bên trái (r=11)
    for (let c = 1; c < 13; c++) m[11][c] = 1;
    
    // Quầy lễ tân (Reception L-shape to hơn)
    for (let c = 14; c <= 21; c++) m[18][c] = 2; // Bàn ngang (r=18)
    m[15][21] = 2; m[16][21] = 2; m[17][21] = 2; // Cạnh dọc của L
    
    // Giường bệnh nằm ngang (Scale up: 6x3 blocks)
    const placeHorizontalBed = (startC, startR) => {
      for(let r=startR; r<=startR+2; r++) {
        for(let c=startC; c<=startC+5; c++) {
          m[r][c] = 2;
        }
      }
    };
    
    // Bên Trái (Cấp Cứu)
    placeHorizontalBed(2, 2);
    placeHorizontalBed(2, 7);
    placeHorizontalBed(2, 14);
    placeHorizontalBed(2, 19);
    
    // Bên Phải (Hồi Sức)
    placeHorizontalBed(24, 2);
    placeHorizontalBed(24, 7);
    
    // Tủ Thuốc (Pharmacy Cabinets) bên phải dưới (c=28..30)
    for (let r = 13; r <= 21; r++) {
      m[r][28] = 2; m[r][29] = 2; m[r][30] = 2;
    }
    
    return m;
  })(),
  library_room: (() => {
    const rows = 15;
    const cols = 20;
    const m = Array(rows).fill(null).map(() => Array(cols).fill(0));
    for (let c = 0; c < cols; c++) { m[0][c] = 1; m[rows-1][c] = 1; }
    for (let r = 0; r < rows; r++) { m[r][0] = 1; m[r][cols-1] = 1; }
    m[14][9] = 0; m[14][10] = 0; // Cửa
    for(let c=8; c<=11; c++) { m[2][c] = 2; m[3][c] = 2; } // Bàn
    for(let r=5; r<=11; r+=3) { for(let c=2; c<=12; c+=5) { m[r][c]=2; m[r][c+1]=2; m[r+1][c]=2; m[r+1][c+1]=2; } } // Kệ sách
    return m;
  })()
};

const useGameStore = create((set, get) => ({
  // ── Core Stats ──
  energy: 80,
  maxEnergy: 100,
  stress: 30,
  maxStress: 100,
  connection: 50,
  academics: 70,
  selfEsteem: 100,
  authenticity: 0,

  // ── Therapy State ──
  intrusiveThought: null,

  // ── Schedule & Time ──
  timeLimit: 30,
  inGameTime: 7 * 60, // Start at 7:00 AM
  currentChapter: 0,
  isPlaying: false,

  // ── Audio Settings ──
  soundEnabled: true,
  bgmVolume: 0.25,
  sfxVolume: 0.4,

  // ── Location System ──
  currentLocation: 'home',
  
  // ── Player Position ──
  playerPos: { x: 23, y: 20 },

  // ── NPC System ──
  npcs: [
    { id: 'teacher1', name: 'Cô Giáo', x: 8, y: 3, color: 'bg-indigo-500', locations: ['classroom'], dialogue: 'Các em chú ý nghe giảng nhé! Đừng nói chuyện riêng.', facing: 'down' },
    { id: 'student1', name: 'Nam', x: 4, y: 10, color: 'bg-green-500', locations: ['classroom'], dialogue: 'Trời ơi, bài toán này khó quá đi mất...', facing: 'up', sitting: true },
    { id: 'student2', name: 'Hoa', x: 12, y: 14, color: 'bg-yellow-400', locations: ['classroom'], dialogue: 'Cậu làm xong bài chưa? Cho tớ chép với!', facing: 'up', sitting: true },
    { id: 'student3', name: 'Tuấn', x: 6, y: 22, color: 'bg-red-400', locations: ['classroom'], dialogue: 'Tối nay về chơi game không? Tớ rảnh lắm!', facing: 'up', sitting: true },
    // Bệnh viện
    { id: 'doctor1', name: 'BS. Tâm Lý', x: 18, y: 17, color: 'bg-sky-400', locations: ['hospital_room'], dialogue: 'Chào bạn, dạo này bạn có thấy áp lực quá không? Cứ bình tĩnh ngồi xuống đây nhé.', facing: 'down' },
    { id: 'patient1', name: 'Bệnh Nhân A', x: 5, y: 3, color: 'bg-slate-400', locations: ['hospital_room'], dialogue: '...mình mệt quá...', facing: 'down', sitting: true },
    { id: 'patient2', name: 'Bệnh Nhân B', x: 27, y: 8, color: 'bg-slate-400', locations: ['hospital_room'], dialogue: 'Đầu mình đau như búa bổ, không nghĩ được gì cả.', facing: 'down', sitting: true },
    // Thư viện
    { id: 'librarian1', name: 'Quản thư', x: 10, y: 4, color: 'bg-amber-600', locations: ['library_room'], dialogue: 'Suỵt! Giữ im lặng trong thư viện nhé các em.', facing: 'down' },
    { id: 'lib_student', name: 'Học Sinh', x: 5, y: 8, color: 'bg-emerald-500', locations: ['library_room'], dialogue: 'Sách này hay ghê, ước gì mình có nhiều thời gian rảnh hơn để đọc.', facing: 'up', sitting: true }
  ],
  nearbyNpc: null,
  activeDialogue: null,

  // ── Journal ──
  journalLogs: [],
  isJournalOpen: false,
  openJournal: () => set({ isJournalOpen: true }),
  closeJournal: () => set({ isJournalOpen: false }),

  // ── Cat Chat ──
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('geminiApiKey') || '',
  isLaptopOpen: false,
  openLaptop: () => set({ isLaptopOpen: true }),
  closeLaptop: () => set({ isLaptopOpen: false }),

  isLibraryModalOpen: false,
  openLibraryModal: () => set({ isLibraryModalOpen: true }),
  closeLibraryModal: () => set({ isLibraryModalOpen: false }),

  // --- HỆ THỐNG BỆNH VIỆN ---
  isHospitalModalOpen: false,
  openHospitalModal: () => set({ isHospitalModalOpen: true }),
  closeHospitalModal: () => set({ isHospitalModalOpen: false }),

  // --- FOOD MENU ---
  isFoodMenuOpen: false,
  foodMenuSource: 'fridge',
  openFoodMenu: (source = 'fridge') => set({ isFoodMenuOpen: true, foodMenuSource: source }),
  closeFoodMenu: () => set({ isFoodMenuOpen: false }),
  eatFood: (food) => set(state => ({
    energy: Math.min(100, state.energy + food.energy),
    stressLevel: Math.max(0, state.stressLevel + food.stress),
    isFoodMenuOpen: false
  })),
  attendTherapy: () => set((state) => {
    // 15 mins
    return {
      stress: Math.max(0, state.stress - 20),
      connection: Math.min(100, state.connection + 15),
      inGameTime: state.inGameTime + 15,
      activeAnim: { type: 'therapy', start: performance.now() }
    };
  }),

  // --- HỆ THỐNG TRƯỜNG HỌC ---
  isSchoolModalOpen: false,
  currentPeriod: 1,
  openSchoolModal: () => set({ isSchoolModalOpen: true }),
  closeSchoolModal: () => set({ isSchoolModalOpen: false }),
  attendClass: (subject) => set((state) => {
    let energyCost = 15;
    let stressCost = 10;
    let academicsGain = 15;
    let animType = 'study';

    if (subject === 'Thể dục (PE)') {
      energyCost = 25;
      stressCost = -10; // Giảm stress
      academicsGain = 5;
      animType = 'pe';
    } else if (subject === 'Tin học (Code)') {
      energyCost = 20;
      stressCost = 15;
      academicsGain = 20;
      animType = 'code';
    }

    const updates = get()._addTime(45); // Mỗi tiết 45 phút
    return {
      ...updates,
      energy: Math.max(0, state.energy - energyCost),
      stress: Math.min(100, state.stress + stressCost),
      academics: Math.min(100, state.academics + academicsGain),
      currentPeriod: state.currentPeriod + 1
    };
  }),
  resetSchoolDay: () => set({ currentPeriod: 1 }),

  // --- LỰA CHỌN CỦA NGƯỜI CHƠI ---
  catMessages: [
    { id: 1, sender: 'cat', text: 'Meo~ Hôm nay cậu trông hơi mệt. Có chuyện gì vậy?' }
  ],

  // ── Window Plant ──
  plantHealth: 100,
  plantWatered: false,
  lastWateredDay: 0,

  // ── Schedule helpers ──
  getSchedule: () => getCurrentSchedule(get().inGameTime),
  getMap: () => MAPS['main'],
  getVisibleNpcs: () => {
    const state = get();
    const time = state.inGameTime % 1440;
    const visible = [...state.npcs];
    
    // Ba mẹ xuất hiện sau 19:00 (7 PM)
    if (time >= 19 * 60 || time < 7 * 60) {
      visible.push({ id: 'ba', name: 'Ba', x: 23, y: 15, color: 'bg-gray-400', locations: ['home'], dialogue: 'Học bài đi con, đừng chơi game muộn quá nhé.' });
      visible.push({ id: 'me', name: 'Mẹ', x: 6, y: 15, color: 'bg-pink-400', locations: ['home'], dialogue: 'Xuống ăn cơm đi con, mẹ nấu xong rồi đây.' });
    }
    return visible;
  },

  // ── ACTIONS ──
  
  speakOut: () => set(state => ({
    energy: Math.max(0, state.energy - 15),
    stressLevel: Math.max(0, state.stressLevel - 15)
  })),

  startGame: (mins) => {
    audioSystem.init();
    audioSystem.playClick();
    audioSystem.startBGM();
    set({ 
      isPlaying: true, 
      timeLimit: mins, 
      inGameTime: 7 * 60,
      currentDay: 1,
      currentLocation: 'home',
      playerPos: { x: 23, y: 20, facing: 'up' },
      
      // Trạng thái trị liệu
      intrusiveThought: null
    });
  },

  showIntrusiveThought: (thought) => set({ intrusiveThought: thought }),
  clearIntrusiveThought: () => set({ intrusiveThought: null }),

  endGame: () => {
    audioSystem.playClick();
    set({ 
      isPlaying: false,
      // Xóa sạch hội thoại nhạy cảm khi thoát game để đảm bảo an toàn riêng tư
      catMessages: [
        { id: 1, sender: 'cat', text: 'Meo~ Cậu đã quay lại rồi. Có chuyện gì muốn kể tớ nghe không?' }
      ]
    });
  },

  movePlayer: (dx, dy) => set((state) => {
    const map = MAPS['main'];
    if (!map) return {};
    
    const rows = map.length;
    const cols = map[0].length;
    const newX = Math.max(0, Math.min(cols - 1, state.playerPos.x + dx));
    const newY = Math.max(0, Math.min(rows - 1, state.playerPos.y + dy));
    
    // Determine facing
    let facing = state.playerPos.facing || 'down';
    if (dy < 0) facing = 'up';
    else if (dy > 0) facing = 'down';
    else if (dx < 0) facing = 'left';
    else if (dx > 0) facing = 'right';

    if (newX === state.playerPos.x && newY === state.playerPos.y) {
      return { playerPos: { ...state.playerPos, facing } };
    }

    const tile = map[newY]?.[newX];
    
    // Wall or desk or invisible collision
    if (tile === 1 || tile === 2 || tile === 9) return { playerPos: { ...state.playerPos, facing } };
    
    const energyCost = state.stress > 80 ? 0.5 : 0.1;
    
    // Logic Sinh Vật Xâm Nhập (Bà Tiên Tri) xuất hiện ngẫu nhiên khi di chuyển ở Chương 1+
    let newThought = state.intrusiveThought;
    if (!newThought && state.currentChapter >= 0 && state.stress > 40 && Math.random() < 0.05) {
      newThought = {
        name: 'Bà Tiên Tri',
        text: 'Mày vừa lỡ một đoạn kiến thức nhỏ, chắc chắn sẽ rớt đại học!',
        options: [
          { label: 'Kệ đi, trốn thôi...', type: 'ignore' },
          { label: 'Tao giỏi nhất, không bao giờ rớt!', type: 'fight' },
          { label: 'Thiếu một đoạn không làm hỏng cả bài thi. Tí xem lại.', type: 'cbt' }
        ]
      };
    }

    return {
      playerPos: { x: newX, y: newY, facing },
      energy: Math.max(0, state.energy - energyCost),
      intrusiveThought: newThought
    };
  }),

  // Helper for adding time and handling day transitions
  _addTime: (minutes) => {
    const state = get();
    let newTime = state.inGameTime + minutes;
    let newDay = state.currentDay || 1;
    let newEnergy = state.energy;
    let newPlantWatered = state.plantWatered;
    let newPlantHealth = state.plantHealth;
    
    // If passing midnight (24h = 1440)
    if (newTime >= 1440) {
      newDay += 1;
      newTime = (newTime % 1440) + (7 * 60); // Sleep until 7 AM
      newEnergy = Math.min(100, newEnergy + 50); // Recover energy
      
      // Plant decay check
      if (!newPlantWatered) {
        const decay = state.stress > 60 ? 8 : state.stress > 40 ? 4 : 2;
        newPlantHealth = Math.max(0, newPlantHealth - decay);
      }
      newPlantWatered = false;

      // End of day logic -> Generate Journal and advance chapter
      setTimeout(() => {
        get().generateJournalEntry();
      }, 0);
    }
    
    return {
      inGameTime: newTime,
      currentDay: newDay,
      energy: newEnergy,
      plantWatered: newPlantWatered,
      plantHealth: newPlantHealth
    };
  },

  logDecision: (decision) => set((state) => ({ 
    playerDecisions: [...state.playerDecisions, decision] 
  })),

  generateJournalEntry: () => set((state) => {
    let entryText = `Ngày ${state.currentDay} (Chương ${state.currentChapter}): `;
    
    const hasIgnored = state.playerDecisions.includes('ignored_ha') || state.playerDecisions.includes('ignored_minh') || state.playerDecisions.includes('ignored_tuan');
    const hasSpokenOut = state.playerDecisions.includes('spoken_ha') || state.playerDecisions.includes('spoken_minh') || state.playerDecisions.includes('spoken_tuan');
    const studiedLate = state.playerDecisions.includes('studied_late');
    const wateredPlant = state.playerDecisions.includes('watered_plant');
    
    if (hasSpokenOut) {
      entryText += "Hôm nay mình đã thử nói ra cảm giác thật. Rất khó khăn, nhưng có lẽ tốt hơn là cứ giấu kín. ";
    } else if (hasIgnored) {
      entryText += "Hôm nay mình gặp mọi người nhưng lại chọn im lặng cười trừ. Có gì đó cứ nghẹn lại ở cổ. ";
    } else {
      entryText += "Một ngày bình thường trôi qua, không có gì đặc biệt để nói với ai. ";
    }

    if (studiedLate) {
      entryText += "Đêm qua thức quá khuya để học. Nhìn vào đống sách vở mà đầu óc trống rỗng. ";
    }

    if (wateredPlant) {
      entryText += "Mình vẫn nhớ tưới chậu cây nhỏ. Ít ra vẫn còn việc mình kiểm soát được. ";
    }
    
    if (state.stress > 70) {
      entryText += "Mọi thứ dường như đang quá tải, ngực mình hơi thắt lại. Mình tự hỏi bao giờ chuyện này mới kết thúc.";
    }
    
    const newChapter = state.currentChapter < 5 ? state.currentChapter + 1 : state.currentChapter;
    
    return {
      currentChapter: newChapter,
      journalLogs: [...state.journalLogs, { time: 1439, day: state.currentDay, text: entryText }],
      playerDecisions: [] // Reset decisions for the next day/chapter
    };
  }),
  
  logDecision: (decision) => set((state) => ({
    playerDecisions: [...(state.playerDecisions || []), decision]
  })),

  // Automatic real-time tick (called every second)
  tickTime: () => set((state) => {
    if (!state.isPlaying) return {};
    const inGameMinsPerSec = 1440 / (state.timeLimit * 60);
    return get()._addTime(inGameMinsPerSec);
  }),

  changeLocation: (location, customPos) => set({
    currentLocation: location,
    playerPos: customPos || { x: 10, y: 8, facing: 'down' }
  }),

  speakOut: () => set((state) => {
    if (state.energy < 15) return {};
    return {
      energy: Math.max(0, state.energy - 15),
      authenticity: Math.min(100, state.authenticity + 20),
      stress: Math.max(0, state.stress - 10),
      connection: Math.min(100, state.connection + 5)
    };
  }),

  breathe: () => set((state) => ({
    ...get()._addTime(15),
    stress: Math.max(0, state.stress - 15),
    energy: Math.min(state.maxEnergy, state.energy + 5)
  })),

  eat: () => set((state) => ({
    ...get()._addTime(20),
    energy: Math.min(state.maxEnergy, state.energy + 30),
    stress: Math.max(0, state.stress - 5)
  })),

  shower: () => set((state) => ({
    ...get()._addTime(20),
    stress: Math.max(0, state.stress - 25),
    energy: Math.min(state.maxEnergy, state.energy + 10)
  })),

  startDialogue: (npcId) => set({ activeDialogue: npcId }),
  endDialogue: () => set({ activeDialogue: null }),
  
  addJournalEntry: (text) => set((state) => ({
    journalLogs: [...state.journalLogs, { time: state.inGameTime, day: state.currentDay, text }]
  })),

  addCatMessage: (sender, text) => set((state) => ({
    catMessages: [...state.catMessages, { id: Date.now(), sender, text }]
  })),
  
  setGeminiApiKey: (key) => {
    localStorage.setItem('geminiApiKey', key);
    set({ geminiApiKey: key });
  },

  decreaseStress: (amount) => set((state) => ({
    stress: Math.max(0, state.stress - amount)
  })),

  washFace: () => set(state => {
    return {
      hygiene: Math.min(100, state.hygiene + 20),
      stress: Math.max(0, state.stress - 5),
      energy: Math.min(100, state.energy + 5)
    };
  }),

  useToilet: () => set(state => {
    return {
      hygiene: Math.min(100, state.hygiene + 15),
      energy: Math.min(100, state.energy + 5)
    };
  }),

  openHospitalModal: () => set({ isHospitalModalOpen: true }),

  waterPlant: () => set((state) => {
    if (state.plantWatered) return {};
    return {
      plantWatered: true,
      plantHealth: Math.min(100, state.plantHealth + 15),
      lastWateredDay: state.currentDay,
      stress: Math.max(0, state.stress - 3),
      playerDecisions: [...(state.playerDecisions || []), 'watered_plant']
    };
  }),

  study: () => set((state) => {
    const time = state.inGameTime;
    const schedule = getCurrentSchedule(time);
    const isLate = schedule.event === 'late_night' || schedule.event === 'night';
    
    return {
      ...get()._addTime(30),
      academics: Math.min(100, state.academics + 10),
      energy: Math.max(0, state.energy - 12),
      stress: Math.min(100, state.stress + 8),
      playerDecisions: isLate && !state.playerDecisions.includes('studied_late') 
        ? [...state.playerDecisions, 'studied_late'] 
        : state.playerDecisions
    };
  }),

  socialize: () => set((state) => ({
    ...get()._addTime(20),
    connection: Math.min(100, state.connection + 12),
    energy: Math.max(0, state.energy - 8),
    stress: Math.max(0, state.stress - 5)
  })),

  rest: () => set((state) => ({
    ...get()._addTime(30),
    energy: Math.min(state.maxEnergy, state.energy + 20),
    stress: Math.max(0, state.stress - 5)
  })),

  advanceTime: (minutes) => set((state) => {
    const updates = get()._addTime(minutes);
    const schedule = getCurrentSchedule(updates.inGameTime);
    return {
      ...updates,
      currentLocation: schedule.location,
      playerPos: { x: 10, y: 8, facing: 'down' }
    };
  }),

  // Next day manual trigger
  nextDay: () => set((state) => {
    const minsToMidnight = 1440 - state.inGameTime;
    return get()._addTime(minsToMidnight > 0 ? minsToMidnight : 0);
  }),

  // ── AUDIO ACTIONS ──
  toggleSound: () => set(state => {
    const newState = !state.soundEnabled;
    audioSystem.setMute(!newState);
    return { soundEnabled: newState };
  }),
  setBgmVolume: (vol) => {
    audioSystem.setBgmVolume(vol);
    set({ bgmVolume: vol });
  },
  setSfxVolume: (vol) => {
    audioSystem.setSfxVolume(vol);
    set({ sfxVolume: vol });
  },
  nextTrack: () => {
    const newIndex = audioSystem.nextTrack();
    set({ currentTrackIndex: newIndex });
  },
  prevTrack: () => {
    const newIndex = audioSystem.prevTrack();
    set({ currentTrackIndex: newIndex });
  }
}));

useGameStore.subscribe((state, prevState) => {
  if (
    state.stress !== prevState.stress ||
    state.energy !== prevState.energy ||
    state.selfEsteem !== prevState.selfEsteem
  ) {
    eventBus.emit('STATS_CHANGED', {
      stress: state.stress,
      energy: state.energy,
      selfEsteem: state.selfEsteem
    });
  }
  
  if (state.currentDay !== prevState.currentDay && prevState.currentDay !== undefined) {
    // A rudimentary check. If they sleep early, we can fire an event.
    // For now, let's assume if energy is > 50 they slept ok.
    eventBus.emit('DAY_ENDED', { sleptBeforeMidnight: true });
  }
});

export { SCHEDULE, getCurrentSchedule, MAPS };
export default useGameStore;
