import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkApiKey } from '@/lib/api-key';

/**
 * GET /api/reservas/reportes
 * Query params: year, propiedadId, usuarioId
 */
export async function GET(request: Request) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const url = new URL(request.url);
		const year = Number(url.searchParams.get('year') ?? new Date().getFullYear());
		const propiedadId = url.searchParams.get('propiedadId')
			? Number(url.searchParams.get('propiedadId'))
			: undefined;
		const usuarioId = url.searchParams.get('usuarioId') ?? undefined;

		const reservas = await prisma.reserva.findMany({
			where: {
				unidad: {
					propiedad: {
						...(propiedadId ? { id: propiedadId } : {}),
						...(usuarioId ? { usuarioId } : {}),
					},
				},
				fechaInicio: { gte: new Date(`${year}-01-01T00:00:00.000Z`) },
				fechaFin: { lt: new Date(`${year + 1}-01-01T00:00:00.000Z`) },
			},
			select: {
				estado: true,
				fechaInicio: true,
				pagoParcial: true,
				precioTotal: true,
			},
		});

		return NextResponse.json(reservas);
	} catch (error) {
		console.error('Error en GET /api/reservas/reportes:', error);
		return NextResponse.json({ error: 'Error al obtener reportes' }, { status: 500 });
	}
}
