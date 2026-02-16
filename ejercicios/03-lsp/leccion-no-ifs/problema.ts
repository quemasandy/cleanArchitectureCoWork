// ============================================================================
// ❌ MAL EJEMPLO: "Oye, ¿tú de qué tipo eres?" — El sistema lleno de IFs
// ============================================================================
//
// 📖 LECCIÓN: ¿Por qué queremos evitar preguntar "¿de qué tipo eres?"
//
// 🚨 EL PROBLEMA:
//    Cuando tu código está lleno de:
//      if (animal instanceof Perro) { ... }
//      else if (animal instanceof Gato) { ... }
//      else if (animal instanceof Pez) { ... }
//
//    Estás INTERROGANDO al objeto: "¿Tú qué eres?"
//    En vez de simplemente PEDIRLE que haga lo que sabe hacer.
//
// 💣 ¿POR QUÉ ES MALO?
//    1. Cada vez que agregas un tipo nuevo → tocas TODAS las funciones con IFs
//    2. Si olvidas un IF en alguna función → bug en producción
//    3. El código crece horizontalmente (más IFs) en vez de verticalmente (más clases)
//    4. Viola OCP: modificas código existente en vez de extenderlo
//    5. Viola LSP: si necesitas preguntar el tipo, los hijos NO son sustituibles
//
// 🎯 EN ESTE EJEMPLO:
//    Un sistema de notificaciones donde CADA función pregunta:
//    "¿Oye, tú de qué tipo eres?" antes de actuar.
// ============================================================================

// ============================================================================
// 📦 Tipos de notificación — todos heredan de una clase genérica
// ============================================================================

// Clase base genérica para todas las notificaciones
class AppNotification {
  // Almacena el mensaje de la notificación
  constructor(public message: string) { }
}

// Notificación por email — hereda de AppNotification
class EmailNotif extends AppNotification {
  // Almacena el correo del destinatario
  public to: string;

  constructor(to: string, message: string) {
    // Llama al constructor padre para guardar el mensaje
    super(message);
    // Guarda el correo destino
    this.to = to;
  }
}

// Notificación por SMS — hereda de AppNotification
class SMSNotif extends AppNotification {
  // Almacena el número de teléfono
  public phoneNumber: string;

  constructor(phoneNumber: string, message: string) {
    // Llama al constructor padre para guardar el mensaje
    super(message);
    // Guarda el número de teléfono
    this.phoneNumber = phoneNumber;
  }
}

// Notificación push — hereda de AppNotification
class PushNotif extends AppNotification {
  // Almacena el ID del dispositivo
  public deviceId: string;

  constructor(deviceId: string, message: string) {
    // Llama al constructor padre para guardar el mensaje
    super(message);
    // Guarda el ID del dispositivo
    this.deviceId = deviceId;
  }
}

// ============================================================================
// ❌ Función 1: Enviar notificación — LLENA DE IFs
// ============================================================================
// 🚨 Esta función INTERROGA al objeto: "¿Tú de qué tipo eres?"
function sendNotification(notification: AppNotification): string {
  // ❌ IF 1: ¿Eres un email?
  if (notification instanceof EmailNotif) {
    // Accede a la propiedad específica de email
    return `📧 Enviando email a ${notification.to}: "${notification.message}"`;
  }
  // ❌ IF 2: ¿Eres un SMS?
  else if (notification instanceof SMSNotif) {
    // Accede a la propiedad específica de SMS
    return `📱 Enviando SMS a ${notification.phoneNumber}: "${notification.message}"`;
  }
  // ❌ IF 3: ¿Eres un push?
  else if (notification instanceof PushNotif) {
    // Accede a la propiedad específica de push
    return `🔔 Enviando push a dispositivo ${notification.deviceId}: "${notification.message}"`;
  }
  // ❌ Si no eres ninguno conocido... ¿qué hacemos?
  else {
    // Este else es una TRAMPA: si agregan un tipo nuevo y olvidan el IF, cae aquí
    return `⚠️ Tipo de notificación desconocido`;
  }
}

// ============================================================================
// ❌ Función 2: Formatear notificación — OTRA VEZ llena de IFs
// ============================================================================
// 🚨 DE NUEVO preguntamos "¿tú de qué tipo eres?"
function formatNotification(notification: AppNotification): string {
  // ❌ IF 1: ¿Eres email?
  if (notification instanceof EmailNotif) {
    // Formato específico para email
    return `[EMAIL → ${notification.to}] ${notification.message}`;
  }
  // ❌ IF 2: ¿Eres SMS?
  else if (notification instanceof SMSNotif) {
    // Formato específico para SMS (máximo 160 caracteres)
    const truncated = notification.message.substring(0, 160);
    return `[SMS → ${notification.phoneNumber}] ${truncated}`;
  }
  // ❌ IF 3: ¿Eres push?
  else if (notification instanceof PushNotif) {
    // Formato específico para push (máximo 50 caracteres)
    const truncated = notification.message.substring(0, 50);
    return `[PUSH → ${notification.deviceId}] ${truncated}`;
  }
  // ❌ Tipo desconocido
  else {
    return `[???] ${notification.message}`;
  }
}

// ============================================================================
// ❌ Función 3: Obtener costo — Y OTRA VEZ los mismos IFs
// ============================================================================
// 🚨 TERCERA FUNCIÓN que interroga "¿tú de qué tipo eres?"
function getNotificationCost(notification: AppNotification): number {
  // ❌ IF 1: ¿Eres email?
  if (notification instanceof EmailNotif) {
    // Email es gratis
    return 0;
  }
  // ❌ IF 2: ¿Eres SMS?
  else if (notification instanceof SMSNotif) {
    // SMS cuesta $0.05
    return 0.05;
  }
  // ❌ IF 3: ¿Eres push?
  else if (notification instanceof PushNotif) {
    // Push cuesta $0.01
    return 0.01;
  }
  // ❌ Tipo desconocido
  else {
    return 0;
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO — Sistema lleno de IFs '¿Tú de qué tipo eres?'");
  console.log("=".repeat(60));

  // Creamos una notificación de cada tipo
  const notifications: AppNotification[] = [
    // Notificación por email
    new EmailNotif("ana@email.com", "Tu pedido ha sido enviado"),
    // Notificación por SMS
    new SMSNotif("+52-555-1234", "Código de verificación: 7742"),
    // Notificación push
    new PushNotif("device-abc-123", "Tienes 3 mensajes nuevos"),
  ];

  // Enviamos cada notificación
  console.log("\n📤 Enviando notificaciones:\n");
  for (const n of notifications) {
    // Cada llamada a sendNotification internamente pregunta "¿tú de qué tipo eres?"
    console.log(`  ${sendNotification(n)}`);
  }

  // Formateamos cada notificación
  console.log("\n📋 Formateando notificaciones:\n");
  for (const n of notifications) {
    // Cada llamada a formatNotification OTRA VEZ pregunta "¿tú de qué tipo eres?"
    console.log(`  ${formatNotification(n)}`);
  }

  // Calculamos costos
  console.log("\n💰 Costos:\n");
  for (const n of notifications) {
    // Cada llamada a getNotificationCost OTRA VEZ pregunta "¿tú de qué tipo eres?"
    console.log(`  $${getNotificationCost(n).toFixed(2)}`);
  }

  // Mostramos el problema
  console.log("\n" + "=".repeat(60));
  console.log("💣 ¿QUÉ PASA SI AGREGAMOS UN NUEVO TIPO?");
  console.log("=".repeat(60));
  console.log("");
  console.log("  Imagina que llega un nuevo requisito: WhatsApp Notification 📲");
  console.log("");
  console.log("  Tendrías que:");
  console.log("  ❌ Agregar un IF en sendNotification()     → ¿Y si lo olvidas?");
  console.log("  ❌ Agregar un IF en formatNotification()    → ¿Y si lo olvidas?");
  console.log("  ❌ Agregar un IF en getNotificationCost()   → ¿Y si lo olvidas?");
  console.log("  ❌ Agregar un IF en CADA función futura     → ¿Y si lo olvidas?");
  console.log("");
  console.log("  📊 CONTEO DE CAMBIOS:");
  console.log("     3 funciones × 1 IF nuevo = 3 lugares que modificar");
  console.log("     Con 10 funciones serían 10 lugares");
  console.log("     Con 20 funciones serían 20 lugares");
  console.log("     ¡Y CADA nuevo tipo multiplica el problema! 💥");
  console.log("");
  console.log("  🔑 REGLA:");
  console.log('     Si para agregar algo NUEVO tienes que MODIFICAR código existente,');
  console.log("     tu diseño está roto.");
  console.log("");
  console.log("  ▶️  Ejecuta la solución:");
  console.log("     npx ts-node ejercicios/03-lsp/leccion-no-ifs/solucion.ts");
}

// Ejecutar
main();
