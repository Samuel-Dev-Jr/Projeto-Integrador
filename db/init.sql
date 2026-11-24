-- =====================================================================
-- SpyCode - init.sql
-- Cria o banco, as tabelas e carrega os dados de exemplo, tudo de uma vez.
-- Pode ser rodado várias vezes: as tabelas são apagadas e recriadas
-- (cuidado: isso apaga os dados que já estiverem nelas).
--
-- Como rodar:
--   mysql --default-character-set=utf8mb4 -u SEU_USUARIO -p < init.sql
-- Requer MySQL 8.0.13 ou mais novo.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS spycode
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE spycode;

-- ---------------------------------------------------------------------
-- Limpeza: apaga as tabelas na ordem inversa das chaves estrangeiras
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS Relatorio;
DROP TABLE IF EXISTS Log_analise;
DROP TABLE IF EXISTS Achado;
DROP TABLE IF EXISTS Escaneamento;
DROP TABLE IF EXISTS Conexao;
DROP TABLE IF EXISTS Repositorio;
DROP TABLE IF EXISTS Desenvolvedor;

-- ---------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------

-- 1. Desenvolvedor
CREATE TABLE Desenvolvedor (
    id_desenvolvedor INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    login VARCHAR(80) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    token_github VARCHAR(255) NULL,
    data_cadastro DATE NOT NULL DEFAULT (CURRENT_DATE)
);

-- 2. Repositorio
CREATE TABLE Repositorio (
    id_repositorio INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255) NOT NULL UNIQUE,
    repositorio_dono VARCHAR(120) NOT NULL,
    repositorio_nome VARCHAR(120) NOT NULL,
    visibilidade VARCHAR(30) NOT NULL,
    branch_padrao VARCHAR(100) NOT NULL DEFAULT 'main'
);

-- 3. Conexao (N:N entre Desenvolvedor e Repositorio)
CREATE TABLE Conexao (
    id_repositorio INT NOT NULL,
    id_desenvolvedor INT NOT NULL,
    data_conexao DATE NOT NULL DEFAULT (CURRENT_DATE),
    permissao_github VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_repositorio, id_desenvolvedor),
    CONSTRAINT fk_conexao_repositorio
        FOREIGN KEY (id_repositorio) REFERENCES Repositorio(id_repositorio)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_conexao_desenvolvedor
        FOREIGN KEY (id_desenvolvedor) REFERENCES Desenvolvedor(id_desenvolvedor)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4. Escaneamento
CREATE TABLE Escaneamento (
    id_escaneamento INT AUTO_INCREMENT PRIMARY KEY,
    id_repositorio INT NOT NULL,
    id_desenvolvedor INT NOT NULL,
    commit_hash VARCHAR(64) NULL,
    status VARCHAR(40) NOT NULL,
    data_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_fim DATETIME NULL,
    CONSTRAINT fk_escaneamento_repositorio
        FOREIGN KEY (id_repositorio) REFERENCES Repositorio(id_repositorio)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_escaneamento_desenvolvedor
        FOREIGN KEY (id_desenvolvedor) REFERENCES Desenvolvedor(id_desenvolvedor)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. Achado
CREATE TABLE Achado (
    id_achado INT AUTO_INCREMENT PRIMARY KEY,
    id_escaneamento INT NOT NULL,
    tipo VARCHAR(80) NOT NULL,
    severidade VARCHAR(30) NOT NULL,
    arquivo VARCHAR(255) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    evidencia TEXT NULL,
    explicacao TEXT NULL,
    correcao TEXT NULL,
    CONSTRAINT fk_achado_escaneamento
        FOREIGN KEY (id_escaneamento) REFERENCES Escaneamento(id_escaneamento)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6. Log_analise
CREATE TABLE Log_analise (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_escaneamento INT NOT NULL,
    nivel VARCHAR(30) NOT NULL,
    mensagem TEXT NOT NULL,
    data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_escaneamento
        FOREIGN KEY (id_escaneamento) REFERENCES Escaneamento(id_escaneamento)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- 7. Relatorio
CREATE TABLE Relatorio (
    id_relatorio INT AUTO_INCREMENT PRIMARY KEY,
    id_escaneamento INT NOT NULL UNIQUE,
    nome_arquivo VARCHAR(180) NOT NULL,
    caminho_arquivo VARCHAR(255) NOT NULL,
    data_geracao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_relatorio_escaneamento
        FOREIGN KEY (id_escaneamento) REFERENCES Escaneamento(id_escaneamento)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ---------------------------------------------------------------------
-- Dados de exemplo (todos fictícios)
-- ---------------------------------------------------------------------

-- 1. Desenvolvedor
-- senha_hash e token_github são apenas textos de exemplo, não são
-- hashes nem tokens de verdade.
INSERT INTO Desenvolvedor (id_desenvolvedor, nome, email, login, senha_hash, token_github, data_cadastro) VALUES
(1, 'Rafael Almeida',  'rafael.almeida@exemplo.com',  'rafael',  '$2b$10$exemploDeHashFicticioRafael000000000000000000000000000', 'enc:v1:token-ficticio-rafael', '2026-10-05'),
(2, 'Marina Costa',    'marina.costa@exemplo.com',    'marina',  '$2b$10$exemploDeHashFicticioMarina000000000000000000000000000', 'enc:v1:token-ficticio-marina', '2026-10-08'),
(3, 'Lucas Ferreira',  'lucas.ferreira@exemplo.com',  'lucas',   '$2b$10$exemploDeHashFicticioLucas0000000000000000000000000000', NULL,                         '2026-10-12');

-- 2. Repositorio
INSERT INTO Repositorio (id_repositorio, url, repositorio_dono, repositorio_nome, visibilidade, branch_padrao) VALUES
(1, 'https://github.com/rafael/app-de-tarefas',       'rafael', 'app-de-tarefas',       'publico', 'main'),
(2, 'https://github.com/rafael/api-da-loja',          'rafael', 'api-da-loja',          'privado', 'main'),
(3, 'https://github.com/marina/blog-pessoal',         'marina', 'blog-pessoal',         'publico', 'master'),
(4, 'https://github.com/lucas/chat-em-tempo-real',    'lucas',  'chat-em-tempo-real',   'publico', 'main'),
(5, 'https://github.com/marina/lista-de-compras',     'marina', 'lista-de-compras',     'publico', 'main');

-- 3. Conexao (N:N entre Desenvolvedor e Repositorio)
-- A ordem das colunas segue o create: id_repositorio, id_desenvolvedor.
INSERT INTO Conexao (id_repositorio, id_desenvolvedor, data_conexao, permissao_github) VALUES
(1, 1, '2026-10-06', 'leitura'),
(2, 1, '2026-10-06', 'leitura'),
(1, 2, '2026-10-09', 'leitura'),   -- a Marina também conectou o repositório do Rafael
(3, 2, '2026-10-09', 'leitura'),
(5, 2, '2026-10-10', 'leitura'),
(4, 3, '2026-10-13', 'leitura');

-- 4. Escaneamento
-- status: na_fila, analisando, concluido ou erro
INSERT INTO Escaneamento (id_escaneamento, id_repositorio, id_desenvolvedor, commit_hash, status, data_inicio, data_fim) VALUES
(1, 1, 1, '9f3c2a1b7d8e4f60a1b2c3d4e5f60718293a4b5c', 'concluido', '2026-10-20 14:00:00', '2026-10-20 14:02:10'),
(2, 1, 1, '4b7e1d9c0a2f3e5d6c7b8a9f0e1d2c3b4a5f6e7d', 'concluido', '2026-10-22 19:30:00', '2026-10-22 19:31:25'),
(3, 2, 1, '7a8b9c0d1e2f30415263748596a7b8c9d0e1f2a3', 'erro',      '2026-10-23 10:15:00', '2026-10-23 10:15:40'),
(4, 3, 2, 'c1d2e3f405162738495a6b7c8d9e0f1a2b3c4d5e', 'concluido', '2026-10-24 09:00:00', '2026-10-24 09:01:50'),
(5, 4, 3, 'e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718', 'analisando', '2026-11-23 20:00:00', NULL),
(6, 5, 2, NULL,                                       'na_fila',    '2026-11-23 20:05:00', NULL);

-- 5. Achado
-- severidade: critica, alta, media ou baixa
-- Segredos aparecem sempre mascarados na evidência.
INSERT INTO Achado (id_achado, id_escaneamento, tipo, severidade, arquivo, titulo, evidencia, explicacao, correcao) VALUES
-- Escaneamento 1 (app-de-tarefas, primeira análise): nota 61
(1, 1, 'segredo-exposto', 'critica', '.env',
 'Token pessoal do GitHub exposto no repositório',
 'GITHUB_TOKEN=ghp_****************************a1b2',
 'O arquivo .env foi enviado ao GitHub e qualquer pessoa pode copiar esse token.',
 'Revogue o token no GitHub, gere outro, guarde em variável de ambiente e adicione .env ao .gitignore.'),
(2, 1, 'rota-sem-autenticacao', 'alta', 'src/routes/tarefas.js',
 'Rota DELETE /tarefas/:id sem autenticação',
 'router.delete(''/tarefas/:id'', removerTarefa)',
 'Qualquer pessoa na internet pode apagar tarefas.',
 'Coloque o middleware de autenticação antes da função da rota.'),
(3, 1, 'dependencia-vulneravel', 'media', 'package.json',
 'Biblioteca jsonwebtoken com falha conhecida',
 'jsonwebtoken@8.5.0',
 'Essa versão tem falha registrada no OSV.dev que permite burlar a verificação do token.',
 'Atualize para a versão corrigida com npm install jsonwebtoken@latest.'),

-- Escaneamento 2 (app-de-tarefas, depois das correções): nota 99
(4, 2, 'configuracao-insegura', 'baixa', 'src/servidor.js',
 'Falta o helmet nos cabeçalhos HTTP',
 'const app = express()',
 'Sem o helmet, o servidor não envia cabeçalhos que dificultam ataques comuns.',
 'Instale o helmet e use app.use(helmet()).'),

-- Escaneamento 4 (blog-pessoal): nota 95
(5, 4, 'configuracao-insegura', 'media', 'src/app.js',
 'CORS aberto para qualquer origem',
 'app.use(cors())',
 'Qualquer site pode chamar a API pelo navegador da pessoa.',
 'Libere só as origens do seu site, por exemplo cors({ origin: ''https://meublog.com'' }).'),
(6, 4, 'configuracao-insegura', 'baixa', 'src/app.js',
 'Sem limite de pedidos por IP',
 'app.use(express.json())',
 'Sem limite, alguém pode sobrecarregar a API ou tentar senhas em sequência.',
 'Use o express-rate-limit para limitar os pedidos por minuto.');

-- 6. Log_analise
INSERT INTO Log_analise (id_log, id_escaneamento, nivel, mensagem, data_hora) VALUES
(1,  1, 'info',  'Escaneamento iniciado.',                                    '2026-10-20 14:00:00'),
(2,  1, 'info',  'Código baixado para a pasta temporária.',                   '2026-10-20 14:00:20'),
(3,  1, 'info',  'Motor de segredos concluído: 1 achado.',                    '2026-10-20 14:01:00'),
(4,  1, 'info',  'Motor de rotas concluído: 1 achado.',                       '2026-10-20 14:01:30'),
(5,  1, 'info',  'Motor de dependências concluído: 1 achado.',                '2026-10-20 14:02:00'),
(6,  1, 'info',  'Pasta temporária apagada. Escaneamento concluído.',         '2026-10-20 14:02:10'),
(7,  2, 'info',  'Escaneamento iniciado.',                                    '2026-10-22 19:30:00'),
(8,  2, 'info',  'Motores concluídos: 1 achado.',                             '2026-10-22 19:31:15'),
(9,  2, 'info',  'Pasta temporária apagada. Escaneamento concluído.',         '2026-10-22 19:31:25'),
(10, 3, 'info',  'Escaneamento iniciado.',                                    '2026-10-23 10:15:00'),
(11, 3, 'erro',  'Falha ao baixar o código: token do GitHub sem permissão.',  '2026-10-23 10:15:30'),
(12, 3, 'info',  'Pasta temporária apagada após o erro.',                     '2026-10-23 10:15:40'),
(13, 4, 'info',  'Escaneamento iniciado.',                                    '2026-10-24 09:00:00'),
(14, 4, 'aviso', 'Link simbólico ignorado: docs/atalho.',                     '2026-10-24 09:00:30'),
(15, 4, 'info',  'Pasta temporária apagada. Escaneamento concluído.',         '2026-10-24 09:01:50'),
(16, 5, 'info',  'Escaneamento iniciado.',                                    '2026-11-23 20:00:00'),
(17, 6, 'info',  'Pedido colocado na fila.',                                  '2026-11-23 20:05:00');

-- 7. Relatorio (no máximo um por escaneamento)
INSERT INTO Relatorio (id_relatorio, id_escaneamento, nome_arquivo, caminho_arquivo, data_geracao) VALUES
(1, 1, 'dossie_app-de-tarefas_20261020.pdf', 'relatorios/1/dossie_app-de-tarefas_20261020.pdf', '2026-10-20 14:02:10'),
(2, 2, 'dossie_app-de-tarefas_20261022.pdf', 'relatorios/2/dossie_app-de-tarefas_20261022.pdf', '2026-10-22 19:31:25'),
(3, 4, 'dossie_blog-pessoal_20261024.pdf',   'relatorios/4/dossie_blog-pessoal_20261024.pdf',   '2026-10-24 09:01:50');

-- =====================================================================
-- SpyCode - consultas (select.sql)
-- Use depois do create.sql e do insert.sql. Requer MySQL 8.0 ou mais
-- novo (usa WITH e ROW_NUMBER).
-- A nota e a duração não são colunas: são calculadas aqui, como no
-- modelo conceitual (atributos derivados).
-- Nota = 100 - 25 por crítico - 10 por alto - 4 por médio - 1 por baixo,
-- sem passar de zero.
-- =====================================================================

USE spycode;

-- ---------------------------------------------------------------------
-- 1. Todos os desenvolvedores (sem mostrar o hash da senha nem o token)
-- ---------------------------------------------------------------------
SELECT id_desenvolvedor, nome, email, login, data_cadastro
FROM Desenvolvedor
ORDER BY nome;

-- ---------------------------------------------------------------------
-- 2. Painel: repositórios conectados por cada desenvolvedor
-- ---------------------------------------------------------------------
SELECT d.nome                                   AS desenvolvedor,
       CONCAT(r.repositorio_dono, '/', r.repositorio_nome) AS repositorio,
       r.visibilidade,
       c.permissao_github,
       c.data_conexao
FROM Conexao c
JOIN Desenvolvedor d ON d.id_desenvolvedor = c.id_desenvolvedor
JOIN Repositorio  r ON r.id_repositorio   = c.id_repositorio
ORDER BY d.nome, r.repositorio_nome;

-- ---------------------------------------------------------------------
-- 3. Repositórios do Rafael (id 1) - troque o número para outra pessoa
-- ---------------------------------------------------------------------
SELECT r.id_repositorio,
       CONCAT(r.repositorio_dono, '/', r.repositorio_nome) AS repositorio,
       r.visibilidade,
       r.branch_padrao
FROM Repositorio r
JOIN Conexao c ON c.id_repositorio = r.id_repositorio
WHERE c.id_desenvolvedor = 1
ORDER BY r.repositorio_nome;

-- ---------------------------------------------------------------------
-- 4. Escaneamentos com repositório, quem pediu e duração em segundos
--    (a duração é NULL enquanto o escaneamento não terminou)
-- ---------------------------------------------------------------------
SELECT e.id_escaneamento,
       CONCAT(r.repositorio_dono, '/', r.repositorio_nome) AS repositorio,
       d.nome AS solicitante,
       e.status,
       e.data_inicio,
       e.data_fim,
       TIMESTAMPDIFF(SECOND, e.data_inicio, e.data_fim) AS duracao_segundos
FROM Escaneamento e
JOIN Repositorio  r ON r.id_repositorio   = e.id_repositorio
JOIN Desenvolvedor d ON d.id_desenvolvedor = e.id_desenvolvedor
ORDER BY e.data_inicio DESC;

-- ---------------------------------------------------------------------
-- 5. Dossiê: achados de um escaneamento (id 1), do mais grave ao menos
-- ---------------------------------------------------------------------
SELECT a.id_achado,
       a.severidade,
       a.tipo,
       a.titulo,
       a.arquivo,
       a.evidencia,
       a.explicacao,
       a.correcao
FROM Achado a
WHERE a.id_escaneamento = 1
ORDER BY FIELD(a.severidade, 'critica', 'alta', 'media', 'baixa'), a.id_achado;

-- ---------------------------------------------------------------------
-- 6. Quantos achados de cada gravidade em cada escaneamento
--    (escaneamentos sem achados aparecem com zeros)
-- ---------------------------------------------------------------------
SELECT e.id_escaneamento,
       COALESCE(SUM(a.severidade = 'critica'), 0) AS criticos,
       COALESCE(SUM(a.severidade = 'alta'),    0) AS altos,
       COALESCE(SUM(a.severidade = 'media'),   0) AS medios,
       COALESCE(SUM(a.severidade = 'baixa'),   0) AS baixos,
       COUNT(a.id_achado)                         AS total
FROM Escaneamento e
LEFT JOIN Achado a ON a.id_escaneamento = e.id_escaneamento
GROUP BY e.id_escaneamento
ORDER BY e.id_escaneamento;

-- ---------------------------------------------------------------------
-- 7. Nota de cada escaneamento concluído
--    O escaneamento 1 dá 100 - 25 - 10 - 4 = 61
-- ---------------------------------------------------------------------
SELECT e.id_escaneamento,
       CONCAT(r.repositorio_dono, '/', r.repositorio_nome) AS repositorio,
       e.data_inicio,
       GREATEST(0, 100
           - 25 * COALESCE(SUM(a.severidade = 'critica'), 0)
           - 10 * COALESCE(SUM(a.severidade = 'alta'),    0)
           -  4 * COALESCE(SUM(a.severidade = 'media'),   0)
           -  1 * COALESCE(SUM(a.severidade = 'baixa'),   0)
       ) AS nota
FROM Escaneamento e
JOIN Repositorio r ON r.id_repositorio = e.id_repositorio
LEFT JOIN Achado a ON a.id_escaneamento = e.id_escaneamento
WHERE e.status = 'concluido'
GROUP BY e.id_escaneamento, r.repositorio_dono, r.repositorio_nome, e.data_inicio
ORDER BY e.data_inicio DESC;

-- ---------------------------------------------------------------------
-- 8. Histórico de um repositório (id 1): a nota ao longo do tempo,
--    com a diferença em relação ao escaneamento anterior
-- ---------------------------------------------------------------------
WITH notas AS (
    SELECT e.id_escaneamento,
           e.id_repositorio,
           e.data_inicio,
           GREATEST(0, 100
               - 25 * COALESCE(SUM(a.severidade = 'critica'), 0)
               - 10 * COALESCE(SUM(a.severidade = 'alta'),    0)
               -  4 * COALESCE(SUM(a.severidade = 'media'),   0)
               -  1 * COALESCE(SUM(a.severidade = 'baixa'),   0)
           ) AS nota
    FROM Escaneamento e
    LEFT JOIN Achado a ON a.id_escaneamento = e.id_escaneamento
    WHERE e.status = 'concluido'
    GROUP BY e.id_escaneamento, e.id_repositorio, e.data_inicio
)
SELECT id_escaneamento,
       data_inicio,
       nota,
       nota - LAG(nota) OVER (ORDER BY data_inicio) AS variacao
FROM notas
WHERE id_repositorio = 1
ORDER BY data_inicio;

-- ---------------------------------------------------------------------
-- 9. Painel: última nota de cada repositório de um desenvolvedor (id 1)
-- ---------------------------------------------------------------------
WITH notas AS (
    SELECT e.id_escaneamento,
           e.id_repositorio,
           e.data_inicio,
           GREATEST(0, 100
               - 25 * COALESCE(SUM(a.severidade = 'critica'), 0)
               - 10 * COALESCE(SUM(a.severidade = 'alta'),    0)
               -  4 * COALESCE(SUM(a.severidade = 'media'),   0)
               -  1 * COALESCE(SUM(a.severidade = 'baixa'),   0)
           ) AS nota
    FROM Escaneamento e
    LEFT JOIN Achado a ON a.id_escaneamento = e.id_escaneamento
    WHERE e.status = 'concluido'
    GROUP BY e.id_escaneamento, e.id_repositorio, e.data_inicio
),
ultimas AS (
    SELECT n.*,
           ROW_NUMBER() OVER (PARTITION BY n.id_repositorio ORDER BY n.data_inicio DESC) AS posicao
    FROM notas n
)
SELECT CONCAT(r.repositorio_dono, '/', r.repositorio_nome) AS repositorio,
       u.nota        AS ultima_nota,
       u.data_inicio AS ultimo_escaneamento
FROM Conexao c
JOIN Repositorio r ON r.id_repositorio = c.id_repositorio
LEFT JOIN ultimas u ON u.id_repositorio = r.id_repositorio AND u.posicao = 1
WHERE c.id_desenvolvedor = 1
ORDER BY r.repositorio_nome;

-- ---------------------------------------------------------------------
-- 10. Tipos de achado mais comuns
-- ---------------------------------------------------------------------
SELECT tipo,
       COUNT(*) AS quantidade
FROM Achado
GROUP BY tipo
ORDER BY quantidade DESC, tipo;

-- ---------------------------------------------------------------------
-- 11. Escaneamentos que deram erro, com a mensagem do log
-- ---------------------------------------------------------------------
SELECT e.id_escaneamento,
       CONCAT(r.repositorio_dono, '/', r.repositorio_nome) AS repositorio,
       l.data_hora,
       l.mensagem
FROM Escaneamento e
JOIN Repositorio  r ON r.id_repositorio   = e.id_repositorio
JOIN Log_analise  l ON l.id_escaneamento  = e.id_escaneamento
WHERE e.status = 'erro'
  AND l.nivel  = 'erro'
ORDER BY l.data_hora;

-- ---------------------------------------------------------------------
-- 12. Log completo de um escaneamento (id 1), em ordem de horário
-- ---------------------------------------------------------------------
SELECT data_hora, nivel, mensagem
FROM Log_analise
WHERE id_escaneamento = 1
ORDER BY data_hora, id_log;

-- ---------------------------------------------------------------------
-- 13. Relatórios gerados, com o repositório de origem
-- ---------------------------------------------------------------------
SELECT rel.id_relatorio,
       rel.nome_arquivo,
       rel.caminho_arquivo,
       rel.data_geracao,
       CONCAT(r.repositorio_dono, '/', r.repositorio_nome) AS repositorio
FROM Relatorio rel
JOIN Escaneamento e ON e.id_escaneamento = rel.id_escaneamento
JOIN Repositorio  r ON r.id_repositorio  = e.id_repositorio
ORDER BY rel.data_geracao DESC;

-- ---------------------------------------------------------------------
-- 14. Repositórios que nunca foram escaneados
-- ---------------------------------------------------------------------
SELECT CONCAT(r.repositorio_dono, '/', r.repositorio_nome) AS repositorio,
       r.visibilidade
FROM Repositorio r
LEFT JOIN Escaneamento e ON e.id_repositorio = r.id_repositorio
WHERE e.id_escaneamento IS NULL;

-- ---------------------------------------------------------------------
-- 15. Escaneamentos ainda em andamento (na fila ou analisando)
-- ---------------------------------------------------------------------
SELECT e.id_escaneamento,
       CONCAT(r.repositorio_dono, '/', r.repositorio_nome) AS repositorio,
       e.status,
       e.data_inicio
FROM Escaneamento e
JOIN Repositorio r ON r.id_repositorio = e.id_repositorio
WHERE e.status IN ('na_fila', 'analisando')
ORDER BY e.data_inicio;