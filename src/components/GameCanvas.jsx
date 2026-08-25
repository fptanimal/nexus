import React, { useEffect, useRef, useState } from 'react';
import useGameStore, { MAPS } from '../store/useGameStore';
import audioSystem from '../utils/audioSystem';
import roomLayout from '../config/RoomLayout.js';
import SchoolOverlay from './SchoolOverlay';
import LibraryBuilding from './LibraryBuilding';
import HospitalBuilding from './HospitalBuilding';
import HouseBuilding from './HouseBuilding';

const rawTilesetImg = new Image();
const tilesetImg = document.createElement('canvas');
let tilesetReady = false;

rawTilesetImg.onload = () => {
  tilesetImg.width = rawTilesetImg.width;
  tilesetImg.height = rawTilesetImg.height;
  const ctx = tilesetImg.getContext('2d');
  ctx.drawImage(rawTilesetImg, 0, 0);

  const imgData = ctx.getImageData(0, 0, tilesetImg.width, tilesetImg.height);
  const data = imgData.data;

  // Sample the exact background color from the absolute top-left of the image (0,0)
  // Piskel usually exports solid background there if not transparent.
  const bgR = data[0], bgG = data[1], bgB = data[2], bgA = data[3];

  if (bgA > 0) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      // Strictly remove ONLY the exact background color (tolerance 2)
      if (Math.abs(r - bgR) <= 2 && Math.abs(g - bgG) <= 2 && Math.abs(b - bgB) <= 2) {
        data[i + 3] = 0;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  tilesetReady = true;
};
rawTilesetImg.src = '/tileset.png';

// ── CUSTOM PIXEL ART SPRITES (DRAWN PIXEL BY PIXEL) ──
const SPRITES = {
  playerDown: [
    "....2222222.....",
    "...222222222....",
    "..22222222222...",
    "..22111111122...",
    ".2221101101222..",
    ".2221111111222..",
    ".22.1111111.22..",
    "....2222222.....",
    "...222222222....",
    "..22212221222...",
    ".2222122212222..",
    ".222.22222.222..",
    "222..22.22..222.",
    "22...22.22...22.",
    "....222.222.....",
    "................"
  ],
  playerDownWalk1: [
    "....2222222.....",
    "...222222222....",
    "..22222222222...",
    "..22111111122...",
    ".2221101101222..",
    ".2221111111222..",
    ".22.1111111.22..",
    "....2222222.....",
    "...222222222....",
    "..22212221222...",
    ".2222122212222..",
    ".222.22222.222..",
    "222..22.........",
    "22...22.222.....",
    "....222.........",
    "................"
  ],
  playerDownWalk2: [
    "....2222222.....",
    "...222222222....",
    "..22222222222...",
    "..22111111122...",
    ".2221101101222..",
    ".2221111111222..",
    ".22.1111111.22..",
    "....2222222.....",
    "...222222222....",
    "..22212221222...",
    ".2222122212222..",
    ".222.22222.222..",
    "222.......22....",
    "22..222...22....",
    "..........222...",
    "................"
  ],
  playerLeft: [
    ".....222222.....",
    "....22222222....",
    "...2222222222...",
    "...2221111122...",
    "..22221011122...",
    "..22221111122...",
    "...22211111.2...",
    "....2222222.....",
    "...222222222....",
    "..2222222122....",
    ".22222222122....",
    ".22222222222....",
    ".2222.22.22.....",
    "222...22.22.....",
    "22...222.22.....",
    "................"
  ],
  playerLeftWalk1: [
    ".....222222.....",
    "....22222222....",
    "...2222222222...",
    "...2221111122...",
    "..22221011122...",
    "..22221111122...",
    "...22211111.2...",
    "....2222222.....",
    "...222222222....",
    "..2222222122....",
    ".22222222122....",
    ".22222222222....",
    ".2222.22........",
    "222...22.22.....",
    "22...222........",
    "................"
  ],
  playerLeftWalk2: [
    ".....222222.....",
    "....22222222....",
    "...2222222222...",
    "...2221111122...",
    "..22221011122...",
    "..22221111122...",
    "...22211111.2...",
    "....2222222.....",
    "...222222222....",
    "..2222222122....",
    ".22222222122....",
    ".22222222222....",
    ".2222....22.....",
    "222..22..22.....",
    "22.......22.....",
    "................"
  ],
  playerRight: [
    ".....222222.....",
    "....22222222....",
    "...2222222222...",
    "...2211111222...",
    "...22111012222..",
    "...22111112222..",
    "...2.11111222...",
    ".....2222222....",
    "....222222222...",
    "....2212222222..",
    "....22122222222.",
    "....22222222222.",
    ".....22.22.2222.",
    ".....22.22...222",
    ".....22.222...22",
    "................"
  ],
  playerRightWalk1: [
    ".....222222.....",
    "....22222222....",
    "...2222222222...",
    "...2211111222...",
    "...22111012222..",
    "...22111112222..",
    "...2.11111222...",
    ".....2222222....",
    "....222222222...",
    "....2212222222..",
    "....22122222222.",
    "....22222222222.",
    "........22.2222.",
    ".....22.22...222",
    "........222...22",
    "................"
  ],
  playerRightWalk2: [
    ".....222222.....",
    "....22222222....",
    "...2222222222...",
    "...2211111222...",
    "...22111012222..",
    "...22111112222..",
    "...2.11111222...",
    ".....2222222....",
    "....222222222...",
    "....2212222222..",
    "....22122222222.",
    "....22222222222.",
    ".....22....2222.",
    ".....22..22..222",
    ".....22.......22",
    "................"
  ],
  playerUp: [
    "....2222222.....",
    "...222222222....",
    "..22222222222...",
    "..22222222222...",
    ".2222222222222..",
    ".2222222222222..",
    ".22.2222222.22..",
    "....2222222.....",
    "...222222222....",
    "..22222222222...",
    ".2222222222222..",
    ".222.22222.222..",
    "222..22.22..222.",
    "22...22.22...22.",
    "....222.222.....",
    "................"
  ],
  playerUpWalk1: [
    "....2222222.....",
    "...222222222....",
    "..22222222222...",
    "..22222222222...",
    ".2222222222222..",
    ".2222222222222..",
    ".22.2222222.22..",
    "....2222222.....",
    "...222222222....",
    "..22222222222...",
    ".2222222222222..",
    ".222.22222.222..",
    "222..22.........",
    "22...22.222.....",
    "....222.........",
    "................"
  ],
  playerUpWalk2: [
    "....2222222.....",
    "...222222222....",
    "..22222222222...",
    "..22222222222...",
    ".2222222222222..",
    ".2222222222222..",
    ".22.2222222.22..",
    "....2222222.....",
    "...222222222....",
    "..22222222222...",
    ".2222222222222..",
    ".222.22222.222..",
    "222.......22....",
    "22..222...22....",
    "..........222...",
    "................"
  ],
  floor: [
    "wwwwdwwwwwwwwdww",
    "wwwwdwwwwwwwwdww",
    "wwwwdwwwwwwwwdww",
    "wwwwdwwwwwwwwdww",
    "dddddddddddddddd",
    "dwwwwwwwwdwwwwww",
    "dwwwwwwwwdwwwwww",
    "dwwwwwwwwdwwwwww",
    "dwwwwwwwwdwwwwww",
    "dddddddddddddddd",
    "wwwwdwwwwwwwwdww",
    "wwwwdwwwwwwwwdww",
    "wwwwdwwwwwwwwdww",
    "wwwwdwwwwwwwwdww",
    "dddddddddddddddd",
    "dwwwwwwwwdwwwwww"
  ],
  wall: [
    "BBBBBBBBBBBBBBBB",
    "BxxxxxxxxxxxxxxB",
    "BxxxxxxxxxxxxxxB",
    "BxxxxxxxxxxxxxxB",
    "BxxxxxxxxxxxxxxB",
    "BxxxxxxxxxxxxxxB",
    "BxxxxxxxxxxxxxxB",
    "BxxxxxxxxxxxxxxB",
    "BxxxxxxxxxxxxxxB",
    "BxxxxxxxxxxxxxxB",
    "BxxxxxxxxxxxxxxB",
    "BxxxxxxxxxxxxxxB",
    "BxxxxxxxxxxxxxxB",
    "BxxxxxxxxxxxxxxB",
    "BxxxxxxxxxxxxxxB",
    "BBBBBBBBBBBBBBBB"
  ],
  bed: [
    "pppppppppppppppp",
    "pwwwwwwwwwwwwwwp",
    "pwMMMMMMMMMMMMwp",
    "pwMMMMMMMMMMMMwp",
    "pwMMMMMMMMMMMMwp",
    "pwMMMMMMMMMMMMwp",
    "pwQQQQQQQQQQQQwp",
    "pwQQQQQQQQQQQQwp",
    "pwQQQQQQQQQQQQwp",
    "pwQQQQQQQQQQQQwp",
    "pwQQQQQQQQQQQQwp",
    "pwQQQQQQQQQQQQwp",
    "pwQQQQQQQQQQQQwp",
    "pwQQQQQQQQQQQQwp",
    "pwwwwwwwwwwwwwwp",
    "pppppppppppppppp"
  ],
  desk: [
    "................",
    "................",
    "................",
    "bbbbbbbbbbbbbbbb",
    "bbbbbbbbbbbbbbbb",
    "bbmmmmmmmmmmbbbb",
    "bbmmmmmmmmmmbbbb",
    "bbmmmmmmmmmmbbbb",
    "bbbbbbkkkkbbbbbb",
    "bbbbbbbbbbbbbbbb",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
  ]
};

const COLOR_MAP = {
  '.': 'transparent',
  'w': '#e8d5b5', // therapeutic light oak
  'd': '#d4b895', // therapeutic dark oak shade
  'B': '#e0d5c1', // wall border (soft cream)
  'x': '#f5ebd9', // wall fill (therapeutic cream)
  'p': '#5c4033', // bed wood
  'M': '#ecf0f1', // pillow
  'Q': '#3498db', // blanket
  'b': '#d35400', // desk
  'm': '#bdc3c7', // monitor
  'k': '#7f8c8d', // keyboard
  '1': '#fce3d0', // pale skin
  '2': '#151515', // black hair/coat
  'c': '#2d2d2d', // dark coat highlight
  '3': '#9b59b6', // purple shirt
  '4': '#2980b9', // blue pants
  '5': '#34495e', // shoes
  '0': '#000000', // eye
};

const preRenderedSprites = {};

function initSprites() {
  for (const [key, data] of Object.entries(SPRITES)) {
    const height = data.length;
    const width = data[0].length;
    const canvas = document.createElement('canvas');
    const scale = 2; // scale factor
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const char = data[y][x];
        const color = COLOR_MAP[char];
        if (color && color !== 'transparent') {
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
    preRenderedSprites[key] = canvas;
  }
}
initSprites();

const LOCATION_LABELS = {
  classroom: { icon: '🏫', name: 'Lớp học' },
  courtyard: { icon: '🌳', name: 'Sân trường' },
  home: { icon: '🏠', name: 'Nhà' },
  street: { icon: '🚶', name: 'Đường phố' },
};

const tintCanvas = document.createElement('canvas');
const tintCtx = tintCanvas.getContext('2d');

const drawPlayerSprite = (ctx, img, w, h, x, y, isStressed) => {
  if (!img || !img.complete || img.width === 0) return;

  // Bóng râm dưới chân nhân vật (Ground shadow)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  if (ctx.ellipse) {
    ctx.ellipse(x + w / 2, y + h - 2, w / 2.5, 5, 0, 0, Math.PI * 2);
  } else {
    ctx.arc(x + w / 2, y + h - 2, w / 2.5, 0, Math.PI * 2); // Fallback
  }
  ctx.fill();

  if (isStressed) {
    tintCanvas.width = w;
    tintCanvas.height = h;
    tintCtx.clearRect(0, 0, w, h);
    tintCtx.drawImage(img, 0, 0, w, h);
    tintCtx.globalCompositeOperation = 'source-atop';

    // Đỏ tím bừng bừng vì stress
    const flash = Math.sin(Date.now() / 150) * 0.2 + 0.3; // 0.1 to 0.5
    tintCtx.fillStyle = `rgba(185, 28, 28, ${flash})`;
    tintCtx.fillRect(0, 0, w, h);
    tintCtx.globalCompositeOperation = 'source-over'; // reset

    ctx.drawImage(tintCanvas, x, y);

    // Thêm ký hiệu bực tức (💢)
    ctx.font = '14px Arial';
    ctx.fillText('💢', x + w - 8, y + 4);

    // Quầng thâm / mệt mỏi
    ctx.fillStyle = 'rgba(75, 85, 99, 0.8)';
    ctx.fillRect(x + w / 2 - 6, y + 16, 3, 4);
    ctx.fillRect(x + w / 2 + 3, y + 16, 3, 4);
  } else {
    ctx.drawImage(img, x, y, w, h);
  }
};

export default function GameCanvas() {
  const canvasRef = useRef(null);
  const promptRef = useRef(null);
  const studyPromptRef = useRef(null);
  const mapWrapperRef = useRef(null);
  const activeAnimRef = useRef(null);

  // Zustand State
  const initialPos = useGameStore(state => state.playerPos); // Get start pos from store
  const getVisibleNpcs = useGameStore(state => state.getVisibleNpcs);
  const startDialogue = useGameStore(state => state.startDialogue);
  const addCatMessage = useGameStore(state => state.addCatMessage);
  const stress = useGameStore(state => state.stress);
  const currentLocation = useGameStore(state => state.currentLocation);
  const globalActiveAnim = useGameStore(state => state.activeAnim);
  const getSchedule = useGameStore(state => state.getSchedule);
  const schedule = getSchedule();
  
  // Ref để kiểm soát việc đã gõ trống chưa
  const lastBellEventRef = useRef(null);

  useEffect(() => {
    if (globalActiveAnim) {
      activeAnimRef.current = globalActiveAnim;
      setTimeout(() => {
        if (activeAnimRef.current?.type === globalActiveAnim.type) {
          activeAnimRef.current = null;
          useGameStore.setState({ activeAnim: null });
        }
      }, 3000);
    }
  }, [globalActiveAnim]);

  // Phát tiếng trống trường
  useEffect(() => {
    const isClassTime = schedule.event === 'class_am' || schedule.event === 'class_pm';
    if (isClassTime && lastBellEventRef.current !== schedule.event) {
      lastBellEventRef.current = schedule.event;
      if (currentLocation === 'classroom' || currentLocation === 'main') {
        audioSystem.playSchoolBell();
      }
    } else if (!isClassTime) {
      lastBellEventRef.current = null;
    }
  }, [schedule.event, currentLocation]);

  const isHighlyStressed = stress > 80;
  const mapData = MAPS[currentLocation] || MAPS.classroom;
  const tileSize = 32;
  const locInfo = LOCATION_LABELS[currentLocation] || LOCATION_LABELS.classroom;

  // Local Game Loop State (Smooth Movement)
  const posRef = useRef({ x: initialPos.x * tileSize, y: initialPos.y * tileSize, facing: initialPos.facing || 'down' });
  const keysRef = useRef({ w: false, a: false, s: false, d: false });
  const [nearbyObj, setNearbyObj] = useState(null);
  const [nearbyNpc, setNearbyNpc] = useState(null);

  // Initialize systems

  // Sync initial position if map changes
  useEffect(() => {
    posRef.current = { x: initialPos.x * tileSize, y: initialPos.y * tileSize, facing: initialPos.facing || 'down' };

    // Expose animation trigger for modals
    window.triggerPlayerAnimation = (type, duration = 3000, data = null) => {
      const oldPos = { x: posRef.current.x, y: posRef.current.y };
      activeAnimRef.current = { type, start: performance.now(), data, oldPos };
      
      // Nếu là tắm, di chuyển nhân vật vào giữa bồn tắm
      if (type === 'shower') {
        posRef.current.x = 27.5 * 16 - 16; // 16 is tileSize, but tileSize variable might not be available here, assuming 16
        posRef.current.y = 3 * 16 - 16;
      }
      
      keysRef.current = { w: false, a: false, s: false, d: false }; // Stop movement
      if (duration !== Infinity) {
        setTimeout(() => {
          if (activeAnimRef.current?.type === type) {
            if (type === 'shower' && activeAnimRef.current.oldPos) {
              posRef.current.x = activeAnimRef.current.oldPos.x;
              posRef.current.y = activeAnimRef.current.oldPos.y;
            }
            activeAnimRef.current = null;
          }
        }, duration);
      }
    };
  }, [currentLocation, initialPos]);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      
      const key = e.key.toLowerCase();
      if (activeAnimRef.current) {
        if (activeAnimRef.current.type === 'study' && key === 'e') {
          activeAnimRef.current = null;
        } else {
          return; // Block input during animations
        }
      }

      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        if (key === 'w' || key === 'arrowup') keysRef.current.w = true;
        if (key === 's' || key === 'arrowdown') keysRef.current.s = true;
        if (key === 'a' || key === 'arrowleft') keysRef.current.a = true;
        if (key === 'd' || key === 'arrowright') keysRef.current.d = true;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setNearbyObj(obj => {
          setNearbyNpc(npc => {
            if (npc) {
              audioSystem.playClick();
              startDialogue(npc.id);
            } else if (obj) {
              audioSystem.playClick();
              if (obj.type === 'pc') {
                useGameStore.getState().openJournal();
              } else if (obj.type === 'bed') {
                activeAnimRef.current = { type: 'sleep', start: performance.now() };
                keysRef.current = { w: false, a: false, s: false, d: false }; // Stop movement
                setTimeout(() => { if (activeAnimRef.current?.type === 'sleep') activeAnimRef.current = null; }, 3000);
                useGameStore.getState().rest();
              } else if (obj.type === 'plant') {
                activeAnimRef.current = { type: 'water', start: performance.now() };
                keysRef.current = { w: false, a: false, s: false, d: false }; // Stop movement
                setTimeout(() => { if (activeAnimRef.current?.type === 'water') activeAnimRef.current = null; }, 2000);
                useGameStore.getState().waterPlant();
              } else if (obj.type === 'fridge') {
                audioSystem.playClick();
                useGameStore.getState().openFoodMenu('fridge');
              } else if (obj.type === 'dining_table') {
                audioSystem.playClick();
                useGameStore.getState().openFoodMenu('table');
              } else if (obj.type === 'lavabo') {
                audioSystem.playClick();
                window.triggerPlayerAnimation('wash_face', 3000);
                useGameStore.getState().washFace();
              } else if (obj.type === 'toilet') {
                audioSystem.playClick();
                window.triggerPlayerAnimation('toilet', 4000);
                useGameStore.getState().useToilet();
              } else if (obj.type === 'shower') {
                audioSystem.playClick();
                window.triggerPlayerAnimation('shower', 4000);
                useGameStore.getState().shower();
              } else if (obj.type === 'library_desk') {
                audioSystem.playClick();
                useGameStore.getState().openLibraryModal();
              } else if (obj.type === 'doctor_desk') {
                audioSystem.playClick();
                useGameStore.getState().openHospitalModal();
              } else if (obj.type === 'house_door') {
                audioSystem.playClick();
                useGameStore.getState().changeLocation('home', { x: 23.5, y: 22, facing: 'up' });
              } else if (obj.type === 'school_door') {
                audioSystem.playClick();
                useGameStore.getState().changeLocation('classroom', { x: 19.5, y: 27.5, facing: 'up' });
              } else if (obj.type === 'hospital_door') {
                audioSystem.playClick();
                useGameStore.getState().changeLocation('hospital_room', { x: 9.5, y: 13, facing: 'up' });
              } else if (obj.type === 'library_door') {
                audioSystem.playClick();
                useGameStore.getState().changeLocation('library_room', { x: 9.5, y: 13, facing: 'up' });
              } else if (obj.type === 'classroom_chair') {
                audioSystem.playClick();
                posRef.current.x = (obj.gridX || Math.floor((posRef.current.x + 16) / tileSize)) * tileSize;
                posRef.current.y = (obj.gridY || Math.floor((posRef.current.y + 16) / tileSize)) * tileSize; // Stand precisely below desk
                posRef.current.facing = 'up';
                window.triggerPlayerAnimation('study', Infinity);
                useGameStore.getState().study();
              }
            }
            return npc;
          });
          return obj;
        });
      }

      if (key === 'e') {
        e.preventDefault();
        setNearbyObj(obj => {
          if (obj && obj.type === 'pc') {
            audioSystem.playClick();
            useGameStore.getState().openLaptop();
            // Nếu hội thoại rỗng, thêm câu chào
            if (useGameStore.getState().catMessages.length <= 1) {
              addCatMessage('cat', 'Meo! Cậu mới mở máy tính à? Cần tâm sự gì không?');
            }
          } else if (obj && obj.type === 'door') {
            audioSystem.playClick();
            if (currentLocation === 'home') useGameStore.getState().changeLocation('main', { x: 4.5, y: 12, facing: 'down' });
            else if (currentLocation === 'classroom') useGameStore.getState().changeLocation('main', { x: 22, y: 12, facing: 'down' });
            else if (currentLocation === 'hospital_room') useGameStore.getState().changeLocation('main', { x: 16, y: 24, facing: 'down' });
            else if (currentLocation === 'library_room') useGameStore.getState().changeLocation('main', { x: 37, y: 15, facing: 'down' });
          } else if (obj && obj.type === 'bed') {
            audioSystem.playClick();
            window.triggerPlayerAnimation('sleep', 10000);
          } else if (obj && obj.type === 'fridge') {
            audioSystem.playClick();
            useGameStore.getState().openFoodMenu('fridge');
          } else if (obj && obj.type === 'plant') {
            audioSystem.playClick();
            useGameStore.getState().waterPlant();
          } else if (obj && obj.type === 'dining_table') {
            audioSystem.playClick();
            useGameStore.getState().openFoodMenu('table');
          } else if (obj && obj.type === 'lavabo') {
            audioSystem.playClick();
            window.triggerPlayerAnimation('wash_face', 3000);
            useGameStore.getState().washFace();
          } else if (obj && obj.type === 'toilet') {
            audioSystem.playClick();
            window.triggerPlayerAnimation('toilet', 4000);
            useGameStore.getState().useToilet();
          } else if (obj && obj.type === 'shower') {
            audioSystem.playClick();
            window.triggerPlayerAnimation('shower', 4000);
          } else if (obj && obj.type === 'classroom_chair') {
            audioSystem.playClick();
            // Stand below the desk safely outside collision
            posRef.current.x = (obj.gridX || Math.floor((posRef.current.x + 16) / tileSize)) * tileSize;
            posRef.current.y = (obj.gridY || Math.floor((posRef.current.y + 16) / tileSize)) * tileSize;
            posRef.current.facing = 'up';
            window.triggerPlayerAnimation('study', Infinity);
            useGameStore.getState().study();
          } else if (obj && obj.type === 'house_door') {
            audioSystem.playClick();
            useGameStore.getState().changeLocation('home', { x: 23.5, y: 22, facing: 'up' });
          } else if (obj && obj.type === 'school_door') {
            audioSystem.playClick();
            useGameStore.getState().changeLocation('classroom', { x: 19.5, y: 27.5, facing: 'up' });
          } else if (obj && obj.type === 'hospital_door') {
            audioSystem.playClick();
            useGameStore.getState().changeLocation('hospital_room', { x: 9.5, y: 13, facing: 'up' });
          } else if (obj && obj.type === 'library_door') {
            audioSystem.playClick();
            useGameStore.getState().changeLocation('library_room', { x: 9.5, y: 13, facing: 'up' });
          }
          return obj;
        });
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') keysRef.current.w = false;
      if (key === 's' || key === 'arrowdown') keysRef.current.s = false;
      if (key === 'a' || key === 'arrowleft') keysRef.current.a = false;
      if (key === 'd' || key === 'arrowright') keysRef.current.d = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startDialogue, addCatMessage]);

  // Game Loop
  useEffect(() => {
    let animationFrameId;
    let lastTime = 0;
    const fpsInterval = 1000 / 30; // 30 FPS cap

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = (time) => {
      animationFrameId = requestAnimationFrame(render);
      const speed = 12.0; // Increased speed dramatically for fast movement
      if (!time) time = performance.now();
      if (!lastTime) lastTime = time;
      const elapsed = time - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = time - (elapsed % fpsInterval);

      // 1. Update Physics
      const pos = posRef.current;
      const keys = keysRef.current;

      let dx = 0;
      let dy = 0;
      if (keys.w) dy -= speed;
      if (keys.s) dy += speed;
      if (keys.a) dx -= speed;
      if (keys.d) dx += speed;

      // Diagonal normalization
      if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
      }

      const isMoving = dx !== 0 || dy !== 0;

      if (isMoving) {
        pos.walkTimer = (pos.walkTimer || 0) + 0.1; // Slower walk cycle
        if (Math.random() < 0.03) audioSystem.playStep();
      } else {
        pos.walkTimer = 0;
      }

      // Update facing
      if (dy < 0) pos.facing = 'up';
      else if (dy > 0) pos.facing = 'down';
      else if (dx < 0) pos.facing = 'left';
      else if (dx > 0) pos.facing = 'right';

      // Collision Detection
      const newX = pos.x + dx;
      const newY = pos.y + dy;

      const rows = mapData.length;
      const cols = mapData[0].length;

      // Bounding box
      const hitbox = { left: newX + 6, right: newX + 26, top: newY + 16, bottom: newY + 30 };

      const checkCollision = (hx, hy) => {
        const gridX = Math.floor(hx / tileSize);
        const gridY = Math.floor(hy / tileSize);
        if (gridX < 0 || gridX >= cols || gridY < 0 || gridY >= rows) return true;
        const tile = mapData[gridY][gridX];
        return tile === 1 || tile === 2 || tile === 4 || tile === 9;
      };

      let isColliding = checkCollision(hitbox.left, hitbox.top) || checkCollision(hitbox.right, hitbox.top) || checkCollision(hitbox.left, hitbox.bottom) || checkCollision(hitbox.right, hitbox.bottom);

      if (!isColliding) {
        pos.x = newX; pos.y = newY;
      } else {
        const sx = { ...hitbox, top: pos.y + 16, bottom: pos.y + 30 };
        if (!(checkCollision(sx.left, sx.top) || checkCollision(sx.right, sx.top) || checkCollision(sx.left, sx.bottom) || checkCollision(sx.right, sx.bottom))) pos.x = newX;
        const sy = { ...hitbox, left: pos.x + 6, right: pos.x + 26 };
        if (!(checkCollision(sy.left, sy.top) || checkCollision(sy.right, sy.top) || checkCollision(sy.left, sy.bottom) || checkCollision(sy.right, sy.bottom))) pos.y = newY;
      }

      const gridX = Math.floor((pos.x + 16) / tileSize);
      const gridY = Math.floor((pos.y + 16) / tileSize);
      if (mapData[gridY]?.[gridX] === 3) {
        keysRef.current = { w: false, a: false, s: false, d: false };
        useGameStore.getState().movePlayer(0, 1);
      }

      // 2. Render
      canvas.width = cols * tileSize;
      canvas.height = rows * tileSize;

      // --- TẠO TEXTURE CHÂN THỰC BẰNG OFFSCREEN CANVAS ---
      if (typeof window.proceduralPatterns === 'undefined') {
        const createTex = (w, h, drawFunc) => {
          const c = document.createElement('canvas');
          c.width = w; c.height = h;
          drawFunc(c.getContext('2d'));
          return c;
        };
        window.proceduralPatterns = {
          grass: createTex(32, 32, cx => {
            // Nền cỏ mượt hơn với noise 2x2
            const colors = ['#69b53b', '#72c241', '#62a837'];
            for (let x = 0; x < 32; x += 2) {
              for (let y = 0; y < 32; y += 2) {
                cx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                cx.fillRect(x, y, 2, 2);
              }
            }
            // Điểm xuyết các khóm cỏ (shadow + highlight)
            for (let i = 0; i < 6; i++) {
              const gx = Math.random() * 26 + 2; const gy = Math.random() * 26 + 2;
              cx.fillStyle = '#4c8c25'; cx.fillRect(gx + 1, gy + 2, 2, 1); // Shadow
              cx.fillStyle = '#8ce851'; cx.fillRect(gx, gy, 1, 2);     // Blade 1
              cx.fillStyle = '#a6f571'; cx.fillRect(gx + 2, gy - 1, 1, 3); // Blade 2
            }
            // Vài bông hoa nhỏ li ti (15% cơ hội mỗi ô 32x32)
            if (Math.random() < 0.15) {
              cx.fillStyle = Math.random() > 0.5 ? '#fff' : '#fbbf24';
              const fx = Math.random() * 24 + 4, fy = Math.random() * 24 + 4;
              cx.fillRect(fx, fy, 2, 2);
              cx.fillStyle = '#f59e0b'; cx.fillRect(fx + 1, fy + 1, 1, 1); // Nhụy hoa
            }
          }),

          path: createTex(32, 32, cx => {
            // Nền đất
            const groundColors = ['#d2a979', '#c59d6e', '#dcb484'];
            for (let x = 0; x < 32; x += 2) {
              for (let y = 0; y < 32; y += 2) {
                cx.fillStyle = groundColors[Math.floor(Math.random() * groundColors.length)];
                cx.fillRect(x, y, 2, 2);
              }
            }
            // Viền tối (tạo cảm giác mòn lõm xuống)
            cx.fillStyle = 'rgba(100, 70, 40, 0.1)';
            cx.fillRect(0, 0, 32, 2); cx.fillRect(0, 30, 32, 2);
            cx.fillRect(0, 0, 2, 32); cx.fillRect(30, 0, 2, 32);
            // Vài viên sỏi rải rác
            for (let i = 0; i < 8; i++) {
              const rx = Math.random() * 28 + 2, ry = Math.random() * 28 + 2;
              cx.fillStyle = 'rgba(0,0,0,0.15)'; cx.fillRect(rx, ry + 1, 2, 1); // Bóng sỏi
              cx.fillStyle = Math.random() > 0.5 ? '#9ca3af' : '#d1d5db'; // Màu đá
              cx.fillRect(rx, ry, 2, 1 + Math.floor(Math.random() * 2));
            }
          }),

          concrete: createTex(32, 32, cx => {
            // Lát gạch/đá (4 viên 16x16 trong 1 ô 32x32)
            cx.fillStyle = '#8a949e'; cx.fillRect(0, 0, 32, 32);
            const tileSize = 16;
            for (let ty = 0; ty < 2; ty++) {
              for (let tx = 0; tx < 2; tx++) {
                const ox = tx * tileSize, oy = ty * tileSize;
                // Highlight (góc trên-trái mỗi viên)
                cx.fillStyle = '#a8b4c0'; cx.fillRect(ox, oy, tileSize - 1, 1); cx.fillRect(ox, oy, 1, tileSize - 1);
                // Shadow (góc dưới-phải mỗi viên)
                cx.fillStyle = '#6e7782'; cx.fillRect(ox, oy + tileSize - 1, tileSize, 1); cx.fillRect(ox + tileSize - 1, oy, 1, tileSize);
                // Chấm nhiễu nhám của mặt đá
                for (let i = 0; i < 15; i++) {
                  cx.fillStyle = Math.random() > 0.5 ? '#939da7' : '#7b858e';
                  cx.fillRect(ox + 2 + Math.random() * (tileSize - 4), oy + 2 + Math.random() * (tileSize - 4), 1, 1);
                }
              }
            }
          }),

          tree: createTex(32, 48, cx => {
            // Bóng cây dưới mặt đất
            cx.fillStyle = 'rgba(0,0,0,0.3)';
            cx.beginPath(); cx.ellipse(16, 42, 12, 5, 0, 0, Math.PI * 2); cx.fill();

            // Thân cây gỗ (có vân sáng tối)
            cx.fillStyle = '#5c3a21'; cx.fillRect(12, 20, 8, 24);
            cx.fillStyle = '#3e2412'; cx.fillRect(18, 20, 2, 24); // Đổ bóng bên phải
            cx.fillStyle = '#7a4f2f'; cx.fillRect(12, 20, 1, 24); // Phản quang bên trái

            // Hàm vẽ 1 khóm lá 3D phong cách Pixel
            const drawLeafCluster = (x, y, r) => {
              // Vòng tối (đáy)
              cx.fillStyle = '#2d5a15';
              cx.beginPath(); cx.arc(x, y + 2, r, 0, Math.PI * 2); cx.fill();
              // Vòng cơ bản
              cx.fillStyle = '#4c8c25';
              cx.beginPath(); cx.arc(x, y, r, 0, Math.PI * 2); cx.fill();
              // Vòng highlight rực rỡ
              cx.fillStyle = '#76c437';
              cx.beginPath(); cx.arc(x - 1, y - 1, r - 2, 0, Math.PI * 2); cx.fill();
              // Điểm ảnh chói sáng (mô phỏng Pixel Art Stardew Valley)
              cx.fillStyle = '#a6f571';
              cx.fillRect(x - r * 0.4, y - r * 0.5, 3, 2);
            };

            // Lắp ráp các khóm lá tạo thành tán lá sum suê
            drawLeafCluster(16, 12, 13); // Đỉnh cây
            drawLeafCluster(9, 21, 10);  // Trái dưới
            drawLeafCluster(23, 21, 10); // Phải dưới
            drawLeafCluster(16, 23, 11); // Lấp khoảng trống giữa thân
          }),

          wall: createTex(32, 32, cx => {
            // Tường rào nhìn thẳng từ trên xuống (Top-down)
            // Viền ngoài
            cx.fillStyle = '#4b5563';
            cx.fillRect(0, 0, 32, 32);
            // Mặt trong
            cx.fillStyle = '#9ca3af';
            cx.fillRect(1, 1, 30, 30);
            // Highlight góc trên trái
            cx.fillStyle = '#f3f4f6';
            cx.fillRect(1, 1, 30, 2);
            cx.fillRect(1, 1, 2, 30);
            // Bóng góc dưới phải
            cx.fillStyle = '#6b7280';
            cx.fillRect(1, 29, 30, 2);
            cx.fillRect(29, 1, 2, 30);
          }),

          checkered_floor: createTex(32, 32, cx => {
            cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, 16, 16); cx.fillRect(16, 16, 16, 16);
            cx.fillStyle = '#cbd5e1'; cx.fillRect(16, 0, 16, 16); cx.fillRect(0, 16, 16, 16);
          }),
          blackboard: createTex(32, 32, cx => {
            cx.fillStyle = '#8b5a2b'; cx.fillRect(0, 0, 32, 32);
            cx.fillStyle = '#1e3f20'; cx.fillRect(2, 2, 28, 28);
            cx.fillStyle = 'rgba(255,255,255,0.3)';
            cx.fillRect(6, 6, 8, 2); cx.fillRect(6, 10, 14, 2); cx.fillRect(6, 14, 10, 2);
          }),
          sofa: createTex(32, 32, cx => {
            cx.fillStyle = '#991b1b'; 
            if (cx.roundRect) { cx.beginPath(); cx.roundRect(2, 2, 28, 28, 6); cx.fill(); } else { cx.fillRect(2, 2, 28, 28); }
            cx.fillStyle = '#b91c1c';
            if (cx.roundRect) { cx.beginPath(); cx.roundRect(6, 6, 20, 20, 4); cx.fill(); } else { cx.fillRect(6, 6, 20, 20); }
          }),
          water_cooler: createTex(32, 32, cx => {
            cx.fillStyle = '#f8fafc'; cx.fillRect(8, 16, 16, 14);
            cx.fillStyle = '#38bdf8'; cx.globalAlpha = 0.8;
            if (cx.roundRect) { cx.beginPath(); cx.roundRect(10, 2, 12, 14, 4); cx.fill(); } else { cx.fillRect(10, 2, 12, 14); }
            cx.globalAlpha = 1.0;
            cx.fillStyle = '#94a3b8'; cx.fillRect(12, 20, 8, 2);
          }),
          potted_plant: createTex(32, 32, cx => {
            cx.fillStyle = '#b45309'; cx.fillRect(10, 20, 12, 10);
            cx.fillStyle = '#15803d'; cx.beginPath(); cx.arc(16, 16, 8, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#22c55e'; cx.beginPath(); cx.arc(13, 13, 5, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(20, 15, 4, 0, Math.PI * 2); cx.fill();
          }),
          mirror: createTex(32, 32, cx => {
            cx.fillStyle = '#94a3b8'; cx.fillRect(0, 0, 32, 32);
            cx.fillStyle = '#e0f2fe'; cx.fillRect(2, 2, 28, 28);
            cx.fillStyle = 'rgba(255,255,255,0.5)';
            cx.beginPath(); cx.moveTo(6, 2); cx.lineTo(12, 2); cx.lineTo(2, 12); cx.lineTo(2, 6); cx.fill();
            cx.beginPath(); cx.moveTo(18, 2); cx.lineTo(30, 2); cx.lineTo(2, 30); cx.lineTo(2, 18); cx.fill();
          })
        };
      }

      // 0.5 Fill map background and custom floors BEFORE tileset rendering to prevent gaps at doorways
      if (currentLocation === 'home') {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, 32 * tileSize, 24 * tileSize);

        // 1. Sàn phòng ngủ (Gỗ - Wood floor) - phủ tràn qua c=16
        ctx.fillStyle = '#d4a373'; ctx.fillRect(0, 0, 17 * tileSize, 13 * tileSize);
        ctx.fillStyle = '#c08a55';
        for (let r = 0; r < 13; r++) {
          ctx.fillRect(0, r * tileSize + tileSize - 2, 17 * tileSize, 2);
          for (let c = 0; c < 17; c++) {
            if ((r + c) % 3 === 0) ctx.fillRect(c * tileSize + 10, r * tileSize, 2, tileSize);
            ctx.fillStyle = (c + r) % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
            ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
            ctx.fillStyle = '#c08a55';
          }
        }
        // Lớp phủ bóng loáng (Glossy finish) cho sàn gỗ
        const gradWood = ctx.createLinearGradient(0, 0, 17 * tileSize, 13 * tileSize);
        gradWood.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        gradWood.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        gradWood.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
        ctx.fillStyle = gradWood; ctx.fillRect(0, 0, 17 * tileSize, 13 * tileSize);

        // 2. Sàn phòng tắm (Caro + Highlight)
        for (let r = 0; r < 13; r++) {
          for (let c = 17; c < 32; c++) {
            ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#bae6fd';
            ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath(); ctx.arc(c * tileSize + 6, r * tileSize + 6, 2, 0, Math.PI * 2); ctx.fill();
          }
        }

        // 3. Sàn phòng bếp
        ctx.fillStyle = '#fef3c7'; ctx.fillRect(0, 13 * tileSize, 14 * tileSize, 11 * tileSize);
        ctx.fillStyle = '#fde68a';
        for (let r = 13; r < 24; r++) { ctx.fillRect(0, r * tileSize, 14 * tileSize, 2); }
        for (let c = 0; c < 14; c++) { ctx.fillRect(c * tileSize, 13 * tileSize, 2, 11 * tileSize); }

        // 4. Sàn phòng khách & Thảm
        // Khách tràn luôn sang bếp ở lối đi (c=14) để che gap
        ctx.fillStyle = '#fed7aa'; ctx.fillRect(14 * tileSize, 13 * tileSize, 18 * tileSize, 11 * tileSize);
        
        // Thảm lót sàn Boho (Rug) khu vực phòng khách
        ctx.fillStyle = '#ecfdf5'; // Nền thảm Off-white
        ctx.fillRect(15 * tileSize, 15 * tileSize, 11 * tileSize, 7 * tileSize);
        ctx.fillStyle = '#10b981'; // Họa tiết xanh lá (Green Boho)
        for (let rr = 15; rr < 22; rr++) {
           for (let cc = 15; cc < 26; cc++) {
              if ((rr+cc)%2===0) {
                  ctx.beginPath(); ctx.arc(cc * tileSize + 8, rr * tileSize + 8, 4, 0, Math.PI*2); ctx.fill();
              }
           }
        }
        // Tua rua quanh mép thảm
        ctx.fillStyle = '#d1fae5';
        for (let cc = 15 * tileSize; cc < 26 * tileSize; cc += 4) {
           ctx.fillRect(cc, 15 * tileSize - 4, 2, 4); // Mép trên
           ctx.fillRect(cc, 22 * tileSize, 2, 4);     // Mép dưới
        }
      }

      // 1. Draw Map (Floor & Wall) - from ASCII
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const t = mapData[r][c];
          const tx = c * tileSize, ty = r * tileSize;

          if (preRenderedSprites.floor && currentLocation !== 'home') ctx.drawImage(preRenderedSprites.floor, tx, ty);

          // Cỏ (8)
          if (t === 8) {
            ctx.drawImage(window.proceduralPatterns.grass, tx, ty);
          }
          // Đường đi (5)
          if (t === 5) {
            ctx.drawImage(window.proceduralPatterns.path, tx, ty);
          }
          // Cây (4) - Lưu ý cây vẽ đè lên cỏ, nên phải lót cỏ trước
          if (t === 4) {
            ctx.drawImage(window.proceduralPatterns.grass, tx, ty); // Lót nền cỏ
            // Cây có chiều cao 48px, nên vẽ lùi lên một chút để thân cắm xuống đúng ô
            ctx.drawImage(window.proceduralPatterns.tree, tx, ty - 16);
          }
          // Sân trường (Bê tông - 7) và Khối va chạm toà nhà (9)
          if (t === 7 || (t === 9 && currentLocation === 'main')) {
            ctx.drawImage(window.proceduralPatterns.concrete, tx, ty);
          }

          // Tường rào (1)
          if (t === 1) {
            ctx.drawImage(window.proceduralPatterns.wall, tx, ty);
          }
          
          if (t === 14) ctx.drawImage(window.proceduralPatterns.checkered_floor, tx, ty);
          if (t === 10) ctx.drawImage(window.proceduralPatterns.blackboard, tx, ty);
          if (t === 12) ctx.drawImage(window.proceduralPatterns.sofa, tx, ty);
          if (t === 13) ctx.drawImage(window.proceduralPatterns.water_cooler, tx, ty);
          if (t === 11) ctx.drawImage(window.proceduralPatterns.potted_plant, tx, ty);
          if (t === 15) ctx.drawImage(window.proceduralPatterns.mirror, tx, ty);
          if (t === 16) {
             // Filing cabinet
             ctx.fillStyle = '#9ca3af'; ctx.fillRect(tx + 2, ty + 2, 28, 28);
             ctx.fillStyle = '#d1d5db'; ctx.fillRect(tx + 4, ty + 4, 24, 24);
             ctx.fillStyle = '#6b7280'; ctx.fillRect(tx + 12, ty + 6, 8, 2);
          }
        }
      }

      // Load custom furniture images
      if (typeof window.customFurnitureSprites === 'undefined') {
        window.customFurnitureSprites = {};
        const furnitures = ['bed', 'desk', 'plant', 'laptop'];
        for (const f of furnitures) {
          const img = new Image();
          img.src = `/${f}.svg`;
          window.customFurnitureSprites[f] = img;
        }
      }

      // 2.1 Draw Tileset Props (luôn vẽ vì phòng ngủ đã nằm trong map main)
      if (currentLocation === 'home') {
        // Hoạ tiết ziczac giữa thảm
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          ctx.moveTo(16 * tileSize + 10 + i * 32, 15 * tileSize + 10);
          ctx.lineTo(16 * tileSize + 26 + i * 32, 15 * tileSize + 3.5 * tileSize);
          ctx.lineTo(16 * tileSize + 10 + i * 32, 15 * tileSize + 7 * tileSize - 10);
        }
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.3)'; ctx.lineWidth = 4; ctx.stroke();

        // --- ĐỒ NỘI THẤT MICRO-DETAILS ---

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;

        const fillRoundRect = (x, y, w, h, r) => {
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
          ctx.fill();
        };

        // ================= BỒN TẮM =================
        let tx = 25 * tileSize, ty = 2 * tileSize, tw = 6 * tileSize, th = 4 * tileSize;
        // Thảm chùi chân
        ctx.fillStyle = '#e2e8f0';
        fillRoundRect(tx - 20, ty + 16, 16, th - 32, 4);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';

        ctx.fillStyle = '#f8fafc'; // Vỏ bồn
        fillRoundRect(tx, ty, tw, th, 12);

        ctx.shadowColor = 'transparent';
        let bx = tx + 8, by = ty + 8, bw = tw - 16, bh = th - 16;
        let gradTub = ctx.createLinearGradient(bx, by, bx, by + bh);
        gradTub.addColorStop(0, '#e2e8f0'); gradTub.addColorStop(1, '#ffffff');
        ctx.fillStyle = gradTub;
        fillRoundRect(bx, by, bw, bh, 8);

        // Nước bồn tắm & Gợn sóng (Ripples)
        let wx = bx + 4, wy = by + 4, ww = bw - 8, wh = bh - 8;
        let gradWater = ctx.createRadialGradient(wx + ww / 2, wy + wh / 2, 5, wx + ww / 2, wy + wh / 2, ww / 1.5);
        gradWater.addColorStop(0, '#38bdf8'); gradWater.addColorStop(1, '#0284c7');
        ctx.fillStyle = gradWater;
        fillRoundRect(wx, wy, ww, wh, 6);
        
        // Hoạt ảnh gợn sóng (Sine wave ripples)
        const t = performance.now() / 500;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let x = wx + 5; x < wx + ww - 5; x += 2) {
           ctx.lineTo(x, wy + wh/2 + Math.sin(x/5 + t) * 4);
        }
        ctx.stroke();
        ctx.beginPath();
        for(let x = wx + 5; x < wx + ww - 5; x += 2) {
           ctx.lineTo(x, wy + wh/2 + 10 + Math.sin(x/6 - t) * 3);
        }
        ctx.stroke();

        // Bọt xà phòng (Bubbles)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 15; i++) {
          ctx.beginPath();
          ctx.arc(wx + 10 + (i * 10) % ww, wy + 10 + (i * 7) % wh, 3 + (i % 3) * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Chai sữa tắm hồng
        ctx.fillStyle = '#f472b6';
        fillRoundRect(tx + tw - 16, ty + 12, 10, 14, 3);
        ctx.fillStyle = '#fbcfe8'; fillRoundRect(tx + tw - 12, ty + 8, 4, 4, 1);

        // Vòi sen
        ctx.fillStyle = '#94a3b8'; fillRoundRect(tx - 4, ty + th / 2 - 8, 12, 16, 4);
        ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.arc(tx + 12, ty + th / 2, 8, 0, Math.PI * 2); ctx.fill();

        // ================= TỦ LẠNH =================
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        let fx = 2 * tileSize, fy = 14 * tileSize, fw = 2 * tileSize, fh = 3 * tileSize;
        let gradFridge = ctx.createLinearGradient(fx, fy, fx + fw, fy);
        gradFridge.addColorStop(0, '#94a3b8'); gradFridge.addColorStop(0.2, '#f1f5f9'); gradFridge.addColorStop(0.8, '#cbd5e1'); gradFridge.addColorStop(1, '#64748b'); // Hiệu ứng Inox bóng
        ctx.fillStyle = gradFridge;
        fillRoundRect(fx, fy, fw, fh, 6);

        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#475569'; ctx.fillRect(fx, fy + fh * 0.4, fw, 2); // Ngăn
        ctx.fillStyle = '#0f172a';
        fillRoundRect(fx + fw - 10, fy + 8, 4, fh * 0.25, 2); // Tay trên
        fillRoundRect(fx + fw - 10, fy + fh * 0.4 + 8, 4, fh * 0.35, 2); // Tay dưới

        // Màn hình LED & Khe lấy đá
        ctx.fillStyle = '#1e293b'; fillRoundRect(fx + 8, fy + 12, 16, 24, 2);
        ctx.fillStyle = '#0ea5e9'; ctx.fillRect(fx + 10, fy + 16, 12, 6); // Nhiệt độ sáng
        ctx.fillStyle = '#38bdf8'; ctx.font = '5px Arial'; ctx.fillText('2°C', fx + 11, fy + 21);
        ctx.fillStyle = '#0f172a'; fillRoundRect(fx + 8, fy + fh * 0.5, 16, 20, 2); // Dispenser
        ctx.fillStyle = '#cbd5e1'; ctx.fillRect(fx + 12, fy + fh * 0.5 + 4, 8, 4); // Nút bấm
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; ctx.fillRect(fx + 14, fy + fh * 0.5 + 10, 4, 6); // Cốc thuỷ tinh

        // Sticky Notes
        ctx.fillStyle = '#fef08a'; ctx.fillRect(fx + 30, fy + 20, 10, 10);
        ctx.fillStyle = '#000000'; ctx.fillRect(fx + 32, fy + 22, 6, 1); ctx.fillRect(fx + 32, fy + 24, 4, 1); // Chữ trên note
        ctx.fillStyle = '#fca5a5'; ctx.fillRect(fx + 34, fy + 34, 10, 12);

        // ================= BÀN ĂN =================
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        let dx = 6 * tileSize, dy = 17 * tileSize, dw = 4 * tileSize, dh = 3 * tileSize;
        ctx.fillStyle = '#78350f'; fillRoundRect(dx, dy, dw, dh, 8); // Bàn
        
        ctx.shadowColor = 'transparent';
        // Vân gỗ bàn ăn
        ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1;
        for(let i=1; i<dw/10; i++) {
           ctx.beginPath(); ctx.moveTo(dx + i*10, dy+4); ctx.quadraticCurveTo(dx + i*10 + 5, dy+dh/2, dx + i*10, dy+dh-4); ctx.stroke();
        }

        ctx.fillStyle = '#f87171'; fillRoundRect(dx + 12, dy + 8, dw - 24, dh - 16, 4); // Khăn
        ctx.fillStyle = '#ffffff'; ctx.fillRect(dx + 24, dy + 8, dw - 48, dh - 16); // Sọc trắng

        // Viền tua rua khăn bàn
        ctx.fillStyle = '#fca5a5';
        for (let i = 0; i < 10; i++) { ctx.fillRect(dx + 12 + i * 10, dy + dh - 8, 4, 4); ctx.fillRect(dx + 12 + i * 10, dy + 4, 4, 4); }

        // Đĩa ăn & Dao nĩa
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath(); ctx.arc(dx + 32, dy + dh / 2, 12, 0, Math.PI * 2); ctx.fill(); // Đĩa trái
        ctx.beginPath(); ctx.arc(dx + dw - 32, dy + dh / 2, 12, 0, Math.PI * 2); ctx.fill(); // Đĩa phải
        // Bát súp (Soup bowl)
        ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(dx + 32, dy + dh / 2, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(dx + dw - 32, dy + dh / 2, 6, 0, Math.PI * 2); ctx.fill();
        
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#cbd5e1'; // Dao nĩa kim loại
        ctx.fillRect(dx + 14, dy + dh / 2 - 8, 2, 16); // Nĩa trái
        ctx.fillRect(dx + 48, dy + dh / 2 - 8, 2, 16); // Dao trái
        ctx.fillRect(dx + dw - 48, dy + dh / 2 - 8, 2, 16); // Nĩa phải
        ctx.fillRect(dx + dw - 16, dy + dh / 2 - 8, 2, 16); // Dao phải

        // Lọ hoa giữa bàn & Ly vang
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.fillStyle = '#38bdf8'; fillRoundRect(dx + dw / 2 - 6, dy + dh / 2 - 6, 12, 12, 6); // Lọ thuỷ tinh
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#f43f5e'; ctx.beginPath(); ctx.arc(dx + dw / 2, dy + dh / 2 - 8, 6, 0, Math.PI * 2); ctx.fill(); // Hoa đỏ
        ctx.fillStyle = '#fb7185'; ctx.beginPath(); ctx.arc(dx + dw / 2 - 4, dy + dh / 2 - 10, 4, 0, Math.PI * 2); ctx.fill(); // Hoa phụ
        // Ly vang đỏ
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; ctx.beginPath(); ctx.arc(dx + 42, dy + dh / 2 - 12, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; ctx.beginPath(); ctx.arc(dx + dw - 42, dy + dh / 2 - 12, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#be123c'; ctx.beginPath(); ctx.arc(dx + 42, dy + dh / 2 - 12, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#be123c'; ctx.beginPath(); ctx.arc(dx + dw - 42, dy + dh / 2 - 12, 2.5, 0, Math.PI * 2); ctx.fill();

        // ================= SOFA & BÀN TRÀ =================
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        let sx = 17 * tileSize, sy = 18 * tileSize, sw = 4 * tileSize, sh = 3 * tileSize;
        let gradSofa = ctx.createLinearGradient(sx, sy, sx, sy + sh);
        gradSofa.addColorStop(0, '#ef4444'); gradSofa.addColorStop(0.5, '#dc2626'); gradSofa.addColorStop(1, '#991b1b');
        ctx.fillStyle = gradSofa;
        fillRoundRect(sx, sy, sw, sh, 10);

        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#7f1d1d'; fillRoundRect(sx + 4, sy + 4, sw - 8, sh * 0.4, 6); // Lưng tựa

        // Tufting (Nút bấm trên lưng tựa sofa) tinh tế hơn
        ctx.fillStyle = '#450a0a';
        for (let c = 1; c < 6; c++) { 
           ctx.beginPath(); ctx.arc(sx + c * sw / 6, sy + 14, 2, 0, Math.PI * 2); ctx.fill(); 
        }

        ctx.fillStyle = '#7f1d1d';
        fillRoundRect(sx - 2, sy + 8, 12, sh - 16, 4); // Tay trái
        fillRoundRect(sx + sw - 10, sy + 8, 12, sh - 16, 4); // Tay phải

        // Gối tựa lông vũ
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.fillStyle = '#fca5a5';
        fillRoundRect(sx + 14, sy + 18, 18, 18, 4); // Gối 1
        fillRoundRect(sx + sw - 32, sy + 18, 18, 18, 4); // Gối 2
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#fecaca'; ctx.fillRect(sx + 16, sy + 20, 14, 2); ctx.fillRect(sx + sw - 30, sy + 20, 14, 2); // Highlight gối

        // Bàn trà kính (Glass Coffee Table) trước sofa
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        fillRoundRect(sx + 16, sy - 40, sw - 32, 24, 4);
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.strokeRect(sx + 16, sy - 40, sw - 32, 24);
        // Tạp chí trên bàn trà
        ctx.fillStyle = '#38bdf8'; fillRoundRect(sx + 24, sy - 34, 12, 14, 1);
        ctx.fillStyle = '#f8fafc'; fillRoundRect(sx + 28, sy - 34, 8, 14, 1);

        // ================= TIVI & PS5 =================
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        let tvx = 23 * tileSize, tvy = 15 * tileSize, tvw = 3 * tileSize, tvh = 1.5 * tileSize;
        ctx.fillStyle = '#334155'; fillRoundRect(tvx, tvy, tvw, tvh, 4); // Kệ TV

        ctx.shadowColor = 'transparent';
        // Loa Soundbar & PS5
        ctx.fillStyle = '#0f172a'; fillRoundRect(tvx + 10, tvy + tvh - 6, tvw - 20, 4, 2); // Soundbar
        ctx.fillStyle = '#f8fafc'; fillRoundRect(tvx + tvw - 14, tvy + 4, 8, 20, 2); // PS5 thân
        ctx.fillStyle = '#0f172a'; fillRoundRect(tvx + tvw - 11, tvy + 6, 2, 16, 1); // PS5 khe tản nhiệt

        ctx.fillStyle = '#0f172a'; fillRoundRect(tvx + 4, tvy + 4, tvw - 24, tvh - 12, 2); // Khung TV

        // Màn hình phát cảnh đồi đêm
        const tvt = performance.now() / 1000;
        ctx.fillStyle = '#172554'; ctx.fillRect(tvx + 6, tvy + 6, tvw - 28, tvh - 16); // Bầu trời
        
        // Sao lấp lánh (Twinkling stars)
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = Math.abs(Math.sin(tvt*2)); ctx.fillRect(tvx + 10, tvy + 8, 1, 1);
        ctx.globalAlpha = Math.abs(Math.cos(tvt*1.5)); ctx.fillRect(tvx + 25, tvy + 10, 1, 1);
        ctx.globalAlpha = Math.abs(Math.sin(tvt*3)); ctx.fillRect(tvx + 18, tvy + 14, 1, 1);
        ctx.globalAlpha = 1.0;

        ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(tvx + 16, tvy + 12, 4, 0, Math.PI * 2); ctx.fill(); // Mặt trăng
        
        // Đám mây trôi (Scrolling clouds)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        let cloudX = (tvx + 6 + (tvt * 10) % (tvw - 28));
        if (cloudX > tvx + tvw - 22) cloudX = tvx + 6; // Loop mây
        ctx.beginPath(); ctx.arc(cloudX, tvy + 14, 3, 0, Math.PI * 2); ctx.arc(cloudX + 4, tvy + 14, 4, 0, Math.PI * 2); ctx.arc(cloudX + 8, tvy + 14, 3, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#166534';
        ctx.beginPath(); ctx.moveTo(tvx + 6, tvy + tvh - 10); ctx.quadraticCurveTo(tvx + tvw / 2, tvy + 12, tvx + tvw - 22, tvy + tvh - 10); ctx.fill(); // Đồi cỏ
        
        // Ánh sáng toả ra từ màn hình TV (Glow)
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.beginPath(); ctx.arc(tvx + tvw / 2, tvy + tvh / 2, 40, 0, Math.PI * 2); ctx.fill();

        // --- CÁC NỘI THẤT CHILL & HEALTHY THÊM VÀO ---
        
        // 2. Kệ sách góc tường (Chill)
        ctx.fillStyle = '#5c402d';
        ctx.fillRect(20 * tileSize, 13 * tileSize, 2 * tileSize, tileSize);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(20 * tileSize + 4, 13 * tileSize + 4, 6, 12);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(20 * tileSize + 12, 13 * tileSize + 4, 8, 12);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(20 * tileSize + 24, 13 * tileSize + 4, 6, 12);
        
        // 3. Cây cảnh thư giãn
        ctx.fillStyle = '#78350f'; ctx.fillRect(27 * tileSize + 8, 14 * tileSize + 8, 16, 24); // Chậu
        ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(27 * tileSize + 16, 14 * tileSize + 4, 12, 0, Math.PI*2); ctx.fill(); // Lá
        ctx.fillStyle = '#4ade80'; ctx.beginPath(); ctx.arc(27 * tileSize + 12, 14 * tileSize, 8, 0, Math.PI*2); ctx.fill();

        // 4. Cửa chính (Đại sảnh ra vào lớn)
        let doorX = 21 * tileSize, doorY = 23 * tileSize, doorW = 4 * tileSize;
        
        // Xóa tường cũ bằng cách vẽ nền đen (Void) để tạo khoảng trống cửa
        ctx.fillStyle = '#000000'; 
        ctx.fillRect(doorX, doorY, doorW, tileSize); 

        // Vệt ánh sáng hắt từ ngoài vào trong nhà
        let gradLight = ctx.createLinearGradient(doorX, doorY + 8, doorX, doorY - 40);
        gradLight.addColorStop(0, 'rgba(253, 230, 138, 0.2)'); // Ánh sáng vàng ấm
        gradLight.addColorStop(1, 'rgba(253, 230, 138, 0)');
        ctx.fillStyle = gradLight;
        ctx.beginPath(); 
        ctx.moveTo(doorX, doorY + 8); 
        ctx.lineTo(doorX + doorW, doorY + 8); 
        ctx.lineTo(doorX + doorW + 20, doorY - 40); 
        ctx.lineTo(doorX - 20, doorY - 40); 
        ctx.fill();

        // Thảm chùi chân Welcome lớn trong nhà
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.fillStyle = '#1e1b4b'; fillRoundRect(doorX + 16, doorY - 24, doorW - 32, 20, 4); // Thảm đậm
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 1.5; ctx.strokeRect(doorX + 20, doorY - 20, doorW - 40, 12);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 10px "Courier New", monospace'; ctx.textAlign = 'center'; ctx.fillText('WELCOME', doorX + doorW/2, doorY - 11);

        // Bậu cửa kim loại/đá
        let gradThresh = ctx.createLinearGradient(doorX, doorY, doorX, doorY + 6);
        gradThresh.addColorStop(0, '#f8fafc'); gradThresh.addColorStop(1, '#94a3b8');
        ctx.fillStyle = gradThresh;
        ctx.fillRect(doorX, doorY, doorW, 6);
        ctx.fillStyle = '#475569'; ctx.fillRect(doorX, doorY + 6, doorW, 2); // Cạnh bậu cửa

        // Khung cửa (cột) hai bên - Cân đối và gọn gàng
        ctx.fillStyle = '#334155'; ctx.fillRect(doorX - 6, doorY, 6, 32);
        ctx.fillStyle = '#475569'; ctx.fillRect(doorX - 3, doorY, 3, 32);
        
        ctx.fillStyle = '#334155'; ctx.fillRect(doorX + doorW, doorY, 6, 32);
        ctx.fillStyle = '#475569'; ctx.fillRect(doorX + doorW, doorY, 3, 32);

        // Cánh cửa mở thẳng ra ngoài (Nhìn từ trên xuống)
        // Độ dày cửa = 6, Chiều dài = 54
        // Cánh trái
        ctx.fillStyle = '#451a03'; ctx.fillRect(doorX - 2, doorY + 8, 6, 54); 
        ctx.fillStyle = '#78350f'; ctx.fillRect(doorX - 1, doorY + 8, 4, 52); 
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(doorX + 1, doorY + 54, 3, 4); // Tay nắm nhìn từ trên
        
        // Cánh phải
        ctx.fillStyle = '#451a03'; ctx.fillRect(doorX + doorW - 4, doorY + 8, 6, 54);
        ctx.fillStyle = '#78350f'; ctx.fillRect(doorX + doorW - 3, doorY + 8, 4, 52);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(doorX + doorW - 4, doorY + 54, 3, 4); // Tay nắm

        ctx.restore();

        roomLayout.layout.forEach(item => {
          if (['bed', 'desk', 'plant', 'laptop'].includes(item.type)) {
            const customImg = window.customFurnitureSprites[item.type];
            if (customImg && customImg.complete && customImg.width > 0) {
              const rw = item.renderW || customImg.width;
              const rh = item.renderH || customImg.height;
              
              // Đổ bóng (Drop shadow) cho nội thất 3D
              ctx.save();
              ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
              ctx.shadowOffsetY = 6;
              ctx.shadowBlur = 10;
              ctx.drawImage(customImg, item.x * tileSize, item.y * tileSize, rw, rh);
              ctx.restore();
            }
          } else if (tilesetReady && roomLayout.tileset) {
            const data = roomLayout.tileset[item.type];
            if (data) {
              ctx.drawImage(
                tilesetImg,
                data.sx, data.sy, data.sw, data.sh,
                item.x * tileSize, item.y * tileSize, data.sw, data.sh
              );
            }
          }
        });
      }

      // Vẽ nội thất cơ bản cho các map khác
      if (currentLocation === 'hospital_room' || currentLocation === 'library_room') {
        // Vẽ bàn / quầy ở giữa trên (col 8..11, row 2..3)
        ctx.fillStyle = '#78350f'; // Màu bàn gỗ
        ctx.fillRect(8 * tileSize, 2 * tileSize, 4 * tileSize, 2 * tileSize);

        // Vẽ sách / máy tính trên bàn
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(9 * tileSize + 16, 2 * tileSize + 16, 24, 16); // Laptop hoặc sổ

        if (currentLocation === 'hospital_room') {
          ctx.fillStyle = '#38bdf8'; // Giường bệnh màu xanh y tế
          for (let r = 6; r <= 10; r += 4) {
            for (let c = 4; c <= 16; c += 6) {
              ctx.fillRect(c * tileSize, r * tileSize, 2 * tileSize, 2 * tileSize);
              // Chăn / gối
              ctx.fillStyle = '#f8fafc';
              ctx.fillRect(c * tileSize + 4, r * tileSize + 4, 2 * tileSize - 8, 16);
              ctx.fillStyle = '#38bdf8'; // Đổi lại
            }
          }
        }
        else if (currentLocation === 'library_room') {
          ctx.fillStyle = '#450a0a'; // Kệ sách màu gỗ đậm
          for (let r = 5; r <= 11; r += 3) {
            for (let c = 2; c <= 17; c += 5) {
              ctx.fillRect(c * tileSize, r * tileSize, 2 * tileSize, 2 * tileSize);
              // Điểm xuyết sách nhiều màu
              ctx.fillStyle = '#ef4444'; ctx.fillRect(c * tileSize + 4, r * tileSize + 4, 8, 12);
              ctx.fillStyle = '#3b82f6'; ctx.fillRect(c * tileSize + 16, r * tileSize + 4, 12, 12);
              ctx.fillStyle = '#22c55e'; ctx.fillRect(c * tileSize + 32, r * tileSize + 4, 12, 12);
              ctx.fillStyle = '#eab308'; ctx.fillRect(c * tileSize + 48, r * tileSize + 4, 8, 12);
              ctx.fillStyle = '#450a0a'; // Đổi lại
            }
          }
        }
      }

      // === NỘI THẤT TRƯỜNG HỌC ===
      if (currentLocation === 'classroom') {
         ctx.save();
         
         const fillRoundRect = (x, y, w, h, r) => {
           ctx.beginPath();
           if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
           ctx.fill();
         };

         // === 1. VẼ SÀN NHÀ VỆ SINH (Checkered floor) ===
         // Sàn phòng giáo viên (Thảm hoặc Sàn gỗ)
         ctx.fillStyle = '#e5e5e5';
         ctx.fillRect(23 * tileSize, 1 * tileSize, 16 * tileSize, 15 * tileSize);
         // Thảm Sofa
         ctx.fillStyle = '#1e3a8a'; // Xanh biển đậm sang trọng
         ctx.fillRect(33 * tileSize, 10 * tileSize, 6 * tileSize, 5 * tileSize);

         // Sàn nhà vệ sinh (Gạch lục giác/sọc vuông nhỏ)
         ctx.fillStyle = '#dbeafe'; // Xanh nhạt mát mẻ
         ctx.fillRect(23 * tileSize, 17 * tileSize, 16 * tileSize, 12 * tileSize);
         ctx.fillStyle = 'rgba(255,255,255,0.3)';
         for(let r=17; r<29; r++) {
           for(let c=23; c<39; c++) {
             if ((r+c)%2===0) ctx.fillRect(c*tileSize, r*tileSize, tileSize, tileSize);
           }
         }

         // === 2. VẼ ĐỒ NỘI THẤT (Khối lớn) ===
         ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
         ctx.shadowBlur = 8;
         ctx.shadowOffsetY = 4;

         // Bảng đen (Lớp học)
         ctx.fillStyle = '#5c3a21'; ctx.fillRect(4 * tileSize, 1 * tileSize, 10 * tileSize, tileSize);
         ctx.fillStyle = '#8b5a2b'; ctx.fillRect(4 * tileSize + 2, 1 * tileSize + 2, 10 * tileSize - 4, tileSize - 4);
         ctx.fillStyle = '#1e3f20'; ctx.fillRect(4 * tileSize + 4, 1 * tileSize + 4, 10 * tileSize - 8, tileSize - 8);
         ctx.fillStyle = 'rgba(255,255,255,0.6)';
         ctx.fillRect(5 * tileSize, 1 * tileSize + 10, 32, 2);
         ctx.fillRect(5 * tileSize, 1 * tileSize + 16, 48, 2);
         ctx.fillRect(9 * tileSize, 1 * tileSize + 10, 32, 2);
         ctx.fillRect(11 * tileSize, 1 * tileSize + 14, 24, 2);
         ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(4 * tileSize + 6, 2 * tileSize - 8, 30, 4);
         ctx.fillStyle = '#f59e0b'; ctx.fillRect(7 * tileSize, 2 * tileSize - 8, 8, 4);

         // Tủ tài liệu (Phòng GV)
         ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(24 * tileSize, 2 * tileSize, 8 * tileSize, 6);
         ctx.fillStyle = '#475569'; ctx.fillRect(24 * tileSize, 1 * tileSize, 8 * tileSize, tileSize);
         for(let i=24; i<32; i++) {
            ctx.fillStyle = '#334155'; ctx.fillRect(i * tileSize, 1 * tileSize, tileSize, tileSize);
            ctx.fillStyle = '#cbd5e1'; ctx.fillRect(i * tileSize + 2, 1 * tileSize + 2, tileSize - 4, tileSize - 4);
            ctx.fillStyle = '#f8fafc'; ctx.fillRect(i * tileSize + 2, 1 * tileSize + 2, tileSize - 4, 2); 
            ctx.fillStyle = '#475569'; ctx.fillRect(i * tileSize + 15, 1 * tileSize + 4, 2, tileSize - 8);
            ctx.fillStyle = '#64748b'; 
            ctx.fillRect(i * tileSize + 12, 1 * tileSize + 12, 2, 6);
            ctx.fillRect(i * tileSize + 18, 1 * tileSize + 12, 2, 6);
         }

         // Bảng thông báo (Phòng GV)
         ctx.fillStyle = '#a16207'; ctx.fillRect(32 * tileSize, 1 * tileSize, 4 * tileSize, tileSize);
         ctx.fillStyle = '#fef08a'; ctx.fillRect(32 * tileSize + 4, 1 * tileSize + 4, 4 * tileSize - 8, tileSize - 8);
         ctx.fillStyle = '#ef4444'; ctx.fillRect(33 * tileSize, 1 * tileSize + 8, 8, 8); // Giấy nốt đỏ
         ctx.fillStyle = '#3b82f6'; ctx.fillRect(34 * tileSize, 1 * tileSize + 16, 12, 8); // Giấy nốt xanh
         // Sofa (Phòng GV) - Nâng cấp Sofa da chữ L sang trọng
         ctx.fillStyle = 'rgba(0,0,0,0.4)'; fillRoundRect(34 * tileSize - 4, 11 * tileSize - 4, 4 * tileSize + 8, 3 * tileSize + 8, 12);
         ctx.fillStyle = '#171717'; // Da đen sang trọng
         fillRoundRect(34 * tileSize, 11 * tileSize, 4 * tileSize, 3 * tileSize, 8);
         const drawCushion = (cx, cy, cw, ch) => {
            ctx.fillStyle = '#262626'; fillRoundRect(cx, cy, cw, ch, 4);
            ctx.fillStyle = '#404040'; fillRoundRect(cx + 2, cy + 2, cw - 4, ch - 4, 2);
         };
         drawCushion(34.2 * tileSize, 11.2 * tileSize, 1.2 * tileSize, 2.6 * tileSize);
         drawCushion(35.5 * tileSize, 11.2 * tileSize, 1.2 * tileSize, 2.6 * tileSize);
         drawCushion(36.8 * tileSize, 11.2 * tileSize, 1 * tileSize, 1.2 * tileSize);
         // Bàn kính cafe
         ctx.fillStyle = 'rgba(255,255,255,0.6)';
         fillRoundRect(34.5 * tileSize, 12.5 * tileSize, 2 * tileSize, 1.2 * tileSize, 4);

         // Bình nước (Phòng GV)
         ctx.fillStyle = '#f8fafc'; ctx.fillRect(37 * tileSize + 8, 1 * tileSize + 16, 16, 14);
         ctx.fillStyle = '#38bdf8'; ctx.globalAlpha = 0.8;
         fillRoundRect(37 * tileSize + 10, 1 * tileSize + 2, 12, 14, 4);
         ctx.globalAlpha = 1.0;

         // Bồn rửa & Gương (Nhà vệ sinh)
         ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(25 * tileSize, 19.5 * tileSize, 6 * tileSize, 6);
         ctx.fillStyle = '#e2e8f0'; ctx.fillRect(25 * tileSize, 18.5 * tileSize, 6 * tileSize, tileSize);
         
         // Khung Gương (Bắt buộc phải có để hiển thị khung phản chiếu)
         ctx.fillStyle = '#94a3b8'; ctx.fillRect(26 * tileSize, 17 * tileSize, 5 * tileSize, tileSize); 
         ctx.fillStyle = '#e0f2fe'; ctx.fillRect(26 * tileSize + 2, 17 * tileSize + 2, 5 * tileSize - 4, tileSize - 4); 
         ctx.fillStyle = 'rgba(255,255,255,0.5)';
         ctx.beginPath(); ctx.moveTo(27 * tileSize, 17 * tileSize + 2); ctx.lineTo(30 * tileSize, 17 * tileSize + 2); ctx.lineTo(26 * tileSize + 2, 18 * tileSize - 2); ctx.lineTo(26 * tileSize + 2, 17 * tileSize + 20); ctx.fill(); 
         
         // Máy sấy tay (Nhà vệ sinh)
         ctx.fillStyle = '#cbd5e1'; fillRoundRect(31.2 * tileSize, 18.2 * tileSize, 20, 24, 4);
         ctx.fillStyle = '#64748b'; fillRoundRect(31.2 * tileSize + 4, 18.2 * tileSize + 20, 12, 4, 2); // Khe gió
         
         // Thùng rác (Nhà vệ sinh)
         ctx.fillStyle = '#0f172a'; fillRoundRect(23.5 * tileSize, 19 * tileSize, 20, 24, 4);
         ctx.fillStyle = '#334155'; ctx.fillRect(23.5 * tileSize + 2, 19 * tileSize - 2, 16, 4);
         
         for(let i=0; i<5; i++) {
            ctx.beginPath(); ctx.ellipse((25.5 + i) * tileSize + 8, 19 * tileSize + 4, 12, 6, 0, 0, Math.PI * 2); 
            ctx.fillStyle = '#f8fafc'; ctx.fill();
            ctx.beginPath(); ctx.ellipse((25.5 + i) * tileSize + 8, 19 * tileSize + 4, 8, 4, 0, 0, Math.PI * 2); 
            ctx.fillStyle = '#cbd5e1'; ctx.fill();
         }

         // Toilet Stalls
         // Lưng buồng
         ctx.fillStyle = '#64748b'; 
         ctx.fillRect(24 * tileSize, 23 * tileSize, 13 * tileSize, 10); 
         ctx.fillStyle = '#94a3b8'; 
         ctx.fillRect(24 * tileSize, 23 * tileSize + 10, 13 * tileSize, tileSize - 10); 

         // Vách ngăn bên
         for(let c=24; c<=36; c+=2) {
            ctx.fillStyle = '#cbd5e1'; 
            ctx.fillRect(c * tileSize, 23 * tileSize + tileSize, tileSize, 2 * tileSize); 
         }
         // === 3. VẼ BÀN HỌC & GHẾ ===
         const drawDesk = (x, y, style) => {
            // Đổ bóng chung cho cả bàn và ghế
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetY = 6;
            
            if (style === 'teacher') {
               // Ghế giáo viên sang trọng hơn
               ctx.fillStyle = '#1e293b'; fillRoundRect(x + 8, y - 18, 16, 12, 4); // Lưng tựa cao
               ctx.fillStyle = '#0f172a'; fillRoundRect(x + 10, y - 16, 12, 10, 2); // Nệm lưng
               ctx.fillStyle = '#334155'; ctx.fillRect(x + 14, y - 6, 4, 10); // Trục ghế
               ctx.fillStyle = '#0f172a'; fillRoundRect(x + 8, y + 2, 16, 8, 3); // Nệm ngồi
               
               // Mặt bàn giáo viên
               ctx.shadowColor = 'rgba(0,0,0,0.5)';
               ctx.fillStyle = '#9a3412'; fillRoundRect(x - 4, y, 40, 26, 4); // Mặt bàn to hơn
               ctx.shadowColor = 'transparent';
               ctx.fillStyle = '#78350f'; ctx.fillRect(x - 4, y + 20, 40, 6); // Cạnh bàn
               
               // Laptop giáo viên
               ctx.fillStyle = '#e2e8f0'; fillRoundRect(x + 10, y + 6, 12, 8, 1); // Đáy laptop
               ctx.fillStyle = '#f8fafc'; fillRoundRect(x + 10, y + 2, 12, 6, 1); // Màn hình
               ctx.fillStyle = '#0f172a'; ctx.fillRect(x + 11, y + 3, 10, 4); // Màn đen
               ctx.fillStyle = '#38bdf8'; ctx.fillRect(x + 12, y + 4, 8, 2); // Cửa sổ code/sáng
               
               // Chồng sách / Tài liệu
               ctx.fillStyle = '#fbbf24'; fillRoundRect(x + 24, y + 8, 10, 12, 1); // Sổ vàng
               ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 25, y + 9, 8, 10);
               ctx.fillStyle = '#fca5a5'; ctx.fillRect(x + 26, y + 10, 6, 2); 
               
               // Cốc cà phê
               ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(x + 4, y + 10, 3, 0, Math.PI*2); ctx.fill();
               ctx.fillStyle = '#78350f'; ctx.beginPath(); ctx.arc(x + 4, y + 10, 2, 0, Math.PI*2); ctx.fill();
            } 
            else if (style === 'student') {
               // Chân bàn và ghế (màu gỗ sẫm / sắt đen)
               ctx.fillStyle = '#3f3f46'; 
               // Chân ghế
               ctx.fillRect(x + 10, y + 26, 2, 8); ctx.fillRect(x + 20, y + 26, 2, 8);
               // Chân bàn
               ctx.fillRect(x + 2, y + 18, 2, 10); ctx.fillRect(x + 28, y + 18, 2, 10);
               
               // Mặt bàn (Gỗ sẫm)
               ctx.shadowColor = 'rgba(0,0,0,0.3)';
               ctx.fillStyle = '#b45309'; 
               ctx.fillRect(x, y + 2, 32, 20); // Vuông vức hơn
               ctx.shadowColor = 'transparent';
               
               // Cạnh bàn và viền
               ctx.fillStyle = '#78350f'; ctx.fillRect(x, y + 22, 32, 4); // Cạnh dày hơn
               ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(x, y + 2, 32, 1); // Highlight
               
               // Ngăn bàn (hộc bàn) xám sẫm
               ctx.fillStyle = '#27272a';
               ctx.fillRect(x + 2, y + 26, 28, 4);

               // Khung đỡ tựa lưng ghế
               ctx.fillStyle = '#3f3f46';
               ctx.fillRect(x + 11, y + 26, 2, 18); ctx.fillRect(x + 19, y + 26, 2, 18);

               // Mặt ghế gỗ
               ctx.shadowColor = 'rgba(0,0,0,0.4)';
               ctx.fillStyle = '#d97706';
               ctx.fillRect(x + 8, y + 28, 16, 8); // Vuông vức
               ctx.fillStyle = '#92400e'; ctx.fillRect(x + 8, y + 36, 16, 3); // Cạnh ghế
               ctx.shadowColor = 'transparent';
               
               // Lưng tựa ghế
               ctx.fillStyle = '#d97706';
               ctx.fillRect(x + 8, y + 40, 16, 6);
               ctx.fillStyle = '#92400e'; ctx.fillRect(x + 8, y + 46, 16, 2);
               
               // === ĐỒ VẬT CHI TIẾT TRÊN BÀN (CLUTTER) ===
               const hash = (x + y) % 3;
               if (hash === 0) { // Bàn bên trái: Chồng sách, giấy tờ, đồng hồ, la bàn
                 // Chồng sách trái
                 ctx.fillStyle = '#991b1b'; ctx.fillRect(x + 2, y + 14, 10, 4); // Sách đỏ
                 ctx.fillStyle = '#fef08a'; ctx.fillRect(x + 3, y + 11, 8, 3); // Sách vàng
                 ctx.fillStyle = '#166534'; ctx.fillRect(x + 2, y + 6, 10, 5); // Sách xanh
                 // Giấy tờ lộn xộn giữa
                 ctx.fillStyle = '#f8fafc';
                 ctx.save(); ctx.translate(x + 16, y + 12); ctx.rotate(-0.1); ctx.fillRect(-6, -6, 10, 12); // Tờ dưới
                 ctx.fillStyle = '#e2e8f0'; ctx.fillRect(-4, -4, 3, 1); ctx.fillRect(-4, -2, 4, 1); // Chữ
                 ctx.rotate(0.2); ctx.fillStyle = '#ffffff'; ctx.fillRect(-4, -8, 8, 10); // Tờ trên
                 ctx.fillStyle = '#cbd5e1'; ctx.fillRect(-2, -6, 3, 1); ctx.fillRect(-2, -4, 4, 1); // Chữ
                 ctx.restore();
                 // La bàn (Compa)
                 ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 20, y + 16); ctx.lineTo(x + 22, y + 8); ctx.lineTo(x + 24, y + 16); ctx.stroke();
                 // Đồng hồ báo thức
                 ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(x + 28, y + 8, 4, 0, Math.PI * 2); ctx.fill();
                 ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x + 28, y + 8, 3, 0, Math.PI * 2); ctx.fill();
                 ctx.fillStyle = '#000000'; ctx.fillRect(x + 28, y + 6, 1, 3); // Kim
               } else if (hash === 1) { // Bàn giữa: Sách giáo khoa mở, bút, tẩy
                 // Sổ tay mở bên trái
                 ctx.fillStyle = '#0f172a'; ctx.fillRect(x + 4, y + 10, 12, 8); // Bìa sổ
                 ctx.fillStyle = '#fef08a'; ctx.fillRect(x + 5, y + 11, 5, 6); // Trang trái
                 ctx.fillStyle = '#fef08a'; ctx.fillRect(x + 11, y + 11, 4, 6); // Trang phải
                 ctx.fillStyle = '#1e293b'; ctx.fillRect(x + 10, y + 10, 1, 8); // Gáy
                 // Tẩy (Eraser)
                 ctx.fillStyle = '#3b82f6'; ctx.fillRect(x + 18, y + 16, 2, 3);
                 ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 20, y + 16, 2, 3);
                 // Sách giáo khoa mở to giữa
                 ctx.fillStyle = '#38bdf8'; ctx.fillRect(x + 16, y + 4, 14, 10); // Bìa sách
                 ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 17, y + 5, 6, 8); // Trang trái
                 ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 24, y + 5, 5, 8); // Trang phải
                 ctx.fillStyle = '#cbd5e1'; ctx.fillRect(x + 18, y + 6, 4, 1); ctx.fillRect(x + 18, y + 8, 3, 1); // Chữ
                 ctx.fillRect(x + 25, y + 6, 3, 1); ctx.fillRect(x + 25, y + 8, 4, 1); // Chữ
                 // Bút chì vàng
                 ctx.fillStyle = '#facc15'; ctx.fillRect(x + 26, y + 16, 4, 1);
                 ctx.fillStyle = '#ef4444'; ctx.fillRect(x + 30, y + 16, 1, 1); // Đầu tẩy bút
               } else { // Bàn bên phải: Hộp bút, giấy kiểm tra, chậu cây nhỏ
                 // Ống đựng bút
                 ctx.fillStyle = '#d4d4d8'; ctx.fillRect(x + 4, y + 6, 5, 6);
                 ctx.fillStyle = '#ef4444'; ctx.fillRect(x + 5, y + 3, 1, 4); // Bút đỏ
                 ctx.fillStyle = '#3b82f6'; ctx.fillRect(x + 7, y + 4, 1, 3); // Bút xanh
                 // Giấy kiểm tra A
                 ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 12, y + 4, 8, 10);
                 ctx.fillStyle = '#ef4444'; ctx.font = '8px Arial'; ctx.fillText('A+', x + 13, y + 12);
                 // Chồng Vở Bài Tập
                 ctx.fillStyle = '#0ea5e9'; ctx.fillRect(x + 16, y + 14, 8, 6); // Vở xanh
                 ctx.fillStyle = '#fca5a5'; ctx.fillRect(x + 20, y + 12, 8, 6); // Vở hồng
                 ctx.fillStyle = '#4ade80'; ctx.fillRect(x + 24, y + 10, 6, 8); // Vở xanh lá
                 // Chậu cây nhỏ đá sen
                 ctx.fillStyle = '#a16207'; ctx.fillRect(x + 26, y + 4, 6, 4); // Chậu
                 ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(x + 29, y + 3, 3, 0, Math.PI * 2); ctx.fill(); // Lá
               }
            }
         };

         // Bục giảng (Podium) to và rõ nét hơn
         ctx.shadowColor = 'rgba(0,0,0,0.3)';
         ctx.shadowBlur = 8;
         ctx.fillStyle = '#713f12'; // Gỗ tối màu sang trọng
         fillRoundRect(4 * tileSize, 2 * tileSize, 10 * tileSize, 3.5 * tileSize, 4); // Bục lớn hơn
         ctx.shadowColor = 'transparent';
         ctx.fillStyle = '#422006'; // Bậc thềm bục giảng
         fillRoundRect(4 * tileSize + 8, 5.5 * tileSize, 10 * tileSize - 16, 6, 2);
         ctx.fillStyle = 'rgba(255,255,255,0.1)'; 
         ctx.fillRect(4 * tileSize, 2 * tileSize, 10 * tileSize, 2); // Highlight viền bục
         // Thảm đỏ trên bục
         ctx.fillStyle = '#991b1b';
         fillRoundRect(5 * tileSize, 2 * tileSize + 8, 8 * tileSize, 2.5 * tileSize, 2);

         const drawPodium = (cx, cy, cols) => {
            const x = cx * tileSize; const y = cy * tileSize;
            const w = cols * tileSize; const h = 28; 
            
            // Bàn giáo viên chính
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.fillStyle = '#b45309'; fillRoundRect(x, y + 8, w, h, 2); // Thân bàn
            ctx.shadowColor = 'transparent';
            
            ctx.fillStyle = '#78350f'; ctx.fillRect(x, y + 8 + h - 6, w, 6); // Đáy bàn
            
            // Mặt bàn có khăn phủ
            ctx.fillStyle = '#451a03'; fillRoundRect(x - 4, y, w + 8, 16, 2); 
            ctx.fillStyle = '#f1f5f9'; fillRoundRect(x + w/4, y, w/2, 16, 1); // Khăn trải bàn trắng
            ctx.fillStyle = '#e2e8f0'; ctx.fillRect(x + w/4, y + 16, w/2, 4); // Rủ xuống
            
            // Lọ hoa trên bàn giáo viên
            ctx.fillStyle = '#38bdf8'; fillRoundRect(x + w - 16, y + 4, 8, 10, 4); // Bình hoa
            ctx.fillStyle = '#f43f5e'; ctx.beginPath(); ctx.arc(x + w - 12, y + 2, 5, 0, Math.PI*2); ctx.fill(); // Hoa
            ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(x + w - 16, y + 4, 3, 0, Math.PI*2); ctx.fill(); // Lá
         };
         drawPodium(7, 4, 4); 
         
         // Bàn học sinh (Lớp học)
         for(let r=9; r<=25; r+=4) {
            for(let c=3; c<=6; c++) drawDesk(c * tileSize, r * tileSize, 'student');
            for(let c=11; c<=14; c++) drawDesk(c * tileSize, r * tileSize, 'student');
         }

         // Bàn giáo viên (Phòng GV) 
         const drawOfficeDesk = (cx, cy) => {
            const x = cx * tileSize; const y = cy * tileSize;
            const w = 3 * tileSize; const h = 3 * tileSize;
            ctx.fillStyle = 'rgba(0,0,0,0.3)'; fillRoundRect(x, y + h - 4, w, 8, 2);
            ctx.fillStyle = '#475569'; ctx.fillRect(x + 4, y + h - 16, 8, 20); ctx.fillRect(x + w - 12, y + h - 16, 8, 20);
            ctx.fillStyle = '#450a0a'; fillRoundRect(x, y, w, h, 4);
            ctx.fillStyle = '#290505'; ctx.fillRect(x, y + h - 6, w, 6);
            ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(x + 2, y + 2, w - 4, 2);
            ctx.fillStyle = '#1e293b'; fillRoundRect(x + w/2 - 16, y + h/2 - 12, 32, 20, 2);
            ctx.fillStyle = '#0f172a'; ctx.fillRect(x + w/2 - 14, y + h/2 - 10, 28, 16);
            ctx.fillStyle = '#94a3b8'; ctx.fillRect(x + w/2 - 4, y + h/2 + 8, 8, 6); ctx.fillRect(x + w/2 - 12, y + h/2 + 14, 24, 4);
            ctx.fillStyle = '#f8fafc'; ctx.fillRect(x + 14, y + 14, 16, 20); ctx.fillStyle = '#e2e8f0'; ctx.fillRect(x + 18, y + 14, 1, 20);
            ctx.fillStyle = '#3b82f6'; ctx.fillRect(x + 36, y + 20, 20, 26);
            ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(x + w - 24, y + 24, 6, 0, Math.PI*2); ctx.fill(); 
            ctx.fillStyle = 'rgba(0,0,0,0.4)'; fillRoundRect(x + w/2 - 16, y - 10, 32, 8, 4);
            ctx.fillStyle = '#020617'; fillRoundRect(x + w/2 - 18, y - 24, 36, 16, 4); 
            ctx.fillStyle = '#1e293b'; fillRoundRect(x + w/2 - 14, y - 22, 28, 12, 2); 
         };
         drawOfficeDesk(24, 4);
         drawOfficeDesk(30, 4);

         // Cây cảnh
         const drawPlant = (c, r) => {
            ctx.fillStyle = '#b45309'; fillRoundRect(c*tileSize + 6, r*tileSize + 16, 20, 16, 4);
            ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.arc(c*tileSize + 16, r*tileSize + 12, 14, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(c*tileSize + 10, r*tileSize + 8, 8, 0, Math.PI*2); ctx.fill();
         };
         drawPlant(1, 1); drawPlant(16, 1); drawPlant(1, 28); drawPlant(16, 28);
         drawPlant(24, 13); drawPlant(25, 13);

         // Biển báo (Lớp học, Phòng GV, Nhà vệ sinh)
         const drawSign = (x, y, text, color) => {
            ctx.fillStyle = color; fillRoundRect(x, y, 32, 14, 2);
            ctx.fillStyle = '#111827'; ctx.font = 'bold 9px Arial';
            ctx.fillText(text, x + 16 - ctx.measureText(text).width/2, y + 10);
            ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x + 1, y + 1, 30, 2);
         };
         drawSign(17 * tileSize, 24 * tileSize + 8, '12A1', '#fef08a');
         drawSign(22 * tileSize, 13 * tileSize + 8, 'Giáo Viên', '#bae6fd');
         drawSign(22 * tileSize, 17 * tileSize + 8, 'WC', '#fca5a5');


         ctx.shadowColor = 'transparent';
         ctx.restore();
      }

      // 3. Draw NPCs
      const visibleNpcs = getVisibleNpcs();
      const t = performance.now();
      const isClassTime = schedule.event === 'class_am' || schedule.event === 'class_pm';

      visibleNpcs.forEach(npc => {
        if (npc.locations && !npc.locations.includes(currentLocation)) return;

        // Dynamic NPC overrides
        let logicX = npc.x;
        let logicY = npc.y;
        
        if (npc.id === 'teacher1') {
          if (isClassTime) {
            logicX = 8; logicY = 3; // Lên bục giảng
          } else {
            logicX = 30; logicY = 8; // Về phòng giáo viên
          }
        }

        // Pacing logic (deterministic walk back and forth)
        const phase = logicX * 13 + logicY * 7;
        let moveOffset = Math.sin((t + phase * 100) / 800) * 8; // Pacing range reduced
        
        // Giáo viên đứng yên khi đang dạy
        if (npc.id === 'teacher1' && isClassTime) moveOffset = 0;

        const direction = Math.cos((t + phase * 100) / 800) > 0 ? 1 : -1;

        const nx = logicX * tileSize + moveOffset;
        const ny = logicY * tileSize;
        const walkCycle = Math.floor(t / 150) % 4;
        const isWalking = true;

        // Color mapping
        let hexColor = '#fbbf24'; // amber
        if (npc.color.includes('pink')) hexColor = '#f472b6';
        else if (npc.color.includes('blue')) hexColor = '#60a5fa';
        else if (npc.color.includes('green')) hexColor = '#4ade80';
        else if (npc.color.includes('purple')) hexColor = '#c084fc';
        else if (npc.color.includes('gray')) hexColor = '#4b5563';
        else if (npc.color.includes('rose')) hexColor = '#f43f5e';

        // Use the same sprite images as the player!
        let baseSprite = direction > 0 ? 'playerRight' : 'playerLeft';
        if (npc.facing === 'up') baseSprite = 'playerUp';
        else if (npc.facing === 'down') baseSprite = 'playerDown';

        let spriteKey = baseSprite;
        if (!npc.sitting) {
          if (walkCycle === 1) spriteKey += 'Walk1';
          else if (walkCycle === 3) spriteKey += 'Walk2';
        }

        const customImg = window.customPlayerSprites && window.customPlayerSprites[spriteKey];

        ctx.save();
        // If sitting, render slightly lower to mimic being seated
        const sittingOffset = npc.sitting ? 4 : 0;
        ctx.translate(nx + 16, ny + 28 + sittingOffset); // Origin at bottom center

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        if (customImg && customImg.complete && customImg.width > 0) {
          const drawW = 32;
          const drawH = (customImg.height / customImg.width) * drawW;

          let hueRotate = 0;
          if (npc.id === 'ba') hueRotate = 0;
          else if (npc.id === 'me') hueRotate = 300;
          else if (npc.id === 'ha') hueRotate = 270;
          else if (npc.id === 'tuan') hueRotate = 180;
          else if (npc.id === 'khang') hueRotate = 110;
          else if (npc.id === 'linh') hueRotate = 50;

          ctx.filter = `hue-rotate(${hueRotate}deg)`;

          // Draw original sprite but tinted
          drawPlayerSprite(ctx, customImg, drawW, drawH, -drawW / 2, 12 - drawH, false);

          ctx.filter = 'none'; // reset filter
        } else {
          // Fallback if sprite not loaded
          ctx.fillStyle = hexColor;
          ctx.fillRect(-10, -28, 20, 28);
        }

        ctx.restore();
      });

      // Shadow placed precisely under the feet
      // Sprite with walk animation frames
      let spriteKey = 'playerDown';
      if (pos.facing === 'left') spriteKey = 'playerLeft';
      if (pos.facing === 'right') spriteKey = 'playerRight';
      if (pos.facing === 'up') spriteKey = 'playerUp';

      if (isMoving) {
        // Toggle between Walk1 (0) and Walk2 (1) every cycle
        const walkCycle = Math.floor(pos.walkTimer) % 2;
        spriteKey += (walkCycle === 0 ? 'Walk1' : 'Walk2');
      }
      
      const anim = activeAnimRef.current;
      const hideShadow = anim && ['sleep', 'study', 'toilet'].includes(anim.type);

      if (!hideShadow) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(pos.x + tileSize / 2, pos.y + 28, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
        // Vẽ nhân vật chính khi đang di chuyển bình thường
        const customImg = window.customPlayerSprites && window.customPlayerSprites[spriteKey];
        // Chỉ vẽ nếu không có animation đè lên (hoặc animation thuộc dạng ngồi đọc/học thì sẽ xử lý ở block sau)
        if (customImg && customImg.complete && customImg.width > 0 && !anim) {
          const drawW = 32;
          const drawH = (customImg.height / customImg.width) * drawW;
          drawPlayerSprite(ctx, customImg, drawW, drawH, pos.x + tileSize / 2 - drawW / 2, pos.y + 32 - drawH, isHighlyStressed);

          // HỆ THỐNG PHẢN CHIẾU GƯƠNG (RESTROOM MIRROR)
          if (currentLocation === 'classroom' && pos.x >= 25 * tileSize && pos.x <= 31 * tileSize && pos.y >= 17 * tileSize && pos.y <= 21 * tileSize) {
            ctx.save();
            ctx.globalAlpha = 0.35;
            
            const mirrorBase = 17 * tileSize;
            const dy = pos.y - mirrorBase;
            const reflectY = mirrorBase + 24 - dy * 0.8;
            
            let refKey = spriteKey;
            if (pos.facing === 'up') refKey = isHighlyStressed ? 'playerDownDark' : 'playerDown';
            else if (pos.facing === 'down') refKey = isHighlyStressed ? 'playerUpDark' : 'playerUp';
            
            if (pos.facing === 'left' || pos.facing === 'right') {
              ctx.translate(pos.x + tileSize / 2, 0);
              ctx.scale(-1, 1);
              ctx.translate(-(pos.x + tileSize / 2), 0);
            }
            
            const refImg = window.customPlayerSprites && window.customPlayerSprites[refKey];
            if (refImg && refImg.complete && refImg.width > 0) {
              ctx.beginPath();
              ctx.rect(26 * tileSize + 2, 17 * tileSize + 2, 5 * tileSize - 4, tileSize - 4);
              ctx.clip();
              // Vẽ bóng đen dưới chân phản chiếu
              ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
              ctx.beginPath();
              ctx.ellipse(pos.x + tileSize / 2, reflectY + 30, drawW / 2.5, 5, 0, 0, Math.PI * 2);
              ctx.fill();
              drawPlayerSprite(ctx, refImg, drawW, drawH, pos.x + tileSize / 2 - drawW / 2, reflectY + 32 - drawH, isHighlyStressed);
              
              // Vẽ lại lớp Glare của gương để ánh sáng nằm đè lên hình phản chiếu
              ctx.fillStyle = 'rgba(255,255,255,0.4)';
              ctx.beginPath(); 
              ctx.moveTo(27 * tileSize, 17 * tileSize + 2); 
              ctx.lineTo(30 * tileSize, 17 * tileSize + 2); 
              ctx.lineTo(26 * tileSize + 2, 18 * tileSize - 2); 
              ctx.lineTo(26 * tileSize + 2, 17 * tileSize + 20); 
              ctx.fill(); 
            }
            ctx.restore();
          }
        }

      if (anim && (anim.type === 'sleep' || anim.type === 'read' || anim.type === 'study' || anim.type === 'code' || anim.type === 'pe' || anim.type === 'science' || anim.type === 'math' || anim.type === 'literature' || anim.type === 'english' || anim.type === 'history' || anim.type === 'eat' || anim.type === 'shower' || anim.type === 'wash_face' || anim.type === 'toilet')) {
        const t = performance.now() - anim.start;
        if (anim.type === 'sleep') {
          const sleepX = 6.8 * tileSize; // Giữa đệm (bỏ qua viền trống bên trái của SVG)
          const sleepY = 7.8 * tileSize; // Lùi xuống để nằm trên đệm/gối

          ctx.save();
          ctx.translate(sleepX, sleepY);
          // Bỏ rotate vì giường dọc, dùng playerRight (ngủ nghiêng) là chuẩn nhất
          // Vẽ nhân vật đang ngủ
          const customImg = window.customPlayerSprites && window.customPlayerSprites['playerRight'];
          if (customImg && customImg.complete && customImg.width > 0) {
            const drawW = 32;
            const drawH = (customImg.height / customImg.width) * drawW;
            drawPlayerSprite(ctx, customImg, drawW, drawH, -drawW / 2, -drawH / 2, isHighlyStressed);
          }
          ctx.restore();

          // Zzz particles (bay lên từ đầu nhân vật)
          ctx.font = 'bold 16px "Courier New"';
          ctx.fillStyle = '#60a5fa';
          ctx.fillText('Zzz...', sleepX - 10, sleepY - 20 - (t / 100) % 15);
        } else if (anim.type === 'shower') {
            ctx.save();
            ctx.translate(28 * tileSize, 3.5 * tileSize);
            
            // Swimming animation logic (Bobbing & Left/Right swap)
            const timeOffset = performance.now() - anim.start;
            const bobY = Math.sin(timeOffset / 150) * 4; // Nhấp nhô 4px
            const isLeft = Math.floor(timeOffset / 500) % 2 === 0; // Đổi mặt mỗi 0.5s
            
            const customImg = window.customPlayerSprites && window.customPlayerSprites[isLeft ? 'playerLeft' : 'playerRight'];
            if (customImg && customImg.complete && customImg.width > 0) {
              const drawW = 32;
              const drawH = (customImg.height / customImg.width) * drawW;
              drawPlayerSprite(ctx, customImg, drawW, drawH, -drawW / 2, -drawH / 2 + 10 + bobY, isHighlyStressed);
            }
            ctx.restore();
            
            // Shower particles
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            for (let i=0; i<3; i++) {
               ctx.beginPath();
               ctx.arc(28 * tileSize - 10 + (timeOffset % (20 + i*5)), 3.5 * tileSize - (timeOffset % (15 + i*10)), 2, 0, Math.PI * 2);
               ctx.fill();
            }
        } else if (anim.type === 'wash_face') {
            ctx.save();
            ctx.translate(pos.x + tileSize / 2, pos.y + 32);
            const timeOffset = performance.now() - anim.start;
            const bobY = Math.sin(timeOffset / 100) * 2; 
            
            const customImg = window.customPlayerSprites && window.customPlayerSprites['playerUp']; // Quay mặt vào gương
            if (customImg && customImg.complete && customImg.width > 0) {
              const drawW = 32;
              const drawH = (customImg.height / customImg.width) * drawW;
              drawPlayerSprite(ctx, customImg, drawW, drawH, -drawW / 2, -drawH + bobY, isHighlyStressed);
            }
            ctx.restore();
            // Nước bắn (water particles)
            ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
            ctx.beginPath();
            ctx.arc(pos.x + tileSize / 2 - 10 + (timeOffset % 20), pos.y + 10 - (timeOffset % 15), 2, 0, Math.PI * 2);
            ctx.arc(pos.x + tileSize / 2 + 10 - (timeOffset % 18), pos.y + 5 - (timeOffset % 12), 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (anim.type === 'toilet') {
            ctx.save();
            const stallX = Math.floor((pos.x + 16) / tileSize) * tileSize;
            // Vẽ cánh cửa đóng kín che lấp toàn bộ buồng
            ctx.fillStyle = '#94a3b8'; 
            ctx.fillRect(stallX, 23 * tileSize + 10, tileSize, 2.5 * tileSize - 10); 
            // Ổ khóa màu đỏ (báo hiệu có người)
            ctx.fillStyle = '#ef4444';
            ctx.beginPath(); ctx.arc(stallX + 24, 24.5 * tileSize, 3, 0, Math.PI*2); ctx.fill();
            
            // Ký hiệu Zzz hoặc mùi :v
            if (t % 1000 < 500) {
              ctx.font = '10px Arial';
              ctx.fillStyle = '#fff';
              ctx.fillText('...', stallX + 10, 23 * tileSize - (t / 100) % 10);
            }
            ctx.restore();
        } else if (anim.type === 'study') {
            // Học bài (Ngồi ở bàn thật trong lớp học)
            ctx.save();
            // Origin đặt tại vị trí người chơi đang đứng (dưới ghế 1 chút)
            ctx.translate(pos.x + 16, pos.y + 16);
            
            const dx = -16, dy = -48;
            
            // Vẽ tay nhân vật vươn lên bàn (kiểu pixel)
            ctx.fillStyle = '#9ca3af'; // Xám áo
            ctx.fillRect(-15, 0, 4, 8); // Cánh tay trái
            ctx.fillRect(11, 0, 4, 8); // Cánh tay phải
            
            ctx.fillStyle = '#fcd34d'; // Da tay
            ctx.fillRect(-15, -4, 4, 4); // Bàn tay trái
            ctx.fillRect(11, -4, 4, 4); // Bàn tay phải
            
            // Cây bút trên tay phải (đang cặm cụi viết)
            const writeX = 12 + (Math.floor(t / 100) % 3);
            const writeY = -8 + (Math.floor(t / 150) % 2);
            ctx.fillStyle = '#1f2937'; ctx.fillRect(writeX, writeY-2, 2, 2); // Ngòi
            ctx.fillStyle = '#ef4444'; ctx.fillRect(writeX, writeY, 2, 6); // Thân bút đỏ

            // Draw original player character sprite sitting at the desk
            const customImg = window.customPlayerSprites && window.customPlayerSprites['playerUp'];
            if (customImg && customImg.complete && customImg.width > 0) {
              const drawW = 32;
              const drawH = (customImg.height / customImg.width) * drawW;
              drawPlayerSprite(ctx, customImg, drawW, drawH, -drawW / 2, -6, isHighlyStressed);
            }
            
            // Vẽ LẠI tựa lưng ghế đè lên phần dưới lưng người để tạo cảm giác bị che khuất
            ctx.fillStyle = '#d97706';
            ctx.fillRect(-8, 24, 16, 6); // Lưng tựa
            ctx.fillStyle = '#92400e'; ctx.fillRect(-8, 30, 16, 2); // Cạnh lưng tựa
            
            // Các ký hiệu bay bay (Toán...)
            if (t % 1000 < 500) {
              ctx.font = 'bold 12px "Courier New"';
              ctx.fillStyle = '#fff';
              ctx.fillText('∑', -20, -45 - (t / 60) % 10);
            }
            ctx.restore();
        } else {
          // Read / Study animations
          ctx.save();
          ctx.translate(pos.x + 16, pos.y + 24); // Ngồi xuống thấp hơn 1 chút

          // Vẽ nhân vật (hơi lùn đi để giả vờ đang ngồi)
          const customImg = window.customPlayerSprites['playerDown'];
          if (customImg && customImg.complete && customImg.width > 0) {
            const drawW = 32;
            const drawH = (customImg.height / customImg.width) * drawW;
            
            // Nếu đang ăn thì nhún nhảy nhẹ
            const chewY = anim.type === 'eat' ? Math.sin(t / 50) * 2 : 0;
            ctx.save();
            ctx.translate(0, chewY);
            drawPlayerSprite(ctx, customImg, drawW, drawH * 0.75, -drawW / 2, 4 - (drawH * 0.75), isHighlyStressed);
            ctx.restore();
          }

          if (anim.type === 'eat') {
            // Dĩa thức ăn
            if (anim.data) {
               ctx.fillStyle = anim.data.color || '#f59e0b';
               // Tên món ăn bay lên
               if (t % 800 < 600) {
                 ctx.font = 'bold 10px Arial';
                 ctx.fillStyle = anim.data.color || '#fff';
                 ctx.fillText(anim.data.label, -10, -15 - (t/100)%5);
               }
            }
            
            // Thìa đưa lên miệng
            const spoonY = -4 - Math.abs(Math.sin(t / 150)) * 10;
            ctx.fillStyle = '#cbd5e1'; // Thìa bạc
            ctx.fillRect(4, spoonY, 2, 8);
            ctx.beginPath(); ctx.arc(5, spoonY - 1, 3, 0, Math.PI*2); ctx.fill();
            
          } else if (anim.type === 'read') {
            // Đọc sách: Cuốn sách mở ra có animation lật trang
            const pageFlip = Math.floor(t / 400) % 2 === 0 ? 0 : -2;
            ctx.fillStyle = '#fff'; // Trang sách
            ctx.fillRect(-10, -8 + pageFlip, 10, 8); // Trái
            ctx.fillRect(0, -8, 10, 8); // Phải
            ctx.fillStyle = '#ccc'; // Dòng chữ
            ctx.fillRect(-8, -6 + pageFlip, 6, 1);
            ctx.fillRect(2, -6, 6, 1);
            ctx.fillStyle = '#8b5a2b'; // Bìa sách
            ctx.fillRect(-11, -8 + pageFlip, 1, 8);
            ctx.fillRect(10, -8, 1, 8);
          } else if (anim.type === 'code') {
            // Học Code: Dùng Laptop
            ctx.fillStyle = '#5c402d'; // Bàn gỗ
            ctx.fillRect(-14, -2, 28, 6);

            // Laptop base (Bàn phím)
            ctx.fillStyle = '#9ca3af'; // silver
            ctx.fillRect(-10, -4, 20, 6);

            // Laptop screen (Màn hình)
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(-10, -14, 20, 10);

            // Màn hình sáng lên
            ctx.fillStyle = 'rgba(74, 222, 128, 0.1)'; // ánh xanh
            ctx.fillRect(-10, -14, 20, 10);

            // Code lines trên màn hình (scrolling effect)
            ctx.fillStyle = '#4ade80'; // Text code màu xanh
            if (t % 800 < 400) {
              ctx.fillRect(-8, -12, 6, 2);
              ctx.fillRect(-8, -9, 12, 2);
              ctx.fillRect(-8, -6, 8, 2);
            } else {
              ctx.fillRect(-8, -12, 10, 2);
              ctx.fillRect(-8, -9, 8, 2);
              ctx.fillRect(-8, -6, 12, 2);
            }

            // Đôi bàn tay gõ phím nhúc nhích (Typing hands)
            const leftHandY = Math.floor(t / 100) % 2 === 0 ? -4 : -5;
            const rightHandY = Math.floor(t / 150) % 2 === 0 ? -4 : -5;
            ctx.fillStyle = '#fca5a5'; // Màu da tay
            ctx.fillRect(-6, leftHandY, 4, 3);
            ctx.fillRect(2, rightHandY, 4, 3);
          } else if (anim.type === 'pe') {
            // Thể dục: Nâng tạ (Weightlifting)
            const liftY = -15 + Math.sin(t / 200) * 5; // Tạ nhấp nhô theo nhịp

            // Thanh đòn tạ (barbell)
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(-18, liftY, 36, 3);

            // Quả tạ hai bên (weights)
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(-20, liftY - 4, 6, 11);
            ctx.fillRect(14, liftY - 4, 6, 11);
            ctx.fillRect(-23, liftY - 2, 3, 7);
            ctx.fillRect(20, liftY - 2, 3, 7);

            // Bàn tay cầm tạ
            ctx.fillStyle = '#fca5a5';
            ctx.fillRect(-8, liftY, 4, 4);
            ctx.fillRect(4, liftY, 4, 4);

            // Giọt mồ hôi văng ra khi tập nặng
            if (t % 600 < 300) {
              ctx.fillStyle = '#60a5fa';
              ctx.beginPath(); ctx.arc(-12, -20 - (t / 50) % 5, 1.5, 0, Math.PI * 2); ctx.fill();
              ctx.beginPath(); ctx.arc(12, -18 - (t / 50) % 5, 1.5, 0, Math.PI * 2); ctx.fill();
            }
          } else if (anim.type === 'physics') {
            // Vật lý: Con lắc Newton (Newton's Cradle)
            ctx.fillStyle = '#5c402d'; ctx.fillRect(-14, -2, 28, 6); // Bàn gỗ

            // Khung giá đỡ
            ctx.strokeStyle = '#9ca3af';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(-10, -2); ctx.lineTo(-10, -18); ctx.lineTo(10, -18); ctx.lineTo(10, -2); ctx.stroke();

            // Tính toán dao động con lắc
            const swing = Math.sin(t / 120) * 8; // Vận tốc lắc
            const leftSwing = swing < 0 ? swing : 0;
            const rightSwing = swing > 0 ? swing : 0;

            ctx.fillStyle = '#d1d5db'; // Màu bi sắt
            ctx.strokeStyle = '#d1d5db'; // Màu dây
            ctx.lineWidth = 1;

            // Bi 1 (Trái) - Bị văng lên khi swing âm
            const lX = -5 + leftSwing;
            const lY = -6 - Math.abs(leftSwing) * 0.6;
            ctx.beginPath(); ctx.moveTo(-5, -18); ctx.lineTo(lX, lY); ctx.stroke();
            ctx.beginPath(); ctx.arc(lX, lY, 2.5, 0, Math.PI * 2); ctx.fill();

            // Bi 2 (Giữa) - Đứng im
            ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, -6); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, -6, 2.5, 0, Math.PI * 2); ctx.fill();

            // Bi 3 (Phải) - Bị văng lên khi swing dương
            const rX = 5 + rightSwing;
            const rY = -6 - Math.abs(rightSwing) * 0.6;
            ctx.beginPath(); ctx.moveTo(5, -18); ctx.lineTo(rX, rY); ctx.stroke();
            ctx.beginPath(); ctx.arc(rX, rY, 2.5, 0, Math.PI * 2); ctx.fill();
          } else if (anim.type === 'science') {
            // Khoa học (Hóa/Lý): Bình thí nghiệm
            ctx.fillStyle = '#5c402d'; // Bàn gỗ
            ctx.fillRect(-14, -2, 28, 6);

            // Flask
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.moveTo(-4, -12);
            ctx.lineTo(4, -12);
            ctx.lineTo(8, -2);
            ctx.lineTo(-8, -2);
            ctx.closePath();
            ctx.fill();

            // Liquid
            ctx.fillStyle = Math.floor(t / 300) % 2 === 0 ? '#34d399' : '#f472b6'; // Đổi màu
            ctx.beginPath();
            ctx.moveTo(-2, -6);
            ctx.lineTo(2, -6);
            ctx.lineTo(7, -2);
            ctx.lineTo(-7, -2);
            ctx.closePath();
            ctx.fill();

            // Bubbles
            if (t % 400 < 200) {
              ctx.fillStyle = '#fff';
              ctx.beginPath();
              ctx.arc(0, -8 - (t / 50 % 10), 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (anim.type === 'math') {
            // Học Toán: Bàn, giấy, compa/thước kẻ
            ctx.fillStyle = '#5c402d'; ctx.fillRect(-14, -2, 28, 6);
            ctx.fillStyle = '#fff'; ctx.fillRect(-8, -8, 16, 12);

            // Vẽ hình học (tam giác, vuông) mờ mờ trên giấy
            ctx.strokeStyle = '#4b5563';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(-2, -5); ctx.lineTo(4, -5); ctx.lineTo(1, -2); ctx.closePath(); ctx.stroke();

            // Tay cầm thước kẻ nhúc nhích
            const writeX = -6 + (Math.floor(t / 200) % 8);
            ctx.fillStyle = '#60a5fa'; // Thước màu xanh
            ctx.fillRect(writeX, -6, 2, 8);

            // Ký hiệu Toán học bay lên
            if (t % 800 < 400) {
              ctx.font = 'bold 12px "Courier New"';
              ctx.fillStyle = '#fff';
              ctx.fillText('π', -20, -15 - (t / 50) % 10);
              ctx.fillText('∫', 15, -10 - ((t + 200) / 50) % 10);
            }
          } else if (anim.type === 'literature') {
            // Học Văn: Viết chữ liên tục
            ctx.fillStyle = '#5c402d'; ctx.fillRect(-14, -2, 28, 6);
            ctx.fillStyle = '#fff'; ctx.fillRect(-6, -6, 12, 10);

            // Nét chữ hiện ra
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(-4, -4, 8, 1);
            ctx.fillRect(-4, -2, 6, 1);
            if (t % 1000 > 500) ctx.fillRect(-4, 0, 4, 1);

            // Bút viết
            const writeX = -4 + (Math.floor(t / 100) % 6);
            ctx.fillStyle = '#374151'; // Bút mực đen
            ctx.fillRect(writeX, -2, 2, 6);

            // Chữ cái bay
            if (t % 1000 < 500) {
              ctx.font = 'italic 14px "Times New Roman"';
              ctx.fillStyle = '#fff';
              ctx.fillText('abc...', -20, -15 - (t / 60) % 10);
            }
          } else if (anim.type === 'english') {
            // Học Tiếng Anh: Đọc sách từ vựng
            ctx.fillStyle = '#5c402d'; ctx.fillRect(-14, -2, 28, 6);

            const pageFlip = Math.floor(t / 400) % 2 === 0 ? 0 : -2;
            ctx.fillStyle = '#fff'; // Trang sách
            ctx.fillRect(-10, -8 + pageFlip, 10, 8); // Trái
            ctx.fillRect(0, -8, 10, 8); // Phải
            ctx.fillStyle = '#8b5a2b'; // Bìa sách
            ctx.fillRect(-11, -8 + pageFlip, 1, 8);
            ctx.fillRect(10, -8, 1, 8);

            // Ký hiệu tiếng anh
            if (t % 800 < 400) {
              ctx.font = 'bold 12px "Arial"';
              ctx.fillStyle = '#fff';
              ctx.fillText('A', -20, -15 - (t / 50) % 10);
              ctx.fillText('Z', 15, -10 - ((t + 200) / 50) % 10);
            }
          } else if (anim.type === 'history') {
            // Học Lịch sử: Cuốn sách cũ và quả địa cầu
            ctx.fillStyle = '#5c402d'; ctx.fillRect(-14, -2, 28, 6);

            // Quả địa cầu nhỏ
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath(); ctx.arc(-6, -6, 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#22c55e'; // Đất liền
            ctx.beginPath(); ctx.arc(-7, -7, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(-5, -4, 1.5, 0, Math.PI * 2); ctx.fill();
            // Chân đế
            ctx.fillStyle = '#9ca3af'; ctx.fillRect(-7, -1, 2, 3);

            // Sách cũ
            ctx.fillStyle = '#fef3c7'; // Giấy ngả vàng
            ctx.fillRect(2, -6, 8, 6);

            // Kính lúp di chuyển
            const lookX = 2 + (Math.floor(t / 200) % 6);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(lookX, -3, 2, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = '#374151'; ctx.fillRect(lookX + 2, -2, 2, 4);
          }

          ctx.restore();
        }
      } else {
        // Sprite with walk animation frames
        ctx.save();
        ctx.translate(pos.x + 16, pos.y + 16);

        let spriteKey = 'player' + pos.facing.charAt(0).toUpperCase() + pos.facing.slice(1);
        if (isMoving) {
          const cycle = Math.floor(Date.now() / 200) % 4;
          if (cycle === 1) spriteKey += 'Walk1';
          else if (cycle === 3) spriteKey += 'Walk2';
        }

        // Load custom PNG frames (all 12 directions from CSS sprite sheet)
        if (typeof window.customPlayerSprites === 'undefined') {
          window.customPlayerSprites = {};
          const frames = {
            playerDown: 'player',
            playerDownWalk1: 'player_down_walk1',
            playerDownWalk2: 'player_down_walk2',
            playerUp: 'player_up',
            playerUpWalk1: 'player_up_walk1',
            playerUpWalk2: 'player_up_walk2',
            playerLeft: 'player_left',
            playerLeftWalk1: 'player_left_walk1',
            playerLeftWalk2: 'player_left_walk2',
            playerRight: 'player_right',
            playerRightWalk1: 'player_right_walk1',
            playerRightWalk2: 'player_right_walk2',
          };
          for (const [key, file] of Object.entries(frames)) {
            const img = new Image();
            img.src = `/${file}.png`;
            window.customPlayerSprites[key] = img;
          }
        }

        const customImg = window.customPlayerSprites[spriteKey];
        if (customImg && customImg.complete && customImg.width > 0) {
          const drawW = 32;
          const drawH = (customImg.height / customImg.width) * drawW;
          // Anchor the bottom of the sprite to the shadow
          drawPlayerSprite(ctx, customImg, drawW, drawH, -drawW / 2, 12 - drawH, isHighlyStressed);
        } else {
          // Fallback
          ctx.fillStyle = 'red';
          ctx.fillRect(-16, -16, 32, 32);
        }
        ctx.restore();
      }

      if (anim && anim.type === 'water') {
        const t = performance.now() - anim.start;
        const plantX = 2 * tileSize;
        const plantY = 2 * tileSize;

        ctx.fillStyle = '#3b82f6';
        for (let i = 0; i < 3; i++) {
          const dropY = (t / 10 + i * 15) % 40;
          ctx.beginPath();
          ctx.arc(plantX + (i - 1) * 8, plantY - 30 + dropY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      if (anim && anim.type === 'shower') {
         const t = performance.now() - anim.start;
         
         // Vẽ thêm nước bồn tắm che ngang người
         ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
         ctx.fillRect(25.5 * tileSize, 2.5 * tileSize, 5 * tileSize, 3 * tileSize); // Nước che ngập người
         
         // Draw water falling from top
         ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
         for(let i=0; i<10; i++) {
            const dropX = 26.5 * tileSize + (i * 13) % (3 * tileSize);
            const dropY = 2 * tileSize + ((t / 5 + i * 20) % (2 * tileSize));
            ctx.fillRect(dropX, dropY, 2, 4);
         }
         // Soap bubbles
         ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
         for(let i=0; i<5; i++) {
            const bx = 28 * tileSize + Math.sin(t/200 + i)*20;
            const by = 4 * tileSize - ((t/20 + i*10)%30);
            ctx.beginPath(); ctx.arc(bx, by, 2 + (i%2), 0, Math.PI*2); ctx.fill();
         }
      }

      if (anim && anim.type === 'eat') {
        const dx = 6 * tileSize, dy = 17 * tileSize, dw = 4 * tileSize, dh = 3 * tileSize;
        // The third arg to triggerPlayerAnimation is anim.data, which contains { color, label }. We will fallback to anim.data itself or 'salad'
        const foodId = anim.data?.id || (typeof anim.data === 'string' ? anim.data : 'salad');
        
        // Vẽ Đĩa Đồ Ăn to ở giữa bàn
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(dx + dw/2, dy + dh/2, 14, 0, Math.PI*2); ctx.fill();
        ctx.shadowColor = 'transparent';
        
        if (foodId === 'salad') {
            ctx.fillStyle = '#22c55e'; // Xanh lá
            for(let i=0; i<5; i++) {
               ctx.beginPath(); ctx.arc(dx + dw/2 - 4 + Math.random()*8, dy + dh/2 - 4 + Math.random()*8, 4, 0, Math.PI*2); ctx.fill();
            }
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(dx + dw/2, dy + dh/2, 3, 0, Math.PI*2); ctx.fill(); // Cà chua
        } else if (foodId === 'pizza' || foodId === 'burger') {
            ctx.fillStyle = '#eab308'; // Vàng cam
            ctx.beginPath(); ctx.moveTo(dx+dw/2, dy+dh/2); ctx.arc(dx+dw/2, dy+dh/2, 12, -Math.PI/4, Math.PI/1.5); ctx.fill();
            ctx.fillStyle = '#ef4444'; // Xúc xích
            ctx.beginPath(); ctx.arc(dx+dw/2+4, dy+dh/2+4, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(dx+dw/2+2, dy+dh/2+8, 2, 0, Math.PI*2); ctx.fill();
        } else if (foodId === 'pho' || foodId === 'apple') {
            ctx.fillStyle = '#ef4444'; // Táo đỏ tròn
            ctx.beginPath(); ctx.arc(dx + dw/2, dy + dh/2, 10, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#22c55e'; // Cuống lá
            ctx.beginPath(); ctx.arc(dx + dw/2, dy + dh/2 - 10, 3, 0, Math.PI*2); ctx.fill();
        } else {
            // Nước tăng lực (lon)
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(dx + dw/2 - 6, dy + dh/2 - 10, 12, 20);
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(dx + dw/2 - 6, dy + dh/2 - 12, 12, 2);
        }

        // Hoạt ảnh nhai (Mlem mlem)
        const t = performance.now();
        if (t % 800 < 400) {
            ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Arial';
            ctx.fillText('Nhom nhom...', dx + dw/2 + 20, dy + dh/2 - 15);
        }
      }

      // ================= CÁC HIỆU ỨNG ÁNH SÁNG & KHÔNG GIAN BỔ SUNG =================
      if (currentLocation === 'home') {
        const t = performance.now();
        
        // 1. Ánh sáng từ PC, TV, Tủ lạnh (Ambient Glow)
        // PC (r=1..3, c=3..8) -> trung tâm x=5.5, y=2
        const pcGlow = ctx.createRadialGradient(5.5 * tileSize, 2 * tileSize, 0, 5.5 * tileSize, 2 * tileSize, 5 * tileSize);
        pcGlow.addColorStop(0, 'rgba(96, 165, 250, 0.15)');
        pcGlow.addColorStop(1, 'rgba(96, 165, 250, 0)');
        ctx.fillStyle = pcGlow; ctx.fillRect(1 * tileSize, 0, 9 * tileSize, 7 * tileSize);
        
        // Tủ lạnh (r=14..18, c=1..3) -> trung tâm x=2, y=16
        const fridgeGlow = ctx.createRadialGradient(2 * tileSize, 16 * tileSize, 0, 2 * tileSize, 16 * tileSize, 5 * tileSize);
        fridgeGlow.addColorStop(0, 'rgba(186, 230, 253, 0.15)');
        fridgeGlow.addColorStop(1, 'rgba(186, 230, 253, 0)');
        ctx.fillStyle = fridgeGlow; ctx.fillRect(0, 11 * tileSize, 7 * tileSize, 10 * tileSize);
        
        // TV (r=15..16, c=23..25) -> trung tâm x=24, y=15.5
        const tvGlow = ctx.createRadialGradient(24 * tileSize, 15.5 * tileSize, 0, 24 * tileSize, 15.5 * tileSize, 6 * tileSize);
        tvGlow.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
        tvGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = tvGlow; ctx.fillRect(18 * tileSize, 10 * tileSize, 12 * tileSize, 11 * tileSize);

        // 2. Cửa Sổ & Ánh nắng (Sunlight Rays) hắt từ tường phải phòng khách
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(31 * tileSize, 13 * tileSize); // Top of window
        ctx.lineTo(31 * tileSize, 18 * tileSize); // Bottom of window
        ctx.lineTo(20 * tileSize, 24 * tileSize); // Spread on floor
        ctx.lineTo(10 * tileSize, 24 * tileSize);
        ctx.closePath();
        
        const rayGrad = ctx.createLinearGradient(31 * tileSize, 13 * tileSize, 15 * tileSize, 24 * tileSize);
        rayGrad.addColorStop(0, 'rgba(253, 230, 138, 0.25)'); // Vàng ấm
        rayGrad.addColorStop(1, 'rgba(253, 230, 138, 0)');
        ctx.fillStyle = rayGrad;
        ctx.fill();
        
        // Bụi lơ lửng trong nắng (Dust particles)
        ctx.clip(); // Mask the dust particles to ONLY appear inside the sunlight!
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 30; i++) {
           const px = 10 * tileSize + ((t/40 + i*73) % (21 * tileSize));
           const py = 13 * tileSize + ((t/30 + i*51) % (11 * tileSize));
           ctx.fillRect(px, py, 1.5, 1.5);
        }
        ctx.restore();
      }

      if (currentLocation === 'classroom') {
         ctx.save();
         // === 4. ÁNH SÁNG & KHÔNG KHÍ ===
         // Vệt nắng
         ctx.beginPath();
         ctx.moveTo(16 * tileSize, 2 * tileSize); ctx.lineTo(16 * tileSize, 15 * tileSize);
         ctx.lineTo(2 * tileSize, 28 * tileSize); ctx.lineTo(2 * tileSize, 10 * tileSize);
         ctx.closePath();
         const rayGrad = ctx.createLinearGradient(16 * tileSize, 2 * tileSize, 2 * tileSize, 28 * tileSize);
         rayGrad.addColorStop(0, 'rgba(253, 230, 138, 0.15)');
         rayGrad.addColorStop(1, 'rgba(253, 230, 138, 0)');
         ctx.fillStyle = rayGrad; ctx.fill();

         // Đèn phòng GV
         const staffGlow = ctx.createRadialGradient(31 * tileSize, 8 * tileSize, 0, 31 * tileSize, 8 * tileSize, 8 * tileSize);
         staffGlow.addColorStop(0, 'rgba(253, 230, 138, 0.15)'); staffGlow.addColorStop(1, 'rgba(253, 230, 138, 0)');
         ctx.fillStyle = staffGlow; ctx.fillRect(23 * tileSize, 1 * tileSize, 15 * tileSize, 14 * tileSize);

         // Đèn bồn rửa nhà vệ sinh
         const washGlow = ctx.createRadialGradient(28 * tileSize, 18 * tileSize, 0, 28 * tileSize, 18 * tileSize, 5 * tileSize);
         washGlow.addColorStop(0, 'rgba(186, 230, 253, 0.15)'); washGlow.addColorStop(1, 'rgba(186, 230, 253, 0)');
         ctx.fillStyle = washGlow; ctx.fillRect(23 * tileSize, 17 * tileSize, 15 * tileSize, 11 * tileSize);

         ctx.restore();
      }

      if (mapWrapperRef.current && mapWrapperRef.current.parentElement) {
        const screenW = mapWrapperRef.current.parentElement.clientWidth;
        const screenH = mapWrapperRef.current.parentElement.clientHeight;
        const playerScreenX = (pos.x + 16) * 1.5;
        const playerScreenY = (pos.y + 16) * 1.5;
        const camX = screenW / 2 - playerScreenX;
        const camY = screenH / 2 - playerScreenY;

        const mapW = cols * tileSize * 1.5;
        const mapH = rows * tileSize * 1.5;
        let finalCamX = camX;
        let finalCamY = camY;

        if (mapW > screenW) {
          finalCamX = Math.min(0, Math.max(screenW - mapW, finalCamX));
        } else {
          finalCamX = (screenW - mapW) / 2;
        }

        if (mapH > screenH) {
          finalCamY = Math.min(0, Math.max(screenH - mapH, finalCamY));
        } else {
          finalCamY = (screenH - mapH) / 2;
        }

        mapWrapperRef.current.style.transform = `translate(${finalCamX}px, ${finalCamY}px) scale(1.5)`;

        if (promptRef.current) {
          const promptX = (pos.x + 16) * 1.5 + finalCamX;
          const promptY = (pos.y - 16) * 1.5 + finalCamY;
          promptRef.current.style.transform = `translate(calc(-50% + ${promptX}px), calc(-50% + ${promptY}px))`;
          
          if (activeAnimRef.current) {
            promptRef.current.style.opacity = '0';
            if (activeAnimRef.current.type === 'study' && studyPromptRef.current) {
               studyPromptRef.current.style.opacity = '1';
            } else if (studyPromptRef.current) {
               studyPromptRef.current.style.opacity = '0';
            }
          } else {
            promptRef.current.style.opacity = ''; // Trả lại quyền điều khiển cho React class
            if (studyPromptRef.current) studyPromptRef.current.style.opacity = '0';
          }
        }
      }

    };

    render();

    // Interaction polling interval (runs slower than 60fps)
    const interactionPoll = setInterval(() => {
      const pGridX = Math.floor((posRef.current.x + 16) / tileSize);
      const pGridY = Math.floor((posRef.current.y + 16) / tileSize);

      let fObj = null;
      let fNpc = null;

      if (currentLocation === 'home') {
        // Trả lại vùng tương tác nguyên bản cho SVG gốc (ĐƯỢC MỞ RỘNG ĐỂ DỄ BẤM HƠN):
        // PC (Laptop SVG) - mở rộng ra xung quanh bàn
        if ((pGridX >= 2 && pGridX <= 9) && (pGridY >= 2 && pGridY <= 5)) fObj = { type: 'pc', label: 'Nhật ký · [E] Mở máy tính' };
        // Giường (Bed SVG) - mở rộng ra cả 4 phía của giường (rất nhạy)
        else if ((pGridX >= 3 && pGridX <= 8) && (pGridY >= 5 && pGridY <= 10)) fObj = { type: 'bed', label: 'Ngủ' };
        // Cây (Plant SVG) - mở rộng xung quanh
        else if ((pGridX >= 1 && pGridX <= 3) && (pGridY >= 1 && pGridY <= 4)) fObj = { type: 'plant', label: 'Tưới cây' };
        else if (pGridX >= 24 && pGridX <= 31 && pGridY >= 2 && pGridY <= 7) fObj = { type: 'shower', label: 'Tắm rửa' };
        else if (pGridX >= 1 && pGridX <= 4 && pGridY >= 13 && pGridY <= 17) fObj = { type: 'fridge', label: 'Mở tủ lạnh' };
        else if (pGridX >= 5 && pGridX <= 10 && pGridY >= 16 && pGridY <= 20) fObj = { type: 'dining_table', label: 'Dùng bữa' };
        else if ((pGridX >= 21 && pGridX <= 25 && pGridY >= 22) || (pGridX >= 7 && pGridX <= 10 && pGridY >= 11 && pGridY <= 13)) fObj = { type: 'door', label: '[E] Ra ngoài' };
      }
      else if (currentLocation === 'classroom') {
        if (pGridX >= 18 && pGridX <= 21 && pGridY >= 27) {
          fObj = { type: 'door', label: '[E] Ra ngoài' };
        } else if (pGridX >= 25 && pGridX <= 31 && pGridY >= 17 && pGridY <= 20) {
          fObj = { type: 'lavabo', label: 'Rửa mặt' };
        } else if (pGridX >= 25 && pGridX <= 35 && pGridX % 2 !== 0 && pGridY >= 23 && pGridY <= 25) {
          if (pGridX !== 27 && pGridX !== 31) { // Không phải buồng bị khóa
            fObj = { type: 'toilet', label: 'Đi vệ sinh' };
          }
        } else if ([10, 14, 18, 22, 26].includes(pGridY) && ((pGridX >= 3 && pGridX <= 6) || (pGridX >= 11 && pGridX <= 14))) {
          fObj = { type: 'classroom_chair', label: 'Học bài', gridX: pGridX, gridY: pGridY };
        }
      }
      else if (currentLocation === 'hospital_room') {
        if (pGridX >= 12 && pGridX <= 19 && pGridY >= 17 && pGridY <= 20) fObj = { type: 'doctor_desk', label: 'Khám bệnh' };
        else if (pGridX >= 13 && pGridX <= 18 && pGridY >= 21) fObj = { type: 'door', label: '[E] Ra ngoài' };
      }
      else if (currentLocation === 'library_room') {
        if (pGridX >= 7 && pGridX <= 12 && pGridY >= 2 && pGridY <= 5) fObj = { type: 'library_desk', label: 'Đọc sách' };
        else if (pGridX >= 8 && pGridX <= 11 && pGridY >= 13) fObj = { type: 'door', label: '[E] Ra ngoài' };
      }
      else if (currentLocation === 'main') {
        if (pGridX >= 4 && pGridX <= 5 && pGridY >= 11 && pGridY <= 12) {
          fObj = { type: 'house_door', label: 'Vào nhà' };
        } else if (pGridX >= 36 && pGridX <= 38 && pGridY >= 14 && pGridY <= 16) {
          fObj = { type: 'library_door', label: 'Vào thư viện' };
        } else if (pGridX >= 21 && pGridX <= 23 && pGridY >= 11 && pGridY <= 13) {
          fObj = { type: 'school_door', label: 'Vào trường' };
        } else if (pGridX >= 15 && pGridX <= 17 && pGridY >= 23 && pGridY <= 25) {
          fObj = { type: 'hospital_door', label: 'Vào bệnh viện' };
        }
      }
      setNearbyObj(fObj);

      const visibleNpcs = getVisibleNpcs();
      for (const npc of visibleNpcs) {
        if (npc.locations && !npc.locations.includes(currentLocation)) continue;
        if (Math.abs(pGridX - npc.x) <= 1 && Math.abs(pGridY - npc.y) <= 1) {
          fNpc = npc; break;
        }
      }
      setNearbyNpc(fNpc);

    }, 200);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(interactionPoll);
    };
  }, [mapData, currentLocation, getVisibleNpcs, schedule.event]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4"
      style={{ background: 'var(--color-bg-deep)' }}>

      {/* CRT Monitor Frame */}
      <div className={`relative w-full h-full crt-frame crt-glow overflow-hidden ${isHighlyStressed ? 'chromatic-aberration' : ''}`}
        style={{
          background: 'var(--color-bg-surface)',
          border: '3px solid var(--color-border-light)',
        }}>

        {/* CRT Effects */}
        <div className="crt-scanlines absolute inset-0 z-50 pointer-events-none"></div>
        <div className="crt-vignette absolute inset-0 z-50 pointer-events-none"></div>

        {/* Location Label */}
        <div className="absolute top-2 left-2 z-40 flex items-center gap-2 px-3 py-1.5 rounded-md shadow-lg"
          style={{ background: 'rgba(20, 20, 30, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)' }}>
          <span style={{ fontSize: '14px' }}>{locInfo.icon}</span>
          <span style={{ fontSize: '11px', color: '#e2e8f0', fontWeight: 600, letterSpacing: '0.05em' }}>
            {locInfo.name}
          </span>
        </div>

        {/* The true Pixel Engine Canvas */}
        <div className="absolute inset-0 bg-black overflow-hidden" style={{ width: '100%', height: '100%' }}>
          <div
            ref={mapWrapperRef}
            style={{
              transform: 'scale(1.5)',
              transformOrigin: 'top left',
              position: 'absolute',
              width: 55 * 32,
              height: 30 * 32
            }}
          >
            <canvas
              ref={canvasRef}
              className="shadow-2xl"
              style={{ imageRendering: 'pixelated' }}
            />
            <SchoolOverlay />
            {currentLocation === 'main' && (
              <>
                <div className="absolute" style={{ left: 1 * 32, top: 4 * 32, zIndex: 16 }}>
                  <HouseBuilding />
                </div>
                <div className="absolute" style={{ left: 34 * 32, top: 7 * 32, zIndex: 16 }}>
                  <LibraryBuilding />
                </div>
                <div className="absolute" style={{ left: 17 * 32, top: 20 * 32, zIndex: 16 }}>
                  <HospitalBuilding />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Interaction Prompt Overlay */}
        <div
          ref={promptRef}
          className={`absolute top-0 left-0 z-50 pointer-events-none transition-opacity duration-200 ${nearbyNpc || nearbyObj ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: 'translate(0, 0)' }}
        >
          <div className="pixel-bounce whitespace-nowrap"
            style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#fff',
              background: '#3b82f6',
              padding: '6px 12px',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              border: '2px solid #60a5fa'
            }}>
            [SPACE] {nearbyObj ? nearbyObj.label : (nearbyNpc ? 'Nói chuyện' : '')}
          </div>
        </div>

        {/* Study Prompt Overlay */}
        <div
          ref={studyPromptRef}
          className="absolute top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-opacity duration-200 opacity-0"
        >
          <div className="pixel-bounce whitespace-nowrap"
            style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#fff',
              background: '#eab308',
              padding: '6px 12px',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              border: '2px solid #ca8a04'
            }}>
            [E] Rời khỏi bàn
          </div>
        </div>

        {/* Controls hint */}
        <div className="absolute bottom-2 right-2 z-40 px-2 py-1 rounded bg-black/40 backdrop-blur-sm border border-white/10"
          style={{ fontSize: '9px', color: '#cbd5e1', letterSpacing: '0.05em' }}>
          WASD / SPACE / E
        </div>
        
        {/* Teacher Lecture Frame */}
        {(schedule.event === 'class_am' || schedule.event === 'class_pm') && currentLocation === 'classroom' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl bg-slate-900/90 border-2 border-slate-600 rounded-lg shadow-2xl p-4 pointer-events-none transition-opacity duration-500 flex flex-col items-center justify-center text-center backdrop-blur-sm z-50">
            <div className="text-yellow-400 font-bold mb-1 text-sm border-b border-slate-600 pb-1 inline-block">BÀI GIẢNG ĐANG DIỄN RA</div>
            <div className="text-white font-serif text-base italic typewriter-effect w-full truncate">
              {schedule.event === 'class_am' 
                ? "Cô Giáo: 'Các em chú ý, đạo hàm của hàm số này sẽ bằng không khi x tiến tới...'" 
                : "Cô Giáo: 'Tác phẩm này phản ánh sâu sắc hiện thực xã hội đương thời... hãy ghi chép cẩn thận!'"}
            </div>
            <div className="absolute -top-3 right-4 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded shadow">LIVE</div>
          </div>
        )}
      </div>
    </div>
  );
}
