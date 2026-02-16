// ============================================================================
// ✅ BUEN EJEMPLO: Use Cases como el corazón de la aplicación
// ============================================================================
// 📖 CONCEPTO (Clean Architecture Cap. 20-22):
//
//    ¿QUÉ ES UN CASO DE USO?
//    ————————————————————————
//    Un Caso de Uso es una ACCIÓN que tu sistema permite realizar.
//    Es la regla de negocio de la APLICACIÓN, no de la empresa.
//
//    📌 ENTITY (Regla de Empresa):
//       "Una cuenta no puede tener saldo negativo"
//       → Existe CON o SIN software. Un empleado la seguiría en papel.
//
//    📌 USE CASE (Regla de Aplicación):
//       "Para transferir dinero: validar cuentas → verificar fondos
//        → ejecutar transferencia → notificar → auditar"
//       → Es un FLUJO AUTOMATIZADO. Solo tiene sentido EN la aplicación.
//
//    ANALOGÍA: Piensa en un restaurante 🍽️
//    - ENTITY = Las recetas del chef (existen sin el restaurante)
//    - USE CASE = El proceso de "Atender un pedido":
//        1. Recibir pedido del mesero
//        2. Verificar ingredientes disponibles
//        3. Cocinar usando la RECETA (Entity)
//        4. Servir al cliente
//      → Este FLUJO es del RESTAURANTE, no de la receta.
//
//    Un Use Case:
//    ✅ Orquesta Entities (las usa, no las modifica)
//    ✅ Define el flujo de la aplicación paso a paso
//    ✅ NO sabe de HTTP, BD, ni frameworks
//    ✅ Recibe datos simples (DTOs), retorna datos simples
//    ✅ Depende de INTERFACES (no implementaciones concretas)
//    ✅ Es TESTEABLE sin infraestructura
//
//    La pregunta que responde un Use Case:
//    "¿QUÉ puede hacer mi aplicación?"
//    → TransferMoney, CreateAccount, FreezeAccount
//    Al leer los nombres de tus Use Cases, ENTIENDES lo que hace el sistema.
// ============================================================================

// ============================================================================
// 🟢 CAPA 1: ENTITIES - Reglas de negocio de la EMPRESA
// "Si un banquero haría esto con papel y lápiz, es una Entity"
// ============================================================================

// ✅ Entity: BankAccount - conoce las reglas de una CUENTA BANCARIA
// Estas reglas existen con o sin software
class BankAccount {
  constructor(
    public readonly id: string,
    public readonly ownerId: string,
    private _balance: number,
    private _frozen: boolean = false
  ) {
    // ✅ Regla de empresa: el saldo inicial no puede ser negativo
    if (_balance < 0) {
      throw new Error("El saldo inicial no puede ser negativo");
    }
  }

  get balance(): number {
    return this._balance;
  }

  get isFrozen(): boolean {
    return this._frozen;
  }

  // ✅ Regla de empresa: no se puede operar una cuenta congelada
  ensureNotFrozen(): void {
    if (this._frozen) {
      throw new AccountFrozenError(this.id);
    }
  }

  // ✅ Regla de empresa: no se puede retirar más de lo que hay
  withdraw(amount: number): void {
    this.ensureNotFrozen();
    if (amount <= 0) {
      throw new Error("El monto debe ser positivo");
    }
    if (amount > this._balance) {
      throw new InsufficientFundsError(this.id, this._balance, amount);
    }
    this._balance -= amount;
  }

  // ✅ Regla de empresa: depositar incrementa el saldo
  deposit(amount: number): void {
    this.ensureNotFrozen();
    if (amount <= 0) {
      throw new Error("El monto debe ser positivo");
    }
    this._balance += amount;
  }

  // ✅ Regla de empresa: congelar/descongelar
  freeze(): void {
    this._frozen = true;
  }

  unfreeze(): void {
    this._frozen = false;
  }
}

// Errores de dominio (parte de las Entities)
class AccountFrozenError extends Error {
  constructor(accountId: string) {
    super(`La cuenta ${accountId} está congelada`);
    this.name = "AccountFrozenError";
  }
}

class InsufficientFundsError extends Error {
  constructor(accountId: string, balance: number, requested: number) {
    super(
      `Fondos insuficientes en ${accountId}: tiene $${balance}, necesita $${requested}`
    );
    this.name = "InsufficientFundsError";
  }
}

// ============================================================================
// 🟡 CAPA 2: USE CASES - Reglas de negocio de la APLICACIÓN
// "¿QUÉ puede hacer mi aplicación?"
// Cada Use Case = UNA acción del sistema
//
// 📌 NOTA IMPORTANTE:
//    El Use Case NO conoce:
//    - HTTP (no sabe qué es un statusCode)
//    - Base de datos (usa interfaces, no DynamoDB directo)
//    - Frameworks (no importa Express, NestJS, etc.)
//
//    El Use Case SÍ conoce:
//    - Las Entities (BankAccount)
//    - Las interfaces de los repositorios
//    - Las reglas de la aplicación (límite diario, notificaciones)
// ============================================================================

// ✅ Interfaces definidas por el USE CASE (no por la infraestructura)
// El Use Case DICE qué necesita, la infraestructura lo PROVEE
interface AccountRepository {
  findById(id: string): BankAccount | null;
  save(account: BankAccount): void;
}

interface TransferNotifier {
  notifyTransferCompleted(
    fromId: string,
    toId: string,
    amount: number
  ): void;
}

interface AuditLogger {
  logTransfer(transferId: string, fromId: string, toId: string, amount: number): void;
}

// ✅ DTO de entrada: datos simples, sin lógica
interface TransferMoneyInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}

// ✅ DTO de salida: datos simples que el Use Case retorna
interface TransferMoneyOutput {
  success: boolean;
  transferId?: string;
  fromBalance?: number;
  toBalance?: number;
  error?: string;
}

// ============================================================================
// ✅ USE CASE: TransferMoney
// ============================================================================
// Esta clase responde la pregunta:
// "¿Cómo transfiere dinero mi aplicación?"
//
// FLUJO (orquestación):
//   1. Validar que las cuentas existan
//   2. Verificar límite diario (regla de APLICACIÓN)
//   3. Ejecutar la transferencia (delega a ENTITIES)
//   4. Persistir los cambios
//   5. Notificar al usuario
//   6. Registrar en auditoría
//
// 📌 Observa que el Use Case ORQUESTA pero NO implementa detalles:
//    - No sabe CÓMO se guarda (SQL? DynamoDB? archivo?)
//    - No sabe CÓMO se notifica (email? SMS? push?)
//    - No sabe CÓMO se audita (CloudWatch? archivo? Datadog?)
//    Solo sabe el ORDEN y las REGLAS del flujo.
// ============================================================================
class TransferMoneyUseCase {
  // ✅ Regla de APLICACIÓN: límite diario de transferencias
  // (esto NO es una regla de empresa, es una política de ESTA aplicación)
  private static readonly DAILY_TRANSFER_LIMIT = 10000;

  constructor(
    private accountRepository: AccountRepository,
    private notifier: TransferNotifier,
    private auditLogger: AuditLogger
  ) { }

  execute(input: TransferMoneyInput): TransferMoneyOutput {
    console.log("  🔄 [Use Case] Ejecutando TransferMoney...");
    console.log(`     De: ${input.fromAccountId} → A: ${input.toAccountId}`);
    console.log(`     Monto: $${input.amount}\n`);

    // Paso 1: Validar que no sea la misma cuenta (regla de aplicación)
    if (input.fromAccountId === input.toAccountId) {
      return { success: false, error: "No puedes transferir a la misma cuenta" };
    }

    // Paso 2: Buscar las cuentas (delega al repositorio)
    const fromAccount = this.accountRepository.findById(input.fromAccountId);
    const toAccount = this.accountRepository.findById(input.toAccountId);

    if (!fromAccount) {
      return { success: false, error: `Cuenta origen ${input.fromAccountId} no encontrada` };
    }
    if (!toAccount) {
      return { success: false, error: `Cuenta destino ${input.toAccountId} no encontrada` };
    }

    // Paso 3: Verificar límite diario (regla de APLICACIÓN)
    if (input.amount > TransferMoneyUseCase.DAILY_TRANSFER_LIMIT) {
      return {
        success: false,
        error: `Monto $${input.amount} excede límite diario ($${TransferMoneyUseCase.DAILY_TRANSFER_LIMIT})`,
      };
    }

    // Paso 4: Ejecutar la transferencia (las ENTITIES manejan sus propias reglas)
    // 📌 Aquí el Use Case DELEGA a las Entities.
    //    BankAccount.withdraw() verifica: ¿está congelada? ¿tiene fondos?
    //    BankAccount.deposit() verifica: ¿está congelada?
    //    El Use Case NO repite esas validaciones.
    try {
      fromAccount.withdraw(input.amount);
      toAccount.deposit(input.amount);
      console.log(`  ✅ [Entity] Retiro de ${input.fromAccountId}: nuevo saldo $${fromAccount.balance}`);
      console.log(`  ✅ [Entity] Depósito en ${input.toAccountId}: nuevo saldo $${toAccount.balance}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }

    // Paso 5: Persistir (delega al repositorio - no sabe si es SQL o DynamoDB)
    this.accountRepository.save(fromAccount);
    this.accountRepository.save(toAccount);

    // Paso 6: Notificar (delega al notificador - no sabe si es email o SMS)
    const transferId = `TRX-${Date.now()}`;
    this.notifier.notifyTransferCompleted(
      input.fromAccountId,
      input.toAccountId,
      input.amount
    );

    // Paso 7: Auditar (delega al logger - no sabe si es CloudWatch o archivo)
    this.auditLogger.logTransfer(
      transferId,
      input.fromAccountId,
      input.toAccountId,
      input.amount
    );

    return {
      success: true,
      transferId,
      fromBalance: fromAccount.balance,
      toBalance: toAccount.balance,
    };
  }
}

// ============================================================================
// ✅ USE CASE: FreezeAccount
// ============================================================================
// Otro Use Case = otra ACCIÓN del sistema
// Nota: es una clase SEPARADA con UNA responsabilidad
// ============================================================================

interface FreezeAccountInput {
  accountId: string;
  reason: string;
}

interface FreezeAccountOutput {
  success: boolean;
  error?: string;
}

class FreezeAccountUseCase {
  constructor(
    private accountRepository: AccountRepository,
    private auditLogger: AuditLogger
  ) { }

  execute(input: FreezeAccountInput): FreezeAccountOutput {
    console.log(`  🔄 [Use Case] Ejecutando FreezeAccount para ${input.accountId}...`);

    const account = this.accountRepository.findById(input.accountId);
    if (!account) {
      return { success: false, error: "Cuenta no encontrada" };
    }

    if (account.isFrozen) {
      return { success: false, error: "La cuenta ya está congelada" };
    }

    // Delega a la Entity
    account.freeze();
    this.accountRepository.save(account);

    // Auditar
    this.auditLogger.logTransfer("FREEZE", input.accountId, "", 0);
    console.log(`  🧊 [Entity] Cuenta ${input.accountId} congelada. Razón: ${input.reason}`);

    return { success: true };
  }
}

// ============================================================================
// 🟠 CAPA 3: ADAPTERS (Implementaciones concretas)
// Estas clases implementan las interfaces que el USE CASE definió.
// Son fácilmente reemplazables (DynamoDB → PostgreSQL, email → SMS)
// ============================================================================

// ✅ Repositorio en memoria (en producción sería DynamoDBAccountRepository)
class InMemoryAccountRepository implements AccountRepository {
  private accounts = new Map<string, BankAccount>();

  // Método helper para setup del ejemplo
  addAccount(account: BankAccount): void {
    this.accounts.set(account.id, account);
  }

  findById(id: string): BankAccount | null {
    return this.accounts.get(id) || null;
  }

  save(account: BankAccount): void {
    this.accounts.set(account.id, account);
    console.log(`  💾 [Repo] Cuenta ${account.id} guardada (saldo: $${account.balance})`);
  }
}

// ✅ Notificador por consola (en producción sería EmailNotifier o SNSNotifier)
class ConsoleTransferNotifier implements TransferNotifier {
  notifyTransferCompleted(fromId: string, toId: string, amount: number): void {
    console.log(`  📧 [Notifier] Transferencia completada: $${amount} de ${fromId} a ${toId}`);
  }
}

// ✅ Logger por consola (en producción sería CloudWatchAuditLogger)
class ConsoleAuditLogger implements AuditLogger {
  logTransfer(transferId: string, fromId: string, toId: string, amount: number): void {
    console.log(`  📝 [Audit] ${transferId}: $${amount} (${fromId} → ${toId})`);
  }
}

// ============================================================================
// 🔵 CAPA 4: CONTROLLERS (Adapters de entrada)
// NOTA: Los controllers son DELGADOS. Solo convierten formatos.
// La MISMA lógica funciona para REST API, CLI, GraphQL, etc.
// ============================================================================

// ✅ Controller REST: convierte HTTP → Use Case → HTTP
function restController(useCase: TransferMoneyUseCase, req: any): { statusCode: number; body: string } {
  // Solo convierte el formato de entrada y salida
  const result = useCase.execute({
    fromAccountId: req.body.from,
    toAccountId: req.body.to,
    amount: req.body.amount,
  });

  return {
    statusCode: result.success ? 200 : 400,
    body: JSON.stringify(result),
  };
}

// ✅ Controller CLI: convierte argumentos → Use Case → consola
function cliController(useCase: TransferMoneyUseCase, args: string[]): void {
  // Solo convierte el formato de entrada y salida
  const result = useCase.execute({
    fromAccountId: args[0],
    toAccountId: args[1],
    amount: parseFloat(args[2]),
  });

  if (result.success) {
    console.log(`  ✅ Transferencia ${result.transferId} exitosa`);
  } else {
    console.log(`  ❌ Error: ${result.error}`);
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO - Use Cases como corazón de la aplicación");
  console.log("=".repeat(60));

  // --- COMPOSICIÓN (Dependency Injection) ---
  // Ensamblamos las piezas: creamos implementaciones y las inyectamos
  const repository = new InMemoryAccountRepository();
  repository.addAccount(new BankAccount("ACC-001", "USER-001", 5000));
  repository.addAccount(new BankAccount("ACC-002", "USER-002", 1200));
  repository.addAccount(new BankAccount("ACC-003", "USER-003", 800));

  const notifier = new ConsoleTransferNotifier();
  const auditLogger = new ConsoleAuditLogger();

  // ✅ Creamos el Use Case UNA VEZ, lo usamos desde CUALQUIER entrada
  const transferMoney = new TransferMoneyUseCase(repository, notifier, auditLogger);
  const freezeAccount = new FreezeAccountUseCase(repository, auditLogger);

  // =============================================
  // ESCENARIO 1: Transferencia exitosa vía REST
  // =============================================
  console.log("\n📦 ESCENARIO 1: Transferencia vía REST API");
  console.log("-".repeat(45));
  const httpResponse = restController(transferMoney, {
    body: { from: "ACC-001", to: "ACC-002", amount: 500 },
  });
  console.log(`\n  📤 HTTP Status: ${httpResponse.statusCode}`);

  // =============================================
  // ESCENARIO 2: La MISMA transferencia vía CLI
  // =============================================
  console.log("\n\n📦 ESCENARIO 2: Transferencia vía CLI (MISMA lógica, 0 duplicación)");
  console.log("-".repeat(45));
  cliController(transferMoney, ["ACC-001", "ACC-003", "200"]);

  // =============================================
  // ESCENARIO 3: Fondos insuficientes
  // =============================================
  console.log("\n\n📦 ESCENARIO 3: Fondos insuficientes (Entity protege)");
  console.log("-".repeat(45));
  const result3 = transferMoney.execute({
    fromAccountId: "ACC-003", // Solo tiene $800
    toAccountId: "ACC-001",
    amount: 5000,
  });
  console.log(`  ❌ ${result3.error}`);

  // =============================================
  // ESCENARIO 4: Congelar cuenta y luego intentar transferir
  // =============================================
  console.log("\n\n📦 ESCENARIO 4: Congelar cuenta → intentar transferir");
  console.log("-".repeat(45));
  freezeAccount.execute({ accountId: "ACC-002", reason: "Actividad sospechosa" });
  const result4 = transferMoney.execute({
    fromAccountId: "ACC-001",
    toAccountId: "ACC-002", // ← está congelada
    amount: 100,
  });
  console.log(`  ❌ ${result4.error}`);

  // =============================================
  // RESUMEN DIDÁCTICO
  // =============================================
  console.log("\n\n" + "=".repeat(60));
  console.log("🎯 ¿QUÉ ES UN CASO DE USO? - Resumen");
  console.log("=".repeat(60));

  console.log(`
  📌 DEFINICIÓN:
     Un Use Case es una ACCIÓN que tu sistema permite realizar.
     Es la regla de negocio de la APLICACIÓN convertida en código.

  🍽️  ANALOGÍA DEL RESTAURANTE:
     Entity  = La receta del chef (existe sin el restaurante)
     Use Case = El proceso "Atender un pedido":
                recibir → verificar ingredientes → cocinar → servir
                Este FLUJO es del restaurante, no de la receta.

  📋 EN ESTE EJEMPLO:
     TransferMoneyUseCase = "¿Cómo transfiere dinero mi app?"
     FreezeAccountUseCase = "¿Cómo congela cuentas mi app?"

  ✅ UN USE CASE:
     • ORQUESTA Entities (las usa, no implementa sus reglas)
     • DEFINE el flujo paso a paso
     • NO conoce HTTP, BD, ni frameworks
     • RECIBE datos simples → RETORNA datos simples
     • DEPENDE de interfaces (no de implementaciones)
     • Es TESTEABLE sin infraestructura

  🔑 BENEFICIO CLAVE:
     El MISMO Use Case funciona para:
     • REST API  → restController usa TransferMoneyUseCase
     • CLI       → cliController usa TransferMoneyUseCase
     • GraphQL   → graphqlResolver usaría TransferMoneyUseCase
     • WebSocket → wsHandler usaría TransferMoneyUseCase
     ¡CERO duplicación de lógica!

  📖 REGLA RÁPIDA:
     "Si abres la carpeta /usecases y lees los nombres de las clases,
     deberías ENTENDER qué hace tu sistema sin leer más código."
`);
}

main();
