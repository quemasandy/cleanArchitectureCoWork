// ============================================================================
// ❌ MAL EJEMPLO: Frameworks, Web y BD tratados como "EL" sistema
// ============================================================================
// 📖 PRINCIPIOS (Clean Architecture Cap. 30, 31, 32):
//    - Cap. 30: "La Base de Datos es un Detalle"
//    - Cap. 31: "El Web es un Detalle"
//    - Cap. 32: "Los Frameworks son Detalles, no formas de vida"
//
// 🚨 PROBLEMA: La lógica de negocio está CASADA con Express y una BD
//    específica. Si cambias Express por Fastify, reescribes TODO.
//    Si cambias de PostgreSQL a MongoDB, reescribes TODO.
//
//    Los frameworks deben ser "plugins" intercambiables, no la base
//    sobre la cual construyes todo.
// ============================================================================

// ❌ Simulamos Express como si fuera "EL" sistema
// La lógica de negocio está DENTRO del framework
interface ExpressRequest {
  body: any;
  params: { id?: string };
  headers: { authorization?: string };
}

interface ExpressResponse {
  status: (code: number) => ExpressResponse;
  json: (data: any) => void;
}

// ❌ "Base de datos" simulada - acoplada directamente a la lógica
const database: Map<string, any> = new Map();

// ❌ Todo está en el route handler de Express
// Framework + Lógica + BD + Validación + Autenticación TODO junto
function expressPostTask(req: ExpressRequest, res: ExpressResponse): void {
  console.log("  🔄 Express route handler ejecutándose...\n");

  // ❌ AUTENTICACIÓN dentro del handler de Express
  // Si cambias a Lambda/API Gateway, copias/pegas este código
  const token = req.headers.authorization;
  if (!token || token !== "Bearer valid-token") {
    res.status(401).json({ error: "No autorizado" });
    console.log("  ❌ 401 No autorizado");
    return;
  }

  // ❌ VALIDACIÓN dentro del handler de Express
  const { title, description, priority } = req.body;
  if (!title || title.length < 3) {
    res.status(400).json({ error: "Título muy corto" });
    console.log("  ❌ 400 Título muy corto");
    return;
  }

  // ❌ LÓGICA DE NEGOCIO dentro del handler de Express
  // Regla: solo se permiten prioridades 'low', 'medium', 'high'
  const validPriorities = ["low", "medium", "high"];
  const taskPriority = validPriorities.includes(priority) ? priority : "medium";

  // ❌ Cálculo de fecha de vencimiento - regla de negocio en el handler
  const daysMap: Record<string, number> = { low: 14, medium: 7, high: 3 };
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + daysMap[taskPriority]);

  // ❌ ACCESO A BD directo dentro del handler de Express
  // Formato de datos específico hardcodeado
  const taskId = `TASK-${Date.now()}`;
  const task = {
    id: taskId,
    title,
    description: description || "",
    priority: taskPriority,
    dueDate: dueDate.toISOString(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  // ❌ Escritura directa a "BD" - acoplamiento total
  database.set(taskId, task);
  console.log(`  💾 Guardando directamente en BD: ${taskId}`);

  // ❌ RESPUESTA HTTP formateada dentro de la lógica
  const response = {
    success: true,
    data: task,
    _links: {
      self: `/api/tasks/${taskId}`,
      update: `/api/tasks/${taskId}`,
      delete: `/api/tasks/${taskId}`,
    },
  };

  res.status(201).json(response);
  console.log(`  ✅ 201 Created: ${JSON.stringify(response, null, 2)}`);
}

// ❌ expressGetTasks - otro handler con la misma mezcla
function expressGetTasks(req: ExpressRequest, res: ExpressResponse): void {
  // ❌ Autenticación REPETIDA (copy-paste del otro handler)
  const token = req.headers.authorization;
  if (!token || token !== "Bearer valid-token") {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  // ❌ Query directa a BD
  const tasks = Array.from(database.values());
  res.status(200).json({ data: tasks, total: tasks.length });
  console.log(`  📋 Retornando ${tasks.length} tareas`);
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO - Frameworks/Web/BD como 'EL' sistema");
  console.log("=".repeat(55));

  // Simulamos Express request/response
  const mockRes: ExpressResponse = {
    status(code: number) {
      return this;
    },
    json(data: any) {
      /* no-op para simulación */
    },
  };

  console.log("\n📝 Creando tarea (via Express handler):");
  expressPostTask(
    {
      body: { title: "Implementar login", description: "OAuth2", priority: "high" },
      params: {},
      headers: { authorization: "Bearer valid-token" },
    },
    mockRes
  );

  console.log("\n📋 Listando tareas (via Express handler):");
  expressGetTasks(
    { body: {}, params: {}, headers: { authorization: "Bearer valid-token" } },
    mockRes
  );

  console.log("\n⚠️  PROBLEMAS:");
  console.log('  ❌ Si cambias Express → Fastify: REESCRIBES todos los handlers');
  console.log("  ❌ Si cambias la BD: REESCRIBES toda la lógica");
  console.log("  ❌ La autenticación está COPY-PASTED en cada handler");
  console.log("  ❌ No puedes usar la lógica desde un CLI o un test");
  console.log("  ❌ El framework ES el sistema, no un detalle reemplazable");
  console.log("  ❌ Cap.32: 'Los frameworks son herramientas, no formas de vida'");
}

main();
