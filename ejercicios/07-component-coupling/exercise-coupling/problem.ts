// ============================================================================
// ❌ PROBLEMA: Sistema con ALTO ACOPLAMIENTO
// ============================================================================
//
// 📖 CONCEPTO: ACOPLAMIENTO
//
//    El acoplamiento mide qué tanto DEPENDE un módulo de los detalles
//    internos de otro módulo.
//
//    🔴 Alto acoplamiento = cambiar una clase OBLIGA a cambiar otras.
//    🟢 Bajo acoplamiento = puedes cambiar una clase SIN afectar otras.
//
//    Robert C. Martin: "Los buenos sistemas se construyen con componentes
//    que se pueden cambiar independientemente."
//
// 🚨 PROBLEMA EN ESTE CÓDIGO:
//    CheckoutService CONOCE los detalles internos de:
//    - StripePayment (la pasarela de pagos específica)
//    - SendGridMailer (el servicio de email específico)
//    - PostgresDatabase (la base de datos específica)
//
//    Si queremos cambiar de Stripe a PayPal, ¡hay que ABRIR y MODIFICAR
//    CheckoutService! Eso es ALTO acoplamiento.
//
// 🎯 TU MISIÓN: Desacoplar usando interfaces (abstracción).
// ============================================================================

// ============================================================================
// ❌ CLASE CONCRETA: Pasarela de pagos Stripe
// ============================================================================
// Esta clase simula el SDK real de Stripe
// CheckoutService la usa DIRECTAMENTE (alto acoplamiento)
// ============================================================================
class StripePayment {
  // API Key de Stripe hardcodeada (simulación)
  private apiKey: string = "sk_stripe_123456";

  // Cobra dinero al cliente usando la API de Stripe
  chargeWithStripe(
    cardNumber: string,
    amount: number,
    currency: string
  ): { stripeTransactionId: string; charged: boolean } {
    // Mostramos que estamos usando Stripe específicamente
    console.log(`  💳 [STRIPE] Cobrando $${amount} ${currency}...`);
    // Mostramos que usamos la API key de Stripe
    console.log(`  🔑 [STRIPE] Usando API Key: ${this.apiKey.substring(0, 10)}...`);
    // Simulamos el cobro exitoso
    const result = {
      // ID de transacción con formato específico de Stripe
      stripeTransactionId: `stripe_txn_${Date.now()}`,
      // El cobro fue exitoso
      charged: true,
    };
    // Confirmamos el cobro exitoso
    console.log(`  ✅ [STRIPE] Cobro exitoso: ${result.stripeTransactionId}`);
    // Retornamos el resultado con formato específico de Stripe
    return result;
  }
}

// ============================================================================
// ❌ CLASE CONCRETA: Servicio de email SendGrid
// ============================================================================
// Esta clase simula el SDK real de SendGrid
// CheckoutService la usa DIRECTAMENTE (alto acoplamiento)
// ============================================================================
class SendGridMailer {
  // API Key de SendGrid hardcodeada (simulación)
  private sendGridKey: string = "sg_sendgrid_789";

  // Envía un email usando la API de SendGrid
  sendViaSendGrid(
    from: string,
    to: string,
    subject: string,
    htmlContent: string
  ): { sendGridMessageId: string; delivered: boolean } {
    // Mostramos que estamos usando SendGrid específicamente
    console.log(`  📧 [SENDGRID] Enviando email a ${to}...`);
    // Mostramos detalles específicos de SendGrid
    console.log(`  📧 [SENDGRID] Asunto: "${subject}"`);
    // Simulamos el envío exitoso
    const result = {
      // ID de mensaje con formato específico de SendGrid
      sendGridMessageId: `sg_msg_${Date.now()}`,
      // El envío fue exitoso
      delivered: true,
    };
    // Confirmamos el envío
    console.log(`  ✅ [SENDGRID] Email entregado: ${result.sendGridMessageId}`);
    // Retornamos el resultado con formato específico de SendGrid
    return result;
  }
}

// ============================================================================
// ❌ CLASE CONCRETA: Base de datos PostgreSQL
// ============================================================================
// Esta clase simula una conexión real a PostgreSQL
// CheckoutService la usa DIRECTAMENTE (alto acoplamiento)
// ============================================================================
class PostgresDatabase {
  // String de conexión de PostgreSQL hardcodeada (simulación)
  private connectionString: string = "postgres://localhost:5432/tienda";

  // Inserta un registro en una tabla de PostgreSQL
  insertIntoPostgres(
    tableName: string,
    data: Record<string, unknown>
  ): { postgresRowId: number; inserted: boolean } {
    // Mostramos que estamos usando PostgreSQL específicamente
    console.log(`  🗄️  [POSTGRES] Insertando en tabla '${tableName}'...`);
    // Mostramos los datos que insertamos
    console.log(`  🗄️  [POSTGRES] Datos: ${JSON.stringify(data)}`);
    // Simulamos la inserción exitosa
    const result = {
      // ID de fila generado por PostgreSQL
      postgresRowId: Math.floor(Math.random() * 10000),
      // La inserción fue exitosa
      inserted: true,
    };
    // Confirmamos la inserción
    console.log(`  ✅ [POSTGRES] Fila insertada con ID: ${result.postgresRowId}`);
    // Retornamos el resultado con formato específico de PostgreSQL
    return result;
  }
}

// ============================================================================
// ❌ CheckoutService: FUERTEMENTE ACOPLADO a implementaciones concretas
// ============================================================================
//    DIAGRAMA DE ACOPLAMIENTO:
//
//    ┌──────────────────┐
//    │ CheckoutService  │──────→ StripePayment (concreto)
//    │                  │──────→ SendGridMailer (concreto)
//    │                  │──────→ PostgresDatabase (concreto)
//    └──────────────────┘
//
//    ❌ Si quiero cambiar de Stripe a PayPal → TOCO CheckoutService
//    ❌ Si quiero cambiar de SendGrid a Mailgun → TOCO CheckoutService
//    ❌ Si quiero cambiar de PostgreSQL a MongoDB → TOCO CheckoutService
//    ❌ Si quiero testear sin BD real → NO PUEDO (no hay mocks)
// ============================================================================
class CheckoutService {
  // ❌ Dependencia DIRECTA a Stripe (clase concreta, no abstracción)
  private stripe: StripePayment;
  // ❌ Dependencia DIRECTA a SendGrid (clase concreta, no abstracción)
  private sendGrid: SendGridMailer;
  // ❌ Dependencia DIRECTA a PostgreSQL (clase concreta, no abstracción)
  private postgres: PostgresDatabase;

  // ❌ El constructor CREA las dependencias internamente
  // Esto hace imposible reemplazarlas o mockearlas
  constructor() {
    // ❌ Crea una instancia concreta de Stripe (acoplamiento directo)
    this.stripe = new StripePayment();
    // ❌ Crea una instancia concreta de SendGrid (acoplamiento directo)
    this.sendGrid = new SendGridMailer();
    // ❌ Crea una instancia concreta de PostgreSQL (acoplamiento directo)
    this.postgres = new PostgresDatabase();
  }

  // Procesa la compra de un cliente (el flujo completo)
  processCheckout(
    customerEmail: string,
    cardNumber: string,
    items: { name: string; price: number }[]
  ): void {
    // Calculamos el total sumando todos los precios
    const total = items.reduce((sum, item) => sum + item.price, 0);
    // Mostramos el inicio del proceso
    console.log(`\n  🛒 Procesando compra por $${total.toLocaleString()}...`);

    // PASO 1: Cobrar al cliente
    // ❌ Usa el método específico de Stripe: chargeWithStripe()
    // Si cambiamos a PayPal, este código SE ROMPE
    const payment = this.stripe.chargeWithStripe(cardNumber, total, "USD");

    // Verificamos si el pago fue exitoso
    if (!payment.charged) {
      // Si falló, mostramos error y salimos
      console.log("  ❌ Pago fallido. Abortando.");
      // Retornamos sin completar el proceso
      return;
    }

    // PASO 2: Guardar en base de datos
    // ❌ Usa el método específico de PostgreSQL: insertIntoPostgres()
    // Si cambiamos a MongoDB, este código SE ROMPE
    this.postgres.insertIntoPostgres("orders", {
      // Usamos el ID específico de Stripe
      transactionId: payment.stripeTransactionId,
      // Email del cliente
      email: customerEmail,
      // Total de la compra
      total,
      // Items comprados
      items,
      // Fecha de la compra
      date: new Date().toISOString(),
    });

    // PASO 3: Enviar confirmación por email
    // ❌ Usa el método específico de SendGrid: sendViaSendGrid()
    // Si cambiamos a Mailgun, este código SE ROMPE
    this.sendGrid.sendViaSendGrid(
      // Remitente fijo
      "tienda@ejemplo.com",
      // Destinatario (el cliente)
      customerEmail,
      // Asunto del email
      "¡Tu compra fue exitosa!",
      // Cuerpo del email con el ID específico de Stripe
      `<h1>Gracias por tu compra</h1><p>Total: $${total}</p><p>TX: ${payment.stripeTransactionId}</p>`
    );

    // Mostramos que el checkout se completó
    console.log(`\n  🎉 ¡Checkout completado para ${customerEmail}!`);
  }
}

// ============================================================================
// 🏃 EJECUCIÓN - Demostración del problema
// ============================================================================
function main(): void {
  // Título del ejercicio
  console.log("❌ PROBLEMA: Sistema con ALTO ACOPLAMIENTO");
  // Línea separadora
  console.log("═".repeat(55));

  // ❌ Creamos el servicio — internamente ya creó Stripe, SendGrid, PostgreSQL
  // No podemos inyectar alternativas ni mocks
  const checkout = new CheckoutService();

  // Procesamos una compra de ejemplo
  checkout.processCheckout("carlos@email.com", "4532015112830366", [
    // Item 1 del carrito
    { name: "Laptop Gaming", price: 2500000 },
    // Item 2 del carrito
    { name: "Mouse Inalámbrico", price: 150000 },
  ]);

  // --- Mostramos los problemas de alto acoplamiento ---
  console.log("\n\n⚠️  PROBLEMAS DE ALTO ACOPLAMIENTO:");
  console.log("═".repeat(55));
  // Problema 1: Cambiar pasarela de pago requiere modificar CheckoutService
  console.log("  ❌ Cambiar de Stripe a PayPal → hay que ABRIR CheckoutService");
  // Problema 2: Cambiar servicio de email requiere modificar CheckoutService
  console.log("  ❌ Cambiar de SendGrid a Mailgun → hay que ABRIR CheckoutService");
  // Problema 3: Cambiar base de datos requiere modificar CheckoutService
  console.log("  ❌ Cambiar de PostgreSQL a MongoDB → hay que ABRIR CheckoutService");
  // Problema 4: No se puede testear sin servicios reales
  console.log("  ❌ No puedo testear sin una BD y pasarela real");
  // Problema 5: CheckoutService sabe demasiado
  console.log("  ❌ CheckoutService conoce nombres de métodos específicos:");
  // Detalle de métodos acoplados
  console.log('     chargeWithStripe(), sendViaSendGrid(), insertIntoPostgres()');
  console.log("");
  // Cita de Robert C. Martin
  console.log('  📖 Robert C. Martin: "Depende de ABSTRACCIONES,');
  console.log('     no de implementaciones concretas."');
}

// Ejecutamos la función principal
main();
