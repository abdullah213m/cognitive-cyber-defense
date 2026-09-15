import React, { useState } from 'react';
import { 
  Shield, Search, Filter, AlertTriangle, UserCheck, UserX, ChevronRight, X, 
  Activity, Server, Lock, Terminal, ShieldAlert, Download, TrendingUp, TrendingDown, 
  DollarSign, BarChart2, Layers
} from 'lucide-react';

function MiniSparkline({ data = [], color = '#38BDF8', width = 70, height = 22 }) {
  if (!data || data.length < 2) return <span className="text-slate-500 text-xs font-mono">--</span>;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 6) + 3;
    const y = height - 3 - ((val - min) / range) * (height - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const lastX = width - 3;
  const lastY = height - 3 - ((data[data.length - 1] - min) / range) * (height - 8);

  return (
    <svg width={width} height={height} className="overflow-visible inline-block align-middle">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <circle
        cx={lastX}
        cy={lastY}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

export default function LeaderboardView({ users = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [breachOnly, setBreachOnly] = useState(false);
  const [inspectedUser, setInspectedUser] = useState(null);
  const [userDossier, setUserDossier] = useState(null);
  const [loadingDossier, setLoadingDossier] = useState(false);
  const [dossierTab, setDossierTab] = useState('overview');

  const departments = ['ALL', ...Array.from(new Set(users.map(u => u.department_clean).filter(Boolean)))];

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchTerm || 
      String(u.full_name_clean || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      String(u.user_id_clean || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(u.hostname_clean || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || u.department_clean === selectedDept;
    const matchesTier = selectedTier === 'ALL' || u.threat_tier === selectedTier;
    const matchesBreach = !breachOnly || u.is_terminated_active_breach;
    return matchesSearch && matchesDept && matchesTier && matchesBreach;
  });

  const handleInspect = async (u) => {
    setInspectedUser(u);
    setLoadingDossier(true);
    try {
      const res = await fetch(`http://localhost:8000/api/user/${u.user_id_clean}`);
      const data = await res.json();
      setUserDossier(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDossier(false);
    }
  };

  const handleExportCsv = () => {
    window.open('http://localhost:8000/api/leaderboard/export-csv', '_blank');
  };

  const getTierBadge = (tier) => {
    if (tier === 'CRITICAL') return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold badge-tier-critical">Critical</span>;
    if (tier === 'HIGH') return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold badge-tier-high">High</span>;
    if (tier === 'MEDIUM') return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold badge-tier-medium">Medium</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold badge-tier-low">Low</span>;
  };

  const getVelocityBadge = (user) => {
    const status = user.risk_velocity_status || '';
    const pts = user.risk_velocity_pts || 0;
    if (status.includes('SURGING') || pts >= 15) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <TrendingUp style={{ width: 11, height: 11 }} />
          +{pts.toFixed(1)} pts
        </span>
      );
    }
    if (status.includes('ACCELERATING') || pts > 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <TrendingUp style={{ width: 11, height: 11 }} />
          +{pts.toFixed(1)} pts
        </span>
      );
    }
    if (status.includes('DECELERATING') || pts < -3) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <TrendingDown style={{ width: 11, height: 11 }} />
          {pts.toFixed(1)} pts
        </span>
      );
    }
    return (
      <span className="text-slate-500 text-[11px] font-mono">
        STABLE
      </span>
    );
  };

  const getUebaBadge = (user) => {
    const z = Number(user.ueba_z_score || 0);
    const reason = user.ueba_reason || `${z >= 0 ? '+' : ''}${z.toFixed(2)}σ vs ${user.department_clean} baseline`;
    if (z >= 2.0) {
      return (
        <span 
          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-help"
          title={reason}
        >
          +{z.toFixed(2)}σ
        </span>
      );
    }
    if (z >= 1.0) {
      return (
        <span 
          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 cursor-help"
          title={reason}
        >
          +{z.toFixed(2)}σ
        </span>
      );
    }
    return (
      <span 
        className="text-slate-400 text-[11px] font-mono cursor-help"
        title={reason}
      >
        {z >= 0 ? `+${z.toFixed(2)}σ` : `${z.toFixed(2)}σ`}
      </span>
    );
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Search & Filter Bar */}
      <div className="cyber-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1" style={{ minWidth: 280 }}>
          <div className="relative w-full">
            <Search style={{ width: 15, height: 15, color: '#94A3B8', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by Employee Name, ID (EMP#####), or Hostname..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cyber-input"
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs flex-wrap">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="cyber-select"
          >
            {departments.map(d => (
              <option key={d} value={d}>{d === 'ALL' ? 'All Departments' : d}</option>
            ))}
          </select>

          {/* Tier Filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="cyber-select"
          >
            <option value="ALL">All Threat Tiers</option>
            <option value="CRITICAL">Critical (&gt;= 75)</option>
            <option value="HIGH">High (50 - 74)</option>
            <option value="MEDIUM">Medium (25 - 49)</option>
            <option value="LOW">Low (&lt; 25)</option>
          </select>

          {/* Breach Only Toggle */}
          <label
            className="flex items-center gap-2 cursor-pointer font-medium px-3 py-2 rounded-lg transition-colors"
            style={{
              background: breachOnly ? 'rgba(244,63,94,0.18)' : 'rgba(30,41,59,0.5)',
              border: `1px solid ${breachOnly ? 'rgba(244,63,94,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: breachOnly ? '#FB7185' : '#E2E8F0'
            }}
          >
            <input
              type="checkbox"
              checked={breachOnly}
              onChange={(e) => setBreachOnly(e.target.checked)}
              style={{ accentColor: '#F43F5E', cursor: 'pointer' }}
            />
            <span>Terminated Active Breaches</span>
          </label>

          {/* Export Watchlist CSV Button */}
          <button
            onClick={handleExportCsv}
            className="cyber-btn px-3.5 py-2 rounded-lg flex items-center gap-1.5 font-semibold text-xs shadow-md"
            title="Download full forensic watchlist CSV report"
          >
            <Download style={{ width: 14, height: 14 }} />
            <span>Export Watchlist (CSV)</span>
          </button>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="cyber-panel p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <span>Matched Identities: <strong className="text-white font-semibold">{filteredUsers.length.toLocaleString()}</strong> of {users.length.toLocaleString()}</span>
          <span>Click any row to inspect 360° Forensic Dossier</span>
        </div>

        <div className="overflow-x-auto" style={{ maxHeight: 560 }}>
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Risk Rank</th>
                <th>Employee Identity</th>
                <th>User ID</th>
                <th>Department & Role</th>
                <th>Composite Score</th>
                <th>7-Day Trajectory</th>
                <th>Velocity</th>
                <th>UEBA Peer Dev (Z)</th>
                <th>Financial Exposure</th>
                <th>Threat Tier</th>
                <th>Zero-Trust Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.slice(0, 100).map((u, i) => {
                const score = Number(u.composite_threat_score || 0).toFixed(1);
                const isBreach = u.is_terminated_active_breach;
                const isSelected = inspectedUser?.user_id_clean === u.user_id_clean;
                const sparkColor = score >= 75 ? '#F43F5E' : (score >= 50 ? '#F59E0B' : '#38BDF8');
                return (
                  <tr
                    key={u.user_id_clean || i}
                    onClick={() => handleInspect(u)}
                    style={isSelected ? { background: 'rgba(59, 130, 246, 0.12)', borderLeft: '3px solid #3B82F6' } : {}}
                  >
                    <td>
                      <span className="font-sans font-medium text-slate-400">#{i + 1}</span>
                    </td>
                    <td>
                      <div className="font-semibold text-white text-sm">{u.full_name_clean}</div>
                      <div className="text-xs text-slate-400">{u.username_clean || 'N/A'}</div>
                    </td>
                    <td>
                      <code className="text-blue-400 font-semibold text-xs">{u.user_id_clean}</code>
                    </td>
                    <td>
                      <div className="text-white text-xs font-medium">{u.department_clean}</div>
                      <div className="text-slate-400 text-xs">{u.role_clean}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold text-sm"
                          style={{
                            color: score >= 75 ? '#FB7185' : (score >= 50 ? '#FBBF24' : (score >= 25 ? '#38BDF8' : '#34D399'))
                          }}
                        >
                          {score}
                        </span>
                        <div style={{ width: 45, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(100, score)}%`,
                              height: '100%',
                              background: score >= 75 ? '#F43F5E' : (score >= 50 ? '#F59E0B' : '#10B981')
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    {/* 7-Day Trajectory Sparkline */}
                    <td>
                      <MiniSparkline data={u.risk_sparkline || [score, score]} color={sparkColor} />
                    </td>
                    {/* Velocity Badge */}
                    <td>
                      {getVelocityBadge(u)}
                    </td>
                    {/* UEBA Peer Z-Score */}
                    <td>
                      {getUebaBadge(u)}
                    </td>
                    {/* Financial Exposure INR */}
                    <td>
                      <span className="font-semibold text-xs text-amber-300 font-mono">
                        {u.financial_exposure_formatted || '₹0'}
                      </span>
                    </td>
                    <td>{getTierBadge(u.threat_tier)}</td>
                    <td>
                      {isBreach ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/40">
                          Terminated Breach
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                          <UserCheck style={{ width: 13, height: 13, color: '#10B981' }} /> Active OK
                        </span>
                      )}
                    </td>
                    <td>
                      <button className="cyber-btn-outline px-2.5 py-1 rounded-md text-xs flex items-center gap-1">
                        <span>Inspect</span>
                        <ChevronRight style={{ width: 12, height: 12 }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 360° Forensic Dossier Slide-Over Drawer */}
      {inspectedUser && (
        <div className="cyber-drawer-backdrop" onClick={() => setInspectedUser(null)}>
          <div className="cyber-drawer-panel font-sans" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-subtle">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30">
                  <Shield style={{ width: 22, height: 22, color: '#60A5FA' }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-display text-white">{inspectedUser.full_name_clean}</h2>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <code className="text-blue-400 font-semibold">{inspectedUser.user_id_clean}</code>
                    <span>•</span>
                    <span>{inspectedUser.department_clean}</span>
                    <span>•</span>
                    <span>{inspectedUser.role_clean}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectedUser(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {/* Risk Score Summary Banner */}
            <div
              className="p-4 rounded-xl mb-4"
              style={{
                background: inspectedUser.composite_threat_score >= 75 ? 'rgba(244,63,94,0.1)' : 'rgba(59,130,246,0.08)',
                border: `1px solid ${inspectedUser.composite_threat_score >= 75 ? 'rgba(244,63,94,0.35)' : 'rgba(59,130,246,0.3)'}`
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">Composite Threat Score</span>
                {getTierBadge(inspectedUser.threat_tier)}
              </div>
              <div className="text-3xl font-bold font-display text-white mb-2">
                {Number(inspectedUser.composite_threat_score || 0).toFixed(1)} <span className="text-sm font-normal text-slate-400">/ 100.0</span>
              </div>
              {inspectedUser.is_terminated_active_breach && (
                <div className="text-xs text-rose-400 font-semibold flex items-center gap-2 p-2 rounded-lg bg-rose-500/15 border border-rose-500/30">
                  <AlertTriangle style={{ width: 14, height: 14 }} />
                  Critical: Terminated employee active telemetry detected!
                </div>
              )}
            </div>

            {/* UEBA & Financial Impact Summary Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                  <Activity style={{ width: 12, height: 12, color: '#38BDF8' }} />
                  <span>UEBA Peer Deviation</span>
                </div>
                <div className="text-base font-bold text-white font-mono">
                  {inspectedUser.ueba_z_score ? `+${Number(inspectedUser.ueba_z_score).toFixed(2)}σ` : '+0.00σ'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate" title={inspectedUser.ueba_reason}>
                  {inspectedUser.ueba_reason || `Dept mean: ${inspectedUser.dept_mean_risk || 24.0}`}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                  <DollarSign style={{ width: 12, height: 12, color: '#FBBF24' }} />
                  <span>Financial Breach Risk</span>
                </div>
                <div className="text-base font-bold text-amber-300 font-mono">
                  {inspectedUser.financial_exposure_formatted || '₹0'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  DPDP & IP Loss Liability
                </div>
              </div>
            </div>

            {/* Vector Breakdown Gauges */}
            <div className="cyber-panel p-4 mb-4">
              <h3 className="text-xs font-semibold text-white tracking-wide mb-3">
                Multi-Vector Risk Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Identity Risk (30%)', score: userDossier?.radar_scores?.['Identity Risk'] ?? inspectedUser.identity_risk_score, color: '#F43F5E' },
                  { name: 'Access / IAM Risk (25%)', score: userDossier?.radar_scores?.['Access Risk'] ?? inspectedUser.access_risk_score, color: '#F59E0B' },
                  { name: 'Endpoint EDR Risk (25%)', score: userDossier?.radar_scores?.['Endpoint Risk'] ?? inspectedUser.endpoint_risk_score, color: '#8B5CF6' },
                  { name: 'Network / FW Risk (20%)', score: userDossier?.radar_scores?.['Network Risk'] ?? inspectedUser.network_risk_score, color: '#06B6D4' }
                ].map((vec, idx) => {
                  const s = Number(vec.score || 0).toFixed(1);
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">{vec.name}</span>
                        <span className="font-semibold" style={{ color: vec.color }}>{s}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, s)}%`, background: vec.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dossier Tabs */}
            <div className="flex items-center gap-2 mb-3 border-b border-subtle pb-2 flex-wrap">
              <button
                onClick={() => setDossierTab('overview')}
                className={`cyber-tab-btn ${dossierTab === 'overview' ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                Profile & Forensics
              </button>
              <button
                onClick={() => setDossierTab('iam')}
                className={`cyber-tab-btn ${dossierTab === 'iam' ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                IAM Logs ({userDossier?.iam_logs?.length || 0})
              </button>
              <button
                onClick={() => setDossierTab('edr')}
                className={`cyber-tab-btn ${dossierTab === 'edr' ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                EDR Alerts ({userDossier?.edr_alerts?.length || 0})
              </button>
              <button
                onClick={() => setDossierTab('fw')}
                className={`cyber-tab-btn ${dossierTab === 'fw' ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                Firewall ({userDossier?.firewall_events?.length || 0})
              </button>
            </div>

            {/* Tab Contents */}
            {loadingDossier ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Fetching real-time forensic telemetry...
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 280 }}>
                {dossierTab === 'overview' && (
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-subtle flex justify-between">
                      <span className="text-slate-400">Assigned Hostname:</span>
                      <span className="text-white font-semibold">{inspectedUser.hostname_clean || 'None'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-subtle flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="text-white font-semibold">{inspectedUser.location || 'HQ Office'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-subtle flex justify-between">
                      <span className="text-slate-400">Hire Date:</span>
                      <span className="text-white font-semibold">{inspectedUser.hire_date_clean || 'N/A'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-subtle flex justify-between">
                      <span className="text-slate-400">Termination Date:</span>
                      <span className={inspectedUser.termination_date_clean ? "text-rose-400 font-semibold" : "text-white"}>
                        {inspectedUser.termination_date_clean || 'Active Employee'}
                      </span>
                    </div>
                    {/* 7-Day Velocity Breakdown */}
                    {inspectedUser.risk_sparkline && (
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-subtle">
                        <div className="text-slate-400 mb-1">7-Day Trajectory Readings:</div>
                        <div className="flex justify-between font-mono text-[11px] text-blue-300">
                          {inspectedUser.risk_sparkline.map((pt, idx) => (
                            <span key={idx}>d{idx+1}: {Number(pt).toFixed(1)}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {dossierTab === 'iam' && (
                  <div>
                    {userDossier?.iam_logs?.length === 0 ? (
                      <div className="text-slate-400 text-xs p-4 text-center">No recent IAM audit events.</div>
                    ) : (
                      userDossier?.iam_logs?.map((log, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg mb-1.5 bg-slate-900/60 border border-subtle text-xs flex justify-between items-center">
                          <div>
                            <div className="text-white font-semibold">{log.event_type_clean}</div>
                            <div className="text-slate-400 text-xs">{log.timestamp_clean} • MFA: {String(log.mfa_passed_clean)}</div>
                          </div>
                          <span className={log.is_failed_login ? "text-rose-400 font-semibold" : "text-emerald-400 font-medium"}>
                            {log.is_failed_login ? 'Failed' : 'Success'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {dossierTab === 'edr' && (
                  <div>
                    {userDossier?.edr_alerts?.length === 0 ? (
                      <div className="text-slate-400 text-xs p-4 text-center">No EDR endpoint alerts recorded.</div>
                    ) : (
                      userDossier?.edr_alerts?.map((alert, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg mb-1.5 bg-slate-900/60 border border-subtle text-xs flex justify-between items-center">
                          <div>
                            <div className="text-white font-semibold">{alert.alert_type_clean}</div>
                            <div className="text-slate-400 text-xs">{alert.detected_timestamp_clean} • {alert.hostname_clean}</div>
                          </div>
                          <span className="text-rose-400 font-semibold text-xs">{alert.severity_clean}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {dossierTab === 'fw' && (
                  <div>
                    {userDossier?.firewall_events?.length === 0 ? (
                      <div className="text-slate-400 text-xs p-4 text-center">No firewall logs for assigned host.</div>
                    ) : (
                      userDossier?.firewall_events?.map((fw, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg mb-1.5 bg-slate-900/60 border border-subtle text-xs flex justify-between items-center">
                          <div>
                            <div className="text-white font-semibold">{fw.protocol_clean} &#8594; {fw.dst_ip_clean}:{fw.dst_port_clean}</div>
                            <div className="text-slate-400 text-xs">{fw.timestamp_clean}</div>
                          </div>
                          <span className={fw.action_clean === 'DENY' ? "text-rose-400 font-semibold" : "text-emerald-400 font-medium"}>
                            {fw.action_clean}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
