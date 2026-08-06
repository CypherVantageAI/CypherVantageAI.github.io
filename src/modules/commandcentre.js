// ==========================================================================
// Cypher Vantage - Resilience Command Centre Module (ES6 Module)
// ==========================================================================

import { getState } from '../core/db.js';

let activeQueryId = 'aws-outage'; // Default active question
let customQueryText = '';
let isCustomQueryActive = false;
let parsedCustomQueryData = null;

export function renderCommandCentre() {
  const container = document.getElementById('view-manager-command-centre');
  if (!container) return;

  container.innerHTML = '';
  container.style.cssText = 'flex-direction: column; gap: 20px; width: 100%;';

  // 1. Header Bar
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 10px;';
  header.innerHTML = `
    <div>
      <h2 style="margin: 0; font-size: 1.15rem; color: var(--text-primary); font-weight: 800; display: flex; align-items: center; gap: 8px;">
        ⚡ Resilience Command Centre
      </h2>
      <p style="margin: 4px 0 0 0; font-size: 0.7rem; color: var(--text-secondary);">
        Interactive operational resilience twin and automated blast-radius impact simulator.
      </p>
    </div>
    <div style="font-size: 0.65rem; color: var(--text-muted); background: rgba(6, 182, 212, 0.08); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(6, 182, 212, 0.15); font-weight: 700; text-transform: uppercase;">
      🛡️ DORA Art. 11/14 Assurance Twin
    </div>
  `;
  container.appendChild(header);

  // 2. Main Twin Columns Layout
  const mainGrid = document.createElement('div');
  mainGrid.style.cssText = 'display: grid; grid-template-columns: 300px 1fr; gap: 20px; width: 100%; align-items: start;';
  container.appendChild(mainGrid);

  // 3. Left Column: Interactive Scenario Queries & Custom Prompt
  const leftPanel = document.createElement('div');
  leftPanel.className = 'dashboard-card';
  leftPanel.style.cssText = 'padding: 15px; display: flex; flex-direction: column; gap: 12px; margin: 0; min-height: 600px;';
  leftPanel.innerHTML = `
    <h3 style="font-size: 0.76rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin: 0 0 8px 0; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
      Interactive Prompts
    </h3>
    <div style="display: flex; flex-direction: column; gap: 6px;" id="command-presets-container">
      <!-- Preset buttons loaded dynamically -->
    </div>

    <!-- Custom Prompt Box -->
    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px;">
      <h3 style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin: 0;">
        Ask Custom Question
      </h3>
      <textarea id="custom-prompt-input" placeholder="Type a custom scenario (e.g. 'What breaks if GCP fails?' or 'Analyze oracle database outage')..." style="width: 100%; height: 65px; font-size: 0.68rem; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: var(--text-primary); resize: none; font-family: var(--font-body); line-height: 1.4;"></textarea>
      <button class="btn btn-primary btn-sm" id="btn-submit-custom-prompt" style="font-size: 0.68rem; justify-content: center; width: 100%;">
        🤖 Simulate Outage
      </button>
    </div>
    
    <div style="margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border-color); font-size: 0.62rem; color: var(--text-muted); line-height: 1.45;">
      <div style="font-weight: 700; margin-bottom: 2px; color: var(--text-secondary);">PROACTIVE TELEMETRY</div>
      Enter customized queries to analyze blast-radius models across multi-cloud regions, databases, and third-party supplier nodes.
    </div>
  `;
  mainGrid.appendChild(leftPanel);

  // 4. Right Column: Telemetry & Twin Views Pane
  const rightPanel = document.createElement('div');
  rightPanel.style.cssText = 'display: flex; flex-direction: column; gap: 20px;';
  mainGrid.appendChild(rightPanel);

  // Populate preset list
  const presets = [
    { id: 'aws-outage', icon: '☁️', label: 'What breaks if AWS fails?' },
    { id: 'supplier-failure', icon: '🏢', label: 'What breaks if Supplier X fails?' },
    { id: 'tolerance-breach', icon: '⏳', label: 'Which services exceed tolerance?' },
    { id: 'concentration-risk', icon: '📊', label: 'Which suppliers create concentration risk?' },
    { id: 'lacking-testing', icon: '🧪', label: 'Which critical services lack testing?' },
    { id: 'ransomware-outbreak', icon: '💀', label: 'What happens during a Ransomware outbreak?' },
    { id: 'oracle-db-failure', icon: '🛢️', label: 'What breaks if Oracle DB fails?' },
    { id: 'third-party-api', icon: '🔗', label: 'How does 3rd party API failure affect Retail?' }
  ];

  const presetsContainer = leftPanel.querySelector('#command-presets-container');
  presets.forEach(p => {
    const btn = document.createElement('button');
    const isActive = !isCustomQueryActive && activeQueryId === p.id;
    btn.className = `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`;
    btn.style.cssText = 'width: 100%; justify-content: flex-start; text-align: left; font-size: 0.7rem; padding: 8px 10px; display: flex; align-items: center; gap: 8px; font-family: var(--font-body); font-weight: 600; transition: all 0.15s; margin-bottom: 2px;';
    btn.innerHTML = `<span style="font-size:0.85rem;">${p.icon}</span> <span>${p.label}</span>`;
    btn.onclick = () => {
      isCustomQueryActive = false;
      activeQueryId = p.id;
      renderCommandCentre();
    };
    presetsContainer.appendChild(btn);
  });

  // Bind custom prompt triggers
  const textInput = leftPanel.querySelector('#custom-prompt-input');
  textInput.value = customQueryText;
  textInput.oninput = (e) => {
    customQueryText = e.target.value;
  };

  const submitBtn = leftPanel.querySelector('#btn-submit-custom-prompt');
  submitBtn.onclick = () => {
    if (!customQueryText.trim()) return;
    processCustomQuery(customQueryText);
  };

  // Render Response Content
  if (isCustomQueryActive && parsedCustomQueryData) {
    rightPanel.innerHTML = renderCustomQueryResponse(parsedCustomQueryData);
  } else {
    renderQueryResponse(rightPanel, activeQueryId);
  }
}

// Custom Query Parser & Mock Engine
function processCustomQuery(query) {
  const qLower = query.toLowerCase();
  isCustomQueryActive = true;
  
  let matchKey = 'custom-simulation';
  let matchedIcon = '🤖';
  let title = 'Custom Simulated Scenario';
  let affectedServices = 'Multiple Services';
  let recoveryTime = '8.5 Hours';
  let alertText = '⚠️ Exceeds SLA Limits';
  let doraArticles = 'Article 11 & Article 14 affected';
  
  if (qLower.includes('aws') || qLower.includes('amazon')) {
    matchKey = 'aws';
    title = 'Simulated AWS Infrastructure Outage';
    affectedServices = 'Digital Banking & Wholesale Clearing';
    recoveryTime = '14.5 Hours';
    alertText = '⚠️ Exceeds RTO target of 4.0h';
    doraArticles = 'Article 11 (DR Failovers) & Article 24 (Resilience testing)';
    matchedIcon = '☁️';
  } else if (qLower.includes('gcp') || qLower.includes('google')) {
    matchKey = 'gcp';
    title = 'Simulated GCP Region Outage';
    affectedServices = 'Retail Cards Gateway & Merchant portal';
    recoveryTime = '9.2 Hours';
    alertText = '⚠️ Exceeds card processing SLA';
    doraArticles = 'Article 11 (ICT Systems) & Article 14 (BCP plans)';
    matchedIcon = '🌩️';
  } else if (qLower.includes('oracle') || qLower.includes('database') || qLower.includes('db')) {
    matchKey = 'oracle';
    title = 'Oracle Database Core Cluster Outage';
    affectedServices = 'Wholesale Clearing & Settlement';
    recoveryTime = '18.0 Hours';
    alertText = '⚠️ Core clearing system offline';
    doraArticles = 'Article 11 (Data integrity backups) & Article 17';
    matchedIcon = '🛢️';
  } else if (qLower.includes('ransomware') || qLower.includes('malware') || qLower.includes('cyber')) {
    matchKey = 'ransomware';
    title = 'Ransomware Cyber Attack Scenario';
    affectedServices = 'Digital Banking Portal & Identity directories';
    recoveryTime = '22.0 Hours';
    alertText = '⚠️ Security recovery path triggered';
    doraArticles = 'Article 14 (Emergency communications) & Article 17 (Incident logs)';
    matchedIcon = '💀';
  } else if (qLower.includes('infosys') || qLower.includes('supplier') || qLower.includes('vendor')) {
    matchKey = 'supplier';
    title = 'Supplier Subcontractor Failure';
    affectedServices = 'CIS Identity & Access Directories';
    recoveryTime = '6.0 Hours';
    alertText = '⚠️ Identity failover SLA exceeded';
    doraArticles = 'Article 28 (TPRM Subcontractors) & Article 30';
    matchedIcon = '🏢';
  }

  parsedCustomQueryData = {
    matchKey,
    title,
    affectedServices,
    recoveryTime,
    alertText,
    doraArticles,
    matchedIcon,
    rawQuery: query
  };

  renderCommandCentre();
}

function renderCustomQueryResponse(data) {
  return `
    <div style="display: flex; gap: 15px; flex-wrap: wrap; width: 100%;">
      <div class="dashboard-card" style="flex: 1; min-width: 160px; padding: 12px; margin:0;">
        <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Custom Query Matches</span>
        <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-cyan); margin-top: 4px; word-break: break-all;">"${data.rawQuery}"</div>
      </div>
      <div class="dashboard-card" style="flex: 1; min-width: 160px; padding: 12px; margin:0;">
        <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Simulated Recovery</span>
        <div style="font-size: 1.4rem; font-weight: 800; color: #ef4444; margin-top: 4px;">${data.recoveryTime}</div>
        <span style="font-size: 0.6rem; color: #ef4444; font-weight:700;">${data.alertText}</span>
      </div>
      <div class="dashboard-card" style="flex: 1; min-width: 160px; padding: 12px; margin:0;">
        <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Compliance Status</span>
        <div style="font-size: 1.1rem; font-weight: 800; color: #f59e0b; margin-top: 6px;">Audit Triggered</div>
        <span style="font-size: 0.6rem; color: var(--text-secondary);">${data.doraArticles}</span>
      </div>
    </div>

    <!-- Twin View layout -->
    <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; width: 100%;">
      <div class="dashboard-card" style="padding: 15px; margin: 0; display: flex; flex-direction: column;">
        <h4 style="font-size: 0.74rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 10px 0;">
          Dynamic SVG Outage Impact Graph
        </h4>
        <div style="flex: 1; min-height: 280px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 6px; border: 1px dashed var(--border-color); position: relative; overflow: hidden;">
          <svg width="100%" height="280" viewBox="0 0 450 280">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
              </marker>
              <marker id="arrow-danger" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
              </marker>
            </defs>

            <!-- Links -->
            <line x1="225" y1="230" x2="225" y2="140" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-danger)" stroke-dasharray="4"/>
            <line x1="225" y1="140" x2="225" y2="50" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-danger)"/>

            <!-- Outage Node -->
            <circle cx="225" cy="230" r="28" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="2"/>
            <text x="225" y="233" font-size="20" text-anchor="middle">${data.matchedIcon}</text>
            <text x="225" y="270" font-size="8.5" font-weight="700" fill="#ef4444" text-anchor="middle">${data.title}</text>

            <!-- Affected Gateway App -->
            <rect x="165" y="110" width="120" height="36" rx="4" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" stroke-width="1.5"/>
            <text x="225" y="126" font-size="8" font-weight="700" fill="#ef4444" text-anchor="middle">ICT Application Gateway</text>
            <text x="225" y="137" font-size="7" fill="var(--text-muted)" text-anchor="middle">OUTAGE BREACHED</text>

            <!-- Downstream service -->
            <rect x="155" y="20" width="140" height="36" rx="4" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" stroke-width="2"/>
            <text x="225" y="36" font-size="8" font-weight="800" fill="#ef4444" text-anchor="middle">${data.affectedServices}</text>
            <text x="225" y="47" font-size="7" fill="var(--text-secondary)" text-anchor="middle">SLA IMPACTED</text>
          </svg>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 15px;">
        <div class="dashboard-card" style="padding: 12px; margin: 0;">
          <h4 style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 8px 0;">
            Recovery Time Objectives
          </h4>
          <div style="font-size:0.7rem; color:var(--text-secondary);">
            <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
              <span>Target RTO limit:</span>
              <strong>4.0 Hours</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
              <span>Simulated MTTR:</span>
              <strong style="color:#ef4444;">${data.recoveryTime}</strong>
            </div>
          </div>
        </div>

        <div class="dashboard-card" style="padding: 12px; margin: 0; border-color: rgba(6, 182, 212, 0.25);">
          <h4 style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 8px 0;">
            Recommended Actions
          </h4>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <button class="btn btn-primary btn-xs" style="font-size: 0.65rem;" onclick="if(window.setResilienceActiveTab) window.setResilienceActiveTab('simulation'); window.switchTab('manager-resilience');">
              🔄 Open Scenario Simulation Engine
            </button>
            <button class="btn btn-secondary btn-xs" style="font-size: 0.65rem;" onclick="window.switchTab('manager-dora')">
              📑 Audit DORA Compliance Tracker
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderQueryResponse(target, queryId) {
  let contentHtml = '';

  if (queryId === 'aws-outage') {
    contentHtml = generateAWSOutageResponse();
  } else if (queryId === 'supplier-failure') {
    contentHtml = generateSupplierFailureResponse();
  } else if (queryId === 'tolerance-breach') {
    contentHtml = generateToleranceBreachesResponse();
  } else if (queryId === 'concentration-risk') {
    contentHtml = generateConcentrationRiskResponse();
  } else if (queryId === 'lacking-testing') {
    contentHtml = generateLackingTestingResponse();
  } else if (queryId === 'ransomware-outbreak') {
    contentHtml = generateRansomwareOutbreakResponse();
  } else if (queryId === 'oracle-db-failure') {
    contentHtml = generateOracleFailureResponse();
  } else if (queryId === 'third-party-api') {
    contentHtml = generateThirdPartyAPIResponse();
  }

  target.innerHTML = contentHtml;
}

// Existing responses
function generateAWSOutageResponse() {
  return `
    <div style="display: flex; gap: 15px; flex-wrap: wrap; width: 100%;">
      <div class="dashboard-card" style="flex: 1; min-width: 160px; padding: 12px; margin:0;">
        <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Affected Services</span>
        <div style="font-size: 1.4rem; font-weight: 800; color: #ef4444; margin-top: 4px;">2 Services</div>
        <span style="font-size: 0.6rem; color: var(--text-secondary);">Digital Banking & Wholesale Clearing</span>
      </div>
      <div class="dashboard-card" style="flex: 1; min-width: 160px; padding: 12px; margin:0;">
        <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Simulated Recovery</span>
        <div style="font-size: 1.4rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">14.5 Hours</div>
        <span style="font-size: 0.6rem; color: #ef4444; font-weight:700;">⚠️ Exceeds RTO Limit (4h)</span>
      </div>
      <div class="dashboard-card" style="flex: 1; min-width: 160px; padding: 12px; margin:0;">
        <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Regulatory Exposure</span>
        <div style="font-size: 1.4rem; font-weight: 800; color: #ef4444; margin-top: 4px;">High</div>
        <span style="font-size: 0.6rem; color: var(--text-secondary);">DORA Articles 11 & 24 triggered</span>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; width: 100%;">
      <div class="dashboard-card" style="padding: 15px; margin: 0; display: flex; flex-direction: column;">
        <h4 style="font-size: 0.74rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 10px 0;">
          SVG Blast Radius Dependency Map
        </h4>
        <div style="flex: 1; min-height: 280px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 6px; border: 1px dashed var(--border-color); position: relative; overflow: hidden;">
          <svg width="100%" height="280" viewBox="0 0 450 280">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
              </marker>
              <marker id="arrow-danger" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
              </marker>
            </defs>

            <line x1="225" y1="240" x2="100" y2="150" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-danger)" stroke-dasharray="4"/>
            <line x1="225" y1="240" x2="350" y2="150" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-danger)" stroke-dasharray="4"/>
            
            <line x1="100" y1="150" x2="80" y2="50" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-danger)"/>
            <line x1="350" y1="150" x2="370" y2="50" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-danger)"/>

            <circle cx="225" cy="240" r="28" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="2"/>
            <text x="225" y="243" font-size="20" text-anchor="middle">☁️</text>
            <text x="225" y="278" font-size="9" font-weight="700" fill="#ef4444" text-anchor="middle">AWS region-1 [FAILURE]</text>

            <rect x="50" y="130" width="100" height="36" rx="4" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" stroke-width="1.5"/>
            <text x="100" y="146" font-size="8" font-weight="700" fill="#ef4444" text-anchor="middle">app-001 (Retail)</text>
            <text x="100" y="157" font-size="7" fill="var(--text-muted)" text-anchor="middle">DEGRADED</text>

            <rect x="300" y="130" width="100" height="36" rx="4" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" stroke-width="1.5"/>
            <text x="350" y="146" font-size="8" font-weight="700" fill="#ef4444" text-anchor="middle">app-002 (Treasury)</text>
            <text x="350" y="157" font-size="7" fill="var(--text-muted)" text-anchor="middle">DEGRADED</text>

            <rect x="30" y="30" width="100" height="36" rx="4" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" stroke-width="2"/>
            <text x="80" y="46" font-size="8" font-weight="800" fill="#ef4444" text-anchor="middle">srv-001 (Digital)</text>
            <text x="80" y="57" font-size="7" fill="var(--text-secondary)" text-anchor="middle">OUTAGE BREACH</text>

            <rect x="320" y="30" width="100" height="36" rx="4" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" stroke-width="2"/>
            <text x="370" y="46" font-size="8" font-weight="800" fill="#ef4444" text-anchor="middle">srv-002 (Wholesale)</text>
            <text x="370" y="57" font-size="7" fill="var(--text-secondary)" text-anchor="middle">OUTAGE BREACH</text>
          </svg>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 15px;">
        <div class="dashboard-card" style="padding: 12px; margin: 0;">
          <h4 style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 8px 0;">
            Recovery Timings
          </h4>
          <div style="font-size:0.7rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:8px;">
            <div>
              <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                <span>Digital Portal Target RTO:</span>
                <strong>4.0 Hours</strong>
              </div>
              <div style="height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden;">
                <div style="width:28%; height:100%; background:var(--color-cyan);"></div>
              </div>
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                <span>Simulated DR Failover RTO:</span>
                <strong style="color:#ef4444;">14.5 Hours</strong>
              </div>
              <div style="height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden;">
                <div style="width:100%; height:100%; background:#ef4444;"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-card" style="padding: 12px; margin: 0;">
          <h4 style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 8px 0;">
            DORA Compliance Gaps
          </h4>
          <ul style="font-size: 0.68rem; color: var(--text-secondary); margin: 0; padding-left: 15px; display: flex; flex-direction: column; gap: 6px;">
            <li><span style="color:#ef4444; font-weight:700;">Article 11 (DR Failovers):</span> Lack of active cross-region synchronization triggers failover delay.</li>
            <li><span style="color:#f59e0b; font-weight:700;">Article 24 (Resilience Drills):</span> Simulated DR exercise was overdue by 124 days.</li>
          </ul>
        </div>

        <div class="dashboard-card" style="padding: 12px; margin: 0; border-color: rgba(6, 182, 212, 0.25);">
          <h4 style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 8px 0;">
            Recommended Defenses
          </h4>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <button class="btn btn-primary btn-xs" style="font-size: 0.65rem;" onclick="if(window.setResilienceActiveTab) window.setResilienceActiveTab('simulation'); window.switchTab('manager-resilience');">
              🔄 Deploy Multi-Region AWS Routing
            </button>
            <button class="btn btn-secondary btn-xs" style="font-size: 0.65rem;" onclick="window.switchTab('manager-risk')">
              🛡️ Audit AWS Control Evidence
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateSupplierFailureResponse() {
  return `
    <div style="display: flex; gap: 15px; flex-wrap: wrap; width: 100%;">
      <div class="dashboard-card" style="flex: 1; min-width: 160px; padding: 12px; margin:0;">
        <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Affected Services</span>
        <div style="font-size: 1.4rem; font-weight: 800; color: #ef4444; margin-top: 4px;">1 Service</div>
        <span style="font-size: 0.6rem; color: var(--text-secondary);">Identity Directory CIS</span>
      </div>
      <div class="dashboard-card" style="flex: 1; min-width: 160px; padding: 12px; margin:0;">
        <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Simulated Recovery</span>
        <div style="font-size: 1.4rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">6.0 Hours</div>
        <span style="font-size: 0.6rem; color: #f59e0b; font-weight:700;">⚠️ SLA Target Exceeded (4h)</span>
      </div>
      <div class="dashboard-card" style="flex: 1; min-width: 160px; padding: 12px; margin:0;">
        <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Regulatory Exposure</span>
        <div style="font-size: 1.4rem; font-weight: 800; color: #eab308; margin-top: 4px;">Medium</div>
        <span style="font-size: 0.6rem; color: var(--text-secondary);">DORA Articles 28 & 30 triggered</span>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; width: 100%;">
      <div class="dashboard-card" style="padding: 15px; margin: 0; display: flex; flex-direction: column;">
        <h4 style="font-size: 0.74rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 10px 0;">
          SVG Blast Radius Dependency Map
        </h4>
        <div style="flex: 1; min-height: 280px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 6px; border: 1px dashed var(--border-color); position: relative; overflow: hidden;">
          <svg width="100%" height="280" viewBox="0 0 450 280">
            <line x1="225" y1="240" x2="225" y2="140" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-danger)" stroke-dasharray="4"/>
            <line x1="225" y1="140" x2="225" y2="50" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-danger)"/>

            <circle cx="225" cy="240" r="28" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" stroke-width="2"/>
            <text x="225" y="243" font-size="20" text-anchor="middle">🏢</text>
            <text x="225" y="278" font-size="9" font-weight="700" fill="#f59e0b" text-anchor="middle">Infosys [OUTAGE OUTCOME]</text>

            <rect x="175" y="110" width="100" height="36" rx="4" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" stroke-width="1.5"/>
            <text x="225" y="126" font-size="8" font-weight="700" fill="#ef4444" text-anchor="middle">app-004 (AD Identity)</text>
            <text x="225" y="137" font-size="7" fill="var(--text-muted)" text-anchor="middle">UNREACHABLE</text>

            <rect x="155" y="20" width="140" height="36" rx="4" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" stroke-width="2"/>
            <text x="225" y="36" font-size="8" font-weight="800" fill="#ef4444" text-anchor="middle">srv-004 (CIS Identity Directories)</text>
            <text x="225" y="47" font-size="7" fill="var(--text-secondary)" text-anchor="middle">PARTIAL COMPLIANCE BREACH</text>
          </svg>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 15px;">
        <div class="dashboard-card" style="padding: 12px; margin: 0;">
          <h4 style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 8px 0;">
            Recovery Timings
          </h4>
          <div style="font-size:0.7rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:8px;">
            <div>
              <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                <span>CIS Identity Target RTO:</span>
                <strong>4.0 Hours</strong>
              </div>
              <div style="height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden;">
                <div style="width:66%; height:100%; background:var(--color-cyan);"></div>
              </div>
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                <span>Simulated Supplier MTTR:</span>
                <strong style="color:#f59e0b;">6.0 Hours</strong>
              </div>
              <div style="height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden;">
                <div style="width:100%; height:100%; background:#f59e0b;"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-card" style="padding: 12px; margin: 0;">
          <h4 style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 8px 0;">
            DORA Compliance Gaps
          </h4>
          <ul style="font-size: 0.68rem; color: var(--text-secondary); margin: 0; padding-left: 15px; display: flex; flex-direction: column; gap: 6px;">
            <li><span style="color:#ef4444; font-weight:700;">Article 28 (TPRM Subcontractors):</span> Lack of exit strategy implementation for Identity components.</li>
          </ul>
        </div>

        <div class="dashboard-card" style="padding: 12px; margin: 0; border-color: rgba(6, 182, 212, 0.25);">
          <h4 style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 8px 0;">
            Recommended Defenses
          </h4>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <button class="btn btn-primary btn-xs" style="font-size: 0.65rem;" onclick="if(window.setThirdPartyActiveTab) window.setThirdPartyActiveTab('exit'); window.switchTab('manager-thirdparty');">
              🏢 Open TPRM Exit Drill Config
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateToleranceBreachesResponse() {
  return `
    <div class="dashboard-card" style="padding: 15px; margin: 0;">
      <h4 style="font-size: 0.76rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 10px 0;">
        Active IBS & CIS Tolerance Breach Register
      </h4>
      <div style="font-size:0.7rem; color:var(--text-secondary);">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.62rem; text-transform: uppercase;">
              <th style="padding: 6px;">Service ID</th>
              <th style="padding: 6px;">Service Name</th>
              <th style="padding: 6px;">Target RTO</th>
              <th style="padding: 6px;">Simulated MTTR</th>
              <th style="padding: 6px;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px dashed var(--border-color);">
              <td style="padding: 8px 6px;"><b>srv-001</b></td>
              <td style="padding: 8px 6px;">Digital Banking Portal</td>
              <td style="padding: 8px 6px;">4.0 Hours</td>
              <td style="padding: 8px 6px; color: #ef4444; font-weight: 700;">14.5 Hours</td>
              <td style="padding: 8px 6px;"><span class="badge badge-danger">EXCEEDED</span></td>
            </tr>
            <tr style="border-bottom: 1px dashed var(--border-color);">
              <td style="padding: 8px 6px;"><b>srv-002</b></td>
              <td style="padding: 8px 6px;">Wholesale Clearing & Settlement</td>
              <td style="padding: 8px 6px;">8.0 Hours</td>
              <td style="padding: 8px 6px; color: #ef4444; font-weight: 700;">18.0 Hours</td>
              <td style="padding: 8px 6px;"><span class="badge badge-danger">EXCEEDED</span></td>
            </tr>
            <tr style="border-bottom: 1px dashed var(--border-color);">
              <td style="padding: 8px 6px;"><b>srv-004</b></td>
              <td style="padding: 8px 6px;">CIS Identity & Access Directories</td>
              <td style="padding: 8px 6px;">4.0 Hours</td>
              <td style="padding: 8px 6px; color: #f59e0b; font-weight: 700;">6.0 Hours</td>
              <td style="padding: 8px 6px;"><span class="badge badge-warning">EXCEEDED</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style="margin-top: 15px; display: flex; gap: 8px;">
        <button class="btn btn-secondary btn-xs" onclick="window.switchTab('manager-navigator')">
          🔍 Open IBS/CIS SLA Monitor
        </button>
      </div>
    </div>
  `;
}

function generateConcentrationRiskResponse() {
  return `
    <div class="dashboard-card" style="padding: 15px; margin: 0;">
      <h4 style="font-size: 0.76rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 10px 0;">
        Supplier Concentration & Single Point of Failure (SPOF) Analysis
      </h4>
      <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.7rem; color: var(--text-secondary);">
        <div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <strong>AWS (Amazon Web Services)</strong>
            <span style="color:#ef4444; font-weight:700;">80% High Concentration</span>
          </div>
          <div style="font-size:0.65rem; color:var(--text-muted); margin-bottom:4px;">Hosts 3 critical core applications: Retail Core, Wholesale Engine, and Settlement DB.</div>
          <div style="height:8px; background:rgba(255,255,255,0.06); border-radius:4px; overflow:hidden;">
            <div style="width:80%; height:100%; background:#ef4444;"></div>
          </div>
        </div>
        <div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <strong>Infosys</strong>
            <span style="color:#f59e0b; font-weight:700;">65% Medium Concentration</span>
          </div>
          <div style="font-size:0.65rem; color:var(--text-muted); margin-bottom:4px;">Manages 2 subcontractor directory systems.</div>
          <div style="height:8px; background:rgba(255,255,255,0.06); border-radius:4px; overflow:hidden;">
            <div style="width:65%; height:100%; background:#f59e0b;"></div>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 15px;">
        <button class="btn btn-secondary btn-xs" onclick="if(window.setThirdPartyActiveTab) window.setThirdPartyActiveTab('concentration'); window.switchTab('manager-thirdparty');">
          🛡️ Open TPRM Concentration Directory
        </button>
      </div>
    </div>
  `;
}

function generateLackingTestingResponse() {
  return `
    <div class="dashboard-card" style="padding: 15px; margin: 0;">
      <h4 style="font-size: 0.76rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 10px 0;">
        Critical Services & Gaps Lacking Active DR/TLPT Testing
      </h4>
      <div style="font-size:0.7rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:10px;">
        <div style="padding: 10px; border-radius: 6px; border: 1px solid rgba(239, 68, 68, 0.15); background: rgba(239, 68, 68, 0.02); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color:var(--text-primary);">CIS Identity & Access Directories (srv-004)</strong>
            <div style="font-size:0.62rem; color:var(--text-muted); margin-top:2px;">No recorded Disaster Recovery drills or active TLPT simulations on database.</div>
          </div>
          <span class="badge badge-danger">TESTING GAP</span>
        </div>
        <div style="padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.01); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>Digital Banking Portal (srv-001)</strong>
            <div style="font-size:0.62rem; color:var(--text-muted); margin-top:2px;">Last tested 92 days ago. Backup directories validated.</div>
          </div>
          <span class="badge badge-success" style="background:rgba(16,185,129,0.15); color:#10b981;">VERIFIED</span>
        </div>
      </div>
      
      <div style="margin-top: 15px;">
        <button class="btn btn-secondary btn-xs" onclick="if(window.setResilienceActiveTab) window.setResilienceActiveTab('simulation'); window.switchTab('manager-resilience');">
          🧪 Open Resilience Scenario Simulator
        </button>
      </div>
    </div>
  `;
}

// New query preset: Ransomware Outbreak
function generateRansomwareOutbreakResponse() {
  return `
    <div style="display: flex; gap: 15px; flex-wrap: wrap; width: 100%;">
      <div class="dashboard-card" style="flex: 1; min-width: 160px; padding: 12px; margin:0;">
        <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Infection Scope</span>
        <div style="font-size: 1.4rem; font-weight: 800; color: #ef4444; margin-top: 4px;">Critical</div>
        <span style="font-size: 0.6rem; color: var(--text-secondary);">Direct Active Directory compromise</span>
      </div>
      <div class="dashboard-card" style="flex: 1; min-width: 160px; padding: 12px; margin:0;">
        <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Recovery Timeline</span>
        <div style="font-size: 1.4rem; font-weight: 800; color: #ef4444; margin-top: 4px;">22.0 Hours</div>
        <span style="font-size: 0.6rem; color: #ef4444; font-weight:700;">⚠️ Massive compliance breach risk</span>
      </div>
      <div class="dashboard-card" style="flex: 1; min-width: 160px; padding: 12px; margin:0;">
        <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">DORA Violation</span>
        <div style="font-size: 1.1rem; font-weight: 800; color: #ef4444; margin-top: 6px;">Article 14 breach</div>
        <span style="font-size: 0.6rem; color: var(--text-secondary);">DR sync failure during compromise</span>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; width: 100%;">
      <div class="dashboard-card" style="padding: 15px; margin: 0; display: flex; flex-direction: column;">
        <h4 style="font-size: 0.74rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 10px 0;">
          Ransomware Threat Outage Graph
        </h4>
        <div style="flex: 1; min-height: 280px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 6px; border: 1px dashed var(--border-color); position: relative; overflow: hidden;">
          <svg width="100%" height="280" viewBox="0 0 450 280">
            <line x1="225" y1="230" x2="225" y2="140" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-danger)" stroke-dasharray="4"/>
            <line x1="225" y1="140" x2="225" y2="50" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-danger)"/>

            <circle cx="225" cy="230" r="28" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="2"/>
            <text x="225" y="233" font-size="20" text-anchor="middle">💀</text>
            <text x="225" y="270" font-size="8.5" font-weight="700" fill="#ef4444" text-anchor="middle">Active Ransomware Infection</text>

            <rect x="165" y="110" width="120" height="36" rx="4" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" stroke-width="1.5"/>
            <text x="225" y="126" font-size="8" font-weight="700" fill="#ef4444" text-anchor="middle">Active Directory Services</text>
            <text x="225" y="137" font-size="7" fill="var(--text-muted)" text-anchor="middle">LOCKED / ENCRYPTED</text>

            <rect x="155" y="20" width="140" height="36" rx="4" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" stroke-width="2"/>
            <text x="225" y="36" font-size="8" font-weight="800" fill="#ef4444" text-anchor="middle">Digital Banking Portal</text>
            <text x="225" y="47" font-size="7" fill="var(--text-secondary)" text-anchor="middle">OUTAGE BREACHED</text>
          </svg>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 15px;">
        <div class="dashboard-card" style="padding: 12px; margin: 0; border-color: rgba(239, 68, 68, 0.25);">
          <h4 style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 8px 0;">
            Immediate Disaster Response
          </h4>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <button class="btn btn-primary btn-xs" style="font-size: 0.65rem;" onclick="if(window.setResilienceActiveTab) window.setResilienceActiveTab('simulation'); window.switchTab('manager-resilience');">
              ⚠️ Launch Ransomware Disruption Simulator
            </button>
            <button class="btn btn-secondary btn-xs" style="font-size: 0.65rem;" onclick="window.switchTab('manager-inbox')">
              🚨 Raise Emergency Alert in Inbox
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// New query preset: Oracle Failure
function generateOracleFailureResponse() {
  return `
    <div style="display: flex; gap: 15px; flex-wrap: wrap; width: 100%;">
      <div class="dashboard-card" style="flex: 1; min-width: 160px; padding: 12px; margin:0;">
        <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Outage Scope</span>
        <div style="font-size: 1.4rem; font-weight: 800; color: #ef4444; margin-top: 4px;">Database Cluster</div>
        <span style="font-size: 0.6rem; color: var(--text-secondary);">Oracle primary instance failure</span>
      </div>
      <div class="dashboard-card" style="flex: 1; min-width: 160px; padding: 12px; margin:0;">
        <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Recovery Timeline</span>
        <div style="font-size: 1.4rem; font-weight: 800; color: #ef4444; margin-top: 4px;">18.0 Hours</div>
        <span style="font-size: 0.6rem; color: #ef4444; font-weight:700;">⚠️ Exceeds RTO limit (8h)</span>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; width: 100%;">
      <div class="dashboard-card" style="padding: 15px; margin: 0; display: flex; flex-direction: column;">
        <h4 style="font-size: 0.74rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 10px 0;">
          Oracle Database Outage Graph
        </h4>
        <div style="flex: 1; min-height: 280px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 6px; border: 1px dashed var(--border-color); position: relative; overflow: hidden;">
          <svg width="100%" height="280" viewBox="0 0 450 280">
            <line x1="225" y1="230" x2="225" y2="140" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-danger)" stroke-dasharray="4"/>
            <line x1="225" y1="140" x2="225" y2="50" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-danger)"/>

            <circle cx="225" cy="230" r="28" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="2"/>
            <text x="225" y="233" font-size="20" text-anchor="middle">🛢️</text>
            <text x="225" y="270" font-size="8.5" font-weight="700" fill="#ef4444" text-anchor="middle">Oracle DB Cluster [DOWN]</text>

            <rect x="165" y="110" width="120" height="36" rx="4" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" stroke-width="1.5"/>
            <text x="225" y="126" font-size="8" font-weight="700" fill="#ef4444" text-anchor="middle">app-003 (Settlement Database)</text>
            <text x="225" y="137" font-size="7" fill="var(--text-muted)" text-anchor="middle">UNREACHABLE</text>

            <rect x="155" y="20" width="140" height="36" rx="4" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" stroke-width="2"/>
            <text x="225" y="36" font-size="8" font-weight="800" fill="#ef4444" text-anchor="middle">srv-002 (Clearing & Settlement)</text>
            <text x="225" y="47" font-size="7" fill="var(--text-secondary)" text-anchor="middle">OUTAGE BREACHED</text>
          </svg>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 15px;">
        <div class="dashboard-card" style="padding: 12px; margin: 0;">
          <h4 style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 8px 0;">
            Regulatory Risk
          </h4>
          <span style="font-size: 0.65rem; color: var(--text-secondary);">Triggers DORA Article 11 infrastructure backup compliance issues.</span>
        </div>
      </div>
    </div>
  `;
}

// New query preset: 3rd Party API Failure
function generateThirdPartyAPIResponse() {
  return `
    <div style="display: flex; gap: 15px; flex-wrap: wrap; width: 100%;">
      <div class="dashboard-card" style="flex: 1; min-width: 160px; padding: 12px; margin:0;">
        <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Affected Area</span>
        <div style="font-size: 1.4rem; font-weight: 800; color: #ef4444; margin-top: 4px;">Retail Banking</div>
        <span style="font-size: 0.6rem; color: var(--text-secondary);">Visa/Mastercard integration issue</span>
      </div>
      <div class="dashboard-card" style="flex: 1; min-width: 160px; padding: 12px; margin:0;">
        <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Simulated Recovery</span>
        <div style="font-size: 1.4rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">4.5 Hours</div>
        <span style="font-size: 0.6rem; color: #f59e0b; font-weight:700;">⚠️ Minor SLA breach (4.0h target)</span>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; width: 100%;">
      <div class="dashboard-card" style="padding: 15px; margin: 0; display: flex; flex-direction: column;">
        <h4 style="font-size: 0.74rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 10px 0;">
          3rd Party API Outage Graph
        </h4>
        <div style="flex: 1; min-height: 280px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 6px; border: 1px dashed var(--border-color); position: relative; overflow: hidden;">
          <svg width="100%" height="280" viewBox="0 0 450 280">
            <line x1="225" y1="230" x2="225" y2="140" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-danger)" stroke-dasharray="4"/>
            <line x1="225" y1="140" x2="225" y2="50" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-danger)"/>

            <circle cx="225" cy="230" r="28" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" stroke-width="2"/>
            <text x="225" y="233" font-size="20" text-anchor="middle">🔗</text>
            <text x="225" y="270" font-size="8.5" font-weight="700" fill="#f59e0b" text-anchor="middle">External Payment API [DOWN]</text>

            <rect x="165" y="110" width="120" height="36" rx="4" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" stroke-width="1.5"/>
            <text x="225" y="126" font-size="8" font-weight="700" fill="#ef4444" text-anchor="middle">app-001 (Retail Banking Core)</text>
            <text x="225" y="137" font-size="7" fill="var(--text-muted)" text-anchor="middle">API LINK FAILURE</text>

            <rect x="155" y="20" width="140" height="36" rx="4" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" stroke-width="2"/>
            <text x="225" y="36" font-size="8" font-weight="800" fill="#ef4444" text-anchor="middle">Digital Banking Portal</text>
            <text x="225" y="47" font-size="7" fill="var(--text-secondary)" text-anchor="middle">SLA IMPACTED</text>
          </svg>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 15px;">
        <div class="dashboard-card" style="padding: 12px; margin: 0; border-color: rgba(6, 182, 212, 0.25);">
          <h4 style="font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin: 0 0 8px 0;">
            Supplier Actions
          </h4>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <button class="btn btn-primary btn-xs" style="font-size: 0.65rem;" onclick="if(window.setThirdPartyActiveTab) window.setThirdPartyActiveTab('directory'); window.switchTab('manager-thirdparty');">
              🏢 Review Supplier SLA Controls
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
