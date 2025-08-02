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
    ].map(row => row.split(""));

    const START_POS = { x: 2, y: 8 };
    let player = { x: START_POS.x, y: START_POS.y, jumping: false, jumpHeight: 2, jumpProgress: 0 };
    let cursor = { x: 0, y: 0 };
    let inEditMode = false;
    let showTextarea = false;
    let hasWon = false;
    const keys = {};

    window.addEventListener("keydown", e => {
      keys[e.code] = true;

      if (e.code === "BracketRight") {
        inEditMode = !inEditMode;
      }

      if (e.code === "KeyT") {
        showTextarea = !showTextarea;
        levelInput.style.display = showTextarea ? "block" : "none";
        if (showTextarea) {
          levelInput.value = level.map(row => row.join("")).join("\n");
        }
      }

      if (showTextarea && e.code === "Enter" && !e.shiftKey) {
        e.preventDefault();
        loadLevelFromTextarea();
      }
    });

    window.addEventListener("keyup", e => keys[e.code] = false);

    function resetPlayer() {
  player = { x: START_POS.x, y: START_POS.y, jumping: false, jumpHeight: 2, jumpProgress: 0 };
  winMessage = "";
  messageEl.textContent = "";
  gameWon = false;
}


    function canMoveTo(x, y) {
      if (x < 0 || x >= level[0].length || y < 0 || y >= level.length) return false;
      const tile = level[y][x];
      return tile === " " || tile === "^" || tile === "G";
    }

    function applyGravity() {
      const below = player.y + 1;
      if (canMoveTo(player.x, below)) player.y++;
    }

    function tryJump() {
      const below = player.y + 1;
      const onGround = below < level.length && level[below][player.x] === "#";
      if (!player.jumping && onGround) {
        player.jumping = true;
        player.jumpProgress = player.jumpHeight;
      }
    }

    function checkSpike() {
      if (level[player.y][player.x] === "^") resetPlayer();
    }

    function checkGoal() {
  if (!winMessage && level[player.y][player.x] === "G") {
    winMessage = "You won. Press R to restart";
    messageEl.textContent = winMessage;
    for (let key in keys) keys[key] = false;
  }
}
window.addEventListener("keydown", e => {
  keys[e.code] = true;
  if (e.code === "KeyR") {
    resetPlayer();
  }
});


    function draw() {
  let output = "";
  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[0].length; x++) {
      if (inEditMode && x === cursor.x && y === cursor.y) {
        output += "!"; // Cursor in edit mode
      } else if (x === player.x && y === player.y && !inEditMode) {
        output += "@"; // Player in the game
      } else {
        const tile = level[y][x];  // Get tile from the level
        output += tile !== undefined ? tile : " ";  // Replace undefined with space
      }
    }
    output += "\n";  // New line for each row
  }
  gameEl.textContent = output;
  gameEl.className = inEditMode ? "editMode" : "";
}

    function update() {
      if (showTextarea) return;

      if (inEditMode) {
        // Editor mode
        if (keys["ArrowLeft"]) cursor.x = Math.max(0, cursor.x - 1);
        if (keys["ArrowRight"]) cursor.x = Math.min(level[0].length - 1, cursor.x + 1);
        if (keys["ArrowUp"]) cursor.y = Math.max(0, cursor.y - 1);
        if (keys["ArrowDown"]) cursor.y = Math.min(level.length - 1, cursor.y + 1);

        // Place tiles with keys
        ["Space", "KeyA", "KeyS", "KeyD"].forEach(code => {
          if (keys[code]) {
            let char;
            if (code === "Space") char = " ";
            else if (code === "KeyA") char = "#";
            else if (code === "KeyS") char = "^";
            else if (code === "KeyD") char = "G";
          }
        });
      } else {
        // Game mode
        if ((keys["ArrowLeft"] || keys["KeyA"]) && canMoveTo(player.x - 1, player.y)) player.x--;
        if ((keys["ArrowRight"] || keys["KeyD"]) && canMoveTo(player.x + 1, player.y)) player.x++;
        if ((keys["ArrowUp"] || keys["KeyW"] || keys["Space"])) tryJump();

        if (player.jumping) {
          const targetY = player.y - 1;
          if (player.jumpProgress > 0 && canMoveTo(player.x, targetY)) {
            player.y = targetY;
            player.jumpProgress--;
          } else {
            player.jumping = false;
          }
        } else {
          applyGravity();
        }

        checkSpike();
        if (player.y >= level.length) {
            resetPlayer();
        }
        checkGoal();
      }

      draw();
    }

    function loadLevelFromTextarea() {
  const raw = levelInput.value.trim();  // Get the raw input (trim only the overall content)
  const normalizedInput = raw.replace(/\r\n/g, '\n');  // Normalize to Unix-style newlines

  const lines = normalizedInput.split("\n");  // Split lines without trimming each one

  // Filter out empty lines and rows with no content
  const filteredLines = lines.filter(line => line.length > 0);

  if (filteredLines.length > 0) {
    level = filteredLines.map(row => row.split("")); // Create a 2D array for the level
    resetPlayer(); // Reset player
    cursor = { x: 0, y: 0 }; // Reset cursor
    draw(); // Re-draw the game
  } else {
    console.log("No valid level data found");
  }
}

    draw();
    setInterval(update, 150);
