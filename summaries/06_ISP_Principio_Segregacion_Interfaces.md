# Capítulo 10: ISP - Interface Segregation Principle

## 1. TL;DR

ISP dice: **no dependas de cosas que no usas**. Si tu `PaymentGateway` interface tiene 20 métodos pero tu Use Case solo necesita `charge()`, estás acoplado a 19 métodos que no te importan. Cambios en esos 19 métodos forzarán recompilación/redeployment de tu código. Diseña interfaces pequeñas y específicas para cada cliente.

---

## 2. Conceptos que DEBO dominar

### Fat Interface (El anti-patrón)
- **Definición**: Interfaz con demasiados métodos donde ningún cliente usa todos.
- **Ejemplo Payment Engine**:
```typescript
// ❌ FAT INTERFACE: ProcessPaymentUseCase solo usa charge()
// pero depende de TODA la interfaz
interface PaymentGateway {
  charge(request: ChargeRequest): Promise<ChargeResult>;
  refund(transactionId: string): Promise<RefundResult>;
  getBalance(): Promise<Money>;
  listTransactions(filter: Filter): Promise<Transaction[]>;
  updateWebhookUrl(url: string): Promise<void>;
  generateReport(dateRange: DateRange): Promise<Report>;
}
```
- **Cómo lo preguntarían**: "Tu interfaz `PaymentGateway` tiene 15 métodos. ¿Qué problema tiene esto para los equipos que la consumen?"

### Role Interface (La solución)
- **Definición**: Interfaces pequeñas definidas por el rol que el cliente necesita, no por la implementación.
- **Ejemplo Payment Engine**:
```typescript
// ✅ Role Interfaces: cada cliente depende solo de lo que usa
interface Chargeable {
  charge(request: ChargeRequest): Promise<Either<GatewayError, ChargeResult>>;
}

interface Refundable {
  refund(transactionId: string): Promise<Either<GatewayError, RefundResult>>;
}

interface TransactionQueryable {
  getTransaction(id: string): Promise<Either<GatewayError, Transaction>>;
  listTransactions(filter: Filter): Promise<Transaction[]>;
}

// La implementación puede implementar múltiples interfaces
class StripeGateway implements Chargeable, Refundable, TransactionQueryable {
  // ...implementación completa
}

// Cada Use Case depende solo de lo que necesita
class ProcessPaymentUseCase {
  constructor(private gateway: Chargeable) {} // Solo necesita charge()
}

class RefundPaymentUseCase {
  constructor(private gateway: Refundable) {} // Solo necesita refund()
}
```
- **Cómo lo preguntarían**: "Diseña las interfaces para un sistema de pagos que soporte diferentes operaciones: cobro, reembolso, consulta. ¿Cómo las segregarías?"

### ISP a nivel de Arquitectura (módulos y servicios)
- **Definición**: El principio aplica a nivel de módulos npm, servicios, y APIs. No importar/depender de módulos con funcionalidad que no usas.
- **Ejemplo AWS Serverless**:
```typescript
// ❌ VIOLACIÓN: Lambda de cobro importa TODO el SDK de AWS
import AWS from 'aws-sdk'; // 200 servicios que no usas

// ✅ ISP aplicado: Solo importar lo que necesitas
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SQSClient } from '@aws-sdk/client-sqs';
```
- **Cómo lo preguntarían**: "Tu bundle de Lambda pesa 50MB. ¿Cómo aplicarías ISP para reducirlo?"

---

## 3. Conceptos que puedo IGNORAR (por ahora)

| Concepto | Razón para ignorar |
|----------|-------------------|
| ISP vs lenguajes dinámicos | TypeScript es estáticamente tipado, el principio aplica |
| Discusión "issue de lenguaje vs arquitectura" | Importa la aplicación práctica |
| Ejemplos OPS class del libro | El patrón es lo importante |

---

## 4. Patrones/código para mi arsenal

### Segregación para Payment Gateway
```typescript
// Interfaces segregadas por operación
interface ChargeCapability {
  charge(request: ChargeRequest): Promise<Either<ChargeError, ChargeResult>>;
}

interface RefundCapability {
  refund(
    transactionId: string, 
    amount?: Money
  ): Promise<Either<RefundError, RefundResult>>;
}

interface RecurringCapability {
  createSubscription(plan: SubscriptionPlan): Promise<Either<SubError, Subscription>>;
  cancelSubscription(subscriptionId: string): Promise<Either<SubError, void>>;
}

interface WebhookCapability {
  validateWebhook(payload: unknown, signature: string): boolean;
  parseWebhookEvent(payload: unknown): PaymentEvent;
}

// Gateway implementa las capabilities que soporta
class LyraGateway implements ChargeCapability, RefundCapability, WebhookCapability {
  // Lyra no soporta recurring, no implementa RecurringCapability
}

class StripeGateway implements ChargeCapability, RefundCapability, RecurringCapability, WebhookCapability {
  // Stripe soporta todo
}

// Use Cases dependen solo de lo que necesitan
class ProcessPaymentUseCase {
  constructor(private charger: ChargeCapability) {}
  // Solo conoce charge(), no sabe de refunds ni subscriptions
}

class SubscriptionUseCase {
  constructor(private recurring: RecurringCapability) {}
  // Solo conoce subscriptions
}
```

### Repository segregado
```typescript
// ❌ Fat Repository
interface PaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(id: string): Promise<Payment | null>;
  findByCustomer(customerId: string): Promise<Payment[]>;
  findByDateRange(range: DateRange): Promise<Payment[]>;
  aggregate(query: AggregationQuery): Promise<AggregationResult>;
  delete(id: string): Promise<void>;
  // ... 20 métodos más
}

// ✅ Segregated Repositories
interface PaymentWriter {
  save(payment: Payment): Promise<void>;
}

interface PaymentReader {
  findById(id: string): Promise<Payment | null>;
  findByCustomer(customerId: string): Promise<Payment[]>;
}

interface PaymentQueryService {
  findByDateRange(range: DateRange): Promise<Payment[]>;
  aggregate(query: AggregationQuery): Promise<AggregationResult>;
}

// CQRS natural: los commands usan Writer, las queries usan Reader/QueryService
class ProcessPaymentUseCase {
  constructor(private repo: PaymentWriter) {} // Solo escribe
}

class GetPaymentHistoryUseCase {
  constructor(private repo: PaymentReader) {} // Solo lee
}
```

---

## 5. Checklist de "¿lo entendí?"

1. ¿Tengo interfaces con más de 5-7 métodos? (Señal de fat interface)
2. ¿Mis Use Cases dependen de interfaces que tienen métodos que NO usan?
3. ¿Puedo nombrar mis interfaces por **rol/capability** en vez de por entidad?
4. ¿Cambiar el método `refund()` forzaría rebuild del módulo de `charge()`?
5. ¿Mis imports de npm/aws-sdk traen código que no uso?

---

## 6. Conexión con otros conceptos

| Relación | Descripción |
|----------|-------------|
| **SRP (Cap 7)** | SRP para clases/módulos; ISP para interfaces |
| **LSP (Cap 9)** | Fat interfaces hacen más difícil cumplir LSP |
| **DIP (Cap 11)** | Las interfaces de DIP deben ser segregadas (ISP) |
| **CQRS Pattern** | ISP naturalmente lleva a separar `Reader` de `Writer` |
| **Payment Engine** | `Chargeable`, `Refundable`, `RecurringCapability` como interfaces segregadas |
