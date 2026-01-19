# Capítulo 8: OCP - Open-Closed Principle

## 1. TL;DR

El OCP dice que debes poder **extender el comportamiento** de un sistema **sin modificar el código existente**. En la práctica, esto significa diseñar jerarquías de componentes donde los de alto nivel (reglas de negocio) están protegidos de cambios en los de bajo nivel (detalles de infraestructura). Si agregar MercadoPago a tu Payment Engine requiere modificar el core de procesamiento, has violado OCP.

---

## 2. Conceptos que DEBO dominar

### Jerarquía de Protección
- **Definición**: Componentes de alto nivel deben estar protegidos de cambios en componentes de bajo nivel. Las dependencias apuntan hacia lo que quieres proteger.
- **Ejemplo Payment Engine**:
```
PaymentUseCase (más protegido)
     ↑
PaymentGateway (interface)
     ↑
LyraAdapter | MercadoPagoAdapter | PayUAdapter (menos protegido)
```
- **Cómo lo preguntarían**: "¿Cómo diseñarías un sistema de pagos para que agregar un nuevo gateway no requiera cambiar el código del procesador principal?"

### Inversión de Dependencias para OCP
- **Definición**: Usar interfaces entre componentes para que los cambios en implementaciones no afecten a los consumidores.
- **Ejemplo Payment Engine**:
```typescript
// ✅ Alto nivel NO conoce detalles de bajo nivel
interface PaymentGateway {
  charge(request: ChargeRequest): Promise<Either<GatewayError, ChargeResult>>;
  refund(transactionId: string): Promise<Either<GatewayError, RefundResult>>;
}

// Agregar nuevo gateway = NO modificar ProcessPaymentUseCase
class StripeGateway implements PaymentGateway {
  async charge(request: ChargeRequest): Promise<Either<GatewayError, ChargeResult>> {
    // Nueva implementación, código existente intacto
  }
}
```
- **Cómo lo preguntarían**: "Tu sistema soporta Lyra y MercadoPago. El negocio quiere agregar Stripe. ¿Cuántos archivos existentes tendrías que modificar?"

### Interactor como componente más protegido
- **Definición**: El Interactor (Use Case) contiene las reglas de negocio de alto nivel y debe ser inmune a cambios en Controllers, Presenters, Databases, y Views.
- **Ejemplo AWS Serverless**:
```typescript
// El handler de Lambda (Controller) puede cambiar
// El Use Case permanece estable
export const handler: APIGatewayProxyHandler = async (event) => {
  const useCase = container.resolve(ProcessPaymentUseCase);
  // El Use Case NO sabe que está en Lambda
  const result = await useCase.execute(parseRequest(event));
  return formatResponse(result);
};
```
- **Cómo lo preguntarían**: "Si migras de API Gateway + Lambda a ECS, ¿qué código de negocio cambiaría?"

---

## 3. Conceptos que puedo IGNORAR (por ahora)

| Concepto | Razón para ignorar |
|----------|-------------------|
| Diagrama UML detallado del libro | Concepto más importante que la notación |
| FinancialDataGateway example | Es Java-específico, el patrón es lo que importa |
| Discusión de arrowheads en UML | Implementación importa, no la notación |

---

## 4. Patrones/código para mi arsenal

### Plugin Architecture para Payment Gateways
```typescript
// Gateway interface = punto de extensión
interface PaymentGateway {
  readonly type: GatewayType;
  charge(request: ChargeRequest): Promise<Either<GatewayError, ChargeResult>>;
  refund(transactionId: string): Promise<Either<GatewayError, RefundResult>>;
  getStatus(transactionId: string): Promise<TransactionStatus>;
}

// Registry permite agregar gateways sin modificar código existente
class GatewayRegistry {
  private gateways = new Map<GatewayType, PaymentGateway>();

  register(gateway: PaymentGateway): void {
    this.gateways.set(gateway.type, gateway);
  }

  get(type: GatewayType): PaymentGateway {
    const gateway = this.gateways.get(type);
    if (!gateway) throw new GatewayNotFoundError(type);
    return gateway;
  }
}

// Uso: Agregar nuevo gateway = solo crear nueva clase + registrar
const registry = new GatewayRegistry();
registry.register(new LyraGateway(config.lyra));
registry.register(new MercadoPagoGateway(config.mercadoPago));
registry.register(new StripeGateway(config.stripe)); // ← EXTENSIÓN, no modificación
```

### AWS Lambda con OCP
```typescript
// infrastructure/handlers/processPayment.ts
// Este archivo puede cambiar sin afectar el dominio
export const handler = middy(async (event: SQSEvent) => {
  const useCase = container.resolve(ProcessPaymentUseCase);
  
  for (const record of event.Records) {
    const command = JSON.parse(record.body) as ProcessPaymentCommand;
    await useCase.execute(command);
  }
})
.use(errorHandler())
.use(loggerMiddleware());

// domain/useCases/processPayment.ts  
// Este archivo está PROTEGIDO de cambios de infraestructura
class ProcessPaymentUseCase {
  constructor(
    private gatewayRegistry: GatewayRegistry,
    private paymentRepository: PaymentRepository,
    private eventPublisher: DomainEventPublisher
  ) {}

  async execute(command: ProcessPaymentCommand): Promise<Either<PaymentError, PaymentResult>> {
    const gateway = this.gatewayRegistry.get(command.gatewayType);
    // Lógica de negocio pura, independiente de Lambda/SQS/DynamoDB
  }
}
```

---

## 5. Checklist de "¿lo entendí?"

1. ¿Puedo agregar un nuevo payment gateway **sin modificar** el código del Use Case?
2. ¿Mis Use Cases conocen que están corriendo en Lambda/API Gateway/SQS?
3. ¿Las flechas de dependencia apuntan **hacia** las reglas de negocio, no **desde** ellas?
4. ¿Puedo listar mis componentes en orden de "más protegido" a "menos protegido"?
5. ¿Tengo interfaces entre cada capa que permiten **extensión por plugins**?

---

## 6. Conexión con otros conceptos

| Relación | Descripción |
|----------|-------------|
| **SRP (Cap 7)** | SRP separa por actor; OCP protege lo separado de cambios |
| **DIP (Cap 11)** | Las interfaces que usamos para OCP son la manifestación de DIP |
| **Boundaries (Cap 17)** | OCP define DÓNDE poner las boundaries arquitectónicas |
| **Clean Architecture (Cap 22)** | Los círculos concéntricos SON la jerarquía de protección de OCP |
| **Payment Engine** | El `ProcessPaymentUseCase` nunca cambia cuando agregas Stripe, PayU, o Lyra |
