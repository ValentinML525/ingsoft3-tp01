import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkApiKey } from '@/lib/api-key';

/**
 * GET /api/ubicaciones/todas
 * Devuelve todas las ubicaciones almacenadas en la BD.
 */
export async function GET(request: Request) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const ubicaciones = await prisma.ubicacion.findMany({});
		return NextResponse.json(ubicaciones);
	} catch (error) {
		console.error('Error en GET /api/ubicaciones/todas:', error);
		return NextResponse.json({ error: 'Error al obtener las ubicaciones' }, { status: 500 });
	}
}
