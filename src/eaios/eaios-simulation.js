// ==========================================================================
// EAIOS Architecture Showcase - State Machines & Interactive Simulations
// ==========================================================================

import { EAIOS_NODES } from './eaios-data.js';

export class EaiosSimulationManager {
  constructor(onStateChange) {
    this.onStateChange = onStateChange;
    this.resetSimulation();
  }

  resetSimulation() {
    this.currentStep = 0;
    this.isRunning = false;
    this.timer = null;
    this.correlationId = "9b4d8c72-4a11-4f1e-9208-" + Math.random().toString(16).substring(2, 10);
    
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
        version: 1
      };
    }

    this.humanApproval = {
      status: "NONE",
      assignedRole: "ResilienceExecutive",
      resolvedBy: null
    };

    this.eaiesRecord = {
      provider: "None",
      capability: "None",
      authorityScope: "None",
      lifecycle: "ACTIVE",
      result: "AWAITING INVOCATION"
    };

    this.stepDescription = "System idle. Click 'Run Governed Workflow' to simulate the Phase 2 execution lifecycle.";
    this._notify();
  }

  async runWorkflow() {
    if (this.isRunning) return;
    this.resetSimulation();
    this.isRunning = true;

    // STEP 1: Business Event Admitted
    this.workflowInstance.status = "RUNNING";
    this.workflowInstance.workItemStatus = "EXECUTING";
    this.workflowInstance.version++;
    this.stepDescription = "Step 1/12: Business Regulatory Event admitted. WorkItem created with correlation_id: " + this.correlationId;
    this._notify();
    await this._sleep(1200);

    // STEP 2: Node 1 becomes READY
    this.nodeStates["node_1_regulatory_intelligence"].status = "READY";
    this.nodeStates["node_1_regulatory_intelligence"].version++;
    this.stepDescription = "Step 2/12: WorkflowEngine reconstructs frontier. node_1_regulatory_intelligence dependencies satisfied -> READY.";
    this._notify();
    await this._sleep(1100);

    // STEP 3: Node 1 becomes EXECUTING
    this.nodeStates["node_1_regulatory_intelligence"].status = "EXECUTING";
    this.nodeStates["node_1_regulatory_intelligence"].attempt = 1;
    this.nodeStates["node_1_regulatory_intelligence"].workerId = "worker-pool-01";
    this.nodeStates["node_1_regulatory_intelligence"].version++;
    this.eaiesRecord = {
      provider: "emp-reg-intel-01",
      capability: "regulatory.intelligence.analyze",
      authorityScope: "regulatory_read",
      lifecycle: "ACTIVE",
      result: "ALLOWED — EAIES policy verified"
    };
    this.stepDescription = "Step 3/12: Orchestrator claims execution lease for emp-reg-intel-01. EAIES validates policy -> ALLOWED.";
    this._notify();
    await this._sleep(1500);

    // STEP 4: Node 1 becomes COMPLETED
    this.nodeStates["node_1_regulatory_intelligence"].status = "COMPLETED";
    this.nodeStates["node_1_regulatory_intelligence"].version++;
    this.stepDescription = "Step 4/12: node_1_regulatory_intelligence completed. Regulatory mandate parsed: Core Clearing Resilience.";
    this._notify();
    await this._sleep(1100);

    // STEP 5: Nodes 2 and 3 become READY simultaneously
    this.nodeStates["node_2_risk_analysis"].status = "READY";
    this.nodeStates["node_2_risk_analysis"].version++;
    this.nodeStates["node_3_control_evidence"].status = "READY";
    this.nodeStates["node_3_control_evidence"].version++;
    this.stepDescription = "Step 5/12: Frontier reconstructed. Both downstream analytical branches (Risk & Control) evaluate to READY simultaneously.";
    this._notify();
    await this._sleep(1200);

    // STEP 6: Nodes 2 and 3 execute concurrently (Genuine Parallelism)
    this.nodeStates["node_2_risk_analysis"].status = "EXECUTING";
    this.nodeStates["node_2_risk_analysis"].attempt = 1;
    this.nodeStates["node_2_risk_analysis"].workerId = "thread-worker-A";
    this.nodeStates["node_2_risk_analysis"].version++;

    this.nodeStates["node_3_control_evidence"].status = "EXECUTING";
    this.nodeStates["node_3_control_evidence"].attempt = 1;
    this.nodeStates["node_3_control_evidence"].workerId = "thread-worker-B";
    this.nodeStates["node_3_control_evidence"].version++;

    this.eaiesRecord = {
      provider: "emp-risk-analyst-01 & emp-control-evidence-01",
      capability: "risk.domain.assess / control.evidence.evaluate",
      authorityScope: "risk_assess / control_evaluate",
      lifecycle: "ACTIVE",
      result: "ALLOWED — Multi-threaded parallel execution"
    };
    this.stepDescription = "Step 6/12: Genuine multi-threaded parallel execution. Distinct worker threads claim leases and execute independently.";
    this._notify();
    await this._sleep(1800);

    // Both parallel nodes complete
    this.nodeStates["node_2_risk_analysis"].status = "COMPLETED";
    this.nodeStates["node_2_risk_analysis"].version++;
    this.nodeStates["node_3_control_evidence"].status = "COMPLETED";
    this.nodeStates["node_3_control_evidence"].version++;

    // STEP 7 & 8: Node 4 Fan-In Barrier
    this.nodeStates["node_4_fan_in"].status = "READY";
    this.nodeStates["node_4_fan_in"].version++;
    this.stepDescription = "Step 7/12: Fan-in barrier evaluates dependencies: both branches COMPLETED. Barrier transitions to READY (NOT an AI agent).";
    this._notify();
    await this._sleep(1100);

    this.nodeStates["node_4_fan_in"].status = "COMPLETED";
    this.nodeStates["node_4_fan_in"].version++;
    this.stepDescription = "Step 8/12: Deterministic Fan-In join executed. Aggregated payload passed to Operational Resilience synthesizer.";
    this._notify();
    await this._sleep(1100);

    // STEP 9: Node 5 executes (Operational Resilience)
    this.nodeStates["node_5_operational_resilience"].status = "EXECUTING";
    this.nodeStates["node_5_operational_resilience"].attempt = 1;
    this.nodeStates["node_5_operational_resilience"].workerId = "thread-worker-A";
    this.nodeStates["node_5_operational_resilience"].version++;
    this.eaiesRecord = {
      provider: "emp-op-resilience-01",
      capability: "resilience.impact.synthesize",
      authorityScope: "resilience_synthesize",
      lifecycle: "ACTIVE",
      result: "ALLOWED — Confidence: 0.95 (High Confidence != Authority)"
    };
    this.stepDescription = "Step 9/12: Operational Resilience synthesizes impact. Generates high-confidence (0.95) remediation recommendation.";
    this._notify();
    await this._sleep(1600);

    this.nodeStates["node_5_operational_resilience"].status = "COMPLETED";
    this.nodeStates["node_5_operational_resilience"].version++;

    // STEP 10 & 11: Governance Check & Durable PAUSED
    this.nodeStates["node_6_governance_check"].status = "PAUSED";
    this.nodeStates["node_6_governance_check"].version++;

    this.workflowInstance.status = "PAUSED";
    this.workflowInstance.workItemStatus = "PAUSED";
    this.workflowInstance.version++;

    this.humanApproval = {
      status: "PENDING",
      assignedRole: "ResilienceExecutive",
      resolvedBy: null
    };

    this.eaiesRecord = {
      provider: "emp-action-executor-01",
      capability: "regulatory.action.execute",
      authorityScope: "action_execute",
      lifecycle: "ACTIVE",
      result: "BLOCKED — HUMAN APPROVAL REQUIRED (ADR-009)"
    };

    this.stepDescription = "Step 11/12: Governance Checkpoint reached! Workflow halted in durable PAUSED state. Human approval required.";
    this.isRunning = false;
    this._notify();
  }

  resolveHumanApproval(approved) {
    if (this.humanApproval.status !== 'PENDING') return;

    if (approved) {
      this.humanApproval.status = "APPROVED";
      this.humanApproval.resolvedBy = "sarah.jenkins@cyphervantage.com (ResilienceExecutive)";
      this.workflowInstance.status = "RUNNING";
      this.workflowInstance.workItemStatus = "EXECUTING";
      this.workflowInstance.version++;

      this.nodeStates["node_6_governance_check"].status = "COMPLETED";
      this.nodeStates["node_6_governance_check"].version++;

      this.nodeStates["node_7_approved_action"].status = "READY";
      this.nodeStates["node_7_approved_action"].version++;

      this.stepDescription = "Human Executive APPROVED remediation action. Unpausing workflow and scheduling terminal action executor.";
      this._notify();

      setTimeout(() => {
        this.nodeStates["node_7_approved_action"].status = "EXECUTING";
        this.nodeStates["node_7_approved_action"].attempt = 1;
        this.nodeStates["node_7_approved_action"].workerId = "action-worker-01";
        this.nodeStates["node_7_approved_action"].version++;

        this.eaiesRecord = {
          provider: "emp-action-executor-01",
          capability: "regulatory.action.execute",
          authorityScope: "action_execute",
          lifecycle: "ACTIVE",
          result: "ALLOWED — Verified Human Approval Signature Present"
        };
        this.stepDescription = "Step 12/12: Approved action executing under verified human authorization through EAIES sovereignty boundary.";
        this._notify();

        setTimeout(() => {
          this.nodeStates["node_7_approved_action"].status = "COMPLETED";
          this.nodeStates["node_7_approved_action"].version++;
          this.workflowInstance.status = "COMPLETED";
          this.workflowInstance.workItemStatus = "COMPLETED";
          this.workflowInstance.version++;
          this.stepDescription = "Workflow COMPLETED successfully with immutable correlation and full forensic audit provenance.";
          this._notify();
        }, 1500);
      }, 1200);

    } else {
      this.humanApproval.status = "REJECTED";
      this.humanApproval.resolvedBy = "sarah.jenkins@cyphervantage.com (ResilienceExecutive)";
      this.workflowInstance.status = "FAILED";
      this.workflowInstance.workItemStatus = "FAILED";
      this.workflowInstance.version++;

      this.nodeStates["node_6_governance_check"].status = "FAILED";
      this.nodeStates["node_6_governance_check"].version++;

      this.nodeStates["node_7_approved_action"].status = "PENDING";

      this.eaiesRecord = {
        provider: "emp-action-executor-01",
        capability: "regulatory.action.execute",
        authorityScope: "action_execute",
        lifecycle: "ACTIVE",
        result: "SAFELY TERMINATED — Human Rejection Halts Action"
      };

      this.stepDescription = "Human Executive REJECTED proposed action. Workflow safely transitioned to terminal FAILED state. Action node remains PENDING.";
      this._notify();
    }
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  _notify() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange({
        workflowInstance: this.workflowInstance,
        nodeStates: this.nodeStates,
        humanApproval: this.humanApproval,
        eaiesRecord: this.eaiesRecord,
        correlationId: this.correlationId,
        stepDescription: this.stepDescription,
        isPausedForApproval: this.humanApproval.status === 'PENDING',
        isRunning: this.isRunning
      });
    }
  }
}
