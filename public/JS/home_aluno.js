let tarefas = [];
let sessoes = [];
let offsetSemana = 0;

const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleBtn');
const wrap = document.querySelector('.cl-wrap');
const DIAS = [
  { label: 'Dom', chave: 'Domingo' },
  { label: 'Seg', chave: 'Segunda' },
  { label: 'Ter', chave: 'Terça' },
  { label: 'Qua', chave: 'Quarta' },
  { label: 'Qui', chave: 'Quinta' },
  { label: 'Sex', chave: 'Sexta' },
  { label: 'Sáb', chave: 'Sábado' },
];
const grid = document.getElementById('semana-grid');
const overlay = document.getElementById('overlay');
const avatarBtn = document.getElementById('avatarBtn');
const avatarDropdown = document.getElementById('avatarDropdown');
const diasNomes = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const diasLongos = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const mesesCurtos = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const modal = document.getElementById('modal-sessao');
const btnAdd = document.getElementById('btn-add');
const btnFechar = document.getElementById('modal-fechar');
const btnCancelar = document.getElementById('modal-cancelar');
const btnConfirmar = document.getElementById('modal-confirmar');
const inputMateria = document.getElementById('modal-materia');
const selectDia = document.getElementById('modal-dia');
const modalTarefa = document.getElementById('modal-tarefa');
const btnModalTarefaFechar = document.getElementById('modal-tarefa-fechar');
const btnModalTarefaCancelar = document.getElementById('modal-tarefa-cancelar');
const btnModalTarefaConcluir = document.getElementById('modal-tarefa-concluir');
let tarefaSelecionadaId = null;

DIAS.forEach(({ label, chave }) => {
  const opt = document.createElement('option');
  opt.value = chave;
  opt.textContent = label;
  selectDia.appendChild(opt);
});

function abrirModal() { modal.classList.add('open'); }
function fecharModal() {
  modal.classList.remove('open');
  inputMateria.value = '';
  inputNome.value = '';
}

btnAdd.addEventListener('click', abrirModal);
btnFechar.addEventListener('click', fecharModal);
btnCancelar.addEventListener('click', fecharModal);
modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });
btnModalTarefaFechar.addEventListener('click', fecharModalTarefa);
btnModalTarefaCancelar.addEventListener('click', fecharModalTarefa);
modalTarefa.addEventListener('click', (e) => { if (e.target === modalTarefa) fecharModalTarefa(); });

btnModalTarefaConcluir.addEventListener('click', async () => {
  if (!tarefaSelecionadaId) return;

  try {
    const res = await fetch(`/concluir_tarefa/${tarefaSelecionadaId}`, {
      method: 'PATCH',
      credentials: 'include'
    });
    if (!res.ok) { console.error(await res.text()); return; }

    // Atualiza localmente para não precisar recarregar tudo
    const t = tarefas.find(t => t.id === tarefaSelecionadaId);
    if (t) t.concluida = true;

    btnModalTarefaConcluir.textContent = '✓ Concluída';
    btnModalTarefaConcluir.disabled = true;
    btnModalTarefaConcluir.classList.add('btn-concluir--feita');

    // Re-renderiza agenda e dashboard para refletir a mudança
    RenderizarAgenda();
    RenderizarDashboard();
  } catch (err) {
    console.error('Erro ao concluir tarefa:', err);
  }
});

(function () {
  const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const now = new Date();
  const dayEl = document.getElementById('js-day');
  const monEl = document.getElementById('js-month');
  if (dayEl) dayEl.textContent = now.getDate();
  if (monEl) monEl.textContent = MONTHS[now.getMonth()];
})();

btnConfirmar.addEventListener('click', async () => {
  const materia = inputMateria.value.trim();
  const dia = selectDia.value;
  if (!materia) return;
  await CriarSessao(materia, dia);
  fecharModal();
});

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

function toISO(d) {
  // Retorna YYYY-MM-DD para bater com as chaves data_inicio e data_fim da sua lista
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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
        card.className = 'task-card' + (tarefa.concluida ? ' task-card--concluida' : '');
        card.innerHTML = `<span>${tarefa.titulo}</span>`;
        card.addEventListener('click', () => abrirModalTarefa(tarefa));
        col.appendChild(card);
      });

      body.appendChild(col);
    });
  }
}

function RenderizarCronograma(sessoes) {
  const grid = document.getElementById('semana-grid');
  grid.innerHTML = '';

  DIAS.forEach(({ label, chave }) => {
    const col = document.createElement('div');
    col.className = 'dia-col';

    const header = document.createElement('div');
    header.className = 'dia-col-header';
    header.textContent = label;

    const body = document.createElement('div');
    body.className = 'dia-col-body';
    body.dataset.dia = chave;

    // drag-over na coluna
    body.addEventListener('dragover', (e) => {
      e.preventDefault();
      body.classList.add('drag-over');
    });
    body.addEventListener('dragleave', () => body.classList.remove('drag-over'));
    body.addEventListener('drop', (e) => {
      e.preventDefault();
      body.classList.remove('drag-over');
      const id = e.dataTransfer.getData('sessao-id');
      const card = document.querySelector(`.sessao[data-id="${id}"]`);
      if (card) {
        body.appendChild(card);
        atualizarDiaSessao(id, chave);
      }
    });

    // sessões do dia
    sessoes.filter(s => s.dia === chave).forEach(s => {
      body.appendChild(criarCard(s));
    });

    col.appendChild(header);
    col.appendChild(body);
    grid.appendChild(col);
  });
}

function criarCard(s) {
  const card = document.createElement('div');
  card.className = 'sessao';
  card.dataset.id = s.id;
  card.draggable = true;

  card.innerHTML = `
    <div class="sessao-info">
      <p class="sessao-materia">${s.materia}</p>
    </div>
    <button class="sessao-delete" title="Remover sessão">x</button>
  `;

  card.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('sessao-id', s.id);
    card.classList.add('dragging');
  });
  card.addEventListener('dragend', () => card.classList.remove('dragging'));

  card.querySelector('.sessao-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    deletarSessao(s.id, card);
  });

  return card;
}

async function CriarSessao(materia, dia) {
  try {
    const res = await fetch('/sessoes', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materia, dia })
    });
    if (!res.ok) { console.error(await res.text()); return; }
    const nova = await res.json();

    // adiciona o card na coluna correta sem re-renderizar tudo
    const col = document.querySelector(`.dia-col-body[data-dia="${dia}"]`);
    if (col) col.appendChild(criarCard(nova));
  } catch (err) {
    console.error('Erro ao criar sessão:', err);
  }
}

async function atualizarDiaSessao(id, novoDia) {
  try {
    await fetch(`/sessoes/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dia: novoDia })
    });
  } catch (err) {
    console.error('Erro ao atualizar sessão:', err);
  }
}

async function deletarSessao(id, card) {
  try {
    const res = await fetch(`/sessoes/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) { console.error(await res.text()); return; }
    card.remove();
  } catch (err) {
    console.error('Erro ao deletar sessão:', err);
  }
}

function abrirModalTarefa(tarefa) {
  tarefaSelecionadaId = tarefa.id;

  document.getElementById('modal-tarefa-titulo').textContent = tarefa.titulo;
  document.getElementById('modal-tarefa-descricao').textContent =
    tarefa.descricao || 'Sem descrição.';

  const formatarData = (iso) => {
    if (!iso) return '—';
    const [ano, mes, dia] = iso.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
  };

  document.getElementById('modal-tarefa-criada').querySelector('span').textContent =
    'Criada em ' + formatarData(tarefa.criado_em || tarefa.created_at);

  document.getElementById('modal-tarefa-prazo').querySelector('span').textContent =
    'Entrega: ' + formatarData(tarefa.data_fim);

  // Se já foi concluída, desabilita o botão
  if (tarefa.concluida) {
    btnModalTarefaConcluir.textContent = '✓ Concluída';
    btnModalTarefaConcluir.disabled = true;
    btnModalTarefaConcluir.classList.add('btn-concluir--feita');
  } else {
    btnModalTarefaConcluir.textContent = '✓ Marcar como concluída';
    btnModalTarefaConcluir.disabled = false;
    btnModalTarefaConcluir.classList.remove('btn-concluir--feita');
  }

  modalTarefa.classList.add('open');
}

function fecharModalTarefa() {
  modalTarefa.classList.remove('open');
  tarefaSelecionadaId = null;
}

async function CarregarTarefas() {
  try {
    const res = await fetch('/tarefas', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) { console.error(await res.text()); return; }
    tarefas = await res.json();
    RenderizarAgenda();
    RenderizarDashboard();
  } catch (error) {
    console.error('Erro de rede ao buscar tarefas:', error);
  }
}

async function CarregarSessoes() {
  try {
    const res = await fetch('/sessoes', { credentials: 'include' });
    if (!res.ok) { console.error(await res.text()); return; }
    sessoes = await res.json();
    RenderizarCronograma(sessoes);
    RenderizarDashboard();
  } catch (error) {
    console.error('Erro ao carregar sessões:', error);
  }
}

function RenderizarDashboard() {
  const hoje = new Date();
  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const diaHoje = diasSemana[hoje.getDay()];
  const hojeISO = toISO(hoje);

  // ── Sessões de hoje ──────────────────────────────────────
  const sessoesHoje = sessoes.filter(s => s.dia === diaHoje);
  const listaSessoes = document.getElementById('lista-sessoes-hoje');
  const badgeSessoes = document.getElementById('badge-sessoes');

  if (listaSessoes) {
    if (sessoesHoje.length === 0) {
      listaSessoes.innerHTML = '<li class="session-empty">Nenhuma sessão para hoje.</li>';
    } else {
      listaSessoes.innerHTML = sessoesHoje.map(s => `
        <li class="session-item">
          <div class="session-item__body">
            <span class="session-item__subject">${s.materia}</span>
          </div>
        </li>
      `).join('');
    }
  }

  if (badgeSessoes) {
    badgeSessoes.textContent = sessoesHoje.length === 1
      ? '1 sessão'
      : `${sessoesHoje.length} sessões`;
  }

  // ── Tarefas por urgência ─────────────────────────────────
  // Ordena pela data_fim mais próxima (já vem ordenado do servidor,
  // mas reordenamos aqui para garantir)
  const tarefasOrdenadas = [...tarefas].sort((a, b) => {
    if (!a.data_fim) return 1;
    if (!b.data_fim) return -1;
    return new Date(a.data_fim) - new Date(b.data_fim);
  });

  const listaTarefas = document.getElementById('lista-tarefas-dashboard');
  const badgeTarefas = document.getElementById('badge-tarefas');

  if (listaTarefas) {
    if (tarefasOrdenadas.length === 0) {
      listaTarefas.innerHTML = '<li class="session-empty">Nenhuma tarefa pendente.</li>';
    } else {
      listaTarefas.innerHTML = tarefasOrdenadas.map(t => {
        const urgencia = calcularUrgencia(t.data_fim, hojeISO);
        const concluidaClass = t.concluida ? 'task-item--concluida' : urgencia.classe;
        return `
    <li class="task-item ${concluidaClass}" data-id="${t.id}" style="cursor:pointer">
      <span class="task-item__dot"></span>
      <div class="task-item__body">
        <span class="task-item__name">${t.titulo}</span>
        <span class="task-item__meta">${t.concluida ? 'Concluída' : urgencia.label}</span>
      </div>
      ${!t.concluida && urgencia.tag ? `<span class="task-item__urgency">${urgencia.tag}</span>` : ''}
      ${t.concluida ? `<span class="task-item__urgency task-item__urgency--ok">✓</span>` : ''}
    </li>
  `;
      }).join('');

      // Adiciona listeners nos itens após renderizar
      listaTarefas.querySelectorAll('.task-item').forEach(li => {
        li.addEventListener('click', () => {
          const id = Number(li.dataset.id);
          const tarefa = tarefas.find(t => t.id === id);
          if (tarefa) abrirModalTarefa(tarefa);
        });
      });
    }
  }

  if (badgeTarefas) {
    badgeTarefas.textContent = tarefasOrdenadas.length === 1
      ? '1 em aberto'
      : `${tarefasOrdenadas.length} em aberto`;
  }
}

function calcularUrgencia(dataFim, hojeISO) {
  if (!dataFim) return { classe: '', label: 'Sem prazo', tag: '' };

  const fim = new Date(dataFim + 'T00:00:00');
  const hoje = new Date(hojeISO + 'T00:00:00');
  const diff = Math.round((fim - hoje) / (1000 * 60 * 60 * 24));

  if (diff < 0) return { classe: 'task-item--urgent', label: 'Atrasada', tag: 'atrasada' };
  if (diff === 0) return { classe: 'task-item--urgent', label: 'Vence hoje', tag: 'urgente' };
  if (diff === 1) return { classe: 'task-item--urgent', label: 'Vence amanhã', tag: 'urgente' };
  if (diff <= 3) return { classe: '', label: `Vence em ${diff} dias`, tag: '' };
  return { classe: '', label: `Vence em ${diff} dias`, tag: '' };
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
CarregarSessoes();