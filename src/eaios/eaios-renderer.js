// ==========================================================================
// EAIOS Architecture Showcase - Interactive SVG & Responsive Mobile DAG Renderer
// Baseline: Stage 26 (Frozen)
// ==========================================================================

export class EaiosRenderer {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.options = options;
  }

  render(nodes = [], nodeStates = {}, selectedNodeId = null) {
    if (!this.container) return;

    // Determine if mobile view (e.g. screen width <= 768px or container is narrow)
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      this._renderMobileStack(nodes, nodeStates, selectedNodeId);
    } else {
      this._renderDesktopSvg(nodes, nodeStates, selectedNodeId);
    }
  }

  _renderDesktopSvg(nodes = [], nodeStates = {}, selectedNodeId = null) {
    const width = 1280;
    const height = 380;

    let svgHtml = `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; display: block;" xmlns="http://www.w3.org/2000/svg">
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
          <linearGradient id="grad-comp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ec4899" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#be185d" stop-opacity="0.25"/>
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
          <filter id="glow-pink" x="-20%" y="-20%" width="140%" height="140%">
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
          <marker id="arrow-comp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#ec4899"/>
          </marker>
        </defs>

        <!-- Subtle coordinate grid -->
        <g opacity="0.05">
          <line x1="0" y1="90" x2="${width}" y2="90" stroke="#ffffff" stroke-dasharray="4,4"/>
          <line x1="0" y1="190" x2="${width}" y2="190" stroke="#ffffff" stroke-dasharray="4,4"/>
          <line x1="0" y1="290" x2="${width}" y2="290" stroke="#ffffff" stroke-dasharray="4,4"/>
        </g>

        <!-- Dynamic Edge Connections -->
        ${this._renderEdges(nodes, nodeStates)}

        <!-- Node Elements Group -->
        <g id="dag-nodes-group">
          ${nodes.map(node => {
            const state = nodeStates[node.id] || { status: 'PENDING', attempt: 0 };
            const isSelected = selectedNodeId === node.id;
            return this._renderNode(node, state, isSelected);
          }).join('')}
        </g>
      </svg>
    `;

    this.container.innerHTML = svgHtml;

    // Attach click listeners to all node groups
    nodes.forEach(node => {
      const el = this.container.querySelector(`#dag-node-${node.id}`);
      if (el) {
        el.style.cursor = 'pointer';
        el.onclick = () => {
          if (typeof this.options.onNodeSelect === 'function') {
            this.options.onNodeSelect(node);
          }
        };
      }
    });
  }

  _renderMobileStack(nodes = [], nodeStates = {}, selectedNodeId = null) {
    const statusColors = {
      PENDING: '#94a3b8',
      READY: '#06b6d4',
      EXECUTING: '#8b5cf6',
      RUNNING: '#8b5cf6',
      PAUSED_PENDING_INPUT: '#f59e0b',
      PAUSED: '#f59e0b',
      COMPLETED: '#10b981',
      FAILED: '#ef4444',
      REJECTED: '#ef4444',
      COMPENSATED: '#ec4899',
      SKIPPED: '#64748b'
    };

    let cardsHtml = `
      <div class="eaios-mobile-dag-stack" style="display: flex; flex-direction: column; gap: 10px; padding: 10px;">
        <div style="font-size: 11px; color: #38bdf8; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
          <span>📱 Mobile Flow View (Sequential Execution Frontier)</span>
          <span style="font-size: 10px; color: #94a3b8;">${nodes.length} Nodes</span>
        </div>
    `;

    nodes.forEach((node, index) => {
      const state = nodeStates[node.id] || { status: 'PENDING', attempt: 0 };
      const curStatus = state.status || 'PENDING';
      const isSelected = selectedNodeId === node.id;
      const color = statusColors[curStatus] || '#94a3b8';

      let categoryPill = "AI EMPLOYEE";
      let pillBg = "rgba(6, 182, 212, 0.15)";
      let pillText = "#38bdf8";

      if (node.category === 'coordination_primitive') {
        categoryPill = "COORDINATION";
        pillBg = "rgba(245, 158, 11, 0.15)";
        pillText = "#fbbf24";
      } else if (node.category === 'governance_boundary' || node.category === 'human_governance') {
        categoryPill = "HUMAN GOVERNANCE";
        pillBg = "rgba(239, 68, 68, 0.2)";
        pillText = "#f87171";
      } else if (node.category === 'action_executor') {
        categoryPill = "ACTION EXECUTOR";
        pillBg = "rgba(16, 185, 129, 0.15)";
        pillText = "#34d399";
      } else if (node.category === 'compensation_primitive') {
        categoryPill = "COMPENSATION";
        pillBg = "rgba(236, 72, 153, 0.2)";
        pillText = "#f472b6";
      }

      const activeBorder = isSelected ? 'border: 2px solid #38bdf8; box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);' : `border: 1px solid ${color}40;`;

      cardsHtml += `
        <div class="eaios-mobile-node-card" id="dag-node-${node.id}" style="background: rgba(15, 23, 42, 0.9); border-radius: 8px; padding: 12px 14px; ${activeBorder} cursor: pointer; transition: all 0.2s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 10px; font-weight: 800; color: #64748b; font-family: monospace;">#${index + 1}</span>
              <span style="font-size: 9px; font-weight: 800; background: ${pillBg}; color: ${pillText}; padding: 2px 6px; border-radius: 3px;">${categoryPill}</span>
            </div>
            <span style="font-size: 9.5px; font-weight: 800; background: ${color}20; color: ${color}; border: 1px solid ${color}60; padding: 2px 8px; border-radius: 4px;">
              ${curStatus.replace('_PENDING_INPUT', '')}
            </span>
          </div>

          <div style="font-size: 13px; font-weight: 700; color: #f8fafc; margin-bottom: 3px;">
            ${node.name}
          </div>

          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
            ${node.employeeId ? node.employeeId : (node.category === 'governance_boundary' || node.category === 'human_governance' ? 'Four-Eyes Principal (ADR-032)' : 'Stateless Coordination')}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b; font-family: monospace; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 6px;">
            <span>Scope: <strong style="color: #38bdf8;">${node.authorityScope || 'internal'}</strong></span>
            ${state.workerBadge ? `<span style="color: #a855f7; font-weight: 700;">${state.workerBadge}</span>` : `<span style="color: #10b981;">EAIES Verified</span>`}
          </div>
        </div>
      `;

      if (index < nodes.length - 1) {
        cardsHtml += `
          <div style="text-align: center; color: rgba(56, 189, 248, 0.4); font-size: 14px; margin: -4px 0;">
            ▼
          </div>
        `;
      }
    });

    cardsHtml += `</div>`;
    this.container.innerHTML = cardsHtml;

    // Attach click listeners to cards
    nodes.forEach(node => {
      const el = this.container.querySelector(`#dag-node-${node.id}`);
      if (el) {
        el.onclick = () => {
          if (typeof this.options.onNodeSelect === 'function') {
            this.options.onNodeSelect(node);
          }
        };
      }
    });
  }

  _renderEdges(nodes, nodeStates) {
    let pathsHtml = '<g id="dag-edges-group">';

    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    for (const dst of nodes) {
      if (!dst.dependencies || dst.dependencies.length === 0) continue;

      for (const srcId of dst.dependencies) {
        const src = nodeMap[srcId];
        if (!src) continue;

        const srcState = nodeStates[src.id] || { status: 'PENDING' };
        const dstState = nodeStates[dst.id] || { status: 'PENDING' };

        let stroke = "rgba(255, 255, 255, 0.15)";
        let marker = "url(#arrow-default)";
        let strokeDash = "none";
        let strokeWidth = 1.6;

        if (dst.isCompensation) {
          if (dstState.status === 'EXECUTING' || dstState.status === 'COMPLETED') {
            stroke = "#ec4899";
            marker = "url(#arrow-comp)";
            strokeWidth = 2.2;
          } else {
            stroke = "rgba(236, 72, 153, 0.4)";
            strokeDash = "4,4";
            marker = "url(#arrow-comp)";
          }
        } else if (srcState.status === 'COMPLETED' && dstState.status === 'COMPLETED') {
          stroke = "#10b981";
          marker = "url(#arrow-success)";
          strokeWidth = 2.0;
        } else if (srcState.status === 'COMPLETED' && (dstState.status === 'READY' || dstState.status === 'EXECUTING' || dstState.status === 'PAUSED')) {
          stroke = "#06b6d4";
          marker = "url(#arrow-active)";
          strokeDash = "4,3";
          strokeWidth = 2.0;
        } else if (dstState.status === 'SKIPPED') {
          stroke = "rgba(148, 163, 184, 0.25)";
          strokeDash = "2,4";
          strokeWidth = 1.0;
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
    } else if (node.category === 'governance_boundary' || node.category === 'human_governance') {
      bgFill = "url(#grad-gov)";
      borderColor = "rgba(239, 68, 68, 0.45)";
    } else if (node.category === 'action_executor') {
      bgFill = "url(#grad-action)";
      borderColor = "rgba(16, 185, 129, 0.4)";
    } else if (node.category === 'compensation_primitive') {
      bgFill = "url(#grad-comp)";
      borderColor = "rgba(236, 72, 153, 0.45)";
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
    } else if (curStatus === 'PAUSED' || curStatus === 'PAUSED_PENDING_INPUT') {
      borderColor = "#f59e0b";
      badgeColor = "#f59e0b";
      glowFilter = 'filter="url(#glow-amber)"';
    } else if (curStatus === 'COMPENSATED') {
      borderColor = "#ec4899";
      badgeColor = "#ec4899";
      glowFilter = 'filter="url(#glow-pink)"';
    } else if (curStatus === 'SKIPPED') {
      borderColor = "rgba(148, 163, 184, 0.25)";
      badgeColor = "#64748b";
      bgFill = "rgba(15, 23, 42, 0.4)";
    }

    if (isSelected) {
      glowFilter = 'filter="url(#glow-select)"';
    }

    const selectedOutline = isSelected ? `stroke="#38bdf8" stroke-width="3.2"` : `stroke="${borderColor}" stroke-width="1.8"`;

    let categoryPill = "AI EMPLOYEE";
    let pillBg = "rgba(6, 182, 212, 0.15)";
    let pillText = "#38bdf8";

    if (node.category === 'coordination_primitive') {
      categoryPill = "COORDINATION";
      pillBg = "rgba(245, 158, 11, 0.15)";
      pillText = "#fbbf24";
    } else if (node.category === 'governance_boundary' || node.category === 'human_governance') {
      categoryPill = "HUMAN GOVERNANCE";
      pillBg = "rgba(239, 68, 68, 0.2)";
      pillText = "#f87171";
    } else if (node.category === 'action_executor') {
      categoryPill = "ACTION EXECUTOR";
      pillBg = "rgba(16, 185, 129, 0.15)";
      pillText = "#34d399";
    } else if (node.category === 'compensation_primitive') {
      categoryPill = "COMPENSATION";
      pillBg = "rgba(236, 72, 153, 0.2)";
      pillText = "#f472b6";
    }

    // Dynamic auxiliary tag for worker badge or compensation state
    let auxTag = '';
    if (state.workerBadge) {
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
        <rect x="${x + w - 62}" y="${y + 8}" width="54" height="15" rx="3" fill="rgba(0,0,0,0.5)" stroke="${badgeColor}" stroke-width="1" />
        <text x="${x + w - 35}" y="${y + 19}" fill="${badgeColor}" font-size="7.5" font-weight="700" text-anchor="middle">${curStatus.replace('_PENDING_INPUT', '')}</text>

        <!-- Node Title -->
        <text x="${x + 10}" y="${y + 44}" fill="#f8fafc" font-size="10.5" font-weight="700">${node.name}</text>

        <!-- Subtitle / Actor Identity -->
        <text x="${x + 10}" y="${y + 59}" fill="#94a3b8" font-size="8.5">
          ${node.employeeId ? node.employeeId : (node.category === 'governance_boundary' || node.category === 'human_governance' ? 'Four-Eyes Principal (ADR-032)' : 'Stateless Barrier')}
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
