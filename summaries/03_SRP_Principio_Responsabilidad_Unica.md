# Capítulo 7: SRP - Single Responsibility Principle

## 1. TL;DR

El SRP **no** significa "una función hace una cosa". Significa que **un módulo debe ser responsable ante un solo actor** (grupo de stakeholders). Si `PaymentProcessor` contiene lógica que afecta a Finanzas, Operaciones y Compliance, tienes tres razones para cambiar el mismo archivo = tres fuentes de conflictos de merge y bugs accidentales. Un senior separa estas responsabilidades en módulos distintos.

---

## 2. Conceptos que DEBO dominar

### Actor (Stakeholder que demanda cambios)
- **Definición**: Grupo de personas que requieren cambios en el sistema por la misma razón.
- **Ejemplo Payment Engine**: 
  - Actor "Finanzas" → reglas de cálculo de comisiones
  - Actor "Compliance" → validaciones de fraude  
  - Actor "Operaciones" → reportes y métricas
- **Cómo lo preguntarían**: "Tu clase `PaymentService` tiene 3 métodos: `calculateFees()`, `validateCompliance()`, `generateReport()`. ¿Qué problema ves aquí?"

### Duplicación Accidental
- **Definición**: Cuando dos actores comparten código que parece igual pero evoluciona diferente.
- **Ejemplo Payment Engine**:
```typescript
// ❌ VIOLACIÓN SRP: Finanzas y Ops usan el mismo cálculo
class PaymentProcessor {
  private calculateFees(amount: Money): Money {
    // Finanzas quiere cambiar el % de comisión
    // Ops solo lo usa para reportes
    return amount.multiply(0.029);
  }
}
```
- **Cómo lo preguntarían**: "¿Qué pasa si Finanzas te pide cambiar la fórmula de fees y ese cambio rompe los reportes de Operaciones?"

### Facade Pattern (Solución al SRP)
- **Definición**: Clase fina que delega a clases especializadas, manteniendo una API simple.
- **Ejemplo Payment Engine**:
```typescript
// ✅ SOLUCIÓN: Cada actor tiene su clase
class PaymentFacade {
  constructor(
    private feeCalculator: FeeCalculator,       // Actor: Finanzas
    private complianceValidator: ComplianceValidator, // Actor: Compliance
    private metricsReporter: MetricsReporter    // Actor: Operaciones
  ) {}
  
  async process(payment: Payment): Promise<PaymentResult> {
    const fees = this.feeCalculator.calculate(payment);
    await this.complianceValidator.validate(payment);
    this.metricsReporter.record(payment);
    return PaymentResult.success(fees);
  }
}
```
- **Cómo lo preguntarían**: "¿Cómo organizarías este código para que un cambio de Finanzas no requiera re-testear el módulo de Compliance?"

---

## 3. Conceptos que puedo IGNORAR (por ahora)

| Concepto | Razón para ignorar |
|----------|-------------------|
| Historia de Conway's Law | Contexto académico, no práctico |
| Problema de merges en VCS | Síntoma, no el principio en sí |
| Component level (CCP) | Se cubre en capítulo 13 |

---

## 4. Patrones/código para mi arsenal

### Payment Gateway con SRP aplicado
```typescript
// Domain: Cada responsabilidad es una interfaz separada
interface PaymentGateway {
  charge(request: ChargeRequest): Promise<Either<PaymentError, ChargeResult>>;
}

interface FeeCalculator {
  calculate(amount: Money, gateway: GatewayType): Money;
}

interface PaymentAuditor {
  record(event: PaymentEvent): Promise<void>;
}

// Use Case: Orquesta las responsabilidades
class ProcessPaymentUseCase {
  constructor(
    private gateway: PaymentGateway,
    private feeCalculator: FeeCalculator,
    private auditor: PaymentAuditor
  ) {}

  async execute(command: ProcessPaymentCommand): Promise<Either<PaymentError, PaymentResult>> {
    const fees = this.feeCalculator.calculate(command.amount, command.gatewayType);
    
    const result = await this.gateway.charge({
      ...command,
      totalAmount: command.amount.add(fees)
    });
    
    await this.auditor.record(PaymentEvent.attempted(command, result));
    
    return result;
  }
}
```

### Pregunta de entrevista resuelta
```typescript
// ❌ Antes: Una clase hace todo
class PaymentService {
  calculateFee(amount: number): number { /* ... */ }
  validateFraud(payment: Payment): boolean { /* ... */ }
  saveToDatabase(payment: Payment): void { /* ... */ }
  sendNotification(payment: Payment): void { /* ... */ }
}

// ✅ Después: Responsabilidades separadas por actor
// Actor Finanzas
class FeeCalculationService { calculate(amount: Money): Money { /* ... */ } }

// Actor Compliance  
class FraudDetectionService { validate(payment: Payment): ValidationResult { /* ... */ } }

// Actor Infraestructura (técnico)
class PaymentRepository { save(payment: Payment): Promise<void> { /* ... */ } }

// Actor UX
class PaymentNotifier { notify(event: PaymentEvent): Promise<void> { /* ... */ } }
```

---

## 5. Checklist de "¿lo entendí?"

1. ¿Puedo identificar **quiénes son los actores** que usan mi `PaymentProcessor`?
2. Si cambio la fórmula de comisión, ¿**cuántos tests no relacionados** con finanzas tengo que correr?
3. ¿Tengo funciones "compartidas" entre actores que **parecen iguales pero evolucionan diferente**?
4. ¿Puedo explicar la diferencia entre "una función hace una cosa" vs "un módulo tiene un actor"?
5. ¿Puedo aplicar el **Facade pattern** para exponer una API simple sin violar SRP?

---

## 6. Conexión con otros conceptos

| Relación | Descripción |
|----------|-------------|
| **OCP (Cap 8)** | SRP separa responsabilidades; OCP asegura que puedas extenderlas sin modificarlas |
| **DIP (Cap 11)** | Las dependencias entre responsabilidades deben apuntar hacia abstracciones |
| **Component Cohesion (Cap 13)** | SRP a nivel de componentes = Common Closure Principle |
| **Payment Engine** | Separar `LyraGateway`, `MercadoPagoGateway`, `PayUGateway` cada uno con su responsabilidad |
