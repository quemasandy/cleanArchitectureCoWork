// ============================================================================
// ✅ BUEN EJEMPLO: Stream Processing — Procesamiento lazy y composable
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 15):
//    En vez de loops monolíticos, construimos PIPELINES de transformaciones
//    que procesan datos ELEMENTO POR ELEMENTO (lazy, incremental).
//
//    Ventajas:
//    - Solo un elemento en memoria a la vez → procesa datos infinitos
//    - Componible: cada paso es una función reutilizable
//    - Terminación temprana: se detiene tan pronto como tiene el resultado
//    - Resource safety: los recursos se cierran automáticamente
//
//    "Queremos escribir algo como streams pero leyendo de un archivo real."
//    El truco es usar generadores (generators) que son LAZY por naturaleza.
// ============================================================================

// ============================================================================
// 📖 STREAM LAZY — Procesa datos uno a uno, bajo demanda
// ============================================================================
// En TypeScript, los generators (function*) son la forma natural de
// crear streams lazy. Solo computan el siguiente valor cuando se pide.
// ============================================================================

// ✅ Tipo para un registro de usuario parseado
interface UserRecord {
  readonly name: string;   // Nombre del usuario
  readonly age: number;    // Edad del usuario
  readonly status: string; // Estado: "active" o "inactive"
}

// ✅ Generador LAZY de datos — produce un elemento a la vez
// En producción esto leería de un archivo o base de datos línea por línea
function* generateData(count: number): Generator<string> {
  // ✅ Genera UN elemento a la vez — nunca está todo en memoria
  for (let i = 1; i <= count; i++) {
    // ✅ yield retorna UN valor y PAUSA hasta que pidan el siguiente
    yield `user_${i},${Math.floor(Math.random() * 100)},${Math.random() > 0.3 ? "active" : "inactive"}`;
  }
  // ✅ Al terminar el generador, los recursos se limpian automáticamente
}

// ============================================================================
// 📖 OPERACIONES DE STREAM — Componibles y reusables
// ============================================================================
// Cada operación toma un generador y retorna un NUEVO generador.
// Son como "tubos" que conectamos en un pipeline.
// ============================================================================

// ✅ map: transformar cada elemento del stream — lazy
function* mapStream<A, B>(source: Iterable<A>, f: (a: A) => B): Generator<B> {
  // ✅ Procesa UN elemento a la vez — no carga todo en memoria
  for (const item of source) {
    yield f(item); // Transforma y produce — solo cuando se pide
  }
}

// ✅ filter: mantener solo elementos que cumplen condición — lazy
function* filterStream<A>(source: Iterable<A>, predicate: (a: A) => boolean): Generator<A> {
  // ✅ Solo produce elementos que pasan el filtro
  for (const item of source) {
    if (predicate(item)) yield item; // Solo produce si cumple condición
  }
}

// ✅ take: tomar solo los primeros N elementos — terminación temprana
function* takeStream<A>(source: Iterable<A>, n: number): Generator<A> {
  let count = 0; // Contador local
  for (const item of source) {
    if (count >= n) return; // ✅ PARA inmediatamente — no procesa más datos
    yield item;
    count++;
  }
}

// ✅ parseLine: convertir string CSV a registro tipado — función pura
function parseLine(line: string): UserRecord {
  const parts = line.split(","); // Separa por comas
  return {
    name: parts[0],              // Primer campo: nombre
    age: parseInt(parts[1], 10), // Segundo campo: edad
    status: parts[2],            // Tercer campo: estado
  };
}

// ✅ collect: materializar un stream lazy en un array (solo cuando es necesario)
function collect<A>(source: Iterable<A>): A[] {
  return [...source]; // Consume el generador y produce un array
}

// ✅ count: contar elementos sin materializar en array
function countStream<A>(source: Iterable<A>): number {
  let count = 0; // Contador local
  for (const _ of source) count++; // Consume uno a uno
  return count;
}

// ✅ fold: combinar todos los elementos con un acumulador
function foldStream<A, B>(source: Iterable<A>, initial: B, f: (acc: B, a: A) => B): B {
  let acc = initial; // Acumulador
  for (const item of source) {
    acc = f(acc, item); // Combina cada elemento
  }
  return acc;
}

// ============================================================================
// 🔬 DEMOSTRACIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO — Stream Processing Lazy y Composable");
  console.log("=".repeat(55));

  // --- Beneficio 1: Pipeline composable ---
  console.log("\n📌 Beneficio 1: Pipeline composable de transformaciones");
  console.log("-".repeat(40));

  // ✅ Construimos un PIPELINE: generar → parsear → filtrar → contar
  // Cada paso es una función independiente y reutilizable
  const rawData = generateData(10000);           // Paso 1: generar datos lazy
  const parsed = mapStream(rawData, parseLine);  // Paso 2: parsear cada línea
  const activeOver50 = filterStream(parsed,
    (u) => u.status === "active" && u.age > 50   // Paso 3: filtrar
  );
  const activeCount = countStream(activeOver50);  // Paso 4: contar

  console.log(`  Activos mayores de 50: ${activeCount}`);
  console.log("  ✅ Procesó 10,000 registros UNO A UNO — nunca todos en memoria");

  // --- Beneficio 2: Terminación temprana ---
  console.log("\n📌 Beneficio 2: Terminación temprana (take)");
  console.log("-".repeat(40));

  // ✅ Solo procesamos hasta encontrar 5 — el resto NUNCA se genera
  const rawData2 = generateData(10000);            // 10,000 registros posibles
  const parsed2 = mapStream(rawData2, parseLine);  // Parsear lazy
  const inactive = filterStream(parsed2,
    (u) => u.status === "inactive"                 // Filtrar inactivos
  );
  const first5 = takeStream(inactive, 5);          // ✅ PARA después de 5
  const first5List = collect(first5);              // Materializar solo 5

  console.log(`  Primeros 5 inactivos: [${first5List.map((u) => u.name).join(", ")}]`);
  console.log("  ✅ take(5) detuvo el pipeline — NO procesó los 10,000 registros");

  // --- Beneficio 3: Reutilización de componentes ---
  console.log("\n📌 Beneficio 3: Componentes reutilizables");
  console.log("-".repeat(40));

  // ✅ Reusamos las mismas funciones para una consulta diferente
  const rawData3 = generateData(10000);
  const parsed3 = mapStream(rawData3, parseLine);
  const actives = filterStream(parsed3, (u) => u.status === "active");

  // ✅ fold para calcular promedio — compone con el pipeline existente
  const ageStats = foldStream(actives, { sum: 0, count: 0 },
    (acc, u) => ({ sum: acc.sum + u.age, count: acc.count + 1 })
  );
  const avgAge = ageStats.count > 0 ? ageStats.sum / ageStats.count : 0;

  console.log(`  Edad promedio activos: ${avgAge.toFixed(1)}`);
  console.log("  ✅ Mismos componentes (filter, fold), pipeline diferente");

  // --- Beneficio 4: Procesamiento de datos "infinitos" ---
  console.log("\n📌 Beneficio 4: Puede procesar datos 'infinitos'");
  console.log("-".repeat(40));

  // ✅ Generador infinito de números Fibonacci
  function* fibonacci(): Generator<number> {
    let a = 0, b = 1; // Estado local del generador
    while (true) {     // ✅ Infinito! Pero solo genera cuando se pide
      yield a;
      [a, b] = [b, a + b]; // Siguiente par
    }
  }

  // ✅ Podemos operar sobre datos infinitos gracias a take()
  const first10Fib = collect(takeStream(fibonacci(), 10)); // Solo toma 10
  const evenFibs = collect(takeStream(
    filterStream(fibonacci(), (n) => n % 2 === 0), // Filtrar pares
    7                                               // Solo 7 pares
  ));

  console.log(`  10 primeros Fibonacci: [${first10Fib.join(", ")}]`);
  console.log(`  7 Fibonacci pares:     [${evenFibs.join(", ")}]`);
  console.log("  ✅ Datos infinitos + take() = programa que termina");

  // --- Resumen ---
  console.log("\n✅ BENEFICIOS:");
  console.log("  ✅ Lazy: solo UN elemento en memoria a la vez");
  console.log("  ✅ Composable: conectas filter, map, take como tubos");
  console.log("  ✅ Reutilizable: cada función sirve en cualquier pipeline");
  console.log("  ✅ Terminación temprana: take() detiene el procesamiento");
  console.log("  ✅ Datos infinitos: generators + take = seguro y eficiente");
  console.log("  ✅ Resource safe: los generators se limpian automáticamente");
}

// Ejecutamos el ejemplo
main();
