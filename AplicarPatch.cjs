/* Achados do Alê — patch do carrossel, sem dependências externas.
   Atua somente em trechos conhecidos. Aborta se o projeto divergir. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const raiz = process.cwd();
const pastaPatch = __dirname;
const permitidos = new Set([
  'app/page.tsx',
  'components/Hero.tsx',
  'components/admin/OfferForm.tsx',
]);
const arquivosNovos = [
  'components/DestaquesCarousel.tsx',
  'supabase/migrations/20261016_permitir_5_destaques_imperdiveis.sql',
];
const hash = (valor) => crypto.createHash('sha256').update(valor).digest('hex');
const normal = (conteudo) => conteudo.replace(/\r\n/g, '\n');
const nl = (texto, usaCrLf) => usaCrLf ? texto.replace(/\n/g, '\r\n') : texto;
const falhar = (mensagem) => { throw new Error(mensagem); };

try {
  if (!fs.existsSync(path.join(raiz, 'package.json'))) falhar('Abra o patch na RAIZ do projeto, ao lado do package.json.');
  const diff = normal(fs.readFileSync(path.join(pastaPatch, 'alteracoes.patch'), 'utf8')).split('\n');
  const patches = new Map();
  let arquivoAtual = null;
  let hunkAtual = null;
  for (const linha of diff) {
    if (linha.startsWith('diff --git a/')) {
      const achado = /^diff --git a\/(.+?) b\/(.+)$/.exec(linha);
      if (!achado || achado[1] !== achado[2] || !permitidos.has(achado[1])) falhar('Caminho de patch inesperado.');
      arquivoAtual = achado[1];
      patches.set(arquivoAtual, []);
      hunkAtual = null;
    } else if (linha.startsWith('@@ ')) {
      if (!arquivoAtual) falhar('Patch inválido: hunk sem arquivo.');
      hunkAtual = { antigo: [], novo: [] };
      patches.get(arquivoAtual).push(hunkAtual);
    } else if (hunkAtual && /^[ +\-]/.test(linha)) {
      const prefixo = linha[0];
      if (prefixo !== '+') hunkAtual.antigo.push(linha.slice(1));
      if (prefixo !== '-') hunkAtual.novo.push(linha.slice(1));
    }
  }
  if (patches.size !== permitidos.size) falhar('Patch incompleto. Nenhum arquivo foi alterado.');

  const escritas = new Map();
  for (const [relativo, hunks] of patches.entries()) {
    const destino = path.join(raiz, relativo);
    if (!fs.existsSync(destino)) falhar(`Arquivo original não encontrado: ${relativo}`);
    const original = fs.readFileSync(destino, 'utf8');
    let atualizado = normal(original);
    for (const [numero, hunk] of hunks.entries()) {
      const antigo = hunk.antigo.join('\n');
      const novo = hunk.novo.join('\n');
      const indice = atualizado.indexOf(antigo);
      if (indice >= 0) {
        // Impede trocar um trecho genérico que coincida em muitos lugares.
        if (atualizado.indexOf(antigo, indice + antigo.length) >= 0) falhar(`Trecho ambíguo em ${relativo}, bloco ${numero+1}.`);
        atualizado = atualizado.slice(0, indice) + novo + atualizado.slice(indice + antigo.length);
      } else if (!atualizado.includes(novo)) {
        falhar(`O arquivo ${relativo} mudou desde a base do patch (bloco ${numero+1}). Para preservar suas alterações, NÃO apliquei nada. Envie o ZIP atual do projeto para mesclar.`);
      }
    }
    const final = nl(atualizado, original.includes('\r\n'));
    if (final !== original) escritas.set(destino, final);
  }
  for (const relativo of arquivosNovos) {
    const fonte = path.join(pastaPatch, 'ARQUIVOS_NOVOS', relativo);
    const destino = path.join(raiz, relativo);
    if (!fs.existsSync(fonte)) falhar(`Arquivo novo não encontrado no patch: ${relativo}`);
    const conteudo = fs.readFileSync(fonte, 'utf8');
    if (fs.existsSync(destino)) {
      const atual = fs.readFileSync(destino, 'utf8');
      if (hash(normal(atual)) !== hash(normal(conteudo))) falhar(`Arquivo ${relativo} já existe com conteúdo diferente. Para sua segurança, nenhuma alteração foi feita.`);
    } else escritas.set(destino, conteudo);
  }

  if (escritas.size === 0) {
    console.log('Este patch já estava aplicado. Nenhuma alteração adicional.');
    process.exit(0);
  }
  const momento = new Date().toISOString().replace(/[:.]/g,'-');
  const backup = path.join(raiz, 'backup-patch-carrossel', momento);
  // Validação concluída: salva todos os backups antes de escrever.
  for (const destino of escritas.keys()) {
    if (!fs.existsSync(destino)) continue;
    const relativo = path.relative(raiz, destino);
    const backupArquivo = path.join(backup, relativo);
    fs.mkdirSync(path.dirname(backupArquivo), { recursive: true });
    fs.copyFileSync(destino, backupArquivo);
  }
  for (const [destino, conteudo] of escritas) {
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, conteudo, 'utf8');
    console.log('ATUALIZADO:', path.relative(raiz, destino));
  }
  console.log('\nPatch aplicado. Cópias de segurança:', backup);
  console.log('IMPORTANTE: execute o arquivo SQL da pasta supabase/migrations no Supabase SQL Editor antes de publicar.');
  console.log('Confira as alterações no GitHub Desktop, faça o commit e Push origin.');
} catch (erro) {
  console.error('\nNÃO APLICADO:', erro.message);
  process.exitCode = 1;
}
