// Descarga las obras elegidas (miniatura de 1280 px) y escribe la lista `imagenes` en cada .md.
// Uso: node descargar.mjs <carpeta-mitologia>   (p. ej. /app/src/content/mitologias/griega)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import seleccion from './seleccion.mjs';

const base = process.argv[2];
if (process.env.ESPERA_INICIAL) await new Promise((r) => setTimeout(r, Number(process.env.ESPERA_INICIAL) * 1000));
const UA = { 'User-Agent': 'MuseoMitologico/0.1 (proyecto educativo local; descarga de obras de dominio publico)' };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const limpiar = (s = '') => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const resultados = Object.assign(
  {},
  ...['resultados-1.json', 'resultados-2.json', 'resultados-3.json'].map((f) => JSON.parse(readFileSync(new URL(f, import.meta.url)))),
);

async function api(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', action: 'query', ...params });
  for (let i = 0; i < 6; i++) {
    const r = await fetch(url, { headers: UA });
    const t = await r.text();
    try { return JSON.parse(t); } catch { await espera(5000 * 2 ** i); }
  }
  throw new Error('Commons no responde');
}

// 1. Resolver títulos y agrupar archivos únicos
const archivos = new Map(); // nombre local -> { titulo, usos: [slug] , meta }
for (const [slug, lista] of Object.entries(seleccion)) {
  lista.forEach((img, n) => {
    let titulo = img.t;
    if (titulo.startsWith('R:')) {
      const [, s, i] = titulo.split(':');
      titulo = resultados[s]?.[Number(i)]?.titulo;
      if (!titulo) throw new Error(`${slug}: no existe ${img.t}`);
    }
    titulo = titulo.startsWith('File:') ? titulo : `File:${titulo}`;
    const local = img.f ?? `${slug}-${n + 1}`;
    if (!archivos.has(local)) archivos.set(local, { titulo, img, usos: [] });
    archivos.get(local).usos.push(slug);
  });
}

// 2. Pedir URL reducida, licencia y autor en lotes de 20
const lista = [...archivos.values()];
for (let i = 0; i < lista.length; i += 20) {
  const lote = lista.slice(i, i + 20);
  const j = await api({
    titles: lote.map((a) => a.titulo).join('|'), prop: 'imageinfo', iiprop: 'url|extmetadata|mime',
    iiurlwidth: '1280', iiextmetadatafilter: 'LicenseShortName|Artist',
  });
  const normal = Object.fromEntries((j.query.normalized ?? []).map((x) => [x.from, x.to]));
  const paginas = Object.values(j.query.pages);
  for (const a of lote) {
    const titulo = normal[a.titulo] ?? a.titulo;
    const p = paginas.find((x) => x.title === titulo);
    const ii = p?.imageinfo?.[0];
    if (!ii) throw new Error(`No encontrado en Commons: ${a.titulo}`);
    a.url = ii.thumburl ?? ii.url;
    a.fuente = ii.descriptionurl;
    a.licencia = limpiar(ii.extmetadata?.LicenseShortName?.value);
    a.artista = limpiar(ii.extmetadata?.Artist?.value).slice(0, 120);
  }
  await espera(1500);
}

// 3. Descargar
const dirImg = `${base}/imagenes`;
mkdirSync(dirImg, { recursive: true });
let bytes = 0;
for (const [local, a] of archivos) {
  const ext = /\.png($|\?)/i.test(a.url) ? 'png' : 'jpg';
  a.archivo = `${local}.${ext}`;
  const destino = `${dirImg}/${a.archivo}`;
  if (!existsSync(destino)) {
    let ok = false;
    for (let i = 0; i < 5 && !ok; i++) {
      const r = await fetch(a.url, { headers: UA });
      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        writeFileSync(destino, buf);
        ok = true;
      } else {
        // Respetar Retry-After de Wikimedia (429)
        const s = Number(r.headers.get('retry-after')) || 10 * 2 ** i;
        console.log(`  ${r.status} en ${a.archivo}: espero ${s + 5}s`);
        await espera((s + 5) * 1000);
      }
    }
    if (!ok) throw new Error(`No se pudo descargar ${a.url}`);
    await espera(2500);
  }
  bytes += readFileSync(destino).length;
}

// 4. Escribir `imagenes` en cada .md
const libre = (l) => /^(public domain|pd|cc0)/i.test(l);
const q = (s) => JSON.stringify(s);
const porSlug = {};
for (const a of archivos.values()) for (const s of a.usos) (porSlug[s] ??= []).push(a);
for (const [slug, imgs] of Object.entries(porSlug)) {
  const ruta = `${base}/seres/${slug}.md`;
  const texto = readFileSync(ruta, 'utf8');
  if (/^imagenes:/m.test(texto)) continue;
  const lineas = ['imagenes:'];
  for (const a of imgs) {
    const { obra, autor, fecha, ubic } = a.img;
    lineas.push(`  - archivo: ${q(`../imagenes/${a.archivo}`)}`, `    obra: ${q(obra)}`);
    if (autor) lineas.push(`    autor: ${q(autor)}`);
    if (fecha) lineas.push(`    fecha: ${q(fecha)}`);
    if (ubic) lineas.push(`    ubicacion: ${q(ubic)}`);
    if (!libre(a.licencia) && a.artista) lineas.push(`    fotografo: ${q(a.artista)}`);
    lineas.push(`    licencia: ${q(libre(a.licencia) && /^p/i.test(a.licencia) ? 'Dominio público' : a.licencia)}`, `    fuente: ${q(a.fuente)}`);
  }
  const fin = texto.indexOf('\n---', 4);
  writeFileSync(ruta, texto.slice(0, fin) + '\n' + lineas.join('\n') + texto.slice(fin));
}

console.log(`${archivos.size} archivos, ${Object.keys(porSlug).length} seres con imagen, ${(bytes / 1048576).toFixed(1)} MB`);
const licencias = {};
for (const a of archivos.values()) licencias[a.licencia] = (licencias[a.licencia] ?? 0) + 1;
console.log('licencias:', licencias);
writeFileSync(new URL('descargadas.json', import.meta.url), JSON.stringify([...archivos].map(([k, a]) => ({ local: a.archivo, titulo: a.titulo, fuente: a.fuente, licencia: a.licencia, artista: a.artista, usos: a.usos })), null, 1));
