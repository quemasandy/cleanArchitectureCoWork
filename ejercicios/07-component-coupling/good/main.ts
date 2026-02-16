// ============================================================================
// ✅ BUEN EJEMPLO: Aplicación de Principios de Acoplamiento de Componentes
// ============================================================================
// 📖 PRINCIPIOS (Clean Architecture Cap. 14):
//
//    ADP (Acyclic Dependencies Principle): NO debe haber CICLOS en el
//    grafo de dependencias de componentes.
//
//    SDP (Stable Dependencies Principle): Depende en la dirección de
//    la ESTABILIDAD.
//
//    SAP (Stable Abstractions Principle): Un componente debe ser tan
//    abstracto como estable.
//
// ✅ SOLUCIÓN: Rompemos el ciclo con una INTERFACE (abstracción).
//    PaymentService no conoce OrderService directamente.
//    En su lugar, emite un EVENTO que OrderService escucha.
//
//    ┌──────────────┐      ┌──────────────────┐
//    │ OrderService │─────→│ PaymentProcessor │ (interface estable)
//    └──────────────┘      └──────────────────┘
//                                 ↑
//                          ┌──────────────────┐
//                          │ PaymentService   │ (implementación)
//                          └──────────────────┘
//    ✅ Sin ciclos. Dependencias apuntan hacia la abstracción ESTABLE.
// ============================================================================

// ============================================================================
// ✅ CAPA ESTABLE: Interfaces y tipos del dominio
// Estas son ABSTRACCIONES que rara vez cambian (SAP: estable = abstracto)
// ============================================================================

// Interfaz de la orden - definida en el dominio
interface Order {
  id: string;
  customerId: string;
  items: { name: string; price: number }[];
  status: string;
}

// Resultado del procesamiento de pago
interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
}

// ✅ Interface ESTABLE que rompe el ciclo
// Definida en la capa de Use Cases / Domain
// OrderService depende de esta ABSTRACCIÓN, no de PaymentService
interface PaymentProcessor {
  processPayment(orderId: string, amount: number): PaymentResult;
}

// ✅ Callback para notificar eventos de pago
// En vez de que PaymentService llame a OrderService directamente,
// usamos un callback/evento para desacoplar
type PaymentEventHandler = (orderId: string, result: PaymentResult) => void;

// ============================================================================
// ✅ PaymentService IMPLEMENTA la interface (depende de la abstracción)
// No conoce OrderService - solo implementa el contrato
// ============================================================================
class PaymentService implements PaymentProcessor {
  processPayment(orderId: string, amount: number): PaymentResult {
    console.log(`  💳 Procesando pago de $${amount.toFixed(2)} para orden ${orderId}`);

    // Simulamos el procesamiento de pago
    const success = amount > 0;
    const result: PaymentResult = {
      success,
      transactionId: `TX-${Date.now()}`,
      amount,
    };

    if (success) {
      console.log(`  ✅ Pago aprobado: ${result.transactionId}`);
    }

    // ✅ No llama a OrderService - solo retorna el resultado
    // El llamador decide qué hacer con el resultado
    return result;
  }
}

// ============================================================================
// ✅ OrderService depende de PaymentProcessor (interface), NO de PaymentService
// SDP: OrderService (menos estable) → PaymentProcessor (más estable/abstracto)
// ============================================================================
class OrderService {
  private orders: Map<string, Order> = new Map();

  // ✅ Dependencia hacia la ABSTRACCIÓN, no hacia la implementación
  constructor(private paymentProcessor: PaymentProcessor) { }

  createOrder(
    customerId: string,
    items: { name: string; price: number }[]
  ): Order {
    const order: Order = {
      id: `ORD-${Date.now()}`,
      customerId,
      items,
      status: "PENDING",
    };
    this.orders.set(order.id, order);
    console.log(`  📦 Orden ${order.id} creada para cliente ${customerId}`);

    // Calculamos el total
    const total = items.reduce((sum, item) => sum + item.price, 0);

    // ✅ Llamamos a la INTERFACE, no a PaymentService directamente
    const result = this.paymentProcessor.processPayment(order.id, total);

    // ✅ OrderService decide qué hacer con el resultado
    // No hay callback ni ciclo - flujo unidireccional
    if (result.success) {
      order.status = "PAID";
      console.log(`  📋 Orden ${order.id} actualizada a: PAID`);
    } else {
      order.status = "PAYMENT_FAILED";
      console.log(`  ❌ Orden ${order.id} falló el pago`);
    }

    return order;
  }

  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }
}

// ============================================================================
// ✅ BONUS: Mock para testing - fácil de crear gracias a la interface
// ============================================================================
class MockPaymentProcessor implements PaymentProcessor {
  public calls: { orderId: string; amount: number }[] = [];

  processPayment(orderId: string, amount: number): PaymentResult {
    // Registramos la llamada para verificar en tests
    this.calls.push({ orderId, amount });
    console.log(`  🧪 Mock: Simulando pago de $${amount.toFixed(2)}`);
    return {
      success: true,
      transactionId: `MOCK-TX-${Date.now()}`,
      amount,
    };
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO - Acoplamiento de Componentes");
  console.log("=".repeat(55));

  // ✅ ESCENARIO 1: Producción con PaymentService real
  console.log("\n🏭 ESCENARIO 1: Producción");
  console.log("-".repeat(40));
  const paymentService = new PaymentService();
  // ✅ No hay dependencia circular, solo inyección unidireccional
  const orderService = new OrderService(paymentService);

  orderService.createOrder("CLI-001", [
    { name: "Laptop", price: 999.99 },
    { name: "Mouse", price: 29.99 },
  ]);

  // ✅ ESCENARIO 2: Testing con Mock
  console.log("\n\n🧪 ESCENARIO 2: Testing con Mock");
  console.log("-".repeat(40));
  const mockProcessor = new MockPaymentProcessor();
  const testOrderService = new OrderService(mockProcessor);

  testOrderService.createOrder("CLI-TEST", [
    { name: "Test Item", price: 50.0 },
  ]);

  console.log(`\n  📊 Llamadas al mock: ${mockProcessor.calls.length}`);
  console.log(`  📊 Monto procesado: $${mockProcessor.calls[0].amount.toFixed(2)}`);

  console.log("\n\n🎯 BENEFICIOS:");
  console.log("  ✅ ADP: Sin ciclos - dependencias van en UNA dirección");
  console.log("  ✅ SDP: OrderService → PaymentProcessor (estable/abstracto)");
  console.log("  ✅ SAP: PaymentProcessor es abstracto Y estable");
  console.log("  ✅ Puedes testear OrderService con un mock sin PaymentService");
  console.log("  ✅ Puedes deployar módulos independientemente");
  console.log("  ✅ Puedes cambiar de pasarela de pago sin tocar OrderService");
}

main();
