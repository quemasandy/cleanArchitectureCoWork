// ============================================================================
// ❌ MAL EJEMPLO: Violación del Principio de Responsabilidad Única (SRP)
// ============================================================================
// 📖 PRINCIPIO: "Una clase debe tener UNA y solo UNA razón para cambiar"
//    - Robert C. Martin, Clean Architecture Cap. 7
//
// 🚨 PROBLEMA: La clase Employee tiene TRES razones para cambiar:
//    1. Si cambian las reglas de cálculo de salario
//    2. Si cambia el formato del reporte
//    3. Si cambia la base de datos donde guardamos
//
// Esto significa que 3 equipos diferentes podrían necesitar modificar
// esta misma clase, causando conflictos y bugs inesperados.
// ============================================================================

// ❌ Esta clase hace DEMASIADAS cosas
// Cada método pertenece a un "actor" diferente (CFO, CTO, DBA)
class Employee {
  constructor(
    // Datos del empleado
    public name: string,
    public position: string,
    public baseSalary: number,
    public hoursWorked: number,
    public department: string
  ) { }

  // ❌ RESPONSABILIDAD 1: Cálculo de salario (le importa al CFO / Finanzas)
  // Si el CFO cambia la fórmula de horas extra, tocamos ESTA clase
  calculatePay(): number {
    // Calculamos horas extra (más de 40 horas)
    const overtimeHours = Math.max(0, this.hoursWorked - 40);
    // Las horas regulares son máximo 40
    const regularHours = Math.min(this.hoursWorked, 40);
    // Tarifa por hora = salario base / 160 (horas mensuales estándar)
    const hourlyRate = this.baseSalary / 160;
    // Las horas extra se pagan al 150%
    const overtimeRate = hourlyRate * 1.5;

    // Retornamos el salario total
    return regularHours * hourlyRate + overtimeHours * overtimeRate;
  }

  // ❌ RESPONSABILIDAD 2: Generar reportes (le importa al CTO / Operaciones)
  // Si el CTO quiere un formato diferente, tocamos ESTA misma clase
  generateReport(): string {
    // Generamos un reporte con formato específico
    const pay = this.calculatePay();
    // 🚨 NOTA: generateReport() usa calculatePay() internamente
    // Si Finanzas cambia calculatePay(), el reporte de Operaciones se rompe
    // sin que nadie se dé cuenta - ¡bug silencioso!
    return `
    ========== REPORTE DE EMPLEADO ==========
    Nombre:      ${this.name}
    Posición:    ${this.position}
    Departamento:${this.department}
    Horas:       ${this.hoursWorked}
    Salario:     $${pay.toFixed(2)}
    ==========================================
    `;
  }

  // ❌ RESPONSABILIDAD 3: Guardar en base de datos (le importa al DBA)
  // Si el DBA cambia de PostgreSQL a MongoDB, tocamos ESTA misma clase
  saveToDatabase(): void {
    // Simulamos guardar en base de datos
    const data = {
      name: this.name,
      position: this.position,
      salary: this.calculatePay(),
      department: this.department,
      // 🚨 Detalles de implementación de BD dentro de la clase de negocio
      savedAt: new Date().toISOString(),
      table: "employees",
    };

    // Simulación de INSERT en base de datos
    console.log(`💾 INSERT INTO employees VALUES (${JSON.stringify(data)})`);
  }
}

// ============================================================================
// 🏃 EJECUCIÓN: Observa cómo UNA sola clase hace TODO
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO - Violación de SRP");
  console.log("=".repeat(50));

  // Creamos un empleado
  const employee = new Employee("Carlos García", "Backend Developer", 5000, 45, "Engineering");

  // 🚨 La misma clase calcula salario, genera reportes Y guarda en BD
  // Tres responsabilidades = Tres razones para cambiar = Violación de SRP
  console.log("\n📊 Calculando salario...");
  console.log(`Salario total: $${employee.calculatePay().toFixed(2)}`);

  console.log("\n📋 Generando reporte...");
  console.log(employee.generateReport());

  console.log("\n💾 Guardando en base de datos...");
  employee.saveToDatabase();

  // 🚨 PROBLEMA REAL: Imagina que 3 desarrolladores de 3 equipos diferentes
  // necesitan modificar esta clase al mismo tiempo:
  // - Dev de Finanzas cambia calculatePay()
  // - Dev de Operaciones cambia generateReport()
  // - DBA cambia saveToDatabase()
  // = CONFLICTOS DE MERGE y bugs que afectan a los otros equipos
  console.log("\n⚠️  PROBLEMA: Si cambias calculatePay(), afectas generateReport()");
  console.log("⚠️  PROBLEMA: 3 equipos diferentes modifican la misma clase");
  console.log("⚠️  PROBLEMA: Un cambio en DB puede romper el cálculo de salario");
}

// Ejecutamos el ejemplo
main();
