// ============================================================================
// ✅ SOLUCIÓN: Entidades RICAS - con reglas de negocio encapsuladas
// ============================================================================
// 📖 LECCIÓN (Clean Architecture - Capítulo 20):
//
//    Una ENTITY es un objeto que encapsula las reglas de negocio más
//    críticas de la empresa. NO es solo un contenedor de datos.
//
//    Características de una Entity CORRECTA:
//
//    1️⃣ PROTEGE SUS INVARIANTES:
//       → No permite estados inválidos (edad negativa, peso cero)
//       → Valida en el constructor (si los datos son malos, explota AQUÍ)
//
//    2️⃣ ENCAPSULA REGLAS DE NEGOCIO:
//       → Sabe calcular cosas sobre sí misma (IMC, dosis, compatibilidad)
//       → Las reglas viajan CON la entidad, no están en un "servicio" externo
//
//    3️⃣ ES INMUTABLE (o controla sus mutaciones):
//       → Los campos son readonly cuando no deben cambiar
//       → Solo expone métodos que mantienen la consistencia
//
//    4️⃣ NO CONOCE EL EXTERIOR:
//       → No sabe de BD, HTTP, ni frameworks
//       → Es pura lógica de dominio
//
//    💡 PREGUNTA CLAVE: "¿Un médico haría esto con papel y lápiz?"
//       → SÍ → Pertenece a la Entity
//       → NO → Pertenece al Use Case o al Adapter
// ============================================================================

// ============================================================================
// 🟢 ENTITY: Patient - Paciente con reglas de negocio encapsuladas
// ============================================================================
// Un médico conoce estas reglas sobre sus pacientes.
// La Entity PROTEGE que un paciente nunca esté en un estado imposible.
// ============================================================================
class Patient {
  // ✅ Campos readonly - nadie puede modificarlos directamente desde afuera
  public readonly name: string;          // Nombre del paciente (inmutable)
  public readonly age: number;           // Edad del paciente (inmutable)
  public readonly bloodType: string;     // Tipo de sangre (inmutable)
  public readonly allergies: string[];   // Alergias conocidas (copia defensiva)
  public readonly weight: number;        // Peso en kilogramos (inmutable)
  public readonly height: number;        // Altura en metros (inmutable)

  // Tipos de sangre válidos según la medicina
  private static readonly VALID_BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // ✅ Constructor que PROTEGE las invariantes del paciente
  // Si los datos son inválidos, la Entity se NIEGA a existir
  constructor(name: string, age: number, bloodType: string, allergies: string[], weight: number, height: number) {
    // ✅ Regla de negocio: el nombre no puede estar vacío
    // Un médico nunca registraría un paciente sin nombre
    if (!name || name.trim().length === 0) {
      throw new Error("El nombre del paciente es obligatorio");
    }
    this.name = name.trim(); // Limpiamos espacios y asignamos

    // ✅ Regla de negocio: la edad debe ser un valor realista
    // Un médico rechazaría una ficha con edad negativa o > 150 años
    if (age < 0 || age > 150) {
      throw new Error(`Edad inválida: ${age}. Debe estar entre 0 y 150 años`);
    }
    this.age = age; // Edad validada

    // ✅ Regla de negocio: tipo de sangre debe ser médicamente válido
    // Solo existen 8 tipos de sangre en la clasificación ABO/Rh
    if (!Patient.VALID_BLOOD_TYPES.includes(bloodType)) {
      throw new Error(`Tipo de sangre inválido: ${bloodType}. Válidos: ${Patient.VALID_BLOOD_TYPES.join(", ")}`);
    }
    this.bloodType = bloodType; // Tipo de sangre validado

    // ✅ Copia defensiva del array de alergias
    // Evitamos que alguien modifique el array original desde afuera
    this.allergies = [...allergies]; // Creamos una copia independiente

    // ✅ Regla de negocio: el peso debe ser positivo y realista
    // Un bebé pesa al menos ~0.5kg, un adulto no supera ~600kg
    if (weight <= 0 || weight > 600) {
      throw new Error(`Peso inválido: ${weight}kg. Debe ser entre 0.1 y 600kg`);
    }
    this.weight = weight; // Peso validado

    // ✅ Regla de negocio: la altura debe ser positiva y realista
    // Un recién nacido mide ~0.3m, la persona más alta registrada: 2.72m
    if (height <= 0 || height > 3) {
      throw new Error(`Altura inválida: ${height}m. Debe ser entre 0.1 y 3m`);
    }
    this.height = height; // Altura validada
  }

  // ✅ Regla de negocio: cálculo del Índice de Masa Corporal (IMC)
  // Un médico calcula esto con papel: peso / (altura²)
  // La Entity SABE calcular sus propias métricas
  calculateBMI(): number {
    return this.weight / (this.height * this.height); // Fórmula estándar del IMC
  }

  // ✅ Regla de negocio: clasificación del IMC según la OMS
  // El médico mira una tabla y clasifica al paciente
  getBMICategory(): string {
    const bmi = this.calculateBMI(); // Calculamos el IMC primero
    if (bmi < 18.5) return "Bajo peso";    // IMC < 18.5
    if (bmi < 25) return "Peso normal";    // 18.5 <= IMC < 25
    if (bmi < 30) return "Sobrepeso";      // 25 <= IMC < 30
    return "Obesidad";                      // IMC >= 30
  }

  // ✅ Regla de negocio: ¿el paciente es pediátrico?
  // En medicina, menores de 12 años requieren dosis especiales
  isPediatric(): boolean {
    return this.age < 12; // Menor de 12 años = pediátrico
  }

  // ✅ Regla de negocio: ¿el paciente es geriátrico?
  // Pacientes mayores de 65 también requieren ajustes de dosis
  isGeriatric(): boolean {
    return this.age >= 65; // 65 años o más = geriátrico
  }

  // ✅ Regla de negocio: ¿el paciente es alérgico a algo específico?
  // El médico revisa la ficha del paciente para verificar alergias
  isAllergicTo(substance: string): boolean {
    // Comparamos en minúsculas para evitar errores de formato
    return this.allergies.some(
      (allergy) => allergy.toLowerCase() === substance.toLowerCase()
    );
  }

  // ✅ Regla de negocio: factor de ajuste de dosis según peso
  // Los médicos ajustan medicamentos según el peso del paciente
  getDoseAdjustmentFactor(): number {
    if (this.weight < 50) return 0.75;  // Bajo peso: reducir 25%
    if (this.weight > 100) return 1.25; // Alto peso: aumentar 25%
    return 1.0;                          // Peso normal: sin ajuste
  }
}

// ============================================================================
// 🟢 ENTITY: Medication - Medicamento con reglas de negocio encapsuladas
// ============================================================================
// Un farmacéutico conoce estas reglas sobre los medicamentos.
// El medicamento SABE si es seguro para un paciente determinado.
// ============================================================================
class Medication {
  // ✅ Campos readonly - los datos del medicamento no cambian
  public readonly name: string;                   // Nombre del medicamento
  public readonly standardDoseMg: number;         // Dosis estándar en mg
  public readonly frequency: string;              // Frecuencia de administración
  public readonly contraindications: string[];    // Sustancias contraindicadas
  public readonly maxDoseMultiplier: number;      // Multiplicador máximo de dosis
  public readonly pediatricDoseMultiplier: number; // Multiplicador para niños

  // ✅ Constructor que valida los datos del medicamento
  constructor(
    name: string,                           // Nombre del medicamento
    standardDoseMg: number,                 // Dosis estándar
    frequency: string,                      // Frecuencia
    contraindications: string[],            // Lista de contraindicaciones
    maxDoseMultiplier: number = 2.0,        // Por defecto, máximo 2x la dosis
    pediatricDoseMultiplier: number = 0.5   // Por defecto, mitad para niños
  ) {
    // ✅ Regla de negocio: nombre obligatorio
    if (!name || name.trim().length === 0) {
      throw new Error("El nombre del medicamento es obligatorio");
    }
    this.name = name.trim(); // Limpiamos y asignamos

    // ✅ Regla de negocio: la dosis debe ser positiva
    // Un medicamento con dosis 0 no tiene sentido médico
    if (standardDoseMg <= 0) {
      throw new Error(`Dosis inválida: ${standardDoseMg}mg. Debe ser positiva`);
    }
    this.standardDoseMg = standardDoseMg; // Dosis validada

    // ✅ Regla de negocio: frecuencia obligatoria
    if (!frequency || frequency.trim().length === 0) {
      throw new Error("La frecuencia de administración es obligatoria");
    }
    this.frequency = frequency.trim(); // Frecuencia validada

    // ✅ Copia defensiva de contraindicaciones
    this.contraindications = [...contraindications]; // Copia independiente

    this.maxDoseMultiplier = maxDoseMultiplier;           // Multiplicador máximo
    this.pediatricDoseMultiplier = pediatricDoseMultiplier; // Multiplicador pediátrico
  }

  // ✅ Regla de negocio: ¿este medicamento es seguro para un paciente?
  // Un farmacéutico verifica las contraindicaciones contra las alergias
  isSafeForPatient(patient: Patient): { safe: boolean; reason?: string } {
    // Verificamos cada contraindicación contra las alergias del paciente
    for (const contraindication of this.contraindications) {
      if (patient.isAllergicTo(contraindication)) {  // Usamos el método de Patient
        return {
          safe: false, // No es seguro
          reason: `Paciente alérgico a ${contraindication}, medicamento contraindicado`,
        };
      }
    }
    return { safe: true }; // Ninguna alergia coincide, es seguro
  }

  // ✅ Regla de negocio: calcular dosis ajustada para un paciente
  // El médico ajusta la dosis según peso, edad y condiciones del paciente
  calculateAdjustedDose(patient: Patient, requestedDoseMg: number): {
    adjustedDose: number;   // Dosis final ajustada
    adjustments: string[];  // Lista de ajustes aplicados
  } {
    let dose = requestedDoseMg;           // Partimos de la dosis solicitada
    const adjustments: string[] = [];     // Registramos cada ajuste

    // ✅ Regla de negocio: ajuste por peso corporal
    // Pacientes más livianos o pesados necesitan dosis diferentes
    const weightFactor = patient.getDoseAdjustmentFactor(); // Factor del paciente
    if (weightFactor !== 1.0) {                              // Si hay ajuste
      dose = dose * weightFactor;                            // Aplicamos el factor
      const direction = weightFactor < 1 ? "reducida" : "aumentada"; // Dirección
      const percentage = Math.abs((weightFactor - 1) * 100);         // Porcentaje
      adjustments.push(`Dosis ${direction} ${percentage}% por peso (${patient.weight}kg)`);
    }

    // ✅ Regla de negocio: límite para pacientes pediátricos
    // Los niños no deben recibir más de la mitad de la dosis estándar
    if (patient.isPediatric()) {                                        // Si es niño
      const maxPediatricDose = this.standardDoseMg * this.pediatricDoseMultiplier; // Máximo pediátrico
      if (dose > maxPediatricDose) {                                    // Si excede
        dose = maxPediatricDose;                                        // Limitamos
        adjustments.push(`Dosis limitada a ${dose}mg (paciente pediátrico)`);
      }
    }

    // ✅ Regla de negocio: no exceder la dosis máxima absoluta
    // Nunca se puede dar más del doble de la dosis estándar
    const absoluteMax = this.standardDoseMg * this.maxDoseMultiplier; // Máximo absoluto
    if (dose > absoluteMax) {                                          // Si excede
      dose = absoluteMax;                                              // Limitamos
      adjustments.push(`Dosis limitada a ${absoluteMax}mg (máximo absoluto)`);
    }

    return { adjustedDose: dose, adjustments }; // Retornamos dosis y ajustes
  }
}

// ============================================================================
// 🟢 ENTITY: Prescription - Prescripción que se valida al crearse
// ============================================================================
// Una prescripción conecta un paciente con un medicamento.
// La Entity VERIFICA que la prescripción sea segura ANTES de existir.
// ============================================================================
class Prescription {
  // ✅ Campos readonly - la prescripción es inmutable una vez creada
  public readonly patient: Patient;          // Referencia al paciente (no string)
  public readonly medication: Medication;    // Referencia al medicamento (no string)
  public readonly dosageMg: number;          // Dosis final prescrita
  public readonly adjustments: string[];     // Ajustes aplicados a la dosis
  public readonly prescribedAt: Date;        // Fecha de prescripción

  // ✅ Constructor que VERIFICA seguridad antes de crear la prescripción
  // Si el medicamento es peligroso para el paciente, se niega a crearse
  constructor(patient: Patient, medication: Medication, requestedDoseMg: number) {
    // ✅ Regla de negocio: verificar seguridad del medicamento
    // Un médico SIEMPRE verifica alergias antes de prescribir
    const safetyCheck = medication.isSafeForPatient(patient); // Consultamos al medicamento
    if (!safetyCheck.safe) {                                   // Si no es seguro
      throw new Error(`Prescripción rechazada: ${safetyCheck.reason}`); // ¡NO se crea!
    }

    // ✅ Regla de negocio: calcular dosis ajustada
    // El medicamento sabe cómo ajustar su propia dosis para este paciente
    const { adjustedDose, adjustments } = medication.calculateAdjustedDose(
      patient,          // El paciente
      requestedDoseMg   // La dosis solicitada por el médico
    );

    // Asignamos los valores validados y ajustados
    this.patient = patient;             // Referencia al objeto Patient
    this.medication = medication;       // Referencia al objeto Medication
    this.dosageMg = adjustedDose;       // Dosis final (ya ajustada)
    this.adjustments = adjustments;     // Lista de ajustes realizados
    this.prescribedAt = new Date();     // Momento de la prescripción
  }

  // ✅ Regla de negocio: generar resumen de la prescripción
  // El médico necesita ver un resumen claro de lo prescrito
  getSummary(): string {
    let summary = `${this.medication.name} ${this.dosageMg}mg - ${this.medication.frequency}`;
    if (this.adjustments.length > 0) {               // Si hubo ajustes
      summary += ` (Ajustes: ${this.adjustments.join("; ")})`; // Los incluimos
    }
    return summary; // Retornamos el resumen completo
  }
}

// ============================================================================
// 🏃 EJECUCIÓN - Demostración de entidades RICAS
// ============================================================================
function main(): void {
  console.log("✅ SOLUCIÓN - Entidades Ricas (con reglas de negocio)");
  console.log("=".repeat(55));

  // ✅ Creamos un paciente pediátrico (la Entity valida todo al construir)
  const patient = new Patient(
    "María Torres",           // Nombre válido
    8,                        // 8 años - paciente pediátrico
    "O+",                     // Tipo de sangre válido
    ["Penicilina", "Sulfa"],  // Alergias conocidas
    30,                       // 30 kg (bajo peso)
    1.20                      // 1.20 metros
  );

  // ✅ La Entity SABE calcular sus propias métricas
  console.log("\n📊 Datos del paciente (calculados por la ENTITY):");
  console.log("-".repeat(45));
  console.log(`  👤 Nombre: ${patient.name}`);                          // Nombre
  console.log(`  🎂 Edad: ${patient.age} años (Pediátrico: ${patient.isPediatric()})`);  // Edad + clasificación
  console.log(`  ⚖️  IMC: ${patient.calculateBMI().toFixed(1)} (${patient.getBMICategory()})`); // IMC + categoría
  console.log(`  🩸 Sangre: ${patient.bloodType}`);                     // Tipo de sangre
  console.log(`  ⚠️  Alergias: ${patient.allergies.join(", ")}`);       // Alergias
  console.log(`  💊 Factor dosis: ${patient.getDoseAdjustmentFactor()}`); // Factor de ajuste

  // Creamos un medicamento contraindicado
  const amoxicilina = new Medication(
    "Amoxicilina",                    // Nombre del antibiótico
    500,                              // Dosis estándar: 500mg
    "Cada 8 horas",                   // Frecuencia de administración
    ["Penicilina", "Cefalosporinas"]  // Sustancias contraindicadas
  );

  // ============================================================================
  // CASO 1: Medicamento contraindicado - ¡la Entity se protege!
  // ============================================================================
  console.log("\n\n📋 CASO 1: Prescribir medicamento contraindicado");
  console.log("-".repeat(45));

  // ✅ El Medication SABE si es seguro para este paciente
  const safetyCheck = amoxicilina.isSafeForPatient(patient); // Preguntamos al medicamento
  console.log(`  🔍 ¿${amoxicilina.name} seguro para ${patient.name}? ${safetyCheck.safe ? "SÍ" : "NO"}`);
  if (!safetyCheck.safe) {
    console.log(`  ⚠️  Razón: ${safetyCheck.reason}`); // Explicamos por qué no
  }

  // ✅ Intentar crear la prescripción FALLA (la Entity se protege)
  try {
    new Prescription(patient, amoxicilina, 250); // Intentamos prescribir
  } catch (error: any) {
    console.log(`  ❌ Error: ${error.message}`); // La Entity rechazó la prescripción
  }

  // ============================================================================
  // CASO 2: Medicamento seguro con ajuste de dosis automático
  // ============================================================================
  const ibuprofeno = new Medication(
    "Ibuprofeno",        // Antiinflamatorio
    400,                 // Dosis estándar: 400mg
    "Cada 6 horas",      // Frecuencia
    ["Aspirina"]         // Contraindicación (no aplica a María)
  );

  console.log("\n\n📋 CASO 2: Medicamento seguro (ajuste automático)");
  console.log("-".repeat(45));

  // ✅ Verificamos seguridad - el Medication sabe la respuesta
  const safetyCheck2 = ibuprofeno.isSafeForPatient(patient);
  console.log(`  🔍 ¿${ibuprofeno.name} seguro para ${patient.name}? ${safetyCheck2.safe ? "SÍ" : "NO"}`);

  // ✅ Creamos la prescripción - se ajusta la dosis automáticamente
  const prescription = new Prescription(patient, ibuprofeno, 400); // La Entity ajusta internamente
  console.log(`  ✅ Prescripción creada: ${prescription.getSummary()}`); // Resumen con ajustes
  console.log(`  💊 Dosis original: 400mg → Dosis ajustada: ${prescription.dosageMg}mg`);
  if (prescription.adjustments.length > 0) {
    console.log("  📝 Ajustes aplicados:");
    for (const adj of prescription.adjustments) {
      console.log(`     • ${adj}`); // Cada ajuste aplicado
    }
  }

  // ============================================================================
  // CASO 3: Intentar crear un paciente con datos inválidos
  // ============================================================================
  console.log("\n\n📋 CASO 3: La Entity se NIEGA a existir con datos inválidos");
  console.log("-".repeat(45));

  // ✅ Intentar edad negativa
  try {
    new Patient("Test", -5, "O+", [], 70, 1.70); // Edad inválida
  } catch (error: any) {
    console.log(`  ❌ Edad -5: ${error.message}`); // La Entity rechaza
  }

  // ✅ Intentar tipo de sangre inventado
  try {
    new Patient("Test", 30, "XYZ", [], 70, 1.70); // Sangre inválida
  } catch (error: any) {
    console.log(`  ❌ Sangre "XYZ": ${error.message}`); // La Entity rechaza
  }

  // ✅ Intentar peso negativo
  try {
    new Patient("Test", 30, "A+", [], -100, 1.70); // Peso inválido
  } catch (error: any) {
    console.log(`  ❌ Peso -100kg: ${error.message}`); // La Entity rechaza
  }

  // ============================================================================
  // 📖 RESUMEN DE LA LECCIÓN
  // ============================================================================
  console.log("\n\n" + "=".repeat(55));
  console.log("📖 RESUMEN: ¿QUÉ ES UNA ENTITY?");
  console.log("=".repeat(55));
  console.log("\n  Una Entity NO es un simple contenedor de datos (DTO).");
  console.log("  Una Entity es un objeto que:");
  console.log("\n  1️⃣  PROTEGE SUS INVARIANTES:");
  console.log("     • Patient rechaza edad negativa, peso cero, sangre inválida");
  console.log("     • Medication rechaza dosis negativa, nombre vacío");
  console.log("     • Prescription rechaza combinaciones peligrosas");
  console.log("\n  2️⃣  ENCAPSULA REGLAS DE NEGOCIO:");
  console.log("     • Patient.calculateBMI() → el paciente SABE calcular su IMC");
  console.log("     • Medication.isSafeForPatient() → el medicamento SABE si es seguro");
  console.log("     • Prescription valida al construirse → nunca existe en estado inválido");
  console.log("\n  3️⃣  ES INMUTABLE (campos readonly):");
  console.log("     • Nadie puede hacer patient.age = -5 desde afuera");
  console.log("     • Los datos se validan UNA VEZ y no cambian");
  console.log("\n  4️⃣  NO CONOCE EL EXTERIOR:");
  console.log("     • No sabe de BD, HTTP, ni frameworks");
  console.log("     • Se puede testear con un simple: new Patient(...)");
  console.log("\n  💡 ERROR COMÚN: 'Anemic Domain Model'");
  console.log("     → Clases con solo datos y sin métodos = DTOs disfrazados");
  console.log("     → La lógica queda en 'servicios' externos que los manipulan");
  console.log("     → Solución: MOVER la lógica ADENTRO de la Entity");
}

// Ejecutamos el programa principal
main();
