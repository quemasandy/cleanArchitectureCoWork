# Capítulo 22: The Clean Architecture

## 1. TL;DR

Clean Architecture integra Hexagonal Architecture, DCI, y BCE en un modelo de **círculos concéntricos** donde la regla fundamental es: **las dependencias de código fuente solo apuntan hacia adentro**. El centro contiene Entities (reglas de negocio críticas), luego Use Cases, luego Adapters, y en el exterior los Frameworks/Drivers. Nada interno puede mencionar algo externo. Esta regla es la clave de toda la arquitectura.

---

## 2. Conceptos que DEBO dominar

### The Dependency Rule (La piedra angular)
- **Definición**: Las dependencias de código fuente SOLO deben apuntar hacia adentro, hacia políticas de nivel más alto. Nada interno puede conocer nada de un círculo externo.
- **Ejemplo Payment Engine**:
```typescript
// ✅ CORRECTO: Use Case importa de Domain (interno)
// domain/useCases/ProcessPaymentUseCase.ts
import { Payment } from '../entities/Payment';           // ← Hacia adentro
import { PaymentGateway } from '../ports/PaymentGateway'; // ← Interface en dominio

// ❌ INCORRECTO: Domain importa de Infrastructure (externo)
// domain/entities/Payment.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'; // ← VIOLACIÓN!
```
- **Cómo lo preguntarían**: "Dibuja el diagrama de dependencias de tu sistema. ¿Todas las flechas apuntan hacia el centro?"

### Las 4 capas
- **Entities (centro)**: Reglas de negocio críticas, enterprise-wide. Pueden ser usadas por múltiples aplicaciones.
- **Use Cases**: Reglas de aplicación específicas. Orquestan Entities.
- **Interface Adapters**: Controllers, Presenters, Gateways. Convierten datos entre el formato de Use Cases/Entities y el formato externo.
- **Frameworks & Drivers**: Web framework, DB, UI. Detalles que pueden cambiar.

```typescript
// ENTITIES (centro) - Reglas de negocio puras
class Payment {
  readonly amount: Money;
  calculateFee(rate: Rate): Money { /* ... */ }
  canBeRefunded(): boolean { /* ... */ }
}

// USE CASES - Orquestación de la aplicación
class ProcessPaymentUseCase {
  execute(command: Command): Either<Error, Result> {
    const payment = Payment.create(command.amount);
    // Orquesta entities y llama a ports
  }
}

// INTERFACE ADAPTERS - Traducción de formatos
class LyraGateway implements PaymentGateway {
  async charge(request: ChargeRequest): Promise<ChargeResult> {
    // Traduce domain -> Lyra API -> domain
  }
}

class PaymentController {
  async handle(httpRequest: Request): Response {
    const command = this.toCommand(httpRequest);
    const result = await this.useCase.execute(command);
    return this.toResponse(result);
  }
}

// FRAMEWORKS & DRIVERS - El exterior
// Lambda handler, Express app, DynamoDB client
```
- **Cómo lo preguntarían**: "Explícame las 4 capas de Clean Architecture y da un ejemplo de qué código va en cada una."

### Crossing Boundaries (Cruzando fronteras)
- **Definición**: Cuando necesitas que un círculo interno llame a uno externo (ej: Use Case guardando en DB), usas **inversión de dependencias**: el Use Case define una interface (puerto), y la implementación (adapter) vive afuera.
- **Ejemplo Payment Engine**:
```typescript
// Use Case (interno) define el PORT
// domain/ports/PaymentRepository.ts
interface PaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(id: PaymentId): Promise<Option<Payment>>;
}

// Infrastructure (externa) implementa el ADAPTER
// infrastructure/adapters/DynamoDBPaymentRepository.ts
class DynamoDBPaymentRepository implements PaymentRepository {
  constructor(private client: DynamoDBClient) {}
  
  async save(payment: Payment): Promise<void> {
    await this.client.put({
      TableName: 'payments',
      Item: PaymentMapper.toDynamoDB(payment)
    });
  }
}

// El Use Case usa la interface, no la implementación
class ProcessPaymentUseCase {
  constructor(private repo: PaymentRepository) {} // ← Interface
  
  async execute(command: Command): Promise<Result> {
    const payment = Payment.create(command);
    await this.repo.save(payment); // No sabe que es DynamoDB
  }
}
```
- **Cómo lo preguntarían**: "El Use Case necesita guardar en DynamoDB, pero no puede importar el SDK de AWS. ¿Cómo lo resuelves?"

---

## 3. Conceptos que puedo IGNORAR (por ahora)

| Concepto | Razón para ignorar |
|----------|-------------------|
| Hexagonal vs Onion vs Clean | Todos son variantes del mismo principio |
| DCI Architecture | Referencia histórica |
| BCE (Boundary-Control-Entity) | Precursor, concepto integrado |
| Detalles del diagrama UML | El patrón mental es suficiente |

---

## 4. Patrones/código para mi arsenal

### Estructura completa de Payment Engine con Clean Architecture
```
src/
├── domain/                        # CÍRCULO INTERNO
│   ├── entities/
│   │   ├── Payment.ts
│   │   ├── PaymentStatus.ts
│   │   └── Money.ts
│   ├── ports/                     # Interfaces que el dominio DEFINE
│   │   ├── PaymentGateway.ts
│   │   ├── PaymentRepository.ts
│   │   └── EventPublisher.ts
│   ├── useCases/
│   │   ├── ProcessPayment/
│   │   │   ├── ProcessPaymentUseCase.ts
│   │   │   ├── ProcessPaymentCommand.ts    # Input DTO
│   │   │   └── ProcessPaymentResult.ts     # Output DTO
│   │   └── RefundPayment/
│   │       └── ...
│   └── events/
│       ├── PaymentProcessed.ts
│       └── PaymentRefunded.ts
│
├── infrastructure/                # CÍRCULO EXTERNO
│   ├── adapters/                  # Implementan las interfaces del dominio
│   │   ├── gateways/
│   │   │   ├── LyraGateway.ts
│   │   │   ├── MercadoPagoGateway.ts
│   │   │   └── StripeGateway.ts
│   │   ├── repositories/
│   │   │   └── DynamoDBPaymentRepository.ts
│   │   └── events/
│   │       └── EventBridgePublisher.ts
│   ├── handlers/                  # Entry points
│   │   ├── http/
│   │   │   └── processPaymentHandler.ts
│   │   ├── sqs/
│   │   │   └── paymentQueueHandler.ts
│   │   └── eventBridge/
│   │       └── paymentEventHandler.ts
│   └── config/
│       └── container.ts           # Composition Root
│
└── main.ts
```

### Flow completo respetando Dependency Rule
```typescript
// 1. Entry Point (Framework/Driver)
// infrastructure/handlers/http/processPaymentHandler.ts
export const handler: APIGatewayProxyHandler = async (event) => {
  const useCase = container.get<ProcessPaymentUseCase>('ProcessPaymentUseCase');
  const presenter = new HttpPaymentPresenter();
  
  const command = HttpPaymentParser.toCommand(event);
  const result = await useCase.execute(command);
  
  return presenter.present(result);
};

// 2. Use Case (Application Business Rules)
// domain/useCases/ProcessPayment/ProcessPaymentUseCase.ts
export class ProcessPaymentUseCase {
  constructor(
    private gateway: PaymentGateway,       // Port
    private repository: PaymentRepository, // Port
    private publisher: EventPublisher      // Port
  ) {}

  async execute(command: ProcessPaymentCommand): Promise<Either<PaymentError, PaymentResult>> {
    // Crear Entity
    const paymentResult = Payment.create(command);
    if (paymentResult.isLeft()) return paymentResult;
    
    const payment = paymentResult.value;
    
    // Llamar a gateway (via interface)
    const chargeResult = await this.gateway.charge(payment.toChargeRequest());
    if (chargeResult.isLeft()) return left(PaymentError.gatewayFailed(chargeResult.left));
    
    // Actualizar entity con resultado
    const confirmedPayment = payment.confirm(chargeResult.value);
    
    // Persistir (via interface)
    await this.repository.save(confirmedPayment);
    
    // Publicar evento (via interface)
    await this.publisher.publish(PaymentProcessed.from(confirmedPayment));
    
    return right(PaymentResult.from(confirmedPayment));
  }
}

// 3. Adapter (Interface Adapter)
// infrastructure/adapters/gateways/LyraGateway.ts
export class LyraGateway implements PaymentGateway {
  constructor(private client: LyraClient) {}

  async charge(request: ChargeRequest): Promise<Either<GatewayError, ChargeResult>> {
    const lyraRequest = LyraMapper.toRequest(request);
    
    try {
      const response = await this.client.createPayment(lyraRequest);
      return right(LyraMapper.toResult(response));
    } catch (error) {
      return left(GatewayError.fromLyra(error));
    }
  }
}

// 4. Entity (Enterprise Business Rules)
// domain/entities/Payment.ts
export class Payment {
  private constructor(/* ... */) {}

  static create(command: ProcessPaymentCommand): Either<PaymentError, Payment> {
    // Validaciones de reglas de negocio críticas
  }

  confirm(chargeResult: ChargeResult): Payment {
    return this.with({
      status: PaymentStatus.CONFIRMED,
      gatewayReference: chargeResult.transactionId
    });
  }

  toChargeRequest(): ChargeRequest {
    return { amount: this.amount, currency: this.currency };
  }
}
```

---

## 5. Checklist de "¿lo entendí?"

1. ¿TODAS las flechas de `import` de mi `domain/` apuntan **hacia archivos dentro de domain/**?
2. ¿Mis interfaces (`PaymentGateway`, `PaymentRepository`) viven en `domain/ports/`?
3. ¿Mis implementaciones (`LyraGateway`, `DynamoDBRepository`) viven en `infrastructure/adapters/`?
4. ¿Puedo compilar mi `domain/` **sin** instalar `@aws-sdk/*` ni `express`?
5. ¿Mi `Composition Root` es el **único lugar** que conoce las implementaciones concretas?

---

## 6. Conexión con otros conceptos

| Relación | Descripción |
|----------|-------------|
| **DIP (Cap 11)** | Clean Architecture ES DIP aplicado a nivel arquitectónico |
| **Business Rules (Cap 20)** | Entities = Critical Business Rules; Use Cases = Application Rules |
| **Screaming Architecture (Cap 21)** | La estructura de carpetas debe reflejar estas capas |
| **Boundaries (Cap 17)** | Cada círculo es una boundary |
| **Hexagonal/Ports & Adapters** | Sinónimos: Ports = Interfaces en domain/ports; Adapters = Implementaciones |
| **Payment Engine** | Domain define `PaymentGateway`; Infra implementa `LyraGateway`, `MercadoPagoGateway` |
