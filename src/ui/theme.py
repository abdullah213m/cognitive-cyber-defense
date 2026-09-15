"""
AgentIQ Datathon - Track 2: Cybersecurity
UI Design System, Theme Tokens & Custom CSS for Executive SOC Command Center
Classic Pro Enterprise Standard
"""

CUSTOM_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
    --bg-void: #0B0F19;
    --bg-deep: #0F172A;
    --bg-panel: rgba(15, 23, 42, 0.85);
    --primary: #3B82F6;
    --primary-hover: #2563EB;
    --rose: #F43F5E;
    --amber: #F59E0B;
    --emerald: #10B981;
    --font-display: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
    --font-body: 'Inter', -apple-system, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
}

html, body, [class*="css"], .stMarkdown {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    letter-spacing: -0.011em;
}

/* Background & Main App */
.stApp {
    background-color: #0B0F19;
    color: #F8FAFC;
    background-image: 
        radial-gradient(circle at 15% 15%, rgba(59, 130, 246, 0.05) 0%, transparent 45%),
        radial-gradient(circle at 85% 85%, rgba(139, 92, 246, 0.04) 0%, transparent 45%),
        linear-gradient(rgba(255, 255, 255, 0.012) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.012) 1px, transparent 1px);
    background-size: 100% 100%, 100% 100%, 36px 36px, 36px 36px;
}

/* ==========================================================================
   SIDEBAR STYLING & CLASSIC PRO NAVIGATION
   ========================================================================== */
section[data-testid="stSidebar"],
[data-testid="stSidebar"],
div[data-testid="stSidebarContent"] {
    background: #0B1120 !important;
    background-color: #0B1120 !important;
    border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5) !important;
}

section[data-testid="stSidebar"] > div:first-child,
[data-testid="stSidebarContent"],
[data-testid="stSidebarUserContent"] {
    padding: 18px 14px !important;
}

/* Custom Scrollbar for Sidebar */
section[data-testid="stSidebar"] ::-webkit-scrollbar {
    width: 5px;
}
section[data-testid="stSidebar"] ::-webkit-scrollbar-track {
    background: rgba(11, 17, 32, 0.8);
}
section[data-testid="stSidebar"] ::-webkit-scrollbar-thumb {
    background: #1E293B;
    border-radius: 4px;
}
section[data-testid="stSidebar"] ::-webkit-scrollbar-thumb:hover {
    background: #334155;
}

/* Hide Radio Label Widget Header */
section[data-testid="stSidebar"] div[data-testid="stRadio"] > label,
div[data-testid="stRadio"] > label,
div[data-testid="stWidgetLabel"] {
    display: none !important;
}

/* Radio Group Container */
section[data-testid="stSidebar"] div[role="radiogroup"],
div[data-testid="stRadio"] div[role="radiogroup"],
div[role="radiogroup"] {
    gap: 4px !important;
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
}

/* 100% HIDE ALL RADIO BUTTON CIRCLES, GLYPHS, SVGS & BULLETS */
section[data-testid="stSidebar"] div[data-testid="stRadio"] input[type="radio"],
section[data-testid="stSidebar"] div[role="radiogroup"] input[type="radio"],
section[data-testid="stSidebar"] div[data-testid="stRadio"] label > div:first-child,
section[data-testid="stSidebar"] div[role="radiogroup"] label > div:first-child,
section[data-testid="stSidebar"] label[data-baseweb="radio"] > div:first-child,
div[data-testid="stRadio"] div[role="radiogroup"] label > div:first-child,
div[data-baseweb="radio"] > div:first-child {
    display: none !important;
    visibility: hidden !important;
    width: 0 !important;
    height: 0 !important;
    min-width: 0 !important;
    max-width: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    opacity: 0 !important;
    pointer-events: none !important;
    position: absolute !important;
}

section[data-testid="stSidebar"] div[role="radiogroup"] label svg,
section[data-testid="stSidebar"] div[data-testid="stRadio"] svg {
    display: none !important;
}

/* Sleek, Classic Enterprise Nav Buttons */
section[data-testid="stSidebar"] div[role="radiogroup"] label,
section[data-testid="stSidebar"] div[data-testid="stRadio"] div[role="radiogroup"] label,
section[data-testid="stSidebar"] label[data-baseweb="radio"],
div[data-baseweb="radio"] {
    background: rgba(30, 41, 59, 0.45) !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
    border-radius: 8px !important;
    padding: 8px 12px !important;
    min-height: 38px !important;
    margin: 2px 0 !important;
    cursor: pointer !important;
    transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: flex-start !important;
    width: 100% !important;
    box-sizing: border-box !important;
    position: relative !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
}

/* Hover State */
section[data-testid="stSidebar"] div[role="radiogroup"] label:hover,
section[data-testid="stSidebar"] div[data-testid="stRadio"] div[role="radiogroup"] label:hover,
section[data-testid="stSidebar"] label[data-baseweb="radio"]:hover {
    background: rgba(59, 130, 246, 0.12) !important;
    border-color: rgba(59, 130, 246, 0.35) !important;
    transform: translateX(2px) !important;
}

/* Active / Checked State */
section[data-testid="stSidebar"] div[role="radiogroup"] label:has(input:checked),
section[data-testid="stSidebar"] div[role="radiogroup"] label[aria-checked="true"],
section[data-testid="stSidebar"] div[role="radiogroup"] label[data-checked="true"],
section[data-testid="stSidebar"] div[role="radiogroup"] label:has([aria-checked="true"]),
section[data-testid="stSidebar"] div[data-testid="stRadio"] div[role="radiogroup"] label:has(input:checked),
section[data-testid="stSidebar"] label[data-baseweb="radio"]:has(input:checked),
div[data-baseweb="radio"]:has(input:checked) {
    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%) !important;
    border: 1px solid #60A5FA !important;
    box-shadow: 0 2px 12px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
    transform: translateX(2px) !important;
}

/* Navigation Typography */
section[data-testid="stSidebar"] div[role="radiogroup"] [data-testid="stMarkdownContainer"],
section[data-testid="stSidebar"] div[role="radiogroup"] [data-testid="stMarkdownContainer"] p,
section[data-testid="stSidebar"] div[role="radiogroup"] label p,
section[data-testid="stSidebar"] div[role="radiogroup"] label span,
section[data-testid="stSidebar"] div[role="radiogroup"] label div,
section[data-testid="stSidebar"] label[data-baseweb="radio"] p,
div[data-testid="stRadio"] div[role="radiogroup"] label p {
    font-family: 'Plus Jakarta Sans', 'Inter', sans-serif !important;
    font-size: 0.82rem !important;
    font-weight: 500 !important;
    color: #94A3B8 !important;
    margin: 0 !important;
    padding: 0 !important;
    white-space: nowrap !important;
    letter-spacing: -0.01em !important;
    transition: color 0.15s ease !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    line-height: 1.3 !important;
}

section[data-testid="stSidebar"] div[role="radiogroup"] label:hover [data-testid="stMarkdownContainer"] p,
section[data-testid="stSidebar"] div[role="radiogroup"] label:hover p,
section[data-testid="stSidebar"] label[data-baseweb="radio"]:hover p {
    color: #FFFFFF !important;
}

section[data-testid="stSidebar"] div[role="radiogroup"] label:has(input:checked) [data-testid="stMarkdownContainer"] p,
section[data-testid="stSidebar"] div[role="radiogroup"] label[aria-checked="true"] [data-testid="stMarkdownContainer"] p,
section[data-testid="stSidebar"] div[role="radiogroup"] label:has(input:checked) p,
section[data-testid="stSidebar"] label[data-baseweb="radio"]:has(input:checked) p {
    color: #FFFFFF !important;
    font-weight: 600 !important;
    text-shadow: none !important;
}

/* Sidebar Selectboxes */
section[data-testid="stSidebar"] div[data-testid="stSelectbox"] > div > div,
div[data-testid="stSelectbox"] > div > div {
    background-color: rgba(15, 23, 42, 0.9) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 8px !important;
    color: #FFFFFF !important;
    font-family: 'Inter', sans-serif !important;
    font-size: 0.82rem !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
    transition: all 0.18s ease !important;
}

section[data-testid="stSidebar"] div[data-testid="stSelectbox"] > div > div:hover {
    border-color: #3B82F6 !important;
}

section[data-testid="stSidebar"] div[data-testid="stSelectbox"] label,
div[data-testid="stSelectbox"] label {
    font-family: 'Inter', sans-serif !important;
    font-size: 0.78rem !important;
    font-weight: 600 !important;
    color: #94A3B8 !important;
    margin-bottom: 4px !important;
}

/* Sidebar Breach Filter Alert Checkbox */
section[data-testid="stSidebar"] div[data-testid="stCheckbox"] {
    background: rgba(244, 63, 94, 0.08) !important;
    border: 1px solid rgba(244, 63, 94, 0.35) !important;
    border-radius: 8px !important;
    padding: 8px 12px !important;
    margin-top: 8px !important;
    transition: all 0.18s ease !important;
    display: flex !important;
    align-items: center !important;
}

section[data-testid="stSidebar"] div[data-testid="stCheckbox"]:hover {
    border-color: rgba(244, 63, 94, 0.6) !important;
}

section[data-testid="stSidebar"] div[data-testid="stCheckbox"] label div[data-testid="stMarkdownContainer"] p,
section[data-testid="stSidebar"] div[data-testid="stCheckbox"] label p,
section[data-testid="stSidebar"] div[data-testid="stCheckbox"] label span {
    color: #FDA4AF !important;
    font-family: 'Inter', sans-serif !important;
    font-size: 0.78rem !important;
    font-weight: 600 !important;
    margin: 0 !important;
    line-height: 1.3 !important;
}

/* Main Workspace Checkboxes (e.g. SOAR Sandbox) */
div[data-testid="stCheckbox"]:not(section[data-testid="stSidebar"] div[data-testid="stCheckbox"]) {
    background: rgba(30, 41, 59, 0.4) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 8px !important;
    padding: 8px 12px !important;
    margin: 0 !important;
    transition: all 0.18s ease !important;
}

div[data-testid="stCheckbox"]:not(section[data-testid="stSidebar"] div[data-testid="stCheckbox"]):hover {
    border-color: rgba(59, 130, 246, 0.4) !important;
    background: rgba(59, 130, 246, 0.08) !important;
}

div[data-testid="stCheckbox"]:not(section[data-testid="stSidebar"] div[data-testid="stCheckbox"]) label div[data-testid="stMarkdownContainer"] p,
div[data-testid="stCheckbox"]:not(section[data-testid="stSidebar"] div[data-testid="stCheckbox"]) label p {
    color: #F1F5F9 !important;
    font-family: 'Inter', sans-serif !important;
    font-size: 0.82rem !important;
    font-weight: 500 !important;
    margin: 0 !important;
}

/* ==========================================================================
   CLASSIC PRO KPI CARDS & ALERTS
   ========================================================================== */
.kpi-card {
    background: linear-gradient(145deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.85) 100%);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(12px);
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    margin-bottom: 12px;
    position: relative;
    overflow: hidden;
}

.kpi-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #3B82F6, transparent);
    opacity: 0.6;
}

.kpi-card:hover {
    transform: translateY(-2px);
    border-color: rgba(59, 130, 246, 0.4);
    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.2);
}

.kpi-title {
    font-size: 0.74rem;
    font-weight: 600;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-family: 'Inter', sans-serif;
    margin-bottom: 6px;
}

.kpi-value {
    font-size: 2.1rem;
    font-weight: 700;
    color: #FFFFFF;
    font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    margin-bottom: 4px;
    letter-spacing: -0.02em;
}

.kpi-sub {
    font-size: 0.75rem;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
}

.kpi-danger {
    color: #F43F5E !important;
}

.kpi-warning {
    color: #F59E0B !important;
}

.kpi-success {
    color: #10B981 !important;
}

.kpi-cyan {
    color: #3B82F6 !important;
}

.kpi-purple {
    color: #8B5CF6 !important;
}

/* Zero Trust Alert Banner */
.zt-alert-banner {
    background: linear-gradient(90deg, rgba(244, 63, 94, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%);
    border: 1px solid rgba(244, 63, 94, 0.4);
    border-radius: 10px;
    padding: 14px 20px;
    margin: 15px 0 25px 0;
    color: #FDA4AF;
    font-size: 0.90rem;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 8px 24px -6px rgba(244, 63, 94, 0.2);
}

/* Headings */
h1, h2, h3 {
    font-family: 'Plus Jakarta Sans', 'Inter', sans-serif !important;
    font-weight: 700 !important;
    color: #F8FAFC !important;
    letter-spacing: -0.02em !important;
}

/* Dataframe Styling */
[data-testid="stDataFrame"] {
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
}

/* Classic pulse animation */
@keyframes classicPulse {
    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
    70% { box-shadow: 0 0 0 7px rgba(16, 185, 129, 0); }
    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.radar-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #10B981;
    animation: classicPulse 2s infinite;
}
</style>
"""

def render_kpi_card(title: str, value: str, subtext: str, status: str = "cyan") -> str:
    """Renders classic executive KPI card HTML."""
    color_map = {
        "danger": "kpi-danger",
        "warning": "kpi-warning",
        "success": "kpi-success",
        "cyan": "kpi-cyan",
        "purple": "kpi-purple",
        "kpi-danger": "kpi-danger",
        "kpi-warning": "kpi-warning",
        "kpi-success": "kpi-success",
        "kpi-cyan": "kpi-cyan",
        "purple": "kpi-purple"
    }
    color_cls = color_map.get(status, "kpi-cyan")
    
    html = f"""
    <div class="kpi-card">
        <div class="kpi-title">{title}</div>
        <div class="kpi-value {color_cls}">{value}</div>
        <div class="kpi-sub" style="color: #94A3B8;">{subtext}</div>
    </div>
    """
    return html


# ==============================================================================
# CLASSIC PRO PALETTES & PLOTLY FORMATTING HELPER
# ==============================================================================
DARK_PALETTE = ['#3B82F6', '#F43F5E', '#10B981', '#F59E0B', '#8B5CF6', '#38BDF8', '#FB7185', '#34D399']

def apply_cyber_theme(fig, title: str = "", height: int = 350):
    """Applies a consistent sleek dark glassmorphism enterprise theme to Plotly figures."""
    fig.update_layout(
        template='plotly_dark',
        paper_bgcolor='rgba(15, 23, 42, 0.85)',
        plot_bgcolor='rgba(11, 15, 25, 0.5)',
        title=dict(
            text=f"<b>{title}</b>" if title else None,
            font=dict(family='Plus Jakarta Sans, Inter, sans-serif', color='#FFFFFF', size=15)
        ),
        font=dict(family='Inter, sans-serif', color='#94A3B8', size=11),
        margin=dict(l=35, r=35, t=50 if title else 25, b=35),
        height=height,
        xaxis=dict(
            gridcolor='rgba(255, 255, 255, 0.04)',
            linecolor='rgba(255, 255, 255, 0.1)',
            tickfont=dict(family='Inter, sans-serif', color='#94A3B8', size=10)
        ),
        yaxis=dict(
            gridcolor='rgba(255, 255, 255, 0.04)',
            linecolor='rgba(255, 255, 255, 0.1)',
            tickfont=dict(family='JetBrains Mono, monospace', color='#94A3B8', size=10)
        ),
        legend=dict(
            bgcolor='rgba(15, 23, 42, 0.9)',
            bordercolor='rgba(255, 255, 255, 0.1)',
            borderwidth=1,
            font=dict(family='Inter, sans-serif', size=11, color='#E2E8F0')
        )
    )
    fig.update_traces(
        marker=dict(line=dict(width=1, color='rgba(255, 255, 255, 0.15)'))
    )
    return fig
