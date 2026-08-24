// ============================================================================
// 📦 PORT: TransactionGateway
// ============================================================================
// 📖 CAPA: APPLICATION → PORTS
//
//    Un GATEWAY es una interfaz que el Use Case usa para acceder a datos.
//    La implementación concreta (SQL, DynamoDB, etc.) vive en ADAPTERS.
//
//    📖 Robert C. Martin (Cap. 23):
//    "Los Gateways de Base de Datos son polimórficos. Forman un BOUNDARY
//    entre el interactor y la base de datos. Ese boundary genera
//    un HUMBLE OBJECT PATTERN."
//
//    El Gateway concreto es el HUMBLE OBJECT:
//    → Ejecuta SQL (difícil de testear sin BD real)
//    → Es simple: solo traduce llamadas a consultas
//
//    El Use Case / Interactor es el módulo TESTEABLE:
//    → Contiene la lógica de negocio
//    → Usa la interfaz del Gateway (no la implementación)
//    → Se testea con un mock del Gateway
// ============================================================================

// Importa la entity Transaction que el Gateway retorna
import { Transaction } from "../../domain/entities/Transaction";

// Interfaz que define las operaciones de acceso a transacciones
// El Use Case depende de ESTA interfaz, no de SQL ni DynamoDB
export interface TransactionGateway {
  // Busca todas las transacciones de una cuenta específica
  // Retorna un array de Transaction (entity del dominio)
  findByAccountId(accountId: string): Transaction[];

  // Guarda una transacción en el almacenamiento persistente
  // No le importa si es SQL, NoSQL, archivo, etc.
  save(transaction: Transaction): void;
}
