// ============================================================================
// DỮ LIỆU MÀN CHƠI (10 MÀN CƠ BẢN + 5 MÀN SCRATCH NÂNG CAO + SINH MÀN VÔ TẬN)
// ============================================================================

const DIR_DELTAS = {
  UP:    { dr: -1, dc: 0,  angle: -Math.PI / 2 },
  DOWN:  { dr: 1,  dc: 0,  angle: Math.PI / 2 },
  LEFT:  { dr: 0,  dc: -1, angle: Math.PI },
  RIGHT: { dr: 0,  dc: 1,  angle: 0 }
};

const DIR_NAMES = ["UP", "DOWN", "LEFT", "RIGHT"];

function solveLevel(level) {
  const { size, start, home, stars, obstacles, maxSteps = size * size, requireRepeat = false } = level;
  const inBounds = (r, c) => r >= 0 && r < size && c >= 0 && c < size;

  if (!inBounds(start.r, start.c) || !inBounds(home.r, home.c)) {
    return { solvable: false, reason: "Start hoặc Home ngoài bàn cờ" };
  }
  if (start.r === home.r && start.c === home.c) {
    return { solvable: false, reason: "Start trùng Home" };
  }

  const obsSet = new Set(obstacles.map(o => `${o.r},${o.c}`));
  if (obsSet.has(`${start.r},${start.c}`) || obsSet.has(`${home.r},${home.c}`)) {
    return { solvable: false, reason: "Vật cản đè lên Start hoặc Home" };
  }

  const starMap = new Map();
  for (let i = 0; i < stars.length; i++) {
    const key = `${stars[i].r},${stars[i].c}`;
    if (!inBounds(stars[i].r, stars[i].c) || obsSet.has(key) || key === `${start.r},${start.c}`) {
      return { solvable: false, reason: `Ngôi sao ${i + 1} đặt sai vị trí` };
    }
    starMap.set(key, i);
  }

  const fullMask = (1 << stars.length) - 1;
  const visited = new Set([`${start.r},${start.c},0,,0`]);
  const queue = [{ r: start.r, c: start.c, mask: 0, lastDir: "", hasRepeat: false, path: [] }];

  while (queue.length > 0) {
    const curr = queue.shift();
    if (curr.r === home.r && curr.c === home.c && curr.mask === fullMask && curr.path.length > 0) {
      if (!requireRepeat || curr.hasRepeat) {
        return { solvable: true, minSteps: curr.path.length, path: curr.path };
      }
    }
    if (curr.path.length >= maxSteps) continue;

    for (const dir of DIR_NAMES) {
      const nr = curr.r + DIR_DELTAS[dir].dr;
      const nc = curr.c + DIR_DELTAS[dir].dc;
      const posKey = `${nr},${nc}`;
      if (!inBounds(nr, nc) || obsSet.has(posKey)) continue;

      let nextMask = curr.mask;
      if (starMap.has(posKey)) nextMask |= (1 << starMap.get(posKey));

      const nextHasRepeat = curr.hasRepeat || (curr.lastDir === dir);
      const stateKey = `${nr},${nc},${nextMask},${dir},${nextHasRepeat ? 1 : 0}`;
      if (visited.has(stateKey)) continue;

      visited.add(stateKey);
      queue.push({
        r: nr, c: nc, mask: nextMask, lastDir: dir,
        hasRepeat: nextHasRepeat, path: [...curr.path, dir]
      });
    }
  }
  return { solvable: false, reason: "Không có lời giải hợp lệ trong giới hạn bước" };
}

function generateSolvableLevel({ size = 6, starCount = 3, obstacleCount = 4, requireRepeat = true, isScratch = true } = {}) {
  const types = ["rock", "puddle", "bush"];
  const rand = (n) => Math.floor(Math.random() * n);

  for (let attempt = 0; attempt < 250; attempt++) {
    const used = new Set();
    const pick = () => {
      for (let t = 0; t < 40; t++) {
        const r = rand(size), c = rand(size);
        const k = `${r},${c}`;
        if (!used.has(k)) { used.add(k); return { r, c }; }
      }
      return null;
    };

    const start = pick();
    const home = pick();
    if (!start || !home) continue;
    if (Math.abs(start.r - home.r) + Math.abs(start.c - home.c) < size - 1) continue;

    const stars = [];
    for (let i = 0; i < starCount; i++) { const s = pick(); if (s) stars.push(s); }

    const obstacles = [];
    for (let i = 0; i < obstacleCount; i++) {
      const o = pick();
      if (o) obstacles.push({ r: o.r, c: o.c, type: types[(i + attempt) % types.length] });
    }

    const candidate = {
      size, maxSteps: size * 3, start, home, stars, obstacles,
      requireRepeat, isRandom: true, isScratch
    };

    const res = solveLevel(candidate);
    if (res.solvable && res.minSteps >= size && res.minSteps <= size * 3 - 2) {
      candidate.maxSteps = res.minSteps + 2;
      candidate.hint = res.path;
      return candidate;
    }
  }

  const fallback = structuredClone(SCRATCH_LEVELS[0]);
  fallback.isRandom = true;
  fallback.isScratch = isScratch;
  return fallback;
}

// 10 MÀN CƠ BẢN (PHẦN 1)
const LEVELS = [
  { size: 4, maxSteps: 6, start: { r: 3, c: 0 }, home: { r: 3, c: 3 }, stars: [{ r: 3, c: 2 }], obstacles: [] },
  { size: 4, maxSteps: 8, start: { r: 3, c: 0 }, home: { r: 1, c: 2 }, stars: [{ r: 3, c: 2 }], obstacles: [{ r: 2, c: 0, type: "rock" }] },
  { size: 4, maxSteps: 8, start: { r: 0, c: 0 }, home: { r: 3, c: 3 }, stars: [{ r: 0, c: 2 }, { r: 2, c: 3 }], obstacles: [{ r: 1, c: 1, type: "puddle" }, { r: 2, c: 1, type: "bush" }] },
  { size: 5, maxSteps: 10, start: { r: 4, c: 0 }, home: { r: 0, c: 4 }, stars: [{ r: 2, c: 0 }, { r: 2, c: 4 }], obstacles: [{ r: 4, c: 2, type: "rock" }, { r: 1, c: 2, type: "bush" }] },
  { size: 5, maxSteps: 10, start: { r: 4, c: 2 }, home: { r: 0, c: 2 }, stars: [{ r: 2, c: 1 }, { r: 2, c: 3 }], obstacles: [{ r: 3, c: 2, type: "rock" }, { r: 1, c: 2, type: "puddle" }, { r: 2, c: 0, type: "bush" }, { r: 2, c: 4, type: "bush" }] },
  { size: 5, maxSteps: 12, start: { r: 0, c: 4 }, home: { r: 4, c: 0 }, stars: [{ r: 0, c: 1 }, { r: 3, c: 3 }, { r: 4, c: 1 }], obstacles: [{ r: 1, c: 3, type: "bush" }, { r: 2, c: 1, type: "rock" }] },
  { size: 5, maxSteps: 12, start: { r: 4, c: 0 }, home: { r: 0, c: 0 }, stars: [{ r: 4, c: 3 }, { r: 2, c: 3 }, { r: 0, c: 3 }], obstacles: [{ r: 3, c: 0, type: "rock" }, { r: 2, c: 1, type: "puddle" }, { r: 1, c: 0, type: "bush" }] },
  { size: 6, maxSteps: 14, start: { r: 5, c: 0 }, home: { r: 0, c: 5 }, stars: [{ r: 5, c: 3 }, { r: 2, c: 3 }, { r: 2, c: 5 }], obstacles: [{ r: 4, c: 1, type: "rock" }, { r: 3, c: 4, type: "puddle" }, { r: 1, c: 2, type: "bush" }, { r: 0, c: 3, type: "rock" }] },
  { size: 6, maxSteps: 15, start: { r: 0, c: 0 }, home: { r: 5, c: 5 }, stars: [{ r: 2, c: 0 }, { r: 2, c: 4 }, { r: 5, c: 2 }], obstacles: [{ r: 0, c: 2, type: "rock" }, { r: 1, c: 2, type: "rock" }, { r: 3, c: 4, type: "puddle" }, { r: 4, c: 1, type: "bush" }] },
  { size: 6, maxSteps: 16, start: { r: 5, c: 2 }, home: { r: 0, c: 3 }, stars: [{ r: 4, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 5 }, { r: 0, c: 5 }], obstacles: [{ r: 4, c: 2, type: "rock" }, { r: 3, c: 2, type: "puddle" }, { r: 2, c: 3, type: "bush" }, { r: 2, c: 4, type: "rock" }] }
];

// 5 MÀN SCRATCH NÂNG CAO (MÀN 11 - 15: Thiết kế theo mẫu lặp bậc thang, ziczac & vượt chướng ngại)
const SCRATCH_LEVELS = [
  {
    // Màn 11 (Scratch 1): Cầu thang 3 bậc -> Lặp lại 3 lần { Phải, Lên }
    size: 5, maxSteps: 8, isScratch: true,
    start: { r: 4, c: 0 }, home: { r: 1, c: 3 },
    stars: [{ r: 3, c: 1 }, { r: 2, c: 2 }],
    obstacles: [{ r: 4, c: 2, type: "rock" }, { r: 2, c: 0, type: "bush" }]
  },
  {
    // Màn 12 (Scratch 2): Ziczac 4 bậc -> Lặp lại 4 lần { Lên, Phải }
    size: 6, maxSteps: 10, isScratch: true,
    start: { r: 5, c: 0 }, home: { r: 1, c: 4 },
    stars: [{ r: 4, c: 1 }, { r: 3, c: 2 }, { r: 2, c: 3 }],
    obstacles: [{ r: 5, c: 2, type: "puddle" }, { r: 3, c: 0, type: "rock" }, { r: 1, c: 2, type: "bush" }]
  },
  {
    // Màn 13 (Scratch 3): Vượt 2 hàng rào đá liên tiếp -> Lặp lại 2 lần { Lên, Phải, Phải, Xuống }
    size: 6, maxSteps: 12, isScratch: true,
    start: { r: 4, c: 0 }, home: { r: 4, c: 4 },
    stars: [{ r: 3, c: 1 }, { r: 3, c: 3 }],
    obstacles: [{ r: 4, c: 1, type: "rock" }, { r: 4, c: 3, type: "rock" }, { r: 2, c: 2, type: "bush" }]
  },
  {
    // Màn 14 (Scratch 4): Cầu thang đôi đi xuống -> Lặp lại 3 lần { Phải, Xuống, Xuống } hoặc tổ hợp
    size: 6, maxSteps: 12, isScratch: true,
    start: { r: 0, c: 0 }, home: { r: 3, c: 3 },
    stars: [{ r: 1, c: 1 }, { r: 2, c: 2 }, { r: 3, c: 2 }],
    obstacles: [{ r: 0, c: 2, type: "puddle" }, { r: 2, c: 0, type: "rock" }, { r: 4, c: 3, type: "bush" }]
  },
  {
    // Màn 15 (Scratch 5): Thử thách tổng hợp 6x6
    size: 6, maxSteps: 14, isScratch: true,
    start: { r: 5, c: 1 }, home: { r: 1, c: 5 },
    stars: [{ r: 4, c: 2 }, { r: 3, c: 3 }, { r: 2, c: 4 }],
    obstacles: [
      { r: 5, c: 3, type: "rock" }, { r: 3, c: 1, type: "puddle" },
      { r: 2, c: 2, type: "bush" }, { r: 4, c: 4, type: "rock" }
    ]
  }
];

function validateAndSyncHints() {
  LEVELS.forEach((lvl, idx) => {
    const res = solveLevel({ ...lvl, requireRepeat: idx >= 5 });
    if (res.solvable) lvl.hint = res.path;
    else console.error(`Màn ${idx + 1} lỗi:`, res.reason);
  });
  SCRATCH_LEVELS.forEach((lvl, idx) => {
    const res = solveLevel({ ...lvl, requireRepeat: false });
    if (res.solvable) lvl.hint = res.path;
    else console.error(`Màn Scratch ${idx + 1} lỗi:`, res.reason);
  });
}
