// ============================================================================
// ✅ BUEN EJEMPLO: Entendiendo la DIRECCIÓN correcta de LSP
// ============================================================================
//
// 📖 LSP DICE: "Los HIJOS sustituyen al PADRE"
//
//    Donde tu código espera un tipo PADRE, puedes pasar cualquier HIJO
//    y todo debe funcionar correctamente.
//
// 🧠 RESPUESTA A TU DUDA:
//    NO es "el padre sustituye a los hijos".
//    SÍ es "los hijos sustituyen al padre".
//
//    ¿Y si el hijo tiene "menos componentes"? 
//    → Entonces está MAL diseñada la herencia.
//    → El hijo DEBE tener AL MENOS todo lo que el padre promete.
//    → Puede tener MÁS, pero nunca MENOS.
//
// 🔑 LA REGLA DE ORO:
//    Un hijo puede AGREGAR comportamiento, pero NUNCA QUITAR.
//    Si necesitas quitar algo, el diseño de la jerarquía está mal.
// ============================================================================

// ============================================================================
// 📦 Escenario: Sistema de Procesamiento de Pagos (BIEN DISEÑADO)
// ============================================================================

// ✅ Interface base minimalista: SOLO lo que TODOS los medios de pago comparten
// La clave es que el padre/interface NO prometa cosas que algún hijo no pueda cumplir
interface PaymentMethod {
  // Propiedad que identifica al medio de pago
  readonly ownerName: string;

  // Contrato: TODOS los medios de pago pueden cobrar
  charge(amount: number): string;

  // Contrato: TODOS los medios de pago tienen un límite positivo
  getLimit(): number;
}

// ✅ Interface SEPARADA para medios de pago que soportan reembolsos
// No todos los medios de pago permiten reembolsos, así que lo separamos
interface Refundable {
  // Solo los medios que REALMENTE pueden reembolsar implementan esto
  refund(amount: number): string;
}

// ============================================================================
// ✅ CreditCard implementa PaymentMethod Y Refundable
// Tiene TODAS las capacidades: cobrar, límite, Y reembolsos
// ============================================================================
class CreditCard implements PaymentMethod, Refundable {
  // Nombre del dueño de la tarjeta
  readonly ownerName: string;
  // Límite de crédito disponible
  private creditLimit: number;

  constructor(ownerName: string, creditLimit: number) {
    // Asigna el nombre del dueño
    this.ownerName = ownerName;
    // Asigna el límite de crédito
    this.creditLimit = creditLimit;
  }

  // ✅ Cumple contrato de PaymentMethod: puede cobrar
  charge(amount: number): string {
    return `💳 Cobrando $${amount} a la tarjeta de ${this.ownerName}`;
  }

  // ✅ Cumple contrato de PaymentMethod: tiene límite positivo
  getLimit(): number {
    return this.creditLimit;
  }

  // ✅ Cumple contrato de Refundable: puede reembolsar
  refund(amount: number): string {
    return `💳 Reembolsando $${amount} a la tarjeta de ${this.ownerName}`;
  }
}

// ============================================================================
// ✅ GiftCard SOLO implementa PaymentMethod (NO Refundable)
// No se le pide que haga reembolsos porque NO prometió hacerlo
// ============================================================================
class GiftCard implements PaymentMethod {
  // Nombre genérico del dueño
  readonly ownerName: string;
  // Saldo disponible en la tarjeta de regalo
  private balance: number;

  constructor(balance: number) {
    // Las gift cards no tienen dueño personal
    this.ownerName = "Gift Card Anónima";
    // Establece el saldo inicial
    this.balance = balance;
  }

  // ✅ Cumple contrato: puede cobrar
  charge(amount: number): string {
    // Verifica si hay saldo suficiente
    if (amount > this.balance) {
      return `🎁 Saldo insuficiente. Disponible: $${this.balance}`;
    }
    // Descuenta del saldo
    this.balance -= amount;
    return `🎁 Cobrando $${amount} de gift card. Saldo: $${this.balance}`;
  }

  // ✅ Cumple contrato: tiene límite positivo (su saldo)
  getLimit(): number {
    return this.balance;
  }

  // 🔑 NOTA: GiftCard NO tiene refund() y ESO ESTÁ BIEN
  //    Porque GiftCard NUNCA prometió poder reembolsar
  //    Solo implementa PaymentMethod, no Refundable
}

// ============================================================================
// ✅ CryptoWallet implementa PaymentMethod Y Refundable
// ============================================================================
class CryptoWallet implements PaymentMethod, Refundable {
  // Nombre del dueño de la wallet
  readonly ownerName: string;
  // Saldo en la wallet, expresado como un límite práctico
  private walletBalance: number;

  constructor(ownerName: string, balance: number) {
    // Asigna el nombre
    this.ownerName = ownerName;
    // Asigna el balance
    this.walletBalance = balance;
  }

  // ✅ Cumple contrato: puede cobrar
  charge(amount: number): string {
    return `🪙 Cobrando $${amount} en crypto de ${this.ownerName}`;
  }

  // ✅ Cumple contrato: retorna un número positivo real
  getLimit(): number {
    return this.walletBalance;
  }

  // ✅ Cumple contrato de Refundable: puede reembolsar
  refund(amount: number): string {
    return `🪙 Reembolsando $${amount} en crypto a ${this.ownerName}`;
  }
}

// ============================================================================
// ✅ Funciones que CONFÍAN en los contratos y NUNCA se rompen
// ============================================================================

// ✅ Esta función acepta CUALQUIER PaymentMethod
// Funciona con CreditCard, GiftCard, CryptoWallet — TODOS cumplen el contrato
function processPayment(payment: PaymentMethod, amount: number): void {
  // Verificamos el límite — TODOS los PaymentMethod tienen getLimit()
  const limit = payment.getLimit();

  // Comparación segura: getLimit() SIEMPRE retorna un número positivo
  if (amount > limit) {
    console.log(`  ⛔ Monto $${amount} excede el límite de $${limit}`);
    return;
  }

  // Cobramos — TODOS los PaymentMethod pueden cobrar
  console.log(`  ${payment.charge(amount)}`);
}

// ✅ Esta función SOLO acepta medios que soportan reembolsos
// TypeScript IMPIDE pasarle un GiftCard en tiempo de compilación
function processRefund(payment: PaymentMethod & Refundable, amount: number): void {
  // No necesitamos try/catch porque Refundable GARANTIZA que refund() funciona
  console.log(`  ${payment.refund(amount)}`);
}

// ============================================================================
// 🔑 Función auxiliar para verificar si un medio de pago es reembolsable
// ============================================================================
// Type guard: verifica en runtime si un objeto implementa Refundable
function isRefundable(payment: PaymentMethod): payment is PaymentMethod & Refundable {
  // Verificamos si el objeto tiene el método refund
  return 'refund' in payment;
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO — Dirección correcta de LSP");
  console.log("=".repeat(55));

  // Explicación conceptual directa
  console.log("\n🧠 RESPUESTA A TU PREGUNTA:");
  console.log("   Los HIJOS sustituyen al PADRE. ✅");
  console.log("   El padre NO sustituye a los hijos. ❌");
  console.log("\n   ¿Cómo lo logramos?");
  console.log("   → El padre solo PROMETE lo que TODOS los hijos pueden cumplir.");
  console.log("   → Si un hijo no puede hacer algo, ESO no va en el padre.\n");

  // Creamos los medios de pago
  const creditCard = new CreditCard("Ana García", 5000);
  const giftCard = new GiftCard(500);
  const crypto = new CryptoWallet("Carlos López", 3000);

  // --- Todos son PaymentMethod → todos pueden cobrar ---
  console.log("\n" + "─".repeat(55));
  console.log("💰 Procesando pagos (TODOS los medios funcionan):\n");

  // ✅ Array de PaymentMethod — cualquier hijo puede estar aquí
  const allPayments: PaymentMethod[] = [creditCard, giftCard, crypto];

  // Iteramos sobre todos los medios de pago
  for (const payment of allPayments) {
    // ✅ processPayment espera PaymentMethod
    //    CreditCard, GiftCard, CryptoWallet TODOS lo sustituyen correctamente
    console.log(`  → ${payment.ownerName}:`);
    processPayment(payment, 200);
  }

  // --- Solo los Refundable pueden reembolsar ---
  console.log("\n" + "─".repeat(55));
  console.log("🔄 Procesando reembolsos (SOLO medios que lo soportan):\n");

  // Iteramos y verificamos cuáles soportan reembolsos
  for (const payment of allPayments) {
    console.log(`  → ${payment.ownerName}:`);
    // ✅ Usamos el type guard para verificar en runtime
    if (isRefundable(payment)) {
      // Solo entra aquí si el medio de pago ES refundable
      processRefund(payment, 20);
    } else {
      // GiftCard entra aquí — y no se rompe nada, simplemente no reembolsa
      console.log(`    ℹ️  ${payment.ownerName} no soporta reembolsos (y eso está bien)`);
    }
  }

  // --- Resumen final ---
  console.log("\n" + "=".repeat(55));
  console.log("📊 RESUMEN - ¿POR QUÉ FUNCIONA?");
  console.log("=".repeat(55));
  console.log("");
  console.log("  🔑 DIRECCIÓN DE LSP:");
  console.log("     processPayment(payment: PaymentMethod, ...)");
  console.log("     → Le paso CreditCard → ✅ funciona (HIJO sustituye al PADRE)");
  console.log("     → Le paso GiftCard   → ✅ funciona (HIJO sustituye al PADRE)");
  console.log("     → Le paso CryptoWallet → ✅ funciona (HIJO sustituye al PADRE)");
  console.log("");
  console.log("  🧠 ¿Y POR QUÉ NO AL REVÉS?");
  console.log("     El padre ES la referencia. No 'sustituye' a nadie.");
  console.log("     Es como preguntar: '¿La receta sustituye al platillo?'");
  console.log("     No — la receta define qué debe hacer el platillo.");
  console.log("     El platillo (hijo) debe cumplir la receta (padre).");
  console.log("");
  console.log("  🔑 REGLA PARA EVITAR VIOLACIONES:");
  console.log("     Si un hijo NO puede hacer algo que el padre promete,");
  console.log("     hay dos opciones:");
  console.log("     1. El padre promete demasiado → Dividir en interfaces más pequeñas");
  console.log("     2. El hijo no debería heredar de ese padre");
}

// Ejecutar el programa
main();
