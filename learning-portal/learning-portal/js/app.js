(function () {
      const DB_STORAGE_KEY = 'edupath_users_db_v1';
      const SESSION_STORAGE_KEY = 'edupath_current_user_v1';
      const THEME_STORAGE_KEY = 'edupath_theme_v1';

      const DEFAULT_ADMIN = {
        id: 'usr_admin_01',
        username: 'Admin',
        password: 'xhauwfihf09124',
        birthYear: 2000,
        role: 'admin',
        isPrimaryAdmin: true,
        createdAt: 'Mặc định',
        parentNotes: []
      };

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
        }
        return list;
      }

      let usersDb = ensureAdminAccount(safeGetStorage(DB_STORAGE_KEY, []));
      safeSetStorage(DB_STORAGE_KEY, usersDb);

      let currentUser = safeGetStorage(SESSION_STORAGE_KEY, null);
      let currentView = 'blank';
      let showAllPasswords = false;
      const revealedUsernames = new Set();

      function isAdmin(user) {
        return Boolean(user && user.role === 'admin');
      }

      // Theme management (Light / Dark mode)
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
        const savedTheme = safeGetStorage(THEME_STORAGE_KEY, 'light');
        applyTheme(savedTheme);
      }

      function toggleTheme() {
        const isCurrentlyDark = document.documentElement.classList.contains('dark');
        const nextTheme = isCurrentlyDark ? 'light' : 'dark';
        safeSetStorage(THEME_STORAGE_KEY, nextTheme);
        applyTheme(nextTheme);
      }

      function syncCurrentUser() {
        if (!currentUser) return;
        const found = usersDb.find(function (u) {
          return u.username.toLowerCase() === currentUser.username.toLowerCase();
        });
        if (found) {
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
          showToast('Chỉ tài khoản Admin mới có quyền xem Database.', 'error');
          viewName = 'blank';
        }
        currentView = viewName;

        const viewBlank = document.getElementById('viewBlank');
        const viewParent = document.getElementById('viewParent');
        const viewDb = document.getElementById('viewDb');

        const navBlankBtn = document.getElementById('navBlankBtn');
        const navParentBtn = document.getElementById('navParentBtn');
        const navDbBtn = document.getElementById('navDbBtn');

        viewBlank.classList.add('hidden');
        viewParent.classList.add('hidden');
        viewDb.classList.add('hidden');

        const inactiveClass = 'px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800';
        const activeClass = 'px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white';

        navBlankBtn.className = inactiveClass;
        navParentBtn.className = inactiveClass;
        navDbBtn.className = (isAdmin(currentUser) ? '' : 'hidden ') + inactiveClass;

        if (viewName === 'parent') {
          viewParent.classList.remove('hidden');
          navParentBtn.className = activeClass;
        } else if (viewName === 'db') {
          viewDb.classList.remove('hidden');
          navDbBtn.className = activeClass;
        } else {
          viewBlank.classList.remove('hidden');
          navBlankBtn.className = activeClass;
        }

        renderAll();
      }

      function renderHeaderAndBlankView() {
        syncCurrentUser();
        const dbCountBadge = document.getElementById('dbCountBadge');
        if (dbCountBadge) dbCountBadge.textContent = String(usersDb.length);

        const navDbBtn = document.getElementById('navDbBtn');
        if (navDbBtn) {
          if (isAdmin(currentUser)) {
            navDbBtn.classList.remove('hidden');
          } else {
            navDbBtn.classList.add('hidden');
            if (currentView === 'db') {
              currentView = 'blank';
              document.getElementById('viewDb').classList.add('hidden');
              document.getElementById('viewBlank').classList.remove('hidden');
            }
          }
        }

        const userHeaderInfo = document.getElementById('userHeaderInfo');
        const headerUsername = document.getElementById('headerUsername');
        const headerBirthYearBadge = document.getElementById('headerBirthYearBadge');
        const openAuthModalBtn = document.getElementById('openAuthModalBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        const blankPageUserCard = document.getElementById('blankPageUserCard');
        const blankCardUser = document.getElementById('blankCardUser');
        const blankCardBirthYear = document.getElementById('blankCardBirthYear');
        const heroAuthBtn = document.getElementById('heroAuthBtn');

        if (currentUser) {
          userHeaderInfo.classList.remove('hidden');
          headerUsername.textContent = currentUser.username + (isAdmin(currentUser) ? ' (Admin)' : '');
          headerBirthYearBadge.textContent = 'Năm sinh: ' + currentUser.birthYear;
          openAuthModalBtn.classList.add('hidden');
          logoutBtn.classList.remove('hidden');

          blankPageUserCard.classList.remove('hidden');
          blankCardUser.textContent = currentUser.username;
          blankCardBirthYear.textContent = isAdmin(currentUser) ? 'Quản trị viên (Admin)' : ('Năm sinh: ' + currentUser.birthYear);
          heroAuthBtn.textContent = 'Đổi tài khoản khác';
        } else {
          userHeaderInfo.classList.add('hidden');
          openAuthModalBtn.classList.remove('hidden');
          logoutBtn.classList.add('hidden');
          blankPageUserCard.classList.add('hidden');
          heroAuthBtn.textContent = 'Đăng nhập / Đăng ký';
        }
      }

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
          profileRoleText.textContent = 'Đăng nhập để xem thông tin tài khoản';
          profileStatusPill.textContent = 'Khách';
          profileStatusPill.className = 'px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';

          detailUsername.textContent = '—';
          detailRole.textContent = '—';
          detailBirthYear.textContent = '—';
          detailCreatedAt.textContent = '—';
        }

        const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const weeklyBarsContainer = document.getElementById('weeklyBarsContainer');
        weeklyBarsContainer.innerHTML = days.map(function (label) {
          return (
            '<div class="flex-1 flex flex-col items-center h-full justify-end">' +
              '<span class="text-[11px] font-medium text-slate-400 mb-1">0p</span>' +
              '<div class="w-full max-w-[38px] rounded-t-lg bg-slate-200 dark:bg-slate-700" style="height: 8%"></div>' +
              '<span class="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2">' + label + '</span>' +
            '</div>'
          );
        }).join('');

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

      function renderAll() {
        renderHeaderAndBlankView();
        renderParentPortal();
        renderDbTable();
      }

      function openAuthModal(defaultTab) {
        const backdrop = document.getElementById('authModalBackdrop');
        backdrop.classList.remove('hidden');
        backdrop.classList.add('flex');
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

        document.getElementById('brandHomeBtn').addEventListener('click', function () { switchView('blank'); });
        document.getElementById('navBlankBtn').addEventListener('click', function () { switchView('blank'); });
        document.getElementById('navParentBtn').addEventListener('click', function () { switchView('parent'); });
        document.getElementById('navDbBtn').addEventListener('click', function () { switchView('db'); });

        document.getElementById('heroAuthBtn').addEventListener('click', function () { openAuthModal('register'); });
        document.getElementById('heroParentBtn').addEventListener('click', function () { switchView('parent'); });
        document.getElementById('blankGoParentBtn').addEventListener('click', function () { switchView('parent'); });

        document.getElementById('openAuthModalBtn').addEventListener('click', function () { openAuthModal('login'); });
        document.getElementById('parentSwitchAccountBtn').addEventListener('click', function () { openAuthModal('register'); });
        document.getElementById('closeAuthModalBtn').addEventListener('click', closeAuthModal);

        document.getElementById('tabLoginBtn').addEventListener('click', function () { switchAuthTab('login'); });
        document.getElementById('tabRegisterBtn').addEventListener('click', function () { switchAuthTab('register'); });

        document.getElementById('logoutBtn').addEventListener('click', function () {
          currentUser = null;
          safeSetStorage(SESSION_STORAGE_KEY, null);
          showToast('Đã đăng xuất tài khoản.', 'info');
          if (currentView === 'db') {
            switchView('blank');
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
            parentNotes: []
          };

          usersDb.push(newUser);
          safeSetStorage(DB_STORAGE_KEY, usersDb);
          currentUser = newUser;
          safeSetStorage(SESSION_STORAGE_KEY, currentUser);

          document.getElementById('registerForm').reset();
          closeAuthModal();
          showToast('Đăng ký thành công và đã lưu vào Database!');
          if (currentView === 'db') {
            switchView('blank');
          } else {
            renderAll();
          }
        });

        document.getElementById('loginForm').addEventListener('submit', function (e) {
          e.preventDefault();
          const username = document.getElementById('loginUsername').value.trim();
          const password = document.getElementById('loginPassword').value;
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
          document.getElementById('loginForm').reset();
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
          if (!showAllPasswords) {
            revealedUsernames.clear();
          }
          renderDbTable();
        });

        document.getElementById('exportDbJsonBtn').addEventListener('click', function () {
          if (!isAdmin(currentUser)) return;
          const payload = {
            exportedAt: new Date().toISOString(),
            totalUsers: usersDb.length,
            users: usersDb
          };
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
            if (revealedUsernames.has(uname)) {
              revealedUsernames.delete(uname);
            } else {
              revealedUsernames.add(uname);
            }
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
              if (!isAdmin(found) && currentView === 'db') {
                switchView('blank');
              } else {
                renderAll();
              }
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

        renderAll();
      });
    })();
