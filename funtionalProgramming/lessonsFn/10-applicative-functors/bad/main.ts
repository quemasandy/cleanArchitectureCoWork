// ============================================================================
// ❌ MAL EJEMPLO: Validación secuencial que se detiene en el primer error
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 12):
//    Los Applicative Functors son MENOS poderosos que los Monads,
//    pero MÁS generales. La diferencia clave:
//    - Monad (flatMap): cada paso DEPENDE del anterior → secuencial
//    - Applicative (map2): los pasos son INDEPENDIENTES → paralelo
//
//    Esto es crucial para VALIDACIÓN: si validamos nombre, email y edad
//    de forma independiente, queremos ver TODOS los errores a la vez,
//    no detenernos en el primero.
//
// 🚨 PROBLEMA: Con validación secuencial (monádica):
//    - Se detiene en el PRIMER error
//    - El usuario corrige uno, envía, ve el siguiente, corrige, envía...
//    - Experiencia horrible — especialmente en formularios
// ============================================================================

// ❌ Validación secuencial con early return — se detiene en el primer error
function validateUserForm(input: {
  name: string;
  email: string;
  age: string;
}): { success: boolean; errors: string[]; data?: any } {
  const errors: string[] = []; // ❌ Solo acumula el PRIMER error

  // ❌ Paso 1: Validar nombre — si falla, PARA AQUÍ
  if (!input.name || input.name.trim().length === 0) {
    return { success: false, errors: ["El nombre es obligatorio"] }; // ❌ Se detiene
  }
  if (input.name.length < 2) {
    return { success: false, errors: ["El nombre debe tener al menos 2 caracteres"] };
  }

  // ❌ Paso 2: Validar email — SOLO se ejecuta si el nombre pasó
  if (!input.email || !input.email.includes("@")) {
    return { success: false, errors: ["El email debe contener @"] }; // ❌ Se detiene
  }

  // ❌ Paso 3: Validar edad — SOLO se ejecuta si nombre Y email pasaron
  const age = parseInt(input.age, 10);
  if (isNaN(age)) {
    return { success: false, errors: ["La edad debe ser un número"] }; // ❌ Se detiene
  }
  if (age < 0 || age > 150) {
    return { success: false, errors: ["La edad debe estar entre 0 y 150"] };
  }

  return {
    success: true,
    data: { name: input.name.trim(), email: input.email, age },
  };
}

// ============================================================================
// 🔬 DEMOSTRACIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO — Validación Secuencial (se detiene en el primero)");
  console.log("=".repeat(55));

  // ❌ Formulario con TODOS los campos inválidos
  console.log("\n📌 Problema: El usuario envía un formulario con 3 errores");
  console.log("-".repeat(40));

  const badForm = { name: "", email: "no-email", age: "abc" };

  // ❌ Intento 1 — Solo ve el primer error
  const result1 = validateUserForm(badForm);
  console.log(`  Intento 1: Errores: [${result1.errors.join(", ")}]`);
  console.log("  ❌ Solo ve: 'nombre obligatorio' — no sabe del email ni la edad");

  // ❌ Intento 2 — Corrige nombre, ve el siguiente error
  const result2 = validateUserForm({ ...badForm, name: "Ana" });
  console.log(`\n  Intento 2 (nombre corregido): Errores: [${result2.errors.join(", ")}]`);
  console.log("  ❌ Ahora ve: 'email debe contener @' — aún no sabe de la edad");

  // ❌ Intento 3 — Corrige email, ve el último error
  const result3 = validateUserForm({ ...badForm, name: "Ana", email: "ana@test.com" });
  console.log(`\n  Intento 3 (email corregido): Errores: [${result3.errors.join(", ")}]`);
  console.log("  ❌ Ahora ve: 'edad debe ser número' — 3 intentos para 3 errores!");

  // ❌ Intento 4 — Finalmente todo correcto
  const result4 = validateUserForm({ name: "Ana", email: "ana@test.com", age: "28" });
  console.log(`\n  Intento 4 (todo correcto): Éxito: ${result4.success}`);

  console.log("\n⚠️  PROBLEMAS:");
  console.log("  ❌ 4 intentos para corregir 3 errores — frustración del usuario");
  console.log("  ❌ Cada error se revela de uno en uno (secuencial)");
  console.log("  ❌ El usuario NO puede ver la imagen completa de sus errores");
  console.log("  ❌ Las validaciones son INDEPENDIENTES pero se ejecutan secuencialmente");
  console.log("  ❌ Peor UX posible en formularios");
}

// Ejecutamos el ejemplo
main();
