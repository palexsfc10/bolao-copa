export const frasesLanterna = [
  "{nome} está procurando a classificação com GPS desligado.",
  "{nome} prometeu reação, mas a tabela ainda não recebeu o comunicado.",
  "{nome} está estudando os palpites do lado contrário.",
  "{nome} segue firme na briga pelo troféu lanterna.",
  "{nome} já acionou o VAR para revisar essa campanha.",
  "{nome} disse que é estratégia: começar mal para emocionar depois.",
  "{nome} está mais perdido que zagueiro em escanteio.",
  "{nome} virou inspiração para quem acha que ainda dá tempo.",
  "{nome} está treinando forte para sair da zona da corneta.",
  "{nome} pediu calma à torcida, mas a torcida pediu pontos.",
  "{nome} está jogando no modo difícil.",
  "{nome} força",
  "{nome} cuidado",
  "{nome} já virou patrimônio histórico da parte de baixo da tabela.",
  "{nome} está acumulando experiência para as próximas rodadas.",
  "{nome} está mais próximo da lanterna que do líder.",
  "{nome} prometeu emoção e está entregando.",
  "{nome} está transformando cada ponto em uma conquista épica.",
  "{nome} segue firme no projeto de recuperação.",
  "{nome} está participando de um campeonato paralelo.",
  "{nome} mantém viva a esperança matemática.",
  "{nome} está guardando os acertos para o momento certo.",
];

export const frasesSubida = [
  "{nome} veio forte e subiu {variacao} posições.",
  "{nome} ativou o modo foguete e escalou a tabela.",
  "{nome} acordou para o bolão e deixou gente para trás.",
  "{nome} teve rodada de respeito e ganhou moral.",
  "{nome} saiu do modo turista e entrou na disputa.",
  "{nome} subiu mais rápido que promoção relâmpago.",
  "{nome} encontrou o caminho da vitória.",
  "{nome} engatou a quinta marcha nesta rodada.",
  "{nome} fez uma escalada digna de montanhista profissional.",
  "{nome} deixou a turma para trás.",
  "{nome} resolveu participar do bolão de verdade.",
  "{nome} acordou para a competição.",
  "{nome} está acumulando ultrapassagens na tabela.",
  "{nome} ganhou posições e confiança.",
  "{nome} transformou palpites em combustível.",
];

export const frasesQueda = [
  "{nome} escorregou na tabela e sentiu a pressão.",
  "{nome} perdeu {variacao} posições e já ouve a corneta.",
  "{nome} teve rodada difícil e precisa reagir.",
  "{nome} caiu mais que internet em dia de jogo.",
  "{nome} vai precisar de café forte para analisar essa rodada.",
  "{nome} esqueceu o freio de mão na descida.",
  "{nome} viveu uma rodada daquelas para apagar da memória.",
  "{nome} teve mais queda que ação em crise.",
  "{nome} viu a tabela pelo retrovisor pela primeira vez.",
  "{nome} perdeu altitude na classificação.",
  "{nome} escorregou e levou alguns concorrentes junto.",
  "{nome} teve um encontro inesperado com a realidade.",
  "{nome} sofreu uma correção de rota.",
  "{nome} caiu na tabela mas ainda respira.",
  "{nome} está colecionando motivos para reagir.",
];

export const frasesLider = [
  "{nome} segue mandando no bolão com {pontos} pontos.",
  "{nome} está no topo e já começa a olhar a galera pelo retrovisor.",
  "{nome} assumiu a liderança com autoridade.",
  "{nome} segue o líder",
  "{nome} está jogando o bolão em outro ritmo.",
  "{nome} está deixando a concorrência preocupada.",
  "{nome} está liderando e já começou a cobrar pedágio para quem quer passar.",
  "{nome} está no topo e fingindo humildade.",
  "{nome} abriu vantagem e já sonha com o troféu.",
  "{nome} está mais confortável na liderança que técnico após vitória.",
  "{nome} assumiu a ponta e não pretende devolver.",
  "{nome} está liderando com a confiança de quem viu o resultado antes.",
  "{nome} está fazendo o bolão parecer fácil.",
  "{nome} chegou ao topo e agora só aceita visitas agendadas.",
  "{nome} está deixando os perseguidores sem resposta.",
  "{nome} virou o inimigo público número 1 dos concorrentes.",
];

export const frasesEmCheio = [
  "{nome} está com a mira calibrada nos placares exatos.",
  "{nome} virou especialista em cravar resultado na mosca.",
  "{nome} está acertando placar como se tivesse roteiro do jogo.",
  "{nome} está com precisão de artilheiro.",
  "{nome} está enxergando os placares no futuro.",
  "{nome} parece ter acesso aos bastidores da FIFA.",
  "{nome} está acertando resultado com precisão cirúrgica.",
  "{nome} transformou placar exato em hábito.",
  "{nome} está jogando xadrez enquanto os outros jogam dama.",
  "{nome} está em sintonia com o futebol mundial.",
  "{nome} virou especialista em cravar resultado.",
  "{nome} parece conhecer o roteiro dos jogos.",
  "{nome} está distribuindo acertos sem dó.",
  "{nome} está calibrado para o impossível.",
];

export const frasesErros = [
  "{nome} precisa revisar os palpites antes que vire caso de estudo.",
  "{nome} está colecionando erros como figurinha repetida.",
  "{nome} teve uma rodada para esquecer.",
  "{nome} está transformando erro em experiência.",
  "{nome} está testando teorias alternativas sobre futebol.",
  "{nome} teve uma relação complicada com os resultados da rodada.",
  "{nome} está confundindo palpite com aposta emocional.",
  "{nome} resolveu inovar e os resultados apareceram.",
  "{nome} está aprendendo com os próprios erros.",
  "{nome} está colecionando exemplos do que não fazer.",
  "{nome} apostou na criatividade e pagou o preço.",
  "{nome} está acumulando material para um curso de recuperação.",
  "{nome} está enfrentando dificuldades técnicas temporárias.",
  "{nome} está desenvolvendo resiliência competitiva.",
];

export function montarFrase(frases, dados = {}) {
  if (!frases.length) return "";

  const index =
    Math.abs(
      String(dados.nome || "")
        .split("")
        .reduce((acc, letra) => acc + letra.charCodeAt(0), 0)
    ) % frases.length;

  return frases[index]
    .replaceAll("{nome}", dados.nome || "")
    .replaceAll("{pontos}", dados.pontos || 0)
    .replaceAll("{pos}", dados.pos || 0)
    .replaceAll("{variacao}", Math.abs(Number(dados.variacao || 0)));
}
