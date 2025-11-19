const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ROTA DE TESTE (Listar Usuários)
app.get('/usuarios', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ROTA DE CADASTRO
app.post('/usuarios', async (req, res) => {
  try {
    const { nome } = req.body;
    const [result] = await db.query('INSERT INTO usuarios (nome) VALUES (?)', [nome]);
    res.status(201).json({ id: result.insertId, nome });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});