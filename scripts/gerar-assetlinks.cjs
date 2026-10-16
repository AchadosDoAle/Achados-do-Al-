/**
 * Uso: node scripts/gerar-assetlinks.cjs "AA:BB:..." (32 bytes SHA-256)
 * Use a SHA-256 da CHAVE DE ASSINATURA DO APP no Google Play Console,
 * NÃO a SHA da chave de upload.
 */
const fs = require('node:fs');
const path = require('node:path');
const fingerprint = String(process.argv[2] || '').trim().toUpperCase();
if (!/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(fingerprint)) {
  console.error('SHA-256 inválido. Copie os 32 pares hexadecimais separados por : da chave de ASSINATURA DO APP na Play Console.');
  process.exit(1);
}
const data = [{
  relation: ['delegate_permission/common.handle_all_urls'],
  target: {
    namespace: 'android_app',
    package_name: 'com.achadodoale.app',
    sha256_cert_fingerprints: [fingerprint],
  },
}];
const dest = path.resolve(__dirname, '..', 'public', '.well-known', 'assetlinks.json');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Criado: ' + dest);
console.log('Após publicar, verifique https://achadosdoale.com/.well-known/assetlinks.json');
