# Publicar no Google Sites

Checklist operacional para publicar o embed da ML Code Solutions no Google Sites usando o jsDelivr
com tag imutável.

> **Estado atual (2026-11-22):** as Fases 0, 1, 2, 3 e 4 estão concluídas: assets em `assets/`,
> zero inline/`innerHTML`, URLs fixas e SRI + CSP (meta injetada pelo build) ativos.
> Hoje existe apenas `dist/embed.html` (embed único). Os **8 embeds por seção**
> (`dist/embed-hero.html` … `dist/embed-contato.html`) e `dist/heights.json` são **planejados para a
> Fase 5**. Enquanto eles não existirem, use o embed único como contingência e considere o aviso de
> rolagem dupla da seção 5.

**Pré-requisitos**

- Node.js >= 20 e `npm ci` executado.
- Acesso de escrita ao repositório `MLCodeSolutions/Site_ML_Code_Solutions` (tag + push).
- Permissão de edição no Google Sites onde a página será publicada.
- Nenhum token/segredo no repositório. Se um token foi exposto, revogue antes do push.

---

## Checklist de publicação (11 passos)

### 1. Build de produção

Rode a validação e o build com a tag que será publicada:

```bash
npm ci
npm run check
npm run freeze
npm run build:release
npm run sri
```

- `build:release` usa por padrão a tag `v1.0.0` definida em `package.json`.
- Para outra versão, edite o script ou rode:
  `node tools/build.mjs --cdn=https://cdn.jsdelivr.net/gh/MLCodeSolutions/Site_ML_Code_Solutions@v1.0.1`
- Confirme que o build terminou com `build OK` e que nenhum budget foi excedido
  (embed < 80 KB; CSS gzip < 40 KB; JS gzip < 30 KB).
- O artefato para colar é o HTML de `dist/` (embed único ou os `embed-*.html` da Fase 5).
  **Não edite `dist/` manualmente.**

### 2. Commit

- Faça commit apenas do que é fonte/configuração: `src/`, `tools/`, `docs/`, `dist/`,
  `package.json`, `package-lock.json`, SVGs, assets.
- Nunca commite `node_modules/`, `index.backup-*.html`, planilhas locais, tokens ou segredos.
- Verifique com `git status` e `git diff --stat` antes de commitar.

### 3. Criar a tag `v1.0.0`

```bash
git tag -a v1.0.0 -m "release v1.0.0"
```

- A tag deve apontar para o commit exato que gerou o `dist/` publicado.
- **Tag é imutável.** Não mova, não apague e não reutilize uma tag já publicada.
- Para a próxima release, incremente (`v1.0.1`, `v1.1.0`, ...) e refaça o build com a nova tag.

### 4. Push

```bash
git push origin main
git push origin v1.0.0
```

- Nunca use force-push em `main`.
- Confirme no GitHub que o commit e a tag estão publicados.

### 5. Validar o jsDelivr

O jsDelivr pode levar alguns minutos para indexar a tag recém-criada (404 inicial é normal).

Valide os arquivos com a tag exata:

```text
https://cdn.jsdelivr.net/gh/MLCodeSolutions/Site_ML_Code_Solutions@v1.0.0/dist/main.min.css
https://cdn.jsdelivr.net/gh/MLCodeSolutions/Site_ML_Code_Solutions@v1.0.0/dist/main.min.js
https://cdn.jsdelivr.net/gh/MLCodeSolutions/Site_ML_Code_Solutions@v1.0.0/assets/svg/logo.svg
```

- Compare os hashes de `dist/integrity.json` com os arquivos servidos (o SRI usa os bytes
  decodificados do arquivo).
- A URL de asset acima já corresponde à fonte da Fase 3 (`assets/svg/`, `assets/img/prints/`,
  `assets/fonts/`); confirme que a tag publicada contém esses caminhos.
- Se algum arquivo der 404, aguarde e tente novamente; não publique com tag quebrada.
- Nunca valide/publique usando `@main` ou `raw.githubusercontent.com`.

### 6. Configurar o Google Sites

- Tema/cabeçalho o mais mínimo possível (evite header duplicado com o embed).
- Fundo da página: `#07030f`.
- Largura do conteúdo: total, para o embed ocupar a coluna.
- Menu nativo do Sites com os links das seções (o embed por seção não tem navegação global).
- Deixe o bloco de “Código incorporado” sem moldura/borda quando possível.

### 7. Inserir os embeds na ordem

No Google Sites: **Inserir → Incorporar → Código incorporado**, cole o HTML do arquivo
correspondente e ajuste a altura conforme a tabela de alturas mais abaixo.

Ordem recomendada dos 8 embeds (planejados na Fase 5):

| # | Arquivo | Conteúdo | Seção/IDs |
|---|---|---|---|
| 1 | `dist/embed-hero.html` | Hero + marquee + stats + trust | `#inicio` |
| 2 | `dist/embed-problema.html` | “O problema” | `#problema` |
| 3 | `dist/embed-servicos.html` | Serviços | `#servicos` |
| 4 | `dist/embed-processo.html` | Processo/timeline | `#processo` |
| 5 | `dist/embed-nichos-modelos.html` | Nichos + catálogo (68 modelos) | `#nichos`, `#modelos` |
| 6 | `dist/embed-planos.html` | Planos + pagamento | `#planos`, `#pagamento` |
| 7 | `dist/embed-sobre-faq.html` | Sobre + FAQ | `#sobre`, `#faq` |
| 8 | `dist/embed-contato.html` | Contato + legal + footer | `#contato`, `#legal` |

- Mantenha a ordem acima: ela preserva a narrativa e as âncoras internas do `embed-contato`.
- No modo seção, “Ver modelo” abre a demonstração direto em nova aba (sem modal).
- O modal de prévia completo existe apenas no embed único.
- Enquanto a Fase 5 não estiver concluída, use `dist/embed.html` como bloco único (ver aviso de
  rolagem dupla mais abaixo).

### 8. Texto nativo entre os blocos

O Google Sites ignora `title`, `meta description`, Open Graph e JSON-LD do embed. O SEO é nativo.
Insira no próprio Sites, fora dos iframes:

- `H1` e descrição curta no topo (ex.: “Sites profissionais por R$ 89,99, no ar em até 5 dias”).
- Um texto curto de serviço/preço antes ou entre os blocos, quando fizer sentido.
- Descrição da página nas configurações do site (usada pelo Google).
- Menu nativo apontando para as seções/âncoras publicadas.

Não duplique o mesmo `H1` no texto nativo e dentro do embed.

### 9. Nome, favicon, URL e imagem de compartilhamento

Nas configurações do Google Sites:

- **Nome do site:** ML Code Solutions.
- **Favicon:** ícone da marca (o embed não fornece favicon).
- **URL amigável:** URL final publicada (ex.: `.../ml-code-solutions-mlcs/mlcs`).
- **Imagem de compartilhamento:** `assets/img/og-1200x630.jpg` (1200×630).
- **Descrição do site:** texto curto com proposta e preço.
- Confirme que a URL final é a mesma usada em `CONFIG.siteUrl`.

### 10. Publicar e testar

- Publique com visibilidade **“Qualquer pessoa”**.
- Teste a URL publicada (não o preview do editor) em:
  - Chrome desktop;
  - Safari iOS (iPhone);
  - Chrome Android.
- Verifique: carregamento do CSS/JS do jsDelivr, fontes, SVGs, prints WebP, links de WhatsApp,
  abertura das demonstrações em nova aba, ausência de rolagem dupla e console sem erros de
  CSP/SRI/404.
- Teste com teclado, foco visível e `prefers-reduced-motion`.

### 11. Search Console e Perfil da Empresa

- Adicione a URL publicada ao **Google Search Console** e solicite indexação.
- Crie/atualize o **Perfil da Empresa no Google** (nome, categoria, área de atendimento, site,
  WhatsApp).
- Como o SEO do embed é ignorado, esses cadastros nativos são o principal canal de descoberta.
- Revalide após algumas semanas: indexação, consultas e eventuais erros.

---

## Tabela de alturas (placeholder — Fase 5)

As alturas serão medidas com Playwright/ResizeObserver em **390 / 768 / 1440 px** e gravadas em
`dist/heights.json` na Fase 5. Preencha a tabela com os valores medidos antes de colar cada bloco.

| Seção | 390 px | 768 px | 1440 px |
|---|---:|---:|---:|
| Hero (`embed-hero`) | _a medir_ | _a medir_ | _a medir_ |
| Problema (`embed-problema`) | _a medir_ | _a medir_ | _a medir_ |
| Serviços (`embed-servicos`) | _a medir_ | _a medir_ | _a medir_ |
| Processo (`embed-processo`) | _a medir_ | _a medir_ | _a medir_ |
| Nichos + modelos (`embed-nichos-modelos`) | _a medir_ | _a medir_ | _a medir_ |
| Planos (`embed-planos`) | _a medir_ | _a medir_ | _a medir_ |
| Sobre + FAQ (`embed-sobre-faq`) | _a medir_ | _a medir_ | _a medir_ |
| Contato + legal (`embed-contato`) | _a medir_ | _a medir_ | _a medir_ |

Notas:

- O Google Sites **não redimensiona** o iframe automaticamente. A altura é definida manualmente no
  bloco de incorporação.
- O `postMessage {type:"mlcs-height",section,h}` é apenas informativo; não altera o iframe sozinho.
- No modo seção, a altura deve ser a altura real do conteúdo (sem scroll interno).
- No embed único, a altura fica em torno de `100vh` e o scroll é interno ao iframe.

---

## Aviso: rolagem dupla no embed único

O embed único (`dist/embed.html`) mantém header estático, FAB do WhatsApp, barra mobile, “voltar ao
topo” e modal. Ele foi desenhado para rolar **dentro do iframe**. No Google Sites, o iframe tem
altura fixa e a página também rola — o resultado é **rolagem dupla** (barra da página + barra do
iframe), o que piora a experiência e o acesso por teclado.

Recomendação: **use os 8 embeds por seção** assim que a Fase 5 estiver concluída. Se precisar do
embed único como contingência:

- defina uma altura generosa no bloco;
- teste em 390/768/1440;
- aceite a rolagem dupla e valide que nenhum elemento `fixed` escapa do iframe;
- não use o embed único em produção por prazo indeterminado.

---

## Fluxo de atualização por tag e repaste

Toda mudança de CSS/JS exige uma **nova tag** e o **repaste de todos os embeds**, porque todos
apontam para a mesma URL/versão com SRI.

1. Edite a fonte em `src/`.
2. Rode `npm run check`, `npm run freeze` e `npm run build:release`.
3. Crie a nova tag (ex.: `v1.0.1`) e ajuste o `--cdn` do build para ela.
4. Commit + push do commit e da tag.
5. Valide CSS/JS/assets no jsDelivr com a nova tag (passo 5 do checklist).
6. No Google Sites, **recole o HTML de cada embed** (`embed.html` ou os 8 `embed-*.html`) para
   atualizar a tag, o SRI e o `data-base`.
7. Republique e teste novamente Chrome/Safari iOS/Android.

Checklist rápido de release:

```text
[ ] npm ci
[ ] npm run check
[ ] npm run freeze
[ ] build com a nova tag
[ ] npm run sri
[ ] commit
[ ] git tag vX.Y.Z
[ ] push main + tag
[ ] jsDelivr OK (CSS/JS/assets)
[ ] repaste de todos os embeds no Sites
[ ] publicar e testar nos 3 navegadores
[ ] Search Console revalidado
```

> Se apenas a copy de uma seção mudar, o CSS/JS ainda é o mesmo recurso com SRI; a forma mais
> segura continua sendo recolocar os embeds com o HTML gerado para a nova tag. Nunca edite o HTML
> já colado no Sites para “corrigir na mão”.
