-- 1. Garante que o banco existe
CREATE DATABASE IF NOT EXISTS rede_social;
USE rede_social;

-- 2. Cria a tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
);

-- 3. Cria a tabela de Conexões
CREATE TABLE IF NOT EXISTS conexoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_a INT NOT NULL,
    usuario_b INT NOT NULL,
    FOREIGN KEY (usuario_a) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_b) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_conexao (usuario_a, usuario_b)
);

-- 4. (OPCIONAL) Já insere alguns dados de teste para o Professor ver
INSERT INTO usuarios (nome) VALUES ('Admin');
INSERT INTO usuarios (nome) VALUES ('Professor');
INSERT INTO usuarios (nome) VALUES ('Aluno Nota 10');

-- Cria uma amizade entre Admin e Professor
INSERT INTO conexoes (usuario_a, usuario_b) VALUES (1, 2);