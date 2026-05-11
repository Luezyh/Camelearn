const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleBtn');
const wrap = document.querySelector('.cl-wrap');

// ── Sidebar toggle ──────────────────────────────────────────────
toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  wrap.classList.toggle('sidebar-open');
});

// Keep active state on sidebar nav items
document.querySelectorAll('.cl-nav-item:not(.cl-logout)').forEach(item => {
  item.addEventListener('click', function () {
    document.querySelectorAll('.cl-nav-item').forEach(n => n.classList.remove('active'));
    this.classList.add('active');
  });
});

// ── Dropdown logic ───────────────────────────────────────────────
const overlay = document.getElementById('overlay');
const notifBtn = document.getElementById('notifBtn');
const notifDropdown = document.getElementById('notifDropdown');
const notifDot = document.getElementById('notifDot');
const avatarBtn = document.getElementById('avatarBtn');
const avatarDropdown = document.getElementById('avatarDropdown');

let unreadCount = 2; // matches the two .cl-notif-unread items in HTML

function openDropdown(btn, dropdown) {
  // Close any other open dropdown first
  closeAllDropdowns();

  btn.classList.add('active');
  dropdown.classList.add('open');
  dropdown.setAttribute('aria-hidden', 'false');
  btn.setAttribute('aria-expanded', 'true');
  overlay.classList.add('active');
}

function closeAllDropdowns() {
  [notifBtn, avatarBtn].forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-expanded', 'false');
  });
  [notifDropdown, avatarDropdown].forEach(d => {
    d.classList.remove('open');
    d.setAttribute('aria-hidden', 'true');
  });
  overlay.classList.remove('active');
}

function toggleDropdown(btn, dropdown) {
  if (dropdown.classList.contains('open')) {
    closeAllDropdowns();
  } else {
    openDropdown(btn, dropdown);
  }
}

notifBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleDropdown(notifBtn, notifDropdown);
});

avatarBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleDropdown(avatarBtn, avatarDropdown);
});

// Click overlay → close everything
overlay.addEventListener('click', closeAllDropdowns);

// Escape key closes dropdowns
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAllDropdowns();
});

// ── Mark all notifications as read ──────────────────────────────
document.querySelector('.cl-dropdown-mark-all').addEventListener('click', () => {
  document.querySelectorAll('.cl-notif-item.cl-notif-unread').forEach(item => {
    item.classList.remove('cl-notif-unread');
    const badge = item.querySelector('.cl-notif-badge');
    if (badge) badge.remove();
  });
  unreadCount = 0;
  notifDot.classList.add('hidden');
});

// Clicking an individual unread notification marks it read
document.querySelectorAll('.cl-notif-item.cl-notif-unread').forEach(item => {
  item.addEventListener('click', function () {
    if (this.classList.contains('cl-notif-unread')) {
      this.classList.remove('cl-notif-unread');
      const badge = this.querySelector('.cl-notif-badge');
      if (badge) badge.remove();
      unreadCount = Math.max(0, unreadCount - 1);
      if (unreadCount === 0) notifDot.classList.add('hidden');
    }
  });
});

async function EncerrarSessao() {
  await fetch('/logout', { method: 'POST', credentials: 'include' });
  window.location.href = '/login';
}

(async () => {
  const res = await fetch('/auth/me', { credentials: 'include' });
  const usuario = await res.json();
  if (res.ok) {
    const username1 = document.querySelector('.cl-user-name');
    const username2 = document.querySelector('.cl-profile-name');

    const userEmail = document.querySelector('.cl-profile-email');
    
    username1.textContent = usuario.nome;
    username2.textContent = usuario.nome;
    userEmail.textContent = usuario.email;
  }

})();