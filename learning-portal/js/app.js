(function () {
      const DB_STORAGE_KEY = 'edupath_users_db_v1';
      const SESSION_STORAGE_KEY = 'edupath_current_user_v1';
      const REMEMBERED_LOGIN_KEY = 'edupath_remembered_login_v1';
      const THEME_STORAGE_KEY = 'edupath_theme_v1';
      const LEVELS_STORAGE_KEY = 'edupath_waste_levels_v1';

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
          optimalSteps: 15,
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
          optimalSteps: 13,
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
          hint: 'Có 8 quả táo và chỉ 1 tờ báo! Dùng nút ⇆ Đổi chỗ trạm để đưa Thùng Hữu Cơ lên Trạm 1 nhằm tiết kiệm bước kiểm tra (≤ 12 bước = 3 Sao).',
          timeLimit: 90,
          speedMs: 400,
          optimalSteps: 12,
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
          hint: '6 Lon sắt chiếm đa số! Bật Trạm Rửa, đổi Trạm Kim loại lên Trạm 1 và dùng thuộc tính Nam châm để đạt 3 Sao (≤ 15 bước)!',
          timeLimit: 90,
          speedMs: 390,
          optimalSteps: 15,
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
      safeSetStorage(DB_STORAGE_KEY, usersDb);

      let wasteLevels = safeGetStorage(LEVELS_STORAGE_KEY, null);
      if (!Array.isArray(wasteLevels) || wasteLevels.length === 0) {
        wasteLevels = JSON.parse(JSON.stringify(DEFAULT_WASTE_LEVELS));
        safeSetStorage(LEVELS_STORAGE_KEY, wasteLevels);
      }

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
        startFactoryAnimationLoop();
      }

      function sleep(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms); });
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

        safeSetStorage(DB_STORAGE_KEY, usersDb);
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
          safeSetStorage(DB_STORAGE_KEY, usersDb);
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
          safeSetStorage(DB_STORAGE_KEY, usersDb);
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
            safeSetStorage(DB_STORAGE_KEY, usersDb);
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
              safeSetStorage(DB_STORAGE_KEY, usersDb);
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
          safeSetStorage(DB_STORAGE_KEY, usersDb);
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
              safeSetStorage(DB_STORAGE_KEY, usersDb);
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
            safeSetStorage(DB_STORAGE_KEY, usersDb);
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
          safeSetStorage(LEVELS_STORAGE_KEY, wasteLevels);
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
            safeSetStorage(LEVELS_STORAGE_KEY, wasteLevels);
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
              safeSetStorage(LEVELS_STORAGE_KEY, wasteLevels);
              renderAll();
              showToast('Đã tải lên ' + wasteLevels.length + ' màn chơi từ levels.json!');
            } catch (err) {
              showToast('File levels.json không hợp lệ.', 'error');
            }
          };
          reader.readAsText(file);
          e.target.value = '';
        });

        renderAll();
      });
    })();
