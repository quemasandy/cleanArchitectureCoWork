// ============================================================================
// ✅ SOLUCIÓN: Código CON abstracciones - depende de contratos, no de proveedores
// ============================================================================
// 📖 LECCIÓN (Clean Architecture - Capítulos 11 y 22):
//
//    Una ABSTRACCIÓN (interface) es como un ENCHUFE DE PARED:
//
//    🔌 El enchufe define LA FORMA (2 pines, 120V, corriente alterna)
//    🔌 Cualquier aparato que cumpla esa forma puede conectarse
//    🔌 La pared NO SABE si es un televisor, una licuadora o un cargador
//    🔌 El aparato NO SABE si la electricidad viene de solar, eólica o nuclear
//
//    En código:
//    → La INTERFACE es el enchufe (define el contrato: QUÉ se hace)
//    → La IMPLEMENTACIÓN es el aparato (define CÓMO se hace)
//    → El SERVICIO es la pared (usa el enchufe, no le importa el aparato)
//
//    BENEFICIOS:
//    ✅ Puedes cambiar Gmail por SendGrid sin tocar el servicio
//    ✅ Puedes testear con un "mock" que no envía emails reales
//    ✅ Cada implementación se puede desarrollar por separado
//    ✅ El servicio solo conoce el CONTRATO, no los detalles
// ============================================================================

// ============================================================================
// 🟢 PASO 1: Definir las ABSTRACCIONES (Interfaces)
// ============================================================================
// 📖 Las interfaces definen el CONTRATO: "qué necesito que hagas"
//    NO dicen CÓMO hacerlo. Eso lo decide cada implementación.
//    Son como el enchufe: definen la forma, no el aparato.
// ============================================================================

// ✅ Abstracción: contrato para enviar emails
// Cualquier proveedor de email debe cumplir este contrato
interface EmailSender {
  send(to: string, subject: string, body: string): boolean; // Enviar un email
}

// ✅ Abstracción: contrato para enviar SMS
// Cualquier proveedor de SMS debe cumplir este contrato
interface SmsSender {
  send(phoneNumber: string, message: string): boolean; // Enviar un SMS
}

// ✅ Abstracción: contrato para enviar push notifications
// Cualquier proveedor de push debe cumplir este contrato
interface PushSender {
  send(deviceToken: string, title: string, body: string): boolean; // Enviar push
}

// ============================================================================
// 🟡 PASO 2: El servicio depende de ABSTRACCIONES, no de implementaciones
// ============================================================================
// 📖 NotificationService ya NO sabe qué proveedor se usa.
//    Solo sabe que existe "algo" que cumple el contrato EmailSender,
//    "algo" que cumple SmsSender, y "algo" que cumple PushSender.
//    Es como la pared: tiene enchufes, no le importa qué conectes.
// ============================================================================

// ✅ Servicio que depende de INTERFACES (abstracciones)
// Puede funcionar con CUALQUIER proveedor que cumpla los contratos
class NotificationService {
  // ✅ Dependencias son INTERFACES, no clases concretas
  // No dice "GmailEmailSender", dice "EmailSender" (el contrato)
  constructor(
    private emailSender: EmailSender, // Contrato de email (¿Gmail? ¿SendGrid? No importa)
    private smsSender: SmsSender,     // Contrato de SMS (¿Twilio? ¿Vonage? No importa)
    private pushSender: PushSender    // Contrato de push (¿Firebase? ¿OneSignal? No importa)
  ) { }
  // ✅ NOTA: Las dependencias se INYECTAN desde afuera (Dependency Injection)
  //    El servicio no crea nada, solo RECIBE lo que necesita

  // ✅ El método usa los CONTRATOS, no los detalles de cada proveedor
  notifyUser(event: string, user: {
    name: string;         // Nombre del usuario
    email: string;        // Email del usuario
    phone: string;        // Teléfono del usuario
    deviceToken: string;  // Token del dispositivo
  }): void {
    console.log(`\n  🔔 Notificando a ${user.name} sobre: ${event}`); // Log del evento
    console.log("  " + "-".repeat(40));

    // ✅ Llama al CONTRATO "send" - no sabe si es Gmail, SendGrid, etc.
    this.emailSender.send(
      user.email,                       // Destinatario
      `Notificación: ${event}`,         // Asunto
      `Hola ${user.name}, ${event}`     // Cuerpo
    );

    // ✅ Llama al CONTRATO "send" - no sabe si es Twilio, Vonage, etc.
    this.smsSender.send(
      user.phone,                       // Número de teléfono
      `[App] ${event}`                  // Mensaje SMS
    );

    // ✅ Llama al CONTRATO "send" - no sabe si es Firebase, OneSignal, etc.
    this.pushSender.send(
      user.deviceToken,                 // Token del dispositivo
      "Notificación",                   // Título
      event                             // Contenido
    );
  }
}

// ============================================================================
// 🟠 PASO 3: Implementaciones CONCRETAS (los "aparatos" que se enchufan)
// ============================================================================
// 📖 Cada implementación cumple el contrato de su interface.
//    Puedes tener múltiples implementaciones del mismo contrato.
//    Cambiar de proveedor = cambiar de "aparato", sin tocar el "enchufe".
// ============================================================================

// ─── IMPLEMENTACIONES DE EMAIL ─────────────────────────────────────────────

// ✅ Implementación: Gmail cumple el contrato EmailSender
class GmailEmailSender implements EmailSender {
  // API Key específica de Gmail (detalle de implementación)
  private apiKey: string = "gmail-api-key-12345";

  // ✅ Implementa el método "send" del contrato EmailSender
  send(to: string, subject: string, body: string): boolean {
    console.log(`  📧 [Gmail] Key: ${this.apiKey} → ${to}: "${subject}"`); // Detalle de Gmail
    return true; // Simulamos envío exitoso
  }
}

// ✅ Implementación ALTERNATIVA: SendGrid también cumple EmailSender
// ¡Se puede usar en vez de Gmail sin cambiar NotificationService!
class SendGridEmailSender implements EmailSender {
  // API Key específica de SendGrid (detalle de implementación)
  private apiKey: string = "sendgrid-key-78901";

  // ✅ Implementa el MISMO contrato "send" de EmailSender
  send(to: string, subject: string, body: string): boolean {
    console.log(`  📧 [SendGrid] Key: ${this.apiKey} → ${to}: "${subject}"`); // Detalle de SendGrid
    return true; // Simulamos envío exitoso
  }
}

// ─── IMPLEMENTACIONES DE SMS ────────────────────────────────────────────────

// ✅ Implementación: Twilio cumple el contrato SmsSender
class TwilioSmsSender implements SmsSender {
  // Credenciales específicas de Twilio (detalle de implementación)
  private accountSid: string = "twilio-sid-67890";

  // ✅ Implementa el método "send" del contrato SmsSender
  send(phoneNumber: string, message: string): boolean {
    console.log(`  📱 [Twilio] SID: ${this.accountSid} → ${phoneNumber}: "${message}"`); // Detalle de Twilio
    return true; // Simulamos envío exitoso
  }
}

// ✅ Implementación ALTERNATIVA: Vonage también cumple SmsSender
class VonageSmsSender implements SmsSender {
  // API Key específica de Vonage
  private apiKey: string = "vonage-key-54321";

  // ✅ Implementa el MISMO contrato "send" de SmsSender
  send(phoneNumber: string, message: string): boolean {
    console.log(`  📱 [Vonage] Key: ${this.apiKey} → ${phoneNumber}: "${message}"`); // Detalle de Vonage
    return true; // Simulamos envío exitoso
  }
}

// ─── IMPLEMENTACIONES DE PUSH ───────────────────────────────────────────────

// ✅ Implementación: Firebase cumple el contrato PushSender
class FirebasePushSender implements PushSender {
  // Project ID específico de Firebase (detalle de implementación)
  private projectId: string = "my-firebase-project";

  // ✅ Implementa el método "send" del contrato PushSender
  send(deviceToken: string, title: string, body: string): boolean {
    console.log(`  🔔 [Firebase] Project: ${this.projectId} → ${title}: "${body}"`); // Detalle de Firebase
    return true; // Simulamos envío exitoso
  }
}

// ✅ Implementación ALTERNATIVA: OneSignal también cumple PushSender
class OneSignalPushSender implements PushSender {
  // App ID específico de OneSignal
  private appId: string = "onesignal-app-abcde";

  // ✅ Implementa el MISMO contrato "send" de PushSender
  send(deviceToken: string, title: string, body: string): boolean {
    console.log(`  🔔 [OneSignal] App: ${this.appId} → ${title}: "${body}"`); // Detalle de OneSignal
    return true; // Simulamos envío exitoso
  }
}

// ─── IMPLEMENTACIÓN PARA TESTING ────────────────────────────────────────────

// ✅ Implementación para TESTS: no envía nada real, solo guarda los datos
// ¡Esto es IMPOSIBLE sin abstracciones!
class FakeEmailSender implements EmailSender {
  // Guardamos los emails "enviados" para verificar en tests
  public sentEmails: { to: string; subject: string; body: string }[] = [];

  // ✅ No envía nada real, solo registra
  send(to: string, subject: string, body: string): boolean {
    this.sentEmails.push({ to, subject, body }); // Guardamos en memoria
    console.log(`  📧 [FAKE] Email registrado (no enviado): ${to}`); // Log para demo
    return true; // Siempre "exitoso"
  }
}

// ============================================================================
// 🏃 EJECUCIÓN - Demostración del poder de las abstracciones
// ============================================================================
function main(): void {
  console.log("✅ SOLUCIÓN - Con Abstracciones (enchufables)");
  console.log("=".repeat(55));

  // Datos del usuario para notificar
  const user = {
    name: "Carlos García",               // Nombre del usuario
    email: "carlos@mail.com",            // Email del usuario
    phone: "+57 300 123 4567",           // Teléfono del usuario
    deviceToken: "device-token-abc-123", // Token del dispositivo
  };

  // ============================================================================
  // ESCENARIO 1: Producción con Gmail + Twilio + Firebase
  // ============================================================================
  console.log("\n📋 ESCENARIO 1: Producción (Gmail + Twilio + Firebase)");
  console.log("=".repeat(50));

  // ✅ Composición: elegimos QUÉ implementaciones usar
  const prodService = new NotificationService(
    new GmailEmailSender(),      // "Enchufamos" Gmail como proveedor de email
    new TwilioSmsSender(),       // "Enchufamos" Twilio como proveedor de SMS
    new FirebasePushSender()     // "Enchufamos" Firebase como proveedor de push
  );

  prodService.notifyUser("Tu compra #12345 ha sido confirmada", user);

  // ============================================================================
  // ESCENARIO 2: Migración a SendGrid + Vonage + OneSignal
  // ============================================================================
  console.log("\n\n📋 ESCENARIO 2: Migración (SendGrid + Vonage + OneSignal)");
  console.log("=".repeat(50));

  // ✅ ¡CERO cambios en NotificationService!
  // Solo cambiamos qué "aparatos" enchufamos
  const migratedService = new NotificationService(
    new SendGridEmailSender(),   // "Desenchufamos" Gmail, "enchufamos" SendGrid
    new VonageSmsSender(),       // "Desenchufamos" Twilio, "enchufamos" Vonage
    new OneSignalPushSender()    // "Desenchufamos" Firebase, "enchufamos" OneSignal
  );

  migratedService.notifyUser("Tu compra #12345 ha sido confirmada", user);

  // ============================================================================
  // ESCENARIO 3: Testing con mocks
  // ============================================================================
  console.log("\n\n📋 ESCENARIO 3: Testing (sin enviar nada real)");
  console.log("=".repeat(50));

  // ✅ Para tests, usamos implementaciones FALSAS
  const fakeEmail = new FakeEmailSender();          // No envía emails reales
  const testService = new NotificationService(
    fakeEmail,                   // "Enchufamos" el fake de email
    new TwilioSmsSender(),       // Podríamos usar fakes para todos
    new FirebasePushSender()     // Podríamos usar fakes para todos
  );

  testService.notifyUser("Test de notificación", user);

  // ✅ En un test real, verificaríamos los datos capturados
  console.log(`\n  🧪 [TEST] Emails capturados: ${fakeEmail.sentEmails.length}`);
  console.log(`  🧪 [TEST] Último email a: ${fakeEmail.sentEmails[0]?.to}`);
  console.log(`  🧪 [TEST] Asunto: ${fakeEmail.sentEmails[0]?.subject}`);

  // ============================================================================
  // 📖 RESUMEN
  // ============================================================================
  console.log("\n\n" + "=".repeat(55));
  console.log("📖 RESUMEN: ¿QUÉ ES UNA ABSTRACCIÓN?");
  console.log("=".repeat(55));
  console.log("\n  🔌 ANALOGÍA DEL ENCHUFE:");
  console.log("     • Interface = Enchufe (define la FORMA del contrato)");
  console.log("     • Implementación = Aparato (cumple el contrato a su manera)");
  console.log("     • Servicio = Pared (tiene enchufes, no le importa qué conectes)");
  console.log("\n  ✅ CON abstracciones puedes:");
  console.log("     • Cambiar Gmail → SendGrid sin tocar NotificationService");
  console.log("     • Testear con FakeEmailSender (sin enviar emails reales)");
  console.log("     • Tener múltiples implementaciones del mismo contrato");
  console.log("     • Desarrollar el servicio y los proveedores por separado");
  console.log("\n  ❌ SIN abstracciones:");
  console.log("     • Cambiar proveedor = reescribir el servicio");
  console.log("     • Testear = enviar emails/SMS reales (o no testear)");
  console.log("     • Todo está soldado a implementaciones específicas");
  console.log("\n  💡 REGLA: 'Depende de abstracciones, no de concreciones'");
  console.log("     → Tu código de negocio define QUÉ necesita (interface)");
  console.log("     → Los detalles implementan CÓMO hacerlo (class)");
}

// Ejecutamos el programa principal
main();
