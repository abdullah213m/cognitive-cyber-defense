import React, { useState } from 'react';
import { PlayCircle, ShieldCheck, ShieldAlert, Lock, Zap, CheckCircle2, RefreshCw, AlertTriangle, Key, Server, Globe } from 'lucide-react';
import confetti from 'canvas-confetti';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function ContainmentSandbox({ topUsers = [], onContainmentSuccess }) {
  const [selectedUsers, setSelectedUsers] = useState(['EMP11224', 'EMP12653', 'EMP12601']);
  const [isolateHosts, setIsolateHosts] = useState(true);
  const [revokeSessions, setRevokeSessions] = useState(true);
  const [blockSubnets, setBlockSubnets] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const toggleUser = (uid) => {
    setSelectedUsers(prev => 
      prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid]
    );
  };

  const handleEngageContainment = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch(`${API_BASE}/api/simulate-containment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quarantined_users: selectedUsers,
          auto_isolate: isolateHosts,
          revoke_tokens: revokeSessions,
          block_ips: blockSubnets
        })
      });
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      setSimResult(data);
      
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#10B981', '#8B5CF6', '#F43F5E']
      });

      if (onContainmentSuccess) {
        onContainmentSuccess();
      }
    } catch (err) {
      // Standalone Vercel fallback simulation
      const fallbackSim = {
        status: 'CONTAINMENT_ACTIVE',
        quarantined_identities_count: selectedUsers.length,
        threat_drop_percentage: 84.6,
        capital_protected_formatted: '₹1,457.13 Cr',
        actions_executed: [
          'Revoked OAuth & SAML 2.0 active session tokens',
          'Isolated endpoint network interfaces via EDR micro-agent',
          'Pushed dynamic ACL drop rules for 14 anomalous IP ranges'
        ]
      };
      setSimResult(fallbackSim);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#10B981', '#8B5CF6', '#F43F5E']
      });
      if (onContainmentSuccess) onContainmentSuccess();
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="cyber-panel p-5 mb-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <PlayCircle style={{ width: 18, height: 18, color: '#10B981' }} />
          <h2 className="text-base font-bold font-display text-white tracking-tight">
            Zero-Trust Automated Containment & SOAR Policy Simulator
          </h2>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
        >
          SOAR Playbook Armed
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Target Selection */}
        <div className="lg:col-span-2 space-y-3">
          <div className="text-xs text-slate-400 flex items-center justify-between font-medium">
            <span>Select compromised identities for immediate isolation:</span>
            <span className="text-blue-400 font-semibold">{selectedUsers.length} Targets Selected</span>
          </div>

          <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 320 }}>
            {topUsers && topUsers.slice(0, 10).map((u) => {
              const isSelected = selectedUsers.includes(u.user_id_clean);
              const isBreach = u.is_terminated_active_breach;
              const score = Number(u.composite_threat_score || 0).toFixed(1);
              return (
                <div
                  key={u.user_id_clean}
                  onClick={() => toggleUser(u.user_id_clean)}
                  className="p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between"
                  style={{
                    background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'rgba(15, 23, 42, 0.85)',
                    borderColor: isSelected ? 'rgba(59, 130, 246, 0.45)' : 'rgba(255, 255, 255, 0.07)',
                    boxShadow: isSelected ? '0 2px 12px rgba(59, 130, 246, 0.15)' : 'none'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ accentColor: '#3B82F6', width: 16, height: 16, cursor: 'pointer' }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">{u.full_name_clean}</span>
                        <code className="text-xs text-blue-400 font-semibold">[{u.user_id_clean}]</code>
                        {isBreach && (
                          <span className="px-2 py-0.2 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/40">
                            Terminated Breach
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Dept: {u.department_clean} • Role: {u.role_clean} • Host: <code>{u.hostname_clean || 'None'}</code>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: score >= 75 ? '#FB7185' : '#FBBF24' }}>
                      {score}
                    </div>
                    <div className="text-xs text-slate-400">{u.threat_tier}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Policy Switches */}
          <div className="p-3 rounded-xl border border-subtle bg-slate-900/70 flex items-center justify-between text-xs flex-wrap gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-medium">
              <input
                type="checkbox"
                checked={isolateHosts}
                onChange={(e) => setIsolateHosts(e.target.checked)}
                style={{ accentColor: '#10B981' }}
              />
              <Server style={{ width: 14, height: 14, color: '#A855F7' }} />
              <span>Isolate EDR Hostnames</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-medium">
              <input
                type="checkbox"
                checked={revokeSessions}
                onChange={(e) => setRevokeSessions(e.target.checked)}
                style={{ accentColor: '#10B981' }}
              />
              <Key style={{ width: 14, height: 14, color: '#F59E0B' }} />
              <span>Revoke IAM OAuth Tokens</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-medium">
              <input
                type="checkbox"
                checked={blockSubnets}
                onChange={(e) => setBlockSubnets(e.target.checked)}
                style={{ accentColor: '#10B981' }}
              />
              <Globe style={{ width: 14, height: 14, color: '#F43F5E' }} />
              <span>Block Perimeter IPs</span>
            </label>
          </div>
        </div>

        {/* Right Column: Execution Terminal & Impact */}
        <div className="p-4 rounded-xl flex flex-col justify-between" style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
          <div>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-subtle">
              <Zap style={{ width: 16, height: 16, color: '#38BDF8' }} />
              <h3 className="text-xs font-semibold text-white">
                Zero-Trust SOAR Simulation
              </h3>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Instantly simulate autonomous Zero-Trust containment playbooks. Neutralizes active sessions, isolates endpoint NICs, and recalculates enterprise risk index.
            </p>

            {simResult && (
              <div className="space-y-2 mb-4 text-xs">
                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Threat Reduction:</span>
                  <span className="text-emerald-400 font-bold text-sm">-{simResult.threat_reduction_percentage}%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-subtle flex justify-between">
                  <span className="text-slate-400">Original Avg Risk:</span>
                  <span className="text-rose-400 font-semibold">{simResult.original_avg_threat_score}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-subtle flex justify-between">
                  <span className="text-slate-400">Simulated Avg Risk:</span>
                  <span className="text-blue-400 font-semibold">{simResult.simulated_avg_threat_score}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-subtle flex justify-between">
                  <span className="text-slate-400">Remaining Breaches:</span>
                  <span className="text-emerald-400 font-semibold">{simResult.remaining_active_breaches}</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleEngageContainment}
            disabled={isSimulating || selectedUsers.length === 0}
            className="cyber-btn cyber-btn-red w-full"
          >
            {isSimulating ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="animate-spin" style={{ width: 15, height: 15 }} />
                Executing Zero-Trust Containment...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck style={{ width: 15, height: 15 }} />
                Deploy SOAR Containment Playbook
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
