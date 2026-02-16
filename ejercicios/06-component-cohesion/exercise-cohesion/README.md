# 🏋️ Ejercicio: ¿Qué es la Cohesión?

## 📖 Contexto

Imagina que trabajas en un **restaurante** que tiene un sistema para gestionar:
- Los pedidos de los clientes
- El inventario de ingredientes
- Las notificaciones por email/SMS
- La generación de reportes de ventas

Un programador junior puso **TODO** en una sola clase gigante llamada `RestaurantManager`.

---

## 🧠 ¿Qué es la Cohesión?

La cohesión mide **qué tan relacionadas están las responsabilidades dentro de un módulo**.

- **Alta cohesión** ✅ = Todas las funciones de un módulo trabajan hacia el **mismo propósito**
- **Baja cohesión** ❌ = Un módulo hace muchas cosas **no relacionadas entre sí**

> **Analogía**: Un chef que solo cocina tiene ALTA cohesión. Un chef que cocina, limpia baños, repara autos y da clases de yoga tiene BAJA cohesión.

---

## 🎯 Tu Misión

En el archivo `problem.ts` encontrarás la clase `RestaurantManager` con baja cohesión.

Tu tarea es:

1. **Identificar** los diferentes "grupos de responsabilidad" dentro de la clase
2. **Separar** cada grupo en su propia clase cohesiva
3. **Verificar** que cada clase nueva solo tiene métodos que están **fuertemente relacionados** entre sí

---

## 📝 Instrucciones

```bash
# 1. Primero ejecuta el problema para ver cómo funciona
npx ts-node keyCode/06-component-cohesion/exercise-cohesion/problem.ts

# 2. Luego intenta refactorizar en solution.ts por tu cuenta

# 3. Cuando termines, compara con la solución completa
npx ts-node keyCode/06-component-cohesion/exercise-cohesion/solution.ts
```

## 🤔 Preguntas Guía

Antes de programar, analiza cada método y responde:

| # | Método | ¿A qué grupo pertenece? | ¿Por qué? |
|:--|:-------|:------------------------|:-----------|
| 1 | `addMenuItem()` | ❓ | ❓ |
| 2 | `removeMenuItem()` | ❓ | ❓ |
| 3 | `takeOrder()` | ❓ | ❓ |
| 4 | `calculateTotal()` | ❓ | ❓ |
| 5 | `addStock()` | ❓ | ❓ |
| 6 | `checkStock()` | ❓ | ❓ |
| 7 | `sendEmailNotification()` | ❓ | ❓ |
| 8 | `sendSMSNotification()` | ❓ | ❓ |
| 9 | `generateSalesReport()` | ❓ | ❓ |
| 10 | `generateInventoryReport()` | ❓ | ❓ |

> **Respuestas:**
> - Grupo Menú: 1, 2
> - Grupo Pedidos: 3, 4
> - Grupo Inventario: 5, 6
> - Grupo Notificaciones: 7, 8
> - Grupo Reportes: 9, 10
