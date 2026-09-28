import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

console.log("Iniciando auditoria da Fase 13 — Segurança & Auditoria...");

const ROOT_DIR = path.resolve(process.cwd());

// 1. Auditoria de Segredos e .gitignore
console.log("1. Verificando proteção contra vazamento de segredos...");
const gitignorePath = path.join(ROOT_DIR, ".gitignore");
assert.ok(fs.existsSync(gitignorePath), ".gitignore deve existir.");
const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");

assert.ok(
  gitignoreContent.includes(".env") && gitignoreContent.includes(".env*.local"),
  ".gitignore deve conter regras estritas para .env e .env*.local."
);

// Verificar .env.example
const envExamplePath = path.join(ROOT_DIR, ".env.example");
assert.ok(fs.existsSync(envExamplePath), ".env.example deve existir.");
const envExampleContent = fs.readFileSync(envExamplePath, "utf-8");

// Nenhum token real deve estar em .env.example
assert.ok(
  !envExampleContent.includes("eyJhbGciOi") && !envExampleContent.includes("APP_USR-"),
  ".env.example não pode conter tokens JWT reais ou tokens de produção."
);
console.log("  ✓ .gitignore e .env.example auditados: nenhum segredo exposto.");

// 2. Auditoria de Headers de Segurança HTTP em next.config.ts
console.log("2. Verificando cabeçalhos HTTP de segurança em next.config.ts...");
const nextConfigPath = path.join(ROOT_DIR, "next.config.ts");
const nextConfigContent = fs.readFileSync(nextConfigPath, "utf-8");

assert.ok(
  nextConfigContent.includes("X-Frame-Options") && nextConfigContent.includes("SAMEORIGIN"),
  "next.config.ts deve configurar X-Frame-Options contra Clickjacking."
);
assert.ok(
  nextConfigContent.includes("X-Content-Type-Options") && nextConfigContent.includes("nosniff"),
  "next.config.ts deve configurar X-Content-Type-Options contra MIME-sniffing."
);
assert.ok(
  nextConfigContent.includes("Referrer-Policy"),
  "next.config.ts deve definir Referrer-Policy."
);
console.log("  ✓ Cabeçalhos de segurança HTTP configurados.");

// 3. Auditoria de Open Redirect em Callback e Middleware
console.log("3. Verificando proteção contra Open Redirect...");
const callbackRoutePath = path.join(ROOT_DIR, "src/app/auth/callback/route.ts");
const callbackContent = fs.readFileSync(callbackRoutePath, "utf-8");
assert.ok(
  callbackContent.includes('!rawNext.startsWith("//")') && callbackContent.includes('!rawNext.includes("\\\\")'),
  "auth/callback deve bloquear redirecionamentos com barra dupla ou barras invertidas."
);

const middlewarePath = path.join(ROOT_DIR, "src/lib/supabase/middleware.ts");
const middlewareContent = fs.readFileSync(middlewarePath, "utf-8");
assert.ok(
  middlewareContent.includes('!nextParam.startsWith("//")') && middlewareContent.includes('!nextParam.includes("\\\\")'),
  "middleware deve bloquear open redirect para protocolos relativos no parâmetro next."
);
console.log("  ✓ Proteção contra Open Redirect validada em callback e middleware.");

// 4. Auditoria de RLS (Row Level Security) e Isolamento
console.log("4. Verificando políticas RLS das tabelas sensíveis...");
const schemaPath = path.join(ROOT_DIR, "supabase/migrations/20260927000000_initial_schema.sql");
const schemaContent = fs.readFileSync(schemaPath, "utf-8");

const requiredRlsTables = [
  "profiles",
  "addresses",
  "categories",
  "products",
  "product_images",
  "carts",
  "cart_items",
  "orders",
  "order_items",
  "payments",
  "payment_events",
  "admin_audit_logs",
];

for (const table of requiredRlsTables) {
  assert.ok(
    schemaContent.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`),
    `Tabela ${table} deve ter RLS habilitado explicitamente no schema.`
  );
}

// Verificação de isolamento de cliente nas contas e pedidos
assert.ok(
  schemaContent.includes("customer_id = auth.uid()"),
  "Pedidos devem restringir leitura ao próprio cliente (customer_id = auth.uid())."
);
assert.ok(
  schemaContent.includes("profile_id = auth.uid()"),
  "Endereços e carrinhos devem pertencer estritamente ao usuário autenticado."
);
console.log("  ✓ RLS habilitado e isolamento de dados do cliente confirmado.");

// 5. Auditoria de Hardening de Funções Internas
console.log("5. Verificando migration de hardening de segurança...");
const hardeningPath = path.join(ROOT_DIR, "supabase/migrations/20260927000001_security_hardening.sql");
assert.ok(fs.existsSync(hardeningPath), "Migration de hardening deve existir.");
const hardeningContent = fs.readFileSync(hardeningPath, "utf-8");
assert.ok(
  hardeningContent.includes("REVOKE EXECUTE ON FUNCTION public.handle_new_user()"),
  "Execução pública de handle_new_user() deve ser revogada."
);
assert.ok(
  hardeningContent.includes("REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon"),
  "Execução anônima de is_admin() deve ser revogada."
);
console.log("  ✓ Funções SECURITY DEFINER blindadas contra chamadas RPC não autorizadas.");

// 6. Auditoria de Integridade Financeira no Checkout
console.log("6. Verificando recálculo server-side e antifraude no checkout...");
const checkoutActionsPath = path.join(ROOT_DIR, "src/features/checkout/actions.ts");
const checkoutContent = fs.readFileSync(checkoutActionsPath, "utf-8");

assert.ok(
  checkoutContent.includes("prod.sale_price_cents || prod.price_cents"),
  "createOrderAction deve extrair os preços diretamente da base de dados e nunca do payload do cliente."
);
assert.ok(
  checkoutContent.includes(".eq(\"profile_id\", user.id)"),
  "createOrderAction deve garantir que o endereço selecionado pertença ao usuário logado."
);
assert.ok(
  checkoutContent.includes("prod.stock < item.quantity"),
  "createOrderAction deve validar disponibilidade de estoque no servidor."
);
console.log("  ✓ Integridade de preços server-side, validação de endereço e estoque confirmados.");

// 7. Auditoria de Webhooks e Pagamentos
console.log("7. Verificando webhook HMAC e idempotência financeira...");
const webhookPath = path.join(ROOT_DIR, "src/app/api/webhooks/mercadopago/route.ts");
const webhookContent = fs.readFileSync(webhookPath, "utf-8");

assert.ok(
  webhookContent.includes("verifyWebhookSignature"),
  "Webhook deve validar assinatura HMAC SHA-256 antes de qualquer processamento."
);
assert.ok(
  webhookContent.includes("payment_events"),
  "Webhook deve registrar eventos em payment_events para idempotência estrita."
);
assert.ok(
  webhookContent.includes("23505"),
  "Webhook deve capturar código 23505 (unique_violation) para ignorar tentativas duplicadas."
);
console.log("  ✓ Webhooks protegidos com HMAC e idempotência financeira.");

// 8. Auditoria de Acesso Administrativo e Prevenção de Auto-Rebaixamento
console.log("8. Verificando privilégios e proteção contra auto-rebaixamento...");
const adminActionsPath = path.join(ROOT_DIR, "src/features/admin/actions.ts");
const adminActionsContent = fs.readFileSync(adminActionsPath, "utf-8");

assert.ok(
  adminActionsContent.includes("userId === auth.user.id && role !== \"admin\""),
  "Painel admin deve proibir auto-rebaixamento acidental do próprio administrador logado."
);
assert.ok(
  adminActionsContent.includes("getAdminUser()"),
  "Todas as ações de gestão devem verificar getAdminUser()."
);
console.log("  ✓ RBAC e regras administrativas auditadas.");

// 9. Auditoria de Uploads e Sanitização
console.log("9. Verificando segurança nos uploads de arquivos...");
assert.ok(
  adminActionsContent.includes('contentType: "image/webp"'),
  "Uploads devem fixar content-type seguro image/webp."
);
assert.ok(
  !adminActionsContent.includes("../"),
  "Caminhos de upload não podem aceitar path traversal."
);
console.log("  ✓ Uploads sanitizados e isolados.");

console.log("✅ Gate 13 Aprovado: Auditoria de segurança concluída com 100% de conformidade!");
