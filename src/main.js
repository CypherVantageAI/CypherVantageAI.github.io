// ==========================================================================
// Cypher Vantage - Main Application Bootstrap (ES6 Module Entry Point)
// ==========================================================================

import { loadState, getState, saveState } from './core/db.js';
import { switchTab, setPersona } from './core/router.js?v=2.0.1';

// Import app.js legacy operations module to bind its functions to window
import '../app.js';

import { showModal } from './components/ui.js';
import { showPaneHelp } from './modules/contextualhelp.js';

// Bind routing controls to window for inline HTML onclick triggers
window.switchTab = switchTab;
window.setPersona = setPersona;
window.showModal = showModal;
window.showPaneHelp = showPaneHelp;

window.onload = function() {
  console.log("🚀 Cypher Vantage Core Platform Bootstrap Initiated");

  // 1. Initialize DB State
  const state = loadState();

  // 2. Set default active currency selector if elements exist
  const selector = document.getElementById('currency-selector');
  if (selector && state.resilience.selectedCurrency) {
    selector.value = state.resilience.selectedCurrency;
  }

  // 3. Initialize countdown SLA timers if declared in app.js
  if (typeof window.startManagerSlaCountdown === 'function') {
    window.startManagerSlaCountdown();
  }
  if (typeof window.startSupplierSlaCountdown === 'function') {
    window.startSupplierSlaCountdown();
  }

  // 4. Force first layout render & badge updates
  if (typeof window.updateManagerInboxBadge === 'function') {
    window.updateManagerInboxBadge();
  }
  const reportsBadge = document.getElementById('badge-reports-count');
  if (reportsBadge && state.resilience && state.resilience.reports) {
    reportsBadge.innerText = state.resilience.reports.length;
    reportsBadge.style.display = state.resilience.reports.length > 0 ? 'inline-block' : 'none';
  }

  // 5. Initialize the active persona context
  setPersona(state.activePersona || 'manager');

  // 6. Initialize Theme Selector
  initTheme(state);

  // 6.1 Initialize Font Size Selector
  initFontSize(state);

  // 7. Priority Esc key listener: Close active modals first; exit fullscreen only if no modal is open
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      // Check for any visible modal overlay (excluding .hidden)
      const visibleModal = Array.from(document.querySelectorAll('.modal-overlay')).find(m => {
        return !m.classList.contains('hidden') && window.getComputedStyle(m).display !== 'none';
      });

      if (visibleModal) {
        // Prevent default browser behavior (exiting fullscreen)
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Close the modal
        visibleModal.classList.add('hidden');
        visibleModal.style.setProperty('display', 'none', 'important');
        return false;
      }
    }
  }, { capture: true }); // Use capture phase to intercept Esc key before native browser defaults

  // 8. Global listener for native browser fullscreen change
  document.addEventListener('fullscreenchange', function() {
    if (!document.fullscreenElement) {
      document.querySelectorAll('.view-fullscreen-mode').forEach(pane => {
        pane.classList.remove('view-fullscreen-mode');
      });
      const sidebar = document.querySelector('.app-sidebar');
      if (sidebar) sidebar.style.display = '';
    }
  });
};

// Cookie Helper functions
function setCookie(name, value, days = 365) {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function initTheme(state) {
  const btn = document.getElementById('btn-theme-toggle');
  if (!btn) return;

  const icon = document.getElementById('theme-toggle-icon');

  function applyTheme(isLight) {
    if (isLight) {
      document.body.classList.add('light-mode');
      if (icon) icon.innerText = '🌙';
      btn.setAttribute('title', 'Switch to Dark Theme');
    } else {
      document.body.classList.remove('light-mode');
      if (icon) icon.innerText = '☀️';
      btn.setAttribute('title', 'Switch to Light Theme');
    }
  }

  // Load initial theme from cookie, falling back to state
  const cookieTheme = getCookie('theme');
  const initialTheme = cookieTheme ? cookieTheme : (state.theme || 'dark');
  applyTheme(initialTheme === 'light');
  if (state.theme !== initialTheme) {
    state.theme = initialTheme;
    saveState();
  }

  btn.onclick = () => {
    const isLightNow = document.body.classList.contains('light-mode');
    const newTheme = isLightNow ? 'dark' : 'light';
    
    // Save to cookie and DB state
    setCookie('theme', newTheme);
    state.theme = newTheme;
    saveState();
    
    applyTheme(!isLightNow);

    // Refresh DORT outage graph if visible
    const mapBox = document.getElementById('twin-propagation-map');
    if (mapBox && typeof window.refreshCurrentTwinOutageGraph === 'function') {
      window.refreshCurrentTwinOutageGraph();
    }
  };
}

function initFontSize(state) {
  const slider = document.getElementById('font-size-slider');
  const label = document.getElementById('font-size-value');
  if (!slider) return;

  // Map levels 1-5 to exact font scales (1 = ~15px, 2 = 16px [default standard], 3 = 17px, 4 = 18px, 5 = 19px)
  function getFontSizeScale(level) {
    const scales = {
      1: 0.9375,  // 15px
      2: 1.0,     // 16px (standard default)
      3: 1.0625,  // 17px
      4: 1.125    // 18px
    };
    return scales[level] || 1.0;
  }

  // Load level from cookie, then state, else default to 2
  const cookieLevel = getCookie('fontSizeLevel');
  let level = cookieLevel ? parseInt(cookieLevel, 10) : (state.fontSizeLevel || 2);
  if (isNaN(level) || level < 1 || level > 4) {
    level = 2;
  }

  // Sync slider UI elements
  slider.value = level;
  if (label) label.innerText = level;

  function applyFontSize(lvl) {
    const scale = getFontSizeScale(lvl);
    document.documentElement.style.fontSize = `${scale * 16}px`;

    let customSheet = document.getElementById('cv-dynamic-font-sheet');
    if (!customSheet) {
      customSheet = document.createElement('style');
      customSheet.id = 'cv-dynamic-font-sheet';
      document.head.appendChild(customSheet);
    }
    customSheet.innerHTML = `
      body, td, th, h1, h2, h3, h4, p, button, input, select, textarea, .badge, .node-content, .obligation-text, .evidence-snippet, .term-line-info, .term-line-success, .term-line-warning, .tab-switcher button, .view-header h2, .view-header p, .dashboard-card h3, .dashboard-card h4 {
        font-size: calc(1em * ${scale}) !important;
      }
      #btn-viewer-incident-report, button[onclick="window.downloadMockDoc()"], button[onclick="window.print()"] {
        font-size: calc(0.68em * ${scale}) !important;
        height: calc(24px * ${scale}) !important;
        padding: 3px 10px !important;
        line-height: 1 !important;
      }
      .btn, .badge, .dashboard-card, .resilience-system-item {
        height: auto !important;
        min-height: min-content !important;
      }
      #resilience-graph-svg text.graph-icon {
        font-size: calc(11px * ${scale}) !important;
      }
      #resilience-graph-svg text.graph-label {
        font-size: calc(7.5px * ${scale}) !important;
      }
    `;
  }

  // Apply initially
  applyFontSize(level);
  if (state.fontSizeLevel !== level) {
    state.fontSizeLevel = level;
    saveState();
  }

  slider.oninput = (e) => {
    const val = parseInt(e.target.value, 10);
    
    // Save to cookie and DB state
    setCookie('fontSizeLevel', val);
    state.fontSizeLevel = val;
    saveState();
    
    if (label) label.innerText = val;
    applyFontSize(val);
  };
}

// 9. Download Mock DOC Presentation Handler
window.downloadMockDoc = function() {
  const state = getState();
  const activeIndex = state.resilience.activeReportIndex !== undefined ? state.resilience.activeReportIndex : 0;
  const rep = state.resilience.reports ? state.resilience.reports[activeIndex] : null;
  const title = rep ? rep.title : 'Cypher Vantage Operational Resilience Audit Report';
  const id = rep ? rep.id : 'CV-REPORT';
  const summary = rep ? rep.summary : 'Audit summary of operational resilience compliance.';

  // Generate a valid HTML document styled for high fidelity that MS Word imports instantly
  const wordContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <title>Cypher Vantage Resilience Report</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body, h1, h2, h3, h4, h5, h6, p, span, div, strong, table, tr, td, th, li, ul, a {
          font-family: 'Figtree', 'Inter', 'Arial', sans-serif !important;
        }
        body { line-height: 1.6; color: #333333; padding: 40px; }
        h1 { color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 8px; font-size: 24px; }
        h2 { color: #0284c7; margin-top: 20px; font-size: 18px; }
        .meta { background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 13px; margin-bottom: 20px; border-left: 4px solid #06b6d4; }
        .summary-box { background: #fafafa; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin: 15px 0; }
        ul { padding-left: 20px; }
        li { margin-bottom: 6px; }
      </style>
    </head>
    <body>
      <h1>Digital Operational Resilience Audit Report</h1>
      <div class="meta">
        <strong>Report Reference:</strong> ${id}<br/>
        <strong>Title:</strong> ${title}<br/>
        <strong>Generated on:</strong> ${new Date().toLocaleDateString('en-GB')}<br/>
        <strong>Entity:</strong> Cypher Vantage Core Platform (DORA Major ICT Service Provider)
      </div>

      <h2>1. Executive Summary & Blast Radius</h2>
      <div class="summary-box">
        <p>${summary}</p>
        <p><strong>Core Threat Category:</strong> ${rep ? rep.threat : 'Simulated Outage'}</p>
        <p><strong>Recovery Status:</strong> ${rep ? rep.status : 'Verified'}</p>
        <p><strong>Affected Primary Node:</strong> ${rep ? rep.location : 'Global DC Networks'}</p>
      </div>

      <h2>2. Compliance & Recovery Metrics</h2>
      <ul>
        <li>Maximum Tolerable Disruption: 4 Hours (RTO Limit)</li>
        <li>Simulated Outage Recovery: Passed</li>
        <li>Prevention Safeguards: Automated failover controls verified under DORA Article 11.</li>
        <li>Mitigated Risk Backlog Loss: Capped & Closed.</li>
      </ul>

      <h2>3. Action Items & Next Steps</h2>
      <ul>
        <li>Conduct zero-trust access audits on critical database replicas.</li>
        <li>Schedule quarterly threat-led penetration tests (TLPT/TIBER-EU).</li>
      </ul>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + wordContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CypherVantage_Report_${id}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

