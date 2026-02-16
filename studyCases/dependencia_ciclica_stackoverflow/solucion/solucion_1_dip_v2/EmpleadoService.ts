import { NominaService } from './NominaService';

export class EmpleadoService {
  constructor(private nominaService: NominaService) {}

  public calcularSalarioTotal(id: string): number {
    return this.nominaService.obtenerSalarioBase(id) + 1000;
  }
}
