export interface DatosRegistroUsuario {
	name?: string;
	email?: string;
	password?: string;
}

export interface ResultadoValidacionRegistro {
	esValido: boolean;
	errores: string[];
}

/**
 * Validador de formulario de registro de usuario (Lógica pura de Frontend)
 */
export function validarDatosRegistro(datos: DatosRegistroUsuario): ResultadoValidacionRegistro {
	const errores: string[] = [];

	if (!datos.name || datos.name.trim().length < 2) {
		errores.push('El nombre debe tener al menos 2 caracteres');
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!datos.email || !emailRegex.test(datos.email.trim())) {
		errores.push('El email ingresado no es válido');
	}

	if (!datos.password || datos.password.length < 6) {
		errores.push('La contraseña debe tener al menos 6 caracteres');
	}

	return {
		esValido: errores.length === 0,
		errores,
	};
}
