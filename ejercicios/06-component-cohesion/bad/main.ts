// ============================================================================
// ❌ MAL EJEMPLO: Violación de Principios de Cohesión de Componentes
// ============================================================================
// 📖 PRINCIPIOS (Clean Architecture Cap. 13):
//
//    REP (Reuse/Release Equivalence): Los componentes que se reusan juntos
//    deben ser liberados (deployed) juntos.
//
//    CCP (Common Closure): Las clases que cambian por la MISMA razón
//    deben agruparse en el MISMO componente.
//
//    CRP (Common Reuse): No fuerces a los usuarios de un componente a
//    depender de cosas que NO necesitan.
//
// 🚨 PROBLEMA: Un módulo "utils" gigante donde TODO está mezclado.
//    - Funciones de pago junto con funciones de logging
//    - Si cambias la validación de email, recompilas TAMBIÉN el logger
//    - Si solo necesitas formatear moneda, cargas TODO el módulo
// ============================================================================

// ❌ EL ANTI-PATRÓN: El módulo "utils" gigante
// Todo está en un solo lugar sin cohesión
// Viola CCP: funciones que cambian por razones MUY diferentes están juntas
// Viola CRP: si importas este módulo para formatMoney, cargas TAMBIÉN el logger
namespace SuperUtils {
  // --- Funciones de PAGO ---
  // Estas cambian cuando cambian las reglas de negocio de pagos

  // Formatea un monto a moneda
  export function formatMoney(amount: number, currency: string): string {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      COP: "COP$",
    };
    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }

  // Valida un número de tarjeta de crédito
  export function validateCreditCard(cardNumber: string): boolean {
    // Algoritmo de Luhn simplificado
    const cleaned = cardNumber.replace(/\D/g, "");
    return cleaned.length >= 13 && cleaned.length <= 19;
  }

  // Calcula impuesto
  export function calculateTax(amount: number, taxRate: number): number {
    return amount * taxRate;
  }

  // --- Funciones de LOGGING ---
  // Estas cambian cuando cambia el sistema de observabilidad

  // Loguea a consola con timestamp
  export function logInfo(message: string): void {
    console.log(`  [INFO ${new Date().toISOString()}] ${message}`);
  }

  // Loguea errores
  export function logError(message: string, error?: Error): void {
    console.error(
      `  [ERROR ${new Date().toISOString()}] ${message}`,
      error?.message || ""
    );
  }

  // Loguea métricas
  export function logMetric(name: string, value: number): void {
    console.log(`  [METRIC ${new Date().toISOString()}] ${name}=${value}`);
  }

  // --- Funciones de VALIDACIÓN ---
  // Estas cambian cuando cambian las reglas de validación de usuarios

  // Valida formato de email
  export function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Valida longitud de contraseña
  export function validatePassword(password: string): boolean {
    return password.length >= 8;
  }

  // Sanitiza input de texto
  export function sanitizeInput(input: string): string {
    return input.replace(/[<>]/g, "").trim();
  }

  // --- Funciones de FORMATO ---
  // Estas cambian cuando cambia la UI o la localización

  // Formatea fecha
  export function formatDate(date: Date): string {
    return date.toLocaleDateString("es-CO");
  }

  // Capitaliza texto
  export function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO - Violación de Cohesión de Componentes");
  console.log("=".repeat(55));

  // ❌ Todo viene del mismo módulo gigante "SuperUtils"
  // Si solo necesitas formatMoney, igual cargas el logger y validaciones
  console.log("\n💰 Formateando dinero:");
  console.log(`  ${SuperUtils.formatMoney(1500, "USD")}`);
  console.log(`  ${SuperUtils.formatMoney(3500000, "COP")}`);

  console.log("\n📧 Validando email:");
  console.log(`  usuario@test.com → ${SuperUtils.validateEmail("usuario@test.com")}`);

  console.log("\n📝 Logging:");
  SuperUtils.logInfo("Procesando pago...");
  SuperUtils.logMetric("payment.amount", 1500);

  console.log("\n💳 Validando tarjeta:");
  console.log(`  4532015112830366 → ${SuperUtils.validateCreditCard("4532015112830366")}`);

  console.log("\n⚠️  PROBLEMAS:");
  console.log("  ❌ Viola REP: Si cambias validateEmail, re-deployeas formatMoney");
  console.log("  ❌ Viola CCP: Logging y pagos cambian por razones MUY diferentes");
  console.log("  ❌ Viola CRP: Para usar formatMoney, cargas 12+ funciones innecesarias");
  console.log("  ❌ El módulo tiene 4+ 'razones para cambiar' (actores diferentes)");
  console.log("  ❌ Un bug en sanitizeInput() puede bloquear el deploy de formatMoney()");
}

main();
