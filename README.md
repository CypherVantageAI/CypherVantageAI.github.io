# CypherVantageAI Public Showcase

<p align="center">
  <img src="https://raw.githubusercontent.com/CypherVantageAI/.github/main/profile/CypherVantage-AI.png" alt="CypherVantage Logo" width="120" height="120">
</p>

<p align="center">
  <strong>Live Architectural Demonstrations • Operational Resilience • EAIOS Substrate Verification</strong>
</p>

<p align="center">
  <a href="https://cyphervantageai.github.io/"><img src="https://img.shields.io/badge/Live%20Showcase-Cypher%20Vantage%20Portal-06b6d4?style=flat&logo=google-chrome" alt="Live Showcase Portal"></a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://github.com/CypherVantageAI/enterprise-ai-operating-system"><img src="https://img.shields.io/badge/Architecture-EAIOS%20Foundation-blue?style=flat&logo=github" alt="EAIOS Architecture"></a>
  &nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Foundation-Frozen%20Green-10b981?style=flat" alt="Foundation Frozen Green">
</p>

---

## What We Are Building

**CypherVantageAI** develops architecture-led platforms for governed enterprise agentic systems.

This repository (`CypherVantageAI.github.io`) hosts the public technical demonstration and interactive portal for the initiative. It translates the deterministic governance and orchestration primitives of the **Enterprise AI Operating System (EAIOS)** into interactive visual and architectural demonstrations.

---

## Enterprise AI Operating System

The **Enterprise AI Operating System (EAIOS)** is the canonical engineering substrate implementing non-bypassable execution governance for multi-agent workflows.

Key substrate characteristics:
* **Enterprise AI Execution Sovereignty (EAIES)**: Deterministic policy evaluation acts as the sole execution boundary. No agent, team hierarchy, or model reasoning can invoke tools without explicit EAIES authorization.
* **Deterministic Orchestration**: State machines model workflows as directed acyclic graphs (DAGs) with explicit attempt-scoped idempotency keys and lease-based crash recovery.
* **Workforce Topology Separation**: Organizational hierarchies, team routing, and managerial structures organize collaboration without implicitly escalating or expanding execution authority.

---

## CypherVantage

**CypherVantage** is the operational resilience application layer built upon EAIOS architectural principles. It demonstrates the real-world application of governed agentic workflows to mission-critical regulatory and risk environments:

* **Operational Resilience Digital Twins**: Modeling systemic enterprise dependencies across processes, technology assets, and third-party services.
* **Threat-Led Blast-Radius Simulations**: Evaluating cyber incident propagation and operational disruptions against strict recovery metrics.
* **DORA Regulatory Compliance**: Automated, auditable evidence collection and reporting under the EU Digital Operational Resilience Act.

---

## Architecture Demonstrations

The live showcase hosted from this repository highlights the operational behavior of the governance substrate:

1. **Governed Execution & Gateway**: Visualizing how tool calls and provider requests intercept at the EAIES boundary before reaching backend providers.
2. **Workforce Hierarchy vs. Authority Invariant**: Demonstrating that managerial delegation and routing pass work across agents while authority is evaluated independently at every step.
3. **Deterministic State Transitions & Recovery**: Interactive playback of DAG execution, lease heartbeat expirations, and safe zombie/crash recovery.
4. **Human-in-the-Loop Escalation**: Step-by-step audit trails of high-risk actions requiring dual-key or human approval before execution.

---

## Current Engineering Maturity

The underlying EAIOS substrate engineering status as of the Stage 7.2 Foundation Freeze:

| Component / Layer | Status | Validation Summary |
|---|---|---|
| **EAIOS Foundation Substrate** | **GREEN (Frozen)** | Core orchestration, DAG execution, leases, idempotency, and human approval fully verified (343 tests passing). |
| **Multi-Employee Workforce Topology** | **GREEN (Frozen)** | Verified invariant: workforce hierarchy and delegation do not bypass EAIES authority checks. |
| **External Model Adapter** | **AMBER (Quota Gate)** | Live adapter implemented; full end-to-end integration gated by external provider quota. Deterministic mock provider is 100% green. |
| **Stage 8 Advanced Capabilities** | **NOT STARTED** | Enterprise memory governance, production vector stores, and external integrations planned for future phases. |

---

## Repository Map

| Repository | Description |
|---|---|
| **[CypherVantageAI.github.io](https://github.com/CypherVantageAI/CypherVantageAI.github.io)** | Public showcase web application and architectural demonstration portal. |
| **[CypherVantageAI/.github](https://github.com/CypherVantageAI/.github)** | Organization profile and global repository standards. |
| **[enterprise-ai-operating-system](https://github.com/CypherVantageAI/enterprise-ai-operating-system)** | Canonical engineering source of truth containing ADRs, domain models, EAIES proxy, and test suites. |
| **core-platform** | Enterprise application repository implementing the commercial CypherVantage product suite. |

---

## Public Showcase

The static application deployed here is built using React, Vite, and Tailwind CSS. It is served directly via GitHub Pages:

* **Production URL**: [https://cyphervantageai.github.io/](https://cyphervantageai.github.io/)
* **Showcase Scope**: Architectural visualizations, resilience simulations, and governance telemetry.

---

## Roadmap

* **Stage 7.2 Complete**: Multi-employee workforce topology, lifecycle governance, and baseline freeze complete.
* **Stage 8 (Upcoming)**: Enterprise Memory governance, vector persistence boundaries, and semantic access controls.
* **Operational Showcase Updates**: Incorporating real-time telemetry replay from EAIOS execution runs into the public dashboard.

---

<p align="center">
  🌐 <strong><a href="https://cyphervantageai.github.io/">Live Showcase</a></strong> &nbsp;•&nbsp; 🏛️ <strong><a href="https://github.com/CypherVantageAI">Organization Profile</a></strong> &nbsp;•&nbsp; 💻 <strong><a href="https://github.com/CypherVantageAI/enterprise-ai-operating-system">EAIOS Framework</a></strong>
</p>

<p align="center">
  © 2026 CypherVantageAI. All rights reserved.
</p>
