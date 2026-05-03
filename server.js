const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const porta = 3000;
const JWT_SECRET = 'sua-chave-secreta-aqui';


const app = express();
app.use(express.json());
app.use(express.static(__dirname));
app.use(cors());
app.use(cookieParser());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
});

db.query(`CREATE DATABASE IF NOT EXISTS camelearn`, (err) => {
    if (err) throw err;

    db.query(`USE camelearn`, (err) => {
        if (err) throw err;

        db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        pontuacao INT DEFAULT 0,
        email VARCHAR(150) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        role ENUM('admin', 'aluno') DEFAULT 'aluno',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
            if (err) throw err;
            console.log('Banco de dados pronto!');
        });
    });
});

//Rota principal 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

//Rota para o cadastro
app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'HTML/cadastro.html'));
});

//Rota para o login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'HTML/login.html'));
});


// Cadastrar o usuário
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

// Login do usuário
app.post('/login_usuario', (req, res) => {
    const { email, senha } = req.body;

    // 1️⃣ Consulta antes de salvar
    db.query('SELECT id, nome, email, pontuacao, role, criado_em FROM usuarios WHERE email = ? AND senha = ?', [email, senha], (err, rows) => {
        if (err) return res.status(500).send(err);

        // 2️⃣ Se já existe, bloqueia
        if (rows.length > 0) {

            const token = jwt.sign(
                { id: rows[0].id, nome: rows[0].nome, email: rows[0].email, pontuacao: rows[0].pontuacao, role: rows[0].role, criado_em: rows[0].criado_em },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return res.status(200).send('Login bem-sucedido!');

        } else {
            return res.status(401).send('E-mail ou senha incorretos.');
        }
    });
});

// Rota para obter dados do usuário autenticado
app.get('/auth/me', (req, res) => {
    const token = req.cookies.token;

    if (!token) return res.status(401).send('Não autenticado.');

    try {
        const usuario = jwt.verify(token, JWT_SECRET);
        return res.json(usuario);
    } catch (err) {
        return res.status(401).send('Sessão inválida.');
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.send('Logout realizado.');
});

// Home
app.get('/home', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        jwt.verify(token, JWT_SECRET);
        res.sendFile(path.join(__dirname, 'HTML/home.html'));
    } catch (err) {
        res.redirect('/login');
    }
});

//Rascunhos abaixo!!!
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