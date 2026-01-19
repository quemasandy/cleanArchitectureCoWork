# 🧠 MENTORÍA SENIOR: PREGUNTAS Y RESPUESTAS PRÁCTICAS
**Objetivo**: Resolver dudas reales aplicadas a tu proyecto "Payment Engine" y tu carrera.

---

## 🚀 1. EL PROYECTO "PAYMENT ENGINE" (Tu problema real)

### ❓ El Problema:
> "Introducir un nuevo gateway es cada vez más complejo... lleno de IFs... sin abstracción."

### 💡 La Solución Senior (Open/Closed Principle):
Lo que describes es la definición de **Violación de OCP**. Tu costo de desarrollo aumenta porque para agregar algo nuevo (WorkPay), tienes que modificar y romper lo viejo (CyberSource/PayU).

**La Refactorización Inmediata:**
Necesitas Polimorfismo. Estandariza el comportamiento.

```csharp
// 1. Define el CONTRATO (La Abstracción/Política)
// Esto define QUÉ hace un gateway, no CÓMO lo hace.
public interface IPaymentGateway {
    PaymentResult ProcesarPago(PaymentRequest request);
    RefundResult Reembolsar(string transactionId, decimal monto);
}

// 2. Implementa los ADAPTADORES (Los Detalles)
// Cada uno sabe hablar con la API sucia externa.
public class CyberSourceAdapter : IPaymentGateway { ... }
public class PayUAdapter : IPaymentGateway { ... }
public class WorkPayAdapter : IPaymentGateway { ... }

// 3. Usa una FACTORY para decidir cuál usar (El único lugar con IFs)
public class PaymentGatewayFactory {
    public IPaymentGateway Get(string gatewayName) {
        return gatewayName switch {
            "CyberSource" => new CyberSourceAdapter(),
            "PayU" => new PayUAdapter(),
            _ => throw new NotImplementedException()
        };
    }
}

// 4. Tu Core de Negocio (Limpio)
public class ProcesadorPagos {
    public void Cobrar(Pedido pedido) {
        // Al negocio NO LE IMPORTA cuál es el gateway.
        // Cumple OCP: Agregas WorkPay creando una clase nueva, sin tocar este método.
        var gateway = _factory.Get(pedido.GatewayPreferido);
        gateway.ProcesarPago(pedido.ToRequest());
    }
}
```

---

## 📉 2. PRODUCTIVIDAD Y MANTENIMIENTO

### ❓ ¿Cómo evito que la productividad tienda a cero?
**Respuesta:** Manteniendo constante el **Costo de Cambio**.
- Si agregar un campo te toma 1 hora hoy, debe tomarte 1 hora dentro de 5 años.
- Esto solo se logra **DESACOPLANDO**.
- Si tu código está desacoplado (como el ejemplo de arriba), agregar `WorkPay` no requiere volver a testear `CyberSource`.

### ❓ ¿Cómo saber si la arquitectura está "sana" o "enferma"?
**El Test del "Cambio Tonto":**
Imagina que te pido: *"Agrega un campo 'Apellido materno' al usuario"*.
- **Sana:** Tocas `Usuario.cs` (Entidad), `UsuarioDto.cs` (Contrato) y la UI. Tiempo: 20 mins.
- **Enferma:** Tocas 15 archivos, rompes 3 reportes que no sabías que existían, y la migración de DB falla. Tiempo: 3 días.

**Olor a Podrido (Code Smells Arquitectónicos):**
1. **Rigidez:** Es difícil cambiar algo pequeño (afecta a muchos sitios).
2. **Fragilidad:** Cambias "A" y se rompe "B" (que no tenía nada que ver).
3. **Inmovilidad:** No puedes reutilizar código (porque está pegado a la DB o UI).

---

## 🧱 3. LÍMITES Y NIVELES (Política vs Detalle)

### ❓ ¿Cómo diferenciar Política (Alto Nivel) de Detalle (Bajo Nivel)?
Usa la regla de la **Distancia al I/O (Input/Output)**.

- **Bajo Nivel (Detalle):** Código que toca DIRECTAMENTE el mundo físico.
  - SQL (`SELECT *`), HTTP (`GET /api`), HTML, JSON parsing, Configuración.
  - *Cambian frecuentemente por tecnología.*
  
- **Alto Nivel (Política):** Código que maneja conceptos puros, lejos de los cables.
  - Calcular Impuestos, Validar Fraude, Aprobar Préstamo.
  - *Cambian solo cuando el negocio cambia de opinión.*

**Ejercicio mental:**
Mira una clase. Si le quitas la base de datos y la web, ¿esa clase deja de tener sentido?
- Si deja de tener sentido → Es **Detalle**.
- Si sigue teniendo sentido lógico → Es **Política**.

### ❓ Listado de Detalles de Implementación (Cosas que NO son arquitectura)
Tu negocio no debería depender de NADA de esto:
1. **Bases de Datos:** SQL Server, Mongo, Oracle, Redis.
2. **Frameworks Web:** ASP.NET Core, Express, Spring Boot, Angular, React.
3. **Protocolos:** REST, GraphQL, gRPC, SOAP.
4. **Formatos:** JSON, XML, Protobuf.
5. **Librerías de Utilidad:** Log4Net, AutoMapper, Newtonsoft.
6. **Sistemas Operativos:** Windows path (`C:\`), Linux paths (`/usr`).
7. **Cloud:** AWS S3, Azure Blob Storage (usa interfaces `IFileStorage`).

---

## 🕸️ 4. ACOPLAMIENTO Y MICROSERVICIOS

### ❓ Pros y Contras de Microservicios
| Pros (Solo si eres Netflix/Uber) | Contras (Para el 99% de mortales) |
|---|---|
| Despliegue independiente | Complejidad operativa brutal (Kubernetes, trazas distribuidas) |
| Escalado independiente | Latencia de red (llamadas lentas) |
| Equipos autónomos (Team A no habla con Team B) | **Consistencia Eventual** (Datos desincronizados) |
| | Transactions distribuidas (Saga pattern es difícil) |

**Regla Senior:**
"Microservicios es el último recurso para escalar ORGANIZACIONES (equipos), no dessoftware. Si tienes 5 desarrolladores, haz un Monolito Modular."

### ❓ Dependencias Ocultas y Acoplamiento de Datos
Dices que los microservicios están desacoplados, pero...
Si el Servicio A le manda este JSON al Servicio B:
```json
{ "userId": 1, "role": "admin", "preferences": { ... } }
```
Y tú cambias `role` por `roles: []` en el Servicio A... **¡ROMPISTE EL SERVICIO B!**
Están acoplados por el **Esquema de Datos**.

**Tipos de Acoplamiento en Servicios:**
1. **Acoplamiento de Contenido:** Servicio A accede directo a la DB del Servicio B. (PECADO MORTAL).
2. **Acoplamiento de Datos (Común):** Comparten estructuras JSON/DTOs.
3. **Acoplamiento Temporal:** Servicio A necesita que B esté online AHORA para funcionar. (Si B cae, A cae).

**¿Cómo lograr desacoplamiento real?**
1. **Event Driven:** A lanza evento `UserCreated`. B lo escucha cuando quiere. (Desacoplamiento temporal).
2. **Consumer Driven Contracts:** B define qué formato necesita, A se asegura de cumplirlo.
3. **Bases de Datos Privadas:** Nadie toca la DB de otro servicio. Nunca.

### ❓ You Ain't Gonna Need It (YAGNI) vs Parálisis
¿Cuándo construir el límite?
**Respuesta:** Cuando el costo de NO tener el límite es mayor que el costo de construirlo.
- ¿Es probable que cambiemos la Base de Datos el próximo año? -> Probablemente No. -> **YAGNI** (No hagas repositorio genérico complejo, usa algo simple).
- ¿Es probable que agreguemos más Gateways de pago? -> SÍ (ya pasó). -> **Arquitectura Necesaria** (Haz la interfaz `IPaymentGateway` YA).

**Regla:** Abstrea aquello que tiene **historia de cambio frequente**. No abstraigas lo que es estable.
