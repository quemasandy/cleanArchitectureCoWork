// ============================================================================
// ✅ BUEN EJEMPLO: Estructuras de Datos Funcionales (Inmutables)
// ============================================================================
// 📖 CONCEPTO (FP in Scala - Capítulo 3):
//    Una estructura de datos funcional se opera usando SOLO funciones puras.
//    Son INMUTABLES por definición. Así como 3 + 4 produce 7 sin modificar
//    el 3 ni el 4, agregar un elemento a una lista produce una NUEVA lista.
//
//    ¿No significa esto que copiamos todo cada vez? ¡NO!
//    Gracias al "structural sharing" (compartir estructura), las partes
//    que no cambian se REUSAN, no se copian.
//
//    Patrón clave: cada operación retorna una NUEVA estructura.
//    La original queda INTACTA para siempre.
// ============================================================================

// ============================================================================
// 📖 LISTA ENLAZADA INMUTABLE — La estructura funcional más fundamental
// ============================================================================
// En el libro, la lista se define así (en Scala):
//   sealed trait List[+A]
//   case object Nil extends List[Nothing]
//   case class Cons[+A](head: A, tail: List[A]) extends List[A]
//
// En TypeScript usamos "discriminated unions" para lograr lo mismo.
// ============================================================================

// ✅ Definimos los tipos de nuestra lista inmutable usando discriminated unions
// Un tipo "tag" nos permite distinguir entre lista vacía y lista con elementos
type FList<A> =
  | { readonly tag: "Nil" }                                        // Lista vacía
  | { readonly tag: "Cons"; readonly head: A; readonly tail: FList<A> }; // Elemento + resto

// ✅ Constructor para lista vacía — equivale a "case object Nil"
const Nil: FList<never> = { tag: "Nil" }; // Singleton inmutable

// ✅ Constructor para agregar un elemento al frente — equivale a "case class Cons"
function Cons<A>(head: A, tail: FList<A>): FList<A> {
  // ✅ Crea un NUEVO nodo que apunta al tail existente (structural sharing)
  return { tag: "Cons", head, tail }; // No copia tail, solo apunta a él
}

// ✅ Función de conveniencia: crear lista desde array
function listOf<A>(...items: A[]): FList<A> {
  // ✅ Construimos la lista de derecha a izquierda (reduceRight)
  return items.reduceRight<FList<A>>(
    (tail, head) => Cons(head, tail), // Cada elemento apunta al siguiente
    Nil                                // La lista termina con Nil
  );
}

// ✅ Convertir lista funcional a string para visualizar
function listToString<A>(list: FList<A>): string {
  // ✅ Recorremos la lista recursivamente usando pattern matching
  const items: A[] = []; // Solo para visualización
  let current = list;    // Variable local, no muta la lista
  // ✅ Recorremos sin mutar — solo leemos
  while (current.tag === "Cons") {
    items.push(current.head); // Acumulamos para mostrar
    current = current.tail;   // Avanzamos al siguiente nodo
  }
  // ✅ Retornamos representación legible
  return `[${items.join(", ")}]`;
}

// ============================================================================
// 📖 OPERACIONES FUNCIONALES — Cada una retorna una NUEVA lista
// ============================================================================

// ✅ Agregar un elemento al frente — O(1), no copia nada
function prepend<A>(item: A, list: FList<A>): FList<A> {
  // ✅ "Structural sharing": el nuevo nodo apunta a la lista existente
  // La lista original NO se modifica — el nuevo nodo simplemente la referencia
  return Cons(item, list); // O(1) — solo crea un nodo nuevo
}

// ✅ Eliminar el primer elemento — O(1), retorna el tail existente
function tail<A>(list: FList<A>): FList<A> {
  // ✅ Pattern matching con discriminated union
  if (list.tag === "Nil") return Nil; // Lista vacía → lista vacía
  return list.tail; // ✅ Retorna el tail — ya existe, no se copia
}

// ✅ Map: transformar cada elemento — retorna NUEVA lista
function map<A, B>(list: FList<A>, f: (a: A) => B): FList<B> {
  // ✅ Caso base: lista vacía → lista vacía
  if (list.tag === "Nil") return Nil;
  // ✅ Caso recursivo: aplica f al head, recurre sobre el tail
  return Cons(f(list.head), map(list.tail, f)); // Nueva lista completa
}

// ✅ Filter: mantener solo elementos que cumplen condición — NUEVA lista
function filter<A>(list: FList<A>, predicate: (a: A) => boolean): FList<A> {
  // ✅ Caso base: lista vacía → lista vacía
  if (list.tag === "Nil") return Nil;
  // ✅ Si el elemento cumple, lo incluimos; si no, lo saltamos
  if (predicate(list.head)) {
    return Cons(list.head, filter(list.tail, predicate)); // Incluir
  }
  return filter(list.tail, predicate); // Saltar
}

// ✅ Reduce (fold): combinar todos los elementos en un valor
function foldLeft<A, B>(list: FList<A>, initial: B, f: (acc: B, a: A) => B): B {
  // ✅ Caso base: lista vacía → retorna el acumulador
  if (list.tag === "Nil") return initial;
  // ✅ Caso recursivo: combina head con acumulador, recurre sobre tail
  return foldLeft(list.tail, f(initial, list.head), f); // Tail-recursive
}

// ============================================================================
// 🔬 DEMOSTRACIÓN: Inmutabilidad y structural sharing
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO — Estructuras de Datos Funcionales");
  console.log("=".repeat(55));

  // --- Demostración 1: Inmutabilidad total ---
  console.log("\n📌 Beneficio 1: Las operaciones NUNCA modifican la original");
  console.log("-".repeat(40));

  // ✅ Creamos una lista inmutable
  const original = listOf(10, 20, 30); // [10, 20, 30]
  console.log(`  Original:       ${listToString(original)}`);

  // ✅ Cada operación crea una NUEVA lista — la original no se toca
  const withPrepend = prepend(5, original);             // [5, 10, 20, 30]
  const withoutHead = tail(original);                    // [20, 30]
  const doubled = map(original, (x) => x * 2);          // [20, 40, 60]
  const onlyBig = filter(original, (x) => x > 15);      // [20, 30]

  console.log(`  prepend(5):     ${listToString(withPrepend)}`);
  console.log(`  tail():         ${listToString(withoutHead)}`);
  console.log(`  map(x => x*2):  ${listToString(doubled)}`);
  console.log(`  filter(x > 15): ${listToString(onlyBig)}`);
  console.log(`  Original:       ${listToString(original)} ← ¡INTACTA!`);

  // --- Demostración 2: Historial de versiones gratis ---
  console.log("\n📌 Beneficio 2: Historial de versiones gratuito");
  console.log("-".repeat(40));

  // ✅ Cada paso produce una "versión" nueva — todas coexisten en memoria
  const cart_v1 = listOf("Laptop");                       // v1: [Laptop]
  const cart_v2 = prepend("Mouse", cart_v1);              // v2: [Mouse, Laptop]
  const cart_v3 = prepend("Teclado", cart_v2);            // v3: [Teclado, Mouse, Laptop]
  const cart_v4 = tail(cart_v3);                           // v4: [Mouse, Laptop] — undo!

  // ✅ TODAS las versiones siguen accesibles — nada se destruyó
  console.log(`  Carrito v1: ${listToString(cart_v1)}`); // [Laptop]
  console.log(`  Carrito v2: ${listToString(cart_v2)}`); // [Mouse, Laptop]
  console.log(`  Carrito v3: ${listToString(cart_v3)}`); // [Teclado, Mouse, Laptop]
  console.log(`  Carrito v4: ${listToString(cart_v4)}`); // [Mouse, Laptop] — "undo"!
  console.log("  ✅ ¡Todas las versiones coexisten! Undo/redo gratis");

  // --- Demostración 3: Structural sharing ---
  console.log("\n📌 Beneficio 3: Structural sharing (eficiencia)");
  console.log("-".repeat(40));

  // ✅ prepend() crea UN SOLO nodo nuevo — reutiliza toda la lista existente
  const base = listOf(1, 2, 3);        // [1, 2, 3] — 3 nodos
  const extended = prepend(0, base);    // [0, 1, 2, 3] — 1 nodo nuevo + reutiliza los 3

  console.log(`  Base:     ${listToString(base)}`);
  console.log(`  Extended: ${listToString(extended)}`);
  console.log("  ✅ Extended reutiliza los nodos de Base (no los copia)");
  console.log("  ✅ prepend es O(1) — solo crea 1 nodo nuevo");

  // --- Demostración 4: Fold — combinar todos los elementos ---
  console.log("\n📌 Beneficio 4: Operaciones de alto nivel (fold/reduce)");
  console.log("-".repeat(40));

  const numbers = listOf(1, 2, 3, 4, 5); // [1, 2, 3, 4, 5]
  // ✅ Sumar todos los elementos
  const sum = foldLeft(numbers, 0, (acc, x) => acc + x); // 0+1+2+3+4+5 = 15
  // ✅ Multiplicar todos los elementos
  const product = foldLeft(numbers, 1, (acc, x) => acc * x); // 1*1*2*3*4*5 = 120
  // ✅ Contar elementos
  const count = foldLeft(numbers, 0, (acc, _) => acc + 1); // 5

  console.log(`  Lista:    ${listToString(numbers)}`);
  console.log(`  Suma:     ${sum}`);     // 15
  console.log(`  Producto: ${product}`); // 120
  console.log(`  Conteo:   ${count}`);   // 5

  // --- Resumen ---
  console.log("\n✅ BENEFICIOS:");
  console.log("  ✅ Operaciones retornan NUEVAS listas — original intacta");
  console.log("  ✅ Historial de versiones: todas las versiones coexisten");
  console.log("  ✅ Structural sharing: eficiente en memoria y tiempo");
  console.log("  ✅ No hay bugs por mutación compartida");
  console.log("  ✅ Fácil de testear: datos de entrada nunca cambian");
  console.log("  ✅ Undo/redo es trivial: simplemente guardas versiones anteriores");
}

// Ejecutamos el ejemplo
main();
