"""
AgentIQ Datathon - Track 2: Cybersecurity
Unified Best-in-Class Multi-LLM Engine (Groq LLaMA-3.3-70B & Gemini 2.5 Flash Auto-Routing)
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
from dotenv import load_dotenv, dotenv_values

from src.agent.graph_agent import AgenticGraphAI
from src.models.database import DB_PATH, get_duckdb_connection

logger = logging.getLogger("ai_providers")

SOC_SYSTEM_PROMPT = """You are AgentIQ, an elite Zero-Trust Cybersecurity Analyst AI specializing in Multi-Vector Telemetry Correlation and Insider Threat Detection for an enterprise SOC.

Enterprise Telemetry Baseline:
- 3,000 Corporate Identities across 62,431 multi-vector telemetry events.
- 507 Terminated Employees actively generating authentication requests, firewall flows, and endpoint alerts (Critical Zero-Trust Policy Violation).
- 483 Temporal Paradox Anomalies in Endpoint EDR (resolved_timestamp < detected_timestamp, indicating log tampering/audit falsification).
- 22,367 Malicious/Spoofed IP Packets in Firewall Ingress Logs.
- High-Risk Departments: R&D (High critical alerts), Procurement (MFA bypass spikes), IT (Elevated access risk).

Your Role:
1. Analyze cybersecurity telemetry queries with rigorous technical depth.
2. Formulate clear, executive-grade findings and threat assessments based on the provided ground-truth query data.
3. Reference relevant MITRE ATT&CK techniques (e.g. T1078 Valid Accounts, T1070 Indicator Removal, T1110 Brute Force, T1059 Command and Scripting Interpreter).
4. Provide structured, actionable Zero-Trust containment playbooks (NIST SP 800-207 compliant).
5. Always keep responses concise, authoritative, professional, and high-impact.
"""

def resolve_api_keys() -> Tuple[str, str]:
    """Resolves Groq and Gemini API keys checking both process env and .env file."""
    env_vals = dotenv_values()
    groq = os.environ.get("GROQ_API_KEY", "").strip() or str(env_vals.get("GROQ_API_KEY") or "").strip()
    gemini = (
        os.environ.get("GEMINI_API_KEY", "").strip() 
        or os.environ.get("GOOGLE_API_KEY", "").strip() 
        or str(env_vals.get("GEMINI_API_KEY") or "").strip()
        or str(env_vals.get("GOOGLE_API_KEY") or "").strip()
    )
    return groq, gemini

def get_active_model_info() -> Dict[str, str]:
    """Returns the current best active model based on configured API keys in .env or environment."""
    groq_key, gemini_key = resolve_api_keys()

    if groq_key and not groq_key.startswith("your_"):
        return {
            "provider": "Groq Cloud (GPT-OSS-120B / Qwen 3.8 27B)",
            "model": "openai/gpt-oss-120b",
            "tier": "Tier 1 120B Dense Reasoning & Ultra-Fast Inference",
            "status": "ONLINE"
        }
    elif gemini_key and not gemini_key.startswith("your_"):
        return {
            "provider": "Google Gemini (Gemini 3 Flash Preview)",
            "model": "gemini-3-flash-preview",
            "tier": "Tier 1 Next-Gen Multimodal & Deep Reasoning",
            "status": "ONLINE"
        }
    else:
        return {
            "provider": "AgentIQ Autonomous Telemetry Engine",
            "model": "AgentIQ-DuckDB-NLQ-v2",
            "tier": "Autonomous Local OLAP (Zero-External-Dependency)",
            "status": "LOCAL_ONLINE"
        }

def generate_best_ai_chat(
    prompt: str,
    history: Optional[List[Dict[str, str]]] = None,
    context_data: Optional[Dict[str, Any]] = None,
    custom_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Intelligently routes to the single best model available:
    1. First executes DuckDB OLAP engine to obtain ground-truth analytical facts and interactive chart.
    2. If Groq API key is present: Uses GPT-OSS-120B / Qwen 3.8 27B with sub-second inference.
    3. If Gemini API key is present: Uses Gemini 3 Flash Preview via official google-genai SDK.
    4. If no keys are configured: Seamlessly uses AgentIQ Autonomous DuckDB Engine.
    """
    load_dotenv(override=True)
    
    # 1. First run the deterministic DuckDB query to extract real telemetry facts
    agent = AgenticGraphAI()
    local_res = agent.execute_nl_query(prompt)
    df_data = local_res.get("data")
    
    # Format tabular data snippet for LLM context grounding
    data_summary = ""
    if isinstance(df_data, pd.DataFrame) and not df_data.empty:
        data_summary = df_data.head(10).to_string(index=False)
    
    groq_key, gemini_key = resolve_api_keys()
    if custom_key:
        if custom_key.startswith("gsk_"):
            groq_key = custom_key
        else:
            gemini_key = custom_key
    
    grounded_user_prompt = f"""User Investigative Query: "{prompt}"

Ground-Truth Telemetry Query Result (from DuckDB Fact/Dim Store):
```
{data_summary if data_summary else "Query executed against multi-vector telemetry baseline."}
```
Generated SQL Query: `{local_res.get('sql', '')}`

Please synthesize an executive threat assessment, identifying MITRE ATT&CK tactics and specific NIST SP 800-207 Zero-Trust mitigation recommendations based on this evidence."""

    # Priority 1: Groq Cloud (Ultra-Fast 120B Model Reasoning)
    if groq_key and not groq_key.startswith("your_"):
        groq_models = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b"]
        for g_model in groq_models:
            try:
                from groq import Groq
                client = Groq(api_key=groq_key, timeout=4.0)

                messages = [{"role": "system", "content": SOC_SYSTEM_PROMPT}]
                if history:
                    for turn in history[-4:]:
                        messages.append({
                            "role": "user" if turn.get("role") == "user" else "assistant",
                            "content": turn.get("content") or turn.get("text", "")
                        })
                messages.append({"role": "user", "content": grounded_user_prompt})

                chat_completion = client.chat.completions.create(
                    messages=messages,
                    model=g_model,
                    temperature=0.2,
                    max_tokens=1200
                )

                reply_text = chat_completion.choices[0].message.content or "Analysis completed successfully."

                return {
                    "query": prompt,
                    "provider": f"Groq Cloud ({g_model})",
                    "model": g_model,
                    "response": reply_text,
                    "sql": local_res.get("sql", ""),
                    "chart_type": local_res.get("chart_type", "bar"),
                    "figure": local_res.get("figure"),
                    "title": local_res.get("title", "Cyber Telemetry Analysis"),
                    "data": df_data,
                    "summary": reply_text,
                    "recommendation": local_res.get("recommendation", "Execute immediate Zero-Trust SOAR containment."),
                    "status": "ONLINE (GROQ HIGH-SPEED)"
                }
            except Exception as e:
                logger.warning(f"Groq model {g_model} encountered issue ({e}), trying next model.")

    # Priority 2: Google Gemini (Gemini 2.5 Flash / Flash Latest)
    if gemini_key and not gemini_key.startswith("your_"):
        gemini_models = ["gemini-2.5-flash", "gemini-flash-latest"]
        for gem_model in gemini_models:
            try:
                from google import genai
                client = genai.Client(api_key=gemini_key)

                contents = [SOC_SYSTEM_PROMPT]
                if history:
                    for turn in history[-4:]:
                        role = "User" if turn.get("role") == "user" else "Model"
                        contents.append(f"{role}: {turn.get('content') or turn.get('text', '')}")
                contents.append(f"User: {grounded_user_prompt}")

                response = client.models.generate_content(
                    model=gem_model,
                    contents="\n\n".join(contents)
                )

                reply_text = response.text or "Analysis completed successfully."

                return {
                    "query": prompt,
                    "provider": f"Google Gemini ({gem_model})",
                    "model": gem_model,
                    "response": reply_text,
                    "sql": local_res.get("sql", ""),
                    "chart_type": local_res.get("chart_type", "bar"),
                    "figure": local_res.get("figure"),
                    "title": local_res.get("title", "Cyber Telemetry Analysis"),
                    "data": df_data,
                    "summary": reply_text,
                    "recommendation": local_res.get("recommendation", "Execute immediate Zero-Trust SOAR containment."),
                    "status": "ONLINE (GEMINI)"
                }
            except Exception as e:
                logger.warning(f"Gemini model {gem_model} encountered issue ({e}), trying next model.")

    # Fallback: Autonomous DuckDB Engine
    narrative = local_res.get("summary", "")
    return {
        "query": prompt,
        "provider": "AgentIQ Autonomous Telemetry Engine",
        "model": "AgentIQ-DuckDB-NLQ-v2",
        "response": narrative,
        "sql": local_res.get("sql", ""),
        "chart_type": local_res.get("chart_type", "bar"),
        "figure": local_res.get("figure"),
        "title": local_res.get("title", "Security Telemetry Analysis"),
        "data": df_data,
        "summary": narrative,
        "recommendation": local_res.get("recommendation", "Execute Zero-Trust SOAR Deprovisioning for offboarded accounts."),
        "status": "AUTONOMOUS (LOCAL OLAP)"
    }


