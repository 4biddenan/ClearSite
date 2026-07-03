/**
 * ClearSite Solutions - Fluid Carousel State Controller
 * Handles native mobile transitions, asset injections, and synchronized UI bridges
 */

class ClearSiteCarousel {
  constructor() {
    this.slidesData = [];
    this.currentIndex = 2; // Default to On-Site Disposal Meeting (Popular Savings)
    this.init();
  }

  async init() {
    try {
      const response = await fetch('../config/carousel-slides.json');
      const data = await response.json();
      this.slidesData = data.slides;
      
      this.cacheElements();
      this.renderCurrentSlide();
    } catch (error) {
      console.error("[ClearSite UI Error] Failed to load slide arrays:", error);
    }
  }

  cacheElements() {
    this.elFrame = document.getElementById('carousel-frame');
    this.elBadge = document.getElementById('slide-badge');
    this.elTitle = document.getElementById('slide-title');
    this.elYou = document.getElementById('slide-copy-you');
    this.elWe = document.getElementById('slide-copy-we');
    this.elIndicators = document.getElementById('carousel-indicators');
  }

  renderCurrentSlide() {
    if (!this.slidesData.length) return;
    const slide = this.slidesData[this.currentIndex];

    // Handle smooth visual text fading
    const activeFrame = document.getElementById('carousel-active-content');
    if (activeFrame) activeFrame.style.opacity = 0;

    setTimeout(() => {
      const lang = window.ClearSiteI18n ? window.ClearSiteI18n.currentLang : 'en';

      // Load localized values
      const badgeText = slide[`badge_${lang}`] || slide.badge_en;
      const titleText = slide[`title_${lang}`] || slide.title_en;
      const youText = slide[`you_${lang}`] || slide.you_en;
      const weText = slide[`we_${lang}`] || slide.we_en;

      // Inject content variables
      this.elBadge.className = `px-3 py-1 text-xs font-bold uppercase rounded-full ${slide.badge_style}`;
      this.elBadge.innerText = badgeText;
      this.elTitle.innerText = titleText;
      this.elYou.innerText = youText;
      this.elWe.innerText = weText;

      // Handle background graphic styling (with descriptive accessible alt tags)
      if (slide.image_url) {
        this.elFrame.style.backgroundImage = `url('${slide.image_url}')`;
        this.elFrame.style.backgroundSize = 'cover';
        this.elFrame.style.backgroundPosition = 'center';
        
        // Use accessibility label corresponding to slide description
        this.elFrame.setAttribute('role', 'img');
        this.elFrame.setAttribute('aria-label', titleText + ": " + youText);
      }

      this.updateIndicators();
      if (activeFrame) activeFrame.style.opacity = 1;

      // Synchronization Bridge: Notify the pricing engine script to shift selected parameters
      if (window.ClearSiteEngine) {
        window.ClearSiteEngine.selectedTier = slide.tier_id;
        window.ClearSiteEngine.calculateAndRender();
      }
    }, 150);
  }

  updateIndicators() {
    if (!this.elIndicators) return;
    const indicators = this.elIndicators.children;
    
    for (let i = 0; i < indicators.length; i++) {
      if (i === this.currentIndex) {
        indicators[i].className = "w-3 h-3 rounded-full bg-[#10B981] scale-125 transition-all cursor-pointer";
      } else {
        indicators[i].className = "w-3 h-3 rounded-full bg-slate-300 transition-all cursor-pointer";
      }
    }
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.slidesData.length;
    this.renderCurrentSlide();
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.slidesData.length) % this.slidesData.length;
    this.renderCurrentSlide();
  }

  goTo(index) {
    if (index >= 0 && index < this.slidesData.length) {
      this.currentIndex = index;
      this.renderCurrentSlide();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.ClearSiteCarousel = new ClearSiteCarousel();
});