import { EmpleadoServiceInfo } from './EmpleadoServiceInfo';
import { NominaService } from './NominaService';
import { EmpleadoService } from './EmpleadoService';

console.log("--- Iniciando ejemplo de dependencia cíclica ---");

try {
  const empleadoServiceInfo = new EmpleadoServiceInfo();
  const nominaService = new NominaService(empleadoServiceInfo);
  const empleadoService = new EmpleadoService(nominaService);
  console.log(empleadoService.calcularSalarioTotal("1"));
} catch (error) {
  console.error("\n❌ ERROR DETECTADO:");
  console.error(error);
}
