// ==========================================================================
// EAIOS Architecture Showcase - State Machines & Interactive Simulations
// ==========================================================================

import { EAIOS_NODES } from './eaios-data.js';

export class EaiosSimulationManager {
  constructor(renderer, auditLogElement, onStateChange = null) {
    this.renderer = renderer;
    this.auditLogElement = auditLogElement;
    this.onStateChange = onStateChange;
    this.isRunning = false;
    this.auditEvents = [];
    this.reset();
  }

  reset() {
    this.isRunning = false;
    this.correlationId = "CORR-2026-000741";
    this.workItemId = "wi-2026-9b4d8c72";
    this.instanceId = "inst-dag-frontier-01";

    this.workflowInstance = {
      status: "CREATED",
      definitionVersion: "1.0",
      version: 1,
      workItemStatus: "CREATED"
    };

    this.nodeStates = {};
    for (const node of EAIOS_NODES) {
      this.nodeStates[node.id] = {
        status: "PENDING",
        attempt: 0,
        workerId: null,
        version: 1,
        leaseExpiresAt: null
      };
    }

    this.humanApproval = {
      status: "NONE",
      assignedRole: "ResilienceExecutive",
      resolvedBy: null
    };

    this.auditEvents = [];
    this._addAudit("SYSTEM_INITIALIZED", "Topology reset to initial unexecuted baseline", "SYSTEM", "SUCCESS");

    this._hideApprovalBanner();
    this._render();
  }

  _render() {
    if (this.renderer) {
      this.renderer.render(this.nodeStates);
    }
    this._updateAuditUi();
    if (typeof this.onStateChange === 'function') {
      this.onStateChange({
        nodeStates: this.nodeStates,
        workflowInstance: this.workflowInstance,
        humanApproval: this.humanApproval,
        correlationId: this.correlationId
      });
    }
  }

  _addAudit(eventType, description, worker = "SYSTEM", outcome = "SUCCESS", extra = {}) {
    const timestamp = new Date().toISOString().substring(11, 19);
    const event = {
      timestamp,
      correlationId: this.correlationId,
      workItemId: this.workItemId,
      instanceId: this.instanceId,
      nodeId: extra.nodeId || "N/A",
      workerId: worker,
      attempt: extra.attempt !== undefined ? extra.attempt : 1,
      eventType,
      description,
      outcome
    };
    this.auditEvents.unshift(event);
    if (this.auditEvents.length > 50) this.auditEvents.pop();
    this._updateAuditUi();
  }

  _updateAuditUi() {
    if (!this.auditLogElement) return;
    if (this.auditEvents.length === 0) {
      this.auditLogElement.innerHTML = '<div style="color: #64748b; text-align: center; padding-top: 90px;">Awaiting workflow execution event stream...</div>';
      return;
    }

    this.auditLogElement.innerHTML = this.auditEvents.map(evt => {
      const isBlock = evt.outcome === 'BLOCKED' || evt.outcome === 'FAILED' || evt.outcome === 'DENIED';
      const isPaused = evt.outcome === 'PAUSED';
      const badgeColor = isBlock ? '#ef4444' : (isPaused ? '#f59e0b' : '#10b981');
      const badgeBg = isBlock ? 'rgba(239, 68, 68, 0.15)' : (isPaused ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)');

      return `
        <div style="padding: 6px 8px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="color: #64748b;">${evt.timestamp}</span>
              <span style="font-weight: 700; color: #38bdf8;">${evt.eventType}</span>
              <span style="color: #cbd5e1; font-size: 10px;">[${evt.workerId}]</span>
            </div>
            <span style="font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: 3px; background: ${badgeBg}; color: ${badgeColor};">
              ${evt.outcome}
            </span>
          </div>
          <div style="color: #94a3b8; font-size: 10.5px;">${evt.description}</div>
          <div style="display: flex; gap: 12px; font-size: 9.5px; color: #64748b;">
            <span>corr: <code style="color: #38bdf8;">${evt.correlationId}</code></span>
            <span>node: <code>${evt.nodeId}</code></span>
            <span>att: ${evt.attempt}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  _showApprovalBanner() {
    const banner = document.getElementById('eaios-approval-banner');
    if (banner) banner.style.display = 'block';
  }

  _hideApprovalBanner() {
    const banner = document.getElementById('eaios-approval-banner');
    if (banner) banner.style.display = 'none';
  }

  /**
   * Run full governed workflow execution (12-step sequence)
   */
  async runSimulation() {
    if (this.isRunning) return;
    this.reset();
    this.isRunning = true;

    // STEP 1: Business Event Admitted
    this.workflowInstance.status = "RUNNING";
    this.workflowInstance.workItemStatus = "IN_PROGRESS";
    this._addAudit("WORKFLOW_STARTED", "Business event admitted. WorkItem created with correlation_id", "ORCHESTRATOR", "SUCCESS", { nodeId: "DAG_ROOT" });
    await this._sleep(800);

    // STEP 2: Node 1 READY -> EXECUTING
    this.nodeStates["node_1_regulatory_intelligence"].status = "READY";
    this._render();
    this._addAudit("NODE_READY", "Frontier evaluated: Node 1 dependencies satisfied", "WORKFLOW_ENGINE", "SUCCESS", { nodeId: "node_1" });
    await this._sleep(600);

    this.nodeStates["node_1_regulatory_intelligence"].status = "EXECUTING";
    this.nodeStates["node_1_regulatory_intelligence"].workerId = "worker-thread-01";
    this.nodeStates["node_1_regulatory_intelligence"].attempt = 1;
    this._render();
    this._addAudit("NODE_LEASE_ACQUIRED", "Worker claimed lease for regulatory.intelligence.analyze. EAIES verified policy -> ALLOWED", "worker-thread-01", "ALLOWED", { nodeId: "node_1", attempt: 1 });
    await this._sleep(1200);

    // STEP 3: Node 1 COMPLETED
    this.nodeStates["node_1_regulatory_intelligence"].status = "COMPLETED";
    this._render();
    this._addAudit("NODE_COMPLETED", "Regulatory obligations parsed: Clearing member resilience mandate identified", "worker-thread-01", "SUCCESS", { nodeId: "node_1" });
    await this._sleep(700);

    // STEP 4: Parallel Branches (Node 2 & Node 3) READY simultaneously
    this.nodeStates["node_2_risk_analysis"].status = "READY";
    this.nodeStates["node_3_control_evidence"].status = "READY";
    this._render();
    this._addAudit("DAG_FRONTIER_EXPANDED", "Parallel branch frontier detected: Nodes 2 and 3 eligible for concurrent lease", "WORKFLOW_ENGINE", "SUCCESS");
    await this._sleep(600);

    // STEP 5: Parallel Branches EXECUTING in separate worker threads
    this.nodeStates["node_2_risk_analysis"].status = "EXECUTING";
    this.nodeStates["node_2_risk_analysis"].workerId = "worker-thread-02";
    this.nodeStates["node_2_risk_analysis"].attempt = 1;

    this.nodeStates["node_3_control_evidence"].status = "EXECUTING";
    this.nodeStates["node_3_control_evidence"].workerId = "worker-thread-03";
    this.nodeStates["node_3_control_evidence"].attempt = 1;
    this._render();
    this._addAudit("PARALLEL_EXECUTION", "Worker-02 executing Risk Analysis; Worker-03 executing Control & Evidence concurrently", "THREAD_POOL", "SUCCESS");
    await this._sleep(1400);

    // STEP 6: Node 2 completes first
    this.nodeStates["node_2_risk_analysis"].status = "COMPLETED";
    this._render();
    this._addAudit("NODE_COMPLETED", "Node 2 (Risk Analysis) completed. Operational risk score: HIGH (0.88)", "worker-thread-02", "SUCCESS", { nodeId: "node_2" });
    await this._sleep(800);

    // STEP 7: Fan-In Barrier remains PENDING because Node 3 is still running
    this._addAudit("FAN_IN_BLOCKED", "Deterministic Fan-In barrier holds: Node 3 still in progress, frontier does NOT advance", "FAN_IN_BARRIER", "WAITING", { nodeId: "node_4" });
    await this._sleep(800);

    // STEP 8: Node 3 completes
    this.nodeStates["node_3_control_evidence"].status = "COMPLETED";
    this._render();
    this._addAudit("NODE_COMPLETED", "Node 3 (Control Evidence) completed. Key control deficiency identified in settlement buffer", "worker-thread-03", "SUCCESS", { nodeId: "node_3" });
    await this._sleep(700);

    // STEP 9: Fan-In Barrier satisfied -> Node 4 COMPLETED -> Node 5 READY
    this.nodeStates["node_4_fan_in"].status = "COMPLETED";
    this.nodeStates["node_5_operational_resilience"].status = "READY";
    this._render();
    this._addAudit("FAN_IN_SATISFIED", "All incoming branch dependencies completed. Barrier cleared -> Operational Resilience READY", "FAN_IN_BARRIER", "SUCCESS", { nodeId: "node_4" });
    await this._sleep(800);

    // STEP 10: Node 5 EXECUTING
    this.nodeStates["node_5_operational_resilience"].status = "EXECUTING";
    this.nodeStates["node_5_operational_resilience"].workerId = "worker-thread-01";
    this.nodeStates["node_5_operational_resilience"].attempt = 1;
    this._render();
    this._addAudit("NODE_LEASE_ACQUIRED", "Synthesizing joined impact analysis. Formulating remediation proposal", "worker-thread-01", "SUCCESS", { nodeId: "node_5" });
    await this._sleep(1400);

    this.nodeStates["node_5_operational_resilience"].status = "COMPLETED";
    this.nodeStates["node_6_governance_check"].status = "PAUSED";
    this.workflowInstance.status = "PAUSED";
    this.humanApproval.status = "PENDING";
    this._render();

    // STEP 11: Human Governance Gate PAUSED (ADR-009)
    this._addAudit("HUMAN_APPROVAL_REQUESTED", "High AI confidence (0.95) does NOT equal authority. Workflow PAUSED awaiting human sign-off", "GOVERNANCE_GATE", "PAUSED", { nodeId: "node_6" });
    this._showApprovalBanner();
    this.isRunning = false;
  }

  /**
   * Resume workflow following human decision
   */
  async resumeApproval(decision) {
    this._hideApprovalBanner();
    this.isRunning = true;

    if (decision === 'APPROVED') {
      this.humanApproval.status = "APPROVED";
      this.humanApproval.resolvedBy = "sarah.jenkins@cyphervantage.com (ResilienceExecutive)";
      this.nodeStates["node_6_governance_check"].status = "COMPLETED";
      this.workflowInstance.status = "RUNNING";
      this._render();
      this._addAudit("HUMAN_APPROVAL_GRANTED", "Executive Sarah Jenkins signed approval. Workflow unpaused", "HUMAN_PRINCIPAL", "APPROVED", { nodeId: "node_6" });
      await this._sleep(900);

      // Node 7 executes
      this.nodeStates["node_7_approved_action"].status = "READY";
      this._render();
      await this._sleep(600);

      this.nodeStates["node_7_approved_action"].status = "EXECUTING";
      this.nodeStates["node_7_approved_action"].workerId = "action-worker-01";
      this.nodeStates["node_7_approved_action"].attempt = 1;
      this._render();
      this._addAudit("NODE_LEASE_ACQUIRED", "Action Executor dispatched. EAIES verified human approval signature in token -> ALLOWED", "action-worker-01", "ALLOWED", { nodeId: "node_7" });
      await this._sleep(1400);

      this.nodeStates["node_7_approved_action"].status = "COMPLETED";
      this.workflowInstance.status = "COMPLETED";
      this._render();
      this._addAudit("WORKFLOW_COMPLETED", "Remediation action committed. Full causal lineage preserved with correlation_id", "ORCHESTRATOR", "SUCCESS", { nodeId: "DAG_ROOT" });
    } else {
      this.humanApproval.status = "REJECTED";
      this.humanApproval.resolvedBy = "sarah.jenkins@cyphervantage.com (ResilienceExecutive)";
      this.nodeStates["node_6_governance_check"].status = "REJECTED";
      this.nodeStates["node_7_approved_action"].status = "FAILED";
      this.workflowInstance.status = "FAILED";
      this._render();
      this._addAudit("HUMAN_APPROVAL_REJECTED", "Executive Sarah Jenkins REJECTED proposed action. Execution frontier halted", "HUMAN_PRINCIPAL", "REJECTED", { nodeId: "node_6" });
      await this._sleep(600);
      this._addAudit("WORKFLOW_TERMINATED", "Workflow safely terminated in FAILED state. Action executor will NOT execute", "ORCHESTRATOR", "TERMINATED", { nodeId: "DAG_ROOT" });
    }

    this.isRunning = false;
  }

  /**
   * Adversarial Scenarios
   */
  async runAdversarialTest(scenarioId) {
    if (this.isRunning) return;

    if (scenarioId === 'attack_unauthorized_capability') {
      this._addAudit("ATTACK_SIMULATION", "Risk Analysis AI Employee attempts 'regulatory.action.execute'", "emp-risk-analyst-01", "ATTACK");
      await this._sleep(400);
      this._addAudit("AUTHORITY_DENIED", "EAIES Policy Violation: capability 'regulatory.action.execute' not permitted for caller", "EAIES_PROXY", "BLOCKED", { nodeId: "EAIES_GATE" });
    } else if (scenarioId === 'attack_insufficient_authority') {
      this._addAudit("ATTACK_SIMULATION", "Regulatory Intelligence attempts remediation with scope 'regulatory_read'", "emp-reg-intel-01", "ATTACK");
      await this._sleep(400);
      this._addAudit("AUTHORITY_DENIED", "EAIES Scope Mismatch: Required 'action_execute', caller possesses 'regulatory_read'", "EAIES_PROXY", "BLOCKED", { nodeId: "EAIES_GATE" });
    } else if (scenarioId === 'attack_suspended_employee') {
      this._addAudit("ATTACK_SIMULATION", "Suspended AI Employee (emp-risk-analyst-suspended) attempts lease claim", "emp-risk-analyst", "ATTACK");
      await this._sleep(400);
      this._addAudit("LIFECYCLE_BLOCKED", "Lifecycle Enforcement: AI Employee status is SUSPENDED. Dispatch rejected immediately", "EAIES_PROXY", "BLOCKED", { nodeId: "EAIES_GATE" });
    } else if (scenarioId === 'attack_retired_employee') {
      this._addAudit("ATTACK_SIMULATION", "Decommissioned AI Employee (emp-control-evidence-retired) attempts capability call", "emp-control", "ATTACK");
      await this._sleep(400);
      this._addAudit("LIFECYCLE_BLOCKED", "Lifecycle Enforcement: AI Employee status is RETIRED. Permanent invocation block", "EAIES_PROXY", "BLOCKED", { nodeId: "EAIES_GATE" });
    } else if (scenarioId === 'attack_p2p_invocation') {
      this._addAudit("ATTACK_SIMULATION", "Risk Analysis Agent calls Operational Resilience directly without Orchestrator", "emp-risk-analyst-01", "ATTACK");
      await this._sleep(400);
      this._addAudit("PEER_INVOCATION_BLOCKED", "Architectural Violation: Direct AI-to-AI peer invocation prohibited. Zero peer communication channels", "ARCH_GUARD", "BLOCKED", { nodeId: "PEER_BOUNDARY" });
    } else if (scenarioId === 'attack_unauthorized_human') {
      this._addAudit("ATTACK_SIMULATION", "Junior Analyst (junior.analyst@company.com) attempts high-impact sign-off", "HUMAN_GATE", "ATTACK");
      await this._sleep(400);
      this._addAudit("GOVERNANCE_DENIED", "Role Privilege Violation: User lacks 'ResilienceExecutive' role. Human approval rejected", "HUMAN_APPROVAL_SERVICE", "BLOCKED", { nodeId: "node_6" });
    } else if (scenarioId === 'attack_action_without_approval') {
      this._addAudit("ATTACK_SIMULATION", "Action Executor attempts execution while Human Approval Gate is PENDING", "emp-action-executor-01", "ATTACK");
      await this._sleep(400);
      this._addAudit("STATE_ORDER_BLOCKED", "Workflow State Violation: Execution frontier cannot advance until HumanApprovalRequest is APPROVED", "WORKFLOW_ENGINE", "BLOCKED", { nodeId: "node_7" });
    }
  }

  /**
   * Phase 3: Crash Recovery Simulation
   */
  async simulateCrashRecovery() {
    if (this.isRunning) return;
    this.reset();
    this.isRunning = true;

    this._addAudit("PHASE3_CRASH_SIMULATION", "Simulating worker crash, lease expiration, and sweeper reclamation", "ORCHESTRATOR", "SUCCESS");
    await this._sleep(600);

    // 1. Worker A claims node 1
    this.nodeStates["node_1_regulatory_intelligence"].status = "EXECUTING";
    this.nodeStates["node_1_regulatory_intelligence"].workerId = "worker-alpha-01";
    this.nodeStates["node_1_regulatory_intelligence"].attempt = 1;
    this._render();
    this._addAudit("NODE_LEASE_ACQUIRED", "Worker Alpha acquired lease (lease_expires_at = T+30s)", "worker-alpha-01", "SUCCESS", { nodeId: "node_1", attempt: 1 });
    await this._sleep(1100);

    // 2. Worker A crashes
    this._addAudit("WORKER_CRASHED", "Worker Alpha process crashed! Heartbeat thread terminated prematurely", "worker-alpha-01", "FAILED", { nodeId: "node_1", attempt: 1 });
    await this._sleep(1000);

    // 3. Lease expires & Sweeper detects
    this._addAudit("LEASE_EXPIRED", "Lease timeout reached (T+30s). Worker heartbeat missing", "RECOVERY_SWEEPER", "DETECTED", { nodeId: "node_1", attempt: 1 });
    await this._sleep(900);

    this.nodeStates["node_1_regulatory_intelligence"].status = "READY";
    this.nodeStates["node_1_regulatory_intelligence"].workerId = null;
    this._render();
    this._addAudit("NODE_LEASE_RECLAIMED", "Recovery sweeper reclaimed node lease. State reset to READY. Attempt incremented to 2", "RECOVERY_SWEEPER", "RECLAIMED", { nodeId: "node_1", attempt: 2 });
    await this._sleep(1000);

    // 4. Worker B claims node 1 attempt 2
    this.nodeStates["node_1_regulatory_intelligence"].status = "EXECUTING";
    this.nodeStates["node_1_regulatory_intelligence"].workerId = "worker-beta-02";
    this.nodeStates["node_1_regulatory_intelligence"].attempt = 2;
    this._render();
    this._addAudit("NODE_LEASE_ACQUIRED", "Worker Beta acquired reclaimed lease. Resuming execution (attempt 2)", "worker-beta-02", "SUCCESS", { nodeId: "node_1", attempt: 2 });
    await this._sleep(1200);

    // 5. Stale Worker A attempts late completion
    this._addAudit("STALE_WORKER_ATTEMPT", "Crashed Worker Alpha awakens and attempts late completion for attempt 1", "worker-alpha-01", "CONFLICT", { nodeId: "node_1", attempt: 1 });
    await this._sleep(600);
    this._addAudit("STALE_COMPLETION_REJECTED", "Optimistic version / lease check failed! Worker Alpha completion REJECTED by repository", "REPOSITORY_UOW", "BLOCKED", { nodeId: "node_1", attempt: 1 });
    await this._sleep(900);

    // 6. Worker B completes
    this.nodeStates["node_1_regulatory_intelligence"].status = "COMPLETED";
    this._render();
    this._addAudit("NODE_COMPLETED", "Worker Beta successfully committed node completion on attempt 2", "worker-beta-02", "SUCCESS", { nodeId: "node_1", attempt: 2 });
    this.isRunning = false;
  }

  /**
   * Phase 3: Idempotency & Deduplication Check
   */
  async simulateIdempotencyCheck() {
    this._addAudit("IDEMPOTENCY_EVENT_1", "External event received with business_operation_id: BIZ-OP-9941", "GATEWAY", "ACCEPTED");
    await this._sleep(500);
    this._addAudit("ADMISSION_GRANTED", "First attempt admitted. Work item created under root correlation_id", "ADMISSION_SERVICE", "SUCCESS");
    await this._sleep(800);

    this._addAudit("IDEMPOTENCY_EVENT_2", "Duplicate identical event re-sent by upstream message broker", "GATEWAY", "RECEIVED");
    await this._sleep(500);
    this._addAudit("DUPLICATE_DEDUPLICATED", "Idempotency hash matched existing record. Duplicate rejected without side effects", "ADMISSION_SERVICE", "DEDUPLICATED");
  }
}
