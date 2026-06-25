'use client';

import { useEffect, useRef } from 'react';
import { AP_BOUNDS, GRID_ROWS, GRID_COLS } from '@/lib/geo';
import { getColorForValue } from '@/lib/colors';
import AP_OUTLINE from '@/lib/apOutline';

interface WeatherMapProps {
  data: number[][] | null;
  variable: string;
  title?: string;
  height?: number;
}

const PAD = 50;
const MAP_ASPECT = (AP_BOUNDS.lon_max - AP_BOUNDS.lon_min) / (AP_BOUNDS.lat_max - AP_BOUNDS.lat_min);

interface Viewport { ox: number; oy: number; w: number; h: number; }

function computeViewport(cw: number, ch: number): Viewport {
  const canvasRatio = cw / ch;
  if (canvasRatio > MAP_ASPECT) {
    const vw = Math.round(ch * MAP_ASPECT);
    return { ox: Math.round((cw - vw) / 2), oy: 0, w: vw, h: ch };
  }
  const vh = Math.round(cw / MAP_ASPECT);
  return { ox: 0, oy: Math.round((ch - vh) / 2), w: cw, h: vh };
}

interface Particle {
  x: number; y: number;
  speed: number; opacity: number; length: number;
  lifetime: number;
}

const DISTRICTS: { name: string; lat: number; lon: number }[] = [
  { name: "Srikakulam", lat: 18.30, lon: 83.90 },
  { name: "Vizianagaram", lat: 18.12, lon: 83.42 },
  { name: "Visakhapatnam", lat: 17.73, lon: 83.30 },
  { name: "East Godavari", lat: 17.00, lon: 82.12 },
  { name: "West Godavari", lat: 16.70, lon: 81.50 },
  { name: "Krishna", lat: 16.20, lon: 80.80 },
  { name: "Guntur", lat: 16.30, lon: 80.45 },
  { name: "Prakasam", lat: 15.50, lon: 80.00 },
  { name: "Nellore", lat: 14.55, lon: 79.95 },
  { name: "Kurnool", lat: 15.80, lon: 78.05 },
  { name: "Anantapur", lat: 14.70, lon: 77.60 },
  { name: "YSR Kadapa", lat: 14.45, lon: 78.80 },
  { name: "Chittoor", lat: 13.20, lon: 79.10 },
];

const CITIES: { name: string; lat: number; lon: number }[] = [
  { name: "Visakhapatnam", lat: 17.69, lon: 83.22 },
  { name: "Vijayawada", lat: 16.51, lon: 80.62 },
  { name: "Guntur", lat: 16.31, lon: 80.44 },
  { name: "Nellore", lat: 14.43, lon: 79.97 },
  { name: "Kurnool", lat: 15.83, lon: 78.04 },
  { name: "Rajahmundry", lat: 16.98, lon: 81.78 },
  { name: "Tirupati", lat: 13.63, lon: 79.42 },
  { name: "Kakinada", lat: 16.94, lon: 82.22 },
  { name: "Anantapur", lat: 14.68, lon: 77.60 },
  { name: "Eluru", lat: 16.71, lon: 81.10 },
];

function toCanvas(lat: number, lon: number, vp: Viewport): [number, number] {
  const mw = vp.w - PAD * 2;
  const mh = vp.h - PAD * 2;
  const x = vp.ox + PAD + ((lon - AP_BOUNDS.lon_min) / (AP_BOUNDS.lon_max - AP_BOUNDS.lon_min)) * mw;
  const y = vp.oy + PAD + ((AP_BOUNDS.lat_max - lat) / (AP_BOUNDS.lat_max - AP_BOUNDS.lat_min)) * mh;
  return [x, y];
}

function drawOutline(ctx: CanvasRenderingContext2D, points: [number, number][], vp: Viewport) {
  ctx.beginPath();
  points.forEach(([lat, lon], i) => {
    const [x, y] = toCanvas(lat, lon, vp);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
}

function pointInPolygon(lat: number, lon: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lat1, lon1] = polygon[i];
    const [lat2, lon2] = polygon[j];
    if (lon1 > lon !== lon2 > lon && lat < ((lat2 - lat1) * (lon - lon1) / (lon2 - lon1)) + lat1) {
      inside = !inside;
    }
  }
  return inside;
}

function bilinearSample(data: number[][], r: number, c: number): number {
  const r0 = Math.floor(r); const r1 = Math.min(r0 + 1, GRID_ROWS - 1);
  const c0 = Math.floor(c); const c1 = Math.min(c0 + 1, GRID_COLS - 1);
  const fr = r - r0; const fc = c - c0;
  const v00 = data[r0][c0]; const v01 = data[r0][c1];
  const v10 = data[r1][c0]; const v11 = data[r1][c1];
  const top = v00 + (v01 - v00) * fc;
  const bot = v10 + (v11 - v10) * fc;
  return top + (bot - top) * fr;
}

function renderStatic(cache: HTMLCanvasElement, w: number, h: number, vp: Viewport) {
  const [minLon, maxLon] = [AP_BOUNDS.lon_min, AP_BOUNDS.lon_max];
  const [minLat, maxLat] = [AP_BOUNDS.lat_min, AP_BOUNDS.lat_max];

  cache.width = w;
  cache.height = h;
  const ctx = cache.getContext('2d')!;

  const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
  grad.addColorStop(0, '#0f2940');
  grad.addColorStop(0.5, '#0c1929');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.strokeStyle = 'rgba(71,85,105,0.08)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 6]);
  for (let lat = Math.ceil(minLat); lat <= Math.floor(maxLat); lat += 1) {
    const [sx, sy] = toCanvas(lat, AP_BOUNDS.lon_min, vp);
    const [ex, ey] = toCanvas(lat, AP_BOUNDS.lon_max, vp);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
  }
  for (let lon = Math.ceil(minLon); lon <= Math.floor(maxLon); lon += 1) {
    const [sx, sy] = toCanvas(AP_BOUNDS.lat_min, lon, vp);
    const [ex, ey] = toCanvas(AP_BOUNDS.lat_max, lon, vp);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();

  ctx.save();
  ctx.font = '9px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(100,116,139,0.2)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let lat = Math.ceil(minLat); lat <= Math.floor(maxLat); lat += 1) {
    const [x, y] = toCanvas(lat, AP_BOUNDS.lon_min, vp);
    ctx.fillText(`${lat}°N`, x - 6, y);
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let lon = Math.ceil(minLon); lon <= Math.floor(maxLon); lon += 1) {
    const [x, y] = toCanvas(AP_BOUNDS.lat_min, lon, vp);
    ctx.fillText(`${lon}°E`, x, y + 4);
  }
  ctx.restore();

  const regionStyle = 'bold 14px system-ui, sans-serif';
  ctx.save();
  ctx.font = regionStyle;
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.textAlign = 'center';
  const [bayX, bayY] = toCanvas((minLat + maxLat) / 2 - 1.5, (minLon + maxLon) / 2 + 2, vp);
  ctx.fillText('BAY OF BENGAL', bayX, bayY);
  ctx.restore();

  ctx.save();
  ctx.font = regionStyle;
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  ctx.textAlign = 'center';
  const [telX, telY] = toCanvas(maxLat - 0.5, (minLon + maxLon) / 2, vp);
  ctx.fillText('TELANGANA', telX, telY);
  ctx.restore();

  ctx.save();
  ctx.font = regionStyle;
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  ctx.textAlign = 'center';
  const [karX, karY] = toCanvas((minLat + maxLat) / 2, minLon + 0.5, vp);
  ctx.fillText('KARNATAKA', karX, karY);
  ctx.restore();

  ctx.save();
  ctx.font = regionStyle;
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  ctx.textAlign = 'center';
  const [tnX, tnY] = toCanvas(minLat + 0.5, (minLon + maxLon) / 2, vp);
  ctx.fillText('TAMIL NADU', tnX, tnY);
  ctx.restore();

  ctx.save();
  ctx.font = regionStyle;
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  ctx.textAlign = 'center';
  const [odX, odY] = toCanvas(maxLat, (minLon + maxLon) / 2 + 1.5, vp);
  ctx.fillText('ODISHA', odX, odY);
  ctx.restore();
}

function renderDataLayer(cacheLayer: HTMLCanvasElement, vp: Viewport, data: number[][], variable: string) {
  const mw = vp.w - PAD * 2;
  const mh = vp.h - PAD * 2;
  const allVals = data.flat();
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);

  const scale = 3;
  const sw = Math.ceil(mw * scale);
  const sh = Math.ceil(mh * scale);
  cacheLayer.width = sw;
  cacheLayer.height = sh;
  const ctx = cacheLayer.getContext('2d')!;
  const imgData = ctx.createImageData(sw, sh);
  const pixels = imgData.data;

  for (let py = 0; py < sh; py++) {
    for (let px = 0; px < sw; px++) {
      const u = px / sw;
      const v = py / sh;
      const r = v * GRID_ROWS;
      const c = u * GRID_COLS;
      const val = bilinearSample(data, r, c);
      const color = getColorForValue(val, variable, minVal, maxVal);
      const m = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
      if (m) {
        const idx = (py * sw + px) * 4;
        pixels[idx] = parseInt(m[1]);
        pixels[idx + 1] = parseInt(m[2]);
        pixels[idx + 2] = parseInt(m[3]);
        pixels[idx + 3] = 255;
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function renderOverlays(mainCtx: CanvasRenderingContext2D, w: number, h: number, vp: Viewport, data: number[][], variable: string) {
  const [minLon, maxLon] = [AP_BOUNDS.lon_min, AP_BOUNDS.lon_max];
  const [minLat, maxLat] = [AP_BOUNDS.lat_min, AP_BOUNDS.lat_max];
  const mw = vp.w - PAD * 2;
  const mh = vp.h - PAD * 2;
  const allVals = data.flat();
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);

  mainCtx.save();
  drawOutline(mainCtx, AP_OUTLINE, vp);
  mainCtx.clip();

  mainCtx.imageSmoothingEnabled = true;
  mainCtx.imageSmoothingQuality = 'high';

  drawOutline(mainCtx, AP_OUTLINE, vp);
  mainCtx.shadowColor = 'rgba(6,182,212,0.4)';
  mainCtx.shadowBlur = 15;
  mainCtx.strokeStyle = '#22d3ee';
  mainCtx.lineWidth = 2.5;
  mainCtx.stroke();
  mainCtx.shadowBlur = 0;
  mainCtx.strokeStyle = 'rgba(255,255,255,0.06)';
  mainCtx.lineWidth = 1;
  mainCtx.stroke();

  DISTRICTS.forEach((d) => {
    if (!pointInPolygon(d.lat, d.lon, AP_OUTLINE)) return;
    const [cx, cy] = toCanvas(d.lat, d.lon, vp);
    const ci = Math.min(GRID_COLS - 1, Math.max(0, Math.floor((d.lon - AP_BOUNDS.lon_min) / (AP_BOUNDS.lon_max - AP_BOUNDS.lon_min) * GRID_COLS)));
    const ri = Math.min(GRID_ROWS - 1, Math.max(0, Math.floor((AP_BOUNDS.lat_max - d.lat) / (AP_BOUNDS.lat_max - AP_BOUNDS.lat_min) * GRID_ROWS)));
    const val = data[ri]?.[ci] ?? 0;
    const label = variable === 'rainfall' ? `${val.toFixed(0)}mm` : `${val.toFixed(1)}°`;

    mainCtx.save();
    mainCtx.shadowColor = 'rgba(0,0,0,0.8)';
    mainCtx.shadowBlur = 6;
    mainCtx.font = 'bold 14px system-ui, sans-serif';
    mainCtx.fillStyle = '#ffffff';
    mainCtx.textAlign = 'center';
    mainCtx.textBaseline = 'bottom';
    mainCtx.fillText(label, cx, cy - 2);
    mainCtx.font = '9px system-ui, sans-serif';
    mainCtx.fillStyle = 'rgba(255,255,255,0.5)';
    mainCtx.textBaseline = 'top';
    mainCtx.fillText(d.name, cx, cy + 3);
    mainCtx.restore();
  });

  CITIES.forEach((c) => {
    if (!pointInPolygon(c.lat, c.lon, AP_OUTLINE)) return;
    const [cx, cy] = toCanvas(c.lat, c.lon, vp);
    mainCtx.save();
    mainCtx.beginPath();
    mainCtx.arc(cx, cy, 2, 0, Math.PI * 2);
    mainCtx.fillStyle = 'rgba(255,255,255,0.5)';
    mainCtx.fill();
    mainCtx.font = '8px system-ui, sans-serif';
    mainCtx.fillStyle = 'rgba(255,255,255,0.25)';
    mainCtx.textAlign = 'left';
    mainCtx.textBaseline = 'bottom';
    mainCtx.fillText(c.name, cx + 4, cy - 1);
    mainCtx.restore();
  });

  mainCtx.save();
  const legendX = vp.ox + vp.w - PAD - 18;
  const legendY = vp.oy + PAD + 20;
  const legendH = Math.min(mh * 0.35, 180);
  const legendW = 14;

  mainCtx.shadowColor = 'rgba(0,0,0,0.5)';
  mainCtx.shadowBlur = 10;
  mainCtx.fillStyle = 'rgba(2,6,23,0.75)';
  mainCtx.beginPath();
  mainCtx.roundRect(legendX - 10, legendY - 12, legendW + 54, legendH + 44, 8);
  mainCtx.fill();
  mainCtx.shadowBlur = 0;
  mainCtx.strokeStyle = 'rgba(100,116,139,0.15)';
  mainCtx.lineWidth = 1;
  mainCtx.stroke();

  mainCtx.fillStyle = 'rgba(148,163,184,0.7)';
  mainCtx.font = '9px system-ui, sans-serif';
  mainCtx.textAlign = 'left';
  mainCtx.textBaseline = 'bottom';
  mainCtx.fillText(variable === 'rainfall' ? 'Rainfall (mm)' : 'Temp (°C)', legendX, legendY - 4);

  const lgrad = mainCtx.createLinearGradient(0, legendY, 0, legendY + legendH);
  const steps = 32;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    lgrad.addColorStop(t, getColorForValue(minVal + t * (maxVal - minVal), variable, minVal, maxVal));
  }
  mainCtx.fillStyle = lgrad;
  mainCtx.beginPath();
  mainCtx.roundRect(legendX, legendY, legendW, legendH, 2);
  mainCtx.fill();
  mainCtx.strokeStyle = 'rgba(148,163,184,0.15)';
  mainCtx.lineWidth = 1;
  mainCtx.stroke();

  mainCtx.font = '9px system-ui, sans-serif';
  mainCtx.textAlign = 'left';
  mainCtx.textBaseline = 'middle';
  mainCtx.fillStyle = 'rgba(148,163,184,0.7)';
  mainCtx.fillText(maxVal.toFixed(1), legendX + legendW + 6, legendY + 4);
  mainCtx.fillText(minVal.toFixed(1), legendX + legendW + 6, legendY + legendH - 4);
  mainCtx.restore();

  mainCtx.restore();
}

export default function WeatherMap({ data, variable, title, height = 500 }: WeatherMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cacheRef = useRef<HTMLCanvasElement | null>(null);
  const dataLayerRef = useRef<HTMLCanvasElement | null>(null);
  const dataRef = useRef(data);
  const varRef = useRef(variable);
  const animIdRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  const vpRef = useRef<Viewport>({ ox: 0, oy: 0, w: 0, h: 0 });
  dataRef.current = data;
  varRef.current = variable;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = height || Math.round(w / MAP_ASPECT);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!cacheRef.current) cacheRef.current = document.createElement('canvas');
    if (!dataLayerRef.current) dataLayerRef.current = document.createElement('canvas');

    const vp = computeViewport(w, h);
    vpRef.current = vp;
    renderStatic(cacheRef.current, w, h, vp);

    const d = dataRef.current;
    const v = varRef.current;
    if (d) {
      renderDataLayer(dataLayerRef.current, vp, d, v);
    }

    let running = true;

    function frame() {
      if (!running) return;
      const curData = dataRef.current;
      const curVar = varRef.current;
      const curVp = vpRef.current;
      if (!canvas) return;
      const c = canvas.getContext('2d');
      if (!c) return;

      c.clearRect(0, 0, w, h);

      if (cacheRef.current) {
        c.drawImage(cacheRef.current, 0, 0);
      }

      if (curData && dataLayerRef.current) {
        c.save();
        drawOutline(c, AP_OUTLINE, curVp);
        c.clip();
        c.filter = 'blur(3px)';
        c.drawImage(dataLayerRef.current, curVp.ox + PAD, curVp.oy + PAD, curVp.w - PAD * 2, curVp.h - PAD * 2);
        c.filter = 'none';
        c.restore();

        renderOverlays(c, w, h, curVp, curData, curVar);
      }

      const particles = particlesRef.current;
      const dt = 0.016;
      timeRef.current += dt;

      c.save();
      drawOutline(c, AP_OUTLINE, curVp);
      c.clip();

      const mw = curVp.w - PAD * 2;
      const mh = curVp.h - PAD * 2;

      if (curData && curVar === 'rainfall') {
        for (let r = 0; r < GRID_ROWS; r++) {
          for (let col = 0; col < GRID_COLS; col++) {
            const val = curData[r]?.[col] ?? 0;
            const cellLat = AP_BOUNDS.lat_max - (r + 0.5) * (AP_BOUNDS.lat_max - AP_BOUNDS.lat_min) / GRID_ROWS;
            const cellLon = AP_BOUNDS.lon_min + (col + 0.5) * (AP_BOUNDS.lon_max - AP_BOUNDS.lon_min) / GRID_COLS;
            if (!pointInPolygon(cellLat, cellLon, AP_OUTLINE)) continue;
            if (val > 0) {
              const [cx, cy] = toCanvas(cellLat, cellLon, curVp);
              const intensity = Math.min(val / 50, 1);
              const pulse = 0.7 + 0.3 * Math.sin(timeRef.current * 3 + r * 1.2 + col * 1.8);
              const spread = (2 + intensity * 6) * pulse;
              const grad = c.createRadialGradient(cx, cy, 0, cx, cy, spread);
              grad.addColorStop(0, `rgba(100,180,255,${intensity * 0.08 * pulse})`);
              grad.addColorStop(1, `rgba(100,180,255,0)`);
              c.fillStyle = grad;
              c.beginPath();
              c.arc(cx, cy, spread, 0, Math.PI * 2);
              c.fill();
            }
          }
        }

        const targetCount = Math.min(200, Math.floor(mw * mh / 2000));
        while (particles.length < targetCount) {
          const x = curVp.ox + PAD + Math.random() * mw;
          const y = curVp.oy + PAD + Math.random() * mh;
          const ci = Math.min(Math.floor((x - curVp.ox - PAD) / mw * GRID_COLS), GRID_COLS - 1);
          const ri = Math.min(Math.floor((y - curVp.oy - PAD) / mh * GRID_ROWS), GRID_ROWS - 1);
          const val = curData[ri]?.[ci] ?? 0;
          const allVals = curData.flat();
          const maxVal = Math.max(...allVals) || 1;
          const intensity = val / maxVal;
          particles.push({
            x, y,
            speed: 300 + intensity * 400 + Math.random() * 200,
            opacity: 0.15 + intensity * 0.5,
            length: 8 + intensity * 20,
            lifetime: 0.8 + Math.random() * 0.4,
          });
        }

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.lifetime -= dt;
          if (p.lifetime <= 0) { particles.splice(i, 1); continue; }
          p.y += p.speed * dt;
          if (p.y > curVp.oy + PAD + mh + 10) { particles.splice(i, 1); continue; }
          const alpha = p.opacity * Math.min(p.lifetime / 0.2, 1);
          c.beginPath();
          c.moveTo(p.x, p.y);
          c.lineTo(p.x + 1.5, p.y - p.length);
          c.strokeStyle = `rgba(180,220,255,${alpha})`;
          c.lineWidth = 1.2;
          c.stroke();
        }
      }

      if (curData && (curVar.startsWith('max_temp') || curVar === 'temperature')) {
        const allVals = curData.flat();
        const maxVal = Math.max(...allVals) || 1;
        for (let r = 0; r < GRID_ROWS; r++) {
          for (let col = 0; col < GRID_COLS; col++) {
            const val = curData[r]?.[col] ?? 0;
            const intensity = val / maxVal;
            if (intensity > 0.4) {
              const cellLat = AP_BOUNDS.lat_max - (r + 0.5) * (AP_BOUNDS.lat_max - AP_BOUNDS.lat_min) / GRID_ROWS;
              const cellLon = AP_BOUNDS.lon_min + (col + 0.5) * (AP_BOUNDS.lon_max - AP_BOUNDS.lon_min) / GRID_COLS;
              if (!pointInPolygon(cellLat, cellLon, AP_OUTLINE)) continue;
              const [cx, cy] = toCanvas(cellLat, cellLon, vp);
              const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * 2 + r * 0.5 + col * 0.7);
              const radius = (intensity - 0.3) * 35 * (0.8 + 0.2 * pulse);
              const alpha = (intensity - 0.3) * 0.12 * pulse;
              const grad = c.createRadialGradient(cx, cy, 0, cx, cy, radius);
              grad.addColorStop(0, `rgba(255,200,100,${alpha})`);
              grad.addColorStop(1, `rgba(255,200,100,0)`);
              c.fillStyle = grad;
              c.beginPath();
              c.arc(cx, cy, radius, 0, Math.PI * 2);
              c.fill();
            }
          }
        }
      }

      c.restore();

      animIdRef.current = requestAnimationFrame(frame);
    }

    animIdRef.current = requestAnimationFrame(frame);

    function onResize() {
      if (!canvas || !parent) return;
      const pw = parent.clientWidth;
      const ph = height || Math.max(350, pw * 0.7);
      canvas.width = pw * dpr;
      canvas.height = ph * dpr;
      canvas.style.width = `${pw}px`;
      canvas.style.height = `${ph}px`;
      const ctx2 = canvas.getContext('2d');
      if (ctx2) ctx2.scale(dpr, dpr);
      const newVp = computeViewport(pw, ph);
      vpRef.current = newVp;
      renderStatic(cacheRef.current!, pw, ph, newVp);
      if (dataRef.current) {
        renderDataLayer(dataLayerRef.current!, newVp, dataRef.current, varRef.current);
      }
    }

    window.addEventListener('resize', onResize);

    return () => {
      running = false;
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', onResize);
      particlesRef.current = [];
    };
  }, [height, data, variable]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-700/30 shadow-lg shadow-cyan-500/5">
      <canvas ref={canvasRef} className="w-full block" />
      {title && (
        <div className="absolute top-3 left-3">
          <div className="bg-cyan-500/15 backdrop-blur-sm text-cyan-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-cyan-500/20 tracking-wide">
            {title}
          </div>
        </div>
      )}
      <div className="absolute top-3 right-3">
        <div className="bg-black/40 backdrop-blur-sm text-white/40 text-[10px] px-2 py-1 rounded font-mono border border-white/5">
          {GRID_ROWS}×{GRID_COLS}
        </div>
      </div>
    </div>
  );
}
