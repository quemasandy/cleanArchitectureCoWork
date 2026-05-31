// ============================================================================
// ❌ MAL EJEMPLO: Callbacks anidados y secuenciación manual
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 11):
//    Un MONAD es un Functor que además tiene flatMap (también llamado
//    bind o chain). flatMap permite SECUENCIAR operaciones donde cada
//    paso depende del resultado del anterior.
//
// 🚨 PROBLEMA: Sin flatMap, secuenciar operaciones que pueden fallar
//    requiere:
//    - if/else anidados (pirámide de la perdición)
//    - Extraer valores manualmente de cada contenedor
//    - Duplicar la lógica de propagación de errores
//    - Código no componible ni reutilizable
// ============================================================================

// ❌ Tipos simples para el ejemplo
interface UserData {
  id: string;      // ID del usuario
  name: string;    // Nombre
  addressId: string; // ID de la dirección
}

interface AddressData {
  id: string;     // ID de la dirección
  city: string;   // Ciudad
  zipCode: string; // Código postal
}

// ❌ "Bases de datos" simuladas
const usersDB: Record<string, UserData> = {
  "u1": { id: "u1", name: "Ana", addressId: "a1" },
  "u2": { id: "u2", name: "Bob", addressId: "a99" }, // ❌ dirección no existe
};

const addressesDB: Record<string, AddressData> = {
  "a1": { id: "a1", city: "Bogotá", zipCode: "110111" },
};

// ❌ Sequencia manual con if/else anidados — "pirámide de la perdición"
function getUserCity_manual(userId: string): string | null {
  // ❌ Paso 1: buscar usuario
  const user = usersDB[userId]; // Puede ser undefined
  if (!user) {
    // ❌ Manejo manual del error — hay que repetir esto en cada paso
    return null;
  }
  // ❌ Paso 2: buscar dirección (depende del resultado del paso 1)
  const address = addressesDB[user.addressId]; // Puede ser undefined
  if (!address) {
    // ❌ OTRO if/else manual — misma lógica de propagación de null
    return null;
  }
  // ❌ Paso 3: extraer la ciudad (depende del resultado del paso 2)
  return address.city;
}

// ❌ Versión con callbacks — cada paso anidado dentro del anterior
function getUserCityAsync_manual(
  userId: string,
  callback: (result: string | null) => void
): void {
  // ❌ Callback 1: buscar usuario
  setTimeout(() => {
    const user = usersDB[userId]; // Simula async
    if (!user) {
      callback(null); // ❌ Propagar error manualmente
      return;
    }
    // ❌ Callback 2: buscar dirección (ANIDADO)
    setTimeout(() => {
      const address = addressesDB[user.addressId]; // Depende del paso 1
      if (!address) {
        callback(null); // ❌ Propagar error manualmente OTRA VEZ
        return;
      }
      // ❌ Callback 3: resultado (DOBLE ANIDAMIENTO)
      callback(address.city); // ❌ 3 niveles de profundidad
    }, 10);
  }, 10);
}

// ❌ Componer múltiples operaciones — requiere extraer y re-empaquetar
function processMultipleUsers_manual(userIds: string[]): (string | null)[] {
  // ❌ Iterar y aplicar la lógica manual a cada uno
  const results: (string | null)[] = []; // Array mutable
  for (const id of userIds) {
    const city = getUserCity_manual(id); // ❌ Cada llamada repite el if/else
    results.push(city); // ❌ null mezclado con strings
  }
  return results; // ❌ No hay type safety — null y strings mezclados
}

// ============================================================================
// 🔬 DEMOSTRACIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO — Secuenciación Manual sin Monads");
  console.log("=".repeat(55));

  console.log("\n📌 Problema 1: Pirámide de if/else");
  console.log("-".repeat(40));

  const city1 = getUserCity_manual("u1"); // "Bogotá"
  const city2 = getUserCity_manual("u2"); // null (dirección no existe)
  const city3 = getUserCity_manual("u99"); // null (usuario no existe)

  console.log(`  Usuario u1: ${city1}`);   // Bogotá
  console.log(`  Usuario u2: ${city2}`);   // null
  console.log(`  Usuario u99: ${city3}`);  // null
  console.log("  ❌ No sabemos POR QUÉ retornó null — ¿usuario? ¿dirección?");

  console.log("\n📌 Problema 2: Resultados mezclados");
  console.log("-".repeat(40));

  const results = processMultipleUsers_manual(["u1", "u2", "u99"]);
  console.log(`  Resultados: [${results.map((r) => r ?? "null").join(", ")}]`);
  console.log("  ❌ null y strings mezclados — no type-safe");

  console.log("\n📌 Problema 3: Callback hell");
  console.log("-".repeat(40));
  console.log("  getUserCityAsync tiene 3 niveles de anidamiento");
  console.log("  Cada callback repite: if (!value) { callback(null); return; }");
  console.log("  ❌ Imposible componer, reusar o testear");

  getUserCityAsync_manual("u1", (result) => {
    console.log(`  Async result: ${result}`);

    console.log("\n⚠️  PROBLEMAS:");
    console.log("  ❌ if/else anidados para cada paso — pirámide del mal");
    console.log("  ❌ Propagación de null manual en CADA paso");
    console.log("  ❌ No sabemos QUÉ paso falló — solo vemos null");
    console.log("  ❌ Callbacks anidados para operaciones async");
    console.log("  ❌ No componible: agregar un paso requiere otro nivel de nesting");
  });
}

// Ejecutamos el ejemplo
main();
