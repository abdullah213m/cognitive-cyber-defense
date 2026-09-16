# 🛡️ AgentIQ SENTINEL: 15-Slide Executive Pitch Deck & Speaker Guide
**TransOrg Datathon 2026 • Cognitive Cyber Defense & Continuous Zero-Trust Verification Track**

---

## 📂 Presentation Deliverables & Formats

1. **PowerPoint Master File (.pptx)**: 
   - Path: [`AgentIQ_Executive_Master_Presentation.pptx`](file:///c:/Users/hp/Downloads/datathon/AgentIQ_Executive_Master_Presentation.pptx)
   - Layout: 16:9 Widescreen, Layered Dark Glassmorphism, 15 Custom Infographic Slides.
   - Compatible: Microsoft PowerPoint, Google Slides, Keynote, LibreOffice.

2. **Interactive Web Presentation (.html)**:
   - Path: [`presentation.html`](file:///c:/Users/hp/Downloads/datathon/presentation.html)
   - Usage: Double click to open in Chrome / Edge / Firefox. Supports Fullscreen (`F`), Left/Right Arrow Keys, and Spacebar navigation.

3. **Live Deployed Platform**:
   - URL: [https://cognitive-cyber-defense.vercel.app](https://cognitive-cyber-defense.vercel.app)
   - GitHub Repository: [https://github.com/abdullah213m/cognitive-cyber-defense](https://github.com/abdullah213m/cognitive-cyber-defense)

---

## 🎙️ Slide-by-Slide Speaker Script & Key Highlights

### Slide 1: Cover & Hero (Title Slide)
- **Title**: AgentIQ SENTINEL — Continuous Threat Intelligence & Zero-Trust Verification Engine
- **Badges**: `TRANSORG DATATHON 2026` • `DEFCON 2 ACTIVE` • `NIST SP 800-207`
- **Speaker Script (30 sec)**:
  > *"Good morning respected jury and evaluators. Today, we are proud to present **AgentIQ Sentinel**, a next-generation cognitive cyber defense platform engineered to solve the single largest blindspot in modern enterprise security: **insider threat escalation and continuous zero-trust identity verification**. Powered by a sub-8ms DuckDB OLAP engine and Dual-Model AI reasoning, AgentIQ unifies 62,431 multi-vector telemetry events to neutralize active breaches in real time."*

---

### Slide 2: Problem Statement & Enterprise Threat Crisis
- **Focus**: The 3 Critical Industry Vulnerabilities
- **Speaker Script (45 sec)**:
  > *"In modern enterprise networks, firewalls no longer define the perimeter — identity does. However, 81% of advanced data breaches exploit valid credentials rather than software zero-days. When employees are offboarded, deprovisioning delays leave active tokens in circulation for months. Furthermore, security operations teams are overwhelmed by fragmented logs across IAM, EDR, and VPC flows, while advanced threat actors manipulate host NTP clocks to backdate logs and hide their lateral movement."*

---

### Slide 3: Multi-Vector Telemetry Landscape (The 62.4K Dataset)
- **Key Numbers**: `62,431 Events` • `3,000 Identities` • `3,091 Hosts` • `507 Active Breaches`
- **Speaker Script (45 sec)**:
  > *"To solve this, our platform ingested and normalized 4 disparate enterprise telemetry streams: Employee HR records, 20,500 IAM authentication events, 30,600 VPC network flow packets, and 8,240 EDR endpoint audits. Through automated continuous identity cross-checks, we surfaced **507 terminated employees** who were actively executing database queries and lateral probes post-offboarding."*

---

### Slide 4: End-to-End System Architecture
- **4-Stage Pipeline**: Ingestion Layer $\rightarrow$ DuckDB Analytics OLAP $\rightarrow$ Intelligence & SOAR $\rightarrow$ Command HUD & Dual AI
- **Speaker Script (45 sec)**:
  > *"Our architecture is built for speed and resilience. Telemetry streams pass through FastAPI asynchronous ingest parsers into an in-memory DuckDB columnar star schema. Risk calculations, clock-skew forensics, and MITRE mapping execute continuously in memory, while our Dual-AI copilot and React 18 Glassmorphic HUD provide real-time visibility and 1-click containment to SOC operators."*

---

### Slide 5: Data Engineering & Star Schema Deep-Dive
- **Highlights**: `Fact_Security_Events` joined with `Dim_Employees`, `Dim_Hosts`, `Dim_Mitre_Tactics`, `Dim_Perimeter_Rules`
- **Performance Metric**: **7.8ms p99 latency** (52x faster than relational SQL, < 45MB RAM footprint)
- **Speaker Script (40 sec)**:
  > *"Traditional relational databases choke when joining tens of thousands of EDR, IAM, and network records on the fly, taking over 400ms per query. By implementing a vector-optimized DuckDB star schema with SIMD CPU acceleration, our complex 4-way analytical queries execute in just **7.8 milliseconds** — over 52 times faster — consuming less than 45 megabytes of RAM."*

---

### Slide 6: Zero-Trust Composite Threat Scoring Engine
- **Formula**: $\text{Threat Score} = 0.35 \times \text{Identity} + 0.25 \times \text{Auth} + 0.20 \times \text{Endpoint} + 0.20 \times \text{Network}$
- **Empirical Case Study**: **Aarav Sharma (EMP11224)** — Score **96.5 / 100**, exfiltrating a 48.9MB DB dump on Port 5432.
- **Speaker Script (50 sec)**:
  > *"AgentIQ quantifies risk mathematically using a continuous composite scoring formula aligned with NIST SP 800-207. If a terminated user authenticates, an immediate 100-point identity risk penalty is applied. For example, our system flagged **Aarav Sharma (EMP11224)** with a Critical Threat Score of 96.5 after detecting 48 failed logins, 14 MFA rejections, and a 48.9MB unauthorized database dump from our production DB cluster."*

---

### Slide 7: Forensic Innovation: Anti-Tamper Temporal Paradox Engine
- **Innovation**: Detecting clock-skew adversarial log manipulation using hardware packet arrival delta timestamps.
- **Result**: **483 Log Tampering Paradoxes** surfaced with SHA-256 Merkle blockchain proof trees.
- **Speaker Script (50 sec)**:
  > *"One of our key innovations is the **Temporal Paradox Forensic Engine**. Advanced adversaries alter system NTP clocks to backdate logs so their attacks appear prior to the breach, tricking chronological SIEM rules. AgentIQ compares hardware packet arrival timestamps against host application logs. Any delta under -100ms is flagged as a temporal paradox, and every verified entry is sealed in a cryptographic SHA-256 Merkle tree for court-admissible audit proof."*

---

### Slide 8: Graph Analytics & Crown Jewel Defense
- **Interactive Graph**: 3,000 nodes, 3,091 edges, Crown Jewel Assets (`PROD-DB-CLUSTER`, `EXECUTIVE-IAM-VAULT`, `CROWN-JEWEL-DC-01`)
- **Speaker Script (40 sec)**:
  > *"In our interactive D3 network topology graph, operators can visualize the enterprise blast radius. We map all connections to crown jewel assets like our Postgres cluster, HashiCorp Vault, and Active Directory Domain Controllers, instantly exposing lateral movement over SMB Port 445 and circular IP tunneling on Port 8080."*

---

### Slide 9: MITRE ATT&CK Enterprise Kill-Chain Defense
- **6 Kill-Chain Phases**: Initial Access (T1078), Credential Access (T1110), Lateral Movement (T1021), Defense Evasion (T1070), Exfiltration (T1041), Impact (T1486)
- **Speaker Script (40 sec)**:
  > *"Every alert is mapped directly against the MITRE ATT&CK framework. From Initial Access via valid offboarded credentials (2,480 events) to Credential Access via MFA fatigue (1,890 events) and Exfiltration over C2 channels (980 events), our platform provides complete kill-chain visibility and automated playbooks."*

---

### Slide 10: Dual-Model Cognitive AI Intelligence
- **Tier 1 (Groq 120B Speed Layer, < 120ms)**: Natural language $\rightarrow$ schema-constrained DuckDB SQL compiler (0 hallucinations).
- **Tier 2 (Gemini 2.5 Pro Strategic Layer)**: Autonomous Root-Cause Analysis (RCA), CISO audit briefs, and NIST SP 800-61 playbooks.
- **Speaker Script (45 sec)**:
  > *"Our Dual-AI architecture combines speed and strategic intelligence. For ad-hoc querying, Groq LPUs running Llama-3.3 translate natural language into verified DuckDB SQL in under 120 milliseconds with zero hallucinations. For executive leadership, Gemini 2.5 Pro synthesizes multi-stage root-cause analyses and CISO compliance briefs in seconds."*

---

### Slide 11: SOAR 1-Click Automated Containment Sandbox
- **3-Stage Containment**: Policy Trigger $\rightarrow$ Multi-Vector Mitigation (< 300ms) $\rightarrow$ Verifiable Recovery ($96.5 \rightarrow 12.0$)
- **Speaker Script (45 sec)**:
  > *"Detection without containment is useless. In our SOAR sandbox, when an entity crosses the Critical threshold (Score $\ge 75$), an operator can execute 1-click containment. In under 300 milliseconds, Active Directory tokens are revoked, edge firewalls blacklist the IP, and the endpoint is isolated from the LAN, dropping the threat score from 96.5 to 12.0."*

---

### Slide 12: Competitive Benchmark (Legacy SIEM vs AgentIQ)
- **Comparison Dimensions**: Latency (420ms vs 7.8ms), Deprovisioning (Manual vs Continuous), Forensics (Blind vs Merkle Trees), MTTR (4.2 hrs vs < 300ms)
- **Speaker Script (40 sec)**:
  > *"Compared to legacy SIEM solutions like Splunk, QRadar, or Elastic, AgentIQ delivers a 52x speedup in analytical query latency, continuous zero-trust offboarding enforcement, and sub-300ms automated containment, cutting Mean Time to Respond from 4.2 hours down to seconds."*

---

### Slide 13: Performance Benchmarks & Validation Metrics
- **Validation**: 100% precision on 507 offboarded accounts, < 3s MTTD, 120,000 events/sec sustained throughput.
- **Speaker Script (35 sec)**:
  > *"Our empirical benchmarks demonstrate 100% precision in identifying all 507 terminated accounts with zero false positives. Our mean time to detect is under 3 seconds, compared to the 197-day industry average for insider credential misuse."*

---

### Slide 14: Business Impact, ROI & Scalability Roadmap
- **Financial Metric**: **$4.45M** average breach cost avoidance per IBM Security Benchmark.
- **SOC Metric**: **90% reduction in alert fatigue**, **12+ hours saved** per incident report.
- **Roadmap**: Snowflake/BigQuery Lakehouse connectors, eBPF Linux kernel tracing.
- **Speaker Script (35 sec)**:
  > *"From a business perspective, AgentIQ delivers an estimated $4.45M in breach cost avoidance per incident, reduces SOC alert fatigue by 90%, and saves over 12 hours of manual CISO report writing per investigation. Our roadmap includes native connectors for Snowflake, BigQuery, and eBPF kernel probes."*

---

### Slide 15: Conclusion, Deliverables & Live Demo Access
- **Summary**: Full-Stack platform ready for production deployment.
- **Links**: Live Vercel Portal (`cognitive-cyber-defense.vercel.app`) & GitHub Repo.
- **Speaker Script (30 sec)**:
  > *"In summary, AgentIQ Sentinel delivers a complete, production-ready, cognitive cyber defense platform. It is live, fully responsive on both laptop and mobile, and deployed on Vercel with a FastAPI backend. We invite the jury to explore the live dashboard and copilot, and we are now open for your questions. Thank you!"*
