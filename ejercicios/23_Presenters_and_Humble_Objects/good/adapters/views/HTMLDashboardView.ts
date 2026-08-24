// ============================================================================
// 📦 VIEW (HUMBLE OBJECT): HTMLDashboardView
// ============================================================================
// 📖 CAPA: ADAPTERS → VIEWS
//
//    SEGUNDA vista humble que demuestra el PODER del patrón.
//    Usa el MISMO ViewModel que la vista de consola.
//    CERO duplicación de lógica de formateo.
//
//    📌 BENEFICIO CLAVE:
//    Si mañana necesitas una vista para React, Flutter, o una API JSON,
//    solo creas OTRA View que implemente DashboardView.
//    El Presenter, el ViewModel y el Use Case NO cambian.
//
//    Esto es posible porque el ViewModel contiene STRINGS,
//    no datos crudos. Cualquier vista puede usar esos strings.
// ============================================================================

// Importa la interfaz de View que esta clase implementa
import { DashboardView } from "./DashboardView";

// Importa el ViewModel con los datos ya formateados
import { DashboardViewModel } from "../presenters/viewmodels/DashboardViewModel";

// View Humble para HTML: genera markup usando los strings del ViewModel
// NO repite lógica de formateo: usa los MISMOS strings que la vista de consola
export class HTMLDashboardView implements DashboardView {

  // Renderiza el dashboard como HTML
  // Observa: NO hay formateo de moneda, fechas, ni lógica condicional
  // Solo toma los strings del ViewModel y los coloca en tags HTML
  render(vm: DashboardViewModel): void {
    // Construye el HTML usando los strings ya formateados del ViewModel
    const html = `
    <div class="dashboard">
      <h1>Dashboard - ${vm.ownerName}</h1>
      <p>Tipo: ${vm.accountTypeLabel}</p>
      <p>Saldo: ${vm.formattedBalance}</p>
      <p>Estado: ${vm.statusIcon} ${vm.statusLabel}</p>
      <p>Último acceso: ${vm.lastLoginFormatted}</p>
      <div class="summary">
        <p>Ingresos: ${vm.formattedTotalIncome}</p>
        <p>Egresos: ${vm.formattedTotalExpenses}</p>
      </div>
      <ul>
        ${vm.transactions.map((tx) =>
          // Cada transacción usa los strings ya formateados del ViewModel
          `<li>${tx.icon} ${tx.formattedDate} | ${tx.formattedAmount} | ${tx.description}</li>`
        ).join("\n        ")}
      </ul>
      <p class="message">${vm.motivationalMessage}</p>
    </div>`;

    // Imprime el HTML generado en la consola para demostración
    console.log(html);
  }
}
