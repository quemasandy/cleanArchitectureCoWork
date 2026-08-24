// ============================================================================
// 📦 PRESENTER: AccountDashboardPresenter
// ============================================================================
// 📖 CAPA: ADAPTERS → PRESENTERS
//
//    El Presenter es el REPORTERO del noticiero.
//    Recibe datos crudos (hechos) del Use Case y los FORMATEA
//    en un ViewModel (teleprompter) listo para que la View lo lea.
//
//    📖 Robert C. Martin (Cap. 23):
//    "El Presenter es un objeto que acepta datos de la aplicación
//    y los formatea para presentación."
//
//    ✅ El Presenter es 100% TESTEABLE:
//    ```typescript
//    const presenter = new AccountDashboardPresenter();
//    presenter.present(datosDeTest);
//    const vm = presenter.getViewModel();
//    expect(vm.formattedBalance).toBe("$5,000.00");
//    expect(vm.statusLabel).toBe("Activa");
//    expect(vm.showLowBalanceWarning).toBe(false);
//    ```
//    ¡Sin UI! ¡Sin consola! ¡Sin HTML! Solo entrada → lógica → salida.
//
//    El Presenter IMPLEMENTA el Output Port del Use Case.
//    Esto respeta la Dependency Rule:
//    → Use Case (interno) define DashboardOutputPort (interfaz)
//    → Presenter (externo) implementa DashboardOutputPort
//    → La dependencia apunta HACIA ADENTRO ✅
// ============================================================================

// Importa el Output Port que el Presenter implementa
import { DashboardOutputPort } from "../../application/ports/DashboardOutputPort";

// Importa las entities del dominio que el Presenter recibe como datos crudos
import { AccountData } from "../../domain/entities/AccountData";
import { Transaction } from "../../domain/entities/Transaction";

// Importa los ViewModels que el Presenter produce como salida formateada
import { DashboardViewModel } from "./viewmodels/DashboardViewModel";
import { TransactionViewModel } from "./viewmodels/TransactionViewModel";

// El Presenter implementa el Output Port del Use Case
// Recibe datos CRUDOS (entities) → produce datos FORMATEADOS (ViewModels)
export class AccountDashboardPresenter implements DashboardOutputPort {
  // El ViewModel se almacena internamente después de procesar los datos
  // Es null hasta que el Use Case llame a present() con los datos
  private viewModel: DashboardViewModel | null = null;

  // ── Implementación del Output Port ──────────────────────────────────────

  // Recibe datos crudos del Use Case y genera el ViewModel formateado
  // Este método es llamado por el Use Case cuando tiene los datos listos
  present(data: AccountData): void {
    console.log("  🎨 [Presenter] Transformando datos crudos → ViewModel...\n");

    // ✅ Formatear el tipo de cuenta: enum → string legible
    const accountTypeLabel = this.formatAccountType(data.accountType);

    // ✅ Formatear el saldo: número crudo → string con $ y comas
    const formattedBalance = this.formatCurrency(data.balance);

    // ✅ Evaluar el estado: datos crudos → ícono + etiqueta ya decididos
    const { statusIcon, statusLabel } = this.evaluateStatus(data.frozen, data.balance);

    // ✅ Formatear la fecha: objeto Date → string legible
    const lastLoginFormatted = this.formatDateTime(data.lastLoginDate);

    // ✅ Calcular totales: lista de transacciones → números de ingresos/egresos
    const { totalIncome, totalExpenses } = this.calculateTotals(data.transactions);

    // ✅ Seleccionar mensaje: saldo → mensaje motivacional apropiado
    const motivationalMessage = this.selectMotivationalMessage(data.balance);

    // ✅ Evaluar condición: saldo → boolean para la alerta
    const showLowBalanceWarning = data.balance < 500;

    // ✅ Formatear cada transacción: entity → ViewModel individual
    const transactions = data.transactions.map((tx) =>
      this.formatTransaction(tx) // Cada transacción se transforma individualmente
    );

    // ✅ Ensamblar el ViewModel completo con TODO ya formateado
    this.viewModel = {
      ownerName: data.ownerName,                                   // Nombre del titular
      accountTypeLabel,                                            // "Cuenta de Ahorro"
      formattedBalance,                                            // "$15,750.80"
      statusIcon,                                                  // "✅"
      statusLabel,                                                 // "Activa"
      lastLoginFormatted,                                          // "25 jul 2026, 14:30"
      formattedTotalIncome: this.formatCurrency(totalIncome),      // "$4,000.00"
      formattedTotalExpenses: this.formatCurrency(totalExpenses),   // "$1,450.50"
      motivationalMessage,                                         // "¡Excelente!..."
      showLowBalanceWarning,                                       // false
      transactions,                                                // Lista formateada
    };
  }

  // ── Acceso al ViewModel ─────────────────────────────────────────────────

  // La View llama a este método para obtener el ViewModel ya procesado
  getViewModel(): DashboardViewModel | null {
    return this.viewModel; // Retorna el ViewModel formateado o null si no se ha procesado
  }

  // ── Métodos privados de formateo ────────────────────────────────────────
  // TODA la lógica de presentación vive AQUÍ, NO en la View.
  // Cada método es una unidad pequeña y testeable individualmente.

  // Formatea un número como moneda: 15750.8 → "$15,750.80"
  private formatCurrency(amount: number): string {
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2, // Siempre mostrar 2 decimales
      maximumFractionDigits: 2, // Nunca más de 2 decimales
    })}`;
  }

  // Formatea una fecha completa: Date → "25 jul 2026, 14:30"
  private formatDateTime(date: Date): string {
    return date.toLocaleDateString("es-MX", {
      day: "numeric",    // Día del mes (25)
      month: "short",    // Mes abreviado (jul)
      year: "numeric",   // Año completo (2026)
      hour: "2-digit",   // Hora con 2 dígitos (14)
      minute: "2-digit", // Minutos con 2 dígitos (30)
    });
  }

  // Formatea una fecha corta: Date → "25 jul"
  private formatShortDate(date: Date): string {
    return date.toLocaleDateString("es-MX", {
      day: "numeric", // Solo día (25)
      month: "short", // Solo mes abreviado (jul)
    });
  }

  // Traduce el tipo de cuenta: "SAVINGS" → "Cuenta de Ahorro"
  private formatAccountType(type: string): string {
    // Mapa de traducción centralizado en UN solo lugar
    const labels: Record<string, string> = {
      SAVINGS: "Cuenta de Ahorro",   // Tipo ahorro → nombre legible
      CHECKING: "Cuenta Corriente",  // Tipo corriente → nombre legible
    };
    return labels[type] || type; // Retorna traducción o el tipo original si no existe
  }

  // Evalúa el estado y retorna ícono + etiqueta ya decididos
  private evaluateStatus(
    frozen: boolean,  // Si la cuenta está congelada
    balance: number   // El saldo actual de la cuenta
  ): { statusIcon: string; statusLabel: string } {
    if (frozen) {
      // Cuenta congelada: ícono de candado y texto de congelamiento
      return { statusIcon: "🔒", statusLabel: "❄️  CONGELADA" };
    }
    if (balance < 500) {
      // Saldo bajo: ícono de advertencia y texto de alerta
      return { statusIcon: "⚠️", statusLabel: "SALDO BAJO - ¡Atención!" };
    }
    // Todo normal: ícono verde y texto positivo
    return { statusIcon: "✅", statusLabel: "Activa" };
  }

  // Calcula los totales de ingresos y egresos
  private calculateTotals(
    transactions: Transaction[] // Lista de transacciones crudas
  ): { totalIncome: number; totalExpenses: number } {
    let totalIncome = 0;   // Acumulador para ingresos
    let totalExpenses = 0;  // Acumulador para egresos

    // Clasifica cada transacción como ingreso o egreso
    transactions.forEach((tx) => {
      if (tx.type === "DEPOSIT" || tx.type === "TRANSFER_IN") {
        totalIncome += tx.amount;  // Depósitos y transferencias recibidas son ingresos
      } else {
        totalExpenses += tx.amount; // Retiros y transferencias enviadas son egresos
      }
    });

    return { totalIncome, totalExpenses }; // Retorna ambos totales
  }

  // Selecciona un mensaje motivacional según el saldo
  private selectMotivationalMessage(balance: number): string {
    if (balance > 10000) {
      return "¡Excelente! Tu ahorro va por buen camino. 🎉"; // Saldo alto
    }
    if (balance > 5000) {
      return "Buen trabajo manteniendo tu cuenta saludable. 👍"; // Saldo medio
    }
    if (balance > 500) {
      return "Considera aumentar tu ahorro este mes. 💪"; // Saldo bajo
    }
    return "⚠️ ¡Tu saldo está muy bajo! Revisa tus gastos."; // Saldo crítico
  }

  // Formatea una transacción cruda en un ViewModel listo para mostrar
  private formatTransaction(tx: Transaction): TransactionViewModel {
    // Determina si la transacción es un ingreso (depósito o transferencia recibida)
    const isIncome = tx.type === "DEPOSIT" || tx.type === "TRANSFER_IN";

    return {
      icon: isIncome ? "💚" : "🔴",                               // Ícono por tipo
      formattedDate: this.formatShortDate(tx.date),                // "25 jul"
      formattedAmount: `${isIncome ? "+" : "-"}${this.formatCurrency(tx.amount)}`, // "+$3,500.00"
      description: tx.description,                                 // Descripción original
      typeLabel: isIncome ? "(ingreso)" : "(egreso)",              // Etiqueta de tipo
      counterparty: tx.counterparty,                               // Contraparte original
    };
  }
}
