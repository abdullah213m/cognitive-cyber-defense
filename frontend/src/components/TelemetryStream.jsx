import React, { useState } from 'react';
import { Terminal, ShieldAlert, Lock, Radio, Activity, Filter, RefreshCw, Layers } from 'lucide-react';

export default function TelemetryStream({ events = [], onRefresh }) {
  const [streamFilter, setStreamFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredEvents = (events || []).filter(e => {
    if (streamFilter === 'ALL') return true;
    return e.stream === streamFilter;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) await onRefresh();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  return (
    <div className="cyber-panel p-6 mb-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Terminal style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <h2 className="text-base font-bold font-display text-white">
              Live Unified SIEM Telemetry Stream
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time normalized event stream across Firewall, IAM Authentication, and EDR agents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs flex-wrap">
          {[
            { id: 'ALL', label: 'All Telemetry Streams' },
            { id: 'IAM_AUDIT', label: 'IAM Audit' },
            { id: 'EDR_ALERT', label: 'EDR Alerts' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setStreamFilter(s.id)}
              className="cyber-tab-btn"
              style={{
                padding: '6px 14px',
                fontSize: '0.75rem',
                background: streamFilter === s.id ? 'rgba(59, 130, 246, 0.18)' : 'rgba(30, 41, 59, 0.5)',
                borderColor: streamFilter === s.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                color: streamFilter === s.id ? '#FFFFFF' : '#94A3B8'
              }}
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={handleRefresh}
            className="cyber-btn-outline p-2 rounded-lg"
            title="Refresh Stream"
          >
            <RefreshCw className={isRefreshing ? 'animate-spin' : ''} style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      <div
        className="rounded-xl p-3 overflow-y-auto space-y-2"
        style={{
          background: 'rgba(11, 15, 25, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          maxHeight: 540
        }}
      >
        {filteredEvents.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">No telemetry events matching the selected filter.</div>
        ) : (
          filteredEvents.map((evt, i) => {
            const isIAM = evt.stream === 'IAM_AUDIT';
            const isCrit = evt.severity === 'CRITICAL';
            const isHigh = evt.severity === 'HIGH';

            return (
              <div
                key={evt.id || i}
                className="p-3.5 rounded-lg border border-white/5 transition-all flex items-center justify-between gap-4 flex-wrap hover:border-white/15"
                style={{ background: 'rgba(15, 23, 42, 0.65)' }}
              >
                <div className="flex items-center gap-3.5 flex-wrap">
                  <span className="text-slate-400 text-xs font-mono" style={{ width: 150 }}>
                    {evt.timestamp}
                  </span>
                  <span
                    className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold"
                    style={{
                      background: isIAM ? 'rgba(59, 130, 246, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                      color: isIAM ? '#60A5FA' : '#C084FC',
                      border: `1px solid ${isIAM ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`
                    }}
                  >
                    {evt.stream}
                  </span>
                  <code className="text-blue-400 font-semibold text-xs font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {evt.entity}
                  </code>
                  <span className="text-slate-200 text-xs">{evt.details}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide"
                    style={{
                      background: isCrit ? 'rgba(244, 63, 94, 0.15)' : (isHigh ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'),
                      color: isCrit ? '#F43F5E' : (isHigh ? '#F59E0B' : '#10B981'),
                      border: `1px solid ${isCrit ? 'rgba(244, 63, 94, 0.3)' : (isHigh ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)')}`
                    }}
                  >
                    {evt.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

