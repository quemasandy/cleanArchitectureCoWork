# 🧠 Ejercicio Guiado: Principio de Sustitución de Liskov (LSP)

## La regla

> **Los objetos de una superclase deben ser reemplazables por objetos de sus subclases sin romper la aplicación.**

Para que `Sub` pueda reemplazar a `Super`, `Sub` **TIENE** que tener **todos** los elementos de `Super`.

## Instrucciones

### Paso 1: Ejecuta el problema
```bash
npx ts-node ejercicios/03-lsp/ejercicio-guiado/problema.ts
```
Observa cómo el programa **se rompe** cuando una subclase reemplaza a la superclase.

### Paso 2: Responde estas preguntas
1. ¿Cuál subclase **NO puede** sustituir a `Vehicle`? ¿Por qué?
2. ¿Qué método de `Vehicle` esa subclase no puede cumplir?
3. ¿Por qué `Vehicle` promete algo que no todos sus hijos pueden hacer?

### Paso 3: Arréglalo tú mismo
Abre `problema.ts` y corrige la violación de LSP. Pistas:
- Si un hijo **no puede** hacer algo que el padre promete, el padre **promete demasiado**
- Separa las capacidades en interfaces más específicas
- El hijo solo debe implementar lo que **realmente puede hacer**

### Paso 4: Compara con la solución
```bash
npx ts-node ejercicios/03-lsp/ejercicio-guiado/solucion.ts
```

## 🔑 Recuerda
```
Super:  [charge] [refuel] [getSpeed]    ← El padre promete 3 cosas
  │
  ├── Car:     [charge] [refuel] [getSpeed]  ✅ Tiene TODO → puede sustituir
  │
  └── Bicycle: [charge] [???]    [getSpeed]  ❌ Le falta refuel → NO puede sustituir
```
Si `Sub` no tiene todo lo de `Super`, **no puede reemplazarlo**. Eso es violar LSP.
