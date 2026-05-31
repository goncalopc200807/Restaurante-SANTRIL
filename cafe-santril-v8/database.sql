-- ============================================================
--  BASE DE DADOS — RESTAURANTE SANTRIL
--  Ficheiro: database.sql
--  Descrição: Estrutura SQL equivalente ao sistema em
--             localStorage implementado no site.
--             Pode ser importado em MySQL / MariaDB.
-- ============================================================

CREATE DATABASE IF NOT EXISTS santril_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE santril_db;

-- ============================================================
--  TABELA: utilizadores
--  Guarda as contas registadas no site (clientes e admin)
-- ============================================================

CREATE TABLE IF NOT EXISTS utilizadores (
    id          INT             NOT NULL AUTO_INCREMENT,
    nome        VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    NOT NULL UNIQUE,
    palavra_passe VARCHAR(255)  NOT NULL,         -- hash em produção
    tipo        ENUM('admin', 'utilizador') NOT NULL DEFAULT 'utilizador',
    criado_em   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Inserir administrador padrão
INSERT INTO utilizadores (nome, email, palavra_passe, tipo)
VALUES ('Administrador', 'admin@santril.pt', 'admin123', 'admin');


-- ============================================================
--  TABELA: mesas
--  Representa as mesas físicas do restaurante
-- ============================================================

CREATE TABLE IF NOT EXISTS mesas (
    id          INT             NOT NULL AUTO_INCREMENT,
    numero      INT             NOT NULL UNIQUE,
    capacidade  INT             NOT NULL DEFAULT 6,
    activa      TINYINT(1)      NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
);

-- Inserir as 7 mesas do restaurante
INSERT INTO mesas (numero, capacidade) VALUES
    (1, 6),
    (2, 6),
    (3, 6),
    (4, 6),
    (5, 6),
    (6, 6),
    (7, 6);


-- ============================================================
--  TABELA: reservas
--  Guarda todas as reservas feitas pelos utilizadores
-- ============================================================

CREATE TABLE IF NOT EXISTS reservas (
    id              INT             NOT NULL AUTO_INCREMENT,
    utilizador_id   INT             NOT NULL,
    mesa_id         INT             NOT NULL,
    data_reserva    DATE            NOT NULL,
    hora_reserva    TIME            NOT NULL,
    num_pessoas     INT             NOT NULL CHECK (num_pessoas BETWEEN 1 AND 6),
    observacoes     VARCHAR(500)    DEFAULT NULL,
    estado          ENUM('confirmada', 'cancelada', 'concluida') NOT NULL DEFAULT 'confirmada',
    criado_em       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE CASCADE,
    FOREIGN KEY (mesa_id)       REFERENCES mesas(id)        ON DELETE RESTRICT,
    -- Impede duas reservas na mesma mesa, data e hora
    UNIQUE KEY uq_mesa_data_hora (mesa_id, data_reserva, hora_reserva)
);


-- ============================================================
--  TABELA: mensagens
--  Guarda as mensagens enviadas pelo formulário de contacto
-- ============================================================

CREATE TABLE IF NOT EXISTS mensagens (
    id          INT             NOT NULL AUTO_INCREMENT,
    nome        VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    NOT NULL,
    assunto     VARCHAR(200)    NOT NULL,
    texto       TEXT            NOT NULL,
    lida        TINYINT(1)      NOT NULL DEFAULT 0,
    enviada_em  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);


-- ============================================================
--  TABELA: pratos
--  Catálogo de pratos do restaurante
-- ============================================================

CREATE TABLE IF NOT EXISTS pratos (
    id          INT             NOT NULL AUTO_INCREMENT,
    nome        VARCHAR(150)    NOT NULL,
    descricao   TEXT            DEFAULT NULL,
    categoria   ENUM('diaria', 'principal', 'reserva', 'sobremesa') NOT NULL,
    dia_semana  VARCHAR(20)     DEFAULT NULL,  -- ex: 'terca', 'quarta', 'todos'
    disponivel  TINYINT(1)      NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
);

-- Inserir pratos do Santril
INSERT INTO pratos (nome, descricao, categoria, dia_semana) VALUES
    ('Bifes da Diária',      'Bifes grelhados servidos diariamente',                        'diaria',    'todos'),
    ('Massa à Labrador',     'Massa com carne assada',                                       'diaria',    'terca'),
    ('Carne Assada',         'Carne assada com acompanhamento',                              'diaria',    'terca'),
    ('Cozido à Portuguesa',  'Cozido tradicional com carnes, enchidos e legumes',            'diaria',    'quarta'),
    ('Lombo de Porco Assado','Lombo de porco assado na brasa',                              'diaria',    'quinta'),
    ('Carne Estufada',       'Carne estufada com molho',                                    'diaria',    'quinta'),
    ('Frango Assado',        'Frango assado no forno',                                      'diaria',    'sexta'),
    ('Rabos de Bacalhau',    'Rabos de bacalhau fritos ou assados',                         'diaria',    'sexta'),
    ('Feijoada',             'Feijoada completa com carnes e enchidos',                     'diaria',    'sabado'),
    ('Bifes Grelhados',      'Bifes tenros servidos com batatas, arroz e salada',           'principal', 'todos'),
    ('Bacalhau Assado',      'Bacalhau assado com batatas a murro e grelos',                'principal', 'todos'),
    ('Cozido à Portuguesa',  'Apenas ao sábado — cozido completo',                          'principal', 'sabado'),
    ('Cabrito Assado',       'Cabrito assado — apenas com reserva prévia',                  'reserva',   NULL),
    ('Pica no Chão',         'Prato tradicional minhoto — apenas com reserva prévia',       'reserva',   NULL),
    ('Rabos de Boi',         'Rabos de boi estufados — apenas com reserva prévia',          'reserva',   NULL),
    ('Vitela Assada',        'Vitela assada no forno — apenas com reserva prévia',          'reserva',   NULL);


-- ============================================================
--  VIEWS — consultas úteis
-- ============================================================

-- Ver reservas ativas desta semana com dados do utilizador e mesa
CREATE OR REPLACE VIEW v_reservas_semana AS
SELECT
    r.id,
    r.data_reserva,
    r.hora_reserva,
    m.numero        AS numero_mesa,
    r.num_pessoas,
    r.observacoes,
    r.estado,
    u.nome          AS nome_utilizador,
    u.email         AS email_utilizador
FROM reservas r
JOIN utilizadores u ON u.id = r.utilizador_id
JOIN mesas        m ON m.id = r.mesa_id
WHERE r.data_reserva >= CURDATE()
  AND r.estado = 'confirmada'
ORDER BY r.data_reserva, r.hora_reserva;


-- Ver mesas livres para uma data e hora específica
-- Uso: CALL mesas_disponiveis('2025-06-10', '20:00:00');
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS mesas_disponiveis(
    IN p_data DATE,
    IN p_hora TIME
)
BEGIN
    SELECT m.numero, m.capacidade
    FROM mesas m
    WHERE m.activa = 1
      AND m.id NOT IN (
          SELECT r.mesa_id
          FROM reservas r
          WHERE r.data_reserva = p_data
            AND r.hora_reserva = p_hora
            AND r.estado = 'confirmada'
      )
    ORDER BY m.numero;
END$$
DELIMITER ;


-- ============================================================
--  ÍNDICES — melhorar performance das pesquisas
-- ============================================================

CREATE INDEX idx_reservas_data  ON reservas (data_reserva);
CREATE INDEX idx_reservas_user  ON reservas (utilizador_id);
CREATE INDEX idx_mensagens_lida ON mensagens (lida);
CREATE INDEX idx_pratos_cat     ON pratos (categoria);
