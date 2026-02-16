// ============================================================================
// ✅ BUEN EJEMPLO: La Regla de Dependencia (Mini-Proyecto Completo)
// ============================================================================
// 📖 PRINCIPIO (Clean Architecture Cap. 22):
//    "Las dependencias del código fuente deben apuntar solo HACIA ADENTRO"
//
//    ┌─────────────────────────────────────────┐
//    │  CAPA 4: Frameworks (Lambda, DynamoDB)  │  ← Depende de Adapters
//    ├─────────────────────────────────────────┤
//    │  CAPA 3: Adapters (Controller, Repo)    │  ← Depende de Use Cases
//    ├─────────────────────────────────────────┤
//    │  CAPA 2: Use Cases (ProcessPayment)     │  ← Depende de Entities
//    ├─────────────────────────────────────────┤
//    │  CAPA 1: Entities (Payment)             │  ← No depende de NADA
//    └─────────────────────────────────────────┘
//         ↑ DEPENDENCIAS APUNTAN HACIA ADENTRO ↑
//
// ✅ Cada capa solo conoce la capa inmediatamente interior.
// ✅ Las entidades NO saben que DynamoDB existe.
// ✅ Los Use Cases NO saben que Lambda existe.
// ============================================================================

// ============================================================================
// 🟢 CAPA 1: ENTITIES (Enterprise Business Rules)
// La capa más interior. NO depende de NADA externo.
// Contiene las reglas de negocio más críticas de la empresa.
// ============================================================================

// ✅ Entity pura - no sabe nada de DynamoDB, Lambda, ni ningún framework
class Payment {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly amount: number,
    public readonly currency: string,
    public status: string = "PENDING"
  ) {
    // ✅ Las reglas de validación de NEGOCIO viven AQUÍ en la entidad
    // Estas reglas existen independientemente de la tecnología usada
    if (amount <= 0) {
      throw new Error("El monto debe ser mayor a 0");
    }
    if (!currency || currency.length !== 3) {
      throw new Error("La moneda debe ser un código ISO de 3 caracteres");
    }
  }

  // ✅ Lógica de negocio encapsulada en la entidad
  approve(): void {
    if (this.status !== "PENDING") {
      throw new Error(`No se puede aprobar un pago con status: ${this.status}`);
    }
    this.status = "APPROVED";
  }

  reject(reason: string): void {
    if (this.status !== "PENDING") {
      throw new Error(`No se puede rechazar un pago con status: ${this.status}`);
    }
    this.status = "REJECTED";
  }

  // ✅ Regla de negocio: ¿el pago requiere verificación manual?
  requiresManualReview(): boolean {
    return this.amount > 10000; // Montos mayores a $10,000
  }
}

// ============================================================================
// 🟡 CAPA 2: USE CASES (Application Business Rules)
// Orquesta las entidades. Define interfaces (puertos) para la capa exterior.
// NO conoce DynamoDB, Lambda, ni ningún framework.
// Solo depende de Entities y de interfaces que ELLA define.
// ============================================================================

// ✅ Interface definida por el Use Case (no por el framework)
// El Use Case DICTA lo que necesita, la capa exterior lo implementa
interface PaymentRepository {
  save(payment: Payment): void;
  findById(id: string): Payment | null;
}

// ✅ Interface para el resultado del Use Case
// Formato limpio, sin detalles de HTTP ni API Gateway
interface ProcessPaymentResult {
  success: boolean;
  paymentId: string;
  status: string;
  requiresReview: boolean;
}

// ✅ Use Case puro - orquesta entidades y usa interfaces
class ProcessPaymentUseCase {
  // ✅ Depende de la INTERFACE PaymentRepository, no de DynamoDB
  constructor(private paymentRepository: PaymentRepository) { }

  execute(
    customerId: string,
    amount: number,
    currency: string
  ): ProcessPaymentResult {
    console.log("  🔄 [Use Case] Ejecutando ProcessPayment...");

    // Paso 1: Crear la entidad (la validación de negocio ocurre aquí)
    const paymentId = `PAY-${Date.now()}`;
    const payment = new Payment(paymentId, customerId, amount, currency);
    console.log(`  🔄 [Use Case] Payment creado: ${paymentId}`);

    // Paso 2: Aplicar reglas de negocio
    if (payment.requiresManualReview()) {
      console.log("  ⚠️  [Use Case] Monto alto - requiere revisión manual");
    } else {
      payment.approve();
      console.log("  ✅ [Use Case] Pago aprobado automáticamente");
    }

    // Paso 3: Persistir via la interface (no sabe si es DynamoDB o RAM)
    this.paymentRepository.save(payment);

    // Paso 4: Retornar resultado en formato del dominio (no HTTP)
    return {
      success: true,
      paymentId: payment.id,
      status: payment.status,
      requiresReview: payment.requiresManualReview(),
    };
  }
}

// ============================================================================
// 🟠 CAPA 3: INTERFACE ADAPTERS (Controllers, Repositories, Presenters)
// Convierte datos entre el formato del Use Case y el formato externo.
// Depende de Use Cases/Entities. Es dependido por Frameworks.
// ============================================================================

// ✅ Implementación del repositorio - AQUÍ es donde van los detalles de BD
// Si cambias de DynamoDB a PostgreSQL, SOLO cambias esta clase
class InMemoryPaymentRepository implements PaymentRepository {
  private payments: Map<string, Payment> = new Map();

  save(payment: Payment): void {
    this.payments.set(payment.id, payment);
    console.log(`  💾 [Repository] Payment ${payment.id} guardado en memoria`);
  }

  findById(id: string): Payment | null {
    return this.payments.get(id) || null;
  }
}

// ✅ Si tuvieras DynamoDB, solo creas OTRA implementación:
class DynamoDBPaymentRepository implements PaymentRepository {
  save(payment: Payment): void {
    // Aquí SÍ van los detalles de DynamoDB (PK, SK, GSI, etc.)
    const record = {
      PK: `CUSTOMER#${payment.customerId}`,
      SK: `PAYMENT#${payment.id}`,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
    };
    console.log(`  💾 [DynamoDB Repo] PUT ${JSON.stringify(record)}`);
  }

  findById(id: string): Payment | null {
    console.log(`  🔍 [DynamoDB Repo] GET ${id}`);
    return null; // Simulación
  }
}

// ✅ Controller/Presenter - convierte entre formato HTTP y Use Case
class PaymentController {
  constructor(private processPaymentUseCase: ProcessPaymentUseCase) { }

  // ✅ Convierte request HTTP → input de Use Case → response HTTP
  handleRequest(httpRequest: { body: string }): {
    statusCode: number;
    body: string;
  } {
    console.log("  🌐 [Controller] Procesando request HTTP...");

    // Parsea el input (formato externo → formato del Use Case)
    const input = JSON.parse(httpRequest.body);

    // Ejecuta el Use Case (formato interno)
    const result = this.processPaymentUseCase.execute(
      input.customerId,
      input.amount,
      input.currency
    );

    // Convierte la respuesta (formato del Use Case → formato HTTP)
    return {
      statusCode: result.success ? 200 : 400,
      body: JSON.stringify({
        message: result.success ? "Payment processed" : "Payment failed",
        paymentId: result.paymentId,
        status: result.status,
      }),
    };
  }
}

// ============================================================================
// 🔴 CAPA 4: FRAMEWORKS & DRIVERS
// La capa más exterior. Aquí va Lambda, Express, etc.
// Solo "conecta" las piezas - contiene mínimo código.
// ============================================================================

// ✅ Lambda handler - solo conecta las capas, casi sin lógica
function lambdaHandler(event: any): { statusCode: number; body: string } {
  console.log("  ⚡ [Lambda] Handler invocado");

  // ✅ Composición: conectamos las capas desde afuera hacia adentro
  const repository = new InMemoryPaymentRepository(); // o new DynamoDBPaymentRepository()
  const useCase = new ProcessPaymentUseCase(repository);
  const controller = new PaymentController(useCase);

  // El handler solo delega al controller
  return controller.handleRequest({ body: JSON.stringify(event.body) });
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO - La Regla de Dependencia");
  console.log("=".repeat(55));

  // Simulamos un evento de API Gateway
  console.log("\n📦 ESCENARIO 1: Pago normal ($150)");
  console.log("-".repeat(40));
  const response1 = lambdaHandler({
    body: { customerId: "CLI-001", amount: 150.0, currency: "USD" },
  });
  console.log(`  📤 [Lambda] Response: ${response1.body}`);

  // Pago que requiere revisión manual
  console.log("\n\n📦 ESCENARIO 2: Pago alto ($15,000 - requiere revisión)");
  console.log("-".repeat(40));
  const response2 = lambdaHandler({
    body: { customerId: "CLI-002", amount: 15000.0, currency: "USD" },
  });
  console.log(`  📤 [Lambda] Response: ${response2.body}`);

  // Demostración de intercambiabilidad
  console.log("\n\n🔄 ESCENARIO 3: Usando DynamoDB Repository (sin cambiar Use Case)");
  console.log("-".repeat(40));
  const dynamoRepo = new DynamoDBPaymentRepository();
  const useCase = new ProcessPaymentUseCase(dynamoRepo); // ¡Solo cambia el repo!
  useCase.execute("CLI-003", 250.0, "EUR");

  console.log("\n\n🎯 REGLA DE DEPENDENCIA CUMPLIDA:");
  console.log("  ✅ Entity (Payment) → No conoce NADA externo");
  console.log("  ✅ Use Case → Solo conoce Entities e Interfaces que él define");
  console.log("  ✅ Adapters → Implementan interfaces del Use Case");
  console.log("  ✅ Framework (Lambda) → Solo conecta las piezas");
  console.log("  ✅ Cambiar DynamoDB → InMemory: solo cambiar 1 línea de inyección");
  console.log("  ✅ Cambiar Lambda → Express: solo reescribir el handler exterior");
}

main();
