const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

/*
 * ========================================
 * ROTAS DE USUÁRIOS
 * ========================================
 */

// LISTAR USUÁRIOS
app.get('/usuarios', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRIAR USUÁRIO
app.post('/usuarios', async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: "Nome é obrigatório" });

    const [result] = await db.query('INSERT INTO usuarios (nome) VALUES (?)', [nome]);
    res.status(201).json({ id: result.insertId, nome });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
 * ========================================
 * ROTAS DE CONEXÕES (AMIZADES)
 * ========================================
 */

// CRIAR CONEXÃO
// ROTA DE CONEXÃO (AGORA POR NOME)
app.post('/conexoes', async (req, res) => {
  try {
    const { nome_usuario_a, nome_usuario_b } = req.body;

    // 1. Validação básica
    if (!nome_usuario_a || !nome_usuario_b) {
      return res.status(400).json({ error: "Os dois nomes são obrigatórios" });
    }
    if (nome_usuario_a === nome_usuario_b) {
      return res.status(400).json({ error: "Não pode conectar consigo mesmo" });
    }

    // 2. Descobrir os IDs com base nos nomes
    // Buscamos os dois usuários de uma vez
    const [usuarios] = await db.query(
      'SELECT id, nome FROM usuarios WHERE nome IN (?, ?)',
      [nome_usuario_a, nome_usuario_b]
    );

    // 3. Verificar se achou os dois
    if (usuarios.length < 2) {
      return res.status(404).json({ error: "Um ou ambos os usuários não foram encontrados." });
    }

    const id_a = usuarios.find(u => u.nome === nome_usuario_a).id;
    const id_b = usuarios.find(u => u.nome === nome_usuario_b).id;

    // 4. Ordenar para evitar duplicidade (menor sempre primeiro)
    const menor = Math.min(id_a, id_b);
    const maior = Math.max(id_a, id_b);

    // 5. Inserir a conexão
    await db.query(
      'INSERT INTO conexoes (usuario_a, usuario_b) VALUES (?, ?)', 
      [menor, maior]
    );

    res.status(201).json({ message: `Conexão criada entre ${nome_usuario_a} e ${nome_usuario_b}!` });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
       return res.status(400).json({ error: "Esses usuários já são amigos!" });
    }
    res.status(500).json({ error: error.message });
  }
});

/*
 * ========================================
 * ROTA DO GRAFO (ESSA QUE ESTAVA FALTANDO!)
 * ========================================
 */
app.get('/grafo', async (req, res) => {
    try {
        // Busca todos os nós
        const [usuarios] = await db.query('SELECT id, nome FROM usuarios');
        
        // Busca todas as arestas
        const [conexoes] = await db.query('SELECT usuario_a, usuario_b FROM conexoes');

        // Formata para o padrão que o Front-end espera
        const nodes = usuarios.map(u => ({ id: u.id, label: u.nome }));
        const edges = conexoes.map(c => ({ source: c.usuario_a, target: c.usuario_b }));

        res.json({ nodes, edges });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// INICIAR SERVIDOR
app.listen(3000, () => {
  console.log('Servidor COMPLETO rodando na porta 3000');
}); 