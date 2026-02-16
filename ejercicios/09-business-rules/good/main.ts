// ============================================================================
// ✅ BUEN EJEMPLO: Business Rules correctamente ubicadas
// ============================================================================
// 📖 PRINCIPIO (Clean Architecture Cap. 20):
//    - ENTITIES: Reglas de negocio de la EMPRESA
//      (Existen AÚN sin software. Son las reglas que un empleado
//       seguiría con papel y lápiz)
//    - USE CASES: Reglas de negocio de la APLICACIÓN
//      (Flujos automatizados específicos de ESTA aplicación)
//
// ✅ SOLUCIÓN: Las entidades contienen reglas de empresa.
//    Los use cases orquestan las entidades con reglas de aplicación.
//    El controller solo convierte formatos.
// ============================================================================

// ============================================================================
// 🟢 ENTITIES: Reglas de Negocio de la EMPRESA
// Estas reglas existirían incluso sin software.
// "Si un empleado lo haría con papel y lápiz, es una regla de empresa"
// ============================================================================

// ✅ Entity: OrderItem con reglas de negocio de EMPRESA
class OrderItem {
  constructor(
    public readonly name: string,
    public readonly unitPrice: number,
    public readonly quantity: number
  ) {
    // ✅ Regla de empresa: cantidad debe ser positiva
    if (quantity <= 0) {
      throw new Error(`La cantidad debe ser positiva para ${name}`);
    }
    // ✅ Regla de empresa: precio debe ser positivo
    if (unitPrice <= 0) {
      throw new Error(`El precio debe ser positivo para ${name}`);
    }
  }

  // ✅ Regla de empresa: descuento por volumen
  // "Cuando un cliente compra 10+ unidades, se le da 10% de descuento"
  // Un vendedor haría esto con papel y lápiz
  calculateSubtotal(): number {
    const subtotal = this.unitPrice * this.quantity;
    // Descuento por volumen: 10% si compra 10 o más unidades
    if (this.quantity >= 10) {
      return subtotal * 0.9;
    }
    return subtotal;
  }

  // ✅ Regla de empresa: ¿requiere aprobación gerencial?
  // "Items mayores a $1000 requieren que un gerente los apruebe"
  requiresManagerApproval(): boolean {
    return this.unitPrice > 1000;
  }

  // ✅ Regla de empresa: ¿tiene descuento por volumen?
  hasVolumeDiscount(): boolean {
    return this.quantity >= 10;
  }
}

// ✅ Entity: Order con reglas de negocio de EMPRESA
class Order {
  public readonly items: OrderItem[];
  public status: string;

  constructor(
    public readonly id: string,
    public readonly customerId: string,
    items: { name: string; price: number; quantity: number }[]
  ) {
    // Convertimos items crudos a entidades OrderItem
    this.items = items.map(
      (i) => new OrderItem(i.name, i.price, i.quantity)
    );
    this.status = "PENDING";
  }

  // ✅ Regla de empresa: cálculo del subtotal de la orden
  calculateSubtotal(): number {
    return this.items.reduce((sum, item) => sum + item.calculateSubtotal(), 0);
  }

  // ✅ Regla de empresa: ¿algún item requiere aprobación?
  requiresApproval(): boolean {
    return this.items.some((item) => item.requiresManagerApproval());
  }

  // ✅ Regla de empresa: confirmar o poner en espera
  confirm(): void {
    if (this.requiresApproval()) {
      this.status = "PENDING_APPROVAL";
    } else {
      this.status = "CONFIRMED";
    }
  }
}

// ============================================================================
// 🟡 USE CASES: Reglas de Negocio de la APLICACIÓN
// Orquestan las entidades. "Flujos automatizados" de esta app.
// No conocen HTTP, BD, ni frameworks.
// ============================================================================

// ✅ Interface del repositorio (definida por el USE CASE, no por la BD)
interface OrderRepository {
  save(order: Order): void;
  countPendingOrders(customerId: string): number;
}

// ✅ Resultado del Use Case - formato de DOMINIO, no de HTTP
interface CreateOrderResult {
  success: boolean;
  orderId: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  requiresApproval: boolean;
  discountsApplied: string[];
  error?: string;
}

// ✅ Use Case: CreateOrder - orquesta entidades con reglas de APLICACIÓN
class CreateOrderUseCase {
  // ✅ Reglas de aplicación como configuración
  private static readonly TAX_RATE = 0.19; // IVA Colombia
  private static readonly MAX_PENDING_ORDERS = 5;
  private static readonly CREDIT_LIMIT = 50000;

  constructor(private orderRepository: OrderRepository) { }

  execute(
    customerId: string,
    items: { name: string; price: number; quantity: number }[]
  ): CreateOrderResult {
    console.log("  🔄 [Use Case] Ejecutando CreateOrder...");

    // ✅ REGLA DE APLICACIÓN: verificar límite de órdenes pendientes
    // (esta regla es de la APP, un vendedor no la verificaría en papel)
    const pendingCount = this.orderRepository.countPendingOrders(customerId);
    if (pendingCount >= CreateOrderUseCase.MAX_PENDING_ORDERS) {
      return {
        success: false,
        orderId: "",
        subtotal: 0,
        tax: 0,
        total: 0,
        status: "REJECTED",
        requiresApproval: false,
        discountsApplied: [],
        error: `Cliente tiene ${pendingCount} órdenes pendientes (máximo: ${CreateOrderUseCase.MAX_PENDING_ORDERS})`,
      };
    }

    // Paso 1: Crear la entidad Order (las reglas de EMPRESA se aplican aquí automáticamente)
    const orderId = `ORD-${Date.now()}`;
    const order = new Order(orderId, customerId, items);

    // Paso 2: Calcular totales (Entity calcula el subtotal con descuentos)
    const subtotal = order.calculateSubtotal();
    const tax = subtotal * CreateOrderUseCase.TAX_RATE;
    const total = subtotal + tax;

    console.log(`  📊 [Use Case] Subtotal: $${subtotal.toFixed(2)}`);
    console.log(`  📊 [Use Case] IVA (19%): $${tax.toFixed(2)}`);
    console.log(`  📊 [Use Case] Total: $${total.toFixed(2)}`);

    // ✅ REGLA DE APLICACIÓN: verificar crédito
    if (total > CreateOrderUseCase.CREDIT_LIMIT) {
      return {
        success: false, orderId, subtotal, tax, total,
        status: "REJECTED", requiresApproval: false,
        discountsApplied: [], error: "Excede límite de crédito",
      };
    }

    // Paso 3: Confirmar la orden (Entity decide si necesita aprobación)
    order.confirm();
    console.log(`  📦 [Use Case] Orden ${orderId}: ${order.status}`);

    // Paso 4: Persistir
    this.orderRepository.save(order);

    // Recopilar descuentos aplicados
    const discounts = order.items
      .filter((item) => item.hasVolumeDiscount())
      .map((item) => `${item.name}: -10% por volumen (${item.quantity} uds)`);

    return {
      success: true,
      orderId,
      subtotal,
      tax,
      total,
      status: order.status,
      requiresApproval: order.requiresApproval(),
      discountsApplied: discounts,
    };
  }
}

// ============================================================================
// 🟠 ADAPTERS: Implementaciones y Controllers
// ============================================================================

// ✅ Repositorio en memoria (fácil de reemplazar con DynamoDB)
class InMemoryOrderRepository implements OrderRepository {
  private orders: Order[] = [];

  save(order: Order): void {
    this.orders.push(order);
    console.log(`  💾 [Repo] Orden ${order.id} guardada`);
  }

  countPendingOrders(customerId: string): number {
    return this.orders.filter(
      (o) => o.customerId === customerId && o.status === "PENDING"
    ).length;
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO - Business Rules Correctas");
  console.log("=".repeat(55));

  // Composición
  const repository = new InMemoryOrderRepository();
  const createOrder = new CreateOrderUseCase(repository);

  // ESCENARIO 1: Orden normal con descuento por volumen
  console.log("\n📦 ESCENARIO 1: Orden con descuento por volumen");
  console.log("-".repeat(40));
  const result1 = createOrder.execute("CLI-001", [
    { name: "Laptop Pro", price: 1500, quantity: 1 },
    { name: "Cable USB", price: 15, quantity: 12 }, // ← descuento volumen
  ]);
  console.log(`\n  📋 Resultado:`);
  console.log(`     Status: ${result1.status}`);
  console.log(`     Requiere aprobación: ${result1.requiresApproval} (Laptop > $1000)`);
  if (result1.discountsApplied.length > 0) {
    console.log(`     Descuentos: ${result1.discountsApplied.join(", ")}`);
  }

  // ESCENARIO 2: Orden simple sin aprobación
  console.log("\n\n📦 ESCENARIO 2: Orden simple (sin aprobación necesaria)");
  console.log("-".repeat(40));
  const result2 = createOrder.execute("CLI-002", [
    { name: "Teclado", price: 80, quantity: 2 },
    { name: "Mouse", price: 30, quantity: 1 },
  ]);
  console.log(`\n  📋 Resultado: ${result2.status} (todo < $1000, sin aprobación)`);

  console.log("\n\n🎯 SEPARACIÓN DE BUSINESS RULES:");
  console.log("  📗 ENTITY (reglas de EMPRESA):");
  console.log("     • OrderItem valida precio/cantidad positivos");
  console.log("     • OrderItem calcula descuento por volumen (>=10 uds)");
  console.log("     • OrderItem sabe si requiere aprobación gerencial (> $1000)");
  console.log("     • Order calcula subtotal delegando a sus items");
  console.log("  📘 USE CASE (reglas de APLICACIÓN):");
  console.log("     • Verificar máximo de órdenes pendientes");
  console.log("     • Calcular impuesto (IVA)");
  console.log("     • Verificar límite de crédito");
  console.log("     • Orquestar: crear → calcular → verificar → persistir");
}

main();
