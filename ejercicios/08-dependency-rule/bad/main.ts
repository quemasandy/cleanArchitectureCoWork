// ============================================================================
// ❌ MAL EJEMPLO: Violación de La Regla de Dependencia
// ============================================================================
// 📖 PRINCIPIO (Clean Architecture Cap. 22):
//    "Las dependencias del código fuente deben apuntar solo HACIA ADENTRO"
//
//    Capas (de afuera hacia adentro):
//    1. Frameworks & Drivers (Express, DynamoDB, Lambda)
//    2. Interface Adapters (Controllers, Repositories)
//    3. Use Cases (Application Business Rules)
//    4. Entities (Enterprise Business Rules)
//
// 🚨 PROBLEMA: El Use Case importa directamente AWS SDK y DynamoDB.
//    La lógica de negocio está CASADA con la infraestructura.
//    Si cambias de DynamoDB a PostgreSQL, debes reescribir el Use Case.
//
//    Las dependencias apuntan HACIA AFUERA (Use Case → Framework).
//    La Regla de Dependencia dice que deben apuntar HACIA ADENTRO.
// ============================================================================

// ❌ "Entity" que conoce detalles de DynamoDB
// Las entidades deberían ser puras, sin conocer frameworks
interface PaymentRecord {
  // ❌ Campos con nombres específicos de DynamoDB
  PK: string; // Partition Key de DynamoDB
  SK: string; // Sort Key de DynamoDB
  amount: number;
  currency: string;
  status: string;
  // ❌ Metadata específica de DynamoDB
  GSI1PK: string; // Global Secondary Index de DynamoDB
  TTL: number; // Time to Live de DynamoDB
}

// ❌ "Use Case" que importa y usa directamente AWS SDK y DynamoDB
// Esto VIOLA la Regla de Dependencia: Use Cases → Frameworks
class ProcessPaymentUseCase {
  processPayment(
    customerId: string,
    amount: number,
    currency: string
  ): void {
    console.log("\n  🔄 Procesando pago...");

    // ❌ VALIDACIÓN DE NEGOCIO mezclada con detalles de infraestructura
    if (amount <= 0) {
      throw new Error("El monto debe ser mayor a 0");
    }

    // ❌ El Use Case construye DIRECTAMENTE el formato de DynamoDB
    // Si cambias a PostgreSQL, debes reescribir TODO esto
    const record: PaymentRecord = {
      PK: `CUSTOMER#${customerId}`,           // ❌ Formato DynamoDB
      SK: `PAYMENT#${Date.now()}`,             // ❌ Formato DynamoDB
      amount,
      currency,
      status: "APPROVED",
      GSI1PK: `STATUS#APPROVED`,               // ❌ Índice de DynamoDB
      TTL: Math.floor(Date.now() / 1000) + 86400 * 365, // ❌ TTL de DynamoDB
    };

    // ❌ El Use Case LLAMA DIRECTAMENTE a DynamoDB
    // En producción esto sería: await dynamoClient.put(record)
    console.log("  💾 Guardando directamente en DynamoDB...");
    console.log(`     Table: payments-table`);
    console.log(`     PK: ${record.PK}`);
    console.log(`     SK: ${record.SK}`);
    console.log(`     GSI1PK: ${record.GSI1PK}`);

    // ❌ El Use Case también forma directamente la respuesta HTTP
    // Mezcla de lógica de negocio + formato de API Gateway
    const apiGatewayResponse = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // ❌ CORS en Use Case
      },
      body: JSON.stringify({
        message: "Payment processed",
        transactionId: record.SK,
        amount: record.amount,
      }),
    };

    console.log("  📤 Retornando respuesta de API Gateway...");
    console.log(`     Status: ${apiGatewayResponse.statusCode}`);
    console.log(`     Body: ${apiGatewayResponse.body}`);
  }
}

// ❌ "Controller" que es realmente un handler de Lambda con TODO dentro
function lambdaHandler(event: any): void {
  console.log("  ⚡ Lambda Handler recibió evento");

  // ❌ El handler parsea el body, valida, procesa Y responde
  // No hay separación de responsabilidades por capas
  const body = event.body;
  const useCase = new ProcessPaymentUseCase();
  useCase.processPayment(body.customerId, body.amount, body.currency);
}

// ============================================================================
// 🏃 EJECUCIÓN
// ============================================================================
function main(): void {
  console.log("❌ MAL EJEMPLO - Violación de la Regla de Dependencia");
  console.log("=".repeat(55));

  // Simulamos un evento de API Gateway
  const apiGatewayEvent = {
    body: {
      customerId: "CLI-001",
      amount: 150.0,
      currency: "USD",
    },
  };

  lambdaHandler(apiGatewayEvent);

  console.log("\n⚠️  PROBLEMAS:");
  console.log("  ❌ Use Case conoce DynamoDB (PK, SK, GSI, TTL)");
  console.log("  ❌ Use Case construye respuestas de API Gateway");
  console.log("  ❌ Use Case incluye headers CORS");
  console.log("  ❌ Para cambiar a PostgreSQL, reescribes TODO el Use Case");
  console.log("  ❌ No puedes testear la lógica sin simular DynamoDB");
  console.log("  ❌ Dependencias: Use Case → DynamoDB (HACIA AFUERA) ← VIOLACIÓN");
}

main();
