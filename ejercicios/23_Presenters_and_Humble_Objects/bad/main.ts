// ============================================================================
// ❌ MAL EJEMPLO: La View contiene toda la lógica de presentación
// ============================================================================
// 📖 CONCEPTO (Clean Architecture Cap. 23):
//
//    El HUMBLE OBJECT PATTERN separa los comportamientos difíciles de testear
//    de los fáciles de testear. La idea es crear dos módulos:
//    - Uno "humilde" (humble): contiene lo difícil de testear (UI, BD, etc.)
//    - Uno testeable: contiene toda la lógica
//
//    Un PRESENTER es la aplicación de este patrón en el boundary de la UI.
//    El Presenter toma datos crudos y los convierte en un ViewModel
//    que la View solo tiene que MOSTRAR sin lógica.
//
//    ANALOGÍA: Piensa en un noticiero 📺
//    - El REPORTERO (Presenter) investiga, redacta y formatea la noticia
//    - El TELEPROMPTER (ViewModel) tiene el texto listo para leer
//    - El PRESENTADOR DE TV (View) solo LEE lo que dice el teleprompter
//    Si el presentador de TV empieza a investigar y redactar en vivo,
//    ¡el noticiero será un desastre!
//
// 🚨 PROBLEMA EN ESTE EJEMPLO:
//    La View (nuestra "pantalla") contiene:
//    - Formateo de moneda ($5,000.00)
//    - Formateo de fechas ("26 Jul 2026")
//    - Lógica condicional (si saldo < 500 → mostrar alerta)
//    - Cálculos (total de ingresos/egresos)
//    - Decisiones de color (verde/rojo según tipo de transacción)
//
//    ¿El resultado?
//    ❌ No puedes testear el formateo sin renderizar la UI completa
//    ❌ Si cambias de consola a HTML, debes re-implementar TODA la lógica
//    ❌ La View es compleja y propensa a bugs
//    ❌ Un cambio en "cómo se muestra la fecha" toca la View (difícil de testear)
// ============================================================================

// ============================================================================
// 🟢 CAPA 1: ENTITIES - Reglas de negocio de la empresa
// ============================================================================

// Interfaz que representa una transacción bancaria
// Contiene los datos crudos: monto como número, fecha como objeto Date
interface Transaction {
  id: string;          // Identificador único de la transacción
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER_IN" | "TRANSFER_OUT"; // Tipo de movimiento
  amount: number;      // Monto en número crudo (ej: 1500.5, no "$1,500.50")
  date: Date;          // Fecha como objeto Date (no como string formateado)
  description: string; // Descripción del movimiento
  counterparty: string; // La otra parte involucrada (quién envió/recibió)
}

// Interfaz que representa una cuenta bancaria con su estado actual
interface AccountData {
  id: string;           // Identificador de la cuenta
  ownerName: string;    // Nombre del titular
  balance: number;      // Saldo actual como número crudo
  accountType: "SAVINGS" | "CHECKING"; // Tipo de cuenta
  frozen: boolean;      // Si la cuenta está congelada
  lastLoginDate: Date;  // Última vez que el usuario ingresó
  transactions: Transaction[]; // Lista de transacciones recientes
}

// ============================================================================
// 🟡 CAPA 2: USE CASE - Obtiene los datos crudos
// ============================================================================

// Use Case que obtiene los datos del dashboard de una cuenta
// Retorna datos CRUDOS: números, fechas como Date, etc.
function getAccountDashboard(accountId: string): AccountData {
  // Simulamos obtener datos de la "base de datos"
  // En un caso real, esto vendría de un repositorio
  console.log(`  🔄 [Use Case] Obteniendo dashboard para cuenta ${accountId}...\n`);

  // Datos crudos tal como vienen del repositorio
  const accountData: AccountData = {
    id: accountId,                          // ID de la cuenta
    ownerName: "María García López",        // Nombre del titular
    balance: 15750.8,                       // Saldo crudo: un número
    accountType: "SAVINGS",                 // Tipo de cuenta
    frozen: false,                          // Estado de la cuenta
    lastLoginDate: new Date("2026-07-25T14:30:00"), // Última sesión como Date
    transactions: [                         // Lista de transacciones recientes
      {
        id: "TRX-001",                      // ID de transacción
        type: "DEPOSIT",                    // Tipo: depósito
        amount: 3500,                       // Monto crudo
        date: new Date("2026-07-25T10:15:00"), // Fecha como Date
        description: "Nómina quincenal",    // Descripción
        counterparty: "Empresa ABC S.A.",   // Quién depositó
      },
      {
        id: "TRX-002",                      // ID de transacción
        type: "WITHDRAWAL",                 // Tipo: retiro
        amount: 250.5,                      // Monto crudo
        date: new Date("2026-07-24T18:45:00"), // Fecha como Date
        description: "Retiro ATM",          // Descripción
        counterparty: "ATM Centro Comercial", // Dónde se retiró
      },
      {
        id: "TRX-003",                      // ID de transacción
        type: "TRANSFER_OUT",               // Tipo: transferencia enviada
        amount: 1200,                       // Monto crudo
        date: new Date("2026-07-23T09:00:00"), // Fecha como Date
        description: "Pago renta",          // Descripción
        counterparty: "Juan Pérez",         // A quién se envió
      },
      {
        id: "TRX-004",                      // ID de transacción
        type: "TRANSFER_IN",               // Tipo: transferencia recibida
        amount: 500,                        // Monto crudo
        date: new Date("2026-07-22T16:20:00"), // Fecha como Date
        description: "Pago compartido cena", // Descripción
        counterparty: "Ana Rodríguez",      // Quién envió
      },
    ],
  };

  return accountData; // Retorna datos crudos al controller/view
}

// ============================================================================
// ❌ LA VIEW: Aquí está todo el problema
// ============================================================================
// Esta View hace DEMASIADO:
// - Formatea moneda (número → string con $ y comas)
// - Formatea fechas (Date → string legible)
// - Calcula totales (suma de ingresos/egresos)
// - Decide colores (verde para ingresos, rojo para egresos)
// - Evalúa condiciones (¿saldo bajo? ¿cuenta congelada?)
// - Genera mensajes condicionales
//
// ¿Cómo testeas que "$15,750.80" se formatea bien?
// Respuesta: ¡No puedes! Tendrías que capturar la salida de consola.
//
// ¿Cómo pruebas que la alerta de saldo bajo aparece cuando balance < 500?
// Respuesta: ¡No puedes fácilmente! La lógica está ATRAPADA en la vista.
// ============================================================================
function renderDashboard(data: AccountData): void {
  console.log("  ╔══════════════════════════════════════════════════╗");
  console.log("  ║           🏦 DASHBOARD DE CUENTA                ║");
  console.log("  ╚══════════════════════════════════════════════════╝\n");

  // ❌ LÓGICA DE FORMATEO DENTRO DE LA VIEW: formatear el nombre del tipo de cuenta
  // La view DECIDE cómo traducir "SAVINGS" → "Cuenta de Ahorro"
  const accountTypeName = data.accountType === "SAVINGS"
    ? "Cuenta de Ahorro"  // Traducción hardcodeada en la vista
    : "Cuenta Corriente";  // Si cambias el idioma, tocas la vista

  // ❌ LÓGICA DE FORMATEO DENTRO DE LA VIEW: formatear moneda
  // La view sabe cómo convertir 15750.8 → "$15,750.80"
  const formattedBalance = `$${data.balance.toLocaleString("en-US", {
    minimumFractionDigits: 2, // Configuración de formato en la vista
    maximumFractionDigits: 2, // Esto debería estar en un Presenter
  })}`;

  console.log(`  👤 Titular: ${data.ownerName}`); // Muestra el nombre
  console.log(`  🏷️  Tipo: ${accountTypeName}`);   // Muestra tipo formateado
  console.log(`  💰 Saldo: ${formattedBalance}`);  // Muestra saldo formateado

  // ❌ LÓGICA CONDICIONAL DENTRO DE LA VIEW: decidir el estado de la cuenta
  // La view EVALÚA condiciones y DECIDE qué mostrar
  if (data.frozen) {
    // Si la cuenta está congelada, muestra un mensaje de error
    console.log("  🔒 Estado: ❄️  CONGELADA");
  } else if (data.balance < 500) {
    // Si el saldo es bajo, muestra una advertencia
    console.log("  ⚠️  Estado: SALDO BAJO - ¡Atención!");
  } else {
    // Si todo está bien, muestra un mensaje positivo
    console.log("  ✅ Estado: Activa");
  }

  // ❌ LÓGICA DE FORMATEO DE FECHA DENTRO DE LA VIEW
  // La view formatea la fecha del último acceso
  const lastLoginFormatted = data.lastLoginDate.toLocaleDateString("es-MX", {
    day: "numeric",    // Día del mes
    month: "short",    // Mes abreviado
    year: "numeric",   // Año completo
    hour: "2-digit",   // Hora con 2 dígitos
    minute: "2-digit", // Minutos con 2 dígitos
  });
  console.log(`  🕐 Último acceso: ${lastLoginFormatted}`); // Muestra fecha formateada

  // ❌ CÁLCULOS DENTRO DE LA VIEW: sumar ingresos y egresos
  // La view CALCULA los totales recorriendo las transacciones
  let totalIncome = 0;  // Acumulador de ingresos
  let totalExpenses = 0; // Acumulador de egresos

  // Recorre cada transacción para clasificar y sumar
  data.transactions.forEach((tx) => {
    if (tx.type === "DEPOSIT" || tx.type === "TRANSFER_IN") {
      totalIncome += tx.amount; // Suma a ingresos si es depósito o transferencia recibida
    } else {
      totalExpenses += tx.amount; // Suma a egresos si es retiro o transferencia enviada
    }
  });

  // ❌ MÁS FORMATEO DE MONEDA dentro de la view para los totales
  const formattedIncome = `$${totalIncome.toLocaleString("en-US", {
    minimumFractionDigits: 2, // Misma lógica de formateo DUPLICADA
    maximumFractionDigits: 2, // Cada vez que formateas moneda, copias este código
  })}`;
  const formattedExpenses = `$${totalExpenses.toLocaleString("en-US", {
    minimumFractionDigits: 2, // ¡Otra vez la misma configuración!
    maximumFractionDigits: 2, // Un cambio de formato requiere tocar MUCHOS lugares
  })}`;

  console.log(`\n  📊 Resumen del período:`);            // Encabezado de resumen
  console.log(`     📈 Ingresos:  ${formattedIncome}`);  // Total de ingresos formateado
  console.log(`     📉 Egresos:   ${formattedExpenses}`); // Total de egresos formateado

  // ❌ LÓGICA DE PRESENTACIÓN: tabla de transacciones con formateo inline
  console.log(`\n  📋 Últimas Transacciones:`);  // Encabezado de tabla
  console.log("  ─".repeat(30));                 // Línea separadora

  // Recorre cada transacción para mostrarla formateada
  data.transactions.forEach((tx) => {
    // ❌ LÓGICA CONDICIONAL: decidir el ícono según el tipo de transacción
    // La view decide qué emoji usar basándose en el tipo
    let icon: string;      // Variable para el ícono
    let sign: string;      // Variable para el signo (+/-)
    let color: string;     // Variable para el "color" (texto descriptivo)

    if (tx.type === "DEPOSIT" || tx.type === "TRANSFER_IN") {
      icon = "💚";          // Ícono verde para ingresos
      sign = "+";           // Signo positivo
      color = "(ingreso)";  // Etiqueta de tipo
    } else {
      icon = "🔴";          // Ícono rojo para egresos
      sign = "-";           // Signo negativo
      color = "(egreso)";   // Etiqueta de tipo
    }

    // ❌ FORMATEO DE MONTO: otra vez la misma lógica de moneda
    const formattedAmount = `${sign}$${tx.amount.toLocaleString("en-US", {
      minimumFractionDigits: 2, // ¡La TERCERA vez que se repite este código!
      maximumFractionDigits: 2, // Claramente debería estar centralizado
    })}`;

    // ❌ FORMATEO DE FECHA: otra vez la misma lógica de fecha
    const formattedDate = tx.date.toLocaleDateString("es-MX", {
      day: "numeric",   // Día
      month: "short",   // Mes abreviado
    });

    // Imprime la línea de la transacción con todo el formateo hecho aquí
    console.log(`     ${icon} ${formattedDate} | ${formattedAmount.padEnd(15)} | ${tx.description} ${color}`);
    console.log(`        ↳ ${tx.counterparty}`); // Muestra la contraparte
  });

  console.log("  ─".repeat(30)); // Línea separadora final

  // ❌ MÁS LÓGICA CONDICIONAL: mensajes personalizados basados en los datos
  // La view DECIDE qué mensaje motivacional mostrar
  console.log("\n  💬 Mensaje:");
  if (data.balance > 10000) {
    // Si el saldo es alto, felicita al usuario
    console.log("     ¡Excelente! Tu ahorro va por buen camino. 🎉");
  } else if (data.balance > 5000) {
    // Si el saldo es medio, da un mensaje neutro
    console.log("     Buen trabajo manteniendo tu cuenta saludable. 👍");
  } else if (data.balance > 500) {
    // Si el saldo es bajo pero no crítico, sugiere ahorrar
    console.log("     Considera aumentar tu ahorro este mes. 💪");
  } else {
    // Si el saldo es crítico, muestra una alerta
    console.log("     ⚠️ ¡Tu saldo está muy bajo! Revisa tus gastos.");
  }
}

// ============================================================================
// ❌ SEGUNDO PROBLEMA: Si ahora quieres una vista HTML, ¡DUPLICAS TODO!
// ============================================================================

// ❌ Vista HTML que DUPLICA toda la lógica de formateo
// Cada línea de lógica de la vista de consola se copia aquí
function renderDashboardHTML(data: AccountData): string {
  // ❌ DUPLICACIÓN: el mismo formateo de tipo de cuenta
  const accountTypeName = data.accountType === "SAVINGS"
    ? "Cuenta de Ahorro"  // Misma traducción copiada
    : "Cuenta Corriente";  // Mismo mapeo copiado

  // ❌ DUPLICACIÓN: el mismo formateo de moneda
  const formattedBalance = `$${data.balance.toLocaleString("en-US", {
    minimumFractionDigits: 2, // Misma configuración copiada
    maximumFractionDigits: 2, // Si cambias el formato, ¿lo cambias en AMBOS lugares?
  })}`;

  // ❌ DUPLICACIÓN: el mismo cálculo de totales
  let totalIncome = 0;   // Mismo acumulador
  let totalExpenses = 0;  // Mismo acumulador

  // Mismo recorrido de transacciones copiado
  data.transactions.forEach((tx) => {
    if (tx.type === "DEPOSIT" || tx.type === "TRANSFER_IN") {
      totalIncome += tx.amount;  // Misma clasificación
    } else {
      totalExpenses += tx.amount; // Misma clasificación
    }
  });

  // ❌ DUPLICACIÓN: la misma lógica condicional para el estado
  let statusHTML: string; // Variable para el HTML del estado
  if (data.frozen) {
    statusHTML = '<span style="color:blue">❄️ CONGELADA</span>'; // Mismo if copiado
  } else if (data.balance < 500) {
    statusHTML = '<span style="color:orange">⚠️ SALDO BAJO</span>'; // Mismo elif copiado
  } else {
    statusHTML = '<span style="color:green">✅ Activa</span>'; // Mismo else copiado
  }

  // Genera el HTML con toda la lógica DUPLICADA de la vista de consola
  return `
    <div class="dashboard">
      <h1>Dashboard - ${data.ownerName}</h1>
      <p>Tipo: ${accountTypeName}</p>
      <p>Saldo: ${formattedBalance}</p>
      <p>Estado: ${statusHTML}</p>
      <p>Ingresos: $${totalIncome.toFixed(2)}</p>
      <p>Egresos: $${totalExpenses.toFixed(2)}</p>
    </div>
  `;
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO - View con lógica de presentación");
  console.log("=".repeat(55));

  // Paso 1: El Use Case obtiene datos crudos
  const accountData = getAccountDashboard("ACC-001");

  // Paso 2: La View hace TODO: formatear + mostrar
  console.log("\n📦 VISTA DE CONSOLA:");
  console.log("-".repeat(55));
  renderDashboard(accountData); // La view formatea Y renderiza

  // Paso 3: Demostrar que la vista HTML DUPLICA la lógica
  console.log("\n\n📦 VISTA HTML (misma lógica DUPLICADA):");
  console.log("-".repeat(55));
  const html = renderDashboardHTML(accountData); // Otra view con lógica duplicada
  console.log(html); // Muestra el HTML generado

  // Resumen de problemas
  console.log("\n" + "=".repeat(55));
  console.log("⚠️  PROBLEMAS DE ESTE ENFOQUE:");
  console.log("=".repeat(55));
  console.log(`
  ❌ La View FORMATEA datos: "$15,750.80", "26 jul 2026"
     → No puedes testear el formateo sin renderizar la vista

  ❌ La View CALCULA totales: ingresos y egresos
     → Lógica de negocio atrapada en la UI

  ❌ La View DECIDE qué mostrar: if (saldo < 500) → alerta
     → Lógica condicional imposible de testear aisladamente

  ❌ La View DUPLICA lógica: consola y HTML repiten todo
     → Un cambio de formato requiere tocar N vistas

  ❌ La View es COMPLEJA: tiene if/else, cálculos, formateo
     → Es propensa a bugs y difícil de mantener

  💡 PREGUNTA CLAVE del Cap. 23:
     "¿Puedes testear la lógica de presentación SIN la UI?"
     En este código: NO. La lógica está ATRAPADA en la vista.

  📖 Robert C. Martin dice:
     "Las Views son difíciles de testear. Si puedes, haz que
     la View sea tan simple que OBVIAMENTE no tenga bugs."
     → Eso es el HUMBLE OBJECT PATTERN.
  `);
}

// Ejecuta el ejemplo malo
main();
