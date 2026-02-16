// ============================================================================
// ❌ MAL EJEMPLO: Sin Use Cases - Toda la lógica en el Controller
// ============================================================================
// 📖 CONCEPTO (Clean Architecture Cap. 20-22):
//    Un CASO DE USO (Use Case) es una ACCIÓN que el sistema permite hacer.
//    Describe QUÉ hace la aplicación, no CÓMO lo muestra ni DÓNDE lo guarda.
//
//    Piénsalo así: es una HISTORIA DE USUARIO convertida en código:
//    "Como usuario, quiero transferir dinero entre cuentas"
//    → TransferMoneyUseCase
//
// 🚨 PROBLEMA: Sin use cases, TODA la lógica vive en el controller.
//    El controller sabe demasiado: valida, calcula, envía emails, guarda en BD...
//    Si cambias de REST API a CLI o GraphQL, tienes que reescribir TODO.
// ============================================================================

// ❌ "Controller" que hace absolutamente TODO
function handleTransferMoney(req: {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}): { statusCode: number; body: string } {
  console.log("  🔄 Procesando transferencia...\n");

  // ❌ Validación de negocio dentro del controller
  if (req.amount <= 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Monto debe ser positivo" }),
    };
  }

  if (req.fromAccountId === req.toAccountId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No puedes transferir a la misma cuenta" }),
    };
  }

  // ❌ Acceso directo a "base de datos" desde el controller
  const accounts: Record<string, { balance: number; ownerId: string; frozen: boolean }> = {
    "ACC-001": { balance: 5000, ownerId: "USER-001", frozen: false },
    "ACC-002": { balance: 1200, ownerId: "USER-002", frozen: false },
    "ACC-003": { balance: 800, ownerId: "USER-003", frozen: true },
  };

  const fromAccount = accounts[req.fromAccountId];
  const toAccount = accounts[req.toAccountId];

  if (!fromAccount || !toAccount) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Cuenta no encontrada" }),
    };
  }

  // ❌ Regla de negocio: cuenta congelada - enterrada en el controller
  if (fromAccount.frozen || toAccount.frozen) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Cuenta congelada" }),
    };
  }

  // ❌ Regla de negocio: fondos suficientes - enterrada en el controller
  if (fromAccount.balance < req.amount) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Fondos insuficientes" }),
    };
  }

  // ❌ Regla de negocio: límite diario - enterrada en el controller
  const dailyLimit = 10000;
  if (req.amount > dailyLimit) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Excede límite diario ($${dailyLimit})` }),
    };
  }

  // ❌ Lógica de ejecución directa
  fromAccount.balance -= req.amount;
  toAccount.balance += req.amount;
  console.log(`  💸 ${req.fromAccountId}: $${fromAccount.balance}`);
  console.log(`  💰 ${req.toAccountId}: $${toAccount.balance}`);

  // ❌ Envío de notificación directamente desde el controller
  console.log(`  📧 [Simulado] Email enviado: "Transferencia de $${req.amount} exitosa"`);

  // ❌ Log de auditoría directamente desde el controller
  console.log(`  📝 [Simulado] INSERT INTO audit_log (transfer, $${req.amount}, ${new Date().toISOString()})`);

  const transferId = `TRX-${Date.now()}`;
  return {
    statusCode: 200,
    body: JSON.stringify({
      transferId,
      from: req.fromAccountId,
      to: req.toAccountId,
      amount: req.amount,
      status: "COMPLETED",
    }),
  };
}

// ❌ Ahora necesitas un CLI y tienes que DUPLICAR toda la lógica
function handleTransferFromCLI(args: string[]): void {
  console.log("\n  🖥️  [CLI] Procesando transferencia por consola...");

  // ❌ DUPLICACIÓN: La MISMA validación que en el handler HTTP
  const from = args[0];
  const to = args[1];
  const amount = parseFloat(args[2]);

  if (amount <= 0) {
    console.log("  ❌ Monto debe ser positivo");
    return;
  }

  // ❌ DUPLICACIÓN: Las MISMAS reglas de negocio copiadas...
  // Aquí habría que copiar TODO el código del handler HTTP
  // (verificar cuenta congelada, fondos, límite diario, etc.)
  console.log("  ⚠️  Tendría que copiar TODA la lógica del handler HTTP aquí...");
  console.log(`  💸 Transferir $${amount} de ${from} a ${to}`);
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO - Sin Use Cases");
  console.log("=".repeat(55));

  // Escenario 1: Transferencia exitosa vía HTTP
  console.log("\n📦 ESCENARIO 1: Transferencia vía REST API");
  console.log("-".repeat(40));
  const result = handleTransferMoney({
    fromAccountId: "ACC-001",
    toAccountId: "ACC-002",
    amount: 500,
  });
  console.log(`\n  📤 HTTP Response: ${result.body}`);

  // Escenario 2: Ahora quieres hacer lo mismo vía CLI
  console.log("\n\n📦 ESCENARIO 2: Transferencia vía CLI");
  console.log("-".repeat(40));
  handleTransferFromCLI(["ACC-001", "ACC-002", "500"]);

  console.log("\n\n⚠️  PROBLEMAS DE NO TENER USE CASES:");
  console.log("  ❌ TODA la lógica vive dentro del controller HTTP");
  console.log("  ❌ El controller conoce: validación, BD, email, auditoría");
  console.log("  ❌ Para agregar CLI/GraphQL hay que DUPLICAR la lógica");
  console.log("  ❌ No puedes testear las reglas SIN simular HTTP");
  console.log("  ❌ Un cambio en una regla de negocio toca el controller");
  console.log("  ❌ No hay una clase que responda: '¿QUÉ hace la app?'");
  console.log("");
  console.log('  💡 PREGUNTA CLAVE: Si te dicen "¿qué puede hacer tu sistema?"');
  console.log("     ¿Puedes responder mirando una CLASE/ARCHIVO?");
  console.log("     En este código: NO, tienes que leer CADA controller.");
}

main();
