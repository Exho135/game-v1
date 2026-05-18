// ── SETUP ────────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// ── HOUSE FLOOR ──────────────────────────────────────────────────
const house = { x: 60, y: 20, w: 580, h: 560 };

// ── ROOM FLOORS (visual only) ─────────────────────────────────────
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

// ── DOOR MARKERS (visual only) ────────────────────────────────────
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
const items = [
  { x: 120, y: 60,  name: 'fork',       color: '#aaaaaa', collected: false, room: 'kitchen'  },
  { x: 200, y: 80,  name: 'mug',        color: '#c8603a', collected: false, room: 'kitchen'  },
  { x: 150, y: 220, name: 'controller', color: '#222244', collected: false, room: 'living'   },
  { x: 220, y: 280, name: 'blanket',    color: '#7a4a8a', collected: false, room: 'living'   },
  { x: 120, y: 420, name: 'shoes',      color: '#8a6a3a', collected: false, room: 'bedroom'  },
  { x: 220, y: 480, name: 'hoodie',     color: '#4a6a8a', collected: false, room: 'bedroom'  },
  { x: 520, y: 220, name: 'toothpaste', color: '#3a8a6a', collected: false, room: 'bathroom' },
  { x: 560, y: 280, name: 'towel',      color: '#d4a0a0', collected: false, room: 'bathroom' },
];

// ── CARRYING & COOLDOWN ───────────────────────────────────────────
let carrying = null;
let dropCooldown = 0;

// ── NPCS ──────────────────────────────────────────────────────────
// Each NPC stands at their door and asks for a random item
// doorX/doorY is where they stand in the hallway
// asking = the item they currently want
// timer = frames remaining before they give up (600 = 10 seconds at 60fps)
// state: 'idle' | 'asking' | 'following' | 'frustrated' | 'satisfied'

const ASK_TIME = 600; // 10 seconds at 60fps

const npcs = [
  {
    name: 'Amee G',
    x: 345, y: 250,       // stands at living room door
    color: '#e8a0c0',
    state: 'idle',
    asking: null,
    timer: 0,
    frustratedTimer: 0,
  },
  {
    name: 'Mary',
    x: 345, y: 490,       // stands at bedroom door
    color: '#a0c0e8',
    state: 'idle',
    asking: null,
    timer: 0,
    frustratedTimer: 0,
  },
  {
    name: 'E',
    x: 390, y: 143,       // stands at kitchen door
    color: '#a0e8b0',
    state: 'idle',
    asking: null,
    timer: 0,
    frustratedTimer: 0,
  },
  {
    name: 'H',
    x: 463, y: 250,       // stands at bathroom door
    color: '#e8d0a0',
    state: 'idle',
    asking: null,
    timer: 0,
    frustratedTimer: 0,
  },
];

// ── GAME STATE ────────────────────────────────────────────────────
let frustrationCount = 0;  // total idk's across all npcs — 3 = game over
let score = 0;
let gameOver = false;
let activeNPC = null;      // which NPC the player is currently close to

// How often a new NPC starts asking (in frames)
// Starts at every 5 seconds, gets faster as score increases
function getAskInterval() {
  return Math.max(120, 300 - score * 10);
}
let askTimer = 180; // first NPC asks after 3 seconds

// Pick a random uncollected item for an NPC to ask about
function pickRandomItem() {
  const available = items.filter(i => !i.collected);
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// ── PLAYER ───────────────────────────────────────────────────────
const player = {
  x: 404,
  y: 500,
  size: 14,
  speed: 3,
  color: '#5de0a0'
};

// ── KEYBOARD ─────────────────────────────────────────────────────
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.key] = true;
  e.preventDefault();
});
window.addEventListener('keyup', e => {
  keys[e.key] = false;
});

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
  for (const w of walls) {
    if (circleRect(x, y, r, w.x, w.y, w.w, w.h)) return true;
  }
  return false;
}

function hitsFurniture(x, y, r) {
  for (const f of furniture) {
    if (circleRect(x, y, r, f.x, f.y, f.w, f.h)) return true;
  }
  return false;
}

// ── UPDATE ───────────────────────────────────────────────────────
function update() {
  if (gameOver) return;

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

  // ── ITEM DROP ─────────────────────────────────────────────────
  if ((keys['e'] || keys['E']) && dropCooldown === 0) {
    if (carrying !== null) {
      carrying.x = player.x;
      carrying.y = player.y;
      carrying.collected = false;
      carrying = null;
      dropCooldown = 60;
    }
  }
  if (dropCooldown > 0) dropCooldown--;

  // ── ITEM PICKUP ───────────────────────────────────────────────
  if (carrying === null && dropCooldown === 0) {
    for (const item of items) {
      if (item.collected) continue;
      const dist = Math.hypot(player.x - item.x, player.y - item.y);
      if (dist < 20) {
        item.collected = true;
        carrying = item;
        break;
      }
    }
  }

  // ── NPC SPAWNING ──────────────────────────────────────────────
  // Count down the ask timer — when it hits 0 wake up an idle NPC
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

  // ── NPC LOGIC ─────────────────────────────────────────────────
  activeNPC = null;
  for (const npc of npcs) {
    if (npc.state === 'asking') {
      // Count down their patience timer
      npc.timer--;

      // Check if player is close enough to interact
      const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
      if (dist < 40) activeNPC = npc;

      // H key — "Here!" player agrees to help
      if (activeNPC === npc && (keys['h'] || keys['H'])) {
        npc.state = 'following';
        keys['h'] = false; keys['H'] = false;
      }

      // N key — "I don't know"
      if (activeNPC === npc && (keys['n'] || keys['N'])) {
        npc.state = 'frustrated';
        npc.frustratedTimer = 180; // show frustrated for 3 seconds
        npc.asking = null;
        frustrationCount++;
        keys['n'] = false; keys['N'] = false;
        if (frustrationCount >= 3) gameOver = true;
      }

      // Timer ran out — same as pressing N
      if (npc.timer <= 0) {
        npc.state = 'frustrated';
        npc.frustratedTimer = 180;
        npc.asking = null;
        frustrationCount++;
        if (frustrationCount >= 3) gameOver = true;
      }
    }

    if (npc.state === 'following') {
      // NPC slowly follows the player
      const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
      if (dist > 30) {
        const angle = Math.atan2(player.y - npc.y, player.x - npc.x);
        npc.x += Math.cos(angle) * 2;
        npc.y += Math.sin(angle) * 2;
      }

      // Check if player is carrying the right item and is close to the NPC
      if (carrying && carrying.name === npc.asking.name && dist < 40) {
        // Delivered!
        score++;
        carrying.collected = true;
        carrying = null;
        dropCooldown = 60;
        npc.state = 'satisfied';
        npc.frustratedTimer = 180;
        npc.asking = null;
      }
    }

    if (npc.state === 'frustrated' || npc.state === 'satisfied') {
      npc.frustratedTimer--;
      if (npc.frustratedTimer <= 0) {
        npc.state = 'idle';
      }
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
  for (const w of walls) {
    ctx.fillRect(w.x, w.y, w.w, w.h);
  }
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

function drawItems() {
  for (const item of items) {
    if (item.collected) continue;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.arc(item.x, item.y, 12, 0, Math.PI * 2);
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

    // Body colour changes based on state
    let bodyColor = npc.color;
    if (npc.state === 'frustrated') bodyColor = '#e04040';
    if (npc.state === 'satisfied')  bodyColor = '#40e080';

    // Glow
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.arc(npc.x, npc.y, 16, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(npc.x, npc.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Name
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(npc.name, npc.x, npc.y - 18);

    // Speech bubble when asking
    if (npc.state === 'asking' && npc.asking) {
      const msg = 'Where is the ' + npc.asking.name + '?';
      const bw = msg.length * 6 + 16;
      const bh = 22;
      const bx = npc.x - bw / 2;
      const by = npc.y - 46;

      // Bubble background
      ctx.fillStyle = 'rgba(255,255,240,0.95)';
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 4);
      ctx.fill();

      // Bubble text
      ctx.fillStyle = '#333';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(msg, npc.x, by + 15);

      // Bubble tail
      ctx.fillStyle = 'rgba(255,255,240,0.95)';
      ctx.beginPath();
      ctx.moveTo(npc.x - 4, by + bh);
      ctx.lineTo(npc.x, by + bh + 6);
      ctx.lineTo(npc.x + 4, by + bh);
      ctx.fill();

      // Timer bar below bubble
      const timerFrac = npc.timer / ASK_TIME;
      const barW = bw;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(bx, by + bh + 8, barW, 4);
      ctx.fillStyle = timerFrac > 0.5 ? '#50e080' : timerFrac > 0.25 ? '#e0d050' : '#e05050';
      ctx.fillRect(bx, by + bh + 8, barW * timerFrac, 4);

      // H / N prompt when player is close
      if (activeNPC === npc) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[H] Here!   [N] I don\'t know', npc.x, by - 8);
      }
    }

    // Frustrated state
    if (npc.state === 'frustrated') {
      ctx.fillStyle = '#e04040';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('😤', npc.x, npc.y - 18);
    }

    // Satisfied state
    if (npc.state === 'satisfied') {
      ctx.fillStyle = '#40e080';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('😊', npc.x, npc.y - 18);
    }
  }
}

function drawHUD() {
  // Carrying
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

  // Score
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 48, 120, 26);
  ctx.fillStyle = '#ffe066';
  ctx.font = '12px monospace';
  ctx.fillText('Score: ' + score, 20, 66);

  // Frustration count
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 82, 160, 26);
  ctx.fillStyle = frustrationCount >= 2 ? '#e05050' : '#ffffff';
  ctx.font = '12px monospace';
  ctx.fillText('😤 ' + frustrationCount + ' / 3  strikes', 20, 100);
}

function drawGameOver() {
  if (!gameOver) return;
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#e05050';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', W / 2, H / 2 - 20);
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px monospace';
  ctx.fillText('Score: ' + score, W / 2, H / 2 + 20);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '12px monospace';
  ctx.fillText('Refresh to play again', W / 2, H / 2 + 50);
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

function draw() {
  ctx.fillStyle = '#3a3028';
  ctx.fillRect(0, 0, W, H);
  drawHouse();
  drawWalls();
  drawDoorMarkers();
  drawFurniture();
  drawItems();
  drawNPCs();
  drawPlayer();
  drawHUD();
  drawGameOver();
}

// ── LOOP ─────────────────────────────────────────────────────────
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();