// ============================================================================
// ❌ MAL EJEMPLO: Violación de Principios de Acoplamiento de Componentes
// ============================================================================
// 📖 PRINCIPIOS (Clean Architecture Cap. 14):
//
//    ADP (Acyclic Dependencies Principle): NO debe haber CICLOS en el
//    grafo de dependencias de componentes.
//
//    SDP (Stable Dependencies Principle): Depende en la dirección de
//    la ESTABILIDAD. Los módulos volátiles dependen de módulos estables.
//
//    SAP (Stable Abstractions Principle): Un componente debe ser tan
//    abstracto como estable.
//
// 🚨 PROBLEMA: OrderService y PaymentService se importan MUTUAMENTE
//    (dependencia circular). Esto crea un ciclo que hace imposible
//    deployar, testear o entender uno sin el otro.
// ============================================================================

// ❌ DEPENDENCIA CIRCULAR: OrderService → PaymentService → OrderService
//
//    ┌──────────────┐      ┌──────────────────┐
//    │ OrderService │─────→│ PaymentService   │
//    │              │←─────│                  │
//    └──────────────┘      └──────────────────┘
//         🔄 ¡CICLO! No puedes compilar uno sin el otro

// Simulamos una orden
interface Order {
  id: string;
  customerId: string;
  items: { name: string; price: number }[];
  status: string;
}

// ❌ PaymentService necesita conocer OrderService para actualizar la orden
class PaymentService {
  // ❌ Referencia DIRECTA a OrderService (crea el ciclo)
  private orderService: OrderService | null = null;

  // Método para establecer la referencia circular
  setOrderService(orderService: OrderService): void {
    this.orderService = orderService;
  }

  // Procesa un pago y luego LLAMA DE VUELTA a OrderService
  processPayment(order: Order): boolean {
    const total = order.items.reduce((sum, item) => sum + item.price, 0);
    console.log(`  💳 Procesando pago de $${total.toFixed(2)} para orden ${order.id}`);

    // Simulamos que el pago es exitoso
    const paymentSuccess = total > 0;

    if (paymentSuccess) {
      console.log(`  ✅ Pago aprobado para orden ${order.id}`);
      // ❌ CICLO: PaymentService llama de vuelta a OrderService
      // Esto crea una dependencia bidireccional
      this.orderService?.updateOrderStatus(order.id, "PAID");
    }

    return paymentSuccess;
  }
}

// ❌ OrderService necesita PaymentService para procesar pagos
class OrderService {
  private orders: Map<string, Order> = new Map();
  // ❌ Referencia DIRECTA a PaymentService
  private paymentService: PaymentService;

  constructor(paymentService: PaymentService) {
    this.paymentService = paymentService;
    // ❌ Establecemos la referencia circular manualmente
    // Esto es un "code smell" gigante
    paymentService.setOrderService(this);
  }

  // Crea una orden y procesa el pago
  createOrder(customerId: string, items: { name: string; price: number }[]): Order {
    const order: Order = {
      id: `ORD-${Date.now()}`,
      customerId,
      items,
      status: "PENDING",
    };
    this.orders.set(order.id, order);
    console.log(`  📦 Orden ${order.id} creada para cliente ${customerId}`);

    // ❌ OrderService → PaymentService (ida)
    this.paymentService.processPayment(order);
    // ❌ PaymentService → OrderService (vuelta) via updateOrderStatus

    return order;
  }

  // ❌ Este método es llamado por PaymentService (crea el ciclo)
  updateOrderStatus(orderId: string, status: string): void {
    const order = this.orders.get(orderId);
    if (order) {
      order.status = status;
      console.log(`  📋 Orden ${orderId} actualizada a: ${status}`);
    }
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO - Violación de Acoplamiento de Componentes");
  console.log("=".repeat(55));

  // ❌ Setup con dependencia circular
  const paymentService = new PaymentService();
  const orderService = new OrderService(paymentService);

  console.log("\n🛒 Creando orden:");
  const order = orderService.createOrder("CLI-001", [
    { name: "Laptop", price: 999.99 },
    { name: "Mouse", price: 29.99 },
  ]);

  console.log("\n⚠️  PROBLEMAS:");
  console.log("  ❌ ADP: Ciclo OrderService ↔ PaymentService");
  console.log("  ❌ No puedes testear PaymentService sin OrderService");
  console.log("  ❌ No puedes deployar uno sin el otro");
  console.log("  ❌ setOrderService() es un hack para resolver el ciclo");
  console.log("  ❌ Si OrderService cambia, PaymentService puede romperse y viceversa");
  console.log("  ❌ SDP: Ambos componentes son inestables (cambian por todo)");
}

main();
