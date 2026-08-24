// ============================================================================
// 📦 VIEW (HUMBLE OBJECT): ConsoleDashboardView
// ============================================================================
// 📖 CAPA: ADAPTERS → VIEWS
//
//    Esta es una View HUMBLE (humilde). Es deliberadamente SIMPLE.
//
//    📺 Es el PRESENTADOR DE TV del noticiero:
//    - Solo LEE lo que dice el teleprompter (ViewModel)
//    - NO investiga, NO redacta, NO decide qué decir
//    - Es tan simple que "obviamente no tiene bugs"
//
//    📖 Robert C. Martin (Cap. 23):
//    "La View es humble. Lo único que hace es mover datos
//    del ViewModel a la pantalla... no tiene ningún código
//    que valga la pena testear."
//
//    📌 OBSERVA: Este archivo NO tiene:
//    ❌ if/else para decidir qué mostrar
//    ❌ Formateo de moneda o fechas
//    ❌ Cálculos de totales
//    ❌ Selección de mensajes condicionales
//    Todo eso lo hizo el PRESENTER.
// ============================================================================

// Importa la interfaz de View que esta clase implementa
import { DashboardView } from "./DashboardView";

// Importa el ViewModel que contiene los datos ya formateados
import { DashboardViewModel } from "../presenters/viewmodels/DashboardViewModel";

// View Humble para la consola: solo imprime strings del ViewModel
// NO tiene lógica de presentación, NO tiene if/else, NO formatea nada
export class ConsoleDashboardView implements DashboardView {

  // Renderiza el dashboard en la consola
  // Solo lee strings del ViewModel y los imprime con console.log
  render(vm: DashboardViewModel): void {
    // Encabezado decorativo del dashboard
    console.log("  ╔══════════════════════════════════════════════════╗");
    console.log("  ║           🏦 DASHBOARD DE CUENTA                ║");
    console.log("  ╚══════════════════════════════════════════════════╝\n");

    // Datos principales: solo lee strings del ViewModel y los imprime
    console.log(`  👤 Titular: ${vm.ownerName}`);                      // String directo
    console.log(`  🏷️  Tipo: ${vm.accountTypeLabel}`);                  // Ya traducido
    console.log(`  💰 Saldo: ${vm.formattedBalance}`);                  // Ya formateado
    console.log(`  ${vm.statusIcon} Estado: ${vm.statusLabel}`);        // Ya decididos
    console.log(`  🕐 Último acceso: ${vm.lastLoginFormatted}`);        // Ya formateado

    // Resumen del período: solo lee strings ya calculados y formateados
    console.log(`\n  📊 Resumen del período:`);
    console.log(`     📈 Ingresos:  ${vm.formattedTotalIncome}`);       // Ya calculado
    console.log(`     📉 Egresos:   ${vm.formattedTotalExpenses}`);     // Ya calculado

    // Tabla de transacciones: solo itera e imprime strings ya formateados
    console.log(`\n  📋 Últimas Transacciones:`);
    console.log("  ─".repeat(30)); // Línea separadora decorativa

    // Cada transacción ya viene formateada, solo la imprime
    vm.transactions.forEach((tx) => {
      // Imprime cada línea usando los strings ya listos del ViewModel
      console.log(`     ${tx.icon} ${tx.formattedDate} | ${tx.formattedAmount.padEnd(15)} | ${tx.description} ${tx.typeLabel}`);
      console.log(`        ↳ ${tx.counterparty}`); // Contraparte de la transacción
    });

    console.log("  ─".repeat(30)); // Línea separadora final

    // Mensaje motivacional: solo lee el string ya seleccionado por el Presenter
    console.log(`\n  💬 Mensaje:`);
    console.log(`     ${vm.motivationalMessage}`); // String ya decidido
  }
}
