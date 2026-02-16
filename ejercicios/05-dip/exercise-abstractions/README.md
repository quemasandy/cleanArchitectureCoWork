# 🏋️ Ejercicio: ¿Qué es una Abstracción?

## 📖 Analogía del Enchufe

Piensa en un **enchufe de pared**:
- 🔌 El **enchufe** define la FORMA (2 pines, 120V) → **Interface**
- 📺 El **aparato** se conecta y funciona → **Implementación**
- 🏠 La **pared** tiene enchufes pero no sabe qué está conectado → **Servicio**

Sin abstracciones, es como **soldar** el televisor directamente al cable eléctrico.
Si quieres cambiar por una licuadora, tienes que arrancar los cables.

---

## 📝 Instrucciones

```bash
# 1. Ejecuta el problema: todo soldado a Gmail/Twilio/Firebase
npx ts-node keyCode/05-dip/exercise-abstractions/problem.ts

# 2. Ejecuta la solución: proveedores intercambiables
npx ts-node keyCode/05-dip/exercise-abstractions/solution.ts
```

## 🤔 Preguntas Guía

| # | Pregunta | Respuesta |
|:--|:---------|:----------|
| 1 | En el problema, ¿puedes cambiar Gmail por SendGrid sin tocar NotificationService? | ❓ |
| 2 | En la solución, ¿cuántas líneas cambias para migrar de proveedor? | ❓ |
| 3 | En el problema, ¿puedes testear sin enviar emails reales? | ❓ |
| 4 | En la solución, ¿cómo testeas sin enviar emails? | ❓ |

> **Respuestas:** 1=No, hay que reescribir la clase, 2=Solo la línea del constructor (1 línea), 3=No, está soldado a Gmail, 4=Usas FakeEmailSender que implementa la misma interface
