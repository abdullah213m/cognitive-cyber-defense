"""
AgentIQ Datathon - Track 2: Cybersecurity
Governed Analytics Layer - DuckDB Star Schema & SQL Views
"""

import os
from typing import Optional
import duckdb
import pandas as pd

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'database', 'cybersecurity_analytics.duckdb')

def get_duckdb_connection(db_path: str = DB_PATH) -> duckdb.DuckDBPyConnection:
    """
    Returns a DuckDB connection to the local database file.
    """
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    return duckdb.connect(db_path)


def init_star_schema(
    df_identity_scored: pd.DataFrame,
    df_firewall: pd.DataFrame,
    df_iam: pd.DataFrame,
    df_endpoint: pd.DataFrame,
    db_path: str = DB_PATH
) -> duckdb.DuckDBPyConnection:
    """
    Builds the governed Star Schema tables and analytical SQL views in DuckDB.
    """
    con = get_duckdb_connection(db_path)
    
    # 1. Create Dimension Tables
    con.register('df_identity_temp', df_identity_scored)
    con.execute("""
        CREATE OR REPLACE TABLE dim_identity_user AS
        SELECT 
            user_id_clean AS user_id,
            username_clean AS username,
            full_name_clean AS full_name,
            department_clean AS department,
            role_clean AS role,
            location_clean AS location,
            hostname_clean AS hostname,
            device_id_clean AS device_id,
            status_clean AS status,
            hire_date_clean AS hire_date,
            termination_date_clean AS termination_date,
            is_terminated,
            manager_username_clean AS manager_username,
            identity_risk_score,
            access_risk_score,
            endpoint_risk_score,
            network_risk_score,
            composite_threat_score,
            threat_tier,
            is_terminated_active_breach,
            is_brute_force_suspect,
            is_tampering_suspect,
            failed_logins,
            mfa_failures,
            total_alerts,
            critical_alerts,
            temporal_anomalies,
            total_fw_events,
            denied_fw_events
        FROM df_identity_temp
    """)
    
    # Dimension Asset Host
    con.execute("""
        CREATE OR REPLACE TABLE dim_asset_host AS
        SELECT DISTINCT
            hostname_clean AS hostname,
            device_id_clean AS device_id,
            department_clean AS department,
            location_clean AS location,
            user_id_clean AS assigned_user_id
        FROM df_identity_temp
        WHERE hostname_clean IS NOT NULL
    """)
    
    # 2. Create Fact Tables
    con.register('df_firewall_temp', df_firewall)
    con.execute("""
        CREATE OR REPLACE TABLE fact_firewall_events AS
        SELECT 
            log_id,
            TRY_CAST(timestamp_clean AS TIMESTAMP) AS event_timestamp,
            hostname_clean AS hostname,
            src_ip_clean AS src_ip,
            dst_ip_clean AS dst_ip,
            is_src_ip_valid,
            is_dst_ip_valid,
            is_ip_tampered,
            src_port_clean AS src_port,
            dst_port_clean AS dst_port,
            is_port_anomalous,
            protocol_clean AS protocol,
            action_clean AS action,
            bytes_sent_clean AS bytes_sent,
            bytes_received_clean AS bytes_received,
            total_bytes,
            session_id_clean AS session_id,
            threat_flag_clean AS threat_flag,
            rule_name_clean AS rule_name,
            geo_country_clean AS geo_country
        FROM df_firewall_temp
    """)
    
    con.register('df_iam_temp', df_iam)
    con.execute("""
        CREATE OR REPLACE TABLE fact_iam_audit AS
        SELECT 
            event_id,
            TRY_CAST(timestamp_clean AS TIMESTAMP) AS event_timestamp,
            user_id_clean AS user_id,
            username_clean AS username,
            department_clean AS department,
            event_type_clean AS event_type,
            event_category,
            is_failed_login,
            is_mfa_failed,
            auth_method_clean AS auth_method,
            source_ip_clean AS source_ip,
            is_source_ip_valid,
            is_source_ip_tampered,
            hostname_clean AS hostname,
            device_id_clean AS device_id,
            session_id_clean AS session_id,
            mfa_passed_clean AS mfa_passed,
            failure_reason_clean AS failure_reason,
            risk_score_clean AS risk_score,
            geo_location_clean AS geo_location
        FROM df_iam_temp
    """)
    
    con.register('df_endpoint_temp', df_endpoint)
    con.execute("""
        CREATE OR REPLACE TABLE fact_endpoint_alerts AS
        SELECT 
            alert_id,
            TRY_CAST(detected_timestamp_clean AS TIMESTAMP) AS detected_timestamp,
            TRY_CAST(resolved_timestamp_clean AS TIMESTAMP) AS resolved_timestamp,
            is_temporal_anomaly,
            resolution_time_hours,
            user_id_clean AS user_id,
            hostname_clean AS hostname,
            alert_type_clean AS alert_type,
            is_high_threat_type,
            severity_clean AS severity,
            severity_score,
            status_clean AS status,
            is_active_alert,
            file_path_clean AS file_path,
            sha256_clean AS sha256_hash
        FROM df_endpoint_temp
    """)
    
    # 3. Create High-Value Analytical SQL Views
    
    # View 1: Top Insider Threat Leaderboard
    con.execute("""
        CREATE OR REPLACE VIEW v_insider_threat_leaderboard AS
        SELECT 
            user_id,
            full_name,
            department,
            role,
            status,
            composite_threat_score,
            threat_tier,
            identity_risk_score,
            access_risk_score,
            endpoint_risk_score,
            network_risk_score,
            failed_logins,
            mfa_failures,
            critical_alerts,
            temporal_anomalies,
            is_terminated_active_breach,
            is_brute_force_suspect,
            is_tampering_suspect
        FROM dim_identity_user
        ORDER BY composite_threat_score DESC
    """)
    
    # View 2: Daily Failed Logins by Department
    con.execute("""
        CREATE OR REPLACE VIEW v_daily_department_logins AS
        SELECT 
            CAST(event_timestamp AS DATE) AS log_date,
            department,
            COUNT(*) AS total_login_attempts,
            SUM(CASE WHEN is_failed_login THEN 1 ELSE 0 END) AS failed_logins,
            SUM(CASE WHEN is_mfa_failed THEN 1 ELSE 0 END) AS mfa_failures,
            ROUND(SUM(CASE WHEN is_failed_login THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS failure_rate_pct
        FROM fact_iam_audit
        WHERE event_timestamp IS NOT NULL
        GROUP BY 1, 2
        ORDER BY 1 DESC, 4 DESC
    """)
    
    # View 3: Firewall Protocol & Action Matrix
    con.execute("""
        CREATE OR REPLACE VIEW v_firewall_protocol_summary AS
        SELECT 
            protocol,
            action,
            COUNT(*) AS packet_count,
            SUM(total_bytes) AS total_bytes_transferred,
            SUM(CASE WHEN is_ip_tampered THEN 1 ELSE 0 END) AS tampered_ip_packets,
            SUM(CASE WHEN threat_flag THEN 1 ELSE 0 END) AS threat_flagged_packets
        FROM fact_firewall_events
        GROUP BY 1, 2
        ORDER BY 3 DESC
    """)
    
    # View 4: Zero Trust Breaches (Terminated active users, tampering, critical attacks)
    con.execute("""
        CREATE OR REPLACE VIEW v_zero_trust_breaches AS
        SELECT 
            u.user_id,
            u.full_name,
            u.department,
            u.role,
            u.status,
            u.termination_date,
            u.composite_threat_score,
            u.is_terminated_active_breach,
            u.is_brute_force_suspect,
            u.is_tampering_suspect,
            u.failed_logins,
            u.critical_alerts,
            u.temporal_anomalies
        FROM dim_identity_user u
        WHERE u.is_terminated_active_breach = TRUE 
           OR u.is_brute_force_suspect = TRUE 
           OR u.is_tampering_suspect = TRUE
           OR u.threat_tier = 'CRITICAL'
        ORDER BY u.composite_threat_score DESC
    """)
    
    return con
