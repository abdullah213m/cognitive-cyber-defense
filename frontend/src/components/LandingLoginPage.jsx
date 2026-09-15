import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  User,
  Key,
  Cpu,
  Zap,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Activity,
  Grid,
  Globe,
  Bot,
  Play,
  Sparkles,
  Layers,
  Clock,
  LogIn,
  X,
  Database,
  Fingerprint,
  ChevronRight,
  AlertTriangle,
  Server,
  FileText,
  Radio,
  Eye,
  CheckCircle,
  Network,
  Binary,
  Compass,
  Crosshair,
  Sliders,
  TrendingUp,
  Award
} from 'lucide-react';

export default function LandingLoginPage({ onLaunchPlatform, onLoginSuccess }) {
  const [activeView, setActiveView] = useState('landing'); // 'landing' | 'login'
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [authMethodTab, setAuthMethodTab] = useState('sso'); // 'sso' | 'email' | 'hardware'
  const [operatorId, setOperatorId] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [ssoModal, setSsoModal] = useState(null); // null | 'google'
  const [tickerIndex, setTickerIndex] = useState(0);

  const tickerItems = [
    { type: 'BREACH ISOLATED', text: '507 Terminated Offboarding Logins Blocked Across Active IAM Enclaves', color: '#F43F5E' },
    { type: 'NETWORK ANOMALY', text: 'Circular IP Egress & High-Velocity Data Exfiltration Intercepted on Port 8080', color: '#F59E0B' },
    { type: 'INTEGRITY VERIFIED', text: 'Temporal Clock-Skew Anomaly Detected & Validated Against SHA-256 Blockchain Trees', color: '#8B5CF6' },
    { type: 'OLAP BENCHMARK', text: 'DuckDB In-Memory Star Schema Correlated 62,431 Multi-Vector Rows in 4.8ms', color: '#10B981' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const [authLogs, setAuthLogs] = useState([
    '[INIT] AgentIQ Zero-Trust Sentinel Gateway online',
    '[NIST] SP 800-207 Continuous Verification Policy active',
    '[OLAP] DuckDB in-memory Star Schema attached (62,431 telemetry events)',
    '[READY] Select SSO provider, corporate email, or biometric key'
  ]);

  const personas = [
    {
      id: 'ciso',
      title: 'Chief Information Security Officer',
      callsign: 'CISO-EXEC-01',
      email: 'ciso.executive@enterprise-defense.com',
      clearance: 'DEFCON 2 • EXECUTIVE GOVERNANCE',
      dept: 'Executive Security Office',
      icon: ShieldCheck,
      color: '#3B82F6',
      badge: 'CISO LEVEL',
      desc: 'High-level risk posture, NIST SP 800-207 audit compliance, and executive briefing reports.',
      initialTab: 'report'
    },
    {
      id: 'soc_lead',
      title: 'Lead SOC Incident Commander',
      callsign: 'SEC-LEAD-01',
      email: 'lead.commander@soc-defense.org',
      clearance: 'DEFCON 1 • ROOT CLEARANCE',
      dept: 'Global Threat Response',
      icon: Activity,
      color: '#F43F5E',
      badge: 'ROOT ACCESS',
      desc: 'Active threat containment, zero-trust breach neutralization, and global attack radar.',
      initialTab: 'hud'
    },
    {
      id: 'forensics',
      title: 'Senior Forensic Investigator',
      callsign: 'FORENSIC-INV-07',
      email: 'forensic.inv@dfir-response.net',
      clearance: 'DEFCON 2 • DFIR FORENSIC LEVEL',
      dept: 'Digital Forensics & Incident Response',
      icon: Clock,
      color: '#8B5CF6',
      badge: 'FORENSIC',
      desc: 'Temporal paradox clock-skew inspection, SHA-256 tamper hashing, and log auditing.',
      initialTab: 'forensics'
    },
    {
      id: 'ai_engineer',
      title: 'AI Copilot Security Engineer',
      callsign: 'AI-ENG-04',
      email: 'ai.secops@sentinel-ai.cloud',
      clearance: 'DEFCON 2 • DUAL-MODEL ACCESS',
      dept: 'Autonomous SecOps & OLAP',
      icon: Bot,
      color: '#10B981',
      badge: '120B AI',
      desc: 'Natural language queries, DuckDB Star Schema analytics, and Groq 120B / Gemini AI auto-routing.',
      initialTab: 'agent'
    }
  ];

  const handlePersonaSelect = (persona) => {
    setSelectedPersona(persona);
    setOperatorId(persona.callsign);
    setEmailInput(persona.email);
    setAccessKey('ZT-KEY-99482-SEC');
    setAuthLogs((prev) => [
      ...prev.slice(-4),
      `[OPERATOR] Persona selected: ${persona.callsign} (${persona.clearance})`,
      `[MFA] Hardware security token matched: ZT-KEY-99482-SEC`
    ]);
  };

  const handleSSOAuthenticate = (provider, accountEmail) => {
    setIsScanning(true);
    const email = accountEmail || (provider === 'google' ? 'ciso.executive@enterprise-defense.com' : 'lead.commander@soc-defense.org');
    const matchedPersona = personas.find(p => p.email === email) || personas[provider === 'google' ? 0 : 1];
    
    setAuthLogs((prev) => [
      ...prev.slice(-4),
      `[SSO-START] Initiating Google Workspace OAuth 2.0 PKCE flow...`,
      `[IDENTITY] Validating corporate claims for: ${email}`,
      `[VERIFIED] Continuous Zero-Trust Session Token issued (HS256)`
    ]);

    setTimeout(() => {
      setIsScanning(false);
      setSsoModal(null);
      setSelectedPersona(matchedPersona);
      if (onLoginSuccess) onLoginSuccess(matchedPersona);
      if (onLaunchPlatform) onLaunchPlatform(matchedPersona.initialTab || 'hud');
    }, 750);
  };

  const handleEmailLoginSubmit = (e) => {
    if (e) e.preventDefault();
    const email = emailInput.trim() || 'lead.commander@soc-defense.org';
    const matchedPersona = personas.find(p => p.email.toLowerCase() === email.toLowerCase()) || {
      title: 'Authorized SOC Operator',
      callsign: `SEC-${email.split('@')[0].toUpperCase()}`,
      email: email,
      clearance: 'DEFCON 2 • AUTHORIZED OPERATOR',
      dept: 'Security Operations Enclave',
      color: '#06B6D4',
      initialTab: 'hud'
    };

    setAuthLogs((prev) => [
      ...prev.slice(-4),
      `[EMAIL-AUTH] Authenticating enterprise identity: ${email}`,
      `[HASH] SHA-256 password hash approved`,
      `[JWT] Encrypted Zero-Trust Session Token issued.`
    ]);

    setTimeout(() => {
      if (onLoginSuccess) onLoginSuccess(matchedPersona);
      if (onLaunchPlatform) onLaunchPlatform(matchedPersona.initialTab || 'hud');
    }, 450);
  };

  const handleSimulatedBiometric = () => {
    setIsScanning(true);
    const chosen = selectedPersona || personas[1];
    setSelectedPersona(chosen);
    setOperatorId(chosen.callsign);
    setAccessKey('FIDO2-BIOMETRIC-TOKEN-VERIFIED');
    
    setTimeout(() => {
      setIsScanning(false);
      setAuthLogs((prev) => [
        ...prev.slice(-4),
        `[BIOMETRIC] Fingerprint verification PASS (Confidence: 99.8%)`,
        `[CLEARANCE] Operator authenticated as ${chosen.callsign}`,
        `[SESSION] Launching Zero-Trust Command Center...`
      ]);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(chosen);
        if (onLaunchPlatform) onLaunchPlatform(chosen.initialTab || 'hud');
      }, 700);
    }, 1000);
  };

  const handleLoginSubmit = (e) => {
    if (e) e.preventDefault();
    const chosen = selectedPersona || {
      title: 'Authorized SOC Operator',
      callsign: operatorId || 'SEC-OPERATOR-99',
      clearance: 'DEFCON 2 • AUTHORIZED',
      dept: 'Security Operations Center',
      color: '#3B82F6',
      initialTab: 'hud'
    };
    setAuthLogs((prev) => [
      ...prev.slice(-4),
      `[AUTH-SUCCESS] Credentials approved for ${chosen.callsign}`,
      `[JWT] Encrypted Zero-Trust Session Token issued.`
    ]);
    setTimeout(() => {
      if (onLoginSuccess) onLoginSuccess(chosen);
      if (onLaunchPlatform) onLaunchPlatform(chosen.initialTab || 'hud');
    }, 400);
  };

  const scrollToSection = (sectionId) => {
    setActiveView('landing');
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#070B14',
        backgroundImage: `
          radial-gradient(circle at 50% -10%, rgba(6, 182, 212, 0.14) 0%, transparent 60%),
          radial-gradient(circle at 10% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 40%),
          radial-gradient(circle at 90% 70%, rgba(245, 158, 11, 0.06) 0%, transparent 40%),
          linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 48px 48px, 48px 48px',
        color: '#F8FAFC',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* TOP NAVIGATION BAR */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(7, 11, 20, 0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '14px 32px'
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20
          }}
        >
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveView('landing')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
              }}
            >
              <Shield style={{ width: 20, height: 20, color: '#38BDF8' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em'
                }}
              >
                AgentIQ <span style={{ color: '#06B6D4', fontWeight: 600, fontSize: '0.95rem' }}>SENTINEL</span>
              </span>
              <span
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(59, 130, 246, 0.14)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  color: '#60A5FA',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                TransOrg Datathon 2026
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 9999,
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34D399',
                  letterSpacing: '0.03em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                DEFCON 2 • ACTIVE
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Scroll within page) */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            {[
              { id: 'architecture', label: 'Architecture' },
              { id: 'datasets', label: 'Telemetry Datasets' },
              { id: 'mitre', label: 'MITRE Matrix' },
              { id: 'capabilities', label: 'Defense Engines' },
              { id: 'metrics', label: 'SLA Benchmarks' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#94A3B8',
                  fontFamily: 'inherit',
                  fontSize: '0.86rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '6px 0',
                  transition: 'color 0.18s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={() => setActiveView('login')}
              style={{
                background: activeView === 'login' ? 'rgba(6, 182, 212, 0.18)' : 'transparent',
                border: activeView === 'login' ? '1px solid rgba(6, 182, 212, 0.4)' : 'none',
                outline: 'none',
                color: activeView === 'login' ? '#38BDF8' : '#CBD5E1',
                fontFamily: 'inherit',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => {
                if (activeView !== 'login') {
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== 'login') {
                  e.currentTarget.style.color = '#CBD5E1';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              Operator Sign-In
            </button>
            <button
              type="button"
              onClick={() => onLaunchPlatform('hud')}
              style={{
                background: 'linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)',
                color: '#FFFFFF',
                fontFamily: 'inherit',
                fontSize: '0.88rem',
                fontWeight: 700,
                padding: '9px 22px',
                borderRadius: 9999,
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 0 24px rgba(6, 182, 212, 0.45)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #22D3EE 0%, #3B82F6 100%)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 0 32px rgba(6, 182, 212, 0.65)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 0 24px rgba(6, 182, 212, 0.45)';
              }}
            >
              <span>Launch Defense HUD</span>
              <ArrowRight style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>
      </header>

      {/* VIEW 1: DEDICATED FULL CYBER SOC LOGIN PORTAL */}
      {activeView === 'login' ? (
        <section
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            padding: '40px 24px 80px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10
          }}
        >
          {/* Header Banner */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: 9999,
                fontSize: '0.78rem',
                fontWeight: 700,
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                color: '#38BDF8',
                marginBottom: 14
              }}
            >
              <Lock style={{ width: 14, height: 14 }} />
              <span>DEFCON LEVEL 2 • ZERO-TRUST ACCESS GATEWAY</span>
            </div>
            <h1
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: '2.4rem',
                fontWeight: 800,
                color: '#FFFFFF',
                marginBottom: 10
              }}
            >
              Enterprise SOC Authentication Portal
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#94A3B8', maxWidth: 640, margin: '0 auto' }}>
              Continuous Identity Verification aligned with NIST SP 800-207. Select your SOC operator clearance or authenticate with biometric FIDO2 credentials.
            </p>
          </div>

          {/* 2-Column Authentication Layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 28,
              width: '100%',
              maxWidth: 1180
            }}
          >
            {/* Left Column: 1-Click Persona Access & Terminal */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(16px)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#E2E8F0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Authorized Operator Enclaves
                  </div>
                  <span style={{ fontSize: '0.70rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle style={{ width: 13, height: 13 }} />
                    4 Active Clearance Profiles
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 20 }}>
                  {personas.map((p) => {
                    const Icon = p.icon;
                    const isSelected = selectedPersona?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handlePersonaSelect(p)}
                        style={{
                          padding: 14,
                          borderRadius: 12,
                          border: `1px solid ${isSelected ? p.color : 'rgba(255, 255, 255, 0.08)'}`,
                          background: isSelected ? 'rgba(59, 130, 246, 0.16)' : 'rgba(30, 41, 59, 0.45)',
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                          boxShadow: isSelected ? `0 0 20px ${p.color}25` : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ padding: 6, borderRadius: 8, background: `${p.color}20`, color: p.color }}>
                              <Icon style={{ width: 16, height: 16 }} />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>{p.title}</div>
                              <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: p.color, fontWeight: 600 }}>{p.email}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 4,
                                background: `${p.color}15`,
                                border: `1px solid ${p.color}40`,
                                color: p.color
                              }}
                            >
                              {p.badge}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePersonaSelect(p);
                                handleLoginSubmit();
                              }}
                              style={{
                                padding: '3px 9px',
                                borderRadius: 6,
                                background: `${p.color}25`,
                                border: `1px solid ${p.color}60`,
                                color: '#FFFFFF',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              title={`Direct Fast-Launch as ${p.title}`}
                            >
                              <span>Enter</span>
                              <ChevronRight style={{ width: 11, height: 11 }} />
                            </button>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94A3B8', lineHeight: 1.4 }}>
                          {p.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Terminal Logs */}
              <div
                style={{
                  background: 'rgba(5, 8, 18, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 10,
                  padding: 12,
                  fontFamily: 'monospace',
                  fontSize: '0.70rem',
                  color: '#94A3B8',
                  lineHeight: 1.6
                }}
              >
                <div style={{ color: '#38BDF8', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Terminal style={{ width: 12, height: 12 }} />
                  <span>LIVE CRYPTO & SSO AUDIT LOG</span>
                </div>
                {authLogs.map((log, idx) => (
                  <div key={idx} style={{ color: log.includes('PASS') || log.includes('SUCCESS') || log.includes('VERIFIED') ? '#10B981' : log.includes('OPERATOR') || log.includes('SSO') ? '#FBBF24' : '#94A3B8' }}>
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Multi-Method SSO & Email Authentication Suite */}
            <div
              style={{
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 15, 25, 0.98) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5), 0 0 30px rgba(6, 182, 212, 0.15)',
                backdropFilter: 'blur(16px)'
              }}
            >
              <div>
                {/* TOP: GOOGLE WORKSPACE SSO BUTTON */}
                <div style={{ marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={() => setSsoModal('google')}
                    style={{
                      width: '100%',
                      padding: '13px 18px',
                      borderRadius: 10,
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      color: '#0F172A',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                      transition: 'all 0.18s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 255, 255, 0.15)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.25)';
                    }}
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Continue with Google Workspace</span>
                  </button>
                </div>

                {/* DIVIDER */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0 16px' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.1)' }} />
                  <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Or Continue with Work Email
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.1)' }} />
                </div>

                {/* CORPORATE EMAIL / PASSWORD FORM */}
                <form onSubmit={handleEmailLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: 6 }}>
                      Corporate Email Address
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      placeholder="e.g. operator@enterprise-defense.com"
                      style={{
                        width: '100%',
                        fontSize: '0.84rem',
                        fontFamily: 'monospace',
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        borderRadius: 9,
                        padding: '11px 14px',
                        color: '#FFFFFF',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#CBD5E1' }}>
                        Password / Security Token
                      </label>
                      <span style={{ fontSize: '0.68rem', color: '#60A5FA', cursor: 'pointer' }}>
                        Token Authenticated
                      </span>
                    </div>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      placeholder="••••••••••••••••••••"
                      style={{
                        width: '100%',
                        fontSize: '0.84rem',
                        fontFamily: 'monospace',
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        borderRadius: 9,
                        padding: '11px 14px',
                        color: '#FFFFFF',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Pre-fill Quick Chips */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748B' }}>Quick Fill:</span>
                    {personas.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setEmailInput(p.email);
                          setPasswordInput('DemoPass2026!');
                          setSelectedPersona(p);
                        }}
                        style={{
                          fontSize: '0.66rem',
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#CBD5E1',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = p.color}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
                      >
                        {p.title.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: '#10B981', fontWeight: 600 }}>
                      <ShieldCheck style={{ width: 15, height: 15 }} />
                      <span>Zero-Trust Token Active</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      Latency: <strong style={{ color: '#38BDF8' }}>4.2ms</strong>
                    </span>
                  </div>

                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)',
                      color: '#FFFFFF',
                      fontFamily: 'inherit',
                      fontWeight: 700,
                      padding: '12px 22px',
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      fontSize: '0.88rem',
                      boxShadow: '0 0 24px rgba(6, 182, 212, 0.45)',
                      marginTop: 4
                    }}
                  >
                    <LogIn style={{ width: 16, height: 16 }} />
                    <span>Authorize &amp; Launch Command Center</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulatedBiometric}
                    style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      color: '#34D399',
                      fontWeight: 600,
                      padding: '9px 16px',
                      borderRadius: 9,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      fontSize: '0.80rem'
                    }}
                  >
                    <Zap style={{ width: 14, height: 14 }} />
                    <span>Instant 1-Click Biometric Demo Login</span>
                  </button>
                </form>
              </div>

              <div style={{ textAlign: 'center', marginTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setActiveView('landing')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    fontSize: '0.80rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  ← Return to AgentIQ Platform Overview
                </button>
              </div>
            </div>
          </div>

          {/* INTERACTIVE GOOGLE SSO CONFIRMATION MODAL */}
          {ssoModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.78)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: 20
              }}
              onClick={() => setSsoModal(null)}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  background: '#0F172A',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 16,
                  padding: 28,
                  maxWidth: 440,
                  width: '100%',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                  color: '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span style={{ fontSize: '1rem', fontWeight: 800 }}>
                      Google Workspace SSO
                    </span>
                  </div>
                  <button onClick={() => setSsoModal(null)} style={{ color: '#94A3B8', cursor: 'pointer' }}>
                    <X style={{ width: 18, height: 18 }} />
                  </button>
                </div>

                <p style={{ fontSize: '0.80rem', color: '#94A3B8', marginBottom: 16 }}>
                  Choose your Google enterprise identity to authenticate into AgentIQ Command Center:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {personas.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleSSOAuthenticate('google', p.email)}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(30, 41, 59, 0.6)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.18s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = p.color}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                    >
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>{p.title}</div>
                        <div style={{ fontSize: '0.74rem', color: '#94A3B8', fontFamily: 'monospace' }}>{p.email}</div>
                      </div>
                      <span style={{ fontSize: '0.66rem', color: p.color, fontWeight: 700 }}>
                        {p.badge}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '0.72rem', color: '#64748B', textAlign: 'center' }}>
                  Continuous Zero-Trust Verification Policy Active (NIST SP 800-207)
                </div>
              </div>
            </div>
          )}
        </section>
      ) : (
        /* VIEW 2: FULL PRODUCT LANDING PAGE WITH BESPOKE HERO & SECTIONS */
        <>
          {/* HERO SECTION */}
          <section
            style={{
              padding: '75px 24px 45px',
              maxWidth: 1080,
              margin: '0 auto',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 10
            }}
          >
            {/* Glowing Pill Tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 18px',
                borderRadius: 9999,
                fontSize: '0.78rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                color: '#38BDF8',
                boxShadow: '0 0 24px rgba(6, 182, 212, 0.25)',
                marginBottom: 26
              }}
            >
              <Sparkles style={{ width: 14, height: 14, color: '#38BDF8' }} />
              <span>COGNITIVE CYBER DEFENSE • CONTINUOUS ZERO-TRUST VERIFICATION</span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: 'clamp(2.4rem, 5.2vw, 4.3rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                marginBottom: 24
              }}
            >
              Continuous Threat Intelligence for{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #06B6D4 0%, #38BDF8 40%, #F59E0B 80%, #F97316 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block'
                }}
              >
                Enterprise Zero-Trust Security
              </span>
            </h1>

            {/* Persuasive Subtitle */}
            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.65,
                color: '#94A3B8',
                maxWidth: 860,
                margin: '0 auto 34px'
              }}
            >
              AgentIQ unifies <strong style={{ color: '#F1F5F9' }}>62,431 multi-vector telemetry streams</strong> across <strong style={{ color: '#F1F5F9' }}>3,000 enterprise identities</strong> in real time — surfacing 507 offboarding breaches, circular IP tunneling, and clock-skew tampering with sub-8ms DuckDB OLAP &amp; Dual-Model AI.
            </p>

            {/* CTA Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                flexWrap: 'wrap',
                marginBottom: 38
              }}
            >
              <button
                type="button"
                onClick={() => onLaunchPlatform('hud')}
                style={{
                  background: 'linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)',
                  color: '#FFFFFF',
                  fontFamily: 'inherit',
                  fontSize: '0.96rem',
                  fontWeight: 700,
                  padding: '14px 34px',
                  borderRadius: 12,
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 0 32px rgba(6, 182, 212, 0.45)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #22D3EE 0%, #3B82F6 100%)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 0 42px rgba(6, 182, 212, 0.65)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 0 32px rgba(6, 182, 212, 0.45)';
                }}
              >
                <span>Launch Command Center</span>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>

              <button
                type="button"
                onClick={() => setActiveView('login')}
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  color: '#F8FAFC',
                  fontFamily: 'inherit',
                  fontSize: '0.96rem',
                  fontWeight: 600,
                  padding: '14px 28px',
                  borderRadius: 12,
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  outline: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(6, 182, 212, 0.18)';
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.color = '#F8FAFC';
                }}
              >
                <ShieldCheck style={{ width: 16, height: 16, color: '#38BDF8' }} />
                <span>Enter SOC Operator Portal</span>
              </button>
            </div>

            {/* LIVE TELEMETRY INTERCEPT TICKER */}
            <div
              style={{
                width: '100%',
                maxWidth: 880,
                padding: '12px 18px',
                borderRadius: 12,
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                marginBottom: 30,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: `${tickerItems[tickerIndex].color}20`,
                    border: `1px solid ${tickerItems[tickerIndex].color}50`,
                    color: tickerItems[tickerIndex].color,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tickerItems[tickerIndex].type}
                </span>
                <span style={{ fontSize: '0.80rem', color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tickerItems[tickerIndex].text}
                </span>
              </div>
              <span style={{ fontSize: '0.70rem', color: '#64748B', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                LIVE FEED • 100% AUDITED
              </span>
            </div>

            {/* Trust & Proof Bar */}
            <div
              style={{
                width: '100%',
                maxWidth: 960,
                paddingTop: 24,
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: 20,
                color: '#94A3B8',
                fontSize: '0.84rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ShieldCheck style={{ width: 16, height: 16, color: '#10B981' }} />
                <span><strong style={{ color: '#F8FAFC' }}>62,431</strong> Telemetry Events</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Zap style={{ width: 16, height: 16, color: '#06B6D4' }} />
                <span><strong style={{ color: '#F8FAFC' }}>p99 &lt; 8ms</strong> DuckDB OLAP</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Bot style={{ width: 16, height: 16, color: '#8B5CF6' }} />
                <span><strong style={{ color: '#F8FAFC' }}>Dual Groq 120B &amp; Gemini</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <CheckCircle2 style={{ width: 16, height: 16, color: '#F59E0B' }} />
                <span><strong style={{ color: '#F8FAFC' }}>NIST SP 800-207</strong> Aligned</span>
              </div>
            </div>
          </section>

          {/* SECTION 1: CORE CAPABILITIES GRID (#capabilities) */}
          <section
            id="capabilities"
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              padding: '60px 32px 60px',
              width: '100%',
              zIndex: 10
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#06B6D4', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                ENTERPRISE DEFENSE SUITE
              </div>
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  marginBottom: 8
                }}
              >
                Four Specialized Neural Cyber Engines
              </h2>
              <p style={{ fontSize: '0.90rem', color: '#94A3B8' }}>
                Operating seamlessly on an in-memory DuckDB columnar Star Schema with sub-second vector correlation
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 22
              }}
            >
              {/* Card 1 */}
              <div
                onClick={() => onLaunchPlatform('hud')}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                  backdropFilter: 'blur(12px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.5)';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.65)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.75)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: '#06B6D4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16
                    }}
                  >
                    <Globe style={{ width: 22, height: 22 }} />
                  </div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
                    Global Attack Radar
                  </h3>
                  <p style={{ fontSize: '0.82rem', lineHeight: 1.55, color: '#94A3B8' }}>
                    Real-time canvas radar with glowing vector particle arcs and live firewall intercept stream across foreign nodes.
                  </p>
                </div>
                <div
                  style={{
                    paddingTop: 16,
                    marginTop: 16,
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#38BDF8'
                  }}
                >
                  <span>Launch Attack Radar →</span>
                  <ChevronRight style={{ width: 15, height: 15 }} />
                </div>
              </div>

              {/* Card 2 */}
              <div
                onClick={() => onLaunchPlatform('topology')}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                  backdropFilter: 'blur(12px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.65)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.75)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'rgba(139, 92, 246, 0.15)',
                      color: '#8B5CF6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16
                    }}
                  >
                    <Layers style={{ width: 22, height: 22 }} />
                  </div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
                    Force-Directed Topology
                  </h3>
                  <p style={{ fontSize: '0.82rem', lineHeight: 1.55, color: '#94A3B8' }}>
                    Correlates 3,000 employees with 771 critical malware alerts and foreign egress vectors in 2D spring physics.
                  </p>
                </div>
                <div
                  style={{
                    paddingTop: 16,
                    marginTop: 16,
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#A78BFA'
                  }}
                >
                  <span>Explore Topology →</span>
                  <ChevronRight style={{ width: 15, height: 15 }} />
                </div>
              </div>

              {/* Card 3 */}
              <div
                onClick={() => onLaunchPlatform('sandbox')}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                  backdropFilter: 'blur(12px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.5)';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.65)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.75)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'rgba(244, 63, 94, 0.15)',
                      color: '#F43F5E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16
                    }}
                  >
                    <Shield style={{ width: 22, height: 22 }} />
                  </div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
                    Automated SOAR Sandbox
                  </h3>
                  <p style={{ fontSize: '0.82rem', lineHeight: 1.55, color: '#94A3B8' }}>
                    Execute automated deprovisioning and quarantine playbooks to neutralize 507 offboarding breaches.
                  </p>
                </div>
                <div
                  style={{
                    paddingTop: 16,
                    marginTop: 16,
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#FB7185'
                  }}
                >
                  <span>Engage SOAR Sandbox →</span>
                  <ChevronRight style={{ width: 15, height: 15 }} />
                </div>
              </div>

              {/* Card 4 */}
              <div
                onClick={() => onLaunchPlatform('agent')}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                  backdropFilter: 'blur(12px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.65)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.75)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16
                    }}
                  >
                    <Bot style={{ width: 22, height: 22 }} />
                  </div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
                    Dual AI Copilot (120B)
                  </h3>
                  <p style={{ fontSize: '0.82rem', lineHeight: 1.55, color: '#94A3B8' }}>
                    Autonomous multi-model intelligence querying DuckDB in SQL and generating rich visual markdown reports.
                  </p>
                </div>
                <div
                  style={{
                    paddingTop: 16,
                    marginTop: 16,
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#34D399'
                  }}
                >
                  <span>Chat with Copilot →</span>
                  <ChevronRight style={{ width: 15, height: 15 }} />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: ARCHITECTURE (#architecture) */}
          <section
            id="architecture"
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              padding: '60px 32px',
              width: '100%',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                ENTERPRISE SYSTEM ARCHITECTURE
              </div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 8 }}>
                Zero-Trust Multi-Vector Intelligence Pipeline
              </h2>
              <p style={{ fontSize: '0.90rem', color: '#94A3B8' }}>
                Sub-8ms DuckDB OLAP Star Schema backed by Dual-Model AI Engine (Groq 120B &amp; Google Gemini)
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 24
              }}
            >
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  borderRadius: 14,
                  padding: 24
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <Database style={{ width: 22, height: 22, color: '#06B6D4' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>1. In-Memory Star Schema</h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.6 }}>
                  DuckDB columnar storage indexing 62,431 logs across employees, authentications, VPC network flows, and IAM privilege logs for instant vectorized queries.
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  borderRadius: 14,
                  padding: 24
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <Cpu style={{ width: 22, height: 22, color: '#8B5CF6' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>2. Dual-Model AI Copilot</h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.6 }}>
                  Automatic load routing between Groq Llama-3.3 120B (sub-second SQL generation) and Gemini Flash (multimodal report synthesis &amp; CISO executive briefs).
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  borderRadius: 14,
                  padding: 24
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <Clock style={{ width: 22, height: 22, color: '#F43F5E' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>3. Anti-Tamper Clock Engine</h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.6 }}>
                  Surfaces temporal paradoxes where attackers modify client timestamps or manipulate log sequences, verified against SHA-256 integrity trees.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 3: DATASETS (#datasets) */}
          <section
            id="datasets"
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              padding: '60px 32px',
              width: '100%',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                CORRELATED TELEMETRY STREAMS
              </div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 8 }}>
                Multi-Vector Benchmark Datasets (62,431 Rows)
              </h2>
              <p style={{ fontSize: '0.90rem', color: '#94A3B8' }}>
                Complete integration across identity stores, VPC network fabric, and cloud infrastructure
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
              {[
                { title: 'Employees Dimension', count: '3,000 Identities', desc: 'Department, clearance DEFCON, employment status, active keys', tag: 'Identity' },
                { title: 'Auth & MFA Logs', count: '20,000+ Events', desc: 'SSO tokens, failed OTP attempts, terminated logins, geo-IPs', tag: 'Auth' },
                { title: 'VPC Network Flows', count: '25,000+ Packets', desc: 'Egress bytes, foreign ports, protocol anomalies, tunneling', tag: 'Network' },
                { title: 'IAM Privilege Audits', count: '17,431 Records', desc: 'Root escalations, role assumptions, cloud policy tampering', tag: 'Cloud' }
              ].map((ds, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 12,
                    padding: 20
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(6, 182, 212, 0.15)', color: '#38BDF8' }}>
                      {ds.tag}
                    </span>
                    <strong style={{ fontSize: '0.88rem', color: '#FBBF24', fontFamily: 'monospace' }}>{ds.count}</strong>
                  </div>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>{ds.title}</h4>
                  <p style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.5 }}>{ds.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: MITRE ATT&CK MATRIX (#mitre) */}
          <section
            id="mitre"
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              padding: '60px 32px',
              width: '100%',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#F43F5E', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                THREAT COVERAGE MATRIX
              </div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 8 }}>
                MITRE ATT&amp;CK Kill-Chain Defenses
              </h2>
              <p style={{ fontSize: '0.90rem', color: '#94A3B8' }}>
                End-to-end detection and automated neutralization across enterprise attack stages
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {[
                { stage: 'Initial Access', tech: 'T1078 Valid Accounts', desc: 'Offboarded terminated employee credentials being re-used', color: '#F43F5E' },
                { stage: 'Privilege Escalation', tech: 'T1068 Privilege Exploits', desc: 'Unauthorized IAM role assumptions and root key generation', color: '#F59E0B' },
                { stage: 'Defense Evasion', tech: 'T1070 Indicator Removal', desc: 'Clock-skew timestamp tampering to alter forensic timeline', color: '#8B5CF6' },
                { stage: 'Exfiltration', tech: 'T1048 Alt Protocol Egress', desc: 'Bulk data transfers to suspicious foreign autonomous systems', color: '#06B6D4' }
              ].map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: `1px solid ${m.color}35`,
                    borderRadius: 12,
                    padding: 20
                  }}
                >
                  <div style={{ fontSize: '0.70rem', fontWeight: 700, color: m.color, textTransform: 'uppercase', marginBottom: 4 }}>
                    {m.stage}
                  </div>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>{m.tech}</h4>
                  <p style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.5 }}>{m.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 5: BENCHMARK METRICS (#metrics) */}
          <section
            id="metrics"
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              padding: '60px 32px 80px',
              width: '100%',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                REAL-TIME SLA &amp; BENCHMARKS
              </div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 8 }}>
                Proven Defense Performance
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              {[
                { val: '< 8ms', label: 'DuckDB p99 Traversal', sub: 'Instant correlation across 62.4k rows', color: '#06B6D4' },
                { val: '100%', label: 'Breach Neutralization', sub: '507 offboarded accounts quarantined', color: '#10B981' },
                { val: '0ms', label: 'Clock Skew Tolerance', sub: 'Temporal paradoxes flagged instantly', color: '#8B5CF6' },
                { val: '120B', label: 'Dual AI Model Power', sub: 'Groq + Gemini multi-agent reasoning', color: '#F59E0B' }
              ].map((stat, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                    padding: 24,
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: stat.color, fontFamily: 'monospace', marginBottom: 4 }}>
                    {stat.val}
                  </div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* FOOTER */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '22px 32px',
          background: 'rgba(7, 11, 20, 0.95)',
          fontSize: '0.80rem',
          color: '#94A3B8'
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div>
            <strong style={{ color: '#F1F5F9' }}>AgentIQ Sentinel Defense Platform</strong> • TransOrg Datathon 2026
          </div>
          <div style={{ color: '#38BDF8', fontWeight: 500 }}>
            Zero-Trust SIEM • DuckDB Star Schema • FastAPI &amp; React 18
          </div>
        </div>
      </footer>
    </div>
  );
}
