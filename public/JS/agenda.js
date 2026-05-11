// ── Estado ──────────────────────────────────────────────────
  // paginas[i] = array de tarefas da página i
  // Cada tarefa: { id, titulo, data (YYYY-MM-DD) }
  let paginas = JSON.parse(localStorage.getItem('ag-paginas') || 'null')
    || [[], [], []];

  let paginaAtual = 0;
  let offsetSemana = 0;   // 0 = semana atual, 1 = próxima, -1 = anterior
  let draggingId = null;

  const diasNomes  = ['D','S','T','Q','Q','S','S'];
  const diasLongos = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const mesesCurtos = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

  // ── Helpers ─────────────────────────────────────────────────
  function toISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  // Retorna os 7 dias da semana deslocada por offsetSemana
  function getSemana() {
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    // Começa na Domingo da semana atual
    const dom = new Date(hoje);
    dom.setDate(hoje.getDate() - hoje.getDay() + offsetSemana * 7);
    return Array.from({length: 7}, (_, i) => {
      const d = new Date(dom);
      d.setDate(dom.getDate() + i);
      return d;
    });
  }

  function salvar() {
    localStorage.setItem('ag-paginas', JSON.stringify(paginas));
  }

  // ── Trocar página ────────────────────────────────────────────
  function trocarPagina(idx, btn) {
    paginaAtual = idx;
    document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderizar();
  }

  // ── Navegar semanas ──────────────────────────────────────────
  function mudarSemana(dir) {
    offsetSemana += dir;
    renderizar();
  }

  // ── Abrir/fechar modal ───────────────────────────────────────
  function abrirModal() {
    // Popula o select com os dias da semana atual
    const semana = getSemana();
    const sel = document.getElementById('input-dia');
    sel.innerHTML = '';
    semana.forEach((d, i) => {
      const opt = document.createElement('option');
      opt.value = toISO(d);
      opt.textContent = `${diasLongos[i]}, ${d.getDate()} de ${mesesCurtos[d.getMonth()]}`;
      sel.appendChild(opt);
    });
    document.getElementById('input-titulo').value = '';
    document.getElementById('modal-overlay').classList.add('open');
    setTimeout(() => document.getElementById('input-titulo').focus(), 100);
  }

  function fecharModal() {
    document.getElementById('modal-overlay').classList.remove('open');
  }

  function fecharModalFora(e) {
    if (e.target === document.getElementById('modal-overlay')) fecharModal();
  }

  // ── Salvar tarefa ────────────────────────────────────────────
  function salvarTarefa() {
    const titulo = document.getElementById('input-titulo').value.trim();
    const data   = document.getElementById('input-dia').value;
    if (!titulo) { document.getElementById('input-titulo').focus(); return; }

    paginas[paginaAtual].push({ id: Date.now(), titulo, data });
    salvar();
    fecharModal();
    renderizar();
  }

  // ── Deletar tarefa ───────────────────────────────────────────
  function deletarTarefa(id) {
    paginas[paginaAtual] = paginas[paginaAtual].filter(t => t.id !== id);
    salvar();
    renderizar();
  }

  // ── Drag and Drop ────────────────────────────────────────────
  function onDragStart(e, id) {
    draggingId = id;
    setTimeout(() => e.target.classList.add('dragging'), 0);
  }

  function onDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.day-col').forEach(c => c.classList.remove('drag-over'));
  }

  function onDragOver(e, isoDate) {
    e.preventDefault();
    document.querySelectorAll('.day-col').forEach(c => c.classList.remove('drag-over'));
    e.currentTarget.classList.add('drag-over');
  }

  function onDrop(e, isoDate) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (draggingId == null) return;

    // Atualiza a data da tarefa arrastada
    const tarefa = paginas[paginaAtual].find(t => t.id === draggingId);
    if (tarefa) tarefa.data = isoDate;
    draggingId = null;
    salvar();
    renderizar();
  }

  // ── Renderizar ───────────────────────────────────────────────
  function renderizar() {
    const semana  = getSemana();
    const hojeISO = toISO(new Date());
    const tarefas = paginas[paginaAtual];

    // Label da semana no topbar
    const ini = semana[0], fim = semana[6];
    document.getElementById('week-label').textContent =
      `${ini.getDate()} ${mesesCurtos[ini.getMonth()]} — ${fim.getDate()} ${mesesCurtos[fim.getMonth()]} ${fim.getFullYear()}`;

    // Cabeçalho
    const header = document.getElementById('cal-header');
    header.innerHTML = '';
    semana.forEach((d, i) => {
      const iso = toISO(d);
      const cell = document.createElement('div');
      cell.className = 'cal-header-cell' + (iso === hojeISO ? ' today-col' : '');
      cell.innerHTML = `
        <span>${diasNomes[i]}</span>
        <span class="header-date">${d.getDate()}</span>
      `;
      header.appendChild(cell);
    });

    // Corpo
    const body = document.getElementById('cal-body');
    body.innerHTML = '';
    semana.forEach(d => {
      const iso = toISO(d);
      const col = document.createElement('div');
      col.className = 'day-col';
      col.addEventListener('dragover',  e => onDragOver(e, iso));
      col.addEventListener('drop',      e => onDrop(e, iso));

      // Tarefas do dia
      const tarefasDoDia = tarefas.filter(t => t.data === iso);
      tarefasDoDia.forEach(tarefa => {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.draggable = true;
        card.innerHTML = `
          <span>${tarefa.titulo}</span>
          <button class="remove-btn" title="Remover">✕</button>
        `;
        card.addEventListener('dragstart', e => onDragStart(e, tarefa.id));
        card.addEventListener('dragend',   onDragEnd);
        card.querySelector('.remove-btn').addEventListener('click', e => {
          e.stopPropagation();
          deletarTarefa(tarefa.id);
        });
        col.appendChild(card);
      });

      body.appendChild(col);
    });
  }

  // Enter no input do modal confirma
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.getElementById('modal-overlay').classList.contains('open')) {
      salvarTarefa();
    }
    if (e.key === 'Escape') fecharModal();
  });

  renderizar();

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