// ── SETUP ────────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// ── AUDIO ─────────────────────────────────────────────────────────
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let muted = false;
let currentMusic = null;

const masterGain = audioCtx.createGain();
masterGain.gain.value = 0.4;
masterGain.connect(audioCtx.destination);

function playSound(freq, type, duration, vol = 0.3) {
  if (muted) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
 gain.connect(masterGain);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + duration);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + duration);
}

function soundPickup()      { playSound(520, 'sine', 0.12, 0.2); }
function soundDelivery()    {
  playSound(520, 'sine', 0.1, 0.2);
  setTimeout(() => playSound(660, 'sine', 0.1, 0.2), 100);
  setTimeout(() => playSound(780, 'sine', 0.2, 0.2), 200);
}
function soundFrustration() { playSound(180, 'sawtooth', 0.3, 0.25); }

// ── MUSIC ─────────────────────────────────────────────────────────
function stopMusic() {
  if (currentMusic) {
    currentMusic.forEach(node => {
      try { node.stop(); } catch(e) {}
    });
    currentMusic = null;
  }
}

function playAtmoMusic() {
  stopMusic();
  if (muted) return;
  const nodes = [];
  const bassNotes = [57, 57, 52, 55, 57, 57, 52, 60];
  const noteLen = 0.7;
  function scheduleBass(startTime) {
    bassNotes.forEach((note, i) => {
      const freq = 440 * Math.pow(2, (note - 69) / 12);
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(masterGain);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, startTime + i * noteLen);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + i * noteLen + noteLen * 0.95);
      osc.start(startTime + i * noteLen);
      osc.stop(startTime + i * noteLen + noteLen);
      nodes.push(osc);
      const pad = audioCtx.createOscillator();
      const padGain = audioCtx.createGain();
      pad.connect(padGain);
      padGain.connect(audioCtx.destination);
      pad.type = 'sine';
      pad.frequency.value = freq * 1.5;
      padGain.gain.setValueAtTime(0.05, startTime + i * noteLen);
      padGain.gain.exponentialRampToValueAtTime(0.001, startTime + i * noteLen + noteLen);
      pad.start(startTime + i * noteLen);
      pad.stop(startTime + i * noteLen + noteLen);
      nodes.push(pad);
    });
  }
  const loopLen = bassNotes.length * noteLen;
  for (let i = 0; i < 24; i++) scheduleBass(audioCtx.currentTime + i * loopLen);
  currentMusic = nodes;
}

function playGameMusic() {
  stopMusic();
  if (muted) return;
  const nodes = [];
  const BPM = 120;
  const BEAT = 60 / BPM;
  const BAR = BEAT * 4;
  const LOOP = BAR * 4;

  function scheduleMelody(startTime) {
    const melody = [
      69, 71, 72, 71,   69, 67, 69, 72,
      71, 69, 67, 69,   71, 72, 74, 72,
    ];
    melody.forEach((note, i) => {
      const freq = 440 * Math.pow(2, (note - 69) / 12);
      const t = startTime + i * BEAT * 0.5;
      const dur = BEAT * 0.45;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(masterGain);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur);
      nodes.push(osc);
      const harm = audioCtx.createOscillator();
      const harmGain = audioCtx.createGain();
      harm.connect(harmGain);
      harmGain.connect(audioCtx.destination);
      harm.type = 'sine';
      harm.frequency.value = freq * 0.5;
      harmGain.gain.setValueAtTime(0.03, t);
      harmGain.gain.exponentialRampToValueAtTime(0.001, t + BEAT * 0.5);
      harm.start(t);
      harm.stop(t + BEAT * 0.5);
      nodes.push(harm);
    });
  }

  function scheduleAtmoBass(startTime) {
    const bassNotes = [57, 52, 55, 57];
    bassNotes.forEach((note, i) => {
      const freq = 440 * Math.pow(2, (note - 69) / 12);
      const t = startTime + i * BAR;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(masterGain);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + BAR * 0.95);
      osc.start(t);
      osc.stop(t + BAR);
      nodes.push(osc);
      const pad = audioCtx.createOscillator();
      const padGain = audioCtx.createGain();
      pad.connect(padGain);
      padGain.connect(audioCtx.destination);
      pad.type = 'sine';
      pad.frequency.value = freq * 1.5;
      padGain.gain.setValueAtTime(0.04, t);
      padGain.gain.exponentialRampToValueAtTime(0.001, t + BAR);
      pad.start(t);
      pad.stop(t + BAR);
      nodes.push(pad);
    });
  }

  function schedulePerc(startTime) {
    for (let i = 0; i < 16; i++) {
      const t = startTime + i * BEAT;
      const isKick  = i % 4 === 0 || i % 4 === 2;
      const isSnare = i % 4 === 1 || i % 4 === 3;
      const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.06, audioCtx.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < data.length; j++) data[j] = (Math.random() * 2 - 1) * (1 - j / data.length);
      const src = audioCtx.createBufferSource();
      const gain = audioCtx.createGain();
      src.buffer = buf;
      src.connect(gain);
      gain.connect(masterGain);
      gain.gain.value = isKick ? 0.09 : isSnare ? 0.05 : 0.02;
      src.start(t);
      nodes.push(src);
      const hatBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.02, audioCtx.sampleRate);
      const hatData = hatBuf.getChannelData(0);
      for (let j = 0; j < hatData.length; j++) hatData[j] = (Math.random() * 2 - 1) * (1 - j / hatData.length);
      const hat = audioCtx.createBufferSource();
      const hatGain = audioCtx.createGain();
      hat.buffer = hatBuf;
      hat.connect(hatGain);
      hatGain.connect(audioCtx.destination);
      hatGain.gain.value = 0.015;
      hat.start(t + BEAT * 0.5);
      nodes.push(hat);
    }
  }

  for (let loop = 0; loop < 16; loop++) {
    const start = audioCtx.currentTime + loop * LOOP;
    scheduleMelody(start);
    scheduleAtmoBass(start);
    schedulePerc(start);
  }
  currentMusic = nodes;
}

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

// ── SPRITES ───────────────────────────────────────────────────────
const playerImg = new Image();
playerImg.src = 'player.png';

// ── ITEM SPRITES ──────────────────────────────────────────────────
const itemImgs = {
  'fork':       new Image(),
  'mug':        new Image(),
  'controller': new Image(),
  'blanket':    new Image(),
  'shoes':      new Image(),
  'hoodie':     new Image(),
  'toothpaste': new Image(),
  'towel':      new Image(),
};
itemImgs['fork'].src       = 'item_fork.png';
itemImgs['mug'].src        = 'item_mug.png';
itemImgs['controller'].src = 'item_controller.png';
itemImgs['blanket'].src    = 'item_blanket.png';
itemImgs['shoes'].src      = 'item_shoes.png';
itemImgs['hoodie'].src     = 'item_hoodie.png';
itemImgs['toothpaste'].src = 'item_toothpaste.png';
itemImgs['towel'].src      = 'item_towel.png';

const npcImgs = {
  'Roze': new Image(),
  'Mary': new Image(),
  'Mo':   new Image(),
  'H':    new Image(),
};
npcImgs['Roze'].src = 'npc_roze.png';
npcImgs['Mary'].src = 'npc_mary.png';
npcImgs['Mo'].src   = 'npc_mo.png';
npcImgs['H'].src    = 'npc_h.png';

const FRAME_W = 16;
const FRAME_H = 16;
const SPRITE_SCALE = 2;

const npcAnim = {
  'Roze': { frame: 0, dir: 0, timer: 0 },
  'Mary': { frame: 0, dir: 0, timer: 0 },
  'Mo':   { frame: 0, dir: 0, timer: 0 },
  'H':    { frame: 0, dir: 0, timer: 0 },
};

let playerFrame = 0;
let playerDir = 0;
let animTimer = 0;
const ANIM_SPEED = 12;

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
  { x: 280, y: 90,  name: 'fork',       color: '#aaaaaa', room: 'kitchen'  },
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
let gameState = 'title';
const ASK_TIME = 600;

// ── NPCS ──────────────────────────────────────────────────────────
const npcDefs = [
  { name: 'Roze', x: 345, y: 250, color: '#e8a0c0' },
  { name: 'Mary', x: 345, y: 490, color: '#a0c0e8' },
  { name: 'Mo',   x: 390, y: 143, color: '#a0e8b0' },
  { name: 'H',    x: 463, y: 250, color: '#e8d0a0' },
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
  playGameMusic();
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

  if (dx !== 0 || dy !== 0) {
    trail.push({ x: player.x, y: player.y });
    if (trail.length > TRAIL_LENGTH) trail.shift();
  }

  if ((keys['e'] || keys['E']) && dropCooldown === 0 && carrying !== null) {
    carrying.x = player.x;
    carrying.y = player.y;
    carrying.collected = false;
    carrying = null;
    dropCooldown = 60;
  }
  if (dropCooldown > 0) dropCooldown--;

  if (keys['r'] || keys['R']) {
    const following = npcs.find(n => n.state === 'following');
    if (following) {
      following.state = 'asking';
      following.timer = ASK_TIME;
      keys['r'] = false; keys['R'] = false;
    }
  }

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
        if (frustrationCount >= 3) { gameOver = true; gameState = 'gameover'; playAtmoMusic(); }
      }
      if (npc.timer <= 0) {
        npc.state = 'frustrated';
        npc.frustratedTimer = 180;
        npc.asking = null;
        frustrationCount++;
        soundFrustration();
        if (frustrationCount >= 3) { gameOver = true; gameState = 'gameover'; playAtmoMusic(); }
      }
    }

if (npc.state === 'following') {
      const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
      const anim = npcAnim[npc.name];
if (dist > 50) {
        const angle = Math.atan2(player.y - npc.y, player.x - npc.x);
        npc.x += Math.cos(angle) * 2;
        npc.y += Math.sin(angle) * 2;

        // Only update direction when actually moving — stops shaking
const ddx = player.x - npc.x;
        const ddy = player.y - npc.y;
        // Only change direction if one axis is clearly dominant (ratio > 1.5)
        // This stops flickering when moving at near-diagonal angles
        if      (Math.abs(ddy) > Math.abs(ddx) * 1.5 && ddy > 0) anim.dir = 0;
        else if (Math.abs(ddy) > Math.abs(ddx) * 1.5 && ddy < 0) anim.dir = 1;
        else if (Math.abs(ddx) > Math.abs(ddy) * 1.5 && ddx < 0) anim.dir = 2;
        else if (Math.abs(ddx) > Math.abs(ddy) * 1.5 && ddx > 0) anim.dir = 3;
        // If neither axis is dominant, keep the current direction
        anim.timer++;
        if (anim.timer >= 8) {
          anim.timer = 0;
          anim.frame = anim.frame === 0 ? 1 : 0;
        }
      } else {
        // Standing still — freeze on first frame, keep last direction
        anim.frame = 0;
        anim.timer = 0;
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
        if (items.every(i => i.delivered)) { gameOver = true; gameState = 'gameover'; playAtmoMusic(); }
      }
    }

    if (npc.state === 'frustrated' || npc.state === 'satisfied') {
      npc.frustratedTimer--;
      if (npc.frustratedTimer <= 0) npc.state = 'idle';
    }
    if (npc.state !== 'following') {
      npcAnim[npc.name].frame = 0;
      npcAnim[npc.name].timer = 0;
    }
  }
}

// ── DRAW ─────────────────────────────────────────────────────────
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
    const pulse = 1 + 0.2 * Math.sin(frame * 0.08 + item.x);

    // Glow
    ctx.fillStyle = `rgba(255,255,255,${0.08 * pulse})`;
    ctx.beginPath();
    ctx.arc(item.x, item.y, 14 * pulse, 0, Math.PI * 2);
    ctx.fill();

    const img = itemImgs[item.name];
    if (img && img.complete) {
      // Draw sprite centred on item position
      const drawW = FRAME_W * SPRITE_SCALE;
      const drawH = FRAME_H * SPRITE_SCALE;
      ctx.drawImage(img, 0, 0, FRAME_W, FRAME_H, item.x - drawW / 2, item.y - drawH / 2, drawW, drawH);
    } else {
      // Fallback coloured dot
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(item.x, item.y, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(item.name, item.x, item.y - 14);
  }
}


function drawNPCs() {
  for (const npc of npcs) {
    if (npc.state === 'idle') continue;
    const bob = Math.sin(frame * 0.08 + npc.x) * 2;
    let bodyColor = npc.color;
    if (npc.state === 'frustrated') bodyColor = '#e04040';
    if (npc.state === 'satisfied')  bodyColor = '#40e080';

    const anim = npcAnim[npc.name];
    const frameIndex = anim.dir * 2 + anim.frame;
    const srcX = frameIndex * FRAME_W;
    const drawW = FRAME_W * SPRITE_SCALE;
    const drawH = FRAME_H * SPRITE_SCALE;
    const img = npcImgs[npc.name];

    if (img && img.complete) {
      ctx.drawImage(
        img,
        srcX, 0,
        FRAME_W, FRAME_H,
        npc.x - drawW / 2,
        npc.y + bob - drawH / 2,
        drawW, drawH
      );
    } else {
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(npc.x, npc.y + bob, 10, 0, Math.PI * 2);
      ctx.fill();
    }

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

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.roundRect(W - 70, H - 36, 60, 26, 4);
  ctx.fill();
  ctx.fillStyle = muted ? '#e05050' : '#5de0a0';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(muted ? 'MUTE' : 'SOUND', W - 40, H - 18);

  const following = npcs.find(n => n.state === 'following');
  if (following) {
    const bw = 160, bh = 56;
    const bx = W - bw - 10, by = 10;

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 6);
    ctx.fill();

    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.1);
    ctx.strokeStyle = `rgba(93,224,160,${pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 6);
    ctx.stroke();

    ctx.fillStyle = following.color;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(following.name + ' following', bx + 10, by + 18);

    ctx.fillStyle = '#ffe066';
    ctx.font = '11px monospace';
    ctx.fillText('Needs: ' + following.asking.name, bx + 10, by + 34);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px monospace';
    ctx.fillText('[R] to release', bx + 10, by + 50);
  }
}

function drawPlayer() {
  let dx = 0, dy = 0;
  if (keys['ArrowLeft']  || keys['a']) dx = -1;
  if (keys['ArrowRight'] || keys['d']) dx = 1;
  if (keys['ArrowUp']    || keys['w']) dy = -1;
  if (keys['ArrowDown']  || keys['s']) dy = 1;

  if      (dy > 0) playerDir = 0;
  else if (dy < 0) playerDir = 1;
  else if (dx < 0) playerDir = 2;
  else if (dx > 0) playerDir = 3;

  const moving = dx !== 0 || dy !== 0;
  if (moving) {
    animTimer++;
    if (animTimer >= ANIM_SPEED) {
      animTimer = 0;
      playerFrame = playerFrame === 0 ? 1 : 0;
    }
  } else {
    playerFrame = 0;
    animTimer = 0;
  }

  const frameIndex = playerDir * 2 + playerFrame;
  const srcX = frameIndex * FRAME_W;
  const drawW = FRAME_W * SPRITE_SCALE;
  const drawH = FRAME_H * SPRITE_SCALE;

  if (playerImg.complete) {
    ctx.drawImage(
      playerImg,
      srcX, 0,
      FRAME_W, FRAME_H,
      player.x - drawW / 2,
      player.y - drawH / 2,
      drawW, drawH
    );
  } else {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTitleScreen() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 20; i++) {
    const x = (i * 137 + frame * 0.3) % W;
    const y = (i * 97 + frame * 0.2) % H;
    ctx.fillStyle = `rgba(93,224,160,${0.05 + 0.05 * Math.sin(frame * 0.05 + i)})`;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 64px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CHOP CHOP', W / 2 + 4, H / 2 - 50);
  ctx.fillStyle = '#5de0a0';
  ctx.fillText('CHOP CHOP', W / 2, H / 2 - 54);

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '14px monospace';
  ctx.fillText('Find what your housemates need.', W / 2, H / 2 + 10);
  ctx.fillText('Before they lose their patience.', W / 2, H / 2 + 30);

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '12px monospace';
  ctx.fillText('WASD/Arrows: move  |  E: drop  |  H: Here  |  N: IDK', W / 2, H / 2 + 65);

  ctx.fillStyle = '#5de0a0';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 100, H / 2 + 88, 200, 44, 8);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('START', W / 2, H / 2 + 116);

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.roundRect(W - 70, H - 36, 60, 26, 4);
  ctx.fill();
  ctx.fillStyle = muted ? '#e05050' : '#5de0a0';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(muted ? 'MUTE' : 'SOUND', W - 40, H - 18);
}

function drawGameOverScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  ctx.fillRect(0, 0, W, H);
  const won = items.every(i => i.delivered);

  if (won) {
    ctx.fillStyle = '#50e080';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU WIN! 🎉', W / 2, H / 2 - 40);
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

  ctx.fillStyle = '#5de0a0';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 100, H / 2 + 60, 200, 44, 8);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('PLAY AGAIN', W / 2, H / 2 + 87);

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.roundRect(W - 70, H - 36, 60, 26, 4);
  ctx.fill();
  ctx.fillStyle = muted ? '#e05050' : '#5de0a0';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(muted ? 'MUTE' : 'SOUND', W - 40, H - 18);
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

  if (cx > W - 70 && cx < W - 10 && cy > H - 36 && cy < H - 10) {
    muted = !muted;
    if (muted) {
      stopMusic();
    } else {
      if (gameState === 'playing') playGameMusic();
      if (gameState === 'gameover') playAtmoMusic();
    }
    return;
  }

  if (gameState === 'title') {
    if (cx > W/2 - 100 && cx < W/2 + 100 && cy > H/2 + 88 && cy < H/2 + 132) {
      audioCtx.resume().then(() => {
        resetGame();
      });
    }
  }

  if (gameState === 'gameover') {
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

// ══════════════════════════════════════════════════════════════════
// ── MOBILE ONLY — everything below only runs on touch devices ─────
// ── Desktop is completely unaffected ─────────────────────────────
// ══════════════════════════════════════════════════════════════════

const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
                  (navigator.maxTouchPoints > 1);

if (IS_MOBILE) {

  // ── CANVAS SCALING ─────────────────────────────────────────────
  function resizeCanvas() {
    if (window.innerWidth > window.innerHeight) {
      // Landscape — fill full screen
      canvas.style.width  = window.innerWidth  + 'px';
      canvas.style.height = window.innerHeight + 'px';
      canvas.style.display = 'block';
      rotateMsg.style.display = 'none';
    } else {
      // Portrait — show rotate message, hide canvas
      canvas.style.display = 'none';
      rotateMsg.style.display = 'flex';
    }
  }

  // Rotate message overlay
  const rotateMsg = document.createElement('div');
  rotateMsg.style.cssText = `
    display: none;
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: #1a1a2e;
    color: #5de0a0;
    font-family: monospace;
    font-size: 22px;
    text-align: center;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    z-index: 999;
  `;
  rotateMsg.innerHTML = '<div style="font-size:48px">🔄</div><div>Please rotate your device</div>';
  document.body.appendChild(rotateMsg);

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 100));

  // ── TOUCH TO CANVAS COORDS ─────────────────────────────────────
  function touchToCanvas(touch) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (touch.clientX - rect.left) * (800 / rect.width),
      y: (touch.clientY - rect.top)  * (600 / rect.height)
    };
  }

  // ── JOYSTICK STATE ─────────────────────────────────────────────
  const joystick = {
    active: false,
    baseX: 0, baseY: 0,
    tipX: 0,  tipY: 0,
    dx: 0,    dy: 0,
    id: null
  };

  // ── TOUCH START ────────────────────────────────────────────────
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    audioCtx.resume();
    for (const touch of e.changedTouches) {
      const pos = touchToCanvas(touch);

      // Title screen
      if (gameState === 'title') {
        if (pos.x > 400 - 100 && pos.x < 400 + 100 && pos.y > 300 + 88 && pos.y < 300 + 132) {
          resetGame(); return;
        }
        if (pos.x > 800 - 70 && pos.x < 800 - 10 && pos.y > 600 - 36 && pos.y < 600 - 10) {
          muted = !muted; if (muted) stopMusic(); else playGameMusic(); return;
        }
        return;
      }

      // Game over screen
      if (gameState === 'gameover') {
        if (pos.x > 400 - 100 && pos.x < 400 + 100 && pos.y > 300 + 60 && pos.y < 300 + 104) {
          resetGame(); return;
        }
        if (pos.x > 800 - 70 && pos.x < 800 - 10 && pos.y > 600 - 36 && pos.y < 600 - 10) {
          muted = !muted; if (muted) stopMusic(); else playAtmoMusic(); return;
        }
        return;
      }

      // Mute button
      if (pos.x > 800 - 70 && pos.x < 800 - 10 && pos.y > 600 - 36 && pos.y < 600 - 10) {
        muted = !muted;
        if (muted) stopMusic(); else playGameMusic();
        return;
      }

      // R button — release following NPC
      const followingNPC = npcs.find(n => n.state === 'following');
      if (followingNPC && pos.x > 800 - 150 && pos.x < 800 - 10 && pos.y > 600 - 340 && pos.y < 600 - 280) {
        followingNPC.state = 'asking'; followingNPC.timer = ASK_TIME; return;
      }

      // E button — drop item
      if (carrying && pos.x > 800 - 150 && pos.x < 800 - 10 && pos.y > 600 - 270 && pos.y < 600 - 210) {
        if (dropCooldown === 0) {
          carrying.x = player.x; carrying.y = player.y;
          carrying.collected = false; carrying = null; dropCooldown = 60;
        } return;
      }

      // H button — here
      if (activeNPC && activeNPC.state === 'asking' &&
          pos.x > 800 - 150 && pos.x < 800 - 10 && pos.y > 600 - 170 && pos.y < 600 - 110) {
        activeNPC.state = 'following'; return;
      }

      // N button — idk
      if (activeNPC && activeNPC.state === 'asking' &&
          pos.x > 800 - 150 && pos.x < 800 - 10 && pos.y > 600 - 100 && pos.y < 600 - 40) {
        activeNPC.state = 'frustrated';
        activeNPC.frustratedTimer = 180;
        activeNPC.asking = null;
        frustrationCount++;
        soundFrustration();
        if (frustrationCount >= 3) { gameOver = true; gameState = 'gameover'; playAtmoMusic(); }
        return;
      }

      // Joystick — left half bottom area
      if (pos.x < 400 && pos.y > 300 && joystick.id === null) {
        joystick.active = true;
        joystick.id = touch.identifier;
        joystick.baseX = pos.x; joystick.baseY = pos.y;
        joystick.tipX  = pos.x; joystick.tipY  = pos.y;
        joystick.dx = 0; joystick.dy = 0;
      }
    }
  }, { passive: false });

  // ── TOUCH MOVE ─────────────────────────────────────────────────
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === joystick.id) {
        const pos = touchToCanvas(touch);
        joystick.tipX = pos.x; joystick.tipY = pos.y;
        const ddx = pos.x - joystick.baseX;
        const ddy = pos.y - joystick.baseY;
        const dist = Math.hypot(ddx, ddy);
        const maxR = 50;
        joystick.dx = ddx / Math.max(dist, maxR);
        joystick.dy = ddy / Math.max(dist, maxR);
      }
    }
  }, { passive: false });

  // ── TOUCH END ──────────────────────────────────────────────────
  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === joystick.id) {
        joystick.active = false; joystick.id = null;
        joystick.dx = 0; joystick.dy = 0;
      }
    }
  }, { passive: false });

  // ── HOOK JOYSTICK INTO PLAYER MOVEMENT ─────────────────────────
  // Override update to also read joystick
  const _originalUpdate = update;
  window._mobileJoystickActive = false;

  // Patch player movement to include joystick
  const _origLoop = loop;
  function mobileUpdate() {
    // Inject joystick into keys-equivalent before update runs
    if (joystick.active) {
      if (Math.abs(joystick.dx) > 0.1 || Math.abs(joystick.dy) > 0.1) {
        player._jdx = joystick.dx;
        player._jdy = joystick.dy;
      } else {
        player._jdx = 0; player._jdy = 0;
      }
    } else {
      player._jdx = 0; player._jdy = 0;
    }
  }

  // ── DRAW MOBILE CONTROLS ───────────────────────────────────────
  const _origDraw = draw;
  function drawMobileControls() {
    if (gameState !== 'playing') return;

    const btnW = 130, btnH = 56;
    const btnX = 800 - btnW - 10;

    // Joystick
    if (joystick.active) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.arc(joystick.baseX, joystick.baseY, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(joystick.baseX, joystick.baseY, 55, 0, Math.PI * 2);
      ctx.stroke();
      const tipX = joystick.baseX + joystick.dx * 55;
      const tipY = joystick.baseY + joystick.dy * 55;
      ctx.fillStyle = 'rgba(93,224,160,0.75)';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 26, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(120, 600 - 120, 55, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.beginPath();
      ctx.arc(120, 600 - 120, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    // R button
    const followingNPC = npcs.find(n => n.state === 'following');
    if (followingNPC) {
      ctx.fillStyle = 'rgba(160,160,255,0.8)';
      ctx.beginPath();
      ctx.roundRect(btnX, 600 - 340, btnW, btnH, 8);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 17px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[R] Release', btnX + btnW / 2, 600 - 340 + 34);
    }

    // E button
    if (carrying) {
      ctx.fillStyle = 'rgba(255,200,60,0.8)';
      ctx.beginPath();
      ctx.roundRect(btnX, 600 - 270, btnW, btnH, 8);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 17px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[E] Drop', btnX + btnW / 2, 600 - 270 + 34);
    }

    // H and N buttons
    if (activeNPC && activeNPC.state === 'asking') {
      ctx.fillStyle = 'rgba(80,224,128,0.8)';
      ctx.beginPath();
      ctx.roundRect(btnX, 600 - 170, btnW, btnH, 8);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 17px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[H] Here!', btnX + btnW / 2, 600 - 170 + 34);

      ctx.fillStyle = 'rgba(224,80,80,0.8)';
      ctx.beginPath();
      ctx.roundRect(btnX, 600 - 100, btnW, btnH, 8);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 17px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[N] IDK', btnX + btnW / 2, 600 - 100 + 34);
    }
  }

  // ── PATCH LOOP TO INCLUDE MOBILE ───────────────────────────────
  // Stop the existing loop and restart with mobile additions
  cancelAnimationFrame(window._loopId);

  function mobileLoop() {
    mobileUpdate();

    // Temporarily inject joystick as movement
    const origX = player.x;
    const origY = player.y;
    const R = player.size / 2;

    if (player._jdx !== undefined && (Math.abs(player._jdx) > 0.1 || Math.abs(player._jdy) > 0.1)) {
      let jdx = player._jdx * player.speed;
      let jdy = player._jdy * player.speed;
      if (player._jdx !== 0 && player._jdy !== 0) { jdx *= 0.707; jdy *= 0.707; }
      const nx = player.x + jdx;
      const ny = player.y + jdy;
      if (insideHouse(nx, player.y, R) && !hitsWall(nx, player.y, R) && !hitsFurniture(nx, player.y, R)) player.x = nx;
      if (insideHouse(player.x, ny, R) && !hitsWall(player.x, ny, R) && !hitsFurniture(player.x, ny, R)) player.y = ny;
    }

    update();

    // Restore position if update moved player (avoid double movement)
    // Actually we want update to run normally for NPCs etc, just not double-move player
    // So we only apply joystick if keys aren't pressed
    const keysActive = keys['ArrowLeft'] || keys['ArrowRight'] || keys['ArrowUp'] || keys['ArrowDown'] ||
                       keys['a'] || keys['d'] || keys['w'] || keys['s'];
    if (keysActive) {
      player.x = origX; player.y = origY;
      // Let update handle it — already ran
    }

    draw();
    drawMobileControls();

    // Update player direction for sprite animation
    if (joystick.active && !keysActive) {
      const jdx = joystick.dx;
      const jdy = joystick.dy;
      if      (Math.abs(jdy) > Math.abs(jdx) && jdy > 0.1)  playerDir = 0;
      else if (Math.abs(jdy) > Math.abs(jdx) && jdy < -0.1) playerDir = 1;
      else if (jdx < -0.1) playerDir = 2;
      else if (jdx >  0.1) playerDir = 3;
      const moving = Math.abs(jdx) > 0.1 || Math.abs(jdy) > 0.1;
      if (moving) {
        animTimer++;
        if (animTimer >= ANIM_SPEED) { animTimer = 0; playerFrame = playerFrame === 0 ? 1 : 0; }
      }
    }

    window._loopId = requestAnimationFrame(mobileLoop);
  }

  window._loopId = requestAnimationFrame(mobileLoop);
}