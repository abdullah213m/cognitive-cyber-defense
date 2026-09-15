// Standalone Fallback Telemetry Store for Vercel / Cloud Static Deployment
// Ensures the dashboard is 100% interactive and functional even if backend is offline.

export const FALLBACK_OVERVIEW = {
  status: "success",
  kpis: {
    total_events: 62431,
    firewall_events: 30600,
    iam_events: 20500,
    endpoint_events: 8240,
    unique_users: 3000,
    unique_hosts: 3091,
    terminated_active_breaches: 507,
    critical_threat_users: 142,
    high_threat_users: 284,
    firewall_denied_packets: 6572,
    mean_threat_score: 41.8
  },
  department_threats: [
    { department_clean: "Finance", avg_score: 68.4, total_users: 480, critical_count: 42 },
    { department_clean: "Executive", avg_score: 64.1, total_users: 120, critical_count: 18 },
    { department_clean: "Engineering", avg_score: 58.7, total_users: 950, critical_count: 51 },
    { department_clean: "Human Resources", avg_score: 52.3, total_users: 340, critical_count: 22 },
    { department_clean: "Sales & Marketing", avg_score: 41.6, total_users: 710, critical_count: 9 },
    { department_clean: "Operations", avg_score: 39.2, total_users: 400, critical_count: 0 }
  ]
};

export const FALLBACK_USERS = [
  {
    user_id_clean: "EMP11224",
    full_name_clean: "Aarav Sharma",
    department_clean: "Finance",
    status_clean: "Terminated",
    composite_threat_score: 96.5,
    threat_tier: "CRITICAL",
    identity_risk_score: 100.0,
    access_risk_score: 95.0,
    endpoint_risk_score: 98.0,
    network_risk_score: 92.0,
    failed_logins: 48,
    mfa_rejected_count: 14,
    critical_alert_count: 6,
    denied_packet_count: 312,
    total_bytes_transferred: 48920194,
    last_detected_anomaly: "Terminated Account Active Login & High-Bandwidth DB Dump"
  },
  {
    user_id_clean: "EMP10941",
    full_name_clean: "Priya Patel",
    department_clean: "Engineering",
    status_clean: "Terminated",
    composite_threat_score: 93.8,
    threat_tier: "CRITICAL",
    identity_risk_score: 100.0,
    access_risk_score: 88.0,
    endpoint_risk_score: 92.0,
    network_risk_score: 94.0,
    failed_logins: 36,
    mfa_rejected_count: 11,
    critical_alert_count: 5,
    denied_packet_count: 278,
    total_bytes_transferred: 31049210,
    last_detected_anomaly: "Circular IP Tunneling & Exfiltration on Port 8080"
  },
  {
    user_id_clean: "EMP12048",
    full_name_clean: "Vikram Malhotra",
    department_clean: "Executive",
    status_clean: "Terminated",
    composite_threat_score: 91.2,
    threat_tier: "CRITICAL",
    identity_risk_score: 100.0,
    access_risk_score: 91.0,
    endpoint_risk_score: 85.0,
    network_risk_score: 87.0,
    failed_logins: 29,
    mfa_rejected_count: 8,
    critical_alert_count: 4,
    denied_packet_count: 194,
    total_bytes_transferred: 18400290,
    last_detected_anomaly: "Privilege Escalation to Domain Admin post-Termination"
  },
  {
    user_id_clean: "EMP11582",
    full_name_clean: "Ananya Iyer",
    department_clean: "Human Resources",
    status_clean: "Terminated",
    composite_threat_score: 88.6,
    threat_tier: "CRITICAL",
    identity_risk_score: 100.0,
    access_risk_score: 82.0,
    endpoint_risk_score: 86.0,
    network_risk_score: 84.0,
    failed_logins: 22,
    mfa_rejected_count: 7,
    critical_alert_count: 4,
    denied_packet_count: 165,
    total_bytes_transferred: 12900400,
    last_detected_anomaly: "Bulk Employee PII Data Exfiltration via S3 Bucket"
  },
  {
    user_id_clean: "EMP10339",
    full_name_clean: "Rohan Gupta",
    department_clean: "Finance",
    status_clean: "Active",
    composite_threat_score: 84.2,
    threat_tier: "CRITICAL",
    identity_risk_score: 45.0,
    access_risk_score: 98.0,
    endpoint_risk_score: 96.0,
    network_risk_score: 95.0,
    failed_logins: 62,
    mfa_rejected_count: 19,
    critical_alert_count: 5,
    denied_packet_count: 420,
    total_bytes_transferred: 64100200,
    last_detected_anomaly: "Mimikatz LSASS Dump & Lateral SMB Beaconing"
  },
  {
    user_id_clean: "EMP12891",
    full_name_clean: "Neha Sen",
    department_clean: "Engineering",
    status_clean: "Active",
    composite_threat_score: 79.5,
    threat_tier: "HIGH",
    identity_risk_score: 30.0,
    access_risk_score: 92.0,
    endpoint_risk_score: 94.0,
    network_risk_score: 88.0,
    failed_logins: 41,
    mfa_rejected_count: 12,
    critical_alert_count: 3,
    denied_packet_count: 240,
    total_bytes_transferred: 28400000,
    last_detected_anomaly: "Encrypted DNS C2 Beaconing on Port 53"
  }
];

export const FALLBACK_NETWORK_GRAPH = {
  status: "success",
  nodes: [
    { id: "EMP11224", name: "Aarav Sharma", type: "USER", threat_score: 96.5, dept: "Finance" },
    { id: "EMP10941", name: "Priya Patel", type: "USER", threat_score: 93.8, dept: "Engineering" },
    { id: "EMP12048", name: "Vikram Malhotra", type: "USER", threat_score: 91.2, dept: "Executive" },
    { id: "EMP10339", name: "Rohan Gupta", type: "USER", threat_score: 84.2, dept: "Finance" },
    { id: "LPT-FIN-041", name: "LPT-FIN-041", type: "HOST", os: "Windows 11 Enterprise", ip: "192.168.10.41" },
    { id: "LPT-ENG-108", name: "LPT-ENG-108", type: "HOST", os: "Ubuntu 22.04 LTS", ip: "192.168.20.108" },
    { id: "SRV-IAM-CORE", name: "SRV-IAM-CORE", type: "HOST", os: "RedHat Linux 9", ip: "10.0.1.15" },
    { id: "CROWN-JEWEL-DC-01", name: "CROWN-JEWEL-DC-01", type: "CROWN_JEWEL", os: "Windows Server 2022 DC", ip: "10.0.0.1" },
    { id: "PROD-DB-CLUSTER", name: "PROD-DB-CLUSTER", type: "CROWN_JEWEL", os: "PostgreSQL High-Availability", ip: "10.0.2.100" },
    { id: "EXECUTIVE-IAM-VAULT", name: "EXECUTIVE-IAM-VAULT", type: "CROWN_JEWEL", os: "HashiCorp Vault Enclave", ip: "10.0.3.50" }
  ],
  links: [
    { source: "EMP11224", target: "LPT-FIN-041", protocol: "RDP", count: 48, is_denied: false },
    { source: "LPT-FIN-041", target: "PROD-DB-CLUSTER", protocol: "TCP/5432", count: 182, is_denied: true },
    { source: "EMP10941", target: "LPT-ENG-108", protocol: "SSH", count: 36, is_denied: false },
    { source: "LPT-ENG-108", target: "CROWN-JEWEL-DC-01", protocol: "SMB/445", count: 94, is_denied: true },
    { source: "EMP12048", target: "SRV-IAM-CORE", protocol: "HTTPS/443", count: 64, is_denied: false },
    { source: "SRV-IAM-CORE", target: "EXECUTIVE-IAM-VAULT", protocol: "gRPC/8200", count: 120, is_denied: true },
    { source: "EMP10339", target: "LPT-FIN-041", protocol: "WMI", count: 28, is_denied: false }
  ]
};

export const FALLBACK_MITRE = {
  status: "success",
  tactics: [
    { id: "TA0001", name: "Initial Access", alert_count: 2480, top_technique: "T1078 Valid Accounts", risk_level: "CRITICAL" },
    { id: "TA0006", name: "Credential Access", alert_count: 1890, top_technique: "T1110 Brute Force", risk_level: "CRITICAL" },
    { id: "TA0008", name: "Lateral Movement", alert_count: 1420, top_technique: "T1021 Remote Services", risk_level: "HIGH" },
    { id: "TA0010", name: "Exfiltration", alert_count: 980, top_technique: "T1041 Exfiltration Over C2", risk_level: "HIGH" },
    { id: "TA0005", name: "Defense Evasion", alert_count: 760, top_technique: "T1070 Indicator Removal", risk_level: "MEDIUM" },
    { id: "TA0040", name: "Impact", alert_count: 340, top_technique: "T1486 Data Encrypted for Impact", risk_level: "HIGH" }
  ]
};

export const FALLBACK_STREAM = {
  status: "success",
  events: [
    {
      log_id: "FW-89412",
      source_ip: "192.168.10.41",
      destination_ip: "10.0.2.100",
      protocol: "TCP/5432",
      action: "DENY",
      bytes_sent: 49200,
      timestamp: "2026-09-15 14:18:22",
      details: "Blocked unauthorized SQL connection to PROD-DB-CLUSTER"
    },
    {
      log_id: "IAM-77219",
      source_ip: "192.168.20.108",
      destination_ip: "10.0.1.15",
      protocol: "HTTPS",
      action: "DENY",
      bytes_sent: 1420,
      timestamp: "2026-09-15 14:18:19",
      details: "MFA challenge failed 3x for Terminated Account EMP10941"
    },
    {
      log_id: "EDR-55410",
      source_ip: "192.168.10.41",
      destination_ip: "127.0.0.1",
      protocol: "LOCAL",
      action: "ISOLATE",
      bytes_sent: 8900,
      timestamp: "2026-09-15 14:18:14",
      details: "Mimikatz memory dump detected in lsass.exe process"
    },
    {
      log_id: "FW-89411",
      source_ip: "192.168.99.12",
      destination_ip: "10.0.0.1",
      protocol: "SMB/445",
      action: "DENY",
      bytes_sent: 12400,
      timestamp: "2026-09-15 14:18:05",
      details: "Lateral movement probe blocked on Domain Controller"
    }
  ]
};
