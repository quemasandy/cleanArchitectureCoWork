// ============================================================================
// ✅ BUEN EJEMPLO: Estado Puramente Funcional
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 6):
//    El estado se maneja como un VALOR EXPLÍCITO que se pasa de función
//    en función. Cada función recibe el estado actual y retorna un
//    NUEVO estado junto con el resultado.
//
//    Patrón clave: State<S, A> = (estado) => [resultado, nuevoEstado]
//
//    En vez de Math.random() que muta estado interno oculto, creamos
//    un generador PURO donde el estado es una semilla que se transforma
//    de forma determinista.
//
//    Beneficios:
//    - Resultados 100% reproducibles (misma semilla = mismo resultado)
//    - Testeabilidad perfecta
//    - Historial de estados completo
//    - No hay estado oculto ni efectos secundarios
// ============================================================================

// ============================================================================
// 📖 GENERADOR DE NÚMEROS ALEATORIOS PURO
// ============================================================================
// En vez de mutar estado interno (como Math.random()), el generador
// RETORNA el nuevo estado junto con el valor generado.
// La misma semilla SIEMPRE produce la misma secuencia.
// ============================================================================

// ✅ Interfaz para un generador de números aleatorios — es solo un valor
interface RNG {
  readonly seed: number; // La semilla es el estado — inmutable
}

// ✅ Crear un generador con una semilla específica
function makeRNG(seed: number): RNG {
  return { seed }; // Solo un objeto con la semilla — sin estado oculto
}

// ✅ Función PURA que genera un número Y retorna el NUEVO estado
// La misma semilla SIEMPRE produce el mismo número y la misma siguiente semilla
function nextInt(rng: RNG): [number, RNG] {
  // ✅ Algoritmo determinista: Linear Congruential Generator
  const newSeed = (rng.seed * 1103515245 + 12345) & 0x7fffffff; // Fórmula determinista
  const value = (newSeed >>> 16) & 0x7fff; // Extrae los bits de alta calidad
  // ✅ Retorna TUPLA: [valor generado, nuevo estado del generador]
  return [value, makeRNG(newSeed)]; // El RNG original NO se modifica
}

// ✅ Función PURA: genera un entero entre min y max (inclusive)
function intInRange(rng: RNG, min: number, max: number): [number, RNG] {
  const [raw, nextRng] = nextInt(rng);       // Genera un número crudo
  const range = max - min + 1;               // Rango deseado
  const result = min + (raw % range);        // Ajusta al rango
  return [result, nextRng];                  // Retorna resultado + nuevo estado
}

// ============================================================================
// 📖 TRANSICIONES DE ESTADO COMO FUNCIONES
// ============================================================================
// El patrón "State" es simplemente una función de estado → (resultado, nuevoEstado)
// Podemos COMPONER estas funciones para crear flujos complejos.
// ============================================================================

// ✅ Tipo para una transición de estado pura
type State<S, A> = (state: S) => [A, S]; // Función: estado → [resultado, nuevoEstado]

// ✅ Función PURA que tira un dado (1-6) — es una transición de estado
function rollDice(rng: RNG): [number, RNG] {
  return intInRange(rng, 1, 6); // Usa intInRange que ya es puro
}

// ✅ Personaje INMUTABLE — nunca se modifica, se crea uno nuevo
interface Character {
  readonly name: string;  // Nombre del personaje
  readonly hp: number;    // Puntos de vida
  readonly attack: number; // Poder de ataque
}

// ✅ Resultado de un turno de combate — todo explícito
interface FightResult {
  readonly damage: number;    // Daño causado
  readonly attacker: Character; // Atacante (sin cambios)
  readonly defender: Character; // Defensor con HP actualizado (NUEVO objeto)
  readonly rng: RNG;          // Nuevo estado del generador
}

// ✅ Función PURA de combate: retorna resultado + nuevo estado del RNG
function fight(attacker: Character, defender: Character, rng: RNG): FightResult {
  // ✅ Genera daño de forma determinista usando el RNG puro
  const [damage, nextRng] = intInRange(rng, 1, attacker.attack);
  // ✅ Crea un NUEVO defensor con HP reducido — no muta el original
  const updatedDefender: Character = {
    ...defender,
    hp: defender.hp - damage, // Nuevo objeto con HP actualizado
  };
  // ✅ Retorna TODO explícitamente: daño, personajes, nuevo estado RNG
  return {
    damage,
    attacker,
    defender: updatedDefender,
    rng: nextRng,
  };
}

// ✅ Generador de IDs PURO — el "estado" es el contador pasado explícitamente
function generateId(counter: number): [string, number] {
  // ✅ Retorna el ID Y el siguiente valor del contador
  return [`ID-${counter + 1}`, counter + 1]; // No hay estado global
}

// ============================================================================
// 🔬 DEMOSTRACIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO — Estado Puramente Funcional");
  console.log("=".repeat(55));

  // --- Beneficio 1: Resultados 100% reproducibles ---
  console.log("\n📌 Beneficio 1: Misma semilla = mismos resultados (reproducible)");
  console.log("-".repeat(40));

  // ✅ Misma semilla → SIEMPRE la misma secuencia
  const rng1 = makeRNG(42);                        // Semilla 42
  const [dice1a, rng2] = rollDice(rng1);           // Primer dado
  const [dice1b, _rng3] = rollDice(rng2);           // Segundo dado

  console.log(`  Semilla 42, dado 1: ${dice1a}`);
  console.log(`  Semilla 42, dado 2: ${dice1b}`);

  // ✅ Repetimos con la MISMA semilla — MISMOS resultados
  const rng1Again = makeRNG(42);                    // Misma semilla
  const [dice2a, rng2Again] = rollDice(rng1Again);  // Mismo resultado
  const [dice2b, _rng3Again] = rollDice(rng2Again);  // Mismo resultado

  console.log(`\n  Repetido, dado 1: ${dice2a}`);
  console.log(`  Repetido, dado 2: ${dice2b}`);
  console.log(`  ¿Iguales? ${dice1a === dice2a && dice1b === dice2b}`); // true
  console.log("  ✅ ¡100% reproducible! Perfecto para tests y debugging");

  // --- Beneficio 2: Historial completo de estados ---
  console.log("\n📌 Beneficio 2: Historial completo de combate");
  console.log("-".repeat(40));

  // ✅ Los personajes originales NUNCA se modifican
  const hero: Character = { name: "Héroe", hp: 100, attack: 20 };
  const enemy: Character = { name: "Dragón", hp: 80, attack: 15 };

  // ✅ Cada turno retorna NUEVOS personajes — los originales quedan intactos
  const rngCombat = makeRNG(123); // Semilla para el combate

  const turn1 = fight(hero, enemy, rngCombat);
  console.log(`  Turno 1: ${hero.name} → ${turn1.damage} daño → ${turn1.defender.name} HP: ${turn1.defender.hp}`);

  const turn2 = fight(hero, turn1.defender, turn1.rng);
  console.log(`  Turno 2: ${hero.name} → ${turn2.damage} daño → ${turn2.defender.name} HP: ${turn2.defender.hp}`);

  const turn3 = fight(hero, turn2.defender, turn2.rng);
  console.log(`  Turno 3: ${hero.name} → ${turn3.damage} daño → ${turn3.defender.name} HP: ${turn3.defender.hp}`);

  // ✅ Los personajes ORIGINALES siguen intactos
  console.log(`\n  HP original del Dragón: ${enemy.hp}`); // 80 — NUNCA cambió
  console.log("  ✅ ¡El estado original se preserva! Podemos hacer 'undo'");

  // ✅ Podemos "rebobinar" y reproducir exactamente el mismo combate
  const rngReplay = makeRNG(123); // Misma semilla
  const replay1 = fight(hero, enemy, rngReplay);
  console.log(`\n  Replay turno 1: daño ${replay1.damage} (original: ${turn1.damage})`);
  console.log(`  ¿Iguales? ${replay1.damage === turn1.damage}`); // true

  // --- Beneficio 3: IDs sin estado global ---
  console.log("\n📌 Beneficio 3: Generador de IDs sin estado global");
  console.log("-".repeat(40));

  // ✅ El contador es un argumento explícito — no hay variable global
  const [id1, counter1] = generateId(0);  // ID-1, counter: 1
  const [id2, counter2] = generateId(counter1); // ID-2, counter: 2
  const [id3, _counter3] = generateId(counter2); // ID-3, counter: 3

  console.log(`  IDs: ${id1}, ${id2}, ${id3}`);
  console.log("  ✅ generateId(0) SIEMPRE retorna 'ID-1' — determinista");
  console.log("  ✅ Ningún otro módulo puede afectar nuestros IDs");

  // --- Resumen ---
  console.log("\n✅ BENEFICIOS:");
  console.log("  ✅ Misma semilla = misma secuencia — 100% reproducible");
  console.log("  ✅ Estado explícito como argumento — sin variables globales ocultas");
  console.log("  ✅ Historial completo — cada versión del estado se conserva");
  console.log("  ✅ Tests deterministas: generas la semilla, verificas el resultado");
  console.log("  ✅ Debugging: reproduces el bug con la misma semilla");
  console.log("  ✅ Paralelizable: sin estado compartido no hay race conditions");
}

// Ejecutamos el ejemplo
main();
