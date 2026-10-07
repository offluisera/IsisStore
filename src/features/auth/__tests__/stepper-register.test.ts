import assert from "node:assert/strict";
import { describe, test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { registerSchema } from "@/schemas/auth";

describe("Tela de Registro Multi-Step com ReUI Stepper", () => {
  const rootDir = process.cwd();

  test("1. Componente ReUI Stepper deve existir e exportar os componentes necessários", () => {
    const stepperPath = path.join(rootDir, "src", "components", "reui", "stepper.tsx");
    assert.ok(fs.existsSync(stepperPath), "src/components/reui/stepper.tsx deve existir");

    const content = fs.readFileSync(stepperPath, "utf-8");
    assert.ok(content.includes("export function Stepper"), "Deve exportar Stepper");
    assert.ok(content.includes("export function StepperNav"), "Deve exportar StepperNav");
    assert.ok(content.includes("export function StepperItem"), "Deve exportar StepperItem");
    assert.ok(content.includes("export function StepperIndicator"), "Deve exportar StepperIndicator");
    assert.ok(content.includes("export function StepperSeparator"), "Deve exportar StepperSeparator");
    assert.ok(content.includes("export function StepperContent"), "Deve exportar StepperContent");
  });

  test("2. RegisterForm deve implementar as 3 etapas com Stepper e campos requisitados", () => {
    const registerFormPath = path.join(rootDir, "src", "features", "auth", "components", "RegisterForm.tsx");
    assert.ok(fs.existsSync(registerFormPath), "RegisterForm.tsx deve existir");

    const content = fs.readFileSync(registerFormPath, "utf-8");

    // Stepper ReUI importado e usado
    assert.ok(content.includes("@/components/reui/stepper"), "Deve importar stepper de @/components/reui/stepper");

    // Etapa 1: Dados da Conta
    assert.ok(content.includes("fullName"), "Deve conter campo fullName");
    assert.ok(content.includes("email"), "Deve conter campo email");
    assert.ok(content.includes("password"), "Deve conter campo password");
    assert.ok(content.includes("confirmPassword"), "Deve conter campo confirmPassword");

    // Etapa 2: Endereço
    assert.ok(content.includes("postalCode"), "Deve conter campo postalCode (CEP)");
    assert.ok(content.includes("street"), "Deve conter campo street (Rua)");
    assert.ok(content.includes("number"), "Deve conter campo number (Número)");
    assert.ok(content.includes("neighborhood"), "Deve conter campo neighborhood (Bairro)");
    assert.ok(content.includes("city"), "Deve conter campo city (Cidade)");
    assert.ok(content.includes("state"), "Deve conter campo state (UF)");
    assert.ok(content.includes("viacep.com.br"), "Deve integrar com busca de CEP via ViaCEP");

    // Etapa 3: Resumo, Termos e Notificações
    assert.ok(content.includes("Resumo"), "Deve exibir resumo dos dados cadastrados");
    assert.ok(content.includes("acceptTerms"), "Deve conter campo de aceite de termos");
    assert.ok(content.includes("newsletterOptIn"), "Deve conter opção de novidades/notificações por email");
    assert.ok(content.includes("Opcional"), "Notificações de email devem ser marcadas como opcionais");
  });

  test("3. registerSchema deve validar dados da conta e aceitar dados de endereço e termos", () => {
    const validData = {
      fullName: "Maria Clara Silva",
      email: "maria.clara@teste.com",
      password: "SenhaForte123",
      confirmPassword: "SenhaForte123",
      postalCode: "01310-100",
      street: "Avenida Paulista",
      number: "1000",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      acceptTerms: true,
      newsletterOptIn: true,
    };

    const result = registerSchema.safeParse(validData);
    assert.ok(result.success, "Schema deve validar com sucesso os dados completos");
  });

  test("4. registerAction deve utilizar createAdminClient para persistir endereços contornando RLS", () => {
    const actionsPath = path.join(rootDir, "src", "features", "auth", "actions.ts");
    assert.ok(fs.existsSync(actionsPath), "src/features/auth/actions.ts deve existir");

    const content = fs.readFileSync(actionsPath, "utf-8");
    assert.ok(content.includes("createAdminClient"), "Deve importar e usar createAdminClient");
    assert.ok(content.includes('adminClient.from("addresses").insert'), "Deve inserir endereço via adminClient");

    const migrationPath = path.join(rootDir, "supabase", "migrations", "20261006000000_register_address_trigger.sql");
    assert.ok(fs.existsSync(migrationPath), "Migration de persistência de initial_address deve existir");
  });
});
