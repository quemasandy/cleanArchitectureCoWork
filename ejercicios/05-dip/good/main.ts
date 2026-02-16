// ============================================================================
// ✅ BUEN EJEMPLO: Aplicación del Principio de Inversión de Dependencias (DIP)
// ============================================================================
// 📖 PRINCIPIO: "Los módulos de alto nivel NO deben depender de
//    módulos de bajo nivel. Ambos deben depender de ABSTRACCIONES"
//    - Robert C. Martin, Clean Architecture Cap. 11
//
// ✅ SOLUCIÓN: Creamos interfaces (abstracciones) que definen el contrato.
//    - NotificationService depende de la INTERFACE, no de Gmail/Twilio
//    - Gmail y Twilio IMPLEMENTAN la interface
//    - Las dependencias se INYECTAN desde afuera (Dependency Injection)
//
//    Resultado: puedes cambiar de Gmail a SendGrid sin tocar
//    NotificationService. Y puedes testear con mocks fácilmente.
// ============================================================================

// ✅ ABSTRACCIÓN: Interface que define el contrato para enviar emails
// Definida en la capa de ALTO NIVEL (Use Cases / Domain)
// NO conoce Gmail, SendGrid, ni ningún proveedor específico
interface EmailSender {
  send(to: string, subject: string, body: string): void;
}

// ✅ ABSTRACCIÓN: Interface que define el contrato para enviar SMS
// Igualmente definida en alto nivel, sin detalles de implementación
interface SMSSender {
  send(phoneNumber: string, message: string): void;
}

// ============================================================================
// ✅ IMPLEMENTACIONES DE BAJO NIVEL
// Estas clases dependen de la abstracción (implementan la interface)
// Son "detalles" que pueden cambiarse sin afectar al alto nivel
// ============================================================================

// ✅ Implementación concreta: Gmail cumple el contrato de EmailSender
class GmailEmailSender implements EmailSender {
  send(to: string, subject: string, body: string): void {
    // Detalles específicos de Gmail encapsulados aquí
    console.log(`  📧 Gmail: Enviando a ${to}`);
    console.log(`     Asunto: ${subject}`);
    console.log(`     Cuerpo: ${body}`);
    console.log(`     ✅ Enviado via smtp.gmail.com`);
  }
}

// ✅ Implementación alternativa: SendGrid también cumple el contrato
// Para cambiar de Gmail a SendGrid, NO tocamos NotificationService
class SendGridEmailSender implements EmailSender {
  send(to: string, subject: string, body: string): void {
    // Detalles específicos de SendGrid encapsulados aquí
    console.log(`  📧 SendGrid: Enviando a ${to}`);
    console.log(`     Asunto: ${subject}`);
    console.log(`     Cuerpo: ${body}`);
    console.log(`     ✅ Enviado via api.sendgrid.com`);
  }
}

// ✅ Implementación concreta: Twilio cumple el contrato de SMSSender
class TwilioSMSSender implements SMSSender {
  send(phoneNumber: string, message: string): void {
    console.log(`  📱 Twilio: Enviando SMS a ${phoneNumber}`);
    console.log(`     Mensaje: ${message}`);
    console.log(`     ✅ Enviado via api.twilio.com`);
  }
}

// ✅ Implementación para testing: Mock que no envía nada real
// Perfecta para pruebas unitarias sin dependencias externas
class MockEmailSender implements EmailSender {
  // Registramos los emails enviados para verificar en tests
  public sentEmails: { to: string; subject: string; body: string }[] = [];

  send(to: string, subject: string, body: string): void {
    // No enviamos nada real, solo registramos
    this.sentEmails.push({ to, subject, body });
    console.log(`  🧪 Mock: Email registrado para ${to} (no enviado realmente)`);
  }
}

// ============================================================================
// ✅ MÓDULO DE ALTO NIVEL: depende de ABSTRACCIONES, no de detalles
// NotificationService NO conoce Gmail, SendGrid, ni Twilio
// Solo conoce las interfaces EmailSender y SMSSender
// ============================================================================
class NotificationService {
  // ✅ Dependencias son INTERFACES, no clases concretas
  constructor(
    private emailSender: EmailSender,
    private smsSender: SMSSender
  ) {
    // ✅ No creamos instancias aquí - se INYECTAN desde afuera
    // Esto es "Inversión de Control" (IoC)
  }

  // ✅ Usa la abstracción - funciona con Gmail, SendGrid, o Mock
  notifyByEmail(userEmail: string, message: string): void {
    console.log(`\n📧 Notificando por email a ${userEmail}...`);
    // Llamamos al método genérico de la interface, no a sendGmail()
    this.emailSender.send(userEmail, "Notificación del Sistema", message);
  }

  // ✅ Usa la abstracción - funciona con Twilio, AWS SNS, o Mock
  notifyBySMS(phoneNumber: string, message: string): void {
    console.log(`\n📱 Notificando por SMS a ${phoneNumber}...`);
    this.smsSender.send(phoneNumber, message);
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO - Aplicación de DIP");
  console.log("=".repeat(50));

  // ✅ ESCENARIO 1: Producción con Gmail + Twilio
  console.log("\n🏭 ESCENARIO 1: Producción (Gmail + Twilio)");
  console.log("-".repeat(40));
  const prodNotifier = new NotificationService(
    new GmailEmailSender(),   // Inyectamos Gmail
    new TwilioSMSSender()     // Inyectamos Twilio
  );
  prodNotifier.notifyByEmail("usuario@ejemplo.com", "Pago procesado");
  prodNotifier.notifyBySMS("+57-300-1234567", "Pago de $100 confirmado");

  // ✅ ESCENARIO 2: Cambiar a SendGrid - SIN tocar NotificationService
  console.log("\n\n🔄 ESCENARIO 2: Migración a SendGrid (sin cambios en lógica)");
  console.log("-".repeat(40));
  const sgNotifier = new NotificationService(
    new SendGridEmailSender(), // ¡Solo cambiamos la inyección!
    new TwilioSMSSender()
  );
  sgNotifier.notifyByEmail("usuario@ejemplo.com", "Pago procesado (SendGrid)");

  // ✅ ESCENARIO 3: Testing con mocks - sin enviar emails reales
  console.log("\n\n🧪 ESCENARIO 3: Testing (Mock - no envía nada real)");
  console.log("-".repeat(40));
  const mockEmail = new MockEmailSender();
  const testNotifier = new NotificationService(
    mockEmail,
    new TwilioSMSSender()
  );
  testNotifier.notifyByEmail("test@test.com", "Test de notificación");

  // ✅ Podemos verificar los emails enviados sin un servidor real
  console.log(`\n  📊 Emails registrados en mock: ${mockEmail.sentEmails.length}`);
  console.log(`  📊 Último destino: ${mockEmail.sentEmails[0].to}`);

  console.log("\n\n🎯 BENEFICIOS DE DIP:");
  console.log("  ✅ Cambiar Gmail → SendGrid = solo cambiar la inyección");
  console.log("  ✅ NotificationService NUNCA cambia al cambiar proveedores");
  console.log("  ✅ Testing con mocks: sin enviar emails/SMS reales");
  console.log("  ✅ Alto nivel (Service) NO depende de bajo nivel (Gmail)");
  console.log("  ✅ Ambos dependen de la ABSTRACCIÓN (interfaces)");
  console.log("  ✅ Las dependencias apuntan HACIA ADENTRO (hacia abstracciones)");
}

main();
