"""
Generator script for notebooks/01_data_rescue_and_eda.ipynb
"""

import json
import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

notebook_content = {
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# 🛡️ AgentIQ Track 2: Cybersecurity Telemetry — Data Rescue & Exploratory Data Analysis\n",
    "### *TransOrg AgentIQ Datathon: From Messy Data to Agentic Insights*\n",
    "\n",
    "**Objective**: Demonstrate enterprise-grade data rescue across 4 highly imperfect, noisy, and tampered cybersecurity logs, build a governed analytics data model, and extract composite threat intelligence."
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 1. Environment Setup & Dependency Imports\n",
    "We import `pandas`, `duckdb`, `plotly`, `numpy`, and our custom modular cleaning engine."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "import os\n",
    "import sys\n",
    "import json\n",
    "import pandas as pd\n",
    "import numpy as np\n",
    "import duckdb\n",
    "import plotly.express as px\n",
    "\n",
    "# Add repository root to python path\n",
    "ROOT_DIR = os.path.abspath(os.path.join(os.getcwd(), '..'))\n",
    "sys.path.insert(0, ROOT_DIR)\n",
    "\n",
    "from src.cleaners.firewall_cleaner import clean_firewall_logs\n",
    "from src.cleaners.iam_cleaner import clean_iam_audit_trail\n",
    "from src.cleaners.endpoint_cleaner import clean_endpoint_alerts\n",
    "from src.cleaners.identity_cleaner import clean_identity_asset_master\n",
    "from src.analytics.threat_scoring import calculate_insider_threat_scores\n",
    "from src.models.database import init_star_schema\n",
    "\n",
    "print('✓ Modules loaded successfully!')"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 2. Layer 1: Data Rescue & Normalization\n",
    "### 2.1. Identity & Asset Master Rescue\n",
    "We standardize employee IDs to `EMP#####`, parse mixed epoch/date strings, and normalize status to `ACTIVE` vs `TERMINATED`."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "raw_id_path = os.path.join(ROOT_DIR, 'data', 'raw', 'track2_identity_asset_master.csv')\n",
    "df_id_raw = pd.read_csv(raw_id_path)\n",
    "print(f'Raw Identity Master Shape: {df_id_raw.shape}')\n",
    "\n",
    "df_id_clean, id_stats = clean_identity_asset_master(df_id_raw)\n",
    "print('Identity Cleaning Stats:', id_stats)\n",
    "df_id_clean[['user_id_clean', 'full_name_clean', 'department_clean', 'status_clean', 'is_terminated']].head()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### 2.2. Firewall Logs Rescue & IP Tampering Detection\n",
    "Rather than discarding malformed (`192.168.69.`) or impossible (`999.999.999.999`) IPs, we flag them as cyber-threat signals (`is_ip_tampered`)."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "raw_fw_path = os.path.join(ROOT_DIR, 'data', 'raw', 'track2_firewall_logs.csv')\n",
    "df_fw_raw = pd.read_csv(raw_fw_path)\n",
    "print(f'Raw Firewall Logs Shape: {df_fw_raw.shape}')\n",
    "\n",
    "df_fw_clean, fw_stats = clean_firewall_logs(df_fw_raw)\n",
    "print('Firewall Cleaning Stats:', fw_stats)\n",
    "df_fw_clean[['log_id', 'timestamp_clean', 'hostname_clean', 'action_clean', 'protocol_clean', 'is_ip_tampered']].head()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### 2.3. IAM Audit Trail Rescue\n",
    "We standardize multi-format risk scores (`\"78/100\"`, `\"High\"`, floats) into continuous floats (0–100), standardize MFA booleans, and classify event types."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "raw_iam_path = os.path.join(ROOT_DIR, 'data', 'raw', 'track2_iam_audit_trail.json')\n",
    "with open(raw_iam_path, 'r', encoding='utf-8') as f:\n",
    "    iam_raw_data = json.load(f)\n",
    "print(f'Raw IAM Events Count: {len(iam_raw_data)}')\n",
    "\n",
    "df_iam_clean, iam_stats = clean_iam_audit_trail(iam_raw_data)\n",
    "print('IAM Cleaning Stats:', iam_stats)\n",
    "df_iam_clean[['event_id', 'user_id_clean', 'department_clean', 'event_category', 'risk_score_clean', 'is_failed_login']].head()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### 2.4. Endpoint (EDR) Alerts Rescue & Temporal Paradox Detection\n",
    "We catch and flag alerts where `resolved_timestamp < detected_timestamp` as anti-forensics timestamp manipulation."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "raw_edr_path = os.path.join(ROOT_DIR, 'data', 'raw', 'track2_endpoint_alerts.xlsx')\n",
    "df_edr_raw = pd.read_excel(raw_edr_path)\n",
    "print(f'Raw EDR Alerts Shape: {df_edr_raw.shape}')\n",
    "\n",
    "df_edr_clean, edr_stats = clean_endpoint_alerts(df_edr_raw)\n",
    "print('Endpoint Cleaning Stats:', edr_stats)\n",
    "df_edr_clean[['alert_id', 'user_id_clean', 'severity_clean', 'alert_type_clean', 'is_temporal_anomaly']].head()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 3. Layer 2: Governed Analytics & Composite Threat Scoring\n",
    "We fuse Identity Risk (30%), Access Risk (25%), Endpoint Risk (25%), and Network Risk (20%) into a unified 0–100 Insider Threat Score."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "df_scored = calculate_insider_threat_scores(df_id_clean, df_iam_clean, df_edr_clean, df_fw_clean)\n",
    "print(f'Scored Entities Count: {len(df_scored)}')\n",
    "print('Threat Tier Breakdown:')\n",
    "print(df_scored['threat_tier'].value_counts())\n",
    "\n",
    "df_scored[['user_id_clean', 'full_name_clean', 'department_clean', 'composite_threat_score', 'threat_tier', 'is_terminated_active_breach']].head(10)"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 4. Layer 3: Exploratory Data Analysis & Threat Insights\n",
    "Let's visualize the composite threat landscape."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "fig_hist = px.histogram(\n",
    "    df_scored, \n",
    "    x='composite_threat_score', \n",
    "    color='threat_tier',\n",
    "    title='Distribution of Composite Insider Threat Scores',\n",
    "    template='plotly_dark',\n",
    "    color_discrete_map={'CRITICAL': '#FF0055', 'HIGH': '#FFB800', 'MEDIUM': '#00F0FF', 'LOW': '#00FF66'}\n",
    ")\n",
    "fig_hist.show()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### 4.2. Department Threat Profile\n",
    "Which departments contain the highest concentration of high-risk threat scores?"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "dept_threat = df_scored.groupby('department_clean').agg(\n",
    "    avg_threat_score=('composite_threat_score', 'mean'),\n",
    "    critical_actors=('threat_tier', lambda x: (x == 'CRITICAL').sum()),\n",
    "    total_staff=('user_id_clean', 'count')\n",
    ").reset_index().sort_values('avg_threat_score', ascending=False)\n",
    "\n",
    "fig_dept_threat = px.bar(\n",
    "    dept_threat,\n",
    "    x='department_clean',\n",
    "    y='avg_threat_score',\n",
    "    color='critical_actors',\n",
    "    title='Mean Insider Threat Score by Corporate Department',\n",
    "    template='plotly_dark',\n",
    "    color_continuous_scale='Reds'\n",
    ")\n",
    "fig_dept_threat.show()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 5. Summary & Key Datathon Insights\n",
    "1. **Zero-Trust Breach Detection**: Identified offboarded employees generating active telemetry across network and identity systems.\n",
    "2. **Anti-Forensics & Tampering**: Uncovered corrupted IP headers in firewall logs and temporal anomalies in EDR logs.\n",
    "3. **Composite Scoring**: Unified disparate telemetry vectors to prioritize the top critical insider threat actors for immediate automated SOC containment."
   ]
  }
 ],
 "metadata": {
  "language_info": {
   "name": "python"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 5
}

with open(os.path.join(ROOT_DIR, 'notebooks', '01_data_rescue_and_eda.ipynb'), 'w', encoding='utf-8') as f:
    json.dump(notebook_content, f, indent=1)

print("[OK] Notebook generated successfully at notebooks/01_data_rescue_and_eda.ipynb")
