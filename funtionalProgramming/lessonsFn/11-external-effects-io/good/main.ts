// ============================================================================
// ✅ BUEN EJEMPLO: IO Monad — Separar descripción de ejecución
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 13):
//    Separamos DESCRIBIR un efecto de EJECUTARLO.
//    IO<A> es un VALOR que DESCRIBE una acción, no la ejecuta.
//    La ejecución ocurre solo cuando llamamos run().
//
//    Beneficios:
//    - Lógica pura testeable sin efectos
//    - Efectos componibles como valores
//    - Intérprete intercambiable (consola, archivo, test)
// ============================================================================

// ✅ IO<A> — Descripción de un efecto que produce A
type IO<A> = { readonly run: () => A }; // Thunk: función sin argumentos

// ✅ Constructores de IO
function ioOf<A>(value: A): IO<A> {
  return { run: () => value }; // Valor puro envuelto en IO
}

function ioEffect<A>(effect: () => A): IO<A> {
  return { run: effect }; // Efecto diferido — no se ejecuta aún
}

// ✅ map: transformar el resultado de un IO
function mapIO<A, B>(io: IO<A>, f: (a: A) => B): IO<B> {
  return { run: () => f(io.run()) }; // Compone la transformación
}

// ✅ flatMap: secuenciar IOs donde cada uno depende del anterior
function flatMapIO<A, B>(io: IO<A>, f: (a: A) => IO<B>): IO<B> {
  return { run: () => f(io.run()).run() }; // Encadena efectos
}

// ✅ sequence: ejecutar una lista de IOs en secuencia
function sequenceIO<A>(ios: IO<A>[]): IO<A[]> {
  return {
    run: () => ios.map((io) => io.run()), // Ejecuta cada IO
  };
}

// ============================================================================
// 📖 LÓGICA PURA — Testeable sin efectos
// ============================================================================

// ✅ Tipo del resultado de un concurso
type ContestResult = "Player1Wins" | "Player2Wins" | "Tie";

// ✅ Función PURA que determina el ganador — sin I/O
function winner(p1Score: number, p2Score: number): ContestResult {
  if (p1Score > p2Score) return "Player1Wins"; // Lógica pura
  if (p2Score > p1Score) return "Player2Wins"; // Lógica pura
  return "Tie";                                 // Lógica pura
}

// ✅ Función PURA que calcula precios — sin I/O
interface OrderCalc {
  readonly price: number;    // Precio base
  readonly tax: number;      // Impuesto
  readonly discount: number; // Descuento
  readonly total: number;    // Total final
}

function calculateOrder(price: number): OrderCalc {
  const tax = price * 0.19;                         // Lógica pura
  const subtotal = price + tax;                     // Lógica pura
  const discount = subtotal > 500 ? subtotal * 0.05 : 0; // Lógica pura
  return { price, tax, discount, total: subtotal - discount };
}

// ✅ Función PURA que calcula estadísticas — sin I/O
interface ReportStats {
  readonly total: number;
  readonly avg: number;
  readonly max: number;
  readonly min: number;
}

function computeStats(sales: number[]): ReportStats {
  const total = sales.reduce((a, b) => a + b, 0);  // Suma funcional
  return {
    total,
    avg: sales.length > 0 ? total / sales.length : 0,
    max: Math.max(...sales),
    min: Math.min(...sales),
  };
}

// ============================================================================
// 📖 INTÉRPRETES — Diferentes formas de presentar el resultado
// ============================================================================

// ✅ Intérprete para consola
function contestToConsole(p1: string, p2: string, result: ContestResult): IO<void> {
  return ioEffect(() => {
    const msg = result === "Player1Wins" ? `🏆 ${p1} gana!`
      : result === "Player2Wins" ? `🏆 ${p2} gana!`
        : `🤝 Empate!`;
    console.log(`  ${msg}`); // El efecto solo existe aquí
  });
}

// ✅ Intérprete para test (sin I/O real)
function contestToString(p1: string, p2: string, result: ContestResult): string {
  return result === "Player1Wins" ? `${p1} wins`
    : result === "Player2Wins" ? `${p2} wins`
      : "tie"; // Retorna string — testeable con ===
}

// ✅ Intérprete de orden para consola
function orderToConsole(calc: OrderCalc): IO<void> {
  return ioEffect(() => {
    console.log(`  Precio: $${calc.price.toFixed(2)}`);
    console.log(`  IVA: $${calc.tax.toFixed(2)}`);
    if (calc.discount > 0) console.log(`  Descuento: -$${calc.discount.toFixed(2)}`);
    console.log(`  Total: $${calc.total.toFixed(2)}`);
  });
}

// ============================================================================
// 🔬 DEMOSTRACIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO — IO Monad: Separar Efectos de Lógica");
  console.log("=".repeat(55));

  // --- Beneficio 1: Lógica pura testeable ---
  console.log("\n📌 Beneficio 1: Lógica PURA testeable sin I/O");
  console.log("-".repeat(40));

  // ✅ winner() es pura — se testea directamente
  console.log(`  winner(85, 72) = ${winner(85, 72)}`); // Player1Wins
  console.log(`  winner(50, 50) = ${winner(50, 50)}`); // Tie
  console.log("  ✅ Testeamos lógica sin consola, BD ni archivos");

  // --- Beneficio 2: IO como valor componible ---
  console.log("\n📌 Beneficio 2: Efectos como VALORES componibles");
  console.log("-".repeat(40));

  // ✅ Construimos el programa como un VALOR — no se ejecuta aún
  const result = winner(85, 72);               // Paso 1: puro
  const program = contestToConsole("Ana", "Bob", result); // Paso 2: IO

  console.log("  Programa construido (aún no ejecutado)...");
  program.run(); // ✅ Solo aquí ocurre el efecto
  console.log("  ✅ Separación clara: construir vs ejecutar");

  // --- Beneficio 3: Intérpretes intercambiables ---
  console.log("\n📌 Beneficio 3: MISMA lógica, diferentes salidas");
  console.log("-".repeat(40));

  const calc = calculateOrder(600); // Lógica PURA

  // ✅ Intérprete 1: consola
  console.log("  [Consola]:");
  orderToConsole(calc).run();

  // ✅ Intérprete 2: string (para test)
  const testOutput = `total=${calc.total.toFixed(2)}`;
  console.log(`\n  [Test]: ${testOutput}`);
  console.log("  ✅ Misma lógica, salida diferente — sin reescribir nada");

  // --- Beneficio 4: Secuenciar IOs ---
  console.log("\n📌 Beneficio 4: Secuenciar múltiples efectos");
  console.log("-".repeat(40));

  const stats = computeStats([100, 250, 75, 400]); // Puro
  const reportIO = sequenceIO([
    ioEffect(() => console.log(`  Total: $${stats.total}`)),
    ioEffect(() => console.log(`  Promedio: $${stats.avg.toFixed(2)}`)),
    ioEffect(() => console.log(`  Máx: $${stats.max}, Mín: $${stats.min}`)),
  ]);
  reportIO.run(); // ✅ Ejecuta todos los efectos en secuencia

  // --- Beneficio 5: Tests sin efectos ---
  console.log("\n📌 Beneficio 5: Tests puros sin efectos");
  console.log("-".repeat(40));

  const test1 = winner(100, 50) === "Player1Wins";
  const test2 = winner(50, 100) === "Player2Wins";
  const test3 = winner(50, 50) === "Tie";
  const test4 = calculateOrder(600).discount > 0;
  const test5 = calculateOrder(100).discount === 0;

  console.log(`  winner(100,50)=P1Wins: ${test1 ? "✅" : "❌"}`);
  console.log(`  winner(50,100)=P2Wins: ${test2 ? "✅" : "❌"}`);
  console.log(`  winner(50,50)=Tie:     ${test3 ? "✅" : "❌"}`);
  console.log(`  $600 tiene descuento:  ${test4 ? "✅" : "❌"}`);
  console.log(`  $100 sin descuento:    ${test5 ? "✅" : "❌"}`);
  console.log("  ✅ 5 tests PUROS — sin consola, BD ni archivos");

  // --- Resumen ---
  console.log("\n✅ BENEFICIOS:");
  console.log("  ✅ Lógica pura separada de efectos — 100% testeable");
  console.log("  ✅ IO como VALOR — describir sin ejecutar");
  console.log("  ✅ Intérpretes intercambiables (consola, test, email)");
  console.log("  ✅ sequenceIO compone efectos de forma segura");
  console.log("  ✅ Mismo código, diferentes contextos de ejecución");
}

main();
