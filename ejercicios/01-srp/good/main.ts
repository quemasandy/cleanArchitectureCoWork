// ============================================================================
// ✅ BUEN EJEMPLO: Aplicación del Principio de Responsabilidad Única (SRP)
// ============================================================================
// 📖 PRINCIPIO: "Una clase debe tener UNA y solo UNA razón para cambiar"
//    - Robert C. Martin, Clean Architecture Cap. 7
//
// ✅ SOLUCIÓN: Separamos las 3 responsabilidades en 3 clases distintas:
//    1. PayCalculator      → Solo calcula salarios (actor: CFO)
//    2. EmployeeReporter   → Solo genera reportes (actor: CTO)
//    3. EmployeeRepository → Solo maneja persistencia (actor: DBA)
//
// Ahora cada clase tiene UNA sola razón para cambiar.
// Los equipos pueden trabajar en paralelo sin conflictos.
// ============================================================================

// ✅ Clase de datos pura - solo contiene la información del empleado
// No tiene comportamiento, es una "estructura de datos" limpia
class Employee {
  constructor(
    public readonly name: string,
    public readonly position: string,
    public readonly baseSalary: number,
    public readonly hoursWorked: number,
    public readonly department: string
  ) { }
}

// ============================================================================
// ✅ RESPONSABILIDAD 1: Cálculo de salarios
// Actor: CFO / Equipo de Finanzas
// Razón para cambiar: Solo si cambian las reglas de cálculo de salario
// ============================================================================
class PayCalculator {
  // Constantes de negocio claramente definidas
  private static readonly STANDARD_MONTHLY_HOURS = 160;
  private static readonly REGULAR_HOURS_PER_WEEK = 40;
  private static readonly OVERTIME_MULTIPLIER = 1.5;

  // ✅ Un solo método con una sola responsabilidad
  calculatePay(employee: Employee): number {
    // Calculamos las horas extra (todo lo que exceda 40 horas semanales)
    const overtimeHours = Math.max(
      0,
      employee.hoursWorked - PayCalculator.REGULAR_HOURS_PER_WEEK
    );
    // Las horas regulares se limitan a 40
    const regularHours = Math.min(
      employee.hoursWorked,
      PayCalculator.REGULAR_HOURS_PER_WEEK
    );
    // Calculamos tarifa por hora basada en el salario mensual
    const hourlyRate =
      employee.baseSalary / PayCalculator.STANDARD_MONTHLY_HOURS;
    // Las horas extra se pagan al 150%
    const overtimeRate = hourlyRate * PayCalculator.OVERTIME_MULTIPLIER;

    // Retornamos el total calculado
    return regularHours * hourlyRate + overtimeHours * overtimeRate;
  }
}

// ============================================================================
// ✅ RESPONSABILIDAD 2: Generación de reportes
// Actor: CTO / Equipo de Operaciones
// Razón para cambiar: Solo si cambia el formato del reporte
// ============================================================================
class EmployeeReporter {
  // ✅ Recibe el PayCalculator como dependencia (no lo crea internamente)
  constructor(private payCalculator: PayCalculator) { }

  // ✅ Un solo método enfocado en formatear el reporte
  generateReport(employee: Employee): string {
    // Usamos el PayCalculator inyectado para obtener el salario
    const pay = this.payCalculator.calculatePay(employee);

    // Solo nos preocupamos por el FORMATO, no por el CÁLCULO
    return `
    ========== REPORTE DE EMPLEADO ==========
    Nombre:       ${employee.name}
    Posición:     ${employee.position}
    Departamento: ${employee.department}
    Horas:        ${employee.hoursWorked}
    Salario:      $${pay.toFixed(2)}
    ==========================================
    `;
  }
}

// ============================================================================
// ✅ RESPONSABILIDAD 3: Persistencia de datos
// Actor: DBA / Equipo de Infraestructura
// Razón para cambiar: Solo si cambia la base de datos o su esquema
// ============================================================================
class EmployeeRepository {
  // ✅ Solo se encarga de guardar, nada más
  save(employee: Employee): void {
    // Preparamos los datos para la BD
    const record = {
      name: employee.name,
      position: employee.position,
      baseSalary: employee.baseSalary,
      department: employee.department,
      savedAt: new Date().toISOString(),
    };

    // Simulación de INSERT en base de datos
    console.log(
      `💾 INSERT INTO employees VALUES (${JSON.stringify(record)})`
    );
  }
}

// ============================================================================
// 🏃 EJECUCIÓN: Observa cómo cada clase tiene UNA sola responsabilidad
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO - Aplicación de SRP");
  console.log("=".repeat(50));

  // Creamos el empleado (solo datos, sin comportamiento)
  const employee = new Employee(
    "Carlos García",
    "Backend Developer",
    5000,
    45,
    "Engineering"
  );

  // ✅ Cada servicio tiene una sola responsabilidad
  const payCalculator = new PayCalculator();
  const reporter = new EmployeeReporter(payCalculator);
  const repository = new EmployeeRepository();

  // Usamos cada servicio de forma independiente
  console.log("\n📊 Calculando salario (PayCalculator)...");
  const salary = payCalculator.calculatePay(employee);
  console.log(`Salario total: $${salary.toFixed(2)}`);

  console.log("\n📋 Generando reporte (EmployeeReporter)...");
  console.log(reporter.generateReport(employee));

  console.log("\n💾 Guardando en BD (EmployeeRepository)...");
  repository.save(employee);

  // ✅ BENEFICIOS:
  console.log("\n🎯 BENEFICIOS DE SRP:");
  console.log("  ✅ Si Finanzas cambia el cálculo → solo toca PayCalculator");
  console.log("  ✅ Si Operaciones cambia el reporte → solo toca EmployeeReporter");
  console.log("  ✅ Si el DBA cambia la BD → solo toca EmployeeRepository");
  console.log("  ✅ Cada equipo trabaja en su clase sin conflictos de merge");
  console.log("  ✅ Los tests son más simples y enfocados");
}

// Ejecutamos el ejemplo
main();
