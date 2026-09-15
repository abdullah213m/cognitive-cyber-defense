"""
Unit Tests for AgentIQ Datathon Track 2: Cybersecurity Data Pipeline
"""

import os
import sys
import pytest
import pandas as pd
from datetime import datetime

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.cleaners.common import (
    normalize_user_id,
    normalize_hostname,
    normalize_device_id,
    parse_datetime,
    normalize_department,
    normalize_boolean,
    normalize_risk_score
)
from src.cleaners.firewall_cleaner import validate_ip, normalize_firewall_action, normalize_protocol
from src.cleaners.endpoint_cleaner import normalize_severity, normalize_alert_status
from src.analytics.threat_scoring import calculate_insider_threat_scores

def test_user_id_normalization():
    assert normalize_user_id("EMP12345") == "EMP12345"
    assert normalize_user_id("emp12345") == "EMP12345"
    assert normalize_user_id("EMP-12345") == "EMP12345"
    assert normalize_user_id("emp_12345") == "EMP12345"
    assert normalize_user_id("EMP 12345") == "EMP12345"
    assert normalize_user_id("12345") == "EMP12345"
    assert normalize_user_id("12345.0") == "EMP12345"
    assert normalize_user_id(None) is None
    assert normalize_user_id("NA") is None

def test_hostname_normalization():
    assert normalize_hostname("VDR-11307.corp.local") == "VDR-11307"
    assert normalize_hostname("LPT_12621") == "LPT-12621"
    assert normalize_hostname("ws-11601.local") == "WS-11601"
    assert normalize_hostname(None) is None

def test_timestamp_parsing():
    # Unix epoch
    assert parse_datetime("1736578363") == "2025-01-11 06:52:43"
    # Slash format
    assert parse_datetime("18/05/2026 23:12") == "2026-05-18 23:12:00"
    # ISO format
    assert parse_datetime("2026-08-25T08:26:06") == "2026-08-25 08:26:06"
    # Standard format
    assert parse_datetime("2026-09-03 07:11:28") == "2026-09-03 07:11:28"
    assert parse_datetime("not available") is None

def test_department_normalization():
    assert normalize_department("Ops") == "Operations"
    assert normalize_department("Ops Team") == "Operations"
    assert normalize_department("LEGAL") == "Legal"
    assert normalize_department("RnD") == "R&D"
    assert normalize_department("Supply Chain") == "Supply Chain"
    assert normalize_department(None) == "Unknown"

def test_ip_validation():
    # Valid IP
    ip, is_valid, is_tampered = validate_ip("192.168.1.1")
    assert is_valid is True
    assert is_tampered is False
    
    # Tampered / Impossible IP
    ip, is_valid, is_tampered = validate_ip("999.999.999.999")
    assert is_valid is False
    assert is_tampered is True
    
    # Malformed / Truncated IP
    ip, is_valid, is_tampered = validate_ip("192.168.69.")
    assert is_valid is False
    assert is_tampered is True

def test_risk_score_normalization():
    assert normalize_risk_score("78/100") == 78.0
    assert normalize_risk_score(85) == 85.0
    assert normalize_risk_score("High") == 75.0
    assert normalize_risk_score("Critical") == 95.0
    assert normalize_risk_score(0.65) == 65.0
    assert normalize_risk_score(None) == 0.0

def test_severity_normalization():
    assert normalize_severity("Severe")[0] == "CRITICAL"
    assert normalize_severity("P1")[0] == "CRITICAL"
    assert normalize_severity("HIGH")[0] == "HIGH"
    assert normalize_severity("P3")[0] == "MEDIUM"
    assert normalize_severity("P4")[0] == "LOW"

def test_threat_scoring_computation():
    # Mock single employee
    df_id = pd.DataFrame([{
        'user_id_clean': 'EMP99999',
        'username_clean': 'test.user',
        'full_name_clean': 'Test User',
        'department_clean': 'Finance',
        'role_clean': 'Analyst',
        'hostname_clean': 'LPT-99999',
        'device_id_clean': 'DEV-99999',
        'status_clean': 'ACTIVE',
        'is_terminated': False
    }])
    
    df_iam = pd.DataFrame([{
        'event_id': 'IAM1',
        'user_id_clean': 'EMP99999',
        'is_failed_login': True,
        'is_mfa_failed': True,
        'risk_score_clean': 80.0,
        'is_source_ip_tampered': False
    }])
    
    df_edr = pd.DataFrame([{
        'alert_id': 'EDR1',
        'user_id_clean': 'EMP99999',
        'severity_clean': 'CRITICAL',
        'severity_score': 100,
        'is_active_alert': True,
        'is_temporal_anomaly': False,
        'is_high_threat_type': True
    }])
    
    df_fw = pd.DataFrame([{
        'log_id': 'FW1',
        'hostname_clean': 'LPT-99999',
        'action_clean': 'DENY',
        'is_ip_tampered': False,
        'threat_flag_clean': True,
        'total_bytes': 1000
    }])
    
    scored = calculate_insider_threat_scores(df_id, df_iam, df_edr, df_fw)
    assert len(scored) == 1
    score = scored.iloc[0]['composite_threat_score']
    assert 0.0 <= score <= 100.0
    assert scored.iloc[0]['threat_tier'] in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
