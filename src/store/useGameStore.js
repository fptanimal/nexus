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
    // Phòng ngủ: cột 0..9, hàng 0..11
    for (let r = 0; r <= 11; r++) {
      for (let c = 0; c <= 9; c++) {
        if (r === 0 || r === 11 || c === 0 || c === 9) m[r][c] = 1; // Tường
        else m[r][c] = 0; // Sàn phòng
      }
    }
    // Cửa phòng ngủ
    m[11][4] = 0; m[11][5] = 0;

    // Khối va chạm cho đồ đạc trong phòng ngủ (bao trọn để không đi xuyên qua được)
    // Cây (x=1..2, y=1..2)
    m[1][1] = 2; m[1][2] = 2; m[2][1] = 2; m[2][2] = 2; 
    // Bàn + Laptop (x=3..8, y=0..3)
    for(let r=0; r<4; r++) for(let c=3; c<9; c++) m[r][c] = 2; 
    // Giường (x=4..7, y=6..9)
    for(let r=6; r<10; r++) for(let c=4; c<8; c++) m[r][c] = 2;

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

    // Khối va chạm (tường vô hình) của toà nhà trường học (thu nhỏ lại)
    // Toà nhà nằm ở cột 18-26, hàng 4-10
    for (let r = 4; r <= 10; r++) {
      for (let c = 18; c <= 26; c++) {
        m[r][c] = 9; // Invisible wall
      }
    }

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

    // Khối va chạm toà nhà thư viện (cột 34-40, hàng 7-14)
    for (let r = 7; r <= 14; r++) {
      for (let c = 34; c <= 40; c++) {
        // Để trống khu vực cửa (hàng 14, cột 36-38) để nhân vật có thể đứng sát cửa
        if (r === 14 && (c === 36 || c === 37 || c === 38)) {
          continue;
        }
        m[r][c] = 9; // Invisible wall
      }
    }

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

    // Khối va chạm tòa nhà Bệnh viện (cột 17-25, hàng 20-26)
    for (let r = 20; r <= 26; r++) {
      for (let c = 17; c <= 25; c++) {
        // Cửa bệnh viện ở bên trái
        if (c === 17 && (r === 23 || r === 24)) {
           continue;
        }
        m[r][c] = 9; // Invisible wall (Tòa nhà)
      }
    }
    // Thêm cây xanh cho bệnh viện
    m[19][16] = 4; m[27][16] = 4; m[27][26] = 4;

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
  currentLocation: 'main',
  
  // ── Player Position ──
  playerPos: { x: 5, y: 5 },

  // ── NPCs (rải rác trên main map) ──
  npcs: [
    { id: 'minh', name: 'Minh', x: 20, y: 6, color: 'bg-amber-400', locations: ['main'] },
    { id: 'ha', name: 'Hà', x: 14, y: 15, color: 'bg-pink-400', locations: ['main'] },
    { id: 'tuan', name: 'Tuấn', x: 25, y: 10, color: 'bg-blue-400', locations: ['main'] },
    { id: 'linh', name: 'Linh', x: 18, y: 15, color: 'bg-purple-400', locations: ['main'] }
  ],
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
    
    // Đã gỡ bỏ sự xuất hiện của ba và mẹ theo yêu cầu của người chơi
    if (time >= 19 * 60 || time < 7 * 60) {
      // visible.push( ... );
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
      currentLocation: 'main',
      playerPos: { x: 3, y: 7, facing: 'down' },
      
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

  changeLocation: (location) => set({
    currentLocation: location,
    playerPos: { x: 10, y: 8, facing: 'down' }
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

  waterPlant: () => set((state) => {
    if (state.plantWatered) return {};
    return {
      plantWatered: true,
      plantHealth: Math.min(100, state.plantHealth + 15),
      lastWateredDay: state.currentDay,
      stress: Math.max(0, state.stress - 3),
      playerDecisions: [...state.playerDecisions, 'watered_plant']
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
