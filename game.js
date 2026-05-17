// ── SETUP ────────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// ── PLAYER ───────────────────────────────────────────────────────
const player = {
  x: 400,
  y: 300,
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

// ── UPDATE ───────────────────────────────────────────────────────
function update() {
  let dx = 0, dy = 0;
  if (keys['ArrowLeft']  || keys['a']) dx -= 1;
  if (keys['ArrowRight'] || keys['d']) dx += 1;
  if (keys['ArrowUp']    || keys['w']) dy -= 1;
  if (keys['ArrowDown']  || keys['s']) dy += 1;
  if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
  player.x = Math.max(player.size, Math.min(W - player.size, player.x + dx * player.speed));
  player.y = Math.max(player.size, Math.min(H - player.size, player.y + dy * player.speed));
}

// ── DRAW ─────────────────────────────────────────────────────────
function draw() {
  // Background
  ctx.fillStyle = '#e8d5b0';
  ctx.fillRect(0, 0, W, H);

  // Player
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
  ctx.fill();
}

// ── LOOP ─────────────────────────────────────────────────────────
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();