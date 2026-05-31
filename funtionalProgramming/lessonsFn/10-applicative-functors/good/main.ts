// ============================================================================
// ✅ BUEN EJEMPLO: Applicative Functors — Validación paralela
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 12):
//    Un Applicative Functor tiene la operación map2:
//    map2(fa: F[A], fb: F[B], f: (A, B) => C): F[C]
//
//    A diferencia de flatMap (donde B puede depender de A),
//    map2 toma dos valores INDEPENDIENTES y los combina.
//    Como son independientes, pueden evaluarse "en paralelo".
//
//    Para VALIDACIÓN esto es clave:
//    - Validamos nombre, email y edad INDEPENDIENTEMENTE
//    - Acumulamos TODOS los errores simultáneamente
//    - El usuario ve todos sus errores de una vez
//
//    Validation<E, A> = Invalid(errores: E[]) | Valid(valor: A)
//    Es como Either, pero acumula errores en vez de detenerse.
// ============================================================================

// ============================================================================
// 📖 VALIDATION<E, A> — Either que ACUMULA errores
// ============================================================================

// ✅ Tipo Validation: acumula errores (Invalid) o contiene un valor (Valid)
type Validation<E, A> =
  | { readonly tag: "Invalid"; readonly errors: readonly E[] }  // Lista de errores
  | { readonly tag: "Valid"; readonly value: A };                // Valor exitoso

// ✅ Constructores
function Invalid<E>(...errors: E[]): Validation<E, never> {
  return { tag: "Invalid", errors }; // Envuelve errores en una lista
}
function Valid<A>(value: A): Validation<never, A> {
  return { tag: "Valid", value }; // Envuelve un valor exitoso
}

// ✅ map: transformar el valor dentro de Validation (si es Valid)
function mapV<E, A, B>(va: Validation<E, A>, f: (a: A) => B): Validation<E, B> {
  if (va.tag === "Invalid") return va; // Error: propaga sin tocar
  return Valid(f(va.value));           // Éxito: transforma el valor
}

// ✅ map2: combinar dos Validations INDEPENDIENTES
// SI AMBAS son Valid → combina los valores con f
// SI UNA O AMBAS son Invalid → ACUMULA todos los errores
function map2<E, A, B, C>(
  va: Validation<E, A>,         // Primera validación (independiente)
  vb: Validation<E, B>,         // Segunda validación (independiente)
  f: (a: A, b: B) => C         // Función para combinar valores exitosos
): Validation<E, C> {
  // ✅ Caso: ambas inválidas → ACUMULAR errores de ambas
  if (va.tag === "Invalid" && vb.tag === "Invalid") {
    return { tag: "Invalid", errors: [...va.errors, ...vb.errors] };
  }
  // ✅ Caso: solo la primera inválida → propagar sus errores
  if (va.tag === "Invalid") return va;
  // ✅ Caso: solo la segunda inválida → propagar sus errores
  if (vb.tag === "Invalid") return vb;
  // ✅ Caso: ambas válidas → combinar con f
  return Valid(f(va.value, vb.value));
}

// ✅ map3: combinar TRES Validations independientes (extensión natural)
function map3<E, A, B, C, D>(
  va: Validation<E, A>,
  vb: Validation<E, B>,
  vc: Validation<E, C>,
  f: (a: A, b: B, c: C) => D
): Validation<E, D> {
  // ✅ Combinamos las primeras dos, luego combinamos con la tercera
  // Todos los errores se ACUMULAN, no se pierden
  return map2(
    map2(va, vb, (a, b) => ({ a, b })),      // Combina A y B en un par
    vc,                                        // Tercera validación
    (ab, c) => f(ab.a, ab.b, c)              // Combina todo
  );
}

// ✅ traverse: aplicar una validación a cada elemento de una lista
function traverse<E, A, B>(
  list: readonly A[],
  f: (a: A) => Validation<E, B>
): Validation<E, readonly B[]> {
  // ✅ Acumula TODOS los errores de todos los elementos
  return list.reduce<Validation<E, readonly B[]>>(
    (acc, item) => map2(acc, f(item), (bs, b) => [...bs, b]),
    Valid([] as readonly B[]) // Empezamos con lista vacía exitosa
  );
}

// ============================================================================
// 📖 VALIDADORES INDEPENDIENTES — Cada uno puede fallar por su cuenta
// ============================================================================

// ✅ Tipo para un usuario validado
interface ValidUser {
  readonly name: string;   // Nombre validado
  readonly email: string;  // Email validado
  readonly age: number;    // Edad validada
}

// ✅ Validar nombre — retorna Validation con posible error
function validateName(input: string): Validation<string, string> {
  if (!input || input.trim().length === 0) return Invalid("El nombre es obligatorio");
  if (input.trim().length < 2) return Invalid("El nombre debe tener al menos 2 caracteres");
  return Valid(input.trim()); // ✅ Nombre válido
}

// ✅ Validar email — retorna Validation con posible error
function validateEmail(input: string): Validation<string, string> {
  if (!input) return Invalid("El email es obligatorio");
  if (!input.includes("@")) return Invalid("El email debe contener @");
  if (!input.includes(".")) return Invalid("El email debe contener un dominio");
  return Valid(input); // ✅ Email válido
}

// ✅ Validar edad — retorna Validation con posible error
function validateAge(input: string): Validation<string, number> {
  const age = parseInt(input, 10); // Intentar parsear
  if (isNaN(age)) return Invalid("La edad debe ser un número");
  if (age < 0) return Invalid("La edad no puede ser negativa");
  if (age > 150) return Invalid("La edad no puede ser mayor a 150");
  return Valid(age); // ✅ Edad válida
}

// ✅ Validar formulario COMPLETO — usando Applicative (map3)
function validateUserForm(input: {
  name: string;
  email: string;
  age: string;
}): Validation<string, ValidUser> {
  // ✅ map3 ejecuta las TRES validaciones INDEPENDIENTEMENTE
  // Si hay errores en múltiples campos, los ACUMULA TODOS
  return map3(
    validateName(input.name),    // Validación 1: nombre (independiente)
    validateEmail(input.email),  // Validación 2: email (independiente)
    validateAge(input.age),      // Validación 3: edad (independiente)
    (name, email, age) => ({ name, email, age }) // Combinar si todo es válido
  );
}

// ============================================================================
// 🔬 DEMOSTRACIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO — Applicative Functors: Validación Paralela");
  console.log("=".repeat(55));

  // --- Beneficio 1: TODOS los errores de una vez ---
  console.log("\n📌 Beneficio 1: TODOS los errores visibles simultáneamente");
  console.log("-".repeat(40));

  // ✅ Formulario con TODOS los campos inválidos
  const badForm = validateUserForm({
    name: "",
    email: "no-email",
    age: "abc",
  });

  if (badForm.tag === "Invalid") {
    console.log("  Errores encontrados:");
    for (const error of badForm.errors) {
      console.log(`    ❌ ${error}`);
    }
    console.log(`  Total: ${badForm.errors.length} errores detectados de una vez`);
    console.log("  ✅ El usuario ve TODO lo que debe corregir de una vez");
  }

  // --- Beneficio 2: Corregir todo en un intento ---
  console.log("\n📌 Beneficio 2: Corregir TODO en un solo intento");
  console.log("-".repeat(40));

  // ✅ El usuario corrige todos los errores de una vez
  const goodForm = validateUserForm({
    name: "Ana García",
    email: "ana@ejemplo.com",
    age: "28",
  });

  if (goodForm.tag === "Valid") {
    console.log(`  ✅ Usuario válido: ${JSON.stringify(goodForm.value)}`);
    console.log("  ✅ Solo necesitó 2 intentos (en vez de 4 con secuencial)");
  }

  // --- Beneficio 3: Errores parciales ---
  console.log("\n📌 Beneficio 3: Errores parciales acumulados");
  console.log("-".repeat(40));

  // ✅ Solo 2 de 3 campos son inválidos — se ven ambos errores
  const partialBad = validateUserForm({
    name: "Ana",        // ✅ Válido
    email: "no-email",  // ❌ Sin @
    age: "-5",          // ❌ Negativa
  });

  if (partialBad.tag === "Invalid") {
    console.log("  Errores (nombre es válido, 2 errores en otros campos):");
    for (const error of partialBad.errors) {
      console.log(`    ❌ ${error}`);
    }
  }

  // --- Beneficio 4: traverse — validar listas ---
  console.log("\n📌 Beneficio 4: traverse — validar lista de items");
  console.log("-".repeat(40));

  // ✅ Validar múltiples edades — acumula TODOS los errores
  const ages = ["25", "abc", "-3", "200", "30"];
  const validatedAges = traverse(ages, validateAge);

  if (validatedAges.tag === "Invalid") {
    console.log("  Errores en la lista de edades:");
    for (const error of validatedAges.errors) {
      console.log(`    ❌ ${error}`);
    }
    console.log(`  Total: ${validatedAges.errors.length} errores de ${ages.length} items`);
  }

  // ✅ Lista sin errores
  const goodAges = traverse(["25", "30", "42"], validateAge);
  if (goodAges.tag === "Valid") {
    console.log(`\n  Edades válidas: [${goodAges.value.join(", ")}]`);
    console.log("  ✅ traverse acumula TODOS los resultados exitosos");
  }

  // --- Beneficio 5: Applicative vs Monad ---
  console.log("\n📌 Beneficio 5: Applicative vs Monad — cuándo usar cada uno");
  console.log("-".repeat(40));

  console.log("  📖 MONAD (flatMap):");
  console.log("     → Paso B DEPENDE de resultado de A");
  console.log("     → Ejemplo: buscar usuario, LUEGO buscar su dirección");
  console.log("     → Se detiene en el primer error");

  console.log("  📖 APPLICATIVE (map2):");
  console.log("     → A y B son INDEPENDIENTES");
  console.log("     → Ejemplo: validar nombre Y email Y edad");
  console.log("     → ACUMULA todos los errores");

  // --- Resumen ---
  console.log("\n✅ BENEFICIOS:");
  console.log("  ✅ TODOS los errores de validación visibles a la vez");
  console.log("  ✅ map2/map3 combina valores INDEPENDIENTES");
  console.log("  ✅ traverse valida listas acumulando errores");
  console.log("  ✅ Mejor UX: el usuario corrige todo de una vez");
  console.log("  ✅ Complementa Monad: usa Applicative para independientes, Monad para dependientes");
}

// Ejecutamos el ejemplo
main();
