# Lección: El Framework es un Detalle de Implementación

Este directorio contiene un ejercicio práctico para entender uno de los principios más discutidos de **Clean Architecture**: 

> "La Interfaz de Usuario (UI) es solo un detalle de implementación. Los casos de uso de tu aplicación deberían poder funcionar exactamente igual sin importar si usas React, Angular, Vue o una terminal de comandos."

---

## 🚫 01-bad-practice (El Problema)
En la carpeta `01-bad-practice` encontrarás el archivo `BadTodoList.tsx`. Esta es lamentablemente la forma más común de programar. El componente de React **sabe demasiado**:

- Sabe o genera el identificador (`id`).
- Sabe cómo alternar de estado (`isCompleted: !todo.isCompleted`).
- Aloja el estado global de tu negocio.

Si mañana quisiéramos migrar la aplicación a Angular... **¡Teníamos que reescribir y volver a pensar en toda la lógica de validación!** El framework de vista nos tiene amarrados a nuestro valor de negocio.

---

## ✅ 02-good-practice (La Solución Clean)
En la carpeta `02-good-practice` el proyecto está desacoplado siguiendo las reglas de dependencias:

1. **`core/entities/Todo.ts`**: Nuestras reglas vitales de negocio. La única responsable de decir cómo cambia un estado o si el texto es válido. No sabe nada de React ni de bases de datos.
2. **`core/interfaces/TodoRepository.ts`**: El contrato. Dice *qué* hace la persistencia (obtener, guardar), pero le da igual un SQL que un objeto local de Node.
3. **`core/use-cases/`**: Orquestan toda la operación de la empresa cruzando Entidad + Repositorio. (Agregar, Obtener, Cambiar).
4. **`infrastructure/InMemoryTodoRepository.ts`** Implementación estricta y detallada de infraestructura. Un adaptador de interfaz.
5. **`ui-react/` y `ui-angular/`**: Fíjate que puedes abrir cualquier componente. Son unos simples envoltorios visuales (Plugins) que *llaman* a los Use Cases. El Core quedó igual para ambos. 🚀

> **Nota**: Cada línea de código dentro de los archivos (`.ts`, `.tsx`) está minuciosamente comentada en español (`// ...`), mientras que el código permanece enteramente en inglés. Lee atentamente línea por línea.
