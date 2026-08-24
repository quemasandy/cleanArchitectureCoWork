// ============================================================================
// 📦 USE CASE: GetRecentTransactionsUseCase (Interactor testeable)
// ============================================================================
// 📖 CAPA: APPLICATION → USE CASES
//
//    Este Use Case demuestra el HUMBLE OBJECT PATTERN en el boundary
//    de la BASE DE DATOS:
//
//    Gateway (Humble Object) → Ejecuta SQL (difícil de testear)
//    Interactor / Use Case (Testeable) → Filtra y procesa datos
//
//    📖 Robert C. Martin (Cap. 23):
//    "Los interactors encapsulan reglas de negocio de la aplicación...
//    los gateways son humble objects. Los interactors NO son humble."
//
//    Para testear este Use Case:
//    1. Creas un MockTransactionGateway que retorna datos fijos
//    2. Inyectas el mock en el constructor
//    3. Verificas que la lógica de filtrado funciona correctamente
//    ¡Sin base de datos! ¡Sin SQL! ¡Solo datos → lógica → resultado!
// ============================================================================

// Importa la interfaz del Gateway (NO la implementación SQL concreta)
import { TransactionGateway } from "../ports/TransactionGateway";

// Importa la entity Transaction que el Gateway retorna
import { Transaction } from "../../domain/entities/Transaction";

// Use Case / Interactor: contiene la lógica de negocio TESTEABLE
// Depende de la INTERFAZ TransactionGateway, no de SQL concreto
export class GetRecentTransactionsUseCase {
  // Recibe el Gateway por inyección de dependencias
  // En producción: SQLTransactionGateway
  // En tests: MockTransactionGateway
  constructor(private gateway: TransactionGateway) { }

  // Ejecuta la lógica de negocio: obtener y filtrar transacciones recientes
  execute(accountId: string): Transaction[] {
    console.log(`  🔄 [Interactor/Testeable] Obteniendo transacciones recientes...`);

    // Paso 1: Delega la consulta al Gateway (humble object)
    // El Interactor NO sabe si esto es SQL, DynamoDB, o un array en memoria
    const transactions = this.gateway.findByAccountId(accountId);

    // Paso 2: Lógica de negocio TESTEABLE → filtrar últimos 30 días
    // Esta es la parte que SÍ puedes testear fácilmente con un mock
    const thirtyDaysAgo = new Date();       // Obtiene la fecha actual
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // Resta 30 días

    // Filtra solo las transacciones de los últimos 30 días
    const recent = transactions.filter((tx) => tx.date >= thirtyDaysAgo);

    // Reporta el resultado del filtrado
    console.log(`  ✅ [Interactor/Testeable] Encontradas ${recent.length} transacciones recientes`);

    return recent; // Retorna las transacciones filtradas
  }
}
