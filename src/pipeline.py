"""
AgentIQ Datathon - Track 2: Cybersecurity
Master Data Rescue & Governed Analytics Pipeline
"""

import os
import sys
import json
import time
from datetime import datetime
import pandas as pd

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.cleaners.firewall_cleaner import clean_firewall_logs
from src.cleaners.iam_cleaner import clean_iam_audit_trail
from src.cleaners.endpoint_cleaner import clean_endpoint_alerts
from src.cleaners.identity_cleaner import clean_identity_asset_master
from src.analytics.threat_scoring import calculate_insider_threat_scores
from src.analytics.ml_insights import run_anomaly_and_clustering
from src.models.database import init_star_schema, DB_PATH

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
RAW_DIR = os.path.join(ROOT_DIR, 'data', 'raw')
CLEAN_DIR = os.path.join(ROOT_DIR, 'data', 'cleaned')
OUT_DIR = os.path.join(ROOT_DIR, 'output')

def run_pipeline():
    print("=" * 70)
    print(">> AgentIQ Datathon Track 2: Zero-Trust Cyber Telemetry Pipeline")
    print("=" * 70)
    start_time = time.time()
    
    os.makedirs(CLEAN_DIR, exist_ok=True)
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    audit_report = {
        'pipeline_executed_at': datetime.utcnow().isoformat() + 'Z',
        'datasets': {}
    }
    
    # -------------------------------------------------------------
    # 1. Clean Identity & Asset Master
    # -------------------------------------------------------------
    print("\n[1/4] Rescuing Identity & Asset Master (track2_identity_asset_master.csv)...")
    id_path = os.path.join(RAW_DIR, 'track2_identity_asset_master.csv')
    df_id_raw = pd.read_csv(id_path, encoding='utf-8', on_bad_lines='skip')
    df_id_clean, id_stats = clean_identity_asset_master(df_id_raw)
    audit_report['datasets']['identity_master'] = id_stats
    print(f"  [OK] Processed {id_stats['raw_rows']} raw rows -> {id_stats['cleaned_rows']} clean records ({id_stats['active_employees']} active, {id_stats['terminated_employees']} terminated)")
    
    # -------------------------------------------------------------
    # 2. Clean Firewall Logs
    # -------------------------------------------------------------
    print("\n[2/4] Rescuing Firewall Telemetry (track2_firewall_logs.csv)...")
    fw_path = os.path.join(RAW_DIR, 'track2_firewall_logs.csv')
    df_fw_raw = pd.read_csv(fw_path, encoding='utf-8', on_bad_lines='skip')
    df_fw_clean, fw_stats = clean_firewall_logs(df_fw_raw)
    audit_report['datasets']['firewall_logs'] = fw_stats
    print(f"  [OK] Processed {fw_stats['raw_rows']} raw rows -> {fw_stats['cleaned_rows']} clean records (Caught {fw_stats['malformed_ips']} malformed IPs, {fw_stats['invalid_ports']} invalid ports)")
    
    # -------------------------------------------------------------
    # 3. Clean IAM Audit Trail
    # -------------------------------------------------------------
    print("\n[3/4] Rescuing IAM Audit Trail (track2_iam_audit_trail.json)...")
    iam_path = os.path.join(RAW_DIR, 'track2_iam_audit_trail.json')
    with open(iam_path, 'r', encoding='utf-8') as f:
        iam_data = json.load(f)
    df_iam_clean, iam_stats = clean_iam_audit_trail(iam_data)
    audit_report['datasets']['iam_audit'] = iam_stats
    print(f"  [OK] Processed {iam_stats['raw_rows']} raw events -> {iam_stats['cleaned_rows']} clean events (Caught {iam_stats['failed_logins']} failed logins, {iam_stats['mfa_failures']} MFA failures)")
    
    # -------------------------------------------------------------
    # 4. Clean Endpoint Alerts (EDR)
    # -------------------------------------------------------------
    print("\n[4/4] Rescuing Endpoint Alerts (track2_endpoint_alerts.xlsx)...")
    edr_path = os.path.join(RAW_DIR, 'track2_endpoint_alerts.xlsx')
    df_edr_raw = pd.read_excel(edr_path)
    df_edr_clean, edr_stats = clean_endpoint_alerts(df_edr_raw)
    audit_report['datasets']['endpoint_alerts'] = edr_stats
    print(f"  [OK] Processed {edr_stats['raw_rows']} raw alerts -> {edr_stats['cleaned_rows']} clean alerts (Caught {edr_stats['critical_alerts']} critical alerts, {edr_stats['temporal_anomalies']} temporal paradoxes)")
    
    # -------------------------------------------------------------
    # 5. Compute Composite Insider Threat Scores & ML Analytics
    # -------------------------------------------------------------
    print("\n[5/5] Computing Composite Insider Threat Scores & ML Clusters...")
    df_id_scored = calculate_insider_threat_scores(df_id_clean, df_iam_clean, df_edr_clean, df_fw_clean)
    df_id_scored, ml_stats = run_anomaly_and_clustering(df_id_scored)
    audit_report['ml_insights'] = ml_stats
    
    term_active = int(df_id_scored['is_terminated_active_breach'].sum())
    critical_users = int((df_id_scored['threat_tier'] == 'CRITICAL').sum())
    print(f"  [OK] Composite Threat Scoring Complete! Flagged {term_active} terminated-but-active Zero-Trust breaches, {critical_users} CRITICAL risk accounts.")
    
    # -------------------------------------------------------------
    # 6. Save Clean Datasets (CSV & Parquet)
    # -------------------------------------------------------------
    print("\n[+] Exporting Cleaned Telemetry Artifacts to data/cleaned/ ...")
    df_id_scored.to_csv(os.path.join(CLEAN_DIR, 'cleaned_identity_user_master.csv'), index=False)
    df_fw_clean.to_csv(os.path.join(CLEAN_DIR, 'cleaned_firewall_events.csv'), index=False)
    df_iam_clean.to_csv(os.path.join(CLEAN_DIR, 'cleaned_iam_audit_events.csv'), index=False)
    df_edr_clean.to_csv(os.path.join(CLEAN_DIR, 'cleaned_endpoint_alerts.csv'), index=False)
    
    # -------------------------------------------------------------
    # 7. Initialize DuckDB Star Schema & Views
    # -------------------------------------------------------------
    print("\n[+] Initializing DuckDB Star Schema & Analytical Views...")
    con = init_star_schema(df_id_scored, df_fw_clean, df_iam_clean, df_edr_clean, DB_PATH)
    print(f"  [OK] DuckDB Star Schema ready at: {DB_PATH}")
    
    # -------------------------------------------------------------
    # 8. Export Audit Summary
    # -------------------------------------------------------------
    audit_json_path = os.path.join(CLEAN_DIR, 'data_cleaning_audit.json')
    with open(audit_json_path, 'w', encoding='utf-8') as f:
        json.dump(audit_report, f, indent=2)
        
    summary_rows = [
        {'Dataset': 'Identity & Asset Master', 'Raw Rows': id_stats['raw_rows'], 'Clean Rows': id_stats['cleaned_rows'], 'Deduplications': id_stats['deduped_rows'], 'Key Anomalies Flagged': f"{id_stats['terminated_employees']} Terminated Staff"},
        {'Dataset': 'Firewall Logs', 'Raw Rows': fw_stats['raw_rows'], 'Clean Rows': fw_stats['cleaned_rows'], 'Deduplications': fw_stats['deduped_rows'], 'Key Anomalies Flagged': f"{fw_stats['malformed_ips']} Malformed IPs, {fw_stats['invalid_ports']} Bad Ports"},
        {'Dataset': 'IAM Audit Trail', 'Raw Rows': iam_stats['raw_rows'], 'Clean Rows': iam_stats['cleaned_rows'], 'Deduplications': iam_stats['deduped_rows'], 'Key Anomalies Flagged': f"{iam_stats['failed_logins']} Failed Logins, {iam_stats['mfa_failures']} MFA Failures"},
        {'Dataset': 'Endpoint Alerts', 'Raw Rows': edr_stats['raw_rows'], 'Clean Rows': edr_stats['cleaned_rows'], 'Deduplications': edr_stats['deduped_rows'], 'Key Anomalies Flagged': f"{edr_stats['temporal_anomalies']} Temporal Paradoxes, {edr_stats['critical_alerts']} Critical Alerts"},
    ]
    df_summary = pd.DataFrame(summary_rows)
    df_summary.to_csv(os.path.join(OUT_DIR, 'cleaning_summary.csv'), index=False)
    
    elapsed = round(time.time() - start_time, 2)
    print("\n" + "=" * 70)
    print(f">> PIPELINE EXECUTION COMPLETED SUCCESSFULLY IN {elapsed}s!")
    print("=" * 70)
    print(df_summary.to_string(index=False))
    print("=" * 70)

if __name__ == '__main__':
    run_pipeline()
