// ============================================================================
// ✅ SOLUCIÓN: No preguntes "¿tú de qué tipo eres?" — Déjalo que lo haga él
// ============================================================================
//
// 📖 LECCIÓN: En vez de INTERROGAR al objeto, PÍDELE que actúe.
//
// ❌ ANTES (interrogatorio):
//    if (n instanceof EmailNotif) { enviarPorEmail(n) }
//    else if (n instanceof SMSNotif) { enviarPorSMS(n) }
//    → TÚ decides qué hacer basándote en el tipo
//
// ✅ AHORA (polimorfismo):
//    n.send()
//    → El OBJETO decide qué hacer. Él ya sabe lo que es.
//
// 🔑 TRES SOLUCIONES para eliminar los IFs de tipo:
//
//    1. POLIMORFISMO: Cada clase implementa sus propios métodos
//       → El objeto sabe qué hacer, no le preguntes
//
//    2. INTERFACES: Define un contrato que todos cumplen
//       → Todas las notificaciones tienen send(), format(), getCost()
//
//    3. STRATEGY PATTERN: Inyecta el comportamiento desde afuera
//       → Pasas una "estrategia" que sabe cómo enviar
//
//    Este ejemplo usa las soluciones 1 y 2 juntas.
// ============================================================================

// ============================================================================
// 📦 Interface: El contrato que TODOS deben cumplir
// ============================================================================
// ✅ Cada notificación SABE cómo enviarse, formatearse y cuánto cuesta
// Ya no necesitamos preguntarle "¿tú de qué tipo eres?"
interface AppNotification {
  // El mensaje de la notificación
  readonly message: string;

  // ✅ Cada notificación sabe cómo ENVIARSE a sí misma
  send(): string;

  // ✅ Cada notificación sabe cómo FORMATEARSE a sí misma
  format(): string;

  // ✅ Cada notificación sabe cuánto CUESTA
  getCost(): number;
}

// ============================================================================
// 📧 EmailNotif — sabe todo sobre sí misma
// ============================================================================
class EmailNotif implements AppNotification {
  // Almacena el mensaje
  readonly message: string;
  // Almacena el correo destino
  private to: string;

  constructor(to: string, message: string) {
    // Guarda el correo
    this.to = to;
    // Guarda el mensaje
    this.message = message;
  }

  // ✅ YO sé cómo enviarme — no me preguntes qué tipo soy
  send(): string {
    // El email se envía a sí mismo al correo destino
    return `📧 Enviando email a ${this.to}: "${this.message}"`;
  }

  // ✅ YO sé cómo formatearme
  format(): string {
    // Formato específico de email
    return `[EMAIL → ${this.to}] ${this.message}`;
  }

  // ✅ YO sé cuánto cuesto
  getCost(): number {
    // Email es gratis
    return 0;
  }
}

// ============================================================================
// 📱 SMSNotif — sabe todo sobre sí misma
// ============================================================================
class SMSNotif implements AppNotification {
  // Almacena el mensaje
  readonly message: string;
  // Almacena el número de teléfono
  private phoneNumber: string;

  constructor(phoneNumber: string, message: string) {
    // Guarda el número
    this.phoneNumber = phoneNumber;
    // Guarda el mensaje
    this.message = message;
  }

  // ✅ YO sé cómo enviarme
  send(): string {
    // El SMS se envía al número de teléfono
    return `📱 Enviando SMS a ${this.phoneNumber}: "${this.message}"`;
  }

  // ✅ YO sé cómo formatearme (con límite de 160 chars)
  format(): string {
    // Trunca el mensaje a 160 caracteres como lo requiere SMS
    const truncated = this.message.substring(0, 160);
    // Retorna con formato de SMS
    return `[SMS → ${this.phoneNumber}] ${truncated}`;
  }

  // ✅ YO sé cuánto cuesto
  getCost(): number {
    // SMS cuesta $0.05
    return 0.05;
  }
}

// ============================================================================
// 🔔 PushNotif — sabe todo sobre sí misma
// ============================================================================
class PushNotif implements AppNotification {
  // Almacena el mensaje
  readonly message: string;
  // Almacena el ID del dispositivo
  private deviceId: string;

  constructor(deviceId: string, message: string) {
    // Guarda el ID del dispositivo
    this.deviceId = deviceId;
    // Guarda el mensaje
    this.message = message;
  }

  // ✅ YO sé cómo enviarme
  send(): string {
    // La push se envía al dispositivo
    return `🔔 Enviando push a dispositivo ${this.deviceId}: "${this.message}"`;
  }

  // ✅ YO sé cómo formatearme (con límite de 50 chars)
  format(): string {
    // Trunca a 50 caracteres para push
    const truncated = this.message.substring(0, 50);
    // Retorna con formato de push
    return `[PUSH → ${this.deviceId}] ${truncated}`;
  }

  // ✅ YO sé cuánto cuesto
  getCost(): number {
    // Push cuesta $0.01
    return 0.01;
  }
}

// ============================================================================
// ✅ FUNCIONES LIMPIAS: CERO IFs, CERO instanceof, CERO "¿de qué tipo eres?"
// ============================================================================

// ✅ Enviar — simplemente le pide al objeto que se envíe
// No pregunta "¿tú eres email? ¿SMS? ¿push?"
// Solo dice: "envíate" y el objeto ya sabe cómo
function sendAll(notifications: AppNotification[]): void {
  console.log("\n📤 Enviando notificaciones:\n");
  // Itera sobre cada notificación
  for (const n of notifications) {
    // ✅ n.send() — el OBJETO decide cómo enviarse
    // No hay IFs, no hay instanceof, no hay preguntas
    console.log(`  ${n.send()}`);
  }
}

// ✅ Formatear — simplemente le pide al objeto que se formatee
function formatAll(notifications: AppNotification[]): void {
  console.log("\n📋 Formateando notificaciones:\n");
  // Itera sobre cada notificación
  for (const n of notifications) {
    // ✅ n.format() — el OBJETO decide cómo formatearse
    console.log(`  ${n.format()}`);
  }
}

// ✅ Calcular costos — simplemente le pide al objeto su costo
function calculateTotalCost(notifications: AppNotification[]): number {
  // Suma el costo de cada notificación sin preguntar qué tipo es
  let total = 0;
  for (const n of notifications) {
    // ✅ n.getCost() — el OBJETO sabe cuánto cuesta
    total += n.getCost();
  }
  // Retorna el total
  return total;
}

// ============================================================================
// 🆕 WhatsAppNotif — clase COMPLETAMENTE NUEVA
// ============================================================================
// ✅ Agregar este tipo NO requirió cambiar NINGUNA línea de código existente
// Solo creamos esta clase y automáticamente funciona con TODAS las funciones
class WhatsAppNotif implements AppNotification {
  // Almacena el mensaje
  readonly message: string;
  // Almacena el número de WhatsApp
  private phoneNumber: string;

  constructor(phoneNumber: string, message: string) {
    // Guarda el número
    this.phoneNumber = phoneNumber;
    // Guarda el mensaje
    this.message = message;
  }

  // ✅ YO sé cómo enviarme por WhatsApp
  send(): string {
    // Se envía por la API de WhatsApp
    return `📲 Enviando WhatsApp a ${this.phoneNumber}: "${this.message}"`;
  }

  // ✅ YO sé cómo formatearme
  format(): string {
    // Formato de WhatsApp con emoji
    return `[WHATSAPP → ${this.phoneNumber}] 📲 ${this.message}`;
  }

  // ✅ YO sé cuánto cuesto
  getCost(): number {
    // WhatsApp Business cuesta $0.03
    return 0.03;
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("✅ SOLUCIÓN — No preguntes '¿de qué tipo eres?'");
  console.log("=".repeat(60));

  // Creamos una lista de notificaciones usando la interface
  const notifications: AppNotification[] = [
    // Cada objeto SABE qué es y cómo actuar
    new EmailNotif("ana@email.com", "Tu pedido ha sido enviado"),
    new SMSNotif("+52-555-1234", "Código de verificación: 7742"),
    new PushNotif("device-abc-123", "Tienes 3 mensajes nuevos"),
  ];

  // ✅ Enviamos — CERO IFs
  sendAll(notifications);

  // ✅ Formateamos — CERO IFs
  formatAll(notifications);

  // ✅ Costos — CERO IFs
  const totalCost = calculateTotalCost(notifications);
  console.log(`\n💰 Costo total: $${totalCost.toFixed(2)}`);

  // ============================================================================
  // 🆕 ¡AGREGAMOS WhatsApp! Mira cuánto código EXISTENTE cambia...
  // ============================================================================
  console.log("\n" + "=".repeat(60));
  console.log("🆕 AHORA AGREGAMOS WhatsApp — ¿qué cambia?");
  console.log("=".repeat(60));
  console.log("\n  RESPUESTA: ¡NADA del código existente cambió!");
  console.log("  Solo creamos la clase WhatsAppNotif y la agregamos al array.\n");

  // ✅ Solo creamos UNA clase nueva. No tocamos NADA de lo que ya existe.
  const withWhatsApp: AppNotification[] = [
    // Reutilizamos las existentes
    ...notifications,
    // ✅ Simplemente agregamos la nueva clase al array
    new WhatsAppNotif("+52-555-9876", "¡Hola! Tu cita está confirmada"),
  ];

  // ✅ Las mismas funciones funcionan PERFECTAMENTE con el nuevo tipo
  // No tuvimos que agregar NINGÚN IF nuevo
  sendAll(withWhatsApp);
  formatAll(withWhatsApp);

  // Calculamos con el nuevo tipo incluido
  const newTotal = calculateTotalCost(withWhatsApp);
  console.log(`\n💰 Costo total (con WhatsApp): $${newTotal.toFixed(2)}`);

  // Resumen
  console.log("\n" + "=".repeat(60));
  console.log("📊 COMPARACIÓN FINAL:");
  console.log("=".repeat(60));
  console.log("");
  console.log("  ❌ CON IFs (problema.ts):");
  console.log("     Agregar WhatsApp = modificar 3 funciones existentes");
  console.log("     Agregar Telegram = modificar 3 funciones más");
  console.log("     10 tipos × 3 funciones = 30 IFs en total 💀");
  console.log("");
  console.log("  ✅ CON POLIMORFISMO (esta solución):");
  console.log("     Agregar WhatsApp = crear 1 clase nueva, 0 cambios al resto");
  console.log("     Agregar Telegram = crear 1 clase nueva, 0 cambios al resto");
  console.log("     10 tipos × 0 IFs = 0 modificaciones al código existente ✨");
  console.log("");
  console.log("  🔑 LAS 3 SOLUCIONES que aprendiste:");
  console.log('     1. POLIMORFISMO → n.send() en vez de "¿tú qué eres?"');
  console.log("     2. INTERFACES   → contrato que todos cumplen: send(), format(), getCost()");
  console.log('     3. TELL DON\'T ASK → no preguntes, pide: "hazlo tú"');
}

// Ejecutar
main();
