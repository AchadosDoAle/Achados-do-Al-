/* Achados do Ale — corrige TypeScript lendo backups do patch antigo.
   Execute na raiz do site: node CorrigirBuild.cjs
   Nenhuma dependencia externa necessaria. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const raiz = process.cwd();
const tsconfig = path.join(raiz, 'tsconfig.json');
const arquivoGitignore = path.join(raiz, '.gitignore');
const aplicadorAnterior = path.join(raiz, 'AplicarPatch.cjs');
const pastaBackupAntiga = path.join(raiz, 'backup-patch-carrossel');
const carimbo = new Date().toISOString().replace(/[:.]/g, '-');
const foraDoProjeto = path.join(path.dirname(raiz), `${path.basename(raiz)}-backups-carrossel`);

function texto(arquivo) { return fs.readFileSync(arquivo, 'utf8'); }
function criarCopia(arquivo, destino) {
  if (!fs.existsSync(arquivo)) return;
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.copyFileSync(arquivo, destino);
}
try {
  if (!fs.existsSync(path.join(raiz, 'package.json')) || !fs.existsSync(tsconfig)) {
    throw new Error('Abra este aplicador na pasta PRINCIPAL do site, onde estao package.json e tsconfig.json.');
  }
  // Modificacao pontual da configuracao TypeScript.
  const originalConfig = texto(tsconfig);
  let config;
  try { config = JSON.parse(originalConfig); }
  catch { throw new Error('O tsconfig.json tem comentarios ou formato nao JSON. Envie esse arquivo para ajuste manual.'); }
  if (config.exclude !== undefined && !Array.isArray(config.exclude)) {
    throw new Error('tsconfig.json: exclude nao e uma lista. Nenhuma alteracao foi realizada.');
  }
  const exclusoes = config.exclude || [];
  if (!exclusoes.includes('backup-patch-carrossel') && !exclusoes.includes('backup-patch-carrossel/**/*')) {
    exclusoes.push('backup-patch-carrossel/**/*');
  }
  config.exclude = exclusoes;
  const novoConfig = JSON.stringify(config, null, 2) + '\n';

  // Impede que backups acidentalmente sejam adicionados ao Git.
  const originalGitignore = fs.existsSync(arquivoGitignore) ? texto(arquivoGitignore) : '';
  const linhaIgnore = '/backup-patch-carrossel/';
  const novoGitignore = originalGitignore.split(/\r?\n/).some((linha) => linha.trim() === linhaIgnore || linha.trim() === 'backup-patch-carrossel/')
    ? originalGitignore
    : originalGitignore.replace(/\s*$/, '\n') + '\n# Copias antigas do patch (nao publicar)\n' + linhaIgnore + '\n';

  // Se o aplicador anterior ainda estiver no projeto, impedimos que ele recrie
  // backups dentro da raiz nas proximas aplicacoes.
  let originalAplicador = null;
  let novoAplicador = null;
  if (fs.existsSync(aplicadorAnterior)) {
    originalAplicador = texto(aplicadorAnterior);
    const origem = "path.join(raiz, 'backup-patch-carrossel', momento)";
    const destino = "path.join(path.dirname(raiz), path.basename(raiz) + '-backups-carrossel', momento)";
    novoAplicador = originalAplicador.includes(origem)
      ? originalAplicador.replace(origem, destino)
      : originalAplicador;
  }

  const diretorioProtecao = path.join(foraDoProjeto, `correcao-build-${carimbo}`);
  // Copias de seguranca ficam FORA do projeto e nao entram na compilacao da Vercel.
  criarCopia(tsconfig, path.join(diretorioProtecao, 'tsconfig.json'));
  criarCopia(arquivoGitignore, path.join(diretorioProtecao, '.gitignore'));
  criarCopia(aplicadorAnterior, path.join(diretorioProtecao, 'AplicarPatch.cjs'));

  // Move o backup que causou o erro para FORA da pasta do site.
  // Mantem todos os arquivos originais em seguranca, sem apaga-los.
  if (fs.existsSync(pastaBackupAntiga)) {
    if (!fs.statSync(pastaBackupAntiga).isDirectory()) {
      throw new Error('backup-patch-carrossel existe, mas nao e uma pasta. Nenhuma alteracao executada.');
    }
    const para = path.join(foraDoProjeto, `backup-patch-carrossel-movido-${carimbo}`);
    fs.mkdirSync(foraDoProjeto, { recursive: true });
    fs.renameSync(pastaBackupAntiga, para);
    console.log('BACKUP MOVIDO PARA FORA DO SITE:', para);
    console.log('No GitHub Desktop, inclua no commit a remocao dos arquivos de backup antigos.');
  }
  if (novoConfig !== originalConfig) {
    fs.writeFileSync(tsconfig, novoConfig, 'utf8');
    console.log('AJUSTADO: tsconfig.json');
  } else console.log('OK: tsconfig.json ja configurado');
  if (novoGitignore !== originalGitignore) {
    fs.writeFileSync(arquivoGitignore, novoGitignore, 'utf8');
    console.log('AJUSTADO: .gitignore');
  } else console.log('OK: .gitignore ja configurado');
  if (originalAplicador !== null && novoAplicador !== originalAplicador) {
    fs.writeFileSync(aplicadorAnterior, novoAplicador, 'utf8');
    console.log('AJUSTADO: AplicarPatch.cjs (backups futuros fora do projeto)');
  }
  console.log('\nCORRECAO FINALIZADA. Revise alteracoes e DELECOES no GitHub Desktop, faca Commit e Push origin.');
  console.log('Os backups foram preservados fora da pasta do site.');
} catch (erro) {
  console.error('ERRO: ' + erro.message);
  process.exitCode = 1;
}
