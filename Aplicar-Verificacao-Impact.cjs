// Patch cirurgico para o Next.js: remove tags Impact antigas e publica verificacao em URL.
// Executar na raiz do repositorio: node Aplicar-Verificacao-Impact.cjs
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const ROOT = process.cwd();
const TOKEN = 'Impact-Site-Verification:4ede9b56-c737-4654-bc16-fe2081d0f782';
const URL_PATH = '/' + TOKEN;
const START = '// BEGIN ACHADOS_DO_ALE_IMPACT_URL_VERIFICATION';
const END = '// END ACHADOS_DO_ALE_IMPACT_URL_VERIFICATION';

function fail(message) { throw new Error(message); }
function file(p) { return path.join(ROOT, p); }
function exists(p) { return fs.existsSync(file(p)); }
function read(p) { return fs.readFileSync(file(p), 'utf8'); }

if (!exists('package.json')) fail('Abra a pasta raiz do projeto (onde existe package.json) antes de executar o patch.');
const layoutPath = exists('app/layout.tsx') ? 'app/layout.tsx' : exists('src/app/layout.tsx') ? 'src/app/layout.tsx' : null;
if (!layoutPath) fail('Nao encontrei app/layout.tsx nem src/app/layout.tsx.');
const configPath = ['next.config.mjs', 'next.config.js'].find(exists);
if (!configPath) fail('Nao encontrei next.config.mjs nem next.config.js.');

const originalLayout = read(layoutPath);
let layout = originalLayout;
// Remove SOMENTE a meta tag solicitada anteriormente (nao altera outras metas).
layout = layout.replace(/<meta\b(?=[^>]*\bname\s*=\s*(["'])impact-site-verification\1)[^>]*\/?>\s*/gi, '');
// Remove SOMENTE o script da Impact anterior, na forma JSX criada pelo patch precedente.
layout = layout.replace(/<script\b(?=[^<]{0,400}dangerouslySetInnerHTML)[^<]*?\/>\s*/g, (tag) =>
  tag.includes('utt.impactcdn.com/P-A7982813-36c6-4d24-8deb-feba17dc957b1.js') ? '' : tag
);
// Remove forma HTML inline da mesma tag, quando for o caso.
layout = layout.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>\s*/g, (tag) =>
  tag.includes('utt.impactcdn.com/P-A7982813-36c6-4d24-8deb-feba17dc957b1.js') ? '' : tag
);
// Remove a forma script src (se existir).
layout = layout.replace(/<script\b[^>]*\bsrc\s*=\s*(["'])https:\/\/utt\.impactcdn\.com\/P-A7982813-36c6-4d24-8deb-feba17dc957b1\.js\1[^>]*\/?>\s*/g, '');
if (/impact-site-verification|utt\.impactcdn\.com\/P-A7982813-36c6-4d24-8deb-feba17dc957b1|impactStat\(/i.test(layout)) {
  fail('A integracao Impact foi escrita em outro formato no layout. Para evitar apagar scripts de outras empresas, nenhuma alteracao foi aplicada. Envie app/layout.tsx para revisao.');
}

let config = read(configPath);
// Idempotente: se patch aplicado, substitui somente o trecho que ele administra.
const oldBlock = new RegExp('(?:\\r?\\n)?' + START.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '[\\s\\S]*?' + END.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '(?:\\r?\\n)?', 'g');
config = config.replace(oldBlock, '\n');
if (!config.includes('export default nextConfig;')) {
  fail('O next.config nao usa "export default nextConfig;". Para preservar configuracoes, nenhuma alteracao foi aplicada. Envie o arquivo para revisao.');
}
const impactConfig = `
${START}
// A URL publica contem ':'; o caractere precisa ser escapado no matcher do Next.js.
const impactVerificationRewrite = {
  source: "/Impact-Site-Verification\\\\:4ede9b56-c737-4654-bc16-fe2081d0f782",
  destination: "/impact-site-verification.html",
};
const rewritesAnterioresImpact = nextConfig.rewrites?.bind(nextConfig);
nextConfig.rewrites = async () => {
  const atuais = rewritesAnterioresImpact ? await rewritesAnterioresImpact() : [];
  if (Array.isArray(atuais)) return [impactVerificationRewrite, ...atuais];
  return {
    beforeFiles: [impactVerificationRewrite, ...(atuais.beforeFiles || [])],
    afterFiles: atuais.afterFiles || [],
    fallback: atuais.fallback || [],
  };
};
${END}
`;
config = config.replace('export default nextConfig;', `${impactConfig}\nexport default nextConfig;`);

const htmlPath = 'public/impact-site-verification.html';
const html = `<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n<meta name="robots" content="noindex,nofollow">\n<title>Verificacao de propriedade — Achados do Ale</title>\n</head>\n<body>${TOKEN}</body>\n</html>\n`;
const originals = [[layoutPath, originalLayout], [configPath, read(configPath)]];
if (exists(htmlPath)) originals.push([htmlPath, read(htmlPath)]);
// Backups fora da pasta Git, para nao poluir o GitHub Desktop.
const backupFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'achados-impact-backup-'));
for (const [p, text] of originals) {
  fs.writeFileSync(path.join(backupFolder, p.replaceAll(/[\\/]/g, '__')), text, 'utf8');
}
fs.writeFileSync(file(layoutPath), layout, 'utf8');
fs.writeFileSync(file(configPath), config, 'utf8');
fs.mkdirSync(path.dirname(file(htmlPath)), {recursive: true});
fs.writeFileSync(file(htmlPath), html, 'utf8');

console.log('\nVerificacao Impact aplicada com sucesso!');
console.log('Endereco esperado: https://achadosdoale.com' + URL_PATH);
console.log('Arquivos atualizados: ' + layoutPath + ', ' + configPath + ', ' + htmlPath);
console.log('Backup salvo fora do Git: ' + backupFolder);
console.log('Depois do Push e deploy, abra o endereco e verifique o codigo de confirmacao.');
