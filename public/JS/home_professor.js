const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleBtn');
const wrap = document.querySelector('.cl-wrap');
const tabs = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.tab-panel');
const overlay = document.getElementById('overlay');
const avatarBtn = document.getElementById('avatarBtn');
const avatarDropdown = document.getElementById('avatarDropdown');


toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  wrap.classList.toggle('sidebar-open');
});

document.querySelectorAll('.cl-nav-item:not(.cl-logout)').forEach(item => {
  item.addEventListener('click', function () {
    document.querySelectorAll('.cl-nav-item').forEach(n => n.classList.remove('active'));
    this.classList.add('active');
  });
});

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

overlay.addEventListener('click', closeAllDropdowns);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAllDropdowns();
});

function filtrarTurmas(query) {
  const cards = document.querySelectorAll('.turma-card');
  const empty = document.getElementById('empty-turmas');
  const q     = query.toLowerCase().trim();
  let visivel = 0;

  cards.forEach(card => {
    const nome = card.dataset.nome.toLowerCase();
    const show = !q || nome.includes(q);
    card.style.display = show ? '' : 'none';
    if (show) visivel++;
  });

  empty.style.display = visivel === 0 ? 'flex' : 'none';
}

function abrirTurma(id) {

}

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    panels.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.getElementById(`panel-${btn.dataset.tab}`).classList.add('active');
  });
});

function filtrarUsuarios(query) {
  const items = document.querySelectorAll('.usuario-item');
  const empty = document.getElementById('empty-usuarios');
  const q = query.toLowerCase().trim();
  let visivel = 0;

  items.forEach(item => {
    const show = !q || item.dataset.nome.toLowerCase().includes(q);
    item.style.display = show ? '' : 'none';
    if (show) visivel++;
  });

  // Esconde labels de grupo se não houver itens visíveis abaixo
  document.querySelectorAll('.group-label').forEach(label => {
    let next = label.nextElementSibling;
    let temVisivel = false;
    while (next && !next.classList.contains('group-label')) {
      if (next.classList.contains('usuario-item') && next.style.display !== 'none') {
        temVisivel = true;
      }
      next = next.nextElementSibling;
    }
    label.style.display = temVisivel ? '' : 'none';
  });

  empty.style.display = visivel === 0 ? 'flex' : 'none';
}

function MudarSecao(secao) {
  const secoes = document.querySelectorAll('section');
  secoes.forEach(s => s.style.display = 'none');
  document.getElementById(secao).style.display = 'flex';
}

async function CarregarTurma(id) {
  const response = await fetch(`/turmas/${id}`);

  if (response.ok) {
    const turma = await response.json();
    const turmaSection = document.getElementById('turma-selecionada');
    turmaSection.innerHTML = `
    <h2>${turma.nome}</h2>
    <p>${turma.descricao}</p>
    `;
    MudarSecao('turma-selecionada');
  }
}

async function EncerrarSessao() {
  await fetch('/logout', { method: 'POST', credentials: 'include' });
  window.location.href = '/login';
}