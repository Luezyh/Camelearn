
async function EncerrarSessao(){
    await fetch('/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/login';
}
(async () => {
    const res = await fetch('/auth/me', { credentials: 'include' });
    const usuario = await res.json();

    document.getElementById('mensagem').textContent = `Bem-vindo, ${usuario.nome}!`;

})();