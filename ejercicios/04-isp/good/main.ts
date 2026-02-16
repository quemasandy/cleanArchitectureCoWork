// ============================================================================
// ✅ BUEN EJEMPLO: Aplicación del Principio de Segregación de Interfaces (ISP)
// ============================================================================
// 📖 PRINCIPIO: "No fuerces a los clientes a depender de interfaces
//    que no usan"
//    - Robert C. Martin, Clean Architecture Cap. 10
//
// ✅ SOLUCIÓN: En vez de UNA interface gorda, creamos interfaces
//    pequeñas y enfocadas. Cada dispositivo implementa SOLO
//    las interfaces que realmente puede cumplir.
//
//    Resultado: Nunca más throw new Error("no soportado").
//    El sistema de tipos de TypeScript te protege en compilación.
// ============================================================================

// ✅ Interface PEQUEÑA: solo capacidad de impresión básica
interface Printable {
  print(document: string): void;
}

// ✅ Interface PEQUEÑA: solo impresión duplex
interface DuplexPrintable {
  printDuplex(document: string): void;
}

// ✅ Interface PEQUEÑA: solo escaneo
interface Scannable {
  scan(document: string): string;
}

// ✅ Interface PEQUEÑA: solo envío de escaneo por email
interface EmailScannable {
  scanToEmail(document: string, email: string): void;
}

// ✅ Interface PEQUEÑA: solo fax
interface Faxable {
  fax(document: string, number: string): void;
}

// ✅ Interface PEQUEÑA: solo almacenamiento en la nube
interface CloudStorable {
  saveToCloud(document: string): string;
}

// ============================================================================
// ✅ Cada dispositivo implementa SOLO las interfaces que puede cumplir
// ============================================================================

// ✅ Impresora básica: solo imprime (y cumple al 100%)
class BasicPrinter implements Printable {
  // ✅ La ÚNICA responsabilidad que tiene es imprimir
  // No se le pide escanear, faxear, ni nada que no pueda hacer
  print(document: string): void {
    console.log(`  🖨️  Básica: Imprimiendo "${document}"`);
  }
}

// ✅ Impresora con escáner: imprime y escanea
class PrinterWithScanner implements Printable, Scannable {
  print(document: string): void {
    console.log(`  🖨️  Scanner: Imprimiendo "${document}"`);
  }

  scan(document: string): string {
    console.log(`  📸 Scanner: Escaneando "${document}"`);
    return `scan_${document}`;
  }
}

// ✅ Impresora premium: implementa TODO porque realmente puede
class PremiumPrinter
  implements Printable, DuplexPrintable, Scannable, EmailScannable, Faxable, CloudStorable {
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

// ============================================================================
// ✅ Las funciones solo piden lo que realmente necesitan
// ============================================================================

// ✅ Solo necesita imprimir - acepta CUALQUIER cosa que pueda imprimir
function printDocument(printer: Printable, doc: string): void {
  printer.print(doc);
}

// ✅ Solo necesita escanear - no le importa si también imprime
function scanDocument(scanner: Scannable, doc: string): string {
  return scanner.scan(doc);
}

// ✅ Solo necesita fax - acepta exactamente lo que necesita
function sendFax(faxMachine: Faxable, doc: string, number: string): void {
  faxMachine.fax(doc, number);
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("✅ BUEN EJEMPLO - Aplicación de ISP");
  console.log("=".repeat(50));

  const basic = new BasicPrinter();
  const withScanner = new PrinterWithScanner();
  const premium = new PremiumPrinter();

  // ✅ Todas las impresoras pueden imprimir
  console.log("\n📄 Imprimiendo con todas las impresoras:");
  printDocument(basic, "Memo");
  printDocument(withScanner, "Factura");
  printDocument(premium, "Contrato");

  // ✅ Solo las que tienen escáner pueden escanear
  console.log("\n📸 Escaneando (solo impresoras con escáner):");
  scanDocument(withScanner, "Recibo");
  scanDocument(premium, "Documento legal");
  // scanDocument(basic, "algo"); // ❌ TypeScript ERROR: BasicPrinter no es Scannable

  // ✅ Solo la premium puede enviar fax
  console.log("\n📠 Enviando fax (solo impresora premium):");
  sendFax(premium, "Contrato firmado", "+57-300-1234567");
  // sendFax(basic, "algo", "123"); // ❌ TypeScript ERROR: BasicPrinter no es Faxable

  // ✅ El compilador de TypeScript te PROTEGE
  // No puedes llamar funciones que un dispositivo no tiene
  console.log("\n🛡️  TypeScript te protege en COMPILACIÓN:");
  console.log("  ✅ basic.print() → permitido (implementa Printable)");
  console.log("  ❌ basic.scan() → ERROR de compilación (no implementa Scannable)");
  console.log("  ❌ basic.fax() → ERROR de compilación (no implementa Faxable)");

  console.log("\n🎯 BENEFICIOS DE ISP:");
  console.log("  ✅ Nunca más throw new Error('no soportado')");
  console.log("  ✅ TypeScript previene errores en COMPILACIÓN, no en runtime");
  console.log("  ✅ Cada device implementa SOLO lo que realmente puede hacer");
  console.log("  ✅ Las funciones piden el mínimo necesario para funcionar");
  console.log("  ✅ Cambios en Faxable no afectan a BasicPrinter");
}

main();
