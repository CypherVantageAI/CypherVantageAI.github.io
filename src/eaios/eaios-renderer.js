// ==========================================================================
// EAIOS Architecture Showcase - Interactive SVG DAG & Component Renderer
// ==========================================================================

import { EAIOS_NODES } from './eaios-data.js';

export class EaiosRenderer {
  constructor(svgContainerId) {
    this.containerId = svgContainerId;
  }

  renderDag(nodeStates, selectedNodeId, onNodeClick) {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const width = 1420;
    const height = 400;

    let svgHtml = `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; min-width: 1100px; display: block;" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-ai" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.25"/>
          </linearGradient>
          <linearGradient id="grad-barrier" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#d97706" stop-opacity="0.2"/>
          </linearGradient>
          <linearGradient id="grad-gov" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ef4444" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#dc2626" stop-opacity="0.25"/>
          </linearGradient>
          <linearGradient id="grad-action" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#059669" stop-opacity="0.25"/>
          </linearGradient>

          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <!-- Marker arrows -->
          <marker id="arrow-default" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="rgba(255, 255, 255, 0.25)"/>
          </marker>
          <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4"/>
          </marker>
          <marker id="arrow-success" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981"/>
          </marker>
        </defs>

        <!-- Background grid lines -->
        <g opacity="0.08">
          <line x1="0" y1="100" x2="${width}" y2="100" stroke="#ffffff" stroke-dasharray="4,4"/>
          <line x1="0" y1="200" x2="${width}" y2="200" stroke="#ffffff" stroke-dasharray="4,4"/>
          <line x1="0" y1="300" x2="${width}" y2="300" stroke="#ffffff" stroke-dasharray="4,4"/>
        </g>
    `;

    // Render Connector Edges
    svgHtml += this._renderEdges(nodeStates);

    // Render Nodes
    svgHtml += `<g id="dag-nodes-group">`;
    for (const node of EAIOS_NODES) {
      const state = nodeStates[node.id] || { status: 'PENDING', attempt: 0 };
      const isSelected = selectedNodeId === node.id;
      svgHtml += this._renderNode(node, state, isSelected);
    }
    svgHtml += `</g></svg>`;

    container.innerHTML = svgHtml;

    // Attach click listeners to nodes
    EAIOS_NODES.forEach(node => {
      const el = document.getElementById(`dag-node-${node.id}`);
      if (el) {
        el.style.cursor = 'pointer';
        el.onclick = () => onNodeClick(node.id);
      }
    });
  }

  _renderEdges(nodeStates) {
    let edgesHtml = `<g id="dag-edges-group">`;

    // Edges definition
    const edges = [
      { from: "node_1_regulatory_intelligence", to: "node_2_risk_analysis" },
      { from: "node_1_regulatory_intelligence", to: "node_3_control_evidence" },
      { from: "node_2_risk_analysis", to: "node_4_fan_in" },
      { from: "node_3_control_evidence", to: "node_4_fan_in" },
      { from: "node_4_fan_in", to: "node_5_operational_resilience" },
      { from: "node_5_operational_resilience", to: "node_6_governance_check" },
      { from: "node_6_governance_check", to: "node_7_approved_action" }
    ];

    const nodeMap = {};
    EAIOS_NODES.forEach(n => { nodeMap[n.id] = n; });

    for (const edge of edges) {
      const src = nodeMap[edge.from];
      const dst = nodeMap[edge.to];
      const srcState = nodeStates[edge.from] || {};
      const dstState = nodeStates[edge.to] || {};

      let stroke = "rgba(255, 255, 255, 0.15)";
      let strokeWidth = 1.8;
      let marker = "url(#arrow-default)";
      let strokeDash = "none";

      if (srcState.status === 'COMPLETED' && dstState.status === 'COMPLETED') {
        stroke = "#10b981";
        marker = "url(#arrow-success)";
        strokeWidth = 2.2;
      } else if (srcState.status === 'COMPLETED' && (dstState.status === 'READY' || dstState.status === 'EXECUTING')) {
        stroke = "#06b6d4";
        marker = "url(#arrow-active)";
        strokeWidth = 2.5;
        strokeDash = "6,4";
      }

      // Compute bezier curve
      const x1 = src.x + 95;
      const y1 = src.y;
      const x2 = dst.x - 95;
      const y2 = dst.y;
      const mx = (x1 + x2) / 2;

      const d = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
      edgesHtml += `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" marker-end="${marker}" />`;
    }

    edgesHtml += `</g>`;
    return edgesHtml;
  }

  _renderNode(node, state, isSelected) {
    const w = 180;
    const h = 90;
    const x = node.x - w / 2;
    const y = node.y - h / 2;

    let badgeColor = "#64748b";
    let borderColor = "rgba(255, 255, 255, 0.12)";
    let bgFill = "var(--bg-card)";
    let glowFilter = "";

    if (node.category === 'ai_employee') {
      bgFill = "url(#grad-ai)";
      borderColor = "rgba(6, 182, 212, 0.35)";
    } else if (node.category === 'coordination_primitive') {
      bgFill = "url(#grad-barrier)";
      borderColor = "rgba(245, 158, 11, 0.4)";
    } else if (node.category === 'governance_boundary') {
      bgFill = "url(#grad-gov)";
      borderColor = "rgba(239, 68, 68, 0.45)";
    } else if (node.category === 'action_executor') {
      bgFill = "url(#grad-action)";
      borderColor = "rgba(16, 185, 129, 0.4)";
    }

    // Status colors
    if (state.status === 'READY') {
      borderColor = "#06b6d4";
      badgeColor = "#06b6d4";
      glowFilter = "filter=\"url(#glow-cyan)\"";
    } else if (state.status === 'EXECUTING') {
      borderColor = "#8b5cf6";
      badgeColor = "#8b5cf6";
      glowFilter = "filter=\"url(#glow-cyan)\"";
    } else if (state.status === 'COMPLETED') {
      borderColor = "#10b981";
      badgeColor = "#10b981";
    } else if (state.status === 'FAILED') {
      borderColor = "#ef4444";
      badgeColor = "#ef4444";
    } else if (state.status === 'PAUSED') {
      borderColor = "#f59e0b";
      badgeColor = "#f59e0b";
      glowFilter = "filter=\"url(#glow-amber)\"";
    }

    const selectedOutline = isSelected ? `stroke="#38bdf8" stroke-width="3"` : `stroke="${borderColor}" stroke-width="1.8"`;

    let categoryPill = "AI EMPLOYEE";
    let pillBg = "rgba(6, 182, 212, 0.15)";
    let pillText = "#38bdf8";

    if (node.category === 'coordination_primitive') {
      categoryPill = "COORDINATION BARRIER";
      pillBg = "rgba(245, 158, 11, 0.15)";
      pillText = "#fbbf24";
    } else if (node.category === 'governance_boundary') {
      categoryPill = "GOVERNANCE GATE";
      pillBg = "rgba(239, 68, 68, 0.2)";
      pillText = "#f87171";
    } else if (node.category === 'action_executor') {
      categoryPill = "ACTION EXECUTOR";
      pillBg = "rgba(16, 185, 129, 0.15)";
      pillText = "#34d399";
    }

    return `
      <g id="dag-node-${node.id}" class="dag-node-element" ${glowFilter}>
        <!-- Card Background -->
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" ry="10" fill="#0d111d" />
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" ry="10" fill="${bgFill}" />
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" ry="10" fill="none" ${selectedOutline} />

        <!-- Category Pill -->
        <rect x="${x + 8}" y="${y + 8}" width="105" height="15" rx="3" fill="${pillBg}" />
        <text x="${x + 12}" y="${y + 19}" fill="${pillText}" font-size="8" font-weight="700" letter-spacing="0.5">${categoryPill}</text>

        <!-- Status Badge -->
        <rect x="${x + w - 55}" y="${y + 8}" width="48" height="15" rx="3" fill="rgba(0,0,0,0.4)" stroke="${badgeColor}" stroke-width="1" />
        <text x="${x + w - 31}" y="${y + 19}" fill="${badgeColor}" font-size="8.5" font-weight="700" text-anchor="middle">${state.status}</text>

        <!-- Node Title -->
        <text x="${x + 10}" y="${y + 44}" fill="#f8fafc" font-size="11" font-weight="700">${node.name}</text>

        <!-- Subtitle / Actor -->
        <text x="${x + 10}" y="${y + 60}" fill="#94a3b8" font-size="9.5">
          ${node.employeeId ? node.employeeId : (node.category === 'governance_boundary' ? 'Human Principal' : 'Workflow Barrier')}
        </text>

        <!-- Capability / Scope footprint -->
        <text x="${x + 10}" y="${y + 76}" fill="#64748b" font-size="8.5" font-family="monospace">
          ${node.authorityScope}
        </text>
      </g>
    `;
  }
}
