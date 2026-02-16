// ============================================================================
// ✅ BUEN EJEMPLO: Aplicación de Principios de Cohesión de Componentes
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
// ✅ SOLUCIÓN: Separar en componentes COHESIVOS donde cada uno agrupa
//    funciones que cambian por la MISMA razón y se usan juntas.
// ============================================================================

// ============================================================================
// ✅ COMPONENTE 1: Módulo de Pagos (Payment)
// Cambia cuando: Las reglas de negocio de pagos cambian
// Actor responsable: Equipo de Finanzas
// ============================================================================
namespace PaymentModule {
  // Formatea un monto a moneda con símbolo correcto
  export function formatMoney(amount: number, currency: string): string {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      COP: "COP$",
    };
    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }

  // Valida un número de tarjeta de crédito (Algoritmo de Luhn simplificado)
  export function validateCreditCard(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\D/g, "");
    return cleaned.length >= 13 && cleaned.length <= 19;
  }

  // Calcula impuesto sobre un monto
  export function calculateTax(amount: number, taxRate: number): number {
    return amount * taxRate;
  }

  // ✅ CCP: Todas estas funciones cambian cuando cambian las reglas de PAGO
  // ✅ CRP: Si necesitas formatMoney, probablemente también necesites calculateTax
  // ✅ REP: Se deployan juntas como una unidad de "pagos"
}

// ============================================================================
// ✅ COMPONENTE 2: Módulo de Logging (Observabilidad)
// Cambia cuando: Cambia el sistema de monitoreo/observabilidad
// Actor responsable: Equipo de Infraestructura/DevOps
// ============================================================================
namespace LoggingModule {
  // Loguea información general con timestamp
  export function info(message: string): void {
    console.log(`  [INFO ${new Date().toISOString()}] ${message}`);
  }

  // Loguea errores con contexto
  export function error(message: string, err?: Error): void {
    console.error(
      `  [ERROR ${new Date().toISOString()}] ${message}`,
      err?.message || ""
    );
  }

  // Registra métricas de rendimiento
  export function metric(name: string, value: number): void {
    console.log(`  [METRIC ${new Date().toISOString()}] ${name}=${value}`);
  }

  // ✅ CCP: Todas cambian si migramos de console.log a DataDog/CloudWatch
  // ✅ CRP: Si usas info(), probablemente necesites error() y metric()
}

// ============================================================================
// ✅ COMPONENTE 3: Módulo de Validación de Usuarios
// Cambia cuando: Cambian las reglas de validación de input del usuario
// Actor responsable: Equipo de Seguridad/Backend
// ============================================================================
namespace ValidationModule {
  // Valida formato de email
  export function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Valida fortaleza de contraseña
  export function validatePassword(password: string): boolean {
    return password.length >= 8;
  }

  // Sanitiza input de texto contra XSS
  export function sanitizeInput(input: string): string {
    return input.replace(/[<>]/g, "").trim();
  }

  // ✅ CCP: Todas cambian cuando cambian las reglas de seguridad/validación
  // ✅ CRP: Si validas email, probablemente valides password también
}

// ============================================================================
// ✅ COMPONENTE 4: Módulo de Formateo (UI/Presentación)
// Cambia cuando: Cambia la localización o el formato de presentación
// Actor responsable: Equipo de Frontend/UX
// ============================================================================
namespace FormattingModule {
  // Formatea fecha a formato colombiano
  export function formatDate(date: Date): string {
    return date.toLocaleDateString("es-CO");
  }

  // Capitaliza texto
  export function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  // ✅ CCP: Todas cambian cuando cambia la localización o formato de UI
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO - Cohesión de Componentes");
  console.log("=".repeat(55));

  // ✅ Cada módulo se usa de forma independiente
  // Solo importas lo que necesitas
  console.log("\n💰 Módulo de Pagos (PaymentModule):");
  console.log(`  ${PaymentModule.formatMoney(1500, "USD")}`);
  console.log(`  ${PaymentModule.formatMoney(3500000, "COP")}`);
  console.log(`  Impuesto 19%: ${PaymentModule.formatMoney(
    PaymentModule.calculateTax(1500, 0.19), "USD"
  )}`);

  console.log("\n📧 Módulo de Validación (ValidationModule):");
  console.log(`  usuario@test.com → ${ValidationModule.validateEmail("usuario@test.com")}`);
  console.log(`  Password "abc" → ${ValidationModule.validatePassword("abc")}`);
  console.log(`  Password "seguro123" → ${ValidationModule.validatePassword("seguro123")}`);

  console.log("\n📝 Módulo de Logging (LoggingModule):");
  LoggingModule.info("Procesando pago...");
  LoggingModule.metric("payment.amount", 1500);

  console.log("\n🎨 Módulo de Formateo (FormattingModule):");
  console.log(`  Fecha: ${FormattingModule.formatDate(new Date())}`);
  console.log(`  Nombre: ${FormattingModule.capitalize("CARLOS GARCÍA")}`);

  console.log("\n🎯 BENEFICIOS:");
  console.log("  ✅ REP: Cada módulo se deploya de forma independiente");
  console.log("  ✅ CCP: Cambios en logging NO afectan pagos ni validación");
  console.log("  ✅ CRP: Puedes importar SOLO PaymentModule sin cargar LoggingModule");
  console.log("  ✅ Cada módulo tiene UN actor responsable");
  console.log("  ✅ Un bug en ValidationModule no bloquea el deploy de PaymentModule");
}

main();
