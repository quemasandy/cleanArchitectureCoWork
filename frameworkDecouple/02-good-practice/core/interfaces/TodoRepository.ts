// Importamos la entidad Todo, ya que nuestro repositorio trabajará con ella
import { Todo } from '../entities/Todo';

// Exportamos la interfaz TodoRepository que define el contrato de datos
export interface TodoRepository {
  // Método que debe devolver una promesa con un arreglo de Todos (o lanzará error de TS si no se cumple)
  getTodos(): Promise<Todo[]>;

  // Método para guardar un nuevo Todo, no retorna un valor específico (void en Promesa)
  save(todo: Todo): Promise<void>;

  // Método para actualizar un Todo existente, requiere el id y un objeto con propiedades opcionales a actualizar
  update(id: string, updates: Partial<Pick<Todo, 'isCompleted' | 'text'>>): Promise<void>;

  // Método opcional para simular búsquedas, puede retornar undefined si no se encuentra
  findById(id: string): Promise<Todo | undefined>;
}
