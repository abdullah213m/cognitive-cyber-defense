import React from 'react';
import { ShieldAlert, UserX, AlertOctagon, Activity, Lock, Radio } from 'lucide-react';

export default function KpiBar({ kpis }) {
  if (!kpis) return null;

  const cards = [
    {
      title: 'Failed Logins',
      value: kpis.failed_logins?.toLocaleString() || '0',
      subtext: `${kpis.failed_login_rate || 0}% failure rate`,
      icon: Lock,
      color: '#F43F5E',
      glow: 'rgba(244, 63, 94, 0.3)',
      bg: 'rgba(244, 63, 94, 0.08)'
    },
    {
      title: 'Zero-Trust Breaches',
      value: kpis.terminated_active_breaches?.toLocaleString() || '0',
      subtext: 'Terminated users active!',
      icon: UserX,
      color: '#F43F5E',
      glow: 'rgba(244, 63, 94, 0.4)',
      bg: 'rgba(244, 63, 94, 0.12)',
      isBreach: true
    },
    {
      title: 'Critical EDR Alerts',
      value: kpis.critical_edr_alerts?.toLocaleString() || '0',
      subtext: 'Ransomware / Lateral Moves',
      icon: ShieldAlert,
      color: '#F59E0B',
      glow: 'rgba(245, 158, 11, 0.3)',
      bg: 'rgba(245, 158, 11, 0.08)'
    },
    {
      title: 'Firewall Blocks',
      value: kpis.firewall_denied_packets?.toLocaleString() || '0',
      subtext: `${kpis.firewall_deny_rate || 0}% perimeter deny`,
      icon: AlertOctagon,
      color: '#8B5CF6',
      glow: 'rgba(139, 92, 246, 0.3)',
      bg: 'rgba(139, 92, 246, 0.08)'
    },
    {
      title: 'Log Tampering Anomalies',
      value: kpis.temporal_paradox_anomalies?.toLocaleString() || '0',
      subtext: 'Resolved < Detected skew',
      icon: Radio,
      color: '#06B6D4',
      glow: 'rgba(6, 182, 212, 0.3)',
      bg: 'rgba(6, 182, 212, 0.08)'
    },
    {
      title: 'Spoofed IP Packets',
      value: kpis.tampered_ip_packets?.toLocaleString() || '0',
      subtext: 'Corrupted source headers',
      icon: Activity,
      color: '#10B981',
      glow: 'rgba(16, 185, 129, 0.3)',
      bg: 'rgba(16, 185, 129, 0.08)'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`hud-kpi-card ${c.isBreach ? 'alert-breach' : ''}`}
            style={{
              background: `linear-gradient(145deg, ${c.bg} 0%, rgba(15, 23, 42, 0.85) 100%)`,
              borderColor: c.color.replace(')', ', 0.25)'),
            }}
          >
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-sans font-medium text-slate-400 mb-1 sm:mb-2">
              <span className="truncate">{c.title}</span>
              <Icon style={{ width: 14, height: 14, color: c.color, flexShrink: 0 }} />
            </div>
            <div
              className="text-lg sm:text-2xl font-bold font-display tracking-tight text-white mb-0.5 sm:mb-1"
            >
              {c.value}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-sans truncate">
              {c.subtext}
            </div>
            {/* Mini visual accent line */}
            <div
              className="w-full h-1 rounded-full mt-2 sm:mt-2.5"
              style={{ background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: '65%', background: c.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
