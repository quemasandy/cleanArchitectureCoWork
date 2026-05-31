// Importamos la interfaz del repositorio
import { TodoRepository } from '../interfaces/TodoRepository';

// Caso de uso para alternar el estado de completado de un Todo
export class ToggleTodoUseCase {
  // Inyección de dependencias basada en la interfaz, sin importar la implementación
  constructor(private readonly todoRepository: TodoRepository) { }

  // Ejecutamos la acción pasándole el ID de la tarea
  async execute(id: string): Promise<void> {
    // Primero, pedimos al repositorio buscar la entidad por su ID
    const todo = await this.todoRepository.findById(id);

    // Si no existe, podemos lanzar un error como regla de aplicación
    if (!todo) {
      throw new Error(`Todo with id ${id} not found`);
    }

    // Usamos los métodos de dominio de la propia entidad para cambiar el estado de manera segura (Rich Domain Model)
    if (todo.isCompleted) {
      todo.markAsIncomplete();
    } else {
      todo.markAsCompleted();
    }

    // Actualizamos el repositorio informando de los nuevos datos de la entidad a guardar
    await this.todoRepository.update(id, { isCompleted: todo.isCompleted });
  }
}
