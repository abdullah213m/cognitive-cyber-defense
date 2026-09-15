"""
AgentIQ Datathon - Track 2: Cybersecurity
Endpoint Detection & Response (EDR) Alerts Cleaner & Normalizer
"""

import re
from typing import Dict, Any, Tuple
from datetime import datetime
import pandas as pd
from .common import (
    normalize_user_id,
    normalize_hostname,
    parse_datetime
)

def normalize_severity(sev: Any) -> Tuple[str, int]:
    """
    Standardize endpoint alert severity across multi-tier schemas.
    Returns: (canonical_severity, severity_score_0_to_100)
    """
    if sev is None or pd.isna(sev):
        return ('MEDIUM', 50)
        
    s = str(sev).strip().upper()
    
    if s in ('CRITICAL', 'SEVERE', 'P1', 'FATAL', 'EMERGENCY'):
        return ('CRITICAL', 100)
    if s in ('HIGH', 'P2', 'H', 'URGENT'):
        return ('HIGH', 75)
    if s in ('MEDIUM', 'MED', 'P3', 'M', 'MODERATE'):
        return ('MEDIUM', 50)
    if s in ('LOW', 'P4', 'L', 'MINOR'):
        return ('LOW', 25)
    if s in ('INFO', 'INFORMATIONAL', 'P5', 'NOTICE', 'DEBUG'):
        return ('INFORMATIONAL', 10)
        
    # Check contains
    if 'CRIT' in s or 'SEVER' in s:
        return ('CRITICAL', 100)
    if 'HIGH' in s:
        return ('HIGH', 75)
    if 'MED' in s:
        return ('MEDIUM', 50)
    if 'LOW' in s:
        return ('LOW', 25)
    if 'INFO' in s:
        return ('INFORMATIONAL', 10)
        
    return ('MEDIUM', 50)


def normalize_alert_status(stat: Any) -> str:
    """Standardize alert status"""
    if stat is None or pd.isna(stat):
        return 'OPEN'
    s = str(stat).strip().upper().replace(' ', '_').replace('-', '_')
    if any(k in s for k in ('RESOLV', 'FIX', 'CLOSE', 'MITIGAT', 'DONE')):
        return 'RESOLVED'
    if any(k in s for k in ('WIP', 'PROGRESS', 'INVESTIGAT', 'REVIEW', 'ASSIGNED')):
        return 'IN_PROGRESS'
    if any(k in s for k in ('FALSE', 'IGNORE', 'DISMISS', 'SUPPRESS')):
        return 'DISMISSED'
    return 'OPEN'


def clean_endpoint_alerts(df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Clean and normalize Endpoint Detection & Response (EDR) alerts.
    Detects and flags impossible resolution timestamps (where resolved < detected).
    """
    raw_count = len(df_raw)
    stats = {
        'raw_rows': raw_count,
        'deduped_rows': 0,
        'missing_detected_timestamps': 0,
        'temporal_anomalies': 0,
        'critical_alerts': 0,
        'cleaned_rows': 0
    }
    
    # 1. Deduplicate by alert_id
    if 'alert_id' in df_raw.columns:
        df = df_raw.drop_duplicates(subset=['alert_id']).copy()
    else:
        df = df_raw.drop_duplicates().copy()
        
    stats['deduped_rows'] = raw_count - len(df)
    
    # 2. Parse timestamps
    df['detected_timestamp_clean'] = df['detected_timestamp'].apply(parse_datetime)
    df['resolved_timestamp_clean'] = df['resolved_timestamp'].apply(parse_datetime)
    stats['missing_detected_timestamps'] = int(df['detected_timestamp_clean'].isna().sum())
    
    # 3. Detect temporal logical anomaly (resolved before detected)
    def check_temporal_anomaly(row):
        d_str = row['detected_timestamp_clean']
        r_str = row['resolved_timestamp_clean']
        if pd.notna(d_str) and pd.notna(r_str) and isinstance(d_str, str) and isinstance(r_str, str):
            try:
                dt_d = datetime.strptime(d_str, '%Y-%m-%d %H:%M:%S')
                dt_r = datetime.strptime(r_str, '%Y-%m-%d %H:%M:%S')
                if dt_r < dt_d:
                    return True
            except (ValueError, TypeError):
                pass
        return False
        
    df['is_temporal_anomaly'] = df.apply(check_temporal_anomaly, axis=1)
    stats['temporal_anomalies'] = int(df['is_temporal_anomaly'].sum())
    
    # Calculate resolution time in hours where valid
    def calc_resolution_hours(row):
        d_str = row['detected_timestamp_clean']
        r_str = row['resolved_timestamp_clean']
        if pd.notna(d_str) and pd.notna(r_str) and isinstance(d_str, str) and isinstance(r_str, str) and not row['is_temporal_anomaly']:
            try:
                dt_d = datetime.strptime(d_str, '%Y-%m-%d %H:%M:%S')
                dt_r = datetime.strptime(r_str, '%Y-%m-%d %H:%M:%S')
                hours = (dt_r - dt_d).total_seconds() / 3600.0
                return max(0.0, round(hours, 2))
            except (ValueError, TypeError):
                pass
        return None
        
    df['resolution_time_hours'] = df.apply(calc_resolution_hours, axis=1)
    
    # 4. User ID & Hostname
    df['user_id_clean'] = df['user_id'].apply(normalize_user_id)
    df['hostname_clean'] = df['hostname'].apply(normalize_hostname)
    
    # 5. Severity normalization
    sev_res = df['severity'].apply(normalize_severity)
    df['severity_clean'] = sev_res.apply(lambda x: x[0])
    df['severity_score'] = sev_res.apply(lambda x: x[1])
    
    stats['critical_alerts'] = int((df['severity_clean'] == 'CRITICAL').sum())
    
    # 6. Status normalization
    df['status_clean'] = df['status'].apply(normalize_alert_status)
    df['is_active_alert'] = df['status_clean'].isin(['OPEN', 'IN_PROGRESS'])
    
    # 7. Alert type & High risk classification
    def categorize_alert(at):
        if at is None or pd.isna(at):
            return 'Generic Threat'
        return str(at).strip().title()
        
    alert_col = 'alert_name' if 'alert_name' in df.columns else ('alert_type' if 'alert_type' in df.columns else None)
    if alert_col:
        df['alert_type_clean'] = df[alert_col].apply(categorize_alert)
    else:
        df['alert_type_clean'] = 'Generic Threat'
    
    high_threat_keywords = ['ransomware', 'lateral', 'mimikatz', 'exfiltration', 'dump', 'privilege', 'backdoor', 'c2', 'trojan', 'malware', 'powershell', 'injection']
    df['is_high_threat_type'] = df['alert_type_clean'].apply(
        lambda x: any(k in str(x).lower() for k in high_threat_keywords)
    )
    
    # 8. Clean file path, process name & hash
    if 'file_path' in df.columns:
        df['file_path_clean'] = df['file_path'].fillna('Unknown').astype(str).str.strip()
    else:
        df['file_path_clean'] = 'Unknown'
        
    hash_col = 'sha256' if 'sha256' in df.columns else ('sha256_hash' if 'sha256_hash' in df.columns else None)
    if hash_col:
        df['sha256_clean'] = df[hash_col].fillna('Unknown').astype(str).str.strip().str.lower()
    else:
        df['sha256_clean'] = 'Unknown'
        
    stats['cleaned_rows'] = len(df)
    return df, stats

