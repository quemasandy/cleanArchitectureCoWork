import { IEmpleadoInfo, NominaService } from './NominaService';

export class EmpleadoService {
  constructor(
    private nominaService: NominaService,
    private empleadoInfo: IEmpleadoInfo
  ) {}

  public obtenerDatosEmpleado(id: string): string {
    return this.empleadoInfo.obtenerDatosEmpleado(id);
  }

  public calcularSalarioTotal(id: string): number {
    return this.nominaService.obtenerSalarioBase(id) + 1000;
  }
}
