// Importamos la entidad Todo y la interfaz del repositorio del Core
import { Todo } from '../entities/Todo';
import { TodoRepository } from '../interfaces/TodoRepository';

// Exportamos la clase GetTodosUseCase que representa un caso de uso de consulta
export class GetTodosUseCase {
  // Inyectamos el repositorio a través de su interfaz (Dependency Inversion Principle)
  constructor(private readonly todoRepository: TodoRepository) { }

  // Ejecutamos el caso de uso
  async execute(): Promise<Todo[]> {
    // Solicitamos los Todos al repositorio y los retornamos al llamador
    return await this.todoRepository.getTodos();
  }
}
