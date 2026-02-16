// ============================================================================
// ❌ MAL EJEMPLO: Violación del Principio de Sustitución de Liskov (LSP)
// ============================================================================
// 📖 PRINCIPIO: "Los subtipos deben ser sustituibles por sus tipos base
//    sin alterar el comportamiento correcto del programa"
//    - Barbara Liskov / Robert C. Martin, Clean Architecture Cap. 9
//
// 🚨 PROBLEMA: Si tienes una función que espera un Bird y le pasas un
//    Penguin (que es un Bird), el programa NO debe romperse.
//    Aquí, Penguin viola el contrato de Bird al lanzar un error en fly().
//
//    Consecuencia real: El código que usa Bird confiando en que puede volar
//    se rompe en runtime cuando le pasas un Penguin.
// ============================================================================

// ✅ Clase base que define el contrato: todos los Bird pueden volar
class Bird {
  constructor(public readonly name: string) { }

  // Contrato: todos los Bird deben poder volar
  fly(): string {
    return `${this.name} está volando 🦅`;
  }

  // Contrato: todos los Bird pueden comer
  eat(): string {
    return `${this.name} está comiendo 🍕`;
  }
}

// ✅ Eagle cumple perfectamente el contrato de Bird
class Eagle extends Bird {
  constructor() {
    super("Águila");
  }

  // ✅ Cumple el contrato: puede volar
  fly(): string {
    return `${this.name} vuela majestuosamente a 3000m de altura 🦅`;
  }
}

// ❌ Penguin VIOLA el contrato de Bird
// Un pingüino ES un ave, pero NO puede volar
// Al lanzar un error, rompe el contrato que Bird prometió
class Penguin extends Bird {
  constructor() {
    super("Pingüino");
  }

  // ❌ VIOLACIÓN DE LSP: lanza un error en vez de cumplir el contrato
  // Cualquier código que use Bird.fly() se romperá con Penguin
  fly(): string {
    // 🚨 Esto rompe el principio de Liskov
    // El código que llama fly() espera un string, no un error
    throw new Error("¡Los pingüinos no pueden volar! 🐧");
  }
}

// ❌ Ostrich TAMBIÉN viola el contrato
class Ostrich extends Bird {
  constructor() {
    super("Avestruz");
  }

  // ❌ Otra violación: retorna string vacío (comportamiento inesperado)
  fly(): string {
    // 🚨 No lanza error pero retorna algo inesperado
    // El llamador espera un mensaje positivo de vuelo
    return ""; // silenciosamente no vuela
  }
}

// ============================================================================
// ❌ Esta función CONFÍA en que cualquier Bird puede volar
// Cuando le pasamos un Penguin, se rompe en runtime
// ============================================================================
function makeBirdsFly(birds: Bird[]): void {
  console.log("\n🐦 Haciendo volar a todas las aves...\n");

  for (const bird of birds) {
    try {
      // Confiamos en el contrato de Bird: fly() retorna un string
      const result = bird.fly();
      if (result) {
        console.log(`  ✈️  ${result}`);
      } else {
        // 🚨 Ostrich retorna "", comportamiento silencioso inesperado
        console.log(`  ⚠️  ${bird.name} no retornó nada al volar...`);
      }
    } catch (error) {
      // 🚨 Penguin lanza un error, rompiendo el flujo normal
      console.log(`  💥 ERROR: ${(error as Error).message}`);
    }
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO - Violación de LSP");
  console.log("=".repeat(50));

  // Creamos un array de Bird - todos deberían poder volar según el contrato
  const birds: Bird[] = [
    new Eagle(),   // ✅ Funciona bien
    new Penguin(), // ❌ Lanza error (viola LSP)
    new Ostrich(), // ❌ Retorna vacío (viola LSP sutilmente)
  ];

  // 🚨 Esta función se rompe porque Penguin y Ostrich NO son sustituibles
  makeBirdsFly(birds);

  console.log("\n⚠️  PROBLEMAS DE VIOLAR LSP:");
  console.log("  ❌ Penguin lanza un error donde se espera un resultado normal");
  console.log("  ❌ Ostrich retorna vacío silenciosamente (bug difícil de detectar)");
  console.log("  ❌ El código que usa Bird necesita try/catch y checks especiales");
  console.log("  ❌ No puedes confiar en el contrato de la clase base");
  console.log('  ❌ Cada nuevo "tipo especial" agrega más código defensivo');
}

main();
