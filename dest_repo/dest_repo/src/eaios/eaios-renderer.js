// ==========================================================================
// EAIOS Architecture Showcase - Interactive SVG DAG & Component Renderer
// ==========================================================================

import { EAIOS_NODES } from './eaios-data.js';

export class EaiosRenderer {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.options = options;
  }

  render(nodeStates = {}, selectedNodeId = null) {
    if (!this.container) return;

    const width = 1420;
    const height = 400;

    let svgHtml = `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; min-width: 980px; display: block;" xmlns="http://www.w3.org/2000/svg">
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
          <filter id="glow-violet" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-select" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
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
          <marker id="arrow-failed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444"/>
          </marker>
        </defs>

        <!-- Subtle coordinate grid -->
        <g opacity="0.06">
          <line x1="0" y1="90" x2="${width}" y2="90" stroke="#ffffff" stroke-dasharray="4,4"/>
          <line x1="0" y1="190" x2="${width}" y2="190" stroke="#ffffff" stroke-dasharray="4,4"/>
          <line x1="0" y1="290" x2="${width}" y2="290" stroke="#ffffff" stroke-dasharray="4,4"/>
        </g>

        <!-- Dynamic Edge Connections -->
        ${this._renderEdges(nodeStates)}

        <!-- Node Elements Group -->
        <g id="dag-nodes-group">
          ${EAIOS_NODES.map(node => {
            const state = nodeStates[node.id] || { status: node.status || 'PENDING', attempt: 0 };
            const isSelected = selectedNodeId === node.id;
            return this._renderNode(node, state, isSelected);
          }).join('')}
        </g>
      </svg>
    `;

    this.container.innerHTML = svgHtml;

    // Attach click listeners to all node groups
    EAIOS_NODES.forEach(node => {
      const el = this.container.querySelector(`#dag-node-${node.id}`);
      if (el) {
        el.style.cursor = 'pointer';
        el.onclick = () => {
          if (typeof this.options.onNodeSelect === 'function') {
            const state = nodeStates[node.id] || { status: 'PENDING', attempt: 0 };
            this.options.onNodeSelect({ ...node, ...state });
          }
        };
      }
    });
  }

  _renderEdges(nodeStates) {
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

    let pathsHtml = '<g id="dag-edges-group">';

    for (const edge of edges) {
      const src = nodeMap[edge.from];
      const dst = nodeMap[edge.to];
      const srcState = nodeStates[edge.from] || {};
      const dstState = nodeStates[edge.to] || {};

      let stroke = "rgba(255, 255, 255, 0.18)";
      let strokeWidth = 1.8;
      let marker = "url(#arrow-default)";
      let strokeDash = "none";

      if (srcState.status === 'COMPLETED' && dstState.status === 'COMPLETED') {
        stroke = "#10b981";
        marker = "url(#arrow-success)";
        strokeWidth = 2.2;
      } else if (srcState.status === 'COMPLETED' && (dstState.status === 'READY' || dstState.status === 'EXECUTING' || dstState.status === 'RUNNING')) {
        stroke = "#06b6d4";
        marker = "url(#arrow-active)";
        strokeWidth = 2.5;
        strokeDash = "6,4";
      } else if (srcState.status === 'COMPLETED' && dstState.status === 'PAUSED') {
        stroke = "#f59e0b";
        marker = "url(#arrow-active)";
        strokeWidth = 2.5;
        strokeDash = "5,5";
      } else if (dstState.status === 'FAILED' || dstState.status === 'REJECTED') {
        stroke = "#ef4444";
        marker = "url(#arrow-failed)";
        strokeWidth = 2.0;
      }

      // Bezier curve layout
      const x1 = src.x + 95;
      const y1 = src.y;
      const x2 = dst.x - 95;
      const y2 = dst.y;
      const mx = (x1 + x2) / 2;

      const d = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
      pathsHtml += `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" marker-end="${marker}" />`;
    }

    pathsHtml += '</g>';
    return pathsHtml;
  }

  _renderNode(node, state, isSelected) {
    const w = 185;
    const h = 92;
    const x = node.x - w / 2;
    const y = node.y - h / 2;

    let badgeColor = "#64748b";
    let borderColor = "rgba(255, 255, 255, 0.12)";
    let bgFill = "var(--bg-card, rgba(22, 26, 43, 0.8))";
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

    const curStatus = state.status || 'PENDING';

    if (curStatus === 'READY') {
      borderColor = "#06b6d4";
      badgeColor = "#06b6d4";
      glowFilter = 'filter="url(#glow-cyan)"';
    } else if (curStatus === 'EXECUTING' || curStatus === 'RUNNING') {
      borderColor = "#8b5cf6";
      badgeColor = "#8b5cf6";
      glowFilter = 'filter="url(#glow-violet)"';
    } else if (curStatus === 'COMPLETED') {
      borderColor = "#10b981";
      badgeColor = "#10b981";
    } else if (curStatus === 'FAILED' || curStatus === 'REJECTED') {
      borderColor = "#ef4444";
      badgeColor = "#ef4444";
    } else if (curStatus === 'PAUSED') {
      borderColor = "#f59e0b";
      badgeColor = "#f59e0b";
      glowFilter = 'filter="url(#glow-amber)"';
    } else if (curStatus === 'CRASHED') {
      borderColor = "#ec4899";
      badgeColor = "#ec4899";
      glowFilter = 'filter="url(#glow-amber)"';
    }

    if (isSelected) {
      glowFilter = 'filter="url(#glow-select)"';
    }

    const selectedOutline = isSelected ? `stroke="#38bdf8" stroke-width="3.2"` : `stroke="${borderColor}" stroke-width="1.8"`;

    let categoryPill = "AI EMPLOYEE";
    let pillBg = "rgba(6, 182, 212, 0.15)";
    let pillText = "#38bdf8";

    if (node.category === 'coordination_primitive') {
      categoryPill = "FAN-IN BARRIER";
      pillBg = "rgba(245, 158, 11, 0.15)";
      pillText = "#fbbf24";
    } else if (node.category === 'governance_boundary') {
      categoryPill = "HUMAN GOVERNANCE";
      pillBg = "rgba(239, 68, 68, 0.2)";
      pillText = "#f87171";
    } else if (node.category === 'action_executor') {
      categoryPill = "ACTION EXECUTOR";
      pillBg = "rgba(16, 185, 129, 0.15)";
      pillText = "#34d399";
    }

    // Dynamic auxiliary tag for fan-in barrier waiting or worker state
    let auxTag = '';
    if (node.id === 'node_4_fan_in' && state.waitingForText) {
      auxTag = `
        <rect x="${x + 6}" y="${y + h - 18}" width="${w - 12}" height="14" rx="3" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" stroke-width="0.8" />
        <text x="${x + w / 2}" y="${y + h - 8}" fill="#fbbf24" font-size="7.5" font-weight="700" text-anchor="middle">${state.waitingForText}</text>
      `;
    } else if (state.workerBadge) {
      const isStale = state.workerBadge.includes('STALE');
      const bColor = isStale ? '#ef4444' : '#a855f7';
      auxTag = `
        <rect x="${x + 6}" y="${y + h - 18}" width="${w - 12}" height="14" rx="3" fill="${bColor}20" stroke="${bColor}" stroke-width="0.8" />
        <text x="${x + w / 2}" y="${y + h - 8}" fill="${bColor}" font-size="7.5" font-weight="700" text-anchor="middle">${state.workerBadge}</text>
      `;
    }

    return `
      <g id="dag-node-${node.id}" class="eaios-dag-node" ${glowFilter}>
        <!-- Card Background -->
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" ry="10" fill="#0d111d" />
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" ry="10" fill="${bgFill}" />
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" ry="10" fill="none" ${selectedOutline} />

        <!-- Category Pill -->
        <rect x="${x + 8}" y="${y + 8}" width="102" height="15" rx="3" fill="${pillBg}" />
        <text x="${x + 12}" y="${y + 19}" fill="${pillText}" font-size="7.5" font-weight="700" letter-spacing="0.5">${categoryPill}</text>

        <!-- Status Badge -->
        <rect x="${x + w - 58}" y="${y + 8}" width="50" height="15" rx="3" fill="rgba(0,0,0,0.5)" stroke="${badgeColor}" stroke-width="1" />
        <text x="${x + w - 33}" y="${y + 19}" fill="${badgeColor}" font-size="8" font-weight="700" text-anchor="middle">${curStatus}</text>

        <!-- Node Title -->
        <text x="${x + 10}" y="${y + 44}" fill="#f8fafc" font-size="11" font-weight="700">${node.name}</text>

        <!-- Subtitle / Actor Identity -->
        <text x="${x + 10}" y="${y + 59}" fill="#94a3b8" font-size="9">
          ${node.employeeId ? node.employeeId : (node.category === 'governance_boundary' ? 'Human Principal (ADR-009)' : 'Deterministic Join')}
        </text>

        <!-- Capability / Scope footprint (or auxTag if present) -->
        ${auxTag ? auxTag : `
          <text x="${x + 10}" y="${y + 74}" fill="#64748b" font-size="8" font-family="monospace">
            ${node.authorityScope}
          </text>
        `}
      </g>
    `;
  }
}
