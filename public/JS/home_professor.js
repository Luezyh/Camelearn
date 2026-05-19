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
const avatarBtn = document.getElementById('avatarBtn');
const avatarDropdown = document.getElementById('avatarDropdown');

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
  [avatarBtn].forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-expanded', 'false');
  });
  [avatarDropdown].forEach(d => {
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

function MudarSecao(secao) {
  const secoes = document.querySelectorAll('section');
  secoes.forEach(s => s.style.display = 'none');
  document.getElementById(secao).style.display = 'flex';
}
async function EncerrarSessao() {
  await fetch('/logout', { method: 'POST', credentials: 'include' });
  window.location.href = '/login';
}