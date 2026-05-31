# 📚 Lecciones de Programación Funcional

Basado en el libro **"Functional Programming in Scala"** de Paul Chiusano y Rúnar Bjarnason.

Cada lección tiene dos subcarpetas:
- `bad/` — ❌ La forma **incorrecta** (imperativa, con side effects, acoplada)
- `good/` — ✅ La forma **correcta** (pura, composable, testeable)

## Ejecutar una lección

```bash
npx ts-node lessonsFn/01-intro-fp/bad/main.ts
npx ts-node lessonsFn/01-intro-fp/good/main.ts
```

## Lecciones

| # | Tema | Concepto Clave |
|---|------|---------------|
| 01 | [Intro a FP](./01-intro-fp) | Funciones puras vs side effects |
| 02 | [Estructuras de Datos Funcionales](./02-functional-data-structures) | Inmutabilidad y listas persistentes |
| 03 | [Manejo de Errores sin Excepciones](./03-error-handling) | Option y Either vs throw |
| 04 | [Estado Puramente Funcional](./04-purely-functional-state) | Estado como valor explícito (State<S,A>) |
| 05 | [Paralelismo Funcional](./05-purely-functional-parallelism) | Par<A>: describir vs ejecutar |
| 06 | [Stream Processing](./06-stream-processing) | Generators lazy y pipelines composables |
| 07 | [Property-Based Testing](./07-property-based-testing) | Propiedades universales vs tests frágiles |
| 08 | [Functors](./08-functors) | map() generalizado para cualquier contexto |
| 09 | [Monads](./09-monads) | flatMap para secuenciar operaciones dependientes |
| 10 | [Applicative Functors](./10-applicative-functors) | map2 para combinar validaciones independientes |
| 11 | [Efectos Externos e IO](./11-external-effects-io) | IO Monad: separar descripción de ejecución |

## Orden de estudio recomendado

1. **01-03**: Fundamentos (funciones puras, datos inmutables, errores)
2. **04-06**: Patrones intermedios (estado, paralelismo, streams)
3. **07**: Testing funcional
4. **08-10**: Abstracciones (Functor → Monad → Applicative)
5. **11**: Efectos del mundo real con IO
