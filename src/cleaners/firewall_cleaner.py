"""
AgentIQ Datathon - Track 2: Cybersecurity
Firewall Telemetry Cleaner & Normalizer
"""

import re
import ipaddress
from typing import Dict, Any, Tuple
import pandas as pd
from .common import normalize_hostname, parse_datetime, normalize_boolean

def validate_ip(ip_str: Any) -> Tuple[str, bool, bool]:
    """
    Validates IP addresses.
    Returns: (cleaned_ip, is_valid, is_tampered_or_malformed)
    Corrupted IPs (e.g. 999.999.999.999, 192.168.69., 101.219.19.127.0) are flagged rather than dropped.
    """
    if ip_str is None or pd.isna(ip_str):
        return ("0.0.0.0", False, True)
    
    s = str(ip_str).strip()
    if not s or s.lower() in ('none', 'nan', 'null', 'na', 'unknown', ''):
        return ("0.0.0.0", False, True)
    
    # Check for trailing extra octet/dot like 101.219.19.127.0 or 192.168.69.
    try:
        ip_obj = ipaddress.ip_address(s)
        return (str(ip_obj), True, False)
    except ValueError:
        # Check if it's an impossible IP like 999.999.999.999
        if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', s):
            parts = [int(p) for p in s.split('.')]
            if any(p > 255 for p in parts):
                return (s, False, True)
        
        # Check for malformed / truncated IPs like 192.168.69. or 10.232.175
        return (s, False, True)


def normalize_protocol(proto: Any) -> str:
    """Normalize protocol strings e.g. TCP/6, tcp, UDP, 17, ICMP"""
    if proto is None or pd.isna(proto):
        return 'OTHER'
    p = str(proto).strip().upper()
    if 'TCP' in p or p == '6':
        return 'TCP'
    if 'UDP' in p or p == '17':
        return 'UDP'
    if 'ICMP' in p or p == '1':
        return 'ICMP'
    if 'HTTP' in p:
        return 'HTTP'
    if 'HTTPS' in p or p == '443':
        return 'HTTPS'
    if 'DNS' in p or p == '53':
        return 'DNS'
    if 'SSH' in p or p == '22':
        return 'SSH'
    if 'RDP' in p or p == '3389':
        return 'RDP'
    return p if p else 'OTHER'


def normalize_firewall_action(act: Any) -> str:
    """Normalize firewall actions to ALLOW or DENY"""
    if act is None or pd.isna(act):
        return 'DENY'
    a = str(act).strip().lower()
    if a in ('permit', 'pass', 'allow', 'accept', 'permitted', 'allowed'):
        return 'ALLOW'
    if a in ('deny', 'drop', 'block', 'reject', 'denied', 'dropped', 'blocked'):
        return 'DENY'
    return 'DENY'


def parse_bytes(val: Any) -> int:
    """Parse comma-formatted byte strings '15,092,296' to int"""
    if val is None or pd.isna(val):
        return 0
    s = str(val).replace(',', '').strip()
    try:
        b = int(float(s))
        return max(0, b)
    except (ValueError, TypeError):
        return 0


def parse_port(val: Any) -> int:
    """Parse port numbers with range validation (0-65535)"""
    if val is None or pd.isna(val):
        return -1
    s = str(val).strip()
    try:
        p = int(float(s))
        if 0 <= p <= 65535:
            return p
        return -1
    except (ValueError, TypeError):
        return -1


def clean_firewall_logs(df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Clean and normalize firewall telemetry DataFrame.
    """
    raw_count = len(df_raw)
    stats = {
        'raw_rows': raw_count,
        'deduped_rows': 0,
        'missing_timestamps': 0,
        'malformed_ips': 0,
        'invalid_ports': 0,
        'cleaned_rows': 0
    }
    
    # 1. Deduplicate by log_id if present, else full row
    if 'log_id' in df_raw.columns:
        df = df_raw.drop_duplicates(subset=['log_id']).copy()
    else:
        df = df_raw.drop_duplicates().copy()
        
    stats['deduped_rows'] = raw_count - len(df)
    
    # 2. Parse timestamps
    df['timestamp_clean'] = df['timestamp'].apply(parse_datetime)
    stats['missing_timestamps'] = int(df['timestamp_clean'].isna().sum())
    
    # 3. Hostname normalization
    df['hostname_clean'] = df['hostname'].apply(normalize_hostname)
    
    # 4. IP Validation & Flagging
    src_res = df['src_ip'].apply(validate_ip)
    df['src_ip_clean'] = src_res.apply(lambda x: x[0])
    df['is_src_ip_valid'] = src_res.apply(lambda x: x[1])
    df['is_src_ip_tampered'] = src_res.apply(lambda x: x[2])
    
    dst_res = df['dst_ip'].apply(validate_ip)
    df['dst_ip_clean'] = dst_res.apply(lambda x: x[0])
    df['is_dst_ip_valid'] = dst_res.apply(lambda x: x[1])
    df['is_dst_ip_tampered'] = dst_res.apply(lambda x: x[2])
    
    df['is_ip_tampered'] = df['is_src_ip_tampered'] | df['is_dst_ip_tampered']
    stats['malformed_ips'] = int(df['is_ip_tampered'].sum())
    
    # 5. Port normalization
    df['src_port_clean'] = df['src_port'].apply(parse_port)
    df['dst_port_clean'] = df['dst_port'].apply(parse_port)
    df['is_port_anomalous'] = (df['src_port_clean'] == -1) | (df['dst_port_clean'] == -1)
    stats['invalid_ports'] = int(df['is_port_anomalous'].sum())
    
    # 6. Protocol & Action
    df['protocol_clean'] = df['protocol'].apply(normalize_protocol)
    df['action_clean'] = df['action'].apply(normalize_firewall_action)
    
    # 7. Bytes sent / received
    df['bytes_sent_clean'] = df['bytes_sent'].apply(parse_bytes)
    df['bytes_received_clean'] = df['bytes_received'].apply(parse_bytes)
    df['total_bytes'] = df['bytes_sent_clean'] + df['bytes_received_clean']
    
    # 8. Session ID
    def clean_session_id(s):
        if s is None or pd.isna(s):
            return 'UNKNOWN_SESSION'
        s_str = str(s).strip()
        if not s_str or s_str.lower() in ('na', 'nan', 'null', 'none', ''):
            return 'UNKNOWN_SESSION'
        return s_str.upper()
    df['session_id_clean'] = df['session_id'].apply(clean_session_id)
    
    # 9. Threat flag
    df['threat_flag_clean'] = df['threat_flag'].apply(lambda x: bool(normalize_boolean(x)))
    
    # 10. Rule name & Geo country
    df['rule_name_clean'] = df['rule_name'].fillna('UNKNOWN').astype(str).str.strip().str.upper()
    df['geo_country_clean'] = df['geo_country'].fillna('Unknown').astype(str).str.strip().str.title()
    df['geo_country_clean'] = df['geo_country_clean'].replace({'': 'Unknown', 'Na': 'Unknown', 'Nan': 'Unknown'})
    
    stats['cleaned_rows'] = len(df)
    return df, stats
