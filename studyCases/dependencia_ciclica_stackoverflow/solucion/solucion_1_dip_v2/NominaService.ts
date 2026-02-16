export interface IEmpleadoInfo {
  obtenerDatosEmpleado(id: string): string;
}

export class NominaService {
  constructor(private empleadoInfo: IEmpleadoInfo) {}

  public obtenerSalarioBase(empleadoId: string): number {
    const datos = this.empleadoInfo.obtenerDatosEmpleado(empleadoId);
    if (datos) {
      return 2000;
    }
    return 0;
  }
}
