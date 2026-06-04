import { API_URL } from "../config";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function medalha(pos) {
  if (pos === 1) return "🥇";
  if (pos === 2) return "🥈";
  if (pos === 3) return "🥉";
  return `${pos}º`;
}

function formatarVariacao(valor) {
  const variacao = Number(valor || 0);

  if (variacao > 0) return `⬆️ ${variacao}`;
  if (variacao < 0) return `⬇️ ${Math.abs(variacao)}`;
  return "➖";
}

function Ranking() {
  const [busca, setBusca] = useState("");
  const [participantes, setParticipantes] = useState([]);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [emAtualizacao, setEmAtualizacao] = useState(false);
  const [mensagemAtualizacao, setMensagemAtualizacao] = useState("");

  useEffect(() => {
    async function carregarRanking() {
      try {
        const response = await axios.get(`${API_URL}/ranking`);

        setEmAtualizacao(response.data.em_atualizacao || false);
        setMensagemAtualizacao(response.data.mensagem || "");
        setParticipantes(response.data.participantes || []);
        setUltimaAtualizacao(response.data.ultima_atualizacao || "");
      } catch (error) {
        console.error(error);
        setErro("Não foi possível carregar o ranking.");
      } finally {
        setCarregando(false);
      }
    }

    carregarRanking();
  }, []);

  const participantesFiltrados = useMemo(() => {
    return participantes.filter((p) =>
      String(p.nome || "")
        .toLowerCase()
        .includes(busca.toLowerCase())
    );
  }, [busca, participantes]);

  if (carregando) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Carregando ranking...</p>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>{erro}</p>
      </main>
    );
  }

  if (emAtualizacao) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <section className="max-w-xl text-center bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <div className="text-6xl mb-4">⏳</div>

          <h1 className="text-3xl font-bold mb-3">
            Classificação em atualização
          </h1>

          <p className="text-slate-300 mb-4">
            {mensagemAtualizacao ||
              "A equipe do bolão está conferindo os resultados da rodada."}
          </p>

          <p className="text-sm text-slate-500">
            Assim que a nova classificação for publicada, esta página voltará ao
            normal.
          </p>
        </section>
      </main>
    );
  }

  if (participantes.length === 0) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Nenhum ranking encontrado.</p>
      </main>
    );
  }

  const lider = participantes[0] || null;

  const maiorSubida =
    [...participantes].sort(
      (a, b) => Number(b.variacao || 0) - Number(a.variacao || 0)
    )[0] || null;

  const maiorQueda =
    [...participantes].sort(
      (a, b) => Number(a.variacao || 0) - Number(b.variacao || 0)
    )[0] || null;

  const reiDaMosca =
    [...participantes].sort(
      (a, b) => Number(b.mosca || 0) - Number(a.mosca || 0)
    )[0] || null;

  const patriota =
    [...participantes].sort(
      (a, b) => Number(b.patriota || 0) - Number(a.patriota || 0)
    )[0] || null;

  const maiorPontuacao = Number(lider?.pontos || 0);

  function gerarJornal() {
    const textos = [];

    textos.push(
      `${lider?.nome || "O líder"} segue no topo da classificação com ${lider?.pontos || 0
      } pontos.`
    );

    if (
      maiorSubida &&
      Number(maiorSubida.variacao || 0) > 0 &&
      maiorSubida.nome !== lider?.nome
    ) {
      textos.push(
        `${maiorSubida.nome} foi o grande destaque da rodada e subiu ${maiorSubida.variacao
        } posições.`
      );
    }

    if (
      maiorSubida &&
      Number(maiorSubida.variacao || 0) > 0 &&
      maiorSubida.nome === lider?.nome
    ) {
      textos.push(
        `Além de liderar, ${maiorSubida.nome} também foi o destaque da rodada, subindo ${maiorSubida.variacao} posições.`
      );
    }

    if (
      maiorQueda &&
      Number(maiorQueda.variacao || 0) < 0 &&
      maiorQueda.nome !== lider?.nome
    ) {
      textos.push(
        `${maiorQueda.nome} teve a maior queda da rodada, perdendo ${Math.abs(
          maiorQueda.variacao
        )} posições.`
      );
    }

    if (reiDaMosca && reiDaMosca.nome !== lider?.nome) {
      textos.push(
        `${reiDaMosca.nome} lidera o quesito Na Mosca com ${reiDaMosca.mosca || 0
        } placares exatos.`
      );
    }

    if (reiDaMosca && reiDaMosca.nome === lider?.nome) {
      textos.push(
        `${reiDaMosca.nome} também lidera o quesito Na Mosca, mostrando precisão nos placares.`
      );
    }

    if (
      patriota &&
      patriota.nome !== lider?.nome &&
      patriota.nome !== reiDaMosca?.nome
    ) {
      textos.push(
        `${patriota.nome} segue como destaque nos jogos da seleção brasileira.`
      );
    }

    if (textos.length === 1) {
      textos.push(
        "A rodada ainda promete muita disputa, com a classificação aberta entre os participantes."
      );
    }

    return textos;
  }

  const jornal = gerarJornal();

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-6">
      <section className="max-w-6xl mx-auto">
        <header className="mb-6">
          <p className="text-sm text-emerald-400 font-semibold">
            Copa do Mundo 2026
          </p>

          <h1 className="text-3xl md:text-5xl font-bold mt-1">
            🏆 Bolão da Copa
          </h1>

          <p className="text-slate-300 mt-2">
            Classificação geral atualizada após a rodada.
          </p>

          <div className="mt-4 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 inline-block">
            <p className="text-slate-400 text-sm">Última atualização</p>
            <p className="font-semibold">{ultimaAtualizacao || "-"}</p>
          </div>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <p className="text-slate-400 text-sm">Participantes</p>
            <h2 className="text-2xl font-bold mt-1">
              👥 {participantes.length}
            </h2>
          </div>

          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <p className="text-slate-400 text-sm">Maior Pontuação</p>
            <h2 className="text-2xl font-bold mt-1">
              🔥 {maiorPontuacao} pts
            </h2>
          </div>

          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <p className="text-slate-400 text-sm">Líder Geral</p>
            <h2 className="text-xl font-bold mt-1">
              🏆 {lider?.nome || "-"}
            </h2>
          </div>

          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <p className="text-slate-400 text-sm">O Patriota</p>
            <h2 className="text-xl font-bold mt-1">
              🇧🇷 {patriota?.nome || "-"}
            </h2>
          </div>
        </section>

        <section className="bg-slate-900 rounded-2xl p-5 border border-slate-800 mb-6">
          <h2 className="text-xl font-bold mb-4">
            🔥 Movimentações da Rodada
          </h2>

          <div className="space-y-3">
            <div>
              🚀 <strong>Destaque:</strong>{" "}
              {maiorSubida?.nome || "-"}
              {" "}
              ({formatarVariacao(maiorSubida?.variacao)})
            </div>

            <div>
              📉 <strong>Maior Queda:</strong>{" "}
              {maiorQueda?.nome || "-"}
              {" "}
              ({formatarVariacao(maiorQueda?.variacao)})
            </div>

            <div>
              🎯 <strong>Rei da Mosca:</strong>{" "}
              {reiDaMosca?.nome || "-"}
              {" "}
              ({reiDaMosca?.mosca || 0} acertos)
            </div>
          </div>
        </section>

        <section className="bg-slate-900 rounded-2xl p-5 border border-slate-800 mb-6">
          <h2 className="text-xl font-bold mb-4">📰 Jornal do Bolão</h2>

          <div className="space-y-3 text-slate-300 leading-relaxed">
            {jornal.map((linha, index) => (
              <p key={index}>{linha}</p>
            ))}
          </div>
        </section>

        <section className="mb-4">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="🔎 Buscar participante..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-emerald-500"
          />
        </section>

        <section className="hidden md:block bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="text-left p-4">Pos</th>
                <th className="text-left p-4">Participante</th>
                <th className="text-left p-4">Pontos</th>
                <th className="text-left p-4">Variação</th>
                <th className="text-left p-4">🎯 Na Mosca</th>
                <th className="text-left p-4">⚽ Tiro Certo</th>
                <th className="text-left p-4">🇧🇷 Patriota</th>
              </tr>
            </thead>

            <tbody>
              {participantesFiltrados.map((p) => (
                <tr key={`${p.pos}-${p.nome}`} className="border-t border-slate-800">
                  <td className="p-4 font-bold">{medalha(Number(p.pos))}</td>
                  <td className="p-4">{p.nome}</td>
                  <td className="p-4 font-bold text-emerald-400">
                    {p.pontos}
                  </td>
                  <td className="p-4 font-semibold">
                    {formatarVariacao(p.variacao)}
                  </td>
                  <td className="p-4">{p.mosca}</td>
                  <td className="p-4">{p.tiro}</td>
                  <td className="p-4">{p.patriota}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="md:hidden space-y-4">
          {participantesFiltrados.map((p) => (
            <div
              key={`${p.pos}-${p.nome}`}
              className="bg-slate-900 rounded-2xl p-4 border border-slate-800"
            >
              <div className="flex justify-between items-center gap-3">
                <h3 className="text-xl font-bold">
                  {medalha(Number(p.pos))} {p.nome}
                </h3>

                <span className="text-emerald-400 font-bold">
                  {p.pontos} pts
                </span>
              </div>

              <div className="mt-3 text-sm font-semibold">
                Variação: {formatarVariacao(p.variacao)}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-sm text-center">
                <div className="bg-slate-800 rounded-xl p-2">
                  🎯
                  <br />
                  {p.mosca}
                </div>

                <div className="bg-slate-800 rounded-xl p-2">
                  ⚽
                  <br />
                  {p.tiro}
                </div>

                <div className="bg-slate-800 rounded-xl p-2">
                  🇧🇷
                  <br />
                  {p.patriota}
                </div>
              </div>
            </div>
          ))}
        </section>

        {participantesFiltrados.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center mt-4">
            <p className="text-slate-300">
              Nenhum participante encontrado com esse nome.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

export default Ranking;