
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
    const tipo = document.querySelector('.btn-tipo.selecionado').textContent.trim().toLowerCase();


    const response = await fetch('http://localhost:3000/cadastrar_usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, tipo })
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

function mostrarSenha(idInput, idBotao){
    var inputPass = document.getElementById(idInput)
    var btnShowPass = document.getElementById(idBotao)

    if(inputPass.type === 'password'){
        inputPass.setAttribute('type', 'text')
        btnShowPass.classList.replace('bi-eye', 'bi-eye-slash')
    }
    else{
        inputPass.setAttribute('type', 'password')
        btnShowPass.classList.replace('bi-eye-slash', 'bi-eye')
    }
}

function selecionarTipo(botaoClicado) {
    const botoes = document.querySelectorAll('.btn-tipo')

    botoes.forEach(btn => btn.classList.remove('selecionado'));
    
    botaoClicado.classList.add('selecionado');

}
