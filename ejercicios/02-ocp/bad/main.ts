// ============================================================================
// ❌ MAL EJEMPLO: Violación del Principio Abierto/Cerrado (OCP)
// ============================================================================
// 📖 PRINCIPIO: "Las entidades de software deben estar abiertas para
//    extensión, pero cerradas para modificación"
//    - Robert C. Martin, Clean Architecture Cap. 8
//
// 🚨 PROBLEMA: Cada vez que agregamos una nueva pasarela de pago,
//    debemos MODIFICAR la clase PaymentProcessor (agregar otro if/else).
//    Esto viola OCP porque la clase NO está cerrada para modificación.
//
//    Impacto real: Si tienes 15 pasarelas, tienes un switch/if-else
//    gigante que cualquier cambio puede romper las otras 14.
// ============================================================================

// ❌ Clase que DEBE MODIFICARSE cada vez que se agrega una nueva pasarela
class PaymentProcessor {
  // ❌ Cada nueva pasarela = nuevo if/else = modificar esta clase
  processPayment(gateway: string, amount: number, currency: string): string {
    // ❌ Switch/if-else gigante que crece con cada nueva pasarela
    if (gateway === "stripe") {
      // Lógica específica de Stripe
      const fee = amount * 0.029 + 0.30; // Comisión de Stripe: 2.9% + $0.30
      const netAmount = amount - fee;
      console.log(`  💳 Stripe: Procesando $${amount} ${currency}`);
      console.log(`  💳 Stripe: Comisión $${fee.toFixed(2)}`);
      return `stripe_tx_${Date.now()}`;

    } else if (gateway === "paypal") {
      // Lógica específica de PayPal
      const fee = amount * 0.034 + 0.30; // Comisión de PayPal: 3.4% + $0.30
      const netAmount = amount - fee;
      console.log(`  🅿️ PayPal: Procesando $${amount} ${currency}`);
      console.log(`  🅿️ PayPal: Comisión $${fee.toFixed(2)}`);
      return `paypal_tx_${Date.now()}`;

    } else if (gateway === "lyra") {
      // Lógica específica de Lyra
      const fee = amount * 0.025; // Comisión de Lyra: 2.5%
      const netAmount = amount - fee;
      console.log(`  🏦 Lyra: Procesando $${amount} ${currency}`);
      console.log(`  🏦 Lyra: Comisión $${fee.toFixed(2)}`);
      return `lyra_tx_${Date.now()}`;

    } else {
      // 🚨 Si alguien agrega "mercadopago" y se olvida de agregar el if...
      // el pago simplemente falla sin explicación clara
      throw new Error(`Pasarela no soportada: ${gateway}`);
    }
  }

  // ❌ Este método TAMBIÉN debe modificarse con cada nueva pasarela
  refundPayment(gateway: string, transactionId: string, amount: number): void {
    if (gateway === "stripe") {
      console.log(`  💳 Stripe: Reembolso de $${amount} para ${transactionId}`);
    } else if (gateway === "paypal") {
      console.log(`  🅿️ PayPal: Reembolso de $${amount} para ${transactionId}`);
    } else if (gateway === "lyra") {
      console.log(`  🏦 Lyra: Reembolso de $${amount} para ${transactionId}`);
    }
    // 🚨 ¿Olvidaste agregar el nuevo gateway aquí también? ¡Bug silencioso!
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO - Violación de OCP");
  console.log("=".repeat(50));

  const processor = new PaymentProcessor();

  // Procesamos pagos con diferentes pasarelas
  console.log("\n📦 Pago con Stripe:");
  const tx1 = processor.processPayment("stripe", 100, "USD");

  console.log("\n📦 Pago con PayPal:");
  const tx2 = processor.processPayment("paypal", 200, "USD");

  console.log("\n📦 Pago con Lyra:");
  const tx3 = processor.processPayment("lyra", 150, "USD");

  // Reembolsos
  console.log("\n💸 Reembolso Stripe:");
  processor.refundPayment("stripe", tx1, 100);

  // ⚠️ Problemas
  console.log("\n⚠️  PROBLEMAS DE ESTE ENFOQUE:");
  console.log("  ❌ Para agregar MercadoPago hay que MODIFICAR PaymentProcessor");
  console.log("  ❌ Si olvidas agregar el if en refundPayment → bug silencioso");
  console.log("  ❌ Un cambio en Stripe puede romper PayPal (están en la misma clase)");
  console.log("  ❌ Tests frágiles: probar Stripe requiere cargar código de PayPal");
  console.log("  ❌ La clase crece infinitamente con cada nueva pasarela");
}

main();
