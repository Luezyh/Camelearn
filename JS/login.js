
async function fazerLogin() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

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
