// ── SETUP ────────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 800;   // width of the map itself
const PANEL_W = (canvas.width - W) / 2;   // space on each side for the info panels
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

  // Build the noise sounds once and reuse them (much faster on phones)
  const noiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.06, audioCtx.sampleRate);
  const noiseData = noiseBuf.getChannelData(0);
  for (let j = 0; j < noiseData.length; j++) noiseData[j] = (Math.random() * 2 - 1) * (1 - j / noiseData.length);
  const hatNoiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.02, audioCtx.sampleRate);
  const hatNoiseData = hatNoiseBuf.getChannelData(0);
  for (let j = 0; j < hatNoiseData.length; j++) hatNoiseData[j] = (Math.random() * 2 - 1) * (1 - j / hatNoiseData.length);
  function schedulePerc(startTime) {
    for (let i = 0; i < 16; i++) {
      const t = startTime + i * BEAT;
      const isKick  = i % 4 === 0 || i % 4 === 2;
      const isSnare = i % 4 === 1 || i % 4 === 3;
      const buf = noiseBuf;
      const src = audioCtx.createBufferSource();
      const gain = audioCtx.createGain();
      src.buffer = buf;
      src.connect(gain);
      gain.connect(masterGain);
      gain.gain.value = isKick ? 0.09 : isSnare ? 0.05 : 0.02;
      src.start(t);
      nodes.push(src);
      const hatBuf = hatNoiseBuf;
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
  { x: 60,  y: 574, w: 295, h: W_T },
  { x: 459, y: 574, w: 181, h: W_T },
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
  { x: 355, y: 571, w: 104, h: 8,   color: '#a09070' },
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
let ASK_TIME = 600;

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
  keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = true;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','/'].includes(e.key)) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = false; });

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

const MAX_FOLLOWERS = 2;
function followerCount() { return npcs.filter(n => n.state === 'following').length; }

// ── DIFFICULTY RAMP ───────────────────────────────────────────────
let gameTime = 0;                  // frames played in the current run
const START_SPEED = 0.6;           // how fast the game feels at the very start (1 = the old speed)
const MAX_SPEED = 1.5;             // the fastest it ever gets
const RAMP_PER_SECOND = 0.003;     // how quickly it speeds up (0.003 = full speed after about 5 minutes)
function gameSpeed() {
  return Math.min(MAX_SPEED, START_SPEED + (gameTime / 60) * RAMP_PER_SECOND);
}

function pickRandomItem() {
  const beingAsked = npcs.map(n => n.asking ? n.asking.name : null);
  const available = items.filter(i => !i.delivered && !beingAsked.includes(i.name));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// ── RANDOM ITEM SPOTS ─────────────────────────────────────────────
const roomBounds = {
  kitchen:  roomFloors[0],
  living:   roomFloors[1],
  bedroom:  roomFloors[2],
  bathroom: roomFloors[3],
};

function randomSpotInRoom(roomName, placed) {
  const r = roomBounds[roomName];
  const margin = 18;
  for (let tries = 0; tries < 60; tries++) {
    const x = r.x + margin + Math.random() * (r.w - margin * 2);
    const y = r.y + margin + Math.random() * (r.h - margin * 2);
    if (hitsWall(x, y, 14) || hitsFurniture(x, y, 14)) continue;
    if (placed.some(p => Math.hypot(p.x - x, p.y - y) < 45)) continue;
    return { x, y };
  }
  return null;
}

// ── RESET ─────────────────────────────────────────────────────────
function resetGame() {
  items = [];
  for (const d of itemDefs) {
    const spot = randomSpotInRoom(d.room, items) || { x: d.x, y: d.y };
    items.push({ ...d, x: spot.x, y: spot.y, collected: false, delivered: false });
  }
  npcs = npcDefs.map(d => ({ ...d, state: 'idle', asking: null, timer: 0, frustratedTimer: 0 }));
  frustrationCount = 0;
  score = 0;
  gameOver = false;
  activeNPC = null;
  askTimer = 300;
  gameTime = 0;
  dropCooldown = 0;
  carrying = null;
  trail.length = 0;
  player.x = 404;
  player.y = 500;
  gameState = 'playing';
  playGameMusic();
}
// ── GO HOME ───────────────────────────────────────────────────────
function goHome() {
  stopMusic();
  gameState = 'title';
  activeNPC = null;
  joystick.active = false; joystick.id = null; joystick.dx = 0; joystick.dy = 0;
}

// ── UPDATE ───────────────────────────────────────────────────────
function update() {
  frame++;
  if (gameState === 'title' || gameState === 'gameover') return;
    gameTime++;

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

  if ((keys['e'] || keys['E'] || keys['/']) && dropCooldown === 0 && carrying !== null) {
    carrying.x = player.x;
    carrying.y = player.y;
    carrying.collected = false;
    carrying = null;
    dropCooldown = 60;
  }
  if (dropCooldown > 0) dropCooldown--;

  if (keys['r'] || keys['R'] || keys[',']) {
    const following = npcs.find(n => n.state === 'following');
    if (following) {
      following.state = 'asking';
      following.timer = ASK_TIME;
      keys['r'] = false; keys['R'] = false; keys[','] = false;
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

  askTimer -= gameSpeed();
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
      npc.timer -= gameSpeed();
      const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
      if (dist < 40) activeNPC = npc;

      if (activeNPC === npc && (keys['h'] || keys['H'] || keys['.']) && followerCount() < MAX_FOLLOWERS) {
        npc.state = 'following';
        keys['h'] = false; keys['H'] = false; keys['.'] = false;
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

// ── COSY BACKGROUND (drawn once, then reused every frame) ─────────
function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

function paintPlanks(c, x, y, w, h, shades, seam, plankH, seed) {
  const rnd = seededRand(seed);
  c.save();
  c.beginPath(); c.rect(x, y, w, h); c.clip();
  for (let py = y; py < y + h; py += plankH) {
    let px = x - Math.floor(rnd() * 40);
    while (px < x + w) {
      const len = 50 + Math.floor(rnd() * 40);
      c.fillStyle = shades[Math.floor(rnd() * shades.length)];
      c.fillRect(px, py, len, plankH);
      c.fillStyle = seam;
      c.fillRect(px, py + plankH - 1, len, 1);
      c.fillRect(px + len - 1, py, 1, plankH);
      px += len;
    }
  }
  c.restore();
}

function paintTiles(c, x, y, w, h, size, colA, colB, grout) {
  c.save();
  c.beginPath(); c.rect(x, y, w, h); c.clip();
  for (let ty = y, iy = 0; ty < y + h; ty += size, iy++) {
    for (let tx = x, ix = 0; tx < x + w; tx += size, ix++) {
      c.fillStyle = (ix + iy) % 2 === 0 ? colA : colB;
      c.fillRect(tx, ty, size, size);
    }
  }
  c.fillStyle = grout;
  for (let tx = x; tx < x + w; tx += size) c.fillRect(tx, y, 1, h);
  for (let ty = y; ty < y + h; ty += size) c.fillRect(x, ty, w, 1);
  c.restore();
}

function paintRug(c, x, y, w, h, main, border, accent) {
  c.fillStyle = 'rgba(0,0,0,0.18)';
  c.fillRect(x + 3, y + 3, w, h);
  c.fillStyle = border;
  c.fillRect(x, y, w, h);
  c.fillStyle = main;
  c.fillRect(x + 5, y + 5, w - 10, h - 10);
  if (w >= 40 && h >= 40) {
    c.strokeStyle = accent;
    c.lineWidth = 1;
    c.setLineDash([4, 3]);
    c.strokeRect(x + 9.5, y + 9.5, w - 19, h - 19);
    c.setLineDash([]);
    c.fillStyle = accent;
    c.beginPath();
    c.moveTo(x + w / 2, y + h / 2 - 8);
    c.lineTo(x + w / 2 + 12, y + h / 2);
    c.lineTo(x + w / 2, y + h / 2 + 8);
    c.lineTo(x + w / 2 - 12, y + h / 2);
    c.closePath();
    c.fill();
  }
  c.fillStyle = border;
  if (w >= h) {
    for (let fx = x + 3; fx < x + w - 2; fx += 5) { c.fillRect(fx, y - 3, 2, 3); c.fillRect(fx, y + h, 2, 3); }
  } else {
    for (let fy = y + 3; fy < y + h - 2; fy += 5) { c.fillRect(x - 3, fy, 3, 2); c.fillRect(x + w, fy, 3, 2); }
  }
}

function paintOutside(c) {
  c.fillStyle = '#5b8a4e';
  c.fillRect(0, 0, W, H);
  const rnd = seededRand(7);
  for (let i = 0; i < 320; i++) {
    c.fillStyle = rnd() > 0.5 ? '#4f7c44' : '#689a58';
    c.fillRect(rnd() * W, rnd() * H, 2, 4);
  }
  const flowers = ['#f2d36b', '#f0f0f0', '#e58aa5'];
  for (let i = 0; i < 40; i++) {
    c.fillStyle = flowers[Math.floor(rnd() * flowers.length)];
    c.fillRect(rnd() * W, rnd() * H, 3, 3);
  }
  // stone path to the front door
  c.fillStyle = '#b8aa96';
  c.fillRect(355, house.y + house.h, 104, H - (house.y + house.h));
  c.fillStyle = 'rgba(80,65,50,0.35)';
  for (let px = 355; px < 459; px += 26) c.fillRect(px, house.y + house.h, 1, H - (house.y + house.h));
  // soft shadow of the house on the grass
  c.fillStyle = 'rgba(0,0,0,0.25)';
  c.fillRect(house.x + 6, house.y + 6, house.w, house.h);
}

function paintFloors(c) {
  // each room's floor runs right up to (and slightly under) its walls, so nothing leaks between rooms
  const kitchen  = { x: 60,  y: 20,  w: 580, h: 119 };
  const living   = { x: 60,  y: 139, w: 295, h: 218 };
  const hallway  = { x: 349, y: 139, w: 116, h: 441 };
  const bedroom  = { x: 60,  y: 351, w: 295, h: 229 };
  const bathroom = { x: 459, y: 138, w: 181, h: 209 };

  paintTiles(c, kitchen.x, kitchen.y, kitchen.w, kitchen.h, 20, '#eadcc2', '#dfcba9', 'rgba(120,90,60,0.25)');
  paintPlanks(c, living.x, living.y, living.w, living.h, ['#b78a5b', '#ad8053', '#c0935f'], 'rgba(60,35,15,0.35)', 14, 11);
  paintPlanks(c, hallway.x, hallway.y, hallway.w, hallway.h, ['#a9835a', '#9f7a53', '#b38b61'], 'rgba(50,30,10,0.35)', 14, 5);
  // bedroom carpet
  c.fillStyle = '#c9b7d6';
  c.fillRect(bedroom.x, bedroom.y, bedroom.w, bedroom.h);
  const rnd = seededRand(23);
  for (let i = 0; i < 450; i++) {
    c.fillStyle = rnd() > 0.5 ? '#bba6c9' : '#d6c7e0';
    c.fillRect(bedroom.x + rnd() * bedroom.w, bedroom.y + rnd() * bedroom.h, 2, 1);
  }
  paintTiles(c, bathroom.x, bathroom.y, bathroom.w, bathroom.h, 14, '#c6e4e0', '#b0d4cf', 'rgba(60,110,105,0.25)');

  // rugs and mats
  paintRug(c, 130, 215, 130, 85, '#a5503c', '#e2c58f', '#e2c58f');   // living room
  paintRug(c, 150, 440, 110, 70, '#6a5a9a', '#e8def4', '#e8def4');   // bedroom
  paintRug(c, 400, 58, 140, 22, '#c76a4a', '#f0e0c0', '#f0e0c0');    // kitchen mat
  paintRug(c, 540, 235, 70, 45, '#4a8f9a', '#e6f4f4', '#e6f4f4');    // bathroom mat
  paintRug(c, 379, 190, 50, 350, '#8c3b3b', '#e2c58f', '#e2c58f');   // hallway runner
}

function paintClosedOff(c) {
  // the walled-off space below the bathroom: nobody can get in, so it reads as solid
  const x = 465, y = 347, w = 169, h = 227;
  c.save();
  c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = '#3d3025';
  c.fillRect(x, y, w, h);
  c.strokeStyle = 'rgba(255,255,255,0.05)';
  c.lineWidth = 1;
  for (let k = -h; k < w; k += 14) {
    c.beginPath(); c.moveTo(x + k, y + h); c.lineTo(x + k + h, y); c.stroke();
  }
  c.restore();
}

function paintLabels(c) {
  c.font = 'bold 10px monospace';
  c.textAlign = 'center';
  c.fillStyle = 'rgba(60,40,20,0.45)';
  for (const r of roomFloors) {
    const ly = r.label === 'Bathroom' ? 218 : r.ly;
    c.fillText(r.label.toUpperCase(), r.lx, ly);
  }
}

function paintWalls(c) {
  for (const w of walls) {
    c.fillStyle = '#4a3a2c';
    c.fillRect(w.x, w.y, w.w, w.h);
    c.fillStyle = '#6d5742';
    if (w.w >= w.h) c.fillRect(w.x, w.y, w.w, 2);
    else c.fillRect(w.x, w.y, 2, w.h);
  }
}

const wallWindows = [
  { x: 130, y: 20,  w: 50, h: 6 },
  { x: 250, y: 20,  w: 50, h: 6 },
  { x: 60,  y: 270, w: 6,  h: 44 },
  { x: 60,  y: 452, w: 6,  h: 44 },
  { x: 634, y: 200, w: 6,  h: 50 },
];

function paintWindows(c) {
  for (const w of wallWindows) {
    c.fillStyle = '#e8dcc8';
    c.fillRect(w.x - 1, w.y - 1, w.w + 2, w.h + 2);
    c.fillStyle = '#9fd3e6';
    c.fillRect(w.x, w.y, w.w, w.h);
    c.fillStyle = 'rgba(255,255,255,0.55)';
    c.fillRect(w.x + 1, w.y + 1, Math.max(2, w.w / 3), Math.max(2, w.h / 3));
  }
}

function paintDoors(c) {
  for (const d of doorMarkers) {
    c.fillStyle = '#9b7b55';
    c.fillRect(d.x, d.y, d.w, d.h);
    c.fillStyle = '#3a2c20';
    if (d.w > d.h) { c.fillRect(d.x, d.y, 2, d.h); c.fillRect(d.x + d.w - 2, d.y, 2, d.h); }
    else { c.fillRect(d.x, d.y, d.w, 2); c.fillRect(d.x, d.y + d.h - 2, d.w, 2); }
  }
}

function paintFurniture(c) {
  for (const f of furniture) {
    c.fillStyle = 'rgba(0,0,0,0.22)';
    c.fillRect(f.x + 3, f.y + 3, f.w, f.h);
    switch (f.label) {
      case 'counter': {
        c.fillStyle = '#6e4f33';
        c.fillRect(f.x, f.y, f.w, f.h);
        c.fillStyle = '#c9a26f';
        c.fillRect(f.x + 2, f.y + 2, f.w - 4, f.h - 4);
        c.fillStyle = 'rgba(60,35,15,0.35)';
        if (f.w >= f.h) { for (let sx = f.x + 40; sx < f.x + f.w - 4; sx += 40) c.fillRect(sx, f.y + 3, 1, f.h - 6); }
        else { for (let sy = f.y + 20; sy < f.y + f.h - 4; sy += 20) c.fillRect(f.x + 3, sy, f.w - 6, 1); }
        break;
      }
      case 'stove': {
        c.fillStyle = '#3b3b42';
        c.fillRect(f.x, f.y, f.w, f.h);
        for (const bx of [f.x + 6, f.x + 16]) {
          for (const by of [f.y + 8, f.y + 22]) {
            c.fillStyle = '#1d1d22';
            c.beginPath(); c.arc(bx, by, 3.5, 0, Math.PI * 2); c.fill();
            c.strokeStyle = '#8a8a92'; c.lineWidth = 1;
            c.beginPath(); c.arc(bx, by, 3.5, 0, Math.PI * 2); c.stroke();
          }
        }
        break;
      }
      case 'sofa': {
        const horiz = f.w > f.h;
        c.fillStyle = '#9a5444';
        c.fillRect(f.x, f.y, f.w, f.h);
        c.fillStyle = '#6f3a30';
        if (horiz) {
          c.fillRect(f.x, f.y + f.h - 6, f.w, 6);
          c.fillRect(f.x, f.y, 4, f.h);
          c.fillRect(f.x + f.w - 4, f.y, 4, f.h);
        } else {
          c.fillRect(f.x, f.y, 6, f.h);
          c.fillRect(f.x, f.y, f.w, 4);
          c.fillRect(f.x, f.y + f.h - 4, f.w, 4);
        }
        c.fillStyle = 'rgba(0,0,0,0.25)';
        if (horiz) { for (let sx = f.x + 40; sx < f.x + f.w - 4; sx += 40) c.fillRect(sx, f.y + 2, 1, f.h - 8); }
        else { for (let sy = f.y + 27; sy < f.y + f.h - 4; sy += 27) c.fillRect(f.x + 7, sy, f.w - 8, 1); }
        break;
      }
      case 'tv unit': {
        c.fillStyle = '#4b3b2e';
        c.fillRect(f.x, f.y, f.w, f.h);
        c.fillStyle = '#14161d';
        c.fillRect(f.x + 5, f.y + 6, 12, f.h - 12);
        c.fillStyle = '#3a4a78';
        c.fillRect(f.x + 7, f.y + 9, 3, 12);
        break;
      }
      case 'bed': {
        c.fillStyle = '#e8e0d0';
        c.fillRect(f.x, f.y, f.w, f.h);
        c.fillStyle = '#7766aa';
        c.fillRect(f.x, f.y + 20, f.w, f.h - 20);
        c.fillStyle = '#9a8ac4';
        c.fillRect(f.x, f.y + 20, f.w, 4);
        c.fillStyle = '#f6f0e4';
        c.fillRect(f.x + 3, f.y + 4, f.w - 6, 12);
        c.strokeStyle = '#4d3a5a'; c.lineWidth = 1;
        c.strokeRect(f.x + 0.5, f.y + 0.5, f.w - 1, f.h - 1);
        break;
      }
      case 'wardrobe': {
        c.fillStyle = '#5a4030';
        c.fillRect(f.x, f.y, f.w, f.h);
        c.fillStyle = '#6e5340';
        c.fillRect(f.x + 2, f.y + 2, f.w - 4, f.h - 4);
        c.fillStyle = '#3a281c';
        c.fillRect(f.x + 1, f.y + 15, f.w - 2, 1);
        c.fillStyle = '#d8b878';
        c.fillRect(f.x + f.w - 6, f.y + 11, 2, 2);
        c.fillRect(f.x + f.w - 6, f.y + 18, 2, 2);
        break;
      }
      case 'shower': {
        c.fillStyle = '#9ccbdb';
        c.fillRect(f.x, f.y, f.w, f.h);
        c.fillStyle = 'rgba(255,255,255,0.45)';
        for (let sx = f.x + 10; sx < f.x + f.w; sx += 10) c.fillRect(sx, f.y, 1, f.h);
        for (let sy = f.y + 10; sy < f.y + f.h; sy += 10) c.fillRect(f.x, sy, f.w, 1);
        c.fillStyle = '#b0b6bb';
        c.beginPath(); c.arc(f.x + f.w / 2, f.y + 6, 4, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#667';
        c.beginPath(); c.arc(f.x + f.w / 2, f.y + f.h - 8, 2, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#e9f4f8'; c.lineWidth = 1;
        c.strokeRect(f.x + 0.5, f.y + 0.5, f.w - 1, f.h - 1);
        break;
      }
      case 'sink': {
        c.fillStyle = '#d9cdb8';
        c.fillRect(f.x, f.y, f.w, f.h);
        c.fillStyle = '#f4f8fa';
        c.beginPath(); c.ellipse(f.x + f.w / 2, f.y + 14, 10, 8, 0, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#a9b8c2'; c.lineWidth = 1;
        c.beginPath(); c.ellipse(f.x + f.w / 2, f.y + 14, 10, 8, 0, 0, Math.PI * 2); c.stroke();
        c.fillStyle = '#999';
        c.beginPath(); c.arc(f.x + f.w / 2, f.y + 4, 2, 0, Math.PI * 2); c.fill();
        break;
      }
      case 'toilet': {
        c.fillStyle = '#eef0f0';
        c.fillRect(f.x, f.y, f.w, 10);
        c.fillStyle = '#f8fafa';
        c.beginPath(); c.ellipse(f.x + f.w / 2, f.y + 22, 11, 12, 0, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#c4c8cc'; c.lineWidth = 1;
        c.beginPath(); c.ellipse(f.x + f.w / 2, f.y + 22, 11, 12, 0, 0, Math.PI * 2); c.stroke();
        c.fillStyle = '#e4e8ea';
        c.beginPath(); c.ellipse(f.x + f.w / 2, f.y + 22, 6, 7, 0, 0, Math.PI * 2); c.fill();
        break;
      }
      default: {
        c.fillStyle = f.color;
        c.fillRect(f.x, f.y, f.w, f.h);
      }
    }
  }
}

function paintVignette(c) {
  const g = c.createRadialGradient(W / 2, H / 2, 220, W / 2, H / 2, 500);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(30,15,0,0.35)');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
}

let bgCanvas = null;
function buildBackground() {
  bgCanvas = document.createElement('canvas');
  bgCanvas.width = W;
  bgCanvas.height = H;
  const c = bgCanvas.getContext('2d');
  paintOutside(c);
  paintFloors(c);
  paintClosedOff(c);
  paintLabels(c);
  paintWalls(c);
  paintWindows(c);
  paintDoors(c);
  paintFurniture(c);
  paintVignette(c);
}
function drawBackground() {
  if (!bgCanvas) buildBackground();
  ctx.drawImage(bgCanvas, 0, 0);
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
        ctx.fillText(followerCount() >= MAX_FOLLOWERS ? 'Hands full!   [N] I don\'t know' : '[H] Here!   [N] I don\'t know', npc.x, by - 8);
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

function drawPanelCard(x, y, w, h, label) {
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(label, x + 12, y + 18);
}
function drawHUD() {
  // left panel (outside the map): carrying, score, strikes, controls
  drawPanelCard(10, 20, 180, 70, 'CARRYING');
  ctx.textAlign = 'left';
  if (carrying) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(carrying.name, 22, 56);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px monospace';
    ctx.fillText('[E] or [/] to drop', 22, 77);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '16px monospace';
    ctx.fillText('nothing', 22, 56);
  }

  drawPanelCard(10, 102, 180, 56, 'SCORE');
  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(score, 22, 146);

  drawPanelCard(10, 170, 180, 56, 'STRIKES');
  ctx.fillStyle = frustrationCount >= 2 ? '#e05050' : '#ffffff';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('😤 ' + frustrationCount + ' / 3', 22, 214);

  if (!IS_MOBILE) {
    drawPanelCard(10, 250, 180, 130, 'CONTROLS');
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '10px monospace';
    ctx.fillText('MOVE     WASD / arrows', 22, 288);
    ctx.fillText('HERE     H  .  left-click', 22, 308);
    ctx.fillText('DROP     E  /', 22, 328);
    ctx.fillText('RELEASE  R  ,  right-click', 22, 348);
    ctx.fillText('IDK      N', 22, 368);
  }

  // mute and home buttons stay in the map margin
  ctx.save();
  ctx.translate(PANEL_W, 0);

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.roundRect(W - 70, H - 36, 60, 26, 4);
  ctx.fill();
  ctx.fillStyle = muted ? '#e05050' : '#5de0a0';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(muted ? 'MUTE' : 'SOUND', W - 40, H - 18);
    if (gameState === 'playing') {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(W - 50, 10, 40, 40, 6);
    ctx.fill();
    ctx.strokeStyle = '#e05050';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W - 40, 20); ctx.lineTo(W - 20, 40);
    ctx.moveTo(W - 20, 20); ctx.lineTo(W - 40, 40);
    ctx.stroke();
  }

    ctx.restore();
  
  const followers = npcs.filter(n => n.state === 'following');
  followers.forEach((following, idx) => {
    const bw = 160, bh = 56;
      const bx = canvas.width - bw - 10, by = 20 + idx * 64;

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
    if (idx === 0) ctx.fillText('[R] / [,] to release', bx + 10, by + 50);
  });
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
  ctx.fillText('Move: WASD/Arrows  |  Drop: E or /  |  Here: H . or click  |  Release: R , or right-click  |  IDK: N', W / 2, H / 2 + 65);

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
  // side panels sit outside the map
  ctx.fillStyle = gameState === 'title' ? '#1a1a2e' : '#1f1a16';
  ctx.fillRect(0, 0, canvas.width, H);

  // everything on the map is drawn shifted across by the panel width
  ctx.save();
  ctx.translate(PANEL_W, 0);
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.clip();
  ctx.fillStyle = '#3a3028';
  ctx.fillRect(0, 0, W, H);

  if (gameState === 'title') {
    drawTitleScreen();
    ctx.restore();
    return;
  }

  drawBackground();
  drawTrail();
  drawItems();
  drawNPCs();
  drawPlayer();
  ctx.restore();

  drawHUD();

  if (gameState === 'gameover') {
    ctx.save();
    ctx.translate(PANEL_W, 0);
    drawGameOverScreen();
    ctx.restore();
  }
}

// ── CLICK HANDLER ─────────────────────────────────────────────────
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (canvas.width / rect.width) - PANEL_W;
  const cy = (e.clientY - rect.top)  * (canvas.height / rect.height);

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
    if (gameState === 'playing' && cx > W - 50 && cx < W - 10 && cy > 10 && cy < 50) {
    goHome();
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

  // left-click anywhere else = "Here!" for the housemate you're standing next to
  if (gameState === 'playing' && activeNPC && activeNPC.state === 'asking' && followerCount() < MAX_FOLLOWERS) {
    activeNPC.state = 'following';
  }
});

// right-click = release a follower
canvas.addEventListener('contextmenu', e => {
  e.preventDefault();
  if (gameState !== 'playing') return;
  const following = npcs.find(n => n.state === 'following');
  if (following) {
    following.state = 'asking';
    following.timer = ASK_TIME;
  }
});

// ── LOOP ─────────────────────────────────────────────────────────
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}


// ── MOBILE DETECTION ─────────────────────────────────────────────
const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// ── JOYSTICK (mobile only) ────────────────────────────────────────
const joystick = { active: false, baseX: 0, baseY: 0, dx: 0, dy: 0, id: null };

// ── MOBILE SETUP ──────────────────────────────────────────────────
if (IS_MOBILE) {
  // Prevent scrolling
  document.body.style.overflow = 'hidden';
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.background = '#000';

  // Position canvas fixed so it fills screen properly
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';

  // Rotate message
  const rotateMsg = document.createElement('div');
  rotateMsg.id = 'rotateMsg';
  rotateMsg.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:#1a1a2e;color:#5de0a0;font-family:monospace;font-size:22px;text-align:center;flex-direction:column;justify-content:center;align-items:center;gap:20px;z-index:999;';
  rotateMsg.innerHTML = '<div style="font-size:48px">\uD83D\uDD04</div><div>Please rotate your device</div>';
  document.body.appendChild(rotateMsg);

  function resizeCanvas() {
    if (window.innerWidth > window.innerHeight) {
      // Keep the 800x600 aspect ratio and centre it (black bars instead of stretching)
      const scale = Math.min(window.innerWidth / canvas.width, window.innerHeight / canvas.height);
        const w = Math.floor(canvas.width * scale);
      const h = Math.floor(600 * scale);
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      canvas.style.left   = Math.floor((window.innerWidth  - w) / 2) + 'px';
      canvas.style.top    = Math.floor((window.innerHeight - h) / 2) + 'px';
      canvas.style.display = 'block';
      rotateMsg.style.display = 'none';
    } else {
      canvas.style.display = 'none';
      rotateMsg.style.display = 'flex';
    }
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
    document.addEventListener('fullscreenchange', () => setTimeout(resizeCanvas, 100));
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      resizeCanvas();
      // Force a redraw after rotation
      if (window.innerWidth > window.innerHeight) {
        cancelAnimationFrame(window._rafId);
        window._rafId = requestAnimationFrame(loop);
      }
    }, 150);
  });

  // Longer NPC timer on mobile
  ASK_TIME = 1200;

  // Touch coordinate conversion
  function touchToCanvas(touch) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (touch.clientX - rect.left) * (canvas.width / rect.width) - PANEL_W,
      y: (touch.clientY - rect.top)  * (600 / rect.height)
    };
  }

  document.addEventListener('touchstart', e => {
    e.preventDefault();
    e.stopPropagation();
    audioCtx.resume();
    for (const touch of e.changedTouches) {
      const pos = touchToCanvas(touch);

      if (gameState === 'title') {
        if (pos.x > 300 && pos.x < 500 && pos.y > 388 && pos.y < 432) { resetGame(); return; }
        if (pos.x > 730 && pos.x < 790 && pos.y > 564 && pos.y < 590) {
          muted = !muted; if (muted) stopMusic(); else playGameMusic(); return;
        }
        return;
      }
      if (gameState === 'gameover') {
        if (pos.x > 300 && pos.x < 500 && pos.y > 360 && pos.y < 404) { resetGame(); return; }
        if (pos.x > 730 && pos.x < 790 && pos.y > 564 && pos.y < 590) {
          muted = !muted; if (muted) stopMusic(); else playAtmoMusic(); return;
        }
        return;
      }

      // Mute
      if (pos.x > 730 && pos.x < 790 && pos.y > 564 && pos.y < 590) {
        muted = !muted; if (muted) stopMusic(); else playGameMusic(); return;
      }
            // X (home) button
      if (pos.x > 750 && pos.x < 790 && pos.y > 10 && pos.y < 50) { goHome(); return; }
      // R button
      const followingNPC = npcs.find(n => n.state === 'following');
      if (followingNPC && pos.x > 650 && pos.x < 790 && pos.y > 260 && pos.y < 320) {
        followingNPC.state = 'asking'; followingNPC.timer = ASK_TIME; return;
      }
      // E button
      if (carrying && pos.x > 650 && pos.x < 790 && pos.y > 330 && pos.y < 390) {
        if (dropCooldown === 0) {
          carrying.x = player.x; carrying.y = player.y;
          carrying.collected = false; carrying = null; dropCooldown = 60;
        } return;
      }
      // H button
      if (activeNPC && activeNPC.state === 'asking' && followerCount() < MAX_FOLLOWERS && pos.x > 650 && pos.x < 790 && pos.y > 430 && pos.y < 490) {
        activeNPC.state = 'following'; return;
      }
      // N button
      if (activeNPC && activeNPC.state === 'asking' && pos.x > 650 && pos.x < 790 && pos.y > 500 && pos.y < 560) {
        activeNPC.state = 'frustrated';
        activeNPC.frustratedTimer = 180;
        activeNPC.asking = null;
        frustrationCount++;
        soundFrustration();
        if (frustrationCount >= 3) { gameOver = true; gameState = 'gameover'; playAtmoMusic(); }
        return;
      }
      // Joystick
      if (pos.x < 400 && pos.y > 300 && joystick.id === null) {
        joystick.active = true;
        joystick.id = touch.identifier;
        joystick.baseX = pos.x; joystick.baseY = pos.y;
        joystick.dx = 0; joystick.dy = 0;
      }
    }
  }, { passive: false });

  document.addEventListener('touchmove', e => {
    e.preventDefault();
    e.stopPropagation();
    for (const touch of e.changedTouches) {
      if (touch.identifier === joystick.id) {
        const pos = touchToCanvas(touch);
        const ddx = pos.x - joystick.baseX;
        const ddy = pos.y - joystick.baseY;
        const dist = Math.hypot(ddx, ddy);
        joystick.dx = ddx / Math.max(dist, 50);
        joystick.dy = ddy / Math.max(dist, 50);
      }
    }
  }, { passive: false });

  document.addEventListener('touchend', e => {
    e.preventDefault();
    e.stopPropagation();
        // Request fullscreen on first tap (Android / iPad; iPhone Safari doesn't support it)
    const docEl = document.documentElement;
    if (!document.fullscreenElement && docEl.requestFullscreen) {
      docEl.requestFullscreen().then(() => {
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape').catch(() => {});
        }
      }).catch(() => {});
    }
    for (const touch of e.changedTouches) {
      if (touch.identifier === joystick.id) {
        joystick.active = false; joystick.id = null;
        joystick.dx = 0; joystick.dy = 0;
      }
    }
  }, { passive: false });
}

// ── DRAW MOBILE CONTROLS ──────────────────────────────────────────
function drawMobileControls() {
  if (!IS_MOBILE || gameState !== 'playing') return;
  const btnW = 130, btnH = 56, btnX = 800 - 140;

  // Joystick
  if (joystick.active) {
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath(); ctx.arc(joystick.baseX, joystick.baseY, 55, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(joystick.baseX, joystick.baseY, 55, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(93,224,160,0.75)';
    ctx.beginPath(); ctx.arc(joystick.baseX + joystick.dx * 55, joystick.baseY + joystick.dy * 55, 26, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(120, 480, 55, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath(); ctx.arc(120, 480, 26, 0, Math.PI * 2); ctx.fill();
  }

  const followingNPC = npcs.find(n => n.state === 'following');
  if (followingNPC) {
    ctx.fillStyle = 'rgba(160,160,255,0.85)';
    ctx.beginPath(); ctx.roundRect(btnX, 260, btnW, btnH, 8); ctx.fill();
    ctx.fillStyle = '#000'; ctx.font = 'bold 17px monospace'; ctx.textAlign = 'center';
    ctx.fillText('[R] Release', btnX + btnW/2, 294);
  }
  if (carrying) {
    ctx.fillStyle = 'rgba(255,200,60,0.85)';
    ctx.beginPath(); ctx.roundRect(btnX, 330, btnW, btnH, 8); ctx.fill();
    ctx.fillStyle = '#000'; ctx.font = 'bold 17px monospace'; ctx.textAlign = 'center';
    ctx.fillText('[E] Drop', btnX + btnW/2, 364);
  }
  if (activeNPC && activeNPC.state === 'asking') {
    ctx.fillStyle = followerCount() >= MAX_FOLLOWERS ? 'rgba(120,120,120,0.6)' : 'rgba(80,224,128,0.85)';
    ctx.beginPath(); ctx.roundRect(btnX, 430, btnW, btnH, 8); ctx.fill();
    ctx.fillStyle = '#000'; ctx.font = 'bold 17px monospace'; ctx.textAlign = 'center';
    ctx.fillText(followerCount() >= MAX_FOLLOWERS ? 'Hands full' : '[H] Here!', btnX + btnW/2, 464);
    ctx.fillStyle = 'rgba(224,80,80,0.85)';
    ctx.beginPath(); ctx.roundRect(btnX, 500, btnW, btnH, 8); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 17px monospace'; ctx.textAlign = 'center';
    ctx.fillText('[N] IDK', btnX + btnW/2, 534);
  }
}

// ── UNIFIED LOOP ──────────────────────────────────────────────────
function loop() {
  // Mobile joystick movement
  if (IS_MOBILE && joystick.active) {
    const R = player.size / 2;
    const keysActive = keys['ArrowLeft'] || keys['ArrowRight'] || keys['ArrowUp'] || keys['ArrowDown'] ||
                       keys['a'] || keys['d'] || keys['w'] || keys['s'];
    if (!keysActive) {
      const nx = player.x + joystick.dx * player.speed;
      const ny = player.y + joystick.dy * player.speed;
      if (insideHouse(nx, player.y, R) && !hitsWall(nx, player.y, R) && !hitsFurniture(nx, player.y, R)) player.x = nx;
      if (insideHouse(player.x, ny, R) && !hitsWall(player.x, ny, R) && !hitsFurniture(player.x, ny, R)) player.y = ny;

      // Sprite direction from joystick
      if      (Math.abs(joystick.dy) > Math.abs(joystick.dx) && joystick.dy >  0.1) playerDir = 0;
      else if (Math.abs(joystick.dy) > Math.abs(joystick.dx) && joystick.dy < -0.1) playerDir = 1;
      else if (joystick.dx < -0.1) playerDir = 2;
      else if (joystick.dx >  0.1) playerDir = 3;
      animTimer++;
      if (animTimer >= ANIM_SPEED) { animTimer = 0; playerFrame = playerFrame === 0 ? 1 : 0; }

      if (Math.abs(joystick.dx) > 0.1 || Math.abs(joystick.dy) > 0.1) {
        trail.push({ x: player.x, y: player.y });
        if (trail.length > TRAIL_LENGTH) trail.shift();
      }
    }
  }

  update();
  draw();
  ctx.save();
  ctx.translate(PANEL_W, 0);
  drawMobileControls();
  ctx.restore();
  window._rafId = requestAnimationFrame(loop);
}

loop();