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
  // OUTER WALLS
  { x: 60,  y: 20,  w: 580, h: W_T },
  { x: 60,  y: 574, w: 190, h: W_T },
  { x: 450, y: 574, w: 190, h: W_T },
  { x: 60,  y: 20,  w: W_T, h: 560 },
  { x: 634, y: 20,  w: W_T, h: 560 },

  // KITCHEN BOTTOM — right side only
  { x: 459, y: 138, w: 175, h: W_T },

  // LIVING ROOM right wall / HALLWAY left wall
  { x: 349, y: 138, w: W_T, h: 92  },
  { x: 349, y: 290, w: W_T, h: 61  },
  { x: 349, y: 351, w: W_T, h: 109 },
  { x: 349, y: 520, w: W_T, h: 59  },

  // BATHROOM left wall / HALLWAY right wall
  { x: 459, y: 138, w: W_T, h: 92  },
  { x: 459, y: 290, w: W_T, h: 57  },

  // BATHROOM bottom wall
  { x: 459, y: 341, w: 175, h: W_T },

  // INNER WALL — right of hallway below bathroom
  { x: 459, y: 347, w: W_T, h: 233 },

  // BEDROOM top wall
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
// Each piece has a position, size, colour, and label
// They block the player just like walls do
const furniture = [
  // KITCHEN
  // Back door gap on very left — counter starts after a 30px gap
{ x: 390, y: 26,  w: 160, h: 22, color: '#8a6a4a', label: 'counter'  },  // top counter left
  { x: 570, y: 26,  w: 44,  h: 22, color: '#8a6a4a', label: 'counter'  },  // top counter right
  // Right wall counter with stove in middle
  { x: 618, y: 26,  w: 22,  h: 40, color: '#8a6a4a', label: 'counter'  },  // right counter top
  { x: 618, y: 86,  w: 22,  h: 40, color: '#8a6a4a', label: 'counter'  },  // right counter bottom
  { x: 618, y: 56,  w: 22,  h: 30, color: '#555555', label: 'stove'    },  // stove in middle

  // LIVING ROOM
  { x: 66,  y: 180, w: 20,  h: 80, color: '#7a5a3a', label: 'sofa'     },  // sofa left wall
  { x: 66,  y: 320, w: 120, h: 20, color: '#7a5a3a', label: 'sofa'     },  // sofa bottom wall
{ x: 320, y: 168, w: 20,  h: 60, color: '#4a4a6a', label: 'tv unit'  },  // tv unit right wall

  // BEDROOM
  { x: 66,  y: 360, w: 20,  h: 80, color: '#6a5a8a', label: 'bed'      },  // bed left wall
  { x: 66,  y: 500, w: 20,  h: 30, color: '#5a4a6a', label: 'wardrobe' },  // wardrobe corner

  // BATHROOM
  { x: 474, y: 164, w: 40,  h: 30, color: '#6a9aaa', label: 'shower'   },  // shower top left
  { x: 530, y: 164, w: 30,  h: 25, color: '#aac8d4', label: 'sink'     },  // sink middle
  { x: 474, y: 290, w: 30,  h: 35, color: '#d4d4d4', label: 'toilet'   },  // toilet opposite door
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
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(f.x + 3, f.y + 3, f.w, f.h);
    // Body
    ctx.fillStyle = f.color;
    ctx.fillRect(f.x, f.y, f.w, f.h);
    // Label
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
  drawPlayer();
  drawHUD();
}

// ── LOOP ─────────────────────────────────────────────────────────
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();