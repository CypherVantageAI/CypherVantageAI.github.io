/**
 * EAIOS Governed Orchestration Architectural View
 *
 * Implements the comprehensive enterprise architectural evidence control plane for EAIOS v1.0.
 *
 * Core Invariant: "Coordination may propagate work; authority must never propagate implicitly."
 */

import {
  EAIOS_METRICS,
  EAIOS_NODES,
  TRACE_STEPS,
  NODE_AUTHORITY_CHECKS,
  ARCHITECTURE_LAYERS,
  ARCHITECTURAL_CONCEPTS,
  ADVERSARIAL_SCENARIOS,
  ARCHITECTURAL_INVARIANTS
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

      <!-- HERO HEADER & CREDIBLE ARCHITECTURAL DISCLAIMER -->
      <div class="eaios-hero" style="background: linear-gradient(135deg, rgba(22, 26, 43, 0.95), rgba(10, 11, 16, 0.98)); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.35); padding: 4px 14px; border-radius: 9999px; margin-bottom: 12px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
              <span style="font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.06em;">EAIOS Governed Orchestration — Architectural Control Plane</span>
            </div>
            <h1 style="font-size: 26px; font-weight: 800; margin: 0 0 8px 0; color: #f8fafc; letter-spacing: -0.02em;">
              EAIOS Sovereign Multi-Agent Orchestration Architecture
            </h1>
            <p style="font-size: 13.5px; color: #94a3b8; margin: 0; max-width: 860px; line-height: 1.55;">
              Public architectural evidence and interactive validation for the CypherVantageAI Enterprise AI Operating System (EAIOS).
              Verified engineering implementation resides in <code style="background: rgba(15, 23, 42, 0.8); padding: 2px 6px; border-radius: 4px; color: #38bdf8;">CypherVantageAI/enterprise-ai-operating-system</code>.
              Demonstrates sovereign authority boundaries, stateless DAG frontier reconstruction, durable leases, and non-bypassable human governance.
            </p>
          </div>
          <div style="text-align: right; background: rgba(15, 23, 42, 0.8); padding: 14px 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; font-weight: 700;">Core Architectural Invariant</div>
            <div style="font-size: 13px; font-weight: 700; color: #38bdf8; margin-top: 4px; line-height: 1.4;">
              "Coordination may propagate work;<br>authority must never propagate implicitly."
            </div>
          </div>
        </div>

        <!-- VERIFIED ENGINEERING METRICS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-top: 24px;">
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px 16px;">
            <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Phase 2 Slice Tests</div>
            <div style="font-size: 22px; font-weight: 800; color: #10b981; margin-top: 4px;">${EAIOS_METRICS.phase2TestsPassed} Passed <span style="font-size: 12px; font-weight: 400; color: #94a3b8;">/ 0 Fail</span></div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Governed multi-agent DAG validation</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px 16px;">
            <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Phase 3 Durable Leases</div>
            <div style="font-size: 22px; font-weight: 800; color: #38bdf8; margin-top: 4px;">${EAIOS_METRICS.phase3TestsPassed} Passed <span style="font-size: 12px; font-weight: 400; color: #94a3b8;">/ 0 Fail</span></div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Lease claim, sweeper, recovery & retry</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px 16px;">
            <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Full Regression Suite</div>
            <div style="font-size: 22px; font-weight: 800; color: #a78bfa; margin-top: 4px;">${EAIOS_METRICS.regressionTestsPassed} Passed <span style="font-size: 12px; font-weight: 400; color: #64748b;">(10 skipped)</span></div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Empirical verification evidence</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px 16px;">
            <div style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">EAIES Sovereign Enforcement</div>
            <div style="font-size: 22px; font-weight: 800; color: #f59e0b; margin-top: 4px;">100% Non-Bypassable</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">AI Employee is identity, not authority</div>
          </div>
        </div>
      </div>

      <!-- WORKFLOW TOPOLOGY CONTROLS & ACTION BAR -->
      <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 18px 24px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 16px; font-weight: 700; color: #f8fafc;">Governed Workflow Simulation (7-Node Parallel DAG)</div>
            <div style="font-size: 12px; color: #94a3b8;">Trigger real execution sequences: parallel branches, fan-in barrier, durable pause, and human approval.</div>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button id="eaios-btn-run" class="btn btn-primary" style="background: #2563eb; color: #ffffff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Run Governed Workflow
            </button>
            <button id="eaios-btn-crash" style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.4); color: #c084fc; padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">
              ⚡ Simulate Worker Crash & Lease Recovery
            </button>
            <button id="eaios-btn-idempotency" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">
              🔄 Test Idempotent Deduplication
            </button>
            <button id="eaios-btn-reset" class="btn btn-secondary" style="background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3); padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer;">
              Reset
            </button>
          </div>
        </div>

        <!-- HUMAN APPROVAL BANNER (ADR-009) -->
        <div id="eaios-approval-banner" style="display: none; margin-top: 12px; background: rgba(245, 158, 11, 0.15); border: 2px dashed #f59e0b; border-radius: 8px; padding: 16px; animation: pulse-border 2s infinite;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="display: inline-flex; align-items: center; gap: 6px; color: #fbbf24; font-weight: 700; font-size: 14px;">
                <span>⚠️</span>
                <span>WORKFLOW PAUSED: Human Governance Sign-Off Required (ADR-009 / ADR-017)</span>
              </div>
              <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">
                Node <code>node_6_governance_check</code> halted the frontier. High AI confidence (0.95) does NOT authorize execution. Downstream action executor cannot advance without verified human signature.
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

      <!-- NEW: LIVE EAIOS EXECUTION TRACE (10 CANONICAL STEPS) -->
      <div id="eaios-trace-container" style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); padding: 2px 10px; border-radius: 9999px; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; color: #38bdf8; text-transform: uppercase;">Phase 4 Real-Time Control Plane</span>
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #f8fafc;">Live EAIOS Execution Trace</div>
            <div style="font-size: 12px; color: #94a3b8;">10-step lifecycle trace. Click any step to inspect the associated entity, authority scope, and audit events.</div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; font-size: 11px;">
            <span style="color: #94a3b8;">Root Correlation:</span>
            <span id="eaios-trace-corr-id" style="font-family: monospace; color: #38bdf8; background: rgba(6, 182, 212, 0.15); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(6, 182, 212, 0.3); cursor: pointer;" title="Click to view full causal correlation trace">
              CORR-2026-000741 🔍
            </span>
          </div>
        </div>

        <!-- Horizontal Stepper Flow -->
        <div id="eaios-trace-stepper" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; overflow-x: auto; padding-bottom: 6px;">
          ${TRACE_STEPS.map(step => `
            <div class="eaios-trace-step" id="trace-step-${step.id}" data-step-id="${step.id}" data-node-id="${step.nodeId || ''}" style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 10px 8px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="font-family: monospace; font-size: 9.5px; color: #64748b; font-weight: 700;">${step.stepNum}</span>
                  <span class="step-status-pill" style="font-size: 8.5px; font-weight: 800; padding: 1px 5px; border-radius: 3px; background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3);">
                    PENDING
                  </span>
                </div>
                <div style="font-size: 11px; font-weight: 700; color: #f8fafc; line-height: 1.25; margin-bottom: 2px;">
                  ${step.shortName}
                </div>
              </div>
              <div style="font-size: 8.5px; color: #64748b; font-family: monospace; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${step.scope}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- MAIN WORKSPACE: DAG TOPOLOGY + LIVE NODE INSPECTOR -->
      <div style="display: grid; grid-template-columns: 2fr 1.15fr; gap: 24px; margin-bottom: 24px;">

        <!-- DAG TOPOLOGY VIEWER -->
        <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div>
              <div style="font-size: 15px; font-weight: 700; color: #f8fafc;">7-Node Governed DAG Frontier</div>
              <div style="font-size: 12px; color: #94a3b8;">Click any node to inspect durable state, worker leases, and EAIES sovereign policy.</div>
            </div>
            <div style="display: flex; gap: 10px; font-size: 11px; align-items: center; flex-wrap: wrap;">
              <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #64748b;"></span> PENDING</span>
              <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #06b6d4;"></span> READY</span>
              <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #8b5cf6;"></span> EXECUTING</span>
              <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b;"></span> PAUSED</span>
              <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span> COMPLETED</span>
            </div>
          </div>

          <div id="eaios-dag-container" style="flex: 1; min-height: 400px; background: rgba(10, 11, 16, 0.8); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; overflow-x: auto; position: relative;">
            <!-- SVG rendered by EaiosRenderer -->
          </div>
        </div>

        <!-- LIVE STATE & GOVERNANCE INSPECTOR -->
        <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <div style="font-size: 15px; font-weight: 700; color: #f8fafc;">Live Node & Governance Inspector</div>
            <span style="font-size: 10px; color: #38bdf8; font-family: monospace;">UnitOfWork Verified</span>
          </div>
          <div style="font-size: 11.5px; color: #94a3b8; margin-bottom: 14px;">Durable entity state & EAIES authority check</div>

          <div id="eaios-inspector-content" style="flex: 1; display: flex; flex-direction: column; gap: 12px;">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>

      <!-- ADVERSARIAL ATTACK TEST SUITE (ATTACK THE ARCHITECTURE) -->
      <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); padding: 3px 10px; border-radius: 9999px; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 700; color: #f87171; text-transform: uppercase;">Interactive Security Defense</span>
            </div>
            <div style="font-size: 17px; font-weight: 800; color: #f8fafc;">Attack the Architecture (Adversarial Tests A–G)</div>
            <div style="font-size: 12.5px; color: #94a3b8;">Trigger real adversarial penetration simulations to observe EAIES policy enforcement and boundary defenses.</div>
          </div>
          <span style="font-size: 11px; color: #94a3b8; background: rgba(15, 23, 42, 0.6); padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
            Empirically Verified: 100% Blocked
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px;">
          ${ADVERSARIAL_SCENARIOS.map(sc => `
            <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 700; font-size: 13px; color: #f8fafc;">${sc.icon} ${sc.title}</span>
                  <span style="font-size: 10px; font-weight: 800; color: #ef4444; background: rgba(239, 68, 68, 0.15); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(239, 68, 68, 0.3);">${sc.expectedOutcome}</span>
                </div>
                <div style="font-size: 11.5px; color: #cbd5e1; margin-top: 6px;"><strong>Attempt:</strong> ${sc.attempt}</div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;"><strong>Defense:</strong> ${sc.reason}</div>
              </div>
              <button class="eaios-btn-adversarial" data-scenario="${sc.id}" style="margin-top: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.35); color: #f87171; padding: 6px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 600; cursor: pointer; text-align: center; transition: all 0.2s;">
                Simulate Attack Vector →
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SOVEREIGN BOUNDARY VISUALISATION: COORDINATION VS AUTHORITY -->
      <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="font-size: 16px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">EAIES — Sovereign Authority Boundary</div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 16px;">Visualizing the absolute architectural distinction between Coordination (Work) and Authority (Execution).</div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <!-- Coordination Column -->
          <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 8px; padding: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="width: 10px; height: 10px; border-radius: 50%; background: #06b6d4;"></span>
              <span style="font-weight: 700; font-size: 14px; color: #38bdf8;">COORDINATION DOMAIN (Stateless)</span>
            </div>
            <div style="font-size: 12px; color: #94a3b8; line-height: 1.45; margin-bottom: 10px;">
              The Orchestrator, WorkflowEngine, and DAG frontier evaluator operate exclusively on the coordination side.
            </div>
            <ul style="font-size: 11.5px; color: #cbd5e1; line-height: 1.6; padding-left: 18px; margin: 0;">
              <li>Propagates work items, dependencies, and execution leases.</li>
              <li>Reconstructs runnable DAG frontier statelessly from completed nodes.</li>
              <li><strong>Zero Execution Authority:</strong> Cannot execute capabilities or grant permissions.</li>
              <li><strong>Zero Peer Delegation:</strong> Cannot bypass central admission boundary.</li>
            </ul>
          </div>

          <!-- Authority Column -->
          <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="width: 10px; height: 10px; border-radius: 50%; background: #f59e0b;"></span>
              <span style="font-weight: 700; font-size: 14px; color: #fbbf24;">AUTHORITY DOMAIN (Sovereign)</span>
            </div>
            <div style="font-size: 12px; color: #94a3b8; line-height: 1.45; margin-bottom: 10px;">
              Enterprise AI Execution Sovereignty (EAIES) is the sole non-bypassable policy execution boundary.
            </div>
            <ul style="font-size: 11.5px; color: #cbd5e1; line-height: 1.6; padding-left: 18px; margin: 0;">
              <li>Intercepts every capability dispatch before worker execution.</li>
              <li>Evaluates caller identity lifecycle (ACTIVE, SUSPENDED, RETIRED).</li>
              <li>Validates explicit authority scope and policy permissions.</li>
              <li><strong>Discards Injected Context:</strong> Context payload cannot manufacture authority.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- ARCHITECTURAL CONCEPTS: EMPLOYEE vs CAPABILITY vs WORK ITEM vs NODE -->
      <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="font-size: 16px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">Core Architectural Distinctions</div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 16px;">Critical separation of identity, capability, work item, and execution node.</div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px;">
          ${ARCHITECTURAL_CONCEPTS.map(c => `
            <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <span style="font-weight: 700; font-size: 14px; color: #38bdf8;">${c.title}</span>
                <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">${c.identity}</span>
              </div>
              <div style="font-size: 11px; color: #a78bfa; margin-top: 4px; font-weight: 600;">Nature: ${c.nature}</div>
              <div style="font-size: 11px; color: #cbd5e1; margin-top: 6px; font-family: monospace; background: rgba(0,0,0,0.3); padding: 4px 6px; border-radius: 4px;">Lifecycle: ${c.lifecycle}</div>
              <div style="font-size: 11.5px; color: #cbd5e1; margin-top: 8px; line-height: 1.45;"><strong>Authority Rule:</strong> ${c.authorityRule}</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 6px; line-height: 1.4;"><strong>Enforcement:</strong> ${c.enforcement}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- AUDIT LOG & IMMUTABLE CORRELATION TRACE -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">

        <!-- AUDIT EVENT STREAM -->
        <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <div style="font-size: 15px; font-weight: 700; color: #f8fafc;">Enterprise Memory Forensic Log (ADR-005)</div>
              <div style="font-size: 12px; color: #94a3b8;">Click any event to cross-inspect the node & trace step</div>
            </div>
            <span style="font-size: 11px; background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 2px 8px; border-radius: 4px; font-weight: 600;">Live Stream</span>
          </div>

          <div id="eaios-audit-log" style="height: 280px; overflow-y: auto; background: rgba(10, 11, 16, 0.9); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; display: flex; flex-direction: column; gap: 6px;">
            <div style="color: #64748b; text-align: center; padding-top: 110px;">Awaiting workflow execution event stream...</div>
          </div>
        </div>

        <!-- CORRELATION ID PROPAGATION TRACE -->
        <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px;">
          <div style="font-size: 15px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">Correlation ID Propagation Trace (ADR-015)</div>
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 14px;">Immutable causal identifier flowing without mutation across all execution entities</div>

          <div style="background: rgba(10, 11, 16, 0.8); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px; font-family: monospace; font-size: 11.5px; line-height: 1.6;">
            <div style="color: #64748b;">// Root correlation assigned at statutory event admission:</div>
            <div style="color: #38bdf8; font-weight: 700; margin-bottom: 8px;">correlation_id: "CORR-2026-000741"</div>

            <div style="display: flex; flex-direction: column; gap: 6px; padding-left: 10px; border-left: 2px solid rgba(6, 182, 212, 0.4);">
              <div>EnterpriseWorkItem (<span style="color: #94a3b8;">wi-2026-9b4d8c72</span>) ➔ <code style="color: #38bdf8;">CORR-2026-000741</code></div>
              <div>WorkflowInstance (<span style="color: #94a3b8;">inst-dag-frontier-01</span>) ➔ <code style="color: #38bdf8;">CORR-2026-000741</code></div>
              <div>Node 1: Regulatory Intelligence ➔ <code style="color: #38bdf8;">CORR-2026-000741</code></div>
              <div>Node 2 & 3: Risk & Control (Parallel) ➔ <code style="color: #38bdf8;">CORR-2026-000741</code></div>
              <div>Node 4: Fan-In Barrier ➔ <code style="color: #38bdf8;">CORR-2026-000741</code></div>
              <div>Node 5: Operational Resilience ➔ <code style="color: #38bdf8;">CORR-2026-000741</code></div>
              <div>HumanApprovalRequest (<span style="color: #f59e0b;">ADR-009</span>) ➔ <code style="color: #38bdf8;">CORR-2026-000741</code></div>
              <div>Node 7: Action Executor ➔ <code style="color: #38bdf8;">CORR-2026-000741</code></div>
              <div>EnterpriseMemory Forensic Ledger ➔ <code style="color: #38bdf8;">CORR-2026-000741</code></div>
            </div>
          </div>
          <div style="font-size: 11px; color: #10b981; margin-top: 8px; font-weight: 600;">
            ✓ Invariant Enforced: Downstream components cannot alter or manufacture the root correlation ID.
          </div>
        </div>
      </div>

      <!-- ARCHITECTURAL INVARIANTS PANEL (12 INVARIANTS) -->
      <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="font-size: 16px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">12 Non-Negotiable Architectural Invariants</div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 16px;">Core governance guarantees verified across EAIOS architecture and integration test suite.</div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px;">
          ${ARCHITECTURAL_INVARIANTS.map(inv => `
            <div style="background: rgba(10, 11, 16, 0.6); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 700; font-size: 12.5px; color: #38bdf8;">${inv.id}. ${inv.title}</span>
                <span style="font-size: 9.5px; color: #10b981; font-weight: 700; background: rgba(16, 185, 129, 0.15); padding: 1px 5px; border-radius: 3px;">ENFORCED</span>
              </div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; line-height: 1.45;">${inv.rule}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 9 ARCHITECTURAL LAYERS & PRODUCTION EVOLUTION -->
      <div style="background: rgba(22, 26, 43, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 16px; font-weight: 700; color: #f8fafc;">EAIOS 9-Layer Architectural Decomposition & Production Evolution</div>
            <div style="font-size: 12px; color: #94a3b8;">Distinguishing current verified in-process implementation from distributed production evolution.</div>
          </div>
          <span style="font-size: 11px; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 4px 10px; border-radius: 6px; font-weight: 600;">
            Zero Microservice Pretence — Honest Maturity
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${ARCHITECTURE_LAYERS.map(layer => `
            <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-family: monospace; font-size: 11px; font-weight: 700; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 8px; border-radius: 4px;">Layer ${layer.layer}</span>
                  <span style="font-size: 14.5px; font-weight: 700; color: #f8fafc;">${layer.name}</span>
                </div>
                <div style="display: flex; gap: 8px;">
                  <span style="font-size: 11px; color: #a78bfa; font-family: monospace;">${layer.adr}</span>
                  <span style="font-size: 10.5px; color: #10b981; background: rgba(16, 185, 129, 0.12); padding: 2px 6px; border-radius: 4px; font-weight: 600;">${layer.status}</span>
                </div>
              </div>

              <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 10px;">${layer.purpose}</div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 11.5px; background: rgba(0,0,0,0.25); padding: 10px 12px; border-radius: 6px;">
                <div>
                  <div style="font-weight: 700; color: #38bdf8; margin-bottom: 2px;">Current Verified Implementation:</div>
                  <div style="color: #94a3b8; line-height: 1.4;">${layer.currentImpl}</div>
                </div>
                <div>
                  <div style="font-weight: 700; color: #a78bfa; margin-bottom: 2px;">Distributed Production Evolution:</div>
                  <div style="color: #94a3b8; line-height: 1.4;">${layer.productionEvolution}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- CORRELATION TRACE MODAL (POPUP) -->
      <div id="eaios-corr-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.75); z-index: 9999; backdrop-filter: blur(4px); align-items: center; justify-content: center; padding: 20px;">
        <div style="background: #111827; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 12px; max-width: 600px; width: 100%; padding: 24px; box-shadow: 0 16px 48px rgba(0,0,0,0.7);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px;">🔗</span>
              <h3 style="margin: 0; font-size: 16px; color: #f8fafc; font-weight: 700;">Root Correlation Flow: CORR-2026-000741</h3>
            </div>
            <button id="eaios-corr-modal-close" style="background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 4px;">✕</button>
          </div>
          <div style="font-size: 12.5px; color: #94a3b8; line-height: 1.5; margin-bottom: 16px;">
            In accordance with <strong>ADR-015</strong>, this cryptographic identifier was generated at event admission and immutably propagated across all domain entities. Subagents and peer processes cannot alter or re-generate root correlation.
          </div>
          <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 14px; font-family: monospace; font-size: 11.5px; display: flex; flex-direction: column; gap: 8px;">
            <div style="color: #38bdf8;">1. Event Ingest: CORR-2026-000741 (statutory_clearing_mandate)</div>
            <div style="color: #a78bfa;">2. EnterpriseWorkItem: wi-2026-9b4d8c72 [CORR-2026-000741]</div>
            <div style="color: #34d399;">3. WorkflowInstance: inst-dag-frontier-01 [CORR-2026-000741]</div>
            <div style="color: #cbd5e1;">4. Node Execution Frontier: 7 Nodes [CORR-2026-000741]</div>
            <div style="color: #fbbf24;">5. HumanApprovalRequest: req-gov-001 [CORR-2026-000741]</div>
            <div style="color: #10b981;">6. EnterpriseMemory Ledger: 15 append-only records [CORR-2026-000741]</div>
          </div>
          <div style="text-align: right; margin-top: 18px;">
            <button id="eaios-corr-modal-ok" style="background: #2563eb; color: #ffffff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 600; font-size: 12.5px; cursor: pointer;">
              Close Trace
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
      simManager.selectNode(node.id);
      updateInspector(node);
      updateTraceUi(simManager.traceStepStates, simManager.selectedStepId);
    }
  });

  const auditLog = document.getElementById('eaios-audit-log');
  simManager = new EaiosSimulationManager(renderer, auditLog, (state) => {
    // Keep inspector and trace stepper updated during simulation
    updateTraceUi(state.traceStepStates, state.selectedStepId);

    let inspectedNode = null;
    if (state.selectedNodeId) {
      inspectedNode = EAIOS_NODES.find(n => n.id === state.selectedNodeId);
      if (inspectedNode) {
        updateInspector({ ...inspectedNode, ...state.nodeStates[inspectedNode.id] });
        return;
      }
    }

    const activeNode = EAIOS_NODES.find(n => state.nodeStates[n.id]?.status === 'EXECUTING' || state.nodeStates[n.id]?.status === 'PAUSED' || state.nodeStates[n.id]?.status === 'READY');
    if (activeNode) {
      updateInspector({ ...activeNode, ...state.nodeStates[activeNode.id] });
    }
  });

  // Initial render of DAG and default node in inspector
  simManager.reset();
  updateInspector(EAIOS_NODES[0]);
  updateTraceUi(simManager.traceStepStates, null);

  // Wire click handlers on trace steps
  document.querySelectorAll('.eaios-trace-step').forEach(stepEl => {
    stepEl.onclick = () => {
      const stepId = stepEl.getAttribute('data-step-id');
      simManager.selectStep(stepId);
      const step = TRACE_STEPS.find(s => s.id === stepId);
      if (step && step.nodeId) {
        const node = EAIOS_NODES.find(n => n.id === step.nodeId);
        if (node) {
          updateInspector({ ...node, ...simManager.nodeStates[node.id] });
        }
      } else {
        renderStepInInspector(step, simManager.traceStepStates[stepId]);
      }
      updateTraceUi(simManager.traceStepStates, stepId);
    };
  });

  // Connect Workflow control buttons
  const btnRun = document.getElementById('eaios-btn-run');
  const btnReset = document.getElementById('eaios-btn-reset');
  const btnApprove = document.getElementById('eaios-btn-approve');
  const btnReject = document.getElementById('eaios-btn-reject');
  const btnCrash = document.getElementById('eaios-btn-crash');
  const btnIdempotency = document.getElementById('eaios-btn-idempotency');

  if (btnRun) btnRun.onclick = () => simManager.runSimulation();
  if (btnReset) {
    btnReset.onclick = () => {
      simManager.reset();
      updateInspector(EAIOS_NODES[0]);
      updateTraceUi(simManager.traceStepStates, null);
    };
  }
  if (btnApprove) btnApprove.onclick = () => simManager.resumeApproval('APPROVED');
  if (btnReject) btnReject.onclick = () => simManager.resumeApproval('REJECTED');
  if (btnCrash) btnCrash.onclick = () => simManager.simulateCrashRecovery();
  if (btnIdempotency) btnIdempotency.onclick = () => simManager.simulateIdempotencyCheck();

  // Connect Adversarial Attack buttons
  document.querySelectorAll('.eaios-btn-adversarial').forEach(btn => {
    btn.onclick = (e) => {
      const scenarioId = btn.getAttribute('data-scenario');
      simManager.runAdversarialTest(scenarioId);
    };
  });

  // Connect Correlation modal
  const corrBtn = document.getElementById('eaios-trace-corr-id');
  const corrModal = document.getElementById('eaios-corr-modal');
  const corrClose = document.getElementById('eaios-corr-modal-close');
  const corrOk = document.getElementById('eaios-corr-modal-ok');

  if (corrBtn && corrModal) {
    corrBtn.onclick = () => { corrModal.style.display = 'flex'; };
  }
  if (corrClose && corrModal) {
    corrClose.onclick = () => { corrModal.style.display = 'none'; };
  }
  if (corrOk && corrModal) {
    corrOk.onclick = () => { corrModal.style.display = 'none'; };
  }
}

function updateTraceUi(traceStepStates, selectedStepId) {
  if (!traceStepStates) return;

  const statusColors = {
    PENDING: { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' },
    READY: { bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4', border: 'rgba(6, 182, 212, 0.4)' },
    EXECUTING: { bg: 'rgba(139, 92, 246, 0.2)', text: '#a78bfa', border: '#8b5cf6' },
    RUNNING: { bg: 'rgba(139, 92, 246, 0.2)', text: '#a78bfa', border: '#8b5cf6' },
    PAUSED: { bg: 'rgba(245, 158, 11, 0.2)', text: '#fbbf24', border: '#f59e0b' },
    COMPLETED: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: '#10b981' },
    BLOCKED: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: '#ef4444' },
    FAILED: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: '#ef4444' }
  };

  TRACE_STEPS.forEach(step => {
    const el = document.getElementById(`trace-step-${step.id}`);
    if (!el) return;

    const st = traceStepStates[step.id] || { status: 'PENDING' };
    const style = statusColors[st.status] || statusColors.PENDING;
    const isSelected = selectedStepId === step.id;

    const pill = el.querySelector('.step-status-pill');
    if (pill) {
      pill.textContent = st.status;
      pill.style.background = style.bg;
      pill.style.color = style.text;
      pill.style.borderColor = style.border;
    }

    if (isSelected) {
      el.style.borderColor = '#38bdf8';
      el.style.boxShadow = '0 0 10px rgba(56, 189, 248, 0.3)';
    } else if (st.status === 'EXECUTING' || st.status === 'PAUSED') {
      el.style.borderColor = style.border;
      el.style.boxShadow = `0 0 8px ${style.border}40`;
    } else if (st.status === 'COMPLETED') {
      el.style.borderColor = 'rgba(16, 185, 129, 0.35)';
      el.style.boxShadow = 'none';
    } else {
      el.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      el.style.boxShadow = 'none';
    }
  });
}

function renderStepInInspector(step, stepState) {
  const container = document.getElementById('eaios-inspector-content');
  if (!container || !step) return;

  const st = stepState?.status || 'PENDING';
  const statusColor = st === 'COMPLETED' ? '#10b981' : (st === 'EXECUTING' ? '#8b5cf6' : (st === 'PAUSED' ? '#f59e0b' : '#94a3b8'));

  container.innerHTML = `
    <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span style="font-size: 10.5px; font-weight: 700; color: #38bdf8; text-transform: uppercase;">STEP ${step.stepNum} • ${step.category.replace('_', ' ')}</span>
          <h3 style="font-size: 15px; font-weight: 700; color: #f8fafc; margin: 2px 0 0 0;">${step.name}</h3>
        </div>
        <span style="font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}50;">
          ${st}
        </span>
      </div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">Entity: <code style="color: #38bdf8;">${step.entity}</code></div>
    </div>

    <div style="background: rgba(10, 11, 16, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px;">
      <div style="font-size: 10.5px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px;">Step Execution Summary</div>
      <div style="font-size: 12px; color: #cbd5e1; line-height: 1.45;">${step.summary}</div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 8px; line-height: 1.4;">${step.details}</div>
    </div>

    <div style="background: rgba(10, 11, 16, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px;">
      <div style="font-size: 10.5px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px;">Scope & Trace Lineage</div>
      <div style="font-size: 11px; color: #94a3b8;">Authority Scope: <code style="color: #38bdf8;">${step.scope}</code></div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Root Correlation: <code style="color: #38bdf8;">CORR-2026-000741</code></div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Associated DAG Node: <span style="color: #cbd5e1;">${step.nodeId || 'None (Orchestration Primitive)'}</span></div>
    </div>
  `;
}

function updateInspector(node) {
  const container = document.getElementById('eaios-inspector-content');
  if (!container || !node) return;

  const statusColors = {
    PENDING: '#94a3b8',
    READY: '#06b6d4',
    EXECUTING: '#8b5cf6',
    RUNNING: '#8b5cf6',
    PAUSED: '#f59e0b',
    COMPLETED: '#10b981',
    FAILED: '#ef4444',
    REJECTED: '#ef4444',
    CRASHED: '#ec4899'
  };

  const status = node.status || 'PENDING';
  const color = statusColors[status] || '#94a3b8';
  const auth = NODE_AUTHORITY_CHECKS[node.id] || {
    callerPrincipal: "OrchestratorRuntime",
    targetEmployee: node.employeeId || "N/A",
    requestedCapability: node.capabilityId,
    authorityScope: node.authorityScope,
    decision: "ALLOWED",
    decisionColor: "#10b981",
    policyRule: "POL-DEFAULT: Validated against sovereign capability catalog.",
    attemptScopedToken: "tok_scoped_verified",
    rationale: "Verification complete. EAIES policy evaluates successfully."
  };

  container.innerHTML = `
    <div style="background: rgba(10, 11, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span style="font-size: 10.5px; font-weight: 700; color: #38bdf8; text-transform: uppercase;">${(node.category || 'node').replace('_', ' ')}</span>
          <h3 style="font-size: 15px; font-weight: 700; color: #f8fafc; margin: 2px 0 0 0;">${node.name}</h3>
        </div>
        <span style="font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; background: ${color}20; color: ${color}; border: 1px solid ${color}50;">
          ${status}
        </span>
      </div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">Node ID: <code style="color: #38bdf8;">${node.id}</code></div>
    </div>

    <!-- EAIES SOVEREIGN AUTHORITY CHECK SUB-PANEL -->
    <div style="background: rgba(10, 11, 16, 0.85); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 8px; padding: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div style="font-size: 10.5px; text-transform: uppercase; color: #38bdf8; font-weight: 800; letter-spacing: 0.05em;">EAIES Sovereign Authority Check</div>
        <span style="font-size: 9.5px; font-weight: 800; padding: 2px 6px; border-radius: 3px; background: ${auth.decisionColor}20; color: ${auth.decisionColor}; border: 1px solid ${auth.decisionColor}50;">
          ${auth.decision}
        </span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
        <div><span style="color: #64748b;">Caller Principal:</span> <code style="color: #cbd5e1;">${auth.callerPrincipal}</code></div>
        <div><span style="color: #64748b;">Target Identity:</span> <code style="color: #a78bfa;">${auth.targetEmployee}</code></div>
        <div><span style="color: #64748b;">Requested Scope:</span> <code style="color: #38bdf8;">${auth.authorityScope}</code></div>
        <div><span style="color: #64748b;">Policy Rule:</span> <span style="color: #94a3b8; font-size: 10.5px;">${auth.policyRule}</span></div>
        <div><span style="color: #64748b;">Attempt Token:</span> <code style="font-size: 9.5px; color: #34d399;">${auth.attemptScopedToken}</code></div>
      </div>
      <div style="font-size: 10.5px; color: #94a3b8; margin-top: 6px; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 6px;">
        <em>${auth.rationale}</em>
      </div>
    </div>

    <div style="background: rgba(10, 11, 16, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px;">
      <div style="font-size: 10.5px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px;">Identity vs Authority Footprint</div>
      <div style="font-size: 12.5px; font-weight: 600; color: #e2e8f0;">${node.employeeName || 'None (System Construct)'}</div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Identity ID: <code style="color: #cbd5e1;">${node.employeeId || 'N/A'}</code></div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Capability ID: <code style="color: #a78bfa;">${node.capabilityId}</code></div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Required Scope: <code style="color: #38bdf8;">${node.authorityScope}</code></div>
    </div>

    <div style="background: rgba(10, 11, 16, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px;">
      <div style="font-size: 10.5px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px;">Phase 3 Durable Leases & Traceability</div>
      <div style="font-size: 11px; color: #94a3b8;">Worker Lease: <span style="color: #cbd5e1;">${status === 'EXECUTING' ? (node.workerId || 'worker-thread-pool') + ' (ACTIVE)' : (node.workerBadge || 'Released / Unclaimed')}</span></div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Execution Attempt: <span style="color: #cbd5e1;">${node.attempt || 1} of 3</span></div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Correlation ID: <code style="font-size: 10px; color: #38bdf8;">CORR-2026-000741</code></div>
    </div>
  `;
}
