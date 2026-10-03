# ISIS STORE — DESIGN SYSTEM / ESPECIFICAÇÃO DA DASHBOARD DO CLIENTE

## Documento de referência para implementação

**Projeto:** Isis Store  
**Tela:** Dashboard do Cliente / Minha Conta  
**Rota principal:** `/conta`  
**Referência:** imagem de referência fornecida pelo cliente.

> Este documento transforma a referência visual em uma especificação para implementação em React/Next.js/TypeScript/Tailwind, preservando a identidade da Isis Store e garantindo que a dashboard seja uma área real da conta do cliente.

---

# 1. OBJETIVO

A Dashboard do Cliente é a tela principal da área autenticada da Isis Store.

Ela deve permitir encontrar rapidamente:

- resumo da conta;
- pedidos recentes;
- status dos pedidos;
- favoritos;
- endereços;
- cupons;
- dados cadastrais;
- suporte;
- atalhos para as principais áreas da conta.

A experiência deve transmitir:

```text
simples
acolhedora
organizada
feminina
elegante
rápida
confiável
```

A tela deve parecer parte da mesma loja apresentada na Home e no Login, mas com linguagem própria de área autenticada.

---

# 2. DIREÇÃO VISUAL

A referência utiliza:

- fundo off-white muito claro;
- rosa como cor de destaque;
- cards claros;
- bordas suaves;
- sombras discretas;
- tipografia serifada para títulos/editorial;
- tipografia sans-serif para interface;
- ícones lineares;
- cantos arredondados;
- fotografia de produtos e lifestyle;
- pequenos detalhes de coração.

Evitar:

- excesso de gradientes;
- excesso de glassmorphism;
- excesso de blur;
- cards gigantes;
- animações exageradas;
- aparência de dashboard SaaS genérico;
- dados falsos apresentados como dados reais.

---

# 3. IDENTIDADE VISUAL

## Paleta oficial

```css
:root {
  --cor-primaria: #E08CA3;
  --cor-secundaria: #F9C7D4;
  --cor-secundaria-clara: #FCD9E1;
  --cor-fundo: #FFF5F6;
  --cor-texto-escuro: #574240;
}
```

Criar tokens complementares:

```text
--color-success
--color-warning
--color-error
--color-info
--color-surface
--color-border
--color-muted
```

As cores de estado devem complementar a marca sem dominar a interface.

---

# 4. TIPOGRAFIA

## Títulos

```text
Playfair Display
```

Uso:

- títulos principais;
- mensagens de boas-vindas;
- destaques;
- comunicação editorial.

## Interface

```text
Inter
```

Uso:

- menus;
- botões;
- labels;
- tabela;
- pedidos;
- preços;
- formulários;
- estados.

Limitar o sistema a essas duas famílias principais.

---

# 5. ROTAS

Dashboard:

```text
/conta
```

Subrotas:

```text
/conta/pedidos
/conta/pedidos/[id]
/conta/dados
/conta/enderecos
/conta/favoritos
/conta/cupons
/conta/suporte
/conta/seguranca
```

A dashboard funciona como hub da conta.

---

# 6. COMPOSIÇÃO GERAL

Desktop:

```text
┌──────────────┬────────────────────────────────────────────┐
│              │ Topbar                                     │
│   Sidebar    ├────────────────────────────────────────────┤
│              │ Hero / boas-vindas                        │
│              ├────────────────────────────────────────────┤
│              │ Atalhos da conta                          │
│              ├──────────────────────────┬─────────────────┤
│              │ Pedidos recentes         │ Resumo da conta │
│              ├──────────────────────────┼─────────────────┤
│              │ Favoritos                │ Endereço        │
│              │                          ├─────────────────┤
│              │                          │ Suporte         │
│              ├──────────────────────────┴─────────────────┤
│              │ Conecte-se com a gente                     │
└──────────────┴────────────────────────────────────────────┘
```

A composição deve permanecer arejada e equilibrada.

---

# 7. SIDEBAR

## Navegação

```text
Início
Meus pedidos
Minha conta
Endereços
Favoritos
Cupons
Suporte
```

Na parte inferior:

```text
Sair
```

## Estado ativo

O item ativo deve possuir:

- fundo rosa pastel;
- texto rosa principal;
- ícone destacado;
- raio suave.

## Dimensão

Referência aproximada:

```text
260px
```

A medida pode variar para acomodar o layout responsivo.

## Logo

Usar a logo oficial da Isis Store fornecida pelo cliente.

Não recriar a marca via HTML/CSS.

---

# 8. TOPBAR

## Busca

Placeholder:

```text
Buscar produtos, pedidos, categorias...
```

A busca pode futuramente consultar:

- produtos;
- pedidos;
- categorias.

## Área de ações

Exibir:

```text
Favoritos
Notificações
Perfil
```

Perfil:

```text
Olá, Fernanda!
Cliente desde 2024
```

O conteúdo deve vir do usuário autenticado.

---

# 9. HERO

O hero apresenta a saudação do cliente.

Texto de referência:

```text
Olá, Fernanda! ♡

É bom ter você por aqui!

Aqui você encontra um resumo de seus pedidos,
favoritos e tudo o que precisa para uma
experiência ainda melhor.

[ Explorar produtos → ]
```

Composição visual:

- fotografia feminina;
- sacola Isis Store;
- flores;
- produtos;
- fundo em tons de rosa;
- decoração delicada.

CTA:

```text
Explorar produtos
```

Destino:

```text
/produtos
```

O nome deve ser dinâmico.

---

# 10. ATALHOS DA CONTA

Criar quatro cards:

```text
Meus pedidos
5 pedidos
```

```text
Favoritos
12 produtos
```

```text
Endereços
2 cadastrados
```

```text
Cupons
3 disponíveis
```

Os números são referência visual. No sistema real, usar dados reais.

Destinos:

```text
Meus pedidos → /conta/pedidos
Favoritos → /conta/favoritos
Endereços → /conta/enderecos
Cupons → /conta/cupons
```

Cada card precisa de:

- ícone;
- título;
- resumo;
- área clicável;
- hover/focus.

---

# 11. PEDIDOS RECENTES

Título:

```text
Pedidos recentes
```

CTA:

```text
Ver todos →
```

Desktop:

```text
Pedido | Data | Status | Total | Ações
```

Exemplo visual:

```text
#IS54872 | 12/04/2025 | Pago          | R$ 279,80 | Ver detalhes
#IS54871 | 10/04/2025 | Em transporte | R$ 159,90 | Ver detalhes
#IS54870 | 08/04/2025 | Processando   | R$ 89,90  | Ver detalhes
#IS54869 | 05/04/2025 | Entregue      | R$ 124,90 | Ver detalhes
#IS54868 | 03/04/2025 | Cancelado     | R$ 199,90 | Ver detalhes
```

Os dados acima são somente referência da composição.

Mobile deve transformar a tabela em cards/lista.

Ação:

```text
/conta/pedidos/[id]
```

---

# 12. STATUS DOS PEDIDOS

Criar `OrderStatusBadge`.

Estados de referência:

```text
Pago
Em transporte
Processando
Entregue
Cancelado
```

Cada status deve possuir:

- texto;
- indicador visual;
- contraste;
- semântica.

Não depender apenas da cor para comunicar o estado.

---

# 13. RESUMO DA CONTA

Card:

```text
Resumo da conta
```

A referência apresenta:

```text
Nível de cliente
Prata

Faltam R$ 320,00 para o próximo nível
```

e:

```text
Saldo de cupons
R$ 45,00
```

CTA:

```text
Ver meus cupons →
```

### Regra

Sistema de níveis só deve aparecer se existir no backend.

Caso ainda não exista, usar o card para dados reais disponíveis, por exemplo:

- pedidos;
- favoritos;
- cupons;
- perfil.

Nunca inventar informações comerciais.

---

# 14. FAVORITOS

Título:

```text
Produtos favoritos
Ver todos →
```

Cada card:

- imagem;
- nome;
- preço;
- favorito;
- ação.

Exemplos visuais da referência:

```text
Headphone Bluetooth
R$ 199,90

Mochila Feminina
R$ 169,90

Vestido Infantil
R$ 89,90

Urso de Pelúcia
R$ 59,90
```

Os valores são ilustrativos.

A ação deve abrir a página real do produto.

---

# 15. ENDEREÇO PRINCIPAL

Título:

```text
Endereço principal
Ver todos →
```

Mostrar:

```text
Rua das Flores, 123
Jardim das Rosas
São Paulo - SP
CEP 04812-320
```

Os valores são apenas referência da imagem.

No sistema real, mostrar o endereço salvo pelo usuário.

CTA:

```text
Gerenciar endereços →
```

Destino:

```text
/conta/enderecos
```

---

# 16. SUPORTE

Card:

```text
Suporte

Precisa de ajuda?
Nossa equipe está pronta para te atender.

[ Falar com o suporte → ]
```

Destino:

```text
/conta/suporte
```

Pode começar com:

- FAQ;
- canais oficiais;
- informações do pedido.

Não criar chat em tempo real sem requisito.

---

# 17. SOCIAL

Rodapé da área principal:

```text
Conecte-se com a gente!

Siga nossas redes sociais e fique por dentro das novidades,
promoções e lançamentos.
```

Ícones de referência:

```text
Instagram
Facebook
TikTok
YouTube
Pinterest
```

Os links devem apontar para os perfis oficiais quando disponibilizados.

---

# 18. COMPONENTES

Criar componentes reutilizáveis:

```text
AccountLayout
AccountSidebar
AccountTopbar
AccountProfileMenu
AccountHero
AccountShortcutCard
RecentOrders
OrderStatusBadge
OrderRow
AccountSummary
FavoriteProducts
FavoriteProductCard
PrimaryAddressCard
SupportCard
SocialConnect
MobileBottomNav
```

Componentes auxiliares:

```text
LoadingState
EmptyState
ErrorState
Skeleton
Toast
ConfirmDialog
```

---

# 19. BOTÕES

## Primário

Usar para ações principais:

```text
Explorar produtos
Gerenciar endereços
Ver meus cupons
```

Características:

```text
background: #E08CA3
texto claro
radius suave
hover discreto
```

## Secundário

```text
background: transparente/off-white
border: rosa
texto: rosa
```

## Links

Exemplo:

```text
Ver todos →
```

Usar microinteração discreta.

---

# 20. FORMULÁRIOS

Quando a conta abrir edição de dados/endereço, considerar:

```text
normal
focus
error
disabled
success
```

Campos devem possuir labels visíveis.

Não depender apenas de placeholders.

---

# 21. ÍCONES

Usar uma única família.

Preferência:

```text
Lucide
```

Ícones:

```text
home
shopping-bag
heart
map-pin
ticket
headphones
bell
user
search
arrow-right
truck
```

Usar estilo linear consistente.

---

# 22. ESPAÇAMENTO

Tokens sugeridos:

```text
4px
8px
12px
16px
24px
32px
48px
```

Manter consistência entre todas as áreas da conta.

---

# 23. CARDS

Direção:

```text
border-radius: 12px
```

Variações:

```text
8px
12px
16px
```

Usar bordas suaves e sombras leves.

Não transformar cada pequeno elemento em um card.

---

# 24. SOMBRAS

Sombras:

- suaves;
- difusas;
- discretas.

Objetivo:

```text
hierarquia
separação
profundidade sutil
```

Evitar sombras pretas fortes.

---

# 25. RESPONSIVIDADE

## Desktop

Mostrar:

- sidebar;
- topbar;
- hero amplo;
- atalhos;
- pedidos;
- resumo;
- favoritos;
- endereço;
- suporte.

## Tablet

- sidebar pode virar drawer;
- grid reduzido;
- hero reorganizado;
- cards em duas colunas.

## Mobile

Não simplesmente reduzir o desktop.

Estrutura:

```text
topbar
hero
atalhos
pedidos
resumo
favoritos
endereço
suporte
social
bottom navigation
```

Breakpoints:

```text
mobile < 768px
tablet 768–1023px
desktop >= 1024px
```

---

# 26. MOBILE BOTTOM NAVIGATION

Na versão mobile:

```text
Início
Pedidos
Favoritos
Conta
```

O item atual deve ser destacado.

A navegação deve ser confortável para toque.

---

# 27. ESTADOS

A dashboard precisa contemplar:

```text
loading
success
empty
error
offline/connection issue
```

## Sem pedidos

```text
Você ainda não fez nenhum pedido.
```

CTA:

```text
Explorar produtos
```

## Sem favoritos

```text
Você ainda não adicionou favoritos.
```

## Sem endereço

```text
Você ainda não cadastrou um endereço.
```

CTA:

```text
Adicionar endereço
```

---

# 28. LOADING

Utilizar Skeleton para:

- avatar;
- hero;
- atalhos;
- pedidos;
- favoritos;
- endereço;
- resumo.

Evitar bloquear toda a página quando as áreas puderem carregar independentemente.

---

# 29. ERROS

Mensagem:

```text
Não foi possível carregar seus dados.
Tente novamente.
```

CTA:

```text
Tentar novamente
```

Nunca exibir stack trace.

---

# 30. DADOS

A dashboard deve consumir dados reais do usuário autenticado.

Principais entidades:

```text
profiles
addresses
orders
order_items
products
favorites
coupons
```

Quando alguma funcionalidade ainda não existir:

- usar estado vazio;
- não inventar informações;
- implementar somente após o backend correspondente existir.

---

# 31. SEGURANÇA

A rota `/conta` é privada.

O usuário só pode acessar os próprios dados.

A autorização deve existir no backend/Supabase RLS, não apenas no frontend.

O cliente não pode acessar:

```text
pedidos de outro usuário
endereços de outro usuário
favoritos de outro usuário
dados administrativos
```

---

# 32. PERFORMANCE

Priorizar:

- imagens WebP;
- lazy loading;
- dimensões explícitas;
- queries eficientes;
- paginação;
- cache quando apropriado;
- componentes pequenos.

Se a dashboard mostra os últimos 5 pedidos, não carregar centenas sem necessidade.

---

# 33. IMAGENS

Pipeline do projeto:

```text
upload
→ validação
→ conversão WebP
→ Supabase Storage
→ metadata/path no banco
```

Componentes devem possuir:

- proporção consistente;
- alt text;
- fallback;
- loading adequado.

---

# 34. MOTION

Usar Motion para:

- entrada dos cards;
- hover;
- navegação;
- feedback;
- abertura de menus.

Animações devem ser discretas.

Respeitar:

```text
prefers-reduced-motion
```

GSAP somente quando houver necessidade real.

---

# 35. ACESSIBILIDADE

Obrigatório:

- HTML semântico;
- keyboard navigation;
- foco visível;
- labels;
- `aria-label` quando necessário;
- contraste;
- botões reais;
- links reais;
- suporte a leitores de tela;
- navegação mobile acessível.

Status não pode depender somente da cor.

---

# 36. SEO

A área da conta é privada.

Configurar proteção adequada contra indexação.

---

# 37. ESTRUTURA DE CÓDIGO

Sugestão:

```text
app/
  conta/
    page.tsx
    layout.tsx
    pedidos/
    dados/
    enderecos/
    favoritos/
    cupons/
    suporte/

components/
  account/
    account-sidebar.tsx
    account-topbar.tsx
    account-hero.tsx
    account-shortcut-card.tsx
    recent-orders.tsx
    account-summary.tsx
    favorite-products.tsx
    primary-address-card.tsx
    support-card.tsx
    social-connect.tsx
    mobile-bottom-nav.tsx

features/
  account/
    dashboard/
      queries.ts
      services.ts
      types.ts
```

Se o projeto existente já possuir arquitetura equivalente, preservá-la.

---

# 38. SUPABASE

Organizar as consultas de forma consistente.

Exemplos conceituais:

```text
getCurrentProfile()
getRecentOrders()
getFavoriteProducts()
getPrimaryAddress()
getCouponSummary()
```

Garantir que cada consulta respeite o usuário autenticado.

---

# 39. COMPONENTE DE PEDIDO

Criar componente:

```text
OrderCard
```

ou:

```text
OrderRow
```

Informações mínimas:

```text
id
data
status
total
itens
```

Ação:

```text
Ver detalhes
```

Destino:

```text
/conta/pedidos/[id]
```

---

# 40. HEADER RESPONSIVO

Desktop:

```text
logo
busca
favoritos
notificações
perfil
```

Mobile:

```text
logo
notificações
perfil
```

A busca pode ocupar uma linha própria quando necessário.

---

# 41. MICROCOPY

Tom:

```text
acolhedor
natural
profissional
brasileiro
feminino
```

Exemplo:

```text
Olá, Fernanda! ♡
É bom ter você por aqui!
```

Evitar linguagem exageradamente infantil ou artificial.

---

# 42. DESIGN SYSTEM CHECKLIST

Validar a tela através de:

```text
https://www.designsystemchecklist.com/pt/
```

Conferir:

```text
[ ] tipografia
[ ] cores
[ ] espaçamento
[ ] componentes
[ ] estados
[ ] responsividade
[ ] acessibilidade
[ ] navegação
[ ] formulários
[ ] feedback
```

---

# 43. CHECKLIST VISUAL

```text
[ ] Logo correta
[ ] Sidebar proporcional
[ ] Item ativo destacado
[ ] Topbar organizada
[ ] Hero com imagem
[ ] Saudação dinâmica
[ ] CTA funcional
[ ] Cards de atalho
[ ] Pedidos recentes
[ ] Status consistentes
[ ] Resumo da conta
[ ] Favoritos
[ ] Endereço
[ ] Suporte
[ ] Social
[ ] Mobile bottom navigation
[ ] Espaçamento consistente
[ ] Fundo off-white
[ ] Rosa utilizado como acento
[ ] Tipografia correta
[ ] Sombras suaves
```

---

# 44. CHECKLIST FUNCIONAL

```text
[ ] Usuário autenticado
[ ] Nome real exibido
[ ] Pedidos reais
[ ] Favoritos reais
[ ] Endereço real
[ ] Cupons reais, quando implementados
[ ] Links funcionais
[ ] Logout funcional
[ ] RLS validada
[ ] Dados de outro usuário inacessíveis
[ ] Loading
[ ] Empty
[ ] Error
[ ] Retry
```

---

# 45. GATE DE CONCLUSÃO

A Dashboard do Cliente só está concluída quando existir:

```text
UI implementada
+
dados reais conectados
+
RLS validada
+
responsividade validada
+
acessibilidade validada
+
estados implementados
+
links funcionais
+
testes executados
+
performance revisada
+
QA visual concluído
```

---

# 46. ORDEM DE IMPLEMENTAÇÃO

```text
1. AccountLayout
2. Sidebar
3. Topbar
4. Hero
5. Shortcut Cards
6. Recent Orders
7. Account Summary
8. Favorite Products
9. Primary Address
10. Support
11. Social Connect
12. Mobile Bottom Navigation
13. Loading States
14. Empty States
15. Error States
16. Supabase Queries
17. RLS / Authorization
18. Responsividade
19. Acessibilidade
20. Testes
21. QA visual
```

---

# 47. INSTRUÇÃO PARA O ANTIGRAVITY

> Implemente a Dashboard do Cliente da Isis Store com base nesta especificação e na imagem de referência.
>
> Antes de alterar o código, inspecione a arquitetura existente e reutilize componentes, tokens e serviços já presentes.
>
> Não crie dados fictícios como se fossem reais.
>
> O nome, pedidos, favoritos, endereço e demais informações devem vir do usuário autenticado e do Supabase quando essas funcionalidades existirem.
>
> Preserve a identidade visual oficial:
>
> `#E08CA3`, `#F9C7D4`, `#FCD9E1`, `#FFF5F6`, `#574240`
>
> Use Playfair Display para títulos/editorial e Inter para interface.
>
> A implementação deve ser responsiva para desktop, tablet e mobile e deve possuir loading, empty, error e retry.
>
> Use `frontend`, `caveman` e `superagente` conforme as regras oficiais do projeto e as instruções de cada skill.
>
> Não avance para outra tela da área do cliente até que `/conta` esteja implementada e validada.
>
> A imagem é uma referência de Design System e composição. Não deve ser utilizada como imagem de fundo para simular a interface. Todos os elementos devem ser componentes reais e funcionais.

---

# 48. RESULTADO ESPERADO

A dashboard deve parecer uma extensão natural da loja:

```text
Isis Store
↓
Home
↓
Login
↓
Área do Cliente
↓
Dashboard
```

A sensação final deve ser:

**“Minha conta dentro da Isis Store”**

e não:

**“um dashboard separado da loja”.**

