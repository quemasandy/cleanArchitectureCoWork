// Importamos Component y OnInit desde el núcleo del framwork de Angular para construir la UI
import { Component, OnInit } from '@angular/core';
// Importamos la entidad Todo para tipar estáticamente el arreglo de vista que pintará Angular
import { Todo } from '../core/entities/Todo';
// Importamos exactamente los mismos casos de uso del Core que usamos para React
import { GetTodosUseCase } from '../core/use-cases/GetTodosUseCase';
import { AddTodoUseCase } from '../core/use-cases/AddTodoUseCase';
import { ToggleTodoUseCase } from '../core/use-cases/ToggleTodoUseCase';
// Importamos la implementación en memoria del repositorio de infraestructura
import { InMemoryTodoRepository } from '../infrastructure/InMemoryTodoRepository';

// Simulamos la creación de instancias para DI (en Angular real se usarían proveedores e Inyección automática @Injectable)
const repository = new InMemoryTodoRepository();
// El Core se instancia igual que en React, porque no le importa quién lo llame
const getTodosUseCase = new GetTodosUseCase(repository);
const addTodoUseCase = new AddTodoUseCase(repository);
const toggleTodoUseCase = new ToggleTodoUseCase(repository);

// Decorador @Component que expone los metadatos y le dice a Angular que esta clase es un UI
@Component({
  // Etiqueta HTML personalizada que se usará para instanciar este componente encapsulado
  selector: 'app-todo-list',
  // Definimos la plantilla HTML estructural (podría estar en un archivo externo independiente .html)
  template: `
    <!-- Contenedor principal de la UI Angular -->
    <div>
      <!-- Título de la interfaz de Angular que confirma qué marco UI usamos -->
      <h1>Todo List (Good Practice - Angular)</h1>
      <!-- Sección superior de captura de la intención de nueva tarea -->
      <div>
        <!-- Input de texto con manejo manual de data binding, reacciona a eventos input puros -->
        <input 
          type="text" 
          [value]="inputValue" 
          (input)="onInputChange($event)" 
          placeholder="New Todo" 
        />
        <!-- Botón que invoca el método controlador principal al hacer clic en él -->
        <button (click)="handleAddAction()">Add</button>
      </div>
      <!-- Lista desordenada renderizada iterativamente en el DOM de Angular -->
      <ul>
        <!-- Directiva *ngFor para iterar dinámicamente sobre la propiedad 'todos' del componente -->
        <li *ngFor="let todo of todos">
          <!-- Checkbox renderizado con binding del DOM [checked] basándose en la verdadera entidad limpia -->
          <input 
            type="checkbox" 
            [checked]="todo.isCompleted" 
            (change)="handleToggleAction(todo.id)" 
          />
          <!-- Span que aplica el tachado condicionalmente usando style binding de Angular de una línea -->
          <span [style.text-decoration]="todo.isCompleted ? 'line-through' : 'none'">
            <!-- String interpolation para enlazar directamente el texto de la entidad a pintar -->
            {{ todo.text }}
          </span>
        </li>
      </ul>
    </div>
  `
})
// Exportamos la clase controladora del componente Angular que implementa interfaz de ciclo de vida nativa
export class AngularTodoListComponent implements OnInit {
  // Arreglo asignado local a la clase para que el template HTML y Angular puedan acceder y pintar
  todos: Todo[] = [];
  // Cadena local reactiva que almacena en la vista el nuevo input tipeado
  inputValue: string = '';

  // Método especial OnInit que Angular invoca cuando el componente ya está inicializado y puesto en DOM
  async ngOnInit() {
    // Es equivalente al useEffect con []. Disparamos la carga inicial al Core agnóstico.
    await this.loadTodosFromCore();
  }

  // Método privado de apoyo para refrescar y pedir los datos oficiales al caso de uso del dominio interno
  private async loadTodosFromCore() {
    // La UI no consulta bases de datos ni lógicas raras. Solo ejecuta el getTodosUseCase.
    this.todos = await getTodosUseCase.execute();
  }

  // Método para actualizar la variable inputValue reaccionando al evento del DOM nativo
  onInputChange(event: any) {
    // Leemos el valor del objetivo emisor y guardamos en estado local controlador (binding de un canal simple)
    this.inputValue = event.target.value;
  }

  // Handler visual invocado desde HTML cuando se requiere almacenar la agregación
  async handleAddAction() {
    // Verificamos superficialmente que haya texto útil antes de ir al Core a molestar
    if (this.inputValue.trim() === '') return;

    // Delegamos exitosamente la adición y validación compleja de lógica de negocio al caso superior
    await addTodoUseCase.execute(this.inputValue);
    // Vaciamos el text box para que el usuario pueda tipear otra al tiro
    this.inputValue = '';
    // Como la base de datos cambió, solicitamos sincronizar recargando visualmente a través del getUseCase
    await this.loadTodosFromCore();
  }

  // Handler visual para solicitar formalmente cambiar de estado pasando tan solo un ID de la interfaz UI
  async handleToggleAction(id: string) {
    // Le mandamos la petición al ToggleTodoUseCase abstrayendo la mutación y si es que este existe u otras condicionales
    await toggleTodoUseCase.execute(id);
    // Solicitamos refrescar los datos pintados asincrónicamente para que el usuario perciba su tachado nuevo a tiempo
    await this.loadTodosFromCore();
  }
}
