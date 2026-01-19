# PARTE 3: SOLID (Continuación) + PRINCIPIOS DE COMPONENTES

## Contexto
Esta parte cubre los **Capítulos 9-14**: LSP, ISP, DIP + Principios de Cohesión y Acoplamiento de Componentes

**Perfil del lector:** Desarrollador Backend Semi-Senior que quiere pasar a Senior.

---

## LECCIONES ORDENADAS POR IMPACTO (De Mayor a Menor)

---

### 1. DIP - DEPENDE DE ABSTRACCIONES, NO DE CONCRECIONES VOLÁTILES
**Impacto: CRÍTICO**

"Los sistemas más flexibles son aquellos donde las dependencias de código fuente se refieren solo a abstracciones."

**Las 4 reglas de DIP:**
```csharp
// 1. NO refieras clases concretas volátiles → usa interfaces
// MAL
private SqlServerRepository _repo = new SqlServerRepository();
// BIEN
private readonly IRepository _repo;

// 2. NO heredes de clases concretas volátiles
// MAL
public class MiServicio : FrameworkBaseService { }
// BIEN
public class MiServicio : IServicio { }

// 3. NO sobrescribas funciones concretas
// MAL
public override void MetodoConcreto() { base.MetodoConcreto(); ... }
// BIEN
public abstract void MetodoAbstracto(); // en clase base

// 4. NUNCA menciones el nombre de algo concreto y volátil
```

**Nota:** Clases estables como `String` o `DateTime` NO aplican. Solo las que TÚ escribes y cambian frecuentemente.

**Regla de pared:**
> "Tu código de negocio NUNCA debe importar/usar directamente: SqlConnection, HttpClient, SmtpClient, etc."

---

### 2. LSP - SI USAS IF/SWITCH PARA DETECTAR TIPOS, VIOLASTE LSP
**Impacto: ALTO**

"Si para cada objeto de tipo S existe un objeto de tipo T tal que el comportamiento no cambia cuando sustituyes S por T, entonces S es subtipo de T."

**Aplicación práctica:**
```csharp
// MAL - VIOLA LSP: Necesitas detectar el tipo
public void ProcesarPago(IPasarelaPago pasarela) {
    if (pasarela.GetType().Name.Contains("Acme")) {
        // Lógica especial para Acme
    } else {
        // Lógica normal
    }
}

// BIEN - CUMPLE LSP: Todas son intercambiables
public void ProcesarPago(IPasarelaPago pasarela) {
    pasarela.Procesar(monto);  // Funciona igual para CUALQUIER implementación
}
```

**Señal de alarma:**
> "Si agregas un `if` para manejar un caso especial de una implementación, tu arquitectura tiene un problema."

---

### 3. NO DEBE HABER CICLOS EN EL GRAFO DE DEPENDENCIAS
**Impacto: ALTO**

"Si hay ciclos, el 'síndrome de la mañana siguiente' es inevitable."

**Cómo detectar ciclos:**
```
Proyecto A → Proyecto B → Proyecto C → Proyecto A  ❌ CICLO!

Síntomas:
- Para compilar A, necesitas B, C y... A de nuevo
- Un cambio en A afecta B, que afecta C, que afecta A
- No puedes testear A en aislamiento
```

**Cómo ROMPER ciclos:**
```csharp
// FORMA 1: Inversión de dependencias (DIP)
// ANTES: Entities → Authorizer (ciclo)
// DESPUÉS: Authorizer implementa interfaz definida en Entities

// FORMA 2: Crear nuevo componente compartido
// ANTES: A → B → A (ciclo)
// DESPUÉS: A → Shared ← B (ambos dependen del nuevo)
```

---

### 4. ISP - NO DEPENDAS DE COSAS QUE NO USAS
**Impacto: MEDIO-ALTO**

"Si dependes de un módulo que tiene cosas que no necesitas, los cambios en esas cosas te afectarán."

**Aplicación práctica:**
```csharp
// MAL - VIOLA ISP: Interfaz gorda
public interface IUsuarioService {
    Usuario ObtenerPorId(int id);      // Lo usa módulo A
    void ActualizarPerfil(Usuario u);   // Lo usa módulo B
    void ResetearPassword(string email); // Lo usa módulo C
    Reporte GenerarReporte(int userId);  // Lo usa módulo D
}

// BIEN - CUMPLE ISP: Interfaces segregadas
public interface IUsuarioReader { Usuario ObtenerPorId(int id); }
public interface IUsuarioWriter { void ActualizarPerfil(Usuario u); }
public interface IPasswordService { void ResetearPassword(string email); }
public interface IReportService { Reporte GenerarReporte(int userId); }
```

**Regla de pared:**
> "No dependas de cosas que no necesitas."

---

### 5. CCP - AGRUPA CLASES QUE CAMBIAN JUNTAS EN EL MISMO COMPONENTE
**Impacto: MEDIO-ALTO**

"Junta en un componente las clases que cambian por las mismas razones y al mismo tiempo."

**Aplicación práctica:**
```
// MAL: Clases relacionadas en componentes separados
Proyecto.Api/
  FacturaController.cs
Proyecto.Services/
  FacturaService.cs
Proyecto.Data/
  FacturaRepository.cs
// Si cambio Factura, toco 3 proyectos = 3 deploys

// MEJOR: Agrupar por feature/dominio
Proyecto.Facturacion/
  FacturaController.cs
  FacturaService.cs
  FacturaRepository.cs
// Si cambio Factura, solo 1 proyecto = 1 deploy
```

**Es el SRP aplicado a componentes:**
> "Un componente debe tener una sola razón para cambiar."

---

### 6. SDP - DEPENDE EN DIRECCIÓN DE LA ESTABILIDAD
**Impacto: MEDIO**

"Los componentes volátiles no deben ser dependidos por componentes difíciles de cambiar."

**Métricas de estabilidad:**
```
Fan-in  = Dependencias entrantes (quién depende de mí)
Fan-out = Dependencias salientes (de quién dependo yo)

Inestabilidad (I) = Fan-out / (Fan-in + Fan-out)

I = 0 → Máxima estabilidad (todos dependen de mí, yo de nadie)
I = 1 → Máxima inestabilidad (nadie depende de mí, yo de todos)
```

**Aplicación:**
```
ESTABLES (I ~ 0): Domain/Entities, Core/BusinessRules
INESTABLES (I ~ 1): WebApi/Controllers, UI/Views

REGLA: Las flechas van de inestable → estable
```

---

### 7. LA ESTRUCTURA DE COMPONENTES EVOLUCIONA
**Impacto: MEDIO**

"El diagrama de dependencias representa la CONSTRUIBILIDAD, no la funcionalidad."

**Implicación práctica:**
```
INICIO del proyecto:
- Pocos componentes grandes
- Prioriza CCP (desarrollo rápido)

PROYECTO MADURO:
- Más componentes pequeños
- Prioriza CRP (reusabilidad)
```

---

## RESUMEN EJECUTIVO - REGLA DE PARED

```
╔══════════════════════════════════════════════════════════════╗
║  LAS 7 REGLAS DE CLEAN ARCHITECTURE - PARTE 3               ║
╠══════════════════════════════════════════════════════════════╣
║  1. DIP: Depende de interfaces, no de clases concretas      ║
║     → SqlConnection, HttpClient = en infraestructura        ║
║                                                              ║
║  2. LSP: Si necesitas if/switch por tipo, mal diseño        ║
║     → Todas las implementaciones deben ser intercambiables  ║
║                                                              ║
║  3. ADP: Sin ciclos en dependencias entre proyectos         ║
║     → Rompe ciclos con DIP o componente compartido          ║
║                                                              ║
║  4. ISP: No dependas de lo que no usas                      ║
║     → Interfaces pequeñas y específicas                     ║
║                                                              ║
║  5. CCP: Clases que cambian juntas, viven juntas            ║
║     → Agrupar por feature, no por capa técnica              ║
║                                                              ║
║  6. SDP: Depende hacia lo estable                           ║
║     → UI → Controllers → Services → Domain                  ║
║                                                              ║
║  7. La arquitectura evoluciona con el proyecto              ║
║     → No diseñes todo al inicio, deja que emerja            ║
╚══════════════════════════════════════════════════════════════╝
```

---

## ACCIONES INMEDIATAS

1. **Hoy:** Busca en tu código `new SqlConnection()` o `new HttpClient()` fuera de la capa de infraestructura. Eso viola DIP.

2. **Esta semana:** Revisa si tienes `if (objeto is TipoEspecifico)` en tu código. Eso viola LSP.

3. **Este mes:** Dibuja el grafo de dependencias de tus proyectos. ¿Hay ciclos? Usa DIP para romperlos.
