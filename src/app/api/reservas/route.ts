import * as yup from 'yup';
import prisma from '../../../lib/prisma';
import { EstadoReserva } from '@prisma/client';
import { NextResponse, NextRequest } from 'next/server';
import { checkApiKey } from '@/lib/api-key';

interface OpcionesPaginacion {
	pagina?: number;
	take?: number;
}

const getReservasPaginadas = async ({
	pagina = 1,
	take = 5,
}: OpcionesPaginacion) => {
	if (isNaN(Number(pagina)) || pagina < 1) pagina = 1;

	try {
		const reservas = await prisma.reserva.findMany({
			take,
			skip: (pagina - 1) * take,
			include: {
				cliente: {
					select: {
						nombre: true,
						telefono: true,
						email: true,
					},
				},
			},
			orderBy: { fechaHoraCreacion: 'desc' },
		});

		const totalReservas = await prisma.reserva.count({});
		const cantidadPaginas = Math.ceil(totalReservas / take);

		return {
			paginaActual: pagina,
			cantidadPaginas: cantidadPaginas,
			totalReservas: totalReservas,
			reservas,
		};
	} catch (error) {
		throw new Error('No se pudo cargar las Reservas.');
	}
};

export async function GET(request: Request) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	const url = new URL(request.url);
	const parametros = url.searchParams;
	console.log('params:', parametros);

	const take = Number(parametros.get('take') ?? '5');
	const pagina = Number(parametros.get('pagina') ?? '1');
	const propiedadId = parametros.get('propiedadId') ? Number(parametros.get('propiedadId')) : undefined;
	const usuarioId = parametros.get('usuarioId') ?? undefined;

	if (isNaN(take)) {
		return NextResponse.json(
			{ message: 'Take debe ser un número' },
			{ status: 400 }
		);
	}

	if (isNaN(pagina)) {
		return NextResponse.json(
			{ message: 'Página debe ser un número' },
			{ status: 400 }
		);
	}

	// Modo filtrado por propiedad/usuario
	if (propiedadId || usuarioId) {
		try {
			const whereClause: any = {};
			if (propiedadId || usuarioId) {
				whereClause.unidad = {
					propiedad: {
						...(propiedadId ? { id: propiedadId } : {}),
						...(usuarioId ? { usuarioId } : {}),
					},
				};
			}

			const currentPagina = Math.max(1, isNaN(pagina) ? 1 : pagina);
			const reservas = await prisma.reserva.findMany({
				where: whereClause,
				take,
				skip: (currentPagina - 1) * take,
				include: {
					cliente: { select: { nombre: true, telefono: true, email: true } },
					unidad: { select: { nombre: true } },
				},
				orderBy: { fechaHoraCreacion: 'desc' },
			});
			const totalReservas = await prisma.reserva.count({ where: whereClause });
			const cantidadPaginas = Math.ceil(totalReservas / take);
			return NextResponse.json({
				reservas: { paginaActual: currentPagina, cantidadPaginas, totalReservas, reservas },
			});
		} catch (error) {
			return NextResponse.json({ error: 'Error al cargar las reservas' }, { status: 500 });
		}
	}

	try {
		const reservas = await getReservasPaginadas({ pagina, take });
		return NextResponse.json({ reservas });
	} catch (error) {
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		return NextResponse.json({ error: 'Ocurrió un error desconocido' }, { status: 400 });
	}
}

let postSchema = yup.object({
	fechaInicio: yup.string().datetime().required(),
	fechaFin: yup.string().datetime().required(),
	cantidadPersonas: yup.number().positive().integer().required(),
	precioTotal: yup.number().positive().required(),
	pagoParcial: yup.number().positive().optional(),
	unidadId: yup.number().integer().required(),
	clienteId: yup.number().integer().required(),
});

export async function POST(request: Request) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const body = await request.json();

		// Si viene con datos de cliente embebidos, crear cliente + reserva en transacción
		if (body.cliente) {
			const { cliente, reserva: reservaData } = body;

			const disponibilidadCheck = await verificarDisponibilidad({
				unidadId: reservaData.unidadId,
				fechaInicio: reservaData.fechaInicio,
				fechaFin: reservaData.fechaFin,
			});

			if (!disponibilidadCheck) {
				return NextResponse.json(
					{ mensaj: 'Existe otra reserva registrada para las fechas y unidad seleccionadas.' },
					{ status: 400 }
				);
			}

			const pagoParcial = reservaData.pagoParcial ?? 0;
			const precioTotal = reservaData.precioTotal ?? 0;
			const estadoCalculado = reservaData.estado
				? reservaData.estado
				: pagoParcial > 0 && precioTotal > 0 && pagoParcial < precioTotal
				? EstadoReserva.PAGO_PARCIAL
				: pagoParcial > 0 && pagoParcial === precioTotal
				? EstadoReserva.PAGADA
				: EstadoReserva.PENDIENTE;

			const result = await prisma.$transaction(async (tx) => {
				const clienteCreado = await tx.cliente.create({ data: cliente });
				const reservaCreada = await tx.reserva.create({
					data: {
						...reservaData,
						clienteId: clienteCreado.id,
						estado: estadoCalculado,
					},
				});
				return reservaCreada;
			});

			return NextResponse.json(result);
		}

		// Flujo original con clienteId existente
		const reservaValidada = await postSchema.validate(body, { abortEarly: false });

		if (await verificarDisponibilidad(reservaValidada)) {
			const reservaCreada = await prisma.reserva.create({ data: reservaValidada });
			return NextResponse.json(reservaCreada);
		} else {
			return NextResponse.json(
				{ mensaj: 'Existe otra reserva registrada para las fechas y unidad seleccionadas.' },
				{ status: 400 }
			);
		}
	} catch (error: any) {
		return NextResponse.json(error?.errors || error, { status: 400 });
	}
}

/**
 * PATCH /api/reservas — Actualiza una reserva (actualizar pagos o cancelar)
 * Body: { id, pagoParcial?, precioTotal?, estado?, cliente? }
 */
export async function PATCH(request: Request) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const body = await request.json();
		const { id, estado, pagoParcial, precioTotal, cliente } = body;

		if (!id) {
			return NextResponse.json({ error: 'id es requerido' }, { status: 400 });
		}

		const result = await prisma.$transaction(async (tx) => {
			if (cliente?.id) {
				await tx.cliente.update({
					where: { id: cliente.id },
					data: {
						nombre: cliente.nombre,
						telefono: cliente.telefono,
						email: cliente.email,
					},
				});
			}

			const pago = pagoParcial ?? 0;
			const total = precioTotal ?? 0;
			const estadoCalculado =
				estado === EstadoReserva.CANCELADA
					? EstadoReserva.CANCELADA
					: pago > 0 && total > 0 && pago < total
					? EstadoReserva.PAGO_PARCIAL
					: pago > 0 && pago === total
					? EstadoReserva.PAGADA
					: estado;

			return tx.reserva.update({
				where: { id },
				data: {
					...(pagoParcial !== undefined && { pagoParcial }),
					...(precioTotal !== undefined && { precioTotal }),
					...(estadoCalculado && { estado: estadoCalculado }),
				},
			});
		});

		return NextResponse.json(result);
	} catch (error: any) {
		return NextResponse.json({ error: error?.message || 'Error al actualizar la reserva' }, { status: 400 });
	}
}

async function verificarDisponibilidad(reserva: any) {
	try {
		const reservaEnConflicto = await prisma.reserva.findFirst({
			where: {
				unidadId: reserva.unidadId,
				estado: { not: EstadoReserva.CANCELADA },
				AND: [
					{ unidadId: reserva.unidadId, fechaInicio: { lt: new Date(reserva.fechaFin) } },
					{ unidadId: reserva.unidadId, fechaFin: { gt: new Date(reserva.fechaInicio) } },
				],
			},
		});
		return reservaEnConflicto ? false : true;
	} catch (error) {
		console.error(error);
		return false;
	}
}
