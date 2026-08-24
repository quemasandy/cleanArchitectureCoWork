// ============================================================================
// 📦 USE CASE: ProcessPaymentUseCase (Interactor testeable)
// ============================================================================
// 📖 CAPA: APPLICATION → USE CASES
//
//    Este Use Case demuestra el HUMBLE OBJECT PATTERN en el boundary
//    de SERVICIOS EXTERNOS:
//
//    Service Listener (Humble Object) → Recibe mensajes de la red
//    Interactor / Use Case (Testeable) → Procesa la lógica del pago
//
//    📖 Robert C. Martin (Cap. 23):
//    "Los service listeners recibirán datos de la interfaz del servicio
//    y los formatearán en una estructura de datos simple... y entonces
//    pasarán esa estructura al service interactor."
//
//    El Listener (Humble):
//    → Parsea JSON crudo de la red
//    → Crea un PaymentReceivedEvent (DTO simple)
//    → Lo pasa al Interactor
//
//    El Interactor (Testeable):
//    → Recibe el DTO simple
//    → Aplica reglas de negocio (validar monto, procesar pago)
//    → Es fácil de testear: solo datos → lógica → resultado
// ============================================================================

// Importa el DTO que define la estructura del evento de pago
import { PaymentReceivedEvent } from "../ports/PaymentReceivedEvent";

// Use Case / Interactor: procesa eventos de pago (TESTEABLE)
// No sabe de HTTP, WebSockets, ni red. Solo recibe un DTO simple.
export class ProcessPaymentUseCase {
  // Procesa un evento de pago recibido
  // Recibe datos simples, aplica lógica de negocio, produce un resultado
  process(event: PaymentReceivedEvent): void {
    console.log(`  🔄 [Interactor/Testeable] Procesando pago ${event.paymentId}...`);

    // ✅ Lógica de negocio testeable: validar que el monto sea positivo
    // En un test: process({ amount: -100, ... }) → debería rechazarlo
    if (event.amount <= 0) {
      console.log(`  ❌ [Interactor] Monto inválido: ${event.amount}`);
      return; // Rechaza pagos con monto no válido
    }

    // ✅ Lógica de negocio testeable: procesar el pago
    // En un test: verificas que el saldo se actualiza correctamente
    console.log(`  ✅ [Interactor] Pago de $${event.amount} de ${event.senderName} → cuenta ${event.accountId}`);

    // En un proyecto real, aquí se actualizaría el saldo via repositorio
    console.log(`  💾 [Interactor] Actualizando saldo de cuenta ${event.accountId}...`);
  }
}
