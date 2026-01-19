# CLEAN ARCHITECTURE - RESUMEN EJECUTIVO FINAL

## Para: Desarrollador Backend Semi-Senior → Senior
## Meta: El 20% que produce el 80% de resultados

---

## LAS 10 REGLAS DE ORO (Ordenadas por Impacto en tu Carrera)

### 1. LA REGLA DE DEPENDENCIA
**Todo apunta hacia adentro. Las políticas de alto nivel NO conocen los detalles.**

```
              ┌─────────────────────────────────────────┐
              │         Frameworks & Drivers            │ ← Más externo
              │    ┌─────────────────────────────┐      │
              │    │     Interface Adapters      │      │
              │    │   ┌─────────────────────┐   │      │
              │    │   │      Use Cases      │   │      │
              │    │   │   ┌─────────────┐   │   │      │
              │    │   │   │  Entities   │   │   │      │ ← Más interno
              │    │   │   └─────────────┘   │   │      │
              │    │   └─────────────────────┘   │      │
              │    └─────────────────────────────┘      │
              └─────────────────────────────────────────┘

TODAS las flechas de dependencia apuntan hacia adentro.
Entities NO conocen Use Cases.
Use Cases NO conocen Controllers.
```

---

### 2. SEPARA POLICY DE DETAIL
**Policy = Reglas de negocio. Detail = Base de datos, UI, frameworks.**

```csharp
// POLICY (tu código valioso)
public class CalculadoraFactura {
    public decimal CalcularTotal(Factura f) {
        return f.Items.Sum(i => i.Precio) * 1.16m;
    }
}

// DETAIL (reemplazable)
public class SqlFacturaRepository : IFacturaRepository { }
public class MongoFacturaRepository : IFacturaRepository { }
```

**Regla:** Si cambiar de PostgreSQL a MongoDB requiere tocar `CalculadoraFactura`, tienes un problema.

---

### 3. SOLID EN UNA LÍNEA CADA UNO

| Principio | Significado Real | Aplicación Inmediata |
|-----------|------------------|----------------------|
| **SRP** | Una clase = Un actor que pide cambios | Si RH y Contabilidad usan la misma clase, sepárala |
| **OCP** | Nuevo feature = Nuevo código, no modificar existente | Usa interfaces y Strategy pattern |
| **LSP** | Subtipos deben ser sustituibles | No if/switch por tipo de subclase |
| **ISP** | No dependas de lo que no usas | Interfaces pequeñas y específicas |
| **DIP** | Depende de abstracciones, no de concretos | `IRepository`, no `SqlRepository` |

---

### 4. ENTITY vs USE CASE

```
ENTITY: Reglas que existirían aunque no hubiera software
- "Un préstamo cobra interés del X%"
- "Un empleado tiene máximo 30 días de vacaciones"

USE CASE: Reglas de la aplicación específica
- "El usuario puede ver sus últimas 10 facturas"
- "Al crear factura, enviar email de confirmación"
```

**Los Entities NO conocen los Use Cases.** Los Use Cases orquestan Entities.

---

### 5. NO TE CASES CON EL FRAMEWORK

```csharp
// MAL: Framework en tu dominio
public class FacturaService {
    [Inject]  // Spring/NestJS
    private IRepo _repo;
}

// BIEN: Framework solo en Main/Composition Root
public class FacturaService {
    private readonly IRepo _repo;
    public FacturaService(IRepo repo) => _repo = repo;
}
```

---

### 6. MAIN ES EL PLUGIN MÁS SUCIO

```csharp
// Program.cs - El ÚNICO lugar que conoce TODO
public class Program {
    public static void Main() {
        var repo = new SqlFacturaRepository(connectionString);
        var email = new SmtpEmailService(smtpConfig);
        var useCase = new CrearFacturaUseCase(repo, email);
        // ...
    }
}
```

**Main conoce todos los concretos. El resto del sistema solo conoce abstracciones.**

---

### 7. SCREAMING ARCHITECTURE

```
MAL (grita el framework):          BIEN (grita el dominio):
src/                               src/
├── controllers/                   ├── Facturacion/
├── services/                      │   ├── CrearFactura.cs
├── repositories/                  │   ├── AnularFactura.cs
└── models/                        │   └── IFacturaRepository.cs
                                   ├── Clientes/
                                   ├── Inventario/
                                   └── Reportes/
```

---

### 8. BOUNDARIES AL PUNTO DE INFLEXIÓN

```
No implementes boundaries de más (YAGNI).
No ignores boundaries necesarios (muy costoso agregar después).

SEÑALES de que necesitas un boundary:
✓ Cambio pequeño toca muchos archivos
✓ Dos equipos modifican el mismo código
✓ Tests se vuelven lentos o frágiles
```

---

### 9. MICROSERVICIOS NO SON ARQUITECTURA

```
Los boundaries están DENTRO de servicios, no entre ellos.

Un microservicio sin estructura interna = monolito pequeño.
Un monolito con buena estructura > microservicios mal diseñados.
```

---

### 10. USA EL COMPILADOR COMO GUARDIÁN

```csharp
// Usa `internal` agresivamente
public interface IOrdersComponent { }  // Solo esto público

internal class OrdersService { }       // Nadie externo puede acceder
internal class OrdersRepository { }    // El compilador lo enforce
```

---

## DIAGRAMA COMPLETO DE CLEAN ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────────────┐
│                        FRAMEWORKS & DRIVERS                          │
│  ┌────────────┐  ┌─────────────┐  ┌──────────┐  ┌─────────────────┐ │
│  │    Web     │  │     DB      │  │ Devices  │  │   External      │ │
│  │ (ASP.NET)  │  │ (EF Core)   │  │          │  │   Interfaces    │ │
│  └─────┬──────┘  └──────┬──────┘  └────┬─────┘  └───────┬─────────┘ │
├────────┼────────────────┼──────────────┼────────────────┼───────────┤
│        │    INTERFACE ADAPTERS         │                │           │
│        ▼                ▼              ▼                ▼           │
│  ┌───────────┐   ┌────────────┐  ┌──────────┐  ┌────────────────┐  │
│  │Controllers│   │ Gateways   │  │Presenters│  │   Repositories │  │
│  └─────┬─────┘   └─────┬──────┘  └────┬─────┘  └───────┬────────┘  │
├────────┼───────────────┼──────────────┼────────────────┼───────────┤
│        │          USE CASES           │                │           │
│        ▼               ▼              ▼                ▼           │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                      Interactors                              │ │
│  │   CrearFactura, AnularFactura, ObtenerReporte, etc.          │ │
│  └───────────────────────────────┬───────────────────────────────┘ │
├──────────────────────────────────┼──────────────────────────────────┤
│                            ENTITIES                                 │
│  ┌───────────────────────────────▼───────────────────────────────┐ │
│  │   Factura, Cliente, Producto, ReglasDeNegocio, etc.          │ │
│  │   (Código que existiría aunque no hubiera software)          │ │
│  └───────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘

REGLA: Todas las flechas apuntan hacia adentro.
       Entities no conocen Use Cases.
       Use Cases no conocen Controllers.
       Nadie conoce la base de datos excepto los Gateways.
```

---

## CHECKLIST PARA EVALUAR TU CÓDIGO ACTUAL

### Nivel Crítico (Arreglar YA)
- [ ] ¿Tu lógica de negocio tiene `using` de Entity Framework/SQL?
- [ ] ¿Tus Entities tienen decoradores de framework (`[JsonProperty]`, `[Column]`)?
- [ ] ¿Cambiar de base de datos requeriría tocar lógica de negocio?

### Nivel Alto (Arreglar esta semana)
- [ ] ¿Tus carpetas gritan "Spring/ASP.NET" en lugar de "Facturación/Clientes"?
- [ ] ¿Tienes código que solo una persona entiende?
- [ ] ¿Un cambio pequeño toca más de 3 archivos?

### Nivel Medio (Arreglar este mes)
- [ ] ¿Todos tus tipos son `public`? (Deberían ser mayormente `internal`)
- [ ] ¿Puedes correr tests sin base de datos/red?
- [ ] ¿Tienes un solo `Main` para dev/test/prod?

---

## RUTA DE APRENDIZAJE RECOMENDADA

```
SEMANA 1: Entities y Use Cases
- Identifica qué código es "policy" vs "detail"
- Separa al menos un Entity de su repositorio

SEMANA 2: Dependency Inversion
- Crea interfaces para tus repositorios
- Mueve toda la configuración de DI a Program.cs

SEMANA 3: Boundaries
- Reorganiza carpetas por dominio, no por capa técnica
- Usa `internal` en todo lo que no sea punto de entrada

SEMANA 4: Testing
- Crea tests que NO necesiten base de datos
- Implementa Humble Object para tu UI más compleja
```

---

## ARCHIVOS EN ESTA CARPETA

1. `parte_01_introduccion.md` - Por qué arquitectura importa
2. `parte_02_paradigmas_solid.md` - OOP, SRP, OCP
3. `parte_03_solid_componentes.md` - LSP, ISP, DIP, Componentes
4. `parte_04_arquitectura_conceptos.md` - Policy vs Detail, Boundaries
5. `parte_05_clean_architecture_core.md` - Los 4 círculos, Dependency Rule
6. `parte_06_main_servicios_tests_embedded.md` - Main, Microservicios, Tests
7. `parte_07_web_frameworks_caso_estudio.md` - Web, Frameworks, Package by Component
8. `parte_08_arqueologia_arquitectura.md` - Lecciones de 45 años de experiencia

---

## FRASE FINAL

> "La única forma de ir rápido es ir bien."
> — Robert C. Martin

Tu código de hoy es la deuda técnica de mañana. Invierte en arquitectura AHORA.

---

*Resumen creado para desarrollador Backend Semi-Senior en DirecTV, con stack .NET/Java/Node, que quiere tomar decisiones de arquitectura como Senior.*
