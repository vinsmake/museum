// Pedestal clásico (plinto, dado y cornisa) con una placa grabada: nombre original y nombre en español.
import * as THREE from 'three';
import type { Materiales } from './materiales';
import { caja, grupo, malla } from './primitivas';

export const ALTO_PEDESTAL = 0.55;

function placa(texto: string, original: string | undefined, ancho: number, alto: number, fondo: string): THREE.Mesh | null {
  if (typeof document === 'undefined') return null;
  const escala = 512;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(escala * (ancho / alto));
  canvas.height = escala;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(60, 50, 36, 0.55)';
  ctx.lineWidth = 10;
  ctx.strokeRect(22, 22, canvas.width - 44, canvas.height - 44);

  const ajustar = (t: string, fuente: (px: number) => string, px: number, max: number) => {
    let tam = px;
    ctx.font = fuente(tam);
    while (ctx.measureText(t).width > max && tam > 20) ctx.font = fuente((tam -= 4));
  };
  const max = canvas.width - 120;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#2a2318';
  if (original) {
    ajustar(original, (px) => `italic 500 ${px}px "GFS Didot", "Palatino Linotype", Georgia, serif`, 150, max);
    ctx.fillText(original, canvas.width / 2, canvas.height * 0.38);
  }
  const nombre = texto.toUpperCase();
  ctx.letterSpacing = '12px';
  ajustar(nombre, (px) => `600 ${px}px "Cinzel", "Trajan Pro", Georgia, serif`, 110, max);
  ctx.fillText(nombre, canvas.width / 2, canvas.height * (original ? 0.72 : 0.52));

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75 });
  mat.userData.unico = true;
  return new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), mat);
}

export function pedestal(m: Materiales, ancho: number, fondo: number, nombre: string, nombreOriginal?: string): THREE.Group {
  const P = m.pedestal;
  const g = grupo([
    malla(caja(ancho + 0.1, 0.1, fondo + 0.1), P, [0, 0.05, 0]),
    malla(caja(ancho, 0.37, fondo), P, [0, 0.285, 0]),
    malla(caja(ancho + 0.08, 0.08, fondo + 0.08), P, [0, 0.51, 0]),
  ]);
  const anchoPlaca = Math.min(ancho * 0.86, 1.3);
  // La placa es algo más oscura que el pedestal para que el texto grabado se lea con luz fuerte.
  const fondoPlaca = `#${P.color.clone().multiplyScalar(0.85).getHexString()}`;
  const p = placa(nombre, nombreOriginal, anchoPlaca, 0.26, fondoPlaca);
  if (p) {
    p.position.set(0, 0.285, fondo / 2 + 0.002);
    g.add(p);
  }
  return g;
}
