# 🏋️ Ejercicio: ¿Qué es el Acoplamiento y el Desacoplamiento?

## 📖 Contexto

Imagina que trabajas en una **tienda online** que procesa pedidos.
El sistema necesita:
- Procesar pagos (tarjeta de crédito)
- Enviar confirmaciones (email)
- Guardar pedidos (base de datos)

Un programador junior conectó TODO directamente: cada clase conoce los detalles internos de las demás.

---

## 🧠 ¿Qué es el Acoplamiento?

El acoplamiento mide **qué tanto depende un módulo de los detalles internos de otro**.

- **Alto acoplamiento** ❌ = Cambiar una clase **obliga** a cambiar muchas otras
- **Bajo acoplamiento (desacoplado)** ✅ = Puedes cambiar una clase **sin afectar** las demás

> **Analogía**: Un enchufe eléctrico está DESACOPLADO del aparato. Puedes cambiar la licuadora por una tostadora sin cambiar el enchufe. Si los cables estuvieran soldados directamente, tendrías ALTO acoplamiento.

---

## 🎯 Tu Misión

En `problem.ts` encontrarás un sistema donde `CheckoutService` está **fuertemente acoplado** a clases concretas (Stripe, SendGrid, PostgreSQL).

Tu tarea es:

1. **Identificar** las dependencias directas (acoplamiento)
2. **Crear interfaces** para desacoplar
3. **Inyectar** las dependencias desde afuera
4. **Verificar** que puedes cambiar Stripe por PayPal SIN tocar `CheckoutService`

---

## 📝 Instrucciones

```bash
# 1. Ejecuta el problema para ver cómo funciona
npx ts-node keyCode/07-component-coupling/exercise-coupling/problem.ts

# 2. Intenta completar solution.ts por tu cuenta

# 3. Compara con la solución completa
npx ts-node keyCode/07-component-coupling/exercise-coupling/solution.ts
```

## 🤔 Preguntas Guía

Responde antes de programar:

| # | Pregunta | Tu Respuesta |
|:--|:---------|:-------------|
| 1 | Si cambio de Stripe a PayPal, ¿cuántas clases toco en `problem.ts`? | ❓ |
| 2 | ¿Puedo testear `CheckoutService` sin una BD real? | ❓ |
| 3 | ¿Qué patrón rompe el acoplamiento directo? | ❓ |
| 4 | Si cambio de Stripe a PayPal, ¿cuántas clases toco en `solution.ts`? | ❓ |
| 5 | ¿Puedo testear `CheckoutService` con mocks en `solution.ts`? | ❓ |

> **Respuestas:** 1=Al menos 2 (Stripe + Checkout), 2=No, 3=Inversión de Dependencias (interfaces), 4=Solo 1 (creo PayPalGateway), 5=Sí, fácilmente
