// ============================================================================
// ❌ MAL EJEMPLO: Confusión sobre la DIRECCIÓN de sustitución en LSP
// ============================================================================
//
// 🧠 LA CONFUSIÓN COMÚN:
//    "¿La clase padre sustituye a las hijas? ¿O las hijas sustituyen al padre?"
//
//    Mucha gente piensa que el PADRE debe poder sustituir a los HIJOS.
//    Pero eso está AL REVÉS. 
//
// 📖 LSP DICE: "Las clases HIJAS deben poder SUSTITUIR a la clase PADRE"
//
//    ¿Por qué? Porque cuando escribes código que espera un tipo PADRE,
//    cualquier HIJO que le pases debe funcionar IGUAL DE BIEN.
//
// 🔑 TU DUDA: "Si las hijas tienen menos componentes, ¿cómo sustituyen al padre?"
//    ¡Exacto! Ese ES el problema cuando violas LSP.
//    Si un hijo NO puede hacer todo lo que el padre promete, NO puede sustituirlo.
//    Y ESO es una violación de LSP.
//
// En este ejemplo veremos QUÉ PASA cuando un hijo no puede sustituir al padre.
// ============================================================================

// ============================================================================
// 📦 Escenario: Sistema de Procesamiento de Pagos
// ============================================================================

// La clase padre define el contrato: todo "medio de pago" puede hacer estas cosas
class PaymentMethod {
  // Propiedad que identifica al dueño del medio de pago
  constructor(public ownerName: string) { }

  // Contrato 1: Todos los medios de pago pueden cobrar un monto
  charge(amount: number): string {
    return `Cobrando $${amount} a ${this.ownerName}`;
  }

  // Contrato 2: Todos los medios de pago pueden hacer reembolsos
  refund(amount: number): string {
    return `Reembolsando $${amount} a ${this.ownerName}`;
  }

  // Contrato 3: Todos los medios de pago tienen un límite
  getLimit(): number {
    return 10000; // Límite por defecto
  }
}

// ============================================================================
// ✅ CreditCard cumple TODOS los contratos del padre — puede sustituirlo
// ============================================================================
class CreditCard extends PaymentMethod {
  // Propiedad adicional específica de tarjeta de crédito
  private creditLimit: number;

  constructor(ownerName: string, creditLimit: number) {
    // Llama al constructor del padre para establecer el nombre
    super(ownerName);
    // Establece el límite de crédito propio
    this.creditLimit = creditLimit;
  }

  // ✅ Cumple contrato 1: puede cobrar
  charge(amount: number): string {
    return `💳 Cobrando $${amount} a la tarjeta de ${this.ownerName}`;
  }

  // ✅ Cumple contrato 2: puede reembolsar
  refund(amount: number): string {
    return `💳 Reembolsando $${amount} a la tarjeta de ${this.ownerName}`;
  }

  // ✅ Cumple contrato 3: tiene un límite definido
  getLimit(): number {
    return this.creditLimit;
  }
}

// ============================================================================
// ❌ GiftCard VIOLA LSP: No puede hacer reembolsos
// ============================================================================
// La clase hija NO cumple un contrato del padre.
// Cuando alguien espera un PaymentMethod y recibe un GiftCard, el programa se rompe.
class GiftCard extends PaymentMethod {
  // Propiedad que almacena el saldo disponible de la tarjeta de regalo
  private balance: number;

  constructor(balance: number) {
    // Las gift cards no tienen "dueño" en el sentido tradicional
    super("Gift Card Anónima");
    // Establece el saldo inicial
    this.balance = balance;
  }

  // ✅ Cumple contrato 1: puede cobrar
  charge(amount: number): string {
    // Verifica si hay saldo suficiente antes de cobrar
    if (amount > this.balance) {
      return `🎁 Saldo insuficiente en gift card. Saldo: $${this.balance}`;
    }
    // Descuenta el monto del saldo
    this.balance -= amount;
    return `🎁 Cobrando $${amount} de gift card. Saldo restante: $${this.balance}`;
  }

  // ❌ VIOLA CONTRATO 2: ¡No puede hacer reembolsos!
  // 🚨 El padre PROMETIÓ que refund() funciona, pero el hijo dice "no puedo"
  // 🧠 AQUÍ ESTÁ TU RESPUESTA: El hijo NO puede sustituir al padre
  //    porque le FALTA una capacidad que el padre prometió
  refund(amount: number): string {
    // 🚨 Lanza un error — cualquier código que confíe en PaymentMethod se rompe
    throw new Error("❌ Las gift cards NO permiten reembolsos");
  }

  // ✅ Cumple contrato 3: tiene un límite (su saldo)
  getLimit(): number {
    return this.balance;
  }
}

// ============================================================================
// ❌ CryptoWallet VIOLA LSP: Cambia el comportamiento esperado de getLimit()
// ============================================================================
// Otro caso sutil: el hijo "técnicamente" tiene el método, pero su
// comportamiento es tan diferente que rompe las expectativas.
class CryptoWallet extends PaymentMethod {
  constructor(ownerName: string) {
    // Llama al constructor del padre
    super(ownerName);
  }

  // ✅ Cumple contrato 1: puede cobrar
  charge(amount: number): string {
    return `🪙 Cobrando $${amount} en crypto de ${this.ownerName}`;
  }

  // ✅ Cumple contrato 2: puede reembolsar
  refund(amount: number): string {
    return `🪙 Reembolsando $${amount} en crypto a ${this.ownerName}`;
  }

  // ❌ VIOLA CONTRATO 3: retorna -1 (un "no tengo límite")
  // 🚨 El código que usa getLimit() espera un número POSITIVO
  //    Retornar -1 rompe la lógica que depende de este valor
  getLimit(): number {
    // -1 como "sin límite" es una convención inventada que rompe expectativas
    return -1;
  }
}

// ============================================================================
// 🏭 Función que CONFÍA en el contrato de PaymentMethod
// ============================================================================
// Esta función espera que CUALQUIER PaymentMethod:
//   1. Pueda cobrar (charge)
//   2. Pueda reembolsar (refund)  
//   3. Tenga un límite numérico positivo (getLimit)
function processOrder(payment: PaymentMethod, amount: number): void {
  // Paso 1: Verificar el límite antes de cobrar
  const limit = payment.getLimit();

  // 🚨 CryptoWallet retorna -1, esta comparación se rompe
  if (amount > limit) {
    console.log(`  ⛔ Monto $${amount} excede el límite de $${limit}`);
    return;
  }

  // Paso 2: Cobrar el monto
  console.log(`  ${payment.charge(amount)}`);

  // Paso 3: Simular un reembolso parcial (política de la tienda)
  const refundAmount = amount * 0.1; // 10% de cashback
  try {
    // 🚨 GiftCard lanza un ERROR aquí — rompe todo el flujo
    console.log(`  ${payment.refund(refundAmount)}`);
  } catch (error) {
    // 🚨 Tuvimos que agregar try/catch POR CULPA de la violación de LSP
    console.log(`  💥 ERROR: ${(error as Error).message}`);
  }
}

// ============================================================================
// 🏃 EJECUCIÓN: Demostrando el problema
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO — Confusión sobre la dirección de LSP");
  console.log("=".repeat(55));

  // Explicación conceptual directa
  console.log("\n🧠 LA PREGUNTA CLAVE:");
  console.log("   ¿El PADRE sustituye a los HIJOS? ❌ NO");
  console.log("   ¿Los HIJOS sustituyen al PADRE? ✅ SÍ");
  console.log("\n   LSP dice: donde esperas un PADRE, debes poder poner un HIJO");
  console.log("   y TODO debe seguir funcionando igual.\n");

  // --- Caso 1: CreditCard sustituye a PaymentMethod (FUNCIONA) ---
  console.log("─".repeat(55));
  console.log("1️⃣  CreditCard sustituye a PaymentMethod:");
  // Creamos una CreditCard pero la usamos COMO PaymentMethod
  const creditCard: PaymentMethod = new CreditCard("Ana García", 5000);
  // ✅ processOrder espera PaymentMethod, le damos CreditCard, FUNCIONA
  processOrder(creditCard, 200);

  // --- Caso 2: GiftCard sustituye a PaymentMethod (SE ROMPE) ---
  console.log("\n" + "─".repeat(55));
  console.log("2️⃣  GiftCard sustituye a PaymentMethod:");
  // Creamos una GiftCard pero la usamos COMO PaymentMethod
  const giftCard: PaymentMethod = new GiftCard(500);
  // ❌ processOrder espera que refund() funcione, PERO GiftCard lanza error
  processOrder(giftCard, 200);

  // --- Caso 3: CryptoWallet sustituye a PaymentMethod (BUG SUTIL) ---
  console.log("\n" + "─".repeat(55));
  console.log("3️⃣  CryptoWallet sustituye a PaymentMethod:");
  // Creamos una CryptoWallet pero la usamos COMO PaymentMethod
  const crypto: PaymentMethod = new CryptoWallet("Carlos López");
  // ❌ getLimit() retorna -1, y $200 > -1 es true...
  //    pero -1 no es un límite real, es una convención inventada
  //    Sorprendentemente, el monto de $200 SÍ es mayor que -1, así que pasa
  //    ¡Pero la lógica conceptual está rota!
  processOrder(crypto, 200);

  // --- Resumen ---
  console.log("\n" + "=".repeat(55));
  console.log("📊 RESUMEN - ¿POR QUÉ SON LOS HIJOS QUIENES SUSTITUYEN?");
  console.log("=".repeat(55));
  console.log("");
  console.log("  Imagina que tienes una función processOrder(payment: PaymentMethod)");
  console.log("  Esta función fue escrita CONFIANDO en el contrato de PaymentMethod.");
  console.log("");
  console.log("  Ahora, alguien le pasa un HIJO (GiftCard, CryptoWallet, etc.).");
  console.log("  Si el hijo NO cumple el contrato del padre → 💥 BOOM.");
  console.log("");
  console.log("  Por eso LSP dice:");
  console.log('  "Los HIJOS deben poder sustituir al PADRE sin romper nada"');
  console.log("");
  console.log("  🧠 TU INTUICIÓN ORIGINAL:");
  console.log('  "El padre tiene que poder sustituir a las hijas"');
  console.log("  → Eso no es LSP. El padre ya ES el tipo que se espera.");
  console.log("     No necesita 'sustituir' a nadie porque él es la referencia.");
  console.log("     La pregunta es: ¿los hijos pueden OCUPAR SU LUGAR?");
}

// Ejecutar el programa
main();
