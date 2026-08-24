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
