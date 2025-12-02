
# 🕸️ Conexões Interpessoais APP (Rede Social Simulada)

Projeto interdisciplinar desenvolvido para a disciplina de **Estrutura de Dados**. O sistema utiliza **Teoria dos Grafos** para modelar, visualizar e analisar conexões entre usuários em uma rede social simulada.

---

## 👨‍💻 Integrantes da Equipe

* **André Alexandria** - Back-end e Algoritmos
* **Eduardo Barros** - Front-end e Visualização
* **Maicon Pereira** - QA, Documentação e Infraestrutura

---

## 🚀 Como Rodar (Modo Recomendado: Docker)

A maneira mais fácil e robusta de testar o projeto é utilizando **Docker**, pois ele configura automaticamente o Banco de Dados, o Back-end e o Front-end sem necessidade de instalações manuais de dependências.

### Pré-requisitos
* **Docker Desktop** instalado e rodando.

### Passo a Passo
1. Baixe ou clone este repositório.
2. Abra o terminal na pasta raiz do projeto (onde está o arquivo `docker-compose.yml`).
3. Execute o comando:

   ```bash
   docker compose up --build
````

4.  Aguarde o download das imagens e a inicialização dos containers.

      * *Nota: A primeira execução pode demorar alguns minutos.*

5.  Quando aparecerem mensagens indicando que o servidor está rodando, acesse no navegador:

    👉 **http://localhost:4200**

-----

## 🛠️ Como Rodar Manualmente (Sem Docker)

Caso prefira rodar localmente em sua máquina, siga estes passos:

### 1\. Banco de Dados

1.  Certifique-se de ter o **MySQL 8.0+** instalado.
2.  Crie um banco de dados e execute o script localizado em: `database/init.sql`.

### 2\. Back-end (API)

1.  Entre na pasta `rede-social-api`.
2.  Crie um arquivo chamado **`.env`** na raiz desta pasta com as configurações do seu banco local:
    ```ini
    DB_HOST=localhost
    DB_USER=root
    DB_PASS=sua_senha_aqui
    DB_NAME=rede_social
    DB_PORT=3306
    ```
3.  Instale as dependências e rode o servidor:
    ```bash
    npm install
    node index.js
    ```

### 3\. Front-end (Interface)

1.  Em outro terminal, entre na pasta `frontend-rede-social`.
2.  Instale as dependências e rode o Angular:
    ```bash
    npm install
    ng serve
    ```
3.  Acesse `http://localhost:4200`.

-----

## ✨ Funcionalidades Principais

O sistema vai além de um CRUD simples, implementando algoritmos clássicos de grafos:

### 1\. Visualização Interativa

  * **Grafos Hexagonais:** Interface moderna, limpa e responsiva (Tema Dark/Neon).
  * **Zoom & Pan:** Navegação fluida com controles de câmera automáticos.
  * **Busca Inteligente:** Localize um usuário pelo nome e o sistema fará um "zoom de cinema" focado nele.

### 2\. Algoritmos de Grafos

  * **Grau do Vértice:** Ao clicar em um usuário, exibe sua popularidade (número de conexões diretas).
  * **Sugestão de Amigos:** Identifica vizinhos de 2º grau (amigos de amigos) para sugerir novas conexões baseadas em interesses comuns.
  * **Caminho Mais Curto (Dijkstra):** Traça a rota mínima entre dois usuários quaisquer da rede, destacando o caminho visualmente.
  * **Componentes Conexas:** Identifica e colore automaticamente grupos isolados ("panelinhas") na rede.

### 3\. Gerenciamento de Dados

  * **CRUD Completo:** Adicionar e remover usuários e conexões por nome (com validação de duplicidade).
  * **Exportação:** Botões para salvar o grafo atual como Imagem (PNG) ou Dados (JSON) para relatórios.
  * **Modo Demo:** Botão "Gerar Massa de Teste" que popula o banco automaticamente para apresentações rápidas.

-----

## 📂 Estrutura do Projeto

```text
/
├── database/               # Script SQL de inicialização automática
├── rede-social-api/        # Back-end (Node.js + Express)
│   ├── index.js            # Rotas e Lógica da API
│   └── Dockerfile          # Configuração Docker do Back
├── frontend-rede-social/   # Front-end (Angular + Cytoscape.js)
│   ├── src/app/dashboard/  # Componente principal do sistema
│   └── Dockerfile          # Configuração Docker do Front
└── docker-compose.yml      # Orquestrador dos containers
```

-----

## 🧪 Roteiro de Teste Rápido (Para Avaliação)

Para validar todas as funcionalidades rapidamente:

1.  Abra o menu **"⚠️ Zona de Perigo"** na barra lateral.
2.  Clique em **"⚡ Gerar Massa de Teste"**.
      * *Isso criará 15 usuários e várias conexões aleatórias.*
3.  Abra o menu **"📊 Análise da Rede"** e clique em **"🎨 Colorir por Grupos"** para ver as comunidades.
4.  Teste a **Busca (🔍)** digitando o nome de um usuário (ex: "Alice").
5.  Use a ferramenta **"📍 Rota / Caminho"** para ver a conexão entre duas pessoas distantes.
6.  Clique em qualquer nó para ver o **Grau** e as **Sugestões de Amizade**.

<!-- end list -->

```
```