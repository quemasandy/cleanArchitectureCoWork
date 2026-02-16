// ============================================================================
// ❌ PROBLEMA: Encuentra la violación de LSP y arréglala
// ============================================================================
//
// 📖 REGLA DE LSP:
//    "Los objetos de una superclase deben ser reemplazables
//     por objetos de sus subclases sin romper la aplicación."
//
//    Para que Sub reemplace a Super, Sub TIENE que tener
//    TODOS los elementos de Super.
//
// 🎯 TU MISIÓN:
//    1. Ejecuta este archivo y observa qué se rompe
//    2. Identifica cuál subclase NO puede sustituir a Vehicle
//    3. Explica POR QUÉ no puede sustituirlo
//    4. Arréglalo (pista: el padre promete demasiado)
// ============================================================================

// ============================================================================
// 🚗 Superclase: Vehicle (Vehículo)
// ============================================================================
// El padre define el "contrato": todo Vehicle puede hacer estas 3 cosas
class Vehicle {
  // Propiedad que almacena el nombre del vehículo
  constructor(public name: string) { }

  // Contrato 1: Todos los vehículos pueden arrancar
  start(): string {
    // Retorna un mensaje indicando que el vehículo arrancó
    return `${this.name} ha arrancado 🔑`;
  }

  // Contrato 2: Todos los vehículos pueden recargar combustible
  refuel(liters: number): string {
    // Retorna un mensaje indicando cuántos litros se cargaron
    return `${this.name} recargó ${liters} litros de combustible ⛽`;
  }

  // Contrato 3: Todos los vehículos tienen una velocidad máxima
  getMaxSpeed(): number {
    // Retorna una velocidad por defecto de 100 km/h
    return 100;
  }
}

// ============================================================================
// 🚗 Subclase 1: Car (Auto)
// ============================================================================
// Pregúntate: ¿Car tiene TODOS los elementos de Vehicle?
class Car extends Vehicle {
  constructor() {
    // Llama al constructor del padre con el nombre "Auto"
    super("Auto");
  }

  // ¿Cumple contrato 1? start()
  start(): string {
    // El auto arranca con su motor de gasolina
    return `🚗 ${this.name} enciende su motor de gasolina ¡VROOM!`;
  }

  // ¿Cumple contrato 2? refuel()
  refuel(liters: number): string {
    // El auto sí puede recargar combustible
    return `🚗 ${this.name} cargó ${liters} litros de gasolina ⛽`;
  }

  // ¿Cumple contrato 3? getMaxSpeed()
  getMaxSpeed(): number {
    // El auto tiene velocidad máxima de 200 km/h
    return 200;
  }
}

// ============================================================================
// 🚌 Subclase 2: ElectricBus (Autobús eléctrico)
// ============================================================================
// Pregúntate: ¿ElectricBus tiene TODOS los elementos de Vehicle?
class ElectricBus extends Vehicle {
  constructor() {
    // Llama al constructor del padre con el nombre "Bus Eléctrico"
    super("Bus Eléctrico");
  }

  // ¿Cumple contrato 1? start()
  start(): string {
    // El bus eléctrico arranca silenciosamente
    return `🚌 ${this.name} arranca silenciosamente... 🔇`;
  }

  // ❓ ¿Cumple contrato 2? refuel()
  // 🧠 PIÉNSALO: Un bus ELÉCTRICO no usa combustible... ¿qué hace aquí?
  refuel(liters: number): string {
    // 🚨 ¡Un bus eléctrico NO tiene tanque de combustible!
    // No puede "recargar litros" — eso no tiene sentido para él
    throw new Error("❌ ¡Soy eléctrico! No uso combustible. Necesito un cargador 🔌");
  }

  // ¿Cumple contrato 3? getMaxSpeed()
  getMaxSpeed(): number {
    // El bus eléctrico tiene velocidad máxima de 120 km/h
    return 120;
  }
}

// ============================================================================
// 🚲 Subclase 3: Bicycle (Bicicleta)
// ============================================================================
// Pregúntate: ¿Bicycle tiene TODOS los elementos de Vehicle?
class Bicycle extends Vehicle {
  constructor() {
    // Llama al constructor del padre con el nombre "Bicicleta"
    super("Bicicleta");
  }

  // ❓ ¿Cumple contrato 1? start()
  // 🧠 PIÉNSALO: ¿Una bicicleta "arranca" como un auto?
  start(): string {
    // La bicicleta no tiene motor, pero puede "empezar a moverse"
    return `🚲 ${this.name} empieza a pedalear 🦵`;
  }

  // ❓ ¿Cumple contrato 2? refuel()
  // 🧠 PIÉNSALO: ¿Una bicicleta recarga combustible?
  refuel(liters: number): string {
    // 🚨 ¡Una bicicleta NO usa combustible!
    throw new Error("❌ ¡Soy una bicicleta! No uso combustible 🚲");
  }

  // ❓ ¿Cumple contrato 3? getMaxSpeed()
  getMaxSpeed(): number {
    // La bicicleta tiene velocidad máxima de 30 km/h
    return 30;
  }
}

// ============================================================================
// 🏭 Función que CONFÍA en el contrato de Vehicle
// ============================================================================
// Esta función espera que CUALQUIER Vehicle pueda:
//   1. Arrancar (start)
//   2. Recargar combustible (refuel)
//   3. Tener velocidad máxima (getMaxSpeed)
function prepareForTrip(vehicle: Vehicle): void {
  // Imprime el nombre del vehículo que se está preparando
  console.log(`\n  Preparando: ${vehicle.name}`);
  console.log(`  ${"─".repeat(40)}`);

  // Paso 1: Arrancamos el vehículo
  console.log(`  1. ${vehicle.start()}`);

  // Paso 2: Recargamos 50 litros de combustible
  try {
    // 🚨 Aquí es donde SE ROMPE si el vehículo no puede recargar
    console.log(`  2. ${vehicle.refuel(50)}`);
  } catch (error) {
    // Si llegamos aquí, el hijo NO pudo sustituir al padre
    console.log(`  2. 💥 ERROR: ${(error as Error).message}`);
  }

  // Paso 3: Mostramos la velocidad máxima
  console.log(`  3. Velocidad máxima: ${vehicle.getMaxSpeed()} km/h`);
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ PROBLEMA — Encuentra la violación de LSP");
  console.log("=".repeat(50));
  console.log("\n📖 Regla: Para que Sub reemplace a Super,");
  console.log("   Sub TIENE que tener TODOS los elementos de Super.\n");

  // Visualizamos el contrato de Vehicle
  console.log("📋 Contrato de Vehicle (Super):");
  console.log("   [start()]  [refuel()]  [getMaxSpeed()]");
  console.log("");

  // Visualizamos qué tiene cada subclase
  console.log("📋 ¿Qué tiene cada Sub?");
  console.log("   Car:         [start() ✅] [refuel() ✅] [getMaxSpeed() ✅]");
  console.log("   ElectricBus: [start() ✅] [refuel() ❌] [getMaxSpeed() ✅]");
  console.log("   Bicycle:     [start() ✅] [refuel() ❌] [getMaxSpeed() ✅]");
  console.log("");

  // Creamos un array de Vehicle — todos DEBERÍAN poder ser sustituidos
  const vehicles: Vehicle[] = [
    // ✅ Car tiene TODOS los elementos de Vehicle
    new Car(),
    // ❓ ElectricBus tiene todos?
    new ElectricBus(),
    // ❓ Bicycle tiene todos?
    new Bicycle(),
  ];

  console.log("🚀 Preparando todos los vehículos para el viaje:");

  // Iteramos sobre todos los vehículos
  for (const vehicle of vehicles) {
    // prepareForTrip espera un Vehicle
    // Si el hijo no lo sustituye bien → 💥 se rompe
    prepareForTrip(vehicle);
  }

  // Preguntas para reflexión
  console.log("\n" + "=".repeat(50));
  console.log("🧠 PREGUNTAS PARA TI:");
  console.log("=".repeat(50));
  console.log("\n  1. ¿Cuáles subclases NO pudieron sustituir a Vehicle?");
  console.log("  2. ¿Qué método les faltó cumplir?");
  console.log("  3. ¿El problema es de los hijos o del padre?");
  console.log("     PISTA: El padre promete algo que no todos pueden cumplir...");
  console.log("  4. ¿Cómo lo arreglarías?");
  console.log("\n  ▶️  Cuando lo tengas, ejecuta la solución:");
  console.log("     npx ts-node ejercicios/03-lsp/ejercicio-guiado/solucion.ts");
}

// Ejecutar el ejercicio
main();
