import { API_URL } from "../config";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  frasesLanterna,
  frasesSubida,
  frasesQueda,
  frasesLider,
  frasesEmCheio,
  frasesErros,
  montarFrase,
} from "../utils/frasesBolao";

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

function formatarDeltaPts(valor) {
  const delta = Number(valor || 0);

  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `${delta}`;
  return "0";
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

  const lanternas = [...participantes]
    .sort((a, b) => Number(b.pos || 0) - Number(a.pos || 0))
    .slice(0, 3);

  const maisErros =
    [...participantes].sort(
      (a, b) => Number(b.erros || 0) - Number(a.erros || 0)
    )[0] || null;

  const reiDoEmCheio =
    [...participantes].sort(
      (a, b) => Number(b.em_cheio || 0) - Number(a.em_cheio || 0)
    )[0] || null;

  const melhorDesfechos =
    [...participantes].sort(
      (a, b) => Number(b.desfechos || 0) - Number(a.desfechos || 0)
    )[0] || null;

  const menorErros =
    [...participantes].sort(
      (a, b) => Number(a.erros || 0) - Number(b.erros || 0)
    )[0] || null;

  const maiorPontuacao = Number(lider?.pontos || 0);

  function gerarJornal() {
    const textos = [];

    textos.push(
      `${lider?.nome || "O líder"} segue no topo da classificação com ${lider?.pontos || 0
      } pontos.`
    );

    if (maiorSubida && Number(maiorSubida.variacao || 0) > 0) {
      textos.push(
        `${maiorSubida.nome} foi o grande destaque da rodada e subiu ${maiorSubida.variacao
        } posições.`
      );
    }

    if (maiorQueda && Number(maiorQueda.variacao || 0) < 0) {
      textos.push(
        `${maiorQueda.nome} teve a maior queda da rodada, perdendo ${Math.abs(
          maiorQueda.variacao
        )} posições.`
      );
    }

    if (reiDoEmCheio) {
      textos.push(
        `${reiDoEmCheio.nome} lidera o quesito Em Cheio com ${reiDoEmCheio.em_cheio || 0
        } acertos.`
      );
    }

    if (melhorDesfechos) {
      textos.push(
        `${melhorDesfechos.nome} aparece forte nos desfechos com ${melhorDesfechos.desfechos || 0
        } acertos.`
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
            Copa do Mundo 2026 • Resenha oficial do bolão
          </p>

          <h1 className="text-3xl md:text-5xl font-bold mt-1">
            🎙️ Central da Corneta
          </h1>

          <p className="text-slate-300 mt-2">
            Classificação, resenha e zoeira atualizadas após a rodada.
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
            <p className="text-slate-400 text-sm">Rei do Em Cheio</p>
            <h2 className="text-xl font-bold mt-1">
              🎯 {reiDoEmCheio?.nome || "-"}
            </h2>
          </div>
        </section>

        <section className="bg-slate-900 rounded-2xl p-5 border border-slate-800 mb-6">
          <h2 className="text-xl font-bold mb-4">
            🔥 Plantão da Rodada
          </h2>

          <div className="space-y-3">
            <div>
              🚀 <strong>Destaque:</strong> {maiorSubida?.nome || "-"} (
              {formatarVariacao(maiorSubida?.variacao)})
            </div>

            <div>
              📉 <strong>Maior Queda:</strong> {maiorQueda?.nome || "-"} (
              {formatarVariacao(maiorQueda?.variacao)})
            </div>

            <div>
              🎯 <strong>Em Cheio:</strong> {reiDoEmCheio?.nome || "-"} (
              {reiDoEmCheio?.em_cheio || 0} acertos)
            </div>

            <div>
              ⚽ <strong>Desfechos:</strong> {melhorDesfechos?.nome || "-"} (
              {melhorDesfechos?.desfechos || 0} acertos)
            </div>

            <div>
              ❌ <strong>Menos Erros:</strong> {menorErros?.nome || "-"} (
              {menorErros?.erros || 0} erros)
            </div>
          </div>
        </section>

        <section className="bg-slate-900 rounded-2xl p-5 border border-slate-800 mb-6">
          <h2 className="text-xl font-bold mb-4">📰 Jornal da Corneta</h2>

          <div className="space-y-3 text-slate-300 leading-relaxed">
            {jornal.map((linha, index) => (
              <p key={index}>{linha}</p>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-yellow-500/10 to-red-500/10 rounded-2xl p-5 border border-yellow-500/30 mb-6">
          <h2 className="text-xl font-bold mb-4">😂 Corneta da Rodada</h2>

          <div className="space-y-3 text-slate-300 leading-relaxed">
            {lider && <p>👑 {montarFrase(frasesLider, lider)}</p>}

            {maiorSubida && Number(maiorSubida.variacao || 0) > 0 && (
              <p>🚀 {montarFrase(frasesSubida, maiorSubida)}</p>
            )}

            {maiorQueda && Number(maiorQueda.variacao || 0) < 0 && (
              <p>📉 {montarFrase(frasesQueda, maiorQueda)}</p>
            )}

            {reiDoEmCheio && (
              <p>🎯 {montarFrase(frasesEmCheio, reiDoEmCheio)}</p>
            )}

            {maisErros && (
              <p>🙈 {montarFrase(frasesErros, maisErros)}</p>
            )}
          </div>
        </section>

        <section className="bg-slate-900 rounded-2xl p-5 border border-slate-800 mb-6">
          <h2 className="text-xl font-bold mb-4">🐢 Zona do Rebaixamento Moral</h2>

          <div className="space-y-3 text-slate-300 leading-relaxed">
            {lanternas.map((p, index) => (
              <p key={`${p.pos}-${p.nome}`}>
                {index === 0 && "🚨 "}
                {index === 1 && "🐢 "}
                {index === 2 && "📉 "}
                <strong>{p.nome}</strong> está em <strong>{p.pos}º</strong> com{" "}
                <strong>{p.pontos} pts</strong>. {montarFrase(frasesLanterna, p)}
              </p>
            ))}
          </div>
        </section>


        <section className="mb-4">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="🔎 Buscar corneteiro pelo nome..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-emerald-500"
          />
        </section>

        <section className="hidden md:block bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="text-left p-4">Pos</th>
                <th className="text-left p-4">Participante</th>
                <th className="text-left p-4">PTS</th>
                <th className="text-left p-4">🎯 Em Cheio</th>
                <th className="text-left p-4">⚽ Desfechos</th>
                <th className="text-left p-4">❌ Erros</th>
                <th className="text-left p-4">Δ Pts</th>
                <th className="text-left p-4">Δ Pos</th>
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
                  <td className="p-4">{p.em_cheio}</td>
                  <td className="p-4">{p.desfechos}</td>
                  <td className="p-4">{p.erros}</td>
                  <td className="p-4 font-semibold">
                    {formatarDeltaPts(p.delta_pts)}
                  </td>
                  <td className="p-4 font-semibold">
                    {formatarVariacao(p.variacao)}
                  </td>
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
                Δ Pos: {formatarVariacao(p.variacao)}
              </div>

              <div className="mt-1 text-sm font-semibold">
                Δ Pts: {formatarDeltaPts(p.delta_pts)}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-sm text-center">
                <div className="bg-slate-800 rounded-xl p-2">
                  🎯
                  <br />
                  {p.em_cheio}
                </div>

                <div className="bg-slate-800 rounded-xl p-2">
                  ⚽
                  <br />
                  {p.desfechos}
                </div>

                <div className="bg-slate-800 rounded-xl p-2">
                  ❌
                  <br />
                  {p.erros}
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
