// ============================================================================
// ❌ MAL EJEMPLO: La Arquitectura NO Grita el Propósito
// ============================================================================
// 📖 PRINCIPIO (Clean Architecture Cap. 21):
//    "La arquitectura debe GRITAR el propósito del sistema,
//     NO el framework que usas"
//
//    Cuando abres el proyecto, deberías ver:
//    ❌ MAL: "Este proyecto usa Express" (routes/, controllers/, models/)
//    ✅ BIEN: "Este proyecto procesa PAGOS" (payment/, refund/, invoice/)
//
// 🚨 PROBLEMA: La estructura de carpetas grita "uso MVC con Express"
//    en vez de gritar "gestiono una tienda de videojuegos".
//    No puedes entender el DOMINIO mirando las carpetas.
// ============================================================================

// ❌ Estructura que GRITA "uso MVC":
//
//    proyecto/
//    ├── routes/          ← ¿Qué rutas? ¿De qué?
//    ├── controllers/     ← ¿Controllers de qué dominio?
//    ├── models/          ← ¿Modelos de qué negocio?
//    ├── middlewares/     ← Framework detail
//    ├── utils/           ← Cajón de sastre
//    └── helpers/         ← Más cajón de sastre
//
//    Pregunta: ¿Qué HACE este sistema? No tienes idea.
//    Solo sabes que usa algo tipo Express/MVC.

// ── SIMULAMOS LA ESTRUCTURA "MVC" ──────────────────────────────────────

// ❌ "models/" - todo junto sin contexto de dominio
namespace Models {
  export interface Game {
    id: string;
    title: string;
    price: number;
    platform: string;
    stock: number;
  }

  export interface User {
    id: string;
    name: string;
    email: string;
    balance: number;
  }

  export interface Purchase {
    id: string;
    userId: string;
    gameId: string;
    amount: number;
    date: string;
  }
}

// ❌ "controllers/" - lógica de negocio mezclada con request/response
namespace Controllers {
  // ❌ ¿Controller de qué dominio? El nombre no dice nada del negocio
  export function gameController_getAll(): Models.Game[] {
    return [
      { id: "G1", title: "Zelda TOTK", price: 59.99, platform: "Switch", stock: 15 },
      { id: "G2", title: "God of War", price: 49.99, platform: "PS5", stock: 8 },
      { id: "G3", title: "Halo Infinite", price: 39.99, platform: "Xbox", stock: 20 },
    ];
  }

  export function purchaseController_buy(
    userId: string,
    gameId: string
  ): { status: string; message: string } {
    // ❌ Toda la lógica de compra está AQUÍ en el controller
    const games = gameController_getAll();
    const game = games.find((g) => g.id === gameId);

    if (!game) return { status: "error", message: "Juego no encontrado" };
    if (game.stock <= 0) return { status: "error", message: "Sin stock" };

    // ❌ Regla de negocio enterrada en un controller genérico
    const user: Models.User = {
      id: userId,
      name: "Player1",
      email: "p1@game.com",
      balance: 100,
    };

    if (user.balance < game.price) {
      return { status: "error", message: "Saldo insuficiente" };
    }

    return {
      status: "ok",
      message: `Compra exitosa: ${game.title} por $${game.price}`,
    };
  }
}

// ❌ "routes/" - rutas genéricas sin contexto de dominio
namespace Routes {
  export function setupRoutes(): void {
    console.log("  📂 GET  /api/games");
    console.log("  📂 POST /api/purchases");
    console.log("  📂 GET  /api/users/:id");
    // ❌ Las rutas son el único lugar donde ves algo de "dominio"
    // pero están escondidas en strings, no en la estructura
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO - Screaming Architecture");
  console.log("=".repeat(55));
  console.log("\n📂 ESTRUCTURA DEL PROYECTO:");
  console.log("  proyecto/");
  console.log("  ├── routes/          ← ¿Rutas de qué?");
  console.log("  ├── controllers/     ← ¿Controllers de qué?");
  console.log("  ├── models/          ← ¿Modelos de qué negocio?");
  console.log("  ├── middlewares/     ← Detalle de framework");
  console.log("  └── utils/           ← Cajón de sastre");
  console.log('\n  🤔 ¿Qué hace este sistema? No se sabe. Solo "usa MVC".');

  console.log("\n🛒 Simulando una compra (lógica en controllers/):");
  Routes.setupRoutes();

  const games = Controllers.gameController_getAll();
  console.log(`\n  🎮 Juegos disponibles: ${games.map((g) => g.title).join(", ")}`);

  const result = Controllers.purchaseController_buy("U1", "G1");
  console.log(`  📦 ${result.message}`);

  console.log("\n⚠️  PROBLEMAS:");
  console.log('  ❌ La estructura grita "MVC" no "TIENDA DE VIDEOJUEGOS"');
  console.log('  ❌ Abres el proyecto y ves: routes, controllers, models');
  console.log("  ❌ No sabes si es un e-commerce, un banco, o un hospital");
  console.log("  ❌ La lógica de dominio está escondida dentro de controllers genéricos");
  console.log("  ❌ Un nuevo dev necesita leer TODO el código para entender el dominio");
}

main();
