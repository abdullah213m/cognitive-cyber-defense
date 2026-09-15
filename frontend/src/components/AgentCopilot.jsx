import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Bot, Send, Sparkles, Terminal, ShieldAlert, Download, CheckCircle2, 
  ArrowRight, BarChart3, LineChart, PieChart, Code2, Cpu, Zap, Key, 
  RefreshCw, FileText, ShieldCheck, Activity, Layers, Database
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SAMPLE_QUESTIONS = [
  "Explain root causes of the 483 Temporal Paradox tampering events and recommended playbooks.",
  "Show the trend of failed login attempts by department over the last 7 days.",
  "Which user has the highest number of failed logins and what are their risk factors?",
  "Which hostname has the maximum threat flags and foreign denied packets?",
  "Compare firewall allow vs deny actions by protocol.",
  "Show daily trend of critical endpoint alerts.",
  "List all terminated employees who still have active activity.",
  "Compare access risk vs endpoint risk correlation."
];

export default function AgentCopilot() {
  const [inputQuery, setInputQuery] = useState(SAMPLE_QUESTIONS[0]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('');
  const [response, setResponse] = useState(null);
  const [showSql, setShowSql] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleAsk = async (queryToAsk) => {
    const q = queryToAsk || inputQuery;
    if (!q) return;

    setIsThinking(true);
    setThinkingStep('Correlating 62,431 multi-vector telemetry events in DuckDB Fact/Dim Store...');
    await new Promise(r => setTimeout(r, 160));
    setThinkingStep('Auto-routing to optimal AI model (Groq 120B / Gemini 3 Flash)...');
    await new Promise(r => setTimeout(r, 200));
    setThinkingStep('Synthesizing executive threat assessment & NIST SP 800-207 mitigation playbook...');

    try {
      const res = await fetch('http://localhost:8000/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          history: chatHistory.map(c => ({ role: c.role, content: c.text }))
        })
      });
      const data = await res.json();
      setResponse(data);

      setChatHistory(prev => [
        ...prev,
        { role: 'user', text: q, timestamp: new Date().toLocaleTimeString() },
        { role: 'assistant', text: data.response || data.summary, provider: data.provider, model: data.model, timestamp: new Date().toLocaleTimeString() }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
      setThinkingStep('');
    }
  };

  const buildChartData = () => {
    if (!response || !response.data || response.data.length === 0) return null;

    const data = response.data;
    const cols = response.columns || Object.keys(data[0]);

    const labelCol = cols.find(c => ['full_name', 'department', 'hostname', 'protocol', 'alert_date', 'event_date', 'severity', 'user_id'].includes(c)) || cols[0];
    const valueCol = cols.find(c => ['failed_logins', 'composite_threat_score', 'threat_flags', 'event_count', 'alert_count', 'count', 'packet_count'].includes(c)) || cols[1] || cols[0];

    const labels = data.map(d => String(d[labelCol] || '').substring(0, 22));
    const values = data.map(d => Number(d[valueCol]) || 0);

    const gradientPalettes = [
      { top: 'rgba(59, 130, 246, 0.90)', bottom: 'rgba(59, 130, 246, 0.15)', border: '#3B82F6' },
      { top: 'rgba(244, 63, 94, 0.90)', bottom: 'rgba(244, 63, 94, 0.15)', border: '#F43F5E' },
      { top: 'rgba(16, 185, 129, 0.90)', bottom: 'rgba(16, 185, 129, 0.15)', border: '#10B981' },
      { top: 'rgba(245, 158, 11, 0.90)', bottom: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B' },
      { top: 'rgba(139, 92, 246, 0.90)', bottom: 'rgba(139, 92, 246, 0.15)', border: '#8B5CF6' },
      { top: 'rgba(6, 182, 212, 0.90)', bottom: 'rgba(6, 182, 212, 0.15)', border: '#06B6D4' },
      { top: 'rgba(249, 115, 22, 0.90)', bottom: 'rgba(249, 115, 22, 0.15)', border: '#F97316' },
      { top: 'rgba(99, 102, 241, 0.90)', bottom: 'rgba(99, 102, 241, 0.15)', border: '#6366F1' }
    ];

    if (response.chart_type === 'line') {
      return {
        labels,
        datasets: [
          {
            label: response.title || 'Telemetry Trend Analysis',
            data: values,
            borderColor: '#3B82F6',
            borderWidth: 2.2,
            backgroundColor: (context) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) return 'rgba(59, 130, 246, 0.12)';
              const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              gradient.addColorStop(0, 'rgba(59, 130, 246, 0.30)');
              gradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.04)');
              gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
              return gradient;
            },
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#3B82F6',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2
          }
        ]
      };
    }

    if (response.chart_type === 'donut') {
      return {
        labels,
        datasets: [
          {
            label: response.title || 'Distribution Breakdown',
            data: values,
            backgroundColor: [
              'rgba(59, 130, 246, 0.85)',
              'rgba(244, 63, 94, 0.85)',
              'rgba(16, 185, 129, 0.85)',
              'rgba(245, 158, 11, 0.85)',
              'rgba(139, 92, 246, 0.85)',
              'rgba(6, 182, 212, 0.85)'
            ],
            borderColor: 'rgba(15, 23, 42, 0.95)',
            borderWidth: 2.5,
            hoverOffset: 6
          }
        ]
      };
    }

    // Classic Pro Bar Chart with Vertical Canvas Gradients & Smooth Rounded Tops
    return {
      labels,
      datasets: [
        {
          label: response.title || 'Security Metric',
          data: values,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return gradientPalettes.map(g => g.top);

            return values.map((_, i) => {
              const pal = gradientPalettes[i % gradientPalettes.length];
              const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              gradient.addColorStop(0, pal.top);
              gradient.addColorStop(1, pal.bottom);
              return gradient;
            });
          },
          borderColor: values.map((_, i) => gradientPalettes[i % gradientPalettes.length].border),
          borderWidth: 1.2,
          borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
          borderSkipped: false,
          barPercentage: 0.48,
          categoryPercentage: 0.70
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: response?.chart_type === 'donut',
        labels: {
          color: '#E2E8F0',
          font: { family: 'Inter', size: 12, weight: '500' },
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.94)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        titleColor: '#FFFFFF',
        bodyColor: '#93C5FD',
        cornerRadius: 8,
        padding: 11,
        titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: '600' },
        bodyFont: { family: 'Inter', size: 12 },
        boxPadding: 6,
        backdropFilter: 'blur(10px)'
      }
    },
    scales: response?.chart_type !== 'donut' ? {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.03)', drawBorder: false },
        ticks: {
          color: '#94A3B8',
          font: { family: 'Inter', size: 11, weight: '500' },
          maxRotation: 20,
          minRotation: 0
        }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)', borderDash: [4, 4], drawBorder: false },
        ticks: {
          color: '#94A3B8',
          font: { family: 'Inter', size: 11 }
        }
      }
    } : {}
  };

  const chartData = buildChartData();

  const handleExportReport = () => {
    if (!response) return;
    const reportMd = `# 🛡️ AgentIQ SOC Incident Forensic Report (${response.provider} / ${response.model})
**Timestamp:** ${new Date().toUTCString()}
**Investigative Query:** "${response.query}"

---

## 📌 Executive Summary & Threat Assessment
${response.response || response.summary}

## 🎯 Recommended Actionable Playbook (NIST SP 800-207)
${response.recommendation}

## 🦆 Vectorized SQL Query Logic
\`\`\`sql
${response.sql}
\`\`\`

## 📊 Correlated Telemetry Records (${response.data?.length || 0} records)
| ${response.columns?.join(' | ') || ''} |
| ${response.columns?.map(() => '---').join(' | ') || ''} |
${(response.data || []).map(row => '| ' + response.columns.map(c => row[c]).join(' | ') + ' |').join('\n')}

---
*Generated autonomously by AgentIQ AI Engine (TransOrg Datathon 2026)*
`;
    const blob = new Blob([reportMd], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AgentIQ_Incident_Report_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header Card */}
      <div className="cyber-panel p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 shadow-[0_2px_12px_rgba(59,130,246,0.2)]">
              <Bot style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold font-display text-white tracking-tight">
                  AgentIQ SOC Copilot
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  Optimal Model Auto-Routed
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Multi-Vector Telemetry Correlation • Auto-Routed 120B / Gemini 3 Flash • NIST SP 800-207 Mitigation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]"></span>
            <span className="text-emerald-400 font-medium">Inference Engine Ready</span>
          </div>
        </div>

        {/* Preset Investigation Questions */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 shrink-0 font-sans font-medium">
            <Sparkles style={{ width: 13, height: 13, color: '#60A5FA' }} /> Quick Presets:
          </span>
          {SAMPLE_QUESTIONS.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setInputQuery(sq);
                handleAsk(sq);
              }}
              className="cyber-tab-btn shrink-0 text-xs"
              style={{ padding: '6px 12px' }}
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-3 pt-1">
          <div className="relative flex-1">
            <Terminal style={{ width: 16, height: 16, color: '#60A5FA', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="Ask any cybersecurity telemetry or threat intelligence question..."
              className="cyber-input font-sans"
              style={{ paddingLeft: 40, fontSize: '0.88rem' }}
            />
          </div>
          <button
            onClick={() => handleAsk()}
            disabled={isThinking || !inputQuery}
            className="cyber-btn cyber-btn-cyan flex items-center gap-2"
            style={{ padding: '9px 22px' }}
          >
            <Send style={{ width: 14, height: 14 }} />
            <span>Analyze Telemetry</span>
          </button>
        </div>

        {/* Thinking Indicator */}
        {isThinking && (
          <div
            className="p-3.5 rounded-xl text-xs font-sans flex items-center gap-3 animate-pulse"
            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', color: '#93C5FD' }}
          >
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">{thinkingStep}</span>
          </div>
        )}
      </div>

      {/* Analytical Response Container */}
      {response && (
        <div className="space-y-6">
          
          {/* Header Summary & Actions */}
          <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-xl border border-white/10 bg-slate-900/80 shadow-lg">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans text-slate-400 font-medium">Inference Engine:</span>
                <span className="text-xs font-sans font-semibold text-blue-400 px-2.5 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30">
                  {response.provider} ({response.model})
                </span>
              </div>
              <h3 className="text-lg font-bold text-white font-display mt-1 tracking-tight">{response.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSql(!showSql)}
                className="cyber-btn-outline px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5"
              >
                <Code2 style={{ width: 14, height: 14 }} />
                <span>{showSql ? 'Hide SQL' : 'Inspect SQL'}</span>
              </button>
              <button
                onClick={handleExportReport}
                className="cyber-btn cyber-btn-cyan px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5"
              >
                <Download style={{ width: 14, height: 14 }} />
                <span>Export Forensic Brief</span>
              </button>
            </div>
          </div>

          {/* SQL Inspector Panel */}
          {showSql && (
            <div className="p-4 rounded-xl border border-blue-500/30 bg-slate-950 font-mono text-xs text-blue-300 overflow-x-auto shadow-inner">
              <div className="text-slate-400 text-xs mb-2 font-medium flex items-center gap-1.5 font-sans">
                <Database style={{ width: 13, height: 13, color: '#60A5FA' }} /> Grounding DuckDB SQL Query:
              </div>
              <pre className="p-3 bg-black/60 rounded-lg border border-white/5 overflow-x-auto text-emerald-400">{response.sql}</pre>
            </div>
          )}

          {/* Visualization Canvas Card */}
          {chartData && (
            <div className="cyber-panel p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <BarChart3 style={{ width: 16, height: 16, color: '#60A5FA' }} />
                  <span className="text-xs font-sans font-semibold text-white">
                    Telemetry Quantitative Distribution
                  </span>
                </div>
                <span className="text-xs font-sans text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/30">
                  {response.data?.length || 0} Entities Correlated
                </span>
              </div>
              <div
                style={{
                  height: 340,
                  position: 'relative'
                }}
              >
                {response.chart_type === 'line' && <Line data={chartData} options={chartOptions} />}
                {response.chart_type === 'donut' && <Doughnut data={chartData} options={chartOptions} />}
                {(response.chart_type === 'bar' || !['line', 'donut'].includes(response.chart_type)) && (
                  <Bar data={chartData} options={chartOptions} />
                )}
              </div>
            </div>
          )}

          {/* Executive Narrative & Zero-Trust Mitigation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Executive Threat Assessment (Full Rich Markdown) */}
            <div className="lg:col-span-8 cyber-panel p-6 space-y-3">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <FileText style={{ width: 18, height: 18, color: '#60A5FA' }} />
                <h4 className="text-sm font-bold font-display text-white tracking-tight">
                  Executive Threat Assessment & Narrative
                </h4>
              </div>
              <div className="pro-markdown pt-1">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {response.response || response.summary}
                </ReactMarkdown>
              </div>
            </div>

            {/* Zero-Trust Actionable Mitigation Playbook */}
            <div className="lg:col-span-4 cyber-panel p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <ShieldCheck style={{ width: 18, height: 18, color: '#10B981' }} />
                <h4 className="text-sm font-bold font-display text-white tracking-tight">
                  Zero-Trust Incident Response
                </h4>
              </div>
              
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-slate-200 text-xs font-sans leading-relaxed space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 style={{ width: 14, height: 14 }} /> NIST SP 800-207 Mandate
                </div>
                <p>{response.recommendation}</p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="text-xs font-sans font-semibold text-slate-300">
                  SOAR Automated Action Triggers:
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5 text-xs font-sans space-y-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>1. Active Token Revocation</span>
                    <span className="text-emerald-400 font-semibold">Ready</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>2. Host EDR Isolation</span>
                    <span className="text-emerald-400 font-semibold">Ready</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>3. Ingress IP Perimeter Block</span>
                    <span className="text-emerald-400 font-semibold">Ready</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

