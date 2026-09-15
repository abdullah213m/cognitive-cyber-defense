"""
AgentIQ Datathon - Track 2: Cybersecurity
IAM Audit Trail Cleaner & Normalizer
"""

import re
from typing import Dict, Any, Tuple, List, Union
import pandas as pd
from .common import (
    normalize_user_id,
    normalize_hostname,
    normalize_device_id,
    parse_datetime,
    normalize_department,
    normalize_boolean,
    normalize_risk_score
)
from .firewall_cleaner import validate_ip

def normalize_iam_event_type(evt: Any) -> Tuple[str, str]:
    """
    Standardize IAM event types.
    Returns: (canonical_event_type, simplified_category)
    simplified_category is one of: 'login_success', 'login_failed', 'mfa_failed', 'account_action', 'other'
    """
    if evt is None or pd.isna(evt):
        return ('UNKNOWN_EVENT', 'other')
    
    e = str(evt).strip().upper().replace(' ', '_').replace('-', '_')
    
    if any(k in e for k in ('MFA_FAIL', 'MFA_REJECT', 'OTP_FAIL', 'BIOMETRIC_FAIL')):
        return ('MFA_FAILED', 'mfa_failed')
    if any(k in e for k in ('MFA_SUCC', 'MFA_PASS', 'OTP_SUCC', 'MFA_OK')):
        return ('MFA_PASSED', 'login_success')
    if any(k in e for k in ('LOGON_FAIL', 'LOGIN_FAIL', 'AUTH_FAIL', 'BAD_PWD', 'BAD_PASSWORD', 'INVALID_CRED')):
        return ('LOGIN_FAILED', 'login_failed')
    if any(k in e for k in ('LOGON_SUCC', 'LOGIN_SUCC', 'AUTH_SUCC', 'LOGON_OK', 'LOGIN_OK', 'AUTH_OK')):
        return ('LOGIN_SUCCESS', 'login_success')
    if any(k in e for k in ('PWD_CHG', 'PASSWORD_CHANGE', 'PASSWORD_RESET', 'PWD_RESET')):
        return ('PASSWORD_CHANGE', 'account_action')
    if any(k in e for k in ('PRIV', 'ESCALAT', 'ROLE_CHANGE', 'PERMISSION')):
        return ('PRIVILEGE_CHANGE', 'account_action')
    if any(k in e for k in ('LOCK', 'UNLOCK', 'SUSPEND', 'DISABLE')):
        return ('ACCOUNT_STATUS_CHANGE', 'account_action')
    if 'LOGOFF' in e or 'LOGOUT' in e:
        return ('LOGOUT', 'other')
        
    return (e, 'other')


def clean_iam_audit_trail(raw_data: Union[List[Dict[str, Any]], pd.DataFrame]) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Clean and normalize IAM audit trail events.
    """
    if isinstance(raw_data, list):
        df_raw = pd.DataFrame(raw_data)
    else:
        df_raw = raw_data.copy()
        
    raw_count = len(df_raw)
    stats = {
        'raw_rows': raw_count,
        'deduped_rows': 0,
        'missing_timestamps': 0,
        'invalid_user_ids': 0,
        'failed_logins': 0,
        'mfa_failures': 0,
        'cleaned_rows': 0
    }
    
    # 1. Deduplicate by event_id
    if 'event_id' in df_raw.columns:
        df = df_raw.drop_duplicates(subset=['event_id']).copy()
    else:
        df = df_raw.drop_duplicates().copy()
        
    stats['deduped_rows'] = raw_count - len(df)
    
    # 2. Parse timestamps
    df['timestamp_clean'] = df['timestamp'].apply(parse_datetime)
    stats['missing_timestamps'] = int(df['timestamp_clean'].isna().sum())
    
    # 3. User ID & Username normalization
    df['user_id_clean'] = df['user_id'].apply(normalize_user_id)
    stats['invalid_user_ids'] = int(df['user_id_clean'].isna().sum())
    
    df['username_clean'] = df['username'].fillna('unknown').astype(str).str.strip().str.lower()
    
    # 4. Department normalization
    df['department_clean'] = df['department'].apply(normalize_department)
    
    # 5. Event Type normalization
    evt_res = df['event_type'].apply(normalize_iam_event_type)
    df['event_type_clean'] = evt_res.apply(lambda x: x[0])
    df['event_category'] = evt_res.apply(lambda x: x[1])
    
    df['is_failed_login'] = df['event_category'].isin(['login_failed', 'mfa_failed'])
    df['is_mfa_failed'] = df['event_category'] == 'mfa_failed'
    
    stats['failed_logins'] = int(df['is_failed_login'].sum())
    stats['mfa_failures'] = int(df['is_mfa_failed'].sum())
    
    # 6. Auth Method
    def clean_auth(val):
        if val is None or pd.isna(val):
            return 'UNKNOWN'
        s = str(val).strip().upper()
        if 'OTP' in s:
            return 'OTP'
        if 'BIO' in s:
            return 'BIOMETRIC'
        if 'PWD' in s or 'PASSWORD' in s:
            return 'PASSWORD'
        if 'SSO' in s:
            return 'SSO'
        if 'FIDO' in s:
            return 'FIDO2'
        return s if s else 'UNKNOWN'
    df['auth_method_clean'] = df['auth_method'].apply(clean_auth)
    
    # 7. Source IP normalization (e.g. fix '10-141.198' -> malformed IP flag)
    def sanitize_ip_candidate(ip_cand):
        if ip_cand is None or pd.isna(ip_cand):
            return ""
        s = str(ip_cand).strip().replace('-', '.')
        return s
    
    ip_clean_res = df['source_ip'].apply(sanitize_ip_candidate).apply(validate_ip)
    df['source_ip_clean'] = ip_clean_res.apply(lambda x: x[0])
    df['is_source_ip_valid'] = ip_clean_res.apply(lambda x: x[1])
    df['is_source_ip_tampered'] = ip_clean_res.apply(lambda x: x[2])
    
    # 8. Hostname & Device ID
    df['hostname_clean'] = df['hostname'].apply(normalize_hostname)
    df['device_id_clean'] = df['device_id'].apply(normalize_device_id)
    
    # 9. Session ID
    def clean_session_id(s):
        if s is None or pd.isna(s):
            return 'UNKNOWN_SESSION'
        s_str = str(s).strip()
        if not s_str or s_str.lower() in ('na', 'nan', 'null', 'none', ''):
            return 'UNKNOWN_SESSION'
        return s_str.upper()
    df['session_id_clean'] = df['session_id'].apply(clean_session_id)
    
    # 10. MFA passed boolean
    df['mfa_passed_clean'] = df['mfa_passed'].apply(normalize_boolean)
    
    # 11. Failure reason
    df['failure_reason_clean'] = df['failure_reason'].fillna('None').astype(str).str.strip()
    
    # 12. Risk Score normalization (0-100 float)
    df['risk_score_clean'] = df['risk_score'].apply(normalize_risk_score)
    
    # 13. Geo location
    df['geo_location_clean'] = df['geo_location'].fillna('Unknown').astype(str).str.strip()
    
    stats['cleaned_rows'] = len(df)
    return df, stats
