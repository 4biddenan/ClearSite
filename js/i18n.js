/**
 * ClearSite Solutions - Internationalization Engine (i18n)
 * Handles client-side bilingual translation mapping between English and French
 */

class ClearSiteI18n {
  constructor() {
    this.translations = null;
    this.currentLang = localStorage.getItem('clearsite_lang') || 'en';
    this.init();
  }

  t(key, fallback = '') {
    if (!this.translations || !this.translations[this.currentLang]) {
      return fallback;
    }
    return this.translations[this.currentLang][key] || fallback;
  }

  async init() {
    try {
      const response = await fetch('../config/translations.json');
      this.translations = await response.json();
      this.applyLanguage();
      this.setupToggles();
    } catch (error) {
      console.error("[ClearSite i18n Error] Failed to load translations:", error);
    }
  }

  setupToggles() {
    const enBtn = document.getElementById('lang-toggle-en');
    const frBtn = document.getElementById('lang-toggle-fr');
    
    if (enBtn) {
      enBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.currentLang !== 'en') {
          this.currentLang = 'en';
          localStorage.setItem('clearsite_lang', 'en');
          this.applyLanguage();
        }
      });
    }
    
    if (frBtn) {
      frBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.currentLang !== 'fr') {
          this.currentLang = 'fr';
          localStorage.setItem('clearsite_lang', 'fr');
          this.applyLanguage();
        }
      });
    }
  }

  applyLanguage() {
    if (!this.translations) return;
    const dict = this.translations[this.currentLang];
    if (!dict) return;

    // Update document language tag
    document.documentElement.lang = this.currentLang;

    // Update document title
    if (dict['site_title']) {
      document.title = dict['site_title'];
    }

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && dict['site_meta_desc']) {
      metaDesc.setAttribute('content', dict['site_meta_desc']);
    }

    // Update static elements decorated with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[key];
        } else {
          el.innerHTML = dict[key];
        }
      }
    });

    // Update the visual state of the toggle buttons in header
    const enToggleBtn = document.getElementById('lang-toggle-en');
    const frToggleBtn = document.getElementById('lang-toggle-fr');
    if (enToggleBtn && frToggleBtn) {
      if (this.currentLang === 'en') {
        enToggleBtn.className = "px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-brandEmerald text-white shadow-sm transition-all";
        frToggleBtn.className = "px-3 py-1 text-xs font-semibold uppercase rounded-full text-slate-500 hover:text-brandNavy transition-all";
      } else {
        enToggleBtn.className = "px-3 py-1 text-xs font-semibold uppercase rounded-full text-slate-500 hover:text-brandNavy transition-all";
        frToggleBtn.className = "px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-brandEmerald text-white shadow-sm transition-all";
      }
    }

    // Dynamic Updates trigger for Carousel
    if (window.ClearSiteCarousel && window.ClearSiteCarousel.slidesData && window.ClearSiteCarousel.slidesData.length) {
      window.ClearSiteCarousel.renderCurrentSlide();
    }

    // Dynamic Updates trigger for Pricing Engine (also redraws town list, waivers, cost display)
    if (window.ClearSiteEngine && window.ClearSiteEngine.config) {
      window.ClearSiteEngine.calculateAndRender();
    }
  }
}

// Instantiate i18n manager immediately on page load
document.addEventListener('DOMContentLoaded', () => {
  window.ClearSiteI18n = new ClearSiteI18n();
});

// Global translation & alert helper to simplify inline HTML handlers
window.showAlert = (key, fallback) => {
  const msg = window.ClearSiteI18n
    ? window.ClearSiteI18n.t(key, fallback)
    : fallback;
  alert(msg);
};
