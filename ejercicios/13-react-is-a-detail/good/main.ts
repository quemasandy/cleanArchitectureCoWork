// ============================================================================
// ✅ BUEN EJEMPLO: React es solo un DETALLE (Mini-Proyecto Shopping Cart)
// ============================================================================
// 📖 PRINCIPIO (Clean Architecture Cap. 32):
//    "Los frameworks son detalles. Tu arquitectura NO debe depender de ellos.
//     Los frameworks son herramientas, no formas de vida."
//
// ✅ SOLUCIÓN:
//    La lógica de negocio del carrito de compras es PURA y FRAMEWORK-AGNOSTIC.
//    React, Vue, Angular, CLI, o incluso una API REST son solo "adaptadores"
//    que CONSUMEN la misma lógica.
//
//    Si mañana decides cambiar React por Svelte:
//    - Entities: NO cambian (Cart, CartItem, DiscountCode)
//    - Use Cases: NO cambian (AddToCart, ApplyDiscount, Checkout)
//    - Solo reemplazas el ADAPTADOR de UI
//
//    ESTO es lo que significa "React es un detalle":
//    Tu negocio no sabe ni le importa que React existe.
// ============================================================================

// ============================================================================
// 🟢 CAPA 1: ENTITIES (reglas de negocio puras - NO conocen React)
// ============================================================================

class CartItem {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number,
    public quantity: number = 1
  ) {
    // ✅ Validación de negocio en la entidad
    if (price <= 0) throw new Error(`Precio inválido para ${name}: $${price}`);
    if (quantity < 1) throw new Error("Cantidad debe ser al menos 1");
  }

  // ✅ Regla de negocio pura: max 10 unidades
  canAddMore(): boolean {
    return this.quantity < 10;
  }

  incrementQuantity(): void {
    if (!this.canAddMore()) {
      throw new Error(`Máximo 10 unidades de ${this.name}`);
    }
    this.quantity++;
  }

  getSubtotal(): number {
    return this.price * this.quantity;
  }
}

// ✅ Entidad con reglas de descuento - PURA, sin framework
class DiscountCode {
  private static readonly VALID_CODES: Record<string, number> = {
    SAVE10: 10,
    SAVE20: 20,
    VIP50: 50,
  };

  public readonly percentage: number;

  constructor(public readonly code: string) {
    const pct = DiscountCode.VALID_CODES[code];
    if (!pct) throw new Error(`Código de descuento inválido: ${code}`);
    this.percentage = pct;
  }

  applyTo(amount: number): number {
    return amount * (this.percentage / 100);
  }
}

// ✅ Entidad que calcula impuestos - PURA, sin framework
class TaxCalculator {
  // Regla colombiana simulada: >$100 = 19%, sino 16%
  static calculate(amount: number): { rate: number; tax: number } {
    const rate = amount > 100 ? 0.19 : 0.16;
    return { rate, tax: amount * rate };
  }
}

// ✅ Agregado: Carrito completo como entidad de negocio
class Cart {
  private items: CartItem[] = [];
  private discount: DiscountCode | null = null;

  addItem(name: string, price: number): CartItem {
    const existing = this.items.find((i) => i.name === name);
    if (existing) {
      existing.incrementQuantity();
      return existing;
    }
    const item = new CartItem(`ITEM-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, price);
    this.items.push(item);
    return item;
  }

  applyDiscount(code: string): DiscountCode {
    this.discount = new DiscountCode(code);
    return this.discount;
  }

  getItems(): ReadonlyArray<CartItem> {
    return [...this.items];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // ✅ Cálculos de negocio puros
  calculateTotals(): CartTotals {
    const subtotal = this.items.reduce((sum, item) => sum + item.getSubtotal(), 0);
    const discountAmount = this.discount ? this.discount.applyTo(subtotal) : 0;
    const afterDiscount = subtotal - discountAmount;
    const { rate: taxRate, tax } = TaxCalculator.calculate(afterDiscount);
    const total = afterDiscount + tax;

    return {
      subtotal,
      discountPercentage: this.discount?.percentage ?? 0,
      discountAmount,
      taxRate,
      tax,
      total,
      itemCount: this.items.length,
    };
  }
}

interface CartTotals {
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  taxRate: number;
  tax: number;
  total: number;
  itemCount: number;
}

// ============================================================================
// 🟡 CAPA 2: USE CASES (orquestan entidades - NO conocen React)
// ============================================================================

// ✅ Input/Output del Use Case - formato de DOMINIO, no de React/HTML
interface AddToCartInput {
  productName: string;
  price: number;
}

interface AddToCartOutput {
  success: boolean;
  itemId?: string;
  itemName?: string;
  quantity?: number;
  error?: string;
}

class AddToCartUseCase {
  constructor(private cart: Cart) { }

  execute(input: AddToCartInput): AddToCartOutput {
    try {
      const item = this.cart.addItem(input.productName, input.price);
      return {
        success: true,
        itemId: item.id,
        itemName: item.name,
        quantity: item.quantity,
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

interface ApplyDiscountOutput {
  success: boolean;
  percentage?: number;
  error?: string;
}

class ApplyDiscountUseCase {
  constructor(private cart: Cart) { }

  execute(code: string): ApplyDiscountOutput {
    try {
      const discount = this.cart.applyDiscount(code);
      return { success: true, percentage: discount.percentage };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

interface CheckoutOutput {
  success: boolean;
  totals?: CartTotals;
  error?: string;
}

class CheckoutUseCase {
  constructor(private cart: Cart) { }

  execute(): CheckoutOutput {
    if (this.cart.isEmpty()) {
      return { success: false, error: "Carrito vacío, no se puede hacer checkout" };
    }

    const totals = this.cart.calculateTotals();

    // Regla de negocio: compra mínima de $10
    if (totals.total < 10) {
      return { success: false, error: `Compra mínima $10. Total actual: $${totals.total.toFixed(2)}` };
    }

    return { success: true, totals };
  }
}

class GetCartSummaryUseCase {
  constructor(private cart: Cart) { }

  execute(): { items: { name: string; price: number; quantity: number; subtotal: number }[]; totals: CartTotals } {
    return {
      items: this.cart.getItems().map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        subtotal: i.getSubtotal(),
      })),
      totals: this.cart.calculateTotals(),
    };
  }
}

// ============================================================================
// 🔴 CAPA 3: ADAPTADORES DE UI - Aquí es donde React (o lo que sea) vive
// La MISMA lógica funciona con React, Vue, Angular, CLI, o API REST
// ============================================================================

// ✅ ADAPTADOR 1: "React" (simulado)
// En un proyecto real, estos serían componentes funcionales con JSX
class ReactAdapter {
  // Simula useState internamente
  private uiState = { lastMessage: "", errorMessage: "" };

  constructor(
    private addToCart: AddToCartUseCase,
    private applyDiscount: ApplyDiscountUseCase,
    private checkout: CheckoutUseCase,
    private getCartSummary: GetCartSummaryUseCase
  ) { }

  // ✅ En React real sería: const handleAddToCart = () => { ... }
  // Lo importante: el handler DELEGA al use case, no contiene lógica
  onAddButtonClick(productName: string, price: number): void {
    console.log(`    ⚛️  [React] onClick → AddToCart`);
    const result = this.addToCart.execute({ productName, price });
    if (result.success) {
      // En React real: setState({ message: ... })
      this.uiState.lastMessage = `Agregado: ${result.itemName} (x${result.quantity})`;
      console.log(`    ⚛️  [React] setState → "${this.uiState.lastMessage}"`);
    } else {
      this.uiState.errorMessage = result.error!;
      console.log(`    ⚛️  [React] setState error → "${this.uiState.errorMessage}"`);
    }
  }

  // ✅ En React real sería: const handleApplyDiscount = (code) => { ... }
  onApplyDiscountClick(code: string): void {
    console.log(`    ⚛️  [React] onClick → ApplyDiscount`);
    const result = this.applyDiscount.execute(code);
    if (result.success) {
      this.uiState.lastMessage = `Descuento ${result.percentage}% aplicado`;
      console.log(`    ⚛️  [React] setState → "${this.uiState.lastMessage}"`);
    } else {
      this.uiState.errorMessage = result.error!;
      console.log(`    ⚛️  [React] setState error → "${this.uiState.errorMessage}"`);
    }
  }

  // ✅ Renderizado: en React real sería el return del JSX
  render(): void {
    const summary = this.getCartSummary.execute();
    console.log(`    ⚛️  [React] render():`);
    console.log(`    ┌─────────────────────────────────────┐`);
    console.log(`    │  🛒 Shopping Cart (React)           │`);
    console.log(`    ├─────────────────────────────────────┤`);
    summary.items.forEach((item) => {
      console.log(`    │  ${item.name.padEnd(15)} x${item.quantity}  $${item.subtotal.toFixed(2).padStart(8)} │`);
    });
    console.log(`    ├─────────────────────────────────────┤`);
    console.log(`    │  Subtotal:          $${summary.totals.subtotal.toFixed(2).padStart(8)}   │`);
    if (summary.totals.discountPercentage > 0) {
      console.log(`    │  Descuento (${summary.totals.discountPercentage}%):   -$${summary.totals.discountAmount.toFixed(2).padStart(8)}   │`);
    }
    console.log(`    │  Impuesto (${(summary.totals.taxRate * 100).toFixed(0)}%):   +$${summary.totals.tax.toFixed(2).padStart(8)}   │`);
    console.log(`    │  TOTAL:             $${summary.totals.total.toFixed(2).padStart(8)}   │`);
    console.log(`    └─────────────────────────────────────┘`);
  }

  onCheckoutClick(): void {
    console.log(`    ⚛️  [React] onClick → Checkout`);
    const result = this.checkout.execute();
    if (result.success) {
      console.log(`    ⚛️  [React] ✅ Navegar a /checkout/success`);
    } else {
      this.uiState.errorMessage = result.error!;
      console.log(`    ⚛️  [React] ❌ Mostrar modal error: "${result.error}"`);
    }
  }
}

// ✅ ADAPTADOR 2: "Vue" (simulado) — MISMA lógica, diferente framework
class VueAdapter {
  // Simula ref() de Vue
  private data = { message: "", error: "" };

  constructor(
    private addToCart: AddToCartUseCase,
    private applyDiscount: ApplyDiscountUseCase,
    private checkout: CheckoutUseCase,
    private getCartSummary: GetCartSummaryUseCase
  ) { }

  // ✅ En Vue real: @click="addToCart" en el template
  addToCartMethod(productName: string, price: number): void {
    console.log(`    🟢 [Vue] @click → addToCart method`);
    const result = this.addToCart.execute({ productName, price });
    if (result.success) {
      this.data.message = `Agregado: ${result.itemName} (x${result.quantity})`;
      console.log(`    🟢 [Vue] this.message = "${this.data.message}"`);
    } else {
      this.data.error = result.error!;
      console.log(`    🟢 [Vue] this.error = "${this.data.error}"`);
    }
  }

  applyDiscountMethod(code: string): void {
    console.log(`    🟢 [Vue] @click → applyDiscount method`);
    const result = this.applyDiscount.execute(code);
    if (result.success) {
      this.data.message = `Descuento ${result.percentage}% aplicado!`;
      console.log(`    🟢 [Vue] this.message = "${this.data.message}"`);
    } else {
      this.data.error = result.error!;
      console.log(`    🟢 [Vue] this.error = "${this.data.error}"`);
    }
  }

  // ✅ En Vue real: <template> con v-for
  template(): void {
    const summary = this.getCartSummary.execute();
    console.log(`    🟢 [Vue] <template> render:`);
    console.log(`    ┌─────────────────────────────────────┐`);
    console.log(`    │  🛒 Shopping Cart (Vue)             │`);
    console.log(`    ├─────────────────────────────────────┤`);
    summary.items.forEach((item) => {
      console.log(`    │  ${item.name.padEnd(15)} x${item.quantity}  $${item.subtotal.toFixed(2).padStart(8)} │`);
    });
    console.log(`    ├─────────────────────────────────────┤`);
    console.log(`    │  TOTAL:             $${summary.totals.total.toFixed(2).padStart(8)}   │`);
    console.log(`    └─────────────────────────────────────┘`);
  }

  checkoutMethod(): void {
    console.log(`    🟢 [Vue] @click → checkout method`);
    const result = this.checkout.execute();
    if (result.success) {
      console.log(`    🟢 [Vue] ✅ this.$router.push('/success')`);
    } else {
      console.log(`    🟢 [Vue] ❌ Toast: "${result.error}"`);
    }
  }
}

// ✅ ADAPTADOR 3: CLI — MISMA lógica, sin framework de UI
class CLIAdapter {
  constructor(
    private addToCart: AddToCartUseCase,
    private applyDiscount: ApplyDiscountUseCase,
    private checkout: CheckoutUseCase,
    private getCartSummary: GetCartSummaryUseCase
  ) { }

  runAdd(productName: string, price: number): void {
    console.log(`    💻 [CLI] cart add "${productName}" --price=${price}`);
    const result = this.addToCart.execute({ productName, price });
    console.log(
      result.success
        ? `    💻 [CLI] ✅ ${result.itemName} agregado (x${result.quantity})`
        : `    💻 [CLI] ❌ ${result.error}`
    );
  }

  runDiscount(code: string): void {
    console.log(`    💻 [CLI] cart discount ${code}`);
    const result = this.applyDiscount.execute(code);
    console.log(
      result.success
        ? `    💻 [CLI] ✅ Descuento ${result.percentage}% aplicado`
        : `    💻 [CLI] ❌ ${result.error}`
    );
  }

  runCheckout(): void {
    console.log(`    💻 [CLI] cart checkout`);
    const result = this.checkout.execute();
    if (result.success) {
      const t = result.totals!;
      console.log(`    💻 [CLI] ✅ Orden procesada:`);
      console.log(`              Subtotal: $${t.subtotal.toFixed(2)}`);
      console.log(`              Desc:    -$${t.discountAmount.toFixed(2)}`);
      console.log(`              Tax:     +$${t.tax.toFixed(2)}`);
      console.log(`              TOTAL:    $${t.total.toFixed(2)}`);
    } else {
      console.log(`    💻 [CLI] ❌ ${result.error}`);
    }
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO - React es solo un DETALLE");
  console.log("=".repeat(55));
  console.log("\n📖 Cap.32: 'Los frameworks son herramientas,");
  console.log("   no formas de vida. No te cases con un framework.'\n");

  // ===================================================================
  // ESCENARIO 1: La app de React
  // ===================================================================
  console.log("⚛️  ESCENARIO 1: Carrito de compras con REACT");
  console.log("-".repeat(50));

  const cart1 = new Cart();
  const reactApp = new ReactAdapter(
    new AddToCartUseCase(cart1),
    new ApplyDiscountUseCase(cart1),
    new CheckoutUseCase(cart1),
    new GetCartSummaryUseCase(cart1)
  );

  console.log("\n  📦 Usuario agrega productos (clicks en React):");
  reactApp.onAddButtonClick("Laptop", 999);
  reactApp.onAddButtonClick("Mouse", 25);
  reactApp.onAddButtonClick("Mouse", 25); // +1

  console.log("\n  🏷️  Usuario aplica descuento:");
  reactApp.onApplyDiscountClick("SAVE10");

  console.log("\n  🖥️  React renderiza el carrito:");
  reactApp.render();

  console.log("\n  🏁 Usuario hace checkout:");
  reactApp.onCheckoutClick();

  // ===================================================================
  // ESCENARIO 2: MISMA app, ahora con Vue
  // ===================================================================
  console.log("\n\n🟢 ESCENARIO 2: MISMA lógica con VUE");
  console.log("-".repeat(50));

  const cart2 = new Cart(); // nuevo carrito, misma lógica
  const vueApp = new VueAdapter(
    new AddToCartUseCase(cart2),
    new ApplyDiscountUseCase(cart2),
    new CheckoutUseCase(cart2),
    new GetCartSummaryUseCase(cart2)
  );

  console.log("\n  📦 Usuario agrega productos (clicks en Vue):");
  vueApp.addToCartMethod("Laptop", 999);
  vueApp.addToCartMethod("Teclado", 75);

  console.log("\n  🏷️  Usuario aplica descuento:");
  vueApp.applyDiscountMethod("SAVE20");

  console.log("\n  🖥️  Vue renderiza el carrito:");
  vueApp.template();

  console.log("\n  🏁 Usuario hace checkout:");
  vueApp.checkoutMethod();

  // ===================================================================
  // ESCENARIO 3: MISMA lógica desde CLI (sin UI alguna)
  // ===================================================================
  console.log("\n\n💻 ESCENARIO 3: MISMA lógica desde CLI");
  console.log("-".repeat(50));

  const cart3 = new Cart();
  const cliApp = new CLIAdapter(
    new AddToCartUseCase(cart3),
    new ApplyDiscountUseCase(cart3),
    new CheckoutUseCase(cart3),
    new GetCartSummaryUseCase(cart3)
  );

  console.log("\n  📦 Usuario agrega productos (terminal):");
  cliApp.runAdd("Monitor", 350);
  cliApp.runAdd("Webcam", 89);

  console.log("\n  🏷️  Descuento:");
  cliApp.runDiscount("VIP50");

  console.log("\n  🏁 Checkout:");
  cliApp.runCheckout();

  // ===================================================================
  // RESUMEN FINAL
  // ===================================================================
  console.log("\n\n" + "=".repeat(55));
  console.log("🎯 ¿QUÉ DEMUESTRA ESTE EJEMPLO?");
  console.log("=".repeat(55));
  console.log(`
  ✅ La MISMA lógica de negocio funcionó con:
     - React (Adaptador 1)
     - Vue   (Adaptador 2)
     - CLI   (Adaptador 3)

  ✅ ¿Qué NO cambió al migrar de React a Vue?
     - Cart, CartItem, DiscountCode    → Entities (INTACTAS)
     - AddToCartUseCase                → Use Case (INTACTO)
     - ApplyDiscountUseCase            → Use Case (INTACTO)
     - CheckoutUseCase                 → Use Case (INTACTO)
     - GetCartSummaryUseCase           → Use Case (INTACTO)
     - Reglas de descuento, impuestos  → Negocio  (INTACTO)

  ✅ ¿Qué SÍ cambió?
     - SOLO el adaptador de UI (la capa más externa)
     - ReactAdapter → VueAdapter (o Angular, Svelte, etc.)

  📖 Cap.32: "Tu arquitectura debe permitir que la decisión
     sobre el framework se difiera y sea reemplazable."

  💡 MORALEJA: React no es tu arquitectura.
     React es un PLUGIN de visualización.
     Tu negocio es el centro. React vive en el borde.
  `);
}

main();
