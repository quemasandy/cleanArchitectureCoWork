// ============================================================================
// 📦 INTERFAZ: DashboardView
// ============================================================================
// 📖 CAPA: ADAPTERS → VIEWS
//
//    Esta interfaz define el CONTRATO que cualquier View debe cumplir.
//    Solo tiene UN método: render(viewModel).
//
//    Cualquier implementación (Consola, HTML, React, Flutter)
//    debe implementar esta interfaz.
//
//    📌 La View es el HUMBLE OBJECT:
//    - Solo recibe el ViewModel (strings formateados)
//    - Solo los pone en pantalla
//    - NO tiene if/else, NO calcula, NO formatea
// ============================================================================

// Importa el ViewModel que la View recibirá ya formateado
import { DashboardViewModel } from "../presenters/viewmodels/DashboardViewModel";

// Interfaz que cualquier View del dashboard debe implementar
// Define un único método: recibir el ViewModel y mostrarlo
export interface DashboardView {
  // Renderiza el dashboard usando los datos ya formateados del ViewModel
  // La implementación puede ser consola, HTML, React, Flutter, etc.
  render(viewModel: DashboardViewModel): void;
}
