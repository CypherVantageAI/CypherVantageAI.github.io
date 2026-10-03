// ==========================================================================
// EAIOS Architecture Showcase - State Machines & Interactive Simulations
// ==========================================================================

import { EAIOS_NODES, TRACE_STEPS } from './eaios-data.js';

export class EaiosSimulationManager {
  constructor(renderer, auditLogElement, onStateChange = null) {
    this.renderer = renderer;
    this.auditLogElement = auditLogElement;
    this.onStateChange = onStateChange;
    this.isRunning = false;
    this.auditEvents = [];
    this.selectedNodeId = null;
    this.selectedStepId = null;
    this.selectedAuditEventId = null;
    this.reset();
  }

  reset() {
    this.isRunning = false;
    this.correlationId = "CORR-2026-000741";
    this.workItemId = "wi-2026-9b4d8c72";
    this.instanceId = "inst-dag-frontier-01";
    this.selectedNodeId = null;
    this.selectedStepId = null;
    this.selectedAuditEventId = null;

    this.workflowInstance = {
      status: "CREATED",
      definitionVersion: "1.0",
      version: 1,
      workItemStatus: "CREATED"
    };

    // Initialize 7 Node States
    this.nodeStates = {};
    for (const node of EAIOS_NODES) {
      this.nodeStates[node.id] = {
        status: "PENDING",
        attempt: 0,
        workerId: null,
        workerBadge: null,
        version: 1,
        leaseExpiresAt: null,
        waitingForText: null
      };
    }

    // Initialize 10 Trace Step States
    this.traceStepStates = {};
    for (const step of TRACE_STEPS) {
      this.traceStepStates[step.id] = {
        status: "PENDING",
        active: false,
        completedAt: null
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

  selectNode(nodeId) {
    this.selectedNodeId = nodeId;
    // Cross-link: find step associated with node
    const matchingStep = TRACE_STEPS.find(s => s.nodeId === nodeId);
    if (matchingStep) {
      this.selectedStepId = matchingStep.id;
    }
    this._render();
  }

  selectStep(stepId) {
    this.selectedStepId = stepId;
    const step = TRACE_STEPS.find(s => s.id === stepId);
    if (step && step.nodeId) {
      this.selectedNodeId = step.nodeId;
    }
    this._render();
  }

  selectAuditEvent(eventId) {
    this.selectedAuditEventId = eventId;
    const evt = this.auditEvents.find(e => e.id === eventId);
    if (evt && evt.nodeId && evt.nodeId.startsWith('node_')) {
      this.selectedNodeId = evt.nodeId;
      const matchingStep = TRACE_STEPS.find(s => s.nodeId === evt.nodeId);
      if (matchingStep) this.selectedStepId = matchingStep.id;
    }
    this._render();
  }

  _render() {
    if (this.renderer) {
      this.renderer.render(this.nodeStates, this.selectedNodeId);
    }
    this._updateAuditUi();
    if (typeof this.onStateChange === 'function') {
      this.onStateChange({
        nodeStates: this.nodeStates,
        traceStepStates: this.traceStepStates,
        workflowInstance: this.workflowInstance,
        humanApproval: this.humanApproval,
        correlationId: this.correlationId,
        selectedNodeId: this.selectedNodeId,
        selectedStepId: this.selectedStepId,
        selectedAuditEventId: this.selectedAuditEventId
      });
    }
  }

  _setStepState(stepId, status) {
    if (this.traceStepStates[stepId]) {
      this.traceStepStates[stepId].status = status;
      if (status === 'EXECUTING' || status === 'RUNNING' || status === 'PAUSED') {
        this.traceStepStates[stepId].active = true;
      } else {
        this.traceStepStates[stepId].active = false;
      }
      if (status === 'COMPLETED') {
        this.traceStepStates[stepId].completedAt = new Date().toISOString().substring(11, 19);
      }
    }
  }

  _addAudit(eventType, description, worker = "SYSTEM", outcome = "SUCCESS", extra = {}) {
    const timestamp = new Date().toISOString().substring(11, 19);
    const event = {
      id: "evt_" + Math.random().toString(36).substring(2, 9),
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
    return event.id;
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
      const isSelected = this.selectedAuditEventId === evt.id || (this.selectedNodeId && evt.nodeId === this.selectedNodeId);
      const badgeColor = isBlock ? '#ef4444' : (isPaused ? '#f59e0b' : '#10b981');
      const badgeBg = isBlock ? 'rgba(239, 68, 68, 0.15)' : (isPaused ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)');
      const selectedBorder = isSelected ? 'border: 1px solid #38bdf8; background: rgba(56, 189, 248, 0.08);' : 'border-bottom: 1px solid rgba(255, 255, 255, 0.05);';

      return `
        <div class="eaios-audit-item" data-event-id="${evt.id}" data-node-id="${evt.nodeId}" style="padding: 10px 12px; ${selectedBorder} font-size: 11.5px; transition: background 0.15s; cursor: pointer;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #64748b; font-family: monospace; font-size: 10.5px;">${evt.timestamp}</span>
              <span style="font-weight: 700; color: #f8fafc;">${evt.eventType}</span>
            </div>
            <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 1px 6px; border-radius: 3px; font-size: 9.5px; font-weight: 800; border: 1px solid ${badgeColor}40;">
              ${evt.outcome}
            </span>
          </div>
          <div style="color: #94a3b8; font-size: 11px; margin-bottom: 4px; line-height: 1.35;">${evt.description}</div>
          <div style="display: flex; gap: 12px; font-size: 10px; color: #64748b; font-family: monospace;">
            <span>node: <strong style="color: #94a3b8;">${evt.nodeId}</strong></span>
            <span>worker: <strong style="color: #94a3b8;">${evt.workerId}</strong></span>
            <span>att: <strong style="color: #94a3b8;">#${evt.attempt}</strong></span>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listener for audit items
    this.auditLogElement.querySelectorAll('.eaios-audit-item').forEach(el => {
      el.onclick = () => {
        const evId = el.getAttribute('data-event-id');
        this.selectAuditEvent(evId);
      };
    });
  }

  _showApprovalBanner() {
    const el = document.getElementById('eaios-approval-banner');
    if (el) el.style.display = 'block';
  }

  _hideApprovalBanner() {
    const el = document.getElementById('eaios-approval-banner');
    if (el) el.style.display = 'none';
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Phase 2 & 4: Full Governed Workflow Execution Trace (10 Canonical Steps)
   */
  async runSimulation() {
    if (this.isRunning) return;
    this.reset();
    this.isRunning = true;

    // STEP 01: Business Regulatory Event Admitted
    this._setStepState("step_01_event", "EXECUTING");
    this.workflowInstance.status = "RUNNING";
    this.workflowInstance.workItemStatus = "IN_PROGRESS";
    this._render();
    this._addAudit("EVENT_ADMITTED", "Statutory regulatory event admitted. Schema validated. Correlation ID assigned", "GATEWAY", "SUCCESS", { nodeId: "ROOT" });
    await this._sleep(700);
    this._setStepState("step_01_event", "COMPLETED");

    // STEP 02: Enterprise Work Item Created
    this._setStepState("step_02_workitem", "EXECUTING");
    this._render();
    this._addAudit("WORK_ITEM_CREATED", "WorkItem wi-2026-9b4d8c72 committed. Fingerprint verified. DAG frontier ready", "WORK_ITEM_SVC", "SUCCESS", { nodeId: "ROOT" });
    await this._sleep(600);
    this._setStepState("step_02_workitem", "COMPLETED");

    // STEP 03: Node 1 Regulatory Intelligence
    this._setStepState("step_03_node1", "READY");
    this.nodeStates["node_1_regulatory_intelligence"].status = "READY";
    this._render();
    this._addAudit("NODE_READY", "Frontier evaluated: Node 1 (Regulatory Intelligence) ready", "WORKFLOW_ENGINE", "SUCCESS", { nodeId: "node_1_regulatory_intelligence" });
    await this._sleep(500);

    this._setStepState("step_03_node1", "EXECUTING");
    this.nodeStates["node_1_regulatory_intelligence"].status = "EXECUTING";
    this.nodeStates["node_1_regulatory_intelligence"].workerId = "worker-thread-01";
    this.nodeStates["node_1_regulatory_intelligence"].workerBadge = "worker-01 [ACTIVE]";
    this.nodeStates["node_1_regulatory_intelligence"].attempt = 1;
    this._render();
    this._addAudit("NODE_LEASE_ACQUIRED", "Worker claimed lease for regulatory.intelligence.analyze. EAIES policy -> ALLOWED", "worker-thread-01", "ALLOWED", { nodeId: "node_1_regulatory_intelligence", attempt: 1 });
    await this._sleep(1100);

    this.nodeStates["node_1_regulatory_intelligence"].status = "COMPLETED";
    this.nodeStates["node_1_regulatory_intelligence"].workerBadge = null;
    this._setStepState("step_03_node1", "COMPLETED");
    this._render();
    this._addAudit("NODE_COMPLETED", "Regulatory obligations parsed: Clearing member resilience mandate identified", "worker-thread-01", "SUCCESS", { nodeId: "node_1_regulatory_intelligence" });
    await this._sleep(600);

    // STEP 04: Parallel Frontier Dispatch (Nodes 2 & 3)
    this._setStepState("step_04_parallel", "READY");
    this.nodeStates["node_2_risk_analysis"].status = "READY";
    this.nodeStates["node_3_control_evidence"].status = "READY";
    this._render();
    this._addAudit("DAG_FRONTIER_EXPANDED", "Parallel frontier evaluated: Nodes 2 and 3 eligible for concurrent ThreadPool dispatch", "WORKFLOW_ENGINE", "SUCCESS");
    await this._sleep(500);

    this._setStepState("step_04_parallel", "EXECUTING");
    this.nodeStates["node_2_risk_analysis"].status = "EXECUTING";
    this.nodeStates["node_2_risk_analysis"].workerId = "worker-thread-02";
    this.nodeStates["node_2_risk_analysis"].workerBadge = "worker-02 [ACTIVE]";
    this.nodeStates["node_2_risk_analysis"].attempt = 1;

    this.nodeStates["node_3_control_evidence"].status = "EXECUTING";
    this.nodeStates["node_3_control_evidence"].workerId = "worker-thread-03";
    this.nodeStates["node_3_control_evidence"].workerBadge = "worker-03 [ACTIVE]";
    this.nodeStates["node_3_control_evidence"].attempt = 1;
    this._render();
    this._addAudit("PARALLEL_EXECUTION", "Worker-02 (Risk Analysis) & Worker-03 (Control & Evidence) executing concurrently in ThreadPoolExecutor", "THREAD_POOL", "SUCCESS");
    await this._sleep(1300);

    // Node 2 finishes first
    this.nodeStates["node_2_risk_analysis"].status = "COMPLETED";
    this.nodeStates["node_2_risk_analysis"].workerBadge = null;
    this._render();
    this._addAudit("NODE_COMPLETED", "Node 2 (Risk Analysis) completed. Operational risk score: HIGH (0.88)", "worker-thread-02", "SUCCESS", { nodeId: "node_2_risk_analysis" });
    await this._sleep(600);

    // STEP 05: Deterministic Fan-In Barrier (Actively Waiting for Node 3)
    this._setStepState("step_05_fanin", "EXECUTING");
    this.nodeStates["node_4_fan_in"].status = "PENDING";
    this.nodeStates["node_4_fan_in"].waitingForText = "Waiting: [✓ Risk, ○ Control]";
    this._render();
    this._addAudit("FAN_IN_WAITING", "Deterministic Fan-In barrier holds: Risk Analysis [✓], waiting for Control & Evidence [○]", "FAN_IN_BARRIER", "WAITING", { nodeId: "node_4_fan_in" });
    await this._sleep(900);

    // Node 3 finishes
    this.nodeStates["node_3_control_evidence"].status = "COMPLETED";
    this.nodeStates["node_3_control_evidence"].workerBadge = null;
    this._setStepState("step_04_parallel", "COMPLETED");
    this._render();
    this._addAudit("NODE_COMPLETED", "Node 3 (Control Evidence) completed. Key control deficiency in settlement buffer identified", "worker-thread-03", "SUCCESS", { nodeId: "node_3_control_evidence" });
    await this._sleep(600);

    // Fan-In barrier satisfied
    this.nodeStates["node_4_fan_in"].status = "COMPLETED";
    this.nodeStates["node_4_fan_in"].waitingForText = "Joined: [✓ Risk, ✓ Control]";
    this._setStepState("step_05_fanin", "COMPLETED");
    this._render();
    this._addAudit("FAN_IN_SATISFIED", "All incoming branch dependencies completed. Barrier cleared -> Operational Resilience unlocked", "FAN_IN_BARRIER", "SUCCESS", { nodeId: "node_4_fan_in" });
    await this._sleep(700);

    // STEP 06: Operational Resilience Synthesis (Node 5)
    this._setStepState("step_06_node5", "READY");
    this.nodeStates["node_5_operational_resilience"].status = "READY";
    this._render();
    await this._sleep(400);

    this._setStepState("step_06_node5", "EXECUTING");
    this.nodeStates["node_5_operational_resilience"].status = "EXECUTING";
    this.nodeStates["node_5_operational_resilience"].workerId = "worker-thread-01";
    this.nodeStates["node_5_operational_resilience"].workerBadge = "worker-01 [ACTIVE]";
    this.nodeStates["node_5_operational_resilience"].attempt = 1;
    this._render();
    this._addAudit("NODE_LEASE_ACQUIRED", "Synthesizing joined impact analysis. Formulating remediation proposal", "worker-thread-01", "SUCCESS", { nodeId: "node_5_operational_resilience" });
    await this._sleep(1300);

    this.nodeStates["node_5_operational_resilience"].status = "COMPLETED";
    this.nodeStates["node_5_operational_resilience"].workerBadge = null;
    this._setStepState("step_06_node5", "COMPLETED");

    // STEP 07: Governance Evaluation & Confidence Check
    this._setStepState("step_07_governance", "EXECUTING");
    this._render();
    this._addAudit("GOVERNANCE_EVALUATION", "AI model generated proposal with 0.95 confidence. EAIES Rule: CONFIDENCE != AUTHORITY", "POLICY_ENGINE", "EVALUATED", { nodeId: "node_6_governance_check" });
    await this._sleep(800);
    this._setStepState("step_07_governance", "COMPLETED");

    // STEP 08: Human Approval Gate (ADR-009)
    this._setStepState("step_08_human", "PAUSED");
    this.nodeStates["node_6_governance_check"].status = "PAUSED";
    this.workflowInstance.status = "PAUSED";
    this.humanApproval.status = "PENDING";
    this._render();
    this._addAudit("HUMAN_APPROVAL_REQUESTED", "Workflow halted in durable PAUSED state. Mandatory human sign-off required for statutory action", "GOVERNANCE_GATE", "PAUSED", { nodeId: "node_6_governance_check" });
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
      this._setStepState("step_08_human", "COMPLETED");
      this.workflowInstance.status = "RUNNING";
      this._render();
      this._addAudit("HUMAN_APPROVAL_GRANTED", "Executive Sarah Jenkins signed approval. Workflow unpaused with signed token", "HUMAN_PRINCIPAL", "APPROVED", { nodeId: "node_6_governance_check" });
      await this._sleep(800);

      // STEP 09: Approved Action Execution
      this._setStepState("step_09_action", "READY");
      this.nodeStates["node_7_approved_action"].status = "READY";
      this._render();
      await this._sleep(500);

      this._setStepState("step_09_action", "EXECUTING");
      this.nodeStates["node_7_approved_action"].status = "EXECUTING";
      this.nodeStates["node_7_approved_action"].workerId = "action-worker-01";
      this.nodeStates["node_7_approved_action"].workerBadge = "worker-05 [ACTIVE]";
      this.nodeStates["node_7_approved_action"].attempt = 1;
      this._render();
      this._addAudit("NODE_LEASE_ACQUIRED", "Action Executor dispatched. EAIES verified human signature in token -> ALLOWED", "action-worker-01", "ALLOWED", { nodeId: "node_7_approved_action" });
      await this._sleep(1300);

      this.nodeStates["node_7_approved_action"].status = "COMPLETED";
      this.nodeStates["node_7_approved_action"].workerBadge = null;
      this._setStepState("step_09_action", "COMPLETED");

      // STEP 10: Workflow Completed
      this._setStepState("step_10_completed", "EXECUTING");
      this.workflowInstance.status = "COMPLETED";
      this._render();
      await this._sleep(600);
      this._setStepState("step_10_completed", "COMPLETED");
      this._render();
      this._addAudit("WORKFLOW_COMPLETED", "Remediation action committed. Full causal lineage preserved with correlation_id", "ORCHESTRATOR", "SUCCESS", { nodeId: "DAG_ROOT" });
    } else {
      this.humanApproval.status = "REJECTED";
      this.humanApproval.resolvedBy = "sarah.jenkins@cyphervantage.com (ResilienceExecutive)";
      this.nodeStates["node_6_governance_check"].status = "REJECTED";
      this._setStepState("step_08_human", "FAILED");
      this.nodeStates["node_7_approved_action"].status = "FAILED";
      this._setStepState("step_09_action", "BLOCKED");
      this._setStepState("step_10_completed", "FAILED");
      this.workflowInstance.status = "FAILED";
      this._render();
      this._addAudit("HUMAN_APPROVAL_REJECTED", "Executive Sarah Jenkins REJECTED proposed action. Downstream execution frontier halted", "HUMAN_PRINCIPAL", "REJECTED", { nodeId: "node_6_governance_check" });
      await this._sleep(600);
      this._addAudit("WORKFLOW_TERMINATED", "Workflow safely terminated in FAILED state. Action executor will NOT execute", "ORCHESTRATOR", "TERMINATED", { nodeId: "DAG_ROOT" });
    }

    this.isRunning = false;
  }

  /**
   * Phase 3: Enhanced Worker Crash & Lease Recovery Simulation
   */
  async simulateCrashRecovery() {
    if (this.isRunning) return;
    this.reset();
    this.isRunning = true;

    this._addAudit("PHASE3_CRASH_SIMULATION", "Simulating worker crash, lease expiration, and sweeper reclamation", "ORCHESTRATOR", "SUCCESS");
    await this._sleep(600);

    // 1. Worker Alpha claims node 1
    this.nodeStates["node_1_regulatory_intelligence"].status = "EXECUTING";
    this.nodeStates["node_1_regulatory_intelligence"].workerId = "worker-alpha-01";
    this.nodeStates["node_1_regulatory_intelligence"].workerBadge = "worker-alpha-01 [ACTIVE]";
    this.nodeStates["node_1_regulatory_intelligence"].attempt = 1;
    this.selectNode("node_1_regulatory_intelligence");
    this._render();
    this._addAudit("NODE_LEASE_ACQUIRED", "Worker Alpha acquired lease (lease_expires_at = T+30s)", "worker-alpha-01", "SUCCESS", { nodeId: "node_1_regulatory_intelligence", attempt: 1 });
    await this._sleep(1100);

    // 2. Worker Alpha crashes
    this.nodeStates["node_1_regulatory_intelligence"].status = "CRASHED";
    this.nodeStates["node_1_regulatory_intelligence"].workerBadge = "worker-alpha-01 [CRASHED]";
    this._render();
    this._addAudit("WORKER_CRASHED", "Worker Alpha process crashed! Heartbeat thread terminated prematurely", "worker-alpha-01", "FAILED", { nodeId: "node_1_regulatory_intelligence", attempt: 1 });
    await this._sleep(1100);

    // 3. Lease expires & Sweeper detects
    this._addAudit("LEASE_EXPIRED", "Lease timeout reached (T+30s). Heartbeat missing", "RECOVERY_SWEEPER", "DETECTED", { nodeId: "node_1_regulatory_intelligence", attempt: 1 });
    await this._sleep(900);

    this.nodeStates["node_1_regulatory_intelligence"].status = "READY";
    this.nodeStates["node_1_regulatory_intelligence"].workerId = null;
    this.nodeStates["node_1_regulatory_intelligence"].workerBadge = "LEASE RECLAIMED (Attempt 2)";
    this._render();
    this._addAudit("NODE_LEASE_RECLAIMED", "Recovery sweeper reclaimed node lease. State reset to READY. Attempt incremented to 2", "RECOVERY_SWEEPER", "RECLAIMED", { nodeId: "node_1_regulatory_intelligence", attempt: 2 });
    await this._sleep(1000);

    // 4. Worker Beta claims node 1 attempt 2
    this.nodeStates["node_1_regulatory_intelligence"].status = "EXECUTING";
    this.nodeStates["node_1_regulatory_intelligence"].workerId = "worker-beta-02";
    this.nodeStates["node_1_regulatory_intelligence"].workerBadge = "worker-beta-02 [ACTIVE]";
    this.nodeStates["node_1_regulatory_intelligence"].attempt = 2;
    this._render();
    this._addAudit("NODE_LEASE_ACQUIRED", "Worker Beta acquired reclaimed lease. Resuming execution (attempt 2)", "worker-beta-02", "SUCCESS", { nodeId: "node_1_regulatory_intelligence", attempt: 2 });
    await this._sleep(1200);

    // 5. Stale Worker Alpha attempts late completion
    this._addAudit("STALE_WORKER_ATTEMPT", "Crashed Worker Alpha awakens and attempts late completion for attempt 1", "worker-alpha-01", "CONFLICT", { nodeId: "node_1_regulatory_intelligence", attempt: 1 });
    await this._sleep(700);
    this._addAudit("STALE_COMPLETION_REJECTED", "Optimistic version / lease check failed! Worker Alpha completion REJECTED by repository", "REPOSITORY_UOW", "BLOCKED", { nodeId: "node_1_regulatory_intelligence", attempt: 1 });
    await this._sleep(900);

    // 6. Worker Beta completes
    this.nodeStates["node_1_regulatory_intelligence"].status = "COMPLETED";
    this.nodeStates["node_1_regulatory_intelligence"].workerBadge = null;
    this._render();
    this._addAudit("NODE_COMPLETED", "Worker Beta successfully committed node completion on attempt 2", "worker-beta-02", "SUCCESS", { nodeId: "node_1_regulatory_intelligence", attempt: 2 });
    this.isRunning = false;
  }

  /**
   * Phase 3: Idempotency & Deduplication Check
   */
  async simulateIdempotencyCheck() {
    this._addAudit("IDEMPOTENCY_REQUEST_A", "Request A admitted: Key=BO-2026-001, SHA256=a1b2c3d4. Work Item created", "GATEWAY", "ACCEPTED");
    await this._sleep(600);
    this._addAudit("ADMISSION_GRANTED", "Work item wi-2026-9b4d8c72 admitted under root correlation_id", "ADMISSION_SERVICE", "SUCCESS");
    await this._sleep(900);

    this._addAudit("IDEMPOTENCY_REQUEST_B", "Request B arrived: Duplicate Key=BO-2026-001 received from message broker", "GATEWAY", "RECEIVED");
    await this._sleep(600);
    this._addAudit("DUPLICATE_DEDUPLICATED", "Idempotency hash matched existing record. Deduplicated: Returned cached result with zero redundant node invocations", "ADMISSION_SERVICE", "DEDUPLICATED");
  }

  /**
   * Adversarial Scenarios
   */
  async runAdversarialTest(scenarioId) {
    if (this.isRunning) return;

    if (scenarioId === 'attack_unauthorized_capability') {
      this.selectNode("node_2_risk_analysis");
      this._addAudit("ATTACK_SIMULATION", "Risk Analysis AI Employee attempts 'regulatory.action.execute'", "emp-risk-analyst-01", "ATTACK");
      await this._sleep(400);
      this._addAudit("AUTHORITY_DENIED", "EAIES Policy Violation: capability 'regulatory.action.execute' not permitted for caller", "EAIES_PROXY", "BLOCKED", { nodeId: "node_2_risk_analysis" });
    } else if (scenarioId === 'attack_insufficient_authority') {
      this.selectNode("node_1_regulatory_intelligence");
      this._addAudit("ATTACK_SIMULATION", "Regulatory Intelligence attempts remediation with scope 'regulatory_read'", "emp-reg-intel-01", "ATTACK");
      await this._sleep(400);
      this._addAudit("AUTHORITY_DENIED", "EAIES Scope Mismatch: Required 'action_execute', caller possesses 'regulatory_read'", "EAIES_PROXY", "BLOCKED", { nodeId: "node_1_regulatory_intelligence" });
    } else if (scenarioId === 'attack_suspended_employee') {
      this.selectNode("node_2_risk_analysis");
      this._addAudit("ATTACK_SIMULATION", "Suspended AI Employee (emp-risk-analyst-suspended) attempts lease claim", "emp-risk-analyst", "ATTACK");
      await this._sleep(400);
      this._addAudit("LIFECYCLE_BLOCKED", "Lifecycle Enforcement: AI Employee status is SUSPENDED. Dispatch rejected immediately", "EAIES_PROXY", "BLOCKED", { nodeId: "node_2_risk_analysis" });
    } else if (scenarioId === 'attack_retired_employee') {
      this.selectNode("node_3_control_evidence");
      this._addAudit("ATTACK_SIMULATION", "Decommissioned AI Employee (emp-control-evidence-retired) attempts capability call", "emp-control", "ATTACK");
      await this._sleep(400);
      this._addAudit("LIFECYCLE_BLOCKED", "Lifecycle Enforcement: AI Employee status is RETIRED. Permanent invocation block", "EAIES_PROXY", "BLOCKED", { nodeId: "node_3_control_evidence" });
    } else if (scenarioId === 'attack_p2p_invocation') {
      this.selectNode("node_2_risk_analysis");
      this._addAudit("ATTACK_SIMULATION", "Risk Analysis Agent calls Operational Resilience directly without Orchestrator", "emp-risk-analyst-01", "ATTACK");
      await this._sleep(400);
      this._addAudit("PEER_INVOCATION_BLOCKED", "Architectural Violation: Direct AI-to-AI peer invocation prohibited. Zero peer communication channels", "ARCH_GUARD", "BLOCKED", { nodeId: "node_2_risk_analysis" });
    } else if (scenarioId === 'attack_unauthorized_human') {
      this.selectNode("node_6_governance_check");
      this._addAudit("ATTACK_SIMULATION", "Junior Analyst (junior.analyst@company.com) attempts high-impact sign-off", "HUMAN_GATE", "ATTACK");
      await this._sleep(400);
      this._addAudit("GOVERNANCE_DENIED", "Role Privilege Violation: User lacks 'ResilienceExecutive' role. Human approval rejected", "HUMAN_APPROVAL_SERVICE", "BLOCKED", { nodeId: "node_6_governance_check" });
    } else if (scenarioId === 'attack_action_without_approval') {
      this.selectNode("node_7_approved_action");
      this._addAudit("ATTACK_SIMULATION", "Action Executor attempts execution while Human Approval Gate is PENDING", "emp-action-executor-01", "ATTACK");
      await this._sleep(400);
      this._addAudit("STATE_ORDER_BLOCKED", "Workflow State Violation: Execution frontier cannot advance until HumanApprovalRequest is APPROVED", "WORKFLOW_ENGINE", "BLOCKED", { nodeId: "node_7_approved_action" });
    }
  }
}
