// ============================================================================
// 📦 ENTITY: Transaction (Transacción bancaria)
// ============================================================================
// 📖 CAPA: DOMAIN (la capa más INTERNA de Clean Architecture)
//
//    Esta interfaz representa una transacción tal como EXISTE en el negocio.
//    No sabe de UI, ni de bases de datos, ni de formateo.
//    Contiene datos CRUDOS: números, Dates, enums.
//
//    📌 REGLA: Las entities NO dependen de NADA externo.
//    Son puras, sin imports de frameworks, sin dependencias de infraestructura.
// ============================================================================

// Interfaz que define los datos crudos de una transacción bancaria
// Los datos están en su forma "natural": números, Dates, strings sin formatear
export interface Transaction {
  id: string;          // Identificador único de la transacción (ej: "TRX-001")
  type: TransactionType; // Tipo de movimiento (depósito, retiro, etc.)
  amount: number;      // Monto como número crudo (ej: 1500.5, NO "$1,500.50")
  date: Date;          // Fecha como objeto Date (NO como string formateado)
  description: string; // Descripción del movimiento (ej: "Nómina quincenal")
  counterparty: string; // La otra parte involucrada (ej: "Empresa ABC S.A.")
}

// Tipo enumerado para los tipos de transacción posibles
// Cada tipo representa un movimiento diferente en el sistema bancario
export type TransactionType =
  | "DEPOSIT"       // Depósito: dinero que ENTRA a la cuenta
  | "WITHDRAWAL"    // Retiro: dinero que SALE de la cuenta
  | "TRANSFER_IN"   // Transferencia recibida: dinero que LLEGA de otra cuenta
  | "TRANSFER_OUT"; // Transferencia enviada: dinero que SE VA a otra cuenta
