// ============================================================================
// ❌ MAL EJEMPLO: Manejo de errores con Excepciones
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 4):
//    Lanzar excepciones es un EFECTO SECUNDARIO. Las excepciones rompen
//    la transparencia referencial porque el significado de una expresión
//    depende del CONTEXTO (qué try/catch la envuelve).
//
//    throw new Error("fail") puede significar cosas diferentes dependiendo
//    de dónde esté — eso NO es referencial transparency.
//
// 🚨 PROBLEMAS con throw/try/catch:
//    1. Rompen la transparencia referencial
//    2. Son invisibles en la firma de la función (el tipo no dice que puede fallar)
//    3. No son composables — se necesitan try/catch anidados
//    4. Es fácil olvidar manejar un error
// ============================================================================

// ❌ La firma dice "retorna number" pero a veces EXPLOTA
// El llamador no sabe que esta función puede lanzar una excepción
function divide(a: number, b: number): number {
  // ❌ throw es un efecto secundario — rompe el flujo normal
  if (b === 0) throw new Error("División por cero"); // ¡Boom!
  // ❌ El tipo de retorno "number" es una MENTIRA — a veces no retorna nada
  return a / b; // Solo llega aquí si b !== 0
}

// ❌ La firma no indica que puede fallar — el llamador debe "adivinar"
function parseAge(input: string): number {
  // ❌ parseInt puede retornar NaN — y lo convertimos en excepción
  const age = parseInt(input, 10); // Puede retornar NaN silenciosamente
  if (isNaN(age)) throw new Error(`"${input}" no es un número válido`);
  // ❌ Validación con excepción — el llamador tiene que wrappear en try/catch
  if (age < 0) throw new Error("La edad no puede ser negativa");
  if (age > 150) throw new Error("La edad no es realista");
  return age; // Solo llega aquí si todo está bien
}

// ❌ Función que busca un usuario — puede lanzar por múltiples razones
function findUser(id: string): { name: string; age: number } {
  // ❌ Simulamos una base de datos
  const users: Record<string, { name: string; age: number }> = {
    "1": { name: "Ana", age: 28 },
    "2": { name: "Bob", age: 35 },
  };
  // ❌ throw para indicar "no encontrado" — el llamador debe adivinarlo
  if (!users[id]) throw new Error(`Usuario ${id} no encontrado`);
  return users[id]; // Solo llega aquí si el usuario existe
}

// ============================================================================
// 🔬 DEMOSTRACIÓN: Los problemas de throw/try/catch
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO — Manejo de Errores con Excepciones");
  console.log("=".repeat(55));

  // --- Problema 1: Transparencia referencial rota ---
  console.log("\n📌 Problema 1: Transparencia referencial ROTA");
  console.log("-".repeat(40));

  // ❌ Este código EXPLOTA — la excepción se propaga sin control
  try {
    const result = divide(10, 0); // ❌ Lanza Error
    console.log(`  Resultado: ${result}`); // Nunca llega aquí
  } catch (e: any) {
    console.log(`  ❌ Excepción: ${e.message}`); // Control de flujo por excepciones
  }

  // ❌ No podemos sustituir divide(10, 0) por su "valor" porque no tiene valor
  // Si fuera referentially transparent, podríamos reemplazar la expresión
  // por su resultado. Pero la expresión no tiene resultado — explota.

  // --- Problema 2: Composición imposible ---
  console.log("\n📌 Problema 2: Composición de operaciones fallables");
  console.log("-".repeat(40));

  // ❌ Queremos: buscar usuario → parsear edad → dividir
  // Con excepciones necesitamos try/catch ANIDADOS — feo y propenso a errores
  try {
    const user = findUser("1"); // ❌ Puede lanzar "no encontrado"
    try {
      const age = parseAge(String(user.age)); // ❌ Puede lanzar "no es número"
      try {
        const result = divide(100, age); // ❌ Puede lanzar "división por cero"
        console.log(`  Resultado: ${result}`);
      } catch (e: any) {
        console.log(`  ❌ Error en divide: ${e.message}`);
      }
    } catch (e: any) {
      console.log(`  ❌ Error en parseAge: ${e.message}`);
    }
  } catch (e: any) {
    console.log(`  ❌ Error en findUser: ${e.message}`);
  }

  // ❌ O el anti-patrón de catch-all que pierde información
  try {
    const user = findUser("999"); // No existe
    const result = divide(100, user.age);
    console.log(`  Resultado: ${result}`);
  } catch (e: any) {
    // ❌ ¿Qué falló? ¿findUser? ¿divide? No lo sabemos sin inspeccionar
    console.log(`  ❌ Algo falló: ${e.message}`);
    console.log("  ❌ No sabemos QUÉ operación falló sin inspeccionar el error");
  }

  // --- Problema 3: Errores silenciosos ---
  console.log("\n📌 Problema 3: Errores silenciosos y olvidados");
  console.log("-".repeat(40));

  // ❌ Si olvidamos el try/catch, el programa EXPLOTA completamente
  // No hay nada en el tipo que nos OBLIGUE a manejar el error
  console.log("  La firma 'divide(a, b): number' NO indica que puede fallar");
  console.log("  El compilador NO nos obliga a manejar el error");
  console.log("  Si olvidamos try/catch, el programa CRASH");

  // ❌ Demostración de que el tipo MIENTE
  const fn: (a: number, b: number) => number = divide; // ✅ Compila sin warning
  // ❌ TypeScript no sabe que 'fn' puede lanzar — el tipo dice "siempre retorna number"
  console.log("  TypeScript acepta 'divide' como '(a,b) => number' sin advertencia");

  // --- Problema 4: La "pirámide del mal" ---
  console.log("\n📌 Problema 4: La pirámide de try/catch anidados");
  console.log("-".repeat(40));

  // ❌ Procesar múltiples usuarios requiere try/catch por cada uno
  const userIds = ["1", "2", "999", "3"]; // 999 no existe
  const results: string[] = []; // Acumulador mutable

  for (const id of userIds) {
    try {
      const user = findUser(id); // ❌ Puede lanzar
      results.push(`${user.name} (${user.age})`);
    } catch (e: any) {
      results.push(`Error: ${e.message}`); // ❌ Mezclamos datos y errores en un string
    }
  }

  console.log(`  Resultados: ${results.join(" | ")}`);
  console.log("  ❌ Datos y errores mezclados como strings — no hay type safety");

  // --- Resumen ---
  console.log("\n⚠️  PROBLEMAS:");
  console.log("  ❌ throw rompe la transparencia referencial");
  console.log("  ❌ La firma 'number' MIENTE — la función puede no retornar nada");
  console.log("  ❌ Composición requiere try/catch anidados");
  console.log("  ❌ El compilador NO obliga a manejar errores");
  console.log("  ❌ Fácil olvidar un try/catch → programa crash");
}

// Ejecutamos el ejemplo
main();
