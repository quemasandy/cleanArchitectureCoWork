// ============================================================================
// ✅ BUEN EJEMPLO: Aplicación del Principio Abierto/Cerrado (OCP)
// ============================================================================
// 📖 PRINCIPIO: "Las entidades de software deben estar abiertas para
//    extensión, pero cerradas para modificación"
//    - Robert C. Martin, Clean Architecture Cap. 8
//
// ✅ SOLUCIÓN: Usamos una interface PaymentGateway que define el contrato.
//    Para agregar una nueva pasarela, solo CREAMOS una nueva clase que
//    implemente la interface. NO tocamos el código existente.
//
//    PaymentProcessor está CERRADO para modificación (nunca lo tocamos)
//    pero ABIERTO para extensión (agregamos nuevas clases).
// ============================================================================

// ✅ Interface que define el contrato para cualquier pasarela de pago
// Esta es la ABSTRACCIÓN que permite la extensión sin modificación
interface PaymentGateway {
  // Cada pasarela debe saber procesar un pago
  processPayment(amount: number, currency: string): string;
  // Cada pasarela debe saber hacer un reembolso
  refundPayment(transactionId: string, amount: number): void;
  // Nombre de la pasarela para logging
  readonly name: string;
}

// ✅ Implementación de Stripe - clase independiente
// Si cambia Stripe, SOLO tocamos esta clase
class StripeGateway implements PaymentGateway {
  readonly name = "Stripe";

  processPayment(amount: number, currency: string): string {
    // Lógica específica de Stripe encapsulada aquí
    const fee = amount * 0.029 + 0.30; // Comisión Stripe: 2.9% + $0.30
    console.log(`  💳 ${this.name}: Procesando $${amount} ${currency}`);
    console.log(`  💳 ${this.name}: Comisión $${fee.toFixed(2)}`);
    // Retornamos el ID de transacción
    return `stripe_tx_${Date.now()}`;
  }

  refundPayment(transactionId: string, amount: number): void {
    console.log(`  💳 ${this.name}: Reembolso de $${amount} para ${transactionId}`);
  }
}

// ✅ Implementación de PayPal - completamente independiente de Stripe
class PayPalGateway implements PaymentGateway {
  readonly name = "PayPal";

  processPayment(amount: number, currency: string): string {
    const fee = amount * 0.034 + 0.30; // Comisión PayPal: 3.4% + $0.30
    console.log(`  🅿️ ${this.name}: Procesando $${amount} ${currency}`);
    console.log(`  🅿️ ${this.name}: Comisión $${fee.toFixed(2)}`);
    return `paypal_tx_${Date.now()}`;
  }

  refundPayment(transactionId: string, amount: number): void {
    console.log(`  🅿️ ${this.name}: Reembolso de $${amount} para ${transactionId}`);
  }
}

// ✅ Implementación de Lyra
class LyraGateway implements PaymentGateway {
  readonly name = "Lyra";

  processPayment(amount: number, currency: string): string {
    const fee = amount * 0.025; // Comisión Lyra: 2.5%
    console.log(`  🏦 ${this.name}: Procesando $${amount} ${currency}`);
    console.log(`  🏦 ${this.name}: Comisión $${fee.toFixed(2)}`);
    return `lyra_tx_${Date.now()}`;
  }

  refundPayment(transactionId: string, amount: number): void {
    console.log(`  🏦 ${this.name}: Reembolso de $${amount} para ${transactionId}`);
  }
}

// ✅ PaymentProcessor CERRADO para modificación
// Trabaja con la ABSTRACCIÓN (PaymentGateway), no con implementaciones
// ¡NUNCA necesitamos modificar esta clase al agregar nuevas pasarelas!
class PaymentProcessor {
  // Recibe cualquier gateway que cumpla el contrato
  constructor(private gateway: PaymentGateway) { }

  // ✅ Este método funciona con CUALQUIER pasarela, presente o futura
  processPayment(amount: number, currency: string): string {
    console.log(`  📦 Procesando con ${this.gateway.name}...`);
    return this.gateway.processPayment(amount, currency);
  }

  refund(transactionId: string, amount: number): void {
    console.log(`  💸 Reembolsando con ${this.gateway.name}...`);
    this.gateway.refundPayment(transactionId, amount);
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO - Aplicación de OCP");
  console.log("=".repeat(50));

  // ✅ Podemos usar cualquier pasarela sin modificar PaymentProcessor
  console.log("\n📦 Pago con Stripe:");
  const stripeProcessor = new PaymentProcessor(new StripeGateway());
  const tx1 = stripeProcessor.processPayment(100, "USD");

  console.log("\n📦 Pago con PayPal:");
  const paypalProcessor = new PaymentProcessor(new PayPalGateway());
  const tx2 = paypalProcessor.processPayment(200, "USD");

  console.log("\n📦 Pago con Lyra:");
  const lyraProcessor = new PaymentProcessor(new LyraGateway());
  const tx3 = lyraProcessor.processPayment(150, "USD");

  // ✅ Reembolso funciona igual para cualquier pasarela
  console.log("\n💸 Reembolso Stripe:");
  stripeProcessor.refund(tx1, 100);

  // ✅ Para agregar MercadoPago, solo creamos UNA nueva clase:
  //    class MercadoPagoGateway implements PaymentGateway { ... }
  //    ¡Sin tocar NADA del código existente!

  console.log("\n🎯 BENEFICIOS DE OCP:");
  console.log("  ✅ Agregar MercadoPago = crear clase nueva, NO modificar existente");
  console.log("  ✅ Cada pasarela es independiente, un cambio no afecta a las demás");
  console.log("  ✅ Tests aislados: puedes testear Stripe sin cargar PayPal");
  console.log("  ✅ PaymentProcessor NUNCA cambia al agregar pasarelas nuevas");
  console.log("  ✅ Puedes crear un MockGateway para testing fácilmente");
}

main();
