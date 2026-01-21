const messageEl = document.getElementById("message");
const gameEl = document.getElementById("game");
const levelInput = document.getElementById("levelInput");

let level = [
  "                    ",
  "                    ",
  "                    ",
  "                    ",
  "                    ",
  "          ###       ",
  "                    ",
  "              ###   ",
  "          ^         ",
  "####################"
].map(r => r.split(""));

const START_POS = { x: 2, y: 8 };

let player;
let cursor = { x: 0, y: 0 };
let inEditMode = false;
let showTextarea = false;
let hasWon = false;
const keys = {};
const prevKeys = {};

resetPlayer();

/* ================= INPUT ================= */

window.addEventListener("keydown", e => {
  keys[e.code] = true;

  if (e.code === "BracketRight") inEditMode = !inEditMode;

  if (e.code === "KeyT") {
    showTextarea = !showTextarea;
    levelInput.style.display = showTextarea ? "block" : "none";
    if (showTextarea) {
      levelInput.value = level.map(r => r.join("")).join("\n");
    }
  }

  if (e.code === "KeyR") resetPlayer();

  if (showTextarea && e.code === "Enter" && !e.shiftKey) {
    e.preventDefault();
    loadLevelFromTextarea();
  }
});

window.addEventListener("keyup", e => {
  keys[e.code] = false;
});

/* ================= GAME LOGIC ================= */

function resetPlayer() {
  player = {
    x: START_POS.x,
    y: START_POS.y,
    jumping: false,
    jumpHeight: 2,
    jumpProgress: 0
  };
  hasWon = false;
  messageEl.textContent = "";
}

function isSolid(x, y) {
  if (x < 0 || x >= level[0].length || y < 0 || y >= level.length) return true;
  return level[y][x] === "#";
}

function canMoveTo(x, y) {
  if (x < 0 || x >= level[0].length || y < 0 || y >= level.length) return false;
  return level[y][x] !== "#";
}

function applyGravity() {
  if (!isSolid(player.x, player.y + 1)) player.y++;
}

function tryJump() {
  if (player.jumping) return;
  if (isSolid(player.x, player.y + 1)) {
    player.jumping = true;
    player.jumpProgress = player.jumpHeight;
  }
}

function checkHazards() {
  const tile = level[player.y]?.[player.x];
  if (tile === "^") resetPlayer();
  if (tile === "G" && !hasWon) {
    hasWon = true;
    messageEl.textContent = "You won! Press R to restart";
  }
}

/* ================= DRAW ================= */

function draw() {
  let out = "";
  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[0].length; x++) {
      if (inEditMode && x === cursor.x && y === cursor.y) out += "!";
      else if (!inEditMode && x === player.x && y === player.y) out += "@";
      else out += level[y][x];
    }
    out += "\n";
  }
  gameEl.textContent = out;
  gameEl.className = inEditMode ? "editMode" : "";
}

/* ================= UPDATE LOOP ================= */

function update() {
  if (showTextarea) return;

  if (inEditMode) {
    if (keys.ArrowLeft) cursor.x = Math.max(0, cursor.x - 1);
    if (keys.ArrowRight) cursor.x = Math.min(level[0].length - 1, cursor.x + 1);
    if (keys.ArrowUp) cursor.y = Math.max(0, cursor.y - 1);
    if (keys.ArrowDown) cursor.y = Math.min(level.length - 1, cursor.y + 1);

    if (keys.KeyA && !prevKeys.KeyA) level[cursor.y][cursor.x] = "#";
    if (keys.KeyS && !prevKeys.KeyS) level[cursor.y][cursor.x] = "^";
    if (keys.KeyD && !prevKeys.KeyD) level[cursor.y][cursor.x] = "G";
    if (keys.Space && !prevKeys.Space) level[cursor.y][cursor.x] = " ";
  } else {
    if ((keys.ArrowLeft || keys.KeyA) && canMoveTo(player.x - 1, player.y)) player.x--;
    if ((keys.ArrowRight || keys.KeyD) && canMoveTo(player.x + 1, player.y)) player.x++;

    if (keys.ArrowUp || keys.KeyW || keys.Space) tryJump();

    if (player.jumping) {
      if (player.jumpProgress > 0 && canMoveTo(player.x, player.y - 1)) {
        player.y--;
        player.jumpProgress--;
      } else {
        player.jumping = false;
      }
    } else {
      applyGravity();
    }

    checkHazards();
  }

  Object.assign(prevKeys, keys);
  draw();
}

/* ================= LEVEL LOAD ================= */

function loadLevelFromTextarea() {
  const lines = levelInput.value.replace(/\r/g, "").split("\n");
  level = lines.map(l => l.padEnd(level[0].length, " ").split(""));
  resetPlayer();
  cursor = { x: 0, y: 0 };
  draw();
}

draw();
setInterval(update, 120);
