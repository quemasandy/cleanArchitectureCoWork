// ============================================================================
// 📦 SERVICE LISTENER (HUMBLE OBJECT): PaymentServiceListener
// ============================================================================
// 📖 CAPA: INFRASTRUCTURE → LISTENERS
//
//    Este Listener es un HUMBLE OBJECT en el boundary de servicios externos.
//
//    📖 Robert C. Martin (Cap. 23):
//    "Los service listeners recibirán datos de la interfaz del servicio
//    y los formatearán en una estructura de datos simple... y entonces
//    pasarán esa estructura al service interactor."
//
//    ¿Por qué es "humble" (humilde)?
//    Porque recibe mensajes de la RED, que es DIFÍCIL de testear:
//    → Necesitas un servidor corriendo
//    → Necesitas simular conexiones de red
//    → Los mensajes pueden llegar en cualquier formato
//
//    Por eso lo hacemos lo más SIMPLE posible:
//    → Solo PARSEA el mensaje crudo (JSON.parse)
//    → Solo CREA un DTO simple (PaymentReceivedEvent)
//    → Solo DELEGA al Interactor (Use Case)
//    → NO tiene lógica de negocio
//
//    La LÓGICA vive en el ProcessPaymentUseCase (Interactor), que es TESTEABLE.
// ============================================================================

// Importa el Use Case / Interactor que procesará los datos
import { ProcessPaymentUseCase } from "../../application/usecases/ProcessPaymentUseCase";

// Importa el DTO que el Listener crea y el Interactor consume
import { PaymentReceivedEvent } from "../../application/ports/PaymentReceivedEvent";

// Service Listener: Humble Object que recibe mensajes de la red
// Solo parsea y delega — toda la lógica está en el Interactor
export class PaymentServiceListener {

  // Recibe el Interactor por inyección de dependencias
  // El Listener no sabe qué hace el Interactor, solo le pasa datos
  constructor(private interactor: ProcessPaymentUseCase) { }

  // Recibe un mensaje crudo de la red (string JSON)
  // Este método sería llamado por el framework de mensajería (SQS, Kafka, etc.)
  onMessageReceived(rawMessage: string): void {
    console.log(`  📡 [Listener/Humble] Mensaje recibido de la red...`);

    // Paso 1: Parsea el mensaje crudo (única responsabilidad del Listener)
    const data = JSON.parse(rawMessage); // Convierte JSON string → objeto JavaScript

    // Paso 2: Crea la estructura de datos simple que el Interactor espera
    // El Listener "traduce" el formato externo al formato interno (DTO)
    const event: PaymentReceivedEvent = {
      paymentId: data.id,       // Extrae el ID del pago del JSON
      accountId: data.account,  // Extrae la cuenta destino del JSON
      amount: data.amount,      // Extrae el monto del JSON
      senderName: data.sender,  // Extrae el nombre del remitente del JSON
    };

    // Paso 3: Delega al Interactor (la lógica testeable)
    // El Listener NO procesa, NO valida, NO decide — solo pasa datos
    this.interactor.process(event);
  }
}
