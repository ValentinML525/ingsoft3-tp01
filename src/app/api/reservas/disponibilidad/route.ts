import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoReserva } from '@prisma/client';
import { checkApiKey } from '@/lib/api-key';

/**
 * GET /api/reservas/disponibilidad
 * Query params: unidadId, fechaInicio, fechaFin
 */
export async function GET(request: Request) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const url = new URL(request.url);
		const unidadId = Number(url.searchParams.get('unidadId'));
		const fechaInicio = url.searchParams.get('fechaInicio');
		const fechaFin = url.searchParams.get('fechaFin');

		if (!unidadId || !fechaInicio || !fechaFin) {
			return NextResponse.json(
				{ error: 'unidadId, fechaInicio y fechaFin son requeridos' },
				{ status: 400 }
			);
		}

		const unidad = await prisma.unidad.findUnique({ where: { id: unidadId } });

		if (!unidad || !unidad.habilitada) {
			return NextResponse.json({ disponible: false });
		}

		const reservaEnConflicto = await prisma.reserva.findFirst({
			where: {
				estado: { not: EstadoReserva.CANCELADA },
				unidadId: unidadId,
				AND: [
					{ fechaInicio: { lt: new Date(fechaFin) } },
					{ fechaFin: { gt: new Date(fechaInicio) } },
				],
			},
		});

		return NextResponse.json({ disponible: !reservaEnConflicto });
	} catch (error) {
		console.error('Error en GET /api/reservas/disponibilidad:', error);
		return NextResponse.json({ error: 'Error al verificar disponibilidad' }, { status: 500 });
	}
}
