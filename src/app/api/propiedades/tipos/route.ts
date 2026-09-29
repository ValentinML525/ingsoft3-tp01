import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkApiKey } from '@/lib/api-key';

/**
 * GET /api/propiedades/tipos
 * Devuelve todos los tipos de propiedad.
 */
export async function GET(request: Request) {
	const keyError = checkApiKey(request);
	if (keyError) return keyError;

	try {
		const tiposPropiedad = await prisma.tipoPropiedad.findMany({});
		return NextResponse.json(tiposPropiedad);
	} catch (error) {
		console.error('Error en GET /api/propiedades/tipos:', error);
		return NextResponse.json({ error: 'Error al obtener los tipos de propiedad' }, { status: 500 });
	}
}
