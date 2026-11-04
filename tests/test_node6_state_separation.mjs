/**
 * Sprint 7.4J-U: Durable Node 6 Regression Coverage & State-Machine Invariant Suite
 *
 * Exercises the actual EaiosSimulationManager production methods in
 * CypherVantageAI.github.io/src/eaios/eaios-simulation.js:
 *   - _applyBackendExecutionState(data, currentGeneration, currentScenarioId)
 *   - submitHumanDecision(decision, approverEmail, rationaleText)
 *   - _submitLiveHumanDecision(decision, approverEmail, rationaleText, auth, gateNodeId, node6Id)
 *
 * Verifies:
 *   1. Approval succeeds with no execution evidence -> Node 6 remains "PENDING" ("Authorized — Awaiting Execution").
 *   2. execution_authorized === true without execution confirmation -> Node 6 remains "PENDING" ("Authorized — Awaiting Execution").
 *   3. Action metadata exists (actions: [...]) without execution confirmation -> Node 6 remains "PENDING" ("Awaiting Action Execution").
 *   4. action_executed is absent or false -> Node 6 does NOT become "COMPLETED".
 *   5. Explicit action_executed === true -> Node 6 becomes "COMPLETED" ("Action Executed [LIVE]").
 *   6. Rejection -> Node 6 becomes "SKIPPED", workflow status becomes "FAILED", outcome becomes "FAILED_REJECTED".
 *   7. Stale polling response cannot overwrite the state of a newer run generation or scenario switch.
 */

import assert from 'node:assert/strict';
import { EaiosSimulationManager } from '../src/eaios/eaios-simulation.js';

const NODE_5_ID = 'node_5_hitl_executive_decision';
const NODE_6_ID = 'node_6_governed_failover_execution';

function setupLiveExecutionManager(mockFetchImpl) {
  // Set up minimal browser globals for authentication and alert capture
  globalThis.window = {
    __TPRM_BEARER_TOKEN__: 'test-token:bob@enterprise.example:ROLE_TPRM_LEAD',
    __TPRM_USER_ROLE__: 'ROLE_TPRM_LEAD'
  };
  globalThis.alert = () => {};
  globalThis.fetch = mockFetchImpl;

  const mgr = new EaiosSimulationManager(null, null, null);
  mgr.isRunning = true;
  mgr.isLiveExecution = true;
  mgr.activeExecutionId = 'exec-test-74ju-001';
  mgr.nodeStates[NODE_5_ID].status = 'PAUSED_PENDING_INPUT';
  mgr.humanApproval.status = 'PAUSED_PENDING_INPUT';
  return mgr;
}

async function runTests() {
  let passed = 0;
  const total = 7;

  console.log('=== Running Durable Node 6 State-Machine Regression Suite ===\n');

  // -------------------------------------------------------------------------
  // Test 1: Approval succeeds, with no execution evidence -> Node 6 remains PENDING
  // -------------------------------------------------------------------------
  {
    const mgr = setupLiveExecutionManager(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'exec-test-74ju-001',
        status: 'APPROVED',
        approved_by: 'bob@enterprise.example'
        // Note: No action_executed field returned by backend decision endpoint
      })
    }));

    await mgr.submitHumanDecision('APPROVE', 'bob@enterprise.example', 'Verified resilience failover conditions.');

    assert.equal(mgr.nodeStates[NODE_5_ID].status, 'COMPLETED', 'Node 5 gate should complete on approval');
    assert.equal(mgr.nodeStates[NODE_6_ID].status, 'PENDING', 'Node 6 must remain PENDING when no execution evidence exists');
    assert.equal(mgr.nodeStates[NODE_6_ID].workerBadge, 'Authorized — Awaiting Execution');
    assert.notEqual(mgr.nodeStates[NODE_6_ID].workerBadge, 'Action Executed [LIVE]');
    console.log('  [PASS 1/7] Approval succeeds with no execution evidence -> Node 6 remains PENDING ("Authorized — Awaiting Execution")');
    passed++;
  }

  // -------------------------------------------------------------------------
  // Test 2: execution_authorized === true without execution confirmation -> Node 6 remains PENDING
  // -------------------------------------------------------------------------
  {
    const mgr = setupLiveExecutionManager(async () => ({}));
    const gen = mgr.runGeneration;
    const scen = mgr.activeScenario;

    mgr._applyBackendExecutionState(
      {
        status: 'COMPLETED',
        execution_authorized: true,
        action_executed: false
      },
      gen,
      scen
    );

    assert.equal(mgr.nodeStates[NODE_6_ID].status, 'PENDING', 'execution_authorized === true alone must never mark Node 6 COMPLETED');
    assert.equal(mgr.nodeStates[NODE_6_ID].workerBadge, 'Authorized — Awaiting Execution');
    console.log('  [PASS 2/7] execution_authorized === true without execution confirmation -> Node 6 remains PENDING');
    passed++;
  }

  // -------------------------------------------------------------------------
  // Test 3: Action metadata exists (actions: [...]) without execution confirmation -> Node 6 remains PENDING
  // -------------------------------------------------------------------------
  {
    const mgr = setupLiveExecutionManager(async () => ({}));
    const gen = mgr.runGeneration;
    const scen = mgr.activeScenario;

    mgr._applyBackendExecutionState(
      {
        status: 'COMPLETED',
        actions: [{ action_id: 'ACT-DR-001', target: 'route53-failover' }]
        // action_executed is absent
      },
      gen,
      scen
    );

    assert.equal(mgr.nodeStates[NODE_6_ID].status, 'PENDING', 'Action metadata presence must not mark Node 6 COMPLETED');
    assert.equal(mgr.nodeStates[NODE_6_ID].workerBadge, 'Awaiting Action Execution');
    console.log('  [PASS 3/7] Action metadata exists without execution confirmation -> Node 6 remains PENDING ("Awaiting Action Execution")');
    passed++;
  }

  // -------------------------------------------------------------------------
  // Test 4: action_executed is absent or false across both polling and decision -> Node 6 does not become COMPLETED
  // -------------------------------------------------------------------------
  {
    const mgr = setupLiveExecutionManager(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'exec-test-74ju-001',
        status: 'COMPLETED',
        execution_authorized: true,
        action_executed: false,
        actions: [{ id: 'ACT-DR-001' }]
      })
    }));

    await mgr.submitHumanDecision('APPROVE', 'bob@enterprise.example', 'Approved with explicit false action_executed');
    assert.equal(mgr.nodeStates[NODE_6_ID].status, 'PENDING');
    assert.notEqual(mgr.nodeStates[NODE_6_ID].status, 'COMPLETED');
    console.log('  [PASS 4/7] action_executed is absent or false -> Node 6 never transitions to COMPLETED');
    passed++;
  }

  // -------------------------------------------------------------------------
  // Test 5: Explicit action_executed === true -> Node 6 becomes COMPLETED via intended mapping path
  //   (Test fixture limitation: simulates future backend contract returning action_executed: true)
  // -------------------------------------------------------------------------
  {
    const mgr = setupLiveExecutionManager(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'exec-test-74ju-001',
        status: 'COMPLETED',
        approved_by: 'bob@enterprise.example',
        execution_authorized: true,
        action_executed: true
      })
    }));

    await mgr.submitHumanDecision('APPROVE', 'bob@enterprise.example', 'Approved with authoritative execution receipt fixture');
    assert.equal(mgr.nodeStates[NODE_6_ID].status, 'COMPLETED', 'Explicit action_executed === true should transition Node 6 to COMPLETED');
    assert.equal(mgr.nodeStates[NODE_6_ID].workerBadge, 'Action Executed [LIVE]');
    console.log('  [PASS 5/7] Explicit action_executed === true (synthetic contract fixture) -> Node 6 becomes COMPLETED ("Action Executed [LIVE]")');
    passed++;
  }

  // -------------------------------------------------------------------------
  // Test 6: Rejection -> Node 6 becomes SKIPPED with documented workflow failure behaviour
  // -------------------------------------------------------------------------
  {
    const mgr = setupLiveExecutionManager(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'exec-test-74ju-001',
        status: 'REJECTED',
        approved_by: 'bob@enterprise.example'
      })
    }));

    await mgr.submitHumanDecision('REJECT', 'bob@enterprise.example', 'Rejected due to incomplete blast-radius telemetry.');
    assert.equal(mgr.nodeStates[NODE_5_ID].status, 'REJECTED');
    assert.equal(mgr.nodeStates[NODE_6_ID].status, 'SKIPPED', 'Node 6 must be SKIPPED on rejection');
    assert.equal(mgr.workflowInstance.status, 'FAILED', 'Workflow status must be FAILED on rejection');
    assert.equal(mgr.executiveDecisionRecord.outcome.workflowState, 'FAILED_REJECTED');
    console.log('  [PASS 6/7] Rejection -> Node 6 becomes SKIPPED, workflow status FAILED, outcome FAILED_REJECTED');
    passed++;
  }

  // -------------------------------------------------------------------------
  // Test 7: Stale polling response cannot overwrite state of a newer run or scenario
  // -------------------------------------------------------------------------
  {
    const mgr = setupLiveExecutionManager(async () => ({}));
    const staleGeneration = mgr.runGeneration;
    const staleScenario = mgr.activeScenario;

    // User switches scenario or resets, advancing runGeneration
    mgr.setScenario('oro_cyber_ransomware');
    const newGeneration = mgr.runGeneration;
    assert.notEqual(staleGeneration, newGeneration, 'Generation must increment on scenario switch');

    // Stale polling response arrives carrying action_executed: true from old run
    mgr._applyBackendExecutionState(
      {
        status: 'COMPLETED',
        action_executed: true,
        execution_authorized: true
      },
      staleGeneration,
      staleScenario
    );

    const currentNode6Id = mgr.getCurrentNodes()[5].id;
    assert.equal(mgr.nodeStates[currentNode6Id].status, 'PENDING', 'Stale polling response must not mutate newer run state');
    assert.equal(mgr.workflowInstance.status, 'CREATED', 'Workflow status must remain CREATED after stale poll is dropped');
    assert.equal(mgr.executiveDecisionRecord.outcome.workflowState, 'INITIALIZED', 'Outcome workflowState must remain INITIALIZED');
    console.log('  [PASS 7/7] Stale polling response is isolated by generation/scenario fencing and cannot overwrite newer run');
    passed++;
  }

  console.log(`\n=============================================================`);
  console.log(`NODE 6 REGRESSION SUITE: ${passed}/${total} PERMANENT TESTS PASSED`);
  console.log(`=============================================================`);
}

runTests().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
