# PARTE 6: MAIN, SERVICIOS, TESTS Y ARQUITECTURA EMBEDDED

## Contexto
Esta parte cubre los **Capítulos 26-30**: Main Component, Services (Microservicios), Test Boundary, Clean Embedded Architecture, Database is a Detail

**Perfil del lector:** Desarrollador Backend Semi-Senior que quiere pasar a Senior.

---

## LECCIONES ORDENADAS POR IMPACTO (De Mayor a Menor)

---

### 1. MICROSERVICIOS NO SON ARQUITECTURA - LOS BOUNDARIES SÍ
**Impacto: CRÍTICO - Desmitifica la moda de microservicios**

"La arquitectura de un sistema se define por los boundaries que separan las políticas de alto nivel de los detalles de bajo nivel, NO por servicios."

**El problema del "Kitty Problem":**
```
Sistema de Taxis con microservicios:
┌─────────┐  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐
│ TaxiUI  │→ │ TaxiFinder  │→ │ TaxiSelector │→ │TaxiDispatcher │
└─────────┘  └─────────────┘  └──────────────┘  └───────────────┘

Nueva feature: "Entrega de gatitos"
→ ¿Cuántos servicios cambian? TODOS
→ Los servicios están ACOPLADOS por datos compartidos
→ NO son independientemente deployables
```

**Aplicación práctica:**
```csharp
// MAL: Servicios que son "monolitos pequeños"
public class TaxiService {
    // Todo mezclado, sin estructura interna
}

// BIEN: Servicios con arquitectura interna de componentes
public class TaxiService {
    // Componente base abstracto
    public abstract class RideHandler { }

    // Extensiones via plugins
    public class KittenDeliveryHandler : RideHandler { }
    public class StandardRideHandler : RideHandler { }
}
```

**Regla de pared:**
> "Los boundaries arquitectónicos NO están ENTRE servicios, sino DENTRO de ellos."

---

### 2. MAIN ES EL COMPONENTE MÁS SUCIO - Y ESO ESTÁ BIEN
**Impacto: ALTO**

"Main es el detalle más bajo nivel - el plugin más externo. Crea todo, configura todo, y entrega control al sistema de alto nivel."

**Responsabilidades de Main:**
```
MAIN debe hacer:
✓ Crear las Factories
✓ Instanciar las Strategies
✓ Configurar el Dependency Injection
✓ Cargar configuraciones (dev, test, prod)
✓ Entregar control a las políticas de alto nivel

MAIN NO debe tener:
✗ Lógica de negocio
✗ Reglas de aplicación
✗ Nada que otros componentes necesiten conocer
```

**Aplicación práctica:**
```csharp
// Main.cs - El componente más "sucio"
public class Program {
    public static void Main(string[] args) {
        // Main conoce TODAS las implementaciones concretas
        var config = LoadConfiguration(args);
        var db = new SqlFacturaRepository(config.ConnectionString);
        var email = new SmtpEmailSender(config.SmtpServer);
        var useCase = new CrearFacturaUseCase(db, email);
        var controller = new FacturaController(useCase);

        // Entrega control al sistema de alto nivel
        var app = new WebApplication(controller);
        app.Run();
    }
}
```

**Puedes tener múltiples Main:**
```
Main.Dev.cs      → Para desarrollo local
Main.Test.cs     → Para tests de integración
Main.Prod.cs     → Para producción
Main.Mexico.cs   → Para configuración de México
Main.Argentina.cs → Para configuración de Argentina
```

**Regla de pared:**
> "Piensa en Main como un PLUGIN de tu aplicación - el plugin que configura todo."

---

### 3. LOS TESTS SON PARTE DEL SISTEMA - DISEÑA PARA TESTEABILIDAD
**Impacto: ALTO**

"Los tests siguen la Regla de Dependencia - son el círculo más externo. Nada depende de ellos, pero ellos dependen de todo."

**El problema de tests frágiles:**
```
MAL: Tests acoplados a la GUI
┌──────────────────────────────────────────┐
│ Test: Login → Navegar → Buscar → Validar │
└──────────────────────────────────────────┘
       ↓
Si cambia la navegación = 1000 tests rotos

BIEN: Tests con Testing API
┌─────────────────────────────┐
│ Test: TestingAPI.ValidarX() │
└─────────────────────────────┘
       ↓
GUI cambia → Solo Testing API cambia → Tests intactos
```

**Aplicación práctica:**
```csharp
// MAL: Test acoplado estructuralmente
[Test]
public void TestCrearFactura() {
    var controller = new FacturaController();
    var request = new HttpRequest(...);  // Acoplado a HTTP
    controller.Post(request);
}

// BIEN: Test con Testing API
public interface ITestingAPI {
    void CrearFacturaDirecta(string cliente, decimal monto);
    void ForzarEstadoSistema(EstadoPrueba estado);
    void BypassSeguridad();  // Solo en tests
}

[Test]
public void TestCrearFactura() {
    _testApi.ForzarEstadoSistema(EstadoPrueba.ClienteExiste);
    _testApi.CrearFacturaDirecta("Cliente1", 1000m);
    Assert.That(_testApi.FacturaFueCreada());
}
```

**Regla de pared:**
> "No diseñar para testeabilidad es una decisión catastrófica."

---

### 4. FIRMWARE VS SOFTWARE - SEPARA EL CÓDIGO DEL HARDWARE
**Impacto: ALTO (Aplicable a TODO backend)**

"Firmware es código que depende del hardware. Software es código que puede vivir mucho tiempo. ¡Deja de escribir firmware!"

**Esto aplica a backend también:**
```
FIRMWARE (código atado a tecnología):
- SQL embebido en la lógica de negocio
- Dependencias de Android API en lógica de app
- Llamadas directas a AWS SDK en Use Cases
- HttpContext en servicios de dominio

SOFTWARE (código desacoplado):
- Lógica de negocio pura
- Interfaces para acceso a datos
- Abstracciones para servicios externos
```

**Aplicación práctica:**
```csharp
// FIRMWARE: Código atado a infraestructura
public class ProcesadorPagos {
    public void Procesar(Pago pago) {
        // Código mezclado con AWS SDK
        var sqs = new AmazonSQSClient();
        sqs.SendMessage(new SendMessageRequest { ... });

        // Código mezclado con SQL
        using var conn = new SqlConnection(connStr);
        conn.Execute("INSERT INTO Pagos...");
    }
}

// SOFTWARE: Código desacoplado
public class ProcesadorPagos {
    private readonly IMessageQueue _queue;
    private readonly IPagoRepository _repo;

    public void Procesar(Pago pago) {
        // Lógica pura - no sabe de AWS ni SQL
        _repo.Guardar(pago);
        _queue.Enviar(new PagoRecibido(pago.Id));
    }
}
```

**Hardware Abstraction Layer (HAL) para Backend:**
```csharp
// HAL: Abstrae los "detalles de hardware" del backend
public interface IStorageService {
    void GuardarArchivo(string nombre, byte[] contenido);
}

// Implementaciones intercambiables
public class S3StorageService : IStorageService { }
public class AzureBlobService : IStorageService { }
public class LocalFileService : IStorageService { }  // Para tests
```

**Regla de pared:**
> "Si cambiar de PostgreSQL a MongoDB requiere modificar lógica de negocio, tienes firmware, no software."

---

### 5. LA BASE DE DATOS ES UN DETALLE - EL MODELO DE DATOS NO
**Impacto: ALTO**

"La base de datos es solo un mecanismo para mover datos entre disco y RAM. No es arquitectónicamente significativa."

**La distinción crítica:**
```
MODELO DE DATOS (arquitectónicamente importante):
- Estructura de tus Entities
- Relaciones de negocio
- Reglas de integridad del dominio

BASE DE DATOS (detalle):
- Oracle vs PostgreSQL vs MongoDB
- Índices y optimización de queries
- Formato de almacenamiento en disco
```

**Aplicación práctica:**
```csharp
// MAL: Pasar objetos de DB por todo el sistema
public class FacturaController {
    public IActionResult Get(int id) {
        // DataRow de DB pasado al UseCase y UI
        var row = _context.Facturas.Find(id);
        return View(row);  // ¡Entity Framework Entity en la View!
    }
}

// BIEN: Entities de dominio, no de DB
public class FacturaController {
    public IActionResult Get(int id) {
        // UseCase retorna DTO, no entity de EF
        var factura = _obtenerFactura.Execute(id);
        return View(_presenter.Present(factura));
    }
}
```

**Pregunta del futuro:**
```
Cuando todos los datos estén en RAM (sin discos):
¿Organizarás los datos en tablas con SQL?
¿O en listas, árboles, hash tables?

Respuesta: Ya lo haces - lees de DB y reorganizas en memoria.
La DB es solo transporte entre disco y RAM.
```

**Regla de pared:**
> "El modelo de datos es arquitectura. La base de datos es un detalle de implementación."

---

### 6. EVITA EL #IFDEF HELL - USA ABSTRACCIONES
**Impacto: MEDIO-ALTO**

"Vi #ifdef BOARD_V2 repetido 6,000 veces en una aplicación. Eso viola DRY y hace el código imposible de mantener."

**Aplicación en Backend:**
```csharp
// MAL: Condicionales esparcidos (el #ifdef de backend)
public class ServicioNotificaciones {
    public void Notificar(string mensaje) {
        if (Environment.GetEnvironmentVariable("USE_AWS") == "true") {
            // Código AWS SNS
        } else if (Environment.GetEnvironmentVariable("USE_AZURE") == "true") {
            // Código Azure
        } else {
            // Código SendGrid
        }
    }
}

// BIEN: Abstracción + DI
public interface INotificador {
    void Notificar(string mensaje);
}

// En Main.cs (o DI container)
if (config.UseAws) services.AddSingleton<INotificador, AwsNotificador>();
else if (config.UseAzure) services.AddSingleton<INotificador, AzureNotificador>();
else services.AddSingleton<INotificador, SendGridNotificador>();
```

**Regla de pared:**
> "Si tienes if/switch por ambiente o configuración esparcidos en el código, usa abstracciones e inyección."

---

### 7. BOUNDARIES: IMPLEMENTA AL PUNTO DE INFLEXIÓN
**Impacto: MEDIO**

"No decides qué boundaries implementar al inicio del proyecto. Observas, prestas atención, y actúas cuando el costo de implementar es menor que el costo de ignorar."

**El balance YAGNI vs Preparación:**
```
YAGNI (You Aren't Gonna Need It):
- No sobre-ingeniería
- No implementes boundaries que no necesitas

PERO:
- Agregar boundaries tardíamente es MUY costoso
- Observa fricción en el código
- Actúa en el punto de inflexión
```

**Señales de que necesitas un boundary:**
```
✓ Un cambio pequeño requiere tocar muchos archivos
✓ Dos equipos trabajan en el mismo código frecuentemente
✓ Los tests se vuelven lentos o frágiles
✓ Un módulo tiene muchas razones para cambiar
```

**Regla de pared:**
> "Implementa boundaries cuando el costo de implementarlos sea MENOR que el costo de ignorarlos."

---

## RESUMEN EJECUTIVO - REGLA DE PARED

```
╔══════════════════════════════════════════════════════════════╗
║  LAS 7 REGLAS DE CLEAN ARCHITECTURE - PARTE 6               ║
╠══════════════════════════════════════════════════════════════╣
║  1. Microservicios NO son arquitectura                       ║
║     → Boundaries están DENTRO de servicios, no entre ellos   ║
║                                                              ║
║  2. Main es el plugin más sucio del sistema                  ║
║     → Configura todo, conoce todo, entrega control           ║
║                                                              ║
║  3. Tests son parte del sistema                              ║
║     → Diseña Testing API para evitar tests frágiles          ║
║                                                              ║
║  4. Firmware vs Software (aplica a backend)                  ║
║     → Si SQL/AWS/Azure está en tu lógica = firmware          ║
║                                                              ║
║  5. Database es detalle, Data Model es arquitectura          ║
║     → No pases entities de EF por todo el sistema            ║
║                                                              ║
║  6. Evita if/switch por ambiente esparcidos                  ║
║     → Usa abstracciones e inyección de dependencias          ║
║                                                              ║
║  7. Boundaries: actúa en el punto de inflexión               ║
║     → Observa fricción, implementa cuando costo lo justifique║
╚══════════════════════════════════════════════════════════════╝
```

---

## ACCIONES INMEDIATAS

1. **Hoy:** Si tienes microservicios, pregúntate: ¿Tienen estructura interna de componentes? ¿O son monolitos pequeños?

2. **Esta semana:** Revisa tu Program.cs/Main. ¿Está configurando todo? ¿O hay configuración esparcida en otros lugares?

3. **Este mes:** Identifica si tienes "firmware" en tu código backend: ¿Hay SQL, llamadas a AWS/Azure, o código de framework mezclado con lógica de negocio?
