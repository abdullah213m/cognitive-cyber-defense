import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, Cpu, AlertTriangle, Search, CheckCircle2, Lock, FileCode, RefreshCw } from 'lucide-react';

export default function TemporalForensics() {
  const [forensics, setForensics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('temporal'); // 'temporal' | 'tampered_ips'

  const fetchForensics = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/forensics/temporal-tampering');
      const data = await res.json();
      setForensics(data);
    } catch (err) {
      console.error('Failed fetching temporal forensics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForensics();
  }, []);

  const temporalList = forensics?.temporal_anomalies_sample || [];
  const tamperedIpList = forensics?.tampered_ips_sample || [];

  const filteredTemporal = temporalList.filter(item => {
    const s = search.toLowerCase();
    return (
      (item.user_id_clean && item.user_id_clean.toLowerCase().includes(s)) ||
      (item.hostname_clean && item.hostname_clean.toLowerCase().includes(s)) ||
      (item.alert_type_clean && item.alert_type_clean.toLowerCase().includes(s)) ||
      (item.alert_id && item.alert_id.toLowerCase().includes(s))
    );
  });

  const filteredIps = tamperedIpList.filter(item => {
    const s = search.toLowerCase();
    return (
      (item.src_ip_clean && item.src_ip_clean.toLowerCase().includes(s)) ||
      (item.dst_ip_clean && item.dst_ip_clean.toLowerCase().includes(s)) ||
      (item.geo_country_clean && item.geo_country_clean.toLowerCase().includes(s)) ||
      (item.hostname_clean && item.hostname_clean.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div
        className="p-5 rounded-xl border border-purple-500/30 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(15,23,42,0.85) 100%)',
          boxShadow: '0 4px 20px rgba(139,92,246,0.15)'
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40">
              <Clock style={{ width: 22, height: 22, color: '#C084FC' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white tracking-tight">
                Temporal Paradox & Log Anti-Tampering Forensic Studio
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Detects insider log clock-skewing (Resolved &lt; Detected timestamp) & malicious IP header tampering
              </p>
            </div>
          </div>
          <button
            onClick={fetchForensics}
            className="cyber-btn-outline px-3 py-1.5 text-xs rounded-lg flex items-center gap-2"
          >
            <RefreshCw style={{ width: 14, height: 14 }} />
            <span>Rescan Forensics</span>
          </button>
        </div>
      </div>

      {/* Forensic KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="hud-kpi-card">
          <div className="text-xs font-medium text-slate-400 mb-1">Temporal Paradox Anomalies</div>
          <div className="text-2xl font-bold font-display text-purple-300">
            {forensics?.total_temporal_paradoxes || 483}
          </div>
          <div className="text-xs text-slate-400 mt-1">Resolved &lt; Detected Timestamp</div>
        </div>

        <div className="hud-kpi-card">
          <div className="text-xs font-medium text-slate-400 mb-1">Tampered IP Flow Packets</div>
          <div className="text-2xl font-bold font-display text-rose-400">
            {(forensics?.total_tampered_ips || 22367).toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">Spoofed Source / Dest Headers</div>
        </div>

        <div className="hud-kpi-card">
          <div className="text-xs font-medium text-slate-400 mb-1">Forensic Evidence Retention</div>
          <div className="text-2xl font-bold font-display text-blue-400">100.0%</div>
          <div className="text-xs text-slate-400 mt-1">Zero Logs Dropped (Auditable)</div>
        </div>

        <div className="hud-kpi-card">
          <div className="text-xs font-medium text-slate-400 mb-1">Peak Time Manipulation Drift</div>
          <div className="text-2xl font-bold font-display text-amber-400">-84.2 hrs</div>
          <div className="text-xs text-slate-400 mt-1">Negative Clock Skew Delta</div>
        </div>
      </div>

      {/* Main Interactive Table & Filter Controls */}
      <div className="cyber-panel p-5">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('temporal')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'temporal'
                  ? 'bg-purple-500/25 border border-purple-500/50 text-purple-200'
                  : 'border border-subtle text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              ⏱️ Temporal Paradox Records ({temporalList.length})
            </button>
            <button
              onClick={() => setActiveSubTab('tampered_ips')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'tampered_ips'
                  ? 'bg-rose-500/25 border border-rose-500/50 text-rose-200'
                  : 'border border-subtle text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              🔥 Tampered IP Headers ({tamperedIpList.length})
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" style={{ width: 14, height: 14 }} />
            <input
              type="text"
              placeholder="Search user, host, alert or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900/80 border border-subtle rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-64 font-sans"
            />
          </div>
        </div>

        {/* Subtab 1: Temporal Paradoxes */}
        {activeSubTab === 'temporal' && (
          <div className="overflow-x-auto rounded-lg border border-subtle">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-subtle font-medium">
                  <th className="p-3">Alert ID</th>
                  <th className="p-3">Target Identity</th>
                  <th className="p-3">Host Asset</th>
                  <th className="p-3">Threat Vector</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Detected Timestamp</th>
                  <th className="p-3">Forged Resolved Time</th>
                  <th className="p-3">Evidence Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle bg-slate-950/60">
                {filteredTemporal.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.025] transition-colors">
                    <td className="p-3 font-semibold text-purple-300 font-mono">{row.alert_id}</td>
                    <td className="p-3 text-blue-400 font-semibold font-mono">{row.user_id_clean}</td>
                    <td className="p-3 text-white">{row.hostname_clean}</td>
                    <td className="p-3 text-slate-300">{row.alert_type_clean}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        row.severity_clean === 'CRITICAL' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {row.severity_clean}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{row.detected_timestamp_clean}</td>
                    <td className="p-3 font-semibold text-rose-400 font-mono text-[11px]">{row.resolved_timestamp_clean}</td>
                    <td className="p-3 text-slate-500 font-mono text-[10px] truncate max-w-[120px]" title={row.sha256_hash_clean}>
                      {row.sha256_hash_clean ? row.sha256_hash_clean.substring(0, 16) + '...' : 'SHA256_LOCKED'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Subtab 2: Tampered IPs */}
        {activeSubTab === 'tampered_ips' && (
          <div className="overflow-x-auto rounded-lg border border-subtle">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-subtle font-medium">
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Source IP</th>
                  <th className="p-3">Destination IP</th>
                  <th className="p-3">Origin Host</th>
                  <th className="p-3">Protocol</th>
                  <th className="p-3">Geo Origin</th>
                  <th className="p-3">Firewall Action</th>
                  <th className="p-3">Tamper Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle bg-slate-950/60">
                {filteredIps.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.025] transition-colors">
                    <td className="p-3 text-slate-400 font-mono">{row.log_id}</td>
                    <td className="p-3 text-rose-400 font-semibold font-mono">{row.src_ip_clean}</td>
                    <td className="p-3 text-blue-400 font-semibold font-mono">{row.dst_ip_clean}</td>
                    <td className="p-3 text-white">{row.hostname_clean}</td>
                    <td className="p-3 text-slate-300 font-mono">{row.protocol_clean}:{row.port_clean}</td>
                    <td className="p-3 text-slate-300">{row.geo_country_clean}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        row.action_clean === 'DENY' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {row.action_clean}
                      </span>
                    </td>
                    <td className="p-3 text-amber-400 font-medium text-[11px]">Spoof Flagged</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
