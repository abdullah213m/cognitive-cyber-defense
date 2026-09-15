"""
AgentIQ Datathon - Track 2: Cybersecurity
MITRE ATT&CK Enterprise Framework Mapper
Maps EDR alerts, IAM events, and network indicators to adversary tactics and techniques.
"""

from typing import Dict, Any, List
import pandas as pd

MITRE_TACTICS = {
    'TA0001': {'name': 'Initial Access', 'description': 'Techniques that use various entry vectors to gain an initial foothold.'},
    'TA0002': {'name': 'Execution', 'description': 'Techniques that result in adversary-controlled code running on a local system.'},
    'TA0003': {'name': 'Persistence', 'description': 'Techniques that adversaries use to keep access across restarts and credential changes.'},
    'TA0004': {'name': 'Privilege Escalation', 'description': 'Techniques that adversaries use to gain higher-level permissions on a system.'},
    'TA0005': {'name': 'Defense Evasion', 'description': 'Techniques used to avoid detection throughout their compromise.'},
    'TA0006': {'name': 'Credential Access', 'description': 'Techniques for stealing credentials like account names and passwords.'},
    'TA0008': {'name': 'Lateral Movement', 'description': 'Techniques adversaries use to extend access to other systems on a network.'},
    'TA0010': {'name': 'Exfiltration', 'description': 'Techniques adversaries use to steal data from your network.'},
    'TA0040': {'name': 'Impact', 'description': 'Techniques adversaries use to disrupt availability or compromise integrity.'}
}

def map_alert_to_mitre(alert_name: str, description: str = "") -> Dict[str, str]:
    """
    Maps an alert to a specific MITRE ATT&CK Tactic and Technique.
    """
    text = f"{alert_name} {description}".lower()
    
    if any(k in text for k in ('ransomware', 'encrypt', 'wipe', 'destroy', 'locker')):
        return {'tactic_id': 'TA0040', 'tactic': 'Impact', 'technique_id': 'T1486', 'technique': 'Data Encrypted for Impact', 'severity': 'CRITICAL'}
    if any(k in text for k in ('mimikatz', 'dump', 'lsass', 'sam', 'credential', 'hash')):
        return {'tactic_id': 'TA0006', 'tactic': 'Credential Access', 'technique_id': 'T1003', 'technique': 'OS Credential Dumping', 'severity': 'CRITICAL'}
    if any(k in text for k in ('lateral', 'psexec', 'smb', 'rdp', 'remote execution', 'wmi')):
        return {'tactic_id': 'TA0008', 'tactic': 'Lateral Movement', 'technique_id': 'T1021', 'technique': 'Remote Services: SMB/RDP', 'severity': 'HIGH'}
    if any(k in text for k in ('privilege', 'uac', 'escalat', 'bypass', 'sudo', 'token')):
        return {'tactic_id': 'TA0004', 'tactic': 'Privilege Escalation', 'technique_id': 'T1548', 'technique': 'Abuse Elevation Control Mechanism', 'severity': 'HIGH'}
    if any(k in text for k in ('powershell', 'cmd', 'script', 'macro', 'wscript', 'cscript')):
        return {'tactic_id': 'TA0002', 'tactic': 'Execution', 'technique_id': 'T1059', 'technique': 'Command and Scripting Interpreter', 'severity': 'MEDIUM'}
    if any(k in text for k in ('exfiltration', 'upload', 'archive', 'mega', 'ftp', 'leak')):
        return {'tactic_id': 'TA0010', 'tactic': 'Exfiltration', 'technique_id': 'T1048', 'technique': 'Exfiltration Over Alternative Protocol', 'severity': 'HIGH'}
    if any(k in text for k in ('phish', 'spearphish', 'vpn', 'portal', 'valid account', 'initial')):
        return {'tactic_id': 'TA0001', 'tactic': 'Initial Access', 'technique_id': 'T1078', 'technique': 'Valid Accounts Compromise', 'severity': 'HIGH'}
    if any(k in text for k in ('tamper', 'disable', 'evasion', 'clear log', 'event log', 'paradox')):
        return {'tactic_id': 'TA0005', 'tactic': 'Defense Evasion', 'technique_id': 'T1070', 'technique': 'Indicator Removal on Host (Log Tampering)', 'severity': 'CRITICAL'}
    if any(k in text for k in ('service', 'registry', 'run key', 'startup', 'persist')):
        return {'tactic_id': 'TA0003', 'tactic': 'Persistence', 'technique_id': 'T1547', 'technique': 'Boot or Logon Autostart Execution', 'severity': 'MEDIUM'}
        
    return {'tactic_id': 'TA0002', 'tactic': 'Execution', 'technique_id': 'T1204', 'technique': 'User Execution: Malicious Payload', 'severity': 'MEDIUM'}


def generate_mitre_matrix(df_edr: pd.DataFrame, df_iam: pd.DataFrame, df_fw: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Computes aggregated MITRE ATT&CK matrix statistics across all telemetry events.
    """
    matrix_counts = {}
    for tid, tinfo in MITRE_TACTICS.items():
        matrix_counts[tid] = {
            'tactic_id': tid,
            'tactic_name': tinfo['name'],
            'description': tinfo['description'],
            'alert_count': 0,
            'techniques': {},
            'max_severity': 'LOW'
        }
        
    # 1. Map EDR alerts
    for _, row in df_edr.iterrows():
        at = row.get('alert_type_clean', 'Generic Alert')
        mapping = map_alert_to_mitre(str(at))
        tid = mapping['tactic_id']
        tech_id = mapping['technique_id']
        tech_name = mapping['technique']
        
        matrix_counts[tid]['alert_count'] += 1
        if tech_id not in matrix_counts[tid]['techniques']:
            matrix_counts[tid]['techniques'][tech_id] = {'id': tech_id, 'name': tech_name, 'count': 0, 'severity': mapping['severity']}
        matrix_counts[tid]['techniques'][tech_id]['count'] += 1
        if mapping['severity'] == 'CRITICAL':
            matrix_counts[tid]['max_severity'] = 'CRITICAL'
            
    # 2. Map IAM failed logins / brute force to Initial Access / Credential Access
    failed_iam = int(df_iam['is_failed_login'].sum()) if 'is_failed_login' in df_iam.columns else 0
    if failed_iam > 0:
        matrix_counts['TA0006']['alert_count'] += failed_iam
        matrix_counts['TA0006']['techniques']['T1110'] = {
            'id': 'T1110',
            'name': 'Brute Force / Password Spray',
            'count': failed_iam,
            'severity': 'HIGH'
        }
        
    # 3. Map IP tampering in Firewall to Defense Evasion
    tampered_ips = int(df_fw['is_ip_tampered'].sum()) if 'is_ip_tampered' in df_fw.columns else 0
    if tampered_ips > 0:
        matrix_counts['TA0005']['alert_count'] += tampered_ips
        matrix_counts['TA0005']['techniques']['T1036'] = {
            'id': 'T1036',
            'name': 'Masquerading / IP Header Spoofing',
            'count': tampered_ips,
            'severity': 'HIGH'
        }
        
    # Convert techniques dict to list
    res = []
    for tid, data in matrix_counts.items():
        data['techniques_list'] = list(data['techniques'].values())
        res.append(data)
        
    return res
