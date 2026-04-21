
async function Cadastrar() {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const response = await fetch('http://localhost:3000/cadastrar_usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
    });

    if (response.ok) {
        document.getElementById('mensagem').textContent = 'Usuário cadastrado com sucesso!';
    } else {
        const errorText = await response.text();
        document.getElementById('mensagem').textContent = `Erro: ${errorText}`;
    }
}

const formulario = document.querySelector('form');

formulario.addEventListener('submit', (event) => {
    event.preventDefault();
    Cadastrar();
});
