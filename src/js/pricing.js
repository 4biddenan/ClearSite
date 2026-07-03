/**
 * ClearSite Solutions - Core Dynamic State Engine
 * Architecture: Framework-Free Decoupled Asynchronous Logic Pipeline
 */

class ClearSitePricingEngine {
  constructor() {
    this.config = null;
    this.territory = null;
    this.waivers = null;

    this.currentVolume = 1;
    this.hasMasonry = false;
    this.stairFlights = 0;
    this.distanceKm = 10;
    this.selectedTier = 'level_3_meeting';

    // Boot execution loop
    this.init();
  }

  async init() {
    try {
      // Async ingestion from Control Plane data configuration layers
      const [pricingResp, territoryResp, waiversResp] = await Promise.all([
        fetch('../config/pricing-config.json'),
        fetch('../config/territory-matrix.json'),
        fetch('../config/legal-waivers.json')
      ]);

      this.config = await pricingResp.json();
      this.territory = await territoryResp.json();
      this.waivers = await waiversResp.json();
      
      this.cacheDOMElements();
      this.populateTownSelect();
      this.registerEventListeners();
      
      // Initial calculation run
      this.calculateAndRender();
    } catch (error) {
      console.error("[ClearSite Engine Error] Failed to ingest operational config parameters:", error);
    }
  }

  cacheDOMElements() {
    this.sliderVolume = document.getElementById('input-volume');
    this.lblVolume = document.getElementById('lbl-volume');
    this.chkMasonry = document.getElementById('chk-masonry');
    this.selStairs = document.getElementById('sel-stairs');
    this.selTown = document.getElementById('sel-town');
    this.alertBlock = document.getElementById('safety-alert-gate');
    this.costDisplay = document.getElementById('estimated-cost-display');
  }

  populateTownSelect() {
    if (!this.selTown || !this.territory) return;
    
    const currentSelection = this.selTown.value;
    this.selTown.innerHTML = '';
    
    this.territory.sectors.forEach(sector => {
      const opt = document.createElement('option');
      opt.value = sector.id;
      opt.innerText = sector.name; // Sector names are proper nouns
      this.selTown.appendChild(opt);
    });
    
    // Maintain selection or default to Saint-Laurent (index 11) or the first element
    if (currentSelection && this.territory.sectors.some(s => s.id === currentSelection)) {
      this.selTown.value = currentSelection;
    } else if (this.territory.sectors.length) {
      // Set Saint-Laurent (close to hub) or Pointe-Claire as default
      const defaultSector = this.territory.sectors.find(s => s.id === 'pointe-claire') || this.territory.sectors[0];
      this.selTown.value = defaultSector.id;
      this.distanceKm = defaultSector.ecocentre_route_km;
    }
  }

  registerEventListeners() {
    if (!this.sliderVolume) return;

    this.sliderVolume.addEventListener('input', (e) => {
      this.currentVolume = parseFloat(e.target.value);
      if (this.lblVolume) {
        this.lblVolume.innerText = this.currentVolume;
      }
      this.enforceThresholdLimits();
      this.calculateAndRender();
    });

    if (this.chkMasonry) {
      this.chkMasonry.addEventListener('change', (e) => {
        this.hasMasonry = e.target.checked;
        this.enforceThresholdLimits();
        this.calculateAndRender();
      });
    }

    if (this.selStairs) {
      this.selStairs.addEventListener('change', (e) => {
        this.stairFlights = parseInt(e.target.value) || 0;
        this.calculateAndRender();
      });
    }

    if (this.selTown) {
      this.selTown.addEventListener('change', (e) => {
        this.handleTownChange(e.target.value);
      });
    }
  }

  handleTownChange(townId) {
    if (!this.territory) return;
    const sector = this.territory.sectors.find(s => s.id === townId);
    if (sector) {
      this.distanceKm = sector.ecocentre_route_km;
      this.calculateAndRender();
    }
  }

  enforceThresholdLimits() {
    if (!this.config) return;
    const caps = this.config.thresholds;
    
    // Evaluate if heavy aggregate parameters cross our vehicle safety thresholds
    if (this.hasMasonry && this.currentVolume > caps.max_masonry_concrete_volume_m3) {
      // Reveal warning alert module in the DOM
      if (this.alertBlock) {
        this.alertBlock.classList.remove('hidden');
      }
      // Force visual state to multi-trip optimization tracking mode
      document.body.classList.add('multi-trip-active');
    } else {
      if (this.alertBlock) {
        this.alertBlock.classList.add('hidden');
      }
      document.body.classList.remove('multi-trip-active');
    }
  }

  calculateAndRender() {
    if (!this.config) return;

    // Dynamically manage staircase inputs based on service tier applicability
    if (this.selStairs) {
      if (this.selectedTier === 'level_2_curbside' || this.selectedTier === 'level_4_copilot') {
        this.selStairs.disabled = true;
        this.selStairs.value = "0";
        this.stairFlights = 0;
        this.selStairs.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        this.selStairs.disabled = false;
        this.selStairs.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    }

    const rates = this.config.services;
    const tiers = this.config.tiers;
    let tripsCount = 1;

    // Split calculations if structural truck safety limits are compromised
    if (this.hasMasonry && this.currentVolume > this.config.thresholds.max_masonry_concrete_volume_m3) {
      tripsCount = Math.ceil(this.currentVolume / this.config.thresholds.max_masonry_concrete_volume_m3);
    }

    // Process cost configurations for all 4 service tiers simultaneously
    const matrixOutputs = {};
    
    for (const [tierKey, data] of Object.entries(tiers)) {
      let baseCost = (rates.base_mobilization * data.base_multiplier) + 
                     (rates.crew_labor_rate_per_hour * data.allotted_labor_hours);
      
      let distanceCost = this.distanceKm * rates.travel_rate_per_km;
      let handlingOverhead = 0;

      // Staircase carrying penalty applies to Unprepared Pick-Up and Disposal Meeting where crew extracts from inside
      if (tierKey === 'level_1_unprepared' || tierKey === 'level_3_meeting') {
        handlingOverhead += (this.stairFlights * rates.handling.staircase_per_flight_penalty);
      }
      
      // Masonry sorting fee applies only to Unprepared Pick-Up where crew handles sorting
      if (tierKey === 'level_1_unprepared' && this.hasMasonry) {
        handlingOverhead += rates.handling.heavy_aggregate_sorting_fee;
      }

      let disposalCost = this.currentVolume * rates.disposal.municipal_overflow_per_m3;
      let singleTripTotal = baseCost + distanceCost + handlingOverhead + disposalCost;
      let totalAggregatedCost = singleTripTotal;

      // Compound subsequent trip pipelines using multi-trip savings percentages
      if (tripsCount > 1) {
        const discountFactor = 1 - (this.config.discounts_and_modifiers.multi_trip_savings_percentage / 100);
        for (let i = 1; i < tripsCount; i++) {
          totalAggregatedCost += (singleTripTotal * discountFactor);
        }
      }

      matrixOutputs[tierKey] = totalAggregatedCost * this.config.discounts_and_modifiers.seasonal_multiplier;
    }

    this.updateDOMView(matrixOutputs, tripsCount);
  }

  updateDOMView(matrixOutputs, tripsCount) {
    const activeLang = window.ClearSiteI18n ? window.ClearSiteI18n.currentLang : 'en';
    const dict = window.ClearSiteI18n && window.ClearSiteI18n.translations ? window.ClearSiteI18n.translations[activeLang] : null;

    // Render active target estimation in the right-column widget
    if (this.costDisplay) {
      const selectedValue = matrixOutputs[this.selectedTier];
      let costText = `$${selectedValue.toFixed(2)} CAD`;
      if (tripsCount > 1) {
        const tripsWord = dict ? dict['units_trips'] : 'Trips';
        costText += ` (${tripsCount} ${tripsWord})`;
      }
      this.costDisplay.innerText = costText;
    }

    // Synchronize the dropdown selector value
    const selTierEl = document.getElementById('sel-tier');
    if (selTierEl) {
      selTierEl.value = this.selectedTier;
    }

    // Update hidden tracking fields inside forms
    document.querySelectorAll('.form-tier').forEach(el => el.value = this.selectedTier);
    document.querySelectorAll('.form-town').forEach(el => {
      const townSelect = document.getElementById('sel-town');
      el.value = townSelect ? townSelect.value : '';
    });
    document.querySelectorAll('.form-volume').forEach(el => el.value = this.currentVolume + ' m³');
    document.querySelectorAll('.form-stairs').forEach(el => el.value = this.stairFlights + ' flights');
    document.querySelectorAll('.form-masonry').forEach(el => el.value = this.hasMasonry ? 'Yes' : 'No');
    
    const selectedVal = matrixOutputs[this.selectedTier];
    let trackingPriceStr = `$${selectedVal.toFixed(2)} CAD`;
    if (tripsCount > 1) {
      trackingPriceStr += ` (${tripsCount} trips)`;
    }
    document.querySelectorAll('.form-price').forEach(el => el.value = trackingPriceStr);

    // Highlight the selected service card in the list
    const tiersList = ['level_1_unprepared', 'level_2_curbside', 'level_3_meeting', 'level_4_copilot'];
    tiersList.forEach(tierKey => {
      const cardEl = document.getElementById(`service-card-${tierKey}`);
      if (cardEl) {
        if (tierKey === this.selectedTier) {
          cardEl.classList.add('active-tier');
        } else {
          cardEl.classList.remove('active-tier');
        }
      }
    });

    // Render active legal waiver details and global prohibited items dynamically
    if (this.waivers) {
      const activeWaiverObj = this.waivers.tier_waivers[this.selectedTier];
      const activeWaiverText = activeWaiverObj ? activeWaiverObj[activeLang] : '';
      const globalProhibitions = this.waivers.global_prohibitions;
      const prohibitionsText = globalProhibitions ? (globalProhibitions[`notice_${activeLang}`] || globalProhibitions['notice_en']) : '';

      const elWaiverText = document.getElementById('waiver-note-text');
      const elProhibitionsText = document.getElementById('prohibition-note-text');

      if (elWaiverText) elWaiverText.innerText = activeWaiverText;
      if (elProhibitionsText) elProhibitionsText.innerText = prohibitionsText;
    }

    // Update summary labels in the booking confirmation tab dynamically
    const summaryTier = document.getElementById('summary-value-tier');
    const summaryVolume = document.getElementById('summary-value-volume');
    const summaryPrice = document.getElementById('summary-value-price');
    
    if (summaryTier) {
      let tierNum = '1';
      if (this.selectedTier.includes('curbside')) tierNum = '2';
      else if (this.selectedTier.includes('meeting')) tierNum = '3';
      else if (this.selectedTier.includes('copilot')) tierNum = '4';
      const tierDictKey = `tier_${tierNum}_title`;
      summaryTier.innerText = dict ? (dict[tierDictKey] || this.selectedTier) : this.selectedTier;
    }
    if (summaryVolume) {
      summaryVolume.innerText = `${this.currentVolume} m³`;
    }
    if (summaryPrice) {
      summaryPrice.innerText = trackingPriceStr;
    }
  }
}

// Instantiate engine upon Document Object Model safety validation
document.addEventListener('DOMContentLoaded', () => {
  window.ClearSiteEngine = new ClearSitePricingEngine();
});