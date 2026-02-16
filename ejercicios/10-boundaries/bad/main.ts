// ============================================================================
// ❌ MAL EJEMPLO: Sin Boundaries (Límites) claros
// ============================================================================
// 📖 PRINCIPIO (Clean Architecture Cap. 17):
//    "Los límites (boundaries) se dibujan donde existe un eje de cambio"
//
//    Un BOUNDARY es una línea que separa cosas que cambian por diferentes
//    razones o a diferentes velocidades. Sin boundaries, todo está
//    acoplado y un cambio se propaga por todo el sistema.
//
// 🚨 PROBLEMA: Un módulo monolítico donde la UI, la lógica de negocio
//    y el acceso a datos están entrelazados sin separación.
//    Cambiar la UI rompe la lógica. Cambiar la BD rompe la UI.
// ============================================================================

// ❌ TODO está en una sola clase sin boundaries
// La UI, la lógica y los datos están completamente mezclados
class GameApp {
  // "Base de datos" mezclada con la app
  private players: { name: string; score: number; level: number }[] = [];

  // ❌ Un método que hace UI + Lógica + Datos TODO junto
  addPlayer(name: string): void {
    // ❌ VALIDACIÓN DE NEGOCIO (lógica)
    if (name.length < 2) {
      // ❌ FORMATO DE UI dentro de la lógica
      console.log(`\n  ┌──────────────────────────────┐`);
      console.log(`  │ ❌ ERROR: Nombre muy corto   │`);
      console.log(`  └──────────────────────────────┘`);
      return;
    }

    // ❌ ACCESO A DATOS (persistencia)
    const existingPlayer = this.players.find((p) => p.name === name);
    if (existingPlayer) {
      // ❌ FORMATO DE UI dentro de acceso a datos
      console.log(`\n  ┌──────────────────────────────┐`);
      console.log(`  │ ❌ ERROR: Jugador ya existe   │`);
      console.log(`  └──────────────────────────────┘`);
      return;
    }

    // ❌ LÓGICA DE NEGOCIO (inicialización de jugador)
    const newPlayer = { name, score: 0, level: 1 };

    // ❌ ACCESO A DATOS
    this.players.push(newPlayer);

    // ❌ FORMATO DE UI
    console.log(`\n  ┌──────────────────────────────┐`);
    console.log(`  │ ✅ Jugador ${name.padEnd(16)} OK │`);
    console.log(`  └──────────────────────────────┘`);
  }

  // ❌ Otro método que mezcla TODO
  playRound(playerName: string, points: number): void {
    // ❌ DATOS: buscar jugador
    const player = this.players.find((p) => p.name === playerName);
    if (!player) {
      console.log(`\n  ❌ Jugador ${playerName} no encontrado`);
      return;
    }

    // ❌ LÓGICA: calcular puntaje y nivel
    player.score += points;
    // Regla de negocio: cada 100 puntos sube de nivel
    const newLevel = Math.floor(player.score / 100) + 1;
    const leveledUp = newLevel > player.level;
    player.level = newLevel;

    // ❌ UI: mostrar resultado con formato específico
    console.log(`\n  🎮 ${player.name} ganó ${points} puntos!`);
    console.log(`     Score: ${player.score} | Level: ${player.level}`);
    if (leveledUp) {
      console.log(`     🎉 ¡¡¡SUBIÓ AL NIVEL ${player.level}!!! 🎉`);
    }
  }

  // ❌ Ranking mezclando UI + datos + lógica de ordenamiento
  showRanking(): void {
    // ❌ LÓGICA + DATOS: ordenar jugadores
    const sorted = [...this.players].sort((a, b) => b.score - a.score);

    // ❌ UI: formato de tabla hardcodeado
    console.log(`\n  ╔══════════════════════════════╗`);
    console.log(`  ║      🏆 RANKING GLOBAL       ║`);
    console.log(`  ╠══════════════════════════════╣`);
    sorted.forEach((p, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  ";
      console.log(
        `  ║ ${medal} ${p.name.padEnd(12)} Lv.${String(p.level).padEnd(3)} ${String(p.score).padStart(5)}pts ║`
      );
    });
    console.log(`  ╚══════════════════════════════╝`);
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO - Sin Boundaries");
  console.log("=".repeat(55));

  const app = new GameApp();

  app.addPlayer("Mario");
  app.addPlayer("Luigi");
  app.addPlayer("Peach");

  app.playRound("Mario", 85);
  app.playRound("Luigi", 120);
  app.playRound("Peach", 95);
  app.playRound("Mario", 45);

  app.showRanking();

  console.log("\n⚠️  PROBLEMAS:");
  console.log("  ❌ Si cambias el formato de UI, tocas código de lógica de negocio");
  console.log("  ❌ Si cambias la BD (array → SQL), tocas código de UI");
  console.log("  ❌ No puedes reusar la lógica de scoring en otro proyecto");
  console.log("  ❌ No puedes testear las reglas de nivel sin el formato de consola");
  console.log("  ❌ No hay BOUNDARIES: todo cambia junto por cualquier razón");
}

main();
