// ============================================================================
// ✅ SOLUCIÓN: Sistema DESACOPLADO con interfaces
// ============================================================================
//
// 📖 CONCEPTO: DESACOPLAMIENTO
//
//    Desacoplar = hacer que un módulo NO dependa de los detalles internos
//    de otro módulo. Se logra usando ABSTRACCIONES (interfaces).
//
//    🟢 CheckoutService ahora depende de INTERFACES, no de clases concretas.
//    Puedes cambiar de Stripe a PayPal SIN tocar CheckoutService.
//
//    Robert C. Martin: "Depende de ABSTRACCIONES, no de implementaciones
//    concretas." (Principio de Inversión de Dependencias)
//
// ✅ SOLUCIÓN:
//    1. Creamos 3 interfaces: PaymentGateway, EmailSender, OrderRepository
//    2. CheckoutService depende SOLO de esas interfaces
//    3. Las implementaciones concretas las inyectamos desde AFUERA
//    4. Podemos cambiar cualquier implementación sin tocar CheckoutService
// ============================================================================

// ============================================================================
// ✅ CAPA DE ABSTRACCIONES: Interfaces que definen CONTRATOS
// ============================================================================
// Estas interfaces son ESTABLES — rara vez cambian.
// CheckoutService depende SOLO de estas abstracciones.
// ============================================================================

// Resultado estandarizado de un pago (no importa si es Stripe o PayPal)
interface PaymentResult {
  // ID de transacción genérico (no específico de ningún proveedor)
  transactionId: string;
  // Indica si el cobro fue exitoso
  success: boolean;
  // Monto cobrado
  amount: number;
}

// ✅ INTERFACE: Contrato para CUALQUIER pasarela de pagos
// Stripe, PayPal, MercadoPago — todos deben cumplir este contrato
interface PaymentGateway {
  // Método genérico para cobrar — sin detalles de implementación
  charge(cardNumber: string, amount: number, currency: string): PaymentResult;
}

// ✅ INTERFACE: Contrato para CUALQUIER servicio de email
// SendGrid, Mailgun, AWS SES — todos deben cumplir este contrato
interface EmailSender {
  // Método genérico para enviar email — sin detalles de implementación
  send(to: string, subject: string, body: string): boolean;
}

// ✅ INTERFACE: Contrato para CUALQUIER repositorio de órdenes
// PostgreSQL, MongoDB, DynamoDB — todos deben cumplir este contrato
interface OrderRepository {
  // Método genérico para guardar orden — sin detalles de implementación
  save(orderData: Record<string, unknown>): string;
}

// ============================================================================
// ✅ IMPLEMENTACIÓN A: Stripe (pasarela de pagos)
// ============================================================================
// Implementa la interface PaymentGateway
// Si mañana cambiamos a PayPal, CheckoutService NO se entera
// ============================================================================
class StripeGateway implements PaymentGateway {
  // API Key de Stripe (simulación)
  private apiKey: string = "sk_stripe_123456";

  // Implementa el método 'charge' del contrato PaymentGateway
  charge(cardNumber: string, amount: number, currency: string): PaymentResult {
    // Mostramos que internamente usa Stripe
    console.log(`  💳 [STRIPE] Cobrando $${amount} ${currency}...`);
    // Mostramos la API key (simulación)
    console.log(`  🔑 [STRIPE] API Key: ${this.apiKey.substring(0, 10)}...`);
    // Generamos un ID de transacción con formato Stripe
    const transactionId = `stripe_txn_${Date.now()}`;
    // Confirmamos el cobro
    console.log(`  ✅ [STRIPE] Cobro exitoso: ${transactionId}`);
    // Retornamos el resultado en formato ESTÁNDAR (no específico de Stripe)
    return { transactionId, success: true, amount };
  }
}

// ============================================================================
// ✅ IMPLEMENTACIÓN B: PayPal (pasarela de pagos alternativa)
// ============================================================================
// También implementa PaymentGateway — es intercambiable con Stripe
// ¡CheckoutService NO necesita cambiar para usar PayPal!
// ============================================================================
class PayPalGateway implements PaymentGateway {
  // Client ID de PayPal (simulación)
  private clientId: string = "paypal_client_abc";

  // Implementa el mismo contrato 'charge' pero con lógica de PayPal
  charge(cardNumber: string, amount: number, currency: string): PaymentResult {
    // Mostramos que internamente usa PayPal
    console.log(`  💳 [PAYPAL] Cobrando $${amount} ${currency}...`);
    // Mostramos el Client ID (simulación)
    console.log(`  🔑 [PAYPAL] Client ID: ${this.clientId}...`);
    // Generamos un ID de transacción con formato PayPal
    const transactionId = `paypal_order_${Date.now()}`;
    // Confirmamos el cobro
    console.log(`  ✅ [PAYPAL] Cobro exitoso: ${transactionId}`);
    // Retornamos el resultado en el MISMO formato estándar
    return { transactionId, success: true, amount };
  }
}

// ============================================================================
// ✅ IMPLEMENTACIÓN: SendGrid (servicio de email)
// ============================================================================
// Implementa la interface EmailSender
// Podríamos fácilmente crear MailgunSender sin tocar CheckoutService
// ============================================================================
class SendGridSender implements EmailSender {
  // API Key de SendGrid (simulación)
  private apiKey: string = "sg_sendgrid_789";

  // Implementa el método 'send' del contrato EmailSender
  send(to: string, subject: string, body: string): boolean {
    // Mostramos que internamente usa SendGrid
    console.log(`  📧 [SENDGRID] Enviando a ${to}: "${subject}"`);
    // Confirmamos el envío
    console.log(`  ✅ [SENDGRID] Email entregado`);
    // Retornamos true indicando envío exitoso
    return true;
  }
}

// ============================================================================
// ✅ IMPLEMENTACIÓN: PostgreSQL (repositorio de órdenes)
// ============================================================================
// Implementa la interface OrderRepository
// Podríamos crear MongoRepository sin tocar CheckoutService
// ============================================================================
class PostgresOrderRepository implements OrderRepository {
  // Connection string de PostgreSQL (simulación)
  private connectionString: string = "postgres://localhost:5432/tienda";

  // Implementa el método 'save' del contrato OrderRepository
  save(orderData: Record<string, unknown>): string {
    // Generamos un ID de fila simulado
    const rowId = Math.floor(Math.random() * 10000);
    // Mostramos que internamente usa PostgreSQL
    console.log(`  🗄️  [POSTGRES] Guardando orden...`);
    // Mostramos los datos guardados
    console.log(`  🗄️  [POSTGRES] Datos: ${JSON.stringify(orderData)}`);
    // Confirmamos la inserción
    console.log(`  ✅ [POSTGRES] Fila #${rowId} insertada`);
    // Retornamos el ID como string
    return rowId.toString();
  }
}

// ============================================================================
// ✅ CheckoutService: DESACOPLADO — depende SOLO de interfaces
// ============================================================================
//    DIAGRAMA DESACOPLADO:
//
//    ┌──────────────────┐
//    │ CheckoutService  │──────→ PaymentGateway (interface)
//    │                  │──────→ EmailSender (interface)
//    │                  │──────→ OrderRepository (interface)
//    └──────────────────┘
//           ↑                         ↑
//    Las implementaciones         Se inyectan
//    concretas cumplen            desde AFUERA
//    el contrato
//
//    ✅ Si quiero cambiar de Stripe a PayPal → NO TOCO CheckoutService
//    ✅ Si quiero testear → inyecto mocks que implementen las interfaces
// ============================================================================
class CheckoutService {
  // ✅ Dependencia a INTERFACE, no a clase concreta
  private paymentGateway: PaymentGateway;
  // ✅ Dependencia a INTERFACE, no a clase concreta
  private emailSender: EmailSender;
  // ✅ Dependencia a INTERFACE, no a clase concreta
  private orderRepository: OrderRepository;

  // ✅ Las dependencias se INYECTAN desde afuera (Inversión de Dependencias)
  // No crea nada internamente — recibe todo lo que necesita
  constructor(
    // Recibe cualquier pasarela que cumpla el contrato PaymentGateway
    paymentGateway: PaymentGateway,
    // Recibe cualquier sender que cumpla el contrato EmailSender
    emailSender: EmailSender,
    // Recibe cualquier repositorio que cumpla el contrato OrderRepository
    orderRepository: OrderRepository
  ) {
    // Asignamos la pasarela de pagos inyectada
    this.paymentGateway = paymentGateway;
    // Asignamos el sender de email inyectado
    this.emailSender = emailSender;
    // Asignamos el repositorio inyectado
    this.orderRepository = orderRepository;
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

    // PASO 1: Cobrar — usa el método GENÉRICO 'charge'
    // ✅ No sabe si es Stripe, PayPal o MercadoPago
    const payment = this.paymentGateway.charge(cardNumber, total, "USD");

    // Verificamos si el pago fue exitoso
    if (!payment.success) {
      // Si falló, abortamos el proceso
      console.log("  ❌ Pago fallido. Abortando.");
      // Salimos de la función
      return;
    }

    // PASO 2: Guardar — usa el método GENÉRICO 'save'
    // ✅ No sabe si es PostgreSQL, MongoDB o DynamoDB
    this.orderRepository.save({
      // Usamos el ID genérico (no específico de ningún proveedor)
      transactionId: payment.transactionId,
      // Email del cliente
      email: customerEmail,
      // Total de la compra
      total,
      // Items comprados
      items,
      // Fecha de la compra
      date: new Date().toISOString(),
    });

    // PASO 3: Notificar — usa el método GENÉRICO 'send'
    // ✅ No sabe si es SendGrid, Mailgun o AWS SES
    this.emailSender.send(
      // El destinatario
      customerEmail,
      // El asunto
      "¡Tu compra fue exitosa!",
      // El cuerpo del email
      `Gracias. Total: $${total}. TX: ${payment.transactionId}`
    );

    // Mostramos que el checkout se completó
    console.log(`\n  🎉 ¡Checkout completado para ${customerEmail}!`);
  }
}

// ============================================================================
// ✅ BONUS: Mock para testing — posible gracias al desacoplamiento
// ============================================================================

// Mock de pasarela de pagos para tests
class MockPaymentGateway implements PaymentGateway {
  // Registramos las llamadas para verificar en tests
  public calls: { cardNumber: string; amount: number }[] = [];

  // Simula un cobro sin conectarse a ningún servicio real
  charge(cardNumber: string, amount: number, currency: string): PaymentResult {
    // Guardamos la llamada para verificación posterior
    this.calls.push({ cardNumber, amount });
    // Mostramos que es un mock
    console.log(`  🧪 [MOCK PAGO] Simulando cobro de $${amount}`);
    // Retornamos un resultado simulado exitoso
    return { transactionId: `mock_txn_${Date.now()}`, success: true, amount };
  }
}

// Mock de email para tests
class MockEmailSender implements EmailSender {
  // Registramos los emails "enviados" para verificar
  public emails: { to: string; subject: string }[] = [];

  // Simula envío de email sin conectarse a nada
  send(to: string, subject: string, body: string): boolean {
    // Guardamos el email para verificación posterior
    this.emails.push({ to, subject });
    // Mostramos que es un mock
    console.log(`  🧪 [MOCK EMAIL] Simulando envío a ${to}`);
    // Retornamos true indicando "éxito"
    return true;
  }
}

// Mock de repositorio para tests
class MockOrderRepository implements OrderRepository {
  // Registramos las órdenes "guardadas" para verificar
  public savedOrders: Record<string, unknown>[] = [];

  // Simula guardar una orden sin base de datos
  save(orderData: Record<string, unknown>): string {
    // Guardamos la orden en memoria
    this.savedOrders.push(orderData);
    // Mostramos que es un mock
    console.log(`  🧪 [MOCK BD] Simulando guardado de orden`);
    // Retornamos un ID simulado
    return "mock_id_123";
  }
}

// ============================================================================
// 🏃 EJECUCIÓN - Demostración del desacoplamiento
// ============================================================================
function main(): void {
  // Título del ejercicio
  console.log("✅ SOLUCIÓN: Sistema DESACOPLADO con interfaces");
  // Línea separadora
  console.log("═".repeat(55));

  // =====================================================================
  // ✅ ESCENARIO 1: Producción con Stripe + SendGrid + PostgreSQL
  // =====================================================================
  console.log("\n🏭 ESCENARIO 1: Producción con Stripe");
  // Separador visual
  console.log("─".repeat(50));

  // Creamos las implementaciones concretas
  const stripe = new StripeGateway();
  // Creamos el sender de email concreto
  const sendGrid = new SendGridSender();
  // Creamos el repositorio concreto
  const postgres = new PostgresOrderRepository();

  // ✅ INYECTAMOS las dependencias desde afuera
  // CheckoutService no sabe qué implementaciones recibe
  const checkoutStripe = new CheckoutService(stripe, sendGrid, postgres);

  // Procesamos una compra usando Stripe
  checkoutStripe.processCheckout("carlos@email.com", "4532015112830366", [
    { name: "Laptop Gaming", price: 2500000 },
    { name: "Mouse Inalámbrico", price: 150000 },
  ]);

  // =====================================================================
  // ✅ ESCENARIO 2: Cambiamos a PayPal SIN TOCAR CheckoutService
  // =====================================================================
  console.log("\n\n🔄 ESCENARIO 2: Cambiamos a PayPal (SIN tocar Checkout)");
  // Separador visual
  console.log("─".repeat(50));

  // ✅ Solo creamos una nueva implementación de PaymentGateway
  const paypal = new PayPalGateway();

  // ✅ CheckoutService es EXACTAMENTE EL MISMO — solo cambiamos la pasarela
  // Esto demuestra el poder del desacoplamiento
  const checkoutPayPal = new CheckoutService(paypal, sendGrid, postgres);

  // Procesamos una compra usando PayPal (mismo código, diferente pasarela)
  checkoutPayPal.processCheckout("maria@email.com", "5425233430109903", [
    { name: "Teclado Mecánico", price: 350000 },
  ]);

  // =====================================================================
  // ✅ ESCENARIO 3: Testing con Mocks (sin servicios reales)
  // =====================================================================
  console.log("\n\n🧪 ESCENARIO 3: Testing con Mocks");
  // Separador visual
  console.log("─".repeat(50));

  // Creamos mocks para cada dependencia
  const mockPayment = new MockPaymentGateway();
  // Mock de email
  const mockEmail = new MockEmailSender();
  // Mock de repositorio
  const mockRepo = new MockOrderRepository();

  // ✅ CheckoutService funciona con mocks — no necesita servicios reales
  const checkoutTest = new CheckoutService(mockPayment, mockEmail, mockRepo);

  // Procesamos una compra de prueba
  checkoutTest.processCheckout("test@test.com", "0000111122223333", [
    { name: "Producto Test", price: 100 },
  ]);

  // Verificamos que los mocks registraron las llamadas
  console.log(`\n  📊 Verificación de mocks:`);
  // Mostramos cuántos pagos se procesaron
  console.log(`  ✅ Pagos procesados: ${mockPayment.calls.length}`);
  // Mostramos cuántos emails se "enviaron"
  console.log(`  ✅ Emails enviados: ${mockEmail.emails.length}`);
  // Mostramos cuántas órdenes se "guardaron"
  console.log(`  ✅ Órdenes guardadas: ${mockRepo.savedOrders.length}`);

  // --- Mostramos los beneficios del desacoplamiento ---
  console.log("\n\n🎯 BENEFICIOS DEL DESACOPLAMIENTO:");
  console.log("═".repeat(55));
  // Beneficio 1: Se puede intercambiar implementaciones
  console.log("  ✅ Cambiamos de Stripe a PayPal SIN tocar CheckoutService");
  // Beneficio 2: Testing sin dependencias reales
  console.log("  ✅ Testeamos con mocks — sin BD, sin API, sin email real");
  // Beneficio 3: Cada clase cambia independientemente
  console.log("  ✅ StripeGateway puede cambiar sin afectar a CheckoutService");
  // Beneficio 4: Se puede desplegar por separado
  console.log("  ✅ Puedes deployar CheckoutService sin deployar StripeGateway");
  // Beneficio 5: Nuevas pasarelas sin tocar código existente
  console.log("  ✅ Agregar MercadoPago = crear una nueva clase, nada más");
  console.log("");
  // La clave del desacoplamiento
  console.log("  📖 DESACOPLAMIENTO = Depender de CONTRATOS (interfaces),");
  console.log("     no de IMPLEMENTACIONES concretas.");
  console.log("     El enchufe no sabe si es una licuadora o una tostadora.");
  console.log("     Solo sabe que el aparato tiene 2 clavijas. ¡Eso es todo!");
}

// Ejecutamos la función principal
main();
