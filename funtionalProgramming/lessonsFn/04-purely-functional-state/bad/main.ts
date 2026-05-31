// ============================================================================
// ❌ MAL EJEMPLO: Estado mutable e impuro
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 6):
//    Manejar estado es la parte más difícil de la programación.
//    Hacerlo de forma pura elimina una clase entera de bugs
//    relacionados con estado mutable compartido.
//
// 🚨 PROBLEMA: Usar Math.random() y variables mutables causa:
//    - Resultados no reproducibles (imposible testear)
//    - Estado interno oculto que cambia con cada llamada
//    - No podemos "rebobinar" para reproducir un bug
//    - En código paralelo: race conditions
// ============================================================================

// ❌ Generador de números aleatorios IMPURO — usa Math.random()
// No podemos controlar qué valores produce — imposible testear
function rollDice(): number {
  // ❌ Math.random() tiene estado interno oculto — efecto secundario
  const result = Math.floor(Math.random() * 6) + 1; // Impredecible
  // ❌ Efecto secundario: imprime en consola
  console.log(`  🎲 Dado: ${result}`);
  return result; // Valor diferente cada vez — no reproducible
}

// ❌ Simulador de combate con estado mutable compartido
class MutableCharacter {
  // ❌ Estado mutable: cualquier método puede modificar hp
  constructor(
    public name: string,  // Nombre del personaje
    public hp: number,    // Puntos de vida MUTABLES — peligro
    public attack: number // Poder de ataque
  ) { }
}

// ❌ Función IMPURA: modifica los objetos Y usa Math.random()
function fight(attacker: MutableCharacter, defender: MutableCharacter): void {
  // ❌ Math.random() — resultado no reproducible
  const damage = Math.floor(Math.random() * attacker.attack) + 1;
  // ❌ Muta el objeto defender directamente
  defender.hp -= damage; // Efecto secundario: modifica estado externo
  // ❌ Efecto secundario: imprime en consola
  console.log(`  ⚔️  ${attacker.name} ataca a ${defender.name} por ${damage} daño (HP: ${defender.hp})`);
}

// ❌ Generador de IDs "único" — pero dependiente de estado mutable
let nextId = 0; // Variable global mutable
function generateId(): string {
  // ❌ Efecto secundario: incrementa variable global
  nextId += 1; // Muta estado externo
  return `ID-${nextId}`; // Resultado depende de cuántas veces se llamó antes
}

// ============================================================================
// 🔬 DEMOSTRACIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO — Estado Mutable e Impuro");
  console.log("=".repeat(55));

  // --- Problema 1: Resultados no reproducibles ---
  console.log("\n📌 Problema 1: No puedes reproducir resultados");
  console.log("-".repeat(40));

  // ❌ Ejecuta el programa 3 veces — resultados DIFERENTES cada vez
  console.log("  Intento 1:");
  const dice1a = rollDice(); // ¿1? ¿4? ¿6? — imposible saber
  const dice1b = rollDice(); // ¿2? ¿5? ¿3? — imposible saber
  console.log(`  Suma: ${dice1a + dice1b}`);

  console.log("  Intento 2:");
  const dice2a = rollDice(); // Valores DIFERENTES a la vez anterior
  const dice2b = rollDice(); // Totalmente impredecible
  console.log(`  Suma: ${dice2a + dice2b}`);

  console.log("  ❌ Imposible reproducir un bug — cada ejecución es diferente");

  // --- Problema 2: Estado mutable compartido ---
  console.log("\n📌 Problema 2: Estado mutable compartido");
  console.log("-".repeat(40));

  // ❌ Los personajes son mutados directamente por fight()
  const hero = new MutableCharacter("Héroe", 100, 20);
  const enemy = new MutableCharacter("Dragón", 80, 15);

  // ❌ fight() muta enemy.hp — no sabemos el estado sin ejecutar
  fight(hero, enemy);
  fight(hero, enemy);
  fight(hero, enemy);

  // ❌ ¿Cuánto HP tiene enemy ahora? Depende de Math.random()
  console.log(`\n  HP del Dragón después de 3 ataques: ${enemy.hp}`);
  console.log("  ❌ No podemos predecir el resultado NI reproducirlo");

  // ❌ El objeto original fue DESTRUIDO — no podemos ver el estado anterior
  console.log(`  HP original del Dragón: ¿? (se perdió para siempre)`);

  // --- Problema 3: IDs dependientes de estado global ---
  console.log("\n📌 Problema 3: Estado global oculto");
  console.log("-".repeat(40));

  // ❌ Los IDs dependen de cuántas veces se llamó generateId() antes
  const id1 = generateId(); // ID-1
  const id2 = generateId(); // ID-2
  const id3 = generateId(); // ID-3

  console.log(`  IDs: ${id1}, ${id2}, ${id3}`);
  console.log("  ❌ Si otro módulo llama generateId(), los IDs de AQUÍ cambian");
  console.log("  ❌ En tests paralelos, los IDs serían IMPREDECIBLES");

  // --- Resumen ---
  console.log("\n⚠️  PROBLEMAS:");
  console.log("  ❌ Math.random() tiene estado oculto — imposible reproducir");
  console.log("  ❌ Objetos mutados directamente — estado anterior se pierde");
  console.log("  ❌ Variables globales (nextId) — afectadas por código externo");
  console.log("  ❌ No puedes testear: cada ejecución produce resultados diferentes");
  console.log("  ❌ No puedes debuggear: imposible reproducir el bug");
}

// Ejecutamos el ejemplo
main();
