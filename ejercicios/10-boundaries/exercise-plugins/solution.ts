// ============================================================================
// ✅ SOLUCIÓN: Arquitectura de Plugin - extensible sin modificar
// ============================================================================
// 📖 LECCIÓN (Clean Architecture - Capítulo 17: Boundaries):
//
//    Un PLUGIN es un componente que:
//    1. Cumple un CONTRATO definido por el sistema (interface)
//    2. Se puede CONECTAR y DESCONECTAR sin tocar el sistema
//    3. El sistema NO SABE que el plugin existe hasta que lo conectas
//
//    Piensa en un NAVEGADOR WEB:
//    → Chrome define: "Una extensión debe tener manifest.json con estos campos"
//    → AdBlock implementa ese manifiesto → Chrome lo acepta como extensión
//    → Puedes instalar/desinstalar AdBlock sin recompilar Chrome
//    → Chrome funciona perfectamente con 0 extensiones o con 50
//
//    En Clean Architecture:
//    → El CORE define interfaces (contratos)
//    → Las capas externas IMPLEMENTAN esas interfaces
//    → Las implementaciones son PLUGINS del core
//    → Puedes enchufar/desenchufar sin modificar el core
//
//    Esto cumple el Open/Closed Principle:
//    → ABIERTO para extensión (agregar plugins)
//    → CERRADO para modificación (no tocas el código existente)
// ============================================================================

// ============================================================================
// 🟢 PASO 1: El CONTRATO del Plugin (Interface)
// ============================================================================
// 📖 Esta interface es como el "manifest.json" de Chrome.
//    Cualquier método de pago que quiera "enchufarse" al sistema
//    debe implementar EXACTAMENTE estos métodos.
//    El sistema SOLO conoce esta interface, nada más.
// ============================================================================

// ✅ Contrato que todo plugin de pago debe cumplir
interface PaymentPlugin {
  // El nombre identificador del método de pago (ej: "credit_card", "crypto")
  readonly name: string;

  // Descripción legible para el usuario (ej: "Tarjeta de Crédito")
  readonly displayName: string;

  // Método para validar que los datos del pago son correctos
  validate(details: any): { valid: boolean; error?: string };

  // Método para procesar el pago y retornar el resultado
  process(amount: number, details: any): {
    success: boolean;      // Si el pago fue exitoso
    transactionId: string; // ID de la transacción
    message: string;       // Mensaje del resultado
  };
}

// ============================================================================
// 🟡 PASO 2: El SISTEMA CORE (no conoce ningún plugin)
// ============================================================================
// 📖 PaymentProcessor ya NO tiene un switch/if gigante.
//    Solo sabe que existen "plugins" que cumplen el contrato.
//    Puede funcionar con 0 plugins, 3 plugins, o 100 plugins.
//    Agregar un nuevo método de pago = declarar una nueva clase.
//    CERO modificaciones al procesador.
// ============================================================================

// ✅ Procesador de pagos que funciona con PLUGINS
class PaymentProcessor {
  // Mapa de plugins registrados: nombre → plugin
  private plugins: Map<string, PaymentPlugin> = new Map();

  // ✅ Método para REGISTRAR (enchufar) un plugin
  // El sistema no sabe qué plugin está recibiendo, solo que cumple el contrato
  register(plugin: PaymentPlugin): void {
    this.plugins.set(plugin.name, plugin); // Guardamos por nombre
    console.log(`  🔌 Plugin registrado: ${plugin.displayName} (${plugin.name})`);
  }

  // ✅ Método para DESREGISTRAR (desenchufar) un plugin
  // Se puede quitar un método de pago sin tocar nada más
  unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName); // Buscamos el plugin
    if (plugin) {
      this.plugins.delete(pluginName); // Lo removemos del mapa
      console.log(`  🔌 Plugin removido: ${plugin.displayName} (${pluginName})`);
    }
  }

  // ✅ Listar métodos disponibles - se genera automáticamente de los plugins
  // No hay lista hardcodeada, se lee del mapa de plugins registrados
  getAvailableMethods(): { name: string; displayName: string }[] {
    return Array.from(this.plugins.values()).map(p => ({
      name: p.name,             // Nombre técnico del plugin
      displayName: p.displayName // Nombre legible del plugin
    }));
  }

  // ✅ Procesar pago delegando al plugin correcto
  // El procesador NO sabe CÓMO se procesa cada tipo de pago
  processPayment(method: string, amount: number, details: any): {
    success: boolean;      // Si el pago fue exitoso
    message: string;       // Mensaje del resultado
    transactionId: string; // ID de la transacción
  } {
    console.log(`  🔄 Procesando pago de $${amount} vía ${method}...\n`);

    // ✅ Buscamos el plugin por nombre
    const plugin = this.plugins.get(method); // Buscamos en el mapa
    if (!plugin) {
      // Si no hay plugin para ese método, informamos
      return {
        success: false,
        message: `Método "${method}" no registrado. Disponibles: ${this.getAvailableMethods().map(m => m.name).join(", ")}`,
        transactionId: "",
      };
    }

    // ✅ PASO A: Validar (delegamos al plugin)
    // El plugin sabe cómo validar SUS propios datos
    const validation = plugin.validate(details); // El plugin valida
    if (!validation.valid) {
      return {
        success: false,
        message: `Validación fallida: ${validation.error}`,
        transactionId: "",
      };
    }

    // ✅ PASO B: Procesar (delegamos al plugin)
    // El plugin sabe cómo procesar SU tipo de pago
    const result = plugin.process(amount, details); // El plugin procesa
    return result; // Retornamos el resultado del plugin
  }
}

// ============================================================================
// 🟠 PASO 3: PLUGINS (componentes enchufables)
// ============================================================================
// 📖 Cada plugin es una clase independiente que implementa PaymentPlugin.
//    Son archivos separados que NO conocen al procesador.
//    El procesador NO conoce a los plugins.
//    Solo se encuentran a través del CONTRATO (interface).
// ============================================================================

// ✅ PLUGIN 1: Tarjeta de Crédito
class CreditCardPlugin implements PaymentPlugin {
  readonly name = "credit_card";               // Identificador técnico
  readonly displayName = "Tarjeta de Crédito"; // Nombre para el usuario

  // Validación específica de tarjeta de crédito
  validate(details: any): { valid: boolean; error?: string } {
    if (!details.cardNumber || details.cardNumber.length < 16) { // Número de 16 dígitos
      return { valid: false, error: "Número de tarjeta debe tener 16 dígitos" };
    }
    if (!details.expiry) { // Fecha de expiración requerida
      return { valid: false, error: "Fecha de expiración requerida" };
    }
    if (!details.cvv) { // CVV requerido
      return { valid: false, error: "CVV requerido" };
    }
    return { valid: true }; // Todo validado
  }

  // Procesamiento específico de tarjeta de crédito
  process(amount: number, details: any): { success: boolean; transactionId: string; message: string } {
    console.log(`  💳 [Plugin CreditCard] Tarjeta: ****${details.cardNumber.slice(-4)}`); // Últimos 4 dígitos
    console.log(`  💳 [Plugin CreditCard] Monto: $${amount}`);                             // Monto a cobrar
    const transactionId = `CC-${Date.now()}`; // Generamos ID de transacción
    return { success: true, transactionId, message: `Tarjeta aprobada: ${transactionId}` };
  }
}

// ✅ PLUGIN 2: PayPal
class PayPalPlugin implements PaymentPlugin {
  readonly name = "paypal";      // Identificador técnico
  readonly displayName = "PayPal"; // Nombre para el usuario

  // Validación específica de PayPal
  validate(details: any): { valid: boolean; error?: string } {
    if (!details.email || !details.email.includes("@")) { // Email válido requerido
      return { valid: false, error: "Email de PayPal inválido" };
    }
    return { valid: true }; // Email válido
  }

  // Procesamiento específico de PayPal
  process(amount: number, details: any): { success: boolean; transactionId: string; message: string } {
    console.log(`  🅿️  [Plugin PayPal] Email: ${details.email}`); // Email de PayPal
    console.log(`  🅿️  [Plugin PayPal] Monto: $${amount}`);       // Monto a cobrar
    const transactionId = `PP-${Date.now()}`; // Generamos ID de transacción
    return { success: true, transactionId, message: `PayPal aprobado: ${transactionId}` };
  }
}

// ✅ PLUGIN 3: Transferencia Bancaria
class BankTransferPlugin implements PaymentPlugin {
  readonly name = "bank_transfer";               // Identificador técnico
  readonly displayName = "Transferencia Bancaria"; // Nombre para el usuario

  // Validación específica de transferencia bancaria
  validate(details: any): { valid: boolean; error?: string } {
    if (!details.bankName) { // Nombre del banco requerido
      return { valid: false, error: "Nombre del banco requerido" };
    }
    if (!details.accountNumber) { // Número de cuenta requerido
      return { valid: false, error: "Número de cuenta requerido" };
    }
    return { valid: true }; // Datos bancarios válidos
  }

  // Procesamiento específico de transferencia
  process(amount: number, details: any): { success: boolean; transactionId: string; message: string } {
    console.log(`  🏦 [Plugin BankTransfer] Banco: ${details.bankName}`);       // Banco
    console.log(`  🏦 [Plugin BankTransfer] Cuenta: ${details.accountNumber}`); // Cuenta
    console.log(`  🏦 [Plugin BankTransfer] Monto: $${amount}`);               // Monto
    const transactionId = `BT-${Date.now()}`; // Generamos ID de transacción
    return { success: true, transactionId, message: `Transferencia aprobada: ${transactionId}` };
  }
}

// ✅ PLUGIN 4: ¡Criptomonedas! - NUEVO, sin modificar NADA del procesador
// Este plugin NO existía antes. Lo creamos como un archivo nuevo.
// El procesador NO sabe que existe hasta que lo enchufamos.
class CryptoPlugin implements PaymentPlugin {
  readonly name = "crypto";           // Identificador técnico
  readonly displayName = "Criptomonedas"; // Nombre para el usuario

  // Validación específica de criptomonedas
  validate(details: any): { valid: boolean; error?: string } {
    if (!details.walletAddress) { // Dirección de wallet requerida
      return { valid: false, error: "Dirección de wallet requerida" };
    }
    if (!details.currency) { // Criptomoneda requerida (BTC, ETH, etc.)
      return { valid: false, error: "Debe especificar la criptomoneda (BTC, ETH, etc.)" };
    }
    return { valid: true }; // Datos de crypto válidos
  }

  // Procesamiento específico de criptomonedas
  process(amount: number, details: any): { success: boolean; transactionId: string; message: string } {
    console.log(`  🪙 [Plugin Crypto] Wallet: ${details.walletAddress}`); // Wallet
    console.log(`  🪙 [Plugin Crypto] Moneda: ${details.currency}`);      // Criptomoneda
    console.log(`  🪙 [Plugin Crypto] Monto: $${amount}`);               // Monto en USD
    const transactionId = `CRYPTO-${Date.now()}`; // Generamos ID de transacción
    return { success: true, transactionId, message: `Pago crypto aprobado: ${transactionId}` };
  }
}

// ✅ PLUGIN 5: Nequi (Colombia) - ¡Otro plugin más! Sin tocar el procesador
class NequiPlugin implements PaymentPlugin {
  readonly name = "nequi";     // Identificador técnico
  readonly displayName = "Nequi"; // Nombre para el usuario

  // Validación específica de Nequi
  validate(details: any): { valid: boolean; error?: string } {
    if (!details.phoneNumber) { // Número de celular requerido
      return { valid: false, error: "Número de celular requerido para Nequi" };
    }
    return { valid: true }; // Datos de Nequi válidos
  }

  // Procesamiento específico de Nequi
  process(amount: number, details: any): { success: boolean; transactionId: string; message: string } {
    console.log(`  📱 [Plugin Nequi] Celular: ${details.phoneNumber}`); // Celular
    console.log(`  📱 [Plugin Nequi] Monto: $${amount}`);              // Monto
    const transactionId = `NQ-${Date.now()}`; // Generamos ID de transacción
    return { success: true, transactionId, message: `Pago Nequi aprobado: ${transactionId}` };
  }
}

// ============================================================================
// 🏃 EJECUCIÓN - Demostración del poder de los plugins
// ============================================================================
function main(): void {
  console.log("✅ SOLUCIÓN - Arquitectura de Plugin");
  console.log("=".repeat(55));

  // ✅ Creamos el procesador VACÍO - no conoce ningún método de pago
  const processor = new PaymentProcessor();

  // ============================================================================
  // FASE 1: Registramos los plugins básicos
  // ============================================================================
  console.log("\n📋 FASE 1: Registrando plugins básicos");
  console.log("-".repeat(40));
  processor.register(new CreditCardPlugin());   // Enchufamos tarjeta de crédito
  processor.register(new PayPalPlugin());        // Enchufamos PayPal
  processor.register(new BankTransferPlugin());  // Enchufamos transferencia bancaria

  // Mostramos métodos disponibles (se genera del mapa de plugins)
  const methods = processor.getAvailableMethods(); // Lista dinámica
  console.log(`\n  📋 Métodos disponibles: ${methods.map(m => m.displayName).join(", ")}`);

  // Procesamos un pago con tarjeta
  console.log("\n  🛒 Pagando con tarjeta de crédito:");
  const result1 = processor.processPayment("credit_card", 150.00, {
    cardNumber: "4111111111111111", // Número de tarjeta
    expiry: "12/25",                // Expiración
    cvv: "123",                     // CVV
  });
  console.log(`  📤 ${result1.message}`); // Mostramos resultado

  // ============================================================================
  // FASE 2: ¡Agregamos criptomonedas SIN modificar el procesador!
  // ============================================================================
  console.log("\n\n📋 FASE 2: ¡Agregando criptomonedas (nuevo plugin)!");
  console.log("-".repeat(40));
  processor.register(new CryptoPlugin()); // ✅ Solo enchufamos, no modificamos nada

  // Ahora crypto funciona automáticamente
  console.log("\n  🛒 Pagando con criptomonedas:");
  const result2 = processor.processPayment("crypto", 200.00, {
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38", // Wallet Ethereum
    currency: "ETH",                                               // Ethereum
  });
  console.log(`  📤 ${result2.message}`); // Mostramos resultado

  // ============================================================================
  // FASE 3: Agregamos Nequi (pago colombiano)
  // ============================================================================
  console.log("\n\n📋 FASE 3: ¡Agregando Nequi (otro plugin)!");
  console.log("-".repeat(40));
  processor.register(new NequiPlugin()); // ✅ Otro plugin más, cero modificaciones

  console.log("\n  🛒 Pagando con Nequi:");
  const result3 = processor.processPayment("nequi", 50000, {
    phoneNumber: "+57 300 123 4567", // Celular colombiano
  });
  console.log(`  📤 ${result3.message}`); // Mostramos resultado

  // Mostramos todos los métodos disponibles ahora
  const allMethods = processor.getAvailableMethods();
  console.log(`\n  📋 Métodos disponibles ahora: ${allMethods.map(m => m.displayName).join(", ")}`);

  // ============================================================================
  // FASE 4: Desconectamos PayPal (sin tocar nada más)
  // ============================================================================
  console.log("\n\n📋 FASE 4: Desconectando PayPal");
  console.log("-".repeat(40));
  processor.unregister("paypal"); // ✅ Desenchufamos PayPal

  // Intentamos pagar con PayPal (ya no está disponible)
  console.log("\n  🛒 Intentando pagar con PayPal (desconectado):");
  const result4 = processor.processPayment("paypal", 75.50, {
    email: "carlos@mail.com",
  });
  console.log(`  📤 ${result4.message}`); // "No registrado"

  // Métodos finales
  const finalMethods = processor.getAvailableMethods();
  console.log(`\n  📋 Métodos finales: ${finalMethods.map(m => m.displayName).join(", ")}`);

  // ============================================================================
  // 📖 RESUMEN
  // ============================================================================
  console.log("\n\n" + "=".repeat(55));
  console.log("📖 RESUMEN: ¿QUÉ ES UN PLUGIN?");
  console.log("=".repeat(55));
  console.log("\n  🌐 ANALOGÍA DEL NAVEGADOR:");
  console.log("     • Chrome = PaymentProcessor (el sistema core)");
  console.log("     • manifest.json = PaymentPlugin interface (el contrato)");
  console.log("     • AdBlock = CreditCardPlugin (un plugin concreto)");
  console.log("     • Chrome Web Store = register() (donde se enchufan)");
  console.log("\n  ✅ CON arquitectura de plugin:");
  console.log("     • Agregar Nequi = crear NequiPlugin + register() (0 cambios al core)");
  console.log("     • Quitar PayPal = unregister('paypal') (0 cambios al core)");
  console.log("     • Cada plugin se desarrolla y testea POR SEPARADO");
  console.log("     • El procesador funciona con 0 plugins o con 100");
  console.log("\n  ❌ SIN plugins (switch/if):");
  console.log("     • Agregar Nequi = MODIFICAR el switch gigante");
  console.log("     • Quitar PayPal = BORRAR código del switch (riesgo de romper)");
  console.log("     • Todo está en un solo archivo monolítico");
  console.log("\n  💡 PRINCIPIO: Open/Closed (Abierto/Cerrado)");
  console.log("     → ABIERTO para extensión: register(new NuevoPlugin())");
  console.log("     → CERRADO para modificación: PaymentProcessor nunca cambia");
}

// Ejecutamos el programa principal
main();
