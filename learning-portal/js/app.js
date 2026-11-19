(function () {
      const DB_STORAGE_KEY = 'edupath_users_db_v1';
      const SESSION_STORAGE_KEY = 'edupath_current_user_v1';

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

      let usersDb = safeGetStorage(DB_STORAGE_KEY, []);
      let currentUser = safeGetStorage(SESSION_STORAGE_KEY, null);

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
          ? 'bg-slate-800 text-white'
          : 'bg-emerald-600 text-white';
        toast.className = 'pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-xs font-semibold flex items-center justify-between gap-3 fade-in ' + bgClass;
        toast.innerHTML = '<span>' + escapeHtml(message) + '</span>';
        container.appendChild(toast);
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 3000);
      }

      function switchView(viewName) {
        const viewBlank = document.getElementById('viewBlank');
        const viewParent = document.getElementById('viewParent');
        const viewDb = document.getElementById('viewDb');

        const navBlankBtn = document.getElementById('navBlankBtn');
        const navParentBtn = document.getElementById('navParentBtn');
        const navDbBtn = document.getElementById('navDbBtn');

        viewBlank.classList.add('hidden');
        viewParent.classList.add('hidden');
        viewDb.classList.add('hidden');

        const inactiveClass = 'px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 text-slate-600 hover:bg-slate-100';
        const activeClass = 'px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 bg-slate-100 text-slate-900';

        navBlankBtn.className = inactiveClass;
        navParentBtn.className = inactiveClass;
        navDbBtn.className = inactiveClass;

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
          headerUsername.textContent = currentUser.username;
          headerBirthYearBadge.textContent = 'Năm sinh: ' + currentUser.birthYear;
          openAuthModalBtn.classList.add('hidden');
          logoutBtn.classList.remove('hidden');

          blankPageUserCard.classList.remove('hidden');
          blankCardUser.textContent = currentUser.username;
          blankCardBirthYear.textContent = 'Năm sinh: ' + currentUser.birthYear;
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
        const detailBirthYear = document.getElementById('detailBirthYear');
        const detailCreatedAt = document.getElementById('detailCreatedAt');

        if (currentUser) {
          profileAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
          profileUsername.textContent = currentUser.username;
          profileRoleText.textContent = 'Đã đồng bộ từ Database';
          profileStatusPill.textContent = 'Đang hoạt động';
          profileStatusPill.className = 'px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200';

          detailUsername.textContent = currentUser.username;
          detailBirthYear.textContent = String(currentUser.birthYear);
          detailCreatedAt.textContent = currentUser.createdAt || 'Hôm nay';
        } else {
          profileAvatar.textContent = '?';
          profileUsername.textContent = 'Chưa đăng nhập';
          profileRoleText.textContent = 'Đăng nhập để xem thông tin tài khoản';
          profileStatusPill.textContent = 'Khách';
          profileStatusPill.className = 'px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600';

          detailUsername.textContent = '—';
          detailBirthYear.textContent = '—';
          detailCreatedAt.textContent = '—';
        }

        const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const weeklyBarsContainer = document.getElementById('weeklyBarsContainer');
        weeklyBarsContainer.innerHTML = days.map(function (label) {
          return (
            '<div class="flex-1 flex flex-col items-center h-full justify-end">' +
              '<span class="text-[11px] font-medium text-slate-400 mb-1">0p</span>' +
              '<div class="w-full max-w-[38px] rounded-t-lg bg-slate-200" style="height: 8%"></div>' +
              '<span class="text-xs font-semibold text-slate-600 mt-2">' + label + '</span>' +
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
            '<div class="flex items-center justify-between gap-2 text-xs bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">' +
              '<span class="text-slate-700">📌 ' + escapeHtml(note) + '</span>' +
              '<button type="button" data-del-note="' + idx + '" class="text-slate-400 hover:text-rose-600 font-bold">✕</button>' +
            '</div>'
          );
        }).join('');
      }

      function renderDbTable() {
        const tbody = document.getElementById('dbUsersTableBody');
        if (!tbody) return;
        if (usersDb.length === 0) {
          tbody.innerHTML = (
            '<tr>' +
              '<td colspan="6" class="py-8 text-center text-slate-400 text-xs">' +
                'Database hiện đang trống. Hãy nhấn "Đăng nhập / Đăng ký" để tạo tài khoản mới.' +
              '</td>' +
            '</tr>'
          );
          return;
        }

        tbody.innerHTML = usersDb.map(function (u, i) {
          const isCurrent = currentUser && currentUser.username.toLowerCase() === u.username.toLowerCase();
          return (
            '<tr class="hover:bg-slate-50/80 transition">' +
              '<td class="py-3 px-3 text-xs font-mono text-slate-500">#' + (i + 1) + '</td>' +
              '<td class="py-3 px-3 font-semibold text-slate-900">' +
                escapeHtml(u.username) +
                (isCurrent ? ' <span class="ml-1 px-1.5 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-700 font-semibold">Đang dùng</span>' : '') +
              '</td>' +
              '<td class="py-3 px-3 text-xs font-mono text-slate-500">' + escapeHtml(u.password) + '</td>' +
              '<td class="py-3 px-3 font-semibold text-slate-800">' + escapeHtml(u.birthYear) + '</td>' +
              '<td class="py-3 px-3 text-xs text-slate-500">' + escapeHtml(u.createdAt || '—') + '</td>' +
              '<td class="py-3 px-3 text-right space-x-2">' +
                '<button type="button" data-use-user="' + escapeHtml(u.username) + '" class="text-xs font-semibold text-indigo-600 hover:underline">Chọn TK</button>' +
                '<button type="button" data-del-user="' + escapeHtml(u.username) + '" class="text-xs font-semibold text-rose-600 hover:underline">Xóa</button>' +
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
          tabRegisterBtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg bg-white text-slate-900 shadow-xs transition';
          tabLoginBtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 transition';
        } else {
          registerForm.classList.add('hidden');
          loginForm.classList.remove('hidden');
          tabLoginBtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg bg-white text-slate-900 shadow-xs transition';
          tabRegisterBtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 transition';
        }
      }

      window.addEventListener('DOMContentLoaded', function () {
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
          renderAll();
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
          renderAll();
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
          showToast('Đăng nhập thành công!');
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

        document.getElementById('exportDbJsonBtn').addEventListener('click', function () {
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
          usersDb = [];
          currentUser = null;
          safeSetStorage(DB_STORAGE_KEY, []);
          safeSetStorage(SESSION_STORAGE_KEY, null);
          renderAll();
          showToast('Đã xóa trắng Database.', 'info');
        });

        document.getElementById('dbUsersTableBody').addEventListener('click', function (e) {
          const useBtn = e.target.closest('[data-use-user]');
          if (useBtn) {
            const uname = useBtn.getAttribute('data-use-user');
            const found = usersDb.find(function (u) { return u.username === uname; });
            if (found) {
              currentUser = found;
              safeSetStorage(SESSION_STORAGE_KEY, currentUser);
              renderAll();
              showToast('Đã chuyển sang tài khoản "' + found.username + '".');
            }
            return;
          }

          const delBtn = e.target.closest('[data-del-user]');
          if (delBtn) {
            const uname = delBtn.getAttribute('data-del-user');
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
