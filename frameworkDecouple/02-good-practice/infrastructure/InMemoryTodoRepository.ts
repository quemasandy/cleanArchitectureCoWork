// Importamos la entidad Todo del Core
import { Todo } from '../core/entities/Todo';
// Importamos la interfaz abstracta del repositorio del Core
import { TodoRepository } from '../core/interfaces/TodoRepository';

// Esta clase es un detalle de implementación de la capa de frameworks o infraestructura (DB)
export class InMemoryTodoRepository implements TodoRepository {
  // Usamos un arreglo privado en memoria para emular una persistencia real
  private items: Todo[] = [];

  // Implementamos el método abstracto getTodos definido en la interfaz
  async getTodos(): Promise<Todo[]> {
    // Retornamos una copia (spread operator) del arreglo para evitar que código externo mute el estado interno
    return [...this.items];
  }

  // Implementamos el método abstracto save
  async save(todo: Todo): Promise<void> {
    // Agregamos la entidad al final del arreglo
    this.items.push(todo);
  }

  // Implementamos el método abstracto update
  async update(id: string, updates: Partial<Pick<Todo, 'isCompleted' | 'text'>>): Promise<void> {
    // Buscamos cuál es la posición del elemento a actualizar
    const index = this.items.findIndex((item) => item.id === id);

    // Si la tarea existe en la memoria
    if (index !== -1) {
      // Extraemos el item obsoleto
      const current = this.items[index];
      // Reemplazamos el viejo item creando una nueva instancia Todo con los datos actualizados
      this.items[index] = new Todo(
        current.id,
        // Si hay una actualización de texto, se usa, si no, se mantiene el actual
        updates.text !== undefined ? updates.text : current.text,
        // Si hay una actualización de estado, se usa, si no, se mantiene el actual
        updates.isCompleted !== undefined ? updates.isCompleted : current.isCompleted
      );
    }
  }

  // Implementamos el método abstracto findById
  async findById(id: string): Promise<Todo | undefined> {
    // Retornamos el primer elemento que cumpla con el ID o undefined
    return this.items.find((item) => item.id === id);
  }
}
