/* ============================================================
   ML CODE SOLUTIONS · chrome, scroll, reveals, consentimento
   Extraido de index.html (fase 1)
   ============================================================ */
import { CONFIG } from "./config.js";
import { $, $$, finePointer, lite, make, reduced, waLink } from "./util.js";

/* revealObserver vive aqui: usado por observeReveals/initReveals */
let revealObserver = null;
// ===== 04 · CONTATOS GLOBAIS =====
export function syncContacts() {
  const emailLink = "mailto:" + CONFIG.email;
  $$('[data-contact="email"]').forEach((node) => { node.textContent = CONFIG.email; });
  $$('[data-contact-link="email"]').forEach((node) => { node.setAttribute("href", emailLink); });
  $$("[data-wa]").forEach((node) => {
    const key = node.getAttribute("data-wa") || "hero";
    const template = CONFIG.whatsappMensagens[key] || CONFIG.whatsappMensagens.hero;
    const origin = node.getAttribute("data-origin") || key;
    node.setAttribute("href", waLink(template));
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
    node.setAttribute("data-lead-origin", origin);
  });
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
  $$("[data-brand]").forEach((node) => { node.textContent = CONFIG.marca; });
  $$("[data-slogan]").forEach((node) => { node.textContent = CONFIG.slogan; });
  $$("[data-sobre]").forEach((node) => { node.textContent = CONFIG.sobre?.texto || ""; });
  $$("[data-sobre-sign]").forEach((node) => { node.textContent = CONFIG.sobre?.assinatura || ""; });
  const prices = (CONFIG.planos || []).map((plano) => Number(plano.preco)).filter((value) => Number.isFinite(value));
  if (prices.length) {
    const from = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.min(...prices));
    $$("[data-price-from]").forEach((node) => { node.textContent = from; });
  }
  syncPolicies();
}
export function syncSeo() {
  const title = CONFIG.seo?.title || (CONFIG.marca + " — " + CONFIG.slogan);
  const description = CONFIG.seo?.description || CONFIG.slogan;
  const setMeta = (selector, value) => {
    $$(selector).forEach((node) => node.setAttribute("content", value));
  };
  document.title = title;
  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[name="twitter:title"]', title);
  setMeta('meta[name="twitter:description"]', description);
  const image = CONFIG.seo?.image || "";
  if (image) {
    setMeta('meta[property="og:image"]', image);
    setMeta('meta[name="twitter:image"]', image);
  }
  const siteUrl = String(CONFIG.siteUrl || "").trim().replace(/\/+$/, "");
  if (!siteUrl) return;
  const home = siteUrl + "/";
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.append(canonical);
  }
  canonical.setAttribute("href", home);
  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement("meta");
    ogUrl.setAttribute("property", "og:url");
    document.head.append(ogUrl);
  }
  ogUrl.setAttribute("content", home);
}
export function initImageFallback() {
  $$(".cta-aurora").forEach((img) => {
    const hide = () => { img.hidden = true; };
    img.addEventListener("error", hide, { capture: true });
    if (img.complete && img.naturalWidth === 0) hide();
  });
}
export function syncPolicies() {
  $$("[data-policy]").forEach((node) => {
    const value = CONFIG.politicas?.[node.getAttribute("data-policy")];
    if (value) node.textContent = value;
  });
}

// ===== 05 · MENU / HEADER =====
export function initHeader() {
  const header = $(".site-header");
  const toggle = $("#navToggle");
  const nav = $("#nav");
  if (!header || !toggle || !nav) return;

  nav.setAttribute("tabindex", "-1");
  const close = (restoreFocus) => {
    header.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu de navegação");
    if (restoreFocus) toggle.focus({ preventScroll: true });
  };
  toggle.addEventListener("click", () => {
    const open = !header.classList.contains("nav-open");
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu de navegação" : "Abrir menu de navegação");
    if (open) nav.focus({ preventScroll: true });
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) close(false);
  });
  document.addEventListener("pointerdown", (event) => {
    if (!header.classList.contains("nav-open")) return;
    if (!header.contains(event.target)) close(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("nav-open")) close(true);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 940) close(false);
  }, { passive: true });

  const navLinks = $$(".nav-link");
  const navMap = new Map(navLinks.map((link) => [link.getAttribute("href"), link]));
  const sectionIds = ["inicio", "problema", "servicos", "processo", "modelos", "planos", "sobre", "faq", "contato"];
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header.classList.toggle("is-scrolled", window.scrollY > 18);
      const marker = window.innerHeight * 0.42;
      let currentId = "";
      sectionIds.forEach((id) => {
        const section = document.getElementById(id);
        if (!section) return;
        const rect = section.getBoundingClientRect();
        if (rect.top <= marker && rect.bottom > marker) currentId = id;
      });
      navLinks.forEach((link) => link.removeAttribute("aria-current"));
      const active = navMap.get("#" + currentId);
      if (active) active.setAttribute("aria-current", "true");
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ===== 14 · REVEALS =====
export function observeReveals() {
  const nodes = $$(".reveal:not(.in)");
  if (!nodes.length) return;
  if (!("IntersectionObserver" in window) || reduced()) {
    nodes.forEach((node) => node.classList.add("in"));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
  }
  revealObserver.disconnect();
  nodes.forEach((node) => revealObserver.observe(node));
}
export function initReveals() {
  if (!("IntersectionObserver" in window) || reduced()) {
    $$(".reveal").forEach((node) => node.classList.add("in"));
    return;
  }
  document.documentElement.classList.add("reveal-on");
  observeReveals();
  window.setTimeout(() => {
    $$(".reveal:not(.in)").forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) node.classList.add("in");
    });
  }, 3200);
}

// ===== 16 · LINHA DO TEMPO =====
export function initTimeline() {
  const timeline = $("#timeline");
  if (!timeline) return;
  if (!("IntersectionObserver" in window)) { timeline.classList.add("is-drawn"); return; }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      timeline.classList.add("is-drawn");
      observer.disconnect();
    });
  }, { threshold: 0.3 });
  observer.observe(timeline);
}

// ===== 18 · TILT / SPOTLIGHT =====
export function bindTilt(root) {
  if (!finePointer() || reduced() || lite()) return;
  $$(".tilt", root || document).forEach((element) => {
    if (element.dataset.tiltBound === "1") return;
    element.dataset.tiltBound = "1";
    let frame = 0;
    let mx = 0;
    let my = 0;
    const apply = () => {
      frame = 0;
      element.style.setProperty("--mx", mx.toFixed(2) + "%");
      element.style.setProperty("--my", my.toFixed(2) + "%");
      element.style.setProperty("--rx", ((0.5 - my / 100) * 7).toFixed(2) + "deg");
      element.style.setProperty("--ry", ((mx / 100 - 0.5) * 8).toFixed(2) + "deg");
    };
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      mx = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
      my = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
      if (!frame) frame = requestAnimationFrame(apply);
    }, { passive: true });
    element.addEventListener("pointerleave", () => {
      element.style.setProperty("--mx", "50%");
      element.style.setProperty("--my", "50%");
      element.style.setProperty("--rx", "0deg");
      element.style.setProperty("--ry", "0deg");
    });
  });
}

// ===== 19 · RIPPLE / BOTÕES MAGNÉTICOS =====
export function initRipple() {
  if (lite()) return;
  document.addEventListener("pointerdown", (event) => {
    const button = event.target.closest(".btn");
    if (!button || reduced()) return;
    const rect = button.getBoundingClientRect();
    const ripple = make("span", "ripple");
    ripple.style.left = (event.clientX - rect.left) + "px";
    ripple.style.top = (event.clientY - rect.top) + "px";
    button.append(ripple);
    window.setTimeout(() => ripple.remove(), 680);
  }, { passive: true });
}
export function initMagnetic() {
  if (!finePointer() || reduced() || lite()) return;
  $$(".magnetic").forEach((element) => {
    if (element.dataset.magneticBound === "1") return;
    element.dataset.magneticBound = "1";
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const dx = Math.max(-7, Math.min(7, (event.clientX - (rect.left + rect.width / 2)) / rect.width * 14));
      const dy = Math.max(-6, Math.min(6, (event.clientY - (rect.top + rect.height / 2)) / rect.height * 12));
      element.style.translate = dx.toFixed(2) + "px " + dy.toFixed(2) + "px";
    });
    element.addEventListener("pointerleave", () => { element.style.translate = "0px 0px"; });
  });
}

// ===== 20 · CANVAS DO HERO =====
export function initHeroCanvas() {
  const canvas = $("#stars");
  const hero = $("#inicio");
  if (!canvas || !hero) return;
  if (lite()) { canvas.remove(); return; }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  let width = 0;
  let height = 0;
  let stars = [];
  let frame = 0;
  let running = false;
  let heroVisible = false;
  let shooting = null;
  const mouse = { x: 0.5, y: 0.5, active: false };
  const palette = ["#c084fc", "#e879f9", "#f5edff", "#a855f7"];
  const staticMode = lite();

  const makeStars = () => {
    const count = staticMode ? 54 : reduced() ? 54 : Math.min(120, Math.max(46, Math.round(width / 13)));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.35 + Math.random() * 1.45,
      depth: 0.25 + Math.random() * 0.75,
      phase: Math.random() * Math.PI * 2,
      speed: 0.0004 + Math.random() * 0.0012,
      color: palette[Math.floor(Math.random() * palette.length)]
    }));
  };
  const resize = () => {
    const rect = hero.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    const dpr = staticMode ? Math.min(1.5, window.devicePixelRatio || 1) : Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeStars();
    if (!running) draw(performance.now());
  };
  const draw = (time) => {
    ctx.clearRect(0, 0, width, height);
    const mx = mouse.active ? (mouse.x - 0.5) : 0;
    const my = mouse.active ? (mouse.y - 0.5) : 0;
    stars.forEach((star) => {
      const ox = mx * 22 * star.depth;
      const oy = my * 16 * star.depth;
      const twinkle = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(time * star.speed + star.phase));
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(star.x + ox, star.y + oy, star.r, 0, Math.PI * 2);
      ctx.fill();
      if (star.r > 1.25) {
        ctx.globalAlpha = twinkle * 0.22;
        ctx.beginPath();
        ctx.arc(star.x + ox, star.y + oy, star.r * 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
    if (!reduced()) {
      if (!shooting && Math.random() < 0.0018) {
        shooting = { x: width * (0.2 + Math.random() * 0.6), y: height * Math.random() * 0.4, vx: 5 + Math.random() * 4, vy: 2 + Math.random() * 2, life: 1 };
      }
      if (shooting) {
        shooting.x += shooting.vx * 2.2;
        shooting.y += shooting.vy * 2.2;
        shooting.life -= 0.018;
        const gradient = ctx.createLinearGradient(shooting.x, shooting.y, shooting.x - 90, shooting.y - 38);
        gradient.addColorStop(0, "rgba(245,237,255,.75)");
        gradient.addColorStop(1, "rgba(168,85,247,0)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(shooting.x, shooting.y);
        ctx.lineTo(shooting.x - 90, shooting.y - 38);
        ctx.stroke();
        if (shooting.life <= 0) shooting = null;
      }
    }
  };
  const loop = (time) => {
    draw(time);
    frame = requestAnimationFrame(loop);
  };
  const start = () => {
    if (running || reduced()) return;
    running = true;
    frame = requestAnimationFrame(loop);
  };
  const stop = () => {
    running = false;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  resize();
  if (staticMode) {
    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 160);
    }, { passive: true });
    return;
  }
  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    mouse.y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    mouse.active = true;
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { mouse.active = false; });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => { heroVisible = entry.isIntersecting; if (entry.isIntersecting) start(); else stop(); });
    }, { threshold: 0 }).observe(hero);
  } else {
    heroVisible = true;
    start();
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (heroVisible) start();
  });
  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(hero);
  } else {
    window.addEventListener("resize", resize, { passive: true });
  } 
}

// ===== 21 · PARALLAX DO HERO =====
export function initHeroParallax() {
  const visual = $(".hero-visual");
  const layer = $("#heroParallax");
  if (!visual || !layer || !finePointer() || reduced() || lite()) return;
  visual.addEventListener("pointermove", (event) => {
    const rect = visual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    layer.style.setProperty("--px", (x * 14).toFixed(2) + "px");
    layer.style.setProperty("--py", (y * 10).toFixed(2) + "px");
  }, { passive: true });
  visual.addEventListener("pointerleave", () => {
    layer.style.setProperty("--px", "0px");
    layer.style.setProperty("--py", "0px");
  });
}

// ===== 22 · TRACKING E CONSENTIMENTO =====
export const CONSENT_KEY = "mlcs:consent:v1";
export function consentState() {
  try { return localStorage.getItem(CONSENT_KEY) || ""; } catch (error) { return ""; }
}
export function analyticsEnabled() {
  const analytics = CONFIG.analytics || {};
  return Boolean(analytics.ga4 || analytics.metaPixel);
}
export function trackEvent(name, params = {}) {
  window.dataLayer = window.dataLayer || [];
  const data = { ...params };
  delete data.event;
  window.dataLayer.push({ event: name, ...data });
  if (typeof window.gtag === "function") window.gtag("event", name, data);
  if (typeof window.fbq === "function" && name === "generate_lead") {
    window.fbq("track", "Contact", { content_name: data.origem || "site" });
  }
}
export function loadAnalytics() {
  if (!analyticsEnabled() || consentState() !== "granted") return;
  const analytics = CONFIG.analytics || {};
  if (analytics.ga4 && !window.__mlcsGa4) {
    window.__mlcsGa4 = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(analytics.ga4);
    document.head.appendChild(script);
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" });
    window.gtag("consent", "update", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted" });
    window.gtag("js", new Date());
    window.gtag("config", analytics.ga4, { anonymize_ip: true });
  }
  if (analytics.metaPixel && /^\d{5,}$/.test(String(analytics.metaPixel)) && !window.__mlcsPixel) {
    window.__mlcsPixel = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
    window.fbq = window.fbq || function fbq() { (window.fbq.queue = window.fbq.queue || []).push(arguments); };
    window.fbq("init", String(analytics.metaPixel));
    window.fbq("track", "PageView");
  }
}
export function initConsent() {
  const banner = $("#cookieBanner");
  const prefs = $("#cookiePrefs");
  if (!analyticsEnabled()) {
    if (banner) banner.hidden = true;
    if (prefs) prefs.hidden = true;
    return;
  }
  if (prefs) prefs.hidden = false;
  const show = () => { if (banner) banner.hidden = false; };
  const hide = () => { if (banner) banner.hidden = true; };
  const decide = (value) => {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (error) {}
    hide();
    if (value === "granted") loadAnalytics();
    else if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" });
    }
  };
  if (consentState() === "granted") loadAnalytics();
  else if (!consentState()) show();
  if (banner) {
    $$("[data-consent]", banner).forEach((button) => {
      button.addEventListener("click", () => decide(button.getAttribute("data-consent")));
    });
  }
  if (prefs) prefs.addEventListener("click", show);
}
export function initTracking() {
  window.dataLayer = window.dataLayer || [];
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-lead-origin]");
    if (!link) return;
    trackEvent("generate_lead", {
      origem: link.getAttribute("data-lead-origin") || "site",
      plano: link.getAttribute("data-lead-plan") || "",
      modelo: link.getAttribute("data-lead-model") || "",
      nicho: link.getAttribute("data-lead-niche") || ""
    });
  });
  document.addEventListener("toggle", (event) => {
    const details = event.target;
    if (!details || !details.matches || !details.matches("details.faq-item") || !details.open) return;
    const summary = details.querySelector("summary span");
    trackEvent("faq_open", { pergunta: summary ? summary.textContent.trim() : "" });
  }, true);
}
export function initMobileCta() {
  const bar = $("#mobileCta");
  if (!bar) return;
  const close = $("#mobileCtaClose");
  let dismissed = false;
  let visible = false;
  let ticking = false;
  const update = () => {
    ticking = false;
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const show = mobile && !dismissed && window.scrollY > Math.max(460, window.innerHeight * 0.65) && !document.body.classList.contains("modal-open");
    if (show === visible) return;
    visible = show;
    bar.hidden = !show;
    document.body.classList.toggle("mobile-cta-open", show);
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  if (close) close.addEventListener("click", () => { dismissed = true; update(); });
  update();
}

export function initScrollUI() {
  const top = $("#toTop");
  const bar = $("#toTopBar");
  const circumference = 2 * Math.PI * 20;
  if (bar) {
    bar.style.strokeDasharray = circumference;
    bar.style.strokeDashoffset = circumference;
  }
  let ticking = false;
  const update = () => {
    ticking = false;
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const y = window.scrollY || doc.scrollTop || 0;
    const ratio = Math.max(0, Math.min(1, y / max));
    if (top) top.classList.toggle("is-visible", y > 560);
    if (bar) bar.style.strokeDashoffset = String(circumference * (1 - ratio));
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  update();
  if (top) {
    top.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
    });
  }
}

// ===== 24 · LINKS LEGAIS =====
export function initLegalLinks() {
  const openHash = () => {
    if (!location.hash) return;
    let target = null;
    try { target = document.querySelector(location.hash); } catch (error) { return; }
    if (target && target.matches("details")) target.open = true;
  };
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href="#privacidade"], a[href="#termos"]');
    if (link) window.setTimeout(openHash, 0);
  });
  window.addEventListener("hashchange", openHash);
  openHash();
}

// ===== 25 · PAUSA DE ANIMAÇÕES FORA DA TELA =====
export function initSectionPause() {
  if (!("IntersectionObserver" in window)) return;
  const sections = [$("#inicio"), $("#contato")].filter(Boolean);
  if (!sections.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle("is-paused", !entry.isIntersecting));
  }, { rootMargin: "120px 0px" });
  sections.forEach((section) => observer.observe(section));
}
