// ============================================================================
// ❌ MAL EJEMPLO: Programación con efectos secundarios (side effects)
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 1):
//    La programación funcional se basa en una premisa simple:
//    construir programas usando SOLO funciones puras — funciones sin
//    efectos secundarios.
//
// 🚨 PROBLEMA: Aquí usamos funciones IMPURAS que:
//    - Modifican variables externas (estado mutable)
//    - Dependen de estado global
//    - Producen resultados diferentes cada vez que se llaman
//    - NO tienen transparencia referencial
//
//    Una función tiene "efecto secundario" si hace ALGO MÁS que retornar
//    un resultado: modificar una variable, lanzar una excepción, imprimir
//    en consola, leer/escribir un archivo, etc.
// ============================================================================

// ❌ Variable global mutable — cualquier función puede modificarla
let totalVentas = 0; // Estado global compartido, fuente de bugs

// ❌ Variable global mutable para el descuento
let descuentoGlobal = 0.1; // 10% de descuento inicial

// ❌ Función IMPURA: modifica estado global (totalVentas)
// Cada vez que la llamas, el resultado depende de un estado externo
function agregarVenta(monto: number): number {
  // ❌ Efecto secundario: modificamos la variable global totalVentas
  totalVentas += monto; // Muta estado externo
  // ❌ Efecto secundario: imprimimos en consola
  console.log(`  💰 Venta agregada: $${monto}`); // Side effect: I/O
  // ❌ El resultado depende de totalVentas, que cambia con cada llamada
  return totalVentas; // Retorna un valor diferente cada vez
}

// ❌ Función IMPURA: depende de variable global mutable
// Si alguien cambia descuentoGlobal en otro lugar, esta función
// retorna algo distinto con los mismos argumentos
function calcularPrecioConDescuento(precio: number): number {
  // ❌ Depende de estado global — no es predecible
  const descuento = precio * descuentoGlobal; // Lee estado externo
  // ❌ Efecto secundario: modifica el descuento global
  descuentoGlobal += 0.01; // ¡Cada llamada incrementa el descuento!
  // ❌ Efecto secundario: imprime en consola
  console.log(`  🏷️  Descuento aplicado: ${(descuentoGlobal - 0.01) * 100}%`);
  // ❌ Retorna un valor diferente con los mismos argumentos
  return precio - descuento; // No es referentially transparent
}

// ❌ Función IMPURA: modifica el objeto que recibe (mutación in-place)
function aplicarImpuesto(orden: { items: { precio: number }[] }): void {
  // ❌ Efecto secundario: modifica el objeto original
  for (const item of orden.items) {
    item.precio = item.precio * 1.19; // Muta el objeto directamente
  }
  // ❌ No retorna nada (void) — opera por efectos secundarios
  // El "resultado" es la mutación del objeto que le pasaron
  console.log("  🧾 Impuestos aplicados (objeto mutado)");
}

// ============================================================================
// 🔬 DEMOSTRACIÓN: La transparencia referencial está ROTA
// ============================================================================
// 📖 TRANSPARENCIA REFERENCIAL: Una expresión es "referencialmente
//    transparente" si se puede reemplazar por su valor sin cambiar
//    el comportamiento del programa.
//
//    Ejemplo: si f(x) = x + 1, entonces f(5) SIEMPRE es 6.
//    Puedo reemplazar f(5) por 6 en cualquier lugar del programa.
//
//    Con side effects esto NO funciona, porque el resultado depende
//    de CUÁNDO y CUÁNTAS VECES se llama la función.
// ============================================================================

function main(): void {
  console.log("❌ MAL EJEMPLO — Programación con Side Effects");
  console.log("=".repeat(55));

  // --- Demostración 1: Estado global mutable ---
  console.log("\n📌 Problema 1: Estado global mutable");
  console.log("-".repeat(40));

  // ❌ La misma función con el mismo argumento produce resultados diferentes
  const resultado1 = agregarVenta(100); // totalVentas = 100
  const resultado2 = agregarVenta(100); // totalVentas = 200 ← ¡diferente!
  const resultado3 = agregarVenta(100); // totalVentas = 300 ← ¡diferente!

  // ❌ agregarVenta(100) retorna 100, 200, 300... no es predecible
  console.log(`\n  Resultado 1: $${resultado1}`); // 100
  console.log(`  Resultado 2: $${resultado2}`); // 200 — ¡mismo argumento, distinto resultado!
  console.log(`  Resultado 3: $${resultado3}`); // 300 — ¡imposible razonar!

  // --- Demostración 2: Descuento que cambia solo ---
  console.log("\n📌 Problema 2: Estado que muta silenciosamente");
  console.log("-".repeat(40));

  // ❌ El mismo producto tiene precios diferentes cada vez
  const precio1 = calcularPrecioConDescuento(1000); // Usa 10% descuento
  const precio2 = calcularPrecioConDescuento(1000); // Usa 11% descuento ← ¡cambió!
  const precio3 = calcularPrecioConDescuento(1000); // Usa 12% descuento ← ¡cambió otra vez!

  console.log(`\n  Precio 1 (mismo producto): $${precio1}`); // $900
  console.log(`  Precio 2 (mismo producto): $${precio2}`); // $890 — ¡diferente!
  console.log(`  Precio 3 (mismo producto): $${precio3}`); // $880 — ¡WTF!

  // --- Demostración 3: Mutación de objetos ---
  console.log("\n📌 Problema 3: Mutación de objetos (in-place)");
  console.log("-".repeat(40));

  // ❌ Creamos un objeto y lo pasamos a una función que lo muta
  const miOrden = {
    items: [
      { precio: 100 }, // Precio original: $100
      { precio: 200 }, // Precio original: $200
    ],
  };

  console.log(`  Antes: [${miOrden.items.map((i) => "$" + i.precio).join(", ")}]`);
  aplicarImpuesto(miOrden); // ❌ ¡Esta función MUTA miOrden!
  console.log(`  Después: [${miOrden.items.map((i) => "$" + i.precio.toFixed(2)).join(", ")}]`);
  // ❌ miOrden ya no tiene los valores originales — se perdieron para siempre

  // --- Resumen de problemas ---
  console.log("\n⚠️  PROBLEMAS:");
  console.log("  ❌ agregarVenta(100) retorna valores diferentes cada vez");
  console.log("  ❌ calcularPrecioConDescuento(1000) cambia el descuento global");
  console.log("  ❌ aplicarImpuesto() destruye los datos originales del objeto");
  console.log("  ❌ No puedes testear estas funciones de forma aislada");
  console.log("  ❌ No puedes razonar sobre el programa sustituyendo expresiones");
  console.log("  ❌ El orden de ejecución IMPORTA — cualquier cambio rompe todo");
}

// Ejecutamos el ejemplo
main();
