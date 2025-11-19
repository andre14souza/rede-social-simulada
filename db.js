const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',         // SEU USUÁRIO DO MYSQL
  password: '14122006', // SUA SENHA DO MYSQL (MUDE AQUI!)
  database: 'rede_social',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();