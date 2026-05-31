// Importamos React y los hooks useState y useEffect para manejar estado y ciclo de vida de la UI
import React, { useState, useEffect } from 'react';
// Importamos la entidad Todo del Core, la usamos solo como un tipo de dato a mostrar en la interfaz
import { Todo } from '../core/entities/Todo';
// Importamos los casos de uso que contienen la lógica real de negocio
import { GetTodosUseCase } from '../core/use-cases/GetTodosUseCase';
import { AddTodoUseCase } from '../core/use-cases/AddTodoUseCase';
import { ToggleTodoUseCase } from '../core/use-cases/ToggleTodoUseCase';
// Importamos la implementación concreta del repositorio (esto usualmente se inyecta desde un contenedor de DI)
import { InMemoryTodoRepository } from '../infrastructure/InMemoryTodoRepository';

// Creamos un repositorio fuera del componente para simular inyección de dependencias (Singleton para la app)
const repository = new InMemoryTodoRepository();
// Instanciamos los casos de uso, pasándoles el repositorio como abstracción, conectando el Core con la Infra
const getTodosUseCase = new GetTodosUseCase(repository);
const addTodoUseCase = new AddTodoUseCase(repository);
const toggleTodoUseCase = new ToggleTodoUseCase(repository);

// Exportamos el componente funcional ReactTodoList. Fíjate que no tiene lógica de negocio interna.
export const ReactTodoList: React.FC = () => {
  // Estado para almacenar la lista de tareas, React no sabe NADA de reglas de negocio, solo de pintar datos
  const [todos, setTodos] = useState<Todo[]>([]);
  // Estado para manejar el input de la UI (esto es detalle puramente de UI)
  const [inputValue, setInputValue] = useState<string>('');

  // Función asíncrona dedicada a cargar los Todos usando el caso de uso apropiado
  const loadTodos = async () => {
    // El caso de uso orquesta la obtención de datos
    const fetchedTodos = await getTodosUseCase.execute();
    // Actualizamos el estado interno de visualización de React
    setTodos(fetchedTodos);
  };

  // Usamos useEffect para cargar los datos solo la primera vez que se renderiza (monta) el componente en DOM
  useEffect(() => {
    // Llamamos a la función de carga inicial
    loadTodos();
  }, []);

  // Función para manejar el evento del botón de agregar de forma agnóstica a la regla en sí
  const handleAdd = async () => {
    // Solo validamos visualmente que haya texto para no enviar vacío sin necesidad al Core
    if (inputValue.trim() === '') return;

    // Delegamos la lógica principal y la creación de la entidad completa al caso de uso pertinente
    await addTodoUseCase.execute(inputValue);
    // Limpiamos el valor visual del input de la UI
    setInputValue('');
    // Recargamos la lista leyendo desde la fuente de la verdad para ver los cambios reflejados
    await loadTodos();
  };

  // Función para manejar el evento visual de cambio en el checkbox
  const handleToggle = async (id: string) => {
    // Delegamos la lógica compleja de cambiar de estado y guardarlo al caso de uso de negocio
    await toggleTodoUseCase.execute(id);
    // Recargamos la lista desde el Core para repintar la vista
    await loadTodos();
  };

  // Renderizamos la estructura JSX de la interfaz gráfica web (El detalle de implementación)
  return (
    // Contenedor principal
    <div>
      {/* Título visual de la interfaz de React */}
      <h1>Todo List (Good Practice - React)</h1>
      {/* Contenedor del formulario simple */}
      <div>
        {/* Input para recoger la intención de texto del usuario */}
        <input
          // Tipo texto estándar DOM
          type="text"
          // Valor enlazado bidireccionalmente al estado inputValue local
          value={inputValue}
          // Función que actualiza el estado justo al escribir cada letra
          onChange={(e) => setInputValue(e.target.value)}
          // Atributo placeholder del DOM para enseñar qué hacer
          placeholder="New Todo"
        />
        {/* Botón que acciona el handler de agregar al ocurrir el evento onClick */}
        <button onClick={handleAdd}>Add</button>
      </div>
      {/* Lista visual desordenada para las tareas */}
      <ul>
        {/* Recorremos el estado de todos para crear elementos dinámicos */}
        {todos.map((todo) => (
          // Definimos un elemento de lista por cada entidad iterada, usando el id del Core como llave React
          <li key={todo.id}>
            {/* Input tipo checkbox nativo para accionar cambios */}
            <input
              // Tipo de dato visual checkbox
              type="checkbox"
              // Determina si se marca o no leyendo directamente la entidad de negocio inmutable visualmente
              checked={todo.isCompleted}
              // Ejecuta el toggle delegate y le pasa solo el ID estricto
              onChange={() => handleToggle(todo.id)}
            />
            {/* Elemento de texto con estilo condicional de React basado en la regla de negocio evaluada en base de datos */}
            <span style={{ textDecoration: todo.isCompleted ? 'line-through' : 'none' }}>
              {/* Texto de la entidad mostrada limpiamente en la UI */}
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
