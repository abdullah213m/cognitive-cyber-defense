import React, { useEffect, useRef, useState } from 'react';
import { Globe, ShieldAlert, Zap, Radio, Terminal, Play, Pause } from 'lucide-react';

const ATTACK_NODES = [
  { id: 'us', name: 'United States', x: 0.16, y: 0.36, color: '#00F0FF', code: 'US-EAST', align: 'right', offsetX: -14, offsetY: -2 },
  { id: 'uk', name: 'United Kingdom', x: 0.42, y: 0.22, color: '#00F0FF', code: 'EU-LON', align: 'right', offsetX: -14, offsetY: -12 },
  { id: 'nl', name: 'Netherlands', x: 0.49, y: 0.15, color: '#FFB800', code: 'EU-AMS', align: 'center', offsetX: 0, offsetY: -18 },
  { id: 'de', name: 'Germany', x: 0.55, y: 0.32, color: '#FFB800', code: 'EU-FRA', align: 'left', offsetX: 14, offsetY: 12 },
  { id: 'ru', name: 'Russia (Moscow)', x: 0.65, y: 0.18, color: '#FF0055', code: 'EMEA-RU', align: 'left', offsetX: 14, offsetY: -6 },
  { id: 'in', name: 'India (HQ SOC)', x: 0.66, y: 0.52, color: '#00FF66', isHQ: true, code: 'HQ-BLR', align: 'left', offsetX: 18, offsetY: 6 },
  { id: 'cn', name: 'China (East)', x: 0.83, y: 0.38, color: '#FF0055', code: 'APAC-CN', align: 'left', offsetX: 14, offsetY: -2 },
  { id: 'sg', name: 'Singapore Hub', x: 0.77, y: 0.64, color: '#00FF66', code: 'APAC-SG', align: 'left', offsetX: 14, offsetY: 12 },
  { id: 'br', name: 'Brazil', x: 0.28, y: 0.72, color: '#00F0FF', code: 'LATAM-SP', align: 'right', offsetX: -14, offsetY: 4 },
];

export default function GlobalAttackMap({ deniedPackets, totalBytes }) {
  const canvasRef = useRef(null);
  const [liveAttacks, setLiveAttacks] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const mousePosRef = useRef({ x: 0, y: 0, isOver: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle beams
    const particles = [];
    const hqNode = ATTACK_NODES.find(n => n.isHQ);

    const createParticle = () => {
      const sourceNodes = ATTACK_NODES.filter(n => !n.isHQ);
      const source = sourceNodes[Math.floor(Math.random() * sourceNodes.length)];
      const isDenied = Math.random() > 0.45;
      return {
        source,
        target: hqNode,
        progress: 0,
        speed: 0.0035 + Math.random() * 0.0065,
        color: isDenied ? '#FF0055' : (source.color === '#FF0055' ? '#FFB800' : '#00F0FF'),
        size: 2.2 + Math.random() * 2,
        isDenied,
        protocol: Math.random() > 0.5 ? 'TCP/443' : 'UDP/8080',
        bytes: Math.floor(1200 + Math.random() * 85000),
        srcIp: `192.168.${Math.floor(Math.random()*254)}.${Math.floor(Math.random()*254)}`
      };
    };

    for (let i = 0; i < 22; i++) {
      const p = createParticle();
      p.progress = Math.random();
      particles.push(p);
    }

    let lastLogTime = Date.now();

    const render = () => {
      const width = canvas.getBoundingClientRect().width;
      const height = canvas.getBoundingClientRect().height;

      ctx.clearRect(0, 0, width, height);

      // Cyber Grid Lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
      ctx.lineWidth = 1;
      const step = 45;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Radar Sweep Effect
      const radarAngle = (Date.now() / 1600) % (Math.PI * 2);
      const hqX = hqNode.x * width;
      const hqY = hqNode.y * height;
      const maxRadarRadius = Math.min(width, height) * 0.65;
      
      const grad = ctx.createRadialGradient(hqX, hqY, 5, hqX, hqY, maxRadarRadius);
      grad.addColorStop(0, 'rgba(0, 255, 102, 0.14)');
      grad.addColorStop(0.6, 'rgba(0, 255, 102, 0.03)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(hqX, hqY);
      ctx.arc(hqX, hqY, maxRadarRadius, radarAngle, radarAngle + 0.35);
      ctx.closePath();
      ctx.fill();

      // Draw Connection Arcs & Particles
      particles.forEach((p, idx) => {
        if (!isPaused) {
          p.progress += p.speed;
        }
        if (p.progress >= 1) {
          if (Date.now() - lastLogTime > 350) {
            setLiveAttacks(prev => [
              {
                id: Date.now() + Math.random(),
                origin: p.source.name,
                protocol: p.protocol,
                action: p.isDenied ? 'BLOCKED' : 'PERMITTED',
                color: p.isDenied ? '#FF0055' : '#00FF66',
                ip: p.srcIp,
                bytes: `${(p.bytes / 1024).toFixed(1)} KB`
              },
              ...prev.slice(0, 7)
            ]);
            lastLogTime = Date.now();
          }
          particles[idx] = createParticle();
          return;
        }

        const sx = p.source.x * width;
        const sy = p.source.y * height;
        const tx = p.target.x * width;
        const ty = p.target.y * height;

        // Curved arc path
        const midX = (sx + tx) / 2;
        const midY = (sy + ty) / 2 - 45;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(midX, midY, tx, ty);
        ctx.strokeStyle = p.isDenied ? 'rgba(255, 0, 85, 0.22)' : 'rgba(0, 240, 255, 0.18)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Particle position along quadratic bezier curve
        const t = p.progress;
        const px = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * midX + t * t * tx;
        const py = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * midY + t * t * ty;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Nodes & Collision-Free Labels
      ATTACK_NODES.forEach(node => {
        const nx = node.x * width;
        const ny = node.y * height;

        if (node.isHQ) {
          const pulse = (Date.now() % 2000) / 2000;
          ctx.beginPath();
          ctx.arc(nx, ny, 10 + pulse * 28, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 255, 102, ${1 - pulse})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Outer secondary ring
          const pulse2 = ((Date.now() + 1000) % 2000) / 2000;
          ctx.beginPath();
          ctx.arc(nx, ny, 8 + pulse2 * 18, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 255, 102, ${(1 - pulse2) * 0.6})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Node circle with glow
        ctx.beginPath();
        ctx.arc(nx, ny, node.isHQ ? 7.5 : 5.5, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label Positioning
        const align = node.align || 'left';
        const lx = nx + (node.offsetX || 12);
        const ly = ny + (node.offsetY || 0);

        // Leader tick mark if offset
        if (node.offsetX || node.offsetY) {
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(lx, ly);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Measure text for backdrop pill
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        const nameWidth = ctx.measureText(node.name).width;
        ctx.font = 'bold 8.5px JetBrains Mono, monospace';
        const codeWidth = ctx.measureText(`[${node.code}]`).width;
        const maxTextWidth = Math.max(nameWidth, codeWidth);

        const pillPadX = 6;
        const pillPadY = 4;
        const pillHeight = 26;
        const pillWidth = maxTextWidth + pillPadX * 2;
        
        let pillX = lx;
        if (align === 'right') {
          pillX = lx - pillWidth;
        } else if (align === 'center') {
          pillX = lx - pillWidth / 2;
        }

        const pillY = ly - pillHeight / 2;

        // Draw translucent dark backdrop pill
        ctx.fillStyle = 'rgba(7, 11, 20, 0.85)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 5);
        } else {
          ctx.rect(pillX, pillY, pillWidth, pillHeight);
        }
        ctx.fill();
        ctx.stroke();

        // Accent indicator bar on pill edge
        ctx.fillStyle = node.color;
        ctx.fillRect(align === 'right' ? pillX + pillWidth - 2.5 : pillX, pillY + 3, 2.5, pillHeight - 6);

        // Render Name & Code
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        const textStartX = align === 'right' ? pillX + pillPadX : pillX + pillPadX + 3;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9.5px JetBrains Mono, monospace';
        ctx.fillText(node.name, textStartX, pillY + 8);

        ctx.fillStyle = node.color;
        ctx.font = 'bold 8px JetBrains Mono, monospace';
        ctx.fillText(`[${node.code}]`, textStartX, pillY + 19);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused]);

  return (
    <div className="cyber-panel p-5 mb-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3 font-sans">
        <div className="flex items-center gap-2">
          <Globe style={{ width: 18, height: 18, color: '#60A5FA' }} />
          <h2 className="text-base font-bold font-display text-white tracking-tight">
            Live Global Telemetry Trajectory & Perimeter Defense
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F43F5E' }}></span>
              Blocked Ingress
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38BDF8' }}></span>
              Permitted Tunnel
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}></span>
              SOC Defense Core
            </span>
          </div>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="cyber-btn-outline px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5 font-medium"
          >
            {isPaused ? <Play style={{ width: 12, height: 12 }} /> : <Pause style={{ width: 12, height: 12 }} />}
            <span>{isPaused ? 'Resume' : 'Freeze'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Canvas + Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 font-sans">
        {/* Canvas World Area */}
        <div
          className="lg:col-span-3 rounded-xl relative overflow-hidden"
          style={{
            height: 380,
            background: 'radial-gradient(ellipse at center, rgba(30, 41, 59, 0.4) 0%, rgba(11, 15, 25, 0.95) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.7)'
          }}
        >
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          {/* Overlay Corner Markers */}
          <div className="absolute top-3 left-3 text-xs font-sans text-blue-400 font-medium opacity-80">
            Radar: Lat 12.97° N / Lon 77.59° E [Online]
          </div>
          <div className="absolute bottom-3 right-3 text-xs font-sans text-slate-400 opacity-70">
            Spectral Sweep: 2.4 GHz • Packets: 62.4k
          </div>
        </div>

        {/* Live Packet Intercept Feed */}
        <div
          className="p-4 rounded-xl flex flex-col justify-between"
          style={{
            height: 380,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            boxSizing: 'border-box'
          }}
        >
          <div className="flex flex-col flex-1 overflow-hidden min-h-0">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Terminal style={{ width: 14, height: 14, color: '#10B981' }} />
                <span className="text-xs font-semibold text-white">Live Intercept</span>
              </div>
              <span className="pulse-dot"></span>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1 min-h-0" style={{ maxHeight: 275 }}>
              {liveAttacks.map((item) => {
                const isBlocked = item.action === 'BLOCKED';
                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg text-xs flex flex-col gap-1.5 flex-shrink-0"
                    style={{
                      background: 'rgba(30, 41, 59, 0.55)',
                      border: `1px solid ${isBlocked ? 'rgba(244, 63, 94, 0.35)' : 'rgba(16, 185, 129, 0.25)'}`,
                      boxSizing: 'border-box'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium text-xs">{item.origin}</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide"
                        style={{
                          background: isBlocked ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: isBlocked ? '#FB7185' : '#34D399',
                          border: `1px solid ${isBlocked ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                        }}
                      >
                        {isBlocked ? 'Blocked' : 'Permitted'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
                      <span>{item.protocol}</span>
                      <span>{item.bytes}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2.5 mt-2 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between flex-shrink-0">
            <span>Perimeter Blocks:</span>
            <span className="text-rose-400 font-bold font-mono">{Number(deniedPackets || 6572).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
