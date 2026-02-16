import { IEmpleadoInfo } from './NominaService';

export class EmpleadoServiceInfo implements IEmpleadoInfo {
  public obtenerDatosEmpleado(id: string): string {
    return `Datos del empleado ${id} (Desde Implementación DIP)`;
  }
}
