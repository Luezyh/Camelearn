require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const porta = 3000;
const JWT_SECRET = 'sua-chave-secreta-aqui';
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)


const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(cookieParser());

async function testarConexao() {
    const { error } = await supabase.auth.getSession()

    if (error) {
        console.error('Erro ao conectar ao Supabase:', error.message)
    } else {
        console.log('Supabase conectado com sucesso!')
    }
}

testarConexao()

function obterUsuario(req) {
    const token = req.cookies.token;

    if (!token) return null;

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/HTML/index.html'));
});

app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/HTML/cadastro.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/HTML/login.html'));
});

app.post('/cadastrar_usuario', async (req, res) => {
    const { nome, email, senha, tipo } = req.body;

    //Consulta antes de salvar
    const { data: usuarioExistente, error: erroConsulta } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .single()

    if (erroConsulta && erroConsulta.code !== 'PGRST116') {
        return res.status(500).send(erroConsulta.message)
    }

    //Se já existe, bloqueia
    if (usuarioExistente) {
        return res.status(409).send('E-mail já cadastrado.')
    }

    //Se não existe, salva
    const { error: erroInsert } = await supabase
        .from('usuarios')
        .insert({ nome, email, senha, tipo })

    if (erroInsert) return res.status(500).send(erroInsert.message)

    res.send('Usuário cadastrado!')
});

app.post('/login_usuario', async (req, res) => {
    const { email, senha } = req.body;

    // Consulta o usuário pelo email e senha
    const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, tipo, criado_em')
        .eq('email', email)
        .eq('senha', senha)
        .single()

    if (error && error.code !== 'PGRST116') {
        return res.status(500).send(error.message)
    }

    // Se não encontrou, bloqueia
    if (!usuario) {
        return res.status(401).send('E-mail ou senha incorretos.')
    }

    // Se encontrou, gera o token
    const token = jwt.sign(
        { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo, criado_em: usuario.criado_em },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).send('Login bem-sucedido!');
});

app.get('/home', (req, res) => {
    const usuario = obterUsuario(req);

    if (!usuario) return res.redirect('/login');

    res.sendFile(path.join(__dirname, 'public/HTML/home_' + usuario.tipo + '.html'));
});

app.get('/turmas/:id', async (req, res) => {
    const usuario = obterUsuario(req);
    if (!usuario) return res.status(401).send('Não autorizado.');
    const { data: turma, error } = await supabase
        .from('turmas')
        .select('*')
        .eq('id', req.params.id)
        .single();
    if (error) return res.status(500).send(error.message);
    res.json(turma);
});

app.get('/tarefas', async (req, res) => {
    const usuario = obterUsuario(req);
    if (!usuario) return res.status(401).send('Não autorizado.');
    const { data: tarefas, error } = await supabase
        .from('tarefas')
        .select('*')
        .eq('usuario_id', usuario.id)
        .order('data_fim', { ascending: true })
    if (error) return res.status(500).send(error.message);
    res.json(tarefas);
});

app.get('/sessoes', async (req, res) => {
    const usuario = obterUsuario(req);

    if (!usuario) return res.status(401).send('Não autorizado.');

    const { data: sessoes, error } = await supabase
        .from('sessoes')
        .select('*')
        .eq('usuario_id', usuario.id);


    if (error) return res.status(500).send(error.message);
    res.json(sessoes);
});

app.post('/sessoes', async (req, res) => {
  const usuario = obterUsuario(req);
  if (!usuario) return res.status(401).send('Não autorizado.');
  const { materia, dia } = req.body;
  const { data, error } = await supabase
    .from('sessoes')
    .insert({ usuario_id: usuario.id, materia, dia })
    .select()
    .single();
  if (error) return res.status(500).send(error.message);
  res.json(data);
});

app.patch('/sessoes/:id', async (req, res) => {
  const usuario = obterUsuario(req);
  if (!usuario) return res.status(401).send('Não autorizado.');

  const { id } = req.params;
  const campos = {};
  if (req.body.dia     !== undefined) campos.dia     = req.body.dia;
  if (req.body.materia !== undefined) campos.materia = req.body.materia;
  if (req.body.cor     !== undefined) campos.cor     = req.body.cor;

  const { error } = await supabase
    .from('sessoes')
    .update(campos)
    .eq('id', id)
    .eq('usuario_id', usuario.id);

  if (error) return res.status(500).send(error.message);
  res.sendStatus(200);
});

app.patch('/sessoes/:id', async (req, res) => {
  const usuario = obterUsuario(req);
  if (!usuario) return res.status(401).send('Não autorizado.');

  const { id } = req.params;
  const { dia } = req.body;

  const { error } = await supabase
    .from('sessoes')
    .update({ dia })
    .eq('id', id)
    .eq('usuario_id', usuario.id);

  if (error) return res.status(500).send(error.message);
  res.sendStatus(200);
});

app.post('/criar_tarefa', async (req, res) => {
    const usuario = obterUsuario(req);
    if (usuario.tipo !== 'professor') return res.status(401).send('Não autorizado.');
    const { titulo, descricao, tipo, data_fim } = req.body;
    const { error } = await supabase
        .from('tarefas')
        .insert({ usuario_id: usuario.id, turma_id: 1, titulo, descricao, data_fim, tipo })
    if (error) return res.status(500).send(error.message);
    res.send('Tarefa criada!');
});

app.get('/tarefas_turma/:turma_id', async (req, res) => {
  const usuario = obterUsuario(req);
  if (!usuario) return res.status(401).send('Não autorizado.');
  const { data: tarefas, error } = await supabase
    .from('tarefas')
    .select('*')
    .eq('turma_id', req.params.turma_id)
    .order('data_fim', { ascending: true });
  if (error) return res.status(500).send(error.message);
  res.json(tarefas);
});

app.patch('/concluir_tarefa/:id', async (req, res) => {
  const usuario = obterUsuario(req);
  if (!usuario) return res.status(401).send('Não autorizado.');

  const { error } = await supabase
    .from('tarefas')
    .update({ concluida: true })
    .eq('id', req.params.id)
    .eq('usuario_id', usuario.id);

  if (error) return res.status(500).send(error.message);
  res.sendStatus(200);
});

app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.send('Logout realizado.');
});

app.listen(porta, () => console.log(`Servidor rodando em http://localhost:${porta}`));