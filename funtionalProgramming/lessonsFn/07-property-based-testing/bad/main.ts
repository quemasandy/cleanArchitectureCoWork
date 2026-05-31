// ============================================================================
// ❌ MAL EJEMPLO: Tests frágiles basados en casos específicos
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 8):
//    Escribir unit tests para CADA caso posible es imposible.
//    Los tests con datos hardcodeados solo prueban los escenarios
//    que el programador imaginó — los bugs reales están en los
//    escenarios que NO imaginó.
//
// 🚨 PROBLEMA:
//    - Tests con datos fijos: solo prueban escenarios "fáciles"
//    - Edge cases invisibles: el programador no piensa en todos
//    - Falsa confianza: "todos los tests pasan" pero hay bugs
//    - Frágiles: cambiar la implementación rompe los tests
// ============================================================================

// ❌ Función que "parece funcionar" — reverse de una lista
function reverseArray<T>(arr: T[]): T[] {
  // ❌ Implementación con un bug sutil: falla con arrays de 1 elemento
  if (arr.length <= 1) return arr; // ❌ Retorna la MISMA referencia, no una copia
  const result: T[] = []; // Nuevo array
  for (let i = arr.length - 1; i >= 0; i--) {
    result.push(arr[i]); // Copia los elementos en orden inverso
  }
  return result; // Funciona para la mayoría de los casos
}

// ❌ Función de ordenamiento con un bug en edge cases
function sortNumbers(nums: number[]): number[] {
  // ❌ Implementación que falla con números negativos en ciertos ordenes
  return [...nums].sort(); // Bug: sort() sin comparador ordena como STRINGS
  // "10" < "2" como string → [1, 10, 2, 3] en vez de [1, 2, 3, 10]
}

// ❌ Función que calcula descuento con bug en boundary
function calculateDiscount(price: number, percentage: number): number {
  // ❌ No valida que percentage esté entre 0 y 100
  return price - (price * percentage) / 100; // ¿Qué pasa con percentage=150?
}

// ============================================================================
// ❌ TESTS FRÁGILES — Solo prueban los "casos felices"
// ============================================================================

function runBadTests(): void {
  let passed = 0; // ❌ Acumulador mutable
  let failed = 0; // ❌ Acumulador mutable

  // ❌ Helper para verificar un test específico
  function assert(description: string, condition: boolean): void {
    if (condition) {
      console.log(`  ✅ ${description}`);
      passed++;
    } else {
      console.log(`  ❌ ${description}`);
      failed++;
    }
  }

  // ❌ Tests de reverse — todos pasan, pero no prueban edge cases
  console.log("\n  Tests de reverseArray:");
  assert("reverse [1,2,3] = [3,2,1]",
    JSON.stringify(reverseArray([1, 2, 3])) === JSON.stringify([3, 2, 1])
  ); // ✅ Pasa — caso simple

  assert("reverse [1,2] = [2,1]",
    JSON.stringify(reverseArray([1, 2])) === JSON.stringify([2, 1])
  ); // ✅ Pasa — caso simple

  // ❌ No prueban: ¿reverse(reverse(x)) === x? ¿reverse([]) === []?
  // ❌ No prueban: ¿reverse preserva los mismos elementos?

  // ❌ Tests de sort — los datos elegidos NO revelan el bug
  console.log("\n  Tests de sortNumbers:");
  assert("sort [3,1,2] = [1,2,3]",
    JSON.stringify(sortNumbers([3, 1, 2])) === JSON.stringify([1, 2, 3])
  ); // ✅ Pasa — pero solo porque son números de 1 dígito

  assert("sort [5,4,3,2,1] = [1,2,3,4,5]",
    JSON.stringify(sortNumbers([5, 4, 3, 2, 1])) === JSON.stringify([1, 2, 3, 4, 5])
  ); // ✅ Pasa — números de 1 dígito no revelan el bug

  // ❌ ESTE test revelaría el bug, pero el programador no pensó en él
  assert("sort [1,10,2,20] = [1,2,10,20]",
    JSON.stringify(sortNumbers([1, 10, 2, 20])) === JSON.stringify([1, 2, 10, 20])
  ); // ❌ FALLA — sort() ordena como strings: [1, 10, 2, 20]

  // ❌ Tests de descuento — no prueban boundaries
  console.log("\n  Tests de calculateDiscount:");
  assert("10% de $100 = $90",
    calculateDiscount(100, 10) === 90
  ); // ✅ Pasa — caso feliz

  assert("50% de $200 = $100",
    calculateDiscount(200, 50) === 100
  ); // ✅ Pasa — caso feliz

  // ❌ No se prueban: porcentaje negativo, porcentaje > 100, precio 0
  // El programador no imaginó estos escenarios

  console.log(`\n  Resultado: ${passed} pasaron, ${failed} fallaron`);
}

// ============================================================================
// 🔬 DEMOSTRACIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO — Tests Frágiles con Datos Específicos");
  console.log("=".repeat(55));

  runBadTests();

  console.log("\n⚠️  PROBLEMAS:");
  console.log("  ❌ Solo probamos datos que el programador IMAGINÓ");
  console.log("  ❌ El bug en sort() solo aparece con números multi-dígito");
  console.log("  ❌ El bug en calculateDiscount con % > 100 nunca se detecta");
  console.log("  ❌ reverse retorna MISMA referencia para arrays de 1 elem");
  console.log("  ❌ 'Todos los tests pasan' no significa 'el código es correcto'");
  console.log("  ❌ Los edge cases viven en la imaginación del programador");
}

// Ejecutamos el ejemplo
main();
