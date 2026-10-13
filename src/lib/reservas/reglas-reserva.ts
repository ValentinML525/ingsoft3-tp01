import { EstadoReserva } from '@prisma/client';

export interface ParametrosEstadoReserva {
	pagoParcial: number;
	precioTotal: number;
	estadoActual?: EstadoReserva | string;
}

/**
 * Regla 1: Determina el estado de una reserva en base a sus pagos y estado previo.
 */
export function determinarEstadoReserva({
	pagoParcial,
	precioTotal,
	estadoActual,
}: ParametrosEstadoReserva): EstadoReserva {
	if (estadoActual === EstadoReserva.CANCELADA) {
		return EstadoReserva.CANCELADA;
	}

	if (pagoParcial < 0) {
		throw new Error('El pago parcial no puede ser negativo');
	}

	if (precioTotal <= 0) {
		throw new Error('El precio total debe ser mayor a 0');
	}

	if (pagoParcial > precioTotal) {
		throw new Error('El pago parcial no puede exceder el precio total');
	}

	if (pagoParcial === 0) {
		return EstadoReserva.PENDIENTE;
	}

	if (pagoParcial > 0 && pagoParcial < precioTotal) {
		return EstadoReserva.PAGO_PARCIAL;
	}

	return EstadoReserva.PAGADA;
}

export interface ResultadoValidacionFechas {
	esValida: boolean;
	noches: number;
	error?: string;
}

/**
 * Regla 2: Valida el rango de fechas de una reserva y calcula la cantidad de noches.
 */
export function validarFechasReserva(
	fechaInicio: Date | string,
	fechaFin: Date | string
): ResultadoValidacionFechas {
	const inicio = new Date(fechaInicio);
	const fin = new Date(fechaFin);

	if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
		return { esValida: false, noches: 0, error: 'Las fechas ingresadas son inválidas' };
	}

	if (fin.getTime() <= inicio.getTime()) {
		return {
			esValida: false,
			noches: 0,
			error: 'La fecha de fin debe ser posterior a la fecha de inicio',
		};
	}

	const diffMilis = fin.getTime() - inicio.getTime();
	const noches = Math.floor(diffMilis / (1000 * 60 * 60 * 24));

	if (noches < 1) {
		return {
			esValida: false,
			noches: 0,
			error: 'La reserva debe ser de al menos 1 noche',
		};
	}

	return { esValida: true, noches };
}

export interface ResultadoValidacionCapacidad {
	esValida: boolean;
	error?: string;
}

/**
 * Regla 3: Valida que la cantidad de personas sea compatible con la capacidad de la unidad.
 */
export function validarCapacidadUnidad(
	cantidadPersonas: number,
	capacidadMaxima: number
): ResultadoValidacionCapacidad {
	if (!Number.isInteger(cantidadPersonas) || cantidadPersonas <= 0) {
		return {
			esValida: false,
			error: 'La cantidad de personas debe ser un número entero positivo',
		};
	}

	if (capacidadMaxima <= 0) {
		return {
			esValida: false,
			error: 'La capacidad máxima de la unidad debe ser mayor a 0',
		};
	}

	if (cantidadPersonas > capacidadMaxima) {
		return {
			esValida: false,
			error: `La cantidad de personas (${cantidadPersonas}) excede la capacidad máxima (${capacidadMaxima})`,
		};
	}

	return { esValida: true };
}

/**
 * Regla 4: Detecta solapamiento cronológico entre dos reservas de la misma unidad.
 */
export function hayConflictoFechas(
	reservaA: { inicio: Date; fin: Date },
	reservaB: { inicio: Date; fin: Date }
): boolean {
	return (
		reservaA.inicio.getTime() < reservaB.fin.getTime() &&
		reservaA.fin.getTime() > reservaB.inicio.getTime()
	);
}

export interface NuevaReservaDTO {
	unidadId: number;
	clienteId: number;
	fechaInicio: string | Date;
	fechaFin: string | Date;
	cantidadPersonas: number;
	capacidadMaxima: number;
	precioTotal: number;
	pagoParcial?: number;
}

export interface IReservaRepository {
	buscarConflicto(unidadId: number, inicio: Date, fin: Date): Promise<boolean>;
	crearReserva(datos: any): Promise<any>;
}

/**
 * Servicio de Negocio de Reservas diseñado con Inyección de Dependencias para permitir Mocks.
 */
export class ServicioReservas {
	constructor(private readonly repo: IReservaRepository) {}

	async registrarReserva(datos: NuevaReservaDTO): Promise<any> {
		const valFechas = validarFechasReserva(datos.fechaInicio, datos.fechaFin);
		if (!valFechas.esValida) {
			throw new Error(valFechas.error);
		}

		const valCapacidad = validarCapacidadUnidad(
			datos.cantidadPersonas,
			datos.capacidadMaxima
		);
		if (!valCapacidad.esValida) {
			throw new Error(valCapacidad.error);
		}

		const inicio = new Date(datos.fechaInicio);
		const fin = new Date(datos.fechaFin);
		const tieneConflicto = await this.repo.buscarConflicto(datos.unidadId, inicio, fin);
		if (tieneConflicto) {
			throw new Error('Existe una reserva en conflicto para las fechas seleccionadas');
		}

		const estado = determinarEstadoReserva({
			pagoParcial: datos.pagoParcial ?? 0,
			precioTotal: datos.precioTotal,
		});

		return await this.repo.crearReserva({
			unidadId: datos.unidadId,
			clienteId: datos.clienteId,
			fechaInicio: inicio,
			fechaFin: fin,
			cantidadPersonas: datos.cantidadPersonas,
			precioTotal: datos.precioTotal,
			pagoParcial: datos.pagoParcial ?? 0,
			estado,
			noches: valFechas.noches,
		});
	}
}
