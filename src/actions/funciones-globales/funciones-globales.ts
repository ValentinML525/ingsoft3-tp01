export function generarSlug(text: string) {
	return text
		.toString()
		.toLowerCase()
		.normalize('NFD') // Elimina tildes o caracteres especiales
		.replace(/[\u0300-\u036f]/g, '') // Remueve marcas diacríticas
		.replace(/[^a-z0-9 ]/g, '') // Elimina caracteres especiales
		.trim()
		.replace(/\s+/g, '-'); // Reemplaza espacios por guiones
}

export function calcularCantidadNoches(fechaInicio: Date | string, fechaFin: Date | string) {
	const inicio = new Date(fechaInicio);
	const fin = new Date(fechaFin);
	const diffenMilisegundos = fin.getTime() - inicio.getTime();

	const noches = diffenMilisegundos / (1000 * 60 * 60 * 24);

	return Math.max(0, Math.floor(noches));
}

/**
 * Determina la categoría de anticipación y prioridad de una reserva.
 * Método con múltiples caminos de decisión agregado para validar el quality gate.
 */
export function prioridadDeReserva(diasAnticipacion: number): string {
	if (diasAnticipacion < 0) {
		return 'invalida';
	}
	if (diasAnticipacion <= 1) {
		return 'urgente';
	}
	if (diasAnticipacion <= 7) {
		return 'alta';
	}
	if (diasAnticipacion <= 30) {
		return 'media';
	}
	return 'baja';
}

/**
 * Categoriza una reserva según la duración de la estadía.
 */
export function clasificarTipoEstadia(noches: number): string {
	if (noches <= 0) {
		return 'invalida';
	}
	if (noches === 1) {
		return 'escapada';
	}
	if (noches <= 4) {
		return 'fin-de-semana';
	}
	if (noches <= 14) {
		return 'quincena';
	}
	return 'larga-estadia';
}


