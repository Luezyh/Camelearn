
async function Login(email, senha){

    const response = await fetch('http://localhost:3000/login_usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });

    if (response.ok) {
        window.location.href = '/home';
    } else {
        const errorText = await response.text();
        document.getElementById('mensagem').textContent = `Erro: ${errorText}`;
    }
}

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
        Login(email, senha);
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
