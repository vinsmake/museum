// Busca candidatos en Wikimedia Commons para cada ser y guarda los resultados (solo licencias libres).
// Uso: node buscar.mjs consultas.json salida.json
import { readFileSync, writeFileSync } from 'node:fs';

const [, , entrada, salida] = process.argv;
const consultas = JSON.parse(readFileSync(entrada, 'utf8'));
const UA = { 'User-Agent': 'MuseoMitologico/0.1 (proyecto educativo local; descarga de obras de dominio publico)' };
const LIBRE = /^(public domain|pd|cc0|cc[- ]by(-sa)?[- ]?\d|cc[- ]by(-sa)?$)/i;
const limpiar = (s = '') => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const resultado = {};
for (const [slug, lista] of Object.entries(consultas)) {
  resultado[slug] = [];
  for (const q of [].concat(lista)) {
    const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
      action: 'query', format: 'json', generator: 'search', gsrnamespace: '6', gsrlimit: '6', gsrsearch: `${q} filetype:bitmap`,
      prop: 'imageinfo', iiprop: 'extmetadata|size|mime',
      iiextmetadatafilter: 'LicenseShortName|Artist|ImageDescription|ObjectName|DateTimeOriginal|Credit',
    });
    let j;
    for (let intento = 0; intento < 6 && !j; intento++) {
      const r = await fetch(url, { headers: UA });
      const texto = await r.text();
      try {
        j = JSON.parse(texto);
      } catch {
        const espera = 5000 * 2 ** intento;
        console.error(`  límite de Commons (${slug}), espero ${espera / 1000}s`);
        await new Promise((res) => setTimeout(res, espera));
      }
    }
    if (!j) throw new Error(`Commons no responde para ${slug}`);
    const paginas = Object.values(j.query?.pages ?? {}).sort((a, b) => a.index - b.index);
    for (const p of paginas) {
      const ii = p.imageinfo?.[0];
      const md = ii?.extmetadata ?? {};
      const lic = limpiar(md.LicenseShortName?.value);
      if (!LIBRE.test(lic) || !/jpeg|png|tiff/.test(ii.mime)) continue;
      if (resultado[slug].some((x) => x.titulo === p.title)) continue;
      resultado[slug].push({
        titulo: p.title, lic, ancho: ii.width, alto: ii.height,
        autor: limpiar(md.Artist?.value).slice(0, 80),
        desc: limpiar(md.ImageDescription?.value || md.ObjectName?.value).slice(0, 140),
        fecha: limpiar(md.DateTimeOriginal?.value).slice(0, 40),
      });
    }
    await new Promise((res) => setTimeout(res, 1500));
  }
}
writeFileSync(salida, JSON.stringify(resultado, null, 1));
for (const [slug, c] of Object.entries(resultado)) {
  console.log(`\n## ${slug}`);
  c.slice(0, 6).forEach((x, i) => console.log(`${i}. ${x.titulo.replace('File:', '').slice(0, 95)} | ${x.lic} | ${x.ancho}x${x.alto} | ${x.desc.slice(0, 90)}`));
}
