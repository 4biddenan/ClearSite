/**
 * app.js — ClearSite West Island
 * Handles: tab panel state, FAQ accordion, service tier card clicks
 */
'use strict';

// ---------------------------------------------------------------------------
// Tab Controller
// ---------------------------------------------------------------------------
function switchControlPanelState(targetState) {
  const tabs = ['quote', 'book', 'contact'];
  tabs.forEach(t => {
    const btn   = document.getElementById(`tab-btn-${t}`);
    const panel = document.getElementById(`panel-state-${t}`);
    if (!btn || !panel) return;

    if (t === targetState) {
      btn.classList.add('tab-active');
      btn.classList.remove('tab-inactive');
      btn.setAttribute('aria-selected', 'true');
      panel.classList.remove('d-none');
    } else {
      btn.classList.remove('tab-active');
      btn.classList.add('tab-inactive');
      btn.setAttribute('aria-selected', 'false');
      panel.classList.add('d-none');
    }
  });
}

// ---------------------------------------------------------------------------
// DOMContentLoaded — FAQ accordion + tier cards
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

  // 1. Initialise all accordions collapsed
  document.querySelectorAll('.faq-accordion-item').forEach(accordion => {
    const header  = accordion.querySelector('.heading');
    const content = accordion.querySelector('.accordion-content');
    const icon    = accordion.querySelector('.icon');
    if (header && content && icon) {
      header.setAttribute('aria-expanded', 'false');
      content.classList.remove('expanded');
      icon.classList.remove('expanded-icon');
    }
  });

  // 2. Accordion click listeners
  document.querySelectorAll('.faq-accordion-item .heading').forEach(header => {
    header.addEventListener('click', () => {
      const isExpanded = header.getAttribute('aria-expanded') === 'true';
      const contentId  = header.getAttribute('aria-controls');
      const content    = document.getElementById(contentId);
      const icon       = header.querySelector('.icon');

      if (isExpanded) {
        header.setAttribute('aria-expanded', 'false');
        content.classList.remove('expanded');
        if (icon) icon.classList.remove('expanded-icon');
      } else {
        header.setAttribute('aria-expanded', 'true');
        content.classList.add('expanded');
        if (icon) icon.classList.add('expanded-icon');
      }
    });
  });

  // 3. Service tier card click → pricing engine
  const tiersList = ['level_1_unprepared', 'level_2_curbside', 'level_3_meeting', 'level_4_copilot'];
  tiersList.forEach(tierKey => {
    const cardEl = document.getElementById('service-card-' + tierKey);
    if (cardEl) {
      cardEl.style.cursor = 'pointer';
      cardEl.addEventListener('click', () => {
        if (window.ClearSiteEngine) {
          window.ClearSiteEngine.selectedTier = tierKey;
          window.ClearSiteEngine.calculateAndRender();
        }
      });
    }
  });

  // 4. Activate the first tab (quote) on load
  switchControlPanelState('quote');

  // 5. Two-way binding for the Service Tier dropdown selector
  const selTierEl = document.getElementById('sel-tier');
  if (selTierEl) {
    selTierEl.addEventListener('change', (e) => {
      if (window.ClearSiteEngine) {
        window.ClearSiteEngine.selectedTier = e.target.value;
        window.ClearSiteEngine.calculateAndRender();
      }
    });
  }

});

