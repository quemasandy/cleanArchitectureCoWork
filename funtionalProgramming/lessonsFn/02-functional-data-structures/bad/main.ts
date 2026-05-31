// ============================================================================
// ❌ MAL EJEMPLO: Estructuras de datos MUTABLES
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 3):
//    Las estructuras de datos funcionales se operan usando SOLO
//    funciones puras. Por definición, son INMUTABLES.
//    Así como 3 + 4 produce un NUEVO número 7 sin modificar el 3 ni el 4,
//    concatenar dos listas produce una NUEVA lista sin modificar las originales.
//
// 🚨 PROBLEMA: Usar arrays mutables causa:
//    - Bugs por mutación compartida (dos funciones modifican el mismo array)
//    - Estado impredecible (¿quién modificó mi array?)
//    - Imposible razonar sobre el programa
//    - Condiciones de carrera en código paralelo
// ============================================================================

// ❌ Array mutable — cualquiera puede modificarlo
const shoppingCart: { name: string; price: number }[] = []; // Mutable por defecto

// ❌ Función que MUTA el array original con push
function addToCart(name: string, price: number): void {
  // ❌ Efecto secundario: modifica el array externo con push()
  shoppingCart.push({ name, price }); // Muta el array original
  // ❌ No retorna nada — opera por efectos secundarios
  console.log(`  🛒 Agregado: ${name} ($${price})`);
}

// ❌ Función que MUTA el array original con splice
function removeFromCart(index: number): void {
  // ❌ Efecto secundario: elimina un elemento del array original
  const removed = shoppingCart.splice(index, 1); // Muta el array, cambia los índices
  // ❌ splice() modifica el array Y retorna los eliminados — confuso
  console.log(`  🗑️  Eliminado: ${removed[0]?.name}`);
}

// ❌ Función que MUTA objetos dentro del array
function applyDiscountToAll(percentage: number): void {
  // ❌ Modifica cada objeto IN-PLACE — los datos originales se pierden
  for (const item of shoppingCart) {
    item.price = item.price * (1 - percentage); // Muta el objeto directamente
  }
  // ❌ Si llamas esto dos veces, aplica descuento DOBLE
  console.log(`  💸 Descuento ${percentage * 100}% aplicado a todos`);
}

// ❌ Función que depende del array mutable global
function getTotal(): number {
  // ❌ El resultado depende del estado mutable externo
  return shoppingCart.reduce((sum, item) => sum + item.price, 0);
}

// ============================================================================
// 🔬 DEMOSTRACIÓN: Los bugs por mutación
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO — Estructuras de Datos Mutables");
  console.log("=".repeat(55));

  // --- Problema 1: Mutación compartida ---
  console.log("\n📌 Problema 1: Mutación compartida del mismo array");
  console.log("-".repeat(40));

  // ❌ Dos partes del código modifican el mismo array
  addToCart("Laptop", 1000); // shoppingCart = [{Laptop, 1000}]
  addToCart("Mouse", 50);    // shoppingCart = [{Laptop, 1000}, {Mouse, 50}]
  addToCart("Teclado", 80);  // shoppingCart = [{Laptop, 1000}, {Mouse, 50}, {Teclado, 80}]

  console.log(`\n  Total antes: $${getTotal()}`); // $1130

  // ❌ Guardamos una "referencia" al carrito para usarla después
  const cartSnapshot = shoppingCart; // ¡NO es una copia! Es la misma referencia

  // ❌ Otra parte del código modifica el carrito
  removeFromCart(1); // Elimina Mouse — ¡también afecta cartSnapshot!

  // ❌ cartSnapshot fue modificado sin que lo supiéramos
  console.log(`  Total snapshot: $${cartSnapshot.reduce((s, i) => s + i.price, 0)}`);
  console.log("  ❌ ¡El 'snapshot' cambió porque es la MISMA referencia!");

  // --- Problema 2: Mutación acumulativa ---
  console.log("\n📌 Problema 2: Mutación acumulativa (descuento doble)");
  console.log("-".repeat(40));

  console.log(`  Precios antes: [${shoppingCart.map((i) => "$" + i.price).join(", ")}]`);

  // ❌ Aplicar descuento DOS veces aplica descuento DOBLE
  applyDiscountToAll(0.1); // 10% descuento — modifica los precios originales
  applyDiscountToAll(0.1); // 10% descuento OTRA VEZ — sobre los precios ya reducidos

  console.log(`  Precios después: [${shoppingCart.map((i) => "$" + i.price.toFixed(2)).join(", ")}]`);
  console.log("  ❌ ¡Se aplicó descuento DOBLE porque muta in-place!");

  // --- Problema 3: Índices inestables ---
  console.log("\n📌 Problema 3: Indices inestables con splice");
  console.log("-".repeat(40));

  // ❌ Reset para demostración
  shoppingCart.length = 0;
  addToCart("A", 10);
  addToCart("B", 20);
  addToCart("C", 30);

  // ❌ Queremos eliminar B (índice 1) y C (índice 2)
  console.log(`\n  Antes: [${shoppingCart.map((i) => i.name).join(", ")}]`);
  removeFromCart(1); // Elimina B — ahora C está en índice 1
  removeFromCart(2); // ❌ Índice 2 YA NO EXISTE — no elimina nada
  console.log(`  Después: [${shoppingCart.map((i) => i.name).join(", ")}]`);
  console.log("  ❌ ¡C no fue eliminada porque splice cambió los índices!");

  // --- Resumen ---
  console.log("\n⚠️  PROBLEMAS:");
  console.log("  ❌ push/splice/for mutan el array — datos originales se pierden");
  console.log("  ❌ Variables que apuntan al mismo array se afectan mutuamente");
  console.log("  ❌ Aplicar operaciones múltiples veces causa bugs acumulativos");
  console.log("  ❌ splice() cambia los índices — operaciones secuenciales fallan");
  console.log("  ❌ Imposible tener 'versiones' anteriores de los datos");
}

// Ejecutamos el ejemplo
main();
