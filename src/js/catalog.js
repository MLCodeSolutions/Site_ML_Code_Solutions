/* ============================================================
   ML CODE SOLUTIONS · catalogo (engine) e modal de previa
   Extraido de index.html (fase 1)
   ============================================================ */
import { CONFIG } from "./config.js";
import { SITES, nicheMeta } from "./data.js";
import { $, $$, attachShot, domainOf, icon, lite, make, normalizeText, reduced, safeUrl, waLink } from "./util.js";
import { bindTilt, observeReveals, trackEvent } from "./ui.js";
// ===== 11 · CAPAS DO CATÁLOGO (SVG) =====
export function coverGlyph(nicho) {
  if (nicho === "Cabeleireiro") {
    return '<g transform="translate(280 140)" fill="none" stroke="#f5edff" stroke-opacity=".92" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="-23" cy="-27" r="13"/><circle cx="23" cy="-27" r="13"/><path d="M-13 -16 21 37M13 -16-21 37" stroke-width="4"/><path d="M-52 34c13-15 22 9 36-5s19 8 31-8" stroke-opacity=".38" stroke-width="2.4"/><path d="M-3 46h6" stroke-opacity=".35"/></g>';
  }
  if (nicho === "Manicure") {
    return '<g transform="translate(280 138)" stroke="#f5edff" stroke-opacity=".9" stroke-width="2" fill="none" stroke-linejoin="round"><rect x="-24" y="-8" width="48" height="58" rx="14" fill="#f5edff" fill-opacity=".07"/><rect x="-14" y="-30" width="28" height="24" rx="6" fill="#f5edff" fill-opacity=".14"/><path d="M-24 20c13 7 35 7 48 0"/><path d="M-36 -34v10M-41 -29h10" stroke-opacity=".55" stroke-linecap="round"/><path d="M31 -18c-5-5-5-10 0-14 5 4 5 9 0 14Z" fill="#e879f9" stroke="none"/></g>';
  }
  if (nicho === "Veterinária") {
    return '<g transform="translate(280 143)" fill="none" stroke="#f5edff" stroke-opacity=".9" stroke-width="2" stroke-linecap="round"><ellipse cx="-31" cy="-25" rx="9" ry="12"/><ellipse cx="-11" cy="-34" rx="9" ry="12"/><ellipse cx="11" cy="-34" rx="9" ry="12"/><ellipse cx="31" cy="-25" rx="9" ry="12"/><path d="M0 -6c19 0 31 13 31 26 0 12-14 22-31 22S-31 32-31 20C-31 7-19-6 0-6Z" fill="#f5edff" fill-opacity=".08"/><path d="M0 13c-6-7-16-2-13 6 2 5 13 11 13 11s11-6 13-11c3-8-7-13-13-6Z" fill="#e879f9" fill-opacity=".8" stroke="none"/></g>';
  }
  if (nicho === "Banho e tosa") {
    return '<g transform="translate(280 145)" fill="none" stroke="#f5edff" stroke-opacity=".9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M-52 6h104v20c0 18-14 32-32 32h-40c-18 0-32-14-32-32Z" fill="#f5edff" fill-opacity=".07"/><path d="M-52 6h104M-20 6V-18a12 12 0 0 1 21-8"/><path d="M-26 58v9M26 58v9"/><circle cx="18" cy="-29" r="6"/><circle cx="33" cy="-15" r="3.5"/><path d="M-34 -28c-9-9-9-18 0-26 9 8 9 17 0 26Z" fill="#38bdf8" stroke="none"/></g>';
  }
  if (nicho === "Prestadores de serviços gerais") {
    return '<g transform="translate(250 82) scale(6.6)" fill="none" stroke="#f5edff" stroke-opacity=".9" stroke-width=".3" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/></g>';
  }
  if (nicho === "Joalheria e acessórios") {
    return '<g transform="translate(250 92) scale(6.8)" fill="none" stroke="#f5edff" stroke-opacity=".9" stroke-width=".3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9l4-6Z" fill="#f5edff" fill-opacity=".06"/><path d="M2 9h20M9 3 6 9l6 12M15 3l3 6-6 12"/></g>';
  }
  return '<g transform="translate(280 140)" fill="none" stroke="#f5edff" stroke-opacity=".9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M-43 2h86v46h-86z" fill="#f5edff" fill-opacity=".07"/><path d="M-43 2c12 10 24 10 36 0s24-10 36 0 10 10 10 10"/><path d="M-43 18c12 10 24 10 36 0s24-10 36 0" stroke-opacity=".35"/><rect x="-4" y="-44" width="8" height="46" rx="4" fill="#f5edff" fill-opacity=".14"/><path d="M0 -57c-8-8-8-16 0-22 8 6 8 14 0 22Z" fill="#e879f9" stroke="none"/><circle cx="-26" cy="29" r="3" fill="#e879f9" stroke="none"/><circle cx="20" cy="33" r="2.4" fill="#c084fc" stroke="none"/></g>';
}
export function coverSVG(nicho, index) {
  const meta = nicheMeta(nicho);
  const palette = meta.palette || [meta.accent, meta.accent2];
  const accent = palette[index % palette.length];
  const accent2 = palette[(index + 2) % palette.length];
  const flip = index % 2 === 0;
  const gx1 = flip ? "0" : "1";
  const gx2 = flip ? "1" : "0";
  const glowX = 230 + (index % 3) * 45;
  const glowY = 70 + (index % 2) * 50;
  return '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
    '<defs>' +
    '<linearGradient id="cov' + index + '" x1="' + gx1 + '" y1="0" x2="' + gx2 + '" y2="1"><stop stop-color="' + accent2 + '"/><stop offset="1" stop-color="' + accent + '"/></linearGradient>' +
    '<radialGradient id="covr' + index + '"><stop stop-color="' + accent + '" stop-opacity=".55"/><stop offset="1" stop-color="' + accent + '" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="covs' + index + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    '</defs>' +
    '<rect width="400" height="300" fill="#090311"/>' +
    '<circle cx="' + glowX + '" cy="' + glowY + '" r="150" fill="url(#covr' + index + ')"/>' +
    '<path d="M-20 250 160 -20h90L70 300Z" fill="' + accent + '" opacity=".07"/>' +
    '<g stroke="#f5edff" stroke-opacity=".035">' +
      '<path d="M0 60h400M0 120h400M0 180h400M0 240h400"/>' +
      '<path d="M60 0v300M140 0v300M220 0v300M300 0v300"/>' +
    '</g>' +
    '<g class="cover-frame">' +
      '<rect x="28" y="30" width="344" height="240" rx="13" fill="#0d0518" stroke="' + accent + '" stroke-opacity=".35"/>' +
      '<path d="M28 64h344" stroke="' + accent + '" stroke-opacity=".22"/>' +
      '<circle cx="44" cy="47" r="3.5" fill="#e879f9" opacity=".85"/><circle cx="55" cy="47" r="3.5" fill="' + accent + '" opacity=".8"/><circle cx="66" cy="47" r="3.5" fill="#6d28d9" opacity=".9"/>' +
      '<rect x="82" y="40" width="142" height="14" rx="7" fill="#f5edff" fill-opacity=".055" stroke="' + accent + '" stroke-opacity=".16"/>' +
      '<circle cx="91" cy="47" r="2" fill="' + accent + '"/><rect x="98" y="45" width="76" height="4" rx="2" fill="#b9a8d4" fill-opacity=".24"/>' +
      '<g>' +
        '<rect x="48" y="84" width="56" height="12" rx="6" fill="' + accent + '" fill-opacity=".16" stroke="' + accent + '" stroke-opacity=".35"/>' +
        '<circle cx="56" cy="90" r="2" fill="#e879f9"/><rect x="63" y="88" width="30" height="4" rx="2" fill="#f5edff" fill-opacity=".45"/>' +
        '<rect x="48" y="110" width="124" height="10" rx="5" fill="#f5edff" fill-opacity=".75"/>' +
        '<rect x="48" y="126" width="94" height="10" rx="5" fill="' + accent + '" fill-opacity=".7"/>' +
        '<rect x="48" y="149" width="138" height="5" rx="2.5" fill="#b9a8d4" fill-opacity=".25"/>' +
        '<rect x="48" y="160" width="110" height="5" rx="2.5" fill="#b9a8d4" fill-opacity=".16"/>' +
        '<rect x="48" y="181" width="74" height="22" rx="11" fill="url(#cov' + index + ')"/>' +
        '<rect x="60" y="189" width="46" height="6" rx="3" fill="#fff" fill-opacity=".72"/>' +
      '</g>' +
      '<rect x="208" y="82" width="142" height="121" rx="11" fill="' + accent + '" fill-opacity=".075" stroke="' + accent + '" stroke-opacity=".3"/>' +
      '<circle cx="214" cy="146" r="4" fill="#f5edff" fill-opacity=".2"/><path d="M208 203c18-24 31-4 48-22s31-8 50-20 32 1 44 11v31H208Z" fill="' + accent + '" fill-opacity=".18"/>' +
      coverGlyph(nicho) +
      '<rect x="48" y="216" width="94" height="34" rx="7" fill="#f5edff" fill-opacity=".04" stroke="#f5edff" stroke-opacity=".07"/>' +
      '<rect x="58" y="226" width="38" height="4" rx="2" fill="' + accent + '" fill-opacity=".8"/><rect x="58" y="236" width="58" height="4" rx="2" fill="#b9a8d4" fill-opacity=".2"/>' +
      '<rect x="152" y="216" width="94" height="34" rx="7" fill="#f5edff" fill-opacity=".04" stroke="#f5edff" stroke-opacity=".07"/>' +
      '<rect x="162" y="226" width="44" height="4" rx="2" fill="#f5edff" fill-opacity=".55"/><rect x="162" y="236" width="64" height="4" rx="2" fill="#b9a8d4" fill-opacity=".2"/>' +
      '<rect x="256" y="216" width="94" height="34" rx="7" fill="#f5edff" fill-opacity=".04" stroke="#f5edff" stroke-opacity=".07"/>' +
      '<circle cx="270" cy="233" r="6" fill="' + accent + '" fill-opacity=".5"/><rect x="282" y="229" width="48" height="4" rx="2" fill="#f5edff" fill-opacity=".4"/><rect x="282" y="238" width="34" height="3" rx="1.5" fill="#b9a8d4" fill-opacity=".2"/>' +
    '</g>' +
    '<g class="cover-shine"><g transform="skewX(-16)"><rect x="-120" y="24" width="80" height="256" fill="url(#covs' + index + ')"/></g></g>' +
    '<circle cx="356" cy="22" r="3" fill="' + accent + '" opacity=".8"/><circle cx="24" cy="282" r="2.4" fill="#e879f9" opacity=".7"/>' +
    '</svg>';
}

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
  cover.innerHTML = coverSVG(site.nicho, index);
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
  const glyph = make("div");
  glyph.append(icon("i-search"));
  const clear = make("button", "btn btn-ghost", "Limpar filtros");
  clear.type = "button";
  clear.addEventListener("click", clearFilters);
  empty.append(glyph, make("h3", "", "Em breve, novos modelos neste nicho."), make("p", "", "Enquanto isso, peça um modelo sob medida ou tente outra busca."), clear);
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
    catalogGrid.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-preview]");
      if (!trigger) return;
      openPreview(Number(trigger.getAttribute("data-preview")), trigger);
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
    art.innerHTML = coverSVG(site.nicho, index).replace(/id="cov/g, 'id="mcv').replace(/url\(#cov/g, 'url(#mcv');
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
