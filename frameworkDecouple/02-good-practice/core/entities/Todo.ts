// Exportamos la entidad Todo que representa la regla de negocio central
export class Todo {
  // Constructor para inicializar las propiedades de la entidad
  constructor(
    // Identificador único de la tarea (solo de lectura)
    public readonly id: string,
    // Texto descriptivo de la tarea (solo de lectura)
    public readonly text: string,
    // Estado que indica si la tarea está completada o no (puede cambiar)
    public isCompleted: boolean
  ) {
    // Aquí podríamos tener validaciones de negocio, ej. texto no puede ser vacío
    if (!text || text.trim() === '') {
      // Lanzamos un error si la regla de negocio no se cumple
      throw new Error('El texto del Todo no puede estar vacío');
    }
  }

  // Método de la entidad para marcar la tarea como completada
  markAsCompleted(): void {
    // Actualizamos la propiedad interna (Regla de negocio aislada)
    this.isCompleted = true;
  }

  // Método de la entidad para marcar la tarea como incompleta
  markAsIncomplete(): void {
    // Actualizamos la propiedad interna (Regla de negocio aislada)
    this.isCompleted = false;
  }
}
