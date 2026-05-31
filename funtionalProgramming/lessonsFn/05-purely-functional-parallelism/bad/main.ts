// ============================================================================
// ❌ MAL EJEMPLO: Paralelismo con estado mutable compartido
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 7):
//    Los computadores modernos tienen múltiples cores. Diseñar programas
//    que aprovechen el paralelismo es crítico. Pero la forma tradicional
//    de comunicación entre hilos — memoria mutable compartida — es
//    notoriamente difícil de razonar.
//
// 🚨 PROBLEMA: Estado mutable + paralelismo = bugs imposibles de encontrar
//    - Race conditions: dos funciones modifican el mismo dato simultáneamente
//    - Deadlocks: dos procesos esperan mutuamente → congelamiento
//    - No testeable: el bug aparece solo "a veces" (non-deterministic)
//    - Callbacks anidados: "callback hell" imposible de componer
// ============================================================================

// ❌ Contador global mutable compartido — PELIGRO en contexto paralelo
let sharedCounter = 0; // Estado mutable compartido entre funciones

// ❌ Función que modifica el contador global — no thread-safe
function incrementCounter(amount: number): void {
  // ❌ RACE CONDITION: si dos llamadas ejecutan esto "al mismo tiempo":
  //    1. Ambas leen sharedCounter = 0
  //    2. Ambas calculan 0 + amount
  //    3. Ambas escriben el mismo resultado → ¡se pierde un incremento!
  const current = sharedCounter; // Lee estado actual
  // ❌ Simulamos trabajo que toma tiempo (en paralelo real, aquí ocurre el bug)
  sharedCounter = current + amount; // Escribe resultado — puede sobreescribir otro
}

// ❌ Procesamiento secuencial con callbacks anidados — "callback hell"
function processOrdersWithCallbacks(
  orders: number[],
  callback: (result: number) => void
): void {
  // ❌ Acumulador mutable — modificado dentro de callbacks
  let total = 0; // Estado mutable compartido entre callbacks

  // ❌ Procesamos uno por uno — no hay paralelismo
  let index = 0; // Índice mutable
  function processNext(): void {
    if (index >= orders.length) {
      callback(total); // ❌ Callback final con el resultado
      return;
    }
    // ❌ Simulamos procesamiento asíncrono con setTimeout
    setTimeout(() => {
      const processed = orders[index] * 1.19; // Aplicar impuesto
      total += processed; // ❌ Muta estado compartido
      console.log(`  📦 Orden ${index + 1}: $${processed.toFixed(2)}`);
      index++; // ❌ Muta el índice
      processNext(); // ❌ Recursión en callbacks — difícil de seguir
    }, 10);
  }
  processNext(); // Inicia la cadena de callbacks
}

// ❌ Array mutable compartido para acumular resultados
const results: number[] = []; // Compartido entre múltiples funciones

// ❌ Función que modifica el array compartido
function addResult(value: number): void {
  // ❌ En contexto paralelo, push() no es atómico → resultados incorrectos
  results.push(value * 2); // Muta array compartido
}

// ============================================================================
// 🔬 DEMOSTRACIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO — Paralelismo con Estado Mutable");
  console.log("=".repeat(55));

  // --- Problema 1: Race condition simulada ---
  console.log("\n📌 Problema 1: Race condition con estado compartido");
  console.log("-".repeat(40));

  // ❌ Simulamos lo que pasaría si dos "threads" incrementan al mismo tiempo
  sharedCounter = 0;
  // ❌ Si estas dos ejecutaran en paralelo, ambas leerían 0
  incrementCounter(10); // Lee 0, escribe 10
  incrementCounter(20); // Lee 10, escribe 30 (AQUÍ funciona por ser secuencial)

  console.log(`  Contador esperado: 30`);
  console.log(`  Contador real: ${sharedCounter}`);
  console.log("  ⚠️  Funciona SOLO porque es secuencial");
  console.log("  ❌ En paralelo real: ambos leen 0 → resultado sería 20 (perdemos 10)");

  // --- Problema 2: Estado compartido entre funciones ---
  console.log("\n📌 Problema 2: Array compartido entre funciones");
  console.log("-".repeat(40));

  // ❌ Múltiples funciones modifican el mismo array
  results.length = 0; // Reset mutable
  addResult(5);   // results = [10]
  addResult(10);  // results = [10, 20]
  addResult(15);  // results = [10, 20, 30]

  console.log(`  Resultados: [${results.join(", ")}]`);
  console.log("  ❌ En paralelo: los elementos podrían interleave o perderse");
  console.log("  ❌ El orden depende de timing — no determinista");

  // --- Problema 3: Callback hell ---
  console.log("\n📌 Problema 3: Callback hell — imposible de componer");
  console.log("-".repeat(40));

  console.log("  Procesando órdenes secuencialmente con callbacks:");
  processOrdersWithCallbacks([100, 200, 300], (total) => {
    console.log(`  📊 Total: $${total.toFixed(2)}`);
    console.log("  ❌ Los callbacks no son componibles");
    console.log("  ❌ No hay forma de paralelizar sin reescribir todo");
    console.log("  ❌ Error handling en callbacks es un DESASTRE");

    console.log("\n⚠️  PROBLEMAS:");
    console.log("  ❌ Estado mutable compartido → race conditions");
    console.log("  ❌ Callbacks anidados → código imposible de seguir");
    console.log("  ❌ No componible: no puedes combinar dos operaciones paralelas");
    console.log("  ❌ El orden de ejecución afecta los resultados");
    console.log("  ❌ Tests no-deterministas: a veces pasan, a veces no");
  });
}

// Ejecutamos el ejemplo
main();
