import { EmpleadoService } from './EmpleadoService';

console.log("--- Iniciando ejemplo de dependencia cíclica ---");

try {
  const empleadoService = new EmpleadoService();
  console.log(empleadoService.obtenerDatosEmpleado("1"));
  console.log(empleadoService.calcularSalarioTotal("1"));
} catch (error) {
  console.error("\n❌ ERROR DETECTADO:");
  console.error(error);
}
