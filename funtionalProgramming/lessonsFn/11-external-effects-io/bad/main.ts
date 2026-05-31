// ============================================================================
// ❌ MAL EJEMPLO: Side effects mezclados con lógica pura
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 13):
//    Los efectos externos (I/O) mezclados con lógica pura hacen el
//    código imposible de testear y reusar.
// ============================================================================

// ❌ Función que MEZCLA lógica pura con efectos de I/O
function contest(p1: { name: string; score: number }, p2: { name: string; score: number }): void {
  // ❌ Lógica pura MEZCLADA con console.log
  if (p1.score > p2.score) {
    console.log(`  🏆 ${p1.name} gana!`); // ❌ I/O dentro de lógica
  } else if (p2.score > p1.score) {
    console.log(`  🏆 ${p2.name} gana!`); // ❌ I/O duplicado
  } else {
    console.log(`  🤝 Empate!`); // ❌ Más I/O
  }
  // ❌ No puedo testear "quién gana" sin que imprima
}

// ❌ Función que calcula Y imprime — todo junto
function processOrder(price: number): void {
  const tax = price * 0.19;                          // Lógica pura
  const total = price + tax;                         // Lógica pura
  const discount = total > 500 ? total * 0.05 : 0;  // Lógica pura
  const finalPrice = total - discount;               // Lógica pura

  // ❌ Efectos mezclados con el cálculo
  console.log(`  Precio: $${price.toFixed(2)}`);
  console.log(`  IVA: $${tax.toFixed(2)}`);
  console.log(`  Total: $${finalPrice.toFixed(2)}`);
  // ❌ ¿Cómo testeo la lógica de descuento sin ejecutar TODO?
}

// ❌ Reporte que acopla cálculo con formato
function generateReport(sales: number[]): void {
  let total = 0, max = -Infinity, min = Infinity;    // ❌ Mutables
  for (const sale of sales) {
    total += sale;                                    // ❌ Muta
    if (sale > max) max = sale;                       // ❌ Muta
    if (sale < min) min = sale;                       // ❌ Muta
    console.log(`  Venta: $${sale}`);                 // ❌ I/O en el loop
  }
  console.log(`  Total: $${total}, Promedio: $${(total / sales.length).toFixed(2)}`);
  // ❌ Si quiero HTML, PDF, email → reescribir TODO
}

// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO — Side Effects Mezclados con Lógica");
  console.log("=".repeat(55));

  console.log("\n📌 contest() mezcla lógica con I/O:");
  contest({ name: "Ana", score: 85 }, { name: "Bob", score: 72 });

  console.log("\n📌 processOrder() hace TODO:");
  processOrder(600);

  console.log("\n📌 generateReport() acopla cálculo con formato:");
  generateReport([100, 250, 75, 400]);

  console.log("\n⚠️  PROBLEMAS:");
  console.log("  ❌ Lógica mezclada con I/O — imposible testear");
  console.log("  ❌ Cambiar formato requiere reescribir lógica");
  console.log("  ❌ No reutilizable en otro contexto");
}

main();
