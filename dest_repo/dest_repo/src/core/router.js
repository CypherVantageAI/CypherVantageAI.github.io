// ==========================================================================
// Cypher Vantage - Core Navigation Router (ES6 Module)
// ==========================================================================

import { getState, saveState } from './db.js';

// Import module renderers dynamically to trigger view refreshes
import { renderExecutiveDashboard } from '../modules/dashboard.js?v=2.0.1';
import { renderResilienceModule } from '../modules/resilience.js?v=2.0.1';
import { renderDoraModule } from '../modules/dora.js?v=2.0.1';
import { renderIctRiskModule } from '../modules/ictrisk.js?v=2.0.1';
import { renderThirdPartyModule } from '../modules/thirdparty.js?v=2.0.1';
import { renderReportsModule } from '../modules/reports.js?v=2.0.1';
import { renderAiGovernanceModule } from '../modules/aigovernance.js?v=2.0.1';
import { renderAnalystModule } from '../modules/analyst.js?v=2.0.1';
import { renderCommandCentre } from '../modules/commandcentre.js?v=2.0.1';
import { renderEaiosModule } from '../eaios/eaios-view.js';


export function switchTab(tabId) {
  // Redirect legacy tabs to new modular pages
  if (tabId === 'manager-suppliers') {
    tabId = 'manager-thirdparty';
  } else if (tabId === 'manager-compliance') {
    tabId = 'manager-dora';
  }

  const state = getState();
  console.log(`[Router] Routing to tab: ${tabId}`);

  // Hide all content panes
  document.querySelectorAll('.content-pane').forEach(pane => {
    pane.classList.remove('active');
  });

  // Deactivate all nav links (items and sub-items)
  document.querySelectorAll('.nav-item, .nav-sub-item').forEach(item => {
    item.classList.remove('active');
  });

  // Show target content pane
  const targetPane = document.getElementById(`view-${tabId}`);
  if (targetPane) {
    targetPane.classList.add('active');
  }

  // Set active class on navbar link
  const activeNav = document.getElementById(`nav-${tabId}`);
  if (activeNav) {
    activeNav.classList.add('active');
  }

  // Auto-collapse sidebar after user selects a menu item
  const sidebar = document.querySelector('.app-sidebar');
  if (sidebar) {
    sidebar.classList.add('collapsed');
    // Ensure sidebar remains hidden only if target pane is explicitly in fullscreen mode
    if (targetPane && targetPane.classList.contains('view-fullscreen-mode')) {
      sidebar.style.display = 'none';
    } else {
      sidebar.style.display = '';
    }
  }

  // If a tab switch occurs while another pane is in fullscreen mode, clean up pointer freeze states
  document.querySelectorAll('.content-pane').forEach(pane => {
    if (pane.id !== `view-${tabId}` && pane.classList.contains('view-fullscreen-mode')) {
      pane.classList.remove('view-fullscreen-mode');
      pane.style.pointerEvents = 'auto';
      pane.style.overflow = '';
    }
  });
  if (document.fullscreenElement && (!targetPane || !targetPane.classList.contains('view-fullscreen-mode'))) {
    document.exitFullscreen().catch(() => {});
  }

  // Trigger module-specific rendering pipelines
  switch (tabId) {
    case 'manager-dashboard':
      renderExecutiveDashboard();
      break;
    case 'manager-command-centre':
      renderCommandCentre();
      break;
    case 'manager-resilience':
      renderResilienceModule();
      break;
    case 'manager-dora':
      renderDoraModule();
      break;
    case 'manager-risk':
      renderIctRiskModule();
      break;
    case 'manager-thirdparty':
      renderThirdPartyModule();
      break;
    case 'manager-reports':
      renderReportsModule();
      break;
    case 'manager-eaios':
      renderEaiosModule();
      break;

    // Advanced legacy modules retained inside the shell
    case 'manager-navigator':
      if (typeof window.renderServiceNavigator === 'function') {
        window.renderServiceNavigator();
      }
      break;
    case 'manager-actions':
      if (typeof window.renderManagerActions === 'function') {
        window.renderManagerActions();
      }
      break;
    case 'manager-collector':
      if (typeof window.updateCollectorDropdown === 'function') {
        window.updateCollectorDropdown();
      }
      break;
    case 'manager-advisor':
      renderAnalystModule();
      break;
    case 'manager-ai-risk':
      renderAiGovernanceModule();
      break;
    case 'manager-obligations':
      if (typeof window.renderSCOAccordion === 'function') {
        window.renderSCOAccordion();
      }
      break;
    case 'manager-inbox':
      if (typeof window.renderManagerInbox === 'function') {
        window.renderManagerInbox();
      }
      break;

    // Supplier Persona Tabs
    case 'supplier-vulns':
    case 'supplier-compliance':
      state.activeSupplierSubTab = tabId === 'supplier-vulns' ? 'vulns' : 'compliance';
      const supplierDashboard = document.getElementById('view-supplier-dashboard');
      if (supplierDashboard) supplierDashboard.classList.add('active');
      const supplierNav = document.getElementById(`nav-${tabId}`);
      if (supplierNav) supplierNav.classList.add('active');
      
      if (typeof window.renderSupplierPortalDashboard === 'function') {
        window.renderSupplierPortalDashboard();
      }
      break;
    case 'supplier-evidence':
      if (typeof window.renderSupplierVaultTable === 'function') {
        window.renderSupplierVaultTable();
      }
      break;
    case 'supplier-obligations':
      if (typeof window.renderSCOAccordion === 'function') {
        window.renderSCOAccordion();
      }
      break;
  }

  // Scroll details back to top
  const mainContent = document.querySelector('.main-content');
  if (mainContent) mainContent.scrollTop = 0;
}

/**
 * Handle Switching Personas (Risk Manager vs Supplier Portal)
 */
export function setPersona(persona) {
  const state = getState();
  state.activePersona = persona;

  const btnManager = document.getElementById('btn-persona-manager');
  const btnSupplier = document.getElementById('btn-persona-supplier');
  const navManager = document.getElementById('nav-group-manager');
  const navSupplier = document.getElementById('nav-group-supplier');
  const supplierSelector = document.getElementById('supplier-selector-container');
  const userRoleText = document.getElementById('user-role-name');
  const userAvatar = document.querySelector('.user-avatar');

  const brandTagline = document.querySelector('.brand-tagline');

  if (persona === 'manager') {
    if (btnManager) btnManager.classList.add('active');
    if (btnSupplier) btnSupplier.classList.remove('active');
    if (navManager) navManager.classList.remove('hidden');
    if (navSupplier) navSupplier.classList.add('hidden');
    if (supplierSelector) supplierSelector.containerId ? null : supplierSelector.classList.add('hidden');
    if (brandTagline) brandTagline.style.display = 'block';
    if (userRoleText) userRoleText.innerText = 'Sarah Jenkins';
    if (userAvatar) {
      userAvatar.innerText = 'RM';
      userAvatar.style.background = 'var(--gradient-accent)';
    }
    switchTab('manager-dashboard');
  } else {
    if (btnManager) btnManager.classList.remove('active');
    if (btnSupplier) btnSupplier.classList.add('active');
    if (navManager) navManager.classList.add('hidden');
    if (navSupplier) navSupplier.classList.remove('hidden');
    if (supplierSelector) supplierSelector.classList.remove('hidden');
    if (brandTagline) brandTagline.style.display = 'none';
    
    if (typeof window.populateSupplierPortalSwitcher === 'function') {
      window.populateSupplierPortalSwitcher();
      window.updateSupplierPortalIdentity();
    }
    switchTab('supplier-vulns');
  }
  saveState();
}

// Bind to window for global inline event triggers
window.switchTab = switchTab;
window.setPersona = setPersona;
