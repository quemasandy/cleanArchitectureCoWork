// ============================================================================
// 📦 ENTITY: AccountData (Datos de cuenta bancaria)
// ============================================================================
// 📖 CAPA: DOMAIN (la capa más INTERNA de Clean Architecture)
//
//    Representa los datos de una cuenta bancaria tal como existen en el negocio.
//    Importa Transaction porque es OTRA entity del mismo dominio.
//
//    📌 NOTA: Las entities PUEDEN depender de OTRAS entities.
//    Lo que NO pueden es depender de capas externas (adapters, infrastructure).
// ============================================================================

// Importa la entity Transaction del mismo dominio
import { Transaction } from "./Transaction";

// Interfaz que define los datos crudos de una cuenta bancaria
// Todos los datos están en su forma "natural" sin formatear
export interface AccountData {
  id: string;           // Identificador de la cuenta (ej: "ACC-001")
  ownerName: string;    // Nombre completo del titular
  balance: number;      // Saldo actual como número crudo (ej: 15750.8)
  accountType: AccountType; // Tipo de cuenta (ahorro o corriente)
  frozen: boolean;      // Si la cuenta está congelada (true/false)
  lastLoginDate: Date;  // Última vez que el usuario ingresó al sistema
  transactions: Transaction[]; // Lista de transacciones recientes de la cuenta
}

// Tipo enumerado para los tipos de cuenta disponibles
export type AccountType =
  | "SAVINGS"   // Cuenta de Ahorro: para guardar dinero con intereses
  | "CHECKING"; // Cuenta Corriente: para transacciones diarias
