// ==========================================================================
// Cypher Vantage - Proactive AI Operational Resilience Analyst (ES6 Module)
// ==========================================================================

import { getState } from '../core/db.js';
import { createStatusBadge, showModal } from '../components/ui.js';

let activeBriefingSchedule = 'daily'; // 'daily' | 'weekly' | 'monthly'
let isScanning = true;
let chatHistory = [
  { sender: 'analyst', text: 'Welcome! Ask me about DORA gaps, supplier concentrations, or RTO tolerances.' }
];

// Mock telemetry logs for the scanning agent console
const telemetryLogs = [
  "Agent parse database model variables...",
  "Scan supplier exit plans under Article 14...",
  "Analyze payments processing replication latency...",
  "Cross-check SOC 2 logs against operational control ctl-002...",
  "Check RTO tolerances vs. simulated failover logs...",
  "Armed & active - continuous security monitoring..."
];

export function renderAnalystModule() {
  const container = document.getElementById('analyst-module-container');
  if (!container) return;

  const state = getState();

  // Pick random telemetry log to show background activity
  const activeLog = telemetryLogs[Math.floor(Math.random() * telemetryLogs.length)];
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Compute status metrics for the 8 capabilities
  const gapsCount = state.obligations.filter(ob => ob.status !== 'Compliant').length;
  const activeIncidents = state.incidents.filter(i => i.status === 'Active' || i.status === 'Open').length;
  const metControls = state.controls.filter(c => c.status === 'Met').length;
  const totalControls = state.controls.length;

  // Render chat history HTML
  const escapeHTML = (str) => str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag] || tag));

  const chatHistoryHTML = chatHistory.map(msg => {
    const isUser = msg.sender === 'user';
    const label = isUser ? '<b>User:</b>' : '<b>Analyst:</b>';
    const color = isUser ? 'var(--color-cyan)' : 'var(--text-primary)';
    return `<div style="color: ${color}; line-height: 1.35; margin-bottom: 4px;">${label} ${escapeHTML(msg.text)}</div>`;
  }).join('');

  container.innerHTML = `
    <style>
      .briefing-tab-btn {
        background: rgba(255,255,255,0.02) !important;
        border: 1px solid rgba(255,255,255,0.06) !important;
        padding: 8px 16px !important;
        font-size: 0.72rem !important;
        font-weight: 600 !important;
        color: #94a3b8 !important;
        cursor: pointer !important;
        border-radius: 4px !important;
        transition: all 0.2s ease !important;
      }
      .briefing-tab-btn:hover {
        background: rgba(255,255,255,0.04) !important;
        color: #fff !important;
      }
      .briefing-tab-btn.active {
        background: linear-gradient(135deg, #06b6d4, #8b5cf6) !important;
        color: #fff !important;
        border: none !important;
        box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2) !important;
      }
      .scan-badge {
        font-size: 0.58rem;
        font-family: monospace;
        padding: 2px 6px;
        border-radius: 3px;
        font-weight: 700;
      }
      .scan-badge-active {
        background: rgba(16, 185, 129, 0.08);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.2);
      }
      .scan-badge-warn {
        background: rgba(245, 158, 11, 0.08);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.2);
      }
      .scan-badge-danger {
        background: rgba(239, 68, 68, 0.08);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.2);
      }
      .briefing-section {
        border-left: 2px solid rgba(6, 182, 212, 0.2);
        padding-left: 12px;
        margin-bottom: 16px;
      }
      .citation-tag {
        display: inline-block;
        font-size: 0.58rem;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.05);
        color: var(--text-secondary);
        padding: 1px 5px;
        border-radius: 3px;
        margin-right: 4px;
        margin-top: 3px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .citation-tag:hover {
        background: rgba(6, 182, 212, 0.1);
        border-color: rgba(6, 182, 212, 0.3);
        color: var(--color-cyan);
      }
      .scanner-card {
        background: rgba(255,255,255,0.015);
        border: 1px solid rgba(255,255,255,0.04);
        padding: 10px;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 6px;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }
      .scanner-card:hover {
        background: rgba(255,255,255,0.04) !important;
        border-color: rgba(6, 182, 212, 0.3) !important;
        transform: translateY(-1px) !important;
      }
      body.light-mode .scanner-card {
        background: rgba(0,0,0,0.01);
        border: 1px solid rgba(0,0,0,0.05);
      }
      body.light-mode .scanner-card:hover {
        background: rgba(0,0,0,0.03) !important;
        border-color: rgba(2, 132, 199, 0.3) !important;
      }
      body.light-mode .briefing-tab-btn {
        background: rgba(0, 0, 0, 0.02) !important;
        border: 1px solid rgba(0, 0, 0, 0.08) !important;
        color: #475569 !important;
      }
      body.light-mode .briefing-tab-btn:hover {
        background: rgba(0, 0, 0, 0.04) !important;
      }
      body.light-mode .briefing-tab-btn.active {
        background: linear-gradient(135deg, #0284c7, #8b5cf6) !important;
        color: #fff !important;
      }
      body.light-mode .citation-tag {
        background: rgba(0, 0, 0, 0.02);
        border: 1px solid rgba(0, 0, 0, 0.08);
      }
      body.light-mode .citation-tag:hover {
        background: rgba(2, 132, 199, 0.08);
        border-color: #0284c7;
        color: #0284c7;
      }
      .chat-preset-btn {
        background: rgba(255,255,255,0.02) !important;
        border: 1px solid rgba(255,255,255,0.06) !important;
        padding: 4px 8px !important;
        font-size: 0.58rem !important;
        color: #94a3b8 !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }
      .chat-preset-btn:hover {
        background: rgba(255,255,255,0.05) !important;
        border-color: rgba(6, 182, 212, 0.3) !important;
        color: #fff !important;
      }
      body.light-mode .chat-preset-btn {
        background: rgba(0, 0, 0, 0.02) !important;
        border: 1px solid rgba(0, 0, 0, 0.08) !important;
        color: #475569 !important;
      }
      body.light-mode .chat-preset-btn:hover {
        background: rgba(0, 0, 0, 0.04) !important;
        border-color: rgba(2, 132, 199, 0.3) !important;
        color: #0284c7 !important;
      }
      #analyst-module-container input,
      #analyst-module-container button,
      #analyst-module-container textarea,
      #analyst-module-container select {
        font-family: var(--font-body) !important;
      }
      @media print {
        body {
          background: #ffffff !important;
          color: #000000 !important;
        }
        /* Hide everything by default */
        body * {
          visibility: hidden !important;
        }
        /* Display only the report dossier container and its descendants */
        #analyst-report-dossier,
        #analyst-report-dossier * {
          visibility: visible !important;
        }
        /* Position print container at top left and remove styling backdrops */
        #analyst-report-dossier {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          border: none !important;
          box-shadow: none !important;
          background: #ffffff !important;
          color: #000000 !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        /* Hide export buttons inside report header during print */
        .briefing-export-btn {
          display: none !important;
        }
      }
    </style>

    <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%; box-sizing: border-box;">
      <!-- Left Panel: Proactive Analyst Console (65% width) -->
      <div style="flex: 2; min-width: 320px; display: flex; flex-direction: column; gap: 15px; box-sizing: border-box;">
        
        <!-- Telemetry Status Header -->
        <div class="dashboard-card" style="padding: 15px; margin: 0; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(6, 182, 212, 0.25); background: rgba(6, 182, 212, 0.02); box-sizing: border-box;">
          <div>
            <h2 style="font-size: 0.95rem; font-family: var(--font-headings); font-weight: 800; margin: 0; color: var(--color-cyan); display: flex; align-items: center; gap: 8px;">
              <span>🕵️‍♂️</span> AI Resilience Analyst Agent
            </h2>
            <p class="panel-subtitle" style="margin: 0; margin-top: 3px; font-size: 0.7rem; color: var(--text-secondary);">Continuous database parsing, compliance audit verification, and threat vector diagnostics.</p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <div style="display: flex; gap: 6px; align-items: center; margin-right: 6px;">
              <span class="pulse-indicator" style="background: #10b981; width: 6px; height: 6px; border-radius: 50%;"></span>
              <span style="font-size: 0.58rem; color: #10b981; font-family: monospace; font-weight: 700; text-transform: uppercase;">MONITORING LIVE</span>
            </div>
          </div>
        </div>

        <!-- 8 Core Autonomous Capabilities Scan Dashboard -->
        <div class="dashboard-card" style="padding: 15px; margin: 0; box-sizing: border-box;">
          <h4 style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-secondary); margin: 0 0 10px 0; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 4px;">
            🛡️ Proactive Scanners Status
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; font-size: 0.76rem;">
            <!-- Cap 1: Emerging Concerns -->
            <div class="scanner-card" data-cap="1">
              <strong style="color: var(--text-primary); font-size: 0.8rem;">1. Emerging Concerns</strong>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="scan-badge scan-badge-warn">1 Warning</span>
                <span style="color: var(--text-muted);">Article 11</span>
              </div>
            </div>
            <!-- Cap 2: Supplier Concentration -->
            <div class="scanner-card" data-cap="2">
              <strong style="color: var(--text-primary); font-size: 0.8rem;">2. Supplier Concentration</strong>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="scan-badge scan-badge-danger">Overlap Risk</span>
                <span style="color: var(--text-muted);">Tier-1 Core</span>
              </div>
            </div>
            <!-- Cap 3: Resilience Tests -->
            <div class="scanner-card" data-cap="3">
              <strong style="color: var(--text-primary); font-size: 0.8rem;">3. Test Recommendations</strong>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="scan-badge scan-badge-active">Armed</span>
                <span style="color: var(--text-muted);">DR Drills</span>
              </div>
            </div>
            <!-- Cap 4: Remediation Priorities -->
            <div class="scanner-card" data-cap="4">
              <strong style="color: var(--text-primary); font-size: 0.8rem;">4. Remediation Priorities</strong>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="scan-badge scan-badge-danger">High SLA Gaps</span>
                <span style="color: var(--text-muted);">2 Overdue</span>
              </div>
            </div>
            <!-- Cap 5: Resilience Degradation -->
            <div class="scanner-card" data-cap="5">
              <strong style="color: var(--text-primary); font-size: 0.8rem;">5. Degradation Predictor</strong>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="scan-badge scan-badge-warn">92% Baseline</span>
                <span style="color: var(--text-muted);">Replication Lag</span>
              </div>
            </div>
            <!-- Cap 6: Missing Controls -->
            <div class="scanner-card" data-cap="6">
              <strong style="color: var(--text-primary); font-size: 0.8rem;">6. Missing Controls</strong>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="scan-badge scan-badge-danger">${gapsCount} Active Gaps</span>
                <span style="color: var(--text-muted);">Article 14</span>
              </div>
            </div>
            <!-- Cap 7: Services to Breach SLA -->
            <div class="scanner-card" data-cap="7">
              <strong style="color: var(--text-primary); font-size: 0.8rem;">7. Tolerance Monitor</strong>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="scan-badge scan-badge-danger">2 At Risk</span>
                <span style="color: var(--text-muted);">RTO Exceeded</span>
              </div>
            </div>
            <!-- Cap 8: Board Compilation -->
            <div class="scanner-card" data-cap="8">
              <strong style="color: var(--text-primary); font-size: 0.8rem;">8. Board Briefing Engine</strong>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="scan-badge scan-badge-active">Armed</span>
                <span style="color: var(--text-muted);">Compiled</span>
              </div>
            </div>
          </div>
          <div style="margin-top: 10px; background: rgba(0,0,0,0.15); padding: 6px 10px; border-radius: 4px; font-family: monospace; font-size: 0.58rem; color: var(--text-muted); display: flex; justify-content: space-between;">
            <span>[AGENT TELEMETRY] ${activeLog}</span>
            <span>SYSTEM TIME: ${timestamp} UTC</span>
          </div>
        </div>

        <!-- Schedule Selectors -->
        <div style="display: flex; gap: 8px; align-items: center; width: 100%;">
          <button class="briefing-tab-btn ${activeBriefingSchedule === 'daily' ? 'active' : ''}" onclick="window.switchBriefingSchedule('daily')">☀️ Proactive Daily Briefing</button>
          <button class="briefing-tab-btn ${activeBriefingSchedule === 'weekly' ? 'active' : ''}" onclick="window.switchBriefingSchedule('weekly')">📅 Weekly Summary Analysis</button>
          <button class="briefing-tab-btn ${activeBriefingSchedule === 'monthly' ? 'active' : ''}" onclick="window.switchBriefingSchedule('monthly')">🏛️ Monthly Board Briefing</button>
        </div>

        <!-- Report Output Dossier Console -->
        <div class="dashboard-card" style="padding: 20px; margin: 0; min-height: 480px; display: flex; flex-direction: column; gap: 15px; box-sizing: border-box;" id="analyst-report-dossier">
          ${renderDossierReport(state, activeBriefingSchedule)}
        </div>
      </div>

      <!-- Right Panel: Insights & Recommendations Sidebar (35% width) -->
      <div style="flex: 1.1; min-width: 300px; display: flex; flex-direction: column; gap: 15px; box-sizing: border-box;">
        
        <!-- Live Insight Alerts Cards Container -->
        <div class="dashboard-card" style="padding: 15px; margin: 0; box-sizing: border-box;">
          <h4 style="font-size: 0.74rem; text-transform: uppercase; color: var(--color-cyan); margin: 0 0 10px 0; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 4px;">
            📢 Active Diagnostic Insights
          </h4>
          <div style="display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; padding-right: 2px;">
            ${renderSidebarFolder(state, activeBriefingSchedule)}
          </div>
        </div>

        <!-- Interactive Copilot Chatbot Panel (Expanded with Suggested Questions) -->
        <div class="dashboard-card" style="padding: 15px; margin: 0; background: rgba(6, 182, 212, 0.02); border: 1px solid rgba(6, 182, 212, 0.15); display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
          <h4 style="font-size: 0.72rem; text-transform: uppercase; color: var(--color-cyan); margin: 0; font-weight: 700; display: flex; align-items: center; gap: 6px;">
            <span>♊</span> Copilot Chatbot
          </h4>
          <div id="chatbot-messages" style="max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; font-size: 0.65rem; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; border: 1px solid var(--border-color);">
            ${chatHistoryHTML}
          </div>
          <!-- Suggested Guidance Questions (Presets) -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">💡 Suggested Queries</span>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              <button class="chat-preset-btn" data-query="Show services exceeding RTO tolerance">🔍 Exceeding Tolerance</button>
              <button class="chat-preset-btn" data-query="Check supplier concentration risks">⚠️ Concentrations</button>
              <button class="chat-preset-btn" data-query="Identify missing DORA control gaps">🛡️ Missing Gaps</button>
              <button class="chat-preset-btn" data-query="Show recommended resilience drills">🧪 Mapped Tests</button>
            </div>
          </div>
          <div style="display: flex; gap: 6px;">
            <input type="text" id="chatbot-query-input" placeholder="Ask DORA gaps, concentrations, etc..." style="flex: 1; padding: 6px 10px; font-size: 0.68rem; border-radius: 4px; background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); color: var(--text-primary);">
            <button id="btn-chatbot-send" class="btn btn-primary" style="padding: 6px 10px; font-size: 0.68rem; background: var(--color-cyan); color:#000; border:none; font-weight:700; cursor: pointer;">Send</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Expose global switcher
  window.switchBriefingSchedule = (schedule) => {
    activeBriefingSchedule = schedule;
    renderAnalystModule();
  };

  // Bind scanner card click triggers for details popup
  container.querySelectorAll('.scanner-card').forEach(card => {
    card.onclick = () => {
      const capId = card.getAttribute('data-cap');
      showScannerDetailsModal(capId);
    };
  });

  // Bind Copilot Chatbot query button
  const chatbotSendBtn = container.querySelector('#btn-chatbot-send');
  const chatbotInput = container.querySelector('#chatbot-query-input');
  if (chatbotSendBtn && chatbotInput) {
    const handleSend = () => {
      const query = chatbotInput.value.trim();
      if (!query) return;
      processChatbotQuery(query);
      renderAnalystModule();
    };
    chatbotSendBtn.onclick = handleSend;
    chatbotInput.onkeypress = (e) => {
      if (e.key === 'Enter') handleSend();
    };
  }

  // Bind Copilot Chatbot preset buttons
  container.querySelectorAll('.chat-preset-btn').forEach(btn => {
    btn.onclick = () => {
      const query = btn.getAttribute('data-query');
      processChatbotQuery(query);
      renderAnalystModule();
    };
  });

  // Scroll chatbot messages box to bottom
  const chatMsgBox = container.querySelector('#chatbot-messages');
  if (chatMsgBox) {
    chatMsgBox.scrollTop = chatMsgBox.scrollHeight;
  }

  // Bind inline citation click triggers
  container.querySelectorAll('.citation-tag').forEach(tag => {
    tag.onclick = () => {
      const type = tag.getAttribute('data-type');
      const id = tag.getAttribute('data-id');
      inspectCitationItem(type, id);
    };
  });

  // Bind briefing export buttons
  container.querySelectorAll('.briefing-export-btn').forEach(btn => {
    btn.onclick = () => {
      const type = btn.getAttribute('data-type');
      if (type === 'pdf') {
        window.print();
      } else {
        const element = document.getElementById('analyst-report-dossier');
        let reportHtml = '';
        if (element) {
          const cloned = element.cloneNode(true);
          cloned.querySelectorAll('.briefing-export-btn').forEach(b => b.remove());
          reportHtml = cloned.innerHTML.trim();
        } else {
          reportHtml = "<p>Cypher Vantage AI Operational Resilience Briefing Report</p>";
        }

        const wordContent = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <title>Cypher Vantage AI Operational Resilience Report</title>
            <!--[if gte mso 9]>
            <xml>
              <w:WordDocument>
                <w:View>Print</w:View>
                <w:Zoom>100</w:Zoom>
              </w:WordDocument>
            </xml>
            <![endif]-->
            <style>
              body, h1, h2, h3, h4, h5, h6, p, span, div, strong, table, tr, td, th, a {
                font-family: 'Figtree', 'Inter', 'Arial', sans-serif !important;
              }
              body { line-height: 1.6; color: #333333; padding: 40px; }
              h3 { color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 8px; font-size: 20px; }
              .meta { background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 13px; margin-bottom: 20px; border-left: 4px solid #06b6d4; }
              .briefing-section { border-left: 3px solid #06b6d4; padding-left: 12px; margin-bottom: 20px; }
              .citation-tag { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 2px 6px; font-size: 11px; border-radius: 3px; margin-right: 5px; color: #475569; display: inline-block; }
            </style>
          </head>
          <body>
            <h2>Cypher Vantage - AI Operational Resilience Report</h2>
            <div class="meta">
              <strong>Export Format:</strong> Microsoft Word (DOC)<br/>
              <strong>Generated on:</strong> ${new Date().toLocaleDateString('en-GB')}<br/>
              <strong>Tab Mode:</strong> ${activeBriefingSchedule.toUpperCase()}<br/>
              <strong>Entity:</strong> Cypher Vantage Core Platform (DORA Major ICT Service Provider)
            </div>
            ${reportHtml}
          </body>
          </html>
        `;

        const blob = new Blob(['\ufeff' + wordContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cv_resilience_briefing_${activeBriefingSchedule}_${Math.floor(Date.now()/100000)}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showModal(`Exporting Report`, `<div style="font-size:0.75rem;">Exporting report as <b>DOC</b> format...<br/><br/>[SUCCESS] Report dossier has been compiled and saved locally as Word Document.</div>`);
      }
    };
  });
}

function showScannerDetailsModal(capIndex) {
  let title = '';
  let content = '';

  switch (capIndex) {
    case '1':
      title = '🔍 Emerging Concerns Scanner Details';
      content = `
        <div style="font-size:0.75rem; line-height:1.5; display:flex; flex-direction:column; gap:8px;">
          <p>Continuous monitoring of global Threat Feeds, security bulletins, and internal performance anomalies.</p>
          <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:4px; border:1px solid rgba(255,255,255,0.05); color:var(--text-secondary);">
            <b>Active Telemetry:</b>
            <ul style="margin:5px 0 0 15px; padding:0;">
              <li>Warning detected under DORA Article 11 (Emerging risk on payments replication lag).</li>
              <li>Network traffic anomalies: Normal.</li>
              <li>Authentication anomalies: 0 incidents.</li>
            </ul>
          </div>
          <div style="color:var(--text-primary);"><b>Trigger Rule:</b> Replication latency threshold exceeded (280ms vs 200ms baseline).</div>
        </div>
      `;
      break;
    case '2':
      title = '⛓️ Supplier Concentration Scanner Details';
      content = `
        <div style="font-size:0.75rem; line-height:1.5; display:flex; flex-direction:column; gap:8px;">
          <p>Audits multi-vendor service dependencies to detect single points of failure across SaaS, cloud hosting, and consulting layers.</p>
          <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:4px; border:1px solid rgba(255,255,255,0.05); color:var(--text-secondary);">
            <b>Active Concentration Hotspot:</b>
            <ul style="margin:5px 0 0 15px; padding:0;">
              <li><b>Cloudflare Overlap:</b> Shared by AWS infrastructure and Customer CRM databases.</li>
              <li>DORA compliance exposure under third-party risk strategy (DORA Article 28-30).</li>
            </ul>
          </div>
        </div>
      `;
      break;
    case '3':
      title = '🧪 Test Recommendations Scanner Details';
      content = `
        <div style="font-size:0.75rem; line-height:1.5; display:flex; flex-direction:column; gap:8px;">
          <p>Proposes target scenario simulations, stress tests, and tabletop exercises to address weaknesses found in live telemetry.</p>
          <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:4px; border:1px solid rgba(255,255,255,0.05); color:var(--text-secondary);">
            <b>Proposed Exercises:</b>
            <ul style="margin:5px 0 0 15px; padding:0;">
              <li>Multi-region database failover simulation under active client transaction routing.</li>
              <li>Verification of RTO recovery speed against 4-hour tolerance limits.</li>
            </ul>
          </div>
        </div>
      `;
      break;
    case '4':
      title = '⚙️ Remediation Priorities Scanner Details';
      content = `
        <div style="font-size:0.75rem; line-height:1.5; display:flex; flex-direction:column; gap:8px;">
          <p>Ranks compliance findings, audit failures, and control gaps by operational impact and statutory urgency.</p>
          <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:4px; border:1px solid rgba(255,255,255,0.05); color:var(--text-secondary);">
            <b>Pending Items:</b>
            <ul style="margin:5px 0 0 15px; padding:0;">
              <li>2 Overdue Remediation Plans (SLA exceeded).</li>
              <li>Immediate Target: Deploy DNS Failover Safeguards for Clearing Portal.</li>
            </ul>
          </div>
        </div>
      `;
      break;
    case '5':
      title = '📊 Degradation Predictor Scanner Details';
      content = `
        <div style="font-size:0.75rem; line-height:1.5; display:flex; flex-direction:column; gap:8px;">
          <p>Applies predictive models to log streaming data to identify slow resilience degradation before breaches occur.</p>
          <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:4px; border:1px solid rgba(255,255,255,0.05); color:var(--text-secondary);">
            <b>Predictive Telemetry:</b>
            <ul style="margin:5px 0 0 15px; padding:0;">
              <li>92% baseline resilience performance.</li>
              <li>Replication latency trend is currently upward (+15% week-over-week).</li>
            </ul>
          </div>
        </div>
      `;
      break;
    case '6':
      title = '🛡️ Missing Controls Scanner Details';
      content = `
        <div style="font-size:0.75rem; line-height:1.5; display:flex; flex-direction:column; gap:8px;">
          <p>Compares DORA requirement mappings directly to active control frameworks to surface missing audit ledgers.</p>
          <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:4px; border:1px solid rgba(255,255,255,0.05); color:var(--text-secondary);">
            <b>Active Gaps Found:</b>
            <ul style="margin:5px 0 0 15px; padding:0;">
              <li>Compliance gap: Missing vendor NDAs under DORA Article 14.</li>
            </ul>
          </div>
        </div>
      `;
      break;
    case '7':
      title = '📈 Tolerance Monitor Scanner Details';
      content = `
        <div style="font-size:0.75rem; line-height:1.5; display:flex; flex-direction:column; gap:8px;">
          <p>Calculates the recovery performance of Important Business Services against statutory and board-mandated RTO thresholds.</p>
          <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:4px; border:1px solid rgba(255,255,255,0.05); color:var(--text-secondary);">
            <b>Critical Service Status:</b>
            <ul style="margin:5px 0 0 15px; padding:0;">
              <li>IBS Payments Processing (RTO SLA breach: +165 minutes predicted).</li>
              <li>IBS Clearing Portal (RTO SLA breach: +135 minutes predicted).</li>
            </ul>
          </div>
        </div>
      `;
      break;
    case '8':
      title = '🏛️ Board Briefing Engine Details';
      content = `
        <div style="font-size:0.75rem; line-height:1.5; display:flex; flex-direction:column; gap:8px;">
          <p>Compiles daily, weekly, and monthly reports detailing operational risk indexes for executive advisory board meetings.</p>
          <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:4px; border:1px solid rgba(255,255,255,0.05); color:var(--text-secondary);">
            <b>Active Outputs:</b>
            <ul style="margin:5px 0 0 15px; padding:0;">
              <li>Daily briefings (Continuous generation).</li>
              <li>Weekly operational digests.</li>
              <li>Monthly executive briefings.</li>
            </ul>
          </div>
        </div>
      `;
      break;
  }

  showModal(title, content);
}

function processChatbotQuery(query) {
  chatHistory.push({ sender: 'user', text: query });
  
  const val = query.toLowerCase();
  let reply = '';
  
  if (val.includes('tolerance') || val.includes('exceed') || val.includes('sla')) {
    reply = "Based on active simulations, IBS Payments Processing exceeds its target 4-hour RTO by 165 minutes. View the Tolerance Monitor scanner or Monthly Board Briefing for complete details.";
  } else if (val.includes('supplier') || val.includes('concentration') || val.includes('overlap')) {
    reply = "Systemic overlap identified for Cloudflare edge routing, shared by both core ledger and customer CRM databases. Check the Supplier Concentration scanner for complete logs.";
  } else if (val.includes('gap') || val.includes('dora') || val.includes('missing') || val.includes('control')) {
    reply = "We have detected 1 active DORA Article 14 gap: general subcontractor vendor NDAs are missing validation signatures. See the Missing Controls scanner.";
  } else if (val.includes('test') || val.includes('recommend') || val.includes('drill')) {
    reply = "Recommended tests: Multi-region failover drill for critical customer vaults. See the Test Recommendations scanner.";
  } else if (val.includes('degradation') || val.includes('latency') || val.includes('lag')) {
    reply = "Database synchronization latency is elevated at 280ms, approaching the warning threshold. See the Degradation Predictor scanner.";
  } else {
    reply = "I've analyzed the resilience ledger. You can inspect the active scanners above or check the daily/weekly/monthly board briefings for structured recommendations.";
  }
  
  chatHistory.push({ sender: 'analyst', text: reply });
}

function renderDossierReport(state, schedule) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (schedule === 'daily') {
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
        <span style="font-size:0.56rem; font-family:monospace; color:var(--text-muted);">REF: CV-DAILY-BRIEF-${Math.floor(Date.now()/100000)}</span>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:0.6rem; color:var(--text-muted); font-family:monospace;">GENERATED: ${timestamp} UTC</span>
          <div style="display:flex; gap:4px;">
            <button class="briefing-export-btn btn btn-secondary btn-xs" data-type="pdf" style="font-size:0.55rem; padding: 2px 6px; display:flex; align-items:center; gap:3px; background: rgba(6,182,212,0.06); border-color: rgba(6,182,212,0.15); color: var(--color-cyan);">📄 PDF</button>
            <button class="briefing-export-btn btn btn-secondary btn-xs" data-type="doc" style="font-size:0.55rem; padding: 2px 6px; display:flex; align-items:center; gap:3px; background: rgba(139,92,246,0.06); border-color: rgba(139,92,246,0.15); color: #a78bfa;">📝 DOC</button>
          </div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:16px;">
        <div>
          <h3 style="font-size:0.9rem; font-family:var(--font-headings); font-weight:800; color:var(--text-primary); margin:12px 0 0 0;">
            Daily Operational Resilience Analyst Briefing
          </h3>
          <p style="font-size:0.7rem; color:var(--text-muted); margin:3px 0 12px 0;">Proactive diagnostic brief generated for risk committee members.</p>
        </div>

        <!-- Recommendation 1 -->
        <div class="briefing-section">
          <strong style="font-size:0.75rem; color:#ef4444; display:block;">⚠️ 1. Emerging Payments Replication Degradation Concerns</strong>
          <p style="font-size:0.7rem; line-height:1.45; color:var(--text-secondary); margin:4px 0 6px 0;">
            A latency spike of <b>280ms</b> has been identified on payments processing database synchronization tunnels. If unchecked, this replication lag is predicted to trigger a failover sync error, resulting in service degradation during peak business hours.
          </p>
          <div style="display:flex; flex-wrap:wrap; gap:4px;">
            <span class="citation-tag" data-type="evidence" data-id="ev-001">📊 Evidence: Replication Latency 280ms</span>
            <span class="citation-tag" data-type="service" data-id="srv-001">🏢 Impacted: IBS Payments Processing</span>
            <span class="citation-tag" data-type="incident" data-id="inc-001">🚨 Incident: Oregon Data Center Outage</span>
            <span class="citation-tag" data-type="control" data-id="ctl-002">🛡️ Control: ctl-002 Backup Controls</span>
          </div>
        </div>

        <!-- Recommendation 2 -->
        <div class="briefing-section">
          <strong style="font-size:0.75rem; color:#f59e0b; display:block;">🛡️ 2. Missing Control Audits for Third-Party Gateways</strong>
          <p style="font-size:0.7rem; line-height:1.45; color:var(--text-secondary); margin:4px 0 6px 0;">
            The active database scan shows no security certificate checks mapped to external supplier nodes. This is an active compliance gap under DORA Article 14 subcontracting policies.
          </p>
          <div style="display:flex; flex-wrap:wrap; gap:4px;">
            <span class="citation-tag" data-type="evidence" data-id="ev-004">📜 Evidence: Missing Vendor NDAs</span>
            <span class="citation-tag" data-type="service" data-id="srv-004">🏢 Impacted: IBS Clearing Portal</span>
            <span class="citation-tag" data-type="incident" data-id="inc-002">🚨 Incident: Cloudflare API throttling</span>
            <span class="citation-tag" data-type="control" data-id="ctl-001">🛡️ Control: ctl-001 MFA Policy</span>
          </div>
        </div>
      </div>
    `;
  }

  if (schedule === 'weekly') {
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
        <span style="font-size:0.56rem; font-family:monospace; color:var(--text-muted);">REF: CV-WEEKLY-ANALYST-${Math.floor(Date.now()/100000)}</span>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:0.6rem; color:var(--text-muted); font-family:monospace;">GENERATED: ${timestamp} UTC</span>
          <div style="display:flex; gap:4px;">
            <button class="briefing-export-btn btn btn-secondary btn-xs" data-type="pdf" style="font-size:0.55rem; padding: 2px 6px; display:flex; align-items:center; gap:3px; background: rgba(6,182,212,0.06); border-color: rgba(6,182,212,0.15); color: var(--color-cyan);">📄 PDF</button>
            <button class="briefing-export-btn btn btn-secondary btn-xs" data-type="doc" style="font-size:0.55rem; padding: 2px 6px; display:flex; align-items:center; gap:3px; background: rgba(139,92,246,0.06); border-color: rgba(139,92,246,0.15); color: #a78bfa;">📝 DOC</button>
          </div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:16px;">
        <div>
          <h3 style="font-size:0.9rem; font-family:var(--font-headings); font-weight:800; color:var(--text-primary); margin:12px 0 0 0;">
            Weekly Resilience Analysis Report
          </h3>
          <p style="font-size:0.7rem; color:var(--text-muted); margin:3px 0 12px 0;">Proactive week-over-week risk aggregates and testing recommendations.</p>
        </div>

        <!-- Recommendation 1 -->
        <div class="briefing-section">
          <strong style="font-size:0.75rem; color:#f97316; display:block;">⛓️ 1. Supplier Concentration Overlap Risk</strong>
          <p style="font-size:0.7rem; line-height:1.45; color:var(--text-secondary); margin:4px 0 6px 0;">
            Analysis of supplier exit plans shows a concurrent Tier-1 dependency on Cloudflare edge hosting for both AWS infrastructure and secondary customer CRM databases, representing a systemic concentration hotspot.
          </p>
          <div style="display:flex; flex-wrap:wrap; gap:4px;">
            <span class="citation-tag" data-type="evidence" data-id="ev-002">📜 Evidence: AWS DR Test Logs</span>
            <span class="citation-tag" data-type="service" data-id="srv-003">🏢 Impacted: IBS Core Banking Ledger</span>
            <span class="citation-tag" data-type="incident" data-id="inc-002">🚨 Incident: Cloudflare API throttling</span>
            <span class="citation-tag" data-type="control" data-id="ctl-001">🛡️ Control: ctl-001 Identity Controls</span>
          </div>
        </div>

        <!-- Recommendation 2 -->
        <div class="briefing-section">
          <strong style="font-size:0.75rem; color:#06b6d4; display:block;">🧪 2. Recommended Scenario Failover Testing</strong>
          <p style="font-size:0.7rem; line-height:1.45; color:var(--text-secondary); margin:4px 0 6px 0;">
            We recommend conducting a multi-region failover drill for critical customer ledger vaults to verify RTO tolerances following recent staging patches.
          </p>
          <div style="display:flex; flex-wrap:wrap; gap:4px;">
            <span class="citation-tag" data-type="evidence" data-id="ev-003">📊 Evidence: Automated Drills Suite</span>
            <span class="citation-tag" data-type="service" data-id="srv-001">🏢 Impacted: IBS Payments Processing</span>
            <span class="citation-tag" data-type="incident" data-id="inc-001">🚨 Incident: Oregon Data Center Outage</span>
            <span class="citation-tag" data-type="control" data-id="ctl-002">🛡️ Control: ctl-002 Failover Baseline</span>
          </div>
        </div>
      </div>
    `;
  }

  // Monthly Board Briefing
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
      <span style="font-size:0.56rem; font-family:monospace; color:var(--text-muted);">REF: CV-BOARD-MONTHLY-${Math.floor(Date.now()/100000)}</span>
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:0.6rem; color:var(--text-muted); font-family:monospace;">GENERATED: ${timestamp} UTC</span>
        <div style="display:flex; gap:4px;">
          <button class="briefing-export-btn btn btn-secondary btn-xs" data-type="pdf" style="font-size:0.55rem; padding: 2px 6px; display:flex; align-items:center; gap:3px; background: rgba(6,182,212,0.06); border-color: rgba(6,182,212,0.15); color: var(--color-cyan);">📄 PDF</button>
          <button class="briefing-export-btn btn btn-secondary btn-xs" data-type="doc" style="font-size:0.55rem; padding: 2px 6px; display:flex; align-items:center; gap:3px; background: rgba(139,92,246,0.06); border-color: rgba(139,92,246,0.15); color: #a78bfa;">📝 DOC</button>
        </div>
      </div>
    </div>

    <div style="display:flex; flex-direction:column; gap:16px;">
      <div>
        <h3 style="font-size:0.9rem; font-family:var(--font-headings); font-weight:800; color:var(--text-primary); margin:12px 0 0 0;">
          Monthly Executive Board Resilience Briefing
        </h3>
        <p style="font-size:0.7rem; color:var(--text-muted); margin:3px 0 12px 0;">Board-level strategic advisory dossier mapped to PRA SS2/21 and DORA pillars.</p>
      </div>

      <!-- Recommendation 1 -->
      <div class="briefing-section">
        <strong style="font-size:0.75rem; color:#ef4444; display:block;">📈 1. Impact Tolerance Breach Alert for Payments Processing</strong>
        <p style="font-size:0.7rem; line-height:1.45; color:var(--text-secondary); margin:4px 0 6px 0;">
          Simulated ransomware drills indicate that the database restoration timeline for customer payment processing exceeds the board-mandated 4-hour RTO limit by 165 minutes.
        </p>
        <div style="display:flex; flex-wrap:wrap; gap:4px;">
          <span class="citation-tag" data-type="evidence" data-id="ev-001">📊 Evidence: Disaster Recovery Test logs</span>
          <span class="citation-tag" data-type="service" data-id="srv-001">🏢 Impacted: IBS Payments Processing</span>
          <span class="citation-tag" data-type="incident" data-id="inc-001">🚨 Incident: Oregon Data Center Outage</span>
          <span class="citation-tag" data-type="control" data-id="ctl-002">🛡️ Control: ctl-002 Backup SLA</span>
        </div>
      </div>

      <!-- Recommendation 2 -->
      <div class="briefing-section">
        <strong style="font-size:0.75rem; color:#06b6d4; display:block;">⚙️ 2. Remediation Priority: Deploy DNS Failover Safeguards</strong>
        <p style="font-size:0.7rem; line-height:1.45; color:var(--text-secondary); margin:4px 0 6px 0;">
          Deploy secondary multi-region load balancers immediately to resolve single-point edge failures and keep the platform within SS2/21 resilience boundaries.
        </p>
        <div style="display:flex; flex-wrap:wrap; gap:4px;">
          <span class="citation-tag" data-type="evidence" data-id="ev-002">📜 Evidence: AWS DR Test logs</span>
          <span class="citation-tag" data-type="service" data-id="srv-003">🏢 Impacted: IBS Core Banking Ledger</span>
          <span class="citation-tag" data-type="incident" data-id="inc-002">🚨 Incident: Cloudflare API throttling</span>
          <span class="citation-tag" data-type="control" data-id="ctl-001">🛡️ Control: ctl-001 Active MFA</span>
        </div>
      </div>
    </div>
  `;
}

function renderSidebarFolder(state, schedule) {
  if (schedule === 'daily') {
    return `
      <!-- Insight 1 -->
      <div style="background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.04); padding: 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 0.7rem; color: #ef4444;">Emerging Concern</strong>
          <span style="font-size: 0.58rem; color: var(--text-muted);">Priority: High</span>
        </div>
        <p style="font-size: 0.65rem; color: var(--text-secondary); margin: 0; line-height: 1.35;">
          DB Replication lag has reached 280ms, approaching SLA threshold boundaries.
        </p>
      </div>

      <!-- Insight 2 -->
      <div style="background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.04); padding: 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 0.7rem; color: #f59e0b;">Missing Control Gaps</strong>
          <span style="font-size: 0.58rem; color: var(--text-muted);">Priority: Med</span>
        </div>
        <p style="font-size: 0.65rem; color: var(--text-secondary); margin: 0; line-height: 1.35;">
          Audit confirms general subcontractor vendor NDA registry lacks valid coverage logs.
        </p>
      </div>
    `;
  }

  if (schedule === 'weekly') {
    return `
      <!-- Insight 1 -->
      <div style="background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.04); padding: 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 0.7rem; color: #f97316;">Concentration Alert</strong>
          <span style="font-size: 0.58rem; color: var(--text-muted);">Priority: High</span>
        </div>
        <p style="font-size: 0.65rem; color: var(--text-secondary); margin: 0; line-height: 1.35;">
          Edge routing dependencies overlaps identified for Cloudflare endpoints.
        </p>
      </div>

      <!-- Insight 2 -->
      <div style="background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.04); padding: 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 0.7rem; color: #06b6d4;">Testing Pipeline</strong>
          <span style="font-size: 0.58rem; color: var(--text-muted);">Priority: Low</span>
        </div>
        <p style="font-size: 0.65rem; color: var(--text-secondary); margin: 0; line-height: 1.35;">
          Recommended scenario tests: customer ledger multi-region failover.
        </p>
      </div>
    `;
  }

  // Monthly Insights
  return `
    <!-- Insight 1 -->
    <div style="background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.04); padding: 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 4px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong style="font-size: 0.7rem; color: #ef4444;">Tolerance Breach Risk</strong>
        <span style="font-size: 0.58rem; color: var(--text-muted);">Priority: High</span>
      </div>
      <p style="font-size: 0.65rem; color: var(--text-secondary); margin: 0; line-height: 1.35;">
        RTO timelines for core customer transaction restore violate 4-hour RTO limits.
      </p>
    </div>

    <!-- Insight 2 -->
    <div style="background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.04); padding: 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 4px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong style="font-size: 0.7rem; color: #06b6d4;">Remediation Target</strong>
        <span style="font-size: 0.58rem; color: var(--text-muted);">Priority: High</span>
      </div>
      <p style="font-size: 0.65rem; color: var(--text-secondary); margin: 0; line-height: 1.35;">
        Deploy active multi-cloud DNS routing mechanisms to secure edge failures.
      </p>
    </div>
  `;
}

function inspectCitationItem(type, id) {
  const state = getState();
  let detailsHtml = '';

  if (type === 'service') {
    const s = state.services.find(item => item.id === id) || { id, name: 'General Payments Hub', status: 'Active', criticality: 'Tier-1', rto: '4 Hours', rpo: '2 Hours', owner: 'Operations Center' };
    detailsHtml = `
      <div style="font-size:0.75rem; line-height:1.5; display:flex; flex-direction:column; gap:6px;">
        <div><b>Service Name:</b> ${s.name}</div>
        <div><b>Service ID:</b> ${s.id}</div>
        <div><b>Operational Criticality:</b> ${s.criticality}</div>
        <div><b>Impact Tolerance Limits:</b> RTO ${s.rto} / RPO ${s.rpo}</div>
        <div><b>System Owner:</b> ${s.owner}</div>
      </div>
    `;
    showModal('Cited Service Parameters', detailsHtml);
  } else if (type === 'control') {
    const c = state.controls.find(item => item.id === id) || { id, title: 'Disaster Recovery Failover Control', status: 'Met', description: 'Administrative baselines to monitor infrastructure sync cycles.' };
    detailsHtml = `
      <div style="font-size:0.75rem; line-height:1.5; display:flex; flex-direction:column; gap:6px;">
        <div><b>Control Title:</b> ${c.title}</div>
        <div><b>Control ID:</b> ${c.id}</div>
        <div><b>Audit Baseline Status:</b> ${c.status}</div>
        <div><b>Description:</b> ${c.description}</div>
      </div>
    `;
    showModal('Cited Audit Control Parameters', detailsHtml);
  } else if (type === 'evidence') {
    const e = state.evidence.find(item => item.id === id) || { id, name: 'AWS_DR_Verification_Logs_2026.pdf', status: 'Valid', uploadedDate: '2026-06-20', fileHash: 'd57849e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b78' };
    detailsHtml = `
      <div style="font-size:0.75rem; line-height:1.5; display:flex; flex-direction:column; gap:6px;">
        <div><b>Evidence File Name:</b> 📂 ${e.name}</div>
        <div><b>Evidence ID:</b> ${e.id}</div>
        <div><b>Verification Integrity Status:</b> ${e.status}</div>
        <div><b>Audit Upload Time:</b> ${e.uploadedDate}</div>
        <div style="background:#070a12; padding:6px; border-radius:4px; font-family:monospace; font-size:0.62rem; color:var(--text-muted);">
          Ledger SHA-256 Hash: <b style="color:var(--text-primary);">${e.fileHash}</b>
        </div>
      </div>
    `;
    showModal('Cited Cryptographic Evidence parameters', detailsHtml);
  } else if (type === 'incident') {
    const i = state.incidents.find(item => item.id === id) || { id, title: 'Oregon Data Center Network Throttling', status: 'Closed', classification: 'Hardware Outage', downtime: '45 Minutes', financialLoss: 120000, rootCause: 'Fibre routing sync failures.' };
    detailsHtml = `
      <div style="font-size:0.75rem; line-height:1.5; display:flex; flex-direction:column; gap:6px;">
        <div><b>Incident Title:</b> ${i.title}</div>
        <div><b>Incident ID:</b> ${i.id}</div>
        <div><b>Resolution Status:</b> ${i.status}</div>
        <div><b>Outage Downtime:</b> ${i.downtime}</div>
        <div><b>Financial Impact Exposure:</b> £${i.financialLoss.toLocaleString()}</div>
        <div><b>Root Cause Analysis:</b> ${i.rootCause}</div>
      </div>
    `;
    showModal('Cited Incident Metrics', detailsHtml);
  }
}
