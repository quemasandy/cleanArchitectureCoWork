// Definimos un unico tipo global para representar a un usuario en todo el sistema.
export type User = {
  // El identificador unico del usuario, el cual es opcional porque no existe antes de persistirse en la base de datos.
  id?: string;
  // El nombre de usuario que es obligatorio para registrarse en el sistema.
  username: string;
  // El correo electronico del usuario.
  email: string;
  // La contrasena del usuario, la cual es opcional porque no debe devolverse cuando consultamos al usuario.
  password?: string;
  // La fecha de creacion del registro, la cual es opcional porque solo la base de datos la genera.
  createdAt?: Date;
  // Campo exclusivo del frontend para el estado de la interfaz de usuario, acoplado aqui de forma incorrecta.
  isSelectedInUi?: boolean;
};

// Definimos la clase del repositorio que simula el acceso a la base de datos.
export class UserRepository {
  // Metodo que guarda un usuario en la base de datos y retorna el usuario con su ID y fecha de creacion.
  async save(user: User): Promise<User> {
    // Retornamos un nuevo objeto simulando la persistencia en la base de datos.
    return {
      // Copiamos todas las propiedades recibidas en el objeto original.
      ...user,
      // Generamos un identificador unico simulado de la base de datos.
      id: "db-uuid-12345",
      // Generamos la fecha de creacion simulada de la base de datos.
      createdAt: new Date(),
    };
  }
}

// Definimos la clase del caso de uso para registrar a un nuevo usuario en la aplicacion.
export class RegisterUserUseCase {
  // El constructor recibe la instancia del repositorio de usuarios a traves de inyeccion de dependencias.
  constructor(private userRepository: UserRepository) {}

  // Metodo que ejecuta la logica de negocio para el registro de un usuario.
  async execute(input: User): Promise<User> {
    // Validamos que el nombre de usuario no este vacio antes de proceder con el registro.
    if (!input.username) {
      // Lanzamos un error si no se proporciona un nombre de usuario valido.
      throw new Error("Username is required");
    }
    // Guardamos el usuario llamando al repositorio y retornamos el resultado de la base de datos.
    return this.userRepository.save(input);
  }
}

// Definimos la clase del controlador que maneja la entrada de la API HTTP.
export class UserController {
  // El constructor recibe el caso de uso del registro de usuarios.
  constructor(private registerUseCase: RegisterUserUseCase) {}

  // Metodo que maneja la peticion simulando el procesamiento de una peticion HTTP.
  async handleRequest(reqBody: User): Promise<User> {
    // Delegamos la ejecucion directamente al caso de uso enviando todo el cuerpo de la peticion.
    const result = await this.registerUseCase.execute(reqBody);
    // Retornamos el resultado del registro el cual de forma incorrecta incluye la contrasena expuesta.
    return result;
  }
}
