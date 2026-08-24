// ============================================================================
// 📦 VIEW MODEL: DashboardViewModel
// ============================================================================
// 📖 CAPA: ADAPTERS → PRESENTERS → VIEW MODELS
//
//    El DashboardViewModel es el "TELEPROMPTER" del noticiero.
//    Contiene TODO el texto ya redactado, formateado y listo para leer.
//    El presentador de TV (la View) solo tiene que LEERLO.
//
//    📌 REGLA CLAVE DEL VIEWMODEL:
//    ❌ NO contiene: números crudos, objetos Date, enums, lógica
//    ✅ SÍ contiene: strings formateados, booleans ya evaluados
//
//    Esto hace que la View sea EXTREMADAMENTE simple.
//    No necesita if/else, no necesita formatear, no necesita calcular.
//    Es tan simple que "obviamente no tiene bugs".
// ============================================================================

// Importa el ViewModel de transacción individual
import { TransactionViewModel } from "./TransactionViewModel";

// ViewModel completo del dashboard: TODO ya formateado y listo para mostrar
export interface DashboardViewModel {
  ownerName: string;              // Nombre del titular (string directo)
  accountTypeLabel: string;       // "Cuenta de Ahorro" (ya traducido del enum)
  formattedBalance: string;       // "$15,750.80" (ya formateado con $ y comas)
  statusIcon: string;             // "✅", "⚠️", o "🔒" (ya decidido por el Presenter)
  statusLabel: string;            // "Activa", "SALDO BAJO", etc. (ya decidido)
  lastLoginFormatted: string;     // "25 jul 2026, 14:30" (Date ya formateada a string)
  formattedTotalIncome: string;   // "$4,000.00" (ya calculado y formateado)
  formattedTotalExpenses: string; // "$1,450.50" (ya calculado y formateado)
  motivationalMessage: string;    // Mensaje ya seleccionado según el saldo
  showLowBalanceWarning: boolean; // true/false (condición ya evaluada por el Presenter)
  transactions: TransactionViewModel[]; // Lista de transacciones ya formateadas
}
