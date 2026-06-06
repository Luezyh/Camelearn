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

function MudarSecao(secao) {
  const secoes = document.querySelectorAll('section');
  secoes.forEach(s => s.classList.remove('show'));
  document.getElementById(secao).classList.add('show');

  if (secao === 'turma-section') carregarTarefasTurma();
}

async function EncerrarSessao() {
  await fetch('/logout', { method: 'POST', credentials: 'include' });
  window.location.href = '/login';
}

// ===== TURMA SECTION =====
const modalOverlay = document.getElementById('modalOverlay');
const btnAbrirModalTarefa = document.getElementById('btnAbrirModalTarefa');
const btnFecharModal = document.getElementById('btnFecharModal');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvarTarefa = document.getElementById('btnSalvarTarefa');
const listaTarefas = document.getElementById('listaTarefas');
const tarefaFeedback = document.getElementById('tarefaFeedback');

function abrirModal() {
  modalOverlay.classList.add('open');
  document.getElementById('tarefaTitulo').value = '';
  document.getElementById('tarefaDescricao').value = '';
  document.getElementById('tarefaTipo').value = '';
  document.getElementById('tarefaData').value = '';
  tarefaFeedback.textContent = '';
  tarefaFeedback.className = 'ts-feedback';
}

function fecharModal() {
  modalOverlay.classList.remove('open');
}

btnAbrirModalTarefa.addEventListener('click', abrirModal);
btnFecharModal.addEventListener('click', fecharModal);
btnCancelar.addEventListener('click', fecharModal);

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) fecharModal();
});

function adicionarTarefaNaLista(titulo, descricao, data, tipo) {
  const vazia = listaTarefas.querySelector('.ts-tarefa-vazia');
  if (vazia) vazia.remove();

  const tipoLabel = { atividade: 'Atividade', trabalho: 'Trabalho', prova: 'Prova' };

  const li = document.createElement('li');
  li.className = 'ts-tarefa-item';
  li.innerHTML = `
    <span class="ts-tarefa-titulo">${titulo}</span>
    ${descricao ? `<span class="ts-tarefa-desc">${descricao}</span>` : ''}
    <div class="ts-tarefa-meta">
      ${tipo ? `<span class="ts-tarefa-tipo ts-tipo-${tipo}">${tipoLabel[tipo]}</span>` : ''}
      ${data ? `<span class="ts-tarefa-data">Entrega: ${data}</span>` : ''}
    </div>
  `;
  listaTarefas.appendChild(li);
}

btnSalvarTarefa.addEventListener('click', async () => {
  const titulo = document.getElementById('tarefaTitulo').value.trim();
  const descricao = document.getElementById('tarefaDescricao').value.trim();
  const tipo = document.getElementById('tarefaTipo').value;
  const data = document.getElementById('tarefaData').value;

  if (!titulo) {
    tarefaFeedback.textContent = 'O título é obrigatório.';
    tarefaFeedback.className = 'ts-feedback erro';
    return;
  }

  if (!tipo) {
    tarefaFeedback.textContent = 'Selecione o tipo da tarefa.';
    tarefaFeedback.className = 'ts-feedback erro';
    return;
  }

  btnSalvarTarefa.disabled = true;
  btnSalvarTarefa.textContent = 'Salvando...';

  try {
    const res = await fetch('/criar_tarefa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ titulo, descricao, data_fim: data, tipo })
    });

    if (!res.ok) throw new Error(await res.text());

    tarefaFeedback.textContent = 'Tarefa criada com sucesso!';
    tarefaFeedback.className = 'ts-feedback sucesso';
    adicionarTarefaNaLista(titulo, descricao, data, tipo);

    setTimeout(fecharModal, 1200);
  } catch (err) {
    tarefaFeedback.textContent = err.message || 'Erro ao criar tarefa.';
    tarefaFeedback.className = 'ts-feedback erro';
  } finally {
    btnSalvarTarefa.disabled = false;
    btnSalvarTarefa.textContent = 'Salvar Tarefa';
  }
});

async function carregarTarefasTurma() {
  try {
    const res = await fetch('/tarefas_turma/1', { credentials: 'include' });
    if (!res.ok) throw new Error(await res.text());
    const tarefas = await res.json();

    listaTarefas.innerHTML = '';

    if (tarefas.length === 0) {
      listaTarefas.innerHTML = '<li class="ts-tarefa-vazia">Nenhuma tarefa criada ainda.</li>';
      return;
    }

    tarefas.forEach(t => {
      adicionarTarefaNaLista(t.titulo, t.descricao, t.data_fim, t.tipo);
    });
  } catch (err) {
    listaTarefas.innerHTML = '<li class="ts-tarefa-vazia">Erro ao carregar tarefas.</li>';
  }
}

// Chame isso quando a página carregar
async function carregarInicio() {
  // Saudação por período do dia
  const hora = new Date().getHours();
  const periodo = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  document.getElementById('hiPeriodo').textContent = periodo;

  // Data formatada
  const agora = new Date();
  document.getElementById('hiData').textContent = agora.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  // Busca tarefas da turma
  const res = await fetch('/tarefas_turma/1');
  if (!res.ok) return;
  const tarefas = await res.json();

  // Total no card
  document.getElementById('hiTotalTarefas').textContent = tarefas.length;

  // Próxima entrega
  const proxima = tarefas[0]; // já vem ordenado por data_fim ASC
  if (proxima) {
    const dataFormatada = new Date(proxima.data_fim + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short'
    });
    document.getElementById('hiProximaData').textContent = dataFormatada;
    document.getElementById('hiProximaTitulo').textContent = proxima.titulo;
  }

  // Lista de próximas tarefas (máx. 5)
  const lista = document.getElementById('hiListaTarefas');
  lista.innerHTML = '';

  if (tarefas.length === 0) {
    lista.innerHTML = '<li class="hi-tarefas-vazia">Nenhuma tarefa criada ainda.</li>';
    return;
  }

  const cores = {
    atividade: 'ts-tipo-atividade',
    trabalho:  'ts-tipo-trabalho',
    prova:     'ts-tipo-prova'
  };

  tarefas.slice(0, 5).forEach(t => {
    const data = new Date(t.data_fim + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
    const li = document.createElement('li');
    li.className = 'hi-tarefa-item';
    li.innerHTML = `
      <span class="hi-tarefa-tipo ts-tarefa-tipo ${cores[t.tipo] || ''}">${t.tipo}</span>
      <div class="hi-tarefa-info">
        <div class="hi-tarefa-titulo">${t.titulo}</div>
        <div class="hi-tarefa-data">Entrega: ${data}</div>
      </div>
    `;
    lista.appendChild(li);
  });
}

// Chame carregarInicio() junto com os outros inits da página
carregarInicio();