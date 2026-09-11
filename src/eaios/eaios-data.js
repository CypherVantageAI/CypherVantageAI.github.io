// ==========================================================================
// EAIOS Architecture Showcase - Canonical Data & Schema Definitions
// ==========================================================================

export const EAIOS_METRICS = {
  phase2TestsPassed: 15,
  phase3TestsPassed: 13,
  regressionTestsPassed: 242,
  regressionTestsSkipped: 10, // Requires live PostgreSQL cluster
  totalNodes: 7,
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
    x: 90,
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
    description: "Assesses operational, market, and compliance risk profiles. Runs parallel with Control & Evidence in ThreadPoolExecutor.",
    dependencies: ["node_1_regulatory_intelligence"],
    parallelGroup: "branch_eval",
    x: 330,
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
    description: "Audits internal controls and determines gap posture. Runs parallel with Risk Analysis in ThreadPoolExecutor.",
    dependencies: ["node_1_regulatory_intelligence"],
    parallelGroup: "branch_eval",
    x: 330,
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
    description: "Workflow synchronization barrier. Remains PENDING until all parallel incoming branch nodes reach COMPLETED.",
    dependencies: ["node_2_risk_analysis", "node_3_control_evidence"],
    x: 570,
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
    description: "Synthesizes joined branch evidence and formulates remediation proposal. High confidence (0.95) cannot authorize execution.",
    dependencies: ["node_4_fan_in"],
    x: 810,
    y: 190
  },
  {
    id: "node_6_governance_check",
    name: "Human Governance Gate",
    category: "governance_boundary",
    employeeId: null,
    employeeName: "Human Approval Gate (ADR-009)",
    capabilityId: "governance.approval.evaluate",
    authorityScope: "governance_checkpoint",
    description: "Halts execution frontier, creates durable HumanApprovalRequest in PAUSED state. Downstream nodes cannot advance.",
    dependencies: ["node_5_operational_resilience"],
    x: 1050,
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
    x: 1290,
    y: 190
  }
];

export const ARCHITECTURE_LAYERS = [
  {
    layer: 1,
    name: "Human / Business Governance",
    adr: "ADR-001 / ADR-009",
    type: "governance",
    status: "Implemented & Validated",
    purpose: "Ultimate human accountability and non-delegable oversight for all high-risk corporate and regulatory actions.",
    components: ["HumanApprovalService", "HumanApprovalRequest", "GovernanceRoleAuthorization"],
    currentImpl: "In-process approval boundary creating durable PAUSED state, blocking frontier advancement until signed human decision is committed.",
    productionEvolution: "Enterprise multi-factor executive approval portal, SSO/SAML integration, multi-approver quorum voting, and hardware security tokens."
  },
  {
    layer: 2,
    name: "AI Workforce",
    adr: "ADR-011 / ADR-012",
    type: "identity",
    status: "Implemented & Validated",
    purpose: "Organizational identity, role assignments, and lifecycle governance (ACTIVE, SUSPENDED, RETIRED) for AI Employees.",
    components: ["AIEmployeeRegistry", "WorkforceManagementService", "ActorAuthorizationGuard"],
    currentImpl: "Repository-backed registry tracking AI Employee identity and lifecycle status. Synchronously blocks suspended or retired employees.",
    productionEvolution: "Cryptographically signed ephemeral mTLS identity certificates, IAM federation, and automated real-time revocation broadcast."
  },
  {
    layer: 3,
    name: "Enterprise Capabilities",
    adr: "ADR-004 / ADR-008",
    type: "contract",
    status: "Implemented & Validated",
    purpose: "Declarative specifications of callable enterprise operations, defining input/output schemas, SLA targets, and required authority scopes.",
    components: ["CapabilityRegistry", "CapabilityContract", "CapabilityRequest"],
    currentImpl: "Registry service resolving capability ID to provider binding, requiring explicit schema validation before dispatch.",
    productionEvolution: "Dynamic versioned capability catalog, gRPC/OpenAPI service contracts, distributed service discovery, and SLA tracking."
  },
  {
    layer: 4,
    name: "Work Items",
    adr: "ADR-006 / ADR-014",
    type: "coordination",
    status: "Implemented & Validated",
    purpose: "Durable units of business work tracking overall business lifecycle, root correlation, rate limits, and admission controls.",
    components: ["EnterpriseWorkItem", "DelegationAdmissionService", "RateLimitCounter"],
    currentImpl: "Durable work item entity with root correlation_id, attempt tracking, admission rate-limiting, and recursion depth caps.",
    productionEvolution: "Partitioned event-driven work management system with enterprise dead-letter processing and cross-system webhooks."
  },
  {
    layer: 5,
    name: "Workflow / Orchestration",
    adr: "ADR-007 / ADR-017",
    type: "coordination",
    status: "Implemented & Validated",
    purpose: "Stateless forward frontier reconstruction over durable DAG state. Coordinates execution ordering without owning authority.",
    components: ["WorkflowDefinition", "WorkflowInstance", "WorkflowEngine", "reconstruct_frontier()"],
    currentImpl: "Stateless frontier evaluator traversing DAG dependencies, managing deterministic fan-in barriers and multi-branch execution.",
    productionEvolution: "Horizontally scalable, stateless coordinator workers reading shared durable DAG state without leader election bottlenecks."
  },
  {
    layer: 6,
    name: "EAIES Authority Enforcement",
    adr: "ADR-002 / ADR-011",
    type: "sovereignty",
    status: "Implemented & Validated",
    purpose: "Enterprise AI Execution Sovereignty: sovereign, non-bypassable policy proxy intercepting every capability execution.",
    components: ["EAIESEnforcementProxy", "EAIESPolicy", "AuthorityContextStripper"],
    currentImpl: "Non-bypassable proxy evaluating scoped policy against verified caller identity. Injected context claims are discarded.",
    productionEvolution: "Kernel-level enforcement sidecar / API gateway proxy with mutual TLS, policy-as-code (OPA/Rego), and HSM-backed verification."
  },
  {
    layer: 7,
    name: "Enterprise Memory / Audit",
    adr: "ADR-005 / ADR-015",
    type: "audit",
    status: "Implemented & Validated",
    purpose: "Append-only, immutable forensic event stream recording every lifecycle transition with unbroken causal correlation.",
    components: ["EnterpriseMemoryEvent", "CorrelationContext", "ForensicAuditLedger"],
    currentImpl: "Repository recording immutable events with correlation_id, work_item_id, instance_id, worker_id, attempt, and outcome.",
    productionEvolution: "WORM (Write Once Read Many) compliant storage, cryptographically chained block ledger, and SIEM / OpenTelemetry integration."
  },
  {
    layer: 8,
    name: "Execution / Recovery",
    adr: "ADR-016 / Phase 3",
    type: "execution",
    status: "Implemented & Validated",
    purpose: "Durable worker leases, heartbeats, background sweeper recovery, stale-worker rejection, and attempt-scoped idempotency.",
    components: ["ExecutionLease", "RecoverySweeper", "IdempotencyEnforcer", "HeartbeatMonitor"],
    currentImpl: "Optimistic lease locking on node executions, heartbeat tracking, lease reclamation, and attempt-scoped deduplication.",
    productionEvolution: "Distributed lock manager (etcd / PostgreSQL advisory locks) with adaptive lease durations and automated worker fencing."
  },
  {
    layer: 9,
    name: "Infrastructure / Persistence",
    adr: "Repository Contracts",
    type: "persistence",
    status: "Implemented & Validated",
    purpose: "Abstract UnitOfWork and repository contracts supporting transactional consistency and optimistic concurrency.",
    components: ["UnitOfWork", "SqliteUnitOfWork", "MemoryUnitOfWork", "OptimisticVersionLock"],
    currentImpl: "Python abstraction layer with SQLite (WAL mode) and in-memory test implementations using version-based optimistic locking.",
    productionEvolution: "High-availability PostgreSQL cluster with connection pooling (PgBouncer), read replicas, and geo-redundant backups."
  }
];

export const ARCHITECTURAL_CONCEPTS = [
  {
    title: "AI Employee",
    identity: "emp-reg-intel-01",
    nature: "Organizational Identity",
    lifecycle: "PROVISIONED → ACTIVE → SUSPENDED → RETIRED",
    authorityRule: "Identity NEVER equals authority. An AI Employee possesses zero autonomous capability execution rights.",
    enforcement: "EAIES verifies that provider identity is ACTIVE. If SUSPENDED or RETIRED, EAIES immediately blocks execution.",
    boundary: "Strictly prohibited from directly invoking peer AI Employees or altering workforce memberships."
  },
  {
    title: "Enterprise Capability",
    identity: "regulatory.intelligence.analyze",
    nature: "Declarative Operation Contract",
    lifecycle: "DRAFT → ACTIVE → DEPRECATED → RETIRED",
    authorityRule: "Capabilities declare required authority scopes, SLA budgets, and schemas; they do NOT manufacture authority.",
    enforcement: "EAIES verifies that the caller's authorized EAIESPolicy explicitly includes this capability ID.",
    boundary: "Capabilities cannot be executed without passing through the sovereign EAIESEnforcementProxy."
  },
  {
    title: "Enterprise Work Item",
    identity: "wi-2026-9b4d8c72",
    nature: "Durable Business Unit of Work",
    lifecycle: "CREATED → SUBMITTED → IN_PROGRESS → PAUSED → COMPLETED / FAILED",
    authorityRule: "Coordinates business processing and holds root correlation ID; carries zero execution authority.",
    enforcement: "DelegationAdmissionService enforces depth limit (max 5) and rate limits (max 50/hr) per work item tree.",
    boundary: "Work items propagate causal correlation across nodes but cannot be used to smuggle execution permissions."
  },
  {
    title: "Workflow Node Execution",
    identity: "node_2_risk_analysis",
    nature: "Durable Execution State Machine",
    lifecycle: "PENDING → READY → EXECUTING → COMPLETED / FAILED / SKIPPED",
    authorityRule: "Tracks runtime leases, worker identity, and execution attempt count. Completely distinct from business operations.",
    enforcement: "Optimistic concurrency version checks prevent race conditions. Expired worker leases are reclaimed by recovery sweeper.",
    boundary: "Frontier discovery does not confer execution ownership; durable lease claim must succeed first."
  }
];

export const ADVERSARIAL_SCENARIOS = [
  {
    id: "attack_unauthorized_capability",
    title: "Attack A: Unauthorized Capability Execution",
    attacker: "Risk Analysis AI Employee (emp-risk-analyst-01)",
    attempt: "Calls 'regulatory.action.execute' directly",
    vector: "Capability privilege escalation beyond assigned role",
    expectedOutcome: "BLOCKED",
    reason: "EAIES Policy Violation: capability 'regulatory.action.execute' not in authorized policy set for emp-risk-analyst-01",
    enforcementLayer: "EAIES Sovereign Proxy (ADR-002)",
    icon: "🛡️"
  },
  {
    id: "attack_insufficient_authority",
    title: "Attack B: Insufficient Authority Scope",
    attacker: "Regulatory Intelligence AI Employee (emp-reg-intel-01)",
    attempt: "Attempts remediation action with scope 'regulatory_read'",
    vector: "Authority scope mismatch ('regulatory_read' vs 'action_execute')",
    expectedOutcome: "BLOCKED",
    reason: "EAIES Scope Mismatch: capability requires 'action_execute', caller possesses only 'regulatory_read'",
    enforcementLayer: "EAIES Sovereign Proxy (ADR-002)",
    icon: "🔒"
  },
  {
    id: "attack_suspended_employee",
    title: "Attack C: Suspended AI Employee Invocation",
    attacker: "Suspended Risk Analyst (emp-risk-analyst-suspended)",
    attempt: "Attempts to claim execution lease for 'risk.domain.assess'",
    vector: "Execution attempt from suspended identity",
    expectedOutcome: "BLOCKED",
    reason: "Lifecycle Violation: AI Employee lifecycle status is SUSPENDED. Synchronous rejection prior to execution.",
    enforcementLayer: "EAIES & AI Employee Service (ADR-011)",
    icon: "⏸️"
  },
  {
    id: "attack_retired_employee",
    title: "Attack D: Retired AI Employee Invocation",
    attacker: "Retired Control Agent (emp-control-evidence-retired)",
    attempt: "Attempts execution after organizational decommissioning",
    vector: "Execution attempt from retired identity record",
    expectedOutcome: "BLOCKED",
    reason: "Lifecycle Violation: AI Employee lifecycle status is RETIRED. Permanent block on all capability requests.",
    enforcementLayer: "EAIES & AI Employee Service (ADR-011)",
    icon: "⏹️"
  },
  {
    id: "attack_p2p_invocation",
    title: "Attack E: Peer-to-Peer AI Employee Invocation",
    attacker: "Risk Analysis Agent (emp-risk-analyst-01)",
    attempt: "Directly invokes Operational Resilience Agent without Orchestrator",
    vector: "Bypassing Orchestrator DAG frontier and EAIES admission boundary",
    expectedOutcome: "BLOCKED",
    reason: "Architectural Invariant Violation: AI Employees cannot invoke peer AI Employees. Zero peer-to-peer communication channels.",
    enforcementLayer: "Architectural Isolation Boundary",
    icon: "🚫"
  },
  {
    id: "attack_unauthorized_human",
    title: "Attack F: Unauthorized Human Approval",
    attacker: "Junior Compliance Analyst (junior.analyst@company.com)",
    attempt: "Attempts to sign off on high-impact remediation action",
    vector: "Role privilege escalation at human governance gate",
    expectedOutcome: "BLOCKED",
    reason: "Governance Authorization Error: User lacks required role 'ResilienceExecutive'. Sign-off rejected.",
    enforcementLayer: "Human Approval Service (ADR-009)",
    icon: "👤"
  },
  {
    id: "attack_action_without_approval",
    title: "Attack G: Action Execution Without Approval",
    attacker: "Action Executor Agent (emp-action-executor-01)",
    attempt: "Attempts execution while HumanApprovalRequest is PENDING",
    vector: "Premature execution prior to human signature commitment",
    expectedOutcome: "BLOCKED",
    reason: "Workflow State Violation: Downstream node cannot advance. Workflow halted in durable PAUSED state.",
    enforcementLayer: "WorkflowEngine Frontier Boundary (ADR-017)",
    icon: "⛔"
  }
];

export const ARCHITECTURAL_INVARIANTS = [
  {
    id: 1,
    title: "Authority never propagates implicitly",
    rule: "Coordination may propagate work items and DAG dependencies, but execution authority must never be inherited from upstream callers."
  },
  {
    id: 2,
    title: "AI Employee identity does not equal authority",
    rule: "An AI Employee identity is an organizational subject, not an authorization ticket. Every capability requires explicit EAIES evaluation."
  },
  {
    id: 3,
    title: "All capability execution crosses EAIES enforcement",
    rule: "No bypass pathways exist. The Orchestrator cannot dispatch capabilities directly without prior EAIES policy validation."
  },
  {
    id: 4,
    title: "AI Employees cannot directly invoke peer AI Employees",
    rule: "Multi-agent systems cannot form autonomous peer clusters. All delegation must be admitted through the Orchestrator with depth and rate caps."
  },
  {
    id: 5,
    title: "Frontier discovery does not grant execution ownership",
    rule: "Multiple workers observing a READY node on the DAG frontier must compete for a durable lease. Only the lease winner may execute."
  },
  {
    id: 6,
    title: "Durable leases determine execution ownership",
    rule: "Lease ownership is recorded in durable state with worker ID and expiration. Optimistic version locking prevents split-brain claims."
  },
  {
    id: 7,
    title: "Expired leases may be reclaimed safely",
    rule: "When worker heartbeats cease and a lease expires, the background recovery sweeper reclaims the node for redispatch without data loss."
  },
  {
    id: 8,
    title: "Completed nodes are not replayed by recovery",
    rule: "Recovery reconstructs the forward frontier from completed nodes. Successfully committed state is immutable and never re-executed."
  },
  {
    id: 9,
    title: "High confidence does not equal authorization",
    rule: "An AI model generating output with 0.99 confidence has zero authority to commit side-effecting enterprise actions without policy clearance."
  },
  {
    id: 10,
    title: "High-risk actions require human approval",
    rule: "Remediation and statutory notifications mandate an explicit HumanApprovalRequest, pausing the workflow in a durable non-busy state."
  },
  {
    id: 11,
    title: "Business operation identity survives execution retries",
    rule: "Retrying an execution lease (attempt 1 → attempt 2) preserves the business_operation_id to prevent duplicate side effects."
  },
  {
    id: 12,
    title: "Correlation identity remains causally consistent",
    rule: "The root correlation_id assigned at event admission is immutably propagated across work items, instances, nodes, and audit logs."
  }
];
