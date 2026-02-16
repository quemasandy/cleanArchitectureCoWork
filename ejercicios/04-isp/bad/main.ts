// ============================================================================
// ❌ MAL EJEMPLO: Violación del Principio de Segregación de Interfaces (ISP)
// ============================================================================
// 📖 PRINCIPIO: "No fuerces a los clientes a depender de interfaces
//    que no usan"
//    - Robert C. Martin, Clean Architecture Cap. 10
//
// 🚨 PROBLEMA: Una interface GIGANTE que obliga a TODOS los dispositivos
//    a implementar métodos que no necesitan. Una impresora básica
//    no debería verse obligada a implementar scan() o fax().
//
//    En la vida real: APIs que retornan 50 campos cuando solo necesitas 3.
// ============================================================================

// ❌ Interface GORDA que obliga a implementar TODO
// Cualquier "dispositivo multifunción" debe implementar las 6 funciones
// aunque solo necesite 1 o 2
interface MultiFunctionDevice {
  // Funciones de impresión
  print(document: string): void;
  printDuplex(document: string): void;

  // Funciones de escaneo
  scan(document: string): string;
  scanToEmail(document: string, email: string): void;

  // Funciones de fax
  fax(document: string, number: string): void;

  // Funciones de almacenamiento
  saveToCloud(document: string): string;
}

// ✅ La impresora de lujo implementa TODO correctamente
class PremiumPrinter implements MultiFunctionDevice {
  print(document: string): void {
    console.log(`  🖨️  Premium: Imprimiendo "${document}"`);
  }

  printDuplex(document: string): void {
    console.log(`  🖨️  Premium: Imprimiendo duplex "${document}"`);
  }

  scan(document: string): string {
    console.log(`  📸 Premium: Escaneando "${document}"`);
    return `scan_${document}`;
  }

  scanToEmail(document: string, email: string): void {
    console.log(`  📧 Premium: Escaneando "${document}" y enviando a ${email}`);
  }

  fax(document: string, number: string): void {
    console.log(`  📠 Premium: Enviando fax de "${document}" a ${number}`);
  }

  saveToCloud(document: string): string {
    console.log(`  ☁️  Premium: Guardando "${document}" en la nube`);
    return `cloud://docs/${document}`;
  }
}

// ❌ La impresora básica se ve FORZADA a implementar métodos que NO tiene
class BasicPrinter implements MultiFunctionDevice {
  // ✅ Esto sí lo necesita
  print(document: string): void {
    console.log(`  🖨️  Básica: Imprimiendo "${document}"`);
  }

  // ❌ FORZADA a implementar: una impresora básica no tiene duplex
  printDuplex(document: string): void {
    throw new Error("❌ ¡Esta impresora NO soporta impresión duplex!");
  }

  // ❌ FORZADA a implementar: una impresora básica no escanea
  scan(document: string): string {
    throw new Error("❌ ¡Esta impresora NO tiene escáner!");
  }

  // ❌ FORZADA a implementar: no puede escanear ni enviar emails
  scanToEmail(document: string, email: string): void {
    throw new Error("❌ ¡Esta impresora NO puede escanear ni enviar emails!");
  }

  // ❌ FORZADA a implementar: no tiene módulo de fax
  fax(document: string, number: string): void {
    throw new Error("❌ ¡Esta impresora NO tiene fax!");
  }

  // ❌ FORZADA a implementar: no tiene conexión a la nube
  saveToCloud(document: string): string {
    throw new Error("❌ ¡Esta impresora NO tiene conexión WiFi!");
  }
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO - Violación de ISP");
  console.log("=".repeat(50));

  const premium = new PremiumPrinter();
  const basic = new BasicPrinter();

  // ✅ Premium funciona bien con todo
  console.log("\n🖨️  Impresora Premium (todo funciona):");
  premium.print("Reporte Q4");
  premium.scan("Factura #123");
  premium.fax("Contrato", "+57-300-1234567");

  // ❌ Básica explota cuando intentas usar funciones que NO tiene
  console.log("\n🖨️  Impresora Básica (explota en funciones que no tiene):");
  basic.print("Reporte Q4"); // ✅ Esto sí funciona

  try {
    basic.scan("Factura #123"); // ❌ BOOM
  } catch (error) {
    console.log(`  💥 ${(error as Error).message}`);
  }

  try {
    basic.fax("Contrato", "+57-300-1234567"); // ❌ BOOM
  } catch (error) {
    console.log(`  💥 ${(error as Error).message}`);
  }

  try {
    basic.saveToCloud("Backup"); // ❌ BOOM
  } catch (error) {
    console.log(`  💥 ${(error as Error).message}`);
  }

  console.log("\n⚠️  PROBLEMAS DE VIOLAR ISP:");
  console.log("  ❌ BasicPrinter tiene 4 métodos que lanzan errores");
  console.log("  ❌ El código que usa MultiFunctionDevice necesita try/catch");
  console.log("  ❌ Cambios en fax() obligan a recompilar BasicPrinter");
  console.log("  ❌ La interface miente: promete fax pero la básica no puede");
  console.log("  ❌ Imposible saber qué puede hacer cada impresora sin probar");
}

main();
