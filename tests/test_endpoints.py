import urllib.request
import json
import sys

endpoints = [
    ('Overview', 'http://localhost:8000/api/overview'),
    ('Leaderboard', 'http://localhost:8000/api/leaderboard?limit=5'),
    ('Export CSV', 'http://localhost:8000/api/leaderboard/export-csv'),
    ('UEBA Baselines', 'http://localhost:8000/api/ueba-baselines'),
    ('Incident Correlation', 'http://localhost:8000/api/incident-correlation'),
    ('Attack Paths', 'http://localhost:8000/api/attack-paths'),
    ('Financial Impact', 'http://localhost:8000/api/financial-impact'),
    ('User Dossier', 'http://localhost:8000/api/user/EMP11224'),
    ('Network Graph', 'http://localhost:8000/api/network-graph?max_nodes=30'),
    ('MITRE Matrix', 'http://localhost:8000/api/mitre-matrix'),
    ('Telemetry Stream', 'http://localhost:8000/api/telemetry-stream?limit=5'),
    ('Supervised Model', 'http://localhost:8000/api/ml/supervised-threat-model'),
    ('Outlier Consensus', 'http://localhost:8000/api/ml/outlier-consensus'),
    ('Graph Blast Radius', 'http://localhost:8000/api/ml/graph-blast-radius'),
    ('Multi-Surge Forecast', 'http://localhost:8000/api/ml/multi-surge-forecast'),
    ('Kill Chain Matrix', 'http://localhost:8000/api/ml/kill-chain-matrix'),
    ('Vite Frontend Root', 'http://localhost:3000/')
]

print('=' * 65)
print('VERIFYING FULL AGENTIQ ENTERPRISE SOC ENDPOINTS')
print('=' * 65)

all_passed = True

for name, url in endpoints:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = resp.read()
            print(f"[PASS] {name:<22} -> Status {resp.status}, Size: {len(data)} bytes")
    except Exception as e:
        print(f"[FAIL] {name:<22} -> Error: {e}")
        all_passed = False

# Test POST simulate-containment
try:
    req = urllib.request.Request(
        'http://localhost:8000/api/simulate-containment',
        data=json.dumps({'threshold': 70.0, 'auto_isolate': True, 'revoke_tokens': True, 'block_ips': True}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        res_json = json.loads(resp.read().decode('utf-8'))
        print(f"[PASS] {'Containment SOAR':<22} -> Status {resp.status}, Contained Users: {len(res_json.get('contained_users', []))}")
except Exception as e:
    print(f"[FAIL] {'Containment SOAR':<22} -> Error: {e}")
    all_passed = False

# Test POST agent/query
try:
    req = urllib.request.Request(
        'http://localhost:8000/api/agent/query',
        data=json.dumps({'query': 'What are the top 5 highest risk departments?'}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        res_json = json.loads(resp.read().decode('utf-8'))
        print(f"[PASS] {'AI Copilot Agent':<22} -> Status {resp.status}, Chart: {res_json.get('chart_type')}, Title: {res_json.get('title')}")
except Exception as e:
    print(f"[FAIL] {'AI Copilot Agent':<22} -> Error: {e}")
    all_passed = False

print('=' * 65)
if all_passed:
    print('ALL 19 ENDPOINTS & SOAR / COPILOT APIS PASSED 100%')
else:
    print('SOME CHECKS FAILED')
    sys.exit(1)
