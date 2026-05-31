// ============================================================================
// ✅ BUEN EJEMPLO: Manejo de Errores sin Excepciones (Option y Either)
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 4):
//    Podemos representar errores y fallos con VALORES ORDINARIOS.
//    En vez de lanzar excepciones, retornamos tipos que OBLIGAN al
//    llamador a manejar el caso de error.
//
//    Option<A> = Some(valor) | None — "puede que haya un valor, o no"
//    Either<E, A> = Left(error) | Right(valor) — "error detallado o valor"
//
//    Beneficios:
//    - El tipo de la función DICE LA VERDAD (puede fallar o no)
//    - El compilador OBLIGA a manejar errores
//    - Se pueden COMPONER operaciones fallables con map/flatMap
//    - Transparencia referencial intacta
// ============================================================================

// ============================================================================
// 📖 OPTION<A> — "Puede que haya un valor, puede que no"
// ============================================================================
// Option reemplaza el uso de null/undefined y excepciones para
// indicar "ausencia de valor". Es como un contenedor que puede
// estar lleno (Some) o vacío (None).
// ============================================================================

// ✅ Definimos Option<A> como discriminated union
type Option<A> =
  | { readonly tag: "None" }                   // No hay valor — similar a null, pero explícito
  | { readonly tag: "Some"; readonly value: A }; // Hay un valor de tipo A

// ✅ Constructores de Option
const None: Option<never> = { tag: "None" };      // Singleton para "sin valor"
function Some<A>(value: A): Option<A> {
  return { tag: "Some", value }; // Envuelve un valor en Option
}

// ✅ map: transformar el valor DENTRO del Option (si existe)
function mapOption<A, B>(opt: Option<A>, f: (a: A) => B): Option<B> {
  // ✅ Si es None, retorna None — no hay nada que transformar
  if (opt.tag === "None") return None;
  // ✅ Si es Some, aplica f al valor y lo envuelve en un nuevo Some
  return Some(f(opt.value)); // Transforma sin desempaquetar manualmente
}

// ✅ flatMap: encadenar operaciones que también pueden fallar
function flatMapOption<A, B>(opt: Option<A>, f: (a: A) => Option<B>): Option<B> {
  // ✅ Si es None, retorna None — no ejecuta f
  if (opt.tag === "None") return None;
  // ✅ Si es Some, aplica f que retorna otro Option
  return f(opt.value); // f puede retornar Some o None
}

// ✅ getOrElse: obtener el valor o un valor por defecto
function getOrElse<A>(opt: Option<A>, defaultValue: A): A {
  // ✅ Si es None, usa el valor por defecto
  if (opt.tag === "None") return defaultValue;
  // ✅ Si es Some, retorna el valor contenido
  return opt.value;
}

// ============================================================================
// 📖 EITHER<E, A> — "Error detallado O valor exitoso"
// ============================================================================
// Either es como Option pero con información del error. Left = error,
// Right = éxito (en inglés, "right" también significa "correcto").
// ============================================================================

// ✅ Definimos Either<E, A> como discriminated union
type Either<E, A> =
  | { readonly tag: "Left"; readonly error: E }   // Error con información de tipo E
  | { readonly tag: "Right"; readonly value: A };  // Éxito con valor de tipo A

// ✅ Constructores de Either
function Left<E>(error: E): Either<E, never> {
  return { tag: "Left", error }; // Envuelve un error
}
function Right<A>(value: A): Either<never, A> {
  return { tag: "Right", value }; // Envuelve un éxito
}

// ✅ map: transformar el valor exitoso (si es Right)
function mapEither<E, A, B>(either: Either<E, A>, f: (a: A) => B): Either<E, B> {
  // ✅ Si es Left (error), lo propaga sin tocar
  if (either.tag === "Left") return either;
  // ✅ Si es Right (éxito), transforma el valor
  return Right(f(either.value));
}

// ✅ flatMap: encadenar operaciones que también pueden fallar con detalle
function flatMapEither<E, A, B>(
  either: Either<E, A>,
  f: (a: A) => Either<E, B>
): Either<E, B> {
  // ✅ Si es Left (error), lo propaga — no ejecuta f
  if (either.tag === "Left") return either;
  // ✅ Si es Right, aplica f que puede retornar Left o Right
  return f(either.value);
}

// ============================================================================
// 📖 FUNCIONES QUE USAN OPTION Y EITHER — Los tipos dicen la verdad
// ============================================================================

// ✅ La firma DICE que puede no retornar un valor — Option<number>
function safeDivide(a: number, b: number): Option<number> {
  // ✅ En vez de throw, retornamos None para "no se puede"
  if (b === 0) return None; // Error representado como valor
  return Some(a / b);       // Éxito representado como valor
}

// ✅ La firma DICE que puede fallar con un mensaje — Either<string, number>
function parseAge(input: string): Either<string, number> {
  const age = parseInt(input, 10); // Intentamos parsear
  // ✅ En vez de throw, retornamos Left con descripción del error
  if (isNaN(age)) return Left(`"${input}" no es un número válido`);
  if (age < 0) return Left("La edad no puede ser negativa");
  if (age > 150) return Left("La edad no es realista");
  // ✅ Éxito: retornamos Right con el valor
  return Right(age);
}

// ✅ La firma DICE que puede no encontrar el usuario — Either<string, User>
interface User {
  readonly name: string; // Nombre del usuario
  readonly age: number;  // Edad del usuario
}

function findUser(id: string): Either<string, User> {
  // ✅ Base de datos simulada
  const users: Record<string, User> = {
    "1": { name: "Ana", age: 28 },
    "2": { name: "Bob", age: 35 },
  };
  // ✅ En vez de throw, retornamos Left si no existe
  if (!users[id]) return Left(`Usuario ${id} no encontrado`);
  return Right(users[id]); // Éxito: retornamos Right con el usuario
}

// ============================================================================
// 🔬 DEMOSTRACIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO — Manejo de Errores sin Excepciones");
  console.log("=".repeat(55));

  // --- Beneficio 1: Tipos que dicen la verdad ---
  console.log("\n📌 Beneficio 1: Los tipos dicen la VERDAD");
  console.log("-".repeat(40));

  // ✅ safeDivide retorna Option<number> — el tipo DICE que puede fallar
  const result1 = safeDivide(10, 2); // Some(5) — éxito
  const result2 = safeDivide(10, 0); // None — error, sin explotar

  console.log(`  safeDivide(10, 2) = ${result1.tag === "Some" ? result1.value : "None"}`);
  console.log(`  safeDivide(10, 0) = ${result2.tag === "Some" ? result2.value : "None"}`);
  console.log("  ✅ No hay excepciones — el programa nunca explota");

  // --- Beneficio 2: Composición elegante con map/flatMap ---
  console.log("\n📌 Beneficio 2: Composición elegante (sin try/catch)");
  console.log("-".repeat(40));

  // ✅ Encadenar operaciones: buscar usuario → verificar edad → dividir
  // Sin un solo try/catch — todo fluye con flatMap
  const pipeline = flatMapEither(
    findUser("1"),                    // Paso 1: buscar usuario
    (user) => flatMapEither(
      parseAge(String(user.age)),     // Paso 2: validar edad
      (age) => {
        // Paso 3: dividir (convertimos Option a Either)
        const divided = safeDivide(100, age);
        return divided.tag === "Some"
          ? Right(divided.value)      // Éxito: retornamos Right
          : Left("División por cero"); // Error: retornamos Left
      }
    )
  );

  // ✅ El resultado es Either<string, number> — tipo-safe
  if (pipeline.tag === "Right") {
    console.log(`  Pipeline exitoso: 100 / edad = ${pipeline.value.toFixed(2)}`);
  } else {
    console.log(`  Pipeline falló: ${pipeline.error}`);
  }

  // ✅ Con usuario que no existe — el error se propaga automáticamente
  const pipeline2 = flatMapEither(
    findUser("999"),                   // Falla aquí
    (user) => flatMapEither(
      parseAge(String(user.age)),      // Nunca se ejecuta
      (age) => Right(100 / age)        // Nunca se ejecuta
    )
  );

  if (pipeline2.tag === "Left") {
    console.log(`  Pipeline 2 falló: ${pipeline2.error}`);
    console.log("  ✅ El error se propagó sin try/catch — automáticamente");
  }

  // --- Beneficio 3: Map para transformar valores ---
  console.log("\n📌 Beneficio 3: map transforma sin desempaquetar");
  console.log("-".repeat(40));

  // ✅ map aplica una función SOLO si hay valor — sin if/else manual
  const age = parseAge("25");              // Right(25)
  const ageInMonths = mapEither(age, (a) => a * 12); // Right(300)

  const badAge = parseAge("abc");           // Left("no es número")
  const badAgeInMonths = mapEither(badAge, (a) => a * 12); // Left — no ejecuta la función

  console.log(`  parseAge("25") → meses: ${ageInMonths.tag === "Right" ? ageInMonths.value : ageInMonths.error}`);
  console.log(`  parseAge("abc") → meses: ${badAgeInMonths.tag === "Left" ? badAgeInMonths.error : badAgeInMonths.value}`);
  console.log("  ✅ map propaga errores automáticamente");

  // --- Beneficio 4: Procesar listas con errores ---
  console.log("\n📌 Beneficio 4: Procesar listas con errores controlados");
  console.log("-".repeat(40));

  // ✅ A diferencia de excepciones, podemos procesar todos y ver qué falló
  const userIds = ["1", "2", "999", "3"];
  const results = userIds.map((id) => ({
    id,                        // ID del usuario
    result: findUser(id),      // Either<string, User> — no explota
  }));

  // ✅ Separar éxitos de errores de forma tipo-safe
  const successes = results.filter((r) => r.result.tag === "Right");
  const failures = results.filter((r) => r.result.tag === "Left");

  console.log(`  Éxitos: ${successes.length}`);
  for (const s of successes) {
    if (s.result.tag === "Right") {
      console.log(`    ✅ ID ${s.id}: ${s.result.value.name}`);
    }
  }
  console.log(`  Errores: ${failures.length}`);
  for (const f of failures) {
    if (f.result.tag === "Left") {
      console.log(`    ❌ ID ${f.id}: ${f.result.error}`);
    }
  }
  console.log("  ✅ Todos procesados — ninguna excepción, ningún crash");

  // --- Beneficio 5: getOrElse para valores por defecto ---
  console.log("\n📌 Beneficio 5: Valores por defecto con getOrElse");
  console.log("-".repeat(40));

  // ✅ getOrElse: obtener el valor o un fallback seguro
  const divResult = safeDivide(10, 0);              // None
  const safeResult = getOrElse(divResult, 0);       // 0 (valor por defecto)

  const divResult2 = safeDivide(10, 2);             // Some(5)
  const safeResult2 = getOrElse(divResult2, 0);     // 5 (valor real)

  console.log(`  safeDivide(10, 0) con default 0: ${safeResult}`);   // 0
  console.log(`  safeDivide(10, 2) con default 0: ${safeResult2}`);  // 5
  console.log("  ✅ Nunca explota — siempre retorna un valor");

  // --- Resumen ---
  console.log("\n✅ BENEFICIOS:");
  console.log("  ✅ Los tipos DICEN LA VERDAD: Option<A>, Either<E, A>");
  console.log("  ✅ El compilador OBLIGA a manejar casos de error");
  console.log("  ✅ Composición con map/flatMap — sin try/catch anidados");
  console.log("  ✅ Transparencia referencial intacta — no hay excepciones");
  console.log("  ✅ Errores como valores: se pueden acumular, filtrar, transformar");
}

// Ejecutamos el ejemplo
main();
