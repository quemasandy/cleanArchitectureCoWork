// ============================================================================
// ✅ BUEN EJEMPLO: Programación Funcional con Funciones Puras
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 1):
//    Una función PURA es aquella que:
//    1. Solo depende de sus argumentos (no de estado externo)
//    2. Solo retorna un valor (no modifica nada externo)
//    3. Siempre retorna el MISMO resultado para los mismos argumentos
//
//    Esto se llama TRANSPARENCIA REFERENCIAL: puedes reemplazar
//    cualquier llamada a la función por su resultado sin cambiar
//    el comportamiento del programa.
//
//    "La programación funcional es una restricción de CÓMO escribimos
//     programas, no de QUÉ programas podemos expresar."
// ============================================================================

// ✅ Tipo inmutable para representar una venta
// Usamos `readonly` para garantizar inmutabilidad a nivel de tipo
interface Sale {
  readonly amount: number;   // Monto de la venta — no se puede modificar
  readonly discount: number; // Porcentaje de descuento — fijo al crearse
}

// ✅ Tipo inmutable para representar un resumen de ventas
interface SalesSummary {
  readonly sales: readonly Sale[]; // Lista inmutable de ventas
  readonly total: number;          // Total calculado — derivado de las ventas
}

// ✅ Función PURA: solo depende de sus argumentos, siempre retorna lo mismo
// agregarVenta(100, []) SIEMPRE retorna { sales: [{amount: 100, discount: 0}], total: 100 }
function addSale(
  amount: number,          // Monto de la nueva venta
  currentSales: readonly Sale[] // Lista actual de ventas (no se modifica)
): SalesSummary {
  // ✅ Creamos una NUEVA venta sin modificar nada existente
  const newSale: Sale = { amount, discount: 0 }; // Objeto nuevo, inmutable
  // ✅ Creamos un NUEVO array con la venta agregada (spread operator)
  const updatedSales = [...currentSales, newSale]; // No muta currentSales
  // ✅ Calculamos el total a partir de los datos — derivado, no almacenado
  const total = updatedSales.reduce((sum, sale) => sum + sale.amount, 0);
  // ✅ Retornamos un NUEVO objeto con todo el estado actualizado
  return { sales: updatedSales, total }; // Valor nuevo, no mutación
}

// ✅ Función PURA: el descuento es un ARGUMENTO, no una variable global
// calculateDiscountedPrice(1000, 0.1) SIEMPRE retorna 900
function calculateDiscountedPrice(
  price: number,    // Precio original del producto
  discount: number  // Porcentaje de descuento (ej: 0.1 = 10%)
): number {
  // ✅ Cálculo puro: solo usa los argumentos, nada externo
  return price - price * discount; // Siempre predecible
}

// ✅ Tipo inmutable para un item de orden
interface OrderItem {
  readonly price: number; // Precio del item — inmutable
}

// ✅ Tipo inmutable para una orden
interface Order {
  readonly items: readonly OrderItem[]; // Items inmutables
}

// ✅ Función PURA: retorna una NUEVA orden con impuestos aplicados
// NUNCA modifica la orden original — crea una nueva
function applyTax(
  order: Order,   // Orden original — no se toca
  taxRate: number // Tasa de impuesto (ej: 0.19 = 19%)
): Order {
  // ✅ Creamos NUEVOS items con los precios actualizados
  const taxedItems = order.items.map((item) => ({
    price: item.price * (1 + taxRate), // Nuevo precio, nuevo objeto
  }));
  // ✅ Retornamos una NUEVA orden — la original sigue intacta
  return { items: taxedItems }; // Objeto completamente nuevo
}

// ============================================================================
// 🔬 DEMOSTRACIÓN: La transparencia referencial funciona PERFECTAMENTE
// ============================================================================
// 📖 Como todas las funciones son PURAS, podemos:
//    1. Reemplazar cualquier f(x) por su resultado sin cambiar nada
//    2. Ejecutar en cualquier orden sin efectos inesperados
//    3. Testear cada función de forma completamente aislada
//    4. Razonar sobre cada parte del programa de forma LOCAL
// ============================================================================

function main(): void {
  console.log("✅ BUEN EJEMPLO — Programación con Funciones Puras");
  console.log("=".repeat(55));

  // --- Demostración 1: Funciones predecibles ---
  console.log("\n📌 Solución 1: Funciones puras = resultados predecibles");
  console.log("-".repeat(40));

  // ✅ addSale retorna SIEMPRE lo mismo con los mismos argumentos
  const empty: readonly Sale[] = []; // Estado inicial vacío
  const after1 = addSale(100, empty);    // Agrega venta a lista vacía
  const after2 = addSale(100, empty);    // ¡MISMO resultado! Porque empty no cambió
  const after3 = addSale(100, empty);    // ¡MISMO resultado otra vez!

  console.log(`  addSale(100, []) => total: $${after1.total}`); // 100
  console.log(`  addSale(100, []) => total: $${after2.total}`); // 100 — ¡IGUAL!
  console.log(`  addSale(100, []) => total: $${after3.total}`); // 100 — ¡SIEMPRE IGUAL!

  // ✅ Para acumular, pasamos el estado actualizado explícitamente
  const step1 = addSale(100, []);           // Primer venta
  const step2 = addSale(200, step1.sales);  // Segunda venta sobre el resultado anterior
  const step3 = addSale(300, step2.sales);  // Tercera venta sobre el resultado anterior
  console.log(`\n  Acumulado paso 1: $${step1.total}`); // 100
  console.log(`  Acumulado paso 2: $${step2.total}`); // 300
  console.log(`  Acumulado paso 3: $${step3.total}`); // 600

  // --- Demostración 2: Descuento como argumento ---
  console.log("\n📌 Solución 2: Descuento como argumento, no estado global");
  console.log("-".repeat(40));

  // ✅ calculateDiscountedPrice(1000, 0.1) SIEMPRE retorna 900
  const price1 = calculateDiscountedPrice(1000, 0.1); // 10% descuento
  const price2 = calculateDiscountedPrice(1000, 0.1); // MISMO descuento = MISMO resultado
  const price3 = calculateDiscountedPrice(1000, 0.1); // SIEMPRE $900

  console.log(`  Precio con 10% descuento: $${price1}`); // $900
  console.log(`  Precio con 10% descuento: $${price2}`); // $900 — ¡IGUAL!
  console.log(`  Precio con 10% descuento: $${price3}`); // $900 — ¡SIEMPRE IGUAL!

  // ✅ Si queremos diferente descuento, lo pasamos explícitamente
  const priceVIP = calculateDiscountedPrice(1000, 0.2); // 20% para VIP
  console.log(`  Precio VIP (20%): $${priceVIP}`); // $800 — explícito y claro

  // --- Demostración 3: Inmutabilidad de objetos ---
  console.log("\n📌 Solución 3: Objetos inmutables — nunca se destruyen");
  console.log("-".repeat(40));

  // ✅ La orden original NUNCA se modifica
  const myOrder: Order = {
    items: [
      { price: 100 }, // Item 1: $100
      { price: 200 }, // Item 2: $200
    ],
  };

  const orderWithTax = applyTax(myOrder, 0.19); // Crea NUEVA orden con impuestos

  // ✅ La orden original sigue intacta — no fue mutada
  console.log(`  Original: [${myOrder.items.map((i) => "$" + i.price).join(", ")}]`);
  console.log(`  Con IVA:  [${orderWithTax.items.map((i) => "$" + i.price.toFixed(2)).join(", ")}]`);
  console.log("  ✅ ¡La orden original sigue intacta!");

  // --- Demostración 4: Transparencia referencial en acción ---
  console.log("\n📌 Demostración: Transparencia Referencial");
  console.log("-".repeat(40));

  // ✅ Podemos reemplazar calculateDiscountedPrice(1000, 0.1) por 900
  // en cualquier lugar del programa sin cambiar su comportamiento
  const a = calculateDiscountedPrice(1000, 0.1) + calculateDiscountedPrice(500, 0.1);
  const b = 900 + 450; // ✅ Reemplazamos las llamadas por sus valores
  console.log(`  f(1000, 0.1) + f(500, 0.1) = $${a}`); // $1350
  console.log(`  900 + 450 = $${b}`);                   // $1350 — ¡EXACTAMENTE IGUAL!
  console.log(`  ¿Son iguales? ${a === b}`);             // true — transparencia referencial

  // --- Resumen de beneficios ---
  console.log("\n✅ BENEFICIOS:");
  console.log("  ✅ addSale(100, []) SIEMPRE retorna el mismo resultado");
  console.log("  ✅ calculateDiscountedPrice(1000, 0.1) SIEMPRE retorna 900");
  console.log("  ✅ applyTax() NUNCA destruye la orden original");
  console.log("  ✅ Puedes testear cada función de forma aislada");
  console.log("  ✅ Puedes razonar localmente sobre cada parte del programa");
  console.log("  ✅ El orden de ejecución no afecta los resultados");
}

// Ejecutamos el ejemplo
main();
