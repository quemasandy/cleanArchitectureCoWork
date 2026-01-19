# Capítulo 17: Boundaries - Drawing Lines

## 1. TL;DR

Las **boundaries** (líneas arquitectónicas) separan componentes que cambian por diferentes razones. La boundary más importante es entre **reglas de negocio y detalles** (UI, DB, frameworks). Dibuja boundaries temprano donde veas posibles cambios futuros. Usa **interfaces** para cruzar boundaries en la dirección correcta. Recuerda: **la arquitectura es el arte de decidir qué NO decidir todavía**.

---

## 2. Conceptos que DEBO dominar

### Boundary = Línea de separación
- **Definición**: Una boundary separa componentes que cambian por diferentes razones, con diferentes velocidades, o que sirven a diferentes actores.
- **Ejemplo Payment Engine**:
```
┌─────────────────────────────────────────────────┐
│              BOUNDARIES EN PAYMENT ENGINE       │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐    Boundary    ┌───────────┐   │
│  │   Domain    │<═══════════════│   Web     │   │
│  │  (Payment,  │                │  (Lambda, │   │
│  │   Gateway)  │                │   API GW) │   │
│  └─────────────┘                └───────────┘   │
│         ↑                                       │
│         ║ Boundary                              │
│         ↓                                       │
│  ┌─────────────────────────────────────────┐   │
│  │        Database (DynamoDB)              │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```
- **Cómo lo preguntarían**: "¿Dónde están las boundaries en tu Payment Engine y por qué las pusiste ahí?"

### The Database is a Detail
- **Definición**: La base de datos es un detalle de implementación, no parte de la arquitectura. El negocio no debería saber si usas DynamoDB, PostgreSQL, o archivos.
- **Ejemplo Payment Engine**:
```typescript
// ❌ Sin boundary: Use Case conoce DynamoDB
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

class ProcessPaymentUseCase {
  constructor(private dynamo: DynamoDBClient) {}
  
  async execute(command: Command) {
    await this.dynamo.put({ TableName: 'payments', Item: /* ... */ });
  }
}

// ✅ Con boundary: Use Case no conoce la DB
interface PaymentRepository {
  save(payment: Payment): Promise<void>;
}

class ProcessPaymentUseCase {
  constructor(private repo: PaymentRepository) {}
  
  async execute(command: Command) {
    await this.repo.save(payment); // No sabe que es DynamoDB
  }
}
```
- **Cómo lo preguntarían**: "Si mañana migras de DynamoDB a Aurora, ¿cuánto código de negocio cambias?"

### Deferred Decisions (Decisiones diferidas)
- **Definición**: Una buena arquitectura te permite posponer decisiones sobre detalles (DB, UI, frameworks) el mayor tiempo posible.
- **Ejemplo Payment Engine**:
```typescript
// Decisiones DIFERIDAS (detrás de boundaries)
// - ¿DynamoDB o PostgreSQL? → PaymentRepository interface
// - ¿Lyra o Stripe como default? → PaymentGateway interface  
// - ¿Lambda o ECS? → Handler es adaptador delgado
// - ¿SQS o EventBridge? → EventPublisher interface

// Decisiones TOMADAS (en el dominio)
// - Payment entity structure
// - Business rules (refund limits, fees)
// - Use case flows
```
- **Cómo lo preguntarían**: "¿Qué decisiones tecnológicas puedes cambiar sin tocar tu código de negocio?"

---

## 3. Conceptos que puedo IGNORAR (por ahora)

| Concepto | Razón para ignorar |
|----------|-------------------|
| FitNesse example del libro | Específico al caso de Uncle Bob |
| Discusión sobre boundaries vs coupling | Ya cubierto en cap 14 |
| Plugin architecture en detalle | Concepto básico es suficiente |

---

## 4. Patrones/código para mi arsenal

### Ports como boundaries
```typescript
// domain/ports/ define las boundaries del dominio
// Cada port es una boundary hacia el exterior

// Boundary hacia Payment Gateways
interface PaymentGateway {
  charge(request: ChargeRequest): Promise<Either<GatewayError, ChargeResult>>;
  refund(id: string, amount: Money): Promise<Either<GatewayError, RefundResult>>;
}

// Boundary hacia persistencia
interface PaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(id: PaymentId): Promise<Option<Payment>>;
}

// Boundary hacia eventos
interface EventPublisher {
  publish<E extends DomainEvent>(event: E): Promise<void>;
}

// Boundary hacia servicios externos
interface FraudDetector {
  check(payment: Payment): Promise<FraudScore>;
}
```

### Composition Root cruza boundaries
```typescript
// infrastructure/container.ts
// ÚNICO lugar que conoce ambos lados de cada boundary

const container = {
  // Boundary Payment → Gateway
  paymentGateway: (): PaymentGateway => {
    const type = config.gateway.default;
    switch (type) {
      case 'lyra': return new LyraGateway(config.lyra);
      case 'stripe': return new StripeGateway(config.stripe);
      case 'mock': return new MockGateway(); // Para tests
    }
  },

  // Boundary Payment → Database
  paymentRepository: (): PaymentRepository => {
    if (config.database.type === 'dynamodb') {
      return new DynamoDBPaymentRepository(dynamoClient);
    }
    return new InMemoryPaymentRepository(); // Para tests
  },

  // Boundary Payment → Events
  eventPublisher: (): EventPublisher => {
    if (config.events.type === 'eventbridge') {
      return new EventBridgePublisher(eventBridgeClient);
    }
    return new SQSPublisher(sqsClient);
  }
};
```

### Feature flags como boundary decision
```typescript
// Las feature flags te permiten diferir decisiones en runtime
class PaymentGatewayFactory {
  create(merchantId: MerchantId): PaymentGateway {
    // Decisión diferida hasta runtime
    const useNewGateway = this.featureFlags.isEnabled('use_stripe', merchantId);
    
    if (useNewGateway) {
      return this.container.stripeGateway();
    }
    return this.container.lyraGateway();
  }
}
```

---

## 5. Checklist de "¿lo entendí?"

1. ¿Puedo identificar **dónde están mis boundaries** en el código?
2. ¿Mis Use Cases **no importan** nada de `@aws-sdk/*`, `express`, `nestjs`?
3. ¿Tengo un **Composition Root** que es el único que cruza boundaries?
4. ¿Puedo cambiar de DynamoDB a PostgreSQL **solo modificando infraestructura**?
5. ¿Las decisiones sobre "cómo" (detalles) están **separadas** de "qué" (negocio)?

---

## 6. Conexión con otros conceptos

| Relación | Descripción |
|----------|-------------|
| **Clean Architecture (Cap 22)** | Cada círculo está separado por boundaries |
| **DIP (Cap 11)** | DIP es el mecanismo para cruzar boundaries correctamente |
| **Humble Objects (Cap 23)** | Humble objects viven en las boundaries |
| **Policy/Level (Cap 19)** | Boundaries separan políticas de diferentes niveles |
| **Hexagonal Architecture** | Ports = Boundaries hacia el exterior |
| **Payment Engine** | `PaymentGateway` interface es la boundary hacia Lyra/Stripe/MP |
