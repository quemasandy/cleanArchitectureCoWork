// ============================================================================
// ❌ MAL EJEMPLO: Business Rules mal ubicadas
// ============================================================================
// 📖 PRINCIPIO (Clean Architecture Cap. 20):
//    - ENTITIES: Reglas de negocio de la EMPRESA (existen sin software)
//    - USE CASES: Reglas de negocio de la APLICACIÓN (flujos específicos)
//
// 🚨 PROBLEMA: TODA la lógica de negocio está dentro del controller/handler.
//    No hay entidades ni use cases. Si cambias el endpoint de HTTP a CLI,
//    tienes que duplicar TODA la lógica.
//
//    Las reglas de negocio deberían ser independientes de HOW se ejecutan.
// ============================================================================

// ❌ Todo está en el handler - un "God Function" que hace todo
function handleCreateOrder(requestBody: any): {
  statusCode: number;
  body: string;
} {
  console.log("  🔄 Procesando orden...\n");

  // ❌ REGLA DE NEGOCIO DE EMPRESA dentro del handler
  // "Un cliente no puede tener más de 5 órdenes pendientes"
  // Esta regla existe con o sin software, pero está enterrada en un handler
  const pendingOrders = 3; // Simulamos consultar BD
  if (pendingOrders >= 5) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Máximo 5 órdenes pendientes" }),
    };
  }

  // ❌ REGLA DE NEGOCIO DE EMPRESA dentro del handler
  // "Los productos con precio mayor a $1000 requieren aprobación gerencial"
  const items = requestBody.items || [];
  let requiresApproval = false;
  let total = 0;

  for (const item of items) {
    // ❌ Cálculo de precio con descuento - regla de negocio enterrada
    let price = item.price * item.quantity;

    // ❌ Regla de descuento por volumen - debería estar en Entity
    if (item.quantity >= 10) {
      price = price * 0.9; // 10% descuento por volumen
      console.log(`  💰 Descuento volumen para ${item.name}: -10%`);
    }

    // ❌ Verificación de aprobación - regla de negocio de empresa
    if (item.price > 1000) {
      requiresApproval = true;
    }

    total += price;
  }

  // ❌ REGLA DE NEGOCIO DE APLICACIÓN dentro del handler
  // "Aplicar impuesto según el país" - es lógica de USE CASE
  const tax = total * 0.19; // 19% IVA Colombia
  total += tax;
  console.log(`  📊 Subtotal: $${(total - tax).toFixed(2)}`);
  console.log(`  📊 IVA (19%): $${tax.toFixed(2)}`);
  console.log(`  📊 Total: $${total.toFixed(2)}`);

  // ❌ REGLA DE NEGOCIO DE APLICACIÓN: verificar crédito disponible
  const creditLimit = 50000;
  if (total > creditLimit) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Excede límite de crédito" }),
    };
  }

  // ❌ Respuesta mezclada con lógica
  const orderId = `ORD-${Date.now()}`;
  const status = requiresApproval ? "PENDING_APPROVAL" : "CONFIRMED";

  console.log(`  📦 Orden ${orderId}: ${status}`);

  // ❌ Guardamos directamente en "BD" desde el handler
  console.log(`  💾 INSERT INTO orders (${orderId}, ${total}, ${status})`);

  return {
    statusCode: 201,
    body: JSON.stringify({
      orderId,
      total,
      status,
      requiresApproval,
    }),
  };
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO - Business Rules en el Controller");
  console.log("=".repeat(55));

  const response = handleCreateOrder({
    customerId: "CLI-001",
    items: [
      { name: "Laptop Pro", price: 1500, quantity: 1 },
      { name: "Cable USB", price: 15, quantity: 12 },
    ],
  });

  console.log(`\n  📤 Response: ${response.body}`);

  console.log("\n⚠️  PROBLEMAS:");
  console.log("  ❌ Reglas de empresa (descuento volumen) enterradas en un handler");
  console.log("  ❌ Reglas de aplicación (verificar crédito) mezcladas con HTTP");
  console.log("  ❌ Si creas un CLI, debes duplicar TODA la lógica");
  console.log("  ❌ No puedes testear reglas de negocio sin simular HTTP");
  console.log("  ❌ Imposible reusar la lógica de descuento en otro contexto");
  console.log('  ❌ No hay "Entity" ni "Use Case" - todo es un bloque monolítico');
}

main();
