
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
        const erro = document.getElementById('erro');
        erro.style.display = 'block';
        erro.textContent = `Erro: ${errorText}`;
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
        document.getElementById('mensagem').style.display = 'block';
        Login(email, senha);
    } else {
        const errorText = await response.text();
        const erro = document.getElementById('erro');
        erro.style.display = 'block';
        erro.textContent = `Erro: ${errorText}`;
    }
}
