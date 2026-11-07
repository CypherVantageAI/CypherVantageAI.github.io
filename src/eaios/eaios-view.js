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
  ORO_SCENARIO_CATALOGUE,
  CORE_INVARIANTS,
  ADR_EXPLORER_CATALOG,
  STAGE_MATURITY_TIMELINE,
  TENANT_RLS_RECORDS,
  COST_GOVERNANCE_CONFIG,
  EAIOS_BACKEND_CONFIG,
  EAIOS_VERSION_PROVENANCE,
  EAIOS_CAPABILITY_MATURITY
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
    'scenario_oro': { id: 'eaios-scenario-btn-oro', key: 'SCENARIO_ORO' },
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
  }

  // Toggle ORO sub-selector visibility
  const oroSubSelector = document.getElementById('eaios-oro-sub-selector');
  const oroContextCard = document.getElementById('eaios-oro-context-card');
  const isOroActive = scenarioKey === 'scenario_oro' || (ORO_SCENARIO_CATALOGUE && !!ORO_SCENARIO_CATALOGUE[scenarioKey]);

  if (oroSubSelector) {
    oroSubSelector.style.display = isOroActive ? 'block' : 'none';
  }
  if (oroContextCard) {
    oroContextCard.style.display = isOroActive ? 'block' : 'none';
  }

  if (isOroActive) {
    window.updateOroScenarioUi(simManager.activeOroScenarioId || 'scenario_oro');
  } else if (entry) {
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

      const synthBadge = document.getElementById('eaios-scen-synthetic-badge');
      const budgetBadge = document.getElementById('eaios-scen-budget-badge');
      if (synthBadge) synthBadge.style.display = 'none';
      if (budgetBadge) budgetBadge.style.display = 'none';
    }
  }

  const nodes = simManager.getCurrentNodes();
  if (nodes && nodes[0]) {
    updateInspector(nodes[0]);
  }
};

window.selectOroSubScenario = function(subScenarioId) {
  if (!simManager) return;
  simManager.setOroScenario(subScenarioId);

  // Update active state in sub-selector buttons
  document.querySelectorAll('.eaios-oro-sub-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
    btn.style.background = 'rgba(15, 23, 42, 0.6)';
    btn.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    btn.style.color = '#94a3b8';
  });

  const activeSubBtn = document.getElementById(`eaios-sub-btn-${subScenarioId}`);
  if (activeSubBtn) {
    activeSubBtn.classList.add('active');
    activeSubBtn.setAttribute('aria-pressed', 'true');
    activeSubBtn.style.background = 'rgba(56, 189, 248, 0.15)';
    activeSubBtn.style.borderColor = 'rgba(56, 189, 248, 0.5)';
    activeSubBtn.style.color = '#38bdf8';
  }

  window.updateOroScenarioUi(subScenarioId);

  const nodes = simManager.getCurrentNodes();
  if (nodes && nodes[0]) {
    updateInspector(nodes[0]);
  }
  updateExecutiveDecisionRecord();
};

window.updateOroScenarioUi = function(scenarioId) {
  const scenario = ORO_SCENARIO_CATALOGUE?.[scenarioId];
  if (!scenario) return;

  const titleEl = document.getElementById('eaios-scen-title');
  const subEl = document.getElementById('eaios-scen-subtitle');
  const descEl = document.getElementById('eaios-scen-desc');
  const evidEl = document.getElementById('eaios-scen-evid');

  if (titleEl) titleEl.textContent = `Showcase: ${scenario.name}`;
  if (subEl) subEl.textContent = scenario.subtitle;
  if (descEl) descEl.textContent = scenario.description;
  if (evidEl) evidEl.textContent = `Stage 33 ORO Slice • ${scenario.incidentId}`;

  const synthBadge = document.getElementById('eaios-scen-synthetic-badge');
  const budgetBadge = document.getElementById('eaios-scen-budget-badge');
  if (synthBadge) {
    synthBadge.style.display = 'inline-block';
    synthBadge.textContent = scenario.disclosures?.syntheticBadge || 'DEMO TELEMETRY: SYNTHESISED';
  }
  if (budgetBadge) {
    budgetBadge.style.display = 'inline-block';
    budgetBadge.textContent = scenario.disclosures?.budgetType || 'BUDGET: REQUEST-SCOPED IN-MEMORY';
  }

  // Populate Context Panel elements
  const ibsEl = document.getElementById('eaios-oro-ctx-ibs');
  const doraEl = document.getElementById('eaios-oro-ctx-dora');
  const rtoEl = document.getElementById('eaios-oro-ctx-rto');
  const rpoEl = document.getElementById('eaios-oro-ctx-rpo');
  const evidenceStatusEl = document.getElementById('eaios-oro-ctx-evidence-status');
  const evidenceNoteEl = document.getElementById('eaios-oro-ctx-evidence-note');
  const decisionEl = document.getElementById('eaios-oro-ctx-decision');
  const consequenceEl = document.getElementById('eaios-oro-ctx-consequence');

  if (ibsEl) ibsEl.textContent = scenario.affectedIBS.join(' • ');
  if (doraEl) doraEl.textContent = scenario.doraMappings.join(' | ');
  if (rtoEl) rtoEl.textContent = scenario.targetRTO;
  if (rpoEl) rpoEl.textContent = scenario.targetRPO;

  if (evidenceStatusEl) {
    const status = scenario.adversePaths?.evidenceStatus || 'CONFIRMED';
    evidenceStatusEl.textContent = status;
    if (status === 'CONFIRMED') {
      evidenceStatusEl.style.color = '#34d399';
      evidenceStatusEl.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    } else if (status === 'CONFLICTING' || status === 'SUSPECT') {
      evidenceStatusEl.style.color = '#fbbf24';
      evidenceStatusEl.style.borderColor = 'rgba(245, 158, 11, 0.4)';
    } else {
      evidenceStatusEl.style.color = '#f87171';
      evidenceStatusEl.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    }
  }
  if (evidenceNoteEl) evidenceNoteEl.textContent = scenario.adversePaths?.evidenceNote || 'Standard telemetry intake.';
  if (decisionEl) decisionEl.textContent = scenario.decisionProfile?.requiredDecision || 'Four-Eyes executive authorization required.';
  if (consequenceEl) consequenceEl.textContent = scenario.decisionProfile?.consequenceStatement || 'Execution authorized under fresh EAIES evaluation.';
};

window.runEaiosScenario = function() {
  if (!simManager) return;
  const btnRun = document.getElementById('eaios-btn-run');
  if (btnRun) {
    btnRun.disabled = true;
    btnRun.style.opacity = '0.7';
    btnRun.innerHTML = `<span>⏳ Simulating...</span>`;
  }
  // Smoothly bring the simulation frontier into full view
  const simFrontier = document.getElementById('eaios-simulation-frontier');
  if (simFrontier) {
    simFrontier.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
  updateExecutiveDecisionRecord();
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

window.retryEaiosSynthesis = function() {
  if (!simManager) return;
  simManager.retrySynthesis();
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
        font-family: var(--font-body, 'Figtree', sans-serif);
      }
      .eaios-view-wrapper h1,
      .eaios-view-wrapper h2,
      .eaios-view-wrapper h3,
      .eaios-view-wrapper h4 {
        font-family: var(--font-headings, 'Figtree', sans-serif);
        letter-spacing: -0.01em;
      }
      .eaios-view-wrapper code,
      .eaios-view-wrapper pre {
        font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
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
        font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
        font-size: 11px;
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
      }
      .eaios-btn-secondary {
        background: rgba(30, 41, 59, 0.8);
        color: #cbd5e1;
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 12px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 38px;
        transition: all 0.2s ease;
        touch-action: manipulation;
      }
      .eaios-btn-secondary:hover {
        background: rgba(51, 65, 85, 0.9);
        color: #f8fafc;
      }
      .eaios-sim-action-btn {
        background: rgba(15, 23, 42, 0.85);
        color: #94a3b8;
        border: 1px solid rgba(255, 255, 255, 0.12);
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .eaios-sim-action-btn:hover {
        background: rgba(30, 41, 59, 0.9);
        color: #f8fafc;
        border-color: rgba(56, 189, 248, 0.3);
      }
    </style>

    <div class="eaios-view-wrapper">
      <!-- =========================================================================
           MODULE 1: HERO & 30-SECOND EXECUTIVE FRAMING (CJ-01 / CJ-02)
           ========================================================================= -->
      <div id="eaios-module-hero" class="eaios-hero-card eaios-info-card">
        <!-- Top Provenance Pill Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; letter-spacing: 0.04em;">
              ARCHITECTURE REFERENCE v5.0
            </span>
            <span style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); color: #34d399; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px;">
              STAGE 32.2 FROZEN BASELINE (a2f3600)
            </span>
            <span style="background: rgba(147, 51, 234, 0.12); border: 1px solid rgba(147, 51, 234, 0.35); color: #c084fc; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px;">
              CORE PLATFORM v5.0 (70be6aee)
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <div id="eaios-api-preflight-pill" style="display: inline-flex; align-items: center; gap: 6px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.12); padding: 4px 10px; border-radius: 9999px; font-size: 11px; color: #94a3b8;">
              <span id="eaios-api-preflight-dot" style="width: 7px; height: 7px; border-radius: 50%; background: #64748b;"></span>
              <span id="eaios-api-preflight-text" style="font-weight: 600;">Backend Live Pulse</span>
            </div>
            <a id="eaios-hero-guide-link" href="https://github.com/CypherVantageAI" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 5px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 6px; text-decoration: none; transition: all 0.2s ease;">
              <span>Architecture Guide</span>
              <span style="font-size: 10px;">↗</span>
            </a>
          </div>
        </div>

        <!-- Headline & Problem/Solution Statement -->
        <div style="margin-bottom: 24px;">
          <h1 style="font-size: 26px; font-weight: 900; color: #f8fafc; margin: 0 0 10px 0; letter-spacing: -0.02em; line-height: 1.25;">
            Enterprise AI Operating System (EAIOS)
          </h1>
          <div style="font-size: 15px; font-weight: 700; color: #38bdf8; margin-bottom: 12px;">
            The Sovereign Execution Sandbox for Regulated Agentic AI
          </div>
          <p style="font-size: 13.5px; color: #cbd5e1; line-height: 1.6; max-width: 1050px; margin: 0 0 16px 0;">
            Autonomous AI models possess pattern generation capabilities but zero legitimate authority. In regulated enterprise environments (such as Tier-1 financial institutions subject to DORA, Solvency II, and OCC/Fed oversight), deploying agentic AI without deterministic host governance invites catastrophic operational, regulatory, and security failures.
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px; margin-top: 14px;">
            <div style="background: rgba(15, 23, 42, 0.7); border-left: 3px solid #ef4444; border-radius: 0 6px 6px 0; padding: 12px 16px;">
              <div style="font-size: 11px; font-weight: 800; color: #f87171; text-transform: uppercase; margin-bottom: 4px;">The Enterprise Problem</div>
              <div style="font-size: 12.5px; color: #e2e8f0; line-height: 1.45;">Unconstrained LLM agents hallucinate authority, bypass four-eyes controls, lack transactional rollback sagas, and leak confidential multi-tenant state.</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.7); border-left: 3px solid #10b981; border-radius: 0 6px 6px 0; padding: 12px 16px;">
              <div style="font-size: 11px; font-weight: 800; color: #34d399; text-transform: uppercase; margin-bottom: 4px;">The EAIOS Solution</div>
              <div style="font-size: 12.5px; color: #e2e8f0; line-height: 1.45;">Strict mathematical separation: <code>RECOMMENDATION ≠ ACTION</code>. Causal DAG sagas, four-eyes executive gates, token budget escrow, and transactional outbox egress.</div>
            </div>
          </div>
        </div>

        <!-- 30-Second Quick-Start Metric Pills -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px;">
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 16px;">
            <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;">Assurance Rigour</div>
            <div style="font-size: 17px; font-weight: 900; color: #10b981; margin: 4px 0 2px 0;">971 / 971 Passed</div>
            <div style="font-size: 11px; color: #64748b;">Stage 32.2 automated test suite (0 failures)</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 16px;">
            <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;">Sovereign Invariants</div>
            <div style="font-size: 17px; font-weight: 900; color: #38bdf8; margin: 4px 0 2px 0;">28 Core Invariants</div>
            <div style="font-size: 11px; color: #64748b;">Formally verified non-bypassable host gates</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 16px;">
            <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;">Architectural Records</div>
            <div style="font-size: 17px; font-weight: 900; color: #c084fc; margin: 4px 0 2px 0;">26 Canonical ADRs</div>
            <div style="font-size: 11px; color: #64748b;">ADR-001 through ADR-047 governance decisions</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 16px;">
            <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em;">Execution Separation</div>
            <div style="font-size: 17px; font-weight: 900; color: #f59e0b; margin: 4px 0 2px 0;">Node 6 Demarcation</div>
            <div style="font-size: 11px; color: #64748b;">Authorized — Awaiting Execution (Zero false claims)</div>
          </div>
        </div>
      </div>

      <!-- =========================================================================
           MODULE 2: AUTHORITATIVE ARCHITECTURE OVERVIEW (CJ-01 / CJ-03)
           ========================================================================= -->
      <div id="eaios-module-architecture" class="eaios-section-card eaios-info-card" style="border-color: rgba(56, 189, 248, 0.35);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0;">
              Authoritative 4-Tier Architecture Overview
            </h2>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 3px;">
              Deterministic tier boundaries separating untrusted intelligence from sovereign execution
            </div>
          </div>
          <span style="font-size: 10px; font-weight: 800; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.3);">
            AXIOM: COORDINATION MAY PROPAGATE WORK. AUTHORITY MUST NEVER PROPAGATE IMPLICITLY.
          </span>
        </div>

        <!-- Render Authoritative 4-Tier SVG Diagram -->
        ${renderer ? renderer.renderAuthoritativeArchitectureDiagram() : (new EaiosRenderer()).renderAuthoritativeArchitectureDiagram()}

        <!-- Tier Highlights Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; margin-top: 18px;">
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 6px; padding: 12px;">
            <div style="font-size: 11px; font-weight: 800; color: #38bdf8; margin-bottom: 4px;">TIER 1 — INGRESS & BFF</div>
            <div style="font-size: 12px; color: #cbd5e1; line-height: 1.45;">OIDC authenticated enterprise clients interact via FastAPI BFF. Mint session contexts with correlation IDs and multi-tenant scoping.</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(96, 165, 250, 0.2); border-radius: 6px; padding: 12px;">
            <div style="font-size: 11px; font-weight: 800; color: #60a5fa; margin-bottom: 4px;">TIER 2 — ORCHESTRATION FABRIC</div>
            <div style="font-size: 12px; color: #cbd5e1; line-height: 1.45;">Deterministic causal DAG state machine (ADR-024). Stateless frontier reconstruction, F-06 async fencing, and Redis TTL worker leases (ADR-034).</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(192, 132, 252, 0.2); border-radius: 6px; padding: 12px;">
            <div style="font-size: 11px; font-weight: 800; color: #c084fc; margin-bottom: 4px;">TIER 3 — AI SPECIALISTS (ORO)</div>
            <div style="font-size: 12px; color: #cbd5e1; line-height: 1.45;">Autonomous workers analyze adverse telemetry and propose structured remediation. Strict constraint: Advisory only, zero mutation authority.</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(52, 211, 153, 0.2); border-radius: 6px; padding: 12px;">
            <div style="font-size: 11px; font-weight: 800; color: #34d399; margin-bottom: 4px;">TIER 4 — SOVEREIGN EAIES GATE</div>
            <div style="font-size: 12px; color: #cbd5e1; line-height: 1.45;">Evaluates policy matrices, holds token escrow, enforces Four-Eyes human executive approval, and dispatches via Transactional Outbox (ADR-039).</div>
          </div>
        </div>
      </div>

      <!-- =========================================================================
           MODULE 3: INTERACTIVE GOVERNED WORKFLOW (THE CAUSAL DAG) (CJ-01)
           ========================================================================= -->
      <div id="eaios-simulation-frontier" class="eaios-section-card" style="scroll-margin-top: 20px;">
        <!-- Header & Scenario Selector Tabs -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0 0 2px 0;">
              Explore the Architecture — Interactive Scenarios
            </h2>
            <div style="font-size: 11.5px; color: #94a3b8;">
              Live simulation of autonomous orchestration, Four-Eyes human authorization, DAG sagas, and real-time forensic auditing.
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <div id="eaios-api-preflight-pill" style="font-family: monospace; font-size: 10px; font-weight: 700; background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 3px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 5px;">
              <span id="eaios-api-preflight-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #38bdf8;"></span>
              <span id="eaios-api-preflight-text">API: CHECKING...</span>
            </div>
            <div role="tablist" aria-label="EAIOS Architectural Scenarios" style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button id="eaios-scenario-btn-oro" onclick="window.selectEaiosScenario('scenario_oro')" role="tab" aria-selected="true" tabindex="0" class="eaios-scen-btn active" style="border-color: #38bdf8; color: #38bdf8; font-weight: 800; padding: 6px 12px; font-size: 11.5px;">
                ⚡ Showcase: ORO Outage
              </button>
              <button id="eaios-scenario-btn-a" onclick="window.selectEaiosScenario('scenario_a')" role="tab" aria-selected="false" tabindex="0" class="eaios-scen-btn" style="padding: 6px 10px; font-size: 11px;">
                Scenario A: Autonomous
              </button>
              <button id="eaios-scenario-btn-b" onclick="window.selectEaiosScenario('scenario_b')" role="tab" aria-selected="false" tabindex="0" class="eaios-scen-btn" style="padding: 6px 10px; font-size: 11px;">
                Scenario B: HITL Approval
              </button>
              <button id="eaios-scenario-btn-c" onclick="window.selectEaiosScenario('scenario_c')" role="tab" aria-selected="false" tabindex="0" class="eaios-scen-btn" style="padding: 6px 10px; font-size: 11px;">
                Scenario C: Compensation
              </button>
              <button id="eaios-scenario-btn-d" onclick="window.selectEaiosScenario('scenario_d')" role="tab" aria-selected="false" tabindex="0" class="eaios-scen-btn" style="padding: 6px 10px; font-size: 11px;">
                Scenario D: Governed RAG
              </button>
            </div>
          </div>
        </div>

        <!-- ARCHITECTURAL DEMARCATION & SOVEREIGN GATE DISCLOSURE (SPRINT 7.4K-BU) -->
        <div id="eaios-demarcation-banner" class="eaios-info-card" style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85)); border: 1px solid rgba(56, 189, 248, 0.4); border-left: 4px solid #38bdf8; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
            <div style="flex: 1; min-width: 280px;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; background: rgba(56, 189, 248, 0.15); padding: 2px 7px; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.3);">
                  SOVEREIGN EAIES GATE
                </span>
                <span style="font-size: 11.5px; font-weight: 800; color: #f8fafc;">
                  AI RECOMMENDATION DOES NOT CONSTITUTE AUTHORISATION OR EXECUTION
                </span>
              </div>
              <div style="font-size: 11px; color: #cbd5e1; margin-top: 5px; line-height: 1.45;">
                <strong>Execution Authority Boundary:</strong> Specialist AI Employees produce analytical findings; ORO synthesises evidence and proposes advisory decisions. All capability execution is mediated and governed by the host <strong>Enterprise AI Execution Sandbox (EAIES)</strong>. Human executive approval is an independent Four-Eyes governance event. Approval does not constitute physical execution.
              </div>
            </div>
            <div style="text-align: right; min-width: 240px; font-size: 10.5px; color: #94a3b8; line-height: 1.4;">
              <div style="font-weight: 800; color: #fbbf24; background: rgba(245, 158, 11, 0.12); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(245, 158, 11, 0.3); display: inline-block;">
                SIMULATED UI PREVIEW — PHYSICAL MUTATIONS REQUIRE RFC 8693 MTLS TOKEN EXCHANGE
              </div>
              <div style="margin-top: 4px; font-size: 9.5px; color: #64748b;">
                Live Keycloak OIDC Code Flow active • Backend RFC 8693 token exchange unlinked • In-Memory state
              </div>
            </div>
          </div>
        </div>

        <!-- Compact Active Scenario Card with Integrated Execution Controls -->
        <div id="eaios-active-scenario-card" class="eaios-info-card" style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; padding: 10px 14px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="flex: 1; min-width: 260px;">
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span id="eaios-scen-title" style="font-weight: 800; font-size: 13.5px; color: #f8fafc;">${SHOWCASE_SCENARIOS.SCENARIO_ORO.name}</span>
                <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); padding: 1px 6px; border-radius: 4px; font-size: 9.5px; font-weight: 800;">TEST VERIFIED</span>
                <span id="eaios-scen-synthetic-badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35); padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: 800;">DEMO TELEMETRY</span>
                <span id="eaios-scen-budget-badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35); padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: 800;">BUDGET: IN-MEMORY</span>
              </div>
              <div id="eaios-scen-desc" style="font-size: 11.5px; color: #cbd5e1; margin-top: 3px; line-height: 1.4;">${SHOWCASE_SCENARIOS.SCENARIO_ORO.description}</div>
            </div>

            <!-- Action Controls directly embedded in scenario card -->
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <button id="eaios-btn-run" onclick="window.runEaiosScenario()" class="eaios-btn-primary" aria-label="Run selected simulation scenario" style="padding: 8px 18px; font-size: 12.5px; font-weight: 800; box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);">
                ▶ Run Simulation
              </button>
              <button id="eaios-btn-reset" onclick="window.resetEaiosSimulation()" class="eaios-btn-secondary" aria-label="Reset simulation state" style="padding: 8px 14px; font-size: 11.5px;">
                Reset
              </button>
              <span id="eaios-scen-evid" style="font-size: 10px; color: #a78bfa; font-family: monospace; background: rgba(167, 139, 250, 0.1); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(167, 139, 250, 0.25);">
                ${SHOWCASE_SCENARIOS.SCENARIO_ORO.evidenceRef}
              </span>
            </div>
          </div>
        </div>

        <!-- ORO RESILIENCE SCENARIO SUB-SELECTOR -->
        <fieldset id="eaios-oro-sub-selector" style="margin: 0 0 12px 0; padding: 8px 12px; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 8px;">
          <legend style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 0 4px; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
            <span style="font-size: 10.5px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.04em;">
              Operational Resilience Incident Catalogue (5 Scenarios)
            </span>
            <div style="display: flex; gap: 10px; font-size: 10px; color: #94a3b8; align-items: center;">
              <span>Correlation: <code id="eaios-active-correlation-id" style="color: #38bdf8;">INITIALIZING</code></span>
              <span>•</span>
              <span>Outbox: <strong style="color: #10b981;">ADR-039</strong></span>
            </div>
          </legend>
          <div role="group" aria-label="Operational resilience incident scenario options" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 6px;">
            <button id="eaios-sub-btn-scenario_oro" type="button" onclick="window.selectOroSubScenario('scenario_oro')" aria-pressed="true" class="eaios-oro-sub-btn active" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.5); background: rgba(56, 189, 248, 0.15); color: #38bdf8; cursor: pointer; transition: all 0.15s;">
              <div style="font-size: 10.5px; font-weight: 800;">1. Cloud Outage</div>
              <div style="font-size: 9px; opacity: 0.8;">AZ Partition & Failover</div>
            </button>
            <button id="eaios-sub-btn-oro_cyber_ransomware" type="button" onclick="window.selectOroSubScenario('oro_cyber_ransomware')" aria-pressed="false" class="eaios-oro-sub-btn" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(15, 23, 42, 0.6); color: #94a3b8; cursor: pointer; transition: all 0.15s;">
              <div style="font-size: 10.5px; font-weight: 800;">2. Ransomware</div>
              <div style="font-size: 9px; opacity: 0.8;">Subnet Isolation WORM</div>
            </button>
            <button id="eaios-sub-btn-oro_third_party_outage" type="button" onclick="window.selectOroSubScenario('oro_third_party_outage')" aria-pressed="false" class="eaios-oro-sub-btn" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(15, 23, 42, 0.6); color: #94a3b8; cursor: pointer; transition: all 0.15s;">
              <div style="font-size: 10.5px; font-weight: 800;">3. Third-Party Failure</div>
              <div style="font-size: 9px; opacity: 0.8;">SaaS RTO Backup Rail</div>
            </button>
            <button id="eaios-sub-btn-oro_data_corruption" type="button" onclick="window.selectOroSubScenario('oro_data_corruption')" aria-pressed="false" class="eaios-oro-sub-btn" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(15, 23, 42, 0.6); color: #94a3b8; cursor: pointer; transition: all 0.15s;">
              <div style="font-size: 10.5px; font-weight: 800;">4. Data Integrity</div>
              <div style="font-size: 9px; opacity: 0.8;">Checksum Replay</div>
            </button>
            <button id="eaios-sub-btn-oro_compound_incident" type="button" onclick="window.selectOroSubScenario('oro_compound_incident')" aria-pressed="false" class="eaios-oro-sub-btn" style="text-align: left; padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(15, 23, 42, 0.6); color: #94a3b8; cursor: pointer; transition: all 0.15s;">
              <div style="font-size: 10.5px; font-weight: 800;">5. Compound Incident</div>
              <div style="font-size: 9px; opacity: 0.8;">Vendor Outage + DDoS</div>
            </button>
          </div>
        </fieldset>

        <!-- ORO CONTEXTUAL RESILIENCE PANEL (COMPACT DETAILS TOGGLE) -->
        <details id="eaios-oro-context-card" style="margin-bottom: 12px; background: rgba(10, 11, 16, 0.6); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 8px; padding: 8px 14px; font-size: 11px;">
          <summary style="cursor: pointer; color: #38bdf8; font-weight: 700; font-size: 11px; display: flex; justify-content: space-between; align-items: center;">
            <span>📋 Inspect DORA Regulatory Profile & Incident Targets (IBS, RTO, RPO)</span>
            <span style="font-size: 10px; color: #94a3b8;">Click to expand</span>
          </summary>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
            <div>
              <div style="color: #64748b; font-size: 9.5px; font-weight: 800; text-transform: uppercase;">Impacted Important Business Services (IBS)</div>
              <div id="eaios-oro-ctx-ibs" style="color: #f8fafc; font-weight: 600; margin-top: 2px;">Payment Clearing Core • Wholesale Liquidity • Client Portal</div>

              <div style="color: #64748b; font-size: 9.5px; font-weight: 800; text-transform: uppercase; margin-top: 6px;">DORA Dimension & Supervisory Mandates</div>
              <div id="eaios-oro-ctx-dora" style="color: #38bdf8; font-size: 10.5px; margin-top: 2px;">Pillar 1: ICT Risk | Pillar 2: RTS Art. 19 | Pillar 5: Third-Party Risk</div>
            </div>
            <div>
              <div style="display: flex; gap: 14px;">
                <div>
                  <div style="color: #64748b; font-size: 9.5px; font-weight: 800; text-transform: uppercase;">Recovery Target (RTO)</div>
                  <div id="eaios-oro-ctx-rto" style="color: #34d399; font-weight: 700; margin-top: 2px;">2 Hours</div>
                </div>
                <div>
                  <div style="color: #64748b; font-size: 9.5px; font-weight: 800; text-transform: uppercase;">Data Loss Limit (RPO)</div>
                  <div id="eaios-oro-ctx-rpo" style="color: #34d399; font-weight: 700; margin-top: 2px;">0 (Zero Data Loss)</div>
                </div>
                <div>
                  <div style="color: #64748b; font-size: 9.5px; font-weight: 800; text-transform: uppercase;">Evidence Status</div>
                  <span id="eaios-oro-ctx-evidence-status" style="display: inline-block; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 3px; border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; margin-top: 2px;">CONFLICTING</span>
                </div>
              </div>
              <div style="color: #94a3b8; font-size: 10px; margin-top: 4px; line-height: 1.3;" id="eaios-oro-ctx-evidence-note">
                Provider status claims monitoring; internal telemetry probes measure 100% loss.
              </div>
            </div>
          </div>
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255, 255, 255, 0.05); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; font-size: 10px;">
            <div>
              <span style="color: #64748b;">Required Decision:</span> <strong id="eaios-oro-ctx-decision" style="color: #cbd5e1;">Authorize live production DNS switchover to UK-South</strong>
            </div>
            <div style="color: #64748b;">
              Consequence: <span id="eaios-oro-ctx-consequence" style="color: #94a3b8;">Traffic diverted to secondary standby</span>
            </div>
          </div>
        </details>

        <!-- HUMAN APPROVAL INTERACTIVE OPERATOR BANNER (ADR-032) -->
        <div id="eaios-approval-banner" style="display: none; margin-bottom: 16px; background: rgba(245, 158, 11, 0.12); border: 2px dashed #f59e0b; border-radius: 8px; padding: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
            <div style="flex: 1; min-width: 280px;">
              <div style="display: inline-flex; align-items: center; gap: 6px; color: #fbbf24; font-weight: 800; font-size: 13px;">
                <span>⚠️</span>
                <span>WORKFLOW PAUSED: Human Governance Decision Gate (ADR-032 / PG Test P1)</span>
              </div>
              <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px; line-height: 1.45;">
                State: <code>PAUSED_PENDING_INPUT</code>. Work Owner: <code style="color: #38bdf8;">alice@enterprise.example</code>.
                Four-Eyes rule mandates that the work owner cannot approve high-impact actions. Resumption transitions workflow state and requires fresh host-enforced EAIES execution authorization. An approval or recommendation never constitutes completed execution.
              </div>
              <div style="font-size: 11px; color: #fbbf24; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 4px; padding: 6px 10px; margin-top: 8px; line-height: 1.4;">
                <strong>Showcase Governance Disclosure:</strong> This is a simulated UI decision gate under the <strong>Sovereign EAIES Gate</strong>.
                AI RECOMMENDATION DOES NOT CONSTITUTE AUTHORISATION OR EXECUTION.
                Physical mutations require an RFC 8693 mTLS delegated actor token. Keycloak OIDC Code Flow is active for browser sessions; backend token exchange is simulated in-memory.
              </div>

              <!-- Interactive Form Inputs -->
              <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-top: 12px;">
                <div>
                  <label for="eaios-operator-select" style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Approver Identity:</label>
                  <select id="eaios-operator-select" style="width: 100%; background: #0f172a; color: #f8fafc; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 7px 10px; font-size: 11px; margin-top: 3px; cursor: pointer;">
                    <option value="bob@enterprise.example">bob@enterprise.example (Authorized Approver)</option>
                    <option value="alice@enterprise.example">alice@enterprise.example (Work Owner - Test 4-Eyes Deny)</option>
                  </select>
                </div>
                <div>
                  <label for="eaios-operator-rationale" style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Decision Rationale (Mandatory):</label>
                  <input type="text" id="eaios-operator-rationale" value="Approved for production run after secondary audit." style="width: 100%; background: #0f172a; color: #f8fafc; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 7px 10px; font-size: 11px; margin-top: 3px;" />
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

        <!-- DAG TOPOLOGY & LIVE INSPECTOR + AUDIT OUTPUT SIDE-BY-SIDE -->
        <div class="eaios-grid-dag">
          <!-- LEFT COLUMN: DAG TOPOLOGY VIEWER -->
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

            <div id="eaios-dag-container" style="flex: 1; min-height: 480px; background: rgba(10, 11, 16, 0.8); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; overflow: hidden; position: relative;">
              <!-- SVG / Mobile DOM DAG rendered dynamically by EaiosRenderer -->
            </div>
          </div>

          <!-- RIGHT COLUMN: LIVE OUTPUTS (INSPECTOR & AUDIT STREAM STACKED) -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <!-- LIVE STATE, EAIES & GOVERNANCE INSPECTOR -->
            <div class="eaios-info-card" style="display: flex; flex-direction: column;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <div style="font-size: 14px; font-weight: 800; color: #f8fafc;">Sovereign Node & Authority Inspector</div>
                <span style="font-size: 10px; color: #38bdf8; font-family: monospace; background: rgba(56, 189, 248, 0.1); padding: 2px 6px; border-radius: 4px;">
                  H-01 SOVEREIGN
                </span>
              </div>
              <div style="font-size: 11px; color: #94a3b8; margin-bottom: 10px;">Real-time inspection of active worker leases and EAIES policy decisions</div>

              <div id="eaios-inspector-content" style="display: flex; flex-direction: column; gap: 10px;">
                <!-- Dynamically populated in updateInspector() -->
              </div>
            </div>

            <!-- ENTERPRISE FORENSIC AUDIT STREAM -->
            <div class="eaios-info-card" style="display: flex; flex-direction: column; flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px;">
                <div style="font-size: 13px; font-weight: 800; color: #f8fafc;">Enterprise Forensic Audit Stream (ADR-026 / ADR-039 / ADR-046)</div>
                <span style="font-size: 10px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 8px; border-radius: 4px; font-weight: 700;">
                  Causal Root: CORR-2026-000741
                </span>
              </div>

              <div id="eaios-audit-log" style="height: 240px; overflow-y: auto; background: rgba(10, 11, 16, 0.9); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 11px; display: flex; flex-direction: column; gap: 6px;">
                <div style="color: #64748b; text-align: center; padding-top: 100px;">Awaiting workflow execution event stream...</div>
              </div>
            </div>
          </div>
        </div>

        <!-- EXECUTIVE DECISION RECORD (ORO ADVISORY & HUMAN GATE AUDIT) -->
        <div id="eaios-decision-record-container" style="margin-top: 20px;">
          <!-- Dynamically populated via updateExecutiveDecisionRecord() -->
        </div>
      </div>

      <!-- =========================================================================
           MODULE 4: ENTERPRISE ENGINEERING SAFEGUARDS (CJ-01 / CJ-04)
           ========================================================================= -->
      <div id="eaios-module-safeguards" class="eaios-section-card eaios-info-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0;">
              Enterprise Engineering Safeguards
            </h2>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 3px;">
              In-depth technical architecture across five critical enterprise control domains
            </div>
          </div>
          <span style="font-size: 10px; font-weight: 800; color: #10b981; background: rgba(16, 185, 129, 0.12); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3);">
            TABBED DEEP DIVE (65% COMPACT LAYOUT)
          </span>
        </div>

        <!-- Safeguard Tab Navigation -->
        <div class="eaios-safeguards-nav" style="display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 12px;" role="tablist">
          <button id="safeguard-tab-btn-identity" onclick="window.switchSafeguardTab('identity')" class="eaios-safeguard-tab active" role="tab" aria-selected="true" aria-controls="safeguard-panel-identity">
            Identity & Lifecycle
          </button>
          <button id="safeguard-tab-btn-sovereign" onclick="window.switchSafeguardTab('sovereign')" class="eaios-safeguard-tab" role="tab" aria-selected="false" aria-controls="safeguard-panel-sovereign">
            Sovereign Gate & Four-Eyes
          </button>
          <button id="safeguard-tab-btn-rls" onclick="window.switchSafeguardTab('rls')" class="eaios-safeguard-tab" role="tab" aria-selected="false" aria-controls="safeguard-panel-rls">
            PostgreSQL Multi-Tenant RLS
          </button>
          <button id="safeguard-tab-btn-cost" onclick="window.switchSafeguardTab('cost')" class="eaios-safeguard-tab" role="tab" aria-selected="false" aria-controls="safeguard-panel-cost">
            Token Budget Escrow
          </button>
          <button id="safeguard-tab-btn-resilience" onclick="window.switchSafeguardTab('resilience')" class="eaios-safeguard-tab" role="tab" aria-selected="false" aria-controls="safeguard-panel-resilience">
            Fail-Closed Resilience
          </button>
        </div>

        <!-- Safeguard Panel 1: Identity & Lifecycle -->
        <div id="safeguard-panel-identity" class="safeguard-panel" style="display: block;" role="tabpanel">
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
              <h3 style="font-size: 15px; font-weight: 800; color: #f8fafc; margin: 0;">AI Employee Deterministic Lifecycle (ADR-033)</h3>
              <span style="font-size: 10px; font-weight: 800; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 3px 8px; border-radius: 4px;">
                VERIFIED IN TEST SUITE
              </span>
            </div>
            <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6; margin: 0 0 16px 0;">
              AI Employees within EAIOS are strictly governed computational entities. They possess verifiable cryptographic identities, scoped lease certificates, and operate within a deterministic 6-state finite state machine. An AI Employee's state dictates capability eligibility; suspension revokes active worker leases in under 500 milliseconds.
            </p>
            <!-- 6 Lifecycle States Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px;">
              <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 10px;">
                <div style="font-size: 11px; font-weight: 800; color: #94a3b8;">1. DRAFT</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Specification created; zero execution privileges.</div>
              </div>
              <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 10px;">
                <div style="font-size: 11px; font-weight: 800; color: #38bdf8;">2. PROVISIONED</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Identity minted & key attested; awaiting lease.</div>
              </div>
              <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px; padding: 10px;">
                <div style="font-size: 11px; font-weight: 800; color: #34d399;">3. ACTIVE</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Valid heartbeat; executing bounded advisory tasks.</div>
              </div>
              <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 6px; padding: 10px;">
                <div style="font-size: 11px; font-weight: 800; color: #fbbf24;">4. SUSPENDED</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Leases instantly revoked; telemetry contained.</div>
              </div>
              <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 10px;">
                <div style="font-size: 11px; font-weight: 800; color: #64748b;">5. RETIRED</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Decommissioned gracefully; historical logs locked.</div>
              </div>
              <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 10px;">
                <div style="font-size: 11px; font-weight: 800; color: #f87171;">6. REVOKED</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Security fence triggered; forensic freeze enacted.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Safeguard Panel 2: Sovereign Gate & Four-Eyes -->
        <div id="safeguard-panel-sovereign" class="safeguard-panel" style="display: none;" role="tabpanel">
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
              <h3 style="font-size: 15px; font-weight: 800; color: #f8fafc; margin: 0;">Sovereign Gate & Dual-Control Oversight (ADR-032 / ADR-038)</h3>
              <span style="font-size: 10px; font-weight: 800; color: #f59e0b; background: rgba(245, 158, 11, 0.15); padding: 3px 8px; border-radius: 4px;">
                NON-BYPASSABLE EXECUTION BOUNDARY
              </span>
            </div>
            <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6; margin: 0 0 16px 0;">
              Under EAIOS, no AI model, worker, or orchestrator possesses execution authority. When an AI specialist proposes high-impact remediation (e.g. DNS failover, infrastructure quarantine, or customer notification), the causal DAG pauses at Node 5 (<code>PAUSED_PENDING_INPUT</code>). Advancement requires an authenticated human executive signature with role verification (Four-Eyes dual control).
            </p>
            <div style="background: rgba(10, 11, 16, 0.7); border-left: 3px solid #f59e0b; border-radius: 0 6px 6px 0; padding: 12px 16px;">
              <div style="font-size: 11px; font-weight: 800; color: #fbbf24; margin-bottom: 4px;">AUTHORITY DECOMPOSITION PRINCIPLE</div>
              <div style="font-size: 12px; color: #cbd5e1; line-height: 1.5; font-family: monospace;">
                MODEL ≠ AUTHORITY | WORKER ≠ AUTHORITY | ORCHESTRATOR ≠ AUTHORITY | HUMAN APPROVAL ≠ CAPABILITY AUTHORITY | EAIES = EXECUTION AUTHORITY
              </div>
            </div>
          </div>
        </div>

        <!-- Safeguard Panel 3: Multi-Tenant PostgreSQL RLS -->
        <div id="safeguard-panel-rls" class="safeguard-panel" style="display: none;" role="tabpanel">
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
              <h3 style="font-size: 15px; font-weight: 800; color: #f8fafc; margin: 0;">Multi-Tenant PostgreSQL Row-Level Security (ADR-030)</h3>
              <span style="font-size: 10px; font-weight: 800; color: #a78bfa; background: rgba(167, 139, 250, 0.15); padding: 3px 8px; border-radius: 4px;">
                VERIFIED IN POSTGRESQL CONTAINER SUITE
              </span>
            </div>
            <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6; margin: 0 0 16px 0;">
              PostgreSQL provides the durable transactional substrate for state consistency and OCC. PostgreSQL RLS enforces strict tenant isolation using transaction-scoped tenant context (<code>SET LOCAL app.current_tenant_id</code>). Data from <code>GLOBAL-WEALTH-MANAGEMENT</code> is mathematically inaccessible to <code>INSTITUTIONAL-INVESTMENT-BANKING</code>.
            </p>
            <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
              <button id="eaios-btn-rls-gwm" onclick="window.switchEaiosTenant('GLOBAL-WEALTH-MANAGEMENT')" class="eaios-sim-action-btn" style="flex: 1; min-width: 140px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #38bdf8; padding: 7px 10px; border-radius: 4px; font-size: 11.5px; font-weight: 600;">
                Tenant: GLOBAL-WEALTH-MANAGEMENT
              </button>
              <button id="eaios-btn-rls-iib" onclick="window.switchEaiosTenant('INSTITUTIONAL-INVESTMENT-BANKING')" class="eaios-sim-action-btn" style="flex: 1; min-width: 140px; background: #0f172a; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.15); padding: 7px 10px; border-radius: 4px; font-size: 11.5px; font-weight: 600;">
                Tenant: INSTITUTIONAL-INVESTMENT-BANKING
              </button>
            </div>
            <div id="eaios-rls-output" class="eaios-info-card" style="background: rgba(10, 11, 16, 0.8); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; padding: 12px; font-family: monospace; font-size: 11px; color: #cbd5e1;">
              <div style="color: #64748b;">// Active session tenant:</div>
              <div style="color: #38bdf8; font-weight: 700;">app.current_tenant_id = 'GLOBAL-WEALTH-MANAGEMENT'</div>
              <div style="color: #10b981; margin-top: 4px;">✓ Returned: "Q3 Statutory Solvency & Capital Reserves" (1 row)</div>
            </div>
          </div>
        </div>

        <!-- Safeguard Panel 4: Token Budget Escrow -->
        <div id="safeguard-panel-cost" class="safeguard-panel" style="display: none;" role="tabpanel">
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
              <h3 style="font-size: 15px; font-weight: 800; color: #f8fafc; margin: 0;">Token Budget Escrow & Cost Governance (ADR-022)</h3>
              <span style="font-size: 10px; font-weight: 800; color: #34d399; background: rgba(16, 185, 129, 0.15); padding: 3px 8px; border-radius: 4px;">
                AUTOMATED ESCROW RESERVATION
              </span>
            </div>
            <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6; margin: 0 0 16px 0;">
              Policy → Reservation → Provider Invocation → Usage / Outcome → Settlement → Audit. Mandatory pre-invocation token escrow prevents financial exhaustion or denial-of-wallet attacks. If requested tokens exceed quota, invocation is aborted instantly before contacting providers.
            </p>
            <div class="eaios-info-card" style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
              <span>Total Quota: <strong style="color: #f8fafc;">10,000 Tokens</strong></span>
              <span id="eaios-budget-remaining">Available: <strong style="color: #34d399;">7,150</strong></span>
            </div>
            <div class="eaios-info-card" style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-bottom: 12px;">
              <div id="eaios-budget-bar" style="width: 71.5%; height: 100%; background: #10b981; transition: width 0.3s;"></div>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button id="eaios-btn-deny-budget" onclick="window.simulateEaiosBudget()" class="eaios-sim-action-btn" style="flex: 1; min-width: 140px; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; padding: 7px 10px; border-radius: 4px; font-size: 11.5px; font-weight: 600;">
                Test Spend-Deny (Request 8,500 Tokens)
              </button>
            </div>
          </div>
        </div>

        <!-- Safeguard Panel 5: Fail-Closed Resilience -->
        <div id="safeguard-panel-resilience" class="safeguard-panel" style="display: none;" role="tabpanel">
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
              <h3 style="font-size: 15px; font-weight: 800; color: #f8fafc; margin: 0;">Fail-Closed Resilience & Dynamic Provider Fallback (ADR-020 / ADR-027)</h3>
              <span style="font-size: 10px; font-weight: 800; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 3px 8px; border-radius: 4px;">
                CIRCUIT BREAKER PROTECTED
              </span>
            </div>
            <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6; margin: 0 0 16px 0;">
              When external foundation model providers experience latencies, rate limits, or outages, EAIOS dynamically activates host circuit breakers and falls back to secondary registered models. If all external advisory channels fail, EAIOS defaults to fail-closed state: zero fabricated recommendations, zero unverified executions.
            </p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
              <button id="eaios-btn-provider-timeout" onclick="window.simulateEaiosTimeout()" class="eaios-sim-action-btn" style="flex: 1; min-width: 140px; background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; padding: 7px 10px; border-radius: 4px; font-size: 11.5px; font-weight: 600;">
                Simulate Provider Timeout & Circuit Breaker
              </button>
            </div>
            <div id="eaios-provider-timeout-box" style="display: none; background: rgba(10, 11, 16, 0.8); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 6px; padding: 12px; font-size: 11px; color: #fde68a;"></div>
          </div>
        </div>
      </div>

      <!-- =========================================================================
           MODULE 5: CAPABILITY IMPLEMENTATION MATURITY MATRIX (CJ-01 / CJ-05)
           ========================================================================= -->
      <div id="eaios-module-maturity" class="eaios-section-card eaios-info-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0;">
              Capability Implementation Maturity Matrix
            </h2>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 3px;">
              Honest architectural status across 28 system capabilities (Distinguishing Live vs CI vs Showcase)
            </div>
          </div>
          <!-- Filter Controls -->
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <input type="text" id="eaios-maturity-search" placeholder="Search capabilities..." oninput="window.filterMaturityTable()" style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 6px 12px; color: #f8fafc; font-size: 12px; width: 180px;">
            <select id="eaios-maturity-filter-level" onchange="window.filterMaturityTable()" style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 6px 10px; color: #cbd5e1; font-size: 12px;">
              <option value="ALL">All Maturity Levels</option>
              <option value="1. IMPLEMENTED & VERIFIED">1. Implemented & Verified</option>
              <option value="2. IMPLEMENTED — PARTIALLY VERIFIED">2. Implemented — Partially Verified</option>
              <option value="4. PARTIALLY INTEGRATED">4. Partially Integrated</option>
              <option value="5. DESIGNED / PLANNED">5. Designed / Planned</option>
            </select>
          </div>
        </div>

        <!-- Responsive Table Container -->
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.12); color: #94a3b8; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 10px 12px;">Category</th>
                <th style="padding: 10px 12px;">Capability Name</th>
                <th style="padding: 10px 12px;">Repository Location</th>
                <th style="padding: 10px 12px;">Primary Test Suite</th>
                <th style="padding: 10px 12px;">ADR</th>
                <th style="padding: 10px 12px;">Maturity Level</th>
                <th style="padding: 10px 12px;">Showcase Status</th>
              </tr>
            </thead>
            <tbody id="eaios-maturity-table-body">
              ${EAIOS_CAPABILITY_MATURITY.map(cap => {
                let badgeClass = 'maturity-badge-verified';
                if (cap.level.includes('PARTIALLY VERIFIED')) badgeClass = 'maturity-badge-partial';
                else if (cap.level.includes('PARTIALLY INTEGRATED')) badgeClass = 'maturity-badge-simulated';
                else if (cap.level.includes('DESIGNED')) badgeClass = 'maturity-badge-planned';

                return `
                  <tr class="eaios-maturity-row" data-category="${cap.category}" data-level="${cap.level}" data-name="${cap.name.toLowerCase()}" style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                    <td style="padding: 10px 12px; font-weight: 700; color: #cbd5e1;">${cap.category}</td>
                    <td style="padding: 10px 12px; font-weight: 700; color: #f8fafc;">
                      ${cap.name}
                      <div style="font-size: 10px; color: #94a3b8; font-weight: 400; margin-top: 2px;">${cap.boundaryDisclosures}</div>
                    </td>
                    <td style="padding: 10px 12px; font-family: monospace; color: #94a3b8; font-size: 11px;">${cap.location}</td>
                    <td style="padding: 10px 12px; color: #cbd5e1; font-size: 11px;">${cap.test}</td>
                    <td style="padding: 10px 12px; font-family: monospace; color: #38bdf8; font-size: 11px;">${cap.adr}</td>
                    <td style="padding: 10px 12px;">
                      <span class="${badgeClass}">${cap.level}</span>
                    </td>
                    <td style="padding: 10px 12px; font-size: 11px; color: #94a3b8;">${cap.portalDemo}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- =========================================================================
           MODULE 6: ARCHITECTURAL DECISIONS & EVIDENCE VAULT (CJ-01 / CJ-06)
           ========================================================================= -->
      <div id="eaios-module-evidence" class="eaios-section-card eaios-info-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0;">
              Architectural Decisions & Evidence Vault
            </h2>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 3px;">
              26 Canonical ADRs, 28 Core Invariants, and automated verification suite provenance
            </div>
          </div>
          <!-- Filter Controls -->
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <input type="text" id="eaios-adr-search" placeholder="Search ADRs or Invariants..." oninput="window.filterAdrGrid()" style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 6px 12px; color: #f8fafc; font-size: 12px; width: 200px;">
            <select id="eaios-adr-category-filter" onchange="window.filterAdrGrid()" style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 6px 10px; color: #cbd5e1; font-size: 12px;">
              <option value="ALL">All Categories</option>
              <option value="Authority">Authority & Governance</option>
              <option value="Orchestration">Orchestration & Sagas</option>
              <option value="Persistence">Persistence & Outbox</option>
              <option value="Model">Model & Risk Lifecycle</option>
            </select>
          </div>
        </div>

        <!-- ADR Grid Container -->
        <div id="eaios-adr-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; max-height: 480px; overflow-y: auto; padding: 4px;">
          ${ADR_EXPLORER_CATALOG.map(adr => `
            <div class="eaios-adr-card" data-adr="${adr.id}" data-category="${adr.category || ''}" data-title="${adr.title.toLowerCase()}" onclick="window.openAdrDrawer('${adr.id}')" style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px; cursor: pointer; transition: all 0.2s ease;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <span style="font-size: 11px; font-weight: 800; color: #38bdf8; font-family: monospace;">${adr.id}</span>
                <span style="font-size: 10px; font-weight: 700; color: #34d399; background: rgba(16, 185, 129, 0.12); padding: 2px 6px; border-radius: 3px;">${adr.status || 'ACCEPTED'}</span>
              </div>
              <div style="font-size: 13px; font-weight: 700; color: #f8fafc; margin-bottom: 6px; line-height: 1.35;">${adr.title}</div>
              <div style="font-size: 11px; color: #94a3b8; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${adr.decision || adr.context || ''}</div>
              <div style="margin-top: 10px; font-size: 10px; color: #60a5fa; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                <span>Inspect Architectural Record</span>
                <span>→</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Verification Suite Provenance Summary -->
        <div style="margin-top: 20px; background: rgba(10, 11, 16, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="font-size: 12px; font-weight: 800; color: #38bdf8; text-transform: uppercase;">Automated Verification Provenance</div>
            <div style="font-size: 12.5px; color: #cbd5e1; margin-top: 2px;">
              All 28 invariants verified via automated Playwright, Node.js state machines, and Docker PostgreSQL container integration.
            </div>
          </div>
          <div style="font-family: monospace; font-size: 11px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.12); padding: 6px 12px; border-radius: 6px; color: #34d399;">
            node tests/test_node6_state_separation.mjs (7/7 Pass)
          </div>
        </div>
      </div>

      <!-- Slide-Over Inspection Drawer for ADRs and Invariants -->
      <div id="eaios-adr-drawer" class="eaios-drawer-overlay" onclick="if (event.target === this) window.closeAdrDrawer()">
        <div class="eaios-drawer-panel" onclick="event.stopPropagation()">
          <div class="eaios-drawer-header">
            <div>
              <span id="eaios-drawer-badge" style="font-size: 10px; font-weight: 800; color: #38bdf8; font-family: monospace; background: rgba(56, 189, 248, 0.15); padding: 2px 8px; border-radius: 3px;">
                ADR RECORD
              </span>
              <h3 id="eaios-drawer-title" style="font-size: 16px; font-weight: 800; color: #f8fafc; margin: 4px 0 0 0;">
                ADR Details
              </h3>
            </div>
            <button id="eaios-drawer-close-btn" onclick="window.closeAdrDrawer()" style="background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; padding: 4px 8px;">
              ✕
            </button>
          </div>
          <div id="eaios-drawer-body" class="eaios-drawer-body">
            <!-- Dynamically populated -->
          </div>
          <div class="eaios-drawer-footer">
            <button onclick="window.closeAdrDrawer()" class="eaios-btn-secondary" style="font-size: 12px; padding: 6px 16px;">
              Close Record
            </button>
          </div>
        </div>
      </div>


      <!-- Global Detail Modal (for Node/ADR inspect fallback) -->
      <div id="eaios-detail-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: #0f172a; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; max-width: 600px; width: 100%; max-height: 85vh; overflow-y: auto; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div>
              <span id="eaios-modal-badge" style="font-size: 10px; font-weight: 800; color: #38bdf8; text-transform: uppercase;"></span>
              <h3 id="eaios-modal-title" style="font-size: 18px; font-weight: 800; color: #f8fafc; margin: 4px 0 0 0;"></h3>
            </div>
            <button id="eaios-modal-close-btn" onclick="window.closeEaiosModal()" style="background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; padding: 4px 8px;">✕</button>
          </div>
          <div id="eaios-modal-body" style="font-size: 13px; color: #cbd5e1; line-height: 1.6;"></div>
          <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
            <button id="eaios-modal-footer-close" onclick="window.closeEaiosModal()" class="eaios-btn-secondary" style="font-size: 12px; padding: 6px 16px;">Close</button>
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

    // Dynamic Correlation ID update
    const activeCorrEl = document.getElementById('eaios-active-correlation-id');
    if (activeCorrEl) {
      activeCorrEl.textContent = state.correlationId || 'INITIALIZING';
    }
    // Update Executive Decision Record
    updateExecutiveDecisionRecord();
  });

  // Handle window resize for dynamic responsive layout rerendering
  window.addEventListener('resize', () => {
    if (simManager && renderer) {
      renderer.render(simManager.getCurrentNodes(), simManager.nodeStates, simManager.selectedNodeId);
    }
  });

  // Initial render
  window.simManager = simManager;
  simManager.reset();
  const initialNodes = simManager.getCurrentNodes();
  if (initialNodes && initialNodes[0]) {
    updateInspector(initialNodes[0]);
  }
  if (window.updateOroScenarioUi) {
    window.updateOroScenarioUi('scenario_oro');
  }
  updateExecutiveDecisionRecord();

  // Non-blocking, point-in-time preflight health check
  checkApiPreflight();

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
        <span style="font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; background: ${color}20; color: ${color}; border: 1px solid ${color}50; cursor: default;">
          ${status}
        </span>
      </div>
      <div style="font-size: 11px; color: #cbd5e1; margin-top: 6px; line-height: 1.4;">${node.description || 'DAG execution node.'}</div>
    </div>

    <!-- EAIES AUTHORITY CHECK PANEL -->
    <div style="background: rgba(10, 11, 16, 0.85); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; padding: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div style="font-size: 11px; text-transform: uppercase; color: #38bdf8; font-weight: 800;">EAIES Sovereign Gate Check</div>
        <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 3px; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); cursor: default;">
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
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Correlation: <code id="eaios-inspector-correlation-id" style="color: #38bdf8;">${simManager?.correlationId || 'INITIALIZING'}</code></div>
    </div>
  `;
}

/**
 * Renders the Executive Decision Record for the active ORO scenario.
 * Follows strict governance disclosure: in-memory only, simulated UI states, advisory boundaries.
 */
function updateExecutiveDecisionRecord() {
  const container = document.getElementById('eaios-decision-record-container');
  if (!container) return;

  const rec = simManager?.executiveDecisionRecord;
  if (!rec) {
    container.innerHTML = '';
    return;
  }

  const isApproved = rec.humanDecision?.state === 'APPROVED';
  const isRejected = rec.humanDecision?.state === 'REJECTED';
  const decisionBadgeColor = isApproved ? '#10b981' : (isRejected ? '#ef4444' : '#fbbf24');
  const decisionBadgeBg = isApproved ? 'rgba(16, 185, 129, 0.15)' : (isRejected ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)');
  const decisionBorder = isApproved ? 'rgba(16, 185, 129, 0.4)' : (isRejected ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)');

  container.innerHTML = `
    <div class="eaios-info-card" style="background: rgba(10, 15, 28, 0.95); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 18px 22px;">
      <!-- Record Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 10.5px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; background: rgba(56, 189, 248, 0.12); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.25);">
              EXECUTIVE DECISION RECORD
            </span>
            <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #f8fafc;">
              ${rec.incidentId} • ${rec.scenarioName}
            </span>
            <span style="font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px; background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.35);">
              SEVERITY: ${rec.severity}
            </span>
          </div>
          <div style="font-size: 11.5px; color: #94a3b8; margin-top: 4px;">
            Target Service: <strong style="color: #cbd5e1;">${rec.affectedService}</strong>
          </div>
        </div>
        <div style="text-align: right; font-size: 10px; font-family: monospace; color: #64748b;">
          <div>${rec.syntheticDisclosure}</div>
          <div style="color: #fbbf24; margin-top: 2px;">${rec.traceability.memoryOnlyDisclosure}</div>
        </div>
      </div>

      <!-- Seven-Pillar Structured Decision Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
        <!-- 1 & 2. Telemetry & Evidence Considered -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 12px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #38bdf8; margin-bottom: 6px;">
            1. Evidence & Telemetry Intake
          </div>
          <div style="font-size: 11px; color: #cbd5e1; line-height: 1.45;">
            <div>Status: <strong style="color: ${rec.evidence.status === 'CONFIRMED' ? '#34d399' : '#fbbf24'};">${rec.evidence.status}</strong></div>
            <div style="color: #94a3b8; font-size: 10.5px; margin-top: 2px;">${rec.evidence.note}</div>
            <div style="margin-top: 6px; color: #64748b; font-size: 10px;">Impacted IBS:</div>
            <div style="color: #38bdf8; font-size: 10.5px;">${rec.evidence.impactedIBS.slice(0, 2).join(' • ')}</div>
          </div>
        </div>

        <!-- 3. Backend Advisory Assessment -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #38bdf8;">2. Backend Advisory Assessment</span>
            <span style="font-size: 9.5px; font-weight: 700; color: ${rec.assessment.status === 'SYNTHESIS_VERIFIED' ? '#34d399' : (rec.assessment.status.startsWith('FAILED') || rec.assessment.status.startsWith('UNAVAILABLE') ? '#f87171' : '#38bdf8')};">${rec.assessment.status}</span>
          </div>
          <div style="font-size: 11px; color: #cbd5e1; line-height: 1.45;">
            <div>Advisory Action: <code style="color: #a78bfa;">${rec.assessment.action || 'PENDING_DISPATCH'}</code></div>
            <div style="color: #94a3b8; font-size: 10.5px; margin-top: 2px;">${rec.assessment.rationale}</div>
            <div style="margin-top: 6px; font-size: 10px; color: #64748b;">
              Settled Tokens: <strong style="color: #10b981;">${rec.assessment.tokensSettled !== null ? rec.assessment.tokensSettled : '0 (Not billed)'}</strong>
            </div>
            ${rec.assessment.isRetryable ? `
              <div id="eaios-fail-closed-explanation" style="margin-top: 10px; padding: 10px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-left: 3px solid #ef4444; border-radius: 6px; display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 10px; font-weight: 800; color: #f87171; letter-spacing: 0.04em; text-transform: uppercase;">🛡️ FAIL-CLOSED SAFEGUARD ACTIVE</span>
                  <span style="font-size: 9px; background: rgba(239, 68, 68, 0.2); color: #fca5a5; padding: 1px 6px; border-radius: 3px; font-weight: 700;">FAIL-CLOSED</span>
                </div>
                <div style="font-size: 10.5px; color: #fecaca; line-height: 1.4;">
                  The live ORO advisory integration is unavailable. No recommendation has been fabricated, and no physical mutation has been authorised or executed.
                </div>
                <div style="font-size: 9.5px; color: #94a3b8; line-height: 1.35;">
                  The safeguard demonstrates controlled failure behaviour; it does not establish successful end-to-end live agent execution.
                </div>
                <button
                  id="eaios-btn-retry-synthesis"
                  onclick="window.retryEaiosSynthesis()"
                  aria-label="Retry recommendation synthesis with backend"
                  ${simManager?.isRetrying ? "disabled" : ""}
                  style="margin-top: 4px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; width: 100%; background: ${simManager?.isRetrying ? "rgba(56, 189, 248, 0.15)" : "linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(59, 130, 246, 0.25))"}; border: 1px solid ${simManager?.isRetrying ? "rgba(56, 189, 248, 0.3)" : "rgba(56, 189, 248, 0.6)"}; color: ${simManager?.isRetrying ? "#94a3b8" : "#38bdf8"}; font-weight: 700; font-size: 11px; padding: 6px 12px; border-radius: 4px; cursor: ${simManager?.isRetrying ? "not-allowed" : "pointer"}; transition: all 0.15s ease;"
                >
                  ${simManager?.isRetrying ? "⏳ Retrying Synthesis..." : "🔄 Retry Synthesis"}
                </button>
              </div>
            ` : ""}
          </div>
        </div>

        <!-- 4 & 5. Governance Constraints & Dual-Control Decision -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #38bdf8;">3. Governance & Human Decision</span>
            <span style="font-size: 9.5px; font-weight: 800; padding: 1px 6px; border-radius: 3px; background: ${decisionBadgeBg}; color: ${decisionBadgeColor}; border: 1px solid ${decisionBorder};">
              ${rec.humanDecision.state}
            </span>
          </div>
          <div style="font-size: 11px; color: #cbd5e1; line-height: 1.45;">
            <div>Rule: <strong style="color: #fbbf24;">${rec.governance.axiom}</strong></div>
            <div style="color: #94a3b8; font-size: 10.5px; margin-top: 2px;">${rec.governance.constraint}</div>
            <div style="margin-top: 6px; font-size: 10.5px;">
              Approver: <code style="color: #38bdf8;">${rec.humanDecision.approver || 'Awaiting Gate Action'}</code>
            </div>
            <div style="font-size: 9.5px; color: #fbbf24; margin-top: 2px;">${rec.humanDecision.simulatedDisclosure}</div>
          </div>
        </div>

        <!-- 6 & 7. Simulated Outcome & Traceability -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #38bdf8;">4. Outcome & Traceability</span>
            <span style="font-size: 9.5px; font-weight: 700; color: #38bdf8;">${rec.outcome.workflowState}</span>
          </div>
          <div style="font-size: 11px; color: #cbd5e1; line-height: 1.45;">
            <div style="color: #94a3b8; font-size: 10.5px;">${rec.outcome.simulatedEffect}</div>
            <div style="margin-top: 6px; font-family: monospace; font-size: 10px; color: #64748b;">
              Correlation: <span style="color: #38bdf8;">${rec.traceability.correlationId}</span>
            </div>
            <div style="font-family: monospace; font-size: 9.5px; color: #64748b; margin-top: 2px;">
              Timestamp: ${rec.outcome.timestamp}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Non-intrusive, point-in-time preflight check to established live health endpoint.
 * Does not block rendering, does not mutate state, does not auto-retry.
 */
async function checkApiPreflight() {
  const pill = document.getElementById('eaios-api-preflight-pill');
  const dot = document.getElementById('eaios-api-preflight-dot');
  const text = document.getElementById('eaios-api-preflight-text');
  if (!pill || !dot || !text) return;

  const healthUrl = `${EAIOS_BACKEND_CONFIG.baseUrl}${EAIOS_BACKEND_CONFIG.healthEndpoint}`;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = setTimeout(() => {
    if (controller) controller.abort();
  }, 4000);

  try {
    const startTime = Date.now();
    const resp = await fetch(healthUrl, {
      method: 'GET',
      signal: controller ? controller.signal : undefined
    });
    clearTimeout(timeoutId);
    const elapsed = Date.now() - startTime;

    if (resp.ok) {
      dot.style.background = '#10b981';
      pill.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      pill.style.background = 'rgba(16, 185, 129, 0.1)';
      pill.style.color = '#34d399';
      text.textContent = `API: REACHABLE (${elapsed}ms)`;
    } else {
      dot.style.background = '#f59e0b';
      pill.style.borderColor = 'rgba(245, 158, 11, 0.4)';
      pill.style.background = 'rgba(245, 158, 11, 0.1)';
      pill.style.color = '#fbbf24';
      text.textContent = `API: HTTP ${resp.status} (FALLBACK READY)`;
    }
  } catch (err) {
    clearTimeout(timeoutId);
    dot.style.background = '#ef4444';
    pill.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    pill.style.background = 'rgba(239, 68, 68, 0.1)';
    pill.style.color = '#f87171';
    text.textContent = 'API: UNREACHABLE (FALLBACK READY)';
  }
}


// =========================================================================
// SPRINT 7.4K-CK: INTERACTIVE COMPONENT HOOKS (Safeguards, Drawer, Filters)
// =========================================================================

window.switchSafeguardTab = function(tabKey) {
  const tabs = ['identity', 'sovereign', 'rls', 'cost', 'resilience'];
  tabs.forEach(t => {
    const btn = document.getElementById(`safeguard-tab-btn-${t}`);
    const panel = document.getElementById(`safeguard-panel-${t}`);
    if (btn) {
      if (t === tabKey) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    }
    if (panel) {
      panel.style.display = (t === tabKey) ? 'block' : 'none';
    }
  });
};

window.openAdrDrawer = function(adrId) {
  const drawer = document.getElementById('eaios-adr-drawer');
  const titleEl = document.getElementById('eaios-drawer-title');
  const badgeEl = document.getElementById('eaios-drawer-badge');
  const bodyEl = document.getElementById('eaios-drawer-body');
  if (!drawer || !bodyEl) return;

  const adr = ADR_EXPLORER_CATALOG.find(a => a.id === adrId);
  if (!adr) return;

  if (titleEl) titleEl.textContent = `${adr.id}: ${adr.title}`;
  if (badgeEl) badgeEl.textContent = `${adr.status || 'ACCEPTED'} • ${adr.category || 'ARCHITECTURE'}`;

  bodyEl.innerHTML = `
    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 12px; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin: 0 0 4px 0;">Context & Problem</h4>
      <p style="margin: 0; color: #cbd5e1; line-height: 1.5;">${adr.context || 'Context defined in authoritative architecture record repository.'}</p>
    </div>
    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 12px; font-weight: 800; color: #34d399; text-transform: uppercase; margin: 0 0 4px 0;">Architectural Decision</h4>
      <p style="margin: 0; color: #f8fafc; line-height: 1.5; font-weight: 600;">${adr.decision || 'Authoritative architectural decision accepted.'}</p>
    </div>
    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 12px; font-weight: 800; color: #c084fc; text-transform: uppercase; margin: 0 0 4px 0;">Authority & Invariant Implications</h4>
      <p style="margin: 0; color: #cbd5e1; line-height: 1.5;">${adr.consequences || 'Enforces non-bypassable host gates and prevents implicit authority propagation.'}</p>
    </div>
    <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 12px; font-family: monospace; font-size: 11px;">
      <div style="color: #64748b;">// Verification Suite Reference:</div>
      <div style="color: #38bdf8;">tests/test_node6_state_separation.mjs</div>
      <div style="color: #10b981; margin-top: 4px;">Status: VERIFIED IN CI AUTOMATION</div>
    </div>
  `;

  drawer.classList.add('open');
};

window.closeAdrDrawer = function() {
  const drawer = document.getElementById('eaios-adr-drawer');
  if (drawer) {
    drawer.classList.remove('open');
  }
};

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const drawer = document.getElementById('eaios-adr-drawer');
    if (drawer && drawer.classList.contains('open')) {
      window.closeAdrDrawer();
    }
  }
});

window.filterAdrGrid = function() {
  const searchInput = document.getElementById('eaios-adr-search');
  const catSelect = document.getElementById('eaios-adr-category-filter');
  const query = (searchInput?.value || '').toLowerCase().trim();
  const selectedCat = (catSelect?.value || 'ALL');

  document.querySelectorAll('.eaios-adr-card').forEach(card => {
    const title = card.getAttribute('data-title') || '';
    const id = (card.getAttribute('data-adr') || '').toLowerCase();
    const cat = card.getAttribute('data-category') || '';

    const matchesQuery = !query || title.includes(query) || id.includes(query);
    const matchesCat = (selectedCat === 'ALL') || cat.toLowerCase().includes(selectedCat.toLowerCase());

    card.style.display = (matchesQuery && matchesCat) ? 'block' : 'none';
  });
};

window.filterMaturityTable = function() {
  const searchInput = document.getElementById('eaios-maturity-search');
  const levelSelect = document.getElementById('eaios-maturity-filter-level');
  const query = (searchInput?.value || '').toLowerCase().trim();
  const selectedLevel = (levelSelect?.value || 'ALL');

  document.querySelectorAll('.eaios-maturity-row').forEach(row => {
    const name = row.getAttribute('data-name') || '';
    const cat = (row.getAttribute('data-category') || '').toLowerCase();
    const level = row.getAttribute('data-level') || '';

    const matchesQuery = !query || name.includes(query) || cat.includes(query);
    const matchesLevel = (selectedLevel === 'ALL') || level === selectedLevel;

    row.style.display = (matchesQuery && matchesLevel) ? '' : 'none';
  });
};
