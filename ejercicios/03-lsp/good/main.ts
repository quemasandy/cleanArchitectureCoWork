// ============================================================================
// ✅ BUEN EJEMPLO: Aplicación del Principio de Sustitución de Liskov (LSP)
// ============================================================================
// 📖 PRINCIPIO: "Los subtipos deben ser sustituibles por sus tipos base
//    sin alterar el comportamiento correcto del programa"
//    - Barbara Liskov / Robert C. Martin, Clean Architecture Cap. 9
//
// ✅ SOLUCIÓN: En vez de forzar a todos los Bird a volar, creamos
//    jerarquías que reflejen la realidad:
//    - Bird (base): lo que TODOS los pájaros pueden hacer
//    - FlyingBird: aves que sí pueden volar
//    - SwimmingBird: aves que pueden nadar
//
//    Ahora NINGÚN subtipo viola el contrato de su tipo base.
// ============================================================================

// ✅ Interface base: solo define lo que TODOS los pájaros pueden hacer
// No incluye fly() porque no TODOS los pájaros vuelan
interface Bird {
  readonly name: string;
  // ✅ Todos los pájaros pueden comer - contrato universal
  eat(): string;
  // ✅ Todos los pájaros hacen algún sonido
  makeSound(): string;
}

// ✅ Interface para aves que pueden volar
// Solo las aves que REALMENTE vuelan implementan esta interface
interface FlyingBird extends Bird {
  fly(): string;
}

// ✅ Interface para aves que pueden nadar
// Los pingüinos nadan, no vuelan - ¡y eso está bien!
interface SwimmingBird extends Bird {
  swim(): string;
}

// ✅ Eagle implementa FlyingBird - cumple el contrato perfectamente
class Eagle implements FlyingBird {
  readonly name = "Águila";

  eat(): string {
    return `${this.name} caza y come un pez 🐟`;
  }

  makeSound(): string {
    return `${this.name}: ¡SCREEE! 🦅`;
  }

  // ✅ Eagle SÍ puede volar - cumple el contrato de FlyingBird
  fly(): string {
    return `${this.name} vuela majestuosamente a 3000m de altura 🦅`;
  }
}

// ✅ Sparrow también implementa FlyingBird
class Sparrow implements FlyingBird {
  readonly name = "Gorrión";

  eat(): string {
    return `${this.name} picotea semillas 🌾`;
  }

  makeSound(): string {
    return `${this.name}: ¡Pío pío! 🐦`;
  }

  // ✅ El gorrión también vuela - contrato cumplido
  fly(): string {
    return `${this.name} vuela entre los árboles del parque 🌳`;
  }
}

// ✅ Penguin implementa SwimmingBird, NO FlyingBird
// No se le pide que vuele - ¡porque los pingüinos no vuelan!
class Penguin implements SwimmingBird {
  readonly name = "Pingüino";

  eat(): string {
    return `${this.name} come krill y peces 🐟`;
  }

  makeSound(): string {
    return `${this.name}: ¡HONK HONK! 🐧`;
  }

  // ✅ Penguin nada en vez de volar - contrato correcto
  swim(): string {
    return `${this.name} nada a 22 km/h bajo el agua 🐧💨`;
  }
}

// ============================================================================
// ✅ Funciones que trabajan con los contratos correctos
// Nunca se rompen porque cada tipo cumple su contrato
// ============================================================================

// ✅ Esta función SOLO acepta aves que vuelan - contrato garantizado
function makeBirdsFly(birds: FlyingBird[]): void {
  console.log("\n✈️  Haciendo volar a las aves voladoras...\n");

  for (const bird of birds) {
    // ✅ Podemos llamar fly() con confianza - el tipo lo garantiza
    // No necesitamos try/catch ni verificaciones especiales
    console.log(`  ${bird.fly()}`);
  }
}

// ✅ Esta función SOLO acepta aves que nadan
function makeBirdsSwim(birds: SwimmingBird[]): void {
  console.log("\n🏊 Haciendo nadar a las aves nadadoras...\n");

  for (const bird of birds) {
    // ✅ swim() siempre funciona porque SwimmingBird lo garantiza
    console.log(`  ${bird.swim()}`);
  }
}

// ✅ Esta función acepta CUALQUIER ave - solo usa el contrato base
function feedBirds(birds: Bird[]): void {
  console.log("\n🍕 Alimentando a TODAS las aves...\n");

  for (const bird of birds) {
    // ✅ eat() funciona para TODOS los Bird - contrato universal
    console.log(`  ${bird.eat()}`);
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO - Aplicación de LSP");
  console.log("=".repeat(50));

  // Creamos nuestras aves
  const eagle = new Eagle();
  const sparrow = new Sparrow();
  const penguin = new Penguin();

  // ✅ Solo las aves voladoras van a la función de volar
  // El compilador de TypeScript IMPIDE pasar un Penguin aquí
  const flyingBirds: FlyingBird[] = [eagle, sparrow];
  makeBirdsFly(flyingBirds);

  // ✅ Solo las aves nadadoras van a la función de nadar
  const swimmingBirds: SwimmingBird[] = [penguin];
  makeBirdsSwim(swimmingBirds);

  // ✅ TODAS las aves pueden comer - contrato universal
  const allBirds: Bird[] = [eagle, sparrow, penguin];
  feedBirds(allBirds);

  // ✅ Los sonidos también funcionan para todos
  console.log("\n🔊 Sonidos de todas las aves:\n");
  for (const bird of allBirds) {
    console.log(`  ${bird.makeSound()}`);
  }

  console.log("\n🎯 BENEFICIOS DE LSP:");
  console.log("  ✅ Penguin NUNCA se le pide volar - no viola ningún contrato");
  console.log("  ✅ El compilador te protege: no puedes pasar Penguin a makeBirdsFly()");
  console.log("  ✅ No necesitas try/catch ni verificaciones defensivas");
  console.log("  ✅ Puedes confiar ciegamente en el contrato de cada interface");
  console.log("  ✅ Agregar nuevas aves es seguro: implementa la interface correcta");
}

main();
