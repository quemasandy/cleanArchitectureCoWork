// ============================================================================
// 📦 USE CASE: GetAccountDashboardUseCase
// ============================================================================
// 📖 CAPA: APPLICATION → USE CASES
//
//    Este Use Case obtiene los datos del dashboard de una cuenta
//    y los entrega al OUTPUT PORT (Presenter).
//
//    📌 FLUJO DE DATOS (Cap. 23):
//    Controller → [llama] → Use Case → [entrega a] → Output Port (Presenter)
//                                                           ↓
//                                                      ViewModel
//                                                           ↓
//                                                    View (Humble Object)
//
//    El Use Case NO sabe quién implementa el Output Port.
//    Puede ser un Presenter para consola, para HTML, para tests, etc.
//    Esto es DEPENDENCY INVERSION en acción.
// ============================================================================

// Importa la interfaz del Output Port (NO el Presenter concreto)
import { DashboardOutputPort } from "../ports/DashboardOutputPort";

// Importa la entity AccountData para construir los datos crudos
import { AccountData } from "../../domain/entities/AccountData";

// Use Case que orquesta la obtención de datos del dashboard
// Recibe el Output Port por inyección de dependencias
export class GetAccountDashboardUseCase {
  // El constructor recibe el Output Port como interfaz
  // En producción sería un Presenter, en tests sería un mock
  constructor(
    private outputPort: DashboardOutputPort // Interfaz, NO implementación concreta
  ) { }

  // Ejecuta el caso de uso: obtener datos y entregarlos al Output Port
  execute(accountId: string): void {
    console.log(`  🔄 [Use Case] Obteniendo dashboard para cuenta ${accountId}...\n`);

    // En un proyecto real, aquí se inyectaría un AccountRepository
    // y se obtendrían los datos de la base de datos.
    // Para este ejemplo didáctico, simulamos datos crudos.
    const accountData: AccountData = {
      id: accountId,                          // ID de la cuenta solicitada
      ownerName: "María García López",        // Nombre del titular
      balance: 15750.8,                       // Saldo como número crudo
      accountType: "SAVINGS",                 // Tipo de cuenta como enum
      frozen: false,                          // Estado activo (no congelada)
      lastLoginDate: new Date("2026-07-25T14:30:00"), // Último acceso como Date
      transactions: [                         // Transacciones recientes crudas
        {
          id: "TRX-001",                      // ID de transacción
          type: "DEPOSIT",                    // Tipo: depósito entrante
          amount: 3500,                       // Monto crudo sin formatear
          date: new Date("2026-07-25T10:15:00"), // Fecha como objeto Date
          description: "Nómina quincenal",    // Descripción del movimiento
          counterparty: "Empresa ABC S.A.",   // Quién depositó
        },
        {
          id: "TRX-002",                      // ID de transacción
          type: "WITHDRAWAL",                 // Tipo: retiro de dinero
          amount: 250.5,                      // Monto crudo sin formatear
          date: new Date("2026-07-24T18:45:00"), // Fecha como objeto Date
          description: "Retiro ATM",          // Descripción del movimiento
          counterparty: "ATM Centro Comercial", // Dónde se retiró
        },
        {
          id: "TRX-003",                      // ID de transacción
          type: "TRANSFER_OUT",               // Tipo: transferencia enviada
          amount: 1200,                       // Monto crudo sin formatear
          date: new Date("2026-07-23T09:00:00"), // Fecha como objeto Date
          description: "Pago renta",          // Descripción del movimiento
          counterparty: "Juan Pérez",         // A quién se envió
        },
        {
          id: "TRX-004",                      // ID de transacción
          type: "TRANSFER_IN",               // Tipo: transferencia recibida
          amount: 500,                        // Monto crudo sin formatear
          date: new Date("2026-07-22T16:20:00"), // Fecha como objeto Date
          description: "Pago compartido cena", // Descripción del movimiento
          counterparty: "Ana Rodríguez",      // Quién envió el dinero
        },
      ],
    };

    // ✅ Entrega los datos al Output Port (Presenter)
    // El Use Case NO sabe si es un Presenter de consola, HTML, o un mock de test
    // Solo sabe que alguien implementa la interfaz DashboardOutputPort
    this.outputPort.present(accountData);
  }
}
