// ============================================================================
// ❌ PROBLEMA: Código SIN abstracciones - todo depende de lo concreto
// ============================================================================
// 📖 LECCIÓN (Clean Architecture - Capítulos 11 y 22):
//
//    Una ABSTRACCIÓN es un contrato (interface) que define QUÉ se hace,
//    pero NO dice CÓMO hacerlo. Es como un enchufe de pared:
//    → El enchufe define la FORMA (2 pines, 120V)
//    → Cualquier aparato que cumpla la forma puede conectarse
//    → No necesitas saber si es un televisor o una licuadora
//
//    Sin abstracciones, tu código queda SOLDADO a implementaciones concretas.
//    Cambiar una pieza obliga a modificar todo lo demás.
//
// 🚨 PROBLEMA ACTUAL: El servicio de notificaciones depende DIRECTAMENTE
//    de implementaciones concretas (Gmail, Twilio, Firebase).
//    Si quieres cambiar el proveedor de SMS, debes reescribir el servicio.
// ============================================================================

// ❌ Implementación concreta de envío de email via Gmail
// Esta clase sabe TODO sobre Gmail: API key, formato, conexión
class GmailEmailSender {
  // API Key de Gmail quemada en el código
  private apiKey: string = "gmail-api-key-12345";

  // Método que envía email usando la API específica de Gmail
  send(to: string, subject: string, body: string): boolean {
    console.log(`  📧 [Gmail API] Conectando con key: ${this.apiKey}...`); // Conexión a Gmail
    console.log(`  📧 [Gmail API] Enviando a: ${to}`);                     // Destinatario
    console.log(`  📧 [Gmail API] Asunto: ${subject}`);                    // Asunto
    console.log(`  📧 [Gmail API] Cuerpo: ${body}`);                      // Contenido
    return true; // Simulamos envío exitoso
  }
}

// ❌ Implementación concreta de envío de SMS via Twilio
// Esta clase sabe TODO sobre Twilio: Account SID, token, formato
class TwilioSmsSender {
  // Credenciales de Twilio quemadas en el código
  private accountSid: string = "twilio-sid-67890";
  // Token de autenticación de Twilio
  private authToken: string = "twilio-token-abcde";

  // Método que envía SMS usando la API específica de Twilio
  sendSms(phoneNumber: string, message: string): boolean {
    console.log(`  📱 [Twilio API] Account: ${this.accountSid}`);   // Autenticación
    console.log(`  📱 [Twilio API] Enviando SMS a: ${phoneNumber}`); // Número destino
    console.log(`  📱 [Twilio API] Mensaje: ${message}`);           // Contenido
    return true; // Simulamos envío exitoso
  }
}

// ❌ Implementación concreta de notificaciones push via Firebase
// Esta clase sabe TODO sobre Firebase: project ID, token, formato
class FirebasePushSender {
  // ID del proyecto Firebase quemado en el código
  private projectId: string = "my-firebase-project";

  // Método que envía push usando la API específica de Firebase
  sendPush(deviceToken: string, title: string, body: string): boolean {
    console.log(`  🔔 [Firebase API] Proyecto: ${this.projectId}`);    // Proyecto
    console.log(`  🔔 [Firebase API] Device: ${deviceToken}`);          // Token del dispositivo
    console.log(`  🔔 [Firebase API] Título: ${title} | Body: ${body}`); // Contenido
    return true; // Simulamos envío exitoso
  }
}

// ❌ Servicio de notificaciones SOLDADO a las implementaciones concretas
// Si quieres cambiar Gmail por SendGrid, debes modificar ESTA clase
// Si quieres cambiar Twilio por Vonage, debes modificar ESTA clase
// Si quieres cambiar Firebase por OneSignal, debes modificar ESTA clase
class NotificationService {
  // ❌ Dependencias CONCRETAS - conoce Gmail, Twilio y Firebase directamente
  private emailSender: GmailEmailSender;     // Sabe que es Gmail específicamente
  private smsSender: TwilioSmsSender;         // Sabe que es Twilio específicamente
  private pushSender: FirebasePushSender;     // Sabe que es Firebase específicamente

  // ❌ Constructor crea las dependencias INTERNAMENTE
  // No se pueden inyectar alternativas - todo está hardcodeado
  constructor() {
    this.emailSender = new GmailEmailSender();     // Crea Gmail directamente
    this.smsSender = new TwilioSmsSender();         // Crea Twilio directamente
    this.pushSender = new FirebasePushSender();     // Crea Firebase directamente
    // ❌ ¿Quieres usar SendGrid en vez de Gmail?
    //    Tienes que MODIFICAR esta clase
    // ❌ ¿Quieres testear sin enviar emails reales?
    //    ¡IMPOSIBLE! Siempre usa Gmail real
  }

  // ❌ Método que envía notificaciones usando las APIs concretas
  notifyUser(event: string, user: {
    name: string;         // Nombre del usuario
    email: string;        // Email del usuario
    phone: string;        // Teléfono del usuario
    deviceToken: string;  // Token del dispositivo para push
  }): void {
    console.log(`\n  🔔 Notificando a ${user.name} sobre: ${event}`); // Log del evento
    console.log("  " + "-".repeat(40));

    // ❌ Llama directamente a Gmail - acoplamiento fuerte
    // El método "send" es específico de GmailEmailSender
    this.emailSender.send(
      user.email,                            // Destinatario
      `Notificación: ${event}`,              // Asunto
      `Hola ${user.name}, ${event}`          // Cuerpo
    );

    // ❌ Llama directamente a Twilio - acoplamiento fuerte
    // El método "sendSms" es específico de TwilioSmsSender
    this.smsSender.sendSms(
      user.phone,                            // Número de teléfono
      `[App] ${event}`                       // Mensaje SMS
    );

    // ❌ Llama directamente a Firebase - acoplamiento fuerte
    // El método "sendPush" es específico de FirebasePushSender
    this.pushSender.sendPush(
      user.deviceToken,                      // Token del dispositivo
      "Notificación",                        // Título de la push
      event                                  // Contenido
    );
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ PROBLEMA - Sin Abstracciones (acoplamiento a lo concreto)");
  console.log("=".repeat(55));

  // Creamos el servicio - automáticamente crea Gmail, Twilio y Firebase
  const service = new NotificationService(); // No se puede cambiar nada

  // Caso 1: Notificación de compra
  service.notifyUser("Tu compra #12345 ha sido confirmada", {
    name: "Carlos García",                    // Nombre del usuario
    email: "carlos@mail.com",                 // Email del usuario
    phone: "+57 300 123 4567",                // Teléfono del usuario
    deviceToken: "device-token-abc-123",      // Token del dispositivo
  });

  // Caso 2: Notificación de envío
  service.notifyUser("Tu pedido está en camino", {
    name: "Ana López",                        // Nombre del usuario
    email: "ana@mail.com",                    // Email del usuario
    phone: "+57 310 987 6543",                // Teléfono del usuario
    deviceToken: "device-token-xyz-789",      // Token del dispositivo
  });

  console.log("\n\n" + "=".repeat(55));
  console.log("⚠️  PROBLEMAS SIN ABSTRACCIONES:");
  console.log("=".repeat(55));
  console.log("  ❌ NotificationService conoce Gmail, Twilio y Firebase");
  console.log("  ❌ Cambiar Gmail por SendGrid requiere MODIFICAR NotificationService");
  console.log("  ❌ No puedes testear sin enviar emails/SMS reales");
  console.log("  ❌ Cada proveedor tiene métodos DIFERENTES (send, sendSms, sendPush)");
  console.log("  ❌ Constructor crea dependencias internamente (no inyectables)");
  console.log("  ❌ Violas el Principio de Inversión de Dependencia (DIP)");
  console.log("\n🎯 TU TAREA: Refactoriza en solution.ts usando ABSTRACCIONES:");
  console.log("  📗 Crea interfaces: EmailSender, SmsSender, PushSender");
  console.log("  📗 NotificationService depende de INTERFACES, no de clases concretas");
  console.log("  📗 Las implementaciones se INYECTAN desde afuera");
}

main();
