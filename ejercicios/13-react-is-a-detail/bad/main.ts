// ============================================================================
// ❌ MAL EJEMPLO: React (o cualquier framework UI) ES la arquitectura
// ============================================================================
// 📖 PRINCIPIO (Clean Architecture Cap. 32):
//    "Los frameworks son detalles, no formas de vida.
//     No te cases con un framework."
//
// 🚨 PROBLEMA: Toda la lógica de negocio vive DENTRO de "componentes React".
//    - Las reglas de negocio están atrapadas en hooks y handlers de componentes.
//    - Si mañana migras a Vue, Angular, Svelte, o una app de consola,
//      tienes que REESCRIBIR toda la lógica.
//    - No puedes testear la lógica sin montar un componente React.
//    - React dictó la arquitectura: tu app "ES" React, no "USA" React.
//
//    Esto se llama "Framework Lock-in": el framework se tragó tu negocio.
// ============================================================================

// ❌ Simulamos la API de React (useState, useEffect) para demostrar el problema
// En un proyecto real, esto sería: import { useState, useEffect } from 'react';

type SetState<T> = (value: T | ((prev: T) => T)) => void;
type State<T> = { value: T; set: SetState<T> };

function fakeUseState<T>(initial: T): State<T> {
  const state: State<T> = {
    value: initial,
    set: (val: T | ((prev: T) => T)) => {
      state.value = typeof val === "function" ? (val as Function)(state.value) : val;
    },
  };
  return state;
}

// ============================================================================
// ❌ "Componente" React con TODA la lógica de negocio adentro
// ============================================================================

// ❌ Este "componente" es el carrito de compras completo
// Si quieres cambiar de React a Vue, pierdes TODO esto
function ShoppingCartComponent() {
  // ❌ Estado de React contiene las reglas de negocio
  const items = fakeUseState<
    { id: string; name: string; price: number; quantity: number }[]
  >([]);
  const discount = fakeUseState<number>(0);
  const error = fakeUseState<string>("");

  // ❌ Regla de negocio #1: Agregar al carrito está DENTRO del componente
  function handleAddItem(name: string, price: number) {
    if (price <= 0) {
      error.set("Precio inválido");
      console.log("    ❌ Error: Precio inválido");
      return;
    }

    // ❌ Regla: no más de 10 unidades por producto
    const existing = items.value.find((i) => i.name === name);
    if (existing && existing.quantity >= 10) {
      error.set(`Máximo 10 unidades de ${name}`);
      console.log(`    ❌ Error: Máximo 10 unidades de ${name}`);
      return;
    }

    if (existing) {
      items.set((prev) =>
        prev.map((i) =>
          i.name === name ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
      console.log(`    🛒 +1 ${name} (ya estaba en carrito)`);
    } else {
      const newItem = {
        id: `ITEM-${Date.now()}`,
        name,
        price,
        quantity: 1,
      };
      items.set((prev) => [...prev, newItem]);
      console.log(`    🛒 Agregado: ${name} $${price}`);
    }
    error.set("");
  }

  // ❌ Regla de negocio #2: Cálculo de descuento DENTRO del componente
  function handleApplyDiscount(code: string) {
    // ❌ Reglas de descuento hardcodeadas en el componente React
    const discountCodes: Record<string, number> = {
      SAVE10: 10,
      SAVE20: 20,
      VIP50: 50,
    };

    if (discountCodes[code]) {
      discount.set(discountCodes[code]);
      console.log(`    🏷️  Descuento aplicado: ${discountCodes[code]}%`);
    } else {
      error.set("Código de descuento inválido");
      console.log("    ❌ Código de descuento inválido");
    }
  }

  // ❌ Regla de negocio #3: Cálculo del total DENTRO del componente
  function calculateTotal(): {
    subtotal: number;
    discountAmount: number;
    tax: number;
    total: number;
  } {
    const subtotal = items.value.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discountAmount = subtotal * (discount.value / 100);
    const afterDiscount = subtotal - discountAmount;

    // ❌ Regla de impuestos está en el componente React
    const taxRate = afterDiscount > 100 ? 0.19 : 0.16; // regla colombiana simulada
    const tax = afterDiscount * taxRate;
    const total = afterDiscount + tax;

    return { subtotal, discountAmount, tax, total };
  }

  // ❌ Regla de negocio #4: Validar checkout DENTRO del componente
  function handleCheckout(): boolean {
    if (items.value.length === 0) {
      error.set("Carrito vacío, no se puede hacer checkout");
      console.log("    ❌ Carrito vacío");
      return false;
    }

    const totals = calculateTotal();

    // ❌ Regla de negocio: compra mínima de $10
    if (totals.total < 10) {
      error.set("Compra mínima de $10");
      console.log("    ❌ Compra mínima de $10");
      return false;
    }

    console.log(`    ✅ Checkout exitoso! Total: $${totals.total.toFixed(2)}`);
    return true;
  }

  // Retornamos todo (simula lo que el JSX usaría)
  return { handleAddItem, handleApplyDiscount, calculateTotal, handleCheckout, items, error };
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO - React ES la arquitectura");
  console.log("=".repeat(55));

  console.log("\n📖 Cap.32: 'Los frameworks son detalles, no formas de vida'");
  console.log("🚨 Aquí React SE TRAGÓ toda la lógica de negocio.\n");

  // Usamos el "componente" como si fuera la app entera
  const cart = ShoppingCartComponent();

  console.log("🛒 Agregando productos:");
  cart.handleAddItem("Laptop", 999);
  cart.handleAddItem("Mouse", 25);
  cart.handleAddItem("Mouse", 25); // segunda unidad
  cart.handleAddItem("Cable USB", -5); // precio inválido

  console.log("\n🏷️  Aplicando descuento:");
  cart.handleApplyDiscount("SAVE10");

  console.log("\n💰 Calculando total:");
  const totals = cart.calculateTotal();
  console.log(`    Subtotal:   $${totals.subtotal.toFixed(2)}`);
  console.log(`    Descuento:  -$${totals.discountAmount.toFixed(2)}`);
  console.log(`    Impuesto:   +$${totals.tax.toFixed(2)}`);
  console.log(`    TOTAL:      $${totals.total.toFixed(2)}`);

  console.log("\n🏁 Checkout:");
  cart.handleCheckout();

  console.log("\n\n⚠️  PROBLEMAS:");
  console.log("  ❌ Todas las reglas de negocio están DENTRO de ShoppingCartComponent");
  console.log("  ❌ Si migras a Vue/Angular/Svelte/CLI → REESCRIBES todo");
  console.log("  ❌ No puedes testear la lógica sin simular useState/useEffect");
  console.log("  ❌ Las reglas de descuento, impuestos, checkout están acopladas a React");
  console.log("  ❌ React NO es un detalle, es LA ARQUITECTURA de tu app");
  console.log("  ❌ Cap.32: 'No dejes que el framework tome las decisiones mayores'");
}

main();
