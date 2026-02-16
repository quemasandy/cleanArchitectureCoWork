// ============================================================================
// ❌ PROBLEMA: Toda la lógica de préstamos en UNA sola función
// ============================================================================
// 📖 CONTEXTO: Un banco evalúa solicitudes de préstamo personal.
//    Un analista de crédito hace esto TODOS LOS DÍAS con papel y lápiz.
//    Ahora quieren automatizarlo.
//
// 🎯 TU MISIÓN: Identifica qué es regla de EMPRESA y qué de APLICACIÓN.
//    Luego refactoriza en solution.ts separando Entities y Use Cases.
//
// 🚨 PROBLEMA ACTUAL: Todo está en una "God Function".
//    No hay entidades, no hay use cases, no hay separación.
//    Si queremos cambiar de endpoint REST a CLI, hay que copiar TODO.
// ============================================================================

// ❌ Una función gigante que hace ABSOLUTAMENTE TODO
function evaluateLoanRequest(requestBody: any): {
  statusCode: number; // ❌ Respuesta HTTP dentro de la lógica de negocio
  body: string;       // ❌ Serialización dentro de la lógica de negocio
} {
  console.log("  🔄 Evaluando solicitud de préstamo...\n");

  // ============================================================
  // REGLA 1: Validar edad mínima
  // "El cliente debe ser mayor de 18 años para solicitar un préstamo"
  // 🤔 PREGUNTA: ¿Un analista verificaría esto con papel y lápiz?
  //    ¿O es algo que solo existe porque hay una app?
  // ============================================================
  const age = requestBody.age; // Tomamos la edad del request crudo
  if (age < 18) {              // Validamos directamente en el handler
    return {
      statusCode: 400, // ❌ Código HTTP mezclado con regla de negocio
      body: JSON.stringify({ error: "Debe ser mayor de 18 años" }),
    };
  }

  // ============================================================
  // REGLA 2: Calcular puntaje crediticio
  // "Si el cliente ha pagado a tiempo, sube su puntaje.
  //  Si ha tenido moras, baja su puntaje."
  // 🤔 PREGUNTA: ¿Esto lo haría un analista con papel y calculadora?
  // ============================================================
  const paymentHistory = requestBody.paymentHistory || []; // Historial del request
  let creditScore = 500;                                    // Puntaje base
  for (const payment of paymentHistory) {                   // Recorremos cada pago
    if (payment.onTime) {         // Si pagó a tiempo
      creditScore += 30;          // Sube 30 puntos
    } else {                      // Si tuvo mora
      creditScore -= 50;          // Baja 50 puntos (penalización más fuerte)
    }
  }
  // Limitamos el puntaje entre 0 y 1000
  creditScore = Math.max(0, Math.min(1000, creditScore)); // Clamp del puntaje
  console.log(`  📊 Puntaje crediticio: ${creditScore}`); // Log del cálculo

  // ============================================================
  // REGLA 3: Determinar nivel de riesgo y tasa de interés
  // "Puntaje >= 700 = riesgo bajo (8%), >= 400 = medio (15%), < 400 = alto (25%)"
  // 🤔 PREGUNTA: ¿Estas tasas son política de la empresa o de la app?
  // ============================================================
  let riskLevel: string;     // Variable para el nivel de riesgo
  let interestRate: number;  // Variable para la tasa de interés
  if (creditScore >= 700) {  // Si el puntaje es alto
    riskLevel = "BAJO";      // Riesgo bajo
    interestRate = 0.08;     // Tasa preferencial del 8%
  } else if (creditScore >= 400) { // Si el puntaje es medio
    riskLevel = "MEDIO";           // Riesgo medio
    interestRate = 0.15;           // Tasa estándar del 15%
  } else {                         // Si el puntaje es bajo
    riskLevel = "ALTO";            // Riesgo alto
    interestRate = 0.25;           // Tasa de alto riesgo del 25%
  }
  console.log(`  ⚠️  Riesgo: ${riskLevel} | Tasa: ${(interestRate * 100)}%`); // Log

  // ============================================================
  // REGLA 4: Calcular cuota mensual
  // "Cuota = (monto * (1 + tasa)) / plazo en meses"
  // 🤔 PREGUNTA: ¿Un analista haría este cálculo manualmente?
  // ============================================================
  const loanAmount = requestBody.amount;     // Monto solicitado
  const termMonths = requestBody.termMonths; // Plazo en meses
  const totalWithInterest = loanAmount * (1 + interestRate); // Total con intereses
  const monthlyPayment = totalWithInterest / termMonths;     // Cuota mensual
  console.log(`  💰 Cuota mensual: $${monthlyPayment.toFixed(2)}`); // Log cuota

  // ============================================================
  // REGLA 5: Verificar capacidad de pago
  // "La cuota mensual NO puede superar el 30% del ingreso del cliente"
  // 🤔 PREGUNTA: ¿Esto es política empresarial o lógica de la app?
  // ============================================================
  const monthlyIncome = requestBody.monthlyIncome;      // Ingreso mensual
  const maxAllowedPayment = monthlyIncome * 0.30;       // 30% del ingreso
  const debtToIncomeRatio = monthlyPayment / monthlyIncome; // Ratio deuda/ingreso

  if (monthlyPayment > maxAllowedPayment) { // Si la cuota supera el 30%
    console.log(`  ❌ Cuota ($${monthlyPayment.toFixed(2)}) > 30% ingreso ($${maxAllowedPayment.toFixed(2)})`);
    return {
      statusCode: 400, // ❌ HTTP mezclado con regla de negocio
      body: JSON.stringify({
        error: "La cuota supera el 30% del ingreso",
        monthlyPayment: monthlyPayment.toFixed(2),
        maxAllowed: maxAllowedPayment.toFixed(2),
      }),
    };
  }

  // ============================================================
  // REGLA 6: Puntaje mínimo para aprobación automática
  // "Solo se aprueban automáticamente préstamos con puntaje >= 400"
  // 🤔 PREGUNTA: ¿Esto es una regla de la empresa o de la automatización?
  // ============================================================
  if (creditScore < 400) { // Si el puntaje es menor a 400
    console.log("  ❌ Puntaje muy bajo para aprobación automática");
    return {
      statusCode: 400, // ❌ HTTP aquí otra vez
      body: JSON.stringify({
        error: "Puntaje crediticio insuficiente",
        creditScore,
        minRequired: 400,
      }),
    };
  }

  // ============================================================
  // ACCIONES DE APLICACIÓN: Guardar, notificar, loguear
  // 🤔 PREGUNTA: ¿Estas acciones existirían sin software?
  // ============================================================
  const loanId = `LOAN-${Date.now()}`; // Generamos un ID para el préstamo
  console.log(`  💾 INSERT INTO loans (${loanId}, ${loanAmount}, ${interestRate})`); // Simulamos guardar en BD
  console.log(`  📧 Enviando email a ${requestBody.email}: ¡Préstamo aprobado!`);    // Simulamos notificación
  console.log(`  📝 LOG: Evaluación completada para cliente ${requestBody.name}`);    // Log de auditoría

  // ❌ Armamos la respuesta HTTP directamente
  const decision = creditScore >= 700 ? "APROBADO" : "APROBADO_CON_CONDICIONES"; // Decisión final
  return {
    statusCode: 200, // ❌ Código HTTP
    body: JSON.stringify({
      loanId,                                                 // ID del préstamo
      decision,                                               // Decisión
      creditScore,                                            // Puntaje
      riskLevel,                                              // Nivel de riesgo
      interestRate: `${(interestRate * 100)}%`,               // Tasa formateada
      monthlyPayment: `$${monthlyPayment.toFixed(2)}`,       // Cuota formateada
      debtToIncomeRatio: `${(debtToIncomeRatio * 100).toFixed(1)}%`, // Ratio formateado
      totalWithInterest: `$${totalWithInterest.toFixed(2)}`,  // Total formateado
    }),
  };
}

// ============================================================================
// 🏃 EJECUCIÓN - Simulación de solicitud de préstamo
// ============================================================================
function main(): void {
  console.log("❌ PROBLEMA - Todo en UNA función (God Function)");
  console.log("=".repeat(55));

  // Caso 1: Solicitud aprobada
  console.log("\n📋 CASO 1: Solicitud de préstamo estándar");
  console.log("-".repeat(40));
  const response1 = evaluateLoanRequest({
    name: "Carlos García",               // Nombre del cliente
    age: 35,                              // Edad del cliente
    email: "carlos@mail.com",             // Email del cliente
    monthlyIncome: 5000,                  // Ingreso mensual en dólares
    amount: 10000,                        // Monto del préstamo solicitado
    termMonths: 24,                       // Plazo de 24 meses
    paymentHistory: [                     // Historial de pagos anteriores
      { onTime: true },                   // Pago 1: a tiempo ✅
      { onTime: true },                   // Pago 2: a tiempo ✅
      { onTime: false },                  // Pago 3: con mora ❌
      { onTime: true },                   // Pago 4: a tiempo ✅
      { onTime: true },                   // Pago 5: a tiempo ✅
      { onTime: true },                   // Pago 6: a tiempo ✅
      { onTime: true },                   // Pago 7: a tiempo ✅
      { onTime: true },                   // Pago 8: a tiempo ✅
    ],
  });
  console.log(`\n  📤 Respuesta: ${response1.body}`); // Mostramos respuesta

  // Caso 2: Solicitud rechazada por capacidad de pago
  console.log("\n\n📋 CASO 2: Préstamo muy alto para el ingreso");
  console.log("-".repeat(40));
  const response2 = evaluateLoanRequest({
    name: "Ana López",                    // Nombre del cliente
    age: 28,                              // Edad del cliente
    email: "ana@mail.com",                // Email del cliente
    monthlyIncome: 2000,                  // Ingreso mensual bajo
    amount: 50000,                        // Monto demasiado alto
    termMonths: 12,                       // Plazo corto
    paymentHistory: [                     // Historial de pagos
      { onTime: true },                   // Pago 1: a tiempo ✅
      { onTime: true },                   // Pago 2: a tiempo ✅
    ],
  });
  console.log(`\n  📤 Respuesta: ${response2.body}`); // Mostramos respuesta

  // Resumen de problemas
  console.log("\n\n" + "=".repeat(55));
  console.log("⚠️  PROBLEMAS CON ESTE CÓDIGO:");
  console.log("=".repeat(55));
  console.log("  ❌ Todas las reglas de negocio están en UNA función");
  console.log("  ❌ No se distingue entre regla de EMPRESA y de APLICACIÓN");
  console.log("  ❌ Códigos HTTP mezclados con lógica de negocio");
  console.log("  ❌ Imposible reusar la lógica sin copiar todo");
  console.log("  ❌ No se puede testear el cálculo de puntaje por separado");
  console.log("  ❌ Si cambias de REST a CLI, debes reescribir todo");
  console.log("\n🎯 TU TAREA: Refactoriza en solution.ts separando:");
  console.log("  📗 ENTITY (regla de empresa): Lo que el analista haría con papel");
  console.log("  📘 USE CASE (regla de app): La automatización del flujo");
  console.log("  📙 ADAPTER (infraestructura): HTTP, BD, Email, Logs");
}

// Ejecutamos el programa principal
main();
