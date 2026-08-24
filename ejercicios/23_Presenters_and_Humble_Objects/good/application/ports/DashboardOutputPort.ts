// ============================================================================
// 📦 OUTPUT PORT: DashboardOutputPort
// ============================================================================
// 📖 CAPA: APPLICATION → PORTS (interfaces definidas por los Use Cases)
//
//    Un OUTPUT PORT es una INTERFAZ que el Use Case usa para ENTREGAR datos.
//    El Presenter IMPLEMENTA esta interfaz.
//
//    ¿Por qué es una interfaz y no una clase concreta?
//    Porque así respetamos la DEPENDENCY RULE:
//    → El Use Case (capa interna) define la interfaz
//    → El Presenter (capa externa) la implementa
//    → La dependencia apunta HACIA ADENTRO ✅
//
//    Si el Use Case importara directamente el Presenter,
//    la dependencia apuntaría HACIA AFUERA ❌ (violación).
//
//    📺 ANALOGÍA: El Output Port es como el CONTRATO del noticiero.
//    "El reportero (Use Case) entrega la noticia a ALGUIEN que sepa
//    formatearla. No le importa si es para TV, radio o web."
// ============================================================================

// Importa la entity AccountData que es el dato crudo que se entrega
import { AccountData } from "../../domain/entities/AccountData";

// Interfaz que define CÓMO el Use Case entrega sus datos de salida
// Cualquier Presenter debe implementar este método
export interface DashboardOutputPort {
  // Recibe los datos crudos del Use Case y los procesa
  // El Use Case llama a este método con los datos, sin saber quién lo implementa
  present(data: AccountData): void;
}
