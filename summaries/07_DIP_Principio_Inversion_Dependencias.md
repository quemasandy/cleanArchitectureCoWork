# Capítulo 11: DIP - Dependency Inversion Principle

## 1. TL;DR

DIP es el fundamento de Clean Architecture: **el código de alto nivel (reglas de negocio) NO debe depender del código de bajo nivel (detalles de infraestructura)**. En vez de `ProcessPaymentUseCase → LyraGateway`, debes tener `ProcessPaymentUseCase → PaymentGateway ← LyraGateway`. Las flechas de dependencia se **invierten** usando interfaces que pertenecen al dominio, no a la infraestructura.

---

## 2. Conceptos que DEBO dominar

### Inversión de Dependencias (el concepto central)
- **Definición**: Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones. Las abstracciones no deben depender de detalles; los detalles deben depender de abstracciones.
- **Ejemplo Payment Engine**:
```typescript
// ❌ SIN DIP: Use Case depende directamente de implementación
import { LyraClient } from 'lyra-sdk'; // Dependencia de bajo nivel

class ProcessPaymentUseCase {
  constructor(private lyra: LyraClient) {} // Acoplado a Lyra
}

// ✅ CON DIP: Use Case depende de abstracción
// La interfaz vive en el DOMINIO, no en infraestructura
interface PaymentGateway { // Abstracción
  charge(request: ChargeRequest): Promise<Either<GatewayError, ChargeResult>>;
}

class ProcessPaymentUseCase {
  constructor(private gateway: PaymentGateway) {} // Desacoplado
}

// La implementación (detalle) depende de la abstracción
class LyraGateway implements PaymentGateway { // Detalle → Abstracción
  constructor(private client: LyraClient) {}
  async charge(request: ChargeRequest) { /* ... */ }
}
```
- **Cómo lo preguntarían**: "Dibuja el diagrama de dependencias de tu sistema de pagos. ¿Hacia dónde apuntan las flechas?"

### Stable Abstractions Principle
- **Definición**: Las interfaces deben ser estables (cambiar poco); las implementaciones pueden ser volátiles (cambiar mucho).
- **Ejemplo AWS Serverless**:
```typescript
// ESTABLE: Interfaz de dominio (rara vez cambia)
interface PaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(id: PaymentId): Promise<Option<Payment>>;
}

// VOLÁTIL: Implementación DynamoDB (puede cambiar a PostgreSQL)
class DynamoDBPaymentRepository implements PaymentRepository {
  constructor(private client: DynamoDBClient) {}
  // Implementación específica de DynamoDB
}

// El Use Case depende de lo ESTABLE, no de lo VOLÁTIL
class ProcessPaymentUseCase {
  constructor(private repo: PaymentRepository) {} // Estable
}
```
- **Cómo lo preguntarían**: "¿Qué pasa si quieres migrar de DynamoDB a Aurora? ¿Cuántos archivos de dominio tendrías que modificar?"

### Factories y la creación de objetos
- **Definición**: La creación de implementaciones concretas debe hacerse en un punto de entrada (Main/Composition Root), no en el dominio.
- **Ejemplo Payment Engine**:
```typescript
// infrastructure/container.ts (Composition Root)
const container = {
  paymentGateway: (): PaymentGateway => {
    switch (config.gateway.type) {
      case 'lyra': return new LyraGateway(config.gateway.lyra);
      case 'mercadopago': return new MercadoPagoGateway(config.gateway.mp);
      case 'stripe': return new StripeGateway(config.gateway.stripe);
    }
  },
  
  paymentRepository: (): PaymentRepository => {
    return new DynamoDBPaymentRepository(dynamoClient);
  },
  
  processPaymentUseCase: (): ProcessPaymentUseCase => {
    return new ProcessPaymentUseCase(
      container.paymentGateway(),
      container.paymentRepository()
    );
  }
};

// Lambda handler solo resuelve del container
export const handler = async (event: SQSEvent) => {
  const useCase = container.processPaymentUseCase();
  // ...
};
```
- **Cómo lo preguntarían**: "¿Dónde vive el código que decide si usar LyraGateway o StripeGateway? ¿Por qué?"

---

## 3. Conceptos que puedo IGNORAR (por ahora)

| Concepto | Razón para ignorar |
|----------|-------------------|
| AbstractFactory en detalle | El concepto de Composition Root es suficiente |
| Stable Dependencies Principle (métricas) | Se cubre en capítulo 14 |
| Diagrama UML del libro | El patrón mental es lo importante |

---

## 4. Patrones/código para mi arsenal

### Estructura de carpetas que refleja DIP
```
src/
├── domain/                    # Alto nivel (estable)
│   ├── entities/
│   │   └── Payment.ts
│   ├── ports/                 # Interfaces que el dominio DEFINE
│   │   ├── PaymentGateway.ts
│   │   ├── PaymentRepository.ts
│   │   └── EventPublisher.ts
│   └── useCases/
│       └── ProcessPaymentUseCase.ts
│
├── infrastructure/            # Bajo nivel (volátil)
│   ├── adapters/              # Implementaciones que DEPENDEN del dominio
│   │   ├── LyraGateway.ts
│   │   ├── MercadoPagoGateway.ts
│   │   └── DynamoDBRepository.ts
│   ├── handlers/
│   │   └── processPaymentHandler.ts
│   └── container.ts           # Composition Root
```

### Port & Adapter completo
```typescript
// domain/ports/PaymentGateway.ts
// La interfaz vive en el DOMINIO
export interface PaymentGateway {
  charge(request: ChargeRequest): Promise<Either<GatewayError, ChargeResult>>;
  refund(transactionId: string): Promise<Either<GatewayError, RefundResult>>;
}

export interface ChargeRequest {
  amount: Money;
  customerId: CustomerId;
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
}

export interface ChargeResult {
  transactionId: TransactionId;
  status: PaymentStatus;
  processedAt: Date;
}

// domain/useCases/ProcessPaymentUseCase.ts
export class ProcessPaymentUseCase {
  constructor(
    private readonly gateway: PaymentGateway,      // Puerto
    private readonly repository: PaymentRepository, // Puerto
    private readonly publisher: EventPublisher      // Puerto
  ) {}

  async execute(command: ProcessPaymentCommand): Promise<Either<PaymentError, Payment>> {
    // Lógica de negocio pura
    // NO conoce Lyra, DynamoDB, ni SQS
  }
}

// infrastructure/adapters/LyraGateway.ts
import { PaymentGateway, ChargeRequest, ChargeResult } from '../../domain/ports/PaymentGateway';
import { LyraClient } from 'lyra-sdk';

// El adaptador IMPLEMENTA la interfaz del dominio
export class LyraGateway implements PaymentGateway {
  constructor(private readonly client: LyraClient) {}

  async charge(request: ChargeRequest): Promise<Either<GatewayError, ChargeResult>> {
    // Traduce del dominio a Lyra y viceversa
    const lyraRequest = this.tolyraRequest(request);
    const response = await this.client.createPayment(lyraRequest);
    return this.toChargeResult(response);
  }
}
```

### Testing gracias a DIP
```typescript
// test/useCases/ProcessPaymentUseCase.test.ts
describe('ProcessPaymentUseCase', () => {
  it('should process payment successfully', async () => {
    // Mock del puerto - no necesitas Lyra real
    const mockGateway: PaymentGateway = {
      charge: jest.fn().mockResolvedValue(
        right({ transactionId: 'tx_123', status: 'approved' })
      )
    };
    
    const mockRepo: PaymentRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn()
    };
    
    const useCase = new ProcessPaymentUseCase(mockGateway, mockRepo);
    
    const result = await useCase.execute(validCommand);
    
    expect(result.isRight()).toBe(true);
    expect(mockGateway.charge).toHaveBeenCalledWith(expect.objectContaining({
      amount: validCommand.amount
    }));
  });
});
```

---

## 5. Checklist de "¿lo entendí?"

1. ¿Las interfaces (`PaymentGateway`, `PaymentRepository`) viven en el **dominio**, no en infraestructura?
2. ¿Las implementaciones (`LyraGateway`, `DynamoDBRepository`) **importan** del dominio, no al revés?
3. ¿Puedo testear mis Use Cases **sin** conexión a APIs externas ni base de datos?
4. ¿Mi `Composition Root` es el **único lugar** que conoce todas las implementaciones concretas?
5. ¿Las flechas de dependencia en mi diagrama apuntan **hacia el centro** (dominio)?

---

## 6. Conexión con otros conceptos

| Relación | Descripción |
|----------|-------------|
| **OCP (Cap 8)** | DIP es el mecanismo para lograr OCP - las interfaces permiten extensión |
| **LSP (Cap 9)** | Las implementaciones que usas con DIP deben cumplir LSP |
| **ISP (Cap 10)** | Las interfaces de DIP deben ser segregadas |
| **Clean Architecture (Cap 22)** | DIP es la regla de dependencia que hace funcionar los círculos |
| **Hexagonal Architecture** | Ports = Interfaces del dominio; Adapters = Implementaciones de infraestructura |
| **Payment Engine** | El dominio define `PaymentGateway`; la infra implementa `LyraGateway`, `MercadoPagoGateway` |
