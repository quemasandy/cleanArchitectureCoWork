// ============================================================================
// ✅ SOLUCIÓN: Reglas de Negocio correctamente separadas
// ============================================================================
// 📖 LECCIÓN CLAVE (Clean Architecture - Capítulo 20):
//
//    Robert C. Martin divide las reglas de negocio en DOS tipos:
//
//    🟢 ENTITY (Reglas de Empresa / Enterprise Business Rules):
//       → Reglas que existen AUNQUE NO HAYA SOFTWARE.
//       → Un analista de crédito las seguiría con papel y lápiz.
//       → Ejemplo: "Si el cliente pagó a tiempo, su puntaje sube"
//       → Estas reglas SON EL NEGOCIO. Son lo más valioso y estable.
//
//    🟡 USE CASE (Reglas de Aplicación / Application Business Rules):
//       → Reglas que SOLO existen porque hay una aplicación automatizando.
//       → Definen el FLUJO: qué pasos seguir, en qué orden, qué hacer si falla.
//       → Ejemplo: "Guardar en BD, enviar email, registrar en log"
//       → Orquestan las Entities pero NO contienen la lógica de negocio pura.
//
//    La CLAVE es: las Entities NO SABEN que están dentro de una app.
//    Los Use Cases SÍ saben que hay una app, pero NO saben de HTTP, BD, etc.
// ============================================================================

// ============================================================================
// 🟢 CAPA 1: ENTITIES - Reglas de Negocio de la EMPRESA
// ============================================================================
// 📖 Estas clases contienen las reglas que un analista de crédito
//    seguiría en su escritorio con una calculadora y papel.
//    NO conocen HTTP, bases de datos, ni frameworks.
//    Son PURA lógica de negocio del dominio bancario.
// ============================================================================

// ✅ Entity: Representa el perfil crediticio de un cliente
// Un analista evalúa esto MANUALMENTE antes de aprobar un préstamo
class CreditProfile {
  // Puntaje crediticio calculado a partir del historial
  public readonly creditScore: number;
  // Nivel de riesgo del cliente (BAJO, MEDIO, ALTO)
  public readonly riskLevel: string;
  // Tasa de interés asignada según el riesgo
  public readonly interestRate: number;

  // El constructor recibe el historial de pagos para calcular el perfil
  constructor(paymentHistory: { onTime: boolean }[]) {
    // ✅ Regla de empresa: calcular puntaje crediticio
    // "Por cada pago a tiempo: +30 puntos. Por cada mora: -50 puntos"
    // Un analista haría EXACTAMENTE esto con papel y lápiz
    this.creditScore = this.calculateCreditScore(paymentHistory);

    // ✅ Regla de empresa: determinar riesgo según puntaje
    // "Puntaje >= 700 es bajo riesgo, >= 400 es medio, < 400 es alto"
    // Esta clasificación es POLÍTICA DEL BANCO, no de la app
    this.riskLevel = this.determineRiskLevel();

    // ✅ Regla de empresa: asignar tasa de interés según riesgo
    // "Riesgo bajo: 8%, medio: 15%, alto: 25%"
    // Estas tasas las define el COMITÉ del banco, no el software
    this.interestRate = this.determineInterestRate();
  }

  // ✅ Regla de empresa: cálculo del puntaje crediticio
  // Un analista sumaría y restaría puntos manualmente
  private calculateCreditScore(history: { onTime: boolean }[]): number {
    let score = 500; // Puntaje base que todo cliente nuevo recibe
    for (const payment of history) { // Recorremos cada pago del historial
      if (payment.onTime) {          // Si el pago fue puntual
        score += 30;                 // Sumamos 30 puntos de confianza
      } else {                       // Si el pago tuvo mora
        score -= 50;                 // Restamos 50 puntos (la penalización es mayor)
      }
    }
    // Limitamos el puntaje entre 0 y 1000 (rango válido del banco)
    return Math.max(0, Math.min(1000, score));
  }

  // ✅ Regla de empresa: clasificación de riesgo
  // El manual del banco dice exactamente estos rangos
  private determineRiskLevel(): string {
    if (this.creditScore >= 700) return "BAJO";  // Excelente pagador
    if (this.creditScore >= 400) return "MEDIO"; // Pagador aceptable
    return "ALTO";                                // Pagador riesgoso
  }

  // ✅ Regla de empresa: tasa de interés por nivel de riesgo
  // Política financiera del banco, definida sin software
  private determineInterestRate(): number {
    if (this.riskLevel === "BAJO") return 0.08; // 8% - tasa preferencial
    if (this.riskLevel === "MEDIO") return 0.15; // 15% - tasa estándar
    return 0.25;                                  // 25% - tasa de alto riesgo
  }

  // ✅ Regla de empresa: ¿el puntaje es suficiente para un préstamo?
  // "El banco no presta a clientes con puntaje menor a 400"
  isEligibleForLoan(): boolean {
    return this.creditScore >= 400; // Mínimo requerido por política del banco
  }
}

// ✅ Entity: Representa una solicitud de préstamo
// Contiene las reglas de cálculo financiero que el analista haría manualmente
class LoanApplication {
  // Perfil crediticio del solicitante
  public readonly creditProfile: CreditProfile;
  // Total a pagar incluyendo intereses
  public readonly totalWithInterest: number;
  // Cuota mensual que el cliente debe pagar
  public readonly monthlyPayment: number;
  // Ratio de endeudamiento (cuota / ingreso)
  public readonly debtToIncomeRatio: number;

  // Constructor recibe los datos del solicitante y su historial
  constructor(
    public readonly applicantName: string,           // Nombre del solicitante
    public readonly applicantAge: number,             // Edad del solicitante
    public readonly monthlyIncome: number,            // Ingreso mensual del solicitante
    public readonly requestedAmount: number,          // Monto del préstamo solicitado
    public readonly termMonths: number,               // Plazo en meses
    paymentHistory: { onTime: boolean }[]             // Historial de pagos anteriores
  ) {
    // ✅ Regla de empresa: validar edad mínima
    // "El banco NO presta a menores de 18 años" - regla legal y del banco
    if (applicantAge < 18) {
      throw new Error("El solicitante debe ser mayor de 18 años");
    }

    // ✅ Regla de empresa: validar monto positivo
    // "No tiene sentido un préstamo de $0 o negativo"
    if (requestedAmount <= 0) {
      throw new Error("El monto del préstamo debe ser positivo");
    }

    // ✅ Regla de empresa: validar plazo positivo
    // "El plazo debe ser al menos 1 mes"
    if (termMonths <= 0) {
      throw new Error("El plazo debe ser de al menos 1 mes");
    }

    // Calculamos el perfil crediticio a partir del historial
    this.creditProfile = new CreditProfile(paymentHistory);

    // ✅ Regla de empresa: cálculo de intereses
    // "Total = monto × (1 + tasa de interés)" - matemática financiera básica
    this.totalWithInterest = requestedAmount * (1 + this.creditProfile.interestRate);

    // ✅ Regla de empresa: cálculo de cuota mensual
    // "Cuota = total / número de meses" - el analista haría esta división
    this.monthlyPayment = this.totalWithInterest / termMonths;

    // ✅ Regla de empresa: ratio de endeudamiento
    // "¿Qué porcentaje del ingreso se va en la cuota?"
    this.debtToIncomeRatio = this.monthlyPayment / monthlyIncome;
  }

  // ✅ Regla de empresa: verificar capacidad de pago
  // "La cuota NO puede superar el 30% del ingreso mensual"
  // Esta regla protege al cliente de sobreendeudarse
  hasPaymentCapacity(): boolean {
    return this.debtToIncomeRatio <= 0.30; // Máximo 30% del ingreso
  }

  // ✅ Regla de empresa: calcular el pago máximo permitido
  // "30% del ingreso mensual es lo máximo que puede comprometer"
  getMaxAllowedPayment(): number {
    return this.monthlyIncome * 0.30; // 30% del ingreso como tope
  }

  // ✅ Regla de empresa: determinar decisión
  // "Si es elegible y tiene capacidad de pago → aprobado"
  // "Si puntaje >= 700 → aprobado sin condiciones"
  // "Si puntaje >= 400 → aprobado con condiciones"
  getDecision(): string {
    if (!this.creditProfile.isEligibleForLoan()) return "RECHAZADO";  // Puntaje muy bajo
    if (!this.hasPaymentCapacity()) return "RECHAZADO";                // No puede pagar
    if (this.creditProfile.creditScore >= 700) return "APROBADO";      // Excelente perfil
    return "APROBADO_CON_CONDICIONES";                                 // Perfil aceptable
  }
}

// ============================================================================
// 🟡 CAPA 2: USE CASES - Reglas de Negocio de la APLICACIÓN
// ============================================================================
// 📖 Los Use Cases ORQUESTAN las Entities.
//    Definen el FLUJO de la aplicación: qué pasos seguir, en qué orden.
//    NO contienen lógica de negocio pura (eso está en las Entities).
//    NO conocen HTTP, pero SÍ saben que hay una BD, notificaciones, etc.
//    (a través de interfaces, NO implementaciones concretas)
// ============================================================================

// ✅ Interfaz del repositorio - definida por el USE CASE, no por la BD
// El use case dice QUÉ necesita, no CÓMO se implementa
interface LoanRepository {
  save(loanId: string, application: LoanApplication, decision: string): void; // Guardar solicitud
}

// ✅ Interfaz de notificación - definida por el USE CASE
// Podría ser email, SMS, push notification... el use case no le importa
interface NotificationService {
  notifyApproval(email: string, loanId: string, decision: string): void; // Notificar aprobación
}

// ✅ Interfaz de auditoría - definida por el USE CASE
// El use case sabe que necesita loguear, pero no cómo
interface AuditLogger {
  logEvaluation(loanId: string, applicantName: string, decision: string): void; // Registrar evaluación
}

// ✅ Resultado del Use Case - formato de DOMINIO, no de HTTP
// No tiene statusCode ni body de HTTP. Son datos puros del negocio.
interface EvaluateLoanResult {
  success: boolean;             // ¿La evaluación fue exitosa?
  loanId: string;               // ID del préstamo generado
  decision: string;             // Decisión: APROBADO, RECHAZADO, etc.
  creditScore: number;          // Puntaje crediticio calculado
  riskLevel: string;            // Nivel de riesgo asignado
  interestRate: number;         // Tasa de interés asignada
  monthlyPayment: number;       // Cuota mensual calculada
  debtToIncomeRatio: number;    // Ratio de endeudamiento
  totalWithInterest: number;    // Total a pagar con intereses
  error?: string;               // Mensaje de error si fue rechazado
}

// ✅ Use Case: EvaluateLoan - orquesta el flujo de evaluación de préstamo
class EvaluateLoanUseCase {
  // El constructor recibe las INTERFACES, no las implementaciones
  // Esto permite cambiar BD, email, logs sin tocar el use case
  constructor(
    private loanRepository: LoanRepository,         // Interfaz para persistencia
    private notificationService: NotificationService, // Interfaz para notificaciones
    private auditLogger: AuditLogger                  // Interfaz para auditoría
  ) { }

  // El método execute define el FLUJO de la aplicación
  execute(input: {
    name: string;                           // Nombre del solicitante
    age: number;                            // Edad del solicitante
    email: string;                          // Email para notificación
    monthlyIncome: number;                  // Ingreso mensual
    amount: number;                         // Monto solicitado
    termMonths: number;                     // Plazo en meses
    paymentHistory: { onTime: boolean }[];  // Historial de pagos
  }): EvaluateLoanResult {
    console.log("  🔄 [Use Case] Ejecutando EvaluateLoan...\n"); // Log del flujo

    // ✅ PASO 1 (Regla de app): Generar ID único para el préstamo
    // Esto NO existiría sin software - es pura automatización
    const loanId = `LOAN-${Date.now()}`; // Generamos un ID con timestamp

    // ✅ PASO 2: Crear la Entity (las reglas de EMPRESA se aplican automáticamente)
    // Al construir LoanApplication, TODAS las validaciones y cálculos del banco
    // se ejecutan DENTRO de la Entity, no aquí en el use case
    let application: LoanApplication; // Variable para almacenar la solicitud
    try {
      application = new LoanApplication( // Creamos la entidad de solicitud
        input.name,            // Pasamos el nombre del solicitante
        input.age,             // Pasamos la edad del solicitante
        input.monthlyIncome,   // Pasamos el ingreso mensual
        input.amount,          // Pasamos el monto solicitado
        input.termMonths,      // Pasamos el plazo
        input.paymentHistory   // Pasamos el historial de pagos
      );
    } catch (error: any) {
      // Si la Entity rechaza los datos (menor de edad, monto negativo, etc.)
      return {
        success: false, loanId, decision: "RECHAZADO",  // Solicitud rechazada
        creditScore: 0, riskLevel: "N/A", interestRate: 0, // Valores por defecto
        monthlyPayment: 0, debtToIncomeRatio: 0,          // Valores por defecto
        totalWithInterest: 0, error: error.message,        // El error de la Entity
      };
    }

    // Mostramos los cálculos de la Entity (para la lección)
    console.log(`  📊 [Entity] Puntaje crediticio: ${application.creditProfile.creditScore}`);
    console.log(`  ⚠️  [Entity] Riesgo: ${application.creditProfile.riskLevel} | Tasa: ${(application.creditProfile.interestRate * 100)}%`);
    console.log(`  💰 [Entity] Cuota mensual: $${application.monthlyPayment.toFixed(2)}`);
    console.log(`  📈 [Entity] Ratio deuda/ingreso: ${(application.debtToIncomeRatio * 100).toFixed(1)}%`);

    // ✅ PASO 3: Obtener la decisión de la Entity
    // La ENTITY decide si el préstamo se aprueba o rechaza
    // El Use Case solo lee esa decisión y actúa en consecuencia
    const decision = application.getDecision(); // La Entity tiene la lógica de decisión
    console.log(`  📋 [Entity] Decisión: ${decision}`); // Mostramos la decisión

    // ✅ PASO 4 (Regla de app): Persistir en base de datos
    // Un analista con papel no "guarda en BD", esto es pura automatización
    this.loanRepository.save(loanId, application, decision); // Delegamos al repositorio

    // ✅ PASO 5 (Regla de app): Enviar notificación
    // El software envía emails automáticos, el analista no lo haría
    if (decision !== "RECHAZADO") { // Solo notificamos si fue aprobado
      this.notificationService.notifyApproval(input.email, loanId, decision);
    }

    // ✅ PASO 6 (Regla de app): Registrar log de auditoría
    // El sistema necesita trazabilidad, esto no existe sin software
    this.auditLogger.logEvaluation(loanId, input.name, decision);

    // Retornamos el resultado en formato de DOMINIO (no HTTP)
    return {
      success: decision !== "RECHAZADO", // Éxito si no fue rechazado
      loanId,                             // ID del préstamo
      decision,                           // Decisión final
      creditScore: application.creditProfile.creditScore, // Puntaje
      riskLevel: application.creditProfile.riskLevel,     // Riesgo
      interestRate: application.creditProfile.interestRate, // Tasa
      monthlyPayment: application.monthlyPayment,          // Cuota
      debtToIncomeRatio: application.debtToIncomeRatio,    // Ratio
      totalWithInterest: application.totalWithInterest,    // Total
    };
  }
}

// ============================================================================
// 🟠 CAPA 3: ADAPTERS - Implementaciones de infraestructura
// ============================================================================
// 📖 Los Adapters implementan las interfaces definidas por los Use Cases.
//    Son los DETALLES: qué BD usamos, cómo enviamos emails, etc.
//    Se pueden reemplazar sin tocar ni una línea de Entity o Use Case.
// ============================================================================

// ✅ Adapter: Repositorio en memoria (se podría cambiar por DynamoDB, PostgreSQL, etc.)
class InMemoryLoanRepository implements LoanRepository {
  private loans: any[] = []; // Almacenamiento en memoria para el ejemplo

  // Implementación concreta de cómo guardar un préstamo
  save(loanId: string, application: LoanApplication, decision: string): void {
    this.loans.push({ loanId, application, decision }); // Guardamos en el array
    console.log(`  💾 [Adapter/Repo] Préstamo ${loanId} guardado en memoria`);
  }
}

// ✅ Adapter: Servicio de notificación por consola (se podría cambiar por SendGrid, SES, etc.)
class ConsoleNotificationService implements NotificationService {
  // Implementación concreta de cómo notificar al cliente
  notifyApproval(email: string, loanId: string, decision: string): void {
    console.log(`  📧 [Adapter/Notif] Email a ${email}: Préstamo ${loanId} → ${decision}`);
  }
}

// ✅ Adapter: Logger por consola (se podría cambiar por CloudWatch, Datadog, etc.)
class ConsoleAuditLogger implements AuditLogger {
  // Implementación concreta de cómo registrar auditoría
  logEvaluation(loanId: string, applicantName: string, decision: string): void {
    console.log(`  📝 [Adapter/Log] Evaluación: ${loanId} | ${applicantName} | ${decision}`);
  }
}

// ============================================================================
// 🏃 EJECUCIÓN - Demostración del ejercicio resuelto
// ============================================================================
function main(): void {
  console.log("✅ SOLUCIÓN - Business Rules correctamente separadas");
  console.log("=".repeat(55));

  // ✅ COMPOSICIÓN: Armamos las dependencias desde afuera
  // Aquí conectamos las implementaciones concretas con las interfaces
  const repository = new InMemoryLoanRepository();       // Creamos el repositorio
  const notifications = new ConsoleNotificationService(); // Creamos el notificador
  const auditLogger = new ConsoleAuditLogger();           // Creamos el logger
  const evaluateLoan = new EvaluateLoanUseCase(           // Creamos el use case
    repository,     // Le inyectamos el repositorio
    notifications,  // Le inyectamos el notificador
    auditLogger     // Le inyectamos el logger
  );

  // ============================================================================
  // CASO 1: Solicitud aprobada - buen historial crediticio
  // ============================================================================
  console.log("\n📋 CASO 1: Solicitud de préstamo estándar (buen historial)");
  console.log("-".repeat(50));
  const result1 = evaluateLoan.execute({
    name: "Carlos García",   // Nombre del solicitante
    age: 35,                  // Mayor de 18 ✅
    email: "carlos@mail.com", // Email para notificación
    monthlyIncome: 5000,      // Ingreso mensual de $5000
    amount: 10000,            // Solicita $10,000
    termMonths: 24,           // A 24 meses
    paymentHistory: [         // Historial mayoritariamente positivo
      { onTime: true },       // Pago 1: puntual ✅ (+30)
      { onTime: true },       // Pago 2: puntual ✅ (+30)
      { onTime: false },      // Pago 3: mora ❌ (-50)
      { onTime: true },       // Pago 4: puntual ✅ (+30)
      { onTime: true },       // Pago 5: puntual ✅ (+30)
      { onTime: true },       // Pago 6: puntual ✅ (+30)
      { onTime: true },       // Pago 7: puntual ✅ (+30)
      { onTime: true },       // Pago 8: puntual ✅ (+30)
    ],
    // Puntaje esperado: 500 + (7×30) - (1×50) = 500 + 210 - 50 = 660 → MEDIO
  });
  console.log(`\n  📋 Resultado:`);
  console.log(`     Decisión: ${result1.decision}`);                           // Mostramos decisión
  console.log(`     Puntaje: ${result1.creditScore}`);                          // Mostramos puntaje
  console.log(`     Riesgo: ${result1.riskLevel}`);                             // Mostramos riesgo
  console.log(`     Tasa: ${(result1.interestRate * 100)}%`);                   // Mostramos tasa
  console.log(`     Cuota: $${result1.monthlyPayment.toFixed(2)}`);             // Mostramos cuota
  console.log(`     Ratio deuda/ingreso: ${(result1.debtToIncomeRatio * 100).toFixed(1)}%`); // Ratio

  // ============================================================================
  // CASO 2: Solicitud rechazada - cuota supera capacidad de pago
  // ============================================================================
  console.log("\n\n📋 CASO 2: Préstamo muy alto para el ingreso");
  console.log("-".repeat(50));
  const result2 = evaluateLoan.execute({
    name: "Ana López",       // Nombre del solicitante
    age: 28,                  // Mayor de 18 ✅
    email: "ana@mail.com",    // Email para notificación
    monthlyIncome: 2000,      // Ingreso mensual bajo de $2000
    amount: 50000,            // Solicita mucho dinero: $50,000
    termMonths: 12,           // Plazo corto: 12 meses
    paymentHistory: [         // Historial corto
      { onTime: true },       // Pago 1: puntual ✅ (+30)
      { onTime: true },       // Pago 2: puntual ✅ (+30)
    ],
    // Puntaje: 500 + 60 = 560 → MEDIO → 15% tasa
    // Total: 50000 * 1.15 = 57500
    // Cuota: 57500 / 12 = $4791.67 → supera 30% de $2000 ($600) → RECHAZADO
  });
  console.log(`\n  📋 Resultado:`);
  console.log(`     Decisión: ${result2.decision}`);           // Mostramos decisión
  console.log(`     Cuota: $${result2.monthlyPayment.toFixed(2)}`); // Cuota muy alta
  console.log(`     Capacidad: $${(result2.debtToIncomeRatio * 100).toFixed(1)}% del ingreso`); // Ratio

  // ============================================================================
  // CASO 3: Solicitud rechazada - menor de edad
  // ============================================================================
  console.log("\n\n📋 CASO 3: Menor de edad");
  console.log("-".repeat(50));
  const result3 = evaluateLoan.execute({
    name: "Pedro Menor",     // Nombre del solicitante
    age: 16,                  // ❌ Menor de 18 años
    email: "pedro@mail.com",  // Email
    monthlyIncome: 1000,      // Ingreso
    amount: 5000,             // Monto
    termMonths: 12,           // Plazo
    paymentHistory: [],       // Sin historial
  });
  console.log(`\n  📋 Resultado: ${result3.decision} - ${result3.error}`); // Error de la Entity

  // ============================================================================
  // 📖 RESUMEN DE LA LECCIÓN
  // ============================================================================
  console.log("\n\n" + "=".repeat(55));
  console.log("📖 RESUMEN: ¿QUÉ ES UNA REGLA DE NEGOCIO?");
  console.log("=".repeat(55));
  console.log("\n  🟢 REGLAS DE EMPRESA (Entity) - Lo que el analista hace con papel:");
  console.log("     • Validar edad mínima (18 años) → LoanApplication.constructor");
  console.log("     • Calcular puntaje crediticio → CreditProfile.calculateCreditScore");
  console.log("     • Determinar riesgo y tasa → CreditProfile.determineRiskLevel");
  console.log("     • Calcular cuota mensual → LoanApplication.monthlyPayment");
  console.log("     • Verificar capacidad de pago (30%) → LoanApplication.hasPaymentCapacity");
  console.log("     • Tomar decisión de aprobación → LoanApplication.getDecision");
  console.log("\n  🟡 REGLAS DE APLICACIÓN (Use Case) - La automatización:");
  console.log("     • Generar ID de préstamo → EvaluateLoanUseCase.execute");
  console.log("     • Guardar en base de datos → loanRepository.save");
  console.log("     • Enviar notificación → notificationService.notifyApproval");
  console.log("     • Registrar auditoría → auditLogger.logEvaluation");
  console.log("     • Orquestar el flujo completo → EvaluateLoanUseCase.execute");
  console.log("\n  🟠 DETALLES DE INFRAESTRUCTURA (Adapters):");
  console.log("     • InMemoryLoanRepository → podría ser DynamoDB, PostgreSQL");
  console.log("     • ConsoleNotificationService → podría ser SendGrid, SES");
  console.log("     • ConsoleAuditLogger → podría ser CloudWatch, Datadog");
  console.log("\n  💡 LA PRUEBA DEFINITIVA para saber si es regla de empresa:");
  console.log('     "¿Un empleado haría esto con papel y lápiz?"');
  console.log("     → SÍ → Es Entity");
  console.log("     → NO → Es Use Case o Adapter");
}

// Ejecutamos el programa principal
main();
