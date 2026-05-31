// ============================================================================
// ✅ BUEN EJEMPLO: Functors — "map" generalizado para cualquier contenedor
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 11):
//    Un FUNCTOR es cualquier tipo F[A] que tiene una operación map:
//    map(fa: F[A], f: A => B): F[B]
//
//    En otras palabras: un Functor sabe cómo aplicar una función
//    AL VALOR DENTRO de un contexto, sin cambiar el contexto.
//
//    List, Option, Either, IO... todos son Functors.
//    Si algo tiene map(), es un Functor.
//
//    Leyes:
//    1. Identidad: map(fa, x => x) === fa
//       (mapear con identidad no cambia nada)
//    2. Composición: map(map(fa, f), g) === map(fa, x => g(f(x)))
//       (mapear f y luego g es lo mismo que mapear la composición)
// ============================================================================

// ============================================================================
// 📖 INTERFAZ FUNCTOR — Un solo patrón para todos los contenedores
// ============================================================================

// ✅ Interfaz genérica Functor: "cualquier cosa que tenga map"
interface Functor<F> {
  readonly map: <A, B>(fa: any, f: (a: A) => B) => any; // Transforma A→B dentro de F
}

// ============================================================================
// 📖 OPTION como Functor
// ============================================================================

// ✅ Tipo Option: valor presente o ausente
type Option<A> =
  | { readonly tag: "None" }                    // Sin valor
  | { readonly tag: "Some"; readonly value: A }; // Con valor

const None: Option<never> = { tag: "None" };     // Constructor de vacío
function Some<A>(value: A): Option<A> {
  return { tag: "Some", value }; // Constructor de valor presente
}

// ✅ Option es un Functor: implementa map
const optionFunctor: Functor<"Option"> = {
  map: <A, B>(fa: Option<A>, f: (a: A) => B): Option<B> => {
    if (fa.tag === "None") return None; // Sin valor → sin valor
    return Some(f(fa.value));           // Con valor → transforma el valor
  },
};

// ============================================================================
// 📖 EITHER como Functor
// ============================================================================

// ✅ Tipo Either: error o éxito
type Either<E, A> =
  | { readonly tag: "Left"; readonly error: E }   // Error
  | { readonly tag: "Right"; readonly value: A };  // Éxito

function Left<E>(error: E): Either<E, never> { return { tag: "Left", error }; }
function Right<A>(value: A): Either<never, A> { return { tag: "Right", value }; }

// ✅ Either es un Functor: implementa map (sobre el Right)
const eitherFunctor: Functor<"Either"> = {
  map: <A, B>(fa: Either<any, A>, f: (a: A) => B): Either<any, B> => {
    if (fa.tag === "Left") return fa;      // Error: lo propaga sin tocar
    return Right(f(fa.value));             // Éxito: transforma el valor
  },
};

// ============================================================================
// 📖 LISTA como Functor
// ============================================================================

// ✅ Array nativo es un Functor: implementa map
const listFunctor: Functor<"List"> = {
  map: <A, B>(fa: A[], f: (a: A) => B): B[] => {
    return fa.map(f); // Array.map ya implementa el patrón Functor
  },
};

// ============================================================================
// 📖 FUNCIONES GENÉRICAS — Escribes UNA VEZ, funciona con TODOS
// ============================================================================

// ✅ "double" como función PURA — es solo la transformación
const double = (n: number): number => n * 2;

// ✅ "addTax" como función PURA
const addTax = (n: number): number => n * 1.19;

// ✅ "formatPrice" como función PURA
const formatPrice = (n: number): string => `$${n.toFixed(2)}`;

// ✅ Función genérica lift: levanta una función al mundo de Functors
// Con lift, escribes la función UNA vez y funciona con Option, Either, List, etc.
function lift<A, B>(
  functor: Functor<any>, // Cualquier Functor
  f: (a: A) => B         // Función pura de A → B
): (fa: any) => any {
  // ✅ Retorna una nueva función que opera DENTRO del contexto
  return (fa: any) => functor.map(fa, f); // Aplica f dentro del Functor
}

// ============================================================================
// 🔬 DEMOSTRACIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO — Functors: map generalizado");
  console.log("=".repeat(55));

  // --- Beneficio 1: Una función, múltiples contextos ---
  console.log("\n📌 Beneficio 1: UNA función (double) para TODOS los contextos");
  console.log("-".repeat(40));

  // ✅ double() es UNA función pura — se aplica en cualquier Functor
  const doubledOption = optionFunctor.map(Some(50), double);  // Some(100)
  const doubledNone = optionFunctor.map(None, double);         // None
  const doubledRight = eitherFunctor.map(Right(42), double);  // Right(84)
  const doubledLeft = eitherFunctor.map(Left("error"), double); // Left("error")
  const doubledList = listFunctor.map([10, 20, 30], double);  // [20, 40, 60]

  console.log(`  Option Some(50) → ${doubledOption.tag === "Some" ? doubledOption.value : "None"}`);
  console.log(`  Option None → ${doubledNone.tag}`);
  console.log(`  Either Right(42) → ${doubledRight.tag === "Right" ? doubledRight.value : doubledRight.error}`);
  console.log(`  Either Left("error") → ${doubledLeft.tag === "Left" ? doubledLeft.error : ""}`);
  console.log(`  List [10,20,30] → [${doubledList.join(", ")}]`);
  console.log("  ✅ UNA función double(), TRES contextos diferentes");

  // --- Beneficio 2: Composición de transformaciones ---
  console.log("\n📌 Beneficio 2: Composición de maps");
  console.log("-".repeat(40));

  // ✅ Podemos encadenar map: primero addTax, luego formatPrice
  const price = Some(100);                                   // Some(100)
  const withTax = optionFunctor.map(price, addTax);          // Some(119)
  const formatted = optionFunctor.map(withTax, formatPrice); // Some("$119.00")

  console.log(`  Some(100) → addTax → formatPrice → ${formatted.tag === "Some" ? formatted.value : "None"}`);

  // ✅ La composición funciona igual con Either
  const eitherPrice: Either<string, number> = Right(200);
  const eitherWithTax = eitherFunctor.map(eitherPrice, addTax);
  const eitherFormatted = eitherFunctor.map(eitherWithTax, formatPrice);

  console.log(`  Right(200) → addTax → formatPrice → ${eitherFormatted.tag === "Right" ? eitherFormatted.value : ""}`);

  // ✅ Y con listas — mismas funciones!
  const prices = [100, 200, 300];
  const listWithTax = listFunctor.map(prices, addTax);
  const listFormatted = listFunctor.map(listWithTax, formatPrice);

  console.log(`  [100,200,300] → addTax → formatPrice → [${listFormatted.join(", ")}]`);
  console.log("  ✅ Mismas funciones puras (addTax, formatPrice) en 3 Functors");

  // --- Beneficio 3: lift — elevar funciones al mundo de Functors ---
  console.log("\n📌 Beneficio 3: lift — elevar funciones automáticamente");
  console.log("-".repeat(40));

  // ✅ lift crea versiones "Option-aware" o "Either-aware" de funciones puras
  const optionDouble = lift<number, number>(optionFunctor, double);
  const listDouble = lift<number, number>(listFunctor, double);

  console.log(`  liftedDouble(Some(25)) → ${optionDouble(Some(25)).value}`);
  console.log(`  liftedDouble([5,10]) → [${listDouble([5, 10]).join(", ")}]`);
  console.log("  ✅ lift() crea versiones contextualizadas automáticamente");

  // --- Beneficio 4: Leyes del Functor ---
  console.log("\n📌 Beneficio 4: Leyes del Functor (garantías)");
  console.log("-".repeat(40));

  // ✅ Ley 1: Identidad — map(fa, x => x) === fa
  const identity = (x: number) => x; // Función identidad
  const original = Some(42);
  const mapped = optionFunctor.map(original, identity);
  console.log(`  Ley identidad: map(Some(42), x=>x) = Some(${mapped.tag === "Some" ? mapped.value : "None"})`);
  console.log(`  ¿Preserva valor? ${mapped.tag === "Some" && mapped.value === 42}`); // true

  // ✅ Ley 2: Composición — map(map(fa, f), g) === map(fa, x => g(f(x)))
  const f = (x: number) => x + 10;      // Sumar 10
  const g = (x: number) => x * 3;       // Multiplicar por 3
  const compose = (x: number) => g(f(x)); // Composición

  const stepByStep = optionFunctor.map(optionFunctor.map(Some(5), f), g); // map(map(5, +10), *3)
  const composed = optionFunctor.map(Some(5), compose);                     // map(5, x => (x+10)*3)

  console.log(`  Paso a paso: map(map(5, +10), *3) = ${stepByStep.tag === "Some" ? stepByStep.value : ""}`);
  console.log(`  Compuesto:   map(5, x=>(x+10)*3) = ${composed.tag === "Some" ? composed.value : ""}`);
  console.log(`  ¿Iguales? ${stepByStep.tag === "Some" && composed.tag === "Some" && stepByStep.value === composed.value}`);

  // --- Resumen ---
  console.log("\n✅ BENEFICIOS:");
  console.log("  ✅ UNA interfaz (map) para List, Option, Either, y cualquier Functor");
  console.log("  ✅ Funciones puras reutilizables en CUALQUIER contexto");
  console.log("  ✅ lift() eleva funciones al mundo de Functors automáticamente");
  console.log("  ✅ Leyes garantizan comportamiento predecible");
  console.log("  ✅ Nuevo contenedor? Solo implementa map() y funciona con TODO");
}

// Ejecutamos el ejemplo
main();
