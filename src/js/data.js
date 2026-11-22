/* ============================================================
   ML CODE SOLUTIONS · catalogo de modelos e nichos
   Extraido de index.html (fase 1)
   ============================================================ */
// ============================================
//  CATÁLOGO DE MODELOS (GOOGLE SITES)
//  Para trocar a URL de um modelo, edite o campo "url".
//  Para adicionar um modelo ou um nicho novo, basta
//  criar outro objeto (o filtro é gerado sozinho).
// ============================================
// Fonte: Sites modelos.xlsx (aba Modelos).
// Preserve nome, nicho e URL exatamente como na planilha.
// "image" é opcional: por padrão o catálogo usa prints/<slug-da-url>.jpg.
// Se o print não existir, a capa SVG do card permanece (sem tela em branco).
export const SITES = [
  { titulo: "Studio Camélia", nicho: "Cabeleireiro", url: "https://sites.google.com/view/mlcs-studiocamelia", image: "", descricao: "Visual delicado e acolhedor para um salão com atendimento próximo." },
  { titulo: "Meia-Noite Noir", nicho: "Cabeleireiro", url: "https://sites.google.com/view/mlcs-meia-noitenoir", image: "", descricao: "Estética escura e sofisticada para uma barbearia autoral." },
  { titulo: "Corte Cru Brutal", nicho: "Cabeleireiro", url: "https://sites.google.com/view/mlcs-cortecrubrutal", image: "", descricao: "Visual direto e urbano para quem valoriza corte e atitude." },
  { titulo: "Bigode Fino Retrô", nicho: "Cabeleireiro", url: "https://sites.google.com/view/mlcs-bigode-fino-retr", image: "", descricao: "Clima vintage com bigode, navalha e acabamento clássico." },
  { titulo: "Fade Lab Neon", nicho: "Cabeleireiro", url: "https://sites.google.com/view/mlcs-fadelabneon", image: "", descricao: "Degradê, neon e energia jovem para uma barbearia moderna." },
  { titulo: "Aurora Club Glass", nicho: "Cabeleireiro", url: "https://sites.google.com/view/mlcs-auroraclubglass", image: "", descricao: "Salão claro e contemporâneo com efeito de vidro e leveza." },
  { titulo: "Casa Aberta Vet", nicho: "Veterinária", url: "https://sites.google.com/view/mlcs-casa-aberta-vet/cav", image: "", descricao: "Clínica acolhedora com serviços, equipe e contato de emergência." },
  { titulo: "Veterinárias a Domicílio", nicho: "Veterinária", url: "https://sites.google.com/view/mlcs-veterinariasadomicilio", image: "", descricao: "Atendimento em casa explicado com serviços e agendamento fácil." },
  { titulo: "Patrulha Pet 24h", nicho: "Veterinária", url: "https://sites.google.com/view/mlcs-patrulha-pet-24h", image: "", descricao: "Plantão 24h com emergência, serviços e contato imediato." },
  { titulo: "Clínica de Bolso", nicho: "Veterinária", url: "https://sites.google.com/view/mlcs-clinica-de-bolso", image: "", descricao: "Clínica enxuta e prática, com informações ao alcance do tutor." },
  { titulo: "Vet na Mala", nicho: "Veterinária", url: "https://sites.google.com/view/mlcs-vet-na-mala", image: "", descricao: "Consultas e visitas com uma comunicação simples e direta." },
  { titulo: "Vet de Família", nicho: "Veterinária", url: "https://sites.google.com/view/mlcs-vetdefamilia", image: "", descricao: "Clínica de bairro com cuidado próximo e serviços organizados." },
  { titulo: "Íris Vet", nicho: "Veterinária", url: "https://sites.google.com/view/mlcs-irisvet", image: "", descricao: "Visual sereno para uma clínica com foco em cuidado e confiança." },
  { titulo: "Bia em Casa", nicho: "Veterinária", url: "https://sites.google.com/view/mlcs-bia-em-casa", image: "", descricao: "Atendimento domiciliar apresentado de forma leve e pessoal." },
  { titulo: "Nina Vet", nicho: "Veterinária", url: "https://sites.google.com/view/mlcs-nina-vet", image: "", descricao: "Clínica afetiva com serviços, equipe e agendamento pelo WhatsApp." },
  { titulo: "Clara Vet", nicho: "Veterinária", url: "https://sites.google.com/view/mlcs-clara-vet", image: "", descricao: "Layout limpo para explicar consultas, exames e cuidados." },
  { titulo: "Sofia Vet", nicho: "Veterinária", url: "https://sites.google.com/view/mlcs-sofia-vet", image: "", descricao: "Clínica delicada e profissional, com foco em prevenção." },
  { titulo: "Órbita Vet", nicho: "Veterinária", url: "https://sites.google.com/view/mlcs-orbitavet", image: "", descricao: "Visual moderno e tecnológico para uma clínica veterinária." },
  { titulo: "Vet no Papo", nicho: "Veterinária", url: "https://sites.google.com/view/mlcs-vet-no-papo", image: "", descricao: "Conteúdo próximo e conversa fácil sobre saúde animal." },
  { titulo: "Ateliê de Bichos", nicho: "Veterinária", url: "https://sites.google.com/view/mlcs-ateliedebichos", image: "", descricao: "Clínica com jeito artesanal e cuidado em cada detalhe." },
  { titulo: "Patinha Spa", nicho: "Banho e tosa", url: "https://sites.google.com/view/mlcs-patinhaspa", image: "", descricao: "Spa pet com banho, tosa e agendamento em poucos toques." },
  { titulo: "Água e Sombra", nicho: "Banho e tosa", url: "https://sites.google.com/view/mlcs-aguaesombra", image: "", descricao: "Banho e tosa com clima tranquilo, sombra e água fresca." },
  { titulo: "Zoomies", nicho: "Banho e tosa", url: "https://sites.google.com/view/mlcs-zoomies", image: "", descricao: "Visual divertido para um banho e tosa cheio de energia." },
  { titulo: "Atelier Pelo", nicho: "Banho e tosa", url: "https://sites.google.com/view/mlcs-atelier-pelo", image: "", descricao: "Cuidado com o pelo e acabamento tratado como ateliê." },
  { titulo: "Folha e Focinho", nicho: "Banho e tosa", url: "https://sites.google.com/view/mlcs-folha-e-focinho", image: "", descricao: "Banho e tosa natural, com produtos e serviços explicados." },
  { titulo: "Banho Boom", nicho: "Banho e tosa", url: "https://sites.google.com/view/mlcs-banhoboom", image: "", descricao: "Identidade vibrante para um banho e tosa descontraído." },
  { titulo: "Aurora Pet Spa", nicho: "Banho e tosa", url: "https://sites.google.com/view/mlcs-aurora-pet-spa", image: "", descricao: "Experiência de spa pet com serviços e agenda organizada." },
  { titulo: "Bicho Limpo", nicho: "Banho e tosa", url: "https://sites.google.com/view/mlcs-bicho-limpo", image: "", descricao: "Visual simples e direto para banho, tosa e cuidados básicos." },
  { titulo: "Banho Clube", nicho: "Banho e tosa", url: "https://sites.google.com/view/mlcs-banho-clube", image: "", descricao: "Clube de banho e tosa com planos e rotina de cuidado." },
  { titulo: "Dia de Banho", nicho: "Banho e tosa", url: "https://sites.google.com/view/mlcs-diadebanho", image: "", descricao: "Página leve para mostrar o dia de banho e tosa do pet." },
  { titulo: "Rosa Romântico", nicho: "Manicure", url: "https://sites.google.com/view/mlcs-rosaromntico", image: "", descricao: "Unhas em tons de rosa com clima romântico e delicado." },
  { titulo: "Nude Minimalista Editorial", nicho: "Manicure", url: "https://sites.google.com/view/mlcs-nude-minimalista-edit", image: "", descricao: "Nude, clean e editorial para um estúdio de unhas minimalista." },
  { titulo: "Black & Gold Luxo", nicho: "Manicure", url: "https://sites.google.com/view/mlcs-black-gold-luxo", image: "", descricao: "Preto e dourado para um serviço de unhas sofisticado." },
  { titulo: "Lilás Dreamy", nicho: "Manicure", url: "https://sites.google.com/view/mlcs-lils-dreamy", image: "", descricao: "Lilás suave e atmosfera dreamy para unhas delicadas." },
  { titulo: "Vinho & Rosé Sofisticado", nicho: "Manicure", url: "https://sites.google.com/view/mlcs-vinhorossofisticado", image: "", descricao: "Vinho e rosé em um layout elegante para o seu estúdio." },
  { titulo: "Pop Colorido Divertido", nicho: "Manicure", url: "https://sites.google.com/view/mlcs-popcoloridodivertido", image: "", descricao: "Cores fortes e clima pop para um estúdio de unhas divertido." },
  { titulo: "Verde Spa Natural", nicho: "Manicure", url: "https://sites.google.com/view/mlcs-verde-spa-natural", image: "", descricao: "Verde e natural para um serviço de unhas com cuidado spa." },
  { titulo: "Glassmorphism Neon Feminino", nicho: "Manicure", url: "https://sites.google.com/view/mlcs-glassmorphismneonfeminino", image: "", descricao: "Vidro, neon e feminilidade em um visual de unhas moderno." },
  { titulo: "Terracota Boho", nicho: "Manicure", url: "https://sites.google.com/view/mlcs-terracota-boho", image: "", descricao: "Terracota e boho para um estúdio de unhas com personalidade." },
  { titulo: "Plantão 24h", nicho: "Prestadores de serviços gerais", url: "https://sites.google.com/view/mlcs-plantao-24h", image: "", descricao: "Serviço 24h com contato rápido e áreas de atendimento claras." },
  { titulo: "Planta Técnica", nicho: "Prestadores de serviços gerais", url: "https://sites.google.com/view/mlcs-plantatecnica", image: "", descricao: "Visual técnico para apresentar projetos, plantas e orçamentos." },
  { titulo: "Brutalista", nicho: "Prestadores de serviços gerais", url: "https://sites.google.com/view/mlcs-brutalista", image: "", descricao: "Estética forte e direta para um prestador de serviços gerais." },
  { titulo: "Editorial Água", nicho: "Prestadores de serviços gerais", url: "https://sites.google.com/view/mlcs-editorialagua", image: "", descricao: "Layout editorial para serviços hidráulicos e atendimento ágil." },
  { titulo: "Circuito Neon", nicho: "Prestadores de serviços gerais", url: "https://sites.google.com/view/mlcs-circuitoneon", image: "", descricao: "Neon e tecnologia para serviços elétricos e manutenção." },
  { titulo: "Casa Segura", nicho: "Prestadores de serviços gerais", url: "https://sites.google.com/view/mlcs-casasegura", image: "", descricao: "Serviços residenciais com foco em segurança e confiança." },
  { titulo: "Oficina Calma", nicho: "Prestadores de serviços gerais", url: "https://sites.google.com/view/mlcs-casaechave", image: "", descricao: "Visual clean para serviços gerais, com orçamento e contato direto." },
  { titulo: "Suíço Direto", nicho: "Prestadores de serviços gerais", url: "https://sites.google.com/view/mlcs-suico-direto", image: "", descricao: "Comunicação objetiva para serviços de manutenção e reparos." },
  { titulo: "Noturno Premium", nicho: "Prestadores de serviços gerais", url: "https://sites.google.com/view/mlcs-noturno-premium", image: "", descricao: "Atendimento noturno com apresentação escura e premium." },
  { titulo: "Bairro Ilustrado", nicho: "Prestadores de serviços gerais", url: "https://sites.google.com/view/mlcs-bairroilustrado", image: "", descricao: "Serviços locais com ilustrações e linguagem de bairro." },
  { titulo: "Doce Linha", nicho: "Confeitaria / doceria", url: "https://sites.google.com/view/mlcs-doce-linha", image: "", descricao: "Doces delicados com cardápio enxuto e encomenda fácil." },
  { titulo: "Casa Cacau", nicho: "Confeitaria / doceria", url: "https://sites.google.com/view/mlcs-casacacau", image: "", descricao: "Chocolate em destaque, com produtos e encomendas pelo WhatsApp." },
  { titulo: "Doce Herança", nicho: "Confeitaria / doceria", url: "https://sites.google.com/view/mlcs-doce-herana", image: "", descricao: "Receitas de família apresentadas com afeto e tradição." },
  { titulo: "Pop Cupcake", nicho: "Confeitaria / doceria", url: "https://sites.google.com/view/mlcs-popcupcake", image: "", descricao: "Cupcakes coloridos e clima pop para festas e encomendas." },
  { titulo: "Doce Encontro", nicho: "Confeitaria / doceria", url: "https://sites.google.com/view/mlcs-doce-encontro", image: "", descricao: "Doces para encontros, com cardápio e pedidos organizados." },
  { titulo: "Mesa Bordô", nicho: "Confeitaria / doceria", url: "https://sites.google.com/view/mlcs-mesa-bord", image: "", descricao: "Mesa posta em tons de bordô para doces e eventos." },
  { titulo: "Brigada", nicho: "Confeitaria / doceria", url: "https://sites.google.com/view/mlcs-brigada", image: "", descricao: "Brigadeiros artesanais com sabores e encomenda direta." },
  { titulo: "Jardim Doce", nicho: "Confeitaria / doceria", url: "https://sites.google.com/view/mlcs-jardim-doce", image: "", descricao: "Confeitaria leve e floral, com doces e bolos explicados." },
  { titulo: "Pote Doce", nicho: "Confeitaria / doceria", url: "https://sites.google.com/view/mlcs-pote-doce", image: "", descricao: "Doces em pote com vitrine simples e pedido pelo WhatsApp." },
  { titulo: "Doce Ofício", nicho: "Confeitaria / doceria", url: "https://sites.google.com/view/mlcs-doce-ofcio", image: "", descricao: "Confeitaria artesanal com foco no ofício e nos detalhes." },
  { titulo: "Aurora Delicada", nicho: "Joalheria e acessórios", url: "https://sites.google.com/view/mlcs-aurora-delicada", image: "", descricao: "Peças delicadas com brilho suave e apresentação clean." },
  { titulo: "Vitrine Neon", nicho: "Joalheria e acessórios", url: "https://sites.google.com/view/mlcs-vitrine-neon", image: "", descricao: "Joias em uma vitrine neon, jovem e cheia de contraste." },
  { titulo: "Papelaria Terra", nicho: "Joalheria e acessórios", url: "https://sites.google.com/view/mlcs-papelariaterra", image: "", descricao: "Acessórios com estética terrosa e clima de papelaria." },
  { titulo: "Espelho Minimal", nicho: "Joalheria e acessórios", url: "https://sites.google.com/view/mlcs-espelho-minimal", image: "", descricao: "Minimalismo e reflexo para valorizar peças pequenas." },
  { titulo: "Botânica", nicho: "Joalheria e acessórios", url: "https://sites.google.com/view/mlcs-botanica", image: "", descricao: "Joias com inspiração natural, folhas e detalhes orgânicos." },
  { titulo: "Pérola Clássica", nicho: "Joalheria e acessórios", url: "https://sites.google.com/view/mlcs-prola-clssica", image: "", descricao: "Pérolas e clássicos em um layout elegante e atemporal." },
  { titulo: "Pop Colorida", nicho: "Joalheria e acessórios", url: "https://sites.google.com/view/mlcs-popcolorida", image: "", descricao: "Acessórios coloridos e divertidos para um público jovem." },
  { titulo: "Forja Masculina", nicho: "Joalheria e acessórios", url: "https://sites.google.com/view/mlcs-forjamasculina", image: "", descricao: "Linha masculina com metal, textura e visual robusto." },
  { titulo: "Casa Solene", nicho: "Joalheria e acessórios", url: "https://sites.google.com/view/mlcs-casasolene", image: "", descricao: "Joalheria solene, com peças especiais e atendimento próximo." }
];

// ===== 02 · NICHOS (ÍCONES E ACENTOS) =====
export const NICHOS = {
  "Cabeleireiro": {
    slug: "cabeleireiro", accent: "#a855f7", accent2: "#7c3aed",
    palette: ["#a855f7", "#8b2eff", "#c084fc", "#9333ea", "#e879f9", "#7c3aed"],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="16.5" r="2.5"/><path d="m8.7 8.8 10.8 7.9M8.7 15.2 19.5 7.3"/></svg>'
  },
  "Veterinária": {
    slug: "veterinaria", accent: "#34d399", accent2: "#059669",
    palette: ["#34d399", "#10b981", "#6ee7b7", "#059669", "#2dd4bf", "#047857"],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="7.6" cy="8.4" rx="1.9" ry="2.5"/><ellipse cx="12" cy="6.8" rx="1.9" ry="2.5"/><ellipse cx="16.4" cy="8.4" rx="1.9" ry="2.5"/><path d="M12 10.5c3.7 0 5.8 2.8 5.8 5.1 0 2.1-2.4 3.9-5.8 3.9s-5.8-1.8-5.8-3.9c0-2.3 2.1-5.1 5.8-5.1Z"/></svg>'
  },
  "Banho e tosa": {
    slug: "banho-tosa", accent: "#38bdf8", accent2: "#0284c7",
    palette: ["#38bdf8", "#0ea5e9", "#7dd3fc", "#0284c7", "#22d3ee", "#0369a1"],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16v2a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-2Z"/><path d="M8 12V6a2.5 2.5 0 0 1 4.8-1"/><path d="M9 20v2M15 20v2"/><circle cx="16.5" cy="6" r="1.2"/><circle cx="19" cy="9" r=".8"/></svg>'
  },
  "Manicure": {
    slug: "manicure", accent: "#e879f9", accent2: "#c026d3",
    palette: ["#e879f9", "#c026d3", "#f0abfc", "#a855f7", "#d946ef", "#a21caf"],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 8V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V8"/><rect x="7" y="8" width="10" height="12" rx="3"/><path d="M7 13c3 1 7 1 10 0"/><path d="M18.5 4.5v3M17 6h3"/></svg>'
  },
  "Prestadores de serviços gerais": {
    slug: "servicos-gerais", accent: "#fbbf24", accent2: "#d97706",
    palette: ["#fbbf24", "#f59e0b", "#fcd34d", "#d97706", "#fb923c", "#b45309"],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/></svg>'
  },
  "Confeitaria / doceria": {
    slug: "confeitaria", accent: "#c084fc", accent2: "#e879f9",
    palette: ["#c084fc", "#e879f9", "#a855f7", "#f0abfc", "#8b2eff", "#d8b4fe"],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13h14v7H5z"/><path d="M5 13c2 1.7 4 1.7 6 0s4-1.7 6 0 2 1.7 3 1.7"/><path d="M12 8V4M10.4 4h3.2"/><path d="M12 4c-1.3-1.2-1.3-2.6 0-3.4C13.3 1.4 13.3 2.8 12 4Z" fill="currentColor" stroke="none"/></svg>'
  },
  "Joalheria e acessórios": {
    slug: "joalheria", accent: "#fcd34d", accent2: "#ca8a04",
    palette: ["#fcd34d", "#f59e0b", "#fde68a", "#ca8a04", "#fbbf24", "#a16207"],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12l4 6-10 12L2 9l4-6Z"/><path d="M2 9h20M9 3 6 9l6 12M15 3l3 6-6 12"/></svg>'
  }
};

// Nicho genérico para quando você adicionar um nome novo em SITES sem criar
// uma configuração em NICHOS. O filtro e o card continuam funcionando.
export const NICHE_FALLBACK = {
  slug: "outros",
  accent: "#a855f7",
  accent2: "#7c3aed",
  palette: ["#a855f7", "#8b2eff", "#c084fc", "#e879f9"],
  icon: NICHOS["Cabeleireiro"].icon
};
export function nicheMeta(name) {
  return Object.prototype.hasOwnProperty.call(NICHOS, name) ? NICHOS[name] : NICHE_FALLBACK;
}
