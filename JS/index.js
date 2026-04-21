let idEdicao = null;

async function listarUsuarios() {
    const res = await fetch('http://localhost:3000/usuarios');
    const dados = await res.json();
    const lista = document.getElementById('listaUsuarios');
    lista.innerHTML = dados.map(u => `
                <li>
                    ${u.nome} - ${u.email}
                    <button onclick="prepararEdicao(${u.id}, '${u.nome}', '${u.email}')">Editar</button>
                    <button onclick="deletarUsuario(${u.id})">Excluir</button>
                </li>
            `).join('');
}

async function salvar() {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    await fetch('http://localhost:3000/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email })
    });
    limpar();
    listarUsuarios();
}

async function deletarUsuario(id) {
    await fetch(`http://localhost:3000/usuarios/${id}`, { method: 'DELETE' });
    listarUsuarios();
}

function prepararEdicao(id, nome, email) {
    idEdicao = id;
    document.getElementById('nome').value = nome;
    document.getElementById('email').value = email;
}

async function atualizar() {
    if (!idEdicao) return;
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    await fetch(`http://localhost:3000/usuarios/${idEdicao}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email })
    });
    idEdicao = null;
    limpar();
    listarUsuarios();
}

function limpar() {
    document.getElementById('nome').value = '';
    document.getElementById('email').value = '';
}

listarUsuarios();