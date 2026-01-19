# PARTE 2: PARADIGMAS DE PROGRAMACIÓN + PRINCIPIOS SOLID (Inicio)

## Contexto
Esta parte cubre los **Capítulos 3-8**: Los 3 Paradigmas (Estructurada, OO, Funcional) + Introducción a SOLID (SRP, OCP)

**Perfil del lector:** Desarrollador Backend Semi-Senior que quiere pasar a Senior.

---

## LECCIONES ORDENADAS POR IMPACTO (De Mayor a Menor)

---

### 1. OOP = CONTROL DE DEPENDENCIAS VIA POLIMORFISMO (INVERSIÓN DE DEPENDENCIAS)
**Impacto: CRÍTICO - Esto separa a un Senior de un Semi-Senior**

OOP no se trata de encapsulación ni herencia. Se trata de **poder invertir la dirección de las dependencias** usando interfaces.

**Aplicación práctica:**
```csharp
// MAL - SIN inversión: Business Rules DEPENDE de Database
public class FacturacionService {
    private SqlServerRepository _repo = new SqlServerRepository();

    public void Procesar(Factura f) {
        _repo.Guardar(f);  // Business rules conoce SQL Server
    }
}

// BIEN - CON inversión: Database DEPENDE de Business Rules
// En capa de dominio/negocio:
public interface IFacturaRepository {
    void Guardar(Factura f);
}

public class FacturacionService {
    private readonly IFacturaRepository _repo;

    public FacturacionService(IFacturaRepository repo) {
        _repo = repo;
    }
}

// En capa de infraestructura (DEPENDE del dominio):
public class SqlServerFacturaRepository : IFacturaRepository {
    public void Guardar(Factura f) { /* SQL aquí */ }
}
```

**Regla de pared:**
> "La UI y la DB son PLUGINS de las reglas de negocio, no al revés."

---

### 2. SRP - UN MÓDULO DEBE TENER UN SOLO ACTOR (no "una sola cosa")
**Impacto: ALTO**

SRP NO significa "una función hace una cosa". Significa: **un módulo cambia solo cuando UN grupo de stakeholders lo pide**.

**Aplicación práctica:**
```csharp
// MAL - VIOLA SRP: 3 actores diferentes usan esta clase
public class Empleado {
    public decimal CalcularSueldo() { }     // Lo usa Contabilidad (CFO)
    public string ReporteHoras() { }        // Lo usa RRHH (COO)
    public void Guardar() { }               // Lo usa IT/DBA (CTO)
}

// BIEN - CUMPLE SRP: Separar por actor
public class CalculadorSueldo { }    // Solo Contabilidad
public class ReportadorHoras { }     // Solo RRHH
public class EmpleadoRepository { }  // Solo IT

// Facade para conveniencia
public class EmpleadoFacade {
    private readonly CalculadorSueldo _calc;
    private readonly ReportadorHoras _report;
    private readonly EmpleadoRepository _repo;
}
```

**Regla de pared:**
> "Si dos departamentos diferentes piden cambios en la misma clase, esa clase viola SRP."

---

### 3. OCP - AGREGAR FEATURES = AGREGAR CÓDIGO, NO MODIFICAR EXISTENTE
**Impacto: ALTO**

"Un artefacto de software debe estar abierto para extensión pero cerrado para modificación."

**Aplicación práctica:**
```csharp
// MAL - VIOLA OCP: Cada nuevo tipo de reporte modifica código existente
public class GeneradorReporte {
    public void Generar(string tipo) {
        if (tipo == "PDF") { /* código PDF */ }
        else if (tipo == "Excel") { /* código Excel */ }
        else if (tipo == "Word") { /* código Word - NUEVO! */ }
    }
}

// BIEN - CUMPLE OCP: Nuevo reporte = nueva clase, código existente intacto
public interface IGeneradorReporte {
    void Generar(DatosReporte datos);
}

public class GeneradorPDF : IGeneradorReporte { }
public class GeneradorExcel : IGeneradorReporte { }
public class GeneradorWord : IGeneradorReporte { }  // NUEVO - no toca nada
```

**Regla de pared:**
> "Si agregar una feature requiere modificar código existente, tu arquitectura falló."

---

### 4. LAS DEPENDENCIAS APUNTAN HACIA LO QUE QUIERES PROTEGER
**Impacto: ALTO**

"Si el componente A debe estar protegido de cambios en B, entonces B debe depender de A."

**Jerarquía de protección (de MÁS a MENOS protegido):**
```
1. INTERACTOR (Reglas de negocio) ← Más protegido
   ↑ depende de él
2. CONTROLLER
   ↑ depende de él
3. PRESENTER
   ↑ depende de él
4. VIEW ← Menos protegido (cambia todo el tiempo)
```

**En sistema de facturación:**
- CalculoImpuestos (regla de negocio) → MÁS PROTEGIDO
- FacturaController → depende de CalculoImpuestos
- FacturaView → depende de Controller

---

### 5. PROGRAMACIÓN FUNCIONAL - LA INMUTABILIDAD ELIMINA PROBLEMAS DE CONCURRENCIA
**Impacto: MEDIO-ALTO**

"Todos los race conditions, deadlocks y problemas de concurrencia son causados por variables mutables."

**Aplicación práctica:**
```csharp
// MAL - MUTABLE: Problemas en multi-threading
public class Contador {
    private int _valor = 0;
    public void Incrementar() { _valor++; }  // Race condition!
}

// BIEN - INMUTABLE: Sin problemas de concurrencia
public class Contador {
    public int Valor { get; }
    public Contador(int valor) { Valor = valor; }
    public Contador Incrementar() => new Contador(Valor + 1);
}
```

**Regla de pared:**
> "Empuja toda la lógica posible a componentes inmutables. Aísla la mutabilidad."

---

### 6. LOS TESTS SON CIENTÍFICOS, NO MATEMÁTICOS
**Impacto: MEDIO**

"Los tests prueban la PRESENCIA de bugs, no su ausencia."

**Mentalidad correcta:**
- NO puedes probar que algo funciona
- SÍ puedes probar que algo falla
- Si no pudiste hacerlo fallar después de muchos intentos, lo consideras "suficientemente correcto"

**Implicación práctica:**
- Escribe tests que INTENTEN romper tu código
- No escribas tests que solo confirmen el happy path

---

### 7. LOS 3 PARADIGMAS QUITAN, NO AGREGAN
**Impacto: MEDIO (conceptual)**

| Paradigma | ¿Qué QUITA? | ¿Para qué sirve en arquitectura? |
|-----------|-------------|----------------------------------|
| **Estructurada** | goto (transferencia directa) | Base de módulos testeables |
| **OOP** | Punteros a función inseguros | Invertir dependencias |
| **Funcional** | Mutabilidad | Eliminar problemas de concurrencia |

**Regla de pared:**
> "Los paradigmas no te dan poder nuevo. Te disciplinan quitándote cosas peligrosas."

---

## RESUMEN EJECUTIVO - REGLA DE PARED

```
╔══════════════════════════════════════════════════════════════╗
║  LAS 7 REGLAS DE CLEAN ARCHITECTURE - PARTE 2               ║
╠══════════════════════════════════════════════════════════════╣
║  1. OOP = Inversión de dependencias via interfaces          ║
║     → DB y UI son PLUGINS del negocio                       ║
║                                                              ║
║  2. SRP = Un módulo, UN ACTOR (no "una cosa")               ║
║     → Si 2 departamentos piden cambios, separa              ║
║                                                              ║
║  3. OCP = Nueva feature = código nuevo, no modificado       ║
║     → Si tocas código existente, fallaste                   ║
║                                                              ║
║  4. Dependencias apuntan a lo que PROTEGES                  ║
║     → Negocio en el centro, UI/DB en la periferia           ║
║                                                              ║
║  5. Inmutabilidad = cero problemas de concurrencia          ║
║     → Aísla la mutabilidad en componentes específicos       ║
║                                                              ║
║  6. Tests intentan ROMPER, no confirmar                     ║
║     → Si no lo rompiste, está "suficientemente bien"        ║
║                                                              ║
║  7. Paradigmas = disciplina, no poder nuevo                 ║
║     → Estructurada, OOP, Funcional: cada uno quita algo     ║
╚══════════════════════════════════════════════════════════════╝
```

---

## ACCIONES INMEDIATAS

1. **Hoy:** Revisa una clase de tu proyecto. ¿Cuántos "actores" (departamentos/stakeholders) la usan? Si más de 1, viola SRP.

2. **Esta semana:** Identifica dónde tu código de negocio importa/usa directamente SQL o frameworks. Esas son dependencias invertibles.

3. **Este mes:** La próxima feature nueva, intenta agregarla SIN modificar código existente (OCP).
