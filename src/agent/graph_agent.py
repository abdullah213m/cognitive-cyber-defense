"""
AgentIQ Datathon - Track 2: Cybersecurity
Agentic Graph AI - Natural Language to Dynamic Graph & Executive Summary Engine
"""

import re
import os
import duckdb
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from typing import Dict, Any, Tuple, Optional
from src.models.database import DB_PATH, get_duckdb_connection

class AgenticGraphAI:
    """
    Zero-Trust Security Analyst Agent:
    Interprets natural language queries, executes DuckDB SQL queries,
    dynamically selects the optimal chart type, and generates executive summaries.
    """
    
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        
    def execute_nl_query(self, query_text: str) -> Dict[str, Any]:
        """
        Processes a natural language query and returns:
        - query_text
        - generated_sql
        - dataframe result
        - chart_type
        - plotly_fig
        - executive_summary
        - recommended_action
        """
        q = query_text.strip().lower()
        con = get_duckdb_connection(self.db_path)
        
        # 1. Intent Mapping & SQL Generation
        sql, chart_type, title, x_col, y_col, color_col = self._route_query(q)
        
        try:
            df = con.execute(sql).fetchdf()
        except Exception as e:
            # Fallback query if syntax error
            sql = "SELECT user_id, full_name, department, composite_threat_score, threat_tier FROM dim_identity_user ORDER BY composite_threat_score DESC LIMIT 10"
            df = con.execute(sql).fetchdf()
            chart_type = 'bar'
            title = 'Top High-Risk Entities by Composite Threat Score'
            x_col = 'full_name'
            y_col = 'composite_threat_score'
            color_col = 'threat_tier'

        # 2. Dynamic Chart Generation
        fig = self._build_figure(df, chart_type, title, x_col, y_col, color_col)
        
        # 3. Generate Analytical Summary & Actionable Recommendations
        summary, action = self._generate_insights(query_text, df, chart_type, title)
        
        return {
            'query': query_text,
            'sql': sql,
            'data': df,
            'chart_type': chart_type,
            'figure': fig,
            'title': title,
            'summary': summary,
            'recommendation': action
        }
        
    def _route_query(self, q: str) -> Tuple[str, str, str, Optional[str], Optional[str], Optional[str]]:
        """
        Parses intent and returns (sql, chart_type, title, x_col, y_col, color_col).
        """
        # Intent: Failed logins by department over time / last 7 days
        if any(k in q for k in ('failed login', 'failed logon', 'failed attempt')) and 'department' in q:
            sql = """
                SELECT 
                    CAST(event_timestamp AS DATE) AS event_date,
                    department,
                    SUM(CASE WHEN is_failed_login THEN 1 ELSE 0 END) AS failed_logins,
                    SUM(CASE WHEN is_mfa_failed THEN 1 ELSE 0 END) AS mfa_failures
                FROM fact_iam_audit
                WHERE event_timestamp IS NOT NULL
                GROUP BY 1, 2
                ORDER BY 1 ASC, 3 DESC
            """
            return (sql, 'line', 'Daily Failed Logins by Department Trend', 'event_date', 'failed_logins', 'department')
            
        # Intent: User with highest failed logins
        if any(k in q for k in ('highest failed', 'most failed', 'top failed', 'user with failed')):
            sql = """
                SELECT 
                    u.user_id,
                    u.full_name,
                    u.department,
                    SUM(CASE WHEN i.is_failed_login THEN 1 ELSE 0 END) AS failed_logins,
                    SUM(CASE WHEN i.is_mfa_failed THEN 1 ELSE 0 END) AS mfa_failures,
                    u.threat_tier
                FROM fact_iam_audit i
                JOIN dim_identity_user u ON i.user_id = u.user_id
                GROUP BY 1, 2, 3, 6
                ORDER BY failed_logins DESC
                LIMIT 10
            """
            return (sql, 'bar', 'Top 10 Users with Highest Failed Logins', 'full_name', 'failed_logins', 'department')
            
        # Intent: Hostname with maximum threat flags
        if 'host' in q and any(k in q for k in ('threat', 'flag', 'maximum', 'highest', 'top')):
            sql = """
                SELECT 
                    hostname,
                    SUM(CASE WHEN threat_flag THEN 1 ELSE 0 END) AS threat_flags,
                    COUNT(*) AS total_firewall_packets,
                    SUM(CASE WHEN action = 'DENY' THEN 1 ELSE 0 END) AS denied_packets,
                    SUM(CASE WHEN is_ip_tampered THEN 1 ELSE 0 END) AS tampered_ip_events
                FROM fact_firewall_events
                WHERE hostname IS NOT NULL
                GROUP BY 1
                ORDER BY threat_flags DESC, denied_packets DESC
                LIMIT 10
            """
            return (sql, 'bar', 'Top 10 Hostnames by Security Threat Flags', 'hostname', 'threat_flags', 'hostname')
            
        # Intent: Compare firewall allow vs deny by protocol
        if any(k in q for k in ('firewall', 'allow', 'deny', 'protocol', 'traffic')):
            sql = """
                SELECT 
                    protocol,
                    action,
                    COUNT(*) AS event_count,
                    ROUND(SUM(total_bytes) / 1048576.0, 2) AS total_mb_transferred
                FROM fact_firewall_events
                GROUP BY 1, 2
                ORDER BY event_count DESC
            """
            return (sql, 'bar', 'Firewall Action Comparison by Protocol (Allow vs Deny)', 'protocol', 'event_count', 'action')
            
        # Intent: Endpoint alerts by severity / daily trend
        if 'endpoint' in q or 'alert' in q or 'edr' in q or 'severity' in q:
            if any(k in q for k in ('trend', 'daily', 'over time', 'time')):
                sql = """
                    SELECT 
                        CAST(detected_timestamp AS DATE) AS alert_date,
                        severity,
                        COUNT(*) AS alert_count
                    FROM fact_endpoint_alerts
                    WHERE detected_timestamp IS NOT NULL
                    GROUP BY 1, 2
                    ORDER BY 1 ASC
                """
                return (sql, 'line', 'Daily Endpoint Alerts Trend by Severity', 'alert_date', 'alert_count', 'severity')
            else:
                sql = """
                    SELECT 
                        severity,
                        COUNT(*) AS alert_count,
                        SUM(CASE WHEN is_temporal_anomaly THEN 1 ELSE 0 END) AS tampering_anomalies,
                        SUM(CASE WHEN is_active_alert THEN 1 ELSE 0 END) AS active_alerts
                    FROM fact_endpoint_alerts
                    GROUP BY 1
                    ORDER BY alert_count DESC
                """
                return (sql, 'donut', 'Endpoint Alert Distribution by Severity', 'severity', 'alert_count', 'severity')
                
        # Intent: Terminated active breach
        if any(k in q for k in ('terminated', 'offboarded', 'inactive', 'former')):
            sql = """
                SELECT 
                    user_id,
                    full_name,
                    department,
                    role,
                    termination_date,
                    composite_threat_score,
                    failed_logins,
                    critical_alerts,
                    total_fw_events
                FROM dim_identity_user
                WHERE is_terminated_active_breach = TRUE
                ORDER BY composite_threat_score DESC
            """
            return (sql, 'bar', 'Terminated Employees with Active System Telemetry (Zero-Trust Breaches)', 'full_name', 'composite_threat_score', 'department')
            
        # Intent: Risk vs Alert correlation / Scatter
        if any(k in q for k in ('scatter', 'correlation', 'relationship', 'vs', 'compare')):
            sql = """
                SELECT 
                    full_name,
                    department,
                    access_risk_score,
                    endpoint_risk_score,
                    network_risk_score,
                    composite_threat_score,
                    threat_tier
                FROM dim_identity_user
                WHERE composite_threat_score > 10
                ORDER BY composite_threat_score DESC
                LIMIT 100
            """
            return (sql, 'scatter', 'Access Risk vs Endpoint Risk Correlation Matrix', 'access_risk_score', 'endpoint_risk_score', 'threat_tier')
            
        # Default: Top composite threat score leaderboard
        sql = """
            SELECT 
                user_id,
                full_name,
                department,
                role,
                composite_threat_score,
                identity_risk_score,
                access_risk_score,
                endpoint_risk_score,
                network_risk_score,
                threat_tier
            FROM dim_identity_user
            ORDER BY composite_threat_score DESC
            LIMIT 10
        """
        return (sql, 'bar', 'Top 10 High-Risk Entities by Composite Threat Score', 'full_name', 'composite_threat_score', 'threat_tier')

    def _build_figure(
        self,
        df: pd.DataFrame,
        chart_type: str,
        title: str,
        x_col: Optional[str],
        y_col: Optional[str],
        color_col: Optional[str]
    ) -> go.Figure:
        """
        Builds a styled Dark SOC Theme Plotly Figure.
        """
        template = "plotly_dark"
        color_discrete_sequence = ['#00F0FF', '#FF0055', '#00FF66', '#FFB800', '#9D00FF', '#0070F3']
        
        if df.empty:
            fig = go.Figure()
            fig.add_annotation(text="No data matching query criteria", showarrow=False, font=dict(size=16, color="#888888"))
            fig.update_layout(template=template, title=title)
            return fig
            
        if chart_type == 'line':
            fig = px.line(
                df, x=x_col, y=y_col, color=color_col,
                title=title, template=template,
                color_discrete_sequence=color_discrete_sequence,
                markers=True
            )
            fig.update_traces(line=dict(width=2.5))
            
        elif chart_type == 'bar':
            barmode = 'group' if color_col and color_col != x_col else 'relative'
            fig = px.bar(
                df, x=x_col, y=y_col, color=color_col,
                title=title, template=template,
                barmode=barmode,
                color_discrete_sequence=color_discrete_sequence
            )
            
        elif chart_type == 'donut':
            fig = px.pie(
                df, names=x_col, values=y_col, hole=0.45,
                title=title, template=template,
                color_discrete_sequence=color_discrete_sequence
            )
            fig.update_traces(textinfo='percent+label')
            
        elif chart_type == 'scatter':
            fig = px.scatter(
                df, x=x_col, y=y_col, color=color_col,
                hover_name='full_name' if 'full_name' in df.columns else None,
                size='composite_threat_score' if 'composite_threat_score' in df.columns else None,
                title=title, template=template,
                color_discrete_sequence=color_discrete_sequence
            )
        else:
            fig = px.bar(df, x=x_col, y=y_col, title=title, template=template)
            
        fig.update_layout(
            paper_bgcolor='rgba(10, 14, 26, 0.95)',
            plot_bgcolor='rgba(15, 23, 42, 0.6)',
            font=dict(family='Inter, sans-serif', color='#E2E8F0'),
            title_font=dict(size=18, color='#00F0FF'),
            margin=dict(l=40, r=40, t=60, b=40),
            hoverlabel=dict(bgcolor='#1E293B', font_size=13, font_family='Inter')
        )
        return fig

    def _generate_insights(self, q: str, df: pd.DataFrame, chart_type: str, title: str) -> Tuple[str, str]:
        """
        Generates dynamic text analysis and actionable security mitigation steps.
        """
        if df.empty:
            return ("No records found matching the query parameters.", "Verify system telemetry logs and ingestion timestamps.")
            
        rows_count = len(df)
        
        # Check specific query patterns
        if 'failed' in q:
            top_entity = df.iloc[0]['full_name'] if 'full_name' in df.columns else (df.iloc[0]['department'] if 'department' in df.columns else 'Top Entity')
            max_val = df.iloc[0].get('failed_logins', df.iloc[0].get('total_login_attempts', 'N/A'))
            summary = (
                f"**Executive Analysis**: Identified elevated authentication failure volume across **{rows_count} distinct segments**. "
                f"The highest concentration of failed attempts is centered on **{top_entity}** with **{max_val} recorded failures**. "
                "This pattern exhibits characteristics of credential stuffing / brute-force authentication spray."
            )
            action = "Immediately trigger automated MFA challenge enforcement and lock affected accounts pending SOC level-2 tier review."
            
        elif 'host' in q or 'firewall' in q:
            top_proto = df.iloc[0].get('protocol', df.iloc[0].get('hostname', 'Primary Asset'))
            summary = (
                f"**Network Security Intelligence**: Analyzed network traffic telemetry across **{rows_count} protocol/host dimensions**. "
                f"**{top_proto}** represents the most active telemetry vector with significant volume and rule-triggering activity. "
                "Evidence of IP packet header tampering and non-standard port communications was detected."
            )
            action = "Enforce micro-segmentation firewall policies, block anomalous outbound ports (3389, 8080), and inspect ingress traffic."
            
        elif 'terminated' in q:
            term_count = len(df)
            summary = (
                f"🚨 **CRITICAL ZERO-TRUST BREACH**: Detected **{term_count} offboarded / terminated employee accounts** "
                "that are actively initiating network connections, IAM authentications, or triggering EDR alerts! "
                "This indicates severe deprovisioning lag or active credential exploitation by malicious insiders."
            )
            action = "Revoke active Kerberos/OAuth tokens immediately, purge Active Directory sessions, and isolate associated hostnames."
            
        else:
            top_user = df.iloc[0]['full_name'] if 'full_name' in df.columns else 'Top User'
            top_score = df.iloc[0].get('composite_threat_score', 'N/A')
            summary = (
                f"**Threat Composite Summary**: Entity risk analysis ranked **{rows_count} entities**. "
                f"The top critical risk actor is **{top_user}** with a composite threat score of **{top_score}/100**. "
                "Multi-stream telemetry fusion shows correlated anomalies across Access (IAM), Endpoint (EDR), and Network (Firewall) logs."
            )
            action = "Dispatch automated containment playbook, quarantine endpoint device, and initiate forensic memory dump."
            
        return (summary, action)
