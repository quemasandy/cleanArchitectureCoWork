# 🏋️ Ejercicio: ¿Qué es un Plugin?

## 📖 Analogía del Navegador Web

Piensa en **Google Chrome**:
- 🌐 **Chrome** define: "Una extensión debe tener manifest.json con estos campos"
- 🧩 **AdBlock** implementa ese manifiesto → Chrome lo acepta
- ✅ Puedes **instalar** AdBlock sin recompilar Chrome
- ❌ Puedes **desinstalar** AdBlock sin romper Chrome
- 🔢 Chrome funciona con **0 extensiones** o con **50**

En Clean Architecture es igual:
- El **core** define interfaces (contratos)
- Los **detalles** implementan esos contratos como plugins
- BD, frameworks, servicios externos = todos son PLUGINS

---

## 📝 Instrucciones

```bash
# 1. Ejecuta el problema: switch/if gigante para cada método de pago
npx ts-node keyCode/10-boundaries/exercise-plugins/problem.ts

# 2. Ejecuta la solución: plugins enchufables
npx ts-node keyCode/10-boundaries/exercise-plugins/solution.ts
```

## 🤔 Preguntas Guía

| # | Pregunta | Respuesta |
|:--|:---------|:----------|
| 1 | En el problema, ¿cuántas líneas modificas para agregar criptomonedas? | ❓ |
| 2 | En la solución, ¿cuántas líneas modificas para agregar criptomonedas? | ❓ |
| 3 | En el problema, ¿puedes quitar PayPal en runtime? | ❓ |
| 4 | En la solución, ¿puedes quitar PayPal en runtime? | ❓ |

> **Respuestas:** 1=Modificar el switch + la lista de métodos (mínimo ~15 líneas del core), 2=CERO líneas del core, solo crear la clase y hacer register(), 3=No, está hardcodeado, 4=Sí, con unregister("paypal")
