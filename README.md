# 📚 Camelearn

> Plataforma de estudos inteligente para alunos que querem otimizar seu tempo e alcançar melhores resultados.

---

### 🚀 Sobre o Projeto

A **Camelearn** é uma aplicação web desenvolvida para dar eficiência aos estudos. Com ela, alunos têm acesso a ferramentas que otimizam o tempo de estudo e potencializam os resultados acadêmicos.

---

### 🛠️ Tecnologias

- **JavaScript / TypeScript**
- **Node.js**

---

### ⚙️ Instalação e Uso

### Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [MySQL](https://www.mysql.com/)

### Passo a passo

**1. Clone o repositório**

```bash
git clone https://github.com/Luezyh/Camelearn.git
```

**2. Acesse a pasta do projeto**

```bash
cd camelearn
```

**3. Instale as dependências**

```bash
npm install express mysql2 cors jsonwebtoken cookie-parser
```

**4. Configure o banco de dados** <br>
Com o MySQL instalado e rodando, execute o arquivo banco.sql para criar o banco e as tabelas:

```bash
mysql -u root -p < banco.sql
```

Será solicitada a senha do seu MySQL. Após isso, o banco camelearn estará pronto.

**5. Configure a conexão com o banco**
No arquivo server.js, atualize as credenciais do MySQL conforme o seu ambiente:

```bash
javascriptconst connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'sua-senha', // 👈 altere aqui
  database: 'camelearn'
});
```

**6. Inicie o servidor**

```bash
node server.js
```

**7. Acesse a aplicação**

Abra o navegador e acesse: `http://localhost:3000`

---

<p align="center">Feito com ❤️ pela equipe Camelearn</p>
