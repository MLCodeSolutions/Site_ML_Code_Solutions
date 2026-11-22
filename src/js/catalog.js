/* ============================================================
   ML CODE SOLUTIONS · catalogo (engine) e modal de previa
   Extraido de index.html (fase 1)
   ============================================================ */
import { CONFIG } from "./config.js";
import { SITES, nicheMeta } from "./data.js";
import { $, $$, assetUrl, attachShot, domainOf, icon, lite, make, normalizeText, reduced, safeUrl, svgNode, waLink } from "./util.js";
import { bindTilt, observeReveals, trackEvent } from "./ui.js";
// ===== 11 · CAPAS DO CATÁLOGO (SVG) =====
// ===== 12 · CATÁLOGO (ENGINE) =====
export const catalogState = { nicho: "Todos", query: "" };
export const catalogView = { page: 0, pages: 1, perPage: 6 };
export const catalogGrid = $("#catalogGrid");
export const catalogNav = $("#catalogNav");
export const catalogPrev = $("#catalogPrev");
export const catalogNext = $("#catalogNext");
export const catalogProgress = $("#catalogProgress");
export const catalogPageLabel = $("#catalogPageLabel");
export const catalogCustom = $("#catalogCustom");
let catalogResults = [];

function isSectionMode() {
  return Boolean(document.body && document.body.dataset.embedMode === "section");
}

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
  } else if (catalogView.page > 0) {
    renderCatalog(false);
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
      const glyphNode = svgNode(nicheMeta(entry.nicho).icon);
      if (glyphNode) glyph.replaceChildren(glyphNode);
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
  const safe = safeUrl(site.url);
  const direct = isSectionMode() && Boolean(safe);
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
  // No modo seção não existe modal: a lupa abre a demonstração direto em nova aba.
  const preview = direct ? make("a", "model-preview") : make("button", "model-preview");
  if (direct) {
    preview.href = safe;
    preview.target = "_blank";
    preview.rel = "noopener noreferrer";
    preview.setAttribute("aria-label", "Abrir o modelo " + site.titulo + " em nova aba");
  } else {
    preview.type = "button";
    preview.dataset.preview = String(index);
    preview.setAttribute("aria-label", "Pré-visualizar o modelo " + site.titulo);
  }
  preview.append(icon("i-eye"));
  const badge = make("span", "model-niche-badge");
  const badgeIcon = make("span", "badge-icon");
  const badgeNode = svgNode(meta.icon);
  if (badgeNode) badgeIcon.replaceChildren(badgeNode);
  badge.append(badgeIcon, document.createTextNode(site.nicho));
  cover.append(preview, badge);
  card.append(cover);

  const body = make("div", "model-body");
  const topline = make("div", "model-topline");
  topline.append(make("span", "model-tag", site.nicho), make("span", "model-domain", domainOf(site.url) || "link em breve"));
  body.append(topline, make("h3", "", site.titulo), make("p", "", site.descricao));

  const actions = make("div", "model-actions");
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

// 6 no desktop, 4 no tablet e 3 no mobile (mesmas colunas do CSS).
export function catalogPerPage() {
  if (window.matchMedia("(min-width: 1024px)").matches) return 6;
  if (window.matchMedia("(min-width: 700px)").matches) return 4;
  return 3;
}

function renderCatalogPage() {
  if (!catalogGrid) return;
  const perPage = catalogView.perPage;
  const start = catalogView.page * perPage;
  const pageItems = catalogResults.slice(start, start + perPage);
  if (!pageItems.length) {
    catalogGrid.replaceChildren(buildEmpty());
  } else {
    const cells = pageItems.map((entry, offset) => buildModelCell(entry.site, entry.index, start + offset, catalogView.page === 0 && offset < 3));
    catalogGrid.replaceChildren(...cells);
    bindTilt(catalogGrid);
  }
  catalogGrid.dataset.page = String(catalogView.page);
  catalogGrid.classList.toggle("is-empty", !catalogResults.length);
  catalogGrid.classList.toggle("is-single", catalogView.pages <= 1);
}
export function renderCatalogProgress() {
  if (!catalogProgress) return;
  catalogProgress.replaceChildren();
  catalogProgress.setAttribute("role", "group");
  catalogProgress.setAttribute("aria-label", "Paginação do catálogo");
  const pages = catalogView.pages;
  if (pages <= 1) return;
  for (let i = 0; i < pages; i++) {
    const dot = make("button", "catalog-dot");
    dot.type = "button";
    dot.dataset.page = String(i);
    dot.setAttribute("aria-label", "Página " + (i + 1));
    dot.setAttribute("aria-controls", "catalogGrid");
    dot.addEventListener("click", () => setCatalogPage(i));
    catalogProgress.append(dot);
  }
  syncCatalogProgressState();
}
export function syncCatalogProgressState() {
  if (!catalogProgress) return;
  Array.prototype.forEach.call(catalogProgress.children, (dot, index) => {
    if (index === catalogView.page) dot.setAttribute("aria-current", "page");
    else dot.removeAttribute("aria-current");
  });
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
  const next = Math.max(0, Math.min(max, Number(index) || 0));
  const changed = next !== catalogView.page;
  catalogView.page = next;
  if (changed) renderCatalogPage();
  syncCatalogNav();
  return changed;
}
export function renderCatalog(animate, options = {}) {
  if (!catalogGrid) return;
  const previousPage = catalogView.page;
  const anchorNode = options.preserve ? catalogGrid.querySelector("[data-index]") : null;
  const anchor = anchorNode ? Number(anchorNode.getAttribute("data-index")) : null;

  catalogResults = [];
  SITES.forEach((site, index) => { if (matchesCatalog(site)) catalogResults.push({ site, index }); });
  const perPage = catalogPerPage();
  const totalPages = Math.max(1, Math.ceil(catalogResults.length / perPage));

  const count = $("#catalogCount");
  if (count) {
    if (catalogState.query) count.textContent = catalogResults.length + (catalogResults.length === 1 ? " modelo encontrado para “" + catalogState.query + "”" : " modelos encontrados para “" + catalogState.query + "”");
    else if (catalogState.nicho === "Todos") count.textContent = catalogResults.length + " modelos prontos para escolher";
    else count.textContent = catalogResults.length + (catalogResults.length === 1 ? " modelo em " + catalogState.nicho : " modelos em " + catalogState.nicho);
  }

  // Filtro/busca voltam à primeira página; resize preserva o modelo âncora (aproximado).
  let target = 0;
  if (options.preserve) {
    const found = anchor === null ? -1 : catalogResults.findIndex((entry) => entry.index === anchor);
    target = found >= 0 ? Math.floor(found / perPage) : previousPage;
  }
  target = Math.max(0, Math.min(totalPages - 1, target));

  catalogView.perPage = perPage;
  catalogView.pages = totalPages;
  catalogView.page = target;
  if (catalogCustom) catalogCustom.replaceChildren(buildCustomCard());
  if (animate) trackEvent("catalog_filter", { nicho: catalogState.nicho, query: catalogState.query, resultados: catalogResults.length });
  renderCatalogProgress();
  syncCatalogNav();
  renderCatalogPage();
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
  // Embeds sem catalogo (hero, planos, etc.): nada para ligar.
  if (!input && !clear && !catalogPrev && !catalogNext) return;
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
  if (catalogPrev) catalogPrev.addEventListener("click", () => setCatalogPage(catalogView.page - 1));
  if (catalogNext) catalogNext.addEventListener("click", () => setCatalogPage(catalogView.page + 1));
  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (catalogPerPage() === catalogView.perPage) return;
      renderCatalog(false, { preserve: true });
    }, 150);
  }, { passive: true });
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
  const url = site ? safeUrl(site.url) : "";
  // Modo seção: sem modal; abre a demonstração em nova aba.
  if (isSectionMode()) {
    if (url) window.open(url, "_blank", "noopener");
    return;
  }
  const modal = $("#previewModal");
  const fallback = $("#modalFallback");
  const art = $("#modalPreviewArt");
  const title = $("#modalTitle");
  const domain = $("#modalDomain");
  const openLink = $("#modalOpen");
  const openTop = $("#modalOpenTop");
  const cta = $("#modalCta");
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
  if (!modal || isSectionMode()) return;
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
