"""
AgentIQ Datathon - Track 2: Cybersecurity
Common Data Cleaning and Normalization Utilities
"""

import re
from datetime import datetime, timezone
from typing import Optional, Any

def normalize_user_id(uid: Any) -> Optional[str]:
    """
    Standardize user IDs across all formats to canonical EMP#####.
    Handles: EMP-11889, EMP10629, emp_10271, EMP 12345, 12345, emp12029.0, etc.
    """
    if uid is None:
        return None
    uid_str = str(uid).strip()
    if not uid_str or uid_str.lower() in ('none', 'nan', 'null', 'na', 'unknown', ''):
        return None
    
    # Check for decimal string like 12345.0
    if uid_str.endswith('.0'):
        uid_str = uid_str[:-2]
        
    # Extract digits
    match = re.search(r'(?:emp|user|id)?[\s_\-]*(\d+)', uid_str, re.IGNORECASE)
    if match:
        num = match.group(1)
        return f"EMP{int(num)}"
    
    # If it's already an alphanumeric ID without pure digits
    cleaned = re.sub(r'[\s_\-]+', '', uid_str).upper()
    return cleaned if cleaned else None


def normalize_hostname(host: Any) -> Optional[str]:
    """
    Normalize hostnames: strips .corp.local, harmonizes _ vs -, strips spaces, uppercase.
    Example: 'VDR-11307.corp.local' -> 'VDR-11307', 'LPT_12621' -> 'LPT-12621'
    """
    if host is None:
        return None
    h_str = str(host).strip()
    if not h_str or h_str.lower() in ('none', 'nan', 'null', 'na', 'unknown', ''):
        return None
    
    # Strip domain suffixes
    h_str = re.sub(r'\.corp\.local$', '', h_str, flags=re.IGNORECASE)
    h_str = re.sub(r'\.local$', '', h_str, flags=re.IGNORECASE)
    h_str = re.sub(r'\.corp$', '', h_str, flags=re.IGNORECASE)
    
    # Replace underscores with hyphens
    h_str = h_str.replace('_', '-')
    return h_str.upper()


def normalize_device_id(dev: Any) -> Optional[str]:
    """
    Normalize device IDs: 'dev 51958', 'DEV-95371', 'dev42831' -> 'DEV-95371' or 'DEV-51958'
    """
    if dev is None:
        return None
    d_str = str(dev).strip()
    if not d_str or d_str.lower() in ('none', 'nan', 'null', 'na', 'unknown', ''):
        return None
    
    match = re.search(r'(?:dev|device)?[\s_\-]*(\d+)', d_str, re.IGNORECASE)
    if match:
        return f"DEV-{match.group(1)}"
    
    return d_str.upper().replace(' ', '-')


def parse_datetime(val: Any) -> Optional[str]:
    """
    Robust multi-format datetime parser returning ISO 8601 string 'YYYY-MM-DD HH:MM:SS'.
    Handles Unix timestamps (seconds & ms), ISO-8601, European DD/MM/YYYY, US MM-DD-YYYY, etc.
    """
    if val is None:
        return None
    
    if isinstance(val, (datetime,)):
        return val.strftime('%Y-%m-%d %H:%M:%S')
    
    val_str = str(val).strip()
    if not val_str or val_str.lower() in ('none', 'nan', 'null', 'na', 'unknown', 'not available', ''):
        return None
    
    # 1. Check for numeric epoch (seconds or milliseconds)
    if re.match(r'^\d+(\.\d+)?$', val_str):
        try:
            num = float(val_str)
            if num > 1e11:  # milliseconds
                num = num / 1000.0
            if 946684800 <= num <= 2524608000:  # Years 2000 - 2050
                dt = datetime.fromtimestamp(num, timezone.utc).replace(tzinfo=None)
                return dt.strftime('%Y-%m-%d %H:%M:%S')
        except (ValueError, OverflowError, OSError):
            pass

    # 2. Try common datetime format patterns
    formats = [
        '%Y-%m-%d %H:%M:%S',
        '%Y-%m-%dT%H:%M:%S',
        '%Y-%m-%dT%H:%M:%S.%f',
        '%d/%m/%Y %H:%M',
        '%d/%m/%Y %H:%M:%S',
        '%m/%d/%Y %H:%M',
        '%m/%d/%Y %H:%M:%S',
        '%d-%m-%Y %H:%M:%S',
        '%d-%m-%Y %I:%M:%S %p',
        '%m-%d-%Y %I:%M:%S %p',
        '%d-%b-%Y %H:%M:%S',
        '%d-%b-%Y %I:%M:%S %p',
        '%d-%B-%Y %H:%M:%S',
        '%Y/%m/%d %H:%M:%S',
        '%Y/%m/%d %H:%M',
        '%Y/%m/%d',
        '%Y-%m-%d',
        '%d/%m/%Y',
        '%m/%d/%Y',
        '%d-%m-%Y',
    ]

    for fmt in formats:
        try:
            dt = datetime.strptime(val_str, fmt)
            return dt.strftime('%Y-%m-%d %H:%M:%S')
        except ValueError:
            continue
            
    # Try regex cleaning for stray trailing timezone or fractional parts
    try:
        clean_str = re.sub(r'(\.\d+)?(Z|[+-]\d{2}:\d{2})?$', '', val_str)
        for fmt in ('%Y-%m-%d %H:%M:%S', '%Y-%m-%dT%H:%M:%S'):
            try:
                dt = datetime.strptime(clean_str, fmt)
                return dt.strftime('%Y-%m-%d %H:%M:%S')
            except ValueError:
                pass
    except Exception:
        pass

    return None


def normalize_department(dept: Any) -> str:
    """
    Harmonize department names to a canonical vocabulary.
    """
    if dept is None:
        return 'Unknown'
    d = str(dept).strip()
    if not d or d.lower() in ('none', 'nan', 'null', 'na', 'unknown', ''):
        return 'Unknown'
    
    dl = d.lower().replace('_', ' ').replace('-', ' ')
    
    if any(k in dl for k in ('ops', 'operation')):
        return 'Operations'
    if 'legal' in dl:
        return 'Legal'
    if any(k in dl for k in ('rnd', 'r&d', 'research')):
        return 'R&D'
    if any(k in dl for k in ('mkt', 'market')):
        return 'Marketing'
    if any(k in dl for k in ('supply', 'logistics', 'chain')):
        return 'Supply Chain'
    if any(k in dl for k in ('support', 'helpdesk', 'service')):
        return 'Support'
    if any(k in dl for k in ('fin', 'account')):
        return 'Finance'
    if any(k in dl for k in ('comp', 'audit', 'gov')):
        return 'Compliance'
    if any(k in dl for k in ('hr', 'human')):
        return 'Human Resources'
    if any(k in dl for k in ('sec', 'cyber', 'soc', 'infosec')):
        return 'Security'
    if any(k in dl for k in ('eng', 'dev', 'software', 'tech', 'it')):
        return 'Engineering'
    if 'sales' in dl:
        return 'Sales'
    if 'product' in dl:
        return 'Product'
        
    return d.title()


def normalize_boolean(val: Any) -> Optional[bool]:
    """
    Normalize truthy/falsy values across 1/0, True/False, 'yes'/'no', 'Hai'/'Nahi', etc.
    """
    if val is None:
        return None
    if isinstance(val, bool):
        return val
    
    s = str(val).strip().lower()
    if s in ('1', 'true', 't', 'yes', 'y', 'pass', 'passed', 'enabled', 'active', 'hai', 'success', 'successful'):
        return True
    if s in ('0', 'false', 'f', 'no', 'n', 'fail', 'failed', 'disabled', 'inactive', 'nahi', 'failure'):
        return False
    return None


def normalize_risk_score(val: Any) -> float:
    """
    Normalize risk scores from numbers, fractions ("78/100"), or qualitative text ("High")
    into a continuous float between 0.0 and 100.0.
    """
    if val is None:
        return 0.0
    
    val_str = str(val).strip().lower()
    if not val_str or val_str in ('none', 'nan', 'null', 'na', 'unknown'):
        return 0.0
    
    # Fraction format "78/100"
    if '/' in val_str:
        parts = val_str.split('/')
        try:
            num = float(parts[0].strip())
            denom = float(parts[1].strip())
            if denom > 0:
                return round(min(100.0, max(0.0, (num / denom) * 100.0)), 2)
        except (ValueError, ZeroDivisionError):
            pass
            
    # Text representations
    text_map = {
        'critical': 95.0,
        'severe': 90.0,
        'high': 75.0,
        'medium': 50.0,
        'med': 50.0,
        'low': 25.0,
        'info': 10.0,
        'informational': 10.0,
        'none': 0.0,
        'zero': 0.0
    }
    if val_str in text_map:
        return text_map[val_str]
        
    # Standard float / int
    try:
        score = float(val_str)
        # If score is normalized between 0 and 1, convert to 0-100
        if 0.0 < score <= 1.0 and '.' in val_str:
            score = score * 100.0
        return round(min(100.0, max(0.0, score)), 2)
    except ValueError:
        return 0.0
