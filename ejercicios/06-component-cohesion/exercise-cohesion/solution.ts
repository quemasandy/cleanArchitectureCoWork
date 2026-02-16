// ============================================================================
// ✅ SOLUCIÓN: Clases con ALTA COHESIÓN
// ============================================================================
//
// 📖 CONCEPTO: COHESIÓN
//
//    La cohesión mide qué tan RELACIONADAS están las responsabilidades
//    dentro de un módulo o clase.
//
//    🟢 Alta cohesión = cada clase tiene UNA sola razón para cambiar.
//    Cada clase agrupa métodos que trabajan hacia el MISMO propósito.
//
//    Robert C. Martin: "Agrupa las cosas que cambian por la misma razón.
//    Separa las que cambian por razones diferentes."
//
// ✅ SOLUCIÓN:
//    Separamos RestaurantManager en 5 clases COHESIVAS:
//    1. MenuService      → Solo gestiona el menú (actor: Chef)
//    2. OrderService      → Solo gestiona pedidos (actor: Operaciones)
//    3. InventoryService  → Solo gestiona inventario (actor: Compras)
//    4. NotificationService → Solo envía notificaciones (actor: Marketing)
//    5. ReportService     → Solo genera reportes (actor: Gerencia)
//
//    Cada clase tiene UNA razón para cambiar. ¡Eso es ALTA cohesión!
// ============================================================================

// --- Interfaces de datos (compartidas entre servicios) ---

// Interfaz que representa un plato del menú
interface MenuItem {
  // Nombre del plato (ej: "Bandeja Paisa")
  name: string;
  // Precio del plato en COP
  price: number;
  // Categoría del plato (ej: "entrada", "principal", "postre")
  category: string;
}

// Interfaz que representa un item dentro de un pedido
interface OrderItem {
  // Nombre del plato pedido
  menuItem: string;
  // Cantidad de unidades pedidas
  quantity: number;
}

// Interfaz que representa una orden completa
interface RestaurantOrder {
  // ID único de la orden (ej: "ORD-1234567890")
  id: string;
  // Nombre del cliente que hizo el pedido
  customerName: string;
  // Lista de items que pidió el cliente
  items: OrderItem[];
  // Total calculado de la orden en COP
  total: number;
  // Estado actual de la orden (PENDIENTE, LISTO, ENTREGADO)
  status: string;
}

// ============================================================================
// ✅ CLASE 1: MenuService — Gestiona SOLO el menú
// ============================================================================
// Razón para cambiar: Las reglas del menú cambian (nuevos platos, precios)
// Actor responsable: El chef o dueño del restaurante
// ✅ ALTA COHESIÓN: Todos los métodos trabajan con el menú
// ============================================================================
class MenuService {
  // Array interno que almacena los platos del menú
  private menu: MenuItem[] = [];

  // Agrega un nuevo plato al menú
  addItem(name: string, price: number, category: string): void {
    // Creamos el item con los datos recibidos
    const item: MenuItem = { name, price, category };
    // Lo agregamos al array de menú
    this.menu.push(item);
    // Confirmamos la operación
    console.log(`  🍽️  Plato agregado: ${name} - $${price.toLocaleString()}`);
  }

  // Remueve un plato del menú por su nombre
  removeItem(name: string): void {
    // Filtramos el array excluyendo el plato indicado
    this.menu = this.menu.filter((item) => item.name !== name);
    // Confirmamos la remoción
    console.log(`  🗑️  Plato removido: ${name}`);
  }

  // Busca un plato en el menú por su nombre
  findItem(name: string): MenuItem | undefined {
    // Retorna el plato encontrado o undefined si no existe
    return this.menu.find((item) => item.name === name);
  }

  // Retorna una copia de todos los platos del menú
  getAll(): MenuItem[] {
    // Usamos spread para evitar mutaciones externas del array
    return [...this.menu];
  }
}

// ============================================================================
// ✅ CLASE 2: OrderService — Gestiona SOLO los pedidos
// ============================================================================
// Razón para cambiar: Cambia el flujo de pedidos o cálculos de precios
// Actor responsable: Equipo de operaciones del restaurante
// ✅ ALTA COHESIÓN: Todos los métodos trabajan con pedidos
//
// Nota: Recibe el MenuService por INYECCIÓN, no lo crea internamente.
// Esto es desacoplamiento, pero no es el foco de este ejercicio.
// ============================================================================
class OrderService {
  // Array que almacena todas las órdenes del día
  private orders: RestaurantOrder[] = [];
  // Referencia al servicio de menú para consultar precios
  private menuService: MenuService;

  // Constructor que recibe el servicio de menú como dependencia
  constructor(menuService: MenuService) {
    // Guardamos la referencia al servicio de menú
    this.menuService = menuService;
  }

  // Toma un nuevo pedido de un cliente
  takeOrder(customerName: string, items: OrderItem[]): RestaurantOrder {
    // Calculamos el total del pedido
    const total = this.calculateTotal(items);
    // Creamos la orden con ID único
    const order: RestaurantOrder = {
      id: `ORD-${Date.now()}`,
      customerName,
      items,
      total,
      status: "PENDIENTE",
    };
    // Guardamos la orden en el historial
    this.orders.push(order);
    // Confirmamos la creación del pedido
    console.log(
      `  📝 Pedido ${order.id} para ${customerName} - Total: $${total.toLocaleString()}`
    );
    // Retornamos la orden creada
    return order;
  }

  // Calcula el total de una lista de items del pedido
  calculateTotal(items: OrderItem[]): number {
    // Variable acumuladora para el total
    let total = 0;
    // Iteramos cada item del pedido
    for (const item of items) {
      // Buscamos el plato en el menú para su precio
      const menuItem = this.menuService.findItem(item.menuItem);
      // Si existe, sumamos precio * cantidad al total
      if (menuItem) {
        total += menuItem.price * item.quantity;
      }
    }
    // Retornamos el total del pedido
    return total;
  }

  // Retorna todas las órdenes registradas
  getOrders(): RestaurantOrder[] {
    // Retornamos una copia del array de órdenes
    return [...this.orders];
  }
}

// ============================================================================
// ✅ CLASE 3: InventoryService — Gestiona SOLO el inventario
// ============================================================================
// Razón para cambiar: Cambia la forma de manejar stock o proveedores
// Actor responsable: Equipo de compras/almacén
// ✅ ALTA COHESIÓN: Todos los métodos trabajan con el inventario
// ============================================================================
class InventoryService {
  // Mapa que almacena ingrediente → cantidad disponible
  private inventory: Map<string, number> = new Map();

  // Agrega stock de un ingrediente
  addStock(ingredient: string, quantity: number): void {
    // Obtenemos la cantidad actual (0 si no existe)
    const current = this.inventory.get(ingredient) || 0;
    // Calculamos la nueva cantidad sumando lo agregado
    const newQuantity = current + quantity;
    // Actualizamos el inventario con la nueva cantidad
    this.inventory.set(ingredient, newQuantity);
    // Confirmamos la actualización
    console.log(
      `  📦 Stock actualizado: ${ingredient} = ${newQuantity} unidades`
    );
  }

  // Verifica si hay suficiente stock de un ingrediente
  checkStock(ingredient: string, needed: number): boolean {
    // Obtenemos la cantidad actual del ingrediente
    const current = this.inventory.get(ingredient) || 0;
    // Comparamos si tenemos suficiente
    const hasEnough = current >= needed;
    // Mostramos el resultado de la verificación
    console.log(
      `  📊 Stock de ${ingredient}: ${current} (necesitas ${needed}) → ${hasEnough ? "✅ OK" : "❌ Falta"}`
    );
    // Retornamos el resultado booleano
    return hasEnough;
  }

  // Retorna el inventario completo como un mapa
  getInventory(): Map<string, number> {
    // Retornamos una copia del mapa para evitar mutaciones externas
    return new Map(this.inventory);
  }
}

// ============================================================================
// ✅ CLASE 4: NotificationService — Gestiona SOLO notificaciones
// ============================================================================
// Razón para cambiar: Cambia el proveedor de email/SMS o el formato
// Actor responsable: Equipo de marketing/comunicaciones
// ✅ ALTA COHESIÓN: Todos los métodos trabajan con notificaciones
// ============================================================================
class NotificationService {
  // Historial de emails enviados
  private sentEmails: string[] = [];
  // Historial de SMS enviados
  private sentSMS: string[] = [];

  // Envía una notificación por email (simulación)
  sendEmail(to: string, subject: string, body: string): void {
    // Formateamos el mensaje de email
    const email = `Para: ${to} | Asunto: ${subject} | Mensaje: ${body}`;
    // Guardamos en el historial
    this.sentEmails.push(email);
    // Mostramos confirmación
    console.log(`  📧 Email enviado a ${to}: "${subject}"`);
  }

  // Envía una notificación por SMS (simulación)
  sendSMS(phone: string, message: string): void {
    // Formateamos el mensaje SMS
    const sms = `SMS a ${phone}: ${message}`;
    // Guardamos en el historial
    this.sentSMS.push(sms);
    // Mostramos confirmación
    console.log(`  📱 SMS enviado a ${phone}: "${message}"`);
  }
}

// ============================================================================
// ✅ CLASE 5: ReportService — Genera SOLO reportes
// ============================================================================
// Razón para cambiar: Cambia el formato de reportes o las métricas
// Actor responsable: Equipo de gerencia/finanzas
// ✅ ALTA COHESIÓN: Todos los métodos trabajan con reportería
//
// Recibe los datos que necesita de otros servicios por inyección.
// ============================================================================
class ReportService {
  // Genera un reporte de ventas a partir de las órdenes del día
  generateSalesReport(orders: RestaurantOrder[]): string {
    // Calculamos el total de ventas sumando todas las órdenes
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    // Contamos el número de órdenes
    const orderCount = orders.length;
    // Calculamos el promedio por orden (evitamos dividir por 0)
    const average = orderCount > 0 ? totalSales / orderCount : 0;
    // Construimos el reporte formateado
    const report = `
    ═══════════════════════════════════════
    📊 REPORTE DE VENTAS
    ═══════════════════════════════════════
    Órdenes del día: ${orderCount}
    Total vendido: $${totalSales.toLocaleString()}
    Promedio por orden: $${average.toLocaleString()}
    ═══════════════════════════════════════`;
    // Mostramos el reporte
    console.log(report);
    // Retornamos el reporte como string
    return report;
  }

  // Genera un reporte del inventario actual
  generateInventoryReport(inventory: Map<string, number>): string {
    // Construimos la cabecera del reporte
    let report = `
    ═══════════════════════════════════════
    📦 REPORTE DE INVENTARIO
    ═══════════════════════════════════════`;
    // Iteramos cada ingrediente del inventario
    inventory.forEach((quantity, ingredient) => {
      // Agregamos una línea por cada ingrediente
      report += `\n    ${ingredient}: ${quantity} unidades`;
    });
    // Cerramos el reporte con una línea decorativa
    report += `\n    ═══════════════════════════════════════`;
    // Mostramos el reporte
    console.log(report);
    // Retornamos el reporte como string
    return report;
  }
}

// ============================================================================
// 🏃 EJECUCIÓN - Demostración de la solución con alta cohesión
// ============================================================================
function main(): void {
  // Título del ejercicio
  console.log("✅ SOLUCIÓN: Clases con ALTA COHESIÓN");
  // Línea separadora
  console.log("═".repeat(55));

  // ✅ Cada servicio tiene UNA sola responsabilidad
  // Creamos cada servicio de forma independiente

  // Servicio que gestiona SOLO el menú
  const menuService = new MenuService();
  // Servicio que gestiona SOLO pedidos (depende del menú para precios)
  const orderService = new OrderService(menuService);
  // Servicio que gestiona SOLO inventario
  const inventoryService = new InventoryService();
  // Servicio que gestiona SOLO notificaciones
  const notificationService = new NotificationService();
  // Servicio que gestiona SOLO reportes
  const reportService = new ReportService();

  // --- Servicio 1: Menú (SOLO maneja platos) ---
  console.log("\n🍽️  MENÚ (MenuService):");
  // Agregamos platos — solo esta clase toca el menú
  menuService.addItem("Bandeja Paisa", 28000, "principal");
  menuService.addItem("Ajiaco", 22000, "principal");
  menuService.addItem("Empanadas", 5000, "entrada");
  menuService.addItem("Tres Leches", 12000, "postre");

  // --- Servicio 2: Pedidos (SOLO maneja órdenes) ---
  console.log("\n📝 PEDIDOS (OrderService):");
  // Tomamos pedidos — solo esta clase toca las órdenes
  orderService.takeOrder("Carlos", [
    { menuItem: "Bandeja Paisa", quantity: 2 },
    { menuItem: "Empanadas", quantity: 3 },
  ]);
  orderService.takeOrder("María", [
    { menuItem: "Ajiaco", quantity: 1 },
    { menuItem: "Tres Leches", quantity: 2 },
  ]);

  // --- Servicio 3: Inventario (SOLO maneja stock) ---
  console.log("\n📦 INVENTARIO (InventoryService):");
  // Gestionamos stock — solo esta clase toca el inventario
  inventoryService.addStock("Arroz", 50);
  inventoryService.addStock("Frijoles", 30);
  inventoryService.addStock("Aguacate", 10);
  inventoryService.checkStock("Arroz", 20);
  inventoryService.checkStock("Aguacate", 15);

  // --- Servicio 4: Notificaciones (SOLO envía mensajes) ---
  console.log("\n📧 NOTIFICACIONES (NotificationService):");
  // Enviamos notificaciones — solo esta clase toca emails/SMS
  notificationService.sendEmail(
    "carlos@email.com",
    "Tu pedido está listo",
    "¡Ven a recogerlo!"
  );
  notificationService.sendSMS("3001234567", "Tu pedido está listo 🍽️");

  // --- Servicio 5: Reportes (SOLO genera reportes) ---
  console.log("\n📊 REPORTES (ReportService):");
  // Generamos reportes — solo esta clase formatea datos
  reportService.generateSalesReport(orderService.getOrders());
  reportService.generateInventoryReport(inventoryService.getInventory());

  // --- Mostramos los beneficios de alta cohesión ---
  console.log("\n\n🎯 BENEFICIOS DE ALTA COHESIÓN:");
  console.log("═".repeat(55));
  // Beneficio 1: Cada clase tiene una sola razón para cambiar
  console.log("  ✅ Cada clase tiene UNA sola razón para cambiar");
  // Beneficio 2: Puedes cambiar emails sin tocar pedidos
  console.log("  ✅ Cambiar emails NO afecta pedidos ni inventario");
  // Beneficio 3: Las clases son fáciles de entender
  console.log("  ✅ Un programador nuevo entiende cada clase rápidamente");
  // Beneficio 4: Puedes reusar servicios individualmente
  console.log("  ✅ Otro proyecto puede usar SOLO NotificationService");
  // Beneficio 5: Testing es sencillo
  console.log("  ✅ Puedes testear ReportService sin crear menú ni pedidos");
  // Beneficio 6: Los equipos trabajan independientemente
  console.log("  ✅ El equipo de marketing edita SOLO NotificationService");
  console.log("");
  // La clave de la cohesión
  console.log("  📖 COHESIÓN = Qué tan BIEN encajan los métodos de una clase.");
  console.log("     Si todos apuntan al MISMO propósito → ALTA cohesión ✅");
  console.log("     Si cada uno hace algo diferente → BAJA cohesión ❌");
}

// Ejecutamos la función principal
main();
