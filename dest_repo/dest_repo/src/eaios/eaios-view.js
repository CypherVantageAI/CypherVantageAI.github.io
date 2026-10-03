/**
 * EAIOS Public Showcase Baseline View
 * Stage 12.5 (Frozen Baseline: 0302d44713cae7f40ba062f77bddded071fb202c)
 *
 * Core Invariant: "MODEL ≠ AUTHORITY | WORKER ≠ AUTHORITY | HUMAN APPROVAL ≠ CAPABILITY AUTHORITY | EAIES = EXECUTION AUTHORITY"
 */

import {
  EAIOS_FROZEN_BASELINE,
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

export function renderEaiosModule() {
  const container = document.getElementById('view-manager-eaios');
  if (!container) return;

  if (!isInitialized) {
    container.innerHTML = generateEaiosHtml();
    initializeComponents();
    isInitialized = true;
  }
}

function generateEaiosHtml() {
  return `
    <div class="eaios-view-wrapper" style="padding: 24px; max-width: 1440px; margin: 0 auto; color: var(--text-primary, #e2e8f0); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">

      <!-- 1. FROZEN BASELINE STATUS BAR (STAGE 12.5) -->
      <div class="eaios-frozen-header" style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(10, 15, 28, 0.98)); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.6);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.35); padding: 4px 12px; border-radius: 9999px; margin-bottom: 10px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981;"></span>
              <span style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">FROZEN ARCHITECTURAL BASELINE: ${EAIOS_FROZEN_BASELINE.stage}</span>
            </div>
            <h1 style="font-size: 24px; font-weight: 800; margin: 0 0 6px 0; color: #f8fafc; letter-spacing: -0.02em;">
              EAIOS Sovereign Architecture & Reference Control Plane
            </h1>
            <p style="font-size: 13px; color: #94a3b8; margin: 0; max-width: 860px; line-height: 1.5;">
              AI coordinates work across multi-agent pipelines. Deterministic infrastructure retains non-bypassable authority over execution, resources, tenancy, and human approval.
            </p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 4px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 700; font-family: monospace;">
                ${EAIOS_FROZEN_BASELINE.testCount}
              </span>
              <span style="background: rgba(167, 139, 250, 0.15); color: #c084fc; border: 1px solid rgba(167, 139, 250, 0.4); padding: 4px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 700; font-family: monospace;">
                ${EAIOS_FROZEN_BASELINE.pgVerifiedSuites}
              </span>
            </div>
            <div style="font-size: 10.5px; color: #64748b; font-family: monospace;">
              Commit: <code style="color: #38bdf8;">${EAIOS_FROZEN_BASELINE.commit}</code> • Tag: <code style="color: #cbd5e1;">${EAIOS_FROZEN_BASELINE.tag}</code>
            </div>
          </div>
        </div>

        <!-- Evidence Classification Bar -->
        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 11px;">
          <span style="color: #64748b; font-weight: 700; text-transform: uppercase;">Evidence Tiers:</span>
          ${Object.values(EVIDENCE_BADGES).map(b => `
            <span style="background: ${b.bg}; color: ${b.color}; border: 1px solid ${b.border}; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 10px;" title="${b.description}">
              ${b.label}
            </span>
          `).join('')}
        </div>
      </div>

      <!-- 2. SCENARIO SELECTOR & INTERACTIVE RUNNER BAR -->
      <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 16px; font-weight: 800; color: #f8fafc;">Interactive Verification Scenarios</div>
            <div style="font-size: 12px; color: #94a3b8;">Select an architectural scenario to explore the deterministic state machine in action.</div>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button id="eaios-scenario-btn-a" class="eaios-scen-btn active" style="background: #2563eb; color: #fff; border: 1px solid #3b82f6; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">
              Scenario A: Autonomous
            </button>
            <button id="eaios-scenario-btn-b" class="eaios-scen-btn" style="background: rgba(15, 23, 42, 0.7); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">
              Scenario B: HITL Approval
            </button>
            <button id="eaios-scenario-btn-c" class="eaios-scen-btn" style="background: rgba(15, 23, 42, 0.7); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">
              Scenario C: Rejection & Compensation
            </button>
            <button id="eaios-scenario-btn-d" class="eaios-scen-btn" style="background: rgba(15, 23, 42, 0.7); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">
              Scenario D: Governed Knowledge
            </button>
          </div>
        </div>

        <!-- Active Scenario Description Banner -->
        <div id="eaios-active-scenario-card" style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 8px; padding: 14px 18px; margin-bottom: 16px;">
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
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; gap: 10px;">
            <button id="eaios-btn-run" style="background: #10b981; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 700; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
              ▶ Run Selected Scenario
            </button>
            <button id="eaios-btn-reset" style="background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3); padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer;">
              Reset
            </button>
          </div>
          <div style="display: flex; gap: 10px; font-size: 11px; color: #94a3b8;">
            <span>Correlation ID: <code style="color: #38bdf8;">CORR-2026-000741</code></span>
            <span>•</span>
            <span>OCC Fencing: <strong style="color: #10b981;">v1.0 (ACID Serialized)</strong></span>
          </div>
        </div>

        <!-- HUMAN APPROVAL INTERACTIVE OPERATOR MODAL / BANNER (ADR-032) -->
        <div id="eaios-approval-banner" style="display: none; margin-top: 16px; background: rgba(245, 158, 11, 0.12); border: 2px dashed #f59e0b; border-radius: 8px; padding: 18px; animation: pulse-border 2s infinite;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
            <div style="flex: 1; min-width: 280px;">
              <div style="display: inline-flex; align-items: center; gap: 6px; color: #fbbf24; font-weight: 800; font-size: 13.5px;">
                <span>⚠️</span>
                <span>WORKFLOW PAUSED: Human Governance Decision Gate (ADR-032 / PG Test P1)</span>
              </div>
              <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px; line-height: 1.45;">
                State: <code>PAUSED_PENDING_INPUT</code>. Work Owner: <code style="color: #38bdf8;">alice@enterprise.example</code>.
                Four-Eyes rule mandates that the work owner cannot approve high-impact actions.
              </div>

              <!-- Interactive Form Inputs -->
              <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-top: 12px;">
                <div>
                  <label style="font-size: 10.5px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Approver Identity:</label>
                  <select id="eaios-operator-select" style="width: 100%; background: #0f172a; color: #f8fafc; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; padding: 6px 8px; font-size: 11.5px; margin-top: 3px;">
                    <option value="bob@enterprise.example">bob@enterprise.example (Authorized Approver)</option>
                    <option value="alice@enterprise.example">alice@enterprise.example (Work Owner - Test 4-Eyes Deny)</option>
                  </select>
                </div>
                <div>
                  <label style="font-size: 10.5px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Decision Rationale (Mandatory):</label>
                  <input type="text" id="eaios-operator-rationale" value="Approved for production run after secondary audit." style="width: 100%; background: #0f172a; color: #f8fafc; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; padding: 6px 8px; font-size: 11.5px; margin-top: 3px;" />
                </div>
              </div>
            </div>

            <!-- Decision Action Buttons -->
            <div style="display: flex; flex-direction: column; gap: 8px; min-width: 160px; margin-top: 10px;">
              <button id="eaios-btn-approve-action" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);">
                ✓ APPROVE & RESUME
              </button>
              <button id="eaios-btn-reject-action" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.35);">
                ✗ REJECT & COMPENSATE
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. MAIN WORKSPACE: DAG TOPOLOGY & LIVE INSPECTOR -->
      <div style="display: grid; grid-template-columns: 1.8fr 1.2fr; gap: 24px; margin-bottom: 24px;">

        <!-- DAG TOPOLOGY VIEWER -->
        <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">Governed DAG Execution Frontier</div>
              <div style="font-size: 11.5px; color: #94a3b8;">Click any node to inspect durable state, authority envelope, and tenant RLS isolation.</div>
            </div>
            <div style="display: flex; gap: 8px; font-size: 10.5px; align-items: center; flex-wrap: wrap;">
              <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #64748b;"></span> PENDING</span>
              <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #8b5cf6;"></span> EXECUTING</span>
              <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b;"></span> PAUSED</span>
              <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span> COMPLETED</span>
              <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #ec4899;"></span> COMPENSATED</span>
              <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #475569;"></span> SKIPPED</span>
            </div>
          </div>

          <div id="eaios-dag-container" style="flex: 1; min-height: 380px; background: rgba(10, 11, 16, 0.8); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; overflow-x: auto; position: relative;">
            <!-- SVG DAG rendered dynamically by EaiosRenderer -->
          </div>
        </div>

        <!-- LIVE STATE, EAIES & GOVERNANCE INSPECTOR -->
        <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">Sovereign Node & Authority Inspector</div>
            <span style="font-size: 10px; color: #38bdf8; font-family: monospace; background: rgba(56, 189, 248, 0.1); padding: 2px 6px; border-radius: 4px;">
              H-01 SOVEREIGN
            </span>
          </div>
          <div style="font-size: 11.5px; color: #94a3b8; margin-bottom: 14px;">Real-time inspection of active worker leases and EAIES policy decisions</div>

          <div id="eaios-inspector-content" style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
            <!-- Dynamically populated in updateInspector() -->
          </div>
        </div>
      </div>

      <!-- 4. CROSS-CUTTING GOVERNANCE: RLS, COST & PROVIDER RECOVERY -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 24px;">

        <!-- CARD 1: POSTGRESQL ENGINE RLS ISOLATION (ADR-030) -->
        <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(167, 139, 250, 0.3); border-radius: 12px; padding: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 14px; font-weight: 800; color: #f8fafc;">PostgreSQL Engine RLS Isolation</div>
            <span style="font-size: 9.5px; font-weight: 800; color: #a78bfa; background: rgba(167, 139, 250, 0.15); padding: 1px 6px; border-radius: 3px; border: 1px solid rgba(167, 139, 250, 0.3);">
              ADR-030
            </span>
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 12px;">Data isolation enforced at engine boundary via <code>SET LOCAL app.current_tenant_id</code>.</div>

          <div style="display: flex; gap: 8px; margin-bottom: 10px;">
            <button id="eaios-btn-rls-fin" style="flex: 1; background: #0f172a; color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); padding: 6px; border-radius: 4px; font-size: 10.5px; font-weight: 700; cursor: pointer;">
              Tenant: ACME-FINANCE
            </button>
            <button id="eaios-btn-rls-ret" style="flex: 1; background: #0f172a; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); padding: 6px; border-radius: 4px; font-size: 10.5px; font-weight: 700; cursor: pointer;">
              Tenant: ACME-RETAIL
            </button>
          </div>

          <div id="eaios-rls-output" style="background: rgba(10, 11, 16, 0.8); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; padding: 10px; font-family: monospace; font-size: 10.5px; min-height: 80px; color: #cbd5e1;">
            <div style="color: #64748b;">// Active session tenant:</div>
            <div style="color: #38bdf8; font-weight: 700;">app.current_tenant_id = 'ACME-FINANCE'</div>
            <div style="color: #10b981; margin-top: 4px;">✓ Returned: "Q3 Statutory Solvency & Capital Reserves" (1 row)</div>
          </div>
          <div style="font-size: 10px; color: #a78bfa; margin-top: 8px; text-align: right;">
            Evidence: Live PostgreSQL 15.14 RLS Concurrency Suite (PASS)
          </div>
        </div>

        <!-- CARD 2: RESOURCE & COST GOVERNANCE (ADR-022) -->
        <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 14px; font-weight: 800; color: #f8fafc;">Resource & Cost Governance</div>
            <span style="font-size: 9.5px; font-weight: 800; color: #34d399; background: rgba(16, 185, 129, 0.15); padding: 1px 6px; border-radius: 3px; border: 1px solid rgba(16, 185, 129, 0.3);">
              ADR-022
            </span>
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 12px;">Mandatory pre-reservation of token budget prior to physical provider dispatch.</div>

          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
            <span>Budget: <strong style="color: #f8fafc;">10,000 Tokens</strong></span>
            <span id="eaios-budget-remaining">Available: <strong style="color: #34d399;">7,150</strong></span>
          </div>

          <!-- Progress Bar -->
          <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-bottom: 12px;">
            <div id="eaios-budget-bar" style="width: 71.5%; height: 100%; background: #10b981; transition: width 0.3s;"></div>
          </div>

          <div style="display: flex; gap: 8px;">
            <button id="eaios-btn-deny-budget" style="flex: 1; background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.35); padding: 6px; border-radius: 4px; font-size: 10.5px; font-weight: 700; cursor: pointer;">
              ⚡ Test Excessive Spend Deny (8.5k Tokens)
            </button>
          </div>
          <div style="font-size: 10px; color: #10b981; margin-top: 8px; text-align: right;">
            Evidence: Host-enforced hard financial kill switch
          </div>
        </div>

        <!-- CARD 3: PROVIDER TIMEOUT & UNKNOWN OUTCOME RECOVERY (ADR-028) -->
        <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 14px; font-weight: 800; color: #f8fafc;">Provider Timeout & Unknown State</div>
            <span style="font-size: 9.5px; font-weight: 800; color: #f87171; background: rgba(239, 68, 68, 0.15); padding: 1px 6px; border-radius: 3px; border: 1px solid rgba(239, 68, 68, 0.3);">
              ADR-028
            </span>
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 12px;">Unknown outcomes are NOT assumed zero cost. Conservative reconciliation applied.</div>

          <div id="eaios-provider-timeout-box" style="background: rgba(10, 11, 16, 0.8); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; padding: 10px; font-family: monospace; font-size: 10.5px; min-height: 80px; color: #cbd5e1; margin-bottom: 10px;">
            <div style="color: #64748b;">// Provider dispatch status:</div>
            <div style="color: #38bdf8;">Gateway status: HEALTHY (Circuit CLOSED)</div>
          </div>

          <button id="eaios-btn-provider-timeout" style="width: 100%; background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35); padding: 6px; border-radius: 4px; font-size: 10.5px; font-weight: 700; cursor: pointer;">
            ⚡ Simulate Provider Socket Timeout
          </button>
          <div style="font-size: 10px; color: #f59e0b; margin-top: 8px; text-align: right;">
            Evidence: Conservative Cost Reconciliation Engine
          </div>
        </div>
      </div>

      <!-- 5. AUDIT EVENT STREAM & FORENSIC TIMELINE -->
      <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <div style="font-size: 15px; font-weight: 800; color: #f8fafc;">Enterprise Forensic Audit Stream (ADR-026)</div>
            <div style="font-size: 11.5px; color: #94a3b8;">Append-only forensic event ledger recording all state transitions under unbroken root correlation ID.</div>
          </div>
          <span style="font-size: 10px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 3px 8px; border-radius: 4px; font-weight: 700;">
            Causal Correlation: CORR-2026-000741
          </span>
        </div>

        <div id="eaios-audit-log" style="height: 240px; overflow-y: auto; background: rgba(10, 11, 16, 0.9); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 11px; display: flex; flex-direction: column; gap: 6px;">
          <div style="color: #64748b; text-align: center; padding-top: 100px;">Awaiting workflow execution event stream...</div>
        </div>
      </div>

      <!-- 6. 10 CORE ARCHITECTURAL INVARIANTS -->
      <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="font-size: 16px; font-weight: 800; color: #f8fafc; margin-bottom: 4px;">10 Core Architectural Invariants</div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 16px;">Core governance guarantees verified across EAIOS architecture and automated test suites.</div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px;">
          ${CORE_INVARIANTS.map(inv => `
            <div style="background: rgba(10, 11, 16, 0.6); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <span style="font-weight: 800; font-size: 12.5px; color: #38bdf8;">${inv.id}. ${inv.title}</span>
                <span style="font-size: 9px; color: #10b981; font-weight: 800; background: rgba(16, 185, 129, 0.15); padding: 2px 6px; border-radius: 3px; border: 1px solid rgba(16, 185, 129, 0.3);">
                  ${inv.adrRef}
                </span>
              </div>
              <div style="font-size: 11px; color: #cbd5e1; margin-top: 6px; line-height: 1.45;">${inv.rule}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 7. ADR & ARCHITECTURE EXPLORER -->
      <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <div style="font-size: 16px; font-weight: 800; color: #f8fafc;">Architectural Decision Record (ADR) Explorer</div>
            <div style="font-size: 12px; color: #94a3b8;">Discover the formal decisions governing EAIOS execution authority, tenancy, and resilience.</div>
          </div>
          <span style="font-size: 11px; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 3px 10px; border-radius: 4px; font-weight: 700;">
            12 Canonical ADRs
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px;">
          ${ADR_EXPLORER_CATALOG.map(adr => `
            <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
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
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 8. STAGE MATURITY TIMELINE -->
      <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px;">
        <div style="font-size: 16px; font-weight: 800; color: #f8fafc; margin-bottom: 4px;">EAIOS Architectural Evolution (Stage 1 to Stage 12.5 Frozen)</div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 16px;">Progression of formal verification across execution kernel, resilience, tenancy, and HITL governance.</div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${STAGE_MATURITY_TIMELINE.map(stg => `
            <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-family: monospace; font-size: 11px; font-weight: 800; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 2px 8px; border-radius: 4px;">${stg.stage}</span>
                  <span style="font-weight: 700; font-size: 13px; color: #f8fafc;">${stg.title}</span>
                </div>
                <div style="font-size: 11.5px; color: #94a3b8; margin-top: 4px;">${stg.focus}</div>
              </div>
              <div style="font-size: 10.5px; color: #10b981; font-family: monospace; background: rgba(16, 185, 129, 0.1); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.2);">
                ${stg.evidence}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

function initializeComponents() {
  const dagContainer = document.getElementById('eaios-dag-container');
  renderer = new EaiosRenderer(dagContainer, {
    onNodeSelect: (node) => {
      simManager.selectNode(node.id);
      updateInspector(node);
    }
  });

  const auditLog = document.getElementById('eaios-audit-log');
  simManager = new EaiosSimulationManager(renderer, auditLog, (state) => {
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

  // Initial render
  simManager.reset();
  const initialNodes = simManager.getCurrentNodes();
  updateInspector(initialNodes[0]);

  // Scenario Buttons
  const scenBtnA = document.getElementById('eaios-scenario-btn-a');
  const scenBtnB = document.getElementById('eaios-scenario-btn-b');
  const scenBtnC = document.getElementById('eaios-scenario-btn-c');
  const scenBtnD = document.getElementById('eaios-scenario-btn-d');

  function updateScenarioButtons(activeBtn, scenarioKey) {
    document.querySelectorAll('.eaios-scen-btn').forEach(btn => {
      btn.style.background = 'rgba(15, 23, 42, 0.7)';
      btn.style.color = '#94a3b8';
      btn.style.borderColor = 'rgba(255,255,255,0.1)';
    });
    activeBtn.style.background = '#2563eb';
    activeBtn.style.color = '#fff';
    activeBtn.style.borderColor = '#3b82f6';

    const info = SHOWCASE_SCENARIOS[scenarioKey];
    if (info) {
      document.getElementById('eaios-scen-title').textContent = info.name;
      document.getElementById('eaios-scen-subtitle').textContent = info.subtitle;
      document.getElementById('eaios-scen-desc').textContent = info.description;
      document.getElementById('eaios-scen-evid').textContent = info.evidenceRef;
    }
  }

  if (scenBtnA) {
    scenBtnA.onclick = () => {
      simManager.setScenario('scenario_a');
      updateScenarioButtons(scenBtnA, 'SCENARIO_A');
      updateInspector(simManager.getCurrentNodes()[0]);
    };
  }
  if (scenBtnB) {
    scenBtnB.onclick = () => {
      simManager.setScenario('scenario_b');
      updateScenarioButtons(scenBtnB, 'SCENARIO_B');
      updateInspector(simManager.getCurrentNodes()[0]);
    };
  }
  if (scenBtnC) {
    scenBtnC.onclick = () => {
      simManager.setScenario('scenario_c');
      updateScenarioButtons(scenBtnC, 'SCENARIO_C');
      updateInspector(simManager.getCurrentNodes()[0]);
    };
  }
  if (scenBtnD) {
    scenBtnD.onclick = () => {
      simManager.setScenario('scenario_d');
      updateScenarioButtons(scenBtnD, 'SCENARIO_D');
      updateInspector(simManager.getCurrentNodes()[0]);
    };
  }

  // Execution buttons
  const btnRun = document.getElementById('eaios-btn-run');
  const btnReset = document.getElementById('eaios-btn-reset');
  const btnApprove = document.getElementById('eaios-btn-approve-action');
  const btnReject = document.getElementById('eaios-btn-reject-action');

  if (btnRun) btnRun.onclick = () => simManager.runActiveScenario();
  if (btnReset) {
    btnReset.onclick = () => {
      simManager.reset();
      updateInspector(simManager.getCurrentNodes()[0]);
    };
  }

  if (btnApprove) {
    btnApprove.onclick = () => {
      const email = document.getElementById('eaios-operator-select')?.value || 'bob@enterprise.example';
      const rationale = document.getElementById('eaios-operator-rationale')?.value || 'Approved for production.';
      simManager.submitHumanDecision('APPROVE', email, rationale);
    };
  }

  if (btnReject) {
    btnReject.onclick = () => {
      const email = document.getElementById('eaios-operator-select')?.value || 'bob@enterprise.example';
      const rationale = document.getElementById('eaios-operator-rationale')?.value || 'Reallocation cancelled.';
      simManager.submitHumanDecision('REJECT', email, rationale);
    };
  }

  // RLS interactive buttons
  const btnRlsFin = document.getElementById('eaios-btn-rls-fin');
  const btnRlsRet = document.getElementById('eaios-btn-rls-ret');
  const rlsOutput = document.getElementById('eaios-rls-output');

  if (btnRlsFin && rlsOutput) {
    btnRlsFin.onclick = () => {
      const res = simManager.simulateRlsQuery('ACME-FINANCE');
      rlsOutput.innerHTML = `
        <div style="color: #64748b;">// Executed: SET LOCAL app.current_tenant_id = 'ACME-FINANCE'</div>
        <div style="color: #38bdf8; font-weight: 700;">active_tenant_id = 'ACME-FINANCE'</div>
        <div style="color: #10b981; margin-top: 4px;">✓ ${res ? res.title : 'No records'} (1 row)</div>
        <div style="color: #94a3b8; font-size: 9.5px; margin-top: 2px;">${res ? res.content : ''}</div>
      `;
    };
  }

  if (btnRlsRet && rlsOutput) {
    btnRlsRet.onclick = () => {
      const res = simManager.simulateRlsQuery('ACME-RETAIL');
      rlsOutput.innerHTML = `
        <div style="color: #64748b;">// Executed: SET LOCAL app.current_tenant_id = 'ACME-RETAIL'</div>
        <div style="color: #a78bfa; font-weight: 700;">active_tenant_id = 'ACME-RETAIL'</div>
        <div style="color: #10b981; margin-top: 4px;">✓ ${res ? res.title : 'No records'} (1 row)</div>
        <div style="color: #94a3b8; font-size: 9.5px; margin-top: 2px;">${res ? res.content : ''}</div>
      `;
    };
  }

  // Cost & Provider failure buttons
  const btnDenyBudget = document.getElementById('eaios-btn-deny-budget');
  if (btnDenyBudget) {
    btnDenyBudget.onclick = () => simManager.simulateExcessiveReservation();
  }

  const btnProviderTimeout = document.getElementById('eaios-btn-provider-timeout');
  const providerBox = document.getElementById('eaios-provider-timeout-box');
  if (btnProviderTimeout && providerBox) {
    btnProviderTimeout.onclick = () => {
      simManager.simulateProviderTimeout();
      providerBox.innerHTML = `
        <div style="color: #64748b;">// Provider dispatch status:</div>
        <div style="color: #ef4444; font-weight: 700;">TIMEOUT (30,000ms) - OUTCOME UNKNOWN</div>
        <div style="color: #f59e0b; margin-top: 4px;">Conservative Governance: Billed as spent until reconciliation</div>
      `;
    };
  }
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

  container.innerHTML = `
    <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 14px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span style="font-size: 10px; font-weight: 800; color: #38bdf8; text-transform: uppercase;">${(node.category || 'node').replace('_', ' ')}</span>
          <h3 style="font-size: 14px; font-weight: 700; color: #f8fafc; margin: 2px 0 0 0;">${node.name}</h3>
        </div>
        <span style="font-size: 9.5px; font-weight: 800; padding: 2px 8px; border-radius: 4px; background: ${color}20; color: ${color}; border: 1px solid ${color}50;">
          ${status}
        </span>
      </div>
      <div style="font-size: 11px; color: #cbd5e1; margin-top: 6px; line-height: 1.4;">${node.description || 'DAG execution node.'}</div>
    </div>

    <!-- EAIES AUTHORITY CHECK PANEL -->
    <div style="background: rgba(10, 11, 16, 0.85); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; padding: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div style="font-size: 10.5px; text-transform: uppercase; color: #38bdf8; font-weight: 800;">EAIES Sovereign Gate Check</div>
        <span style="font-size: 9.5px; font-weight: 800; padding: 2px 6px; border-radius: 3px; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);">
          POLICY VALIDATED
        </span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
        <div><span style="color: #64748b;">Target Identity:</span> <code style="color: #a78bfa;">${node.employeeId || 'N/A (System)'}</code></div>
        <div><span style="color: #64748b;">Capability ID:</span> <code style="color: #38bdf8;">${node.capabilityId || 'N/A'}</code></div>
        <div><span style="color: #64748b;">Required Scope:</span> <code style="color: #34d399;">${node.authorityScope || 'orchestrator_internal'}</code></div>
        <div><span style="color: #64748b;">Tenant Binding:</span> <code style="color: #fbbf24;">ACME-FINANCE (Engine RLS)</code></div>
      </div>
    </div>

    <!-- DURABLE STATE & OCC -->
    <div style="background: rgba(10, 11, 16, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px;">
      <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px;">Durable State & OCC Isolation</div>
      <div style="font-size: 11px; color: #94a3b8;">Worker Lease: <span style="color: #cbd5e1;">${status === 'EXECUTING' ? (node.workerBadge || 'worker [ACTIVE]') : 'Released / Unclaimed'}</span></div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">OCC Entity Version: <code style="color: #38bdf8;">v${node.version || 1}</code></div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Correlation: <code style="color: #38bdf8;">CORR-2026-000741</code></div>
    </div>
  `;
}
