import React, { useEffect, useRef, useState } from 'react';
import useGameStore, { MAPS } from '../store/useGameStore';
import audioSystem from '../utils/audioSystem';
import roomLayout from '../config/RoomLayout.js';
import SchoolOverlay from './SchoolOverlay';
import LibraryBuilding from './LibraryBuilding';
import HospitalBuilding from './HospitalBuilding';

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
        const r = data[i], g = data[i+1], b = data[i+2];
        // Strictly remove ONLY the exact background color (tolerance 2)
        if (Math.abs(r - bgR) <= 2 && Math.abs(g - bgG) <= 2 && Math.abs(b - bgB) <= 2) {
          data[i+3] = 0;
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
  bedroom:   { icon: '🛏️', name: 'Phòng riêng' },
  home:      { icon: '🏠', name: 'Nhà' },
  street:    { icon: '🚶', name: 'Đường phố' },
};

const tintCanvas = document.createElement('canvas');
const tintCtx = tintCanvas.getContext('2d');

const drawPlayerSprite = (ctx, img, w, h, x, y, isStressed) => {
  if (!img || !img.complete || img.width === 0) return;
  
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
    ctx.fillRect(x + w/2 - 6, y + 16, 3, 4);
    ctx.fillRect(x + w/2 + 3, y + 16, 3, 4);
  } else {
    ctx.drawImage(img, x, y, w, h);
  }
};

export default function GameCanvas() {
  const canvasRef = useRef(null);
  const promptRef = useRef(null);
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
    window.triggerPlayerAnimation = (type, duration = 3000) => {
      activeAnimRef.current = { type, start: performance.now() };
      keysRef.current = { w: false, a: false, s: false, d: false }; // Stop movement
      setTimeout(() => {
        if(activeAnimRef.current?.type === type) activeAnimRef.current = null;
      }, duration);
    };
  }, [currentLocation, initialPos]);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (activeAnimRef.current) return; // Block input during animations
      
      const key = e.key.toLowerCase();
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
                setTimeout(() => { if(activeAnimRef.current?.type === 'sleep') activeAnimRef.current = null; }, 3000);
                useGameStore.getState().rest();
              } else if (obj.type === 'plant') {
                activeAnimRef.current = { type: 'water', start: performance.now() };
                keysRef.current = { w: false, a: false, s: false, d: false }; // Stop movement
                setTimeout(() => { if(activeAnimRef.current?.type === 'water') activeAnimRef.current = null; }, 2000);
                useGameStore.getState().waterPlant();
              } else if (obj.type === 'library') {
                audioSystem.playClick();
                useGameStore.getState().openLibraryModal();
              } else if (obj.type === 'school') {
                audioSystem.playClick();
                useGameStore.getState().openSchoolModal();
              } else if (obj.type === 'hospital') {
                audioSystem.playClick();
                useGameStore.getState().openHospitalModal();
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
    const speed = 3.0; // Increased speed for better gameplay
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
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
            for(let x=0; x<32; x+=2) {
              for(let y=0; y<32; y+=2) {
                cx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                cx.fillRect(x, y, 2, 2);
              }
            }
            // Điểm xuyết các khóm cỏ (shadow + highlight)
            for(let i=0; i<6; i++) {
              const gx = Math.random()*26+2; const gy = Math.random()*26+2;
              cx.fillStyle = '#4c8c25'; cx.fillRect(gx+1, gy+2, 2, 1); // Shadow
              cx.fillStyle = '#8ce851'; cx.fillRect(gx, gy, 1, 2);     // Blade 1
              cx.fillStyle = '#a6f571'; cx.fillRect(gx+2, gy-1, 1, 3); // Blade 2
            }
            // Vài bông hoa nhỏ li ti (15% cơ hội mỗi ô 32x32)
            if (Math.random() < 0.15) {
              cx.fillStyle = Math.random() > 0.5 ? '#fff' : '#fbbf24';
              const fx = Math.random()*24+4, fy = Math.random()*24+4;
              cx.fillRect(fx, fy, 2, 2);
              cx.fillStyle = '#f59e0b'; cx.fillRect(fx+1, fy+1, 1, 1); // Nhụy hoa
            }
          }),
          
          path: createTex(32, 32, cx => {
            // Nền đất
            const groundColors = ['#d2a979', '#c59d6e', '#dcb484'];
            for(let x=0; x<32; x+=2) {
              for(let y=0; y<32; y+=2) {
                cx.fillStyle = groundColors[Math.floor(Math.random() * groundColors.length)];
                cx.fillRect(x, y, 2, 2);
              }
            }
            // Viền tối (tạo cảm giác mòn lõm xuống)
            cx.fillStyle = 'rgba(100, 70, 40, 0.1)';
            cx.fillRect(0, 0, 32, 2); cx.fillRect(0, 30, 32, 2);
            cx.fillRect(0, 0, 2, 32); cx.fillRect(30, 0, 2, 32);
            // Vài viên sỏi rải rác
            for(let i=0; i<8; i++) {
              const rx = Math.random()*28+2, ry = Math.random()*28+2;
              cx.fillStyle = 'rgba(0,0,0,0.15)'; cx.fillRect(rx, ry+1, 2, 1); // Bóng sỏi
              cx.fillStyle = Math.random()>0.5 ? '#9ca3af' : '#d1d5db'; // Màu đá
              cx.fillRect(rx, ry, 2, 1 + Math.floor(Math.random()*2));
            }
          }),
          
          concrete: createTex(32, 32, cx => {
            // Lát gạch/đá (4 viên 16x16 trong 1 ô 32x32)
            cx.fillStyle = '#8a949e'; cx.fillRect(0,0,32,32);
            const tileSize = 16;
            for(let ty=0; ty<2; ty++) {
              for(let tx=0; tx<2; tx++) {
                const ox = tx*tileSize, oy = ty*tileSize;
                // Highlight (góc trên-trái mỗi viên)
                cx.fillStyle = '#a8b4c0'; cx.fillRect(ox, oy, tileSize-1, 1); cx.fillRect(ox, oy, 1, tileSize-1);
                // Shadow (góc dưới-phải mỗi viên)
                cx.fillStyle = '#6e7782'; cx.fillRect(ox, oy+tileSize-1, tileSize, 1); cx.fillRect(ox+tileSize-1, oy, 1, tileSize);
                // Chấm nhiễu nhám của mặt đá
                for(let i=0; i<15; i++) {
                  cx.fillStyle = Math.random()>0.5 ? '#939da7' : '#7b858e';
                  cx.fillRect(ox + 2 + Math.random()*(tileSize-4), oy + 2 + Math.random()*(tileSize-4), 1, 1);
                }
              }
            }
          }),
          
          tree: createTex(32, 48, cx => {
            // Bóng cây dưới mặt đất
            cx.fillStyle = 'rgba(0,0,0,0.3)';
            cx.beginPath(); cx.ellipse(16, 42, 12, 5, 0, 0, Math.PI*2); cx.fill();
            
            // Thân cây gỗ (có vân sáng tối)
            cx.fillStyle = '#5c3a21'; cx.fillRect(12, 20, 8, 24);
            cx.fillStyle = '#3e2412'; cx.fillRect(18, 20, 2, 24); // Đổ bóng bên phải
            cx.fillStyle = '#7a4f2f'; cx.fillRect(12, 20, 1, 24); // Phản quang bên trái
            
            // Hàm vẽ 1 khóm lá 3D phong cách Pixel
            const drawLeafCluster = (x, y, r) => {
              // Vòng tối (đáy)
              cx.fillStyle = '#2d5a15';
              cx.beginPath(); cx.arc(x, y+2, r, 0, Math.PI*2); cx.fill();
              // Vòng cơ bản
              cx.fillStyle = '#4c8c25';
              cx.beginPath(); cx.arc(x, y, r, 0, Math.PI*2); cx.fill();
              // Vòng highlight rực rỡ
              cx.fillStyle = '#76c437';
              cx.beginPath(); cx.arc(x-1, y-1, r-2, 0, Math.PI*2); cx.fill();
              // Điểm ảnh chói sáng (mô phỏng Pixel Art Stardew Valley)
              cx.fillStyle = '#a6f571';
              cx.fillRect(x - r*0.4, y - r*0.5, 3, 2);
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
          })
        };
      }
      
      // 1. Draw Map (Floor & Wall) - from ASCII
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const t = mapData[r][c];
          const tx = c * tileSize, ty = r * tileSize;
          
          if (preRenderedSprites.floor) ctx.drawImage(preRenderedSprites.floor, tx, ty);
          
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
          if (t === 7 || t === 9) {
            ctx.drawImage(window.proceduralPatterns.concrete, tx, ty);
          }
          
          // Tường rào (1)
          if (t === 1) {
            ctx.drawImage(window.proceduralPatterns.wall, tx, ty);
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
      roomLayout.layout.forEach(item => {
        if (['bed', 'desk', 'plant', 'laptop'].includes(item.type)) {
           const customImg = window.customFurnitureSprites[item.type];
           if (customImg && customImg.complete && customImg.width > 0) {
               const rw = item.renderW || customImg.width;
               const rh = item.renderH || customImg.height;
               ctx.drawImage(customImg, item.x * tileSize, item.y * tileSize, rw, rh);
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

      // 2.2 Draw NPCs
      const visibleNpcs = getVisibleNpcs();
      const t = performance.now();
      visibleNpcs.forEach(npc => {
        if (npc.locations && !npc.locations.includes(currentLocation)) return;
        
        // Pacing logic (deterministic walk back and forth)
        const phase = npc.x * 13 + npc.y * 7;
        const moveOffset = Math.sin((t + phase * 100) / 800) * 8; // Pacing range reduced
        const direction = Math.cos((t + phase * 100) / 800) > 0 ? 1 : -1;
        
        const nx = npc.x * tileSize + moveOffset;
        const ny = npc.y * tileSize;
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
        const baseSprite = direction > 0 ? 'playerRight' : 'playerLeft';
        let spriteKey = baseSprite;
        if (walkCycle === 1) spriteKey += 'Walk1';
        else if (walkCycle === 3) spriteKey += 'Walk2';
        
        const customImg = window.customPlayerSprites && window.customPlayerSprites[spriteKey];
        
        ctx.save();
        ctx.translate(nx + 16, ny + 28); // Origin at bottom center
        
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
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(pos.x + tileSize/2, pos.y + 28, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

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
      // Shadow placed precisely under the feet
      const anim = activeAnimRef.current;
      const isSleeping = anim && anim.type === 'sleep';

      if (!isSleeping) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(pos.x + tileSize/2, pos.y + 28, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      if (anim && (anim.type === 'sleep' || anim.type === 'read' || anim.type === 'study' || anim.type === 'code' || anim.type === 'pe' || anim.type === 'science' || anim.type === 'math' || anim.type === 'literature' || anim.type === 'english' || anim.type === 'history')) {
         const t = performance.now() - anim.start;
         if (anim.type === 'sleep') {
           const sleepX = 7.1 * tileSize;
           const sleepY = 9.3 * tileSize;
           
           ctx.save();
           ctx.translate(sleepX, sleepY);
           ctx.restore();
           
           // Zzz particles
           ctx.font = 'bold 16px "Courier New"';
           ctx.fillStyle = '#60a5fa';
           ctx.fillText('Zzz...', sleepX - 10, sleepY - 20 - (t / 100) % 15);
         } else {
           // Read / Study animations
           ctx.save();
           ctx.translate(pos.x + 16, pos.y + 24); // Ngồi xuống thấp hơn 1 chút
           
           // Vẽ nhân vật (hơi lùn đi để giả vờ đang ngồi)
           const customImg = window.customPlayerSprites['playerDown'];
           if (customImg && customImg.complete && customImg.width > 0) {
              const drawW = 32;
              const drawH = (customImg.height / customImg.width) * drawW;
              drawPlayerSprite(ctx, customImg, drawW, drawH * 0.75, -drawW / 2, 4 - (drawH * 0.75), isHighlyStressed);
           }
           
           if (anim.type === 'read') {
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
           } else if (anim.type === 'study') {
             // Học thêm: Cái bàn nhỏ và đang viết bài
             ctx.fillStyle = '#5c402d'; // Bàn gỗ
             ctx.fillRect(-14, -2, 28, 6);
             ctx.fillStyle = '#fff'; // Tờ giấy
             ctx.fillRect(-6, -6, 12, 10);
             
             // Cây bút chì nhúc nhích (viết)
             const writeX = -4 + (Math.floor(t / 100) % 6);
             const writeY = -4 + (Math.floor(t / 150) % 3);
             ctx.fillStyle = '#ffd700'; // Bút vàng
             ctx.fillRect(writeX, writeY, 2, 6);
             
             // Các ký hiệu bay bay (Toán...)
             if (t % 1000 < 500) {
               ctx.font = 'bold 12px "Courier New"';
               ctx.fillStyle = '#fff';
               ctx.fillText('∑', -20, -15 - (t / 60) % 10);
             }
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
                ctx.beginPath(); ctx.arc(-12, -20 - (t/50)%5, 1.5, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(12, -18 - (t/50)%5, 1.5, 0, Math.PI*2); ctx.fill();
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
             const lY = -6 - Math.abs(leftSwing)*0.6;
             ctx.beginPath(); ctx.moveTo(-5, -18); ctx.lineTo(lX, lY); ctx.stroke();
             ctx.beginPath(); ctx.arc(lX, lY, 2.5, 0, Math.PI*2); ctx.fill();
             
             // Bi 2 (Giữa) - Đứng im
             ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, -6); ctx.stroke();
             ctx.beginPath(); ctx.arc(0, -6, 2.5, 0, Math.PI*2); ctx.fill();
             
             // Bi 3 (Phải) - Bị văng lên khi swing dương
             const rX = 5 + rightSwing;
             const rY = -6 - Math.abs(rightSwing)*0.6;
             ctx.beginPath(); ctx.moveTo(5, -18); ctx.lineTo(rX, rY); ctx.stroke();
             ctx.beginPath(); ctx.arc(rX, rY, 2.5, 0, Math.PI*2); ctx.fill();
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
                ctx.arc(0, -8 - (t / 50 % 10), 1.5, 0, Math.PI*2);
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
               ctx.fillText('∫', 15, -10 - ((t+200) / 50) % 10);
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
               ctx.fillText('Z', 15, -10 - ((t+200) / 50) % 10);
             }
           } else if (anim.type === 'history') {
             // Học Lịch sử: Cuốn sách cũ và quả địa cầu
             ctx.fillStyle = '#5c402d'; ctx.fillRect(-14, -2, 28, 6);
             
             // Quả địa cầu nhỏ
             ctx.fillStyle = '#3b82f6';
             ctx.beginPath(); ctx.arc(-6, -6, 5, 0, Math.PI*2); ctx.fill();
             ctx.fillStyle = '#22c55e'; // Đất liền
             ctx.beginPath(); ctx.arc(-7, -7, 2, 0, Math.PI*2); ctx.fill();
             ctx.beginPath(); ctx.arc(-5, -4, 1.5, 0, Math.PI*2); ctx.fill();
             // Chân đế
             ctx.fillStyle = '#9ca3af'; ctx.fillRect(-7, -1, 2, 3);
             
             // Sách cũ
             ctx.fillStyle = '#fef3c7'; // Giấy ngả vàng
             ctx.fillRect(2, -6, 8, 6);
             
             // Kính lúp di chuyển
             const lookX = 2 + (Math.floor(t / 200) % 6);
             ctx.strokeStyle = '#fff';
             ctx.lineWidth = 1;
             ctx.beginPath(); ctx.arc(lookX, -3, 2, 0, Math.PI*2); ctx.stroke();
             ctx.fillStyle = '#374151'; ctx.fillRect(lookX+2, -2, 2, 4);
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
         for(let i=0; i<3; i++) {
           const dropY = (t / 10 + i * 15) % 40;
           ctx.beginPath();
           ctx.arc(plantX + (i-1)*8, plantY - 30 + dropY, 2, 0, Math.PI * 2);
           ctx.fill();
         }
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
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Interaction polling interval (runs slower than 60fps)
    const interactionPoll = setInterval(() => {
      const pGridX = Math.floor((posRef.current.x + 16) / tileSize);
      const pGridY = Math.floor((posRef.current.y + 16) / tileSize);
      
      let fObj = null;
      let fNpc = null;

      // Đồ đạc trong phòng ngủ (thu hẹp vùng kích hoạt)
      if ((pGridX >= 4 && pGridX <= 6) && (pGridY >= 3 && pGridY <= 5)) fObj = { type: 'pc', label: 'Nhật ký · [E] Mở máy tính' };
      else if ((pGridX >= 4 && pGridX <= 7) && (pGridY >= 6 && pGridY <= 10)) fObj = { type: 'bed', label: 'Ngủ' };
      else if ((pGridX >= 1 && pGridX <= 2) && (pGridY >= 1 && pGridY <= 3)) fObj = { type: 'plant', label: 'Tưới cây' };
      
      // Thư viện (Chỉ vùng trước cửa)
      if (currentLocation === 'main') {
        if (pGridX >= 36 && pGridX <= 38 && pGridY >= 13 && pGridY <= 15) {
          fObj = { type: 'library', label: 'Thư viện' };
        } else if (pGridX >= 21 && pGridX <= 23 && pGridY >= 10 && pGridY <= 12) {
          fObj = { type: 'school', label: 'Trường học' };
        } else if (pGridX >= 15 && pGridX <= 17 && pGridY >= 22 && pGridY <= 25) {
          fObj = { type: 'hospital', label: 'Bệnh viện' };
        }
      }
      setNearbyObj(fObj);

      const visibleNpcs = getVisibleNpcs();
      for (const npc of visibleNpcs) {
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
  }, [mapData, currentLocation, getVisibleNpcs]);

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

        {/* Controls hint */}
        <div className="absolute bottom-2 right-2 z-40 px-2 py-1 rounded bg-black/40 backdrop-blur-sm border border-white/10"
          style={{ fontSize: '9px', color: '#cbd5e1', letterSpacing: '0.05em' }}>
          WASD · SPACE · E
        </div>
      </div>
    </div>
  );
}
