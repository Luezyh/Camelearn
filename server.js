const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');
const porta = 3000;

const app = express();
app.use(express.json());
app.use(express.static(__dirname));
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // seu usuário do mysql
    password: '', // sua senha
    database: 'camelearn'
});

//Rota principal para servir o HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'HTML/cadastro.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'HTML/login.html'));
});


// CREATE - Adicionar usuário
app.post('/cadastrar_usuario', (req, res) => {
    const { nome, email, senha } = req.body;

    // 1️⃣ Consulta antes de salvar
    db.query('SELECT id FROM usuarios WHERE email = ?', [email], (err, rows) => {
        if (err) return res.status(500).send(err);

        // 2️⃣ Se já existe, bloqueia
        if (rows.length > 0) {
            return res.status(409).send('E-mail já cadastrado.');
        }

        // 3️⃣ Se não existe, salva
        db.query('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', [nome, email, senha], (err) => {
            if (err) return res.status(500).send(err);
            res.send('Usuário cadastrado!');
        });
    });
});

app.post('/login_usuario', (req, res) => {
    const { email, senha } = req.body;

    // 1️⃣ Consulta antes de salvar
    db.query('SELECT id, nome, email, pontuacao, role, criado_em FROM usuarios WHERE email = ? AND senha = ?', [email, senha], (err, rows) => {
        if (err) return res.status(500).send(err);

        // 2️⃣ Se já existe, bloqueia
        if (rows.length > 0) {
            return res.status(200).json(rows[0]);
        } else{
            return res.status(401).send('E-mail ou senha incorretos.');
        }
    });
});

// READ - Listar usuários
app.get('/usuarios', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// UPDATE - Editar usuário
app.put('/usuarios/:id', (req, res) => {
    const { nome, email, senha } = req.body;
    db.query('UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?', [nome, email, senha, req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Atualizado com sucesso!');
    });
});

// DELETE - Remover usuário
app.delete('/usuarios/:id', (req, res) => {
    db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Removido com sucesso!');
    });
});

app.listen(porta, () => console.log(`Servidor rodando em http://localhost:${porta}`));