// ============================================================================
// ❌ PROBLEMA: Entidades Anémicas - solo datos, sin reglas de negocio
// ============================================================================
// 📖 LECCIÓN (Clean Architecture - Capítulo 20):
//
//    Robert C. Martin dice que una ENTITY no es solo un "contenedor de datos".
//    Una Entity encapsula las reglas de negocio más críticas de la EMPRESA.
//
//    🚨 El anti-patrón "Anemic Domain Model" (Martin Fowler) ocurre cuando:
//       - Las clases solo tienen getters/setters (son "bolsas de datos")
//       - Toda la lógica está AFUERA en "servicios" o "handlers"
//       - Las clases no protegen sus propias invariantes
//
//    Una ENTITY real PROTEGE sus reglas. Nadie de afuera puede ponerla
//    en un estado inválido.
//
// 🎯 TU MISIÓN: Observa cómo las "entities" aquí son solo datos tontos,
//    y toda la lógica vive en una función externa que las manipula.
// ============================================================================

// ❌ "Entity" anémica: solo datos, CERO lógica de negocio
// Esto NO es una Entity, es un DTO (Data Transfer Object) disfrazado
class Patient {
  name: string;         // Nombre del paciente - dato público
  age: number;          // Edad del paciente - dato público
  bloodType: string;    // Tipo de sangre - dato público
  allergies: string[];  // Lista de alergias - dato público
  weight: number;       // Peso en kg - dato público
  height: number;       // Altura en metros - dato público

  // ❌ Constructor que solo asigna datos, no valida NADA
  constructor(name: string, age: number, bloodType: string, allergies: string[], weight: number, height: number) {
    this.name = name;           // Asigna sin validar
    this.age = age;             // ¿Edad negativa? No hay protección
    this.bloodType = bloodType; // ¿Tipo de sangre "XYZ"? No hay validación
    this.allergies = allergies; // Asigna directamente el array
    this.weight = weight;       // ¿Peso negativo? No le importa
    this.height = height;       // ¿Altura cero? Tampoco valida
  }
  // ❌ NOTA: Sin métodos. No calcula IMC, no valida, no protege nada.
  //    Es una "bolsa de datos" que cualquiera puede modificar libremente.
}

// ❌ "Entity" anémica: otra bolsa de datos sin inteligencia
class Medication {
  name: string;         // Nombre del medicamento - dato público
  dosageMg: number;     // Dosis en miligramos - dato público
  frequency: string;    // Frecuencia de toma - dato público
  contraindications: string[]; // Contraindicaciones - dato público

  // ❌ Constructor sin validación ni reglas
  constructor(name: string, dosageMg: number, frequency: string, contraindications: string[]) {
    this.name = name;                           // Sin validar
    this.dosageMg = dosageMg;                   // ¿Dosis negativa? No valida
    this.frequency = frequency;                 // ¿Frecuencia inválida? No valida
    this.contraindications = contraindications; // Sin lógica
  }
  // ❌ NOTA: No sabe si es compatible con un paciente.
  //    No sabe calcular la dosis ajustada al peso.
  //    Es solo un contenedor de strings y números.
}

// ❌ "Entity" anémica: prescripción sin reglas
class Prescription {
  patientName: string;    // Solo guarda el nombre como string
  medicationName: string; // Solo guarda el nombre como string
  dosageMg: number;       // Dosis asignada - dato público
  notes: string;          // Notas del médico - dato público

  // ❌ Constructor solo almacena datos
  constructor(patientName: string, medicationName: string, dosageMg: number, notes: string) {
    this.patientName = patientName;       // No referencia a Patient
    this.medicationName = medicationName; // No referencia a Medication
    this.dosageMg = dosageMg;             // Sin validación
    this.notes = notes;                   // Solo texto
  }
  // ❌ NOTA: No valida interacciones.
  //    No verifica alergias.
  //    No ajusta dosis según el peso.
  //    Cualquiera puede crear una prescripción peligrosa.
}

// ❌ TODA la lógica está en esta función "servicio" que manipula los datos
// Las entidades son marionetas sin voluntad propia
function prescribeMedication(patient: Patient, medication: Medication, requestedDoseMg: number): {
  success: boolean;  // Si la prescripción fue exitosa
  message: string;   // Mensaje de resultado
} {
  console.log(`  🔄 Prescribiendo ${medication.name} para ${patient.name}...\n`);

  // ❌ Validación de edad FUERA de la entidad Patient
  // La entidad no sabe proteger su propia validez
  if (patient.age < 0 || patient.age > 150) {
    return { success: false, message: "Edad inválida del paciente" };
  }

  // ❌ Validación de peso FUERA de la entidad Patient
  if (patient.weight <= 0) {
    return { success: false, message: "Peso inválido del paciente" };
  }

  // ❌ Cálculo de IMC FUERA de la entidad Patient
  // El paciente debería saber calcular su propio IMC
  const bmi = patient.weight / (patient.height * patient.height);
  console.log(`  📊 IMC del paciente: ${bmi.toFixed(1)}`);

  // ❌ Verificación de alergias FUERA de las entidades
  // El Medication debería saber si es peligroso para un paciente
  for (const allergy of patient.allergies) {
    for (const contraindication of medication.contraindications) {
      if (allergy.toLowerCase() === contraindication.toLowerCase()) {
        console.log(`  ⚠️  ALERGIA DETECTADA: ${allergy} ↔ ${contraindication}`);
        return {
          success: false,
          message: `PELIGRO: Paciente alérgico a ${allergy}, medicamento contraindicado`,
        };
      }
    }
  }

  // ❌ Ajuste de dosis por peso FUERA del Medication
  // El medicamento debería saber ajustar su propia dosis
  let adjustedDose = requestedDoseMg;
  if (patient.weight < 50) {
    adjustedDose = requestedDoseMg * 0.75;
    console.log(`  ⚖️  Paciente bajo peso (${patient.weight}kg), dosis reducida 25%`);
  } else if (patient.weight > 100) {
    adjustedDose = requestedDoseMg * 1.25;
    console.log(`  ⚖️  Paciente alto peso (${patient.weight}kg), dosis aumentada 25%`);
  }

  // ❌ Verificación de dosis máxima FUERA del Medication
  const maxDose = medication.dosageMg * 2;
  if (adjustedDose > maxDose) {
    return {
      success: false,
      message: `Dosis ajustada (${adjustedDose}mg) excede máximo permitido (${maxDose}mg)`,
    };
  }

  // ❌ Verificación de dosis pediátrica FUERA de todo
  if (patient.age < 12 && adjustedDose > medication.dosageMg * 0.5) {
    adjustedDose = medication.dosageMg * 0.5;
    console.log(`  👶 Paciente pediátrico, dosis limitada a ${adjustedDose}mg`);
  }

  // ❌ Creamos la prescripción con strings sueltos (no con referencias)
  const prescription = new Prescription(
    patient.name,
    medication.name,
    adjustedDose,
    `Dosis ajustada de ${requestedDoseMg}mg a ${adjustedDose}mg`
  );

  console.log(`  ✅ Prescripción creada: ${prescription.medicationName} ${prescription.dosageMg}mg`);
  console.log(`  📝 Nota: ${prescription.notes}`);

  return {
    success: true,
    message: `Prescripción: ${medication.name} ${adjustedDose}mg - ${medication.frequency}`,
  };
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ PROBLEMA - Entidades Anémicas (bolsas de datos)");
  console.log("=".repeat(55));

  // Creamos entidades que son solo datos, sin protección
  const patient = new Patient(
    "María Torres",           // Nombre
    8,                        // 8 años - paciente pediátrico
    "O+",                     // Tipo de sangre
    ["Penicilina", "Sulfa"],  // Alergias conocidas
    30,                       // 30 kg (bajo peso, es niña)
    1.20                      // 1.20 metros de estatura
  );

  const medication = new Medication(
    "Amoxicilina",                    // Antibiótico común
    500,                              // Dosis estándar en mg
    "Cada 8 horas",                   // Frecuencia
    ["Penicilina", "Cefalosporinas"]  // Contraindicaciones
  );

  // CASO 1: Medicamento con alergia (debe rechazar)
  console.log("\n📋 CASO 1: Medicamento con contraindicación por alergia");
  console.log("-".repeat(45));
  const result1 = prescribeMedication(patient, medication, 250);
  console.log(`  📤 Resultado: ${result1.message}`);

  // Creamos otro medicamento sin contraindicación
  const safeMedication = new Medication(
    "Ibuprofeno",        // Antiinflamatorio
    400,                 // Dosis estándar en mg
    "Cada 6 horas",      // Frecuencia
    ["Aspirina"]         // Contraindicaciones (no aplica a María)
  );

  // CASO 2: Medicamento seguro pero con ajuste pediátrico
  console.log("\n\n📋 CASO 2: Medicamento seguro con ajuste pediátrico");
  console.log("-".repeat(45));
  const result2 = prescribeMedication(patient, safeMedication, 400);
  console.log(`  📤 Resultado: ${result2.message}`);

  // ❌ Demostración: podemos mutar la entidad sin protección
  console.log("\n\n📋 CASO 3: ¡Mutación peligrosa sin protección!");
  console.log("-".repeat(45));
  patient.age = -5;       // ❌ NADIE impide esto
  patient.weight = -100;  // ❌ NADIE impide esto
  patient.bloodType = "INVENTADO"; // ❌ NADIE impide esto
  console.log(`  ⚠️  Paciente modificado: edad=${patient.age}, peso=${patient.weight}, sangre=${patient.bloodType}`);
  console.log("  ❌ ¡La entidad permite estados IMPOSIBLES!");

  console.log("\n\n" + "=".repeat(55));
  console.log("⚠️  PROBLEMAS CON ENTIDADES ANÉMICAS:");
  console.log("=".repeat(55));
  console.log("  ❌ Las 'entidades' son solo contenedores de datos (DTOs disfrazados)");
  console.log("  ❌ No protegen sus invariantes (edad negativa es posible)");
  console.log("  ❌ Toda la lógica está en la función prescribeMedication()");
  console.log("  ❌ Patient no sabe calcular su IMC ni validar sus datos");
  console.log("  ❌ Medication no sabe si es seguro para un paciente");
  console.log("  ❌ Prescription no verifica nada al crearse");
  console.log("  ❌ Si otro servicio necesita las mismas reglas, hay que duplicarlas");
  console.log("\n🎯 TU TAREA: Refactoriza en solution.ts haciendo que:");
  console.log("  📗 Patient SEPA calcular su IMC y validar sus datos");
  console.log("  📗 Medication SEPA si es seguro para un paciente");
  console.log("  📗 Prescription VERIFIQUE antes de crearse");
}

main();
