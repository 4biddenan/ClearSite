/**
 * ClearSite Solutions - Services Page Interaction Controller
 */

class ClearSiteServicesController {
  constructor() {
    this.waivers = null;
    this.init();
  }

  async init() {
    try {
      // Ingest legal waivers
      const response = await fetch('../config/legal-waivers.json');
      this.waivers = await response.json();
      
      this.renderWaivers();
      this.registerEventListeners();
      this.handleInitialHash();
    } catch (error) {
      console.error("[ClearSite Services Error] Failed to load waivers configuration:", error);
    }
  }

  registerEventListeners() {
    // Service Accordion Triggers
    for (let i = 1; i <= 4; i++) {
      const btn = document.getElementById(`accordion-header-${i}`);
      if (btn) {
        btn.addEventListener('click', () => this.toggleAccordion(i));
      }
    }

    // FAQ Accordion Triggers
    for (let i = 1; i <= 7; i++) {
      const btn = document.getElementById(`faq-header-${i}`);
      if (btn) {
        btn.addEventListener('click', () => this.toggleFaq(i));
      }
    }

    // Language Toggle Listeners (hook in after translations are applied)
    const enBtn = document.getElementById('lang-toggle-en');
    const frBtn = document.getElementById('lang-toggle-fr');
    
    if (enBtn) {
      enBtn.addEventListener('click', () => {
        setTimeout(() => this.renderWaivers(), 50);
      });
    }
    if (frBtn) {
      frBtn.addEventListener('click', () => {
        setTimeout(() => this.renderWaivers(), 50);
      });
    }

    // Intercept local hash link clicks
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          this.scrollToElement(targetEl);
        }
      });
    });
  }

  renderWaivers() {
    if (!this.waivers) return;
    
    const activeLang = window.ClearSiteI18n ? window.ClearSiteI18n.currentLang : 'en';


    // Render individual tier waivers inside the open accordions
    for (let i = 1; i <= 4; i++) {
      const tierKeys = ['level_1_unprepared', 'level_2_curbside', 'level_3_meeting', 'level_4_copilot'];
      const tierKey = tierKeys[i - 1];
      const waiverTextEl = document.getElementById(`tier-waiver-text-${i}`);
      if (waiverTextEl && this.waivers.tier_waivers[tierKey]) {
        waiverTextEl.innerText = this.waivers.tier_waivers[tierKey][activeLang] || '';
      }
    }
  }

  toggleAccordion(index) {
    const panelsCount = 4;
    for (let i = 1; i <= panelsCount; i++) {
      const btn = document.getElementById(`accordion-header-${i}`);
      const panel = document.getElementById(`accordion-content-${i}`);
      const chevron = document.getElementById(`chevron-${i}`);
      const card = document.getElementById(`service-card-${i}`);
      
      if (i === index) {
        const isExpanded = panel.classList.contains('expanded');
        if (isExpanded) {
          panel.classList.remove('expanded');
          btn.setAttribute('aria-expanded', 'false');
          if (chevron) chevron.classList.remove('rotated');
          if (card) card.classList.remove('border-l-4', 'border-l-brandEmerald', 'scale-[1.01]', 'shadow-md');
          if (card) card.classList.add('shadow-sm');
        } else {
          panel.classList.add('expanded');
          btn.setAttribute('aria-expanded', 'true');
          if (chevron) chevron.classList.add('rotated');
          if (card) card.classList.add('border-l-4', 'border-l-brandEmerald', 'scale-[1.01]', 'shadow-md');
          if (card) card.classList.remove('shadow-sm');
        }
      } else {
        // Collapse all others
        if (panel) panel.classList.remove('expanded');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        if (chevron) chevron.classList.remove('rotated');
        if (card) card.classList.remove('border-l-4', 'border-l-brandEmerald', 'scale-[1.01]', 'shadow-md');
        if (card) card.classList.add('shadow-sm');
      }
    }
  }

  toggleFaq(index) {
    const faqCount = 7;
    for (let i = 1; i <= faqCount; i++) {
      const btn = document.getElementById(`faq-header-${i}`);
      const panel = document.getElementById(`faq-content-${i}`);
      const chevron = document.getElementById(`faq-chevron-${i}`);
      
      if (i === index) {
        const isExpanded = panel.classList.contains('expanded');
        if (isExpanded) {
          panel.classList.remove('expanded');
          btn.setAttribute('aria-expanded', 'false');
          if (chevron) chevron.classList.remove('rotated');
        } else {
          panel.classList.add('expanded');
          btn.setAttribute('aria-expanded', 'true');
          if (chevron) chevron.classList.add('rotated');
        }
      } else {
        if (panel) panel.classList.remove('expanded');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        if (chevron) chevron.classList.remove('rotated');
      }
    }
  }

  handleInitialHash() {
    const hash = location.hash;
    if (hash) {
      setTimeout(() => {
        const targetEl = document.querySelector(hash);
        if (targetEl) {
          // If the element is within a collapsed accordion, open it
          const faqContent = targetEl.closest('.accordion-content');
          if (faqContent) {
            const indexMatch = faqContent.id.match(/\d+$/);
            if (indexMatch) {
              const idx = parseInt(indexMatch[0]);
              if (faqContent.id.startsWith('faq-content')) {
                this.toggleFaq(idx);
              } else if (faqContent.id.startsWith('accordion-content')) {
                this.toggleAccordion(idx);
              }
            }
          }
          this.scrollToElement(targetEl);
        }
      }, 300); // Small timeout to ensure DOM and translations are ready
    }
  }

  scrollToElement(element) {
    const headerHeight = 64; // Sticky nav height offset
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - headerHeight - 16; // Extra breathing room

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }
}

// Boot controller
document.addEventListener('DOMContentLoaded', () => {
  window.ClearSiteServices = new ClearSiteServicesController();
});
