// ============================================================================
// ✅ BUEN EJEMPLO: Screaming Architecture (La Arquitectura Grita el Propósito)
// ============================================================================
// 📖 PRINCIPIO (Clean Architecture Cap. 21):
//    "La arquitectura debe GRITAR el propósito del sistema"
//
//    ✅ Estructura que grita "TIENDA DE VIDEOJUEGOS":
//
//    game-store/
//    ├── catalog/              ← 🎮 "¡Vendemos JUEGOS!"
//    │   ├── entities/
//    │   ├── usecases/
//    │   └── adapters/
//    ├── purchase/             ← 🛒 "¡Los COMPRAMOS!"
//    │   ├── entities/
//    │   ├── usecases/
//    │   └── adapters/
//    └── player-profile/       ← 👤 "¡Los JUGADORES tienen perfiles!"
//        ├── entities/
//        ├── usecases/
//        └── adapters/
//
//    Pregunta: ¿Qué HACE este sistema? ¡TIENDA DE VIDEOJUEGOS! 🎮
// ============================================================================

// ============================================================================
// 🎮 MÓDULO: CATALOG (Catálogo de Juegos)
// Al ver esta carpeta SABES que el sistema maneja un catálogo de juegos
// ============================================================================
namespace Catalog {
  // ── Entity ──
  // Regla de negocio: un juego tiene precio, plataforma y stock
  export class Game {
    constructor(
      public readonly id: string,
      public readonly title: string,
      public readonly price: number,
      public readonly platform: string,
      private _stock: number
    ) { }

    // Regla de negocio: ¿está disponible para compra?
    isAvailable(): boolean {
      return this._stock > 0;
    }

    // Regla de negocio: reservar una unidad
    reserveUnit(): void {
      if (!this.isAvailable()) {
        throw new Error(`${this.title} no tiene stock disponible`);
      }
      this._stock--;
    }

    get stock(): number {
      return this._stock;
    }
  }

  // ── Interface (puerto) ──
  export interface GameRepository {
    findAll(): Game[];
    findById(id: string): Game | null;
  }

  // ── Use Case ──
  export class BrowseCatalog {
    constructor(private gameRepo: GameRepository) { }

    execute(): { id: string; title: string; price: number; platform: string; available: boolean }[] {
      return this.gameRepo.findAll().map((game) => ({
        id: game.id,
        title: game.title,
        price: game.price,
        platform: game.platform,
        available: game.isAvailable(),
      }));
    }
  }

  // ── Adapter (implementación) ──
  export class InMemoryGameRepository implements GameRepository {
    private games: Game[] = [
      new Game("G1", "Zelda TOTK", 59.99, "Switch", 15),
      new Game("G2", "God of War Ragnarök", 49.99, "PS5", 8),
      new Game("G3", "Halo Infinite", 39.99, "Xbox", 20),
      new Game("G4", "Elden Ring", 54.99, "PC", 0), // Sin stock
    ];

    findAll(): Game[] {
      return this.games;
    }

    findById(id: string): Game | null {
      return this.games.find((g) => g.id === id) || null;
    }
  }
}

// ============================================================================
// 🛒 MÓDULO: PURCHASE (Compras)
// Al ver esta carpeta SABES que el sistema maneja compras
// ============================================================================
namespace Purchase {
  // ── Entity ──
  export class PurchaseOrder {
    public readonly id: string;
    public readonly date: string;

    constructor(
      public readonly playerId: string,
      public readonly gameTitle: string,
      public readonly amount: number
    ) {
      this.id = `PO-${Date.now()}`;
      this.date = new Date().toISOString();
    }
  }

  // ── Use Case ──
  export interface PurchaseResult {
    success: boolean;
    order?: PurchaseOrder;
    error?: string;
  }

  export class BuyGame {
    constructor(private gameRepo: Catalog.GameRepository) { }

    execute(playerId: string, gameId: string, playerBalance: number): PurchaseResult {
      // Buscar el juego
      const game = this.gameRepo.findById(gameId);
      if (!game) {
        return { success: false, error: "Juego no encontrado" };
      }

      // Verificar disponibilidad
      if (!game.isAvailable()) {
        return { success: false, error: `${game.title} sin stock` };
      }

      // Verificar saldo
      if (playerBalance < game.price) {
        return {
          success: false,
          error: `Saldo insuficiente ($${playerBalance} < $${game.price})`,
        };
      }

      // Realizar la compra
      game.reserveUnit();
      const order = new PurchaseOrder(playerId, game.title, game.price);

      return { success: true, order };
    }
  }
}

// ============================================================================
// 👤 MÓDULO: PLAYER PROFILE (Perfiles de Jugador)
// Al ver esta carpeta SABES que el sistema maneja perfiles de jugadores
// ============================================================================
namespace PlayerProfile {
  // ── Entity ──
  export class Player {
    public purchaseHistory: string[] = [];

    constructor(
      public readonly id: string,
      public readonly name: string,
      public readonly email: string,
      public balance: number
    ) { }

    // Regla de negocio: nivel VIP basado en compras
    getVipLevel(): string {
      if (this.purchaseHistory.length >= 10) return "💎 Diamond";
      if (this.purchaseHistory.length >= 5) return "🥇 Gold";
      if (this.purchaseHistory.length >= 2) return "🥈 Silver";
      return "🆕 Newbie";
    }

    addPurchase(gameTitle: string, amount: number): void {
      this.purchaseHistory.push(gameTitle);
      this.balance -= amount;
    }
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO - Screaming Architecture");
  console.log("=".repeat(55));

  console.log("\n📂 ESTRUCTURA DEL PROYECTO:");
  console.log("  game-store/");
  console.log("  ├── catalog/          ← 🎮 Catálogo de juegos");
  console.log("  │   ├── Game (entity)");
  console.log("  │   ├── BrowseCatalog (use case)");
  console.log("  │   └── InMemoryGameRepo (adapter)");
  console.log("  ├── purchase/         ← 🛒 Compras");
  console.log("  │   ├── PurchaseOrder (entity)");
  console.log("  │   └── BuyGame (use case)");
  console.log("  └── player-profile/   ← 👤 Perfiles");
  console.log("      └── Player (entity)");
  console.log('\n  🎯 ¿Qué hace? ¡TIENDA DE VIDEOJUEGOS! Lo ves en 2 segundos.\n');

  // Composición
  const gameRepo = new Catalog.InMemoryGameRepository();
  const browseCatalog = new Catalog.BrowseCatalog(gameRepo);
  const buyGame = new Purchase.BuyGame(gameRepo);
  const player = new PlayerProfile.Player("P1", "GamerPro99", "gamer@pro.com", 150);

  // 1. Explorar catálogo
  console.log("  📋 CATÁLOGO:");
  const catalog = browseCatalog.execute();
  catalog.forEach((game) => {
    const status = game.available ? "✅" : "❌ AGOTADO";
    console.log(`     ${status} ${game.title} - $${game.price} (${game.platform})`);
  });

  // 2. Comprar un juego
  console.log("\n  🛒 COMPRANDO Zelda TOTK:");
  const result = buyGame.execute(player.id, "G1", player.balance);
  if (result.success && result.order) {
    player.addPurchase(result.order.gameTitle, result.order.amount);
    console.log(`     ✅ ${result.order.gameTitle} comprado por $${result.order.amount}`);
    console.log(`     💰 Saldo restante: $${player.balance.toFixed(2)}`);
  }

  // 3. Intentar comprar juego sin stock
  console.log("\n  🛒 COMPRANDO Elden Ring (sin stock):");
  const result2 = buyGame.execute(player.id, "G4", player.balance);
  if (!result2.success) {
    console.log(`     ❌ ${result2.error}`);
  }

  // 4. Perfil del jugador
  console.log(`\n  👤 PERFIL: ${player.name}`);
  console.log(`     Nivel VIP: ${player.getVipLevel()}`);
  console.log(`     Compras: ${player.purchaseHistory.join(", ")}`);

  console.log("\n🎯 BENEFICIOS DE SCREAMING ARCHITECTURE:");
  console.log("  ✅ Abres el proyecto y ves: catalog/, purchase/, player-profile/");
  console.log('  ✅ Grita "TIENDA DE VIDEOJUEGOS", no "uso Express"');
  console.log("  ✅ Un nuevo dev entiende el dominio en SEGUNDOS");
  console.log("  ✅ Cada módulo se puede deployar independientemente");
  console.log("  ✅ Los Use Cases son descriptivos: BrowseCatalog, BuyGame");
}

main();
