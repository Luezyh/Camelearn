
async function Login() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const response = await fetch('http://localhost:3000/login_usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });

    if (response.ok) {
        window.location.href = '/home';
        document.getElementById('mensagem').textContent = `Bem-vindo, ${usuario.nome}!`;
    } else {
        const errorText = await response.text();
        document.getElementById('mensagem').textContent = `Erro: ${errorText}`;
    }
}

const formulario = document.querySelector('form');

formulario.addEventListener('submit', (event) => {
    event.preventDefault();
    Login();
});