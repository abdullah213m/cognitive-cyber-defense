import React, { useState, useEffect } from 'react';
import LandingLoginPage from './components/LandingLoginPage';
import Header from './components/Header';
import KpiBar from './components/KpiBar';
import GlobalAttackMap from './components/GlobalAttackMap';
import LeaderboardView from './components/LeaderboardView';
import NetworkTopologyGraph from './components/NetworkTopologyGraph';
import MitreMatrix from './components/MitreMatrix';
import ContainmentSandbox from './components/ContainmentSandbox';
import TelemetryStream from './components/TelemetryStream';
import AgentCopilot from './components/AgentCopilot';
import TemporalForensics from './components/TemporalForensics';
import CisoExecutiveReport from './components/CisoExecutiveReport';
import ProMlIntelligence from './components/ProMlIntelligence';
import { 
  FALLBACK_OVERVIEW, 
  FALLBACK_USERS, 
  FALLBACK_NETWORK_GRAPH, 
  FALLBACK_MITRE, 
  FALLBACK_STREAM 
} from './utils/fallbackData';
import { Shield, AlertTriangle, Activity, Lock, Cpu, Globe, Users, ArrowRight, Server, ShieldCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function App() {
  const [isLandingPage, setIsLandingPage] = useState(true);
  const [currentOperator, setCurrentOperator] = useState({
    title: 'Lead Incident Commander',
    callsign: 'SEC-LEAD-01',
    email: 'lead.commander@soc-defense.org',
    clearance: 'DEFCON 1 • ROOT ACCESS',
    dept: 'Global Threat Response',
    color: '#F43F5E'
  });
  const [activeTab, setActiveTab] = useState('hud');
  const [overview, setOverview] = useState(FALLBACK_OVERVIEW);
  const [users, setUsers] = useState(FALLBACK_USERS);
  const [graphData, setGraphData] = useState(FALLBACK_NETWORK_GRAPH);
  const [mitreData, setMitreData] = useState(FALLBACK_MITRE);
  const [streamEvents, setStreamEvents] = useState(FALLBACK_STREAM.events || []);
  const [loading, setLoading] = useState(true);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const fetchAllData = async () => {
    try {
      const [ovRes, leadRes, graphRes, mitreRes, streamRes] = await Promise.all([
        fetch(`${API_BASE}/api/overview`),
        fetch(`${API_BASE}/api/leaderboard?limit=100`),
        fetch(`${API_BASE}/api/network-graph?max_nodes=60`),
        fetch(`${API_BASE}/api/mitre-matrix`),
        fetch(`${API_BASE}/api/telemetry-stream?limit=40`)
      ]);

      const [ov, lead, graph, mitre, stream] = await Promise.all([
        ovRes.json(),
        leadRes.json(),
        graphRes.json(),
        mitreRes.json(),
        streamRes.json()
      ]);

      setOverview(ov);
      setUsers(lead.users || FALLBACK_USERS);
      setGraphData(graph || FALLBACK_NETWORK_GRAPH);
      setMitreData(mitre || FALLBACK_MITRE);
      setStreamEvents(stream.events || FALLBACK_STREAM.events);
      setIsLiveConnected(true);
    } catch (err) {
      console.warn('Backend API offline or running in standalone Vercel demo mode, loaded internal telemetry:', err);
      setIsLiveConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLaunchPlatform = (tabId = 'hud') => {
    setActiveTab(tabId);
    setIsLandingPage(false);
  };

  const handleLoginSuccess = (operator) => {
    setCurrentOperator(operator);
    if (operator.initialTab) setActiveTab(operator.initialTab);
    setIsLandingPage(false);
  };

  const breachCount = overview?.kpis?.terminated_active_breaches || 0;

  if (isLandingPage) {
    return (
      <LandingLoginPage
        onLaunchPlatform={handleLaunchPlatform}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg-void)' }}>
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        breachCount={breachCount}
        totalEvents={overview?.kpis?.total_events || 62431}
        currentOperator={currentOperator}
        onOpenLanding={() => setIsLandingPage(true)}
      />


      <main className="flex-1 w-full mx-auto p-6 space-y-6" style={{ maxWidth: 1600 }}>
        {/* Zero-Trust Breach Alert Bar (if breach detected) */}
        {breachCount > 0 && (
          <div
            className="p-4 rounded-xl flex items-center justify-between flex-wrap gap-4 text-xs"
            style={{
              background: 'linear-gradient(90deg, rgba(244, 63, 94, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              boxShadow: '0 8px 24px -6px rgba(244, 63, 94, 0.2)'
            }}
          >
            <div className="flex items-center gap-3">
              <span className="pulse-dot-red"></span>
              <AlertTriangle style={{ width: 18, height: 18, color: '#F43F5E' }} />
              <div>
                <span className="text-white font-bold text-sm">Zero-Trust Deprovisioning Violation: </span>
                <span className="text-slate-300">
                  {breachCount} offboarded / terminated employee identities are generating active network and IAM telemetry.
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('sandbox')}
              className="cyber-btn cyber-btn-red px-3.5 py-1.5 text-xs rounded-lg flex items-center gap-1.5 font-medium"
            >
              <span>Engage SOAR Containment</span>
              <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        )}

        {/* Top KPI Metric Bar */}
        <KpiBar kpis={overview?.kpis} />

        {/* Tab 1: Global Command HUD */}
        {activeTab === 'hud' && (
          <div className="space-y-6">
            {/* Global Attack Map */}
            <GlobalAttackMap
              deniedPackets={overview?.kpis?.firewall_denied_packets || 6572}
              totalBytes={35894120000}
            />

            {/* Middle Grid: Top Threats & Department Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leaderboard Snippet */}
              <div className="cyber-panel p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Shield style={{ width: 16, height: 16, color: '#F43F5E' }} /> Top Critical Insider Threat Entities
                  </h3>
                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-medium"
                  >
                    <span>View All 3,000 Entities</span>
                    <ArrowRight style={{ width: 12, height: 12 }} />
                  </button>
                </div>
                <div className="space-y-2.5 text-xs">
                  {users.slice(0, 5).map((u, i) => {
                    const score = Number(u.composite_threat_score || 0).toFixed(1);
                    return (
                      <div
                        key={u.user_id_clean || i}
                        onClick={() => setActiveTab('leaderboard')}
                        className="p-3.5 rounded-lg border border-white/5 flex items-center justify-between cursor-pointer hover:border-blue-500/40 transition-all"
                        style={{ background: 'rgba(15, 23, 42, 0.65)' }}
                      >
                        <div className="flex items-center gap-3.5">
                          <span className="text-slate-400 font-semibold text-xs font-mono">#{i + 1}</span>
                          <div>
                            <div className="text-white font-bold">{u.full_name_clean}</div>
                            <div className="text-slate-400 text-xs">{u.department_clean} • <span className="font-mono text-slate-300">{u.user_id_clean}</span></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold font-mono" style={{ color: score >= 75 ? '#F43F5E' : '#F59E0B' }}>
                            {score}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">{u.threat_tier}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Department Risk Aggregation */}
              <div className="cyber-panel p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity style={{ width: 16, height: 16, color: '#3B82F6' }} /> Corporate Department Risk Concentration
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">Composite Threat Index</span>
                </div>
                <div className="space-y-3.5 text-xs">
                  {overview?.department_threats?.slice(0, 5).map((dept, i) => {
                    const avgScore = Number(dept.avg_score || 0).toFixed(1);
                    return (
                      <div key={i} className="p-3.5 rounded-lg border border-white/5 bg-slate-900/60">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold">{dept.department_clean}</span>
                          <span className="font-bold text-blue-400 font-mono">{avgScore} / 100</span>
                        </div>
                        <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.06)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, avgScore)}%`,
                              background: avgScore >= 60 ? '#F43F5E' : (avgScore >= 45 ? '#F59E0B' : '#3B82F6')
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Threat Leaderboard */}
        {activeTab === 'leaderboard' && (
          <LeaderboardView users={users} />
        )}

        {/* Tab 3: Network Topology */}
        {activeTab === 'topology' && (
          <NetworkTopologyGraph graphData={graphData} />
        )}

        {/* Tab 4: MITRE ATT&CK */}
        {activeTab === 'mitre' && (
          <MitreMatrix mitreData={mitreData} />
        )}

        {/* Tab 5: Containment Sandbox */}
        {activeTab === 'sandbox' && (
          <ContainmentSandbox topUsers={users} onContainmentSuccess={fetchAllData} />
        )}

        {/* Tab 6: Anti-Tamper Forensics */}
        {activeTab === 'forensics' && (
          <TemporalForensics />
        )}

        {/* Tab 7: Pro ML Intelligence */}
        {activeTab === 'ml' && (
          <ProMlIntelligence />
        )}

        {/* Tab 8: Live SIEM Stream */}
        {activeTab === 'stream' && (
          <TelemetryStream events={streamEvents} onRefresh={fetchAllData} />
        )}

        {/* Tab 9: CISO Executive Audit Briefing */}
        {activeTab === 'report' && (
          <CisoExecutiveReport overview={overview} />
        )}

        {/* Tab 10: AI Copilot */}
        {activeTab === 'agent' && (
          <AgentCopilot />
        )}
      </main>

      {/* Classic Footer */}
      <footer className="border-t border-white/5 py-4 px-6 text-center text-xs text-slate-400 flex items-center justify-between flex-wrap gap-3" style={{ background: 'rgba(11, 15, 25, 0.95)' }}>
        <div>
          <strong className="text-slate-200">AgentIQ Cyber Defense Platform</strong> • TransOrg Datathon 2026
        </div>
        <div className="text-blue-400 font-medium">
          Zero-Trust SIEM • DuckDB Star Schema • FastAPI & React 18
        </div>
      </footer>
    </div>
  );
}

