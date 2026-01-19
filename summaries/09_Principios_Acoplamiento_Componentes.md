# Capítulo 14: Component Coupling

## 1. TL;DR

Component Coupling trata sobre **cómo manejar dependencias entre componentes**. Los tres principios clave son: **ADP** (no ciclos en el grafo de dependencias), **SDP** (depender en dirección de la estabilidad), y **SAP** (componentes estables deben ser abstractos). Usa métricas de Instability (I) y Abstractness (A) para medir si tus componentes están en la "Zona de Pain" (concreto y estable) o la "Zona de Uselessness" (abstracto sin dependientes).

---

## 2. Conceptos que DEBO dominar

### Acyclic Dependencies Principle (ADP)
- **Definición**: El grafo de dependencias entre componentes NO debe tener ciclos. Si A → B → C → A, tienes un problema.
- **Ejemplo Payment Engine**:
```typescript
// ❌ CICLO: payments depende de notifications, notifications depende de payments
// payments/ProcessPayment.ts
import { NotificationService } from '../notifications/NotificationService';

// notifications/NotificationService.ts  
import { Payment } from '../payments/Payment'; // CICLO!

// ✅ SOLUCIÓN 1: Dependency Inversion
// payments/ports/PaymentNotifier.ts (interface en payments)
interface PaymentNotifier {
  notifyPaymentProcessed(payment: Payment): Promise<void>;
}

// notifications/adapters/EmailPaymentNotifier.ts (implementa interface de payments)
class EmailPaymentNotifier implements PaymentNotifier {
  // Notifications depende de payments, no al revés
}

// ✅ SOLUCIÓN 2: Crear componente compartido
// shared/events/PaymentProcessedEvent.ts
interface PaymentProcessedEvent {
  paymentId: string;
  amount: Money;
}
// Ambos dependen de shared, no entre sí
```
- **Cómo lo preguntarían**: "Tu módulo de payments importa de notifications, y notifications importa de payments. ¿Cuál es el problema y cómo lo resuelves?"

### Stable Dependencies Principle (SDP)
- **Definición**: Depende en la dirección de la estabilidad. Componentes que cambian frecuentemente no deben tener dependientes.
- **Ejemplo Payment Engine**:
```
ESTABLE (muchos dependientes, pocos cambios):
  ├── domain/entities/Payment.ts
  ├── domain/ports/PaymentGateway.ts
  └── shared/Money.ts

VOLÁTIL (pocos dependientes, cambios frecuentes):
  ├── infrastructure/adapters/LyraGateway.ts
  ├── infrastructure/handlers/processPaymentHandler.ts
  └── infrastructure/config/featureFlags.ts

REGLA: Volátil → Estable ✅
       Estable → Volátil ❌
```
- **Cómo lo preguntarían**: "Tu Payment entity importa FeatureFlags que cambia semanalmente. ¿Qué problema ves?"

### Stable Abstractions Principle (SAP)
- **Definición**: Un componente debe ser tan abstracto como estable. Componentes estables deben ser abstractos para permitir extensión.
- **Ejemplo Payment Engine**:
```typescript
// Estable + Abstracto = ✅ Ideal
// domain/ports/PaymentGateway.ts
interface PaymentGateway {  // Abstracto
  charge(request: ChargeRequest): Promise<Either<GatewayError, ChargeResult>>;
}
// Tiene muchos dependientes (estable) pero es interface (abstracto)

// Estable + Concreto = ❌ Zone of Pain
// Si Payment.ts fuera estable pero sin interfaces, sería doloroso de cambiar

// Volátil + Concreto = ✅ Ok
// LyraGateway.ts - concreto pero pocos dependientes, fácil de cambiar
```
- **Cómo lo preguntarían**: "Tu módulo `payments/domain` tiene 90% clases concretas y 20 módulos que dependen de él. ¿Qué problema tienes?"

### Métricas I (Instability) y A (Abstractness)
- **Definición**: 
  - I = Fan-out / (Fan-in + Fan-out) → 0 = estable, 1 = inestable
  - A = Abstract classes / Total classes → 0 = concreto, 1 = abstracto
- **Ejemplo Payment Engine**:
```
domain/ports/PaymentGateway.ts
  Fan-in: 10 (muchos lo usan)
  Fan-out: 2 (importa Money, PaymentId)
  I = 2/(10+2) = 0.17 → Estable ✅
  A = 1 (es interface) → Abstracto ✅
  → En el Main Sequence

infrastructure/adapters/LyraGateway.ts
  Fan-in: 1 (solo container lo usa)
  Fan-out: 5 (importa varias cosas)
  I = 5/(1+5) = 0.83 → Inestable (ok para adaptador)
  A = 0 (es clase concreta)
  → En el Main Sequence (inestable + concreto está bien)
```

---

## 3. Conceptos que puedo IGNORAR (por ahora)

| Concepto | Razón para ignorar |
|----------|-------------------|
| D metric (Distance) exacto | La intuición cualitativa es suficiente |
| Scatterplot analysis | Para equipos grandes con tooling |
| Main Sequence matemático | Entender las zones es suficiente |

---

## 4. Patrones/código para mi arsenal

### Detectar ciclos con ESLint
```json
// .eslintrc.json
{
  "rules": {
    "import/no-cycle": ["error", { "maxDepth": 3 }]
  }
}
```

### Estructura que respeta SDP
```
src/
├── domain/                    # ESTABLE (A alto)
│   ├── entities/              # Cambia poco
│   └── ports/                 # Interfaces
│
├── application/               # MEDIO
│   └── useCases/              # Orquestación
│
├── infrastructure/            # INESTABLE (I alto)
│   ├── adapters/              # Cambia cuando cambia Lyra/MP
│   └── handlers/              # Cambia cuando cambia Lambda
│
└── shared/                    # ESTABLE
    ├── types/                 # Value objects básicos
    └── errors/                # Error types
```

### Breaking cycles con eventos
```typescript
// ❌ Ciclo: Payment → Notification → Payment
class ProcessPaymentUseCase {
  constructor(private notifier: NotificationService) {}
  
  async execute(command: Command) {
    const payment = await this.process(command);
    await this.notifier.sendPaymentEmail(payment); // Dependencia directa
  }
}

// ✅ Sin ciclo: Payment publica evento, Notification suscribe
class ProcessPaymentUseCase {
  constructor(private eventPublisher: EventPublisher) {}
  
  async execute(command: Command) {
    const payment = await this.process(command);
    await this.eventPublisher.publish(PaymentProcessed.from(payment));
    // No conoce quién escucha
  }
}

// Notification handler (separado)
class SendPaymentEmailHandler {
  async handle(event: PaymentProcessed) {
    await this.emailService.send(event.customerId, event.paymentId);
  }
}
```

---

## 5. Checklist de "¿lo entendí?"

1. ¿Mi grafo de dependencias tiene **cero ciclos**? (Usar `npm run lint` con import/no-cycle)
2. ¿Mis componentes estables (domain/) son **mayormente interfaces**?
3. ¿Mis componentes volátiles (infrastructure/) son **mayormente clases concretas**?
4. ¿Las flechas de dependencia apuntan hacia **lo estable**?
5. ¿Uso **eventos** para desacoplar módulos que podrían crear ciclos?

---

## 6. Conexión con otros conceptos

| Relación | Descripción |
|----------|-------------|
| **DIP (Cap 11)** | DIP es la herramienta para romper ciclos |
| **Clean Architecture (Cap 22)** | Los círculos siguen SDP: externo → interno |
| **Event-Driven Architecture** | Eventos rompen ciclos sin DIP |
| **Component Cohesion (Cap 13)** | Cohesión + Coupling definen los boundaries |
| **Payment Engine** | `domain/ports` es estable; `infrastructure/adapters` es volátil |
