// ============================================================================
// 📦 PORT: PaymentReceivedEvent (DTO de evento)
// ============================================================================
// 📖 CAPA: APPLICATION → PORTS
//
//    Este es un DTO (Data Transfer Object) que representa un evento
//    de pago recibido. Es la estructura de datos SIMPLE que el
//    Service Listener (Humble Object) crea y pasa al Interactor.
//
//    📖 Robert C. Martin (Cap. 23):
//    "Los service listeners recibirán datos de la interfaz del servicio
//    y los formatearán en una estructura de datos simple... y entonces
//    pasarán esa estructura al service interactor."
//
//    Esta interfaz es el "contrato" entre:
//    → Listener (Humble): parsea JSON de la red → crea este DTO
//    → Interactor (Testeable): recibe este DTO → procesa la lógica
// ============================================================================

// Interfaz que define los datos de un evento de pago recibido
// El Listener crea esta estructura, el Interactor la consume
export interface PaymentReceivedEvent {
  paymentId: string;    // ID único del pago recibido
  accountId: string;    // ID de la cuenta destino del pago
  amount: number;       // Monto del pago como número crudo
  senderName: string;   // Nombre de quien envía el pago
}
