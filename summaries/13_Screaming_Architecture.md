# Capítulo 21: Screaming Architecture

## 1. TL;DR

Cuando alguien abre tu repositorio, la estructura de carpetas debería **gritar el dominio de negocio**, no el framework que usas. Si ves `controllers/`, `services/`, `models/`, gritas "¡SOY EXPRESS/NEST!". Si ves `payments/`, `merchants/`, `refunds/`, gritas "¡SOY UN PAYMENT ENGINE!". Los frameworks son detalles; tu arquitectura debe hacer evidente el propósito del sistema.

---

## 2. Conceptos que DEBO dominar

### Arquitectura que grita el negocio
- **Definición**: La estructura de carpetas y la organización del código deben revelar la intención del sistema, no las herramientas técnicas.
- **Ejemplo Payment Engine**:
```
# ❌ Grita "SOY NEST.JS!"
src/
├── controllers/
│   ├── PaymentController.ts
│   ├── RefundController.ts
├── services/
│   ├── PaymentService.ts
│   ├── RefundService.ts
├── entities/
│   ├── Payment.ts
├── dto/
│   ├── CreatePaymentDto.ts

# ✅ Grita "SOY UN PAYMENT ENGINE!"
src/
├── payments/
│   ├── domain/
│   │   ├── Payment.ts
│   │   ├── PaymentGateway.ts
│   ├── useCases/
│   │   ├── ProcessPayment.ts
│   │   ├── GetPaymentStatus.ts
├── refunds/
│   ├── domain/
│   │   ├── Refund.ts
│   ├── useCases/
│   │   ├── ProcessRefund.ts
├── merchants/
│   ├── domain/
│   ├── useCases/
├── shared/
│   ├── infrastructure/
│   │   ├── aws/
│   │   ├── gateways/
```
- **Cómo lo preguntarían**: "Muéstrame tu estructura de carpetas. ¿Qué me dice sobre el negocio que resuelve el sistema?"

### Frameworks como detalles (no como arquitectura)
- **Definición**: Tu arquitectura NO debe depender del framework. Deberías poder cambiar de Express a Fastify, o de Lambda a ECS, sin tocar las reglas de negocio.
- **Ejemplo AWS Serverless**:
```typescript
// ❌ Arquitectura definida por Lambda
// Todo el código de negocio DENTRO del handler
export const handler: APIGatewayProxyHandler = async (event) => {
  const payment = JSON.parse(event.body!);
  const dynamoResult = await dynamoClient.put({
    TableName: 'payments',
    Item: payment
  }).promise();
  // 200 líneas más de lógica...
  return { statusCode: 200, body: JSON.stringify(result) };
};

// ✅ Framework como detalle
// Handler es un adaptador delgado
export const handler: APIGatewayProxyHandler = async (event) => {
  const command = PaymentCommandParser.fromApiGateway(event);
  const result = await processPaymentUseCase.execute(command);
  return ApiGatewayPresenter.toResponse(result);
};

// El Use Case no sabe que está en Lambda
class ProcessPaymentUseCase {
  async execute(command: ProcessPaymentCommand): Promise<Either<PaymentError, PaymentResult>> {
    // Lógica de negocio pura
  }
}
```
- **Cómo lo preguntarían**: "Si mañana quisieras migrar de Lambda a ECS, ¿cuánto código de negocio tendrías que cambiar?"

### Testability como consecuencia
- **Definición**: Si tu arquitectura grita el negocio y los frameworks son detalles, puedes testear los Use Cases sin web server, sin base de datos, sin AWS.
- **Ejemplo Payment Engine**:
```typescript
// Test de Use Case: SIN Lambda, SIN DynamoDB, SIN HTTP
describe('ProcessPaymentUseCase', () => {
  it('should process payment successfully', async () => {
    // Arrange: Mocks puros, sin infraestructura
    const mockGateway = createMockGateway();
    const mockRepo = createMockRepository();
    const useCase = new ProcessPaymentUseCase(mockGateway, mockRepo);

    // Act: Execute con command puro
    const result = await useCase.execute({
      amount: Money.of(100, 'USD'),
      merchantId: MerchantId.of('merchant-123'),
      customerId: CustomerId.of('customer-456')
    });

    // Assert: Sin HTTP status codes
    expect(result.isRight()).toBe(true);
    expect(result.value.status).toBe('approved');
  });
});
```
- **Cómo lo preguntarían**: "¿Necesitas levantar un servidor para correr tus tests unitarios de negocio?"

---

## 3. Conceptos que puedo IGNORAR (por ahora)

| Concepto | Razón para ignorar |
|----------|-------------------|
| Comparación con arquitectura de edificios | Metáfora, no técnico |
| "Health care system" example | El patrón es lo que importa |
| Debate MVC vs otras arquitecturas | Irrelevante para el principio |

---

## 4. Patrones/código para mi arsenal

### Feature-based folder structure
```
src/
├── payments/                     # Feature: Pagos
│   ├── domain/                   # Reglas de negocio puras
│   │   ├── Payment.ts            # Entity
│   │   ├── PaymentStatus.ts      # Value Object
│   │   ├── PaymentGateway.ts     # Port (interface)
│   │   └── PaymentRepository.ts  # Port (interface)
│   ├── useCases/                 # Casos de uso
│   │   ├── ProcessPayment/
│   │   │   ├── ProcessPaymentUseCase.ts
│   │   │   ├── ProcessPaymentCommand.ts
│   │   │   └── ProcessPaymentResult.ts
│   │   └── GetPaymentStatus/
│   │       └── ...
│   ├── infrastructure/           # Implementaciones
│   │   ├── adapters/
│   │   │   ├── LyraGateway.ts
│   │   │   └── DynamoDBPaymentRepository.ts
│   │   └── handlers/             # Entry points (Lambda, HTTP)
│   │       ├── processPaymentHandler.ts
│   │       └── getPaymentStatusHandler.ts
│   └── index.ts                  # Public API del módulo
│
├── refunds/                      # Feature: Reembolsos
│   ├── domain/
│   ├── useCases/
│   └── infrastructure/
│
├── merchants/                    # Feature: Merchants
│   └── ...
│
├── shared/                       # Código compartido
│   ├── domain/
│   │   ├── Money.ts
│   │   └── Either.ts
│   └── infrastructure/
│       ├── aws/
│       │   ├── dynamoClient.ts
│       │   └── sqsClient.ts
│       └── container.ts          # DI Container
│
└── main.ts                       # Composition Root
```

### Test organizados por feature
```
tests/
├── payments/
│   ├── unit/
│   │   ├── Payment.test.ts       # Entity tests
│   │   └── ProcessPaymentUseCase.test.ts
│   └── integration/
│       └── LyraGateway.test.ts
├── refunds/
│   └── ...
```

---

## 5. Checklist de "¿lo entendí?"

1. Si un dev nuevo abre mi repo, ¿**sabe inmediatamente** que es un Payment Engine?
2. ¿Mis carpetas de primer nivel son **features de negocio** (`payments/`, `refunds/`) o tipos técnicos (`controllers/`, `services/`)?
3. ¿Puedo testear mis Use Cases **sin** levantar Express/Lambda?
4. ¿La palabra "Lambda" o "DynamoDB" aparece en mi carpeta `domain/`? (No debería)
5. ¿Podría extraer mi `domain/` y `useCases/` a un paquete npm independiente?

---

## 6. Conexión con otros conceptos

| Relación | Descripción |
|----------|-------------|
| **Clean Architecture (Cap 22)** | Screaming Architecture es la manifestación visual de Clean Architecture |
| **DIP (Cap 11)** | El framework es detalle → debe depender del dominio, no al revés |
| **Boundaries (Cap 17)** | Las carpetas representan boundaries arquitectónicos |
| **Vertical Slice Architecture** | Similar enfoque de organizar por feature |
| **Payment Engine** | Carpetas `payments/`, `refunds/`, `merchants/` que gritan el dominio |
