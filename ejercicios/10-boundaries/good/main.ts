// ============================================================================
// ✅ BUEN EJEMPLO: Boundaries (Límites) bien definidos
// ============================================================================
// 📖 PRINCIPIO (Clean Architecture Cap. 17):
//    "Los límites se dibujan donde existe un eje de cambio"
//
//    Cada BOUNDARY separa cosas que cambian por diferentes razones:
//    - La UI puede cambiar de consola a web sin tocar la lógica
//    - La BD puede cambiar de array a SQL sin tocar la UI
//    - La lógica de juego se mantiene pura y testeable
//
// ✅ SOLUCIÓN: Tres capas con boundaries claros:
//    1. Game Logic (reglas puras, sin I/O)
//    2. Data Layer (persistencia, detrás de interface)
//    3. Presentation Layer (UI, consume la lógica)
// ============================================================================

// ============================================================================
// 🟢 BOUNDARY 1: GAME LOGIC (Núcleo - sin dependencias externas)
// Esta capa NO sabe sobre consola, BD, ni UI.
// Pura lógica de negocio que se puede testear con assert().
// ============================================================================

// ✅ Entity pura con reglas de negocio
class Player {
  constructor(
    public readonly name: string,
    public score: number = 0,
    public level: number = 1
  ) {
    if (name.length < 2) {
      throw new Error("El nombre debe tener al menos 2 caracteres");
    }
  }

  // ✅ Lógica de negocio pura: agregar puntos y calcular nivel
  addPoints(points: number): { leveledUp: boolean; newLevel: number } {
    this.score += points;
    const newLevel = Math.floor(this.score / 100) + 1;
    const leveledUp = newLevel > this.level;
    this.level = newLevel;
    return { leveledUp, newLevel };
  }
}

// ✅ Use Case puro: GameService orquesta la lógica del juego
// Solo trabaja con interfaces, no con implementaciones concretas
interface PlayerRepository {
  save(player: Player): void;
  findByName(name: string): Player | null;
  findAll(): Player[];
  exists(name: string): boolean;
}

// Resultado del Use Case - datos puros, sin formato de UI
interface AddPlayerResult {
  success: boolean;
  error?: string;
  playerName?: string;
}

interface PlayRoundResult {
  success: boolean;
  error?: string;
  playerName?: string;
  pointsEarned?: number;
  totalScore?: number;
  currentLevel?: number;
  leveledUp?: boolean;
}

interface RankingEntry {
  position: number;
  name: string;
  score: number;
  level: number;
}

class GameService {
  constructor(private playerRepo: PlayerRepository) { }

  // ✅ Lógica pura: agregar jugador
  addPlayer(name: string): AddPlayerResult {
    if (this.playerRepo.exists(name)) {
      return { success: false, error: "Jugador ya existe" };
    }
    try {
      const player = new Player(name);
      this.playerRepo.save(player);
      return { success: true, playerName: name };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  // ✅ Lógica pura: jugar ronda
  playRound(playerName: string, points: number): PlayRoundResult {
    const player = this.playerRepo.findByName(playerName);
    if (!player) {
      return { success: false, error: `Jugador ${playerName} no encontrado` };
    }
    const { leveledUp } = player.addPoints(points);
    this.playerRepo.save(player);
    return {
      success: true,
      playerName: player.name,
      pointsEarned: points,
      totalScore: player.score,
      currentLevel: player.level,
      leveledUp,
    };
  }

  // ✅ Lógica pura: obtener ranking
  getRanking(): RankingEntry[] {
    return this.playerRepo
      .findAll()
      .sort((a, b) => b.score - a.score)
      .map((p, i) => ({
        position: i + 1,
        name: p.name,
        score: p.score,
        level: p.level,
      }));
  }
}

// ============================================================================
// 🟡 BOUNDARY 2: DATA LAYER (Persistencia - implementa interface)
// Puede ser InMemory, SQLite, DynamoDB, etc.
// Cambiar de BD NO afecta la lógica ni la UI.
// ============================================================================

class InMemoryPlayerRepository implements PlayerRepository {
  private players: Map<string, Player> = new Map();

  save(player: Player): void {
    this.players.set(player.name, player);
  }

  findByName(name: string): Player | null {
    return this.players.get(name) || null;
  }

  findAll(): Player[] {
    return Array.from(this.players.values());
  }

  exists(name: string): boolean {
    return this.players.has(name);
  }
}

// ============================================================================
// 🔴 BOUNDARY 3: PRESENTATION LAYER (UI/Vista)
// Solo se encarga de FORMATEAR resultados del GameService.
// Puede ser consola, web, API, móvil, etc.
// Cambiar el formato de UI NO afecta la lógica ni la BD.
// ============================================================================

class ConsoleGameView {
  constructor(private gameService: GameService) { }

  // ✅ La vista SOLO formatea, la lógica está en GameService
  addPlayer(name: string): void {
    const result = this.gameService.addPlayer(name);
    if (result.success) {
      console.log(`\n  ┌──────────────────────────────┐`);
      console.log(`  │ ✅ Jugador ${name.padEnd(16)} OK │`);
      console.log(`  └──────────────────────────────┘`);
    } else {
      console.log(`\n  ┌──────────────────────────────┐`);
      console.log(`  │ ❌ ${(result.error || "").padEnd(25)}│`);
      console.log(`  └──────────────────────────────┘`);
    }
  }

  // ✅ La vista recibe datos puros y los formatea
  playRound(playerName: string, points: number): void {
    const result = this.gameService.playRound(playerName, points);
    if (!result.success) {
      console.log(`\n  ❌ ${result.error}`);
      return;
    }
    console.log(`\n  🎮 ${result.playerName} ganó ${result.pointsEarned} puntos!`);
    console.log(`     Score: ${result.totalScore} | Level: ${result.currentLevel}`);
    if (result.leveledUp) {
      console.log(`     🎉 ¡¡¡SUBIÓ AL NIVEL ${result.currentLevel}!!! 🎉`);
    }
  }

  // ✅ Solo formateo visual - la lógica de ranking está en GameService
  showRanking(): void {
    const ranking = this.gameService.getRanking();
    console.log(`\n  ╔══════════════════════════════╗`);
    console.log(`  ║      🏆 RANKING GLOBAL       ║`);
    console.log(`  ╠══════════════════════════════╣`);
    ranking.forEach((entry) => {
      const medal =
        entry.position === 1 ? "🥇" :
          entry.position === 2 ? "🥈" :
            entry.position === 3 ? "🥉" : "  ";
      console.log(
        `  ║ ${medal} ${entry.name.padEnd(12)} Lv.${String(entry.level).padEnd(3)} ${String(entry.score).padStart(5)}pts ║`
      );
    });
    console.log(`  ╚══════════════════════════════╝`);
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO - Boundaries bien definidos");
  console.log("=".repeat(55));

  // ✅ Composición: conectamos las 3 capas
  const repository = new InMemoryPlayerRepository(); // BOUNDARY 2: Datos
  const gameService = new GameService(repository);    // BOUNDARY 1: Lógica
  const view = new ConsoleGameView(gameService);      // BOUNDARY 3: UI

  // Mismo resultado que el mal ejemplo, pero con boundaries claros
  view.addPlayer("Mario");
  view.addPlayer("Luigi");
  view.addPlayer("Peach");

  view.playRound("Mario", 85);
  view.playRound("Luigi", 120);
  view.playRound("Peach", 95);
  view.playRound("Mario", 45);

  view.showRanking();

  console.log("\n🎯 BOUNDARIES:");
  console.log("  ✅ BOUNDARY 1 (Logic): GameService + Player (pura lógica, testeable)");
  console.log("  ✅ BOUNDARY 2 (Data): InMemoryRepo (intercambiable por SQL/DynamoDB)");
  console.log("  ✅ BOUNDARY 3 (UI): ConsoleGameView (intercambiable por Web/API)");
  console.log("  ✅ Cambiar la UI → solo tocas ConsoleGameView");
  console.log("  ✅ Cambiar la BD → solo tocas InMemoryPlayerRepository");
  console.log("  ✅ Las reglas del juego se prueban sin consola ni BD");
}

main();
