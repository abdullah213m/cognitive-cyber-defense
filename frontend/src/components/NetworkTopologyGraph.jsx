import React, { useEffect, useRef, useState } from 'react';
import { 
  Network, ZoomIn, ZoomOut, RefreshCw, User, Server, AlertTriangle, 
  ShieldCheck, X, Zap, Crown, Target, ChevronRight, ShieldAlert
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function NetworkTopologyGraph({ graphData }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Attack Path Reconstruction state
  const [attackPaths, setAttackPaths] = useState([]);
  const [selectedPathIndex, setSelectedPathIndex] = useState(0);
  const [highlightPathMode, setHighlightPathMode] = useState(true);

  const nodesRef = useRef([]);
  const linksRef = useRef([]);

  // Fetch Attack Paths
  useEffect(() => {
    fetch(`${API_BASE}/api/attack-paths`)
      .then(res => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then(data => {
        if (data && data.paths) {
          setAttackPaths(data.paths);
        }
      })
      .catch(() => {
        // Standalone Vercel fallback attack paths
        setAttackPaths([
          {
            ingress_source: 'EMP-59201 (Terminated)',
            target_crown_jewel: 'PROD-DB-VAULT',
            hop_count: 3,
            criticality: 'CRITICAL',
            nodes: ['EMP-59201', 'HOST-JUMP-04', 'IAM-ROOT-ADMIN', 'PROD-DB-VAULT']
          },
          {
            ingress_source: 'EMP-10492 (Privilege surge)',
            target_crown_jewel: 'FINANCE-CORE-01',
            hop_count: 2,
            criticality: 'HIGH',
            nodes: ['EMP-10492', 'DC-PROD-01', 'FINANCE-CORE-01']
          }
        ]);
      });
  }, []);

  const activePath = attackPaths[selectedPathIndex] || null;
  const activePathNodes = new Set(activePath ? activePath.nodes : []);

  useEffect(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) return;

    const width = 900;
    const height = 520;
    const nodes = graphData.nodes.map((n, i) => {
      const angle = (i / graphData.nodes.length) * Math.PI * 2;
      const radius = 130 + Math.random() * 180;
      const isCrown = n.type === 'CROWN_JEWEL' || n.name?.includes('CROWN-JEWEL') || n.name?.includes('PROD-DB') || n.name?.includes('VAULT');
      return {
        ...n,
        isCrown,
        x: isCrown ? (width / 2 + (i % 3 - 1) * 160) : (width / 2 + Math.cos(angle) * radius),
        y: isCrown ? (height / 2 + 100) : (height / 2 + Math.sin(angle) * radius),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: isCrown ? 18 : (n.type === 'USER' ? 14 : (n.type === 'HOST' ? 11 : 8))
      };
    });

    const links = graphData.links.map(l => ({
      ...l,
      sourceNode: nodes.find(n => n.id === l.source) || nodes[0],
      targetNode: nodes.find(n => n.id === l.target) || nodes[1]
    }));

    nodesRef.current = nodes;
    linksRef.current = links;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let pulseAngle = 0;

    const simulate = () => {
      pulseAngle += 0.05;

      // Spring force between linked nodes
      links.forEach(l => {
        const dx = l.targetNode.x - l.sourceNode.x;
        const dy = l.targetNode.y - l.sourceNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = 95;
        const force = (dist - targetDist) * 0.005;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (!l.sourceNode.isCrown) {
          l.sourceNode.vx += fx;
          l.sourceNode.vy += fy;
        }
        if (!l.targetNode.isCrown) {
          l.targetNode.vx -= fx;
          l.targetNode.vy -= fy;
        }
      });

      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 160) {
            const force = (160 - dist) * 0.016;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            if (!nodes[i].isCrown) {
              nodes[i].vx -= fx;
              nodes[i].vy -= fy;
            }
            if (!nodes[j].isCrown) {
              nodes[j].vx += fx;
              nodes[j].vy += fy;
            }
          }
        }
      }

      // Dampening & boundaries
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        n.vx *= 0.88;
        n.vy *= 0.88;

        n.x = Math.max(40, Math.min(width - 40, n.x));
        n.y = Math.max(40, Math.min(height - 40, n.y));
      });

      // Render
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(zoom, zoom);

      // Subtle Background Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 45) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 45) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Edges
      links.forEach(l => {
        const isDeny = l.relation && l.relation.includes('DENY');
        const isAttackEdge = highlightPathMode && activePath && (
          (activePathNodes.has(l.sourceNode.id) || activePathNodes.has(l.sourceNode.name)) &&
          (activePathNodes.has(l.targetNode.id) || activePathNodes.has(l.targetNode.name))
        );

        ctx.beginPath();
        ctx.moveTo(l.sourceNode.x, l.sourceNode.y);
        ctx.lineTo(l.targetNode.x, l.targetNode.y);

        if (isAttackEdge) {
          ctx.strokeStyle = '#F43F5E';
          ctx.lineWidth = 3.5;
          ctx.setLineDash([8, 4]);
          ctx.lineDashOffset = -pulseAngle * 12;
          ctx.shadowColor = '#F43F5E';
          ctx.shadowBlur = 10;
        } else {
          ctx.setLineDash([]);
          ctx.strokeStyle = isDeny ? 'rgba(244, 63, 94, 0.35)' : 'rgba(59, 130, 246, 0.22)';
          ctx.lineWidth = 1.2;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      });

      // Draw Nodes
      nodes.forEach(n => {
        const isSelected = selectedNode?.id === n.id;
        const isOnActivePath = highlightPathMode && activePath && (activePathNodes.has(n.id) || activePathNodes.has(n.name));
        const matchesFilter = filterType === 'ALL' || n.type === filterType || (filterType === 'CROWN_JEWEL' && n.isCrown);

        if (!matchesFilter && !isOnActivePath) return;

        // Glowing Halo for Crown Jewels or Attack Path Nodes
        const haloSize = n.isCrown ? 12 : (isOnActivePath ? 10 : (isSelected ? 8 : 3));
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + haloSize + (isOnActivePath ? Math.sin(pulseAngle) * 3 : 0), 0, Math.PI * 2);
        
        if (n.isCrown) {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
        } else if (isOnActivePath) {
          ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
        } else {
          ctx.fillStyle = (n.color || '#3B82F6').replace(')', ', 0.18)').replace('rgb', 'rgba');
        }
        ctx.fill();

        // Node Body
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        const baseColor = n.isCrown ? '#FBBF24' : (isOnActivePath ? '#F43F5E' : (n.color || '#3B82F6'));
        ctx.fillStyle = baseColor;
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = (n.isCrown || isOnActivePath || isSelected) ? 18 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Crown Jewel Inner Star / Border
        if (n.isCrown) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = n.isCrown ? '#FDE68A' : (isOnActivePath ? '#FDA4AF' : '#F8FAFC');
        ctx.font = (isSelected || n.isCrown || isOnActivePath) 
          ? '700 11px Plus Jakarta Sans, Inter, sans-serif' 
          : '500 10px Plus Jakarta Sans, Inter, sans-serif';
        const labelPrefix = n.isCrown ? '👑 ' : (isOnActivePath ? '⚠️ ' : '');
        ctx.fillText(labelPrefix + n.name, n.x + n.radius + 6, n.y + 4);
      });

      ctx.restore();
      animId = requestAnimationFrame(simulate);
    };

    simulate();

    return () => cancelAnimationFrame(animId);
  }, [graphData, zoom, offset, selectedNode, filterType, highlightPathMode, selectedPathIndex, attackPaths]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - offset.x) / zoom;
    const clickY = (e.clientY - rect.top - offset.y) / zoom;

    const clicked = nodesRef.current.find(n => {
      const dx = n.x - clickX;
      const dy = n.y - clickY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 8;
    });

    setSelectedNode(clicked || null);
  };

  return (
    <div className="cyber-panel p-6 font-sans space-y-4">
      {/* Top Header & Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Network style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <h2 className="text-base font-bold font-display text-white">
              Correlated Threat & Attack Path Topology Graph
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Shortest-path lateral movement reconstruction targeting Crown Jewel assets (DC-01, Prod-DB, Vault)
            </p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(prev => Math.min(2.0, prev + 0.15))}
            className="cyber-btn-outline p-2 rounded-lg"
            title="Zoom In"
          >
            <ZoomIn style={{ width: 14, height: 14 }} />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.6, prev - 0.15))}
            className="cyber-btn-outline p-2 rounded-lg"
            title="Zoom Out"
          >
            <ZoomOut style={{ width: 14, height: 14 }} />
          </button>
          <button
            onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
            className="cyber-btn-outline px-3 py-1.5 rounded-lg text-xs font-medium"
            title="Reset View"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Attack Path Selector Bar */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/30 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
            <Zap style={{ width: 16, height: 16 }} />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Lateral Movement Breach Paths Detected:</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[11px]">
                {attackPaths.length} Reconstructed Paths
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={selectedPathIndex}
            onChange={(e) => setSelectedPathIndex(Number(e.target.value))}
            className="cyber-select text-xs py-1.5"
            style={{ minWidth: 320 }}
          >
            {attackPaths.map((p, idx) => (
              <option key={idx} value={idx}>
                Path #{idx + 1}: {p.ingress_source} ➔ {p.target_crown_jewel} ({p.hop_count} Hops)
              </option>
            ))}
          </select>

          <button
            onClick={() => setHighlightPathMode(!highlightPathMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              highlightPathMode
                ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Target style={{ width: 13, height: 13 }} />
            <span>{highlightPathMode ? 'Breach Path Glowing' : 'Show All Links'}</span>
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 text-xs flex-wrap">
        {[
          { id: 'ALL', label: 'All Entities', color: '#3B82F6' },
          { id: 'CROWN_JEWEL', label: 'Crown Jewels 👑', color: '#FBBF24' },
          { id: 'USER', label: 'Employees', color: '#F43F5E' },
          { id: 'HOST', label: 'Endpoints', color: '#8B5CF6' },
          { id: 'MALWARE_ALERT', label: 'EDR Alerts', color: '#F59E0B' },
          { id: 'IP_TARGET', label: 'Foreign IPs', color: '#10B981' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className="cyber-tab-btn"
            style={{
              padding: '5px 11px',
              fontSize: '0.74rem',
              background: filterType === f.id ? 'rgba(59, 130, 246, 0.18)' : 'rgba(30, 41, 59, 0.5)',
              borderColor: filterType === f.id ? f.color : 'rgba(255, 255, 255, 0.08)',
              color: filterType === f.id ? '#FFFFFF' : '#94A3B8'
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: f.color }} />
            {f.label}
          </button>
        ))}
      </div>

      {/* Main Graph Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div
          className="lg:col-span-3 rounded-xl relative overflow-hidden"
          style={{
            height: 520,
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(11, 15, 25, 0.95) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.6)'
          }}
        >
          <canvas
            ref={canvasRef}
            width={900}
            height={520}
            onClick={handleCanvasClick}
            style={{ width: '100%', height: '100%', cursor: 'crosshair', display: 'block' }}
          />

          <div className="absolute top-3 left-3 text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-white/5 backdrop-blur-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>Click any entity node to inspect correlated forensic relationships</span>
          </div>

          {activePath && highlightPathMode && (
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 border border-rose-500/40 p-2.5 rounded-lg backdrop-blur-md flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-rose-400 font-bold">Active Kill-Chain:</span>
                <span className="font-mono text-white truncate">
                  {activePath.nodes.join(' ➔ ')}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold text-[11px] whitespace-nowrap">
                {activePath.criticality}
              </span>
            </div>
          )}
        </div>

        {/* Node Inspector & Kill Chain Step Drawer */}
        <div
          className="p-5 rounded-xl flex flex-col justify-between"
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)'
          }}
        >
          {selectedNode ? (
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <span className="text-xs text-blue-400 font-semibold tracking-wide">Entity Details</span>
                <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white transition-colors">
                  <X style={{ width: 15, height: 15 }} />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
                  <div className="text-slate-400 mb-1">Entity Identifier</div>
                  <div className="text-white font-bold text-sm font-mono flex items-center gap-1.5">
                    {selectedNode.isCrown && <span>👑</span>}
                    <span>{selectedNode.name}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5 flex justify-between items-center">
                  <span className="text-slate-400">Classification:</span>
                  <span className="text-blue-400 font-semibold">{selectedNode.type}</span>
                </div>
                {selectedNode.score && (
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5 flex justify-between items-center">
                    <span className="text-slate-400">Composite Threat Score:</span>
                    <span className="text-rose-400 font-bold font-mono text-sm">{Number(selectedNode.score).toFixed(1)} / 100</span>
                  </div>
                )}
                {selectedNode.tier && (
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5 flex justify-between items-center">
                    <span className="text-slate-400">Assigned Threat Tier:</span>
                    <span className="text-amber-400 font-semibold">{selectedNode.tier}</span>
                  </div>
                )}
                {selectedNode.is_breach && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold text-xs flex items-center gap-2">
                    <AlertTriangle style={{ width: 16, height: 16 }} />
                    <span>Zero-Trust Offboarding Breach</span>
                  </div>
                )}
              </div>
            </div>
          ) : activePath ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">Kill-Chain Steps</span>
                <span className="text-slate-400 font-mono">{activePath.hop_count} Hops</span>
              </div>

              <div className="space-y-2 max-h-[340px] overflow-y-auto">
                {activePath.steps?.map((st, sIdx) => (
                  <div key={sIdx} className="p-2.5 rounded-lg bg-slate-900/80 border border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400 font-mono">STEP 0{sIdx + 1}</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 text-[10px] font-semibold">
                        {st.type}
                      </span>
                    </div>
                    <div className="font-mono text-white text-[11px] flex items-center gap-1">
                      <span className="truncate">{st.from}</span>
                      <ChevronRight style={{ width: 12, height: 12, color: '#F43F5E', flexShrink: 0 }} />
                      <span className="text-rose-300 font-semibold truncate">{st.to}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300">
                <strong>Crown Jewel Target:</strong> {activePath.target_crown_jewel}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 text-xs my-auto p-4 space-y-3">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 w-fit mx-auto">
                <Network style={{ width: 28, height: 28 }} />
              </div>
              <div className="text-slate-300 font-medium">Select an Entity</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Click any node in the topology visualization to inspect correlated forensic metadata and threat indicators.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
            <span>Nodes: <strong className="text-white font-mono">{nodesRef.current.length}</strong></span>
            <span>Links: <strong className="text-white font-mono">{linksRef.current.length}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
