import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, Terminal, Network, Grid, PlayCircle, Bot, Activity, 
  Clock, FileText, Cpu, User, LogOut, ChevronRight
} from 'lucide-react';

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
    <header
      style={{
        background: 'rgba(11, 15, 25, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.45)',
        padding: '12px 18px'
      }}
    >
      <div
        style={{
          maxWidth: 1600,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}
      >
        {/* Row 1: Brand, Status, and Operator Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          {/* Brand Logo & Telemetry Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={onOpenLanding}
              title="Return to Landing Portal"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                color: '#60A5FA',
                cursor: 'pointer'
              }}
            >
              <Shield style={{ width: 20, height: 20 }} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={onOpenLanding}
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    letterSpacing: '-0.02em',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    padding: 0
                  }}
                >
                  AgentIQ Defense
                </button>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '5px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#60A5FA',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}
                >
                  Zero-Trust v2.0
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 2
                }}
              >
                <span className="pulse-dot"></span>
                <span>Telemetry Ingestion Active • {Number(totalEvents || 62431).toLocaleString()} Packets Processed</span>
              </div>
            </div>
          </div>

          {/* Right: Breach Badge & Operator Persona */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {breachCount > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  background: 'rgba(244, 63, 94, 0.14)',
                  border: '1px solid rgba(244, 63, 94, 0.45)',
                  color: '#FB7185',
                  boxShadow: '0 2px 12px rgba(244, 63, 94, 0.25)'
                }}
              >
                <span className="pulse-dot-red"></span>
                <AlertTriangle style={{ width: 14, height: 14 }} />
                <span>{breachCount} Breaches</span>
              </div>
            )}

            {/* Operator Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '6px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60A5FA'
                }}
              >
                <User style={{ width: 14, height: 14 }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'monospace', lineHeight: 1.2 }}>
                  {currentOperator?.callsign || 'SEC-LEAD-01'}
                </div>
                <div style={{ fontSize: '0.66rem', color: '#94A3B8', lineHeight: 1.2 }}>
                  {currentOperator?.title || 'Lead Incident Commander'}
                </div>
              </div>
              <button
                onClick={onOpenLanding}
                title="Switch Operator Role"
                style={{
                  marginLeft: 4,
                  padding: '4px',
                  borderRadius: '6px',
                  color: '#94A3B8',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
              >
                <LogOut style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {/* UTC Defcon Status */}
            <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#94A3B8', display: 'none' }} className="desktop-time">
              <div>{utcTime}</div>
              <div style={{ color: '#60A5FA', fontWeight: 600 }}>DEFCON 2 (Elevated)</div>
            </div>
          </div>
        </div>

        {/* Row 2: SINGLE Unified Navigation Tab Bar */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 6px',
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 13px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isActive
                    ? '1px solid #60A5FA'
                    : (item.isBonus ? '1px solid rgba(168, 85, 247, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)'),
                  background: isActive
                    ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                    : (item.isBonus ? 'rgba(168, 85, 247, 0.12)' : 'rgba(30, 41, 59, 0.45)'),
                  color: isActive
                    ? '#FFFFFF'
                    : (item.isBonus ? '#C084FC' : '#94A3B8'),
                  boxShadow: isActive ? '0 2px 10px rgba(59, 130, 246, 0.4)' : 'none',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                <Icon style={{ width: 14, height: 14, color: isActive ? '#FFFFFF' : (item.isBonus ? '#A855F7' : '#94A3B8') }} />
                <span>{item.label}</span>
                {item.isBonus && !isActive && (
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: 'rgba(168, 85, 247, 0.25)',
                      color: '#E9D5FF'
                    }}
                  >
                    Dual-AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
