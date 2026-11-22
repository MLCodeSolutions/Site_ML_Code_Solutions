/* ============================================================
   ML CODE SOLUTIONS · catalogo (engine) e modal de previa
   Extraido de index.html (fase 1)
   ============================================================ */
import { CONFIG } from "./config.js";
import { SITES, nicheMeta } from "./data.js";
import { $, $$, assetUrl, attachShot, domainOf, icon, lite, make, normalizeText, reduced, safeUrl, waLink } from "./util.js";
import { bindTilt, observeReveals, trackEvent } from "./ui.js";
// ===== 11 · CAPAS DO CATÁLOGO (SVG) =====
// ===== 12 · CATÁLOGO (ENGINE) =====
export const catalogState = { nicho: "Todos", query: "" };
export const catalogView = { page: 0, pages: 1, perPage: 6, windowStart: 0, windowSize: 3, recentering: false };
export const catalogGrid = $("#catalogGrid");
export const catalogNav = $("#catalogNav");
export const catalogPrev = $("#catalogPrev");
export const catalogNext = $("#catalogNext");
export const catalogProgress = $("#catalogProgress");
export const catalogPageLabel = $("#catalogPageLabel");
export const catalogCustom = $("#catalogCustom");
export let catalogProgressMode = "";
export function coverArt(slug, eager) {
  const img = document.createElement("img");
  img.className = "model-cover-art";
  img.src = assetUrl("svg/covers/" + slug + ".svg");
  img.alt = "";
  img.width = 400;
  img.height = 300;
  img.decoding = "async";
  if (eager) img.fetchPriority = "high";
  else img.loading = "lazy";
  return img;
}

export function nicheList() {
  const seen = [];
  SITES.forEach((site) => { if (!seen.includes(site.nicho)) seen.push(site.nicho); });
  return seen;
}
export function matchesCatalog(site) {
  const byNiche = catalogState.nicho === "Todos" || site.nicho === catalogState.nicho;
  const byQuery = !catalogState.query || normalizeText(site.titulo).includes(normalizeText(catalogState.query));
  return byNiche && byQuery;
}
export function updateTabState() {
  $$("#catalogTabs .tab").forEach((tab) => {
    tab.setAttribute("aria-pressed", String(tab.dataset.nicho === catalogState.nicho));
  });
}
export function selectNiche(nicho, scroll) {
  if (catalogState.nicho !== nicho) {
    catalogState.nicho = nicho;
    updateTabState();
    renderCatalog(true);
  }
  if (scroll) {
    const section = $("#modelos");
    if (section) section.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  }
}
export function renderTabs() {
  const tabs = $("#catalogTabs");
  if (!tabs) return;
  tabs.replaceChildren();
  const entries = [{ nicho: "Todos", count: SITES.length }].concat(nicheList().map((nicho) => ({ nicho, count: SITES.filter((site) => site.nicho === nicho).length })));
  entries.forEach((entry) => {
    const button = make("button", "tab");
    button.type = "button";
    button.dataset.nicho = entry.nicho;
    button.setAttribute("aria-pressed", String(entry.nicho === catalogState.nicho));
    if (entry.nicho === "Todos") button.append(icon("i-spark"));
    else {
      const glyph = document.createElement("span");
      glyph.className = "tab-icon";
      glyph.innerHTML = nicheMeta(entry.nicho).icon;
      button.append(glyph);
    }
    button.append(make("span", "tab-label", entry.nicho));
    button.append(make("span", "tab-count", String(entry.count)));
    button.addEventListener("click", () => selectNiche(entry.nicho, false));
    tabs.append(button);
  });
}
export function buildAction(label, href, iconId, variant) {
  const link = make("a", "btn " + variant + " btn-sm");
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.append(make("span", "", label), icon(iconId));
  return link;
}
export function buildModelCell(site, index, order, eager) {
  const meta = nicheMeta(site.nicho);
  const cell = make("div", "model-cell");
  cell.dataset.index = String(index);
  const card = make("article", "model-card tilt");
  card.dataset.index = String(index);
  const palette = meta.palette || [meta.accent, meta.accent2];
  card.style.setProperty("--accent", palette[index % palette.length]);
  card.style.setProperty("--accent2", palette[(index + 2) % palette.length]);
  const cover = make("div", "model-cover");
  cover.append(coverArt(meta.slug, eager));
  attachShot(cover, site, { alt: "Prévia do site " + site.titulo, eager: Boolean(eager) });
  const preview = make("button", "model-preview");
  preview.type = "button";
  preview.dataset.preview = String(index);
  preview.setAttribute("aria-label", "Pré-visualizar o modelo " + site.titulo);
  preview.append(icon("i-eye"));
  const badge = make("span", "model-niche-badge");
  const badgeIcon = make("span", "badge-icon");
  badgeIcon.innerHTML = meta.icon;
  badge.append(badgeIcon, document.createTextNode(site.nicho));
  cover.append(preview, badge);
  card.append(cover);

  const body = make("div", "model-body");
  const topline = make("div", "model-topline");
  topline.append(make("span", "model-tag", site.nicho), make("span", "model-domain", domainOf(site.url) || "link em breve"));
  body.append(topline, make("h3", "", site.titulo), make("p", "", site.descricao));

  const actions = make("div", "model-actions");
  const safe = safeUrl(site.url);
  if (safe) {
    actions.append(buildAction("Ver modelo", safe, "i-external", "btn-primary"));
  } else {
    const disabled = make("span", "btn btn-ghost btn-sm is-disabled", "Link em breve");
    disabled.setAttribute("aria-disabled", "true");
    actions.append(disabled);
  }
  const modelOrigin = "modelo: " + site.titulo;
  const want = buildAction("Quero este modelo", waLink(CONFIG.whatsappMensagens.modelo, { titulo: site.titulo, nicho: site.nicho }), "i-wa", "btn-ring");
  want.dataset.leadOrigin = modelOrigin;
  want.dataset.leadModel = site.titulo;
  want.dataset.leadNiche = site.nicho;
  actions.append(want);
  body.append(actions);
  card.append(body);
  cell.append(card);
  return cell;
}
export function buildCustomCard() {
  const strip = make("div", "catalog-custom");
  const glyph = make("div", "custom-icon");
  glyph.append(icon("i-spark"));
  const copy = make("div", "custom-copy");
  copy.append(make("h3", "", "Seu nicho não está aqui?"), make("p", "", "Criamos um modelo sob medida para o seu negócio, com a sua marca e as suas seções."));
  const cta = buildAction("Quero um sob medida", waLink(CONFIG.whatsappMensagens.catalogo), "i-wa", "btn-outline");
  cta.dataset.leadOrigin = "catalogo: sob medida";
  strip.append(glyph, copy, cta);
  return strip;
}
export function buildEmpty() {
  const empty = make("div", "catalog-empty");
  const art = document.createElement("img");
  art.src = assetUrl("svg/catalog-empty.svg");
  art.alt = "";
  art.width = 44;
  art.height = 44;
  art.loading = "lazy";
  art.decoding = "async";
  const clear = make("button", "btn btn-ghost", "Limpar filtros");
  clear.type = "button";
  clear.addEventListener("click", clearFilters);
  empty.append(art, make("h3", "", "Em breve, novos modelos neste nicho."), make("p", "", "Enquanto isso, peça um modelo sob medida ou tente outra busca."), clear);
  return empty;
}
export function clearFilters() {
  catalogState.nicho = "Todos";
  catalogState.query = "";
  const input = $("#catalogSearch");
  if (input) input.value = "";
  const clear = $("#clearSearch");
  if (clear) clear.hidden = true;
  updateTabState();
  renderCatalog(true);
}
export function catalogPerPage() {
  if (window.matchMedia("(max-width: 640px)").matches) return 1;
  if (window.matchMedia("(max-width: 1020px)").matches) return 2;
  return 3;
}
export function chunkList(list, size) {
  const pages = [];
  for (let i = 0; i < list.length; i += size) pages.push(list.slice(i, i + size));
  return pages.length ? pages : [[]];
}
export const catalogPrintState = { chunks: [] };
export function buildPage(index, total) {
  const page = make("div", "catalog-page");
  page.dataset.page = String(index);
  page.setAttribute("role", "group");
  page.setAttribute("aria-roledescription", "slide");
  page.setAttribute("aria-label", "Página " + (index + 1) + " de " + total);
  page._entries = catalogPrintState.chunks[index] || [];
  return page;
}
export function fillCatalogPage(page, eager) {
  if (!page || page.dataset.filled === "1") return;
  page.dataset.filled = "1";
  const entries = page._entries || [];
  if (!entries.length) { page.append(buildEmpty()); return; }
  const frag = document.createDocumentFragment();
  entries.forEach((entry) => frag.append(buildModelCell(entry.site, entry.index, entry.order, Boolean(eager))));
  page.replaceChildren(frag);
  bindTilt(page);
}
export function catalogPageElement(localIndex) {
  if (!catalogGrid) return null;
  return catalogGrid.children[localIndex] || null;
}
export function currentCatalogLocal() {
  if (!catalogGrid) return 0;
  let best = 0;
  let distance = Infinity;
  Array.prototype.forEach.call(catalogGrid.children, (page, index) => {
    const delta = Math.abs(page.offsetLeft - catalogGrid.scrollLeft);
    if (delta < distance) { distance = delta; best = index; }
  });
  return best;
}
export function currentCatalogGlobal() {
  return catalogView.windowStart + currentCatalogLocal();
}
export function renderCatalogWindow(center, options = {}) {
  if (!catalogGrid) return;
  const total = catalogView.pages;
  if (total < 1) return;
  const target = Math.max(0, Math.min(total - 1, Number(center) || 0));
  const size = Math.min(catalogView.windowSize, total);
  const start = Math.max(0, Math.min(total - size, target - Math.floor(size / 2)));
  const reuse = options.reuse !== false;
  const existing = Array.prototype.slice.call(catalogGrid.children);
  const reused = reuse
    ? existing.find((page) => Number(page.dataset.page) === target && page.dataset.filled === "1")
    : null;
  const pages = [];
  for (let index = start; index < start + size; index++) {
    if (reused && index === target) { pages.push(reused); continue; }
    pages.push(buildPage(index, total));
  }
  catalogView.windowStart = start;
  catalogView.page = target;
  catalogView.recentering = true;
  catalogGrid.style.scrollSnapType = "none";
  catalogGrid.style.scrollBehavior = "auto";
  catalogGrid.replaceChildren(...pages);
  const local = target - start;
  pages.forEach((page, index) => fillCatalogPage(page, index >= local));
  const targetPage = pages[local];
  if (targetPage && Math.abs(catalogGrid.scrollLeft - targetPage.offsetLeft) > 1) {
    catalogGrid.scrollTo({ left: targetPage.offsetLeft, behavior: "instant" });
  }
  syncCatalogNav();
  requestAnimationFrame(() => {
    catalogGrid.style.scrollSnapType = "";
    catalogGrid.style.scrollBehavior = "";
    window.setTimeout(() => { catalogView.recentering = false; }, 60);
  });
}
export function renderCatalogProgress() {
  if (!catalogProgress) return;
  catalogProgress.replaceChildren();
  const pages = catalogView.pages;
  if (pages <= 24) {
    catalogProgressMode = "dots";
    for (let i = 0; i < pages; i++) {
      const dot = make("button", "catalog-dot");
      dot.type = "button";
      dot.setAttribute("aria-label", "Ir para a página " + (i + 1));
      dot.addEventListener("click", () => scrollToCatalogPage(i, true));
      catalogProgress.append(dot);
    }
  } else {
    catalogProgressMode = "bar";
    const bar = make("div", "catalog-progress-bar");
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-label", "Progresso do catálogo");
    bar.setAttribute("aria-valuemin", "1");
    bar.setAttribute("aria-valuemax", String(pages));
    bar.append(make("span"));
    catalogProgress.append(bar);
  }
  syncCatalogProgressState();
}
export function syncCatalogProgressState() {
  if (!catalogProgress) return;
  if (catalogProgressMode === "dots") {
    Array.prototype.forEach.call(catalogProgress.children, (dot, index) => {
      if (index === catalogView.page) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  } else if (catalogProgressMode === "bar") {
    const bar = catalogProgress.firstElementChild;
    const fill = bar && bar.firstElementChild;
    if (bar) bar.setAttribute("aria-valuenow", String(catalogView.page + 1));
    if (fill) fill.style.width = (((catalogView.page + 1) / catalogView.pages) * 100).toFixed(2) + "%";
  }
}
export function syncCatalogNav() {
  const pages = catalogView.pages;
  if (catalogPageLabel) {
    catalogPageLabel.replaceChildren(document.createTextNode("Página "));
    const current = document.createElement("b");
    current.textContent = String(catalogView.page + 1);
    catalogPageLabel.append(current, document.createTextNode(" de " + pages));
  }
  if (catalogNav) catalogNav.hidden = pages <= 1;
  if (catalogPrev) catalogPrev.disabled = catalogView.page <= 0;
  if (catalogNext) catalogNext.disabled = catalogView.page >= pages - 1;
  syncCatalogProgressState();
}
export function setCatalogPage(index) {
  const max = Math.max(0, catalogView.pages - 1);
  const next = Math.max(0, Math.min(max, index));
  if (next === catalogView.page) return;
  catalogView.page = next;
  syncCatalogNav();
}
export function scrollToCatalogPage(index, smooth) {
  if (!catalogGrid) return;
  const max = Math.max(0, catalogView.pages - 1);
  const target = Math.max(0, Math.min(max, index));
  const local = target - catalogView.windowStart;
  const lastLocal = catalogGrid.children.length - 1;
  const page = catalogPageElement(local);
  const current = currentCatalogLocal();
  const atEdge = local === 0 || local === lastLocal;
  if (!page || local < 0 || local > lastLocal || atEdge || Math.abs(local - current) > 1) {
    renderCatalogWindow(target, { reuse: true });
    return;
  }
  setCatalogPage(target);
  catalogGrid.scrollTo({ left: page.offsetLeft, behavior: smooth && !reduced() && !lite() ? "smooth" : "instant" });
}
export function renderCatalog(animate, options = {}) {
  if (!catalogGrid) return;
  const currentPage = catalogPageElement(currentCatalogLocal());
  const anchorNode = options.preserve && currentPage ? currentPage.querySelector("[data-index]") : null;
  const anchor = anchorNode ? Number(anchorNode.getAttribute("data-index")) : null;

  const results = [];
  SITES.forEach((site, index) => { if (matchesCatalog(site)) results.push({ site, index }); });
  const perPage = catalogPerPage();
  const chunks = [];
  for (let i = 0; i < results.length; i += perPage) {
    chunks.push(results.slice(i, i + perPage).map((entry, offset) => ({ site: entry.site, index: entry.index, order: i + offset })));
  }
  if (!chunks.length) chunks.push([]);
  catalogPrintState.chunks = chunks;
  const totalPages = chunks.length;

  const count = $("#catalogCount");
  if (count) {
    if (catalogState.query) count.textContent = results.length + (results.length === 1 ? " modelo encontrado para “" + catalogState.query + "”" : " modelos encontrados para “" + catalogState.query + "”");
    else if (catalogState.nicho === "Todos") count.textContent = results.length + " modelos prontos para escolher";
    else count.textContent = results.length + (results.length === 1 ? " modelo em " + catalogState.nicho : " modelos em " + catalogState.nicho);
  }
  let target = 0;
  if (anchor !== null) {
    const found = results.findIndex((entry) => entry.index === anchor);
    if (found >= 0) target = Math.floor(found / perPage);
  }
  catalogView.perPage = perPage;
  catalogView.pages = totalPages;
  catalogGrid.classList.toggle("is-empty", !results.length);
  catalogGrid.classList.toggle("is-single", totalPages <= 1);
  if (catalogCustom) catalogCustom.replaceChildren(buildCustomCard());
  if (animate) trackEvent("catalog_filter", { nicho: catalogState.nicho, query: catalogState.query, resultados: results.length });
  catalogView.page = target;
  renderCatalogProgress();
  syncCatalogNav();
  renderCatalogWindow(target, { reuse: false });
  observeReveals();
  if (animate && !reduced() && !lite()) {
    catalogGrid.animate(
      [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
      { duration: 300, easing: "cubic-bezier(.16,1,.3,1)" }
    );
  }
}
export function initCatalogControls() {
  const input = $("#catalogSearch");
  const clear = $("#clearSearch");
  if (input) {
    let timer = 0;
    input.addEventListener("input", () => {
      window.clearTimeout(timer);
      if (clear) clear.hidden = !input.value;
      timer = window.setTimeout(() => {
        catalogState.query = input.value.trim();
        renderCatalog(true);
      }, 120);
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && input.value) {
        event.preventDefault();
        clearFilters();
        input.focus();
      }
    });
  }
  if (clear) {
    clear.addEventListener("click", () => {
      if (input) input.value = "";
      clear.hidden = true;
      catalogState.query = "";
      renderCatalog(true);
      if (input) input.focus();
    });
  }
  if (catalogPrev) catalogPrev.addEventListener("click", () => scrollToCatalogPage(catalogView.page - 1, true));
  if (catalogNext) catalogNext.addEventListener("click", () => scrollToCatalogPage(catalogView.page + 1, true));
  if (catalogGrid) {
    let scrollTimer = 0;
    let recenterTimer = 0;
    const settleCatalogScroll = () => {
      if (catalogView.recentering) return;
      const local = currentCatalogLocal();
      const global = catalogView.windowStart + local;
      setCatalogPage(global);
      const canPrev = global > 0;
      const canNext = global < catalogView.pages - 1;
      const atEdge = (local === 0 && canPrev) || (local === catalogGrid.children.length - 1 && canNext);
      if (atEdge) {
        window.clearTimeout(recenterTimer);
        recenterTimer = window.setTimeout(() => {
          if (!catalogView.recentering) renderCatalogWindow(global);
        }, 80);
      }
    };
    catalogGrid.addEventListener("scroll", () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(settleCatalogScroll, 90);
    }, { passive: true });
    if ("onscrollend" in catalogGrid) {
      catalogGrid.addEventListener("scrollend", settleCatalogScroll, { passive: true });
    }
    catalogGrid.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") { event.preventDefault(); scrollToCatalogPage(catalogView.page + 1, true); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); scrollToCatalogPage(catalogView.page - 1, true); }
      else if (event.key === "Home") { event.preventDefault(); scrollToCatalogPage(0, true); }
      else if (event.key === "End") { event.preventDefault(); scrollToCatalogPage(catalogView.pages - 1, true); }
    });
    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (catalogPerPage() !== catalogView.perPage) return;
        renderCatalogWindow(catalogView.page);
      }, 160);
    });
  }
  const reflow = () => {
    if (catalogPerPage() === catalogView.perPage) return;
    renderCatalog(false, { preserve: true });
  };
  const mqMobile = window.matchMedia("(max-width: 640px)");
  const mqTablet = window.matchMedia("(max-width: 1020px)");
  if (mqMobile.addEventListener) mqMobile.addEventListener("change", reflow);
  if (mqTablet.addEventListener) mqTablet.addEventListener("change", reflow);
}

// ===== 13 · MODAL DE PRÉVIA =====
export const modalState = { lastFocus: null, movedShot: null };
// O listener de load do attachShot é registrado antes e marca .is-loaded,
// por isso o helper verifica a classe em vez de naturalWidth.
export function markModalShot(art, shot, copy) {
  if (!art || !shot) return;
  const apply = () => {
    if (!shot.classList.contains("is-loaded")) return;
    shot.removeEventListener("load", apply);
    const src = shot.currentSrc || shot.src;
    if (src) {
      art.style.setProperty("--shot", 'url("' + src.replace(/"/g, "%22") + '")');
      art.classList.add("has-shot");
    }
    if (copy) copy.textContent = "Prévia do modelo. Abra a demonstração em uma nova aba para navegar na versão real.";
  };
  if (shot.classList.contains("is-loaded")) apply();
  else shot.addEventListener("load", apply);
}
export function restoreMovedShot() {
  const moved = modalState.movedShot;
  modalState.movedShot = null;
  if (!moved || !moved.img) return;
  if (moved.img.isConnected && moved.parent && moved.parent.isConnected) {
    moved.parent.append(moved.img);
  } else if (moved.img.isConnected) {
    moved.img.remove();
  }
}
export function openPreview(index, trigger) {
  const site = SITES[index];
  const modal = $("#previewModal");
  const fallback = $("#modalFallback");
  const art = $("#modalPreviewArt");
  const title = $("#modalTitle");
  const domain = $("#modalDomain");
  const openLink = $("#modalOpen");
  const openTop = $("#modalOpenTop");
  const cta = $("#modalCta");
  const url = site ? safeUrl(site.url) : "";
  if (!site || !modal || !url) return;
  restoreMovedShot();
  modalState.index = index;
  modalState.lastFocus = trigger || document.activeElement;
  title.textContent = site.titulo;
  domain.textContent = domainOf(site.url);
  trackEvent("model_preview", { modelo: site.titulo, nicho: site.nicho });
  openLink.href = url;
  if (openTop) openTop.href = url;
  const modelOrigin = "modelo: " + site.titulo;
  cta.href = waLink(CONFIG.whatsappMensagens.modelo, { titulo: site.titulo, nicho: site.nicho });
  cta.dataset.leadOrigin = modelOrigin;
  cta.dataset.leadModel = site.titulo;
  cta.dataset.leadNiche = site.nicho;
  if (art) {
    art.classList.remove("has-shot");
    art.style.removeProperty("--shot");
    art.replaceChildren(coverArt(nicheMeta(site.nicho).slug, true));
    const fallbackCopy = "Abra a demonstração em uma nova aba para navegar no site real.";
    const copy = fallback ? $(".modal-fallback-copy p", fallback) : null;
    if (copy) copy.textContent = fallbackCopy;
    // Reaproveita a imagem já carregada pelo card para não repetir a requisição.
    const triggerCard = trigger && trigger.closest ? trigger.closest(".model-card") : null;
    const cardShot = triggerCard ? triggerCard.querySelector(".model-cover .model-shot") : null;
    if (cardShot) {
      modalState.movedShot = { img: cardShot, parent: cardShot.parentElement };
      cardShot.loading = "eager";
      cardShot.fetchPriority = "high";
      art.append(cardShot);
      markModalShot(art, cardShot, copy);
    } else {
      attachShot(art, site, {
        alt: "",
        eager: true,
        onLoad: (shot) => markModalShot(art, shot, copy),
        onError: () => {
          if (copy) copy.textContent = fallbackCopy;
        }
      });
    }
  }
  if (fallback) fallback.classList.add("is-visible");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  [".skip-link", ".site-header", "main", ".site-footer", ".wa-fab", ".to-top"].forEach((selector) => {
    const el = $(selector);
    if (el) el.inert = true;
  });
  const closeBtn = $("#modalClose");
  window.setTimeout(() => { if (closeBtn) closeBtn.focus({ preventScroll: true }); }, 40);
}
export function closePreview() {
  const modal = $("#previewModal");
  if (!modal || modal.getAttribute("aria-hidden") === "true") return;
  restoreMovedShot();
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  const fallback = $("#modalFallback");
  if (fallback) fallback.classList.remove("is-visible");
  [".skip-link", ".site-header", "main", ".site-footer", ".wa-fab", ".to-top"].forEach((selector) => {
    const el = $(selector);
    if (el) el.inert = false;
  });
  modalState.index = -1;
  if (modalState.lastFocus && typeof modalState.lastFocus.focus === "function") modalState.lastFocus.focus({ preventScroll: true });
}
export function initModal() {
  const modal = $("#previewModal");
  if (!modal) return;
  // Delegacao no documento: vale para o catalogo e para os destaques.
  document.addEventListener("click", (event) => {
    const target = event.target;
    const trigger = target && target.closest ? target.closest("[data-preview]") : null;
    if (!trigger) return;
    openPreview(Number(trigger.getAttribute("data-preview")), trigger);
  });
  $$("[data-modal-close]", modal).forEach((el) => el.addEventListener("click", closePreview));
  const closeBtn = $("#modalClose");
  if (closeBtn) closeBtn.addEventListener("click", closePreview);
  document.addEventListener("keydown", (event) => {
    if (modal.getAttribute("aria-hidden") === "true") return;
    if (event.key === "Escape") { event.preventDefault(); closePreview(); return; }
    if (event.key !== "Tab") return;
    const focusables = $$('a[href], button:not([disabled]), [tabindex="0"]', modal).filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
}
