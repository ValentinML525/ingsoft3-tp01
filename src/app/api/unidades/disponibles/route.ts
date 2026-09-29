import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoReserva } from '@prisma/client';
import { checkApiKey } from '@/lib/api-key';

/**
 * GET /api/unidades/disponibles
 * Query params: ubicacionId?, cantidadPersonas, fechaInicio, fechaFin, propiedadId?
 */
export async function GET(request: Request) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const url = new URL(request.url);
		const ubicacionId = Number(url.searchParams.get('ubicacionId') ?? '0');
		const propiedadId = url.searchParams.get('propiedadId')
			? Number(url.searchParams.get('propiedadId'))
			: undefined;
		const cantidadPersonas = Number(url.searchParams.get('cantidadPersonas') ?? '1');
		const fechaInicio = url.searchParams.get('fechaInicio');
		const fechaFin = url.searchParams.get('fechaFin');

		if (!fechaInicio || !fechaFin) {
			return NextResponse.json(
				{ error: 'fechaInicio y fechaFin son requeridos' },
				{ status: 400 }
			);
		}

		const whereBase: any = {
			capacidad: { gte: +cantidadPersonas },
			habilitada: true,
		};

		if (propiedadId) {
			whereBase.propiedadId = propiedadId;
		} else if (ubicacionId > 0) {
			whereBase.propiedad = { ubicacionId };
		}

		const unidadesPosibles = await prisma.unidad.findMany({
			where: whereBase,
			include: {
				imagenes: true,
				servicios: {
					include: {
						servicio: { select: { nombre: true, icon: true } },
					},
				},
				propiedad: {
					include: {
						ubicacion: { select: { ciudad: true } },
					},
				},
			},
		});

		// Filtrar por disponibilidad
		const disponibilidadChecks = await Promise.all(
			unidadesPosibles.map(async (unidad) => {
				const conflicto = await prisma.reserva.findFirst({
					where: {
						estado: { not: EstadoReserva.CANCELADA },
						unidadId: unidad.id,
						AND: [
							{ fechaInicio: { lt: new Date(fechaFin) } },
							{ fechaFin: { gt: new Date(fechaInicio) } },
						],
					},
				});
				return { ...unidad, disponible: !conflicto };
			})
		);

		const unidadesLibres = disponibilidadChecks.filter((u) => u.disponible);
		return NextResponse.json(unidadesLibres);
	} catch (error) {
		console.error('Error en GET /api/unidades/disponibles:', error);
		return NextResponse.json({ error: 'Error al obtener unidades disponibles' }, { status: 500 });
	}
}
