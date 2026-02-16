# 🏋️ Ejercicio: ¿Qué es una Regla de Negocio?

## 📖 Contexto

Imagina que trabajas en un **banco** que aprueba préstamos personales.
Un analista de crédito hace esto **con papel y lápiz** todos los días:

1. Revisa si el cliente tiene más de 18 años
2. Calcula el puntaje crediticio según su historial
3. Determina la tasa de interés según el riesgo del cliente
4. Verifica que la cuota mensual no supere el 30% del ingreso del cliente

Ahora el banco quiere **automatizar** este proceso con una aplicación.

---

## 🎯 Tu Misión

En el archivo `problem.ts` encontrarás **TODO** el código mezclado en una sola función (el típico "God Function").

Tu tarea es:

1. **Identificar** cuáles son reglas de negocio de **EMPRESA** (Entity)
   - Pista: ¿Un analista haría esto con papel y lápiz, sin software?
   
2. **Identificar** cuáles son reglas de negocio de **APLICACIÓN** (Use Case)
   - Pista: ¿Esta regla solo existe porque hay una app automatizando el proceso?

3. **Refactorizar** el código en el archivo `solution.ts` separando:
   - `Entity`: Clase `LoanApplication` con las reglas de empresa
   - `Use Case`: Clase `EvaluateLoanUseCase` con las reglas de aplicación
   - `Adapter`: El controller/handler que solo convierte formatos

---

## 📝 Instrucciones

```bash
# 1. Primero ejecuta el problema para ver cómo funciona
npx ts-node keyCode/09-business-rules/exercise/problem.ts

# 2. Luego intenta completar solution.ts por tu cuenta

# 3. Cuando termines, compara con la solución completa
npx ts-node keyCode/09-business-rules/exercise/solution.ts
```

## 🤔 Preguntas Guía

Antes de programar, responde estas preguntas:

| # | Regla | ¿Empresa o App? | ¿Por qué? |
|:--|:------|:-----------------|:-----------|
| 1 | "El cliente debe ser mayor de 18 años" | ❓ | ❓ |
| 2 | "Calcular puntaje crediticio según historial" | ❓ | ❓ |
| 3 | "Enviar notificación por email al aprobar" | ❓ | ❓ |
| 4 | "Guardar la solicitud en la base de datos" | ❓ | ❓ |
| 5 | "La cuota no puede superar el 30% del ingreso" | ❓ | ❓ |
| 6 | "Registrar el log de la evaluación" | ❓ | ❓ |
| 7 | "Tasa de interés = 8% si riesgo bajo, 15% si medio, 25% si alto" | ❓ | ❓ |

> **Respuestas:** 1=Empresa, 2=Empresa, 3=App, 4=App, 5=Empresa, 6=App, 7=Empresa
