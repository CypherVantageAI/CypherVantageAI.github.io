// ==========================================================================
// EAIOS Architecture Showcase - Canonical Data & Schema Definitions
// ==========================================================================

export const EAIOS_METRICS = {
  governedTests: 15,
  regressionTestsPassed: 242,
  workflowNodes: 7,
  parallelBranches: 2,
  humanBoundaries: 1,
  peerChannels: 0,
  sovereignBoundaries: 1
};

export const EAIOS_NODES = [
  {
    id: "node_1_regulatory_intelligence",
    name: "Regulatory Intelligence",
    category: "ai_employee",
    employeeId: "emp-reg-intel-01",
    employeeName: "Regulatory Intelligence Agent",
    capabilityId: "regulatory.intelligence.analyze",
    authorityScope: "regulatory_read",
    description: "Ingests business events, parses legal obligations, affected entities, and statutory deadlines.",
    dependencies: [],
    x: 80,
    y: 190
  },
  {
    id: "node_2_risk_analysis",
    name: "Risk Analysis",
    category: "ai_employee",
    employeeId: "emp-risk-analyst-01",
    employeeName: "Risk Analysis Agent",
    capabilityId: "risk.domain.assess",
    authorityScope: "risk_assess",
    description: "Assesses operational, market, and compliance risk profiles. Runs parallel with Control & Evidence.",
    dependencies: ["node_1_regulatory_intelligence"],
    parallelGroup: "branch_eval",
    x: 310,
    y: 90
  },
  {
    id: "node_3_control_evidence",
    name: "Control & Evidence",
    category: "ai_employee",
    employeeId: "emp-control-evidence-01",
    employeeName: "Control & Evidence Agent",
    capabilityId: "control.evidence.evaluate",
    authorityScope: "control_evaluate",
    description: "Audits internal controls and determines gap posture. Runs parallel with Risk Analysis.",
    dependencies: ["node_1_regulatory_intelligence"],
    parallelGroup: "branch_eval",
    x: 310,
    y: 290
  },
  {
    id: "node_4_fan_in",
    name: "Deterministic Fan-In Barrier",
    category: "coordination_primitive",
    employeeId: null,
    employeeName: "Coordination Barrier (NOT an AI Agent)",
    capabilityId: "barrier.join.deterministic",
    authorityScope: "orchestrator_internal",
    description: "Workflow synchronization construct. Remains PENDING until both parallel branches reach COMPLETED.",
    dependencies: ["node_2_risk_analysis", "node_3_control_evidence"],
    x: 540,
    y: 190
  },
  {
    id: "node_5_operational_resilience",
    name: "Operational Resilience",
    category: "ai_employee",
    employeeId: "emp-op-resilience-01",
    employeeName: "Operational Resilience Agent",
    capabilityId: "resilience.impact.synthesize",
    authorityScope: "resilience_synthesize",
    description: "Synthesizes joined analytical data and formulates recommended action. High confidence (0.95) cannot authorize execution.",
    dependencies: ["node_4_fan_in"],
    x: 770,
    y: 190
  },
  {
    id: "node_6_governance_check",
    name: "Human Governance Check",
    category: "governance_boundary",
    employeeId: null,
    employeeName: "Human Approval Gate (ADR-009)",
    capabilityId: "governance.approval.evaluate",
    authorityScope: "governance_checkpoint",
    description: "Halts execution, creates HumanApprovalRequest, and pauses workflow. High confidence != Authority.",
    dependencies: ["node_5_operational_resilience"],
    x: 1000,
    y: 190
  },
  {
    id: "node_7_approved_action",
    name: "Approved Action Execution",
    category: "action_executor",
    employeeId: "emp-action-executor-01",
    employeeName: "Action Executor Agent",
    capabilityId: "regulatory.action.execute",
    authorityScope: "action_execute",
    description: "Executes final remediation ONLY after verified human executive approval. Upstream AI cannot manufacture authority.",
    dependencies: ["node_6_governance_check"],
    x: 1230,
    y: 190
  }
];

export const ARCHITECTURE_LAYERS = [
  {
    id: "business_event",
    title: "1. Business Regulatory Event",
    purpose: "Statutory or market trigger initiating governed compliance workflow.",
    durableState: "Immutable event payload with root correlation_id, timestamp, and external source mandate.",
    authority: "Zero execution authority. External trigger only.",
    failureBehavior: "Ingestion gateway rejects malformed schemas before admitting to work queue.",
    productionEvolution: "Kafka / AWS SQS partitioned event stream with dead-letter queue."
  },
  {
    id: "workflow_definition",
    title: "2. Workflow Definition (ADR-017)",
    purpose: "Immutable DAG schema declaring node dependencies, SLA budgets, and required capabilities.",
    durableState: "Versioned schema records in database. Existing executions remain pinned to their initial schema version.",
    authority: "Declarative only. Schemas declare topology; they never grant capability authorization.",
    failureBehavior: "Schema validator rejects cyclic graphs or missing capability references.",
    productionEvolution: "GitOps version-controlled definitions with semantic version migrations."
  },
  {
    id: "workflow_instance",
    title: "3. Workflow Instance",
    purpose: "Durable state container tracking end-to-end execution lifecycle (CREATED, RUNNING, PAUSED, COMPLETED, FAILED).",
    durableState: "Durable row in PostgreSQL/SQLite with optimistic concurrency version.",
    authority: "Owns execution state; owns zero EAIES authority.",
    failureBehavior: "Transitions to FAILED on unrecoverable node error or human rejection.",
    productionEvolution: "Distributed PostgreSQL database with row-level leasing and optimistic locking."
  },
  {
    id: "workflow_node",
    title: "4. Workflow Node Execution",
    purpose: "Individual task state machine (PENDING, READY, EXECUTING, COMPLETED, FAILED, SKIPPED).",
    durableState: "Durable record storing worker_id, lease_expires_at, execution_attempt, business_operation_id.",
    authority: "None. Represents coordination state.",
    failureBehavior: "Expired leases are reclaimed by background sweeper; failed attempts retry up to budget.",
    productionEvolution: "Database-backed leases with periodic worker heartbeat renewal."
  },
  {
    id: "engine_runtime",
    title: "5. WorkflowEngine & OrchestratorRuntime",
    purpose: "Stateless scheduler calculating runnable DAG frontier and leasing node execution.",
    durableState: "Stateless in memory. Entirely reconstructable from durable database state.",
    authority: "Coordinates work items; cannot bypass EAIES sovereignty boundary.",
    failureBehavior: "Coordinator crash leaves durable records intact. A new process reconstructs the frontier without replay.",
    productionEvolution: "Horizontally scalable, stateless coordinator pods behind distributed queue."
  },
  {
    id: "capability_execution",
    title: "6. Enterprise Capability & Contract",
    purpose: "Atomic, declarative unit of enterprise work with declared SLA and required authority scopes.",
    durableState: "Capability registry catalog specifying contract inputs, outputs, and idempotency guarantees.",
    authority: "Specifies required authority; does NOT confer authority.",
    failureBehavior: "Contract validation failure halts node execution before provider dispatch.",
    productionEvolution: "Service mesh with mutual TLS and circuit-breaker telemetry."
  },
  {
    id: "ai_employee",
    title: "7. AI Employee Identity (ADR-011)",
    purpose: "Durable organizational actor bound to human owner, model reference, and lifecycle (ACTIVE, SUSPENDED, RETIRED).",
    durableState: "Durable identity profile in AI Employee registry with versioned lifecycle transitions.",
    authority: "Carries NO autonomous authority. Strictly barred from peer-to-peer invocation.",
    failureBehavior: "Suspended or retired identities are synchronously blocked from executing by EAIES.",
    productionEvolution: "Cryptographically signed identity tokens with instant revocation pub/sub."
  },
  {
    id: "eaies_boundary",
    title: "8. EAIES Sovereign Boundary",
    purpose: "Enterprise AI Execution Sovereignty: non-bypassable policy proxy intercepting every capability invocation.",
    durableState: "Authoritative policy repository storing permitted capabilities, authority scopes, and confidence gates.",
    authority: "SOLE AUTHORITATIVE EXECUTION GATE. Evaluates policy independently of workflow claims.",
    failureBehavior: "Raises EAIESConstraintViolationError immediately on scope or capability mismatch.",
    productionEvolution: "Kernel-level / sidecar policy enforcement agent with tamper-evident audit ledger."
  },
  {
    id: "human_governance",
    title: "9. Human Governance Boundary (ADR-009)",
    purpose: "Accountable human principal sign-off for high-impact actions. AI confidence is never authority.",
    durableState: "Durable HumanApprovalRequest (PENDING, APPROVED, REJECTED) with cryptographic context hash.",
    authority: "Authoritative human executive approval unpauses the workflow for terminal action execution.",
    failureBehavior: "Human rejection safely halts the workflow in terminal FAILED state; unauthorized approval rejected.",
    productionEvolution: "Multi-factor authorized enterprise mobile/web executive approval portal."
  }
];
