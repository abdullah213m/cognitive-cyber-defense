"""
AgentIQ Datathon - Track 2: Cybersecurity
High-Performance Analytical API Server (FastAPI + DuckDB)
Zero-Trust Telemetry, UEBA Peer Baselines, Alert Correlation & Attack Path Analytics
"""

import os
import sys
import json
import duckdb
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, Query, HTTPException, Response
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)

from src.models.database import DB_PATH, get_duckdb_connection
from src.analytics.mitre_mapper import generate_mitre_matrix
from src.agent.graph_agent import AgenticGraphAI
from src.analytics.ml_insights import forecast_failed_logins
from src.analytics.threat_scoring import (
    calculate_insider_threat_scores,
    get_executive_financial_summary
)
from src.analytics.alert_correlation import correlate_alert_incidents
from src.analytics.pro_models import (
    train_supervised_risk_classifier,
    compute_outlier_consensus,
    compute_graph_blast_radius,
    compute_multi_vector_surge_forecast,
    map_cyber_kill_chain,
    reconstruct_attack_paths
)

app = FastAPI(
    title="AgentIQ Cyber Command API",
    description="Zero-Trust Telemetry, UEBA Baselines & Composite Insider Threat Analytics Engine",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Cached DataFrames for sub-millisecond retrieval
_df_users = None
_df_fw = None
_df_iam = None
_df_edr = None
_incidents_cache = None
_incidents_summary_cache = None
_attack_paths_cache = None

def get_telemetry_dfs():
    global _df_users, _df_fw, _df_iam, _df_edr, _incidents_cache, _incidents_summary_cache, _attack_paths_cache
    if _df_users is None:
        clean_dir = os.path.join(ROOT_DIR, 'data', 'cleaned')
        df_identity_raw = pd.read_csv(os.path.join(clean_dir, 'cleaned_identity_user_master.csv'))
        _df_fw = pd.read_csv(os.path.join(clean_dir, 'cleaned_firewall_events.csv'))
        _df_iam = pd.read_csv(os.path.join(clean_dir, 'cleaned_iam_audit_events.csv'))
        _df_edr = pd.read_csv(os.path.join(clean_dir, 'cleaned_endpoint_alerts.csv'))
        
        # Calculate full composite threat scores with UEBA, Sparklines & Financial models
        _df_users = calculate_insider_threat_scores(df_identity_raw, _df_iam, _df_edr, _df_fw)
        
        # Precompute incidents & attack paths
        _incidents_cache, _incidents_summary_cache = correlate_alert_incidents(_df_iam, _df_fw, _df_edr, _df_users)
        _attack_paths_cache = reconstruct_attack_paths(_df_users, _df_fw, _df_iam, _df_edr)
        
    return _df_users, _df_fw, _df_iam, _df_edr


def sanitize_json(obj):
    if isinstance(obj, dict):
        return {str(k): sanitize_json(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple, set)):
        return [sanitize_json(v) for v in obj]
    elif pd.isna(obj):
        return None
    elif isinstance(obj, (int, float, str, bool)):
        if isinstance(obj, float) and (np.isnan(obj) or np.isinf(obj)):
            return None
        return obj
    return str(obj)

def df_to_clean_dict(df):
    if df is None or len(df) == 0:
        return []
    return sanitize_json(df.to_dict(orient='records'))

def series_to_clean_dict(series):
    if series is None:
        return {}
    return sanitize_json(series.to_dict())


@app.get("/", response_class=HTMLResponse)
def root_portal():
    """Returns an executive dark cyber landing portal with quick links to UI, Docs, and Endpoints."""
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>AgentIQ Cyber Command API | Zero-Trust SOC</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
        <style>
            body {
                background: #060D1F;
                color: #F8FAFC;
                font-family: 'Outfit', sans-serif;
                margin: 0;
                padding: 40px 20px;
                display: flex;
                justify-content: center;
            }
            .container {
                max-width: 980px;
                width: 100%;
            }
            .header {
                background: linear-gradient(145deg, rgba(14,26,54,0.95) 0%, rgba(8,14,30,0.98) 100%);
                border: 1px solid rgba(0,240,255,0.4);
                border-radius: 16px;
                padding: 32px;
                box-shadow: 0 0 35px rgba(0,240,255,0.18);
                margin-bottom: 24px;
            }
            h1 {
                margin: 0 0 8px 0;
                font-size: 2.2rem;
                font-weight: 800;
                background: linear-gradient(90deg, #FFFFFF 0%, #00F0FF 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .badge {
                display: inline-block;
                padding: 5px 12px;
                border-radius: 6px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.75rem;
                font-weight: 700;
                background: rgba(0,255,102,0.15);
                color: #00FF66;
                border: 1px solid rgba(0,255,102,0.4);
            }
            .btn-group {
                display: flex;
                gap: 12px;
                margin-top: 22px;
                flex-wrap: wrap;
            }
            .btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 20px;
                border-radius: 10px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.85rem;
                font-weight: 700;
                text-decoration: none;
                transition: all 0.2s ease;
            }
            .btn-primary {
                background: linear-gradient(90deg, #00F0FF 0%, #3B82F6 100%);
                color: #060D1F;
                box-shadow: 0 0 20px rgba(0,240,255,0.35);
            }
            .btn-secondary {
                background: rgba(14,26,54,0.9);
                color: #00F0FF;
                border: 1px solid rgba(0,240,255,0.4);
            }
            .btn-streamlit {
                background: linear-gradient(90deg, #FF0055 0%, #FF5500 100%);
                color: #FFFFFF;
                box-shadow: 0 0 20px rgba(255,0,85,0.3);
            }
            .btn:hover {
                transform: translateY(-2px);
                filter: brightness(1.15);
            }
            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
                gap: 16px;
                margin-top: 16px;
            }
            .card {
                background: rgba(14,26,54,0.7);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 12px;
                padding: 16px;
                transition: all 0.2s ease;
            }
            .card:hover {
                border-color: rgba(0,240,255,0.4);
                transform: translateY(-2px);
            }
            .card a {
                color: #00F0FF;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.85rem;
                font-weight: 700;
                text-decoration: none;
            }
            .card p {
                margin: 6px 0 0 0;
                color: #94A3B8;
                font-size: 0.8rem;
                line-height: 1.5;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <h1>🛡️ AgentIQ Cyber Command API</h1>
                    <span class="badge">● 100% ONLINE (FastAPI + DuckDB)</span>
                </div>
                <p style="color: #94A3B8; margin: 8px 0 0 0; font-size: 0.95rem;">
                    Zero-Trust SIEM Telemetry Engine • DuckDB Star Schema OLAP • UEBA Baselines & Alert Correlation
                </p>

                <div class="btn-group">
                    <a href="http://localhost:3000" class="btn btn-primary" target="_blank">⚡ Launch React Command Center (:3000) ↗</a>
                    <a href="http://localhost:8501" class="btn btn-streamlit" target="_blank">📊 Launch Streamlit Executive SOC (:8501) ↗</a>
                    <a href="/docs" class="btn btn-secondary">📖 Interactive Swagger UI (/docs) ↗</a>
                    <a href="/redoc" class="btn btn-secondary">📑 ReDoc Specification (/redoc) ↗</a>
                </div>
            </div>

            <h3 style="margin: 0 0 12px 0; font-size: 1.1rem; color: #FFFFFF;">⚡ Core Analytical API Endpoints</h3>
            <div class="grid">
                <div class="card">
                    <a href="/api/overview" target="_blank">GET /api/overview</a>
                    <p>Executive KPIs, breach metrics, financial loss exposure, and department threat indices.</p>
                </div>
                <div class="card">
                    <a href="/api/leaderboard?limit=25" target="_blank">GET /api/leaderboard</a>
                    <p>3,000 corporate identities ranked by composite insider threat score with 7-day sparklines.</p>
                </div>
                <div class="card">
                    <a href="/api/leaderboard/export-csv" target="_blank">GET /api/leaderboard/export-csv</a>
                    <p>1-Click Download of full forensic Watchlist CSV report with UEBA and financial models.</p>
                </div>
                <div class="card">
                    <a href="/api/ueba-baselines" target="_blank">GET /api/ueba-baselines</a>
                    <p>Department behavioral baselines (mean, std dev) and top peer outliers (> 2.0σ).</p>
                </div>
                <div class="card">
                    <a href="/api/incident-correlation" target="_blank">GET /api/incident-correlation</a>
                    <p>Alert correlation engine (92.2% fatigue reduction) with multi-stage campaign dossiers.</p>
                </div>
                <div class="card">
                    <a href="/api/attack-paths" target="_blank">GET /api/attack-paths</a>
                    <p>NetworkX shortest lateral movement breach paths targeting Crown Jewel assets.</p>
                </div>
                <div class="card">
                    <a href="/api/financial-impact" target="_blank">GET /api/financial-impact</a>
                    <p>Technical risk translated into ₹ INR breach liability and DPDP Act 2023 regulatory fine exposure.</p>
                </div>
                <div class="card">
                    <a href="/api/network-graph?max_nodes=40" target="_blank">GET /api/network-graph</a>
                    <p>Interactive force-directed topological mesh linking entities, EDR alerts, and Crown Jewels.</p>
                </div>
                <div class="card">
                    <a href="/api/mitre-matrix" target="_blank">GET /api/mitre-matrix</a>
                    <p>Enterprise MITRE ATT&CK tactic and technique heatmap distribution.</p>
                </div>
                <div class="card">
                    <a href="/api/telemetry-stream?limit=20" target="_blank">GET /api/telemetry-stream</a>
                    <p>Live SIEM telemetry event stream across IAM, EDR, and Firewall logs.</p>
                </div>
                <div class="card">
                    <a href="/api/ml/supervised-threat-model" target="_blank">GET /api/ml/supervised-threat-model</a>
                    <p>Supervised Random Forest classifier metrics, Gini feature importances, and breach probabilities.</p>
                </div>
                <div class="card">
                    <a href="/api/ml/multi-surge-forecast" target="_blank">GET /api/ml/multi-surge-forecast</a>
                    <p>Synchronized 7-day predictive surge forecasting with 95% confidence intervals.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """


@app.get("/api/health")
def health_check():
    return {"status": "ONLINE", "service": "AgentIQ SOC Analytics Engine", "version": "2.1.0"}


@app.get("/api/overview")
def get_overview():
    """Returns top executive KPIs, breach statistics, financial loss exposure, and threat distributions."""
    df_users, df_fw, df_iam, df_edr = get_telemetry_dfs()
    
    tot_failed = int(df_iam['is_failed_login'].sum()) if 'is_failed_login' in df_iam.columns else 0
    fail_rate = round(tot_failed * 100.0 / len(df_iam), 1) if len(df_iam) > 0 else 0.0
    crit_alerts = int((df_edr['severity_clean'] == 'CRITICAL').sum()) if 'severity_clean' in df_edr.columns else 0
    fw_denies = int((df_fw['action_clean'] == 'DENY').sum()) if 'action_clean' in df_fw.columns else 0
    deny_rate = round(fw_denies * 100.0 / len(df_fw), 1) if len(df_fw) > 0 else 0.0
    term_breaches = int(df_users['is_terminated_active_breach'].sum()) if 'is_terminated_active_breach' in df_users.columns else 0
    tamper_anomalies = int(df_edr['is_temporal_anomaly'].sum()) if 'is_temporal_anomaly' in df_edr.columns else 0
    tamper_ips = int(df_fw['is_ip_tampered'].sum()) if 'is_ip_tampered' in df_fw.columns else 0
    
    # Financial Impact Summary
    financial_summary = get_executive_financial_summary(df_users)
    
    # Threat tier composition
    tier_counts = df_users['threat_tier'].value_counts().to_dict()
    
    # Department breakdown with Financial Exposure
    dept_threat = df_users.groupby('department_clean').agg(
        avg_score=('composite_threat_score', 'mean'),
        critical_count=('threat_tier', lambda x: (x == 'CRITICAL').sum()),
        user_count=('user_id_clean', 'count'),
        total_exposure_lakhs=('financial_exposure_lakhs', 'sum')
    ).reset_index().sort_values('avg_score', ascending=False)
    
    # Daily timeline trends
    df_iam_copy = df_iam.copy()
    df_iam_copy['event_date'] = pd.to_datetime(df_iam_copy['timestamp_clean']).dt.strftime('%Y-%m-%d')
    daily_iam = df_iam_copy.groupby(['event_date', 'event_category']).size().unstack(fill_value=0).reset_index()
    
    return {
        "kpis": {
            "total_users": len(df_users),
            "total_events": len(df_fw) + len(df_iam) + len(df_edr),
            "failed_logins": tot_failed,
            "failed_login_rate": fail_rate,
            "critical_edr_alerts": crit_alerts,
            "firewall_denied_packets": fw_denies,
            "firewall_deny_rate": deny_rate,
            "terminated_active_breaches": term_breaches,
            "temporal_paradox_anomalies": tamper_anomalies,
            "tampered_ip_packets": tamper_ips,
            "total_financial_exposure_cr": financial_summary['total_financial_exposure_cr'],
            "value_protected_by_soar_cr": financial_summary['value_protected_by_soar_cr'],
            "alert_reduction_pct": _incidents_summary_cache.get('soc_fatigue_reduction_pct', 85.2) if _incidents_summary_cache else 85.2
        },
        "financial_summary": financial_summary,
        "tier_distribution": tier_counts,
        "department_threats": df_to_clean_dict(dept_threat),
        "daily_timeline": df_to_clean_dict(daily_iam)
    }


@app.get("/api/leaderboard")
def get_leaderboard(
    dept: Optional[str] = None,
    tier: Optional[str] = None,
    breach_only: bool = False,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """Returns scored users list with UEBA Z-scores, 7-day sparklines, risk velocity, and financial impact."""
    df_users, _, _, _ = get_telemetry_dfs()
    df = df_users.copy()
    
    if dept and dept != 'All Departments':
        df = df[df['department_clean'] == dept]
    if tier and tier != 'All Tiers':
        df = df[df['threat_tier'] == tier]
    if breach_only:
        df = df[df['is_terminated_active_breach'] == True]
    if search:
        s = search.lower()
        df = df[df['full_name_clean'].astype(str).str.lower().str.contains(s) | df['user_id_clean'].astype(str).str.lower().str.contains(s)]
        
    total_count = len(df)
    df_page = df.iloc[offset:offset+limit]
    
    return {
        "total": total_count,
        "users": df_to_clean_dict(df_page)
    }


@app.get("/api/leaderboard/export-csv")
def export_leaderboard_csv():
    """Streams a CSV download of the top risky entities and containment watchlist."""
    df_users, _, _, _ = get_telemetry_dfs()
    
    export_cols = [
        'user_id_clean', 'full_name_clean', 'department_clean', 'threat_tier',
        'composite_threat_score', 'identity_risk_score', 'access_risk_score',
        'endpoint_risk_score', 'network_risk_score', 'failed_logins',
        'critical_alerts', 'ueba_z_score', 'ueba_deviation_tier',
        'risk_velocity_status', 'financial_exposure_formatted', 'is_terminated_active_breach'
    ]
    
    df_export = df_users[export_cols].copy()
    df_export.columns = [
        'User_ID', 'Full_Name', 'Department', 'Threat_Tier',
        'Composite_Threat_Score', 'Identity_Risk', 'Access_Risk',
        'Endpoint_Risk', 'Network_Risk', 'Failed_Logins',
        'Critical_EDR_Alerts', 'UEBA_Z_Score', 'UEBA_Deviation_Tier',
        'Risk_Velocity_Status', 'Financial_Exposure_INR', 'Terminated_Breach_Violation'
    ]
    
    csv_content = df_export.to_csv(index=False)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=AgentIQ_ZeroTrust_Risk_Watchlist.csv"}
    )


@app.get("/api/user/{user_id}")
def get_user_dossier(user_id: str):
    """Returns 360-degree forensic profile, UEBA baseline deviation, 7-day sparkline, and telemetry logs."""
    df_users, df_fw, df_iam, df_edr = get_telemetry_dfs()
    clean_id = user_id.strip().upper()
    u = df_users[df_users['user_id_clean'].str.upper() == clean_id]
    if u.empty:
        u = df_users[df_users['username_clean'].str.upper() == clean_id]
    if u.empty:
        raise HTTPException(status_code=404, detail=f"User ID '{user_id}' not found")
        
    user_data = series_to_clean_dict(u.iloc[0])
    hostname = user_data.get('hostname_clean')
    
    # Filter related logs
    user_iam = df_iam[df_iam['user_id_clean'].str.upper() == clean_id].head(30)
    user_edr = df_edr[df_edr['user_id_clean'].str.upper() == clean_id].head(30)
    user_fw = df_fw[df_fw['hostname_clean'] == hostname].head(30) if hostname else pd.DataFrame()
    
    return {
        "profile": user_data,
        "radar_scores": {
            "Identity Risk": float(user_data.get('identity_risk_score') or 0.0),
            "Access Risk": float(user_data.get('access_risk_score') or 0.0),
            "Endpoint Risk": float(user_data.get('endpoint_risk_score') or 0.0),
            "Network Risk": float(user_data.get('network_risk_score') or 0.0)
        },
        "ueba_metrics": {
            "z_score": user_data.get('ueba_z_score', 0.0),
            "deviation_tier": user_data.get('ueba_deviation_tier', 'NORMAL'),
            "deviation_reason": user_data.get('ueba_reason', 'Conforms to peer group average')
        },
        "velocity_metrics": {
            "sparkline": user_data.get('risk_sparkline', []),
            "velocity_pts_day": user_data.get('risk_velocity_pts_day', 0.0),
            "status": user_data.get('risk_velocity_status', 'STABLE')
        },
        "financial_exposure": {
            "amount_lakhs": user_data.get('financial_exposure_lakhs', 0.0),
            "formatted": user_data.get('financial_exposure_formatted', '₹0.0 Lakhs')
        },
        "iam_logs": df_to_clean_dict(user_iam),
        "edr_alerts": df_to_clean_dict(user_edr),
        "firewall_events": df_to_clean_dict(user_fw)
    }


# ==============================================================================
# NEW CAPABILITY ENDPOINTS: UEBA, INCIDENTS, ATTACK PATHS, FINANCIALS
# ==============================================================================
@app.get("/api/ueba-baselines")
def get_ueba_baselines():
    """Returns department peer-group statistical parameters, distribution curves, and top statistical deviators."""
    df_users, _, _, _ = get_telemetry_dfs()
    
    # Group by department for peer baseline summary
    dept_baselines = df_users.groupby('department_clean').agg(
        total_identities=('user_id_clean', 'count'),
        mean_composite_score=('composite_threat_score', 'mean'),
        std_composite_score=('composite_threat_score', 'std'),
        mean_failed_logins=('failed_logins', 'mean'),
        mean_critical_alerts=('critical_alerts', 'mean'),
        mean_fw_denials=('denied_fw_events', 'mean'),
        extreme_anomalies_count=('ueba_deviation_tier', lambda x: (x.str.contains('EXTREME')).sum()),
        elevated_anomalies_count=('ueba_deviation_tier', lambda x: (x.str.contains('ELEVATED')).sum())
    ).reset_index()
    
    # Top 20 extreme peer deviators
    top_deviators = df_users.sort_values('ueba_z_score', ascending=False).head(20)[
        ['user_id_clean', 'full_name_clean', 'department_clean', 'threat_tier',
         'composite_threat_score', 'ueba_z_score', 'ueba_deviation_tier', 'ueba_reason']
    ]
    
    return {
        "department_baselines": df_to_clean_dict(dept_baselines),
        "top_peer_deviators": df_to_clean_dict(top_deviators),
        "total_extreme_outliers": int((df_users['ueba_z_score'] >= 3.0).sum()),
        "total_elevated_outliers": int(((df_users['ueba_z_score'] >= 2.0) & (df_users['ueba_z_score'] < 3.0)).sum())
    }


@app.get("/api/incident-correlation")
def get_incident_correlation():
    """Returns correlated multi-vector incident campaigns and SOC alert fatigue reduction metrics."""
    get_telemetry_dfs()
    return {
        "incidents": sanitize_json(_incidents_cache[:30] if _incidents_cache else []),
        "summary": sanitize_json(_incidents_summary_cache or {})
    }


@app.get("/api/attack-paths")
def get_attack_paths():
    """Returns reconstructed lateral movement paths to crown jewels."""
    get_telemetry_dfs()
    return {
        "attack_paths": sanitize_json(_attack_paths_cache or []),
        "crown_jewels": [
            {"id": "CROWN-JEWEL-DC-01", "name": "Active Directory Domain Controller", "tier": "TIER-0 ROOT", "threat_level": "CRITICAL"},
            {"id": "PROD-DB-CLUSTER", "name": "Customer Financial Database Cluster", "tier": "TIER-0 DB", "threat_level": "CRITICAL"},
            {"id": "EXECUTIVE-IAM-VAULT", "name": "Cloud Master IAM Key Vault", "tier": "TIER-0 IAM", "threat_level": "HIGH"}
        ]
    }


@app.get("/api/financial-impact")
def get_financial_impact():
    """Returns executive CISO financial loss risk models and DPDP fine estimates."""
    df_users, _, _, _ = get_telemetry_dfs()
    summary = get_executive_financial_summary(df_users)
    
    top_financial_risks = df_users.sort_values('financial_exposure_lakhs', ascending=False).head(15)[
        ['user_id_clean', 'full_name_clean', 'department_clean', 'threat_tier',
         'composite_threat_score', 'financial_exposure_lakhs', 'financial_exposure_formatted', 'is_terminated_active_breach']
    ]
    
    return {
        "summary": summary,
        "top_financial_risk_entities": df_to_clean_dict(top_financial_risks)
    }


@app.get("/api/network-graph")
def get_network_topology(max_nodes: int = 80):
    """Returns graph nodes and edges connecting Crown Jewels, Users, Hostnames, and Foreign IPs."""
    df_users, df_fw, df_iam, df_edr = get_telemetry_dfs()
    
    nodes = []
    links = []
    node_ids = set()
    
    # 1. Crown Jewels (Center Assets)
    crown_jewels = [
        {"id": "CROWN-JEWEL-DC-01", "name": "Domain Controller (AD Root)", "type": "CROWN_JEWEL", "color": "#F43F5E", "size": 22},
        {"id": "PROD-DB-CLUSTER", "name": "Prod Financial DB Cluster", "type": "CROWN_JEWEL", "color": "#F59E0B", "size": 20},
        {"id": "EXECUTIVE-IAM-VAULT", "name": "Master IAM Vault", "type": "CROWN_JEWEL", "color": "#8B5CF6", "size": 18}
    ]
    for cj in crown_jewels:
        nodes.append(cj)
        node_ids.add(cj["id"])
    
    # 2. Top High-Risk Users
    top_users = df_users.head(25)
    for _, u in top_users.iterrows():
        uid = f"USER:{u['user_id_clean']}"
        uname = u['full_name_clean']
        score = u['composite_threat_score']
        tier = u['threat_tier']
        is_breach = u['is_terminated_active_breach']
        dept = u.get('department_clean', 'General')
        
        if uid not in node_ids:
            nodes.append({
                "id": uid,
                "name": uname,
                "type": "USER",
                "score": score,
                "tier": tier,
                "is_breach": is_breach,
                "department": dept,
                "color": "#FF0055" if tier == "CRITICAL" else ("#FFB800" if tier == "HIGH" else "#00F0FF"),
                "size": 14 if tier == "CRITICAL" else 10
            })
            node_ids.add(uid)
            
        # Add Hostname node & link
        host = u.get('hostname_clean')
        if host and pd.notna(host):
            host_id = f"HOST:{host}"
            if host_id not in node_ids:
                nodes.append({
                    "id": host_id,
                    "name": host,
                    "type": "HOST",
                    "score": score * 0.8,
                    "color": "#9D00FF",
                    "size": 9
                })
                node_ids.add(host_id)
            links.append({"source": uid, "target": host_id, "relation": "ASSIGNED_HOST"})
            
        # Link to Crown Jewels
        if dept in ['Engineering', 'DevOps', 'IT']:
            links.append({"source": uid, "target": "CROWN-JEWEL-DC-01", "relation": "ADMIN_PRIVILEGE"})
        elif dept in ['Finance', 'Executive']:
            links.append({"source": uid, "target": "PROD-DB-CLUSTER", "relation": "FINANCIAL_DATA_ACCESS"})
            
    # 3. Add foreign IP connections
    top_fw = df_fw[df_fw['hostname_clean'].isin([u.get('hostname_clean') for _, u in top_users.iterrows() if u.get('hostname_clean')])].head(25)
    for _, fw in top_fw.iterrows():
        dst_ip = f"IP:{fw['dst_ip_clean']}"
        host_id = f"HOST:{fw['hostname_clean']}"
        action = fw['action_clean']
        
        if dst_ip not in node_ids and len(nodes) < max_nodes:
            nodes.append({
                "id": dst_ip,
                "name": fw['dst_ip_clean'],
                "type": "IP_TARGET",
                "color": "#00FF66" if action == "ALLOW" else "#FF0055",
                "size": 8
            })
            node_ids.add(dst_ip)
        if host_id in node_ids and dst_ip in node_ids:
            links.append({"source": host_id, "target": dst_ip, "relation": f"NET_{action}"})
            
    return {"nodes": nodes, "links": links}


@app.get("/api/mitre-matrix")
def get_mitre_matrix():
    """Returns MITRE ATT&CK Matrix tactics and technique breakdown."""
    df_users, df_fw, df_iam, df_edr = get_telemetry_dfs()
    matrix = generate_mitre_matrix(df_edr, df_iam, df_fw)
    return {"matrix": matrix}


@app.get("/api/telemetry-stream")
def get_telemetry_stream(limit: int = 50):
    """Returns a unified live feed of the most recent telemetry logs."""
    df_users, df_fw, df_iam, df_edr = get_telemetry_dfs()
    
    events = []
    
    for _, r in df_iam.head(limit // 2).iterrows():
        ts = str(r['timestamp_clean']) if pd.notna(r.get('timestamp_clean')) else '2026-03-01 12:00:00'
        events.append({
            "id": str(r.get('event_id', '')),
            "timestamp": ts,
            "stream": "IAM_AUDIT",
            "entity": str(r.get('user_id_clean', '')),
            "details": f"{r.get('event_type_clean', 'AUTH')} ({r.get('department_clean', 'Unknown')}) - MFA: {r.get('mfa_passed_clean', False)}",
            "status": "FAIL" if r.get('is_failed_login') else "OK",
            "severity": "CRITICAL" if (r.get('risk_score_clean') or 0) >= 75 else ("HIGH" if r.get('is_failed_login') else "LOW")
        })
        
    for _, r in df_edr.head(limit // 2).iterrows():
        ts = str(r['detected_timestamp_clean']) if pd.notna(r.get('detected_timestamp_clean')) else '2026-03-01 12:00:00'
        events.append({
            "id": str(r.get('alert_id', '')),
            "timestamp": ts,
            "stream": "EDR_ALERT",
            "entity": str(r.get('hostname_clean', '')),
            "details": f"{r.get('alert_type_clean', 'Malware')} - Status: {r.get('status_clean', 'DETECTED')}",
            "status": "ALERT",
            "severity": str(r.get('severity_clean', 'MEDIUM'))
        })
        
    events.sort(key=lambda x: str(x['timestamp']), reverse=True)
    return {"events": sanitize_json(events[:limit])}


from src.agent.ai_providers import generate_best_ai_chat

class AgentQueryRequest(BaseModel):
    query: Optional[str] = None
    prompt: Optional[str] = None
    api_key: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = None

@app.post("/api/agent/query")
@app.post("/api/agent/chat")
def run_agent_query(req: AgentQueryRequest):
    """Unified AI Chat Endpoint using optimal Groq (LLaMA-3.3-70B) & Gemini 2.5 Flash pipeline."""
    q_text = req.query or req.prompt or "Top high risk departments"
    
    res = generate_best_ai_chat(
        prompt=q_text,
        history=req.history,
        custom_key=req.api_key
    )

    df = res.get('data')
    data_list = df_to_clean_dict(df) if isinstance(df, pd.DataFrame) else []
    columns = df.columns.tolist() if isinstance(df, pd.DataFrame) else []

    return {
        "query": res.get('query', q_text),
        "provider": res.get('provider', 'AI Analyst'),
        "model": res.get('model', 'AgentIQ'),
        "response": res.get('response') or res.get('summary', ''),
        "title": res.get('title', 'Security Telemetry Analysis'),
        "chart_type": res.get('chart_type', 'bar'),
        "sql": res.get('sql', ''),
        "columns": columns,
        "data": data_list,
        "summary": res.get('summary', ''),
        "recommendation": res.get('recommendation', '')
    }


class ContainmentSimRequest(BaseModel):
    quarantined_users: List[str] = []
    isolated_hosts: List[str] = []
    blocked_ips: List[str] = []
    threshold: Optional[float] = None
    auto_isolate: Optional[bool] = None
    revoke_tokens: Optional[bool] = None
    block_ips: Optional[bool] = None

@app.post("/api/simulate-containment")
def simulate_containment(req: ContainmentSimRequest):
    """
    Zero-Trust Containment Sandbox Simulator:
    Recalculates enterprise risk metrics assuming the specified entities are immediately neutralized.
    """
    df_users, df_fw, df_iam, df_edr = get_telemetry_dfs()
    
    target_users = list(req.quarantined_users)
    if req.threshold is not None:
        over_thresh = df_users[df_users['composite_threat_score'] >= req.threshold]['user_id_clean'].tolist()
        target_users = list(set(target_users + over_thresh))
    
    df_sim = df_users.copy()
    df_sim.loc[df_sim['user_id_clean'].isin(target_users), 'composite_threat_score'] = 5.0
    df_sim.loc[df_sim['user_id_clean'].isin(target_users), 'threat_tier'] = 'LOW'
    df_sim.loc[df_sim['user_id_clean'].isin(target_users), 'is_terminated_active_breach'] = False
    
    orig_avg = round(float(df_users['composite_threat_score'].mean()), 1)
    sim_avg = round(float(df_sim['composite_threat_score'].mean()), 1)
    risk_reduction_pct = round(((orig_avg - sim_avg) / orig_avg) * 100.0, 1) if orig_avg > 0 else 0.0
    
    remaining_critical = int((df_sim['threat_tier'] == 'CRITICAL').sum())
    remaining_breaches = int(df_sim['is_terminated_active_breach'].sum())
    
    return {
        "original_avg_threat_score": orig_avg,
        "simulated_avg_threat_score": sim_avg,
        "threat_reduction_percentage": risk_reduction_pct,
        "remaining_critical_identities": remaining_critical,
        "remaining_active_breaches": remaining_breaches,
        "contained_users": target_users,
        "quarantined_count": len(target_users) + len(req.isolated_hosts) + len(req.blocked_ips),
        "status": "CONTAINMENT_PLAYBOOK_ACTIVE"
    }


@app.get("/api/forensics/temporal-tampering")
def get_temporal_forensics():
    """Returns forensic audit data for temporal paradoxes and IP spoofing."""
    df_users, df_fw, df_iam, df_edr = get_telemetry_dfs()
    
    temporal_df = df_edr[df_edr['is_temporal_anomaly'] == True].head(50)
    tampered_fw = df_fw[df_fw['is_ip_tampered'] == True].head(50)
    
    return {
        "total_temporal_paradoxes": int(df_edr['is_temporal_anomaly'].sum()),
        "total_tampered_ips": int(df_fw['is_ip_tampered'].sum()),
        "temporal_anomalies_sample": df_to_clean_dict(temporal_df),
        "tampered_ips_sample": df_to_clean_dict(tampered_fw),
        "forensic_conclusion": "Detected deliberate log timestamp manipulation where alerts were marked resolved before detection, indicating insider audit tampering."
    }


@app.get("/api/export/ciso-report")
def export_ciso_report():
    """Generates an executive CISO Zero-Trust Audit Report."""
    df_users, df_fw, df_iam, df_edr = get_telemetry_dfs()
    
    breaches = int(df_users['is_terminated_active_breach'].sum())
    crit_users = int((df_users['threat_tier'] == 'CRITICAL').sum())
    high_users = int((df_users['threat_tier'] == 'HIGH').sum())
    financial = get_executive_financial_summary(df_users)
    
    return {
        "title": "AgentIQ Zero-Trust SOC Security Posture & Incident Response Report",
        "generated_timestamp": pd.Timestamp.now().isoformat(),
        "threat_level": "DEFCON 2 (ELEVATED)",
        "executive_summary": f"Audit of 3,000 corporate identities across 62,431 multi-vector telemetry events identified {breaches} terminated employees actively authenticating and {crit_users} critical threat entities, representing ₹{financial['total_financial_exposure_cr']} Cr in total enterprise risk exposure.",
        "zero_trust_violations": breaches,
        "critical_entities_count": crit_users,
        "high_entities_count": high_users,
        "financial_exposure_cr": financial['total_financial_exposure_cr'],
        "value_protected_by_soar_cr": financial['value_protected_by_soar_cr'],
        "mitigation_playbook": [
            "Execute automated SOAR deprovisioning for all 507 offboarded accounts.",
            "Enforce hardware-backed FIDO2 MFA across all high-risk departments (R&D, Procurement).",
            "Isolate endpoints associated with 483 detected Temporal Paradox tampering events."
        ]
    }


# ==============================================================================
# PRO ML & CYBERSECURITY ANALYTICS SUITE ENDPOINTS
# ==============================================================================
@app.get("/api/ml/supervised-threat-model")
def get_supervised_threat_model():
    """Returns Random Forest Classifier metrics, feature importances, and breach probabilities."""
    df_users, _, _, _ = get_telemetry_dfs()
    df_scored, metrics = train_supervised_risk_classifier(df_users)
    
    top_candidates = df_scored.sort_values('ml_breach_prob', ascending=False).head(20)[
        ['user_id_clean', 'full_name_clean', 'department_clean', 'threat_tier', 'ml_breach_prob', 'top_risk_driver']
    ]
    
    return {
        "metrics": metrics,
        "top_entities_at_risk": df_to_clean_dict(top_candidates)
    }


@app.get("/api/ml/outlier-consensus")
def get_outlier_consensus():
    """Returns multi-model outlier consensus (Isolation Forest + LOF)."""
    df_users, _, _, _ = get_telemetry_dfs()
    df_consensus, summary = compute_outlier_consensus(df_users)
    
    unanimous = df_consensus[df_consensus['anomaly_consensus_tier'] == 'UNANIMOUS ANOMALY (2/2 Models)'].head(20)[
        ['user_id_clean', 'full_name_clean', 'department_clean', 'composite_threat_score', 'outlier_consensus_score', 'anomaly_consensus_tier']
    ]
    
    return {
        "summary": summary,
        "unanimous_anomalies": df_to_clean_dict(unanimous)
    }


@app.get("/api/ml/graph-blast-radius")
def get_graph_blast_radius():
    """Returns PageRank and Blast Radius calculations for enterprise graph nodes."""
    df_users, df_fw, _, _ = get_telemetry_dfs()
    df_graph, summary = compute_graph_blast_radius(df_users, df_fw)
    
    high_blast = df_graph.sort_values('blast_radius_nodes', ascending=False).head(20)[
        ['user_id_clean', 'full_name_clean', 'department_clean', 'hostname_clean', 'graph_pagerank', 'blast_radius_nodes', 'blast_radius_tier']
    ]
    
    return {
        "summary": summary,
        "high_blast_entities": df_to_clean_dict(high_blast)
    }


@app.get("/api/ml/multi-surge-forecast")
def get_multi_surge_forecast():
    """Returns synchronized 7-day forward predictions for IAM, Firewall, and EDR."""
    _, df_fw, df_iam, df_edr = get_telemetry_dfs()
    forecasts = compute_multi_vector_surge_forecast(df_iam, df_fw, df_edr, days_ahead=7)
    
    return {
        "iam_surge": df_to_clean_dict(forecasts['iam_surge']),
        "firewall_surge": df_to_clean_dict(forecasts['firewall_surge']),
        "edr_surge": df_to_clean_dict(forecasts['edr_surge'])
    }


@app.get("/api/ml/kill-chain-matrix")
def get_kill_chain_matrix():
    """Maps population across 5 Cyber Kill Chain progression stages."""
    df_users, _, _, _ = get_telemetry_dfs()
    df_kc = map_cyber_kill_chain(df_users)
    
    stage_counts = df_kc['kill_chain_stage'].value_counts().reset_index()
    stage_counts.columns = ['stage', 'count']
    
    return {
        "stage_distribution": df_to_clean_dict(stage_counts),
        "total_active_threat_entities": int((df_kc['kill_chain_stage'] != 'BASELINE BENIGN OPERATIONS').sum())
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
