/* ============================================================
   ML CODE SOLUTIONS · inicializacao
   Extraido de index.html (fase 1)
   ============================================================ */
import { $, lite } from "./util.js";
import { bindTilt, initConsent, initHeader, initHeroCanvas, initHeroParallax, initLegalLinks, initMagnetic, initMobileCta, initReveals, initRipple, initScrollUI, initSectionPause, initTimeline, initTracking, syncContacts } from "./ui.js";
import { initCatalogControls, initModal, renderCatalog, renderTabs } from "./catalog.js";
import { renderFeatured, renderNiches, renderPlans, renderUrgency } from "./sections.js";
// ===== 25 · INICIALIZAÇÃO =====
export function init() {
  document.documentElement.classList.toggle("lite", lite());
  renderUrgency();
  renderPlans();
  syncContacts();
  initTracking();
  initConsent();
  initHeader();
  initModal();
  initReveals();
  initLegalLinks();

  let deferredDone = false;
  const runExtras = () => {
    renderFeatured();
    renderNiches();
    initMobileCta();
    initScrollUI();
    bindTilt(document);
    initRipple();
    initMagnetic();
    initHeroCanvas();
    initHeroParallax();
    initSectionPause();
    initTimeline();
  };
  const runDeferred = () => {
    if (deferredDone) return;
    deferredDone = true;
    renderTabs();
    renderCatalog(false);
    initCatalogControls();
    window.requestAnimationFrame(runExtras);
  };
  const scheduleDeferred = () => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(runDeferred, { timeout: 900 });
    else window.setTimeout(runDeferred, 1);
  };
  const catalogSection = $("#modelos");
  if (catalogSection && "IntersectionObserver" in window) {
    const early = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      early.disconnect();
      runDeferred();
    }, { rootMargin: "240px 0px" });
    early.observe(catalogSection);
  }
  window.requestAnimationFrame(() => window.setTimeout(scheduleDeferred, 0));
}
