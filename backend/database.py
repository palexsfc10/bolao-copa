import sqlite3
from datetime import datetime

DB_NAME = "data/bolao.db"


def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def criar_tabelas():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ranking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pos INTEGER NOT NULL,
            nome TEXT NOT NULL,
            pontos INTEGER NOT NULL,
            mosca INTEGER NOT NULL,
            tiro INTEGER NOT NULL,
            patriota INTEGER NOT NULL,
            variacao INTEGER DEFAULT 0
        )
    """)

    try:
        cursor.execute("ALTER TABLE ranking ADD COLUMN variacao INTEGER DEFAULT 0")
    except sqlite3.OperationalError:
        pass

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS configuracoes (
            chave TEXT PRIMARY KEY,
            valor TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


def inserir_dados_iniciais():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM ranking")
    total = cursor.fetchone()[0]

    if total == 0:
        participantes = [
            (1, "Jeb", 75, 5, 16, 12, 0),
            (2, "Marlene", 69, 6, 16, 8, 0),
            (3, "Florisvaldo", 64, 3, 13, 18, 0),
            (4, "Piauí", 63, 5, 14, 18, 0),
            (5, "Ailton (Bahia)", 59, 4, 15, 10, 0),
            (6, "Pedro", 55, 3, 14, 9, 0),
            (7, "João", 53, 2, 13, 7, 0),
            (8, "Ana", 51, 4, 11, 6, 0),
        ]

        cursor.executemany("""
            INSERT INTO ranking (
                pos, nome, pontos, mosca, tiro, patriota, variacao
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, participantes)

        cursor.execute("""
            INSERT OR REPLACE INTO configuracoes (chave, valor)
            VALUES ('ultima_atualizacao', '03/06/2026 às 21:45')
        """)

        cursor.execute("""
            INSERT OR REPLACE INTO configuracoes (chave, valor)
            VALUES ('ranking_em_atualizacao', 'false')
        """)

    conn.commit()
    conn.close()


def listar_ranking():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT pos, nome, pontos, mosca, tiro, patriota, variacao
        FROM ranking
        ORDER BY pos ASC
    """)

    dados = [dict(row) for row in cursor.fetchall()]

    cursor.execute("""
        SELECT valor FROM configuracoes
        WHERE chave = 'ultima_atualizacao'
    """)

    resultado = cursor.fetchone()
    ultima_atualizacao = resultado["valor"] if resultado else ""

    conn.close()

    return {
        "ultima_atualizacao": ultima_atualizacao,
        "participantes": dados
    }


def obter_configuracao(chave, valor_padrao=""):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT valor FROM configuracoes
        WHERE chave = ?
    """, (chave,))

    resultado = cursor.fetchone()
    conn.close()

    return resultado["valor"] if resultado else valor_padrao


def salvar_configuracao(chave, valor):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT OR REPLACE INTO configuracoes (chave, valor)
        VALUES (?, ?)
    """, (chave, valor))

    conn.commit()
    conn.close()


def importar_novo_ranking(novo_ranking):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT nome, pos FROM ranking")

    ranking_antigo = {
        row["nome"].strip().lower(): row["pos"]
        for row in cursor.fetchall()
    }

    ranking_processado = []

    for item in novo_ranking:
        nome = item["nome"].strip()
        nome_chave = nome.lower()

        pos_nova = int(item["pos"])
        pontos = int(item["pontos"])
        mosca = int(item["mosca"])
        tiro = int(item["tiro"])
        patriota = int(item["patriota"])

        pos_antiga = ranking_antigo.get(nome_chave)

        if pos_antiga is None:
            variacao = 0
        else:
            variacao = pos_antiga - pos_nova

        ranking_processado.append((
            pos_nova,
            nome,
            pontos,
            mosca,
            tiro,
            patriota,
            variacao,
        ))

    cursor.execute("DELETE FROM ranking")

    cursor.executemany("""
        INSERT INTO ranking (
            pos, nome, pontos, mosca, tiro, patriota, variacao
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, ranking_processado)

    agora = datetime.now().strftime("%d/%m/%Y às %H:%M")

    cursor.execute("""
        INSERT OR REPLACE INTO configuracoes (chave, valor)
        VALUES ('ultima_atualizacao', ?)
    """, (agora,))

    cursor.execute("""
        INSERT OR REPLACE INTO configuracoes (chave, valor)
        VALUES ('ranking_em_atualizacao', 'false')
    """)

    conn.commit()
    conn.close()

    return {
        "mensagem": "Ranking importado com sucesso",
        "total": len(ranking_processado),
        "ultima_atualizacao": agora
    }