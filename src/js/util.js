/* ============================================================
   ML CODE SOLUTIONS · helpers compartilhados
   Extraido de index.html (fase 1)
   ============================================================ */
import { CONFIG } from "./config.js";
// ===== 03 · HELPERS =====
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
export const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
export const lite = () => window.matchMedia("(max-width: 760px), (hover: none) and (pointer: coarse)").matches
  || navigator.connection?.saveData === true;
export const digitsOnly = (value) => String(value || "").replace(/\D+/g, "");
export const normalizeText = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
export function icon(id, className) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  if (className) svg.setAttribute("class", className);
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", "#" + id);
  svg.appendChild(use);
  return svg;
}
export function safeUrl(raw) {
  try {
    const url = new URL(String(raw));
    return (url.protocol === "http:" || url.protocol === "https:") ? url.href : "";
  } catch (error) {
    return "";
  }
}
export function domainOf(raw) {
  const safe = safeUrl(raw);
  if (!safe) return "";
  return new URL(safe).hostname.replace(/^www\./, "");
}
export function printFileName(site) {
  if (site && site.image) return String(site.image).trim();
  const safe = safeUrl(site && site.url);
  if (!safe) return "";
  try {
    const segments = new URL(safe).pathname.split("/").filter(Boolean);
    const slug = segments[segments.length - 1] || "";
    return slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") + ".jpg";
  } catch (error) {
    return "";
  }
}
export function assetBase() {
  const base = document.documentElement.dataset.base;
  return base ? base.replace(/\/?$/, "/") : "../";
}
export function assetUrl(pathname) {
  return assetBase() + String(pathname).replace(/^\/+/, "");
}
export function printBases() {
  const bases = [];
  // Build de produção injeta data-base com a tag imutável do jsDelivr (assets/img/prints/).
  const base = document.documentElement.dataset.base;
  if (base) {
    bases.push(base.replace(/\/?$/, "/") + "img/prints/");
    return bases;
  }
  // Dev: o index.html fica em /src, os prints na raiz do projeto.
  bases.push("../prints/");
  if (CONFIG.printsBase) bases.push(CONFIG.printsBase);
  if (CONFIG.printsCdn && !bases.includes(CONFIG.printsCdn)) bases.push(CONFIG.printsCdn);
  return bases;
}
export function attachShot(container, site, options = {}) {
  const file = printFileName(site);
  const bases = printBases();
  if (!file || !container || !bases.length) return null;
  const sizes = "(max-width: 640px) 60vw, (max-width: 1020px) 46vw, 30vw";
  let baseIndex = 0;
  let picture = null;
  let img = null;
  const fail = () => {
    container.classList.remove("shot-pending");
    if (picture) picture.remove();
    if (options.onError) options.onError();
  };
  const mount = () => {
    if (baseIndex >= bases.length) { fail(); return; }
    const base = bases[baseIndex];
    if (picture) picture.remove();
    picture = document.createElement("picture");
    const webp = document.createElement("source");
    webp.type = "image/webp";
    const stem = file.replace(/\.jpe?g$/i, "");
    webp.srcset = base + stem + "-600.webp 600w, " + base + stem + "-1200.webp 1200w";
    webp.sizes = sizes;
    img = make("img", "model-shot");
    img.alt = options.alt || "";
    img.width = 1200;
    img.height = 900;
    img.sizes = sizes;
    img.src = base + file;
    img.loading = options.eager ? "eager" : "lazy";
    img.fetchPriority = options.eager ? "high" : "auto";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    img.addEventListener("load", () => {
      if (!img.naturalWidth) { baseIndex += 1; mount(); return; }
      img.classList.add("is-loaded");
      container.classList.remove("shot-pending");
      if (options.onLoad) options.onLoad(img);
    });
    img.addEventListener("error", () => {
      baseIndex += 1;
      mount();
    });
    picture.append(webp, img);
    container.classList.add("shot-pending");
    container.append(picture);
  };
  mount();
  return img;
}
export function waLink(template, vars = {}) {
  const message = String(template || "").replace(/\{(\w+)\}/g, (_, key) => (vars[key] !== undefined ? String(vars[key]) : ""));
  return "https://wa.me/" + digitsOnly(CONFIG.whatsapp) + "?text=" + encodeURIComponent(message);
}
export function formatPrice(plano) {
  const base = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(plano.preco) || 0);
  return base + (plano.sufixo || "");
}
