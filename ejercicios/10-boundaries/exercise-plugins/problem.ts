// ============================================================================
// ❌ PROBLEMA: Sin arquitectura de Plugin - todo está acoplado
// ============================================================================
// 📖 LECCIÓN (Clean Architecture - Capítulo 17: Boundaries):
//
//    Un PLUGIN es un componente que se puede CONECTAR y DESCONECTAR
//    sin que el sistema principal sepa de su existencia.
//
//    Piensa en un NAVEGADOR WEB:
//    → Chrome no sabe que AdBlock existe
//    → Chrome define PUNTOS DE EXTENSIÓN (APIs de extensiones)
//    → AdBlock se "enchufa" a esos puntos
//    → Puedes instalar/desinstalar AdBlock sin recompilar Chrome
//
//    En Clean Architecture, las capas externas son PLUGINS de las internas:
//    → La base de datos es un PLUGIN de los Use Cases
//    → El framework web es un PLUGIN de los Use Cases
//    → El servicio de emails es un PLUGIN de los Use Cases
//    → Los Use Cases NO SABEN qué plugins están conectados
//
// 🚨 PROBLEMA: Aquí el sistema de procesamiento de pagos conoce
//    DIRECTAMENTE cada método de pago. Agregar uno nuevo requiere
//    MODIFICAR el código existente (viola Open/Closed Principle).
// ============================================================================

// ❌ El procesador de pagos CONOCE cada método directamente
class PaymentProcessor {

  // ❌ Método que procesa según el tipo de pago
  // Cada nuevo método de pago requiere MODIFICAR esta función
  processPayment(method: string, amount: number, details: any): {
    success: boolean;   // Si el pago fue exitoso
    message: string;    // Mensaje del resultado
    transactionId: string; // ID de la transacción
  } {
    console.log(`  🔄 Procesando pago de $${amount} vía ${method}...\n`);

    // ❌ Switch/if gigante que crece con cada nuevo método
    // ¿Nuevo método de pago? → agregar otro "else if" aquí
    if (method === "credit_card") {
      // ❌ Lógica de tarjeta de crédito directamente aquí
      console.log(`  💳 [Directo] Tarjeta: ${details.cardNumber}`);  // Número de tarjeta
      console.log(`  💳 [Directo] Exp: ${details.expiry}`);          // Fecha expiración
      console.log(`  💳 [Directo] CVV: ${"*".repeat(3)}`);           // CVV oculto
      // Simulamos validaciones específicas de tarjeta
      if (!details.cardNumber || details.cardNumber.length < 16) {
        return { success: false, message: "Número de tarjeta inválido", transactionId: "" };
      }
      const transactionId = `CC-${Date.now()}`; // ID de transacción de tarjeta
      console.log(`  ✅ Pago con tarjeta aprobado: ${transactionId}`);
      return { success: true, message: "Pago con tarjeta aprobado", transactionId };

    } else if (method === "paypal") {
      // ❌ Lógica de PayPal directamente aquí
      console.log(`  🅿️  [Directo] PayPal email: ${details.email}`);  // Email de PayPal
      // Simulamos validaciones específicas de PayPal
      if (!details.email || !details.email.includes("@")) {
        return { success: false, message: "Email de PayPal inválido", transactionId: "" };
      }
      const transactionId = `PP-${Date.now()}`; // ID de transacción PayPal
      console.log(`  ✅ Pago con PayPal aprobado: ${transactionId}`);
      return { success: true, message: "Pago con PayPal aprobado", transactionId };

    } else if (method === "bank_transfer") {
      // ❌ Lógica de transferencia bancaria directamente aquí
      console.log(`  🏦 [Directo] Banco: ${details.bankName}`);      // Nombre del banco
      console.log(`  🏦 [Directo] Cuenta: ${details.accountNumber}`); // Número de cuenta
      // Simulamos validaciones específicas de transferencia
      if (!details.bankName) {
        return { success: false, message: "Nombre del banco requerido", transactionId: "" };
      }
      const transactionId = `BT-${Date.now()}`; // ID de transacción bancaria
      console.log(`  ✅ Transferencia bancaria aprobada: ${transactionId}`);
      return { success: true, message: "Transferencia aprobada", transactionId };

    } else {
      // ❌ Si llega un método desconocido, no sabemos qué hacer
      return { success: false, message: `Método de pago "${method}" no soportado`, transactionId: "" };
    }
    // ❌ ¿Quieres agregar criptomonedas? → Modificar ESTE archivo
    // ❌ ¿Quieres agregar Nequi? → Modificar ESTE archivo
    // ❌ ¿Quieres agregar PSE? → Modificar ESTE archivo
    // Cada cambio puede romper los métodos existentes
  }

  // ❌ Método que lista los métodos disponibles - también hardcodeado
  getAvailableMethods(): string[] {
    return ["credit_card", "paypal", "bank_transfer"]; // Lista fija
    // ❌ Para agregar un método, hay que modificar esta lista Y el switch
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ PROBLEMA - Sin arquitectura de Plugin");
  console.log("=".repeat(55));

  // Creamos el procesador (todo hardcodeado adentro)
  const processor = new PaymentProcessor();

  // Mostramos métodos disponibles
  console.log(`\n  📋 Métodos disponibles: ${processor.getAvailableMethods().join(", ")}`);

  // CASO 1: Pago con tarjeta
  console.log("\n📋 CASO 1: Pago con tarjeta de crédito");
  console.log("-".repeat(40));
  const result1 = processor.processPayment("credit_card", 150.00, {
    cardNumber: "4111111111111111",  // Número de tarjeta Visa de prueba
    expiry: "12/25",                 // Fecha de expiración
    cvv: "123",                      // Código de seguridad
  });
  console.log(`  📤 Resultado: ${result1.message}`); // Mostramos resultado

  // CASO 2: Pago con PayPal
  console.log("\n📋 CASO 2: Pago con PayPal");
  console.log("-".repeat(40));
  const result2 = processor.processPayment("paypal", 75.50, {
    email: "carlos@mail.com",        // Email de PayPal
  });
  console.log(`  📤 Resultado: ${result2.message}`); // Mostramos resultado

  // CASO 3: Método no soportado (criptomonedas)
  console.log("\n📋 CASO 3: Intento con criptomonedas (no soportado)");
  console.log("-".repeat(40));
  const result3 = processor.processPayment("crypto", 200.00, {
    walletAddress: "0x123abc",       // Dirección de wallet
  });
  console.log(`  📤 Resultado: ${result3.message}`); // Error: no soportado

  // Resumen de problemas
  console.log("\n\n" + "=".repeat(55));
  console.log("⚠️  PROBLEMAS SIN PLUGINS:");
  console.log("=".repeat(55));
  console.log("  ❌ Switch/if gigante que crece con cada método de pago");
  console.log("  ❌ Agregar criptomonedas = MODIFICAR PaymentProcessor");
  console.log("  ❌ Modificar un método puede romper los demás");
  console.log("  ❌ No puedes agregar métodos de pago sin tocar el código core");
  console.log("  ❌ Viola el Open/Closed Principle (abierto a extensión, cerrado a modificación)");
  console.log("\n🎯 TU TAREA: Refactoriza en solution.ts para que:");
  console.log("  📗 Cada método de pago sea un PLUGIN independiente");
  console.log("  📗 Se puedan agregar nuevos métodos sin modificar el procesador");
  console.log("  📗 Se puedan conectar/desconectar plugins en runtime");
}

main();
