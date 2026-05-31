// ============================================================================
// ❌ MAL EJEMPLO: Procesamiento imperativo y monolítico de datos
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 15):
//    Procesar grandes cantidades de datos sin cargar todo en memoria
//    es una habilidad crítica para sistemas backend.
//
// 🚨 PROBLEMA: El enfoque imperativo tiene serios problemas:
//    - Carga TODO en memoria de una vez → crash con datos grandes
//    - Loops monolíticos: mezclan lógica + I/O + control de flujo
//    - No componibles: modificar un paso requiere reescribir todo
//    - Resource leaks: si olvidamos cerrar un recurso, se queda abierto
//    - Imposible reusar: cada variante requiere un loop nuevo
// ============================================================================

// ❌ Simulamos datos grandes (en producción serían archivos o BD)
function getLargeDataset(): string[] {
  // ❌ Genera TODOS los datos en memoria de una vez
  const data: string[] = []; // Array mutable que crece
  for (let i = 1; i <= 10000; i++) {
    data.push(`user_${i},${Math.floor(Math.random() * 100)},${Math.random() > 0.3 ? "active" : "inactive"}`);
  }
  return data; // ❌ 10,000 strings en memoria — ¿y si fueran 10 millones?
}

// ❌ Loop monolítico 1: contar usuarios activos mayores de 50
function countActiveOver50_imperative(): number {
  // ❌ Carga TODOS los datos primero
  const allData = getLargeDataset(); // Todo en memoria
  let count = 0; // ❌ Acumulador mutable

  // ❌ Loop monolítico que mezcla: parsear + filtrar + contar
  for (const line of allData) {
    const parts = line.split(",");       // Parsear CSV
    const age = parseInt(parts[1], 10);  // Extraer edad
    const status = parts[2];             // Extraer estado
    // ❌ Lógica de filtrado mezclada con el loop
    if (status === "active" && age > 50) {
      count++; // Muta acumulador
    }
  }
  return count; // ❌ Tuvo que procesar todo aunque solo quería contar
}

// ❌ Loop monolítico 2: obtener nombres de los primeros 5 usuarios inactivos
// ¡Casi idéntico al anterior pero con lógica diferente! → duplicación
function getFirst5Inactive_imperative(): string[] {
  // ❌ Carga TODOS los datos otra vez
  const allData = getLargeDataset(); // Todo en memoria OTRA VEZ
  const results: string[] = []; // ❌ Array mutable

  // ❌ Otro loop monolítico — 90% del código es idéntico al anterior
  for (const line of allData) {
    const parts = line.split(",");
    const name = parts[0];
    const status = parts[2];
    // ❌ Lógica diferente pero estructura duplicada
    if (status === "inactive") {
      results.push(name); // Muta array
      if (results.length >= 5) break; // ❌ Terminación temprana mezclada con lógica
    }
  }
  return results;
}

// ❌ Loop monolítico 3: calcular promedio de edad de activos
// ¡OTRO loop casi idéntico! Es imposible reusar el código
function averageAgeActive_imperative(): number {
  const allData = getLargeDataset(); // ❌ Carga todo OTRA VEZ
  let sumAge = 0;   // ❌ Acumulador mutable
  let count = 0;    // ❌ Otro acumulador mutable

  for (const line of allData) {
    const parts = line.split(",");
    const age = parseInt(parts[1], 10);
    const status = parts[2];
    if (status === "active") {
      sumAge += age; // ❌ Muta
      count++;       // ❌ Muta
    }
  }
  return count > 0 ? sumAge / count : 0;
}

// ============================================================================
// 🔬 DEMOSTRACIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO — Procesamiento Imperativo de Datos");
  console.log("=".repeat(55));

  console.log("\n📌 Problema 1: Todo se carga en memoria");
  console.log("-".repeat(40));
  const activeOver50 = countActiveOver50_imperative();
  console.log(`  Activos mayores de 50: ${activeOver50}`);
  console.log("  ❌ Cargó 10,000 registros en memoria para contar unos pocos");

  console.log("\n📌 Problema 2: Código duplicado entre variantes");
  console.log("-".repeat(40));
  const first5 = getFirst5Inactive_imperative();
  console.log(`  Primeros 5 inactivos: [${first5.join(", ")}]`);
  console.log("  ❌ Loop prácticamente idéntico al anterior — copy-paste");

  console.log("\n📌 Problema 3: Rango de tiempo desperdiciated ");
  console.log("-".repeat(40));
  const avgAge = averageAgeActive_imperative();
  console.log(`  Edad promedio activos: ${avgAge.toFixed(1)}`);
  console.log("  ❌ Cargó todo TRES veces — una por cada función");

  console.log("\n⚠️  PROBLEMAS:");
  console.log("  ❌ Cada función carga TODOS los datos en memoria");
  console.log("  ❌ Loops monolíticos: parsear + filtrar + acumular todo junto");
  console.log("  ❌ Código 90% duplicado entre funciones");
  console.log("  ❌ No componible: no puedes reusar 'filtrar activos' en otro contexto");
  console.log("  ❌ Con archivos: si olvidas cerrar el file handle → resource leak");
  console.log("  ❌ Escala MAL: 10 millones de registros → crash por memoria");
}

// Ejecutamos el ejemplo
main();
