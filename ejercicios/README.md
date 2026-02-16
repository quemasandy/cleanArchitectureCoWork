# 🏗️ keyCode — Clean Architecture Explicado con Código

## 📚 ¿Qué es esto?

**12 conceptos fundamentales** de Clean Architecture, cada uno con:
- `bad/main.ts` — ❌ Ejemplo de cómo **NO** hacer las cosas
- `good/main.ts` — ✅ Ejemplo de cómo **SÍ** hacer las cosas

Cada archivo es **ejecutable** y tiene **comentarios en español** explicando línea por línea el principio aplicado.

## 🚀 Cómo ejecutar

```bash
# Instalar dependencias (solo la primera vez)
npm install

# Ejecutar un ejemplo específico
npx ts-node 01-srp/bad/main.ts    # ❌ Mal ejemplo de SRP
npx ts-node 01-srp/good/main.ts   # ✅ Buen ejemplo de SRP

# Ejecutar TODOS los ejemplos
bash run-all.sh
```

## 📂 Estructura

| # | Concepto | Capítulo | ❌ Bad | ✅ Good |
|:--|:---------|:---------|:-------|:--------|
| **01** | SRP (Responsabilidad Única) | Cap. 7 | Employee hace todo | PayCalculator, Reporter, Repository separados |
| **02** | OCP (Abierto/Cerrado) | Cap. 8 | if/else por cada pasarela | Interface PaymentGateway + implementaciones |
| **03** | LSP (Sustitución de Liskov) | Cap. 9 | Penguin.fly() lanza error | FlyingBird vs SwimmingBird |
| **04** | ISP (Segregación de Interfaces) | Cap. 10 | Interface gorda MultiFunctionDevice | Printable, Scannable, Faxable separadas |
| **05** | DIP (Inversión de Dependencias) | Cap. 11 | NotificationService → Gmail directo | Interface EmailSender + inyección |
| **06** | Cohesión de Componentes | Cap. 13 | Un "utils" gigante con todo | PaymentModule, LoggingModule, etc. |
| **07** | Acoplamiento de Componentes | Cap. 14 | OrderService ↔ PaymentService circular | Interface rompe el ciclo |
| **08** | La Regla de Dependencia | Cap. 22 | Use Case con DynamoDB directo | 4 capas: Entity → UseCase → Adapter → Framework |
| **09** | Business Rules | Cap. 20 | Todo en el controller | Entity (empresa) + Use Case (aplicación) |
| **10** | Boundaries | Cap. 17 | GameApp monolítica | Logic + Data + UI separados |
| **11** | Screaming Architecture | Cap. 21 | routes/controllers/models | catalog/purchase/player-profile |
| **12** | Details (FW/Web/DB) | Cap. 30-32 | Lógica casada con Express | Misma lógica con Express, Lambda Y CLI |

## 📖 Orden de estudio recomendado

### Semana 1: SOLID (conceptos base)
1. `01-srp` → Responsabilidad Única
2. `02-ocp` → Abierto/Cerrado
3. `03-lsp` → Sustitución de Liskov
4. `04-isp` → Segregación de Interfaces
5. `05-dip` → Inversión de Dependencias

### Semana 2: Componentes
6. `06-component-cohesion` → REP, CCP, CRP
7. `07-component-coupling` → ADP, SDP, SAP

### Semana 3: Arquitectura
8. `08-dependency-rule` → La Regla de Dependencia (★ el más importante)
9. `09-business-rules` → Entities vs Use Cases
10. `10-boundaries` → Dónde dibujar líneas
11. `11-screaming-architecture` → La estructura grita el propósito
12. `12-details` → Frameworks/Web/BD son detalles

---

> 📖 Basado en **"Clean Architecture"** de Robert C. Martin
