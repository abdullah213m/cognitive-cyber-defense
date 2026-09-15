import React, { useState } from 'react';
import { Grid, ShieldAlert, Crosshair, ExternalLink, Info, X } from 'lucide-react';

export default function MitreMatrix({ mitreData }) {
  const [selectedTechnique, setSelectedTechnique] = useState(null);

  if (!mitreData || !mitreData.matrix) {
    return (
      <div className="cyber-panel p-8 text-center text-xs text-slate-400 font-sans">
        Loading MITRE ATT&CK Enterprise Matrix...
      </div>
    );
  }

  return (
    <div className="cyber-panel p-5 mb-6 font-sans">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Crosshair style={{ width: 18, height: 18, color: '#F43F5E' }} />
          <h2 className="text-base font-bold font-display text-white tracking-tight">
            MITRE ATT&CK Enterprise Threat Matrix & Adversary Tactics
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-sans">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F43F5E' }}></span>
            Critical Severity
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }}></span>
            High Severity
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38BDF8' }}></span>
            Medium Telemetry
          </span>
        </div>
      </div>

      {/* MITRE Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3 overflow-x-auto pb-3">
        {mitreData.matrix.map((tactic) => (
          <div
            key={tactic.tactic_id}
            className="rounded-xl border border-subtle flex flex-col overflow-hidden"
            style={{ background: 'rgba(15, 23, 42, 0.85)' }}
          >
            {/* Tactic Column Header */}
            <div
              className="p-3 border-b border-subtle"
              style={{ background: 'rgba(30, 41, 59, 0.6)' }}
            >
              <div className="text-[11px] font-sans font-semibold text-blue-400">{tactic.tactic_id}</div>
              <div className="text-xs font-semibold text-white truncate mt-0.5" title={tactic.tactic_name}>
                {tactic.tactic_name}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {tactic.alert_count} Alerts
              </div>
            </div>

            {/* Techniques List */}
            <div className="p-2 space-y-1.5 flex-1 overflow-y-auto" style={{ maxHeight: 360 }}>
              {tactic.techniques_list && tactic.techniques_list.length > 0 ? (
                tactic.techniques_list.map((tech) => {
                  const isCrit = tech.severity === 'CRITICAL';
                  const isHigh = tech.severity === 'HIGH';
                  const color = isCrit ? '#FB7185' : (isHigh ? '#FBBF24' : '#38BDF8');
                  const bg = isCrit ? 'rgba(244,63,94,0.1)' : (isHigh ? 'rgba(245,158,11,0.1)' : 'rgba(56,189,248,0.08)');
                  const border = isCrit ? 'rgba(244,63,94,0.35)' : (isHigh ? 'rgba(245,158,11,0.35)' : 'rgba(56,189,248,0.25)');

                  return (
                    <div
                      key={tech.id}
                      onClick={() => setSelectedTechnique({ ...tech, tactic: tactic.tactic_name })}
                      className="p-2 rounded-lg cursor-pointer transition-all hover:translate-x-0.5"
                      style={{
                        background: bg,
                        border: `1px solid ${border}`,
                      }}
                    >
                      <div className="flex items-center justify-between text-xs font-medium mb-0.5">
                        <span style={{ color }}>{tech.id}</span>
                        <span className="text-slate-300 px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 font-semibold">{tech.count}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate" title={tech.name}>
                        {tech.name}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-500 text-center py-6">
                  No active alerts
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Technique Drilldown Detail */}
      {selectedTechnique && (
        <div
          className="mt-4 p-4 rounded-xl flex items-center justify-between gap-4 font-sans"
          style={{
            background: 'rgba(30, 41, 59, 0.75)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.15)'
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                {selectedTechnique.id}
              </span>
              <span className="text-sm font-semibold text-white">{selectedTechnique.name}</span>
              <span className="text-xs text-slate-400">({selectedTechnique.tactic})</span>
            </div>
            <p className="text-xs text-slate-300">
              Correlated <strong>{selectedTechnique.count} telemetry alerts</strong>. Severity Rating: <span className="text-rose-400 font-semibold">{selectedTechnique.severity}</span>
            </p>
          </div>
          <button
            onClick={() => setSelectedTechnique(null)}
            className="cyber-btn-outline p-1.5 rounded-md text-xs"
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}
    </div>
  );
}
