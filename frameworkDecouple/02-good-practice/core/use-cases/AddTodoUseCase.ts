// Importamos la entidad Todo y la interfaz del repositorio del Core
import { Todo } from '../entities/Todo';
import { TodoRepository } from '../interfaces/TodoRepository';

// Exportamos la clase AddTodoUseCase que representa un caso de uso específico de la aplicación
export class AddTodoUseCase {
  // Inyectamos la dependencia a través de la abstracción, sin conocer el framework de la base de datos
  constructor(private readonly todoRepository: TodoRepository) { }

  // El método execute contiene la lógica orquestadora del caso de uso
  async execute(text: string): Promise<void> {
    // Generamos un id simple (en un entorno real podría venir de un IdGenerator o UUID)
    const id = Math.random().toString(36).substring(7);

    // Inicializamos la nueva entidad Todo (las validaciones de negocio están dentro de la entidad)
    const newTodo = new Todo(id, text, false);

    // Delegamos la persistencia a la abstracción del repositorio
    await this.todoRepository.save(newTodo);
  }
}
