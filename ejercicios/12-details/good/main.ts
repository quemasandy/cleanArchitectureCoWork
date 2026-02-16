// ============================================================================
// ✅ BUEN EJEMPLO: Frameworks, Web y BD son DETALLES (Mini-Proyecto)
// ============================================================================
// 📖 PRINCIPIOS (Clean Architecture Cap. 30, 31, 32):
//    - Cap. 30: "La Base de Datos es un Detalle" → Usa Repository Pattern
//    - Cap. 31: "El Web es un Detalle" → El input puede venir de cualquier lado
//    - Cap. 32: "Los Frameworks son Detalles" → Tu lógica no depende del framework
//
// ✅ SOLUCIÓN: La lógica de negocio es PURA y no conoce ningún framework.
//    Express, Lambda, CLI son PLUGINS intercambiables.
//    DynamoDB, PostgreSQL, InMemory son PLUGINS intercambiables.
//
//    Para demostrarlo, la MISMA lógica funciona con:
//    - Express (adaptador web)
//    - Lambda (adaptador serverless)
//    - CLI (adaptador de línea de comandos)
//    Y con:
//    - InMemory (adaptador de BD en memoria)
//    - "DynamoDB" (adaptador de BD simulado)
// ============================================================================

// ============================================================================
// 🟢 CAPA 1: ENTITIES (no conocen NADA externo)
// ============================================================================

class Task {
  public readonly dueDate: Date;

  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly priority: "low" | "medium" | "high",
    public status: string = "pending"
  ) {
    // ✅ Validación de negocio dentro de la entidad
    if (title.length < 3) {
      throw new Error("El título debe tener al menos 3 caracteres");
    }

    // ✅ Regla de negocio: fecha de vencimiento según prioridad
    const daysMap = { low: 14, medium: 7, high: 3 };
    this.dueDate = new Date();
    this.dueDate.setDate(this.dueDate.getDate() + daysMap[this.priority]);
  }

  // ✅ Regla de negocio pura
  isOverdue(): boolean {
    return new Date() > this.dueDate;
  }

  complete(): void {
    this.status = "completed";
  }
}

// ============================================================================
// 🟡 CAPA 2: USE CASES (interfaces + lógica de aplicación)
// No conocen Express, Lambda, DynamoDB, ni ningún framework
// ============================================================================

// ✅ Interface que el USE CASE define (no el framework)
interface TaskRepository {
  save(task: Task): void;
  findAll(): Task[];
  findById(id: string): Task | null;
}

// ✅ Input/Output del Use Case - formato de DOMINIO, no de HTTP
interface CreateTaskInput {
  title: string;
  description: string;
  priority: string;
}

interface CreateTaskOutput {
  success: boolean;
  task?: {
    id: string;
    title: string;
    priority: string;
    dueDate: string;
    status: string;
  };
  error?: string;
}

interface ListTasksOutput {
  tasks: {
    id: string;
    title: string;
    priority: string;
    dueDate: string;
    status: string;
  }[];
  total: number;
}

// ✅ Use Case PURO: crear tarea
class CreateTaskUseCase {
  constructor(private taskRepo: TaskRepository) { }

  execute(input: CreateTaskInput): CreateTaskOutput {
    try {
      // Validar prioridad
      const validPriorities = ["low", "medium", "high"];
      const priority = validPriorities.includes(input.priority)
        ? (input.priority as "low" | "medium" | "high")
        : "medium";

      // Crear entidad (validación de negocio ocurre aquí)
      const taskId = `TASK-${Date.now()}`;
      const task = new Task(taskId, input.title, input.description, priority);

      // Persistir via interface
      this.taskRepo.save(task);

      return {
        success: true,
        task: {
          id: task.id,
          title: task.title,
          priority: task.priority,
          dueDate: task.dueDate.toISOString(),
          status: task.status,
        },
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

// ✅ Use Case PURO: listar tareas
class ListTasksUseCase {
  constructor(private taskRepo: TaskRepository) { }

  execute(): ListTasksOutput {
    const tasks = this.taskRepo.findAll();
    return {
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        dueDate: t.dueDate.toISOString(),
        status: t.status,
      })),
      total: tasks.length,
    };
  }
}

// ============================================================================
// 🟠 CAPA 3: ADAPTERS - BD (El detalle de base de datos es INTERCAMBIABLE)
// ============================================================================

// ✅ Adaptador 1: Base de datos en memoria
class InMemoryTaskRepository implements TaskRepository {
  private tasks: Map<string, Task> = new Map();

  save(task: Task): void {
    this.tasks.set(task.id, task);
    console.log(`    💾 [InMemory] Guardando task ${task.id}`);
  }

  findAll(): Task[] {
    return Array.from(this.tasks.values());
  }

  findById(id: string): Task | null {
    return this.tasks.get(id) || null;
  }
}

// ✅ Adaptador 2: "DynamoDB" - MISMA interface, diferente implementación
class DynamoDBTaskRepository implements TaskRepository {
  private table: Map<string, any> = new Map();

  save(task: Task): void {
    // Aquí van los detalles específicos de DynamoDB (PK, SK, etc.)
    const record = {
      PK: `TASK#${task.id}`,
      SK: `META`,
      title: task.title,
      priority: task.priority,
      status: task.status,
    };
    this.table.set(task.id, task);
    console.log(`    💾 [DynamoDB] PUT Item PK=${record.PK} SK=${record.SK}`);
  }

  findAll(): Task[] {
    return Array.from(this.table.values());
  }

  findById(id: string): Task | null {
    return this.table.get(id) || null;
  }
}

// ============================================================================
// 🔴 CAPA 4: FRAMEWORKS/DRIVERS - Web es un DETALLE intercambiable
// La MISMA lógica funciona con Express, Lambda, O CLI
// ============================================================================

// ✅ Adaptador Web 1: "Express" (simulado)
class ExpressAdapter {
  constructor(
    private createTask: CreateTaskUseCase,
    private listTasks: ListTasksUseCase
  ) { }

  handlePostTask(reqBody: any): { statusCode: number; body: any } {
    console.log("  🌐 [Express] POST /api/tasks");
    const result = this.createTask.execute(reqBody);
    return {
      statusCode: result.success ? 201 : 400,
      body: result,
    };
  }

  handleGetTasks(): { statusCode: number; body: any } {
    console.log("  🌐 [Express] GET /api/tasks");
    return { statusCode: 200, body: this.listTasks.execute() };
  }
}

// ✅ Adaptador Web 2: "Lambda" (simulado) - SIN cambiar la lógica
class LambdaAdapter {
  constructor(
    private createTask: CreateTaskUseCase,
    private listTasks: ListTasksUseCase
  ) { }

  handler(event: { httpMethod: string; body: string }): {
    statusCode: number;
    body: string;
  } {
    console.log(`  ⚡ [Lambda] ${event.httpMethod} invocado`);

    if (event.httpMethod === "POST") {
      const result = this.createTask.execute(JSON.parse(event.body));
      return {
        statusCode: result.success ? 201 : 400,
        body: JSON.stringify(result),
      };
    }

    const result = this.listTasks.execute();
    return { statusCode: 200, body: JSON.stringify(result) };
  }
}

// ✅ Adaptador 3: CLI - completamente diferente, MISMA lógica
class CLIAdapter {
  constructor(
    private createTask: CreateTaskUseCase,
    private listTasks: ListTasksUseCase
  ) { }

  runCreate(title: string, description: string, priority: string): void {
    console.log(`  💻 [CLI] task create "${title}" --priority=${priority}`);
    const result = this.createTask.execute({ title, description, priority });
    if (result.success) {
      console.log(`    ✅ Tarea creada: ${result.task!.id}`);
    } else {
      console.log(`    ❌ Error: ${result.error}`);
    }
  }

  runList(): void {
    console.log("  💻 [CLI] task list");
    const result = this.listTasks.execute();
    result.tasks.forEach((t) => {
      console.log(`    📌 [${t.priority.toUpperCase()}] ${t.title} (${t.status})`);
    });
    console.log(`    Total: ${result.total} tareas`);
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO - Frameworks/Web/BD son DETALLES");
  console.log("=".repeat(55));

  // ───────────────────────────────────────────────────────
  // ESCENARIO 1: Express + InMemory
  // ───────────────────────────────────────────────────────
  console.log("\n🏭 ESCENARIO 1: Express + InMemory BD");
  console.log("-".repeat(45));
  const memRepo = new InMemoryTaskRepository();
  const createTask1 = new CreateTaskUseCase(memRepo);
  const listTasks1 = new ListTasksUseCase(memRepo);
  const express = new ExpressAdapter(createTask1, listTasks1);

  express.handlePostTask({
    title: "Diseñar API",
    description: "Endpoints REST",
    priority: "high",
  });
  express.handlePostTask({
    title: "Code review",
    description: "PR #42",
    priority: "medium",
  });
  const expressResult = express.handleGetTasks();
  console.log(`  📊 Total tareas (Express): ${expressResult.body.total}`);

  // ───────────────────────────────────────────────────────
  // ESCENARIO 2: Lambda + DynamoDB (MISMA lógica, diferente infra)
  // ───────────────────────────────────────────────────────
  console.log("\n\n⚡ ESCENARIO 2: Lambda + DynamoDB");
  console.log("-".repeat(45));
  const dynamoRepo = new DynamoDBTaskRepository();
  const createTask2 = new CreateTaskUseCase(dynamoRepo);
  const listTasks2 = new ListTasksUseCase(dynamoRepo);
  const lambda = new LambdaAdapter(createTask2, listTasks2);

  lambda.handler({
    httpMethod: "POST",
    body: JSON.stringify({
      title: "Deploy a staging",
      description: "Verificar CI/CD",
      priority: "high",
    }),
  });
  const lambdaResult = lambda.handler({ httpMethod: "GET", body: "" });
  console.log(`  📊 Total tareas (Lambda): ${JSON.parse(lambdaResult.body).total}`);

  // ───────────────────────────────────────────────────────
  // ESCENARIO 3: CLI + InMemory (MISMA lógica, interfaz de texto)
  // ───────────────────────────────────────────────────────
  console.log("\n\n💻 ESCENARIO 3: CLI + InMemory BD");
  console.log("-".repeat(45));
  const cliRepo = new InMemoryTaskRepository();
  const createTask3 = new CreateTaskUseCase(cliRepo);
  const listTasks3 = new ListTasksUseCase(cliRepo);
  const cli = new CLIAdapter(createTask3, listTasks3);

  cli.runCreate("Escribir docs", "README del proyecto", "low");
  cli.runCreate("Fix bug #99", "Error en login", "high");
  cli.runList();

  console.log("\n\n🎯 DEMOSTRACIÓN:");
  console.log("  ✅ MISMA lógica ejecutada con Express, Lambda Y CLI");
  console.log("  ✅ MISMA lógica con InMemory Y DynamoDB");
  console.log("  ✅ CreateTaskUseCase/ListTasksUseCase NO cambiaron NUNCA");
  console.log("  ✅ La entidad Task NO sabe que Express/Lambda/DynamoDB existen");
  console.log("\n  📖 Cap.30: BD es un detalle → Repository Pattern");
  console.log("  📖 Cap.31: Web es un detalle → Express/Lambda son adaptadores");
  console.log("  📖 Cap.32: Framework es un detalle → la lógica es el CORE");
}

main();
