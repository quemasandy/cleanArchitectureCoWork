// ============================================================================
// ✅ BUEN EJEMPLO: Monads — Secuenciación elegante con flatMap
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 11):
//    Un MONAD es un tipo M[A] que tiene dos operaciones:
//    - unit(a: A): M[A]          — Envolver un valor en el contexto
//    - flatMap(ma: M[A], f: A => M[B]): M[B] — Encadenar operaciones
//
//    flatMap es la clave: permite que cada paso DEPENDA del resultado
//    del paso anterior, mientras el Monad maneja la "fontanería"
//    (propagación de errores, estado, etc.) automáticamente.
//
//    Leyes Monádicas:
//    1. Left identity:  flatMap(unit(a), f) === f(a)
//    2. Right identity: flatMap(m, unit) === m
//    3. Associativity:  flatMap(flatMap(m, f), g) === flatMap(m, a => flatMap(f(a), g))
//
//    "Un Monad es un patrón de diseño para secuenciar computaciones."
// ============================================================================

// ============================================================================
// 📖 EITHER MONAD — Error handling + secuenciación
// ============================================================================

// ✅ Tipo Either: error (Left) o éxito (Right)
type Either<E, A> =
  | { readonly tag: "Left"; readonly error: E }    // Error con detalle
  | { readonly tag: "Right"; readonly value: A };   // Éxito con valor

// ✅ Constructores
function Left<E>(error: E): Either<E, never> { return { tag: "Left", error }; }
function Right<A>(value: A): Either<never, A> { return { tag: "Right", value }; }

// ✅ unit: envolver un valor en Either (siempre Right = éxito)
function unit<A>(value: A): Either<never, A> {
  return Right(value); // Envuelve en contexto de "éxito"
}

// ✅ flatMap: secuenciar operaciones donde cada una puede fallar
// Si el paso anterior falló (Left), NO ejecuta f — propaga el error
// Si el paso anterior tuvo éxito (Right), ejecuta f con el valor
function flatMap<E, A, B>(
  ma: Either<E, A>,           // Resultado del paso anterior
  f: (a: A) => Either<E, B>  // Función que produce el siguiente paso
): Either<E, B> {
  if (ma.tag === "Left") return ma; // ✅ Error se propaga automáticamente
  return f(ma.value);               // ✅ Éxito: ejecuta el siguiente paso
}

// ✅ map: transformar el valor sin cambiar el tipo de salida
function map<E, A, B>(ma: Either<E, A>, f: (a: A) => B): Either<E, B> {
  if (ma.tag === "Left") return ma;     // Error se propaga
  return Right(f(ma.value));            // Transforma el valor
}

// ============================================================================
// 📖 FUNCIONES DE DOMINIO — Cada una retorna Either
// ============================================================================

// ✅ Tipos de dominio
interface User {
  readonly id: string;        // ID del usuario
  readonly name: string;      // Nombre
  readonly addressId: string; // ID de la dirección
}

interface Address {
  readonly id: string;     // ID de la dirección
  readonly city: string;   // Ciudad
  readonly zipCode: string; // Código postal
}

// ✅ "Bases de datos" simuladas
const usersDB: Record<string, User> = {
  "u1": { id: "u1", name: "Ana", addressId: "a1" },
  "u2": { id: "u2", name: "Bob", addressId: "a99" },
};

const addressesDB: Record<string, Address> = {
  "a1": { id: "a1", city: "Bogotá", zipCode: "110111" },
};

// ✅ Buscar usuario — retorna Either con error ESPECÍFICO
function findUser(userId: string): Either<string, User> {
  const user = usersDB[userId]; // Busca en la "BD"
  if (!user) return Left(`Usuario '${userId}' no encontrado`); // Error descriptivo
  return Right(user); // Éxito con el usuario
}

// ✅ Buscar dirección — retorna Either con error ESPECÍFICO
function findAddress(addressId: string): Either<string, Address> {
  const address = addressesDB[addressId]; // Busca en la "BD"
  if (!address) return Left(`Dirección '${addressId}' no encontrada`); // Error descriptivo
  return Right(address); // Éxito con la dirección
}

// ✅ Extraer ciudad — retorna Either (siempre exitoso, pero parte de la cadena)
function extractCity(address: Address): Either<string, string> {
  if (!address.city) return Left("La dirección no tiene ciudad"); // Validación
  return Right(address.city); // Éxito con la ciudad
}

// ============================================================================
// 📖 COMPOSICIÓN MONÁDICA — Pipeline elegante y lineal
// ============================================================================

// ✅ Pipeline monádico: usuario → dirección → ciudad
// Cada paso depende del anterior, pero NO hay anidamiento
function getUserCity(userId: string): Either<string, string> {
  // ✅ flatMap encadena los pasos en LÍNEA RECTA — sin pirámide
  return flatMap(
    findUser(userId),                    // Paso 1: buscar usuario
    (user) => flatMap(
      findAddress(user.addressId),       // Paso 2: buscar dirección (usa user.addressId)
      (address) => extractCity(address)  // Paso 3: extraer ciudad (usa address)
    )
  );
}

// ✅ Helper "pipe" para hacer flatMap más legible (estilo pipeline)
function pipe<E, A, B>(
  value: Either<E, A>,
  ...fns: Array<(a: any) => Either<E, any>>
): Either<E, B> {
  let result: Either<E, any> = value; // Resultado acumulado
  for (const fn of fns) {
    if (result.tag === "Left") return result; // ✅ Cortocircuito en error
    result = fn(result.value);               // ✅ Siguiente paso
  }
  return result as Either<E, B>;
}

// ============================================================================
// 🔬 DEMOSTRACIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO — Monads: Secuenciación con flatMap");
  console.log("=".repeat(55));

  // --- Beneficio 1: Pipeline lineal sin anidamiento ---
  console.log("\n📌 Beneficio 1: Pipeline lineal (sin pirámide)");
  console.log("-".repeat(40));

  // ✅ Todo exitoso
  const city1 = getUserCity("u1");
  console.log(`  getUserCity("u1") = ${city1.tag === "Right" ? city1.value : city1.error}`);

  // ✅ Error en dirección — se propaga automáticamente
  const city2 = getUserCity("u2");
  console.log(`  getUserCity("u2") = ${city2.tag === "Left" ? `Error: ${city2.error}` : city2.value}`);

  // ✅ Error en usuario — se propaga automáticamente
  const city3 = getUserCity("u99");
  console.log(`  getUserCity("u99") = ${city3.tag === "Left" ? `Error: ${city3.error}` : city3.value}`);

  console.log("  ✅ Sabemos EXACTAMENTE qué paso falló — no solo 'null'");

  // --- Beneficio 2: map para transformar resultados ---
  console.log("\n📌 Beneficio 2: map para transformar el resultado");
  console.log("-".repeat(40));

  // ✅ Podemos transformar el resultado exitoso sin desempaquetar
  const upperCity = map(getUserCity("u1"), (city) => city.toUpperCase());
  console.log(`  Ciudad en mayúsculas: ${upperCity.tag === "Right" ? upperCity.value : upperCity.error}`);

  // ✅ Si hay error, map NO ejecuta la transformación
  const upperCity2 = map(getUserCity("u99"), (city) => city.toUpperCase());
  console.log(`  Error → map: ${upperCity2.tag === "Left" ? upperCity2.error : ""}`);
  console.log("  ✅ map solo transforma si hay éxito — error se propaga");

  // --- Beneficio 3: Composición de múltiples usuarios ---
  console.log("\n📌 Beneficio 3: Procesar múltiples valores con map");
  console.log("-".repeat(40));

  const userIds = ["u1", "u2", "u99"];
  // ✅ Procesamos todos — cada resultado tiene el error o éxito detallado
  const cities = userIds.map((id) => ({
    id,
    result: getUserCity(id), // Cada uno puede fallar independientemente
  }));

  for (const c of cities) {
    if (c.result.tag === "Right") {
      console.log(`  ✅ ${c.id}: ${c.result.value}`);
    } else {
      console.log(`  ❌ ${c.id}: ${c.result.error}`);
    }
  }
  console.log("  ✅ Cada resultado tiene su error específico");

  // --- Beneficio 4: Leyes monádicas ---
  console.log("\n📌 Beneficio 4: Leyes monádicas (garantías)");
  console.log("-".repeat(40));

  const f = (x: number) => Right(x + 10); // Función que retorna Either
  const g = (x: number) => Right(x * 2);  // Otra función que retorna Either

  // ✅ Left identity: flatMap(unit(5), f) === f(5)
  const leftId1 = flatMap(unit(5), f);     // flatMap(Right(5), f)
  const leftId2 = f(5);                    // f(5) directamente
  console.log(`  Left identity: flatMap(unit(5), f) = ${leftId1.tag === "Right" ? leftId1.value : ""}`);
  console.log(`                 f(5) = ${leftId2.tag === "Right" ? leftId2.value : ""}`);
  console.log(`                 ¿Iguales? ${leftId1.tag === "Right" && leftId2.tag === "Right" && leftId1.value === leftId2.value}`);

  // ✅ Right identity: flatMap(m, unit) === m
  const m = Right(42);
  const rightId = flatMap(m, (x) => unit(x));
  console.log(`  Right identity: flatMap(Right(42), unit) = ${rightId.tag === "Right" ? rightId.value : ""}`);
  console.log(`                  ¿Iguales? ${rightId.tag === "Right" && rightId.value === 42}`);

  // ✅ Associativity: flatMap(flatMap(m, f), g) === flatMap(m, a => flatMap(f(a), g))
  const assoc1 = flatMap(flatMap(Right(5), f), g);                  // (5+10)*2 = 30
  const assoc2 = flatMap(Right(5), (a) => flatMap(f(a), g));       // (5+10)*2 = 30
  console.log(`  Associativity: lado izq = ${assoc1.tag === "Right" ? assoc1.value : ""}`);
  console.log(`                 lado der = ${assoc2.tag === "Right" ? assoc2.value : ""}`);
  console.log(`                 ¿Iguales? ${assoc1.tag === "Right" && assoc2.tag === "Right" && assoc1.value === assoc2.value}`);

  // --- Resumen ---
  console.log("\n✅ BENEFICIOS:");
  console.log("  ✅ flatMap secuencia pasos SIN anidamiento — pipeline lineal");
  console.log("  ✅ Errores se propagan AUTOMÁTICAMENTE con detalle");
  console.log("  ✅ Cada paso puede depender del resultado del anterior");
  console.log("  ✅ Leyes monádicas garantizan comportamiento predecible");
  console.log("  ✅ Componible: agregar un paso es solo otro flatMap");
}

// Ejecutamos el ejemplo
main();
