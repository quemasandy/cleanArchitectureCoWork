# PARTE 4: ARQUITECTURA - CONCEPTOS FUNDAMENTALES

## Contexto
Esta parte cubre los **Capítulos 14-17**: Principio de Abstracciones Estables, Qué es Arquitectura, Independencia, Límites (Boundaries)

**Perfil del lector:** Desarrollador Backend Semi-Senior que quiere pasar a Senior.

---

## LECCIONES ORDENADAS POR IMPACTO (De Mayor a Menor)

---

### 1. UN BUEN ARQUITECTO MAXIMIZA LAS DECISIONES NO TOMADAS
**Impacto: CRÍTICO - Esta es LA mentalidad Senior**

"La estrategia es dejar tantas opciones abiertas como sea posible, por el mayor tiempo posible."

**Las decisiones que debes POSPONER:**
```
NO decidas temprano:
- Qué base de datos usar (SQL Server, PostgreSQL, MongoDB)
- Qué framework web usar (Express, ASP.NET, Spring)
- Qué ORM usar (Entity Framework, Dapper, Hibernate)
- REST vs GraphQL vs gRPC
- Microservicios vs Monolito
- Qué proveedor de cloud usar

SÍ decide temprano:
- Las reglas de negocio (el CORE de tu sistema)
- Los casos de uso principales
- Las entidades del dominio
```

**Aplicación práctica:**
```csharp
// Tu código de negocio NO debe saber nada de:
using System.Data.SqlClient;     // Detalle de DB
using Microsoft.AspNetCore.Mvc;   // Detalle de framework
using Newtonsoft.Json;            // Detalle de serialización

// Tu código de negocio SÍ puede usar:
using MiEmpresa.Facturacion.Domain;  // Tu dominio
using MiEmpresa.Facturacion.UseCases; // Tus casos de uso
```

**Regla de pared:**
> "Si tu código de negocio puede funcionar sin saber qué DB, framework o protocolo usas, tu arquitectura está bien."

---

### 2. POLÍTICA VS DETALLE - EL NEGOCIO ES LA POLÍTICA
**Impacto: CRÍTICO**

"Todo sistema se puede descomponer en: POLÍTICA (reglas de negocio) y DETALLES (IO, DB, web, frameworks)."

**Aplicación práctica:**
```csharp
// POLÍTICA (el valor real del sistema):
public class CalculadorImpuestos {
    public decimal CalcularIVA(Factura f) {
        return f.Subtotal * 0.16m;  // Regla de negocio pura
    }
}

// DETALLE (necesario pero reemplazable):
- SqlServerRepository      // Detalle de persistencia
- FacturaController        // Detalle de delivery (HTTP)
- JsonSerializer           // Detalle de formato
- SmtpEmailSender          // Detalle de notificación
```

**Regla de pared:**
> "La política no debe conocer los detalles. Los detalles deben ser PLUGINS de la política."

---

### 3. LA ARQUITECTURA DE PLUGINS - DB Y UI SON PLUGINS DEL NEGOCIO
**Impacto: ALTO**

"La historia del desarrollo de software es la historia de cómo crear plugins."

**El patrón:**
```
                    ┌──────────────┐
       ┌───────────>│   NEGOCIO    │<───────────┐
       │            │  (Políticas) │            │
       │            └──────────────┘            │
       │                                        │
┌──────┴──────┐                          ┌──────┴──────┐
│     GUI     │                          │   DATABASE  │
│  (Plugin)   │                          │   (Plugin)  │
└─────────────┘                          └─────────────┘
```

**Aplicación práctica:**
```csharp
// El negocio define la interfaz
public interface IFacturaRepository {
    Factura ObtenerPorId(int id);
    void Guardar(Factura f);
}

// Los plugins implementan
public class SqlFacturaRepo : IFacturaRepository { }      // Plugin SQL
public class MongoFacturaRepo : IFacturaRepository { }    // Plugin Mongo
public class InMemoryFacturaRepo : IFacturaRepository { } // Plugin tests
```

---

### 4. CASO DE ESTUDIO FITNESSE - DIFERIR LA DB POR 18 MESES
**Impacto: ALTO (Ejemplo real)**

Desarrollo de FitNesse:
1. Crearon interfaz `WikiPage` con métodos de datos
2. Implementaron `MockWikiPage` (stubs) por 3 meses
3. Implementaron `InMemoryPage` (hash tables en RAM) por 1 año
4. Implementaron `FileSystemWikiPage` (archivos planos)
5. **Nunca necesitaron MySQL**
6. Un cliente lo implementó en 1 día cuando lo necesitó

**Beneficios:**
- 18 meses sin problemas de schema, queries, passwords, conexiones
- Tests súper rápidos (sin DB)
- Decisión final basada en datos reales

---

### 5. EL COSTO REAL DE LA ARQUITECTURA ES EL MANTENIMIENTO
**Impacto: ALTO**

"De todos los aspectos de un sistema, el mantenimiento es el más costoso."

**Los 4 aspectos que la arquitectura debe soportar:**
| Aspecto | Qué significa | Impacto si falla |
|---------|--------------|------------------|
| **Desarrollo** | Fácil de construir | Equipos bloqueados |
| **Despliegue** | Un comando para deploy | Deploy de días |
| **Operación** | Soporta la carga | Sistema caído |
| **Mantenimiento** | Fácil de modificar | **EL MÁS CARO** |

**Regla de pared:**
> "Una buena arquitectura hace obvio DÓNDE hacer cambios y minimiza el riesgo de romper cosas."

---

### 6. DESACOPLA POR CAPAS Y POR CASOS DE USO
**Impacto: ALTO**

"Separa horizontalmente por capas Y verticalmente por casos de uso."

**Aplicación práctica:**
```
HORIZONTAL (Capas):        VERTICAL (Casos de uso):
┌─────────────────┐        ┌────────┬────────┬────────┐
│       UI        │        │ Crear  │Cancelar│ Pagar  │
├─────────────────┤        │Factura │Factura │Factura │
│   Application   │        ├────────┼────────┼────────┤
├─────────────────┤        │  UI    │  UI    │  UI    │
│     Domain      │        │  App   │  App   │  App   │
├─────────────────┤        │ Domain │ Domain │ Domain │
│ Infrastructure  │        │ Infra  │ Infra  │ Infra  │
└─────────────────┘        └────────┴────────┴────────┘
```

**Beneficio:** Agregar nuevo caso de uso no afecta los existentes.

---

### 7. CUIDADO CON LA "DUPLICACIÓN ACCIDENTAL"
**Impacto: MEDIO-ALTO**

"Hay duplicación REAL y duplicación ACCIDENTAL. Solo elimina la real."

**Aplicación práctica:**
```csharp
// TRAMPA: Dos DTOs se ven iguales HOY
public class FacturaRequest { public string Cliente; public decimal Monto; }
public class FacturaResponse { public string Cliente; public decimal Monto; }

// ¿Los unificas? ¡NO! Evolucionarán diferente.
// En 6 meses Request tendrá CodigoDescuento
// Response tendrá NumeroFactura, FechaEmision
```

**Regla de pared:**
> "Si dos cosas se ven iguales pero cambian por RAZONES DIFERENTES, NO son duplicación real."

---

### 8. MODOS DE DESACOPLAMIENTO - DE MONOLITO A MICROSERVICIOS
**Impacto: MEDIO**

"Una buena arquitectura permite nacer como monolito y evolucionar a microservicios (y volver)."

**Los 3 niveles:**
```
1. CÓDIGO FUENTE: Clases separadas, mismo proceso
   → Comunicación: llamadas a funciones

2. DEPLOYMENT: DLLs/JARs separados, mismo servidor
   → Comunicación: función o IPC local

3. SERVICIO: Procesos separados, servidores diferentes
   → Comunicación: red (HTTP, mensajes)
```

**Consejo:**
> "Prepara el código para poder formar un servicio SI es necesario, pero mantén los componentes juntos el mayor tiempo posible."

---

## RESUMEN EJECUTIVO - REGLA DE PARED

```
╔══════════════════════════════════════════════════════════════╗
║  LAS 8 REGLAS DE CLEAN ARCHITECTURE - PARTE 4               ║
╠══════════════════════════════════════════════════════════════╣
║  1. Maximiza decisiones NO tomadas                          ║
║     → Pospón DB, framework, protocolo                       ║
║                                                              ║
║  2. Política (negocio) vs Detalle (todo lo demás)           ║
║     → El negocio es el REY                                  ║
║                                                              ║
║  3. Arquitectura de Plugins                                  ║
║     → DB y UI son PLUGINS del negocio                       ║
║                                                              ║
║  4. Diferir decisiones = más información                    ║
║     → FitNesse: 18 meses sin DB                             ║
║                                                              ║
║  5. Mantenimiento es el costo #1                            ║
║     → Arquitectura hace obvio DÓNDE cambiar                 ║
║                                                              ║
║  6. Desacopla por capas Y por casos de uso                  ║
║     → Horizontal + Vertical                                 ║
║                                                              ║
║  7. Duplicación accidental ≠ duplicación real               ║
║     → Si cambian por razones diferentes, NO unificar        ║
║                                                              ║
║  8. Prepara para servicios, empieza monolítico              ║
║     → Microservicios cuando SEA NECESARIO                   ║
╚══════════════════════════════════════════════════════════════╝
```

---

## ACCIONES INMEDIATAS

1. **Hoy:** Revisa tu código de negocio. ¿Tiene `using SqlClient` o `using AspNetCore`? Eso viola la regla de plugins.

2. **Esta semana:** Identifica qué decisiones técnicas tomaste al inicio del proyecto que podrías haber diferido.

3. **Este mes:** Dibuja tu arquitectura actual. ¿Las flechas de dependencia apuntan hacia el negocio o hacia afuera?
