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

// Agenda
let tarefas = []; 
let sessoes = [];
let offsetSemana = 0;   // 0 = semana atual, 1 = próxima, -1 = anterior
let draggingId = null;

const diasNomes = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const diasLongos = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const mesesCurtos = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// ── Helpers ─────────────────────────────────────────────────
function toISO(d) {
  // Retorna YYYY-MM-DD para bater com as chaves data_inicio e data_fim da sua lista
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Retorna os 7 dias da semana deslocada por offsetSemana
function getSemana() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  // Começa no Domingo da semana atual
  const dom = new Date(hoje);
  dom.setDate(hoje.getDate() - hoje.getDay() + offsetSemana * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(dom);
    d.setDate(dom.getDate() + i);
    return d;
  });
}

function mudarSemana(dir) {
  offsetSemana += dir;
  RenderizarAgenda();
}

function RenderizarAgenda() {
  const semana = getSemana();
  const hojeISO = toISO(new Date());

  // Label da semana no topbar
  const ini = semana[0], fim = semana[6];
  const weekLabel = document.getElementById('week-label');
  if (weekLabel) {
      weekLabel.textContent =
        `${ini.getDate()} ${mesesCurtos[ini.getMonth()]} — ${fim.getDate()} ${mesesCurtos[fim.getMonth()]} ${fim.getFullYear()}`;
  }

  // Cabeçalho
  const header = document.getElementById('cal-header');
  if (header) {
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
  }

  // Corpo
  const body = document.getElementById('cal-body');
  if (body) {
      body.innerHTML = '';
      semana.forEach(d => {
        const iso = toISO(d);
        const col = document.createElement('div');
        col.className = 'day-col';

        // Aqui organizamos pela "data_fim". 
        // Se preferir exibir pela data de início, basta trocar para "t.data_inicio === iso"
        const tarefasDoDia = tarefas.filter(t => t.data_fim === iso);
        
        tarefasDoDia.forEach(tarefa => {
          const card = document.createElement('div');
          card.className = 'task-card';
          
          // Reutiliza os elementos que o card já organizava (titulo)
          card.innerHTML = `
              <span>${tarefa.titulo}</span>
            `;
          
          col.appendChild(card);
        });

        body.appendChild(col);
      });
  }
}

async function CarregarTarefas() {
  try {
    const res = await fetch('/tarefas', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      const erroTexto = await res.text();
      console.error(`Erro ${res.status}: ${erroTexto}`);
      return;
    }

    tarefas = await res.json();
    RenderizarAgenda(); 
    
    return tarefas;

  } catch (error) {
    console.error('Erro de rede ao buscar tarefas:', error);
  }
}

function RenderizarSessoes() {
  const semana = getSemana();
  const hojeISO = toISO(new Date());

  // Cabeçalho
  const header = document.getElementById('session-cal-header');
  if (header) {
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
  }

  // Corpo
  const body = document.getElementById('session-cal-body');
  if (body) {
      body.innerHTML = '';
      semana.forEach(d => {
        const iso = toISO(d);
        const col = document.createElement('div');
        col.className = 'day-col';

        // Aqui organizamos pela "data_fim". 
        // Se preferir exibir pela data de início, basta trocar para "t.data_inicio === iso"
        const sessoesDoDia = sessoes.filter(t => t.data_fim === iso);
        
        sessoesDoDia.forEach(sessao => {
          const card = document.createElement('div');
          card.className = 'task-card';
          
          // Reutiliza os elementos que o card já organizava (titulo)
          card.innerHTML = `
              <span>${sessao.titulo}</span>
            `;
          
          col.appendChild(card);
        });

        body.appendChild(col);
      });
  }
}

function MudarSecao(secao) {
  const secoes = document.querySelectorAll('section');
  secoes.forEach(s => s.classList.remove('show'));
  document.getElementById(secao).classList.add('show');
}

async function EncerrarSessao() {
  await fetch('/logout', { method: 'POST', credentials: 'include' });
  window.location.href = '/login';
}

CarregarTarefas();
RenderizarSessoes();