// Importamos React y el hook useState para manejar el estado del componente
import React, { useState } from 'react';

// Definimos la interfaz Todo para tipar nuestras tareas
interface Todo {
  // El identificador único de la tarea
  id: string;
  // El texto descriptivo de la tarea
  text: string;
  // Un booleano que indica si la tarea está completada o no
  isCompleted: boolean;
}

// Exportamos el componente funcional BadTodoList
export const BadTodoList: React.FC = () => {
  // Inicializamos el estado 'todos' con un arreglo vacío
  const [todos, setTodos] = useState<Todo[]>([]);
  // Inicializamos el estado 'inputValue' para el texto del nuevo todo
  const [inputValue, setInputValue] = useState<string>('');

  // Función para agregar un nuevo todo
  const handleAddTodo = () => {
    // Si el valor del input está vacío, no hacemos nada
    if (inputValue.trim() === '') return;

    // Creamos el nuevo objeto Todo
    const newTodo: Todo = {
      // Generamos un id aleatorio simple (esto debería ser la lógica de negocio, no de UI)
      id: Math.random().toString(36).substring(7),
      // Asignamos el texto del input
      text: inputValue,
      // Inicialmente la tarea no está completada
      isCompleted: false,
    };

    // Actualizamos el estado agregando el nuevo todo al final (esto acopla la UI a la regla de negocio)
    setTodos([...todos, newTodo]);
    // Limpiamos el valor del input
    setInputValue('');
  };

  // Función para alternar el estado de completado de un todo
  const handleToggleTodo = (id: string) => {
    // Mapeamos los todos para encontrar el que queremos actualizar por su id
    const updatedTodos = todos.map((todo) =>
      // Si el id coincide, invertimos su propiedad isCompleted (lógica de negocio embebida en la UI)
      todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
    );
    // Actualizamos el estado con los todos modificados
    setTodos(updatedTodos);
  };

  // Retornamos el JSX del componente
  return (
    // Contenedor principal
    <div>
      {/* Título de la aplicación */}
      <h1>Todo List (Bad Practice)</h1>
      {/* Contenedor del input y botón */}
      <div>
        {/* Input para escribir la nueva tarea */}
        <input
          // Tipo texto
          type="text"
          // Valor enlazado al estado inputValue
          value={inputValue}
          // Evento onChange para actualizar el estado inputValue al escribir
          onChange={(e) => setInputValue(e.target.value)}
          // Placeholder para guiar al usuario
          placeholder="New Todo"
        />
        {/* Botón para agregar la tarea, ejecuta handleAddTodo al hacer clic */}
        <button onClick={handleAddTodo}>Add</button>
      </div>
      {/* Lista no ordenada para mostrar los todos */}
      <ul>
        {/* Mapeamos el arreglo de todos para renderizar un elemento de lista por cada uno */}
        {todos.map((todo) => (
          // Elemento de lista con su key única
          <li key={todo.id}>
            {/* Checkbox para marcar la tarea como completada */}
            <input
              // Tipo checkbox
              type="checkbox"
              // Refleja el estado isCompleted del todo
              checked={todo.isCompleted}
              // Ejecuta handleToggleTodo pasando el id al cambiar el estado
              onChange={() => handleToggleTodo(todo.id)}
            />
            {/* Span con el texto de la tarea, aplicando estilo tachado si está completada */}
            <span style={{ textDecoration: todo.isCompleted ? 'line-through' : 'none' }}>
              {/* Mostramos el texto del todo */}
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
