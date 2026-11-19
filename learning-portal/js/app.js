(function () {
      const DB_STORAGE_KEY = 'edupath_users_db_v1';
      const SESSION_STORAGE_KEY = 'edupath_current_user_v1';
      const REMEMBERED_LOGIN_KEY = 'edupath_remembered_login_v1';
      const THEME_STORAGE_KEY = 'edupath_theme_v1';
      const LEVELS_STORAGE_KEY = 'edupath_waste_levels_v1';
      const CLOUD_URL_KEY = 'edupath_firebase_rtdb_url_v1';
      const levelFailAttempts = {};

      const DEFAULT_ADMIN = {
        id: 'usr_admin_01',
        username: 'Admin',
        password: 'xhauwfihf09124',
        birthYear: 2000,
        role: 'admin',
        isPrimaryAdmin: true,
        createdAt: 'Mặc định',
        parentNotes: [],
        gameProgress: { completedLevels: [], totalAttempts: 0, lastScore: null, logs: [] }
      };

      const DEFAULT_WASTE_LEVELS = [
        {
          id: 'lvl_1',
          title: 'Màn 1: Làm quen (Thùng cố định)',
          modeLabel: 'Cơ bản • Khóa cứng thùng',
          hint: 'Mỗi trạm đã nối ống cố định vào 1 thùng. Hãy chọn đúng loại rác cho từng biển báo NẾU!',
          timeLimit: 90,
          speedMs: 560,
          optimalSteps: 10,
          useAttributes: false,
          hasWasher: false,
          allowNotOr: false,
          allowReorder: false,
          isDefault: true,
          stations: [
            { targetBin: 'bin_organic' },
            { targetBin: 'bin_plastic_metal' },
            { targetBin: 'bin_paper' }
          ],
          endBin: 'bin_other',
          items: [
            { emoji: '🍎', name: 'Lõi táo', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '🍌', name: 'Vỏ chuối', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '🧴', name: 'Chai nhựa', category: 'plastic_metal', attrs: ['floats_light'], isDirty: false },
            { emoji: '🥫', name: 'Lon nước', category: 'plastic_metal', attrs: ['magnetic'], isDirty: false },
            { emoji: '📦', name: 'Hộp giấy', category: 'paper', attrs: ['tearable'], isDirty: false }
          ]
        },
        {
          id: 'lvl_2',
          title: 'Màn 2: Cả 4 loại rác',
          modeLabel: 'Cơ bản • 4 thùng phân loại',
          hint: 'Rác không khớp ở cả 3 trạm sẽ tự đi vào Thùng Khác ở cuối băng chuyền.',
          timeLimit: 90,
          speedMs: 520,
          optimalSteps: 16,
          useAttributes: false,
          hasWasher: false,
          allowNotOr: false,
          allowReorder: false,
          isDefault: true,
          stations: [
            { targetBin: 'bin_organic' },
            { targetBin: 'bin_plastic_metal' },
            { targetBin: 'bin_paper' }
          ],
          endBin: 'bin_other',
          items: [
            { emoji: '🍎', name: 'Lõi táo', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '🍾', name: 'Chai thủy tinh', category: 'other', attrs: ['hard_fragile'], isDirty: false },
            { emoji: '🧴', name: 'Chai nhựa', category: 'plastic_metal', attrs: ['floats_light'], isDirty: false },
            { emoji: '📦', name: 'Thùng carton', category: 'paper', attrs: ['tearable'], isDirty: false },
            { emoji: '🥫', name: 'Hộp thiếc', category: 'plastic_metal', attrs: ['magnetic'], isDirty: false },
            { emoji: '📰', name: 'Báo cũ', category: 'paper', attrs: ['tearable'], isDirty: false },
            { emoji: '🍌', name: 'Vỏ chuối', category: 'organic', attrs: ['soft_decay'], isDirty: false }
          ]
        },
        {
          id: 'lvl_3',
          title: 'Màn 3: Ít trạm hơn thùng (Dùng HOẶC)',
          modeLabel: 'Logic HOẶC (OR)',
          hint: 'Chỉ có 2 trạm cho 3 thùng! Hãy dùng điều kiện HOẶC (OR) để gom 2 loại vào thùng Tái chế.',
          timeLimit: 90,
          speedMs: 520,
          optimalSteps: 11,
          useAttributes: false,
          hasWasher: false,
          allowNotOr: true,
          allowReorder: false,
          isDefault: true,
          stations: [
            { targetBin: 'bin_organic' },
            { targetBin: 'bin_plastic_metal' }
          ],
          endBin: 'bin_other',
          items: [
            { emoji: '🍎', name: 'Lõi táo', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '🧴', name: 'Chai nhựa', category: 'plastic_metal', attrs: ['floats_light'], isDirty: false },
            { emoji: '📰', name: 'Báo cũ (Tái chế)', category: 'plastic_metal', attrs: ['tearable'], isDirty: false },
            { emoji: '🔋', name: 'Pin cũ', category: 'other', attrs: ['hard_fragile'], isDirty: false },
            { emoji: '🍌', name: 'Vỏ chuối', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '📦', name: 'Carton (Tái chế)', category: 'plastic_metal', attrs: ['tearable'], isDirty: false }
          ]
        },
        {
          id: 'lvl_4',
          title: 'Màn 4: Tư duy ngược (KHÔNG PHẢI)',
          modeLabel: 'Logic Phủ định (NOT)',
          hint: 'Chú ý! Thùng Khác nằm ở Trạm 2, còn Thùng Giấy nằm ở CUỐI băng chuyền. Hãy dùng KHÔNG PHẢI!',
          timeLimit: 90,
          speedMs: 520,
          optimalSteps: 11,
          useAttributes: false,
          hasWasher: false,
          allowNotOr: true,
          allowReorder: false,
          isDefault: true,
          stations: [
            { targetBin: 'bin_organic' },
            { targetBin: 'bin_other' }
          ],
          endBin: 'bin_paper',
          items: [
            { emoji: '🍎', name: 'Lõi táo', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '📰', name: 'Báo cũ', category: 'paper', attrs: ['tearable'], isDirty: false },
            { emoji: '🔋', name: 'Pin cũ', category: 'other', attrs: ['hard_fragile'], isDirty: false },
            { emoji: '📦', name: 'Thùng carton', category: 'paper', attrs: ['tearable'], isDirty: false },
            { emoji: '🍾', name: 'Chai thủy tinh', category: 'other', attrs: ['hard_fragile'], isDirty: false },
            { emoji: '🍌', name: 'Vỏ chuối', category: 'organic', attrs: ['soft_decay'], isDirty: false }
          ]
        },
        {
          id: 'lvl_5',
          title: 'Màn 5: Nhận diện Thuộc tính Vật lý',
          modeLabel: 'Thuộc tính • Nam châm & Phân hủy',
          hint: 'Không còn tên loại rác! Hãy phân loại dựa theo đặc tính: Hút nam châm, Mềm dễ phân hủy, Nhẹ.',
          timeLimit: 90,
          speedMs: 520,
          optimalSteps: 10,
          useAttributes: true,
          hasWasher: false,
          allowNotOr: false,
          allowReorder: false,
          isDefault: true,
          stations: [
            { targetBin: 'bin_metal' },
            { targetBin: 'bin_organic' }
          ],
          endBin: 'bin_plastic',
          items: [
            { emoji: '🥫', name: 'Lon sắt', category: 'metal', attrs: ['magnetic'], isDirty: false },
            { emoji: '🧴', name: 'Chai nhựa', category: 'plastic', attrs: ['floats_light'], isDirty: false },
            { emoji: '🍌', name: 'Vỏ chuối', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '🔩', name: 'Nắp sắt', category: 'metal', attrs: ['magnetic'], isDirty: false },
            { emoji: '🍎', name: 'Lõi táo', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '🥤', name: 'Ly nhựa', category: 'plastic', attrs: ['floats_light'], isDirty: false }
          ]
        },
        {
          id: 'lvl_6',
          title: 'Màn 6: Thuộc tính Hỗn hợp',
          modeLabel: 'Thuộc tính • 4 đặc tính vật lý',
          hint: 'Tách riêng Kim loại (hút nam châm), Hữu cơ (mềm phân hủy) và Giấy (dễ rách/thấm nước).',
          timeLimit: 90,
          speedMs: 500,
          optimalSteps: 16,
          useAttributes: true,
          hasWasher: false,
          allowNotOr: true,
          allowReorder: false,
          isDefault: true,
          stations: [
            { targetBin: 'bin_metal' },
            { targetBin: 'bin_organic' },
            { targetBin: 'bin_paper' }
          ],
          endBin: 'bin_other',
          items: [
            { emoji: '🥫', name: 'Lon thiếc', category: 'metal', attrs: ['magnetic'], isDirty: false },
            { emoji: '📰', name: 'Tờ báo', category: 'paper', attrs: ['tearable'], isDirty: false },
            { emoji: '🍾', name: 'Chai thủy tinh', category: 'other', attrs: ['hard_fragile'], isDirty: false },
            { emoji: '🍉', name: 'Vỏ dưa hấu', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '📦', name: 'Hộp giấy', category: 'paper', attrs: ['tearable'], isDirty: false },
            { emoji: '🔋', name: 'Pin hỏng', category: 'other', attrs: ['hard_fragile'], isDirty: false },
            { emoji: '🔩', name: 'Ốc vít', category: 'metal', attrs: ['magnetic'], isDirty: false }
          ]
        },
        {
          id: 'lvl_7',
          title: 'Màn 7: Rác bẩn & Trạm Rửa (Loop)',
          modeLabel: 'Tiền xử lý • Vòng lặp Rửa sạch',
          hint: 'Có rác dính bẩn (💧)! Hãy bật Trạm Rửa Sạch để rửa trước khi cho vào thùng tái chế.',
          timeLimit: 90,
          speedMs: 520,
          optimalSteps: 14,
          useAttributes: false,
          hasWasher: true,
          allowNotOr: false,
          allowReorder: false,
          isDefault: true,
          stations: [
            { targetBin: 'bin_organic' },
            { targetBin: 'bin_plastic_metal' },
            { targetBin: 'bin_paper' }
          ],
          endBin: 'bin_other',
          items: [
            { emoji: '🍎', name: 'Lõi táo', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '🥛', name: 'Hộp sữa bẩn', category: 'paper', attrs: ['tearable'], isDirty: true },
            { emoji: '🧴', name: 'Chai còn nước', category: 'plastic_metal', attrs: ['floats_light'], isDirty: true },
            { emoji: '🥫', name: 'Lon nước', category: 'plastic_metal', attrs: ['magnetic'], isDirty: false },
            { emoji: '📦', name: 'Carton sạch', category: 'paper', attrs: ['tearable'], isDirty: false },
            { emoji: '🍌', name: 'Vỏ chuối', category: 'organic', attrs: ['soft_decay'], isDirty: false }
          ]
        },
        {
          id: 'lvl_8',
          title: 'Màn 8: Dây chuyền Rửa & Phủ định',
          modeLabel: 'Tiền xử lý + Logic NOT',
          hint: 'Kết hợp bật Trạm Rửa Sạch và dùng KHÔNG PHẢI để đẩy Giấy về cuối băng chuyền!',
          timeLimit: 90,
          speedMs: 480,
          optimalSteps: 14,
          useAttributes: false,
          hasWasher: true,
          allowNotOr: true,
          allowReorder: false,
          isDefault: true,
          stations: [
            { targetBin: 'bin_organic' },
            { targetBin: 'bin_other' }
          ],
          endBin: 'bin_paper',
          items: [
            { emoji: '🍕', name: 'Hộp pizza dầu', category: 'paper', attrs: ['tearable'], isDirty: true },
            { emoji: '🍎', name: 'Lõi táo', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '🔋', name: 'Pin cũ', category: 'other', attrs: ['hard_fragile'], isDirty: false },
            { emoji: '🥛', name: 'Vỏ hộp sữa bẩn', category: 'paper', attrs: ['tearable'], isDirty: true },
            { emoji: '🍾', name: 'Chai thủy tinh', category: 'other', attrs: ['hard_fragile'], isDirty: false },
            { emoji: '📰', name: 'Báo sạch', category: 'paper', attrs: ['tearable'], isDirty: false },
            { emoji: '🍌', name: 'Vỏ chuối', category: 'organic', attrs: ['soft_decay'], isDirty: false }
          ]
        },
        {
          id: 'lvl_9',
          title: 'Màn 9: Tối ưu Thuật toán (3 Sao ⚡)',
          modeLabel: 'Tối ưu • Đổi thứ tự trạm',
          hint: 'Có 8 quả táo và chỉ 1 tờ báo! Dùng nút ⇆ Đổi chỗ trạm để đưa Thùng Hữu Cơ lên Trạm 1 nhằm tiết kiệm bước kiểm tra (≤ 13 bước = 3 Sao).',
          timeLimit: 90,
          speedMs: 400,
          optimalSteps: 13,
          useAttributes: false,
          hasWasher: false,
          allowNotOr: false,
          allowReorder: true,
          isDefault: true,
          stations: [
            { targetBin: 'bin_paper' },
            { targetBin: 'bin_plastic_metal' },
            { targetBin: 'bin_organic' }
          ],
          endBin: 'bin_other',
          items: [
            { emoji: '🍎', name: 'Táo hỏng 1', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '🍎', name: 'Táo hỏng 2', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '🍎', name: 'Táo hỏng 3', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '🧴', name: 'Chai nhựa', category: 'plastic_metal', attrs: ['floats_light'], isDirty: false },
            { emoji: '🍎', name: 'Táo hỏng 4', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '🍎', name: 'Táo hỏng 5', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '📰', name: 'Báo cũ', category: 'paper', attrs: ['tearable'], isDirty: false },
            { emoji: '🍎', name: 'Táo hỏng 6', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '🍎', name: 'Táo hỏng 7', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '🍎', name: 'Táo hỏng 8', category: 'organic', attrs: ['soft_decay'], isDirty: false }
          ]
        },
        {
          id: 'lvl_10',
          title: 'Màn 10: Đại thử thách Tổng hợp',
          modeLabel: 'Tổng hợp • Rửa + Thuộc tính + Tối ưu',
          hint: '6 Lon sắt chiếm đa số! Bật Trạm Rửa, đổi Trạm Kim loại lên Trạm 1 và dùng thuộc tính Nam châm để đạt 3 Sao (≤ 16 bước)!',
          timeLimit: 90,
          speedMs: 390,
          optimalSteps: 16,
          useAttributes: true,
          hasWasher: true,
          allowNotOr: true,
          allowReorder: true,
          isDefault: true,
          stations: [
            { targetBin: 'bin_paper' },
            { targetBin: 'bin_organic' },
            { targetBin: 'bin_metal' }
          ],
          endBin: 'bin_other',
          items: [
            { emoji: '🥫', name: 'Lon sắt 1', category: 'metal', attrs: ['magnetic'], isDirty: false },
            { emoji: '🥫', name: 'Lon sắt bẩn', category: 'metal', attrs: ['magnetic'], isDirty: true },
            { emoji: '🥫', name: 'Lon sắt 2', category: 'metal', attrs: ['magnetic'], isDirty: false },
            { emoji: '📰', name: 'Báo cũ', category: 'paper', attrs: ['tearable'], isDirty: false },
            { emoji: '🥫', name: 'Lon sắt 3', category: 'metal', attrs: ['magnetic'], isDirty: false },
            { emoji: '🍌', name: 'Vỏ chuối', category: 'organic', attrs: ['soft_decay'], isDirty: false },
            { emoji: '🥫', name: 'Lon sắt 4', category: 'metal', attrs: ['magnetic'], isDirty: false },
            { emoji: '🥛', name: 'Hộp giấy bẩn', category: 'paper', attrs: ['tearable'], isDirty: true },
            { emoji: '🥫', name: 'Lon sắt 5', category: 'metal', attrs: ['magnetic'], isDirty: false }
          ]
        }
      ];

      function safeGetStorage(key, fallback) {
        try {
          const raw = localStorage.getItem(key);
          return raw ? JSON.parse(raw) : fallback;
        } catch (err) {
          return fallback;
        }
      }

      function safeSetStorage(key, value) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {}
      }

      const DEFAULT_FIREBASE_URL = 'https://thebetterfuture-effd3-default-rtdb.asia-southeast1.firebasedatabase.app';

      function getCloudUrl() {
        const raw = safeGetStorage(CLOUD_URL_KEY, DEFAULT_FIREBASE_URL);
        if (raw === '') return '';
        return String(raw || DEFAULT_FIREBASE_URL).replace(/\/+$/, '');
      }

      async function pushUsersToCloud() {
        const url = getCloudUrl();
        if (!url) return;
        try {
          await fetch(url + '/edupath_users.json', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usersDb)
          });
        } catch (err) {}
      }

      async function pushLevelsToCloud() {
        const url = getCloudUrl();
        if (!url) return;
        try {
          await fetch(url + '/edupath_waste_levels.json', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(wasteLevels)
          });
        } catch (err) {}
      }

      async function pullUsersFromCloudOrStatic() {
        const url = getCloudUrl();
        if (url) {
          try {
            const res = await fetch(url + '/edupath_users.json');
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data)) {
                usersDb = ensureAdminAccount(data);
                safeSetStorage(DB_STORAGE_KEY, usersDb);
                renderAll();
              } else if (data === null) {
                await pushUsersToCloud();
              }
            }
            const resLvl = await fetch(url + '/edupath_waste_levels.json');
            if (resLvl.ok) {
              const lvlData = await resLvl.json();
              if (Array.isArray(lvlData) && lvlData.length > 0) {
                wasteLevels = syncDefaultLevels(lvlData);
                safeSetStorage(LEVELS_STORAGE_KEY, wasteLevels);
                renderAll();
              }
            }
            return;
          } catch (err) {}
        }
        // Also merge any static accounts committed to data/database.json on GitHub/Vercel
        try {
          const resStatic = await fetch('data/database.json');
          if (resStatic.ok) {
            const staticData = await resStatic.json();
            if (staticData && Array.isArray(staticData.users)) {
              let changed = false;
              staticData.users.forEach(function (su) {
                const exists = usersDb.some(function (u) {
                  return u.username.toLowerCase() === String(su.username || '').toLowerCase();
                });
                if (!exists && su.username) {
                  usersDb.push(su);
                  changed = true;
                }
              });
              if (changed) {
                usersDb = ensureAdminAccount(usersDb);
                safeSetStorage(DB_STORAGE_KEY, usersDb); pushUsersToCloud();
                renderAll();
              }
            }
          }
        } catch (err) {}
      }

      function ensureAdminAccount(dbList) {
        const list = Array.isArray(dbList) ? dbList : [];
        const existingAdmin = list.find(function (u) {
          return u.username.toLowerCase() === 'admin';
        });
        if (!existingAdmin) {
          list.unshift(Object.assign({}, DEFAULT_ADMIN));
        } else {
          existingAdmin.role = 'admin';
          existingAdmin.isPrimaryAdmin = true;
          if (!existingAdmin.gameProgress) {
            existingAdmin.gameProgress = { completedLevels: [], totalAttempts: 0, lastScore: null, logs: [] };
          }
        }
        return list;
      }

      let usersDb = ensureAdminAccount(safeGetStorage(DB_STORAGE_KEY, []));
      safeSetStorage(DB_STORAGE_KEY, usersDb); pushUsersToCloud();

      function syncDefaultLevels(list) {
        const arr = Array.isArray(list) ? list : [];
        const customOnly = arr.filter(function (l) { return l && !l.isDefault; });
        return JSON.parse(JSON.stringify(DEFAULT_WASTE_LEVELS)).concat(customOnly);
      }

      let wasteLevels = syncDefaultLevels(safeGetStorage(LEVELS_STORAGE_KEY, null));
      safeSetStorage(LEVELS_STORAGE_KEY, wasteLevels);

      let currentUser = safeGetStorage(SESSION_STORAGE_KEY, null);
      // Auto-restore remembered user if session was cleared
      if (!currentUser) {
        const rem = safeGetStorage(REMEMBERED_LOGIN_KEY, null);
        if (rem && rem.username && rem.autoLogin) {
          const foundRem = usersDb.find(function (u) {
            return u.username.toLowerCase() === rem.username.toLowerCase() && u.password === rem.password;
          });
          if (foundRem) {
            currentUser = foundRem;
            safeSetStorage(SESSION_STORAGE_KEY, currentUser);
          }
        }
      }

      let currentView = 'library'; // 'library' | 'parent' | 'db'
      let showAllPasswords = false;
      const revealedUsernames = new Set();

      // Game State
      let activeLevelIdx = 0;
      let isGameRunning = false;
      let gameTimerInterval = null;
      let gameSecondsLeft = 90;
      let draftLevelItems = [];

      function isAdmin(user) {
        return Boolean(user && user.role === 'admin');
      }

      function applyTheme(theme) {
        const isDark = theme === 'dark';
        document.documentElement.classList.toggle('dark', isDark);
        const sunIcon = document.getElementById('themeSunIcon');
        const moonIcon = document.getElementById('themeMoonIcon');
        const labelText = document.getElementById('themeLabelText');
        if (sunIcon && moonIcon && labelText) {
          if (isDark) {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
            labelText.textContent = 'Sáng';
          } else {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
            labelText.textContent = 'Tối';
          }
        }
      }

      function initTheme() {
        applyTheme(safeGetStorage(THEME_STORAGE_KEY, 'light'));
      }

      function toggleTheme() {
        const nextTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        safeSetStorage(THEME_STORAGE_KEY, nextTheme);
        applyTheme(nextTheme);
      }

      function syncCurrentUser() {
        if (!currentUser) return;
        const found = usersDb.find(function (u) {
          return u.username.toLowerCase() === currentUser.username.toLowerCase();
        });
        if (found) {
          if (!found.gameProgress) {
            found.gameProgress = { completedLevels: [], totalAttempts: 0, lastScore: null, logs: [] };
          }
          currentUser = found;
          safeSetStorage(SESSION_STORAGE_KEY, currentUser);
        } else {
          currentUser = null;
          safeSetStorage(SESSION_STORAGE_KEY, null);
        }
      }

      function escapeHtml(str) {
        return String(str || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

      function showToast(message, type) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        const bgClass = type === 'error'
          ? 'bg-rose-600 text-white'
          : type === 'info'
          ? 'bg-slate-800 dark:bg-slate-700 text-white'
          : 'bg-emerald-600 text-white';
        toast.className = 'pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-xs font-semibold flex items-center justify-between gap-3 fade-in ' + bgClass;
        toast.innerHTML = '<span>' + escapeHtml(message) + '</span>';
        container.appendChild(toast);
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 3000);
      }

      function switchView(viewName) {
        syncCurrentUser();
        if (viewName === 'db' && !isAdmin(currentUser)) {
          showToast('Chỉ tài khoản Admin mới có quyền truy cập mục này.', 'error');
          viewName = 'library';
        }
        currentView = viewName;

        const viewLibrary = document.getElementById('viewLibrary');
        const viewParent = document.getElementById('viewParent');
        const viewDb = document.getElementById('viewDb');

        const navLibraryBtn = document.getElementById('navLibraryBtn');
        const navParentBtn = document.getElementById('navParentBtn');
        const navDbBtn = document.getElementById('navDbBtn');

        viewLibrary.classList.add('hidden');
        viewParent.classList.add('hidden');
        viewDb.classList.add('hidden');

        const inactiveClass = 'px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800';
        const activeClass = 'px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white';

        navLibraryBtn.className = inactiveClass;
        navParentBtn.className = inactiveClass;
        navDbBtn.className = (isAdmin(currentUser) ? '' : 'hidden ') + inactiveClass;

        if (viewName === 'parent') {
          viewParent.classList.remove('hidden');
          navParentBtn.className = activeClass;
        } else if (viewName === 'db') {
          viewDb.classList.remove('hidden');
          navDbBtn.className = activeClass;
        } else {
          viewLibrary.classList.remove('hidden');
          navLibraryBtn.className = activeClass;
        }

        renderAll();
      }

      function renderHeaderAndLibrary() {
        syncCurrentUser();
        const dbCountBadge = document.getElementById('dbCountBadge');
        if (dbCountBadge) dbCountBadge.textContent = String(usersDb.length);

        const navDbBtn = document.getElementById('navDbBtn');
        if (navDbBtn) {
          if (isAdmin(currentUser)) {
            navDbBtn.classList.remove('hidden');
          } else {
            navDbBtn.classList.add('hidden');
          }
        }

        const userHeaderInfo = document.getElementById('userHeaderInfo');
        const headerUsername = document.getElementById('headerUsername');
        const headerBirthYearBadge = document.getElementById('headerBirthYearBadge');
        const openAuthModalBtn = document.getElementById('openAuthModalBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const libBanner = document.getElementById('libraryUserBanner');
        const libUserName = document.getElementById('libUserName');

        if (currentUser) {
          userHeaderInfo.classList.remove('hidden');
          headerUsername.textContent = currentUser.username + (isAdmin(currentUser) ? ' (Admin)' : '');
          headerBirthYearBadge.textContent = 'Năm sinh: ' + currentUser.birthYear;
          openAuthModalBtn.classList.add('hidden');
          logoutBtn.classList.remove('hidden');
          libBanner.classList.remove('hidden');
          libUserName.textContent = currentUser.username;
        } else {
          userHeaderInfo.classList.add('hidden');
          openAuthModalBtn.classList.remove('hidden');
          logoutBtn.classList.add('hidden');
          libBanner.classList.add('hidden');
        }

        document.getElementById('libGameLevelCountBadge').textContent = wasteLevels.length + ' Levels';
        const completedCount = (currentUser && currentUser.gameProgress && Array.isArray(currentUser.gameProgress.completedLevels))
          ? currentUser.gameProgress.completedLevels.length
          : 0;
        document.getElementById('libWasteProgressText').textContent = completedCount + ' / ' + wasteLevels.length;
      }

      // --- WASTE SORTING GAME LOGIC (FIXED BINS, NOT/OR, ATTRS, WASHER LOOP, OPTIMIZATION) ---
      const BIN_META = {
        bin_organic: { label: 'HỮU CƠ', short: 'Hữu cơ', color: '#16a34a', rim: '#22c55e', text: '#ffffff', badge: '🟢' },
        bin_plastic_metal: { label: 'NHỰA / KL', short: 'Nhựa / KL', color: '#eab308', rim: '#facc15', text: '#1e293b', badge: '🟡' },
        bin_metal: { label: 'KIM LOẠI', short: 'Kim loại', color: '#f97316', rim: '#fb923c', text: '#ffffff', badge: '🟠' },
        bin_plastic: { label: 'NHỰA', short: 'Nhựa', color: '#eab308', rim: '#facc15', text: '#1e293b', badge: '🟡' },
        bin_paper: { label: 'GIẤY', short: 'Giấy', color: '#2563eb', rim: '#3b82f6', text: '#ffffff', badge: '🔵' },
        bin_other: { label: 'KHÁC', short: 'Khác', color: '#64748b', rim: '#94a3b8', text: '#ffffff', badge: '⚪' }
      };

      const CATEGORY_OPTIONS = [
        { value: 'organic', label: '🍎 Hữu cơ' },
        { value: 'plastic_metal', label: '🧴 Nhựa / Kim loại' },
        { value: 'paper', label: '📰 Giấy' },
        { value: 'other', label: '🍾 Khác' }
      ];

      const ATTR_OPTIONS = [
        { value: 'magnetic', label: '🧲 Bị nam châm hút' },
        { value: 'soft_decay', label: '🍂 Mềm / Dễ phân hủy' },
        { value: 'floats_light', label: '💧 Nhẹ / Không thấm nước' },
        { value: 'tearable', label: '📄 Dễ rách / Thấm nước' },
        { value: 'hard_fragile', label: '💎 Cứng / Dễ vỡ' }
      ];

      let stationConfigs = []; // [{ targetBin, op: 'IS'|'NOT'|'OR', val1: '', val2: '' }]
      let currentEndBin = 'bin_other';

      function formatSeconds(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      }

      function stopGameTimer() {
        if (gameTimerInterval) {
          clearInterval(gameTimerInterval);
          gameTimerInterval = null;
        }
      }

      function startGameTimer() {
        stopGameTimer();
        gameTimerInterval = setInterval(function () {
          if (gameSecondsLeft > 0) {
            gameSecondsLeft--;
            document.getElementById('gameTimerDisplay').textContent = formatSeconds(gameSecondsLeft);
          } else {
            stopGameTimer();
          }
        }, 1000);
      }

      function renderLevelPills() {
        const bar = document.getElementById('levelSelectorBar');
        const completed = (currentUser && currentUser.gameProgress && Array.isArray(currentUser.gameProgress.completedLevels))
          ? currentUser.gameProgress.completedLevels
          : [];
        bar.innerHTML = wasteLevels.map(function (lvl, idx) {
          const isActive = idx === activeLevelIdx;
          const isDone = completed.indexOf(lvl.id) !== -1;
          const cls = isActive
            ? 'px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-xs'
            : 'px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';
          return '<button type="button" data-select-level="' + idx + '" class="' + cls + '">' +
            (isDone ? '✓ ' : '') + 'Màn ' + (idx + 1) +
            '</button>';
        }).join('');
      }

      function getActiveLevelBins(lvl) {
        const bins = [];
        stationConfigs.forEach(function (st) {
          if (bins.indexOf(st.targetBin) === -1) bins.push(st.targetBin);
        });
        if (bins.indexOf(currentEndBin) === -1) bins.push(currentEndBin);
        return bins;
      }

      function getConditionLabel(st, useAttrs) {
        const opts = useAttrs ? ATTR_OPTIONS : CATEGORY_OPTIONS;
        function findLbl(v) {
          const f = opts.find(function (o) { return o.value === v; });
          return f ? f.label.replace(/^[^\s]+\s/, '') : 'Chưa chọn';
        }
        if (!st.val1) return 'Chưa đặt biển';
        if (st.op === 'NOT') return 'KHÔNG PHẢI ' + findLbl(st.val1);
        if (st.op === 'OR') return findLbl(st.val1) + ' HOẶC ' + (st.val2 ? findLbl(st.val2) : '?');
        return findLbl(st.val1);
      }

      function renderStationCards() {
        const lvl = wasteLevels[activeLevelIdx];
        const grid = document.getElementById('stationsConfigGrid');
        if (!lvl || !grid) return;

        const opts = lvl.useAttributes ? ATTR_OPTIONS : CATEGORY_OPTIONS;
        const colsClass = stationConfigs.length === 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'grid grid-cols-1 md:grid-cols-3 gap-4';
        grid.className = colsClass;

        const borderColors = ['border-purple-300 dark:border-purple-700', 'border-emerald-300 dark:border-emerald-700', 'border-sky-300 dark:border-sky-700'];

        grid.innerHTML = stationConfigs.map(function (st, idx) {
          const binInfo = BIN_META[st.targetBin] || BIN_META.bin_other;
          const opSelectHtml = lvl.allowNotOr
            ? '<select data-st-op="' + idx + '" class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">' +
                '<option value="IS"' + (st.op === 'IS' ? ' selected' : '') + '>LÀ</option>' +
                '<option value="NOT"' + (st.op === 'NOT' ? ' selected' : '') + '>KHÔNG PHẢI</option>' +
                '<option value="OR"' + (st.op === 'OR' ? ' selected' : '') + '>HOẶC</option>' +
              '</select>'
            : '<span class="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">LÀ</span>';

          const val1Options = '<option value="">-- Chọn điều kiện --</option>' + opts.map(function (o) {
            return '<option value="' + o.value + '"' + (st.val1 === o.value ? ' selected' : '') + '>' + escapeHtml(o.label) + '</option>';
          }).join('');

          const val2Html = (lvl.allowNotOr && st.op === 'OR')
            ? '<select data-st-val2="' + idx + '" class="w-full mt-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-2.5 py-2 font-semibold">' +
                '<option value="">-- Hoặc loại thứ 2 --</option>' +
                opts.map(function (o) {
                  return '<option value="' + o.value + '"' + (st.val2 === o.value ? ' selected' : '') + '>' + escapeHtml(o.label) + '</option>';
                }).join('') +
              '</select>'
            : '';

          const reorderHtml = (lvl.allowReorder && idx < stationConfigs.length - 1)
            ? '<button type="button" data-swap-station="' + idx + '" title="Đổi chỗ với trạm kế tiếp để tối ưu bước" class="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-200 transition">⇆ Đổi trạm ' + (idx + 1) + '↔' + (idx + 2) + '</button>'
            : '';

          const nextText = (idx < stationConfigs.length - 1)
            ? '➡️ Không khớp: Đi tiếp Trạm ' + (idx + 2)
            : '➡️ Không khớp: Cuối băng chuyền (' + (BIN_META[currentEndBin] ? BIN_META[currentEndBin].badge + ' ' + BIN_META[currentEndBin].short : '') + ')';

          return (
            '<div class="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border-2 ' + borderColors[idx % 3] + ' p-4 shadow-xs space-y-2.5 text-xs">' +
              '<div class="flex items-center justify-between gap-2">' +
                '<span class="px-2.5 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-extrabold uppercase">Trạm ' + (idx + 1) + '</span>' +
                reorderHtml +
                '<span id="stationStatus' + (idx + 1) + '" class="text-[11px] font-semibold text-slate-400">Chờ</span>' +
              '</div>' +
              '<div class="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">' +
                '<span class="text-slate-500 dark:text-slate-400">Ống dẫn cố định:</span>' +
                '<span class="font-bold text-slate-900 dark:text-white">' + binInfo.badge + ' Thùng ' + binInfo.short + '</span>' +
              '</div>' +
              '<div>' +
                '<div class="flex items-center justify-between gap-2 mb-1">' +
                  '<span class="font-bold text-slate-700 dark:text-slate-300">NẾU:</span>' +
                  opSelectHtml +
                '</div>' +
                '<select data-st-val1="' + idx + '" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-2.5 py-2 font-semibold">' +
                  val1Options +
                '</select>' +
                val2Html +
              '</div>' +
              '<p class="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">' + nextText + '</p>' +
            '</div>'
          );
        }).join('');
      }

      // --- 60FPS CANVAS ANIMATION & WEB AUDIO SFX ---
      let soundEnabled = true;
      let audioCtx = null;
      let animFrameId = null;
      let beltOffset = 0;
      let activeStationHighlight = 0;
      let activeStationColor = '#6366f1';
      let washerLit = false;
      let activeMovingItem = null;
      let queuedCanvasItems = [];
      let binCanvasState = {};
      let particles = [];
      let cloudOffset = 0;

      function ensureAudio() {
        if (!soundEnabled) return null;
        if (!audioCtx) {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          if (Ctx) audioCtx = new Ctx();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume().catch(function () {});
        }
        return audioCtx;
      }

      function playSfx(type) {
        const ctx = ensureAudio();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'tick') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.09);
        } else if (type === 'wash') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(380, now);
          osc.frequency.linearRampToValueAtTime(760, now + 0.18);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.start(now);
          osc.stop(now + 0.23);
        } else if (type === 'correct') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.07);
          osc.frequency.setValueAtTime(783.99, now + 0.14);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.32);
        } else if (type === 'wrong') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.linearRampToValueAtTime(140, now + 0.24);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
          osc.start(now);
          osc.stop(now + 0.27);
        } else if (type === 'win') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.1);
          osc.frequency.setValueAtTime(783.99, now + 0.2);
          osc.frequency.setValueAtTime(1046.5, now + 0.3);
          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
          osc.start(now);
          osc.stop(now + 0.58);
        }
      }

      function spawnBurst(x, y, color) {
        for (let p = 0; p < 14; p++) {
          const angle = (Math.PI * 2 * p) / 14;
          const spd = 1.6 + Math.random() * 2.5;
          particles.push({
            x: x, y: y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd - 1.5,
            life: 1.0,
            color: color
          });
        }
      }

      function resizeFactoryCanvas() {
        const canvas = document.getElementById('wasteFactoryCanvas');
        if (!canvas) return;
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const w = Math.max(320, Math.floor(rect.width));
        const h = 410;
        if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
          canvas.width = w * dpr;
          canvas.height = h * dpr;
          canvas.style.width = w + 'px';
          canvas.style.height = h + 'px';
        }
      }

      function drawRoundedBox(ctx, x, y, w, h, r, fill, stroke, lineWidth) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth || 2; ctx.stroke(); }
      }

      function drawConveyorBelt(ctx, x, y, w, h, offset) {
        drawRoundedBox(ctx, x, y, w, h, h / 2, '#94a3b8', '#475569', 2.5);
        drawRoundedBox(ctx, x + 4, y + 3, w - 8, h - 6, (h - 6) / 2, '#cbd5e1', null);
        const rollerSpacing = 34;
        const count = Math.floor((w - 28) / rollerSpacing);
        const startX = x + 16;
        for (let i = 0; i <= count; i++) {
          const rx = startX + i * rollerSpacing;
          const ry = y + h / 2;
          ctx.beginPath();
          ctx.arc(rx, ry, 5.5, 0, Math.PI * 2);
          ctx.fillStyle = '#64748b';
          ctx.fill();
          ctx.beginPath();
          const ang = (offset * 0.12) % (Math.PI * 2);
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx + Math.cos(ang) * 4.5, ry + Math.sin(ang) * 4.5);
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      function getCanvasGeometry() {
        const canvas = document.getElementById('wasteFactoryCanvas');
        const dpr = window.devicePixelRatio || 1;
        const W = canvas.width / dpr;
        const H = canvas.height / dpr;
        const lvl = wasteLevels[activeLevelIdx] || DEFAULT_WASTE_LEVELS[0];
        const lowBeltW = Math.min(W - 40, 760);
        const lowBeltX = (W - lowBeltW) / 2;
        const lowBeltY = 204;

        // Bins order strictly matches Station 1..N + EndBin at the far right!
        const activeBins = [];
        stationConfigs.forEach(function (st) { activeBins.push(st.targetBin); });
        activeBins.push(currentEndBin);

        const binCount = activeBins.length;
        const binW = Math.min(116, (W - 50) / binCount);
        const binGap = (W - binW * binCount) / (binCount + 1);
        const binCenters = {};
        const stXs = [];

        activeBins.forEach(function (binId, bi) {
          const cx = binGap + bi * (binW + binGap) + binW / 2;
          binCenters[binId] = cx;
          if (bi < stationConfigs.length) {
            stXs.push(cx);
          }
        });

        return {
          W: W, H: H, lvl: lvl,
          lowBeltX: lowBeltX, lowBeltW: lowBeltW, lowBeltY: lowBeltY,
          stXs: stXs, activeBins: activeBins, binW: binW, binGap: binGap,
          binCenters: binCenters, binTopY: H - 94,
          washerX: Math.min(W - 75, lowBeltX + lowBeltW - 45),
          washerY: 42
        };
      }

      function drawFactoryScene() {
        const canvas = document.getElementById('wasteFactoryCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const geo = getCanvasGeometry();
        const W = geo.W, H = geo.H, lvl = geo.lvl;
        const isDark = document.documentElement.classList.contains('dark');

        ctx.save();
        ctx.scale(dpr, dpr);

        // 1. Sky & Hills Background
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
        if (isDark) {
          skyGrad.addColorStop(0, '#0f172a');
          skyGrad.addColorStop(1, '#1e293b');
        } else {
          skyGrad.addColorStop(0, '#bae6fd');
          skyGrad.addColorStop(0.65, '#e0f2fe');
          skyGrad.addColorStop(1, '#dcfce7');
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H);

        cloudOffset = (cloudOffset + 0.18) % (W + 160);
        ctx.fillStyle = isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(255, 255, 255, 0.78)';
        [0, W * 0.48, W * 0.85].forEach(function (cxBase, ci) {
          const cx = ((cxBase + cloudOffset) % (W + 140)) - 70;
          const cy = 34 + (ci % 2) * 22;
          ctx.beginPath();
          ctx.arc(cx, cy, 18, 0, Math.PI * 2);
          ctx.arc(cx + 16, cy - 6, 22, 0, Math.PI * 2);
          ctx.arc(cx + 34, cy, 16, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = isDark ? '#064e3b' : '#86efac';
        ctx.beginPath();
        ctx.moveTo(0, H - 72);
        ctx.quadraticCurveTo(W * 0.25, H - 108, W * 0.55, H - 78);
        ctx.quadraticCurveTo(W * 0.82, H - 52, W, H - 84);
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        ctx.fill();

        // 2. Top Input Belt
        const topBeltW = Math.min(W - 140, 480);
        const topBeltX = lvl.hasWasher ? 24 : (W - topBeltW) / 2;
        const topBeltY = 68;

        drawRoundedBox(ctx, topBeltX + topBeltW / 2 - 50, 10, 100, 26, 13, '#475569', '#334155', 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ĐẦU VÀO', topBeltX + topBeltW / 2, 23);

        if (isGameRunning) beltOffset += 1.7;
        drawConveyorBelt(ctx, topBeltX, topBeltY, topBeltW, 18, beltOffset);

        // Queued items on top belt
        const qCount = queuedCanvasItems.length;
        const qStep = Math.min(46, (topBeltW - 44) / Math.max(1, qCount));
        for (let qi = 0; qi < qCount; qi++) {
          const it = queuedCanvasItems[qi];
          const qx = topBeltX + 26 + qi * qStep;
          const qy = topBeltY - 13;
          ctx.font = '23px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(it.emoji, qx, qy);
          if (it.isDirty) {
            ctx.font = '12px sans-serif';
            ctx.fillText('💧', qx + 11, qy - 10);
          }
        }

        // Optional Washer Station (Top Right)
        if (lvl.hasWasher) {
          const wx = geo.washerX;
          const wy = geo.washerY;
          const isToggleOn = document.getElementById('washerRuleToggle').checked;
          drawRoundedBox(
            ctx, wx - 56, wy - 24, 112, 52, 12,
            washerLit ? '#cffafe' : (isDark ? '#164e63' : '#ecfeff'),
            washerLit ? '#06b6d4' : (isToggleOn ? '#0891b2' : '#94a3b8'),
            washerLit ? 3.5 : 2
          );
          ctx.fillStyle = isDark ? '#cffafe' : '#0e7490';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🚿 TRẠM RỬA', wx, wy - 6);
          ctx.font = '10px Inter, sans-serif';
          ctx.fillText(isToggleOn ? 'ĐANG BẬT (LOOP)' : 'ĐANG TẮT', wx, wy + 12);
        }

        // 3. Lower Main Conveyor Belt
        const lowBeltX = geo.lowBeltX;
        const lowBeltW = geo.lowBeltW;
        const lowBeltY = geo.lowBeltY;
        drawConveyorBelt(ctx, lowBeltX, lowBeltY, lowBeltW, 22, beltOffset);

        // Fixed Pipes from each Station straight down to its assigned Bin + End chute
        const stColors = ['#a855f7', '#10b981', '#0ea5e9'];
        geo.stXs.forEach(function (sx, idx) {
          // Vertical chute pipe from belt to bin
          ctx.strokeStyle = isDark ? 'rgba(148,163,184,0.45)' : 'rgba(100,116,139,0.45)';
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.moveTo(sx, lowBeltY + 22);
          ctx.lineTo(sx, geo.binTopY - 4);
          ctx.stroke();

          // Station Signpost above belt
          const st = stationConfigs[idx];
          const isLit = activeStationHighlight === (idx + 1);
          const boxW = Math.min(156, (W - 40) / Math.max(2, stationConfigs.length) - 10);
          const boxH = 54;
          const bx = sx - boxW / 2;
          const by = 118;

          ctx.strokeStyle = isLit ? activeStationColor : stColors[idx % 3];
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(sx, by + boxH);
          ctx.lineTo(sx, lowBeltY);
          ctx.stroke();

          drawRoundedBox(
            ctx, bx, by, boxW, boxH, 10,
            isDark ? '#1e293b' : '#ffffff',
            isLit ? activeStationColor : stColors[idx % 3],
            isLit ? 3.5 : 2
          );

          ctx.fillStyle = stColors[idx % 3];
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('TRẠM ' + (idx + 1) + ' → ' + (BIN_META[st.targetBin] ? BIN_META[st.targetBin].short : ''), sx, by + 15);

          ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
          ctx.font = 'bold 10.5px Inter, sans-serif';
          const condTxt = getConditionLabel(st, lvl.useAttributes);
          ctx.fillText(condTxt.length > 20 ? condTxt.slice(0, 19) + '…' : condTxt, sx, by + 36);
        });

        // End-of-belt chute into EndBin
        const endBinCx = geo.binCenters[currentEndBin];
        if (endBinCx) {
          ctx.strokeStyle = isDark ? 'rgba(148,163,184,0.45)' : 'rgba(100,116,139,0.45)';
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.moveTo(lowBeltX + lowBeltW - 14, lowBeltY + 14);
          ctx.quadraticCurveTo(endBinCx, lowBeltY + 30, endBinCx, geo.binTopY - 4);
          ctx.stroke();
        }

        // 4. Bins at Bottom (in exact fixed physical order)
        geo.activeBins.forEach(function (binId, bi) {
          const cfg = BIN_META[binId] || BIN_META.bin_other;
          const st = binCanvasState[binId] || { count: 0, bounce: 0, items: [], ruined: false };
          const bounceOffset = st.bounce > 0 ? Math.sin(st.bounce * Math.PI) * 7 : 0;
          if (st.bounce > 0) st.bounce = Math.max(0, st.bounce - 0.08);

          const bx = geo.binGap + bi * (geo.binW + geo.binGap);
          const by = H - 104 + bounceOffset;
          const bh = 88;

          ctx.fillStyle = st.ruined ? '#dc2626' : cfg.color;
          ctx.beginPath();
          ctx.moveTo(bx + 6, by + 12);
          ctx.lineTo(bx + geo.binW - 6, by + 12);
          ctx.lineTo(bx + geo.binW - 14, by + bh);
          ctx.lineTo(bx + 14, by + bh);
          ctx.closePath();
          ctx.fill();

          drawRoundedBox(ctx, bx, by, geo.binW, 16, 6, st.ruined ? '#ef4444' : cfg.rim, null);

          ctx.fillStyle = st.ruined ? '#ffffff' : cfg.text;
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(cfg.label, bx + geo.binW / 2, by + 35);

          ctx.font = 'bold 14px Inter, sans-serif';
          ctx.fillText(st.ruined ? 'HỎNG!' : String(st.count), bx + geo.binW / 2, by + 55);

          if (st.items.length > 0) {
            ctx.font = '13px sans-serif';
            ctx.fillText(st.items.slice(-3).join(' '), bx + geo.binW / 2, by + 74);
          }
        });

        // 5. Active Moving Item
        if (activeMovingItem) {
          ctx.save();
          ctx.translate(activeMovingItem.x, activeMovingItem.y);
          ctx.font = '32px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(activeMovingItem.emoji, 0, 0);
          if (activeMovingItem.isDirty) {
            ctx.font = '14px sans-serif';
            ctx.fillText('💧', 15, -13);
          }
          ctx.restore();
        }

        // 6. Particles
        for (let pi = particles.length - 1; pi >= 0; pi--) {
          const pt = particles[pi];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vy += 0.14;
          pt.life -= 0.035;
          if (pt.life <= 0) {
            particles.splice(pi, 1);
          } else {
            ctx.globalAlpha = pt.life;
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }

        ctx.restore();
        animFrameId = requestAnimationFrame(drawFactoryScene);
      }

      function startFactoryAnimationLoop() {
        resizeFactoryCanvas();
        if (animFrameId) cancelAnimationFrame(animFrameId);
        animFrameId = requestAnimationFrame(drawFactoryScene);
      }

      function animateItemMove(fromX, fromY, toX, toY, durationMs, arcHeight) {
        return new Promise(function (resolve) {
          const start = performance.now();
          function step(now) {
            const t = Math.min(1, (now - start) / durationMs);
            const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            if (activeMovingItem) {
              activeMovingItem.x = fromX + (toX - fromX) * ease;
              const arc = arcHeight ? Math.sin(t * Math.PI) * arcHeight : 0;
              activeMovingItem.y = fromY + (toY - fromY) * ease - arc;
            }
            if (t < 1) requestAnimationFrame(step);
            else resolve();
          }
          requestAnimationFrame(step);
        });
      }

      function evaluateStationRule(st, item, useAttrs) {
        if (!st.val1) return false;
        const hasVal = function (v) {
          if (!v) return false;
          if (useAttrs) {
            return Array.isArray(item.attrs) && item.attrs.indexOf(v) !== -1;
          }
          return item.category === v;
        };
        if (st.op === 'NOT') return !hasVal(st.val1);
        if (st.op === 'OR') return hasVal(st.val1) || hasVal(st.val2);
        return hasVal(st.val1);
      }

      function loadWasteLevel(idx) {
        if (isGameRunning) return;
        activeLevelIdx = Math.max(0, Math.min(idx, wasteLevels.length - 1));
        const lvl = wasteLevels[activeLevelIdx];

        // Backward compatibility for custom levels created via Studio
        if (!Array.isArray(lvl.stations)) {
          lvl.stations = [
            { targetBin: 'bin_organic' },
            { targetBin: 'bin_plastic_metal' },
            { targetBin: 'bin_paper' }
          ];
          lvl.endBin = 'bin_other';
        }
        currentEndBin = lvl.endBin || 'bin_other';
        stationConfigs = lvl.stations.map(function (s) {
          return { targetBin: s.targetBin, op: 'IS', val1: '', val2: '' };
        });

        renderLevelPills();
        renderStationCards();

        document.getElementById('gameLevelSubtitle').textContent = lvl.title;
        document.getElementById('gameActiveItemStatus').textContent = lvl.hint || 'Đặt biển báo NẾU cho các trạm rồi bấm Chạy!';
        document.getElementById('gameModeBadge').textContent = lvl.modeLabel || 'Tiêu chuẩn';
        document.getElementById('gameStepsCounter').textContent = '0';
        document.getElementById('gameOptimalHint').textContent = lvl.optimalSteps ? ('(Mục tiêu 3★: ≤ ' + lvl.optimalSteps + ')') : '';
        document.getElementById('gameSortedCounter').textContent = '0/' + lvl.items.length;

        gameSecondsLeft = lvl.timeLimit || 90;
        document.getElementById('gameTimerDisplay').textContent = formatSeconds(gameSecondsLeft);

        const washerBar = document.getElementById('washerControlBar');
        if (lvl.hasWasher) {
          washerBar.classList.remove('hidden');
          document.getElementById('washerRuleToggle').checked = false;
        } else {
          washerBar.classList.add('hidden');
        }

        queuedCanvasItems = lvl.items.map(function (it) { return Object.assign({}, it); });
        activeMovingItem = null;
        activeStationHighlight = 0;
        washerLit = false;
        binCanvasState = {};
        getActiveLevelBins(lvl).forEach(function (b) {
          binCanvasState[b] = { count: 0, bounce: 0, items: [], ruined: false };
        });

        const resBanner = document.getElementById('gameResultBanner');
        resBanner.classList.add('hidden');
        document.getElementById('nextLevelBtn').classList.add('hidden');
        const hintBtn = document.getElementById('showHintBtn');
        const hintBox = document.getElementById('gameHintBox');
        if (hintBox) hintBox.classList.add('hidden');
        if (hintBtn) {
          if ((levelFailAttempts[lvl.id] || 0) >= 2) hintBtn.classList.remove('hidden');
          else hintBtn.classList.add('hidden');
        }
        startFactoryAnimationLoop();
      }

      function sleep(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms); });
      }

        // Hint & Auto-apply Optimal Solution
        function getSolutionForLevel(lvl) {
          const map = {
            lvl_1: { washer: false, stations: [{ bin: 'bin_organic', op: 'IS', val1: 'organic' }, { bin: 'bin_plastic_metal', op: 'IS', val1: 'plastic_metal' }, { bin: 'bin_paper', op: 'IS', val1: 'paper' }], text: 'Trạm 1: Hữu cơ • Trạm 2: Nhựa / Kim loại • Trạm 3: Giấy.' },
            lvl_2: { washer: false, stations: [{ bin: 'bin_organic', op: 'IS', val1: 'organic' }, { bin: 'bin_plastic_metal', op: 'IS', val1: 'plastic_metal' }, { bin: 'bin_paper', op: 'IS', val1: 'paper' }], text: 'Trạm 1: Hữu cơ • Trạm 2: Nhựa / Kim loại • Trạm 3: Giấy (Thủy tinh tự về Thùng Khác).' },
            lvl_3: { washer: false, stations: [{ bin: 'bin_organic', op: 'IS', val1: 'organic' }, { bin: 'bin_plastic_metal', op: 'IS', val1: 'plastic_metal' }], text: 'Trạm 1: LÀ Hữu cơ • Trạm 2: LÀ Nhựa / Kim loại (Pin cũ tự về Thùng Khác).' },
            lvl_4: { washer: false, stations: [{ bin: 'bin_organic', op: 'IS', val1: 'organic' }, { bin: 'bin_other', op: 'NOT', val1: 'paper' }], text: 'Trạm 1: LÀ Hữu cơ • Trạm 2 (Thùng Khác): KHÔNG PHẢI Giấy (để Giấy tự đi tới cuối băng chuyền!).' },
            lvl_5: { washer: false, stations: [{ bin: 'bin_metal', op: 'IS', val1: 'magnetic' }, { bin: 'bin_organic', op: 'IS', val1: 'soft_decay' }], text: 'Trạm 1: Bị nam châm hút • Trạm 2: Mềm / Dễ phân hủy (Nhựa tự về cuối băng chuyền).' },
            lvl_6: { washer: false, stations: [{ bin: 'bin_metal', op: 'IS', val1: 'magnetic' }, { bin: 'bin_organic', op: 'IS', val1: 'soft_decay' }, { bin: 'bin_paper', op: 'IS', val1: 'tearable' }], text: 'Trạm 1: Bị nam châm hút • Trạm 2: Mềm / Dễ phân hủy • Trạm 3: Dễ rách / Thấm nước.' },
            lvl_7: { washer: true, stations: [{ bin: 'bin_organic', op: 'IS', val1: 'organic' }, { bin: 'bin_plastic_metal', op: 'IS', val1: 'plastic_metal' }, { bin: 'bin_paper', op: 'IS', val1: 'paper' }], text: 'Bật Trạm Rửa Sạch (🚿), sau đó đặt: Trạm 1: Hữu cơ • Trạm 2: Nhựa / Kim loại • Trạm 3: Giấy.' },
            lvl_8: { washer: true, stations: [{ bin: 'bin_organic', op: 'IS', val1: 'organic' }, { bin: 'bin_other', op: 'NOT', val1: 'paper' }], text: 'Bật Trạm Rửa Sạch (🚿), Trạm 1: LÀ Hữu cơ • Trạm 2 (Thùng Khác): KHÔNG PHẢI Giấy.' },
            lvl_9: { washer: false, stations: [{ bin: 'bin_organic', op: 'IS', val1: 'organic' }, { bin: 'bin_plastic_metal', op: 'IS', val1: 'plastic_metal' }, { bin: 'bin_paper', op: 'IS', val1: 'paper' }], text: 'Đổi Thùng Hữu Cơ lên Trạm 1 để 8 quả táo không tốn bước đi qua trạm khác! (1: Hữu cơ, 2: Nhựa/KL, 3: Giấy).' },
            lvl_10: { washer: true, stations: [{ bin: 'bin_metal', op: 'IS', val1: 'magnetic' }, { bin: 'bin_organic', op: 'IS', val1: 'soft_decay' }, { bin: 'bin_paper', op: 'IS', val1: 'tearable' }], text: 'Bật Trạm Rửa Sạch (🚿), đổi Thùng Kim loại lên Trạm 1 (Nam châm hút), Trạm 2: Mềm phân hủy, Trạm 3: Dễ rách.' }
          };
          return map[lvl.id] || { washer: Boolean(lvl.hasWasher), stations: [], text: lvl.hint || 'Hãy kiểm tra lại từng loại rác và thùng tương ứng.' };
        }


      async function runConveyorSimulation() {
        if (isGameRunning) return;
        const lvl = wasteLevels[activeLevelIdx];
        if (!lvl) return;

        ensureAudio();
        isGameRunning = true;
        document.getElementById('runConveyorBtn').disabled = true;
        document.getElementById('gameResultBanner').classList.add('hidden');
        startGameTimer();

        const useWasher = lvl.hasWasher && document.getElementById('washerRuleToggle').checked;
        queuedCanvasItems = lvl.items.map(function (it) { return Object.assign({}, it); });
        binCanvasState = {};
        getActiveLevelBins(lvl).forEach(function (b) {
          binCanvasState[b] = { count: 0, bounce: 0, items: [], ruined: false };
        });

        let correctCount = 0;
        let totalSteps = 0;
        let dirtyAccident = false;
        const stepMs = lvl.speedMs || 500;
        const geo = getCanvasGeometry();

        for (let i = 0; i < lvl.items.length; i++) {
          const item = queuedCanvasItems.shift();
          document.getElementById('gameActiveItemStatus').textContent = 'Đang xử lý: ' + item.emoji + ' ' + item.name;

          activeMovingItem = { emoji: item.emoji, name: item.name, isDirty: item.isDirty, x: geo.lowBeltX + 20, y: 56 };

          // Check Washer Loop if dirty!
          if (item.isDirty && useWasher) {
            totalSteps++;
            document.getElementById('gameStepsCounter').textContent = String(totalSteps);
            await animateItemMove(geo.lowBeltX + 20, 56, geo.washerX, geo.washerY, stepMs * 0.7, 16);
            washerLit = true;
            playSfx('wash');
            spawnBurst(geo.washerX, geo.washerY, '#06b6d4');
            await sleep(stepMs * 0.45);
            activeMovingItem.isDirty = false;
            item._cleaned = true;
            washerLit = false;
            await animateItemMove(geo.washerX, geo.washerY, geo.lowBeltX + 24, geo.lowBeltY - 16, stepMs * 0.65, 22);
          } else {
            await animateItemMove(geo.lowBeltX + 20, 56, geo.lowBeltX + 24, geo.lowBeltY - 16, stepMs * 0.55, 18);
          }

          let targetBin = null;
          let currentX = geo.lowBeltX + 24;
          const beltItemY = geo.lowBeltY - 16;

          for (let sIdx = 0; sIdx < stationConfigs.length; sIdx++) {
            const st = stationConfigs[sIdx];
            await animateItemMove(currentX, beltItemY, geo.stXs[sIdx], beltItemY, stepMs * 0.65, 0);
            currentX = geo.stXs[sIdx];
            totalSteps++;
            document.getElementById('gameStepsCounter').textContent = String(totalSteps);

            activeStationHighlight = sIdx + 1;
            activeStationColor = ['#a855f7', '#10b981', '#0ea5e9'][sIdx % 3];
            const stLbl = document.getElementById('stationStatus' + (sIdx + 1));
            if (stLbl) stLbl.textContent = 'Đang xét...';
            playSfx('tick');
            await sleep(stepMs * 0.3);

            if (evaluateStationRule(st, item, lvl.useAttributes)) {
              targetBin = st.targetBin;
              if (stLbl) stLbl.textContent = '✓ Khớp → Xuống thùng';
              break;
            } else {
              if (stLbl) stLbl.textContent = '→ Đi tiếp';
            }
          }

          if (!targetBin) {
            targetBin = currentEndBin;
            await animateItemMove(currentX, beltItemY, geo.lowBeltX + geo.lowBeltW - 16, beltItemY, stepMs * 0.45, 0);
            currentX = geo.lowBeltX + geo.lowBeltW - 16;
          }

          activeStationHighlight = 0;
          const destX = geo.binCenters[targetBin];
          const destY = geo.binTopY;
          await animateItemMove(currentX, beltItemY, destX, destY, stepMs * 0.65, 18);

          const expectedBin = 'bin_' + item.category;
          const stillDirty = Boolean(item.isDirty && !item._cleaned);
          const isCorrect = (!stillDirty) && (targetBin === expectedBin);

          if (stillDirty) {
            dirtyAccident = true;
            binCanvasState[targetBin].ruined = true;
            playSfx('wrong');
            spawnBurst(destX, destY, '#ef4444');
          } else if (isCorrect) {
            correctCount++;
            playSfx('correct');
            spawnBurst(destX, destY, '#22c55e');
          } else {
            playSfx('wrong');
            spawnBurst(destX, destY, '#ef4444');
          }

          binCanvasState[targetBin].count++;
          binCanvasState[targetBin].bounce = 1.0;
          binCanvasState[targetBin].items.push(item.emoji + (isCorrect ? '' : '✕'));
          activeMovingItem = null;

          document.getElementById('gameSortedCounter').textContent = (i + 1) + '/' + lvl.items.length;
          await sleep(140);
        }

        stopGameTimer();
        isGameRunning = false;
        document.getElementById('runConveyorBtn').disabled = false;

        const total = lvl.items.length;
        const passed = (correctCount === total) && !dirtyAccident;
        const isOptimal = passed && (!lvl.optimalSteps || totalSteps <= lvl.optimalSteps);
        const stars = passed ? (isOptimal ? 3 : 2) : (correctCount > 0 ? 1 : 0);

        const banner = document.getElementById('gameResultBanner');
        const resText = document.getElementById('gameResultText');
        const starsText = document.getElementById('gameStarsText');
        const nextBtn = document.getElementById('nextLevelBtn');

        banner.classList.remove('hidden');
        if (dirtyAccident) {
          banner.className = 'rounded-xl p-4 border text-sm font-semibold flex flex-wrap items-center justify-between gap-3 bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200';
          resText.textContent = '💥 Rác bẩn làm hỏng cả thùng! Hãy bật Trạm Rửa Sạch trước khi phân loại nhé.';
          starsText.textContent = 'Đánh giá: ★☆☆ (Chưa hoàn thành)';
          nextBtn.classList.add('hidden');
        } else if (passed) {
          playSfx('win');
          banner.className = 'rounded-xl p-4 border text-sm font-semibold flex flex-wrap items-center justify-between gap-3 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
          resText.textContent = '🎉 Hoàn thành xuất sắc ' + correctCount + '/' + total + ' món trong ' + totalSteps + ' bước!';
          starsText.textContent = isOptimal
            ? 'Đánh giá: ★★★ (Tối ưu thuật toán!)'
            : 'Đánh giá: ★★☆ (Đúng hết, thử tối ưu ≤ ' + lvl.optimalSteps + ' bước để đạt 3★)';
          if (activeLevelIdx < wasteLevels.length - 1) nextBtn.classList.remove('hidden');
          else nextBtn.classList.add('hidden');
        } else {
          banner.className = 'rounded-xl p-4 border text-sm font-semibold flex flex-wrap items-center justify-between gap-3 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200';
          resText.textContent = '⚠️ Đúng ' + correctCount + '/' + total + ' món. Hãy kiểm tra lại điều kiện biển báo ở các trạm!';
          starsText.textContent = 'Đánh giá: ' + (stars === 1 ? '★☆☆' : '☆☆☆');
          nextBtn.classList.add('hidden');
        }

        if (!(passed && isOptimal)) {
          levelFailAttempts[lvl.id] = (levelFailAttempts[lvl.id] || 0) + 1;
          if (levelFailAttempts[lvl.id] >= 2) {
            const hintBtn = document.getElementById('showHintBtn');
            hintBtn.classList.remove('hidden');
            const sol = getSolutionForLevel(lvl);
            document.getElementById('gameHintText').textContent = sol.text;
            document.getElementById('gameHintBox').classList.remove('hidden');
          }
        } else {
          levelFailAttempts[lvl.id] = 0;
          document.getElementById('showHintBtn').classList.add('hidden');
          document.getElementById('gameHintBox').classList.add('hidden');
        }
        recordGameResult(lvl, correctCount, total, passed);
      }

      function recordGameResult(lvl, correctCount, total, passed) {
        syncCurrentUser();
        if (!currentUser) {
          showToast('Đăng nhập để lưu kết quả màn chơi vào tài khoản & báo cáo Phụ huynh!', 'info');
          return;
        }
        if (!currentUser.gameProgress) {
          currentUser.gameProgress = { completedLevels: [], totalAttempts: 0, lastScore: null, logs: [] };
        }
        const gp = currentUser.gameProgress;
        gp.totalAttempts = (gp.totalAttempts || 0) + 1;
        gp.lastScore = correctCount + '/' + total + ' (' + lvl.title + ')';
        if (passed && gp.completedLevels.indexOf(lvl.id) === -1) {
          gp.completedLevels.push(lvl.id);
        }
        gp.logs = Array.isArray(gp.logs) ? gp.logs : [];
        gp.logs.unshift({
          title: lvl.title,
          score: correctCount + '/' + total,
          passed: passed,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        });
        if (gp.logs.length > 15) gp.logs.pop();

        safeSetStorage(DB_STORAGE_KEY, usersDb); pushUsersToCloud();
        safeSetStorage(SESSION_STORAGE_KEY, currentUser);
        renderLevelPills();
        renderHeaderAndLibrary();
        renderParentPortal();
      }

      // --- PARENT PORTAL ---
      function renderParentPortal() {
        syncCurrentUser();

        const profileAvatar = document.getElementById('profileAvatar');
        const profileUsername = document.getElementById('profileUsername');
        const profileRoleText = document.getElementById('profileRoleText');
        const profileStatusPill = document.getElementById('profileStatusPill');
        const detailUsername = document.getElementById('detailUsername');
        const detailRole = document.getElementById('detailRole');
        const detailBirthYear = document.getElementById('detailBirthYear');
        const detailCreatedAt = document.getElementById('detailCreatedAt');

        if (currentUser) {
          profileAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
          profileUsername.textContent = currentUser.username;
          profileRoleText.textContent = isAdmin(currentUser) ? 'Quản trị viên hệ thống' : 'Đã đồng bộ từ Database';
          profileStatusPill.textContent = isAdmin(currentUser) ? 'Admin' : 'Đang hoạt động';
          profileStatusPill.className = isAdmin(currentUser)
            ? 'px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900'
            : 'px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900';

          detailUsername.textContent = currentUser.username;
          detailRole.textContent = isAdmin(currentUser) ? 'Admin' : 'Học viên';
          detailBirthYear.textContent = String(currentUser.birthYear);
          detailCreatedAt.textContent = currentUser.createdAt || 'Hôm nay';
        } else {
          profileAvatar.textContent = '?';
          profileUsername.textContent = 'Chưa đăng nhập';
          profileRoleText.textContent = 'Đăng nhập để xem tiến độ của con';
          profileStatusPill.textContent = 'Khách';
          profileStatusPill.className = 'px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';

          detailUsername.textContent = '—';
          detailRole.textContent = '—';
          detailBirthYear.textContent = '—';
          detailCreatedAt.textContent = '—';
        }

        const gp = (currentUser && currentUser.gameProgress) ? currentUser.gameProgress : { completedLevels: [], totalAttempts: 0, lastScore: null, logs: [] };
        const totalLvls = wasteLevels.length || 1;
        const completedLvls = Array.isArray(gp.completedLevels) ? gp.completedLevels.length : 0;
        const pct = Math.min(100, Math.round((completedLvls / totalLvls) * 100));

        document.getElementById('kpiProgressVal').textContent = pct + '%';
        document.getElementById('kpiProgressBar').style.width = pct + '%';
        document.getElementById('kpiProgressSub').textContent = completedLvls > 0 ? ('Đã vượt qua ' + completedLvls + ' màn chơi') : 'Chưa hoàn thành màn chơi nào';
        document.getElementById('kpiLevelsVal').textContent = completedLvls + ' / ' + totalLvls;
        document.getElementById('kpiAttemptsVal').textContent = (gp.totalAttempts || 0) + ' lượt';
        document.getElementById('kpiLastScoreVal').textContent = gp.lastScore ? gp.lastScore : '—';
        document.getElementById('kpiLastPlayedSub').textContent = (gp.logs && gp.logs.length > 0) ? ('Cập nhật lúc ' + gp.logs[0].time) : 'Chưa có lượt chơi nào';

        // Weekly bars
        const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const todayIdx = (new Date().getDay() + 6) % 7;
        const weeklyBarsContainer = document.getElementById('weeklyBarsContainer');
        weeklyBarsContainer.innerHTML = days.map(function (label, idx) {
          const val = (idx === todayIdx && gp.totalAttempts > 0) ? gp.totalAttempts : 0;
          const h = val > 0 ? Math.min(100, Math.max(20, val * 18)) : 8;
          const color = val > 0 ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700';
          return (
            '<div class="flex-1 flex flex-col items-center h-full justify-end">' +
              '<span class="text-[11px] font-medium text-slate-400 mb-1">' + val + ' lượt</span>' +
              '<div class="w-full max-w-[38px] rounded-t-lg transition-all ' + color + '" style="height: ' + h + '%"></div>' +
              '<span class="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2">' + label + '</span>' +
            '</div>'
          );
        }).join('');

        // Activity Feed
        const feedEl = document.getElementById('parentActivityFeed');
        if (!gp.logs || gp.logs.length === 0) {
          feedEl.innerHTML = (
            '<div class="py-8 px-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">' +
              '<p class="text-xs font-semibold text-slate-600 dark:text-slate-300">Chưa có dữ liệu tiến độ</p>' +
              '<p class="text-[11px] text-slate-400 mt-1">Chơi game Phân loại Rác trong Thư viện để ghi nhận kết quả tại đây.</p>' +
            '</div>'
          );
        } else {
          feedEl.innerHTML = gp.logs.map(function (log) {
            return (
              '<div class="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-2 text-xs">' +
                '<div>' +
                  '<p class="font-semibold text-slate-800 dark:text-slate-200">' + escapeHtml(log.title) + '</p>' +
                  '<p class="text-[11px] text-slate-400">Lúc ' + escapeHtml(log.time) + '</p>' +
                '</div>' +
                '<span class="px-2 py-0.5 rounded-md font-bold ' + (log.passed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300') + '">' +
                  escapeHtml(log.score) +
                '</span>' +
              '</div>'
            );
          }).join('');
        }

        renderParentNotes();
      }

      function renderParentNotes() {
        const listEl = document.getElementById('savedParentNotesList');
        if (!listEl) return;
        const notes = (currentUser && Array.isArray(currentUser.parentNotes)) ? currentUser.parentNotes : [];
        if (notes.length === 0) {
          listEl.innerHTML = '<p class="text-[11px] text-slate-400 italic">Chưa có ghi chú nào.</p>';
          return;
        }
        listEl.innerHTML = notes.map(function (note, idx) {
          return (
            '<div class="flex items-center justify-between gap-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg px-2.5 py-1.5">' +
              '<span class="text-slate-700 dark:text-slate-200">📌 ' + escapeHtml(note) + '</span>' +
              '<button type="button" data-del-note="' + idx + '" class="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-bold">✕</button>' +
            '</div>'
          );
        }).join('');
      }

      // --- ADMIN DATABASE & LEVEL BUILDER ---
      function renderDbTable() {
        const tbody = document.getElementById('dbUsersTableBody');
        const toggleAllBtn = document.getElementById('toggleAllPassBtn');
        if (toggleAllBtn) {
          toggleAllBtn.textContent = showAllPasswords ? 'Ẩn tất cả Pass' : 'Hiện tất cả Pass';
        }
        if (!tbody) return;
        if (!isAdmin(currentUser)) {
          tbody.innerHTML = '';
          return;
        }

        tbody.innerHTML = usersDb.map(function (u, i) {
          const isCurrent = currentUser && currentUser.username.toLowerCase() === u.username.toLowerCase();
          const userIsAdmin = u.role === 'admin';
          const isPassShown = showAllPasswords || revealedUsernames.has(u.username);
          const displayPass = isPassShown ? escapeHtml(u.password) : '••••••••';

          const roleBadge = userIsAdmin
            ? '<span class="px-2 py-0.5 text-[11px] rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-900">Admin</span>'
            : '<span class="px-2 py-0.5 text-[11px] rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">Học viên</span>';

          const adminActionBtn = u.isPrimaryAdmin
            ? ''
            : '<button type="button" data-toggle-admin="' + escapeHtml(u.username) + '" class="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">' + (userIsAdmin ? 'Gỡ Admin' : 'Cấp Admin') + '</button>';

          const deleteActionBtn = u.isPrimaryAdmin
            ? '<span class="text-[11px] text-slate-400 italic">Mặc định</span>'
            : '<button type="button" data-del-user="' + escapeHtml(u.username) + '" class="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline">Xóa</button>';

          return (
            '<tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">' +
              '<td class="py-3 px-3 text-xs font-mono text-slate-500 dark:text-slate-400">#' + (i + 1) + '</td>' +
              '<td class="py-3 px-3 font-semibold text-slate-900 dark:text-white">' +
                escapeHtml(u.username) +
                (isCurrent ? ' <span class="ml-1 px-1.5 py-0.5 text-[10px] rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">Đang dùng</span>' : '') +
              '</td>' +
              '<td class="py-3 px-3">' + roleBadge + '</td>' +
              '<td class="py-3 px-3 text-xs font-mono text-slate-600 dark:text-slate-300">' +
                '<div class="inline-flex items-center gap-2">' +
                  '<span class="min-w-[84px]">' + displayPass + '</span>' +
                  '<button type="button" data-toggle-pass="' + escapeHtml(u.username) + '" class="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-sans font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition">' +
                    (isPassShown ? 'Ẩn' : 'Hiện') +
                  '</button>' +
                '</div>' +
              '</td>' +
              '<td class="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">' + escapeHtml(u.birthYear) + '</td>' +
              '<td class="py-3 px-3 text-xs text-slate-500 dark:text-slate-400">' + escapeHtml(u.createdAt || '—') + '</td>' +
              '<td class="py-3 px-3 text-right space-x-2 whitespace-nowrap">' +
                '<button type="button" data-use-user="' + escapeHtml(u.username) + '" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Chọn TK</button>' +
                adminActionBtn +
                deleteActionBtn +
              '</td>' +
            '</tr>'
          );
        }).join('');
      }

      function renderAdminLevelsList() {
        const countEl = document.getElementById('adminLevelsCount');
        const listEl = document.getElementById('adminLevelsList');
        if (!countEl || !listEl) return;
        countEl.textContent = String(wasteLevels.length);
        listEl.innerHTML = wasteLevels.map(function (lvl, idx) {
          return (
            '<div class="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-2 text-xs">' +
              '<div>' +
                '<p class="font-bold text-slate-900 dark:text-white">' + escapeHtml(lvl.title) + '</p>' +
                '<p class="text-slate-500 dark:text-slate-400">' + lvl.items.length + ' món rác • ' + (lvl.timeLimit || 90) + 's</p>' +
              '</div>' +
              '<div class="flex items-center gap-2">' +
                (lvl.isDefault ? '<span class="text-[11px] text-slate-400">Mặc định</span>' : '<button type="button" data-del-level="' + idx + '" class="text-rose-600 dark:text-rose-400 font-semibold hover:underline">Xóa</button>') +
              '</div>' +
            '</div>'
          );
        }).join('');
      }

      function renderDraftItems() {
        const el = document.getElementById('draftLevelItemsList');
        if (!el) return;
        if (draftLevelItems.length === 0) {
          el.innerHTML = '<span class="text-[11px] text-slate-400 italic">Chưa có món rác nào. Hãy bấm "+ Thêm" ở trên.</span>';
          return;
        }
        el.innerHTML = draftLevelItems.map(function (it, idx) {
          return (
            '<span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">' +
              '<span>' + escapeHtml(it.emoji) + ' ' + escapeHtml(it.name) + '</span>' +
              '<button type="button" data-del-draft-item="' + idx + '" class="text-rose-500 font-bold ml-1">✕</button>' +
            '</span>'
          );
        }).join('');
      }

      function renderAll() {
        renderHeaderAndLibrary();
        renderParentPortal();
        renderDbTable();
        renderAdminLevelsList();
        renderDraftItems();
      }

      function openAuthModal(defaultTab) {
        const backdrop = document.getElementById('authModalBackdrop');
        backdrop.classList.remove('hidden');
        backdrop.classList.add('flex');
        // Pre-fill remembered recent login
        const rem = safeGetStorage(REMEMBERED_LOGIN_KEY, null);
        if (rem && rem.username) {
          document.getElementById('loginUsername').value = rem.username;
          document.getElementById('loginPassword').value = rem.password || '';
          document.getElementById('rememberMeCheckbox').checked = Boolean(rem.password);
        }
        switchAuthTab(defaultTab || 'login');
      }

      function closeAuthModal() {
        const backdrop = document.getElementById('authModalBackdrop');
        backdrop.classList.add('hidden');
        backdrop.classList.remove('flex');
      }

      function switchAuthTab(tab) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const tabLoginBtn = document.getElementById('tabLoginBtn');
        const tabRegisterBtn = document.getElementById('tabRegisterBtn');

        document.getElementById('loginErrorMsg').classList.add('hidden');
        document.getElementById('registerErrorMsg').classList.add('hidden');

        if (tab === 'register') {
          loginForm.classList.add('hidden');
          registerForm.classList.remove('hidden');
          tabRegisterBtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs transition';
          tabLoginBtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition';
        } else {
          registerForm.classList.add('hidden');
          loginForm.classList.remove('hidden');
          tabLoginBtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs transition';
          tabRegisterBtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition';
        }
      }

      window.addEventListener('DOMContentLoaded', function () {
        initTheme();

        document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

        document.getElementById('brandHomeBtn').addEventListener('click', function () {
          document.getElementById('wasteGameSection').classList.add('hidden');
          document.getElementById('libraryCatalogSection').classList.remove('hidden');
          switchView('library');
        });
        document.getElementById('navLibraryBtn').addEventListener('click', function () { switchView('library'); });
        document.getElementById('navParentBtn').addEventListener('click', function () { switchView('parent'); });
        document.getElementById('navDbBtn').addEventListener('click', function () { switchView('db'); });

        document.getElementById('openWasteGameBtn').addEventListener('click', function () {
          document.getElementById('libraryCatalogSection').classList.add('hidden');
          document.getElementById('wasteGameSection').classList.remove('hidden');
          loadWasteLevel(0);
        });
        document.getElementById('backToLibraryBtn').addEventListener('click', function () {
          stopGameTimer();
          document.getElementById('wasteGameSection').classList.add('hidden');
          document.getElementById('libraryCatalogSection').classList.remove('hidden');
          renderHeaderAndLibrary();
        });

        document.getElementById('levelSelectorBar').addEventListener('click', function (e) {
          const btn = e.target.closest('[data-select-level]');
          if (!btn || isGameRunning) return;
          loadWasteLevel(parseInt(btn.getAttribute('data-select-level'), 10));
        });

        document.getElementById('runConveyorBtn').addEventListener('click', runConveyorSimulation);
        document.getElementById('stationsConfigGrid').addEventListener('change', function (e) {
          const opSel = e.target.closest('[data-st-op]');
          if (opSel) {
            const idx = parseInt(opSel.getAttribute('data-st-op'), 10);
            stationConfigs[idx].op = opSel.value;
            renderStationCards();
            return;
          }
          const v1Sel = e.target.closest('[data-st-val1]');
          if (v1Sel) {
            const idx = parseInt(v1Sel.getAttribute('data-st-val1'), 10);
            stationConfigs[idx].val1 = v1Sel.value;
            return;
          }
          const v2Sel = e.target.closest('[data-st-val2]');
          if (v2Sel) {
            const idx = parseInt(v2Sel.getAttribute('data-st-val2'), 10);
            stationConfigs[idx].val2 = v2Sel.value;
          }
        });

        document.getElementById('stationsConfigGrid').addEventListener('click', function (e) {
          const swapBtn = e.target.closest('[data-swap-station]');
          if (!swapBtn || isGameRunning) return;
          const idx = parseInt(swapBtn.getAttribute('data-swap-station'), 10);
          if (idx >= 0 && idx < stationConfigs.length - 1) {
            const tmp = stationConfigs[idx];
            stationConfigs[idx] = stationConfigs[idx + 1];
            stationConfigs[idx + 1] = tmp;
            renderStationCards();
            showToast('Đã đổi vị trí Trạm ' + (idx + 1) + ' và Trạm ' + (idx + 2) + '!', 'info');
          }
        });

        document.getElementById('soundToggleBtn').addEventListener('click', function () {
          soundEnabled = !soundEnabled;
          this.textContent = soundEnabled ? '🔊 Âm thanh: Bật' : '🔇 Âm thanh: Tắt';
        });
        window.addEventListener('resize', resizeFactoryCanvas);
        document.getElementById('resetLevelBtn').addEventListener('click', function () { loadWasteLevel(activeLevelIdx); });
        document.getElementById('nextLevelBtn').addEventListener('click', function () {
          if (activeLevelIdx < wasteLevels.length - 1) {
            loadWasteLevel(activeLevelIdx + 1);
          }
        });

        document.getElementById('openAuthModalBtn').addEventListener('click', function () { openAuthModal('login'); });
        document.getElementById('parentSwitchAccountBtn').addEventListener('click', function () { openAuthModal('register'); });
        document.getElementById('closeAuthModalBtn').addEventListener('click', closeAuthModal);

        document.getElementById('tabLoginBtn').addEventListener('click', function () { switchAuthTab('login'); });
        document.getElementById('tabRegisterBtn').addEventListener('click', function () { switchAuthTab('register'); });

        document.getElementById('logoutBtn').addEventListener('click', function () {
          currentUser = null;
          safeSetStorage(SESSION_STORAGE_KEY, null);
          const rem = safeGetStorage(REMEMBERED_LOGIN_KEY, null);
          if (rem) {
            rem.autoLogin = false;
            safeSetStorage(REMEMBERED_LOGIN_KEY, rem);
          }
          showToast('Đã đăng xuất tài khoản.', 'info');
          if (currentView === 'db') {
            switchView('library');
          } else {
            renderAll();
          }
        });

        document.getElementById('registerForm').addEventListener('submit', function (e) {
          e.preventDefault();
          const username = document.getElementById('regUsername').value.trim();
          const password = document.getElementById('regPassword').value;
          const birthYear = parseInt(document.getElementById('regBirthYear').value, 10);
          const errEl = document.getElementById('registerErrorMsg');

          if (!username || username.length < 3) {
            errEl.textContent = 'Tên tài khoản cần ít nhất 3 ký tự.';
            errEl.classList.remove('hidden');
            return;
          }
          if (!password || password.length < 4) {
            errEl.textContent = 'Mật khẩu cần ít nhất 4 ký tự.';
            errEl.classList.remove('hidden');
            return;
          }
          if (isNaN(birthYear) || birthYear < 1940 || birthYear > 2025) {
            errEl.textContent = 'Vui lòng nhập năm sinh hợp lệ.';
            errEl.classList.remove('hidden');
            return;
          }

          const exists = usersDb.some(function (u) {
            return u.username.toLowerCase() === username.toLowerCase();
          });
          if (exists) {
            errEl.textContent = 'Tên tài khoản "' + username + '" đã tồn tại trong Database.';
            errEl.classList.remove('hidden');
            return;
          }

          const newUser = {
            id: 'usr_' + Date.now(),
            username: username,
            password: password,
            birthYear: birthYear,
            role: 'student',
            createdAt: new Date().toLocaleDateString('vi-VN'),
            parentNotes: [],
            gameProgress: { completedLevels: [], totalAttempts: 0, lastScore: null, logs: [] }
          };

          usersDb.push(newUser);
          safeSetStorage(DB_STORAGE_KEY, usersDb); pushUsersToCloud();
          currentUser = newUser;
          safeSetStorage(SESSION_STORAGE_KEY, currentUser);
          safeSetStorage(REMEMBERED_LOGIN_KEY, { username: username, password: password, autoLogin: true });

          document.getElementById('registerForm').reset();
          closeAuthModal();
          showToast('Đăng ký thành công và đã lưu vào Database!');
          renderAll();
        });

        document.getElementById('loginForm').addEventListener('submit', function (e) {
          e.preventDefault();
          const username = document.getElementById('loginUsername').value.trim();
          const password = document.getElementById('loginPassword').value;
          const remember = document.getElementById('rememberMeCheckbox').checked;
          const errEl = document.getElementById('loginErrorMsg');

          const matched = usersDb.find(function (u) {
            return u.username.toLowerCase() === username.toLowerCase() && u.password === password;
          });

          if (!matched) {
            errEl.textContent = 'Sai tên tài khoản hoặc mật khẩu.';
            errEl.classList.remove('hidden');
            return;
          }

          currentUser = matched;
          safeSetStorage(SESSION_STORAGE_KEY, currentUser);
          safeSetStorage(REMEMBERED_LOGIN_KEY, {
            username: matched.username,
            password: remember ? matched.password : '',
            autoLogin: remember
          });

          closeAuthModal();
          showToast(isAdmin(matched) ? 'Đăng nhập Admin thành công!' : 'Đăng nhập thành công!');
          renderAll();
        });

        document.getElementById('saveParentNoteBtn').addEventListener('click', function () {
          const input = document.getElementById('parentNoteInput');
          const text = input.value.trim();
          if (!text) return;
          if (!currentUser) {
            showToast('Vui lòng đăng nhập trước khi lưu ghi chú.', 'error');
            openAuthModal('login');
            return;
          }
          if (!Array.isArray(currentUser.parentNotes)) {
            currentUser.parentNotes = [];
          }
          currentUser.parentNotes.push(text);
          safeSetStorage(DB_STORAGE_KEY, usersDb); pushUsersToCloud();
          safeSetStorage(SESSION_STORAGE_KEY, currentUser);
          input.value = '';
          renderParentNotes();
          showToast('Đã lưu ghi chú.');
        });

        document.getElementById('savedParentNotesList').addEventListener('click', function (e) {
          const btn = e.target.closest('[data-del-note]');
          if (!btn || !currentUser) return;
          const idx = parseInt(btn.getAttribute('data-del-note'), 10);
          if (!isNaN(idx) && Array.isArray(currentUser.parentNotes)) {
            currentUser.parentNotes.splice(idx, 1);
            safeSetStorage(DB_STORAGE_KEY, usersDb); pushUsersToCloud();
            safeSetStorage(SESSION_STORAGE_KEY, currentUser);
            renderParentNotes();
          }
        });

        document.getElementById('toggleAllPassBtn').addEventListener('click', function () {
          showAllPasswords = !showAllPasswords;
          if (!showAllPasswords) revealedUsernames.clear();
          renderDbTable();
        });

        document.getElementById('exportDbJsonBtn').addEventListener('click', function () {
          if (!isAdmin(currentUser)) return;
          const payload = { exportedAt: new Date().toISOString(), totalUsers: usersDb.length, users: usersDb };
          const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'database.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast('Đã tải về file database.json.');
        });

        document.getElementById('importDbInput').addEventListener('change', function (e) {
          const file = e.target.files[0];
          if (!file || !isAdmin(currentUser)) return;
          const reader = new FileReader();
          reader.onload = function (ev) {
            try {
              const parsed = JSON.parse(ev.target.result);
              const importedUsers = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.users) ? parsed.users : null);
              if (!importedUsers) throw new Error('Invalid');
              usersDb = ensureAdminAccount(importedUsers);
              safeSetStorage(DB_STORAGE_KEY, usersDb); pushUsersToCloud();
              renderAll();
              showToast('Đã khôi phục ' + usersDb.length + ' tài khoản từ file JSON!');
            } catch (err) {
              showToast('File database.json không hợp lệ.', 'error');
            }
          };
          reader.readAsText(file);
          e.target.value = '';
        });

        document.getElementById('clearDbBtn').addEventListener('click', function () {
          if (!isAdmin(currentUser)) return;
          usersDb = ensureAdminAccount(usersDb.filter(function (u) { return u.isPrimaryAdmin; }));
          safeSetStorage(DB_STORAGE_KEY, usersDb); pushUsersToCloud();
          if (currentUser && !currentUser.isPrimaryAdmin) {
            currentUser = null;
            safeSetStorage(SESSION_STORAGE_KEY, null);
          }
          renderAll();
          showToast('Đã xóa các tài khoản thường (giữ lại Admin).', 'info');
        });

        document.getElementById('dbUsersTableBody').addEventListener('click', function (e) {
          if (!isAdmin(currentUser)) return;

          const togglePassBtn = e.target.closest('[data-toggle-pass]');
          if (togglePassBtn) {
            const uname = togglePassBtn.getAttribute('data-toggle-pass');
            if (revealedUsernames.has(uname)) revealedUsernames.delete(uname);
            else revealedUsernames.add(uname);
            renderDbTable();
            return;
          }

          const toggleAdminBtn = e.target.closest('[data-toggle-admin]');
          if (toggleAdminBtn) {
            const uname = toggleAdminBtn.getAttribute('data-toggle-admin');
            const target = usersDb.find(function (u) { return u.username === uname; });
            if (target && !target.isPrimaryAdmin) {
              target.role = target.role === 'admin' ? 'student' : 'admin';
              safeSetStorage(DB_STORAGE_KEY, usersDb); pushUsersToCloud();
              renderDbTable();
              showToast('Đã cập nhật quyền cho "' + target.username + '".', 'info');
            }
            return;
          }

          const useBtn = e.target.closest('[data-use-user]');
          if (useBtn) {
            const uname = useBtn.getAttribute('data-use-user');
            const found = usersDb.find(function (u) { return u.username === uname; });
            if (found) {
              currentUser = found;
              safeSetStorage(SESSION_STORAGE_KEY, currentUser);
              showToast('Đã chuyển sang tài khoản "' + found.username + '".');
              if (!isAdmin(found) && currentView === 'db') switchView('library');
              else renderAll();
            }
            return;
          }

          const delBtn = e.target.closest('[data-del-user]');
          if (delBtn) {
            const uname = delBtn.getAttribute('data-del-user');
            const target = usersDb.find(function (u) { return u.username === uname; });
            if (target && target.isPrimaryAdmin) {
              showToast('Không thể xóa tài khoản Admin mặc định.', 'error');
              return;
            }
            usersDb = usersDb.filter(function (u) { return u.username !== uname; });
            if (currentUser && currentUser.username === uname) {
              currentUser = null;
              safeSetStorage(SESSION_STORAGE_KEY, null);
            }
            safeSetStorage(DB_STORAGE_KEY, usersDb); pushUsersToCloud();
            renderAll();
            showToast('Đã xóa tài khoản "' + uname + '".', 'info');
          }
        });

        // Admin Level Builder Handlers
        document.getElementById('addDraftItemBtn').addEventListener('click', function () {
          const emoji = document.getElementById('draftItemEmoji').value.trim() || '📦';
          const name = document.getElementById('draftItemName').value.trim();
          const category = document.getElementById('draftItemCat').value;
          if (!name) {
            showToast('Vui lòng nhập tên món rác.', 'error');
            return;
          }
          draftLevelItems.push({ emoji: emoji, name: name, category: category });
          document.getElementById('draftItemName').value = '';
          renderDraftItems();
        });

        document.getElementById('draftLevelItemsList').addEventListener('click', function (e) {
          const btn = e.target.closest('[data-del-draft-item]');
          if (!btn) return;
          const idx = parseInt(btn.getAttribute('data-del-draft-item'), 10);
          if (!isNaN(idx)) {
            draftLevelItems.splice(idx, 1);
            renderDraftItems();
          }
        });

        document.getElementById('createLevelForm').addEventListener('submit', function (e) {
          e.preventDefault();
          if (!isAdmin(currentUser)) return;
          const title = document.getElementById('newLvlTitle').value.trim();
          const timeLimit = parseInt(document.getElementById('newLvlTime').value, 10) || 90;
          if (!title || draftLevelItems.length === 0) {
            showToast('Hãy nhập tên màn chơi và thêm ít nhất 1 món rác.', 'error');
            return;
          }
          wasteLevels.push({
            id: 'lvl_custom_' + Date.now(),
            title: title,
            timeLimit: timeLimit,
            speedMs: 500,
            isDefault: false,
            items: draftLevelItems.slice()
          });
          safeSetStorage(LEVELS_STORAGE_KEY, wasteLevels); pushLevelsToCloud();
          draftLevelItems = [];
          document.getElementById('createLevelForm').reset();
          renderAll();
          showToast('Đã thêm màn chơi "' + title + '" vào Thư viện!');
        });

        document.getElementById('adminLevelsList').addEventListener('click', function (e) {
          const btn = e.target.closest('[data-del-level]');
          if (!btn || !isAdmin(currentUser)) return;
          const idx = parseInt(btn.getAttribute('data-del-level'), 10);
          if (!isNaN(idx) && wasteLevels[idx] && !wasteLevels[idx].isDefault) {
            wasteLevels.splice(idx, 1);
            safeSetStorage(LEVELS_STORAGE_KEY, wasteLevels); pushLevelsToCloud();
            renderAll();
            showToast('Đã xóa màn chơi.', 'info');
          }
        });

        document.getElementById('exportLevelsJsonBtn').addEventListener('click', function () {
          const blob = new Blob([JSON.stringify({ levels: wasteLevels }, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'levels.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast('Đã xuất file levels.json.');
        });

        document.getElementById('importLevelsInput').addEventListener('change', function (e) {
          const file = e.target.files[0];
          if (!file || !isAdmin(currentUser)) return;
          const reader = new FileReader();
          reader.onload = function (ev) {
            try {
              const parsed = JSON.parse(ev.target.result);
              const imported = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.levels) ? parsed.levels : null);
              if (!imported || imported.length === 0) throw new Error('Invalid');
              wasteLevels = imported;
              safeSetStorage(LEVELS_STORAGE_KEY, wasteLevels); pushLevelsToCloud();
              renderAll();
              showToast('Đã tải lên ' + wasteLevels.length + ' màn chơi từ levels.json!');
            } catch (err) {
              showToast('File levels.json không hợp lệ.', 'error');
            }
          };
          reader.readAsText(file);
          e.target.value = '';
        });

        document.getElementById('showHintBtn').addEventListener('click', function () {
          const lvl = wasteLevels[activeLevelIdx];
          if (!lvl) return;
          const sol = getSolutionForLevel(lvl);
          document.getElementById('gameHintText').textContent = sol.text;
          document.getElementById('gameHintBox').classList.remove('hidden');
        });

        document.getElementById('applySolutionBtn').addEventListener('click', function () {
          if (isGameRunning) return;
          const lvl = wasteLevels[activeLevelIdx];
          if (!lvl) return;
          const sol = getSolutionForLevel(lvl);
          if (lvl.hasWasher) {
            document.getElementById('washerRuleToggle').checked = Boolean(sol.washer);
          }
          if (sol.stations.length > 0) {
            stationConfigs = sol.stations.map(function (s) {
              return { targetBin: s.bin, op: s.op || 'IS', val1: s.val1 || '', val2: s.val2 || '' };
            });
            renderStationCards();
          }
          showToast('Đã điền đáp án mẫu! Hãy bấm Chạy băng chuyền để xem kết quả.', 'info');
        });

        const ROBOT_MAZE_SRCDOC = "<!DOCTYPE html>\n<html lang=\"vi\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>Robot Maze \u2014 L\u1eadp Tr\u00ecnh Xe Nh\u1ecf & Scratch<\/title>\n  <style>\n* {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n  user-select: none;\n  font-family: 'Segoe UI', 'Nunito', system-ui, -apple-system, sans-serif;\n}\n\nbody {\n  min-height: 100vh;\n  background: radial-gradient(circle at top left, #e0f2fe 0%, #f0fdf4 48%, #fef9c3 100%);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 14px;\n  color: #1e293b;\n}\n\n.app-container {\n  width: 100%;\n  max-width: 980px;\n  background: rgba(255, 255, 255, 0.96);\n  border-radius: 28px;\n  padding: 18px 22px;\n  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.1), 0 0 0 4px #bae6fd;\n}\n\n/* HEADER */\n.top-bar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 10px;\n  padding-bottom: 12px;\n  margin-bottom: 16px;\n  border-bottom: 2px solid #f1f5f9;\n}\n\n.brand {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.brand-icon {\n  font-size: 26px;\n}\n\n.brand h1 {\n  font-size: 21px;\n  font-weight: 900;\n  color: #0284c7;\n}\n\n.hud {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  flex-wrap: wrap;\n}\n\n.pill {\n  padding: 6px 13px;\n  border-radius: 999px;\n  font-size: 13px;\n  font-weight: 800;\n  border: none;\n}\n\n.pill-level {\n  background: #dbeafe;\n  color: #1d4ed8;\n}\n\n.pill-star {\n  background: #fef3c7;\n  color: #b45309;\n}\n\n.pill-mode {\n  background: #fef9c3;\n  color: #a16207;\n  border: 2px solid #facc15;\n  cursor: pointer;\n  transition: transform 0.15s;\n}\n\n.pill-mode.scratch-active {\n  background: #ffab19;\n  color: #ffffff;\n  border-color: #d97706;\n}\n\n.pill-car {\n  background: #ecfdf5;\n  color: #047857;\n  border: 2px solid #6ee7b7;\n  cursor: pointer;\n  transition: transform 0.15s;\n}\n\n.pill-car:hover, .pill-mode:hover {\n  transform: translateY(-2px);\n}\n\n.icon-btn {\n  width: 36px;\n  height: 36px;\n  border-radius: 12px;\n  border: 2px solid #e2e8f0;\n  background: #f8fafc;\n  font-size: 16px;\n  cursor: pointer;\n  display: grid;\n  place-items: center;\n  transition: all 0.15s;\n}\n\n.icon-btn:hover {\n  background: #e2e8f0;\n  transform: translateY(-2px);\n}\n\n/* B\u1ed0 C\u1ee4C CH\u00cdNH */\n.play-grid {\n  display: grid;\n  grid-template-columns: 1.05fr 0.95fr;\n  gap: 18px;\n  align-items: stretch;\n}\n\n@media (max-width: 800px) {\n  .play-grid {\n    grid-template-columns: 1fr;\n  }\n}\n\n.board-card {\n  background: linear-gradient(180deg, #dcfce7 0%, #bbf7d0 100%);\n  border: 4px solid #86efac;\n  border-radius: 24px;\n  padding: 14px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: space-between;\n  box-shadow: inset 0 2px 8px rgba(22, 101, 52, 0.08);\n}\n\ncanvas#gameCanvas {\n  width: 100%;\n  max-width: 440px;\n  height: auto;\n  border-radius: 16px;\n  display: block;\n}\n\n.status-bar {\n  margin-top: 10px;\n  width: 100%;\n  background: rgba(255, 255, 255, 0.88);\n  border-radius: 12px;\n  padding: 8px 12px;\n  font-size: 14px;\n  font-weight: 700;\n  color: #166534;\n  text-align: center;\n}\n\n/* B\u1ea2NG \u0110I\u1ec0U KHI\u1ec2N C\u01a0 B\u1ea2N */\n.control-card {\n  background: #f8fafc;\n  border: 3px solid #e2e8f0;\n  border-radius: 24px;\n  padding: 16px;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n  gap: 12px;\n}\n\n.block-group {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.group-label {\n  font-size: 13.5px;\n  font-weight: 800;\n  color: #334155;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.sub-note {\n  font-size: 12px;\n  font-weight: 600;\n  color: #64748b;\n}\n\n.loop-badge {\n  font-size: 11px;\n  font-weight: 800;\n  background: #ede9fe;\n  color: #6d28d9;\n  padding: 3px 9px;\n  border-radius: 999px;\n}\n\n.dpad {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n  max-width: 222px;\n  margin: 0 auto;\n  width: 100%;\n}\n\n.dir-btn {\n  height: 54px;\n  border-radius: 16px;\n  border: 3px solid #38bdf8;\n  border-bottom-width: 6px;\n  background: #ffffff;\n  font-size: 25px;\n  cursor: pointer;\n  transition: transform 0.08s, background 0.12s;\n}\n\n.dir-btn:hover:not(:disabled) {\n  background: #e0f2fe;\n}\n\n.dir-btn:active:not(:disabled) {\n  transform: translateY(3px);\n  border-bottom-width: 3px;\n}\n\n.dir-btn:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n\n.repeat-row {\n  display: grid;\n  grid-template-columns: 1fr 1fr auto;\n  gap: 8px;\n}\n\n.repeat-row select {\n  height: 40px;\n  border-radius: 12px;\n  border: 2px solid #cbd5e1;\n  background: #ffffff;\n  padding: 0 10px;\n  font-size: 14px;\n  font-weight: 700;\n  color: #1e293b;\n}\n\n.btn-repeat {\n  height: 40px;\n  padding: 0 14px;\n  border: none;\n  border-bottom: 4px solid #6d28d9;\n  border-radius: 12px;\n  background: #8b5cf6;\n  color: #ffffff;\n  font-size: 14px;\n  font-weight: 800;\n  cursor: pointer;\n}\n\n.btn-repeat:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n\n.queue-area {\n  background: #ffffff;\n  border: 2px dashed #cbd5e1;\n  border-radius: 16px;\n  padding: 10px;\n  min-height: 112px;\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  align-content: flex-start;\n}\n\n.cmd-chip {\n  height: 42px;\n  min-width: 42px;\n  border-radius: 12px;\n  border: 2px solid #38bdf8;\n  background: #e0f2fe;\n  color: #0369a1;\n  font-size: 20px;\n  font-weight: 800;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  transition: transform 0.12s;\n}\n\n.cmd-chip.repeat-chip {\n  padding: 0 10px;\n  background: #ede9fe;\n  border-color: #8b5cf6;\n  color: #5b21b6;\n  font-size: 13px;\n}\n\n.cmd-chip:hover {\n  background: #fee2e2;\n  border-color: #f87171;\n}\n\n.cmd-chip.active-step {\n  background: #fde047;\n  border-color: #eab308;\n  transform: scale(1.12);\n  box-shadow: 0 4px 12px rgba(234, 179, 8, 0.4);\n}\n\n.cmd-chip.error-step {\n  background: #fecaca;\n  border-color: #ef4444;\n}\n\n.run-row {\n  display: grid;\n  grid-template-columns: 1.5fr 1fr;\n  gap: 10px;\n}\n\n.btn-run {\n  height: 50px;\n  border: none;\n  border-bottom: 5px solid #15803d;\n  border-radius: 16px;\n  background: #22c55e;\n  color: #ffffff;\n  font-size: 16px;\n  font-weight: 900;\n  cursor: pointer;\n}\n\n.btn-run:hover:not(:disabled) {\n  background: #16a34a;\n}\n\n.btn-run:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n\n.btn-clear {\n  height: 50px;\n  border: none;\n  border-bottom: 5px solid #c2410c;\n  border-radius: 16px;\n  background: #f97316;\n  color: #ffffff;\n  font-size: 15px;\n  font-weight: 800;\n  cursor: pointer;\n}\n\n.btn-clear:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n\n/* ============================================================================\n   GIAO DI\u1ec6N L\u1eacP TR\u00ccNH KH\u1ed0I SCRATCH (M\u00c0N 11+)\n   ============================================================================ */\n.scratch-panel {\n  background: #f1f5f9;\n  border-color: #cbd5e1;\n}\n\n.scratch-palette {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  background: #ffffff;\n  padding: 8px;\n  border-radius: 14px;\n  border: 2px solid #e2e8f0;\n}\n\n.sc-pal-item {\n  padding: 7px 11px;\n  border-radius: 8px;\n  color: #ffffff;\n  font-size: 13px;\n  font-weight: 800;\n  cursor: grab;\n  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.2);\n  transition: transform 0.1s;\n}\n\n.sc-pal-item:hover {\n  transform: translateY(-2px);\n}\n\n.sc-pal-item:active {\n  cursor: grabbing;\n  transform: translateY(1px);\n}\n\n.sc-motion {\n  background: #4c97ff;\n  border: 1.5px solid #3373cc;\n}\n\n.sc-control {\n  background: #ffab19;\n  border: 1.5px solid #cf8b17;\n}\n\n.sc-sound {\n  background: #9966ff;\n  border: 1.5px solid #774dcb;\n}\n\n.scratch-workspace-wrap {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  flex: 1;\n}\n\n.scratch-workspace {\n  background-color: #ffffff;\n  background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px);\n  background-size: 16px 16px;\n  border: 2px solid #cbd5e1;\n  border-radius: 16px;\n  padding: 12px;\n  min-height: 230px;\n  max-height: 280px;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n}\n\n/* Kh\u1ed1i M\u0169 S\u1ef1 Ki\u1ec7n Scratch (Hat Block) */\n.sc-hat-block {\n  background: #ffbf00;\n  border: 2px solid #cc9900;\n  color: #ffffff;\n  font-size: 14px;\n  font-weight: 800;\n  padding: 9px 16px;\n  border-radius: 18px 18px 6px 6px;\n  box-shadow: 0 3px 0 #cc9900;\n  cursor: pointer;\n  position: relative;\n  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);\n}\n\n.sc-hat-block.selected-target {\n  box-shadow: 0 0 0 3px #38bdf8, 0 3px 0 #cc9900;\n}\n\n.sc-script-body {\n  width: 100%;\n  min-height: 150px;\n  padding: 4px 0 12px 4px;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  border-radius: 10px;\n  transition: background 0.15s;\n}\n\n.sc-script-body.drag-over {\n  background: rgba(56, 189, 248, 0.12);\n  outline: 2px dashed #0284c7;\n}\n\n/* Kh\u1ed1i L\u1ec7nh Gh\u00e9p Trong Workspace */\n.sc-block {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  padding: 7px 10px;\n  border-radius: 7px;\n  color: #ffffff;\n  font-size: 13.5px;\n  font-weight: 800;\n  width: fit-content;\n  min-width: 195px;\n  box-shadow: 0 2.5px 0 rgba(0, 0, 0, 0.22);\n  position: relative;\n  transition: transform 0.12s, box-shadow 0.12s;\n}\n\n.sc-block.active-sc {\n  outline: 4px solid #fde047;\n  transform: scale(1.04);\n  z-index: 5;\n}\n\n.sc-block.error-sc {\n  outline: 4px solid #ef4444;\n  background: #dc2626 !important;\n}\n\n.sc-block-actions {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n}\n\n.sc-mini-btn {\n  background: rgba(0, 0, 0, 0.2);\n  border: none;\n  color: #ffffff;\n  width: 22px;\n  height: 22px;\n  border-radius: 5px;\n  font-size: 11px;\n  font-weight: 900;\n  cursor: pointer;\n  display: grid;\n  place-items: center;\n}\n\n.sc-mini-btn:hover {\n  background: rgba(0, 0, 0, 0.4);\n}\n\n/* Kh\u1ed1i Ch\u1eef C V\u00f2ng L\u1eb7p Scratch (C-Block) */\n.sc-c-wrapper {\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  max-width: 310px;\n  border-radius: 8px;\n}\n\n.sc-c-wrapper.selected-loop {\n  outline: 3px solid #38bdf8;\n  outline-offset: 2px;\n}\n\n.sc-c-header {\n  background: #ffab19;\n  border: 1.5px solid #cf8b17;\n  color: #ffffff;\n  font-size: 13.5px;\n  font-weight: 800;\n  padding: 6px 10px;\n  border-radius: 8px 8px 6px 0;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 6px;\n  cursor: pointer;\n}\n\n.sc-c-header select {\n  background: #ffffff;\n  color: #1e293b;\n  border: none;\n  border-radius: 999px;\n  padding: 2px 8px;\n  font-weight: 900;\n  font-size: 13px;\n}\n\n.sc-c-mouth {\n  margin-left: 14px;\n  padding: 6px 6px 6px 10px;\n  border-left: 12px solid #ffab19;\n  background: rgba(255, 171, 25, 0.08);\n  min-height: 44px;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n\n.sc-c-mouth.drag-over {\n  background: rgba(255, 171, 25, 0.24);\n}\n\n.sc-c-empty-hint {\n  font-size: 11.5px;\n  font-weight: 700;\n  color: #b45309;\n  padding: 6px 4px;\n}\n\n.sc-c-footer {\n  height: 14px;\n  background: #ffab19;\n  border: 1.5px solid #cf8b17;\n  border-top: none;\n  border-radius: 0 6px 8px 8px;\n  box-shadow: 0 2.5px 0 #cf8b17;\n}\n\n/* OVERLAY & DIALOGS */\n.overlay {\n  position: fixed;\n  inset: 0;\n  background: rgba(15, 23, 42, 0.65);\n  backdrop-filter: blur(4px);\n  display: none;\n  align-items: center;\n  justify-content: center;\n  z-index: 100;\n  padding: 16px;\n}\n\n.overlay.show {\n  display: flex;\n}\n\n.dialog {\n  background: #ffffff;\n  border-radius: 28px;\n  padding: 26px;\n  max-width: 420px;\n  width: 100%;\n  text-align: center;\n  border: 5px solid #fde047;\n  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);\n  animation: popScale 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);\n}\n\n@keyframes popScale {\n  from { transform: scale(0.75); opacity: 0; }\n  to { transform: scale(1); opacity: 1; }\n}\n\n.dialog-emoji {\n  font-size: 50px;\n  margin-bottom: 8px;\n}\n\n.dialog h2 {\n  font-size: 25px;\n  color: #16a34a;\n  margin-bottom: 8px;\n}\n\n.dialog p {\n  font-size: 15.5px;\n  color: #475569;\n  margin-bottom: 18px;\n}\n\n.btn-primary {\n  width: 100%;\n  padding: 14px 20px;\n  border: none;\n  border-bottom: 5px solid #0369a1;\n  border-radius: 16px;\n  background: #0284c7;\n  color: #ffffff;\n  font-size: 17px;\n  font-weight: 800;\n  cursor: pointer;\n}\n\n/* M\u00c0N H\u00ccNH L\u1edaN T\u1eb6NG XE & M\u1ede KH\u00d3A SCRATCH */\n.gift-fullscreen {\n  background: radial-gradient(circle at center, rgba(14, 116, 144, 0.94) 0%, rgba(15, 23, 42, 0.97) 100%);\n  padding: 0;\n  z-index: 200;\n}\n\n.gift-stage {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  overflow: hidden;\n  padding: 24px;\n}\n\n.sunburst {\n  position: absolute;\n  width: 140vmax;\n  height: 140vmax;\n  background: repeating-conic-gradient(\n    from 0deg,\n    rgba(253, 224, 71, 0.14) 0deg 15deg,\n    transparent 15deg 30deg\n  );\n  animation: spinRays 24s linear infinite;\n  pointer-events: none;\n}\n\n@keyframes spinRays {\n  to { transform: rotate(360deg); }\n}\n\n.gift-content {\n  position: relative;\n  z-index: 2;\n  max-width: 560px;\n  width: 100%;\n  background: rgba(255, 255, 255, 0.98);\n  border-radius: 36px;\n  padding: 34px 30px;\n  text-align: center;\n  border: 6px solid #facc15;\n  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);\n  animation: popScale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);\n}\n\n.gift-tag {\n  display: inline-block;\n  background: #fef3c7;\n  color: #b45309;\n  font-size: 13px;\n  font-weight: 900;\n  padding: 6px 16px;\n  border-radius: 999px;\n  margin-bottom: 12px;\n}\n\n.gift-content h2 {\n  font-size: 27px;\n  font-weight: 900;\n  color: #0f172a;\n  margin-bottom: 16px;\n}\n\n.gift-showcase {\n  width: 210px;\n  height: 210px;\n  margin: 0 auto 16px;\n  border-radius: 32px;\n  background: radial-gradient(circle, #dcfce7 0%, #86efac 100%);\n  border: 5px solid #22c55e;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  box-shadow: 0 14px 30px rgba(34, 197, 94, 0.25);\n}\n\n.gift-content h3 {\n  font-size: 23px;\n  font-weight: 900;\n  color: #0284c7;\n  margin-bottom: 6px;\n}\n\n.gift-content p {\n  font-size: 15.5px;\n  font-weight: 700;\n  color: #15803d;\n  margin-bottom: 24px;\n}\n\n.btn-gift-continue {\n  width: 100%;\n  padding: 17px 24px;\n  border: none;\n  border-bottom: 6px solid #15803d;\n  border-radius: 20px;\n  background: #22c55e;\n  color: #ffffff;\n  font-size: 19px;\n  font-weight: 900;\n  cursor: pointer;\n}\n\n.btn-gift-continue:hover {\n  background: #16a34a;\n}\n\n/* Preview kh\u1ed1i Scratch trong m\u00e0n h\u00ecnh m\u1edf kh\u00f3a */\n.scratch-preview-badge {\n  background: #f8fafc;\n  border: 3px solid #cbd5e1;\n  border-radius: 20px;\n  padding: 16px;\n  margin: 0 auto 18px;\n  max-width: 340px;\n  text-align: left;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.sp-hat {\n  background: #ffbf00;\n  color: #ffffff;\n  font-weight: 800;\n  font-size: 14px;\n  padding: 8px 14px;\n  border-radius: 14px 14px 4px 4px;\n}\n\n.sp-loop {\n  background: #ffab19;\n  color: #ffffff;\n  font-weight: 800;\n  font-size: 14px;\n  padding: 8px 12px;\n  border-radius: 6px;\n}\n\n.sp-inner {\n  margin-top: 6px;\n  background: #4c97ff;\n  padding: 7px 10px;\n  border-radius: 6px;\n  font-size: 13px;\n}\n\n/* GARA & HELP */\n.garage-dialog {\n  max-width: 520px;\n  border-color: #38bdf8;\n}\n\n.garage-dialog h2 {\n  color: #0284c7;\n  margin-bottom: 16px;\n}\n\n.garage-list {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 12px;\n  margin-bottom: 18px;\n}\n\n.garage-item {\n  border: 3px solid #e2e8f0;\n  border-radius: 18px;\n  padding: 12px;\n  background: #f8fafc;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 6px;\n}\n\n.garage-item.unlocked {\n  background: #ffffff;\n  border-color: #bae6fd;\n  cursor: pointer;\n}\n\n.garage-item.equipped {\n  border-color: #22c55e;\n  background: #f0fdf4;\n}\n\n.garage-item.locked {\n  opacity: 0.55;\n}\n\n.garage-item h4 {\n  font-size: 15px;\n  color: #0f172a;\n}\n\n.garage-item span {\n  font-size: 12px;\n  font-weight: 700;\n  color: #64748b;\n}\n\n.help-dialog {\n  max-width: 480px;\n  border-color: #38bdf8;\n  text-align: left;\n}\n\n.help-dialog h2 {\n  text-align: center;\n  color: #0284c7;\n  margin-bottom: 14px;\n}\n\n.help-steps {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  margin-bottom: 18px;\n}\n\n.help-item {\n  background: #f0f9ff;\n  border-left: 4px solid #0284c7;\n  padding: 10px 12px;\n  border-radius: 10px;\n  font-size: 14px;\n  line-height: 1.45;\n  color: #1e293b;\n}\n\n<\/style>\n<\/head>\n<body>\n  <div class=\"app-container\">\n    <!-- HEADER TINH G\u1eccN -->\n    <header class=\"top-bar\">\n      <div class=\"brand\">\n        <span class=\"brand-icon\">\ud83d\ude97<\/span>\n        <h1>Robot Maze<\/h1>\n      <\/div>\n\n      <div class=\"hud\">\n        <div class=\"pill pill-level\" id=\"levelBadge\">M\u00e0n <span id=\"levelNum\">1<\/span>/10<\/div>\n        <div class=\"pill pill-star\">\u2b50 <span id=\"starCount\">0<\/span>/<span id=\"starTotal\">1<\/span><\/div>\n        <button class=\"pill pill-mode\" id=\"btnModeSwitch\" title=\"Chuy\u1ec3n \u0111\u1ed5i C\u01a1 b\u1ea3n / Scratch\">\n          \ud83e\udde9 <span id=\"modeBadgeText\">C\u01a1 B\u1ea3n<\/span>\n        <\/button>\n        <button class=\"pill pill-car\" id=\"btnGarage\" title=\"\u0110\u1ed5i xe trong Gara\">\n          \ud83d\ude98 <span id=\"carTierBadge\">C\u1ea5p 1<\/span>\n        <\/button>\n        <button class=\"icon-btn\" id=\"btnHelp\" title=\"C\u00e1ch ch\u01a1i\">\u2753<\/button>\n        <button class=\"icon-btn\" id=\"btnHint\" title=\"G\u1ee3i \u00fd \u0111\u01b0\u1eddng \u0111i\">\ud83d\udca1<\/button>\n        <button class=\"icon-btn\" id=\"btnSound\" title=\"\u00c2m thanh\">\ud83d\udd0a<\/button>\n      <\/div>\n    <\/header>\n\n    <!-- KHU V\u1ef0C CH\u01a0I CH\u00cdNH -->\n    <main class=\"play-grid\">\n      <section class=\"board-card\">\n        <canvas id=\"gameCanvas\" width=\"480\" height=\"480\"><\/canvas>\n        <div class=\"status-bar\" id=\"statusMsg\">X\u1ebfp c\u00e1c l\u1ec7nh b\u00ean ph\u1ea3i r\u1ed3i b\u1ea5m CH\u1ea0Y XE!<\/div>\n      <\/section>\n\n      <!-- B\u1ea2NG \u0110I\u1ec0U KHI\u1ec2N PH\u1ea6N 1: C\u01a0 B\u1ea2N (M\u00c0N 1 - 10) -->\n      <section class=\"control-card\" id=\"basicControlPanel\">\n        <div class=\"block-group\">\n          <div class=\"group-label\">1. H\u01b0\u1edbng di chuy\u1ec3n<\/div>\n          <div class=\"dpad\">\n            <div><\/div>\n            <button class=\"dir-btn\" data-dir=\"UP\" aria-label=\"\u0110i l\u00ean\">\u2b06\ufe0f<\/button>\n            <div><\/div>\n            <button class=\"dir-btn\" data-dir=\"LEFT\" aria-label=\"Sang tr\u00e1i\">\u2b05\ufe0f<\/button>\n            <button class=\"dir-btn\" data-dir=\"DOWN\" aria-label=\"\u0110i xu\u1ed1ng\">\u2b07\ufe0f<\/button>\n            <button class=\"dir-btn\" data-dir=\"RIGHT\" aria-label=\"Sang ph\u1ea3i\">\u27a1\ufe0f<\/button>\n          <\/div>\n        <\/div>\n\n        <div class=\"block-group\">\n          <div class=\"group-label\">\n            <span>2. V\u00f2ng l\u1eb7p Repeat<\/span>\n            <span class=\"loop-badge\" id=\"loopRequirement\" style=\"display: none;\">C\u1ea7n d\u00f9ng Repeat<\/span>\n          <\/div>\n          <div class=\"repeat-row\">\n            <select id=\"repeatCount\" aria-label=\"S\u1ed1 l\u1ea7n l\u1eb7p\">\n              <option value=\"2\">2 l\u1ea7n<\/option>\n              <option value=\"3\" selected>3 l\u1ea7n<\/option>\n              <option value=\"4\">4 l\u1ea7n<\/option>\n              <option value=\"5\">5 l\u1ea7n<\/option>\n            <\/select>\n            <select id=\"repeatDirection\" aria-label=\"H\u01b0\u1edbng l\u1eb7p\">\n              <option value=\"UP\">\u2b06\ufe0f L\u00ean<\/option>\n              <option value=\"DOWN\">\u2b07\ufe0f Xu\u1ed1ng<\/option>\n              <option value=\"LEFT\">\u2b05\ufe0f Tr\u00e1i<\/option>\n              <option value=\"RIGHT\" selected>\u27a1\ufe0f Ph\u1ea3i<\/option>\n            <\/select>\n            <button class=\"btn-repeat\" id=\"btnRepeat\">\ud83d\udd01 Th\u00eam<\/button>\n          <\/div>\n        <\/div>\n\n        <div class=\"block-group program-group\">\n          <div class=\"group-label\">\n            <span>3. Ch\u01b0\u01a1ng tr\u00ecnh (<span id=\"stepCount\">0<\/span>/<span id=\"maxSteps\">6<\/span> b\u01b0\u1edbc)<\/span>\n            <span class=\"sub-note\">Ch\u1ea1m kh\u1ed1i \u0111\u1ec3 x\u00f3a<\/span>\n          <\/div>\n          <div class=\"queue-area\" id=\"commandQueue\"><\/div>\n        <\/div>\n\n        <div class=\"run-row\">\n          <button class=\"btn-run\" id=\"btnRun\">\u25b6\ufe0f CH\u1ea0Y XE<\/button>\n          <button class=\"btn-clear\" id=\"btnClear\">\ud83d\udd04 X\u00d3A<\/button>\n        <\/div>\n      <\/section>\n\n      <!-- B\u1ea2NG \u0110I\u1ec0U KHI\u1ec2N PH\u1ea6N 2: L\u1eacP TR\u00ccNH KH\u1ed0I SCRATCH (M\u00c0N 11+) -->\n      <section class=\"control-card scratch-panel\" id=\"scratchControlPanel\" style=\"display: none;\">\n        <!-- KHAY KH\u1ed0I L\u1ec6NH SCRATCH -->\n        <div class=\"scratch-palette-box\">\n          <div class=\"group-label\">\n            <span>\ud83e\udde9 Kh\u1ed1i L\u1ec7nh Scratch<\/span>\n            <span class=\"sub-note\">B\u1ea5m ho\u1eb7c k\u00e9o v\u00e0o khung d\u01b0\u1edbi<\/span>\n          <\/div>\n          <div class=\"scratch-palette\" id=\"scratchPalette\">\n            <div class=\"sc-pal-item sc-motion\" draggable=\"true\" data-sc-type=\"MOVE\" data-dir=\"UP\">\u2b06\ufe0f L\u00ean<\/div>\n            <div class=\"sc-pal-item sc-motion\" draggable=\"true\" data-sc-type=\"MOVE\" data-dir=\"DOWN\">\u2b07\ufe0f Xu\u1ed1ng<\/div>\n            <div class=\"sc-pal-item sc-motion\" draggable=\"true\" data-sc-type=\"MOVE\" data-dir=\"LEFT\">\u2b05\ufe0f Tr\u00e1i<\/div>\n            <div class=\"sc-pal-item sc-motion\" draggable=\"true\" data-sc-type=\"MOVE\" data-dir=\"RIGHT\">\u27a1\ufe0f Ph\u1ea3i<\/div>\n            <div class=\"sc-pal-item sc-control\" draggable=\"true\" data-sc-type=\"REPEAT\">\ud83d\udd01 L\u1eb7p l\u1ea1i 3 l\u1ea7n<\/div>\n            <div class=\"sc-pal-item sc-sound\" draggable=\"true\" data-sc-type=\"HONK\">\ud83d\udce3 C\u00f2i B\u00edp<\/div>\n          <\/div>\n        <\/div>\n\n        <!-- KHU V\u1ef0C GH\u00c9P KH\u1ed0I SCRATCH -->\n        <div class=\"scratch-workspace-wrap\">\n          <div class=\"group-label\">\n            <span id=\"scratchTargetIndicator\">\ud83c\udfaf \u0110ang gh\u00e9p v\u00e0o: Lu\u1ed3ng ch\u00ednh<\/span>\n            <span><span id=\"scStepCount\">0<\/span>/<span id=\"scMaxSteps\">12<\/span> b\u01b0\u1edbc<\/span>\n          <\/div>\n          <div class=\"scratch-workspace\" id=\"scratchWorkspace\">\n            <div class=\"sc-hat-block\" id=\"scHatBlock\">\n              \ud83d\udea9 Khi b\u1ea5m <strong>CH\u1ea0Y XE<\/strong>\n            <\/div>\n            <div class=\"sc-script-body\" id=\"scratchMainBody\" data-drop-target=\"main\"><\/div>\n          <\/div>\n        <\/div>\n\n        <div class=\"run-row\">\n          <button class=\"btn-run\" id=\"btnScRun\">\ud83d\udea9 CH\u1ea0Y SCRATCH<\/button>\n          <button class=\"btn-clear\" id=\"btnScClear\">\ud83d\udd04 X\u00d3A<\/button>\n        <\/div>\n      <\/section>\n    <\/main>\n  <\/div>\n\n  <!-- MODAL QUA M\u00c0N TH\u00d4NG TH\u01af\u1edcNG -->\n  <div class=\"overlay\" id=\"winModal\">\n    <div class=\"dialog win-dialog\">\n      <div class=\"dialog-emoji\">\ud83c\udf89\ud83c\udfe0\u2b50<\/div>\n      <h2>Tuy\u1ec7t V\u1eddi!<\/h2>\n      <p id=\"winText\">Xe \u0111\u00e3 v\u1ec1 nh\u00e0 an to\u00e0n!<\/p>\n      <button class=\"btn-primary\" id=\"btnNextLevel\">Ti\u1ebfp T\u1ee5c \u27a1\ufe0f<\/button>\n    <\/div>\n  <\/div>\n\n  <!-- M\u00c0N H\u00ccNH L\u1edaN T\u1eb6NG XE KHI N\u00c2NG C\u1ea4P -->\n  <div class=\"overlay gift-fullscreen\" id=\"carGiftOverlay\">\n    <div class=\"gift-stage\">\n      <div class=\"sunburst\"><\/div>\n      <div class=\"gift-content\">\n        <div class=\"gift-tag\">\ud83c\udf81 PH\u1ea6N TH\u01af\u1edeNG N\u00c2NG C\u1ea4P<\/div>\n        <h2 id=\"giftTitle\">Ch\u00fac M\u1eebng! B\u00e9 \u0110\u01b0\u1ee3c T\u1eb7ng Xe M\u1edbi!<\/h2>\n        <div class=\"gift-showcase\">\n          <canvas id=\"giftCarCanvas\" width=\"220\" height=\"220\"><\/canvas>\n        <\/div>\n        <h3 id=\"giftCarName\">Xe Sedan \u2014 C\u1ea5p 2<\/h3>\n        <p id=\"giftCarPerk\">T\u1ed1c \u0111\u1ed9 +25% \u00b7 D\u00e1ng tr\u01b0\u1eddng \u00eam \u00e1i<\/p>\n        <button class=\"btn-gift-continue\" id=\"btnGiftContinue\">TI\u1ebeP T\u1ee4C H\u00c0NH TR\u00ccNH \u27a1\ufe0f<\/button>\n      <\/div>\n    <\/div>\n  <\/div>\n\n  <!-- M\u00c0N H\u00ccNH L\u1edaN M\u1ede KH\u00d3A CH\u1ebe \u0110\u1ed8 SCRATCH SAU M\u00c0N 10 -->\n  <div class=\"overlay gift-fullscreen\" id=\"scratchUnlockOverlay\">\n    <div class=\"gift-stage\">\n      <div class=\"sunburst\"><\/div>\n      <div class=\"gift-content scratch-unlock-card\">\n        <div class=\"gift-tag\">\ud83c\udfc6 HO\u00c0N TH\u00c0NH 10 M\u00c0N C\u01a0 B\u1ea2N<\/div>\n        <h2>N\u00e2ng C\u1ea5p L\u00ean L\u1eadp Tr\u00ecnh Scratch!<\/h2>\n        <div class=\"scratch-preview-badge\">\n          <div class=\"sp-hat\">\ud83d\udea9 Khi b\u1ea5m CH\u1ea0Y XE<\/div>\n          <div class=\"sp-loop\">\ud83d\udd01 L\u1eb7p l\u1ea1i 3 l\u1ea7n\n            <div class=\"sp-inner\">\u27a1\ufe0f Sang ph\u1ea3i &nbsp;+&nbsp; \u2b06\ufe0f \u0110i l\u00ean<\/div>\n          <\/div>\n        <\/div>\n        <p>B\u00e9 \u0111\u00e3 m\u1edf kh\u00f3a b\u1ed9 kh\u1ed1i gh\u00e9p Scratch! B\u00e9 c\u00f3 th\u1ec3 l\u1ed3ng nhi\u1ec1u l\u1ec7nh v\u00e0o b\u00ean trong v\u00f2ng l\u1eb7p \u0111\u1ec3 gi\u1ea3i c\u00e1c m\u00ea cung b\u1eadc thang si\u00eau kh\u00f3!<\/p>\n        <button class=\"btn-gift-continue\" id=\"btnStartScratchMode\">B\u1eaeT \u0110\u1ea6U L\u1eacP TR\u00ccNH SCRATCH \ud83e\udde9<\/button>\n      <\/div>\n    <\/div>\n  <\/div>\n\n  <!-- MODAL CH\u1eccN XE NHANH (GARA) -->\n  <div class=\"overlay\" id=\"garageModal\">\n    <div class=\"dialog garage-dialog\">\n      <h2>\ud83d\ude98 Gara Xe C\u1ee7a B\u00e9<\/h2>\n      <div class=\"garage-list\" id=\"garageGrid\"><\/div>\n      <button class=\"btn-primary\" id=\"btnCloseGarage\">Xong<\/button>\n    <\/div>\n  <\/div>\n\n  <!-- MODAL H\u01af\u1edaNG D\u1eaaN C\u00c1CH CH\u01a0I CHO B\u00c9 -->\n  <div class=\"overlay\" id=\"helpModal\">\n    <div class=\"dialog help-dialog\">\n      <h2>\ud83d\udcd6 C\u00e1ch Ch\u01a1i Cho B\u00e9<\/h2>\n      <div class=\"help-steps\">\n        <div class=\"help-item\">\n          <strong>1. Nhi\u1ec7m v\u1ee5:<\/strong> L\u00e1i xe \u0103n h\u1ebft <b>Ng\u00f4i Sao \u2b50<\/b> r\u1ed3i v\u1ec1 t\u1edbi <b>Ng\u00f4i Nh\u00e0 \ud83c\udfe0<\/b>, tr\u00e1nh \u0111\u00e1, v\u0169ng n\u01b0\u1edbc v\u00e0 b\u1ee5i c\u00e2y.\n        <\/div>\n        <div class=\"help-item\">\n          <strong>2. Ph\u1ea7n 1 (M\u00e0n 1\u201310):<\/strong> B\u1ea5m c\u00e1c n\u00fat m\u0169i t\u00ean \u2b06\ufe0f\u2b07\ufe0f\u2b05\ufe0f\u27a1\ufe0f ho\u1eb7c <b>Repeat<\/b> \u0111\u1ec3 x\u1ebfp \u0111\u01b0\u1eddng \u0111i, sau \u0111\u00f3 b\u1ea5m <b>CH\u1ea0Y XE<\/b>. Qua m\u00e0n 3, 6, 9 b\u00e9 s\u1ebd \u0111\u01b0\u1ee3c t\u1eb7ng xe m\u1edbi!\n        <\/div>\n        <div class=\"help-item\">\n          <strong>3. Ph\u1ea7n 2 (L\u1eadp tr\u00ecnh Scratch):<\/strong> Gh\u00e9p c\u00e1c kh\u1ed1i m\u00e0u xanh v\u00e0o d\u01b0\u1edbi kh\u1ed1i <b>\ud83d\udea9 Khi b\u1ea5m CH\u1ea0Y XE<\/b>. Ch\u1ea1m v\u00e0o kh\u1ed1i cam <b>\ud83d\udd01 L\u1eb7p l\u1ea1i<\/b> \u0111\u1ec3 l\u1ed3ng nhi\u1ec1u l\u1ec7nh v\u00e0o b\u00ean trong!\n        <\/div>\n      <\/div>\n      <button class=\"btn-primary\" id=\"btnCloseHelp\">\u0110\u00e3 Hi\u1ec3u, Ch\u01a1i Th\u00f4i! \ud83d\ude80<\/button>\n    <\/div>\n  <\/div>\n\n  \u003cscript>\n// ============================================================================\n// FILE C\u1ea4U H\u00ccNH \u0110\u1ed2 H\u1eccA RI\u00caNG (\u0110\u00c3 T\u00cdCH H\u1ee2P S\u1eb4N \u1ea2NH PNG TRONG TH\u01af M\u1ee4C assets/)\n// ============================================================================\n\nconst GRAPHICS_ASSETS = {\n  cars: [\n    {\n      id: \"car_lv1\",\n      tier: 1,\n      unlockAfterLevel: 0,\n      name: \"Xe B\u00ecnh Th\u01b0\u1eddng\",\n      perk: \"T\u1ed1c \u0111\u1ed9 chu\u1ea9n (1.0x)\",\n      speedMultiplier: 1.0,\n      image: \"data:image/png;base64,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\",\n      scale: 0.90,\n      rotationOffset: 0,\n      fallbackColors: { body: \"#f97316\", dark: \"#9a3412\", glass: \"#e0f2fe\", glow: null }\n    },\n    {\n      id: \"car_lv2\",\n      tier: 2,\n      unlockAfterLevel: 3,\n      name: \"Xe Sedan\",\n      perk: \"T\u1ed1c \u0111\u1ed9 +25% \u00b7 D\u00e1ng tr\u01b0\u1eddng \u00eam \u00e1i\",\n      speedMultiplier: 1.25,\n      image: \"data:image/png;base64,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\",\n      scale: 0.94,\n      rotationOffset: 0,\n      fallbackColors: { body: \"#0ea5e9\", dark: \"#0369a1\", glass: \"#fef08a\", glow: \"rgba(14,165,233,0.35)\" }\n    },\n    {\n      id: \"car_lv3\",\n      tier: 3,\n      unlockAfterLevel: 6,\n      name: \"Xe X\u1ecbn\",\n      perk: \"T\u1ed1c \u0111\u1ed9 +50% \u00b7 \u0110\u1ed9ng c\u01a1 th\u1ec3 thao h\u1ea1ng sang\",\n      speedMultiplier: 1.5,\n      image: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAABfbUlEQVR4nO29eZwlx1Xn+zsRkZl3q7q19FbqRS2pte/WYluy5QUvwgu2sf3MMgPY+DHDYDDwGHieAd4Mwywsjx3PwMMDA4MHLAyDdxtbkmVLlizZ2vfW0lK3qrda75aZEXHO+yPzVt26Xb2ou25VtZTf/mTfpfJmRmbGOXHinBMRQEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUHBakJrXYABQwDUGp6fAcganv+lgMLa1VNB9gwLTkP0WhcgZ72U43RjLQW/F431UY6B8JK9MAAYHx8fShJ/pYhoGHO03Vb6HgicA2vT7MxPfQdZC6Ly15f0/V4hBIv3C7Xa2EUifjNgADOAZ7UczgEAmPUTnc70vhU+57ripVghFQApV0c+IpBfUkRbAUCYIatgjRMRiBREBCA8RKx+od2e+XK3XAMvwOkPAeChoaFznag/gOBNRMqIMERWxxpXKjPaRLhBRH9RCvUvT09PN5E9v5fUM3wpKIDea9AAXLU68hEh/GEQRgjCEoMZYaUGUhqQwT0/IoKzKWzSASlC0mkr56xAyys78/N3AzAA/MAKcPpDADA8PDxivbpbaXV2qVQVAKKDEGFUzhTrgEk7TYgIvHcqTToQ4ZvazbkPoMcyyTntlcHpqgCWKzcBkHq9Xk8sdkdRaaRSq0OE9cim7Rga25IJ/6CuWLISiAhmJp9Fa+4wBEhbzbnQO/vlTmvue5EpgMKpdHQ0gLRSG/4Ykf5PlWo91caEYVTGhu3nQZsQA5U5AaAUktYcDu/dDRGWJG67uNMKNNH1jcbMHTi6Ej8tlcFRO8brkOOJrgZgncOVStF4GJWY2auoVEVtbDPYu4G2/gsojeGNZ6DdmAaBgiAIxdnk2uHh4dH5+flpZPf8tKwsq4Uw3mSiQEwQau8shsYnoE0IdikG3mZ5QalaR2V4HPNTkxSEJUqTjnjmNwO4A5kVsJwC6C3YafN8TwcFcKwnTsu87/G6C0ipRcGn1TB4MlMg8wNwt1zEzF1vcuELODrdB5RHACTzqaiuT4UwcAUgmRVHakn0mESk94v+QvQ/z9NGGaxnBXC0J93//WnRjRGRrvAXCuDorGXOxonSG57sPscTaaRO9Jmvat1YjwrgeIK/XKsPLFQeoXWoEyRvQQoFcGxOBwXQa4acSEu/nALIPUZHfHeix1wx1psCOJpzr//9cq8EACKSR4sXf9Zjjq8CmfkPIWT/FAgqDHylvBm7whhzgYIuFMAyMJzahRvTR/GpUn7fAOH8HtKquHAgAB1ZDQVAkL9fLru0K9Do2edof5Nlvj+aQhi4MlgvCuB4Zn1/5285LUwAjPH0pCVJvbNBENYk7bSo055BKYsIDDgXQECKMH/oBaTSAinFsW/qFJ17OsncM3M4MMBzvzT4Dv4URHQzs3uV4UBIA3Pz+xAMlUGKBvr8snZDIU3b6DSmobWBc1YJgxTkgXy3rhV3zMMclQkQJo9IEZe+DX1/6x53xS9+PdjKxxL+o7b0WHwI+Xcb1TCicB57p6Na5fdB+JlSaciXgqqOqIb60DYYRAhdDUcq15VAAFLwaYzW3BRIEbx3bNNURajeMep3ftlTp0agIgx4FAQggyBuYuq8hjr0A9oYCYKImB1K1RFElSFABpFQKSAoWN2G1QmajQNo+ymkHHO7PafY87fSVvstoxjVMyABpo+Wy5EVbHycAGAcC76fxR2IBACUUqKUkgNKCbQW7N3brwRORCmcMmutAI4m/EcT/N4t/35cj4LVDGZiAAkAc0npxutbNPvpioyMlWkEoVSIXKYvSE69m3m0mybIkoG6mWRA1v3o75Kc6rll8Wxr/gBXjD5jV7L/uhmVEPYQHmAeB/JzQiBa4FSMtsxym2YYwM9FnZk/fQSPWAABUK/WAcxhLlPm9ToBQD2LFhAwDBEmDPUrgCEQNYWUEgAgpUQ1GqyUYqWUGGN4MgwZe/aciCJYESWwlvXnaH2mfvP+KC3+uK7DmTnMNQG4S8O3njeEre8FqXcpqCs1Ag2IYnh4cRBwdgdX3Bdw5HPI+qpLvmcct+U/QeNWciUDBScOWet1KuGxU6tHJ//rY/6S0DeIKtOhfVZw3yFOVSIUZQ5+TRqaAmhlQFDixYqH2w3gi20/+6n73KfvA+BRrdarqIGoJSJCqFZJRKhaqYCZlZRKBABlEUK5jAXBj5UonbBSStrttugw9K12m5UxrObm2BjDB4KAsXdvt6vQfV1xJbAWCuB4Jv/RWv1u+IXqqAdzmEsAtK8w/8c1ZT38MxrqXYbCoUzgU3h2EACaNAITIQrKUKRRKQ0ttpt0tDa059tlWm/qLzb1/WaZS6OjWAF0xHGWO1bvcQhOLBJOMGLG8s8OXlzPL6kn5aH3WEee68hS91wd9e185B7HKHPPnkc5zpJf9e1zxBmPKPqR5T4yzaN/TzriZ4TMr0CkMNM4gNTFaMVzaMVzSF0MgSDQAQJVgiIDy4mH8G1tPftH94afvhkAjaqJIQBACYiiiCQMVf5KITMBEaIIACIAQKqsKKc51U3WVnNiLWtrfZKm3sShb4WxV3NzHIahzy2C5RRBl1NSAmutAJYT/mNtpo46zWFu9sLw7eeOYOJXNakPaAoCLykcWycQFeqIauU61asbUAoqCIMKQhMAlHmTVTehZIkCWE5ouhVm6efeakVH7AOAaMk+gFqiABZbs6XnV/3nP2IfACpr/W+e/iwspzi3egkmou0YNqMLVoGHy3+h8sFJvTr1KOfvK/PR9unbI7+XvWVWR+xzxPmX3IujnL9/n/77BwJU771Z5h7nv1M99/hYz0/YQyBIXYJmPIv51hT2Tj2JF6Z2Y749zQzmyJSMoRAeHp7sbQ2z/7cfnvjSt4Y72+sVGoqiYcVGay1BhaqVgMQYElOmAFiwALxmJqfES+JV27Pnjnfeey/ibLPpkjT17Tj2pt12Wms+FEU+twb6FUGXk1YCq60AlhP+3tf+rb/VTwHYV4c/9jOaol/SZDa4rLX3RFDD5TEarW1ErTyCKCyDkGWQZf3IvOcsSyvH6igAOiEFcMT5l9lHiFGiEvYkT+Fzh/4XNBlUVBWbo204s7QLW0s7MRyMLCoDcXl5CHSs85+kAqAjFMCx91ncZQUUwLLP79j79DykI47dVRRKaSiloZUGBGgnDRyY24NnDzyMZw48hMR1fBhEFKhIOVjvTPrJAxsf+D23udGqJtvrqqa4FEUqiiJldIl0pAhBAKJQSHnxXgk755X3kqTWi2s7seTa8bznJLEck3W+6RLnXCdNnWk0vDGGJycnPTLh77cETgsFcKLCr/rf1zARNTE5fw5eu3lzdN4fBFR6N8PB+tQToIYqo7RpZBuGK6MgKLAwBJzF4gk4VutwuimA7ukIGp89/NeYsgehoZFyAgCo6Bq2RNtwZjlXBnoUSmk4sfDi0fUZ0EJL/fJTAMd+fnmokQRgQMBQysBoDQHh0PxePPrcHXj64ENIOfFRWFKBisiq5PHOpsO/ll7WeKTa2TBuyoFElYiUKSlTMtA6M/8VK1FGOLWOScRZ573Ese+kqU078w4db9N2J211YucQW9to2HaSuLDddlEU+b2LlsCKKIHVUgAnIvxHCD4AVcOWqIn9hy7X7319TY//d6OCs6wkjr3TtXKdtoyeiaHKCEAKwi5r4WmpwJ9o5ThdFICAUaIKHm3fh9tmvoiISrkLkcDwsJwCWFQGO8vnYWvpTAwHY7llYOHRVQYqv4ZCAXT3WsgllYW4AEQ8PBhGGZAiHG7uw0PP3Y5nDz8MHQQ+CstalMS80f6heZP7TGl+aFyVShSWI6jAkNERjCJhpUQBLPDMzjtnU590Yuc71qW+lcbzndTGiW3NN5J22rA+jq1rtdKuEsi7A11L4FihwhNiNRTAcsLffX80wScAuoaJoInJ2WuCH/7hSFV/X5Gup5w4Aszmke3YPLodmnTm8CNa0td7KSuA7AZlJv4/HPwLtLgJ3eM07zoCF5WBoKKHMBFtw5nl87CtdBaGw9El3QQh5Kqgpw//clUAALopR1k4UiDk4UXA4sBw0EEAKODZww/j/j23IpGYy+Wa0saANtHfDr1x6KZAlSITlpQuaWgdQJtAlIiIBjvLLMzOx4lPbGxdkqRpu21tq522kmbamZ1NfasVJ61W2krTNJ2bcwlzGrZaLo8Q9HcHgJNQAmuVCdgVcnr/tm161lq1j5k8M5Wc0zMATc+VTROTU1eHP/wzZar/LsMh9R0OTcls37gLw9VxeO/gxGWOrlXRZesHD4+yruC86qW4Z+4bCFQAzqca6FZdAiFSZQCAlRRPtR/D7vajqOohTETbsbOSK4NgFIoMWCz8wLMl1zdLJSn3H4HBIlkomRggIOUYDMaZExdhZHwT7n/uVjUTH5SwUuIgKX/A34OJsfeMfYK8KQemBBUoqCAQBc0sXojhPTtnO6mPfGrTODFpqZEmYaipobVmTQlCZJGDaaBeh2q1OJ6dlQmlZHJxTAn1Ff1FMWipWa71XxD+XYDanSXvdOk2YxUA7SvNB35ySI//IcN5xylVS3V15qbzEQURHHssOLb6W+CXgQUAEDQ02tzE3x/8i0wRHudxdu8Xw8PmOQQVXcPmcCt2lHdhopRHE0i/LC2AjEUVILkCYDAk8/tDiMHwEM0QIxDF0KUQZAiP7L8LL8ztRrk27AJTMsGW4I6tHzj3L9FG1UQhk1JCRAIRFrAX57xPnbM2tTaObdxopGmnGbda82m70Yk7zdk4nWnGc63ZOOl0Ep6ZSadmZ23Q6dipctktYwWsKwvgmML/Opypv4498fPXvf+fjYeVD6beK00gpUzjyc7BX3/NXUE4bEZ+04vjTPiH1VmbL4RWBs67BSfWyxkHiyEzgp3l8/Bo6z6UqLxgBSzS7RBQHj9isDAIWUSk5RrY45/E4XQ/znEX4vza5RgLNuFlPWBRMj8ABLnw8+IrZUpAlEA0QIECaw8VGlx2/g2IDlSwv/GMCSraB6m5rnPP4YPbbtx1W9rwNRUaxxKwIrAwey/i2VoXxIlJTGh0ECg1b4iVIlKhELP42EvoY9Ztz3GtxpU45k5D82Yb84HFiWZpaelPnNXoAlD/6/u3bTM37d0TP3/9B753W6n2VxCgrPKiKI2zo7HXvLYaYs5SWZBItTRMZ22+EEppePE9seeXOwQB4+LqK7C7/QgY3CPuWRvm80zIrtCHqowhM4p6MIpN0VZsCbdiJBhH1QwjUAE8+/w4L0dkMQ05twAWugHEEMqtglz4YQAYggo1KCSIYVxy7qtRPlzB3plJ5WiY0yfCd8fDen7TDbseqCbTlWoQK6bIgcTb1DOb1CE0VodaxU1NQkQegGIWTquSppbFeTdfTbxvaheFoW4Phd51mgrbtql8DMFJMygFsFz9WdBUkR1TwF6JSL8BpKRhOykh0wBeUtRDPXJeTeGWQ6lsKFdoZy78WSV+eVbN5SAQLFuMh5swEW3Hc/FTMDBwYvMsSIOqrmEkGMdYsBHj4WZsCs9ATQ+jpCt56ivgxcGDkXKCrhPw5Us3UWRRCWRp5LLQ8oME0ATkFgCFCioMoMsErw12bn0TNp3xBdq04R5sGktFB7e/v1Y5s/JE8LrnnvMXTY0FB0Ly3piArHcRuTQl0gEBGqREhJnbAl+y4r1zDmkapr7m4JyZCYZ9tTKt4hYreN/buJ6UIhi0BdDf+gOASthlt5iQStb700RZ/1+B4ETEMkMrRds2nAOtAzC79V05l+vwHO3vK7kPshz2y4auxYF0H4bNKDaGWzAebMJosBGjeeuuSQNC8HBg8UglAaQvDNhvWZ1qmU/jXsRi+C9XAd3WnyTzVGmADIECBRUomBLgqYp6vYVXX/WnuPCc74BqWwlmBBAqw973vle1vtja7a69+6vpz9zhlbhApSEp7UiDoBRCQKCEvXPMaeptqeSCZugQhjZQKrBUSsNarFtSUjw8TJvjmA4sdQb2vp4Qg1AAy1WJJVvDpwoAREQtV6cUQJ49tozsRLVUh+XjO7hWFUIeecg/APBeepyAy9yEni96fU70IvfpP7YiQsIJNpoz8P0bPoiyriLSpczZJwIvDqlLcm82LUZMaGlXYVBKS+lcsRAAoVWZ1vtkEEjuJekJ/fWF2SXPJoUCSAGkCWQIKiBYqWJiywt4943/AdWNOyGl/wyOrgIoO6rmmMPKrdWL4r96/RnzH911k/udT3ZQSQIVB9qVAI5BHIl3jsNSyaftNDCRDkylnJY6gUmCiqawZYKGsyUXqViEmHm5u79ufABH7QY4yQrOkCP2ISJ4dqhXN2HcTMCzxXqZKSqboBJgx0htCvYCrRRIE8q1EhTld3+QUQAsvbG9HvYyjWZCTxaUJ/loEBSZI3/f55k/+USgo5UZgBCStgOEISxQWkGbrMVcr8qgfyDnUn8AAJUrS0WAJihNgDYIS4I3v+aPUN3yanDtV6G6o8C7TlldUqjcKD66gUf0T29769RvvPlv5Q/+cYj2htCadRCIZ9GGI22T0JhyoMO4omPdNiaKdGiMTnRZcRAojlqqyhWVtFoEbCNg70lf70orgOO2/gAo5mxwPi+vJAAA40Ob8UJnhUt3kpAikABpYsGeUa2XccauTdi0bQwTOzaiVi9j48QYdHfdkWWuah3ZLy+aF1X2HkOUPTB9sI12I8HhfQ3MTDYxO9lB0rJQSiOIssFKwutUEXT/X9CVsliLVV4vNGB9BefuvBubth4GV34B2ZgfRtZXUItHFEdaVxRH/0rOUL9w6Zly/7cmZcd0oNuaWLPRWjkirY1W2hildajIaKWVIi5pYqVUGATU6W35twHYe/LVa7WcgEsUQNcCEFnf7nwiAhSQtFNorTBx1jguunYXLrzyLGzYrEEKmG8Cs40mHtrzMJzzff3o9VexVwsRgdEGZ27bjm07RnHRK0cBBmYOAc88fBDPPnAIM/vagGcEJXMKbqxB0WsGLA4mA9BTu3OLEAYbx56EROcDppz/tn9NWALIABBCcIGY0qjZ1H5ow3PqkkOhbxgwKxZWRCCwUiSiWEQpUiRKkWFFxmRDi4EyhDvUP9vQyTDoLsBym/KZAqDlugDrBaUUbOrgWXDmhRN45ZsuwcWv2AIP4NHdz+Mfvv5tPPjkw9gzuReHZ6cw35wHMy/tyL+cEYFSGvXaMMZHxrDzjG24ZNcleOUVV+PSG3bgytdtwu4H5/HY7S/g4NMNKK1gQo1Vm7v1RdH3TKXnTdfa4QAkCUQIx577RQBJIeLACJhdqkSYuj0FYSGwh2fgiPVHUkDy1r87tPhUWUkFcLSa39vZVADICisAiuUIJ8a6QCmFTivG2JYRXPf2y3HN685Cqy34u698FV/8xldx3xMPoNVugZRCaAIYbVCKSlnrv65asTWEMiugHbcxv28ej+95El+6/Wuo3VTDFedfihtf8ya85bVvwDmXXoCH75rCI7dOonk4RlgJ1kmXoNte9X0W6fELCoQBpRLsnbwM6HweqE4C4QQgDqBeK0AA8WAKBOldlHYanWfsKw5GMmesBztO4V0KZ7047wUszM4JixWXxHCexSknZK2QSnJXE53yjRpUFKB36/9OsVQIAMl6swAoc2W1mzEuuPosvO2fXYfxjQG+fNu38fG//TM89swT0FqjUipjZHgEEAFLd54BWZdOrTUjvxVaa2itUY5KABG89/jWA3fjm/feif/5uU/hX33gw3jza6/FtvNGcdc/PoN9D88gKC/fJRCRI0OVK0yPCyN/pcWKvCQokAk/eyAI23ju+Qvx5JNX4dzqv4anP4YK6n0tIkFIQeKHoeM/wEP2jXe94Cbm67wvtE5575w4a5nTlNml7NJUvLUsiWfx7FlSVsycplZIKVHNZnZ39u7tluykWK1MwJ6tTk68AqB5HfkAiAhgQWodXv/eq/HGd12CQ1NN/Ox//C185c6vQWuNkeF6lhvODO+LRX5PhK5S9D3KsVapgojw9L5n8XO/9TG89Zvfg1/68M/gTT96Dr7z1Uk88rVJmFAtUQJEBKNDWJ9gcCHh/IR5yJL62i8Sykx8EYgH4AViGRIokIrxtds/jDD6A5x59geA8vuA0lsgaiz7rXsWFP9v6PbX5JZvX0mfffY10Y7v3S+dGScQz+ydd0nCSdzmpJ1422n6NE58Yjs+9olP29Y771lpy9ToSEMpCbNuwLrKBDyBKIAQV4TQXgiorD25uWoTizf94Kvxlvecj2/e9QR+5Y//E57Z9yzqQ8OAoBD6FYI56/CWwxJAwBe++RU8+swT+A8/9W/wmneehyDUuP+Le2HCzIQmUkhtB4fnn8b2jefDe7vi1gD1aBsCZTF/yfMmJNtAuS+QkSkAJxDN4JShdYpOI8L//uK/xSUX3oLLL/wMRkf/HjrIrsEmDs/v34h/uP2d9PAzZ6FSPXBBZ6r+dXbeenbeWettq+1dmtq003RJq+1c0rJp3HLSiD3btvdJ4p33Po5jVsawMWa5OQHWJA9gmc7SEV0ABdQJ8Moz54srrJ8ugLMOb/rBV+OGt52PT33uNvzGf/99zLXmMFofgXNuoOfuzmSwWsNwuwODZI1XKmdhQIDR+gieP7AXH/3Nj+H//tDP4u1vfC1AwANf2gdlCEYHeGH6Kdx8/9/gkrOuxzW73gLns4zGle8SZC18dtxuJ0CBwCDJFyllyZWAQJyALQOKYVQCUh73PfhmPPb0GzA+9jwq1VkQKTQ72zA1txmPPn0bAppG2lDDc08fGi2fUXk+bcZwNnVpkti03XFJu2E7zabttNouaca2Y9s2bqa+3en4xFpWxjAdPiyTlcq6swCW4whfAC84AdfeAlAq6/Nf946r8OZ3n48v3Hwvfun3/h+USyXUytUBCn9WrTw8LDpg8fkw3MHeEoEsnMsghIbuTpg+0PMeC+ccauUqOkkbv/i7v4pq+XfwljdfiU7D4dFbX0CpTnj2wCMwFOChp7+JOG3hml1vRRhE8H4llUCv4yE3+/NM266SViKZk9IDYpFZCsQQcvBkIOwRRNPgOMCBye0QdTZIKxhtEYUp6gHo0GxbDEV6/rnDozIytts2Ojq1qXVJJ01arTTutNJOu5EmzWYat9uu3UhsnDad63Rc4OddI/Y+1Jr7FhM5KVYrDJh/ZoWqdJ1/a+4EVIoQd1Kcfcl2vPX9V+Db330a/8/Hfx2VUhnGGHgejMlPUGB4dKSDMg1hq9qFDWorNtBWRKgsM6R3ZVBQSNDGYdmHw7wP+/lZdKSBkMpQ0GtqEXj2CEwAKhF+9Y9/HeMjv41r3noW5idTPPnA03jh8G6MnLmZt776PHfPJ78YttMGXnfx+xDoKLMEVkpxUk93gLqmvwJBoESycZKsAJ+nsVnJ5wgAIA7CAmENFVgo46CNyiwHB3hfgnElxK2ORApk9ySb1dkqSabbgXdpapNOmrTbadpsp3F7Pu00WmkcN1JpzzpuWmud8z7WrBqzbEqlFZkZeCUUAC3zukyXoK4ATxBR0cJS2acexjhpCHCWURkq4e0/cj0azQ7+/Z/8FmYasxiq1gbW38+EsIMSqrjSfA/O0VdgTG2GglmFtQuzyn0uXQ2GwzQfwFP+Pjzob0OMFiIsN5/A6sHMCIIAM41Z/Np/+038yb/7f3Hde8/Et+77KubtDC5+w2vdOz7xYy1lNO76y8+G1WgYr73o+2Gtz6vSqSmBTOyX+gIWh1dnSqBbY4WBPFiPbMgwgwVQnI0LEasgRsMbAeWzCJFJEUkFrhUDEHDqtqjD7Pxc6r1NkjSOk7jVSWzSStrzjSTuxGncmLbtZtNKu+nSNrnExz5QiicnJ5fr97/oyjNIJ2C/6b/wnc+Xyk55YcXVVUcRIUlT3PDua7D9zCp++ff+Kx568iGMj44PzOwnKMTSxhnqHLw++AFsUFthJUEqCQTxqvWHsqnRCSO0Ea8K3oFd+krcav8GL/BTiKiy4paAUlk6bNf5dyy89xiuDeGBJx/Cn3zqr/HRH/xxPDv5EKphHZf8izeksQe95X98qE2acM+ffyGMgipeee5bkdhkBXOwFg+U5XaobJyHAAoCEQUIkF1OzzgBYTALyAnYMMRwNl5AZT4XMgqIGUmzDSYPF6dGJpPUtmPYJE2sjRMbx7GN4ySebyZxp5O6pJ36JLHsnOsk4oOk5U0Y9s4M3G8JvChWYzjwgvcfVSFksT8BED3dDC+/dJgx+OhuX6EUIU0sNm4bw3VvvgC33/Mk/vGWz2BkaHAOPwWFGC1cbK7HDeb9AIC2zKM7HHc1Rzt2z+RgYSVBnTbgXeFHcJu7CQ/721FCdcUsAa0VWq0ORIBqrQz2xz+ucw7D1SF86c4vI2hqHDp4EOd+z1Vuy9VnuqSRktIKb/nvH2zP75lS9998qxmtbcK5W16B1HWWrMt4MuQRwCzk13UCZrl3UKTAkvtphPLcnnywUDdByGeRATiCaAFpgs9HQ3qVIvQlIBaKbRMMvzl+djZyJpn2iXM+SWNnO0matJNkvpNaTtK03U45SewsszWdKaeM4QMHDpyS0PdyqgrgWNl/fdaALCQCdcdTeVkrC4DgPeOaN16KIAL+66f+DHGaYLgWDsT0V1DoSAvn6qvwhuCHkEoHAoY6Il98dcnUjoZDCoLCG4IfQiIxnvTfQZlOXQkQEQ4fnsM73nl9OjY2In/1l1+INmyow7nj32OtNDrtDr76+a+hhACX/MTr0+4IO2GB7TB971//ZHv2NQdqdzz8GTVW24yx2gScT09xurjFXACSpQasyr+XPCyoGNkkIV4WE8EUFiIE2ULimS8BBHhy0F7Btx3SNIZAVHx4NrVBO5aUnU3SJHFx4tJ2kiZJItam7SSxxnunpqe9DgI/FYbLTQkOnKRCWKlxtsdqvvK/5VkUIt0oAJFatcjXYmEoC/mNbBjC5a/ahbvv343vPPJdDFUG0+8nECxSjKsJ3BC8D1YSZK6k9THEGci6JgKGlQQ3BO/DuJqARXpKVolShE47xo9/+F3xJ//mP8390cd/sXHtKy9y8/MtaH18xeeJUfFl1LiEkXO38M63XmqTlidSBFIEThyqW6p84yf+ZZsM4duPfykPC67A6s99gp9ZAQrZomwKivJXaCjRIFEgVlBegTyBLIFSAqUAUgCpAIkAqYAThuuk2Ran0p6ZSxqzU3FjfiZuNWfj9uxcksx10s78vHXttk3mne1MTXmllJ/WmjE5uaLrA650LTyKA3B4Yb7/EsrEuQ9ghc99YgUkBZtYnHflTtRHgc9//QuwzoKWnZpkpRBcZ96NCobgYdeV8HchKHhYVDCE68y7cSoWptYK83Mt/OzP/1D7d3//5+ettQRA/uIv//382NiwpEm64Bc4eoEE1bQC61Kc//5X2nI9FLYeC/MNGIV4JqEzX3eOe/XPvyd5buoxPPL8nQhNdIorQPeEAWkxR4PQnUylqwR0pgBgoMVAc6YMFGuQV9nmcmVgVa4UFCgl+MTBJx4+9mg15pLWTCOJ5+aS1nwjTVqzadxopK7Ndr7RsNSZ8lprN2eMx6FDK7IYSC+DqokLiqBer2tg3gNNh3bbxXHsXGodgMFm1xwFFoYJDC54xS7sPxTjWw/chVJYOiEH1YuFoJAiwRZ1FnaoC5Ggs+Zm/7FQ0EjQwQ51Ibaos5Di5OYIZBaEUYCvfuWusNls6yAIkCSWtm7d6D/5N/9xjjlLpz6a50cAhC5EqRGiNFyTSz/8hiRNQEov3V8ZhU7T0bW/8q74rKsu9/ftvgXTrQMwOjy1cRnUU4Gp21XKnqdaYgl0lUBXEWho1guvihcVgurZOGVw6iHWS9qMk3Y8k7TmG2ncaqU+jlPr2jaxDUtx7JVSfk4pxtTUii4JtnAPT+XHfSz3NNXc3Nz8tm2X186+8JUbJs67ZHzb2bvG69t2jI1uO3vcg5b1QQysV0CAtx718Rq27xzDg48/jv1TBxEGp1hhjn46CDzOVVflcfb1P1hIIFDQOFddBYE/qU6AiKBcjnDvvY+bD7z/Y3UAEkUB0tTSVVdfaP/zb36kOT/fOurszqIYNVuFtynO/r6rXP2sUfZxiiPc/EQQxwjLSq7/tffHqYtx3+5bTtGl3G/AAtIzfVrXGZgJf/aqe6wBBQMl2abFQHGvMjBQbLIUYi8QB9hOYuNWK/VJYl0nts2Wc6m1TiWJU0r5hlKMmZmjrQC0bi0AYONGDaB12XXv/Imxs865q7Zh4q4NG8+5c3Ti7G+aibNvHtp+6TenQ7kC3sEBmkFgEDwIGoJBuAeICN4xRjcPozYMPPrUY7A2HZj5z2CEKGOLOgsedh0a/keiAHhYbFFnITyFvADvGaNjw7jjmw+YX/j53xsCwEopOOfpR3/sHe0f//C74pmZBow50iLSrFFtl0FK4dIPvS458uiLkFGI51La+baL7CXf/zr71OT9mJx7BoGJVkSpL5kOrWfatGz9ycwSIORKgDQ0TL513wc9m8ksQEY21J8BTp11sbeu4511bUepdZQkvk3EzSYx5ub6W/3+izqlyjuQMOC2bdvU3r174wuvvvHyICp9/NpXvRqbNm6Ec/kyXiJIjMFzf3svnN2P0XIA7z1YBAExDrky9toqImKsZLYwAWDP2HjGGEDAk8/thtZ6QMN4sxl46xhHlUbA8DjVRJXVIVs5qEojqGEEc5iChsHJNDbOeYyODuETf/aPpUsv2+V+9Mfe0UlTS4BWv/07P9t49NFnzF13PmTq9dpCZIBJMGyrkLbFttdf7LbecK5L5i2RPob6JAAMvOpX3xM/8cVvm0ee/hadceVZJ3f5y5ClAOWJRnn9zT6pvIsgeW6F5AuL9vvnuilGmVIgpq6jUcizh7fekmJKyRMlvkPKo0UMNI616s+KVNpBNErks/nKHcNtL5cruPiii9y2bdtkx44dsn37dtm6fbtcePYOubdTxsce0bhzhnBvawiPJGO4p70Rf3j4Ysz4EgzxAKwAoFavIk4Y+w/vPyGP9EmdBwSGw7Aa78mwO10UACNCGcNqHIxTm5GZRTA8XMXHfvGPat+559EgDANJEgsAdNOnf2Pu7LO3crPZgdaLi5LWOlUwBBf+s+us1jjuBCGkFJL5lDZdPuEv+L7r3LMHH8b+uWdzh+Cp16DeeQGyE3YzA7v/utaAhu5GB7obLW5dKwGSj4MTgvfKW7IeKXmAfAwI2sgGGBy9v79iYjGIKMACArIAkCSJStOUerc4SalMgq/MaPyrBzT+076z8buHLsPvHboYe9IaIvIrvj6NSDYz7ZYdGzE9l2Ly0H4EOhjoRB6nQ7//aKxE2UUESikoRfihH/i39X37DuooCiRJUlQqJf7En//KfKUciU0doICSi2BahKGt47Lr+65K07Y/wvm3HN3ssov++WtS0gpPvfBg5iNYgWvoyQvs6RIgVwRdFZBNcEqkcx+BWhR+LPURUM8/wGc9X6SZoGd5w5LnNh+t5V8xwRhIt7Q7X3nvpIWULzzRuwmAKgFVA5SIEZFHRTmE5AcqNsKSd+lOhxb59IeZEUYhpqfn6YM/+u+HPTNFUYgkSenSy85N/8tv/XQzjlOAgCFbg/MpLvzn16eVjWXx6WLo71iQVkgalnbeeJHd/ooL/TN7H0IzmYFRwYor4SWZm7lvYDFa0LUO1GLYkHo2LETE82MFC616PsXXqg7NHKhfSpg0EbExBkSUtwSLG5APrZbuVWeOwHUwSrhghfHeY3i4hrvufNh89CO/PQRAjDGw1qoP/MBbOv/yp97baR5uoxaXEVbKuPAHr0+dA6kX4aAVL1AauPhHbkhbPIfnDj0GYwZn4fUOFur6Bxadhcf6l6fCZkcREDFRSfL30mMBDJxBKgCllWqk1qqDBw/C2pTjTofjOM63Dg8i9l6wfnHOYcOGOv7yf3w++m//9dMVrRWLAOxZ/Ydf/8nmj7z7nemB1kGc9/3XpJsum/C2lWYLcJwgShNsAjrr7VfYofqY7Nn3KPwqrCq1kCjUEyrsVQbLbj0qYJHuQhirN0x+IFGAAwcOeGzcWPFzT30rLkef+OpXv/rjQZBpYkI+Gi0A5JBBYAx8oQheNjjnMT5exy//m49Xt23b5N/xztfGSZyqSIf0G3/2kcYLDx6o73jXVbY/pfSEIIKPLepnjfD26y70T33xu2aufQj18iYw25M54knQM4noYtBw4fXYyqgM4JhRzxVncKMBDx2S3YcOBdi9+6cvuOItf+vIDwtbzV4CYgQusHaicd6vRLp6vpd4RR0bBesdQakU4ec/+jtD551/pj/vvB0uSSxF5YB/+x/+r8YtlbKOO0xKqxfdGe42Mue+62r7yBdvN/tn9mC8thWJT4slG5ZhFYYDD5cfu+8rd2TvEeRbBCCdCM/7SL6gXqEAXkYwC8IwwMxsg/7PD/368Je/9kczpSiEtY62n7PRv95Dbm47HZ5EjVCa4FLQtjde7Gq1urxw8Gm6cNsrUVSv5VmF5DSSanVTrTw2Vq/XN9eHhjbUR0e31cMNYR20KnMSFqxDvPeo12u4777H9Ud+4jeGAYgODJxn7NDgV0XKxziJCkrZYJv6mWN+/PztfPDQHsS2Ba001nLew/XKqmSntlpt7sSxT5LUp6n11jqfpqlH8URe1ljrMLZpGLf85XfC3/2pv66pvD4wgAtCxRcY4pNRAuwZJgTOuHaXb/M8mvEsFA0q4/P05nRITy94CUMpYXM4hr/7y2+UH3x+2hitpBsdelVJ+82KJMWLN+AFwMbLdniLFIfn90FrU7Q2y3BamOCkCNm0ark3tTtOE7mHlRbedX+xZJ/uZ6J8PffVnH+r4KiwYgzHQxDrsePNF9jHto/RGdar8UCLR7a+7usi8p/tiLH55xMR4mzFXmDDpdt9aEqYmpsEdogola3me8R4v57kvu6bo+1z1N9gab5Sdx8R0HrWPOtfARCQtCzYCXUz905eASikcQp2gkIFrD2KFaqdClhSXPojr00ZwK0db94VaGuQDZiraiVvLsP9U4fNic7XRETwHab6WZu4OjYi83OHqdNw5GxPGL6778J/R1cAaskf87eq7zd9da77vwoEOsS67eyuawVARPCWce3bz2ts3j5ibep7snd7bnS/il7614UvCATnvIyfURv2VkyRCrx2MAlqtgLdFoxcvIPPvPEyxy1PTVL4atubGyvadZ/OuFYyrlkm8wkkjitLRPDWo7K5yiO7Jnjunr3qoneWZ6MwEu89LX3u1KcAjqwT1K8RevZb7EP3mRYCmJLiyYfi6uEnfEkH61MDrGsFAADeMl73vkvnLnnT5uaKTKijwPvuRmn/cy1TWAFriaCWVmE5wYU/dF1aHg6kPZtSYBT2s9CdsdevKmmfALil7cxBPkHh74E0EJZCOCS46F3Vma1n162NX/z0D8ue8zgFYQ8Kh+Du+FNsPvBQq6RDyHrMcV/3CgAEtOdjlc7CtOadejG54cseToG91YUXYA0REkQ+QtDUKG8elgt/+Po0jZmUzrrLAYAnnKgo8XjOg2YY9GKtaGGBAjDxyl320ZvvLj327efKWzZfys1Zr/RA53/M8F4I0OBE1nVdW/8KAAAIUBqiFcmpzt5Daj3q4ZcXQoKarYJtip1vu96OnDnC7dmUlFk0qA2A+60oDeBUutCSu3uiciQAQIpkJWYOXpaeeqWEQeva/ZdxWiiAqBKKGQJXoHGqz44UeLYIfq4pxhtUmhEoIlz+L78nde7I2bwFi4J/MlLUnR+gftZGFhD27zug9dB5LrTKmGDwgumdoqAGpmANl787Ada9AiBFeOr+yZIikk4rUf01hUAnkM2w6N4RYR4KtmRdiXX9aF6aMAmqrgSJPba+4SK35eozXdq0RMtME36qj0cAjJ69mQHg0Tv2Vl64Fnb68JwOjO459PLmYL+L7wgW/tQbB1iEvVBU0755wAWksG7r2rpWACICEyp89r9+exxeFuI3p5IHkMYWP/KL78KGs+pFZtgaoIQw3B6CR4ILf+jVVql8gpYB9ctdbMkA2PudZOgf/+3zQ3HayueiOFr9oZ7AwJH7LPxPPX/rvuvZRyGbTVhpwEQEWe31706Qda0AugShyu/eKSgAZAoANLjKVnBsmARlXwK1GJsuPsuf94FXpUnLLen7rzhdQdWAiQBDQK+xMfBEIGDdtv7AaaIAQLTEoXLcRI6+fbqfe+ZiKDTAGqFAEBZE9bKE1UAy83/wjyOvJ5kDuP90x/t8Kvusc5fz+lcAVGQCvlRQQkgogaqM4IW7njBPf+Gh4Jx3XGKTufTY036fCnmz4S2QNkCpffEWQJEJuEYUmYAvPZzyaNZaKLcNHvmrb4S73nGJHeRkEDrMxhVs2GU6175vQ3t+LlBLp4KnPgVwZEmKTMA1pMgEfGlBotDSHQwFG/DcVx40M0/PqNrWUeHUHtlvO9VzAYhnGsQAzr9hY/OaHy8fjhtlE7zIgYFFJuBaQkUm4EsJApCaFPFQCjed0EOfuCW64T9+f6fdEVJm5R5KNwHo4H3PaQXB2efvtH4eQWfOq7TIBFzg9EiJocVMQLUC23p+IC8LhNAMW9DK4Imb7go685ZUMJhguQ4NBII0TknrbO59IjWYTS1uSpEUmYArRJEJ+NJCCaFjYvhaHdNPvqCe+NSd4WUffm3SmU1XzAogRWAAB+571lSDimw7d2OKCFIaUrxMztGKU2QCrhBFJuBLEyFBq9TG0HwJj37yW8HFH3xtMohwYHu6SSWKEO8Pw923xsZ6S0uXJV/+nP0uviMoMgEHT5EJ+NJFsULLtDFcrmHv1x8xe7/+pNn+xnNduhIhQREoo5DMpNTce4gq4Rh9/femJtgfBnC8+kM9gYEj91n4v8gEXD2KTMCXJk47tKsxSh2FR//6G+HON57rZCVSNESgQ42Zxw6o+ckpddaGSxCVAiQ2gSI6fiJZX9SvP8q87G+wfIJakQm4Aoh0/8s5hcyt4y01XbB6kBCaQQuVYBRPf/6+YHbPrKpsHha2J7Yg6NEQAbSBTD+yVydJG2P1CRAURATSHSZYAOB0iQIUvCQhISQ6ga0xmgem6ZG/vj0MS0rYn5qELoQAH3hOKyhsqJ8BZl8Ef5ZhlRSAdO13Wvq+4OUOgdCImjAqwGOfvCPszKenHBIkRfAM7P/OU7qMIdQrG7JFQtdjJ3yNGbgCqNUqGmh5tNs2jhObJKlNU2eRwmKVlkAuWL+QEDo6BlcVDj/8nHr2Sw8GUdWInKwVkPf/W5NNdfD+Z/XY6ARKQRXZWgOFAuhn4GsDNpuTcxMTF01EGypl37bGOxsQmSgx1RR7Tw8fRMFgYcVoldqoNSI88Kc3h+e976qTXslTWGBKSvZ/a3cwPz1FF57/ShgVIkELdMp55C89BieA4+MKU1Oty657509AB78McFmGRSF374gWYFaqPOsANahJ2gpOBxQrNIMWhkoV7Pvm42by7mfNlqt2ettOsdxMQceiO7DoiX+8J1CisGVsJzw7FK3/8gxEAUxMTKjJycnOBVe99fIgKn382le9Gps2boRzWT9MRGAig+8cuh+Hp6agBjUUtOC0wWmHuGoRTAke++Qd4bZX7mynfORcgceka/4f6Kg9X3tAb6huxXhtAt7bVez/9475kb7vJV8Ie8n+BBHCGsUmBiJ5zEwAHMNtL5cruPiii9y2bdtkx44dsn37dtm+fbvs2LFDoijKknEK5fyyh4QwHzZgTIgnPnVXMPv8vDIlszT8exyEBUFZy77bHjMzk5Nq+9YLEJgSWHiAJe9OXNor3pKV+1gbBNkCZgAAEhHqUQbIneUDZ6BNr4AsACRJotI0pf5NJNOVmgBNAoVsG/SVd+vUuh6m9TKDhJDqFLbGaOyfoqf+9z1BcBIhQQLw0F98PTSIcNami+H9yg8z7rIo8vnWI+DH/tcn/nnRMyWwJEI28Aq6arY3ES3ZAIICkAKYtsCcM2hwgAYH8AMWTW0UWASeB32mgheDAGhEDRgK8MCf3hylbX/C8wUKC0w1xP57njfP3Hq/3r7xPIxWN8N5u+LPeIkpvyD0vVYAZ5tk71l6NjB6JzsXSNbuHREql14lMLBKOlgLgEkTERtjspV5lYJSCqQUjFZoM+HMSPDTZzF+cMN+vK/+NN45/DxK5GFFrfxVUzYf3fTBWQxVAoyPjMGxW+mzLD0l1GmpZAiUq+jVIxslmEAqClOP7FXP3fyICWtGxB/fhBcWBAby6F/dHrbac3TO9suhSK/ILBzS825R8LGkpeeuwIvvEXifbehuDgy31BoQ1pBAIxQFiIKIQmXZfJmBKIJBhuGUVqqRWqsOHjzImzdvYmcdQAQSQcIeO0tO/cqlFlvGAsBOZg+LGJeXp/EHhy8Gs8JKZm4SAGbBzKF5DNcMtmzYgsf3PIlSVBrIwCCCQlvmYZGcVkqAQLBI0Jb5VVcCXnm0Kx2UWgaP/s9vhrvecenxpwwTgSkZzO9rqIf/9hvBxNDZ2D5+HlIXr0iAKfPQ9ZRCBLIkhUUyI4B6fAA9Zes9AosHiLMUGAK0Zg1AiwhBREeIfCKpAkQj6yX0JzCsqMNwIArgwIEDHhs3VvzcU9+Ky9EnvvrVr/54EATo9vkVgBkGfgqELTWN6VgQwAAEsBAuLM3gnHAeD3bGUYFbMa+AIMsSmzk4CwJw9razccu3vz4QD7FAoGEwL1NoYR7DGIXH6RCOysuNGczLFDTMMp7rwaFYoRG0UIs24unP3WsOPjCpxy6aYN+2wFEGcbEXRENK7vz9r5RmDuynN135wwh0CantvMgwwvLwQg3s9u8BgCDgBdN/wTro+Qxaaj0QBB4OonIFQiDRZAIyJoBhR+RhnS6JcFwRj3ZNAU2FRSXQbxGc8oMZnAVw6JDsPnQowO7dP33BFW/5W0d+WNhq9hKUyQeHU7ZDwdm/IkOl8zVbUbQ4ytINyAEqyPr/U5OziNvABWedC6X1gAIwAgWFBG1M8T6MqE1wWPn+6EojECgEmOJ9SNBGiNKqKgAAsMohrqYw00KP/q/bw9f95/d1LAstNx2cMCOshTh4/6T+9h9+Ljpj5Bzs2HAhrItXRPgXWn5ZbNsJstC/z75lsBwZC0Df+0xl+KwFzHOSVBAEJVMKyBETESsiThVxOU21qgq39LDC/Hw3N7qrCJaaH6fAwDMBgeHyY/d95Y7sPQIAwRlAdBBIyxed/REi6irK3tGYg4EFJjCYPdzA5L4WLrvgEowNj6KTdKC1HkA3gCAQ7Pb3Ype6culFrlO6Zdzt7+0xe1c/RN0Im9ioR/HoX90eXvML74hNOYB4PtKjn4/8u/PX/qGUxC284rIfQKBCWJecpGXX+5Tytl4EoK43QcDCmWhTryLI5LP7PYBuK7+gNIgAVg4wBGICSMiUwlBTEAUq9CkcO0449CQpIGQt15ilWa8z5uYYmerweeGWSzZ40axCB4+kWt1UK4+N1ev1zfWhoQ310ubNdYRhnddgOLJSCkknxeP3P42d2+q4/PxL0UnigXUDQpTwPD+Gw7IPIaLMbFynCBghIhyWfXieH1uT1h/InIGxyUcJ7puixz91ZxhW9BHjA9h5lOuhPPKXd4UP/P0twQXbX4mtY7uQnrTw50iPn14W2/GuRz9z+fERDj5PHl75hVfON9EM7tlUqKBCDQo0ololKo+MROFQKQor5agc1UJTLgdhUAs4qgfMrIeYNcbGFDJ5XVzXLOOUKu6qeHharTZ34tgnSerT1HpvrUeaeqxJ9lNmBTx2z9NIE+DtN7wNmXk2iLZZQFBIEeNb7jP5d+vZBsjK9i33GaSIcwfg2ozXEmRThmml8fCf3xZ6hyxhpPt3FphyhNnn5tUtv/RX5ZHKRrxi1xvhvTvFsH9PwypYMPOlx+xfKvwOnlwm8LQo8KIZYgQSCCTg7DVkSAjoyEBHGrqkURmpRtVavRQND0WVWm1BCVQr5SCsmUBGRw0z62HnDMbHu8LffT3lyMDLLgeXWRCEBgf3TuOxBw7ghmuuxK7t56Adt/NFI1cWASNCGc/6h3CP/woqNJz1A9dIsJYn65tWaBj3+K/gWf8QIpTX1FpRotDSbcTK4dC9z+p9tz9poqEgCwnmt05HkK986E8rM/v307UX3IhKOLwief+LHv6evvySlj9/RSb0QgxRWesuOhf6UCAhsjXOQwIiAkICRQRTDrOtFFC5Xi/VxsdLQ8OjpUq9Xhqq16NguBypWjWslsvBsNZBaWzMMLOuO6exefNywn/SF7zGCmCNBgERICK48yv3olYN8MF3/yi8H1xSEINRoirucV/G/e4WVKkOAOuiO9AtQ5XquN/dgnvcl1Giap6wsqYFA4WEc67YhcQleOjPvh7lX4O9R2U4kFs/8snKY1+701x+9uuxY8NFSFfE8bcY5+9P7Om2/AIPyVt7pkXTHoHkW1Z2ighUUgubKmtQiWCqIYJqhKASqWp9tFwdHSmXx8fKtZF6KaqPlWpDQ6Xq0FBUqlZDXS6HgdZBeXxcM7Mes1bjyG4Alvl8QqyWAOZ3tZN/DAEgnSinj2HRCbhqCAuiUojnHp/Evd/ah3e/+bW4/srrMNecw9Jlo1bwnAAMAtzmbsLX7aegYBChAiBTEIuOpMFui2krmYBHqEDB4Ov2U7jN3QSDYM1tE601Gu0GrrnoavzSz/0sKtUKdn/mHjP3zIxSgUZlJJLv/vHXozv/+DPhmZsuwtXnvAnOpyty7t5+f/cbyRN+sv6/X2j5mXjB3M/c2wAiAkU9Al/W0BUNVdEw1RAxtZFNTz6EcLR0aGj7qB2ub6zURkejyuiGaHikXopGxqPS8HAUlIai0tBQYCqVIAwCw+UNxnuvN27c2OsLOKVWa/WccERCRNm9zJ4VDxk/m2fkr36doyw9+bZ/vBvnXzaBn/+Rf4VHnn4U7U4bxpgBRAQyX3CACPe6m3FA9uAafSMm1NkoUy3vU7qemPPKIwA0CAoGijRS6eA5fhR3+y/hBf8USlTBEYksqwwRIU1TbBjdgJ/6P34cWybqOG/XZbjr/lvp4T+7NXrzf3xP+/Y/uKX0pY/+SXnz2A68/pL3gSUT0lNdNWqRnlTdnnTeTPgFQpwJv+IsnGeQKwAFFajs1SgoozOPP1GW9GMCkNMIaxUYhHCBsZVNkU6b1liXwqctSTqRBK2Q22GbldE+aYr32nuZMb4UJZyaqvJx3N8NOOlQzSAVQE9HimS58jleuwlBhAVhFODQvml8+VP34P3/57X41z/6s/g3f/jvEARBts8AlIAAKFMVB3gPPsv/DZtoB3bqi7GBtmKENiGkUm6Wr7QayB2SEmNWDuKw7MOz/mEclOdAIJTXgdnfHSeS2BT/7id/GRedvxXf/PR+jPJZKKu78NTn7zOVzfXSlz/6/5WrlRFcd+H3ITSlPOR36pZbv/JbOoAnt9LyPj96hT8kUKCgQgUKNVSooXIlQDpLfQcBxkRIGzFMNUKkyoiGw6nyeC0MglR7G0vciaBNS2wYshjjFeC1gTcz4lqlxIfGeROXXNxq+Y0bN+pDhw5JT4FPKiy4SgK4fGbPWi+dxMwolUN895aHccZZG/H+t78WB6c/gv/y338bG0bHAQxCCWQmf5B1g3BInsd++zQUaZRRG2jmHYHg4dBBEywemgKEiBbKtJZ0hf/wzBQ+9qF/je+/8Xrc+80pPH7HC9i2+WxseWEnDj/6vP6nj36iPDq8Bddf9G6MVjflwr+CPdmu+U9YMP1FOG/189i/YogGRAMU5MIfKajIQIUaOlLQgYLoEFAGpAlKeRhDSHWMqFpBQBGCrcHBar0SJpJq70veRAknpZCTVuQFxhulHLEEqHPAmHN+PtESBKZdrXpOEo91aAH0Z44IMAdgqGsBdHMkBYCodTEnIMEEGl/71J0Y3VjDB9/3HhycPoj/9aWbUAojaK3z+eRWlq6QBwgRUgSBwCJFimTFz9ULgRCilE3MAhmYsnkxKKXgvUecJvjx9/wofvS978buhxt44Ev7oAxBK4Odmy/Bc1OPY8fGC/C6i9+LMCjnuf4r6bPpT7BbTPJZcAQSA0ogmjJnX0CgUIFCAxVpmJKCV1V4qqJSaSMsZY7JxI2gY0N04FCulQispbJ1ZCaqliLyCbwPQxNFrI3xWumQAKfIW++cdZwGKqxZU7Ym9t5VKxWVdDoKExOEycl15wPoT3jrj6msK0QE2mikHYtP/9HX8N6PfA9+7aP/AjvP2I7f/Ivfh3UWlVIFzg9m1GCvEK7OCLz+dNW1xWiDdtwGQPjYh/4v/Nh7vxdPPNTEHf/rGbjUwxgF5yw2j56JK856Ay7ZeR0CnWf6DWSRv2723uLAngUl0B3Ek7vgSBPIEFSgoCMFFWmkGMXE5j24/MJ/xMTGx1AuZdfW6Izhyb2X4tnprejMj1Kl1mkPbR2ZI4OSqmnnXehT0wkUKUdEDt4F4n2QpmlYTkZSb61Bp6Q5TFWr2dQ8NKQ2JwkdyAp90lmBq9QFWGzpKXcGApC1DkJ2ERaY0CCNU3z641+D/fDr8SPvfRvO3r4T/+FPfgtPPf8UhmvDC9bAYJcUWx+COUi6Q8O995iam8a528/BL/+Lf43rrr4Ij9w3j7tuegYuYZhQQzjPUYhquOrczNvvvFtZsx+ZmFPP+67ButANWEjvxWIuv8nN/0CBAg2YEl5z9d/i6sv+Hnr4YqD0IUBtAUAou8ew6YzP4ZJzvsKfvvXt6juHL95T2VJJ0gYHxgTsrNVKK50KAma2zqUmcN6U0or2SWrCuKJ92anAtnSpVFJJq0XOuV5n4JE5zCfAajgBF+gAUur5+5p4/4+CcDZPoU0cPv1HX8P+77sCb3jnxfir//Lf8Oef/iT+5sufxuz8HCrlMkITApAF73PB8SEiqHwimNSlaDc7GKrU8BPv/SB+7Pt/ECPDJdz1pf149JZJAIAJ1JJVnASC1MY9E8oMAul5WTqQB10lkOf3k+5aAAoqBCwP44ZX3IRXXvcZSPk3weVrkTv/syNEr4CUfxD18t/hQ9/3cQw/NbT//vQ81MLDynmlNanusGDFXrR3qfZJqpOgpAMdaR2FykekA2NUh0tU4wbFizMInTSrYQFkd61FgkrmRVlPgt+LsEBrBRHg1pvuxuQzh/H691yNj/3kB3Hja78Hf/OFT+P2++7C5OFJKKURBiECY7JJTkCn+CheguQONWZGai1Sm4LZY2LjBN72mrfgA9/7/bji4jOx75kU//QPu7Hv4VmEJZPNASH9PUmsysSey+QALgYFlwTeCKQyReC4jM1nPI+rr/jf4MrvQJVfAeobs0PI1qT01feTknnceMZNlz819drHCGWryRGUIhFWxnvlQqO0i5Q2Wpsg0BQYRcZorZRyYUhSapFQjRDHwLZtwN69J31jVlIBHPnElvOqAEK5E3AFz71idCtepVbCE995Fs8/uR9X3nA+rn3jpfiNX/w5PLt3HrfdfQfuuPcu7H7+KRyenUaz1YRn31NpT+bSXmraI1sOVyuNSrmCiQ2bsGv7Llx35bV47TWvxpln1DF1ALjt7/fi6bsPIel4RBUDYWRLe6357eivol3/NZYoAaWAREo4a/u3oWvbwKUrkQ3YWy5Zj6HBxNHbpRreNHZe6b5ND8TX76nqwwowJNqRVwHpMCBqa6LIkDYaOlCktabAGIo5oBIztZizOQS9X1cWQK8E9EYCBKjlHzsgqvYqgnUJM6NcjeCtx+2fux8PfespnP+KM3Hpq87HD7ztRvzQO2/EzLzH3slJTB46gCeefRLWumzl4XV7VatE3oIHJsB5O3dhy8ZN2LZlC0aGAwgDk8+muPlTe7D34Wm0ZyyCkkFYNrnJv+aSvwx9D7R34Ho2iwVK0TxEb1z4vPx15N+rEVBQQ0XNhqK0KCiBz/xj0Axhof6EVCK1fK3S+pRq20opgH4HRO/7vIAkIJKYiAmJ4Dgh9pV28pwMzJnZVqmVELcS3P1Pj+CBb+7G5h1j2HH+BM44cxM2bd2CszZvw5uvuwrqGIPnXo46QRhoN4FOCzj0VAOP7j2AA8/MYXayDRszgkgjqgYQFggPfjboF0dPaahPoKXnDQOkGHPNCZC9B8KcJ9h3h+/34gFowO+Fj2dkhrc1A04ocytzPquYCIhYRER5w8QsxCzKe3HMTMpKrJSQUl1n+ilxqgrgWCq7z35aMPu7BWc6xqTv8+0ZEI2dYvFWAAFYBEorVGplsDBeeOoQnn/iIJQmlCsRTKQxsnG4JxWVFnp+C9Di5+wtLdmz56ue3x25z6KrIf8//1F/5yOzUFXf73vP33cuWlrm3n36f7/kWD3HWXpdmQJoTMdgJ0g7HuIBpRWCSGWCL7Jul2vP7mV+LQs3l9CdARic+YzYAyZo46lnX4nrpv8O5fLfQ2rvz3/peySEABh4gHX8P9WBZGzv453LD1QwrT0oZQ9m8exZvHeOvXPsOWUHzxbgmL0op4RSElJK0GhkFsNefUrd6UE5AZdJCFp0BNJCItCRBRcRaK0xNT+JRjCG6vAImLtJT2uIIFtggoCwFOQrHAHeMZz12Dd7CAuXTd1ofo9COK4CoGMIU48AHkUBEBQ0KWgKACKIePg8h50WarBaNE77lcOyCoCO2KdvjyOVXt8+yigoRQgjg8UZXte54PfUXMrcd4v3gHMlwAJ4ATuBkQTzs6O49Vsfxtve+v8CMgMufQAI6r3VlpHsIZ38uUpmbku+0Py/b1a+w6IY7Nh777xPU+/S1HNqnXPO+ST1zlovSeLZOu84Zus8q8TwvNacJazvOaXrHZQPoPt+WU9KXg2YSC2bYpd5XAl7p57CeOUSKB1mzclaK4GcbPrn7D0RQWmCDnqmMad+C2BwCgAAAgowbQ/jG7NfwqjZgC2l7Rg14xg2o6jqCowKciOT4eAAYUheRtV1Vp2kAlj0zC+vACQXH+m2nIu7rCsW73FeXiLQkpm5s8+Sm/3CALxAvIBTICjP49EnroF1v4rXXPMnGD/jc0DlekBtyq7bP63Q/DZeaA7t+cLUL9y2J912uKZmKfU69T51Pk2d7cTOJrFL49i5dtslnY7jVuJ8ap3Ytnfec2otd1RHSCkxxvTLz5omAi1nhXa/zx2BQwIisUoxAA6AABCW7qRrQD65IiFQCqlLaN/hp7Bj88U9wZj1V3uy+SB77v1yRez/bqX2gQCK8GDjbjzffhr7aS8eaXwXRoUoqyrGgg3YGE5gPNyEkWAD6mYMkSqBSGfDWvN57AXcbdOXdjlWgvX3yI7LgurLFYGSHqXgBeIBcQKxDNYEKAWjG3jyqYuw//DHMTL+N5jYdCc2jqYCIeKxoQcf77zj6TunX/+MCVKuqGlqp8oSUmdt4thaa1Ob2nYnjdsN22l3rI1jm/q27aSJS5xznKbOOu91mnrVaPCBarU7bXif0/3EWQkFcDw/QM9GghZxEiUMQE379Gkoowy06jrPy0bDs+BgrFDSGvOdGeybegrbNpyTdwUKejEUoOHm8GznCVR0Dd3Oh4DR8S085+fwbOdJEAihilA3YxgNxjEWbsamXDGUdRWhKoMgsGLh5eV8n2lJHHIxPZtBokAsEKLMn+cBsQxRABPBkaBSS/D8vt34yt1V6PB7uRSGSu8o3x69Ysc3tU+CkegFrUVLm2EhcOKttc6nYm2SxO00abfTtNNKXLudpEknsa009e1OKq2W83HsjG+6mbbhUCnuiQCsOx8AcGRIcMERuC+O3Vi5XHvvQ9/4m9uu/J6Lt4TV9yTsiQCwouT2+f1/fFs7jM7TW/+NlcBPzU9qQLBtfNfAF3o8nWAwtDJ4ovEgOr6NkiovGdWnSENDLxn4M20P4lA6CWk9iIAClHUVFV3DkKljW+ksbCufjSEzipdn3IIAktzUX2oFCBRIstwGcG4FOAAkYBIQHEJTxbPPP4bdB+9FVI44lLJSQ+bh4QvpW6bzZERkuON0orRxzOyJvHWpt8I2tUmauDiO404nto1W3O7MJXGrnTTjRmrjhk1aznpml6SpVy3vTckw9uw55XyaQYUBgUXh71ECC90AnhbhaWnrs++46d++feKCPyZCqIXMky6RRw7tb2Fz226Z+8B5w9j4PihxU/P7DUDYtmEXuvOwr/c59geNhkbHt/F4+0FoZZYZ0ru4ZAWQtWaBihAA8OJgOcW8mwULY8iMZH9T4cv8rmLBzyKUzU2YBfQyBapy/x+IMyUAAYERmiqeee5BPLb/boTlEmsfKldtT1bPGfpMY2pOBTpwKgi9AKxInJBycGzF+9TaxHqbJGmcxEmzGcdJO4nbjThuNtLO3FzaabdtEidWkqZrx7EPTeIPBOVe0385f9sJMWgnYJ8FkEVN82gAl0T00PDGyucnn5lGKAYIA4gON42OlOdb49XvVr74W1e331GuydjboWKemp8k6xLavnEXQlOCY/eyVQLZPINlPNW+Hw032zORyFJowYkludBbKCgMB6PYVt2JnZXzcUa0A1UzDORdABZ+Wd7V3tDf4ufMK8K5u5RFoEiBGWDnYCgAO8b9T9yKPVOPICiXvIjoDhovmIv1/2hN20SZUAVB4MkoVsp4UuKE4QC27Di1NkldkiRpnCS204qTdjtOWq04bbRi104TabdSjznrmaxqtbwplRh79/b3/U+KQY8F6O2j5G78eQaGCEQqJvJInR2OokDCQDGzMmLQ8GxBQEmqwX2Vz/76Fa23dSoYfR8pkvn2ND+57wG1feMuDFfHIdwNdb28qqyCgpUUDze/mwv5Yj04QuhlUei3lnZiZ/lcTJR2oKqHAACWU3S4lf9qMHMini4sNVvzyIwoKBKIKBA0hBlKKYSmhtnWQdzz9D9hqr1PonJVIKLbNP8ETySf1G3TNnEYhOWSj41hQ9pDkycFR4AT56yHT33iU5ckaZp2YtuJk47txPF8J/GtdpJ25tJOmqau5W3snA/D0B0IguVa/5O+3pWClnnNIk2Lrzrb6grwBhXWZRHDHBpAjASBEeEgEG3EGCOiAqNV0Az2zl3afPc/G+HNPweQcpJ6AHrD8AS2jOxAEESZJ5u7imBp2G3ZMNxCSO0YYbiFmBv1/ab3KP37YOBhQEAQUgnPJ0/jS4f/DgEFuSmapSJ6cXBiQaQwrEewtbwTZ5bPxUTUFfq8pc8XYieogYUB+/dZ3OXIY9Ox9jnh53fsfU7k+cnCbV7sQgkYXjwIgDEBEt/Bk/u/iwf3fAOpJFyKKkobg6TS/mbj3IN/HYXVIFCRNmXD2oRsIsNEipUhD1FOgS17WPaptcypsy7xSSu1rSS2SSttN5IEvpO04zh17XYaW2tNu+2mo8hhctJhqff/pJXASjeb/cJ/DCUwpFFlDWZTkpIRYSPCBmFgRIwJhI0YbUS00SqIWuZg85z42lducrs+FqJ0hkPMnj2FpkTjw1swPjyBKCjlFkF2PxbTiV96CiCgEF+e+jSej59BSCGc2KVCX8qEfku0DVXTbem7Qo+FOfRONRHopacAcgdgPo0lS5aEprWC1gFi28bT+x/AI8/fianWC2KCkENd0kwuaQ3N/vXhM56/pYKhShAF0KFmHYZiTMAmMExKsVLwYHJew5KIhXXWO5cm1qYubaeIObVxnMSpTX1nNrXe267wR1HkJicnPRZXDT7p8F+XQSqA7mtX8PuUQF0DXqPCBiK6JFGmBMLACLMJxGRWgdZGRBmtw7ClpzvjfMbGs+Nrfq4sQ28ACSynzOwpCsq0YXgCI9UNiMIKtNILyS9LikfHq0D5+559BqIA+gXghBWAIKQQU+4w/uHgX+StEmHYjOCM6MxFoe+a95Iu+Aa65v3RhLtQAN3VEAmkFBRpmNy52ujMYN/hJ/DI83fhcGOvKKU5NJEmMkips/tg9Zn/b6b+/BM1GR3WETF0JGGoxRjDFARsDLHS2rNorwEn5B2IrTBbGzsLz2li21bSNOWE0ga3rXHOxdZa3Wplpv+BA3nwccHZ031dF12A/uPRMltXEeSLGwxrgHW3KyASaREO8q6ADsQYBMYIsxForVUQeko4pqa/wL7mtWPujH8RSHmnkM8UgXgYFVAlGqJ6dQzDlXGEJoJWIZTKwzkix6lAQDdldqAK4GQtACUIEOLm6c9iX7IHZ5fPx/by2dgcbkdN1yAAHOxCy0WgnhWPji3cg1MAfedfQQWwmH956gpAkQIRgSGwLkY7aeLAzLN47uCj2D+7B61kjrXSCHRJaRhYxHON4PCnni3f90VP7Kq6VmYSpyMNo43AaDGkmAwxhYEPRDwr7ZVox8Y5bcUxnJUU1ktiWcS6Tsem1ro4TZ3udJwxxk0HgUcm/IylrX+XdaMAeo/Z+9o7dVGfEsi7AiK6xJkVAIjOlYDJlYDuKgFoFWhRpqVm2hUaHzo7uezNNTf+/gjlM0GAz0xhFhFlVIDARCgFFVSiGkhpVKIaFKm+QRrZa68f8agK4IiLPZYCWP6WHCko/eenvpfFvRRpdHwLh9L9mChtR1UPQSBwufc+O85ywtR3/v7HdIRg9JZxaXmWHqtfARx5JixrAfRf23H2OYpwH3mk5RRAT5mXvReZkpppHoB1CeZahzHbOohmPIc4bQIABzpSRkUACFbi2Zaa/fzzwWOfnwn2HBjy4xVoIZDyBgAMGERChthQwBQQk1KeiFgpdsTaM7NTzM5p45zvOO29td5bnWjfManT7bY3xripMPSYnOwV/BUT/t7rX0mo733/1rvKadchqFEVDWad+wN05g8IdY8SUMIcCLSCFqMlm7y/FR1qD9mJ0a32vGvqdtONBsHlBqUKIPBweaqrX4iFqxWfS26Zb5b98mgP6sU9v66JGlAAJw4eDt2Wfm15EddxYruqfgEfDItpK8w+T4lW0MpAqwCGAhAUrMTsyT3aVDNf3W+euuNwtPuFKBkthzo03qeeiBgghnFCnhiGGAQOiJgoZCLHTmlH5JiUcsprp5TzqdVOG+fiNHWkFOtOx2mt/YwxHocO9ff3V1T4s6seDMup9V4F0GcJ5FGBqqjcKagzp2CgEYoWYR0i0CLaiJFMOYhWMNpEEhoHJ61wOoEYdUa6a+uY33YVef6JktSGApRhEFK2tLQsGytfuUvOUkhV7n9YGppc/la/6AdAWJiokrqCv9ayPwAkHzXYTcvNhg4PNgu0m/dPWsHDIZW2JKrphfCpGTP1Ty8Ej+/1er4TpfUokrLxxN4hYfLEgMsUABETiEGOc6WQKQciJuUcETER+SRNvdLakVKeOh2vlPJKKT9njMfUVFfou6vIDkT4gdXJA6Ce1/7v8gubI2DYo8VAhXyMGCWUAFiBFUEQIBULQChwAhgDgJV4ksR0PETrarqppIXNweDA7gP06BWGUC0Hw1ILx1Xka6gFm2AoQuhqGFiaKxG8TWHjNpTW8N4Ls6cApUmD8n4BmxU5+UtQ4HOIQN7DVVNqnkukYIwBs4c2EYJSGceYQuLUTiwEazqwKkY7mUasZ9H2c9KMp4yHH5Fg+JHIVUaNq1Y8pS5VcQJHTFAM8kxgti4T7kwR+Fz4LYNyJdAmT6Q8Uew1kVfe+yYRwxjGnPbA9HKm/nIJPyt2EwY9H0D/d12606V0LxDAPIBhoA2gwugqAREGWQsEAQQOFgEHzjMCoyFe4IwSMHvdYa9MUmbe5F3wU0FY0uVaTay0UN42Aj0WQISRojGgS84vUgQzk8+hPXcYQiStxiw5Z5/mSv0XxbsqaK2X3V3HCBQF4ZxqNz6owOdWa3WvtdFBVMaG7edBzGCXVRcIFBmYVgnp3haMBKpCI5J0Wm+DVV/mgO5M2Zbh2IMUEzkGeU+O2EJ7UpYBYrLWA11loJko8QCYFHGHyENpDyJGQzFwhOD3C/1ABL/LKs0KvNDi93/fpwh6lEBVJOYFJSBkbbbweuiURcCwTgIIiyFNECVeQ2luOZteQYRaGEXMzCoqDWFkZDvY+YG1Hr0oZTC68UwkjQYIoFJQRds2rwh9NCGozAtziHU8F+LaIopcUPHcenUYlBCZCnnnMDK+A6Gpgl2KQZo/BAIEqFU3Ih1uYn5qEkFY4jRpK+/jy5zom7VLQiJlQcTkmAHlLdm8tVeM1HoilSuAhOMFi4AYbWJAeaDRb+L3x/X7w3sDazRWYzTg0d4fxTGWK4EWA1XlYo6lTFDMIYgsYEEIyIBErIgOHDEgCsZCudB66u0oCkipvN8vq2I6L8TcibI15bLLFGJnAUnzjmyhAJZHKVDqIQLKJ+QmgFR2L1en65OtBbi46pAAueeFHFsiZcl7C5C35BndiW1Sm7X4lHn7Y8QMIo9O7hxcKvj9rf2xBvYMtK6s9uq8XeHvnTGxX+uhRwkIqgodEYFKpSSRiAiRtRARojBkR16JBAoOMM5ZCnkwa3idGuLJOoa32ViywgJYHlGsJAUG7O07CQjwlDpLmq0lZQGbOflIeUpTzroEWWsfU+xBKm/xiYFmb0vf+345oT/lAT4vhtVyAva+71cCPQOFFvYTYF6AuqDFkiULQWIkUkJJZ7a8aFjLIqIpJCVgpBRaEDu9/lbrEfJsCcaKrO/p0NcSgSgCWwGtJwUgAMAQTpRLA2JHpC1SzURp1ufPTf6Y4szUJ+XR6q4hPr9cq380BQAsFf6B15PV9AH0vl9OCaiez3kFmANQz25CWwRVkVgSgYgqoSTIphdkWKshDKXJLtacnvQPonx8wOBZXLpqyfkUiDwhsQCvyHTOL0lEFFHFAdIzwfpi9VmVZdiWX5UkO3HHWArblogd8rg/kcpb/Hzl0HamDDLhnzuec29NhR9YvS7AiSiB3teefefyrsJwbg0Qoyoq5lgAUAklBQgDxCKiyOJx0ZI4l5pSWJO006K4NY/y0OjA48hAllE2N3MA3jsoZdh7RwDttZ72CyMAlEWhAJZH2OjUNsnox9i7VzCzAynVmj2Ecq0ObcKBF4GI4GyCTmMGShs4l4KZiVg9WEObLSlLpOxCiw/IooNvSavf379/McK/aqxmRLn/XCeSLNSXOFSnrHXg7LsKawAEESoDijkMSglm0yp+Xyn1z6NSxQVBBFIK1ZGNCwk6A7vAvPK05w4DRIg7bW3TmITUz3ccbgqUjGT9xILlEBGlnI9NZM5m7z9nTBiWqzUHEZSqdUSVocFbAQR05qdh0xjMLHG7EXjvHxVP35v5bjoSE2XCrFTWn18w90nyVv9ozr1e7/6xQnyrpgxWO6XkxSiBYyiDusrM/1wRVIUgoiCiQeQjH5S1we+C6F1doZdVnFBUaZONRGRvReiPSNTveG/Lhel/fEREG+PnoYJ3CvBritRmIpVNCLtKU8OTUuieU4B7Be6n42bzMZTLZRA5EOVCD+kR/N5W/nitPrAOhB9Ym5yyoymB7vv+DViqBJZRBN0ttwraymG0aUM3coNmuR4ipruCRTcYeIwRAad6T4QZIJKGJrq52eQHo4iGAaBQACeGiOgw4Tmu6q1e5C0AnQEFqJWpr0c8g26zTL3CyQzW9FDi7ZfRbndQqZTRVi77PfVsc8u18sfz7h/N7F/1+rFWSaUnogR63x9t61EM9R5FILliaLUAWCz6HFTfeY5WnpWAMDRUgrVVZGZ/rx+k4NgIRAy0TtBqtTCYRJijCV/vqwZqtawuKd8j9P1CfSL9+2OZ/Mt9XhXWskIeTwl0X1+MQujZp06A17lHOf+b9Hc5sOT78slfzLIsOIdAqK7wsV/qtCCoiILIyg7f7HTfHGGNSd/3ubArn4Wkj9mqH0vo+98D60T4gfXRIp2KIuj/27H2z6kvL/wFL1N6FcHcckJ6rJb8WOZ9r9WyLoUfWB8KADhxJdD/ejyBP9ZxjnbugpcPx+sG9H93Iu+P9ftjnXtNWE+Vf7myHK2ffixhP57QFwqgoMtyQngiQny816N9d6zzrgnrsfK/WEWw3OtyxykEv+BYnKiZfiJCv9wxjvf9mrBeheBo5ToRAT8RwS888gX9HK+lPpHuwtGOc6zv15T1LgTHKt+JhPGKVr/gxXIiAvxi+vPrUvC7nE4CcaLK4ET2P5n9Cl56nKhwnkw/fl0LfpfTsfKvlGCfjtdeMDhWQqBPC6Hv5XQXgpUo/+l+DwpOjVMV2tNO6Ht5KVb+l+I1FawPTmthX46Xo7C8HK+54MR4yQl4QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUHBS5j/HzLjfAyvCi6/AAAAAElFTkSuQmCC\",\n      scale: 0.96,\n      rotationOffset: 0,\n      fallbackColors: { body: \"#8b5cf6\", dark: \"#4c1d95\", glass: \"#a5f3fc\", glow: \"rgba(139,92,246,0.4)\" }\n    },\n    {\n      id: \"car_lv4\",\n      tier: 4,\n      unlockAfterLevel: 9,\n      name: \"Si\u00eau Xe\",\n      perk: \"Si\u00eau t\u1ed1c (1.8x) \u00b7 C\u00e1nh gi\u00f3 Carbon & H\u00e0o quang\",\n      speedMultiplier: 1.8,\n      image: \"data:image/png;base64,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\",\n      scale: 0.98,\n      rotationOffset: 0,\n      fallbackColors: { body: \"#eab308\", dark: \"#854d0e\", glass: \"#ffffff\", glow: \"rgba(250,204,21,0.5)\" }\n    }\n  ],\n  objects: {\n    home:   { image: \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAvrElEQVR4nO2deZDcx3Xfv6+7f7859sJeAHZmscCSECFRoi6Kh0QxjOxIchQrdmKTLpfLTiwXdTqSHCdlO1EFRuWQndiSbIviJTqxKylZZJySrIuSTZOQRJGUKJn3JcomKRzEDew1x6/7vfzxm9mdnZ1d7AILYGbnfaoGs7OYmZ3p7vft7tff7h+gKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqiKIqyURGAkN7qPyuK0g3sBkz95zsB23ivKMoGph7ou0dHe+s9/x+MjY00/p/SPejQr4u4F3BvA/ynC4XX9xvzvysi9zljHrYi/21W5MMf2L///94J2BsABiAX+vMq5x4VgC6hHvw3j41dExvzJUc0yESwREiYERGhwvz+G/fvv/VOwD4JyJ5UCJQNjArABkcAugswNwDhtmLxxgj4jCdyLBI8sxERia2FAJI3xpZCuPW9Bw68v/ZaQyoCGxpz+qconcruNIDlBiDcXih8Mia6LQGsAFz23o719tKukRFT8t4AsHPMIWfM+z5bLN79mYmJQQJ4N+Au9PdQzh06Atig1Oby4feHh/tGstlP5Yx5zzRzAGCqIdDkpk24ulhE1jk88vLLePTwYVgiEJHvNcaVmb9XBX7pA/v3/7D+Xhf6OynrjwrABqQ+3//ExMRYXwhfzBtzxQxzAiDyzLh0ZARvGhtDEEFgRj6K8OyxY/jugQMIIjBEPkPkgsjxKvM//8DBg/ffCkTvA5IL/d2U9UUFYINRD9SbxsevyIl80RCNVUS8iDgvgjcXi3jVyAjK3gNIGwCLIOccDs3O4p4XX0TFezhjgiWyVsQnwAffu3//7XcC9nqASVcINgwqABsHEoAI4NsKhRsc0S1ENFhNk3024xyuHR9Hsa8PVeYlFc8iiK3FdLWKb/34xzg0O4ustQzARETwIntu3L//d4E0t3AuVgh2A+bV14PuOsPX33mXitNaUQHYAOwGzO8CIIBvKxY/miH6ZAIgiHASghnK53HN+DhGcjmUvYeh1tUuIoisRSUEPLh/P/7h5EnE1goA7jfGzjH/6dFy+aO/dezY9HrnBXbvhtmz5+xF5frrYe+6S/MVq0UFoMNpDMRbx8dv6ye6caqW7EtCoC29vXjb9u3IWItqCIuCXwChpjYgIjDGwBHhwQMH8PTRo4itBYCk15ioxPy9U0Q/9Zv79h2v5xrW67t87E19u6LYFKoBwrK2thlb0Mysf+IPH5s9fK5GKBsRFYAOZjfg9gD+4xMTg5tD+FxE9M6SiAfgKt7jlSMjuKpQgABgZlBTz+8AJK1EAOkvYmvx9LFjeGj//vkVgiyRY+CHc8AvfWjfvu+drQjU9yWUr9j0h5bkgwDFZ/I+BIBIDicBv/P7D5/6UxWB1aEC0KHUA+8zhcIbcsbcERG9YZbZi4gLInjT2BguHRlBYAZjoaJrvT4igHhw8LFQKm2OyuWt1WWEILYW+6em8O19+1CuJQczRJZFTlRE3v+BAwfuPFP7cH24/ltXDryn15k7KoGlN2I+k92JAkgpMTYIRNi89uMPn3hivaYVGxk1eXQgi2y9RF8ywOAssw8izhHh6mIRlwwNoRzCwp5fpEFiAHIAZPPmB3KTk9+fffTRn18uaglAxXts6+/HT2zfjm/v24epSsXCmGCIBnuIPn97sTh4wxnahy+9KxUMI/LLFS/hFSOJjPWK87w2BRAAkQGeOmKTo3NR5Mn/PIAncB8MdBSwIioAHUTd1vs2wDfaessiITC7bBThH09MYGtPD0pNyT4GJAaIiapSLN6XGRl5KZTL+dP9TUOEkvcYyefxUxddhPteegmHZmZsbC2XUvvwLbcVCm+44SzswwIICNYRghfAr3EIIAJYSvMA0FWANaFW4A5hJVtvxXs7nM/jpy++GKP5/JLgB8BZgBDHx6PJya9mNm9+ISRJFkSrChZDhCQERNbiHZOTuGR4GOfCPlzPPZzJrf566LR2TegIoANY0dbrvblocBBXFwqInUPSItMfAyZksweiiy6618ZxiSuVHBGtqZcmInDqEsTVxSLyUYRHDx2CJbJzgO815p0UwtdvLhbVPtxB6AigzdkNuBuA8ImJibGhbPaebBr8CQDrmek1o6O4bmICkbXwDZl+SW+SBUj6+p6LX/nKr5K1CXsfw5gzmhcT0mVCz4zLt27FNePjMKkwuBlmb4muiIEHbx4bu+YGINyrHUzbowLQxtwKRHsAf/P4+JWbQvh+RHTFTJrpjxJmXF0s4qpiEQkzgkhzsg8RQGFk5LvRxRd/CyFEEDGrHfavBAGYSxJcMjSEt09O1sXHVUSCEA1ljbnvtmLxxrcB/s50mqLD8jZFBaANEYDuBOz7gOTWQuE9OeBvkHr6g2d2zlq8fccO7BoaQtn7JZn+CCAiqtLY2H2ZiYlH4H0EAOsR/HUak4PvuvhijOTzqIRgGeAEsDHRbbcXCp+8AQgEyG5ta22JVkqbUQ+U2gEeH80Yc0ci0peIcDUEO5jL4e2Tkxjv70eltsxXh2vBL9ZO2+3bvx4VCs9ypZJbz8BvpJ4c7Itj/OSOHbho0yZUvDcCoCISeqz96B3F4h2/PzzctwdgPXOw/dA5WhvRkDhzt4+Pf6aH6MbpBVuvGe/vx7Xj48g4t8TTL2mm3yRxfCyzc+fdNo5LXC7nz3S+v1qoJgLOGFw3MYGeKMJTR4+SM8ZOMye9xrxnKJu97BMTEz9zw0svHVxv+7BydugIoE24t5bs+/jExOBEsXhfNg1+D8BWvKddw8N4+44dcNYuyvQ3JPsM9/Y+n73kkq+Qc9WQJJlzHfx16isECTOuKhZxdS0vISLRDLOPiK7YFML3bxofv+JtgL8ViM7H51JOjwpAG9Bo693KfE9kzDVzNVuvbwoqFmnM9C8k+4aGHol27txrjAlgtnSegr9OPQ9R9h67hobmxaqeHCSisZzI128rFG54H5AIYJ7S5OAFRwXgArO7Hvzj4+/MEN1jgDeUmH2oJfuum5jAa0ZH4TmN58ZknwXIECXYsuXb8eTkQ/A+YmZ7rub8q4EAVELAeH8/3j45icFcDkkItirCTDSYMebztxWLHyWAL70uPcPgQn1WRQXgglHP9O+p2Xp7gLsZGGy09f7k9u24aHBw/vSehtdyBBCIqm779rszxeJTUi7nQSQXMvjrGCKUvcdQNot3TE5iS28vkhBMEJGySOgz5pO3jo/ftmcvPAFCosnBC4UmAS8Auxf88uH2QuGTEdFHKyIMIlS9t1t6evCPJyaQiyKUkqRlss/H8bFo+/Z7XU/PSa5Ucudrvr9aTENy8B2Tk3jowAE8c/QoZZyzU8w+R3TjZ8eLOzYH/tlv2dlpTQpcGFQAzjP1TP9nJiYG4xBuyRlzwwwzA6CK93TJ0BCuLBTgagHUbOvNACbk8y9EO3bcT3FcDkmSOd/z/dUybx8G8OZiEQOZDB4+eBCWyJVS+/DbD4PuyVXsQCXDgJDRvTznFxWA80jN1us/MTExFtdO651mTgSIAjMuGx2dP63XNyX75vfwDww8lZmc/A6YLXsftWvw16lvz0tq3y9jLb574AB8ah8OsaWrtx3L48XBEsglpPF/flEBOE/UT+u9eXz8ykwIXzBEY9M1W68g7SFf2XRaL7BkD/934m3bHudKJZc+6cLP91cLASh5j0uGhtCfyeC+l15CKUksGcMioOKRHFEfA9tKoKrR1OB5QpOA55jV2HrfMTmJXcPDKCfJsrZeGR//RqZYfFLqzr4OCv46dfvwaG3r8kg+j7L3hojIGGD673tx/Ie9ICcLQwflnKICcA5Zja23niUve7/ozD4BOG7ew1+trnoPf7tSTw42rnJU6qscVjD14zyOP9ubKqcVFYFzjE4BzhFrsfVWWhzgEQMmZDJH4osv/sb8Hv42n++vFiKCZ0ZU8znU7MNwxsBmGDMvZ+FLDsOXTsFGDAnNpxUq64UKwDmg7uyrndb7pZjompqt11W8x6tGRvDmYhFeZImtFzVbb+jrey4zOXm/AXA2e/jbFQLSS5OJ4KpiEf2ZDB7Yvx9OCC4GKtMOh36wCSOvnkJmwIOrKgLnAp0CrDPrYuut7+EXoQvt7DuXLGcfrnqGdYKQGBx5oh+zhzIw0YYsgguOCsA6cja2Xtd6Dz9t1OBvpJV9uJIEWCvgQDj2dB+m9uVApj5GuqAfd0OhArAOnI2tt76HH8aUovOwh79daWUfLvsAYwByghM/7MWJ53vTxKCBisA6oTmAs2Q9bL1JHB/LXHzxNyiTmZPzsIe/XVnGPoysc7AxY/pgFr5sMPzKGZiIIV7zAmeLCsBZcLa23ixgQm/v89kdO75jrPUhSeKNkuk/U1awD8NGQOl4jCOP92PokhnEvR7sVQHOBp0CnCGNp/XGIXw9nwZ/IoDxzHTZ6Oj8qbmtbL2uaQ8/h+C6PfjrNNuH58sxCFwsqM44HH68H+VTUZoc1OnAGaMjgDPgbG29BAht3vxAvG3bY1Kp5BnoKFvv+WIZ+zDiyCAEwpHHBjC4cwY9xRIkaF92JmiprYGztPVy3dbrtm//aqZYfJLL5Z5OtfWeL1rZh0tVD2sIMILjP+zFiR/2wthaMWpJrgkdAaySmq1X6rbemOiTiQgY4GoIdjifx1vHxzGUyy17YGfjHv5QrWZ1yL86mu3DDx44gH84eRIZZwEnmHopDyeEMFiGGIFJLvQn7hxUAFbB2dh6O20Pf7uykn3YZRinDmQhxxwyWys46dI6e/JCf+gOQAXgNJyFrVcIQAwQ9/U9W7s6j0MH7OFvV5a1DxPBOCBTtZg4nIfky3QDEP5oPzLQI8hXRHMAS6l333SWtl5yAMnmzQ9kdu78JryP1+vSXN3McvbhJDDEkvVV4m0nsjfeUij8wkeeR6V2MRJqeLnSQLcKwOmuNG3eexa23nqyD+ke/ic4STKa7FtfWp4+7D15EgqGxnLG/MWtxeJv3ACEOwFz/cJViVZzpfGuoVsEYNWVfD1gdgPmNiC5pVh871pP623ew88bYA9/u9Ly9GEfqH76cL8xn7h1fPy2G4BwFxB2r+7SZF0lBhv5S67muy16zuWA/T6QAMBthcKnYmM+Uq3Zeivem0Zbb7XJ2Yd0mW/xHv7zeHWeNSNCcC4pP/PMP7Pl8tYkzVl0ZHsQERhjQMC8fTjjHAD4HJFLRL7xEtEv7tm37/j1QHxX67zA6UR6Q4p4R1b4aVjpOzX/3/zjnwLc3UDlvxUKw5uJbs4Zc/28rTeERbZez9w43wdSWy+Fvr7novoe/nbfxruBBABI68EAsMbgqaNH5+3DROR7jHFVkUdmQ/i1f3Pw4A/+DZD5k8Ui0FxPK9Vb+9bpGbDRpgCtGnDzkG7JvO86ILobqPyX8fHiKNHd+TT4V2Xrre/h5y7Zw9+uLGcfDiJultlb4PU5Y+7547Gxa/8EqPyr9PqEpvbS+v1qcgIbanqwUQSguVKWq0zT9LP5aSDeC5T/qFi8ekzk4YjoTfO2XhG8uVjEVY2Z/tofaL40V7R9+9910x7+dqXRPvxPJieRdQ6B2ZVFghBt6jPmb28qFN7/Z0D5OsDuXFglaCUCwMpC0PFsBAFYdliPpZU4H/zbAXs1YL8MzH16bOzGAaJvENHW1dh663v4yZiSnZj4enZ8/Mn5S3MpF5xm+/BwPo+K91YATgDbY8zNtxYKf7QXKD8PhPHUD7PSSABoLQQdLwKdLgCtev3Gn5t7fwPAjAEuAuRBoHxTofDveq29bS2n9WYBCnF8LNq16wt2cPBQ6OI9/O3KMqcPGwFQEQl91n741kLhzz4yMNC7D6hcCsRY3E6oxT3QerTZsXSyACxXCc0VtagSdwHxQSDsBHBzsXjHoLX/oyISGJC6rfcdO3ZgMJttaevNAoZ7e5/PXnLJV2wclyRJNtyBnRuFZvtwzbdBAOw0c9Jr7a9c2tv7N/+xUCg+BczsBDJYKgKrCfyOFYFOFYCVKqJVBRoAdDmQeRaY+eDo6ODPFQr39RrzqzVbr614T7uGhxucZUttvRFAYWDgqWjnzr0gYt3D3/4QUvtw0uTcFJFohtlniC6/iOh7vzc29tbnganXAVk0jBaxtC01iwJa/NwxdKIALFforSqpXnn2MiD7feDUfx4bu+aNcXx/bMzVs8xhtbZeAgSbN38n3rnzW/A+Ultv51BvDM32Yc/sKiKBiLZssfZrf7x16/seBU7uBNzo4uTg6XIDaPFzR9BpArBS8Nd/1xz87iLAPQ6c+P1C4Z9vNebLjuiiUurssyvZernB1lvfw9/Jl+bqdghL7cPVEGwiwl6kt9+5Wz41NvbbzwMlABhKlwpbTSWBDSICnSYArWishEVDtqE0+M3fA1OfGit+ZKsxXwQwUBHhwGz7Mpk0QbRpU0tbbxYgieNj0c6dfxUNDh7cCJfm6nYW2Yd37MB4fz+SEAwDUhEJm537+KcLhc9OYIyPA2F76+Rgq+DvSBHoJAE43fLeojn/diA+DoS/B2Y/PVa8Y9jRp8oigYmkGoIZyefxrosuSk+YaZHsiwETstkD0c6dd7uenpO6h3/jMH/6sLV4+44d2DU8jIr39eSgH7D2V95boHuvHxra9CIwfWmaF2g1Cuik+GlJxygVWituKwEw40BmHzD1nuHhzW/KZD/Tb83PzKYHeNiy99g1PIwrCwVYIoTFtt75ZJ/09T2bufjib3EIbkPO9zeYFfhMEKRf2LWwD+eMcRXmJw4lyY0fO3z4wUuBoaeAKtIj4Os3aboBi63Cbd9mOkXBWhkwWq71X1oL/o9t3vyqq7LZr2xKg9+LiA3MuHzr1kab6Ip7+DkETfZtYOqNyjPjNaOjuG5iAs5aBGY3xxxiotdsiaKvf3xs7GeeAk6Mp9OBlezDHUenCECdVoW8KPifAo7v2br1mh1R9M0M0etrtl4nAK4uFnH52FhLW2/LPfwANPi7g7L3uGhwED+5fTuyUQRmtmWRAKC/YO0X/mBs7MP7gOPbATe8vHMQWNxG214UOkEAVur9DQDaUvN0PwUc/9TWwvu3OfcVItpUt/VGDbbe0tLTeiUCSKydttu3f1338HcnhgilJMFIw+nD1RCsEHFFJIxY+6lPjxVvehGYOQb44YXj9Doq4JvphA+83NzfAKBRIDqSzseSPy4U9vQZ8zsBAItwJQSzuacHb922Df1xjCSERbZedNoe/vVEcwAtERE4Y+BF8N0DB/Dc8ePIWCsApNcYMxX4C48n1Q985siRozuB/PNABUtzAcvlBNqOThgBNLJouHVpGvzJdQDfVCzePmrt71RFQhCRas3W+xPbty8J/lrtSAYw0tf3XGbXri9b56rsvdp6uxyqbfk2RLhmfByX1ezDAph0hcD87Ovi+Ku/uXVr8XlgatfCMmFH0gkfvOWS33XpNt6ZD46Obn19FH0hZ+1VpXQPf1QNAa8aGcFVhQKCyKL5PpBavCwAHh5+ODM+/hiH4ETEEBGLSCeUyXpAYm1Sfe65f6ojgKXUu+2sc3jm6FE8dOBA2viIfIbIBZFDR5h//rcPHvz2W4C+7yysEEjtvvFt2nYU0O4V3nLJ7+1A/NfA7O8VCm8ZJfpzR3RxSSRAxHoRXF0s4lXDw6iGML/U0/CGYq2dpS1bHspMTCw4+7oNEWLnkvLjj/+sLZcLKgCtERFknMPLMzO496WXUPEezpgQEVkCZmZD+Le/fvDg7VcDuSkgPLV0eRBQAThjlsz7rwPsXqD8qWLxXT3A/4mINtUO7LQZ53B1oYDJTZtQCWHJlxNAHECSy/3Y9PYekCTJARAYI+ienn8BIuapqVeQ970671keronA8VIJ3963D8fm5hBbywYwERFmmf/9hw4c+IPLgagE0FPpRWRUAM6SRR335YAdBczdQOXmQuGDeWNuqoogAOxDMH2ZDK7dtg1benpQ8n7ZhVlBmr51aONaOY8kSLusdm4I7QADiK1F2Xt8+8c/xv7paUTWCgHcZ4ydYv7Te/bv/8BdQKidL1m/QFlbi0A71/t87389QHelqopbC4Xb8tbeOJc6+4hFzFhvL35i+3ZknJvfxrtcaRPSkQDatEIuAKZWJsoKEFIRsESwRHhg/348ffQoKG1rvscYV2Z+YB/RT+/Zt+/4dYDbuzAdANq0iNteAK6vrVRcOzExkQvhE1ljfnaWORBgBUBkDHYODiJOt3emmX4RgNr5qykdR61NSc09aonwoxMnMFOtzotA3hjnRR5NgI/8zb593z4M0N5ax1V/lwv2+ZehXa8NOB+9lwK0BwjXMo8a4J0V5gRp8AuQngL72OHDi/bwr+LNqfFBe+ugck6RhZhc68XFI2PqwQ8Ado652kP0ujLzpXcBe98LRHvX9cOuP+3a8heZf64H3F1A9RNbt/785ii6a455kYFhtYFfJ0hDvQsvagRKl2HSiwURALtGV4wA820nAOg3BseZb/rQ/v2/Xrv2QNvnAdp1BLCE3YAJwOEq80kWYQaM1IViIYCpfjf/f43/AoAAUSQ5Z2AFAhPnQUZTgt2IiIArswAEApJKlebSHxeeUm8WtHiAsKixECBC5FnEEfDj3YB5oX0710W064dsXv4DAHPd6Gjm1UDvTAi2JGLLHNuKsEXErsLOVTlEiXMuMDuIiYIVFyR2ZIxjIeeMuOlTUfV//er+39s+iFdPTVV42y//gcm94ipIeRagTjNGKmeECMg6cGkKL9z+a2LKp6gS7OxvfW30Q88cjE/2ZQKE2TM4WMOJDeyFgndkkjiEJDLGx+Q9jPGZxIQMVUOvMX7IGD6RJKU/O3VqFovNQDoCWA/2HjlS2Zt6ry0AAwxbDHiHso/AmQjCDkIR2EYQmz5mG8EZB2vcAIXoVDVXibLi4ywQVRjZgTwyQwNA2aoAdAsigHWQOUGUFRgwOBg5ZM30C+JOWYCCkIehBEn9HgnIJ6gmCYz1MJUExnhMRwlwMiCdBTRm/TticaVTBGB+FDAG2CpgPWAZVcueXYbZBQ4RC0fCJhIh5xxFzCayNkRixIHF5hxFMzawMKg+9WcfgMRDEq8C0C2IgBjgxKcpoFpbyDA7a0M0YAIFMFEQBAlEzCAO5CmQkYgMJ2SRQVnKZCBkMRAcTnkH8KH0moMd46vqFAEAaiJwcJHNkgRp/aUlTiT1/J4AkAgiAqlP3jwWr8mk70qLb0p30FTfAlCARUC9nZAQBCEigU/n+Z4ygowXqqZr06X0jZp3ANanrW3f+wOdtxsQaJm3yAEAROJmAyDVUjoa2coasQQILWwOi0ikslJb6sg21okCAAAEDFDtCL810oWef2VVSMsgjmq3ZV+13GlAHUGnCkAji84IAABIo3IDtZmOjgSU1dDQTuoz5CWdBm2UbeMbQQAaIRGhCDEAIK0kOcORgtLl1IRAKM0KgIC4uS11fLvaaAKgKMoaUAFQlC5GBUBRuhgVAEXpYlQAFKWLUQFQlC6mk6zA7cN6nB+gtuPFaJleEFQA1oIIRBjGRWfZ2AjiE4gwqHYgRdeiZXpBUQFYLcwgF4FyefgTR8FJskKDbdwR2gSl7xUPDIKiDHh2GmS6dCamZXrBUQFYDcygbA7VqZN4+o7/gSOPPIBQngGRQctNX8Zhfp/pEggijPzYJC5+9y+i8I/eBZ4+1X0NVsu0LVABOB0iQBShOn0S3/2938Dh7z2KeDgD9AykhwvO91i1naAiwOwpIMoAca42t216DgTHH/s7HHvy7/DGuRlMvOPnwLMz3dNgtUzbBhWA0yAQGBfhkZv24MjDjyJ/5XUwv3ITqG8sPVyg3lhFAGeB0jSq/3En7Ns+BPsvfxuYqgK2oZhFACeQBz+P5HMfxd99+r+gZ8s4hl97JXhutisarJZp+6ACsBLMMNkcpv/hWRz+/gPITO6Aff9dwMhoehpEY7tipLtGKar1cDmgbwAIDLiGJ9aPMnn3B+HmTiD584/hpb1fxfDr39wdpxNrmbYVKo0rIABgLcqnTiDMVkHbLgOGR4HpKiAB8A234AEvQKidBC1h4fGi5wXAV4Eyg175k6AIKB87lL6+C5axtEzbCx0BrAKyNp1m+iSdoxqDpsuL1J7YeMzUCkeNEaXnDyaVtOeyDhtgZ+ma0DJtD3QEsBrqw8j1Pjewca7bbWiZtgUqAIrSxagAKEoXozmANSHLm1FEaqePccNjbv385X5/tp+Oef7qtecCqV0h16zrslp7l+lGRwVgLZgIyBuA4qX5JUG6ZCUD6eMomz63mk2vY9QIOyAPINO7Pp9LBCICk8ulZpmQpMGynjogAFwEcADPzNbycevwB9q1TLsEFYDVwAyKAXnhe0g+9tYVEkwEcACMAX/rdvCTX6k525qeJgAMgSqztQZ+Fr2WpBl009ODl594Eo/97X3Y98yz6RWP1k0AUqvt5u3b8aprr8El11wNJB5crZ65yaady7SLUAHoYEQEZAyYCF/973+I++/8S8xNz8C4c1GthMe/eT+++Rd34tXXvhXXf+y30DcyDC5X1GnXwagArAZjIFWAdlwB9x/+KnWsLTdcnRVUP5iFufZG2F/+HeAkWgxXAfQA8ujDwMeuOKNrEqbzcQMhwmc//G/x5DfvR35gAIMjQ8gYhlnnNIAAqDKh4gWP3fdN7H/2OXzo9pswtG0buFRauwi0YZl2IyoAa4ETYI6BcosLiYoAiQVKU+njpJw+t9TkWwfSIS1FQGXmLD4Lwwz04cv//Q/x5DfvR9/IMPqsR49L1j3464gAZQPYoQEcO/gy/uJ3/yvee8ufwBozvyVnzbRTmXYhKpNrouY2O90NWHCmrea5a0SYYXJ5HHrySXzrzr9EbmAAfdajL0rn0Szn5iYAcg7YZBL0bhrAMw99F498+Wugnl5IWHLZ1Y4q025FS6sDEREgzuDRe+5DaWYG2diixwn4PJjfWICsA7KGYaIYP/jGX0NCcs6WHpVziwpAB0JEQKhi3zPPwliHrJFzNuxvhQDIWkYcxzj84ksoHzsOE6XXYlc6CxWA1dDoL1/PRt7ohz8D2PuzeflZUf+THPjMAr9Ny7Tb0CTgKpAQFowwlgDm2uXjG58kTY1ZWvyu8bmcmnYIkODR8his09HBjbxty7TLUAFYAQKAEJAdGITtiSE/fhw4dmTh8IrGpShGWpq2di15soCj9HHz4RXGAllAnrkHkgDZ4S1pVrsLhtBapu2FCsBKGAOulNA3uQubL38z9v/tXphbrj/t8VUgApISMH0KmF3m+KovfR7+i3tAeYOJ695VW8bq3B591WiZthUqAKeBaufNv/5Du1Gd+g0c/u5exD+6fOUDLFng770J/v4/xXIHWIYjRyAWeOOH/xOGX3dVVx1gqWXaPqgAnA4iIEkQ923Clb/9STz9uZsXjrA2LY6wJqTn1gkDkrRwx6S++oHXvqF7j7DWMm0bVABWgzGQcglxvhev+/Xd63YRC0SZ7m2oWqZtgQrAajEGEjxk+iRcNgfk8mfxZgRJEki10t2XsdIyveCoAKwFIhDZs7C9Ln2vrkfL9IKiAnAmaGZ5/dEyvSDoRElRuhgVAEXpYlQAFKWLUQFQlC5GBUBRuhgVAEXpYlQAFKWLUQFQlC5GBUBRuhgVAGV1qFFvQ6ICoKwImdp2fD1bY0OiAqAsCxFQLQFRDOR6gGoZeszeBkM3AyktIQIqJeCyt1q8+d0WNiI8/WDAt/6fX3Qcn9LZqAAoSyCT9vyTrzF4x792YA+EAFz+bofyHPDQlxNQVucDGwHVcmUJBMAngolXGoghVMuAeIDnBDsuJRhDOhXYIKgAKEtIT9kmHDsoIJeOCFgAkyccf1nADF0V2CCoAChLEAYyOeDphwIe/bpHJg9k+4B9jwXc/0WPKNbj9jcKmgNQlsVY4N6/8HjmewFRhnDgeYZP0lUB+Av96ZT1QAVAWRYiwMXA/ucFwoI4m17JS3v/jYMKgLIitSuRp9fn4PSxGoI2DioAymkRgWb9NyiaBFSULkYFQFG6GBUAReliVAAUpYtRAVCULkYFQFG6GBUAReliVAAUpYtRAVCULqYLBIDUw6Yoy7BRBKBuVhUikoQSISIhqgd/UBFQ1oIs3EiAqPZztfYY9bbV8e2qgwXAzFfGKl/QUKGKshRaCPwaq9nz3NlC0IkCUCvwEy3+q1L//wWoReU0/k73tnYxK9V9PfiT+k2IMiu9oCOFoBMFoAWlpiF/rTISND4G1Xp/I7DzL7UOHVhvynpAdn5vMwFkbCAQCYhqI0VqaldVYNH0oCUd1Zg6SQBaFzo1D+kbHtcqkkK9UgGAuBzMNBFBGPCnDgFkIZ04EtCN+WeOsQizJ8DlORhjEBizp+ZM1YrUC1VAECTpg/k5f6XhPeaFwjQ3no5pTJ0iAK0KeH4+T/MVUX8eCRISIIH3C4pt4YHgkoNz7nmXjgFk9kcPIT3hsmPqbB4J4UJ/BIhIx4mnCAMug9KLjyDMzkkmdjJVoX3PvNh7YigjNgRiCrU2RcQApFp7LVG1NiIoNbS3+eloZxUEOkMAVlbXGWBu/vcLFVZ7zHBe0lWAINVADFdxPzgQPTZXCTCZmKafuAfVg8/A5PohITkf32d9IINsby8gckHWOFjS4M/ksnBxB50SygFkHZCUcfzBzwHOiCOml6bco4B4WA/AC9KT0AXwtc6EeKFt1UaTi0efy3RS7U0nCMBySNMNABgVCFEiCXkmIiFP4tOkn1TYhP7BJPcne7d+/8C0eXJT3phQrYaD//d3EWZPwvQOAcIQDm194+AhIExedinYe5SDgefzV/AkQIktquUSCjsvQmbTAEKl3PZlBw6gTB6U6cHLX/ivKB34keRyMZ0oyewt3xv8mh1IspWqCek3DFIXAqAx8NORZomIMVMvjfYP9OXopCPBBAtj9cXDfSIhKjOQMQCJND6HiAFiCsRiAzkQz8Ljzx/tu+nfv+XUJzO5OJp94Qned8f7zMg//Q30XPQmUJRBqo31P9leGBHAOLzxX9yAv/38lzB9+ACmKMJgJlWBc9UZE9K0w3RCKCUBNtODt/7yrwJ2E2yvS48RbjsaCiN4VA79EMfuuRWnHvlrcdls6InY3f187rPffLr34OjoXM8c2yqFtLcnT0yGhCgRIi+oGAGhISnYONps2SG1Pe0qAI3BTsv8HsApAfobCp0EqDLIMYQYCTGc5zRJYwXeSMWZMNhXzt6yd/Njl21OPv0vXzX3m+jLYnb/M6F0x/tMbuK1lJt4LWyuD8IB1IYCAADMjKgnh7e8oQdf/jJj1gMihL5IEBmsf1qDgMDAbALMesLcnMcbL9uEoZPfxtGv7J2vpfYrr7TJCAeU9z+FuRd+gGSuzC6fxWie3YP7oq998M6JvxwcneqZC8aD0umih0mDHparICYQp/N/kwb9ysP/5g/QtrRbbTVCTff1Zm0abhYYsEBwyLPLSdYyh0gkcog5EnEucjYSsVasiZwYK1YsxNhcTNHRlzMzn/gXL7/z3btmP9yfo76pMpCUKiyhvSutjjCQ6QEeeL4XP/iRBQjIOCCy6z+3EwAJA1UP+ABMbmG843UlUMWDpUMWJAzIZiLTl7PwgfHwvvh//9znCv9zsD9EITAHCoGCCZ5CIM8JKATyIUnIezI2oWriiYwnKvuStQlmTACmPAAGEGr3rUYFQJsKQTtXW7MAEFYSgB6xOc44EXYiHEkUORFnI7GROHYQ66yzFmKcWDGpCHB09OXeqV+44sQrPnDlqV8s9CVvzccmH1nqiAYtAIQZWcd47oDDwz9yODZtEHj9WxsBMAT05gSvmfB440UJmAlCtiPKCgCSIChVJZyco0e/9FzP5/d8bct3+gcrvSAOgShQ4AAKwXsTiCqeyPjEe08UElQpECXeGJuUqOwxZzxgA3AqYCH4AxaCvp6VUQE4C5qDvy4A9Xub3voteoLLi1hORaA+CnC1UYATEStinHPWIh0RWADUF4X45RPZMiomvOsNUxNv2Vba/oqh6iWGyC2psfOYaFsNZNJRAAPozQpmyoRnDzi8eMgiMNZtGGAAMANjgwG7xj229Kd/q/EztBXN35sBZ0RemoleeHx/9oU7vt/396hYv3XrXM901SQgYvjARBx8oIXgT3wAeU/G+LT3twlR2ZeM8Zg1AXAeONGq928cBdRRATgDWglAq1GAaTEKcBJHTphdJHmHiG36+6x1ji3EGrFiAUsZw85aMUdOZKqoWA+YkKZHpN3LZynOpx99PbM7vvZ+HkC5XdNGK0GSfng2sGwHhyoZAKiy8UDgNOkXgvfEROyJQkBCIaHgibynxHig6o2xvtb7B8D6Wu/fKADNwd/WvT/QvknAVjSracNQy9SuWxMMUZlFMgxQoKohRKAEnqLEgSIAqEjwVqwjS0EEIFPxInCWBgYSE0s1Z63UhQZYcA13hBj4moX9XFiELAC36Ry88bmh1l7mS0ICkYRAXAlp4MMHITIBFNh7w0TlQGQagj8JqJoAqoY0+VdikOGm7D+jAwJ9OTqhUZ9uGtAwCmCLHnY5ZiuSdSJs06mAWBHnInE2HQlIOgJw1gJiHIB0WlAPfEvpOrBtPYiWDhwZdANLbOF1AtfqlAEgdfl5AZngASEfGOR5SfCTCenQnwKR8SUqhzPo/YE2FoZOGgE00qi4tYI/RUC/YJZCKU+UA4VUGxKSagSKfWrr9iKRcywIjkJgiLUhAgReHDuCgIBA6R5wNg1/h0QDvyNo2qtPgGGgSjUnHzyRACzkJRB5IWMCYJm8D1UibhH8oURlhjEhnR6a5oAHlg/ytg1+oLMEoFVBNk0FLAAhGBNKXEYOWdREQJDEgtiLMLvEE0fCgigyIGbxYgiOgzABIHFSE4H58SM1/Ku0PdLiAQsAkCdOBcIIyAuRDUggCfkAEBMljKoJRAvBT1QOIAqYIU7zCSda9fYdZwICOqdJL5cMbLEqMD8VsBAxOcnadAWALSBW4thA2AIgEWcBUCQufY8onQLUevra33SdUkZKS/yiHpqIOB0KEgOJJHWnKCWp+69qAlANRMT14J8jCmnW33DD0L/xtpIItLUgdErjpqafV1oVMPMi0CsGzDYnYkWyFhASEQvERmIxEDGAGJGIAElFQIQiRM0ehBo6BegMluQC5m3jCSXzrlGipO7qY1SIiao1MTCBiNJh/+LgbzXnXynr39bBD3SuANTv63P0evA3iEGDCIiYHLMFckZEjAjXniNGJDbISG3uLwTEJFIhIG76uxr8nUWzCFQbzvGjdK9/hYSIGKgygHTzGJkAlLhEtd1/i4O/1Q1YPhegArCOtBoFAAuB32J1YMCkPTsb9NSEQMTUhaA2Iqi9RgjIpMP/TP1xA9JRZaUsOQqOBJX6NKBaFwIG6pt7iInKoZSeCBQwW9sCvDDsb+7xT2f5bfvgBzpbABrvW4kAAbDAIKXZfE7FIBUCygOUTguAdM4vZvHcv1XvnwEWHQmjtB+NddRyw440HiCTjgBKKBGF2nFgvJDso+aev3ntfyXDjwrAOWA5EVju1jA1GKjdswGE6iMCAJSbX97LGaAuCC3/JnQq0O609AI0nReZniE5h4ZdfUsDv9Ucf6WEX8cFP9B5AgCcmQg0PG4UAgAQQi+oJga1X80HOeWb/rh6AdofajIEzdV8HHUfQO1JjJl6oBrG/MEep5oDvXmev2GCH+h8AWh8vJqlwqbbQO2+HtSL7gmAoKdBGAAs7zZT2oJmgZ4lxnzbIE7r1tSCuh70pr62v9ytOcm30lJfR7WPThQAYO0i0Op3Lf5/oPG50uLvKJ1Lvbev3Z+o/64xmLnpfrnefkMEP9DZDXw5Eaj/3Crwl/s/tLhv9TeUzqRlMrDFfatAX+n5y/2NjqHTG/jpRKD5frlgXy7oO718lAVWKwL1+5UCfkMEP7BxGvjppgStfrfc/53J0H+jlGOnsdbAWylwlwv00wV7xwY/sLEabqvvspqefaVRhLLxWG1An25u39GBX2ejNfblvs/pxGGtr1U6h+UCdTVBvZbXdiQbtXGv9L1WIwZKd7DWnn3DBH6dbmj4q/2O3VAWymJWE9AbLugb6bZG323fVzkzNnTQN6IBoWXQ7XRNsCuKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKcq75/5dSsPFII50TAAAAAElFTkSuQmCC\",   scale: 0.92 },\n    star:   { image: \"data:image/png;base64,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\",   scale: 0.78 },\n    rock:   { image: \"data:image/png;base64,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\",   scale: 0.84 },\n    puddle: { image: \"data:image/png;base64,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\", scale: 0.84 },\n    bush:   { image: \"data:image/png;base64,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\",   scale: 0.84 }\n  },\n  tiles: {\n    lightImage: \"\",\n    darkImage:  \"\"\n  }\n};\n\nconst LoadedSprites = {};\n\nfunction loadAssetImage(key, src) {\n  if (!src) return;\n  const img = new Image();\n  img.onload = () => { LoadedSprites[key] = img; };\n  img.onerror = () => { delete LoadedSprites[key]; };\n  img.src = src;\n}\n\nfunction initGraphicsAssets() {\n  GRAPHICS_ASSETS.cars.forEach(car => loadAssetImage(car.id, car.image));\n  Object.entries(GRAPHICS_ASSETS.objects).forEach(([key, cfg]) => {\n    loadAssetImage(`obj_${key}`, cfg.image);\n  });\n  loadAssetImage(\"tile_light\", GRAPHICS_ASSETS.tiles.lightImage);\n  loadAssetImage(\"tile_dark\", GRAPHICS_ASSETS.tiles.darkImage);\n}\n\n\u003c/script>\n  \u003cscript>\n// ============================================================================\n// D\u1eee LI\u1ec6U M\u00c0N CH\u01a0I (10 M\u00c0N C\u01a0 B\u1ea2N + 5 M\u00c0N SCRATCH N\u00c2NG CAO + SINH M\u00c0N V\u00d4 T\u1eacN)\n// ============================================================================\n\nconst DIR_DELTAS = {\n  UP:    { dr: -1, dc: 0,  angle: -Math.PI / 2 },\n  DOWN:  { dr: 1,  dc: 0,  angle: Math.PI / 2 },\n  LEFT:  { dr: 0,  dc: -1, angle: Math.PI },\n  RIGHT: { dr: 0,  dc: 1,  angle: 0 }\n};\n\nconst DIR_NAMES = [\"UP\", \"DOWN\", \"LEFT\", \"RIGHT\"];\n\nfunction solveLevel(level) {\n  const { size, start, home, stars, obstacles, maxSteps = size * size, requireRepeat = false } = level;\n  const inBounds = (r, c) => r >= 0 && r < size && c >= 0 && c < size;\n\n  if (!inBounds(start.r, start.c) || !inBounds(home.r, home.c)) {\n    return { solvable: false, reason: \"Start ho\u1eb7c Home ngo\u00e0i b\u00e0n c\u1edd\" };\n  }\n  if (start.r === home.r && start.c === home.c) {\n    return { solvable: false, reason: \"Start tr\u00f9ng Home\" };\n  }\n\n  const obsSet = new Set(obstacles.map(o => `${o.r},${o.c}`));\n  if (obsSet.has(`${start.r},${start.c}`) || obsSet.has(`${home.r},${home.c}`)) {\n    return { solvable: false, reason: \"V\u1eadt c\u1ea3n \u0111\u00e8 l\u00ean Start ho\u1eb7c Home\" };\n  }\n\n  const starMap = new Map();\n  for (let i = 0; i < stars.length; i++) {\n    const key = `${stars[i].r},${stars[i].c}`;\n    if (!inBounds(stars[i].r, stars[i].c) || obsSet.has(key) || key === `${start.r},${start.c}`) {\n      return { solvable: false, reason: `Ng\u00f4i sao ${i + 1} \u0111\u1eb7t sai v\u1ecb tr\u00ed` };\n    }\n    starMap.set(key, i);\n  }\n\n  const fullMask = (1 << stars.length) - 1;\n  const visited = new Set([`${start.r},${start.c},0,,0`]);\n  const queue = [{ r: start.r, c: start.c, mask: 0, lastDir: \"\", hasRepeat: false, path: [] }];\n\n  while (queue.length > 0) {\n    const curr = queue.shift();\n    if (curr.r === home.r && curr.c === home.c && curr.mask === fullMask && curr.path.length > 0) {\n      if (!requireRepeat || curr.hasRepeat) {\n        return { solvable: true, minSteps: curr.path.length, path: curr.path };\n      }\n    }\n    if (curr.path.length >= maxSteps) continue;\n\n    for (const dir of DIR_NAMES) {\n      const nr = curr.r + DIR_DELTAS[dir].dr;\n      const nc = curr.c + DIR_DELTAS[dir].dc;\n      const posKey = `${nr},${nc}`;\n      if (!inBounds(nr, nc) || obsSet.has(posKey)) continue;\n\n      let nextMask = curr.mask;\n      if (starMap.has(posKey)) nextMask |= (1 << starMap.get(posKey));\n\n      const nextHasRepeat = curr.hasRepeat || (curr.lastDir === dir);\n      const stateKey = `${nr},${nc},${nextMask},${dir},${nextHasRepeat ? 1 : 0}`;\n      if (visited.has(stateKey)) continue;\n\n      visited.add(stateKey);\n      queue.push({\n        r: nr, c: nc, mask: nextMask, lastDir: dir,\n        hasRepeat: nextHasRepeat, path: [...curr.path, dir]\n      });\n    }\n  }\n  return { solvable: false, reason: \"Kh\u00f4ng c\u00f3 l\u1eddi gi\u1ea3i h\u1ee3p l\u1ec7 trong gi\u1edbi h\u1ea1n b\u01b0\u1edbc\" };\n}\n\nfunction generateSolvableLevel({ size = 6, starCount = 3, obstacleCount = 4, requireRepeat = true, isScratch = true } = {}) {\n  const types = [\"rock\", \"puddle\", \"bush\"];\n  const rand = (n) => Math.floor(Math.random() * n);\n\n  for (let attempt = 0; attempt < 250; attempt++) {\n    const used = new Set();\n    const pick = () => {\n      for (let t = 0; t < 40; t++) {\n        const r = rand(size), c = rand(size);\n        const k = `${r},${c}`;\n        if (!used.has(k)) { used.add(k); return { r, c }; }\n      }\n      return null;\n    };\n\n    const start = pick();\n    const home = pick();\n    if (!start || !home) continue;\n    if (Math.abs(start.r - home.r) + Math.abs(start.c - home.c) < size - 1) continue;\n\n    const stars = [];\n    for (let i = 0; i < starCount; i++) { const s = pick(); if (s) stars.push(s); }\n\n    const obstacles = [];\n    for (let i = 0; i < obstacleCount; i++) {\n      const o = pick();\n      if (o) obstacles.push({ r: o.r, c: o.c, type: types[(i + attempt) % types.length] });\n    }\n\n    const candidate = {\n      size, maxSteps: size * 3, start, home, stars, obstacles,\n      requireRepeat, isRandom: true, isScratch\n    };\n\n    const res = solveLevel(candidate);\n    if (res.solvable && res.minSteps >= size && res.minSteps <= size * 3 - 2) {\n      candidate.maxSteps = res.minSteps + 2;\n      candidate.hint = res.path;\n      return candidate;\n    }\n  }\n\n  const fallback = structuredClone(SCRATCH_LEVELS[0]);\n  fallback.isRandom = true;\n  fallback.isScratch = isScratch;\n  return fallback;\n}\n\n// 10 M\u00c0N C\u01a0 B\u1ea2N (PH\u1ea6N 1)\nconst LEVELS = [\n  { size: 4, maxSteps: 6, start: { r: 3, c: 0 }, home: { r: 3, c: 3 }, stars: [{ r: 3, c: 2 }], obstacles: [] },\n  { size: 4, maxSteps: 8, start: { r: 3, c: 0 }, home: { r: 1, c: 2 }, stars: [{ r: 3, c: 2 }], obstacles: [{ r: 2, c: 0, type: \"rock\" }] },\n  { size: 4, maxSteps: 8, start: { r: 0, c: 0 }, home: { r: 3, c: 3 }, stars: [{ r: 0, c: 2 }, { r: 2, c: 3 }], obstacles: [{ r: 1, c: 1, type: \"puddle\" }, { r: 2, c: 1, type: \"bush\" }] },\n  { size: 5, maxSteps: 10, start: { r: 4, c: 0 }, home: { r: 0, c: 4 }, stars: [{ r: 2, c: 0 }, { r: 2, c: 4 }], obstacles: [{ r: 4, c: 2, type: \"rock\" }, { r: 1, c: 2, type: \"bush\" }] },\n  { size: 5, maxSteps: 10, start: { r: 4, c: 2 }, home: { r: 0, c: 2 }, stars: [{ r: 2, c: 1 }, { r: 2, c: 3 }], obstacles: [{ r: 3, c: 2, type: \"rock\" }, { r: 1, c: 2, type: \"puddle\" }, { r: 2, c: 0, type: \"bush\" }, { r: 2, c: 4, type: \"bush\" }] },\n  { size: 5, maxSteps: 12, start: { r: 0, c: 4 }, home: { r: 4, c: 0 }, stars: [{ r: 0, c: 1 }, { r: 3, c: 3 }, { r: 4, c: 1 }], obstacles: [{ r: 1, c: 3, type: \"bush\" }, { r: 2, c: 1, type: \"rock\" }] },\n  { size: 5, maxSteps: 12, start: { r: 4, c: 0 }, home: { r: 0, c: 0 }, stars: [{ r: 4, c: 3 }, { r: 2, c: 3 }, { r: 0, c: 3 }], obstacles: [{ r: 3, c: 0, type: \"rock\" }, { r: 2, c: 1, type: \"puddle\" }, { r: 1, c: 0, type: \"bush\" }] },\n  { size: 6, maxSteps: 14, start: { r: 5, c: 0 }, home: { r: 0, c: 5 }, stars: [{ r: 5, c: 3 }, { r: 2, c: 3 }, { r: 2, c: 5 }], obstacles: [{ r: 4, c: 1, type: \"rock\" }, { r: 3, c: 4, type: \"puddle\" }, { r: 1, c: 2, type: \"bush\" }, { r: 0, c: 3, type: \"rock\" }] },\n  { size: 6, maxSteps: 15, start: { r: 0, c: 0 }, home: { r: 5, c: 5 }, stars: [{ r: 2, c: 0 }, { r: 2, c: 4 }, { r: 5, c: 2 }], obstacles: [{ r: 0, c: 2, type: \"rock\" }, { r: 1, c: 2, type: \"rock\" }, { r: 3, c: 4, type: \"puddle\" }, { r: 4, c: 1, type: \"bush\" }] },\n  { size: 6, maxSteps: 16, start: { r: 5, c: 2 }, home: { r: 0, c: 3 }, stars: [{ r: 4, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 5 }, { r: 0, c: 5 }], obstacles: [{ r: 4, c: 2, type: \"rock\" }, { r: 3, c: 2, type: \"puddle\" }, { r: 2, c: 3, type: \"bush\" }, { r: 2, c: 4, type: \"rock\" }] }\n];\n\n// 5 M\u00c0N SCRATCH N\u00c2NG CAO (M\u00c0N 11 - 15: Thi\u1ebft k\u1ebf theo m\u1eabu l\u1eb7p b\u1eadc thang, ziczac & v\u01b0\u1ee3t ch\u01b0\u1edbng ng\u1ea1i)\nconst SCRATCH_LEVELS = [\n  {\n    // M\u00e0n 11 (Scratch 1): C\u1ea7u thang 3 b\u1eadc -> L\u1eb7p l\u1ea1i 3 l\u1ea7n { Ph\u1ea3i, L\u00ean }\n    size: 5, maxSteps: 8, isScratch: true,\n    start: { r: 4, c: 0 }, home: { r: 1, c: 3 },\n    stars: [{ r: 3, c: 1 }, { r: 2, c: 2 }],\n    obstacles: [{ r: 4, c: 2, type: \"rock\" }, { r: 2, c: 0, type: \"bush\" }]\n  },\n  {\n    // M\u00e0n 12 (Scratch 2): Ziczac 4 b\u1eadc -> L\u1eb7p l\u1ea1i 4 l\u1ea7n { L\u00ean, Ph\u1ea3i }\n    size: 6, maxSteps: 10, isScratch: true,\n    start: { r: 5, c: 0 }, home: { r: 1, c: 4 },\n    stars: [{ r: 4, c: 1 }, { r: 3, c: 2 }, { r: 2, c: 3 }],\n    obstacles: [{ r: 5, c: 2, type: \"puddle\" }, { r: 3, c: 0, type: \"rock\" }, { r: 1, c: 2, type: \"bush\" }]\n  },\n  {\n    // M\u00e0n 13 (Scratch 3): V\u01b0\u1ee3t 2 h\u00e0ng r\u00e0o \u0111\u00e1 li\u00ean ti\u1ebfp -> L\u1eb7p l\u1ea1i 2 l\u1ea7n { L\u00ean, Ph\u1ea3i, Ph\u1ea3i, Xu\u1ed1ng }\n    size: 6, maxSteps: 12, isScratch: true,\n    start: { r: 4, c: 0 }, home: { r: 4, c: 4 },\n    stars: [{ r: 3, c: 1 }, { r: 3, c: 3 }],\n    obstacles: [{ r: 4, c: 1, type: \"rock\" }, { r: 4, c: 3, type: \"rock\" }, { r: 2, c: 2, type: \"bush\" }]\n  },\n  {\n    // M\u00e0n 14 (Scratch 4): C\u1ea7u thang \u0111\u00f4i \u0111i xu\u1ed1ng -> L\u1eb7p l\u1ea1i 3 l\u1ea7n { Ph\u1ea3i, Xu\u1ed1ng, Xu\u1ed1ng } ho\u1eb7c t\u1ed5 h\u1ee3p\n    size: 6, maxSteps: 12, isScratch: true,\n    start: { r: 0, c: 0 }, home: { r: 3, c: 3 },\n    stars: [{ r: 1, c: 1 }, { r: 2, c: 2 }, { r: 3, c: 2 }],\n    obstacles: [{ r: 0, c: 2, type: \"puddle\" }, { r: 2, c: 0, type: \"rock\" }, { r: 4, c: 3, type: \"bush\" }]\n  },\n  {\n    // M\u00e0n 15 (Scratch 5): Th\u1eed th\u00e1ch t\u1ed5ng h\u1ee3p 6x6\n    size: 6, maxSteps: 14, isScratch: true,\n    start: { r: 5, c: 1 }, home: { r: 1, c: 5 },\n    stars: [{ r: 4, c: 2 }, { r: 3, c: 3 }, { r: 2, c: 4 }],\n    obstacles: [\n      { r: 5, c: 3, type: \"rock\" }, { r: 3, c: 1, type: \"puddle\" },\n      { r: 2, c: 2, type: \"bush\" }, { r: 4, c: 4, type: \"rock\" }\n    ]\n  }\n];\n\nfunction validateAndSyncHints() {\n  LEVELS.forEach((lvl, idx) => {\n    const res = solveLevel({ ...lvl, requireRepeat: idx >= 5 });\n    if (res.solvable) lvl.hint = res.path;\n    else console.error(`M\u00e0n ${idx + 1} l\u1ed7i:`, res.reason);\n  });\n  SCRATCH_LEVELS.forEach((lvl, idx) => {\n    const res = solveLevel({ ...lvl, requireRepeat: false });\n    if (res.solvable) lvl.hint = res.path;\n    else console.error(`M\u00e0n Scratch ${idx + 1} l\u1ed7i:`, res.reason);\n  });\n}\n\n\u003c/script>\n  \u003cscript>\n// ============================================================================\n// LOGIC TR\u00d2 CH\u01a0I, \u0110\u1ed2 H\u1eccA CANVAS & CH\u1ebe \u0110\u1ed8 L\u1eacP TR\u00ccNH SCRATCH (M\u00c0N 11+)\n// ============================================================================\n\nconst DIR_ICONS = { UP: \"\u2b06\ufe0f\", DOWN: \"\u2b07\ufe0f\", LEFT: \"\u2b05\ufe0f\", RIGHT: \"\u27a1\ufe0f\" };\nconst DIR_LABELS = { UP: \"\u2b06\ufe0f \u0110i l\u00ean\", DOWN: \"\u2b07\ufe0f \u0110i xu\u1ed1ng\", LEFT: \"\u2b05\ufe0f Sang tr\u00e1i\", RIGHT: \"\u27a1\ufe0f Sang ph\u1ea3i\" };\n\n// \u00c2m thanh Web Audio API\nlet soundEnabled = true;\nconst AudioCtx = window.AudioContext || window.webkitAudioContext;\nlet audioCtx = null;\n\nfunction playTone(freq, type = \"sine\", duration = 0.14, vol = 0.14) {\n  if (!soundEnabled) return;\n  if (!audioCtx) audioCtx = new AudioCtx();\n  const osc = audioCtx.createOscillator();\n  const gain = audioCtx.createGain();\n  osc.type = type;\n  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);\n  gain.gain.setValueAtTime(vol, audioCtx.currentTime);\n  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);\n  osc.connect(gain);\n  gain.connect(audioCtx.destination);\n  osc.start();\n  osc.stop(audioCtx.currentTime + duration);\n}\n\nconst SFX = {\n  click: () => playTone(520, \"triangle\", 0.08, 0.12),\n  snap: () => playTone(680, \"sine\", 0.07, 0.14),\n  move: () => playTone(310, \"sine\", 0.11, 0.1),\n  honk: () => {\n    playTone(440, \"sawtooth\", 0.12, 0.14);\n    setTimeout(() => playTone(554.37, \"sawtooth\", 0.16, 0.14), 130);\n  },\n  star: () => {\n    playTone(660, \"sine\", 0.12, 0.15);\n    setTimeout(() => playTone(880, \"sine\", 0.2, 0.15), 90);\n  },\n  bump: () => {\n    playTone(180, \"sawtooth\", 0.18, 0.14);\n    setTimeout(() => playTone(130, \"sawtooth\", 0.22, 0.14), 100);\n  },\n  win: () => {\n    [523.25, 659.25, 783.99, 1046.5].forEach((n, i) =>\n      setTimeout(() => playTone(n, \"triangle\", 0.2, 0.15), i * 100)\n    );\n  },\n  gift: () => {\n    [440, 554.37, 659.25, 880, 1108.73, 1318.5].forEach((n, i) =>\n      setTimeout(() => playTone(n, \"triangle\", 0.25, 0.18), i * 95)\n    );\n  }\n};\n\n// ============================================================================\n// TR\u1ea0NG TH\u00c1I CHUNG\n// ============================================================================\nlet gameMode = \"BASIC\"; // \"BASIC\" (M\u00e0n 1-10) ho\u1eb7c \"SCRATCH\" (M\u00e0n 11+)\nlet currentLevelIdx = 0;\nlet scratchLevelIdx = 0;\nlet activeLevel = null;\nlet commands = [];\nlet isRunning = false;\nlet showHintPath = false;\nlet carState = { r: 0, c: 0, x: 0, y: 0, angle: 0 };\nlet collectedStars = [];\nlet confettiParticles = [];\nlet tireTracks = [];\nlet honkBubbleTimer = 0;\n\nlet completedLevels = [];\nlet equippedTierIdx = 0;\n\n// Tr\u1ea1ng th\u00e1i Scratch AST\nlet scratchBlocks = []; // [{ id, type: 'MOVE'|'REPEAT'|'HONK', dir?, count?, children?: [] }]\nlet selectedScratchTarget = \"main\"; // \"main\" ho\u1eb7c id c\u1ee7a kh\u1ed1i REPEAT\nlet scBlockIdCounter = 1;\nlet draggedPaletteData = null;\n\nfunction loadProgress() {\n  try {\n    completedLevels = JSON.parse(localStorage.getItem(\"thinkplay_completed_levels\") || \"[]\");\n    const saved = Number(localStorage.getItem(\"thinkplay_equipped_car_tier\") || \"0\");\n    if (isCarUnlocked(saved)) equippedTierIdx = saved;\n  } catch (e) {\n    completedLevels = [];\n    equippedTierIdx = 0;\n  }\n}\n\nfunction saveProgress() {\n  try {\n    localStorage.setItem(\"thinkplay_completed_levels\", JSON.stringify(completedLevels));\n    localStorage.setItem(\"thinkplay_equipped_car_tier\", String(equippedTierIdx));\n  } catch (e) {}\n}\n\nfunction isCarUnlocked(idx) {\n  const car = GRAPHICS_ASSETS.cars[idx];\n  if (!car) return false;\n  if (car.unlockAfterLevel <= 0) return true;\n  return completedLevels.includes(car.unlockAfterLevel) || completedLevels.length >= car.unlockAfterLevel;\n}\n\nfunction getEquippedCar() {\n  return GRAPHICS_ASSETS.cars[equippedTierIdx] || GRAPHICS_ASSETS.cars[0];\n}\n\nfunction updateCarBadge() {\n  document.getElementById(\"carTierBadge\").textContent = `C\u1ea5p ${getEquippedCar().tier}`;\n}\n\nconst canvas = document.getElementById(\"gameCanvas\");\nconst ctx = canvas.getContext(\"2d\");\n\n// ============================================================================\n// CHUY\u1ec2N CH\u1ebe \u0110\u1ed8 & T\u1ea2I M\u00c0N CH\u01a0I\n// ============================================================================\nfunction switchMode(mode) {\n  if (isRunning) return;\n  gameMode = mode;\n  const basicPanel = document.getElementById(\"basicControlPanel\");\n  const scratchPanel = document.getElementById(\"scratchControlPanel\");\n  const modeBtn = document.getElementById(\"btnModeSwitch\");\n  const modeText = document.getElementById(\"modeBadgeText\");\n\n  if (gameMode === \"SCRATCH\") {\n    basicPanel.style.display = \"none\";\n    scratchPanel.style.display = \"flex\";\n    modeBtn.classList.add(\"scratch-active\");\n    modeText.textContent = \"Scratch\";\n    loadScratchLevel(scratchLevelIdx);\n  } else {\n    scratchPanel.style.display = \"none\";\n    basicPanel.style.display = \"flex\";\n    modeBtn.classList.remove(\"scratch-active\");\n    modeText.textContent = \"C\u01a1 B\u1ea3n\";\n    loadLevel(currentLevelIdx);\n  }\n}\n\ndocument.getElementById(\"btnModeSwitch\").addEventListener(\"click\", () => {\n  SFX.click();\n  switchMode(gameMode === \"BASIC\" ? \"SCRATCH\" : \"BASIC\");\n});\n\nfunction resetBoardState(lvl) {\n  activeLevel = lvl;\n  commands = [];\n  scratchBlocks = [];\n  selectedScratchTarget = \"main\";\n  isRunning = false;\n  showHintPath = false;\n  collectedStars = [];\n  confettiParticles = [];\n  tireTracks = [];\n  honkBubbleTimer = 0;\n\n  carState = {\n    r: lvl.start.r,\n    c: lvl.start.c,\n    x: lvl.start.c,\n    y: lvl.start.r,\n    angle: 0\n  };\n\n  document.getElementById(\"starCount\").textContent = \"0\";\n  document.getElementById(\"starTotal\").textContent = lvl.stars.length;\n  updateCarBadge();\n}\n\nfunction loadLevel(idx, randomLevel = null) {\n  gameMode = \"BASIC\";\n  document.getElementById(\"basicControlPanel\").style.display = \"flex\";\n  document.getElementById(\"scratchControlPanel\").style.display = \"none\";\n  document.getElementById(\"btnModeSwitch\").classList.remove(\"scratch-active\");\n  document.getElementById(\"modeBadgeText\").textContent = \"C\u01a1 B\u1ea3n\";\n\n  let lvl;\n  if (randomLevel) {\n    lvl = randomLevel;\n  } else {\n    currentLevelIdx = Math.max(0, Math.min(idx, LEVELS.length - 1));\n    lvl = LEVELS[currentLevelIdx];\n  }\n\n  resetBoardState(lvl);\n\n  document.getElementById(\"levelBadge\").innerHTML = lvl.isRandom\n    ? `M\u00e0n <span id=\"levelNum\">V\u00f4 T\u1eadn<\/span>`\n    : `M\u00e0n <span id=\"levelNum\">${currentLevelIdx + 1}<\/span>/${LEVELS.length}`;\n\n  document.getElementById(\"maxSteps\").textContent = lvl.maxSteps;\n  document.getElementById(\"statusMsg\").textContent = \"X\u1ebfp c\u00e1c l\u1ec7nh b\u00ean ph\u1ea3i r\u1ed3i b\u1ea5m CH\u1ea0Y XE!\";\n  document.getElementById(\"statusMsg\").style.color = \"#166534\";\n\n  const needsRepeat = lvl.isRandom ? Boolean(lvl.requireRepeat) : currentLevelIdx >= 5;\n  document.getElementById(\"loopRequirement\").style.display = needsRepeat ? \"inline-block\" : \"none\";\n\n  renderQueue();\n  setControlsDisabled(false);\n}\n\nfunction loadScratchLevel(idx, randomLevel = null) {\n  gameMode = \"SCRATCH\";\n  document.getElementById(\"basicControlPanel\").style.display = \"none\";\n  document.getElementById(\"scratchControlPanel\").style.display = \"flex\";\n  document.getElementById(\"btnModeSwitch\").classList.add(\"scratch-active\");\n  document.getElementById(\"modeBadgeText\").textContent = \"Scratch\";\n\n  let lvl;\n  if (randomLevel) {\n    lvl = randomLevel;\n  } else {\n    scratchLevelIdx = Math.max(0, Math.min(idx, SCRATCH_LEVELS.length - 1));\n    lvl = SCRATCH_LEVELS[scratchLevelIdx];\n  }\n\n  resetBoardState(lvl);\n\n  const displayNum = lvl.isRandom ? \"Scratch \u221e\" : `Scratch ${11 + scratchLevelIdx}`;\n  document.getElementById(\"levelBadge\").innerHTML = `<span id=\"levelNum\">${displayNum}<\/span>`;\n  document.getElementById(\"scMaxSteps\").textContent = lvl.maxSteps;\n  document.getElementById(\"statusMsg\").textContent = \"Gh\u00e9p kh\u1ed1i l\u1ec7nh d\u01b0\u1edbi c\u1edd xanh \ud83d\udea9 (B\u1ea5m kh\u1ed1i L\u1eb7p l\u1ea1i \u0111\u1ec3 l\u1ed3ng l\u1ec7nh)!\";\n  document.getElementById(\"statusMsg\").style.color = \"#0369a1\";\n\n  renderScratchWorkspace();\n  setScratchDisabled(false);\n}\n\n// ============================================================================\n// PH\u1ea6N 1: \u0110I\u1ec0U KHI\u1ec2N C\u01a0 B\u1ea2N (M\u00c0N 1 - 10)\n// ============================================================================\nfunction expandProgram() {\n  const steps = [];\n  commands.forEach((cmd, commandIndex) => {\n    if (cmd.type === \"MOVE\") {\n      steps.push({ dir: cmd.dir, commandIndex });\n    } else if (cmd.type === \"REPEAT\") {\n      for (let i = 0; i < cmd.count; i++) {\n        steps.push({ dir: cmd.dir, commandIndex });\n      }\n    }\n  });\n  return steps;\n}\n\nfunction setControlsDisabled(disabled) {\n  document.querySelectorAll(\".dir-btn\").forEach(b => (b.disabled = disabled));\n  document.getElementById(\"btnRepeat\").disabled = disabled;\n  document.getElementById(\"repeatCount\").disabled = disabled;\n  document.getElementById(\"repeatDirection\").disabled = disabled;\n  document.getElementById(\"btnRun\").disabled = disabled || expandProgram().length === 0;\n  document.getElementById(\"btnClear\").disabled = disabled;\n}\n\nfunction renderQueue(activeIdx = -1, errorIdx = -1) {\n  const box = document.getElementById(\"commandQueue\");\n  box.innerHTML = \"\";\n  commands.forEach((cmd, i) => {\n    const chip = document.createElement(\"button\");\n    chip.type = \"button\";\n    chip.className = \"cmd-chip\" + (cmd.type === \"REPEAT\" ? \" repeat-chip\" : \"\");\n    if (i === activeIdx) chip.classList.add(\"active-step\");\n    if (i === errorIdx) chip.classList.add(\"error-step\");\n    chip.textContent = cmd.type === \"REPEAT\"\n      ? `\ud83d\udd01 ${cmd.count}\u00d7 ${DIR_ICONS[cmd.dir]}`\n      : DIR_ICONS[cmd.dir];\n    chip.addEventListener(\"click\", () => {\n      if (isRunning) return;\n      SFX.click();\n      commands.splice(i, 1);\n      renderQueue();\n      setControlsDisabled(false);\n    });\n    box.appendChild(chip);\n  });\n\n  const total = expandProgram().length;\n  document.getElementById(\"stepCount\").textContent = total;\n  document.getElementById(\"btnRun\").disabled = isRunning || total === 0;\n}\n\nfunction addMove(dir) {\n  if (isRunning) return;\n  if (expandProgram().length + 1 > activeLevel.maxSteps) {\n    SFX.bump();\n    document.getElementById(\"statusMsg\").textContent = \"\u0110\u00e3 \u0111\u1ea1t gi\u1edbi h\u1ea1n b\u01b0\u1edbc c\u1ee7a m\u00e0n n\u00e0y!\";\n    document.getElementById(\"statusMsg\").style.color = \"#b45309\";\n    return;\n  }\n  SFX.click();\n  commands.push({ type: \"MOVE\", dir });\n  renderQueue();\n}\n\nfunction addRepeat() {\n  if (isRunning) return;\n  const count = Number(document.getElementById(\"repeatCount\").value);\n  const dir = document.getElementById(\"repeatDirection\").value;\n  if (expandProgram().length + count > activeLevel.maxSteps) {\n    SFX.bump();\n    document.getElementById(\"statusMsg\").textContent = `V\u01b0\u1ee3t qu\u00e1 gi\u1edbi h\u1ea1n ${activeLevel.maxSteps} b\u01b0\u1edbc!`;\n    document.getElementById(\"statusMsg\").style.color = \"#b45309\";\n    return;\n  }\n  SFX.click();\n  commands.push({ type: \"REPEAT\", count, dir });\n  renderQueue();\n}\n\ndocument.querySelectorAll(\".dir-btn\").forEach(btn => {\n  btn.addEventListener(\"click\", () => addMove(btn.dataset.dir));\n});\ndocument.getElementById(\"btnRepeat\").addEventListener(\"click\", addRepeat);\n\ndocument.getElementById(\"btnClear\").addEventListener(\"click\", () => {\n  if (isRunning) return;\n  SFX.click();\n  commands = [];\n  const lvl = activeLevel;\n  carState = { r: lvl.start.r, c: lvl.start.c, x: lvl.start.c, y: lvl.start.r, angle: 0 };\n  collectedStars = [];\n  tireTracks = [];\n  document.getElementById(\"starCount\").textContent = \"0\";\n  document.getElementById(\"statusMsg\").textContent = \"X\u1ebfp c\u00e1c l\u1ec7nh b\u00ean ph\u1ea3i r\u1ed3i b\u1ea5m CH\u1ea0Y XE!\";\n  document.getElementById(\"statusMsg\").style.color = \"#166534\";\n  renderQueue();\n});\n\n// ============================================================================\n// PH\u1ea6N 2: TR\u00ccNH L\u1eacP TR\u00ccNH KH\u1ed0I SCRATCH (M\u00c0N 11+)\n// ============================================================================\nfunction countScratchMoveSteps(blocks = scratchBlocks) {\n  let total = 0;\n  for (const b of blocks) {\n    if (b.type === \"MOVE\") total += 1;\n    else if (b.type === \"REPEAT\") total += b.count * countScratchMoveSteps(b.children || []);\n  }\n  return total;\n}\n\nfunction expandScratchSteps(blocks = scratchBlocks) {\n  const steps = [];\n  for (const b of blocks) {\n    if (b.type === \"MOVE\") {\n      steps.push({ action: \"MOVE\", dir: b.dir, blockId: b.id });\n    } else if (b.type === \"HONK\") {\n      steps.push({ action: \"HONK\", blockId: b.id });\n    } else if (b.type === \"REPEAT\") {\n      for (let i = 0; i < b.count; i++) {\n        steps.push(...expandScratchSteps(b.children || []));\n      }\n    }\n  }\n  return steps;\n}\n\nfunction addScratchBlock(type, dir = \"RIGHT\", targetId = selectedScratchTarget) {\n  if (isRunning) return;\n  const newBlock = {\n    id: `sc_${scBlockIdCounter++}`,\n    type,\n    dir: type === \"MOVE\" ? dir : undefined,\n    count: type === \"REPEAT\" ? 3 : undefined,\n    children: type === \"REPEAT\" ? [] : undefined\n  };\n\n  if (targetId !== \"main\" && type !== \"REPEAT\") {\n    const parentLoop = scratchBlocks.find(b => b.id === targetId && b.type === \"REPEAT\");\n    if (parentLoop) {\n      parentLoop.children.push(newBlock);\n    } else {\n      selectedScratchTarget = \"main\";\n      scratchBlocks.push(newBlock);\n    }\n  } else {\n    scratchBlocks.push(newBlock);\n    if (type === \"REPEAT\") {\n      selectedScratchTarget = newBlock.id; // T\u1ef1 ch\u1ecdn b\u00ean trong v\u00f2ng l\u1eb7p m\u1edbi t\u1ea1o \u0111\u1ec3 b\u00e9 gh\u00e9p l\u1ec7nh lu\u00f4n\n    }\n  }\n\n  if (countScratchMoveSteps() > activeLevel.maxSteps) {\n    // Ho\u00e0n t\u00e1c n\u1ebfu v\u01b0\u1ee3t b\u01b0\u1edbc t\u1ed1i \u0111a\n    if (targetId !== \"main\" && type !== \"REPEAT\") {\n      const parentLoop = scratchBlocks.find(b => b.id === targetId);\n      if (parentLoop) parentLoop.children.pop();\n    } else {\n      scratchBlocks.pop();\n      if (type === \"REPEAT\") selectedScratchTarget = \"main\";\n    }\n    SFX.bump();\n    document.getElementById(\"statusMsg\").textContent = `V\u01b0\u1ee3t qu\u00e1 gi\u1edbi h\u1ea1n ${activeLevel.maxSteps} b\u01b0\u1edbc di chuy\u1ec3n!`;\n    document.getElementById(\"statusMsg\").style.color = \"#b45309\";\n    return;\n  }\n\n  SFX.snap();\n  renderScratchWorkspace();\n}\n\nfunction removeScratchBlock(blockId) {\n  if (isRunning) return;\n  SFX.click();\n  if (selectedScratchTarget === blockId) selectedScratchTarget = \"main\";\n  scratchBlocks = scratchBlocks.filter(b => b.id !== blockId);\n  scratchBlocks.forEach(b => {\n    if (b.children) b.children = b.children.filter(c => c.id !== blockId);\n  });\n  renderScratchWorkspace();\n}\n\nfunction moveScratchBlock(list, index, delta) {\n  if (isRunning) return;\n  const newIdx = index + delta;\n  if (newIdx < 0 || newIdx >= list.length) return;\n  SFX.click();\n  const [item] = list.splice(index, 1);\n  list.splice(newIdx, 0, item);\n  renderScratchWorkspace();\n}\n\nfunction createLeafBlockEl(block, list, idx, activeBlockId, errorBlockId) {\n  const el = document.createElement(\"div\");\n  const colorClass = block.type === \"HONK\" ? \"sc-sound\" : \"sc-motion\";\n  el.className = `sc-block ${colorClass}`;\n  if (block.id === activeBlockId) el.classList.add(\"active-sc\");\n  if (block.id === errorBlockId) el.classList.add(\"error-sc\");\n\n  const label = document.createElement(\"span\");\n  label.textContent = block.type === \"HONK\" ? \"\ud83d\udce3 B\u1ea5m c\u00f2i B\u00edp B\u00edp!\" : DIR_LABELS[block.dir];\n\n  const actions = document.createElement(\"div\");\n  actions.className = \"sc-block-actions\";\n\n  const upBtn = document.createElement(\"button\");\n  upBtn.type = \"button\";\n  upBtn.className = \"sc-mini-btn\";\n  upBtn.textContent = \"\u25b2\";\n  upBtn.onclick = (e) => { e.stopPropagation(); moveScratchBlock(list, idx, -1); };\n\n  const downBtn = document.createElement(\"button\");\n  downBtn.type = \"button\";\n  downBtn.className = \"sc-mini-btn\";\n  downBtn.textContent = \"\u25bc\";\n  downBtn.onclick = (e) => { e.stopPropagation(); moveScratchBlock(list, idx, 1); };\n\n  const delBtn = document.createElement(\"button\");\n  delBtn.type = \"button\";\n  delBtn.className = \"sc-mini-btn\";\n  delBtn.textContent = \"\u2715\";\n  delBtn.onclick = (e) => { e.stopPropagation(); removeScratchBlock(block.id); };\n\n  actions.append(upBtn, downBtn, delBtn);\n  el.append(label, actions);\n  return el;\n}\n\nfunction renderScratchWorkspace(activeBlockId = null, errorBlockId = null) {\n  const mainBody = document.getElementById(\"scratchMainBody\");\n  const hatBlock = document.getElementById(\"scHatBlock\");\n  const indicator = document.getElementById(\"scratchTargetIndicator\");\n\n  hatBlock.classList.toggle(\"selected-target\", selectedScratchTarget === \"main\");\n  indicator.textContent = selectedScratchTarget === \"main\"\n    ? \"\ud83c\udfaf \u0110ang gh\u00e9p v\u00e0o: Lu\u1ed3ng ch\u00ednh\"\n    : \"\ud83c\udfaf \u0110ang gh\u00e9p v\u00e0o: B\u00ean trong v\u00f2ng l\u1eb7p \ud83d\udd01\";\n\n  mainBody.innerHTML = \"\";\n\n  scratchBlocks.forEach((block, idx) => {\n    if (block.type === \"REPEAT\") {\n      const wrap = document.createElement(\"div\");\n      wrap.className = \"sc-c-wrapper\" + (selectedScratchTarget === block.id ? \" selected-loop\" : \"\");\n\n      const header = document.createElement(\"div\");\n      header.className = \"sc-c-header\";\n      header.onclick = (e) => {\n        if (e.target.tagName === \"SELECT\" || e.target.tagName === \"BUTTON\") return;\n        SFX.click();\n        selectedScratchTarget = (selectedScratchTarget === block.id) ? \"main\" : block.id;\n        renderScratchWorkspace();\n      };\n\n      const leftPart = document.createElement(\"div\");\n      leftPart.style.display = \"flex\";\n      leftPart.style.alignItems = \"center\";\n      leftPart.style.gap = \"6px\";\n      leftPart.innerHTML = `<span>\ud83d\udd01 L\u1eb7p l\u1ea1i<\/span>`;\n\n      const sel = document.createElement(\"select\");\n      [2, 3, 4, 5, 6].forEach(n => {\n        const opt = document.createElement(\"option\");\n        opt.value = n;\n        opt.textContent = `${n}`;\n        if (n === block.count) opt.selected = true;\n        sel.appendChild(opt);\n      });\n      sel.onchange = () => {\n        const oldVal = block.count;\n        block.count = Number(sel.value);\n        if (countScratchMoveSteps() > activeLevel.maxSteps) {\n          block.count = oldVal;\n          sel.value = oldVal;\n          SFX.bump();\n        } else {\n          SFX.click();\n          renderScratchWorkspace();\n        }\n      };\n\n      const suffix = document.createElement(\"span\");\n      suffix.textContent = \"l\u1ea7n\";\n      leftPart.append(sel, suffix);\n\n      const actions = document.createElement(\"div\");\n      actions.className = \"sc-block-actions\";\n      const upBtn = document.createElement(\"button\");\n      upBtn.type = \"button\";\n      upBtn.className = \"sc-mini-btn\";\n      upBtn.textContent = \"\u25b2\";\n      upBtn.onclick = (e) => { e.stopPropagation(); moveScratchBlock(scratchBlocks, idx, -1); };\n\n      const downBtn = document.createElement(\"button\");\n      downBtn.type = \"button\";\n      downBtn.className = \"sc-mini-btn\";\n      downBtn.textContent = \"\u25bc\";\n      downBtn.onclick = (e) => { e.stopPropagation(); moveScratchBlock(scratchBlocks, idx, 1); };\n\n      const delBtn = document.createElement(\"button\");\n      delBtn.type = \"button\";\n      delBtn.className = \"sc-mini-btn\";\n      delBtn.textContent = \"\u2715\";\n      delBtn.onclick = (e) => { e.stopPropagation(); removeScratchBlock(block.id); };\n\n      actions.append(upBtn, downBtn, delBtn);\n      header.append(leftPart, actions);\n\n      const mouth = document.createElement(\"div\");\n      mouth.className = \"sc-c-mouth\";\n      mouth.onclick = (e) => {\n        e.stopPropagation();\n        SFX.click();\n        selectedScratchTarget = block.id;\n        renderScratchWorkspace();\n      };\n\n      // H\u1ed7 tr\u1ee3 k\u00e9o th\u1ea3 tr\u1ef1c ti\u1ebfp v\u00e0o mi\u1ec7ng v\u00f2ng l\u1eb7p\n      mouth.addEventListener(\"dragover\", (e) => {\n        e.preventDefault();\n        e.stopPropagation();\n        mouth.classList.add(\"drag-over\");\n      });\n      mouth.addEventListener(\"dragleave\", () => mouth.classList.remove(\"drag-over\"));\n      mouth.addEventListener(\"drop\", (e) => {\n        e.preventDefault();\n        e.stopPropagation();\n        mouth.classList.remove(\"drag-over\");\n        if (draggedPaletteData && draggedPaletteData.type !== \"REPEAT\") {\n          addScratchBlock(draggedPaletteData.type, draggedPaletteData.dir, block.id);\n        }\n      });\n\n      if (!block.children || block.children.length === 0) {\n        const hint = document.createElement(\"div\");\n        hint.className = \"sc-c-empty-hint\";\n        hint.textContent = \"+ Th\u1ea3 ho\u1eb7c b\u1ea5m l\u1ec7nh di chuy\u1ec3n v\u00e0o \u0111\u00e2y\";\n        mouth.appendChild(hint);\n      } else {\n        block.children.forEach((child, cIdx) => {\n          mouth.appendChild(createLeafBlockEl(child, block.children, cIdx, activeBlockId, errorBlockId));\n        });\n      }\n\n      const footer = document.createElement(\"div\");\n      footer.className = \"sc-c-footer\";\n\n      wrap.append(header, mouth, footer);\n      mainBody.appendChild(wrap);\n    } else {\n      mainBody.appendChild(createLeafBlockEl(block, scratchBlocks, idx, activeBlockId, errorBlockId));\n    }\n  });\n\n  const totalSteps = countScratchMoveSteps();\n  document.getElementById(\"scStepCount\").textContent = totalSteps;\n  document.getElementById(\"btnScRun\").disabled = isRunning || expandScratchSteps().length === 0;\n}\n\nfunction setScratchDisabled(disabled) {\n  document.getElementById(\"btnScRun\").disabled = disabled || expandScratchSteps().length === 0;\n  document.getElementById(\"btnScClear\").disabled = disabled;\n}\n\n// Kh\u1edfi t\u1ea1o s\u1ef1 ki\u1ec7n Palette Scratch (Click + Drag & Drop)\ndocument.querySelectorAll(\".sc-pal-item\").forEach(item => {\n  item.addEventListener(\"click\", () => {\n    addScratchBlock(item.dataset.scType, item.dataset.dir);\n  });\n  item.addEventListener(\"dragstart\", () => {\n    draggedPaletteData = { type: item.dataset.scType, dir: item.dataset.dir };\n  });\n  item.addEventListener(\"dragend\", () => {\n    draggedPaletteData = null;\n  });\n});\n\ndocument.getElementById(\"scHatBlock\").addEventListener(\"click\", () => {\n  SFX.click();\n  selectedScratchTarget = \"main\";\n  renderScratchWorkspace();\n});\n\nconst scMainBody = document.getElementById(\"scratchMainBody\");\nscMainBody.addEventListener(\"dragover\", (e) => {\n  e.preventDefault();\n  scMainBody.classList.add(\"drag-over\");\n});\nscMainBody.addEventListener(\"dragleave\", () => scMainBody.classList.remove(\"drag-over\"));\nscMainBody.addEventListener(\"drop\", (e) => {\n  e.preventDefault();\n  scMainBody.classList.remove(\"drag-over\");\n  if (draggedPaletteData) {\n    addScratchBlock(draggedPaletteData.type, draggedPaletteData.dir, \"main\");\n  }\n});\n\ndocument.getElementById(\"btnScClear\").addEventListener(\"click\", () => {\n  if (isRunning) return;\n  SFX.click();\n  scratchBlocks = [];\n  selectedScratchTarget = \"main\";\n  const lvl = activeLevel;\n  carState = { r: lvl.start.r, c: lvl.start.c, x: lvl.start.c, y: lvl.start.r, angle: 0 };\n  collectedStars = [];\n  tireTracks = [];\n  document.getElementById(\"starCount\").textContent = \"0\";\n  document.getElementById(\"statusMsg\").textContent = \"Gh\u00e9p kh\u1ed1i l\u1ec7nh d\u01b0\u1edbi c\u1edd xanh \ud83d\udea9 r\u1ed3i ch\u1ea1y nh\u00e9!\";\n  document.getElementById(\"statusMsg\").style.color = \"#0369a1\";\n  renderScratchWorkspace();\n});\n\n// ============================================================================\n// M\u00c0N H\u00ccNH L\u1edaN T\u1eb6NG XE, M\u1ede KH\u00d3A SCRATCH, GARA & H\u01af\u1edaNG D\u1eaaN\n// ============================================================================\nfunction showCarGiftScreen(carConfig) {\n  document.getElementById(\"giftTitle\").textContent = `Ch\u00fac M\u1eebng! B\u00e9 \u0110\u01b0\u1ee3c T\u1eb7ng ${carConfig.name}!`;\n  document.getElementById(\"giftCarName\").textContent = `${carConfig.name} (C\u1ea5p ${carConfig.tier})`;\n  document.getElementById(\"giftCarPerk\").textContent = `\u26a1 ${carConfig.perk}`;\n\n  const giftCanvas = document.getElementById(\"giftCarCanvas\");\n  const gCtx = giftCanvas.getContext(\"2d\");\n  gCtx.clearRect(0, 0, giftCanvas.width, giftCanvas.height);\n  drawCarSpriteOrVector(gCtx, 110, 110, 180, -0.25, carConfig, true);\n\n  document.getElementById(\"carGiftOverlay\").classList.add(\"show\");\n}\n\nfunction advanceAfterWin() {\n  if (gameMode === \"SCRATCH\") {\n    if (activeLevel && activeLevel.isRandom) {\n      loadScratchLevel(0, generateSolvableLevel({ size: 6, starCount: 3, obstacleCount: 4, requireRepeat: false, isScratch: true }));\n    } else if (scratchLevelIdx >= SCRATCH_LEVELS.length - 1) {\n      loadScratchLevel(0, generateSolvableLevel({ size: 6, starCount: 3, obstacleCount: 4, requireRepeat: false, isScratch: true }));\n    } else {\n      loadScratchLevel(scratchLevelIdx + 1);\n    }\n    return;\n  }\n\n  if (activeLevel && activeLevel.isRandom) {\n    loadLevel(0, generateSolvableLevel({ size: 6, starCount: 3, obstacleCount: 4, requireRepeat: true, isScratch: false }));\n    return;\n  }\n\n  // H\u1ebft M\u00e0n 10 -> N\u00e2ng c\u1ea5p sang Scratch!\n  if (currentLevelIdx >= LEVELS.length - 1) {\n    switchMode(\"SCRATCH\");\n  } else {\n    loadLevel(currentLevelIdx + 1);\n  }\n}\n\ndocument.getElementById(\"btnNextLevel\").addEventListener(\"click\", () => {\n  SFX.click();\n  document.getElementById(\"winModal\").classList.remove(\"show\");\n  advanceAfterWin();\n});\n\ndocument.getElementById(\"btnGiftContinue\").addEventListener(\"click\", () => {\n  SFX.click();\n  document.getElementById(\"carGiftOverlay\").classList.remove(\"show\");\n  advanceAfterWin();\n});\n\ndocument.getElementById(\"btnStartScratchMode\").addEventListener(\"click\", () => {\n  SFX.click();\n  document.getElementById(\"scratchUnlockOverlay\").classList.remove(\"show\");\n  scratchLevelIdx = 0;\n  switchMode(\"SCRATCH\");\n});\n\n// Gara \u0111\u1ed5i xe\nfunction openGarage() {\n  if (isRunning) return;\n  SFX.click();\n  const grid = document.getElementById(\"garageGrid\");\n  grid.innerHTML = \"\";\n\n  GRAPHICS_ASSETS.cars.forEach((car, idx) => {\n    const unlocked = isCarUnlocked(idx);\n    const equipped = idx === equippedTierIdx;\n    const item = document.createElement(\"div\");\n    item.className = `garage-item ${unlocked ? \"unlocked\" : \"locked\"} ${equipped ? \"equipped\" : \"\"}`;\n\n    const mini = document.createElement(\"canvas\");\n    mini.width = 76;\n    mini.height = 76;\n    drawCarSpriteOrVector(mini.getContext(\"2d\"), 38, 38, 66, 0, car, false);\n\n    const title = document.createElement(\"h4\");\n    title.textContent = `C\u1ea5p ${car.tier}: ${car.name}`;\n\n    const sub = document.createElement(\"span\");\n    sub.textContent = !unlocked\n      ? `\ud83d\udd12 Qua M\u00e0n ${car.unlockAfterLevel}`\n      : (equipped ? \"\u2705 \u0110ang l\u00e1i\" : car.perk);\n\n    item.append(mini, title, sub);\n    if (unlocked && !equipped) {\n      item.addEventListener(\"click\", () => {\n        SFX.click();\n        equippedTierIdx = idx;\n        saveProgress();\n        updateCarBadge();\n        openGarage();\n      });\n    }\n    grid.appendChild(item);\n  });\n\n  document.getElementById(\"garageModal\").classList.add(\"show\");\n}\n\ndocument.getElementById(\"btnGarage\").addEventListener(\"click\", openGarage);\ndocument.getElementById(\"btnCloseGarage\").addEventListener(\"click\", () => {\n  SFX.click();\n  document.getElementById(\"garageModal\").classList.remove(\"show\");\n});\n\ndocument.getElementById(\"btnHelp\").addEventListener(\"click\", () => {\n  SFX.click();\n  document.getElementById(\"helpModal\").classList.add(\"show\");\n});\ndocument.getElementById(\"btnCloseHelp\").addEventListener(\"click\", () => {\n  SFX.click();\n  document.getElementById(\"helpModal\").classList.remove(\"show\");\n});\n\ndocument.getElementById(\"btnHint\").addEventListener(\"click\", () => {\n  SFX.click();\n  showHintPath = true;\n  setTimeout(() => { showHintPath = false; }, 2600);\n});\n\ndocument.getElementById(\"btnSound\").addEventListener(\"click\", (e) => {\n  soundEnabled = !soundEnabled;\n  e.target.textContent = soundEnabled ? \"\ud83d\udd0a\" : \"\ud83d\udd07\";\n});\n\n// ============================================================================\n// TH\u1ef0C THI CH\u01af\u01a0NG TR\u00ccNH (CHUNG CHO C\u1ea2 PH\u1ea6N 1 V\u00c0 SCRATCH)\n// ============================================================================\nasync function executeProgramSteps(steps, isScratchMode) {\n  isRunning = true;\n  if (isScratchMode) setScratchDisabled(true);\n  else setControlsDisabled(true);\n\n  const lvl = activeLevel;\n  carState = { r: lvl.start.r, c: lvl.start.c, x: lvl.start.c, y: lvl.start.r, angle: 0 };\n  collectedStars = [];\n  tireTracks = [];\n  document.getElementById(\"starCount\").textContent = \"0\";\n\n  for (let i = 0; i < steps.length; i++) {\n    const step = steps[i];\n    if (isScratchMode) renderScratchWorkspace(step.blockId, null);\n    else renderQueue(step.commandIndex, -1);\n\n    if (step.action === \"HONK\") {\n      SFX.honk();\n      honkBubbleTimer = performance.now() + 550;\n      await new Promise(r => setTimeout(r, 380));\n      continue;\n    }\n\n    const delta = DIR_DELTAS[step.dir];\n    const nextR = carState.r + delta.dr;\n    const nextC = carState.c + delta.dc;\n    carState.angle = delta.angle;\n\n    const hitWall = nextR < 0 || nextR >= lvl.size || nextC < 0 || nextC >= lvl.size;\n    const hitObs = lvl.obstacles.some(o => o.r === nextR && o.c === nextC);\n\n    if (hitWall || hitObs) {\n      SFX.bump();\n      if (isScratchMode) renderScratchWorkspace(null, step.blockId);\n      else renderQueue(-1, step.commandIndex);\n\n      document.getElementById(\"statusMsg\").textContent = \"\u1ed0i! Xe \u0111\u1ee5ng v\u1eadt c\u1ea3n r\u1ed3i, s\u1eeda l\u1ea1i kh\u1ed1i \u0111\u1ecf nh\u00e9!\";\n      document.getElementById(\"statusMsg\").style.color = \"#dc2626\";\n      await animateBump(carState.c, carState.r, delta.dc * 0.25, delta.dr * 0.25);\n      isRunning = false;\n      if (isScratchMode) setScratchDisabled(false);\n      else setControlsDisabled(false);\n      return;\n    }\n\n    tireTracks.push({ x0: carState.c, y0: carState.r, x1: nextC, y1: nextR });\n    SFX.move();\n    await animateStep(carState.c, carState.r, nextC, nextR);\n    carState.r = nextR;\n    carState.c = nextC;\n\n    const starIdx = lvl.stars.findIndex(s => s.r === nextR && s.c === nextC);\n    if (starIdx !== -1 && !collectedStars.includes(starIdx)) {\n      collectedStars.push(starIdx);\n      SFX.star();\n      document.getElementById(\"starCount\").textContent = collectedStars.length;\n    }\n  }\n\n  if (isScratchMode) renderScratchWorkspace(null, null);\n  else renderQueue(-1, -1);\n\n  const atHome = carState.r === lvl.home.r && carState.c === lvl.home.c;\n  const allStars = collectedStars.length === lvl.stars.length;\n  const usedRepeat = isScratchMode\n    ? scratchBlocks.some(b => b.type === \"REPEAT\")\n    : commands.some(c => c.type === \"REPEAT\");\n  const needsRepeat = !isScratchMode && (lvl.isRandom ? Boolean(lvl.requireRepeat) : currentLevelIdx >= 5);\n\n  if (atHome && allStars && (!needsRepeat || usedRepeat)) {\n    spawnConfetti();\n    let giftedCar = null;\n    let unlockedScratchNow = false;\n\n    if (!isScratchMode && !lvl.isRandom) {\n      const levelNum = currentLevelIdx + 1;\n      if (!completedLevels.includes(levelNum)) completedLevels.push(levelNum);\n      const unlockedIdx = GRAPHICS_ASSETS.cars.findIndex(c => c.unlockAfterLevel === levelNum);\n      if (unlockedIdx !== -1) {\n        giftedCar = GRAPHICS_ASSETS.cars[unlockedIdx];\n        equippedTierIdx = unlockedIdx;\n        updateCarBadge();\n      }\n      if (levelNum === LEVELS.length) {\n        unlockedScratchNow = true;\n      }\n      saveProgress();\n    }\n\n    if (giftedCar) {\n      SFX.gift();\n      setTimeout(() => showCarGiftScreen(giftedCar), 420);\n    } else if (unlockedScratchNow) {\n      SFX.gift();\n      setTimeout(() => document.getElementById(\"scratchUnlockOverlay\").classList.add(\"show\"), 420);\n    } else {\n      SFX.win();\n      document.getElementById(\"winText\").textContent = isScratchMode\n        ? (lvl.isRandom ? \"Tuy\u1ec7t v\u1eddi! B\u00e9 gi\u1ea3i th\u00e0nh c\u00f4ng m\u00ea cung Scratch!\" : `Ho\u00e0n th\u00e0nh M\u00e0n Scratch ${11 + scratchLevelIdx} xu\u1ea5t s\u1eafc!`)\n        : `Ho\u00e0n th\u00e0nh M\u00e0n ${currentLevelIdx + 1} xu\u1ea5t s\u1eafc!`;\n      setTimeout(() => document.getElementById(\"winModal\").classList.add(\"show\"), 420);\n    }\n  } else if (atHome && allStars && needsRepeat && !usedRepeat) {\n    SFX.bump();\n    document.getElementById(\"statusMsg\").textContent = \"M\u00e0n n\u00e0y c\u1ea7n d\u00f9ng \u00edt nh\u1ea5t 1 kh\u1ed1i Repeat nh\u00e9!\";\n    document.getElementById(\"statusMsg\").style.color = \"#7c3aed\";\n  } else if (atHome && !allStars) {\n    SFX.bump();\n    document.getElementById(\"statusMsg\").textContent = \"Xe v\u1ec1 nh\u00e0 r\u1ed3i nh\u01b0ng c\u00f2n thi\u1ebfu ng\u00f4i sao!\";\n    document.getElementById(\"statusMsg\").style.color = \"#d97706\";\n  } else {\n    SFX.bump();\n    document.getElementById(\"statusMsg\").textContent = \"Xe ch\u01b0a v\u1ec1 t\u1edbi nh\u00e0, th\u00eam b\u01b0\u1edbc di chuy\u1ec3n nh\u00e9!\";\n    document.getElementById(\"statusMsg\").style.color = \"#d97706\";\n  }\n\n  isRunning = false;\n  if (isScratchMode) setScratchDisabled(false);\n  else setControlsDisabled(false);\n}\n\ndocument.getElementById(\"btnRun\").addEventListener(\"click\", () => {\n  if (isRunning || commands.length === 0) return;\n  const steps = expandProgram().map(s => ({ action: \"MOVE\", dir: s.dir, commandIndex: s.commandIndex }));\n  executeProgramSteps(steps, false);\n});\n\ndocument.getElementById(\"btnScRun\").addEventListener(\"click\", () => {\n  if (isRunning) return;\n  const steps = expandScratchSteps();\n  if (steps.length === 0) return;\n  executeProgramSteps(steps, true);\n});\n\n// ============================================================================\n// HI\u1ec6U \u1ee8NG ANIMATION & V\u1ebc B\u00c0N C\u1edc\n// ============================================================================\nfunction animateStep(x0, y0, x1, y1) {\n  return new Promise(resolve => {\n    const mult = getEquippedCar().speedMultiplier || 1.0;\n    const duration = Math.max(150, 310 / mult);\n    const start = performance.now();\n    function frame(now) {\n      const t = Math.min(1, (now - start) / duration);\n      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;\n      carState.x = x0 + (x1 - x0) * ease;\n      carState.y = y0 + (y1 - y0) * ease;\n      if (t < 1) requestAnimationFrame(frame);\n      else resolve();\n    }\n    requestAnimationFrame(frame);\n  });\n}\n\nfunction animateBump(x0, y0, dx, dy) {\n  return new Promise(resolve => {\n    const duration = 250;\n    const start = performance.now();\n    function frame(now) {\n      const t = Math.min(1, (now - start) / duration);\n      const wave = Math.sin(t * Math.PI);\n      carState.x = x0 + dx * wave;\n      carState.y = y0 + dy * wave;\n      if (t < 1) requestAnimationFrame(frame);\n      else { carState.x = x0; carState.y = y0; resolve(); }\n    }\n    requestAnimationFrame(frame);\n  });\n}\n\nfunction spawnConfetti() {\n  const colors = [\"#ef4444\", \"#f59e0b\", \"#22c55e\", \"#3b82f6\", \"#a855f7\"];\n  for (let i = 0; i < 65; i++) {\n    confettiParticles.push({\n      x: canvas.width / 2, y: canvas.height / 2,\n      vx: (Math.random() - 0.5) * 11, vy: (Math.random() - 0.7) * 11,\n      color: colors[i % colors.length], size: 6 + Math.random() * 6\n    });\n  }\n}\n\nfunction drawBoard() {\n  const lvl = activeLevel;\n  if (!lvl) return;\n  const pad = 16;\n  const cellSize = (canvas.width - pad * 2) / lvl.size;\n\n  ctx.clearRect(0, 0, canvas.width, canvas.height);\n\n  for (let r = 0; r < lvl.size; r++) {\n    for (let c = 0; c < lvl.size; c++) {\n      const x = pad + c * cellSize;\n      const y = pad + r * cellSize;\n      const isEven = (r + c) % 2 === 0;\n      const tileImg = LoadedSprites[isEven ? \"tile_light\" : \"tile_dark\"];\n\n      if (tileImg) {\n        ctx.drawImage(tileImg, x + 2, y + 2, cellSize - 4, cellSize - 4);\n      } else {\n        ctx.fillStyle = isEven ? \"#86efac\" : \"#4ade80\";\n        ctx.beginPath();\n        ctx.roundRect(x + 3, y + 6, cellSize - 6, cellSize - 6, 14);\n        ctx.fill();\n\n        ctx.fillStyle = isEven ? \"#ecfdf5\" : \"#d1fae5\";\n        ctx.beginPath();\n        ctx.roundRect(x + 3, y + 3, cellSize - 6, cellSize - 6, 14);\n        ctx.fill();\n      }\n    }\n  }\n\n  if (tireTracks.length > 0) {\n    ctx.save();\n    ctx.strokeStyle = \"rgba(22, 101, 52, 0.16)\";\n    ctx.lineWidth = cellSize * 0.16;\n    ctx.lineCap = \"round\";\n    ctx.lineJoin = \"round\";\n    ctx.beginPath();\n    tireTracks.forEach((tr, i) => {\n      const x0 = pad + (tr.x0 + 0.5) * cellSize;\n      const y0 = pad + (tr.y0 + 0.5) * cellSize;\n      const x1 = pad + (tr.x1 + 0.5) * cellSize;\n      const y1 = pad + (tr.y1 + 0.5) * cellSize;\n      if (i === 0) ctx.moveTo(x0, y0);\n      ctx.lineTo(x1, y1);\n    });\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  if (showHintPath && Array.isArray(lvl.hint)) {\n    let hr = lvl.start.r, hc = lvl.start.c;\n    ctx.save();\n    ctx.strokeStyle = \"rgba(2, 132, 199, 0.65)\";\n    ctx.lineWidth = 8;\n    ctx.setLineDash([10, 10]);\n    ctx.lineCap = \"round\";\n    ctx.beginPath();\n    ctx.moveTo(pad + (hc + 0.5) * cellSize, pad + (hr + 0.5) * cellSize);\n    lvl.hint.forEach(d => {\n      hr += DIR_DELTAS[d].dr;\n      hc += DIR_DELTAS[d].dc;\n      ctx.lineTo(pad + (hc + 0.5) * cellSize, pad + (hr + 0.5) * cellSize);\n    });\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  lvl.obstacles.forEach(obs => {\n    const cx = pad + (obs.c + 0.5) * cellSize;\n    const cy = pad + (obs.r + 0.5) * cellSize;\n    const sprite = LoadedSprites[`obj_${obs.type}`];\n    if (sprite) {\n      const sz = cellSize * (GRAPHICS_ASSETS.objects[obs.type]?.scale || 0.84);\n      ctx.drawImage(sprite, cx - sz / 2, cy - sz / 2, sz, sz);\n      return;\n    }\n    drawVectorObstacle(ctx, cx, cy, cellSize, obs.type);\n  });\n\n  const pulse = 1 + Math.sin(performance.now() / 220) * 0.08;\n  lvl.stars.forEach((s, idx) => {\n    if (collectedStars.includes(idx)) return;\n    const cx = pad + (s.c + 0.5) * cellSize;\n    const cy = pad + (s.r + 0.5) * cellSize;\n    const sprite = LoadedSprites[\"obj_star\"];\n    if (sprite) {\n      const sz = cellSize * (GRAPHICS_ASSETS.objects.star.scale || 0.78) * pulse;\n      ctx.drawImage(sprite, cx - sz / 2, cy - sz / 2, sz, sz);\n    } else {\n      drawVectorStar(ctx, cx, cy, cellSize * 0.28 * pulse, cellSize * 0.13 * pulse);\n    }\n  });\n\n  const hx = pad + (lvl.home.c + 0.5) * cellSize;\n  const hy = pad + (lvl.home.r + 0.5) * cellSize;\n  const homeSprite = LoadedSprites[\"obj_home\"];\n  if (homeSprite) {\n    const hs = cellSize * (GRAPHICS_ASSETS.objects.home.scale || 0.92);\n    ctx.drawImage(homeSprite, hx - hs / 2, hy - hs / 2, hs, hs);\n  } else {\n    drawVectorHouse(ctx, hx, hy, cellSize);\n  }\n\n  const carPx = pad + (carState.x + 0.5) * cellSize;\n  const carPy = pad + (carState.y + 0.5) * cellSize;\n  drawCarSpriteOrVector(ctx, carPx, carPy, cellSize, carState.angle, getEquippedCar(), isRunning);\n\n  // Bong b\u00f3ng B\u00edp B\u00edp khi d\u00f9ng kh\u1ed1i \u00e2m thanh Scratch\n  if (performance.now() < honkBubbleTimer) {\n    ctx.save();\n    ctx.fillStyle = \"#9966ff\";\n    ctx.beginPath();\n    ctx.roundRect(carPx - 36, carPy - cellSize * 0.62, 72, 26, 12);\n    ctx.fill();\n    ctx.fillStyle = \"#ffffff\";\n    ctx.font = \"bold 13px sans-serif\";\n    ctx.textAlign = \"center\";\n    ctx.fillText(\"B\u00cdP B\u00cdP!\", carPx, carPy - cellSize * 0.62 + 17);\n    ctx.restore();\n  }\n\n  confettiParticles.forEach(p => {\n    p.x += p.vx;\n    p.y += p.vy;\n    p.vy += 0.25;\n    ctx.fillStyle = p.color;\n    ctx.fillRect(p.x, p.y, p.size, p.size);\n  });\n\n  requestAnimationFrame(drawBoard);\n}\n\nfunction drawVectorObstacle(c, cx, cy, cellSize, type) {\n  c.save();\n  c.fillStyle = \"rgba(15, 23, 42, 0.14)\";\n  c.beginPath();\n  c.ellipse(cx, cy + cellSize * 0.25, cellSize * 0.3, cellSize * 0.12, 0, 0, Math.PI * 2);\n  c.fill();\n  if (type === \"rock\") {\n    c.fillStyle = \"#64748b\";\n    c.beginPath();\n    c.ellipse(cx, cy + 2, cellSize * 0.32, cellSize * 0.24, 0, 0, Math.PI * 2);\n    c.fill();\n  } else if (type === \"puddle\") {\n    c.fillStyle = \"#0ea5e9\";\n    c.beginPath();\n    c.ellipse(cx, cy + 2, cellSize * 0.34, cellSize * 0.21, 0.12, 0, Math.PI * 2);\n    c.fill();\n  } else {\n    c.fillStyle = \"#15803d\";\n    c.beginPath();\n    c.arc(cx, cy, cellSize * 0.28, 0, Math.PI * 2);\n    c.fill();\n  }\n  c.restore();\n}\n\nfunction drawVectorStar(c, cx, cy, outerR, innerR) {\n  let rot = (Math.PI / 2) * 3;\n  const step = Math.PI / 5;\n  c.save();\n  c.beginPath();\n  c.moveTo(cx, cy - outerR);\n  for (let i = 0; i < 5; i++) {\n    c.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);\n    rot += step;\n    c.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);\n    rot += step;\n  }\n  c.closePath();\n  c.fillStyle = \"#facc15\";\n  c.fill();\n  c.restore();\n}\n\nfunction drawVectorHouse(c, cx, cy, cellSize) {\n  const w = cellSize * 0.6;\n  const h = cellSize * 0.46;\n  c.save();\n  c.fillStyle = \"#fef3c7\";\n  c.strokeStyle = \"#d97706\";\n  c.lineWidth = 3;\n  c.beginPath();\n  c.roundRect(cx - w / 2, cy - h / 4, w, h * 0.85, 8);\n  c.fill();\n  c.stroke();\n  c.fillStyle = \"#ef4444\";\n  c.beginPath();\n  c.moveTo(cx - w * 0.64, cy - h / 4);\n  c.lineTo(cx, cy - h * 0.92);\n  c.lineTo(cx + w * 0.64, cy - h / 4);\n  c.closePath();\n  c.fill();\n  c.restore();\n}\n\nfunction drawCarSpriteOrVector(c, cx, cy, cellSize, angle, carCfg, moving = false) {\n  const w = cellSize * 0.6;\n  const h = cellSize * 0.44;\n  c.save();\n  c.translate(cx, cy);\n  c.rotate(angle);\n\n  if (carCfg.fallbackColors.glow) {\n    c.fillStyle = carCfg.fallbackColors.glow;\n    c.beginPath();\n    c.arc(0, 0, cellSize * (moving ? 0.44 : 0.36), 0, Math.PI * 2);\n    c.fill();\n  }\n\n  const customImg = LoadedSprites[carCfg.id];\n  if (customImg) {\n    c.save();\n    c.rotate(carCfg.rotationOffset || 0);\n    const sz = cellSize * (carCfg.scale || 0.90);\n    c.drawImage(customImg, -sz / 2, -sz / 2, sz, sz);\n    c.restore();\n    c.restore();\n    return;\n  }\n\n  c.fillStyle = carCfg.fallbackColors.body;\n  c.strokeStyle = carCfg.fallbackColors.dark;\n  c.lineWidth = 3;\n  c.beginPath();\n  c.roundRect(-w / 2, -h / 2, w, h, 11);\n  c.fill();\n  c.stroke();\n  c.restore();\n}\n\n// Kh\u1edfi \u0111\u1ed9ng game\ninitGraphicsAssets();\nvalidateAndSyncHints();\nloadProgress();\nloadLevel(0);\nrequestAnimationFrame(drawBoard);\n\n\u003c/script>\n<\/body>\n<\/html>\n";

        // Robot Maze (Scratch Coding) Launcher
        document.getElementById('openRobotMazeBtn').addEventListener('click', function () {
          document.getElementById('libraryCatalogSection').classList.add('hidden');
          document.getElementById('robotMazeSection').classList.remove('hidden');
          const frame = document.getElementById('robotMazeFrame');
          if (frame && !frame.getAttribute('srcdoc')) {
            frame.setAttribute('srcdoc', ROBOT_MAZE_SRCDOC);
          }
        });

        document.getElementById('backFromRobotBtn').addEventListener('click', function () {
          document.getElementById('robotMazeSection').classList.add('hidden');
          document.getElementById('libraryCatalogSection').classList.remove('hidden');
        });

        // Cloud Sync UI
        function refreshCloudSyncUi() {
          const url = getCloudUrl();
          const inp = document.getElementById('firebaseUrlInput');
          const badge = document.getElementById('cloudSyncStatusBadge');
          if (inp) inp.value = url;
          if (badge) {
            if (url) {
              badge.textContent = 'Đang đồng bộ Cloud';
              badge.className = 'px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900';
            } else {
              badge.textContent = 'Chế độ Local (Chỉ trên máy này)';
              badge.className = 'px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
            }
          }
        }

        document.getElementById('saveCloudSyncBtn').addEventListener('click', async function () {
          const val = document.getElementById('firebaseUrlInput').value.trim().replace(/\/+$/, '');
          if (!val || !val.startsWith('https://')) {
            showToast('Vui lòng nhập link Firebase Realtime DB hợp lệ (bắt đầu bằng https://).', 'error');
            return;
          }
          safeSetStorage(CLOUD_URL_KEY, val);
          refreshCloudSyncUi();
          await pushUsersToCloud();
          await pullUsersFromCloudOrStatic();
          showToast('Đã kết nối và đồng bộ Database lên Cloud!');
        });

        document.getElementById('disconnectCloudSyncBtn').addEventListener('click', function () {
          safeSetStorage(CLOUD_URL_KEY, '');
          refreshCloudSyncUi();
          showToast('Đã ngắt kết nối Cloud Sync.', 'info');
        });

        // --- GAME 3: ĐẢO KHO BÁU (8 WORLDS x 10 LEVELS = 80 LEVELS) ---
        const EXPLORER_WORLDS = [
          { id: 0, name: 'Beginner Beach', vn: 'Bãi Biển Khởi Đầu', icon: '🏖️', topic: 'Đếm số, cộng trừ & lệnh tuần tự', bg: '#fef3c7', tileA: '#fde68a', tileB: '#fcd34d', obs: '🪨' },
          { id: 1, name: 'Number Forest', vn: 'Rừng Con Số', icon: '🌲', topic: 'Quy luật số & vòng lặp', bg: '#dcfce7', tileA: '#bbf7d0', tileB: '#86efac', obs: '🌲' },
          { id: 2, name: 'Geometry Valley', vn: 'Thung Lũng Hình Học', icon: '📐', topic: 'Hình học, góc & diện tích', bg: '#e0e7ff', tileA: '#c7d2fe', tileB: '#a5b4fc', obs: '⛰️' },
          { id: 3, name: 'Logic Jungle', vn: 'Rừng Rậm Logic', icon: '🦜', topic: 'Điều kiện IF/ELSE & tư duy logic', bg: '#d1fae5', tileA: '#6ee7b7', tileB: '#34d399', obs: '🌵' },
          { id: 4, name: 'Multiplication Mountain', vn: 'Núi Nhân Chia', icon: '🏔️', topic: 'Nhân chia & biến số', bg: '#f1f5f9', tileA: '#cbd5e1', tileB: '#94a3b8', obs: '🧊' },
          { id: 5, name: 'Mystery Desert', vn: 'Sa Mạc Bí Ẩn', icon: '🐪', topic: 'Thuật toán, tìm kiếm & tối ưu', bg: '#ffedd5', tileA: '#fed7aa', tileB: '#fdba74', obs: '🏜️' },
          { id: 6, name: 'Cyber Ocean', vn: 'Đại Dương Số', icon: '🌊', topic: 'Hàm, dữ liệu & debugging', bg: '#cffafe', tileA: '#a5f3fc', tileB: '#67e8f9', obs: '🪸' },
          { id: 7, name: 'Treasure Kingdom', vn: 'Vương Quốc Kho Báu', icon: '👑', topic: 'Thử thách tổng hợp', bg: '#fae8ff', tileA: '#f5d0fe', tileB: '#e879f9', obs: '🏰' }
        ];

        function buildMathPuzzleForLevel(wIdx, lIdx) {
          const n = lIdx + 1;
          if (wIdx === 0) {
            const a = 3 + n * 2, b = 2 + n;
            const ans = a + b;
            return { q: `Trên bãi biển có ${a} vỏ sò, nhặt thêm ${b} vỏ nữa. Tổng cộng có bao nhiêu vỏ sò?`, ans: ans, opts: [ans, ans + 2, ans - 1, ans + 3] };
          }
          if (wIdx === 1) {
            const step = 2 + (n % 4);
            const s1 = n, s2 = n + step, s3 = n + step * 2, ans = n + step * 3;
            return { q: `Tìm số tiếp theo trong dãy quy luật: ${s1}, ${s2}, ${s3}, ?`, ans: ans, opts: [ans, ans + 1, ans - step, ans + 2] };
          }
          if (wIdx === 2) {
            const w = 3 + (n % 5), h = 2 + Math.floor(n / 2);
            const ans = w * h;
            return { q: `Khu vườn hình chữ nhật dài ${w}m, rộng ${h}m. Diện tích khu vườn là bao nhiêu m²?`, ans: ans, opts: [ans, (w + h) * 2, ans + 4, ans - 2] };
          }
          if (wIdx === 3) {
            const x = 4 + n;
            const ans = x > 8 ? x * 2 : x + 5;
            return { q: `NẾU x = ${x} > 8 THÌ kết quả = x × 2, NGƯỢC LẠI kết quả = x + 5. Kết quả là?`, ans: ans, opts: [ans, x * 2 + 1, x + 3, ans - 2] };
          }
          if (wIdx === 4) {
            const a = 3 + (n % 6), b = 4 + Math.floor(n / 2);
            const ans = a * b;
            return { q: `Mỗi rương có ${a} viên ngọc. Hỏi ${b} rương có tất cả bao nhiêu viên ngọc?`, ans: ans, opts: [ans, a + b, ans + a, ans - b] };
          }
          if (wIdx === 5) {
            const arr = [12 + n, 5 + n * 2, 28 + n, 9 + n];
            const ans = Math.max.apply(null, arr);
            return { q: `Thuật toán tìm MAX trong dãy [${arr.join(', ')}] trả về số nào?`, ans: ans, opts: [ans, Math.min.apply(null, arr), arr[0], arr[1]] };
          }
          if (wIdx === 6) {
            const f = function (k) { return k * 2 + 3; };
            const inp = 2 + n;
            const ans = f(inp);
            return { q: `Hàm TinhDiem(k) trả về (k × 2 + 3). Với k = ${inp}, giá trị trả về là bao nhiêu?`, ans: ans, opts: [ans, inp * 2, ans + 2, inp + 5] };
          }
          const base = 5 + n;
          const ans = base * 3 - 4;
          return { q: `Mở cổng Kho Báu: Tính giá trị biểu thức (${base} × 3) - 4 = ?`, ans: ans, opts: [ans, ans + 3, ans - 4, base * 3] };
        }

        function generateExplorerLevel(wIdx, lIdx) {
          const size = 5;
          // Deterministic solvable path from (4,0) to treasure at (0, 4) or varied corners
          const templates = [
            { start: { r: 4, c: 0, dir: 0 }, goal: { r: 1, c: 0 }, path: ['FWD', 'FWD', 'FWD'], hint: 'Dùng Lặp 3× Tiến!' },
            { start: { r: 4, c: 0, dir: 1 }, goal: { r: 4, c: 3 }, path: ['FWD', 'FWD', 'FWD'], hint: 'Đi thẳng sang phải 3 ô.' },
            { start: { r: 4, c: 0, dir: 0 }, goal: { r: 2, c: 2 }, path: ['FWD', 'FWD', 'RIGHT', 'FWD', 'FWD'], hint: 'Tiến 2, Quay Phải, Tiến 2.' },
            { start: { r: 4, c: 1, dir: 0 }, goal: { r: 1, c: 3 }, path: ['FWD', 'FWD', 'FWD', 'RIGHT', 'FWD', 'FWD'], hint: 'Tiến 3, Quay Phải, Tiến 2.' },
            { start: { r: 4, c: 4, dir: 0 }, goal: { r: 2, c: 1 }, path: ['FWD', 'FWD', 'LEFT', 'FWD', 'FWD', 'FWD'], hint: 'Tiến 2, Quay Trái, Tiến 3.' },
            { start: { r: 3, c: 0, dir: 1 }, goal: { r: 0, c: 3 }, path: ['FWD', 'FWD', 'FWD', 'LEFT', 'FWD', 'FWD', 'FWD'], hint: 'Tiến 3, Quay Trái, Tiến 3.' },
            { start: { r: 4, c: 0, dir: 0 }, goal: { r: 0, c: 2 }, path: ['FWD', 'FWD', 'RIGHT', 'FWD', 'FWD', 'LEFT', 'FWD', 'FWD'], hint: 'Tiến 2, Phải, Tiến 2, Trái, Tiến 2.' },
            { start: { r: 4, c: 2, dir: 0 }, goal: { r: 1, c: 4 }, path: ['FWD', 'FWD', 'RIGHT', 'FWD', 'FWD', 'LEFT', 'FWD'], hint: 'Tiến 2, Phải, Tiến 2, Trái, Tiến 1.' },
            { start: { r: 0, c: 0, dir: 2 }, goal: { r: 3, c: 3 }, path: ['FWD', 'FWD', 'FWD', 'LEFT', 'FWD', 'FWD', 'FWD'], hint: 'Tiến 3, Quay Trái, Tiến 3.' },
            { start: { r: 4, c: 0, dir: 0 }, goal: { r: 0, c: 4 }, path: ['FWD', 'FWD', 'RIGHT', 'FWD', 'FWD', 'LEFT', 'FWD', 'FWD', 'RIGHT', 'FWD', 'FWD'], hint: 'Đi theo hình bậc thang tới rương!' }
          ];
          const tpl = templates[(wIdx + lIdx) % templates.length];
          // Compute visited cells so we never place obstacles on the solution path
          const visited = new Set([tpl.start.r + ',' + tpl.start.c]);
          const dirs = [{ dr: -1, dc: 0 }, { dr: 0, dc: 1 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }];
          let cr = tpl.start.r, cc = tpl.start.c, cd = tpl.start.dir;
          tpl.path.forEach(function (cmd) {
            if (cmd === 'LEFT') cd = (cd + 3) % 4;
            else if (cmd === 'RIGHT') cd = (cd + 1) % 4;
            else if (cmd === 'FWD') {
              cr += dirs[cd].dr;
              cc += dirs[cd].dc;
              visited.add(cr + ',' + cc);
            }
          });
          const obstacles = [];
          for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
              if (!visited.has(r + ',' + c) && ((r * 3 + c * 7 + wIdx + lIdx) % 4 === 0)) {
                obstacles.push({ r: r, c: c });
              }
            }
          }
          return {
            id: 'exp_' + wIdx + '_' + lIdx,
            size: size,
            start: Object.assign({}, tpl.start),
            goal: { r: cr, c: cc },
            obstacles: obstacles,
            hint: tpl.hint,
            math: buildMathPuzzleForLevel(wIdx, lIdx)
          };
        }

        let expWorldIdx = 0;
        let expLevelIdx = 0;
        let expCurrentLevel = null;
        let expMathSolved = false;
        let expCommands = [];
        let expRobot = { r: 4, c: 0, dir: 0 };
        let expRunning = false;

        function getExpCompletedSet() {
          if (currentUser && currentUser.gameProgress && Array.isArray(currentUser.gameProgress.explorerCompleted)) {
            return currentUser.gameProgress.explorerCompleted;
          }
          return [];
        }

        function updateExplorerLibraryBadge() {
          const done = getExpCompletedSet().length;
          const el1 = document.getElementById('libExplorerProgressText');
          const el2 = document.getElementById('expTreasureCount');
          if (el1) el1.textContent = done + ' / 80';
          if (el2) el2.textContent = String(done);
        }

        function renderExplorerWorlds() {
          const bar = document.getElementById('expWorldsBar');
          if (!bar) return;
          bar.innerHTML = EXPLORER_WORLDS.map(function (w, idx) {
            const active = idx === expWorldIdx;
            return (
              '<button type="button" data-exp-world="' + idx + '" class="p-2 rounded-xl border text-left transition ' +
              (active ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100') + '">' +
                '<div class="text-base leading-none">' + w.icon + '</div>' +
                '<div class="text-[11px] font-bold mt-1 truncate">' + (idx + 1) + '. ' + w.name + '</div>' +
              '</button>'
            );
          }).join('');
        }

        function renderExplorerLevels() {
          const bar = document.getElementById('expLevelsBar');
          if (!bar) return;
          const done = getExpCompletedSet();
          let htmlBtns = '';
          for (let i = 0; i < 10; i++) {
            const lid = 'exp_' + expWorldIdx + '_' + i;
            const isDone = done.indexOf(lid) !== -1;
            const isAct = i === expLevelIdx;
            htmlBtns += '<button type="button" data-exp-lvl="' + i + '" class="px-2.5 py-1 rounded-lg text-xs font-bold transition ' +
              (isAct ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200') + '">' +
              (isDone ? '💎 ' : '') + 'Màn ' + (expWorldIdx * 10 + i + 1) +
              '</button>';
          }
          bar.innerHTML = htmlBtns;
        }

        function drawExplorerCanvas() {
          const canvas = document.getElementById('explorerCanvas');
          if (!canvas || !expCurrentLevel) return;
          const ctx = canvas.getContext('2d');
          const world = EXPLORER_WORLDS[expWorldIdx];
          const W = canvas.width, H = canvas.height;
          const pad = 16;
          const cell = (W - pad * 2) / expCurrentLevel.size;

          ctx.fillStyle = world.bg;
          ctx.fillRect(0, 0, W, H);

          for (let r = 0; r < expCurrentLevel.size; r++) {
            for (let c = 0; c < expCurrentLevel.size; c++) {
              const x = pad + c * cell;
              const y = pad + r * cell;
              ctx.fillStyle = (r + c) % 2 === 0 ? world.tileA : world.tileB;
              ctx.beginPath();
              ctx.roundRect(x + 2, y + 2, cell - 4, cell - 4, 10);
              ctx.fill();
            }
          }

          // Obstacles
          ctx.font = Math.floor(cell * 0.55) + 'px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          expCurrentLevel.obstacles.forEach(function (o) {
            ctx.fillText(world.obs, pad + (o.c + 0.5) * cell, pad + (o.r + 0.5) * cell);
          });

          // Goal Treasure
          const gx = pad + (expCurrentLevel.goal.c + 0.5) * cell;
          const gy = pad + (expCurrentLevel.goal.r + 0.5) * cell;
          ctx.fillText(expMathSolved ? '💎' : '🔒', gx, gy);

          // Explorer Robot
          const rx = pad + (expRobot.c + 0.5) * cell;
          const ry = pad + (expRobot.r + 0.5) * cell;
          const dirArrows = ['⬆️', '➡️', '⬇️', '⬅️'];
          ctx.fillStyle = '#4f46e5';
          ctx.beginPath();
          ctx.arc(rx, ry, cell * 0.34, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = Math.floor(cell * 0.42) + 'px sans-serif';
          ctx.fillText(dirArrows[expRobot.dir], rx, ry + 1);
        }

        function renderExplorerQueue() {
          const q = document.getElementById('expProgramQueue');
          if (!q) return;
          if (expCommands.length === 0) {
            q.innerHTML = '<span class="text-xs text-slate-400 italic">Bấm các khối lệnh ở trên để ghép...</span>';
            return;
          }
          const labels = { FWD: '⬆️ Tiến', LEFT: '↺ Trái', RIGHT: '↻ Phải', FWD2: '🔁 2× Tiến', FWD3: '🔁 3× Tiến' };
          q.innerHTML = expCommands.map(function (cmd, idx) {
            return '<button type="button" data-exp-del="' + idx + '" class="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-rose-600 transition">' +
              (labels[cmd] || cmd) + ' ✕</button>';
          }).join('');
        }

        function loadExplorerLevel(wIdx, lIdx) {
          if (expRunning) return;
          expWorldIdx = Math.max(0, Math.min(wIdx, 7));
          expLevelIdx = Math.max(0, Math.min(lIdx, 9));
          expCurrentLevel = generateExplorerLevel(expWorldIdx, expLevelIdx);
          expMathSolved = false;
          expCommands = [];
          expRobot = Object.assign({}, expCurrentLevel.start);

          const world = EXPLORER_WORLDS[expWorldIdx];
          document.getElementById('expWorldSubtitle').textContent = world.icon + ' ' + world.name + ' (' + world.vn + ')';
          document.getElementById('expTopicBadge').textContent = 'Chủ đề: ' + world.topic;
          document.getElementById('expLevelTitle').textContent = 'Màn ' + (expWorldIdx * 10 + expLevelIdx + 1) + ' / 80';
          document.getElementById('expStatusMsg').textContent = 'Bước 1: Giải câu đố Toán để mở khóa Kho báu!';
          document.getElementById('expMathStatusBadge').textContent = '🔒 Đang khóa';
          document.getElementById('expMathStatusBadge').className = 'text-xs font-bold text-slate-400';
          document.getElementById('expNextBtn').classList.add('hidden');

          // Render Math Puzzle
          document.getElementById('expMathQuestion').textContent = expCurrentLevel.math.q;
          const uniqueOpts = Array.from(new Set(expCurrentLevel.math.opts)).sort(function () { return Math.random() - 0.5; });
          document.getElementById('expMathOptions').innerHTML = uniqueOpts.map(function (opt) {
            return '<button type="button" data-exp-ans="' + opt + '" class="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950 font-bold text-xs text-slate-800 dark:text-white transition">' + opt + '</button>';
          }).join('');

          renderExplorerWorlds();
          renderExplorerLevels();
          renderExplorerQueue();
          updateExplorerLibraryBadge();
          drawExplorerCanvas();
        }

        document.getElementById('openExplorerGameBtn').addEventListener('click', function () {
          document.getElementById('libraryCatalogSection').classList.add('hidden');
          document.getElementById('explorerGameSection').classList.remove('hidden');
          loadExplorerLevel(expWorldIdx, expLevelIdx);
        });

        document.getElementById('backFromExplorerBtn').addEventListener('click', function () {
          document.getElementById('explorerGameSection').classList.add('hidden');
          document.getElementById('libraryCatalogSection').classList.remove('hidden');
          updateExplorerLibraryBadge();
        });

        document.getElementById('expWorldsBar').addEventListener('click', function (e) {
          const btn = e.target.closest('[data-exp-world]');
          if (btn && !expRunning) loadExplorerLevel(parseInt(btn.getAttribute('data-exp-world'), 10), 0);
        });

        document.getElementById('expLevelsBar').addEventListener('click', function (e) {
          const btn = e.target.closest('[data-exp-lvl]');
          if (btn && !expRunning) loadExplorerLevel(expWorldIdx, parseInt(btn.getAttribute('data-exp-lvl'), 10));
        });

        document.getElementById('expMathOptions').addEventListener('click', function (e) {
          const btn = e.target.closest('[data-exp-ans]');
          if (!btn || !expCurrentLevel) return;
          const chosen = Number(btn.getAttribute('data-exp-ans'));
          if (chosen === expCurrentLevel.math.ans) {
            expMathSolved = true;
            document.getElementById('expMathStatusBadge').textContent = '🔓 Đã mở khóa!';
            document.getElementById('expMathStatusBadge').className = 'text-xs font-bold text-emerald-600';
            document.getElementById('expStatusMsg').textContent = 'Tuyệt vời! Giờ hãy ghép lệnh cho Robot tới 💎!';
            playSfx('correct');
            drawExplorerCanvas();
          } else {
            playSfx('wrong');
            showToast('Chưa đúng rồi, thử tính lại nhé!', 'error');
          }
        });

        document.querySelectorAll('[data-exp-cmd]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            if (expRunning) return;
            expCommands.push(btn.getAttribute('data-exp-cmd'));
            renderExplorerQueue();
          });
        });

        document.getElementById('expProgramQueue').addEventListener('click', function (e) {
          const btn = e.target.closest('[data-exp-del]');
          if (!btn || expRunning) return;
          expCommands.splice(parseInt(btn.getAttribute('data-exp-del'), 10), 1);
          renderExplorerQueue();
        });

        document.getElementById('expClearBtn').addEventListener('click', function () {
          if (expRunning) return;
          expCommands = [];
          expRobot = Object.assign({}, expCurrentLevel.start);
          renderExplorerQueue();
          drawExplorerCanvas();
        });

        document.getElementById('expHintBtn').addEventListener('click', function () {
          if (expCurrentLevel) showToast('💡 Gợi ý: ' + expCurrentLevel.hint, 'info');
        });

        document.getElementById('expRunBtn').addEventListener('click', async function () {
          if (expRunning || !expCurrentLevel) return;
          if (!expMathSolved) {
            showToast('Hãy giải câu đố Toán ở Bước 1 trước để mở khóa Kho báu!', 'error');
            return;
          }
          if (expCommands.length === 0) {
            showToast('Hãy ghép ít nhất 1 khối lệnh cho Robot!', 'error');
            return;
          }
          expRunning = true;
          expRobot = Object.assign({}, expCurrentLevel.start);
          drawExplorerCanvas();

          const flatSteps = [];
          expCommands.forEach(function (c) {
            if (c === 'FWD2') { flatSteps.push('FWD', 'FWD'); }
            else if (c === 'FWD3') { flatSteps.push('FWD', 'FWD', 'FWD'); }
            else flatSteps.push(c);
          });

          const dirs = [{ dr: -1, dc: 0 }, { dr: 0, dc: 1 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }];
          let crashed = false;
          for (let i = 0; i < flatSteps.length; i++) {
            const st = flatSteps[i];
            if (st === 'LEFT') expRobot.dir = (expRobot.dir + 3) % 4;
            else if (st === 'RIGHT') expRobot.dir = (expRobot.dir + 1) % 4;
            else if (st === 'FWD') {
              const nr = expRobot.r + dirs[expRobot.dir].dr;
              const nc = expRobot.c + dirs[expRobot.dir].dc;
              const hitObs = expCurrentLevel.obstacles.some(function (o) { return o.r === nr && o.c === nc; });
              if (nr < 0 || nr >= expCurrentLevel.size || nc < 0 || nc >= expCurrentLevel.size || hitObs) {
                crashed = true;
                break;
              }
              expRobot.r = nr;
              expRobot.c = nc;
            }
            playSfx('tick');
            drawExplorerCanvas();
            await sleep(240);
          }

          expRunning = false;
          if (crashed) {
            playSfx('wrong');
            document.getElementById('expStatusMsg').textContent = '💥 Robot đụng chướng ngại vật! Hãy sửa lại lệnh.';
            return;
          }

          if (expRobot.r === expCurrentLevel.goal.r && expRobot.c === expCurrentLevel.goal.c) {
            playSfx('win');
            document.getElementById('expStatusMsg').textContent = '🎉 Tuyệt vời! Đã thu thập được Kho báu!';
            document.getElementById('expNextBtn').classList.remove('hidden');
            if (currentUser) {
              if (!currentUser.gameProgress) currentUser.gameProgress = { completedLevels: [], explorerCompleted: [], totalAttempts: 0, lastScore: null, logs: [] };
              if (!Array.isArray(currentUser.gameProgress.explorerCompleted)) currentUser.gameProgress.explorerCompleted = [];
              if (currentUser.gameProgress.explorerCompleted.indexOf(expCurrentLevel.id) === -1) {
                currentUser.gameProgress.explorerCompleted.push(expCurrentLevel.id);
              }
              currentUser.gameProgress.totalAttempts = (currentUser.gameProgress.totalAttempts || 0) + 1;
              currentUser.gameProgress.lastScore = '💎 Đảo Kho Báu Màn ' + (expWorldIdx * 10 + expLevelIdx + 1);
              safeSetStorage(DB_STORAGE_KEY, usersDb); pushUsersToCloud();
              safeSetStorage(SESSION_STORAGE_KEY, currentUser);
              renderExplorerLevels();
              updateExplorerLibraryBadge();
              renderParentPortal();
            }
          } else {
            playSfx('wrong');
            document.getElementById('expStatusMsg').textContent = '⚠️ Robot chưa tới đúng ô Kho báu 💎!';
          }
        });

        document.getElementById('expNextBtn').addEventListener('click', function () {
          if (expLevelIdx < 9) loadExplorerLevel(expWorldIdx, expLevelIdx + 1);
          else if (expWorldIdx < 7) loadExplorerLevel(expWorldIdx + 1, 0);
          else showToast('👑 Chúc mừng bạn đã chinh phục toàn bộ 80 màn Đảo Kho Báu!', 'info');
        });

        updateExplorerLibraryBadge();
        refreshCloudSyncUi();
        pullUsersFromCloudOrStatic();
        renderAll();
      });
    })();
