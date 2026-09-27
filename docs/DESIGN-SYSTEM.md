# DESIGN SYSTEM — ISIS STORE

> **Documento:** `docs/DESIGN-SYSTEM.md`  
> **Fase:** 02 — Design System  
> **Data:** 2026-09-26  
> **Fontes Primordiais de Referência:**
> - `docs/img/design-1.png` (Quadro Geral do Design System v1.0)
> - `docs/img/design-2.png` (Tokens, Variações de Logo, Sombras, Estados e Mobile)
> - `docs/img/tela.png` (Layout do Storefront, Grid 12 colunas, Hero Slider e Benefícios)
> - `docs/img/login.png` (Fluxos de Autenticação, Split View, Estados de Formulário)
> - `docs/img/cliente.png` (Área do Cliente, Dashboard, Sidebar, Cards de Pedido)
> - `docs/img/logo/logo.jpeg` (Emblema Oficial 3D e Ícones de Categoria)
> - `docs/img/banner-rosto.jpeg` (Banner Editorial Oficial)

---

## 1. Identidade e Conceito da Marca

* **Nome:** Isis Store
* **Slogan Oficial:** *"Tudo o que você ama, em um só lugar! ♡"*
* **Pilares:** Beleza • Estilo • Você
* **Nossa Essência:** Mais que produtos, entregamos carinho em cada detalhe.
* **Nossos Valores:** Qualidade • Confiança • Atendimento • Respeito • Amor em cada pedido.
* **Nosso Propósito:** Tornar o seu dia a dia mais leve, bonito e especial.

---

## 2. Paleta de Cores Oficial

Extraída com exatidão cromática das referências visuais oficiais:

| Token CSS | Hexadecimal | Uso Principal |
| :--- | :--- | :--- |
| `--cor-primaria` | `#E08CA3` | Botões primários, links ativos, badges de destaque, bordas de foco |
| `--cor-primaria-hover` | `#D47992` | Estado de hover em botões primários |
| `--cor-primaria-active` | `#C46881` | Estado pressionado/ativo |
| `--cor-primaria-soft` | `#FDF2F4` | Fundo de tags, badges suaves, caixas de destaque |
| `--cor-primaria-border` | `#F3B3C3` | Bordas sutis em elementos destacados |
| `--cor-secundaria` | `#F9C7D4` | Detalhes, ícones de categorias, seleções |
| `--cor-secundaria-clara` | `#FCD9E1` | Fundos secundários, hover de cards, parte de elementos |
| `--cor-fundo` | `#FFF5F6` | Background geral da aplicação (off-white rosado suave) |
| `--cor-fundo-card` | `#FFFFFF` | Superfície de cards, modais e formulários |
| `--cor-fundo-elevado` | `#FFF9FA` | Cards com elevação ou destaque suave |
| `--cor-texto-escuro` | `#574240` | Títulos, descrições, labels e textos principais (marrom quente) |
| `--cor-texto-medio` | `#7A615F` | Subtítulos, textos de apoio e dados secundários |
| `--cor-texto-claro` | `#A38B89` | Placeholders, datas, preços tachados e rodapés |

### Gradientes Oficiais
* **Gradiente Primário:** `linear-gradient(135deg, #E08CA3 0%, #F9C7D4 100%)` (Banners, botões de ação especial e destaques).

### Estados Funcionais
* **Sucesso:** `#4E8752` (Fundo: `#EDF7EE`) — Pagamento aprovado, item adicionado, login bem-sucedido.
* **Alerta / Atenção:** `#B8860B` (Fundo: `#FFFBEA`) — Últimas unidades, sessão expirando.
* **Erro:** `#C24343` (Fundo: `#FDF2F2`) — Falha de pagamento, campo obrigatório inválido.
* **Info:** `#5A7EA8` (Fundo: `#F2F7FD`) — Avisos informativos, rastreamento.

---

## 3. Tipografia

A hierarquia tipográfica combina elegância editorial serifada com clareza funcional sans-serif:

1. **Editorial & Títulos (Playfair Display):**
   * Usada em: Hero, títulos de seções, chamadas de produto, boas-vindas na área do cliente.
   * Pesos: Normal (400), Bold (700).
2. **Interface & Dados (Inter):**
   * Usada em: Menus, botões, preços, formulários, tabelas, dashboards e microcopy.
   * Pesos: Regular (400), Medium (500), SemiBold (600), Bold (700).

---

## 4. Escala de Espaçamento e Raios de Borda

### Espaçamento (Base 4)
* `xs`: 4px
* `sm`: 8px
* `md`: 12px
* `base`: 16px
* `lg`: 24px
* `xl`: 32px
* `2xl`: 48px
* `3xl`: 64px

### Raios de Borda (`border-radius`)
* `sm`: 6px (Badges pequenos, checkboxes)
* `md`: 10px (Inputs, botões, tags)
* `lg`: 16px (Cards de produto, itens de carrinho, caixas de benefícios)
* `xl`: 24px (Modais, containers principais, banners)
* `full`: 9999px (Pills de status, círculos de categorias, avatares)

### Sombras (Calorosas / Anti-Generic)
* **Sutil:** `0 1px 3px rgba(87, 66, 64, 0.05)`
* **Média:** `0 4px 14px rgba(87, 66, 64, 0.07)`
* **Intensa:** `0 10px 30px rgba(87, 66, 64, 0.10)`

---

## 5. Categorias Oficiais

Conforme definido na logo oficial e na tela principal:
1. **Personalizados:** Presentes, canecas, caixas decoradas.
2. **Infantil / Baby:** Pelúcias, roupinhas, acessórios de bebê.
3. **Masculino / Feminino:** Moda e vestuário.
4. **Casa / Eletrônicos:** Headphones, caixas de som JBL, luminárias e decor.
5. **Acessórios:** Colares com coração, bolsas femininas, carteiras e relógios.

---

## 6. Catálogo de Componentes do Design System

### 6.1 Botões (`Button`)
* **Primary:** Fundo `#E08CA3`, texto branco, cantos arredondados (`rounded-xl`), hover escurecido (`#D47992`), feedback tátil.
* **Secondary / Outline:** Borda `#E08CA3`, texto `#E08CA3`, fundo transparente com hover suave em `#FDF2F4`.
* **Ghost / Text:** Sem borda, texto `#574240`, sublinhado sutil no hover.
* **Icon Button:** Formato circular ou quadrado arredondado para ações rápidas (Wishlist, fechar modal, adicionar ao carrinho).

### 6.2 Formulários (`Input`, `Checkbox`, `Switch`)
* Labels claros com asterisco vermelho para obrigatórios.
* Borda padrão `#F2DEE2`, foco suave com anel em `#E08CA3`.
* Estado de erro com borda `#C24343` e mensagem clara logo abaixo do campo.
* Checkboxes com preenchimento em tom rosa e ícone de checkmark branco.

### 6.3 Badges de Status
* `Em estoque`: Verde suave.
* `Últimas unidades`: Âmbar / Laranja suave.
* `Indisponível`: Cinza neutro.
* `Em promoção` / `-20%`: Rosa vibrante.
* `Mais vendido`: Destaque com estrela ou coração.

### 6.4 Card de Produto
* Imagem quadrada ou 4:3 com cantos suaves.
* Tag de desconto no topo esquerdo.
* Botão de favoritos (coração) no topo direito.
* Título em Inter SemiBold ou Playfair.
* Avaliação em estrelas douradas com contagem de reviews.
* Preço promocional em destaque rosa escuro com preço anterior tachado.
* Botão de ação rápida "Adicionar ao carrinho".

### 6.5 Mini-Carrinho / Cart Drawer
* Gaveta lateral suave com backdrop desfocado.
* Lista de itens com checkbox, thumbnail, título, controles de quantidade `[-] 1 [+]` e remoção.
* Subtotal, cálculo de frete e botão proeminente "Finalizar compra".

### 6.6 Feedback Visual e Notificações (Toasts)
* 4 variantes (Sucesso, Atenção, Erro, Informação) com ícones Lucide dedicados e opção de fechar.

### 6.7 Estados Obrigatórios
* **Skeleton:** Placeholders pulsantes em off-white rosado.
* **Empty State:** Sacola ilustrada delicada com mensagem amigável e botão CTA ("Explorar produtos").
* **Error State:** Tratamento acolhedor com botão "Tentar novamente".
