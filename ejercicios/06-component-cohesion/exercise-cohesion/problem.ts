// ============================================================================
// ❌ PROBLEMA: Clase con BAJA COHESIÓN
// ============================================================================
//
// 📖 CONCEPTO: COHESIÓN
//
//    La cohesión mide qué tan RELACIONADAS están las responsabilidades
//    dentro de un módulo o clase.
//
//    🔴 Baja cohesión = una clase hace muchas cosas NO relacionadas
//    🟢 Alta cohesión = una clase hace cosas que SÍ están relacionadas
//
//    Robert C. Martin dice: "Una clase debe tener UNA sola razón para cambiar."
//    Si tiene muchas razones, tiene BAJA cohesión.
//
// 🚨 PROBLEMA EN ESTE CÓDIGO:
//    La clase RestaurantManager maneja TODO:
//    - Menú (agregar/quitar platos)
//    - Pedidos (tomar pedidos, calcular totales)
//    - Inventario (stock de ingredientes)
//    - Notificaciones (email y SMS)
//    - Reportes (ventas e inventario)
//
//    SON 5 RESPONSABILIDADES DIFERENTES EN UNA SOLA CLASE.
//    Si cambia la forma de enviar emails, tocas la misma clase que
//    maneja el menú. ¡Eso es baja cohesión!
//
// 🎯 TU MISIÓN: Identificar los 5 grupos y separarlos en clases cohesivas.
// ============================================================================

// --- Interfaces de datos que usa el sistema ---

// Interfaz que representa un plato del menú
interface MenuItem {
  // Nombre del plato (ej: "Bandeja Paisa")
  name: string;
  // Precio del plato en COP
  price: number;
  // Categoría del plato (ej: "entrada", "principal", "postre")
  category: string;
}

// Interfaz que representa un pedido de un cliente
interface OrderItem {
  // Nombre del plato pedido
  menuItem: string;
  // Cantidad de unidades
  quantity: number;
}

// Interfaz que representa una orden completa
interface RestaurantOrder {
  // ID único de la orden
  id: string;
  // Nombre del cliente
  customerName: string;
  // Lista de items pedidos
  items: OrderItem[];
  // Total calculado de la orden en COP
  total: number;
  // Estado actual de la orden
  status: string;
}

// ============================================================================
// ❌ LA CLASE MONSTRUO: RestaurantManager
// ============================================================================
// 🔴 Esta clase tiene BAJA COHESIÓN porque mezcla 5 responsabilidades
// que NO tienen nada que ver entre sí.
//
// Pregúntate: ¿Qué pasa si necesito cambiar cómo se envían notificaciones?
// Respuesta: Tengo que abrir la misma clase que maneja el menú y pedidos.
// ¡Eso no tiene sentido!
// ============================================================================
class RestaurantManager {
  // Almacena todos los platos del menú
  private menu: MenuItem[] = [];
  // Almacena todas las órdenes del día
  private orders: RestaurantOrder[] = [];
  // Almacena el inventario de ingredientes con sus cantidades
  private inventory: Map<string, number> = new Map();
  // Almacena los emails enviados (simulación)
  private sentEmails: string[] = [];
  // Almacena los SMS enviados (simulación)
  private sentSMS: string[] = [];

  // ===================== RESPONSABILIDAD 1: MENÚ =====================
  // ❌ Estos métodos pertenecen a la gestión del menú.
  // Cambian cuando: El chef decide cambiar platos o precios.
  // Actor responsable: El chef o dueño del restaurante.

  // Agrega un nuevo plato al menú del restaurante
  addMenuItem(name: string, price: number, category: string): void {
    // Creamos el nuevo item del menú
    const item: MenuItem = { name, price, category };
    // Lo agregamos al array de menú
    this.menu.push(item);
    // Mostramos confirmación en consola
    console.log(`  🍽️  Plato agregado al menú: ${name} - $${price.toLocaleString()}`);
  }

  // Remueve un plato del menú por su nombre
  removeMenuItem(name: string): void {
    // Filtramos el array para quitar el plato indicado
    this.menu = this.menu.filter((item) => item.name !== name);
    // Mostramos confirmación en consola
    console.log(`  🗑️  Plato removido del menú: ${name}`);
  }

  // Retorna todos los platos del menú
  getMenu(): MenuItem[] {
    // Retornamos una copia del array para evitar mutaciones externas
    return [...this.menu];
  }

  // ===================== RESPONSABILIDAD 2: PEDIDOS =====================
  // ❌ Estos métodos pertenecen a la gestión de pedidos.
  // Cambian cuando: Cambia el flujo de pedidos o las reglas de cálculo.
  // Actor responsable: El equipo de operaciones del restaurante.

  // Toma un nuevo pedido de un cliente
  takeOrder(customerName: string, items: OrderItem[]): RestaurantOrder {
    // Calculamos el total del pedido usando los precios del menú
    const total = this.calculateTotal(items);
    // Creamos la orden con un ID único basado en timestamp
    const order: RestaurantOrder = {
      id: `ORD-${Date.now()}`,
      customerName,
      items,
      total,
      status: "PENDIENTE",
    };
    // Guardamos la orden en el array de órdenes
    this.orders.push(order);
    // Mostramos confirmación en consola
    console.log(
      `  📝 Pedido ${order.id} tomado para ${customerName} - Total: $${total.toLocaleString()}`
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
      // Buscamos el plato en el menú para obtener su precio
      const menuItem = this.menu.find((m) => m.name === item.menuItem);
      // Si existe en el menú, sumamos precio * cantidad
      if (menuItem) {
        total += menuItem.price * item.quantity;
      }
    }
    // Retornamos el total calculado
    return total;
  }

  // ===================== RESPONSABILIDAD 3: INVENTARIO =====================
  // ❌ Estos métodos pertenecen a la gestión de inventario.
  // Cambian cuando: Cambia la forma de manejar el stock o los proveedores.
  // Actor responsable: El equipo de compras/almacén.

  // Agrega stock de un ingrediente al inventario
  addStock(ingredient: string, quantity: number): void {
    // Obtenemos la cantidad actual (o 0 si no existe)
    const current = this.inventory.get(ingredient) || 0;
    // Actualizamos con la nueva cantidad sumada
    this.inventory.set(ingredient, current + quantity);
    // Mostramos confirmación en consola
    console.log(
      `  📦 Stock actualizado: ${ingredient} = ${current + quantity} unidades`
    );
  }

  // Verifica si hay suficiente stock de un ingrediente
  checkStock(ingredient: string, needed: number): boolean {
    // Obtenemos la cantidad actual del ingrediente
    const current = this.inventory.get(ingredient) || 0;
    // Verificamos si tenemos suficiente
    const hasEnough = current >= needed;
    // Mostramos el resultado de la verificación
    console.log(
      `  📊 Stock de ${ingredient}: ${current} unidades (necesitas ${needed}) → ${hasEnough ? "✅ Suficiente" : "❌ Insuficiente"}`
    );
    // Retornamos true si hay suficiente, false si no
    return hasEnough;
  }

  // ===================== RESPONSABILIDAD 4: NOTIFICACIONES =====================
  // ❌ Estos métodos pertenecen al sistema de notificaciones.
  // Cambian cuando: Cambia el proveedor de email/SMS o el formato de mensajes.
  // Actor responsable: El equipo de marketing/comunicaciones.

  // Envía una notificación por email (simulación)
  sendEmailNotification(to: string, subject: string, body: string): void {
    // Creamos el mensaje formateado
    const email = `Para: ${to} | Asunto: ${subject} | Mensaje: ${body}`;
    // Guardamos el email en el historial
    this.sentEmails.push(email);
    // Mostramos el email enviado
    console.log(`  📧 Email enviado a ${to}: "${subject}"`);
  }

  // Envía una notificación por SMS (simulación)
  sendSMSNotification(phone: string, message: string): void {
    // Creamos el SMS formateado
    const sms = `SMS a ${phone}: ${message}`;
    // Guardamos el SMS en el historial
    this.sentSMS.push(sms);
    // Mostramos el SMS enviado
    console.log(`  📱 SMS enviado a ${phone}: "${message}"`);
  }

  // ===================== RESPONSABILIDAD 5: REPORTES =====================
  // ❌ Estos métodos pertenecen al sistema de reportería.
  // Cambian cuando: Cambia el formato de reportes o las métricas que se piden.
  // Actor responsable: El equipo de gerencia/finanzas.

  // Genera un reporte de ventas del día
  generateSalesReport(): string {
    // Calculamos el total de ventas sumando todas las órdenes
    const totalSales = this.orders.reduce(
      (sum, order) => sum + order.total,
      0
    );
    // Contamos el número total de órdenes
    const orderCount = this.orders.length;
    // Construimos el reporte como string formateado
    const report = `
    ═══════════════════════════════════════
    📊 REPORTE DE VENTAS
    ═══════════════════════════════════════
    Órdenes del día: ${orderCount}
    Total vendido: $${totalSales.toLocaleString()}
    Promedio por orden: $${orderCount > 0 ? (totalSales / orderCount).toLocaleString() : 0}
    ═══════════════════════════════════════`;
    // Mostramos el reporte en consola
    console.log(report);
    // Retornamos el reporte
    return report;
  }

  // Genera un reporte del estado del inventario
  generateInventoryReport(): string {
    // Construimos la cabecera del reporte
    let report = `
    ═══════════════════════════════════════
    📦 REPORTE DE INVENTARIO
    ═══════════════════════════════════════`;
    // Iteramos cada ingrediente del inventario
    this.inventory.forEach((quantity, ingredient) => {
      // Agregamos cada línea con el ingrediente y su cantidad
      report += `\n    ${ingredient}: ${quantity} unidades`;
    });
    // Cerramos el reporte con una línea
    report += `\n    ═══════════════════════════════════════`;
    // Mostramos el reporte en consola
    console.log(report);
    // Retornamos el reporte
    return report;
  }
}

// ============================================================================
// 🏃 EJECUCIÓN - Demostración del problema
// ============================================================================
function main(): void {
  // Título del ejercicio
  console.log("❌ PROBLEMA: Clase con BAJA COHESIÓN");
  // Línea separadora
  console.log("═".repeat(55));

  // ❌ Una sola clase hace ABSOLUTAMENTE TODO
  // Creamos la instancia del "monstruo" que lo maneja todo
  const restaurant = new RestaurantManager();

  // --- Usando la RESPONSABILIDAD 1: Menú ---
  console.log("\n🍽️  GESTIÓN DE MENÚ:");
  // Agregamos platos al menú
  restaurant.addMenuItem("Bandeja Paisa", 28000, "principal");
  restaurant.addMenuItem("Ajiaco", 22000, "principal");
  restaurant.addMenuItem("Empanadas", 5000, "entrada");
  restaurant.addMenuItem("Tres Leches", 12000, "postre");

  // --- Usando la RESPONSABILIDAD 2: Pedidos ---
  console.log("\n📝 GESTIÓN DE PEDIDOS:");
  // Tomamos un pedido con items del menú
  restaurant.takeOrder("Carlos", [
    { menuItem: "Bandeja Paisa", quantity: 2 },
    { menuItem: "Empanadas", quantity: 3 },
  ]);
  // Tomamos otro pedido
  restaurant.takeOrder("María", [
    { menuItem: "Ajiaco", quantity: 1 },
    { menuItem: "Tres Leches", quantity: 2 },
  ]);

  // --- Usando la RESPONSABILIDAD 3: Inventario ---
  console.log("\n📦 GESTIÓN DE INVENTARIO:");
  // Agregamos stock de ingredientes
  restaurant.addStock("Arroz", 50);
  restaurant.addStock("Frijoles", 30);
  restaurant.addStock("Aguacate", 10);
  // Verificamos si tenemos suficiente stock
  restaurant.checkStock("Arroz", 20);
  restaurant.checkStock("Aguacate", 15);

  // --- Usando la RESPONSABILIDAD 4: Notificaciones ---
  console.log("\n📧 NOTIFICACIONES:");
  // Enviamos un email al cliente
  restaurant.sendEmailNotification(
    "carlos@email.com",
    "Tu pedido está listo",
    "¡Ven a recogerlo!"
  );
  // Enviamos un SMS al cliente
  restaurant.sendSMSNotification("3001234567", "Tu pedido está listo 🍽️");

  // --- Usando la RESPONSABILIDAD 5: Reportes ---
  console.log("\n📊 REPORTES:");
  // Generamos el reporte de ventas
  restaurant.generateSalesReport();
  // Generamos el reporte de inventario
  restaurant.generateInventoryReport();

  // --- Mostramos los problemas de esta arquitectura ---
  console.log("\n\n⚠️  PROBLEMAS DE BAJA COHESIÓN:");
  console.log("═".repeat(55));
  // Problema 1: La clase tiene 5 razones para cambiar
  console.log("  ❌ RestaurantManager tiene 5 RAZONES para cambiar");
  // Problema 2: Si cambias emails, tocas la clase de pedidos
  console.log("  ❌ Cambiar emails obliga a re-testear pedidos e inventario");
  // Problema 3: La clase es difícil de entender
  console.log("  ❌ Un programador nuevo tarda mucho en entender esta clase");
  // Problema 4: No puedes reusar partes individuales
  console.log("  ❌ Si otro proyecto necesita solo reportes, carga TODO");
  // Problema 5: El testing es una pesadilla
  console.log("  ❌ Para testear notificaciones necesitas crear menú y pedidos");
  // Dato de Clean Architecture
  console.log("");
  console.log('  📖 Robert C. Martin: "Agrupa las cosas que cambian por la');
  console.log('     misma razón. Separa las que cambian por razones diferentes."');
}

// Ejecutamos la función principal
main();
