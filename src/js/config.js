/* ============================================================
   ML CODE SOLUTIONS · CONFIG (dados do negocio)
   Extraido de index.html (fase 1)
   ============================================================ */
'use strict';
/* ============================================================
   ML CODE SOLUTIONS · SCRIPT
   Edite os dados abaixo. Nada aqui depende de build ou servidor.
   ============================================================ */

// ===== 01 · CONFIG (DADOS DO NEGÓCIO) =====
// WhatsApp no formato 55 + DDD + número, só dígitos.
// siteUrl: preencha com a URL final (ex.: "https://mlcodesolutions.com") para ativar canonical, og:url e sitemap.
export const CONFIG = {
  marca: "ML Code Solutions",
  slogan: "Seu site profissional por R$ 89,99, no ar em até 5 dias e sem mensalidade",
  whatsapp: "5512991956121",
  email: "projetos.mlcodesolutions@gmail.com",
  siteUrl: "https://sites.google.com/view/ml-code-solutions-mlcs/mlcs",
  // Fatos que podem aparecer abaixo do CTA sem prometer prazo/garantia.
  heroTrust: ["Pagamento único na entrega", "Atendimento 100% online", "Sem mensalidade"],
  // Políticas comerciais: edite e confirme antes de publicar.
  politicas: {
    prazo: "Até 5 dias úteis após o envio de todo o conteúdo e a aprovação do briefing.",
    pagamento: "O pagamento é único: R$ 89,99 via Pix, na entrega do site publicado. Se você não aprovar o layout, o site não é publicado e você não paga nada.",
    garantia: "Você aprova o layout antes da publicação. Se não aprovar, o site não é publicado e você não paga nada. Aprovado e publicado, o pagamento é único de R$ 89,99 na entrega.",
    dominio: "O site pode ser publicado no Google Sites. Um domínio próprio é opcional e contratado à parte.",
    mensalidade: "Não. O site é publicado no Google Sites sem mensalidade da ML Code Solutions. Só há custo se você quiser um domínio próprio ou um serviço de terceiros, sempre informado antes.",
    extras: "Domínio próprio, páginas extras, textos/fotos adicionais e alterações fora do escopo são orçados à parte."
  },
  // Prints reais do catálogo: a base vem de `data-base` no build de produção
  // (jsDelivr com tag imutável) ou de ../assets/img/prints/ no preview local.
  // Se a imagem não existir, o card mantém a capa SVG (nunca fica em branco).
  sobre: {
    texto: "Sou Mateus, engenheiro de software e responsável pela ML Code Solutions. Crio sites diretos ao ponto para pequenos negócios que precisam existir com profissionalismo na internet, sem complicação e sem depender de agência.",
    assinatura: "Mateus · ML Code Solutions"
  },
  // Escassez opcional: deixe ativo:false. Nada de contador falso.
  urgencia: { ativo: false, texto: "", detalhe: "" }, // CONFIRMAR se for usar
  // Analytics opcional: só carrega se os IDs forem preenchidos.
  // Preencha o ID GA4 (G-XXXXXXX) para ativar analytics com consentimento.
  // O banner só aparece quando ga4 ou metaPixel estiverem preenchidos.
  analytics: { ga4: "", metaPixel: "" },
  seo: {
    title: "Sites profissionais por R$ 89,99 em até 5 dias | ML Code Solutions",
    description: "Sites profissionais para pequenos negócios. R$ 89,99 via Pix na entrega, no ar em até 5 dias úteis e sem mensalidade. Atendimento 100% online no WhatsApp.",
    image: "../assets/img/og-1200x630.jpg"
  },
  whatsappMensagens: {
    header: "Olá! Vim pelo site da ML Code Solutions e gostaria de um orçamento para o site do meu negócio.",
    hero: "Olá! Quero um site profissional por R$ 89,99, com pagamento na entrega e prazo de até 5 dias. Como funciona?",
    mobile: "Olá! Quero um site profissional por R$ 89,99, com pagamento na entrega e prazo de até 5 dias. Pode me explicar como começar?",
    fab: "Olá! Estou no site da ML Code Solutions e gostaria de falar sobre a criação do meu site.",
    servicos: "Olá! Vi os recursos no site da ML Code Solutions e quero um site com esses mesmos recursos para o meu negócio.",
    problema: "Olá! Meu negócio ainda não tem site e quero resolver isso com a ML Code Solutions. Pode me explicar como funciona?",
    catalogo: "Olá! Vi o catálogo da ML Code Solutions e quero um site personalizado para o meu negócio. Pode me ajudar a escolher um modelo?",
    modelo: "Olá! Gostei do modelo \"{titulo}\" para {nicho} no site da ML Code Solutions. Quero um site parecido, personalizado com a minha marca. Pode me passar os detalhes?",
    plano: "Olá! Quero contratar o {plano} por {preco}, com pagamento via Pix na entrega e prazo de até 5 dias. Pode me explicar os próximos passos?",
    pagamento: "Olá! Quero pagar via Pix na entrega do site publicado. Pode me explicar como começamos?",
    final: "Olá! Quero criar o site do meu negócio com a ML Code Solutions. Pode me explicar o prazo de até 5 dias e como começamos?",
    faq: "Olá! Tenho uma dúvida sobre a criação do meu site e gostaria de falar com a ML Code Solutions.",
    sobre: "Olá, Mateus! Vi a página da ML Code Solutions e quero conversar sobre o site do meu negócio.",
    rodape: "Olá! Vim pelo site da ML Code Solutions e quero falar sobre a criação do meu site."
  },
  planos: [
    {
      nome: "Site Profissional", preco: 89.99, sufixo: "", destaque: true, selo: "",
      resumo: "Uma página completa para apresentar o seu negócio, receber contatos no WhatsApp e publicar com pagamento único na entrega.",
      motivo: "Tudo o que o seu negócio precisa para começar no digital.",
      itens: [
        "Página única com até 5 seções",
        "Layout responsivo no celular, tablet e desktop",
        "Botões de WhatsApp e redes sociais",
        "Galeria de fotos e textos organizados",
        "SEO on-page (títulos, descrição e estrutura)",
        "Publicação no Google Sites",
        "2 rodadas de ajustes"
      ],
      naoIncluido: ["Domínio próprio", "Páginas extras", "Loja virtual"]
    }
  ]
};
