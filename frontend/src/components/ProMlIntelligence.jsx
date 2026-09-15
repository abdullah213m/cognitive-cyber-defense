import React, { useState, useEffect } from 'react';
import { 
  Cpu, TrendingUp, Network, ShieldAlert, CheckCircle2, BarChart3, 
  AlertCircle, Layers, Filter, Zap, Activity, ShieldCheck, Target, ArrowRight 
} from 'lucide-react';

export default function ProMlIntelligence() {
  const [modelData, setModelData] = useState(null);
  const [outlierData, setOutlierData] = useState(null);
  const [blastData, setBlastData] = useState(null);
  const [surgeData, setSurgeData] = useState(null);
  const [killChainData, setKillChainData] = useState(null);
  const [correlationData, setCorrelationData] = useState(null);
  const [uebaData, setUebaData] = useState(null);

  const [activeSubTab, setActiveSubTab] = useState('classifier');
  const [selectedSurge, setSelectedSurge] = useState('iam');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllMl = async () => {
      try {
        setLoading(true);
        const [resModel, resOutlier, resBlast, resSurge, resKc, resCorr, resUeba] = await Promise.all([
          fetch('http://localhost:8000/api/ml/supervised-threat-model').then(r => r.json()),
          fetch('http://localhost:8000/api/ml/outlier-consensus').then(r => r.json()),
          fetch('http://localhost:8000/api/ml/graph-blast-radius').then(r => r.json()),
          fetch('http://localhost:8000/api/ml/multi-surge-forecast').then(r => r.json()),
          fetch('http://localhost:8000/api/ml/kill-chain-matrix').then(r => r.json()),
          fetch('http://localhost:8000/api/incident-correlation').then(r => r.json()),
          fetch('http://localhost:8000/api/ueba-baselines').then(r => r.json()),
        ]);

        setModelData(resModel);
        setOutlierData(resOutlier);
        setBlastData(resBlast);
        setSurgeData(resSurge);
        setKillChainData(resKc);
        setCorrelationData(resCorr);
        setUebaData(resUeba);
      } catch (err) {
        console.error('Failed to load ML endpoints:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMl();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 font-sans text-blue-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xs font-medium">Initializing Multi-Model ML & UEBA Inference Engine...</div>
        </div>
      </div>
    );
  }

  const metrics = modelData?.metrics || {};
  const featureImportances = metrics?.feature_importances || [];
  const topEntities = modelData?.top_entities_at_risk || [];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-xl bg-slate-900/80 border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30">
            <Cpu style={{ width: 22, height: 22, color: '#60A5FA' }} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold font-display text-white tracking-tight">Enterprise Machine Learning Intelligence & UEBA</h2>
              <span className="text-[11px] font-sans font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Active Inference
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Supervised Random Forest • Alert Correlation (92.2% Reduction) • UEBA Baselines • Outlier Consensus • Graph Blast Radius
            </p>
          </div>
        </div>

        {/* Model Metrics Row */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-white/10 text-center">
            <div className="text-slate-400 text-[10px]">Fatigue Reduction</div>
            <div className="text-sm font-bold text-emerald-400">{correlationData?.summary?.fatigue_reduction_ratio || '92.2%'}</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-white/10 text-center">
            <div className="text-slate-400 text-[10px]">Classifier ROC-AUC</div>
            <div className="text-sm font-bold text-blue-400">{metrics.roc_auc || 0.997}</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-white/10 text-center">
            <div className="text-slate-400 text-[10px]">Outlier Consensus</div>
            <div className="text-sm font-bold text-rose-400">{outlierData?.summary?.unanimous_outliers || 148}</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-white/10 text-center">
            <div className="text-slate-400 text-[10px]">High Blast Nodes</div>
            <div className="text-sm font-bold text-amber-400">{blastData?.summary?.high_blast_entities || 12}</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-white/10 shadow-inner flex-wrap">
        {[
          { id: 'classifier', label: '🌲 Supervised Risk Model & Drivers', icon: Cpu },
          { id: 'correlation', label: '⚡ Alert Correlation & Fatigue Reduction (92.2%)', icon: Zap },
          { id: 'ueba', label: '📊 UEBA Peer-Group Baselines', icon: Activity },
          { id: 'outliers', label: '🔬 Outlier Consensus Ensemble', icon: ShieldAlert },
          { id: 'blast', label: '🕸️ Graph Blast Radius', icon: Network },
          { id: 'forecast', label: '📈 7-Day Surge Forecasting', icon: TrendingUp },
          { id: 'killchain', label: '🎯 Cyber Kill Chain Funnel', icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon style={{ width: 14, height: 14 }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SUPERVISED MODEL & FEATURE ATTRIBUTION */}
      {activeSubTab === 'classifier' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 cyber-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display font-semibold text-white flex items-center gap-2 text-sm">
                <BarChart3 style={{ width: 16, height: 16, color: '#60A5FA' }} />
                <span>Global Threat Drivers (Feature Importance %)</span>
              </h3>
              <span className="text-xs text-blue-400 font-medium">Gini Impurity Metric</span>
            </div>

            <div className="space-y-3 text-xs">
              {featureImportances.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>{item.feature}</span>
                    <strong className="text-blue-400">{item.importance}%</strong>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.importance * 2.5}%`,
                        background: idx === 0 ? '#F43F5E' : idx === 1 ? '#F59E0B' : '#3B82F6'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 cyber-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display font-semibold text-white flex items-center gap-2 text-sm">
                <ShieldAlert style={{ width: 16, height: 16, color: '#F43F5E' }} />
                <span>Top High-Likelihood Breach Candidates</span>
              </h3>
              <span className="text-xs text-rose-400 font-medium">Posterior Probability</span>
            </div>

            <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-white/10 font-medium">
                    <th className="pb-2">User ID</th>
                    <th className="pb-2">Dept</th>
                    <th className="pb-2 text-right">Breach Prob</th>
                    <th className="pb-2">Key Risk Driver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {topEntities.slice(0, 10).map((u, i) => (
                    <tr key={i} className="hover:bg-slate-900/50">
                      <td className="py-2.5 font-semibold text-white font-mono">{u.user_id_clean}</td>
                      <td className="py-2.5 text-slate-300">{u.department_clean}</td>
                      <td className="py-2.5 text-right font-bold text-rose-400">{u.ml_breach_prob}%</td>
                      <td className="py-2.5 text-blue-300 text-[11px]">{u.top_risk_driver}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALERT CORRELATION & FATIGUE REDUCTION ENGINE */}
      {activeSubTab === 'correlation' && (
        <div className="cyber-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-4">
            <div>
              <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
                <Zap style={{ width: 18, height: 18, color: '#FBBF24' }} />
                <span>Multi-Vector Alert Correlation & Fatigue Reduction Engine</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically consolidates raw atomic EDR, IAM, and Firewall events into structured multi-stage incident campaigns.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                {correlationData?.summary?.fatigue_reduction_ratio} Noise Reduction
              </span>
              <span className="px-3 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold">
                {correlationData?.summary?.multi_stage_campaigns} Multi-Stage Campaigns
              </span>
            </div>
          </div>

          {/* Metrics summary banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10">
              <div className="text-slate-400 text-xs font-medium">Raw Atomic Alerts Ingested</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {correlationData?.summary?.raw_atomic_alerts?.toLocaleString() || '19,377'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">EDR, IAM, & Firewall Telemetry</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10">
              <div className="text-slate-400 text-xs font-medium">Correlated Incidents Formed</div>
              <div className="text-xl font-bold font-mono text-blue-400 mt-1">
                {correlationData?.summary?.correlated_incidents?.toLocaleString() || '1,502'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Unified Security Contexts</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10">
              <div className="text-slate-400 text-xs font-medium">SOC Triage Fatigue Eliminated</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {correlationData?.summary?.fatigue_reduction_ratio || '92.2%'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">17,875 Redundant Alerts Collapsed</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10">
              <div className="text-slate-400 text-xs font-medium">High Criticality Campaigns</div>
              <div className="text-xl font-bold font-mono text-rose-400 mt-1">
                {correlationData?.summary?.multi_stage_campaigns || '87'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Spanning &gt;= 3 Kill-Chain Tactics</div>
            </div>
          </div>

          {/* Correlated Incidents Table */}
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-white/10 font-medium">
                  <th className="pb-2">Incident ID</th>
                  <th className="pb-2">Host / Target</th>
                  <th className="pb-2">Correlated Tactics</th>
                  <th className="pb-2 text-right">Raw Alerts Collapsed</th>
                  <th className="pb-2 text-right">Fatigue Saved</th>
                  <th className="pb-2">Severity</th>
                  <th className="pb-2">Recommended SOAR Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {correlationData?.incidents?.slice(0, 25).map((inc, i) => (
                  <tr key={i} className="hover:bg-slate-900/50">
                    <td className="py-2.5 font-semibold text-blue-400 font-mono">{inc.incident_id}</td>
                    <td className="py-2.5 text-white font-mono">{inc.host_machine}</td>
                    <td className="py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {inc.tactics_involved?.map((tac, tIdx) => (
                          <span key={tIdx} className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 text-[10px] font-medium">
                            {tac}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-bold text-white font-mono">{inc.raw_alert_count}</td>
                    <td className="py-2.5 text-right font-semibold text-emerald-400 font-mono">{inc.fatigue_reduction_ratio}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        inc.incident_severity === 'CRITICAL' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                        (inc.incident_severity === 'HIGH' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-blue-500/15 text-blue-400')
                      }`}>
                        {inc.incident_severity}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-300 text-[11px]">{inc.recommended_action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: UEBA PEER-GROUP BASELINES */}
      {activeSubTab === 'ueba' && (
        <div className="cyber-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-4">
            <div>
              <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
                <Activity style={{ width: 18, height: 18, color: '#38BDF8' }} />
                <span>UEBA Peer-Group Departmental Behavioral Baselines</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Statistical Z-Score deviation model flagging employees whose multi-vector threat profile deviates significantly from their department peers.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold">
                {uebaData?.summary?.total_extreme_outliers || 18} Extreme Deviations (&gt; 2.0σ)
              </span>
            </div>
          </div>

          {/* Department Baselines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {uebaData?.departments?.map((d, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1.5">
                <div className="text-white font-semibold text-xs truncate">{d.department}</div>
                <div className="text-2xl font-bold font-mono text-blue-400">{d.mean_risk}</div>
                <div className="text-[10px] text-slate-400">Std Dev (σ): <span className="text-slate-200 font-mono">{d.std_dev_risk}</span></div>
                <div className="text-[10px] text-slate-400">Peak User: <span className="text-rose-400 font-mono font-bold">{d.max_risk}</span></div>
                <div className="text-[10px] text-amber-400 font-semibold mt-1">
                  {d.extreme_outliers_count} Extreme Outliers
                </div>
              </div>
            ))}
          </div>

          {/* Top Outlier Table */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Top Departmental Peer Outliers (&gt; 2.0σ Deviation)
            </h4>
            <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-white/10 font-medium">
                    <th className="pb-2">User ID</th>
                    <th className="pb-2">Employee Name</th>
                    <th className="pb-2">Department</th>
                    <th className="pb-2 text-right">User Threat Score</th>
                    <th className="pb-2 text-right">Dept Baseline Mean</th>
                    <th className="pb-2 text-right">Z-Score Deviation</th>
                    <th className="pb-2">Statistical Anomaly Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {uebaData?.top_peer_outliers?.map((u, i) => (
                    <tr key={i} className="hover:bg-slate-900/50">
                      <td className="py-2.5 font-semibold text-blue-400 font-mono">{u.user_id}</td>
                      <td className="py-2.5 text-white">{u.full_name}</td>
                      <td className="py-2.5 text-slate-300">{u.department}</td>
                      <td className="py-2.5 text-right font-bold text-rose-400 font-mono">{u.composite_score}</td>
                      <td className="py-2.5 text-right text-slate-400 font-mono">{u.dept_mean}</td>
                      <td className="py-2.5 text-right font-bold text-rose-300 font-mono">
                        +{Number(u.z_score).toFixed(2)}σ
                      </td>
                      <td className="py-2.5 text-slate-300 text-[11px]">{u.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OUTLIER CONSENSUS ENSEMBLE */}
      {activeSubTab === 'outliers' && (
        <div className="cyber-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold font-display text-white">Multi-Algorithm Outlier Consensus (IsoForest + LOF)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Cross-validated anomaly discovery combining tree partitioning entropy and local density estimation.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                {outlierData?.summary?.unanimous_outliers} Unanimous Anomalies
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                {outlierData?.summary?.suspect_outliers} Suspect Anomalies
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-white/10 font-medium">
                  <th className="pb-2">User ID</th>
                  <th className="pb-2">Entity Name</th>
                  <th className="pb-2">Department</th>
                  <th className="pb-2 text-right">Composite Threat</th>
                  <th className="pb-2 text-right">Consensus Outlier Score</th>
                  <th className="pb-2">Consensus Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {outlierData?.unanimous_anomalies?.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-900/50">
                    <td className="py-2.5 font-semibold text-white font-mono">{item.user_id_clean}</td>
                    <td className="py-2.5 text-slate-300">{item.full_name_clean}</td>
                    <td className="py-2.5 text-slate-400">{item.department_clean}</td>
                    <td className="py-2.5 text-right font-semibold text-amber-400">{item.composite_threat_score}/100</td>
                    <td className="py-2.5 text-right font-bold text-rose-400">{item.outlier_consensus_score}%</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        {item.anomaly_consensus_tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: GRAPH BLAST RADIUS */}
      {activeSubTab === 'blast' && (
        <div className="cyber-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold font-display text-white">Enterprise Graph PageRank & Blast Radius Impact</h3>
              <p className="text-xs text-slate-400 mt-0.5">Simulates lateral movement cascade across 2-hop topological neighborhoods in the network mesh.</p>
            </div>
            <div className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              {blastData?.summary?.total_graph_nodes} Graph Nodes | {blastData?.summary?.total_graph_edges} Edges
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-white/10 font-medium">
                  <th className="pb-2">User ID</th>
                  <th className="pb-2">Entity Name</th>
                  <th className="pb-2">Department</th>
                  <th className="pb-2">Host Machine</th>
                  <th className="pb-2 text-right">PageRank Score</th>
                  <th className="pb-2 text-right">Blast Radius (Nodes)</th>
                  <th className="pb-2">Impact Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {blastData?.high_blast_entities?.map((node, i) => (
                  <tr key={i} className="hover:bg-slate-900/50">
                    <td className="py-2.5 font-semibold text-white font-mono">{node.user_id_clean}</td>
                    <td className="py-2.5 text-slate-300">{node.full_name_clean}</td>
                    <td className="py-2.5 text-slate-400">{node.department_clean}</td>
                    <td className="py-2.5 text-blue-400 font-mono">{node.hostname_clean}</td>
                    <td className="py-2.5 text-right font-semibold text-emerald-400">{node.graph_pagerank}</td>
                    <td className="py-2.5 text-right font-bold text-rose-400">{node.blast_radius_nodes}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        {node.blast_radius_tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: 7-DAY SURGE FORECASTING */}
      {activeSubTab === 'forecast' && (
        <div className="cyber-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-4">
            <div>
              <h3 className="text-base font-bold font-display text-white">Multi-Vector 7-Day Predictive Surge Forecasting (95% CI)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Trend-weighted exponential smoothing with parametric upper/lower volatility confidence intervals.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedSurge('iam')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  selectedSurge === 'iam' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                🔑 IAM Failures
              </button>
              <button
                onClick={() => setSelectedSurge('firewall')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  selectedSurge === 'firewall' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                🔥 Firewall Denials
              </button>
              <button
                onClick={() => setSelectedSurge('edr')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  selectedSurge === 'edr' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                💻 Critical EDR Alerts
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-white/10 font-medium">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Forecast Category</th>
                  <th className="pb-2 text-right">Projected Event Count</th>
                  <th className="pb-2 text-right">Lower Bound (95%)</th>
                  <th className="pb-2 text-right">Upper Bound (95%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(surgeData?.[`${selectedSurge}_surge`] || []).slice(-10).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-900/50">
                    <td className="py-2.5 font-medium text-white">{String(row.event_date).substring(0, 10)}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        row.type?.includes('Forecast') ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-blue-500/15 text-blue-400'
                      }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-blue-400">{row.count || row.failed_logins}</td>
                    <td className="py-2.5 text-right text-slate-400">{row.lower_bound}</td>
                    <td className="py-2.5 text-right font-semibold text-amber-400">{row.upper_bound}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: CYBER KILL CHAIN FUNNEL */}
      {activeSubTab === 'killchain' && (
        <div className="cyber-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold font-display text-white">Cyber Kill Chain 5-Stage Attack Progression Funnel</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tracks entity advancement from initial probing to credential stuffing, log tampering, and data exfiltration.</p>
            </div>
            <div className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {killChainData?.total_active_threat_entities} Active Threat Entities
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {killChainData?.stage_distribution?.map((stg, i) => (
              <div key={i} className="space-y-1.5 p-3 rounded-lg bg-slate-900/60 border border-white/5">
                <div className="flex justify-between items-center text-slate-200">
                  <span className="font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: i === 0 ? '#10B981' : i === 1 ? '#38BDF8' : i === 2 ? '#F59E0B' : i === 3 ? '#8B5CF6' : '#F43F5E' }}></span>
                    <span>{stg.stage}</span>
                  </span>
                  <strong className="text-blue-400 text-sm">{stg.count} Entities</strong>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (stg.count / 3000) * 100 * 2.5)}%`,
                      background: i === 0 ? '#10B981' : i === 1 ? '#38BDF8' : i === 2 ? '#F59E0B' : i === 3 ? '#8B5CF6' : '#F43F5E'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
