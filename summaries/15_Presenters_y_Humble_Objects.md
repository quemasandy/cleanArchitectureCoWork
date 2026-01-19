# Capítulo 23: Presenters and Humble Objects

## 1. TL;DR

El **Humble Object Pattern** separa código difícil de testear (UI, IO, frameworks) de código fácil de testear (lógica pura). La UI (View) es "humilde" - solo mueve datos a la pantalla, sin lógica. El Presenter contiene toda la lógica de formato y preparación de datos. Aplica este patrón en CADA boundary arquitectónica: Views, Gateway implementations, Service listeners. Esto dispara tu testability al cielo.

---

## 2. Conceptos que DEBO dominar

### Humble Object Pattern
- **Definición**: Dividir responsabilidades en dos: un objeto "humilde" que hace las cosas difíciles de testear (pero sin lógica), y un objeto testeable que contiene toda la lógica.
- **Ejemplo Payment Engine**:
```typescript
// ❌ Sin Humble Object: Logic mezclada con formateo HTTP
export const handler: APIGatewayProxyHandler = async (event) => {
  const payment = await processPayment(event.body);
  return {
    statusCode: payment.status === 'approved' ? 200 : 400,
    body: JSON.stringify({
      id: payment.id,
      amount: payment.amount.toFixed(2),
      date: payment.processedAt.toISOString(),
      status: payment.status.toUpperCase()
    })
  };
};

// ✅ Con Humble Object: Lógica en Presenter, Handler es "humilde"
// PaymentPresenter (testeable - toda la lógica)
class PaymentPresenter {
  present(result: Either<PaymentError, Payment>): PaymentViewModel {
    if (result.isLeft()) {
      return {
        success: false,
        errorCode: result.left.code,
        errorMessage: this.translateError(result.left),
        statusCode: this.mapToHttpStatus(result.left)
      };
    }
    
    const payment = result.right;
    return {
      success: true,
      data: {
        id: payment.id.value,
        amount: this.formatMoney(payment.amount),
        formattedDate: this.formatDate(payment.processedAt),
        statusDisplay: this.translateStatus(payment.status)
      },
      statusCode: 200
    };
  }
  
  private formatMoney(money: Money): string {
    return `${money.currency} ${money.amount.toFixed(2)}`;
  }
}

// Lambda Handler (humilde - cero lógica)
export const handler: APIGatewayProxyHandler = async (event) => {
  const command = parser.parse(event);
  const result = await useCase.execute(command);
  const viewModel = presenter.present(result);
  return { statusCode: viewModel.statusCode, body: JSON.stringify(viewModel) };
};
```
- **Cómo lo preguntarían**: "Tu Lambda handler tiene 100 líneas con ifs y formateo. ¿Cómo lo testeamos?"

### Database Gateways como Humble Objects
- **Definición**: La implementación del Gateway (ej: DynamoDB) es el Humble Object - solo traduce datos. El Use Case contiene la lógica testeable.
- **Ejemplo Payment Engine**:
```typescript
// Gateway Implementation (Humble - difícil de testear, mínima lógica)
class DynamoDBPaymentRepository implements PaymentRepository {
  async save(payment: Payment): Promise<void> {
    // Solo traduce y persiste, sin lógica
    await this.client.put({
      TableName: this.tableName,
      Item: PaymentMapper.toDynamoDB(payment)
    });
  }

  async findById(id: PaymentId): Promise<Option<Payment>> {
    const result = await this.client.get({
      TableName: this.tableName,
      Key: { pk: id.value }
    });
    return result.Item 
      ? some(PaymentMapper.fromDynamoDB(result.Item))
      : none();
  }
}

// Use Case (Testeable - toda la lógica de negocio)
class ProcessPaymentUseCase {
  async execute(command: Command): Promise<Either<Error, Result>> {
    // Lógica compleja aquí - TESTEABLE con mock de repository
  }
}
```
- **Cómo lo preguntarían**: "¿Dónde pones la lógica de validación de negocio? ¿En el repository o en el use case?"

### ViewModel como data structure pura
- **Definición**: El ViewModel contiene solo strings, booleans, y enums listos para mostrar. Nada de objetos de dominio.
- **Ejemplo Payment Engine**:
```typescript
// ❌ ViewModel con objetos de dominio
interface PaymentViewModel {
  payment: Payment; // ← Objeto de dominio en el view model
}

// ✅ ViewModel con datos ya formateados
interface PaymentViewModel {
  success: boolean;
  statusCode: number;
  data?: {
    id: string;
    amount: string;               // "USD 125.00" ya formateado
    formattedDate: string;        // "Jan 18, 2026" ya formateado
    statusDisplay: string;        // "Approved" ya traducido
    statusColor: 'green' | 'red' | 'yellow'; // Flag para UI
    canRefund: boolean;           // Flag computado por el Presenter
  };
  error?: {
    code: string;
    message: string;
  };
}
```
- **Cómo lo preguntarían**: "¿Por qué tu ViewModel tiene strings pre-formateados en vez de objetos Date y Money?"

---

## 3. Conceptos que puedo IGNORAR (por ahora)

| Concepto | Razón para ignorar |
|----------|-------------------|
| "ORM no existen" debate | Punto filosófico, el patrón es lo importante |
| Data Mappers en detalle | Ya lo aplicas con TypeORM/DynamoDB mappers |
| Discusión objects vs data structures | Concepto de POO, no arquitectónico |

---

## 4. Patrones/código para mi arsenal

### Gateway Webhook Handler (Humble Object)
```typescript
// Humble: Recibe webhook, parsea, delega a Use Case
export const lyraWebhookHandler: APIGatewayProxyHandler = async (event) => {
  // Validación de firma (humilde, pero necesario)
  const isValid = lyraSignatureValidator.validate(
    event.body!,
    event.headers['X-Lyra-Signature']!
  );
  if (!isValid) return { statusCode: 401, body: 'Invalid signature' };
  
  // Parsea y delega (sin lógica de negocio)
  const webhookEvent = LyraWebhookParser.parse(event.body!);
  const result = await handlePaymentWebhookUseCase.execute(webhookEvent);
  
  return presenter.present(result);
};

// Use Case (Testeable)
class HandlePaymentWebhookUseCase {
  async execute(event: PaymentWebhookEvent): Promise<Either<WebhookError, void>> {
    // Toda la lógica aquí: actualizar payment, publicar eventos, etc.
    const payment = await this.repo.findByGatewayRef(event.transactionId);
    if (payment.isNone()) {
      return left(WebhookError.paymentNotFound(event.transactionId));
    }
    
    const updatedPayment = payment.value.updateFromWebhook(event);
    await this.repo.save(updatedPayment);
    await this.publisher.publish(PaymentStatusChanged.from(updatedPayment));
    
    return right(undefined);
  }
}
```

### Presenter con formateo completo
```typescript
class PaymentListPresenter {
  present(payments: readonly Payment[]): PaymentListViewModel {
    return {
      count: payments.length,
      totalAmount: this.calculateTotal(payments),
      payments: payments.map(p => this.toPaymentRow(p)),
      exportable: payments.length > 0
    };
  }

  private toPaymentRow(payment: Payment): PaymentRowViewModel {
    return {
      id: payment.id.value,
      amount: this.formatAmount(payment.amount),
      amountColor: payment.amount.isNegative() ? 'red' : 'black',
      status: this.translateStatus(payment.status),
      statusBadgeClass: this.getStatusBadgeClass(payment.status),
      date: this.formatDate(payment.processedAt),
      refundable: payment.canBeRefunded(),
      refundButtonEnabled: payment.canBeRefunded() && payment.amount.isPositive()
    };
  }

  private getStatusBadgeClass(status: PaymentStatus): string {
    const classes: Record<PaymentStatus, string> = {
      [PaymentStatus.APPROVED]: 'badge-success',
      [PaymentStatus.DECLINED]: 'badge-danger',
      [PaymentStatus.PENDING]: 'badge-warning',
      [PaymentStatus.REFUNDED]: 'badge-info'
    };
    return classes[status];
  }
}
```

---

## 5. Checklist de "¿lo entendí?"

1. ¿Mis Lambda/Express handlers tienen **menos de 10 líneas** de código?
2. ¿Toda la **lógica de formateo** (fechas, moneda, traducciones) está en Presenters?
3. ¿Mis ViewModels contienen **solo primitivos** (string, boolean, number)?
4. ¿Puedo testear mis Presenters **sin HTTP ni DynamoDB**?
5. ¿Mis Repository implementations son "tontas" - **solo traducen datos**?

---

## 6. Conexión con otros conceptos

| Relación | Descripción |
|----------|-------------|
| **Clean Architecture (Cap 22)** | Humble Objects viven en Interface Adapters layer |
| **DIP (Cap 11)** | Los Presenters dependen de interfaces, no de frameworks |
| **Testability** | El patrón EXISTE para mejorar testability |
| **CQRS** | Los Presenters son parte del lado "Query" |
| **Payment Engine** | `PaymentPresenter` formatea para API; `LyraGateway` es humble para Lyra SDK |
