import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, Terminal, Network, Grid, PlayCircle, Bot, Activity, 
  Clock, FileText, Cpu, User, LogOut, Home, Menu, X, ChevronRight, Zap
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, breachCount, totalEvents, currentOperator, onOpenLanding }) {
  const [utcTime, setUtcTime] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="cyber-header px-3 sm:px-6 py-2.5 sm:py-3">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand & Portal Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onOpenLanding}
            title="Return to Landing Portal"
            className="flex items-center justify-center p-1.5 sm:p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 shadow-[0_2px_12px_rgba(59,130,246,0.25)] hover:scale-105 hover:border-blue-400 transition-all flex-shrink-0"
          >
            <Shield style={{ width: 20, height: 20, color: '#60A5FA' }} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <button
                onClick={onOpenLanding}
                className="text-sm sm:text-lg font-bold font-display text-white tracking-tight hover:text-blue-400 transition-colors text-left truncate"
              >
                AgentIQ Defense
              </button>
              <span className="text-[10px] sm:text-[11px] font-sans font-semibold px-1.5 sm:px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 flex-shrink-0">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans hidden sm:flex items-center gap-2 mt-0.5">
              <span className="pulse-dot"></span>
              <span>Telemetry Active • {Number(totalEvents || 62431).toLocaleString()} Packets Processed</span>
            </p>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-white/10 shadow-inner overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabSelect(item.id)}
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

        {/* Right: Operator Profile & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {breachCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold bg-rose-500/15 border border-rose-500/40 text-rose-400 shadow-[0_2px_12px_rgba(244,63,94,0.25)]">
              <span className="pulse-dot-red"></span>
              <AlertTriangle style={{ width: 13, height: 13 }} />
              <span>{breachCount} <span className="hidden sm:inline">Breaches</span></span>
            </div>
          )}

          {/* Authenticated Operator Chip */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-[10px]">
              <User style={{ width: 12, height: 12 }} />
            </div>
            <div className="text-left font-sans hidden sm:block">
              <div className="text-white font-bold text-[11px] leading-tight font-mono">
                {currentOperator?.callsign || 'SEC-LEAD-01'}
              </div>
              <div className="text-[10px] text-slate-400 leading-none truncate max-w-[110px]">
                {currentOperator?.title || 'Lead Commander'}
              </div>
            </div>
            <button
              onClick={onOpenLanding}
              title="Return to Portal / Switch Role"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <LogOut style={{ width: 13, height: 13 }} />
            </button>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
          </button>

          <div className="text-right font-sans hidden 2xl:block">
            <div className="text-xs font-medium text-slate-300">{utcTime}</div>
            <div className="text-xs text-blue-400 font-semibold">DEFCON 2 (Elevated)</div>
          </div>
        </div>

      </div>

      {/* Mobile Horizontal Scrollable Tab Bar */}
      <div className="lg:hidden mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto touch-scroll-x no-scrollbar pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabSelect(item.id)}
              className={`cyber-tab-btn flex-shrink-0 ${isActive ? 'active' : ''}`}
              style={item.isBonus && !isActive ? { borderColor: 'rgba(168, 85, 247, 0.35)', color: '#C084FC' } : {}}
            >
              <Icon style={{ width: 13, height: 13, color: isActive ? '#FFFFFF' : (item.isBonus ? '#A855F7' : '#94A3B8') }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Dropdown Slide-Out Drawer */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="bg-slate-900 border-t border-cyan-500/30 rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Shield style={{ width: 20, height: 20, color: '#38BDF8' }} />
                <span className="font-bold text-white font-display text-base">SOC Command Modules</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-300"
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabSelect(item.id)}
                    className="p-3 rounded-xl border flex items-center justify-between text-left transition-all"
                    style={{
                      background: isActive ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.25) 100%)' : 'rgba(15, 23, 42, 0.7)',
                      borderColor: isActive ? '#60A5FA' : 'rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: isActive ? '#3B82F6' : 'rgba(255, 255, 255, 0.06)' }}
                      >
                        <Icon style={{ width: 16, height: 16, color: isActive ? '#FFFFFF' : '#94A3B8' }} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{item.label}</div>
                        <div className="text-[10px] text-slate-400">
                          {item.id === 'hud' && 'Perimeter radar & critical threats'}
                          {item.id === 'leaderboard' && '3,000 entities threat ranking'}
                          {item.id === 'topology' && 'Crown jewels & lateral movement'}
                          {item.id === 'mitre' && 'TTP kill-chain matrix'}
                          {item.id === 'sandbox' && 'Zero-Trust automated containment'}
                          {item.id === 'forensics' && 'Clock-skew anti-tamper trees'}
                          {item.id === 'ml' && 'Supervised threat classification'}
                          {item.id === 'stream' && 'Live correlated SIEM packets'}
                          {item.id === 'report' && 'CISO compliance & audit brief'}
                          {item.id === 'agent' && 'Dual LLM text-to-SQL copilot'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight style={{ width: 14, height: 14, color: isActive ? '#38BDF8' : '#64748B' }} />
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Signed in as <strong className="text-white font-mono">{currentOperator?.callsign}</strong>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLanding();
                }}
                className="text-xs text-blue-400 font-semibold flex items-center gap-1"
              >
                <span>Switch Role</span>
                <ChevronRight style={{ width: 12, height: 12 }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
