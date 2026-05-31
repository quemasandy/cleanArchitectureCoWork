// --- CAPA DE PRESENTACION (FRONTEND / CONTROLADORES) ---

// Definimos la interfaz estricta para los datos que esperamos recibir en la peticion HTTP.
export interface RegisterRequestDto {
  // El nombre de usuario requerido por la API para iniciar el proceso de registro.
  username: string;
  // El correo electronico que debe ingresar obligatoriamente el usuario.
  email: string;
  // La contrasena en texto plano enviada por el cliente de forma obligatoria.
  password: string;
}

// Definimos la interfaz estricta para los datos seguros que el controlador respondera al cliente de la API.
export interface RegisterResponseDto {
  // El identificador unico creado para el usuario, expuesto como texto.
  id: string;
  // El nombre del usuario registrado exitosamente.
  username: string;
  // El correo electronico del usuario registrado.
  email: string;
  // La fecha en que el registro se creo efectivamente en el sistema.
  createdAt: Date;
}

// --- CAPA DE DOMINIO (REGLAS DE NEGOCIO PURAS) ---

// Definimos la clase de la Entidad de Dominio que representa el modelo conceptual de negocio.
export class User {
  // El constructor inicializa las propiedades esenciales que definen a un usuario valido para el negocio.
  constructor(
    // El identificador unico de negocio que siempre debe existir en un usuario existente.
    public readonly id: string,
    // El nombre del usuario validado e inmutable para las reglas de negocio.
    public readonly username: string,
    // El correo electronico validado e inmutable para las reglas de negocio.
    public readonly email: string,
    // La fecha de creacion de este usuario en el dominio.
    public readonly createdAt: Date
  ) {}
}

// --- CAPA DE INFRAESTRUCTURA (BASE DE DATOS / PERSISTENCIA) ---

// Definimos la interfaz que describe como se almacena un registro de usuario en la base de datos fisica.
export interface UserDbModel {
  // La llave primaria en la base de datos relacional o no relacional.
  _id: string;
  // El nombre de usuario almacenado en la columna o propiedad de la base de datos.
  db_username: string;
  // El correo electronico almacenado en la columna o propiedad de la base de datos.
  db_email: string;
  // El hash de la contrasena encriptada almacenada de forma segura para evitar filtraciones.
  password_hash: string;
  // La fecha en que la base de datos persistio por primera vez el registro.
  created_at: Date;
}

// --- CAPA DE APLICACION (CASOS DE USO) ---

// Definimos el Caso de Uso para el registro de usuarios que orquesta la logica y el flujo del negocio.
export class RegisterUserUseCase {
  // El constructor recibe un repositorio simulado tipado con interfaces de dominio para inyeccion de dependencias.
  constructor(
    // Definimos el contrato del repositorio que maneja entidades de dominio y el hash de contrasena.
    private readonly userRepo: { save: (user: User, passwordHash: string) => Promise<User> }
  ) {}

  // Metodo que ejecuta el caso de uso a partir del DTO recibido de la capa de presentacion.
  async execute(dto: RegisterRequestDto): Promise<User> {
    // Validamos que el nombre de usuario cumpla con los requisitos minimos del negocio.
    if (dto.username.length < 3) {
      // Lanzamos un error de negocio si no cumple con la regla de validacion.
      throw new Error("Username must be at least 3 characters long");
    }
    // Generamos un identificador unico de dominio usando un generador simulado.
    const uniqueId = "domain-uuid-" + Math.random().toString(36).substring(2, 9);
    // Generamos un hash simulado para no almacenar la contrasena en texto plano.
    const dummyHash = "hashed-" + dto.password;
    // Instanciamos la entidad de negocio pura asegurando que se cumplan las reglas.
    const newUser = new User(
      // Pasamos el identificador unico de negocio generado al constructor.
      uniqueId,
      // Pasamos el nombre de usuario al constructor de la entidad.
      dto.username,
      // Pasamos el correo electronico validado al constructor.
      dto.email,
      // Establecemos la fecha de creacion actual en el dominio.
      new Date()
    );
    // Guardamos la entidad en el repositorio pasando el hash de seguridad y retornamos el resultado.
    return this.userRepo.save(newUser, dummyHash);
  }
}

// --- CAPA DE PRESENTACION (CONTROLADOR) ---

// Definimos el controlador que se encarga de recibir, delegar y formatear la respuesta HTTP.
export class UserController {
  // El constructor inyecta el caso de uso del registro de usuarios para interactuar con la aplicacion.
  constructor(private readonly registerUseCase: RegisterUserUseCase) {}

  // Manejador del request HTTP simulado que procesa los datos entrantes estrictamente tipados.
  async handleRequest(reqBody: RegisterRequestDto): Promise<RegisterResponseDto> {
    // Invocamos la ejecucion del caso de uso enviando los datos de la peticion.
    const userDomain = await this.registerUseCase.execute(reqBody);
    // Mapeamos explicitamente la entidad de dominio a un DTO de respuesta seguro para el cliente.
    const responseDto: RegisterResponseDto = {
      // Asignamos el identificador unico de la entidad de dominio a la respuesta.
      id: userDomain.id,
      // Asignamos el nombre de usuario de la entidad de dominio a la respuesta.
      username: userDomain.username,
      // Asignamos el correo electronico de la entidad de dominio a la respuesta.
      email: userDomain.email,
      // Asignamos la fecha de creacion de la entidad de dominio a la respuesta.
      createdAt: userDomain.createdAt,
    };
    // Retornamos el objeto DTO completamente limpio de datos sensibles de vuelta al cliente.
    return responseDto;
  }
}
