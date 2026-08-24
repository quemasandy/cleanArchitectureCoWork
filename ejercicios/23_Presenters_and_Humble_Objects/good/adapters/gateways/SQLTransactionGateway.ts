// ============================================================================
// 📦 GATEWAY (HUMBLE OBJECT): SQLTransactionGateway
// ============================================================================
// 📖 CAPA: ADAPTERS → GATEWAYS
//
//    Este Gateway es un HUMBLE OBJECT en el boundary de la base de datos.
//
//    📖 Robert C. Martin (Cap. 23):
//    "Los Gateways de Base de Datos son polimórficos. Forman un BOUNDARY
//    entre el interactor y la base de datos."
//
//    ¿Por qué es "humble" (humilde)?
//    Porque ejecuta SQL real, que es DIFÍCIL de testear:
//    → Necesitas una base de datos corriendo
//    → Necesitas datos de prueba cargados
//    → Los tests son lentos y frágiles
//
//    Por eso lo hacemos lo más SIMPLE posible:
//    → Solo traduce llamadas de la interfaz a consultas SQL
//    → No tiene lógica de negocio
//    → No filtra, no calcula, no decide
//
//    La LÓGICA vive en el Interactor (Use Case), que es TESTEABLE.
//    El Interactor usa un mock de este Gateway en los tests.
// ============================================================================

// Importa la interfaz del Gateway definida por la capa de aplicación
import { TransactionGateway } from "../../application/ports/TransactionGateway";

// Importa la entity Transaction que el Gateway retorna
import { Transaction } from "../../domain/entities/Transaction";

// Gateway concreto que ejecuta SQL: Humble Object
// Es simple a propósito — la complejidad está en el Interactor
export class SQLTransactionGateway implements TransactionGateway {

  // Ejecuta una consulta SQL para buscar transacciones de una cuenta
  // En producción, aquí iría el SQL real contra la base de datos
  findByAccountId(accountId: string): Transaction[] {
    // Simula la ejecución de una consulta SQL
    console.log(`  🗄️  [Gateway/Humble] SELECT * FROM transactions WHERE account_id = '${accountId}'`);

    // Retorna datos simulados como si vinieran de la base de datos
    // En producción, estos datos vendrían del resultado del query SQL
    return [
      {
        id: "TRX-DB-001",                          // ID del registro en BD
        type: "DEPOSIT",                            // Tipo almacenado en BD
        amount: 1000,                               // Monto almacenado en BD
        date: new Date("2026-07-25"),               // Fecha almacenada en BD
        description: "Depósito desde BD",           // Descripción en BD
        counterparty: "Banco XYZ",                  // Contraparte en BD
      },
    ];
  }

  // Ejecuta un INSERT SQL para guardar una transacción
  // También es "humble": solo traduce el objeto a una consulta SQL
  save(transaction: Transaction): void {
    // Simula la ejecución de un INSERT SQL
    console.log(`  🗄️  [Gateway/Humble] INSERT INTO transactions VALUES ('${transaction.id}', ...)`);
  }
}
