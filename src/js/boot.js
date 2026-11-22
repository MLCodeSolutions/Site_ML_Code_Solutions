/* ============================================================
   ML CODE SOLUTIONS · inicializacao
   Extraido de index.html (fase 1)
   ============================================================ */
import { $, lite } from "./util.js";
import { bindTilt, initConsent, initHeader, initHeroCanvas, initHeroParallax, initImageFallback, initLegalLinks, initMagnetic, initMobileCta, initReveals, initRipple, initScrollUI, initSectionPause, initTimeline, initTracking, syncContacts, syncSeo } from "./ui.js";
import { initCatalogControls, initModal, renderCatalog, renderTabs } from "./catalog.js";
import { renderFeatured, renderNiches, renderPlans, renderUrgency } from "./sections.js";
// ===== 25 · INICIALIZAÇÃO =====
// O loader inline (#mlcs-boot) só some depois que catálogo/seções foram montados.
const markReady = () => document.documentElement.classList.add("is-ready");
// Modo seção: o embed vive num iframe sem chrome global (header/FAB/scroll UI).
// Mantém catálogo/seções, reveals, links legais, modal (auto-bloqueado) e
// tilt/ripple/magnetic (interações de ponteiro que funcionam no iframe).
// Desliga o que depende de scroll/chrome: tracking/consent/header/mobile CTA/
// scroll UI, canvas, parallax e pausa por interseção.
export function init() {
  const sectionMode = document.body.dataset.embedMode === "section";
  document.documentElement.classList.toggle("lite", lite());
  initImageFallback();
  renderUrgency();
  renderPlans();
  syncContacts();
  if (!sectionMode) syncSeo();
  initModal();
  initReveals();
  initLegalLinks();
  if (!sectionMode) {
    initTracking();
    initConsent();
    initHeader();
  }

  let deferredDone = false;
  const runExtras = () => {
    renderFeatured();
    renderNiches();
    bindTilt(document);
    initRipple();
    initMagnetic();
    initTimeline();
    if (sectionMode) { markReady(); return; }
    initMobileCta();
    initScrollUI();
    initHeroCanvas();
    initHeroParallax();
    initSectionPause();
    markReady();
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
