// ── SETUP ────────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// ── AUDIO ─────────────────────────────────────────────────────────
// We use the Web Audio API to generate sounds in code — no files needed
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(freq, type, duration, vol = 0.3) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + duration);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + duration);
}

function soundPickup()      { playSound(520, 'sine',   0.12, 0.2); }
function soundDelivery()    {
  playSound(520, 'sine', 0.1, 0.2);
  setTimeout(() => playSound(660, 'sine', 0.1, 0.2), 100);
  setTimeout(() => playSound(780, 'sine', 0.2, 0.2), 200);
}
function soundFrustration() { playSound(180, 'sawtooth', 0.3, 0.25); }

// ── HOUSE FLOOR ──────────────────────────────────────────────────
const house = { x: 60, y: 20, w: 580, h: 560 };

// ── ROOM FLOORS ───────────────────────────────────────────────────
const roomFloors = [
  { x: 61,  y: 21,  w: 578, h: 118, color: '#d4b8a0', label: 'Kitchen',     lx: 350, ly: 37  },
  { x: 61,  y: 159, w: 268, h: 188, color: '#d4c4a0', label: 'Living Room',  lx: 195, ly: 175 },
  { x: 61,  y: 357, w: 268, h: 182, color: '#c9b8d4', label: 'Bedroom',      lx: 195, ly: 373 },
  { x: 469, y: 159, w: 170, h: 188, color: '#b8d4d0', label: 'Bathroom',     lx: 554, ly: 175 },
  { x: 349, y: 159, w: 110, h: 420, color: '#c8b89a', label: 'Hallway',      lx: 404, ly: 175 },
];

// ── WALL THICKNESS ────────────────────────────────────────────────
const W_T = 6;

// ── WALLS ────────────────────────────────────────────────────────
const walls = [
  { x: 60,  y: 20,  w: 580, h: W_T },
  { x: 60,  y: 574, w: 190, h: W_T },
  { x: 450, y: 574, w: 190, h: W_T },
  { x: 60,  y: 20,  w: W_T, h: 560 },
  { x: 634, y: 20,  w: W_T, h: 560 },
  { x: 459, y: 138, w: 175, h: W_T },
  { x: 349, y: 138, w: W_T, h: 92  },
  { x: 349, y: 290, w: W_T, h: 61  },
  { x: 349, y: 351, w: W_T, h: 109 },
  { x: 349, y: 520, w: W_T, h: 59  },
  { x: 459, y: 138, w: W_T, h: 92  },
  { x: 459, y: 290, w: W_T, h: 57  },
  { x: 459, y: 341, w: 175, h: W_T },
  { x: 459, y: 347, w: W_T, h: 233 },
  { x: 66,  y: 351, w: 283, h: W_T },
];

// ── DOOR MARKERS ──────────────────────────────────────────────────
const doorMarkers = [
  { x: 250, y: 571, w: 140, h: 8,   color: '#a09070' },
  { x: 349, y: 230, w: W_T, h: 60,  color: '#c8b89a' },
  { x: 459, y: 230, w: W_T, h: 60,  color: '#c8b89a' },
  { x: 349, y: 460, w: W_T, h: 60,  color: '#c8b89a' },
];

// ── FURNITURE ─────────────────────────────────────────────────────
const furniture = [
  { x: 390, y: 26,  w: 160, h: 22, color: '#8a6a4a', label: 'counter'  },
  { x: 570, y: 26,  w: 44,  h: 22, color: '#8a6a4a', label: 'counter'  },
  { x: 618, y: 26,  w: 22,  h: 40, color: '#8a6a4a', label: 'counter'  },
  { x: 618, y: 86,  w: 22,  h: 40, color: '#8a6a4a', label: 'counter'  },
  { x: 618, y: 56,  w: 22,  h: 30, color: '#555555', label: 'stove'    },
  { x: 66,  y: 180, w: 20,  h: 80, color: '#7a5a3a', label: 'sofa'     },
  { x: 66,  y: 320, w: 120, h: 20, color: '#7a5a3a', label: 'sofa'     },
  { x: 320, y: 168, w: 20,  h: 60, color: '#4a4a6a', label: 'tv unit'  },
  { x: 66,  y: 360, w: 20,  h: 80, color: '#6a5a8a', label: 'bed'      },
  { x: 66,  y: 500, w: 20,  h: 30, color: '#5a4a6a', label: 'wardrobe' },
  { x: 474, y: 164, w: 40,  h: 30, color: '#6a9aaa', label: 'shower'   },
  { x: 530, y: 164, w: 30,  h: 25, color: '#aac8d4', label: 'sink'     },
  { x: 474, y: 290, w: 30,  h: 35, color: '#d4d4d4', label: 'toilet'   },
];

// ── ITEMS ─────────────────────────────────────────────────────────
const itemDefs = [
  { x: 120, y: 60,  name: 'fork',       color: '#aaaaaa', room: 'kitchen'  },
  { x: 200, y: 80,  name: 'mug',        color: '#c8603a', room: 'kitchen'  },
  { x: 150, y: 220, name: 'controller', color: '#222244', room: 'living'   },
  { x: 220, y: 280, name: 'blanket',    color: '#7a4a8a', room: 'living'   },
  { x: 120, y: 420, name: 'shoes',      color: '#8a6a3a', room: 'bedroom'  },
  { x: 220, y: 480, name: 'hoodie',     color: '#4a6a8a', room: 'bedroom'  },
  { x: 520, y: 220, name: 'toothpaste', color: '#3a8a6a', room: 'bathroom' },
  { x: 560, y: 280, name: 'towel',      color: '#d4a0a0', room: 'bathroom' },
];

let items = [];

// ── TRAIL ─────────────────────────────────────────────────────────
// Stores recent player positions for the movement trail
const trail = [];
const TRAIL_LENGTH = 18;

// ── GAME STATE ────────────────────────────────────────────────────
let carrying = null;
let dropCooldown = 0;
let frustrationCount = 0;
let score = 0;
let gameOver = false;
let activeNPC = null;
let askTimer = 180;
let frame = 0;
// 'title' | 'playing' | 'gameover'
let gameState = 'title';

const ASK_TIME = 600;

// ── NPCS ──────────────────────────────────────────────────────────
const npcDefs = [
  { name: 'Roze', x: 345, y: 250, color: '#e8a0c0' },
  { name: 'Mary',   x: 345, y: 490, color: '#a0c0e8' },
  { name: 'Mo',      x: 390, y: 143, color: '#a0e8b0' },
  { name: 'H',      x: 463, y: 250, color: '#e8d0a0' },
];

let npcs = [];

// ── PLAYER ───────────────────────────────────────────────────────
const player = {
  x: 404, y: 500, size: 14, speed: 3, color: '#5de0a0'
};

// ── KEYBOARD ─────────────────────────────────────────────────────
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.key] = true;
  e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.key] = false; });

// ── COLLISION ────────────────────────────────────────────────────
function circleRect(x, y, r, rx, ry, rw, rh) {
  const nearX = Math.max(rx, Math.min(x, rx + rw));
  const nearY = Math.max(ry, Math.min(y, ry + rh));
  const dx = x - nearX;
  const dy = y - nearY;
  return (dx * dx + dy * dy) < (r * r);
}
function insideHouse(x, y, r) {
  return circleRect(x, y, r, house.x + W_T, house.y + W_T, house.w - W_T * 2, house.h - W_T * 2);
}
function hitsWall(x, y, r) {
  for (const w of walls) if (circleRect(x, y, r, w.x, w.y, w.w, w.h)) return true;
  return false;
}
function hitsFurniture(x, y, r) {
  for (const f of furniture) if (circleRect(x, y, r, f.x, f.y, f.w, f.h)) return true;
  return false;
}

// ── HELPERS ───────────────────────────────────────────────────────
function getAskInterval() { return Math.max(120, 300 - score * 10); }

function pickRandomItem() {
  const beingAsked = npcs.map(n => n.asking ? n.asking.name : null);
  const available = items.filter(i => !i.delivered && !beingAsked.includes(i.name));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// ── RESET ─────────────────────────────────────────────────────────
function resetGame() {
  items = itemDefs.map(d => ({ ...d, collected: false, delivered: false }));
  npcs = npcDefs.map(d => ({ ...d, state: 'idle', asking: null, timer: 0, frustratedTimer: 0 }));
  frustrationCount = 0;
  score = 0;
  gameOver = false;
  activeNPC = null;
  askTimer = 180;
  dropCooldown = 0;
  carrying = null;
  trail.length = 0;
  player.x = 404;
  player.y = 500;
  gameState = 'playing';
}

// ── UPDATE ───────────────────────────────────────────────────────
function update() {
  frame++;

  if (gameState === 'title' || gameState === 'gameover') return;

  let dx = 0, dy = 0;
  if (keys['ArrowLeft']  || keys['a']) dx -= 1;
  if (keys['ArrowRight'] || keys['d']) dx += 1;
  if (keys['ArrowUp']    || keys['w']) dy -= 1;
  if (keys['ArrowDown']  || keys['s']) dy += 1;
  if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

  const R = player.size / 2;
  const nx = player.x + dx * player.speed;
  const ny = player.y + dy * player.speed;

  if (insideHouse(nx, player.y, R) && !hitsWall(nx, player.y, R) && !hitsFurniture(nx, player.y, R)) player.x = nx;
  if (insideHouse(player.x, ny, R) && !hitsWall(player.x, ny, R) && !hitsFurniture(player.x, ny, R)) player.y = ny;

  // ── TRAIL ───────────────────────────────────────────────────
  if (dx !== 0 || dy !== 0) {
    trail.push({ x: player.x, y: player.y });
    if (trail.length > TRAIL_LENGTH) trail.shift();
  }

  // ── DROP ────────────────────────────────────────────────────
  if ((keys['e'] || keys['E']) && dropCooldown === 0 && carrying !== null) {
    carrying.x = player.x;
    carrying.y = player.y;
    carrying.collected = false;
    carrying = null;
    dropCooldown = 60;
  }
  if (dropCooldown > 0) dropCooldown--;

  // ── PICKUP ──────────────────────────────────────────────────
  if (carrying === null && dropCooldown === 0) {
    for (const item of items) {
      if (item.collected || item.delivered) continue;
      if (Math.hypot(player.x - item.x, player.y - item.y) < 20) {
        item.collected = true;
        carrying = item;
        soundPickup();
        break;
      }
    }
  }

  // ── NPC SPAWNING ────────────────────────────────────────────
  askTimer--;
  if (askTimer <= 0) {
    const idleNPCs = npcs.filter(n => n.state === 'idle');
    if (idleNPCs.length > 0) {
      const npc = idleNPCs[Math.floor(Math.random() * idleNPCs.length)];
      const item = pickRandomItem();
      if (item) {
        npc.state = 'asking';
        npc.asking = item;
        npc.timer = ASK_TIME;
      }
    }
    askTimer = getAskInterval();
  }

  // ── NPC LOGIC ───────────────────────────────────────────────
  activeNPC = null;
  for (const npc of npcs) {
    if (npc.state === 'asking') {
      npc.timer--;
      const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
      if (dist < 40) activeNPC = npc;

      if (activeNPC === npc && (keys['h'] || keys['H'])) {
        npc.state = 'following';
        keys['h'] = false; keys['H'] = false;
      }
      if (activeNPC === npc && (keys['n'] || keys['N'])) {
        npc.state = 'frustrated';
        npc.frustratedTimer = 180;
        npc.asking = null;
        frustrationCount++;
        soundFrustration();
        keys['n'] = false; keys['N'] = false;
        if (frustrationCount >= 3) { gameOver = true; gameState = 'gameover'; }
      }
      if (npc.timer <= 0) {
        npc.state = 'frustrated';
        npc.frustratedTimer = 180;
        npc.asking = null;
        frustrationCount++;
        soundFrustration();
        if (frustrationCount >= 3) { gameOver = true; gameState = 'gameover'; }
      }
    }

    if (npc.state === 'following') {
      const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
      if (dist > 30) {
        const angle = Math.atan2(player.y - npc.y, player.x - npc.x);
        npc.x += Math.cos(angle) * 2;
        npc.y += Math.sin(angle) * 2;
      }
      if (carrying && carrying.name === npc.asking.name && dist < 40) {
        score++;
        carrying.delivered = true;
        carrying.collected = true;
        carrying = null;
        dropCooldown = 60;
        npc.state = 'satisfied';
        npc.frustratedTimer = 180;
        npc.asking = null;
        soundDelivery();
        if (items.every(i => i.delivered)) { gameOver = true; gameState = 'gameover'; }
      }
    }

    if (npc.state === 'frustrated' || npc.state === 'satisfied') {
      npc.frustratedTimer--;
      if (npc.frustratedTimer <= 0) npc.state = 'idle';
    }
  }
}

// ── DRAW HELPERS ──────────────────────────────────────────────────
function drawHouse() {
  ctx.fillStyle = '#c8b89a';
  ctx.fillRect(house.x, house.y, house.w, house.h);
  for (const r of roomFloors) {
    ctx.fillStyle = r.color;
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }
  for (const r of roomFloors) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(r.label, r.lx, r.ly);
  }
}

function drawWalls() {
  ctx.fillStyle = '#5a4a3a';
  for (const w of walls) ctx.fillRect(w.x, w.y, w.w, w.h);
}

function drawDoorMarkers() {
  for (const d of doorMarkers) {
    ctx.fillStyle = d.color;
    ctx.fillRect(d.x, d.y, d.w, d.h);
  }
}

function drawFurniture() {
  for (const f of furniture) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(f.x + 3, f.y + 3, f.w, f.h);
    ctx.fillStyle = f.color;
    ctx.fillRect(f.x, f.y, f.w, f.h);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(f.label, f.x + f.w / 2, f.y + f.h / 2 + 3);
  }
}

function drawTrail() {
  for (let i = 0; i < trail.length; i++) {
    const alpha = (i / trail.length) * 0.3;
    const radius = (i / trail.length) * 5;
    ctx.fillStyle = `rgba(93, 224, 160, ${alpha})`;
    ctx.beginPath();
    ctx.arc(trail[i].x, trail[i].y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawItems() {
  for (const item of items) {
    if (item.collected || item.delivered) continue;
    // Pulsing glow
    const pulse = 1 + 0.2 * Math.sin(frame * 0.08 + item.x);
    ctx.fillStyle = `rgba(255,255,255,${0.08 * pulse})`;
    ctx.beginPath();
    ctx.arc(item.x, item.y, 14 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(item.x, item.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(item.name, item.x, item.y - 14);
  }
}

function drawNPCs() {
  for (const npc of npcs) {
    if (npc.state === 'idle') continue;

    // Gentle bob animation
    const bob = Math.sin(frame * 0.08 + npc.x) * 2;

    let bodyColor = npc.color;
    if (npc.state === 'frustrated') bodyColor = '#e04040';
    if (npc.state === 'satisfied')  bodyColor = '#40e080';

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.arc(npc.x, npc.y + bob, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(npc.x, npc.y + bob, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(npc.name, npc.x, npc.y + bob - 18);

    if (npc.state === 'asking' && npc.asking) {
      const msg = 'Where is the ' + npc.asking.name + '?';
      const bw = msg.length * 6 + 16;
      const bh = 22;
      const bx = npc.x - bw / 2;
      const by = npc.y + bob - 46;

      ctx.fillStyle = 'rgba(255,255,240,0.95)';
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 4);
      ctx.fill();

      ctx.fillStyle = '#333';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(msg, npc.x, by + 15);

      ctx.fillStyle = 'rgba(255,255,240,0.95)';
      ctx.beginPath();
      ctx.moveTo(npc.x - 4, by + bh);
      ctx.lineTo(npc.x, by + bh + 6);
      ctx.lineTo(npc.x + 4, by + bh);
      ctx.fill();

      const timerFrac = npc.timer / ASK_TIME;
      const barW = bw;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(bx, by + bh + 8, barW, 4);
      ctx.fillStyle = timerFrac > 0.5 ? '#50e080' : timerFrac > 0.25 ? '#e0d050' : '#e05050';
      ctx.fillRect(bx, by + bh + 8, barW * timerFrac, 4);

      if (activeNPC === npc) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[H] Here!   [N] I don\'t know', npc.x, by - 8);
      }
    }

    if (npc.state === 'frustrated') {
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('😤', npc.x, npc.y + bob - 18);
    }
    if (npc.state === 'satisfied') {
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('😊', npc.x, npc.y + bob - 18);
    }
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 10, 220, 30);
  ctx.font = '12px monospace';
  ctx.textAlign = 'left';
  if (carrying) {
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Carrying: ' + carrying.name + '  [E] drop', 20, 30);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('Carrying: nothing', 20, 30);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 48, 120, 26);
  ctx.fillStyle = '#ffe066';
  ctx.font = '12px monospace';
  ctx.fillText('Score: ' + score, 20, 66);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 82, 160, 26);
  ctx.fillStyle = frustrationCount >= 2 ? '#e05050' : '#ffffff';
  ctx.font = '12px monospace';
  ctx.fillText('😤 ' + frustrationCount + ' / 3  strikes', 20, 100);
}

function drawTitleScreen() {
  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, W, H);

  // Animated background dots
  for (let i = 0; i < 20; i++) {
    const x = (i * 137 + frame * 0.3) % W;
    const y = (i * 97 + frame * 0.2) % H;
    ctx.fillStyle = `rgba(93,224,160,${0.05 + 0.05 * Math.sin(frame * 0.05 + i)})`;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Title
  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 64px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CHOP CHOP', W / 2 + 4, H / 2 - 50);
  ctx.fillStyle = '#5de0a0';
  ctx.fillText('CHOP CHOP', W / 2, H / 2 - 54);

  // Subtitle
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '14px monospace';
  ctx.fillText('Find what your housemates need.', W / 2, H / 2 + 10);
  ctx.fillText('Before they lose their patience.', W / 2, H / 2 + 30);

  // Controls
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '12px monospace';
  ctx.fillText('WASD/Arrows: move  |  E: drop  |  H: Here  |  N: IDK', W / 2, H / 2 + 65);

  // Start button
  ctx.fillStyle = '#5de0a0';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 100, H / 2 + 88, 200, 44, 8);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('START', W / 2, H / 2 + 116);
}

function drawGameOverScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  ctx.fillRect(0, 0, W, H);
  const won = items.every(i => i.delivered);

  if (won) {
    ctx.fillStyle = '#50e080';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU WIN! ', W / 2, H / 2 - 40);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '16px monospace';
    ctx.fillText('All items delivered!', W / 2, H / 2);
  } else {
    ctx.fillStyle = '#e05050';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 40);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '16px monospace';
    ctx.fillText('Too many strikes!', W / 2, H / 2);
  }

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('Score: ' + score, W / 2, H / 2 + 36);

  // Play Again button
  ctx.fillStyle = '#5de0a0';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 100, H / 2 + 60, 200, 44, 8);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('PLAY AGAIN', W / 2, H / 2 + 87);
}

function drawPlayer() {
  ctx.fillStyle = 'rgba(93,224,160,0.15)';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
  ctx.fill();
}

// ── DRAW ─────────────────────────────────────────────────────────
function draw() {
  ctx.fillStyle = '#3a3028';
  ctx.fillRect(0, 0, W, H);

  if (gameState === 'title') {
    drawTitleScreen();
    return;
  }

  drawHouse();
  drawWalls();
  drawDoorMarkers();
  drawFurniture();
  drawTrail();
  drawItems();
  drawNPCs();
  drawPlayer();
  drawHUD();

  if (gameState === 'gameover') drawGameOverScreen();
}

// ── CLICK HANDLER ─────────────────────────────────────────────────
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;

  if (gameState === 'title') {
    // Start button
    if (cx > W/2 - 100 && cx < W/2 + 100 && cy > H/2 + 88 && cy < H/2 + 132) {
      audioCtx.resume();
      resetGame();
    }
  }

  if (gameState === 'gameover') {
    // Play Again button
    if (cx > W/2 - 100 && cx < W/2 + 100 && cy > H/2 + 60 && cy < H/2 + 104) {
      resetGame();
    }
  }
});

// ── LOOP ─────────────────────────────────────────────────────────
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();