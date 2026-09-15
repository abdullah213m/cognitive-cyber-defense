import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Terminal, Network, Grid, PlayCircle, Bot, Activity, Clock, FileText, Cpu, User, LogOut, Home } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, breachCount, totalEvents, currentOperator, onOpenLanding }) {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'hud', label: 'Command HUD', icon: Activity },
    { id: 'leaderboard', label: 'Threat Leaderboard', icon: Shield },
    { id: 'topology', label: 'Network Topology', icon: Network },
    { id: 'mitre', label: 'MITRE ATT&CK', icon: Grid },
    { id: 'sandbox', label: 'SOAR Sandbox', icon: PlayCircle },
    { id: 'forensics', label: 'Anti-Tamper Forensics', icon: Clock },
    { id: 'ml', label: 'Pro ML Intelligence', icon: Cpu },
    { id: 'stream', label: 'Live SIEM Stream', icon: Terminal },
    { id: 'report', label: 'CISO Audit Briefing', icon: FileText },
    { id: 'agent', label: 'AgentIQ Copilot', icon: Bot, isBonus: true },
  ];

  return (
    <header className="cyber-header px-6 py-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        
        {/* Left: Brand & Landing Portal Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenLanding}
            title="Return to Landing Page & Portal"
            className="flex items-center justify-center p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 shadow-[0_2px_12px_rgba(59,130,246,0.25)] hover:scale-105 hover:border-blue-400 transition-all"
          >
            <Shield style={{ width: 22, height: 22, color: '#60A5FA' }} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenLanding}
                className="text-lg font-bold font-display text-white tracking-tight hover:text-blue-400 transition-colors text-left"
              >
                AgentIQ Defense Center
              </button>
              <span className="text-[11px] font-sans font-semibold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30">
                Zero-Trust v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans flex items-center gap-2 mt-0.5">
              <span className="pulse-dot"></span>
              <span>Telemetry Ingestion Active • {Number(totalEvents || 62431).toLocaleString()} Packets Processed</span>
            </p>
          </div>
        </div>

        {/* Center: Navigation Bar */}
        <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-white/10 shadow-inner overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`cyber-tab-btn ${isActive ? 'active' : ''}`}
                style={item.isBonus && !isActive ? { borderColor: 'rgba(168, 85, 247, 0.35)', color: '#C084FC' } : {}}
              >
                <Icon style={{ width: 14, height: 14, color: isActive ? '#FFFFFF' : (item.isBonus ? '#A855F7' : '#94A3B8') }} />
                <span>{item.label}</span>
                {item.isBonus && !isActive && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Dual-AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Operator Profile & Status */}
        <div className="flex items-center gap-3 flex-wrap">
          {breachCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 border border-rose-500/40 text-rose-400 shadow-[0_2px_12px_rgba(244,63,94,0.25)]">
              <span className="pulse-dot-red"></span>
              <AlertTriangle style={{ width: 15, height: 15 }} />
              <span>{breachCount} Zero-Trust Breaches</span>
            </div>
          )}

          {/* Authenticated Operator Chip */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-[10px]">
              <User style={{ width: 13, height: 13 }} />
            </div>
            <div className="text-left font-sans">
              <div className="text-white font-bold text-[11px] leading-tight font-mono">
                {currentOperator?.callsign || 'SEC-LEAD-01'}
              </div>
              <div className="text-[10px] text-slate-400 leading-none">
                {currentOperator?.title || 'Lead Incident Commander'}
              </div>
            </div>
            <button
              onClick={onOpenLanding}
              title="Return to Landing Portal / Switch Role"
              className="ml-1 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <LogOut style={{ width: 13, height: 13 }} />
            </button>
          </div>

          <div className="text-right font-sans hidden xl:block">
            <div className="text-xs font-medium text-slate-300">{utcTime}</div>
            <div className="text-xs text-blue-400 font-semibold">Defcon Level 2 (Elevated)</div>
          </div>
        </div>

      </div>
    </header>
  );
}

