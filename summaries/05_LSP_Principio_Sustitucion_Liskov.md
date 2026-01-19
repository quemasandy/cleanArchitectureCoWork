# Capítulo 9: LSP - Liskov Substitution Principle

## 1. TL;DR

LSP significa que si tu código espera un tipo `PaymentGateway`, cualquier implementación (`LyraGateway`, `MercadoPagoGateway`, `StripeGateway`) debe ser **intercambiable sin que el código cliente tenga que saber cuál está usando**. Si necesitas `if (gateway instanceof Lyra)` en tu código, has violado LSP y tu arquitectura pagará el precio con condicionales esparcidos por todo el sistema.

---

## 2. Conceptos que DEBO dominar

### Sustituibilidad (El test definitivo)
- **Definición**: Si S es subtipo de T, entonces objetos de tipo T pueden ser reemplazados por objetos de tipo S sin alterar las propiedades deseables del programa.
- **Ejemplo Payment Engine**:
```typescript
// ✅ LSP correcto: cualquier gateway funciona igual
async function processPayment(gateway: PaymentGateway, request: ChargeRequest) {
  // NO necesito saber qué gateway es
  const result = await gateway.charge(request);
  return result;
}

// Todos los gateways son intercambiables
processPayment(lyraGateway, request);     // ✓
processPayment(mercadoPagoGateway, request); // ✓
processPayment(stripeGateway, request);   // ✓
```
- **Cómo lo preguntarían**: "Tu sistema tiene 5 payment gateways. Muéstrame cómo garantizas que añadir el 6to no rompa nada."

### LSP a nivel de Arquitectura (REST APIs)
- **Definición**: LSP aplica más allá de clases - a cualquier interfaz incluyendo REST APIs, servicios, y contratos.
- **Ejemplo Payment Engine**:
```typescript
// TODOS los gateways deben responder con el mismo contrato
interface ChargeResult {
  transactionId: string;
  status: 'approved' | 'declined' | 'pending';
  gatewayReference: string;
  processedAt: Date;
}

// ❌ VIOLACIÓN: Lyra usa "approved", MercadoPago usa "APPROVED"
// El consumidor tendría que conocer el gateway específico
```
- **Cómo lo preguntarían**: "Acme Taxi cambió 'destination' por 'dest' en su API. ¿Qué patrón evita que esto contamine tu arquitectura?"

### El problema Square/Rectangle
- **Definición**: Un Square matemáticamente ES un Rectangle, pero en código un Square que hereda de Rectangle viola LSP porque `setWidth()` y `setHeight()` tienen semánticas diferentes.
- **Ejemplo Payment Engine (análogo)**:
```typescript
// ❌ VIOLACIÓN: CryptoPayment parece ser un Payment, pero tiene reglas diferentes
class CryptoPayment extends Payment {
  // En crypto, el amount puede cambiar por volatilidad
  // Los tests que asumen amount constante fallarán
  setAmount(amount: Money): void {
    this.amount = this.convertAtCurrentRate(amount);
  }
}

// ✅ SOLUCIÓN: No heredar, componer o usar interfaces separadas
interface Payment { readonly amount: Money; }
interface CryptoPayment { 
  readonly requestedAmount: Money;
  readonly settledAmount: Money; // Puede diferir
}
```
- **Cómo lo preguntarían**: "Tu clase `RecurringPayment` hereda de `Payment`. ¿Qué invariantes podrían romperse?"

---

## 3. Conceptos que puedo IGNORAR (por ahora)

| Concepto | Razón para ignorar |
|----------|-------------------|
| Definición formal de Barbara Liskov | La intuición práctica es suficiente |
| Covarianza/Contravarianza | Relevante para lenguajes con generics avanzados |
| Historial del principio (1988) | Contexto histórico |

---

## 4. Patrones/código para mi arsenal

### Adapter Pattern para normalizar contratos de Gateway
```typescript
// El problema: cada gateway tiene su propia respuesta
interface LyraRawResponse {
  answer: { orderStatus: 'PAID' | 'REFUSED' };
  // ... campos específicos de Lyra
}

interface MercadoPagoRawResponse {
  status: 'approved' | 'rejected';
  // ... campos específicos de MP
}

// La solución: Adapter que normaliza a contrato común
interface ChargeResult {
  transactionId: string;
  status: PaymentStatus;
  rawResponse: unknown; // Para debugging
}

class LyraAdapter implements PaymentGateway {
  async charge(request: ChargeRequest): Promise<Either<GatewayError, ChargeResult>> {
    const raw = await this.client.createPayment(request);
    
    // Normalización: Lyra -> Contrato común
    return right({
      transactionId: raw.answer.transactionUuid,
      status: this.mapStatus(raw.answer.orderStatus),
      rawResponse: raw
    });
  }

  private mapStatus(lyraStatus: string): PaymentStatus {
    const mapping: Record<string, PaymentStatus> = {
      'PAID': 'approved',
      'REFUSED': 'declined',
      'RUNNING': 'pending'
    };
    return mapping[lyraStatus] ?? 'unknown';
  }
}
```

### Configuration-based dispatch (evitar if/else por gateway)
```typescript
// ❌ VIOLACIÓN LSP: Código espagueti con instanceof
async function processPayment(gateway: PaymentGateway, request: ChargeRequest) {
  if (gateway instanceof AcmeGateway) {
    // Acme usa "dest" en vez de "destination"
    request.dest = request.destination;
  }
  return gateway.charge(request);
}

// ✅ LSP correcto: Cada adapter normaliza internamente
class AcmeAdapter implements PaymentGateway {
  async charge(request: ChargeRequest): Promise<ChargeResult> {
    // La normalización está ENCAPSULADA en el adapter
    const acmeRequest = {
      ...request,
      dest: request.destination // Mapeo interno
    };
    return this.client.charge(acmeRequest);
  }
}

// El consumidor NO sabe ni le importa qué gateway usa
async function processPayment(gateway: PaymentGateway, request: ChargeRequest) {
  return gateway.charge(request); // Mismo código para todos
}
```

---

## 5. Checklist de "¿lo entendí?"

1. ¿Puedo cambiar de `LyraGateway` a `StripeGateway` **sin modificar el código que lo usa**?
2. ¿Tengo `if (gateway instanceof X)` en alguna parte de mi código? (Si sí, hay violación)
3. ¿Todos mis adapters devuelven el **mismo tipo de respuesta** normalizada?
4. ¿Mis tests de integración corren igual **sin importar qué gateway** esté configurado?
5. ¿Puedo explicar por qué `CryptoPayment extends Payment` podría ser problemático?

---

## 6. Conexión con otros conceptos

| Relación | Descripción |
|----------|-------------|
| **OCP (Cap 8)** | OCP dice "extiende sin modificar"; LSP dice "las extensiones deben ser sustituibles" |
| **ISP (Cap 10)** | Si violas ISP (interfaces gordas), es más fácil violar LSP |
| **DIP (Cap 11)** | Las interfaces de DIP deben cumplir LSP para ser útiles |
| **Adapter Pattern** | La herramienta principal para cumplir LSP con APIs externas |
| **Payment Engine** | `PaymentGateway` es la interfaz; `LyraAdapter`, `MercadoPagoAdapter` son las implementaciones sustituibles |
