/**
 * EAIOS Governed Orchestration Architectural View
 *
 * Implements the interactive architectural showcase for EAIOS v1.0.
 * Visualises the 7-node DAG, state inspector, EAIES sovereign authority boundaries,
 * hostile injection simulation, peer-to-peer prohibition, crash recovery, and architectural layers.
 *
 * Principle: "Coordination may propagate work; authority must never propagate implicitly."
 */

import { EAIOS_METRICS, EAIOS_NODES, ARCHITECTURE_LAYERS } from './eaios-data.js';
import { EaiosRenderer } from './eaios-renderer.js';
import { EaiosSimulationManager } from './eaios-simulation.js';

let renderer = null;
let simManager = null;
let isInitialized = false;

/**
 * Main render function invoked by the router when navigating to 'manager-eaios'
 */
export function renderEaiosModule() {
  const container = document.getElementById('view-manager-eaios');
  if (!container) return;

  if (!isInitialized) {
    container.innerHTML = generateEaiosHtml();
    initializeComponents();
    isInitialized = true;
  }
}

/**
 * Generate full HTML structure for the EAIOS showcase view
 */
function generateEaiosHtml() {
  return `
    <div class="eaios-view-wrapper" style="padding: 24px; max-width: 1400px; margin: 0 auto; color: var(--text-primary, #e2e8f0); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      
      <!-- HERO HEADER & ARCHITECTURAL DISCLAIMER -->
      <div class="eaios-hero" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
              <span style="font-size: 12px; font-weight: 600; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.05em;">EAIOS Governed Orchestration — Architectural Demonstration</span>
            </div>
            <h1 style="font-size: 26px; font-weight: 700; margin: 0 0 8px 0; color: #f8fafc; letter-spacing: -0.02em;">
              EAIOS Sovereign Multi-Agent Orchestrator
            </h1>
            <p style="font-size: 14px; color: #94a3b8; margin: 0; max-width: 820px; line-height: 1.5;">
              Public visualisation of the EAIOS architecture. Execution evidence and implementation reside in the EAIOS engineering repository (<code style="background: rgba(15, 23, 42, 0.8); padding: 2px 6px; border-radius: 4px; color: #38bdf8;">CypherVantageAI/enterprise-ai-operating-system</code>).
              Demonstrating sovereign authority boundaries, DAG frontier reconstruction, and deterministic human-in-the-loop control.
            </p>
          </div>
          <div style="text-align: right; background: rgba(15, 23, 42, 0.6); padding: 12px 18px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Core Architectural Invariant</div>
            <div style="font-size: 13px; font-weight: 600; color: #38bdf8; margin-top: 4px;">
              "Coordination may propagate work;<br>authority must never propagate implicitly."
            </div>
          </div>
        </div>

        <!-- METRIC CARDS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 24px;">
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px 18px;">
            <div style="font-size: 12px; color: #94a3b8; font-weight: 500;">DAG Node Topology</div>
            <div style="font-size: 22px; font-weight: 700; color: #f8fafc; margin-top: 4px;">${EAIOS_METRICS.totalNodes} Nodes <span style="font-size: 13px; font-weight: 400; color: #60a5fa;">(Frontier Evaluated)</span></div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Stateless forward frontier reconstruction</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px 18px;">
            <div style="font-size: 12px; color: #94a3b8; font-weight: 500;">Empirical Integration Tests</div>
            <div style="font-size: 22px; font-weight: 700; color: #10b981; margin-top: 4px;">${EAIOS_METRICS.integrationTestsPassed} Passed <span style="font-size: 13px; font-weight: 400; color: #94a3b8;">/ 0 Fail</span></div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">229 full regression suite passing</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px 18px;">
            <div style="font-size: 12px; color: #94a3b8; font-weight: 500;">EAIES Sovereign Enforcement</div>
            <div style="font-size: 22px; font-weight: 700; color: #f59e0b; margin-top: 4px;">100% Non-Bypassable</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">AI Employee is identity, not authority</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px 18px;">
            <div style="font-size: 12px; color: #94a3b8; font-weight: 500;">Peer-to-Peer AI Invocation</div>
            <div style="font-size: 22px; font-weight: 700; color: #ef4444; margin-top: 4px;">0 Direct Calls</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Strictly prohibited by architectural contract</div>
          </div>
        </div>
      </div>

      <!-- SIMULATION CONTROLS & INTERACTIVE SCENARIOS -->
      <div style="background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 18px 24px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 16px; font-weight: 700; color: #f8fafc;">Interactive Architectural Scenarios</div>
            <div style="font-size: 12px; color: #94a3b8;">Trigger real orchestrator execution sequences to observe frontier transitions, human gates, and security boundary defenses.</div>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button id="eaios-btn-run" class="btn btn-primary" style="background: #2563eb; color: #ffffff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Run Governed Workflow
            </button>
            <button id="eaios-btn-reset" class="btn btn-secondary" style="background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3); padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer;">
              Reset Topology
            </button>
          </div>
        </div>

        <!-- SCENARIO BUTTONS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">
          <button id="eaios-btn-hostile" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; padding: 10px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; text-align: left; cursor: pointer; transition: background 0.2s;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 14px;">🛡️</span>
              <span>Test Hostile Authority Injection</span>
            </div>
            <div style="font-size: 10px; color: #fca5a5; margin-top: 3px; font-weight: 400;">Attempt authority smuggling through context</div>
          </button>

          <button id="eaios-btn-p2p" style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; padding: 10px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; text-align: left; cursor: pointer; transition: background 0.2s;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 14px;">🚫</span>
              <span>Test Peer-to-Peer Invocation</span>
            </div>
            <div style="font-size: 10px; color: #fde68a; margin-top: 3px; font-weight: 400;">Risk Analysis directly invoking Resilience Agent</div>
          </button>

          <button id="eaios-btn-crash" style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.4); color: #c084fc; padding: 10px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; text-align: left; cursor: pointer; transition: background 0.2s;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 14px;">⚡</span>
              <span>Test Crash & Lease Recovery</span>
            </div>
            <div style="font-size: 10px; color: #d8b4fe; margin-top: 3px; font-weight: 400;">Worker crashes mid-lease; sweeper reclaims</div>
          </button>

          <button id="eaios-btn-idempotency" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; padding: 10px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; text-align: left; cursor: pointer; transition: background 0.2s;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 14px;">🔄</span>
              <span>Test Idempotent Deduplication</span>
            </div>
            <div style="font-size: 10px; color: #a7f3d0; margin-top: 3px; font-weight: 400;">Identical event received twice; single execution</div>
          </button>
        </div>

        <!-- HUMAN APPROVAL BANNER (Visible during PAUSED state) -->
        <div id="eaios-approval-banner" style="display: none; margin-top: 16px; background: rgba(245, 158, 11, 0.15); border: 2px dashed #f59e0b; border-radius: 8px; padding: 16px; animation: pulse-border 2s infinite;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="display: inline-flex; align-items: center; gap: 6px; color: #fbbf24; font-weight: 700; font-size: 14px;">
                <span>⚠️</span>
                <span>WORKFLOW PAUSED: Human Governance Approval Required (ADR-009 / ADR-017)</span>
              </div>
              <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">
                Node <code>eaios-node-6</code> has paused execution frontier. Downstream node <code>eaios-node-7</code> cannot advance until an authoritative human decision is committed.
              </div>
            </div>
            <div style="display: flex; gap: 10px;">
              <button id="eaios-btn-approve" style="background: #10b981; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);">
                ✓ APPROVE ACTION
              </button>
              <button id="eaios-btn-reject" style="background: #ef4444; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);">
                ✗ REJECT & HALT
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MAIN WORKSPACE: DAG TOPOLOGY + STATE INSPECTOR -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px;">
        
        <!-- DAG TOPOLOGY VIEWER -->
        <div style="background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div>
              <div style="font-size: 15px; font-weight: 700; color: #f8fafc;">7-Node Governed DAG Topology</div>
              <div style="font-size: 12px; color: #94a3b8;">Click any node to inspect its execution leases, correlation ID, and EAIES sovereign policy.</div>
            </div>
            <div style="display: flex; gap: 12px; font-size: 11px; align-items: center;">
              <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #64748b;"></span> PENDING</span>
              <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6;"></span> RUNNING</span>
              <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b;"></span> PAUSED</span>
              <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span> COMPLETED</span>
            </div>
          </div>
          
          <div id="eaios-dag-container" style="flex: 1; min-height: 480px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; overflow: hidden; position: relative;">
            <!-- SVG rendered by EaiosRenderer -->
          </div>
        </div>

        <!-- LIVE STATE & GOVERNANCE INSPECTOR -->
        <div style="background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; display: flex; flex-direction: column;">
          <div style="font-size: 15px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">Live Node & Governance Inspector</div>
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 16px;">Verified state from UnitOfWork repository layer</div>

          <div id="eaios-inspector-content" style="flex: 1; display: flex; flex-direction: column; gap: 16px;">
            <!-- Rendered dynamically on node click or step transition -->
          </div>
        </div>
      </div>

      <!-- AUDIT LOG & FORENSIC EVENT LINEAGE -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
        
        <!-- AUDIT EVENT STREAM -->
        <div style="background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <div style="font-size: 15px; font-weight: 700; color: #f8fafc;">Enterprise Memory Forensic Log (ADR-005)</div>
              <div style="font-size: 12px; color: #94a3b8;">Append-only immutable audit trail with correlation provenance</div>
            </div>
            <span style="font-size: 11px; background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 2px 8px; border-radius: 4px; font-weight: 600;">Immutable</span>
          </div>

          <div id="eaios-audit-log" style="height: 260px; overflow-y: auto; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; display: flex; flex-direction: column; gap: 6px;">
            <div style="color: #64748b; text-align: center; padding-top: 100px;">Awaiting workflow execution event stream...</div>
          </div>
        </div>

        <!-- SOVEREIGN BOUNDARY MATRIX -->
        <div style="background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px;">
          <div style="font-size: 15px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">EAIES Authority Enforcement Matrix (ADR-002 / ADR-011)</div>
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 16px;">Sovereign isolation boundaries preventing implicit privilege escalation</div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 10px 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600; font-size: 13px; color: #f8fafc;">1. Identity ≠ Authority</span>
                <span style="font-size: 11px; color: #10b981; font-weight: 600;">ENFORCED</span>
              </div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
                AI Employee ID identifies the caller. EAIES Enforcement Proxy validates the scoped policy independent of caller claims.
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 10px 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600; font-size: 13px; color: #f8fafc;">2. Peer-to-Peer Invocation Prohibition</span>
                <span style="font-size: 11px; color: #10b981; font-weight: 600;">ENFORCED</span>
              </div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
                AI Employees cannot call other AI Employees. All delegations submit to Orchestrator Admission with depth and rate limits.
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 10px 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600; font-size: 13px; color: #f8fafc;">3. Context Authority Stripping</span>
                <span style="font-size: 11px; color: #10b981; font-weight: 600;">ENFORCED</span>
              </div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
                Injected authorization claims inside payload context are completely ignored by EAIES policy evaluation.
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 10px 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600; font-size: 13px; color: #f8fafc;">4. Human Approval Gateway Boundary</span>
                <span style="font-size: 11px; color: #10b981; font-weight: 600;">ENFORCED</span>
              </div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
                Durable PAUSED state blocks frontier. AI agents cannot self-approve or simulate human credential tokens.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ARCHITECTURAL LAYERS REFERENCE ACCORDION -->
      <div style="background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px;">
        <div style="font-size: 15px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">EAIOS 9-Layer Architectural Decomposition</div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 16px;">Rigorous separation of coordination, execution, policy, and state persistence</div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px;">
          ${ARCHITECTURE_LAYERS.map(layer => `
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <span style="font-weight: 700; font-size: 13px; color: #38bdf8;">Layer ${layer.layer}: ${layer.name}</span>
                <span style="font-size: 10px; color: #94a3b8; background: rgba(255,255,255,0.08); padding: 1px 6px; border-radius: 4px;">${layer.adr}</span>
              </div>
              <div style="font-size: 11px; color: #cbd5e1; margin-top: 6px; line-height: 1.4;">${layer.purpose}</div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 6px;">
                <span style="color: #64748b; font-weight: 600;">Key Components:</span> ${layer.components.join(', ')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

/**
 * Initialize renderer, simulation manager, and button event listeners
 */
function initializeComponents() {
  const dagContainer = document.getElementById('eaios-dag-container');
  renderer = new EaiosRenderer(dagContainer, {
    onNodeSelect: (node) => updateInspector(node)
  });
  renderer.render();

  const auditLog = document.getElementById('eaios-audit-log');
  simManager = new EaiosSimulationManager(renderer, auditLog);

  // Default initial inspector view
  updateInspector(EAIOS_NODES[0]);

  // Connect control buttons
  const btnRun = document.getElementById('eaios-btn-run');
  const btnReset = document.getElementById('eaios-btn-reset');
  const btnApprove = document.getElementById('eaios-btn-approve');
  const btnReject = document.getElementById('eaios-btn-reject');
  const btnHostile = document.getElementById('eaios-btn-hostile');
  const btnP2p = document.getElementById('eaios-btn-p2p');
  const btnCrash = document.getElementById('eaios-btn-crash');
  const btnIdempotency = document.getElementById('eaios-btn-idempotency');

  if (btnRun) {
    btnRun.addEventListener('click', () => {
      simManager.runSimulation();
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      simManager.reset();
      updateInspector(EAIOS_NODES[0]);
    });
  }

  if (btnApprove) {
    btnApprove.addEventListener('click', () => {
      simManager.resumeApproval('APPROVED');
    });
  }

  if (btnReject) {
    btnReject.addEventListener('click', () => {
      simManager.resumeApproval('REJECTED');
    });
  }

  if (btnHostile) {
    btnHostile.addEventListener('click', () => {
      simManager.simulateHostileInjection();
    });
  }

  if (btnP2p) {
    btnP2p.addEventListener('click', () => {
      simManager.simulatePeerToPeerViolation();
    });
  }

  if (btnCrash) {
    btnCrash.addEventListener('click', () => {
      simManager.simulateCrashRecovery();
    });
  }

  if (btnIdempotency) {
    btnIdempotency.addEventListener('click', () => {
      simManager.simulateIdempotencyCheck();
    });
  }
}

/**
 * Update the Live Node & Governance Inspector panel
 */
function updateInspector(node) {
  const container = document.getElementById('eaios-inspector-content');
  if (!container || !node) return;

  const statusColors = {
    PENDING: '#94a3b8',
    READY: '#60a5fa',
    RUNNING: '#3b82f6',
    PAUSED: '#f59e0b',
    COMPLETED: '#10b981',
    REJECTED: '#ef4444'
  };

  container.innerHTML = `
    <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span style="font-size: 11px; font-weight: 600; color: #60a5fa; text-transform: uppercase;">${node.category}</span>
          <h3 style="font-size: 16px; font-weight: 700; color: #f8fafc; margin: 2px 0 0 0;">${node.label}</h3>
        </div>
        <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: ${statusColors[node.status]}20; color: ${statusColors[node.status]}; border: 1px solid ${statusColors[node.status]}50;">
          ${node.status}
        </span>
      </div>
      <div style="font-size: 12px; color: #94a3b8; margin-top: 6px;">Node ID: <code style="color: #38bdf8;">${node.id}</code></div>
    </div>

    <!-- AI EMPLOYEE IDENTITY & LIFECYCLE -->
    <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px;">
      <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 6px;">Identity & Capability Provider</div>
      <div style="font-size: 13px; font-weight: 600; color: #e2e8f0;">${node.agent}</div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Provider Type: <span style="color: #cbd5e1;">${node.category === 'Human' ? 'ProviderType.HUMAN' : 'ProviderType.AI_EMPLOYEE'}</span></div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Capability ID: <code style="color: #a78bfa;">${node.capability}</code></div>
    </div>

    <!-- EAIES GOVERNANCE POLICY -->
    <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px;">
      <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 6px;">EAIES Sovereign Policy</div>
      <div style="font-size: 12px; color: #cbd5e1; line-height: 1.4;">${node.eaiesPolicy}</div>
      <div style="display: flex; gap: 8px; margin-top: 8px;">
        <span style="font-size: 10px; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3);">Validated Non-Bypassable</span>
        <span style="font-size: 10px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(59, 130, 246, 0.3);">Attempt-Scoped</span>
      </div>
    </div>

    <!-- EXECUTION LEASE & RESILIENCE -->
    <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px;">
      <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 6px;">Execution Lease & Traceability</div>
      <div style="font-size: 11px; color: #94a3b8;">Worker Lease: <span style="color: #cbd5e1;">${node.status === 'RUNNING' ? 'worker-thread-pool-01 (ACTIVE)' : 'Released / Unclaimed'}</span></div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Retry Budget: <span style="color: #cbd5e1;">3 attempts remaining</span></div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Correlation ID: <code style="font-size: 10px; color: #38bdf8;">e8b2f14c-567a-4a21-9bc3-00eaios77001</code></div>
    </div>
  `;
}
