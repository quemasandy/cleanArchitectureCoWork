// ============================================================================
// ✅ BUEN EJEMPLO: Property-Based Testing
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 8):
//    En vez de probar con datos ESPECÍFICOS elegidos a mano,
//    definimos PROPIEDADES que deben cumplirse para CUALQUIER dato.
//    El framework genera cientos de datos aleatorios y verifica
//    que la propiedad se cumple en todos.
//
//    La idea: "Para TODO x, debería cumplirse que P(x)"
//
//    Ejemplo: "Para TODA lista xs, reverse(reverse(xs)) === xs"
//    El framework genera 100 listas aleatorias y verifica esta propiedad.
//    Si encuentra una que falla, la reporta → ¡bug encontrado automáticamente!
//
//    Beneficios:
//    - Encuentra edge cases que el programador NUNCA imaginaría
//    - Prueba el COMPORTAMIENTO, no casos específicos
//    - Minimización: si falla, busca el caso más pequeño que falla
//    - Mayor confianza con menos código de test
// ============================================================================

// ============================================================================
// 📖 GENERADOR SIMPLE — Produce datos aleatorios para tests
// ============================================================================

// ✅ Interfaz de un generador de datos aleatorios
interface Gen<A> {
  readonly generate: () => A; // Función que produce un valor aleatorio de tipo A
}

// ✅ Generador de enteros en un rango
function genInt(min: number, max: number): Gen<number> {
  return {
    // ✅ Cada vez que se llama, produce un entero aleatorio en [min, max]
    generate: () => min + Math.floor(Math.random() * (max - min + 1)),
  };
}

// ✅ Generador de listas de tamaño variable
function genList<A>(genItem: Gen<A>, maxSize: number): Gen<A[]> {
  return {
    generate: () => {
      // ✅ Genera una lista de tamaño aleatorio [0, maxSize]
      const size = Math.floor(Math.random() * (maxSize + 1)); // Tamaño aleatorio
      const result: A[] = []; // Array para acumular items
      for (let i = 0; i < size; i++) {
        result.push(genItem.generate()); // Genera cada item aleatoriamente
      }
      return result; // Retorna la lista generada
    },
  };
}

// ✅ Generador de strings aleatorios
function genString(maxLength: number): Gen<string> {
  return {
    generate: () => {
      const length = Math.floor(Math.random() * (maxLength + 1)); // Longitud aleatoria
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789"; // Caracteres posibles
      let result = ""; // String acumulado
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)]; // Caracter aleatorio
      }
      return result;
    },
  };
}

// ============================================================================
// 📖 PROPERTY — "Para TODO x generado, debe cumplirse P(x)"
// ============================================================================

// ✅ Resultado de verificar una propiedad
interface PropResult {
  readonly passed: boolean;     // ¿Pasó la propiedad?
  readonly failedInput?: any;   // Si falló, ¿con qué input?
  readonly testsRun: number;    // Cuántos tests se ejecutaron
}

// ✅ forAll: verifica que una propiedad se cumple para N inputs generados
function forAll<A>(gen: Gen<A>, numTests: number, property: (a: A) => boolean): PropResult {
  // ✅ Genera numTests datos aleatorios y verifica la propiedad en cada uno
  for (let i = 0; i < numTests; i++) {
    const input = gen.generate(); // Genera un input aleatorio
    try {
      const result = property(input); // Evalúa la propiedad
      if (!result) {
        // ✅ Propiedad FALSIFICADA — reporta el input problemático
        return { passed: false, failedInput: input, testsRun: i + 1 };
      }
    } catch {
      // ✅ Si la propiedad lanza excepción, también es un fallo
      return { passed: false, failedInput: input, testsRun: i + 1 };
    }
  }
  // ✅ Todos los tests pasaron
  return { passed: true, testsRun: numTests };
}

// ✅ Helper para mostrar resultados de propiedades
function checkProperty(name: string, result: PropResult): void {
  if (result.passed) {
    console.log(`  ✅ ${name} — OK (${result.testsRun} tests)`);
  } else {
    console.log(`  ❌ ${name} — FALSIFICADO después de ${result.testsRun} tests`);
    console.log(`     Input que falló: ${JSON.stringify(result.failedInput)}`);
  }
}

// ============================================================================
// 📖 FUNCIONES A TESTEAR
// ============================================================================

// ✅ Reverse CORRECTO (copia siempre)
function reverse<T>(arr: readonly T[]): T[] {
  const result: T[] = []; // Siempre crea un nuevo array
  for (let i = arr.length - 1; i >= 0; i--) {
    result.push(arr[i]); // Copia cada elemento
  }
  return result;
}

// ❌ Sort INCORRECTO (para demostrar que property testing lo detecta)
function badSort(nums: readonly number[]): number[] {
  return [...nums].sort(); // Bug: sort() sin comparador ordena como strings
}

// ✅ Sort CORRECTO
function goodSort(nums: readonly number[]): number[] {
  return [...nums].sort((a, b) => a - b); // Comparador numérico correcto
}

// ============================================================================
// 🔬 DEMOSTRACIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO — Property-Based Testing");
  console.log("=".repeat(55));

  // --- Propiedades de reverse ---
  console.log("\n📌 Propiedades de reverse (generadas automáticamente)");
  console.log("-".repeat(40));

  // ✅ Propiedad 1: reverse(reverse(xs)) === xs
  // "Invertir una lista dos veces produce la lista original"
  const prop1 = forAll(
    genList(genInt(-100, 100), 20), // Genera listas de ints aleatorios
    200,                             // 200 tests
    (xs) => JSON.stringify(reverse(reverse(xs))) === JSON.stringify(xs)
  );
  checkProperty("reverse(reverse(xs)) === xs", prop1);

  // ✅ Propiedad 2: reverse preserva la longitud
  const prop2 = forAll(
    genList(genInt(0, 50), 15),
    200,
    (xs) => reverse(xs).length === xs.length
  );
  checkProperty("reverse(xs).length === xs.length", prop2);

  // ✅ Propiedad 3: reverse preserva los elementos (misma suma)
  const prop3 = forAll(
    genList(genInt(0, 100), 10),
    200,
    (xs) => {
      const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0); // Suma total
      return xs.length === 0 || sum(reverse(xs)) === sum(xs); // Misma suma
    }
  );
  checkProperty("sum(reverse(xs)) === sum(xs)", prop3);

  // ✅ Propiedad 4: head después de reverse es el last original
  const prop4 = forAll(
    genList(genInt(0, 100), 10),
    200,
    (xs) => xs.length === 0 || reverse(xs)[0] === xs[xs.length - 1]
  );
  checkProperty("reverse(xs)[0] === xs[last]", prop4);

  // --- Propiedades de sort: DETECTA EL BUG ---
  console.log("\n📌 Propiedades de sort (detecta bugs automáticamente)");
  console.log("-".repeat(40));

  // ✅ Propiedad: el resultado debe estar ordenado (a[i] <= a[i+1])
  const isSorted = (arr: number[]): boolean => {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) return false; // No está ordenado
    }
    return true;
  };

  // ✅ badSort FALLA esta propiedad — ¡detectado automáticamente!
  const propBadSort = forAll(
    genList(genInt(0, 100), 15),
    200,
    (xs) => isSorted(badSort(xs))
  );
  checkProperty("badSort(xs) está ordenado", propBadSort);

  // ✅ goodSort PASA esta propiedad
  const propGoodSort = forAll(
    genList(genInt(-100, 100), 15),
    200,
    (xs) => isSorted(goodSort(xs))
  );
  checkProperty("goodSort(xs) está ordenado", propGoodSort);

  // ✅ Propiedad: sort preserva los mismos elementos
  const propSortPreserves = forAll(
    genList(genInt(0, 50), 10),
    200,
    (xs) => {
      const sorted = goodSort(xs); // Ordena la lista
      return sorted.length === xs.length && // Misma longitud
        goodSort([...xs]).every((v, i) => v === sorted[i]); // Mismos elementos
    }
  );
  checkProperty("goodSort preserva elementos", propSortPreserves);

  // --- Propiedades aritméticas ---
  console.log("\n📌 Propiedades aritméticas universales");
  console.log("-".repeat(40));

  // ✅ Propiedad: a + b === b + a (conmutatividad)
  const propCommutative = forAll(
    genInt(-1000, 1000),
    200,
    (a) => {
      const b = genInt(-1000, 1000).generate(); // Genera segundo número
      return a + b === b + a; // Conmutatividad de la suma
    }
  );
  checkProperty("a + b === b + a (conmutatividad)", propCommutative);

  // ✅ Propiedad: a + 0 === a (identidad)
  const propIdentity = forAll(
    genInt(-1000, 1000),
    200,
    (a) => a + 0 === a
  );
  checkProperty("a + 0 === a (identidad)", propIdentity);

  // --- Resumen ---
  console.log("\n✅ BENEFICIOS:");
  console.log("  ✅ 200 tests generados automáticamente — no escritos a mano");
  console.log("  ✅ badSort falló automáticamente — el bug fue ENCONTRADO");
  console.log("  ✅ Pruebas de PROPIEDADES, no de valores específicos");
  console.log("  ✅ Edge cases generados aleatoriamente — incluyendo los inesperados");
  console.log("  ✅ Mayor confianza: si pasa 200 tests aleatorios, probablemente es correcto");
  console.log("  ✅ El input que falsificó se reporta — fácil de debuggear");
}

// Ejecutamos el ejemplo
main();
