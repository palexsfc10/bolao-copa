import sqlite3
import os
from datetime import datetime

os.makedirs("data", exist_ok=True)

DB_NAME = os.getenv("DB_NAME", "data/bolao.db")


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
            em_cheio INTEGER DEFAULT 0,
            desfechos INTEGER DEFAULT 0,
            erros INTEGER DEFAULT 0,
            delta_pts INTEGER DEFAULT 0,
            variacao INTEGER DEFAULT 0
        )
    """)

    colunas = {
        "em_cheio": "INTEGER DEFAULT 0",
        "desfechos": "INTEGER DEFAULT 0",
        "erros": "INTEGER DEFAULT 0",
        "delta_pts": "INTEGER DEFAULT 0",
        "variacao": "INTEGER DEFAULT 0",
    }

    for coluna, tipo in colunas.items():
        try:
            cursor.execute(f"ALTER TABLE ranking ADD COLUMN {coluna} {tipo}")
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
            (1, "Dennis Bergkamp", 17, 3, 1, 0, 7, 0),
            (2, "Alexandre", 15, 3, 0, 1, 5, -1),
            (3, "Branco", 14, 2, 2, 0, 7, 4),
        ]

        cursor.executemany("""
            INSERT INTO ranking (
                pos, nome, pontos, em_cheio, desfechos, erros, delta_pts, variacao
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, participantes)

        cursor.execute("""
            INSERT OR REPLACE INTO configuracoes (chave, valor)
            VALUES ('ultima_atualizacao', '12/06/2026')
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
        SELECT
            pos,
            nome,
            pontos,
            em_cheio,
            desfechos,
            erros,
            delta_pts,
            variacao
        FROM ranking
        ORDER BY pos ASC, pontos DESC, nome ASC
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

    ranking_processado = []

    for item in novo_ranking:
        ranking_processado.append((
            int(item["pos"]),
            item["nome"].strip(),
            int(item["pontos"]),
            int(item.get("em_cheio", 0)),
            int(item.get("desfechos", 0)),
            int(item.get("erros", 0)),
            int(item.get("delta_pts", 0)),
            int(item.get("variacao", 0)),
        ))

    cursor.execute("DELETE FROM ranking")

    cursor.executemany("""
        INSERT INTO ranking (
            pos, nome, pontos, em_cheio, desfechos, erros, delta_pts, variacao
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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