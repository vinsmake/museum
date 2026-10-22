// Materiales de las estatuas. Se crean una vez por color de piedra y se comparten.
import * as THREE from 'three';

export interface Materiales {
  piedra: THREE.MeshStandardMaterial; // mármol del cuerpo
  piedraOscura: THREE.MeshStandardMaterial; // detalles en sombra: ojos, grietas, primordiales oscuros
  bronce: THREE.MeshStandardMaterial; // armas y herramientas
  oro: THREE.MeshStandardMaterial; // coronas, manzanas, rayo
  agua: THREE.MeshStandardMaterial; // ríos y olas
  fuego: THREE.MeshStandardMaterial; // llamas y astros (emisivo)
  pedestal: THREE.MeshStandardMaterial;
}

let texturaMarmol: THREE.Texture | null | undefined;

/** Vetas de mármol dibujadas en un canvas (solo en el navegador). */
function marmol(): THREE.Texture | null {
  if (texturaMarmol !== undefined) return texturaMarmol;
  if (typeof document === 'undefined') return (texturaMarmol = null);
  const lado = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = lado;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, lado, lado);
  let semilla = 7;
  const rnd = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 26; i++) {
    let x = rnd() * lado;
    let y = rnd() * lado;
    let ang = rnd() * Math.PI * 2;
    ctx.strokeStyle = `rgba(110, 104, 96, ${0.05 + rnd() * 0.12})`;
    ctx.lineWidth = 0.5 + rnd() * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let p = 0; p < 60; p++) {
      ang += (rnd() - 0.5) * 0.6;
      x += Math.cos(ang) * 9;
      y += Math.sin(ang) * 9;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return (texturaMarmol = tex);
}

const porColor = new Map<string, Materiales>();

export function materiales(colorPiedra = '#e9e4da'): Materiales {
  const existente = porColor.get(colorPiedra);
  if (existente) return existente;
  const mapa = marmol();
  const piedra = new THREE.MeshStandardMaterial({ color: colorPiedra, map: mapa, roughness: 0.48, metalness: 0 });
  const oscura = new THREE.Color(colorPiedra).multiplyScalar(0.45);
  const m: Materiales = {
    piedra,
    piedraOscura: new THREE.MeshStandardMaterial({ color: oscura, map: mapa, roughness: 0.6 }),
    bronce: new THREE.MeshStandardMaterial({ color: '#8a6a3c', roughness: 0.38, metalness: 0.85 }),
    oro: new THREE.MeshStandardMaterial({ color: '#d8b04a', roughness: 0.25, metalness: 0.95 }),
    agua: new THREE.MeshStandardMaterial({ color: '#7fb3c9', roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.75 }),
    fuego: new THREE.MeshStandardMaterial({ color: '#ffcf70', emissive: '#ff9a2e', emissiveIntensity: 1.4, roughness: 0.4 }),
    pedestal: new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorPiedra).multiplyScalar(0.82),
      map: mapa,
      roughness: 0.7,
    }),
  };
  porColor.set(colorPiedra, m);
  return m;
}
