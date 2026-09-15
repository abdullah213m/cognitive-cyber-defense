"""
AgentIQ Datathon - Track 2: Cybersecurity
Identity & Asset Master Cleaner & Normalizer
"""

import re
from typing import Dict, Any, Tuple
import pandas as pd
from .common import (
    normalize_user_id,
    normalize_hostname,
    normalize_device_id,
    parse_datetime,
    normalize_department
)

def normalize_employee_status(stat: Any, termination_date_clean: Any) -> Tuple[str, bool]:
    """
    Standardize employee status.
    Returns: (canonical_status, is_terminated_flag)
    canonical_status: 'ACTIVE' or 'TERMINATED'
    """
    if termination_date_clean is not None and pd.notna(termination_date_clean):
        t_str = str(termination_date_clean).strip().lower()
        if t_str and t_str not in ('', 'nan', 'none', 'null', 'nat', 'na', 'not available'):
            return ('TERMINATED', True)
        
    if stat is None or pd.isna(stat):
        return ('ACTIVE', False)
        
    s = str(stat).strip().upper()
    if s in ('TERMINATED', 'OFFBOARDED', 'INACTIVE', 'SUSPENDED', 'DISABLED', 'LEFT', 'RESIGNED', 'FIRED', 'DEACTIVATED', 'EXITED', 'D', 'L', 'BLOCKED'):
        return ('TERMINATED', True)
    if s in ('WORKING', 'LIVE', 'ENABLED', 'A', 'ACTIVE', 'CURRENT', 'EMPLOYED'):
        return ('ACTIVE', False)
    if s in ('LEAVE', 'ON LEAVE', 'ON_LEAVE', 'LWP', 'OOO'):
        return ('INACTIVE_LEAVE', False)
        
    return ('ACTIVE', False)


def normalize_location(loc: Any) -> str:
    """Standardize work locations"""
    if loc is None or pd.isna(loc):
        return 'Head Office'
    s = str(loc).strip().replace('_', ' ').replace('-', ' ').title()
    if not s or s.lower() in ('na', 'nan', 'null', 'none', 'unknown'):
        return 'Head Office'
    if 'Branch' in s:
        return 'Branch Office'
    if any(k in s for k in ('Home', 'Remote', 'Wfh')):
        return 'Remote / WFH'
    if 'Head' in s:
        return 'Head Office'
    return s


def clean_identity_asset_master(df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Clean and normalize Identity and Asset Master data.
    """
    raw_count = len(df_raw)
    stats = {
        'raw_rows': raw_count,
        'deduped_rows': 0,
        'active_employees': 0,
        'terminated_employees': 0,
        'cleaned_rows': 0
    }
    
    # 1. User ID normalization
    df = df_raw.copy()
    df['user_id_clean'] = df['user_id'].apply(normalize_user_id)
    
    # 2. Deduplicate on canonical user_id
    before_dedup = len(df)
    df = df.drop_duplicates(subset=['user_id_clean']).copy()
    # Filter out empty user IDs if any
    df = df[df['user_id_clean'].notna()].copy()
    stats['deduped_rows'] = raw_count - len(df)
    
    # 3. Clean names and usernames
    df['username_clean'] = df['username'].fillna('unknown').astype(str).str.strip().str.lower()
    df['full_name_clean'] = df['full_name'].fillna('Unknown').astype(str).str.strip().str.title()
    df['manager_username_clean'] = df['manager_username'].fillna('none').astype(str).str.strip().str.lower()
    
    # 4. Department & Role
    df['department_clean'] = df['department'].apply(normalize_department)
    df['role_clean'] = df['role'].fillna('Staff').astype(str).str.strip().str.title()
    df['location_clean'] = df['location'].apply(normalize_location)
    
    # 5. Hostname & Device ID
    df['hostname_clean'] = df['hostname'].apply(normalize_hostname)
    df['device_id_clean'] = df['device_id'].apply(normalize_device_id)
    
    # 6. Dates
    df['hire_date_clean'] = df['hire_date'].apply(parse_datetime)
    df['termination_date_clean'] = df['termination_date'].apply(parse_datetime)
    
    # 7. Status & Termination Flag
    status_res = df.apply(lambda row: normalize_employee_status(row['status'], row['termination_date_clean']), axis=1)
    df['status_clean'] = status_res.apply(lambda x: x[0])
    df['is_terminated'] = status_res.apply(lambda x: x[1])
    
    stats['active_employees'] = int((~df['is_terminated']).sum())
    stats['terminated_employees'] = int(df['is_terminated'].sum())
    stats['cleaned_rows'] = len(df)
    
    return df, stats
