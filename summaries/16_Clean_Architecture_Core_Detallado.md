# PARTE 5: CLEAN ARCHITECTURE - EL CORAZÓN DEL LIBRO

## Contexto
Esta parte cubre los **Capítulos 18-25**: Anatomía de Boundaries, Política y Nivel, Reglas de Negocio, Screaming Architecture, THE Clean Architecture, Presenters, Boundaries Parciales, Capas y Límites

**Perfil del lector:** Desarrollador Backend Semi-Senior que quiere pasar a Senior.

---

## LECCIONES ORDENADAS POR IMPACTO (De Mayor a Menor)

---

### 1. LA REGLA DE DEPENDENCIA - EL NÚCLEO DE TODO
**Impacto: CRÍTICO - Esta es LA regla que define Clean Architecture**

"Las dependencias de código fuente deben apuntar SOLO hacia adentro, hacia las políticas de nivel superior."

**El diagrama de Clean Architecture:**
```
                    ┌─────────────────────────────────────┐
                    │         FRAMEWORKS & DRIVERS        │ ← Más externo
                    │   (Web, DB, UI, Dispositivos)       │
                    ├─────────────────────────────────────┤
                    │       INTERFACE ADAPTERS            │
                    │  (Controllers, Gateways, Presenters)│
                    ├─────────────────────────────────────┤
                    │         APPLICATION RULES           │
                    │           (Use Cases)               │
                    ├─────────────────────────────────────┤
                    │        ENTERPRISE RULES             │ ← Más interno
                    │          (Entities)                 │
                    └─────────────────────────────────────┘

        REGLA: Todas las flechas de dependencia apuntan → HACIA ADENTRO
```

**Aplicación práctica:**
```csharp
// ENTITIES (centro) - NO conoce nada externo
public class Factura {
    public decimal CalcularTotal() { /* lógica pura de negocio */ }
}

// USE CASES - Solo conoce Entities
public class CrearFacturaUseCase {
    private readonly IFacturaRepository _repo;  // Interfaz, no implementación
    public void Execute(CrearFacturaRequest request) { }
}

// ADAPTERS - Conoce Use Cases, implementa interfaces
public class FacturaController {
    private readonly CrearFacturaUseCase _useCase;
}

// FRAMEWORKS - Conoce todo, pero nadie lo conoce a él
```

---

### 2. ENTITIES VS USE CASES - DOS TIPOS DE REGLAS DE NEGOCIO
**Impacto: CRÍTICO**

| Concepto | Entity | Use Case |
|----------|--------|----------|
| **Qué es** | Reglas que existirían SIN sistema | Reglas específicas de la aplicación |
| **Ejemplo** | "Interés = Capital × Tasa" | "No mostrar estimado hasta validar crédito" |
| **Cambia cuando** | Cambia el NEGOCIO | Cambia la APLICACIÓN |
| **Nivel** | MÁS ALTO | Más bajo que Entity |

**Aplicación práctica:**
```csharp
// ENTITY: Regla de negocio CRÍTICA (existiría sin software)
public class Prestamo {
    public decimal CalcularPagoMensual(int meses) {
        // Esta regla existe aunque no haya computadoras
        return Saldo * (TasaInteres / 12) /
               (1 - Math.Pow(1 + TasaInteres / 12, -meses));
    }
}

// USE CASE: Regla específica de ESTA aplicación
public class SolicitarPrestamoUseCase {
    public ResultadoSolicitud Execute(SolicitudPrestamo request) {
        // Regla de la APP: No calcular pago si score < 500
        if (request.CreditScore < 500) {
            return ResultadoSolicitud.Rechazado("Score muy bajo");
        }
        var prestamo = new Prestamo(request.Monto, request.Tasa);
        return ResultadoSolicitud.Aprobado(prestamo.CalcularPagoMensual(request.Plazo));
    }
}
```

---

### 3. SCREAMING ARCHITECTURE - LA ARQUITECTURA DEBE GRITAR EL PROPÓSITO
**Impacto: ALTO**

"Cuando miras la estructura de carpetas, ¿grita 'Sistema de Facturación' o grita 'Spring/Rails'?"

**Aplicación práctica:**
```
MAL - GRITA "FRAMEWORK":        BIEN - GRITA "FACTURACIÓN":
src/                            src/
  controllers/                    Facturacion/
  models/                           CrearFactura/
  repositories/                     CancelarFactura/
  services/                       Clientes/
  views/                            RegistrarCliente/
                                  Pagos/
                                    ProcesarPago/
```

**Regla de pared:**
> "Un nuevo programador debería entender QUÉ hace el sistema mirando la estructura de carpetas."

---

### 4. EL NIVEL DE UNA POLÍTICA = DISTANCIA A I/O
**Impacto: ALTO**

"Cuanto más lejos esté una política de los inputs y outputs, más alto es su nivel."

**Aplicación:**
```
NIVEL ALTO (lejos de I/O, cambia poco):
├── CalcularImpuestos()
├── ValidarReglaNegocio()

NIVEL MEDIO:
├── CrearFacturaUseCase
└── ProcesarPagoUseCase

NIVEL BAJO (cerca de I/O, cambia frecuente):
├── FacturaController (HTTP)
├── SqlFacturaRepository (DB)
```

**Regla de pared:**
> "Los componentes de bajo nivel son PLUGINS de los de alto nivel."

---

### 5. REQUEST/RESPONSE = DTOS PUROS, SIN FRAMEWORK
**Impacto: ALTO**

"Los Use Cases deben recibir y devolver estructuras simples. NUNCA HttpRequest."

**Aplicación práctica:**
```csharp
// MAL: Use Case acoplado a ASP.NET
public class CrearFacturaUseCase {
    public IActionResult Execute(HttpRequest request) { }  // HORROR!
}

// BIEN: Use Case con DTOs puros
public class CrearFacturaRequest {
    public string ClienteId { get; set; }
    public List<LineaItem> Items { get; set; }
}

public class CrearFacturaUseCase {
    public CrearFacturaResponse Execute(CrearFacturaRequest request) { }
}
```

**Beneficio:** El mismo Use Case funciona para REST, GraphQL, CLI, colas, etc.

---

### 6. HUMBLE OBJECT PATTERN - SEPARA LO TESTEABLE
**Impacto: MEDIO-ALTO**

"Divide en: 'objeto humilde' (difícil de testear, mínima lógica) y objeto testeable (toda la lógica)."

**Aplicación práctica:**
```csharp
// PRESENTER (testeable) - toda la lógica
public class FacturaPresenter {
    public FacturaViewModel Present(Factura factura) {
        return new FacturaViewModel {
            TotalFormateado = factura.Total.ToString("C"),
            ColorEstado = factura.Vencida ? "rojo" : "verde"
        };
    }
}

// VIEW (humble) - casi cero lógica
public class FacturaView {
    public void Render(FacturaViewModel vm) {
        lblTotal.Text = vm.TotalFormateado;
        lblTotal.ForeColor = vm.ColorEstado;
    }
}
```

---

### 7. SQL SOLO EN CAPA EXTERNA
**Impacto: MEDIO-ALTO**

"Los Use Cases usan interfaces de gateway. SQL está en la capa de database."

**Aplicación práctica:**
```csharp
// INTERFAZ en capa de Aplicación (sin SQL)
public interface IUsuarioGateway {
    List<string> ObtenerApellidosDeUsuariosQueIngresaronDespuesDe(DateTime fecha);
}

// IMPLEMENTACIÓN en capa de Infraestructura (aquí SÍ hay SQL)
public class SqlUsuarioGateway : IUsuarioGateway {
    public List<string> ObtenerApellidosDeUsuariosQueIngresaronDespuesDe(DateTime fecha) {
        return _context.Usuarios
            .Where(u => u.UltimoIngreso > fecha)
            .Select(u => u.Apellido)
            .ToList();
    }
}
```

---

### 8. BOUNDARIES PARCIALES - PREPARA SIN SOBREINGENIERÍA
**Impacto: MEDIO**

"A veces no necesitas boundary completo. Usa Strategy o Facade."

**3 formas:**
```csharp
// 1. SKIP THE LAST STEP: Todo preparado, pero en un solo componente

// 2. STRATEGY PATTERN: Una interfaz simple
public interface INotificador {
    void Notificar(string mensaje);
}

// 3. FACADE: Clase que esconde servicios
public class FacturacionFacade {
    public void CrearFactura(...) { _crearUseCase.Execute(...); }
}
```

---

## RESUMEN EJECUTIVO - REGLA DE PARED

```
╔══════════════════════════════════════════════════════════════╗
║  LAS 8 REGLAS DE CLEAN ARCHITECTURE - PARTE 5               ║
╠══════════════════════════════════════════════════════════════╣
║  1. REGLA DE DEPENDENCIA: Todo apunta hacia adentro         ║
║     → Entities ← UseCases ← Adapters ← Frameworks           ║
║                                                              ║
║  2. Entity = regla sin software, UseCase = regla de app     ║
║     → Entity: "Interés = capital × tasa"                    ║
║     → UseCase: "No calcular si score < 500"                 ║
║                                                              ║
║  3. La arquitectura GRITA el propósito del sistema          ║
║     → Carpetas por dominio, no por tecnología               ║
║                                                              ║
║  4. Nivel = distancia a I/O                                 ║
║     → Más lejos de I/O = más importante = menos cambia      ║
║                                                              ║
║  5. Request/Response = DTOs puros, sin framework            ║
║     → NUNCA HttpRequest en Use Cases                        ║
║                                                              ║
║  6. Humble Object: View simple, Presenter testeable         ║
║     → Toda la lógica de formato en Presenter                ║
║                                                              ║
║  7. SQL SOLO en capa externa                                ║
║     → Use Cases usan interfaces, no queries                 ║
║                                                              ║
║  8. Boundaries parciales cuando no necesitas completo       ║
║     → Strategy, Facade, o "todo junto pero preparado"       ║
╚══════════════════════════════════════════════════════════════╝
```

---

## ACCIONES INMEDIATAS

1. **Hoy:** Dibuja las 4 capas de Clean Architecture. ¿Dónde está cada clase de tu proyecto actual?

2. **Esta semana:** Identifica una Entity en tu código. ¿Tiene lógica que existiría sin software? Si no, no es Entity.

3. **Este mes:** Reorganiza una feature usando estructura por dominio en lugar de por capa técnica.
