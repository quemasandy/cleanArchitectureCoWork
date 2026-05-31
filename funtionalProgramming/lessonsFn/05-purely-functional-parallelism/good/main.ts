// ============================================================================
// ✅ BUEN EJEMPLO: Paralelismo Puramente Funcional
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 7):
//    Si tus funciones son PURAS, ejecutarlas en paralelo es TRIVIAL.
//    No hay estado compartido que proteger → no hay race conditions.
//
//    La clave es SEPARAR la DESCRIPCIÓN de la computación de su EJECUCIÓN:
//    1. DESCRIBIR: construimos un PLAN de lo que queremos computar
//    2. EJECUTAR: un intérprete ejecuta el plan (opcionalmente en paralelo)
//
//    Esto nos da combinadores de alto nivel como map2, fork, y parMap
//    que son seguros, componibles y fáciles de razonar.
// ============================================================================

// ============================================================================
// 📖 PAR<A> — Descripción de una computación paralela
// ============================================================================
// Par<A> es una DESCRIPCIÓN de una computación que produce A.
// NO ejecuta nada — solo representa la intención.
// Es como una receta: describes qué cocinar, no cocinas todavía.
// ============================================================================

// ✅ Tipo que DESCRIBE una computación que puede ser paralela
type Par<A> =
  | { readonly tag: "Unit"; readonly value: A }       // Valor inmediato — no necesita cómputo
  | {
    readonly tag: "Map2";                           // Combinar dos computaciones
    readonly left: Par<any>;                        // Primera computación
    readonly right: Par<any>;                       // Segunda computación
    readonly combine: (a: any, b: any) => A
  }       // Función para combinar resultados
  | {
    readonly tag: "Fork";                           // Marcar para ejecución en paralelo
    readonly computation: Par<A>
  };                  // La computación a ejecutar aparte

// ✅ unit: envuelve un valor en Par — la computación más simple
function unit<A>(value: A): Par<A> {
  return { tag: "Unit", value }; // Solo almacena el valor — sin cómputo
}

// ✅ map2: combina dos computaciones independientes — candidatas a paralelo
function map2<A, B, C>(
  pa: Par<A>,                   // Primera computación
  pb: Par<B>,                   // Segunda computación (independiente)
  f: (a: A, b: B) => C         // Función para combinar los resultados
): Par<C> {
  // ✅ No ejecuta nada — solo DESCRIBE que queremos combinar pa y pb
  return { tag: "Map2", left: pa, right: pb, combine: f };
}

// ✅ fork: marca una computación para ejecución paralela
function fork<A>(pa: Par<A>): Par<A> {
  // ✅ No ejecuta nada — solo MARCA que esta computación puede correr aparte
  return { tag: "Fork", computation: pa };
}

// ✅ map: transformar el resultado de una computación
function mapPar<A, B>(pa: Par<A>, f: (a: A) => B): Par<B> {
  // ✅ Reusamos map2: combinamos pa con unit(undefined) y aplicamos f
  return map2(pa, unit(undefined), (a, _) => f(a));
}

// ✅ parMap: aplicar una función a cada elemento en paralelo
function parMap<A, B>(list: readonly A[], f: (a: A) => B): Par<readonly B[]> {
  // ✅ Cada elemento se procesa como computación independiente (fork)
  const pars = list.map((a) => fork(unit(f(a)))); // Lista de Par<B>
  // ✅ Combinamos todos los resultados en una lista
  return pars.reduce<Par<readonly B[]>>(
    (acc, par) => map2(acc, par, (list, item) => [...list, item]),
    unit([] as readonly B[]) // Empezamos con lista vacía
  );
}

// ============================================================================
// 📖 INTÉRPRETE — Ejecuta la descripción
// ============================================================================
// Separamos DESCRIPCIÓN de EJECUCIÓN. El intérprete puede ser:
// - Secuencial (para tests deterministas)
// - Paralelo (para producción con múltiples cores)
// El programa NO cambia — solo cambia el intérprete.
// ============================================================================

// ✅ Intérprete que ejecuta el plan (aquí secuencial por simplicidad)
function run<A>(par: Par<A>): A {
  // ✅ Pattern matching sobre el tipo de computación
  switch (par.tag) {
    case "Unit":
      return par.value; // Valor inmediato — retornarlo
    case "Map2": {
      const left = run(par.left);     // Ejecutar primera computación
      const right = run(par.right);   // Ejecutar segunda computación
      return par.combine(left, right); // Combinar resultados
    }
    case "Fork":
      // ✅ En un intérprete real, esto ejecutaría en otro thread/worker
      // Aquí ejecutamos secuencialmente, pero el PROGRAMA no lo sabe
      return run(par.computation);
  }
}

// ============================================================================
// 📖 FUNCIONES PURAS — Trivialmente paralelizables
// ============================================================================

// ✅ Función PURA: calcular precio con impuesto — sin side effects
function calculatePrice(basePrice: number): number {
  // ✅ Función pura: mismos argumentos → mismo resultado → segura en paralelo
  return basePrice * 1.19; // 19% IVA
}

// ✅ Función PURA: calcular suma de una lista
function sum(numbers: readonly number[]): Par<number> {
  // ✅ Divide y vencerás — cada mitad puede computarse en paralelo
  if (numbers.length === 0) return unit(0);       // Caso base: lista vacía
  if (numbers.length === 1) return unit(numbers[0]); // Caso base: un elemento
  // ✅ Dividimos la lista por la mitad
  const mid = Math.floor(numbers.length / 2);      // Punto medio
  const left = numbers.slice(0, mid);               // Primera mitad
  const right = numbers.slice(mid);                  // Segunda mitad
  // ✅ Cada mitad se computa de forma independiente Y se marca para paralelo
  return map2(
    fork(sum(left)),   // Computar mitad izquierda (potencialmente en paralelo)
    fork(sum(right)),  // Computar mitad derecha (potencialmente en paralelo)
    (a, b) => a + b    // Combinar los resultados
  );
}

// ============================================================================
// 🔬 DEMOSTRACIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO — Paralelismo Puramente Funcional");
  console.log("=".repeat(55));

  // --- Beneficio 1: Funciones puras son seguras en paralelo ---
  console.log("\n📌 Beneficio 1: Funciones puras = paralelo seguro");
  console.log("-".repeat(40));

  // ✅ calculatePrice es pura — se puede llamar en paralelo sin riesgo
  const prices = [100, 200, 300, 400, 500]; // Precios base
  // ✅ parMap describe computación paralela — no la ejecuta aún
  const parallelPrices = parMap(prices, calculatePrice); // Par<number[]>
  // ✅ run() ejecuta la computación
  const result = run(parallelPrices); // Ejecuta (aquí secuencial, pero puede ser paralelo)

  console.log(`  Precios base:      [${prices.join(", ")}]`);
  console.log(`  Precios con IVA:   [${result.map((p) => p.toFixed(2)).join(", ")}]`);
  console.log("  ✅ Cada cálculo es independiente — se puede paralelizar sin riesgo");

  // --- Beneficio 2: Combinar computaciones independientes ---
  console.log("\n📌 Beneficio 2: map2 combina computaciones independientes");
  console.log("-".repeat(40));

  // ✅ Dos computaciones independientes combinadas con map2
  const sumOfPrices = unit(prices.reduce((a, b) => a + b, 0)); // Suma total
  const count = unit(prices.length);                             // Cantidad

  // ✅ map2 combina dos resultados — se podrían computar en paralelo
  const average = map2(sumOfPrices, count, (s, c) => s / c); // Promedio
  const avgResult = run(average); // Ejecuta

  console.log(`  Suma: $${run(sumOfPrices)}, Cantidad: ${run(count)}`);
  console.log(`  Promedio: $${avgResult}`);
  console.log("  ✅ map2 combina sin estado compartido — seguro y componible");

  // --- Beneficio 3: Divide y vencerás —  paralelismo natural ---
  console.log("\n📌 Beneficio 3: Divide y vencerás (sum paralela)");
  console.log("-".repeat(40));

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8]; // Números a sumar
  // ✅ sum() divide la lista por mitad recursivamente
  //    [1,2,3,4,5,6,7,8]
  //    [1,2,3,4] + [5,6,7,8]        ← dos ramas paralelas
  //    [1,2]+[3,4] + [5,6]+[7,8]    ← cuatro ramas paralelas
  const parallelSum = sum(numbers); // Descripción del plan
  const sumResult = run(parallelSum); // Ejecución

  console.log(`  Números: [${numbers.join(", ")}]`);
  console.log(`  Suma:    ${sumResult}`);
  console.log("  ✅ El algoritmo DESCRIBE paralelismo, el intérprete lo ejecuta");

  // --- Beneficio 4: Separación descripción vs ejecución ---
  console.log("\n📌 Beneficio 4: DESCRIBIR vs EJECUTAR");
  console.log("-".repeat(40));

  // ✅ El programa solo DESCRIBE qué computar — no cómo ejecutarlo
  const program = map2(
    fork(unit(calculatePrice(100))),   // Tarea 1: calcular precio A
    fork(unit(calculatePrice(200))),   // Tarea 2: calcular precio B
    (a, b) => ({ priceA: a, priceB: b, total: a + b }) // Combinar
  );

  // ✅ El intérprete decide cómo ejecutar (secuencial, paralelo, distribuido)
  const output = run(program);

  console.log(`  Precio A: $${output.priceA.toFixed(2)}`);
  console.log(`  Precio B: $${output.priceB.toFixed(2)}`);
  console.log(`  Total:    $${output.total.toFixed(2)}`);
  console.log("  ✅ Mismo programa, diferentes intérpretes (test vs producción)");

  // --- Resumen ---
  console.log("\n✅ BENEFICIOS:");
  console.log("  ✅ Funciones puras: sin estado compartido → sin race conditions");
  console.log("  ✅ Separación descripción/ejecución → testeable y flexible");
  console.log("  ✅ map2 y fork: combinadores de alto nivel para paralelismo");
  console.log("  ✅ parMap: aplicar función a lista en paralelo trivialmente");
  console.log("  ✅ Divide y vencerás: paralelismo natural con recursión");
  console.log("  ✅ Intérprete intercambiable: secuencial para tests, paralelo para producción");
}

// Ejecutamos el ejemplo
main();
