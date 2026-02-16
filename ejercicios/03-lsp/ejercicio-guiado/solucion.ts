// ============================================================================
// ✅ SOLUCIÓN: Principio de Sustitución de Liskov aplicado correctamente
// ============================================================================
//
// 📖 REGLA: Para que Sub reemplace a Super,
//    Sub TIENE que tener TODOS los elementos de Super.
//
// 🔑 ¿QUÉ ESTABA MAL?
//    Vehicle prometía refuel() para TODOS los vehículos.
//    Pero ElectricBus y Bicycle NO pueden recargar combustible.
//    → Los hijos no tenían TODOS los elementos del padre.
//    → No podían sustituirlo.
//
// ✅ ¿CÓMO LO ARREGLAMOS?
//    1. Vehicle SOLO promete lo que TODOS pueden hacer: start() y getMaxSpeed()
//    2. Creamos una interface Refuelable para los que SÍ usan combustible
//    3. Creamos una interface Rechargeable para los eléctricos
//    4. Ahora cada hijo tiene TODOS los elementos de lo que implementa
// ============================================================================

// ============================================================================
// 📦 Interfaces bien diseñadas
// ============================================================================

// ✅ Interface base: SOLO lo que TODOS los vehículos pueden hacer
// No incluye refuel() porque no TODOS los vehículos usan combustible
interface Vehicle {
  // Propiedad con el nombre del vehículo
  readonly name: string;

  // ✅ TODOS los vehículos pueden arrancar/empezar a moverse
  start(): string;

  // ✅ TODOS los vehículos tienen una velocidad máxima
  getMaxSpeed(): number;
}

// ✅ Interface para vehículos que usan combustible
// SOLO la implementan los que REALMENTE pueden recargar combustible
interface Refuelable {
  // Recarga una cantidad de litros de combustible
  refuel(liters: number): string;
}

// ✅ Interface para vehículos eléctricos
// SOLO la implementan los que REALMENTE se cargan con electricidad
interface Rechargeable {
  // Recarga la batería un porcentaje dado
  recharge(percent: number): string;
}

// ============================================================================
// 🚗 Car implementa Vehicle + Refuelable
// Tiene TODO lo de Vehicle ✅ y TODO lo de Refuelable ✅
// ============================================================================
class Car implements Vehicle, Refuelable {
  // Nombre del vehículo
  readonly name = "Auto";

  // ✅ start() — cumple contrato de Vehicle
  start(): string {
    // El auto enciende su motor de gasolina
    return `🚗 ${this.name} enciende su motor de gasolina ¡VROOM!`;
  }

  // ✅ getMaxSpeed() — cumple contrato de Vehicle
  getMaxSpeed(): number {
    // El auto alcanza 200 km/h
    return 200;
  }

  // ✅ refuel() — cumple contrato de Refuelable
  refuel(liters: number): string {
    // El auto sí puede recargar gasolina
    return `🚗 ${this.name} cargó ${liters} litros de gasolina ⛽`;
  }
}

// ============================================================================
// 🚌 ElectricBus implementa Vehicle + Rechargeable (NO Refuelable)
// Tiene TODO lo de Vehicle ✅ y TODO lo de Rechargeable ✅
// NO se le pide refuel() porque NO lo implementa
// ============================================================================
class ElectricBus implements Vehicle, Rechargeable {
  // Nombre del vehículo
  readonly name = "Bus Eléctrico";

  // ✅ start() — cumple contrato de Vehicle
  start(): string {
    // El bus eléctrico arranca silenciosamente
    return `🚌 ${this.name} arranca silenciosamente... 🔇`;
  }

  // ✅ getMaxSpeed() — cumple contrato de Vehicle
  getMaxSpeed(): number {
    // El bus eléctrico alcanza 120 km/h
    return 120;
  }

  // ✅ recharge() — cumple contrato de Rechargeable
  recharge(percent: number): string {
    // El bus eléctrico se conecta al cargador
    return `🚌 ${this.name} se conectó al cargador 🔌 (${percent}% de carga)`;
  }

  // 🔑 NOTA: NO tiene refuel() y ESO ESTÁ BIEN
  //    Porque nunca PROMETIÓ poder recargar combustible
}

// ============================================================================
// 🚲 Bicycle SOLO implementa Vehicle (ni Refuelable ni Rechargeable)
// Tiene TODO lo de Vehicle ✅ — eso es suficiente
// ============================================================================
class Bicycle implements Vehicle {
  // Nombre del vehículo
  readonly name = "Bicicleta";

  // ✅ start() — cumple contrato de Vehicle
  start(): string {
    // La bicicleta empieza a pedalear
    return `🚲 ${this.name} empieza a pedalear 🦵`;
  }

  // ✅ getMaxSpeed() — cumple contrato de Vehicle
  getMaxSpeed(): number {
    // La bicicleta alcanza 30 km/h
    return 30;
  }

  // 🔑 NOTA: NO tiene refuel() NI recharge() y ESO ESTÁ BIEN
  //    La bicicleta solo es un Vehicle básico
}

// ============================================================================
// 🔍 Type guards: Verifican en runtime qué capacidades tiene un vehículo
// ============================================================================

// Verifica si un vehículo puede recargar combustible
function isRefuelable(vehicle: Vehicle): vehicle is Vehicle & Refuelable {
  // Revisa si el objeto tiene el método refuel
  return 'refuel' in vehicle;
}

// Verifica si un vehículo es recargable eléctricamente
function isRechargeable(vehicle: Vehicle): vehicle is Vehicle & Rechargeable {
  // Revisa si el objeto tiene el método recharge
  return 'recharge' in vehicle;
}

// ============================================================================
// 🏭 Funciones que CONFÍAN en los contratos — NUNCA se rompen
// ============================================================================

// ✅ Esta función acepta CUALQUIER Vehicle
// Car, ElectricBus, Bicycle — TODOS sustituyen a Vehicle correctamente
function prepareForTrip(vehicle: Vehicle): void {
  // Imprime el nombre del vehículo
  console.log(`\n  Preparando: ${vehicle.name}`);
  console.log(`  ${"─".repeat(40)}`);

  // ✅ Paso 1: Arrancar — TODOS los Vehicle pueden hacerlo
  console.log(`  1. ${vehicle.start()}`);

  // ✅ Paso 2: Velocidad — TODOS los Vehicle la tienen
  console.log(`  2. Velocidad máxima: ${vehicle.getMaxSpeed()} km/h`);

  // ✅ Paso 3: Energía — depende del tipo específico
  if (isRefuelable(vehicle)) {
    // Solo los que usan combustible llegan aquí
    console.log(`  3. ${vehicle.refuel(50)}`);
  } else if (isRechargeable(vehicle)) {
    // Solo los eléctricos llegan aquí
    console.log(`  3. ${vehicle.recharge(80)}`);
  } else {
    // La bicicleta no necesita energía externa
    console.log(`  3. ℹ️  ${vehicle.name} no necesita combustible ni carga ✨`);
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("✅ SOLUCIÓN — LSP aplicado correctamente");
  console.log("=".repeat(50));

  // Mostramos la estructura corregida
  console.log("\n📋 Contratos CORREGIDOS:");
  console.log("   Vehicle (base):    [start() ✅]  [getMaxSpeed() ✅]");
  console.log("   + Refuelable:      [refuel() ✅]");
  console.log("   + Rechargeable:    [recharge() ✅]");
  console.log("");
  console.log("📋 ¿Qué implementa cada Sub?");
  console.log("   Car:         Vehicle ✅ + Refuelable ✅    → tiene TODO lo que promete");
  console.log("   ElectricBus: Vehicle ✅ + Rechargeable ✅  → tiene TODO lo que promete");
  console.log("   Bicycle:     Vehicle ✅                    → tiene TODO lo que promete");

  // Creamos todos los vehículos
  const vehicles: Vehicle[] = [
    // ✅ Todos pueden sustituir a Vehicle porque tienen TODOS sus elementos
    new Car(),
    new ElectricBus(),
    new Bicycle(),
  ];

  console.log("\n🚀 Preparando todos los vehículos para el viaje:");

  // Iteramos sobre todos — NINGUNO se rompe
  for (const vehicle of vehicles) {
    // ✅ Cada hijo sustituye al padre perfectamente
    prepareForTrip(vehicle);
  }

  // Resumen final
  console.log("\n" + "=".repeat(50));
  console.log("📊 ¿POR QUÉ AHORA FUNCIONA?");
  console.log("=".repeat(50));
  console.log("");
  console.log("  ANTES (mal):");
  console.log("  Vehicle prometía: [start] [refuel] [getMaxSpeed]");
  console.log("  Bicycle tenía:    [start] [  ❌  ] [getMaxSpeed]");
  console.log("  → Bicycle NO podía sustituir a Vehicle (le faltaba refuel)");
  console.log("");
  console.log("  AHORA (bien):");
  console.log("  Vehicle promete:  [start] [getMaxSpeed]  ← solo lo universal");
  console.log("  Bicycle tiene:    [start] [getMaxSpeed]  ← tiene TODO");
  console.log("  → Bicycle SÍ puede sustituir a Vehicle ✅");
  console.log("");
  console.log("  🔑 REGLA CLAVE:");
  console.log("  Para que Sub reemplace a Super,");
  console.log("  Sub TIENE que tener TODOS los elementos de Super.");
  console.log("  Si no los tiene → el padre promete demasiado → dividir en interfaces.");
}

// Ejecutar la solución
main();
