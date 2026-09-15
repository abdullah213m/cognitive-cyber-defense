# Data Dictionary — AgentIQ Datathon Track 2: Cybersecurity
**Project**: Zero-Trust Telemetry & Composite Insider Threat Detection  
**Author**: TransOrg AgentIQ Data Squad  
**Date**: September 2026  
**Version**: 1.0.0 (Production Release)

---

## 1. Overview & Entity-Relationship Model

The telemetry ecosystem unites 4 heterogeneous, high-velocity data sources into a Star Schema modeled in **DuckDB**.

```
                +------------------------+
                |    dim_identity_user   |
                +------------------------+
                | PK  user_id (EMP#####) |
                +-----------+------------+
                            |
           +----------------+----------------+
           |                                 |
           v                                 v
+-----------------------+        +------------------------+
|    fact_iam_audit     |        |  fact_endpoint_alerts  |
+-----------------------+        +------------------------+
| PK  event_id          |        | PK  alert_id           |
| FK  user_id           |        | FK  user_id            |
| FK  hostname          |        | FK  hostname           |
+-----------------------+        +------------------------+
           |                                 |
           +----------------+----------------+
                            |
                            v
                +------------------------+
                |     dim_asset_host     |
                +------------------------+
                | PK  hostname (LPT-...) |
                +-----------+------------+
                            |
                            v
                +------------------------+
                |  fact_firewall_events  |
                +------------------------+
                | PK  log_id             |
                | FK  hostname           |
                +------------------------+
```

---

## 2. Cleaned Star Schema Specifications

### 2.1. Dimension Table: `dim_identity_user`
*Primary dimension table capturing employee profile, asset mapping, status, and fused threat intelligence.*

| Column Name | Data Type | Nullable | Description & Constraints | Sample Values |
| :--- | :--- | :--- | :--- | :--- |
| `user_id` | `VARCHAR` | NO (PK) | Canonical employee identifier formatted as `EMP#####` | `EMP12741`, `EMP11307` |
| `username` | `VARCHAR` | NO | Normalized lowercase corporate directory username | `omkaar.chana52`, `ethan.narasimhan97` |
| `full_name` | `VARCHAR` | NO | Employee's full legal name (Title Cased) | `Omkaar Chana`, `Ethan Narasimhan` |
| `department` | `VARCHAR` | NO | Standardized department name from canonical taxonomy | `Operations`, `Legal`, `R&D`, `Supply Chain` |
| `role` | `VARCHAR` | NO | Standardized job function role | `Administrator`, `Manager`, `Director`, `Analyst` |
| `location` | `VARCHAR` | NO | Physical / Remote work location | `Head Office`, `Branch Office`, `Remote / WFH` |
| `hostname` | `VARCHAR` | YES (FK) | Assigned workstation/laptop hostname | `LPT-12741`, `VDR-11307`, `WS-11601` |
| `device_id` | `VARCHAR` | YES | Unique corporate hardware asset identifier | `DEV-42831`, `DEV-95371` |
| `status` | `VARCHAR` | NO | Corporate lifecycle status (`ACTIVE`, `TERMINATED`) | `ACTIVE`, `TERMINATED` |
| `hire_date` | `TIMESTAMP` | YES | Standardized UTC onboarding date/time | `2025-01-11 06:52:43` |
| `termination_date` | `TIMESTAMP`| YES | Standardized UTC offboarding date/time (NULL if active)| `2026-06-30 18:00:00` |
| `is_terminated` | `BOOLEAN` | NO | Boolean flag indicating if employee is offboarded | `TRUE`, `FALSE` |
| `manager_username` | `VARCHAR` | YES | Manager's username | `manager780`, `manager881` |
| `identity_risk_score`| `DOUBLE` | NO | Risk score from identity posture (100 if terminated-active)| `0.0`, `100.0` |
| `access_risk_score` | `DOUBLE` | NO | Risk score derived from failed logins, MFA, & IAM risk | `78.5`, `12.0` |
| `endpoint_risk_score`| `DOUBLE` | NO | Risk score from EDR critical alerts & time anomalies | `95.0`, `0.0` |
| `network_risk_score` | `DOUBLE` | NO | Risk score from firewall denies & tampered IP packets | `64.2`, `5.0` |
| `composite_threat_score`| `DOUBLE`| NO | **0–100 Weighted Composite Insider Threat Score** | `84.5`, `18.2` |
| `threat_tier` | `VARCHAR` | NO | Categorical threat tier: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` | `CRITICAL`, `LOW` |
| `is_terminated_active_breach`| `BOOLEAN` | NO | Zero-Trust breach flag: Terminated user still active! | `TRUE`, `FALSE` |
| `is_brute_force_suspect`| `BOOLEAN` | NO | Account under credential stuffing / brute force attack | `TRUE`, `FALSE` |
| `is_tampering_suspect`| `BOOLEAN` | NO | Entity involved in log timestamp or IP packet tampering | `TRUE`, `FALSE` |

---

### 2.2. Dimension Table: `dim_asset_host`
*Asset dimension table mapping hostnames to physical locations and assigned users.*

| Column Name | Data Type | Nullable | Description & Constraints | Sample Values |
| :--- | :--- | :--- | :--- | :--- |
| `hostname` | `VARCHAR` | NO (PK) | Normalized asset hostname (stripped of `.corp.local`) | `LPT-12741`, `WS-11601` |
| `device_id` | `VARCHAR` | YES | Normalized hardware asset ID | `DEV-42831` |
| `department` | `VARCHAR` | NO | Owning business department | `Operations`, `Security` |
| `location` | `VARCHAR` | NO | Asset physical site | `Head Office`, `Branch Office` |
| `assigned_user_id` | `VARCHAR` | YES (FK) | Primary assigned user ID (`EMP#####`) | `EMP12741` |

---

### 2.3. Fact Table: `fact_firewall_events`
*High-velocity network telemetry recording packet transactions, port protocols, actions, and tampering flags.*

| Column Name | Data Type | Nullable | Description & Constraints | Sample Values |
| :--- | :--- | :--- | :--- | :--- |
| `log_id` | `VARCHAR` | NO (PK) | Unique firewall log event identifier | `FW000002394` |
| `event_timestamp` | `TIMESTAMP` | YES | Standardized UTC event timestamp | `2026-09-06 11:22:07` |
| `hostname` | `VARCHAR` | YES (FK) | Initiating or receiving host | `LPT-11180`, `VDR-12618` |
| `src_ip` | `VARCHAR` | NO | Source IP address | `192.168.39.124`, `10.232.175` |
| `dst_ip` | `VARCHAR` | NO | Destination IP address | `101.219.19.127`, `999.999.999.999` |
| `is_src_ip_valid` | `BOOLEAN` | NO | Valid RFC IPv4 format validation | `TRUE`, `FALSE` |
| `is_ip_tampered` | `BOOLEAN` | NO | Flag indicating malformed, impossible, or tampered IP | `TRUE`, `FALSE` |
| `src_port` | `INTEGER` | NO | Standardized source port (0-65535, -1 if invalid) | `443`, `8080`, `25` |
| `dst_port` | `INTEGER` | NO | Standardized destination port (0-65535, -1 if invalid) | `80`, `3389`, `22` |
| `is_port_anomalous` | `BOOLEAN` | NO | Flag for negative or out-of-range ports | `FALSE`, `TRUE` |
| `protocol` | `VARCHAR` | NO | Normalized Layer 4 / 7 protocol (`TCP`, `UDP`, `ICMP`) | `TCP`, `UDP`, `ICMP` |
| `action` | `VARCHAR` | NO | Normalized firewall decision: `ALLOW` or `DENY` | `ALLOW`, `DENY` |
| `bytes_sent` | `BIGINT` | NO | Clean numeric byte count sent | `727539` |
| `bytes_received` | `BIGINT` | NO | Clean numeric byte count received (commas stripped) | `15092296` |
| `total_bytes` | `BIGINT` | NO | Total bandwidth consumption (`bytes_sent + bytes_received`)| `15819835` |
| `session_id` | `VARCHAR` | NO | Session ID (standardized uppercase, or `UNKNOWN_SESSION`)| `SID963012` |
| `threat_flag` | `BOOLEAN` | NO | Firewall signature threat alert boolean | `TRUE`, `FALSE` |
| `rule_name` | `VARCHAR` | NO | Firewall security rule applied | `BLOCK_TOR_EXIT`, `DENY_TELNET` |
| `geo_country` | `VARCHAR` | NO | Destination geolocation country | `United States`, `China`, `Russia` |

---

### 2.4. Fact Table: `fact_iam_audit`
*Identity & Access Management telemetry recording authentications, MFA evaluations, and risk scoring.*

| Column Name | Data Type | Nullable | Description & Constraints | Sample Values |
| :--- | :--- | :--- | :--- | :--- |
| `event_id` | `VARCHAR` | NO (PK) | Unique IAM audit log event identifier | `IAM00008974` |
| `event_timestamp` | `TIMESTAMP` | YES | Standardized UTC event timestamp | `2026-09-05 12:43:00` |
| `user_id` | `VARCHAR` | YES (FK) | Normalized employee ID (`EMP#####`) | `EMP11889` |
| `username` | `VARCHAR` | NO | Normalized lowercase username | `atharv.shukla79` |
| `department` | `VARCHAR` | NO | Standardized department taxonomy | `Compliance`, `Operations` |
| `event_type` | `VARCHAR` | NO | Canonical IAM event type | `LOGIN_SUCCESS`, `MFA_FAILED` |
| `event_category` | `VARCHAR` | NO | High-level category (`login_success`, `login_failed`, `mfa_failed`)| `login_success`, `mfa_failed` |
| `is_failed_login` | `BOOLEAN` | NO | Boolean flag indicating authentication failure | `TRUE`, `FALSE` |
| `is_mfa_failed` | `BOOLEAN` | NO | Boolean flag indicating Multi-Factor rejection | `TRUE`, `FALSE` |
| `auth_method` | `VARCHAR` | NO | Authentication factor (`OTP`, `BIOMETRIC`, `PASSWORD`, `SSO`)| `OTP`, `BIOMETRIC` |
| `source_ip` | `VARCHAR` | NO | Originating client IP address | `10.141.198.1` |
| `is_source_ip_tampered`| `BOOLEAN` | NO | Malformed/hyphenated IP tampering flag | `FALSE`, `TRUE` |
| `hostname` | `VARCHAR` | YES (FK) | Client workstation hostname | `VDR-11889` |
| `device_id` | `VARCHAR` | YES | Client device ID | `DEV-48365` |
| `session_id` | `VARCHAR` | NO | IAM session token identifier | `SID120652` |
| `mfa_passed` | `BOOLEAN` | YES | Boolean normalized MFA outcome | `TRUE`, `FALSE` |
| `failure_reason` | `VARCHAR` | NO | Text reason for authentication failure | `MFA failed`, `Invalid credentials` |
| `risk_score` | `DOUBLE` | NO | Normalized 0–100 numeric risk score (parsed from text/fractions)| `78.0`, `95.0` |
| `geo_location` | `VARCHAR` | NO | Originating state/region | `Maharashtra`, `PB` |

---

### 2.5. Fact Table: `fact_endpoint_alerts`
*Endpoint Detection and Response (EDR) alerts recording malware execution, lateral movement, and temporal integrity.*

| Column Name | Data Type | Nullable | Description & Constraints | Sample Values |
| :--- | :--- | :--- | :--- | :--- |
| `alert_id` | `VARCHAR` | NO (PK) | Unique EDR alert identifier | `ALT00004128` |
| `detected_timestamp` | `TIMESTAMP` | YES | Standardized UTC detection timestamp | `2026-08-14 04:12:00` |
| `resolved_timestamp` | `TIMESTAMP` | YES | Standardized UTC resolution timestamp | `2026-08-14 06:30:00` |
| `is_temporal_anomaly`| `BOOLEAN` | NO | **Temporal Paradox Flag**: `resolved_timestamp < detected_timestamp` | `TRUE`, `FALSE` |
| `resolution_time_hours`| `DOUBLE` | YES | Mean time to resolve alert in hours (NULL if temporal anomaly)| `2.3`, `14.8` |
| `user_id` | `VARCHAR` | YES (FK) | Associated user ID (`EMP#####`) | `EMP10271` |
| `hostname` | `VARCHAR` | YES (FK) | Compromised endpoint hostname | `LPT-10271` |
| `alert_type` | `VARCHAR` | NO | Standardized attack vector category | `Ransomware`, `Lateral Movement` |
| `is_high_threat_type`| `BOOLEAN` | NO | Flag for high-impact malware (Mimikatz, Ransomware) | `TRUE`, `FALSE` |
| `severity` | `VARCHAR` | NO | Standardized 5-tier severity: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`| `CRITICAL`, `HIGH` |
| `severity_score` | `INTEGER` | NO | Numerical severity weight (CRITICAL=100, HIGH=75, MED=50, LOW=25)| `100`, `75` |
| `status` | `VARCHAR` | NO | Lifecycle status: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `DISMISSED` | `OPEN`, `RESOLVED` |
| `is_active_alert` | `BOOLEAN` | NO | Boolean flag indicating unmitigated active alert | `TRUE`, `FALSE` |
| `file_path` | `VARCHAR` | NO | Binary execution file path on disk | `C:\Windows\System32\cmd.exe` |
| `sha256_hash` | `VARCHAR` | NO | SHA-256 cryptographic hash of executable payload | `e3b0c44298fc1c149afb...` |

---

## 3. Raw Data Profiling & Messiness Mapping

| Raw File Name | Raw Rows | Raw Issues Detected | Remediation Implemented |
| :--- | :--- | :--- | :--- |
| `track2_identity_asset_master.csv` | ~3,091 | 5+ ID formats (`EMP-`, `emp_`, digits), epoch timestamps, status synonyms (`Live`, `Working`, `A`), `.corp.local` suffixes | Regex `normalize_user_id`, epoch parser, status unification, domain stripping |
| `track2_firewall_logs.csv` | ~30,600 | Malformed IPs (`999.999.999.999`, `192.168.69.`), mixed protocols (`TCP/6`), comma-formatted bytes, negative ports | `validate_ip` feature flagging, protocol mapping, comma strip to integer, port clamp |
| `track2_iam_audit_trail.json` | ~20,500 | Multi-format risk scores (`"78/100"`, `"High"`), 1/0/True booleans, hyphenated IPs (`10-141.198`), department casing | `normalize_risk_score` (0-100 float), boolean coercion, IP sanitization, department lookup |
| `track2_endpoint_alerts.xlsx` | ~8,240 | Multi-scale severity (`P1`-`P4`, `Severe`, `M`), status synonyms (`WIP`), **Temporal Paradox Anomaly** (`resolved < detected`) | 5-tier severity mapping, `is_temporal_anomaly` flag without silent data destruction |
