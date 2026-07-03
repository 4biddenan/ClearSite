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

  // 6. Live Schedule date and time slot selection logic
  const dateInput = document.getElementById('selected-date');
  const timeBtns = document.querySelectorAll('.select-time-btn');
  const slotInput = document.getElementById('selected-slot-input');
  const toConfirmationBtn = document.getElementById('btn-to-confirmation');
  
  let selectedDay = '';
  let selectedTime = '';
  
  // Set minimum date to tomorrow
  if (dateInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
    
    dateInput.addEventListener('change', () => {
      const dateVal = dateInput.value;
      if (dateVal) {
        const parts = dateVal.split('-');
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        const activeLang = window.ClearSiteI18n ? window.ClearSiteI18n.currentLang : 'en';
        selectedDay = d.toLocaleDateString(activeLang === 'fr' ? 'fr-FR' : 'en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } else {
        selectedDay = '';
      }
      checkSlotSelection();
    });
  }

  function checkSlotSelection() {
    if (selectedDay && selectedTime) {
      const fullSlotString = `${selectedDay} - ${selectedTime}`;
      if (slotInput) {
        slotInput.value = fullSlotString;
      }
      
      const summarySlot = document.getElementById('summary-value-slot');
      if (summarySlot) {
        summarySlot.innerText = fullSlotString;
      }
      
      if (toConfirmationBtn) {
        toConfirmationBtn.removeAttribute('disabled');
        toConfirmationBtn.innerText = 'Next: Confirm →';
        toConfirmationBtn.classList.remove('btn-secondary');
        toConfirmationBtn.classList.add('sched-btn-primary');
      }
    } else {
      if (toConfirmationBtn) {
        toConfirmationBtn.setAttribute('disabled', 'true');
        toConfirmationBtn.innerText = 'Select a Slot';
        toConfirmationBtn.classList.remove('sched-btn-primary');
        toConfirmationBtn.classList.add('btn-secondary');
      }
    }
  }

  timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      timeBtns.forEach(b => {
        b.classList.remove('btn-success', 'text-white');
        b.classList.add('btn-outline-secondary');
      });
      btn.classList.remove('btn-outline-secondary');
      btn.classList.add('btn-success', 'text-white');
      selectedTime = btn.getAttribute('data-time');
      checkSlotSelection();
    });
  });
  
  if (toConfirmationBtn) {
    toConfirmationBtn.addEventListener('click', () => {
      if (selectedDay && selectedTime) {
        switchControlPanelState('contact');
      }
    });
  }

  // 7. Netlify Forms AJAX interceptor
  document.querySelectorAll('form[data-netlify="true"]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      
      // Netlify forms require the form-name parameter
      formData.append('form-name', form.name);

      fetch('/', {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
      })
      .then(() => {
        // Success redirections / alert simulations
        if (form.name === 'contact') {
          showAlert('alert_contact_success', 'Thank you! Your message has been sent.');
        } else if (form.name === 'estimator-callback') {
          showAlert('alert_callback', 'Callback sequence authorized.');
        } else if (form.name === 'estimator-booking') {
          showAlert('alert_booked', 'Appointment Request Lodged.');
        }
        form.reset();
      })
      .catch(error => {
        console.error('Error submitting form:', error);
        alert('Form submission error. Please try again.');
      });
    });
  });

});

