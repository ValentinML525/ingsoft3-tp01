import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EstadoReserva } from '@prisma/client';
import { checkApiKey } from '@/lib/api-key';

/**
 * GET /api/reservas/calendario
 * Query params: year, usuarioId
 */
export async function GET(request: Request) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const url = new URL(request.url);
		const year = Number(url.searchParams.get('year') ?? new Date().getFullYear());
		const usuarioId = url.searchParams.get('usuarioId');

		if (!usuarioId) {
			return NextResponse.json({ error: 'usuarioId es requerido' }, { status: 400 });
		}

		const fechaInicio = new Date(`${year - 1}-12-01T00:00:00.000Z`);
		const fechaFin = new Date(`${year + 1}-01-10T23:59:59.999Z`);

		const reservas = await prisma.reserva.findMany({
			where: {
				unidad: {
					propiedad: { usuarioId },
				},
				fechaInicio: { gte: fechaInicio },
				fechaFin: { lte: fechaFin },
				estado: { not: EstadoReserva.CANCELADA },
			},
			include: {
				cliente: {
					select: { nombre: true, telefono: true, email: true },
				},
				unidad: {
					select: {
						id: true,
						nombre: true,
						propiedadId: true,
						propiedad: { select: { nombre: true } },
					},
				},
			},
		});

		return NextResponse.json(reservas);
	} catch (error) {
		console.error('Error en GET /api/reservas/calendario:', error);
		return NextResponse.json({ error: 'Error al obtener el calendario' }, { status: 500 });
	}
}
