// ============================================================================
// 📦 VIEW MODEL: TransactionViewModel
// ============================================================================
// 📖 CAPA: ADAPTERS → PRESENTERS → VIEW MODELS
//
//    Un ViewModel es una estructura de datos que contiene STRINGS y BOOLEANS
//    ya completamente formateados y listos para MOSTRAR EN PANTALLA.
//
//    📌 DIFERENCIA CLAVE:
//    Entity (Transaction):    amount = 3500           (número crudo)
//    ViewModel:               formattedAmount = "+$3,500.00" (string listo)
//
//    Entity (Transaction):    date = new Date(...)     (objeto Date)
//    ViewModel:               formattedDate = "25 jul" (string listo)
//
//    El Presenter TRANSFORMA Entity → ViewModel.
//    La View SOLO LEE el ViewModel y lo pone en pantalla.
//
//    📖 Robert C. Martin (Cap. 23):
//    "Si hay una Date, el Presenter la formatea en un string apropiado
//    y la coloca en el View Model. Si la aplicación quiere mostrar
//    dinero en la pantalla, le da formato de moneda con el símbolo
//    correcto, con el separador de miles y el separador decimal
//    apropiados... Todo lo que queda en la View es cargar datos
//    del View Model en la pantalla."
// ============================================================================

// ViewModel de una transacción individual
// TODO ya está formateado como strings listos para mostrar
export interface TransactionViewModel {
  icon: string;            // Emoji ya seleccionado ("💚" para ingreso, "🔴" para egreso)
  formattedDate: string;   // Fecha ya formateada como string (ej: "25 jul")
  formattedAmount: string; // Monto ya formateado con signo y moneda (ej: "+$3,500.00")
  description: string;     // Descripción de la transacción (ej: "Nómina quincenal")
  typeLabel: string;       // Etiqueta del tipo ya decidida ("(ingreso)" o "(egreso)")
  counterparty: string;    // Contraparte de la transacción (ej: "Empresa ABC S.A.")
}
