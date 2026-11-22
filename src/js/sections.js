/* ============================================================
   ML CODE SOLUTIONS · planos, urgencia, nichos e destaques
   Extraido de index.html (fase 1)
   ============================================================ */
import { CONFIG } from "./config.js";
import { SITES, nicheMeta } from "./data.js";
import { $, formatPrice, icon, make, waLink } from "./util.js";
import { bindTilt } from "./ui.js";
import { buildModelCell, nicheList, selectNiche } from "./catalog.js";
// ===== 09 · PLANOS =====
export function renderPlans() {
  const grid = $("#plansGrid");
  if (!grid) return;
  const frag = document.createDocumentFragment();
  CONFIG.planos.forEach((plano, index) => {
    const card = make("article", "plan reveal" + (plano.destaque ? " plan--featured" : ""));
    card.style.setProperty("--i", String(index));
    if (plano.selo) card.append(make("span", "plan-badge", plano.selo));
    card.append(make("h3", "plan-name", plano.nome));
    card.append(make("p", "plan-desc", plano.resumo || ""));
    if (plano.motivo) card.append(make("p", "plan-reason", plano.motivo));
    const price = make("p", "plan-price");
    price.append(make("small", "", "R$"));
    price.append(make("strong", "", new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(plano.preco) || 0)));
    if (plano.sufixo) price.append(make("span", "plus", plano.sufixo));
    card.append(price);
    const list = make("ul", "plan-list");
    (plano.itens || []).forEach((item) => {
      const li = make("li");
      li.append(icon("i-check"));
      li.append(make("span", "", item));
      list.append(li);
    });
    card.append(list);
    if ((plano.naoIncluido || []).length) {
      const excluded = make("p", "plan-excluded");
      excluded.append(make("strong", "", "Não incluso: "));
      excluded.append(document.createTextNode(plano.naoIncluido.join(" · ")));
      card.append(excluded);
    }
    const cta = make("a", "btn " + (plano.destaque ? "btn-primary" : "btn-outline") + " magnetic");
    const origin = "plano: " + plano.nome;
    cta.href = waLink(CONFIG.whatsappMensagens.plano, { plano: plano.nome, preco: formatPrice(plano) });
    cta.target = "_blank";
    cta.rel = "noopener noreferrer";
    cta.dataset.leadOrigin = origin;
    cta.dataset.leadPlan = plano.nome;
    cta.append(make("span", "", "Quero o " + plano.nome), icon("i-arrow"));
    card.append(cta);
    frag.append(card);
  });
  grid.replaceChildren(frag);
}

// ===== 09A · URGÊNCIA OPCIONAL =====
export function renderUrgency() {
  const el = $("#urgencyBanner");
  if (!el) return;
  const urgency = CONFIG.urgencia || {};
  if (!urgency.ativo || !urgency.texto) { el.hidden = true; return; }
  el.replaceChildren();
  el.append(make("b", "", urgency.texto));
  if (urgency.detalhe) el.append(make("span", "", urgency.detalhe));
  el.hidden = false;
}

export function renderNiches() {
  const grid = $("#nicheGrid");
  if (!grid) return;
  const frag = document.createDocumentFragment();
  nicheList().forEach((nicho) => {
    const count = SITES.filter((site) => site.nicho === nicho).length;
    const button = make("button", "niche-card");
    button.type = "button";
    const glyph = document.createElement("span");
    glyph.innerHTML = nicheMeta(nicho).icon;
    if (glyph.firstElementChild) button.append(glyph.firstElementChild);
    const copy = document.createElement("div");
    copy.append(make("b", "", nicho), make("span", "", count + (count === 1 ? " modelo" : " modelos")));
    button.append(copy);
    button.setAttribute("aria-label", "Ver modelos de " + nicho);
    button.addEventListener("click", () => selectNiche(nicho, true));
    frag.append(button);
  });
  grid.replaceChildren(frag);
}
export function renderFeatured() {
  const grid = $("#featuredGrid");
  if (!grid) return;
  const titles = ["Studio Camélia", "Casa Aberta Vet", "Patinha Spa", "Rosa Romântico", "Casa Cacau", "Casa Solene"];
  const frag = document.createDocumentFragment();
  titles.forEach((title, order) => {
    const index = SITES.findIndex((site) => site.titulo === title);
    if (index < 0) return;
    frag.append(buildModelCell(SITES[index], index, order, order < 3));
  });
  grid.replaceChildren(frag);
  bindTilt(grid);
}
