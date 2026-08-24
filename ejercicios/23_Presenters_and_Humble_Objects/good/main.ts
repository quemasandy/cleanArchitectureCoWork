// ============================================================================
// 📦 COMPOSITION ROOT: main.ts (Punto de entrada)
// ============================================================================
// 📖 CONCEPTO: El Composition Root es donde se ENSAMBLAN todas las piezas.
//
//    Aquí se crean las implementaciones concretas y se inyectan
//    en las clases que dependen de interfaces.
//
//    Este archivo es el ÚNICO lugar que conoce TODAS las clases concretas.
//    Es el "director de orquesta" que dice:
//    "Tú (Presenter) vas a implementar el Output Port del Use Case"
//    "Tú (SQLGateway) vas a implementar el TransactionGateway"
//    "Tú (Listener) vas a usar este Interactor"
//
//    📌 ESTRUCTURA DE CARPETAS DE ESTE PROYECTO:
//
//    good/
//    ├── main.ts                              ← Estás aquí (Composition Root)
//    │
//    ├── domain/                              ← Capa INTERNA: Entities
//    │   └── entities/
//    │       ├── Transaction.ts               ← Entity: transacción bancaria
//    │       └── AccountData.ts               ← Entity: datos de cuenta
//    │
//    ├── application/                         ← Capa de APLICACIÓN: Use Cases + Ports
//    │   ├── ports/
//    │   │   ├── DashboardOutputPort.ts       ← Output Port (interfaz para Presenter)
//    │   │   ├── TransactionGateway.ts        ← Gateway Port (interfaz para BD)
//    │   │   └── PaymentReceivedEvent.ts      ← DTO de evento de pago
//    │   └── usecases/
//    │       ├── GetAccountDashboardUseCase.ts ← Use Case: obtener dashboard
//    │       ├── GetRecentTransactionsUseCase.ts ← Interactor testeable (BD)
//    │       └── ProcessPaymentUseCase.ts     ← Interactor testeable (servicios)
//    │
//    ├── adapters/                            ← Capa de ADAPTADORES
//    │   ├── presenters/
//    │   │   ├── AccountDashboardPresenter.ts ← Presenter (TESTEABLE)
//    │   │   └── viewmodels/
//    │   │       ├── DashboardViewModel.ts    ← ViewModel del dashboard
//    │   │       └── TransactionViewModel.ts  ← ViewModel de transacción
//    │   ├── views/
//    │   │   ├── DashboardView.ts             ← Interfaz de View
//    │   │   ├── ConsoleDashboardView.ts      ← View HUMBLE (consola)
//    │   │   └── HTMLDashboardView.ts         ← View HUMBLE (HTML)
//    │   └── gateways/
//    │       └── SQLTransactionGateway.ts     ← Gateway HUMBLE (BD)
//    │
//    └── infrastructure/                      ← Capa EXTERNA: Frameworks & Drivers
//        └── listeners/
//            └── PaymentServiceListener.ts    ← Listener HUMBLE (red)
//
//    📌 REGLA DE DEPENDENCIA:
//    Las flechas de importación SOLO apuntan HACIA ADENTRO:
//    infrastructure → adapters → application → domain
//    NUNCA al revés.
// ============================================================================

// ── Imports de ADAPTERS (capa 3) ──────────────────────────────────────────
// Estos imports son necesarios porque main.ts es el Composition Root
// y necesita conocer las implementaciones concretas para ensamblarlas
import { AccountDashboardPresenter } from "./adapters/presenters/AccountDashboardPresenter";
import { ConsoleDashboardView } from "./adapters/views/ConsoleDashboardView";
import { HTMLDashboardView } from "./adapters/views/HTMLDashboardView";
import { SQLTransactionGateway } from "./adapters/gateways/SQLTransactionGateway";

// ── Imports de APPLICATION (capa 2) ───────────────────────────────────────
// Los Use Cases que vamos a crear e inyectar con sus dependencias
import { GetAccountDashboardUseCase } from "./application/usecases/GetAccountDashboardUseCase";
import { GetRecentTransactionsUseCase } from "./application/usecases/GetRecentTransactionsUseCase";
import { ProcessPaymentUseCase } from "./application/usecases/ProcessPaymentUseCase";

// ── Import de INFRASTRUCTURE (capa 4) ────────────────────────────────────
// El Listener que recibe mensajes de la red
import { PaymentServiceListener } from "./infrastructure/listeners/PaymentServiceListener";

// ============================================================================
// 🏃 EJECUCIÓN: Ensamblar y ejecutar todas las piezas
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO - Presenters y Humble Object Pattern");
  console.log("   (Con estructura de carpetas de Clean Architecture)");
  console.log("=".repeat(60));

  // =============================================
  // PARTE 1: UI Boundary — Presenter + Humble View
  // =============================================
  // Demuestra: View (Humble) ↔ Presenter (Testeable)
  console.log("\n📦 PARTE 1: UI Boundary - Presenter + Humble View");
  console.log("─".repeat(55));

  // Paso 1: Crear el Presenter (implementa el Output Port)
  // El Presenter es TESTEABLE: recibe datos crudos → produce ViewModel formateado
  const presenter = new AccountDashboardPresenter();

  // Paso 2: Crear el Use Case e inyectar el Presenter como Output Port
  // El Use Case no sabe que es un Presenter, solo sabe que implementa DashboardOutputPort
  const dashboardUseCase = new GetAccountDashboardUseCase(presenter);

  // Paso 3: Ejecutar el Use Case
  // Los datos fluyen: Use Case → Output Port (Presenter) → ViewModel
  dashboardUseCase.execute("ACC-001");

  // Paso 4: Obtener el ViewModel ya formateado
  // Todo ya son strings y booleans listos para mostrar
  const viewModel = presenter.getViewModel()!;

  // Paso 5a: Renderizar con la View de CONSOLA (Humble Object)
  // La View solo imprime strings, CERO lógica de formateo
  console.log("\n  📺 RENDERIZANDO CON VISTA DE CONSOLA:");
  console.log("  " + "─".repeat(50));
  const consoleView = new ConsoleDashboardView(); // Vista humble de consola
  consoleView.render(viewModel); // Solo imprime strings del ViewModel

  // Paso 5b: Renderizar con la View de HTML (Humble Object)
  // ¡El MISMO ViewModel funciona para OTRA vista sin cambiar el Presenter!
  console.log("\n\n  🌐 RENDERIZANDO CON VISTA HTML (mismo ViewModel, 0 duplicación):");
  console.log("  " + "─".repeat(50));
  const htmlView = new HTMLDashboardView(); // Vista humble de HTML
  htmlView.render(viewModel); // Los MISMOS strings, diferente formato

  // =============================================
  // PARTE 2: Database Boundary — Gateway + Interactor
  // =============================================
  // Demuestra: Gateway (Humble) ↔ Interactor (Testeable)
  console.log("\n\n📦 PARTE 2: Database Boundary - Gateway Humble + Interactor Testeable");
  console.log("─".repeat(55));

  // El Gateway (humble) ejecuta SQL (difícil de testear)
  const gateway = new SQLTransactionGateway();

  // El Interactor (testeable) contiene la lógica de negocio
  const transactionsUseCase = new GetRecentTransactionsUseCase(gateway);

  // El Interactor delega la consulta al Gateway y luego filtra los resultados
  transactionsUseCase.execute("ACC-001");

  // =============================================
  // PARTE 3: Service Boundary — Listener + Interactor
  // =============================================
  // Demuestra: Listener (Humble) ↔ Interactor (Testeable)
  console.log("\n\n📦 PARTE 3: Service Boundary - Listener Humble + Interactor Testeable");
  console.log("─".repeat(55));

  // El Interactor (testeable) procesa la lógica del pago
  const paymentUseCase = new ProcessPaymentUseCase();

  // El Listener (humble) recibe mensajes de la red y los parsea
  const listener = new PaymentServiceListener(paymentUseCase);

  // Simula un mensaje JSON que llega de la red (ej: desde SQS, Kafka, etc.)
  const rawNetworkMessage = JSON.stringify({
    id: "PAY-001",              // ID del pago en el mensaje JSON
    account: "ACC-001",         // Cuenta destino en el JSON
    amount: 750,                // Monto en el JSON
    sender: "Carlos Mendoza",   // Remitente en el JSON
  });

  // El Listener parsea el JSON y delega al Interactor
  listener.onMessageReceived(rawNetworkMessage);

  // =============================================
  // RESUMEN DIDÁCTICO
  // =============================================
  console.log("\n\n" + "=".repeat(60));
  console.log("🎯 HUMBLE OBJECT PATTERN - Resumen del Capítulo 23");
  console.log("=".repeat(60));

  console.log(`
  📖 DEFINICIÓN:
     El Humble Object Pattern SEPARA lo difícil de testear
     de lo fácil de testear en cada BOUNDARY de la arquitectura.

  📺 ANALOGÍA DEL NOTICIERO:
     Reportero (Presenter)      = Investiga y redacta la noticia
     Teleprompter (ViewModel)   = Texto listo para leer
     Presentador TV (View)      = Solo LEE el teleprompter (humble)

  🔑 REGLA DEL PATRÓN:
     "Lo DIFÍCIL de testear → hacerlo HUMBLE (simple, sin lógica)"
     "La LÓGICA → ponerla en un módulo TESTEABLE"

  📌 DÓNDE APARECE EN CLEAN ARCHITECTURE:

     1. UI BOUNDARY:
        View (Humble) → solo muestra strings del ViewModel
        Presenter (Testeable) → formatea datos crudos → ViewModel

     2. DATABASE BOUNDARY:
        Gateway (Humble) → ejecuta SQL
        Interactor (Testeable) → lógica de negocio

     3. ORM BOUNDARY:
        Data Mapper (Humble) → convierte objetos ↔ tablas
        Entities (Testeable) → reglas de negocio puras

     4. SERVICE BOUNDARY:
        Listener (Humble) → recibe mensajes de la red
        Interactor (Testeable) → procesa los datos del mensaje

  📂 ESTRUCTURA DE CARPETAS:
     domain/          → Entities (capa más interna, sin dependencias)
     application/     → Use Cases + Ports (interfaces)
     adapters/        → Presenters, Views, Gateways
     infrastructure/  → Listeners, Frameworks, Drivers

  ✅ BENEFICIOS:
     • Cada archivo tiene UNA responsabilidad clara
     • El Presenter es 100% testeable SIN UI
     • La View es tan simple que "obviamente no tiene bugs"
     • Puedes agregar N vistas sin duplicar lógica
     • Las dependencias SIEMPRE apuntan hacia adentro

  💡 PREGUNTA CLAVE del Cap. 23:
     "¿Puedes testear la lógica de presentación SIN la UI?"
     Con Humble Object: ¡SÍ! Solo testeas el Presenter.
  `);
}

// Ejecuta el punto de entrada
main();
