// ============================================================================
// LOGIC TRÒ CHƠI, ĐỒ HỌA CANVAS & CHẾ ĐỘ LẬP TRÌNH SCRATCH (MÀN 11+)
// ============================================================================

const DIR_ICONS = { UP: "⬆️", DOWN: "⬇️", LEFT: "⬅️", RIGHT: "➡️" };
const DIR_LABELS = { UP: "⬆️ Đi lên", DOWN: "⬇️ Đi xuống", LEFT: "⬅️ Sang trái", RIGHT: "➡️ Sang phải" };

// Âm thanh Web Audio API
let soundEnabled = true;
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function playTone(freq, type = "sine", duration = 0.14, vol = 0.14) {
  if (!soundEnabled) return;
  if (!audioCtx) audioCtx = new AudioCtx();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

const SFX = {
  click: () => playTone(520, "triangle", 0.08, 0.12),
  snap: () => playTone(680, "sine", 0.07, 0.14),
  move: () => playTone(310, "sine", 0.11, 0.1),
  honk: () => {
    playTone(440, "sawtooth", 0.12, 0.14);
    setTimeout(() => playTone(554.37, "sawtooth", 0.16, 0.14), 130);
  },
  star: () => {
    playTone(660, "sine", 0.12, 0.15);
    setTimeout(() => playTone(880, "sine", 0.2, 0.15), 90);
  },
  bump: () => {
    playTone(180, "sawtooth", 0.18, 0.14);
    setTimeout(() => playTone(130, "sawtooth", 0.22, 0.14), 100);
  },
  win: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((n, i) =>
      setTimeout(() => playTone(n, "triangle", 0.2, 0.15), i * 100)
    );
  },
  gift: () => {
    [440, 554.37, 659.25, 880, 1108.73, 1318.5].forEach((n, i) =>
      setTimeout(() => playTone(n, "triangle", 0.25, 0.18), i * 95)
    );
  }
};

// ============================================================================
// TRẠNG THÁI CHUNG
// ============================================================================
let gameMode = "BASIC"; // "BASIC" (Màn 1-10) hoặc "SCRATCH" (Màn 11+)
let currentLevelIdx = 0;
let scratchLevelIdx = 0;
let activeLevel = null;
let commands = [];
let isRunning = false;
let showHintPath = false;
let carState = { r: 0, c: 0, x: 0, y: 0, angle: 0 };
let collectedStars = [];
let confettiParticles = [];
let tireTracks = [];
let honkBubbleTimer = 0;

let completedLevels = [];
let equippedTierIdx = 0;

// Trạng thái Scratch AST
let scratchBlocks = []; // [{ id, type: 'MOVE'|'REPEAT'|'HONK', dir?, count?, children?: [] }]
let selectedScratchTarget = "main"; // "main" hoặc id của khối REPEAT
let scBlockIdCounter = 1;
let draggedPaletteData = null;

function loadProgress() {
  try {
    completedLevels = JSON.parse(localStorage.getItem("thinkplay_completed_levels") || "[]");
    const saved = Number(localStorage.getItem("thinkplay_equipped_car_tier") || "0");
    if (isCarUnlocked(saved)) equippedTierIdx = saved;
  } catch (e) {
    completedLevels = [];
    equippedTierIdx = 0;
  }
}

function saveProgress() {
  try {
    localStorage.setItem("thinkplay_completed_levels", JSON.stringify(completedLevels));
    localStorage.setItem("thinkplay_equipped_car_tier", String(equippedTierIdx));
  } catch (e) {}
}

function isCarUnlocked(idx) {
  const car = GRAPHICS_ASSETS.cars[idx];
  if (!car) return false;
  if (car.unlockAfterLevel <= 0) return true;
  return completedLevels.includes(car.unlockAfterLevel) || completedLevels.length >= car.unlockAfterLevel;
}

function getEquippedCar() {
  return GRAPHICS_ASSETS.cars[equippedTierIdx] || GRAPHICS_ASSETS.cars[0];
}

function updateCarBadge() {
  document.getElementById("carTierBadge").textContent = `Cấp ${getEquippedCar().tier}`;
}

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ============================================================================
// CHUYỂN CHẾ ĐỘ & TẢI MÀN CHƠI
// ============================================================================
function switchMode(mode) {
  if (isRunning) return;
  gameMode = mode;
  const basicPanel = document.getElementById("basicControlPanel");
  const scratchPanel = document.getElementById("scratchControlPanel");
  const modeBtn = document.getElementById("btnModeSwitch");
  const modeText = document.getElementById("modeBadgeText");

  if (gameMode === "SCRATCH") {
    basicPanel.style.display = "none";
    scratchPanel.style.display = "flex";
    modeBtn.classList.add("scratch-active");
    modeText.textContent = "Scratch";
    loadScratchLevel(scratchLevelIdx);
  } else {
    scratchPanel.style.display = "none";
    basicPanel.style.display = "flex";
    modeBtn.classList.remove("scratch-active");
    modeText.textContent = "Cơ Bản";
    loadLevel(currentLevelIdx);
  }
}

document.getElementById("btnModeSwitch").addEventListener("click", () => {
  SFX.click();
  switchMode(gameMode === "BASIC" ? "SCRATCH" : "BASIC");
});

function resetBoardState(lvl) {
  activeLevel = lvl;
  commands = [];
  scratchBlocks = [];
  selectedScratchTarget = "main";
  isRunning = false;
  showHintPath = false;
  collectedStars = [];
  confettiParticles = [];
  tireTracks = [];
  honkBubbleTimer = 0;

  carState = {
    r: lvl.start.r,
    c: lvl.start.c,
    x: lvl.start.c,
    y: lvl.start.r,
    angle: 0
  };

  document.getElementById("starCount").textContent = "0";
  document.getElementById("starTotal").textContent = lvl.stars.length;
  updateCarBadge();
}

function loadLevel(idx, randomLevel = null) {
  gameMode = "BASIC";
  document.getElementById("basicControlPanel").style.display = "flex";
  document.getElementById("scratchControlPanel").style.display = "none";
  document.getElementById("btnModeSwitch").classList.remove("scratch-active");
  document.getElementById("modeBadgeText").textContent = "Cơ Bản";

  let lvl;
  if (randomLevel) {
    lvl = randomLevel;
  } else {
    currentLevelIdx = Math.max(0, Math.min(idx, LEVELS.length - 1));
    lvl = LEVELS[currentLevelIdx];
  }

  resetBoardState(lvl);

  document.getElementById("levelBadge").innerHTML = lvl.isRandom
    ? `Màn <span id="levelNum">Vô Tận</span>`
    : `Màn <span id="levelNum">${currentLevelIdx + 1}</span>/${LEVELS.length}`;

  document.getElementById("maxSteps").textContent = lvl.maxSteps;
  document.getElementById("statusMsg").textContent = "Xếp các lệnh bên phải rồi bấm CHẠY XE!";
  document.getElementById("statusMsg").style.color = "#166534";

  const needsRepeat = lvl.isRandom ? Boolean(lvl.requireRepeat) : currentLevelIdx >= 5;
  document.getElementById("loopRequirement").style.display = needsRepeat ? "inline-block" : "none";

  renderQueue();
  setControlsDisabled(false);
}

function loadScratchLevel(idx, randomLevel = null) {
  gameMode = "SCRATCH";
  document.getElementById("basicControlPanel").style.display = "none";
  document.getElementById("scratchControlPanel").style.display = "flex";
  document.getElementById("btnModeSwitch").classList.add("scratch-active");
  document.getElementById("modeBadgeText").textContent = "Scratch";

  let lvl;
  if (randomLevel) {
    lvl = randomLevel;
  } else {
    scratchLevelIdx = Math.max(0, Math.min(idx, SCRATCH_LEVELS.length - 1));
    lvl = SCRATCH_LEVELS[scratchLevelIdx];
  }

  resetBoardState(lvl);

  const displayNum = lvl.isRandom ? "Scratch ∞" : `Scratch ${11 + scratchLevelIdx}`;
  document.getElementById("levelBadge").innerHTML = `<span id="levelNum">${displayNum}</span>`;
  document.getElementById("scMaxSteps").textContent = lvl.maxSteps;
  document.getElementById("statusMsg").textContent = "Ghép khối lệnh dưới cờ xanh 🚩 (Bấm khối Lặp lại để lồng lệnh)!";
  document.getElementById("statusMsg").style.color = "#0369a1";

  renderScratchWorkspace();
  setScratchDisabled(false);
}

// ============================================================================
// PHẦN 1: ĐIỀU KHIỂN CƠ BẢN (MÀN 1 - 10)
// ============================================================================
function expandProgram() {
  const steps = [];
  commands.forEach((cmd, commandIndex) => {
    if (cmd.type === "MOVE") {
      steps.push({ dir: cmd.dir, commandIndex });
    } else if (cmd.type === "REPEAT") {
      for (let i = 0; i < cmd.count; i++) {
        steps.push({ dir: cmd.dir, commandIndex });
      }
    }
  });
  return steps;
}

function setControlsDisabled(disabled) {
  document.querySelectorAll(".dir-btn").forEach(b => (b.disabled = disabled));
  document.getElementById("btnRepeat").disabled = disabled;
  document.getElementById("repeatCount").disabled = disabled;
  document.getElementById("repeatDirection").disabled = disabled;
  document.getElementById("btnRun").disabled = disabled || expandProgram().length === 0;
  document.getElementById("btnClear").disabled = disabled;
}

function renderQueue(activeIdx = -1, errorIdx = -1) {
  const box = document.getElementById("commandQueue");
  box.innerHTML = "";
  commands.forEach((cmd, i) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "cmd-chip" + (cmd.type === "REPEAT" ? " repeat-chip" : "");
    if (i === activeIdx) chip.classList.add("active-step");
    if (i === errorIdx) chip.classList.add("error-step");
    chip.textContent = cmd.type === "REPEAT"
      ? `🔁 ${cmd.count}× ${DIR_ICONS[cmd.dir]}`
      : DIR_ICONS[cmd.dir];
    chip.addEventListener("click", () => {
      if (isRunning) return;
      SFX.click();
      commands.splice(i, 1);
      renderQueue();
      setControlsDisabled(false);
    });
    box.appendChild(chip);
  });

  const total = expandProgram().length;
  document.getElementById("stepCount").textContent = total;
  document.getElementById("btnRun").disabled = isRunning || total === 0;
}

function addMove(dir) {
  if (isRunning) return;
  if (expandProgram().length + 1 > activeLevel.maxSteps) {
    SFX.bump();
    document.getElementById("statusMsg").textContent = "Đã đạt giới hạn bước của màn này!";
    document.getElementById("statusMsg").style.color = "#b45309";
    return;
  }
  SFX.click();
  commands.push({ type: "MOVE", dir });
  renderQueue();
}

function addRepeat() {
  if (isRunning) return;
  const count = Number(document.getElementById("repeatCount").value);
  const dir = document.getElementById("repeatDirection").value;
  if (expandProgram().length + count > activeLevel.maxSteps) {
    SFX.bump();
    document.getElementById("statusMsg").textContent = `Vượt quá giới hạn ${activeLevel.maxSteps} bước!`;
    document.getElementById("statusMsg").style.color = "#b45309";
    return;
  }
  SFX.click();
  commands.push({ type: "REPEAT", count, dir });
  renderQueue();
}

document.querySelectorAll(".dir-btn").forEach(btn => {
  btn.addEventListener("click", () => addMove(btn.dataset.dir));
});
document.getElementById("btnRepeat").addEventListener("click", addRepeat);

document.getElementById("btnClear").addEventListener("click", () => {
  if (isRunning) return;
  SFX.click();
  commands = [];
  const lvl = activeLevel;
  carState = { r: lvl.start.r, c: lvl.start.c, x: lvl.start.c, y: lvl.start.r, angle: 0 };
  collectedStars = [];
  tireTracks = [];
  document.getElementById("starCount").textContent = "0";
  document.getElementById("statusMsg").textContent = "Xếp các lệnh bên phải rồi bấm CHẠY XE!";
  document.getElementById("statusMsg").style.color = "#166534";
  renderQueue();
});

// ============================================================================
// PHẦN 2: TRÌNH LẬP TRÌNH KHỐI SCRATCH (MÀN 11+)
// ============================================================================
function countScratchMoveSteps(blocks = scratchBlocks) {
  let total = 0;
  for (const b of blocks) {
    if (b.type === "MOVE") total += 1;
    else if (b.type === "REPEAT") total += b.count * countScratchMoveSteps(b.children || []);
  }
  return total;
}

function expandScratchSteps(blocks = scratchBlocks) {
  const steps = [];
  for (const b of blocks) {
    if (b.type === "MOVE") {
      steps.push({ action: "MOVE", dir: b.dir, blockId: b.id });
    } else if (b.type === "HONK") {
      steps.push({ action: "HONK", blockId: b.id });
    } else if (b.type === "REPEAT") {
      for (let i = 0; i < b.count; i++) {
        steps.push(...expandScratchSteps(b.children || []));
      }
    }
  }
  return steps;
}

function addScratchBlock(type, dir = "RIGHT", targetId = selectedScratchTarget) {
  if (isRunning) return;
  const newBlock = {
    id: `sc_${scBlockIdCounter++}`,
    type,
    dir: type === "MOVE" ? dir : undefined,
    count: type === "REPEAT" ? 3 : undefined,
    children: type === "REPEAT" ? [] : undefined
  };

  if (targetId !== "main" && type !== "REPEAT") {
    const parentLoop = scratchBlocks.find(b => b.id === targetId && b.type === "REPEAT");
    if (parentLoop) {
      parentLoop.children.push(newBlock);
    } else {
      selectedScratchTarget = "main";
      scratchBlocks.push(newBlock);
    }
  } else {
    scratchBlocks.push(newBlock);
    if (type === "REPEAT") {
      selectedScratchTarget = newBlock.id; // Tự chọn bên trong vòng lặp mới tạo để bé ghép lệnh luôn
    }
  }

  if (countScratchMoveSteps() > activeLevel.maxSteps) {
    // Hoàn tác nếu vượt bước tối đa
    if (targetId !== "main" && type !== "REPEAT") {
      const parentLoop = scratchBlocks.find(b => b.id === targetId);
      if (parentLoop) parentLoop.children.pop();
    } else {
      scratchBlocks.pop();
      if (type === "REPEAT") selectedScratchTarget = "main";
    }
    SFX.bump();
    document.getElementById("statusMsg").textContent = `Vượt quá giới hạn ${activeLevel.maxSteps} bước di chuyển!`;
    document.getElementById("statusMsg").style.color = "#b45309";
    return;
  }

  SFX.snap();
  renderScratchWorkspace();
}

function removeScratchBlock(blockId) {
  if (isRunning) return;
  SFX.click();
  if (selectedScratchTarget === blockId) selectedScratchTarget = "main";
  scratchBlocks = scratchBlocks.filter(b => b.id !== blockId);
  scratchBlocks.forEach(b => {
    if (b.children) b.children = b.children.filter(c => c.id !== blockId);
  });
  renderScratchWorkspace();
}

function moveScratchBlock(list, index, delta) {
  if (isRunning) return;
  const newIdx = index + delta;
  if (newIdx < 0 || newIdx >= list.length) return;
  SFX.click();
  const [item] = list.splice(index, 1);
  list.splice(newIdx, 0, item);
  renderScratchWorkspace();
}

function createLeafBlockEl(block, list, idx, activeBlockId, errorBlockId) {
  const el = document.createElement("div");
  const colorClass = block.type === "HONK" ? "sc-sound" : "sc-motion";
  el.className = `sc-block ${colorClass}`;
  if (block.id === activeBlockId) el.classList.add("active-sc");
  if (block.id === errorBlockId) el.classList.add("error-sc");

  const label = document.createElement("span");
  label.textContent = block.type === "HONK" ? "📣 Bấm còi Bíp Bíp!" : DIR_LABELS[block.dir];

  const actions = document.createElement("div");
  actions.className = "sc-block-actions";

  const upBtn = document.createElement("button");
  upBtn.type = "button";
  upBtn.className = "sc-mini-btn";
  upBtn.textContent = "▲";
  upBtn.onclick = (e) => { e.stopPropagation(); moveScratchBlock(list, idx, -1); };

  const downBtn = document.createElement("button");
  downBtn.type = "button";
  downBtn.className = "sc-mini-btn";
  downBtn.textContent = "▼";
  downBtn.onclick = (e) => { e.stopPropagation(); moveScratchBlock(list, idx, 1); };

  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "sc-mini-btn";
  delBtn.textContent = "✕";
  delBtn.onclick = (e) => { e.stopPropagation(); removeScratchBlock(block.id); };

  actions.append(upBtn, downBtn, delBtn);
  el.append(label, actions);
  return el;
}

function renderScratchWorkspace(activeBlockId = null, errorBlockId = null) {
  const mainBody = document.getElementById("scratchMainBody");
  const hatBlock = document.getElementById("scHatBlock");
  const indicator = document.getElementById("scratchTargetIndicator");

  hatBlock.classList.toggle("selected-target", selectedScratchTarget === "main");
  indicator.textContent = selectedScratchTarget === "main"
    ? "🎯 Đang ghép vào: Luồng chính"
    : "🎯 Đang ghép vào: Bên trong vòng lặp 🔁";

  mainBody.innerHTML = "";

  scratchBlocks.forEach((block, idx) => {
    if (block.type === "REPEAT") {
      const wrap = document.createElement("div");
      wrap.className = "sc-c-wrapper" + (selectedScratchTarget === block.id ? " selected-loop" : "");

      const header = document.createElement("div");
      header.className = "sc-c-header";
      header.onclick = (e) => {
        if (e.target.tagName === "SELECT" || e.target.tagName === "BUTTON") return;
        SFX.click();
        selectedScratchTarget = (selectedScratchTarget === block.id) ? "main" : block.id;
        renderScratchWorkspace();
      };

      const leftPart = document.createElement("div");
      leftPart.style.display = "flex";
      leftPart.style.alignItems = "center";
      leftPart.style.gap = "6px";
      leftPart.innerHTML = `<span>🔁 Lặp lại</span>`;

      const sel = document.createElement("select");
      [2, 3, 4, 5, 6].forEach(n => {
        const opt = document.createElement("option");
        opt.value = n;
        opt.textContent = `${n}`;
        if (n === block.count) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.onchange = () => {
        const oldVal = block.count;
        block.count = Number(sel.value);
        if (countScratchMoveSteps() > activeLevel.maxSteps) {
          block.count = oldVal;
          sel.value = oldVal;
          SFX.bump();
        } else {
          SFX.click();
          renderScratchWorkspace();
        }
      };

      const suffix = document.createElement("span");
      suffix.textContent = "lần";
      leftPart.append(sel, suffix);

      const actions = document.createElement("div");
      actions.className = "sc-block-actions";
      const upBtn = document.createElement("button");
      upBtn.type = "button";
      upBtn.className = "sc-mini-btn";
      upBtn.textContent = "▲";
      upBtn.onclick = (e) => { e.stopPropagation(); moveScratchBlock(scratchBlocks, idx, -1); };

      const downBtn = document.createElement("button");
      downBtn.type = "button";
      downBtn.className = "sc-mini-btn";
      downBtn.textContent = "▼";
      downBtn.onclick = (e) => { e.stopPropagation(); moveScratchBlock(scratchBlocks, idx, 1); };

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "sc-mini-btn";
      delBtn.textContent = "✕";
      delBtn.onclick = (e) => { e.stopPropagation(); removeScratchBlock(block.id); };

      actions.append(upBtn, downBtn, delBtn);
      header.append(leftPart, actions);

      const mouth = document.createElement("div");
      mouth.className = "sc-c-mouth";
      mouth.onclick = (e) => {
        e.stopPropagation();
        SFX.click();
        selectedScratchTarget = block.id;
        renderScratchWorkspace();
      };

      // Hỗ trợ kéo thả trực tiếp vào miệng vòng lặp
      mouth.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
        mouth.classList.add("drag-over");
      });
      mouth.addEventListener("dragleave", () => mouth.classList.remove("drag-over"));
      mouth.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        mouth.classList.remove("drag-over");
        if (draggedPaletteData && draggedPaletteData.type !== "REPEAT") {
          addScratchBlock(draggedPaletteData.type, draggedPaletteData.dir, block.id);
        }
      });

      if (!block.children || block.children.length === 0) {
        const hint = document.createElement("div");
        hint.className = "sc-c-empty-hint";
        hint.textContent = "+ Thả hoặc bấm lệnh di chuyển vào đây";
        mouth.appendChild(hint);
      } else {
        block.children.forEach((child, cIdx) => {
          mouth.appendChild(createLeafBlockEl(child, block.children, cIdx, activeBlockId, errorBlockId));
        });
      }

      const footer = document.createElement("div");
      footer.className = "sc-c-footer";

      wrap.append(header, mouth, footer);
      mainBody.appendChild(wrap);
    } else {
      mainBody.appendChild(createLeafBlockEl(block, scratchBlocks, idx, activeBlockId, errorBlockId));
    }
  });

  const totalSteps = countScratchMoveSteps();
  document.getElementById("scStepCount").textContent = totalSteps;
  document.getElementById("btnScRun").disabled = isRunning || expandScratchSteps().length === 0;
}

function setScratchDisabled(disabled) {
  document.getElementById("btnScRun").disabled = disabled || expandScratchSteps().length === 0;
  document.getElementById("btnScClear").disabled = disabled;
}

// Khởi tạo sự kiện Palette Scratch (Click + Drag & Drop)
document.querySelectorAll(".sc-pal-item").forEach(item => {
  item.addEventListener("click", () => {
    addScratchBlock(item.dataset.scType, item.dataset.dir);
  });
  item.addEventListener("dragstart", () => {
    draggedPaletteData = { type: item.dataset.scType, dir: item.dataset.dir };
  });
  item.addEventListener("dragend", () => {
    draggedPaletteData = null;
  });
});

document.getElementById("scHatBlock").addEventListener("click", () => {
  SFX.click();
  selectedScratchTarget = "main";
  renderScratchWorkspace();
});

const scMainBody = document.getElementById("scratchMainBody");
scMainBody.addEventListener("dragover", (e) => {
  e.preventDefault();
  scMainBody.classList.add("drag-over");
});
scMainBody.addEventListener("dragleave", () => scMainBody.classList.remove("drag-over"));
scMainBody.addEventListener("drop", (e) => {
  e.preventDefault();
  scMainBody.classList.remove("drag-over");
  if (draggedPaletteData) {
    addScratchBlock(draggedPaletteData.type, draggedPaletteData.dir, "main");
  }
});

document.getElementById("btnScClear").addEventListener("click", () => {
  if (isRunning) return;
  SFX.click();
  scratchBlocks = [];
  selectedScratchTarget = "main";
  const lvl = activeLevel;
  carState = { r: lvl.start.r, c: lvl.start.c, x: lvl.start.c, y: lvl.start.r, angle: 0 };
  collectedStars = [];
  tireTracks = [];
  document.getElementById("starCount").textContent = "0";
  document.getElementById("statusMsg").textContent = "Ghép khối lệnh dưới cờ xanh 🚩 rồi chạy nhé!";
  document.getElementById("statusMsg").style.color = "#0369a1";
  renderScratchWorkspace();
});

// ============================================================================
// MÀN HÌNH LỚN TẶNG XE, MỞ KHÓA SCRATCH, GARA & HƯỚNG DẪN
// ============================================================================
function showCarGiftScreen(carConfig) {
  document.getElementById("giftTitle").textContent = `Chúc Mừng! Bé Được Tặng ${carConfig.name}!`;
  document.getElementById("giftCarName").textContent = `${carConfig.name} (Cấp ${carConfig.tier})`;
  document.getElementById("giftCarPerk").textContent = `⚡ ${carConfig.perk}`;

  const giftCanvas = document.getElementById("giftCarCanvas");
  const gCtx = giftCanvas.getContext("2d");
  gCtx.clearRect(0, 0, giftCanvas.width, giftCanvas.height);
  drawCarSpriteOrVector(gCtx, 110, 110, 180, -0.25, carConfig, true);

  document.getElementById("carGiftOverlay").classList.add("show");
}

function advanceAfterWin() {
  if (gameMode === "SCRATCH") {
    if (activeLevel && activeLevel.isRandom) {
      loadScratchLevel(0, generateSolvableLevel({ size: 6, starCount: 3, obstacleCount: 4, requireRepeat: false, isScratch: true }));
    } else if (scratchLevelIdx >= SCRATCH_LEVELS.length - 1) {
      loadScratchLevel(0, generateSolvableLevel({ size: 6, starCount: 3, obstacleCount: 4, requireRepeat: false, isScratch: true }));
    } else {
      loadScratchLevel(scratchLevelIdx + 1);
    }
    return;
  }

  if (activeLevel && activeLevel.isRandom) {
    loadLevel(0, generateSolvableLevel({ size: 6, starCount: 3, obstacleCount: 4, requireRepeat: true, isScratch: false }));
    return;
  }

  // Hết Màn 10 -> Nâng cấp sang Scratch!
  if (currentLevelIdx >= LEVELS.length - 1) {
    switchMode("SCRATCH");
  } else {
    loadLevel(currentLevelIdx + 1);
  }
}

document.getElementById("btnNextLevel").addEventListener("click", () => {
  SFX.click();
  document.getElementById("winModal").classList.remove("show");
  advanceAfterWin();
});

document.getElementById("btnGiftContinue").addEventListener("click", () => {
  SFX.click();
  document.getElementById("carGiftOverlay").classList.remove("show");
  advanceAfterWin();
});

document.getElementById("btnStartScratchMode").addEventListener("click", () => {
  SFX.click();
  document.getElementById("scratchUnlockOverlay").classList.remove("show");
  scratchLevelIdx = 0;
  switchMode("SCRATCH");
});

// Gara đổi xe
function openGarage() {
  if (isRunning) return;
  SFX.click();
  const grid = document.getElementById("garageGrid");
  grid.innerHTML = "";

  GRAPHICS_ASSETS.cars.forEach((car, idx) => {
    const unlocked = isCarUnlocked(idx);
    const equipped = idx === equippedTierIdx;
    const item = document.createElement("div");
    item.className = `garage-item ${unlocked ? "unlocked" : "locked"} ${equipped ? "equipped" : ""}`;

    const mini = document.createElement("canvas");
    mini.width = 76;
    mini.height = 76;
    drawCarSpriteOrVector(mini.getContext("2d"), 38, 38, 66, 0, car, false);

    const title = document.createElement("h4");
    title.textContent = `Cấp ${car.tier}: ${car.name}`;

    const sub = document.createElement("span");
    sub.textContent = !unlocked
      ? `🔒 Qua Màn ${car.unlockAfterLevel}`
      : (equipped ? "✅ Đang lái" : car.perk);

    item.append(mini, title, sub);
    if (unlocked && !equipped) {
      item.addEventListener("click", () => {
        SFX.click();
        equippedTierIdx = idx;
        saveProgress();
        updateCarBadge();
        openGarage();
      });
    }
    grid.appendChild(item);
  });

  document.getElementById("garageModal").classList.add("show");
}

document.getElementById("btnGarage").addEventListener("click", openGarage);
document.getElementById("btnCloseGarage").addEventListener("click", () => {
  SFX.click();
  document.getElementById("garageModal").classList.remove("show");
});

document.getElementById("btnHelp").addEventListener("click", () => {
  SFX.click();
  document.getElementById("helpModal").classList.add("show");
});
document.getElementById("btnCloseHelp").addEventListener("click", () => {
  SFX.click();
  document.getElementById("helpModal").classList.remove("show");
});

document.getElementById("btnHint").addEventListener("click", () => {
  SFX.click();
  showHintPath = true;
  setTimeout(() => { showHintPath = false; }, 2600);
});

document.getElementById("btnSound").addEventListener("click", (e) => {
  soundEnabled = !soundEnabled;
  e.target.textContent = soundEnabled ? "🔊" : "🔇";
});

// ============================================================================
// THỰC THI CHƯƠNG TRÌNH (CHUNG CHO CẢ PHẦN 1 VÀ SCRATCH)
// ============================================================================
async function executeProgramSteps(steps, isScratchMode) {
  isRunning = true;
  if (isScratchMode) setScratchDisabled(true);
  else setControlsDisabled(true);

  const lvl = activeLevel;
  carState = { r: lvl.start.r, c: lvl.start.c, x: lvl.start.c, y: lvl.start.r, angle: 0 };
  collectedStars = [];
  tireTracks = [];
  document.getElementById("starCount").textContent = "0";

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (isScratchMode) renderScratchWorkspace(step.blockId, null);
    else renderQueue(step.commandIndex, -1);

    if (step.action === "HONK") {
      SFX.honk();
      honkBubbleTimer = performance.now() + 550;
      await new Promise(r => setTimeout(r, 380));
      continue;
    }

    const delta = DIR_DELTAS[step.dir];
    const nextR = carState.r + delta.dr;
    const nextC = carState.c + delta.dc;
    carState.angle = delta.angle;

    const hitWall = nextR < 0 || nextR >= lvl.size || nextC < 0 || nextC >= lvl.size;
    const hitObs = lvl.obstacles.some(o => o.r === nextR && o.c === nextC);

    if (hitWall || hitObs) {
      SFX.bump();
      if (isScratchMode) renderScratchWorkspace(null, step.blockId);
      else renderQueue(-1, step.commandIndex);

      document.getElementById("statusMsg").textContent = "Ối! Xe đụng vật cản rồi, sửa lại khối đỏ nhé!";
      document.getElementById("statusMsg").style.color = "#dc2626";
      await animateBump(carState.c, carState.r, delta.dc * 0.25, delta.dr * 0.25);
      isRunning = false;
      if (isScratchMode) setScratchDisabled(false);
      else setControlsDisabled(false);
      return;
    }

    tireTracks.push({ x0: carState.c, y0: carState.r, x1: nextC, y1: nextR });
    SFX.move();
    await animateStep(carState.c, carState.r, nextC, nextR);
    carState.r = nextR;
    carState.c = nextC;

    const starIdx = lvl.stars.findIndex(s => s.r === nextR && s.c === nextC);
    if (starIdx !== -1 && !collectedStars.includes(starIdx)) {
      collectedStars.push(starIdx);
      SFX.star();
      document.getElementById("starCount").textContent = collectedStars.length;
    }
  }

  if (isScratchMode) renderScratchWorkspace(null, null);
  else renderQueue(-1, -1);

  const atHome = carState.r === lvl.home.r && carState.c === lvl.home.c;
  const allStars = collectedStars.length === lvl.stars.length;
  const usedRepeat = isScratchMode
    ? scratchBlocks.some(b => b.type === "REPEAT")
    : commands.some(c => c.type === "REPEAT");
  const needsRepeat = !isScratchMode && (lvl.isRandom ? Boolean(lvl.requireRepeat) : currentLevelIdx >= 5);

  if (atHome && allStars && (!needsRepeat || usedRepeat)) {
    spawnConfetti();
    let giftedCar = null;
    let unlockedScratchNow = false;

    if (!isScratchMode && !lvl.isRandom) {
      const levelNum = currentLevelIdx + 1;
      if (!completedLevels.includes(levelNum)) completedLevels.push(levelNum);
      const unlockedIdx = GRAPHICS_ASSETS.cars.findIndex(c => c.unlockAfterLevel === levelNum);
      if (unlockedIdx !== -1) {
        giftedCar = GRAPHICS_ASSETS.cars[unlockedIdx];
        equippedTierIdx = unlockedIdx;
        updateCarBadge();
      }
      if (levelNum === LEVELS.length) {
        unlockedScratchNow = true;
      }
      saveProgress();
    }

    if (giftedCar) {
      SFX.gift();
      setTimeout(() => showCarGiftScreen(giftedCar), 420);
    } else if (unlockedScratchNow) {
      SFX.gift();
      setTimeout(() => document.getElementById("scratchUnlockOverlay").classList.add("show"), 420);
    } else {
      SFX.win();
      document.getElementById("winText").textContent = isScratchMode
        ? (lvl.isRandom ? "Tuyệt vời! Bé giải thành công mê cung Scratch!" : `Hoàn thành Màn Scratch ${11 + scratchLevelIdx} xuất sắc!`)
        : `Hoàn thành Màn ${currentLevelIdx + 1} xuất sắc!`;
      setTimeout(() => document.getElementById("winModal").classList.add("show"), 420);
    }
  } else if (atHome && allStars && needsRepeat && !usedRepeat) {
    SFX.bump();
    document.getElementById("statusMsg").textContent = "Màn này cần dùng ít nhất 1 khối Repeat nhé!";
    document.getElementById("statusMsg").style.color = "#7c3aed";
  } else if (atHome && !allStars) {
    SFX.bump();
    document.getElementById("statusMsg").textContent = "Xe về nhà rồi nhưng còn thiếu ngôi sao!";
    document.getElementById("statusMsg").style.color = "#d97706";
  } else {
    SFX.bump();
    document.getElementById("statusMsg").textContent = "Xe chưa về tới nhà, thêm bước di chuyển nhé!";
    document.getElementById("statusMsg").style.color = "#d97706";
  }

  isRunning = false;
  if (isScratchMode) setScratchDisabled(false);
  else setControlsDisabled(false);
}

document.getElementById("btnRun").addEventListener("click", () => {
  if (isRunning || commands.length === 0) return;
  const steps = expandProgram().map(s => ({ action: "MOVE", dir: s.dir, commandIndex: s.commandIndex }));
  executeProgramSteps(steps, false);
});

document.getElementById("btnScRun").addEventListener("click", () => {
  if (isRunning) return;
  const steps = expandScratchSteps();
  if (steps.length === 0) return;
  executeProgramSteps(steps, true);
});

// ============================================================================
// HIỆU ỨNG ANIMATION & VẼ BÀN CỜ
// ============================================================================
function animateStep(x0, y0, x1, y1) {
  return new Promise(resolve => {
    const mult = getEquippedCar().speedMultiplier || 1.0;
    const duration = Math.max(150, 310 / mult);
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      carState.x = x0 + (x1 - x0) * ease;
      carState.y = y0 + (y1 - y0) * ease;
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

function animateBump(x0, y0, dx, dy) {
  return new Promise(resolve => {
    const duration = 250;
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const wave = Math.sin(t * Math.PI);
      carState.x = x0 + dx * wave;
      carState.y = y0 + dy * wave;
      if (t < 1) requestAnimationFrame(frame);
      else { carState.x = x0; carState.y = y0; resolve(); }
    }
    requestAnimationFrame(frame);
  });
}

function spawnConfetti() {
  const colors = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7"];
  for (let i = 0; i < 65; i++) {
    confettiParticles.push({
      x: canvas.width / 2, y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 11, vy: (Math.random() - 0.7) * 11,
      color: colors[i % colors.length], size: 6 + Math.random() * 6
    });
  }
}

function drawBoard() {
  const lvl = activeLevel;
  if (!lvl) return;
  const pad = 16;
  const cellSize = (canvas.width - pad * 2) / lvl.size;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < lvl.size; r++) {
    for (let c = 0; c < lvl.size; c++) {
      const x = pad + c * cellSize;
      const y = pad + r * cellSize;
      const isEven = (r + c) % 2 === 0;
      const tileImg = LoadedSprites[isEven ? "tile_light" : "tile_dark"];

      if (tileImg) {
        ctx.drawImage(tileImg, x + 2, y + 2, cellSize - 4, cellSize - 4);
      } else {
        ctx.fillStyle = isEven ? "#86efac" : "#4ade80";
        ctx.beginPath();
        ctx.roundRect(x + 3, y + 6, cellSize - 6, cellSize - 6, 14);
        ctx.fill();

        ctx.fillStyle = isEven ? "#ecfdf5" : "#d1fae5";
        ctx.beginPath();
        ctx.roundRect(x + 3, y + 3, cellSize - 6, cellSize - 6, 14);
        ctx.fill();
      }
    }
  }

  if (tireTracks.length > 0) {
    ctx.save();
    ctx.strokeStyle = "rgba(22, 101, 52, 0.16)";
    ctx.lineWidth = cellSize * 0.16;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    tireTracks.forEach((tr, i) => {
      const x0 = pad + (tr.x0 + 0.5) * cellSize;
      const y0 = pad + (tr.y0 + 0.5) * cellSize;
      const x1 = pad + (tr.x1 + 0.5) * cellSize;
      const y1 = pad + (tr.y1 + 0.5) * cellSize;
      if (i === 0) ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
    });
    ctx.stroke();
    ctx.restore();
  }

  if (showHintPath && Array.isArray(lvl.hint)) {
    let hr = lvl.start.r, hc = lvl.start.c;
    ctx.save();
    ctx.strokeStyle = "rgba(2, 132, 199, 0.65)";
    ctx.lineWidth = 8;
    ctx.setLineDash([10, 10]);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pad + (hc + 0.5) * cellSize, pad + (hr + 0.5) * cellSize);
    lvl.hint.forEach(d => {
      hr += DIR_DELTAS[d].dr;
      hc += DIR_DELTAS[d].dc;
      ctx.lineTo(pad + (hc + 0.5) * cellSize, pad + (hr + 0.5) * cellSize);
    });
    ctx.stroke();
    ctx.restore();
  }

  lvl.obstacles.forEach(obs => {
    const cx = pad + (obs.c + 0.5) * cellSize;
    const cy = pad + (obs.r + 0.5) * cellSize;
    const sprite = LoadedSprites[`obj_${obs.type}`];
    if (sprite) {
      const sz = cellSize * (GRAPHICS_ASSETS.objects[obs.type]?.scale || 0.84);
      ctx.drawImage(sprite, cx - sz / 2, cy - sz / 2, sz, sz);
      return;
    }
    drawVectorObstacle(ctx, cx, cy, cellSize, obs.type);
  });

  const pulse = 1 + Math.sin(performance.now() / 220) * 0.08;
  lvl.stars.forEach((s, idx) => {
    if (collectedStars.includes(idx)) return;
    const cx = pad + (s.c + 0.5) * cellSize;
    const cy = pad + (s.r + 0.5) * cellSize;
    const sprite = LoadedSprites["obj_star"];
    if (sprite) {
      const sz = cellSize * (GRAPHICS_ASSETS.objects.star.scale || 0.78) * pulse;
      ctx.drawImage(sprite, cx - sz / 2, cy - sz / 2, sz, sz);
    } else {
      drawVectorStar(ctx, cx, cy, cellSize * 0.28 * pulse, cellSize * 0.13 * pulse);
    }
  });

  const hx = pad + (lvl.home.c + 0.5) * cellSize;
  const hy = pad + (lvl.home.r + 0.5) * cellSize;
  const homeSprite = LoadedSprites["obj_home"];
  if (homeSprite) {
    const hs = cellSize * (GRAPHICS_ASSETS.objects.home.scale || 0.92);
    ctx.drawImage(homeSprite, hx - hs / 2, hy - hs / 2, hs, hs);
  } else {
    drawVectorHouse(ctx, hx, hy, cellSize);
  }

  const carPx = pad + (carState.x + 0.5) * cellSize;
  const carPy = pad + (carState.y + 0.5) * cellSize;
  drawCarSpriteOrVector(ctx, carPx, carPy, cellSize, carState.angle, getEquippedCar(), isRunning);

  // Bong bóng Bíp Bíp khi dùng khối âm thanh Scratch
  if (performance.now() < honkBubbleTimer) {
    ctx.save();
    ctx.fillStyle = "#9966ff";
    ctx.beginPath();
    ctx.roundRect(carPx - 36, carPy - cellSize * 0.62, 72, 26, 12);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("BÍP BÍP!", carPx, carPy - cellSize * 0.62 + 17);
    ctx.restore();
  }

  confettiParticles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.25;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });

  requestAnimationFrame(drawBoard);
}

function drawVectorObstacle(c, cx, cy, cellSize, type) {
  c.save();
  c.fillStyle = "rgba(15, 23, 42, 0.14)";
  c.beginPath();
  c.ellipse(cx, cy + cellSize * 0.25, cellSize * 0.3, cellSize * 0.12, 0, 0, Math.PI * 2);
  c.fill();
  if (type === "rock") {
    c.fillStyle = "#64748b";
    c.beginPath();
    c.ellipse(cx, cy + 2, cellSize * 0.32, cellSize * 0.24, 0, 0, Math.PI * 2);
    c.fill();
  } else if (type === "puddle") {
    c.fillStyle = "#0ea5e9";
    c.beginPath();
    c.ellipse(cx, cy + 2, cellSize * 0.34, cellSize * 0.21, 0.12, 0, Math.PI * 2);
    c.fill();
  } else {
    c.fillStyle = "#15803d";
    c.beginPath();
    c.arc(cx, cy, cellSize * 0.28, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

function drawVectorStar(c, cx, cy, outerR, innerR) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / 5;
  c.save();
  c.beginPath();
  c.moveTo(cx, cy - outerR);
  for (let i = 0; i < 5; i++) {
    c.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    c.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  c.closePath();
  c.fillStyle = "#facc15";
  c.fill();
  c.restore();
}

function drawVectorHouse(c, cx, cy, cellSize) {
  const w = cellSize * 0.6;
  const h = cellSize * 0.46;
  c.save();
  c.fillStyle = "#fef3c7";
  c.strokeStyle = "#d97706";
  c.lineWidth = 3;
  c.beginPath();
  c.roundRect(cx - w / 2, cy - h / 4, w, h * 0.85, 8);
  c.fill();
  c.stroke();
  c.fillStyle = "#ef4444";
  c.beginPath();
  c.moveTo(cx - w * 0.64, cy - h / 4);
  c.lineTo(cx, cy - h * 0.92);
  c.lineTo(cx + w * 0.64, cy - h / 4);
  c.closePath();
  c.fill();
  c.restore();
}

function drawCarSpriteOrVector(c, cx, cy, cellSize, angle, carCfg, moving = false) {
  const w = cellSize * 0.6;
  const h = cellSize * 0.44;
  c.save();
  c.translate(cx, cy);
  c.rotate(angle);

  if (carCfg.fallbackColors.glow) {
    c.fillStyle = carCfg.fallbackColors.glow;
    c.beginPath();
    c.arc(0, 0, cellSize * (moving ? 0.44 : 0.36), 0, Math.PI * 2);
    c.fill();
  }

  const customImg = LoadedSprites[carCfg.id];
  if (customImg) {
    c.save();
    c.rotate(carCfg.rotationOffset || 0);
    const sz = cellSize * (carCfg.scale || 0.90);
    c.drawImage(customImg, -sz / 2, -sz / 2, sz, sz);
    c.restore();
    c.restore();
    return;
  }

  c.fillStyle = carCfg.fallbackColors.body;
  c.strokeStyle = carCfg.fallbackColors.dark;
  c.lineWidth = 3;
  c.beginPath();
  c.roundRect(-w / 2, -h / 2, w, h, 11);
  c.fill();
  c.stroke();
  c.restore();
}

// Khởi động game
initGraphicsAssets();
validateAndSyncHints();
loadProgress();
loadLevel(0);
requestAnimationFrame(drawBoard);
