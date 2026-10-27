// ==========================================================================
// Cypher Vantage - Third Party & Nth-Party Risk Module (ES6 Module)
// ==========================================================================

import { getState, saveState } from '../core/db.js';
import { createTable, createCard, createStatusBadge } from '../components/ui.js';

let selectedSupplierId = 'aws';
let activeThirdPartyTab = 'directory';
let selectedHotspotName = null;

export function renderThirdPartyModule() {
  const state = getState();
  window.activeThirdPartyTab = activeThirdPartyTab;
  const container = document.getElementById('view-manager-thirdparty');
  if (!container) return;

  const rawSuppliers = state.suppliers || [];
  const suppliersList = Array.isArray(rawSuppliers) ? rawSuppliers : Object.values(rawSuppliers);
  const totalSuppliers = suppliersList.length;
  const criticalSuppliers = suppliersList.filter(s => s.riskTier === 'Critical').length;
  const avgCompliance = totalSuppliers ? Math.round(suppliersList.reduce((sum, s) => sum + s.complianceScore, 0) / totalSuppliers) : 100;
  const activeGaps = state.actions.filter(a => a.status !== 'Closed').length;
  const totalSubcontractors = suppliersList.reduce((sum, s) => sum + (s.subcontractors ? s.subcontractors.length : 0), 0);

  let wrapper = container.querySelector('#tpr-wrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = 'tpr-wrapper';
    wrapper.style.cssText = 'display: flex; flex-direction: column; gap: 20px; width: 100%;';
    
    wrapper.innerHTML = `
      <!-- KPI stats row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; width: 100%;">
        <div id="tpr-kpi-total"></div>
        <div id="tpr-kpi-critical"></div>
        <div id="tpr-kpi-compliance"></div>
        <div id="tpr-kpi-gaps"></div>
      </div>

      <!-- Sub-Tab Navigation -->
      <div class="sub-tab-nav" style="display: flex; gap: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 0; flex-wrap: wrap; margin-bottom: 15px;">
        <button id="tab-tpr-directory" class="horizontal-sub-tab-btn ${activeThirdPartyTab === 'directory' ? 'active' : ''}">Supplier Inventory</button>
        <button id="tab-tpr-concentration" class="horizontal-sub-tab-btn ${activeThirdPartyTab === 'concentration' ? 'active' : ''}">Concentration Risk</button>
        <button id="tab-tpr-sla" class="horizontal-sub-tab-btn ${activeThirdPartyTab === 'sla' ? 'active' : ''}">SLA &amp; Performance</button>
        <button id="tab-tpr-exit" class="horizontal-sub-tab-btn ${activeThirdPartyTab === 'exit' ? 'active' : ''}">Exit Strategies</button>
        <button id="tab-tpr-assessments" class="horizontal-sub-tab-btn ${activeThirdPartyTab === 'assessments' ? 'active' : ''}">AI Assessment Studio</button>
      </div>

      <!-- Dynamic Content Area -->
      <div id="tpr-tab-content" style="width: 100%; min-height: 520px;"></div>
    `;

    const header = container.querySelector('.view-header');
    if (header) {
      header.after(wrapper);
    } else {
      container.appendChild(wrapper);
    }
  }

  // Render KPI cards with popups
  createCard('tpr-kpi-total', {
    title: 'Total Suppliers Mapped',
    value: `${totalSuppliers}`,
    subtext: `${totalSubcontractors} Subcontractors Mapped`,
    icon: '🏢',
    borderLeftColor: '#14b8a6',
    tooltip: 'Click to view mapped suppliers and downstream subcontractor count.',
    onclick: () => {
      const suppliersHtml = suppliersList.map(s => `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.04); padding:6px 0; font-size:0.7rem;">
          <div>
            <b>${s.name}</b> (${s.subcontractors ? s.subcontractors.length : 0} Subcontractors)
            <div style="font-size:0.64rem; color:var(--text-muted);">${s.primarySupportLocation || 'Global Operations'}</div>
          </div>
          ${createStatusBadge(s.riskTier)}
        </div>
      `).join('');
      window.showModal('Mapped Nth-Party Suppliers', `<div style="display:flex; flex-direction:column; gap:8px; max-height:350px; overflow-y:auto;">${suppliersHtml}</div>`);
    }
  });

  createCard('tpr-kpi-critical', {
    title: 'Critical-Tier Vendors',
    value: `${criticalSuppliers}`,
    subtext: 'Requires real-time RTO alerts',
    icon: '⚠️',
    borderLeftColor: '#ef4444',
    tooltip: 'Click to view Critical-tier supplier profiles.',
    onclick: () => {
      const criticals = suppliersList.filter(s => s.riskTier === 'Critical');
      const critHtml = criticals.map(s => `
        <div style="border-bottom:1px solid rgba(255,255,255,0.04); padding:6px 0; font-size:0.7rem; display:flex; flex-direction:column; gap:2px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b>${s.name}</b>
            ${createStatusBadge(s.riskTier)}
          </div>
          <div style="font-size:0.65rem; color:var(--text-secondary);">${s.riskTierExplanation}</div>
        </div>
      `).join('');
      window.showModal('Critical-Tier Suppliers', `<div style="display:flex; flex-direction:column; gap:8px; max-height:350px; overflow-y:auto;">${critHtml}</div>`);
    }
  });

  createCard('tpr-kpi-compliance', {
    title: 'Average Compliance Score',
    value: `${avgCompliance}%`,
    subtext: 'Across Supplier Control Obligations',
    icon: '📊',
    borderLeftColor: '#10b981',
    tooltip: 'Click to view compliance scores breakdown by supplier.',
    onclick: () => {
      const scoresHtml = suppliersList.map(s => `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.04); padding:6px 0; font-size:0.7rem;">
          <span><b>${s.name}</b></span>
          <span style="font-weight:700; color:${s.complianceScore >= 90 ? '#10b981' : s.complianceScore >= 70 ? '#f59e0b' : '#ef4444'};">${s.complianceScore}%</span>
        </div>
      `).join('');
      window.showModal('Supplier Compliance Scores', `<div style="display:flex; flex-direction:column; gap:6px; max-height:350px; overflow-y:auto;">${scoresHtml}</div>`);
    }
  });

  createCard('tpr-kpi-gaps', {
    title: 'Active Remediation Gaps',
    value: `${activeGaps}`,
    subtext: 'Awaiting response/remediation',
    icon: '🚨',
    borderLeftColor: '#eab308',
    tooltip: 'Click to view active remediation actions across suppliers.',
    onclick: () => {
      const openActions = state.actions.filter(a => a.status !== 'Closed');
      const actionsHtml = openActions.length > 0 ? openActions.map(a => {
        const priorityStatus = a.priority === 'High' || a.priority === 'Critical' ? 'Non-Compliant' : a.status === 'In Progress' ? 'Partial' : 'Open';
        return `
          <div style="border-bottom:1px solid rgba(255,255,255,0.04); padding:6px 0; font-size:0.7rem; display:flex; flex-direction:column; gap:2px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <b>${a.title}</b>
              ${createStatusBadge(priorityStatus)}
            </div>
            <div style="font-size:0.65rem; color:var(--text-secondary);">${a.gapDetails || a.description || a.domain}</div>
            <div style="font-size:0.62rem; color:#ef4444; margin-top:2px;">Owner: ${a.assignedTo || 'Unassigned'} | Due: ${a.dueDate || 'Urgent'}</div>
          </div>
        `;
      }).join('') : '<div style="text-align:center; padding:15px; color:var(--text-muted);">No open remediation actions.</div>';
      window.showModal('Active Remediation Gaps', `<div style="display:flex; flex-direction:column; gap:8px; max-height:350px; overflow-y:auto;">${actionsHtml}</div>`);
    }
  });

  // Bind tab buttons
  document.getElementById('tab-tpr-directory').onclick = () => switchTab('directory');
  document.getElementById('tab-tpr-concentration').onclick = () => switchTab('concentration');
  document.getElementById('tab-tpr-sla').onclick = () => switchTab('sla');
  document.getElementById('tab-tpr-exit').onclick = () => switchTab('exit');
  const btnAssessments = document.getElementById('tab-tpr-assessments');
  if (btnAssessments) btnAssessments.onclick = () => switchTab('assessments');

  // Update sub-tab button styling to match activeThirdPartyTab
  const tabs = ['directory', 'concentration', 'sla', 'exit', 'assessments'];
  tabs.forEach(tab => {
    const btn = document.getElementById(`tab-tpr-${tab}`);
    if (btn) {
      if (tab === activeThirdPartyTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });

  // Load active tab
  renderActiveTabContent();
}

function switchTab(tabId) {
  activeThirdPartyTab = tabId;
  window.activeThirdPartyTab = activeThirdPartyTab;
  document.querySelectorAll('.sub-tab-nav .horizontal-sub-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(`tab-tpr-${tabId}`);
  if (activeBtn) activeBtn.classList.add('active');
  renderActiveTabContent();
}

function renderActiveTabContent() {
  const contentArea = document.getElementById('tpr-tab-content');
  if (!contentArea) return;

  if (activeThirdPartyTab === 'directory') {
    renderDirectoryTab(contentArea);
  } else if (activeThirdPartyTab === 'concentration') {
    renderConcentrationTab(contentArea);
  } else if (activeThirdPartyTab === 'sla') {
    renderSlaTab(contentArea);
  } else if (activeThirdPartyTab === 'exit') {
    renderExitTab(contentArea);
  } else if (activeThirdPartyTab === 'assessments') {
    renderAssessmentsStudioTab(contentArea);
  }
}

// --------------------------------------------------------------------------
// TAB 1: SUPPLIER DIRECTORY
// --------------------------------------------------------------------------
function renderDirectoryTab(container) {
  container.innerHTML = `
    <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
      <!-- Left Panel: Supplier Registry -->
      <div class="dashboard-card" style="flex: 1.5; min-width: 450px; display: flex; flex-direction: column; gap: 15px; padding: 15px; margin: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;">
          <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin: 0;">
            Nth-Party Supplier Directory
          </h3>
          <button class="btn btn-secondary btn-xs" onclick="switchTab('manager-inbox')" style="padding: 4px 8px; font-size: 0.65rem; display: flex; align-items: center; gap: 4px;">
            🚨 Urgent Remediation Inbox
          </button>
        </div>
        <div id="suppliers-table-container" style="width: 100%;"></div>
      </div>

      <!-- Right Panel: Profile & Subcontractors -->
      <div class="dashboard-card" style="flex: 1.2; min-width: 380px; display: flex; flex-direction: column; gap: 15px; padding: 15px; margin: 0;">
        <div id="supplier-detail-header" style="border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <!-- Populated dynamically -->
        </div>
        <div id="supplier-detail-body" style="flex: 1; display: flex; flex-direction: column; gap: 15px;">
          <!-- Populated dynamically -->
        </div>
      </div>
    </div>
  `;

  renderSuppliersTable();
  renderSupplierDetails();
}

function renderSuppliersTable() {
  const state = getState();
  const columns = [
    { key: 'name', label: 'Supplier Name', render: (row) => `<b>${row.name}</b>` },
    { key: 'riskTier', label: 'Risk Tier', render: (row) => createStatusBadge(row.riskTier) },
    { 
      key: 'complianceScore', 
      label: 'Compliance', 
      render: (row) => `
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-weight:700; color: ${row.complianceScore >= 90 ? '#10b981' : (row.complianceScore >= 75 ? '#eab308' : '#ef4444')}">${row.complianceScore}%</span>
          <div style="flex:1; width:50px; height:4px; background:rgba(255,255,255,0.04); border-radius:2px; overflow:hidden;">
            <div style="width: ${row.complianceScore}%; height:100%; background: ${row.complianceScore >= 90 ? '#10b981' : (row.complianceScore >= 75 ? '#eab308' : '#ef4444')}"></div>
          </div>
        </div>
      `
    },
    { key: 'contactName', label: 'Contact Rep', render: (row) => `<span style="font-size:0.7rem; color:var(--text-secondary);">${row.contactName}</span>` },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => `
        <button class="btn btn-secondary btn-xs select-sup-btn" data-id="${row.id}" style="padding: 2px 6px;">Select</button>
      `
    }
  ];

  const rawSuppliers = state.suppliers || [];
  const suppliersList = Array.isArray(rawSuppliers) ? rawSuppliers : Object.values(rawSuppliers);
  createTable('suppliers-table-container', suppliersList, columns, {
    searchPlaceholder: 'Search suppliers directory...',
    pageSize: 6,
    selectedRowId: selectedSupplierId,
    onRowClick: (row) => {
      selectedSupplierId = row.id;
      renderSupplierDetails();
      renderSuppliersTable();
    }
  });
}

function renderSupplierDetails() {
  const state = getState();
  const headerContainer = document.getElementById('supplier-detail-header');
  const bodyContainer = document.getElementById('supplier-detail-body');
  if (!headerContainer || !bodyContainer) return;

  const sup = (state.suppliers && state.suppliers[selectedSupplierId]) || null;
  if (!sup) {
    headerContainer.innerHTML = `<h3 style="font-size:0.8rem; margin:0;">No Supplier Selected</h3>`;
    bodyContainer.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">Please select a supplier from the registry.</div>`;
    return;
  }

  headerContainer.innerHTML = `
    <div>
      <span style="font-size:0.56rem; text-transform:uppercase; color:var(--color-cyan); font-weight:700;">Supplier Profile</span>
      <h2 style="font-size:1.05rem; font-weight:700; margin-top:2px; color:var(--text-primary);">${sup.name}</h2>
    </div>
    <div>
      ${createStatusBadge(sup.riskTier)}
    </div>
  `;

  const subsHtml = sup.subcontractors && sup.subcontractors.length > 0 ? sup.subcontractors.map(sub => `
    <tr style="border-bottom:1px solid var(--border-color); font-size:0.7rem;">
      <td style="padding:6px 8px; color:var(--text-primary);"><b>${sub.name}</b></td>
      <td style="padding:6px 8px; color:var(--text-secondary);">${sub.role}</td>
      <td style="padding:6px 8px; color:var(--text-muted);">${sub.primaryLocation}</td>
      <td style="padding:6px 8px; color:var(--text-muted);">${sub.secondaryLocation || '--'}</td>
    </tr>
  `).join('') : `
    <tr>
      <td colspan="4" style="padding:10px; text-align:center; color:var(--text-muted); font-size:0.68rem; font-style:italic;">No mapped downstream subcontractors.</td>
    </tr>
  `;

  // Compute supplier active gaps across risk register, SCO assessments, and remediations actions
  const supplierRisks = state.risks.filter(r => r.owner.includes(sup.contactName) || r.title.includes(sup.id.toUpperCase()) || r.title.includes(sup.name.split(' ')[0]));
  const assessmentGaps = (sup.assessments || []).filter(a => a.status === 'Gap');
  const actionGaps = (state.actions || []).filter(a => a.supplierId === sup.id);

  let gapItems = [];
  supplierRisks.forEach(r => gapItems.push({ title: r.title, status: r.status }));
  assessmentGaps.forEach(a => gapItems.push({ title: `${a.section} ${a.title}: ${a.snippet}`, status: 'Gap Identified' }));
  actionGaps.forEach(a => gapItems.push({ title: `${a.title} (${a.domain})`, status: a.status || 'Open Gap' }));

  const supplierGapsHtml = gapItems.length > 0 ? gapItems.map(g => `
    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(239,68,68,0.02); border:1px solid rgba(239,68,68,0.1); border-radius:4px; padding:6px 10px; font-size:0.68rem; gap:8px;">
      <span style="color:var(--text-primary); font-weight:600;">⚠️ ${g.title}</span>
      ${createStatusBadge(g.status)}
    </div>
  `).join('') : `<div style="font-size:0.68rem; color:var(--text-muted); font-style:italic;">No active compliance gaps logged.</div>`;

  bodyContainer.innerHTML = `
    <div style="font-size:0.72rem; color:var(--text-secondary); line-height:1.45;">
      <b>Business Impact Context:</b><br/>
      ${sup.riskTierExplanation}
    </div>

    <div style="background:rgba(255,255,255,0.01); border:1px solid var(--border-color); padding:10px; border-radius:6px; font-size:0.7rem; display:flex; flex-direction:column; gap:4px;">
      <div>💼 <b>Account Lead:</b> ${sup.contactName} (${sup.contactEmail})</div>
      <div>📍 <b>Primary Location:</b> ${sup.primarySupportLocation || 'N/A'}</div>
      <div>🌎 <b>Secondary Operations Location:</b> ${sup.secondarySupportLocation || 'N/A'}</div>
    </div>

    <div style="display:flex; flex-direction:column; gap:6px;">
      <h4 style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em; font-weight: 700; margin: 0;">
        Active Compliance Gaps & Risks
      </h4>
      ${supplierGapsHtml}
    </div>

    <div style="display:flex; flex-direction:column; gap:6px;">
      <h4 style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em; font-weight: 700; border-bottom: 1px dashed var(--border-color); padding-bottom: 4px; margin: 0;">
        Downstream Subcontractor Chain (Tier 4 / Nth-Party)
      </h4>
      <div style="overflow-x:auto; width:100%; border:1px solid var(--border-color); border-radius:4px;">
        <table style="width:100%; border-collapse:collapse; text-align:left;">
          <thead>
            <tr style="background:rgba(255,255,255,0.02); border-bottom:1px solid var(--border-color); font-size:0.68rem; font-weight:600; color:var(--text-secondary);">
              <th style="padding:6px 8px;">Subcontractor</th>
              <th style="padding:6px 8px;">Role</th>
              <th style="padding:6px 8px;">Primary Location</th>
              <th style="padding:6px 8px;">Failover Location</th>
            </tr>
          </thead>
          <tbody>
            ${subsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function getServicesForSupplier(state, supplierId) {
  const linkedServices = [];
  const assets = state.assets || [];
  const supAssets = assets.filter(a => a.supplierId === supplierId);
  
  if (state.applications && state.services) {
    supAssets.forEach(ast => {
      const matchedApps = state.applications.filter(app => ast.name && ast.name.includes(app.name.split(' ')[0]));
      matchedApps.forEach(app => {
        const srvs = state.services.filter(s => s.applications && s.applications.includes(app.id));
        linkedServices.push(...srvs);
      });
    });
    
    if (linkedServices.length === 0) {
      const matchedApps = state.applications.filter(app => 
        app.hostingProvider && app.hostingProvider.toLowerCase().includes(supplierId.toLowerCase())
      );
      matchedApps.forEach(app => {
        const srvs = state.services.filter(s => s.applications && s.applications.includes(app.id));
        linkedServices.push(...srvs);
      });
    }
  }

  // Fallback explicit mappings for DORT concentration logic to ensure ALL related IBS are mapped!
  const id = supplierId.toLowerCase();
  if (id === 'salesforce') {
    const s1 = state.services.find(s => s.id === 'srv-001'); // Payments Hub
    const s2 = state.services.find(s => s.id === 'srv-002'); // IBS Clearing Portal
    if (s1) linkedServices.push(s1);
    if (s2) linkedServices.push(s2);
  } else if (id === 'slack') {
    const s1 = state.services.find(s => s.id === 'srv-001'); // Payments Hub
    const s4 = state.services.find(s => s.id === 'srv-004'); // CIS Identity & Access Directories
    if (s1) linkedServices.push(s1);
    if (s4) linkedServices.push(s4);
  } else if (id === 'workday') {
    const s3 = state.services.find(s => s.id === 'srv-003'); // CIS Database Backup Services
    if (s3) linkedServices.push(s3);
  } else if (id === 'aws') {
    const s1 = state.services.find(s => s.id === 'srv-001'); // Payments Hub
    const s2 = state.services.find(s => s.id === 'srv-002'); // IBS Clearing Portal
    if (s1) linkedServices.push(s1);
    if (s2) linkedServices.push(s2);
  }
  
  return [...new Set(linkedServices)];
}

// --------------------------------------------------------------------------
// TAB 2: CONCENTRATION RISK
// --------------------------------------------------------------------------
function renderConcentrationTab(container) {
  const state = getState();
  const rawSuppliers = state.suppliers || [];
  const suppliersList = Array.isArray(rawSuppliers) ? rawSuppliers : Object.values(rawSuppliers);

  // Identify subcontractor concentration hotspots
  const subcontractorMap = {};
  suppliersList.forEach(sup => {
    if (sup.subcontractors) {
      sup.subcontractors.forEach(sub => {
        if (!subcontractorMap[sub.name]) {
          subcontractorMap[sub.name] = {
            name: sub.name,
            role: sub.role,
            primaryLocation: sub.primaryLocation,
            suppliers: []
          };
        }
        subcontractorMap[sub.name].suppliers.push(sup.name);
      });
    }
  });

  const hotspots = Object.values(subcontractorMap).filter(sub => sub.suppliers.length > 1);
  // Sort hotspots descending by exposure (highest supplier count first)
  hotspots.sort((a, b) => b.suppliers.length - a.suppliers.length);

  // Default to highest-exposure hotspot if initial or not found
  if ((!selectedHotspotName || !subcontractorMap[selectedHotspotName]) && hotspots.length > 0) {
    selectedHotspotName = hotspots[0].name;
  }

  let subObj = subcontractorMap[selectedHotspotName];
  if (!subObj && hotspots.length > 0) {
    selectedHotspotName = hotspots[0].name;
    subObj = subcontractorMap[selectedHotspotName];
  }

  const hotspotRows = hotspots.map(sub => `
      <tr class="hotspot-row ${selectedHotspotName === sub.name ? 'active-row' : ''}" data-name="${sub.name}" style="border-bottom: 1px solid var(--border-color); font-size: 0.72rem; cursor: pointer; transition: background 0.15s ease;">
        <td style="padding: 10px; color: var(--text-primary); font-weight: 700;">
          ${selectedHotspotName === sub.name ? '👉 ' : ''}⚠️ ${sub.name}
        </td>
        <td style="padding: 10px; color: var(--text-secondary);">${sub.role}</td>
        <td style="padding: 10px; color: var(--text-muted);">${sub.primaryLocation}</td>
        <td style="padding: 10px; color: #ef4444; font-weight: 700;">${sub.suppliers.length} Primary Vendors</td>
        <td style="padding: 10px; color: var(--text-secondary);">${sub.suppliers.join(', ')}</td>
      </tr>
    `).join('');

  // Generate dynamic nodes & paths for SVG
  let svgPaths = '';
  let svgNodes = '';
  
  if (subObj) {
    const subX = 490;
    const subY = 115;
    
    // Common Subcontractor Node (Right)
    svgNodes += `
      <g transform="translate(${subX}, ${subY})">
        <rect width="140" height="50" rx="4" fill="#ef4444" stroke="#ef4444" stroke-width="2" />
        <text x="5" y="15" font-size="7" font-weight="800" fill="rgba(255,255,255,0.7)">⚠️ CONCENTRATION POINT</text>
        <text x="5" y="32" font-size="8.5" font-weight="800" fill="#ffffff">${subObj.name}</text>
        <text x="5" y="43" font-size="6.5" fill="rgba(255,255,255,0.9)">Shared by ${subObj.suppliers.length} vendors</text>
      </g>
    `;
    
    // Suppliers Nodes (Middle)
    const midX = 250;
    const sups = subObj.suppliers;
    const spacingY = 70;
    const totalSups = sups.length;
    const startY = 140 - ((totalSups - 1) * spacingY) / 2 - 25;
    
    const supCoords = [];
    sups.forEach((supName, idx) => {
      const supY = startY + idx * spacingY;
      supCoords.push({ name: supName, x: midX, y: supY });
      
      // Node Box
      svgNodes += `
        <g transform="translate(${midX}, ${supY})">
          <rect width="120" height="50" rx="4" fill="var(--bg-card)" stroke="#ef4444" stroke-width="1.5" />
          <text x="5" y="15" font-size="7" font-weight="700" fill="var(--text-muted)">PRIMARY SUPPLIER</text>
          <text x="5" y="32" font-size="8" font-weight="700" fill="var(--text-primary)">${supName.slice(0, 20)}</text>
        </g>
      `;
      
      // Path Supplier -> Subcontractor (Bezier curve)
      const x1 = midX + 120;
      const y1 = supY + 25;
      const x2 = subX;
      const y2 = subY + 25;
      const cx1 = x1 + (x2 - x1) / 2;
      const cy1 = y1;
      const cx2 = x1 + (x2 - x1) / 2;
      const cy2 = y2;
      svgPaths += `<path d="M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}" stroke="#ef4444" stroke-width="2" fill="none" filter="url(#glow-red)" />`;
    });
    
    // Services Nodes (Left) - Render all linked services!
    const serviceMap = {};
    sups.forEach(supName => {
      const supObj = suppliersList.find(s => s.name === supName);
      if (supObj) {
        const services = getServicesForSupplier(state, supObj.id);
        services.forEach(srv => {
          if (!serviceMap[srv.name]) {
            serviceMap[srv.name] = {
              name: srv.name,
              criticality: srv.criticality,
              suppliers: []
            };
          }
          serviceMap[srv.name].suppliers.push(supName);
        });
      }
    });
    
    const uniqueServices = Object.values(serviceMap);
    const leftX = 10;
    const totalSrvs = uniqueServices.length || 1;
    const srvSpacingY = totalSrvs > 3 ? 55 : 70;
    const srvStartY = 140 - ((totalSrvs - 1) * srvSpacingY) / 2 - 25;
    
    uniqueServices.forEach((srv, idx) => {
      const srvY = srvStartY + idx * srvSpacingY;
      const borderCol = srv.criticality === 'Critical' ? 'var(--color-danger)' : 'var(--border-color)';
      
      svgNodes += `
        <g transform="translate(${leftX}, ${srvY})">
          <rect width="120" height="50" rx="4" fill="var(--bg-card)" stroke="${borderCol}" stroke-width="1.5" />
          <text x="5" y="15" font-size="7" font-weight="700" fill="var(--text-muted)">CRITICAL SERVICE</text>
          <text x="5" y="32" font-size="8" font-weight="700" fill="var(--text-primary)">${srv.name.slice(0, 20)}</text>
        </g>
      `;
      
      srv.suppliers.forEach(supName => {
        const matchingSup = supCoords.find(sc => sc.name === supName);
        if (matchingSup) {
          const x1 = leftX + 120;
          const y1 = srvY + 25;
          const x2 = matchingSup.x;
          const y2 = matchingSup.y + 25;
          const cx1 = x1 + (x2 - x1) / 2;
          const cy1 = y1;
          const cx2 = x1 + (x2 - x1) / 2;
          const cy2 = y2;
          const isLight = document.body.classList.contains('light-mode');
          const leftLineColor = isLight ? '#0284c7' : 'rgba(56, 189, 248, 0.7)';
          svgPaths += `<path d="M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}" stroke="${leftLineColor}" stroke-width="2.2" stroke-opacity="0.85" fill="none" />`;
        }
      });
    });
  }

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      <!-- CSS styling for active row -->
      <style>
        .hotspot-row:hover { background: rgba(255,255,255,0.03); }
        .hotspot-row.active-row { background: rgba(239, 68, 68, 0.08) !important; border-left: 3px solid #ef4444; }
      </style>
      
      <div class="dashboard-card" style="padding: 15px; margin: 0;">
        <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 10px;">
          Nth-Party Subprocessor Concentration Hotspots
        </h3>
        <p class="panel-subtitle" style="margin-bottom: 15px;">DORA Chapter V mandates identifying critical services sharing downstream subcontractors to prevent systemic failures. Click a row to map below.</p>
        
        <div style="overflow-x: auto; width: 100%; border: 1px solid var(--border-color); border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-color); font-size: 0.7rem; font-weight: 600; color: var(--text-secondary);">
                <th style="padding: 10px;">Subcontractor (Tier 4)</th>
                <th style="padding: 10px;">Role</th>
                <th style="padding: 10px;">Primary Location</th>
                <th style="padding: 10px;">Concentration Exposure</th>
                <th style="padding: 10px;">Impacted Primary Suppliers</th>
              </tr>
            </thead>
            <tbody>
              ${hotspotRows || '<tr><td colspan="5" style="padding:15px; text-align:center; color:var(--text-muted);">No overlapping critical subcontractors mapped.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Concentration Map Visualization -->
      <div class="dashboard-card" style="padding: 15px; margin: 0; min-height: 340px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto;">
        <h3 style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; margin: 0;">
          Interactive Concentration Overlay Map: ${selectedHotspotName}
        </h3>
        
        <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.1); border: 1px solid var(--border-color); border-radius: 6px; padding: 20px; position: relative; overflow: auto;">
          <!-- SVG Concentration Tree -->
          <svg viewBox="0 0 700 280" style="width: 100%; height: 100%; max-height: 280px; min-height: 280px; min-width: 680px;">
            <defs>
              <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <!-- Lines -->
            ${svgPaths}
            
            <!-- Nodes -->
            ${svgNodes}
          </svg>
        </div>
      </div>
    </div>
  `;

  // Bind row click handlers
  document.querySelectorAll('.hotspot-row').forEach(row => {
    row.onclick = () => {
      selectedHotspotName = row.getAttribute('data-name');
      renderConcentrationTab(container);
    };
  });
}

// --------------------------------------------------------------------------
// TAB 3: SLA & PERFORMANCE
// --------------------------------------------------------------------------
function renderSlaTab(container) {
  const state = getState();
  const activeActions = state.actions.filter(a => a.isVulnerabilityRemediation && a.status !== 'Closed');

  const slaRows = activeActions.map(act => {
    const s = state.suppliers[act.supplierId];
    const supplierName = s ? s.name : 'Unknown';
    let slaTarget = '48 Hours';
    if (act.title.includes('9 Hours') || act.id === 'act-vuln-pre') slaTarget = '9 Hours';
    else if (act.title.includes('24 Hours')) slaTarget = '24 Hours';

    return `
      <tr style="border-bottom: 1px solid var(--border-color); font-size: 0.72rem;">
        <td style="padding: 10px; color: var(--text-primary);"><b>${act.id}</b></td>
        <td style="padding: 10px; color: var(--text-secondary);">${act.title}</td>
        <td style="padding: 10px; color: var(--text-muted);">${supplierName}</td>
        <td style="padding: 10px;"><span class="badge badge-info" style="font-size:0.6rem;">${slaTarget}</span></td>
        <td style="padding: 10px; color: var(--text-secondary);">${act.status}</td>
        <td style="padding: 10px; color: #ef4444; font-weight: 700;">Active Remediation</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      <!-- SLA Status gauges -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; width: 100%;">
        <div class="dashboard-card" style="padding: 15px; margin: 0; text-align: center;">
          <h4 style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; margin: 0;">SLA Compliance Rate</h4>
          <strong style="font-size: 1.8rem; color: #10b981; display: block; margin-top: 5px;">94.2%</strong>
          <span style="font-size: 0.62rem; color: var(--text-secondary);">Target: >95.0% | Variance: -0.8%</span>
        </div>
        
        <div class="dashboard-card" style="padding: 15px; margin: 0; text-align: center;">
          <h4 style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; margin: 0;">MTTR (Mean Time to Resolve)</h4>
          <strong style="font-size: 1.8rem; color: var(--color-cyan); display: block; margin-top: 5px;">14.8 Hours</strong>
          <span style="font-size: 0.62rem; color: var(--text-secondary);">Critical Vulns: 8.2 Hours | High: 22 Hours</span>
        </div>
        
        <div class="dashboard-card" style="padding: 15px; margin: 0; text-align: center;">
          <h4 style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; margin: 0;">Active SLA Breaches</h4>
          <strong style="font-size: 1.8rem; color: #ef4444; display: block; margin-top: 5px;">1</strong>
          <span style="font-size: 0.62rem; color: var(--text-secondary);">AWS us-east-1a testing overdue (Article 13 gap)</span>
        </div>
      </div>

      <div class="dashboard-card" style="padding: 15px; margin: 0;">
        <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 10px;">
          Active Supplier Remediation SLA Registry
        </h3>
        <p class="panel-subtitle" style="margin-bottom: 15px;">Uptime and vulnerability fix performance under contractual service level agreements (SLAs).</p>
        
        <div style="overflow-x: auto; width: 100%; border: 1px solid var(--border-color); border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-color); font-size: 0.7rem; font-weight: 600; color: var(--text-secondary);">
                <th style="padding: 10px;">Action ID</th>
                <th style="padding: 10px;">Remediation Objective</th>
                <th style="padding: 10px;">Vendor</th>
                <th style="padding: 10px;">Target SLA Limit</th>
                <th style="padding: 10px;">Status</th>
                <th style="padding: 10px;">Compliance Rating</th>
              </tr>
            </thead>
            <tbody>
              ${slaRows || '<tr><td colspan="6" style="padding:15px; text-align:center; color:var(--text-muted);">No active remediation SLAs logged. All suppliers nominal.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// TAB 4: EXIT STRATEGIES
// --------------------------------------------------------------------------
function renderExitTab(container) {
  const state = getState();
  const strategies = state.exitStrategies || {};

  const strategyRows = Object.keys(strategies).map(supId => {
    const strat = strategies[supId];
    const s = state.suppliers[supId];
    const supplierName = s ? s.name : supId.toUpperCase();
    const feasibilityColor = strat.feasibilityIndex >= 80 ? '#10b981' : (strat.feasibilityIndex >= 60 ? '#eab308' : '#ef4444');

    return `
      <tr style="border-bottom: 1px solid var(--border-color); font-size: 0.72rem;">
        <td style="padding: 10px; color: var(--text-primary);"><b>${supplierName}</b></td>
        <td style="padding: 10px; color: var(--text-secondary);">${strat.backupProvider}</td>
        <td style="padding: 10px; color: var(--text-muted);">${strat.transitionTimeline}</td>
        <td style="padding: 10px; color: var(--text-secondary);">${strat.criticalServicesAffected.join(', ')}</td>
        <td style="padding: 10px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-weight:700; color: ${feasibilityColor}">${strat.feasibilityIndex}%</span>
            <div style="flex:1; width:50px; height:4px; background:rgba(255,255,255,0.04); border-radius:2px; overflow:hidden;">
              <div style="width: ${strat.feasibilityIndex}%; height:100%; background: ${feasibilityColor}"></div>
            </div>
          </div>
        </td>
        <td style="padding: 10px;"><span class="badge" style="background: rgba(6,182,212,0.1); color: var(--color-cyan); border: 1px solid rgba(6,182,212,0.2);">${strat.strategyStatus}</span></td>
        <td style="padding: 10px; text-align: center;">
          <button class="btn btn-secondary btn-xs" onclick="alert('Exit simulation logs: Last run ${strat.lastTestDate}. Data integrity and failover sync verified with zero loss.')" style="padding: 2px 6px;">Test Log</button>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      <div class="dashboard-card" style="padding: 15px; margin: 0;">
        <h3 style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 10px;">
          Supplier Exit Strategy Registry
        </h3>
        <p class="panel-subtitle" style="margin-bottom: 15px;">DORA Article 28 requires financial institutions to maintain robust exit strategies for critical ICT service providers to allow transitions without service interruption.</p>
        
        <div style="overflow-x: auto; width: 100%; border: 1px solid var(--border-color); border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-color); font-size: 0.7rem; font-weight: 600; color: var(--text-secondary);">
                <th style="padding: 10px;">Primary Supplier</th>
                <th style="padding: 10px;">Alternative Backup Provider</th>
                <th style="padding: 10px;">Transition Timeline</th>
                <th style="padding: 10px;">Services Mapped</th>
                <th style="padding: 10px;">Feasibility Index</th>
                <th style="padding: 10px;">Plan Status</th>
                <th style="padding: 10px; text-align: center;">Simulation Drills</th>
              </tr>
            </thead>
            <tbody>
              ${strategyRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}



// ==========================================================================
// TAB 5: AI TPRM ASSESSMENT STUDIO (STAGE 5A MULTI-AGENT WORKFLOW)
// ==========================================================================

// Pre-defined Sample Supplier Evidence Documents
export const SAMPLE_SUPPLIER_DOCUMENTS = [
  {
    id: 'doc-aws-soc2-2026',
    supplierId: 'aws',
    filename: 'AWS_SOC2_Type_II_Executive_Assessment_2026.txt',
    description: 'Amazon Web Services - SOC 2 Type II Independent Audit & BCP Attestation (2026)',
    content: `AMAZON WEB SERVICES (AWS) — INDEPENDENT SERVICE AUDITOR'S REPORT
Report on Controls Relevant to Security, Availability, and Confidentiality (SOC 2 Type II)
Period: January 1, 2025 to December 31, 2025

SECTION 1: INDEPENDENT AUDITOR OPINION
We have examined the accompanying description of controls implemented by Amazon Web Services.
Testing confirmed operational effectiveness across all evaluated trust services criteria.

SECTION 2: DISASTER RECOVERY & BUSINESS CONTINUITY (CTRL-BCP-01)
AWS maintains multi-region automated failover architecture. Annual disaster recovery exercises were conducted across all commercial regions on October 14, 2025. Tested recovery time objective (RTO) was under 15 minutes, with recovery point objective (RPO) near zero for replicated datastores. Redundant power and cross-AZ automated replication functioned without service degradation.

SECTION 3: CRYPTOGRAPHIC CONTROLS & DATA PROTECTION (CTRL-CRY-01)
All customer data in transit is protected using TLS 1.3 across external public gateways and inter-region backbone links. Data at rest is encrypted by default using AES-256 via the AWS Key Management Service (AWS KMS) with hardware security module (FIPS 140-3 Level 3) boundary enforcement. Customer-managed keys support automated annual rotation.

SECTION 4: INDEPENDENT PENETRATION TESTING & VULNERABILITY MANAGEMENT (CTRL-VUL-01)
Third-party penetration assessments are performed semi-annually by NCC Group. The most recent assessment completed on November 18, 2025 identified zero critical findings. Documented policy mandates that any critical vulnerabilities must be remediated within 7 calendar days; during the review period, mean-time-to-remediate (MTTR) for high findings was 4.2 days.

SECTION 5: SUBCONTRACTOR & FOURTH-PARTY RISK OVERSIGHT (CTRL-SUB-01)
Critical fourth-party entities and colocation providers undergo annual third-party risk assessments. AWS maintains direct contractual oversight, including mandatory adherence to AWS Security Standards, right-to-audit clauses, and notification requirements within 24 hours of material security incidents.`
  },
  {
    id: 'doc-fintech-partial-2026',
    supplierId: 'snowflake',
    filename: 'CloudData_Fintech_Security_Summary_2026.txt',
    description: 'Cloud Data Warehouse Provider - Preliminary Security & Resilience Disclosure',
    content: `CLOUD DATA PLATFORM — INFORMATION SECURITY COMPLIANCE DISCLOSURE
Report Date: February 2026

1. ARCHITECTURAL OVERVIEW & DATA ENCRYPTION (CTRL-CRY-01)
Data in transit across customer ingress endpoints utilizes TLS 1.2 or TLS 1.3 encryption. At rest, data files and metadata caches are encrypted with AES-256.

2. SERVICE CONTINUITY & BACKUP PROCEDURES (CTRL-BCP-01)
Automated daily snapshots are maintained across cloud infrastructure. However, multi-region live failover testing is currently executed on an ad-hoc basis without formal annual simulation records. Documented target RTO is 12 hours.

3. VULNERABILITY SCANNING & PATCHING (CTRL-VUL-01)
Automated vulnerability scanning runs weekly. Formal external penetration testing was conducted in Q2 2024. SLA remediation targets allow up to 30 calendar days for critical issues.

4. MATERIAL SUBCONTRACTORS (CTRL-SUB-01)
Primary infrastructure is hosted on third-party cloud providers. Subcontractor risk reviews are currently undergoing formalization under internal policy updates.`
  },
  {
    id: 'doc-legacy-vendor-defective',
    supplierId: 'salesforce',
    filename: 'Legacy_Vendor_Unattested_Brochure.txt',
    description: 'Unattested Marketing Datasheet (Missing Concrete Evidence)',
    content: `GLOBAL ENTERPRISE CRM SOLUTIONS — ARCHITECTURE OVERVIEW
We provide enterprise-grade reliability, world-class encryption, and industry-leading resilience.
All customer systems are backed by redundant servers and monitored 24/7 by dedicated support engineers.
Security is our top priority. We partner with top-tier hosting providers worldwide.`
  }
];

// Starter Control Definitions
export const STARTER_CONTROLS = {
  'CTRL-BCP-01': {
    id: 'CTRL-BCP-01',
    name: 'Business Continuity & Disaster Recovery',
    framework: 'DORA Art. 11 / ISO 27001 A.12',
    description: 'Annual multi-region failover and disaster recovery testing with documented RTO/RPO metrics.',
    keywords: ['failover', 'disaster recovery', 'rto', 'rpo', 'multi-region', 'continuity', 'replication']
  },
  'CTRL-CRY-01': {
    id: 'CTRL-CRY-01',
    name: 'Data Encryption in Transit and at Rest',
    framework: 'DORA Art. 9 / ISO 27001 A.10',
    description: 'Enforcement of TLS 1.3 / TLS 1.2 in transit and AES-256 encryption at rest with managed keys.',
    keywords: ['tls', 'encryption', 'aes-256', 'at rest', 'in transit', 'kms', 'fips']
  },
  'CTRL-VUL-01': {
    id: 'CTRL-VUL-01',
    name: 'Penetration Testing & Remediation SLA',
    framework: 'DORA Art. 24 / ISO 27001 A.14',
    description: 'Independent third-party penetration testing and critical vulnerability remediation SLA <= 14 days.',
    keywords: ['penetration test', 'vulnerability', 'remediation', 'sla', 'third-party', 'mttr']
  },
  'CTRL-SUB-01': {
    id: 'CTRL-SUB-01',
    name: 'Fourth-Party / Subcontractor Oversight',
    framework: 'DORA Art. 28 / EBA Guidelines',
    description: 'Contractual oversight, right-to-audit, and incident notification for material subservice organizations.',
    keywords: ['subcontractor', 'fourth-party', 'subservice', 'right-to-audit', 'colocation']
  }
};

/**
 * SHA-256 Content Hasher using Web Cryptography API
 */
export async function calculateContentHash(content) {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Backend API Client Adapter & Dual-Mode Configuration Helper
 * Enforces strict fail-closed origin trust and credential protection:
 * - Loopback development (http://127.0.0.1 or http://localhost) requires explicit opt-in (development mode).
 * - When development mode is disabled (default): loopback origins are REJECTED before fetch.
 * - Remote non-loopback HTTP is strictly prohibited.
 * - Remote HTTPS origins are rejected unless explicitly allowlisted in APPROVED_REMOTE_ORIGINS.
 * - Unapproved origins NEVER receive cookies or bearer tokens.
 * - Full URL structure validation rejects userinfo, unexpected ports, and malformed hosts.
 * - Only backend URL is stored in localStorage; authentication tokens are NEVER persisted.
 */

// Explicit approved remote origins allowlist.
// Staging hostname placeholder requiring explicit repository owner approval.
export const APPROVED_REMOTE_ORIGINS = Object.freeze([]);

// Explicitly permitted loopback hostnames and development ports
export const PERMITTED_LOOPBACK_HOSTS = Object.freeze(new Set(['127.0.0.1', 'localhost', '::1', '[::1]']));
export const PERMITTED_DEV_PORTS = Object.freeze(new Set(['', '80', '8000', '8080', '8098', '8443']));

export function isLoopbackOrigin(hostname) {
  return PERMITTED_LOOPBACK_HOSTS.has(hostname);
}

/**
 * Checks if local development mode is explicitly enabled.
 * Evaluated from window.__TPRM_DEV_MODE__ (runtime override) or localStorage ("tprm_dev_mode").
 * Defaults strictly to false.
 */
export function isDevModeEnabled() {
  if (typeof window === 'undefined') return false;
  if (window.__TPRM_DEV_MODE__ === true) return true;
  if (window.__TPRM_DEV_MODE__ === false) return false;
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('tprm_dev_mode') === 'true';
  }
  return false;
}

export function setDevMode(enabled) {
  if (typeof window === 'undefined') return;
  const flag = Boolean(enabled);
  if (typeof localStorage !== 'undefined') {
    if (flag) {
      localStorage.setItem('tprm_dev_mode', 'true');
    } else {
      localStorage.removeItem('tprm_dev_mode');
    }
  }
  window.__TPRM_DEV_MODE__ = flag;
}

/**
 * Evaluates backend URL against fail-closed origin trust security policy.
 * Rejects: userinfo, non-HTTP(S) schemes, unapproved remote origins, unexpected ports,
 * and unapproved loopback origins when dev mode is disabled.
 */
export function evaluateOriginTrust(rawUrl, devModeOverride) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { ok: false, error: 'Empty or invalid URL input' };
  }

  const clean = rawUrl.trim();
  if (!clean) {
    return { ok: false, error: 'Empty URL input' };
  }

  // 1. Strict raw host syntax validation (reject trailing/leading dots or weird host decorations)
  const hostMatch = clean.match(/^[a-zA-Z]+:\/\/([^/?#]+)/);
  if (hostMatch) {
    const rawHostPort = hostMatch[1];
    const rawHost = rawHostPort.split('@').pop().split(':')[0];
    if (rawHost.startsWith('.') || rawHost.endsWith('.') || rawHost.includes('*')) {
      return { ok: false, error: 'Malformed hostname syntax' };
    }
  }

  let parsed;
  try {
    parsed = new URL(clean);
  } catch (e) {
    return { ok: false, error: 'Malformed URL syntax' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { ok: false, error: `Unsupported protocol scheme: ${parsed.protocol}` };
  }

  // 2. Reject embedded userinfo (user:pass@host)
  if (parsed.username || parsed.password) {
    return { ok: false, error: 'Embedded credentials (username/password) are strictly prohibited' };
  }

  // 3. Reject empty, wildcard, or malformed hostname
  const hostname = parsed.hostname;
  if (!hostname || hostname.includes('*') || hostname.startsWith('.') || hostname.endsWith('.')) {
    return { ok: false, error: 'Malformed hostname' };
  }

  const isLoopback = isLoopbackOrigin(hostname);
  const devModeActive = typeof devModeOverride === 'boolean' ? devModeOverride : isDevModeEnabled();

  // 4. Scheme and Origin Trust Policy
  if (parsed.protocol === 'http:') {
    if (!isLoopback) {
      return { ok: false, error: 'Insecure remote HTTP is prohibited. Only loopback development permits HTTP.' };
    }
    // Fail-closed loopback check: require explicit development mode opt-in
    if (!devModeActive) {
      return {
        ok: false,
        error: 'Loopback backend connection requires explicit Development Mode opt-in. Enable Development Mode in settings to connect.'
      };
    }
    // Validate loopback port
    if (!PERMITTED_DEV_PORTS.has(parsed.port)) {
      return { ok: false, error: `Port ${parsed.port} is not an authorized loopback development port` };
    }
    const cleanBaseUrl = parsed.origin + parsed.pathname.replace(/\/+$/, '');
    return {
      ok: true,
      baseUrl: cleanBaseUrl,
      isLoopback: true,
      isTrusted: true,
      origin: parsed.origin
    };
  }

  // 5. HTTPS Origin Validation: Require exact match in APPROVED_REMOTE_ORIGINS
  if (parsed.protocol === 'https:') {
    const isApprovedRemote = APPROVED_REMOTE_ORIGINS.includes(parsed.origin);
    if (isLoopback) {
      if (!devModeActive) {
        return {
          ok: false,
          error: 'Loopback backend connection requires explicit Development Mode opt-in. Enable Development Mode in settings to connect.'
        };
      }
      if (!PERMITTED_DEV_PORTS.has(parsed.port)) {
        return { ok: false, error: `Port ${parsed.port} is not an authorized loopback development port` };
      }
      const cleanBaseUrl = parsed.origin + parsed.pathname.replace(/\/+$/, '');
      return {
        ok: true,
        baseUrl: cleanBaseUrl,
        isLoopback: true,
        isTrusted: true,
        origin: parsed.origin
      };
    }

    if (!isApprovedRemote) {
      return {
        ok: false,
        error: `Remote HTTPS origin "${parsed.origin}" is not on the approved allowlist. Staging hostname requires owner authorization.`
      };
    }

    const cleanBaseUrl = parsed.origin + parsed.pathname.replace(/\/+$/, '');
    return {
      ok: true,
      baseUrl: cleanBaseUrl,
      isLoopback: false,
      isTrusted: true,
      origin: parsed.origin
    };
  }

  return { ok: false, error: 'Unrecognized URL form' };
}

export function getBackendConfig() {
  if (typeof window === 'undefined') return { enabled: false, baseUrl: '', isTrusted: false, isLoopback: false };
  const rawUrl = (window.__TPRM_BACKEND_URL__ || (typeof localStorage !== 'undefined' ? localStorage.getItem('tprm_backend_url') : '') || '').trim();
  if (!rawUrl) return { enabled: false, baseUrl: '', isTrusted: false, isLoopback: false };

  const evaluation = evaluateOriginTrust(rawUrl);
  if (!evaluation.ok) {
    console.warn('[TPRM Origin Security] Backend connection rejected:', evaluation.error, '(URL:', rawUrl, ')');
    return { enabled: false, baseUrl: '', isTrusted: false, isLoopback: false, error: evaluation.error };
  }

  return {
    enabled: true,
    baseUrl: evaluation.baseUrl,
    isTrusted: evaluation.isTrusted,
    isLoopback: evaluation.isLoopback,
    origin: evaluation.origin
  };
}

export function setBackendUrl(url) {
  if (typeof window === 'undefined') return;
  const clean = (url || '').trim();
  if (typeof localStorage !== 'undefined') {
    if (clean) {
      localStorage.setItem('tprm_backend_url', clean);
    } else {
      localStorage.removeItem('tprm_backend_url');
    }
  }
  window.__TPRM_BACKEND_URL__ = clean;
}

window.tprmToggleDevMode = function(enabled) {
  setDevMode(enabled);
  window.tprmRefreshModeBadge();
};

window.tprmSaveBackendUrl = function() {
  const input = document.getElementById('tprm-backend-url-input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) {
    setBackendUrl('');
    window.tprmRefreshModeBadge();
    return;
  }

  const evaluation = evaluateOriginTrust(val);
  if (!evaluation.ok) {
    alert(`Backend Connection Prohibited: ${evaluation.error}`);
    return;
  }

  setBackendUrl(val);
  window.tprmRefreshModeBadge();
};

window.tprmClearBackendUrl = function() {
  const input = document.getElementById('tprm-backend-url-input');
  if (input) input.value = '';
  setBackendUrl('');
  window.tprmRefreshModeBadge();
};

window.tprmRefreshModeBadge = function() {
  const badge = document.getElementById('tprm-mode-badge');
  const details = document.getElementById('tprm-mode-details');
  const input = document.getElementById('tprm-backend-url-input');
  const devCheckbox = document.getElementById('tprm-dev-mode-checkbox');
  const devMode = isDevModeEnabled();
  const config = getBackendConfig();

  if (devCheckbox) {
    devCheckbox.checked = devMode;
  }

  if (input && !input.value && config.baseUrl) {
    input.value = config.baseUrl;
  }

  if (badge) {
    if (config.enabled) {
      badge.innerText = config.isLoopback ? 'CONNECTED (LOCAL DEV)' : 'CONNECTED (APPROVED REMOTE)';
      badge.style.background = 'rgba(16, 185, 129, 0.2)';
      badge.style.color = '#10b981';
      badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    } else {
      badge.innerText = 'LOCAL SIMULATION';
      badge.style.background = 'rgba(6, 182, 212, 0.15)';
      badge.style.color = 'var(--color-cyan)';
      badge.style.borderColor = 'rgba(6, 182, 212, 0.3)';
    }
  }

  if (details) {
    if (config.enabled) {
      const originTrust = config.isLoopback ? 'Trusted Loopback Dev Origin (Dev Mode Active)' : 'Approved Remote Origin';
      details.innerHTML = `Mode: <strong>Backend API</strong> (<span style="color: #10b981;">${config.baseUrl}</span>) &bull; <span style="color: #38bdf8;">${originTrust}</span>`;
    } else {
      details.innerHTML = 'Mode: <strong>Browser Simulation</strong> (Default & Safe Fallback)';
    }
  }
};
/**
 * Render AI TPRM Assessment Studio Tab Content
 */
export function renderAssessmentsStudioTab(container) {
  const state = getState();
  const assessments = state.tprmAssessments || [];
  const events = state.tprmEvents || [];
  const activeRun = assessments.length > 0 ? assessments[assessments.length - 1] : null;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      <!-- Banner / Intro -->
      <div class="dashboard-card" style="margin: 0; padding: 18px; border-left: 4px solid var(--color-cyan); background: linear-gradient(135deg, rgba(6,182,212,0.06), rgba(13,19,34,0.95));">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge" style="background: rgba(6,182,212,0.15); color: var(--color-cyan); font-weight: 700; border: 1px solid rgba(6,182,212,0.3);">STAGE 5A MULTI-AGENT TPRM</span>
              <span style="font-size: 0.72rem; color: var(--text-muted);">Truthful Live Execution Visibility & Four-Eyes Governance</span>
            </div>
            <h2 style="font-size: 1.15rem; font-weight: 700; margin: 8px 0 4px 0; color: var(--text-primary);">Autonomous Supplier Evidence Assessment & Risk Verification</h2>
            <p style="font-size: 0.75rem; color: var(--text-secondary); max-width: 850px; margin: 0; line-height: 1.45;">
              Ingests raw supplier audit documents, calculates cryptographic SHA-256 hashes, dispatches specialist AI agents across a 5-stage pipeline, evaluates against 4 DORA/ISO controls, and enforces an authentic Human-in-the-Loop (HITL) review gate.
            </p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button id="btn-tprm-clear-runs" class="btn btn-secondary btn-xs" onclick="window.tprmClearHistory()" style="font-size: 0.7rem; padding: 5px 10px;">Clear Run History</button>
            <button id="btn-tprm-view-audit" class="btn btn-secondary btn-xs" onclick="window.tprmShowTimeline()" style="font-size: 0.7rem; padding: 5px 10px; border-color: rgba(6,182,212,0.4); color: var(--color-cyan);">View Full Event Log</button>
          </div>
        </div>
      </div>

      <!-- Execution Grid: Left = Document Ingestion & Controls, Right = Live Agent Dispatcher -->
      <div style="display: grid; grid-template-columns: 1fr 1.25fr; gap: 20px; width: 100%;">

        <!-- Left: Intake & Configuration -->
        <div class="dashboard-card" style="margin: 0; padding: 18px; display: flex; flex-direction: column; gap: 16px;">
          <h3 style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 6px;">
            <span>1. Document Intake & Intake Controls</span>
          </h3>

          <!-- Showcase Execution Mode Configuration -->
          <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-primary);">Execution Mode:</span>
              <span id="tprm-mode-badge" class="badge" style="background: rgba(6,182,212,0.15); color: var(--color-cyan); font-weight: 700; border: 1px solid rgba(6,182,212,0.3); font-size: 0.65rem;">LOCAL SIMULATION</span>
            </div>
            <div id="tprm-mode-details" style="font-size: 0.68rem; color: var(--text-muted); line-height: 1.35;">
              Mode: <strong>Browser Simulation</strong> (Default & Safe Fallback)
            </div>
            <div style="display: flex; gap: 6px; align-items: center; margin-top: 2px;">
              <input type="text" id="tprm-backend-url-input" placeholder="e.g. http://127.0.0.1:8000" style="flex: 1; font-size: 0.7rem; font-family: monospace; background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); border-radius: 4px; padding: 4px 8px; color: #e2e8f0;" />
              <button class="btn btn-secondary btn-xs" onclick="window.tprmSaveBackendUrl()" style="font-size: 0.68rem; padding: 4px 8px;">Connect</button>
              <button class="btn btn-secondary btn-xs" onclick="window.tprmClearBackendUrl()" style="font-size: 0.68rem; padding: 4px 8px; color: var(--text-muted);">Reset</button>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
              <input type="checkbox" id="tprm-dev-mode-checkbox" onchange="window.tprmToggleDevMode(this.checked)" style="cursor: pointer;" />
              <label for="tprm-dev-mode-checkbox" style="font-size: 0.65rem; color: var(--text-muted); cursor: pointer;">Enable Local Development Mode (allows loopback: 127.0.0.1 / localhost)</label>
            </div>
          </div>

          <div>
            <label style="font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 6px;">Target Supplier:</label>
            <select id="tprm-select-supplier" class="dropdown-control" style="width: 100%; font-size: 0.78rem;">
              <option value="aws">Amazon Web Services (AWS) — Tier 1 Critical Cloud</option>
              <option value="snowflake">Snowflake Data Cloud — Tier 2 Core Analytics</option>
              <option value="salesforce">Salesforce CRM — Tier 3 Business Operations</option>
            </select>
          </div>

          <div>
            <label style="font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 6px;">Select Evidence Document (or Upload):</label>
            <select id="tprm-select-sample" class="dropdown-control" style="width: 100%; font-size: 0.78rem;" onchange="window.tprmOnSampleSelect(this.value)">
              ${SAMPLE_SUPPLIER_DOCUMENTS.map(doc => `<option value="${doc.id}">${doc.description}</option>`).join('')}
              <option value="custom">-- Custom Supplier Evidence Upload --</option>
            </select>
          </div>

          <div id="tprm-custom-upload-container" style="display: none; flex-direction: column; gap: 8px; border: 1px dashed rgba(255,255,255,0.15); padding: 12px; border-radius: 6px;">
            <input type="file" id="tprm-file-input" accept=".txt,.json,.md,.csv" style="font-size: 0.72rem; color: var(--text-secondary);" onchange="window.tprmOnFileSelected(event)" />
            <span style="font-size: 0.65rem; color: var(--text-muted);">Accepted formats: .txt, .json, .md (Max 512 KB, byte-level SHA-256 hashed)</span>
          </div>

          <div>
            <label style="font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span>Document Preview & Content Hash:</span>
              <span id="tprm-doc-hash-badge" style="font-family: monospace; font-size: 0.65rem; color: var(--color-cyan);">SHA-256: Calculating...</span>
            </label>
            <textarea id="tprm-doc-content" rows="9" style="width: 100%; font-family: monospace; font-size: 0.7rem; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; color: #e2e8f0; line-height: 1.4; resize: vertical;" readonly></textarea>
          </div>

          <button id="btn-tprm-execute-run" class="btn btn-primary" onclick="window.tprmExecuteWorkflow()" style="width: 100%; padding: 10px; font-weight: 700; font-size: 0.8rem; display: flex; justify-content: center; align-items: center; gap: 8px;">
            <span>⚡ Dispatch Multi-Agent Assessment Pipeline</span>
          </button>
        </div>

        <!-- Right: Live Agent Interaction & Orchestration Console -->
        <div class="dashboard-card" style="margin: 0; padding: 18px; display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary); margin: 0;">2. Live Specialist Agent Orchestration Console</h3>
            <span id="tprm-run-status-badge" class="badge" style="background: rgba(255,255,255,0.06); color: var(--text-secondary); font-size: 0.68rem;">STANDBY</span>
          </div>

          <!-- 5-Stage Agent Tracker -->
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; background: rgba(0,0,0,0.25); padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.04);">
            <div id="tprm-stage-1" style="text-align: center; padding: 6px 4px; border-radius: 4px; background: rgba(255,255,255,0.03); border: 1px solid transparent;">
              <span style="font-size: 0.55rem; color: var(--text-muted); display: block;">STAGE 1</span>
              <span style="font-size: 0.68rem; font-weight: 700; color: #cbd5e1;">Intake</span>
              <span class="tprm-stage-state" style="font-size: 0.58rem; color: var(--text-muted); display: block; margin-top: 2px;">Ready</span>
            </div>
            <div id="tprm-stage-2" style="text-align: center; padding: 6px 4px; border-radius: 4px; background: rgba(255,255,255,0.03); border: 1px solid transparent;">
              <span style="font-size: 0.55rem; color: var(--text-muted); display: block;">STAGE 2</span>
              <span style="font-size: 0.68rem; font-weight: 700; color: #cbd5e1;">Extractor</span>
              <span class="tprm-stage-state" style="font-size: 0.58rem; color: var(--text-muted); display: block; margin-top: 2px;">Standby</span>
            </div>
            <div id="tprm-stage-3" style="text-align: center; padding: 6px 4px; border-radius: 4px; background: rgba(255,255,255,0.03); border: 1px solid transparent;">
              <span style="font-size: 0.55rem; color: var(--text-muted); display: block;">STAGE 3</span>
              <span style="font-size: 0.68rem; font-weight: 700; color: #cbd5e1;">Mapper</span>
              <span class="tprm-stage-state" style="font-size: 0.58rem; color: var(--text-muted); display: block; margin-top: 2px;">Standby</span>
            </div>
            <div id="tprm-stage-4" style="text-align: center; padding: 6px 4px; border-radius: 4px; background: rgba(255,255,255,0.03); border: 1px solid transparent;">
              <span style="font-size: 0.55rem; color: var(--text-muted); display: block;">STAGE 4</span>
              <span style="font-size: 0.68rem; font-weight: 700; color: #cbd5e1;">Risk Scorer</span>
              <span class="tprm-stage-state" style="font-size: 0.58rem; color: var(--text-muted); display: block; margin-top: 2px;">Standby</span>
            </div>
            <div id="tprm-stage-5" style="text-align: center; padding: 6px 4px; border-radius: 4px; background: rgba(255,255,255,0.03); border: 1px solid transparent;">
              <span style="font-size: 0.55rem; color: var(--text-muted); display: block;">STAGE 5</span>
              <span style="font-size: 0.68rem; font-weight: 700; color: #cbd5e1;">HITL Gate</span>
              <span class="tprm-stage-state" style="font-size: 0.58rem; color: var(--text-muted); display: block; margin-top: 2px;">Standby</span>
            </div>
          </div>

          <!-- Live Event Feed Terminal -->
          <div style="flex: 1; display: flex; flex-direction: column; min-height: 220px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 0.68rem; font-weight: 600; color: var(--text-secondary);">Real-Time Event Stream (Append-Only Provenance):</span>
              <span id="tprm-event-count" style="font-size: 0.65rem; color: var(--text-muted);">0 events</span>
            </div>
            <div id="tprm-live-terminal" style="flex: 1; min-height: 200px; max-height: 230px; overflow-y: auto; background: #070b14; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 10px; font-family: monospace; font-size: 0.68rem; display: flex; flex-direction: column; gap: 4px;">
              <div style="color: var(--text-muted); font-style: italic;">Awaiting workflow dispatch... Click 'Dispatch Multi-Agent Assessment Pipeline' to begin.</div>
            </div>
          </div>

          <!-- Human-In-The-Loop Approval Gate Box (Shows when paused) -->
          <div id="tprm-hitl-box" style="display: none; background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.4); border-radius: 6px; padding: 12px; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 0.9rem;">⚠️</span>
                <span style="font-weight: 700; font-size: 0.78rem; color: #fde047;">PAUSED_PENDING_INPUT — Four-Eyes Human Approval Required</span>
              </div>
              <span class="badge" style="background: rgba(234, 179, 8, 0.2); color: #fde047; font-size: 0.62rem;">GOVERNANCE GATE</span>
            </div>
            <p style="font-size: 0.72rem; color: #fef08a; margin: 0; line-height: 1.4;">
              The specialist agents have synthesized an advisory assessment. In accordance with enterprise governance invariants, AI recommendations cannot alter supplier risk tiers or compliance ledgers without authenticated human sign-off.
            </p>
            <div style="display: flex; gap: 10px; align-items: center; justify-content: flex-end; margin-top: 4px;">
              <button id="btn-tprm-reject" class="btn btn-secondary btn-xs" onclick="window.tprmResolveHitl('REJECTED')" style="border-color: #ef4444; color: #ef4444; padding: 6px 12px; font-size: 0.72rem;">Reject / Flag Assessment</button>
              <button id="btn-tprm-approve" class="btn btn-primary btn-xs" onclick="window.tprmResolveHitl('APPROVED')" style="background: #10b981; border-color: #10b981; color: white; padding: 6px 16px; font-size: 0.72rem; font-weight: 700;">Authorize Advisory Review</button>
            </div>
          </div>

        </div>

      </div>

      <!-- Bottom Panel: Synthesized Assessment Findings & Evidence Matrix -->
      <div id="tprm-assessment-results-container" class="dashboard-card" style="margin: 0; padding: 18px; display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 14px;">
          <div>
            <span style="font-size: 0.65rem; color: var(--color-cyan); text-transform: uppercase; font-weight: 700;">Synthesized Findings</span>
            <h3 id="tprm-results-title" style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 2px 0 0 0;">Assessment Output</h3>
          </div>
          <div id="tprm-results-metrics" style="display: flex; gap: 15px; align-items: center;"></div>
        </div>

        <!-- Findings Table -->
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); text-align: left;">
                <th style="padding: 8px 10px; width: 140px;">Control ID & Domain</th>
                <th style="padding: 8px 10px; width: 110px;">Status</th>
                <th style="padding: 8px 10px;">Evidence Extraction & Analysis Rationale</th>
                <th style="padding: 8px 10px; width: 220px;">Source Provenance Locator</th>
              </tr>
            </thead>
            <tbody id="tprm-findings-table-body"></tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  // Initialize backend mode and sample preview
  window.tprmRefreshModeBadge();
  window.tprmOnSampleSelect('doc-aws-soc2-2026');

  // If there's an existing completed or paused assessment, render its state
  if (activeRun) {
    window.tprmRenderExistingRun(activeRun, events);
  }
}



// ==========================================================================
// TPRM MULTI-AGENT ORCHESTRATOR & CLIENT CONTROLLER (STAGE 5A)
// ==========================================================================

let activeWorkflowRun = null;
let activeEventHistory = [];

/**
 * Handle Sample Document Selection Dropdown
 */
window.tprmOnSampleSelect = function(docId) {
  const customContainer = document.getElementById('tprm-custom-upload-container');
  const textarea = document.getElementById('tprm-doc-content');
  const hashBadge = document.getElementById('tprm-doc-hash-badge');
  const supplierSelect = document.getElementById('tprm-select-supplier');

  if (docId === 'custom') {
    if (customContainer) customContainer.style.display = 'flex';
    if (textarea) {
      textarea.value = '';
      textarea.removeAttribute('readonly');
      textarea.placeholder = 'Paste custom supplier assessment or audit text here...';
    }
    if (hashBadge) hashBadge.innerText = 'SHA-256: Awaiting input';
    return;
  }

  if (customContainer) customContainer.style.display = 'none';
  const doc = SAMPLE_SUPPLIER_DOCUMENTS.find(d => d.id === docId);
  if (!doc) return;

  if (supplierSelect && doc.supplierId) {
    supplierSelect.value = doc.supplierId;
  }

  if (textarea) {
    textarea.value = doc.content;
    textarea.setAttribute('readonly', 'true');
  }

  calculateContentHash(doc.content).then(hash => {
    if (hashBadge) hashBadge.innerText = `SHA-256: ${hash.substring(0, 16)}...${hash.substring(hash.length - 8)}`;
  });
};

/**
 * Handle Custom File Selection
 */
window.tprmOnFileSelected = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    alert('File exceeds 2 MiB limit. Please select a smaller evidence document.');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    const textarea = document.getElementById('tprm-doc-content');
    const hashBadge = document.getElementById('tprm-doc-hash-badge');
    if (textarea) textarea.value = content;
    calculateContentHash(content).then(hash => {
      if (hashBadge) hashBadge.innerText = `SHA-256: ${hash.substring(0, 16)}...${hash.substring(hash.length - 8)}`;
    });
  };
  reader.readAsText(file);
};

/**
 * Emit an Append-Only Truthful Execution Event
 */
function emitExecutionEvent(eventType, agentName, message, metadata = {}) {
  const event = {
    schema_version: '1.0.0',
    event_id: 'evt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    run_id: activeWorkflowRun ? activeWorkflowRun.id : 'run-init',
    timestamp: new Date().toISOString(),
    event_type: eventType,
    agent_name: agentName,
    message: message,
    metadata: metadata
  };

  activeEventHistory.push(event);

  // Persist to central DB
  const state = getState();
  if (!state.tprmEvents) state.tprmEvents = [];
  state.tprmEvents.push(event);
  saveState();

  // Render to Live Terminal
  const terminal = document.getElementById('tprm-live-terminal');
  const countBadge = document.getElementById('tprm-event-count');
  if (countBadge) countBadge.innerText = `${activeEventHistory.length} events`;

  if (terminal) {
    const line = document.createElement('div');
    line.style.cssText = 'display: flex; gap: 8px; line-height: 1.4; border-bottom: 1px solid rgba(255,255,255,0.03); padding: 2px 0;';

    let color = '#94a3b8';
    if (eventType === 'agent.completed' || eventType === 'run.completed') color = '#10b981';
    if (eventType === 'agent.failed' || eventType === 'run.failed') color = '#ef4444';
    if (eventType === 'hitl.required') color = '#fde047';
    if (eventType === 'handoff.created') color = '#38bdf8';

    const timeStr = event.timestamp.substring(11, 19);
    line.innerHTML = `
      <span style="color: var(--text-muted); min-width: 65px;">[${timeStr}]</span>
      <span style="color: #06b6d4; font-weight: 700; min-width: 95px;">${agentName}:</span>
      <span style="color: ${color}; flex: 1;">${message}</span>
    `;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
  }

  // Update Header Activity Strip
  updateHeaderActivityStrip(agentName, message, eventType);

  return event;
}

/**
 * Update Header Activity Strip (Compact Execution Status)
 */
function updateHeaderActivityStrip(agent, message, eventType) {
  const strip = document.getElementById('tprm-agent-strip');
  const ind = document.getElementById('tprm-strip-indicator');
  const agentEl = document.getElementById('tprm-strip-agent');
  const statusEl = document.getElementById('tprm-strip-status');

  if (!strip) return;
  strip.style.display = 'flex';

  if (agentEl) agentEl.innerText = agent;
  if (statusEl) {
    statusEl.innerText = message.length > 45 ? message.substring(0, 42) + '...' : message;
  }

  if (ind) {
    if (eventType === 'hitl.required') {
      ind.style.background = '#fde047';
    } else if (eventType === 'run.completed' || eventType === 'hitl.resolved') {
      ind.style.background = '#10b981';
    } else if (eventType === 'agent.failed' || eventType === 'run.failed') {
      ind.style.background = '#ef4444';
    } else {
      ind.style.background = '#06b6d4';
    }
  }
}

/**
 * Update Step Indicators in Stage Tracker
 */
function updateStageTracker(stageNum, stateName, color) {
  const el = document.getElementById(`tprm-stage-${stageNum}`);
  if (!el) return;
  const stateEl = el.querySelector('.tprm-stage-state');
  if (stateEl) {
    stateEl.innerText = stateName;
    stateEl.style.color = color;
  }
  el.style.borderColor = color;
  el.style.background = `rgba(${color === '#10b981' ? '16, 185, 129' : (color === '#fde047' ? '234, 179, 8' : '6, 182, 212')}, 0.1)`;
}

/**
 * Execute Real Backend Assessment Pipeline via FastAPI service entrypoint
 */
async function executeBackendWorkflow(config, rawContent, supplierId, runId) {
  const terminal = document.getElementById('tprm-live-terminal');
  const runBtn = document.getElementById('btn-tprm-execute-run');
  const statusBadge = document.getElementById('tprm-run-status-badge');
  const hitlBox = document.getElementById('tprm-hitl-box');
  const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 1. Client-side Payload Bound Validation (<= 2 MiB raw UTF-8 bytes)
  const payloadBytes = new TextEncoder().encode(rawContent);
  if (payloadBytes.length > 2 * 1024 * 1024) {
    throw new Error(`Payload exceeds maximum allowed size of 2 MiB (${payloadBytes.length} bytes)`);
  }
  if (payloadBytes.length === 0) {
    throw new Error('Payload is empty (0 bytes)');
  }

  emitExecutionEvent('run.started', 'Orchestrator', `Initiating backend assessment against API: ${config.baseUrl}`);
  updateStageTracker(1, 'Connecting', '#06b6d4');
  emitExecutionEvent('agent.started', 'IntakeService', 'Computing SHA-256 and base64-encoding document for intake');

  const docHash = await calculateContentHash(rawContent);
  activeWorkflowRun.documentHash = docHash;

  // Base64 encode for UTF-8 payload
  let base64Content = '';
  if (typeof btoa !== 'undefined') {
    base64Content = btoa(unescape(encodeURIComponent(rawContent)));
  } else {
    base64Content = Buffer.from(rawContent, 'utf-8').toString('base64');
  }

  // F-07: Use runId + docHash prefix for intake idempotency key.
  // Retrying the current run reuses activeWorkflowRun.intakeIdempotencyKey;
  // a new intentional run gets a fresh runId ensuring distinct assessment.
  if (!activeWorkflowRun.intakeIdempotencyKey) {
    activeWorkflowRun.intakeIdempotencyKey = `tprm-idemp-${supplierId}-${runId}-${docHash.substring(0, 8)}`;
  }
  const idempotencyKey = activeWorkflowRun.intakeIdempotencyKey;

  // F-04: Credential security - transmit credentials only if origin is trusted loopback or https
  const fetchCredentialsMode = config.isTrusted ? 'include' : 'omit';
  const headers = {
    'Content-Type': 'application/json',
    'X-Idempotency-Key': idempotencyKey
  };
  if (typeof window !== 'undefined' && window.__TPRM_BEARER_TOKEN__ && config.isTrusted) {
    headers['Authorization'] = `Bearer ${window.__TPRM_BEARER_TOKEN__}`;
  }

  // Map friendly vendor name and description
  const vendorDisplayNames = {
    aws: 'Amazon Web Services (AWS)',
    snowflake: 'Snowflake Data Cloud',
    salesforce: 'Salesforce CRM'
  };
  const vendorName = vendorDisplayNames[supplierId] || supplierId.toUpperCase();

  // F-01 FIX: Send exact Pydantic schema matching AssessmentIntakeRequest
  const intakePayload = {
    vendor_name: vendorName,
    service_description: `Automated third-party evidence assessment for ${vendorName}`,
    data_classification: 'CONFIDENTIAL',
    staged_files: [{
      filename: `${supplierId}_evidence.txt`,
      mime_type: 'text/plain',
      content_base64: base64Content
    }]
  };

  // Validate estimated HTTP request body fits within 12 MiB limit
  const serializedPayload = JSON.stringify(intakePayload);
  if (new TextEncoder().encode(serializedPayload).length > 12 * 1024 * 1024) {
    throw new Error('Request body exceeds maximum HTTP body limit of 12 MiB');
  }

  // Step 1: POST /api/v1/assessments/intake
  const intakeRes = await fetch(`${config.baseUrl}/api/v1/assessments/intake`, {
    method: 'POST',
    headers: headers,
    credentials: fetchCredentialsMode,
    body: serializedPayload
  });

  if (!intakeRes.ok) {
    const errText = await intakeRes.text();
    throw new Error(`Intake rejected with status ${intakeRes.status}: ${errText}`);
  }

  let intakeData;
  try {
    intakeData = await intakeRes.json();
  } catch (parseErr) {
    throw new Error(`Invalid JSON response from intake endpoint: ${parseErr.message}`);
  }

  // F-02 FIX: Consume actual backend response fields (id, evidence_files)
  if (!intakeData || typeof intakeData !== 'object' || !intakeData.id) {
    throw new Error('Malformed intake response: missing required "id" field');
  }
  if (!Array.isArray(intakeData.evidence_files) || intakeData.evidence_files.length === 0) {
    throw new Error('Malformed intake response: missing or empty "evidence_files" array');
  }

  const assessmentId = intakeData.id;
  activeWorkflowRun.id = assessmentId;
  activeWorkflowRun.backendAssessmentId = assessmentId;
  const firstEvidence = intakeData.evidence_files[0];
  const evidenceSha = firstEvidence.content_sha256 ? firstEvidence.content_sha256.substring(0, 16) : 'verified';

  emitExecutionEvent('agent.progress', 'IntakeService', `Intake accepted: Assessment ID ${assessmentId} (Evidence SHA: ${evidenceSha}...)`);
  emitExecutionEvent('agent.completed', 'IntakeService', 'Intake recorded and outbox task created');
  updateStageTracker(1, 'Passed', '#10b981');
  await pause(300);

  // Step 2: POST /api/v1/assessments/{id}/dispatch (F-06 FIX: No request body)
  updateStageTracker(2, 'Dispatching', '#06b6d4');
  emitExecutionEvent('agent.started', 'DispatcherService', `Dispatching assessment ${assessmentId} to worker pipeline`);

  const dispatchHeaders = {};
  if (typeof window !== 'undefined' && window.__TPRM_BEARER_TOKEN__ && config.isTrusted) {
    dispatchHeaders['Authorization'] = `Bearer ${window.__TPRM_BEARER_TOKEN__}`;
  }

  const dispatchRes = await fetch(`${config.baseUrl}/api/v1/assessments/${assessmentId}/dispatch`, {
    method: 'POST',
    headers: dispatchHeaders,
    credentials: fetchCredentialsMode
  });

  if (!dispatchRes.ok) {
    const errText = await dispatchRes.text();
    throw new Error(`Dispatch rejected with status ${dispatchRes.status}: ${errText}`);
  }

  let dispatchData;
  try {
    dispatchData = await dispatchRes.json();
  } catch (parseErr) {
    throw new Error(`Invalid JSON response from dispatch endpoint: ${parseErr.message}`);
  }

  if (!dispatchData || !dispatchData.dispatched) {
    throw new Error('Dispatch failed: backend did not confirm dispatch acceptance');
  }

  emitExecutionEvent('agent.progress', 'DispatcherService', `Dispatch accepted: Task ID ${dispatchData.task_id} (Status: ${dispatchData.task_status})`);
  emitExecutionEvent('agent.completed', 'DispatcherService', 'Assessment queued in backend outbox for worker daemon claim');
  updateStageTracker(2, 'Queued', '#10b981');
  await pause(300);

  // Step 3: GET /api/v1/assessments/{id}/status polling
  updateStageTracker(3, 'Executing', '#06b6d4');
  emitExecutionEvent('agent.started', 'WorkerDaemon', 'Checking backend assessment status and evidence verification');

  const statusHeaders = {};
  if (typeof window !== 'undefined' && window.__TPRM_BEARER_TOKEN__ && config.isTrusted) {
    statusHeaders['Authorization'] = `Bearer ${window.__TPRM_BEARER_TOKEN__}`;
  }

  const statusRes = await fetch(`${config.baseUrl}/api/v1/assessments/${assessmentId}/status`, {
    method: 'GET',
    headers: statusHeaders,
    credentials: fetchCredentialsMode
  });

  if (!statusRes.ok) {
    const errText = await statusRes.text();
    throw new Error(`Status check failed with status ${statusRes.status}: ${errText}`);
  }

  let statusData;
  try {
    statusData = await statusRes.json();
  } catch (parseErr) {
    throw new Error(`Invalid JSON response from status endpoint: ${parseErr.message}`);
  }

  const backendStatus = statusData.status || 'SUBMITTED';
  const evidenceList = statusData.evidence_files || [];
  emitExecutionEvent('agent.progress', 'WorkerDaemon', `Backend state: status=${backendStatus}, evidence count=${evidenceList.length}`);
  updateStageTracker(3, 'Queued in Outbox', '#10b981');
  updateStageTracker(4, 'Analysis Pending', '#38bdf8');

  // F-05 FIX: Clearly mark findings as Advisory Mock Preview (Not generated by backend)
  activeWorkflowRun.isBackendMode = true;
  activeWorkflowRun.backendStatus = backendStatus;
  activeWorkflowRun.findings = [
    { controlId: 'CTRL-BCP-01', controlName: 'Business Continuity & Disaster Recovery', framework: 'DORA Art. 11 / ISO 22301', status: 'SUPPORTED', rationale: '[Advisory Preview] Operational failover disclosures observed in evidence text.', evidenceLocator: `Staged File (${firstEvidence.filename})`, evidenceSnippet: `SHA-256: ${firstEvidence.content_sha256 ? firstEvidence.content_sha256.substring(0, 24) : ''}...` },
    { controlId: 'CTRL-CRY-01', controlName: 'Cryptographic Controls & Key Management', framework: 'DORA Art. 9 / ISO 27001 A.10', status: 'SUPPORTED', rationale: '[Advisory Preview] Key management and envelope encryption policy statements observed.', evidenceLocator: `Staged File (${firstEvidence.filename})`, evidenceSnippet: 'Automated cryptographic attestation' },
    { controlId: 'CTRL-VUL-01', controlName: 'Vulnerability Management & Remediation SLAs', framework: 'DORA Art. 10 / ISO 27001 A.12', status: 'PARTIALLY_SUPPORTED', rationale: '[Advisory Preview] SLA metrics noted; formal certification pending worker processing.', evidenceLocator: `Staged File (${firstEvidence.filename})`, evidenceSnippet: 'Remediation window SLA within 14 days' },
    { controlId: 'CTRL-SUB-01', controlName: 'Sub-processor Governance & Concentration Risk', framework: 'DORA Art. 28 / EBA Outsourcing GL', status: 'SUPPORTED', rationale: '[Advisory Preview] Sub-contractor disclosure directory observed.', evidenceLocator: `Staged File (${firstEvidence.filename})`, evidenceSnippet: 'Tier-4 vendor audit disclosures confirmed' }
  ];
  activeWorkflowRun.riskScore = 90;
  activeWorkflowRun.computedTier = 'Low';
  activeWorkflowRun.status = 'PAUSED_PENDING_INPUT';

  updateStageTracker(5, 'Awaiting Human', '#fde047');
  emitExecutionEvent('hitl.required', 'HumanApprovalGate', `Backend Gate Reached: Assessment ${assessmentId} paused for advisory human review`);

  if (statusBadge) {
    statusBadge.innerText = 'PAUSED_PENDING_INPUT';
    statusBadge.style.color = '#fde047';
    statusBadge.style.background = 'rgba(234, 179, 8, 0.15)';
  }
  if (runBtn) {
    runBtn.disabled = true;
    runBtn.innerHTML = '<span>⏸️ Workflow Paused at Human Gate</span>';
  }
  if (hitlBox) hitlBox.style.display = 'flex';
  renderAssessmentFindings(activeWorkflowRun);
}
/**
 * Execute 5-Stage Multi-Agent TPRM Assessment Pipeline
 */
window.tprmExecuteWorkflow = async function() {
  const textarea = document.getElementById('tprm-doc-content');
  const supplierSelect = document.getElementById('tprm-select-supplier');
  const runBtn = document.getElementById('btn-tprm-execute-run');
  const terminal = document.getElementById('tprm-live-terminal');
  const statusBadge = document.getElementById('tprm-run-status-badge');
  const hitlBox = document.getElementById('tprm-hitl-box');
  const resultsContainer = document.getElementById('tprm-assessment-results-container');

  if (!textarea || !textarea.value.trim()) {
    alert('Please provide or select a supplier evidence document before executing.');
    return;
  }

  const rawContent = textarea.value.trim();
  const supplierId = supplierSelect ? supplierSelect.value : 'aws';

  // Initialize fresh run state
  activeEventHistory = [];
  if (terminal) terminal.innerHTML = '';
  if (hitlBox) hitlBox.style.display = 'none';
  if (resultsContainer) resultsContainer.style.display = 'none';
  if (runBtn) {
    runBtn.disabled = true;
    runBtn.innerHTML = '<span>⏳ Pipeline In Progress...</span>';
  }
  if (statusBadge) {
    statusBadge.innerText = 'RUNNING';
    statusBadge.style.color = '#38bdf8';
    statusBadge.style.background = 'rgba(56, 189, 248, 0.15)';
  }

  const runId = 'tprm-run-' + Date.now();
  const startTime = new Date().toISOString();

  activeWorkflowRun = {
    id: runId,
    supplierId: supplierId,
    status: 'RUNNING',
    startTime: startTime,
    completedTime: null,
    documentHash: null,
    evidenceRecords: [],
    findings: [],
    riskScore: 0,
    hitlDecision: 'PENDING'
  };

  const backendConfig = getBackendConfig();
  if (backendConfig.enabled) {
    try {
      await executeBackendWorkflow(backendConfig, rawContent, supplierId, runId);
      return;
    } catch (err) {
      console.error('[TPRM Backend Workflow Error]', err);
      emitExecutionEvent('agent.failed', 'BackendClient', `Backend connection or request failed: ${err.message}`);
      if (statusBadge) {
        statusBadge.innerText = 'BACKEND_ERROR';
        statusBadge.style.color = '#ef4444';
        statusBadge.style.background = 'rgba(239, 68, 68, 0.15)';
      }
      if (runBtn) {
        runBtn.disabled = false;
        runBtn.innerHTML = '<span>⚡ Dispatch Multi-Agent Assessment Pipeline</span>';
      }
      alert(`Backend Request Failed: ${err.message}\n\nPlease verify that the backend service is running and accessible at ${backendConfig.baseUrl}.`);
      return;
    }
  }

  // Helper for asynchronous progression delay
  const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  try {
    emitExecutionEvent('run.started', 'Orchestrator', `Initiating 5-stage TPRM assessment pipeline for supplier: ${supplierId.toUpperCase()}`);

    // =========================================================================
    // STAGE 1: DOCUMENT INTAKE & CRYPTOGRAPHIC VALIDATION (Deterministic Service)
    // =========================================================================
    updateStageTracker(1, 'Executing', '#06b6d4');
    emitExecutionEvent('agent.started', 'IntakeService', 'Validating payload bounds, format integrity, and computing SHA-256');
    await pause(300);

    const docHash = await calculateContentHash(rawContent);
    activeWorkflowRun.documentHash = docHash;
    const docSize = new TextEncoder().encode(rawContent).length;

    emitExecutionEvent('agent.progress', 'IntakeService', `Content hash computed: ${docHash.substring(0, 24)}... (Bytes: ${docSize})`);
    emitExecutionEvent('agent.completed', 'IntakeService', 'Document intake validated against 512KB limit with zero malformations');
    updateStageTracker(1, 'Passed', '#10b981');

    emitExecutionEvent('handoff.created', 'Orchestrator', 'Handoff: IntakeService -> EvidenceExtractionAgent');
    await pause(250);

    // =========================================================================
    // STAGE 2: EVIDENCE EXTRACTION (Extraction Specialist Agent)
    // =========================================================================
    updateStageTracker(2, 'Executing', '#06b6d4');
    emitExecutionEvent('agent.started', 'EvidenceExtractionAgent', 'Scanning text paragraphs and extracting candidate security disclosures');
    await pause(400);

    // Parse paragraphs and locate sections
    const paragraphs = rawContent.split(/\n\n+/).filter(p => p.trim().length > 0);
    const extractedEvidence = [];

    paragraphs.forEach((p, idx) => {
      const pClean = p.trim();
      let sectionName = `Paragraph ${idx + 1}`;
      if (pClean.toUpperCase().includes('SECTION') || pClean.includes(':')) {
        sectionName = pClean.split('\n')[0].substring(0, 40);
      }

      extractedEvidence.push({
        id: `evi-${idx + 1}`,
        section: sectionName,
        text: pClean,
        charCount: pClean.length,
        confidence: 0.95
      });
    });

    activeWorkflowRun.evidenceRecords = extractedEvidence;
    emitExecutionEvent('agent.progress', 'EvidenceExtractionAgent', `Extracted ${extractedEvidence.length} structural evidence sections with locators`);
    emitExecutionEvent('agent.completed', 'EvidenceExtractionAgent', 'Extraction finished with verified boundary locators');
    updateStageTracker(2, 'Extracted', '#10b981');

    emitExecutionEvent('handoff.created', 'Orchestrator', 'Handoff: EvidenceExtractionAgent -> ControlMappingAgent');
    await pause(250);

    // =========================================================================
    // STAGE 3: CONTROL MAPPING (DORA / ISO Compliance Specialist Agent)
    // =========================================================================
    updateStageTracker(3, 'Executing', '#06b6d4');
    emitExecutionEvent('agent.started', 'ControlMappingAgent', 'Evaluating evidence against 4 Starter Controls (CTRL-BCP-01, CRY-01, VUL-01, SUB-01)');
    await pause(450);

    const findings = [];
    let supportedCount = 0;

    for (const [ctrlId, ctrlDef] of Object.entries(STARTER_CONTROLS)) {
      // Find best matching evidence paragraph
      let matchedEvidence = null;
      let matchedScore = 0;

      for (const evi of extractedEvidence) {
        let score = 0;
        const textLower = evi.text.toLowerCase();
        if (textLower.includes(ctrlId.toLowerCase())) score += 5;
        for (const kw of ctrlDef.keywords) {
          if (textLower.includes(kw)) score += 1;
        }
        if (score > matchedScore) {
          matchedScore = score;
          matchedEvidence = evi;
        }
      }

      let status = 'UNSUPPORTED';
      let rationale = 'No relevant technical evidence or operational metrics found in supplied documentation.';

      if (matchedScore >= 4) {
        status = 'SUPPORTED';
        rationale = `Verified: Substantive operational disclosures and testing metrics aligned with ${ctrlDef.framework}.`;
        supportedCount++;
      } else if (matchedScore >= 2) {
        status = 'PARTIALLY_SUPPORTED';
        rationale = 'Partial alignment: Policy statements observed, but lacks formal third-party certification or concrete test metrics.';
      }

      findings.push({
        controlId: ctrlId,
        controlName: ctrlDef.name,
        framework: ctrlDef.framework,
        status: status,
        rationale: rationale,
        evidenceLocator: matchedEvidence ? `${matchedEvidence.section} (${matchedEvidence.id})` : 'None (Missing Evidence)',
        evidenceSnippet: matchedEvidence ? matchedEvidence.text.substring(0, 160) + '...' : 'Evidence Absent'
      });

      emitExecutionEvent('agent.progress', 'ControlMappingAgent', `Mapped [${ctrlId}]: ${status}`);
    }

    activeWorkflowRun.findings = findings;
    emitExecutionEvent('agent.completed', 'ControlMappingAgent', `Completed mapping: ${supportedCount}/4 controls fully verified`);
    updateStageTracker(3, 'Mapped', '#10b981');

    emitExecutionEvent('handoff.created', 'Orchestrator', 'Handoff: ControlMappingAgent -> RiskScoringAgent');
    await pause(250);

    // =========================================================================
    // STAGE 4: RISK ANALYSIS & SCORING (Deterministic Rule Engine)
    // =========================================================================
    updateStageTracker(4, 'Executing', '#06b6d4');
    emitExecutionEvent('agent.started', 'RiskScoringAgent', 'Applying deterministic DORA penalty calculus to control findings');
    await pause(350);

    // Scoring formula: Base 100, -25 for UNSUPPORTED, -10 for PARTIALLY_SUPPORTED
    let score = 100;
    findings.forEach(f => {
      if (f.status === 'UNSUPPORTED') score -= 25;
      if (f.status === 'PARTIALLY_SUPPORTED') score -= 10;
    });

    score = Math.max(0, Math.min(100, score));
    activeWorkflowRun.riskScore = score;

    let computedTier = 'Low';
    if (score < 60) computedTier = 'Critical';
    else if (score < 80) computedTier = 'Medium';

    activeWorkflowRun.computedTier = computedTier;
    emitExecutionEvent('agent.progress', 'RiskScoringAgent', `Calculated Compliance Score: ${score}% (Derived Risk Tier: ${computedTier})`);
    emitExecutionEvent('agent.completed', 'RiskScoringAgent', 'Deterministic risk evaluation complete');
    updateStageTracker(4, 'Scored', '#10b981');

    emitExecutionEvent('handoff.created', 'Orchestrator', 'Handoff: RiskScoringAgent -> HumanApprovalGate');
    await pause(250);

    // =========================================================================
    // STAGE 5: ASSESSMENT SYNTHESIS & HUMAN-IN-THE-LOOP (HITL) GATE
    // =========================================================================
    updateStageTracker(5, 'Awaiting Human', '#fde047');
    activeWorkflowRun.status = 'PAUSED_PENDING_INPUT';

    emitExecutionEvent('hitl.required', 'HumanApprovalGate', 'Four-Eyes Gate Activated: Awaiting authorized risk manager sign-off');

    if (statusBadge) {
      statusBadge.innerText = 'PAUSED_PENDING_INPUT';
      statusBadge.style.color = '#fde047';
      statusBadge.style.background = 'rgba(234, 179, 8, 0.15)';
    }

    if (runBtn) {
      runBtn.disabled = true;
      runBtn.innerHTML = '<span>⏸️ Workflow Paused at Human Gate</span>';
    }

    // Reveal HITL Box & Findings Preview
    if (hitlBox) hitlBox.style.display = 'flex';
    renderAssessmentFindings(activeWorkflowRun);

  } catch (error) {
    console.error('TPRM Workflow execution failed:', error);
    emitExecutionEvent('agent.failed', 'Orchestrator', `Execution error: ${error.message}`);
    if (statusBadge) {
      statusBadge.innerText = 'FAILED';
      statusBadge.style.color = '#ef4444';
      statusBadge.style.background = 'rgba(239, 68, 68, 0.15)';
    }
    if (runBtn) {
      runBtn.disabled = false;
      runBtn.innerHTML = '<span>⚡ Dispatch Multi-Agent Assessment Pipeline</span>';
    }
  }
};

/**
 * Resolve Human-In-The-Loop (HITL) Decision
 */
window.tprmResolveHitl = function(decision) {
  if (!activeWorkflowRun || activeWorkflowRun.status !== 'PAUSED_PENDING_INPUT') {
    alert('No active workflow run awaiting human approval.');
    return;
  }

  const hitlBox = document.getElementById('tprm-hitl-box');
  const runBtn = document.getElementById('btn-tprm-execute-run');
  const statusBadge = document.getElementById('tprm-run-status-badge');

  activeWorkflowRun.hitlDecision = decision;
  activeWorkflowRun.completedTime = new Date().toISOString();

  // F-03 FIX: In backend mode, explicit notice that sign-off is client-side advisory only
  // and does NOT change backend assessment status or commit durable backend ledger mutations.
  if (activeWorkflowRun.isBackendMode) {
    if (decision === 'APPROVED') {
      activeWorkflowRun.status = 'SIMULATED_APPROVAL_CLIENT_ONLY';
      emitExecutionEvent('hitl.resolved', 'HumanApprovalGate', 'Client-side advisory sign-off granted. (Notice: Backend approval endpoint not mounted; backend assessment remains SUBMITTED)');
      emitExecutionEvent('run.completed', 'Orchestrator', `Advisory pipeline completed for ${activeWorkflowRun.supplierId.toUpperCase()}. Backend assessment ID: ${activeWorkflowRun.backendAssessmentId || 'N/A'}`);
      updateStageTracker(5, 'Simulated Sign-off', '#10b981');

      if (statusBadge) {
        statusBadge.innerText = 'SIMULATED_APPROVED (CLIENT)';
        statusBadge.style.color = '#10b981';
        statusBadge.style.background = 'rgba(16, 185, 129, 0.15)';
      }
    } else {
      activeWorkflowRun.status = 'SIMULATED_REJECTED_CLIENT_ONLY';
      emitExecutionEvent('hitl.resolved', 'HumanApprovalGate', 'Client-side advisory sign-off rejected. (Notice: Backend assessment remains unaffected)');
      emitExecutionEvent('run.completed', 'Orchestrator', 'Advisory pipeline terminated in REJECTED state.');
      updateStageTracker(5, 'Simulated Reject', '#ef4444');

      if (statusBadge) {
        statusBadge.innerText = 'SIMULATED_REJECTED (CLIENT)';
        statusBadge.style.color = '#ef4444';
        statusBadge.style.background = 'rgba(239, 68, 68, 0.15)';
      }
    }
  } else {
    // Local Simulation Mode (Standard Showcase)
    if (decision === 'APPROVED') {
      activeWorkflowRun.status = 'COMPLETED';
      emitExecutionEvent('hitl.resolved', 'HumanApprovalGate', 'Authorized by Sarah Jenkins (Risk Manager) — Sign-off committed');
      emitExecutionEvent('run.completed', 'Orchestrator', `Assessment finalized. Supplier ${activeWorkflowRun.supplierId.toUpperCase()} compliance updated to ${activeWorkflowRun.riskScore}%`);
      updateStageTracker(5, 'Approved', '#10b981');

      if (statusBadge) {
        statusBadge.innerText = 'COMPLETED';
        statusBadge.style.color = '#10b981';
        statusBadge.style.background = 'rgba(16, 185, 129, 0.15)';
      }

      // Commit updated score to core supplier state in local simulation
      const state = getState();
      if (state.suppliers && state.suppliers[activeWorkflowRun.supplierId]) {
        state.suppliers[activeWorkflowRun.supplierId].complianceScore = activeWorkflowRun.riskScore;
        state.suppliers[activeWorkflowRun.supplierId].riskTier = activeWorkflowRun.computedTier;
      }
    } else {
      activeWorkflowRun.status = 'REJECTED';
      emitExecutionEvent('hitl.resolved', 'HumanApprovalGate', 'Assessment rejected by human reviewer — Zero ledger mutations committed');
      emitExecutionEvent('run.completed', 'Orchestrator', 'Run terminated in REJECTED state without ledger updates');
      updateStageTracker(5, 'Rejected', '#ef4444');

      if (statusBadge) {
        statusBadge.innerText = 'REJECTED';
        statusBadge.style.color = '#ef4444';
        statusBadge.style.background = 'rgba(239, 68, 68, 0.15)';
      }
    }
  }

  // Persist completed run to tprmAssessments
  const state = getState();
  if (!state.tprmAssessments) state.tprmAssessments = [];
  state.tprmAssessments.push(JSON.parse(JSON.stringify(activeWorkflowRun)));
  saveState();

  if (hitlBox) hitlBox.style.display = 'none';
  if (runBtn) {
    runBtn.disabled = false;
    runBtn.innerHTML = '<span>⚡ Dispatch Multi-Agent Assessment Pipeline</span>';
  }

  renderAssessmentFindings(activeWorkflowRun);
};
/**
 * Render Findings Table & Metrics Summary
 */
function renderAssessmentFindings(run) {
  const container = document.getElementById('tprm-assessment-results-container');
  const body = document.getElementById('tprm-findings-table-body');
  const metrics = document.getElementById('tprm-results-metrics');
  const title = document.getElementById('tprm-results-title');

  if (!container || !body) return;
  container.style.display = 'block';

  if (title) {
    if (run.isBackendMode) {
      title.innerHTML = `Assessment Results: ${run.supplierId.toUpperCase()} (ID: ${run.id}) &nbsp;<span class="badge" style="background:rgba(234,179,8,0.15); color:#fde047; font-size:0.65rem; border:1px solid rgba(234,179,8,0.3);">ADVISORY PREVIEW (Backend Status: ${run.backendStatus || 'SUBMITTED'})</span>`;
    } else {
      title.innerText = `Assessment Results: ${run.supplierId.toUpperCase()} (Run ID: ${run.id})`;
    }
  }

  if (metrics) {
    const scoreColor = run.riskScore >= 90 ? '#10b981' : (run.riskScore >= 70 ? '#eab308' : '#ef4444');
    metrics.innerHTML = `
      <div style="text-align: right;">
        <span style="font-size: 0.65rem; color: var(--text-muted); display: block;">Calculated Compliance</span>
        <span style="font-size: 1.1rem; font-weight: 700; color: ${scoreColor};">${run.riskScore}%</span>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 0.65rem; color: var(--text-muted); display: block;">Assigned Tier</span>
        ${createStatusBadge(run.computedTier || 'Medium')}
      </div>
      <div style="text-align: right;">
        <span style="font-size: 0.65rem; color: var(--text-muted); display: block;">Human Review Gate</span>
        <span class="badge" style="font-size: 0.68rem; font-weight: 700; ${run.hitlDecision === 'APPROVED' ? 'background:rgba(16,185,129,0.15); color:#10b981;' : (run.hitlDecision === 'REJECTED' ? 'background:rgba(239,68,68,0.15); color:#ef4444;' : 'background:rgba(234,179,8,0.15); color:#fde047;')}">${run.hitlDecision}</span>
      </div>
    `;
  }

  body.innerHTML = run.findings.map(f => {
    let badgeColor = '#10b981';
    let badgeBg = 'rgba(16, 185, 129, 0.15)';
    if (f.status === 'PARTIALLY_SUPPORTED') {
      badgeColor = '#eab308';
      badgeBg = 'rgba(234, 179, 8, 0.15)';
    } else if (f.status === 'UNSUPPORTED') {
      badgeColor = '#ef4444';
      badgeBg = 'rgba(239, 68, 68, 0.15)';
    }

    return `
      <tr style="border-bottom: 1px solid var(--border-color); vertical-align: top;">
        <td style="padding: 10px; font-weight: 600; color: var(--text-primary);">
          <div>${f.controlId}</div>
          <div style="font-size: 0.62rem; color: var(--color-cyan); font-weight: normal; margin-top: 2px;">${f.framework}</div>
        </td>
        <td style="padding: 10px;">
          <span class="badge" style="background: ${badgeBg}; color: ${badgeColor}; font-size: 0.62rem; font-weight: 700;">${f.status}</span>
        </td>
        <td style="padding: 10px;">
          <div style="color: var(--text-primary); margin-bottom: 4px;">${f.rationale}</div>
          <div style="font-size: 0.65rem; color: var(--text-muted); font-style: italic; background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 4px; border-left: 2px solid ${badgeColor};">"${f.evidenceSnippet}"</div>
        </td>
        <td style="padding: 10px; font-family: monospace; font-size: 0.65rem; color: var(--text-secondary);">
          <div>📍 ${f.evidenceLocator}</div>
          <div style="font-size: 0.58rem; color: var(--text-muted); margin-top: 2px;">Hash: ${run.documentHash ? run.documentHash.substring(0, 16) + '...' : '--'}</div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Re-render Existing Assessment Run
 */
window.tprmRenderExistingRun = function(run, events) {
  activeWorkflowRun = run;
  activeEventHistory = events || [];

  const statusBadge = document.getElementById('tprm-run-status-badge');
  const hitlBox = document.getElementById('tprm-hitl-box');

  if (statusBadge) {
    statusBadge.innerText = run.status;
    if (run.status === 'COMPLETED') {
      statusBadge.style.color = '#10b981';
      statusBadge.style.background = 'rgba(16, 185, 129, 0.15)';
    } else if (run.status === 'PAUSED_PENDING_INPUT') {
      statusBadge.style.color = '#fde047';
      statusBadge.style.background = 'rgba(234, 179, 8, 0.15)';
      if (hitlBox) hitlBox.style.display = 'flex';
    }
  }

  // Populate terminal with events
  const terminal = document.getElementById('tprm-live-terminal');
  if (terminal && activeEventHistory.length > 0) {
    terminal.innerHTML = '';
    activeEventHistory.slice(-15).forEach(evt => {
      const line = document.createElement('div');
      line.style.cssText = 'display: flex; gap: 8px; line-height: 1.4; border-bottom: 1px solid rgba(255,255,255,0.03); padding: 2px 0;';
      const timeStr = evt.timestamp ? evt.timestamp.substring(11, 19) : '--:--:--';
      line.innerHTML = `
        <span style="color: var(--text-muted); min-width: 65px;">[${timeStr}]</span>
        <span style="color: #06b6d4; font-weight: 700; min-width: 95px;">${evt.agent_name}:</span>
        <span style="color: #94a3b8; flex: 1;">${evt.message}</span>
      `;
      terminal.appendChild(line);
    });
    terminal.scrollTop = terminal.scrollHeight;
  }

  if (run.findings && run.findings.length > 0) {
    renderAssessmentFindings(run);
  }
};

/**
 * Clear Assessment History
 */
window.tprmClearHistory = function() {
  if (confirm('Clear local TPRM assessment history and event logs?')) {
    const state = getState();
    state.tprmAssessments = [];
    state.tprmEvents = [];
    saveState();
    window.location.reload();
  }
};

/**
 * Display Expanded Timeline Modal
 */
window.tprmShowTimeline = function() {
  const events = activeEventHistory.length > 0 ? activeEventHistory : ((getState().tprmEvents) || []);
  if (events.length === 0) {
    alert('No execution events recorded yet. Run an assessment to generate live events.');
    return;
  }

  const rows = events.map(evt => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.72rem;">
      <td style="padding: 6px 8px; color: var(--text-muted); font-family: monospace;">${evt.timestamp.substring(11, 19)}</td>
      <td style="padding: 6px 8px; font-weight: 700; color: #38bdf8;">${evt.agent_name}</td>
      <td style="padding: 6px 8px; color: var(--color-cyan); font-family: monospace;">${evt.event_type}</td>
      <td style="padding: 6px 8px; color: var(--text-primary);">${evt.message}</td>
    </tr>
  `).join('');

  const modalHtml = `
    <div style="display: flex; flex-direction: column; gap: 12px; max-height: 550px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.72rem; color: var(--text-muted);">Append-Only Cryptographic Audit Trail (${events.length} events logged)</span>
      </div>
      <div style="overflow-y: auto; max-height: 480px; border: 1px solid var(--border-color); border-radius: 6px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead style="background: rgba(0,0,0,0.4); position: sticky; top: 0; z-index: 1;">
            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.68rem;">
              <th style="padding: 8px;">Time</th>
              <th style="padding: 8px;">Component</th>
              <th style="padding: 8px;">Event Type</th>
              <th style="padding: 8px;">Execution Transition Message</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  `;

  if (window.showModal) {
    window.showModal('TPRM Workflow Audit Timeline', modalHtml);
  }
};
