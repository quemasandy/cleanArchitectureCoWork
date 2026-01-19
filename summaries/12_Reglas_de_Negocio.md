# Capítulo 20: Business Rules

## 1. TL;DR

Las reglas de negocio son la razón de existir de tu software. Hay dos tipos: **Entities** (reglas de negocio críticas que existirían incluso sin software, como "el interés de un préstamo es N%") y **Use Cases** (reglas de aplicación que orquestan las Entities). Las Entities son de nivel más alto porque son más generales; los Use Cases son de nivel más bajo porque son específicos a la aplicación. Esta separación es fundamental para Clean Architecture.

---

## 2. Conceptos que DEBO dominar

### Critical Business Rules (Entities)
- **Definición**: Reglas que hacen o ahorran dinero al negocio, independientemente de si existe software para automatizarlas. Existirían aunque usaras papel y lápiz.
- **Ejemplo Payment Engine**:
```typescript
// Entity: Reglas que existirían sin software
class Payment {
  constructor(
    readonly amount: Money,
    readonly currency: Currency,
    readonly merchantId: MerchantId
  ) {
    this.validateAmount();
  }

  // Critical Business Rule: El monto no puede ser negativo
  private validateAmount(): void {
    if (this.amount.isNegative()) {
      throw new InvalidPaymentAmount(this.amount);
    }
  }

  // Critical Business Rule: Comisión del merchant
  calculateMerchantFee(rate: CommissionRate): Money {
    return this.amount.multiply(rate.value);
  }

  // Critical Business Rule: Un payment puede ser refunded dentro de X días
  canBeRefunded(currentDate: Date, maxDays: number): boolean {
    const daysSincePayment = differenceInDays(currentDate, this.createdAt);
    return daysSincePayment <= maxDays;
  }
}
```
- **Cómo lo preguntarían**: "¿Cuáles son las reglas de negocio de tu Payment Engine que existirían aunque no tuvieras software?"

### Application-Specific Business Rules (Use Cases)
- **Definición**: Reglas que definen cómo el sistema automatizado opera. Solo tienen sentido en el contexto de la aplicación.
- **Ejemplo Payment Engine**:
```typescript
// Use Case: Reglas específicas de la aplicación
class ProcessPaymentUseCase {
  async execute(command: ProcessPaymentCommand): Promise<Either<PaymentError, PaymentResult>> {
    // Application Rule: Validar idempotency key antes de procesar
    const existing = await this.repo.findByIdempotencyKey(command.idempotencyKey);
    if (existing.isSome()) {
      return right(PaymentResult.alreadyProcessed(existing.value));
    }

    // Application Rule: Verificar fraud score antes de cobrar
    const fraudResult = await this.fraudService.check(command);
    if (fraudResult.score > FRAUD_THRESHOLD) {
      return left(PaymentError.fraudSuspected(fraudResult));
    }

    // Orquestación de Entities
    const payment = Payment.create(command.amount, command.currency, command.merchantId);
    const chargeResult = await this.gateway.charge(payment);

    // Application Rule: Publicar evento después del cobro
    await this.eventPublisher.publish(PaymentProcessed.from(payment, chargeResult));

    return chargeResult;
  }
}
```
- **Cómo lo preguntarían**: "¿Cuál es la diferencia entre la regla 'comisión es 2.9%' y la regla 'verificar fraud score antes de cobrar'?"

### Request/Response Models
- **Definición**: DTOs simples que el Use Case recibe y devuelve. NO deben conocer nada de HTTP, bases de datos, ni frameworks.
- **Ejemplo Payment Engine**:
```typescript
// ❌ Violación: Request model conoce Express
interface ProcessPaymentRequest extends Express.Request {
  body: { amount: number };
}

// ✅ Correcto: Request model es puro
interface ProcessPaymentCommand {
  readonly amount: Money;
  readonly currency: Currency;
  readonly merchantId: MerchantId;
  readonly customerId: CustomerId;
  readonly idempotencyKey: string;
}

// ✅ Correcto: Response model es puro
interface PaymentResult {
  readonly paymentId: PaymentId;
  readonly status: PaymentStatus;
  readonly processedAt: Date;
  readonly gatewayReference: string;
}

// El Controller traduce HTTP -> Command y Result -> HTTP
export const handler: APIGatewayProxyHandler = async (event) => {
  const command = parseCommand(event); // HTTP -> Domain
  const result = await useCase.execute(command);
  return formatResponse(result); // Domain -> HTTP
};
```
- **Cómo lo preguntarían**: "Muéstrame cómo tu Use Case no conoce que está corriendo detrás de una API REST."

---

## 3. Conceptos que puedo IGNORAR (por ahora)

| Concepto | Razón para ignorar |
|----------|-------------------|
| Debate "Entity" vs "Aggregate" (DDD) | El concepto básico es suficiente |
| Diagrama UML del Loan entity | El patrón mental importa |
| Discusión Entity como clase vs funciones | TypeScript usa ambos |

---

## 4. Patrones/código para mi arsenal

### Entity con invariantes
```typescript
// Domain: Entity pura con reglas de negocio críticas
class Payment {
  private constructor(
    readonly id: PaymentId,
    readonly amount: Money,
    readonly status: PaymentStatus,
    readonly gatewayReference: Option<string>,
    readonly refundedAmount: Money,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}

  // Factory method con validación
  static create(amount: Money, currency: Currency, merchantId: MerchantId): Either<PaymentError, Payment> {
    if (amount.isNegative()) {
      return left(PaymentError.invalidAmount(amount));
    }
    if (amount.isZero()) {
      return left(PaymentError.zeroAmount());
    }
    
    return right(new Payment(
      PaymentId.generate(),
      amount,
      PaymentStatus.PENDING,
      none(),
      Money.zero(currency),
      new Date(),
      new Date()
    ));
  }

  // Critical Business Rule: Solo pagos aprobados pueden ser refunded
  refund(amount: Money): Either<PaymentError, Payment> {
    if (this.status !== PaymentStatus.APPROVED) {
      return left(PaymentError.cannotRefundNonApproved(this.status));
    }
    
    const newRefundedTotal = this.refundedAmount.add(amount);
    if (newRefundedTotal.isGreaterThan(this.amount)) {
      return left(PaymentError.refundExceedsPayment(amount, this.amount));
    }

    return right(this.with({ 
      refundedAmount: newRefundedTotal,
      status: newRefundedTotal.equals(this.amount) 
        ? PaymentStatus.FULLY_REFUNDED 
        : PaymentStatus.PARTIALLY_REFUNDED
    }));
  }
}
```

### Use Case que orquesta Entities
```typescript
class RefundPaymentUseCase {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly gateway: Refundable,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(command: RefundPaymentCommand): Promise<Either<RefundError, RefundResult>> {
    // 1. Cargar Entity
    const paymentOpt = await this.paymentRepo.findById(command.paymentId);
    if (paymentOpt.isNone()) {
      return left(RefundError.paymentNotFound(command.paymentId));
    }

    // 2. Aplicar Business Rule (delegado a Entity)
    const payment = paymentOpt.value;
    const refundedPaymentResult = payment.refund(command.amount);
    
    if (refundedPaymentResult.isLeft()) {
      return left(RefundError.fromPaymentError(refundedPaymentResult.left));
    }

    // 3. Llamar a gateway (infrastructura via interface)
    const gatewayResult = await this.gateway.refund(
      payment.gatewayReference.getOrThrow(),
      command.amount
    );

    if (gatewayResult.isLeft()) {
      return left(RefundError.gatewayFailed(gatewayResult.left));
    }

    // 4. Persistir nuevo estado
    await this.paymentRepo.save(refundedPaymentResult.right);

    // 5. Publicar evento
    await this.eventPublisher.publish(
      PaymentRefunded.from(payment, command.amount, gatewayResult.right)
    );

    return right(RefundResult.success(gatewayResult.right));
  }
}
```

---

## 5. Checklist de "¿lo entendí?"

1. ¿Puedo distinguir qué reglas de mi Payment Engine son **Entities** (existirían sin software) vs **Use Cases** (específicas de la app)?
2. ¿Mis Entities tienen **cero dependencias** de frameworks, HTTP, o base de datos?
3. ¿Mis Use Cases reciben **Commands puros** que no conocen Express/Lambda?
4. ¿Mis Use Cases devuelven **Results puros** que no conocen HTTP status codes?
5. ¿Las Entities **no conocen** los Use Cases que las usan?

---

## 6. Conexión con otros conceptos

| Relación | Descripción |
|----------|-------------|
| **DIP (Cap 11)** | Las Entities no conocen Use Cases = DIP aplicado |
| **Clean Architecture (Cap 22)** | Entities = círculo más interno; Use Cases = siguiente círculo |
| **Policy and Level (Cap 19)** | Entities = alto nivel (lejos de I/O); Use Cases = nivel medio |
| **DDD Aggregates** | Las Entities de Uncle Bob son similares a Aggregates de DDD |
| **Payment Engine** | `Payment` entity con reglas de refund; `ProcessPaymentUseCase` orquestando |
