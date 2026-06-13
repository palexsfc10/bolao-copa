from fastapi import FastAPI, UploadFile, File, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fitz
import os
import uuid
import re

from database import (
    criar_tabelas,
    inserir_dados_iniciais,
    listar_ranking,
    obter_configuracao,
    salvar_configuracao,
    importar_novo_ranking,
)

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")

if not ADMIN_TOKEN:
    raise RuntimeError("ADMIN_TOKEN não configurado")

app = FastAPI(title="API Bolão Copa")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

criar_tabelas()
inserir_dados_iniciais()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def validar_admin(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token ausente")

    token = authorization.replace("Bearer ", "")

    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Token inválido")


def converter_inteiro(tokens):
    if not tokens:
        return None

    valor = "".join(tokens)
    valor = valor.replace("−", "-").replace("–", "-").strip()

    if re.fullmatch(r"-?\d+", valor):
        return int(valor)

    return None


def agrupar_linhas(words, tolerancia=3):
    words = sorted(words, key=lambda w: (w[1], w[0]))
    linhas = []

    for word in words:
        x0, y0, x1, y1, texto, *_ = word

        adicionou = False

        for linha in linhas:
            if abs(linha["y"] - y0) <= tolerancia:
                linha["words"].append(word)
                linha["y"] = (linha["y"] + y0) / 2
                adicionou = True
                break

        if not adicionou:
            linhas.append({
                "y": y0,
                "words": [word]
            })

    return sorted(linhas, key=lambda linha: linha["y"])


def extrair_ranking_do_pdf(file_path):
    participantes = []
    pos_atual = None

    with fitz.open(file_path) as pdf:
        for page in pdf:
            words = page.get_text("words")
            linhas = agrupar_linhas(words)

            for linha in linhas:
                words_linha = sorted(linha["words"], key=lambda w: w[0])

                def coluna(x_inicio, x_fim):
                    return [
                        w[4]
                        for w in words_linha
                        if x_inicio <= w[0] < x_fim
                    ]

                for token in coluna(50, 100):
                    match_pos = re.match(r"^(\d+)º?$", token)
                    if match_pos:
                        pos_atual = int(match_pos.group(1))
                        break

                nome = " ".join(coluna(100, 230)).strip()

                if not nome or nome.lower() in ["participantes"]:
                    continue

                pontos = converter_inteiro(coluna(230, 270))
                em_cheio = converter_inteiro(coluna(275, 325))
                desfechos = converter_inteiro(coluna(325, 380))
                erros = converter_inteiro(coluna(385, 430))
                delta_pts = converter_inteiro(coluna(440, 485))
                variacao = converter_inteiro(coluna(495, 540))

                if None in [
                    pontos,
                    em_cheio,
                    desfechos,
                    erros,
                    delta_pts,
                    variacao,
                ]:
                    continue

                if pos_atual is None:
                    continue

                participantes.append({
                    "pos": pos_atual,
                    "nome": nome,
                    "pontos": pontos,
                    "em_cheio": em_cheio,
                    "desfechos": desfechos,
                    "erros": erros,
                    "delta_pts": delta_pts,
                    "variacao": variacao,
                })

    return participantes

@app.get("/")
def home():
    return {"message": "API Bolão Copa rodando"}


@app.get("/ranking")
def get_ranking():
    em_atualizacao = obter_configuracao("ranking_em_atualizacao", "false")

    if em_atualizacao == "true":
        return {
            "em_atualizacao": True,
            "mensagem": "A classificação está sendo atualizada. Volte em alguns minutos.",
            "ultima_atualizacao": obter_configuracao("ultima_atualizacao", ""),
            "participantes": [],
        }

    dados = listar_ranking()
    dados["em_atualizacao"] = False
    return dados


@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    authorization: str = Header(None),
):
    validar_admin(authorization)

    if not file.filename.lower().endswith(".pdf"):
        return {"erro": "Envie apenas arquivos PDF"}

    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")

    content = await file.read()

    with open(file_path, "wb") as f:
        f.write(content)

    texto_extraido = ""

    with fitz.open(file_path) as pdf:
        for page in pdf:
            texto_extraido += page.get_text()

    participantes = extrair_ranking_do_pdf(file_path)

    if not participantes:
        return {
            "erro": "Não foi possível identificar participantes no PDF.",
            "texto_extraido": texto_extraido,
        }

    resultado = importar_novo_ranking(participantes)

    return {
        "arquivo_original": file.filename,
        "arquivo_salvo": f"{file_id}.pdf",
        "total_participantes": len(participantes),
        "participantes": participantes,
        "resultado": resultado,
    }


@app.post("/admin/status-atualizacao")
def alterar_status_atualizacao(
    payload: dict,
    authorization: str = Header(None),
):
    validar_admin(authorization)

    em_atualizacao = payload.get("em_atualizacao")

    if em_atualizacao not in [True, False]:
        return {"erro": "Campo em_atualizacao precisa ser true ou false"}

    salvar_configuracao(
        "ranking_em_atualizacao",
        "true" if em_atualizacao else "false",
    )

    return {
        "em_atualizacao": em_atualizacao,
        "mensagem": "Status atualizado com sucesso",
    }


@app.post("/admin/importar-ranking")
def importar_ranking(
    payload: dict,
    authorization: str = Header(None),
):
    validar_admin(authorization)

    participantes = payload.get("participantes")

    if not participantes or not isinstance(participantes, list):
        return {"erro": "Envie uma lista de participantes"}

    campos_obrigatorios = [
        "pos",
        "nome",
        "pontos",
        "mosca",
        "tiro",
        "patriota",
    ]

    for item in participantes:
        for campo in campos_obrigatorios:
            if campo not in item:
                return {"erro": f"Campo obrigatório ausente: {campo}"}

    resultado = importar_novo_ranking(participantes)

    return resultado


@app.post("/admin/login")
def login_admin(payload: dict):
    senha = payload.get("senha")

    if senha != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Senha inválida")

    return {
        "success": True,
        "message": "Login realizado com sucesso",
    }