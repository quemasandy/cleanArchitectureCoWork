// ============================================================================
// ❌ MAL EJEMPLO: Lógica duplicada de transformación por tipo
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 11):
//    Un FUNCTOR es un tipo que implementa map(). Es la abstracción
//    de "transformar un valor dentro de un contexto" sin tocar el contexto.
//
//    List, Option, Either, Promise... todos son Functors porque todos
//    tienen map().
//
// 🚨 PROBLEMA: Sin la abstracción Functor:
//    - Duplicamos la lógica de transformación para cada contenedor
//    - if/else para cada tipo de contenedor
//    - No hay una interfaz unificada para "transformar dentro de contexto"
//    - Cada nuevo contenedor requiere reescribir todas las funciones
// ============================================================================

// ❌ Contenedores sin interfaz común

// ❌ Transformar un valor "tal vez" presente — código Manual para "option"
function transformMaybe(
  value: number | null, // ❌ Usamos null en vez de un tipo explícito
  f: (n: number) => number
): number | null {
  // ❌ if/else manual para manejar null — se repite en cada función
  if (value === null) return null;
  return f(value);
}

// ❌ Transformar cada elemento de un array — código manual para "lista"
function transformArray(
  values: number[], // ❌ Solo funciona con number[]
  f: (n: number) => number
): number[] {
  // ❌ Loop imperativo duplicado — la lógica de "aplicar f" es la misma
  const result: number[] = [];
  for (const v of values) {
    result.push(f(v)); // Lo mismo que haríamos con Option, pero repetido
  }
  return result;
}

// ❌ Transformar un resultado asíncrono — código manual para "promise-like"
interface AsyncResult<T> {
  value: T | null;   // ❌ Mutable
  error: string | null; // ❌ Mutable
}

function transformAsyncResult(
  result: AsyncResult<number>,
  f: (n: number) => number
): AsyncResult<number> {
  // ❌ if/else manual OTRA VEZ — mismo patrón, diferente tipo
  if (result.error !== null) return result; // Propagar error
  if (result.value === null) return result; // Sin valor
  return { value: f(result.value), error: null }; // Aplicar f
}

// ❌ Para doblar precios, necesitamos UNA función por cada contenedor
function doubleMaybe(value: number | null): number | null {
  return transformMaybe(value, (n) => n * 2); // Duplicación
}

function doubleArray(values: number[]): number[] {
  return transformArray(values, (n) => n * 2); // Mismo cálculo, otro wrapper
}

function doubleAsyncResult(result: AsyncResult<number>): AsyncResult<number> {
  return transformAsyncResult(result, (n) => n * 2); // ¡OTRA VEZ!
}

// ============================================================================
// 🔬 DEMOSTRACIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO — Lógica Duplicada sin Functor");
  console.log("=".repeat(55));

  console.log("\n📌 Problema: 3 funciones para hacer lo mismo (x * 2)");
  console.log("-".repeat(40));

  // ❌ Misma operación (x2) con 3 implementaciones diferentes
  const maybe = doubleMaybe(50);
  const array = doubleArray([10, 20, 30]);
  const asyncRes = doubleAsyncResult({ value: 42, error: null });

  console.log(`  doubleMaybe(50) = ${maybe}`);
  console.log(`  doubleArray([10,20,30]) = [${array.join(", ")}]`);
  console.log(`  doubleAsyncResult({42}) = ${asyncRes.value}`);

  console.log("\n📌 Problema: Manejar null en CADA función");
  console.log("-".repeat(40));

  const maybeNull = doubleMaybe(null); // null
  const asyncErr = doubleAsyncResult({ value: null, error: "timeout" });

  console.log(`  doubleMaybe(null) = ${maybeNull}`);
  console.log(`  doubleAsyncResult(error) = ${asyncErr.error}`);
  console.log("  ❌ Cada función repite el mismo if(null) check");

  console.log("\n⚠️  PROBLEMAS:");
  console.log("  ❌ 3 funciones transform* — solo cambia el contenedor");
  console.log("  ❌ 3 funciones double* — misma lógica (n*2) triplicada");
  console.log("  ❌ Si agregamos un nuevo contenedor: hay que escribir TODO otra vez");
  console.log("  ❌ No hay interfaz común para 'aplicar f dentro de un contexto'");
  console.log("  ❌ Si la lógica de transformación cambia, hay que actualizar 3+ lugares");
}

// Ejecutamos el ejemplo
main();
