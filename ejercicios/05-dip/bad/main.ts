// ============================================================================
// ❌ MAL EJEMPLO: Violación del Principio de Inversión de Dependencias (DIP)
// ============================================================================
// 📖 PRINCIPIO: "Los módulos de alto nivel NO deben depender de
//    módulos de bajo nivel. Ambos deben depender de ABSTRACCIONES"
//    - Robert C. Martin, Clean Architecture Cap. 11
//
// 🚨 PROBLEMA: NotificationService (alto nivel) depende DIRECTAMENTE de
//    GmailSender y TwilioSMS (bajo nivel). Si quieres cambiar de Gmail
//    a SendGrid, debes MODIFICAR NotificationService.
//
//    En Clean Architecture: las flechas de dependencia del código fuente
//    deben apuntar hacia las ABSTRACCIONES, no hacia los detalles.
// ============================================================================

// ❌ Módulo de BAJO nivel: implementación concreta de email via Gmail
// Este es un "detalle" - una tecnología específica
class GmailSender {
  // Simulamos la API específica de Gmail
  sendGmail(to: string, subject: string, body: string): void {
    console.log(`  📧 Gmail API: Enviando a ${to}`);
    console.log(`     Asunto: ${subject}`);
    console.log(`     Cuerpo: ${body}`);
    console.log(`     ✅ Email enviado via smtp.gmail.com`);
  }
}

// ❌ Módulo de BAJO nivel: implementación concreta de SMS via Twilio
class TwilioSMS {
  // Simulamos la API específica de Twilio
  sendTwilioMessage(phoneNumber: string, message: string): void {
    console.log(`  📱 Twilio API: Enviando SMS a ${phoneNumber}`);
    console.log(`     Mensaje: ${message}`);
    console.log(`     ✅ SMS enviado via api.twilio.com`);
  }
}

// ❌ Módulo de ALTO nivel: depende DIRECTAMENTE de los módulos de bajo nivel
// NotificationService está "casado" con Gmail y Twilio
class NotificationService {
  // ❌ Dependencias CONCRETAS directas - no hay abstracción intermedia
  // Si Gmail cambia su API, NotificationService se rompe
  private gmailSender: GmailSender;
  // Si quieres reemplazar Twilio por AWS SNS, debes modificar ESTA clase
  private twilioSMS: TwilioSMS;

  constructor() {
    // ❌ Creamos las instancias directamente DENTRO del constructor
    // No hay forma de inyectar alternativas (testing, staging, etc.)
    this.gmailSender = new GmailSender();
    this.twilioSMS = new TwilioSMS();
  }

  // ❌ Este método conoce DETALLES de la API de Gmail (sendGmail)
  notifyByEmail(userEmail: string, message: string): void {
    console.log(`\n📧 Notificando por email a ${userEmail}...`);
    // ❌ Llamada directa a la API específica de Gmail
    this.gmailSender.sendGmail(
      userEmail,
      "Notificación del Sistema",
      message
    );
  }

  // ❌ Este método conoce DETALLES de la API de Twilio (sendTwilioMessage)
  notifyBySMS(phoneNumber: string, message: string): void {
    console.log(`\n📱 Notificando por SMS a ${phoneNumber}...`);
    // ❌ Llamada directa a la API específica de Twilio
    this.twilioSMS.sendTwilioMessage(phoneNumber, message);
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO - Violación de DIP");
  console.log("=".repeat(50));

  // ❌ No hay forma de inyectar un mock para testing
  // NotificationService siempre usa Gmail y Twilio "reales"
  const notifier = new NotificationService();

  notifier.notifyByEmail("usuario@ejemplo.com", "Tu pago fue procesado");
  notifier.notifyBySMS("+57-300-1234567", "Pago de $100 confirmado");

  console.log("\n⚠️  PROBLEMAS DE VIOLAR DIP:");
  console.log("  ❌ Para cambiar de Gmail a SendGrid, hay que modificar NotificationService");
  console.log("  ❌ Para testing necesitas Gmail y Twilio reales (¡o mockear clases!)");
  console.log("  ❌ NotificationService conoce APIs específicas de Gmail y Twilio");
  console.log("  ❌ El alto nivel (NotificationService) depende del bajo nivel (Gmail)");
  console.log("  ❌ Un cambio en la API de Twilio rompe NotificationService");
  console.log("  ❌ Las dependencias apuntan hacia AFUERA (frameworks), no hacia adentro");
}

main();
