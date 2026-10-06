/**
 * EAIOS Public Showcase — Architecture Reference & Governance Portal
 * Core Message: "EAIOS is a deterministic governance and execution architecture for enterprise AI."
 *
 * Invariant: "COORDINATION MAY PROPAGATE WORK. AUTHORITY MUST NEVER PROPAGATE IMPLICITLY."
 * "MODEL ≠ AUTHORITY | WORKER ≠ AUTHORITY | ORCHESTRATOR ≠ AUTHORITY | AI EMPLOYEE ≠ AUTHORITY | HUMAN APPROVAL ≠ CAPABILITY AUTHORITY | PROVIDER ≠ AUTHORITY | ENTERPRISE KNOWLEDGE ≠ AUTHORITY | EAIES = EXECUTION AUTHORITY"
 *
 * Baseline: Stage 26 Formally Frozen Baseline (af431e1ef5165e31bfa4f5c5598be5956192e51a)
 * Full Regression: 965 / 965 passed (0 failures, 15 skipped)
 */

import {
  EAIOS_FROZEN_BASELINE,
  EAIOS_CURRENT_STATE,
  EAIOS_ONE_MINUTE_STEPS,
  EAIOS_ARCH_LAYERS,
  STAGE_13_LIFECYCLE_STATES,
  EVIDENCE_BADGES,
  SHOWCASE_SCENARIOS,
  CORE_INVARIANTS,
  ADR_EXPLORER_CATALOG,
  STAGE_MATURITY_TIMELINE,
  TENANT_RLS_RECORDS,
  COST_GOVERNANCE_CONFIG
} from './eaios-data.js';

import { EaiosRenderer } from './eaios-renderer.js';
import { EaiosSimulationManager } from './eaios-simulation.js';

let renderer = null;
let simManager = null;
let isInitialized = false;

// =========================================================================
// GLOBAL WINDOW ACTION HOOKS (Ensures 100% reliable click triggers)
// =========================================================================

window.selectEaiosScenario = function(scenarioKey) {
  if (!simManager) return;
  const btnMap = {
    'scenario_a': { id: 'eaios-scenario-btn-a', key: 'SCENARIO_A' },
    'scenario_b': { id: 'eaios-scenario-btn-b', key: 'SCENARIO_B' },
    'scenario_c': { id: 'eaios-scenario-btn-c', key: 'SCENARIO_C' },
    'scenario_d': { id: 'eaios-scenario-btn-d', key: 'SCENARIO_D' }
  };

  simManager.setScenario(scenarioKey);

  document.querySelectorAll('.eaios-scen-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });

  const entry = btnMap[scenarioKey];
  if (entry) {
    const activeBtn = document.getElementById(entry.id);
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.setAttribute('aria-selected', 'true');
    }
    const info = SHOWCASE_SCENARIOS[entry.key];
    if (info) {
      const titleEl = document.getElementById('eaios-scen-title');
      const subEl = document.getElementById('eaios-scen-subtitle');
      const descEl = document.getElementById('eaios-scen-desc');
      const evidEl = document.getElementById('eaios-scen-evid');
      if (titleEl) titleEl.textContent = info.name;
      if (subEl) subEl.textContent = info.subtitle;
      if (descEl) descEl.textContent = info.description;
      if (evidEl) evidEl.textContent = info.evidenceRef;
    }
  }

  const nodes = simManager.getCurrentNodes();
  if (nodes && nodes[0]) {
    updateInspector(nodes[0]);
  }
};

window.runEaiosScenario = function() {
  if (!simManager) return;
  const btnRun = document.getElementById('eaios-btn-run');
  if (btnRun) {
    btnRun.disabled = true;
    btnRun.style.opacity = '0.7';
    btnRun.innerHTML = `<span>⏳ Simulating...</span>`;
  }
  simManager.runActiveScenario();
  setTimeout(() => {
    if (btnRun) {
      btnRun.disabled = false;
      btnRun.style.opacity = '1';
      btnRun.innerHTML = `▶ Run Selected Scenario`;
    }
  }, 1600);
};

window.resetEaiosSimulation = function() {
  if (!simManager) return;
  simManager.reset();
  const nodes = simManager.getCurrentNodes();
  if (nodes && nodes[0]) {
    updateInspector(nodes[0]);
  }
  const btnRun = document.getElementById('eaios-btn-run');
  if (btnRun) {
    btnRun.disabled = false;
    btnRun.style.opacity = '1';
    btnRun.innerHTML = `▶ Run Selected Scenario`;
  }
};

window.submitEaiosDecision = function(decision) {
  if (!simManager) return;
  const email = document.getElementById('eaios-operator-select')?.value || 'bob@enterprise.example';
  const rationale = document.getElementById('eaios-operator-rationale')?.value || (decision === 'APPROVE' ? 'Approved for production.' : 'Reallocation cancelled.');
  simManager.submitHumanDecision(decision, email, rationale);
};

window.switchEaiosTenant = function(tenantId) {
  if (!simManager) return;
  const btnRlsGwm = document.getElementById('eaios-btn-rls-gwm');
  const btnRlsIib = document.getElementById('eaios-btn-rls-iib');
  const rlsOutput = document.getElementById('eaios-rls-output');

  if (tenantId === 'GLOBAL-WEALTH-MANAGEMENT') {
    if (btnRlsGwm) {
      btnRlsGwm.style.background = 'rgba(56, 189, 248, 0.2)';
      btnRlsGwm.style.color = '#38bdf8';
      btnRlsGwm.style.borderColor = '#38bdf8';
    }
    if (btnRlsIib) {
      btnRlsIib.style.background = '#0f172a';
      btnRlsIib.style.color = '#cbd5e1';
      btnRlsIib.style.borderColor = 'rgba(255,255,255,0.15)';
    }
  } else {
    if (btnRlsIib) {
      btnRlsIib.style.background = 'rgba(167, 139, 250, 0.2)';
      btnRlsIib.style.color = '#c084fc';
      btnRlsIib.style.borderColor = '#a78bfa';
    }
    if (btnRlsGwm) {
      btnRlsGwm.style.background = '#0f172a';
      btnRlsGwm.style.color = '#cbd5e1';
      btnRlsGwm.style.borderColor = 'rgba(255,255,255,0.15)';
    }
  }

  const res = simManager.simulateRlsQuery(tenantId);
  if (rlsOutput) {
    const color = tenantId === 'GLOBAL-WEALTH-MANAGEMENT' ? '#38bdf8' : '#a78bfa';
    rlsOutput.innerHTML = `
      <div style="color: #64748b;">// Executed: SET LOCAL app.current_tenant_id = '${tenantId}'</div>
      <div style="color: ${color}; font-weight: 700;">active_tenant_id = '${tenantId}'</div>
      <div style="color: #10b981; margin-top: 4px;">✓ ${res ? res.title : 'No records'} (1 row)</div>
      <div style="color: #94a3b8; font-size: 9.5px; margin-top: 2px;">${res ? res.content : ''}</div>
    `;
  }
  const nodes = simManager.getCurrentNodes();
  if (nodes && nodes[0]) {
    updateInspector(nodes[0]);
  }
};

window.simulateEaiosBudget = function() {
  if (simManager) {
    simManager.simulateExcessiveReservation();
  }
};

window.simulateEaiosTimeout = function() {
  if (!simManager) return;
  simManager.simulateProviderTimeout();
  const providerBox = document.getElementById('eaios-provider-timeout-box');
  if (providerBox) {
    providerBox.style.display = 'block';
    providerBox.innerHTML = `
      <div style="color: #64748b;">// Provider dispatch status:</div>
      <div style="color: #ef4444; font-weight: 700;">TIMEOUT (30,000ms) - OUTCOME UNKNOWN</div>
      <div style="color: #f59e0b; margin-top: 4px;">Conservative Governance: Billed as spent until reconciliation</div>
    `;
  }
};

window.openEaiosModal = function(type, id) {
  const modal = document.getElementById('eaios-detail-modal');
  const modalBadge = document.getElementById('eaios-modal-badge');
  const modalTitle = document.getElementById('eaios-modal-title');
  const modalBody = document.getElementById('eaios-modal-body');
  if (!modal || !modalBadge || !modalTitle || !modalBody) return;

  if (type === 'ADR') {
    const data = ADR_EXPLORER_CATALOG.find(a => a.id === id);
    if (!data) return;
    modalBadge.textContent = data.id;
    modalBadge.style.color = '#38bdf8';
    modalBadge.style.background = 'rgba(56, 189, 248, 0.15)';
    modalBadge.style.borderColor = 'rgba(56, 189, 248, 0.3)';
    modalTitle.textContent = data.title;

    modalBody.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
        <div style="font-size: 10px; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 4px;">Architectural Decision</div>
        <div style="font-size: 13px; color: #f8fafc; line-height: 1.5;">${data.decision}</div>
      </div>

      <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 14px;">
        <div style="font-size: 10px; font-weight: 800; color: #fbbf24; text-transform: uppercase; margin-bottom: 4px;">Authority & Boundary Implication</div>
        <div style="font-size: 12.5px; color: #fde68a; line-height: 1.5;">${data.authorityImplication}</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="background: rgba(10, 11, 16, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 10px;">
          <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase;">Domain Category</div>
          <div style="font-size: 12px; color: #cbd5e1; font-weight: 600; margin-top: 2px;">${data.category}</div>
        </div>
        <div style="background: rgba(10, 11, 16, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 10px;">
          <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase;">Evidence Classification</div>
          <div style="font-size: 12px; color: #34d399; font-weight: 600; margin-top: 2px;">${data.evidenceBadge}</div>
        </div>
      </div>
    `;
  } else if (type === 'INVARIANT') {
    const invId = parseInt(id, 10);
    const data = CORE_INVARIANTS.find(i => i.id === invId);
    if (!data) return;
    modalBadge.textContent = `INVARIANT ${data.id}`;
    modalBadge.style.color = '#10b981';
    modalBadge.style.background = 'rgba(16, 185, 129, 0.15)';
    modalBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    modalTitle.textContent = data.title;

    modalBody.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
        <div style="font-size: 10px; font-weight: 800; color: #34d399; text-transform: uppercase; margin-bottom: 4px;">Inviolable Governance Rule</div>
        <div style="font-size: 13px; color: #f8fafc; line-height: 1.5;">${data.rule}</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="background: rgba(10, 11, 16, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 10px;">
          <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase;">Authoritative ADR Reference</div>
          <div style="font-size: 12px; color: #38bdf8; font-weight: 600; margin-top: 2px;">${data.adrRef}</div>
        </div>
        <div style="background: rgba(10, 11, 16, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 10px;">
          <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase;">Evidence Classification</div>
          <div style="font-size: 12px; color: #a78bfa; font-weight: 600; margin-top: 2px;">${data.evidenceBadge}</div>
        </div>
      </div>
    `;
  }

  modal.style.display = 'flex';
  modal.classList.remove('hidden');
  const closeBtn = document.getElementById('eaios-modal-close-btn');
  if (closeBtn) closeBtn.focus();
};

window.closeEaiosModal = function() {
  const modal = document.getElementById('eaios-detail-modal');
  if (!modal) return;
  modal.style.display = 'none';
  modal.classList.add('hidden');
};

// =========================================================================
// MAIN RENDER ENTRY POINT
// =========================================================================

export function renderEaiosModule() {
  const container = document.getElementById('view-manager-eaios');
  if (!container) return;

  if (!isInitialized || !container.innerHTML.trim()) {
    container.innerHTML = generateEaiosHtml();
    initializeComponents();
    isInitialized = true;
  } else {
    // Refresh DAG & state sync on subsequent tab activations
    if (simManager && renderer) {
      renderer.render(simManager.getCurrentNodes(), simManager.nodeStates, simManager.selectedNodeId);
    }
  }
}

function generateEaiosHtml() {
  return `
    <style>
      .eaios-view-wrapper {
        padding: 24px;
        max-width: 1440px;
        margin: 0 auto;
        color: var(--text-primary, #e2e8f0);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .eaios-section-card {
        background: rgba(22, 26, 43, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 24px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      }
      .eaios-hero-card {
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(10, 15, 28, 0.99));
        border: 1px solid rgba(56, 189, 248, 0.4);
        border-radius: 14px;
        padding: 28px 32px;
        margin-bottom: 24px;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);
      }
      .eaios-principle-banner {
        background: rgba(10, 11, 16, 0.9);
        border-left: 4px solid #38bdf8;
        border-radius: 6px;
        padding: 16px 20px;
        margin: 18px 0;
      }
      .eaios-equation-box {
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid rgba(56, 189, 248, 0.3);
        border-radius: 8px;
        padding: 14px 18px;
        font-family: 'SFMono-Regular', Consolas, monospace;
        font-size: 11.5px;
        line-height: 1.6;
        color: #cbd5e1;
        margin-top: 12px;
        overflow-x: auto;
      }
      .eaios-scen-btn {
        background: rgba(15, 23, 42, 0.75);
        color: #94a3b8;
        border: 1px solid rgba(255, 255, 255, 0.12);
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 38px;
        touch-action: manipulation;
      }
      .eaios-scen-btn:hover {
        background: rgba(30, 41, 59, 0.9);
        color: #f8fafc;
        border-color: rgba(56, 189, 248, 0.4);
      }
      .eaios-scen-btn:focus-visible {
        outline: 2px solid #38bdf8;
        outline-offset: 2px;
      }
      .eaios-scen-btn.active {
        background: #2563eb !important;
        color: #ffffff !important;
        border-color: #60a5fa !important;
        box-shadow: 0 0 12px rgba(37, 99, 235, 0.5);
      }
      .eaios-btn-primary {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border: 1px solid #34d399;
        padding: 9px 20px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 40px;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
        touch-action: manipulation;
      }
      .eaios-btn-primary:hover {
        background: linear-gradient(135deg, #059669, #047857);
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.5);
        transform: translateY(-1px);
      }
      .eaios-btn-primary:active {
        transform: translateY(0);
      }
      .eaios-btn-primary:focus-visible {
        outline: 2px solid #38bdf8;
        outline-offset: 2px;
      }
      .eaios-btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
      .eaios-btn-secondary {
        background: rgba(148, 163, 184, 0.12);
        color: #cbd5e1;
        border: 1px solid rgba(148, 163, 184, 0.3);
        padding: 9px 18px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        min-height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        touch-action: manipulation;
      }
      .eaios-btn-secondary:hover {
        background: rgba(148, 163, 184, 0.22);
        color: #f8fafc;
        border-color: rgba(148, 163, 184, 0.5);
      }
      .eaios-btn-secondary:focus-visible {
        outline: 2px solid #38bdf8;
        outline-offset: 2px;
      }
      .eaios-explorable-card {
        background: rgba(10, 11, 16, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .eaios-explorable-card:hover {
        background: rgba(15, 23, 42, 0.85);
        border-color: rgba(56, 189, 248, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
      }
      .eaios-explorable-card:focus-visible {
        outline: 2px solid #38bdf8;
        outline-offset: 2px;
      }
      .eaios-info-card {
        cursor: default;
        user-select: text;
      }
      .eaios-sim-action-btn {
        transition: all 0.15s ease;
        cursor: pointer;
        touch-action: manipulation;
      }
      .eaios-sim-action-btn:hover {
        filter: brightness(1.2);
        transform: translateY(-1px);
      }
      .eaios-sim-action-btn:active {
        transform: translateY(0);
      }
      .eaios-sim-action-btn:focus-visible {
        outline: 2px solid #38bdf8;
        outline-offset: 2px;
      }
      .eaios-flow-step {
        background: rgba(10, 11, 16, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        position: relative;
      }
      .eaios-flow-step:hover {
        border-color: rgba(56, 189, 248, 0.35);
      }

      /* Responsive Layout Classes */
      .eaios-grid-2col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      .eaios-grid-subsystems {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 24px;
      }
      .eaios-grid-dag {
        display: grid;
        grid-template-columns: 1.8fr 1.2fr;
        gap: 20px;
      }
      .eaios-grid-authority {
        display: grid;
        grid-template-columns: 1.3fr 1fr;
        gap: 24px;
        align-items: center;
      }
      .eaios-hero-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 20px;
      }
      .eaios-hero-badges {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: flex-end;
      }
      .eaios-scen-tabs {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      /* Mobile & Tablet Optimizations */
      @media (max-width: 992px) {
        .eaios-view-wrapper {
          padding: 14px;
        }
        .eaios-section-card {
          padding: 16px;
          margin-bottom: 16px;
        }
        .eaios-hero-card {
          padding: 20px 18px;
        }
        .eaios-grid-2col,
        .eaios-grid-subsystems,
        .eaios-grid-dag,
        .eaios-grid-authority {
          grid-template-columns: 1fr !important;
          gap: 16px !important;
        }
        .eaios-hero-header {
          flex-direction: column !important;
          align-items: stretch !important;
        }
        .eaios-hero-badges {
          align-items: flex-start !important;
          margin-top: 10px;
        }
        .eaios-scen-tabs {
          width: 100%;
        }
        .eaios-scen-btn {
          flex: 1 1 calc(50% - 6px);
          font-size: 11.5px;
          padding: 8px 10px;
        }
      }

      @media (max-width: 640px) {
        .eaios-view-wrapper {
          padding: 8px;
        }
        .eaios-hero-card h1 {
          font-size: 22px !important;
        }
        .eaios-scen-btn {
          flex: 1 1 100%;
        }
        #eaios-dag-container {
          min-height: auto;
          overflow-x: visible;
        }
        .eaios-equation-box {
          font-size: 10.5px;
          padding: 10px 12px;
        }
      }

      /* ================= LIGHT MODE THEME LAYER ================= */
      body.light-mode #view-manager-eaios .eaios-view-wrapper { color: #1e293b; }
      body.light-mode #view-manager-eaios .eaios-section-card,
      body.light-mode #view-manager-eaios .eaios-hero-card {
        background: #ffffff !important;
        border-color: #e2e8f0 !important;
        box-shadow: 0 1px 6px rgba(15, 23, 42, 0.06) !important;
      }
      body.light-mode #view-manager-eaios .eaios-hero-card { border-color: rgba(2, 132, 199, 0.35) !important; }
      body.light-mode #view-manager-eaios .eaios-principle-banner,
      body.light-mode #view-manager-eaios .eaios-equation-box,
      body.light-mode #view-manager-eaios .eaios-flow-step,
      body.light-mode #view-manager-eaios .eaios-explorable-card,
      body.light-mode #view-manager-eaios [style*="background: rgba(10, 11, 16"],
      body.light-mode #view-manager-eaios [style*="background: rgba(15, 23, 42"],
      body.light-mode #view-manager-eaios [style*="background: rgba(22, 26, 43"],
      body.light-mode #view-manager-eaios [style*="background: linear-gradient(135deg, rgba(22, 26, 43"],
      body.light-mode #view-manager-eaios [style*="background: linear-gradient(135deg, rgba(15, 23, 42"],
      body.light-mode #view-manager-eaios [style*="background: #0f172a"],
      body.light-mode #view-manager-eaios [style*="background: #0d1322"],
      body.light-mode #view-manager-eaios [style*="background: #0d111d"] {
        background: #f8fafc !important;
        border-color: #e2e8f0 !important;
        color: #1e293b;
      }
      body.light-mode #view-manager-eaios .eaios-explorable-card:hover { background: #eff6ff !important; border-color: #0284c7 !important; box-shadow: 0 4px 14px rgba(2,132,199,0.12) !important; }
      body.light-mode #view-manager-eaios [style*="border: 1px solid rgba(255, 255, 255"],
      body.light-mode #view-manager-eaios [style*="border-bottom: 1px solid rgba(255, 255, 255"],
      body.light-mode #view-manager-eaios [style*="border-top: 1px solid rgba(255, 255, 255"] { border-color: #e2e8f0 !important; }

      /* Text tones */
      body.light-mode #view-manager-eaios [style*="color: #f8fafc"],
      body.light-mode #view-manager-eaios [style*="color: #e2e8f0"],
      body.light-mode #view-manager-eaios h1, body.light-mode #view-manager-eaios h2, body.light-mode #view-manager-eaios h3 { color: #0f172a !important; }
      body.light-mode #view-manager-eaios [style*="color: #cbd5e1"] { color: #334155 !important; }
      body.light-mode #view-manager-eaios [style*="color: #94a3b8"] { color: #475569 !important; }
      body.light-mode #view-manager-eaios [style*="color: #64748b"] { color: #64748b !important; }
      body.light-mode #view-manager-eaios [style*="color: #38bdf8"] { color: #0369a1 !important; }
      body.light-mode #view-manager-eaios [style*="color: #34d399"],
      body.light-mode #view-manager-eaios [style*="color: #10b981"] { color: #047857 !important; }
      body.light-mode #view-manager-eaios [style*="color: #fbbf24"],
      body.light-mode #view-manager-eaios [style*="color: #f59e0b"],
      body.light-mode #view-manager-eaios [style*="color: #fde68a"] { color: #b45309 !important; }
      body.light-mode #view-manager-eaios [style*="color: #a78bfa"],
      body.light-mode #view-manager-eaios [style*="color: #c084fc"] { color: #6d28d9 !important; }
      body.light-mode #view-manager-eaios [style*="color: #f87171"] { color: #b91c1c !important; }
      body.light-mode #view-manager-eaios code { background: #eef2f7; padding: 0 3px; border-radius: 3px; }
      /* Solid action buttons keep white text */
      body.light-mode #view-manager-eaios #eaios-btn-approve-action,
      body.light-mode #view-manager-eaios #eaios-btn-reject-action,
      body.light-mode #view-manager-eaios .eaios-btn-primary { color: #ffffff !important; }

      /* Controls */
      body.light-mode #view-manager-eaios .eaios-scen-btn { background: #ffffff; color: #334155; border-color: #cbd5e1; }
      body.light-mode #view-manager-eaios .eaios-scen-btn:hover { background: #eff6ff; color: #0f172a; border-color: #0284c7; }
      body.light-mode #view-manager-eaios .eaios-scen-btn.active { background: #2563eb !important; color: #ffffff !important; }
      body.light-mode #view-manager-eaios .eaios-btn-secondary { background: #f1f5f9; color: #334155; border-color: #cbd5e1; }
      body.light-mode #view-manager-eaios .eaios-btn-secondary:hover { background: #e2e8f0; color: #0f172a; }
      body.light-mode #view-manager-eaios select,
      body.light-mode #view-manager-eaios input[type="text"] { background: #ffffff !important; color: #0f172a !important; border-color: #cbd5e1 !important; }
      body.light-mode #view-manager-eaios .eaios-audit-item:hover { background: #f1f5f9 !important; }
      body.light-mode #view-manager-eaios [style*="background: rgb(15, 23, 42)"] { background: #ffffff !important; border-color: #cbd5e1 !important; }
      body.light-mode #view-manager-eaios [style*="color: rgb(203, 213, 225)"] { color: #334155 !important; }
      body.light-mode #view-manager-eaios [style*="color: rgb(56, 189, 248)"] { color: #0369a1 !important; }
      body.light-mode #view-manager-eaios [style*="color: rgb(192, 132, 252)"] { color: #6d28d9 !important; }

      /* Modal */
      body.light-mode #eaios-detail-modal { background: rgba(15, 23, 42, 0.45) !important; }
      body.light-mode #eaios-detail-modal > div { background: #ffffff !important; box-shadow: 0 16px 48px rgba(15,23,42,0.25) !important; }

      /* DAG SVG */
      body.light-mode #view-manager-eaios #eaios-dag-container { background: #f8fafc !important; border-color: #e2e8f0 !important; }
      body.light-mode #view-manager-eaios svg rect[fill="#0d111d"] { fill: #ffffff !important; }
      body.light-mode #view-manager-eaios svg text[fill="#f8fafc"],
      body.light-mode #view-manager-eaios svg text[fill="#e2e8f0"],
      body.light-mode #view-manager-eaios svg text[fill="#ffffff"] { fill: #0f172a !important; }
      body.light-mode #view-manager-eaios svg text[fill="#94a3b8"],
      body.light-mode #view-manager-eaios svg text[fill="#cbd5e1"] { fill: #475569 !important; }
      body.light-mode #view-manager-eaios svg line[stroke="#ffffff"] { stroke: #94a3b8 !important; }
      body.light-mode #view-manager-eaios svg path[fill="rgba(255, 255, 255, 0.25)"] { fill: #94a3b8 !important; }
      body.light-mode #view-manager-eaios svg [stroke="rgba(255, 255, 255, 0.15)"],
      body.light-mode #view-manager-eaios svg [stroke="rgba(255, 255, 255, 0.2)"] { stroke: #94a3b8 !important; }
    </style>

    <div class="eaios-view-wrapper">

      <!-- ================================================================= -->
      <!-- 1. HERO HEADER: REFERENCE ARCHITECTURE OVERVIEW & STATUS           -->
      <!-- ================================================================= -->
      <div class="eaios-hero-card eaios-info-card">
        <div class="eaios-hero-header">
          <div style="flex: 1; min-width: 280px;">
            <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.35); padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981;"></span>
              <span style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">ENTERPRISE REFERENCE ARCHITECTURE</span>
            </div>
            <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 6px 0; color: #f8fafc; letter-spacing: -0.02em;">
              EAIOS Enterprise AI Operating System
            </h1>
            <div style="font-size: 15px; font-weight: 700; color: #38bdf8; margin-bottom: 8px;">
              Deterministic governance, foundation model registry, workflow sagas & provider fallback management for enterprise AI.
            </div>
            <p style="font-size: 13.5px; color: #cbd5e1; margin: 0; line-height: 1.6; max-width: 900px;">
              EAIOS allows AI Employees, models and orchestrators to coordinate complex enterprise workflows while deterministic infrastructure retains authority over capability execution, model registration, residency scopes, transactional outbox/inbox delivery, distributed saga compensation, tenancy, lifecycle and human governance.
            </p>
          </div>

          <!-- Architectural Verification Status Indicators -->
          <div class="eaios-hero-badges">
            <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end;">
              <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 5px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 700; font-family: monospace;" title="Stage 26 Formally Frozen Baseline">
                ✓ Stage 26 — Frozen Baseline
              </span>
              <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); padding: 5px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 700; font-family: monospace;" title="Full Automated Test Suite">
                965 / 965 passed
              </span>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end;">
              <span style="background: rgba(167, 139, 250, 0.15); color: #c084fc; border: 1px solid rgba(167, 139, 250, 0.4); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">
                PostgreSQL 15.14 + RLS
              </span>
              <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">
                Model Registry (ADR-046)
              </span>
              <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">
                Dynamic Fallback & Resiliency
              </span>
              <span style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">
                Four-Eyes Ed25519
              </span>
              <span style="background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">
                Fail-Closed EAIES Gate
              </span>
            </div>
          </div>
        </div>

        <!-- Secondary Historical Reference -->
        <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; font-size: 11.5px; color: #94a3b8;">
          <div>
            <strong style="color: #cbd5e1;">Frozen Baseline:</strong> Stage 26 is formally frozen at commit <code style="color: #38bdf8;">${EAIOS_FROZEN_BASELINE.commit}</code> (tag <code style="color: #cbd5e1;">${EAIOS_FROZEN_BASELINE.tag}</code>) governing Governed Foundation Model Registry, Risk Tiering & Dynamic Provider Fallback (ADR-046).
          </div>
          <div style="font-family: monospace; font-size: 11px; color: #64748b;">
            H-01 SOVEREIGN • NON-BYPASSABLE EXECUTION BOUNDARY
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 2. CORE ARCHITECTURAL PRINCIPLE & AUTHORITY INEQUALITY BLOCK       -->
      <!-- ================================================================= -->
      <div class="eaios-section-card eaios-info-card" style="border-color: rgba(56, 189, 248, 0.35);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="font-size: 16px; font-weight: 800; color: #f8fafc; text-transform: uppercase; letter-spacing: 0.04em;">
            Core Architectural Axiom
          </div>
          <span style="font-size: 10.5px; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 3px 10px; border-radius: 4px; font-weight: 700;">
            NON-NEGOTIABLE INVARIANT
          </span>
        </div>

        <div class="eaios-principle-banner">
          <div style="font-size: 16px; font-weight: 800; color: #38bdf8; letter-spacing: 0.02em;">
            COORDINATION MAY PROPAGATE WORK. AUTHORITY MUST NEVER PROPAGATE IMPLICITLY.
          </div>
          <div style="font-size: 12.5px; color: #cbd5e1; margin-top: 6px; line-height: 1.5;">
            <strong>H-01 SOVEREIGN THESIS:</strong> AI coordinates work; Deterministic infrastructure retains execution authority. EAIOS is a deterministic governance and execution architecture for enterprise AI. AI Employees, foundation models, and orchestrators coordinate work, but they never become the authority to execute capabilities, consume resources, cross tenant boundaries, promote models, or approve their own authority. EAIES remains the final execution authority.
          </div>
        </div>

        <div class="eaios-equation-box">
          <span style="color: #f87171;">MODEL ≠ AUTHORITY</span> &nbsp;•&nbsp;
          <span style="color: #f87171;">WORKER ≠ AUTHORITY</span> &nbsp;•&nbsp;
          <span style="color: #f87171;">ORCHESTRATOR ≠ AUTHORITY</span> &nbsp;•&nbsp;
          <span style="color: #f87171;">AI EMPLOYEE ≠ AUTHORITY</span> &nbsp;•&nbsp;
          <span style="color: #f87171;">HUMAN APPROVAL ≠ CAPABILITY AUTHORITY</span> &nbsp;•&nbsp;
          <span style="color: #f87171;">PROVIDER ≠ AUTHORITY</span> &nbsp;•&nbsp;
          <span style="color: #f87171;">ENTERPRISE KNOWLEDGE ≠ AUTHORITY</span> &nbsp;•&nbsp;
          <strong style="color: #10b981; font-size: 12.5px; background: rgba(16, 185, 129, 0.15); padding: 2px 8px; border-radius: 4px; border: 1px solid #10b981;">EAIES = EXECUTION AUTHORITY</strong>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 3. EAIOS IN ONE MINUTE: 6-LEVEL GOVERNED EXECUTION MODEL         -->
      <!-- ================================================================= -->
      <div class="eaios-section-card eaios-info-card">
        <div style="margin-bottom: 16px;">
          <h2 style="font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0 0 4px 0;">
            EAIOS in One Minute — The Six-Level Execution Model
          </h2>
          <div style="font-size: 12.5px; color: #94a3b8;">
            Every enterprise transaction traverses a six-level deterministic execution model. Eligibility and model risk clearance are verified before execution authorization.
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
          ${EAIOS_ONE_MINUTE_STEPS.map(s => `
            <div class="eaios-flow-step">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-family: monospace; font-size: 12px; font-weight: 800; color: #38bdf8; background: rgba(56, 189, 248, 0.15); width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%;">
                  ${s.step}
                </span>
                <span style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">${s.badge}</span>
              </div>
              <div style="font-size: 13.5px; font-weight: 800; color: #f8fafc; margin-top: 4px;">${s.title}</div>
              <div style="font-size: 11px; font-weight: 600; color: #38bdf8;">${s.subtitle}</div>
              <div style="font-size: 11px; color: #cbd5e1; line-height: 1.45; margin-top: 4px;">${s.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 4. WHERE DOES AUTHORITY LIVE? (AUTHORITY HIERARCHY)                -->
      <!-- ================================================================= -->
      <div class="eaios-section-card eaios-info-card" style="background: linear-gradient(135deg, rgba(22, 26, 43, 0.95), rgba(15, 23, 42, 0.95)); border: 1px solid rgba(56, 189, 248, 0.3);">
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0 0 4px 0;">
            Where Does Authority Live?
          </h2>
          <div style="font-size: 12.5px; color: #94a3b8;">
            Human administrators govern configuration and Four-Eyes model promotion; lifecycle determines eligibility; EAIES independently authorizes execution.
          </div>
        </div>

        <div class="eaios-grid-authority">
          <!-- Visual Hierarchy Tree -->
          <div style="background: rgba(10, 11, 16, 0.85); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 10px; padding: 18px; font-family: monospace; font-size: 11.5px; line-height: 1.5;">
            <div style="text-align: center;">
              <div style="display: inline-block; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; padding: 5px 14px; border-radius: 6px; font-weight: 700;">
                Human Governance (Lifecycle, Ed25519 Attestations & Policy)
              </div>
            </div>
            <div style="text-align: center; color: #64748b; font-size: 10px; margin: 2px 0;">
              │ manages identity, model registry & capability bindings
            </div>
            <div style="text-align: center; color: #64748b;">▼</div>
            <div style="display: flex; justify-content: space-around; gap: 8px; margin: 4px 0;">
              <div style="flex: 1; background: rgba(167, 139, 250, 0.1); border: 1px solid rgba(167, 139, 250, 0.3); border-radius: 6px; padding: 6px 8px; text-align: center;">
                <div style="color: #c084fc; font-weight: 700; font-size: 10.5px;">AI Employee Identity</div>
                <div style="color: #94a3b8; font-size: 9.5px;">Lifecycle Eligibility</div>
              </div>
              <div style="flex: 1; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 6px 8px; text-align: center;">
                <div style="color: #38bdf8; font-weight: 700; font-size: 10.5px;">Model & Capability Binding</div>
                <div style="color: #94a3b8; font-size: 9.5px;">Risk & Residency Eligibility</div>
              </div>
            </div>
            <div style="text-align: center; color: #34d399; font-size: 10px; margin: 2px 0;">
              │ eligibility & risk inputs
            </div>
            <div style="text-align: center; color: #34d399;">▼</div>
            <div style="text-align: center; margin: 4px 0;">
              <div style="display: inline-block; background: rgba(16, 185, 129, 0.2); border: 2px solid #10b981; color: #34d399; padding: 7px 18px; border-radius: 8px; font-weight: 800; font-size: 12.5px;">
                EAIES • EXECUTION AUTHORIZATION
              </div>
            </div>
            <div style="text-align: center; color: #38bdf8; font-size: 10px; margin: 2px 0;">
              │ authorizes capability invocation, fallback & compensation
            </div>
            <div style="text-align: center; color: #38bdf8;">▼</div>
            <div style="text-align: center;">
              <div style="display: inline-block; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; padding: 5px 14px; border-radius: 6px; font-weight: 700; font-size: 10.5px;">
                Dynamic Fallback, Outbox & Saga Gateway (ADR-039–046)
              </div>
            </div>
          </div>

          <!-- Role Authority Breakdown -->
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
            <div style="background: rgba(10, 11, 16, 0.7); border-radius: 6px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: monospace; font-weight: 800; color: #cbd5e1;">MODEL</span>
              <span style="color: #94a3b8;">unprivileged cognitive compute target</span>
            </div>
            <div style="background: rgba(10, 11, 16, 0.7); border-radius: 6px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: monospace; font-weight: 800; color: #cbd5e1;">AI EMPLOYEE</span>
              <span style="color: #94a3b8;">coordinates assigned work items</span>
            </div>
            <div style="background: rgba(10, 11, 16, 0.7); border-radius: 6px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: monospace; font-weight: 800; color: #cbd5e1;">ORCHESTRATOR</span>
              <span style="color: #94a3b8;">evaluates DAG dependencies & Sagas</span>
            </div>
            <div style="background: rgba(10, 11, 16, 0.7); border-radius: 6px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: monospace; font-weight: 800; color: #cbd5e1;">HUMAN APPROVAL</span>
              <span style="color: #94a3b8;">changes workflow state & signs Ed25519 attestations</span>
            </div>
            <div style="background: rgba(10, 11, 16, 0.7); border-radius: 6px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: monospace; font-weight: 800; color: #cbd5e1;">FALLBACK / EGRESS</span>
              <span style="color: #94a3b8;">executes substitution under per-attempt EAIES lease</span>
            </div>
            <div style="background: rgba(10, 11, 16, 0.7); border-radius: 6px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: monospace; font-weight: 800; color: #cbd5e1;">WORKER</span>
              <span style="color: #94a3b8;">executes physical task under bounded lease</span>
            </div>
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 8px 12px; color: #f87171; font-weight: 700; font-size: 11px; text-align: center;">
              NONE OF THESE ACTORS GRANT THEMSELVES AUTHORITY.
            </div>
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 5. STAGE 26: FOUNDATION MODEL REGISTRY & DYNAMIC FALLBACK PIPELINES -->
      <!-- ================================================================= -->
      <div class="eaios-section-card eaios-info-card" style="border-left: 4px solid #10b981;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 800; color: #10b981; text-transform: uppercase;">
              <span>★</span> STAGE 26 FROZEN ARCHITECTURE (ADR-043–046)
            </div>
            <h2 style="font-size: 18px; font-weight: 800; color: #f8fafc; margin: 2px 0 0 0;">
              Governed Foundation Model Registry, Risk Tiering & Dynamic Provider Fallback
            </h2>
          </div>
          <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">
            STAGE 26 FROZEN • 965 / 965 TESTS
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
          <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
            <div style="font-size: 13px; font-weight: 800; color: #38bdf8; margin-bottom: 4px;">Model Registry & Risk Tiering (ADR-046)</div>
            <div style="font-size: 11.5px; color: #cbd5e1; line-height: 1.45;">
              Authoritative model definition catalog with risk tiers (Minimal, Limited, High, Critical), residency constraints (EU, US, UK, On-Premise), and Ed25519 Four-Eyes cryptographic attestation.
            </div>
          </div>
          <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
            <div style="font-size: 13px; font-weight: 800; color: #fbbf24; margin-bottom: 4px;">Dynamic Fallback & Substitution (ADR-046)</div>
            <div style="font-size: 11.5px; color: #cbd5e1; line-height: 1.45;">
              Deterministic 7-stage candidate resolution with per-attempt UUID tracking, fresh EAIES gate evaluation, budget pre-reservation, and fail-closed UNKNOWN halting on non-idempotent tasks.
            </div>
          </div>
          <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
            <div style="font-size: 13px; font-weight: 800; color: #ec4899; margin-bottom: 4px;">Incident Quarantine & Timers (ADR-043/045)</div>
            <div style="font-size: 11.5px; color: #cbd5e1; line-height: 1.45;">
              Durable timers in PostgreSQL, systemic incident blast-radius quarantine, and backward DAG saga compensation executed under sovereign EAIES authority.
            </div>
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 6. SIX MAJOR ARCHITECTURAL LAYERS                                 -->
      <!-- ================================================================= -->
      <div class="eaios-section-card eaios-info-card">
        <div style="margin-bottom: 16px;">
          <h2 style="font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0 0 4px 0;">
            The Six Major Architectural Layers
          </h2>
          <div style="font-size: 12.5px; color: #94a3b8;">
            A structured mental model of the EAIOS governance and execution architecture up to Stage 26.
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px;">
          ${EAIOS_ARCH_LAYERS.map(l => `
            <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 14px; font-weight: 800; color: #f8fafc;">${l.num}. ${l.title}</span>
                  <span style="font-size: 10px; font-weight: 800; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 2px 6px; border-radius: 4px;">LAYER ${l.num}</span>
                </div>
                <div style="font-size: 12px; color: #cbd5e1; line-height: 1.5; margin-bottom: 8px;">${l.desc}</div>
              </div>
              <div style="font-size: 11px; color: #10b981; font-weight: 600; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px;">
                ✓ ${l.highlight}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 7. CORE GOVERNANCE SUBSYSTEMS: RLS, COST, HITL & OUTBOX           -->
      <!-- ================================================================= -->
      <div class="eaios-grid-subsystems">

        <!-- SUBSYSTEM 1: POSTGRESQL & ENGINE-LEVEL RLS (ADR-030) -->
        <div class="eaios-section-card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h3 style="font-size: 15px; font-weight: 800; color: #f8fafc; margin: 0;">PostgreSQL & Engine-Level RLS</h3>
              <span style="font-size: 9.5px; font-weight: 800; color: #a78bfa; background: rgba(167, 139, 250, 0.15); padding: 2px 6px; border-radius: 3px; border: 1px solid rgba(167, 139, 250, 0.3);">
                ADR-030 • LIVE PG VERIFIED
              </span>
            </div>
            <p style="font-size: 12px; color: #cbd5e1; line-height: 1.5; margin: 0 0 10px 0;">
              PostgreSQL provides the durable transactional substrate for state consistency and OCC. PostgreSQL RLS enforces tenant isolation using transaction-scoped tenant context (<code>SET LOCAL app.current_tenant_id</code>). RLS is not the policy authority.
            </p>

            <div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
              <button id="eaios-btn-rls-gwm" onclick="window.switchEaiosTenant('GLOBAL-WEALTH-MANAGEMENT')" class="eaios-sim-action-btn" style="flex: 1; min-width: 140px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #38bdf8; padding: 7px; border-radius: 4px; font-size: 11px; font-weight: 700;">
                Tenant: GLOBAL-WEALTH-MANAGEMENT
              </button>
              <button id="eaios-btn-rls-iib" onclick="window.switchEaiosTenant('INSTITUTIONAL-INVESTMENT-BANKING')" class="eaios-sim-action-btn" style="flex: 1; min-width: 140px; background: #0f172a; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.15); padding: 7px; border-radius: 4px; font-size: 11px; font-weight: 700;">
                Tenant: INSTITUTIONAL-INVESTMENT-BANKING
              </button>
            </div>

            <div id="eaios-rls-output" class="eaios-info-card" style="background: rgba(10, 11, 16, 0.8); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; padding: 10px; font-family: monospace; font-size: 10.5px; min-height: 70px; color: #cbd5e1;">
              <div style="color: #64748b;">// Active session tenant:</div>
              <div style="color: #38bdf8; font-weight: 700;">app.current_tenant_id = 'GLOBAL-WEALTH-MANAGEMENT'</div>
              <div style="color: #10b981; margin-top: 4px;">✓ Returned: "Q3 Statutory Solvency & Capital Reserves" (1 row)</div>
            </div>
          </div>
          <div style="font-size: 10px; color: #a78bfa; margin-top: 10px; text-align: right;">
            PostgreSQL cannot make external provider calls transactional; EAIOS uses Transactional Outbox.
          </div>
        </div>

        <!-- SUBSYSTEM 2: RESOURCE & COST GOVERNANCE (ADR-022) -->
        <div class="eaios-section-card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h3 style="font-size: 15px; font-weight: 800; color: #f8fafc; margin: 0;">Resource & Cost Governance</h3>
              <span style="font-size: 9.5px; font-weight: 800; color: #34d399; background: rgba(16, 185, 129, 0.15); padding: 2px 6px; border-radius: 3px; border: 1px solid rgba(16, 185, 129, 0.3);">
                ADR-022 / ADR-046 • TEST VERIFIED
              </span>
            </div>
            <p style="font-size: 12px; color: #cbd5e1; line-height: 1.5; margin: 0 0 10px 0;">
              Policy → Reservation → Provider Invocation → Usage / Outcome → Settlement → Audit. Mandatory pre-reservation prevents overrun. <em>Provider timeout does not imply zero consumption.</em>
            </p>

            <div class="eaios-info-card" style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
              <span>Total Quota: <strong style="color: #f8fafc;">10,000 Tokens</strong></span>
              <span id="eaios-budget-remaining">Available: <strong style="color: #34d399;">7,150</strong></span>
            </div>

            <div class="eaios-info-card" style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-bottom: 12px;">
              <div id="eaios-budget-bar" style="width: 71.5%; height: 100%; background: #10b981; transition: width 0.3s;"></div>
            </div>

            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button id="eaios-btn-deny-budget" onclick="window.simulateEaiosBudget()" class="eaios-sim-action-btn" style="flex: 1; min-width: 140px; background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 7px; border-radius: 4px; font-size: 11px; font-weight: 700;">
                ⚡ Test Spend Deny (8.5k Tokens)
              </button>
              <button id="eaios-btn-provider-timeout" onclick="window.simulateEaiosTimeout()" class="eaios-sim-action-btn" style="flex: 1; min-width: 140px; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); padding: 7px; border-radius: 4px; font-size: 11px; font-weight: 700;">
                ⚡ Simulate Timeout (Unknown)
              </button>
            </div>
          </div>
          <div id="eaios-provider-timeout-box" style="display: none;"></div>
          <div style="font-size: 10px; color: #10b981; margin-top: 10px; text-align: right;">
            Distinguishes Rate Limits, Quotas, Budgets, Reservations, and Cost Accounting.
          </div>
        </div>

      </div>

      <!-- ================================================================= -->
      <!-- 8. EXPLORE THE ARCHITECTURE: INTERACTIVE SCENARIOS & DAG FRONTIER  -->
      <!-- ================================================================= -->
      <div class="eaios-section-card">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 16px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0 0 4px 0;">
              Explore the Architecture — Interactive Scenarios
            </h2>
            <div style="font-size: 12px; color: #94a3b8;">
              Test how EAIOS executes autonomous pipelines, enforces Four-Eyes gates, executes reverse DAG compensation, and manages dynamic provider fallback.
            </div>
          </div>
          <div role="tablist" aria-label="EAIOS Architectural Scenarios" style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button id="eaios-scenario-btn-a" onclick="window.selectEaiosScenario('scenario_a')" role="tab" aria-selected="true" tabindex="0" class="eaios-scen-btn active">
              Scenario A: Autonomous
            </button>
            <button id="eaios-scenario-btn-b" onclick="window.selectEaiosScenario('scenario_b')" role="tab" aria-selected="false" tabindex="0" class="eaios-scen-btn">
              Scenario B: HITL Approval
            </button>
            <button id="eaios-scenario-btn-c" onclick="window.selectEaiosScenario('scenario_c')" role="tab" aria-selected="false" tabindex="0" class="eaios-scen-btn">
              Scenario C: Rejection & Compensation
            </button>
            <button id="eaios-scenario-btn-d" onclick="window.selectEaiosScenario('scenario_d')" role="tab" aria-selected="false" tabindex="0" class="eaios-scen-btn">
              Scenario D: Governed Knowledge
            </button>
          </div>
        </div>

        <!-- Active Scenario Description Banner -->
        <div id="eaios-active-scenario-card" class="eaios-info-card" style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 8px; padding: 14px 18px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span id="eaios-scen-title" style="font-weight: 800; font-size: 14px; color: #f8fafc;">${SHOWCASE_SCENARIOS.SCENARIO_A.name}</span>
                <span style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.35); padding: 1px 6px; border-radius: 3px; font-size: 9.5px; font-weight: 800;">
                  INTERACTIVE SIMULATION
                </span>
              </div>
              <div id="eaios-scen-subtitle" style="font-size: 12px; color: #38bdf8; margin-top: 2px;">${SHOWCASE_SCENARIOS.SCENARIO_A.subtitle}</div>
              <div id="eaios-scen-desc" style="font-size: 11.5px; color: #cbd5e1; margin-top: 6px; line-height: 1.45;">${SHOWCASE_SCENARIOS.SCENARIO_A.description}</div>
            </div>
            <div style="text-align: right;">
              <span id="eaios-scen-evid" style="font-size: 10.5px; color: #a78bfa; font-family: monospace; background: rgba(167, 139, 250, 0.1); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(167, 139, 250, 0.25);">
                ${SHOWCASE_SCENARIOS.SCENARIO_A.evidenceRef}
              </span>
            </div>
          </div>
        </div>

        <!-- Controls Action Row -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button id="eaios-btn-run" onclick="window.runEaiosScenario()" class="eaios-btn-primary" aria-label="Run selected simulation scenario">
              ▶ Run Selected Scenario
            </button>
            <button id="eaios-btn-reset" onclick="window.resetEaiosSimulation()" class="eaios-btn-secondary" aria-label="Reset simulation state">
              Reset
            </button>
          </div>
          <div style="display: flex; gap: 10px; font-size: 11px; color: #94a3b8; align-items: center; flex-wrap: wrap;">
            <span>Correlation ID: <code style="color: #38bdf8;">CORR-2026-000741</code></span>
            <span>•</span>
            <span>Outbox Coupling: <strong style="color: #10b981;">ADR-039 (PostgreSQL Atomic)</strong></span>
          </div>
        </div>

        <!-- HUMAN APPROVAL INTERACTIVE OPERATOR BANNER (ADR-032) -->
        <div id="eaios-approval-banner" style="display: none; margin-bottom: 16px; background: rgba(245, 158, 11, 0.12); border: 2px dashed #f59e0b; border-radius: 8px; padding: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
            <div style="flex: 1; min-width: 280px;">
              <div style="display: inline-flex; align-items: center; gap: 6px; color: #fbbf24; font-weight: 800; font-size: 13.5px;">
                <span>⚠️</span>
                <span>WORKFLOW PAUSED: Human Governance Decision Gate (ADR-032 / PG Test P1)</span>
              </div>
              <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px; line-height: 1.45;">
                State: <code>PAUSED_PENDING_INPUT</code>. Work Owner: <code style="color: #38bdf8;">alice@enterprise.example</code>.
                Four-Eyes rule mandates that the work owner cannot approve high-impact actions. Resumption transitions workflow state and requires fresh EAIES execution authorization.
              </div>

              <!-- Interactive Form Inputs -->
              <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-top: 12px;">
                <div>
                  <label for="eaios-operator-select" style="font-size: 10.5px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Approver Identity:</label>
                  <select id="eaios-operator-select" style="width: 100%; background: #0f172a; color: #f8fafc; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 7px 10px; font-size: 11.5px; margin-top: 3px; cursor: pointer;">
                    <option value="bob@enterprise.example">bob@enterprise.example (Authorized Approver)</option>
                    <option value="alice@enterprise.example">alice@enterprise.example (Work Owner - Test 4-Eyes Deny)</option>
                  </select>
                </div>
                <div>
                  <label for="eaios-operator-rationale" style="font-size: 10.5px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Decision Rationale (Mandatory):</label>
                  <input type="text" id="eaios-operator-rationale" value="Approved for production run after secondary audit." style="width: 100%; background: #0f172a; color: #f8fafc; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 7px 10px; font-size: 11.5px; margin-top: 3px;" />
                </div>
              </div>
            </div>

            <!-- Decision Action Buttons -->
            <div style="display: flex; flex-direction: column; gap: 8px; min-width: 170px; margin-top: 10px;">
              <button id="eaios-btn-approve-action" onclick="window.submitEaiosDecision('APPROVE')" class="eaios-sim-action-btn" style="background: #10b981; color: white; border: 1px solid #34d399; padding: 9px 16px; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);">
                ✓ APPROVE & RESUME
              </button>
              <button id="eaios-btn-reject-action" onclick="window.submitEaiosDecision('REJECT')" class="eaios-sim-action-btn" style="background: #ef4444; color: white; border: 1px solid #f87171; padding: 9px 16px; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.35);">
                ✗ REJECT & COMPENSATE
              </button>
            </div>
          </div>
        </div>

        <!-- DAG TOPOLOGY & LIVE INSPECTOR -->
        <div class="eaios-grid-dag">
          <!-- DAG TOPOLOGY VIEWER -->
          <div style="display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 6px;">
              <div style="font-size: 14px; font-weight: 800; color: #f8fafc;">Governed DAG Execution Frontier</div>
              <div class="eaios-info-card" style="display: flex; gap: 6px; font-size: 10px; align-items: center; flex-wrap: wrap;">
                <span style="display: inline-flex; align-items: center; gap: 3px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #64748b;"></span> PENDING</span>
                <span style="display: inline-flex; align-items: center; gap: 3px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #8b5cf6;"></span> EXECUTING</span>
                <span style="display: inline-flex; align-items: center; gap: 3px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #f59e0b;"></span> PAUSED</span>
                <span style="display: inline-flex; align-items: center; gap: 3px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #10b981;"></span> COMPLETED</span>
                <span style="display: inline-flex; align-items: center; gap: 3px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #ec4899;"></span> COMPENSATED</span>
                <span style="display: inline-flex; align-items: center; gap: 3px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #475569;"></span> SKIPPED</span>
              </div>
            </div>

            <div id="eaios-dag-container" style="flex: 1; min-height: 380px; background: rgba(10, 11, 16, 0.8); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; overflow: hidden; position: relative;">
              <!-- SVG / Mobile DOM DAG rendered dynamically by EaiosRenderer -->
            </div>
          </div>

          <!-- LIVE STATE, EAIES & GOVERNANCE INSPECTOR -->
          <div class="eaios-info-card" style="display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <div style="font-size: 14px; font-weight: 800; color: #f8fafc;">Sovereign Node & Authority Inspector</div>
              <span style="font-size: 10px; color: #38bdf8; font-family: monospace; background: rgba(56, 189, 248, 0.1); padding: 2px 6px; border-radius: 4px;">
                H-01 SOVEREIGN
              </span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 10px;">Real-time inspection of active worker leases and EAIES policy decisions</div>

            <div id="eaios-inspector-content" style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
              <!-- Dynamically populated in updateInspector() -->
            </div>
          </div>
        </div>

        <!-- AUDIT EVENT STREAM -->
        <div style="margin-top: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px;">
            <div style="font-size: 14px; font-weight: 800; color: #f8fafc;">Enterprise Forensic Audit Stream (ADR-026 / ADR-039 / ADR-046)</div>
            <span style="font-size: 10px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 8px; border-radius: 4px; font-weight: 700;">
              Causal Root: CORR-2026-000741
            </span>
          </div>

          <div id="eaios-audit-log" style="height: 180px; overflow-y: auto; background: rgba(10, 11, 16, 0.9); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 11px; display: flex; flex-direction: column; gap: 6px;">
            <div style="color: #64748b; text-align: center; padding-top: 70px;">Awaiting workflow execution event stream...</div>
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 9. WHAT IS ACTUALLY PROVEN? (EVIDENCE TAXONOMY & AUDIT RESULTS)   -->
      <!-- ================================================================= -->
      <div class="eaios-section-card eaios-info-card">
        <div style="margin-bottom: 14px;">
          <h2 style="font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0 0 4px 0;">
            What is Actually Proven?
          </h2>
          <div style="font-size: 12.5px; color: #94a3b8;">
            EAIOS strictly distinguishes formal architectural properties, automated test suites, live PostgreSQL validation, and browser simulations.
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
          ${Object.values(EVIDENCE_BADGES).map(b => `
            <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid ${b.border}; border-radius: 8px; padding: 14px;">
              <span style="background: ${b.bg}; color: ${b.color}; border: 1px solid ${b.border}; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 10.5px;">
                ${b.label}
              </span>
              <div style="font-size: 11.5px; color: #cbd5e1; margin-top: 8px; line-height: 1.45;">
                ${b.description}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 10. 26 CORE ARCHITECTURAL INVARIANTS                              -->
      <!-- ================================================================= -->
      <div class="eaios-section-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; flex-wrap: wrap; gap: 10px;">
          <h2 style="font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0;">
            26 Core Architectural Invariants
          </h2>
          <span style="font-size: 11px; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 3px 10px; border-radius: 4px; font-weight: 700;">
            Formal Verification Layer (965 Tests Passed)
          </span>
        </div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 16px;">
          Core governance guarantees verified across EAIOS architecture through Stage 26. Click any card to inspect full invariant proof.
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px;">
          ${CORE_INVARIANTS.map(inv => `
            <div class="eaios-explorable-card eaios-inv-card" onclick="window.openEaiosModal('INVARIANT', '${inv.id}')" data-inv-id="${inv.id}" role="button" tabindex="0" aria-label="View details for Invariant ${inv.id}: ${inv.title}">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                  <span style="font-weight: 800; font-size: 12.5px; color: #38bdf8;">${inv.id}. ${inv.title}</span>
                  <span style="font-size: 9px; color: #10b981; font-weight: 800; background: rgba(16, 185, 129, 0.15); padding: 2px 6px; border-radius: 3px; border: 1px solid rgba(16, 185, 129, 0.3);">
                    ${inv.adrRef}
                  </span>
                </div>
                <div style="font-size: 11px; color: #cbd5e1; margin-top: 6px; line-height: 1.45;">${inv.rule}</div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
                <span style="font-size: 9.5px; color: #64748b; text-transform: uppercase;">${inv.evidenceBadge}</span>
                <span style="font-size: 11px; color: #38bdf8; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">View details <span style="font-size: 13px;">→</span></span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 11. ADR & ARCHITECTURE EXPLORER (CANONICAL ADRS)                  -->
      <!-- ================================================================= -->
      <div class="eaios-section-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; flex-wrap: wrap; gap: 10px;">
          <h2 style="font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0;">
            Architectural Decision Record (ADR) Explorer
          </h2>
          <span style="font-size: 11px; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 3px 10px; border-radius: 4px; font-weight: 700;">
            Canonical ADRs (ADR-001 to ADR-046)
          </span>
        </div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 16px;">
          Formal decisions governing execution authority, multi-tenant isolation, lifecycle, transactional outbox/inbox, model registries, and provider fallback. Click any card to inspect full decision details.
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px;">
          ${ADR_EXPLORER_CATALOG.map(adr => `
            <div class="eaios-explorable-card eaios-adr-card" onclick="window.openEaiosModal('ADR', '${adr.id}')" data-adr-id="${adr.id}" role="button" tabindex="0" aria-label="View architectural decision for ${adr.id}: ${adr.title}">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="font-family: monospace; font-size: 11.5px; font-weight: 800; color: #38bdf8;">${adr.id}</span>
                  <span style="font-size: 9px; font-weight: 800; color: #a78bfa; background: rgba(167, 139, 250, 0.15); padding: 1px 5px; border-radius: 3px;">${adr.category}</span>
                </div>
                <div style="font-size: 12.5px; font-weight: 700; color: #f8fafc; margin-bottom: 6px;">${adr.title}</div>
                <div style="font-size: 11px; color: #cbd5e1; line-height: 1.4; margin-bottom: 6px;">${adr.decision}</div>
                <div style="font-size: 10.5px; color: #94a3b8; line-height: 1.35; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 6px;">
                  <strong style="color: #fbbf24;">Authority Implication:</strong> ${adr.authorityImplication}
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
                <span style="font-size: 9.5px; color: #64748b; text-transform: uppercase;">${adr.evidenceBadge}</span>
                <span style="font-size: 11px; color: #38bdf8; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">View details <span style="font-size: 13px;">→</span></span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 12. ARCHITECTURAL EVOLUTION (STAGES 1 TO 26 FROZEN)              -->
      <!-- ================================================================= -->
      <div class="eaios-section-card eaios-info-card">
        <div style="font-size: 18px; font-weight: 800; color: #f8fafc; margin-bottom: 4px;">
          EAIOS Architectural Evolution
        </div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 16px;">
          Progression of formal verification across execution kernel, resilience, tenancy, HITL governance, Transactional Outbox, Inbound Integrations, Sagas, Dynamic Policy Lifecycle, and Stage 26 Governed Model Registry & Fallback.
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${STAGE_MATURITY_TIMELINE.map(stg => `
            <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid ${stg.status === 'FROZEN BASELINE' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(56, 189, 248, 0.2)'}; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-family: monospace; font-size: 11px; font-weight: 800; color: ${stg.status === 'FROZEN BASELINE' ? '#34d399' : '#38bdf8'}; background: rgba(56, 189, 248, 0.12); padding: 2px 8px; border-radius: 4px;">
                    ${stg.stage}
                  </span>
                  <span style="font-weight: 700; font-size: 13px; color: #f8fafc;">${stg.title}</span>
                </div>
                <div style="font-size: 11.5px; color: #94a3b8; margin-top: 4px;">${stg.focus}</div>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <span style="font-size: 10.5px; color: ${stg.status === 'FROZEN BASELINE' ? '#34d399' : '#10b981'}; font-family: monospace; background: rgba(16, 185, 129, 0.1); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3);">
                  ${stg.evidence}
                </span>
                <span style="font-size: 9.5px; font-weight: 800; color: ${stg.status === 'FROZEN BASELINE' ? '#34d399' : '#38bdf8'}; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 3px;">
                  ${stg.status}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 13. ACCESSIBLE DETAIL MODAL (ADR & INVARIANTS EXPLORER)           -->
      <!-- ================================================================= -->
      <div id="eaios-detail-modal" class="modal-overlay hidden" role="dialog" aria-modal="true" style="display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(4px); z-index: 99999; justify-content: center; align-items: center; padding: 20px;">
        <div style="background: #0d1322; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 12px; width: 100%; max-width: 620px; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8); overflow: hidden; display: flex; flex-direction: column;">
          <!-- Modal Header -->
          <div style="padding: 16px 20px; background: rgba(15, 23, 42, 0.9); border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span id="eaios-modal-badge" style="font-family: monospace; font-size: 11.5px; font-weight: 800; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.3);">
                ADR-000
              </span>
              <h2 id="eaios-modal-title" style="font-size: 15px; font-weight: 800; color: #f8fafc; margin: 0;">
                Architectural Detail
              </h2>
            </div>
            <button id="eaios-modal-close-btn" onclick="window.closeEaiosModal()" aria-label="Close details" style="background: transparent; border: none; color: #94a3b8; font-size: 20px; font-weight: 700; cursor: pointer; padding: 0 4px; line-height: 1; transition: color 0.15s ease;">
              &times;
            </button>
          </div>

          <!-- Modal Body -->
          <div id="eaios-modal-body" style="padding: 20px; overflow-y: auto; max-height: 60vh; font-size: 12.5px; line-height: 1.55; color: #cbd5e1; display: flex; flex-direction: column; gap: 14px;">
            <!-- Populated dynamically -->
          </div>

          <!-- Modal Footer -->
          <div style="padding: 12px 20px; background: rgba(15, 23, 42, 0.6); border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: flex-end;">
            <button id="eaios-modal-footer-close" onclick="window.closeEaiosModal()" class="eaios-btn-secondary" style="font-size: 12px; padding: 6px 16px;">
              Close
            </button>
          </div>
        </div>
      </div>

    </div>
  `;
}

function initializeComponents() {
  const dagContainer = document.getElementById('eaios-dag-container');
  renderer = new EaiosRenderer(dagContainer, {
    onNodeSelect: (node) => {
      if (simManager) {
        simManager.selectNode(node.id);
      }
      updateInspector(node);
    }
  });

  const auditLog = document.getElementById('eaios-audit-log');
  simManager = new EaiosSimulationManager(renderer, auditLog, (state) => {
    // The constructor calls reset() before `simManager` is assigned — skip until ready.
    if (!simManager) return;
    // Keep inspector updated during simulation
    const currentNodes = simManager.getCurrentNodes();
    let inspectedNode = null;
    if (state.selectedNodeId) {
      inspectedNode = currentNodes.find(n => n.id === state.selectedNodeId);
    }
    if (!inspectedNode) {
      inspectedNode = currentNodes.find(n => state.nodeStates[n.id]?.status === 'EXECUTING' || state.nodeStates[n.id]?.status === 'PAUSED_PENDING_INPUT' || state.nodeStates[n.id]?.status === 'COMPENSATED');
    }
    if (inspectedNode) {
      updateInspector({ ...inspectedNode, ...state.nodeStates[inspectedNode.id] });
    }

    // Budget UI update
    const budgetEl = document.getElementById('eaios-budget-remaining');
    const budgetBar = document.getElementById('eaios-budget-bar');
    if (budgetEl && budgetBar && state.budgetState) {
      budgetEl.innerHTML = `Available: <strong style="color: #34d399;">${state.budgetState.remaining.toLocaleString()}</strong>`;
      const pct = (state.budgetState.remaining / state.budgetState.totalBudget) * 100;
      budgetBar.style.width = `${pct}%`;
    }
  });

  // Handle window resize for dynamic responsive layout rerendering
  window.addEventListener('resize', () => {
    if (simManager && renderer) {
      renderer.render(simManager.getCurrentNodes(), simManager.nodeStates, simManager.selectedNodeId);
    }
  });

  // Initial render
  simManager.reset();
  const initialNodes = simManager.getCurrentNodes();
  if (initialNodes && initialNodes[0]) {
    updateInspector(initialNodes[0]);
  }

  // Modal ESC key listener
  window.addEventListener('keydown', (e) => {
    const modal = document.getElementById('eaios-detail-modal');
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
      window.closeEaiosModal();
    }
  });
}

function updateInspector(node) {
  const container = document.getElementById('eaios-inspector-content');
  if (!container || !node) return;

  const statusColors = {
    PENDING: '#94a3b8',
    READY: '#06b6d4',
    EXECUTING: '#8b5cf6',
    RUNNING: '#8b5cf6',
    PAUSED_PENDING_INPUT: '#f59e0b',
    PAUSED: '#f59e0b',
    COMPLETED: '#10b981',
    FAILED: '#ef4444',
    REJECTED: '#ef4444',
    COMPENSATED: '#ec4899',
    SKIPPED: '#64748b'
  };

  const status = node.status || 'PENDING';
  const color = statusColors[status] || '#94a3b8';
  const activeTenant = simManager?.tenantContext?.activeTenantId || 'GLOBAL-WEALTH-MANAGEMENT';

  container.innerHTML = `
    <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 14px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span style="font-size: 10px; font-weight: 800; color: #38bdf8; text-transform: uppercase;">${(node.category || 'node').replace('_', ' ')}</span>
          <h3 style="font-size: 14px; font-weight: 700; color: #f8fafc; margin: 2px 0 0 0;">${node.name}</h3>
        </div>
        <span style="font-size: 9.5px; font-weight: 800; padding: 2px 8px; border-radius: 4px; background: ${color}20; color: ${color}; border: 1px solid ${color}50; cursor: default;">
          ${status}
        </span>
      </div>
      <div style="font-size: 11px; color: #cbd5e1; margin-top: 6px; line-height: 1.4;">${node.description || 'DAG execution node.'}</div>
    </div>

    <!-- EAIES AUTHORITY CHECK PANEL -->
    <div style="background: rgba(10, 11, 16, 0.85); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; padding: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div style="font-size: 10.5px; text-transform: uppercase; color: #38bdf8; font-weight: 800;">EAIES Sovereign Gate Check</div>
        <span style="font-size: 9.5px; font-weight: 800; padding: 2px 6px; border-radius: 3px; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); cursor: default;">
          POLICY & RESIDENCY VALIDATED
        </span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
        <div><span style="color: #64748b;">Target Identity:</span> <code style="color: #a78bfa;">${node.employeeId || 'N/A (System)'}</code></div>
        <div><span style="color: #64748b;">Capability ID:</span> <code style="color: #38bdf8;">${node.capabilityId || 'N/A'}</code></div>
        <div><span style="color: #64748b;">Required Scope:</span> <code style="color: #34d399;">${node.authorityScope || 'orchestrator_internal'}</code></div>
        <div><span style="color: #64748b;">Tenant Binding:</span> <code style="color: #fbbf24;">${activeTenant} (Engine RLS)</code></div>
        <div><span style="color: #64748b;">Model Risk Tier:</span> <code style="color: #38bdf8;">MINIMAL / LIMITED (ADR-046)</code></div>
      </div>
    </div>

    <!-- DURABLE STATE & OCC -->
    <div style="background: rgba(10, 11, 16, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px;">
      <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px;">Durable State & Outbox Intent</div>
      <div style="font-size: 11px; color: #94a3b8;">Worker Lease: <span style="color: #cbd5e1;">${status === 'EXECUTING' ? (node.workerBadge || 'worker [ACTIVE]') : 'Released / Unclaimed'}</span></div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">OCC Entity Version: <code style="color: #38bdf8;">v${node.version || 1}</code></div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Outbox Coupling: <code style="color: #10b981;">ADR-039 (PostgreSQL Atomic)</code></div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Correlation: <code style="color: #38bdf8;">CORR-2026-000741</code></div>
    </div>
  `;
}
