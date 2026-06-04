import { API_URL } from "../config";
import { useState } from "react";
import axios from "axios";

function Admin() {
  const [file, setFile] = useState(null);
  const [textoExtraido, setTextoExtraido] = useState("");
  const [arquivoOriginal, setArquivoOriginal] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [token, setToken] = useState(localStorage.getItem("admin_token") || "");
  const [senha, setSenha] = useState("");

  async function enviarPdf() {
    setErro("");
    setSucesso("");
    setTextoExtraido("");

    if (!file) {
      setErro("Selecione um arquivo PDF antes de enviar.");
      return;
    }

    if (file.type !== "application/pdf") {
      setErro("O arquivo precisa ser um PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/upload-pdf`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setArquivoOriginal(response.data.arquivo_original);
      setTextoExtraido(response.data.texto_extraido);
      setSucesso("PDF enviado e processado com sucesso!");
    } catch (error) {
      console.error(error);
      setErro("Erro ao enviar o PDF. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  }

  async function alterarStatusAtualizacao(status) {
    try {
      await axios.post(
        `${API_URL}/admin/status-atualizacao`,
        {
          em_atualizacao: status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setErro("");
      setSucesso(
        status
          ? "Página pública colocada em modo de atualização."
          : "Página pública liberada novamente."
      );
    } catch (error) {
      console.error(error);
      setSucesso("");
      setErro("Erro ao alterar status da página pública.");
    }
  }

  async function fazerLogin() {
    if (!senha.trim()) {
      setErro("Digite a senha da Central VAR.");
      return;
    }

    try {
      await axios.post(`${API_URL}/admin/login`, {
        senha: senha,
      });

      localStorage.setItem("admin_token", senha);
      setToken(senha);
      setSenha("");
      setErro("");
      setSucesso("Login realizado com sucesso.");
    } catch (error) {
      console.error(error);
      setErro("Senha inválida.");
      setSucesso("");
    }
  }

  function sair() {
    localStorage.removeItem("admin_token");
    setToken("");
    setSenha("");
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <section className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h1 className="text-3xl font-bold mb-2">
            🎥 Central VAR
          </h1>

          <p className="text-slate-300 mb-5">
            Acesso restrito à comissão de apuração do bolão.
          </p>

          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha do administrador"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-emerald-500 mb-4"
          />

          <button
            onClick={fazerLogin}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl px-4 py-3 transition"
          >
            Entrar
          </button>

          {erro && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-4">
              {erro}
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-6">
      <section className="max-w-4xl mx-auto">
        <header className="mb-6">
          <p className="text-sm text-emerald-400 font-semibold">
            🎥 Central VAR
          </p>

          <h1 className="text-3xl md:text-5xl font-bold mt-1">
            📄 Upload da Classificação
          </h1>

          <p className="text-slate-300 mt-2">
            Envie o PDF da rodada para extrair os dados da classificação.
          </p>
        </header>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
          <h2 className="text-xl font-bold mb-2">Status da página pública</h2>

          <p className="text-slate-300 mb-4">
            Use estes botões enquanto os administradores conferem os resultados.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => alterarStatusAtualizacao(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold rounded-2xl px-4 py-3 transition"
            >
              ⏳ Colocar em atualização
            </button>

            <button
              onClick={() => alterarStatusAtualizacao(false)}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl px-4 py-3 transition"
            >
              ✅ Liberar classificação
            </button>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
          <h2 className="text-xl font-bold mb-4">Enviar PDF</h2>

          <label className="block border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center cursor-pointer hover:border-emerald-500 transition">
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setErro("");
                setSucesso("");
                setTextoExtraido("");
              }}
            />

            <div className="text-4xl mb-3">📎</div>

            {file ? (
              <div>
                <p className="font-semibold">{file.name}</p>
                <p className="text-slate-400 text-sm mt-1">
                  Clique em processar para enviar.
                </p>
              </div>
            ) : (
              <div>
                <p className="font-semibold">
                  Clique aqui para selecionar o PDF
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Apenas arquivos .pdf
                </p>
              </div>
            )}
          </label>

          <button
            onClick={enviarPdf}
            disabled={loading}
            className="mt-5 w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-950 font-bold rounded-2xl px-4 py-3 transition"
          >
            {loading ? "Processando PDF..." : "Processar PDF"}
          </button>

          {erro && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-4">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl p-4">
              {sucesso}
            </div>
          )}
        </section>

        {textoExtraido && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-xl font-bold">Prévia do texto extraído</h2>
                <p className="text-slate-400 text-sm">
                  Arquivo: {arquivoOriginal}
                </p>
              </div>

              <span className="bg-slate-800 text-slate-300 rounded-full px-3 py-1 text-sm">
                {textoExtraido.length} caracteres
              </span>
            </div>

            <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300 whitespace-pre-wrap max-h-[500px] overflow-auto">
              {textoExtraido}
            </pre>
          </section>
        )}
      </section>
    </main>
  );
}

export default Admin;