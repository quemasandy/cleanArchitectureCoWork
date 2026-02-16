# 🏋️ Ejercicio: ¿Qué es una Entidad?

## 📖 Contexto

Imagina que eres un **médico** en un hospital. Cuando prescribes un medicamento:

1. Revisas las **alergias** del paciente
2. Calculas su **IMC** para ver su condición
3. Ajustas la **dosis** según el peso y la edad
4. Verificas que la dosis no sea **peligrosa**

Un médico hace todo esto **con papel, calculadora y su conocimiento**.

---

## 🎯 Tu Misión

En `problem.ts` verás **Entidades Anémicas** (el anti-patrón):
- `Patient`, `Medication`, `Prescription` son solo **bolsas de datos**
- No tienen métodos, no validan, no se protegen
- Toda la lógica está en una función externa `prescribeMedication()`

En `solution.ts` verás **Entidades Ricas** (la solución):
- Cada Entity **protege sus invariantes** (no permite datos inválidos)
- Cada Entity **encapsula su lógica** (Patient sabe calcular IMC)
- Cada Entity **es inmutable** (campos `readonly`)

---

## 📝 Instrucciones

```bash
# 1. Ejecuta el problema para ver las entidades anémicas
npx ts-node keyCode/09-business-rules/exercise-entities/problem.ts

# 2. Ejecuta la solución para ver entidades ricas
npx ts-node keyCode/09-business-rules/exercise-entities/solution.ts
```

## 🤔 Preguntas Guía

| # | Pregunta | Respuesta |
|:--|:---------|:----------|
| 1 | ¿Qué pasa si haces `patient.age = -5` en el problema? | ❓ |
| 2 | ¿Y en la solución? | ❓ |
| 3 | ¿Quién calcula el IMC en el problema? | ❓ |
| 4 | ¿Y en la solución? | ❓ |
| 5 | ¿Puedes crear una Prescription peligrosa en el problema? | ❓ |
| 6 | ¿Y en la solución? | ❓ |

> **Respuestas:** 1=Funciona sin error, 2=Error de compilación (readonly), 3=La función externa, 4=Patient.calculateBMI(), 5=Sí (no hay validación), 6=No (el constructor la rechaza)
