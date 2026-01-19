# PARTE 7: WEB, FRAMEWORKS, CASO DE ESTUDIO Y ORGANIZACIÓN DE CÓDIGO

## Contexto
Esta parte cubre los **Capítulos 31-34**: The Web is a Detail, Frameworks are Details, Case Study: Video Sales, The Missing Chapter (por Simon Brown)

**Perfil del lector:** Desarrollador Backend Semi-Senior que quiere pasar a Senior.

---

## LECCIONES ORDENADAS POR IMPACTO (De Mayor a Menor)

---

### 1. ¡NO TE CASES CON EL FRAMEWORK!
**Impacto: CRÍTICO - Define tu relación con ASP.NET, Spring, NestJS, etc.**

"La relación entre tú y el autor del framework es extraordinariamente asimétrica. TÚ haces un compromiso enorme. El framework no te promete NADA."

**Los riesgos del matrimonio:**
```
1. Arquitectura sucia: El framework viola la Regla de Dependencia
   → Te pide heredar sus clases en TUS Entities

2. Superarás al framework: Tu producto crecerá
   → El framework peleará contra ti

3. Evolución incompatible: El framework cambiará
   → Features que usas pueden desaparecer

4. Llegará algo mejor: Aparecerá un framework mejor
   → Estarás atrapado
```

**Aplicación práctica:**
```csharp
// MAL: "Casado" con ASP.NET - @autowired en lógica de negocio
public class CrearFacturaService {
    [Inject]  // Spring/NestJS conocido en dominio
    private IFacturaRepository _repo;

    [FromServices]  // ASP.NET conocido en dominio
    public IEmailService _email;
}

// BIEN: Framework solo en Main/Composition Root
public class CrearFacturaService {
    private readonly IFacturaRepository _repo;
    private readonly IEmailService _email;

    // Constructor injection - no hay atributos de framework
    public CrearFacturaService(IFacturaRepository repo, IEmailService email) {
        _repo = repo;
        _email = email;
    }
}

// En Program.cs (el único lugar que conoce el framework)
services.AddScoped<CrearFacturaService>();
services.AddScoped<IFacturaRepository, SqlFacturaRepository>();
```

**Frameworks con los que SÍ debes casarte:**
```
✓ Librería estándar del lenguaje (BCL en .NET, java.util en Java)
✓ STL en C++
✓ Estos son inevitables - pero decide conscientemente
```

**Regla de pared:**
> "No dejes que el framework entre en tu código core. Intégralo como un PLUGIN que sigue la Regla de Dependencia."

---

### 2. LA WEB ES UN DETALLE - ES SOLO OTRO DISPOSITIVO DE I/O
**Impacto: CRÍTICO**

"La Web es simplemente una de muchas oscilaciones en la lucha entre centralizar y distribuir el poder de cómputo. Desde los años 60, vamos y venimos."

**El péndulo histórico:**
```
1960s: Mainframes + terminales tontas
1980s: PCs + terminales inteligentes
1990s: Web + browsers tontos (HTML puro)
2000s: Web 2.0 + browsers inteligentes (AJAX)
2010s: SPAs + lógica en browser
2020s: SSR + lógica en servidor (Next.js, Blazor)

→ El ciclo SIEMPRE se repite
→ Tu lógica de negocio debe sobrevivir a todos estos cambios
```

**El caso de "Company Q":**
```
1. Tenían app de finanzas con GUI desktop exitosa
2. Llegó la web → Cambiaron UI para verse como browser
3. Usuarios lo odiaron
4. Tuvieron que revertir

LECCIÓN: Si tu lógica de negocio está acoplada a la UI,
         cambiar la UI = reescribir el sistema
```

**Aplicación práctica:**
```csharp
// MAL: Lógica acoplada a HTTP/Web
public class FacturaController : ControllerBase {
    public IActionResult CrearFactura([FromBody] FacturaDto dto) {
        // Lógica de negocio mezclada con HTTP
        if (!ModelState.IsValid) return BadRequest();

        var factura = new Factura(dto.Cliente, dto.Items);
        factura.CalcularImpuestos();  // Lógica aquí
        _db.Facturas.Add(factura);
        _db.SaveChanges();

        return CreatedAtAction(nameof(Get), new { id = factura.Id });
    }
}

// BIEN: Lógica independiente de la Web
// Use Case (no sabe que existe HTTP)
public class CrearFacturaUseCase {
    public CrearFacturaResponse Execute(CrearFacturaRequest request) {
        var factura = new Factura(request.Cliente, request.Items);
        factura.CalcularImpuestos();
        _repo.Guardar(factura);
        return new CrearFacturaResponse(factura.Id);
    }
}

// Controller es solo un adaptador
public class FacturaController : ControllerBase {
    public IActionResult Post([FromBody] FacturaDto dto) {
        var request = _mapper.ToRequest(dto);
        var response = _useCase.Execute(request);
        return CreatedAtAction(nameof(Get), new { id = response.Id });
    }
}
```

**Regla de pared:**
> "La Web es un dispositivo de I/O. Trata tu aplicación como device-independent, igual que en los años 60."

---

### 3. PACKAGE BY COMPONENT - LA ORGANIZACIÓN SUPERIOR
**Impacto: ALTO - Define cómo estructurar tu código**

"Hay 4 formas de organizar código. Solo una combina lo mejor de todas."

**Las 4 formas de organizar código:**

```
1. PACKAGE BY LAYER (Por capas horizontales)
   ├── controllers/
   │   └── OrdersController.cs
   ├── services/
   │   └── OrdersService.cs
   └── repositories/
       └── OrdersRepository.cs

   PROBLEMA: No grita el dominio, facilita bypasses

2. PACKAGE BY FEATURE (Por features verticales)
   └── orders/
       ├── OrdersController.cs
       ├── OrdersService.cs
       └── OrdersRepository.cs

   PROBLEMA: Todo es público, no hay encapsulación real

3. PORTS AND ADAPTERS (Hexagonal)
   ├── domain/
   │   ├── Orders.cs (interface)
   │   └── OrdersService.cs
   └── infrastructure/
       ├── OrdersController.cs
       └── JdbcOrdersRepository.cs

   PROBLEMA: Infrastructure puede bypasear domain internamente

4. PACKAGE BY COMPONENT ★ (La mejor)
   ├── web/
   │   └── OrdersController.cs
   └── orders/
       ├── OrdersComponent.cs (interface pública)
       ├── OrdersServiceImpl.cs (internal)
       └── OrdersRepository.cs (internal)

   VENTAJA: Compilador enforcea arquitectura
```

**Aplicación práctica en .NET:**
```csharp
// PACKAGE BY COMPONENT

// Proyecto: Orders.Component
namespace Orders;

// ÚNICA clase pública - punto de entrada
public interface IOrdersComponent {
    OrderDto GetOrder(int id);
    void CreateOrder(CreateOrderRequest request);
}

public class OrdersComponent : IOrdersComponent {
    private readonly OrdersService _service;
    private readonly IOrdersRepository _repo;

    public OrdersComponent(IOrdersRepository repo) {
        _repo = repo;
        _service = new OrdersService(_repo);
    }

    public OrderDto GetOrder(int id) => _service.GetOrder(id);
    public void CreateOrder(CreateOrderRequest r) => _service.Create(r);
}

// INTERNAL - nadie fuera del assembly puede acceder
internal class OrdersService {
    private readonly IOrdersRepository _repo;
    internal OrdersService(IOrdersRepository repo) => _repo = repo;
    internal OrderDto GetOrder(int id) { ... }
    internal void Create(CreateOrderRequest r) { ... }
}

internal interface IOrdersRepository {
    Order Find(int id);
    void Save(Order order);
}

internal class SqlOrdersRepository : IOrdersRepository {
    internal Order Find(int id) { ... }
    internal void Save(Order order) { ... }
}
```

**Regla de pared:**
> "Usa `internal` (C#) o package-private (Java) agresivamente. El compilador es tu guardián arquitectónico."

---

### 4. SI TODO ES PÚBLICO, TODAS LAS ARQUITECTURAS SON IGUALES
**Impacto: ALTO**

"Si marcas todos tus tipos como `public`, los packages son solo carpetas, no encapsulación. Las 4 arquitecturas se vuelven idénticas."

**El problema del "Relaxed Layered Architecture":**
```csharp
// Un desarrollador nuevo llega y hace esto:
public class OrdersController {
    // Bypass del servicio - va directo al repositorio
    private readonly IOrdersRepository _repo;  // ¡Legal si es public!

    public IActionResult Get(int id) {
        // Bypasea toda la lógica de negocio
        return Ok(_repo.Find(id));
    }
}

// Resultado: Las reglas de negocio no se aplican
// El compilador NO te protege
```

**Aplicación práctica:**
```csharp
// ANTES: Todo público (el compilador no ayuda)
public interface IOrdersRepository { }
public class SqlOrdersRepository : IOrdersRepository { }
public class OrdersService { }
public class OrdersController { }
// → Cualquiera puede llamar a cualquiera

// DESPUÉS: Encapsulación real (el compilador protege)

// Assembly: Orders.Api (solo esto es público al exterior)
public interface IOrdersComponent { }

// Assembly: Orders.Domain (internal al assembly)
internal class OrdersService { }

// Assembly: Orders.Infrastructure (internal al assembly)
internal interface IOrdersRepository { }
internal class SqlOrdersRepository : IOrdersRepository { }

// Resultado: Controller SOLO puede usar IOrdersComponent
// El compilador IMPIDE bypasses
```

**Regla de pared:**
> "El diablo está en los detalles de implementación. Usa modificadores de acceso para que el COMPILADOR enforce tu arquitectura."

---

### 5. CASO DE ESTUDIO: SEPARACIÓN POR ACTORES Y REGLA DE DEPENDENCIA
**Impacto: MEDIO-ALTO**

El caso de estudio de Video Sales muestra cómo aplicar todo junto.

**Identificar actores (SRP):**
```
Sistema de venta de videos:
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   Viewer    │  Purchaser  │   Author    │    Admin    │
│  (Ve videos)│(Compra lic.)│(Sube videos)│(Gestiona)   │
└─────────────┴─────────────┴─────────────┴─────────────┘

Cada actor = fuente de cambio diferente
→ Particiona el sistema para que cambios de un actor
  NO afecten a los otros
```

**Arquitectura de componentes:**
```
                    ┌─────────────────────────┐
                    │         VIEWS           │
                    │  ┌───┐ ┌───┐ ┌───┐ ┌───┐│
                    │  │ V │ │ P │ │ A │ │Ad ││
                    │  └───┘ └───┘ └───┘ └───┘│
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │       PRESENTERS        │
                    │  ┌───┐ ┌───┐ ┌───┐ ┌───┐│
                    │  │ V │ │ P │ │ A │ │Ad ││
                    │  └───┘ └───┘ └───┘ └───┘│
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │       INTERACTORS       │
                    │  ┌───┐ ┌───┐ ┌───┐ ┌───┐│
                    │  │ V │ │ P │ │ A │ │Ad ││ ← Políticas de alto nivel
                    │  └───┘ └───┘ └───┘ └───┘│
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │       CONTROLLERS       │
                    │  ┌───┐ ┌───┐ ┌───┐ ┌───┐│
                    │  │ V │ │ P │ │ A │ │Ad ││
                    │  └───┘ └───┘ └───┘ └───┘│
                    └─────────────────────────┘

V=Viewer, P=Purchaser, A=Author, Ad=Admin
```

**Las flechas de dependencia:**
```
- "Using" arrows → con el flujo de control
- "Inheritance" arrows → CONTRA el flujo de control

Esto implementa Open-Closed Principle:
Cambios en detalles de bajo nivel NO afectan políticas de alto nivel
```

**Regla de pared:**
> "Dos dimensiones de separación: (1) Por actores (SRP), (2) Por niveles de política (Dependency Rule)."

---

### 6. LA ANÉCDOTA DE LA BASE DE DATOS RELACIONAL
**Impacto: MEDIO - Lección de humildad**

Uncle Bob cuenta cómo peleó contra poner una RDBMS en un sistema que no la necesitaba técnicamente... y perdió.

**La lección:**
```
Técnicamente: Random access files eran suficientes
Realidad: Los clientes ESPERABAN una RDBMS
         Era un "checkbox item" en sus listas de compra

Qué debió hacer:
✓ Poner la RDBMS "al lado" del sistema como plugin
✓ Proveer un canal de datos estrecho y seguro
✓ Mantener los random access files en el core

Qué hizo:
✗ Renunció y se hizo consultor
```

**Aplicación práctica:**
```csharp
// Cuando el mercado exige algo que técnicamente no necesitas:
// → NO lo metas en el core
// → Ponlo como un plugin/adapter externo

// Ejemplo: Cliente exige ElasticSearch aunque SQL es suficiente
public interface IFacturaQuery {
    IEnumerable<FacturaDto> Buscar(string texto);
}

// Implementación SQL (que es suficiente)
internal class SqlFacturaQuery : IFacturaQuery { }

// "Plugin" de ElasticSearch (para satisfacer al cliente)
internal class ElasticFacturaQuery : IFacturaQuery { }

// El core NO sabe cuál se usa
```

**Regla de pared:**
> "A veces el mercado exige cosas irracionales. Ponlas como plugins externos, no las integres al core."

---

### 7. SEPARAR SOURCE TREES PARA ENFORCING MÁS ESTRICTO
**Impacto: MEDIO**

Puedes ir más allá de modificadores de acceso separando código en diferentes proyectos/módulos.

**Estructura de source trees:**
```
Opción 1: Tres proyectos
src/
├── Domain/           # Código de negocio puro
│   ├── Orders/
│   └── Billing/
├── Web/              # Dependencia → Domain
│   └── Controllers/
└── Data/             # Dependencia → Domain
    └── Repositories/

Opción 2: Dos proyectos (más simple)
src/
├── Domain/           # "Inside" - independiente
└── Infrastructure/   # "Outside" - depende de Domain
```

**El anti-patrón "Périphérique":**
```
⚠️ CUIDADO con un solo proyecto Infrastructure:

Infrastructure/
├── Controllers/
└── Repositories/

→ Controller puede llamar directo a Repository
→ Bypasea el Domain completamente
→ El "ring road" alrededor de Paris

SOLUCIÓN: Usa modificadores de acceso AUNQUE tengas proyectos separados
```

**Regla de pared:**
> "Separar proyectos ayuda, pero no es suficiente. Combínalo con modificadores de acceso apropiados."

---

## RESUMEN EJECUTIVO - REGLA DE PARED

```
╔══════════════════════════════════════════════════════════════╗
║  LAS 7 REGLAS DE CLEAN ARCHITECTURE - PARTE 7               ║
╠══════════════════════════════════════════════════════════════╣
║  1. NO te cases con el Framework                             ║
║     → Mantenlo en el círculo externo como plugin             ║
║                                                              ║
║  2. La Web es un detalle de I/O                              ║
║     → Tu lógica debe sobrevivir al próximo cambio de UI      ║
║                                                              ║
║  3. Package by Component es superior                         ║
║     → Combina beneficios de layers + features + hexagonal    ║
║                                                              ║
║  4. Si todo es public, arquitectura = ilusión                ║
║     → Usa internal/package-private agresivamente             ║
║                                                              ║
║  5. Separa por Actores (SRP) Y por Niveles (DIP)             ║
║     → Dos dimensiones de separación                          ║
║                                                              ║
║  6. Exigencias irracionales van como plugins                 ║
║     → No contamines el core con requisitos de marketing      ║
║                                                              ║
║  7. Separar proyectos + modificadores de acceso              ║
║     → Usa ambos, no solo uno                                 ║
╚══════════════════════════════════════════════════════════════╝
```

---

## ACCIONES INMEDIATAS

1. **Hoy:** Busca `[Inject]`, `@Autowired`, `[FromServices]` en tu código de dominio. Si los encuentras, tu dominio está "casado" con el framework.

2. **Esta semana:** Revisa tus clases. ¿Cuántas son `public` que deberían ser `internal`? Cada clase pública es una dependencia potencial no controlada.

3. **Este mes:** Experimenta con "Package by Component": Crea un componente con UNA interface pública y todo lo demás internal. Observa cómo el compilador previene bypasses.
